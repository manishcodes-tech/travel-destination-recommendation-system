import React, { useState } from "react";
import { useTravel } from "../context/TravelContext";
import SafeImage from "./SafeImage";
import {
  Compass,
  Search,
  Bell,
  User,
  Menu,
  X,
  Sparkles,
  Calculator,
  LayoutDashboard,
  MapPin,
  Calendar,
  Hotel,
  Car,
  Plane,
  Heart,
  LogIn,
  LogOut,
  ChevronDown
} from "lucide-react";

export default function Navbar() {
  const {
    currentRoute,
    navigate,
    unreadCount,
    setIsSearchModalOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    setIsProfileOpen,
    openProfileModal,
    savedWishlist,
    currentUser,
    openAuthModal,
    setIsAuthModalOpen,
    setAuthMode,
    logout
  } = useTravel();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Main primary desktop navigation links
  const mainNavLinks = [
    { label: "Home", route: "home" },
    { label: "Destinations", route: "destinations" },
    { label: "Plan Trip", route: "plan-trip" },
    { label: "Stays", route: "stays" }
  ];

  // Secondary links grouped neatly under "More ▾"
  const moreNavLinks = [
    { label: "Transport", route: "transport", icon: Plane },
    { label: "Activities", route: "activities", icon: Compass },
    { label: "Rentals", route: "rentals", icon: Car },
    { label: "Budget Planner", route: "budget-planner", icon: Calculator }
  ];

  const isMoreActive = moreNavLinks.some((item) => item.route === currentRoute);

  const handleNavClick = (route) => {
    navigate(route);
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
  };

  const openAuth = (mode = "login") => {
    openAuthModal(mode, "Please sign in to continue");
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2">
          
          {/* Left: Brand Logo */}
          <div
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300 text-[#4ADE80]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#1E3C1B]">
                  Travel<span className="text-[#2D5A27]">Mate</span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]"></span>
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                Explore Your Way
              </span>
            </div>
          </div>

          {/* Center: Desktop Nav Links (Spacious & Clean with More ▾) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {mainNavLinks.map((item) => {
              const isActive =
                currentRoute === item.route ||
                (item.route === "destinations" && currentRoute === "destination-detail") ||
                (item.route === "plan-trip" && currentRoute === "recommendations");

              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`relative px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "text-[#2D5A27] bg-[#E8F3E6] font-bold"
                      : "text-slate-600 hover:text-[#2D5A27] hover:bg-slate-100/70"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#2D5A27] rounded-full"></span>
                  )}
                </button>
              );
            })}

            {/* More ▾ Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                onBlur={() => setTimeout(() => setIsMoreOpen(false), 200)}
                className={`relative flex items-center gap-1 px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  isMoreActive
                    ? "text-[#2D5A27] bg-[#E8F3E6] font-bold"
                    : "text-slate-600 hover:text-[#2D5A27] hover:bg-slate-100/70"
                }`}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMoreOpen ? "rotate-180 text-[#2D5A27]" : "text-slate-400"
                  }`}
                />
                {isMoreActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#2D5A27] rounded-full"></span>
                )}
              </button>

              {isMoreOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  {moreNavLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.route;
                    return (
                      <button
                        key={item.route}
                        onMouseDown={() => {
                          handleNavClick(item.route);
                          setIsMoreOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                          isActive
                            ? "bg-[#E8F3E6] text-[#2D5A27] font-bold"
                            : "text-slate-700 hover:bg-[#F4F8F3] hover:text-[#2D5A27]"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? "bg-[#2D5A27] text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right: Search, Notifications, Saved, Auth/Profile (Guaranteed shrink-0 to prevent clipping) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Search destinations"
              className="p-2 text-slate-600 hover:text-[#2D5A27] hover:bg-slate-100 rounded-full transition-colors relative shrink-0"
              title="Search destinations (Ctrl+K)"
            >
              <Search className="w-5 h-5 text-slate-600" />
            </button>

            {/* Notification Bell */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                aria-label="View notifications"
                className="p-2 text-slate-600 hover:text-[#2D5A27] hover:bg-slate-100 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Saved Wishlist Pill */}
            <button
              onClick={() => {
                if (!currentUser) {
                  openAuth("login");
                } else {
                  openProfileModal("saved");
                }
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Saved ({savedWishlist.length})</span>
            </button>

            {/* Authentication Buttons OR User Profile Menu */}
            {currentUser ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:ring-2 hover:ring-[#2D5A27]/20 transition-all border border-slate-200/80 bg-slate-50/50 shrink-0 cursor-pointer"
                >
                  <SafeImage
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    category="avatar"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-[#2D5A27]"
                  />
                  <span className="text-xs font-bold text-slate-800 hidden sm:block max-w-[140px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <span className="font-bold text-sm text-slate-900 block truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-xs text-slate-400 block truncate">
                        {currentUser.email}
                      </span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#E8F3E6] text-[#2D5A27]">
                        {currentUser.role === "admin" ? "Administrator" : "Customer"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        openProfileModal("profile");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F4F8F3] hover:text-[#2D5A27] flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-500" /> Profile
                    </button>

                    <button
                      onClick={() => {
                        openProfileModal("trips");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F4F8F3] hover:text-[#2D5A27] flex items-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-slate-500" /> My Trips
                    </button>

                    <button
                      onClick={() => {
                        openProfileModal("saved");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F4F8F3] hover:text-[#2D5A27] flex items-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Wishlist ({savedWishlist.length})
                    </button>

                    {currentUser?.role === "admin" && (
                      <>
                        <div className="border-t border-slate-100 my-1"></div>
                        <button
                          onClick={() => {
                            navigate("admin");
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-[#2D5A27] bg-[#E8F3E6]/60 hover:bg-[#E8F3E6] flex items-center gap-2 cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#2D5A27]" /> Admin Dashboard
                        </button>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openAuth("login")}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#2D5A27] hover:bg-slate-100 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white text-xs font-bold transition-colors shadow-xs whitespace-nowrap shrink-0"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-[#2D5A27] hover:bg-slate-100 rounded-lg shrink-0"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {mainNavLinks.map((item) => {
            const isActive =
              currentRoute === item.route ||
              (item.route === "destinations" && currentRoute === "destination-detail") ||
              (item.route === "plan-trip" && currentRoute === "recommendations");

            return (
              <button
                key={item.route}
                onClick={() => handleNavClick(item.route)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#E8F3E6] text-[#2D5A27] font-bold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            More Services
          </div>

          {moreNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleNavClick(item.route)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#E8F3E6] text-[#2D5A27] font-bold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4 text-[#2D5A27]" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {currentUser ? (
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/60">
                  <SafeImage
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    category="avatar"
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[#2D5A27]"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">{currentUser.name}</span>
                    <span className="text-xs text-slate-500">{currentUser.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      openProfileModal("profile");
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-1.5 px-2 text-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      openProfileModal("trips");
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-1.5 px-2 text-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    My Trips
                  </button>
                  <button
                    onClick={() => {
                      openProfileModal("saved");
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-1.5 px-2 text-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Saved
                  </button>
                </div>

                {currentUser?.role === "admin" && (
                  <button
                    onClick={() => {
                      navigate("admin");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 bg-[#E8F3E6] text-[#2D5A27] rounded-xl text-xs font-extrabold hover:bg-emerald-100 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Admin Dashboard
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="py-2.5 text-center rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="py-2.5 text-center rounded-xl bg-[#2D5A27] text-white text-xs font-bold hover:bg-[#1E3C1B]"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
