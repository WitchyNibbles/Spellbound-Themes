import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings } from '../scripts/glyphs/batch-1.mjs';
import { glyphModules } from '../scripts/glyphs/index.mjs';
import { offGridPoints, parseGlyphSvg, pathBounds } from '../scripts/lib/svg-geometry.mjs';

// Gate 1 decision G3: batch-1 straight segments sit on the whole/half grid. The one documented exception is the gear's
// 45-degree teeth (see the comment above gearOutline in scripts/glyphs/batch-1.mjs).
const ds = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const offGrid = (name) => ds(name).flatMap((d) => offGridPoints(d));

for (const name of Object.keys(drawings).filter((key) => key !== 'gear')) {
  test(`${name}: every straight-segment point is on the whole/half grid`, () => {
    assert.deepEqual(offGrid(name), []);
  });
}

test('gear: only the 45-degree teeth are off the grid; the axis teeth are snapped', () => {
  const points = offGrid('gear');
  assert.ok(points.length > 0);
  for (const [x, y] of points) assert.ok(Math.abs(x - 8) > 2 && Math.abs(y - 8) > 2, `(${x}, ${y}) is not on a diagonal tooth`);
});

test('gear: still spin-safe after the snap, bounds centred on (8,8)', () => {
  assert.deepEqual(pathBounds(ds('gear')), { minX: 1, maxX: 15, minY: 1, maxY: 15 });
});

test('across every module, only gear, sync-arrows and cat-slash have off-grid straight-segment points (G3)', () => {
  // gear: the corners of the 45-degree teeth (Task 4); sync-arrows: the band ends at 235 and 55 degrees (Task 8);
  // cat-slash: where the knockout band cuts the head's straight edges (Task 9). Every other drawing stays on the grid.
  const offGridDrawings = glyphModules.flatMap(({ drawings: all }) => Object.entries(all))
    .filter(([, draw]) => parseGlyphSvg(draw()).paths.some((path) => offGridPoints(path.d).length > 0))
    .map(([name]) => name);
  assert.deepEqual(offGridDrawings, ['gear', 'sync-arrows', 'cat-slash']);
});
