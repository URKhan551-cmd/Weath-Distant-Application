import {Bookmark, BookmarkCheck, Trash2, MapPin} from "lucide-react";
import type {Lang} from "../utils/translations.ts";
import {t} from "../utils/translations.ts";
import type {SavedDestination} from "../hooks/useSavedDestinations.ts";

interface SavedDestinationsProps {
    saved: SavedDestination[];
    lang: Lang;
    onSelect: (city: string) => void;
    onRemove: (id: string) => void;
    onClearAll: () => void;
}


const SavedDestinations = ({
    saved, lang, onSelect, onRemove, onClearAll,
}: SavedDestinationsProps) => {
    return (
        <div className="flex flex-col gap-3">

            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    💾 {t("savedTitle", lang)}
                </p>
                {saved.length > 0 && (
                    <button
                     onClick={onClearAll}
                     className="flex items-center gap-1 text-[10px] text-slate-500
                     hover:text-red-400 transition"
                    >
                        <Trash2 size={10} />
                        {t("clearAll", lang)}
                    </button>
                )}
            </div>

            {/* Empty state */}
            {saved.length === 0 && (
                <div className="flex flex-col items-center gap-3
                rounded-xl border border-dashed border-slate-700
                py-10 text-center">
                    <Bookmark size={28} className="text-slate-600" />
                    <p className="text-sm text-slate-500">{t("noSaved", lang)}</p>
                    <p className="text-xs text-slate-600">
                        {lang === "ar" ? "ابحث عن مدينة واحفظها من زر الحفظ أعلاه" 
                        : "Search a city and tap Save to add it here"}
                    </p>
                </div>
            )}

            {/* saved list */}
            <div className="grid grid=cols-1 gap-2 sm:grid-cols-2">
                {saved.map(dest => (
                    <div
                     key={dest.id}
                     className="flex items-center gap-3 rounded-xl border
                     border-slate-700/60 bg-slate-900 px-4 py-3
                     transition hover:border-sky-500/40"
                    >
                        <span className="text-xl shrink-0">
                            {dest.emoji ?? "📍"}
                        </span>
                        <div className="flex-1 min-w-0">
                            <button
                              onClick={() => onSelect(dest.city)}
                              className="text-sm font-semibold text-slate-100 hover:text-sky-400
                              transition text-left truncate w-full"
                            >
                                {dest.city}
                            </button>

                            <p className="text-[10px] text-slate-500">
                                {new Date(dest.savedAt).toLocaleDateString(
                                    lang === "ar" ? "ar-AE" : "en-AE",
                                    {day: "numeric", month: "short"}
                                )}
                            </p>
                        </div>

                        <button 
                          onClick={() => onRemove(dest.id)}
                          aria-label={t("removeSaved", lang)}
                          className="shrink-0 rounded-lg p-1.5 text-slate-600
                          hover:text-red-400 transition"   
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


// save btn in header when weather loaded
interface SaveBtnProps {
  city: string;
  isSaved: boolean;
  lang: Lang;
  onSave: () => void;
}

export const SaveBtn = ({city, isSaved, lang, onSave}: SaveBtnProps) => (
    <button
      onClick={onSave}
      disabled={isSaved}
      title={isSaved ? t("saved", lang) : t("saveThis", lang)}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5
        text-xs font-medium transition ${isSaved ? 
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 cursor-default" : 
    "border-slate-700 text-slate-400 hover:border-sky-500 hover:text-sky-400"}`}
    >
        {isSaved ? <><BookmarkCheck size={13} /> {t("saved", lang)}</> 
        : <><Bookmark size={13} /> {t("saveThis", lang)}</>
        }
    </button>
);

export default SavedDestinations;