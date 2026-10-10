import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings as batchOne } from '../scripts/glyphs/batch-1.mjs';
import { drawings } from '../scripts/glyphs/debug.mjs';
import { disc, polygon, svgDocument } from '../scripts/glyphs/primitives.mjs';
import { drawings as status } from '../scripts/glyphs/status.mjs';
import { filledAt, outlineGap as gap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers for Tasks 6-9 (the same measures as test/status-glyphs.test.mjs; clearances with outlineGap).
const pathsOf = (svg) => parseGlyphSvg(svg).paths.map((path) => path.d);
const box = (ds) => Object.fromEntries(Object.entries(pathBounds(ds)).map(([key, value]) => [key, Number(value.toFixed(2))]));
const bounds = (svg) => box(pathsOf(svg));
const outlinesOf = (svg) => subpaths(pathsOf(svg).join(''));
const keys = (polygons) => polygons.map((poly) => JSON.stringify(poly));
const inkAt = (name, point, all = drawings) => filledAt(pathsOf(all[name]()), point);
const polar = (r, degrees) => [8 + r * Math.cos((degrees * Math.PI) / 180), 8 + r * Math.sin((degrees * Math.PI) / 180)];

// ---- Breakpoints (Task 6) ----
test('every breakpoint glyph sits on the Codicon footprint, 4-12 about (8,8); the log diamond on 3-13', () => {
  const footprint = { minX: 4, maxX: 12, minY: 4, maxY: 12 };
  assert.deepEqual(bounds(batchOne['moon-breakpoint']()), footprint);
  assert.deepEqual(bounds(drawings['moon-outline']()), footprint);
  assert.deepEqual(bounds(drawings['moon-equals']()), footprint);
  const dashed = bounds(drawings['dashed-ring']());
  assert.deepEqual([dashed.minY, dashed.maxY], [4, 12]);
  assert.ok(dashed.minX >= 4 && dashed.maxX <= 12 && dashed.minX + dashed.maxX === 16, JSON.stringify(dashed));
  assert.deepEqual(bounds(drawings.diamond()), { minX: 3, maxX: 13, minY: 3, maxY: 13 });
});

test('the moons are built from the live moon breakpoint, not from a copy of its numbers', () => {
  const [moon] = subpaths(pathsOf(batchOne['moon-breakpoint']())[0]);
  for (const name of ['moon-outline', 'moon-equals']) assert.deepEqual(outlinesOf(drawings[name]())[0], moon, name);
  // Swap in a larger moon for a moment: every debug moon must follow it, the outline's hole and the dashes included.
  const original = batchOne['moon-breakpoint'];
  batchOne['moon-breakpoint'] = () => svgDocument(disc(8, 8, 5));
  try {
    const [swapped] = subpaths(disc(8, 8, 5));
    for (const name of ['moon-outline', 'moon-equals']) assert.deepEqual(outlinesOf(drawings[name]())[0], swapped, name);
    assert.equal(inkAt('moon-outline', [8, 3.5]), true, 'a 1-unit ring at the new radius');
    assert.equal(inkAt('moon-outline', [8, 4.5]), false, 'the hole follows the new radius');
    assert.equal(inkAt('dashed-ring', [8, 3.5]), true, 'the top dash sits on the new ring');
    assert.equal(inkAt('dashed-ring', [8, 4.5]), false);
  } finally {
    batchOne['moon-breakpoint'] = original;
  }
});

test('breakpoint holes and dashes are real under the font fill rule', () => {
  // moon-outline: a 1-unit ring; moon-equals: two slots with 2 units of moon between them.
  assert.equal(inkAt('moon-outline', [8, 8]), false);
  assert.equal(inkAt('moon-outline', [8, 4.5]), true);
  for (const point of [[8, 6.5], [8, 9.5]]) assert.equal(inkAt('moon-equals', point), false, `= slot at ${point}`);
  for (const point of [[8, 8], [8, 4.7], [8, 11.3], [5, 8]]) assert.equal(inkAt('moon-equals', point), true, `moon at ${point}`);
  // dashed-ring: ink in the middle of each dash, nothing in the middle of each gap or inside the ring.
  for (let degrees = 30; degrees < 360; degrees += 60) {
    assert.equal(inkAt('dashed-ring', polar(3.5, degrees)), true, `dash at ${degrees}`);
    assert.equal(inkAt('dashed-ring', polar(3.5, degrees + 30)), false, `gap at ${degrees + 30}`);
  }
  assert.equal(inkAt('dashed-ring', [8, 8]), false);
});

test('unverified and disabled differ where it shows: the dashed ring has gaps where the ring is solid', () => {
  for (const degrees of [0, 60, 120, 180, 240, 300]) {
    assert.equal(inkAt('moon-outline', polar(3.5, degrees)), true);
    assert.equal(inkAt('dashed-ring', polar(3.5, degrees)), false);
  }
});

// ---- Stack frames and steps (Task 7) ----
test('debug-stackframe-dot is a 4x4 moon dot at 6-10, and the focused frame holds exactly that dot', () => {
  assert.deepEqual(bounds(drawings['moon-dot']()), { minX: 6, maxX: 10, minY: 6, maxY: 10 });
  // The overlay case (frame glyph plus the CSS ::after dot) and the focused frame must be the same picture.
  const overlay = [...outlinesOf(drawings['stackframe-arrow']()), ...outlinesOf(drawings['moon-dot']())];
  assert.deepEqual(keys(outlinesOf(drawings['stackframe-moon']())).sort(), keys(overlay).sort());
});

test('the stack frame keeps the overlay area clear by 1 unit and fills its tip', () => {
  const frame = outlinesOf(drawings['stackframe-arrow']());
  const clearance = gap(subpaths(disc(8, 8, 2)), frame);
  assert.ok(clearance >= 1 - 1e-9, `clearance ${clearance}`);
  for (const point of [[8, 8], [6.2, 8], [9.8, 8], [8, 6.2], [8, 9.8]]) assert.equal(inkAt('stackframe-arrow', point), false, `${point}`);
  for (const point of [[12, 8], [14, 8], [2.5, 8], [6, 3.5], [6, 12.5]]) assert.equal(inkAt('stackframe-arrow', point), true, `${point}`);
});

test('each step arrow lands on a 3x3 moon on pixel column 7, 1 unit or more clear of the arrow', () => {
  const moon = subpaths(disc(7.5, 12.5, 1.5));
  assert.deepEqual(box([disc(7.5, 12.5, 1.5)]), { minX: 6, maxX: 9, minY: 11, maxY: 14 });
  for (const name of ['step-over', 'step-into', 'step-out']) {
    const all = outlinesOf(drawings[name]());
    assert.ok(keys(all).includes(keys(moon)[0]), `${name} has the moon`);
    const arrow = all.filter((poly) => !keys(moon).includes(JSON.stringify(poly)));
    const clearance = gap(moon, arrow);
    assert.ok(clearance >= 1 - 1e-9, `${name} clearance ${clearance}`);
  }
  // Stems on column 7 (x7-8); step-into points down to the moon, step-out points up away from it.
  for (const [name, y] of [['step-into', 2], ['step-out', 9]]) {
    assert.equal(inkAt(name, [7.5, y]), true, `${name} stem`);
    for (const x of [6.5, 8.5]) assert.equal(inkAt(name, [x, y]), false, `${name} beside the stem`);
  }
  assert.equal(inkAt('step-into', [5.5, 6.5]), true, 'step-into head is wide at the top');
  assert.equal(inkAt('step-into', [5.5, 4.5]), false);
  assert.equal(inkAt('step-out', [5.5, 4.5]), true, 'step-out head is wide at the bottom');
  assert.equal(inkAt('step-out', [5.5, 6.5]), false);
  // The stem shows for 5 units, so the arrow over the moon never reads as '!' (a wedge straight over a dot).
  for (const [name, y] of [['step-into', 5], ['step-out', 6]]) {
    assert.equal(inkAt(name, [7.5, y]), true, `${name}: stem at y${y}`);
    assert.equal(inkAt(name, [6.5, y]), false, `${name}: no head at y${y}`);
  }
  // step-over: a band over the moon (open below) and a head below its right leg.
  assert.equal(inkAt('step-over', [7.5, 4.5]), true);
  assert.equal(inkAt('step-over', [7.5, 8]), false);
  assert.equal(inkAt('step-over', [11.5, 10]), true);
});

// ---- Run, test and debug toolbar (Task 8) ----
const play = [[4, 2], [13, 8], [4, 14]];
const shifted = (dx) => subpaths(polygon(play.map(([x, y]) => [x + dx, y])))[0];

test('every run glyph uses one play triangle: debug-start filled, run outlined with a real hole', () => {
  assert.deepEqual(outlinesOf(drawings['play-filled']()), [shifted(0)]);
  assert.deepEqual(outlinesOf(drawings['play-outline']())[0], shifted(0));
  assert.deepEqual(bounds(drawings['play-outline']()), bounds(drawings['play-filled']()));
  assert.equal(inkAt('play-filled', [7, 8]), true);
  assert.equal(inkAt('play-outline', [7, 8]), false);
  assert.equal(inkAt('play-outline', [4.5, 8]), true);
});

test('run-all: the front triangle is the play triangle, filled; the one behind shows as a chevron 1 unit clear', () => {
  const [front, ...behind] = outlinesOf(drawings['play-stacked']());
  assert.deepEqual(front, shifted(-3));
  assert.ok(behind.length > 0, 'the chevron exists');
  const clearance = gap([front], behind);
  assert.ok(clearance >= 1 - 1e-9, `clearance ${clearance}`);
  assert.equal(inkAt('play-stacked', [14, 8]), true, 'the chevron tip');
  assert.equal(inkAt('play-stacked', [11, 8]), false, 'between the front tip and the chevron');
});

test('continue is a bar and the play triangle; pause and stop are solid and centred on (8,8)', () => {
  assert.ok(keys(outlinesOf(drawings.continue())).includes(JSON.stringify(shifted(2))));
  assert.equal(inkAt('continue', [3, 8]), true);
  assert.equal(inkAt('continue', [5, 8]), false);
  assert.deepEqual(bounds(drawings.pause()), { minX: 3, maxX: 13, minY: 2, maxY: 14 });
  for (const point of [[4.5, 8], [11.5, 8]]) assert.equal(inkAt('pause', point), true);
  assert.equal(inkAt('pause', [8, 8]), false);
  assert.deepEqual(bounds(drawings['stop-square']()), { minX: 3, maxX: 13, minY: 3, maxY: 13 });
});

// Arrowheads are the triangular outlines; half-turn asymmetry is the share of ink whose 180-degree image is empty.
const heads = (svg) => outlinesOf(svg).filter((poly) => poly.length === 3).length;
const halfTurnMiss = (svg, [cx, cy]) => {
  const paths = pathsOf(svg);
  let ink = 0;
  let miss = 0;
  for (let x = 0.125; x < 16; x += 0.25) {
    for (let y = 0.125; y < 16; y += 0.25) {
      if (!filledAt(paths, [x, y])) continue;
      ink += 1;
      if (!filledAt(paths, [2 * cx - x, 2 * cy - y])) miss += 1;
    }
  }
  return miss / ink;
};

test('restart is one arrow, open at the upper left, never the half-turn-symmetric sync', () => {
  assert.equal(heads(drawings.restart()), 1, 'restart has one arrowhead');
  assert.equal(heads(status['sync-arrows']()), 2, 'sync has two');
  assert.equal(outlinesOf(drawings.restart()).length, 2, 'one band and one head');
  assert.equal(inkAt('restart', [11.18, 12.18]), true, 'band at the lower right');
  assert.equal(inkAt('restart', [4.82, 5.82]), false, 'gap at the upper left');
  // About its own band centre (8,9), over a third of restart's ink has no ink at its 180-degree image; sync, turned about
  // (8,8), maps onto itself, so the measure tells the two apart.
  assert.ok(halfTurnMiss(drawings.restart(), [8, 9]) > 0.2, `restart miss ${halfTurnMiss(drawings.restart(), [8, 9])}`);
  assert.ok(halfTurnMiss(status['sync-arrows'](), [8, 8]) < 0.02, `sync miss ${halfTurnMiss(status['sync-arrows'](), [8, 8])}`);
});

// ---- Test result (Task 9) ----
test('testing-passed is a disc on the skull footprint with the check cut out as a real hole', () => {
  assert.deepEqual(bounds(drawings['check-disc']()), bounds(batchOne.skull()));
  for (const point of [[6, 8.5], [10, 6.5], [7, 10]]) assert.equal(inkAt('check-disc', point), false, `check at ${point}`);
  for (const point of [[8, 3], [4, 11], [10, 10.5], [3, 8]]) assert.equal(inkAt('check-disc', point), true, `disc at ${point}`);
});
