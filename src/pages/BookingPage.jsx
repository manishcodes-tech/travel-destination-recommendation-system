import React, { useState, useEffect, useMemo } from "react";
import { useTravel } from "../context/TravelContext";
import confetti from "canvas-confetti";
import {
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  AlertCircle,
  Moon,
  Hotel,
  Car,
  Compass,
  Utensils,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  Lock,
  User,
  Mail,
  Phone,
  Check,
  IndianRupee,
  HelpCircle,
  Tag
} from "lucide-react";
import SafeImage from "../components/SafeImage";

/**
 * Robust price parser converting any string/number into a valid non-negative integer price.
 */
function parseCleanPrice(val, item = {}) {
  if (typeof val === "number" && Number.isFinite(val) && val >= 0) {
    return Math.round(val);
  }
  if (typeof val === "string" && val.trim().length > 0) {
    const cleaned = val.replace(/,/g, "");
    const match = cleaned.match(/\d+(?:\.\d+)?/);
    if (match) {
      const parsed = parseFloat(match[0]);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return Math.round(parsed);
      }
    }
  }
  const fallbackCandidates = [
    item.price,
    item.basePrice,
    item.base_price,
    item.pricePerNight,
    item.rateNum,
    item.rate,
    item.cost,
    item.estimatedPrice
  ];
  for (const c of fallbackCandidates) {
    if (c === val) continue;
    if (typeof c === "number" && Number.isFinite(c) && c >= 0) {
      return Math.round(c);
    }
    if (typeof c === "string" && c.trim().length > 0) {
      const cleaned = c.replace(/,/g, "");
      const match = cleaned.match(/\d+(?:\.\d+)?/);
      if (match) {
        const parsed = parseFloat(match[0]);
        if (Number.isFinite(parsed) && parsed >= 0) {
          return Math.round(parsed);
        }
      }
    }
  }
  return 0;
}

export default function BookingPage() {
  const {
    activeBookingPlan,
    setActiveBookingPlan,
    currentUser,
    saveBooking,
    openAuthModal,
    setIsProfileOpen,
    navigate,
    destinations
  } = useTravel();

  const [step, setStep] = useState("form"); // "form" | "confirmed"
  const [travelerName, setTravelerName] = useState(currentUser?.name || "");
  const [travelerEmail, setTravelerEmail] = useState(currentUser?.email || "");
  const [travelerPhone, setTravelerPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default departure date to 14 days from today
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [specialRequests, setSpecialRequests] = useState("");
  const [createdBooking, setCreatedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Sync user profile data when user logs in or currentUser changes
  useEffect(() => {
    if (currentUser) {
      setTravelerName(currentUser.name || "");
      setTravelerEmail(currentUser.email || "");
    }
  }, [currentUser]);

  const item = activeBookingPlan;

  // Destination info with fallback lookup
  const destInfo = useMemo(() => {
    if (!item) return null;
    if (item.destinationId && Array.isArray(destinations) && destinations.length > 0) {
      const found = destinations.find(
        (d) => String(d.id).toLowerCase() === String(item.destinationId).toLowerCase()
      );
      if (found) return found;
    }
    return {
      name: item.destination || item.name || "Curated Destination",
      region: item.region || item.location || "India",
      image: item.image || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80"
    };
  }, [item, destinations]);

  // Safe parsing of bookingDetails
  const rawDetails = useMemo(() => {
    if (!item) return null;
    let b = item.bookingDetails;
    if (typeof b === "string") {
      try {
        b = JSON.parse(b);
      } catch (e) {
        b = null;
      }
    }
    return b && typeof b === "object" ? b : {};
  }, [item]);

  // Sanitize numeric trip parameters
  const validTravelers = useMemo(() => {
    if (!item) return 2;
    const parsed = parseInt(item.travelers || rawDetails?.travelersCount, 10);
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 2;
  }, [item, rawDetails]);

  const validNights = useMemo(() => {
    if (!item) return 1;
    const parsed = parseInt(item.nights !== undefined ? item.nights : rawDetails?.stay?.nights, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
  }, [item, rawDetails]);

  const validDays = useMemo(() => {
    if (!item) return 2;
    const parsed = parseInt(item.days !== undefined ? item.days : validNights + 1, 10);
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : Math.max(1, validNights + 1);
  }, [item, validNights]);

  const durationLabel = useMemo(() => {
    if (item?.duration) return item.duration;
    return `${validDays} Days / ${validNights} Night${validNights === 1 ? "" : "s"}`;
  }, [item, validDays, validNights]);

  // Target Budget if provided by user
  const targetBudget = useMemo(() => {
    const b = item?.targetBudget ?? rawDetails?.targetBudget;
    if (b !== undefined && b !== null && b !== "") {
      const num = Number(String(b).replace(/[^0-9.]/g, ""));
      return Number.isFinite(num) && num > 0 ? num : null;
    }
    return null;
  }, [item, rawDetails]);

  // ================= ITEMIZED BREAKDOWN =================
  // 1. Stay
  const stayInfo = useMemo(() => {
    const rawStay = rawDetails?.stay;
    if (rawStay && rawStay.name && rawStay.name !== "Not selected" && Number(rawStay.totalCost) > 0) {
      return {
        selected: true,
        name: rawStay.name,
        roomType: rawStay.roomType || rawStay.type || "Hotel Room",
        nights: Number(rawStay.nights || validNights),
        pricePerNight: parseCleanPrice(rawStay.pricePerNight),
        subtotal: Number(rawStay.totalCost)
      };
    }
    if (item?.selectedStay && item.selectedStay.name) {
      const p = parseCleanPrice(item.selectedStay.priceNum || item.selectedStay.price, item.selectedStay);
      const sub = Number(item.stayCost || p * validNights);
      if (sub > 0) {
        return {
          selected: true,
          name: item.selectedStay.name,
          roomType: item.selectedStay.type || item.selectedStay.room_type || "Hotel Room",
          nights: validNights,
          pricePerNight: p,
          subtotal: sub
        };
      }
    }
    return {
      selected: false,
      name: "Not selected",
      roomType: "—",
      nights: 0,
      pricePerNight: 0,
      subtotal: 0
    };
  }, [rawDetails, item, validNights]);

  // 2. Transport
  const transportInfo = useMemo(() => {
    const rawTrans = rawDetails?.transport;
    if (rawTrans && rawTrans.mode && rawTrans.mode !== "Not selected" && Number(rawTrans.totalCost) > 0) {
      return {
        selected: true,
        mode: rawTrans.mode,
        provider: rawTrans.provider || rawTrans.name || rawTrans.detail || "Standard Provider",
        detail: rawTrans.detail || "",
        unitPrice: parseCleanPrice(rawTrans.unitPrice),
        travelers: Number(rawTrans.travelers || validTravelers),
        subtotal: Number(rawTrans.totalCost)
      };
    }
    if (item?.selectedTransit && item.selectedTransit.mode) {
      const p = parseCleanPrice(item.selectedTransit.estCost || item.selectedTransit.price, item.selectedTransit);
      const sub = Number(item.transitTotal || p * validTravelers);
      if (sub > 0) {
        return {
          selected: true,
          mode: item.selectedTransit.mode,
          provider: item.selectedTransit.provider || item.selectedTransit.name || item.selectedTransit.detail || "Standard Provider",
          detail: item.selectedTransit.detail || "",
          unitPrice: p,
          travelers: validTravelers,
          subtotal: sub
        };
      }
    }
    return {
      selected: false,
      mode: "Not selected",
      provider: "—",
      detail: "",
      unitPrice: 0,
      travelers: 0,
      subtotal: 0
    };
  }, [rawDetails, item, validTravelers]);

  // 3. Rental
  const rentalInfo = useMemo(() => {
    const rawRent = rawDetails?.rental;
    if (rawRent && (rawRent.vehicle || rawRent.option) && rawRent.vehicle !== "Not selected" && rawRent.option !== "Not selected" && Number(rawRent.totalCost) > 0) {
      return {
        selected: true,
        vehicle: rawRent.vehicle || rawRent.option || rawRent.name || "Rental Vehicle",
        type: rawRent.type || "Vehicle",
        days: Number(rawRent.days || validDays),
        dailyRate: parseCleanPrice(rawRent.dailyRate),
        subtotal: Number(rawRent.totalCost)
      };
    }
    if (item?.selectedRental && (item.selectedRental.name || item.selectedRental.option)) {
      const p = parseCleanPrice(item.selectedRental.costNum || item.selectedRental.cost, item.selectedRental);
      const sub = Number(item.rentalTotal || p * validDays);
      if (sub > 0) {
        return {
          selected: true,
          vehicle: item.selectedRental.name || item.selectedRental.option || "Rental Vehicle",
          type: item.selectedRental.type || "Vehicle",
          days: validDays,
          dailyRate: p,
          subtotal: sub
        };
      }
    }
    return {
      selected: false,
      vehicle: "Not selected",
      type: "—",
      days: 0,
      dailyRate: 0,
      subtotal: 0
    };
  }, [rawDetails, item, validDays]);

  // 4. Activities
  const activitiesInfo = useMemo(() => {
    const rawList = Array.isArray(rawDetails?.activities)
      ? rawDetails.activities
      : Array.isArray(item?.selectedActivities)
      ? item.selectedActivities
      : [];

    const list = rawList.map((a) => {
      const uPrice = Number(a.unitPrice || parseCleanPrice(a.priceNum || a.price, a) || 0);
      const qty = Number(a.quantity || a.travelers || validTravelers);
      const total = Number(a.totalPrice || uPrice * qty);
      return {
        name: a.name || "Local Experience",
        quantity: qty,
        unitPrice: uPrice,
        subtotal: total
      };
    });

    const subtotal = list.reduce((sum, a) => sum + a.subtotal, 0);
    return {
      selected: list.length > 0,
      items: list,
      subtotal
    };
  }, [rawDetails, item, validTravelers]);

  // 5. Food / Dining
  const foodInfo = useMemo(() => {
    const rawFood = rawDetails?.food;
    const foodSub = Number(rawFood?.totalCost || rawFood?.budget || item?.foodCost || 0);
    if (rawFood && rawFood.plan && rawFood.plan !== "Not selected" && foodSub > 0) {
      return {
        selected: true,
        plan: rawFood.plan,
        tier: rawFood.tier || "custom",
        days: Number(rawFood.days || validDays),
        pricePerPerson: Number(rawFood.pricePerPerson || (foodSub > 0 && validTravelers > 0 && validDays > 0 ? Math.round(foodSub / (validTravelers * validDays)) : 0)),
        subtotal: foodSub,
        description: rawFood.description || `Dining Allowance: ₹${foodSub.toLocaleString()}`
      };
    }
    if (item?.foodCost > 0) {
      return {
        selected: true,
        plan: item.diningTier ? (item.diningTier.charAt(0).toUpperCase() + item.diningTier.slice(1) + " Plan") : "Dining Allowance",
        tier: item.diningTier || "custom",
        days: validDays,
        pricePerPerson: Math.round(item.foodCost / (validTravelers * validDays)),
        subtotal: item.foodCost,
        description: `Dining Allowance: ₹${item.foodCost.toLocaleString()}`
      };
    }
    return {
      selected: false,
      plan: "Not selected",
      tier: "none",
      days: 0,
      pricePerPerson: 0,
      subtotal: 0,
      description: "Not selected"
    };
  }, [rawDetails, item, validDays, validTravelers]);

  // ================= EXACT GRAND TOTAL =================
  // MUST MATCH EXACT TOTAL CALCULATED IN BUDGET PLANNER! Never recalculate with different logic.
  const grandTotal = useMemo(() => {
    if (!item) return 0;
    if (item.totalAmount !== undefined && Number(item.totalAmount) > 0) {
      return Math.round(Number(item.totalAmount));
    }
    if (item.price !== undefined && Number(item.price) > 0) {
      return Math.round(Number(item.price));
    }
    if (rawDetails?.priceSummary?.grandTotal !== undefined && Number(rawDetails.priceSummary.grandTotal) > 0) {
      return Math.round(Number(rawDetails.priceSummary.grandTotal));
    }
    const computed =
      stayInfo.subtotal +
      transportInfo.subtotal +
      rentalInfo.subtotal +
      activitiesInfo.subtotal +
      foodInfo.subtotal;
    return Math.round(computed);
  }, [item, rawDetails, stayInfo, transportInfo, rentalInfo, activitiesInfo, foodInfo]);

  // ================= FALLBACK STATE FOR MISSING / INVALID DATA =================
  if (!item || !destInfo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Unable to load booking details.
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            No active trip plan was found or the booking parameters could not be retrieved. Please configure your trip itinerary in the Budget Planner or explore our destinations.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate("plan-trip")}
            className="px-6 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Plan Trip
          </button>
          <button
            onClick={() => navigate("budget-planner")}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#2D5A27]" /> Open Budget Planner
          </button>
          <button
            onClick={() => navigate("destinations")}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-600 font-medium text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            Explore Destinations
          </button>
        </div>
      </div>
    );
  }

  // ================= CONFIRM BOOKING HANDLER =================
  const handleConfirm = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      openAuthModal("login", "Please sign in to confirm your booking reservation");
      return;
    }

    if (grandTotal <= 0) {
      setBookingError("Cannot confirm booking: Grand total amount is invalid.");
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    const bookingPayload = {
      destinationId: item.destinationId || item.id || "general",
      destinationName: destInfo.name,
      travelDate: selectedDate,
      travelersCount: validTravelers,
      travelerName: (travelerName || currentUser.name || "Guest").trim(),
      travelerEmail: (travelerEmail || currentUser.email || "").trim(),
      travelerPhone: travelerPhone.trim(),
      amount: grandTotal,
      status: "Pending",
      bookingDetails: {
        destination: destInfo.name,
        travelDate: selectedDate,
        travelersCount: validTravelers,
        duration: durationLabel,
        targetBudget: targetBudget,
        stay: stayInfo.selected ? {
          name: stayInfo.name,
          roomType: stayInfo.roomType,
          nights: stayInfo.nights,
          pricePerNight: stayInfo.pricePerNight,
          totalCost: stayInfo.subtotal
        } : {
          name: "Not selected",
          roomType: "—",
          nights: 0,
          pricePerNight: 0,
          totalCost: 0
        },
        transport: transportInfo.selected ? {
          mode: transportInfo.mode,
          provider: transportInfo.provider,
          detail: transportInfo.detail,
          unitPrice: transportInfo.unitPrice,
          travelers: transportInfo.travelers,
          totalCost: transportInfo.subtotal
        } : {
          mode: "Not selected",
          provider: "—",
          detail: "",
          unitPrice: 0,
          travelers: 0,
          totalCost: 0
        },
        rental: rentalInfo.selected ? {
          vehicle: rentalInfo.vehicle,
          type: rentalInfo.type,
          days: rentalInfo.days,
          dailyRate: rentalInfo.dailyRate,
          totalCost: rentalInfo.subtotal
        } : {
          vehicle: "Not selected",
          type: "—",
          days: 0,
          dailyRate: 0,
          totalCost: 0
        },
        activities: activitiesInfo.items.map((a) => ({
          name: a.name,
          quantity: a.quantity,
          unitPrice: a.unitPrice,
          totalPrice: a.subtotal
        })),
        food: foodInfo.selected ? {
          plan: foodInfo.plan,
          tier: foodInfo.tier,
          days: foodInfo.days,
          pricePerPerson: foodInfo.pricePerPerson,
          budget: foodInfo.subtotal,
          totalCost: foodInfo.subtotal,
          description: foodInfo.description
        } : {
          plan: "Not selected",
          tier: "none",
          days: 0,
          pricePerPerson: 0,
          budget: 0,
          totalCost: 0,
          description: "Not selected"
        },
        priceSummary: {
          stay: stayInfo.subtotal,
          transport: transportInfo.subtotal,
          rental: rentalInfo.subtotal,
          activities: activitiesInfo.subtotal,
          food: foodInfo.subtotal,
          taxes: 0,
          grandTotal: grandTotal
        },
        specialRequests: specialRequests.trim()
      }
    };

    try {
      const saved = await saveBooking(bookingPayload);
      if (saved && saved.id) {
        setCreatedBooking(saved);
        setStep("confirmed");
        try {
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#2D5A27", "#4ADE80", "#1E3C1B", "#F59E0B"]
          });
        } catch (err) {}
      } else {
        setBookingError("Booking could not be confirmed by the database. Please try again.");
      }
    } catch (err) {
      setBookingError(err.message || "An error occurred while registering your reservation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Direct Reservation Guarantee
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {step === "form" ? "Booking Summary & Confirmation" : "Reservation Confirmed!"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {step === "form"
              ? "Verify your personalized trip package, itemized breakdown, and contact information before final booking."
              : "Your travel reservation has been successfully registered and locked in TravelMate."}
          </p>
        </div>

        <button
          onClick={() => navigate("budget-planner")}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Budget Planner
        </button>
      </div>

      {step === "confirmed" && createdBooking ? (
        /* ================= SUCCESS CONFIRMATION RECEIPT ================= */
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-[#E8F3E6] text-[#2D5A27] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-[#2D5A27]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Trip Reservation Created!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you, <strong className="text-slate-900">{createdBooking.traveler_name}</strong>! Your customized trip to{" "}
              <strong className="text-[#2D5A27]">{createdBooking.destination_name}</strong> is now officially registered.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Booking Reference
                </span>
                <span className="font-mono text-lg font-black text-slate-900">
                  #{createdBooking.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                  Status: {createdBooking.status || "Pending"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E8F3E6] text-[#2D5A27] border border-[#2D5A27]/20">
                  Locked Price
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Lead Traveler
                </span>
                <p className="font-extrabold text-slate-900">{createdBooking.traveler_name}</p>
                <p className="text-slate-500">{createdBooking.traveler_email}</p>
                {createdBooking.traveler_phone && (
                  <p className="text-slate-400 text-[11px]">{createdBooking.traveler_phone}</p>
                )}
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Destination & Duration
                </span>
                <p className="font-extrabold text-slate-900">{createdBooking.destination_name}</p>
                <p className="text-slate-500">{durationLabel}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Travel Date & Guests
                </span>
                <p className="font-extrabold text-slate-900">{createdBooking.travel_date}</p>
                <p className="text-slate-500">
                  {createdBooking.travelers_count} Traveler{createdBooking.travelers_count > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Itemized Snapshot in Receipt */}
            <div className="border-t border-slate-200 pt-4 space-y-2.5 text-xs divide-y divide-slate-100">
              {/* Stay */}
              <div className="flex items-center justify-between pt-1 text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Hotel className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Stay: {stayInfo.selected ? `${stayInfo.name} (${stayInfo.roomType} • ${stayInfo.nights}N @ ₹${stayInfo.pricePerNight?.toLocaleString()}/night)` : "Not selected"}
                </span>
                <span className="font-bold text-slate-900">₹{stayInfo.subtotal.toLocaleString()}</span>
              </div>

              {/* Transport */}
              <div className="flex items-center justify-between pt-2 text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Car className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Transport: {transportInfo.selected ? `${transportInfo.mode} (${transportInfo.provider} • ${transportInfo.travelers} pax @ ₹${transportInfo.unitPrice?.toLocaleString()}/pax)` : "Not selected"}
                </span>
                <span className="font-bold text-slate-900">₹{transportInfo.subtotal.toLocaleString()}</span>
              </div>

              {/* Rental */}
              <div className="flex items-center justify-between pt-2 text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Compass className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Rental: {rentalInfo.selected ? `${rentalInfo.vehicle} (${rentalInfo.days}D @ ₹${rentalInfo.dailyRate?.toLocaleString()}/day)` : "Not selected"}
                </span>
                <span className="font-bold text-slate-900">₹{rentalInfo.subtotal.toLocaleString()}</span>
              </div>

              {/* Activities */}
              <div className="flex items-center justify-between pt-2 text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Activities: {activitiesInfo.selected ? `${activitiesInfo.items.length} experience(s)` : "None selected"}
                </span>
                <span className="font-bold text-slate-900">₹{activitiesInfo.subtotal.toLocaleString()}</span>
              </div>

              {/* Food */}
              <div className="flex items-center justify-between pt-2 text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Utensils className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Food: {foodInfo.selected ? foodInfo.plan : "Not selected"}
                </span>
                <span className="font-bold text-slate-900">₹{foodInfo.subtotal.toLocaleString()}</span>
              </div>

              {/* Final Total */}
              <div className="flex items-center justify-between pt-3 text-sm font-black text-slate-900 border-t border-slate-200">
                <span>Grand Total Paid / Reserved:</span>
                <span className="text-lg font-black text-[#2D5A27]">
                  ₹{Number(createdBooking.amount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Post-booking Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-6 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" /> View in My Profile Bookings
            </button>

            {currentUser?.role === "admin" && (
              <button
                onClick={() => navigate("admin")}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> View in Admin Dashboard
              </button>
            )}

            <button
              onClick={() => {
                setActiveBookingPlan(null);
                navigate("budget-planner");
              }}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              Plan Another Trip
            </button>

            <button
              onClick={() => navigate("home")}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-500 font-medium text-sm transition-all cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      ) : (
        /* ================= MAIN RESERVATION FORM & SUMMARY ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Traveler Details & Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!currentUser ? (
              /* Unauthenticated Gate Banner */
              <div className="rounded-3xl border-2 border-dashed border-[#2D5A27]/40 bg-[#FAFDF9] p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F3E6] text-[#2D5A27] flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Sign In to Complete Your Reservation</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                    Please log in or create an account to finalize your booking. Your selected trip package, stays, transport, and locked pricing are completely preserved!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal("login", "Please sign in to complete your booking reservation")}
                  className="px-8 py-3.5 rounded-2xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-extrabold text-sm shadow-lg shadow-emerald-950/20 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#4ADE80]" /> Sign In / Register to Book
                </button>
              </div>
            ) : (
              /* Authenticated Lead Traveler Form */
              <form onSubmit={handleConfirm} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#2D5A27]" /> Lead Traveler Details
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your booking voucher and itinerary confirmation will be dispatched to these contact details.
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Signed In
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maya Patel"
                        value={travelerName}
                        onChange={(e) => setTravelerName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={travelerEmail}
                          onChange={(e) => setTravelerEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={travelerPhone}
                          onChange={(e) => setTravelerPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Travel Departure Date <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          required
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Number of Travelers
                      </label>
                      <div className="flex items-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-bold">
                        <Users className="w-4 h-4 text-[#2D5A27] mr-2.5" />
                        <span>{validTravelers} {validTravelers === 1 ? "Traveler" : "Travelers"}</span>
                        <span className="ml-auto text-[11px] text-slate-400 font-normal">(Configured in plan)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Special Requests / Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Dietary preferences, early check-in, ground floor room request..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>
                </div>

                {bookingError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || grandTotal <= 0}
                  className="w-full py-4 rounded-2xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-extrabold text-base tracking-wide shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-[#4ADE80]" />
                  {submitting ? "Registering Your Booking..." : "Confirm Booking"}
                </button>
              </form>
            )}

            {/* Trust & Guarantee Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#2D5A27] shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-900">Historical Price Lock</p>
                  <p className="text-slate-400">Total cost is guaranteed against future changes.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-900">Instant Record</p>
                  <p className="text-slate-400">Reservation stored in live SQLite database.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-900">Curated Local Catalog</p>
                  <p className="text-slate-400">All stays, transport & experiences verified.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Complete Trip Summary & Itemized Breakdown (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              {/* Card Banner Image */}
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <SafeImage
                  src={destInfo.image}
                  alt={destInfo.name}
                  category="destination"
                  contextName={destInfo.name}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2D5A27] text-white text-[10px] font-black uppercase tracking-wider">
                    Custom Travel Package
                  </span>
                  <h3 className="text-xl font-black mt-1 text-white truncate">
                    {destInfo.name}
                  </h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#4ADE80]" />
                    {destInfo.region}
                  </p>
                </div>
              </div>

              {/* Summary Body */}
              <div className="p-5 space-y-4">
                {/* 1. Trip Details Grid */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Trip Overview Details
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Destination</span>
                      <span className="font-bold text-slate-900 truncate block">{destInfo.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Duration</span>
                      <span className="font-extrabold text-[#2D5A27] block">{durationLabel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Travel Date</span>
                      <span className="font-semibold text-slate-800 block">{selectedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Travelers</span>
                      <span className="font-semibold text-slate-800 block">
                        {validTravelers} {validTravelers === 1 ? "Traveler" : "Travelers"}
                      </span>
                    </div>
                  </div>

                  {/* Target Budget Indicator if selected */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Target Budget:</span>
                    {targetBudget ? (
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                        ₹{targetBudget.toLocaleString()}
                        {grandTotal <= targetBudget ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 ml-1">
                            Within Budget
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 ml-1">
                            Exceeds Budget
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not specified</span>
                    )}
                  </div>
                </div>

                {/* 2. Itemized Breakdown Section */}
                <div className="space-y-3 text-xs divide-y divide-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1">
                    Itemized Breakdown
                  </div>

                  {/* Stay Breakdown */}
                  <div className="flex items-start justify-between pt-2 text-slate-700">
                    <div className="flex items-start gap-2 max-w-[70%]">
                      <Hotel className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Stay:</span>
                        {stayInfo.selected ? (
                          <span className="text-slate-600 font-medium leading-relaxed block">
                            {stayInfo.name} ({stayInfo.roomType})
                            <br />
                            <span className="text-[11px] text-slate-400">
                              {stayInfo.nights} {stayInfo.nights === 1 ? "night" : "nights"} @ ₹
                              {stayInfo.pricePerNight?.toLocaleString()}/night
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not selected</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{stayInfo.subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Transport Breakdown */}
                  <div className="flex items-start justify-between pt-2.5 text-slate-700">
                    <div className="flex items-start gap-2 max-w-[70%]">
                      <Car className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Transport:</span>
                        {transportInfo.selected ? (
                          <span className="text-slate-600 font-medium leading-relaxed block">
                            {transportInfo.mode} ({transportInfo.provider})
                            <br />
                            <span className="text-[11px] text-slate-400">
                              {transportInfo.travelers} pax @ ₹
                              {transportInfo.unitPrice?.toLocaleString()}/person
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not selected</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{transportInfo.subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Rental Breakdown */}
                  <div className="flex items-start justify-between pt-2.5 text-slate-700">
                    <div className="flex items-start gap-2 max-w-[70%]">
                      <Compass className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Rental:</span>
                        {rentalInfo.selected ? (
                          <span className="text-slate-600 font-medium leading-relaxed block">
                            {rentalInfo.vehicle} ({rentalInfo.type})
                            <br />
                            <span className="text-[11px] text-slate-400">
                              {rentalInfo.days} day(s) @ ₹{rentalInfo.dailyRate?.toLocaleString()}/day
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not selected</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{rentalInfo.subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Activities Breakdown */}
                  <div className="flex items-start justify-between pt-2.5 text-slate-700">
                    <div className="flex items-start gap-2 max-w-[70%]">
                      <Sparkles className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Activities:</span>
                        {activitiesInfo.selected ? (
                          <div className="text-slate-600 font-medium space-y-1 mt-0.5">
                            {activitiesInfo.items.map((act, idx) => (
                              <div key={idx} className="text-[11px]">
                                • {act.name} ({act.quantity}x @ ₹{act.unitPrice?.toLocaleString()})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None selected</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{activitiesInfo.subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Food / Dining Breakdown */}
                  <div className="flex items-start justify-between pt-2.5 text-slate-700">
                    <div className="flex items-start gap-2 max-w-[70%]">
                      <Utensils className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">Food / Dining:</span>
                        {foodInfo.selected ? (
                          <span className="text-slate-600 font-medium leading-relaxed block">
                            {foodInfo.plan}
                            <br />
                            <span className="text-[11px] text-slate-400">
                              {foodInfo.days} days @ ₹{foodInfo.pricePerPerson?.toLocaleString()}/person/day
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not selected</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{foodInfo.subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 3. Price Summary & Grand Total */}
                <div className="pt-4 border-t border-slate-200 space-y-1.5 text-xs bg-slate-50/70 p-3.5 rounded-2xl">
                  <div className="flex justify-between text-slate-600">
                    <span>Stay Subtotal:</span>
                    <span className="font-bold text-slate-900">₹{stayInfo.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Transport Subtotal:</span>
                    <span className="font-bold text-slate-900">₹{transportInfo.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Rental Subtotal:</span>
                    <span className="font-bold text-slate-900">₹{rentalInfo.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Activities Subtotal:</span>
                    <span className="font-bold text-slate-900">₹{activitiesInfo.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Food Subtotal:</span>
                    <span className="font-bold text-slate-900">₹{foodInfo.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                    <span>Applicable Taxes & Fees:</span>
                    <span className="font-semibold text-emerald-700">Included (₹0 Extra)</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-300 text-sm font-black text-[#1E3C1B]">
                    <span>Grand Total:</span>
                    <span className="text-xl font-black text-[#2D5A27]">
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
