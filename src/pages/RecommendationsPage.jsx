import React, { useState } from "react";
import { useTravel } from "../context/TravelContext";
import {
  Sparkles,
  MapPin,
  Clock,
  IndianRupee,
  Star,
  Heart,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Calculator,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Compass
} from "lucide-react";
import SafeImage from "../components/SafeImage";

export default function RecommendationsPage() {
  const {
    recommendationResults,
    recommendationsLoading,
    recommendationsError,
    fetchRecommendations,
    userPreferences,
    navigate,
    savedWishlist,
    toggleBookmark,
    setBudgetDestination
  } = useTravel();

  const [sortBy, setSortBy] = useState("match"); // "match" | "price-asc" | "price-desc" | "rating"
  const [selectedTag, setSelectedTag] = useState("All");

  // Filter and sort items
  let displayList = [...recommendationResults];

  if (selectedTag !== "All") {
    displayList = displayList.filter((d) => {
      const dStyles = Array.isArray(d.styles) ? d.styles : [d.category || ""];
      const dTags = Array.isArray(d.tags) ? d.tags : [];
      return (
        dStyles.includes(selectedTag) ||
        dTags.some((t) => (t || "").toLowerCase().includes(selectedTag.toLowerCase()))
      );
    });
  }

  if (sortBy === "match") {
    displayList.sort((a, b) => (b.match_score || b.matchScore || 0) - (a.match_score || a.matchScore || 0));
  } else if (sortBy === "price-asc") {
    displayList.sort(
      (a, b) =>
        Number(a.basePrice || a.base_price || a.estimated_budget || 0) -
        Number(b.basePrice || b.base_price || b.estimated_budget || 0)
    );
  } else if (sortBy === "price-desc") {
    displayList.sort(
      (a, b) =>
        Number(b.basePrice || b.base_price || b.estimated_budget || 0) -
        Number(a.basePrice || a.base_price || a.estimated_budget || 0)
    );
  } else if (sortBy === "rating") {
    displayList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  const handlePlanBudgetClick = (destOrId) => {
    setBudgetDestination(destOrId);
    navigate("budget-planner");
  };

  if (recommendationsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-[#E8F3E6] rounded-full text-[#2D5A27] mb-4 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D5A27]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Finding destinations for your trip...</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          Finding matching destinations for your budget, season, and travel style.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Error alert if any */}
      {recommendationsError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Unable to generate recommendations. Please try again.</span>
          </div>
          <button
            onClick={() => fetchRecommendations(userPreferences)}
            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" />
            Personalized For You
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Destinations Picked for You
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5">
            Tailored suggestions ranked specifically for your travel preferences.
          </p>
        </div>

        {/* User Preferences Summary Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
            Budget: <strong className="text-slate-900">{Number(userPreferences.budget) > 0 ? `₹${Number(userPreferences.budget).toLocaleString()}` : "Flexible / Any"}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
            Travelers: <strong className="text-slate-900">{userPreferences.travelers || 2}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
            Duration: <strong className="text-slate-900">{userPreferences.duration || "2 Days / 1 Night"}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
            Season: <strong className="text-slate-900">{userPreferences.season}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
            Style: <strong className="text-slate-900">{userPreferences.style}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
            With: <strong className="text-slate-900">{userPreferences.travelWith}</strong>
          </div>
          <button
            onClick={() => navigate("plan-trip")}
            className="px-3 py-1.5 rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#1E3C1B] transition-colors flex items-center gap-1 shadow-xs"
          >
            <RefreshCw className="w-3 h-3" /> Edit
          </button>
        </div>
      </div>

      {/* 2. Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["All", "Adventure", "Nature", "Relaxation", "Heritage"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#2D5A27] focus:outline-none text-slate-800"
          >
            <option value="match">Highest Match %</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* 3. Ranked Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {displayList.map((dest, idx) => {
          const isBookmarked = savedWishlist.includes(dest.id);
          const matchPercent = dest.match_score || dest.matchScore || Math.max(75, 96 - idx * 4);

          return (
            <div
              key={dest.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image & Match Badge */}
              <div className="relative h-60 overflow-hidden bg-slate-100">
                <SafeImage
                  src={dest.image}
                  alt={dest.name}
                  category="destination"
                  contextName={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                {/* Match Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#2D5A27] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md border border-[#4ADE80]/30">
                  <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
                  <span>{matchPercent}% Match</span>
                </div>

                {/* Bookmark Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(dest.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-500 hover:bg-white shadow-md transition-all active:scale-90 z-10"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isBookmarked ? "text-rose-500 fill-rose-500" : ""
                    }`}
                  />
                </button>

                {/* Duration & Star rating at bottom of photo */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3 text-[#4ADE80]" /> {dest.duration}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-amber-400 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-amber-400" /> {dest.rating || 4.8} ({dest.reviewsCount || dest.reviews_count || 120})
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#2D5A27] transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" /> {dest.region || dest.location || "India"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Est. Cost
                      </span>
                      <span className="text-lg font-black text-[#2D5A27]">
                        ₹{Number(dest.basePrice || dest.base_price || dest.estimated_budget || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">/ person</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2.5 leading-relaxed">
                    {dest.overview || dest.description || dest.tagline || ""}
                  </p>
                </div>

                {/* Recommendation Reasons List */}
                {Array.isArray(dest.reasons) && dest.reasons.length > 0 && (
                  <div className="bg-[#F8FAF8] rounded-2xl p-3 border border-[#2D5A27]/15 space-y-1.5">
                    <span className="text-[10px] font-extrabold text-[#2D5A27] uppercase tracking-wider block">
                      Why It's Picked For You
                    </span>
                    <ul className="space-y-1">
                      {dest.reasons.map((reason, rIdx) => (
                        <li key={rIdx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-snug">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(dest.tags || []).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-[#F4F8F3] text-[#2D5A27] border border-[#2D5A27]/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => navigate("destination-detail", { id: dest.id })}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handlePlanBudgetClick(dest)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-[#2D5A27] hover:bg-[#F4F8F3] text-slate-700 hover:text-[#2D5A27] text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    title="Calculate budget breakdown for this destination"
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>Budget</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(dest.id);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                      isBookmarked
                        ? "border-rose-300 bg-rose-50 text-rose-600"
                        : "border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-600"
                    }`}
                    title={isBookmarked ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isBookmarked ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{isBookmarked ? "Saved" : "Save"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayList.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <Compass className="w-12 h-12 text-[#2D5A27] mx-auto opacity-70" />
          <h3 className="text-xl font-bold text-slate-900">No matching destinations found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try selecting "All" categories or adjusting your budget and preferences to discover more places.
          </p>
          <button
            onClick={() => navigate("plan-trip")}
            className="px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white font-bold text-xs hover:bg-[#1E3C1B] transition-colors"
          >
            Adjust Trip Preferences
          </button>
        </div>
      )}
    </div>
  );
}
