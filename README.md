# Dinkytown Through Time

A browser-only, slightly-3D historical map of Dinkytown (Minneapolis) with a year slider
from 1885 to today. Buildings, occupants, streets, streetcar tracks, and the rail corridor
appear and disappear by date. Click a building for its occupant timeline and nearest-year photo.

**Status: milestone 1.** The app works end to end, but all geometry is schematic and most
occupants are placeholders. See [PLAN.md](PLAN.md) for the research plan and estimates.

## Run it

```bash
npm install
npm run dev        # generates fonts + data bundle, then starts Vite at http://localhost:5173
npm test           # temporal logic + data validation
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ locally
```

Deployment: `.github/workflows/pages.yml` builds and publishes `dist/` to GitHub Pages on every
push to `main` (enable Pages with the "GitHub Actions" source in the repo settings first).

## Saved views

Every five years from 1885, plus **1984** (added by request). The gold tick on the slider marks
1984; "snap to saved views" jumps between them. Arrow keys step one year; Shift+arrow jumps
between saved views; Space plays.

## Data

Source-of-truth files live in `data/` and are compiled into `public/data/bundle.json` by
`npm run data` (also run automatically by `dev` and `build`). The validator fails the build on
unknown building ids, unknown source ids, overlapping occupants in one unit, and bad intervals.

| File | Holds |
|---|---|
| `data/buildings.geojson` | One polygon per building: built/demolished year, stories, material, confidence, sources |
| `data/tenants.csv` | Occupants with start/end year, unit, category, confidence, sources |
| `data/photos.csv` | Photos with year, credit, rights (`public-domain`, `permission-granted`, `link-only`) |
| `data/sources.csv` | Citations referenced by id everywhere else |
| `data/keyframes.json` | The saved-view years and a confidence note per keyframe |

Interval rule: a record applies from `start_year` up to but not including `end_year`.
A building with `demolished_year: 2013` is absent in the 2013 view.

`scripts/make-placeholder-data.mjs` generated the current footprints from a local grid around
14th Ave SE and 4th St SE. Replace `buildings.geojson` and `features.geojson` with QGIS-traced
geometry from Sanborn sheets and Hennepin County parcels, then delete that script.

## Stack

Vite + TypeScript, MapLibre GL JS (own GeoJSON layers, no tile subscription), self-hosted glyphs
generated from Open Sans at build time, Vitest. No backend.
