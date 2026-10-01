import {useState, useCallback} from "react";
import {apiResponse} from "../Api/apiResponse.ts";
import {
    DESTINATION,
    scoreDestination,
    type Destination,
    type DestinationScore,
    type DestinationType,
} from "../utils/destination.ts";

// after fetching what we are going to store in destination
export interface DestinationWeather {
    dest: Destination;
    temp: number;
    feelsLike: number;
    conditions: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    precipProb: number;
    score: DestinationScore;
    loading: boolean;
    error: string | null;
}

export function useDestinations(){
    const [results, setResults] = useState<DestinationWeather[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetched, setFetched] = useState<boolean>(false);

    // fetch weather for filtered set of destination in parallel
    const fetchDestinations = useCallback( async (type: DestinationType | "all" = "all"): Promise<DestinationWeather[]> => {
         const targets = type === "all" ? DESTINATION : DESTINATION.filter((d) => d.type === type);

         setLoading(true);
         setFetched(false);

         //build placeholder rows immediately so UI shows loading states
        //  This isn't real weather.

         // It's temporary UI state.
         const placeholders: DestinationWeather[] = targets.map((dest) => ({
            dest,
            temp: 0, feelsLike: 0, conditions: "", icon: "",
            humidity: 0, windSpeed: 0, uvIndex: 0, precipProb: 0,
            score: {id: dest.id, score: 0, reasons: [], warnings: []},
            loading: true,
            error: null,

         }));
         // real result replace this placeholder.
         setResults(placeholders);


        //  fetchAll in parallel - Promise.allSettled so one failure does not kill all fetch data
        const settled = await Promise.allSettled(
            targets.map(dest => apiResponse(dest.city))
        );

        const final: DestinationWeather[] = targets.map((dest, i) => {
            const result = settled[i];

            if(result.status === "rejected"){
                return {
                    ...placeholders[i],
                    loading: false,
                    error: "Failed to load",
                };
            }

            const d = result.value;
            const cc = d.currentConditions as {
                temp: number; feelslike: number; conditions: string; icon: string;
                humidity: number; windspeed: number; uvindex: number; precipprob: number;
            };

            const score = scoreDestination(
                dest,
                cc.temp,
                cc.uvindex,
                cc.windspeed,
                cc.precipprob,
            );
            
            return {
                dest,
                temp: cc.temp,
                feelsLike: cc.feelslike,
                conditions: cc.conditions,
                icon: cc.icon,
                humidity: cc.humidity,
                windSpeed: cc.windspeed,
                uvIndex: cc.uvindex,
                precipProb: cc.precipprob,
                score,
                loading: false,
                error: null,
            };
        });

        // sort by score descending - best first which has high score
        final.sort((a, b) => b.score.score - a.score.score);
        setResults(final);
        setLoading(false);
        setFetched(true); 

        return final;
    }, []);

    // fetch  only two specific destination for side by side comparison
    const fetchComparison = useCallback( async (
        cityA: string,
        cityB: string
    ): Promise<[DestinationWeather | null, DestinationWeather | null]> => {
        const makeEntry = async (city:string): Promise<DestinationWeather | null> => {
            try{
                const d = await apiResponse(city);
                const cc = d.currentConditions as {
                    temp: number; feelslike: number; conditions: string; icon: string;
                    humidity: number; windspeed: number; uvindex: number; precipprob: number;
                };

                const fakeDest: Destination = {
                    id: city, name: city, country: "", emoji: "📍",
                    type: "city", lat: 0, lon: 0, city,
                    tags: [], description: "",
                };

                const score = scoreDestination(fakeDest, cc.temp, cc.uvindex, cc.windspeed, cc.precipprob);
                return {
                    dest: fakeDest, temp: cc.temp, feelsLike: cc.feelslike,
                    conditions: cc.conditions, icon: cc.icon, humidity: cc.humidity,
                    windSpeed: cc.windspeed, uvIndex: cc.uvindex, precipProb: cc.precipprob,
                    score, loading: false, error: null,
            };

        } catch {
            return null;
        }
        };
    
    const [a, b] = await Promise.all([makeEntry(cityA), makeEntry(cityB)]);
      return [a, b];

      },  []);

      return {results, loading, fetched, fetchDestinations, fetchComparison};
}