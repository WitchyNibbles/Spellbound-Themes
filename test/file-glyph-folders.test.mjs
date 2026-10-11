import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/folders.mjs';
import { drawings as defaults } from '../scripts/file-glyphs/defaults.mjs';
import { BADGE_BOX, folderBody } from '../scripts/file-glyphs/parts.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, pointInPolygon, signedArea, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by 0.25, so no sample lands on an edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.25 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.25 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const inkOf = (svg) => (point) => filledAt(partsOf(svg).map((part) => part.d), point);
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

// Spec 6's folder table after src: the badge name, the folder names it serves, its category.
const FOLDERS = {
  tests: [['tests', 'test', '__tests__'], 'tests'], docs: [['docs'], 'docs'], scripts: [['scripts'], 'code'], assets: [['assets'], 'assets'],
  dist: [['dist'], 'code'], lib: [['lib'], 'code'], bin: [['bin'], 'code'], fixtures: [['fixtures'], 'tests'], github: [['.github'], 'config'],
  workflows: [['workflows'], 'config'], claude: [['.claude'], 'config'], venv: [['.venv'], 'config'], 'node-modules': [['node_modules'], 'config'],
  cache: [['cache', '__pycache__'], 'config'],
};

test('the folders module draws folder-src and every badged folder of spec 6, each closed then open', () => {
  assert.deepEqual(Object.keys(drawings), ['src', ...Object.keys(FOLDERS)].flatMap((name) => [`folder-${name}`, `folder-${name}-open`]));
});

test('folder-src: the badged folder, then a solid code grimoire 6x7 in the badge box with a real spine slot (spec 6.2)', () => {
  for (const [name, open] of [['folder-src', false], ['folder-src-open', true]]) {
    const [body, tab, badge] = partsOf(drawings[name]());
    assert.deepEqual([body, tab].map(({ role, d }) => ({ role, d })), folderBody({ open, badge: true }), `${name}: the folder construction with the badge box knocked out`);
    assert.equal(badge.role, 'code', `${name}: the badge takes the category of src (code)`);
    assert.deepEqual(pathBounds([badge.d]), { minX: 9, maxX: 15, minY: 8, maxY: 15 }, `${name}: the grimoire, 6x7 at the right of the 7x7 box`);
    const { minX, maxX, minY, maxY } = pathBounds([badge.d]);
    assert.ok(minX >= BADGE_BOX.x && maxX <= BADGE_BOX.x + BADGE_BOX.w && minY >= BADGE_BOX.y && maxY <= BADGE_BOX.y + BADGE_BOX.h, `${name}: inside BADGE_BOX`);
    assert.equal(outlineGap(subpaths(body.d), subpaths(badge.d)), 1, `${name}: one unit from the folder outline`);
    probe([badge.d], [
      [[9.5, 11], true], [[10.5, 8.5], true], [[10.5, 11], false], [[10.5, 13.5], false], [[10.5, 14.5], true], // the spine, the slot x10-11 y9-14 (a hole), its ends
      [[11.5, 11], true], [[14.5, 8.5], true], [[14.5, 14.5], true], [[8.5, 11], false], // the cover, the free column x8-9
    ], name);
  }
});

test('folder-src and folder-src-open differ from the default folders only in the badge corner', () => {
  for (const [name, plain] of [['folder-src', 'folder'], ['folder-src-open', 'folder-open']]) {
    const [badged, base] = [inkOf(drawings[name]()), inkOf(defaults[plain]())];
    const changed = SAMPLES.filter((point) => badged(point) !== base(point));
    assert.deepEqual(changed.filter(([x, y]) => x < BADGE_BOX.x - 1 || y < BADGE_BOX.y - 1).map(String), [], `${name}: unchanged outside the knockout`);
    assert.ok(changed.length >= 100, `${name}: ${changed.length} of 1024 samples differ`);
  }
});

test('map: folder-src serves src and source closed, its -open twin the same names expanded, both in code', () => {
  assert.deepEqual(mapEntry('folder-src'), { category: 'code', folderNames: ['src', 'source'] });
  assert.deepEqual(mapEntry('folder-src-open'), { category: 'code', folderNamesExpanded: ['src', 'source'] });
});

// ---- Gate 6: the folder batch (spec 6's folder table, G42) ----
// Each badge: one solid silhouette in its category, inside BADGE_BOX, at least one unit from the knocked-out folder,
// the same on the closed and the open folder; ink probes away from every edge (the 0.25 grid would land on 45-degree
// edges, so these use quarter offsets checked by hand).
const BADGES = {
  tests: [[[11.5, 8.5], true], [[11.5, 9.5], true], [[9.5, 9.5], false], [[11.5, 13], true], [[8.25, 12.5], false], [[8.5, 14.5], true]], // lip, neck, foot
  docs: [[[9.5, 11], true], [[13.5, 11], true], [[11.5, 12], false], [[11.5, 8.5], false], [[11.5, 14.5], true]], // two pages, the gutter
  scripts: [[[12.5, 10.5], true], [[12.5, 8.5], true], [[9, 14], true], [[14, 14], false], [[9.5, 9.5], false]], // the star, the wand
  assets: [[[11.5, 11.5], true], [[11.5, 8.5], true], [[9.25, 8.75], false], [[13.75, 14.25], false]], // the crystal, pointed at both ends
  dist: [[[11.5, 9], true], [[10.5, 10.5], false], [[11.5, 10.5], true], [[11.5, 13], true], [[8.25, 11.25], false]], // cork, neck, body
  lib: [[[11.5, 9.5], true], [[8.5, 9.5], false], [[11.5, 11.5], false], [[8.5, 13.5], true], [[14.5, 13.5], true]], // two books, the gap
  bin: [[[10, 11.5], true], [[14, 11.5], true], [[14, 9], false], [[14, 14], false]], // the play triangle
  fixtures: [[[11.5, 11.5], false], [[11.5, 10.25], true], [[12.75, 11.5], true], [[8.5, 8.5], false], [[14.5, 14.5], false], [[9, 11], true]], // the card on its corner, the diamond pip hole
  github: [[[8.5, 10.5], true], [[12, 9], true], [[14.5, 14], true], [[12.5, 14], true], [[13.5, 14.5], false], [[11, 14], false], [[14.5, 9], false], [[9, 14], false]], // beak, head, tail, leg, the slot between leg and tail
  workflows: [[[11.5, 11.5], true], [[8.5, 11.5], true], [[11.5, 8.5], true], [[14.5, 11.5], true], [[9.25, 9.25], true], [[13, 10], false], [[10, 13], false], [[8.25, 8.25], false]], // the ring, its cross, a quarter opening, outside
  claude: [[[9.5, 10], true], [[13.5, 10], true], [[9.5, 8.25], true], [[11.5, 9], false], [[11.5, 10.5], false], [[11.5, 13], true], [[8.25, 9], false], [[8.25, 14.75], false]], // ears, tips, valley, head, chin
  venv: [[[11.5, 9.5], true], [[11.5, 8.5], false], [[11.5, 12], true], [[11.5, 14.75], false], [[9.5, 14.5], true]], // rim, bowl, feet
  'node-modules': [[[11.5, 8.5], true], [[11.5, 9.5], true], [[10.5, 8.5], false], [[11.5, 12.5], true], [[8.5, 11.5], true], [[14.5, 13.5], true], [[8.5, 10.5], false], [[8.5, 12.5], false], [[8.5, 14.5], false], [[10.5, 14.5], true], [[9.5, 14.5], false], [[11.05, 10.02], true]], // thread, body, the two leg bars, the notches, the thread's last unit overlapping the body (outside the disc, inside rect(11,8,1,3); pins the gate-6 fix)
  cache: [[[11.5, 9], true], [[8.5, 9], false], [[11.5, 10.5], false], [[8.5, 12], true], [[14.5, 12], true], [[11.5, 14.5], true], [[8.25, 14.75], false]], // the lid over the wide jar, its round corner
};

for (const [name, cases] of Object.entries(BADGES)) {
  const [, category] = FOLDERS[name];
  test(`folder-${name} and folder-${name}-open: the badged folder, then one solid ${category} badge in the badge box, one unit or more from the folder (G42)`, () => {
    for (const [drawing, open] of [[`folder-${name}`, false], [`folder-${name}-open`, true]]) {
      const [body, tab, badge, ...rest] = partsOf(drawings[drawing]());
      assert.deepEqual(rest, [], `${drawing}: three parts`);
      assert.deepEqual([body, tab], folderBody({ open, badge: true }), `${drawing}: the folder construction with the badge box knocked out`);
      assert.equal(badge.role, category, `${drawing}: the badge takes the category of the folder's contents`);
      const { minX, maxX, minY, maxY } = pathBounds([badge.d]);
      assert.ok(minX >= BADGE_BOX.x && maxX <= BADGE_BOX.x + BADGE_BOX.w && minY >= BADGE_BOX.y && maxY <= BADGE_BOX.y + BADGE_BOX.h, `${drawing}: inside BADGE_BOX`);
      assert.ok(outlineGap(subpaths(body.d), subpaths(badge.d)) >= 1, `${drawing}: one unit or more from the folder outline`);
      probe([badge.d], cases, drawing);
    }
    assert.equal(partsOf(drawings[`folder-${name}`]())[2].d, partsOf(drawings[`folder-${name}-open`]())[2].d, 'the same badge closed and open');
  });
}

// Silhouette: the ink of the solid (clockwise) subpaths of the badge alone, holes ignored (spec 6's 16px rule).
const badgeSilhouette = (name) => {
  const solids = subpaths(partsOf(drawings[`folder-${name}`]())[2].d).filter((polygon) => signedArea(polygon) > 0);
  return (point) => solids.some((polygon) => pointInPolygon(point, polygon));
};
test('look-alike badges differ in silhouette: the src grimoire and the lib books, the dist bottle, the cache jar and the tests flask, the tests flask and the fixtures card, the fixtures card and the assets crystal', () => {
  const box = SAMPLES.filter(([x, y]) => x > BADGE_BOX.x && y > BADGE_BOX.y);
  for (const [a, b] of [['src', 'lib'], ['dist', 'cache'], ['tests', 'dist'], ['tests', 'cache'], ['tests', 'fixtures'], ['fixtures', 'assets']]) {
    const [inA, inB] = [badgeSilhouette(a), badgeSilhouette(b)];
    const changed = box.filter((point) => inA(point) !== inB(point)).length;
    assert.ok(changed >= 25, `${a} and ${b}: ${changed} of the badge box's ${box.length} samples differ`);
  }
});

for (const [name, [names, category]] of Object.entries(FOLDERS)) {
  test(`map: folder-${name} serves ${names.join(', ')} closed, its -open twin the same names expanded, in ${category}`, () => {
    assert.deepEqual(mapEntry(`folder-${name}`), { category, folderNames: names });
    assert.deepEqual(mapEntry(`folder-${name}-open`), { category, folderNamesExpanded: names });
  });
}
