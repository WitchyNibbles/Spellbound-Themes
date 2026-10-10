import test from 'node:test';
import assert from 'node:assert/strict';
import { parts } from '../scripts/glyphs/batch-1.mjs';
import { drawings } from '../scripts/glyphs/panel.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers. Clearances use outlineGap (0 where outlines cross or overlap), on the flattened outlines.
const pathsOf = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const piecesOf = (name) => pathsOf(name).join('').split(/(?=M)/); // one path string per subpath, in drawing order
const box = (ds) => Object.fromEntries(Object.entries(pathBounds(ds)).map(([key, value]) => [key, Number(value.toFixed(2))]));
const bounds = (name) => box(pathsOf(name));
const outlinesOf = (d) => [d].flat().flatMap((part) => subpaths(part));
const at45OrSquare = (poly) => poly.every(([x1, y1], index) => {
  const [x2, y2] = poly[(index + 1) % poly.length];
  return x1 === x2 || y1 === y2 || Math.abs(x2 - x1) === Math.abs(y2 - y1);
});

test('panel drawings follow the glyph rules: no errors and no warnings', () => {
  for (const [name, draw] of Object.entries(drawings)) {
    const { errors, warnings } = glyphRuleProblems(draw());
    assert.deepEqual({ errors, warnings }, { errors: [], warnings: [] }, name);
  }
});

// ---- View icons (Task 4) ----
test('output (quill): vane, shaft, a 4x5 ink drop and two written lines, inside x1-15 y1-15', () => {
  assert.deepEqual(bounds('quill'), { minX: 1, maxX: 15, minY: 1, maxY: 15 });
  const drop = parts.flame(3, 10, 15, 2);
  assert.ok(pathsOf('quill').join('').includes(drop), 'the ink drop is the candle flame shape, x1-5 y10-15');
  assert.deepEqual(box([drop]), { minX: 1, maxX: 5, minY: 10, maxY: 15 }); // shape accent at least 4x4 (section 4)
  const rest = pathsOf('quill').join('').replace(drop, '');
  assert.ok(outlineGap(outlinesOf(drop), outlinesOf(rest)) >= 1, 'the drop keeps one unit from the quill and the lines');
  for (const [point, filled] of [[[12, 12.5], true], [[12, 14.5], true], [[12, 13.5], false], [[11, 5], true]]) {
    assert.equal(filledAt(pathsOf('quill'), point), filled, `${point}`);
  }
});

test('debug console: a window open at its lower-right corner, a prompt, and a six-legged spider breaking out', () => {
  assert.deepEqual(bounds('console-spider'), { minX: 1, maxX: 15, minY: 2, maxY: 15 });
  const [window, prompt, body, ...legs] = piecesOf('console-spider');
  const spider = [body, ...legs];
  assert.equal(legs.length, 6, 'six legs');
  // The corner is open: the right wall stops at y8 and the bottom wall at x6, and no window ink lies below or right of that.
  assert.deepEqual(box([window]), { minX: 1, maxX: 13, minY: 2, maxY: 12 });
  assert.ok(filledAt([window], [12.5, 7.5]) && filledAt([window], [5.5, 11.5]), 'the walls reach y8 and x6');
  for (let x = 6.25; x < 15; x += 0.5) for (let y = 8.25; y < 15; y += 0.5) assert.ok(!filledAt([window], [x, y]), `window ink at ${x},${y}`);
  // The spider's body is the filled part, 4x4, in the open corner.
  assert.deepEqual(box([body]), { minX: 9, maxX: 13, minY: 10, maxY: 14 });
  assert.ok(filledAt(pathsOf('console-spider'), [11, 12]));
  // One full unit between the window, the prompt and the spider (section 4).
  assert.ok(outlineGap(outlinesOf(window), outlinesOf(spider)) >= 1, 'spider to window');
  assert.ok(outlineGap(outlinesOf(window), outlinesOf(prompt)) >= 1, 'prompt to window');
  assert.ok(outlineGap(outlinesOf(prompt), outlinesOf(spider)) >= 1, 'prompt to spider');
  // Legs and prompt are straight or 45-degree strokes.
  for (const piece of [prompt, ...legs]) assert.ok(outlinesOf(piece).every(at45OrSquare), piece);
});

// ---- Actions (Task 5) ----
// Fill symmetry, sampled with the font's nonzero rule on a 0.5 grid offset so no sample lands on an edge.
const symmetric = (name, mirror) => {
  for (let x = 0.3; x < 16; x += 0.5) {
    for (let y = 0.6; y < 16; y += 0.5) {
      if (filledAt(pathsOf(name), [x, y]) !== filledAt(pathsOf(name), mirror([x, y]))) return `${x.toFixed(1)},${y.toFixed(1)}`;
    }
  }
  return true;
};
const aboutX8 = ([x, y]) => [16 - x, y];
const aboutY8 = ([x, y]) => [x, 16 - y];
// Width of a polygon along the horizontal line at y (the span between its first and last edge crossings).
const widthAt = (poly, y) => {
  const xs = poly.flatMap(([x1, y1], index) => {
    const [x2, y2] = poly[(index + 1) % poly.length];
    return (y1 <= y) !== (y2 <= y) ? [x1 + ((y - y1) * (x2 - x1)) / (y2 - y1)] : [];
  });
  return Math.max(...xs) - Math.min(...xs);
};

test('clear-all (broom): a 45-degree handle, filled bristles at least 4x4, two swept lines, each part one unit apart', () => {
  const [handle, bristles, ...lines] = piecesOf('broom');
  assert.deepEqual(bounds('broom'), { minX: 3, maxX: 15, minY: 1, maxY: 15 });
  assert.deepEqual(box([bristles]), { minX: 3, maxX: 10, minY: 6, maxY: 13 });
  assert.ok(outlineGap(outlinesOf(handle), outlinesOf(bristles)) >= 1, 'handle to bristles');
  assert.ok(outlineGap(outlinesOf(lines), outlinesOf([handle, bristles])) >= 1, 'lines to broom');
  assert.ok(outlinesOf(handle).every(at45OrSquare), 'handle edges run at 45 degrees');
});

test('filter (funnel): a hollow cone whose hole is at least 2 units wide all the way down, and a drop for the spout', () => {
  assert.deepEqual(bounds('funnel'), { minX: 1, maxX: 15, minY: 3, maxY: 15 });
  assert.equal(symmetric('funnel', aboutX8), true);
  for (const [point, filled] of [[[8, 3.5], true], [[8, 6], false], [[4, 4.5], false], [[7.5, 7.5], false], [[8, 8.5], true], [[8, 9.5], false], [[8, 13], true]]) {
    assert.equal(filledAt(pathsOf('funnel'), point), filled, `${point}`);
  }
  // Section 4: a cut-out is at least 2 units. The hole is a trapezoid with a 2-unit flat bottom, not a V whose tip
  // narrows to nothing (that tip filled in at 16px).
  const [, hole, drop] = piecesOf('funnel');
  const [holeOutline] = outlinesOf(hole);
  for (let y = 4.25; y < 8; y += 0.5) assert.ok(widthAt(holeOutline, y) >= 2, `hole width at y${y}: ${widthAt(holeOutline, y)}`);
  assert.equal(drop, parts.flame(8, 10, 15, 2), 'the drop is the candle flame shape, x6-10 y10-15');
  assert.ok(outlineGap(outlinesOf(drop), outlinesOf(piecesOf('funnel').slice(0, 2))) >= 1, 'drop to cone');
});

test('trash (bin): a solid lid one unit above an open body with two ribs, 2-unit gaps between the ribs and walls, mirrored about x = 8', () => {
  assert.deepEqual(bounds('bin'), { minX: 2, maxX: 14, minY: 1, maxY: 15 });
  assert.equal(symmetric('bin', aboutX8), true);
  const [lid, ...body] = piecesOf('bin');
  assert.deepEqual(box([lid]), { minX: 2, maxX: 14, minY: 1, maxY: 4 });
  assert.ok(outlineGap(outlinesOf(lid), outlinesOf(body)) >= 1, 'lid to body');
  const row = [3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5].map((x) => (filledAt(pathsOf('bin'), [x, 10]) ? '#' : '.')).join('');
  assert.equal(row, '#..#..#..#', 'wall, 2-unit gap, rib, 2-unit gap, rib, 2-unit gap, wall');
});

test('panel-maximize (expand corners): four 1-unit corner brackets on the 12x12 square, mirrored about x = 8 and y = 8', () => {
  assert.deepEqual(bounds('expand-corners'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  assert.equal(piecesOf('expand-corners').length, 4);
  assert.equal(symmetric('expand-corners', aboutX8), true);
  assert.equal(symmetric('expand-corners', aboutY8), true);
  for (const [point, filled] of [[[2.5, 2.5], true], [[5.5, 2.5], true], [[6.5, 2.5], false], [[2.5, 5.5], true], [[2.5, 6.5], false], [[3.5, 3.5], false]]) {
    assert.equal(filledAt(pathsOf('expand-corners'), point), filled, `${point}`);
  }
});
