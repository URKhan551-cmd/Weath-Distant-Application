import type {ChangeEventHandler, KeyboardEventHandler} from "react";
interface SearchBarProps {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    onKeyDown: KeyboardEventHandler<HTMLInputElement>;
 }


const SearchBar = ({value, onChange, onKeyDown}: SearchBarProps) => {
    return (
        <input
            id="searchBar"
            type="text"
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={value}
            placeholder="Enter city (e.g. Dubai, London...)"
            autoComplete="off"
            aria-label="City search"
            className="min-w-0 flex-1 rounded-lg border border-slate-700
                    bg-slate-800 px-4 py-2.5 text-sm text-slate-100
                    placeholder:text-slate-500
                    focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
                    transition"
        />
    );
}
export default SearchBar;