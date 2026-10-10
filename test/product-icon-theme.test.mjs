import test from 'node:test';
import assert from 'node:assert/strict';
import pinned from '../icons/product-icon-ids.json' with { type: 'json' };
import theme from '../icons/product-icon-theme.json' with { type: 'json' };
import map from '../icons/product-icon-map.json' with { type: 'json' };
import { glyphModules } from '../scripts/glyphs/index.mjs';

const batchOne = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === '1').map(([id]) => id);

test('every batch-1 ID is mapped by its own key, aliases included', () => {
  for (const id of batchOne) assert.ok(id in theme.iconDefinitions, id);
  for (const alias of ['tree-item-expanded', 'menu-submenu', 'dialog-close', 'dialog-error']) assert.ok(alias in theme.iconDefinitions, alias);
});

test('the map holds exactly the generated drawings, no legacy drawings, no IDs outside the pinned list', () => {
  const generated = glyphModules.flatMap(({ drawings }) => Object.keys(drawings));
  assert.deepEqual(Object.keys(map.drawings).sort(), generated.sort());
  assert.equal(Object.values(map.drawings).some((drawing) => drawing.legacy), false);
  for (const id of Object.keys(theme.iconDefinitions)) assert.ok(id in pinned.ids, `${id} is not pinned`);
});

test('the candle carries every code-action light bulb, in the gutter and inline (G5)', () => {
  assert.deepEqual(map.drawings.candle.ids, ['light-bulb', 'gutter-lightbulb', 'gutter-lightbulb-sparkle', 'gutter-lightbulb-auto-fix',
    'gutter-lightbulb-aifix-auto-fix', 'lightbulb-sparkle', 'lightbulb-autofix', 'lightbulb-sparkle-autofix']);
  assert.equal(map.drawings.candle.codepoint, 'E112');
});

test('every chrome-batch ID is mapped by its own key, aliases included', () => {
  const chrome = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'chrome').map(([id]) => id);
  assert.equal(chrome.length, 17);
  for (const id of chrome) assert.ok(id in theme.iconDefinitions, id);
});

test('every status-batch ID is mapped; the aliases and the ports dot share their drawings', () => {
  const status = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'status').map(([id]) => id);
  assert.equal(status.length, 19);
  for (const id of status) assert.ok(id in theme.iconDefinitions, id);
  const glyph = (id) => theme.iconDefinitions[id].fontCharacter;
  assert.equal(glyph('dialog-warning'), glyph('warning'));
  assert.equal(glyph('dialog-info'), glyph('info'));
  assert.equal(glyph('ports-forwarded-with-process-icon'), glyph('terminal-decoration-success'));
});
