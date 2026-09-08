"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { LocationWithEntries } from "@history-by-you/db";
import type { Mode } from "./Map";

const DEFAULT_CENTER = { lat: 35.9544, lng: -83.9296 }; // UT Knoxville

// setOptions() may only be called once per page load.
let optionsSet = false;

export function GoogleMapCanvas({
  apiKey,
  locations,
  mode,
  onMapClick,
  onMarkerClick,
}: {
  apiKey: string;
  locations: LocationWithEntries[];
  mode: Mode;
  onMapClick: (point: [number, number]) => void;
  onMarkerClick: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const draftMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const libsRef = useRef<{
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
    PinElement: typeof google.maps.marker.PinElement;
  } | null>(null);
  const [ready, setReady] = useState(false);

  // Click/marker-click listeners are attached once, during async init — keep
  // the latest callbacks/mode in refs (updated post-render) so they don't
  // need to be re-attached.
  const modeRef = useRef(mode);
  const onMapClickRef = useRef(onMapClick);
  const onMarkerClickRef = useRef(onMarkerClick);
  useEffect(() => {
    modeRef.current = mode;
    onMapClickRef.current = onMapClick;
    onMarkerClickRef.current = onMarkerClick;
  });

  // Initialize the map once.
  useEffect(() => {
    let cancelled = false;

    if (!optionsSet) {
      setOptions({ key: apiKey, v: "weekly" });
      optionsSet = true;
    }

    Promise.all([importLibrary("maps"), importLibrary("marker")]).then(
      ([{ Map }, { AdvancedMarkerElement, PinElement }]) => {
        if (cancelled || !containerRef.current) return;

        libsRef.current = { AdvancedMarkerElement, PinElement };

        const [lng, lat] = locations[0]?.point ?? [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat];
        const map = new Map(containerRef.current, {
          center: { lat, lng },
          zoom: 14,
          // AdvancedMarkerElement renders fine without a real Map ID — this
          // is Google's own placeholder for local development. Create a
          // real one in Google Cloud Console (Map Management) for custom
          // styling / vector-map features later.
          mapId: "DEMO_MAP_ID",
        });
        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (modeRef.current.type === "arming" && event.latLng) {
            onMapClickRef.current([event.latLng.lng(), event.latLng.lat()]);
          }
        });

        mapRef.current = map;
        setReady(true);
      }
    );

    return () => {
      cancelled = true;
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Cursor for arming mode.
  useEffect(() => {
    mapRef.current?.setOptions({
      draggableCursor: mode.type === "arming" ? "crosshair" : null,
    });
  }, [mode.type, ready]);

  // Re-render markers whenever the location list changes.
  useEffect(() => {
    const map = mapRef.current;
    const libs = libsRef.current;
    if (!map || !libs) return;

    markersRef.current.forEach((marker) => (marker.map = null));
    markersRef.current = locations.map((location) => {
      const pin = new libs.PinElement({
        background: "#D9042B",
        borderColor: "#8f0320",
        glyphColor: "#8f0320",
      });
      const marker = new libs.AdvancedMarkerElement({
        map,
        position: { lat: location.point[1], lng: location.point[0] },
        content: pin.element,
        gmpClickable: true,
        title: location.name,
      });
      marker.addEventListener("gmp-click", () => onMarkerClickRef.current(location.id));
      return marker;
    });

    return () => {
      markersRef.current.forEach((marker) => (marker.map = null));
      markersRef.current = [];
    };
  }, [locations, ready]);

  // Draft marker for a not-yet-saved location.
  useEffect(() => {
    const map = mapRef.current;
    const libs = libsRef.current;
    if (!map || !libs || mode.type !== "draft") return;

    const pin = new libs.PinElement({
      background: "#10DFD3",
      borderColor: "#0a8f88",
      glyphColor: "#0a8f88",
    });
    const marker = new libs.AdvancedMarkerElement({
      map,
      position: { lat: mode.point[1], lng: mode.point[0] },
      content: pin.element,
    });
    draftMarkerRef.current = marker;

    return () => {
      marker.map = null;
      draftMarkerRef.current = null;
    };
  }, [mode, ready]);

  return <div ref={containerRef} className="h-full w-full" />;
}
