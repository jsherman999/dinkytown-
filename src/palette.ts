import type { Material } from './types';

/** Roof/mass colours by material. Older brick reads darker; glass-era towers cooler. */
export const MATERIAL_COLORS: Record<Material, string> = {
  brick: '#b0634a',
  wood: '#d7b072',
  stucco: '#e3d3b0',
  glass: '#8ea7b8',
  concrete: '#b8b3aa',
};
const UNKNOWN_MIX = '#cfc7b8';

function hexToRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

/** Buildings with no known tenant at the chosen year are washed out so gaps read as gaps. */
export function buildingColor(material: Material, known: boolean, ageYears: number): string {
  const base = MATERIAL_COLORS[material] ?? MATERIAL_COLORS.brick;
  const aged = mix(base, '#6f5a4e', Math.min(0.25, Math.max(0, ageYears) / 400));
  return known ? aged : mix(aged, UNKNOWN_MIX, 0.6);
}
