import React, { useState } from "react";
import { useTravel } from "../context/TravelContext";
import { stays } from "../data/stays";
import {
  Hotel,
  Star,
  MapPin,
  Sparkles,
  Wifi,
  Coffee,
  Waves,
  ShieldCheck,
  Check
} from "lucide-react";
import SafeImage from "../components/SafeImage";

export default function StaysPage() {
  const [stayType, setStayType] = useState("All");

  const filteredStays = stays.filter((s) =>
    stayType === "All" ? true : s.type.toLowerCase().includes(stayType.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-2">
          <Hotel className="w-3.5 h-3.5" /> Verified Handpicked Hospitality
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Handpicked Stays & Resorts
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          From luxury Victorian castles and floating marble palaces to cozy riverside backpacker hostels.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["All", "Resort", "5-Star", "Heritage", "Hostel", "Treehouse"].map((t) => (
          <button
            key={t}
            onClick={() => setStayType(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              stayType === t
                ? "bg-[#2D5A27] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {t === "All" ? "All Stays" : t}
          </button>
        ))}
      </div>

      {/* Stays Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredStays.map((stay) => (
          <div
            key={stay.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
          >
            <div className="relative h-60 overflow-hidden bg-slate-100">
              <SafeImage
                src={stay.image}
                alt={stay.name}
                category="stay"
                contextName={stay.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#2D5A27] text-white text-[11px] font-bold shadow-md">
                {stay.badge}
              </span>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-bold text-amber-500 flex items-center gap-1 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{stay.rating}</span>
                <span className="text-slate-400 font-normal">({stay.reviews})</span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-[#2D5A27] uppercase tracking-wider">
                  {stay.type}
                </span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2D5A27] transition-colors mt-0.5">
                  {stay.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {stay.location}
                </p>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {stay.amenities.map((am, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-600"
                  >
                    {am}
                  </span>
                ))}
              </div>

              {/* Tariff Display */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Tariff</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-[#2D5A27]">
                      ₹{stay.pricePerNight.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400"> / night</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {stay.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
