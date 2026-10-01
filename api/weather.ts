// api/weather.ts — Vercel Serverless Function
//
// PURPOSE:
//   Proxy for Visual Crossing Weather API.
//   The browser calls GET /api/weather?location=Dubai
//   This function adds the secret API key and forwards to Visual Crossing.
//   The key NEVER reaches the browser.
//
// SECURITY LAYERS applied in order:
//   1. CORS  — only your domain can call this
//   2. Method check — only GET allowed
//   3. Rate limit — 50 requests/hour per IP (basic)
//   4. Input sanitization — clean the location string
//   5. Response caching — saves API quota
//   6. Security headers — on every response


import type {VercelRequest, VercelResponse} from "@vercel/node";
import {
    checkRateLimit,
    getClientIp,
    getCorsHeaders,
    sanitizeLocation,
    SECURITY_HEADERS,
    RATE_LIMIT_BASIC,
}  from "../src/lib/security.ts";

const BASE = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/service/timeline";

// helper attach all security headers to every response
function applyHeaders(res: VercelResponse, origin: string | undefined, extra: Record<string, string> = {}): void {
    const cors = getCorsHeaders(origin);
    Object.entries({...SECURITY_HEADERS, ...cors, ...extra}).forEach(([k, v]) => res.setHeader(k, v));
}

export default async function handler(req: VercelRequest, res: VercelResponse){
    const origin = req.headers["origin"] as string | undefined;

    // handle cors preflight
    // browser send options before the real request to check the permisison
    if(req.method === "OPTIONS"){
        applyHeaders(res, origin);
        return res.status(200).end();
    }

    // method guard
    if(req.method !== "GET"){
        applyHeaders(res, origin);
        return res.status(405).json({error: "Method not allowed"});
    }

    // rate Limiting
    // 50 request per hour per IP
    const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>);

    const rLimit = checkRateLimit(ip, {...RATE_LIMIT_BASIC, store: "weather"});

    // always tell the clinet how many request they have left
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

    // input Sanitization
    // never truest  query parameter - clean them before use\
    const rawLocation = req.query.location;
    const location = sanitizeLocation(
        Array.isArray(rawLocation) ? rawLocation[0] : rawLocation
    );

    if(!location){
        return res.status(400).json({error: "Location is required and msut be valid string."});
    }

    // API KEY GUARD
    // key lives in vercel environment variables- never in code.
    const key = process.env.WEATHER_KEY;
    if(!key){
        return res.status(500).json({error: "Server Configuration error."});
    }

    // fetch from visua; crossing.
    try {
        const url = `${BASE}/${encodeURIComponent(location)}?unitGroup=metric&key=${key}&contentType=json`;
        const upstream = await fetch(url);

        if(!upstream.ok){
           if(upstream.status === 400){
            return res.status(400).json({error: `Location "${location}" not found.`});

           }

           if(upstream.status === 401){
            return res.status(502).json({error: "Weather service authentication failed."});
           }

           if(upstream.status === 429){
            return res.status(429).json({error: "Weather service quote exceeded. try again later."});
           }

           return res.status(502).json({error: "Weather service error (${upstream.status})"});
        }
        const data = await upstream.json();

        // cache the response 
        // s maxage=600 vercel cdn cache is for 10 min
        // stale-while-revalidation=60 server stale while fetching freshg
        // this dramatically reduce api calls and speeds up the app

        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=60");
        return res.status(200).json(data);

    } catch(err: unknown){
        const message = err instanceof Error ? err.message : "Unknown error";
        return res.status(503).json({error: "Failed to reach weather service.", detail: message});
    }

}