import { useState, useCallback } from "react";
 
export type GeoStatus = "idle" | "loading" | "success" | "denied" | "unavailable" | "timeout";
 
export const GEO_STATUS = {
  IDLE:        "idle"        as const,
  LOADING:     "loading"     as const,
  SUCCESS:     "success"     as const,
  DENIED:      "denied"      as const,
  UNAVAILABLE: "unavailable" as const,
  TIMEOUT:     "timeout"     as const,
};
 
export interface Coordinates {
  lat: number;
  lon: number;
}
 
export function useGeolocation() {
  const [status,   setStatus]   = useState<GeoStatus>("idle");
  const [coords,   setCoords]   = useState<Coordinates | null>(null);
  // ✅ single field — returned in the object so TypeScript sees it as "used"
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
 
  const geoLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      setErrorMsg("Your browser does not support geolocation.");
      return;
    }
 
    setStatus("loading");
    setErrorMsg(null);
    setCoords(null);
 
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setStatus("success");
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setStatus("denied");
            setErrorMsg("Location access denied. Enable it in browser settings or search manually.");
            break;
          case err.POSITION_UNAVAILABLE:
            setStatus("unavailable");
            setErrorMsg("Location unavailable. Try searching manually.");
            break;
          case err.TIMEOUT:
            setStatus("timeout");
            setErrorMsg("Location timed out. Try again.");
            break;
          default:
            setStatus("unavailable");
            setErrorMsg("Could not get location. Try searching manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);
 
  const reset = useCallback(() => {
    setStatus("idle");
    setCoords(null);
    setErrorMsg(null);
  }, []);
 
  // ✅ errorMsg is in the return object — TypeScript sees it as used
  return { status, coords, errorMsg, geoLocation, reset };
}
 