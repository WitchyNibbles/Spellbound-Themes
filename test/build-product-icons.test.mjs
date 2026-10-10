import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { buildProductIcons } from '../scripts/lib/product-icons-build.mjs';
import { createReport } from '../scripts/lib/report.mjs';
import { checkBuildFlags } from '../scripts/lib/checks/product-icons.mjs';

const fontkit = createRequire(import.meta.url)('fontkit');
const root = path.resolve(import.meta.dirname, '..');
const fixture = path.join(import.meta.dirname, 'fixtures', 'product-root');
const tempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-build-'));
const box = (fontPath, codepoint) => {
  const { minX, minY, maxX, maxY } = fontkit.openSync(fontPath).glyphForCodePoint(codepoint).path.bbox;
  return [minX, minY, maxX, maxY].map(Math.round);
};

test('one glyph per drawing; every ID of a drawing shares its codepoint', async () => {
  const { drawings, ids, fontPath, themePath } = await buildProductIcons({ root: fixture, outDir: tempDir() });
  assert.equal(drawings, 2);
  assert.equal(ids, 3);
  const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
  assert.equal(theme.iconDefinitions['corner-a'].fontCharacter, '\\E100');
  assert.equal(theme.iconDefinitions['corner-b'].fontCharacter, '\\E100');
  assert.deepEqual(theme.fonts[0].src, [{ path: './witchynibbles-product-icons.woff', format: 'woff' }]);
  // Source x 10-14, y 10-14 -> font x 640-896, y (16-14)*64 to (16-10)*64: no centring, one scale.
  assert.deepEqual(box(fontPath, 0xE100), [640, 128, 896, 384]);
});

test('overrides swap one drawing source without touching the map', async () => {
  const outDir = tempDir();
  const alternative = path.join(outDir, 'alt.svg');
  fs.writeFileSync(alternative, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2h4v4H2z"/></svg>');
  const { fontPath } = await buildProductIcons({ root: fixture, outDir, overrides: { corner: alternative } });
  assert.deepEqual(box(fontPath, 0xE100), [128, 640, 384, 896]);
  await assert.rejects(buildProductIcons({ root: fixture, outDir, overrides: { nope: alternative } }), /unknown drawings: nope/);
});

test('the repo build sources carry no centring flags', () => {
  const report = createReport({ enforce: ['product-pipeline'] });
  const sources = Object.fromEntries(['scripts/build-product-icons.mjs', 'scripts/lib/product-icons-build.mjs']
    .map((file) => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
  checkBuildFlags({ sources }, report);
  assert.deepEqual(report.result().errors, []);
});
