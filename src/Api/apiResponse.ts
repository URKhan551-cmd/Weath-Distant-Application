

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

    console.log("Handle 1:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
    });
    // if the response is ok this block will not run 
    if (!response.ok) {

        let message = `Request failed (${response.status})`;

        try {
            const errorData = await response.json() as {
                error?: string;
            };

            console.log("Handle Error data:", errorData);

            if (errorData.error) {
                message = errorData.error;
            }

        } catch {
            console.log("Could not parse Error JSON");
        }

        if (response.status === 400) {
            message = `"${label}" not found. Check the spelling and try again.`;
        }
        throw new Error(message);
    }

    console.log("HANDLE 2: ABOUT TO PARSE JSON");
    
    console.log("HANDLE 2:", {
    status: response.status,
    contentType: response.headers.get("content-type"),
    contentLength: response.headers.get("content-length")
    });

    try {
        // for debugging just
        const raw = await response.clone().text();
        console.log("Handle Raw Body text: ", raw)
        const data = await response.json() as WeatherApiResponse;
        console.log("Handle 3 succesfullt parsed JSON: ", data);
        return data;
    } catch (error) {
        console.error("Handle 4 reposnde not PARSED JSON: ", error)
        throw error;
    }

} 


// const BASE: string = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";




export async function apiResponse(location: string): Promise<WeatherApiResponse>{
     if(!location.trim()){
        throw new Error("Please enter a city name.");
     }

    let url = `/api/weather?location=${encodeURIComponent(location.trim())}`;

    console.log("Client 1 calling:", url);
        // call vercel proxy serverles functinn
     const response = await fetch(url)
     console.log("Client 2 response :", response);
     console.log("Client 3 status: ", response.status);
     console.log("Client 4 OK :", response.ok);
    // const key = getKey();
    // const url = `${BASE}/${encodeURIComponent(location)}` + `?unitGroup=metric` + `&key=${key}` + `&contentType=json`;
    // const response = await fetch(url);

    const data = await handleResponse(response, location);
    console.log("Client 5 parsed weather dtaa: ", data);
    //    const data = await response.json();
    // console.log(data);
    return data;

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



