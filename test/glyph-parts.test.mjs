import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings, parts } from '../scripts/glyphs/batch-1.mjs';
import { frame, rect, svgDocument } from '../scripts/glyphs/primitives.mjs';
import { filledAt } from '../scripts/lib/svg-geometry.mjs';

test('batch-1 exposes the shared parts that the status batch builds on', () => {
  for (const name of ['bell', 'catHeadOutline', 'catEyes', 'sprigSmall', 'star']) assert.equal(typeof parts[name], 'function', name);
  for (const name of ['bell', 'catHeadOutline', 'catEyes', 'sprigSmall']) {
    const paths = parts[name]();
    assert.ok(Array.isArray(paths) && paths.length > 0 && paths.every((d) => typeof d === 'string' && d.startsWith('M')), name);
  }
  assert.equal(parts.catEyes().length, 2, 'catEyes() is [left, right]');
});

test('each drawing that uses a part is exactly that part', () => {
  assert.equal(drawings['dirty-star'](), svgDocument(parts.star(8, 8, 5, 1.5)));
  assert.equal(drawings.bell(), svgDocument(parts.bell()));
  assert.equal(drawings['sprig-small'](), svgDocument(parts.sprigSmall()));
  assert.equal(drawings['cat-head'](), svgDocument(parts.catHeadOutline(), parts.catEyes()));
});

test('parts.star is the four-point ✦: tips at outer, waist at inner, centred on (cx, cy)', () => {
  assert.equal(parts.star(8, 8, 5, 1.5), 'M8 3L9.5 6.5L13 8L9.5 9.5L8 13L6.5 9.5L3 8L6.5 6.5Z');
  assert.equal(parts.star(12, 4, 3, 1), 'M12 1L13 3L15 4L13 5L12 7L11 5L9 4L11 3Z');
});

test('parts.bell leaves the top-right corner (x10-15, y1-6) empty for the bell-dot ✦', () => {
  const bell = parts.bell();
  for (let x = 10.25; x < 15; x += 0.25) for (let y = 1.25; y < 6; y += 0.25) assert.ok(!filledAt(bell, [x, y]), `${x},${y}`);
});

test('parts.flame is the candle flame, unchanged', () => {
  assert.equal(drawings.candle(), svgDocument(frame(6, 9, 4, 6, { r: 0 }), rect(7, 8, 2, 1), parts.flame(8, 1, 7, 2)));
});
