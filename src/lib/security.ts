interface RateLimitEntry { count: number; resetTime: number; }
const stores: Record<string, Map<string, RateLimitEntry>> = {};

function getStore(name: string): Map<string, RateLimitEntry> {
  if(!stores[name]) stores[name] = new Map();
  return stores[name];
}

// LAZY cleanup - runs only when a request comes in, not with setInterval
function cleanupStore(store: Map<string, RateLimitEntry>) {
  const now = Date.now();
  if (store.size > 1000) { // only cleanup if big to save CPU
    for (const [ip, entry] of store.entries()) {
      if (now > entry.resetTime) store.delete(ip);
    }
  }
}

export interface RateLimitConfig { store: string; maxRequests: number; windowMs: number; }
export const RATE_LIMIT_BASIC: RateLimitConfig = { store: "basic", maxRequests: 50, windowMs: 60 * 60 * 1000 };
export const RATE_LIMIT_STRICT: RateLimitConfig = { store: "strict", maxRequests: 20, windowMs: 60 * 60 * 1000 };

export interface RateLimitResult { allowed: boolean; remaining: number; resetIn: number; }

export function checkRateLimit(ip: string, config: RateLimitConfig): RateLimitResult {
  const store = getStore(config.store);
  cleanupStore(store);
  const now = Date.now();
  const entry = store.get(ip);

  if(!entry || now > entry.resetTime){
    store.set(ip, {count: 1, resetTime: now + config.windowMs});
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: Math.ceil(config.windowMs / 1000) };
  }

  if(entry.count >= config.maxRequests){
    return { allowed: false, remaining: 0, resetIn: Math.ceil((entry.resetTime - now) / 1000) };
  }
  entry.count += 1;
  store.set(ip, entry);
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: Math.ceil((entry.resetTime - now) / 1000) };
}

export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers["x-forwarded-for"];
  if(Array.isArray(forwarded)) return forwarded[0].split(",")[0].trim();
  if(typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return headers["x-real-ip"] as string || "unknown";
}

const ALLOWED_ORIGINS: string[] = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
];

export function isAllowedOrigin(origin: string | undefined): boolean {
  if(!origin) return true; // allow same-origin requests which sometimes have no origin
  if (origin.startsWith("http://localhost:")) return true;
  return origin.endsWith(".vercel.app") || ALLOWED_ORIGINS.includes(origin);
}

export function getCorsHeaders(origin: string | undefined): Record<string, string> {
  const allowed = isAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed? (origin?? "*") : "",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function sanitizeLocation(input: unknown): string | null {
  if(typeof input!== "string") return null;
  const cleaned = input.replace(/<[^>]*>/g, "").replace(/\0/g, "").trim().slice(0, 100);
  if(cleaned.length < 1) return null;
  return cleaned;
}

export function sanitizeMessages(input: unknown): Array<{role: string; content: string}> | null {
  if(!Array.isArray(input)) return null;
  if(input.length > 50) return null;
  const messages = input.map(m => {
    if(typeof m!== "object" || m === null) return null;
    const msg = m as Record<string, unknown>;
    if(msg.role!== "user" && msg.role!== "model") return null;
    if(typeof msg.content!== "string") return null;
    return { role: msg.role as string, content: msg.content.replace(/<[^>]*>/g, "").replace(/\0/g, "").slice(0, 2000) };
  });
  if(messages.some(m => m === null)) return null;
  return messages as Array<{role: string; content: string}>;
}

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

