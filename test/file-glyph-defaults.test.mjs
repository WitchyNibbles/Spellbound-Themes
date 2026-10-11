import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings } from '../scripts/file-glyphs/defaults.mjs';
import { fileIconDocument, folderBody } from '../scripts/file-glyphs/parts.mjs';
import { drawings as productGlyphs } from '../scripts/glyphs/editor.mjs';
import { filledAt, parseGlyphSvg, pathBounds } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by 0.25, so no sample lands on an edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.25 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.25 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ fill, d }));
const inkOf = (ds) => (point) => filledAt(ds, point);
const drawingInk = (name) => inkOf(partsOf(drawings[name]()).map((part) => part.d));
const differences = (a, b) => SAMPLES.filter((point) => a(point) !== b(point)).map(String);

test('the default drawings are parchment, folder and folder-open', () => {
  assert.deepEqual(Object.keys(drawings), ['parchment', 'folder', 'folder-open']);
});

test('parchment: a muted sheet x3-13, y1-15 and the muted fold painted last, together the product symbol-file page', () => {
  const [sheet, fold] = partsOf(drawings.parchment());
  assert.deepEqual([sheet.fill, fold.fill], ['{muted}', '{muted}']);
  assert.deepEqual(pathBounds([sheet.d, fold.d]), { minX: 3, maxX: 13, minY: 1, maxY: 15 });
  assert.deepEqual(differences(inkOf([sheet.d, fold.d]), inkOf(parseGlyphSvg(productGlyphs.page()).paths.map((path) => path.d))), []);
  assert.deepEqual(pathBounds([fold.d]), { minX: 8, maxX: 13, minY: 1, maxY: 6 }, 'the fold: 5x5 with a 4-unit 45-degree edge');
  for (const [point, filled] of [[[10, 4], true], [[12.5, 5.5], true], [[8.5, 1.5], true], [[12, 2], false], [[10.5, 1.5], false]]) {
    assert.equal(inkOf([fold.d])(point), filled, `fold ${point}`);
  }
  for (const [point, filled] of [[[3.5, 8], true], [[4.5, 8], false], [[12.5, 10], true], [[11.5, 10], false], [[8, 14.5], true], [[8, 13.5], false], [[6, 1.5], true], [[6, 2.5], false], [[10, 6.5], false]]) {
    assert.equal(drawingInk('parchment')(point), filled, `parchment ${point}`);
  }
});

test('folder and folder-open are the folder construction, closed and open, with no badge', () => {
  assert.equal(drawings.folder(), fileIconDocument(folderBody()));
  assert.equal(drawings['folder-open'](), fileIconDocument(folderBody({ open: true })));
});

test('folder and folder-open differ in silhouette (the front flap), not only inside', () => {
  const changed = differences(drawingInk('folder'), drawingInk('folder-open'));
  assert.ok(changed.length >= 100, `${changed.length} of 1024 samples differ (145 as drawn)`);
  assert.ok(changed.some((point) => point === '14.75,9.25'), 'the flap leaves the closed folder\'s right wall');
});
