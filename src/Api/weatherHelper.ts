interface VisualCrossingHour {
    datetime: string;
    temp: number;
    feelslike: number;
    humidity: number;
    precipprob: number;
    windspeed: number;
    conditions: string;
    icon: string;
    uvindex: number;
    visibility: number; 
}

interface VisualCrossingDay {
    datetime: string;
    temp: number;
    tempmax: number;
    tempmin: number;
    humidity: number;
    precipprob: number;
    windspeed: number;
    conditions: string;
    description: string;
    icon: string;
    sunrise: string;
    sunset: string;
    uvindex: number;
    feelslike: number;
    hours: VisualCrossingHour[];
}

export interface VisualCrossingWeatherData {
    days: VisualCrossingDay[];
}


export interface DailyWeather {
    date: string;
    temperature: number;
    maxTemperature: number;
    minTemperature: number;
    humidity: number;
    rainProbability: number;
    windSpeed: number;
    conditions: string;
    description: string;
    icon: string;
    sunrise: string;
    sunset: string;
    uvIndex: number;
    feelsLike: number;
}

export interface HourlyWeather {
    date: string;
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  conditions: string;
  icon: string;
  uvIndex: number;
  visibility: number;
}

export interface HourlyWeatherWithDateTime extends HourlyWeather{
    dateTime: Date;
}

export interface TwentyFourHourWeather {
    previous24Hour: HourlyWeatherWithDateTime[];
    next24Hour: HourlyWeatherWithDateTime[];
}



export function getDailyWeather(data: VisualCrossingWeatherData): DailyWeather[] {
    return data.days.map(day => ({  // here object has been return
        date: day.datetime,
        temperature: day.temp,
        maxTemperature: day.tempmax,
        minTemperature: day.tempmin,
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
export function getAllHourlyData(data: VisualCrossingWeatherData): HourlyWeather[] {
    return data.days.flatMap(day => 
        day.hours.map(hour => ({
            date: day.datetime,
            time: hour.datetime,
            temperature: hour.temp,
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

export function get24HourWeather(data: VisualCrossingWeatherData): TwentyFourHourWeather{
    const allHours = getAllHourlyData(data);
    const now = new Date();
    const hoursWithDate: HourlyWeatherWithDateTime[] = allHours.map((hour: HourlyWeather): HourlyWeatherWithDateTime => ({     //this will retuen an object 
        ...hour,
        dateTime: new Date(`${hour.date}T${hour.time}`),
    }));

    const sorted = hoursWithDate.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
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




type WeatherEmoji = 
  |"clear-day"
  | "clear-night"
  | "cloudy"
  | "fog"
  | "partly-cloudy-day"
  | "partly-cloudy-night"
  | "rain"
  | "showers-day"
  | "showers-night"
  | "sleet"
  | "snow"
  | "snow-showers-day"
  | "thunder"
  | "thunder-rain"
  | "thunder-showers-day"
  | "wind";

const weatherEmojiMap: Record<WeatherEmoji, string> = {
    "clear-day": "☀️",
  "clear-night": "🌙",
  cloudy: "☁️",
  fog: "🌫️",
  "partly-cloudy-day": "⛅",
  "partly-cloudy-night": "🌤",
  rain: "🌧️",
  "showers-day": "🌦️",
  "showers-night": "🌧️",
  sleet: "🌨️",
  snow: "❄️",
  "snow-showers-day": "🌨️",
  thunder: "⛈️",
  "thunder-rain": "⛈️",
  "thunder-showers-day": "⛈️",
  wind: "💨",
}

export function getWeatherEmoji(icon: string): string {
    // here map is an object of icons with key value pairs

    return (
        weatherEmojiMap[icon as WeatherEmoji] ?? "🌡️"
    );
}




// format of date "2026-08-23" -> "Today" / "Tomorrow" / "Sat, 23 Aug"

export function formatDate(dateStr: string): string { 
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

export function formatTime(timeStr: string): string {
    const [h, m] = timeStr.split(":");  // this will return an arr we destruccture it
    const hour = parseInt(h, 10);
    const suffix = hour >=12 ? "pm" : "am";
    const display = hour % 12 || 12;
    return `${display}:${m} ${suffix}`;
}

export function formatShortDate(dateStr: string): string { 
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AE", {
        month: "short",
        day: "numeric",
    })
}