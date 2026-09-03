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
   Project URL and anon key from Project Settings → API.
4. Restart both apps — they'll switch from mock data to live queries
   automatically (see `lib/data.ts` in each app).

## What changed from the original

The original was PHP + MySQL on UTK's personal web hosting, with anonymous
free-text posting and mutable vote counters. This version:

- adds real user accounts (Supabase Auth) instead of anonymous free-text names
- uses a proper `geography` column (PostGIS) instead of separate lat/lng floats
- enforces access with row-level security instead of trusting the client
- ships an iOS app alongside the web app, sharing the same backend

**Security note:** the original code (kept locally, not in this repo) had a
teammate's database password and two Google Maps API keys hardcoded in
plaintext. Neither is reused here — this rebuild uses Supabase's row-level
security instead of a shared server password, and MapLibre's free demo tiles
instead of a Google Maps key for now (see the note in `components/Map.tsx`
about swapping to a production tile provider before shipping).

## Roadmap

- [ ] Connect a real Supabase project (see above)
- [ ] Add auth (sign in, so entries have real authors)
- [ ] "Add a location" / "add an entry" flows on both apps (the original's
      pencil/plus/search toolbar)
- [ ] Swap MapLibre's demo style for a production tile provider
- [ ] Deploy web to Vercel, point history-by-you.com at it
- [ ] TestFlight build for the iOS app

## License

MIT — see [LICENSE](LICENSE). Original concept and 2022 prototype credited to
the team above.
