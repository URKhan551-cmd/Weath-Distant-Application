import {
  useState, useCallback, useEffect,
  lazy, Suspense, useMemo,
} from "react";
import {
  Routes, Route, Navigate,
  useNavigate, useLocation, useSearchParams,
} from "react-router-dom";
import { RefreshCw, Search, Download } from "lucide-react";
 
import { ROUTES } from "./router/routes.ts";
import { getDailyWeather, get24HourWeather, type HourlyWeather } from "./Api/weatherHelper.ts";
import { detectEmirate, isInsideUAE, EMIRATES, type EmiratesData } from "./utils/emirates.ts";
import { useWeather }              from "./hooks/useWeather.ts";
import { useGeolocation, GEO_STATUS } from "./hooks/useGeolocation.ts";
import { useLanguage }             from "./hooks/useLanguage.ts";
import { useAlerts }               from "./hooks/useAlerts.ts";
import { useSavedDestinations }    from "./hooks/useSavedDestinations.ts";
import { usePWA }                  from "./hooks/usePWA.ts";
import { t }                       from "./utils/translations.ts";
// import { isRamadanPeriod }         from "./utils/ramadan.ts";
import type { WeatherContext }      from "./Api/geminiApi.ts";
 
import MainPage             from "./Component/MainPage.tsx";
import CurrentWeather       from "./Component/CurrentWeather.tsx";
import SearchBar            from "./Component/SearchBar.tsx";
import Button               from "./Component/Button.tsx";
import ErrorMessage         from "./Component/ErrorMessage.tsx";
import LoadingSpinner       from "./Component/LoadingSpinner.tsx";
import DailyWeatherData     from "./Component/DailyWeatherData.tsx";
import HourlyDataWeather    from "./Component/HourlyDataWeather.tsx";
import LocationBtn          from "./Component/LocationBtn.tsx";
import EmiratesSwitcher     from "./Component/EmiratesSwitcher.tsx";
import DistanceCard         from "./Component/DistanceCard.tsx";
import UaeConditionsPanel   from "./Component/UaeConditionsPanel.tsx";
import DestinationIntel     from "./Component/DestinationIntel.tsx";
import AIChat               from "./Component/AiChat.tsx";
import FloatingAIBtn        from "./Component/FloatingAIBtn.tsx";
import AlertBanner          from "./Component/AlertBanner.tsx";
import SavedDestinations, { SaveBtn } from "./Component/SavedDestinations.tsx";
import OfflineBanner        from "./Component/OfflineBanner.tsx";
// import RamadanCard          from "./Component/RamadanCard.tsx";
 
const WeatherMap = lazy(() => import("./Component/WeatherMap.tsx"));
 
import type { WeatherData } from "./Component/CurrentWeather.tsx";
 
// ─── HourlyTab ────────────────────────────────────────────────────────────────
interface HourlyTabProps { data: WeatherData; }
const HourlyTab = ({ data }: HourlyTabProps) => {
  let hourlyData: HourlyWeather[] | null = null;
  try   { hourlyData = get24HourWeather(data); }
  catch { return <ErrorMessage message="Could not parse hourly data. Try refreshing." />; }
  if (!hourlyData) return <ErrorMessage message="No hourly data available." />;
  return <HourlyDataWeather hours={hourlyData} />;
};
 
// ─── SearchPrompt — shown on tabs when no city is loaded yet ──────────────────
const SearchPrompt = ({ lang }: { lang: "en" | "ar" }) => (
  <div className="flex flex-col items-center gap-3 py-16 text-center">
    <span className="text-4xl">🔍</span>
    <p className="text-sm text-slate-400">
      {lang === "ar"
        ? "ابحث عن مدينة لرؤية بيانات الطقس"
        : "Search for a city to see weather data"}
    </p>
  </div>
);
 
// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [started, setStarted] = useState<boolean>(false);
 
  // ✅ Fix 1: renamed from "location" to "cityInput" to avoid clash with
  //           useLocation() from React Router which also returns "location"
  const [cityInput,     setCityInput]     = useState<string>("");
  const [activeEmirate, setActiveEmirate] = useState<string | null>(null);
  const [detectedBadge, setDetectedBadge] = useState<EmiratesData | null>(null);
  const [destCoords,    setDestCoords]    = useState<{ lat: number; lon: number } | null>(null);
  const [destName,      setDestName]      = useState<string>("");
 
  // ✅ Fix 2: useLocation renamed to "routerLocation" to avoid shadowing
  //           the "location" variable name entirely
  const navigate        = useNavigate();
  const routerLocation  = useLocation();         // ← renamed
  const [searchParams]  = useSearchParams();
 
  // ── Core hooks ────────────────────────────────────────────────────────────
  const { data, loading, error, fetchByCity, fetchByCoords, refresh } = useWeather();
  const geo = useGeolocation();
 
  // ── Phase 6 hooks ─────────────────────────────────────────────────────────
  const { lang, toggleLang }                              = useLanguage();
  const { saved, isSaved, save, remove, clearAll }        = useSavedDestinations();
  const { canInstall, isOffline, showOfflineBanner,
          dismissOfflineBanner, install }                 = usePWA();
  const { alerts, dismiss: dismissAlert }                 = useAlerts(data?.currentConditions ?? null);
 
 
 
  // ── Tabs config — linked to routes ───────────────────────────────────────
  const TABS = [
    { id: "current",      path: ROUTES.weather, label: t("tabNow",     lang) },
    { id: "daily",        path: ROUTES.daily,   label: t("tabDaily",   lang) },
    { id: "hourly",       path: ROUTES.hourly,  label: t("tabHourly",  lang) },
    { id: "map",          path: ROUTES.map,     label: t("tabMap",     lang) },
    { id: "destinations", path: ROUTES.explore, label: t("tabExplore", lang) },
    { id: "ai",           path: ROUTES.ai,      label: t("tabAI",      lang) },
    { id: "saved",        path: ROUTES.saved,   label: t("tabSaved",   lang) },
  ] as const;
 
  // ✅ Fix 3: derive active tab from URL path — no more setActiveTab state
  //           TABS.find() checks current URL against each tab's path
  const activeTab = TABS.find((tab) => tab.path === routerLocation.pathname)?.id ?? "current";
 
  // Navigate to a tab path
  const goToTab = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);
 
  // ── Auto-load city from ?city=Dubai URL param ─────────────────────────────
  useEffect(() => {
    const cityParam = searchParams.get("city");
    if (cityParam && !data) {
      setCityInput(cityParam);   // ✅ using setCityInput not setLocation
      fetchByCity(cityParam);
      setStarted(true);          // ✅ must be true so app renders (was false = bug)
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
 
  // ── Geolocation success ───────────────────────────────────────────────────
  useEffect(() => {
    if (geo.status !== GEO_STATUS.SUCCESS || !geo.coords) return;
    const { lat, lon } = geo.coords;
 
    if (isInsideUAE(lat, lon)) {
      const emirate = detectEmirate(lat, lon);
      if (emirate) {
        setActiveEmirate(emirate.id);
        setDetectedBadge(emirate);
        setDestCoords({ lat: emirate.lat, lon: emirate.lon });
        setDestName(emirate.name);
      }
    }
 
    fetchByCoords({ lat, lon });
    navigate(ROUTES.weather);   // ✅ navigate instead of setActiveTab
  }, [geo.status, geo.coords]); // eslint-disable-line react-hooks/exhaustive-deps
 
  // ── Weather context for AI ────────────────────────────────────────────────
  const weatherContext = useMemo((): WeatherContext => ({
    location: data?.address ?? cityInput ?? "",  // ✅ cityInput not location
    emirate:  EMIRATES.find((e) => e.id === activeEmirate) ?? null,
    current:  data?.currentConditions ? {
      temp:       data.currentConditions.temp,
      feelslike:  data.currentConditions.feelslike,
      humidity:   data.currentConditions.humidity,
      windspeed:  data.currentConditions.windspeed,
      uvindex:    data.currentConditions.uvindex,
      visibility: data.currentConditions.visibility,
      precipprob: data.currentConditions.precipprob,
      conditions: data.currentConditions.conditions,
      pressure:   data.currentConditions.pressure,
      dew:        data.currentConditions.dew,
    } : null,
  }), [data, activeEmirate, cityInput]);
 
  // ── Handlers ──────────────────────────────────────────────────────────────
 
  const handleSearch = useCallback(() => {
    if (!cityInput.trim()) return;   // ✅ cityInput not location
    setActiveEmirate(null);
    setDetectedBadge(null);
 
    const matched = EMIRATES.find(
      (e) => e.name.toLowerCase() === cityInput.trim().toLowerCase()
    );
    if (matched) {
      setDestCoords({ lat: matched.lat, lon: matched.lon });
      setDestName(matched.name);
    } else {
      setDestCoords(null);
      setDestName(cityInput.trim());
    }
 
    fetchByCity(cityInput.trim());
    navigate(ROUTES.weather);    // ✅ navigate instead of setActiveTab
  }, [cityInput, fetchByCity, navigate]);
 
  const handleEmiratesSelect = useCallback((emirate: EmiratesData) => {
    setActiveEmirate(emirate.id);
    setDetectedBadge(null);
    setCityInput(emirate.name);  // ✅ setCityInput not setLocation
    setDestCoords({ lat: emirate.lat, lon: emirate.lon });
    setDestName(emirate.name);
    fetchByCity(emirate.city);
    navigate(ROUTES.weather);    // ✅ navigate instead of setActiveTab
  }, [fetchByCity, navigate]);
 
  const handleLocationClick = useCallback(() => {
    setDetectedBadge(null);
    geo.geoLocation();
  }, [geo]);
 
  const handleMapEmirateClick = useCallback((emirate: EmiratesData) => {
    setActiveEmirate(emirate.id);
    setDetectedBadge(null);
    setCityInput(emirate.name);  // ✅ setCityInput
    setDestCoords({ lat: emirate.lat, lon: emirate.lon });
    setDestName(emirate.name);
    fetchByCity(emirate.city);
    // stay on map tab so user sees popup
  }, [fetchByCity]);
 
  const handleDestinationSelect = useCallback((city: string) => {
    setCityInput(city);          // ✅ setCityInput
    setActiveEmirate(null);
    setDetectedBadge(null);
    fetchByCity(city);
    navigate(ROUTES.weather);    // ✅ navigate instead of setActiveTab
  }, [fetchByCity, navigate]);
 
  const handleSave = useCallback(() => {
    if (!data) return;
    const emirate = EMIRATES.find((e) => e.id === activeEmirate);
    save(data.address, emirate?.emoji);
  }, [data, activeEmirate, save]);
 
  const activeEmirateData = EMIRATES.find((e) => e.id === activeEmirate) ?? null;
 
  // ── Landing page ──────────────────────────────────────────────────────────
  if (!started) return <MainPage onClick={() => setStarted(true)} />;
 
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
 
      {/* Offline banner */}
      <OfflineBanner
        show={showOfflineBanner}
        lang={lang}
        onClose={dismissOfflineBanner}
      />
 
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-6
                      sm:max-w-xl md:max-w-2xl md:px-6 lg:max-w-5xl lg:px-8">
 
        {/* ── Header ── */}
        <header className="mb-6 flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl font-bold tracking-tight text-sky-400 sm:text-2xl">
            🌤 {t("appName", lang)}
          </h1>
 
          <div className="flex items-center gap-2 flex-wrap">
            {canInstall && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 rounded-lg border
                           border-sky-500/40 bg-sky-500/10 px-3 py-1.5
                           text-xs font-medium text-sky-400 transition hover:bg-sky-500/20"
              >
                <Download size={12} />
                {t("installApp", lang)}
              </button>
            )}
 
            {isOffline && (
              <span className="rounded-full border border-yellow-500/40
                               bg-yellow-500/10 px-2.5 py-1 text-[10px]
                               font-medium text-yellow-400">
                📴 {t("offlineReady", lang)}
              </span>
            )}
 
            <button
              onClick={toggleLang}
              className="rounded-lg border border-slate-700 px-3 py-1.5
                         text-xs font-medium text-slate-400 transition
                         hover:border-sky-500 hover:text-sky-400"
            >
              {t("langToggle", lang)}
            </button>
 
            {data && (
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                aria-label={t("refresh", lang)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700
                           px-3 py-1.5 text-xs font-medium text-slate-400 transition
                           hover:border-sky-500 hover:text-sky-400
                           disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw size={13} />
                {t("refresh", lang)}
              </button>
            )}
 
            {data && (
              <SaveBtn
                city={data.address}
                isSaved={isSaved(data.address)}
                lang={lang}
                onSave={handleSave}
              />
            )}
          </div>
        </header>
 
        {/* Alert banners */}
        <AlertBanner alerts={alerts} lang={lang} onDismiss={dismissAlert} />
 
        {/* ── Search row ── */}
        <div className="mb-3">
          <div className="flex gap-2">
            <SearchBar
              value={cityInput}                          
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("searchPlaceholder", lang)}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading
                ? <span className="animate-pulse">...</span>
                : <><Search size={15} className="inline -mt-0.5 mr-1" />{t("searchBtn", lang)}</>
              }
            </Button>
            <LocationBtn
              status={geo.status}
              onClick={handleLocationClick}
              lang={lang}
            />
          </div>
          <ErrorMessage message={error} />
          <ErrorMessage message={geo.errorMsg} />
        </div>
 
        {/* Detected emirate badge */}
        {detectedBadge && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border
                          border-emerald-500/30 bg-emerald-500/10 px-3 py-2
                          text-xs text-emerald-400">
            <span>📍</span>
            <span>
              {t("youAreIn", lang)}{" "}
              <span className="font-bold">{detectedBadge.name}</span>
              {" "}({detectedBadge.arabic})
            </span>
          </div>
        )}
 
        {/* Emirates switcher */}
        <EmiratesSwitcher
          activeEmirate={activeEmirate}
          onSelect={handleEmiratesSelect}
          lang={lang}
        />
 
        {/* Distance card */}
        {geo.coords && destCoords && data && (
          <div className="mb-4">
            <DistanceCard
              userCoords={geo.coords}
              destCoords={destCoords}
              destName={destName || data.address}
              lang={lang}
            />
          </div>
        )}
 
        {/* Loading */}
        {loading && <LoadingSpinner lang={lang} />}
 
        {/* ── Main content ── */}
        {!loading && (
          <>
            {/* ── Tab bar — calls goToTab(path) instead of setActiveTab ── */}
            <div
              className="mb-4 flex gap-1 overflow-x-auto rounded-xl
                         bg-slate-800/60 p-1
                         [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => goToTab(tab.path)}       // ✅ goToTab not setActiveTab
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold
                              transition-all
                              ${activeTab === tab.id
                                ? "bg-sky-400 text-slate-900 shadow"
                                : "text-slate-400 hover:text-slate-200"
                              }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
 
            {/* ✅ Fix 4: React Router <Routes> replaces all the {activeTab === "..."} blocks */}
            <Routes>
 
              {/* Redirect root → /weather */}
              <Route path="/" element={<Navigate to={ROUTES.weather} replace />} />
 
              {/* Now / Current weather */}
              <Route path={ROUTES.weather} element={
                data ? (
                  <div className="flex flex-col gap-4">
                    <CurrentWeather data={data} lang={lang} />
                    {data.currentConditions && (
                      <UaeConditionsPanel
                        current={data.currentConditions}
                        emirate={activeEmirateData}
                        lang={lang}
                      />
                    )}
                    {/* {isRamadan && data.days?.[0] && data.currentConditions && (
                      <RamadanCard
                        sunrise={data.days[0].sunrise}
                        sunset={data.days[0].sunset}
                        temp={data.currentConditions.temp}
                        uvIndex={data.currentConditions.uvindex}
                        lang={lang}
                      />
                    )} */}
                  </div>
                ) : <SearchPrompt lang={lang} />
              } />
 
              {/* Daily forecast */}
              <Route path={ROUTES.daily} element={
                data
                  ? <DailyWeatherData days={getDailyWeather(data)} lang={lang} />
                  : <SearchPrompt lang={lang} />
              } />
 
              {/* Hourly forecast */}
              <Route path={ROUTES.hourly} element={
                data
                  ? <HourlyTab data={data} />
                  : <SearchPrompt lang={lang} />
              } />
 
              {/* Map — lazy loaded */}
              <Route path={ROUTES.map} element={
                <Suspense fallback={<LoadingSpinner lang={lang} />}>
                  <div className="flex flex-col gap-4">
                    <WeatherMap
                      userCoords={geo.coords}
                      activeEmirate={activeEmirate}
                      onEmirateClick={handleMapEmirateClick}
                    />
                    {data?.currentConditions && (
                      <UaeConditionsPanel
                        current={data.currentConditions}
                        emirate={activeEmirateData}
                        lang={lang}
                      />
                    )}
                  </div>
                </Suspense>
              } />
 
              {/* Explore / Destination Intelligence */}
              <Route path={ROUTES.explore} element={
                <DestinationIntel
                  onCitySelect={handleDestinationSelect}
                  lang={lang}
                />
              } />
 
              {/* AI chat */}
              <Route path={ROUTES.ai} element={
                <AIChat weatherContext={weatherContext} lang={lang} />
              } />
 
              {/* Saved destinations */}
              <Route path={ROUTES.saved} element={
                <SavedDestinations
                  saved={saved}
                  lang={lang}
                  onSelect={(city) => {
                    handleDestinationSelect(city);
                    navigate(ROUTES.weather);
                  }}
                  onRemove={remove}
                  onClearAll={clearAll}
                />
              } />
 
              {/* 404 — redirect unknown paths back to weather */}
              <Route path="*" element={<Navigate to={ROUTES.weather} replace />} />
 
            </Routes>
          </>
        )}
      </div>
 
      {/* Floating AI button — hidden on AI tab */}
      <FloatingAIBtn
        weatherContext={weatherContext}
        hidden={routerLocation.pathname === ROUTES.ai}
        lang={lang}
      />
    </div>
  );
}
 
export default App;
 