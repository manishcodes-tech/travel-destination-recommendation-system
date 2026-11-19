import React from "react";
import { useTravel } from "../context/TravelContext";
import { Bell, CheckCheck, X, Sparkles, Tag, ShieldAlert, Calendar } from "lucide-react";

export default function NotificationDropdown() {
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    notifications,
    markAllNotificationsRead,
    unreadCount,
    navigate
  } = useTravel();

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 pointer-events-auto bg-black/10"
        onClick={() => setIsNotificationOpen(false)}
      />

      <div className="pointer-events-auto absolute top-20 right-4 sm:right-12 md:right-24 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-[#FAFBFB]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#2D5A27]" />
            <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#4ADE80]/30 text-[#1E3C1B]">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-[#2D5A27] hover:text-[#1E3C1B] font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={() => setIsNotificationOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 transition-colors hover:bg-slate-50 ${
                !item.read ? "bg-[#F4F8F3]/60" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-[#2D5A27]"></span>
                  )}
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-400 shrink-0">{item.time}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {item.tag}
                </span>
                <button
                  onClick={() => {
                    setIsNotificationOpen(false);
                    if (item.tag === "Seasonal") navigate("destination-detail", { id: "kerala" });
                    else if (item.tag === "Price Drop") navigate("destination-detail", { id: "manali" });
                    else navigate("admin");
                  }}
                  className="text-xs text-[#2D5A27] font-semibold hover:underline"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={() => {
              setIsNotificationOpen(false);
              navigate("admin");
            }}
            className="text-xs font-semibold text-[#2D5A27] hover:text-[#1E3C1B]"
          >
            Manage Alerts in Admin Settings
          </button>
        </div>
      </div>
    </div>
  );
}
