# WatchPaper

Wallpapers that match the watch on your wrist. Famous dials reduced to pure
texture and colour — no logos, no indices, no hands — sized for your lock screen.

## How it works

- Pick the watches you own (stored in `localStorage`, no account).
- Tap the one you're wearing today; the preview shows it under a live lock-screen clock.
- Save renders a PNG client-side from the vector master at your device's exact
  resolution (Web Share sheet on iOS → "Save Image"; direct download elsewhere).
- **Photo studio** (`/studio`): photograph your own watch, frame the dial, and the
  app extracts its palette on-device (k-means; the photo never leaves the phone),
  then draws a bespoke wallpaper in any of the seven finish families.
- **One-tap set (iOS Shortcuts)**: a one-time two-action Shortcut (Get Contents of
  URL → Set Wallpaper Photo) lets the app set your lock screen in a single tap via
  `/api/wallpaper`, and supports Time-of-Day automations.

## API

    GET /api/wallpaper?dial=octagon-bleu&w=1179&h=2556
    GET /api/wallpaper?family=sunray&colors=143723,3ca463&w=1179&h=2556

Server-rendered PNG (resvg), cover-cropped to the requested size, cached immutable.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · no database, no tracking.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Design tooling

`design/` holds the parametric wallpaper generator:

- `lib/generator.ts` — the single source of truth: seven palette-driven finish
  families render the built-ins, the photo-derived custom dials, and the server
  PNGs. Masters are 1320 × 2868.
- `npx tsx scripts/gen-dials.ts` regenerates `public/dials/` from it
  (byte-identical check: `git diff public/dials/`).
- `npx tsx scripts/test-resvg.ts` pixel-tests server rendering against browser
  references.
- `design/` holds the original Node design study (`gen.js`, `gallery.html`).

Dial metadata (names, pairings, families) lives in `lib/dials.ts`.

## On the naming

Wallpapers are original artworks inspired by dial *finishes* (guilloché,
embossing, sunray brushing, lacquer, silvered relief). Watch model names are
used solely to identify which watch a wallpaper pairs with; WatchPaper is not
affiliated with, or endorsed by, any watchmaker. Keep brand names out of any
app-store metadata and marketing copy.
