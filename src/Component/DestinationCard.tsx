import {getWeatherEmoji} from "../Api/weatherHelper.ts";
import {getScoreLabel} from "../utils/destination.ts";
import type {DestinationWeather} from "../hooks/useDestinations.ts";


// export interface DestinationWeather {
//     dest: Destination;
//     temp: number;
//     feelsLike: number;
//     conditions: string;
//     icon: string;
//     humidity: number;
//     windSpeed: number;
//     uvIndex: number;
//     precipProb: number;
//     score: DestinationScore;
//     loading: boolean;
//     error: string | null;
// }

interface DestinationCardProps {
    dw: DestinationWeather;
    onSelect: (city: string) => void;  // let user click to view full weather
}

const DestinationCard = ({ dw, onSelect }: DestinationCardProps) => {
    const {dest, score, loading, error} = dw;
    const meta = getScoreLabel(score.score);

    // skeleton dikao jab tak loadng state
    if(loading){
        return (
            <div className="animate-pulse rounded-xl border border-slate-700/60 bg-slate-900 p-4">
                <div className="mb-2 h-4 w-2/3 rounded bg-slate-700">
                </div>
                <div className="h-3 w-1/2 rounded bg-slate-800" />
            </div>
        );
    }

    // error state
    if(error){
        return (
            <div className="rounded-xl border border-slate-700/60 bg-slate-900 p-4 opacity-60">
                <p className="text-xs font-semibold text-slate-400">{dest.emoji} {dest.name}</p>
                <p className="mt-1 text-xs text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border p-4 transition-all cursor-pointer hover:border-sky-500/50 hover:shadow-lg ${meta.bg}`}
            onClick={() => onSelect(dest.city)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(dest.city)}
            aria-label={`View weather for ${dest.name}`}
        >
            {/* header row */}
            <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{dest.emoji}</span>
                    <div>
                        <p className="text-sm font-bold text-slate-100 leading-tight">{dest.name}</p>
                        <p className="text-[10px] text-slate-500">{dest.country} · {dest.type}</p>

                    </div>
                </div>
                {/* score badge  */}
                <div className={`flex flex-col items-center rounded-lg border px-2 py-1 ${meta.bg}`}>
                    <span className="text-xs">{meta.emoji}</span>
                    <span className={`text-[10px] font-bold ${meta.color}`}>{score.score}</span>
                </div>

            </div>

            {/* temperature + icon */}
            <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl font-black text-slate-100">{Math.round(dw.temp)}°C</span>
                <span className="text-xl">{getWeatherEmoji(dw.icon)}</span>
                <span className="text-xs text-slate-400">{dw.conditions}</span>
            </div>

            {/* quick stats */}
            <div className="mb-2 flex flex-wrap gap-2 text-[10px] text-slate-400">
                <span>💧 {dw.precipProb}%</span>
                <span>💨 {dw.windSpeed} km/h</span>
                <span>☀️ UV {dw.uvIndex}</span>
                <span>💦 {dw.humidity}%</span>
            </div>

            {/* score label */}
            <p className={`text-xs font-semibold ${meta.color}`}>{meta.label}</p>

            {/* top Reason */}
            {score.reasons[0] && (
                <p className="mt-1 text-[10px] text-emerald-400">✓ {score.reasons[0]}</p>
            )}
            {score.warnings[0] && (
                <p className="mt-1 text-[10px] text-orange-400">⚠ {score.warnings[0]}</p>
            )}

            {/* description */}
            <p className="mt-2 text-[10px] text-slate-500 leading-snug">{dest.description}</p>

            {/* Tags */}
            <div className="mt-2 flex flex-wrap gap-1">
                {dest.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-400">
                        {tag}
                    </span>
                ))}
            </div>

        </div>
    );
};

export default DestinationCard;