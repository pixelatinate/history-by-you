import type { LocationWithEntries } from "./types";

// Sample data so both apps render something meaningful before a real
// Supabase project is connected. Centered on UTK's campus, matching the
// original project's origin. Swap for a real query once env vars are set
// (see the root README).
export const MOCK_LOCATIONS: LocationWithEntries[] = [
  {
    id: "mock-1",
    name: "Ayres Hall",
    point: [-83.9296, 35.9544],
    created_by: null,
    created_at: "2022-09-01T00:00:00Z",
    entries: [
      {
        id: "mock-1-entry-1",
        location_id: "mock-1",
        author_id: null,
        body: "Completed in 1921, Ayres Hall is UT's most recognizable building — its checkerboard-patterned tower is visible across campus.",
        created_at: "2022-09-01T00:00:00Z",
        score: 4,
      },
    ],
  },
  {
    id: "mock-2",
    name: "World's Fair Park",
    point: [-83.9226, 35.9614],
    created_by: null,
    created_at: "2022-09-01T00:00:00Z",
    entries: [
      {
        id: "mock-2-entry-1",
        location_id: "mock-2",
        author_id: null,
        body: "Site of the 1982 World's Fair. The Sunsphere still stands as its landmark today.",
        created_at: "2022-09-01T00:00:00Z",
        score: 2,
      },
    ],
  },
];
