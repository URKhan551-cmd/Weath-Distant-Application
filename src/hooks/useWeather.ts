import {useState, useCallback} from "react";

import {apiResponse, apiResponseByCoords} from "../Api/apiResponse.js";

// get actual response type of the data coming frm an api
type WeatherData = Awaited<ReturnType<typeof apiResponse>>;
type WeatherCoordsData = Awaited<ReturnType<typeof apiResponseByCoords>>;

interface Coordinates {
    lat: number;
    lon: number;
}

type LastLocation = { type: "city"; value: string; } | { type: "coords"; value: Coordinates; } | null;



export function useWeather(){
    const [data, setData] = useState<WeatherData | WeatherCoordsData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>(null);
    const [lastLocation, setLastLocation] = useState<LastLocation>(null);

    const fetchByCity = useCallback( async (city: string): Promise<void> => {
        const target = city.trim();
        if(!target) {setError("Please enter a city name."); return;}

        setLoading(true);
        setError(null);

        try{
            const result = await apiResponse(target);
            setData(result);
            setLastLocation({
                type: "city",
                value: target,
            });
        } catch(err: unknown){
            setError(err.instanceof Error ? err.message : "something went wrong. Please try Again.");
            setData(null);

        }finally{
            setLoading(false);
        }
    }, []);

    const fetchByCoords = useCallback(async ({lat, lon}: Coordinates): Promise<void> => {
        setLoading(true);
        setError(null);

        try{
            const result = await apiResponseByCoords(lat, lon);
            setData(result);
            setLastLocation({
                type: "coords",
                value: {
                    lat, lon,
                },
            });
        } catch (err: unknown){
            setError(err.instanceof Error ? err.message : "Could not fetch weather for your location.");
            setData(null);
        }finally{
            setLoading(false);
        };

    }, []);

    const refresh = useCallback(async (): Promise<void> => {
        if (!lastLocation) return;
        if (lastLocation.type === "coords") {
            await fetchByCoords(lastLocation.value);
        
        } else {
            await fetchByCity(lastLocation.value);
        }

    }, [lastLocation, fetchByCity, fetchByCoords]);

    return {
        data, loading, error, lastLocation, fetchByCity, fetchByCoords, refresh,
    };
}