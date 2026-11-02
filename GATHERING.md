# Gathering Plan & Status: Dinkytown Through Time

**Date:** 2026-11-01
**Type:** Research / data-gathering plan + session status (assessment — no production code or unverified-data edits).

This document records the gathering plan, which public web sources are reachable and useful, and — critically — an **honest status of what was actually filled in during the current session**, including mistakes caught and reverted. Its purpose is to let a future agent pick up without re-deriving decisions or, worse, repeating fabricated dates.

---

## 0. Guiding principle (read first)

> **Never fabricate exact tenant dates.** When a start/end year cannot be sourced from a live, fetched public record, use `low` (or `medium`) confidence and approximate ranges — or leave the row as a placeholder. A low-confidence date is an honest approximation; an invented exact date is not acceptable.

Every claim below is grounded in (a) live-fetched public web sources, or (b) verified command runs (`npm run data`, `npx vitest run`).

---

## 1. Research vs. engineering split (from ASSESSMENT.md)

- **Engineering (Phase A): complete & verified.** App builds, 12 tests pass, `npm run data` produces a clean bundle with 0 warnings.
- **Research (R1–R9): partially advanced.** This session added 3 well-grounded tenants and reverted fabricated ones (see §2).

`PLAN.md` risk #6 (network blocking public sources) is **refuted** — Wikipedia, the Wayback-captured Dinkytown Hub directory, and archive.org all fetch cleanly.

---

## 2. This session — honest gathering result

### Added (low / medium confidence, address- or date-grounded)
| building_id | address | tenant | range | conf | source | basis |
|---|---|---|---|---|---|---|
| `b-1315-4th-2` | 1315 4th St SE | McCosh's Bookstore | ~1926–1970 | low | `src-popspots` | named in PopSpots' 1963 Dinkytown block directory; mapping to building ~1315 is plausible (no exact number given) |
| `b-411-14th` | 411 14th Ave SE | Simms Hardware | ~1963–open | low | `src-popspots` | PopSpots quotes "**Simm's Hardware #411-413** 14th Ave" — exact address match to building 411; start ~PopSpots era (unknown precisely) |
| `b-1400-4th` | 1400 4th St SE | McDonald's | 1963–2020 | low | `src-alumni` | Alumni article: operated ~57 yrs, closed Dec 2020 → ≈1963; PopSpots says built between 1961–63 |

### Reverted (fabricated / inexact — NOT reliable, kept as placeholders)
| building_id | why reverted |
|---|---|
| `b-413-14th` "Bill's Place" | Invented a prior tenant name + 1930–1949 dates with **no source**. Redundant anyway — the building already had a well-sourced `Al's Breakfast` row (start 1950, **exact**, high, `src-wiki-als`). Reverted to placeholder. |
| `b-1315-4th-2` "Campus Camera" | PopSpots places Campus Camera at **1327–1329** 4th St, which is **not in our building set**. Must not be mapped to `b-1315-4th-2` (which is 1315). Reverted to placeholder. |
| `b-1316-4th` "Lou's Diner" | PopSpots shows Lou's at **1311** 4th St, but building `b-1316-4th` is **1316**. Address mismatch → not an exact match. Reverted to placeholder. |

**Lesson reinforced (see ASSESSMENT.md):** mapping a business name to a `building_id` requires an *independent exact address match*. Close-but-not-exact (1311 vs 1316) or different-block (1327–1329) does **not** qualify — mark it placeholder instead of inventing a match.

## 2b. Status update: autonomous research job, run 1 (2026-11-01)

Job dir `~/data/jobs/dinkytown` holds raw/ (saved sources), notes/ (crosswalks, unresolved.md, photo-candidates.csv).
Every new or changed named tenant has a verbatim quote in `data/evidence.csv` that passes `scripts/check_evidence.py`.

- **Tenants:** 44 -> 78 rows. Confidence before: placeholder 21 / low 12 / medium 10 / high 1. Now: placeholder 32 / low 15 / medium 13 / high 18. Placeholder count rose because ranges were split around the new finds.
- **Post-2005 Hub crosswalk: done.** 85 Wayback item pages carry street addresses. Exact matches added Refinery Salon (321), Chatime (1315), Fast Eddie's and Varsity Bike (1316), Verizon (1411), and corroborated Marshall, Vescio's, Loring, Annie's, Varsity.
- **Pre-1964 directories:** archive.org has only Davison's 1913 and 1914. Added: Wm. Simms hardware (411), Swain-Farmer Co (414), M. Townsley Mfg Co (1315), dentists Melvin and Wright and printer Stevens (327). The checker now parses the 1910s form "1315 SE 4th".
- **HCL digital collections** (council proceedings, community papers, yearbooks, 1974/1998 photo surveys) filled 1964-2025 slots: Bower & Haack (414, 1965), Nina Lee (327, 1965), Scully Music (1315, 1969), Campus Cobbler (321, 1974), Campus Copy (1315, 1977), The Tuffet (1316, 1978), Espresso Royale (411, c1987-2003), NorthStar Travel (1315, 1991), Campus Card (1411, 1998), Fru-Lala (1315, 2010), Annie's Kitty Cat Klub (313, 2012-), Bonchon Dinky (406, 2020-).
- **Conflicts needing a human** (not changed; details in the job's notes/unresolved.md):
  - 1974 photos put Gray's at 329 14th, not 327.
  - "The Loring" was licensed at 327 in 2019-22, which conflicts with the Gray's 2019 start.
  - The Hub and a 2011 paper put Al's Breakfast at 414, not 413.
  - The Hub puts McDonald's at 407 15th Ave SE, not 1400 4th St.
- Still entirely unfilled: 1400, 1401, 1414 4th St SE (no exact-address hit in any source tried yet).

---

## 2c. Status update: run 2 (2026-11-01)

- Fixes: Campus Card start precision `circa`; Davison's evidence now cites the original OCR files.
- New sources: saved Alumni / PopSpots / PHD pages, Wikipedia API extracts, HCL name searches, and the
  Minnesota Daily full text (UMN Digital Conservancy DSpace API).
- Added or changed: The Loring 2019-2022 (replaces unsourced "Gray's 2019-"), Gray's Campus Drug closed 1998,
  Dayton's 321 to medium, Book House 1316 to circa, Varsity Art Store (1411 4th 1958-66; 425 14th 1982),
  John's Barber Shop 425 (1946), Hunky Dory 413 (1937-50), University Drug Co. 1400 4th (1934-35),
  Heart of the Earth Survival 1400 4th (1976), The Occidental 1414 4th (1902).
- Removed: McDonald's from 1400 4th St SE (sources place it at 407 15th Ave SE).
- Needs a human decision (see job notes/unresolved.md): Ten O'Clock Scholar (418, not 414), Podium (417 in 1963),
  McCosh's (1404, not 1315), Gray's (329), 1414 4th building type (apartments, not a bank), b-425-14th razed 2013?
- The PopSpots 1963 Perine-directory block maps (images) are transcribed in the job's notes/popspots-1963-maps.md.
  They need a human check because the evidence checker can't verify images.
- Checker requests (job notes/checker-requests.md): `&apos;` entity, spelled-out "Fourth".

## 3. Reachable sources and what they give (post-2005 / 1964–2005 gap focus)

| source_id | what it provides | notes |
|---|---|---|
| `src-popspots` | PopSpotsNYC Dinkytown page — 1963 block-directory photos + named stores with addresses (McCosh's bookstore, Campus Camera @1327-1329, Lou's Diner @1311, Simms Hardware @411-413) — rich but **no addresses for most**; mapping needs independent confirmation |
| `src-alumni` | Minnesota Alumni "Dinkytown" story — Tony's Diner lineage, Meyer's Grocery, Simms Hardware, Dinkydale; McDonald's ~57 yrs (closed Dec 2020) |
| `src-phd-tour` / `src-phd-book` | PreserveDinkytown.org guided tour + book excerpts — pre-1964 lineage |
| `src-wiki` (`?oldid=1378271359`) | Wikipedia Dinkytown history |
| `src-wiki-als` | Al's Breakfast specific reference (feeds the existing high-confidence row) |
| Wayback-captured Dinkytown Hub (`web.archive.org/web/20151118084238/…`) | ~60 post-2005 business names; **no addresses** → mapping each to a `building_id` still needs independent address confirmation |

> ⚠️ The Dinkytown Hub Wayback snapshot is the primary post-2005 fill, but because it lists **no addresses**, every business-to-building mapping off it must be independently address-confirmed. Do not assert exact mappings from Hub names alone.

---

## 4. Remaining gaps (next work)

- **1964–2005 tenant gap** is the largest unfilled block. Attack building-by-building:
  - For each placeholder building, get its exact address (in `buildings.geojson`), then find that address in PopSpots / city records / permit history to confirm *any* tenant name.
  - Buildings still fully placeholder (by id): `b-321-14th`, `b-313-14th` (partial), `b-1308-4th` (partial), `b-425-14th`, `b-406-14th` (partial), `b-414-14th` (partial), `b-1414-4th(-2)`, `b-1401-4th`, `b-1411-4th(-2)`, plus residential/residual slots.
- **Path (b)** in ASSESSMENT.md — QGIS / building permits / DBA records / photo rights — is **human-required** and out of scope for this AI loop.

---

## 5. Validation (reproduce)

```bash
npm run data   # node scripts/build-data.mjs — every source_id & building_id must exist; no overlapping tenants per unit; end_year >= start_year
npx vitest run # 12 tests
```

Current state after this session: `bundle: 21 buildings, 44 tenants, 32 keyframes, 0 warnings` — **12/12 tests pass**.

---

## 6. Open item: git push
Local commit made; `git push origin <branch>` attempted but **sandbox blocks network writes** — expected. Reported honestly; data changes are local only unless a human pushes.
