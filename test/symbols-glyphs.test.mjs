import test from 'node:test';
import assert from 'node:assert/strict';
import { letters } from '../scripts/glyphs/editor.mjs';
import { rect } from '../scripts/glyphs/primitives.mjs';
import { drawings } from '../scripts/glyphs/symbols.mjs';
import { drawings as status } from '../scripts/glyphs/status.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers for Tasks 10 to 12. Clearances use outlineGap (0 where outlines cross or overlap; it throws on an empty
// set, so a filter that matched nothing cannot pass), on the flattened outlines.
const pathsOf = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const piecesOf = (name) => pathsOf(name).join('').split(/(?=M)/); // one path string per subpath, in drawing order
const box = (ds) => Object.fromEntries(Object.entries(pathBounds([ds].flat(Infinity))).map(([key, value]) => [key, Number(value.toFixed(2))]));
const bounds = (name) => box(pathsOf(name));
const outlinesOf = (d) => [d].flat(Infinity).flatMap((part) => subpaths(part));
const gap = (a, b) => outlineGap(outlinesOf(a), outlinesOf(b));
const inkAt = (name, point) => filledAt(pathsOf(name), point);
// Ink at the 16 pixel centres of one row (y) or one column (x), '#' ink and '.' empty: at 16px/100% a unit is a pixel.
const centres = Array.from({ length: 16 }, (_, index) => index + 0.5);
const row = (name, y) => centres.map((x) => (inkAt(name, [x, y]) ? '#' : '.')).join('');
const column = (name, x) => centres.map((y) => (inkAt(name, [x, y]) ? '#' : '.')).join('');
// Fill symmetry, sampled with the font's nonzero rule at points that lie on no edge: off the half grid, off the 45-degree
// lines and off the 2:1 slopes of the boxes, for the point and its mirror (y ± x / 2 is never a multiple of 0.25).
const symmetric = (name, mirror) => {
  for (let x = 0.3; x < 16; x += 0.5) {
    for (let y = 0.55; y < 16; y += 0.5) {
      if (inkAt(name, [x, y]) !== inkAt(name, mirror([x, y]))) return `${x.toFixed(1)},${y.toFixed(1)}`;
    }
  }
  return true;
};
const aboutX8 = ([x, y]) => [16 - x, y];
const aboutY8 = ([x, y]) => [x, 16 - y];

test('symbol drawings follow the glyph rules: no errors and no warnings', () => {
  for (const [name, draw] of Object.entries(drawings)) {
    const { errors, warnings } = glyphRuleProblems(draw());
    assert.deepEqual({ errors, warnings }, { errors: [], warnings: [] }, name);
  }
});

// ---- Letters and brackets (Task 10) ----
test('abc (string, text): the shared letters at the symbols size, read row by row at 16px, with a double-storey a', () => {
  assert.deepEqual(bounds('abc'), { minX: 1, maxX: 15, minY: 3, maxY: 12 });
  // Rows of the 16px render, top to bottom. Every stroke is one pixel; the a's counter is 2x2 (rows 9-10), the b's
  // 2x4 (rows 7-10); the c is open on the right for 4 rows; columns 5 and 10 (between the letters) stay empty.
  assert.deepEqual([3.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5].map((y) => row('abc', y)), [
    '......#.........', // b ascender
    '......#.........',
    '..###.####.####.', // a top stroke, b and c tops
    '....#.#..#.#....', // a stem, b counter, c open
    '.####.#..#.#....', // a bowl top
    '.#..#.#..#.#....', // a counter
    '.#..#.#..#.#....',
    '.####.####.####.', // baseline strokes
    '................',
  ]);
});

test('abc calls the live shared letters of the editor module (Task 5) at the symbols size, not a copy of them', () => {
  const original = { ...letters };
  const calls = [];
  for (const name of ['a', 'b', 'c']) letters[name] = (...args) => { calls.push([name, ...args]); return rect(args[0], 6, 4, 6); };
  try {
    assert.deepEqual(outlinesOf(pathsOf('abc')), outlinesOf([rect(1, 6, 4, 6), rect(6, 6, 4, 6), rect(11, 6, 4, 6)]));
    assert.deepEqual(calls, [['a', 1, 12, { xHeight: 6, width: 4 }], ['b', 6, 12, { ascender: 9, bowl: 6, width: 4 }], ['c', 11, 12, { xHeight: 6, width: 4 }]]);
  } finally {
    Object.assign(letters, original);
  }
});

test('[x] (variable): square brackets of the letter stroke, mirrored about x = 8, around a 6x6 X (the close bevel-ended bands) 2 or more clear', () => {
  assert.deepEqual(bounds('bracket-x'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  assert.equal(symmetric('bracket-x', aboutX8), true);
  const [left, right, ...x] = piecesOf('bracket-x');
  assert.deepEqual(box(x), { minX: 5, maxX: 11, minY: 5, maxY: 11 });
  assert.ok(gap(x, [left, right]) >= 2, `x to brackets: ${gap(x, [left, right])}`);
  assert.equal(row('bracket-x', 2.5), '..###......###..', 'serifs 2 long');
  assert.equal(column('bracket-x', 2.5), '..############..', 'bracket y2-14');
  for (const [point, filled] of [[[8, 8], true], [[6.5, 6.5], true], [[9.5, 9.5], true], [[6.5, 9.5], true], [[9.5, 6.5], true], [[8, 5.5], false], [[5.5, 8], false], [[10.5, 8], false], [[8, 10.5], false], [[8, 6.25], false], [[6.25, 8], false], [[9.75, 8], false], [[8, 9.75], false], [[8, 6.75], false], [[6.75, 8], false], [[9.25, 8], false], [[8, 9.25], false], [[3.5, 8], false]]) {
    assert.equal(inkAt('bracket-x', point), filled, `${point}`);
  }
});

test('keyword: a solid 5x3 keyword and lines 1 unit thick, 2 units apart', () => {
  assert.deepEqual(bounds('keyword-lines'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  const [keyword, ...lines] = piecesOf('keyword-lines');
  assert.deepEqual(box(keyword), { minX: 2, maxX: 7, minY: 2, maxY: 5 }); // dot-like accent, at least 3x3 (section 4)
  assert.ok(gap(keyword, lines) >= 2, 'keyword to lines');
  assert.equal(column('keyword-lines', 2.5), '..###..#..#..#..');
  assert.equal(column('keyword-lines', 13.5), '...#...#..#.....', 'the last line is short');
});

test('snippet: an open frame, mirrored about x = 8, whose bottom edge is three 2-unit dashes 2 units apart', () => {
  assert.deepEqual(bounds('snippet-frame'), { minX: 3, maxX: 13, minY: 2, maxY: 14 });
  assert.equal(symmetric('snippet-frame', aboutX8), true);
  assert.equal(row('snippet-frame', 13.5), '...##..##..##...');
  assert.equal(column('snippet-frame', 3.5), '..#########..#..', 'side wall y2-11, 2 units above the dash');
  assert.equal(row('snippet-frame', 2.5), '...##########...', 'top edge');
  assert.equal(inkAt('snippet-frame', [8, 8]), false);
});

// ---- Members (Task 11) ----
test('method (cube): a solid top face 1.34 above two hollow side faces, the front edge on pixel column 7', () => {
  assert.deepEqual(bounds('cube'), { minX: 2, maxX: 14, minY: 1, maxY: 15 });
  const [lid, ...sides] = piecesOf('cube');
  assert.deepEqual(box(lid), { minX: 2, maxX: 14, minY: 1, maxY: 7 });
  assert.ok(gap(lid, sides) >= 1.3, `top face to sides: ${gap(lid, sides)}`); // 1.5 tall on the 2:1 slope = 1.34 across
  // Row 10: left wall, a 4-wide left face, the front edge on column 7, a 5-wide right face, right wall.
  assert.equal(row('cube', 10.5), '..#....#.....#..');
  assert.equal(inkAt('cube', [8, 4]), true, 'top face');
  assert.equal(inkAt('cube', [8, 7.75]), false, 'the step between top face and sides');
  assert.equal(inkAt('cube', [8, 14.5]), true, 'bottom corner');
});

test('field (slab): the flat sibling of the cube, a solid top face over a 1.5-unit band, mirrored about x = 8', () => {
  assert.deepEqual(bounds('slab'), { minX: 1, maxX: 15, minY: 3, maxY: 13 });
  assert.equal(symmetric('slab', aboutX8), true);
  const [lid, band] = piecesOf('slab');
  assert.deepEqual(box(lid), { minX: 1, maxX: 15, minY: 3, maxY: 10 });
  assert.ok(gap(lid, band) >= 1.3, `top face to band: ${gap(lid, band)}`);
  assert.equal(column('slab', 8), '...#######.##...', 'top face y3-10, step, band y11.5-13');
  assert.equal(column('slab', 1.5), '......#.##......', 'top face corner, step, band');
});

test('property (wrench): one solid shape, a 2.12-wide jaw and a 2.12-wide handle on x + y = 16', () => {
  assert.deepEqual(bounds('wrench'), { minX: 2, maxX: 14.35, minY: 1.65, maxY: 14 });
  assert.equal(piecesOf('wrench').length, 1);
  // Across the jaw, square to it (x - y = 9): open from x + y = 14.5 to 17.5 (2.12 across), ink on both sides.
  const onJaw = (s) => [(s + 9) / 2, (s - 9) / 2];
  for (const s of [14.6, 15.5, 16.5, 17.4]) assert.equal(inkAt('wrench', onJaw(s)), false, `jaw at x + y = ${s}`);
  for (const s of [14.2, 17.8]) assert.equal(inkAt('wrench', onJaw(s)), true, `jaw wall at x + y = ${s}`);
  // Across the handle (x - y = -6): ink from x + y = 14.5 to 17.5 only.
  const onHandle = (s) => [(s - 6) / 2, (s + 6) / 2];
  for (const [s, filled] of [[14.2, false], [14.8, true], [16, true], [17.2, true], [17.8, false]]) {
    assert.equal(inkAt('wrench', onHandle(s)), filled, `handle at x + y = ${s}`);
  }
  for (const point of [[9, 5], [11, 7.5], [13.5, 6]]) assert.equal(inkAt('wrench', point), true, `head at ${point}`);
});

test('constant: a solid 10x10 block with "=" cut out as two 6-long slots, mirrored about x = 8 and y = 8', () => {
  assert.deepEqual(bounds('equals-block'), { minX: 3, maxX: 13, minY: 3, maxY: 13 });
  assert.equal(symmetric('equals-block', aboutX8), true);
  assert.equal(symmetric('equals-block', aboutY8), true);
  assert.equal(column('equals-block', 8), '...###.##.###...', 'slots y6-7 and y9-10, 2 units of block between');
  assert.equal(row('equals-block', 6.5), '...##......##...', 'slot x5-11, 2-unit walls');
});

// ---- Types, and the batch side by side (Task 12) ----
test('class: a solid 5x5 parent, two 5x5 child frames with 3x3 holes, 1-unit connectors on the centre lines', () => {
  assert.deepEqual(bounds('class-tree'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  const pieces = piecesOf('class-tree'); // parent, connector, upper child (2 subpaths), connector, lower child (2 subpaths)
  assert.equal(pieces.length, 7);
  assert.deepEqual(box(pieces[0]), { minX: 2, maxX: 7, minY: 2, maxY: 7 }); // the parent: shape accent at least 4x4
  assert.ok(gap(pieces[0], pieces.slice(-2)) >= 2, 'parent to the lower child');
  assert.ok(gap(pieces.slice(2, 4), pieces.slice(-2)) >= 2, 'upper child to lower child');
  assert.equal(row('class-tree', 4.5), '..########...#..', 'parent, connector, child with a 3-unit hole');
  assert.equal(row('class-tree', 11.5), '....######...#..', 'connector from the parent column into the lower child');
  assert.equal(column('class-tree', 4.5), '..##########....', 'parent, then the connector down to row 11');
  assert.equal(inkAt('class-tree', [8, 8]), false);
});

test('interface: a solid 3x3 dot on a 1-unit stick on row 7 into a 7-unit ring', () => {
  assert.deepEqual(bounds('lollipop'), { minX: 1, maxX: 15, minY: 4, maxY: 11 });
  assert.deepEqual(box(piecesOf('lollipop')[0]), { minX: 1, maxX: 4, minY: 6, maxY: 9 }); // dot-like accent, 3x3
  assert.equal(row('lollipop', 7.5), '.########.....#.', 'dot, stick, ring wall, 5-unit hole, ring wall');
  assert.equal(row('lollipop', 6.5), '.###....#.....#.', 'the stick is one row');
  assert.equal(row('lollipop', 8.5), '.###....#.....#.');
});

test('enum: a solid back card (an L of 4-unit arms) exactly 1 unit clear of the outline front card and its value line', () => {
  assert.deepEqual(bounds('cards'), { minX: 1, maxX: 15, minY: 2, maxY: 14 });
  const [back, ...front] = piecesOf('cards');
  assert.deepEqual(box(back), { minX: 6, maxX: 15, minY: 2, maxY: 9 });
  assert.equal(Number(gap(back, front).toFixed(3)), 1);
  assert.equal(row('cards', 4.5), '......#########.', 'back card, upper arm');
  assert.equal(row('cards', 7.5), '.#########.####.', 'front card top, 1-unit gap, back card lower arm');
  assert.equal(row('cards', 10.5), '.#.#####.#......', 'front card walls around the value line');
  assert.equal(column('cards', 12.5), '..#######.......', 'the lower arm is 4 units, y2-9');
});

// Pixels of the 16px/100% render: a pixel is ink when at least half of its 4x4 samples are (nonzero rule).
const pixels = (svg) => {
  const ds = parseGlyphSvg(svg).paths.map((path) => path.d);
  return centres.flatMap((py) => centres.map((px) => {
    let count = 0;
    for (const dy of [-0.375, -0.125, 0.125, 0.375]) for (const dx of [-0.375, -0.125, 0.125, 0.375]) count += filledAt(ds, [px + dx, py + dy]) ? 1 : 0;
    return count >= 8;
  }));
};

test('at 16px every symbol drawing differs from every other, and from the braces of module and namespace, in 40+ pixels', () => {
  // The symbol icons stand side by side in the suggest widget, the Outline view and the breadcrumbs, and several kinds
  // share a colour (class, field and interface are all cyan in Moonlit Candle), so they must differ in silhouette. This
  // pins against two drawings converging; the list view of the comparison page is where the reading is judged.
  // Measured minimum when drawn: 46 (snippet-frame and braces).
  const all = { ...Object.fromEntries(Object.entries(drawings).map(([name, draw]) => [name, pixels(draw())])), braces: pixels(status.braces()) };
  const names = Object.keys(all);
  assert.equal(names.length, 12);
  for (const [index, a] of names.entries()) {
    for (const b of names.slice(index + 1)) {
      const differ = all[a].filter((ink, pixel) => ink !== all[b][pixel]).length;
      assert.ok(differ >= 40, `${a} and ${b} differ in ${differ} pixels`);
    }
  }
});
