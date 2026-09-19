# Dinkytown Through Time — Project Plan

A browser-only web app that shows a stylized, slightly-3D top-down map of Dinkytown
(Minneapolis, MN) at any date from the district's beginnings to today. A year slider
and date input change the scene; buildings, business labels, streets, and rail lines
appear, change, and disappear according to the chosen date. Clicking a building shows
a period photograph nearest that year.

This document covers: what the research turned up, a recommended scope, the data
model, the technical architecture, a task breakdown with hour estimates, a rough
token/dollar ballpark, and risks.

---

## 1. Short answer to "is 5-year granularity realistic?"

**Yes for the commercial core, with a caveat on one era.** The good news is that you
do not actually research 29 separate snapshots. You research each *building* once and
record its timeline (built, altered, tenants with date ranges, demolished). The
5-year "saved views" are then computed from those timelines, not hand-built. This is
both less work and more honest than snapshot-by-snapshot research.

Source coverage by era (for the ~35-property historic district core):

| Era | Building footprints/heights | Business tenants | Photos | Confidence |
|---|---|---|---|---|
| 1885–1912 | Sanborn fire-insurance maps (1885, 1912) | City directories (annual, digitized 1859–1963) | Sparse | Medium |
| 1912–1930 | Sanborn 1912 base, corrected through 1930; building permit cards (1884–1973) | City directories | Newspaper photo morgue (1910–1950) | High |
| 1930–1963 | Aerials from 1938 onward; 1950s Sanborn edition; permit cards | City directories to 1963 | Newspaper morgue, UMN archives | High |
| **1964–2005** | Aerials; permit cards to 1973; Hennepin parcel "year built" | **Gap**: directories on microfilm only; Minnesota Daily ads; Dinkytown Business Alliance records (1983–2017); Huntzicker's book | Star Tribune archive, UMN archives, private collections | **Low–Medium** |
| 2005–2026 | Parcel data, OpenStreetMap, city permits | Wayback Machine, Google Street View (2007+), news coverage | Abundant | High |

So: building-level accuracy is strong back to about 1900 and tenant-level accuracy is
actually *annual* (better than 5-year) up to 1963. The real research cost is the
1964–2005 tenant gap, which needs microfilm sessions or the Minnesota Daily archive.
Housing outside the four commercial blocks is a second, larger tier of work.

**Recommended start year: 1885** (first Minneapolis Sanborn atlas; verify it covers
4th St SE / 14th Ave SE). If it does not, start at **1900**. The horse-drawn streetcar
reached the area in 1875 and the University's Old Main dates to 1858, so an optional
"pre-1885" view could be a sketch rather than a data-backed snapshot. Note the name
"Dinkytown" is only firmly attested from the 1940s (the Dinkytown Business Association
formed in 1948); before that the area was simply the University commercial district.
The historic district's period of significance is 1899–1972.

---

## 2. What the research found (sources you will actually use)

**Geometry and building facts**
- Sanborn fire-insurance maps of Minneapolis: 1885 and 1912 editions, the 1912 base
  corrected through 1930, and 1950s editions. Available via Hennepin County Library
  (HCL) Digital Collections and the ProQuest Digital Sanborn service with an HCL card;
  pre-1930 sheets are public domain and the Library of Congress hosts some Minneapolis
  volumes. Give footprint, stories, construction material, and use.
- Minneapolis Building Permit Index Cards, 1884–1973, fully digitized at HCL and
  searchable by address. Give year built, alterations, and wrecking permits.
- Minnesota Historical Aerial Photographs Online (MHAPO, UMN Borchert Map Library):
  Minneapolis aerials from 1938 onward, free. Excellent for 1938–2000 footprints and
  the rail corridor.
- Hennepin County GIS open data: current parcels and building footprints with "year
  built". Starting geometry for every building that still stands.
- Dinkytown Commercial Historic District Designation Study (City of Minneapolis, 2015)
  and its appendices: inventory of 29–35 properties with dates, historic names, and
  photos. This is the single best starting document.

**Tenants and businesses**
- Minneapolis City Directories, digitized 1859–1963 at HCL, searchable by name and
  address. Annual tenant lists per address.
- Minnesota Daily (UMN student paper): advertisements are the best tenant source after
  1963. Check the UMN Digital Conservancy / UMedia for digitized runs.
- Dinkytown Business Alliance records, 1983–2017 (HCL archives, physical).
- Bill Huntzicker, *Dinkytown: Four Blocks of History* (2016), and the Preserve
  Historic Dinkytown self-guided tour: narrative dates for landmark businesses
  (Gray's Campus Drug 1904, Varsity Theater 1915, Al's Breakfast 1950, Dayton's
  University Store 1920s–1950s, The Book House 1976, etc.).

**Photos**
- Minneapolis Newspaper Photograph Collection (HCL): ~100,000 images, mostly
  1920s–1940s, searchable online.
- UMN Archives via UMedia: campus-edge and Dinkytown street photographs.
- Minnesota Historical Society and Star Tribune archives for later decades.
- Most of these require a permission request or credit line for web publication.
  Plan to host thumbnails only where rights are clear, and link out otherwise.

**Street and infrastructure changes to model**
- Streetcar on 4th St SE (1870s horsecar, electric from c.1890, ended 1954).
- Great Northern rail corridor along the creek route (1862) bordering the district;
  later trench converted to the Dinkytown Greenway (2010s).
- 1970s: Red Barn protest site and other demolitions; 2010s: large student-housing
  redevelopment on the district's edges.

---

## 3. Scope

### Study area (phased)
- **Phase A (MVP):** the Dinkytown Commercial Historic District plus the four core
  blocks around 14th Ave SE and 4th St SE, roughly 12th Ave SE to 15th Ave SE and
  University Ave SE to 5th St SE. About 40–60 parcels, of which ~35 are documented in
  the designation study.
- **Phase B:** the wider "Dinkytown" as people use the name, roughly 10–12 blocks to
  8th St SE and the rail corridor. 150–250 parcels including housing.
- **Phase C (optional):** adjacent Marcy-Holmes housing and campus edge.

### Features
Must have:
1. Stylized top-down map with 3D building extrusions at approximate historical height.
2. Year slider (1885–2026) and a date input; 5-year keyframe snapping plus free
   scrubbing between keyframes.
3. Business labels in small legible type, with collision avoidance.
4. Pan/zoom with mouse drag, wheel, and touch pinch.
5. Building click: popup with name, tenant timeline, and the photo nearest the chosen
   year, with source credit.
6. Streets, streetcar tracks, and rail lines that appear/disappear by date.
7. Runs fully static in the browser (GitHub Pages), no backend.
8. Every fact carries a source citation and a confidence level, shown in the UI.

Nice to have:
- Era-appropriate ground rendering (dirt, brick, asphalt), tree canopy, shadows.
- Procedural facades (brick/stucco/glass by era) for a more "realistic" look.
- Shareable URL state (year, viewport, selected building).
- Timeline "story" mode that auto-plays decade by decade.
- Contribution form so alumni can submit photos and corrections.

---

## 4. Data model

Everything is interval-based. Snapshots are derived.

```
Building
  id, name (current or best-known), address(es)
  footprint: Polygon (WGS84), with optional per-interval variants
  stories, height_m (estimate), roof: flat|gable|hip, material: brick|wood|stucco|glass
  built_year (with range if uncertain), demolished_year|null
  style_tags: [commercial-vernacular, art-deco, modern, ...]
  sources: [SourceRef]
  confidence: high|medium|low

BuildingVariant  (optional; for a building that was significantly altered)
  building_id, start_year, end_year, footprint, stories, height_m, notes

Tenant
  building_id, unit (e.g. "storefront 2", "upstairs"), name, category
  start_year, end_year (null = present), start_precision: exact|circa|directory-year
  sources: [SourceRef], confidence

Feature (streets, tracks, rail, greenway, park)
  id, kind, geometry, start_year, end_year, style hints

Photo
  id, building_id (or lat/lng), year, year_precision, url, thumbnail, credit,
  rights: public-domain|permission-granted|link-only, sources

SourceRef
  type: sanborn|directory|permit|aerial|photo|book|article|oral-history|web
  citation, url|null, sheet/page, retrieved_at
```

Storage: CSV/GeoJSON in `data/` edited by hand or via a small local editor script;
a build step compiles them into one `dinkytown.json` bundle. At Phase A scale this is
well under 1 MB and loads instantly. See `data/schema/` for a JSON Schema draft.

**Keyframes:** the app computes the state at any date `t` as
`{ features where start <= t < end }`. The 5-year keyframe list is just an array of
years used for snapping and for a curated "confidence" badge per keyframe.

---

## 5. Architecture

Static site, no server.

- **Build:** Vite + TypeScript. Deploy to GitHub Pages via GitHub Actions.
- **Map engine:** MapLibre GL JS.
  - Handles pan, wheel zoom, pinch zoom, rotation, and tilt natively on desktop and
    mobile.
  - `fill-extrusion` layers give the slightly-3D look with per-feature height and
    color; `symbol` layers give labels with automatic collision handling and
    zoom-scaled text.
  - Filter expressions on `start`/`end` properties switch features on/off per year
    with no reload; labels for "tenant at year t" are recomputed in JS and pushed
    into the GeoJSON source (a few hundred features, negligible cost).
  - No external tile subscription needed: streets, blocks, river, campus edge, and
    rail are our own GeoJSON. Optionally, a free vector-tile basemap for surrounding
    context, faded.
- **Look:** a custom hand-tuned style: warm paper ground, era-dependent street
  surface, muted building palette keyed to material and era, soft lighting on
  extrusions, canopy polygons. Realism comes from the data (real footprints, real
  heights, real names) plus restraint in the palette.
- **Upgrade path for more realism:** a `CustomLayer` (Three.js) or deck.gl layer
  rendering procedural facades (window rows per story, cornices, signage bands) from
  the same data. Do this after the MVP, only if extrusions feel too flat.
- **UI:** slider + numeric date input, keyframe tick marks, play button, building
  popup panel, legend, source/confidence panel. Plain TypeScript or Preact; no
  heavy framework needed.
- **Data tooling (Node scripts):**
  - `build-data`: CSV/GeoJSON → bundle, with validation (overlapping intervals,
    missing sources, orphan tenants).
  - `georef-helper`: notes and a QGIS project for georeferencing Sanborn sheets and
    aerials; tracing is done in QGIS, exported as GeoJSON.
  - `directory-extract`: optional LLM-assisted extraction of tenant rows from OCR'd
    directory pages, output to a review CSV (never straight into the dataset).

Hosting cost: zero. Photo hosting: repo or a free object bucket; only rights-clear
images.

---

## 6. Research workflow (how each building gets its timeline)

1. Seed the building list from the 2015 designation study and current Hennepin
   parcels. Record current footprint, year built, stories.
2. Georeference Sanborn 1885, 1912, 1930-corrected, and 1950s sheets plus 1938, ~1950,
   ~1965, ~1980 aerials in QGIS. Trace footprints that differ from today's.
   These anchor years alone give you building existence and shape for the whole
   range.
3. For each address, pull the permit card(s): confirm built year, note major
   alterations and wrecking permits. Fill `BuildingVariant` where a rebuild changed
   height or footprint.
4. For each address, walk the city directories by 5-year step 1885–1960 (going annual
   where a change is detected), recording tenant name and category. Directories have
   street sections for at least the later decades, which makes block-at-a-time
   scanning fast.
5. For 1964–2005: Minnesota Daily ads (fall issues each 5 years), Huntzicker's book,
   Dinkytown Business Alliance records, Star Tribune articles, then microfilm
   directories for holes.
6. For 2005–2026: Wayback captures of business sites, Street View, news.
7. Photos: search HCL, UMedia, MNHS by address and by business name; log rights.
8. Every row gets a `SourceRef` and a confidence. Unknown stays unknown and renders as
   a hatched or greyed building rather than a guess.

---

## 7. Task breakdown and estimates

Hours are human-effort estimates for one person comfortable with the tools, with AI
assistance for code and for first-pass data extraction. Ranges are wide on purpose.

### 7.1 Engineering (Phase A)

| # | Task | Hours |
|---|---|---|
| E1 | Repo scaffold, Vite/TS, lint, GitHub Pages CI | 4–6 |
| E2 | Data schema, CSV/GeoJSON layout, `build-data` validator | 8–12 |
| E3 | MapLibre base: custom style, own GeoJSON for streets/blocks/river/rail | 10–16 |
| E4 | Temporal filtering, keyframe list, slider + date input, URL state | 8–12 |
| E5 | 3D extrusions: per-era palette, heights, lighting, tilt defaults | 10–16 |
| E6 | Labels: tenant-at-year computation, font sizing, collision, priority | 8–14 |
| E7 | Building popup: tenant timeline, nearest-year photo, credits, confidence | 8–14 |
| E8 | Streets/streetcar/rail/greenway features with intervals and styling | 6–10 |
| E9 | Mobile/touch polish, performance check, accessibility pass | 6–10 |
| E10 | Play mode, legend, source panel, share links | 6–10 |
| E11 | Tests for data validation and temporal logic; docs | 6–8 |
| | **Engineering subtotal** | **80–130** |

Optional realism upgrade (procedural facades via custom layer): +40–80 h.

### 7.2 Research and data entry (Phase A, ~50 buildings)

| # | Task | Hours |
|---|---|---|
| R1 | Read designation study + appendices, Huntzicker, PHD tour; build seed list | 8–12 |
| R2 | Pull Hennepin parcels/footprints; clean and clip to study area | 4–6 |
| R3 | Georeference and trace 4 Sanborn years + 4 aerial years in QGIS | 25–40 |
| R4 | Permit cards for ~50 addresses (built, altered, wrecked) | 20–35 |
| R5 | Directory tenants 1885–1963, 5-year steps with annual refinement | 40–70 |
| R6 | Tenants 1964–2005 (Minnesota Daily, DBA records, book, microfilm) | 40–80 |
| R7 | Tenants 2005–2026 (Wayback, Street View, news) | 10–20 |
| R8 | Photo search, rights logging, thumbnails for ~50 buildings × 2–4 eras | 25–45 |
| R9 | Reconciliation, confidence grading, QA pass on every keyframe | 15–25 |
| | **Research subtotal** | **190–330** |

### 7.3 Phase B (wider area, +150–200 parcels, mostly housing)
Housing has less tenant churn to track (owners/renters are usually out of scope), but
more geometry. Roughly 2–3× the Phase A research effort if you include per-house
build dates and changes; far less if housing is shown as generic massing from parcel
"year built" plus aerials. Recommended: generic massing first (~30–50 h), detail later.

### 7.4 Totals

| Scope | Engineering | Research | Total |
|---|---|---|---|
| Phase A MVP (core, 1885–2026, 5-year keyframes) | 80–130 h | 190–330 h | **270–460 h** |
| + Phase B generic housing massing | +10–20 h | +30–50 h | +40–70 h |
| + procedural facades | +40–80 h | — | +40–80 h |

Research dominates. A solo effort at ~10 h/week puts the MVP at roughly 6–11 months;
a small volunteer team (Preserve Historic Dinkytown, Marcy-Holmes, UMN history
students) could compress the research side substantially.

---

## 8. Token and dollar ballpark

Two very different cost lines.

### 8.1 AI usage (Claude API / Claude Code)

List prices as of this writing: Claude Opus 5 $5 in / $25 out per million tokens;
Claude Sonnet 5 $2 / $10; Claude Fable 5.1 $10 / $50. Cached input is much cheaper.
If you work under a subscription plan instead of the API, the marginal cost is
effectively the plan price.

| Use | Tokens (rough) | Cost (Opus 5) |
|---|---|---|
| Engineering with Claude Code (Phase A, ~80–130 h of work, many sessions) | 30–80 M mostly cached input, 1–3 M output | $150–500 |
| Directory/permit OCR extraction (a few thousand pages × ~2 k tokens, plus output) | 5–15 M in, 0.5–1 M out | $50–100 (Sonnet 5: $15–40) |
| Vision passes on aerials/Sanborn to pre-flag changes (hundreds of images) | 1–3 M | $10–30 |
| Research summarization, citation drafting, QA prompts | 5–10 M | $30–80 |
| **Total AI, Phase A** | | **~$250–700** (Fable 5.1 roughly 2× Opus) |

AI is a small fraction of the budget. It speeds first-pass extraction and coding, but
every historical fact still needs a human to verify against the scan.

### 8.2 Everything else

- Human time: 270–460 h for Phase A. At any hourly value this is the real cost.
- Data access: HCL card is free for Minnesota residents and unlocks the digital
  Sanborns and directories; MHAPO aerials and Hennepin GIS are free; LoC Sanborns are
  public domain. Budget a few library visits for microfilm and the DBA records.
- Photo rights: mostly free with credit for HCL/UMN; some collections charge a
  reproduction fee for web use. Assume $0–300, and link out where unsure.
- Hosting: $0 on GitHub Pages.

---

## 9. Risks and open questions

1. **1964–2005 tenant gap** is the largest uncertainty. Mitigation: show tenants with
   a "circa" badge, lean on the Minnesota Daily, and accept community corrections.
2. **1885 Sanborn coverage** of the study area is unverified. Mitigation: start at
   1900 if needed; 1885–1900 would then be geometry-only from the 1885 sheet if it
   exists.
3. **Photo rights** for web display vary by collection. Mitigation: rights field per
   photo, link-only fallback.
4. **Heights and materials** for demolished buildings come from Sanborn story counts
   and photos, not measurements. Label them as estimates.
5. **Scope creep into housing.** Keep Phase A commercial-only, with generic massing
   for surrounding blocks so the map does not look empty.
6. **Proxy/network limits in this environment** blocked direct reads of the
   designation study PDF and Wikipedia; those pages should be read directly during
   research.

---

## 10. Recommended first milestone (about 2–3 weeks of part-time work)

1. Engineering: E1–E4 plus a minimal E5/E6, using placeholder data for 10 buildings
   at three keyframes (1912, 1950, 2026). Goal: a working slider over a 3D map with
   labels, on GitHub Pages.
2. Research: R1, R2, and the 1912 and 1950s Sanborn sheets georeferenced and traced.
   Goal: real geometry for the core blocks at two anchor years.
3. Decide on the start year (1885 vs 1900) once the 1885 sheet is checked.

After that, iterate building by building; the map gets more complete every week and
is presentable at every stage because unknowns are rendered as unknowns.

---

## 11. Sources consulted for this plan

- City of Minneapolis, Dinkytown Commercial Historic District page and Designation
  Study (2015) — https://www.minneapolismn.gov/resident-services/property-housing/preservation/landmarks-districts/historic-districts/dinkytown-commercial/
- Preserving Historic Dinkytown, self-guided tour and history pages — https://www.preservehistoricdinkytown.org/
- Wikipedia, "Dinkytown" — https://en.wikipedia.org/wiki/Dinkytown
- Minnesota Alumni Magazine, "Dinkytown Past, Present, Future" — https://www.minnesotaalumni.org/stories/dinkytown
- Hennepin County Library: Digital Sanborn Maps, City Directory Collection
  (1859–1963), Building Permit Index Cards (1884–1973), Minneapolis Newspaper
  Photograph Collection — https://www.hclib.org/programs/genealogy-local-history/researching-homes
- Library of Congress Sanborn Maps, Hennepin County — https://www.loc.gov/collections/sanborn-maps/?fa=location%3Ahennepin+county
- UMN Borchert Map Library, Minnesota Historical Aerial Photographs Online — https://www.lib.umn.edu/apps/mhapo
- Hennepin County GIS Open Data — https://gis-hennepin.hub.arcgis.com/pages/open-data
- UMedia (UMN Libraries digital collections) — https://umedia.lib.umn.edu/
- Bill Huntzicker, *Dinkytown: Four Blocks of History* (2016)
- Dinkytown Business Alliance Records, HCL ArchivesSpace — https://archives.hclib.org/resources/dinkytown_business_alliance_records
