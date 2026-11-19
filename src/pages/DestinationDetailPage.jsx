import React, { useState, useEffect } from "react";
import { useTravel } from "../context/TravelContext";
import DestinationMap from "../components/DestinationMap";
import WeatherCard from "../components/WeatherCard";
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  CloudSun,
  Users,
  Languages,
  ArrowLeft,
  Heart,
  Plane,
  Bus,
  Train,
  Hotel,
  Utensils,
  Car,
  Compass,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CheckCircle2,
  ShieldCheck,
  Calculator
} from "lucide-react";
import SafeImage from "../components/SafeImage";

// Fallback image resolvers ensuring 100% of cards always render high-resolution images
const getActivityFallbackImage = (name = "", destName = "") => {
  const n = (name + " " + destName).toLowerCase();
  if (n.includes("cable") || n.includes("ropeway") || n.includes("gondola") || n.includes("chairlift"))
    return "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80";
  if (n.includes("gorson") || n.includes("bugyal") || (n.includes("snow") && n.includes("trek")))
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80";
  if (n.includes("ski") || n.includes("snowboard"))
    return "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80";
  if (n.includes("paraglid") || n.includes("solang") || n.includes("sky"))
    return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80";
  if (n.includes("raft") || n.includes("beas") || n.includes("river") || n.includes("water") || n.includes("ganga"))
    return "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=600&q=80";
  if (n.includes("trek") || n.includes("hike") || n.includes("hampta") || n.includes("trail") || n.includes("jogini"))
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80";
  if (n.includes("snow") || n.includes("rohtang") || n.includes("sledge") || n.includes("scooter") || n.includes("glacier"))
    return "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80";
  if (n.includes("scuba") || n.includes("dive") || n.includes("snorkel"))
    return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80";
  if (n.includes("boat") || n.includes("cruise") || n.includes("kayak") || n.includes("pichola"))
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";
  if (n.includes("cafe") || n.includes("hop") || n.includes("bazaar") || n.includes("market") || n.includes("old manali"))
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80";
  if (n.includes("safari") || n.includes("jungle") || n.includes("wildlife") || n.includes("tiger") || n.includes("leopard"))
    return "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80";
  if (n.includes("dance") || n.includes("folk") || n.includes("cultural") || n.includes("haveli"))
    return "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80";
  if (n.includes("palace") || n.includes("fort") || n.includes("temple") || n.includes("castle"))
    return "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80";
  return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80";
};

const getTransportFallbackImage = (option = "", destName = "") => {
  const o = (option + " " + destName).toLowerCase();
  if (o.includes("cable") || o.includes("ropeway") || o.includes("gondola") || o.includes("chairlift"))
    return "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80";
  if (o.includes("snow taxi") || o.includes("4x4") || o.includes("thar") || o.includes("jeep") || o.includes("gypsy") || o.includes("suv"))
    return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80";
  if (o.includes("enfield") || o.includes("himalayan") || o.includes("bike") || o.includes("motorcycle"))
    return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80";
  if (o.includes("scooter") || o.includes("activa") || o.includes("vespa") || o.includes("scoopy"))
    return "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80";
  if (o.includes("auto") || o.includes("rickshaw") || o.includes("tuk") || o.includes("e-rickshaw"))
    return "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80";
  if (o.includes("bus") || o.includes("volvo") || o.includes("coach") || o.includes("tempo"))
    return "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80";
  if (o.includes("boat") || o.includes("shikara") || o.includes("ferry") || o.includes("cruise") || o.includes("abra"))
    return "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80";
  if (o.includes("train") || o.includes("toy train") || o.includes("railway") || o.includes("metro"))
    return "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=600&q=80";
  if (o.includes("taxi") || o.includes("cab") || o.includes("union") || o.includes("innova") || o.includes("car"))
    return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80";
  return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80";
};

const getStayFallbackImage = (name = "", destName = "") => {
  const s = (name + " " + destName).toLowerCase();
  if (s.includes("gmvn") || s.includes("ski resort") || s.includes("cliff top") || s.includes("auli") || s.includes("snow") || s.includes("chalet"))
    return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80";
  if (s.includes("zostel") || s.includes("hostel") || s.includes("hosteller") || s.includes("pod") || s.includes("bunk"))
    return "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80";
  if (s.includes("palace") || s.includes("rambagh") || s.includes("lake palace") || s.includes("taj") || s.includes("oberoi") || s.includes("brijrama"))
    return "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80";
  if (s.includes("tent") || s.includes("camp") || s.includes("glamp") || s.includes("safari"))
    return "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80";
  if (s.includes("villa") || s.includes("cottage") || s.includes("homestay") || s.includes("bungalow") || s.includes("retreat"))
    return "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80";
  return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80";
};

const getFoodFallbackImage = (name = "", destName = "") => {
  const f = (name + " " + destName).toLowerCase();
  if (f.includes("siddu") || f.includes("ghee") || f.includes("bread") || f.includes("roti") || f.includes("naan") || f.includes("kulcha"))
    return "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80";
  if (f.includes("trout") || f.includes("fish") || f.includes("fry") || f.includes("prawn") || f.includes("seafood"))
    return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80";
  if (f.includes("pizza") || f.includes("crumble") || f.includes("pasta") || f.includes("bakery") || f.includes("pie"))
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80";
  if (f.includes("thukpa") || f.includes("momo") || f.includes("noodle") || f.includes("tibetan") || f.includes("soup"))
    return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80";
  if (f.includes("dal") || f.includes("baati") || f.includes("churma") || f.includes("thali") || f.includes("paneer"))
    return "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80";
  if (f.includes("laal") || f.includes("maas") || f.includes("mutton") || f.includes("curry") || f.includes("vindaloo"))
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80";
  if (f.includes("coffee") || f.includes("tea") || f.includes("chai") || f.includes("kulhad") || f.includes("cafe"))
    return "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80";
  if (f.includes("biryani") || f.includes("rice") || f.includes("pulao"))
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80";
  if (f.includes("dessert") || f.includes("sweet") || f.includes("gelato") || f.includes("cake") || f.includes("bebinca"))
    return "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80";
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80";
};

export default function DestinationDetailPage() {
  const {
    selectedDestinationId,
    navigate,
    savedWishlist,
    toggleBookmark,
    setBudgetDestination,
    getDestinationById
  } = useTravel();

  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedDays, setExpandedDays] = useState({ 1: true });

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const id = selectedDestinationId || "manali";
        const result = await getDestinationById(id);
        if (isMounted) {
          if (result && result.id) {
            setDest(result);
          } else {
            setError(`Destination "${id}" could not be found.`);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load destination details. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedDestinationId, getDestinationById]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
        <div className="h-[420px] sm:h-[480px] w-full bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-20 bg-slate-200 rounded-2xl"></div>
          <div className="h-20 bg-slate-200 rounded-2xl"></div>
          <div className="h-20 bg-slate-200 rounded-2xl"></div>
          <div className="h-20 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  if (error || !dest) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center shadow-inner">
          <MapPin className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Destination Not Found</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          {error || "We couldn't locate the destination you are looking for in our database catalog."}
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate("destinations")}
            className="px-6 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Browse All Destinations
          </button>
          <button
            onClick={() => navigate("home")}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isBookmarked = savedWishlist.includes(dest.id);
  const tags = Array.isArray(dest.tags) ? dest.tags : [];
  const attractions = Array.isArray(dest.attractions) ? dest.attractions : [];
  const howToReach = Array.isArray(dest.howToReach) ? dest.howToReach : [];
  const stays = Array.isArray(dest.stays) ? dest.stays : [];
  const food = Array.isArray(dest.food) ? dest.food : [];
  const localTransport = Array.isArray(dest.localTransport) ? dest.localTransport : [];
  const activities = Array.isArray(dest.activities) ? dest.activities : [];
  const itinerary = Array.isArray(dest.itinerary) ? dest.itinerary : [];
  const basePrice = dest.basePrice || dest.base_price || dest.estimated_budget || 0;
  const reviewsCount = dest.reviewsCount || dest.reviews_count || 120;
  const bestTime = dest.bestTime || dest.best_season || "Year-round";
  const region = dest.region || dest.location || "India";
  const country = dest.country || "India";
  const category = dest.category || "Mountains";
  const latitude = dest.latitude || 0.0;
  const longitude = dest.longitude || 0.0;
  const overview = dest.overview || dest.description || "";
  const weather = dest.weather || "Pleasant";
  const idealFor = dest.idealFor || "Couples, Families & Solo Explorers";
  const language = dest.language || "Hindi & English";

  const tabs = [
    { id: "overview", label: "Overview", icon: Compass },
    { id: "how-to-reach", label: "How to Reach", icon: Plane },
    { id: "stay", label: "Stay", icon: Hotel },
    { id: "food", label: "Food", icon: Utensils },
    { id: "local-transport", label: "Local Transport", icon: Car },
    { id: "activities", label: "Activities", icon: Sparkles },
    { id: "itinerary", label: "Itinerary", icon: Calendar }
  ];

  const toggleDay = (dayNum) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum]
    }));
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Back button bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate("destinations")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#2D5A27] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all destinations
        </button>
      </div>

      {/* 1. Full-Width Hero Banner */}
      <section className="relative h-[420px] sm:h-[480px] w-full overflow-hidden">
        <SafeImage
          src={dest.image}
          alt={dest.name}
          category="destination"
          contextName={dest.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20"></div>

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10 text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#4ADE80] text-[#152912] font-bold text-xs uppercase tracking-wider">
                  Featured Destination
                </span>
                <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                  <Clock className="w-3 h-3 text-[#4ADE80]" /> {dest.duration}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {dest.name},{" "}
                <span className="text-slate-300 font-light">{region}, {country}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{dest.rating}</span>
                  <span className="text-slate-300 font-normal">
                    ({reviewsCount} verified reviews)
                  </span>
                </div>
                <span>•</span>
                <span className="text-[#4ADE80] font-semibold">
                  From ₹{basePrice.toLocaleString()} / person
                </span>
              </div>
            </div>

            {/* CTA Buttons on Hero */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleBookmark(dest.id)}
                className={`p-3 rounded-2xl backdrop-blur-md transition-all ${
                  isBookmarked
                    ? "bg-rose-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
                title="Save to wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${isBookmarked ? "fill-white" : ""}`}
                />
              </button>
              <button
                onClick={() => {
                  setBudgetDestination(dest);
                  navigate("budget-planner");
                }}
                className="px-6 py-3 rounded-2xl bg-[#4ADE80] hover:bg-[#86EFAC] text-[#152912] font-black text-sm tracking-wide transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Customize & Plan Trip</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sticky Tab Navigation Bar */}
      <div className="sticky top-18 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto py-2.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#2D5A27] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Content Container (Two-Column Responsive Layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Info Cards & Tabbed Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                  <Calendar className="w-4 h-4 text-[#2D5A27]" /> Best Time
                </div>
                <p className="text-sm font-bold text-slate-800">{bestTime}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                  <Clock className="w-4 h-4 text-[#2D5A27]" /> Duration
                </div>
                <p className="text-sm font-bold text-slate-800">{dest.duration}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                  <Users className="w-4 h-4 text-[#2D5A27]" /> Ideal For
                </div>
                <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2" title={idealFor}>{idealFor}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                  <Languages className="w-4 h-4 text-[#2D5A27]" /> Language
                </div>
                <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2" title={language}>{language}</p>
              </div>
            </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-10">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h3 className="text-xl font-extrabold text-slate-900">About {dest.name}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">{category}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#E8F3E6] text-[#2D5A27]">{country}</span>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                {overview}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Attractions Grid */}
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-4">
                Top Attractions & Landmarks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {attractions.map((att, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow group flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <SafeImage
                        src={att.image || dest.image}
                        alt={att.name}
                        category="activity"
                        contextName={`${att.name} ${dest.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold">
                        {att.tag}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#2D5A27] transition-colors">
                          {att.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                          {att.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: How to Reach */}
        {activeTab === "how-to-reach" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">
              How to Reach {dest.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howToReach.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3E6] text-[#2D5A27] flex items-center justify-center font-bold">
                    {item.mode === "By Air" && <Plane className="w-5 h-5" />}
                    {item.mode === "By Road" && <Bus className="w-5 h-5" />}
                    {item.mode === "By Train" && <Train className="w-5 h-5" />}
                    {item.mode !== "By Air" && item.mode !== "By Road" && item.mode !== "By Train" && <Compass className="w-5 h-5" />}
                  </div>
                  <h4 className="font-bold text-base text-slate-900">{item.mode}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Stay */}
        {activeTab === "stay" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900">
                Recommended Stays in {dest.name}
              </h3>
              <button
                onClick={() => navigate("stays")}
                className="text-xs font-bold text-[#2D5A27] hover:underline"
              >
                Browse all stays →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stays.map((stay, i) => {
                const stayImg = stay.image || getStayFallbackImage(stay.name, dest.name);
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all group flex flex-col"
                  >
                    <div className="h-44 overflow-hidden relative bg-slate-100">
                      <SafeImage
                        src={stay.image}
                        alt={stay.name}
                        category="stay"
                        contextName={`${stay.name} ${dest.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-white/90 font-bold text-[11px] text-amber-500">
                        ★ {stay.rating}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{stay.name}</h4>
                        <p className="text-xs text-slate-500">{stay.type}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Tariff</span>
                          <span className="font-extrabold text-base text-[#2D5A27]">
                            {stay.price && stay.price.includes("/") ? stay.price : `${stay.price} / night`}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">Standard Room</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Food */}
        {activeTab === "food" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Must-Try Regional Dishes & Famous Cafes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Handpicked heritage delicacies, rustic mountain flavors, and celebrated local cafes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {food.map((f, i) => {
                const foodImg = f.image || getFoodFallbackImage(f.name, dest.name);
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md hover:border-[#2D5A27]/40 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <SafeImage
                          src={f.image}
                          alt={f.name}
                          category="food"
                          contextName={`${f.name} ${dest.name}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                          Must Taste
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#2D5A27] transition-colors leading-snug">
                          {f.name}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {f.type}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 text-xs">
                        <span className="text-slate-400 font-medium">Recommended At</span>
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <Utensils className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                          <span className="leading-snug break-words">{f.place}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Local Transport */}
        {activeTab === "local-transport" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Getting Around {dest.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified mountain & city vehicle rentals, certified taxi union operators, and public transit.
                </p>
              </div>
              <button
                onClick={() => navigate("rentals")}
                className="text-xs font-bold text-[#2D5A27] hover:underline self-start sm:self-auto"
              >
                Browse rental fleet & gear →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {localTransport.map((tr, i) => {
                const trImg = tr.image || getTransportFallbackImage(tr.option, dest.name);
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md hover:border-[#2D5A27]/40 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <SafeImage
                          src={tr.image}
                          alt={tr.option}
                          category="rental"
                          contextName={`${tr.option} ${dest.name}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[#2D5A27] text-[11px] font-bold shadow-xs flex items-center gap-1">
                          <Car className="w-3 h-3" /> Local Transit
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#2D5A27] transition-colors">
                          {tr.option}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {tr.note}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Standard Fare</span>
                          <span className="font-extrabold text-base text-[#2D5A27]">{tr.cost}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">Local Transit</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 6: Activities */}
        {activeTab === "activities" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Top Activities & Experiences in {dest.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-adrenaline adventures, guided high-altitude treks, and cultural discoveries.
                </p>
              </div>
              <button
                onClick={() => navigate("activities")}
                className="text-xs font-bold text-[#2D5A27] hover:underline self-start sm:self-auto"
              >
                Browse all platform activities →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activities.map((act, i) => {
                const actImg = act.image || getActivityFallbackImage(act.name, dest.name);
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md hover:border-[#2D5A27]/40 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <SafeImage
                          src={act.image}
                          alt={act.name}
                          category="activity"
                          contextName={`${act.name} ${dest.name}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#E8F3E6]/95 backdrop-blur-md text-[#2D5A27] text-[10px] font-extrabold uppercase shadow-xs">
                          {act.badge}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#2D5A27] transition-colors leading-snug">
                          {act.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Duration: {act.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Ticket Price</span>
                          <span className="font-extrabold text-base text-[#2D5A27]">
                            {act.price && act.price.includes("/") ? act.price : `${act.price} / ticket`}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">Per Person</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 7: Day-by-Day Detailed Itinerary */}
        {activeTab === "itinerary" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Day-by-Day Detailed Itinerary
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Optimized for seamless transitions, local dining, and zero fatigue.
                </p>
              </div>
              <button
                onClick={() => {
                  const allOpen = {};
                  itinerary.forEach((d) => (allOpen[d.day] = true));
                  setExpandedDays(allOpen);
                }}
                className="text-xs font-bold text-[#2D5A27] hover:underline"
              >
                Expand All Days
              </button>
            </div>

            <div className="space-y-4">
              {itinerary.map((dayItem) => {
                const isOpen = !!expandedDays[dayItem.day];
                return (
                  <div
                    key={dayItem.day}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
                  >
                    {/* Header Toggle */}
                    <button
                      onClick={() => toggleDay(dayItem.day)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-[#2D5A27] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                          D{dayItem.day}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-900">
                            Day {dayItem.day}: {dayItem.title}
                          </h4>
                          <span className="text-xs text-slate-400">
                            Morning, Afternoon & Evening Schedule
                          </span>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    {/* Expandable Body */}
                    {isOpen && (
                      <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-4 text-xs sm:text-sm animate-in fade-in duration-150">
                        {/* Morning */}
                        <div className="flex items-start gap-3">
                          <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-bold text-[11px] shrink-0">
                            Morning
                          </span>
                          <p className="text-slate-700 leading-relaxed">{dayItem.morning}</p>
                        </div>

                        {/* Afternoon */}
                        <div className="flex items-start gap-3">
                          <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 font-bold text-[11px] shrink-0">
                            Afternoon
                          </span>
                          <p className="text-slate-700 leading-relaxed">{dayItem.afternoon}</p>
                        </div>

                        {/* Evening */}
                        <div className="flex items-start gap-3">
                          <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-900 font-bold text-[11px] shrink-0">
                            Evening
                          </span>
                          <p className="text-slate-700 leading-relaxed">{dayItem.evening}</p>
                        </div>

                        {/* Insider Tip */}
                        {dayItem.tip && (
                          <div className="mt-3 p-3 rounded-xl bg-[#F4F8F3] border border-[#2D5A27]/20 flex items-start gap-2.5 text-xs text-[#1E3C1B]">
                            <Lightbulb className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-bold">Insider Travel Tip: </strong>
                              <span>{dayItem.tip}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

            {/* Quick Trip Planning Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1E3C1B] to-[#2D5A27] text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#86EFAC] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Ready to explore {dest.name}?
                </div>
                <h4 className="text-lg sm:text-xl font-black">
                  Customize stays, transport, rentals & activities in Trip Planner
                </h4>
                <p className="text-xs sm:text-sm text-slate-200">
                  Select your exact stay, transit, rental vehicles, and guided tours to calculate real dynamic trip pricing.
                </p>
              </div>
              <button
                onClick={() => {
                  setBudgetDestination(dest.id);
                  navigate("budget-planner");
                }}
                className="px-6 py-3 rounded-2xl bg-[#4ADE80] hover:bg-[#86EFAC] text-[#152912] font-black text-sm whitespace-nowrap transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Calculator className="w-4 h-4" /> Plan & Customize Trip
              </button>
            </div>
          </div>

          {/* Right Column: Planner Card, Live Weather & Interactive Map */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-32">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[#2D5A27] font-bold text-xs uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-[#2D5A27]" /> Plan This Trip
              </div>
              <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                Calculate & book your custom {dest.name} trip
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose from verified hotels, intercity transit, rental vehicles, and curated tours with dynamic group pricing.
              </p>
              <button
                onClick={() => {
                  setBudgetDestination(dest.id);
                  navigate("budget-planner");
                }}
                className="w-full py-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-[#86EFAC]" /> Customize in Trip Planner
              </button>
            </div>

            <WeatherCard destinationId={dest.id} />
            <DestinationMap
              latitude={latitude}
              longitude={longitude}
              destinationName={dest.name}
              locationName={region}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
