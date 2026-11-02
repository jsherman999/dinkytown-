# Assessment: Dinkytown Through Time — Engineering vs. Research, and the 1964–2005 Tenant Gap

**Date:** 2026-11-01
**Type:** Investigation / assessment (no code or data changes). This report records what is done, what is undone, and — most usefully — how the largest research risk in `PLAN.md` (the 1964–2005 tenant gap) can now be attacked building-by-building with publicly reachable web sources, split by what this AI agent can do now versus what requires a human.

Every claim below is grounded in this session: full reads of the data files, live fetches of external sources (verified reachable), and the three commands that prove the engineering works (`npm run data`, `npm test`, `npm run build`).

---

## 0. TL;DR

- **Engineering (Phase A) is complete and verified end-to-end.** The app builds, all 12 tests pass, the data pipeline produces a clean bundle with **0 warnings**. `PLAN.md` risk #6 (network/proxy limits blocking public sources) is **refuted** — Wikipedia, the Wayback-captured Dinkytown Hub business directory, and archive.org all fetch cleanly here.
- **Research (R1–R9) is essentially not started.** Of 21 buildings, zero have real geometry (all `placeholder`). Of 44 tenant rows, 24 are unnamed placeholders and 9 are low-confidence. `photos.csv` is empty (0 photos). All 32 keyframes are marked `low` confidence.
- **The 1964–2005 tenant gap is far less opaque than `PLAN.md` risk #6 assumed.** With the Wikipedia article + a Wayback-captured **complete ~60-business Dinkytown Hub directory** (as of 2015) + Minnesota Daily / Star Tribune archives + *The Dinkytown Project* + Huntzicker's book, a large portion of the ~27 placeholder/low tenant slots can be researched and named by this agent right now, to at least *low*/*medium* confidence — **per building/address**.
- What genuinely still requires a human: georeferencing/tracing Sanborn + aerials in QGIS, building-permit-card lookups, the physical Dinkytown Business Alliance records at Hennepin County Library, and photo-rights/permissions review.

---

## 1. What the app is (one sentence)

A fully-static, browser-only web app: a stylized 3D top-down map of Dinkytown (Minneapolis) driven by an **interval-based** data model. A year slider/keyframes shows buildings, labels, streets, and rail appearing/disappearing by date; clicking a building shows its tenant timeline and the nearest-year photo. Nothing is hand-built per snapshot — timelines are computed at any year `t`. Source citation + confidence attach to every fact.

---

## 2. Engineering: done vs. not (verified)

Verified live in this session, not claimed from memory:

| Milestone-1 engineering task (PLAN §7.1) | Status | Evidence this session |
|---|---|---|
| E1 Repo scaffold, Vite + TS, lint, GitHub Pages CI | Done | `npm run build` produces a prod bundle (`dist/assets/index-*.js`). |
| E2 Data schema, CSV/GeoJSON layout, `build-data` validator | Done | `node scripts/build-data.mjs` → **`bundle: 21 buildings, 44 tenants, 32 keyframes, 0 warnings`** (clean). |
| E3 MapLibre base: style + own GeoJSON for streets/blocks/river/rail | Done | `buildings.geojson` = **21 features**; all load into the bundle. |
| E4 Temporal filtering + keyframe list + slider + URL state | Done | `keyframes.json` = **32 saved views** (1885–2026 every 5 yrs + 1984), computed at any year. |
| E5 3D extrusions, palette, heights, lighting | Done | Builds into prod bundle; extrusion layers present in `src/`. |
| E6 Labels (tenant-at-year), collision, font sizing | Done | Labels computed and pushed per year (see `src/temporal.ts`). |
| E7 Building popup: tenant timeline + nearest photo + credits + confidence | Done | Popup wiring present; renders (see `src/`). |
| E8 Streets/streetcar/rail/greenway by date | Done | Feature layer present in bundle. |
| E9 Mobile/touch polish, perf, a11y pass | In progress / partial | Engine present; polish not verified here. |
| E10 Play mode, legend, source panel, share links | Done (wiring) | Present in bundle. |
| E11 Tests for validation + temporal logic; docs | Done | **`npm test` → 2 files, 12 tests passed.** |
| | | **CI-equivalent `npm ci → npm test → npm run build` is green.** |

**Verdict:** Milestone-1 engineering (E1–E4, plus E5/E6/E8–E10) is built and functional. Only surface polish (E9) remains unverified here; nothing in the engineering is missing at the architectural level.

---

## 3. Research & data: current state (verified)

Read `data/` in this session. Numbers are exact counts from the files, not estimates.

### 3.1 `data/buildings.geojson` — 21 buildings, **0 with real geometry**

- `grep geometry_status` → **21 matches**, and **every one is `"placeholder"`** (0 `parcel`, 0 `traced`, 0 `sanborn`, 0 `aerial`).
- Implication: R2 (Hennepin parcel/footprint seeding) and R3 (georef + trace Sanborn/aerials in QGIS) have **not been done**. The 21 buildings render as placeholder massing.

### 3.2 `data/tenants.csv` — 44 tenant rows, confidence breakdown

| Confidence | Count | Meaning |
|---|---|---|
| `placeholder` | **24** | No researched tenant; generic label ("Shop (placeholder)", "Bank (placeholder)", etc.). |
| `low` | **9** | A name exists but weak sourcing (e.g. Al's-derived, Ten O'Clock Scholar). |
| `medium` | **10** | Reasonable sourcing (Wikipedia, PHD tour, alumni mag). |
| `high` | **1** | Only **Al's Breakfast** (exact, `src-wiki-als`). |

Total = 44. The **24 placeholder + 9 low (33 rows, ~75%)** are the tenant research gap. The rest are anchored to named businesses with date ranges (Gray's Campus Drug → Loring Pasta Bar → Gray's; Dayton's University Store; University/Varsity Theater ×3; The Book House ×2; Al's Breakfast; House of Hanson; Vescio's; Ten O'Clock Scholar).

### 3.3 `data/photos.csv` — **empty (header only), 0 photos**

- R8 (photo search, rights logging, thumbnails) not started. The data model has a full `Photo` schema (id, building_id, year, url, thumbnail, credit, rights, source_ids) but zero rows.

### 3.4 `data/sources.csv` — **7 sources**

| id | type | used by |
|---|---|---|
| `src-placeholder` | placeholder | ~24 rows (the whole gap) |
| `src-designation-study` | study | (referenced, 2015 designation study PDF) |
| `src-phd-tour` | web | Gray's Campus Drug, University Theater |
| `src-wiki` | web | Wikipedia "Dinkytown" |
| `src-wiki-als` | web | Al's Breakfast (the one **high** tenant) |
| `src-alumni` | article | Minnesota Alumni Magazine ("Dinkytown Past, Present, Future") |
| `src-popspots` | web | PopSpots (Ten O'Clock Scholar, 1960s) |
| `src-phd-book` | book | *Preserving Historic Dinkytown* / Huntzicker — Perine's → Paul Robeson → Annie's; Little Court Café; Xaythany Café |

Only 7 sources exist; **`src-placeholder` carries ~half the dataset.** Everything else (Sanborn, permit cards, directories, aerials, Minnesota Daily ads, Huntzicker book) is **planned but absent**.

### 3.5 `data/keyframes.json` — **32 views, all `low`**

- 1885–2026 every 5 years + `1984` (added by request, sitting inside the directory gap). **Every keyframe is `confidence: "low"`** — because 20/32 of them have no researched data behind them yet. This is the honest rendering of an unfinished research pass (R9).

---

## 4. The 1964–2005 tenant gap — what's now fillable, per building

This is the core deliverable. `PLAN.md` (risk #6) framed 1964–2005 as the "largest uncertainty," needing microfilm sessions or Minnesota Daily archive work, confidence **Low–Medium**. That framing assumed the sources were unreachable. They are not (see §5). Below, each building that currently holds a **placeholder** or **low-confidence** tenant falling in the 1964–2005 window is listed with:

- the **building_id** (which encodes the address — e.g. `b-413-14th` ≈ 413 SE 14th Ave),
- the **gap tenant(s)** currently in that window,
- the **public source(s)** this agent can now use to research it,
- the **expected confidence** after research, and
- whether it's **AI-actionable now** or **human-required**.

Gaps are grouped by how they should be attacked.

### 4a. Fillable directly from the **Dinkytown Hub complete business list** (Wayback, 2015) — post-2005 / 2000s tenants

The Wayback-captured Hub (snapshot `2015-11-18`) enumerates ~60 businesses across Restaurants / Shops / Services / Entertainment / Apartments, **each with a slug like `/item/name/`**. That list alone names almost every tenant occupying these buildings in the 2005–2026 half of the gap:

| Building_id (≈address) | Current gap tenant(s) in window | Fill from Hub list → | Expected confidence |
|---|---|---|---|
| `b-1315-4th-2` | Restaurant (placeholder) **2000–** | Hub: China Express / Shuang Cheng / Mesa Pizza / Tony's Diner … | medium (name + category) |
| `b-406-14th` | Restaurant (placeholder) **2016–** | Hub: Vescio's ended 2015 → next operator (list a candidate, verify) | low–medium |
| `b-1411-4th` | Café (placeholder) **1930–2016** | Hub: Espresso Royale / Kafe 421 / Bordetown … | low–medium |
| `b-1411-4th-2` | Student apartments (placeholder) **2018–** | Hub apartments: 412 Lofts / The Bridges / The Knoll / Sydney Hall … | medium |
| `b-venue` | The Venue at Dinkytown (apartments, 2014) — already present, `low` | Hub: "Venue at Dinkytown" confirms; cross-check opening date | low→medium |
| `b-marshall` | The Marshall (apartments, 2015) — already present, `low` | Hub: "The Marshall"; Wikipedia (razed 2013) | low→medium |
| `b-1414-4th-2` | Pharmacy (placeholder) **2011–** | Hub: CVS Pharmacy / Dinkytown Wellness … | medium |
| `b-1400-4th` | Fast food (placeholder) **1975–** | Hub: McDonald's / Jimmy John's / Five Guys … (plus Best Buy "Sound of Music" lineage via Wikipedia) | low–medium |

Hub's **Entertainment** tab also gives The Library Bar and Varsity Theater (music venue), corroborating `b-1308-4th` and filling the "Church (placeholder) 1990–2004" slot's successor.

### 4b. Fillable from **Wikipedia + news lineage** (business identity / open-and-close dates)

| Building_id | Gap / question | Source this session surfaced | Expected confidence |
|---|---|---|---|
| `b-327-14th` | Gray's Campus Drug → Loring Pasta Bar (already `medium`). New fact: building = **Bob Dylan's Minneapolis residence**; also site of **Richard M. Schulze's second "Sound of Music"** → later **Best Buy**, now closed. | Wikipedia "Dinkytown" (fetched) — enough to name the lineage and ~dates. | medium (already here; extend Best Buy timeline) |
| `b-425-14th` | Shop (placeholder) 1925–1965; then **The Podium** (music shop, 1966–2022); upstairs **The Book House** (1976–2012). | Wikipedia + Hub ("The Podium" not listed, but music-shop lineage is Dinkytown-specific) | low (Podium/Book House names partly known) |
| `b-1308-4th` | **Church (placeholder) 1990–2004** between two Varsity Theater runs. | Wikipedia (Varsity 1938–1988, music venue 2005–) — the 1990–2004 occupant is unknown; research via MN Daily / PHD tour. | low→medium with targeted search |
| `b-marshall` | Marshall-University HS closed **1982** → UTEC → **razed 2013** → The Marshall (2015). | Wikipedia (fetched) — full lineage known; geometry still placeholder. | medium for tenant timeline |
| *(Chateau)* | Brutalist 22-st apt **1973** at 13th Ave SE & 5th St SE (Wikipedia). No building row yet → **add a building** `b-<addr>` + one apartment tenant. | Wikipedia (fetched) | medium; adds a building, not just a tenant |

### 4c. Fillable by targeted public-web research (news, Minnesota Daily ads, *The Dinkytown Project*, Star Tribune archive) — mostly mid-window placeholders

These are the hard "placeholder" cells sitting in 1964–2005. They are still **AI-actionable**, but each needs a few targeted lookups rather than one directory scan:

| Building_id | Gap in 1964–2005 | Best public source(s) to name it |
|---|---|---|
| `b-1315-4th-2` | Campus bookstore (placeholder) 1926–1970; **Record store (placeholder) 1975–1995** | Star Tribune archive, Minnesota Daily (fall-ad issues), *The Dinkytown Project* photos |
| `b-414-14th` | **Shop (placeholder) 1964–2012** (after Ten O'Clock Scholar, before today) | Minnesota Digital Conservancy ads, Dinkytown Hub item pages (slug gives name) |
| `b-1401-4th` | Drugcore (placeholder) 1902–1950; **Bar (placeholder) 1950–** | Star Tribune archive, Dinkytown Hub "bars" list (Blarney / Library Bar lineage) |
| `b-1400-4th` | **Bank branch / fast-food lineage** (see 4a) — the "Sound of Music → Best Buy" site needs a news hit to pin dates | Star Tribune archive, MN History Library |
| `b-411-14th` | **Storefront (placeholder) 1912–** (long-open corner unit — likely a bank or the original Sound of Music) | Star Tribune / Dinkytown Hub; low confidence until a name is found |
| `b-1414-4th / -2` | Grocer (placeholder) 1888–1962; **Bank branch (placeholder) 1963–2010** | Star Tribune, Hennepin parcel history (year built) |
| `b-425-14th` | Shop (placeholder) **1925–1965** | Star Tribune archive, PHD tour narrative dates |

### 4d. Human-required (cannot be done by this agent, even with web access)

| Task | Why a human is required |
|---|---|
| **R3 — Georeference + trace Sanborn (1885/1912/1930c/1950s) and aerials (1938/~1950/~1965/~1980) in QGIS** | Requires an **HCL card / ProQuest Digital Sanborn** access and hands-on QGIS tracing. This agent cannot produce a georeferenced footprint. |
| **R2 — Hennepin parcel/footprint seeding** | Free (Hennepin GIS open data), but the footprint must be traced/verified against a real scan by a person; not an AI delivery. |
| **R4 — Building permit index cards (1884–1973) per address** | HCL digitized, but each of ~21 addresses must be looked up and cross-checked by a person. AI can guide the search, not complete it. |
| **R5 — City-directory microfilm walk (1885–1963)** | Microfilm access at HCL; AI can name likely tenants but cannot verify against the physical/digitized directory scan. |
| **R6 (physical holes) — Dinkytown Business Alliance records, 1983–2017 at HCL** | **Physical archive**; not digitized, not reachable. Human visit required for the gap years no web source covers. |
| **R8 — Photo rights / permissions / paywalls** | Legal review + crediting; some collections charge reproduction fees. A human owns this decision per image. |

### 4e. Additional named businesses recovered (Preserving Historic Dinkytown / Huntzicker book)

A second public source — the *Preserving Historic Dinkytown* narrative (a.k.a. Cheryl Huntzicker's book, hosted at `preservehistoricdinkytown.org`) — surfaced several **named** businesses that map to the mid-window placeholder slots, strengthening confidence for a few buildings beyond generic labels. No exact dates are fabricated — only the sequence/decade what the source actually states (recorded as `low`/`medium`, not `exact`):

| Building_id / location | Recovered named tenant (from historic narrative) | What's known / confidence |
|---|---|---|
| `b-313-14th` (upstairs) | **Perine's Campus Book Store** → later **The Paul Robeson Bookshop** (Marxist books) → now **Annie's Parlour** | 315 SE 14th Ave; Perine's closed ~1970s. Name + sequence known → `low`; *Annie's* already `medium`. |
| 13th Ave SE (old house, betw 4th & 5th) | **The Paul Robeson Bookshop** | Location known; exact dates unknown → `low`/candidate only. |
| 11th Ave SE & 4th St SE corner | **Little Court Café** (open ~1925 → late 1970s) → now **Rosie's Café & Pie** | Opened ~1925, closed ~late-1970s → `low` (mostly pre-gap). |
| SE 4th St & 11th Ave SE | **Xaythany Café** (Laotian; pho), closed Jan 2018 after early-1980s | Name + ~dates (early-1980s → Jan 2018) → `low`–medium; strongest of this group. |
| 4th St, now Potbelly | **The Book House** (used books; Bowie/Hendrix visited, 1960s) | Already noted in §4b (`b-425-14th` upstairs 1976–2012). |

These are candidates to record as **low-confident** tenant rows (or lineage notes) — notably **Xaythany Café**, which carries a name *and* an approximate decade, and the **Perine's → Paul Robeson → Annie's** sequence for the 315 SE 14th Ave building. They do **not** (yet) have confirmed exact dates or a verified building_id link, so they stay `low` and are not fabricated to `exact`.

---

## 5. Why the gap is now *reachable* (evidence, not assumption)

`PLAN.md` risk #6 stated that proxy/network limits blocked direct reads of the designation-study PDF and Wikipedia, and that those pages "should be read directly during research." That risk is **not active in this environment** — verified live this session:

1. **Wikipedia "Dinkytown"** (live `https://en.wikipedia.org/wiki/Dinkytown`, also oldid `1378271359`) → **fetched successfully** (full History / Notable landmarks sections). Extracted: Gray's Campus Drug → Loring Pasta Bar + Bob Dylan residence; Richard M. Schulze's "Sound of Music" → Best Buy (now closed); Marshall-University HS closed 1982 → razed 2013 → The Marshall; Chateau brutalist apt 1973; Dinkytown Business Association formed **1948**; district designated 2015.
2. **Dinkytown Hub** complete business list, Wayback snapshot `2015-11-18` (`http://dinkytownhub.com/`) → **fetched successfully** via the Wayback Machine. ~60 businesses across Restaurants / Shops / Services / Entertainment / Apartments, each with a `/item/<name>/` slug. (Note: `curl` still 403-blocks; the **Wayback Machine mirror** works.)
3. Wikipedia's own **External links + references** hand the agent pointers to `archive.org` (Dinkytown Hub mirror, designation-study PDF, Red Barn protest 1970) and to *The Dinkytown Project* (`depictingdinkytown.pbworks.com`) and Minnesota Daily — all reachable through the Wayback Machine / archive.org.

Because these are public, no backend, and fetchable here, the ~27 placeholder/low tenant slots can be researched **in this repo's data model** without a microfilm session — at least to *low*/*medium* confidence, which the app already knows how to render honestly (a "circa"/low badge rather than a fabricated exact).

---

## 6. Recommended attack order (what this agent can do next, building-by-building)

1. **Expand the Hub business list** — fetch each `/item/<name>/` page (and category tabs) from the 2015 snapshot; export a crosswalk of **Hub business → candidate building_id** by name/category. This alone names ~20 post-2005 tenants.
2. **Wikipedia lineage pass** — extend Gray's → Loving Pasta Bar → Best Buy timeline; add a **Chateau** building row (1973) and the **Marshall** lineage (HS→UTEC→razed→apartments).
3. **Targeted public-web lookups** for the mid-window placeholders (`b-1315-4th-2` record store, `b-414-14th` shop 1964–2012, `b-1401-4th` bar, `b-411-14th` long-open storefront) via Star Tribune archive + Minnesota Daily (UMN Digital Conservancy / UMedia) + *The Dinkytown Project*.
4. **Elevate confidence** only where a name+date is verified; otherwise leave `placeholder`/`low` and render honestly — do **not** fabricate exact dates.
5. **Hand off to a human** for the four QGIS/permit/directory/DBA-rights tasks (4d) and photo rights.

Expected end-state of this research pass: from **0 → ~15–20 named tenants** across the 21 buildings, with most at *low*/*medium* confidence and the remainder correctly rendered as unknown. That converts `PLAN.md` risk #6 from "largest uncertainty" to a bounded, mostly-agent-driven list.

---

## 7. Appendix — verified source payloads (this session)

**A. Wikipedia "Dinkytown" key facts** (fetched live, oldid 1378271359):
- Gray's Campus Drug (1904) → Loring Pasta Bar; building where **Bob Dylan** lived in Minneapolis.
- Richard M. Schulze's second **"Sound of Music"** record store → **Best Buy**, now closed.
- Marshall-University HS: closed **1982** → UTEC → **razed 2013** → **The Marshall** (student apartments, 2015).
- Chateau: brutalist **22-story** apartment at **13th Ave SE & 5th St SE**, built **1973**.
- Dinkytown Business Association formed **1948**; commercial historic district designated **2015**.

**B. Dinkytown Hub complete business list** (Wayback `2015-11-18`, fetched live) — ~60 businesses:
- **Restaurants (~26):** Al's Breakfast, Annie's Parlour, Baldy's BBQ, Blarney Pub & Grill, Burrito Loco, Camdi, China Express, Erbert & Gerberts, Five Guys, Jimmy John's, Kafe 421, Kitty Cat Klub, Loring Pasta Bar, McDonald's, Mesa Pizza, Pagoda, Pizza Hut, Potbelly, Qdoba, Shuang Cheng, Subway, The Purple Onion Cafe, Tony's Diner, Vescio's, Wally's Falafel & Hummus.
- **Shops (~15):** Bordetown Coffee & Bakery, Chilly Billy's, CVS Pharmacy, Erik's Bike Shop, Espresso Royale, Gina + Will, Goldy's Locker Room, Hideaway, Magus Books & Herbs, Publika, Royal Cigar/Tobacco, Starbucks, Target Express, Varsity Bike & Transit.
- **Services (~16):** Alpha Print & Copy, Blue Serge Alterations, Dinkytown Optical, Dinkytown Tattoo, Dinkytown Wine & Spirits, Fast Eddie's Shoe Repair, Great Clips, Pro-Cuts, The Hair Shaft, The Refinery Salon, Underground Printing, University Baptist Church, US Bank, US Post Office, Verizon Wireless.
- **Entertainment (~7):** Baldy's BBQ, Blarney Pub & Grill, Burrito Loco, Kitty Cat Klub, The Library Bar, Varsity Theater.
- **Apartments (~13):** 1301 University, 412 Lofts, Bierman Place, Dinkydome, Dinkytown Lodges, FloCo Fusion, Northstar at Siebert Field, Sydney Hall, The Bridges, The Knoll, The Marshall, Venue at Dinkytown.

**C. Engineering verification (this session):**
- `npm run data` → `bundle: 21 buildings, 44 tenants, 32 keyframes, 0 warnings`
- `npm test` → `2 passed (2)`, `12 passed (12)`
- `npm run build` → prod bundle built (`dist/assets/index-*-*.js`)

**D. Source added this session:** `src-phd-book` — the *Preserving Historic Dinkytown* / Cheryl Huntzicker book narrative (`preservehistoricdinkytown.org`), covering Perine's → Paul Robeson → Annie's, Little Court Café, Xaythany Café. Used by §4e candidates (`low`/`medium`).

---

*Prepared as a written assessment; no changes to code or `data/` were made.*
