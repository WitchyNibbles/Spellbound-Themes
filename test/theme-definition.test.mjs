import test from 'node:test';
import assert from 'node:assert/strict';
import { createThemes, themeFilenames } from '../src/theme-definition.mjs';
import { contrast } from '../src/color.mjs';
import packageJson from '../package.json' with { type: 'json' };
import scheme from '../src/witchyterm-moonlit-candle.scheme.json' with { type: 'json' };
import { schemeToVSCodeColors } from '../scripts/lib/checks/color-themes.mjs';

const themes = createThemes();
const byName = (name) => themes.find((theme) => theme.name === name);
const rule = (theme, name) => theme.tokenColors.find((entry) => entry.name === name);
const candle = byName('WitchyNibbles Moonlit Candle');

test('Moonlit Candle is generated first and contributed first', () => {
  assert.equal(themes[0].name, 'WitchyNibbles Moonlit Candle');
  assert.equal(themes[0].type, 'dark');
  assert.equal(themeFilenames[0], 'WitchyNibbles-color-theme-moonlit-candle.json');
  assert.deepEqual(packageJson.contributes.themes[0], { label: 'WitchyNibbles Moonlit Candle', uiTheme: 'vs-dark', path: './themes/WitchyNibbles-color-theme-moonlit-candle.json' });
  assert.equal(packageJson.contributes.themes.length, 4);
});

test('surfaces and text', () => {
  const c = candle.colors;
  assert.equal(c['editor.background'], '#0D0916');
  assert.equal(c['panel.background'], '#171025');
  assert.equal(c['sideBar.background'], '#120C1F');
  assert.equal(c['editor.foreground'], '#F3EAF7');
  assert.equal(c['input.border'], '#6E5A80');
  assert.equal(c['editorGroup.border'], '#38234D');
});

test('main accent is gold with dark text', () => {
  const c = candle.colors;
  for (const key of ['activityBar.activeBorder', 'tab.activeBorderTop', 'panelTitle.activeBorder', 'progressBar.background', 'button.background', 'statusBarItem.remoteBackground', 'sideBarTitle.foreground', 'editorLineNumber.activeForeground']) {
    assert.equal(c[key], '#FFD477', key);
  }
  assert.equal(c['button.foreground'], '#0D0916');
  assert.equal(c['statusBarItem.remoteForeground'], '#0D0916');
});

test('needs-you is pink with dark text', () => {
  const c = candle.colors;
  for (const key of ['activityBarBadge.background', 'badge.background', 'tab.activeModifiedBorder', 'tab.inactiveModifiedBorder', 'editorCursor.foreground', 'terminalCursor.foreground']) {
    assert.equal(c[key], '#FF67B7', key);
  }
  assert.equal(c['activityBarBadge.foreground'], '#0D0916');
  assert.equal(c['badge.foreground'], '#0D0916');
});

test('selection, focus and status roles', () => {
  const c = candle.colors;
  assert.equal(c['focusBorder'], '#B99AFF');
  assert.equal(c['editorBracketMatch.border'], '#B99AFF');
  assert.equal(c['scrollbarSlider.hoverBackground'], '#B99AFF');
  assert.equal(c['list.activeSelectionBackground'], '#633B79');
  assert.equal(c['editor.selectionBackground'], '#633B79AA');
  for (const key of ['gitDecoration.addedResourceForeground', 'gitDecoration.untrackedResourceForeground', 'editorGutter.addedBackground', 'testing.iconPassed', 'notebookStatusSuccessIcon.foreground']) assert.equal(c[key], '#74E8B8', key);
  for (const key of ['gitDecoration.modifiedResourceForeground', 'editorGutter.modifiedBackground', 'editorWarning.foreground', 'notificationsWarningIcon.foreground']) assert.equal(c[key], '#FFB86B', key);
  for (const key of ['editorError.foreground', 'gitDecoration.deletedResourceForeground', 'editorGutter.deletedBackground', 'testing.iconFailed']) assert.equal(c[key], '#FF6B9F', key);
  assert.equal(c['editorInfo.foreground'], '#77D9FF');
  assert.equal(c['debugIcon.breakpointForeground'], '#FFD477');
});

test('syntax colours follow the section 3.1 table', () => {
  const expected = { Keywords: '#B99AFF', Functions: '#FFD477', Strings: '#74E8B8', 'Class and type names': '#77D9FF', Numbers: '#FF9BD7', 'Booleans and constants': '#FF9BD7', Comments: '#A99AB9', Documentation: '#CFC3DB', Variables: '#F3EAF7', Operators: '#D3B4FF', Punctuation: '#D3B4FF', Tags: '#FF86C8', 'Attributes and properties': '#9CCBFF' };
  for (const [name, color] of Object.entries(expected)) assert.equal(rule(candle, name).settings.foreground, color, name);
});

test('function and method declarations stay gold despite the *.declaration tie', () => {
  assert.equal(candle.semanticTokenColors['function.declaration'], '#FFD477');
  assert.equal(candle.semanticTokenColors['method.declaration'], '#FFD477');
  assert.equal(candle.semanticTokenColors['variable.declaration'], '#F3EAF7');
  assert.equal(candle.semanticTokenColors.enum, '#77D9FF');
  assert.equal(candle.semanticTokenColors.typeParameter, '#77D9FF');
});

const moonlit = byName('WitchyNibbles Moonlit');
const daydream = byName('WitchyNibbles Daydream');
const coven = byName('WitchyNibbles Coven Contrast');

test('Moonlit gets mint success and amber warning', () => {
  for (const key of ['gitDecoration.addedResourceForeground', 'editorGutter.addedBackground', 'notebookStatusSuccessIcon.foreground']) assert.equal(moonlit.colors[key], '#74E8B8', key);
  for (const key of ['editorWarning.foreground', 'notificationsWarningIcon.foreground']) assert.equal(moonlit.colors[key], '#FFB86B', key);
});

test('Daydream gets dark mint success and keeps its amber warning', () => {
  assert.equal(daydream.colors['gitDecoration.addedResourceForeground'], '#0E7553');
  assert.equal(daydream.colors['editorGutter.addedBackground'], '#0E7553');
  assert.equal(daydream.colors['editorWarning.foreground'], '#9A5A00');
});

test('Coven Contrast keeps its own status colours', () => {
  assert.equal(coven.colors['gitDecoration.addedResourceForeground'], '#7DEBFF');
  assert.equal(coven.colors['editorWarning.foreground'], '#FFE38A');
});

test('Coven Contrast fills the focused quick-input row, so its text and icons stay readable (G29)', () => {
  // VS Code 1.141 leaves quickInputList.focusBackground transparent in high contrast, while the row text takes
  // list.activeSelectionForeground (black): black on the near-black quick input without these keys.
  const c = coven.colors;
  for (const key of ['quickInputList.focusBackground', 'quickInputList.focusForeground', 'quickInputList.focusIconForeground']) assert.ok(c[key], `${key} is set`);
  for (const key of ['quickInputList.focusForeground', 'quickInputList.focusIconForeground']) {
    assert.ok(contrast(c[key], c['quickInputList.focusBackground']) >= 7, key);
  }
  for (const theme of [candle, daydream, byName('WitchyNibbles Moonlit')]) {
    assert.equal('quickInputList.focusBackground' in theme.colors, false, `${theme.name} keeps VS Code's default`);
  }
});

test('UI-boundary borders reach 3:1 on editor, sidebar and panel (decision 14)', () => {
  assert.equal(daydream.colors['input.border'], '#8E78A6');
  assert.equal(daydream.colors['editorGroup.border'], '#DCC7E5');
  assert.equal(coven.colors['input.border'], '#FFFFFF');
  for (const theme of [candle, daydream, coven]) {
    for (const surface of ['editor.background', 'sideBar.background', 'panel.background']) {
      assert.ok(contrast(theme.colors['input.border'], theme.colors[surface]) >= 3, `${theme.name} ${surface}`);
    }
  }
});

for (const theme of themes) {
  test(`${theme.name}: bold only on keyword and storage.type; italic on comments, docs and storage modifiers`, () => {
    assert.deepEqual(rule(theme, 'Keywords').scope, ['keyword', 'storage.type']);
    assert.equal(rule(theme, 'Keywords').settings.fontStyle, 'bold');
    assert.equal(rule(theme, 'Storage modifiers').settings.fontStyle, 'italic');
    assert.equal(rule(theme, 'Storage').settings.fontStyle, undefined);
    assert.equal(rule(theme, 'Comments').settings.fontStyle, 'italic');
    assert.equal(rule(theme, 'Documentation').settings.fontStyle, 'italic');
    for (const name of ['Functions', 'Booleans and constants', 'Class and type names']) assert.equal(rule(theme, name).settings.fontStyle, undefined, name);
    assert.equal(rule(theme, 'Operators').settings.fontStyle, '');
  });
}

test('Moonlit Candle terminal equals the witchyterm scheme (all 20 fields)', () => {
  for (const [key, value] of Object.entries(schemeToVSCodeColors(scheme, 'full'))) assert.equal(candle.colors[key], value, key);
});

test('Moonlit terminal equals the witchyterm scheme too (decision 2)', () => {
  for (const [key, value] of Object.entries(schemeToVSCodeColors(scheme, 'full'))) assert.equal(moonlit.colors[key], value, key);
});

test('Moonlit terminal background is the witchyterm background', () => {
  assert.equal(moonlit.colors['terminal.background'], '#0D0916');
});

test('Daydream and Coven terminals are unchanged', () => {
  assert.equal(daydream.colors['terminal.ansiGreen'], '#7DEBFF');
  assert.equal(daydream.colors['terminal.background'], '#21152D');
  assert.equal(coven.colors['terminal.background'], '#000000');
});

test('stackframe colours (decision 3)', () => {
  const expected = {
    'WitchyNibbles Moonlit Candle': ['#FFD477', '#B99AFF'],
    'WitchyNibbles Moonlit': ['#FF67B7', '#B99AFF'],
    'WitchyNibbles Daydream': ['#B52776', '#7042B2'],
    'WitchyNibbles Coven Contrast': ['#FF67B7', '#D0B8FF'],
  };
  for (const theme of themes) {
    const [current, other] = expected[theme.name];
    assert.equal(theme.colors['debugIcon.breakpointCurrentStackframeForeground'], current, theme.name);
    assert.equal(theme.colors['debugIcon.breakpointStackframeForeground'], other, theme.name);
  }
});
