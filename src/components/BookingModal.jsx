import React, { useState, useEffect } from "react";
import { useTravel } from "../context/TravelContext";
import confetti from "canvas-confetti";
import {
  X,
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
  Lock,
  User
} from "lucide-react";
import SafeImage from "./SafeImage";

/**
 * Robust price parser converting any string/number into a valid positive integer price.
 * Safely strips currency symbols, commas, and suffixes like "/night", "/day".
 */
export function parseCleanPrice(val, item = {}) {
  if (typeof val === "number" && Number.isFinite(val) && val > 0) {
    return Math.round(val);
  }
  if (typeof val === "string" && val.trim().length > 0) {
    const cleaned = val.replace(/,/g, "");
    const match = cleaned.match(/\d+(?:\.\d+)?/);
    if (match) {
      const parsed = parseFloat(match[0]);
      if (Number.isFinite(parsed) && parsed > 0) {
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
    if (typeof c === "number" && Number.isFinite(c) && c > 0) {
      return Math.round(c);
    }
    if (typeof c === "string" && c.trim().length > 0) {
      const cleaned = c.replace(/,/g, "");
      const match = cleaned.match(/\d+(?:\.\d+)?/);
      if (match) {
        const parsed = parseFloat(match[0]);
        if (Number.isFinite(parsed) && parsed > 0) {
          return Math.round(parsed);
        }
      }
    }
  }
  return null;
}

export default function BookingModal() {
  const {
    bookingModal,
    closeBookingModal,
    currentUser,
    saveBooking,
    setIsProfileOpen,
    setIsAuthModalOpen,
    setAuthMode,
    navigate
  } = useTravel();

  // All React Hooks called UNCONDITIONALLY at the top of the component
  const [step, setStep] = useState("form");
  const [travelers, setTravelers] = useState(2);
  const [nights, setNights] = useState(1);
  const [selectedDate, setSelectedDate] = useState("2026-10-15");
  const [travelerName, setTravelerName] = useState("");
  const [travelerEmail, setTravelerEmail] = useState("");
  const [travelerPhone, setTravelerPhone] = useState("");
  const [createdBookingId, setCreatedBookingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Sync user details
  useEffect(() => {
    if (currentUser) {
      setTravelerName((prev) => prev || currentUser.name || "");
      setTravelerEmail((prev) => prev || currentUser.email || "");
    }
  }, [currentUser]);

  // Sync modal items on open
  useEffect(() => {
    if (bookingModal?.isOpen && bookingModal?.item) {
      setStep("form");
      if (bookingModal.item.isTripPlan) {
        setTravelers(bookingModal.item.travelers || 2);
        setNights(bookingModal.item.nights != null ? bookingModal.item.nights : 1);
      } else {
        setTravelers(2);
        setNights(1);
      }
      setBookingError(null);
    }
  }, [bookingModal?.isOpen, bookingModal?.item]);

  // Early return ONLY after all hooks have been executed
  if (!bookingModal?.isOpen || !bookingModal?.item) {
    return null;
  }

  const item = bookingModal.item;
  const isTripPlan = Boolean(item.isTripPlan);

  // Determine if item represents overnight stay lodging
  const isStay =
    !isTripPlan && (
      item.type?.toLowerCase() === "stay" ||
      item.category?.toLowerCase() === "stay" ||
      String(item.price || "").toLowerCase().includes("night") ||
      String(item.rate || "").toLowerCase().includes("night") ||
      item.pricePerNight != null
    );

  // Clean numeric amounts
  const unitPrice = parseCleanPrice(item.price, item);
  const isValidPrice = unitPrice !== null && Number.isFinite(unitPrice) && unitPrice > 0;
  const validTravelers = Number.isInteger(travelers) && travelers >= 1 ? travelers : 1;
  const validNights = item.nights != null ? item.nights : (isStay ? (Number.isInteger(nights) && nights >= 1 ? nights : 1) : 1);
  const durationLabel = item.duration || `${validNights + 1} Days / ${validNights} Night${validNights === 1 ? "" : "s"}`;

  // If isTripPlan, unitPrice IS ALREADY the complete calculated total (Stay + Activities + Transport + Food)
  const baseFare = isTripPlan ? (isValidPrice ? unitPrice : 0) : (isValidPrice ? unitPrice * validTravelers * validNights : 0);
  const taxes = isTripPlan ? 0 : (isValidPrice ? Math.round(baseFare * 0.12) : 0);
  const grandTotal = isTripPlan ? (isValidPrice ? unitPrice : 0) : (isValidPrice ? baseFare + taxes : 0);

  // Plain JS computation for structuredDetails (NO conditional hook!)
  let structuredDetails;
  if (isTripPlan && item.bookingDetails) {
    structuredDetails = {
      ...item.bookingDetails,
      duration: durationLabel,
      priceSummary: {
        stay: item.bookingDetails.stay?.totalCost || 0,
        transport: item.bookingDetails.transport?.totalCost || 0,
        rental: item.bookingDetails.rental?.totalCost || 0,
        activities: (item.bookingDetails.activities || []).reduce(
          (acc, a) => acc + (a.totalPrice || a.unitPrice || 0),
          0
        ),
        food: item.bookingDetails.food?.budget || 0,
        taxes: 0,
        grandTotal: grandTotal
      }
    };
  } else if (isStay) {
    structuredDetails = {
      stay: {
        name: item.name || item.title || "Accommodation",
        type: item.type || item.category || "Hotel / Resort",
        nights: validNights,
        pricePerNight: unitPrice,
        totalCost: baseFare
      },
      transport: null,
      rental: null,
      activities: [],
      food: null,
      duration: durationLabel,
      priceSummary: {
        stay: baseFare,
        transport: 0,
        rental: 0,
        activities: 0,
        food: 0,
        taxes: taxes,
        grandTotal: grandTotal
      }
    };
  } else {
    const itemType = (item.type || item.category || "").toLowerCase();
    if (itemType === "activity") {
      structuredDetails = {
        stay: null,
        transport: null,
        rental: null,
        activities: [
          {
            name: item.name || item.title || "Activity Experience",
            unitPrice: unitPrice,
            travelers: validTravelers,
            totalPrice: baseFare
          }
        ],
        food: null,
        duration: durationLabel,
        priceSummary: {
          stay: 0,
          transport: 0,
          rental: 0,
          activities: baseFare,
          food: 0,
          taxes: taxes,
          grandTotal: grandTotal
        }
      };
    } else if (itemType === "transport" || item.mode) {
      structuredDetails = {
        stay: null,
        transport: {
          mode: item.mode || "Transit",
          detail: item.detail || item.name || item.route || "Local Transport",
          unitPrice: unitPrice,
          travelers: validTravelers,
          totalCost: baseFare
        },
        rental: null,
        activities: [],
        food: null,
        duration: durationLabel,
        priceSummary: {
          stay: 0,
          transport: baseFare,
          rental: 0,
          activities: 0,
          food: 0,
          taxes: taxes,
          grandTotal: grandTotal
        }
      };
    } else if (itemType === "rental") {
      structuredDetails = {
        stay: null,
        transport: null,
        rental: {
          option: item.name || item.option || "Rental Vehicle",
          type: item.vehicleType || "Vehicle",
          dailyRate: unitPrice,
          days: validNights,
          totalCost: baseFare
        },
        activities: [],
        food: null,
        duration: durationLabel,
        priceSummary: {
          stay: 0,
          transport: 0,
          rental: baseFare,
          activities: 0,
          food: 0,
          taxes: taxes,
          grandTotal: grandTotal
        }
      };
    } else {
      const stayPart = Math.round(baseFare * 0.5);
      const transPart = Math.round(baseFare * 0.2);
      const actPart = baseFare - stayPart - transPart;

      structuredDetails = {
        stay: {
          name: `${item.name || item.title} Accommodations`,
          type: "Curated Lodging",
          nights: validNights,
          pricePerNight: Math.round(stayPart / Math.max(1, validNights)),
          totalCost: stayPart
        },
        transport: {
          mode: "Curated Transfers",
          detail: `Transfers for ${item.name || item.title}`,
          unitPrice: Math.round(transPart / Math.max(1, validTravelers)),
          travelers: validTravelers,
          totalCost: transPart
        },
        rental: null,
        activities: [
          {
            name: `${item.name || item.title} Sightseeing`,
            unitPrice: Math.round(actPart / Math.max(1, validTravelers)),
            travelers: validTravelers,
            totalPrice: actPart
          }
        ],
        food: null,
        duration: durationLabel,
        priceSummary: {
          stay: stayPart,
          transport: transPart,
          rental: 0,
          activities: actPart,
          food: 0,
          taxes: taxes,
          grandTotal: grandTotal
        }
      };
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault();

    // Check authentication
    if (!currentUser) {
      setAuthMode("login");
      setIsAuthModalOpen(true);
      return;
    }

    if (
      !isValidPrice ||
      !Number.isFinite(grandTotal) ||
      grandTotal <= 0
    ) {
      setBookingError("Cannot confirm booking: Pricing for this item is currently unavailable.");
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    const bookingPayload = {
      destinationId: item.destinationId || item.id || "general",
      destinationName: item.destination || item.name || item.title || "TravelMate Experience",
      travelDate: selectedDate,
      travelersCount: validTravelers,
      travelerName: (travelerName || currentUser.name || "Guest").trim(),
      travelerEmail: (travelerEmail || currentUser.email || "").trim(),
      travelerPhone: travelerPhone.trim(),
      amount: grandTotal,
      status: "Pending",
      bookingDetails: {
        ...structuredDetails,
        duration: durationLabel,
        travelersCount: validTravelers,
        travelDate: selectedDate
      }
    };

    try {
      const saved = await saveBooking(bookingPayload);
      if (saved && saved.id) {
        setCreatedBookingId(saved.id);
        setStep("confirmed");

        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#2D5A27", "#4ADE80", "#1E3C1B", "#F59E0B"]
          });
        } catch (err) {}
      } else {
        setBookingError("Booking could not be confirmed by the database. Please try again.");
      }
    } catch (err) {
      setBookingError(err.message || "An error occurred while creating your reservation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setBookingError(null);
    closeBookingModal();
  };

  const handleDoneAndViewBookings = () => {
    setStep("form");
    setBookingError(null);
    closeBookingModal();
    if (currentUser?.role === "admin") {
      navigate("admin");
    } else {
      setIsProfileOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FAFBFB]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E8F3E6] text-[#2D5A27]">
              <Sparkles className="w-5 h-5 text-[#2D5A27]" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {step === "form" ? "Confirm Reservation" : "Booking Confirmed!"}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" /> Instant Reservation Confirmation
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If user is unauthenticated, show clean sign-in prompt within modal */}
        {!currentUser ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-[#E8F3E6] text-[#2D5A27] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8 text-[#2D5A27]" />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900">Sign In to Book This Trip</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Please sign in or create an account to finalize your reservation for{" "}
                <strong className="text-slate-900">{item.name || item.title || "this trip"}</strong>.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left max-w-xs mx-auto space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-800">{item.destination || item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold text-[#2D5A27]">{durationLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Price:</span>
                <span className="font-extrabold text-[#2D5A27]">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setAuthMode("login");
                setIsAuthModalOpen(true);
              }}
              className="w-full max-w-xs py-3 bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-bold text-sm rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-md"
            >
              <User className="w-4 h-4 text-[#4ADE80]" /> Sign In / Register
            </button>
          </div>
        ) : step === "form" ? (
          <form onSubmit={handleConfirm} className="p-6 overflow-y-auto space-y-5">
            {/* Selected Package Banner */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <SafeImage
                src={item.image}
                alt={item.name || item.title || "Selected Package"}
                category="destination"
                contextName={item.name || item.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {item.name || item.title}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                  {item.region || item.destination || item.location || "Curated Destination"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black text-[#2D5A27]">
                    {isValidPrice ? (
                      isTripPlan ? (
                        <>Total Package: ₹{grandTotal.toLocaleString()}</>
                      ) : (
                        <>₹{unitPrice.toLocaleString()} {isStay ? "/ night" : "/ person"}</>
                      )
                    ) : (
                      <span className="text-amber-700">Price unavailable</span>
                    )}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F3E6] text-[#2D5A27]">
                    {durationLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Travelers, Nights & Date Controls */}
            <div className={`grid grid-cols-1 ${isStay ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4`}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#2D5A27]" /> Travelers
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.max(1, validTravelers - 1))}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-slate-800">
                    {validTravelers} {validTravelers === 1 ? "Person" : "People"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTravelers(validTravelers + 1)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {isStay && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-[#2D5A27]" /> Duration
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setNights(Math.max(1, validNights - 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-sm text-slate-800">
                      {validNights} {validNights === 1 ? "Night" : "Nights"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNights(validNights + 1)}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" /> Travel Date
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                />
              </div>
            </div>

            {/* Traveler Contact Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lead Traveler Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Patel"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={travelerEmail}
                    onChange={(e) => setTravelerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={travelerPhone}
                    onChange={(e) => setTravelerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Customer Booking Summary Card */}
            {isValidPrice ? (
              <div className="rounded-2xl border border-[#2D5A27]/25 bg-[#F7FAF7] p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#2D5A27]/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#E8F3E6] text-[#2D5A27]">
                      <FileText className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#1E3C1B]">
                        Booking Summary
                      </h4>
                      <p className="text-[11px] text-slate-500">Review selected details before confirmation</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-[#2D5A27] border border-[#2D5A27]/20 shadow-2xs">
                    Fixed Price Lock
                  </span>
                </div>

                {/* Destination, Travelers, Duration & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Destination</span>
                    <span className="font-extrabold text-slate-900 truncate block">
                      {item.destination || item.name || item.title || "Travel Destination"}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {travelerName || currentUser?.name} • {travelerEmail || currentUser?.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration & Guests</span>
                    <span className="font-extrabold text-[#2D5A27] truncate block">
                      {durationLabel}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {validTravelers} {validTravelers === 1 ? "Traveler" : "Travelers"} • {selectedDate}
                    </span>
                  </div>
                </div>

                {/* Selections Breakdown */}
                <div className="space-y-2 text-xs divide-y divide-slate-100 pt-1">
                  {/* Stay */}
                  <div className="flex items-start justify-between pt-1 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Hotel className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">Stay: </span>
                        {structuredDetails?.stay ? (
                          <span className="text-slate-700 font-medium">
                            {structuredDetails.stay.name} ({structuredDetails.stay.nights}N @ ₹
                            {structuredDetails.stay.pricePerNight?.toLocaleString()}/night)
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not selected</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0 ml-2">
                      {structuredDetails?.stay ? `₹${Number(structuredDetails.stay.totalCost).toLocaleString()}` : "—"}
                    </span>
                  </div>

                  {/* Transport */}
                  <div className="flex items-start justify-between pt-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Car className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">Transport: </span>
                        {structuredDetails?.transport ? (
                          <span className="text-slate-700 font-medium">
                            {structuredDetails.transport.mode}
                            {structuredDetails.transport.detail ? ` (${structuredDetails.transport.detail})` : ""}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not selected</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0 ml-2">
                      {structuredDetails?.transport ? `₹${Number(structuredDetails.transport.totalCost).toLocaleString()}` : "—"}
                    </span>
                  </div>

                  {/* Rental */}
                  <div className="flex items-start justify-between pt-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">Rental: </span>
                        {structuredDetails?.rental ? (
                          <span className="text-slate-700 font-medium">
                            {structuredDetails.rental.option || structuredDetails.rental.name} ({structuredDetails.rental.days || 1}D @ ₹
                            {structuredDetails.rental.dailyRate?.toLocaleString()}/day)
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not selected</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0 ml-2">
                      {structuredDetails?.rental ? `₹${Number(structuredDetails.rental.totalCost).toLocaleString()}` : "—"}
                    </span>
                  </div>

                  {/* Activities */}
                  <div className="flex items-start justify-between pt-2 text-slate-600">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">Activities: </span>
                        {structuredDetails?.activities && structuredDetails.activities.length > 0 ? (
                          <div className="text-slate-700 font-medium space-y-0.5">
                            {structuredDetails.activities.map((a, idx) => (
                              <div key={idx} className="text-[11px]">
                                • {a.name} ({a.travelers || validTravelers} pax @ ₹
                                {Number(a.unitPrice).toLocaleString()})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not selected</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0 ml-2">
                      {structuredDetails?.activities && structuredDetails.activities.length > 0
                        ? `₹${Number(structuredDetails.activities.reduce((sum, a) => sum + (a.totalPrice || a.unitPrice || 0), 0)).toLocaleString()}`
                        : "—"}
                    </span>
                  </div>

                  {/* Food */}
                  <div className="flex items-start justify-between pt-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">Food: </span>
                        {structuredDetails?.food ? (
                          <span className="text-slate-700 font-medium">
                            {structuredDetails.food.description || `₹${Number(structuredDetails.food.budget).toLocaleString()} Allowance`}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not selected</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0 ml-2">
                      {structuredDetails?.food ? `₹${Number(structuredDetails.food.budget).toLocaleString()}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Subtotal & Final Total */}
                <div className="pt-2.5 border-t border-[#2D5A27]/20 space-y-1 text-xs">
                  {taxes > 0 && (
                    <>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-slate-800">₹{baseFare.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>Taxes & GST (12%):</span>
                        <span className="font-semibold text-slate-800">₹{taxes.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  {isTripPlan && (
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Trip Package Subtotal:</span>
                      <span className="font-semibold text-slate-800">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-sm font-black text-[#1E3C1B]">
                    <span>Final Total:</span>
                    <span className="text-base font-extrabold text-[#2D5A27]">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block">Price Unavailable</span>
                  <span>This option does not have active fixed pricing. Please select an alternative experience.</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !isValidPrice}
              className="w-full py-3.5 bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
              {submitting ? "Confirming Reservation..." : "Confirm Reservation"}
            </button>
          </form>
        ) : (
          /* Success Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-[#E8F3E6] text-[#2D5A27] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-[#2D5A27]" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-slate-900">Reservation Confirmed!</h4>
              <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                Reservation confirmed for <strong className="text-slate-900">{travelerName || currentUser?.name}</strong> for{" "}
                <strong className="text-[#2D5A27]">{item.name || item.title}</strong> ({durationLabel}) on{" "}
                <strong>{selectedDate}</strong>.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left max-w-sm mx-auto space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Database Record ID:</span>
                <span className="font-mono font-bold text-slate-800">#{createdBookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold text-[#2D5A27]">{durationLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travelers:</span>
                <span className="font-bold text-slate-800">
                  {validTravelers} {validTravelers === 1 ? "Guest" : "Guests"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-[#2D5A27]">₹{grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                <span>Confirmation status:</span>
                <span>Instant Confirmation Active</span>
              </div>
            </div>
            <button
              onClick={handleDoneAndViewBookings}
              className="px-6 py-2.5 bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Done & View Bookings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
