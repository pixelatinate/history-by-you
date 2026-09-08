"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

/**
 * Tracks the signed-in Supabase user, via magic-link email auth (no
 * passwords — there's no separate account system to manage). `enabled` is
 * false until a Supabase project is connected, so callers can hide
 * write-flow UI without a confusing broken sign-in form.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // No effect needed to know this up front — whether Supabase is connected
  // is static for the life of the page.
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return { user, loading, enabled: Boolean(supabase) };
}
