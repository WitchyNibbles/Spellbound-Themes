import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { glyphModules } from '../scripts/glyphs/index.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';

const icons = path.resolve(import.meta.dirname, '..', 'icons');

for (const { drawings, variants } of glyphModules) {
  for (const [kind, entries, dir] of [['drawing', drawings, 'product-src'], ['variant', variants, 'product-src-variants']]) {
    for (const [name, draw] of Object.entries(entries)) {
      test(`${kind} ${name}: committed SVG matches the generator and passes the glyph rules`, () => {
        const svg = draw();
        assert.deepEqual(glyphRuleProblems(svg).errors, []);
        assert.equal(fs.readFileSync(path.join(icons, dir, `${name}.svg`), 'utf8'), svg, 'run npm run draw:glyphs');
      });
    }
  }
}
