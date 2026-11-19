import React, { useState, useEffect } from "react";

// Curated high-resolution, reliable fallbacks for each category
export const CATEGORY_FALLBACKS = {
  stay: {
    default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    luxury: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    heritage: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=800&q=80",
    chalet: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    hostel: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    beach: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    camp: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
  },
  transport: {
    default: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    flight: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    train: "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=800&q=80",
    bus: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    metro: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
    ferry: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
    cab: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    cable: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80"
  },
  rental: {
    default: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    car: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    suv: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    bike: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    scooter: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80"
  },
  activity: {
    default: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    trekking: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    water: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80",
    scuba: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    safari: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
    culture: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    city: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  },
  food: {
    default: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    curry: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    fish: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    meat: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    coffee: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    dessert: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80"
  },
  destination: {
    default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
  },
  user: {
    default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  }
};

/**
 * Returns a category-aware fallback URL based on category and textual hints.
 */
export function getCategoryFallbackImage(category = "destination", contextText = "") {
  const cat = String(category || "").toLowerCase();
  const text = typeof contextText === "string" ? contextText.toLowerCase() : "";

  if (cat.includes("stay") || cat.includes("hotel")) {
    const pool = CATEGORY_FALLBACKS.stay;
    if (text.includes("palace") || text.includes("heritage") || text.includes("fort")) return pool.heritage;
    if (text.includes("chalet") || text.includes("cottage") || text.includes("mountain")) return pool.chalet;
    if (text.includes("hostel") || text.includes("zostel") || text.includes("dorm")) return pool.hostel;
    if (text.includes("beach") || text.includes("resort") || text.includes("ocean")) return pool.beach;
    if (text.includes("tent") || text.includes("camp") || text.includes("safari")) return pool.camp;
    if (text.includes("luxury") || text.includes("5-star") || text.includes("spa")) return pool.luxury;
    return pool.default;
  }

  if (cat.includes("transport")) {
    const pool = CATEGORY_FALLBACKS.transport;
    if (text.includes("flight") || text.includes("air") || text.includes("plane")) return pool.flight;
    if (text.includes("train") || text.includes("express") || text.includes("rail")) return pool.train;
    if (text.includes("metro") || text.includes("subway") || text.includes("tube")) return pool.metro;
    if (text.includes("bus") || text.includes("volvo") || text.includes("coach")) return pool.bus;
    if (text.includes("boat") || text.includes("ferry") || text.includes("cruise") || text.includes("shikara")) return pool.ferry;
    if (text.includes("cable") || text.includes("ropeway") || text.includes("gondola")) return pool.cable;
    return pool.cab;
  }

  if (cat.includes("rental")) {
    const pool = CATEGORY_FALLBACKS.rental;
    if (text.includes("bike") || text.includes("motorcycle") || text.includes("enfield") || text.includes("himalayan")) return pool.bike;
    if (text.includes("scooter") || text.includes("activa") || text.includes("vespa")) return pool.scooter;
    if (text.includes("suv") || text.includes("4x4") || text.includes("thar")) return pool.suv;
    return pool.car;
  }

  if (cat.includes("activity") || cat.includes("tour")) {
    const pool = CATEGORY_FALLBACKS.activity;
    if (text.includes("trek") || text.includes("mountain") || text.includes("hike") || text.includes("climb")) return pool.trekking;
    if (text.includes("water") || text.includes("raft") || text.includes("river")) return pool.water;
    if (text.includes("dive") || text.includes("scuba") || text.includes("snorkel")) return pool.scuba;
    if (text.includes("safari") || text.includes("wildlife") || text.includes("tiger")) return pool.safari;
    if (text.includes("temple") || text.includes("palace") || text.includes("fort") || text.includes("heritage")) return pool.culture;
    if (text.includes("beach") || text.includes("surf") || text.includes("coastal")) return pool.beach;
    if (text.includes("city") || text.includes("skyline") || text.includes("tower") || text.includes("opera")) return pool.city;
    return pool.default;
  }

  if (cat.includes("food") || cat.includes("dining")) {
    const pool = CATEGORY_FALLBACKS.food;
    if (text.includes("fish") || text.includes("seafood") || text.includes("trout") || text.includes("oyster")) return pool.fish;
    if (text.includes("pizza") || text.includes("pasta") || text.includes("italian")) return pool.pizza;
    if (text.includes("curry") || text.includes("thali") || text.includes("dal") || text.includes("paneer")) return pool.curry;
    if (text.includes("meat") || text.includes("kebab") || text.includes("korma") || text.includes("roast")) return pool.meat;
    if (text.includes("coffee") || text.includes("cafe") || text.includes("breakfast")) return pool.coffee;
    if (text.includes("dessert") || text.includes("sweet") || text.includes("petha") || text.includes("cake")) return pool.dessert;
    return pool.default;
  }

  if (cat.includes("user") || cat.includes("avatar")) {
    return CATEGORY_FALLBACKS.user.default;
  }

  return CATEGORY_FALLBACKS.destination.default;
}

/**
 * Universal SafeImage Component.
 * Guaranteed to load cleanly, never show a broken image, and provide category-accurate fallback.
 */
export default function SafeImage({
  src,
  alt = "Travel item",
  category = "destination",
  contextName = "",
  className = "w-full h-full object-cover",
  loading = "lazy",
  onError: externalOnError,
  onLoad: externalOnLoad,
  ...restProps
}) {
  const fallbackUrl = getCategoryFallbackImage(category, contextName || alt);
  const isCleanHttpUrl = typeof src === "string" && src.trim().startsWith("http");
  const [currentSrc, setCurrentSrc] = useState(isCleanHttpUrl ? src.trim() : fallbackUrl);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);

  useEffect(() => {
    if (typeof src === "string" && src.trim().startsWith("http")) {
      setCurrentSrc(src.trim());
      setHasFailedOnce(false);
    } else {
      setCurrentSrc(fallbackUrl);
    }
  }, [src, category, contextName]);

  const handleError = (e) => {
    if (!hasFailedOnce) {
      setHasFailedOnce(true);
      setCurrentSrc(fallbackUrl);
    }
    if (externalOnError) {
      externalOnError(e);
    }
  };

  const handleLoad = (e) => {
    if (externalOnLoad) {
      externalOnLoad(e);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      onError={handleError}
      onLoad={handleLoad}
      className={className}
      {...restProps}
    />
  );
}
