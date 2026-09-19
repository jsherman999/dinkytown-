import { describe, expect, it } from 'vitest';
import { buildBundle, parseCsv } from '../scripts/build-data.mjs';

describe('data bundle', () => {
  it('parses quoted CSV fields', () => {
    expect(parseCsv('a,b\n1,"x, y"\n2,"say ""hi"""\n')).toEqual([{ a: '1', b: 'x, y' }, { a: '2', b: 'say "hi"' }]);
  });
  it('validates the checked-in dataset without errors', () => {
    const { bundle, errors } = buildBundle('data');
    expect(errors).toEqual([]);
    expect(bundle.keyframes.map((k) => k.year)).toContain(1984);
    expect(bundle.buildings.features.length).toBeGreaterThan(0);
  });
});
