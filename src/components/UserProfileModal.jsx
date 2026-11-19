import React from "react";
import { useTravel } from "../context/TravelContext";
import { X, Heart, MapPin, Calendar, Award, LogOut, ArrowRight, Trash2, User, LogIn } from "lucide-react";
import SafeImage from "./SafeImage";

export default function UserProfileModal() {
  const {
    isProfileOpen,
    setIsProfileOpen,
    profileTab,
    setProfileTab,
    savedWishlist,
    toggleBookmark,
    navigate,
    currentUser,
    setIsAuthModalOpen,
    setAuthMode,
    logout,
    userBookings,
    destinations
  } = useTravel();

  if (!isProfileOpen) return null;

  const bookmarkedDestinations = (destinations || []).filter((d) => savedWishlist.includes(d.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-[#2D5A27] to-[#1E3C1B] p-6 text-white">
          <button
            onClick={() => setIsProfileOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#4ADE80] overflow-hidden shadow-lg bg-white/20">
                <SafeImage
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  category="user"
                  contextName={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold">{currentUser.name}</h3>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#4ADE80] text-[#152912]">
                    {currentUser.role === "admin" ? "Administrator" : "Customer"}
                  </span>
                </div>
                <p className="text-xs text-emerald-100">{currentUser.email}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-emerald-200">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#4ADE80]" /> 1,450 Travel Miles
                  </span>
                  <span>•</span>
                  <span>Verified Customer</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2 space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                <User className="w-6 h-6 text-[#4ADE80]" />
              </div>
              <h3 className="text-xl font-extrabold">Welcome to TravelMate</h3>
              <p className="text-xs text-emerald-100 max-w-sm mx-auto">
                Please sign in to view your profile, saved wishlist, and booked trips.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setAuthMode("login");
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#4ADE80] text-[#152912] font-bold text-xs hover:bg-[#86EFAC] cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setAuthMode("register");
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/20 text-white font-bold text-xs hover:bg-white/30 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selector Bar */}
        {currentUser && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-6">
            <button
              onClick={() => setProfileTab("profile")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                profileTab === "profile"
                  ? "border-[#2D5A27] text-[#2D5A27]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5" /> Account Details
            </button>
            <button
              onClick={() => setProfileTab("saved")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                profileTab === "saved"
                  ? "border-[#2D5A27] text-[#2D5A27]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Wishlist ({bookmarkedDestinations.length})
            </button>
            <button
              onClick={() => setProfileTab("trips")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                profileTab === "trips"
                  ? "border-[#2D5A27] text-[#2D5A27]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" /> My Trips ({userBookings.length})
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Profile Details Tab Content */}
          {profileTab === "profile" && currentUser && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#2D5A27]" /> Account Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Full Name</span>
                  <span className="text-sm font-bold text-slate-900">{currentUser.name}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Email Address</span>
                  <span className="text-sm font-bold text-slate-900">{currentUser.email}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Role</span>
                  <span className="text-sm font-bold text-emerald-800 capitalize">{currentUser.role === "admin" ? "Administrator" : "Customer"}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Travel Persona</span>
                  <span className="text-sm font-bold text-slate-900">{currentUser.persona || "Explorer"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Saved Destinations Section */}
          {(profileTab === "saved" || !currentUser) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  Saved Wishlist ({bookmarkedDestinations.length})
                </h4>
                {bookmarkedDestinations.length > 0 && (
                  <span className="text-xs text-slate-500">Saved to account</span>
                )}
              </div>

              {bookmarkedDestinations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bookmarkedDestinations.map((dest) => (
                    <div
                      key={dest.id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200 hover:border-[#2D5A27] bg-slate-50/50 hover:bg-[#F4F8F3] transition-all group"
                    >
                      <SafeImage
                        src={dest.image}
                        alt={dest.name}
                        category="destination"
                        contextName={dest.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-sm text-slate-800 group-hover:text-[#2D5A27] truncate">
                          {dest.name}
                        </h5>
                        <p className="text-xs text-slate-500 truncate">{dest.region}</p>
                        <p className="text-xs font-semibold text-[#2D5A27]">
                          ₹{dest.basePrice.toLocaleString()}/person
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate("destination-detail", { id: dest.id });
                          }}
                          className="p-1.5 rounded-lg bg-white shadow-xs hover:bg-[#2D5A27] hover:text-white text-slate-600 transition-colors cursor-pointer"
                          title="View Itinerary"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleBookmark(dest.id)}
                          className="p-1.5 rounded-lg bg-white shadow-xs hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">No destinations saved yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click the heart icon on any card to save it directly to your wishlist.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* User Bookings */}
          {(profileTab === "trips" || !currentUser) && (
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#2D5A27]" /> My Booked Trips ({userBookings.length})
              </h4>
              {userBookings.length > 0 ? (
                <div className="space-y-2.5">
                  {userBookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-[#2D5A27] transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{b.destination_name}</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              b.status === "Confirmed"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {b.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Booking #{b.id} • {b.travel_date} • {b.travelers_count || 1} guest(s)
                        </p>
                      </div>
                      <span className="font-black text-sm text-[#2D5A27]">
                        ₹{Number(b.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 text-center text-xs text-slate-500 border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">No active bookings yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Plan your next trip and confirm a reservation to see your itinerary here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {currentUser?.role === "admin" && (
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate("admin");
                }}
                className="text-xs font-bold text-[#2D5A27] hover:underline cursor-pointer"
              >
                Go to Admin Dashboard →
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={() => {
                  logout();
                  setIsProfileOpen(false);
                }}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={() => setIsProfileOpen(false)}
              className="px-4 py-2 bg-[#2D5A27] text-white text-xs font-bold rounded-xl hover:bg-[#1E3C1B] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
