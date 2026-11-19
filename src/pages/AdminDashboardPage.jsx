import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTravel } from "../context/TravelContext";
import { api } from "../services/api";
import {
  TrendingUp,
  CalendarCheck,
  MapPin,
  Hotel,
  Plane,
  Car,
  Compass,
  Utensils,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Lock,
  LogOut,
  ArrowLeft,
  X,
  Eye,
  Star,
  Check,
  Filter,
  ChevronDown,
  FileText,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ShieldCheck,
  Tag,
  IndianRupee,
  Loader2
} from "lucide-react";
import SafeImage from "../components/SafeImage";

export default function AdminDashboardPage() {
  const { currentUser, login, navigate, logout, refreshDestinations } = useTravel();

  // Admin Auth Portal Gate
  const [adminIdentifier, setAdminIdentifier] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Global Data State
  const [stats, setStats] = useState({
    kpis: {
      totalUsers: 0,
      totalDestinations: 0,
      activeDestinations: 0,
      totalStays: 0,
      activeStays: 0,
      totalTransport: 0,
      activeTransport: 0,
      totalRentals: 0,
      activeRentals: 0,
      totalActivities: 0,
      activeActivities: 0,
      totalFood: 0,
      activeFood: 0,
      totalWishlist: 0,
      tripsCreated: 0,
      totalTrips: 0,
      totalRevenue: 0
    },
    bookings: []
  });

  // Entity Lists
  const [destinationsList, setDestinationsList] = useState([]);
  const [staysList, setStaysList] = useState([]);
  const [transportList, setTransportList] = useState([]);
  const [rentalsList, setRentalsList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [foodList, setFoodList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Loading & Filter States
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Search & Filters per Tab
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestFilter, setSelectedDestFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");

  // Booking Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingStatusUpdating, setBookingStatusUpdating] = useState(false);
  const [newBookingStatus, setNewBookingStatus] = useState("Confirmed");

  // CRUD Modals
  const [modalType, setModalType] = useState(null); // 'destination' | 'stay' | 'transport' | 'rental' | 'activity' | 'food'
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [formData, setFormData] = useState({});
  const [formSaving, setFormSaving] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Reset filters on tab switch
  useEffect(() => {
    setSearchQuery("");
    setSelectedDestFilter("All");
    setSelectedStatusFilter("All");
    setSelectedTypeFilter("All");
  }, [activeTab]);

  // Load KPI Stats & Bookings
  const fetchStatsAndBookings = useCallback(async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const data = await api.getAdminStats();
      if (data) {
        setStats({
          kpis: data.kpis || {},
          bookings: data.bookings || []
        });
      }
    } catch (err) {
      console.error("Could not fetch admin stats:", err);
    }
  }, [currentUser]);

  // Fetch Destination list for dropdowns and destination tab
  const fetchDestinations = useCallback(async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const list = await api.adminGetDestinations();
      if (Array.isArray(list)) {
        setDestinationsList(list);
      }
    } catch (err) {
      console.error("Could not fetch destinations:", err);
    }
  }, [currentUser]);

  // Tab Data Fetcher
  const loadCurrentTabData = useCallback(async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    setLoading(true);
    try {
      if (activeTab === "overview") {
        await Promise.all([fetchStatsAndBookings(), fetchDestinations()]);
      } else if (activeTab === "bookings") {
        await fetchStatsAndBookings();
      } else if (activeTab === "destinations") {
        await fetchDestinations();
      } else if (activeTab === "stays") {
        const stays = await api.adminGetStays({
          destination_id: selectedDestFilter !== "All" ? selectedDestFilter : undefined,
          status: selectedStatusFilter !== "All" ? selectedStatusFilter : undefined,
          search: searchQuery || undefined
        });
        setStaysList(Array.isArray(stays) ? stays : []);
      } else if (activeTab === "transport") {
        const trans = await api.adminGetTransport({
          destination_id: selectedDestFilter !== "All" ? selectedDestFilter : undefined,
          status: selectedStatusFilter !== "All" ? selectedStatusFilter : undefined,
          search: searchQuery || undefined
        });
        setTransportList(Array.isArray(trans) ? trans : []);
      } else if (activeTab === "rentals") {
        const rents = await api.adminGetRentals({
          destination_id: selectedDestFilter !== "All" ? selectedDestFilter : undefined,
          status: selectedStatusFilter !== "All" ? selectedStatusFilter : undefined,
          search: searchQuery || undefined
        });
        setRentalsList(Array.isArray(rents) ? rents : []);
      } else if (activeTab === "activities") {
        const acts = await api.adminGetActivities({
          destination_id: selectedDestFilter !== "All" ? selectedDestFilter : undefined,
          status: selectedStatusFilter !== "All" ? selectedStatusFilter : undefined,
          search: searchQuery || undefined
        });
        setActivitiesList(Array.isArray(acts) ? acts : []);
      } else if (activeTab === "food") {
        const foods = await api.adminGetFood({
          destination_id: selectedDestFilter !== "All" ? selectedDestFilter : undefined,
          status: selectedStatusFilter !== "All" ? selectedStatusFilter : undefined,
          search: searchQuery || undefined
        });
        setFoodList(Array.isArray(foods) ? foods : []);
      } else if (activeTab === "users") {
        const users = await api.getUsers();
        setUsersList(Array.isArray(users) ? users : []);
      }
    } catch (err) {
      console.error("Error loading tab data:", err);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    currentUser,
    fetchStatsAndBookings,
    fetchDestinations,
    selectedDestFilter,
    selectedStatusFilter,
    searchQuery
  ]);

  useEffect(() => {
    loadCurrentTabData();
  }, [loadCurrentTabData]);


  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await login(adminIdentifier, adminPassword);
      if (res?.user?.role !== "admin") {
        throw new Error("This account does not have administrator privileges.");
      }
      showToast("Signed in as Administrator");
    } catch (err) {
      setAuthError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Status Updater for Bookings
  const handleUpdateBookingStatus = async (bookingId, targetStatus) => {
    setBookingStatusUpdating(true);
    try {
      await api.updateBookingStatus(bookingId, targetStatus);
      showToast(`Booking ${bookingId} updated to ${targetStatus}`);
      if (selectedBooking) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: targetStatus } : null));
      }
      await fetchStatsAndBookings();
    } catch (err) {
      showToast(err.message || "Failed to update booking status");
    } finally {
      setBookingStatusUpdating(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (type, item) => {
    try {
      const currentActive = item.is_active === 1 || item.is_active === true;
      const nextActive = currentActive ? 0 : 1;

      if (type === "destination") {
        await api.adminToggleDestinationStatus(item.id, nextActive);
        setDestinationsList((prev) =>
          prev.map((d) => (d.id === item.id ? { ...d, is_active: nextActive } : d))
        );
      } else if (type === "stay") {
        await api.adminToggleStayStatus(item.id, nextActive);
        setStaysList((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, is_active: nextActive } : s))
        );
      } else if (type === "transport") {
        await api.adminToggleTransportStatus(item.id, nextActive);
        setTransportList((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, is_active: nextActive } : t))
        );
      } else if (type === "rental") {
        await api.adminToggleRentalStatus(item.id, nextActive);
        setRentalsList((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, is_active: nextActive } : r))
        );
      } else if (type === "activity") {
        await api.adminToggleActivityStatus(item.id, nextActive);
        setActivitiesList((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, is_active: nextActive } : a))
        );
      } else if (type === "food") {
        await api.adminToggleFoodStatus(item.id, nextActive);
        setFoodList((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, is_active: nextActive } : f))
        );
      }

      showToast(`Item ${nextActive === 1 ? "Activated" : "Deactivated"} successfully`);
      await refreshDestinations();
      fetchStatsAndBookings();
    } catch (err) {
      showToast(err.message || "Could not update status");
    }
  };

  // Delete / Soft-Deactivate
  const handleExecuteDelete = async () => {
    if (!deleteConfirmItem) return;
    const { type, item } = deleteConfirmItem;
    try {
      if (type === "destination") {
        await api.adminDeleteDestination(item.id);
      } else if (type === "stay") {
        await api.adminDeleteStay(item.id);
      } else if (type === "transport") {
        await api.adminDeleteTransport(item.id);
      } else if (type === "rental") {
        await api.adminDeleteRental(item.id);
      } else if (type === "activity") {
        await api.adminDeleteActivity(item.id);
      } else if (type === "food") {
        await api.adminDeleteFood(item.id);
      }

      showToast("Item successfully deactivated from catalog");
      setDeleteConfirmItem(null);
      await loadCurrentTabData();
      await refreshDestinations();
      fetchStatsAndBookings();
    } catch (err) {
      showToast(err.message || "Failed to deactivate item");
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = (type) => {
    setModalType(type);
    setModalMode("create");
    const defaultDest = destinationsList[0]?.id || "manali";

    if (type === "destination") {
      setFormData({
        name: "",
        region: "",
        country: "India",
        category: "Mountains",
        base_price: 8500,
        duration: "3 Days / 2 Nights",
        best_season: "Winter",
        tagline: "",
        description: "",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
        tags: "Handcrafted,Scenic,Curated",
        is_active: 1
      });
    } else if (type === "stay") {
      setFormData({
        destination_id: defaultDest,
        name: "",
        type: "Luxury Resort",
        price: "₹3,500 / night",
        price_num: 3500,
        rating: 4.8,
        location: "",
        amenities: "Wi-Fi, Mountain View, Heated Pool, Breakfast",
        description: "",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        is_active: 1
      });
    } else if (type === "transport") {
      setFormData({
        destination_id: defaultDest,
        mode: "Volvo AC Semi-Sleeper Coach",
        type: "Intercity",
        provider: "Himalayan Express Line",
        est_time: "Overnight (12 hrs)",
        est_cost: "₹1,400",
        price_num: 1400,
        icon: "Bus",
        detail: "Daily overnight departure with reclining seats and USB ports",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        is_active: 1
      });
    } else if (type === "rental") {
      setFormData({
        destination_id: defaultDest,
        option_name: "Royal Enfield Classic 350",
        type: "Motorbike",
        cost: "₹1,200 / day",
        cost_num: 1200,
        provider: "Himalayan Self-Drive Rentals",
        note: "Includes 2 ISI helmets and unlimited kilometers",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
        is_active: 1
      });
    } else if (type === "activity") {
      setFormData({
        destination_id: defaultDest,
        name: "Solang Valley Tandem Paragliding",
        category: "Adventure",
        price: "₹1,500",
        price_num: 1500,
        duration: "1.5 Hours",
        badge: "Top Rated",
        location: "Solang Ground Launchpad",
        description: "High-altitude tandem flight accompanied by certified pilots",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        is_active: 1
      });
    } else if (type === "food") {
      setFormData({
        destination_id: defaultDest,
        name: "Authentic Himachali Siddu with Ghee",
        type: "Traditional Mountain Delicacy",
        category: "Traditional",
        place: "Old Manali Heritage Kitchen",
        price_num: 250,
        is_veg: true,
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
        is_active: 1
      });
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (type, item) => {
    setModalType(type);
    setModalMode("edit");
    setFormData({
      ...item,
      is_active: item.is_active === 1 || item.is_active === true ? 1 : 0
    });
  };

  // Save Modal Form
  const handleSaveModalForm = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      if (modalType === "destination") {
        if (modalMode === "create") {
          await api.adminCreateDestination(formData);
          showToast(`Destination "${formData.name}" created successfully`);
        } else {
          await api.adminUpdateDestination(formData.id, formData);
          showToast(`Destination "${formData.name}" updated successfully`);
        }
      } else if (modalType === "stay") {
        if (modalMode === "create") {
          await api.adminCreateStay(formData);
          showToast(`Stay "${formData.name}" created successfully`);
        } else {
          await api.adminUpdateStay(formData.id, formData);
          showToast(`Stay "${formData.name}" updated successfully`);
        }
      } else if (modalType === "transport") {
        if (modalMode === "create") {
          await api.adminCreateTransport(formData);
          showToast(`Transport "${formData.mode}" created successfully`);
        } else {
          await api.adminUpdateTransport(formData.id, formData);
          showToast(`Transport "${formData.mode}" updated successfully`);
        }
      } else if (modalType === "rental") {
        if (modalMode === "create") {
          await api.adminCreateRental(formData);
          showToast(`Rental "${formData.option_name}" created successfully`);
        } else {
          await api.adminUpdateRental(formData.id, formData);
          showToast(`Rental "${formData.option_name}" updated successfully`);
        }
      } else if (modalType === "activity") {
        if (modalMode === "create") {
          await api.adminCreateActivity(formData);
          showToast(`Activity "${formData.name}" created successfully`);
        } else {
          await api.adminUpdateActivity(formData.id, formData);
          showToast(`Activity "${formData.name}" updated successfully`);
        }
      } else if (modalType === "food") {
        if (modalMode === "create") {
          await api.adminCreateFood(formData);
          showToast(`Food item "${formData.name}" created successfully`);
        } else {
          await api.adminUpdateFood(formData.id, formData);
          showToast(`Food item "${formData.name}" updated successfully`);
        }
      }

      setModalType(null);
      await loadCurrentTabData();
      await refreshDestinations();
      fetchStatsAndBookings();
    } catch (err) {
      showToast(err.message || "Failed to save changes");
    } finally {
      setFormSaving(false);
    }
  };

  // Nav Tabs Config
  const navTabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "bookings", label: "Bookings", icon: CalendarCheck, count: stats.bookings?.length },
    { id: "destinations", label: "Destinations", icon: MapPin, count: stats.kpis?.totalDestinations },
    { id: "stays", label: "Stays & Hotels", icon: Hotel, count: stats.kpis?.totalStays },
    { id: "transport", label: "Transport", icon: Plane, count: stats.kpis?.totalTransport },
    { id: "rentals", label: "Vehicle Rentals", icon: Car, count: stats.kpis?.totalRentals },
    { id: "activities", label: "Activities & Tours", icon: Compass, count: stats.kpis?.totalActivities },
    { id: "food", label: "Food & Dining", icon: Utensils, count: stats.kpis?.totalFood },
    { id: "users", label: "Users", icon: Users, count: stats.kpis?.totalUsers }
  ];

  // If user is not admin, show Admin Authentication Gate
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#2D5A27]/10 text-[#2D5A27] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#2D5A27]/20">
              <Lock className="w-8 h-8 text-[#2D5A27]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              TravelMate Control Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Administrator sign-in required to manage catalog and bookings
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
                placeholder="admin@travelmate.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 py-3.5 px-4 bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Sign In as Administrator
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => navigate("home")}
              className="hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to TravelMate
            </button>
            <span className="text-[11px] font-mono text-slate-400">admin123</span>
          </div>
        </div>
      </div>
    );
  }

  // Filtered lists based on search & selectors
  const filteredBookings = (stats.bookings || []).filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      b.id?.toLowerCase().includes(q) ||
      b.traveler_name?.toLowerCase().includes(q) ||
      b.traveler_email?.toLowerCase().includes(q) ||
      b.destination_name?.toLowerCase().includes(q);
    const matchStatus =
      selectedStatusFilter === "All" ||
      b.status?.toLowerCase() === selectedStatusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const filteredDestinations = destinationsList.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      d.name?.toLowerCase().includes(q) ||
      d.region?.toLowerCase().includes(q) ||
      d.category?.toLowerCase().includes(q);
    const matchStatus =
      selectedStatusFilter === "All" ||
      (selectedStatusFilter === "Active" ? d.is_active === 1 : d.is_active === 0);
    return matchSearch && matchStatus;
  });

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center font-black text-sm shadow-sm">
              TM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  TravelMate Admin
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2D5A27]/10 text-[#2D5A27] uppercase tracking-wider">
                  Catalog Manager
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Direct live inventory and customer booking management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadCurrentTabData();
                showToast("Data refreshed directly from catalog");
              }}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              title="Refresh live data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => navigate("home")}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#2D5A27] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Customer View
            </button>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("home");
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 9-Tab Horizontal Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 overflow-x-auto scrollbar-none flex items-center gap-1 py-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#2D5A27] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ======================= TAB 1: OVERVIEW ======================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* High-level KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  ₹{(stats.kpis?.totalRevenue || 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Confirmed & Completed trips</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Bookings
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.kpis?.totalTrips || 0}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Customer reservations made</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Destinations
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.kpis?.activeDestinations || 0}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    / {stats.kpis?.totalDestinations || 0}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Active customer destinations</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Stays & Hotels
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Hotel className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.kpis?.totalStays || 0}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Resorts, palaces, cottages</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Transport Options
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Plane className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.kpis?.totalTransport || 0}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Intercity & Local routes</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Vehicle Rentals
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <Car className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.kpis?.totalRentals || 0}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Self-drive & cabs</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Activities & Tours
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.kpis?.totalActivities || 0}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Adventure & Sightseeing</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Food & Dining
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.kpis?.totalFood || 0}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Regional culinary highlights</p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-extrabold text-sm text-slate-900 mb-4">
                Quick Catalog Inventory Actions
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    setActiveTab("destinations");
                    handleOpenCreateModal("destination");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#2D5A27] text-slate-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Destination
                </button>
                <button
                  onClick={() => {
                    setActiveTab("stays");
                    handleOpenCreateModal("stay");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#2D5A27] text-slate-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Stay / Hotel
                </button>
                <button
                  onClick={() => {
                    setActiveTab("transport");
                    handleOpenCreateModal("transport");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#2D5A27] text-slate-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Transport Route
                </button>
                <button
                  onClick={() => {
                    setActiveTab("rentals");
                    handleOpenCreateModal("rental");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#2D5A27] text-slate-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Rental Vehicle
                </button>
                <button
                  onClick={() => {
                    setActiveTab("activities");
                    handleOpenCreateModal("activity");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#2D5A27] text-slate-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Activity / Tour
                </button>
                <button
                  onClick={() => {
                    setActiveTab("food");
                    handleOpenCreateModal("food");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#2D5A27] text-slate-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Dining Delicacy
                </button>
              </div>
            </div>

            {/* Recent Bookings Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Recent Customer Bookings</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Live customer reservations</p>
                </div>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="text-xs font-bold text-[#2D5A27] hover:underline"
                >
                  View all bookings →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Booking ID</th>
                      <th className="px-5 py-3">Traveler</th>
                      <th className="px-5 py-3">Destination</th>
                      <th className="px-5 py-3">Dates</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(stats.bookings || []).slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{b.id}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{b.traveler_name}</p>
                          <p className="text-[11px] text-slate-400">{b.traveler_email}</p>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          {b.destination_name}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{b.travel_date}</td>
                        <td className="px-5 py-3.5 font-black text-slate-900">
                          ₹{Number(b.amount).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === "Confirmed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : b.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : b.status === "Completed"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setNewBookingStatus(b.status);
                            }}
                            className="text-[#2D5A27] hover:bg-[#2D5A27]/10 px-2.5 py-1 rounded-lg font-bold transition-all"
                          >
                            Breakdown
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: BOOKINGS ======================= */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID, traveler, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2D5A27]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-bold">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Booking ID</th>
                      <th className="px-5 py-3">Traveler</th>
                      <th className="px-5 py-3">Destination</th>
                      <th className="px-5 py-3">Dates & Guests</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                          No bookings found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{b.id}</td>
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900">{b.traveler_name}</p>
                            <p className="text-[11px] text-slate-400">{b.traveler_email}</p>
                            {b.traveler_phone && (
                              <p className="text-[10px] text-slate-400">{b.traveler_phone}</p>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-800">
                            {b.destination_name}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-slate-800">{b.travel_date}</p>
                            <p className="text-[11px] text-slate-400">
                              {b.travelers_count} Traveler{b.travelers_count > 1 ? "s" : ""}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 font-black text-slate-900 text-sm">
                            ₹{Number(b.amount).toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer focus:outline-none ${
                                b.status === "Confirmed"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : b.status === "Pending"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : b.status === "Completed"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedBooking(b);
                                setNewBookingStatus(b.status);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#2D5A27] text-slate-700 hover:text-white font-bold transition-all text-xs"
                            >
                              Itemized View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: DESTINATIONS ======================= */}
        {activeTab === "destinations" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenCreateModal("destination")}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Destination
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDestinations.map((d) => {
                const isActive = d.is_active === 1 || d.is_active === true;
                return (
                  <div
                    key={d.id}
                    className={`bg-white rounded-2xl border ${
                      isActive ? "border-slate-200" : "border-slate-300 opacity-70 bg-slate-50/50"
                    } shadow-xs overflow-hidden flex flex-col justify-between group transition-all`}
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <SafeImage
                          src={d.image}
                          alt={d.name}
                          category="destination"
                          contextName={d.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white">
                            {d.category}
                          </span>
                        </div>
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/90 text-slate-900 font-extrabold text-xs shadow-xs">
                          ★ {d.rating}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                            {d.name}
                          </h4>
                          <span className="text-sm font-black text-[#2D5A27] shrink-0">
                            ₹{Number(d.base_price || d.basePrice).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {d.region || d.location}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {d.tagline || d.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                      <button
                        onClick={() => handleToggleStatus("destination", d)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                          isActive
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal("destination", d)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                          title="Edit Destination"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem({ type: "destination", item: d })}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Deactivate / Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 4: STAYS ======================= */}
        {activeTab === "stays" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search stays & hotels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <select
                  value={selectedDestFilter}
                  onChange={(e) => setSelectedDestFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Destinations</option>
                  {destinationsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenCreateModal("stay")}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Stay
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staysList.map((s) => {
                const isActive = s.is_active === 1 || s.is_active === true;
                return (
                  <div
                    key={s.id}
                    className={`bg-white rounded-2xl border ${
                      isActive ? "border-slate-200" : "border-slate-300 opacity-70 bg-slate-50/50"
                    } shadow-xs overflow-hidden flex flex-col justify-between group transition-all`}
                  >
                    <div>
                      <div className="relative h-40 overflow-hidden bg-slate-100">
                        <SafeImage
                          src={s.image}
                          alt={s.name}
                          category="stay"
                          contextName={s.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 text-amber-500 font-extrabold text-xs">
                          ★ {s.rating}
                        </span>
                      </div>

                      <div className="p-4 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                            {s.name}
                          </h4>
                          <span className="text-xs font-black text-[#2D5A27] shrink-0">
                            {s.price}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {s.type} • {s.destination_name || s.destination_id}
                        </p>
                        {s.amenities && (
                          <p className="text-xs text-slate-400 line-clamp-1">{s.amenities}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleStatus("stay", s)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl border transition-all ${
                          isActive
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal("stay", s)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem({ type: "stay", item: s })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 5: TRANSPORT ======================= */}
        {activeTab === "transport" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search transit modes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <select
                  value={selectedDestFilter}
                  onChange={(e) => setSelectedDestFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Destinations</option>
                  {destinationsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenCreateModal("transport")}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Transport
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Mode & Detail</th>
                      <th className="px-5 py-3">Destination</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Duration</th>
                      <th className="px-5 py-3">Estimated Fare</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transportList.map((t) => {
                      const isActive = t.is_active === 1 || t.is_active === true;
                      return (
                        <tr
                          key={t.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            !isActive ? "opacity-60 bg-slate-50/40" : ""
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-extrabold text-slate-900">{t.mode}</p>
                            <p className="text-[11px] text-slate-500">{t.detail}</p>
                            {t.provider && (
                              <p className="text-[10px] text-slate-400">Operator: {t.provider}</p>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-700">
                            {t.destination_name || t.destination_id}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                              {t.type || "Intercity"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{t.est_time || "—"}</td>
                          <td className="px-5 py-3.5 font-black text-slate-900">
                            {t.est_cost || `₹${t.price_num}`}
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleToggleStatus("transport", t)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border-slate-300"
                              }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal("transport", t)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmItem({ type: "transport", item: t })}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 6: RENTALS ======================= */}
        {activeTab === "rentals" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search rental vehicles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <select
                  value={selectedDestFilter}
                  onChange={(e) => setSelectedDestFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Destinations</option>
                  {destinationsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenCreateModal("rental")}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Rental Vehicle
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rentalsList.map((r) => {
                const isActive = r.is_active === 1 || r.is_active === true;
                return (
                  <div
                    key={r.id}
                    className={`bg-white rounded-2xl border ${
                      isActive ? "border-slate-200" : "border-slate-300 opacity-70 bg-slate-50/50"
                    } shadow-xs overflow-hidden flex flex-col justify-between group transition-all`}
                  >
                    <div>
                      <div className="relative h-40 overflow-hidden bg-slate-100">
                        <SafeImage
                          src={r.image}
                          alt={r.option_name}
                          category="rental"
                          contextName={r.option_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white font-bold text-xs">
                          {r.type}
                        </span>
                      </div>

                      <div className="p-4 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                            {r.option_name}
                          </h4>
                          <span className="text-xs font-black text-[#2D5A27] shrink-0">
                            {r.cost}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {r.destination_name || r.destination_id}{" "}
                          {r.provider ? `• ${r.provider}` : ""}
                        </p>
                        {r.note && <p className="text-xs text-slate-400 line-clamp-1">{r.note}</p>}
                      </div>
                    </div>

                    <div className="p-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleStatus("rental", r)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl border transition-all ${
                          isActive
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal("rental", r)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem({ type: "rental", item: r })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 7: ACTIVITIES ======================= */}
        {activeTab === "activities" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search activities & tours..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <select
                  value={selectedDestFilter}
                  onChange={(e) => setSelectedDestFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Destinations</option>
                  {destinationsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenCreateModal("activity")}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Activity
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activitiesList.map((a) => {
                const isActive = a.is_active === 1 || a.is_active === true;
                return (
                  <div
                    key={a.id}
                    className={`bg-white rounded-2xl border ${
                      isActive ? "border-slate-200" : "border-slate-300 opacity-70 bg-slate-50/50"
                    } shadow-xs overflow-hidden flex flex-col justify-between group transition-all`}
                  >
                    <div>
                      <div className="relative h-40 overflow-hidden bg-slate-100">
                        <SafeImage
                          src={a.image}
                          alt={a.name}
                          category="activity"
                          contextName={a.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                        {a.badge && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px]">
                            {a.badge}
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                            {a.name}
                          </h4>
                          <span className="text-xs font-black text-[#2D5A27] shrink-0">
                            {a.price}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {a.category} • {a.destination_name || a.destination_id}
                        </p>
                        {a.duration && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {a.duration}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleStatus("activity", a)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl border transition-all ${
                          isActive
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal("activity", a)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem({ type: "activity", item: a })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 8: FOOD & DINING ======================= */}
        {activeTab === "food" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search delicacies & cafes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <select
                  value={selectedDestFilter}
                  onChange={(e) => setSelectedDestFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Destinations</option>
                  {destinationsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenCreateModal("food")}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Dining Item
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {foodList.map((f) => {
                const isActive = f.is_active === 1 || f.is_active === true;
                return (
                  <div
                    key={f.id}
                    className={`bg-white rounded-2xl border ${
                      isActive ? "border-slate-200" : "border-slate-300 opacity-70 bg-slate-50/50"
                    } shadow-xs overflow-hidden flex flex-col justify-between group transition-all`}
                  >
                    <div>
                      <div className="relative h-36 overflow-hidden bg-slate-100">
                        <SafeImage
                          src={f.image}
                          alt={f.name}
                          category="food"
                          contextName={f.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                        <span
                          className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            f.isVeg
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {f.isVeg ? "Veg" : "Non-Veg"}
                        </span>
                      </div>

                      <div className="p-3.5 space-y-1">
                        <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                          {f.name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {f.destination_name || f.destination_id}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-1">{f.type}</p>
                        {f.place && (
                          <p className="text-[11px] text-[#2D5A27] font-medium line-clamp-1">
                            📍 {f.place}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleStatus("food", f)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                          isActive
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal("food", f)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem({ type: "food", item: f })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 9: USERS ======================= */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2D5A27]"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Total Registered Users: {usersList.length}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Email Address</th>
                      <th className="px-5 py-3">Travel Persona</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <SafeImage
                            src={u.avatar}
                            alt={u.name}
                            category="user"
                            contextName={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-extrabold text-slate-900">{u.name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {u.persona || "Explorer"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-800 border border-purple-200 font-extrabold"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================= MODAL: ITEMIZED BOOKING DETAILS ======================= */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black px-2.5 py-1 bg-slate-100 rounded-lg text-slate-900">
                  {selectedBooking.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    selectedBooking.status === "Confirmed"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedBooking.status === "Pending"
                      ? "bg-amber-100 text-amber-800"
                      : selectedBooking.status === "Completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {selectedBooking.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-6">
              {/* Traveler & Destination Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                    Traveler Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedBooking.traveler_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                    Email Contact
                  </span>
                  <span className="font-medium text-slate-700">{selectedBooking.traveler_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                    Phone
                  </span>
                  <span className="font-medium text-slate-700">
                    {selectedBooking.traveler_phone || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                    Destination
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedBooking.destination_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                    Travel Dates
                  </span>
                  <span className="font-medium text-slate-700">{selectedBooking.travel_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                    Guests
                  </span>
                  <span className="font-medium text-slate-700">
                    {selectedBooking.travelers_count} Traveler(s)
                  </span>
                </div>
              </div>

              {/* Itemized Selection Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Itemized Trip Package Details
                </h4>

                {/* Stay */}
                {selectedBooking.booking_details?.stay && selectedBooking.booking_details.stay.name !== "Not selected" && (selectedBooking.booking_details.stay.totalCost > 0 || selectedBooking.booking_details.stay.pricePerNight > 0) ? (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Hotel className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">
                          {selectedBooking.booking_details.stay.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {selectedBooking.booking_details.stay.roomType || selectedBooking.booking_details.stay.type || "Hotel"} •{" "}
                          {selectedBooking.booking_details.stay.nights} Nights @ ₹
                          {selectedBooking.booking_details.stay.pricePerNight?.toLocaleString()}
                          /night
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₹
                      {(
                        selectedBooking.booking_details.stay.totalCost ||
                        selectedBooking.booking_details.stay.nights *
                          selectedBooking.booking_details.stay.pricePerNight
                      )?.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Hotel className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Stay: Not selected</span>
                    </div>
                    <span className="font-bold text-slate-400">₹0</span>
                  </div>
                )}

                {/* Transport */}
                {selectedBooking.booking_details?.transport && selectedBooking.booking_details.transport.mode !== "Not selected" && selectedBooking.booking_details.transport.totalCost > 0 ? (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Plane className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">
                          {selectedBooking.booking_details.transport.mode}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {selectedBooking.booking_details.transport.provider || selectedBooking.booking_details.transport.detail} •{" "}
                          {selectedBooking.booking_details.transport.travelers ||
                            selectedBooking.travelers_count}{" "}
                          person(s)
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₹
                      {(
                        selectedBooking.booking_details.transport.totalCost ||
                        selectedBooking.booking_details.transport.unitPrice *
                          (selectedBooking.booking_details.transport.travelers ||
                            selectedBooking.travelers_count)
                      )?.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Transport: Not selected</span>
                    </div>
                    <span className="font-bold text-slate-400">₹0</span>
                  </div>
                )}

                {/* Rental */}
                {selectedBooking.booking_details?.rental && selectedBooking.booking_details.rental.vehicle !== "Not selected" && selectedBooking.booking_details.rental.option !== "Not selected" && selectedBooking.booking_details.rental.totalCost > 0 ? (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Car className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">
                          {selectedBooking.booking_details.rental.vehicle || selectedBooking.booking_details.rental.option}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {selectedBooking.booking_details.rental.type} •{" "}
                          {selectedBooking.booking_details.rental.days} Days @ ₹
                          {selectedBooking.booking_details.rental.dailyRate?.toLocaleString()}/day
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₹
                      {(
                        selectedBooking.booking_details.rental.totalCost ||
                        selectedBooking.booking_details.rental.days *
                          selectedBooking.booking_details.rental.dailyRate
                      )?.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Rental: Not selected</span>
                    </div>
                    <span className="font-bold text-slate-400">₹0</span>
                  </div>
                )}

                {/* Activities */}
                {Array.isArray(selectedBooking.booking_details?.activities) &&
                  selectedBooking.booking_details.activities.length > 0 ? (
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <Compass className="w-4 h-4 text-orange-600" />
                        <span>Booked Activities & Tours:</span>
                      </div>
                      <div className="divide-y divide-slate-100 pl-6 space-y-1.5">
                        {selectedBooking.booking_details.activities.map((act, idx) => (
                          <div
                            key={idx}
                            className="pt-1.5 flex items-center justify-between text-slate-600"
                          >
                            <span>
                              {act.name} ({act.quantity || selectedBooking.travelers_count}x)
                            </span>
                            <span className="font-bold text-slate-900">
                              ₹{(act.totalPrice || act.unitPrice * (act.quantity || 1))?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Activities: None selected</span>
                      </div>
                      <span className="font-bold text-slate-400">₹0</span>
                    </div>
                  )}

                {/* Food & Dining */}
                {selectedBooking.booking_details?.food && selectedBooking.booking_details.food.plan !== "Not selected" && (Number(selectedBooking.booking_details.food.budget || selectedBooking.booking_details.food.totalCost || 0) > 0) ? (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">
                          Food & Dining ({selectedBooking.booking_details.food.plan || (selectedBooking.booking_details.food.tier ? selectedBooking.booking_details.food.tier.toUpperCase() : "Allowance")})
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {selectedBooking.booking_details.food.description || `₹${Number(selectedBooking.booking_details.food.budget || selectedBooking.booking_details.food.totalCost || 0).toLocaleString()} allowance`}
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ₹{Number(selectedBooking.booking_details.food.budget || selectedBooking.booking_details.food.totalCost || 0).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Food & Dining: Not selected</span>
                    </div>
                    <span className="font-bold text-slate-400">₹0</span>
                  </div>
                )}

                {/* Grand Total Summary */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between mt-4">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
                      Grand Total Amount
                    </span>
                    <span className="text-xs text-slate-300 font-medium">All taxes & fees included</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-400">
                    ₹{Number(selectedBooking.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Updater */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-700 block">
                    Update Booking Status:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Synchronizes live with customer profile
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={newBookingStatus}
                    onChange={(e) => setNewBookingStatus(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => handleUpdateBookingStatus(selectedBooking.id, newBookingStatus)}
                    disabled={bookingStatusUpdating || newBookingStatus === selectedBooking.status}
                    className="px-4 py-2 bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {bookingStatusUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Save Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CREATE / EDIT ENTITY ======================= */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {modalMode === "create" ? "Add New" : "Edit"}{" "}
                {modalType === "destination"
                  ? "Destination"
                  : modalType === "stay"
                  ? "Stay / Hotel"
                  : modalType === "transport"
                  ? "Transport Route"
                  : modalType === "rental"
                  ? "Rental Vehicle"
                  : modalType === "activity"
                  ? "Activity / Tour"
                  : "Food / Dining Delicacy"}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalForm} className="py-4 space-y-4 text-xs">
              {/* Destination Selector for Sub-Items */}
              {modalType !== "destination" && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Destination Location
                  </label>
                  <select
                    required
                    value={formData.destination_id || ""}
                    onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2D5A27]"
                  >
                    {destinationsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.region || d.country})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Destination Specific Fields */}
              {modalType === "destination" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Destination Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Manali, Bali, Udaipur"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Region / State
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Himachal Pradesh, India"
                        value={formData.region || ""}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category || "Mountains"}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="Mountains">Mountains</option>
                        <option value="Beaches">Beaches</option>
                        <option value="Heritage">Heritage</option>
                        <option value="Lakes">Lakes</option>
                        <option value="Desert">Desert</option>
                        <option value="Islands">Islands</option>
                        <option value="Wellness">Wellness</option>
                        <option value="International">International</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Base Package Price (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.base_price || 8500}
                        onChange={(e) =>
                          setFormData({ ...formData, base_price: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Recommended Duration
                      </label>
                      <input
                        type="text"
                        value={formData.duration || "3 Days / 2 Nights"}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Short Tagline / Overview
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Valley of Gods, snow peaks and pine forest trails"
                      value={formData.tagline || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tagline: e.target.value,
                          description: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Main Image URL
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.image || ""}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Snow Peaks, Adventure, Cafes"
                      value={formData.tags || ""}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              {/* Stay Specific Fields */}
              {modalType === "stay" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Stay / Hotel Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Snow Valley Alpine Resort"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Stay Type
                      </label>
                      <select
                        value={formData.type || "Luxury Resort"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="Luxury Resort">Luxury Resort</option>
                        <option value="5-Star Hotel">5-Star Hotel</option>
                        <option value="Boutique Stay">Boutique Stay</option>
                        <option value="Heritage Palace">Heritage Palace</option>
                        <option value="Riverside Cottage">Riverside Cottage</option>
                        <option value="Campsite">Campsite</option>
                        <option value="Homestay">Homestay</option>
                        <option value="Hostel">Hostel</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Price Per Night (₹ or label)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹3,500 / night"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Rating (1.0 - 5.0)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating || 4.8}
                        onChange={(e) =>
                          setFormData({ ...formData, rating: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Amenities
                    </label>
                    <input
                      type="text"
                      placeholder="Wi-Fi, Mountain View, Heated Pool, Breakfast"
                      value={formData.amenities || ""}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image || ""}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              {/* Transport Specific Fields */}
              {modalType === "transport" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Transport Mode
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Volvo AC Bus, Vande Bharat Express"
                        value={formData.mode || ""}
                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Transport Type
                      </label>
                      <select
                        value={formData.type || "Intercity"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="Intercity">Intercity</option>
                        <option value="Local">Local Transit</option>
                        <option value="Airport Transfer">Airport Transfer</option>
                        <option value="Private Cab">Private Cab</option>
                        <option value="Train">Train</option>
                        <option value="Flight">Flight</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Ticket Fare / Cost (₹)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹1,400"
                        value={formData.est_cost || ""}
                        onChange={(e) => setFormData({ ...formData, est_cost: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Journey Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Overnight (12 hrs)"
                        value={formData.est_time || ""}
                        onChange={(e) => setFormData({ ...formData, est_time: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Operator / Service Provider
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Himalayan Volvo Lines, Indian Railways"
                      value={formData.provider || ""}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Route / Operational Details
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daily evening departure with reclining sleeper berths"
                      value={formData.detail || ""}
                      onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              {/* Rental Specific Fields */}
              {modalType === "rental" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Vehicle Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal Enfield Classic 350, Thar 4x4"
                        value={formData.option_name || ""}
                        onChange={(e) => setFormData({ ...formData, option_name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Vehicle Type
                      </label>
                      <select
                        value={formData.type || "Cab"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="Motorbike">Motorbike</option>
                        <option value="Scooter">Scooter</option>
                        <option value="SUV">SUV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Cab">Cab</option>
                        <option value="Luxury">Luxury</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Daily Rate (₹/day)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹1,200 / day"
                        value={formData.cost || ""}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Rental Provider / Partner
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Himalayan Wheels Rentals"
                        value={formData.provider || ""}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Specifications & Inclusions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2 Helmets included, Unlimited Kilometers, Clean Fuel"
                      value={formData.note || ""}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Vehicle Photo URL
                    </label>
                    <input
                      type="url"
                      value={formData.image || ""}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              {/* Activity Specific Fields */}
              {modalType === "activity" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Activity Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Solang Valley Tandem Paragliding"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category || "Adventure"}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="Adventure">Adventure</option>
                        <option value="Heritage/Culture">Heritage & Culture</option>
                        <option value="Water Sports">Water Sports</option>
                        <option value="Nature/Trek">Nature & Trekking</option>
                        <option value="Sightseeing">Sightseeing</option>
                        <option value="Food Tour">Food Tour</option>
                        <option value="Wellness">Wellness</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Ticket Price (₹)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹1,500"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2 Hours"
                        value={formData.duration || ""}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Badge Highlight
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Top Rated, Best Seller"
                        value={formData.badge || ""}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Location / Meeting Point
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Solang Valley Base Camp Station"
                      value={formData.location || ""}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tandem flight with certified pilot"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image || ""}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              {/* Food Specific Fields */}
              {modalType === "food" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Dish / Specialty Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Authentic Siddu with Ghee"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Meal Category
                      </label>
                      <select
                        value={formData.category || "Traditional"}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="Traditional">Traditional Delicacy</option>
                        <option value="Cafe">Famous Cafe</option>
                        <option value="Street Food">Street Food</option>
                        <option value="Fine Dining">Fine Dining</option>
                        <option value="Dessert">Dessert & Sweets</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Recommended Place / Cafe
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Old Manali Cafe 1947"
                        value={formData.place || ""}
                        onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Approx Serving Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 250"
                        value={formData.price_num || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, price_num: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Dish Description / Flavor Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Steamed wheat bun stuffed with poppy seeds & walnuts"
                      value={formData.type || ""}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.is_veg === true || formData.is_veg === 1}
                        onChange={(e) => setFormData({ ...formData, is_veg: e.target.checked })}
                        className="w-4 h-4 rounded text-[#2D5A27] focus:ring-0"
                      />
                      <span>Vegetarian Item</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image || ""}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </>
              )}

              {/* Active Toggle on Form */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Catalog Visibility Status</span>
                  <span className="text-[11px] text-slate-400">
                    Active items are immediately shown to customers
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                  <input
                    type="checkbox"
                    checked={formData.is_active === 1 || formData.is_active === true}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })
                    }
                    className="w-4 h-4 rounded text-[#2D5A27] focus:ring-0"
                  />
                  <span>Active</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2.5 bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {formSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {modalMode === "create" ? "Add to Catalog" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CONFIRM DEACTIVATE ======================= */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900">Deactivate from Catalog?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              This item will be removed from customer view and trip planning. Existing customer
              booking records will remain completely safe and untouched.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
