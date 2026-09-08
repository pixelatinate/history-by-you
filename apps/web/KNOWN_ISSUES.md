# Known issues

## MapLibre tiles never render in dev (Turbopack)

`MapLibreCanvas` (the free, no-key fallback used when
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` isn't set) initializes correctly —
style loads, sources report loaded, markers work — but vector tiles sit
in `state: "loading"` forever, so nothing but the background color ever
paints.

Root cause: MapLibre GL parses tiles in a Web Worker, and under this
Next.js 16 / Turbopack dev server, the worker script request comes back
as an HTML error page instead of JS (`Failed to load module script: the
server responded with a non-JavaScript MIME type of "text/html"` in the
console — present since this scaffold's first commit, initially assumed
benign). With the worker dead, every tile request stalls indefinitely.
Confirmed by walking the live `maplibregl.Map` instance's internals
(`style.tileManagers.<source>._inViewTiles._tiles[*].state === "loading"`
after 10+ seconds) — the style and sources genuinely finish loading, only
tile parsing hangs.

Next.js's Turbopack docs mention a `turbopackWorkerAssetPrefix` config
option for exactly this class of problem (Web Worker asset URLs), which
is the first thing to try — untested here since the Google Maps path
(this app's primary map now) doesn't use this worker mechanism at all
and isn't affected. Also worth checking whether this reproduces under
`next build && next start` (production) or is dev/Turbopack-only, and
whether it reproduces on a bare `create-next-app` + `maplibre-gl` install
with no other code involved.
