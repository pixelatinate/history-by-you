import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared Supabase client factory used by both apps/web and apps/mobile.
 * Each app passes in its own env vars (Next.js uses NEXT_PUBLIC_*, Expo
 * uses EXPO_PUBLIC_*) since the two frameworks expose env vars differently.
 *
 * Returns null when no credentials are configured yet, so callers can fall
 * back to mock data (see mock.ts) until a real Supabase project is wired up.
 */
export function createSupabaseClient(
  url: string | undefined,
  anonKey: string | undefined
): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}
