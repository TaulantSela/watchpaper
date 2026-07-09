# WatchPaper

Wallpapers that match the watch on your wrist. Famous dials reduced to pure
texture and colour — no logos, no indices, no hands — sized for your lock screen.

## How it works

- Pick the watches you own (stored in `localStorage`, no account).
- Tap the one you're wearing today; the preview shows it under a live lock-screen clock.
- Save renders a PNG client-side from the vector master at your device's exact
  resolution (Web Share sheet on iOS → "Save Image"; direct download elsewhere).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · no database, no tracking.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Design tooling

`design/` holds the parametric wallpaper generator:

- `design/gen.js` — generates the dial-texture SVGs (Node, zero deps). Every
  colour and geometry value is a tunable parameter; masters are 1320 × 2868.
- `design/build_gallery.js` — builds the standalone `gallery.html` study page.
- Regenerate and refresh the app's dials:

```bash
node design/gen.js && cp design/out/*.svg public/dials/
```

Dial metadata (names, pairings, families) lives in `lib/dials.ts`.

## On the naming

Wallpapers are original artworks inspired by dial *finishes* (guilloché,
embossing, sunray brushing, lacquer, silvered relief). Watch model names are
used solely to identify which watch a wallpaper pairs with; WatchPaper is not
affiliated with, or endorsed by, any watchmaker. Keep brand names out of any
app-store metadata and marketing copy.
