const API_BASE = "/api";

export const api = {
  getToken() {
    return localStorage.getItem("travelmate_token") || null;
  },

  setToken(token) {
    if (token) {
      localStorage.setItem("travelmate_token", token);
    } else {
      localStorage.removeItem("travelmate_token");
    }
  },

  clearToken() {
    localStorage.removeItem("travelmate_token");
  },

  getHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.message || "An error occurred");
      }
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth
  async login(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async register(name, email, password, persona, avatar) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, persona, avatar })
    });
    // Important: DO NOT store token or authenticate on registration.
    // User must log in explicitly with credentials.
    return data;
  },

  async getMe() {
    return this.request("/auth/me");
  },

  // Wishlist
  async getWishlist() {
    return this.request("/wishlist");
  },

  async toggleWishlist(destinationId) {
    return this.request("/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ destinationId })
    });
  },

  // Bookings
  async getBookings() {
    return this.request("/bookings");
  },

  async createBooking(bookingData) {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData)
    });
  },

  async updateBookingStatus(bookingId, status) {
    return this.request(`/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  },

  // Admin Analytics & Database
  async getAdminStats() {
    return this.request("/admin/stats");
  },

  async getDbInfo() {
    return this.request("/admin/db-info");
  },

  async getUsers() {
    return this.request("/admin/users");
  },

  async getMysqlSchema() {
    return this.request("/admin/mysql-schema");
  },

  // Destinations Management & Retrieval
  async getDestinations() {
    return this.request("/destinations");
  },

  async getDestinationById(destId) {
    return this.request(`/destinations/${destId}`);
  },

  async getWeather(destId) {
    return this.request(`/weather/${destId}`);
  },

  async getRecommendationsPreview(preferences) {
    return this.request("/recommendations/preview", {
      method: "POST",
      body: JSON.stringify(preferences)
    });
  },

  async getRecommendations(preferences) {
    return this.request("/recommendations", {
      method: "POST",
      body: JSON.stringify(preferences)
    });
  },

  async addDestination(destData) {
    return this.request("/destinations", {
      method: "POST",
      body: JSON.stringify(destData)
    });
  },

  async updateDestinationPrice(destId, newPrice) {
    return this.request(`/destinations/${destId}/price`, {
      method: "PATCH",
      body: JSON.stringify({ base_price: Number(newPrice) })
    });
  },

  async deleteDestination(destId) {
    return this.request(`/destinations/${destId}`, {
      method: "DELETE"
    });
  },

  // ----------------- ADMIN CATALOG INVENTORY API METHODS -----------------
  // 1. Destinations
  async adminGetDestinations() {
    return this.request("/admin/destinations");
  },

  async adminCreateDestination(destData) {
    return this.request("/admin/destinations", {
      method: "POST",
      body: JSON.stringify(destData)
    });
  },

  async adminUpdateDestination(destId, destData) {
    return this.request(`/admin/destinations/${destId}`, {
      method: "PUT",
      body: JSON.stringify(destData)
    });
  },

  async adminToggleDestinationStatus(destId, isActive = null) {
    return this.request(`/admin/destinations/${destId}/status`, {
      method: "PATCH",
      body: JSON.stringify(isActive !== null ? { is_active: isActive } : {})
    });
  },

  async adminDeleteDestination(destId) {
    return this.request(`/admin/destinations/${destId}`, {
      method: "DELETE"
    });
  },

  // 2. Stays
  async adminGetStays({ destination_id, status, search } = {}) {
    const params = new URLSearchParams();
    if (destination_id) params.append("destination_id", destination_id);
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/admin/stays${qs}`);
  },

  async adminCreateStay(stayData) {
    return this.request("/admin/stays", {
      method: "POST",
      body: JSON.stringify(stayData)
    });
  },

  async adminUpdateStay(stayId, stayData) {
    return this.request(`/admin/stays/${stayId}`, {
      method: "PUT",
      body: JSON.stringify(stayData)
    });
  },

  async adminToggleStayStatus(stayId, isActive = null) {
    return this.request(`/admin/stays/${stayId}/status`, {
      method: "PATCH",
      body: JSON.stringify(isActive !== null ? { is_active: isActive } : {})
    });
  },

  async adminDeleteStay(stayId) {
    return this.request(`/admin/stays/${stayId}`, {
      method: "DELETE"
    });
  },

  // 3. Transport
  async adminGetTransport({ destination_id, status, search } = {}) {
    const params = new URLSearchParams();
    if (destination_id) params.append("destination_id", destination_id);
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/admin/transport${qs}`);
  },

  async adminCreateTransport(transData) {
    return this.request("/admin/transport", {
      method: "POST",
      body: JSON.stringify(transData)
    });
  },

  async adminUpdateTransport(transId, transData) {
    return this.request(`/admin/transport/${transId}`, {
      method: "PUT",
      body: JSON.stringify(transData)
    });
  },

  async adminToggleTransportStatus(transId, isActive = null) {
    return this.request(`/admin/transport/${transId}/status`, {
      method: "PATCH",
      body: JSON.stringify(isActive !== null ? { is_active: isActive } : {})
    });
  },

  async adminDeleteTransport(transId) {
    return this.request(`/admin/transport/${transId}`, {
      method: "DELETE"
    });
  },

  // 4. Vehicle Rentals
  async adminGetRentals({ destination_id, status, search } = {}) {
    const params = new URLSearchParams();
    if (destination_id) params.append("destination_id", destination_id);
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/admin/rentals${qs}`);
  },

  async adminCreateRental(rentalData) {
    return this.request("/admin/rentals", {
      method: "POST",
      body: JSON.stringify(rentalData)
    });
  },

  async adminUpdateRental(rentalId, rentalData) {
    return this.request(`/admin/rentals/${rentalId}`, {
      method: "PUT",
      body: JSON.stringify(rentalData)
    });
  },

  async adminToggleRentalStatus(rentalId, isActive = null) {
    return this.request(`/admin/rentals/${rentalId}/status`, {
      method: "PATCH",
      body: JSON.stringify(isActive !== null ? { is_active: isActive } : {})
    });
  },

  async adminDeleteRental(rentalId) {
    return this.request(`/admin/rentals/${rentalId}`, {
      method: "DELETE"
    });
  },

  // 5. Activities
  async adminGetActivities({ destination_id, status, search } = {}) {
    const params = new URLSearchParams();
    if (destination_id) params.append("destination_id", destination_id);
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/admin/activities${qs}`);
  },

  async adminCreateActivity(activityData) {
    return this.request("/admin/activities", {
      method: "POST",
      body: JSON.stringify(activityData)
    });
  },

  async adminUpdateActivity(actId, activityData) {
    return this.request(`/admin/activities/${actId}`, {
      method: "PUT",
      body: JSON.stringify(activityData)
    });
  },

  async adminToggleActivityStatus(actId, isActive = null) {
    return this.request(`/admin/activities/${actId}/status`, {
      method: "PATCH",
      body: JSON.stringify(isActive !== null ? { is_active: isActive } : {})
    });
  },

  async adminDeleteActivity(actId) {
    return this.request(`/admin/activities/${actId}`, {
      method: "DELETE"
    });
  },

  // 6. Food & Dining
  async adminGetFood({ destination_id, status, search } = {}) {
    const params = new URLSearchParams();
    if (destination_id) params.append("destination_id", destination_id);
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/admin/food${qs}`);
  },

  async adminCreateFood(foodData) {
    return this.request("/admin/food", {
      method: "POST",
      body: JSON.stringify(foodData)
    });
  },

  async adminUpdateFood(foodId, foodData) {
    return this.request(`/admin/food/${foodId}`, {
      method: "PUT",
      body: JSON.stringify(foodData)
    });
  },

  async adminToggleFoodStatus(foodId, isActive = null) {
    return this.request(`/admin/food/${foodId}/status`, {
      method: "PATCH",
      body: JSON.stringify(isActive !== null ? { is_active: isActive } : {})
    });
  },

  async adminDeleteFood(foodId) {
    return this.request(`/admin/food/${foodId}`, {
      method: "DELETE"
    });
  }
};
