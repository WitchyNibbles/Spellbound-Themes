import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings as batchOne, parts } from '../scripts/glyphs/batch-1.mjs';
import { drawings as debug } from '../scripts/glyphs/debug.mjs';
import { drawings, letters } from '../scripts/glyphs/editor.mjs';
import { rect, svgDocument } from '../scripts/glyphs/primitives.mjs';
import { drawings as status } from '../scripts/glyphs/status.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers for Tasks 2 to 6. Clearances use outlineGap (0 where outlines cross or overlap; it throws on an empty
// side), measured on the flattened outlines.
const pathsOf = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const round2 = (value) => Number(value.toFixed(2));
const box = (ds) => Object.fromEntries(Object.entries(pathBounds(ds)).map(([key, value]) => [key, round2(value)]));
const bounds = (name) => box(pathsOf(name));
const outlinesOf = (ds) => [ds].flat(Infinity).flatMap((d) => subpaths(d));
const glyphOutlines = (name) => outlinesOf(pathsOf(name));
const polyBox = (polys) => {
  const points = polys.flat();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return { minX: round2(Math.min(...xs)), maxX: round2(Math.max(...xs)), minY: round2(Math.min(...ys)), maxY: round2(Math.max(...ys)) };
};
const inkAt = (name, point, all = drawings) => filledAt(parseGlyphSvg(all[name]()).paths.map((path) => path.d), point);
const at45OrSquare = (poly) => poly.every(([x1, y1], index) => {
  const [x2, y2] = poly[(index + 1) % poly.length];
  return x1 === x2 || y1 === y2 || Math.abs(x2 - x1) === Math.abs(y2 - y1);
});

test('editor drawings follow the glyph rules: no errors and no warnings', () => {
  for (const [name, draw] of Object.entries(drawings)) {
    const { errors, warnings } = glyphRuleProblems(draw());
    assert.deepEqual({ errors, warnings }, { errors: [], warnings: [] }, name);
  }
});

// ---- Sparkle and pins (Task 2; the pins redrawn as a pushpin at gate 4, G32) ----
test('sparkle (✧ cluster): three ✦, the largest 8x8 on the left, each at least 1 unit from the others', () => {
  assert.deepEqual(bounds('sparkle-cluster'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  const stars = [parts.star(6, 8, 4, 1.5), parts.star(11.5, 4.5, 2.5, 1), parts.star(11.5, 11.5, 2.5, 1)];
  assert.deepEqual(glyphOutlines('sparkle-cluster'), outlinesOf(stars));
  assert.deepEqual(box([stars[0]]), { minX: 2, maxX: 10, minY: 4, maxY: 12 }, 'the filled part is the largest star');
  for (const [a, b] of [[0, 1], [0, 2], [1, 2]]) assert.ok(outlineGap(outlinesOf(stars[a]), outlinesOf(stars[b])) >= 1, `stars ${a} and ${b}`);
});

// The pushpin (G32, gate-4 decision): (u, v) runs along the pin (u = x - y, needle -10 .. head +10) and across it
// (v = x + y - 16, lower right +), so a point is ((16 + u + v) / 2, (16 + v - u) / 2).
const alongPin = ([u, v]) => [(16 + u + v) / 2, (16 + v - u) / 2];

test('pinned (pushpin): a filled head on close\'s 3-13 box, 1.41 clear of a 45-degree bevel-ended needle', () => {
  const centre = ({ minX, maxX, minY, maxY }) => [(minX + maxX) / 2, (minY + maxY) / 2];
  const closeBox = box(parseGlyphSvg(batchOne.close()).paths.map((path) => path.d));
  assert.deepEqual(bounds('pushpin'), closeBox, 'the tab-action box of close, 3-13');
  assert.deepEqual(centre(bounds('pushpin')), centre(closeBox), 'centred like close');
  const [needle, head, ...rest] = glyphOutlines('pushpin');
  assert.deepEqual(rest, [], 'two outlines: the needle and the head');
  assert.deepEqual(needle, [[-9, -1], [-5, -1], [-5, 1], [-9, 1]].map(alongPin), 'the needle: on x + y = 16, 1.41 across, bevel ends');
  assert.ok(at45OrSquare(needle), 'the needle runs at 45 degrees');
  assert.deepEqual(polyBox([head]), { minX: 5, maxX: 13, minY: 3, maxY: 11 }, 'the head');
  assert.ok(at45OrSquare(head), 'the head has 45-degree sides and horizontal/vertical shoulders only');
  assert.ok(outlineGap([needle], [head]) >= 1.41, 'the needle stops 1.41 short of the head (section 4: one unit at least)');
  // The pushpin silhouette: a flange and a cap wider than the waist between them, so it reads as a pin, not a block.
  for (const [where, uv, filled] of [
    ['needle', [-7, 0], true], ['gap above the needle', [-4, 0], false],
    ['flange, upper left', [-2, -2.5], true], ['flange, lower right', [-2, 2.5], true],
    ['beside the waist, upper left', [2, -2.5], false], ['beside the waist, lower right', [2, 2.5], false],
    ['waist', [2, 1.5], true], ['waist', [2, -1.5], true],
    ['cap, upper left', [6, -2.5], true], ['cap, lower right', [6, 2.5], true],
  ]) assert.equal(inkAt('pushpin', alongPin(uv)), filled, `${where} ${alongPin(uv)}`);
});

test('pinned-dirty: the same pushpin plus a 5x5 ✦ badge at the lower right, one unit clear of it', () => {
  const outlines = glyphOutlines('pushpin-dirty');
  assert.deepEqual(outlines.slice(0, -1), glyphOutlines('pushpin'), 'the pin does not move or change between the states');
  const badge = outlines.at(-1);
  assert.deepEqual(badge, outlinesOf(parts.star(11.5, 11.5, 2.5, 1))[0], 'a bell-dot sized ✦ (5x5, waist 1)');
  assert.deepEqual(polyBox([badge]), { minX: 9, maxX: 14, minY: 9, maxY: 14 }, 'where the stock pinned-dirty puts its dot');
  assert.ok(outlineGap(outlines.slice(0, -1), [badge]) >= 1, 'section 4: one unit between the ✦ and the pin');
  assert.equal(inkAt('pushpin-dirty', [11.5, 11.5]), true, 'the ✦ core');
  assert.equal(sameInk('pushpin-dirty', 'pushpin', (x, y) => x > 9 && y > 9), true, 'nothing else differs');
});

test('the cluster and the pinned-dirty ✦ are built from the live batch-1 star part, not from a copy of its numbers', () => {
  const original = parts.star;
  parts.star = (cx, cy, outer) => rect(cx - outer, cy - outer, 2 * outer, 2 * outer); // a square in the star's place
  try {
    assert.deepEqual(glyphOutlines('sparkle-cluster'), outlinesOf([rect(2, 4, 8, 8), rect(9, 2, 5, 5), rect(9, 9, 5, 5)]));
    assert.deepEqual(glyphOutlines('pushpin-dirty').at(-1), outlinesOf(rect(9, 9, 5, 5))[0]);
  } finally {
    parts.star = original;
  }
});

// ---- Pages and folders (Task 3) ----
// Ink compared on a 0.5 grid offset by 0.25, so no sample lands on an edge; `skip` leaves out a region.
const sameInk = (a, b, skip = () => false) => {
  for (let x = 0.25; x < 16; x += 0.5) {
    for (let y = 0.25; y < 16; y += 0.5) if (!skip(x, y) && inkAt(a, [x, y]) !== inkAt(b, [x, y])) return `${x},${y}`;
  }
  return true;
};
const plusAt = (dx, dy) => [[10, 12], [12, 12], [12, 10], [13, 10], [13, 12], [15, 12], [15, 13], [13, 13], [13, 15], [12, 15], [12, 13], [10, 13]]
  .map(([x, y]) => [x + dx, y + dy]);
// [base drawing, its +, the corner where the two may differ, the keyline]
const badges = {
  'page-plus': ['page', plusAt(-1, 0), (x, y) => x > 8 && y > 9, { minX: 2, maxX: 14, minY: 1, maxY: 15 }],
  'folder-plus': ['folder', plusAt(0, -1), (x, y) => x > 9 && y > 7, { minX: 1, maxX: 15, minY: 2, maxY: 14 }],
};

test('page (symbol-file): x3-13 with 1-unit walls and a solid 4x4 fold, a real hole one unit inside it', () => {
  assert.deepEqual(bounds('page'), { minX: 3, maxX: 13, minY: 1, maxY: 15 });
  for (const [point, filled] of [[[3.5, 8], true], [[4.5, 8], false], [[12.5, 10], true], [[11.5, 10], false], [[8, 14.5], true], [[8, 13.5], false],
    [[10, 4], true], [[12, 2], false], [[8.5, 4], true], [[7.5, 4], false], [[10, 5.5], true], [[10, 6.5], false]]) {
    assert.equal(inkAt('page', point), filled, `${point}`);
  }
});

test('folder (symbol-folder): x1-15, y2-14 with 1-unit walls and a solid tab, a real hole one unit inside it', () => {
  assert.deepEqual(bounds('folder'), { minX: 1, maxX: 15, minY: 2, maxY: 14 });
  for (const [point, filled] of [[[3, 4], true], [[3, 6.5], false], [[6.5, 3], true], [[10, 4.5], true], [[10, 5.5], false], [[14.5, 9], true],
    [[13.5, 9], false], [[8, 13.5], true], [[8, 12.5], false], [[1.5, 9], true], [[2.5, 9], false]]) {
    assert.equal(inkAt('folder', point), filled, `${point}`);
  }
});

test('new-file and new-folder are the page and the folder, open at the lower right for a 5x5 + one unit clear, inside the keyline', () => {
  for (const [name, [base, plus, corner, keyline]] of Object.entries(badges)) {
    assert.equal(sameInk(name, base, corner), true, `${name} matches ${base} outside the badge corner`);
    const outlines = glyphOutlines(name);
    assert.deepEqual(outlines.at(-1), plus, `${name}: the + is the last outline`);
    assert.ok(outlineGap(outlines.slice(0, -1), [plus]) >= 1, `${name}: + to outline`);
    const { minX, maxX, minY, maxY } = polyBox([plus]);
    assert.equal(inkAt(name, [(minX + maxX) / 2, (minY + maxY) / 2]), true, `${name}: the + centre`);
    const b = bounds(name);
    assert.ok(b.minX >= keyline.minX && b.maxX <= keyline.maxX && b.minY >= keyline.minY && b.maxY <= keyline.maxY, `${name} inside its keyline`);
  }
  assert.deepEqual(polyBox([badges['page-plus'][1]]), { minX: 9, maxX: 14, minY: 10, maxY: 15 });
  assert.deepEqual(polyBox([badges['folder-plus'][1]]), { minX: 10, maxX: 15, minY: 9, maxY: 14 });
  // The page's + stem (column 11) is not on the right wall's column (12), so it does not read as the wall going on.
  assert.deepEqual([inkAt('page-plus', [12.5, 8.5]), inkAt('page-plus', [12.5, 10.5]), inkAt('page-plus', [11.5, 10.5])], [true, false, true]);
});

test('go-to-file is the page with an open-headed arrow inside, one unit clear of the walls and the fold', () => {
  assert.equal(sameInk('page-arrow', 'page', (x, y) => x > 4.5 && x < 11.5 && y > 6 && y < 13.5), true);
  const [outline, hole, ...arrow] = glyphOutlines('page-arrow');
  assert.deepEqual([outline, hole], glyphOutlines('page'));
  assert.ok(outlineGap([outline, hole], arrow) >= 1, 'arrow to page (the hole with its outline, so the arrow is measured to the walls)');
  assert.ok(arrow.every(at45OrSquare), 'the arrow is straight and 45-degree strokes');
  assert.deepEqual(polyBox(arrow), { minX: 5, maxX: 10, minY: 6.5, maxY: 12.5 });
  assert.equal(inkAt('page-arrow', [8.5, 9.5]), true, 'stem and head meet');
  assert.equal(inkAt('page-arrow', [6.5, 8.75]), false, 'the head is open: a filled triangle would cover this');
});

test('the right wall of page-plus and folder-plus ends 3 units above the + right arm, so it does not run into it', () => {
  for (const [name, wallX] of [['page-plus', 12.5], ['folder-plus', 14.5]]) {
    const plus = glyphOutlines(name).at(-1);
    const maxX = Math.max(...plus.map(([x]) => x));
    const armTop = Math.min(...plus.filter(([x]) => x === maxX).map(([, y]) => y));
    let y = 5.25;
    while (inkAt(name, [wallX, y])) y += 0.5;
    assert.equal(Math.round((armTop - (y - 0.25)) * 100) / 100, 3, `${name}: wall end to the arm`);
  }
  assert.deepEqual([inkAt('folder-plus', [14.5, 7.5]), inkAt('folder-plus', [14.5, 9.5]), inkAt('folder-plus', [14.5, 11.5])], [true, false, true]);
});

// ---- Tree actions (Task 4) ----
test('collapse-all: a filled front box with a 6x2 − cut out, and the box behind one unit clear of it', () => {
  assert.deepEqual(bounds('collapse-stack'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  const [front, minus, behind] = glyphOutlines('collapse-stack');
  assert.deepEqual(polyBox([front]), { minX: 2, maxX: 12, minY: 2, maxY: 12 });
  assert.deepEqual(polyBox([minus]), { minX: 4, maxX: 10, minY: 6, maxY: 8 });
  assert.ok(outlineGap([front, minus], [behind]) >= 1, 'front box to the box behind');
  for (const [point, filled] of [[[7, 4], true], [[7, 7], false], [[3, 10], true], [[13.5, 9], true], [[12.5, 9], false], [[9, 13.5], true]]) {
    assert.equal(inkAt('collapse-stack', point), filled, `${point}`);
  }
});

test('list-tree: a 3x3 root node one unit clear of a top row, a trunk and two branches, rows every 4 units', () => {
  assert.deepEqual(bounds('tree-node'), { minX: 2, maxX: 14, minY: 3, maxY: 13 });
  const [node, ...strokes] = glyphOutlines('tree-node');
  assert.deepEqual(polyBox([node]), { minX: 2, maxX: 5, minY: 3, maxY: 6 }, 'the node, the dot-accent minimum');
  assert.ok(outlineGap([node], strokes) >= 1, 'node to the strokes');
  const column = [4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5].map((y) => (inkAt('tree-node', [10, y]) ? '#' : '.')).join('');
  assert.equal(column, '#...#...#', 'rows on y4-5, y8-9 and y12-13 at x10');
  for (const y of [7.5, 9.5, 12.5]) assert.equal(inkAt('tree-node', [3.5, y]), true, `trunk at y${y}`);
});

// Arrowheads are the triangular or quadrilateral straight outlines; half-turn asymmetry is the share of ink whose
// 180-degree image is empty (the measure test/debug-glyphs.test.mjs uses for restart and sync).
const halfTurnMiss = (name, [cx, cy], all = drawings) => {
  let ink = 0;
  let miss = 0;
  for (let x = 0.125; x < 16; x += 0.25) {
    for (let y = 0.125; y < 16; y += 0.25) {
      if (!inkAt(name, [x, y], all)) continue;
      ink += 1;
      if (!inkAt(name, [2 * cx - x, 2 * cy - y], all)) miss += 1;
    }
  }
  return miss / ink;
};

test('discard: one filled 2:1 head pointing left on a band that turns back under it, open at the lower left', () => {
  assert.deepEqual(bounds('undo-arrow'), { minX: 2, maxX: 13, minY: 3, maxY: 13 });
  const [head, band] = glyphOutlines('undo-arrow');
  assert.deepEqual(polyBox([head]), { minX: 2, maxX: 6, minY: 3, maxY: 8 });
  assert.equal(head.length, 4, 'one straight head');
  for (const [point, filled] of [[[4, 6], true], [[9, 5.5], true], [[12.5, 9], true], [[9, 12.5], true], [[9, 9], false], [[4, 12.5], false]]) {
    assert.equal(inkAt('undo-arrow', point), filled, `${point}`);
  }
  assert.ok(band.length > 8, 'the band turns on arcs');
});

test('refresh is restart mirrored about x = 8: one head, clockwise, never sync and never restart itself', () => {
  assert.deepEqual(bounds('refresh-arrow'), { minX: 3, maxX: 13, minY: 1.5, maxY: 14 });
  // Sampled off the half grid (x 0.3, 0.8 …; y 0.6, 1.1 …), so no sample lands on an edge of either glyph.
  for (let x = 0.3; x < 16; x += 0.5) {
    for (let y = 0.6; y < 16; y += 0.5) assert.equal(inkAt('refresh-arrow', [x, y]), inkAt('restart', [16 - x, y], debug), `${x},${y}`);
  }
  // Where it shows at 16px: refresh is open at the upper right and its head points right (clockwise); restart is open at
  // the upper left and points left. Probes on the band's centre circle (r4.5 about (8,9)) at 225 and 315 degrees.
  assert.deepEqual([inkAt('refresh-arrow', [4.82, 5.82]), inkAt('refresh-arrow', [11.18, 5.82])], [true, false]);
  assert.deepEqual([inkAt('restart', [4.82, 5.82], debug), inkAt('restart', [11.18, 5.82], debug)], [false, true]);
  assert.deepEqual([inkAt('refresh-arrow', [10.5, 4.3]), inkAt('restart', [10.5, 4.3], debug)], [true, false], 'the head tip, right of the top, above the band');
  assert.equal(glyphOutlines('refresh-arrow').filter((poly) => poly.length === 3).length, 1, 'one head');
  assert.ok(halfTurnMiss('refresh-arrow', [8, 9]) > 0.2, 'not half-turn symmetric like sync');
  assert.ok(halfTurnMiss('sync-arrows', [8, 8], status) < 0.02, 'sync is');
});

// ---- Find toggles (Task 5) ----
// Lengths of the ink runs along a horizontal (axis 'x') or vertical (axis 'y') line, sampled every 1/8 unit.
const runs = (name, axis, at, all = drawings) => {
  const lengths = [];
  let run = 0;
  for (let t = 1 / 16; t < 16; t += 1 / 8) {
    if (inkAt(name, axis === 'x' ? [t, at] : [at, t], all)) run += 1 / 8;
    else if (run) { lengths.push(run); run = 0; }
  }
  return run ? [...lengths, run] : lengths;
};
const rounded = (polys) => polys.map((poly) => poly.map(([x, y]) => [round2(x), round2(y)]));
const moved = (polys, dx, dy) => polys.map((poly) => poly.map(([x, y]) => [x + dx, y + dy]));

test('the toggles share one letter construction: one A, one a, cap and ascender height 10, x-height 7, 1-unit strokes', () => {
  const [caseA, caseAHole, smallA, smallAHole] = glyphOutlines('toggle-case');
  const [preserveA, preserveAHole, ...capitalB] = glyphOutlines('toggle-preserve');
  const [wordA, wordAHole, wordB] = glyphOutlines('toggle-word');
  assert.deepEqual([preserveA, preserveAHole], [caseA, caseAHole], 'AB starts with the A of Aa');
  assert.deepEqual(rounded(moved([smallA, smallAHole], -7, -1)), rounded([wordA, wordAHole]), 'ab̲ starts with the a of Aa, on its own baseline');
  assert.deepEqual(polyBox([caseA]), { minX: 1, maxX: 8, minY: 3, maxY: 13 }, 'A: cap height 10');
  assert.deepEqual(polyBox(capitalB), { minX: 9, maxX: 14, minY: 3, maxY: 13 }, 'B: cap height 10');
  assert.deepEqual(polyBox([smallA]), { minX: 9, maxX: 14, minY: 6, maxY: 13 }, 'a: x-height 7');
  assert.deepEqual(polyBox([wordB]), { minX: 8, maxX: 13, minY: 2, maxY: 12 }, 'b: ascender 10 on the y12 baseline');
  // Every stem these lines cross is 1 unit wide: the A's legs, the a's bowl wall and stem, the B's stem and lower bowl,
  // the b's stem and bowl.
  for (const [name, y] of [['toggle-case', 11], ['toggle-preserve', 10], ['toggle-word', 10]]) assert.deepEqual(runs(name, 'x', y), [1, 1, 1, 1], `${name} at y${y}`);
  // Every bar is 1 unit tall: the a's top bar, bowl top and foot; the B's three bars; the b's bowl top and foot and the
  // underline. The A's apex is 1.5 deep where its 45-degree shoulders meet, over a 1-unit crossbar.
  assert.deepEqual(runs('toggle-case', 'y', 11.5), [1, 1, 1]);
  assert.deepEqual(runs('toggle-preserve', 'y', 10.5), [1, 1, 1]);
  assert.deepEqual(runs('toggle-word', 'y', 10.5), [1, 1, 1]);
  assert.deepEqual(runs('toggle-case', 'y', 4.5), [1.5, 1]);
});

test('every toggle counter is a real hole at least 2 units across, and the letters stand 1 unit apart', () => {
  for (const [name, holeIndexes] of [['toggle-case', [1, 3]], ['toggle-preserve', [1, 3, 4]], ['toggle-word', [1, 3]]]) {
    const outlines = glyphOutlines(name);
    for (const index of holeIndexes) {
      const { minX, maxX, minY, maxY } = polyBox([outlines[index]]);
      assert.ok(maxX - minX >= 2 && maxY - minY >= 2, `${name} counter ${index}: ${maxX - minX} x ${maxY - minY}`);
      assert.equal(inkAt(name, [(minX + maxX) / 2, (minY + maxY) / 2 + 0.25]), false, `${name} counter ${index} is a hole`);
    }
  }
  // The A's pointed counter holds a 2x2 square above the crossbar (x3.5-5.5, y6-8).
  for (let x = 3.6; x < 5.5; x += 0.3) for (let y = 6.1; y < 8; y += 0.3) assert.equal(inkAt('toggle-case', [x, y]), false, `A counter at ${x},${y}`);
  const [caseA, caseAHole, ...smallA] = glyphOutlines('toggle-case');
  assert.ok(outlineGap([caseA, caseAHole], smallA) >= 1, 'A to a');
  const [preserveA, preserveAHole, ...capitalB] = glyphOutlines('toggle-preserve');
  assert.ok(outlineGap([preserveA, preserveAHole], capitalB) >= 1, 'A to B');
  const [wordA, wordAHole, wordB, wordBHole, underline] = glyphOutlines('toggle-word');
  assert.ok(outlineGap([wordA, wordAHole], [wordB, wordBHole]) >= 1, 'a to b');
  assert.ok(outlineGap([wordA, wordAHole, wordB, wordBHole], [underline]) >= 1, 'ab to the underline');
  assert.deepEqual(polyBox([underline]), { minX: 1, maxX: 15, minY: 13, maxY: 15 });
});

test('regex: a 2x2 full stop on the Aa baseline and a six-armed asterisk at cap height, 1 unit apart', () => {
  const [dot, ...asterisk] = glyphOutlines('toggle-regex');
  assert.deepEqual(polyBox([dot]), { minX: 3, maxX: 5, minY: 11, maxY: 13 });
  assert.deepEqual(polyBox(asterisk), { minX: 6, maxX: 13, minY: 3, maxY: 10 });
  assert.ok(outlineGap([dot], asterisk) >= 1);
  assert.ok(asterisk.every(at45OrSquare), 'upright and 45-degree arms');
  for (const point of [[9.5, 6.5], [9.5, 3.5], [9.5, 9.5], [7, 4], [12, 9], [12, 4], [7, 9]]) assert.equal(inkAt('toggle-regex', point), true, `arm at ${point}`);
  for (const point of [[6.5, 6.5], [12.5, 6.5]]) assert.equal(inkAt('toggle-regex', point), false, `no horizontal arm at ${point}`);
});

test('the shared letters keep the construction at the symbols size: 4 wide, x-height 6, ascender to y3 on the y12 baseline', () => {
  const small = { abc: () => svgDocument(letters.a(1, 12, { xHeight: 6, width: 4 }), letters.b(6, 12, { ascender: 9, bowl: 6, width: 4 }), letters.c(11, 12, { xHeight: 6, width: 4 })) };
  const outlines = outlinesOf(parseGlyphSvg(small.abc()).paths.map((path) => path.d));
  const [a, aHole, b, bHole, c] = outlines;
  assert.deepEqual([polyBox([a]), polyBox([b]), polyBox([c])], [
    { minX: 1, maxX: 5, minY: 6, maxY: 12 }, { minX: 6, maxX: 10, minY: 3, maxY: 12 }, { minX: 11, maxX: 15, minY: 6, maxY: 12 },
  ]);
  assert.deepEqual([polyBox([aHole]), polyBox([bHole])], [{ minX: 2, maxX: 4, minY: 9, maxY: 11 }, { minX: 7, maxX: 9, minY: 7, maxY: 11 }], 'counters 2x2 and 2x4');
  assert.deepEqual(runs('abc', 'x', 10, small), [1, 1, 1, 1, 1], 'stems: a bowl and stem, b stem and bowl, c spine');
  assert.deepEqual(runs('abc', 'y', 2.5, small), [1, 1, 1], 'a: top bar, bowl top, foot');
  assert.deepEqual(runs('abc', 'y', 13, small), [1, 1], 'c: top and foot bars');
  assert.ok(outlineGap([a, aHole], [b, bHole]) >= 1 && outlineGap([b, bHole], [c]) >= 1, 'letters 1 unit apart');
  assert.equal(inkAt('abc', [14.5, 9], small), false, 'c is open on the right');
});

// ---- Replace (Task 6) ----
test('replace: a small b, an arrow with the one filled head, and an empty target frame, each 1 unit apart', () => {
  assert.deepEqual(bounds('replace-box'), { minX: 1, maxX: 14, minY: 1, maxY: 15 });
  const [b, bHole, band, head, target, targetHole] = glyphOutlines('replace-box');
  assert.deepEqual(polyBox([b]), { minX: 10, maxX: 14, minY: 1, maxY: 7 });
  assert.deepEqual(polyBox([bHole]), { minX: 11, maxX: 13, minY: 4, maxY: 6 }, 'the b counter, 2x2');
  assert.deepEqual(polyBox([head]), { minX: 1.5, maxX: 7.5, minY: 5, maxY: 8 }, 'the head, 6x3 like restart');
  assert.deepEqual(polyBox([target]), { minX: 1, maxX: 9, minY: 9, maxY: 15 });
  assert.ok(outlineGap([b, bHole], [band, head]) >= 1, 'b to arrow');
  assert.ok(outlineGap([head, band], [target, targetHole]) >= 1, 'arrow to target');
  for (const [point, filled] of [[[12, 5], false], [[4.5, 6], true], [[7, 3.5], true], [[5, 12], false], [[1.5, 12], true]]) {
    assert.equal(inkAt('replace-box', point), filled, `${point}`);
  }
});

test('replace-all: the same b and arrow over a smaller target with a second one behind it, 1 unit clear', () => {
  assert.deepEqual(bounds('replace-stack'), { minX: 1, maxX: 14, minY: 1, maxY: 15 });
  const outlines = glyphOutlines('replace-stack');
  assert.deepEqual(outlines.slice(0, 4), glyphOutlines('replace-box').slice(0, 4), 'b, band and head as in replace');
  const [front, frontHole, behind] = outlines.slice(4);
  assert.deepEqual(polyBox([front]), { minX: 1, maxX: 8, minY: 9, maxY: 13 });
  assert.deepEqual(polyBox([frontHole]), { minX: 2, maxX: 7, minY: 10, maxY: 12 }, 'front counter 5x2');
  assert.ok(outlineGap([front, frontHole], [behind]) >= 1, 'front target to the one behind');
  assert.ok(outlineGap(outlines.slice(0, 4), [front, frontHole, behind]) >= 1, 'arrow and b to the targets');
  // Where replace and replace-all differ at 16px: the edge behind the target.
  assert.deepEqual([inkAt('replace-stack', [9.5, 13]), inkAt('replace-box', [9.5, 13])], [true, false]);
  assert.deepEqual([inkAt('replace-stack', [6, 14.5]), inkAt('replace-box', [6, 14.5])], [true, true]);
});
