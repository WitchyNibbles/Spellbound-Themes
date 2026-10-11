import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/config.mjs';
import { drawings as code } from '../scripts/file-glyphs/code.mjs';
import { drawings as data } from '../scripts/file-glyphs/data.mjs';
import { BADGE_BOX } from '../scripts/file-glyphs/parts.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, pointInPolygon, signedArea, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by (0.125, 0.3125), so no sample lands on a whole, half or 45-degree edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.125 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.3125 + j / 2]));
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
// Silhouette: the ink of the solid (clockwise) subpaths alone, holes ignored (spec 6's 16px rule for look-alikes).
const silhouetteOf = (svg) => {
  const solids = partsOf(svg).flatMap((part) => subpaths(part.d)).filter((polygon) => signedArea(polygon) > 0);
  return (point) => solids.some((polygon) => pointInPolygon(point, polygon));
};
const silhouetteDifference = (a, b) => {
  const [inA, inB] = [silhouetteOf(a), silhouetteOf(b)];
  return SAMPLES.filter((point) => inA(point) !== inB(point)).length;
};

test('the config module draws cairn, tag, vial, padlock, recipe-card, gem-gear, crate and veil', () => {
  assert.deepEqual(Object.keys(drawings), ['cairn', 'tag', 'vial', 'padlock', 'recipe-card', 'gem-gear', 'crate', 'veil']);
});

const SHAPES = {
  cairn: {
    what: 'yaml, a stone cairn: three flat stones stacked off-centre one unit apart, the top pebble painted last',
    roles: ['config', 'config'], bounds: [2, 14, 1, 15], accent: [7, 10, 1, 4], gap: 1,
    ink: [
      [[8.5, 2.5], true], [[8.5, 4.5], false], [[9, 6], true], [[8, 7.5], false], [[7, 9.5], true], [[8, 11.5], false], [[8, 13.5], true],
      [[12.5, 9.5], false], [[3.5, 9.5], true], [[5.5, 6], false], // off-centre: the middle stone to the left, the top one to the right
    ],
  },
  tag: {
    what: 'toml, a tag on a string: a 1-unit hooked string, the pointed tag with a real eyelet painted last',
    roles: ['config', 'config'], bounds: [1, 15, 1, 12], accent: [4, 15, 4, 12], gap: 1,
    ink: [
      [[1.5, 1.5], true], [[3, 4.5], true], [[5.5, 5.5], false], // the string, short of the tag
      [[8, 8], false], [[12, 8], true], [[5, 8], true], [[5, 6], false], [[14.5, 11.5], true], // the tag, its eyelet, its point
    ],
  },
  vial: {
    what: 'env, a stoppered vial: stopper, neck and body, the label with two eye pixels painted last (spec 6)',
    roles: ['config', 'config'], bounds: [4, 13, 1, 15], accent: [6, 11, 9, 13], gap: 1,
    ink: [
      [[8, 2], true], [[8, 3.5], false], [[6.5, 5], true], [[8.5, 6], false], [[4.5, 10], true], [[5.5, 10], false], [[8.5, 14.5], true],
      [[8, 12], true], [[7.5, 10.5], false], [[9.5, 10.5], false], [[8.5, 10.5], true], [[6.5, 10.5], true], // the label and its eyes
    ],
  },
  padlock: {
    what: 'lock and the lockfiles, a padlock: a 2-unit shackle, the body with a real crescent keyhole painted last',
    roles: ['config', 'config'], bounds: [2, 14, 1, 15], accent: [2, 14, 7, 15], gap: 0,
    ink: [
      [[8, 1.5], true], [[4.5, 5], true], [[11.5, 5], true], [[8, 5], false], // the shackle and its opening
      [[3, 9], true], [[13, 13], true], [[6.5, 11], false], [[8.5, 11], true], // the body and its crescent keyhole
    ],
  },
  'recipe-card': {
    what: 'package.json, pyproject.toml and requirements.txt, a landscape recipe card with two ruled lines, the title block painted last',
    roles: ['config', 'config'], bounds: [1, 15, 2, 14], accent: [3, 9, 4, 7], gap: 1,
    ink: [
      [[1.5, 8], true], [[8, 2.5], true], [[11, 5], false], [[8, 9.5], true], [[8, 10.5], false], [[11.5, 11.5], false], [[6, 11.5], true],
      [[6, 5.5], true], [[9.5, 5.5], false],
    ],
  },
  'gem-gear': {
    what: 'tsconfig.json and jsconfig.json, the cut gem knocked out around the badge box, the cog with a real hole painted last',
    roles: ['config', 'config'], bounds: [1, 15, 1, 15], accent: [8, 15, 8, 15], gap: 1,
    ink: [
      [[8, 2], true], [[8, 6.5], true], [[4.5, 9.5], true], [[7.5, 11.5], false], [[13.5, 9.5], true], // crown, girdle, the left side cut at x7
      [[11.5, 11.5], false], [[9, 11.5], true], [[11.5, 8.5], true], [[8.5, 8.5], false], // the cog, its hole and stepped corners
    ],
  },
  crate: {
    what: 'Dockerfile, a crate: a square frame with a middle plank, two 45-degree struts (one per panel) painted last',
    roles: ['config', 'config'], bounds: [1, 15, 2, 15], accent: [2, 9, 3, 14], gap: 0,
    ink: [
      [[1.5, 10], true], [[11, 8.5], true], [[11, 4], false], [[11, 12], false], // the frame, the plank, both open panels
      [[5.5, 5.5], true], [[3.5, 5.5], false], [[7.5, 5.5], false], // the upper strut
      [[5.5, 11.5], true], [[3, 11.5], false], [[8, 11.5], false], // the lower strut
    ],
  },
  veil: {
    what: '.gitignore, a veil: two tied-back curtains parted in the middle, the rod they hang from painted last',
    roles: ['config', 'config'], bounds: [1, 15, 1, 15], accent: [1, 15, 1, 3], gap: 1,
    ink: [
      [[8, 2], true], [[8, 3.5], false], [[8, 10], false], [[3, 6], true], [[13, 6], true], [[3, 14.5], true], [[13, 14.5], true], [[6.5, 13], false],
      [[8, 14.5], false], [[3, 9], true], [[5.5, 9], false], [[10.5, 9], false], [[13, 9], true], // the waists, the hems apart
    ],
  },
};
for (const [name, shape] of Object.entries(SHAPES)) test(`${name} (${shape.what})`, () => checkShape(drawings[name](), shape, name));

test('the yaml cairn, the jsonl beads and the db cylinder differ in silhouette (spec 6 16px rule)', () => {
  const stacks = { cairn: drawings.cairn(), beads: data.beads(), cylinder: data.cylinder() };
  const names = Object.keys(stacks);
  for (const [i, a] of names.entries()) for (const b of names.slice(i + 1)) {
    const changed = silhouetteDifference(stacks[a], stacks[b]);
    assert.ok(changed >= 300, `${a} and ${b}: ${changed} of 1024 samples differ`);
  }
});

test('gem-gear is the cut gem with its lower right knocked out 1 unit around the badge box and the cog in it, so it differs from gem-cut in silhouette', () => {
  const [gem, cog] = partsOf(drawings['gem-gear']());
  const cut = partsOf(code['gem-cut']()).map((part) => part.d);
  const outside = SAMPLES.filter(([x, y]) => x < BADGE_BOX.x - 1 || y < BADGE_BOX.y - 1);
  assert.deepEqual(outside.filter((point) => filledAt([gem.d], point) !== filledAt(cut, point)).map(String), [], 'the gem-cut ink outside the knockout');
  assert.deepEqual(SAMPLES.filter(([x, y]) => x > BADGE_BOX.x - 1 && y > BADGE_BOX.y - 1 && filledAt([gem.d], [x, y])).map(String), [], 'nothing of the gem in the knockout');
  const { minX, maxX, minY, maxY } = pathBounds([cog.d]);
  assert.ok(minX >= BADGE_BOX.x && maxX <= BADGE_BOX.x + BADGE_BOX.w && minY >= BADGE_BOX.y && maxY <= BADGE_BOX.y + BADGE_BOX.h, 'the cog inside BADGE_BOX');
  const changed = silhouetteDifference(drawings['gem-gear'](), code['gem-cut']());
  assert.ok(changed >= 150, `${changed} of 1024 samples differ from gem-cut`);
});

const MAP = {
  cairn: { category: 'config', fileExtensions: ['yaml', 'yml'], languageIds: ['yaml'] },
  tag: { category: 'config', fileExtensions: ['toml'] },
  vial: { category: 'config', fileExtensions: ['env'], fileNames: ['.env', '.env.local', '.env.development', '.env.production', '.env.example'] },
  padlock: { category: 'config', fileExtensions: ['lock'], fileNames: ['package-lock.json', 'yarn.lock', 'cargo.lock', 'poetry.lock'] },
  'recipe-card': { category: 'config', fileNames: ['package.json', 'pyproject.toml', 'requirements.txt'] },
  'gem-gear': { category: 'config', fileNames: ['tsconfig.json', 'jsconfig.json'] },
  crate: { category: 'config', fileNames: ['dockerfile'] },
  veil: { category: 'config', fileNames: ['.gitignore'] },
};
for (const [name, entry] of Object.entries(MAP)) {
  const keys = [...new Set(Object.entries(entry).filter(([property]) => property !== 'category').flatMap(([, list]) => list))];
  test(`map: ${name} serves ${keys.join(', ')}, in config`, () => assert.deepEqual(mapEntry(name), entry));
}
