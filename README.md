# 🌍 TravelMate — Smart Travel Recommendation & Itinerary Platform

TravelMate is a modern, responsive, multi-page travel recommendation platform inspired by industry-leading travel web applications. It empowers travelers to discover destinations, plan trips with client-side preference profiling, explore day-by-day itineraries, track budgets interactively, and inspect operational metrics in an admin dashboard.

---

## 🎨 Design System & Theme

- **Color Palette**:
  - **Primary**: Deep Forest / Olive Green (`#2D5A27`, `#1E3C1B`)
  - **Accent**: Soft Emerald (`#4ADE80`, `#86EFAC`)
  - **Surfaces**: Crisp White (`#FFFFFF`), Soft Slate Tint (`#FAFBFB`, `#F4F8F3`)
  - **Borders**: Slate 200/300 (`#E2E8F0`)
- **Typography**: Plus Jakarta Sans & Inter via Google Fonts.
- **Icons**: Lucide Icons (`lucide-react`) utilized consistently.

---

## 🚀 Key Functional Views & Modules

1. **Shared Persistent Sticky Navbar**:
   - Brand Logo with Compass icon and bold **TravelMate** branding.
   - Center Navigation links: **Home**, **Destinations**, **Plan Trip**, **Stays**, **Transport**, **Activities**, **Rentals**, **Budget Planner**, **Admin**.
   - Right Action Controls: Quick Search modal trigger (`Ctrl+K`), Notification Bell with live unread badge and dropdown, User Wishlist Counter, and User Profile avatar.
   - Fully responsive with mobile slide-out drawer.

2. **Home Page (`/`)**:
   - **Hero Section**: Mountain landscape backdrop overlay, headline *"Explore the World Your Way"*, subtext *"Plan smarter, travel better. Create memories that last a lifetime."*
   - **Floating Search Pill**: *"Where do you want to go?"* input + *"Explore"* CTA button with quick search chips (Manali, Goa, Udaipur, Kerala, Dubai).
   - **Horizontal Trust Badges Strip (4 Items)**: Best Prices, Multiple Options, Easy Planning, Trusted Reviews.
   - **Popular Destinations Grid**: 6 cards featuring **Manali, Goa, Udaipur, Lonavala, Kerala, and Dubai** with high-res photos, region, star ratings, starting costs, and interactive bookmark hearts.

3. **Plan Trip Page (`/plan-trip`)**:
   - **Split-Screen Layout**: Left inspirational travel photography with quote and perks card.
   - **Interactive Preference Form**:
     - Specific Destination Picker (optional, or leave blank for smart recommendations)
     - Interactive Budget per Person Slider & synced numeric input (default ₹10,000)
     - Trip Duration selector (2D/1N, 3D/2N, 4D/3N, 5D/4N, 6+ Days)
     - Preferred Season dropdown (Winter, Summer, Monsoon, All Seasons)
     - Travel Style dropdown (Adventure, Nature, Relaxation, Heritage)
     - Traveling With dropdown (Friends, Solo, Couple, Family)
     - **CTA Button**: *"Get My Plan"* — runs the dynamic client-side matching algorithm and navigates to recommendations.

4. **Recommendation Results Page (`/recommendations`)**:
   - Header: *"Recommended Destinations For You"* with subtitle *"Based on your preferences, here are the best matches."*
   - Active preference pill summary strip with *"Edit Preferences"* button.
   - Category filter pills and sorting dropdown (Highest Match %, Price Low-to-High, Price High-to-Low, Top Rated).
   - **Ranked Destination Cards Grid**: High-res photo, destination name, region, duration, price per person in INR (₹), tags, dynamic match badge (e.g. `96% Match`), *"View Details"* button, and *"Plan Budget"* quick action.

5. **Destination Details & Itinerary Page (`/destination/:id`)**:
   - Full-width hero banner with destination title, star ratings, reviews count, and duration.
   - **Sticky 7-Tab Navigation Bar**:
     1. **Overview**: Detailed writeup, tags, and Top Attractions Grid (Solang Valley, Rohtang Pass, Hadimba Temple, Old Manali, etc.).
     2. **How to Reach**: Flight, bus, and train connectivity details.
     3. **Stay**: Luxury Victorian castles, backpacker hostels, and boutique chalets.
     4. **Food**: Regional delicacies, specialty dishes, and famous cafes.
     5. **Local Transport**: Rented Royal Enfields, scooter rentals, taxi union cabs, auto rickshaws.
     6. **Activities**: Paragliding, rafting, treks, cable car rides with booking actions.
     7. **Itinerary**: Interactive day-by-day expandable timeline (Morning, Afternoon, Evening) with insider tips.
   - **Quick Info Cards**: Best Time, Weather, Ideal For, Language.

6. **Trip Budget Planner (`/budget-planner`)**:
   - **Top Comparison Banner**: Your Target Budget vs. Calculated Trip Cost.
   - **Visual Alert Badge**: *"Under Budget"* (green with savings amount) or *"Over Budget"* (red with difference amount).
   - Dynamic budget utilization progress bar.
   - **6 Itemized Expense Cards with Sliders**:
     - Long-Distance Transport (Flights/Trains/Volvo)
     - Accommodation & Stay (Hotels/Hostels/Villas)
     - Food & Dining (Meals, Cafes, Local Food)
     - Local Transport (Scooters, Cabs, Metro)
     - Sightseeing & Activities (Trekking, Scuba, Passes)
     - Miscellaneous & Souvenirs (Buffer)
   - **Aside Card**: *"Tips to Reduce Cost"* (travel off-season, book hostels, use local transit, eat at local dhabas).
   - Destination switcher and traveler counter controls.

7. **Admin & Analytics Dashboard (`/admin`)**:
   - **4 KPI Metric Cards**:
     - Total Users: 1,245 (+14.2%)
     - Total Bookings: 856 (+22.5%)
     - Total Revenue: ₹12,45,000 (+18.8%)
     - Avg. Rating: 4.6 / 5.0 (from 3,420 reviews)
   - **Visual Charts**:
     - Monthly Bookings Growth Bar Chart (Jan to Dec with interactive hover tooltips)
     - Popular Destinations Distribution (Share breakdown for Manali, Goa, Kerala, Udaipur, Dubai, Lonavala)
     - User Growth Trend (Smooth spline SVG curve from 420 to 1,245 users)
   - **Recent Bookings Table**:
     - Columns: Booking ID, Traveler Name & Avatar, Destination, Travel Dates, Amount (₹), Status Tag.
     - Search and status filter (All, Confirmed, Pending, Cancelled).
     - Interactive status toggling by clicking status badges.

8. **Additional Supporting Modules**:
   - **Destinations Directory (`/destinations`)**: Comprehensive catalog with search, price slider, and style filters.
   - **Stays Explorer (`/stays`)**: Verified resorts, 5-star properties, backpacker hostels.
   - **Activities (`/activities`)**: Air adventures, water sports, desert safaris, and cultural tours.
   - **Transport Finder (`/transport`)**: Route search with Volvo sleepers, flights, and trains.
   - **Rentals (`/rentals`)**: Royal Enfield bikes, Mahindra Thar 4x4s, scooters, and camping kits.
   - **Global Search Modal (`Ctrl+K`)**: Instant search across destinations, stays, and activities.
   - **Notification Drawer**: Unread badge, real-time alert notifications, and mark-all-read.
   - **User Profile Modal**: Traveler level, saved wishlist destinations, and booking history.
   - **Booking Checkout Modal**: Dynamic traveler counter, dates, price calculation with GST, and celebratory confetti animations (`canvas-confetti`).

---

## 🛠️ Quick Start

```bash
cd travelmate
npm install
npm run dev
```

Platform runs on `http://localhost:5174/`.
