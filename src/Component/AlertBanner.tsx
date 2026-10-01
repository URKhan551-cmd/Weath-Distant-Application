import {X, AlertTriangle} from "lucide-react";
import type {WeatherAlert} from "../hooks/useAlerts.ts";
import type {Lang} from "../utils/translations.ts";
import {t} from "../utils/translations.ts";

interface AlertBannerProps {
    alerts: WeatherAlert[];
    lang: Lang;
    onDismiss: (id: string) => void;
}

const AlertBanner = ({alerts, lang, onDismiss}: AlertBannerProps) => {
    if(alerts.length === 0) return null;

    return (
        <div className="mb-3 flex flex-col gap-2">
         {alerts.map((alert) => (
            <div
              key={alert.id}
              role="alert"
              className={`flex items-start gap-3 rounded-xl border 
                px-4 py-3 ${alert.bg} animate-in fade-in duration-300`}
            >
                <span className="mt-0.5 text-xl shrink-0">{alert.emoji}</span>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${alert.color}`}>
                        {lang === "ar" ? alert.bodyAr : alert.bodyEn}
                    </p>
                </div>

                <button 
                  onClick={() => onDismiss(alert.id)}
                  aria-label={t("alertDismiss", lang)}
                  className="shrink-0 rounded-lg p-1 text-slate-500 hover:text-slate-300 transition"
                >
                    <X size={14} />
                 </button>
            </div>
         ))}
        </div>
    )
}

export default AlertBanner;