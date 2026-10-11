import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileGlyphModules } from '../scripts/file-glyphs/index.mjs';
import { fileGlyphProblems } from '../scripts/lib/checks/file-icon-pipeline.mjs';

const sources = path.resolve(import.meta.dirname, '..', 'icons', 'file-src');
const names = fileGlyphModules.flatMap(({ drawings }) => Object.keys(drawings));

test('icons/file-src holds exactly one source per drawing, and no drawing name is used twice', () => {
  assert.equal(new Set(names).size, names.length);
  assert.deepEqual(fs.readdirSync(sources).sort(), names.map((name) => `${name}.svg`).sort());
});

for (const { drawings } of fileGlyphModules) {
  for (const [name, draw] of Object.entries(drawings)) {
    test(`file drawing ${name}: committed source matches the generator and passes the file-glyph rules with no warning`, () => {
      const svg = draw();
      assert.deepEqual(fileGlyphProblems(svg), { errors: [], warnings: [] });
      assert.equal(fs.readFileSync(path.join(sources, `${name}.svg`), 'utf8'), svg, 'run npm run draw:file-icons');
    });
  }
}
