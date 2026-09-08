import { supabase } from "./supabaseClient";
import type { Entry, LocationWithEntries } from "@history-by-you/db";

export async function createLocationWithEntry(params: {
  name: string;
  point: [number, number]; // [lng, lat]
  body: string;
  userId: string;
}): Promise<LocationWithEntries> {
  if (!supabase) throw new Error("Supabase isn't connected yet.");

  const { data: location, error: locationError } = await supabase
    .from("locations")
    .insert({
      name: params.name,
      lng: params.point[0],
      lat: params.point[1],
      created_by: params.userId,
    })
    .select()
    .single();
  if (locationError) throw locationError;

  const entry = await addEntry({
    locationId: location.id,
    body: params.body,
    userId: params.userId,
  });

  return { ...location, point: params.point, entries: [entry] };
}

export async function addEntry(params: {
  locationId: string;
  body: string;
  userId: string;
}): Promise<Entry> {
  if (!supabase) throw new Error("Supabase isn't connected yet.");

  const { data, error } = await supabase
    .from("entries")
    .insert({
      location_id: params.locationId,
      author_id: params.userId,
      body: params.body,
    })
    .select()
    .single();
  if (error) throw error;

  // Freshly created, so it has no votes yet.
  return { ...data, score: 0 };
}
