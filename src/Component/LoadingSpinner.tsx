const LoadingSpinner = () => {
    return (
        <div role="status" aria-live="polite"
            className="flex flex-cols items-center justify-center gap-3 py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400" aria-hidden="true">
               
            </div>
             <p className="text-sm text-fuchsia-700">Fetching weather data...</p>
         </div>
    )
};

export default LoadingSpinner;