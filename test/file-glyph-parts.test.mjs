import test from 'node:test';
import assert from 'node:assert/strict';
import { SVGPathData } from 'svg-pathdata';
import { rect } from '../scripts/glyphs/primitives.mjs';
import { BADGE_BOX, fileIconDocument, folderBody, painted } from '../scripts/file-glyphs/parts.mjs';
import { drawings as productGlyphs } from '../scripts/glyphs/editor.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths, windingProblems } from '../scripts/lib/svg-geometry.mjs';

test('painted joins its path data, nested lists included, under one role', () => {
  assert.deepEqual(painted('muted', rect(1, 1, 2, 2), [rect(4, 4, 2, 2), [rect(8, 8, 2, 2)]]), { role: 'muted', d: 'M1 1L3 1L3 3L1 3ZM4 4L6 4L6 6L4 6ZM8 8L10 8L10 10L8 10Z' });
});

test('fileIconDocument writes one <path> per painted part, in paint order, with the role token as its fill and no other attribute', () => {
  const svg = fileIconDocument(painted('muted', rect(2, 2, 4, 4)), [painted('data', rect(8, 8, 3, 3))]);
  assert.equal(svg, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{muted}" d="M2 2L6 2L6 6L2 6Z"/><path fill="{data}" d="M8 8L11 8L11 11L8 11Z"/></svg>\n');
});

test('fileIconDocument refuses an unknown role, an empty part and a document with no part', () => {
  assert.throws(() => fileIconDocument(painted('gold', rect(1, 1, 2, 2))), /unknown file-icon role gold/i);
  assert.throws(() => fileIconDocument(painted('muted')), /muted part has no path data/);
  assert.throws(() => fileIconDocument(), /at least one painted part/);
});

// ---- Folder construction (Task 3) ----
// Ink is compared on a 0.5 grid offset by 0.25, so no sample lands on an edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.25 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.25 + j / 2]));
const inkOf = (parts) => (point) => filledAt(parts.map((part) => part.d), point);
const differences = (a, b, keep = () => true) => SAMPLES.filter((point) => keep(point) && a(point) !== b(point)).map(String);
const knockedOut = ([x, y]) => x > BADGE_BOX.x - 1 && y > BADGE_BOX.y - 1; // the box and the 1-unit knockout around it
// Slopes of the straight segments (arcs left out), as |dy / dx|; horizontal and vertical segments are skipped.
const slopes = (d) => {
  const found = [];
  let pen = null;
  for (const command of new SVGPathData(d).toAbs().normalizeHVZ().commands) {
    if (command.type === SVGPathData.LINE_TO && pen[0] !== command.x && pen[1] !== command.y) found.push(Math.abs((command.y - pen[1]) / (command.x - pen[0])));
    if ('x' in command) pen = [command.x, command.y];
  }
  return found;
};
const probe = (parts, cases, label) => {
  for (const [point, filled] of cases) assert.equal(inkOf(parts)(point), filled, `${label} ${point}`);
};

test('BADGE_BOX is the 7x7 box at x8-15, y8-15 (spec 6.2)', () => {
  assert.deepEqual(BADGE_BOX, { x: 8, y: 8, w: 7, h: 7 });
  assert.ok(Object.isFrozen(BADGE_BOX));
});

test('folderBody(): a muted body then the filled muted tab, together the product symbol-folder glyph (x1-15, y2-14)', () => {
  const parts = folderBody();
  assert.deepEqual(parts.map((part) => part.role), ['muted', 'muted']);
  assert.deepEqual(differences(inkOf(parts), (point) => filledAt(parseGlyphSvg(productGlyphs.folder()).paths.map((path) => path.d), point)), []);
  assert.deepEqual(pathBounds(parts.map((part) => part.d)), { minX: 1, maxX: 15, minY: 2, maxY: 14 });
  probe([parts[1]], [[[3, 4], true], [[6.5, 3], true], [[7.5, 5], true], [[3, 6.5], false], [[10, 4.5], false]], 'tab');
  probe(parts, [[[10, 4.5], true], [[10, 5.5], false], [[14.5, 9], true], [[13.5, 9], false], [[8, 13.5], true], [[8, 12.5], false], [[1.5, 9], true], [[2.5, 9], false]], 'closed');
});

test('folderBody({ open: true }): the back, a front flap with 2:1 sides 1.5 units across, a real hole in it, the wedge below y10 filled', () => {
  const parts = folderBody({ open: true });
  assert.deepEqual(parts.map((part) => part.role), ['muted', 'muted']);
  assert.deepEqual(parts[1], folderBody()[1], 'the same tab as the closed folder');
  assert.deepEqual(pathBounds(parts.map((part) => part.d)), { minX: 1, maxX: 15, minY: 2, maxY: 14 });
  assert.deepEqual([...new Set(slopes(parts[0].d))], [2], 'every slanted edge of the body is 2:1');
  probe(parts, [
    [[10, 6.5], false], [[10, 8.5], true], [[8, 11], false], [[8, 13.5], true], // above the flap, its top edge, its hole, its bottom
    [[14.25, 8.5], true], [[14.75, 9], false], [[12.25, 11], true], [[13.25, 11], true], [[11.75, 11], false], [[13.75, 11], false], // right side x12-13.5 at y11
    [[4.75, 9.25], true], [[3.5, 9.5], true], [[2.75, 9], false], [[2.5, 11], true], [[1.5, 9], true], // left side, the open wedge above y10, the filled one below
    [[13.5, 6.5], true], [[12.5, 6.5], false], // the back's right wall, x13-14, behind the flap
  ], 'open');
  assert.equal(windingProblems(parts.map((part) => part.d)).length, 0);
});

test('folderBody({ badge: true }) is the same folder with everything within 1 unit of the badge box knocked out, the tab untouched', () => {
  const box = subpaths(rect(BADGE_BOX.x, BADGE_BOX.y, BADGE_BOX.w, BADGE_BOX.h));
  for (const open of [false, true]) {
    const [plain, badged] = [folderBody({ open }), folderBody({ open, badge: true })];
    assert.deepEqual(badged[1], plain[1], `open ${open}: the tab`);
    assert.deepEqual(differences(inkOf(plain), inkOf(badged), (point) => !knockedOut(point)), [], `open ${open}: unchanged outside the knockout`);
    assert.deepEqual(SAMPLES.filter((point) => knockedOut(point) && inkOf(badged)(point)).map(String), [], `open ${open}: nothing inside the knockout`);
    assert.equal(outlineGap(subpaths(badged[0].d), box), 1, `open ${open}: one unit from the box`);
  }
});
