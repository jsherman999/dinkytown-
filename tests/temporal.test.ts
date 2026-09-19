import { describe, expect, it } from 'vitest';
import { activeAt, buildingStandsAt, clampYear, labelFor, nearestPhoto, nextKeyframe, prevKeyframe, snapToKeyframe, tenantsAt } from '../src/temporal';
import type { BuildingProps, Photo, Tenant } from '../src/types';

const b = (o: Partial<BuildingProps> = {}): BuildingProps => ({
  id: 'b1', name: 'Test Block', addresses: ['1 Main'], built_year: 1910, demolished_year: null, stories: 2, height_m: 7.2,
  material: 'brick', confidence: 'low', geometry_status: 'placeholder', sources: [], ...o,
});
const t = (o: Partial<Tenant>): Tenant => ({
  building_id: 'b1', unit: 'storefront', name: 'Shop', category: 'retail', start_year: 1920, end_year: 1930,
  start_precision: 'circa', confidence: 'low', source_ids: [], ...o,
});

describe('intervals', () => {
  it('are inclusive at the start and exclusive at the end', () => {
    expect(activeAt({ start_year: 1920, end_year: 1930 }, 1919)).toBe(false);
    expect(activeAt({ start_year: 1920, end_year: 1930 }, 1920)).toBe(true);
    expect(activeAt({ start_year: 1920, end_year: 1930 }, 1929)).toBe(true);
    expect(activeAt({ start_year: 1920, end_year: 1930 }, 1930)).toBe(false);
  });
  it('treat a null end as still current', () => {
    expect(activeAt({ start_year: 1950, end_year: null }, 2026)).toBe(true);
  });
  it('remove a building in its demolition year', () => {
    expect(buildingStandsAt(b({ demolished_year: 2013 }), 2012)).toBe(true);
    expect(buildingStandsAt(b({ demolished_year: 2013 }), 2013)).toBe(false);
    expect(buildingStandsAt(b(), 1909)).toBe(false);
  });
});

describe('labels', () => {
  it('fall back to the building name when no occupant is known', () => {
    expect(labelFor([], b())).toEqual({ text: 'Test Block', known: false });
  });
  it('prefer corner and whole-building occupants and count the rest', () => {
    const ts = [t({ name: 'Upstairs Dentist', unit: 'upstairs' }), t({ name: 'Corner Drug', unit: 'corner' }), t({ name: 'Shoes', unit: 'storefront' })];
    expect(labelFor(ts, b())).toEqual({ text: 'Corner Drug +2', known: true });
  });
  it('filter occupants by building and year', () => {
    const ts = [t({ name: 'A' }), t({ name: 'B', start_year: 1930, end_year: null }), t({ name: 'C', building_id: 'b2' })];
    expect(tenantsAt(ts, 'b1', 1925).map((x) => x.name)).toEqual(['A']);
    expect(tenantsAt(ts, 'b1', 1984).map((x) => x.name)).toEqual(['B']);
  });
});

describe('photos', () => {
  const p = (id: string, year: number): Photo => ({ id, building_id: 'b1', year, year_precision: 'exact', url: '', thumbnail: '', credit: '', rights: 'link-only', source_ids: [] });
  it('pick the nearest year, earlier on ties', () => {
    expect(nearestPhoto([p('a', 1940), p('b', 1960), p('c', 1990)], 'b1', 1984)?.id).toBe('c');
    expect(nearestPhoto([p('a', 1940), p('b', 1960)], 'b1', 1950)?.id).toBe('a');
    expect(nearestPhoto([], 'b1', 1950)).toBeNull();
  });
});

describe('keyframes', () => {
  const years = [1975, 1980, 1984, 1985, 1990];
  it('snap to the nearest saved view including the extra 1984 view', () => {
    expect(snapToKeyframe(1983, years)).toBe(1984);
    expect(snapToKeyframe(1982, years)).toBe(1980);
    expect(snapToKeyframe(1987, years)).toBe(1985);
    expect(snapToKeyframe(2000, years)).toBe(1990);
  });
  it('step to the next and previous saved views', () => {
    expect(nextKeyframe(1980, years)).toBe(1984);
    expect(nextKeyframe(1984, years)).toBe(1985);
    expect(prevKeyframe(1985, years)).toBe(1984);
    expect(nextKeyframe(1990, years)).toBeNull();
    expect(prevKeyframe(1975, years)).toBeNull();
  });
  it('clamp typed years to the supported range', () => {
    expect(clampYear(1700, 1885, 2026)).toBe(1885);
    expect(clampYear(2500, 1885, 2026)).toBe(2026);
    expect(clampYear(NaN, 1885, 2026)).toBe(1885);
    expect(clampYear(1984.4, 1885, 2026)).toBe(1984);
  });
});
