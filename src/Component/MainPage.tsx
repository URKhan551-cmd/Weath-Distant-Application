import myimage from "../assets/my-image.jpeg";
import type { MouseEventHandler} from "react";

interface MainPageProps {
    onClick: MouseEventHandler<HTMLButtonElement>;
}


// whatsapp style msg box
interface ChatBubbleProps {
    imageSrc: string;
    name: string;
    message: string;
    time?: string;
}

export const ChatBubble = ({imageSrc, name, message, time}: ChatBubbleProps) => {
    return (
        <div className="flex items-end gap-2 text-left">
            <img 
             src={imageSrc}
             alt={name}
             className="h-10 w-10 shrink-0 rounded-full border-2 border-sky-400
             object-cover"
            />

            {/*  bubble with small tail at the bottom */}
            <div className="relative max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-800
            px-4 py-3 shadow-md">
                <p className="mb-1 text-xs font-semibold text-sky-400">{name}</p>
                <p className="text-sm leading-relaxed text-slate-200">{message}</p>
                {time && (
                    <span className="mt-1 block text-right text-[10px] text-slate-500">
                        {time}
                    </span>
                )}
            </div>
        </div>
    );
};



const MainPage = ({onClick}: MainPageProps) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-fuchsia-600 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
                <div className="mb-4 text-6xl" aria-hidden="true">🌤</div>

                <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-100">
                    Weather Board
                </h1>
                <p className="mb-8 text-sm leading-relaxed text-slate-400">
                    Live Weather . 15-day forecast . Hourly breakdown
                </p>

                 
                 {/* chat msg of mine  */}
                  <div className="mb-8">
                    <ChatBubble 
                      imageSrc={myimage}
                      name="Ur Rehman"
                      message="Hey! I built a smart weather app that knows what is coming
                      before you step outside. Pick your destination and plan your day with confidence.☔️☀️"
                                    
                       />
                  </div>

                <button 
                    type="button"
                    onClick={ onClick }
                    className="w-full rounded-xl bg-sky-400 py-3 text-base font-bold text-slate-900 transition hover:bg-sky-300 active:scale-95"
                >Check The Weather</button>
            </div>
        </div>
    )
}
export default MainPage;