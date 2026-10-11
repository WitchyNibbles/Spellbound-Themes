import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { SVGPathData } from 'svg-pathdata';
import { drawings } from '../scripts/file-glyphs/code.mjs';
import { drawings as data } from '../scripts/file-glyphs/data.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, pointInPolygon, signedArea, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by (0.125, 0.3125), so no sample lands on a whole, half or 45-degree edge,
// mirrored or not.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.125 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.3125 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
// Width of the ink along the row y, sampled every 1/8 unit.
const rowWidth = (ds, y) => Array.from({ length: 128 }, (_, i) => 0.0625 + i / 8).filter((x) => filledAt(ds, [x, y])).length / 8;
// Slopes |dy / dx| of the straight segments that are neither horizontal nor vertical.
const slopes = (d) => {
  const found = [];
  let pen = null;
  for (const command of new SVGPathData(d).toAbs().normalizeHVZ().commands) {
    if (command.type === SVGPathData.LINE_TO && pen[0] !== command.x && pen[1] !== command.y) found.push(Math.abs((command.y - pen[1]) / (command.x - pen[0])));
    if ('x' in command) pen = [command.x, command.y];
  }
  return found;
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

test('the code module draws gem-cut, snake and the gate-6 code drawings', () => {
  assert.deepEqual(Object.keys(drawings), ['gem-cut', 'snake', 'gem-rough', 'gem-ring', 'skeleton-key', 'tablet-prompt', 'tablet-dollar', 'fish-bones']);
});

test('gem-cut (ts): a 1-unit pavilion under a 1-unit girdle, 14 wide, and the solid crown with its flat table painted last, 1 unit above (spec 6.2)', () => {
  const [pavilion, crown] = partsOf(drawings['gem-cut']());
  assert.deepEqual([pavilion.role, crown.role], ['code', 'code']);
  assert.deepEqual(pathBounds([pavilion.d, crown.d]), { minX: 1, maxX: 15, minY: 1, maxY: 14 }, '14 wide, 13 tall');
  assert.deepEqual(pathBounds([crown.d]), { minX: 1, maxX: 15, minY: 1, maxY: 5 }, 'the accent: 14x4, over the 4x4 shape minimum');
  assert.deepEqual(pathBounds([pavilion.d]), { minX: 1, maxX: 15, minY: 6, maxY: 14 });
  assert.equal(outlineGap(subpaths(pavilion.d), subpaths(crown.d)), 1, 'the crown is one unit clear of the girdle');
  assert.deepEqual([...new Set([...slopes(pavilion.d), ...slopes(crown.d)])], [1], 'every slanted edge is 45 degrees');
  const ds = [pavilion.d, crown.d];
  probe(ds, [
    [[8, 1.5], true], [[5.25, 1.25], true], [[4.25, 1.25], false], [[1.5, 4.75], true], [[1.5, 3.5], false], // the table and the crown's 45-degree sides
    [[8, 5.5], false], [[1.5, 5.5], false], [[14.5, 5.5], false], // the 1-unit cut under the crown
    [[8, 6.5], true], [[1.5, 6.5], true], [[14.5, 6.5], true], // the girdle, x1-15
    [[8, 9], false], [[8, 11.5], false], [[8, 12.5], true], [[8, 13.5], true], [[8, 14.25], false], // the hole (real), the point at the bottom
    [[3.75, 10], false], [[4.25, 10], true], [[5.75, 10], true], [[6.25, 10], false], // the left side: 2 units across horizontally (1.41 across)
    [[9.75, 10], false], [[10.25, 10], true], [[11.75, 10], true], [[12.25, 10], false], // the right side
  ], 'gem-cut');
  assert.deepEqual(SAMPLES.filter(([x, y]) => filledAt(ds, [x, y]) !== filledAt(ds, [16 - x, y])).map(String), [], 'mirrored about x = 8');
});

test('gem-cut sets the gem language (spec 6, 6.2): flat on top, widest at the girdle, pointed at the bottom', () => {
  const ds = partsOf(drawings['gem-cut']()).map((part) => part.d);
  assert.deepEqual([rowWidth(ds, 1.25), rowWidth(ds, 6.5), rowWidth(ds, 13.5)], [6.5, 14, 1]);
});

test('map: gem-cut serves ts, mts and cts and the typescript language, in code', () => {
  assert.deepEqual(mapEntry('gem-cut'), { category: 'code', fileExtensions: ['ts', 'mts', 'cts'], languageIds: ['typescript'] });
});

test('snake (py): one 2-unit band in an S-coil with a tapered tail, then the solid head (5x4) painted last (spec 6.2)', () => {
  const [band, head] = partsOf(drawings.snake());
  assert.deepEqual([band.role, head.role], ['code', 'code']);
  assert.deepEqual([subpaths(band.d).length, subpaths(head.d).length], [1, 1], 'one band and one head: a single snake, never the two-snake mark (spec 6 logo rule)');
  assert.deepEqual(pathBounds([band.d, head.d]), { minX: 3, maxX: 14, minY: 2, maxY: 15 });
  assert.deepEqual(pathBounds([head.d]), { minX: 9, maxX: 14, minY: 2, maxY: 6 }, 'the accent: 5x4, over the 4x4 shape minimum');
  const ds = [band.d, head.d];
  probe(ds, [
    [[7.5, 2.5], false], [[7.5, 3.5], true], [[7.5, 4.5], true], [[7.5, 5.5], false], // the top run, y3-5
    [[8, 7.5], false], [[8, 8.5], true], [[8, 9.5], true], [[8, 10.5], false], // the middle run, y8-10
    [[7, 12.5], false], [[7, 13.5], true], [[7, 14.5], true], // the bottom run, y13-15
    [[2.75, 6.5], false], [[3.5, 6.5], true], [[4.5, 6.5], true], [[5.5, 6.5], false], // the upper coil's left side, x3-5
    [[10.5, 11.5], false], [[11.5, 11.5], true], [[12.5, 11.5], true], [[13.25, 11.5], false], // the lower coil's right side, x11-13
    [[3.85, 3.85], false], [[4.73, 4.73], true], [[5.62, 5.62], false], // 2 units across the upper coil at 45 degrees (radii 3.5 and 1.5)
    [[10.5, 6.5], false], [[5, 11.5], false], // the coils open to the right, then to the left: an S
    [[11, 2.5], true], [[13.5, 4], true], [[11, 5.5], true], [[11, 7], false], // the head bulges 1 unit above and below the band, 2 units clear of the middle run
    [[3.25, 14.5], false], [[3.75, 14.75], true], [[4.5, 13.25], false], [[5.5, 13.5], true], // the tail tapers along a 45-degree cut to a point at (3,15)
  ], 'snake');
});

test('map: snake serves py and pyw and the python language, in code', () => {
  assert.deepEqual(mapEntry('snake'), { category: 'code', fileExtensions: ['py', 'pyw'], languageIds: ['python'] });
});

// ---- Gate 6: the code batch (spec 6, 6.2, G42, G43) ----
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
// Silhouette: the ink of the solid (clockwise) subpaths alone, holes ignored, so two drawings must differ in outline and
// not only inside (spec 6's 16px rule for look-alikes).
const silhouetteOf = (svg) => {
  const solids = partsOf(svg).flatMap((part) => subpaths(part.d)).filter((polygon) => signedArea(polygon) > 0);
  return (point) => solids.some((polygon) => pointInPolygon(point, polygon));
};
const silhouetteDifference = (a, b) => {
  const [inA, inB] = [silhouetteOf(a), silhouetteOf(b)];
  return SAMPLES.filter((point) => inA(point) !== inB(point)).length;
};

const SHAPES = {
  'gem-rough': {
    what: 'js, the rough crystal cluster: a tall spire and a small point, both solid and pointed with a 45-degree foot, and a leaning crystal painted last, one unit clear (G43)',
    roles: ['code', 'code'], bounds: [2, 14, 1, 15], accent: [2, 6, 7, 15], gap: 1,
    ink: [
      [[9, 3], true], [[9, 0.75], false], [[8, 8], true], [[10.5, 12], true], [[10, 14.5], true], [[7.5, 14.5], false], // the tall spire, its 45-degree foot
      [[8.25, 2], false], [[7.5, 3.5], false], [[10.75, 3.5], false], // the 2:1 shoulders of the spire
      [[13, 12], true], [[13, 8.5], true], [[12.25, 9], false], [[13.5, 14.5], false], [[12.5, 14], true], // the small crystal and its foot
      [[3.25, 8], true], [[4, 11], true], [[5.5, 14.5], true], [[2.5, 12.5], true], [[2.5, 14.5], false], // the leaning crystal and its foot
      [[2.5, 7.5], false], [[5.5, 8], false], // pointed at (3,7)
      [[6.5, 12], false], [[11.5, 12], false], // one unit between the crystals
    ],
  },
  'gem-ring': {
    what: 'tsx and jsx, the gem in a ring: a 1-unit 10-unit ring band, and a small cut gem set on top, point down, painted last (G43)',
    roles: ['code', 'code'], bounds: [3, 13, 1, 15], accent: [4, 12, 1, 7], gap: 0,
    ink: [
      [[8, 10], false], [[3.5, 10], true], [[12.5, 10], true], [[8, 14.5], true], // the band and its real hole
      [[8, 1.5], true], [[4.5, 3], true], [[8, 6.5], true], [[8, 7.5], false], [[5, 1.5], false], // the stone: table, girdle, point
    ],
  },
  'skeleton-key': {
    what: 'html, one key lying flat: a 1-unit ring bow, a 1-unit shaft, and the toothed bit painted last',
    roles: ['code', 'code'], bounds: [1, 15, 5, 12], accent: [11, 15, 8, 12], gap: 0,
    ink: [
      [[4, 8], false], [[1.5, 8], true], [[4, 5.5], true], // the bow and its real hole
      [[9, 7.5], true], [[9, 8.5], false], [[12, 6.5], false], // the shaft
      [[12, 11], true], [[13.5, 11], false], [[14.5, 11], true], [[13.5, 9], true], // the bit's two teeth and notch
    ],
  },
  'tablet-prompt': {
    what: 'sh, an arched stone tablet with the prompt chevron painted last',
    roles: ['code', 'code'], bounds: [2, 14, 1, 15], accent: [5, 10.5, 6, 13], gap: 1,
    ink: [
      [[8, 1.5], true], [[2.5, 10], true], [[13.5, 10], true], [[8, 14.5], true], [[4, 10], false], [[12, 10], false], // the tablet
      [[6, 6.5], true], [[9.5, 9.5], true], [[7, 9.5], false], [[6, 12.5], true], // the chevron, 1.41 across
    ],
  },
  'tablet-dollar': {
    what: 'ps1, a chamfered stone slab with a $ painted last, never the >_ mark',
    roles: ['code', 'code'], bounds: [2, 14, 1, 15], accent: [5, 11, 4, 13], gap: 1,
    ink: [
      [[2.5, 1.5], false], [[8, 1.5], true], [[13.5, 9], true], [[8, 14.5], true], [[4, 9], false], // the slab, its chamfered corners
      [[8, 4.5], true], [[6, 4.5], false], [[8, 5.5], true], [[8, 6.5], false], [[5.5, 7], true], [[10.5, 7], false], // the $
      [[8, 8.5], true], [[10.5, 10], true], [[5.5, 10], false], [[8, 11.5], true], [[8, 12.5], true], [[6, 12.5], false],
    ],
  },
  'fish-bones': {
    what: 'fish, a fish skeleton: forked tail, spine and two ribs, and the head with a real eye painted last',
    roles: ['code', 'code'], bounds: [1, 15, 3, 12], accent: [10, 15, 4, 11], gap: 0,
    ink: [
      [[1.5, 5], true], [[1.5, 7.5], false], [[3.25, 7.5], true], [[1.5, 10], true], // the forked tail
      [[6.5, 7.5], true], [[6.5, 6], false], [[5.5, 4.5], true], [[5.5, 3.5], false], [[7.5, 3.5], true], [[9.5, 5], false], // spine and ribs
      [[10.5, 5], true], [[14, 7.5], true], [[12, 7], false], [[14.75, 4.5], false], // the head and its eye
    ],
  },
};
for (const [name, shape] of Object.entries(SHAPES)) test(`${name} (${shape.what})`, () => checkShape(drawings[name](), shape, name));

test('the three code gems differ in silhouette, not only inside (spec 6 16px rule, G43): the cut gem, the rough crystal, the ring', () => {
  const gems = { 'gem-cut': drawings['gem-cut'](), 'gem-rough': drawings['gem-rough'](), 'gem-ring': drawings['gem-ring']() };
  const names = Object.keys(gems);
  for (const [i, a] of names.entries()) for (const b of names.slice(i + 1)) {
    const changed = silhouetteDifference(gems[a], gems[b]);
    assert.ok(changed >= 150, `${a} and ${b}: ${changed} of 1024 samples differ in silhouette`);
  }
  // The rough crystal's tall point is narrow (2 across at y3, 4 across at y5); the cut gem the widest at its girdle (14).
  assert.deepEqual([rowWidth([partsOf(gems['gem-rough'])[0].d], 3), rowWidth([partsOf(gems['gem-rough'])[0].d], 5.5), rowWidth(partsOf(gems['gem-cut']).map((part) => part.d), 6.5)], [2, 4, 14]);
});

test('the json keyring and the html skeleton key differ in silhouette: keys hanging from a ring, one key lying flat', () => {
  assert.ok(silhouetteDifference(data.keyring(), drawings['skeleton-key']()) >= 300);
});

test('the sh and ps1 tablets differ in silhouette (an arch, a chamfered slab), not only in their inscription', () => {
  const changed = silhouetteDifference(drawings['tablet-prompt'](), drawings['tablet-dollar']());
  assert.ok(changed >= 40, `${changed} of 1024 samples differ`);
  const [arch, slab] = [silhouetteOf(drawings['tablet-prompt']()), silhouetteOf(drawings['tablet-dollar']())];
  assert.deepEqual([arch([2.25, 2.25]), slab([2.25, 2.25])], [false, false], 'both corners are cut');
  assert.deepEqual([arch([2.5, 4.5]), slab([2.5, 4.5])], [false, true], 'the arch curves in where the slab stands square');
});

const MAP = {
  'gem-rough': { category: 'code', fileExtensions: ['js', 'mjs', 'cjs'], languageIds: ['javascript'] },
  'gem-ring': { category: 'code', fileExtensions: ['tsx', 'jsx'], languageIds: ['typescriptreact', 'javascriptreact'] },
  'skeleton-key': { category: 'code', fileExtensions: ['html', 'htm'] },
  'tablet-prompt': { category: 'code', fileExtensions: ['sh'] },
  'tablet-dollar': { category: 'code', fileExtensions: ['ps1'] },
  'fish-bones': { category: 'code', fileExtensions: ['fish'] },
};
for (const [name, entry] of Object.entries(MAP)) {
  test(`map: ${name} serves ${Object.entries(entry).filter(([key]) => key !== 'category').flatMap(([, keys]) => keys).join(', ')}, in code`, () => {
    assert.deepEqual(mapEntry(name), entry);
  });
}
