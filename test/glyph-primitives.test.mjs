import test from 'node:test';
import assert from 'node:assert/strict';
import { crescent, disc, frame, knockOut, leaf, polygon, rect, ring, roundRect, svgDocument } from '../scripts/glyphs/primitives.mjs';
import { pathBounds, signedArea, subpaths, windingProblems } from '../scripts/lib/svg-geometry.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';

const sign = (d) => Math.sign(signedArea(subpaths(d)[0]));

test('every primitive honours its direction', () => {
  for (const [label, cw, ccw] of [
    ['polygon', polygon([[2, 2], [6, 2], [4, 6]]), polygon([[2, 2], [6, 2], [4, 6]], 'ccw')],
    ['rect', rect(2, 2, 4, 4), rect(2, 2, 4, 4, 'ccw')],
    ['roundRect', roundRect(2, 2, 12, 12, 1), roundRect(2, 2, 12, 12, 1, 'ccw')],
    ['disc', disc(8, 8, 4), disc(8, 8, 4, 'ccw')],
    ['leaf', leaf([4, 8], [12, 8], 4), leaf([4, 8], [12, 8], 4, 'ccw')],
    ['crescent', crescent({ cx: 8, cy: 8, r: 3 }), crescent({ cx: 8, cy: 8, r: 3, dir: 'ccw' })],
  ]) {
    assert.equal(sign(cw), 1, `${label} cw`);
    assert.equal(sign(ccw), -1, `${label} ccw`);
  }
});

// Arc endpoints such as 8 ± 2.828 are written to 3 decimals, which moves the implied arc centre by about 0.001 unit,
// so bounds are compared at 2 decimals.
const roundedBounds = (d) => Object.fromEntries(Object.entries(pathBounds([d])).map(([key, value]) => [key, Number(value.toFixed(2))]));

test('crescent r=3 is 4x6 in every facing', () => {
  assert.deepEqual(roundedBounds(crescent({ cx: 8, cy: 8, r: 3, facing: 'right' })), { minX: 5, maxX: 9, minY: 5, maxY: 11 });
  assert.deepEqual(roundedBounds(crescent({ cx: 8, cy: 8, r: 3, facing: 'left' })), { minX: 7, maxX: 11, minY: 5, maxY: 11 });
  assert.deepEqual(roundedBounds(crescent({ cx: 8, cy: 8, r: 3, facing: 'up' })), { minX: 5, maxX: 11, minY: 7, maxY: 11 });
  assert.deepEqual(roundedBounds(crescent({ cx: 8, cy: 8, r: 3, facing: 'down' })), { minX: 5, maxX: 11, minY: 5, maxY: 9 });
});

test('frames and rings come out with real holes', () => {
  assert.deepEqual(windingProblems([frame(3, 1, 10, 14).join('')]), []);
  assert.deepEqual(windingProblems([[...ring(8, 8, 6), crescent({ cx: 8, cy: 8, r: 3 })].join('')]), []);
});

test('svgDocument output satisfies the glyph rules', () => {
  assert.deepEqual(glyphRuleProblems(svgDocument(frame(2, 2, 12, 12), disc(8, 8, 2))).errors, []);
});

test('knockOut removes a convex region, keeps holes as holes and leaves other paths untouched', () => {
  const region = [[1, 0, 7], [0, -1, -5]]; // x >= 7 and y <= 5: the frame's top-right corner
  const far = rect(12, 12, 2, 2);
  const kept = knockOut([frame(2, 2, 8, 8, { r: 0 }), far], region);
  assert.equal(kept.at(-1), far);
  assert.deepEqual(kept.slice(0, -1).map((d) => Math.sign(signedArea(subpaths(d)[0]))), [1, 1, -1, -1], 'two solid pieces, two hole pieces');
  assert.deepEqual(windingProblems([kept.join('')]), []);
  assert.deepEqual(glyphRuleProblems(svgDocument(kept)).errors, []);
  assert.deepEqual(subpaths(kept.join('')).flat().filter(([x, y]) => x > 7 + 1e-9 && y < 5 - 1e-9), []);
  assert.deepEqual(roundedBounds(kept.join('')), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  // The wall pieces left of x = 7 and below y = 5 are still there: the frame is open only at the corner.
  assert.deepEqual(roundedBounds(kept.slice(0, -1).join('')), { minX: 2, maxX: 10, minY: 2, maxY: 10 });
});

test('knockOut adds no duplicate points when the region boundary passes through a vertex', () => {
  // knockOut removes the region, so [[1, 0, 2]] (x >= 2) removes the right half of the diamond and [[-1, 0, -2]]
  // (x <= 2) the left half. Both boundaries run through the top and bottom vertices; whichever half is left over is a
  // triangle of three points, with no vertex repeated.
  const diamond = polygon([[2, 0], [4, 2], [2, 4], [0, 2]]);
  assert.deepEqual(knockOut([diamond], [[1, 0, 2]]), ['M2 0L2 4L0 2Z'], 'x >= 2 removed: the left triangle is left');
  assert.deepEqual(knockOut([diamond], [[-1, 0, -2]]), ['M2 0L4 2L2 4Z'], 'x <= 2 removed: the right triangle is left');
  // -0.1x >= -0.3 (x <= 3, removed) meets the apex (3, 3) up to floating-point noise (about 5e-17); it still counts as
  // on the boundary, so the right half is left with the apex once.
  assert.deepEqual(knockOut([polygon([[0, 0], [6, 0], [3, 3]])], [[-0.1, 0, -0.3]]), ['M3 0L6 0L3 3Z']);
});
