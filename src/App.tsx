import { useState, useCallback } from 'react';
import { apiResponse } from "./Api/apiResponse.js";
import { RefreshCw, Search } from "lucide-react";

import { getDailyWeather, get24HourWeather } from "./Api/weatherHelper.js";
import MainPage from "./Component/MainPage.jsx";
import CurrentWeather from "./Component/CurrentWeather.jsx";
import SearchBar from "./Component/SearchBar.jsx";
import Button from "./Component/Button.jsx";
import ErrorMessage from "./Component/ErrorMessage.jsx";
import LoadingSpinner from "./Component/LoadingSpinner.jsx";
import DailyWeatherData from "./Component/DailyWeatherData.jsx";
import HourlyDataWeather from "./Component/HourlyDataWeather.jsx";


// HourlyTab 
const HourlyTab = ({ data }) => {
  let hourlyData = null;
  try{
    hourlyData = get24HourWeather(data);
  } catch(err){
    return <ErrorMessage message="Could not parse hourly data.try aging refresh." />;
  }
  if(!hourlyData){
    return <ErrorMessage message="no HOURLY Data available" />;
  }
  return <HourlyDataWeather hours={hourlyData} />;
}
// array holds object we will pass this to function where we will get data on bbehlf of this objects.
const TABS = [
  {id: "current", label: "Now"},
  {id: "daily", label: "Daily"},
  {id: "hourly", label: "Hourly"},
];


function App() {
  const [started, setStarted] = useState(false);
  const [location, setLocation] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("current");  // current tab by default 
  const [lastLocation, setLastLocation] = useState("");


  // useEffect(() => {
  //   async function fetchData () {
  //     try {
  //       const result = await apiResponse("dubai");
  //     setData(result);
  //       console.log(result);
  //     } catch (err) {
  //       setError(err.message);
  //     }finally {
  //       setLoading(null);
  //     }
  //   }
  //   fetchData();
  // }, []) // empty because we just want to run only at mount

  // You cannot destructure a Promise   we will use  useEffet and useState and await

  const fetchWeather = useCallback(async (city) => {
    const target = (city || location).trim();  // this will remove extra spaces from input
    if (!target) { setError("Please enter a city name."); return; }

    setLoading(true);
    setError(null);

    try {
      const result = await apiResponse(target);
      setData(result);
      setLastLocation(target);
      setActiveTab("current");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }

  }, [location]);
  // according to this location dependancy arr whenever change in location will effect to run the callback func and get updated states.
  
//Handle refresh button 
  const handleRefresh = useCallback(() => {
    if (lastLocation) fetchWeather(lastLocation);

  }, [lastLocation, fetchWeather]);

  
  const getHourlyData = () => {
    try { return get24HourWeather(data); }
    catch { return null; }

  };

  if (!started) return <MainPage onClick={() => setStarted(true)} />;
  

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-md px-4 pb-24 pt-6 sm:max-w-xl md:max-w-2xl md:px-6 lg:max-w-4xl lg:px-8">

        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-sky-400 sm:text-2xl">
            🌤 WeatherBoard
          </h1>
           {data && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
            aria-label="Refresh weather"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-sky-500 hover:text-sky-400 disabled:cursor-not-allowed disabled:opacity-40">
              <RefreshCw size={13} /> 
              Refresh
            </button>
           )}
        </header>

        {/* yaha ayega searchbar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <SearchBar
             value={location}
             onChange={e => setLocation(e.target.value)}
             onKeyDown={e => e.key === "Enter" && fetchWeather()}
            />
            <Button onClick={() => fetchWeather()} disabled={loading}>
              { loading ? <span className="animate-pulse">...</span> 
                : <><Search size={15} className="inline -mt-0.5 mr-1" />Search</>
              }
            </Button>
          </div>
          <ErrorMessage message={ error} />
        </div>

        {/* loading states  */}
        {loading && <LoadingSpinner />}

        {/* our content here */}
        {!loading && data && (
          <>
          {/* tabs ko return karna ha */}
            <div className="mb-4 flex gap-1 rounded-xl bg-slate-800/60 p-1" role="tablist">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={ `flex-1 rounded-lg py-2 text-sm font-semibold transition-all
                  ${activeTab === tab.id ? "bg-sky-400 text-slate-900 shadow" : "text-slate-400 hover:text-slate-200"}`} 
                >
                  { tab.label}
                </button>
              ))}
            </div>

            {/* konsa tab kab show karna ha  */}
            {activeTab === "current" && (<CurrentWeather data={data} />)}

            {activeTab === "daily" && (
              <DailyWeatherData days={ getDailyWeather(data)} />
            )}

            {activeTab === "hourly" && (
              <HourlyTab data={data}/>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
