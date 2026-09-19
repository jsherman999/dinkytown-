import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import { setWorkerUrl } from 'maplibre-gl';
// MapLibre 6 ships its worker as a separate ES module and, by default, looks for it next to the
// main module. After bundling that file does not exist, so hand it the worker Vite bundles for us.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
setWorkerUrl(maplibreWorkerUrl);
import { MapView } from './mapview';
import type { Bundle } from './types';
import { clampYear, keyframeYears, nextKeyframe, prevKeyframe, snapToKeyframe } from './temporal';
import { getControls, renderAbout, renderPanel, renderTicks } from './ui';

const BASE = import.meta.env.BASE_URL; // "/" locally, "/<repo>/" on GitHub Pages
const glyphs = `${location.origin}${BASE}fonts/{fontstack}/{range}.pbf`;

async function main(): Promise<void> {
  const bundle: Bundle = await (await fetch(`${BASE}data/bundle.json`)).json();
  const { min_year: MIN, max_year: MAX } = bundle.meta;
  const years = keyframeYears(bundle.keyframes);
  const c = getControls();
  c.slider.min = c.yearInput.min = String(MIN);
  c.slider.max = c.yearInput.max = String(MAX);
  renderTicks(document.getElementById('ticks')!, bundle.keyframes, MIN, MAX);
  renderAbout(c.about, bundle);

  const view = new MapView(document.getElementById('map')!, glyphs);
  const state = readHash();
  if (state.center) view.map.jumpTo({ center: state.center, zoom: state.zoom, pitch: state.pitch, bearing: state.bearing });
  let year = clampYear(state.year ?? 1950, MIN, MAX);

  function setYear(y: number, opts: { snap?: boolean } = {}): void {
    y = clampYear(y, MIN, MAX);
    if ((opts.snap ?? c.snap.checked) && !playing) y = snapToKeyframe(y, years);
    year = y;
    c.slider.value = c.yearInput.value = String(y);
    c.badge.textContent = String(y);
    const kf = bundle.keyframes.find((k) => k.year === y);
    c.badge.title = kf ? `Saved view${kf.note ? ': ' + kf.note : ''}` : 'Between saved views';
    c.badge.classList.toggle('keyframe', Boolean(kf));
    view.setYear(y);
    renderPanel(c.panel, bundle, view.selected, y, () => view.select(null));
    writeHash();
  }

  let playing = false, timer = 0;
  function stop(): void { playing = false; clearInterval(timer); c.play.textContent = 'Play'; }
  function play(): void {
    if (playing) return stop();
    playing = true; c.play.textContent = 'Pause';
    if (year >= MAX) setYear(MIN, { snap: false });
    timer = window.setInterval(() => { if (year >= MAX) return stop(); setYear(year + 1, { snap: false }); }, 140);
  }

  c.slider.addEventListener('input', () => { stop(); setYear(Number(c.slider.value), { snap: false }); });
  c.slider.addEventListener('change', () => setYear(Number(c.slider.value)));
  c.yearInput.addEventListener('change', () => { stop(); setYear(Number(c.yearInput.value), { snap: false }); });
  c.snap.addEventListener('change', () => setYear(year));
  c.prev.addEventListener('click', () => { stop(); setYear(prevKeyframe(year, years) ?? MIN, { snap: false }); });
  c.next.addEventListener('click', () => { stop(); setYear(nextKeyframe(year, years) ?? MAX, { snap: false }); });
  c.play.addEventListener('click', play);
  c.aboutBtn.addEventListener('click', () => {
    c.about.hidden = !c.about.hidden;
    c.aboutBtn.setAttribute('aria-expanded', String(!c.about.hidden));
  });
  document.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft') { stop(); setYear(e.shiftKey ? prevKeyframe(year, years) ?? MIN : year - 1, { snap: false }); }
    else if (e.key === 'ArrowRight') { stop(); setYear(e.shiftKey ? nextKeyframe(year, years) ?? MAX : year + 1, { snap: false }); }
    else if (e.key === ' ') { e.preventDefault(); play(); }
    else if (e.key === 'Escape') { view.select(null); c.about.hidden = true; }
  });

  view.onSelect = (id) => { renderPanel(c.panel, bundle, id, year, () => view.select(null)); writeHash(); };
  view.map.on('moveend', writeHash);

  view.map.on('error', (e) => console.error('map error', e.error ?? e));
  await view.whenReady();
  view.setBundle(bundle);
  setYear(year, { snap: false });
  if (state.selected) view.select(state.selected);
  document.body.dataset.ready = '1';

  function writeHash(): void {
    const m = view.map, ctr = m.getCenter();
    const parts = [`y=${year}`, `c=${ctr.lng.toFixed(5)},${ctr.lat.toFixed(5)}`, `z=${m.getZoom().toFixed(2)}`, `p=${Math.round(m.getPitch())}`, `b=${Math.round(m.getBearing())}`];
    if (view.selected) parts.push(`s=${encodeURIComponent(view.selected)}`);
    history.replaceState(null, '', '#' + parts.join('&'));
  }
}

function readHash(): { year?: number; center?: [number, number]; zoom?: number; pitch?: number; bearing?: number; selected?: string } {
  const q = new URLSearchParams(location.hash.slice(1));
  const out: ReturnType<typeof readHash> = {};
  if (q.get('y')) out.year = Number(q.get('y'));
  const cc = q.get('c')?.split(',').map(Number);
  if (cc && cc.length === 2 && cc.every(Number.isFinite)) out.center = [cc[0]!, cc[1]!];
  if (q.get('z')) out.zoom = Number(q.get('z'));
  if (q.get('p')) out.pitch = Number(q.get('p'));
  if (q.get('b')) out.bearing = Number(q.get('b'));
  if (q.get('s')) out.selected = q.get('s')!;
  return out;
}

main().catch((err) => {
  console.error(err);
  document.getElementById('map')!.innerHTML = `<p class="fatal">Could not start the map: ${String(err)}</p>`;
});
