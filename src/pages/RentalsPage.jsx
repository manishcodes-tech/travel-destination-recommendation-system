import React from "react";
import SafeImage from "../components/SafeImage";
import { Car, Fuel, Shield, Star, CheckCircle2, Sparkles, MapPin } from "lucide-react";

export default function RentalsPage() {

  const rentalVehicles = [
    {
      id: "rent-1",
      name: "Royal Enfield Himalayan 450",
      type: "Adventure Bike",
      location: "Manali / Kasol / Leh",
      rate: "₹1,400",
      rateNum: 1400,
      image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
      specs: ["450cc Engine", "ABS Brakes", "Luggage Carrier", "Pannier Mounts"],
      rating: 4.9
    },
    {
      id: "rent-2",
      name: "Mahindra Thar 4x4 Convertible",
      type: "Self-Drive SUV",
      location: "Goa / Udaipur",
      rate: "₹2,800",
      rateNum: 2800,
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      specs: ["Automatic Transmission", "4x4 Low-Range", "Bluetooth Audio", "Unlimited KMs"],
      rating: 4.8
    },
    {
      id: "rent-3",
      name: "Honda Activa 6G Scooter",
      type: "Scooter Rental",
      location: "Goa / Lonavala / Kerala",
      rate: "₹450",
      rateNum: 450,
      image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
      specs: ["110cc Automatic", "2 Helmets Included", "High Mileage (50 kmpl)", "Airport Drop"],
      rating: 4.7
    },
    {
      id: "rent-4",
      name: "Coleman 4-Person Alpine Camping Kit",
      type: "Camping & Trek Gear",
      location: "Manali / Kasol / Lonavala",
      rate: "₹650",
      rateNum: 650,
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
      specs: ["Waterproof Tent", "2 Sleeping Bags (-5°C)", "Portable Stove", "Headlamps"],
      rating: 4.9
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3E6] text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-2">
          <Car className="w-3.5 h-3.5" /> Self-Drive & Gear Rentals
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Rent Bikes, Cars & Trekking Gear
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Explore mountains and coastlines at your own pace with verified clean vehicles and gear.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rentalVehicles.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
          >
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <SafeImage
                src={item.image}
                alt={item.name}
                category="rental"
                contextName={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/95 text-xs font-bold text-amber-500 shadow-xs flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-bold text-[#2D5A27] uppercase tracking-wider">
                  {item.type}
                </span>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-[#2D5A27] transition-colors mt-0.5">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                </p>

                {/* Specs */}
                <div className="mt-3 space-y-1">
                  {item.specs.map((sp, i) => (
                    <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#2D5A27] shrink-0" />
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Rental Rate</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-[#2D5A27]">{item.rate}</span>
                    <span className="text-xs text-slate-400"> / day</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {item.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
