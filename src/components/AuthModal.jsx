import React, { useState } from "react";
import { useTravel } from "../context/TravelContext";
import SafeImage from "./SafeImage";
import {
  X,
  Lock,
  Mail,
  User,
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight
} from "lucide-react";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    authPromptMessage,
    prefilledEmail,
    login,
    register,
    navigate
  } = useTravel();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("Explorer");
  const [avatar, setAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  if (!isAuthModalOpen) return null;

  const avatars = [
    { label: "Explorer", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
    { label: "Nomad", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
    { label: "Wanderer", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" },
    { label: "Hiker", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" }
  ];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const res = await login(email, password);
      setIsAuthModalOpen(false);
      if (res?.user?.role === "admin") {
        navigate("admin");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const res = await register(name, email, password, persona, avatar);
      const registeredEmail = email;
      setSuccessMessage(res?.message || "Account created successfully. Please login.");
      setAuthMode("login");
      setEmail(registeredEmail);
      setPassword("");
    } catch (err) {
      setError(err.message || "Registration failed. Please try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient banner */}
        <div className="bg-gradient-to-br from-[#1E3C1B] to-[#2D5A27] p-6 text-white relative">
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setError("");
              setSuccessMessage("");
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#4ADE80] text-[#152912] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">TravelMate</span>
          </div>

          {authPromptMessage && (
            <div className="mb-3 px-3 py-1.5 rounded-xl bg-black/30 border border-white/20 text-[#4ADE80] text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{authPromptMessage}</span>
            </div>
          )}

          <h3 className="text-2xl font-black">
            {authMode === "login" ? "Welcome Back!" : "Join the Community"}
          </h3>
          <p className="text-xs text-emerald-100/80 mt-1">
            {authMode === "login"
              ? "Access your saved wishlist, custom itineraries, and bookings in one place."
              : "Create an account to save preferences, plan trips, and book adventures."}
          </p>

          {/* Mode Switch Tabs */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-black/20 rounded-xl">
            <button
              onClick={() => {
                setAuthMode("login");
                setError("");
                setSuccessMessage("");
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-white text-[#1E3C1B] shadow-sm"
                  : "text-emerald-100 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode("register");
                setError("");
                setSuccessMessage("");
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "register"
                  ? "bg-white text-[#1E3C1B] shadow-sm"
                  : "text-emerald-100 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authMode === "login" ? (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#2D5A27]" /> Email / Gmail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#2D5A27]" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:outline-none font-semibold text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In to TravelMate"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#2D5A27]" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#2D5A27]" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#2D5A27]" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose Your Travel Persona
                </label>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                >
                  <option value="Explorer">Pro Explorer (Treks & Nature)</option>
                  <option value="Luxury Traveler">Luxury Connoisseur (Villas & 5-Star)</option>
                  <option value="Backpacker">Backpacker & Solo Nomad</option>
                  <option value="Family Traveler">Family Vacation Planner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-3">
                  {avatars.map((av, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatar(av.url)}
                      className={`relative rounded-full p-0.5 transition-all ${
                        avatar === av.url ? "ring-2 ring-[#2D5A27] scale-110" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <SafeImage
                        src={av.url}
                        alt={av.label}
                        category="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2D5A27] hover:bg-[#1E3C1B] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
