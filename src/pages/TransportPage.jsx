import React, { useState } from "react";
import { useTravel } from "../context/TravelContext";
import SafeImage from "../components/SafeImage";
import {
  Plane,
  Bus,
  Train,
  Car,
  Ship,
  Search,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Wifi,
  Zap,
  Luggage,
  MapPin,
  Sparkles,
  Users
} from "lucide-react";

export default function TransportPage() {
  const [fromCity, setFromCity] = useState("New Delhi (DEL)");
  const [toCity, setToCity] = useState("Manali (Kullu)");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const transportVehicles = [
    {
      id: "tr-1",
      name: "Volvo 9600 Multi-Axle Luxury Sleeper",
      category: "Bus",
      categoryIcon: Bus,
      vehicleModel: "Volvo 9600 B11R 15-Metre Coach",
      operator: "Himachal Tourism Royal Express",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      from: "New Delhi (ISBT Kashmiri Gate)",
      to: "Manali Private Bus Stand",
      depTime: "18:30",
      arrTime: "07:30 (+1 Day)",
      duration: "13 hrs",
      price: 1650,
      badge: "Overnight Sleeper",
      rating: 4.8,
      seatsLeft: 6,
      seatsConfig: "2+1 Upper & Lower Air-Suspension Berths",
      specs: ["15-Metre Multi-Axle Chassis", "Electronically Controlled Air Suspension", "460 HP Euro VI Engine"],
      amenities: ["Flat Bed Sleeper", "USB Fast Charger", "Personal Reading Lamp", "Clean Blanket & Pillow", "Live GPS Tracking", "Mineral Water Bottle"]
    },
    {
      id: "tr-2",
      name: "Airbus A320neo Commercial Jetliner",
      category: "Flight",
      categoryIcon: Plane,
      vehicleModel: "Airbus A320neo (Twin Turbofan)",
      operator: "IndiGo 6E-2144 (Non-Stop)",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
      from: "New Delhi (DEL Terminal 3)",
      to: "Goa (GOX / Mopa International)",
      depTime: "06:15",
      arrTime: "08:45",
      duration: "2h 30m",
      price: 4899,
      badge: "Fastest Non-Stop",
      rating: 4.9,
      seatsLeft: 12,
      seatsConfig: "3+3 Slimline Ergonomic Leather Recliners",
      specs: ["Cruising Altitude 38,000 FT", "Pratt & Whitney PurePower Turbofans", "Quiet Sky Interior Cabin"],
      amenities: ["15kg Check-in + 7kg Cabin", "Pre-book Hot Meal", "USB at Every Seat", "On-Time Guarantee", "Flight Radar Tracking"]
    },
    {
      id: "tr-3",
      name: "Vande Bharat Semi-High-Speed Express",
      category: "Train",
      categoryIcon: Train,
      vehicleModel: "Trainset 16 (Aerodynamic Electric Multiple Unit)",
      operator: "Indian Railways (Train #20979)",
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
      from: "Udaipur City (UDZ)",
      to: "Jaipur Junction (JP)",
      depTime: "07:50",
      arrTime: "14:05",
      duration: "6h 15m",
      price: 1330,
      badge: "Executive AC Chair",
      rating: 4.9,
      seatsLeft: 18,
      seatsConfig: "2+2 180° Rotatable Plush Velvet Chairs",
      specs: ["Top Speed 160 km/h", "Regenerative Braking", "Bio-Vacuum Toilets & Automatic Sliding Doors"],
      amenities: ["Complimentary Tea & Breakfast", "Wide Panoramic Windows", "Infotainment Wi-Fi Screen", "Mobile Charging Socket", "CCTV Security"]
    },
    {
      id: "tr-4",
      name: "Toyota Innova Crysta Executive SUV Cab",
      category: "Cab",
      categoryIcon: Car,
      vehicleModel: "Toyota Innova Crysta 2.4 ZX Diesel",
      operator: "TravelMate Chauffeur Fleet",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      from: "Mumbai (CSMT / Airport)",
      to: "Lonavala Hill Station",
      depTime: "On-Demand (Flexible)",
      arrTime: "2h 15m Express Highway Drive",
      duration: "2h 15m",
      price: 2800,
      badge: "Private Chauffeur",
      rating: 4.9,
      seatsLeft: 4,
      seatsConfig: "Captain Chairs (6+1 Seater)",
      specs: ["Dual Air Conditioning", "Rear Seat Reclining", "High Safety Rating & ABS"],
      amenities: ["Doorstep Pickup & Drop", "Toll & Fastag Included", "Bottled Water & Tissues", "Sanitized Interior", "Experienced Mountain Chauffeur"]
    },
    {
      id: "tr-5",
      name: "Catamaran High-Speed Island Ferry",
      category: "Ferry",
      categoryIcon: Ship,
      vehicleModel: "Twin-Hull Aluminum Hydrofoil Catamaran",
      operator: "Makruzz Gold Marine Lines",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
      from: "Port Blair (Phoenix Bay Jetty)",
      to: "Havelock Island (Swaraj Dweep)",
      depTime: "08:00",
      arrTime: "09:30",
      duration: "1h 30m",
      price: 1850,
      badge: "Ocean Express",
      rating: 4.9,
      seatsLeft: 9,
      seatsConfig: "Tiered Luxury Ocean-View Recliners",
      specs: ["32 Knots Cruising Speed", "Fully Air Conditioned Salon", "Advanced Radar & Stabilization"],
      amenities: ["Panoramic Ocean Windows", "Snack & Beverage Kiosk", "Lifejackets & Marine Safety", "Luggage Tagged Handling"]
    },
    {
      id: "tr-6",
      name: "Scania Metrolink HD Multi-Axle Tourist Coach",
      category: "Bus",
      categoryIcon: Bus,
      vehicleModel: "Scania Metrolink 14.5m HD Euro-V",
      operator: "Southern Cross Luxury Lines",
      image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
      from: "Bengaluru (Majestic)",
      to: "Ooty (Charing Cross)",
      depTime: "22:15",
      arrTime: "06:45 (+1 Day)",
      duration: "8h 30m",
      price: 1450,
      badge: "Overnight Sleeper",
      rating: 4.7,
      seatsLeft: 8,
      seatsConfig: "Spacious Single & Double Sleeper Pods",
      specs: ["14.5 Metre Heavy Duty Chassis", "Opticruise 8-Speed Automated Gearbox", "Hydrodynamic Retarder"],
      amenities: ["Air Suspension Gliding Ride", "Privacy Curtains", "Clean Duvet", "Bottled Water", "Emergency Exit Windows"]
    }
  ];

  const categories = ["All", "Bus", "Flight", "Train", "Cab", "Ferry"];

  const filteredVehicles = transportVehicles.filter((v) => {
    if (selectedFilter === "All") return true;
    return v.category === selectedFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-2">
          <Plane className="w-3.5 h-3.5" /> Intercity Connectivity & Fleet
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Transport & Vehicle Finder
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Inspect real vehicle photos, seating specifications, onboard amenities, and live ticket pricing across air, rail, road, and water.
        </p>
      </div>

      {/* Search Route Widget */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departure City</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Arrival Destination</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#2D5A27] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
            />
          </div>
        </div>

        <div className="md:pt-5">
          <button className="w-full py-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Search className="w-4 h-4" /> Check Real-Time Availability
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedFilter === cat
                ? "bg-[#2D5A27] text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat === "All" ? "All Modes" : `${cat}s`}
          </button>
        ))}
      </div>

      {/* Vehicle Cards Grid with High-Res Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredVehicles.map((v) => {
          const CategoryIcon = v.categoryIcon;
          return (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              {/* Real Vehicle Image & Overlay Badges */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-900 group">
                <SafeImage
                  src={v.image}
                  alt={v.name}
                  category="transport"
                  contextName={v.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badge: Mode + Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-white/95 text-slate-900 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                    <CategoryIcon className="w-3.5 h-3.5 text-[#2D5A27]" />
                    {v.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2D5A27] text-white shadow-sm">
                    {v.badge}
                  </span>
                </div>

                {/* Seats left indicator */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/95 text-white backdrop-blur-md">
                  {v.seatsLeft} seats left
                </div>

                {/* Bottom Overlay Info on Image */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
                    {v.operator}
                  </span>
                  <h3 className="text-xl font-black leading-tight drop-shadow-sm">{v.name}</h3>
                  <p className="text-xs text-slate-200 mt-0.5">{v.vehicleModel}</p>
                </div>
              </div>

              {/* Route & Timings Section */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Origin to Destination Bar */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">Departure</span>
                      <span className="text-sm font-extrabold text-slate-900 block">{v.depTime}</span>
                      <span className="text-xs text-slate-600 truncate block">{v.from}</span>
                    </div>

                    <div className="flex flex-col items-center px-2">
                      <span className="text-[10px] font-extrabold text-[#2D5A27] bg-[#E8F3E6] px-2 py-0.5 rounded-full whitespace-nowrap">
                        {v.duration}
                      </span>
                      <div className="w-12 h-0.5 bg-slate-300 my-1 relative">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 absolute -right-1.5 -top-1.5" />
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">Arrival</span>
                      <span className="text-sm font-extrabold text-slate-900 block">{v.arrTime}</span>
                      <span className="text-xs text-slate-600 truncate block">{v.to}</span>
                    </div>
                  </div>

                  {/* Seating Specs */}
                  <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-700 bg-emerald-50/60 px-3 py-2 rounded-xl border border-emerald-100">
                    <Users className="w-4 h-4 text-[#2D5A27] shrink-0" />
                    <span><strong>Seating:</strong> {v.seatsConfig}</span>
                  </div>

                  {/* Vehicle Technical Highlights */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {v.specs.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>

                  {/* Onboard Amenities List */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Included Amenities
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      {v.amenities.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Fare</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#2D5A27]">₹{v.price.toLocaleString()}</span>
                      <span className="text-xs text-slate-500">/ passenger</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Direct Route
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
