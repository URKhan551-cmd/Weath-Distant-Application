// DETECT dangerous weather conditions and returns alert objects

import {useState, useMemo, useCallback} from "react";
export type AlertLevel = "danger" | "warning" | "info";
export type  AlertType = "sandstorm" | "fog" | "heat" | "rain" | "uv";

export interface WeatherAlert {
    id: string;
    type: AlertType;
    level: AlertLevel;
    titleEn: string;
    titleAr: string;
    bodyEn: string;
    bodyAr: string;
    color: string;
    bg: string;
    emoji: string;
}

interface AlertInput {
    temp: number;
    feelslike: number;
    humidity: number;
    windspeed: number;
    uvindex: number;
    visibility: number;
    precipprob: number;
    conditions: string;
}

export function useAlerts(current: AlertInput | null){
    const [dismissed, setDismissed] = useState<set<string>>(new Set());

    const dismiss = useCallback(
      (id: string) => {
        setDismissed(prev => new Set([...prev, id]));
      },
      [],
    );

    const dismissAll = useCallback(
      () => {
        setDismissed(new Set(alerts.map(a => a.id)));
      },
      [],
    );

    const alerts = useMemo((): WeatherAlert[] => {
        if(!current) return [];
        const result: WeatherAlert[] = [];
        const cond = current.conditions.toLowerCase();

        // sandstorm UAE add
        const isSandstorm = cond.includes("dust") || cond.includes("sand") || cond.includes("haze") ||
        (current.windspeed > 50 && current.humidity < 35 && current.visibility < 5);

        if(isSandstorm){
            result.push({
                id: "sandstorm",
                type: "sandstorm",
                level: current.visibility < 1 ? "danger" : "warning",
                emoji: "🌪️",
                titleEn: current.visibility < 1 ? "Sandstorm-Do Not Drive" : "Sandstorm Warning",
                titleAr: current.visibility < 1 ? "عاصفة رملية — لا تقود" : "تحذير عاصفة رملية",
                bodyEn: current.visibility < 1 ? 
                "Visibility below 1km. Pull over immediately. Turn on hazard lights."
          : `Dust conditions. Visibility ${current.visibility}km. Drive carefully, close windows.`,
          bodyAr: current.visibility < 1
          ? "الرؤية أقل من 1 كم. توقف على الفور. شغّل أضواء الطوارئ."
          : `ظروف غبارية. الرؤية ${current.visibility} كم. قُد بحذر وأغلق النوافذ.`,
          color: "text-orange-300",
          bg: "bg-orange-500/15 border-orange-500/40",
            });
        }

        const isFog = cond.includes("fog") || (current.visibility < 1 && current.humidity > 75 && !isSandstorm);

        if(isFog){
            result.push({
                id: "fog",
                type: "fog",
                level: current.visibility < 0.3 ? "danger" : "warning",
                emoji: "🌫️",
                titleEn: "Fog Warning-- Drive with Caution",
                titleAr: "تحذير ضباب — قُد بحذر",
                bodyEn: `Visibility ${current.visibility}km. Use fog lights. Major accident risk on UAE highways.`,
                bodyAr:  `الرؤية ${current.visibility} كم. استخدم أضواء الضباب. خطر الحوادث على الطرق السريعة.`,
                color: "text-slate-300",
                bg: "bg-slate-500/15 border-slate-500/40",

            });
        }

        // Extreme heat uae
        if(current.temp > 43 || current.feelslike >= 50){
            result.push({
                id: "heat",
                type: "heat",
                level: "danger",
                emoji: "🌡️",
                titleEn: "Extreme Heat Warning",
                titleAr: "تحذير حرارة شديدة",
                bodyEn: `${current.temp}°C (feels ${current.feelslike}°C). Risk of heat stroke. Stay indoors. Do not exercise outside.`,
                bodyAr: `${current.temp}°C (يبدو ${current.feelslike}°C). خطر ضربة الشمس. ابقَ في الداخل. لا تتمرن في الخارج.`,
                color: "text-red-300",
                bg: "bg-red-500/15 border-red-500/40",

            });
        } else if(current.temp >= 38){
            result.push({
                id: "heat-warn",
                type: "heat",
                level: "warning",
                emoji: "☀️",
                titleEn: "High Heat - Take Precautions",
                titleAr: "حرارة مرتفعة — احتياطات ضرورية",
                bodyEn: `${current.temp}°C outside. Stay hydrated. Limit outdoor activity to early morning or evening.`,
                bodyAr: `${current.temp}°C في الخارج. اشرب الماء. قلّل النشاط الخارجي للصباح الباكر أو المساء.`,
                color: "text-yellow-300",
                bg: "bg-yellow-500/15 border-yellow-500/40",
            });
        }

        // UV extreme
        if(current.uvindex >= 11){
            result.push({
                id: "uv",
                type: "uv",
                level: "warning",
                emoji: "🔆",
                titleEn: "Extreme UV - Skin Burns Fast",
                titleAr: "أشعة فوق بنفسجية شديدة — الجلد يحترق بسرعة",
                bodyEn: `UV index ${current.uvindex}. Unprotected skin can burn in under 7 minutes. SPF 50+ essential.`,
                bodyAr: `مؤشر الأشعة ${current.uvindex}. البشرة غير المحمية تحترق في أقل من 7 دقائق. واقٍ شمسي 50+ ضروري.`,
                color: "text-purple-300",
                bg: "bg-purple-500/15 border-purple-500/40",
            });
        }

        // Rain
        if(current.precipprob >= 70){
            result.push({
                id: "rain",
                type: "rain",
                level: "info",
                emoji: "🌧️",
                titleEn: "Rain Expected",
                titleAr: "متوقع هطول مطر",
                bodyEn: `${current.precipprob}% chance of rain. UAE roads can flood quickly — drive carefully.`,
                bodyAr: `${current.precipprob}% احتمال مطر. الطرق قد تفيض بسرعة — قُد بحذر.`,
                color: "text-sky-300",
                bg: "bg-sky-500/15 border-sky-500/40",
            });
        }

        return result;
    }, [current]);
    
    const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));
    return {alerts: visibleAlerts, dismiss, dismissAll};
    
}