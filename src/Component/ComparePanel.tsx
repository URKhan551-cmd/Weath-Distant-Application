import {useState} from "react";
import {Search} from "lucide-react";
import {getWeatherEmoji} from "../Api/weatherHelper.ts";
import {getScoreLabel} from "../utils/destination.ts";
import {useDestinations} from "../hooks/useDestinations.ts";
import type {DestinationWeather} from "../hooks/useDestinations.ts";
// import {EMIRATES} from "../utils/emirates.ts";

// quick cities suggestions
const quickCities = ["Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE",
  "Fujairah, UAE", "Ras Al Khaimah, UAE", "Hatta, UAE",
  "Muscat, Oman", "Khasab, Oman",
];

// one column of comparison

const CompareColumn = ({dw, label}: {dw: DestinationWeather | null;
label: string;
}) => {
    if(!dw){
        return (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl
            border border-dashed border-slate-700 py-10 text-xs
            text-slate-600">
                {label}
            </div>
        );
    }

const meta = getScoreLabel(dw.score.score);

    return (
        <div className={`flex flex-1 flex-col rounded-xl border p-4 ${meta.bg}`}>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                {label}
            </p>
            <p className="text-base font-black text-slate-100">
                {dw.dest.name || dw.dest.city}
            </p>

            {/* score yaha ajayega  */}
            <div className="my-3 flex items-center gap-2">
                <span className={`text-3xl font-black ${meta.color}`}>
                    {dw.score.score}
                </span>

                <div>
                    <p className={`text-xs font-bold ${meta.color}`}>
                        {meta.emoji} {meta.label}
                    </p>
                    <p className="text-[10px] text-slate-500">out of 100</p>
                </div>
            </div>

            {/* temperature */}
            <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl font-black text-slate-100">
                    {Math.round(dw.temp)}°C
                </span>
                <span className="text-xl">{getWeatherEmoji(dw.icon)}</span>
            </div>

            {/* stats */}
            <div className="mb-3 space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                    <span className="text-slate-500">Feels like</span>
                    <span>{Math.round(dw.feelsLike)}°C</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Humidity</span>
                    <span>{dw.humidity}%</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-500">Wind</span>
                    <span>{dw.windSpeed}km/h</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-500">UV index</span>
                    <span>{dw.uvIndex}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-500">Rain Chance</span>
                    <span>{dw.precipProb}%</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-500">Conditions</span>
                    <span className="text-right text-[10px]">{dw.conditions}</span>
                </div>
            </div>

            {/* reasons */}
            {dw.score.reasons.length > 0 && (
                <div className="mb-1">
                    {dw.score.reasons.map((reason, i) => (
                        <p key={i} className="text-[10px] text-emerald-400">✓ {reason}</p>
                    ))}
                </div>
            )}

            {/* warnings */}
            {dw.score.warnings.length > 0 && (
                <div>
                    {dw.score.warnings.map((warning, i) => (
                        <p key={i} className="text-[10px] text-orange-400">⚠ {warning}</p>
                    ))}
                </div>
            )}
        </div>
    );

};

const ComparePanel = () => {
    const [cityA, setCityA] = useState<string>("");
    const [cityB, setCityB] = useState<string>("");
    const [resultA, setResultA] = useState<DestinationWeather | null>(null);
    const [resultB, setResultB] = useState<DestinationWeather | null>(null);
    const [comparing, setComparing] = useState<boolean>(false);
    const [err, setErr] = useState<string | null>(null);

    const { fetchComparison } = useDestinations();
    
    const handleCompare = async () => {
        if (!cityA.trim() || !cityB.trim()) {
            setErr("Please enter two destinations to compare.");
            return;
        }

        setErr(null);
        setComparing(true);
        const [a, b] = await fetchComparison(cityA.trim(), cityB.trim());
        setResultA(a);
        setResultB(b);
        if (!a || !b) setErr("Could not load one or both destinations. check name and try again.");
        setComparing(false);
    };
    
    // winner callout
    // it simply mean if we have resultA and resultB both then look at the 
    // score of each which one is greater return that one or returun null
    const winner = resultA && resultB ? resultA.score.score >= resultB.score.score ? resultA : resultB : null;
    
    return (
        <div className="flex gap-4 flex-col">
            <p className="text-[10px] font-bold upppercase tracking-widest text-slate-500">
                ⚖️ Compare Two Destinations
            </p>

            {/* input row where we can write city */}
            <div className="flex gap-2 flex-wrap">
                <input
                    value={cityA}
                    onChange={(e) => setCityA(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                    placeholder="City A (e.g. Dubai)"
                    className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800
                px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
                <input
                    value={cityB}
                    onChange={(e) => setCityB(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                    placeholder="City B (e.g. Fujairah)"
                    className="min-w-0 flex-1 rounded-lg border border-slate-700
             bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500
             focus:border-sky-500 focus:outline-none"
                />

                <button
                    onClick={handleCompare}
                    disabled={comparing}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-400
             px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-sky-300
             disabled:opacity-50"
                >
                    <Search size={14} />
                    {comparing ? "Loading..." : "Compare"}
                </button>
            </div>

            {/* // quick suggestion */}
            <div className="flex flex-wrap gap-1.5">
                {quickCities.map(city => (
                    <button
                        key={city}
                        onClick={() => !cityA ? setCityA(city) : setCityB(city)}
                        className="rounded-full border border-slate-700 bg-slate-800/50
                px-2.5 py-1 text-[10px] font-medium text-slate-400
                transition hover:border-sky-500 hover:text-sky-400"
                    >
                        {city}
                    </button>
                ))}
            </div>

            {err && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 
            px-3 py-2 text-xs text-red-400">
                    ⚠️ {err}
                </p>
            )}

            {/* winner banner */}
            {winner && (
                <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3">
                    <p className="text-xs font-bold text-sky-300">
                        🏆 Better conditions today: {winner.dest.name || winner.dest.city}
                        <span className="ml-2 font-normal text-sky-400/70">
                            (score {winner.score.score}/100)
                        </span>
                    </p>
                </div>
            )}


            {/* columns */}
            {comparing ? (
                <div className="flex gap-3">
                    {[0, 1].map((i) => (
                        <div key={i} className="flex-1 animate-pulse rounded-xl border
                        border-slate-700 bg-slate-900 p-4">
                            <div className="mb-3 h-4 w-1/2 rounded bg-slate-700" />
                            <div className="h-8 w-2/3 rounded bg-slate-800" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex gap-3">
                    <CompareColumn dw={resultA} label="Destination A" />
                    <CompareColumn dw={resultB} label="Destination B" />
                </div>
            )}

        </div>

    );
};

export default ComparePanel;
