import { EMIRATES, type EmiratesData} from "../utils/emirates.ts";
import type { Lang } from "../utils/translations.ts";

// type EmirateId = (typeof EMIRATES)[number]["id"];
// this line of code detect the id of emirates where "dubai" "sharjah" and many more but if the string is not equal to the given emirates 
// will cause type error it mean  not any string is allowed just the emirates id string is allowed


interface EmiratesSwitcherProps {
   activeEmirate: string | null;
    onSelect: (emirate: EmiratesData) => void;
    lang?: Lang;
}


const EmiratesSwitcher = ({ activeEmirate, onSelect, lang}: EmiratesSwitcherProps) => {

    return (
        <div className="mb-4">
            {/* yaha label ayega konsa EMirates ha */}
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                 🇦🇪 {lang === "ar" ? "تبديل سريع — إمارات الإمارات" : "Quick Switch — UAE Emirates"}
            </p>

            {/* scrollbar row works great on mobiles */}
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {EMIRATES.map(emirate => {
                    const isActive = activeEmirate === emirate.id;
                    return (
                        <button
                            key={emirate.id}
                            type="button"
                            onClick={() => onSelect(emirate)}
                            aria-pressed={ isActive}
                            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-center transition-all active:scale-95 ${isActive ? "border-sky-500/60 bg-sky-500/15 text-sky-300" : "border-slate-700/60 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:text-slate-200"}`}>
                                <span className="text-lg leading-none">{emirate.emoji}</span>
                                <span className="text-[11px] font-semibold leading-tight whitespace-nowrap">{emirate.name}</span>
                                <span className="text-[10px] leading-tight text-slate-500" dir="rtl">{emirate.arabic}</span>
                            </button>
                    )
                })}
            </div>
        </div>
    )
};

export default EmiratesSwitcher;


// However, because you wrote:

// id: string;

// TypeScript only knows:

// id can be ANY string

// It does not know that the valid IDs are specifically:

// "abu-dhabi"
// "dubai"
// "sharjah"
// "ajman"
// ...

// That's where the difference between your existing interface and the as const approach comes in