import test from 'node:test';
import assert from 'node:assert/strict';
import { diffPinned, extractRegistrations } from '../scripts/extract-icon-ids.mjs';

// The shape of the minified 1.141 bundle: codicons via fe(id, char|alias), workbench icons via ze(id, default, ...).
const bundle = 'var A={add:fe("add",6e4),files:fe("files",60001),chevronDown:fe("chevron-down",60002),'
  + 'treeItemExpanded:fe("tree-item-expanded","chevron-down"),debugStop:fe("debug-stop",60003)};'
  + 'var x1=ze("explorer-view-icon",A.files,d(1,null)),x2=ze("widget-close",A.add,d(2,null)),'
  + 'x3=ze("debug-stop",A.debugStop,d(3,null)),x4=ze("chained-icon",x1,d(4,null));';

test('extracts codicons, aliases and registered defaults', () => {
  const ids = extractRegistrations(bundle);
  assert.deepEqual(ids.get('explorer-view-icon'), { kind: 'registered', default: 'files' });
  assert.deepEqual(ids.get('tree-item-expanded'), { kind: 'alias', default: 'chevron-down' });
  assert.deepEqual(ids.get('add'), { kind: 'codicon', default: null });
  assert.deepEqual(ids.get('chained-icon'), { kind: 'registered', default: 'explorer-view-icon' });
});

test('first registration wins: a workbench ID that is also a codicon stays a codicon', () => {
  assert.deepEqual(extractRegistrations(bundle).get('debug-stop'), { kind: 'codicon', default: null });
});

test('diffPinned reports missing, changed and unpinned IDs', () => {
  const pinned = { ids: {
    'explorer-view-icon': { kind: 'registered', default: 'files' },
    'widget-close': { kind: 'registered', default: 'close' },
    'gone-icon': { kind: 'codicon', default: null },
  } };
  const { missing, changed, unpinned } = diffPinned(pinned, extractRegistrations(bundle));
  assert.deepEqual(missing, ['gone-icon']);
  assert.deepEqual(changed.map((c) => c.id), ['widget-close']);
  assert.ok(unpinned.includes('add'));
});

test('throws a clear error on an unrecognised bundle', () => {
  assert.throws(() => extractRegistrations('nothing here'), /Could not locate/);
});
