import test from 'node:test';
import assert from 'node:assert/strict';
import pinned from '../icons/product-icon-ids.json' with { type: 'json' };

const entries = Object.entries(pinned.ids);
const BATCHES = ['1', 'chrome', 'panel', 'status', 'debug', 'editor', 'symbols'];

test('132 core IDs plus 38 named extras', () => {
  assert.equal(entries.filter(([, e]) => e.tier === 'core').length, 132);
  assert.equal(entries.filter(([, e]) => e.tier === 'extra').length, 38);
  assert.equal(entries.length, 170);
});

test('the keys added by author decisions 4, 5 and 7 sit in their batches', () => {
  for (const id of ['debug-breakpoint-unverified', 'debug-breakpoint-conditional-disabled', 'debug-breakpoint-log-disabled', 'debug-breakpoint-conditional-unverified']) assert.equal(pinned.ids[id]?.batch, 'debug', id);
  for (const id of ['copilot-warning', 'copilot-snooze', 'copilot-dot']) assert.equal(pinned.ids[id]?.batch, 'status', id);
  for (const id of ['panel-right', 'panel-right-off', 'auxiliarybar-left-layout-icon', 'auxiliarybar-left-off-layout-icon', 'panel-bottom']) assert.equal(pinned.ids[id]?.batch, 'editor', id);
});

test('the keys added at gate 1 (G4-G6) sit in their batches with the kind and default the 1.141 bundle registers', () => {
  const expected = {
    'gutter-lightbulb-sparkle': { kind: 'registered', default: 'lightbulb-sparkle', batch: '1' },
    'gutter-lightbulb-auto-fix': { kind: 'registered', default: 'lightbulb-autofix', batch: '1' },
    'gutter-lightbulb-aifix-auto-fix': { kind: 'registered', default: 'lightbulb-sparkle-autofix', batch: '1' },
    'lightbulb-sparkle': { kind: 'codicon', default: null, batch: '1' },
    'lightbulb-autofix': { kind: 'codicon', default: null, batch: '1' },
    'lightbulb-sparkle-autofix': { kind: 'codicon', default: null, batch: '1' },
    'git-branch-changes': { kind: 'codicon', default: null, batch: 'status' },
    'git-branch-staged-changes': { kind: 'codicon', default: null, batch: 'status' },
    'git-branch-conflicts': { kind: 'codicon', default: null, batch: 'status' },
    'ports-forwarded-with-process-icon': { kind: 'registered', default: 'circle-filled', batch: 'status' },
  };
  for (const [id, entry] of Object.entries(expected)) assert.deepEqual(pinned.ids[id], { tier: 'extra', ...entry }, id);
  assert.equal('gutter-lightbulb-sparkle-filled' in pinned.ids, false, 'the all-AI gutter mark stays unpinned until gate 4 (spec 11.2, G11)');
});

test('every key has a known batch and kind', () => {
  for (const [id, entry] of entries) {
    assert.ok(BATCHES.includes(entry.batch), `${id} batch ${entry.batch}`);
    assert.ok(['codicon', 'alias', 'registered'].includes(entry.kind), `${id} kind ${entry.kind}`);
  }
});

test('batch 1 is exactly the 54 IDs behind the 23 first-batch drawings', () => {
  // 48 at gate 1, plus the six light-bulb IDs the candle claims (G5): three gutter IDs and the three inline codicons.
  assert.equal(entries.filter(([, e]) => e.batch === '1').length, 54);
});

test('alias IDs that do not inherit are pinned as their own keys', () => {
  for (const id of ['tree-item-expanded', 'toolbar-more', 'menu-submenu', 'quick-input-back', 'dialog-close', 'dialog-error', 'dialog-info', 'dialog-warning', 'plus', 'more']) {
    assert.ok(id in pinned.ids, id);
  }
  assert.equal(pinned.ids['tree-item-expanded'].kind, 'alias');
});

test('IDs that inherit circle-filled are pinned so release forces their own glyphs', () => {
  // In the 1.141 bundle this ID is both a codicon (same glyph 60017 as circle-filled) and a registerIcon call
  // defaulting to circle-filled; the codicon registration comes first, so it is pinned as a codicon.
  assert.equal(pinned.ids['terminal-decoration-success'].kind, 'codicon');
  assert.equal(pinned.ids['terminal-decoration-success'].batch, 'status');
});

test('dropped 1.2.1 keys, including the legacy layout keys (decision 7), are not pinned', () => {
  for (const id of ['home', 'activity-bar-left', 'activity-bar-right', 'menu', 'copy', 'edit', 'save', 'file', 'folder', 'layout-sidebar-left', 'layout-sidebar-right', 'layout-panel']) {
    assert.equal(id in pinned.ids, false, id);
  }
});
