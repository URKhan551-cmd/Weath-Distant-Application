// UAE EMIRATES DATA
// Each emirate has:
//   - id, name, arabic name
//   - a default search city
//   - bounding box [minLat, maxLat, minLon, maxLon] for coordinate detection
// ─────────────────────────────────────────────────────────────────────────────
import {calcDistance} from "./mapHelpers.ts";
interface EmiratesData {
    id: string;
    name: string;
    arabic: string;
    city: string;
    emoji: string;
    bounds: BoundingBox;
    lat: number;
    lon: number;
    beachConditions?: string;
    desertZone?: boolean;
    coastline?: boolean;
}

interface BoundingBox {
   minLat: number;
   maxLat: number;
   minLon: number;
    maxLon: number;
}

export const EMIRATES: EmiratesData[] = [
  {
    id:      "dubai",
    name:    "Dubai",
    arabic:  "دبي",
    city:    "Dubai, UAE",
    emoji:   "🏙️",
    lon: 55.2708,
    lat: 25.2048,
    bounds: { minLat: 24.79, maxLat: 25.36, minLon: 55.07, maxLon: 55.57 },
    beachConditions: "Jumeirah Beach · JBR · Kite Beach",
    coastline: true,
  },
  {
    id:      "abudhabi",
    name:    "Abu Dhabi",
    arabic:  "أبوظبي",
    city:    "Abu Dhabi, UAE",
    emoji:   "🕌",
    lat: 24.4539,
    lon: 54.3773,
    bounds:  { minLat: 22.60, maxLat: 24.25, minLon: 51.60, maxLon: 55.10 },
    beachConditions: "Corniche Beach · Saadiyat Beach",
    coastline: true,
  },
  {
    id:      "sharjah",
    name:    "Sharjah",
    arabic:  "الشارقة",
    city:    "Sharjah, UAE",
    emoji:   "🏛️",
    lat: 25.3462,
    lon: 55.4209,
    bounds:  { minLat: 25.17, maxLat: 25.55, minLon: 55.30, maxLon: 55.65 },
    coastline: true,
  },
  {
    id:      "ajman",
    name:    "Ajman",
    arabic:  "عجمان",
    city:    "Ajman, UAE",
    emoji:   "🌊",
    lat: 25.4502,
    lon: 55.5136,
    bounds:  { minLat: 25.38, maxLat: 25.47, minLon: 55.42, maxLon: 55.54 },
    coastline: true,
  },
  {
    id:      "rak",
    name:    "Ras Al Khaimah",
    arabic:  "رأس الخيمة",
    city:    "Ras Al Khaimah, UAE",
    emoji:   "⛰️",
    lat: 25.7895,
    lon: 55.9432,
    bounds:  { minLat: 25.55, maxLat: 25.90, minLon: 55.70, maxLon: 56.15 },
    beachConditions: "Al Hamra Beach · Marjan Island",
    coastline: true,
    desertZone: true,
  },
  {
    id:      "fujairah",
    name:    "Fujairah",
    arabic:  "الفجيرة",
    city:    "Fujairah, UAE",
    emoji:   "🏔️",
    lat: 25.1288,
    lon: 56.3265,
    bounds: { minLat: 25.00, maxLat: 25.40, minLon: 56.15, maxLon: 56.50 },
    beachConditions: "Fujairah Beach · Sandy Beach",
    coastline: true,
  },
  {
    id:      "uaq",
    name:    "Umm Al Quwain",
    arabic:  "أم القيوين",
    city:    "Umm Al Quwain, UAE",
    emoji:   "🎣",
    lat: 25.5647,
    lon: 55.5554,
    bounds:  { minLat: 25.47, maxLat: 25.58, minLon: 55.52, maxLon: 55.65 },
    coastline: true,
  },
];

export function detectEmirate(lat: number, lon: number): EmiratesData | null {
    if(!isInsideUAE(lat, lon)){
      return null;
    }

    let nearestEmirate: EmiratesData | null = null;
    let shortestDistance = Infinity;

    for (const emirate of EMIRATES){
      const distance = calcDistance(lat, lon, emirate.lat, emirate.lon);

      if(distance < shortestDistance){
        shortestDistance = distance;
        nearestEmirate = emirate;
      }
    }

    return nearestEmirate;
}



// if the range of longitude and latotude is among theses values will lie inside the UAE.
// otherwise not in the UAE.
export function isInsideUAE(lat: number, lon: number): boolean {
    return lat >= 22.5 && lat <= 26.1 && lon >= 51.5 && lon <= 56.5;
}