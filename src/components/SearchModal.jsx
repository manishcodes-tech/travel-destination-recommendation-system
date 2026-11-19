import React, { useState, useEffect } from "react";
import { useTravel } from "../context/TravelContext";
import { stays } from "../data/stays";
import { activities } from "../data/activities";
import { Search, X, MapPin, Hotel, Compass, ArrowRight, Star } from "lucide-react";
import SafeImage from "./SafeImage";

export default function SearchModal() {
  const { isSearchModalOpen, setIsSearchModalOpen, navigate, destinations } = useTravel();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen, setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const allDestinations = Array.isArray(destinations) && destinations.length > 0 ? destinations : [];
  const filteredDestinations = allDestinations.filter((d) => {
    const name = (d.name || "").toLowerCase();
    const region = (d.region || d.location || "").toLowerCase();
    const country = (d.country || "").toLowerCase();
    const category = (d.category || "").toLowerCase();
    const tags = Array.isArray(d.tags) ? d.tags : [];
    const q = query.toLowerCase();
    return (
      name.includes(q) ||
      region.includes(q) ||
      country.includes(q) ||
      category.includes(q) ||
      tags.some((t) => (t || "").toLowerCase().includes(q))
    );
  });

  const filteredStays = stays.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.destination.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActivities = activities.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.destination.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectDestination = (id) => {
    setIsSearchModalOpen(false);
    navigate("destination-detail", { id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Manali, beaches, hotels, paragliding, Dubai..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Search Results list */}
        <div className="overflow-y-auto p-4 space-y-6 divide-y divide-slate-100">
          {/* Destinations Category */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" /> Destinations ({filteredDestinations.length})
              </span>
            </div>
            {filteredDestinations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredDestinations.slice(0, 6).map((dest) => {
                  const price = Number(dest.basePrice || dest.base_price || dest.estimated_budget || 0);
                  const locationStr = dest.region || dest.location || dest.country || "India";
                  return (
                    <div
                      key={dest.id}
                      onClick={() => handleSelectDestination(dest.id)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F4F8F3] border border-transparent hover:border-[#2D5A27]/20 cursor-pointer transition-all group"
                    >
                      <SafeImage
                        src={dest.image}
                        alt={dest.name}
                        category="destination"
                        contextName={dest.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#2D5A27] truncate flex items-center gap-1.5">
                          {dest.name}
                          <span className="text-xs font-medium text-amber-500 flex items-center">
                            ★ {dest.rating}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 truncate">{locationStr}</p>
                        <p className="text-[11px] font-semibold text-[#2D5A27]">
                          From ₹{price.toLocaleString()}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#2D5A27] group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No destinations matching "{query}"</p>
            )}
          </div>

          {/* Stays Category */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hotel className="w-3.5 h-3.5 text-blue-600" /> Stays & Resorts ({filteredStays.length})
              </span>
            </div>
            {filteredStays.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredStays.slice(0, 3).map((stay) => (
                  <div
                    key={stay.id}
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      navigate("stays");
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all group"
                  >
                    <SafeImage
                      src={stay.image}
                      alt={stay.name}
                      category="stay"
                      contextName={stay.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600">
                        {stay.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{stay.location}</p>
                      <p className="text-[11px] font-bold text-slate-700">₹{stay.pricePerNight.toLocaleString()}/night</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No stays matching "{query}"</p>
            )}
          </div>

          {/* Activities Category */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600" /> Experiences & Activities ({filteredActivities.length})
              </span>
            </div>
            {filteredActivities.length > 0 ? (
              <div className="space-y-2">
                {filteredActivities.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      navigate("activities");
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/50 border border-transparent hover:border-emerald-200 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <SafeImage
                        src={act.image}
                        alt={act.title}
                        category="activity"
                        contextName={act.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-medium text-slate-800">{act.title}</h4>
                        <span className="text-xs text-slate-500">{act.destination} • {act.duration}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#2D5A27] bg-[#E8F3E6] px-2.5 py-1 rounded-full">
                      ₹{act.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No activities found</p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">Ctrl+K</kbd> to open anytime</span>
          <button
            onClick={() => {
              setIsSearchModalOpen(false);
              navigate("destinations");
            }}
            className="text-[#2D5A27] font-semibold hover:underline flex items-center gap-1"
          >
            Explore all destinations <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
