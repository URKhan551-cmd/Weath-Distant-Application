// api/health.ts — Health Check Endpoint
//
// PURPOSE:
//   GET /api/health → tells you if the server is running and keys are set
//   Used by:
//     - Vercel deployment verification
//     - Your own monitoring
//     - Debugging "is the API working?" questions
//
// SAFE: returns true/false for key presence — never exposes the actual keys

import type {VercelRequest, VercelResponse} from "@vercel/node";
import {SECURITY_HEADERS} from "../src/lib/security.ts";

export default function handler(req: VercelRequest, res: VercelResponse) {
    Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        region: process.env.VERCEL_REGION ?? "unknown",
        keys: {
            weather: !!process.env.WEATHER_KEY,
            gemini: !!process.env.GEMINI_KEY,
        },
    });
}