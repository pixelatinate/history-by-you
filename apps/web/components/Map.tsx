"use client";

import { useState } from "react";
import type { LocationWithEntries } from "@history-by-you/db";
import { useAuth } from "@/lib/useAuth";
import { addEntry, createLocationWithEntry } from "@/lib/mutations";
import { GoogleMapCanvas } from "./GoogleMapCanvas";
import { MapLibreCanvas } from "./MapLibreCanvas";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export type Mode = { type: "idle" } | { type: "arming" } | { type: "draft"; point: [number, number] };

export function Map({ locations: initialLocations }: { locations: LocationWithEntries[] }) {
  const { user, enabled: authEnabled } = useAuth();
  const [locations, setLocations] = useState(initialLocations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ type: "idle" });

  const selected = locations.find((location) => location.id === selectedId) ?? null;

  function handleMapClick(point: [number, number]) {
    setSelectedId(null);
    setMode({ type: "draft", point });
  }

  function handleMarkerClick(id: string) {
    setMode({ type: "idle" });
    setSelectedId(id);
  }

  return (
    <div className="relative h-full w-full">
      {GOOGLE_MAPS_API_KEY ? (
        <GoogleMapCanvas
          apiKey={GOOGLE_MAPS_API_KEY}
          locations={locations}
          mode={mode}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
        />
      ) : (
        <MapLibreCanvas
          locations={locations}
          mode={mode}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
        />
      )}

      <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
        {!authEnabled && (
          <p className="max-w-56 rounded bg-white/90 px-3 py-2 text-xs text-zinc-600 shadow dark:bg-black/80 dark:text-zinc-400">
            Connect Supabase to add locations — see the README.
          </p>
        )}
        {authEnabled && !user && (
          <p className="max-w-56 rounded bg-white/90 px-3 py-2 text-xs text-zinc-600 shadow dark:bg-black/80 dark:text-zinc-400">
            Sign in (top right) to add a location.
          </p>
        )}
        {authEnabled && user && (
          <button
            onClick={() => {
              setSelectedId(null);
              setMode((current) => (current.type === "arming" ? { type: "idle" } : { type: "arming" }));
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium shadow ${
              mode.type === "arming"
                ? "bg-[#D9042b] text-white"
                : "bg-white text-black dark:bg-zinc-900 dark:text-white"
            }`}
          >
            {mode.type === "arming" ? "Click the map to place a pin…" : "+ Add a location"}
          </button>
        )}
      </div>

      {selected && (
        <LocationPanel
          location={selected}
          canPost={Boolean(user)}
          onClose={() => setSelectedId(null)}
          onEntryAdded={(entry) =>
            setLocations((current) =>
              current.map((location) =>
                location.id === selected.id
                  ? { ...location, entries: [entry, ...location.entries] }
                  : location
              )
            )
          }
        />
      )}

      {mode.type === "draft" && user && (
        <NewLocationPanel
          point={mode.point}
          userId={user.id}
          onCancel={() => setMode({ type: "idle" })}
          onCreated={(location) => {
            setLocations((current) => [location, ...current]);
            setMode({ type: "idle" });
            setSelectedId(location.id);
          }}
        />
      )}
    </div>
  );
}

function LocationPanel({
  location,
  canPost,
  onClose,
  onEntryAdded,
}: {
  location: LocationWithEntries;
  canPost: boolean;
  onClose: () => void;
  onEntryAdded: (entry: LocationWithEntries["entries"][number]) => void;
}) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="absolute bottom-0 right-0 top-0 flex w-full max-w-sm flex-col gap-3 overflow-y-auto border-l border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black sm:top-3 sm:bottom-3 sm:right-3 sm:rounded-lg sm:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold">{location.name}</h2>
        <button onClick={onClose} className="text-zinc-500" aria-label="Close">
          ✕
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {location.entries.length === 0 && (
          <p className="text-sm text-zinc-500">No entries yet.</p>
        )}
        {location.entries.map((entry) => (
          <div key={entry.id} className="rounded border border-black/10 p-3 text-sm dark:border-white/10">
            <p>{entry.body}</p>
            <p className="mt-1 text-xs text-zinc-500">score: {entry.score}</p>
          </div>
        ))}
      </div>

      {canPost && user && (
        <form
          className="flex flex-col gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            setSubmitting(true);
            try {
              const entry = await addEntry({ locationId: location.id, body, userId: user.id });
              onEntryAdded(entry);
              setBody("");
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <textarea
            required
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="What do you know about this place?"
            rows={3}
            className="rounded border border-black/10 p-2 text-sm dark:border-white/10 dark:bg-black"
          />
          <button
            type="submit"
            disabled={submitting}
            className="self-start rounded bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {submitting ? "Posting…" : "Add entry"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}

function NewLocationPanel({
  point,
  userId,
  onCancel,
  onCreated,
}: {
  point: [number, number];
  userId: string;
  onCancel: () => void;
  onCreated: (location: LocationWithEntries) => void;
}) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="absolute bottom-0 right-0 top-0 flex w-full max-w-sm flex-col gap-3 overflow-y-auto border-l border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black sm:top-3 sm:bottom-3 sm:right-3 sm:rounded-lg sm:shadow-lg"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
          const location = await createLocationWithEntry({ name, point, body, userId });
          onCreated(location);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <h2 className="text-lg font-semibold">New location</h2>
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          required
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Ayres Hall"
          className="rounded border border-black/10 p-2 dark:border-white/10 dark:bg-black"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        First entry
        <textarea
          required
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What do you know about this place?"
          rows={4}
          className="rounded border border-black/10 p-2 dark:border-white/10 dark:bg-black"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="rounded px-3 py-1.5 text-sm">
          Cancel
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
