// handle pwa installed prompts offline detection

import {useState, useEffect, useCallback} from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{outcome: "accepted" | "dismissed"}>;
}

export function usePWA(){
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);
    const [isOffline, setIsOffline] = useState<boolean>(!navigator.online);
    const [showOfflineBanner, setShowOfflineBanner] = useState<boolean>(false);

    useEffect(() => {
        // capture install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener("beforeinstallprompt", handler);

        // check if already installed 
        const mql = window.matchMedia("(display-mode: standalone)");
        setIsInstalled(mql.matches);
        const mqlHandler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
        mql.addEventListener("change", mqlHandler);

        // offline / online
        const goOnline = () => {
            setIsOffline(false);
            setShowOfflineBanner(false);
        };
        const goOffline = () => {
            setIsOffline(true);
            setShowOfflineBanner(true);
        };

        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);

      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        mql.removeEventListener("change", mqlHandler);
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };


    }, []);

    const install = useCallback( async () => {
      if(!installPrompt) return;

      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if(result.outcome === "accepted") {
        setInstallPrompt(null);
        setIsInstalled(true);
      }
    }, [installPrompt]);

    return {
        canInstall: !!installPrompt &&  !isInstalled,
        isInstalled,
        isOffline,
        showOfflineBanner,
        dismissOfflineBanner: () => setShowOfflineBanner(false),
        install,
    };
}

// !!installPrompt  mean here if it is null = false or it has some value it will become = true 
// !! convert the variable into boolean value.
//I have an installation prompt AND the app isn't already installed."
// installPrompt exists?
//        │
//        ├── NO → false
//        │
//        └── YES
//              │
//              ▼
//        isInstalled?
//              │
//         ┌────┴────┐
//        YES        NO
//         │          │
//       false       true
// React, create some state for me to remember whether the app has an install prompt, whether it is installed, whether we're offline, and whether the offline banner is visible.
// When this component starts, listen to the browser for PWA installation events and save the installation event instead of letting the browser immediately show the prompt. Also check whether we're already running as an installed standalone app. Listen for online/offline changes too.
// When the component goes away, remove all those browser event listeners.
// Give me an install() function that uses the saved browser installation event, waits for the user to choose, and updates React state if they accept.
// Finally, give the component simple information and functions so it doesn't need to know any of these browser details."
