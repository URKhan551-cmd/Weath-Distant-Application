// our PHASE 4 CODE 

export type DestinationType = "beach" | "desert" | "city" | "mountain" | "border";

export interface Destination {
    id: string;
    name: string;
    country: string;
    emoji: string;
    type: DestinationType;
    lat: number;
    lon: number;
    city: string;
    tags: string[];
    description: string;
    omanBorder?: boolean;  // optional 
}

export const  DESTINATION: Destination[] = [
    // first heree beaches
    {
    id: "jbr", name: "JBR Beach", country: "UAE", emoji: "🏖️",
    type: "beach", lat: 25.0776, lon: 55.1337, city: "Dubai, UAE",
    tags: ["beach", "swimming", "water sports"],
    description: "Dubai's most popular open beach with dining and entertainment.",
  },
  {
    id: "kitebeach", name: "Kite Beach", country: "UAE", emoji: "🪁",
    type: "beach", lat: 25.1414, lon: 55.1979, city: "Dubai, UAE",
    tags: ["beach", "kite surfing", "fitness"],
    description: "Best spot for kite surfing and outdoor fitness in Dubai.",
  },
  {
    id: "saadiyat", name: "Saadiyat Beach", country: "UAE", emoji: "🐢",
    type: "beach", lat: 24.5431, lon: 54.4337, city: "Abu Dhabi, UAE",
    tags: ["beach", "luxury", "turtles"],
    description: "Natural beach with turtle nesting. Abu Dhabi's most pristine.",
    },
  {
    id: "fujbeach", name: "Fujairah Beach", country: "UAE", emoji: "🌊",
    type: "beach", lat: 25.1219, lon: 56.3500, city: "Fujairah, UAE",
    tags: ["beach", "diving", "snorkeling"],
    description: "East coast beach on the Arabian Sea. Best diving in the UAE.",
  },
  {
    id: "alhamra", name: "Al Hamra Beach", country: "UAE", emoji: "🏝️",
    type: "beach", lat: 25.6912, lon: 55.7852, city: "Ras Al Khaimah, UAE",
    tags: ["beach", "quiet", "resort"],
    description: "Quiet RAK beach away from city crowds. Perfect for relaxing.",
  },

  // if type === "desert"

  {
    id: "desertsafari", name: "Dubai Desert Safari", country: "UAE", emoji: "🏜️",
    type: "desert", lat: 24.8500, lon: 55.5000, city: "Dubai, UAE",
    tags: ["desert", "dune bashing", "camping", "camel"],
    description: "Classic Dubai desert experience — dunes, BBQ, stargazing.",
  },
  {
    id: "liwa", name: "Liwa Crescent", country: "UAE", emoji: "🌅",
    type: "desert", lat: 23.1500, lon: 53.7000, city: "Liwa, UAE",
    tags: ["desert", "mega dunes", "photography"],
    description: "World's tallest dunes. The Empty Quarter. Most dramatic UAE landscape.",
  },
  {
    id: "alain", name: "Al Ain Oasis", country: "UAE", emoji: "🌴",
    type: "city", lat: 24.1917, lon: 55.7606, city: "Al Ain, UAE",
    tags: ["oasis", "heritage", "UNESCO", "cooler"],
    description: "UNESCO oasis city. Cooler than Dubai. Historic forts and falconry.",
  },

  // if type === "mountain"
  {
    id: "jais", name: "Jebel Jais", country: "UAE", emoji: "⛰️",
    type: "mountain", lat: 25.9544, lon: 56.1017, city: "Ras Al Khaimah, UAE",
    tags: ["mountain", "hiking", "coolest", "zipline"],
    description: "UAE's highest peak at 1,934m. Always 10°C cooler than Dubai.",
  },
  {
    id: "hatta", name: "Hatta", country: "UAE", emoji: "🏕️",
    type: "mountain", lat: 24.7936, lon: 56.1167, city: "Hatta, UAE",
    tags: ["mountain", "kayaking", "camping", "cooler", "dam"],
    description: "Dubai's mountain retreat. Hatta Dam kayaking and eco glamping.",
    omanBorder: true,
  },

  // if omanBorder === true then choose these object 
  {
    id: "muscat", name: "Muscat", country: "Oman", emoji: "🕌",
    type: "border", lat: 23.5880, lon: 58.3829, city: "Muscat, Oman",
    tags: ["oman", "capital", "souq", "culture", "5.5h drive"],
    description: "Oman's capital. 5.5h from Dubai. Mutrah Souq and the Grand Mosque.",
    omanBorder: true,
  },
  {
    id: "khasab", name: "Khasab (Musandam)", country: "Oman", emoji: "🚤",
    type: "border", lat: 26.1843, lon: 56.2477, city: "Khasab, Oman",
    tags: ["oman", "fjords", "dhow", "dolphins", "2h drive"],
    description: "Oman's fjords. 2h from Dubai. Dhow cruises with wild dolphins.",
    omanBorder: true,
  },
  {
    id: "sohar", name: "Sohar", country: "Oman", emoji: "⚓",
    type: "border", lat: 24.3400, lon: 56.7400, city: "Sohar, Oman",
    tags: ["oman", "border", "sindbad", "history", "2h drive"],
    description: "Legendary home of Sindbad the Sailor. 2h from Dubai.",
    omanBorder: true,
  },

  {
    id: "nizwa", name: "Nizwa", country: "Oman", emoji: "🏰",
    type: "border", lat: 22.9333, lon: 57.5333, city: "Nizwa, Oman",
    tags: ["oman", "fort", "souq", "dates", "6h drive"],
    description: "Ancient Oman capital. Famous fort and date market. 6h from Dubai.",
    omanBorder: true,
  },
];

// score a destination based on   current weather
export interface DestinationScore {
    id: string;
    score: number; // 0 to 100
    reasons: string[];
    warnings: string[];
} 
export function scoreDestination(
  dest:       Destination,
  temp:       number,
  uvIndex:    number,
  windSpeed:  number,
  precipProb: number,
): DestinationScore {
  let score = 60;
  const reasons:  string[] = [];
  const warnings: string[] = [];
 
  // Temperature
  if (dest.type === "mountain") {
    const estTemp = temp - 10;
    if (estTemp >= 18 && estTemp <= 28) { score += 20; reasons.push("Perfect mountain temperature"); }
    else if (estTemp > 28)              { score += 10; reasons.push("Cooler than the coast");         }
  } else if (dest.type === "beach") {
    if (temp >= 24 && temp <= 32)       { score += 20; reasons.push("Ideal beach temperature");             }
    else if (temp > 38)                 { score -= 25; warnings.push("Too hot — risk of heat exhaustion");  }
    else if (temp < 20)                 { score -= 10; warnings.push("Cool for swimming");                  }
  } else if (dest.type === "desert") {
    if (temp >= 22 && temp <= 30)       { score += 20; reasons.push("Perfect desert conditions");           }
    else if (temp > 42)                 { score -= 35; warnings.push("Dangerously hot for desert");         }
    else if (temp > 36)                 { score -= 15; warnings.push("Very hot — early morning only");      }
  } else {
    if (temp >= 20 && temp <= 32)       { score += 15; reasons.push("Comfortable sightseeing weather");     }
    else if (temp > 38)                 { score -= 10; warnings.push("Very hot for walking around");        }
  }
 
  // UV
  if (uvIndex >= 10)      { score -= 15; warnings.push(`Extreme UV ${uvIndex} — apply SPF 50+`);      }
  else if (uvIndex >= 7)  { score -= 5;  warnings.push(`High UV ${uvIndex} — sunscreen essential`);   }
  else if (uvIndex <= 4)  { score += 5;  reasons.push("Low UV — comfortable sun exposure");           }
 
  // Wind
  if (dest.type === "beach") {
    if (windSpeed > 35)   { score -= 20; warnings.push("Too windy — rough waves expected");            }
    else if (windSpeed > 20) { score -= 5; warnings.push("Moderate wind"); }
    else                  { score += 5;  reasons.push("Light breeze — perfect beach conditions");     }
  } else if (dest.type === "desert") {
    if (windSpeed > 40)   { score -= 20; warnings.push("Sandstorm risk — avoid open desert");         }
  }
 
  // Rain
  if (precipProb > 60)    { score -= 20; warnings.push(`${precipProb}% rain chance`);                 }
  else if (precipProb < 10) { score += 5; reasons.push("Rain-free day"); }
 
  // Oman bonus
  if (dest.omanBorder && temp < 34) { score += 10; reasons.push("Good conditions for the drive"); }
 
  return {
    id:       dest.id,
    score:    Math.max(0, Math.min(100, score)),
    reasons,
    warnings,
  };
}



export function getScoreLabel(score: number): { label: string; color: string; bg: string; emoji: string; } {
    if (score >= 80) return{
        label: "Excellent", emoji: "🟢", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30"
    };

     if(score >= 65)return { label: "Good",          emoji: "🔵", color: "text-sky-400",     bg: "bg-sky-500/10     border-sky-500/30"     };

     if(score >= 45) return { label: "Fair",          emoji: "🟡", color: "text-yellow-400",  bg: "bg-yellow-500/10  border-yellow-500/30"  };

     if(score >= 25) return { label: "Poor",          emoji: "🟠", color: "text-orange-400",  bg: "bg-orange-500/10  border-orange-500/30"  };
    
     // if score is less then 25 then return this object
     return { 
        label: "Not advised",  
        emoji: "🔴", 
         color: "text-red-400",
         bg: "bg-red-500/10     border-red-500/30"

     };
}

// this func will return an object where i do h ave just oman border destination
export function getOmanDestination(): Destination[] {
    return DESTINATION.filter(d => d.omanBorder);
}

export function filterByType(type: DestinationType | "all"): Destination[] {
    if(type === "all")return DESTINATION;  // if type = all mean full arr return 

 return DESTINATION.filter(d => d.type === type); // final retrn when the given type should be equal to destination arr type
}
 