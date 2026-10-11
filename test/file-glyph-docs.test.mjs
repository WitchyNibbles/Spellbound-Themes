import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/docs.mjs';
import { drawings as defaults } from '../scripts/file-glyphs/defaults.mjs';
import { drawings as batch1 } from '../scripts/glyphs/batch-1.mjs';
import { drawings as panel } from '../scripts/glyphs/panel.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, pointInPolygon, signedArea, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by 0.25, so no sample lands on an edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.25 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.25 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const inkOf = (svg) => (point) => filledAt(partsOf(svg).map((part) => part.d), point);
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

test('the docs module draws contract, quill, scroll, grimoire-open and owl', () => {
  assert.deepEqual(Object.keys(drawings), ['contract', 'quill', 'scroll', 'grimoire-open', 'owl']);
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

// ---- Gate 6: the docs batch (spec 6, G42) ----
const box = ({ minX, maxX, minY, maxY }) => [minX, maxX, minY, maxY].map((value) => Number(value.toFixed(2)));
// One drawing against its construction: the roles of its parts in paint order, its bounds and its accent's (the last
// part), the accent's distance from the rest (0 where G42 lets an accent that is part of the silhouette touch it; else
// at least the unit of section 4, less 0.01 for flattened arcs), and ink probes away from every edge.
const checkShape = (svg, { roles, bounds, accent, gap, ink }, label) => {
  const parts = partsOf(svg);
  assert.deepEqual(parts.map((part) => part.role), roles, `${label}: roles in paint order`);
  assert.deepEqual(box(pathBounds(parts.map((part) => part.d))), bounds, `${label}: bounds`);
  assert.deepEqual(box(pathBounds([parts.at(-1).d])), accent, `${label}: accent bounds`);
  const measured = outlineGap(parts.slice(0, -1).flatMap((part) => subpaths(part.d)), subpaths(parts.at(-1).d));
  if (gap === 0) assert.equal(measured, 0, `${label}: the accent is part of the silhouette and meets it (G42)`);
  else assert.ok(measured >= gap - 0.01, `${label}: the accent keeps ${gap} from the outline (measured ${measured.toFixed(3)})`);
  probe(parts.map((part) => part.d), ink, label);
};

// The quill and the owl are the approved product glyphs split into an outline part and the accent, so a Markdown file
// and the Output view, a CHANGELOG and the Timeline view share one drawing (as the parchment and symbol-file do).
for (const [name, product, accent, what] of [
  ['quill', panel.quill, [1, 5, 10, 15], 'the solid vane (G26), shaft, nib and lines, the ink drop painted last'],
  ['owl', batch1.owl, [3, 13, 7, 10], 'the eye rings, tufts and beak, the two 3x3 eyes painted last'],
]) {
  test(`${name}: the product ${name} glyph split into ${what}`, () => {
    const parts = partsOf(drawings[name]());
    assert.deepEqual(parts.map((part) => part.role), ['docs', 'docs']);
    assert.deepEqual(box(pathBounds([parts[1].d])), accent, 'the accent');
    const productInk = parseGlyphSvg(product()).paths.map((part) => part.d);
    const changed = SAMPLES.filter((point) => filledAt(parts.map((part) => part.d), point) !== filledAt(productInk, point));
    assert.deepEqual(changed.map(String), [], `the same ink as the product ${name}`);
  });
}

const SHAPES = {
  scroll: {
    what: 'txt, a curled blank parchment unrolling: the top roll x2-12 painted last, the bottom roll x4-14, sides at x4 and x11, nothing written',
    roles: ['docs', 'docs'], bounds: [2, 14, 1, 15], accent: [2, 12, 1, 5], gap: 0,
    ink: [
      [[7, 2.5], true], [[2.5, 3], true], [[13, 3], false], [[2.5, 4.5], false], // the top roll, x2-12, with its round left end
      [[9, 13.5], true], [[13.5, 13], true], [[3, 13.5], false], [[3.5, 11.5], false], // the bottom roll, x4-14, offset the other way
      [[4.5, 8], true], [[11.5, 8], true], [[3.5, 8], false], [[12.5, 8], false], // the sheet's sides, overlapping the rolls
      [[8, 8], false], [[5.5, 5.5], false], [[10.5, 10.5], false], // the blank 6x6 interior
    ],
  },
  'grimoire-open': {
    what: 'README.md, an open grimoire: two pages dipping into the spine on column 7, three lines, the crescent painted last on the right page',
    roles: ['docs', 'docs'], bounds: [1, 15, 2, 15], accent: [9, 13, 5, 11], gap: 1,
    ink: [
      [[7.5, 3], false], [[7.5, 4.5], true], [[7.5, 9], true], [[7.5, 14.5], true], [[2.5, 14.5], false], // the spine and the two dips
      [[2.5, 9], false], [[4.5, 6.5], true], [[4.5, 7.5], false], [[4.5, 10.5], true], [[1.5, 9], true], [[14.5, 9], true], // pages, lines
      [[10, 8], true], [[12.5, 8], false], [[13, 11.5], false], [[13.5, 12.5], true], // the crescent on the right page, opening right
    ],
  },
};
for (const [name, shape] of Object.entries(SHAPES)) test(`${name} (${shape.what})`, () => checkShape(drawings[name](), shape, name));

test('the txt scroll, the default parchment and the contract differ in silhouette: rolls, a folded corner, a seal', () => {
  const silhouette = (svg) => { const solids = partsOf(svg).flatMap((part) => subpaths(part.d)).filter((polygon) => signedArea(polygon) > 0); return (point) => solids.some((polygon) => pointInPolygon(point, polygon)); };
  const sheets = { scroll: silhouette(drawings.scroll()), parchment: silhouette(defaults.parchment()), contract: silhouette(drawings.contract()) };
  for (const [a, b] of [['scroll', 'parchment'], ['scroll', 'contract']]) {
    const changed = SAMPLES.filter((point) => sheets[a](point) !== sheets[b](point)).length;
    assert.ok(changed >= 100, `${a} and ${b}: ${changed} of 1024 samples differ`);
  }
});

const MAP = {
  quill: { category: 'docs', fileExtensions: ['md', 'mdx'], languageIds: ['markdown'] },
  scroll: { category: 'docs', fileExtensions: ['txt'] },
  'grimoire-open': { category: 'docs', fileNames: ['readme.md'] },
  owl: { category: 'docs', fileNames: ['changelog.md'] },
};
for (const [name, entry] of Object.entries(MAP)) {
  const keys = [...new Set(Object.entries(entry).filter(([property]) => property !== 'category').flatMap(([, list]) => list))];
  test(`map: ${name} serves ${keys.join(', ')}, in docs`, () => assert.deepEqual(mapEntry(name), entry));
}
