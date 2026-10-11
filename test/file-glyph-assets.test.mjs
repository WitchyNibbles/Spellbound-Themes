import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/assets.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];
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

test('the assets module draws compass, portrait and type-block', () => {
  assert.deepEqual(Object.keys(drawings), ['compass', 'portrait', 'type-block']);
});

const SHAPES = {
  compass: {
    what: 'svg, a drafting compass: a needle leg and a pencil leg, 2:1 bands, the hinge ring painted last over the legs; the bow is dropped, it read as the crossbar of an A',
    roles: ['assets', 'assets'], bounds: [2, 15, 1, 15], accent: [6, 10, 1, 5], gap: 0,
    ink: [
      [[8, 1.5], true], [[8, 3], false], [[6.5, 3], true], // the hinge ring and its real hole
      [[5.25, 8], true], [[10.75, 8], true], [[8, 8], false], [[4.25, 10], true], [[3.25, 12.9], true], // the legs
      [[2.5, 14.5], true], [[1.5, 14.5], false], [[3.5, 14.5], false], [[3.25, 13.5], false], [[14.25, 14.5], true], [[8, 14.5], false], // the needle and the pencil foot
      [[8, 9], false], [[8, 10], false], [[8, 11], false], // no bow between the legs
    ],
  },
  portrait: {
    what: 'png, jpg, jpeg, gif and webp, a framed portrait: a frame with a hill, the moon painted last in gold (the multi-colour case)',
    roles: ['assets', 'data'], bounds: [1, 15, 2, 14], accent: [7.5, 11.5, 4.5, 9.5], gap: 1,
    ink: [
      [[1.5, 8], true], [[8, 2.5], true], [[8, 13.5], true], [[3, 5], false], [[6, 11], true], [[12, 11], false], [[3.5, 12.5], true], // frame, hill
      [[8.5, 7], true], [[11, 7], false], [[10, 5], true], // the crescent moon, opening to the right
    ],
  },
  'type-block': {
    what: 'ttf, otf, woff and woff2, a type block: a 1-unit block face, the T painted last',
    roles: ['assets', 'assets'], bounds: [2, 14, 1, 15], accent: [4, 12, 3, 13], gap: 1,
    ink: [[[2.5, 8], true], [[8, 1.5], true], [[8, 4], true], [[8, 10], true], [[5, 8], false], [[11, 8], false], [[8, 13.5], false], [[8, 14.5], true], [[3.5, 3.5], false]],
  },
};
for (const [name, shape] of Object.entries(SHAPES)) test(`${name} (${shape.what})`, () => checkShape(drawings[name](), shape, name));

const MAP = {
  compass: { category: 'assets', fileExtensions: ['svg'] },
  portrait: { category: 'assets', fileExtensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] },
  'type-block': { category: 'assets', fileExtensions: ['ttf', 'otf', 'woff', 'woff2'] },
};
for (const [name, entry] of Object.entries(MAP)) {
  test(`map: ${name} serves ${entry.fileExtensions.join(', ')}, in assets`, () => assert.deepEqual(mapEntry(name), entry));
}
