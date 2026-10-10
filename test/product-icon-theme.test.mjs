import test from 'node:test';
import assert from 'node:assert/strict';
import pinned from '../icons/product-icon-ids.json' with { type: 'json' };
import theme from '../icons/product-icon-theme.json' with { type: 'json' };
import map from '../icons/product-icon-map.json' with { type: 'json' };

const batchOne = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === '1').map(([id]) => id);

test('every batch-1 ID is mapped by its own key, aliases included', () => {
  for (const id of batchOne) assert.ok(id in theme.iconDefinitions, id);
  for (const alias of ['tree-item-expanded', 'menu-submenu', 'dialog-close', 'dialog-error']) assert.ok(alias in theme.iconDefinitions, alias);
});

test('23 drawings, no legacy drawings, no IDs outside the pinned list', () => {
  assert.equal(Object.keys(map.drawings).length, 23);
  assert.equal(Object.values(map.drawings).some((drawing) => drawing.legacy), false);
  for (const id of Object.keys(theme.iconDefinitions)) assert.ok(id in pinned.ids, `${id} is not pinned`);
});
