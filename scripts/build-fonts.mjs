// Generates self-hosted MapLibre glyph PBFs so labels work without a third-party CDN.
// Run: node scripts/build-fonts.mjs  (output: public/fonts/<fontstack>/<range>.pbf)
import { buildFonts } from 'maplibre-font-maker-node';

const base = './node_modules/@fontsource/open-sans/files';
await buildFonts({
  output: './public/fonts',
  fontstacks: [
    { font: `${base}/open-sans-latin-400-normal.woff2`, fontstack: 'Open Sans Regular', ranges: 'latin' },
    { font: `${base}/open-sans-latin-600-normal.woff2`, fontstack: 'Open Sans Semibold', ranges: 'latin' },
    { font: `${base}/open-sans-latin-700-normal.woff2`, fontstack: 'Open Sans Bold', ranges: 'latin' },
  ],
});
console.log('fonts written to public/fonts');
