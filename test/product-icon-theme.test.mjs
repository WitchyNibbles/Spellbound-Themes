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

test('each dirty-branch ID maps to its own sprig drawing in the map', () => {
  const drawingOf = (id) => Object.entries(map.drawings).find(([, { ids }]) => ids.includes(id))?.[0];
  assert.deepEqual(['git-branch-changes', 'git-branch-staged-changes', 'git-branch-conflicts'].map(drawingOf),
    ['sprig-changes', 'sprig-staged', 'sprig-conflicts']);
});

test('every panel-batch ID maps to its own drawing and codepoint', () => {
  const panel = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'panel').map(([id]) => id).sort();
  const drawingOf = (id) => Object.entries(map.drawings).find(([, { ids }]) => ids.includes(id))?.[0];
  assert.deepEqual(Object.fromEntries(panel.map((id) => [id, drawingOf(id)])), {
    'clear-all': 'broom', 'debug-console-view-icon': 'console-spider', filter: 'funnel', 'markers-view-icon': 'warning-triangle',
    'notifications-clear-all': 'broom', 'output-view-icon': 'quill', 'panel-maximize': 'expand-corners', 'terminal-kill': 'bin', trash: 'bin',
  });
  for (const [name, codepoint] of [['quill', 'E130'], ['console-spider', 'E131'], ['broom', 'E132'], ['funnel', 'E133'], ['bin', 'E134'], ['expand-corners', 'E135'], ['warning-triangle', 'E120']]) {
    assert.equal(map.drawings[name].codepoint, codepoint, name);
  }
  for (const id of panel) assert.equal(theme.iconDefinitions[id]?.fontCharacter, `\\${map.drawings[drawingOf(id)].codepoint}`, id);
});

test('every debug-batch ID maps to its drawing and codepoint; the reused breakpoint drawings and the run alias share their glyphs', () => {
  const debug = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'debug').map(([id]) => id).sort();
  assert.equal(debug.length, 25);
  for (const id of debug) assert.ok(id in theme.iconDefinitions, id);
  const drawingOf = (id) => Object.entries(map.drawings).find(([, { ids }]) => ids.includes(id))?.[0];
  assert.deepEqual(Object.fromEntries(debug.map((id) => [id, drawingOf(id)])), {
    'debug-hint': 'moon-breakpoint',
    'debug-breakpoint-disabled': 'moon-outline',
    'debug-breakpoint-unverified': 'dashed-ring', 'debug-breakpoint-conditional-unverified': 'dashed-ring',
    'debug-breakpoint-log-unverified': 'dashed-ring',
    'debug-breakpoint-conditional': 'moon-equals', 'debug-breakpoint-conditional-disabled': 'moon-equals',
    'debug-breakpoint-log': 'diamond', 'debug-breakpoint-log-disabled': 'diamond',
    'debug-stackframe': 'stackframe-arrow', 'debug-stackframe-focused': 'stackframe-moon', 'debug-stackframe-dot': 'moon-dot',
    'debug-step-over': 'step-over', 'debug-step-into': 'step-into', 'debug-step-out': 'step-out',
    'debug-start': 'play-filled', run: 'play-outline', 'testing-run-icon': 'play-outline', 'testing-run-all-icon': 'play-stacked',
    'debug-continue': 'continue', 'debug-pause': 'pause', 'debug-stop': 'stop-square', 'debug-restart': 'restart',
    'debug-disconnect': 'stop-square',
    'testing-passed-icon': 'check-disc',
  });
  for (const id of debug) assert.equal(theme.iconDefinitions[id].fontCharacter, `\\${map.drawings[drawingOf(id)].codepoint}`, id);
  const glyph = (id) => theme.iconDefinitions[id].fontCharacter;
  // G1/D4: the hint is the moon breakpoint; the disabled and unverified variants reuse a drawing and let VS Code's
  // state colours carry the difference.
  assert.equal(glyph('debug-hint'), glyph('debug-breakpoint'));
  assert.equal(glyph('debug-breakpoint-conditional-disabled'), glyph('debug-breakpoint-conditional'));
  assert.equal(glyph('debug-breakpoint-log-disabled'), glyph('debug-breakpoint-log'));
  assert.equal(glyph('debug-breakpoint-conditional-unverified'), glyph('debug-breakpoint-unverified'));
  assert.equal(glyph('debug-breakpoint-log-unverified'), glyph('debug-breakpoint-unverified'));
  // G23: js-debug focuses a child session, so the Node toolbar ends with Disconnect where Stop would be.
  assert.equal(glyph('debug-disconnect'), glyph('debug-stop'));
  assert.equal(glyph('testing-run-icon'), glyph('run'));
  assert.notEqual(glyph('debug-start'), glyph('run'));
});

// Gate 4, Part B1: each editor drawing keeps its codepoint and exactly these IDs, in claim order, and every ID reaches
// the theme through that codepoint.
const expectEditorPins = (rows) => {
  for (const [name, codepoint, ids] of rows) {
    assert.equal(map.drawings[name]?.codepoint, codepoint, name);
    assert.deepEqual(map.drawings[name].ids, ids, name);
    for (const id of ids) assert.equal(theme.iconDefinitions[id]?.fontCharacter, `\\${codepoint}`, id);
  }
};

test('editor (Task 2): the ✧ cluster carries sparkle and the all-AI gutter mark (G11); the pushpin carries the pinned tabs (G32)', () => {
  expectEditorPins([
    ['sparkle-cluster', 'E148', ['sparkle', 'gutter-lightbulb-sparkle-filled']],
    ['pushpin', 'E149', ['pinned']],
    ['pushpin-dirty', 'E14A', ['pinned-dirty']],
  ]);
});

test('editor (Task 3): pages and folders carry the file and folder IDs', () => {
  expectEditorPins([
    ['page', 'E14B', ['symbol-file']],
    ['page-plus', 'E14C', ['new-file']],
    ['page-arrow', 'E14D', ['go-to-file']],
    ['folder', 'E14E', ['symbol-folder']],
    ['folder-plus', 'E14F', ['new-folder']],
  ]);
});

test('editor (Task 4): the tree actions carry collapse-all, list-tree, discard and refresh; refresh is not restart', () => {
  expectEditorPins([
    ['collapse-stack', 'E150', ['collapse-all']],
    ['tree-node', 'E151', ['list-tree']],
    ['undo-arrow', 'E152', ['discard']],
    ['refresh-arrow', 'E153', ['refresh']],
  ]);
  assert.notEqual(theme.iconDefinitions.refresh.fontCharacter, theme.iconDefinitions['debug-restart'].fontCharacter);
  assert.notEqual(theme.iconDefinitions.refresh.fontCharacter, theme.iconDefinitions.sync.fontCharacter);
});

test('editor (Task 5): the four find toggles', () => {
  expectEditorPins([
    ['toggle-case', 'E154', ['case-sensitive']],
    ['toggle-word', 'E155', ['whole-word']],
    ['toggle-regex', 'E156', ['regex']],
    ['toggle-preserve', 'E157', ['preserve-case']],
  ]);
});

test('editor (Task 6): replace, and replace-all for both IDs that default to it; every Part B1 editor ID is mapped', () => {
  expectEditorPins([
    ['replace-box', 'E158', ['find-replace']],
    ['replace-stack', 'E159', ['find-replace-all', 'search-replace-all']],
  ]);
  // search-replace-all shares find-replace-all's drawing because both default to the codicon replace-all (1.141 bundle).
  assert.equal(pinned.ids['search-replace-all'].default, pinned.ids['find-replace-all'].default);
  const partB1 = ['sparkle', 'gutter-lightbulb-sparkle-filled', 'pinned', 'pinned-dirty', 'new-file', 'new-folder', 'go-to-file', 'symbol-file',
    'symbol-folder', 'collapse-all', 'list-tree', 'discard', 'refresh', 'case-sensitive', 'whole-word', 'regex', 'preserve-case', 'find-replace',
    'find-replace-all', 'search-replace-all'];
  for (const id of partB1) {
    assert.equal(pinned.ids[id]?.batch, 'editor', id);
    assert.ok(id in theme.iconDefinitions, id);
  }
  const codepoints = Object.values(map.drawings).map(({ codepoint }) => codepoint).filter((codepoint) => codepoint >= 'E148' && codepoint <= 'E15F');
  assert.deepEqual(codepoints.sort(), Array.from({ length: 18 }, (_, index) => (0xE148 + index).toString(16).toUpperCase()));
});

test('every layout ID maps to the drawing of its Codicon default, so layout IDs share a drawing exactly when they share a default', () => {
  const layout = ['split-horizontal', 'split-vertical', 'panel-left', 'panel-left-off', 'panel-layout-icon', 'panel-layout-icon-off',
    'auxiliarybar-right-layout-icon', 'auxiliarybar-right-off-layout-icon', 'panel-right', 'panel-right-off',
    'auxiliarybar-left-layout-icon', 'auxiliarybar-left-off-layout-icon', 'panel-bottom', 'configure-layout-icon'].sort();
  for (const id of layout) assert.equal(pinned.ids[id]?.batch, 'editor', id);
  const drawingOf = (id) => Object.entries(map.drawings).find(([, { ids }]) => ids.includes(id))?.[0];
  assert.deepEqual(Object.fromEntries(layout.map((id) => [id, drawingOf(id)])), {
    'auxiliarybar-left-layout-icon': 'pane-left', 'auxiliarybar-left-off-layout-icon': 'pane-left-off',
    'auxiliarybar-right-layout-icon': 'pane-right', 'auxiliarybar-right-off-layout-icon': 'pane-right-off',
    'configure-layout-icon': 'four-panes',
    'panel-bottom': 'pane-bottom', 'panel-layout-icon': 'pane-bottom', 'panel-layout-icon-off': 'pane-bottom-off',
    'panel-left': 'pane-left', 'panel-left-off': 'pane-left-off', 'panel-right': 'pane-right', 'panel-right-off': 'pane-right-off',
    'split-horizontal': 'split-horizontal', 'split-vertical': 'split-vertical',
  });
  // The sharing follows the registered defaults (layout-sidebar-left, layout-sidebar-right, layout-panel and their -off
  // forms): one drawing per default, a different drawing for each default, and a codicon ID (no default) on its own.
  const byDefault = Object.groupBy(layout, (id) => pinned.ids[id].default ?? id);
  for (const ids of Object.values(byDefault)) assert.equal(new Set(ids.map(drawingOf)).size, 1, ids.join(', '));
  assert.equal(new Set(layout.map(drawingOf)).size, Object.keys(byDefault).length);
  for (const [name, codepoint] of [['pane-left', 'E160'], ['pane-left-off', 'E161'], ['pane-right', 'E162'], ['pane-right-off', 'E163'],
    ['pane-bottom', 'E164'], ['pane-bottom-off', 'E165'], ['split-horizontal', 'E166'], ['split-vertical', 'E167'], ['four-panes', 'E168']]) {
    assert.equal(map.drawings[name]?.codepoint, codepoint, name);
  }
  for (const id of layout) assert.equal(theme.iconDefinitions[id]?.fontCharacter, `\\${map.drawings[drawingOf(id)]?.codepoint}`, id);
});

test('every symbols-batch ID maps to its drawing and codepoint, shared only where the stock Codicon shares', () => {
  const symbols = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'symbols').map(([id]) => id).sort();
  assert.equal(symbols.length, 19);
  const drawingOf = (id) => Object.entries(map.drawings).find(([, { ids }]) => ids.includes(id))?.[0];
  assert.deepEqual(Object.fromEntries(symbols.map((id) => [id, drawingOf(id)])), {
    'symbol-class': 'class-tree', 'symbol-constant': 'equals-block', 'symbol-constructor': 'cube', 'symbol-enum': 'cards',
    'symbol-field': 'slab', 'symbol-function': 'cube', 'symbol-interface': 'lollipop', 'symbol-key': 'abc',
    'symbol-keyword': 'keyword-lines', 'symbol-method': 'cube', 'symbol-module': 'braces', 'symbol-namespace': 'braces',
    'symbol-object': 'braces', 'symbol-package': 'braces', 'symbol-property': 'wrench', 'symbol-snippet': 'snippet-frame',
    'symbol-string': 'abc', 'symbol-text': 'abc', 'symbol-variable': 'bracket-x',
  });
  for (const [name, codepoint] of [['abc', 'E170'], ['bracket-x', 'E171'], ['keyword-lines', 'E172'], ['snippet-frame', 'E173'],
    ['cube', 'E174'], ['slab', 'E175'], ['wrench', 'E176'], ['equals-block', 'E177'], ['class-tree', 'E178'], ['lollipop', 'E179'],
    ['cards', 'E17A'], ['braces', 'E128']]) {
    assert.equal(map.drawings[name].codepoint, codepoint, name);
  }
  for (const id of symbols) assert.equal(theme.iconDefinitions[id]?.fontCharacter, `\\${map.drawings[drawingOf(id)].codepoint}`, id);
  // The 1.141 codicon.ttf gives method and function one codepoint, module and namespace one codepoint whose outline is
  // the `bracket` glyph's, and string and text two codepoints with identical outlines. G34 pins four more shares on the
  // same stock pairing: constructor with method and function, key with string and text, object and package with bracket.
  // Every other symbol kind has its own picture: 19 IDs, 12 glyphs.
  const glyph = (id) => theme.iconDefinitions[id].fontCharacter;
  assert.equal(glyph('symbol-function'), glyph('symbol-method'));
  assert.equal(glyph('symbol-module'), glyph('bracket'));
  assert.equal(glyph('symbol-namespace'), glyph('bracket'));
  assert.equal(glyph('symbol-text'), glyph('symbol-string'));
  assert.equal(glyph('symbol-constructor'), glyph('symbol-method'));
  assert.equal(glyph('symbol-key'), glyph('symbol-string'));
  assert.equal(glyph('symbol-object'), glyph('bracket'));
  assert.equal(glyph('symbol-package'), glyph('bracket'));
  assert.equal(new Set(symbols.map(glyph)).size, 12);
});
