import { getWeatherEmoji} from "../Api/weatherHelper.js";

interface StateConfig {
    key: keyof CurrentConditions;
    label: string;
    unit: string;
    icon: string;
}

interface CurrentConditions {
  temp: number;
  feelslike: number;
  humidity: number;
  precipprob?: number;
  windspeed?: number;
  pressure?: number;
  visibility?: number;
  uvindex?: number;
  cloudcover?: number;
  dew?: number;
  windgust?: number;
  solarenergy?: number;
  conditions: string;
    icon: string;
}

interface WeatherDay {
    sunrise: string;
    sunset: string;
}

interface WeatherData {
    address: string;
    currentConditions: CurrentConditions;
    days?: WeatherDay[];
}

interface StateCardProps {
    icon: string;
    label: string;
    unit: string;
    value: number;
}

interface HeatIndexCardProps {
    temp: number;
    humidity: number;
}

interface UVCardProps {
    uvIndex?: number;
}

interface OutDoorSafetyCardProps {
    temp: number;
    feelsLike: number;
    uvIndex: number;
    humidity: number;
}

interface HeatIndexMeta {
    label: string;
    color: string;
    bg: string;
}

interface UVMeta {
    label: string;
    color: string;
    bg: string;
}

interface OutDoorSafetyMeta {
    rating: string;
    emoji: string;
    detail: string;
    color: string;
    bg: string;
}



const STATS: StateConfig[] = [
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



//  HeatIndex by help of Staedman Formula , metric 
function calcHeatIndex(tempC: number, humidity: number): number {
    if(tempC < 27) return  tempC;

    const T = tempC;
    const R = humidity;
    const HI = -8.78469475556 + 1.61139411 * T
        + 2.33854883889 * R + 
    -0.14611605 * T * R +
    -0.012308094 * T * T +
    -0.016424828 * R * R +
    0.002211732 * T * T * R +
    0.00072546 * T * R * R +
    -0.000003582 * T * T * R * R;

    return Math.round(HI);
};

function getHeatIndexMeta(hi: number): HeatIndexMeta {
    if(hi < 27)return {label: "Comfortable", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30"};

    if(hi < 33) return {label: "Caution", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" };

    if(hi < 40) return {label:"Extreme Caution", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" };

    if(hi < 52 ) return {label: "Danger", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" };
    
    return { label: "Extreme Danger", color: "text-rose-300", bg: "bg-rose-500/10 border-rose-500/30" };
};

// UV BURN TIME 
function calcBurnTime(uv?: number): string | null {
    if(!uv || uv <= 0) return null;
    const mins = Math.round(200/(uv * 2.5));
    if(mins >= 60) {
        return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    };

    return `${mins} min`;
};

function getUVMeta(uv: number): UVMeta {
    if(uv <= 2) return {label: "Low", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };

    if(uv <= 5)return {label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30"};

    if(uv <= 7)return {label: "High", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" };

    if(uv <= 10)return {label: "Very High", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" };

    return { label: "Extreme", color: "text-rose-300", bg: "bg-rose-500/10 border-rose-500/30" };  
};


// OUTDOOR SAFETY RATINGS HERE WE DID 
function getOutDoorSafety(temp: number, feelsLike: number, uv: number, humidity: number): OutDoorSafetyMeta {
    let score = 100;
    if (temp >= 45) {
        score -= 40;
    } else if (temp >= 40) {
        score -= 25;
    } else if (temp >= 35) {
        score -= 15;
    } else if (temp >= 30) {
        score -= 5;
     };

     if(feelsLike >= 50){
        score -= 20;
     } else if(feelsLike >= 42){
         score -= 12;
     } else if(feelsLike >= 36){
        score -= 6;
     };

     if(uv >= 11){
        score -= 20;
     } else if(uv >= 8){
        score -= 12;
     } else if(uv >= 6){
        score -= 6
     };

     if(humidity >= 85){
        score -= 10;
     } else if(humidity >= 70){
        score -= 5;
     };


     score = Math.max(0, score);

     if(score >= 75){
         return { rating: "Safe", emoji: "✅", detail: "Great conditions for outdoor activities.", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
        
     };

     if(score >= 50){
         return { rating: "Caution", emoji: "⚠️", detail: "Stay hydrated, wear sunscreen, limit exposure.", color: "text-yellow-400", bg: "bg-yellow-500/10 border-emerald-500/30"  };
     };

     if(score >= 25){
         return { rating: "Dangerous", emoji: "🔴", detail: "Avoid outdoor activity. Risk of heat stroke", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" };
     }

    return { rating: "Stay Indoors", emoji: "🚫", detail: "Extreme condition. Do not go outside unless absolutely necessary.", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" };
}



const StatCard = ({ icon, label, unit, value }: StateCardProps) => {
return (
    <div className="flex flex-col gap-1 rounded-xl border-slate-700/60 bg-slate-800/50 p-3">
        <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-base font-semibold text-slate-100">
            {icon} { value} {unit}
        </span>
    </div>
)
};


const HeatIndexCard = ({ temp, humidity }: HeatIndexCardProps) => {
    const hi = calcHeatIndex(temp, humidity);
    const meta = getHeatIndexMeta(hi);

    return (
        <div className={`rounded-xl border p-4 ${meta.bg}`}>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">🌡️ Heat Index</p>
            <div className="flex items-end justify-between gap-2 flex-wrap">
                <span className={`text-3xl font-black ${meta.color}`}>{hi}°C</span>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${meta.bg} ${meta.color}`}>{meta.label}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">How your body actually feels when humidity is factored in.</p>
        </div>
    )
};

const UVCard = ({ uvIndex }: UVCardProps) =>  {
    const meta = getUVMeta(uvIndex ?? 0);
    const burnTime = calcBurnTime(uvIndex);

    return (
        <div className={`rounded-xl border p-4 ${meta.bg}`}>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">☀️ UV Index</p>
            <div className="flex items-end justify-between gap-2 flex-wrap">
                <span className={`text-3xl font-black ${meta.color}`}>{uvIndex ?? "-"}</span>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${meta.bg} ${meta.color}`}>
                    {meta.label}
                </span>

            </div>
            {burnTime && (
                <p className="mt-2 text-xs text-slate-400">
                    ⏱ Skin can burn in <span className={`font-semibold ${meta.color}`}>
                        {burnTime}
                    </span>. Apply SPF 50+.
                </p>
            )}
        </div>
    )
};


const OutdoorSafetyCard = ({temp, feelsLike, uvIndex, humidity}: OutDoorSafetyCardProps) => {
    const s = getOutDoorSafety(temp, feelsLike, uvIndex, humidity);

    return (
        <div className={`rounded-xl border p-4 ${s.bg}`}>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                🏃 Outdoor Safety
            </p>
            <div className="flex items-center gap-3">
                <span className="text-3xl">{s.emoji}</span>
                <span className={ `text-xl font-black ${s.color}`}>
                    {s.rating}
                </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{s.detail}</p>
        </div>
    )
}



interface CurrentWeatherProps {
    data: WeatherData;
}

const CurrentWeather = ({ data}: CurrentWeatherProps) => {
    const c = data.currentConditions;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-AE", {
        weekday: "long", day: "numeric", year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-AE", {
        hour: "2-digit", minute: "2-digit",
    });

    return (
        <div className="flex flex-col gap-4">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <HeatIndexCard temp={c.temp} humidity={c.humidity}/>
            <UVCard uvIndex={c.uvindex} />
            <OutdoorSafetyCard  temp={c.temp} feelsLike={c.feelslike} uvIndex={c.uvindex} humidity={c.humidity} />
        </div>
        </div>
    )
}

export default CurrentWeather;