import { compositedContrast, contrast, hexes, isGreenAccent } from '../../../src/color.mjs';

export const REQUIRED_SEMANTIC = ['namespace', 'type', 'class', 'enum', 'interface', 'struct', 'typeParameter', 'parameter', 'variable', 'property', 'enumMember', 'decorator', 'function', 'method', 'macro', 'comment', '*.readonly', '*.declaration'];

export const ANSI_KEYS = [
  'terminal.ansiBlack', 'terminal.ansiRed', 'terminal.ansiGreen', 'terminal.ansiYellow',
  'terminal.ansiBlue', 'terminal.ansiMagenta', 'terminal.ansiCyan', 'terminal.ansiWhite',
  'terminal.ansiBrightBlack', 'terminal.ansiBrightRed', 'terminal.ansiBrightGreen', 'terminal.ansiBrightYellow',
  'terminal.ansiBrightBlue', 'terminal.ansiBrightMagenta', 'terminal.ansiBrightCyan', 'terminal.ansiBrightWhite',
];

const TEXT_PAIRS = [
  ['editor.foreground', 'editor.background', 'editor'],
  ['sideBar.foreground', 'sideBar.background', 'sidebar'],
  ['terminal.foreground', 'terminal.background', 'terminal'],
];

const STATE_PAIRS = [
  ['editor.foreground', 'editor.selectionBackground', 'editor.background', 'editor selection'],
  ['editor.foreground', 'editor.selectionHighlightBackground', 'editor.background', 'editor selection highlight'],
  ['editor.foreground', 'editor.inactiveSelectionBackground', 'editor.background', 'editor inactive selection'],
  ['editor.foreground', 'diffEditor.insertedTextBackground', 'editor.background', 'inserted diff text'],
  ['editor.foreground', 'diffEditor.removedTextBackground', 'editor.background', 'removed diff text'],
  ['list.activeSelectionForeground', 'list.activeSelectionBackground', 'sideBar.background', 'active list selection'],
  ['list.inactiveSelectionForeground', 'list.inactiveSelectionBackground', 'sideBar.background', 'inactive list selection'],
  ['list.hoverForeground', 'list.hoverBackground', 'sideBar.background', 'list hover'],
  ['list.focusForeground', 'list.focusBackground', 'sideBar.background', 'list focus'],
];

// Spec section 3.1: Windows Terminal field -> VS Code colour key.
export const WT_TO_VSCODE = Object.freeze({
  background: 'terminal.background', foreground: 'terminal.foreground',
  cursorColor: 'terminalCursor.foreground', selectionBackground: 'terminal.selectionBackground',
  black: 'terminal.ansiBlack', red: 'terminal.ansiRed', green: 'terminal.ansiGreen', yellow: 'terminal.ansiYellow',
  blue: 'terminal.ansiBlue', purple: 'terminal.ansiMagenta', cyan: 'terminal.ansiCyan', white: 'terminal.ansiWhite',
  brightBlack: 'terminal.ansiBrightBlack', brightRed: 'terminal.ansiBrightRed', brightGreen: 'terminal.ansiBrightGreen',
  brightYellow: 'terminal.ansiBrightYellow', brightBlue: 'terminal.ansiBrightBlue', brightPurple: 'terminal.ansiBrightMagenta',
  brightCyan: 'terminal.ansiBrightCyan', brightWhite: 'terminal.ansiBrightWhite',
});
export const ANSI_FIELDS = Object.keys(WT_TO_VSCODE).slice(4);
export const SCHEME_FIELD_SETS = Object.freeze({ full: Object.keys(WT_TO_VSCODE), ansi: ANSI_FIELDS });

// Themes whose terminal equals the pinned witchyterm scheme (section 8 replaces their ANSI contrast check).
// Author decision 2: Moonlit takes the full scheme, like Moonlit Candle.
export const PINNED_TERMINAL = Object.freeze({
  'WitchyNibbles Moonlit Candle': 'full',
  'WitchyNibbles Moonlit': 'full',
});
export const PINNED_THEME_NAMES = Object.keys(PINNED_TERMINAL);

// Section 8: the green ban narrowed to the settled success-mint values. Coven Contrast has no entry.
export const GREEN_ALLOWLIST = Object.freeze({
  'WitchyNibbles Moonlit Candle': ['#74E8B8', '#9DF2CE'],
  'WitchyNibbles Moonlit': ['#74E8B8', '#9DF2CE'],
  'WitchyNibbles Daydream': ['#0E7553'],
});

// Author decision 14: the UI-boundary border reaches 3:1 on the surfaces it is used on. Moonlit has no settled value.
export const UI_BORDER_THEMES = ['WitchyNibbles Moonlit Candle', 'WitchyNibbles Daydream', 'WitchyNibbles Coven Contrast'];
const UI_BORDER_SURFACES = ['editor.background', 'sideBar.background', 'panel.background'];

export const SUCCESS_KEYS = ['gitDecoration.addedResourceForeground', 'editorGutter.addedBackground', 'notebookStatusSuccessIcon.foreground', 'testing.iconPassed'];
export const WARNING_KEYS = ['editorWarning.foreground', 'notificationsWarningIcon.foreground'];
const REQUIRED_STATUS_KEYS = ['gitDecoration.addedResourceForeground', 'editorWarning.foreground'];

// Section 3.1 pins dark text on pink and gold fills; this keeps every theme's filled controls readable.
export const ON_COLOR_PAIRS = [
  ['button.foreground', 'button.background'],
  ['button.foreground', 'button.hoverBackground'],
  ['badge.foreground', 'badge.background'],
  ['activityBarBadge.foreground', 'activityBarBadge.background'],
  ['statusBarItem.remoteForeground', 'statusBarItem.remoteBackground'],
  ['statusBarItem.prominentForeground', 'statusBarItem.prominentBackground'],
  ['chat.avatarForeground', 'chat.avatarBackground'],
];

const isBoldScope = (scope) => scope === 'keyword'
  || (scope.startsWith('keyword.') && !scope.startsWith('keyword.operator'))
  || scope === 'storage.type' || scope.startsWith('storage.type.');
const scopesOf = (rule) => (Array.isArray(rule.scope) ? rule.scope : String(rule.scope ?? '').split(','))
  .map((scope) => scope.trim().split(/\s+/).pop())
  .filter(Boolean);
const hasStyle = (rule, style) => String(rule.settings?.fontStyle ?? '').split(/\s+/).includes(style);
const upper = (hex) => hex.slice(0, 7).toUpperCase();

export function schemeToVSCodeColors(scheme, fieldSet) {
  return Object.fromEntries(SCHEME_FIELD_SETS[fieldSet].map((field) => [WT_TO_VSCODE[field], scheme[field]]));
}

export function checkThemeContributions(packageJson, report) {
  const themes = packageJson.contributes?.themes ?? [];
  if (themes.length !== 4) report.fail('color-themes', `Expected 4 color themes, found ${themes.length}`);
  if (themes[0]?.label !== 'WitchyNibbles Moonlit Candle') report.fail('color-themes', 'WitchyNibbles Moonlit Candle must be the first color theme');
}

export function checkThemeFile({ relative, theme, scheme }, report) {
  const base = (message) => report.fail('base', `${relative} ${message}`);
  const fail = (message) => report.fail('color-themes', `${relative} ${message}`);
  const colors = theme.colors ?? {};
  const editor = colors['editor.background'];
  const failOnEditor = (label, foreground) => {
    const ratio = contrast(foreground, editor);
    if (ratio < 4.5) fail(`${label} ${foreground} is ${ratio.toFixed(2)}:1 on editor.background (needs 4.5:1)`);
  };

  // Kept from 1.2.1.
  if (Object.keys(colors).some((key) => /^gitDecoration\..*ResourceBackground$/.test(key))) base('contains unsupported git decoration background key');
  if (theme.semanticHighlighting !== true) base('must enable semantic highlighting');
  const semanticKeys = Object.keys(theme.semanticTokenColors ?? {});
  if (REQUIRED_SEMANTIC.some((key) => !semanticKeys.includes(key))) base(`must define all ${REQUIRED_SEMANTIC.length} required semantic token keys`);
  for (const token of theme.tokenColors ?? []) if (!token.settings?.foreground) base(`token ${token.name ?? '<unnamed>'} has no foreground`);
  for (const [foreground, background, label] of TEXT_PAIRS) {
    if (colors[foreground] && colors[background]) {
      const ratio = contrast(colors[foreground], colors[background]);
      if (ratio < 4.5) base(`${label} contrast is ${ratio.toFixed(2)}:1`);
    }
  }
  for (const [foreground, background, surface, label] of STATE_PAIRS) {
    if (colors[foreground] && colors[background] && colors[surface]) {
      const ratio = compositedContrast(colors[foreground], colors[background], colors[surface]);
      if (ratio < 4.5) base(`${label} contrast is ${ratio.toFixed(2)}:1 after alpha compositing`);
    }
  }

  // Green: allowlist instead of a blanket ban.
  const allowed = (GREEN_ALLOWLIST[theme.name] ?? []).map(upper);
  for (const color of new Set(hexes(JSON.stringify(theme)).map(upper))) {
    if (isGreenAccent(color) && !allowed.includes(color)) fail(`contains a green accent outside the success allowlist: ${color}`);
  }

  // Terminal: equality for pinned themes, contrast for the others.
  const fieldSet = PINNED_TERMINAL[theme.name];
  if (fieldSet) {
    for (const field of SCHEME_FIELD_SETS[fieldSet]) {
      const key = WT_TO_VSCODE[field];
      const expected = scheme[field];
      if ((colors[key] ?? '').toUpperCase() !== expected.toUpperCase()) fail(`${key} is ${colors[key] ?? 'unset'}, expected ${expected} (witchyterm ${field})`);
    }
  } else {
    for (const key of ANSI_KEYS) {
      if (colors[key] && colors['terminal.background']) {
        const ratio = contrast(colors[key], colors['terminal.background']);
        if (ratio < 4.5) base(`${key} contrast is ${ratio.toFixed(2)}:1 against terminal background`);
      }
    }
  }

  // Typography: bold only on keyword and storage.type scopes, and no silent inheritance of bold.
  const boldRules = (theme.tokenColors ?? []).filter((rule) => hasStyle(rule, 'bold'));
  for (const rule of boldRules) {
    for (const scope of scopesOf(rule)) {
      if (!isBoldScope(scope)) fail(`rule "${rule.name}" sets bold on ${scope}; bold is reserved for keyword and storage.type scopes`);
    }
  }
  const allBold = boldRules.flatMap(scopesOf);
  for (const rule of theme.tokenColors ?? []) {
    if (rule.settings && 'fontStyle' in rule.settings) continue;
    for (const scope of scopesOf(rule)) {
      const parent = allBold.find((boldScope) => scope.startsWith(`${boldScope}.`));
      if (parent) fail(`rule "${rule.name}" scope ${scope} inherits bold from ${parent}; set fontStyle explicitly`);
    }
  }
  for (const [key, value] of Object.entries(theme.semanticTokenColors ?? {})) {
    if (value && typeof value === 'object' && value.bold === true && !key.startsWith('keyword')) fail(`semantic token ${key} sets bold; bold is reserved for keywords`);
  }

  // Every token colour reaches 4.5:1 on the editor.
  if (editor) {
    for (const rule of theme.tokenColors ?? []) {
      if (rule.settings?.foreground) failOnEditor(`token "${rule.name}"`, rule.settings.foreground);
    }
    for (const [key, value] of Object.entries(theme.semanticTokenColors ?? {})) {
      const foreground = typeof value === 'string' ? value : value?.foreground;
      if (foreground) failOnEditor(`semantic token ${key}`, foreground);
    }
  }

  // Success/added and warning colours.
  for (const key of REQUIRED_STATUS_KEYS) if (!colors[key]) fail(`must define ${key}`);
  for (const [label, keys] of [['success', SUCCESS_KEYS], ['warning', WARNING_KEYS]]) {
    for (const key of keys) {
      if (colors[key] && editor) failOnEditor(`${label} ${key}`, colors[key]);
    }
  }

  // UI-boundary border (decision 14).
  if (UI_BORDER_THEMES.includes(theme.name) && colors['input.border']) {
    for (const surface of UI_BORDER_SURFACES) {
      if (!colors[surface]) continue;
      const ratio = contrast(colors['input.border'], colors[surface]);
      if (ratio < 3) fail(`input.border ${colors['input.border']} is ${ratio.toFixed(2)}:1 on ${surface} (needs 3:1)`);
    }
  }

  // Foregrounds on accent fills.
  for (const [foreground, background] of ON_COLOR_PAIRS) {
    if (colors[foreground] && colors[background]) {
      const ratio = contrast(colors[foreground], colors[background]);
      if (ratio < 4.5) fail(`${foreground} on ${background} is ${ratio.toFixed(2)}:1 (needs 4.5:1)`);
    }
  }
}
