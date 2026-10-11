import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { SVGPathData } from 'svg-pathdata';
import { drawings } from '../scripts/file-glyphs/code.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by (0.125, 0.3125), so no sample lands on a whole, half or 45-degree edge,
// mirrored or not.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.125 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.3125 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
// Width of the ink along the row y, sampled every 1/8 unit.
const rowWidth = (ds, y) => Array.from({ length: 128 }, (_, i) => 0.0625 + i / 8).filter((x) => filledAt(ds, [x, y])).length / 8;
// Slopes |dy / dx| of the straight segments that are neither horizontal nor vertical.
const slopes = (d) => {
  const found = [];
  let pen = null;
  for (const command of new SVGPathData(d).toAbs().normalizeHVZ().commands) {
    if (command.type === SVGPathData.LINE_TO && pen[0] !== command.x && pen[1] !== command.y) found.push(Math.abs((command.y - pen[1]) / (command.x - pen[0])));
    if ('x' in command) pen = [command.x, command.y];
  }
  return found;
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

test('the code module draws gem-cut and snake', () => {
  assert.deepEqual(Object.keys(drawings), ['gem-cut', 'snake']);
});

test('gem-cut (ts): a 1-unit pavilion under a 1-unit girdle, 14 wide, and the solid crown with its flat table painted last, 1 unit above (spec 6.2)', () => {
  const [pavilion, crown] = partsOf(drawings['gem-cut']());
  assert.deepEqual([pavilion.role, crown.role], ['code', 'code']);
  assert.deepEqual(pathBounds([pavilion.d, crown.d]), { minX: 1, maxX: 15, minY: 1, maxY: 14 }, '14 wide, 13 tall');
  assert.deepEqual(pathBounds([crown.d]), { minX: 1, maxX: 15, minY: 1, maxY: 5 }, 'the accent: 14x4, over the 4x4 shape minimum');
  assert.deepEqual(pathBounds([pavilion.d]), { minX: 1, maxX: 15, minY: 6, maxY: 14 });
  assert.equal(outlineGap(subpaths(pavilion.d), subpaths(crown.d)), 1, 'the crown is one unit clear of the girdle');
  assert.deepEqual([...new Set([...slopes(pavilion.d), ...slopes(crown.d)])], [1], 'every slanted edge is 45 degrees');
  const ds = [pavilion.d, crown.d];
  probe(ds, [
    [[8, 1.5], true], [[5.25, 1.25], true], [[4.25, 1.25], false], [[1.5, 4.75], true], [[1.5, 3.5], false], // the table and the crown's 45-degree sides
    [[8, 5.5], false], [[1.5, 5.5], false], [[14.5, 5.5], false], // the 1-unit cut under the crown
    [[8, 6.5], true], [[1.5, 6.5], true], [[14.5, 6.5], true], // the girdle, x1-15
    [[8, 9], false], [[8, 11.5], false], [[8, 12.5], true], [[8, 13.5], true], [[8, 14.25], false], // the hole (real), the point at the bottom
    [[3.75, 10], false], [[4.25, 10], true], [[5.75, 10], true], [[6.25, 10], false], // the left side: 2 units across horizontally (1.41 across)
    [[9.75, 10], false], [[10.25, 10], true], [[11.75, 10], true], [[12.25, 10], false], // the right side
  ], 'gem-cut');
  assert.deepEqual(SAMPLES.filter(([x, y]) => filledAt(ds, [x, y]) !== filledAt(ds, [16 - x, y])).map(String), [], 'mirrored about x = 8');
});

test('gem-cut sets the gem language (spec 6, 6.2): flat on top, widest at the girdle, pointed at the bottom', () => {
  const ds = partsOf(drawings['gem-cut']()).map((part) => part.d);
  assert.deepEqual([rowWidth(ds, 1.25), rowWidth(ds, 6.5), rowWidth(ds, 13.5)], [6.5, 14, 1]);
});

test('map: gem-cut serves ts, mts and cts and the typescript language, in code', () => {
  assert.deepEqual(mapEntry('gem-cut'), { category: 'code', fileExtensions: ['ts', 'mts', 'cts'], languageIds: ['typescript'] });
});

test('snake (py): one 2-unit band in an S-coil with a tapered tail, then the solid head (5x4) painted last (spec 6.2)', () => {
  const [band, head] = partsOf(drawings.snake());
  assert.deepEqual([band.role, head.role], ['code', 'code']);
  assert.deepEqual([subpaths(band.d).length, subpaths(head.d).length], [1, 1], 'one band and one head: a single snake, never the two-snake mark (spec 6 logo rule)');
  assert.deepEqual(pathBounds([band.d, head.d]), { minX: 3, maxX: 14, minY: 2, maxY: 15 });
  assert.deepEqual(pathBounds([head.d]), { minX: 9, maxX: 14, minY: 2, maxY: 6 }, 'the accent: 5x4, over the 4x4 shape minimum');
  const ds = [band.d, head.d];
  probe(ds, [
    [[7.5, 2.5], false], [[7.5, 3.5], true], [[7.5, 4.5], true], [[7.5, 5.5], false], // the top run, y3-5
    [[8, 7.5], false], [[8, 8.5], true], [[8, 9.5], true], [[8, 10.5], false], // the middle run, y8-10
    [[7, 12.5], false], [[7, 13.5], true], [[7, 14.5], true], // the bottom run, y13-15
    [[2.75, 6.5], false], [[3.5, 6.5], true], [[4.5, 6.5], true], [[5.5, 6.5], false], // the upper coil's left side, x3-5
    [[10.5, 11.5], false], [[11.5, 11.5], true], [[12.5, 11.5], true], [[13.25, 11.5], false], // the lower coil's right side, x11-13
    [[3.85, 3.85], false], [[4.73, 4.73], true], [[5.62, 5.62], false], // 2 units across the upper coil at 45 degrees (radii 3.5 and 1.5)
    [[10.5, 6.5], false], [[5, 11.5], false], // the coils open to the right, then to the left: an S
    [[11, 2.5], true], [[13.5, 4], true], [[11, 5.5], true], [[11, 7], false], // the head bulges 1 unit above and below the band, 2 units clear of the middle run
    [[3.25, 14.5], false], [[3.75, 14.75], true], [[4.5, 13.25], false], [[5.5, 13.5], true], // the tail tapers along a 45-degree cut to a point at (3,15)
  ], 'snake');
});

test('map: snake serves py and pyw and the python language, in code', () => {
  assert.deepEqual(mapEntry('snake'), { category: 'code', fileExtensions: ['py', 'pyw'], languageIds: ['python'] });
});
