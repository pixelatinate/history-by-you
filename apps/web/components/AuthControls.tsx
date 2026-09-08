"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";

export function AuthControls() {
  const { user, loading, enabled } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled) {
    return <p className="text-xs text-zinc-500">Connect Supabase to sign in.</p>;
  }
  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-zinc-500">{user.email}</span>
        <button
          onClick={() => supabase!.auth.signOut()}
          className="underline decoration-dotted underline-offset-2"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (sent) {
    return <p className="text-sm text-zinc-500">Check {email} for a sign-in link.</p>;
  }

  return (
    <form
      className="flex items-center gap-2 text-sm"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        const { error } = await supabase!.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.href },
        });
        if (error) setError(error.message);
        else setSent(true);
      }}
    >
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="rounded border border-black/10 px-2 py-1 dark:border-white/10 dark:bg-black"
      />
      <button
        type="submit"
        className="rounded bg-black px-3 py-1 font-medium text-white dark:bg-white dark:text-black"
      >
        Sign in
      </button>
      {error && <span className="text-red-600">{error}</span>}
    </form>
  );
}
