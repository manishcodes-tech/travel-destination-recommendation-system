import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Compass, Loader2 } from "lucide-react";

export default function DestinationMap({ latitude, longitude, destinationName, locationName }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasValidCoords = !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0);

  useEffect(() => {
    if (!hasValidCoords || !mapContainerRef.current) {
      setMapLoading(false);
      return;
    }

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 11);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          markerRef.current.bindPopup(
            '<div style="font-family: inherit; padding: 2px;">' +
              '<strong style="font-size: 13px; color: #1e293b; display: block;">' + destinationName + '</strong>' +
              '<span style="font-size: 11px; color: #64748b;">' + (locationName || "") + '</span>' +
            '</div>'
          );
        }
        return;
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 11,
        scrollWheelZoom: false,
        attributionControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
      }).addTo(map);

      const customIcon = L.divIcon({
        className: "travelmate-map-pin",
        html: '<div style="background: #2D5A27; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">' +
          '<div style="transform: rotate(45deg); width: 10px; height: 10px; background: #4ADE80; border-radius: 50%;"></div>' +
        '</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(
        '<div style="font-family: inherit; padding: 2px;">' +
          '<strong style="font-size: 13px; color: #1e293b; display: block;">' + destinationName + '</strong>' +
          '<span style="font-size: 11px; color: #64748b;">' + (locationName || "") + '</span>' +
        '</div>'
      );

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapLoading(false);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

    } catch (err) {
      console.warn("Leaflet map initialization warning:", err);
      setMapError(true);
      setMapLoading(false);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [lat, lng, destinationName, locationName, hasValidCoords]);

  if (!hasValidCoords || mapError) {
    return (
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Navigation className="w-4 h-4 text-[#2D5A27]" />
          <span>Interactive Map</span>
        </div>
        <div className="h-56 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
          <Compass className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs text-slate-500 font-medium">Map is currently unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
          <Navigation className="w-4 h-4 text-[#2D5A27]" />
          <span>Interactive Map</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
        </span>
      </div>

      <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        {mapLoading && (
          <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-xs flex flex-col items-center justify-center z-10 text-slate-600 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#2D5A27]" />
            <span className="text-xs font-semibold text-slate-600">Loading map...</span>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Explore topography and geography around {destinationName}.
      </p>
    </div>
  );
}