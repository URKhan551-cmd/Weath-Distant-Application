// // api/weather.ts — Vercel Serverless Function
// //
// // PURPOSE:
// //   Proxy for Visual Crossing Weather API.
// //   The browser calls GET /api/weather?location=Dubai
// //   This function adds the secret API key and forwards to Visual Crossing.
// //   The key NEVER reaches the browser.
// //
// // SECURITY LAYERS applied in order:
// //   1. CORS  — only your domain can call this
// //   2. Method check — only GET allowed
// //   3. Rate limit — 50 requests/hour per IP (basic)
// //   4. Input sanitization — clean the location string
// //   5. Response caching — saves API quota
// //   6. Security headers — on every response


// api/weather.ts — Vercel Serverless Function
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  checkRateLimit,
  getClientIp,
  getCorsHeaders,
  sanitizeLocation,
  SECURITY_HEADERS,
  RATE_LIMIT_BASIC,
} from "../src/lib/security.js"; // <- NO.ts

const BASE = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

// CHANGED 1: Normalize common UAE city names before sending them to Visual Crossing.
// This helps prevent ambiguous results such as Dubai being resolved to Kenya.
function normalizeUaeLocation(location: string): string {
  const normalized = location
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ");

  const uaeCities: Record<string, string> = {
    dubai: "Dubai, United Arab Emirates",
    "dubai uae": "Dubai, United Arab Emirates",
    "dubai united arab emirates": "Dubai, United Arab Emirates",

    "abu dhabi": "Abu Dhabi, United Arab Emirates",
    "abu dhabi uae": "Abu Dhabi, United Arab Emirates",
    "abu dhabi united arab emirates": "Abu Dhabi, United Arab Emirates",

    sharjah: "Sharjah, United Arab Emirates",
    "sharjah uae": "Sharjah, United Arab Emirates",
    "sharjah united arab emirates": "Sharjah, United Arab Emirates",

    ajman: "Ajman, United Arab Emirates",
    "ajman uae": "Ajman, United Arab Emirates",

    "ras al khaimah": "Ras Al Khaimah, United Arab Emirates",
    fujairah: "Fujairah, United Arab Emirates",
    "umm al quwain": "Umm Al Quwain, United Arab Emirates",
    "al ain": "Al Ain, United Arab Emirates",

    };

  // CHANGED: Use a canonical UAE name for recognized cities.
  // Keep other valid locations unchanged.
  return uaeCities[normalized] ?? location.trim();
}


function applyHeaders(res: VercelResponse, origin: string | undefined, extra: Record<string, string> = {}): void {
  const cors = getCorsHeaders(origin);
  Object.entries({...SECURITY_HEADERS,...cors,...extra}).forEach(([k, v]) => res.setHeader(k, v));
}

export default async function handler(req: VercelRequest, res: VercelResponse){
  const origin = req.headers["origin"] as string | undefined;

  if(req.method === "OPTIONS"){
    applyHeaders(res, origin);
    return res.status(200).end();
  }

  if(req.method!== "GET"){
    applyHeaders(res, origin);
    return res.status(405).json({error: "Method not allowed"});
  }

  const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>);
  const rLimit = checkRateLimit(ip, {...RATE_LIMIT_BASIC, store: "weather"});

  applyHeaders(res, origin, {
    "X-RateLimit-Limit": "50",
    "X-RateLimit-Remaining": String(rLimit.remaining),
    "X-RateLimit-Reset": String(rLimit.resetIn),
  });

  if(!rLimit.allowed){
    return res.status(429).json({
      error: "Too many request. Please wait before trying again",
      resetIn: rLimit.resetIn,
    });
  }

  const rawLocation = req.query.location;
  const location = sanitizeLocation(
    Array.isArray(rawLocation)? rawLocation[0] : rawLocation
  );

  if(!location){
    return res.status(400).json({error: "Location is required and must be valid string."});
  }

// CHANGED 2: Normalize the sanitized city before constructing the API URL.
  const location = normalizeUaeLocation(sanitizedLocation);

  const key = process.env.WEATHER_API_KEY?.trim().replace(/^["']|["']$/g, '');

  if(!key){
    console.error("WEATHER_API_KEY missing");
    return res.status(500).json({error: "Server Configuration error."});
  }

  try {
    // CHANGED 3
    const encodeLocation = encodeURIComponent(location) 
    const params = new URLSearchParams({
      unitGroup: "metric",
      key,
      contentType: "json",
    });

     const url = `${BASE}/${encodedLocation}?${params.toString()}`;

    // CHANGED 4: Log the final location to help diagnose incorrect geocoding.
    console.log("Weather request location:", location);   
    const upstream = await fetch(url);
    const upstreamBody = await upstream.text();

    if(!upstream.ok){
      if(upstream.status === 400) return res.status(400).json({error: `Location "${location}" not found.`});
      if(upstream.status === 401) return res.status(502).json({error: "Weather service authentication failed."});
      if(upstream.status === 429) return res.status(429).json({error: "Weather service quota exceeded. try again later."});
      return res.status(502).json({error: `Weather service error (${upstream.status})`});
    }

    let data;
    try {
      data = JSON.parse(upstreamBody);
    } catch {
      return res.status(502).json({ error: "Invalid response from weather service." });
    }

    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=60");
    return res.status(200).json(data);
    } catch(err: unknown){
    const message = err instanceof Error? err.message : "Unknown error";
    console.error("Upstream fetch failed:", message);
    return res.status(503).json({error: "Failed to reach weather service.", detail: message});
  }
}


// import type {VercelRequest, VercelResponse} from "@vercel/node";
// import {
//     checkRateLimit,
//     getClientIp,
//     getCorsHeaders,
//     sanitizeLocation,
//     SECURITY_HEADERS,
//     RATE_LIMIT_BASIC,
// }  from "../src/lib/security.ts";

// const BASE = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

// // helper attach all security headers to every response
// function applyHeaders(res: VercelResponse, origin: string | undefined, extra: Record<string, string> = {}): void {
//     const cors = getCorsHeaders(origin);
//     Object.entries({...SECURITY_HEADERS, ...cors, ...extra}).forEach(([k, v]) => res.setHeader(k, v));
// }

// export default async function handler(req: VercelRequest, res: VercelResponse){
//     const origin = req.headers["origin"] as string | undefined;

//     // handle cors preflight
//     // browser send options before the real request to check the permisison
//     if(req.method === "OPTIONS"){
//         applyHeaders(res, origin);
//         return res.status(200).end();
//     }

//     // method guard
//     if(req.method !== "GET"){
//         applyHeaders(res, origin);
//         return res.status(405).json({error: "Method not allowed"});
//     }

//     // rate Limiting
//     // 50 request per hour per IP
//     const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>);

//     const rLimit = checkRateLimit(ip, {...RATE_LIMIT_BASIC, store: "weather"});

//     // always tell the clinet how many request they have left
//     applyHeaders(res, origin, {
//         "X-RateLimit-Limit": "50",
//         "X-RateLimit-Remaining": String(rLimit.remaining),
//         "X-RateLimit-Reset": String(rLimit.resetIn),
//     });

//     if(!rLimit.allowed){
//         return res.status(429).json({
//             error: "Too many request. Please wait before trying again",
//             resetIn: rLimit.resetIn,
//         });
//     }

//     // input Sanitization
//     // never truest  query parameter - clean them before use\
//     const rawLocation = req.query.location;
//     const location = sanitizeLocation(
//         Array.isArray(rawLocation) ? rawLocation[0] : rawLocation
//     );

//     if(!location){
//         return res.status(400).json({error: "Location is required and msut be valid string."});
//     }

//     // API KEY GUARD
//     // key lives in vercel environment variables- never in code.
//     const key = process.env.WEATHER_API_KEY;

     
//     console.log("Weather key exists:", Boolean(key));
// console.log("Weather key length:", key?.length ?? 0);
//     console.log("Weather key has surrounding whitespace:", key !== key?.trim());

//     console.log("Key starts with quote:", /^["']/.test(key ?? ""));
// console.log("Key ends with quote:", /["']$/.test(key ?? ""));

//      const fingerprint = key
//   ? await crypto.subtle.digest(
//       "SHA-256",
//       new TextEncoder().encode(key)
//     )
//   : null;

// console.log(
//   "WEATHER_API_KEY fingerprint:",
//   fingerprint
//     ? Array.from(new Uint8Array(fingerprint))
//         .slice(0, 6)
//         .map((byte) => byte.toString(16).padStart(2, "0"))
//         .join("")
//     : "MISSING"
// );

//     if(!key){
//         return res.status(500).json({error: "Server Configuration error."});
//     }

//     // fetch from visua; crossing.
//     try {
//         const url = `${BASE}/${encodeURIComponent(location)}`+`?unitGroup=metric&key=${encodeURIComponent(key)}`+`&contentType=json`;

//         console.log(
//   "SERVER: Visual Crossing URL:",
//   url.replace(key, "***")
// );

//         const upstream = await fetch(url);
   
//         const upstreamBody = await upstream.text();

// console.log("Visual Crossing status:", upstream.status);
         
//         if(!upstream.ok){

// console.log("Visual Crossing error body:", upstreamBody);

//            if(upstream.status === 400){
//             return res.status(400).json({error: `Location "${location}" not found.`});

//            }

//            if(upstream.status === 401){
//             return res.status(502).json({error: "Weather service authentication failed."});
//            }

//            if(upstream.status === 429){
//             return res.status(429).json({error: "Weather service quote exceeded. try again later."});
//            }

           
           
//            return res.status(502).json({error: `Weather service error (${upstream.status})`});
//         }

//         let data;
//         try {
//             data = JSON.parse(upstreamBody);
//         } catch(err: unknown){
//             console.error("Failed to parse Visual Crossing JSON:", err); 
//             return res.status(502).json({ error: "Invalid response from weather service.", });
//         }
//         // const data = await upstream.json();
//         console.log("SERVER: Visual Crossing data received");
        
//         console.log("SERVER: Visula crossing data", data);
//         // cache the response 
//         // s maxage=600 vercel cdn cache is for 10 min
//         // stale-while-revalidation=60 server stale while fetching freshg
//         // this dramatically reduce api calls and speeds up the app

//         res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=60");
//         return res.status(200).json(data);

//     } catch(err: unknown){
//         const message = err instanceof Error ? err.message : "Unknown error";
//         return res.status(503).json({error: "Failed to reach weather service.", detail: message});
//     }

// }