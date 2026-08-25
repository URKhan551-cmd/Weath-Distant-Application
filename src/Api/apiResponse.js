export async function apiResponse(location){
    const key = import.meta.env.VITE_WEATHER_API_KEY;
    // throw error here
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${key}&contentType=json`);
    if (!response.ok) {
        if (response.status === 400) throw new Error(`City "${location}" not found. Check the Spelling and try againg.`);
        if (response.status === 401) throw new Error("Invalid Api Key, Check your .env file");
        if (response.status === 429) throw new Error("Too Many requests, Please wait for a moment and try again");
        throw new Error(`Request failed (${response.status}): ${response.statusText}`);
    }
       const data = await response.json();
    console.log(data);
       return data;

    

};


// {queryCost: 1, latitude: 25.2631, longitude: 55.2972, resolvedAddress: 'dubai', address: 'dubai', …}
// address
// :
// "dubai"
// alerts
// :
// Array(0)
// length
// :
// 0
// [[Prototype]]
// :
// Array(0)
// currentConditions
// :
// cloudcover
// :
// 5
// conditions
// :
// "Clear"
// datetime
// :
// "17:30:00"
// datetimeEpoch
// :
// 1787491800
// dew
// :
// 22
// feelslike
// :
// 45.8
// humidity
// :
// 35.9
// icon
// :
// "clear-day"
// moonphase
// :
// 0.34
// precip
// :
// null
// precipprob
// :
// 0
// preciptype
// :
// null
// pressure
// :
// 999
// snow
// :
// 0
// snowdepth
// :
// 0
// solarenergy
// :
// 1.6
// solarradiation
// :
// 431
// source
// :
// "obs"
// stations
// :
// (3) ['OMSJ', 'OMDW', 'OMDB']
// sunrise
// :
// "05:55:48"
// sunriseEpoch
// :
// 1787450148
// sunset
// :
// "18:46:59"
// sunsetEpoch
// :
// 1787496419
// temp
// :
// 39.9
// uvindex
// :
// 4
// visibility
// :
// 10
// winddir
// :
// 320
// windgust
// :
// null
// windspeed
// :
// 25.8



// days array
// days
// :
// Array(15)
// 0
// :
// cloudcover
// :
// 32.2
// conditions
// :
// "Partially cloudy"
// datetime
// :
// "2026-08-23"
// datetimeEpoch
// :
// 1787428800
// description
// :
// "Partly cloudy throughout the day."
// dew
// :
// 20
// feelslike
// :
// 42.4
// feelslikemax
// :
// 47
// feelslikemin
// :
// 38.5

// humidity
// :
// 37.4
// icon
// :
// "partly-cloudy-day"
// moonphase
// :
// 0.34
// precip
// :
// 0
// precipcover
// :
// 0
// precipprob
// :
// 0
// preciptype
// :
// null
// pressure
// :
// 1000.2
// severerisk
// :
// 38
// snow
// :
// 0
// snowdepth
// :
// null
// solarenergy
// :
// 25.7
// solarradiation
// :
// 296.3


// // hours aray

// 0
// : 
// cloudcover
// : 
// 5
// conditions
// : 
// "Clear"
// datetime
// : 
// "00:00:00"
// datetimeEpoch
// : 
// 1787428800
// dew
// : 
// 23.9
// feelslike
// : 
// 44.3
// humidity
// : 
// 47.42
// icon
// : 
// "clear-night"
// precip
// : 
// 0
// precipprob
// : 
// 0
// preciptype
// : 
// null
// pressure
// : 
// 1000
// severerisk
// : 
// 5
// snow
// : 
// 0
// snowdepth
// : 
// null
// solarenergy
// : 
// 0
// solarradiation
// : 
// 0
// source
// : 
// "obs"
// stations
// : 
// (3) ['OMSJ', 'OMDW', 'OMDB']
// temp
// : 
// 36.9
// uvindex
// : 
// 0
// visibility
// : 
// 10
// winddir
// : 
// 140
// windgust
// : 
// 13
// windspeed
// : 
// 9.3