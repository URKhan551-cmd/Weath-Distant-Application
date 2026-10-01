import {useState, useRef, useCallback} from "react";
import {sendToGoogleApi, type ChatMessage, type WeatherContext} from "../Api/geminiApi.ts";


export interface Message extends ChatMessage {
    id: string;
    timestamp: Date;
    loading?: boolean;
    error?: string | null;
}

export function useAIChat(weatherContext: WeatherContext){

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // used to ignore an old request after clearChat();
    const abortRef = useRef<boolean>(false);

    // keep the latest message available without making
    // sendMessages depends on "messages".
    const messagesRef = useRef<Message[]>([]);
    // unique id for each msg
    const makeId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const updateMessages = (updater: (prev:Message[]) => Message[]) => {
        setMessages(prev => {
            const next = updater(prev);
            messagesRef.current = next;
            return next;
        })
    }


    // const sendMessages = useCallback( async (text?:string) => {
    //     const content = (text ?? inputText).trim();
    //     if(!content || isLoading) return;

    //     setInputText("");
    //     abortRef.current = false;

    //     // add msg of the user
    //     const userMsg: Message = {
    //         id: makeId(),
    //         role: "user",
    //         content,
    //         timestamp: new Date(),
    //     };

    //     // placeholder for loading an asssitant
    //     const loadingId = makeId();
    //     const loadingMsg: Message = {
    //         id: loadingId,
    //         role: "assistant",
    //         content: "",
    //         timestamp: new Date(),
    //         loading: true,
    //     };


    //     updateMessages(prev => [
    //         ...prev,
    //         userMsg,
    //         loadingMsg,
    //     ]);

    //     setIsLoading(true);

    //     try {
    //         // build history for api real msges not loading placeholder
    //         const history: ChatMessage[] = [
    //             ...messagesRef.current
    //                 .filter(m => !m.loading && !m.error)
    //                 .map(m => ({ role: m.role, content: m.content })),
    //             { 
    //                 role: "user", 
    //                 content,
    //             },
    //         ];

    //         const reply = await sendToGoogleApi(history, weatherContext);
    //           console.log("Gemini reply: ", reply)
    //         if (abortRef.current) return;

    //         if(typeof reply !== "string"){

    //             throw new Error (reply?.error ?? "AI retirend an invalid response.")
    //         }
    //         //replace the placeholder by actuall data
    //         updateMessages(prev => prev.map(message => message.id === loadingId ?
    //             {...message, content: reply, loading: false,} : message
    //         ));
    //     }  catch(err: unknown){
    //         const errMsg = err instanceof Error ? err.message : "Something went wrong.";
            
    //         updateMessages(prev => prev.map(message => message.id === loadingId ? 
    //             {...message, content: "", loading: false, error: errMsg,} : message
    //         ));
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, [inputText, isLoading, weatherContext]);



const sendMessages = useCallback(
    async (text?: string) => {
        const content = (text ?? inputText).trim();

        if (!content || isLoading) return;

        setInputText("");
        abortRef.current = false;

        // 1. Create the user's message
        const userMsg: Message = {
            id: makeId(),
            role: "user",
            content,
            timestamp: new Date(),
        };

        // 2. Create a temporary assistant message
        //    This lets us show the loading state while Gemini responds.
        const loadingId = makeId();

        const loadingMsg: Message = {
            id: loadingId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            loading: true,
        };

        // 3. Add both messages to the UI
        updateMessages((prev) => [
            ...prev,
            userMsg,
            loadingMsg,
        ]);

        setIsLoading(true);

        try {
            // 4. Build conversation history
            //    Ignore loading/error messages because Gemini should
            //    only receive actual conversation messages.
            const history: ChatMessage[] = [
                ...messagesRef.current
                    .filter((m) => !m.loading && !m.error)
                    .map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),

                // Add the new user message
                {
                    role: "user",
                    content,
                },
            ];

            // 5. Call Gemini
            const reply = await sendToGoogleApi(
                history,
                weatherContext
            );

            console.log("Gemini reply:", reply);

            // 6. If the chat was cleared while Gemini was responding,
            //    ignore this response.
            if (abortRef.current) return;

            // 7. Handle API failure
            if (!reply.success) {
                throw new Error(
                    reply.error ?? "Gemini returned an error."
                );
            }

            // 8. Success:
            //    Replace the loading placeholder with Gemini's text.
            updateMessages((prev) =>
                prev.map((message) =>
                    message.id === loadingId
                        ? {
                            ...message,
                            content: reply.answer ?? "",
                            loading: false,
                            error: null,
                        }
                        : message
                )
            );
        } catch (err: unknown) {
            // 9. Convert the error into a string
            const errMsg =
                err instanceof Error
                    ? err.message
                    : "Something went wrong.";

            // 10. Replace loading message with error message
            updateMessages((prev) =>
                prev.map((message) =>
                    message.id === loadingId
                        ? {
                            ...message,
                            content: "",
                            loading: false,
                            error: errMsg,
                        }
                        : message
                )
            );
        } finally {
            // 11. Always stop loading
            setIsLoading(false);
        }
    },
    [inputText, isLoading, weatherContext]
);



    const clearChat = useCallback(() => {
        abortRef.current = true;
        setMessages([]);
        messagesRef.current = [];
        setInputText("");
        
    }, []);

    return {
        messages,
        inputText,
        setInputText,
        isLoading,
        sendMessages,
        clearChat,
    };
}