import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/data.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

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

test('the data module draws keyring', () => {
  assert.deepEqual(Object.keys(drawings), ['keyring']);
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
