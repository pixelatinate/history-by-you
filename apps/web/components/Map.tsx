"use client";

import { useEffect, useRef } from "react";
// maplibre-gl v6 dropped its default export — import the pieces we use by name.
import { Map as MapLibreMap, Marker, NavigationControl, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LocationWithEntries } from "@history-by-you/db";

// MapLibre's own demo style — free, no API key required. Good enough to
// build against; swap for a MapTiler/Stadia Maps style (or a self-hosted
// one) before shipping, since the demo tiles aren't meant for production
// traffic.
const DEMO_STYLE = "https://demotiles.maplibre.org/style.json";

export function Map({ locations }: { locations: LocationWithEntries[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: DEMO_STYLE,
      center: locations[0]?.point ?? [-83.9296, 35.9544], // UT Knoxville
      zoom: 14,
    });
    map.addControl(new NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers = locations.map((location) => {
      const popup = new Popup({ offset: 16 }).setHTML(
        `<strong>${escapeHtml(location.name)}</strong>` +
          (location.entries[0] ? `<p>${escapeHtml(location.entries[0].body)}</p>` : "")
      );
      return new Marker({ color: "#D9042B" })
        .setLngLat(location.point)
        .setPopup(popup)
        .addTo(map);
    });

    return () => markers.forEach((marker) => marker.remove());
  }, [locations]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
