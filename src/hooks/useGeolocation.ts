import {useState, useCallback} from "react";

// all possible state the geolocation can be in
export const  GEO_STATUS = {
    IDLE: "idle",
    LOADING: "loading",
    SUCCESS: "success",
    DENIED: "denied",
    UNAVAILABLE: "unavailable",
    TIMEOUT: "timeout",
};

type GeoStatus = "idle" | "loading" | "success" | "denied" | "unavailable" | "timeout";

export interface Coordinates {
    lat: number;
    lon: number;
}
export function useGeolocation(){
    const [status, setStatus] = useState<GeoStatus>("idle");
    const [coords, setCoords] = useState<Coordinates | null>(null); // {lat, lon};
    const [error, setError] = useState<string | null>(null);

    const geoLocation = useCallback((): void => {
        // browser does not suppport geolocaton
        if (!navigator.geolocation) {
            setStatus(GEO_STATUS.UNAVAILABLE);
            setError("Your browder does not support geolocation");
            return;
        }

        // if we got some data then we will do this
        setStatus(GEO_STATUS.LOADING);
        setError(null);
        setCoords(null);

        navigator.geolocation.getCurrentPosition(
            // success k bad
            (position: GeolocationPosition): void => {
                setCoords({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setStatus(GEO_STATUS.SUCCESS);

            },

            (err: GeolocationPositionError): void => {
                switch (err.code) {
                    case GeolocationPositionError.PERMISSION_DENIED:
                        setStatus(GEO_STATUS.DENIED);
                        setError("Location access was denied. Enable it in your browser settings or search manually.");
                        break;
                    case GeolocationPositionError.POSITION_UNAVAILABLE:
                        setStatus(GEO_STATUS.UNAVAILABLE);
                        setError("Location unavaiable. try searching manully.");
                        break;
                    case GeolocationPositionError.TIMEOUT:
                        setStatus(GEO_STATUS.TIMEOUT);
                        setError("Location request time out.try Again");
                        break;
                    default:
                        setStatus(GEO_STATUS.UNAVAILABLE);
                        setError("Could not get your location. try searching manually.");
                }
            },
            // options 
            {
                enableHighAccuracy: true,
                timeout: 10000, // 10 seconds
                maximumAge: 300000, // cached upto 5 min of position
            }
        );
    }, []);

    const reset = useCallback((): void => {
        setStatus(GEO_STATUS.IDLE);
        setCoords(null);
        setError(null);
    }, []);

    return {status, coords, error, geoLocation, reset}
}