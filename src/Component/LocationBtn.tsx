import { LocateFixed, Loader2, LocateOff } from "lucide-react";
import { GEO_STATUS, type GeoStatus } from "../hooks/useGeolocation.ts";
import type { MouseEventHandler } from "react";

interface LocationBtnProps {
    status: GeoStatus;
    onClick: MouseEventHandler<HTMLButtonElement>
}

const LocationBtn = ({ status, onClick }: LocationBtnProps) => {
    const isLoading = status === GEO_STATUS.LOADING;
    const isDenied = status === GEO_STATUS.DENIED || status === GEO_STATUS.UNAVAILABLE;


    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading}
            aria-label="Use my current Location"
            title={
                isDenied ? "Location acces denied - enable in browser setting"
                    : "Use my current Location."
}
className = {`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50
            ${isDenied ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-slate-700 bg-slate-800 text-slate-300 hover:border-sky-500 hover:text-sky-400"} `}
        >
{ isLoading && <Loader2 size={14} className="animate-spin" />}
{
    isDenied && <LocateOff size={14}  />}
{ !isLoading && !isDenied && <LocateFixed size={14} />}
    
    <span className="hidden sm:inline">
        {isLoading ? "Loading..." : isDenied ? "Denied" : "My Location"}
    </span>
        </button >
    )
}

export default LocationBtn;