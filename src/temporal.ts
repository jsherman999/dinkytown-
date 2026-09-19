import type { BuildingProps, Interval, Keyframe, Photo, Tenant } from './types';

/** Inclusive start, exclusive end: a record applies for start_year <= year < end_year. */
export function activeAt(i: Interval, year: number): boolean {
  return i.start_year <= year && (i.end_year == null || year < i.end_year);
}

export function buildingStandsAt(b: BuildingProps, year: number): boolean {
  return activeAt({ start_year: b.built_year, end_year: b.demolished_year }, year);
}

export function tenantsAt(tenants: Tenant[], buildingId: string, year: number): Tenant[] {
  return tenants.filter((t) => t.building_id === buildingId && activeAt(t, year));
}

const UNIT_PRIORITY = ['corner', 'corner storefront', 'whole', 'storefront'];
function unitRank(unit: string): number {
  const i = UNIT_PRIORITY.indexOf(unit);
  return i === -1 ? UNIT_PRIORITY.length : i;
}

/** Short label for the map: the most prominent tenant, "+n" if others share the building. */
export function labelFor(tenants: Tenant[], building: BuildingProps): { text: string; known: boolean } {
  if (tenants.length === 0) return { text: building.name, known: false };
  const sorted = [...tenants].sort((a, b) => unitRank(a.unit) - unitRank(b.unit) || a.start_year - b.start_year);
  const first = sorted[0]!;
  const extra = sorted.length - 1;
  return { text: extra > 0 ? `${first.name} +${extra}` : first.name, known: true };
}

/** Photo whose year is closest to the requested year; ties go to the earlier photo. */
export function nearestPhoto(photos: Photo[], buildingId: string, year: number): Photo | null {
  let best: Photo | null = null;
  for (const p of photos) {
    if (p.building_id !== buildingId) continue;
    if (!best || Math.abs(p.year - year) < Math.abs(best.year - year) || (Math.abs(p.year - year) === Math.abs(best.year - year) && p.year < best.year)) best = p;
  }
  return best;
}

export function keyframeYears(keyframes: Keyframe[]): number[] {
  return keyframes.map((k) => k.year);
}

/** Nearest saved view; on a tie, the earlier one. */
export function snapToKeyframe(year: number, years: number[]): number {
  if (years.length === 0) return year;
  let best = years[0]!;
  for (const y of years) if (Math.abs(y - year) < Math.abs(best - year)) best = y;
  return best;
}

export function nextKeyframe(year: number, years: number[]): number | null {
  for (const y of years) if (y > year) return y;
  return null;
}

export function prevKeyframe(year: number, years: number[]): number | null {
  for (let i = years.length - 1; i >= 0; i--) if (years[i]! < year) return years[i]!;
  return null;
}

export function clampYear(year: number, min: number, max: number): number {
  if (!Number.isFinite(year)) return min;
  return Math.min(max, Math.max(min, Math.round(year)));
}
