import React, { useState, useEffect } from "react";
import { useTravel } from "../context/TravelContext";
import {
  Search,
  MapPin,
  Clock,
  Star,
  Heart,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Globe,
  Compass,
  ChevronDown
} from "lucide-react";
import SafeImage from "../components/SafeImage";

// Contextual fallback image resolver based on category, region, and destination name
const getDestinationFallbackImage = (dest = {}) => {
  const cat = (dest.category || "").toLowerCase();
  const name = (dest.name || "").toLowerCase();
  const country = (dest.country || "").toLowerCase();

  if (cat.includes("beach") || name.includes("goa") || name.includes("bali") || name.includes("maldives") || name.includes("phuket")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
  }
  if (cat.includes("mountain") || cat.includes("adventure") || name.includes("manali") || name.includes("leh") || name.includes("swiss") || name.includes("alps")) {
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80";
  }
  if (cat.includes("heritage") || cat.includes("spiritual") || cat.includes("religio") || name.includes("varanasi") || name.includes("jaipur") || name.includes("rome") || name.includes("athens")) {
    return "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80";
  }
  if (cat.includes("wildlife") || name.includes("safari") || name.includes("serengeti") || name.includes("kaziranga") || name.includes("corbett")) {
    return "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80";
  }
  if (country && country !== "india") {
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80";
  }
  return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
};

// Safe price formatter: returns formatted INR or "Price unavailable", never NaN
const formatPrice = (dest) => {
  const raw = dest?.basePrice ?? dest?.base_price ?? dest?.estimated_budget;
  if (raw === null || raw === undefined || raw === "") return "Price unavailable";
  const num = Number(raw);
  if (isNaN(num) || num <= 0) return "Price unavailable";
  return `₹${num.toLocaleString("en-IN")}`;
};

export default function DestinationsPage() {
  const {
    navigate,
    savedWishlist,
    toggleBookmark,
    destinations,
    destinationsLoading,
    destinationsError,
    refreshDestinations,
    routeParams
  } = useTravel();

  const [filterCountry, setFilterCountry] = useState("All");
  const [filterStyle, setFilterStyle] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState(150000);
  const [visibleCount, setVisibleCount] = useState(24);

  // Sync country and style from route navigation params
  useEffect(() => {
    if (routeParams?.country) {
      setFilterCountry(routeParams.country);
      setVisibleCount(24);
    }
    if (routeParams?.style) {
      setFilterStyle(routeParams.style);
      setVisibleCount(24);
    }
  }, [routeParams]);

  const activeList = Array.isArray(destinations) && destinations.length > 0 ? destinations : [];

  // Pre-calculate country counts
  const indiaTotal = activeList.filter(
    (d) => (d.country || "").toLowerCase() === "india"
  ).length;
  const intlTotal = activeList.filter(
    (d) => (d.country || "").toLowerCase() !== "india"
  ).length;

  const filtered = activeList.filter((dest) => {
    if (!dest) return false;
    const isIndia = (dest.country || "").toLowerCase() === "india";
    let matchesCountry = true;
    if (filterCountry === "India") matchesCountry = isIndia;
    if (filterCountry === "International") matchesCountry = !isIndia;

    const destCategory = dest.category || "";
    const destStyles = Array.isArray(dest.styles) ? dest.styles.filter(Boolean) : [destCategory];
    const matchesStyle =
      filterStyle === "All" ||
      destStyles.some((s) => String(s).toLowerCase() === filterStyle.toLowerCase()) ||
      destCategory.toLowerCase() === filterStyle.toLowerCase() ||
      (filterStyle.toLowerCase() === "spiritual" && destCategory.toLowerCase() === "religious") ||
      (filterStyle.toLowerCase() === "religious" && destCategory.toLowerCase() === "spiritual");

    const nameStr = (dest.name || "").toLowerCase();
    const regionStr = (dest.region || dest.location || "").toLowerCase();
    const countryStr = (dest.country || "").toLowerCase();
    const tagList = Array.isArray(dest.tags) ? dest.tags.filter(Boolean) : [];
    const searchStr = searchTerm.toLowerCase();

    const matchesSearch =
      !searchTerm.trim() ||
      nameStr.includes(searchStr) ||
      regionStr.includes(searchStr) ||
      countryStr.includes(searchStr) ||
      destCategory.toLowerCase().includes(searchStr) ||
      tagList.some((t) => String(t).toLowerCase().includes(searchStr));

    const price = Number(dest.basePrice || dest.base_price || dest.estimated_budget || 0);
    const matchesPrice = isNaN(price) || price <= maxPrice;

    return matchesCountry && matchesStyle && matchesSearch && matchesPrice;
  });

  // Slice paginated list safely to prevent out-of-bounds or undefined references
  const paginatedList = filtered.slice(0, visibleCount);

  const categories = [
    "All",
    "Mountains",
    "Beaches",
    "Heritage",
    "Wildlife",
    "Romantic",
    "Adventure",
    "Spiritual",
    "City Escapes",
    "Nature"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> 120 Curated Global & Indian Destinations
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore All Destinations
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-1">
          Discover {activeList.length} verified destinations across {indiaTotal} Indian wonders and {intlTotal} international gateways.
        </p>
      </div>

      {/* Country Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { key: "All", label: "All Destinations", count: activeList.length, icon: Globe },
          { key: "India", label: "Incredible India", count: indiaTotal, icon: Compass },
          { key: "International", label: "International", count: intlTotal, icon: Globe }
        ].map((tab) => {
          const isSelected = filterCountry === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setFilterCountry(tab.key);
                setVisibleCount(24);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-[#2D5A27] text-white shadow-md shadow-[#2D5A27]/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                  isSelected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(24);
              }}
              placeholder="Search by city, country, or vibes (e.g. Paris, Goa, snow)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
            />
          </div>

          {/* Price Range Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 shrink-0">Max Budget:</span>
            <input
              type="range"
              min="5000"
              max="150000"
              step="5000"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setVisibleCount(24);
              }}
              className="w-32 sm:w-40 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2D5A27]"
            />
            <span className="text-xs font-extrabold text-[#2D5A27] shrink-0">
              ₹{maxPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Style Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((st) => (
            <button
              key={st}
              onClick={() => {
                setFilterStyle(st);
                setVisibleCount(24);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterStyle === st
                  ? "bg-[#2D5A27] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-auto shrink-0">
            Showing {filtered.length} locations
          </span>
        </div>
      </div>

      {/* Server Offline / Retry Banner */}
      {destinationsError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{destinationsError}</span>
          </div>
          <button
            onClick={refreshDestinations}
            className="px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 font-bold text-amber-900 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry Server
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {destinationsLoading && activeList.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-slate-200 h-96 flex flex-col">
              <div className="h-60 bg-slate-200 w-full"></div>
              <div className="p-5 flex-1 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-8 bg-slate-200 rounded-xl mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!destinationsLoading && filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No destinations match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, increasing your budget limit, or clearing the category filter.
          </p>
          <button
            onClick={() => {
              setFilterCountry("All");
              setFilterStyle("All");
              setSearchTerm("");
              setMaxPrice(150000);
              setVisibleCount(24);
            }}
            className="px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#1E3C1B] transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Grid of Filtered Destinations */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {paginatedList.map((dest) => {
            const isBookmarked = savedWishlist.includes(dest.id);
            const formattedPrice = formatPrice(dest);
            const region = dest.region || dest.location || dest.country || "India";
            const tagline = dest.tagline || dest.description || `Explore the scenic beauty and attractions of ${dest.name}.`;
            const tags = Array.isArray(dest.tags) ? dest.tags.filter(Boolean) : [];
            const isIndia = (dest.country || "").toLowerCase() === "india";
            const fallbackImg = getDestinationFallbackImage(dest);
            const destRating = (dest.rating && !isNaN(Number(dest.rating))) ? Number(dest.rating).toFixed(1) : "4.8";

            return (
              <div
                key={dest.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image & Heart */}
                <div className="relative h-60 overflow-hidden bg-slate-100">
                  <SafeImage
                    src={dest.image}
                    alt={dest.name || "Destination"}
                    category="destination"
                    contextName={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                  <button
                    onClick={() => toggleBookmark(dest.id)}
                    aria-label={isBookmarked ? "Remove from wishlist" : "Save to wishlist"}
                    className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-500 shadow-md transition-all active:scale-90 z-10 cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isBookmarked ? "text-rose-500 fill-rose-500" : ""
                      }`}
                    />
                  </button>

                  {/* Country & Duration badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full backdrop-blur-md text-[11px] font-bold ${
                        isIndia
                          ? "bg-[#2D5A27]/90 text-white"
                          : "bg-blue-600/90 text-white"
                      }`}
                    >
                      {dest.country || "India"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#4ADE80]" />
                      {dest.duration || "Flexible Duration"}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <span className="font-medium text-slate-200 flex items-center gap-1 truncate max-w-[65%]">
                      <MapPin className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" /> {region}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-400 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" /> {destRating}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#2D5A27] transition-colors">
                        {dest.name}
                      </h3>
                      <div className="text-right">
                        <span className={`font-extrabold ${formattedPrice === "Price unavailable" ? "text-slate-500 text-xs" : "text-base text-[#2D5A27]"}`}>
                          {formattedPrice}
                        </span>
                        {formattedPrice !== "Price unavailable" && (
                          <span className="text-[10px] text-slate-400 block">/ person</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {tagline}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-50 text-[#2D5A27]">
                      {dest.category || "Discovery"}
                    </span>
                    {tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => navigate("destination-detail", { id: dest.id })}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>View Itinerary & Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination / Load More Button */}
      {visibleCount < filtered.length && (
        <div className="pt-8 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 24)}
            className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-[#2D5A27] border-2 border-[#2D5A27] font-bold text-sm tracking-wide transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Load More Destinations (Showing {paginatedList.length} of {filtered.length})</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
