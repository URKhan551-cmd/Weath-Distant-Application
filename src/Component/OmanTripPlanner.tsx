import { useState } from "react";
import { Navigation } from "lucide-react";
import { getOmanDestination, getScoreLabel, scoreDestination } from "../utils/destination.ts";
import { buildNavLink } from "../utils/mapHelpers.ts";
 
const DRIVE_TIMES: Record<string, string> = {
  hatta:  "1.5h from Dubai",
  khasab: "2h from Dubai",
  sohar:  "2h from Dubai",
  nizwa:  "6h from Dubai",
  muscat: "5.5h from Dubai",
};
 
const BORDER_INFO: Record<string, string> = {
  hatta:  "Hatta border — visa not required for most nationalities",
  khasab: "Tibat border — Oman visa required (on arrival or e-visa)",
  sohar:  "Wajajah border — Oman visa required",
  nizwa:  "Wajajah border — Oman visa required",
  muscat: "Wajajah border — Oman visa required",
};
 
const OmanTripPlanner = () => {
  // ✅ removed unused result/setResult state — no DestinationWeather type needed
  const [fetched, setFetched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
 
  const omanDests = getOmanDestination();
 
  const handleFetch = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setFetched(true);
    setLoading(false);
  };
 
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900 p-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          🇴🇲 Oman Border Trip Planner
        </p>
        <h3 className="text-base font-black text-slate-100">Day trips from UAE to Oman</h3>
        <p className="mt-1 text-xs text-slate-400">
          Weather conditions and travel info for all Oman border destinations.
        </p>
        {!fetched && (
          <button
            onClick={handleFetch}
            disabled={loading}
            className="mt-3 w-full rounded-lg bg-sky-400 py-2.5 text-sm
                       font-bold text-slate-900 transition hover:bg-sky-300 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Check Oman Trip Conditions"}
          </button>
        )}
      </div>
 
      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {omanDests.map((d) => (
            <div key={d.id} className="animate-pulse rounded-xl border border-slate-700 bg-slate-900 p-4">
              <div className="mb-2 h-4 w-1/2 rounded bg-slate-700" />
              <div className="h-3 w-2/3 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      )}
 
      {/* Results */}
      {fetched && !loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {omanDests.map((dest) => {
            const score      = scoreDestination(dest, 30, 7, 15, 5);
            const meta       = getScoreLabel(score.score); // ✅ no meta.description used
            const driveTime  = DRIVE_TIMES[dest.id]  ?? "Drive time varies";
            const borderInfo = BORDER_INFO[dest.id]  ?? "Check visa requirements";
 
            return (
              <div key={dest.id} className={`rounded-xl border p-4 ${meta.bg}`}>
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{dest.emoji}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-100">{dest.name}</p>
                      <p className="text-[10px] text-slate-500">{dest.country}</p>
                    </div>
                  </div>
                  <div className={`rounded-lg border px-2 py-1 text-center ${meta.bg}`}>
                    <p className="text-xs">{meta.emoji}</p>
                    <p className={`text-[10px] font-bold ${meta.color}`}>{score.score}</p>
                  </div>
                </div>
 
                <p className="mb-2 text-xs font-semibold text-sky-400">🚗 {driveTime}</p>
                <p className="mb-2 text-[10px] text-slate-400 leading-snug">{dest.description}</p>
                <p className={`mb-1 text-xs font-bold ${meta.color}`}>{meta.label} conditions today</p>
 
                {score.reasons[0]  && <p className="text-[10px] text-emerald-400">✓ {score.reasons[0]}</p>}
                {score.warnings[0] && <p className="text-[10px] text-orange-400">⚠ {score.warnings[0]}</p>}
 
                <p className="mt-2 text-[10px] text-slate-500 leading-snug">🛂 {borderInfo}</p>
 
                <div className="mt-2 flex flex-wrap gap-1">
                  {/* ✅ explicit (tag: string) type annotation */}
                  {dest.tags.slice(0, 4).map((tag: string) => (
                    <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>
 
                <a
                  href={buildNavLink(dest.lat, dest.lon, dest.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-lg
                             border border-sky-500/40 bg-sky-500/10 py-2 text-xs
                             font-semibold text-sky-300 transition hover:bg-sky-500/20"
                >
                  <Navigation size={12} />
                  Navigate to {dest.name}
                </a>
              </div>
            );
          })}
        </div>
      )}
 
      {/* Tips */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          💡 UAE to Oman Travel Tips
        </p>
        <ul className="space-y-1.5 text-xs text-slate-400">
          <li>🪪 UAE residents need a valid passport — Emirates ID not accepted at Oman border</li>
          <li>🚗 UAE vehicle insurance NOT valid in Oman — buy at border (~50 AED)</li>
          <li>⛽ Fill up fuel in UAE — significantly cheaper than Oman</li>
          <li>📱 Get an Oman SIM or activate international roaming before crossing</li>
          <li>⏰ Best time to cross: early morning to avoid queues</li>
          <li>🌡️ Oman is generally 5–8°C cooler than UAE interior in summer</li>
        </ul>
      </div>
    </div>
  );
};
 
export default OmanTripPlanner;
 