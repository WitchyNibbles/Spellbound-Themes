import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings as batchOne, parts } from '../scripts/glyphs/batch-1.mjs';
import { crescent, polygon, rect, svgDocument } from '../scripts/glyphs/primitives.mjs';
import { drawings, variants } from '../scripts/glyphs/status.mjs';
import { filledAt, outlineGap as gap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers for Tasks 7-10. Clearances are measured on the flattened outlines (curves sampled as in subpaths) with
// outlineGap, which is 0 where two outlines cross.
const pathsOf = (svg) => parseGlyphSvg(svg).paths.map((path) => path.d);
const box = (ds) => Object.fromEntries(Object.entries(pathBounds(ds)).map(([key, value]) => [key, Number(value.toFixed(2))]));
const bounds = (svg) => box(pathsOf(svg));
const outlinesOf = (svg) => subpaths(pathsOf(svg).join(''));
const without = (polygons, d) => {
  const removed = subpaths(d).map((poly) => JSON.stringify(poly));
  return polygons.filter((poly) => !removed.includes(JSON.stringify(poly)));
};

// ---- Severity signals (Task 7) ----
test('warning and info use the skull footprint, so the Problems tree and the status bar line up', () => {
  const skull = bounds(batchOne.skull());
  assert.deepEqual(skull, { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  assert.deepEqual(bounds(drawings['warning-triangle']()), skull);
  assert.deepEqual(bounds(drawings['info-disc']()), skull);
});

test('terminal decorations stay inside the 8-unit signal keyline, centred on (8,8)', () => {
  assert.deepEqual(bounds(drawings['terminal-error']()), { minX: 4, maxX: 12, minY: 4, maxY: 12 });
  assert.deepEqual(bounds(drawings['status-dot']()), { minX: 5, maxX: 11, minY: 5, maxY: 11 });
});

test('severity cut-outs are holes under the font fill rule, with ink between and around them', () => {
  // filledAt applies the nonzero rule the font pipeline uses. Two overlapping counter-wound bars in place of the one
  // saltire polygon would wind to -1 at the centre of the ✕ and fill it, which this catches at (8,8).
  const cases = {
    'warning-triangle': { holes: [[8, 8.5], [8, 12]], filled: [[8, 10.5], [6, 13], [8, 4]] }, // ! stem and dot; ink between, beside, above
    'info-disc': { holes: [[8, 5], [8, 9.5]], filled: [[8, 6.5], [4, 8]] }, // i dot and stem; ink between and beside
    'terminal-error': { holes: [[8, 8], [6.5, 6.5], [9.5, 9.5]], filled: [[8, 4.5], [5, 8]] }, // ✕ centre and two arms; disc between arms
  };
  for (const [name, { holes, filled }] of Object.entries(cases)) {
    const paths = pathsOf(drawings[name]());
    for (const point of holes) assert.equal(filledAt(paths, point), false, `${name}: hole at ${point}`);
    for (const point of filled) assert.equal(filledAt(paths, point), true, `${name}: ink at ${point}`);
  }
});

// ---- Bell-dot, remote, sync, loading, bracket (Task 8) ----
const centre = ({ minX, maxX, minY, maxY }) => [(minX + maxX) / 2, (minY + maxY) / 2];

test('sync is balanced about (8,8), so the spin modifier does not wobble it', () => {
  const [cx, cy] = centre(pathBounds(pathsOf(drawings['sync-arrows']())));
  assert.ok(Math.abs(cx - 8) <= 0.05 && Math.abs(cy - 8) <= 0.05, `centre (${cx}, ${cy})`);
});

test('sync maps onto itself under a half turn about (8,8)', () => {
  const key = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;
  const points = outlinesOf(drawings['sync-arrows']()).flat();
  const set = new Set(points.map(key));
  assert.deepEqual(points.filter(([x, y]) => !set.has(key([16 - x, 16 - y]))), []);
});

test('loading: the crescent outer circle is the r6 circle centred on (8,8)', () => {
  const points = outlinesOf(drawings['loading-crescent']()).flat();
  const far = Math.max(...points.map(([x, y]) => Math.hypot(x - 8, y - 8)));
  assert.ok(Math.abs(far - 6) <= 0.05, `farthest point ${far} from (8,8)`);
  const { minX, minY, maxY } = pathBounds(pathsOf(drawings['loading-crescent']()));
  for (const [label, value, expected] of [['minX', minX, 2], ['minY', minY, 2], ['maxY', maxY, 14]]) {
    assert.ok(Math.abs(value - expected) <= 0.05, `${label} ${value}`);
  }
});

const WAIST = 1; // 1.25 or more makes the 5x5 star a convex diamond/octagon, a dot at 16px

test('bell-dot: the whole bell plus a 5x5 ✦ in the free top-right corner, at least 1 unit clear', () => {
  const star = parts.star(12.5, 3.5, 2.5, WAIST);
  assert.equal(drawings['bell-dot'](), svgDocument(parts.bell(), star), 'the bell itself is untouched');
  assert.deepEqual(box([star]), { minX: 10, maxX: 15, minY: 1, maxY: 6 });
  const clearance = gap(subpaths(star), parts.bell().flatMap((d) => subpaths(d)));
  assert.ok(clearance >= 1 - 1e-9, `clearance ${clearance}`);
  // Concave: every inner vertex v (odd index) lies on the centre side of the line through its neighbouring tips a, b.
  const [outline] = subpaths(star);
  const centre = [12.5, 3.5];
  const cross = (a, b, v) => (b[0] - a[0]) * (v[1] - a[1]) - (b[1] - a[1]) * (v[0] - a[0]);
  for (let i = 1; i < outline.length; i += 2) {
    const [a, v, b] = [outline[i - 1], outline[i], outline[(i + 1) % outline.length]];
    assert.ok(cross(a, b, v) * cross(a, b, centre) > 1e-9, `inner vertex ${i} is not strictly inside ab: cross ${cross(a, b, v)}`);
  }
});

test('remote, sync and bracket stay on their keylines', () => {
  assert.deepEqual(bounds(drawings['moon-gate-small']()), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  assert.deepEqual(bounds(drawings['sync-arrows']()), { minX: 1.5, maxX: 14.5, minY: 3, maxY: 13 });
  assert.deepEqual(bounds(drawings.braces()), { minX: 3, maxX: 13, minY: 2, maxY: 14 });
});

// ---- Copilot states (Task 9) ----
test('copilot states keep the cat-head silhouette, so the status item does not jump', () => {
  const head = bounds(batchOne['cat-head']());
  assert.deepEqual(bounds(drawings['cat-asleep']()), head);
  assert.deepEqual(bounds(drawings['cat-warning']()), head);
  assert.deepEqual(bounds(drawings['cat-star']()), { ...head, minY: 1 }); // the pip rises to y1
  assert.deepEqual(bounds(drawings['cat-slash']()), { ...head, minY: 1 }); // the slash runs y1-15
});

test('copilot-unavailable: a slash 1 unit clear of the knocked-out head and of the left eye', () => {
  const slash = polygon([[5, 1], [6.5, 1], [13.5, 15], [12, 15]]);
  const all = outlinesOf(drawings['cat-slash']());
  const rest = without(all, slash);
  assert.equal(rest.length, all.length - 1, 'the slash appears once');
  const [leftEye] = parts.catEyes();
  assert.equal(without(rest, leftEye).length, rest.length - 1, 'the left eye is drawn whole');
  const clearance = gap(subpaths(slash), rest);
  assert.ok(clearance >= 1 - 1e-9, `clearance ${clearance}`);
});

test('copilot-snooze: the closed lids keep 1 unit from the head wall and from each other', () => {
  const lids = [crescent({ cx: 5.75, cy: 9, r: 1.75, thickness: 2, facing: 'up' }), crescent({ cx: 10.25, cy: 9, r: 1.75, thickness: 2, facing: 'up' })];
  const head = parts.catHeadOutline().flatMap((d) => subpaths(d));
  for (const lid of lids) assert.ok(gap(subpaths(lid), head) >= 1 - 1e-3, 'lid to head');
  assert.ok(gap(subpaths(lids[0]), subpaths(lids[1])) >= 1 - 1e-3, 'lid to lid');
  assert.equal(drawings['cat-asleep'](), svgDocument(parts.catHeadOutline(), lids));
});

test('copilot-dot: the ✦ pip sits between the ears on pixel column 7, 1 unit above the head', () => {
  const pip = parts.star(7.5, 2.5, 1.5, 0.5);
  assert.equal(drawings['cat-star'](), svgDocument(parts.catHeadOutline(), parts.catEyes(), pip), 'the cat head and both eyes, unchanged, plus the pip');
  assert.deepEqual(box([pip]), { minX: 6, maxX: 9, minY: 1, maxY: 4 }); // pixel column 7 (section 4)
  const clearance = gap(subpaths(pip), without(outlinesOf(drawings['cat-star']()), pip));
  assert.ok(clearance >= 1 - 1e-9, `clearance ${clearance}`);
});

test('copilot-warning is the solid cat head with the "!" cut out (gate 2), and no variant is left', () => {
  assert.deepEqual(Object.keys(variants), []);
  const solid = outlinesOf(drawings['cat-warning']());
  assert.equal(solid.length, 3, 'one solid head, two cut-outs');
  const [head, ...cuts] = solid;
  assert.deepEqual(head, subpaths(parts.catHeadOutline()[0])[0], 'the filled head is the shared cat outline, not a copy of its points');
  assert.deepEqual(cuts.map((cut) => box([polygon(cut)])),
    [{ minX: 7, maxX: 9, minY: 6, maxY: 11 }, { minX: 7, maxX: 9, minY: 12, maxY: 14 }], '"!" stem 2x5 and dot 2x2 on x7-9');
  assert.ok(cuts.every((cut) => gap([cut], [head]) >= 1 - 1e-9), 'each cut-out leaves a 1-unit wall');
});

// ---- Dirty-branch sprigs (Task 10) ----
// The badge literals below repeat status.mjs on purpose: the pin records which badge each state ships with, so swapping
// two badges, or redrawing one without updating this test, fails here (a ✦/✓ swap passed every gate-2 test).
test('each dirty-branch state carries its own badge: ✦ changes, ✓ staged, ! conflicts', () => {
  assert.equal(drawings['sprig-changes'](), svgDocument(parts.sprigSmall(), parts.star(12.5, 12.5, 2.5, 1)));
  assert.equal(drawings['sprig-staged'](), svgDocument(parts.sprigSmall(), polygon([[10, 12], [11, 11], [12, 12], [14, 10], [15, 11], [12, 14]])));
  assert.equal(drawings['sprig-conflicts'](), svgDocument(parts.sprigSmall(), rect(13, 9, 2, 3), rect(13, 13, 2, 2)));
});

test('dirty-branch sprigs: one badge each in the lower-right corner, 1 unit clear of the sprig', () => {
  const sprig = subpaths(parts.sprigSmall().join(''));
  const badges = new Set();
  for (const name of ['sprig-changes', 'sprig-staged', 'sprig-conflicts']) {
    const badge = without(outlinesOf(drawings[name]()), parts.sprigSmall().join(''));
    assert.equal(outlinesOf(drawings[name]()).length, sprig.length + badge.length, `${name} keeps the whole sprig`);
    const { minX, maxX, minY, maxY } = pathBounds(badge.map((poly) => `M${poly.map(([x, y]) => `${x} ${y}`).join('L')}Z`));
    assert.ok(minX >= 9 && maxX <= 15 && minY >= 9 && maxY <= 15, `${name} badge ${minX}-${maxX} x ${minY}-${maxY}`);
    const clearance = gap(badge, sprig);
    assert.ok(clearance >= 1 - 1e-9, `${name} clearance ${clearance}`);
    badges.add(JSON.stringify(badge));
  }
  assert.equal(badges.size, 3);
});
