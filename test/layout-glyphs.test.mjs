import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings as batchOne } from '../scripts/glyphs/batch-1.mjs';
import { glyphModules } from '../scripts/glyphs/index.mjs';
import { drawings } from '../scripts/glyphs/layout.mjs';
import { drawings as panel } from '../scripts/glyphs/panel.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, pointInPolygon, signedArea, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers. Ink is sampled with the font's nonzero rule at the centre of every pixel (x.5, y.5), never on an edge: every
// layout edge is a whole number.
const pathsOf = (svg) => parseGlyphSvg(svg).paths.map((path) => path.d);
const box = (ds) => Object.fromEntries(Object.entries(pathBounds(ds)).map(([key, value]) => [key, Number(value.toFixed(2))]));
const bounds = (svg) => box(pathsOf(svg));
const outlinesOf = (svg) => subpaths(pathsOf(svg).join(''));
const keys = (polygons) => polygons.map((poly) => JSON.stringify(poly)).sort();
const inkAt = (name, [x, y]) => filledAt(pathsOf(drawings[name]()), [x, y]);
const pixels = Array.from({ length: 16 }, (_, index) => index + 0.5);
// One row of pixel centres, x1-15 (the window's columns), as '#' for ink and '.' for none.
const row = (name, y) => pixels.slice(1, 15).map((x) => (inkAt(name, [x, y]) ? '#' : '.')).join('');
// The pixel centres where `name` has ink and `other`, read through `map`, does not (or the other way round).
const mismatches = (name, other, map) => pixels.flatMap((x) => pixels.map((y) => [x, y]))
  .filter((point) => inkAt(name, point) !== inkAt(other, map(point)))
  .map(([x, y]) => `${x},${y}`);

test('layout drawings follow the glyph rules: no errors and no warnings', () => {
  for (const [name, draw] of Object.entries(drawings)) {
    const { errors, warnings } = glyphRuleProblems(draw());
    assert.deepEqual({ errors, warnings }, { errors: [], warnings: [] }, name);
  }
});

test('every layout glyph is one square window, x1-15 y1-15, with 1-unit walls', () => {
  const [window] = outlinesOf(drawings['pane-left']());
  for (const [name, draw] of Object.entries(drawings)) {
    assert.deepEqual(bounds(draw()), { minX: 1, maxX: 15, minY: 1, maxY: 15 }, name);
    assert.deepEqual(outlinesOf(draw())[0], window, `${name} starts with the shared window`);
    for (const point of [[1.5, 4.5], [14.5, 11.5], [4.5, 1.5], [11.5, 14.5]]) assert.equal(inkAt(name, point), true, `${name} wall at ${point}`);
  }
});

test('the layout window is its own frame: no other drawing has it, the terminal is landscape, expand-corners is open', () => {
  const [window] = keys(outlinesOf(drawings['pane-left']()).slice(0, 1));
  for (const module of glyphModules.filter(({ drawings: all }) => all !== drawings)) {
    for (const [name, draw] of Object.entries(module.drawings)) assert.ok(!keys(outlinesOf(draw())).includes(window), name);
  }
  assert.deepEqual(bounds(batchOne.terminal()), { minX: 1, maxX: 15, minY: 2, maxY: 14 });
  assert.deepEqual(bounds(panel['console-spider']()), { minX: 1, maxX: 15, minY: 2, maxY: 15 });
  assert.equal(outlinesOf(panel['expand-corners']()).some((poly) => pointInPolygon([8, 8], poly)), false, 'no bracket encloses the centre');
});

// ---- Frame toggles (Task 8) ----
test('frame toggles: a 4-unit side pane, a divider and the editor area; on fills the pane, off outlines it', () => {
  // The pixel row at y8-9 across the window, x1-15.
  assert.equal(row('pane-left', 8.5), '######.......#');
  assert.equal(row('pane-left-off', 8.5), '#....#.......#');
  assert.equal(row('pane-right', 8.5), '#.......######');
  assert.equal(row('pane-right-off', 8.5), '#.......#....#');
  // The bottom pane across the window's height, read down the pixel column at x8-9.
  const column = (name) => pixels.slice(1, 15).map((y) => (inkAt(name, [8.5, y]) ? '#' : '.')).join('');
  assert.equal(column('pane-bottom'), '#.......######');
  assert.equal(column('pane-bottom-off'), '#.......#....#');
});

test('on and off differ only in the pane: one hole, the size of the pane', () => {
  const panes = { left: [2, 2, 6, 14], right: [10, 2, 14, 14], bottom: [2, 10, 14, 14] };
  for (const [side, [x1, y1, x2, y2]] of Object.entries(panes)) {
    const [on, off] = [outlinesOf(drawings[`pane-${side}`]()), outlinesOf(drawings[`pane-${side}-off`]())];
    const extra = keys(off).filter((key) => !keys(on).includes(key));
    assert.equal(off.length, on.length + 1, side);
    assert.equal(extra.length, 1, side);
    assert.deepEqual(box([`M${JSON.parse(extra[0]).map(([x, y]) => `${x} ${y}`).join('L')}Z`]), { minX: x1, maxX: x2, minY: y1, maxY: y2 }, side);
    // Every pixel centre where on and off differ lies inside the pane, and every pixel of the pane differs.
    const differ = mismatches(`pane-${side}`, `pane-${side}-off`, (point) => point).map((key) => key.split(',').map(Number));
    assert.ok(differ.every(([x, y]) => x > x1 && x < x2 && y > y1 && y < y2), side);
    assert.equal(differ.length, (x2 - x1) * (y2 - y1), side);
  }
});

test('the right pane is the left pane mirrored about x = 8, and the bottom pane the left pane turned onto the bottom edge', () => {
  for (const state of ['', '-off']) {
    assert.deepEqual(mismatches(`pane-right${state}`, `pane-left${state}`, ([x, y]) => [16 - x, y]), [], `right${state}`);
    assert.deepEqual(mismatches(`pane-bottom${state}`, `pane-left${state}`, ([x, y]) => [16 - y, x]), [], `bottom${state}`);
  }
});

// ---- Split editor and Customize Layout (Task 9) ----
test('split-horizontal (Split Editor Right): side-by-side panes, the divider on column 7, a block in the new right pane', () => {
  assert.equal(row('split-horizontal', 8.5), '#.....#.####.#');
  // The block is the filled part, a solid 4x10 inside the right pane's hole, one unit clear of the divider and walls.
  const [window, ...inner] = outlinesOf(drawings['split-horizontal']());
  const holes = inner.filter((poly) => signedArea(poly) < 0);
  const blocks = inner.filter((poly) => signedArea(poly) > 0);
  assert.equal(holes.length, 2);
  assert.equal(blocks.length, 1);
  assert.deepEqual(box([`M${blocks[0].map(([x, y]) => `${x} ${y}`).join('L')}Z`]), { minX: 9, maxX: 13, minY: 3, maxY: 13 });
  assert.equal(outlineGap(blocks, [window, ...holes]), 1);
});

test('split-vertical (Split Editor Down) is split-horizontal reflected about the diagonal: stacked panes, divider on row 7', () => {
  assert.deepEqual(mismatches('split-vertical', 'split-horizontal', ([x, y]) => [y, x]), []);
  const column = pixels.slice(1, 15).map((y) => (inkAt('split-vertical', [8.5, y]) ? '#' : '.')).join('');
  assert.equal(column, '#.....#.####.#');
});

test('configure-layout-icon: the window in four panes, the dividers on column 7 and row 7, the top-left pane filled', () => {
  assert.equal(row('four-panes', 4.5), '#######......#');
  assert.equal(row('four-panes', 7.5), '##############');
  assert.equal(row('four-panes', 10.5), '#.....#......#');
  assert.equal(outlinesOf(drawings['four-panes']()).filter((poly) => signedArea(poly) < 0).length, 3, 'three open panes');
});
