import fs from 'node:fs';
import path from 'node:path';
import { glyphModules } from './glyphs/index.mjs';

const root = path.resolve(import.meta.dirname, '..');
let written = 0;
for (const { drawings, variants } of glyphModules) {
  for (const [dir, entries] of [['product-src', drawings], ['product-src-variants', variants]]) {
    fs.mkdirSync(path.join(root, 'icons', dir), { recursive: true });
    for (const [name, draw] of Object.entries(entries)) {
      fs.writeFileSync(path.join(root, 'icons', dir, `${name}.svg`), draw());
      written += 1;
    }
  }
}
console.log(`Wrote ${written} glyph SVGs`);
