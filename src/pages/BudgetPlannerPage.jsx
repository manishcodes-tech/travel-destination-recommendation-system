import React, { useState, useEffect, useMemo } from "react";
import { useTravel } from "../context/TravelContext";
import { parseCleanPrice } from "../components/BookingModal";
import {
  Calculator,
  IndianRupee,
  Users,
  Moon,
  Calendar,
  Hotel,
  Sparkles,
  Plane,
  Car,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Share2,
  Check,
  MapPin,
  Clock,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import SafeImage from "../components/SafeImage";

export default function BudgetPlannerPage() {
  const {
    destinations,
    getDestinationById,
    budgetState,
    setBudgetState,
    setActiveBookingPlan,
    setPendingBookingItem,
    openAuthModal,
    currentUser,
    navigate
  } = useTravel();

  // Active destinations from catalog
  const activeDestinations = useMemo(() => {
    return Array.isArray(destinations) && destinations.length > 0 ? destinations : [];
  }, [destinations]);

  // Destination Selection: if set in budgetState use it, else default to agra
  const defaultDest = budgetState?.destinationId || "agra";
  const [selectedDestId, setSelectedDestId] = useState(defaultDest);
  const [destDetail, setDestDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Core Trip Parameters
  const [travelers, setTravelers] = useState(Number(budgetState?.travelers) || 2);
  const [days, setDays] = useState(Number(budgetState?.days) || 2);
  const [nights, setNights] = useState(budgetState?.nights !== undefined ? Number(budgetState.nights) : 1);
  const [targetBudget, setTargetBudget] = useState(
    budgetState?.targetBudget ? String(budgetState.targetBudget).replace(/[^0-9.]/g, "") : ""
  );

  // Item Selections
  const [selectedStay, setSelectedStay] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedTransit, setSelectedTransit] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [diningTier, setDiningTier] = useState("standard");
  const [customFoodBudget, setCustomFoodBudget] = useState("");

  const [copied, setCopied] = useState(false);

  // Sync parameters if budgetState changes externally
  useEffect(() => {
    if (budgetState?.destinationId && budgetState.destinationId !== selectedDestId) {
      setSelectedDestId(budgetState.destinationId);
    }
    if (budgetState?.travelers) setTravelers(Number(budgetState.travelers) || 2);
    if (budgetState?.days) setDays(Number(budgetState.days) || 2);
    if (budgetState?.nights !== undefined) setNights(Number(budgetState.nights) >= 0 ? Number(budgetState.nights) : 1);
    if (budgetState?.targetBudget !== undefined && budgetState?.targetBudget !== null && budgetState?.targetBudget !== "") {
      const cleanNum = typeof budgetState.targetBudget === "number" ? String(budgetState.targetBudget) : String(budgetState.targetBudget).replace(/[^0-9.]/g, "");
      setTargetBudget(cleanNum);
    } else if (budgetState && (budgetState.targetBudget === "" || budgetState.targetBudget === null)) {
      setTargetBudget("");
    }
  }, [budgetState]);

  // Fetch complete destination details (stays, activities, transit, food) when destination changes
  useEffect(() => {
    let isMounted = true;
    if (!selectedDestId) {
      setDestDetail(null);
      setSelectedStay(null);
      setSelectedActivities([]);
      setSelectedTransit(null);
      setSelectedRental(null);
      setDiningTier("standard");
      setCustomFoodBudget("");
      return;
    }

    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const full = await getDestinationById(selectedDestId);
        if (isMounted && full) {
          setDestDetail(full);
          // Set intelligent default selections so the planner displays immediate authentic pricing
          if (full.stays && full.stays.length > 0) {
            // Find most affordable available stay
            const sortedStays = [...full.stays].sort(
              (a, b) => (parseCleanPrice(a.priceNum || a.price, a) || 99999) - (parseCleanPrice(b.priceNum || b.price, b) || 99999)
            );
            setSelectedStay(sortedStays[0]);
          } else {
            setSelectedStay(null);
          }
          if (full.howToReach && full.howToReach.length > 0) {
            setSelectedTransit(full.howToReach[0]);
          } else {
            setSelectedTransit(null);
          }
          setSelectedRental(null);
          setSelectedActivities([]);
          setDiningTier("standard");
          setCustomFoodBudget("");
        } else if (isMounted) {
          setDestDetail(null);
        }
      } catch (err) {
        console.error("Could not fetch destination details for planner:", err);
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedDestId, getDestinationById]);

  // Available options from destination detail
  const staysList = destDetail?.stays || [];
  const activitiesList = destDetail?.activities || [];
  const transitList = destDetail?.howToReach || [];
  const rentalList = destDetail?.localTransport || [];
  const foodList = destDetail?.food || [];

  // Duration label
  const durationLabel = useMemo(() => {
    const d = Math.max(1, Number(days) || 1);
    const n = Math.max(0, Number(nights) || 0);
    const dUnit = d === 1 ? "Day" : "Days";
    const nUnit = n === 1 ? "Night" : "Nights";
    return `${d} ${dUnit} / ${n} ${nUnit}`;
  }, [days, nights]);

  // 1. STAY COST CALCULATION
  // Formula: Stay Price Per Night × Nights (0 if 0 nights)
  const stayCost = useMemo(() => {
    if (!selectedStay) return 0;
    const validNights = Math.max(0, Number(nights) || 0);
    if (validNights <= 0) return 0;
    const unitPrice = parseCleanPrice(selectedStay.priceNum || selectedStay.price, selectedStay);
    if (unitPrice === null || !Number.isFinite(unitPrice) || unitPrice <= 0) return 0;
    return unitPrice * validNights;
  }, [selectedStay, nights]);

  // 2. ACTIVITIES COST CALCULATION
  // Formula: (Sum of selected valid activity prices) × Travelers
  const activitiesCost = useMemo(() => {
    if (!Array.isArray(selectedActivities) || selectedActivities.length === 0) return 0;
    const validTravelers = Math.max(1, Number(travelers) || 1);
    let sumPerPerson = 0;
    for (const act of selectedActivities) {
      const price = parseCleanPrice(act.priceNum || act.price, act);
      if (price !== null && Number.isFinite(price) && price > 0) {
        sumPerPerson += price;
      }
    }
    return sumPerPerson * validTravelers;
  }, [selectedActivities, travelers]);

  // 3. TRANSPORT COST CALCULATION (Intercity Transit × Travelers)
  const transportCost = useMemo(() => {
    if (!selectedTransit) return 0;
    const validTravelers = Math.max(1, Number(travelers) || 1);
    const transitPrice = parseCleanPrice(selectedTransit.estCost || selectedTransit.price, selectedTransit);
    if (transitPrice !== null && Number.isFinite(transitPrice) && transitPrice > 0) {
      return transitPrice * validTravelers;
    }
    return 0;
  }, [selectedTransit, travelers]);

  // 4. RENTAL COST CALCULATION (Local Vehicle Rental × Days)
  const rentalCost = useMemo(() => {
    if (!selectedRental) return 0;
    const validDays = Math.max(1, Number(days) || 1);
    const rentalPrice = parseCleanPrice(selectedRental.costNum || selectedRental.cost, selectedRental);
    if (rentalPrice !== null && Number.isFinite(rentalPrice) && rentalPrice > 0) {
      return rentalPrice * validDays;
    }
    return 0;
  }, [selectedRental, days]);

  // 5. FOOD COST CALCULATION (Per Person Per Day × Travelers × Days)
  const foodCost = useMemo(() => {
    const validTravelers = Math.max(1, Number(travelers) || 1);
    const validDays = Math.max(1, Number(days) || 1);

    if (diningTier === "budget") return 500 * validTravelers * validDays;
    if (diningTier === "standard") return 1200 * validTravelers * validDays;
    if (diningTier === "premium") return 2500 * validTravelers * validDays;
    if (diningTier === "custom") {
      if (!customFoodBudget || isNaN(Number(customFoodBudget))) return 0;
      const num = Number(customFoodBudget);
      return Number.isFinite(num) && num > 0 ? Math.round(num) : 0;
    }
    return 0;
  }, [diningTier, customFoodBudget, travelers, days]);

  // 6. TOTAL TRIP COST
  // Total = Stay + Transport + Rental + Activities + Food
  const totalTripCost = useMemo(() => {
    const s = Number.isFinite(stayCost) ? stayCost : 0;
    const t = Number.isFinite(transportCost) ? transportCost : 0;
    const r = Number.isFinite(rentalCost) ? rentalCost : 0;
    const a = Number.isFinite(activitiesCost) ? activitiesCost : 0;
    const f = Number.isFinite(foodCost) ? foodCost : 0;
    return s + t + r + a + f;
  }, [stayCost, transportCost, rentalCost, activitiesCost, foodCost]);

  // Per Person Cost
  const perPersonCost = useMemo(() => {
    const validTravelers = Math.max(1, Number(travelers) || 1);
    return totalTripCost > 0 ? Math.round(totalTripCost / validTravelers) : 0;
  }, [totalTripCost, travelers]);

  // 6. TARGET BUDGET EVALUATION (OPTIONAL)
  const parsedTargetBudget = useMemo(() => {
    if (targetBudget === "" || targetBudget === null || targetBudget === undefined) return null;
    if (typeof targetBudget === "number" && Number.isFinite(targetBudget) && targetBudget > 0) return Math.round(targetBudget);
    const cleaned = String(targetBudget).replace(/[^0-9.]/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  }, [targetBudget]);

  const budgetEvaluation = useMemo(() => {
    if (parsedTargetBudget === null) {
      return {
        hasTarget: false,
        isUnderBudget: false,
        difference: 0,
        utilizationPercent: 0
      };
    }

    const diff = parsedTargetBudget - totalTripCost;
    const isUnder = diff >= 0;
    // Uncapped exact utilization percentage
    const rawUtil = (totalTripCost / parsedTargetBudget) * 100;
    const utilizationPercent = Number.isFinite(rawUtil) ? Number(rawUtil.toFixed(1)) : 0;

    return {
      hasTarget: true,
      isUnderBudget: isUnder,
      difference: diff,
      utilizationPercent
    };
  }, [parsedTargetBudget, totalTripCost]);

  // Reset Estimates Handler
  const handleResetEstimates = () => {
    setSelectedStay(null);
    setSelectedActivities([]);
    setSelectedTransit(null);
    setSelectedRental(null);
    setDiningTier(null);
    setCustomFoodBudget("");
    setTargetBudget("");
  };

  // Toggle Activity in Selection
  const toggleActivity = (act) => {
    setSelectedActivities((prev) => {
      const exists = prev.some((item) => item.name === act.name);
      if (exists) {
        return prev.filter((item) => item.name !== act.name);
      } else {
        return [...prev, act];
      }
    });
  };

  // Share / Export Handler
  const handleShare = () => {
    const destName = destDetail?.name || "Travel Destination";
    const text = [
      `🌟 TravelMate Custom Trip Plan — ${destName}`,
      `👥 Travelers: ${travelers} | 🌙 Duration: ${durationLabel}`,
      `----------------------------------------`,
      `🏨 Stay: ₹${stayCost.toLocaleString()}${selectedStay ? ` (${selectedStay.name})` : ""}`,
      `🎯 Activities: ₹${activitiesCost.toLocaleString()}${selectedActivities.length > 0 ? ` (${selectedActivities.length} selected)` : ""}`,
      `✈️ Transport: ₹${transportCost.toLocaleString()}`,
      `🚗 Rental: ₹${rentalCost.toLocaleString()}`,
      `🍽️ Food: ₹${foodCost.toLocaleString()}`,
      `----------------------------------------`,
      `💰 TOTAL TRIP COST: ₹${totalTripCost.toLocaleString()}`,
      parsedTargetBudget ? `🎯 Target Budget: ₹${parsedTargetBudget.toLocaleString()} (${budgetEvaluation.isUnderBudget ? `Within Budget by ₹${budgetEvaluation.difference.toLocaleString()}` : `Exceeds Budget by ₹${Math.abs(budgetEvaluation.difference).toLocaleString()}`})` : "",
      `Plan your trip on TravelMate: ${window.location.href}`
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Book This Trip Plan
  const handleBookTrip = () => {
    if (!destDetail) return;

    const transitUnitPrice = selectedTransit ? parseCleanPrice(selectedTransit.estCost || selectedTransit.price, selectedTransit) || 0 : 0;
    const transitTotal = transitUnitPrice * travelers;

    const rentalDaily = selectedRental ? parseCleanPrice(selectedRental.costNum || selectedRental.cost, selectedRental) || 0 : 0;
    const rentalTotal = rentalDaily * days;

    const activitiesFormatted = selectedActivities.map((act) => {
      const uPrice = parseCleanPrice(act.priceNum || act.price, act) || 0;
      return {
        name: act.name,
        unitPrice: uPrice,
        travelers: travelers,
        quantity: travelers,
        totalPrice: uPrice * travelers
      };
    });

    const bookingDetails = {
      targetBudget: parsedTargetBudget || null,
      stay: selectedStay && nights > 0 ? {
        name: selectedStay.name,
        roomType: selectedStay.type || selectedStay.room_type || "Standard Hotel Room",
        type: selectedStay.type || "Hotel",
        nights: nights,
        pricePerNight: parseCleanPrice(selectedStay.priceNum || selectedStay.price, selectedStay) || 0,
        totalCost: stayCost
      } : {
        name: "Not selected",
        roomType: "None",
        type: "None",
        nights: 0,
        pricePerNight: 0,
        totalCost: 0
      },
      transport: selectedTransit ? {
        mode: selectedTransit.mode || selectedTransit.type || "Intercity Transit",
        provider: selectedTransit.provider || selectedTransit.name || selectedTransit.detail || "Standard Provider",
        detail: selectedTransit.detail || "",
        unitPrice: transitUnitPrice,
        travelers: travelers,
        totalCost: transitTotal
      } : {
        mode: "Not selected",
        provider: "None",
        detail: "",
        unitPrice: 0,
        travelers: 0,
        totalCost: 0
      },
      rental: selectedRental ? {
        vehicle: selectedRental.name || selectedRental.option || "Rental Vehicle",
        option: selectedRental.option || selectedRental.name || "Rental Vehicle",
        type: selectedRental.type || "Vehicle",
        dailyRate: rentalDaily,
        days: days,
        totalCost: rentalTotal
      } : {
        vehicle: "Not selected",
        option: "Not selected",
        type: "None",
        dailyRate: 0,
        days: 0,
        totalCost: 0
      },
      activities: activitiesFormatted,
      food: foodCost > 0 ? {
        plan: diningTier ? (diningTier.charAt(0).toUpperCase() + diningTier.slice(1) + " Plan") : "Custom Allowance",
        tier: diningTier || "custom",
        days: days,
        travelers: travelers,
        pricePerPerson: diningTier === "budget" ? 500 : diningTier === "standard" ? 1200 : diningTier === "premium" ? 2500 : (travelers > 0 && days > 0 ? Math.round(foodCost / (travelers * days)) : 0),
        budget: foodCost,
        totalCost: foodCost,
        description: diningTier === "budget"
          ? `Budget Dining (₹500/day × ${travelers} pax × ${days} days)`
          : diningTier === "standard"
          ? `Standard Dining (₹1,200/day × ${travelers} pax × ${days} days)`
          : diningTier === "premium"
          ? `Premium Dining (₹2,500/day × ${travelers} pax × ${days} days)`
          : `Custom Dining Allowance: ₹${foodCost.toLocaleString()}`
      } : {
        plan: "Not selected",
        tier: "none",
        days: 0,
        travelers: 0,
        pricePerPerson: 0,
        budget: 0,
        totalCost: 0,
        description: "Not selected"
      },
      priceSummary: {
        stay: stayCost,
        transport: transitTotal,
        rental: rentalTotal,
        activities: activitiesCost,
        food: foodCost,
        taxes: 0,
        grandTotal: totalTripCost
      }
    };

    const tripPlanItem = {
      id: destDetail.id,
      destinationId: destDetail.id,
      destination: destDetail.name,
      name: `Trip to ${destDetail.name}`,
      title: `Trip to ${destDetail.name}`,
      image: destDetail.image,
      region: destDetail.region || destDetail.location || "India",
      isTripPlan: true,
      travelers: travelers,
      days: days,
      nights: nights,
      duration: durationLabel,
      targetBudget: parsedTargetBudget || null,
      stayName: selectedStay?.name || null,
      selectedStay: selectedStay,
      selectedTransit: selectedTransit,
      selectedRental: selectedRental,
      selectedActivities: selectedActivities,
      stayCost: stayCost,
      activitiesCost: activitiesCost,
      transportCost: transportCost,
      rentalCost: rentalCost,
      transitTotal: transitTotal,
      rentalTotal: rentalTotal,
      foodCost: foodCost,
      breakdown: {
        stay: stayCost,
        transport: transitTotal,
        rental: rentalTotal,
        activities: activitiesCost,
        food: foodCost
      },
      bookingDetails: bookingDetails,
      price: totalTripCost,
      totalAmount: totalTripCost
    };

    if (setActiveBookingPlan) {
      setActiveBookingPlan(tripPlanItem);
    }
    if (!currentUser) {
      setPendingBookingItem(tripPlanItem);
      openAuthModal("login", "Please sign in to complete your booking reservation");
    }
    navigate("booking");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" /> Real Dynamic Trip Cost Calculator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trip Budget Planner
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Build your personalized travel package with actual stays, activities, transport, and dining costs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetEstimates}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Reset selected expenses"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reset Estimates
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> Itinerary Copied!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" /> Share / Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Destination, Travelers & Duration Selector Strip */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-end">
          {/* Destination Selector */}
          <div className="sm:col-span-12 lg:col-span-4 space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" /> Select Destination
            </label>
            <div className="relative">
              <select
                value={selectedDestId}
                onChange={(e) => {
                  setSelectedDestId(e.target.value);
                  if (budgetState) {
                    setBudgetState((prev) => ({ ...prev, destinationId: e.target.value }));
                  }
                }}
                className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#2D5A27] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">-- Choose a Destination to Begin Planning --</option>
                {activeDestinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} • {d.region || d.country}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Travelers Stepper */}
          <div className="sm:col-span-4 lg:col-span-2 space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#2D5A27]" /> Travelers
            </label>
            <div className="flex items-center justify-between border border-slate-200 rounded-2xl bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-black text-xs sm:text-sm text-slate-900">
                {travelers} {travelers === 1 ? "Pax" : "Pax"}
              </span>
              <button
                type="button"
                onClick={() => setTravelers((prev) => prev + 1)}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days Stepper */}
          <div className="sm:col-span-4 lg:col-span-3 space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" /> Days
            </label>
            <div className="flex items-center justify-between border border-slate-200 rounded-2xl bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setDays((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-black text-xs sm:text-sm text-slate-900">
                {days} {days === 1 ? "Day" : "Days"}
              </span>
              <button
                type="button"
                onClick={() => setDays((prev) => Math.min(14, prev + 1))}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Nights Stepper */}
          <div className="sm:col-span-4 lg:col-span-3 space-y-1.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-[#2D5A27]" /> Nights
            </label>
            <div className="flex items-center justify-between border border-slate-200 rounded-2xl bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setNights((prev) => Math.max(0, prev - 1))}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-black text-xs sm:text-sm text-slate-900">
                {nights} {nights === 1 ? "Night" : "Nights"}
              </span>
              <button
                type="button"
                onClick={() => setNights((prev) => Math.min(14, prev + 1))}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Duration Presets */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {[
            { d: 1, n: 0, label: "1D / 0N" },
            { d: 2, n: 1, label: "2D / 1N" },
            { d: 3, n: 2, label: "3D / 2N" },
            { d: 4, n: 3, label: "4D / 3N" },
            { d: 5, n: 4, label: "5D / 4N" },
            { d: 6, n: 5, label: "6D / 5N" },
            { d: 7, n: 6, label: "7D / 6N" }
          ].map((preset) => {
            const isSelected = days === preset.d && nights === preset.n;
            return (
              <button
                type="button"
                key={preset.label}
                onClick={() => {
                  setDays(preset.d);
                  setNights(preset.n);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-[#2D5A27] text-white border-[#2D5A27] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Selected Destination Banner */}
        {destDetail && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SafeImage
                src={destDetail.image}
                alt={destDetail.name}
                category="destination"
                contextName={destDetail.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-slate-900">{destDetail.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3E6] text-[#2D5A27]">
                    {destDetail.category || "Getaway"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#2D5A27]" />
                  {destDetail.region ? `${destDetail.region}, ` : ""}{destDetail.country || "India"} • {durationLabel}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("destination-detail", { id: destDetail.id })}
              className="text-xs font-bold text-[#2D5A27] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              View complete destination guide <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Grid: Plan Configurator (Left) & Cost Summary Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Interactive Sections (Stay, Activities, Transport, Food) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {loadingDetail ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#2D5A27] border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700">Loading catalog items & verified pricing...</p>
            </div>
          ) : !destDetail ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#E8F3E6] text-[#2D5A27] flex items-center justify-center mx-auto shadow-inner">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">No Destination Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Choose any destination from the catalog above to load authentic hotels, activities, and transit options.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* SECTION 1: STAY */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#E8F3E6] text-[#2D5A27] flex items-center justify-center font-black text-xs">
                      1
                    </span>
                    <div>
                      <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                        <Hotel className="w-4 h-4 text-[#2D5A27]" /> Accommodation & Stay
                      </h3>
                      <p className="text-xs text-slate-400">
                        Select one stay • Multiplies by {nights} night{nights > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  {stayCost > 0 && (
                    <span className="text-sm font-black text-[#2D5A27] bg-[#E8F3E6] px-3 py-1 rounded-xl">
                      ₹{stayCost.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* Option: No Stay */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedStay === null
                        ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="stayOption"
                        checked={selectedStay === null}
                        onChange={() => setSelectedStay(null)}
                        className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">
                          No Stay Required / Arrange Own Lodging
                        </span>
                        <span className="text-xs text-slate-400">Day trip or independent booking</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-500">₹0</span>
                  </label>

                  {/* Destination Stays */}
                  {staysList.map((stay, idx) => {
                    const parsedPrice = parseCleanPrice(stay.priceNum || stay.price, stay);
                    const isAvailable = parsedPrice !== null && Number.isFinite(parsedPrice) && parsedPrice > 0;
                    const isSelected = selectedStay?.name === stay.name;
                    const computedSubtotal = isAvailable ? parsedPrice * nights : 0;

                    return (
                      <label
                        key={idx}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                          !isAvailable
                            ? "opacity-60 bg-slate-100/60 border-slate-200 cursor-not-allowed"
                            : isSelected
                            ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs cursor-pointer"
                            : "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="stayOption"
                            disabled={!isAvailable}
                            checked={isSelected}
                            onChange={() => isAvailable && setSelectedStay(stay)}
                            className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{stay.name}</span>
                              {stay.type && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                                  {stay.type}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500">
                              {isAvailable ? `₹${parsedPrice.toLocaleString()} / night` : "Price unavailable"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right pl-7 sm:pl-0">
                          {isAvailable ? (
                            <div>
                              <span className="font-black text-sm text-slate-900 block">
                                ₹{computedSubtotal.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                for {nights} night{nights > 1 ? "s" : ""}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-amber-700">Price unavailable</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: ACTIVITIES */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#E8F3E6] text-[#2D5A27] flex items-center justify-center font-black text-xs">
                      2
                    </span>
                    <div>
                      <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#2D5A27]" /> Sightseeing & Activities
                      </h3>
                      <p className="text-xs text-slate-400">
                        Select one or multiple • Multiplies by {travelers} traveler{travelers > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  {activitiesCost > 0 && (
                    <span className="text-sm font-black text-[#2D5A27] bg-[#E8F3E6] px-3 py-1 rounded-xl">
                      ₹{activitiesCost.toLocaleString()}
                    </span>
                  )}
                </div>

                {activitiesList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No fixed platform activities listed for this destination yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {activitiesList.map((act, idx) => {
                      const parsedPrice = parseCleanPrice(act.priceNum || act.price, act);
                      const isAvailable = parsedPrice !== null && Number.isFinite(parsedPrice) && parsedPrice > 0;
                      const isSelected = selectedActivities.some((item) => item.name === act.name);
                      const computedSubtotal = isAvailable ? parsedPrice * travelers : 0;

                      return (
                        <label
                          key={idx}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                            !isAvailable
                              ? "opacity-60 bg-slate-100/60 border-slate-200 cursor-not-allowed"
                              : isSelected
                              ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs cursor-pointer"
                              : "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              disabled={!isAvailable}
                              checked={isSelected}
                              onChange={() => isAvailable && toggleActivity(act)}
                              className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] rounded-md cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">{act.name}</span>
                                {act.badge && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F3E6] text-[#2D5A27]">
                                    {act.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500">
                                {isAvailable ? `₹${parsedPrice.toLocaleString()} / person` : "Price unavailable"}
                              </span>
                            </div>
                          </div>

                          <div className="text-right pl-7 sm:pl-0">
                            {isAvailable ? (
                              <div>
                                <span className="font-black text-sm text-slate-900 block">
                                  ₹{computedSubtotal.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  for {travelers} traveler{travelers > 1 ? "s" : ""}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-amber-700">Price unavailable</span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 3: TRANSPORT */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#E8F3E6] text-[#2D5A27] flex items-center justify-center font-black text-xs">
                      3
                    </span>
                    <div>
                      <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                        <Car className="w-4 h-4 text-[#2D5A27]" /> Transportation & Rentals
                      </h3>
                      <p className="text-xs text-slate-400">
                        Choose intercity transit (Bus, Train, Flight) or local vehicle rental
                      </p>
                    </div>
                  </div>
                  {transportCost > 0 && (
                    <span className="text-sm font-black text-[#2D5A27] bg-[#E8F3E6] px-3 py-1 rounded-xl">
                      ₹{transportCost.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Intercity Transit Options */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      A. Long-Distance Intercity Transit (Per Traveler)
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      <label
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedTransit === null
                            ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="transitOption"
                            checked={selectedTransit === null}
                            onChange={() => setSelectedTransit(null)}
                            className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                          />
                          <span className="font-bold text-sm text-slate-900">
                            Own Intercity Transit / Not Required
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-500">₹0</span>
                      </label>

                      {transitList.map((tr, idx) => {
                        const parsedPrice = parseCleanPrice(tr.estCost || tr.price, tr);
                        const isAvailable = parsedPrice !== null && Number.isFinite(parsedPrice) && parsedPrice > 0;
                        const isSelected = selectedTransit?.mode === tr.mode;
                        const computedSubtotal = isAvailable ? parsedPrice * travelers : 0;

                        return (
                          <label
                            key={idx}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                              !isAvailable
                                ? "opacity-60 bg-slate-100/60 border-slate-200 cursor-not-allowed"
                                : isSelected
                                ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs cursor-pointer"
                                : "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="transitOption"
                                disabled={!isAvailable}
                                checked={isSelected}
                                onChange={() => isAvailable && setSelectedTransit(tr)}
                                className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                              />
                              <div>
                                <span className="font-bold text-sm text-slate-900 block">{tr.mode}</span>
                                <span className="text-xs text-slate-500">
                                  {isAvailable ? `₹${parsedPrice.toLocaleString()} / person` : "Price unavailable"}
                                  {tr.estTime ? ` • ${tr.estTime}` : ""}
                                </span>
                              </div>
                            </div>

                            <div className="text-right pl-7 sm:pl-0">
                              {isAvailable ? (
                                <div>
                                  <span className="font-black text-sm text-slate-900 block">
                                    ₹{computedSubtotal.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    for {travelers} traveler{travelers > 1 ? "s" : ""}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-amber-700">Price unavailable</span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Local Vehicle Rentals */}
                  {rentalList.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        B. Local Vehicle Rental & Taxi (Per Day × {days} {days === 1 ? "Day" : "Days"})
                      </span>
                      <div className="grid grid-cols-1 gap-2.5">
                        <label
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            selectedRental === null
                              ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs"
                              : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="rentalOption"
                              checked={selectedRental === null}
                              onChange={() => setSelectedRental(null)}
                              className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                            />
                            <span className="font-bold text-sm text-slate-900">
                              No Local Vehicle Rental
                            </span>
                          </div>
                          <span className="text-xs font-black text-slate-500">₹0</span>
                        </label>

                        {rentalList.map((rent, idx) => {
                          const parsedPrice = parseCleanPrice(rent.costNum || rent.cost, rent);
                          const isAvailable = parsedPrice !== null && Number.isFinite(parsedPrice) && parsedPrice > 0;
                          const isSelected = selectedRental?.option === rent.option;
                          const computedSubtotal = isAvailable ? parsedPrice * days : 0;

                          return (
                            <label
                              key={idx}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                                !isAvailable
                                  ? "opacity-60 bg-slate-100/60 border-slate-200 cursor-not-allowed"
                                  : isSelected
                                  ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs cursor-pointer"
                                  : "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="rentalOption"
                                  disabled={!isAvailable}
                                  checked={isSelected}
                                  onChange={() => isAvailable && setSelectedRental(rent)}
                                  className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-slate-900">{rent.option}</span>
                                    {rent.type && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                                        {rent.type}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {isAvailable ? `₹${parsedPrice.toLocaleString()} / day` : "Price unavailable"}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right pl-7 sm:pl-0">
                                {isAvailable ? (
                                  <div>
                                    <span className="font-black text-sm text-slate-900 block">
                                      ₹{computedSubtotal.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      for {days} day{days > 1 ? "s" : ""}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs font-bold text-amber-700">Price unavailable</span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: FOOD */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#E8F3E6] text-[#2D5A27] flex items-center justify-center font-black text-xs">
                      4
                    </span>
                    <div>
                      <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                        <Utensils className="w-4 h-4 text-[#2D5A27]" /> Food & Dining Budget
                      </h3>
                      <p className="text-xs text-slate-400">
                        Adjust meal estimate for breakfast, cafe visits, and regional delicacies
                      </p>
                    </div>
                  </div>
                  {foodCost > 0 && (
                    <span className="text-sm font-black text-[#2D5A27] bg-[#E8F3E6] px-3 py-1 rounded-xl">
                      ₹{foodCost.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Regional Food Specialties Showcase */}
                {foodList.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Regional Dishes in {destDetail?.name || "Destination"}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {foodList.map((f, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1"
                        >
                          <Utensils className="w-3 h-3 text-[#2D5A27]" /> {f?.name || f?.title || "Regional Dish"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dining Tiers Selection */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Select Daily Dining Tier ({travelers} traveler{travelers > 1 ? "s" : ""} × {days} day{days > 1 ? "s" : ""})
                  </span>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Option 0: No Dining Tier */}
                    <label
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        diningTier === null
                          ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="diningTierOption"
                          checked={diningTier === null}
                          onChange={() => setDiningTier(null)}
                          className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-sm text-slate-900 block">
                            Self-Catered / Exclude Dining Allowance
                          </span>
                          <span className="text-xs text-slate-400">
                            Pay on the go or manage meals independently
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-500">₹0</span>
                    </label>

                    {/* Tier 1: Budget Dining */}
                    <label
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        diningTier === "budget"
                          ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="diningTierOption"
                          checked={diningTier === "budget"}
                          onChange={() => setDiningTier("budget")}
                          className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">Budget Dining</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                              ₹500 / person / day
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Authentic street food, local dhabas, tea stalls & budget cafes
                          </span>
                        </div>
                      </div>
                      <div className="text-right pl-7 sm:pl-0">
                        <span className="font-black text-sm text-slate-900 block">
                          ₹{(500 * travelers * days).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          for {travelers} pax × {days} days
                        </span>
                      </div>
                    </label>

                    {/* Tier 2: Standard Dining */}
                    <label
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        diningTier === "standard"
                          ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="diningTierOption"
                          checked={diningTier === "standard"}
                          onChange={() => setDiningTier("standard")}
                          className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">Standard Dining</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ₹1,200 / person / day
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Popular local restaurants, curated cafes & family dining
                          </span>
                        </div>
                      </div>
                      <div className="text-right pl-7 sm:pl-0">
                        <span className="font-black text-sm text-slate-900 block">
                          ₹{(1200 * travelers * days).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          for {travelers} pax × {days} days
                        </span>
                      </div>
                    </label>

                    {/* Tier 3: Premium Gourmet Dining */}
                    <label
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        diningTier === "premium"
                          ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="diningTierOption"
                          checked={diningTier === "premium"}
                          onChange={() => setDiningTier("premium")}
                          className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">Premium Gourmet Dining</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                              ₹2,500 / person / day
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Heritage fine dining, luxury rooftop lounges & specialty feasts
                          </span>
                        </div>
                      </div>
                      <div className="text-right pl-7 sm:pl-0">
                        <span className="font-black text-sm text-slate-900 block">
                          ₹{(2500 * travelers * days).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          for {travelers} pax × {days} days
                        </span>
                      </div>
                    </label>

                    {/* Custom Dining Option */}
                    <label
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        diningTier === "custom"
                          ? "border-[#2D5A27] bg-emerald-50/40 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="diningTierOption"
                          checked={diningTier === "custom"}
                          onChange={() => setDiningTier("custom")}
                          className="w-4 h-4 text-[#2D5A27] accent-[#2D5A27] cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-sm text-slate-900 block">Custom Total Dining Allowance</span>
                          <span className="text-xs text-slate-500">
                            Enter an exact total budget for food & drinks
                          </span>
                        </div>
                      </div>

                      {diningTier === "custom" && (
                        <div className="relative pl-7 sm:pl-0 sm:w-44">
                          <span className="text-xs font-bold text-slate-400 absolute left-3 top-2.5">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            placeholder="e.g. 4000"
                            value={customFoodBudget}
                            onChange={(e) => setCustomFoodBudget(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                          />
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column (4-5 cols): Dynamic Cost Breakdown & Target Budget Card */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 sticky top-24">
          {/* TRIP BUDGET CARD (Exact User Requested Format) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#2D5A27]">
                Trip Budget
              </span>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase">Destination:</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {destDetail?.name || "None Selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase">Travelers:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{travelers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase">Duration:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{durationLabel}</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* COST BREAKDOWN */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                Cost Breakdown
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-bold flex items-center gap-1.5">
                    <Hotel className="w-3.5 h-3.5 text-[#2D5A27]" /> Stay
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{stayCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" /> Activities
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{activitiesCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-bold flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-[#2D5A27]" /> Transport
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{transportCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-bold flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#2D5A27]" /> Rental
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{rentalCost.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600 font-bold flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#2D5A27]" /> Food
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{foodCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* TOTAL TRIP COST */}
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                Total Trip Cost
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl sm:text-4xl font-black text-[#2D5A27] tracking-tight">
                  ₹{totalTripCost.toLocaleString()}
                </span>
                {travelers > 1 && totalTripCost > 0 && (
                  <span className="text-xs text-slate-500 font-semibold">
                    (₹{perPersonCost.toLocaleString()} / person)
                  </span>
                )}
              </div>
            </div>

            {/* OPTIONAL TARGET BUDGET FEATURE */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Target Budget (Optional)
                </label>
                {parsedTargetBudget && (
                  <button
                    type="button"
                    onClick={() => setTargetBudget("")}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative">
                <span className="text-sm font-black text-slate-400 absolute left-4 top-2.5">₹</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="Enter your budget"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                />
              </div>

              {/* Only show evaluation when user enters a target budget */}
              {budgetEvaluation.hasTarget ? (
                <div className="space-y-3 pt-1">
                  {/* Status Badge & Remaining / Exceeds */}
                  <div
                    className={`p-3.5 rounded-2xl border ${
                      budgetEvaluation.isUnderBudget
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                        : "bg-rose-50 border-rose-300 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          budgetEvaluation.isUnderBudget ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {budgetEvaluation.isUnderBudget ? "Within Budget" : "Over Budget"}
                      </span>
                      {budgetEvaluation.isUnderBudget ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <p className="text-base font-black mt-1">
                      {budgetEvaluation.isUnderBudget ? (
                        <span className="text-emerald-800">
                          Within Budget by ₹{budgetEvaluation.difference.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-rose-700">
                          Exceeds Budget by ₹{Math.abs(budgetEvaluation.difference).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Budget Utilization</span>
                      <span
                        className={
                          budgetEvaluation.utilizationPercent > 100
                            ? "text-rose-600 font-extrabold"
                            : "text-[#2D5A27]"
                        }
                      >
                        {budgetEvaluation.utilizationPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          budgetEvaluation.utilizationPercent > 100
                            ? "bg-rose-500"
                            : budgetEvaluation.utilizationPercent > 80
                            ? "bg-amber-500"
                            : "bg-[#2D5A27]"
                        }`}
                        style={{ width: `${Math.min(100, budgetEvaluation.utilizationPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Enter an optional target budget above to track budget utilization and savings.
                </p>
              )}
            </div>

            {/* Book This Trip Button */}
            <button
              onClick={handleBookTrip}
              disabled={!destDetail || totalTripCost <= 0}
              className="w-full py-4 rounded-2xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-extrabold text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
              Book This Trip Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
