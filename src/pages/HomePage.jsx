import React, { useState } from "react";
import { useTravel, parseDaysNights, formatDuration } from "../context/TravelContext";
import { destinations as fallbackDestinations } from "../data/destinations";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
  Star,
  Heart,
  Calendar,
  MapPin,
  Tag,
  Compass,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Users,
  Sun,
  Globe,
  Mountain,
  Palmtree,
  Trees,
  Landmark,
  Wallet,
  Check,
  Quote,
  Clock,
  Loader2,
  AlertCircle
} from "lucide-react";
import SafeImage from "../components/SafeImage";

export default function HomePage() {
  const {
    navigate,
    savedWishlist,
    toggleBookmark,
    userPreferences,
    setUserPreferences,
    fetchRecommendations,
    calculateRecommendations,
    fetchRecommendationsPreview,
    destinations,
    destinationsLoading,
    destinationsError,
    currentUser,
    setBudgetDestination
  } = useTravel();

  const [searchDestination, setSearchDestination] = useState("");

  // SECTION 2: Personalized Destination Finder state
  const [finderBudget, setFinderBudget] = useState("20000");
  const [finderDuration, setFinderDuration] = useState("2 Days / 1 Night");
  const [finderTravelWith, setFinderTravelWith] = useState("Friends");
  const [finderInterest, setFinderInterest] = useState("Adventure");
  const [finderSeason, setFinderSeason] = useState("Winter");
  const [finderLoading, setFinderLoading] = useState(false);
  const [finderError, setFinderError] = useState(null);

  // Active destinations catalog (from database or fallback cache)
  const activeDestinations = destinations && destinations.length > 0 ? destinations : fallbackDestinations;

  // SECTION 1: Search Form Handler
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchDestination.trim()) {
      const updated = { ...userPreferences, destination: searchDestination.trim() };
      setUserPreferences(updated);
      await fetchRecommendations(updated);
      navigate("recommendations");
    } else {
      navigate("destinations");
    }
  };

  // SECTION 2: Personalized Destination Finder Submit Handler (Calls recommendation engine)
  const handleFinderSubmit = async (e) => {
    if (e) e.preventDefault();
    setFinderLoading(true);
    setFinderError(null);
    const { days, nights } = parseDaysNights(finderDuration);
    const formattedDur = formatDuration(days, nights);
    const updated = {
      ...userPreferences,
      budget: Number(finderBudget) || 20000,
      days,
      nights,
      duration: formattedDur,
      travelWith: finderTravelWith,
      style: finderInterest,
      season: finderSeason
    };
    setUserPreferences(updated);
    try {
      const res = await fetchRecommendations(updated);
      if (res && res.length > 0) {
        navigate("recommendations");
      } else {
        setFinderError("Unable to generate recommendations. Please try again.");
      }
    } catch (err) {
      setFinderError("Unable to generate recommendations. Please try again.");
    } finally {
      setFinderLoading(false);
    }
  };

  // SECTION 3: Experience filter navigation
  const handleExperienceClick = (styleName) => {
    setUserPreferences((prev) => ({ ...prev, style: styleName }));
    navigate("destinations");
  };

  // SECTION 4: 4 Curated Trending Destinations from database
  const pickedIds = ["manali", "goa", "bali", "paris"];
  const pickedDestinations = pickedIds
    .map((id) => activeDestinations.find((d) => d.id === id))
    .filter(Boolean);

  // SECTION 5: Explore India Highlights (from 70 Indian destinations)
  const indiaIds = ["manali", "ladakh", "udaipur", "andaman"];
  const indiaHighlights = indiaIds
    .map((id) => activeDestinations.find((d) => d.id === id))
    .filter(Boolean);

  // SECTION 6: Explore the World Highlights (from 50 International destinations)
  const intlIds = ["bali", "dubai", "paris", "tokyo"];
  const intlHighlights = intlIds
    .map((id) => activeDestinations.find((d) => d.id === id))
    .filter(Boolean);

  const trustBadges = [
    {
      icon: Tag,
      title: "Best Prices",
      desc: "Guaranteed top value with direct local rates & zero hidden fees"
    },
    {
      icon: Layers,
      title: "Multiple Options",
      desc: "500+ curated homestays, luxury villas, boutique hotels & camps"
    },
    {
      icon: Sparkles,
      title: "Easy Planning",
      desc: "Personalized recommendations & customizable day-by-day itineraries"
    },
    {
      icon: ShieldCheck,
      title: "Trusted Reviews",
      desc: "100% verified traveler testimonials & real experience insights"
    }
  ];

  const experienceCategories = [
    {
      id: "mountains",
      title: "Mountains",
      style: "Adventure",
      subtitle: "Snow peaks, alpine pine forests & trails",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
      places: "Manali, Shimla, Auli"
    },
    {
      id: "beaches",
      title: "Beaches",
      style: "Relaxation",
      subtitle: "Sun-drenched golden sands & coastal cafes",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      places: "Goa, Andaman, Pondicherry"
    },
    {
      id: "nature",
      title: "Nature",
      style: "Nature",
      subtitle: "Emerald tea plantations & calm backwaters",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
      places: "Kerala, Munnar, Coorg"
    },
    {
      id: "heritage",
      title: "Heritage",
      style: "Heritage",
      subtitle: "Royal marble palaces, forts & traditions",
      image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80",
      places: "Udaipur, Jaipur, Varanasi"
    },
    {
      id: "adventure",
      title: "Adventure",
      style: "Adventure",
      subtitle: "River rafting, paragliding & high passes",
      image: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80",
      places: "Rishikesh, Kasol, Ladakh"
    },
    {
      id: "international",
      title: "International",
      style: "All",
      subtitle: "Futuristic skylines, desert dunes & escapes",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
      places: "Dubai, Bali"
    }
  ];

  const travelerReviews = [
    {
      name: "Aarav Sharma",
      location: "Pune, Maharashtra",
      destination: "Traveled to Manali",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
      review: "The day-by-day itinerary breakdown for Manali was spot on! Saved us hours of research. The local transport rates and cafe recommendations were 100% accurate."
    },
    {
      name: "Priya Venkatesh",
      location: "Bengaluru, Karnataka",
      destination: "Traveled to Goa",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      review: "Loved having vehicle rental costs, stay ratings, and realistic budgets all in one place. Rented an Activa in Goa and followed the food spots seamlessly."
    },
    {
      name: "Rohan & Sneha",
      location: "Mumbai, Maharashtra",
      destination: "Traveled to Udaipur",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      review: "The Lake Pichola sunset boat timings and Bagore Ki Haveli folk dance tips made our anniversary trip unforgettable. Clean, thoughtful, and no hassle."
    }
  ];

  return (
    <div className="space-y-20 pb-24">
      {/* ========================================================= */}
      {/* SECTION 1 — HERO SECTION                                 */}
      {/* ========================================================= */}
      <section className="relative min-h-[580px] lg:min-h-[620px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Deep Olive Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <SafeImage
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=85"
            alt="Scenic Alpine Lake and Majestic Mountain Vista"
            category="destination"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#152912] via-[#1E3C1B]/80 to-[#152912]/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-black/25"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[#4ADE80] text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Handcrafted Itineraries & Curated Journeys
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
            Explore the World <span className="text-[#4ADE80]">Your Way</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-200 max-w-3xl mx-auto font-normal leading-relaxed drop-shadow-sm">
            Plan smarter, travel better. Discover destinations, build personalized trips, and stay within your budget.
          </p>

          {/* Destination Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/95 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl sm:rounded-full shadow-2xl border border-white/40 flex flex-col sm:flex-row items-center gap-2 transition-all hover:shadow-emerald-950/20"
            >
              <div className="flex items-center gap-3 w-full px-4 py-2 sm:py-0">
                <MapPin className="w-5 h-5 text-[#2D5A27] shrink-0" />
                <input
                  type="text"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="Where do you want to go? (e.g. Manali, Goa, Dubai...)"
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 font-medium text-sm sm:text-base focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl sm:rounded-full bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-[#2D5A27]/30 shrink-0"
              >
                <span>Explore</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Suggestion Chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-200">
              <span className="text-slate-300 font-semibold">Popular Searches:</span>
              {["Manali", "Goa", "Udaipur", "Kerala", "Dubai"].map((chip) => (
                <button
                  key={chip}
                  onClick={async () => {
                    setSearchDestination(chip);
                    const updated = { ...userPreferences, destination: chip };
                    setUserPreferences(updated);
                    await fetchRecommendations(updated);
                    navigate("recommendations");
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-medium transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {trustBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E8F3E6] text-[#2D5A27] flex items-center justify-center shrink-0 shadow-xs">
                  <Icon className="w-6 h-6 text-[#2D5A27]" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">{badge.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2 — PERSONALIZED DESTINATION FINDER              */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" /> Personalized Travel Planning
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Find Your Perfect Destination
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Tell us about your travel preferences and we'll help you discover destinations that match your journey.
            </p>
          </div>

          <form onSubmit={handleFinderSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Target Budget */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#2D5A27]" /> Budget Per Person
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "₹10,000", val: "10000" },
                    { label: "₹20,000", val: "20000" },
                    { label: "₹30,000", val: "30000" },
                    { label: "₹50,000+", val: "50000" }
                  ].map((tier) => (
                    <button
                      type="button"
                      key={tier.val}
                      onClick={() => setFinderBudget(tier.val)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        finderBudget === tier.val
                          ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Trip Duration */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" /> Trip Duration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {["2 Days / 1 Night", "3 Days / 2 Nights", "4 Days / 3 Nights", "5+ Days"].map((dur) => (
                    <button
                      type="button"
                      key={dur}
                      onClick={() => setFinderDuration(dur)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all border text-center ${
                        finderDuration === dur
                          ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Traveling With */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#2D5A27]" /> Traveling With
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["Solo", "Couple", "Family", "Friends"].map((comp) => (
                    <button
                      type="button"
                      key={comp}
                      onClick={() => setFinderTravelWith(comp)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border text-center ${
                        finderTravelWith === comp
                          ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Travel Interests */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#2D5A27]" /> Primary Travel Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Adventure",
                    "Nature",
                    "Beach",
                    "Heritage",
                    "Relaxation",
                    "Food"
                  ].map((interest) => (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => setFinderInterest(interest)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all border ${
                        finderInterest === interest
                          ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Preferred Season */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#2D5A27]" /> Preferred Season
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Winter", "Summer", "Monsoon", "All Seasons"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setFinderSeason(s)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                        finderSeason === s
                          ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message if recommendation fails */}
            {finderError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{finderError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFinderSubmit()}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Primary Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">
                Selected: <strong className="text-slate-800">{finderInterest}</strong> • <strong className="text-slate-800">{finderDuration}</strong> • <strong className="text-slate-800">{finderTravelWith}</strong> • <strong className="text-[#2D5A27]">₹{Number(finderBudget).toLocaleString()}</strong>
              </span>
              <button
                type="submit"
                disabled={finderLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-[#2D5A27]/20 flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {finderLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#4ADE80]" />
                    <span>Finding destinations for your trip...</span>
                  </>
                ) : (
                  <>
                    <span>Find My Destination</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3 — EXPLORE BY EXPERIENCE                        */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1">
              <Compass className="w-4 h-4" /> Curated Travel Categories
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore by Experience
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse handpicked destinations categorized by your favorite type of getaway.
            </p>
          </div>
          <button
            onClick={() => navigate("destinations")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2D5A27] hover:underline"
          >
            <span>View all 120 destinations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experienceCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleExperienceClick(cat.style)}
              className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col justify-end p-6"
            >
              <SafeImage
                src={cat.image}
                alt={cat.title}
                category="destination"
                contextName={cat.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

              <div className="relative z-10 space-y-1 text-white">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[#4ADE80] text-[11px] font-bold">
                  {cat.places}
                </span>
                <h3 className="text-2xl font-bold text-white group-hover:text-[#4ADE80] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-200 line-clamp-2">
                  {cat.subtitle}
                </p>
                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#4ADE80] group-hover:translate-x-1 transition-transform">
                  <span>Explore places</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4 — DESTINATIONS PICKED FOR YOU                  */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1">
              <Sparkles className="w-4 h-4" /> {currentUser ? "Recommended for Your Profile" : "Popular Picks Across India"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Destinations Picked for You
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Discover places that match different travel styles and preferences.
            </p>
          </div>
          <button
            onClick={() => navigate("destinations")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2D5A27] hover:underline"
          >
            <span>Browse all destinations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Picked Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pickedDestinations.map((dest) => {
            const isBookmarked = savedWishlist.includes(dest.id);
            return (
              <div
                key={dest.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Zoom & Bookmark Heart */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <SafeImage
                      src={dest.image}
                      alt={dest.name}
                      category="destination"
                      contextName={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                    {/* Bookmark Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(dest.id);
                      }}
                      aria-label={isBookmarked ? "Remove from wishlist" : "Save to wishlist"}
                      className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-500 hover:bg-white shadow-md transition-all active:scale-90 z-10"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isBookmarked ? "text-rose-500 fill-rose-500" : ""
                        }`}
                      />
                    </button>

                    {/* Duration Tag */}
                    <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#4ADE80]" />
                      {dest.duration}
                    </div>

                    {/* Rating & Region overlay at bottom */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
                      <span className="text-xs font-medium text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#4ADE80]" /> {dest.location || dest.region}
                      </span>
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2D5A27] transition-colors">
                        {dest.name}
                      </h3>
                      <span className="font-extrabold text-sm text-[#2D5A27]">
                        ₹{(dest.base_price || dest.basePrice || dest.estimated_budget || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dest.tagline || dest.description}
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">
                      Per person estimate
                    </span>
                    <button
                      onClick={() => navigate("destination-detail", { id: dest.id })}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5 — EXPLORE INDIA (70 DESTINATIONS)               */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1">
              <Compass className="w-4 h-4" /> 70 Incredible Destinations
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Incredible India
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              From snow-draped Himalayan peaks and royal desert forts to tropical backwaters and pristine islands.
            </p>
          </div>
          <button
            onClick={() => navigate("destinations", { country: "India" })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2D5A27] hover:underline"
          >
            <span>View all 70 Indian destinations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {indiaHighlights.map((dest) => {
            const isBookmarked = savedWishlist.includes(dest.id);
            const price = Number(dest.base_price || dest.basePrice || dest.estimated_budget || 0);
            return (
              <div
                key={dest.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <SafeImage
                      src={dest.image}
                      alt={dest.name}
                      category="destination"
                      contextName={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(dest.id);
                      }}
                      aria-label={isBookmarked ? "Remove from wishlist" : "Save to wishlist"}
                      className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-500 hover:bg-white shadow-md transition-all active:scale-90 z-10"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isBookmarked ? "text-rose-500 fill-rose-500" : ""
                        }`}
                      />
                    </button>

                    <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#4ADE80]" />
                      {dest.duration}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
                      <span className="text-xs font-medium text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#4ADE80]" /> {dest.location || dest.region}
                      </span>
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2D5A27] transition-colors">
                        {dest.name}
                      </h3>
                      <span className="font-extrabold text-sm text-[#2D5A27]">
                        ₹{price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dest.tagline || dest.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">
                      Per person estimate
                    </span>
                    <button
                      onClick={() => navigate("destination-detail", { id: dest.id })}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6 — EXPLORE THE WORLD (50 INTERNATIONAL GATEWAYS) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1">
              <Globe className="w-4 h-4" /> 50 Global Destinations
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore the World
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Wanderlust across Southeast Asian islands, romantic European capitals, and desert oasis wonderlands.
            </p>
          </div>
          <button
            onClick={() => navigate("destinations", { country: "International" })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2D5A27] hover:underline"
          >
            <span>View all 50 International destinations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {intlHighlights.map((dest) => {
            const isBookmarked = savedWishlist.includes(dest.id);
            const price = Number(dest.base_price || dest.basePrice || dest.estimated_budget || 0);
            return (
              <div
                key={dest.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <SafeImage
                      src={dest.image}
                      alt={dest.name}
                      category="destination"
                      contextName={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(dest.id);
                      }}
                      aria-label={isBookmarked ? "Remove from wishlist" : "Save to wishlist"}
                      className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-500 hover:bg-white shadow-md transition-all active:scale-90 z-10"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isBookmarked ? "text-rose-500 fill-rose-500" : ""
                        }`}
                      />
                    </button>

                    <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#4ADE80]" />
                      {dest.duration}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
                      <span className="text-xs font-medium text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#4ADE80]" /> {dest.location || dest.region}
                      </span>
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2D5A27] transition-colors">
                        {dest.name}
                      </h3>
                      <span className="font-extrabold text-sm text-[#2D5A27]">
                        ₹{price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dest.tagline || dest.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">
                      Per person estimate
                    </span>
                    <button
                      onClick={() => navigate("destination-detail", { id: dest.id })}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6 — HOW TRAVELMATE WORKS                         */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Simple 4-Step Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How TravelMate Works
          </h2>
          <p className="text-sm text-slate-500">
            Four simple steps to plan your complete journey from discovery to departure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Tell Us Your Preferences",
              desc: "Choose your budget, duration, interests and travel style.",
              icon: Sliders
            },
            {
              step: "02",
              title: "Discover Destinations",
              desc: "Explore destinations that match your requirements.",
              icon: Compass
            },
            {
              step: "03",
              title: "Build Your Trip",
              desc: "Create your itinerary, activities and estimated expenses.",
              icon: Calendar
            },
            {
              step: "04",
              title: "Save Your Journey",
              desc: "Save your trip, wishlist and booking information.",
              icon: CheckCircle2
            }
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-[#2D5A27] bg-[#E8F3E6] px-2.5 py-1 rounded-md">
                      STEP {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-[#2D5A27] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#2D5A27]" />
                    </div>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 leading-snug">{s.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7 — TRAVELER REVIEWS                             */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D5A27] mb-1">
              <Quote className="w-4 h-4" /> Community Feedback & Experiences
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What Travelers Say
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Real trip experiences shared by members of the TravelMate traveler community.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Verified Community Feedback
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {travelerReviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F3E6] text-[#2D5A27]">
                    {rev.destination}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.review}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <SafeImage
                  src={rev.avatar}
                  alt={rev.name}
                  category="user"
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{rev.name}</h4>
                  <span className="text-[11px] text-slate-400 block">{rev.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8 — FINAL CTA                                    */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E3C1B] to-[#2D5A27] text-white p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-[#4ADE80]/20 border border-[#4ADE80]/40 text-[#4ADE80] text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Start Your Journey Today
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Plan Your Next Journey?
            </h3>
            <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
              Discover new places and create a trip that fits your style and budget.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate("plan-trip")}
                className="px-6 py-3.5 rounded-xl bg-[#4ADE80] hover:bg-[#86EFAC] text-[#152912] font-extrabold text-sm tracking-wide transition-all shadow-md flex items-center gap-2"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("destinations")}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all"
              >
                Explore Destinations
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
