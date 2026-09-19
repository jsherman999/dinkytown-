// Compiles data/ into public/data/bundle.json and validates it.
// Run: node scripts/build-data.mjs   (exit code 1 on validation errors)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.length > 1 || r[0] !== '');
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}
const num = (s) => (s === '' || s == null ? null : Number(s));
const list = (s) => (s ? s.split(';').filter(Boolean) : []);

export function buildBundle(dir = 'data') {
  const errors = [], warnings = [];
  const buildings = JSON.parse(read(`${dir}/buildings.geojson`));
  const features = JSON.parse(read(`${dir}/features.geojson`));
  const tenants = parseCsv(read(`${dir}/tenants.csv`)).map((t) => ({
    ...t, start_year: num(t.start_year), end_year: num(t.end_year), source_ids: list(t.source_ids),
  }));
  const photos = parseCsv(read(`${dir}/photos.csv`)).map((p) => ({ ...p, year: num(p.year), source_ids: list(p.source_ids) }));
  const sources = parseCsv(read(`${dir}/sources.csv`));
  const keyframes = JSON.parse(read(`${dir}/keyframes.json`)).keyframes;

  const sourceIds = new Set(sources.map((s) => s.id));
  const byId = new Map();
  for (const f of buildings.features) {
    const p = f.properties;
    if (!p.id) errors.push('building without id');
    if (byId.has(p.id)) errors.push(`duplicate building id ${p.id}`);
    byId.set(p.id, p);
    if (typeof p.built_year !== 'number') errors.push(`${p.id}: built_year missing`);
    if (p.demolished_year != null && p.demolished_year <= p.built_year) errors.push(`${p.id}: demolished before built`);
    if (!(p.stories > 0)) errors.push(`${p.id}: stories missing`);
    if (f.geometry?.type !== 'Polygon') errors.push(`${p.id}: geometry must be Polygon`);
    for (const s of list(p.sources)) if (!sourceIds.has(s)) errors.push(`${p.id}: unknown source ${s}`);
    p.sources = list(p.sources);
  }
  for (const t of tenants) {
    const b = byId.get(t.building_id);
    if (!b) { errors.push(`tenant ${t.name}: unknown building ${t.building_id}`); continue; }
    if (t.start_year == null) errors.push(`tenant ${t.name}: start_year missing`);
    if (t.end_year != null && t.end_year < t.start_year) errors.push(`tenant ${t.name}: ends before it starts`);
    if (t.start_year < b.built_year) warnings.push(`tenant ${t.name} starts ${t.start_year}, before ${b.id} was built (${b.built_year})`);
    if (b.demolished_year != null && (t.end_year == null || t.end_year > b.demolished_year)) warnings.push(`tenant ${t.name} outlives ${b.id} (demolished ${b.demolished_year})`);
    for (const s of t.source_ids) if (!sourceIds.has(s)) errors.push(`tenant ${t.name}: unknown source ${s}`);
  }
  // Overlapping tenants in the same unit are a data error (a unit has one occupant at a time).
  const byUnit = new Map();
  for (const t of tenants) {
    const k = `${t.building_id}|${t.unit}`;
    for (const o of byUnit.get(k) ?? []) {
      const aEnd = t.end_year ?? 9999, bEnd = o.end_year ?? 9999;
      if (t.start_year < bEnd && o.start_year < aEnd) errors.push(`overlap in ${k}: ${o.name} (${o.start_year}-${o.end_year ?? ''}) vs ${t.name} (${t.start_year}-${t.end_year ?? ''})`);
    }
    byUnit.set(k, [...(byUnit.get(k) ?? []), t]);
  }
  for (const p of photos) {
    if (!byId.has(p.building_id)) errors.push(`photo ${p.id}: unknown building ${p.building_id}`);
    if (!['public-domain', 'permission-granted', 'link-only'].includes(p.rights)) errors.push(`photo ${p.id}: bad rights value`);
  }
  for (const f of features.features) {
    const p = f.properties;
    if (typeof p.start_year !== 'number') errors.push(`feature ${p.id}: start_year missing`);
  }
  const years = keyframes.map((k) => k.year);
  if (years.some((y, i) => i && y <= years[i - 1])) errors.push('keyframes must be strictly increasing');

  const bundle = {
    meta: { generated_at: new Date().toISOString(), min_year: 1885, max_year: 2026, geometry_status: 'placeholder' },
    buildings, features, tenants, photos, sources, keyframes,
  };
  return { bundle, errors, warnings };
}

if (process.argv[1] && process.argv[1].endsWith('build-data.mjs')) {
  const { bundle, errors, warnings } = buildBundle();
  for (const w of warnings) console.warn('warn:', w);
  for (const e of errors) console.error('error:', e);
  if (errors.length) process.exit(1);
  mkdirSync('public/data', { recursive: true });
  writeFileSync('public/data/bundle.json', JSON.stringify(bundle));
  console.log(`bundle: ${bundle.buildings.features.length} buildings, ${bundle.tenants.length} tenants, ${bundle.keyframes.length} keyframes, ${warnings.length} warnings`);
}
