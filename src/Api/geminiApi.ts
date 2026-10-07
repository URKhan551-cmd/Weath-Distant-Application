// SDK. This handles everything on the frontend: 
// structured prompting, request state management, empty checking, network failures, and API error parsing
// import {GoogleGenAI} from "@google/genai";
// import type {VisualCrossingWeatherData} from "./weatherHelper.ts";



// gemini api integration 
export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

// shape of the data we pass as context interface define
export interface WeatherContext { 
    location: string;
    emirate?: {name: string; arabic: string} | null;
    current?: {
        temp: number;
        feelslike: number;
        humidity: number;
        windspeed: number;
        uvindex: number;
        visibility: number;
        precipprob: number;
        conditions: string;
        pressure: number;
        dew: number;
    } | null;
}

// expected response type
export interface ApiResponseResult {
    success: boolean;
    answer?: string;
    error?: string; 
}


// systemPrompt inject live weather data as our AI knows
// exactly what conitions the user is looking at right now.
// how the AI should design the response here this function 
// elaborate the specification our response haas and with style and many more.
export function buildSystemPrompt(weatherContext: WeatherContext): string {
    const {location, current, emirate} = weatherContext;

    const currentBlock = current ? `
CURRENT CONDITIONS at ${location}:
- Temperature:  ${current.temp}°C (feels like ${current.feelslike}°C)
- Humidity:     ${current.humidity}%
- Wind speed:   ${current.windspeed} km/h
- UV index:     ${current.uvindex}
- Visibility:   ${current.visibility} km
- Rain chance:  ${current.precipprob}%
- Conditions:   ${current.conditions}
- Pressure:     ${current.pressure} hPa
- Dew point:    ${current.dew}°C
`
    : "No weather data loaded yet.";

    const emirateBlock = emirate ? `\nUSER IS IN: ${emirate.name} (${emirate.arabic}), UAE` : "";


    return `You are WeatherBoard AI — a smart, friendly weather and travel assistant
specialised for the UAE and surrounding region (Oman, GCC countries).
 
${emirateBlock}
 
${currentBlock}
 
YOUR SPECIALTIES:
1. Weather explanation — explain what current conditions mean in plain language
2. Heat safety — UAE-specific advice for extreme heat (40°C+), humidity, UV
3. Sandstorm guidance — what to do before/during/after a shamal or dust storm
4. Activity safety — is it safe to jog, hike, go to the beach, drive desert roads?
5. Destination recommendations — which UAE emirate or Oman destination is best today?
6. Trip planning — help plan day trips from Dubai/Abu Dhabi with weather in mind
7. Personalized suggestions — morning jog time, best beach day this week, etc.

UAE-SPECIFIC KNOWLEDGE:
- UAE summer (May–Sep): extreme heat 40–50°C, high humidity, UV 10–12
- UAE winter (Oct–Apr): pleasant 18–28°C, tourist season, occasionally foggy
- Shamal wind: NW wind that causes sandstorms, reduces visibility sharply
- Road fog: deadly in UAE winter mornings — major cause of accidents
- Oman trips: Khasab (2h), Hatta (1.5h), Muscat (5.5h) from Dubai
- Beach safety: jellyfish season Apr–Jun, rough seas Nov–Feb on west coast
- Ramadan: outdoor eating/drinking rules apply sunrise to sunset
 
RESPONSE STYLE:
- Be concise and direct — mobile users read on the go
- Use emojis naturally but not excessively
- Always give a clear recommendation or action
- For safety topics be firm and specific
- Never make up weather data — only use the data provided above
- If asked about something you do not have data for, say so clearly
 
Current date/time context: ${new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai" })} (UAE time)`;
}



export const quickPrompts: { label: string; prompt: string; emoji: string }[] = [
    {
    emoji: "🌡️",
    label: "Is it safe outside?",
    prompt: "Is it safe to go outside right now? What are the risks?",
  },
  {
    emoji: "🏃",
    label: "Best time to jog",
    prompt: "What is the best time today to go jogging outside safely?",
  },
  {
    emoji: "🏖️",
    label: "Beach conditions",
    prompt: "Are beach conditions good today? Which beach do you recommend?",
  },
  {
    emoji: "🏜️",
    label: "Desert safe?",
    prompt: "Is it safe to go to the desert today for dune bashing or camping?",
  },
  {
    emoji: "🌪️",
    label: "Sandstorm risk",
    prompt: "Is there any sandstorm or dust storm risk today? What should I do?",
  },
  {
    emoji: "🚗",
    label: "Road conditions",
    prompt: "How are road visibility and driving conditions right now?",
  },
  {
    emoji: "🇴🇲",
    label: "Oman trip today?",
    prompt: "Is the weather good for a day trip to Oman today? Which destination?",
  },
  {
    emoji: "☀️",
    label: "UV & sunscreen",
    prompt: "How dangerous is the UV today and what SPF should I use?",
  },
  {
    emoji: "🌤️",
    label: "Week outlook",
    prompt: "Summarize the weather outlook and best days to go outside this week.",
  },
  {
    emoji: "🏔️",
    label: "Mountain escape",
    prompt: "Would Jebel Jais or Hatta be a good escape from this heat today?",
  },
];




// handle gemini call directly from client
// Main api call where we send systemPrompt and conversation history to AI
export async function sendToGoogleApi(
  messages:       ChatMessage[],
  weatherContext: WeatherContext,
): Promise<ApiResponseResult> {
 
  // Basic client-side checks before even hitting the network
  if (!messages || messages.length === 0) {
    return { success: false, error: "No messages to send." };
  }
  if (!weatherContext) {
    return { success: false, error: "Weather data is unavailable. Please load weather data first." };
  }
 
  // Convert frontend message format → what our proxy expects
  // Our proxy uses "model" for assistant (Gemini format)
  const formattedMessages = messages.map((m) => ({
    role:    m.role === "assistant" ? "model" : "user",
    content: m.content,
  }));
 
  try {
    //  POST to OUR proxy — no key in this request at all
    const response = await fetch("/api/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        messages:       formattedMessages,
        weatherContext,
      }),
    });
 
    // Handle rate limit specifically — show user how long to wait
    if (response.status === 429) {
      const data = await response.json() as { error?: string; resetIn?: number };
      return {
        success: false,
        error:   data.error ?? "Too many AI requests. Please wait and try again.",
      };
    }
 
    if (!response.ok) {
      const data = await response.json() as { error?: string };
      return {
        success: false,
        error:   data.error ?? `AI service error (${response.status})`,
      };
    }
 
    const data = await response.json() as { answer?: string; error?: string };
 
    if (!data.answer) {
      return { success: false, error: "The AI returned an empty response." };
    }
 
    return { success: true, answer: data.answer };
 
  } catch (err: unknown) {
    // Network error — likely offline
    if (!navigator.onLine) {
      return { success: false, error: "You are offline. Please check your internet connection." };
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `Network error: ${message}` };
  }
}
 
// Kept for backwards compatibility — same as sendToGoogleApi
// export { sendToGoogleApi };
 