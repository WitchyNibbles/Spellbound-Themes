import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { contrast } from '../src/color.mjs';
import { SIDEBARS } from '../scripts/lib/file-icon-requirements.mjs';
import { PALETTE, ROLES, SETS, SET_DIRS, resolveSource } from '../scripts/lib/file-icon-palette.mjs';

const themeColours = (file) => JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '..', 'themes', file), 'utf8')).colors;

test('eight roles and three sets, frozen; the highContrast set is written to high-contrast/', () => {
  assert.deepEqual(ROLES, ['code', 'data', 'style', 'tests', 'config', 'docs', 'assets', 'muted']);
  assert.deepEqual(SETS, ['dark', 'light', 'highContrast']);
  assert.deepEqual(SET_DIRS, { dark: 'dark', light: 'light', highContrast: 'high-contrast' });
  for (const value of [ROLES, SETS, SET_DIRS, PALETTE, ...Object.values(PALETTE)]) assert.ok(Object.isFrozen(value));
});

test('the palette is the table of spec section 6, with the assets blues of F8 and muted on the config values', () => {
  assert.deepEqual(PALETTE, {
    dark: { code: '#B99AFF', data: '#FFD477', style: '#FF67B7', tests: '#74E8B8', config: '#A99AB9', docs: '#F3EAF7', assets: '#77D9FF', muted: '#A99AB9' },
    light: { code: '#7042B2', data: '#8A4D00', style: '#B52776', tests: '#0E7553', config: '#735F7D', docs: '#3B2A47', assets: '#176B9A', muted: '#735F7D' },
    highContrast: { code: '#D0B8FF', data: '#FFE38A', style: '#FF67B7', tests: '#74E8B8', config: '#A99AB9', docs: '#FFFFFF', assets: '#77D9FF', muted: '#A99AB9' },
  });
  for (const set of SETS) assert.deepEqual(Object.keys(PALETTE[set]), ROLES, set);
});

test('F8: assets is each theme\'s blue role (charts.blue of Moonlit Candle, Daydream and Coven Contrast)', () => {
  assert.equal(PALETTE.dark.assets, themeColours('WitchyNibbles-color-theme-moonlit-candle.json')['charts.blue']);
  assert.equal(PALETTE.light.assets, themeColours('WitchyNibbles-color-theme-light.json')['charts.blue']);
  assert.equal(PALETTE.highContrast.assets, themeColours('WitchyNibbles-color-theme-high-contrast.json')['charts.blue']);
});

test('every palette colour reaches 3:1 on its set\'s sidebar (spec section 6)', () => {
  const low = [];
  for (const set of SETS) {
    for (const [role, hex] of Object.entries(PALETTE[set])) {
      const ratio = contrast(hex, SIDEBARS[set]);
      if (ratio < 3) low.push(`${set} ${role} ${hex} ${ratio.toFixed(2)}:1`);
    }
  }
  assert.deepEqual(low, []);
  const weakest = Math.min(...SETS.flatMap((set) => Object.values(PALETTE[set]).map((hex) => contrast(hex, SIDEBARS[set]))));
  assert.ok(weakest >= 3, `weakest ${weakest.toFixed(2)}:1`);
});

test('resolveSource puts the set\'s hex in place of every role token and throws on an unknown role', () => {
  const source = '<svg viewBox="0 0 16 16"><path fill="{muted}" d="M0 0Z"/><path fill="{data}" d="M1 1Z"/><path fill="{muted}" d="M2 2Z"/></svg>';
  assert.equal(resolveSource(source, 'light'), '<svg viewBox="0 0 16 16"><path fill="#735F7D" d="M0 0Z"/><path fill="#8A4D00" d="M1 1Z"/><path fill="#735F7D" d="M2 2Z"/></svg>');
  assert.equal(resolveSource(source, 'highContrast').includes('{'), false);
  assert.throws(() => resolveSource('<path fill="{gold}"/>', 'dark'), /unknown file-icon role \{gold\}/i);
  assert.throws(() => resolveSource('<path fill="{muted}"/>', 'sepia'), /unknown file-icon set sepia/i);
});
