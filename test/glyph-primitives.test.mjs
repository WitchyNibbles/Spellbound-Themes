import test from 'node:test';
import assert from 'node:assert/strict';
import { crescent, disc, frame, leaf, polygon, rect, ring, roundRect, svgDocument } from '../scripts/glyphs/primitives.mjs';
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
