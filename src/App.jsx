import React from "react";
import { TravelProvider, useTravel } from "./context/TravelContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchModal from "./components/SearchModal";
import NotificationDropdown from "./components/NotificationDropdown";
import UserProfileModal from "./components/UserProfileModal";
import BookingModal from "./components/BookingModal";
import AuthModal from "./components/AuthModal";

import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import HomePage from "./pages/HomePage";
import PlanTripPage from "./pages/PlanTripPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import DestinationDetailPage from "./pages/DestinationDetailPage";
import BudgetPlannerPage from "./pages/BudgetPlannerPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DestinationsPage from "./pages/DestinationsPage";
import StaysPage from "./pages/StaysPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import TransportPage from "./pages/TransportPage";
import RentalsPage from "./pages/RentalsPage";
import BookingPage from "./pages/BookingPage";

function AppContent() {
  const { currentRoute } = useTravel();

  // Clean route in case a leading/trailing slash was passed
  const route = (currentRoute || "home").replace(/^\/+|\/+$/g, "");
  const knownRoutes = [
    "home",
    "plan-trip",
    "recommendations",
    "destination-detail",
    "budget-planner",
    "booking",
    "admin",
    "destinations",
    "stays",
    "activities",
    "transport",
    "rentals"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFB] text-slate-800 antialiased selection:bg-[#E8F3E6] selection:text-[#2D5A27]">
      {/* Persistent Shared Sticky Navbar */}
      <Navbar />

      {/* Main Routed Page Content wrapped in Error Boundary */}
      <main className="flex-1">
        <ErrorBoundary key={route}>
          {route === "home" && <HomePage />}
          {route === "plan-trip" && <PlanTripPage />}
          {route === "recommendations" && <RecommendationsPage />}
          {route === "destination-detail" && <DestinationDetailPage />}
          {route === "budget-planner" && <BudgetPlannerPage />}
          {route === "booking" && <BookingPage />}
          {route === "admin" && <AdminDashboardPage />}
          {route === "destinations" && <DestinationsPage />}
          {route === "stays" && <StaysPage />}
          {route === "activities" && <ActivitiesPage />}
          {route === "transport" && <TransportPage />}
          {route === "rentals" && <RentalsPage />}
          {!knownRoutes.includes(route) && <HomePage />}
        </ErrorBoundary>
      </main>

      {/* Global Interactive Overlays & Modals wrapped in ErrorBoundary */}
      <ErrorBoundary>
        <SearchModal />
        <NotificationDropdown />
        <UserProfileModal />
        <BookingModal />
        <AuthModal />
      </ErrorBoundary>

      {/* Persistent Brand Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TravelProvider>
        <AppContent />
      </TravelProvider>
    </ErrorBoundary>
  );
}
