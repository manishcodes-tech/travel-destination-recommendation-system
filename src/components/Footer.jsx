import React, { useState } from "react";
import { useTravel } from "../context/TravelContext";
import { Compass, Mail, Heart, Shield, PhoneCall, Check, ArrowRight } from "lucide-react";

export default function Footer() {
  const { navigate, currentUser } = useTravel();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#1E3C1B] text-slate-200 pt-16 pb-12 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/60">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigate("home")}
              className="flex items-center gap-2.5 cursor-pointer inline-flex"
            >
              <div className="w-10 h-10 rounded-xl bg-[#4ADE80] text-[#152912] flex items-center justify-center font-bold shadow-md">
                <Compass className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Travel<span className="text-[#4ADE80]">Mate</span>
              </span>
            </div>
            <p className="text-sm text-emerald-100/70 max-w-sm leading-relaxed">
              Explore the world your way. Plan smarter, travel better, and create memories that last a lifetime with our handcrafted itineraries and personalized recommendations.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200/80 bg-emerald-900/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
                <Shield className="w-3.5 h-3.5 text-[#4ADE80]" /> 100% Verified Reviews
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-200/80 bg-emerald-900/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
                <PhoneCall className="w-3.5 h-3.5 text-[#4ADE80]" /> 24/7 Trip Support
              </div>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/70">
              <li>
                <button
                  onClick={() => navigate("home")}
                  className="hover:text-[#4ADE80] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("destinations")}
                  className="hover:text-[#4ADE80] transition-colors"
                >
                  All Destinations
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("plan-trip")}
                  className="hover:text-[#4ADE80] transition-colors"
                >
                  Plan Your Trip
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("recommendations")}
                  className="hover:text-[#4ADE80] transition-colors"
                >
                  Recommendations
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("budget-planner")}
                  className="hover:text-[#4ADE80] transition-colors"
                >
                  Trip Budget Planner
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-100/70">
              <li>
                <button
                  onClick={() => navigate("stays")}
                  className="hover:text-[#4ADE80] transition-colors"
                >
                  Handpicked Stays
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("activities")}
                  className="hover:text-[#4ADE80] transition-colors"
                >
                  Adventures & Activities
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("transport")}
                  className="hover:text-[#4ADE80] transition-colors"
                >
                  Transport & Flights
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("rentals")}
                  className="hover:text-[#4ADE80] transition-colors"
                >
                  Bike & Car Rentals
                </button>
              </li>
              {currentUser?.role === "admin" && (
                <li>
                  <button
                    onClick={() => navigate("admin")}
                    className="hover:text-[#4ADE80] transition-colors"
                  >
                    Admin Analytics Portal
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 5: Newsletter */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Insider Deals
            </h4>
            <p className="text-xs text-emerald-100/70 mb-3 leading-relaxed">
              Get weekly secret flight fare drops and seasonal holiday guides delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-emerald-950/80 border border-emerald-800 text-white placeholder-emerald-300/40 focus:outline-none focus:ring-1 focus:ring-[#4ADE80]"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-[#4ADE80] text-[#152912] hover:bg-[#86EFAC] transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <div className="text-[11px] text-[#4ADE80] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> You're on the VIP travel list!
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-100/50">
          <p>© {new Date().getFullYear()} TravelMate Inc. Built with care for explorers worldwide.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#4ADE80] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#4ADE80] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#4ADE80] cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
