"use client";

import { useEffect, useRef } from "react";
// maplibre-gl v6 dropped its default export — import the pieces we use by name.
import { Map as MapLibreMap, Marker, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LocationWithEntries } from "@history-by-you/db";
import type { Mode } from "./Map";

// OpenFreeMap — free, no API key, no billing account. Fallback used until
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set (see GoogleMapCanvas).
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const DEFAULT_CENTER: [number, number] = [-83.9296, 35.9544]; // UT Knoxville

export function MapLibreCanvas({
  locations,
  mode,
  onMapClick,
  onMarkerClick,
}: {
  locations: LocationWithEntries[];
  mode: Mode;
  onMapClick: (point: [number, number]) => void;
  onMarkerClick: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL,
      center: locations[0]?.point ?? DEFAULT_CENTER,
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

  // Handle map clicks while in "arming" mode (placing a new pin).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function handleClick(event: { lngLat: { lng: number; lat: number } }) {
      if (mode.type === "arming") onMapClick([event.lngLat.lng, event.lngLat.lat]);
    }

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [mode.type, onMapClick]);

  // Keep the cursor honest about arming mode.
  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();
    if (canvas) canvas.style.cursor = mode.type === "arming" ? "crosshair" : "";
  }, [mode.type]);

  // Re-render markers whenever the location list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = locations.map((location) => {
      const marker = new Marker({ color: "#D9042B" }).setLngLat(location.point).addTo(map);
      marker.getElement().addEventListener("click", (event) => {
        event.stopPropagation();
        onMarkerClick(location.id);
      });
      return marker;
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [locations, onMarkerClick]);

  // Draft marker for a not-yet-saved location.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mode.type !== "draft") return;

    const marker = new Marker({ color: "#10DFD3" }).setLngLat(mode.point).addTo(map);
    return () => {
      marker.remove();
    };
  }, [mode]);

  return <div ref={containerRef} className="h-full w-full" />;
}
