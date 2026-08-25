const ErrorMessage = ({ message}) => { 
    return (
    <div 
            role="alert"
            aria-live="assertive"
            className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span aria-hidden="true" className="mt-0.5 shrink-0">⚠️</span>
            <span>{ message }</span>
    </div>
)
}

export default ErrorMessage;