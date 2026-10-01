// here we will mostly do some physics works 
// formulas like HAVERSINE which is used to calc distance between two points in KM
// Haversine formula
export function calcDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const radius = 6371;
  const diameterLat = toRad(lat2 - lat1);
  const diameterLon = toRad(lon2 - lon1);
  const a =
    Math.sin(diameterLat / 2) * Math.sin(diameterLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(diameterLon / 2) *
      Math.sin(diameterLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(radius * c);
}

// degrees
//   ↓
// toRad()
//   ↓
// radians
//   ↓
// Math.sin / Math.cos    these two methods works on radian not degree but we first get the dference in degree so we need to get radian  

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// build google map navigation link from coords
export function buildNavLink(lat: number, lon: number, label?: string): string {
    const dest = `${lat},${lon}`;
    const base = "https://www.google.com/maps/dir/?api=1";
    return label ? `${base}&destination=${encodeURIComponent(dest)}`
        : `${base}&destination=${dest}`;
};


// here we wil build google map search link
export function buildMapLink(lat: number, lon: number): string {
    return `https://www.google.com/maps?q=${lat},${lon}`;
};



export type VisibilityLevel = "good" | "moderate" | "poor" | "dangerous";

export interface VisibilityWarning  {
   level: VisibilityLevel;
   label: string;
   detail: string;
   color: string;
    bg: string;
}

export function getRoadVisibility(
    visibility: number, // km
    conditions: string,
    windSpeed: number,  // that will be km/h
    humidity: number // % in number   

): VisibilityWarning {
  const cond = conditions.toLowerCase();

  // for sandStorm or dust in the air dangerous in uae.
  const isSandstorm = cond.includes("dust") || cond.includes("sand") || cond.includes("haze") || (windSpeed > 50 && humidity < 40);

  // for fog inthe uae
  const isFog = cond.includes("fog") || (visibility < 1 && humidity > 80);

    // Rain causes road flood inthe uae
  const isRain = cond.includes("rain") || cond.includes("shower");

    if (isSandstorm && visibility < 1) {
        return {
            level: "dangerous",
            label: "🚨 Sandstorm — Do Not Drive",
            detail: "Visibility below  1km. Extreme danger. Pull over and Wait.",
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/40",
        };
    }

    if (isFog && visibility < 0.5) {
        return {
            level: "dangerous",
            label: "🚨 Dense Fog — Do Not Drive",
            detail: "Visibility below 500m. Use hazard lights or wait.",
            color: "text-red-300",
            bg: "bg-red-500/10 border-red-500/40",
        };
    }

    if(isSandstorm || (visibility < 3)){
        return {
            level: "poor",
            label: "⚠️ Poor Visibility",
            detail: "Reduce Speed. Use Headlights. Avoid desert roads.",
            color: "text-orange-300",
            bg: "bg-orange-500/10 border-orange-500/40",
        };
    }

    if (isRain || isFog || visibility < 6) {
        return {
            level: "moderate",
            label: "🟡 Moderate — Drive Carefully",
            detail: "Wet roads likely. Increase following distance.",
            color: "text-yellow-300",
            bg: "bg-yellow-500/10 border-yellow-500/40",
        };
    }

    return {
        level: "good",
        label: "✅ Good Visibility",
        detail: "Clear road conditions, Drive normally.",
        color: "text-emerald-300",
        bg: "bg-emerald-500/10 border-emerald-500/40",
    };
}


// desert zone condition rates

export interface DesertCondition {
    safe: boolean;
    label: string;
    detail: string;
    color: string;
    bg: string;
}

export function getDesertCondition(
    temp: number,
    uvIndex: number,
    windSpeed: number,
    humidity: number
): DesertCondition { 

    const isTooHot = temp > 42;
    const isHighUV = uvIndex >= 9;
    const isSandRisk = windSpeed > 40 && humidity < 35;

    if (isTooHot && isHighUV) {
        return {
            safe: false,
            label: "🚫 Unsafe for Desert Activities",
            detail: `${temp}°C with UV ${uvIndex}. Risk of heat stroke and severe sunburn.`,
            color: "text-red-300",
            bg: "bg-red-500/10 border-red-500/40",
        };
    }

    if (isSandRisk) { 
        return {
            safe: false,
            label: "⚠️ Sandstorm Risk",
            detail: `Wind ${windSpeed} km/h with low humidity. Avoid open desert.`,
            color: "text-orange-300",
            bg: "bg-orange-500/10 border-orange-500/40",
        };
    }

    if(isTooHot || isHighUV){
        return {
            safe: false,
            label: "⚠️ Caution — Extreme Heat",
            detail: "Early morning or evening visits only. Bring 3L+ water.",
            color: "text-yellow-300",
            bg: "bg-yellow-500/10 border-yellow-500/40",
        };
    }

    return {
        safe: true,
        label: "✅ Good Desert Conditions",
        detail: "Suitable for dune bashing, camping, and hiking.",
        color: "text-emerald-30",
        bg: "bg-emerald-500/10 border-emerald-500/40",
    };
}


export interface BeachCondition {
    label: string;
    detail: string;
    color: string;
    bg: string;
}

export function getBeachCondition(
    temp: number,
    uvIndex: number,
    windSpeed: number,
    precipProb: number
): BeachCondition {
    if (precipProb > 60) {
        return {
            label: "🌧️ Not Ideal — Rain Expected",
            detail: `${precipProb}% chance of rain. Beach activities not recommended.`,
            color: "text-slate-300",
            bg: "bg-slate-500/10 border-slate-500/40",
        };
    }

    if(windSpeed > 35){
        return {
            label: "💨 Very Windy",
            detail: `${windSpeed} km/h winds. Expect rough condition and sand.`,
            color: "text-orange-300",
            bg: "bg-orange-500/10 border-orange-500/40",
        };
    }

    if(temp >= 24 && temp <= 35 && uvIndex <= 8){
        return {
            label: "✅ Great Beach Day",
            detail: `${temp}°C, UV ${uvIndex}. Wear SPF 50+ and stay hydrated.`,
            color: "text-emerald-300",
            bg: "bg-emerald-500/10 border-emerald-500/40",
        };
    }

    return {
        label: "🟡 Acceptable Conditions",
        detail: `${temp}°C. Manageable but not ideal. Sunscreen essential.`,
        color: "text-yellow-300",
        bg: "bg-yellow-500/10 border-yellow-500/40",
    };
 }