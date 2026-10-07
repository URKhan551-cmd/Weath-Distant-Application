

// interface WeatherDay {
//     sunrise: string;
//     sunset: string;
// }

export interface WeatherApiResponse {
    address: string;
    resolvedAddress: string;
    timezone: string;
    description: string;

    currentConditions: {
    datetime:    string;
    temp:        number;
    feelslike:   number;
    humidity:    number;
    dew:         number;
    precip:      number | null;
    precipprob:  number;
    windspeed:   number;
    windgust:    number | null;
    winddir:     number;
    pressure:    number;
    visibility:  number;
    cloudcover:  number;
    solarenergy: number;
    uvindex:     number;
    conditions:  string;
    icon:        string;
    sunrise:     string;
    sunset:      string;
  };
    days: Array<{
    datetime:    string;
    temp:        number;
    tempmax:     number;
    tempmin:     number;
    feelslike:   number;
    humidity:    number;
    precipprob:  number;
    windspeed:   number;
    conditions:  string;
    description: string;
    icon:        string;
    sunrise:     string;
    sunset:      string;
    uvindex:     number;
    hours: Array<{
      datetime:   string;
      temp:       number;
      feelslike:  number;
      humidity:   number;
      precipprob: number;
      windspeed:  number;
      conditions: string;
      icon:       string;
      uvindex:    number;
      visibility: number;
    }>;
  }>;
}



// const BASE: string = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

// funcion to make sure we have the API key which has been there in .env or not.
// if nnot then throw error that simple a barrier not to go further.

// function getKey(): string {
//     const key = import.meta.env.VITE_WEATHER_API_KEY;
//     if(!key) throw new Error("API key is missing. ADD VITE_WEATHER_API_KEY to your .env file.");
//     return key;
// }

async function handleResponse(response: Response, label: string): Promise<WeatherApiResponse> {
    if (!response.ok) {
        // if (response.status === 400) throw new Error(`"${label}" not found. Check the spelling and try again.`);
        // if (response.status === 401) throw new Error("Invalid API key. Check your .env  and try again.");
        // if (response.status === 429) throw new Error("too many requests. wait a moment and try again.");

        // throw new Error(`Request Failed (${response.status}): ${response.statusText}`);
        let message = `Request failed (${response.status})`;

        try {
            const errorData = (await response.json()) as {
                error?: string;
            };
            if(errorData.error){
                message = errorData.error;
            }
        } catch {
            //  ignore json parsing failure
        }

        if(response.status === 400){
            message = `"${label}" not found. check the spelling and try again.`;
        }
        throw new Error(message);
    }
    return (await response.json()) as WeatherApiResponse;

    }

    


// const BASE: string = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
// // funcion to make sure we have the API key which has been there in .env or not.
// // if nnot then throw error that simple a barrier not to go further.
// function getKey(): string {
//     const key = import.meta.env.VITE_WEATHER_API_KEY;
//     if(!key) throw new Error("API key is missing. ADD VITE_WEATHER_API_KEY to your .env file.");
//     return key;
// }

// async function handleResponse(response: Response, label: string): Promise<WeatherApiResponse> {
//     if (!response.ok) {
//         if (response.status === 400) throw new Error(`"${label}" not found. Check the spelling and try again.`);
//         if (response.status === 401) throw new Error("Invalid API key. Check your .env  and try again.");
//         if (response.status === 429) throw new Error("too many requests. wait a moment and try again.");

//         throw new Error(`Request Failed (${response.status}): ${response.statusText}`);
//     }
//     return (await response.json()) as WeatherApiResponse;

//     }   




export async function apiResponse(location: string): Promise<WeatherApiResponse>{
     if(!location.trim()){
        throw new Error("Please enter a city name.");
     }

     // call vercel proxy serverles functinn
     const response = await fetch(`/api/weather?location=${encodeURIComponent(location.trim())}`
    );
    // const key = getKey();
    // const url = `${BASE}/${encodeURIComponent(location)}` + `?unitGroup=metric` + `&key=${key}` + `&contentType=json`;
    // const response = await fetch(url);

    return handleResponse(response, location);
    //    const data = await response.json();
    // console.log(data);
    //    return data;

};

// SEARCH by Coordinates  gogle map api call  (latitude, longitude) those will give us the exact location where we are on the spot
export async function apiResponseByCoords(lat: number, lon: number): Promise<WeatherApiResponse>{
    // const key = getKey();
    // const location = `${lat}, ${lon}`
    // const url = `${BASE}/${encodeURIComponent(location)}` + `?unitGroup=metric` + `&key=${key}` + `&contentType=json`;
    
    // call our vercel proxy 
    const response = await fetch(`/api/weatherCoords?lat=${lat}&lon=${lon}`);

    return handleResponse(response, `${lat}, ${lon}`);
}


// export async function apiResponse(location: string): Promise<WeatherApiResponse>{

//     const key = getKey();
//     const url = `${BASE}/${encodeURIComponent(location)}` + `?unitGroup=metric` + `&key=${key}` + `&contentType=json`;
//     const response = await fetch(url);

//     return handleResponse(response, location);
//     //    const data = await response.json();
//     // console.log(data);
//     //    return data;

    

// };

// // SEARCH by Coordinates  gogle map api call  (latitude, longitude) those will give us the exact location where we are on the spot
// export async function apiResponseByCoords(lat: number, lon: number): Promise<WeatherApiResponse>{
//     const key = getKey();
//     const location = `${lat}, ${lon}`
//     const url = `${BASE}/${encodeURIComponent(location)}` + `?unitGroup=metric` + `&key=${key}` + `&contentType=json`;
//     const response = await fetch(url);
//     return handleResponse(response, `${lat}, ${lon}`);
// }



