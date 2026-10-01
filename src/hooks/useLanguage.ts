import {useState, useCallback} from "react";
import type {Lang} from "../utils/translations.ts";

const STORAGE_KEY = "wb_lang";


function getSavedLang(): Lang {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if(saved === "ar" || saved === "en")return saved;

    } catch { /* igonre */}
 return "en";
}


export function useLanguage(){
    const [lang, setLangState] = useState<Lang>(getSavedLang);
    const setLang = useCallback((l: Lang) => {
        setLangState(l);
        try{
            localStorage.setItem(STORAGE_KEY, l);
        } catch {/* ignore  */}
       document.documentElement.setAttribute("lang", l);
    }, []);

    const toggleLang = useCallback(() => {
        setLang(lang === "en" ? "ar" : "en");
    }, [lang, setLang]);

    return {lang, toggleLang};
} 