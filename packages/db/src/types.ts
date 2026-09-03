// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Once the Supabase project exists, replace this file with generated types:
//   npx supabase gen types typescript --project-id <ref> > packages/db/src/types.ts

export interface Location {
  id: string;
  name: string;
  /** [longitude, latitude] */
  point: [number, number];
  created_by: string | null;
  created_at: string;
}

export interface Entry {
  id: string;
  location_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
  score: number;
}

export interface LocationWithEntries extends Location {
  entries: Entry[];
}
