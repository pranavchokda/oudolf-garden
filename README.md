# Oudolf Garden — Native Plant Self-Guided Tour

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An interactive 2D garden map for the **Oudolf Garden**, a community-maintained native plant garden on DNR-leased land. Visitors scan QR codes on physical garden bed signs to open an interactive map on their phone, tap colored plant regions to learn about each species, and discover points of interest like bird nests and certified Monarch Waystations.

**Live site:** `https://pranavchokda.github.io/oudolf-garden/`

> **Attribution required.** This project is MIT licensed. If you use this codebase as the basis for your own garden map, your README must include a link back to this project — see [LICENSE](LICENSE) for the exact wording.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Managing Data](#managing-data)
  - [Adding a Plant](#adding-a-plant)
  - [Adding a Region to a Bed](#adding-a-region-to-a-bed)
  - [Adding a New Garden Bed](#adding-a-new-garden-bed)
  - [Editing Data Directly](#editing-data-directly)
- [Plant Photos](#plant-photos)
- [Bloom Calendar & Observations](#bloom-calendar--observations)
  - [How It Works](#how-it-works)
  - [Recording an Observation](#recording-an-observation)
  - [Bulk Importing Historical Data](#bulk-importing-historical-data)
- [QR Codes](#qr-codes)
- [References](#references)

---

## Features

- **Interactive SVG maps** — each garden bed is a scalable vector map with color-coded plant regions
- **Tap to explore** — tap any region to see the plant's common name, scientific name, bloom season, pollinators, native range, and garden notes
- **Field identification** — each plant has 3–4 distinguishing features to help visitors spot it in person
- **Wikipedia links** — every plant links to its Wikipedia article for deeper reading
- **Plant photos** — drop a photo into `public/plants/<id>.jpg` and it appears automatically; a botanical-style silhouette placeholder shows until then
- **Currently in bloom** — a banner and map glow highlight plants in bloom right now, based on the current month and 5 years of recorded observations
- **Bloom calendar** — a full-year grid shows every plant's bloom season at a glance
- **Points of interest** — bird nests, Monarch Waystations, native bee houses, and more overlaid as emoji markers
- **Color legend** — clickable legend at the bottom lists every plant in the current bed
- **Mobile-first** — optimized for phones (the primary QR-code audience); also works on desktop with a side panel
- **QR-code ready** — each bed has a deep-link URL suitable for generating a QR code
- **Script-driven data** — add plants, regions, beds, and bloom observations via `npm run` commands without touching the React code

---

## Project Structure

```
oudolf-garden/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploys to GitHub Pages on push to main
│
├── scripts/                    # Data management CLI scripts (run via npm)
│   ├── add-plant.ts            # Add a plant to the shared plant library
│   ├── add-region.ts           # Add a polygon region to a garden bed
│   └── add-bed.ts              # Scaffold a new garden bed JSON file
│
├── src/
│   ├── components/
│   │   ├── GardenMap.tsx       # SVG map — renders regions, walkways, feature markers
│   │   ├── Legend.tsx          # Clickable color legend (one entry per unique plant)
│   │   └── PlantPanel.tsx      # Plant / feature detail panel (bottom sheet on mobile)
│   │
│   ├── data/
│   │   ├── plants.json         # Shared plant library — all 20 native species
│   │   └── beds/
│   │       ├── index.ts        # Exports allBeds[] — wire new beds here
│   │       └── bed-01.json     # Prairie Meadow Bed data
│   │
│   ├── pages/
│   │   ├── HomePage.tsx        # Grid of all beds with mini-map previews
│   │   └── BedPage.tsx         # Full bed view with map, legend, and detail panel
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript types: Plant, GardenBed, PlantRegion, etc.
│   │
│   ├── App.tsx                 # HashRouter + Routes
│   ├── index.css               # Tailwind CSS entry
│   └── main.tsx                # React entry point
│
├── public/
│   └── leaf.svg                # Favicon
│
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.node.json
├── tsconfig.json
└── vite.config.ts
```

### Key data files

| File | Purpose |
|---|---|
| `src/data/plants.json` | Plant library. Each entry has id, names, description, bloom season, pollinators, hex color, tags, distinguishing features, `imageUrl`, and `wikiUrl`. |
| `src/data/beds/bed-01.json` | Garden bed layout: SVG `viewBox`, boundary polygon, walkway polygons, plant regions (SVG polygons), and feature markers. |
| `src/data/beds/index.ts` | Single place to register all beds. Adding a new bed = one import + one array push. |
| `src/data/observations/bed-01.json` | Monthly bloom observations for Bed 1 (2021–2025). Used to compute historical bloom rates and show "in bloom now" status. |
| `src/data/observations/index.ts` | Aggregates all observation records; add new bed observations here. |
| `src/hooks/useBloomCalendar.ts` | Hook that computes bloom status for every plant in the current month from stated seasons + historical observations. |
| `public/plants/` | Drop plant photos here as `<plant-id>.jpg` (e.g. `purple-coneflower.jpg`). They load automatically with no code changes. |

---

## Installation

**Requirements:** Node.js 18+, npm 9+

```bash
git clone https://github.com/pranavchokda/oudolf-garden.git
cd oudolf-garden
npm install
```

---

## Running Locally

```bash
npm run dev
```

Opens at `http://localhost:5173/`. The map is fully interactive in the browser — no build step needed for development.

To stop the server, press **`Ctrl + C`** in the terminal where it is running.

If the process is running in the background and `Ctrl + C` is not available, kill it by port:

```bash
# macOS / Linux
pkill -f "vite"

# Or kill whatever is on port 5173
lsof -ti :5173 | xargs kill
```

---

## Deploying to GitHub Pages

### Automatic (recommended)

Push to `main`. The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the project and publishes the `dist/` folder to the `gh-pages` branch automatically.

**One-time setup:**
1. In your GitHub repo → Settings → Pages → set Source to **Deploy from a branch** → branch: `gh-pages`
2. If your repository name differs from `oudolf-garden`, update `VITE_BASE_URL` in `deploy.yml`:
   ```yaml
   env:
     VITE_BASE_URL: /your-repo-name/
   ```

### Manual

```bash
npm run deploy
```

This builds the project and pushes `dist/` to `gh-pages` using the `gh-pages` npm package.

---

## Managing Data

All data lives in plain JSON files. You can edit them directly or use the provided scripts for common operations.

### Adding a Plant

```bash
npm run add-plant -- \
  --id wild-lupine \
  --common "Wild Lupine" \
  --scientific "Lupinus perennis" \
  --family Fabaceae \
  --color "#6366F1" \
  --description "Vivid blue-purple spikes host the Karner Blue butterfly..." \
  --native "Eastern North America" \
  --bloom-start May --bloom-end July \
  --height "1–2 feet" \
  --sun "Full sun" \
  --water "Low to medium" \
  --pollinators "bumblebees,Karner Blue butterfly" \
  --tags "nitrogen-fixer,butterfly-host,spring-bloomer"
```

The plant is added to `src/data/plants.json`. It won't appear on any map until you add a region for it (see below).

**Choosing a color:** pick a hex color that is visually distinct from existing plant colors. Open `src/data/plants.json` to see colors already in use.

### Adding a Region to a Bed

A region is a polygon drawn on the SVG map that represents an area where a group of plants is growing.

Regions support three shapes — **polygon**, **circle**, and **ellipse**:

```bash
# Polygon (default) — freeform shape defined by coordinate pairs
npm run add-region -- \
  --bed bed-01 --id n07 --plant wild-lupine --shape polygon \
  --points "600,0 720,0 710,95 690,230 580,230 600,120" \
  --label "Wild Lupine Drift" --notes "8 plants, planted spring 2025"

# Circle — center point + radius
npm run add-region -- \
  --bed bed-01 --id n08 --plant prairie-smoke --shape circle \
  --cx 200 --cy 150 --r 60 \
  --label "Prairie Smoke Pocket"

# Ellipse — center, x-radius, y-radius, optional rotation in degrees
npm run add-region -- \
  --bed bed-01 --id n09 --plant shooting-star --shape ellipse \
  --cx 400 --cy 100 --rx 90 --ry 45 --rotation 20 \
  --label "Shooting Star Drift"
```

**Finding coordinates:** open the bed page in your browser, open DevTools, and inspect the SVG element. The `viewBox` dimensions are in the bed's JSON file (e.g., `"0 0 800 520"`). All coordinates are in SVG units within that box.

**Non-overlapping polygons:** polygon regions should tile without gaps or overlaps for a clean map. Shared edges must use the same coordinates. Circles and ellipses can be used for smaller accent plantings that sit on top of a background polygon.

### Adding a New Garden Bed

```bash
npm run add-bed -- \
  --id bed-02 \
  --name "Woodland Edge Bed" \
  --description "Shade-tolerant natives along the treeline." \
  --width 700 \
  --height 450
```

This creates `src/data/beds/bed-02.json` with a boundary polygon, a centered walkway, and empty regions/features arrays.

**Then wire it up in `src/data/beds/index.ts`:**

```typescript
import bed01 from './bed-01.json';
import bed02 from './bed-02.json';  // ← add this

export const allBeds: GardenBed[] = [
  bed01 as GardenBed,
  bed02 as GardenBed,  // ← add this
];
```

The new bed will appear on the home page immediately.

### Editing Data Directly

All JSON files are human-readable and can be edited by hand. The TypeScript types in `src/types/index.ts` document every field:

- **`PlantRegion.polygon`** — array of `[x, y]` pairs forming a closed polygon in SVG coordinates
- **`GardenFeature.position`** — `[x, y]` center of the circular marker
- **`GardenFeature.type`** — one of: `bird_nest`, `butterfly_waystation`, `bee_hive`, `water_feature`, `bench`, `sign`
- **`Plant.color`** — hex string used for the region fill and legend swatch

---

---

## Plant Photos

Plant photos live in the `public/plants/` directory. The filename must match the plant's `id` field in `plants.json`:

```
public/
└── plants/
    ├── purple-coneflower.jpg
    ├── black-eyed-susan.jpg
    ├── wild-bergamot.jpg
    └── ...
```

**Supported formats:** `.jpg`, `.jpeg`, `.png`, `.webp` — update the `imageUrl` field in `plants.json` to use `.png` or `.webp` if needed (the component uses `imageUrl` first, then falls back to `/plants/<id>.jpg`).

**Recommended photo specs:**
- Landscape or square crop, minimum 600 × 400 px
- Show the plant in bloom with identifying features visible
- Photo credit can be stored in the optional `photoCredit` field (currently not rendered but available for future use)

**External photos:** Set `imageUrl` in `plants.json` to any `https://` URL to use a hosted image. Make sure the source permits hotlinking and that the image is stable.

Until a photo is provided, the app shows a botanical-style SVG silhouette placeholder in the plant's color.

---

## Bloom Calendar & Observations

### How It Works

The "currently in bloom" feature uses two data sources:

1. **Stated bloom season** — the `bloomSeason` field in `plants.json` (e.g., `["June", "September"]`) defines the expected range.
2. **Historical observations** — monthly records in `src/data/observations/bed-01.json` capture what volunteers actually observed each year (2021–2025).

The `useBloomCalendar` hook merges both sources:
- A plant is shown as "in bloom now" if the current month falls within its stated season **or** if ≥50% of historical observations for this month show a non-"not_blooming" status.
- The plant panel shows a historical rate bar (e.g., "80% of years recorded this month").

### Recording an Observation

After each monthly garden walk, record what you observed:

```bash
npm run add-observation -- \
  --bed bed-01 \
  --plant purple-coneflower \
  --year 2026 \
  --month 7 \
  --status peak \
  --notes "Dense bloom, several goldfinches feeding on seed heads." \
  --observer "MK"
```

**Status values:**

| Value | Meaning |
|---|---|
| `not_blooming` | No flowers; plant present but dormant or past season |
| `budding` | Flower buds visible but not yet open |
| `peak` | Full, open bloom |
| `fading` | Flowers past peak; seed heads forming |

### Bulk Importing Historical Data

Edit `src/data/observations/bed-01.json` directly. The format is:

```json
{
  "bedId": "bed-01",
  "description": "...",
  "observations": [
    {
      "year": 2026,
      "month": 6,
      "plantId": "purple-coneflower",
      "bedId": "bed-01",
      "status": "peak",
      "notes": "Optional free text.",
      "observer": "Initials or name — optional"
    }
  ]
}
```

To add observations for a new bed, create `src/data/observations/bed-02.json` following the same format, then import it in `src/data/observations/index.ts`:

```typescript
import bed02Obs from './bed-02.json';
export const allObservations = [..., bed02Obs as BedObservationRecord];
```

---

## QR Codes

Each garden bed has a stable deep-link URL:

```
https://pranavchokda.github.io/oudolf-garden/#/bed/<bed-id>
```

For example:
- **Bed 1:** `https://pranavchokda.github.io/oudolf-garden/#/bed/bed-01`
- **Bed 2:** `https://pranavchokda.github.io/oudolf-garden/#/bed/bed-02`

Generate a QR code from any of these URLs using a free tool such as [qr-code-generator.com](https://www.qr-code-generator.com/) or the `qrcode` npm package:

```bash
npx qrcode "https://pranavchokda.github.io/oudolf-garden/#/bed/bed-01" -o qr-bed-01.png
```

Print the QR code and laminate it on a weatherproof sign at the corresponding garden bed.

---

## References

- **[Piet Oudolf](https://www.oudolf.com/)** — Dutch landscape designer whose naturalistic planting philosophy, using native and prairie plants in sweeping drifts, inspired the garden's design approach.
- **[Prairie Moon Nursery](https://www.prairiemoon.com/)** — Source for native plant identification, growing information, and regional seed mixes referenced in plant descriptions.
- **[National Wildlife Federation — Monarch Waystation Program](https://www.nwf.org/garden-for-wildlife/certify)** — Certification program for Monarch butterfly habitat referenced in the garden's waystation feature.
- **[Wildflower Center — Native Plant Database](https://www.wildflower.org/plants/)** — Lady Bird Johnson Wildflower Center database used for native range and ecological data.
- **[mujoco-garage](https://github.com/pranavchokda/mujoco-garage)** — Reference project that inspired the Vite + React + GitHub Pages project structure used here.
- **[Claude Code](https://claude.ai/code) by [Anthropic](https://www.anthropic.com/)** — AI coding assistant used to scaffold and build the initial version of this project.
