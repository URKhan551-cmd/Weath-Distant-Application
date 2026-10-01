import {useEffect, useRef} from "react";
import {Send, Bot, Trash2, User} from "lucide-react";
import {quickPrompts, type WeatherContext} from "../Api/geminiApi.ts";
import {useAIChat, type Message} from "../hooks/useAIChat.ts";


// message bubble appears in right botom corner

const MessageBubble = ({msg}: {msg: Message} ) => {
    const isUser = msg.role === "user";

    return (
        <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            {/* avatar */}

            <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center
                rounded-full text-xs ${isUser ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-300"}`}>
                {isUser ? <User size={13} /> : <Bot size={13} />}
            </div>

            {/* bubble */}

            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                ${isUser ? "rounded-tr-sm bg-sky-500 text-white"
                    : "rounded-tl-sm bg-slate-800 text-slate-100"}`}>

                {/* loading dots */}
                {msg.loading && (
                    <div className="flex gap-1 py-1">
                        {[0, 1, 2].map((i) => (
                            <div key={i}
                                className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                )}

                {/*  error if it is */}
                {msg.error && (
                    <p className="text-red-400">⚠️ {msg.error}</p>
                )}

                {/* content line breaks */}
                {!msg.loading && !msg.error && (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                )}

                {/* timestamp dikana ha to idr */}
                {!msg.loading && (
                    <p className={`mt-1 text-[10px] ${isUser ? "text-sky-200" : "text-slate-500"}`}>
                        {msg.timestamp.toLocaleTimeString("en-AE", {
                            hour: "2-digit", minute: "2-digit",
                        })}
                    </p>
                )}
            </div>
        </div>
    );
};



// quick prompt 
const QuickChip = ({ emoji, label, onClick, }: {
    emoji: string; label: string; onClick: () => void;
}) => (
    <button 
        type="button"
        onClick={onClick}
        className="flex shrink-0 items-center gap-1.5 rounded-full
        border border-slate-700 bg-slate-800/60 px-3 py-1.5
        text-xs font-medium text-slate-300 transition hover:border-sky-500
        hover:text-sky-300 active:scale-95">
        <span>{emoji}</span>
        <span>{label}</span>
    </button>
); 


// welcome dekhanan ka screen
const WelcomeScreen = ({ onSelect, location, }:
    {
        onSelect: (prompt: string) => void; 
    location: string;}) => (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full
            border border-sky-500/30 bg-sky-500/10 text-3xl">
                 🤖
            </div>

            <div>
                <h3 className="text-base font-bold text-slate-100">WeatherBoard AI</h3>
                <p className="mt-1 text-xs text-slate-400">
                    Ask me anything about the weather{location ? ` in ${location}` : ""}, 
                    <br />
                    UAE conditions, or  where to go today.
                </p>
            </div>

            {/* quick prompt grid where the question faqs */}
            <div className="mt-2 grid w-full grid-cols-2 gap-2">
                {quickPrompts.slice(0, 6).map((qp) => (
                    <button
                    key={qp.label}
                    onClick={() => onSelect(qp.prompt)}
                    className="rounded-xl border border-slate-700/60
                    bg-slate-800/50 p-3 text-left transition hover:border-sky-500/50 hover:bg-slate-800">
                        <span className="text-xl">{qp.emoji}</span>
                        <p className="mt-1 text-xs font-semibold text-slate-200">{qp.label}</p>
                    </button>
                ))}
            </div>
        </div>
    );



// main AI chat compoennet
    interface AIChatProps {
        weatherContext: WeatherContext;
    }

const AIChat = ({weatherContext}: AIChatProps) => {
    const { messages, inputText, setInputText, isLoading, sendMessages, clearChat,} = useAIChat(weatherContext);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // auto scroll to the new message at bottm 
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if(e.key === "Enter" && e.shiftKey){
            return;
        }
        
        
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            if(isLoading){
                return;
            }

            sendMessages();
        }
    };

    // QUICK Prompt
    const handleQuickPrompt = (prompt: string) => {
      if(isLoading){
        return;
      }
      sendMessages(prompt);

    };

    // input change hota ha to
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setInputText(e.target.value);
    };

    const hasMessage = messages.length > 0;

    return (
        <div className="flex flex-col gap-0 rounded-2xl border border-slate-700/60 bg-slate-900 overflow-hidden " 
        style={{ minHeight: 520 }} >
            {/* header */}

            <div className=" flex items-center justify-between border-b border-slate-700/60 px-4 py-3 " >
            <div className="flex items-center gap-2"> <div className=" flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-base " > 
            🤖 
            </div>
            <div> <p className="text-sm font-bold text-slate-100"> WeatherBoard AI </p> <p className="text-[10px] text-slate-500"> Powered by ggg UAE weather specialist </p> 
            </div> 
            </div>

            {/* clear bbtn */}
            {hasMessage && ( 
                <button 
                type="button" 
                onClick={clearChat} 
                disabled={isLoading} 
                className=" flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[10px] text-slate-400 transition hover:border-red-500/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 " >
            <Trash2 size={11} /> Clear 
            </button> )} 
            </div>

            {/* message area */}

            <div 
            className=" flex-1 overflow-y-auto px-4 py-4 " 
            style={{ maxHeight: 420, minHeight: 320, }} > 
            {!hasMessage ? (
                <WelcomeScreen 
                onSelect={(prompt) => { 
                    if (!isLoading) { 
                        sendMessages(prompt); 
                    } 
                }} 
            location={weatherContext.location} />
         ) : ( <div 
                className="flex flex-col gap-3"
                > 
                {messages.map((msg) => ( 
                    <MessageBubble 
                    key={msg.id} 
                    msg={msg} 
                    /> 
                    ))} 
                    <div ref={bottomRef} /> 
                </div> 
            )}
            </div>

            {/* quickPrompts */}
            {hasMessage && ( 
                <div className=" flex gap-2 overflow-x-auto border-t border-slate-800 px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " >
                    {quickPrompts.map((qp) => ( 
                        <QuickChip 
                        key={qp.label} 
                        emoji={qp.emoji} 
                        label={qp.label} 
                        onClick={() => { 
                            if (!isLoading) { 
                                sendMessages(qp.prompt);
                                 } 
                                 }} 
                                 /> 
                                 ))} 

                    </div> 
                )}

                {/* INput Area */}
                <div className=" border-t border-slate-700/60 px-4 py-3 " >
                 <div className="flex items-end gap-2">
                    <textarea 
                    ref={inputRef} 
                    value={inputText} 
                    onChange={(e) => { 
                        setInputText(e.target.value); 
                    }} 
                    onKeyDown={handleKeyDown} 
                    placeholder="Ask about weather, safety, or where to go..." 
                    disabled={isLoading} 
                    rows={1}
                    className=" min-w-0 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:opacity-50 [field-sizing:content] " 
                    style={{ maxHeight: 120, }} 
                    />

                    {/* send btn */}
                    <button 
                    type="button" 
                    onClick={() => { 
                        if (!isLoading) { 
                            sendMessages(); 
                        } 
                    }} 
                    disabled={ isLoading || !inputText.trim() } 
                    aria-label="Send Message"
                    className=" flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400 text-slate-900 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 " >
                        {isLoading ? ( 
                            <div 
                            className=" h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent " /> )
                             :
                              ( <Send size={16} /> 

                              )} 
                              </button> 
                              </div>

                              {/* keyboard hint */}

                              <p 
                              className="mt-1.5 text-[10px] text-slate-600"> 
                              Enter to send · Shift+Enter for new line 
                              </p> 
                              </div>
                               </div>
    );
};

export default AIChat;
