import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/docs.mjs';
import { drawings as defaults } from '../scripts/file-glyphs/defaults.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by 0.25, so no sample lands on an edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.25 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.25 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const inkOf = (svg) => (point) => filledAt(partsOf(svg).map((part) => part.d), point);
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

test('the docs module draws contract', () => {
  assert.deepEqual(Object.keys(drawings), ['contract']);
});

test('contract (LICENSE): an ivory sheet with two text bars, knocked out around a gold wax-seal disc of diameter 6, painted last (spec 6.2)', () => {
  const [sheet, seal] = partsOf(drawings.contract());
  assert.deepEqual([sheet.role, seal.role], ['docs', 'data'], 'the seal is the one part in another role');
  assert.deepEqual(pathBounds([sheet.d]), { minX: 3, maxX: 13, minY: 1, maxY: 15 }, 'the sheet: x3-13, y1-15, inside the portrait keyline');
  assert.deepEqual(pathBounds([seal.d]), { minX: 8, maxX: 14, minY: 9, maxY: 15 }, 'the seal: diameter 6 about (11,12), lower right');
  // 1.12 to the right wall's cut end at (12,8); the flattened disc measures 1.13.
  const gap = outlineGap(subpaths(sheet.d), subpaths(seal.d));
  assert.ok(gap >= 1 && gap < 1.2, `${gap.toFixed(3)}: one unit or more from the sheet and the bars, so the two read apart in grayscale, and no more than the knockout needs`);
  probe([sheet.d, seal.d], [
    [[8, 3.5], false], [[8, 4.5], true], [[8, 5.5], false], [[11.5, 4.5], false], // the first bar, x5-11, y4-5, 1 unit from the right wall
    [[6, 7.5], true], [[10, 7.5], false], // the second bar, x5-9, y7-8, shorter
    [[3.5, 8], true], [[4.5, 8], false], [[8, 1.5], true], [[8, 2.5], false], // the left and top walls
    [[12.5, 2.5], true], [[12.5, 7.5], true], [[12.5, 8.5], false], // no fold: the right wall runs to the top, and stops at y8
    [[6.5, 14.5], true], [[7.5, 14.5], false], [[8, 11], false], // the bottom wall stops at x7; the sheet's inside is empty
    [[11, 12], true], [[11, 9.25], true], [[13.75, 12], true], [[14.25, 12], false], // the solid seal
  ], 'contract');
});

test('contract differs from the default parchment in silhouette: no fold, and the seal over the lower-right corner', () => {
  const [contract, parchment] = [inkOf(drawings.contract()), inkOf(defaults.parchment())];
  const changed = SAMPLES.filter((point) => contract(point) !== parchment(point));
  assert.ok(changed.length >= 100, `${changed.length} of 1024 samples differ`);
  assert.deepEqual([contract([12.25, 2.25]), parchment([12.25, 2.25])], [true, false], 'the corner the parchment folds');
});

test('map: contract serves LICENSE and LICENSE.md, in docs', () => {
  assert.deepEqual(mapEntry('contract'), { category: 'docs', fileNames: ['license', 'license.md'] });
});
