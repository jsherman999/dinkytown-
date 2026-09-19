import type { Bundle, BuildingProps, Keyframe } from './types';
import { buildingStandsAt, nearestPhoto, tenantsAt, activeAt } from './temporal';
import { MATERIAL_COLORS } from './palette';

const $ = <T extends HTMLElement>(sel: string): T => {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`missing element ${sel}`);
  return el;
};

export interface Controls {
  slider: HTMLInputElement; yearInput: HTMLInputElement; snap: HTMLInputElement;
  play: HTMLButtonElement; prev: HTMLButtonElement; next: HTMLButtonElement;
  badge: HTMLElement; panel: HTMLElement; about: HTMLElement; aboutBtn: HTMLButtonElement;
}

export function getControls(): Controls {
  return {
    slider: $('#slider'), yearInput: $('#year-input'), snap: $('#snap'), play: $('#play'),
    prev: $('#prev-kf'), next: $('#next-kf'), badge: $('#year-badge'), panel: $('#panel'),
    about: $('#about'), aboutBtn: $('#about-btn'),
  };
}

export function renderTicks(container: HTMLElement, keyframes: Keyframe[], min: number, max: number): void {
  container.replaceChildren();
  const extras = keyframes.filter((k) => k.year % 5 !== 0).map((k) => k.year);
  for (const k of keyframes) {
    const t = document.createElement('span');
    t.className = 'tick' + (k.year % 10 === 0 ? ' decade' : '') + (k.year % 5 !== 0 ? ' extra' : '');
    t.style.left = `${((k.year - min) / (max - min)) * 100}%`;
    t.title = `${k.year}${k.note ? ' – ' + k.note : ''}`;
    const crowded = extras.some((e) => e !== k.year && Math.abs(e - k.year) < 6);
    if ((k.year % 20 === 0 && !crowded) || k.year % 5 !== 0) {
      const l = document.createElement('i');
      l.textContent = String(k.year);
      t.appendChild(l);
    }
    container.appendChild(t);
  }
}

const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const conf = (c: string): string => `<span class="conf conf-${esc(c)}">${esc(c)}</span>`;

export function renderPanel(panel: HTMLElement, bundle: Bundle, id: string | null, year: number, onClose: () => void): void {
  if (!id) { panel.hidden = true; panel.replaceChildren(); return; }
  const f = bundle.buildings.features.find((x) => x.properties.id === id);
  if (!f) { panel.hidden = true; return; }
  const p: BuildingProps = f.properties;
  const stands = buildingStandsAt(p, year);
  const current = new Set(tenantsAt(bundle.tenants, id, year).map((t) => `${t.unit}|${t.name}|${t.start_year}`));
  const all = bundle.tenants.filter((t) => t.building_id === id).sort((a, b) => a.start_year - b.start_year);
  const photo = nearestPhoto(bundle.photos, id, year);
  const src = (ids: string[]) => ids.map((s) => bundle.sources.find((x) => x.id === s)).filter(Boolean)
    .map((s) => s!.url ? `<a href="${esc(s!.url)}" target="_blank" rel="noopener">${esc(s!.citation)}</a>` : esc(s!.citation));

  panel.innerHTML = `
    <button class="close" type="button" aria-label="Close">×</button>
    <h2>${esc(p.name)}</h2>
    <p class="addr">${p.addresses.map(esc).join(', ')}</p>
    <dl>
      <dt>Built</dt><dd>${p.built_year}${p.demolished_year ? ` · demolished ${p.demolished_year}` : ''} ${conf(p.confidence)}</dd>
      <dt>Form</dt><dd>${p.stories} ${p.stories === 1 ? 'story' : 'stories'}, ${esc(p.material)}, ~${Math.round(p.height_m)} m</dd>
      <dt>Footprint</dt><dd>${esc(p.geometry_status)}</dd>
    </dl>
    ${stands ? '' : `<p class="note">Not standing in ${year}.</p>`}
    <h3>Photo nearest ${year}</h3>
    ${photo
      ? `<figure>${photo.rights === 'link-only' ? '' : `<img src="${esc(photo.thumbnail || photo.url)}" alt="${esc(p.name)}, ${photo.year}">`}
         <figcaption>${photo.year}${photo.year_precision === 'circa' ? ' (circa)' : ''} · ${esc(photo.credit)} · <a href="${esc(photo.url)}" target="_blank" rel="noopener">view source</a></figcaption></figure>`
      : `<p class="note">No photo on file yet.</p>`}
    <h3>Occupants</h3>
    ${all.length ? `<ul class="tenants">${all.map((t) => `<li class="${current.has(`${t.unit}|${t.name}|${t.start_year}`) ? 'current' : ''}${activeAt(t, year) ? '' : ''}">
        <b>${esc(t.name)}</b> <span class="range">${t.start_precision === 'circa' ? 'c.' : ''}${t.start_year}–${t.end_year ?? 'present'}</span>
        <span class="unit">${esc(t.unit)} · ${esc(t.category)}</span> ${conf(t.confidence)}</li>`).join('')}</ul>`
      : '<p class="note">No occupants recorded.</p>'}
    <h3>Sources</h3>
    <ul class="sources">${[...new Set([...p.sources, ...all.flatMap((t) => t.source_ids)])].flatMap((s) => src([s])).map((s) => `<li>${s}</li>`).join('') || '<li>None</li>'}</ul>
  `;
  panel.hidden = false;
  panel.querySelector<HTMLButtonElement>('.close')!.addEventListener('click', onClose);
}

export function renderAbout(el: HTMLElement, bundle: Bundle): void {
  const kf = bundle.keyframes;
  el.innerHTML = `
    <h2>About this map</h2>
    <p><b>Milestone 1.</b> Everything you see is scaffolding for the real dataset: building footprints are
    schematic rectangles on an approximate street grid, and most occupants are marked <i>(placeholder)</i>.
    Records with a named source carry the confidence shown. Nothing here is verified against Sanborn sheets,
    permit cards, or city directories yet.</p>
    <h3>Legend</h3>
    <ul class="legend">
      ${Object.entries(MATERIAL_COLORS).map(([m, c]) => `<li><i style="background:${c}"></i>${m}</li>`).join('')}
      <li><i style="background:#cfc7b8"></i>occupant unknown for this year</li>
      <li><i style="background:#f0b429"></i>selected</li>
      <li><i class="line" style="background:#3f3b36"></i>streetcar tracks (to 1954)</li>
      <li><i class="line" style="background:#4b4740"></i>railroad corridor</li>
      <li><i class="line" style="background:#7fa36b"></i>Dinkytown Greenway</li>
    </ul>
    <h3>Saved views (${kf.length})</h3>
    <p>Every five years from ${kf[0]!.year}, plus ${kf.filter((k) => k.year % 5 !== 0).map((k) => k.year).join(', ') || 'none'}.
    Tick marks on the slider mark them; "snap" jumps between them.</p>
    <h3>Reading the timeline</h3>
    <p>A record applies from its start year up to, but not including, its end year. A building demolished in
    2013 is gone in the 2013 view. Buildings with no known occupant for the chosen year are washed out.</p>
    <h3>Controls</h3>
    <p>Drag or scroll to pan and zoom; pinch on touch screens. Right-drag or two-finger drag to tilt and rotate.
    Arrow keys step one year; with Shift, they jump between saved views. Click a building for details.</p>
    <h3>Data files</h3>
    <p><code>data/buildings.geojson</code>, <code>data/tenants.csv</code>, <code>data/photos.csv</code>,
    <code>data/sources.csv</code>, <code>data/keyframes.json</code>. Bundle generated ${esc(bundle.meta.generated_at.slice(0, 10))}.</p>
  `;
}
