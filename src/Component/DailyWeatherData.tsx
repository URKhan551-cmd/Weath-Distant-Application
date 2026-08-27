import {getWeatherEmoji, formatDate } from "../Api/weatherHelper.js";

interface DailyWeather {
    date: string;
    icon: string;
    conditions: string;
    maxTemperature: number;
    minTemperature: number;
    rainProbability: number;
    windSpeed: number;
    humidity: number;
}

interface DailyWeatherDataProps {
    days: DailyWeather[];
}


const DailyWeatherData = ({ days }: DailyWeatherDataProps) => { 
    return (
        <div className="flex flex-col gap-2">
            <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                15-Day Forecast
            </h2>
            {days.map(day => (
                <div key={day.date}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/60 bg-slate-900 px-4 py-3 transition hover:border-slate-600">
                    {/* left  icon + date + condition */}
                    <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden="true">
                            { getWeatherEmoji(day.icon)}
                            </span>
                            
                        <div>
                            <p className="text-sm font-semibold text-slate-100">
                                { formatDate(day.date)}
                            </p>
                                <p className="text-sm text-slate-500">{ day.conditions}</p>
                            </div>
                    </div>

                        {/* right  temp + stats */}

                        <div className="text-right">
                            <div className="flex items-baseline justify-end gap-1 text-sm font-bold">
                            <span className="text-slate-100">{Math.round(day.maxTemperature)}°</span>
                            <span className="text-slate-600">/</span>
                            <span className="text-slate-500">{ Math.round(day.minTemperature)}</span>
                            </div>

                            {/* rain wind humidity */}

                        <div className="mt-0.5 flex justify-end gap-2 text-xs text-slate-500">
                                <span>💧 {day.rainProbability}%</span>
                                <span>💨 {day.windSpeed} km/h</span>
                                <span>💦 {day.humidity}%</span>
                            </div>
                        </div>
                     </div>
            )) }
        </div>
    )
}

export default DailyWeatherData;