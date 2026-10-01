// api/weather-coords.ts — Vercel Serverless Function
//
// PURPOSE:
//   Same as weather.ts but accepts ?lat=25.2&lon=55.3 instead of a city name.
//   Used by Phase 2 geolocation feature.
//
// SECURITY LAYERS:
//   Same as weather.ts — CORS, method, rate limit, input validation, caching
//   Extra: validates that lat/lon are real numbers within valid ranges.

import type {VercelRequest, VercelResponse} from "@vercel/node";
import {
    checkRateLimit,
    getClientIp,
    getCorsHeaders,\
    SECURITY_HEADERS,
    RATE_LIMIT_BASIC,
} from "../src/lib/security.ts";

const BASE = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

function applyHeaders(res:  VercelResponse, origin: string | undefined, extra: Record<string, string> = {}): void {
    const cors = getCorsHeaders(origin);
    Object.entries({...SECURITY_HEADERS, ...cors, ...extra}).forEach(([k, v]) => res.setHeaders(k, v));
}


// validate coordinate value
// lat must be -90 to 90, lon must be -180 to 180
function parseCoord(value: unknown, min: number, max: number): number | null {
    const n = Number(value);
    if(isNaN(n) || n < min || n > max) return null;

    // round to 4 decimal places prevent injection through long dcimal
    return Math.round(n * 10000) / 10000;
}


export default async function handler(req: VercelRequest, res: VercelResponse){
    const origin = req.headers["origin"] as string | undefined;

    if(req.method === "OPTIONS"){
        applyHeaders(res, origin);
        return res.status(204).end();
    }

    if(req.method !== "GET"){
        applyHeaders(res, origin);
        return res.status(405).json({error: "METHOD not allowed"});
    }

    const ip = getClientIp(req.headers as Record<string, string | string[] | undefined>);
    const rLimit = checkRateLimit(ip, {...RATE_LIMIT_BASIC, store: "weather-coords"});


    applyHeaders(res, origin, {
        "X-RateLimit-Limit": "50",
        "X-RateLimit-Remaining": String(rLimit.remaining),
        "X-RateLimit-Reset": String(rLimit.resetIn),
    });

    if(!rLimit.allowed){
        return res.status(429).json({
            error: "Too many requests.",
            resetIn: rLimit.resetIn,
        })
    }

    // validate coordinates
    const lat = parseCoord(req.query.lat, -90, 90);
    const lon = parseCoord(req.query.lon, -180, 180);

    if(lat === null || lon === null){
        return res.status(400).json({
            error: "Valid lat (-90 to 90) and lon (-180 to 180) are required.",
        });
    }

    const key = process.env.WEATHER_KEY;
    if(!key) return res.status(500).json({error: "Server configuration error."});

    try {
       const location = `${lat},${lon}`;
       const url = `${BASE}/${encodeURIComponent(location)}?unitGroup=metric&key=${key}&contentType=json`;

       const upstream = await fetch(url);

       if(!upstream.ok){
        if(upstream.status === 400) return res.status(400).json({error: "Coordinates not found."});
        return res.status(502).json({error: "Weather service error (${upstream.status})"});

       }

       const data = await upstream.json();
       res.setHeaders("Cache-Control", "s-maxage=600, stale-while-revalidate=60");
       return res.status(200).json(data);

    } catch (err: unknown){
        const message = err instanceof Error ? err.message : "Unknown error";
        return res.status(503).json({error: "Failed to reach weather service.", detail: message});
    }
}