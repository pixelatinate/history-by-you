import { createSupabaseClient, MOCK_LOCATIONS, type LocationWithEntries } from "@history-by-you/db";

const supabase = createSupabaseClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Falls back to mock data until EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY are set
 * (see .env.example) and the migration in supabase/migrations has been run.
 */
export async function getLocations(): Promise<LocationWithEntries[]> {
  if (!supabase) return MOCK_LOCATIONS;

  const { data, error } = await supabase
    .from("locations")
    .select("*, entries:entries_with_score(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,
    point: parsePoint(row.point),
  })) as LocationWithEntries[];
}

function parsePoint(point: unknown): [number, number] {
  if (
    point &&
    typeof point === "object" &&
    "coordinates" in point &&
    Array.isArray((point as { coordinates: unknown }).coordinates)
  ) {
    const [lng, lat] = (point as { coordinates: [number, number] }).coordinates;
    return [lng, lat];
  }
  return [0, 0];
}
