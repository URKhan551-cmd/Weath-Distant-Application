import { getWeatherEmoji} from "../Api/weatherHelper.js";

const STATS = [
  { key: "feelslike",    label: "Feels like",   unit: "°C",    icon: "🌡️" },
  { key: "humidity",     label: "Humidity",     unit: "%",     icon: "💧" },
  { key: "precipprob",   label: "Rain chance",  unit: "%",     icon: "🌧️" },
  { key: "windspeed",    label: "Wind speed",   unit: " km/h", icon: "💨" },
  { key: "pressure",     label: "Pressure",     unit: " hPa",  icon: "🔵" },
  { key: "visibility",   label: "Visibility",   unit: " km",   icon: "👁️" },
  { key: "uvindex",      label: "UV index",     unit: "",      icon: "☀️" },
  { key: "cloudcover",   label: "Cloud cover",  unit: "%",     icon: "☁️" },
  { key: "dew",          label: "Dew point",    unit: "°C",    icon: "💦" },
  { key: "windgust",     label: "Wind gust",    unit: " km/h", icon: "🌬️" },
  { key: "solarenergy",  label: "Solar energy", unit: " MJ/m²",icon: "⚡" },
];

const StatCard = ({ icon, label, unit, value }) => {
return (
    <div className="flex flex-col gap-1 rounded-xl border-slate-700/60 bg-slate-800/50 p-3">
        <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-base font-semibold text-slate-100">
            {icon} { value} {unit}
        </span>
    </div>
)
};

const CurrentWeather = ({ data}) => {
    const c = data.currentConditions;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-AE", {
        weekday: "long", day: "numeric", year: "numeric",
    });
    const timeStr = now.toLocaleDateString("en-AE", {
        hour: "2-digit", minute: "2-digit",
    });

    return (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900 p-5">
            {/* location + badge */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h2 className="text-lg font-bold capitalize text-slate-100 sm:text-xl">
                        {data.address }
                    </h2>
                    <p className="text-sm text-slate-500">
                        {dateStr} . { timeStr}
                    </p>

                </div>

                <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400">
                    { c.conditions}
                </span>
            </div>

            {/* big temprature icons */}
            <div className="mb-5 flex items-center gap-4">
                <span className="text-6xl font-black tracking-tighter text-slate-100 sm:text-7xl">
                    { Math.round(c.temp)}°C
                </span>
                <span className="text-5xl" aria-hidden="true">
                    { getWeatherEmoji(c.icon)}
                </span>
            </div>

            {/* Stats grid-2 col mobile 3col and sm 4col  */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {STATS.map(({ key, label, unit, icon }) => 
                    c[key] != null ? (
                    <StatCard 
                            key={key}
                            icon={icon}
                            label={label}
                            value={ c[key]}
                            unit={unit}
                    />
                 ) : null
                )}
            </div>

            {/* sunrise and sunset  */}
            {data.days?.[0] && (
                <div className="flex justify-between border-slate-700/60 pt-4 text-sm text-slate-400 flex-wrap gap-2">
                    <span>🌅 Sunrise: { data.days[0].sunrise}</span>
                    <span>🌇 Sunset: { data.days[0].sunset}</span>
                </div>
            )}

        </div>
    )
}

export default CurrentWeather;