import {getWeatherEmoji, formatTime, formatShortDate} from "../Api/weatherHelper.js";

interface Hour {
    date: string;
    time: string;
    icon: string;
    temperature: number;
    feelsLike: number;
    rainProbability: number;
    windspeed: number;
}

// this for the tsx what eact return jsx clean return 
interface HourCardProps {
    hour: Hour;
}

interface HourSectionProps {
    title: string;
    hours: Hour[];
}

interface HourlyData {
    previous24Hour: Hour[];
    next24Hour: Hour[];
}

interface HourlyDataWeatherProps {
    hours: HourlyData;
}

const HourCard = ({hour}: HourCardProps) => {
    return (
        <div className="flex min-w-[80px] flex-col items-center gap-1 rounded-xl
                  border border-slate-700/60 bg-slate-900 px-3 py-3
                  text-center transition hover:border-sky-500/50">
                    <p className="text-xs font-semibold text-sky-400">
                { formatTime(hour.time)}
            </p>
                    <p className="text-[10px] text-slate-600">
                      {formatShortDate(hour.date)}
            </p>
                    
                    <span className="text-xl" aria-hidden="true">
                        {getWeatherEmoji(hour.icon)}
            </span>
            <p className="text-sm font-bold text-slate-100">
                {/* yaha NAN error de raha ha solve karo */}
                        {Math.round(hour.temperature)}°C
            </p>
            <p className="text-[10px] text-slate-500">
               Feels { Math.round(hour.feelsLike)}°
                    </p>

                    <p className="text-[10px] text-slate-500">💧 {hour.rainProbability}%</p>
    <p className="text-[10px] text-slate-500">💨 {hour.windSpeed}</p>
                  </div>
    )
}

const HourSection = ({ title, hours }: HourSectionProps) => {
    return (
        <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                {title}
            </h2>
            {hours.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-600">No Data Available</p>
            ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-color:theme(colors.slate.700)_transparent] [scrollbar-width:thin]">
                    {hours.map(hour => (
                        <HourCard key={`${hour.date}-${hour.time}`} hour={hour} />
                    ))}
                </div>
            )}
        </section>
    )
};


const HourlyDataWeather = ({ hours }: HourlyDataWeatherProps) => {
    const {previous24Hour, next24Hour} = hours;

    return (
        <div className="flex flex-col gap-6">
            <HourSection
                title="⏪ Previous 24 Hours"
                hours={[...previous24Hour].reverse()}
            />
            <HourSection 
                title="⏩ Next 24 Hours"
                hours={next24Hour } />
        </div>
    )
};

export default HourlyDataWeather;