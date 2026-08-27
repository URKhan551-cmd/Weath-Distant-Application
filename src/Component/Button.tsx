import { clsx } from "clsx";
import {ReactNode, MouseEventHandler} from "react";


type ButtonVariant = "primary" | "secondary" | "ghost";

 interface ButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  disabled: boolean;
  variant?: ButtonVariant; 
}

const Button = ({ onClick, children, disabled = false, variant = "primary" }: ButtonProps) => { 
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-disabled={disabled}
            className={clsx(
                "flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5",
                "text-sm font-semibold transition-all active:scale-95",
                "focus:outline-none focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950",

                variant === "primary" && "bg-sky-400 text-slate-900 hover:bg-sky-300",
                variant === "secondary" && "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700",
                variant === "ghost" && "text-slate-400 hover:text-slate-100",
                disabled && "cursor-not-allowed opacity-40",
            )}
        >
            { children}
        </button>
    )
}

export default Button;