import {WifiOff, X} from "lucide-react";
import type {Lang} from "../utils/translations.ts";

interface OfflineBannerProps {
   show: boolean;
   lang: Lang;
   onClose: () => void;
}

const OfflineBanner = ({show, lang, onClose}:  OfflineBannerProps) => {
    if(!show) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] flex items-center
        justify-between gap-3 bg-slate-800 px-4 py-3
        border-b border-slate-700 shadow-lg">
            <div className="flex items-center gap-2">
                <WifiOff size={15} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-slate-200">
                    {lang === "ar" 
                    ?  "أنت غير متصل — يتم عرض بيانات الطقس المخزنة مؤقتاً" :
                     "You are Offline - showing cached weather data"}
                </p>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200"
            >
                <X size={14} />
            </button>
        </div>
    )
};

export default OfflineBanner;