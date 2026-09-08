import { createSupabaseClient, MOCK_LOCATIONS, type LocationWithEntries } from "@history-by-you/db";

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Falls back to mock data until NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are set
 * (see .env.example) and the migration in supabase/migrations has been run.
 */
export async function getLocations(): Promise<LocationWithEntries[]> {
  if (!supabase) return MOCK_LOCATIONS;

  const { data, error } = await supabase
    .from("locations")
    .select("*, entries:entries_with_score(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(({ lat, lng, ...row }) => ({
    ...row,
    point: [lng, lat] as [number, number],
  })) as LocationWithEntries[];
}
