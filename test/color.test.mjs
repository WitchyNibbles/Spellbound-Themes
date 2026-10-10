import test from 'node:test';
import assert from 'node:assert/strict';
import { compositedContrast, contrast, hexes, isGreenAccent } from '../src/color.mjs';

test('contrast matches WCAG reference values', () => {
  assert.equal(contrast('#FFFFFF', '#000000'), 21);
  assert.equal(contrast('#0E7553', '#FFF9FD').toFixed(2), '5.48');
  assert.equal(contrast('#6E5A80', '#0D0916').toFixed(2), '3.22');
});

test('alpha colours are composited over the surface before measuring', () => {
  assert.ok(compositedContrast('#F8F2FF', '#633B79AA', '#0D0916') > 4.5);
});

test('green detection: mint is green, cyan and gold are not', () => {
  assert.equal(isGreenAccent('#74E8B8'), true);
  assert.equal(isGreenAccent('#0E7553'), true);
  assert.equal(isGreenAccent('#74D7E8'), false);
  assert.equal(isGreenAccent('#FFD477'), false);
});

test('hexes finds 6- and 8-digit colours', () => {
  assert.deepEqual(hexes('a #12ABef b #633B79AA'), ['#12ABef', '#633B79AA']);
});
