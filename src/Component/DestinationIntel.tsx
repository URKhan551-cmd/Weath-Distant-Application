import { useState } from "react";
import { useDestinations }  from "../hooks/useDestinations.ts";
import { filterByType, type DestinationType } from "../utils/destination.ts";
import DestinationCard  from "./DestinationCard.tsx";
import ComparePanel     from "./ComparePanel.tsx";
import OmanTripPlanner  from "./OmanTripPlanner.tsx";

type SubTab = "rank" | "beach" | "desert" | "mountain" | "compare" | "oman";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "rank",     label: "🏆 Ranked"  },
  { id: "beach",    label: "🏖️ Beaches" },
  { id: "desert",   label: "🏜️ Desert"  },
  { id: "mountain", label: "⛰️ Mountain" },
  { id: "compare",  label: "⚖️ Compare" },
  { id: "oman",     label: "🇴🇲 Oman"   },
];

const DestinationIntel = ({ onCitySelect }: { onCitySelect: (city: string) => void }) => {
  const [subTab, setSubTab] = useState<SubTab>("rank");
  const { results, loading, fetched, fetchDestinations } = useDestinations();

  const handleTabClick = (tab: SubTab) => {
    setSubTab(tab);
    // Auto-fetch when switching to a data tab (not compare/oman)
    if (tab !== "compare" && tab !== "oman" && !fetched) {
      const type = tab === "rank" ? "all" : tab as DestinationType;
      fetchDestinations(type);
    }
  };

  // Filter results based on active sub-tab
  const visibleResults = subTab === "rank"
    ? results
    : results.filter((r) => r.dest.type === (subTab as DestinationType));

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tab bar — horizontally scrollable on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-1
                      [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold
                        transition-all
                        ${subTab === tab.id
                          ? "border-sky-500/60 bg-sky-500/15 text-sky-300"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-200"
                        }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Ranked / Beach / Desert / Mountain ── */}
      {["rank", "beach", "desert", "mountain"].includes(subTab) && (
        <>
          {/* Fetch button if not yet loaded */}
          {!fetched && !loading && (
            <button
              onClick={() => {
                const type = subTab === "rank" ? "all" : subTab as DestinationType;
                fetchDestinations(type);
              }}
              className="w-full rounded-xl border border-sky-500/40 bg-sky-500/10
                         py-3 text-sm font-bold text-sky-300 transition hover:bg-sky-500/20"
            >
              {subTab === "rank"     && "🏆 Load Weather Rankings for All Destinations"}
              {subTab === "beach"    && "🏖️ Load Beach Conditions"}
              {subTab === "desert"   && "🏜️ Load Desert Conditions"}
              {subTab === "mountain" && "⛰️ Load Mountain Conditions"}
            </button>
          )}

          {/* Refresh button */}
          {fetched && (
            <button
              onClick={() => {
                const type = subTab === "rank" ? "all" : subTab as DestinationType;
                fetchDestinations(type);
              }}
              disabled={loading}
              className="self-end rounded-lg border border-slate-700 px-3 py-1.5
                         text-xs text-slate-400 transition hover:border-sky-500
                         hover:text-sky-400 disabled:opacity-40"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          )}

          {/* Results grid — 1 col mobile, 2 col sm, 3 col lg */}
          {(fetched || loading) && (
            <>
              {subTab === "rank" && fetched && (
                <p className="text-[10px] text-slate-500">
                  Ranked by weather suitability score (0–100). Click any card to view full forecast.
                </p>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(loading && visibleResults.length === 0
                  ? filterByType(subTab === "rank" ? "all" : subTab as DestinationType).map((d) => ({
                      dest: d, temp: 0, feelsLike: 0, conditions: "", icon: "",
                      humidity: 0, windSpeed: 0, uvIndex: 0, precipProb: 0,
                      score: { id: d.id, score: 0, reasons: [], warnings: [] },
                      loading: true, error: null,
                    }))
                  : visibleResults
                ).map((dw) => (
                  <DestinationCard
                    key={dw.dest.id}
                    dw={dw}
                    onSelect={onCitySelect}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Compare ── */}
      {subTab === "compare" && <ComparePanel />}

      {/* ── Oman Trip Planner ← UAE ADD ── */}
      {subTab === "oman" && <OmanTripPlanner />}
    </div>
  );
};

export default DestinationIntel;