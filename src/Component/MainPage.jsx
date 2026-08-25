const MainPage = ({onClick}) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-fuchsia-600 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
                <div className="mb-4 text-6xl" aria-hidden="true">🌤</div>

                <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-100">
                    Weather Board
                </h1>
                <p className="mb-8 text-sm leading-relaxed text-slate-400">
                    Live Weather . 15-day forecast . Hourly breakdown
                </p>

                <button 
                    type="button"
                    onClick={ onClick }
                    className="w-full rounded-xl bg-sky-400 py-3 text-base font-bold text-slate-900 transition hover:bg-sky-300 active:scale-95"
                >Check The Weather</button>
            </div>
        </div>
    )
}
export default MainPage