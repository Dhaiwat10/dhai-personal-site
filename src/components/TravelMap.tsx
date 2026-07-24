import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { travelLocations } from "../data/travel-locations";

const markerIcon = L.divIcon({
  className: "travel-map-marker",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

function TravelMap() {
  const [isMounted, setIsMounted] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const { center, zoom } = useMemo(() => {
    if (travelLocations.length === 0) {
      return { center: [20, 0] as [number, number], zoom: 2 };
    }

    const lats = travelLocations.map((loc) => loc.latitude);
    const lngs = travelLocations.map((loc) => loc.longitude);

    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);

    let calculatedZoom = 2;
    if (maxSpread < 0.1) calculatedZoom = 10;
    else if (maxSpread < 0.5) calculatedZoom = 8;
    else if (maxSpread < 2) calculatedZoom = 6;
    else if (maxSpread < 10) calculatedZoom = 4;

    return {
      center: [centerLat, centerLng] as [number, number],
      zoom: calculatedZoom,
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (!mapContainerRef.current || mapInstanceRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      scrollWheelZoom: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
      },
    ).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    travelLocations.forEach((location) => {
      L.marker([location.latitude, location.longitude], {
        icon: markerIcon,
        alt: `${location.city}, ${location.country}`,
        title: `${location.city}, ${location.country}`,
      })
        .addTo(markersLayer)
        .bindPopup(
          `
            <div class="text-zinc-100">
              <div class="text-base font-semibold">${location.city}</div>
              <div class="mt-0.5 text-sm text-zinc-400">${location.country}</div>
              ${
                location.year
                  ? `<div class="mt-2 text-xs tabular-nums text-zinc-500">${location.year}</div>`
                  : ""
              }
              ${
                location.notes
                  ? `<div class="mt-2 text-pretty text-sm leading-5 text-zinc-300">${location.notes}</div>`
                  : ""
              }
            </div>
          `
        );
    });

    map.fitBounds(
      L.latLngBounds(
        travelLocations.map((location) => [
          location.latitude,
          location.longitude,
        ]),
      ),
      { maxZoom: 4, padding: [24, 24] },
    );

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, [center, zoom, isMounted]);

  if (travelLocations.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-zinc-500">
        No travel locations yet.
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div
        aria-label="Loading travel map"
        className="h-[360px] animate-pulse rounded-xl border border-white/10 bg-white/[0.025] sm:h-[440px] lg:h-[520px]"
      />
    );
  }

  return (
    <div className="travel-map overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
      <div
        ref={mapContainerRef}
        role="region"
        aria-label="Map of places Dhaiwat has visited"
        className="z-0 h-[360px] w-full sm:h-[440px] lg:h-[520px]"
      />
    </div>
  );
}

export default TravelMap;

