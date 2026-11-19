import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function WeatherCard({ destinationId }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      if (!destinationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(false);
      try {
        const data = await api.getWeather(destinationId);
        if (isMounted) {
          if (data && data.success) {
            setWeather(data);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn(`Weather data unavailable for ${destinationId}:`, err.message);
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [destinationId]);

  const renderWeatherIcon = (iconType) => {
    const iconClass = "w-8 h-8 text-[#2D5A27]";
    switch (iconType) {
      case "Sun":
        return <Sun className="w-8 h-8 text-amber-500 animate-pulse" />;
      case "CloudSun":
        return <CloudSun className="w-8 h-8 text-amber-500" />;
      case "Cloud":
        return <Cloud className="w-8 h-8 text-slate-400" />;
      case "CloudRain":
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case "CloudSnow":
        return <CloudSnow className="w-8 h-8 text-cyan-400" />;
      case "CloudLightning":
        return <CloudLightning className="w-8 h-8 text-violet-500" />;
      case "CloudFog":
        return <CloudFog className="w-8 h-8 text-slate-400" />;
      default:
        return <CloudSun className="w-8 h-8 text-[#2D5A27]" />;
    }
  };

  if (loading) {
    return (
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
          <CloudSun className="w-4 h-4 text-[#2D5A27]" />
          <span>Current Weather</span>
        </div>
        <div className="h-36 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#2D5A27]" />
          <span className="text-xs font-semibold text-slate-600">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
          <CloudSun className="w-4 h-4 text-[#2D5A27]" />
          <span>Current Weather</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-medium">Weather information is currently unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
          <CloudSun className="w-4 h-4 text-[#2D5A27]" />
          <span>Current Weather</span>
        </div>
        <span className="text-[10px] font-bold text-[#2D5A27] bg-[#E8F3E6] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Live
        </span>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8FAF8] border border-[#2D5A27]/15">
        <div>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {weather.temperature}°C
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
            {weather.condition}
          </p>
        </div>
        <div className="p-3 bg-white rounded-2xl shadow-xs border border-slate-100">
          {renderWeatherIcon(weather.icon)}
        </div>
      </div>

      {/* Sub-metrics: Feels Like, Humidity, Wind Speed */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium mb-0.5">
            <Thermometer className="w-3 h-3 text-[#2D5A27]" /> Feels
          </div>
          <span className="text-xs font-bold text-slate-800">
            {weather.feels_like}°C
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium mb-0.5">
            <Droplets className="w-3 h-3 text-blue-500" /> Humidity
          </div>
          <span className="text-xs font-bold text-slate-800">
            {weather.humidity}%
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium mb-0.5">
            <Wind className="w-3 h-3 text-[#2D5A27]" /> Wind
          </div>
          <span className="text-xs font-bold text-slate-800">
            {weather.wind_speed} km/h
          </span>
        </div>
      </div>
    </div>
  );
}