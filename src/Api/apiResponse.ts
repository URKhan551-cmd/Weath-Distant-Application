export interface WeatherApiResponse {
    address: string;
    resolvedAddress: string;
    timezone: string;
    description: string;
    days: WeatherDay[];
}


const BASE: string = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
// funcion to make sure we have the API key which has been there in .env or not.
// if nnot then throw error that simple a barrier not to go further.
function getKey(): string {
    const key = import.meta.env.VITE_WEATHER_API_KEY;
    if(!key) throw new Error("API key is missing. ADD VITE_WEATHER_API_KEY to your .env file.");
    return key;
}

async function handleResponse(response: Response, label: string): Promise<WeatherApiResponse> {
    if (!response.ok) {
        if (response.status === 400) throw new Error(`"${label}" not found. Check the spelling and try again.`);
        if (response.status === 401) throw new Error("Invalid API key. Check your .env  and try again.");
        if (response.status === 429) throw new Error("too many requests. wait a moment and try again.");

        throw new Error(`Request Failed (${response.status}): ${response.statusText}`);
    }
    return (await response.json()) as WeatherApiResponse;

    }

    





export async function apiResponse(location: string): Promise<WeatherApiResponse>{

    const key = getKey();
    const url = `${BASE}/${encodeURIComponent(location)}` + `?unitGroup=metric` + `&key=${key}` + `&contentType=json`;
    const response = await fetch(url);

    return handleResponse(response, location);
    //    const data = await response.json();
    // console.log(data);
    //    return data;

    

};

// SEARCH by Coordinates  gogle map api call  (latitude, longitude) those will give us the exact location where we are on the spot
export async function apiResponseByCoords(lat: number, lon: number): promise<WeatherApiResponse>{
    const key = getKey();
    const location = `${lat}, ${lon}`
    const url = `${BASE}/${encodeURIComponent(location)}` + `?unitGroup=metric` + `&key=${key}` + `&contentType=json`;
    const response = await fetch(url);
    return handleResponse(response, `${lat}, ${lon}`);
}


