// Save remove lists of destination
import {useState, useCallback} from "react";
const STORAGE_KEY = "wb_saved_destinations";

export interface SavedDestination {
    id: string;  // city string used as key
    city: string;  // display name / search string
    savedAt: string; // ISO string date
    emoji: string;
}

function loadSaved(): SavedDestination[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    return JSON.parse(raw) as SavedDestination[];
  } catch {
    return [];
  }
}


function persist(items: SavedDestination[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        {/* ignore */}
    }
}

export function useSavedDestinations(){
    const [saved, setSaved] = useState<SavedDestination[]>(loadSaved);

    const isSaved = useCallback((city: string) => saved.some(s => s.id === city.toLowerCase()),
      [saved],
    );

    const save = useCallback((city: string, emoji?: string) => {
        if(!city.trim()) return;

        const id = city.toLowerCase();
        setSaved(prev => {
            if(prev.some(s => s.id === id)) return prev;
            const updated = [
                {
                    id,
                    city: city.trim(), 
                    savedAt: new Date().toISOString(), 
                    emoji,
                },
                ...prev
            ].slice(0, 20);  // max saved
            persist(updated);
            return updated;
        });
      }, []);


      const remove = useCallback((id: string) => {
        setSaved(prev => {
            const updated = prev.filter(s => s.id !== id);
            persist(updated);
            return updated;
        });
      }, []);


    const clearAll = useCallback(() => {
        setSaved([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            {/* ignore */}
        }
    }, []);
    
    return {saved, isSaved, save, remove, clearAll};
}