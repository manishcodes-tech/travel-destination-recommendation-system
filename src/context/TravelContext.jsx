import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { destinations as fallbackDestinations } from "../data/destinations";
import { api } from "../services/api";

const TravelContext = createContext();

const parseHashRoute = (rawHash) => {
  if (!rawHash) return { route: "home", destId: "manali" };
  // Remove leading '#' and query strings
  let clean = rawHash.replace(/^#+/, "").split("?")[0].trim();
  // Strip leading and trailing slashes e.g. "/destinations/" -> "destinations"
  clean = clean.replace(/^\/+|\/+$/g, "");
  if (!clean) return { route: "home", destId: "manali" };

  if (clean.startsWith("destination/")) {
    const parts = clean.split("/");
    const destId = parts[1] || "manali";
    return { route: "destination-detail", destId };
  }
  return { route: clean, destId: "manali" };
};

export function parseDaysNights(durationStr, explicitDays, explicitNights) {

  if (explicitDays != null && !isNaN(Number(explicitDays))) {
    const d = Math.max(1, Number(explicitDays));
    const n = explicitNights != null && !isNaN(Number(explicitNights)) ? Math.max(0, Number(explicitNights)) : Math.max(0, d - 1);
    return { days: d, nights: n };
  }
  if (typeof durationStr === "number") {
    const d = Math.max(1, Math.round(durationStr));
    return { days: d, nights: Math.max(0, d - 1) };
  }
  if (typeof durationStr === "string" && durationStr.trim()) {
    const dMatch = durationStr.match(/(\d+)\s*(?:day|d)/i);
    const nMatch = durationStr.match(/(\d+)\s*(?:night|n)/i);
    if (dMatch && nMatch) {
      return { days: Math.max(1, parseInt(dMatch[1], 10)), nights: Math.max(0, parseInt(nMatch[1], 10)) };
    }
    if (dMatch) {
      const d = Math.max(1, parseInt(dMatch[1], 10));
      return { days: d, nights: Math.max(0, d - 1) };
    }
    if (nMatch) {
      const n = Math.max(0, parseInt(nMatch[1], 10));
      return { days: Math.max(1, n), nights: n };
    }
    const nums = durationStr.match(/\d+/g);
    if (nums && nums.length >= 2) {
      return { days: Math.max(1, parseInt(nums[0], 10)), nights: Math.max(0, parseInt(nums[1], 10)) };
    } else if (nums && nums.length === 1) {
      const d = Math.max(1, parseInt(nums[0], 10));
      return { days: d, nights: Math.max(0, d - 1) };
    }
  }
  return { days: 2, nights: 1 };
}

export function formatDuration(days, nights) {
  const dUnit = days === 1 ? "Day" : "Days";
  const nUnit = nights === 1 ? "Night" : "Nights";
  return `${days} ${dUnit} / ${nights} ${nUnit}`;
}

export function calcDynamicPrice(catalogBasePrice, days, nights) {
  const b = Math.max(1500, Number(catalogBasePrice) || 8500);
  const fixedPart = 0.35 * b;
  const stayPerNight = (0.45 * b) / 2.0;
  const dailyFoodLocal = (0.20 * b) / 3.0;
  const calculated = fixedPart + (stayPerNight * Math.max(0, nights)) + (dailyFoodLocal * Math.max(1, days));
  return Math.round(calculated / 50) * 50;
}

export function TravelProvider({ children }) {

  // Navigation & Route state synced with window hash
  const [currentRoute, setCurrentRoute] = useState(() => {
    return parseHashRoute(window.location.hash).route;
  });

  const [selectedDestinationId, setSelectedDestinationId] = useState(() => {
    return parseHashRoute(window.location.hash).destId;
  });

  // Destinations from database (with local fallback)
  const [destinations, setDestinations] = useState(fallbackDestinations);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [destinationsError, setDestinationsError] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authPromptMessage, setAuthPromptMessage] = useState("");
  const [prefilledEmail, setPrefilledEmail] = useState("");
  const [profileTab, setProfileTab] = useState("profile"); // "profile" | "saved" | "trips"

  const openAuthModal = (mode = "login", promptMessage = "", emailPrefill = "") => {
    setAuthMode(mode);
    setAuthPromptMessage(promptMessage || "");
    if (emailPrefill) {
      setPrefilledEmail(emailPrefill);
    }
    setIsAuthModalOpen(true);
  };

  const openProfileModal = (tab = "profile") => {
    if (!currentUser) {
      openAuthModal("login", "Please sign in to continue");
      return;
    }
    setProfileTab(tab);
    setIsProfileOpen(true);
  };

  // Modals & Drawers
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [bookingModal, setBookingModal] = useState({ isOpen: false, item: null });
  const [pendingBookingItem, setPendingBookingItem] = useState(null);

  // Persistent Active Booking Plan (for Budget Planner -> Booking page or modal)
  const [activeBookingPlan, setActiveBookingPlanState] = useState(() => {
    try {
      const saved = sessionStorage.getItem("travelmate_active_plan");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const setActiveBookingPlan = (plan) => {
    setActiveBookingPlanState(plan);
    try {
      if (plan) {
        sessionStorage.setItem("travelmate_active_plan", JSON.stringify(plan));
      } else {
        sessionStorage.removeItem("travelmate_active_plan");
      }
    } catch (e) {}
  };

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: "n-1",
      title: "Flash Price Drop in Manali!",
      description: "Volvo coach + 4-star stay packages dropped by 18% for October dates.",
      time: "10 mins ago",
      read: false,
      tag: "Price Drop"
    },
    {
      id: "n-2",
      title: "Monsoon Season Alert: Kerala",
      description: "Best Ayurvedic retreats in Kumarakom now offering complimentary houseboat dinners.",
      time: "2 hours ago",
      read: false,
      tag: "Seasonal"
    },
    {
      id: "n-3",
      title: "Booking Confirmed #BK-8901",
      description: "Your Manali alpine retreat tickets have been issued and sent to your email.",
      time: "1 day ago",
      read: true,
      tag: "Booking"
    }
  ]);

  // Wishlist / Bookmarks (Synchronized with SQLite)
  const [savedWishlist, setSavedWishlist] = useState([]);

  // User bookings list (Synchronized with SQLite)
  const [userBookings, setUserBookings] = useState([]);

  // Route parameters passed via navigate()
  const [routeParams, setRouteParams] = useState({});

  // Plan Trip Form state
  const [userPreferences, setUserPreferences] = useState({
    destination: "",
    budget: "",
    duration: "2 Days / 1 Night",
    days: 2,
    nights: 1,
    travelers: 2,
    season: "Winter",
    style: "Adventure",
    travelWith: "Friends"
  });

  // Dynamic recommendation results
  const [recommendationResults, setRecommendationResults] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);

  // Budget Planner state (Clean dynamic state without hardcoded defaults)
  const [budgetState, setBudgetState] = useState({
    destinationId: "",
    destinationName: "",
    travelers: 2,
    days: 2,
    nights: 1,
    targetBudget: "",
    targetBudgetPerPerson: "",
    selectedStay: null,
    selectedActivities: [],
    selectedTransport: null,
    selectedRental: null,
    foodBudget: ""
  });


  // Listen to browser hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const { route, destId } = parseHashRoute(window.location.hash);
      if (route === "destination-detail") {
        setSelectedDestinationId(destId);
        setCurrentRoute("destination-detail");
      } else if (route === "login") {
        openAuthModal("login");
        setCurrentRoute("home");
      } else if (route === "register") {
        openAuthModal("register");
        setCurrentRoute("home");
      } else if (route === "profile") {
        openProfileModal("profile");
        setCurrentRoute("home");
      } else if (route === "wishlist") {
        openProfileModal("saved");
        setCurrentRoute("home");
      } else if (route === "admin/login") {
        openAuthModal("login", "Admin Authentication Required");
        setCurrentRoute("home");
      } else {
        setCurrentRoute(route);
      }
    };

    // Trigger on mount if starting with special hash
    const initialHash = window.location.hash;
    if (initialHash && ["#/login", "#/register", "#/profile", "#/wishlist", "#/admin/login"].includes(initialHash)) {
      handleHashChange();
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Sync route changes to hash
  const navigate = (route, params = {}) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setRouteParams(params || {});
    if (route === "destination-detail") {
      const id = params.id || selectedDestinationId || "manali";
      setSelectedDestinationId(id);
      window.location.hash = `#/destination/${id}`;
      setCurrentRoute("destination-detail");
      return;
    }

    if (params.id) {
      setSelectedDestinationId(params.id);
    }

    const clean = (route || "home").replace(/^#+/, "").replace(/^\/+|\/+$/g, "");
    window.location.hash = clean === "home" ? "#/" : `#/${clean}`;
    setCurrentRoute(clean);
  };

  // Fetch live destinations from backend on boot
  const refreshDestinations = useCallback(async () => {
    try {
      setDestinationsLoading(true);
      const list = await api.getDestinations();
      if (Array.isArray(list) && list.length > 0) {
        setDestinations(list);
        setDestinationsError(null);
        setIsBackendOnline(true);
        return list;
      } else {
        throw new Error("Empty destination response");
      }
    } catch (err) {
      console.warn("Backend destinations unreachable, using fallback cache:", err.message);
      setDestinations(fallbackDestinations);
      setDestinationsError("Unable to load destinations from server. Using offline catalog.");
      setIsBackendOnline(false);
      return fallbackDestinations;
    } finally {
      setDestinationsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDestinations();
  }, [refreshDestinations]);

  // Check existing session on boot
  useEffect(() => {
    const checkSession = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const res = await api.getMe();
          if (res && res.user) {
            setCurrentUser(res.user);
            if (res.wishlist) setSavedWishlist(res.wishlist);
            if (res.bookings) setUserBookings(res.bookings);
          } else {
            api.clearToken();
            setCurrentUser(null);
            setSavedWishlist([]);
            setUserBookings([]);
          }
        } catch (e) {
          api.clearToken();
          setCurrentUser(null);
          setSavedWishlist([]);
          setUserBookings([]);
        }
      } else {
        setCurrentUser(null);
        setSavedWishlist([]);
        setUserBookings([]);
      }
    };
    checkSession();
  }, []);

  // Fetch individual destination details by ID
  const getDestinationById = useCallback(
    async (id) => {
      if (!id) return null;
      const cleanId = String(id).toLowerCase().trim();
      try {
        const data = await api.getDestinationById(cleanId);
        if (data && data.id) {
          return data;
        }
      } catch (err) {
        console.warn(`Could not load destination details for '${id}' from API:`, err.message);
      }
      const fallback =
        (destinations || []).find((d) => (d.id || "").toLowerCase() === cleanId || (d.name || "").toLowerCase() === cleanId) ||
        (fallbackDestinations || []).find((d) => (d.id || "").toLowerCase() === cleanId || (d.name || "").toLowerCase() === cleanId);
      return fallback || null;
    },
    [destinations]
  );

  // Auth Functions
  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.user) {
      setCurrentUser(res.user);
      if (res.wishlist) setSavedWishlist(res.wishlist);
      // Fetch bookings for this user
      try {
        const b = await api.getBookings();
        setUserBookings(b);
      } catch (err) {
        console.log(err);
      }
      if (pendingBookingItem) {
        setActiveBookingPlan(pendingBookingItem);
        setPendingBookingItem(null);
        setBookingModal({ isOpen: false, item: null });
        if (currentRoute !== "booking") {
          navigate("booking");
        }
      }
    }
    return res;
  };

  const register = async (name, email, password, persona, avatar) => {
    const res = await api.register(name, email, password, persona, avatar);
    // Important: DO NOT automatically log in or set currentUser.
    // User must sign in using newly created credentials.
    return res;
  };

  const logout = () => {
    api.clearToken();
    try {
      localStorage.removeItem("travelmate_token");
      sessionStorage.clear();
    } catch (e) {}
    setCurrentUser(null);
    setSavedWishlist([]);
    setUserBookings([]);
    setBookingModal({ isOpen: false, item: null });
    setPendingBookingItem(null);
    if (window.location.hash.includes("admin")) {
      navigate("home");
    }
  };

  // Toggle bookmark in wishlist (Synced with SQLite)
  const toggleBookmark = async (id) => {
    if (!currentUser) {
      openAuthModal("login", "Please sign in to continue");
      return;
    }

    // Optimistic local update
    setSavedWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    try {
      const res = await api.toggleWishlist(id);
      if (res.wishlist) {
        setSavedWishlist(res.wishlist);
      }
    } catch (err) {
      console.log("Could not sync wishlist with backend, keeping local state");
    }
  };

  // Create booking record (Strictly Authenticated)
  const saveBooking = async (bookingData) => {
    if (!currentUser) {
      setAuthMode("login");
      setIsAuthModalOpen(true);
      return null;
    }
    try {
      const payload = {
        ...bookingData,
        status: bookingData.status || "Pending"
      };
      const res = await api.createBooking(payload);
      if (res && res.booking) {
        setUserBookings((prev) => [res.booking, ...prev]);
        return res.booking;
      }
    } catch (err) {
      console.error("Booking failed to save to database:", err);
      throw err;
    }
    return null;
  };

  // Client-side rule-based recommendation calculation
  const calculateRecommendations = useCallback(
    (prefs = userPreferences) => {
      const listToScore = destinations && destinations.length > 0 ? destinations : fallbackDestinations;
      const { days, nights } = parseDaysNights(prefs.duration, prefs.days, prefs.nights);
      const formattedDur = formatDuration(days, nights);
      const hasUserBudget = Number(prefs.budget) > 0;
      const userBudget = hasUserBudget ? Number(prefs.budget) : null;

      const scored = [];
      for (const dest of listToScore) {
        const catalogPrice = Number(dest.base_price || dest.basePrice || dest.estimated_budget || 8500);
        const dynamicPrice = calcDynamicPrice(catalogPrice, days, nights);

        const dName = (dest.name || "").toLowerCase();
        const target = (prefs.destination || "").toLowerCase().trim();
        const isMatch = target && (target === dName || target === dest.id.toLowerCase() || dName.includes(target) || target.includes(dName));

        // When user provided a target budget: prioritize active catalog items whose calculated cost fits within the budget
        const fitsBudget = hasUserBudget ? dynamicPrice <= userBudget : true;

        // If target budget is provided and item exceeds budget, don't show in main recommendations unless it's the user's specific matched destination
        if (hasUserBudget && !fitsBudget && !isMatch) {
          continue;
        }

        let score = 50;
        if (hasUserBudget) {
          const priceDiff = Math.abs(dynamicPrice - userBudget);
          const budgetFactor = Math.max(0, 1 - priceDiff / Math.max(userBudget, dynamicPrice, 1));
          score += budgetFactor * 25;
        } else {
          // If no user budget set, provide baseline score without artificial budget penalty
          score += 20;
        }

        const destStyles = dest.styles || [dest.category || "Mountains"];
        const userStyle = (prefs.style || prefs.interest || "Adventure").toLowerCase();
        if (destStyles.some((s) => s.toLowerCase() === userStyle)) {
          score += 15;
        } else if (destStyles.some((s) => s.toLowerCase().includes(userStyle))) {
          score += 8;
        }

        const destSeasons = dest.seasons || [dest.best_season || "Winter", "All"];
        const userSeason = (prefs.season || "Winter").toLowerCase();
        if (destSeasons.some((s) => s.toLowerCase() === userSeason || s.toLowerCase() === "all")) {
          score += 10;
        }

        const destTravelWith = dest.travelWith || ["Friends", "Couple", "Solo", "Family"];
        const userTravelWith = (prefs.travelWith || prefs.traveling_with || "Friends").toLowerCase();
        if (destTravelWith.some((tw) => tw.toLowerCase() === userTravelWith)) {
          score += 8;
        }

        if (isMatch) {
          score = 98;
        } else {
          score += ((dest.rating - 4.0) / 1.0) * 5;
        }

        const matchScore = Math.min(98, Math.max(68, Math.round(score)));
        const reasons = [];
        if (isMatch) {
          reasons.push("Your selected destination for this trip");
        }
        if (destStyles.some((s) => s.toLowerCase().includes(userStyle))) {
          reasons.push(`Matches your ${prefs.style || "Adventure"} preference`);
        }
        if (destSeasons.some((s) => s.toLowerCase() === userSeason || s.toLowerCase() === "all")) {
          reasons.push(`Suitable for ${(prefs.season || "Winter").toLowerCase()} travel`);
        }
        if (hasUserBudget) {
          if (fitsBudget) {
            reasons.push(`Fits within your ₹${userBudget.toLocaleString()} budget for ${formattedDur}`);
          } else {
            reasons.push(`Optimized for your trip plan`);
          }
        } else {
          reasons.push(`Dynamic package curated for ${formattedDur}`);
        }
        if (reasons.length < 2 && (dest.rating || 4.8) >= 4.7) {
          reasons.push(`Top-rated destination (${dest.rating || 4.8}★) with verified experiences`);
        }

        const finalPrice = dynamicPrice;

        scored.push({
          ...dest,
          destination_id: dest.id,
          matchScore,
          match_score: matchScore,
          reasons,
          duration: formattedDur,
          days,
          nights,
          basePrice: finalPrice,
          base_price: finalPrice,
          estimated_budget: finalPrice,
          price: finalPrice,
          formatted_price: `₹${finalPrice.toLocaleString()}`
        });
      }

      scored.sort((a, b) => b.matchScore - a.matchScore);
      setRecommendationResults(scored);
      return scored;
    },
    [destinations, userPreferences]
  );

  // Server-side recommendation engine caller
  const fetchRecommendations = useCallback(
    async (prefs = userPreferences) => {
      setRecommendationsLoading(true);
      setRecommendationsError(null);
      const { days, nights } = parseDaysNights(prefs.duration, prefs.days, prefs.nights);
      const formattedDur = formatDuration(days, nights);
      const hasUserBudget = Number(prefs.budget) > 0;
      const userBudget = hasUserBudget ? Number(prefs.budget) : null;
      const travelersCount = Number(prefs.travelers) || 2;

      try {
        const payload = {
          budget: userBudget,
          duration: formattedDur,
          days: days,
          nights: nights,
          travelers: travelersCount,
          traveling_with: prefs.travelWith || prefs.traveling_with || "Friends",
          interest: prefs.style || prefs.interest || "Adventure",
          season: prefs.season || "Winter",
          destination: prefs.destination ? String(prefs.destination).trim() : null
        };
        const res = await api.getRecommendations(payload);
        if (res && res.recommendations && Array.isArray(res.recommendations)) {
          let recs = res.recommendations;

          // STRICT BUDGET FILTER: If user specified budget, prioritize / filter options
          if (hasUserBudget) {
            recs = recs.filter((r) => Number(r.base_price || r.basePrice || 0) <= userBudget);
          }

          // Ensure every card has the dynamic duration and prices
          recs = recs.map((r) => ({
            ...r,
            duration: formattedDur,
            days: days,
            nights: nights,
            basePrice: Number(r.base_price || r.basePrice || 0),
            base_price: Number(r.base_price || r.basePrice || 0)
          }));

          setRecommendationResults(recs);
          setRecommendationsLoading(false);
          return recs;
        } else {
          throw new Error("Invalid response format from recommendation engine");
        }
      } catch (err) {
        console.warn("Recommendation API error, running client calculation fallback:", err.message);
        const fallbackRes = calculateRecommendations({
          ...prefs,
          budget: prefs.budget,
          days,
          nights,
          travelers: travelersCount,
          duration: formattedDur
        });
        setRecommendationResults(fallbackRes);
        setRecommendationsLoading(false);
        return fallbackRes;
      }
    },
    [userPreferences, calculateRecommendations]
  );

  // Server-side recommendation preview endpoint caller
  const fetchRecommendationsPreview = useCallback(
    async (prefs = userPreferences) => {
      return fetchRecommendations(prefs);
    },
    [fetchRecommendations]
  );

  useEffect(() => {
    fetchRecommendations(userPreferences);
  }, [fetchRecommendations, userPreferences]);

  // Update budget planner when a destination is chosen
  const setBudgetDestination = (destOrId) => {
    const destId = typeof destOrId === "object" && destOrId !== null ? destOrId.id : destOrId;
    const destObj =
      typeof destOrId === "object" && destOrId !== null
        ? destOrId
        : (destinations || []).find((d) => d.id === destId);
    const travelersCount = userPreferences.travelers || 2;
    const daysCount = userPreferences.days || 2;
    const nightsCount = userPreferences.nights !== undefined ? userPreferences.nights : 1;
    const targetBudgetVal = userPreferences.budget
      ? Number(userPreferences.budget) * travelersCount
      : "";

    setBudgetState((prev) => ({
      ...prev,
      destinationId: destId || "",
      destinationName: destObj?.name || "",
      travelers: travelersCount,
      days: daysCount,
      nights: nightsCount,
      targetBudget: targetBudgetVal,
      targetBudgetPerPerson: userPreferences.budget ? Number(userPreferences.budget) : "",
      selectedStay: null,
      selectedActivities: [],
      selectedTransport: null,
      selectedRental: null,
      foodBudget: ""
    }));
  };


  const openBookingModal = (item) => {
    if (item) {
      setActiveBookingPlan(item);
    }
    if (!currentUser) {
      setPendingBookingItem(item);
      openAuthModal("login", "Please sign in to confirm your booking reservation");
      return;
    }
    setBookingModal({ isOpen: true, item });
  };

  const closeBookingModal = () => {
    setBookingModal({ isOpen: false, item: null });
    setPendingBookingItem(null);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <TravelContext.Provider
      value={{
        currentRoute,
        navigate,
        selectedDestinationId,
        setSelectedDestinationId,
        destinations,
        destinationsLoading,
        destinationsError,
        isBackendOnline,
        refreshDestinations,
        getDestinationById,
        routeParams,
        setRouteParams,
        userPreferences,
        setUserPreferences,
        recommendationResults,
        recommendationsLoading,
        recommendationsError,
        fetchRecommendations,
        calculateRecommendations,
        fetchRecommendationsPreview,
        savedWishlist,
        toggleBookmark,
        userBookings,
        saveBooking,
        budgetState,
        setBudgetState,
        setBudgetDestination,
        formatDuration,
        parseDaysNights,
        calcDynamicPrice,
        isSearchModalOpen,

        setIsSearchModalOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        isProfileOpen,
        setIsProfileOpen,
        profileTab,
        setProfileTab,
        openProfileModal,
        notifications,
        markAllNotificationsRead,
        unreadCount,
        bookingModal,
        openBookingModal,
        closeBookingModal,
        activeBookingPlan,
        setActiveBookingPlan,
        pendingBookingItem,
        setPendingBookingItem,
        // Auth state
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        authPromptMessage,
        setAuthPromptMessage,
        prefilledEmail,
        setPrefilledEmail,
        openAuthModal,
        login,
        register,
        logout
      }}
    >
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error("useTravel must be used within a TravelProvider");
  }
  return context;
}
