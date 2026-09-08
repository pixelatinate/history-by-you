"use client";

import { createSupabaseClient } from "@history-by-you/db";

// Singleton browser client, shared by auth + mutations. Null until
// NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are set (see .env.example) — callers
// need to handle that (see useAuth's `enabled` flag).
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
