import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTravel, parseDaysNights, formatDuration } from "../context/TravelContext";
import { destinations as fallbackDestinations } from "../data/destinations";
import {
  Sparkles,
  MapPin,
  IndianRupee,
  Clock,
  CloudSun,
  Compass,
  Users,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Loader2,
  Search,
  ChevronDown,
  X,
  Check,
  Plus,
  Minus,
  Calendar,
  Moon
} from "lucide-react";
import SafeImage from "../components/SafeImage";

export default function PlanTripPage() {
  const {
    userPreferences,
    setUserPreferences,
    fetchRecommendations,
    navigate,
    destinations: contextDestinations
  } = useTravel();

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const initDuration = userPreferences.duration || "2 Days / 1 Night";
  const initParsed = parseDaysNights(initDuration, userPreferences.days, userPreferences.nights);

  // Local form state initialized from context
  const [formData, setFormData] = useState({
    destination: userPreferences.destination || "",
    budget: userPreferences.budget || "",
    travelers: userPreferences.travelers || 2,
    days: initParsed.days,
    nights: initParsed.nights,
    duration: formatDuration(initParsed.days, initParsed.nights),
    season: userPreferences.season || "Winter",
    style: userPreferences.style || "Adventure",
    travelWith: userPreferences.travelWith || "Friends"
  });

  // Searchable Destination Dropdown State
  const [destSearch, setDestSearch] = useState("");
  const [isDestDropdownOpen, setIsDestDropdownOpen] = useState(false);
  const destDropdownRef = useRef(null);

  // Close destination dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (destDropdownRef.current && !destDropdownRef.current.contains(event.target)) {
        setIsDestDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Complete 120-destination catalog
  const allDestinations = useMemo(() => {
    const list =
      Array.isArray(contextDestinations) && contextDestinations.length > 0
        ? contextDestinations
        : fallbackDestinations;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [contextDestinations]);

  // Live filter for searchable destination dropdown
  const filteredDestinations = useMemo(() => {
    if (!destSearch.trim()) return allDestinations;
    const q = destSearch.toLowerCase().trim();
    return allDestinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.region && d.region.toLowerCase().includes(q)) ||
        (d.country && d.country.toLowerCase().includes(q)) ||
        (d.category && d.category.toLowerCase().includes(q))
    );
  }, [allDestinations, destSearch]);

  // Selected destination metadata
  const selectedDestObj = useMemo(() => {
    if (!formData.destination) return null;
    const target = formData.destination.toLowerCase().trim();
    return (
      allDestinations.find(
        (d) => d.name.toLowerCase() === target || d.id.toLowerCase() === target
      ) || null
    );
  }, [allDestinations, formData.destination]);

  // Budget Options per user requirements
  const budgetOptions = [
    { value: 5000, label: "₹5,000" },
    { value: 10000, label: "₹10,000" },
    { value: 15000, label: "₹15,000" },
    { value: 20000, label: "₹20,000" },
    { value: 25000, label: "₹25,000" },
    { value: 35000, label: "₹35,000" },
    { value: 50000, label: "₹50,000" },
    { value: 80000, label: "₹80,000" },
    { value: 100000, label: "₹1,00,000+" }
  ];

  const durationPresets = [
    { days: 1, nights: 0, label: "1 Day / 0 Nights" },
    { days: 2, nights: 1, label: "2 Days / 1 Night" },
    { days: 3, nights: 2, label: "3 Days / 2 Nights" },
    { days: 4, nights: 3, label: "4 Days / 3 Nights" },
    { days: 5, nights: 4, label: "5 Days / 4 Nights" },
    { days: 6, nights: 5, label: "6 Days / 5 Nights" },
    { days: 7, nights: 6, label: "7 Days / 6 Nights" }
  ];

  const handleDaysChange = (newDays) => {
    const d = Math.max(1, Math.min(14, newDays));
    setFormData((prev) => ({
      ...prev,
      days: d,
      duration: formatDuration(d, prev.nights)
    }));
  };

  const handleNightsChange = (newNights) => {
    const n = Math.max(0, Math.min(14, newNights));
    setFormData((prev) => ({
      ...prev,
      nights: n,
      duration: formatDuration(prev.days, n)
    }));
  };

  const handleTravelersChange = (newTravelers) => {
    const t = Math.max(1, Math.min(20, newTravelers));
    setFormData((prev) => ({ ...prev, travelers: t }));
  };

  const handlePresetDuration = (preset) => {
    setFormData((prev) => ({
      ...prev,
      days: preset.days,
      nights: preset.nights,
      duration: preset.label
    }));
  };

  const seasonOptions = ["Winter", "Summer", "Monsoon", "All Seasons"];
  const styleOptions = ["Adventure", "Nature", "Relaxation", "Heritage", "Romantic", "Wildlife"];
  const travelWithOptions = ["Friends", "Solo", "Couple", "Family"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.budget || Number(formData.budget) <= 0 || isNaN(Number(formData.budget))) {
      setErrorMsg("Please select your budget per person from the dropdown to find matching destinations.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const budgetNum = Number(formData.budget);
      const submissionData = {
        ...formData,
        budget: budgetNum,
        travelers: formData.travelers || 2,
        days: formData.days || 2,
        nights: formData.nights !== undefined ? formData.nights : 1,
        duration: formData.duration || formatDuration(formData.days || 2, formData.nights !== undefined ? formData.nights : 1)
      };
      setUserPreferences(submissionData);
      await fetchRecommendations(submissionData);
      navigate("recommendations");
    } catch (err) {
      console.warn("Recommendation calculation error:", err);
      setErrorMsg("Unable to generate recommendations. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Custom Trip Planner
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Plan Your Next Adventure
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Choose your budget, duration, and travel style to discover destination matches and detailed day-by-day itineraries.
        </p>
      </div>

      {/* Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Left: Inspirational Travel Background Photography */}
        <div className="lg:col-span-5 relative min-h-[420px] lg:min-h-[680px] p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
          {/* High-res background image */}
          <SafeImage
            src={selectedDestObj?.image}
            alt={selectedDestObj?.name || "Travel Adventure Road"}
            category="destination"
            contextName={selectedDestObj?.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          />
          {/* Deep Olive Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#152912] via-[#1E3C1B]/85 to-[#152912]/50 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Top badge */}
          <div className="relative z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[#4ADE80] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 border border-white/20">
              <Compass className="w-3.5 h-3.5 text-[#4ADE80]" />{" "}
              {selectedDestObj ? selectedDestObj.name : "Curated Explorations"}
            </span>
          </div>

          {/* Bottom inspirational quote & perks card */}
          <div className="relative z-10 text-white space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
                Traveler's Creed
              </p>
              <blockquote className="text-xl sm:text-2xl font-bold leading-snug text-white drop-shadow">
                "The world is a book, and those who do not travel read only one page."
              </blockquote>
              <p className="text-xs text-emerald-200/80">— Saint Augustine</p>
            </div>

            {/* Micro Highlights */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2.5 text-xs text-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
                <span>100% transparent pricing with live budget tracker</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
                <span>Handcrafted day-by-day itineraries with food & local transport</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
                <span>Personalized travel matching tuned to your budget</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Preference Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#2D5A27]" />
                Trip Preferences
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the options below. Leave destination empty to let us recommend the best spots!
              </p>
            </div>

            {/* 1. Specific Destination: Searchable Dropdown with all 120 destinations */}
            <div ref={destDropdownRef} className="relative">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" /> Specific Destination
                </span>
                <span className="text-[11px] font-normal text-slate-400">Optional</span>
              </label>

              {/* Combobox Input Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {isDestDropdownOpen ? (
                    <Search className="w-4 h-4 text-[#2D5A27]" />
                  ) : selectedDestObj?.image ? (
                    <SafeImage
                      src={selectedDestObj.image}
                      alt={selectedDestObj.name}
                      category="destination"
                      contextName={selectedDestObj.name}
                      className="w-5 h-5 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <MapPin className="w-4 h-4 text-[#2D5A27]" />
                  )}
                </div>

                <input
                  type="text"
                  placeholder={
                    formData.destination
                      ? formData.destination
                      : "Select a destination"
                  }
                  value={isDestDropdownOpen ? destSearch : formData.destination || ""}
                  onFocus={() => {
                    setIsDestDropdownOpen(true);
                    setDestSearch("");
                  }}
                  onChange={(e) => {
                    setDestSearch(e.target.value);
                    if (!isDestDropdownOpen) setIsDestDropdownOpen(true);
                  }}
                  className={`w-full pl-11 pr-20 py-3 text-sm border rounded-xl transition-all focus:outline-none placeholder:text-slate-400 ${
                    isDestDropdownOpen
                      ? "border-[#2D5A27] ring-2 ring-[#2D5A27]/20 bg-white"
                      : formData.destination
                      ? "border-emerald-300 bg-emerald-50/20 font-bold text-slate-900"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                />

                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
                  {(formData.destination || destSearch) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, destination: "" });
                        setDestSearch("");
                      }}
                      title="Reset to Any Destination"
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDestDropdownOpen(!isDestDropdownOpen);
                      if (!isDestDropdownOpen) setDestSearch("");
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isDestDropdownOpen ? "rotate-180 text-[#2D5A27]" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Active Selection Badge when closed */}
              {!isDestDropdownOpen && formData.destination && (
                <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-[#E8F3E6] border border-[#2D5A27]/20 text-xs text-[#2D5A27]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold">
                      Selected: <strong className="font-extrabold">{formData.destination}</strong>
                      {selectedDestObj?.region ? ` (${selectedDestObj.region})` : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, destination: "" })}
                    className="text-[11px] font-bold underline hover:text-[#1E3C1B]"
                  >
                    Clear / Any
                  </button>
                </div>
              )}

              {/* Searchable Dropdown Overlay */}
              {isDestDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Option: Any Destination / Recommendations */}
                  <div className="p-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, destination: "" });
                        setDestSearch("");
                        setIsDestDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group ${
                        !formData.destination
                          ? "bg-[#E8F3E6] text-[#2D5A27]"
                          : "hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            !formData.destination
                              ? "bg-[#2D5A27] text-white"
                              : "bg-slate-100 text-slate-600 group-hover:bg-[#E8F3E6] group-hover:text-[#2D5A27]"
                          }`}
                        >
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">
                            Any Destination / Recommendations
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Let AI recommend top matching spots from 120 destinations
                          </p>
                        </div>
                      </div>
                      {!formData.destination && (
                        <Check className="w-4 h-4 text-[#2D5A27] shrink-0 mr-1" />
                      )}
                    </button>
                  </div>

                  {/* Meta Bar */}
                  <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>
                      {filteredDestinations.length} Destination{filteredDestinations.length !== 1 ? "s" : ""}{" "}
                      {destSearch ? "matching search" : "in catalog"}
                    </span>
                    <span className="text-[10px] text-slate-400">120 Destinations</span>
                  </div>

                  {/* Destination Rows */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                    {filteredDestinations.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs">
                        <MapPin className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">No destination found</p>
                        <p className="text-slate-400 mt-0.5">
                          Try searching with another city, state, or country name.
                        </p>
                      </div>
                    ) : (
                      filteredDestinations.map((dest) => {
                        const isSelected =
                          formData.destination &&
                          (formData.destination.toLowerCase() === dest.name.toLowerCase() ||
                            formData.destination.toLowerCase() === dest.id.toLowerCase());
                        return (
                          <button
                            type="button"
                            key={dest.id}
                            onClick={() => {
                              setFormData({ ...formData, destination: dest.name });
                              setDestSearch("");
                              setIsDestDropdownOpen(false);
                            }}
                            className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors hover:bg-slate-50 ${
                              isSelected ? "bg-emerald-50/60" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <SafeImage
                                src={dest.image}
                                alt={dest.name}
                                category="destination"
                                contextName={dest.name}
                                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-100"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-xs text-slate-900 truncate">
                                    {dest.name}
                                  </span>
                                  {dest.category && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                      {dest.category}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {dest.region || dest.location || dest.country}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="block text-xs font-bold text-[#2D5A27]">
                                ₹{Number(dest.base_price || dest.basePrice || 10000).toLocaleString()}
                              </span>
                              {isSelected && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#2D5A27] mt-0.5">
                                  <Check className="w-3 h-3" /> Selected
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Budget Per Person: Select / Dropdown */}
            <div className="bg-[#FAFBFB] p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <label
                  htmlFor="budget-per-person"
                  className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5"
                >
                  <IndianRupee className="w-3.5 h-3.5 text-[#2D5A27]" /> Budget Per Person <span className="text-rose-500 font-bold">*</span>
                </label>
                {formData.budget && (
                  <span className="text-xs font-bold text-[#2D5A27] bg-[#E8F3E6] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 self-start sm:self-auto">
                    <Check className="w-3 h-3" /> Selected: {budgetOptions.find((b) => b.value === Number(formData.budget))?.label || `₹${Number(formData.budget).toLocaleString()}`}
                  </span>
                )}
              </div>

              {/* Select Dropdown */}
              <div className="relative">
                <select
                  id="budget-per-person"
                  value={formData.budget || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, budget: val === "" ? "" : Number(val) });
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full appearance-none px-4 py-3.5 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl shadow-xs focus:ring-2 focus:ring-[#2D5A27] focus:border-[#2D5A27] focus:outline-none transition-all cursor-pointer pr-10"
                >
                  <option value="" disabled>
                    Select your budget
                  </option>
                  {budgetOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Quick Budget Suggestion Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick pick:</span>
                {budgetOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => {
                      setFormData({ ...formData, budget: opt.value });
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      Number(formData.budget) === opt.value
                        ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Number of Travelers */}
            <div className="bg-[#FAFBFB] p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#2D5A27]" /> Number of Travelers
                </label>
                <span className="text-xs font-bold text-[#2D5A27] bg-[#E8F3E6] px-2.5 py-0.5 rounded-full">
                  {formData.travelers} {formData.travelers === 1 ? "Traveler" : "Travelers"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Stepper */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleTravelersChange(formData.travelers - 1)}
                    className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-extrabold text-sm text-slate-900">
                    {formData.travelers}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTravelersChange(formData.travelers + 1)}
                    className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick traveler pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick:</span>
                  {[1, 2, 4, 6].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => handleTravelersChange(num)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        formData.travelers === num
                          ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {num} {num === 1 ? "Pax" : "Pax"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Trip Duration Selector */}
            <div className="bg-[#FAFBFB] p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#2D5A27]" /> Trip Duration
                </label>
                <span className="text-xs font-bold text-[#2D5A27] bg-[#E8F3E6] px-2.5 py-0.5 rounded-full">
                  {formData.duration}
                </span>
              </div>

              {/* Days and Nights Steppers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Days Stepper */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#2D5A27]" /> Number of Days
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleDaysChange(formData.days - 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-sm text-slate-900">
                      {formData.days} {formData.days === 1 ? "Day" : "Days"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDaysChange(formData.days + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Nights Stepper */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Moon className="w-3 h-3 text-[#2D5A27]" /> Number of Nights
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleNightsChange(formData.nights - 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-sm text-slate-900">
                      {formData.nights} {formData.nights === 1 ? "Night" : "Nights"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNightsChange(formData.nights + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Duration Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Popular Duration Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {durationPresets.map((preset) => {
                    const isSelected = formData.days === preset.days && formData.nights === preset.nights;
                    return (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => handlePresetDuration(preset)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          isSelected
                            ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Dropdowns Grid: Season, Style, Traveling With */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Preferred Season */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-[#2D5A27]" /> Season
                </label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                >
                  {seasonOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#2D5A27]" /> Travel Style
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                >
                  {styleOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Traveling With */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#2D5A27]" /> Traveling With
                </label>
                <select
                  value={formData.travelWith}
                  onChange={(e) => setFormData({ ...formData, travelWith: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                >
                  {travelWithOptions.map((tw) => (
                    <option key={tw} value={tw}>
                      {tw}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message if calculation fails */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-extrabold text-base tracking-wide transition-all duration-200 shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#4ADE80]" />
                    <span>Finding destinations for your trip...</span>
                  </>
                ) : (
                  <>
                    <span>GET RECOMMENDATIONS</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
