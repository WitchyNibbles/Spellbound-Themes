import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/data.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, pointInPolygon, signedArea, subpaths } from '../scripts/lib/svg-geometry.mjs';

const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
const boxOf = (polygon) => {
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)].map((value) => Number(value.toFixed(3)));
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

test('the data module draws keyring, cabinet, beads and cylinder', () => {
  assert.deepEqual(Object.keys(drawings), ['keyring', 'cabinet', 'beads', 'cylinder']);
});

test('keyring (json): a 1-unit ring at the top left with a real hole, two keys hanging at different lengths, the two solid bows painted last (spec 6.2)', () => {
  const [outline, bows] = partsOf(drawings.keyring());
  assert.deepEqual([outline.role, bows.role], ['data', 'data']);
  assert.deepEqual(pathBounds([outline.d, bows.d]), { minX: 2, maxX: 12, minY: 1, maxY: 15 });
  const [ringOuter, ringHole, shaftA, toothA, shaftB, ...teethB] = subpaths(outline.d);
  const [bowA, bowB] = subpaths(bows.d);
  assert.deepEqual([boxOf(ringOuter), boxOf(ringHole)], [[3, 9, 1, 7], [4, 8, 2, 6]], 'the ring: r3 about (6,4), 1 unit thick');
  assert.deepEqual([boxOf(bowA), boxOf(bowB)], [[3, 6, 6, 9], [8, 11, 4, 7]], 'the accent: two 3x3 bows (the dot minimum), on whole pixels');
  assert.equal(teethB.length, 2);
  for (const bow of [bowA, bowB]) {
    assert.equal(outlineGap([ringOuter], [bow]), 0, 'each bow overlaps the ring it hangs on');
    assert.ok(outlineGap([ringHole], [bow]) > 0.3, 'and leaves the ring\'s hole whole');
  }
  assert.ok(outlineGap([shaftA, toothA, bowA], [shaftB, ...teethB, bowB]) >= 1, 'the two keys stay one unit apart');
  probe([outline.d, bows.d], [
    [[6, 4], false], [[6, 2.25], false], [[4.25, 4], false], [[6, 1.5], true], [[3.5, 4], true], // the ring's hole (real) and band
    [[4.5, 7.5], true], [[9.5, 5.5], true], // the bows
    [[4.5, 12.5], true], [[4.5, 13.5], false], [[2.5, 11.5], true], [[2.5, 12.5], false], // key A: shaft x4-5 to y13, one tooth to the left
    [[9.5, 14.5], true], [[11.5, 12.5], true], [[11.5, 13.5], false], [[11.5, 14.5], true], // key B: shaft x9-10 to y15, two teeth to the right
    [[8, 9], false], [[7.5, 11], false], [[10.5, 9], false], // between the keys
  ], 'keyring');
});

test('map: keyring serves json and jsonc and both languages, in data', () => {
  assert.deepEqual(mapEntry('keyring'), { category: 'data', fileExtensions: ['json', 'jsonc'], languageIds: ['json', 'jsonc'] });
});

// ---- Gate 6: the data batch (spec 6, G42) ----
const box = ({ minX, maxX, minY, maxY }) => [minX, maxX, minY, maxY].map((value) => Number(value.toFixed(2)));
// One drawing against its construction: the roles of its parts in paint order, its bounds and its accent's (the last
// part), the accent's distance from the rest (0 where G42 lets an accent that is part of the silhouette touch it; else
// at least the unit of section 4, less 0.01 for flattened arcs), and ink probes away from every edge.
const checkShape = (svg, { roles, bounds, accent, gap, ink }, label) => {
  const parts = partsOf(svg);
  assert.deepEqual(parts.map((part) => part.role), roles, `${label}: roles in paint order`);
  assert.deepEqual(box(pathBounds(parts.map((part) => part.d))), bounds, `${label}: bounds`);
  assert.deepEqual(box(pathBounds([parts.at(-1).d])), accent, `${label}: accent bounds`);
  const measured = outlineGap(parts.slice(0, -1).flatMap((part) => subpaths(part.d)), subpaths(parts.at(-1).d));
  if (gap === 0) assert.equal(measured, 0, `${label}: the accent is part of the silhouette and meets it (G42)`);
  else assert.ok(measured >= gap - 0.01, `${label}: the accent keeps ${gap} from the outline (measured ${measured.toFixed(3)})`);
  probe(parts.map((part) => part.d), ink, label);
};

const SHAPES = {
  cabinet: {
    what: 'sql, an apothecary cabinet: six drawers in two columns on two feet, the cornice painted last',
    roles: ['data', 'data'], bounds: [2, 15, 1, 15], accent: [2, 15, 1, 5], gap: 0,
    ink: [
      [[6, 6], false], [[11, 6], false], [[6, 9], false], [[11, 9], false], [[6, 12], false], [[11, 12], false], // six real drawers
      [[8.5, 6], true], [[3.5, 9], true], [[13.5, 9], true], [[8, 7.5], true], [[8, 13.5], true], // walls, divider, shelves
      [[2.5, 2], true], [[14.5, 2], true], [[2.5, 4.5], true], [[8.5, 4.5], true], [[2.5, 6], false], // the cornice (y1-5, overlapping the body's top wall), one unit wider than the body
      [[3.5, 14.5], true], [[8, 14.5], false], [[13.5, 14.5], true], // two feet
    ],
  },
  beads: {
    what: 'jsonl, a garland: a 1-unit U of string with its arms cut at y3, the five 3-unit beads threaded on it painted last',
    roles: ['data', 'data'], bounds: [1, 15, 2, 13], accent: [1, 15, 2, 13], gap: 0,
    ink: [
      [[2.5, 2.2], true], [[13.5, 2.2], true], [[2.5, 2.8], true], [[2.5, 5.4], true], [[8, 5], false], [[4, 4], false], [[2.5, 1.8], false], // the arm bead caps the arm tip, the arm below it, the inside of the U
      [[3.5, 9.5], true], [[8, 11.5], true], [[12.5, 9.5], true], [[5.5, 11.2], true], [[5.5, 7], false], [[8, 8], false], [[4, 12.5], false], [[12, 12.5], false], // the arc beads and the string between them
    ],
  },
  cylinder: {
    what: 'db, a cylinder: an elliptical top with a real hole, walls and a curved floor, the crescent painted last on its front',
    roles: ['data', 'data'], bounds: [2, 14, 1, 15], accent: [5.5, 9.5, 7.5, 12.5], gap: 1,
    ink: [
      [[8, 1.5], true], [[8, 3], false], [[8, 4.5], true], [[2.5, 9], true], [[13.5, 9], true], [[8, 14.5], true], // top, walls, floor
      [[4, 8], false], [[12, 12], false], // the body's real hole
      [[6.5, 10], true], [[8.75, 10], false], [[7, 8], true], // the crescent, opening to the right
    ],
  },
};
for (const [name, shape] of Object.entries(SHAPES)) test(`${name} (${shape.what})`, () => checkShape(drawings[name](), shape, name));

// Silhouette: the ink of the solid (clockwise) subpaths alone, holes ignored (spec 6's 16px rule for look-alikes).
const SILHOUETTE_SAMPLES = Array.from({ length: 32 }, (_, i) => 0.125 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.3125 + j / 2]));
const silhouetteOf = (svg) => {
  const solids = partsOf(svg).flatMap((part) => subpaths(part.d)).filter((polygon) => signedArea(polygon) > 0);
  return (point) => solids.some((polygon) => pointInPolygon(point, polygon));
};
const silhouetteDifference = (a, b) => {
  const [inA, inB] = [silhouetteOf(a), silhouetteOf(b)];
  return SILHOUETTE_SAMPLES.filter((point) => inA(point) !== inB(point)).length;
};

test('the jsonl beads and the db cylinder differ in silhouette (spec 6 16px rule): an open U of round beads, a closed upright drum', () => {
  const changed = silhouetteDifference(drawings.beads(), drawings.cylinder());
  assert.ok(changed >= 300, `${changed} of 1024 samples differ`);
  assert.ok(silhouetteDifference(drawings.beads(), drawings.keyring()) >= 300, 'and from the json keyring');
});

test('the beads are five 3-unit beads on .5 centres, at least 1.9 units apart', () => {
  const beads = subpaths(partsOf(drawings.beads()).at(-1).d);
  assert.deepEqual(beads.map((bead) => boxOf(bead)), [[1, 4, 2, 5], [12, 15, 2, 5], [2, 5, 8, 11], [6.5, 9.5, 10, 13], [11, 14, 8, 11]]);
  const centres = [[2.5, 3.5], [13.5, 3.5], [3.5, 9.5], [8, 11.5], [12.5, 9.5]];
  for (let i = 0; i < centres.length; i++) for (let j = i + 1; j < centres.length; j++) {
    assert.ok(Math.hypot(centres[i][0] - centres[j][0], centres[i][1] - centres[j][1]) - 3 >= 1.9, `beads ${i} and ${j}`);
  }
});

const MAP = {
  cabinet: { category: 'data', fileExtensions: ['sql'] },
  beads: { category: 'data', fileExtensions: ['jsonl'] },
  cylinder: { category: 'data', fileExtensions: ['db'] },
};
for (const [name, entry] of Object.entries(MAP)) {
  test(`map: ${name} serves ${entry.fileExtensions.join(', ')}, in data`, () => assert.deepEqual(mapEntry(name), entry));
}
