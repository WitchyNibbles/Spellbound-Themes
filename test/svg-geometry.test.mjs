import test from 'node:test';
import assert from 'node:assert/strict';
import { offGridPoints, parseGlyphSvg, pathBounds, signedArea, subpaths, windingProblems } from '../scripts/lib/svg-geometry.mjs';

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
