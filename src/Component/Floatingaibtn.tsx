import {useState, useEffect, useRef} from "react";
import {Bot, X, ChevronDown} from "lucide-react";
import {Send} from "lucide-react";
import {useAIChat} from "../hooks/useAIChat.ts";
import {quickPrompts, type WeatherContext} from "../Api/geminiApi.ts";
import type {Message} from "../hooks/useAIChat.ts";


const MiniMessage = ({ msg }: { msg: Message }) => {
    const isUser = msg.role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed
                ${isUser ? "rounded-tr-sm bg-sky-500 text-white"
                    : "rounded-tl-sm bg-slate-700 text-slate-100"}`}>
                {msg.loading && (
                    <div className="flex gap-1 py-0.5">
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                                style={{ animationDelay: `${i * 0.5}s` }}
                            />
                        ))}
                    </div>
                )}

                {msg.error && <p className="text-red-400">⚠️ {msg.error}</p>}
                {!msg.loading && !msg.error && (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
            </div>
        </div>
    );
};

// Drawer slides design
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  weatherContext: WeatherContext;
}

const AIChatDrawer = ({isOpen, onClose, weatherContext}: DrawerProps) => {
    const {
        messages, inputText, setInputText,
        isLoading, sendMessages, clearChat, 
    } = useAIChat(weatherContext);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") sendMessages();
    };

    const hasMessage = messages.length > 0;
console.log("message nahi ha floatbtn ma:", hasMessage)
    return (

        <>
        {/* backdrop down  */}
        {isOpen && (
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
             onClick={onClose}
            />
        )}

        {/* drwaerr */}
            <div className={`fixed bottom-0 right-0 z-50 flex w-full flex-col
                rounded-t-2xl border-t border-slate-700 bg-slate-900
                shadow-2xl transition-transform duration-300 ease-out
                sm:bottom-20 sm:right-4 sm:w-96 sm:rounded-2xl sm:border
                ${isOpen ? "translate-y-0" : "translate-y-full sm:translate-y-[110%]"}`}
                    style={{maxHeight: "75vh"}}
                >
                    {/* header ka div  */}
                   <div className="flex items-center justify-between border-b
                   border-slate-700/60 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🤖</span>
                        <div>
                            <p className="text-sm font-bold text-slate-100">Ask AI</p>
                            <p className="text-[10px] text-slate-500">
                                {weatherContext.location ? `Weather in ${weatherContext.location}` : "UAE weather assistant"}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {hasMessage && (
                            <button 
                             onClick={clearChat}
                             className="rounded-lg border border-slate-700 px-2 py-1
                             text-[10px] text-slate-400 hover:text-red-400"
                            >Clear</button>
                        )}
                        <button 
                          onClick={onClose}
                          className="flex h-7 w-7 items-center justify-center rounded-full
                          bg-slate-800 text-slate-400 hover:text-slate-200"
                        >
                            <X size={14} />
                        </button>
                    </div>
                   </div>

                   {/* messages show here  */}
                       <div className="flex-1 overflow-y-auto px-4 py-3">
                        {!hasMessage ? (
                            <div className="flex flex-col gap-2">
                                <p className='text-center text-xs text-slate-500'>
                                    Quick questions about your current weather 👇
                                </p>

                                <div className="grid grid-cols-2 gap-2">
                                    {quickPrompts.slice(0, 4).map(qp => (
                                        <button 
                                         key={qp.label}
                                         onClick={() => sendMessages(qp.prompt)}
                                         className="rounded-xl border border-slate-700/60 bg-slate-800/60
                                         p-3 text-left transition hover:border-sky-500/50"
                                        >
                                            <span className="text-lg">{qp.emoji}</span>
                                            <p className="mt-1 text-[11px] font-semibold text-slate-200">
                                                {qp.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {messages.map(msg => (
                                    <MiniMessage key={msg.id} msg={msg} />
                                ))}
                                <div ref={bottomRef} />
                            </div>
                        )}
                        </div> 
                                      {/* Quick chips prompts */}

                                      {hasMessage && (
                                        <div className="flex gap-1.5 overflow-x-auto border-t border-slate-800
                                        px-4 py-2 [scrollbar-width:none]
                                      [&::-webkit-scrollbar]:hidden">
                                        {quickPrompts.slice(0, 6).map(qp => (
                                            <button 
                                             key={qp.label}
                                             onClick={() => sendMessages(qp.prompt)}
                                             className="flex shrink-0 items-center gap-1 rounded-full 
                                             border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[10px] text-slate-300
                                             hover:border-sky-500
                                             hover:text-sky-300"
                                            >
                                                {qp.emoji} {qp.label}
                                            </button>
                                        ))}
                                      </div>
                                      )}

                                      {/* input fields */}
                                      <div className="border-t border-slate-700/60 px-4 py-3">
                                      <div className="flex gap-2">
                                        <input
                                          value={inputText}
                                          onChange={(e) => setInputText(e.target.value)}
                                          onKeyDown={handleKeyDown}
                                          placeholder="Ask a quick question..."
                                          disabled={isLoading}
                                          className="min-w-0 flex-1 rounded-xl border border-slate-700
                                          bg-slate-800 px-3 py-2 text-sm text-slate-100
                                          placeholder:text-slate-500 focus:border-sky-500
                                          focus:outline-none disabled:opacity-50"
                                        />
                                        <button 
                                        onClick={() => sendMessages()}
                                        disabled={isLoading || !inputText.trim()}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl
                                        bg-sky-400 text-slate-900 hover:bg-sky-300
                                        disabled:opacity-40 active:scale-95"
                                        >
                                            {isLoading ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2
                                            border-slate-900 border-t-transparent" /> : <Send size={14} />
                            }
                                        </button>
                                      </div>
                                      </div>
                    </div>
        </>
    );
};



// floatingbtn
interface FloatingAIBtnProps {
    weatherContext: WeatherContext;
    hidden?: boolean;    // when ai tab open this hsould be close
}


const FloatingAIBtn = ({weatherContext, hidden = false} : FloatingAIBtnProps) => {

    const [isOpen, setIsOpen] = useState(false);
    if(hidden) return null;

    return (
        <>
     <button 
     type="button"
     onClick={() => setIsOpen(v => !v)}
     aria-label="Open AI assistant"
      className={`fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center
        justify-center rounded-full shadow-lg shadow-sky-500/20
        transition-all duration-200 active:scale-95
        ${isOpen ? "bg-slate-700 text-slate-300 rotate-0"
    : "bg-sky-400 text-slate-900 hover:bg-sky-300"} 
    sm: bottom-6 sm:right-6`}
     >
     {isOpen ? <ChevronDown size={22} /> 
     : (
        <div className="relative">
            <Bot size={22} />
            {/* active when pulsing */}
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping
                rounded-full bg-sky-300 opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-400"></span>
            </span>
        </div>
     )}

     </button>

    <AIChatDrawer 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
    weatherContext={weatherContext} 
    />
</>
    );

};

export default FloatingAIBtn