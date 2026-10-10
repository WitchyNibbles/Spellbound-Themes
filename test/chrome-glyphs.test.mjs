import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings, variants } from '../scripts/glyphs/chrome.mjs';
import { parseGlyphSvg, pathBounds, pointInPolygon, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Geometry helpers. Points are compared as sorted sets, so a reflected outline matches whatever order polygon() wrote.
const ds = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const outline = (name) => {
  const polygons = ds(name).flatMap((d) => subpaths(d));
  assert.equal(polygons.length, 1, `${name} is one outline`);
  return polygons[0];
};
const key = (points) => points.map(([x, y]) => `${Number(x.toFixed(3))},${Number(y.toFixed(3))}`).sort();
const rounded = (bounds) => Object.fromEntries(Object.entries(bounds).map(([name, value]) => [name, Number(value.toFixed(2))]));
const bounds = (name) => rounded(pathBounds(ds(name)));
const inside = (name, point) => pointInPolygon(point, outline(name));
const reflect = {
  aboutX8: ([x, y]) => [16 - x, y], // mirror about the vertical line x = 8
  aboutColumn7: ([x, y]) => [15 - x, y], // mirror about the centre of pixel column 7 (x = 7.5)
  aboutRow7: ([x, y]) => [x, 15 - y], // mirror about the centre of pixel row 7 (y = 7.5)
  diagonal: ([x, y]) => [y, x], // reflect in the main diagonal: right <-> down, left <-> up
};

// ---- Arrows (Task 5) ----
test('arrow-right: 12 long (x2-14), head 6x7 (y4-11), every vertex on whole numbers', () => {
  assert.deepEqual(bounds('arrow-right'), { minX: 2, maxX: 14, minY: 4, maxY: 11 });
  assert.ok(outline('arrow-right').flat().every(Number.isInteger));
});

test('arrow-right: 1-unit stem on pixel row 7 and a filled head at least 5x5', () => {
  assert.equal(inside('arrow-right', [3, 7.5]), true);
  assert.equal(inside('arrow-right', [3, 6.5]), false);
  assert.equal(inside('arrow-right', [3, 8.5]), false);
  for (const point of [[9, 5], [9, 10], [13.5, 7.5]]) assert.equal(inside('arrow-right', point), true, `head covers ${point}`);
  // head reaches at least 5 deep and 5 tall (section 4 shape-accent minimum)
  assert.equal(inside('arrow-right', [8.5, 5.5]), true);
  assert.equal(inside('arrow-right', [12.5, 7]), true);
});

test('arrow-left is arrow-right mirrored about x = 8', () => {
  assert.deepEqual(key(outline('arrow-left')), key(outline('arrow-right').map(reflect.aboutX8)));
});

test('arrow-down and arrow-up are arrow-right and arrow-left reflected in the diagonal', () => {
  assert.deepEqual(key(outline('arrow-down')), key(outline('arrow-right').map(reflect.diagonal)));
  assert.deepEqual(key(outline('arrow-up')), key(outline('arrow-left').map(reflect.diagonal)));
});

test('arrow-up and arrow-down: stem on pixel column 7, like Codicon add', () => {
  for (const [name, y] of [['arrow-up', 13], ['arrow-down', 3]]) {
    assert.equal(inside(name, [7.5, y]), true, name);
    assert.equal(inside(name, [6.5, y]), false, name);
    assert.equal(inside(name, [8.5, y]), false, name);
  }
});

test('every arrow is symmetric about the centre line of its stem', () => {
  for (const name of ['arrow-right', 'arrow-left']) assert.deepEqual(key(outline(name).map(reflect.aboutRow7)), key(outline(name)), name);
  for (const name of ['arrow-up', 'arrow-down']) assert.deepEqual(key(outline(name).map(reflect.aboutColumn7)), key(outline(name)), name);
});

// ---- Add, remove, check, dots (Task 6) ----
test('add: 1-unit bars on pixel column 7 and row 7, 11 long (2-13)', () => {
  assert.deepEqual(bounds('add'), { minX: 2, maxX: 13, minY: 2, maxY: 13 });
  for (const [point, expected] of [[[7.5, 3], true], [[6.5, 3], false], [[8.5, 3], false], [[3, 7.5], true], [[3, 6.5], false], [[3, 8.5], false]]) {
    assert.equal(inside('add', point), expected, `${point}`);
  }
});

test('add is symmetric about column 7.5, row 7.5 and the diagonal', () => {
  for (const mirror of [reflect.aboutColumn7, reflect.aboutRow7, reflect.diagonal]) assert.deepEqual(key(outline('add').map(mirror)), key(outline('add')));
});

test('remove is the horizontal bar of add', () => {
  assert.deepEqual(key(outline('remove')), ['13,7', '13,8', '2,7', '2,8']);
  assert.deepEqual([bounds('remove').minX, bounds('remove').maxX], [bounds('add').minX, bounds('add').maxX]);
});

test('check: one band of 45-degree edges, 2 units tall at the bend, x2-14 y3-12', () => {
  const points = outline('check');
  points.forEach(([x1, y1], index) => {
    const [x2, y2] = points[(index + 1) % points.length];
    assert.equal(Math.abs(x2 - x1), Math.abs(y2 - y1), `edge ${x1},${y1} -> ${x2},${y2} is 45 degrees`);
  });
  assert.deepEqual(bounds('check'), { minX: 2, maxX: 14, minY: 3, maxY: 12 });
  assert.equal(inside('check', [6, 11]), true);
  assert.equal(inside('check', [6, 9.5]), false);
  assert.equal(inside('check', [6, 12.5]), false);
});

test('ellipsis: three 3x3 dots on row 7.5, 2 units apart, the middle one centred on column 7.5 (gate 2: no 2x2 variant)', () => {
  assert.deepEqual(Object.keys(variants), []);
  const dots = ds('ellipsis').flatMap((d) => d.split(/(?=M)/)).map((d) => rounded(pathBounds([d])));
  assert.deepEqual(dots, [
    { minX: 1, maxX: 4, minY: 6, maxY: 9 },
    { minX: 6, maxX: 9, minY: 6, maxY: 9 },
    { minX: 11, maxX: 14, minY: 6, maxY: 9 },
  ]);
});
