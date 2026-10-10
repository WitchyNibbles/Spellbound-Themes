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

test('every debug-batch ID is mapped; the reused breakpoint drawings and the run alias share their glyphs', () => {
  const debug = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'debug').map(([id]) => id);
  assert.equal(debug.length, 25);
  for (const id of debug) assert.ok(id in theme.iconDefinitions, id);
  const drawingOf = (id) => Object.entries(map.drawings).find(([, { ids }]) => ids.includes(id))?.[0];
  assert.deepEqual(Object.fromEntries(debug.sort().map((id) => [id, drawingOf(id)])), {
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
