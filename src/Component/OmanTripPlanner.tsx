import {useState} from "react";
import {Navigation} from "lucide-react";
import {getOmanDestination, getScoreLabel, scoreDestination} from "../utils/destination.ts";

import {getWeatherEmoji} from "../Api/weatherHelper.ts";
import {useDestinations} from "../hooks/useDestinations.ts";
import type {DestinationWeather} from "../hooks/useDestinations.ts";
import {buildNavLink} from "../utils/mapHelpers.ts";

// Drive takes time to reach your destination 
const DRIVE_TIMES: Record<string, string> = {
    hatta: "1.5h from Dubai",
    khasab:  "2h from Dubai",
  sohar:   "2h from Dubai",
  nizwa:   "6h from Dubai",
  muscat:  "5.5h from Dubai",
};

// Bordercrossing informations you user need.
const BORDER_INFO: Record<string, string> = {
  hatta:   "Hatta border crossing — UAE passport + visa not required for most nationalities",
  khasab:  "Tibat border crossing — Oman visa required (available on arrival or e-visa)",
  sohar:   "Wajajah border crossing — Oman visa required",
  nizwa:   "Wajajah border crossing — Oman visa required",
  muscat:  "Wajajah border crossing — Oman visa required",
};

const OmanTripPlanner = () => {
    const omanDests = getOmanDestination();
    const [result, setResult] = useState<DestinationWeather[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetched, setFetched] = useState(false);
    const [error, setError] = useState<string | null>(null)
console.log("result state k ander kuch ha", result)
    const { fetchDestinations } = useDestinations();

    const handleFetch = async () => {
        setLoading(true);
        setError(null);
        // here we fetch data from the function about type of border
        try {
        const data = await fetchDestinations("border");
         
        setResult(data);
        setFetched(true);
        } catch (error){
            console.error("Failed to fetch Omanweather:", error);
                setError("unable to load oman weather, please try again")
        } finally {
        setLoading(false);
    }
};

    return(
        <div className = "flex flex-col gap-4" >
            <div className="rounded-xl border border-slate-700/60 bg-slate-900 p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    🇴🇲 Oman Border Trip Planner ← UAE ADD
                </p>
                <h3 className="text-base font-black text-slate-100">Day trips from UAE to Oman</h3>
                <p className="mt-1 text-xs text-slate-400">
                    Check today's weather at all Oman border destinations — beaches, fjords, forts, and cities.
                </p>

                {!fetched && (
                    <button
                    type="button"
                        onClick={handleFetch}
                        disabled={loading}
                        className="mt-3 w-full rounded-lg bg-sky-400 py-2.5 text-sm
             font-bold text-slate-900 transition hover:bg-sky-300
             disabled:opacity-50"
                    >
                        {loading ? "Loading weather..." : "Check Oman Trip Conditions"}
                    </button>
                )}
            </div>

            {/* error found  */}
            {error && (
                <p className="mt-3 text-xs text-red-400">
                    {error}
                </p>
            )}

        { /* Loading skeleton */}
        {loading && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {omanDests.map(dest => (
                        <div key={dest.id} className="animate-pulse rounded-xl border border-slate-700 bg-slate-900 
                        p-4">
                            <div className="mb-2 h-4 w-1/2 rounded bg-slate-700"/>
                            <div className="h-3 w-2/3 rounded bg-slate-800" />
                        </div>
                    ))}
                </div>
            )}
         {/* Result grid */}
         {fetched && !loading && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {result.map(weather => {

                    // weather information
                    const dest = weather.dest;
                    // simulate score from current conditions
                    // in a real build this world come from the hook result
                    const fakeDw: Partial<DestinationWeather> = {
                        dest,
                        temp: 30, feelsLike:33, conditions: "clear", icon: "clear-day",
                        humidity: 45, windSpeed: 15, uvIndex: 7, precipProb: 5,
                    };

                    const score = scoreDestination(dest, 
                        weather.temp,
                        weather.windspeed,
                        weather.uvindex,
                        weather.precipprob);

                        // convert score into UI information
                    const meta = getScoreLabel(score.score);
                    const driveTime = DRIVE_TIMES[dest.id] ?? "Drive time varies";
                    const borderInfo = BORDER_INFO[dest.id] ?? "Check visa requirements";

                    return (
                        <div key={dest.id} className={`rounded-xl border p-4 ${meta.bg}`}>
                            {/* header */}
                            <div className="mb-2 flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{dest.emoji}</span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-100">{dest.name}</p>
                                        <p className="text-[10px] text-slate-500"></p>
                                    </div>
                                </div>
                                <div className={`rounded-lg border px-2 py-1 text-center ${meta.bg}`}>
                                    <p className="text-xs">{meta.emoji}</p>
                                    <p className={`text-[10px] font-bold ${meta.color}`}></p>
                                </div>
                            </div>

                            {/* drive time will be here */}
                            <p className="mb-2 text-xs font-semibold text-sky-400">
                                🚗 {driveTime}
                            </p>

                            {/* description */}
                            <p className="mb-2 text-[10px] text-slate-400 leading-snug">
                                {meta.description}
                            </p>

                            {/* score label here */}
                            <p className={`mb-1 text-xs font-bold ${meta.color}`}>
                                {meta.label} conditions today
                            </p>

                            {/* reasons  */}
                            {score.reasons[0] && (
                                <p className="text-[10px] text-emerald-400">✓ {score.reasons[0]}</p>
                            )}
                            {score.warnings[0] && (
                                <p className="text-[10px] text-orange-400">⚠ {score.warnings[0]}</p>
                            )}

                            {/* border info */}

                            <p className="mt-2 text-[10px] text-slate-500 leading-snug">
                                🛂 {borderInfo}
                            </p>

                            {/* tags */}

                            <div className="mt-2 flex flex-wrap gap-1">
                                {dest.tags.slice(0, 4).map(tag => (
                                    <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5
                                    text-[9px] font-medium text-slate-400">
                                        {tag}

                                    </span>
                                ))}
                            </div>

                            {/* navigation button  */}
                            <a
                                href={buildNavLink(dest.lat, dest.lon, dest.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 flex items-center justify-center gap-1.5
                            rounded-lg border border-sky-500/40 bg-sky-500/10
                            py-2 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20"
                            >
                                <Navigation size={12} />
                                Navigate to {dest.name}
                            </a>
                        </div>
                    );
                })}

                {/* tips section  */}
                <div className="rounded-xl border border-slate-700/60 bg-slate-900 p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                     💡 UAE to Oman Travel Tips
                </p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                     <li>🪪 UAE residents need a valid passport — Emirates ID not accepted at Oman border</li>
          <li>🚗 Your UAE vehicle insurance is NOT valid in Oman — buy Oman insurance at the border (~50 AED)</li>
          <li>⛽ Fill up fuel in UAE — significantly cheaper than Oman</li>
          <li>📱 Get an Oman SIM or activate international roaming before crossing</li>
          <li>⏰ Best time to cross: early morning to avoid queues</li>
          <li>🌡️ Oman is generally 5–8°C cooler than UAE interior in summer</li>
                </ul>
                </div>
            </div>
         )}
        </div>
    )
}

export default OmanTripPlanner;