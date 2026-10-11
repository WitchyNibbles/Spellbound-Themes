import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { filledAt, offGridPoints, outlineGap, parseGlyphSvg, pathBounds, signedArea, subpaths, windingProblems } from '../scripts/lib/svg-geometry.mjs';

test('signed area is positive for clockwise-on-screen paths', () => {
  assert.ok(signedArea(subpaths('M2 2h4v4H2z')[0]) > 0);
  assert.ok(signedArea(subpaths('M2 2v4h4V2z')[0]) < 0);
});

test('a counter-wound hole passes; a same-direction hole is reported', () => {
  assert.deepEqual(windingProblems(['M2 2h12v12H2zM5 5v6h6V5z']), []);
  assert.match(windingProblems(['M2 2h12v12H2zM5 5h6v6H5z'])[0], /wound the same way as its container/);
});

test('an island inside a hole must be wound like the outer shape', () => {
  assert.deepEqual(windingProblems(['M2 2h12v12H2zM4 4v8h8V4zM6 6h4v4H6z']), []);
});

test('overlapping shapes are not containers of each other', () => {
  assert.deepEqual(windingProblems(['M3 4L4 3L13 12L12 13Z M12 3L13 4L4 13L3 12Z']), []);
});

test('arcs are flattened, so circular rings are checked too', () => {
  assert.deepEqual(windingProblems(['M8 2a6 6 0 1 1 0 12a6 6 0 1 1 0-12zM8 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8z']), []);
  assert.equal(windingProblems(['M8 2a6 6 0 1 1 0 12a6 6 0 1 1 0-12zM8 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8z']).length, 1);
});

test('bounds are exact and grid scan flags only off-grid straight segments', () => {
  assert.deepEqual(pathBounds(['M3 6L4 5L8 9L12 5L13 6L8 11Z']), { minX: 3, maxX: 13, minY: 5, maxY: 11 });
  assert.deepEqual(offGridPoints('M2 2h4.5v4H2z'), []);
  assert.ok(offGridPoints('M2.3 2h4v4H2z').length > 0);
});

test('parseGlyphSvg reads root attributes, elements and path data', () => {
  const parsed = parseGlyphSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16"><path fill="currentColor" d="M1 1h2v2H1z"/></svg>');
  assert.equal(parsed.viewBox, '0 0 16 16');
  assert.equal(parsed.width, '16');
  assert.deepEqual(parsed.elements, ['svg', 'path']);
  assert.equal(parsed.paths[0].d, 'M1 1h2v2H1z');
});

test('filledAt applies the nonzero rule the font pipeline uses', () => {
  const frame = ['M2 2h12v12H2z', 'M4 4v8h8V4z']; // 12x12 square with a counter-wound 8x8 hole
  assert.equal(filledAt(frame, [3, 8]), true);
  assert.equal(filledAt(frame, [8, 8]), false);
  assert.equal(filledAt(frame, [15, 8]), false);
  assert.equal(filledAt(['M2 2h12v12H2z', 'M4 4h8v8H4z'], [8, 8]), true); // same-direction "hole" stays solid
});

test('a closing Z that lands on its own start is not a straight segment', () => {
  assert.deepEqual(offGridPoints('M11 9.828A3 3 0 1 1 11 4.172A3 3 0 0 0 11 9.828Z'), []); // crescent tips are arc ends
  assert.deepEqual(offGridPoints('M2.3 2L6 2L6 6Z').map(([x, y]) => `${x},${y}`), ['2.3,2', '2.3,2']); // a real closing line still counts
});

test('outlineGap: the shortest distance between separate or nested outlines, 0 where they cross, touch or overlap', () => {
  const square = (x, y, size) => subpaths(`M${x} ${y}h${size}v${size}h-${size}z`);
  assert.equal(outlineGap(square(0, 0, 2), square(5, 0, 2)), 3, 'side by side');
  assert.equal(outlineGap(square(0, 0, 8), subpaths('M3 3v2h2v-2z')), 3, 'nested: the wall around a cut-out');
  assert.equal(outlineGap(square(0, 0, 8), square(3, 3, 2)), 0, 'a solid inside a solid overlaps it');
  assert.equal(outlineGap(subpaths('M0 0h8v8H0zM1 1v6h6V1z'), square(3, 3, 2)), 2, 'an accent inside a frame: the wall to the inner edge');
  // Two long bars crossing as a plus: every corner is 4 units from the other bar, but the edges cross.
  assert.equal(outlineGap(subpaths('M0 4h10v1H0z'), subpaths('M4 0h1v10H4z')), 0, 'crossing');
  assert.equal(outlineGap(square(0, 0, 2), square(2, 1, 2)), 0, 'touching along an edge');
  assert.equal(outlineGap(subpaths('M0 0L4 1L0 2z'), subpaths('M4 0h2v2h-2z')), 0, 'a vertex on the other outline');
});

test('outlineGap refuses an empty set, which would pass any clearance check vacuously', () => {
  const square = subpaths('M0 0h2v2h-2z');
  assert.throws(() => outlineGap([], square), /empty/);
  assert.throws(() => outlineGap(square, []), /empty/);
});

// Gate 6: outlineGap overflowed the call stack once two outlines held a few hundred flattened points each (the owl file
// icon's four rings measured together): it spread every point-to-segment distance into one Math.min call.
test('outlineGap measures outlines of hundreds of points each without overflowing the stack', () => {
  const ring = (cx, cy, r, n, clockwise = true) => {
    const points = Array.from({ length: n }, (_, i) => [cx + r * Math.cos((2 * Math.PI * i) / n), cy + r * Math.sin((2 * Math.PI * i) / n)]);
    return clockwise ? points : points.reverse();
  };
  assert.ok(Math.abs(outlineGap([ring(4, 8, 2, 400)], [ring(12, 8, 2, 400)]) - 4) < 1e-9, 'side by side: 4 between the rims');
  const nested = outlineGap([ring(8, 8, 6, 400), ring(8, 8, 5, 400, false)], [ring(8, 8, 2, 400)]);
  assert.ok(nested > 2.999 && nested <= 3, `nested: the wall from the frame's inner edge to the disc (measured ${nested})`);
});

test('outlineGap measures the owl file icon\'s eyes against its rings, tufts and beak in one call (G42: one unit)', () => {
  const svg = fs.readFileSync(path.resolve(import.meta.dirname, '..', 'icons', 'file-src', 'owl.svg'), 'utf8');
  const [outline, eyes] = parseGlyphSvg(svg).paths;
  const gap = outlineGap(subpaths(outline.d), subpaths(eyes.d));
  assert.ok(gap >= 1 - 0.01, `the eyes keep one unit from the rest of the owl (measured ${gap})`);
});
