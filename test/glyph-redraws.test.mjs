import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings } from '../scripts/glyphs/batch-1.mjs';
import { glyphModules } from '../scripts/glyphs/index.mjs';
import { filledAt, parseGlyphSvg, pointInPolygon, signedArea, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Gate 1 decision G7: what each redraw must (and must not) contain, sampled with the font's nonzero fill rule.
const ds = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const fill = (name) => {
  const paths = ds(name);
  return (x, y) => filledAt(paths, [x, y]);
};

test('spider: solid round body without a play mark, thread on pixel column 7, eight separate feet', () => {
  const at = fill('spider');
  for (const [x, y] of [[6.5, 8], [8, 8], [9.5, 8], [8, 6], [8, 10]]) assert.ok(at(x, y), `body at ${x},${y}`);
  assert.ok(at(7.5, 2) && !at(8.5, 2) && !at(6.5, 2), 'thread x7-8');
  const feet = [[4.5, 2.5], [2.25, 5.5], [2.25, 10.5], [4.5, 13.5]];
  for (const [x, y] of [...feet, ...feet.map(([x, y]) => [16 - x, y])]) assert.ok(at(x, y), `foot at ${x},${y}`);
  for (const [x, y] of [[3, 4.5], [13, 4.5], [3, 11.5], [13, 11.5], [2.5, 8], [13.5, 8], [4, 8], [12, 8]]) assert.ok(!at(x, y), `gap between legs at ${x},${y}`);
});

test('spider: no point is farther than 7.25 from (8,8), so the feet overshoot the circle-14 keyline (radius 7) by at most 0.25', () => {
  const points = ds('spider').flatMap((d) => subpaths(d)).flat();
  assert.deepEqual(points.filter(([x, y]) => Math.hypot(x - 8, y - 8) > 7.25), []);
});

test('owl: large eye discs in eye rings, tufts and a beak, an open brow and no mouth, so it cannot be the cat', () => {
  const owl = fill('owl');
  for (const x of [4.5, 11.5]) {
    assert.ok(owl(x, 8.5), `pupil at ${x}`);
    assert.ok(!owl(x, 6.5), `eye hole around the pupil at ${x}`);
    assert.ok(owl(x, 5.5), `eye ring at ${x}`);
  }
  assert.ok(owl(8, 10), 'beak');
  assert.ok(owl(8, 8.75), 'the beak closes the junction where the rings touch');
  assert.ok(!owl(8, 5.5), 'open brow between the eyes');
  assert.ok(!owl(8, 14) && !owl(4, 13.5), 'no U under the eyes (it read as a grin)');
  assert.ok(fill('cat-head')(8, 5.5), 'the cat has its head wall where the owl has the open brow');
});

test('witch hat: bent tip, a slot that sets the band off, a pointed brim', () => {
  const at = fill('witch-hat');
  assert.ok(at(8, 7) && at(8, 10.5) && at(8, 13), 'cone, band and brim');
  assert.ok(!at(8, 8.5) && !at(9.5, 8.5), 'band notch: a 1-unit slot at y8-9');
  assert.ok(at(13.25, 2.5) && !at(12.5, 4.5), 'tip bent over to the right');
  assert.ok(!at(1.5, 12.25) && at(1.5, 13), 'brim tapers to a point (not a bar)');
});

test('moon gate: 2-unit arch and an r4 crescent with a deep bite', () => {
  const at = fill('moon-gate');
  assert.ok(at(8, 1.5) && at(8, 2.5) && !at(8, 3.5), 'arch top y1-3');
  assert.ok(at(1.5, 10) && at(2.5, 10) && !at(3.5, 10), 'arch legs x1-3');
  assert.ok(at(4.5, 9) && at(5.5, 9) && !at(7, 9), 'crescent back x4-6 filled, bite open');
});

test('grimoire: crescent clasp upper left, lower right clear for the Explorer badge', () => {
  const at = fill('explorer-grimoire');
  assert.ok(at(5.5, 6) && !at(8.5, 6), 'crescent at x5-9, y3-9');
  for (let x = 9.5; x <= 12.5; x += 0.5) for (let y = 9.5; y <= 11.5; y += 0.5) assert.ok(!at(x, y), `badge zone ${x},${y}`);
});

test('grimoire: the crescent clasp clears the Explorer badge measured in the gate-1 24px captures', () => {
  // Badge circle in glyph units, measured on docs/qa/2.0-gate-1/main-workbench-activitybar.png (24px bar): centre
  // (12.5, 13.17), r 5.33. The crescent is the last subpath of the drawing.
  const clasp = subpaths(ds('explorer-grimoire')[0]).at(-1);
  for (const [x, y] of clasp) assert.ok(Math.hypot(x - 12.5, y - 13.17) > 5.33, `${x},${y}`);
});

test('no drawing or variant has a negative winding anywhere (a solid drawn as a hole)', () => {
  // windingProblems only checks subpaths nested inside one another; a solid that overlaps another solid with the
  // opposite winding (a first owl redraw had one) cancels to a hole the validator does not see. Covers every module.
  for (const { drawings: all, variants } of glyphModules) {
    for (const [name, draw] of [...Object.entries(all), ...Object.entries(variants)]) {
      const polygons = parseGlyphSvg(draw()).paths.flatMap((path) => subpaths(path.d));
      for (let x = 0.125; x < 16; x += 0.25) for (let y = 0.125; y < 16; y += 0.25) {
        const winding = polygons.reduce((sum, polygon) => sum + (pointInPolygon([x, y], polygon) ? Math.sign(signedArea(polygon)) : 0), 0);
        assert.ok(winding >= 0, `${name} at ${x},${y}`);
      }
    }
  }
});
