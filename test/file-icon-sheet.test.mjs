import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { disc, rect } from '../scripts/glyphs/primitives.mjs';
import { ROLES } from '../scripts/lib/file-icon-palette.mjs';
import { THEME_SETS, themeBackdrops } from '../scripts/lib/file-icon-backdrops.mjs';
import { fileIconSheet } from '../scripts/lib/file-icon-sheet.mjs';
import { coverage } from '../scripts/lib/supersample.mjs';

const root = path.resolve(import.meta.dirname, '..');
const round = (values) => values.map((value) => Number(value.toFixed(3)));

test('the 32x reference: a whole-unit square covers its pixels fully, a half-unit offset covers half of each pixel it straddles', () => {
  const crisp = coverage([rect(2, 2, 1, 1)], 16);
  assert.equal(crisp[2 * 16 + 2], 1);
  assert.equal(crisp.reduce((sum, value) => sum + value, 0), 1);
  const straddling = round(coverage([rect(2.5, 2, 1, 1)], 16));
  assert.deepEqual([straddling[2 * 16 + 2], straddling[2 * 16 + 3]], [0.5, 0.5]);
  assert.deepEqual(round(coverage([rect(2.5, 2, 1, 1)], 32)).slice(4 * 32 + 4, 4 * 32 + 8), [0, 1, 1, 0], 'at 2x the same square is crisp');
});

test('the 32x reference fills with nonzero winding: a counter-wound hole is empty, a same-wound inner square stays ink', () => {
  const hole = coverage([rect(2, 2, 12, 12), rect(4, 4, 8, 8, 'ccw')], 16);
  const solid = coverage([rect(2, 2, 12, 12), rect(4, 4, 8, 8)], 16);
  assert.deepEqual([hole[8 * 16 + 8], solid[8 * 16 + 8], hole[2 * 16 + 2]], [0, 1, 1]);
  const area = coverage([disc(8, 8, 4)], 16).reduce((sum, value) => sum + value, 0);
  assert.ok(Math.abs(area - Math.PI * 16) < 0.1, `a radius-4 disc covers ${area.toFixed(3)} pixels (arcs are flattened, 50.199 of 16π)`);
});

test('backdrops: the sidebar, the active selection and the quick-input focus of each color theme, with VS Code\'s fallbacks', () => {
  assert.deepEqual(THEME_SETS, { 'vs-dark': 'dark', vs: 'light', 'hc-black': 'highContrast' });
  assert.deepEqual(themeBackdrops({ 'sideBar.background': '#120C1F', 'list.activeSelectionBackground': '#633B79' }), { sidebar: '#120C1F', selection: '#633B79', quickInputFocus: '#633B79' });
  assert.deepEqual(themeBackdrops({ 'sideBar.background': '#000000', 'list.activeSelectionBackground': '#FF67B7', 'quickInputList.focusBackground': '#FFFFFF80' }), { sidebar: '#000000', selection: '#FF67B7', quickInputFocus: '#808080' });
  assert.deepEqual(themeBackdrops({ 'sideBar.background': '#F8F0FB', 'list.activeSelectionBackground': '#E9B5D899' }), { sidebar: '#F8F0FB', selection: '#EFCDE6', quickInputFocus: '#EFCDE6' });
});

test('the sheet shows every drawing in each theme\'s set at 16 and 32px on three backdrops, parchment in all eight roles, a grayscale copy and the reference', () => {
  const { html, files } = fileIconSheet({ root });
  const themes = ['WitchyNibbles Moonlit Candle', 'WitchyNibbles Moonlit', 'WitchyNibbles Daydream', 'WitchyNibbles Coven Contrast'];
  for (const label of themes) assert.ok(html.includes(label), label);
  for (const drawing of ['parchment', 'folder', 'folder-open']) {
    for (const set of ['dark', 'light', 'high-contrast']) assert.ok(`svg/${set}/${drawing}.svg` in files, `${set}/${drawing}`);
  }
  for (const role of ROLES) assert.ok(`svg/dark/role-${role}.svg` in files && html.includes(`parchment as ${role}`), role);
  assert.match(files['svg/light/role-style.svg'], /fill="#B52776"/);
  assert.equal(html.match(/class="sheet( gray)?"/g).length, 2, 'the colour sheet and its grayscale copy');
  assert.match(html, /\.gray\{filter:grayscale\(1\)\}/);
  assert.match(html, /id="reference"/);
});
