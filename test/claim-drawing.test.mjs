import test from 'node:test';
import assert from 'node:assert/strict';
import { claimDrawing, dropLegacy } from '../scripts/lib/product-icon-map.mjs';

const base = () => ({
  fontId: 'witchynibbles-product-icons', fontFamily: 'WitchyNibbles Product Icons', retiredCodepoints: ['E01B'],
  drawings: {
    'legacy-close': { codepoint: 'E00C', ids: ['close'], legacy: true },
    'legacy-check': { codepoint: 'E00D', ids: ['check'], legacy: true },
  },
});

test('claiming IDs takes them from other drawings and retires emptied ones', () => {
  const { map, removed } = claimDrawing(base(), { name: 'close', codepoint: 'E10F', ids: ['close', 'widget-close'] });
  assert.deepEqual(removed, ['legacy-close']);
  assert.deepEqual(map.drawings.close, { codepoint: 'E10F', ids: ['close', 'widget-close'] });
  assert.ok('legacy-check' in map.drawings);
  assert.deepEqual(map.retiredCodepoints, ['E00C', 'E01B']);
});

test('dropLegacy removes every legacy drawing and retires its codepoint', () => {
  const { map, removed } = dropLegacy(claimDrawing(base(), { name: 'close', codepoint: 'E10F', ids: ['close'] }).map);
  assert.deepEqual(removed, ['legacy-check']);
  assert.deepEqual(Object.keys(map.drawings), ['close']);
  assert.ok(map.retiredCodepoints.includes('E00D'));
});
