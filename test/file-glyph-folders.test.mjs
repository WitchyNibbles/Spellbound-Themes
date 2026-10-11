import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/folders.mjs';
import { drawings as defaults } from '../scripts/file-glyphs/defaults.mjs';
import { BADGE_BOX, folderBody } from '../scripts/file-glyphs/parts.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by 0.25, so no sample lands on an edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.25 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.25 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const inkOf = (svg) => (point) => filledAt(partsOf(svg).map((part) => part.d), point);
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

test('the folders module draws folder-src and folder-src-open', () => {
  assert.deepEqual(Object.keys(drawings), ['folder-src', 'folder-src-open']);
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
