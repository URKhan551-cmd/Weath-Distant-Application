import {
    getRoadVisibility,
    getDesertCondition,
    getBeachCondition,
} from "../utils/mapHelpers.ts";
import type {EmirateData} from "../utils/emirates.ts";

interface CurrentConditions {
    temp: number;
    feelslike: number;
    humidity: number;
    precipprob: number;
    windspeed: number;
    uvindex: number;
    visibility: number;
    conditions: string;
}

interface UAEConditionsPanelProps {
    current: CurrentConditions;
    emirate?: EmiratesData | null;
}

// reusable condition row card
const ConditionRow = ({ title, label, detail, color, bg }: { title: string; label: string; detail: string; color: string; bg: string }) => (
    <div className={ `rounded-xl border p-4 ${bg}`}>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {title}
        </p>
        <p className={`text-sm font-bold ${color}`}>{label}</p>
        <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
);

const UaeConditionsPanel = ({ current, emirate }: UAEConditionsPanelProps) => {
    const road = getRoadVisibility(current.visibility, current.conditions, current.windspeed, current.humidity);
    const desert = getDesertCondition(current.temp, current.uvindex, current.windspeed, current.humidity);
    const beach = getBeachCondition(current.temp, current.uvindex, current.windspeed, current.precipprob);

    return (
        <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                🇦🇪 UAE Conditions
                {emirate && <span className="ml-2 text-slate-600">-{emirate.name}</span>}
            </p>

            {/* road visibility always shown  */}
            <ConditionRow
                title="🚗 Road Visibility"
                label={road.label}
                detail={road.detail}
                color={road.color}
                bg={road.bg}
            />

            {/* Beach condition  */}
            {emirate?.coastline && (
                <ConditionRow
                    title={`🏖️ Beach Conditions${emirate.beachConditions ? ` — ${emirate.beachConditions}` : ""}`}
                    label={beach.label}
                    detail={beach.detail}
                    color={beach.color}
                    bg={beach.bg}
                />
            )}

            {/* desert zone only for desert emirates  */}

            {emirate?.desertZone && (
                <ConditionRow
                    title="🏜️ Desert Zone"
                    label={desert.label}
                    detail={desert.detail}
                    color={desert.color}
                    bg={desert.bg}
                />
            )}

            {/* always show desert card if condition are extreme */}
            {!emirate?.desertZone && !desert.safe && (
                <ConditionRow
                    title="🏜️ Desert / Outdoor Warning"
                    label={desert.label}
                    detail={desert.detail}
                    color={desert.color}
                    bg={desert.bg}
                />
            )}
        </div>
    )
};

export default UaeConditionsPanel;