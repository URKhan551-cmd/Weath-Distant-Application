export function getDailyWeather(data){
    return data.days.map(day => ({  // here object has been return
        date: day.datetime,
        temprature: day.temp,
        maxTemprature: day.tempmax,
        minTemprature: day.tempmin,
        humidity: day.humidity,
        rainProbability: day.precipprob,
        windSpeed: day.windspeed,
        conditions: day.conditions,
        description: day.description,
        icon: day.icon,
        sunrise: day.sunrise,
        sunset: day.sunset,
        uvIndex: day.uvindex,
        feelsLike: day.feelslike,
    }));
};

// this func also return an  object
export function getAllHourlyData(data){
    return data.days.flatMap(day => 
        day.hours.map(hour => ({
            date: day.datetime,
            time: hour.datetime,
            temprature: hour.temp,
            feelsLike: hour.feelslike,
            humidity: hour.humidity,
            rainProbability: hour.precipprob,
            windSpeed: hour.windspeed,
            conditions: hour.conditions,
            icon: hour.icon,
            uvIndex: hour.uvindex,
            visibility: hour.visibility,
        }))
    );

}

export function get24HourWeather(data){
    const allHours = getAllHourlyData(data);
    const now = new Date();
    const hoursWithDate = allHours.map(hour => ({     //this will retuen an object 
        ...hour,
        dateTime: new Date(`${hour.date}T ${hour.time}`),
    }));

    const sorted = hoursWithDate.sort((a, b) => a.dateTime - b.dateTime);
    const currentIndex = sorted.findIndex(hour => hour.dateTime >= now);

    if(currentIndex === -1) {
        return {
            previous24Hour: sorted.slice(-24),
            next24Hour: []
        };
    }

    return {
        previous24Hour: sorted.slice(Math.max(0, currentIndex - 24), currentIndex),
        next24Hour: sorted.slice(currentIndex, currentIndex + 24),
    }
}


export function getWeatherEmoji(icon){
    // here map is an object of icons with key value pairs
    const map = {
    "clear-day":           "☀️",
    "clear-night":         "🌙",
    "cloudy":              "☁️",
    "fog":                 "🌫️",
    "partly-cloudy-day":   "⛅",
    "partly-cloudy-night": "🌤",
    "rain":                "🌧️",
    "showers-day":         "🌦️",
    "showers-night":       "🌧️",
    "sleet":               "🌨️",
    "snow":                "❄️",
    "snow-showers-day":    "🌨️",
    "thunder":             "⛈️",
    "thunder-rain":        "⛈️",
    "thunder-showers-day": "⛈️",
    "wind":                "💨",
    };


    return map[icon] || "🌡️" ;
}




// format of date "2026-08-23" -> "Today" / "Tomorrow" / "Sat, 23 Aug"

export function formatDate(dateStr) { 
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if(date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "tomorrow";

    return date.toLocaleDateString("en-AE", {
        weekday: "short", 
        month: "short", 
        day: "numeric",
    })
}

export function formatTime(timeStr) {
    const [h, m] = timeStr.split(":");  // this will return an arr we destruccture it
    const hour = parseInt(h, 10);
    const suffix = hour >=12 ? "pm" : "am";
    const display = hour % 12 || 12;
    return `${display}:${m} ${suffix}`;
}

export function formatShortDate(dateStr) { 
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AE", {
        month: "short",
        day: "numeric",
    })
}