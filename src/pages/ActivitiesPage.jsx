import React, { useState } from "react";
import { useTravel } from "../context/TravelContext";
import { activities } from "../data/activities";
import SafeImage from "../components/SafeImage";
import { Compass, Star, Clock, MapPin, Sparkles, ArrowRight } from "lucide-react";

export default function ActivitiesPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Air Adventure", "Water Sports", "Cultural Cruise", "Desert Adventure", "Nature & Leisure"];

  const filtered = activities.filter((a) =>
    activeCategory === "All" ? true : a.category === activeCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-3.5 h-3.5" /> High Adrenaline & Cultural Gems
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Curated Experiences & Activities
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Paragliding in Solang, scuba diving in Grande Island, desert dune bashing, and Pichola sunset cruises.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-[#2D5A27] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filtered.map((act) => (
          <div
            key={act.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
          >
            <div className="relative h-56 overflow-hidden bg-slate-100">
              <SafeImage
                src={act.image}
                alt={act.title}
                category="activity"
                contextName={act.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#2D5A27] text-white text-[11px] font-bold shadow-md">
                {act.badge}
              </span>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-bold text-amber-500 flex items-center gap-1 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{act.rating}</span>
                <span className="text-slate-400 font-normal">({act.reviews})</span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {act.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2D5A27] transition-colors mt-0.5">
                  {act.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {act.destination}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {act.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Ticket Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-[#2D5A27]">
                      ₹{act.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400"> / ticket</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {act.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
