import { Map as MLMap, NavigationControl, AttributionControl, type GeoJSONSource, type StyleSpecification, type ExpressionSpecification } from 'maplibre-gl';
import type { Bundle, BuildingProps } from './types';
import { buildingStandsAt, labelFor, tenantsAt, activeAt } from './temporal';
import { buildingColor } from './palette';

// Approx. pixels per metre at Dinkytown's latitude (45°N): 2^zoom / 110693.
const PX_PER_M_AT_Z0 = 1 / 110693;
function metres(widthExpr: ExpressionSpecification | number, minPx = 0): ExpressionSpecification {
  // ['zoom'] may only feed a top-level interpolate, so the pixel floor goes inside each stop.
  const at = (z: number): ExpressionSpecification => ['max', minPx, ['*', widthExpr, PX_PER_M_AT_Z0 * 2 ** z]];
  return ['interpolate', ['exponential', 2], ['zoom'], 10, at(10), 22, at(22)];
}

export const CENTER: [number, number] = [-93.2356, 44.98065];
/** 14th Ave SE runs at ~28° so a 28° bearing puts 4th St SE horizontal on screen. */
export const DEFAULT_VIEW = { zoom: 17.2, pitch: 52, bearing: 28 };

function baseStyle(glyphs: string): StyleSpecification {
  return {
    version: 8,
    glyphs,
    sources: {
      ground: { type: 'geojson', data: empty() },
      lines: { type: 'geojson', data: empty() },
      buildings: { type: 'geojson', data: empty() },
      labels: { type: 'geojson', data: empty() },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#e9e0cc' } },
      { id: 'blocks', type: 'fill', source: 'ground', filter: ['==', ['get', 'kind'], 'block'],
        paint: { 'fill-color': '#ddd2b9', 'fill-outline-color': '#cdbfa2' } },
      { id: 'street-dirt', type: 'line', source: 'lines', filter: ['all', ['==', ['get', 'kind'], 'street'], ['==', ['get', 'surface'], 'dirt']],
        paint: { 'line-color': '#cdb88f', 'line-width': metres(['get', 'width_m']) } },
      { id: 'street-paved', type: 'line', source: 'lines', filter: ['all', ['==', ['get', 'kind'], 'street'], ['==', ['get', 'surface'], 'paved']],
        paint: { 'line-color': '#9a9791', 'line-width': metres(['get', 'width_m']) } },
      { id: 'street-centre', type: 'line', source: 'lines', filter: ['all', ['==', ['get', 'kind'], 'street'], ['==', ['get', 'surface'], 'paved'], ['>=', ['get', 'start_year'], 1905]],
        minzoom: 16, paint: { 'line-color': '#e7d99a', 'line-width': metres(0.3, 1), 'line-dasharray': [4, 4], 'line-opacity': 0.8 } },
      { id: 'rail', type: 'line', source: 'lines', filter: ['==', ['get', 'kind'], 'rail'],
        paint: { 'line-color': '#4b4740', 'line-width': metres(3), 'line-dasharray': [3, 1.5] } },
      { id: 'greenway', type: 'line', source: 'lines', filter: ['==', ['get', 'kind'], 'greenway'],
        paint: { 'line-color': '#7fa36b', 'line-width': metres(6) } },
      { id: 'streetcar-a', type: 'line', source: 'lines', filter: ['==', ['get', 'kind'], 'streetcar'],
        paint: { 'line-color': '#3f3b36', 'line-width': metres(0.4, 1.2), 'line-offset': metres(0.75) } },
      { id: 'streetcar-b', type: 'line', source: 'lines', filter: ['==', ['get', 'kind'], 'streetcar'],
        paint: { 'line-color': '#3f3b36', 'line-width': metres(0.4, 1.2), 'line-offset': metres(-0.75) } },
      { id: 'building-footprints', type: 'fill', source: 'buildings',
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.6 } },
      { id: 'building-3d', type: 'fill-extrusion', source: 'buildings',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.93,
          'fill-extrusion-vertical-gradient': true,
        } },
      { id: 'building-selected', type: 'fill-extrusion', source: 'buildings', filter: ['==', ['get', 'id'], ''],
        paint: { 'fill-extrusion-color': '#f0b429', 'fill-extrusion-height': ['+', ['get', 'height'], 0.3], 'fill-extrusion-opacity': 0.95 } },
      { id: 'street-names', type: 'symbol', source: 'lines', filter: ['all', ['==', ['get', 'kind'], 'street'], ['==', ['get', 'surface'], 'paved']],
        minzoom: 15.5,
        layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': ['Open Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 15, 9, 18, 12], 'text-letter-spacing': 0.12, 'symbol-spacing': 320, 'text-pitch-alignment': 'map', 'text-rotation-alignment': 'map' },
        paint: { 'text-color': '#4f4a43', 'text-halo-color': '#e9e0cc', 'text-halo-width': 1.2 } },
      { id: 'building-labels', type: 'symbol', source: 'labels', minzoom: 15,
        layout: {
          'text-field': ['get', 'label'], 'text-font': ['Open Sans Semibold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 15, 8, 17, 11, 19, 14],
          'text-max-width': 7, 'text-anchor': 'center', 'text-padding': 2,
          'symbol-sort-key': ['get', 'sort'], 'text-pitch-alignment': 'viewport',
        },
        paint: { 'text-color': ['case', ['get', 'known'], '#2b2622', '#7d746a'], 'text-halo-color': 'rgba(255,250,240,0.92)', 'text-halo-width': 1.4 } },
    ],
  };
}

function empty(): GeoJSON.FeatureCollection { return { type: 'FeatureCollection', features: [] }; }

function centroid(poly: GeoJSON.Polygon): [number, number] {
  const ring = poly.coordinates[0] ?? [];
  const pts = ring.length > 1 ? ring.slice(0, -1) : ring;
  let x = 0, y = 0;
  for (const p of pts) { x += p[0]!; y += p[1]!; }
  return [x / pts.length, y / pts.length];
}

export class MapView {
  readonly map: MLMap;
  private bundle: Bundle | null = null;
  private selectedId = '';
  onSelect: (id: string | null) => void = () => {};

  constructor(container: HTMLElement, glyphsUrl: string) {
    this.map = new MLMap({
      container,
      style: baseStyle(glyphsUrl),
      center: CENTER,
      ...DEFAULT_VIEW,
      minZoom: 14,
      maxZoom: 20,
      maxPitch: 70,
      attributionControl: false,
    });
    this.map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right');
    this.map.addControl(new AttributionControl({ compact: true, customAttribution: 'Geometry: placeholder (milestone 1). Data: see About.' }));
    this.map.on('click', 'building-3d', (e) => {
      const id = (e.features?.[0]?.properties as { id?: string } | undefined)?.id ?? null;
      this.select(id);
    });
    this.map.on('click', (e) => {
      const hits = this.map.queryRenderedFeatures(e.point, { layers: ['building-3d'] });
      if (hits.length === 0) this.select(null);
    });
    for (const layer of ['building-3d']) {
      this.map.on('mouseenter', layer, () => (this.map.getCanvas().style.cursor = 'pointer'));
      this.map.on('mouseleave', layer, () => (this.map.getCanvas().style.cursor = ''));
    }
  }

  whenReady(): Promise<void> {
    return new Promise((resolve) => (this.map.loaded() ? resolve() : this.map.once('load', () => resolve())));
  }

  setBundle(bundle: Bundle): void {
    this.bundle = bundle;
    (this.map.getSource('ground') as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: bundle.features.features.filter((f) => f.properties.kind === 'block'),
    });
  }

  select(id: string | null): void {
    this.selectedId = id ?? '';
    this.map.setFilter('building-selected', ['==', ['get', 'id'], this.selectedId]);
    this.onSelect(id);
  }

  get selected(): string | null { return this.selectedId || null; }

  /** Recompute everything that depends on the chosen year and push it to the map. */
  setYear(year: number): void {
    const b = this.bundle;
    if (!b) return;
    const lines: GeoJSON.Feature[] = b.features.features.filter((f) => f.properties.kind !== 'block' && activeAt(f.properties, year));
    (this.map.getSource('lines') as GeoJSONSource).setData({ type: 'FeatureCollection', features: lines });

    const buildings: GeoJSON.Feature[] = [];
    const labels: GeoJSON.Feature[] = [];
    for (const f of b.buildings.features) {
      const p: BuildingProps = f.properties;
      if (!buildingStandsAt(p, year)) continue;
      const tenants = tenantsAt(b.tenants, p.id, year);
      const { text, known } = labelFor(tenants, p);
      const color = buildingColor(p.material, known, year - p.built_year);
      buildings.push({ type: 'Feature', geometry: f.geometry, properties: { id: p.id, color, height: p.height_m, known } });
      labels.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: centroid(f.geometry) },
        properties: { id: p.id, label: text, known, sort: (known ? 0 : 100) + Math.max(0, 50 - p.stories) },
      });
    }
    (this.map.getSource('buildings') as GeoJSONSource).setData({ type: 'FeatureCollection', features: buildings });
    (this.map.getSource('labels') as GeoJSONSource).setData({ type: 'FeatureCollection', features: labels });
    if (this.selectedId && !buildings.some((f) => (f.properties as { id: string }).id === this.selectedId)) this.select(null);
  }
}
