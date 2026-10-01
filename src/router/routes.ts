// one place to define all routes change here will updates evrywhere

export const ROUTES = {
    home: "/",
    weather: "/weather",
    daily: "/weather/daily",
    hourly: "/weather/hourly",
    map: "/weather/map",
    explore: "/weather/explore",
    ai: "/weather/ai",
    saved: "/weather/saved",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];