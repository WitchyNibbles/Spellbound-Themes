import test from 'node:test';
import assert from 'node:assert/strict';
import { createReport } from '../scripts/lib/report.mjs';
import { REQUIRED_SEMANTIC, checkThemeContributions, checkThemeFile, schemeToVSCodeColors } from '../scripts/lib/checks/color-themes.mjs';
import scheme from '../src/witchyterm-moonlit-candle.scheme.json' with { type: 'json' };

const run = (fn) => {
  const report = createReport({ enforce: ['base', 'color-themes'] });
  fn(report);
  return report.result().errors.map((error) => error.message);
};

const theme = (name, { colors = {}, tokenColors, semantic = {} } = {}) => ({
  name,
  type: 'dark',
  semanticHighlighting: true,
  semanticTokenColors: { ...Object.fromEntries(REQUIRED_SEMANTIC.map((key) => [key, '#F3EAF7'])), ...semantic },
  colors: {
    'editor.background': '#0D0916', 'editor.foreground': '#F3EAF7',
    'gitDecoration.addedResourceForeground': '#77D9FF', 'editorWarning.foreground': '#FFB86B',
    ...colors,
  },
  tokenColors: tokenColors ?? [
    { name: 'Keywords', scope: ['keyword', 'storage.type'], settings: { foreground: '#B99AFF', fontStyle: 'bold' } },
    { name: 'Operators', scope: ['keyword.operator'], settings: { foreground: '#D3B4FF', fontStyle: '' } },
  ],
});
const check = (t) => run((report) => checkThemeFile({ relative: 't.json', theme: t, scheme }, report));
const candleColors = () => schemeToVSCodeColors(scheme, 'full');

test('four themes, Moonlit Candle first', () => {
  const messages = run((report) => checkThemeContributions({ contributes: { themes: [{ label: 'WitchyNibbles Moonlit' }] } }, report));
  assert.ok(messages.includes('Expected 4 color themes, found 1'));
  assert.ok(messages.includes('WitchyNibbles Moonlit Candle must be the first color theme'));
});

test('a clean theme passes', () => {
  assert.deepEqual(check(theme('Test')), []);
});

test('bold outside keyword and storage.type is rejected', () => {
  const messages = check(theme('Test', { tokenColors: [
    { name: 'Functions', scope: ['entity.name.function'], settings: { foreground: '#FFD477', fontStyle: 'bold' } },
  ] }));
  assert.ok(messages.some((m) => m.includes('rule "Functions" sets bold on entity.name.function')));
});

test('a child scope without fontStyle inherits bold and is rejected', () => {
  const messages = check(theme('Test', { tokenColors: [
    { name: 'Keywords', scope: ['keyword'], settings: { foreground: '#B99AFF', fontStyle: 'bold' } },
    { name: 'Operators', scope: ['keyword.operator'], settings: { foreground: '#D3B4FF' } },
  ] }));
  assert.ok(messages.some((m) => m.includes('rule "Operators" scope keyword.operator inherits bold from keyword')));
});

test('bold semantic tokens other than keywords are rejected', () => {
  const messages = check(theme('Test', { semantic: { function: { foreground: '#FFD477', bold: true } } }));
  assert.ok(messages.some((m) => m.includes('semantic token function sets bold')));
});

test('green is allowed only from the per-theme allowlist', () => {
  assert.ok(check(theme('Test', { colors: { 'charts.green': '#74E8B8' } })).some((m) => m.includes('green accent outside the success allowlist: #74E8B8')));
  assert.equal(check(theme('WitchyNibbles Moonlit Candle', { colors: { ...candleColors() } })).some((m) => m.includes('green')), false);
  assert.ok(check(theme('WitchyNibbles Moonlit Candle', { colors: { ...candleColors(), 'charts.green': '#3DDC84' } })).some((m) => m.includes('#3DDC84')));
});

test('Moonlit Candle terminal must equal the full witchyterm scheme', () => {
  const messages = check(theme('WitchyNibbles Moonlit Candle', { colors: { ...candleColors(), 'terminal.ansiGreen': '#000000', 'terminal.background': '#08060D' } }));
  assert.ok(messages.includes('t.json terminal.ansiGreen is #000000, expected #74E8B8 (witchyterm green)'));
  assert.ok(messages.includes('t.json terminal.background is #08060D, expected #0D0916 (witchyterm background)'));
});

test('Moonlit is held to the full scheme too (decision 2)', () => {
  const messages = check(theme('WitchyNibbles Moonlit', { colors: { ...schemeToVSCodeColors(scheme, 'full'), 'terminal.background': '#08060D', 'terminal.ansiRed': '#FF0000' } }));
  assert.ok(messages.some((m) => m.includes('terminal.ansiRed is #FF0000')));
  assert.ok(messages.includes('t.json terminal.background is #08060D, expected #0D0916 (witchyterm background)'));
});

test('unpinned themes keep the 4.5:1 ANSI contrast rule', () => {
  const messages = check(theme('Test', { colors: { 'terminal.background': '#0D0916', 'terminal.ansiBlack': '#1D1230' } }));
  assert.ok(messages.some((m) => m.includes('terminal.ansiBlack contrast is')));
});

test('success and warning colours need 4.5:1 on the editor', () => {
  const messages = check(theme('Test', { colors: { 'gitDecoration.addedResourceForeground': '#2E4A3F' } }));
  assert.ok(messages.some((m) => m.startsWith('t.json success gitDecoration.addedResourceForeground #2E4A3F is')));
});

test('foregrounds on accent fills need 4.5:1', () => {
  const messages = check(theme('Test', { colors: { 'badge.background': '#FF67B7', 'badge.foreground': '#F3EAF7' } }));
  assert.ok(messages.some((m) => m.startsWith('t.json badge.foreground on badge.background is')));
});

test('every token colour needs 4.5:1 on the editor', () => {
  const messages = check(theme('Test', { tokenColors: [{ name: 'Murky', scope: ['comment'], settings: { foreground: '#333333', fontStyle: 'italic' } }] }));
  assert.ok(messages.some((m) => m.startsWith('t.json token "Murky" #333333 is')));
});

test('the UI-boundary border needs 3:1 on editor, sidebar and panel (decision 14)', () => {
  const messages = check(theme('WitchyNibbles Daydream', { colors: { 'editor.background': '#FFF9FD', 'sideBar.background': '#F8F0FB', 'panel.background': '#F5ECFA', 'input.border': '#DCC7E5' } }));
  assert.ok(messages.some((m) => m.startsWith('t.json input.border #DCC7E5 is')));
});
