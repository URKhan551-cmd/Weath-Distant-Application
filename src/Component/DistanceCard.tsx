// here we will implement the distance between user and searched active location.
import {Navigation} from "lucide-react";
import {calcDistance, buildNavLink} from "../utils/mapHelpers.ts";

interface DistanceCardProps {
    userCoords: { lat: number; lon: number};
    destCoords: {lat:number; lon:number};
    destName: string;
    lang?: Lang;
}

const DistanceCard = ({ userCoords, destCoords, destName }: DistanceCardProps) => {
    const km = calcDistance(
        userCoords.lat, userCoords.lon,
        destCoords.lat, destCoords.lon
    );
    const navLink = buildNavLink(destCoords.lat, destCoords.lon, destName);

    // rough drive time estimate UAE average speed 80km/h
    const driveMinutes = Math.round((km / 80) * 60);
    const driveTime = driveMinutes < 60 ? `~${driveMinutes} min`
        : `~${Math.floor(driveMinutes / 60)}h ${driveMinutes % 60}m`;

    return (
        <div className="flex items-center justify-between gap-4 rounded-xl
        border border-slate-700/60 bg-slate-900 px-4 py-3
        flex-wrap"
        >
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                     📏 Distance to {destName}</p>
                     <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-black text-sky-400">{km} km</span>
                        <span className="text-sm text-slate-400">{driveTime} drive</span>
                     </div>
            </div>

            <a
            href={navLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-sky-500/15 
            border border-sky-500/40 px-4 py-2 text-sm font-semibold text-sky-300
            transition hover:bg-sky-500/25" 
            >
                <Navigation size={14} />
                Navigate
            </a>
        </div>
        )
 }

export default DistanceCard;