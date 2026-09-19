// PLACEHOLDER GEOMETRY GENERATOR — milestone 1 only.
// Builds data/buildings.geojson and data/features.geojson from a simple local grid
// around the 14th Ave SE / 4th St SE intersection. Footprints are schematic, not
// traced from Sanborn sheets or parcels. Delete this script once real geometry
// (QGIS-traced GeoJSON) replaces the generated files.
//
// Local frame: origin at the intersection; u = metres along 4th St SE (positive
// toward ESE, i.e. increasing 4th St addresses); v = metres along 14th Ave SE
// (positive toward NNE, i.e. increasing 14th Ave addresses).
import { writeFileSync } from 'node:fs';

const ORIGIN = { lon: -93.2356, lat: 44.98065 }; // approx 14th Ave SE & 4th St SE
const STREET_BEARING = 118; // degrees, 4th St SE heading toward ESE (approximate)
const AVE_BEARING = STREET_BEARING - 90; // 14th Ave SE toward NNE

const toRad = (d) => (d * Math.PI) / 180;
function project(u, v) {
  const east = u * Math.sin(toRad(STREET_BEARING)) + v * Math.sin(toRad(AVE_BEARING));
  const north = u * Math.cos(toRad(STREET_BEARING)) + v * Math.cos(toRad(AVE_BEARING));
  const lat = ORIGIN.lat + north / 110540;
  const lon = ORIGIN.lon + east / (111320 * Math.cos(toRad(ORIGIN.lat)));
  return [Number(lon.toFixed(7)), Number(lat.toFixed(7))];
}
const rect = (u0, v0, u1, v1) => [[project(u0, v0), project(u1, v0), project(u1, v1), project(u0, v1), project(u0, v0)]];
const line = (pts) => pts.map(([u, v]) => project(u, v));

// Street centrelines: streets (NW–SE) at v, avenues (SW–NE) at u. Half-widths in metres.
const STREETS = { 'University Ave SE': -110, '4th St SE': 0, '5th St SE': 110, '6th St SE': 220 };
const AVES = { '12th Ave SE': -400, '13th Ave SE': -200, '14th Ave SE': 0, '15th Ave SE': 200 };
const HW_ST = 12, HW_AVE = 10; // half-widths (ROW)
const U_MIN = -500, U_MAX = 300, V_MIN = -180, V_MAX = 300;

const features = [];
// Ground blocks (the parcels between rights-of-way)
const vs = Object.values(STREETS).sort((a, b) => a - b);
const us = Object.values(AVES).sort((a, b) => a - b);
const vEdges = [V_MIN, ...vs, V_MAX];
const uEdges = [U_MIN, ...us, U_MAX];
for (let i = 0; i < uEdges.length - 1; i++) {
  for (let j = 0; j < vEdges.length - 1; j++) {
    const u0 = uEdges[i] + (i === 0 ? 0 : HW_AVE), u1 = uEdges[i + 1] - (i === uEdges.length - 2 ? 0 : HW_AVE);
    const v0 = vEdges[j] + (j === 0 ? 0 : HW_ST), v1 = vEdges[j + 1] - (j === vEdges.length - 2 ? 0 : HW_ST);
    features.push({ type: 'Feature', properties: { id: `block-${i}-${j}`, kind: 'block', start_year: 1800, end_year: null }, geometry: { type: 'Polygon', coordinates: rect(u0, v0, u1, v1) } });
  }
}
// Streets and avenues as centrelines with era-dependent surface
for (const [name, v] of Object.entries(STREETS)) {
  for (const [surface, s, e] of [['dirt', 1800, 1905], ['paved', 1905, null]]) {
    features.push({ type: 'Feature', properties: { id: `st-${name}-${surface}`, kind: 'street', name, surface, width_m: HW_ST * 2, start_year: s, end_year: e }, geometry: { type: 'LineString', coordinates: line([[U_MIN, v], [U_MAX, v]]) } });
  }
}
for (const [name, u] of Object.entries(AVES)) {
  for (const [surface, s, e] of [['dirt', 1800, 1910], ['paved', 1910, null]]) {
    features.push({ type: 'Feature', properties: { id: `av-${name}-${surface}`, kind: 'street', name, surface, width_m: HW_AVE * 2, start_year: s, end_year: e }, geometry: { type: 'LineString', coordinates: line([[u, V_MIN], [u, V_MAX]]) } });
  }
}
// Streetcar on 4th St SE: horsecar 1875, electric c.1891, service ended 1954 (verify).
features.push({ type: 'Feature', properties: { id: 'streetcar-4th', kind: 'streetcar', name: '4th St streetcar', start_year: 1875, end_year: 1954, confidence: 'medium' }, geometry: { type: 'LineString', coordinates: line([[U_MIN, 0], [U_MAX, 0]]) } });
// Rail corridor NE of the district, later the Dinkytown Greenway. Alignment is schematic.
features.push({ type: 'Feature', properties: { id: 'rail-gn', kind: 'rail', name: 'Railroad corridor', start_year: 1862, end_year: 2012, confidence: 'low' }, geometry: { type: 'LineString', coordinates: line([[U_MIN, 275], [U_MAX, 262]]) } });
features.push({ type: 'Feature', properties: { id: 'greenway', kind: 'greenway', name: 'Dinkytown Greenway', start_year: 2015, end_year: null, confidence: 'low' }, geometry: { type: 'LineString', coordinates: line([[U_MIN, 275], [U_MAX, 262]]) } });

// Buildings. Lot rectangles [u0, v0, u1, v1] in the local frame. Streets are at
// v=0 (4th) with ROW half-width 12, avenues at u=0 (14th) half-width 10.
// Every one of these is a PLACEHOLDER footprint; dates come from secondary sources
// and carry the confidence noted. See data/sources.csv.
const B = [];
const add = (id, name, addr, lot, o) => B.push({ id, name, addresses: [addr], lot, ...o });
// SW quadrant (u<0, v<0): 1300 block 4th St south side; 300 block 14th Ave west side
add('b-327-14th', "Gray's Campus Drug building", '327 14th Ave SE', [-34, -46, -10, -12], { built_year: 1904, stories: 2, material: 'brick', confidence: 'medium', sources: 'src-phd-tour;src-wiki' });
add('b-321-14th', "Dayton's University Store building", '321 14th Ave SE', [-34, -80, -10, -48], { built_year: 1922, stories: 2, material: 'brick', confidence: 'low', sources: 'src-alumni' });
add('b-313-14th', "Annie's Parlour building", '313 14th Ave SE', [-34, -104, -10, -82], { built_year: 1910, stories: 2, material: 'brick', confidence: 'low', sources: 'src-placeholder' });
add('b-1315-4th', 'Frame dwelling (placeholder)', '1315 4th St SE', [-70, -46, -40, -12], { built_year: 1890, demolished_year: 1925, stories: 2, material: 'wood', confidence: 'low', sources: 'src-placeholder' });
add('b-1315-4th-2', 'Commercial block (placeholder)', '1315 4th St SE', [-72, -46, -38, -12], { built_year: 1926, stories: 2, material: 'brick', confidence: 'low', sources: 'src-placeholder' });
// NW quadrant (u<0, v>0): 1300 block 4th St north side; 400 block 14th Ave west side
add('b-1308-4th', 'Varsity Theater', '1308 4th St SE', [-100, 12, -62, 60], { built_year: 1915, stories: 2, height_m: 12, material: 'brick', confidence: 'medium', sources: 'src-phd-tour;src-wiki' });
add('b-1316-4th', 'Book House / storefronts', '1316 4th St SE', [-60, 12, -36, 40], { built_year: 1920, stories: 2, material: 'brick', confidence: 'low', sources: 'src-placeholder' });
add('b-413-14th', "Al's Breakfast", '413 14th Ave SE', [-34, 30, -10, 34], { built_year: 1930, stories: 1, height_m: 4, material: 'brick', confidence: 'medium', sources: 'src-wiki-als' });
add('b-411-14th', 'Storefront row (placeholder)', '411 14th Ave SE', [-34, 12, -10, 30], { built_year: 1912, stories: 2, material: 'brick', confidence: 'low', sources: 'src-placeholder' });
add('b-425-14th', 'The Podium building', '425 14th Ave SE', [-34, 36, -10, 60], { built_year: 1925, stories: 2, material: 'stucco', confidence: 'low', sources: 'src-placeholder' });
add('b-house-of-hanson', 'House of Hanson', '1401 5th St SE (approx.)', [-60, 62, -10, 98], { built_year: 1928, demolished_year: 2013, stories: 1, material: 'brick', confidence: 'low', sources: 'src-alumni' });
add('b-venue', 'The Venue at Dinkytown', '1319 5th St SE (approx.)', [-110, 62, -10, 98], { built_year: 2014, stories: 6, material: 'glass', confidence: 'low', sources: 'src-placeholder' });
add('b-marshall', 'The Marshall', '515 14th Ave SE', [-90, 122, -10, 208], { built_year: 2015, stories: 6, material: 'glass', confidence: 'low', sources: 'src-placeholder' });
// NE quadrant (u>0, v>0): 1400 block 4th St north side; 400 block 14th Ave east side
add('b-406-14th', "Vescio's building", '406 14th Ave SE', [10, 12, 34, 34], { built_year: 1918, stories: 2, material: 'brick', confidence: 'low', sources: 'src-placeholder' });
add('b-414-14th', 'Ten O\'Clock Scholar building', '414 14th Ave SE', [10, 36, 34, 56], { built_year: 1905, demolished_year: 2013, stories: 2, material: 'wood', confidence: 'low', sources: 'src-popspots' });
add('b-1400-4th', 'Corner commercial block (placeholder)', '1400 4th St SE', [36, 12, 80, 40], { built_year: 1908, stories: 3, material: 'brick', confidence: 'low', sources: 'src-placeholder' });
add('b-1414-4th', 'Frame store (placeholder)', '1414 4th St SE', [84, 12, 110, 34], { built_year: 1888, demolished_year: 1962, stories: 1, material: 'wood', confidence: 'low', sources: 'src-placeholder' });
add('b-1414-4th-2', 'Bank building (placeholder)', '1414 4th St SE', [84, 12, 116, 44], { built_year: 1963, stories: 1, height_m: 5, material: 'concrete', confidence: 'low', sources: 'src-placeholder' });
// SE quadrant (u>0, v<0): 1400 block 4th St south side; 300 block 14th Ave east side
add('b-1401-4th', 'Corner commercial block (placeholder)', '1401 4th St SE', [10, -46, 50, -12], { built_year: 1902, stories: 2, material: 'brick', confidence: 'low', sources: 'src-placeholder' });
add('b-1411-4th', 'Storefronts (placeholder)', '1411 4th St SE', [52, -40, 96, -12], { built_year: 1930, stories: 1, height_m: 5, material: 'stucco', confidence: 'low', sources: 'src-placeholder' });
add('b-1411-4th-2', 'Student apartments (placeholder)', '1411 4th St SE', [52, -60, 116, -12], { built_year: 2018, stories: 5, material: 'glass', confidence: 'low', sources: 'src-placeholder' });
// Rebuild sequence: the 1930 storefronts give way to the 2018 apartments.
B.find((b) => b.id === 'b-1411-4th').demolished_year = 2016;

const buildings = B.map(({ lot, ...p }) => ({
  type: 'Feature',
  properties: { height_m: p.stories * 3.6, demolished_year: null, geometry_status: 'placeholder', ...p },
  geometry: { type: 'Polygon', coordinates: rect(...lot) },
}));

writeFileSync('data/buildings.geojson', JSON.stringify({ type: 'FeatureCollection', features: buildings }, null, 1));
writeFileSync('data/features.geojson', JSON.stringify({ type: 'FeatureCollection', features }, null, 1));
console.log(`wrote ${buildings.length} buildings, ${features.length} features`);
