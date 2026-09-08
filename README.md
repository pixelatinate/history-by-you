# History By You

A collaborative map of local history — the story behind the park next door,
told by the people who live there. This is a rebuild of a [UTK CS340 group
project](https://web.utk.edu/~jmalloy1/HistoryByYou/) originally built with
Jacob Malloy, Katie Nuchols, Nik Bergman, and Taegun Harshbarger. The original
site's hosting and GitHub repo are gone; this is a fresh codebase, kept alive
solo, as a web app and an iOS app sharing one backend.

## Stack

- **apps/web** — Next.js (App Router) + Tailwind, deployed to Vercel
- **apps/mobile** — Expo / React Native, for iOS (and Android for free)
- **packages/db** — shared TypeScript types + Supabase client, used by both apps
- **supabase/** — the Postgres schema (with PostGIS for location data) and
  row-level-security policies backing both apps

Until a real Supabase project is connected, both apps render the sample data
in [`packages/db/src/mock.ts`](packages/db/src/mock.ts) so there's always
something to look at.

## Getting started

```bash
npm install
```

### Run the web app

```bash
npm run web        # http://localhost:3000
```

### Run the mobile app

```bash
npm run mobile      # opens Expo Dev Tools; press i for the iOS simulator
```

### Connect a real backend (optional at first)

1. Create a free project at [supabase.com](https://supabase.com/dashboard).
2. In the SQL Editor, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. Copy `apps/web/.env.example` → `apps/web/.env.local` and
   `apps/mobile/.env.example` → `apps/mobile/.env.local`, filling in the
   Project URL and **publishable** (anon) key from Project Settings → API
   → API Keys. Never use the **secret** key here — it bypasses row-level
   security and belongs server-side only (this app has no server-side use
   for it at all).
4. Restart both apps — they'll switch from mock data to live queries
   automatically (see `lib/data.ts` in each app).

### Map tiles (optional)

`apps/web` renders with [OpenFreeMap](https://openfreemap.org) by default —
free, no key, no billing account. To use Google Maps instead (closer to the
original project's look):

1. In [Google Cloud Console](https://console.cloud.google.com), enable the
   **Maps JavaScript API** and create an API key.
2. Restrict it immediately: **Application restrictions** → HTTP referrers →
   your dev/prod URLs; **API restrictions** → Maps JavaScript API only. The
   original project's exposed, unrestricted key is exactly what this avoids.
3. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `apps/web/.env.local`.

Leave it unset and OpenFreeMap keeps working with no setup.

**Known issue:** OpenFreeMap tiles currently don't render in local dev — see
[`apps/web/KNOWN_ISSUES.md`](apps/web/KNOWN_ISSUES.md). Google Maps isn't
affected.

## What changed from the original

The original was PHP + MySQL on UTK's personal web hosting, with anonymous
free-text posting and mutable vote counters. This version:

- adds real user accounts (Supabase magic-link auth) instead of anonymous
  free-text names
- enforces access with row-level security instead of trusting the client
- ships an iOS app alongside the web app, sharing the same backend

**Security note:** the original code (kept locally, not in this repo) had a
teammate's database password and two Google Maps API keys hardcoded in
plaintext. Neither is reused here — this rebuild uses Supabase's row-level
security instead of a shared server password, and if you do add a Google
Maps key (see "Map tiles" above), restrict it to specific referrers and
APIs instead of leaving it wide open like the original's.

## Roadmap

- [x] Connect a real Supabase project (see above)
- [x] Add auth (sign in, so entries have real authors) — web only so far
- [x] "Add a location" / "add an entry" flows — web only so far (the
      original's pencil/plus/search toolbar, consolidated into one flow)
- [ ] Same sign-in / add-location / add-entry flows on the mobile app
      (currently read-only)
- [ ] Deploy web to Vercel, point history-by-you.com at it
- [ ] TestFlight build for the iOS app

## License

MIT — see [LICENSE](LICENSE). Original concept and 2022 prototype credited to
the team above.
