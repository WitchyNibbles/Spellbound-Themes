import { contrast } from './color.mjs';
import witchyterm from './witchyterm-moonlit-candle.scheme.json' with { type: 'json' };

// Spec section 3.1 key mapping (Windows Terminal -> palette tokens read by sharedColors). Mirrors WT_TO_VSCODE in the validator.
const terminalFromScheme = (s, fields) => ({
  terminalBlack: s.black, terminalRed: s.red, terminalGreen: s.green, terminalYellow: s.yellow,
  terminalBlue: s.blue, terminalMagenta: s.purple, terminalCyan: s.cyan, terminalWhite: s.white,
  terminalBrightBlack: s.brightBlack, terminalBrightRed: s.brightRed, terminalBrightGreen: s.brightGreen,
  terminalBrightYellow: s.brightYellow, terminalBrightBlue: s.brightBlue, terminalBrightMagenta: s.brightPurple,
  terminalBrightCyan: s.brightCyan, terminalBrightWhite: s.brightWhite,
  ...(fields === 'full'
    ? { terminal: s.background, terminalForeground: s.foreground, terminalCursor: s.cursorColor, terminalSelection: s.selectionBackground }
    : {}),
});

const sharedTokenColors = {
  comment: '#9E8AAF',
  variable: '#F8F2FF',
  keyword: '#FF67B7',
  function: '#77D9FF',
  string: '#FFD477',
  number: '#B99AFF',
  constant: '#FF9BD7',
  operator: '#D3B4FF',
  punctuation: '#D3B4FF',
  className: '#A8E7FF',
  tag: '#FF86C8',
  attribute: '#9CCBFF',
  template: '#FFB8E4',
  doc: '#D8C7FF',
};

const tokenColors = (c) => [
  { name: 'Comments', scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment, fontStyle: 'italic' } },
  { name: 'Documentation', scope: ['comment.documentation', 'string.quoted.docstring', 'string.quoted.docstring.multi'], settings: { foreground: c.doc, fontStyle: 'italic' } },
  { name: 'Variables', scope: ['variable', 'variable.other.readwrite', 'meta.definition.variable'], settings: { foreground: c.variable } },
  { name: 'Keywords', scope: ['keyword', 'storage.type'], settings: { foreground: c.keyword, fontStyle: 'bold' } },
  { name: 'Storage', scope: ['storage'], settings: { foreground: c.keyword } },
  { name: 'Storage modifiers', scope: ['storage.modifier'], settings: { foreground: c.keyword, fontStyle: 'italic' } },
  { name: 'Functions', scope: ['entity.name.function', 'support.function', 'variable.function', 'meta.function-call'], settings: { foreground: c.function } },
  { name: 'Built-in functions', scope: ['support.function.builtin', 'support.type.builtin', 'support.constant'], settings: { foreground: c.function } },
  { name: 'Strings', scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: c.string } },
  { name: 'Numbers', scope: ['constant.numeric'], settings: { foreground: c.number } },
  { name: 'Booleans and constants', scope: ['constant.language', 'constant.character', 'constant.other'], settings: { foreground: c.constant } },
  { name: 'Operators', scope: ['keyword.operator', 'keyword.operator.assignment', 'keyword.operator.arithmetic', 'keyword.operator.comparison'], settings: { foreground: c.operator, fontStyle: '' } },
  { name: 'Punctuation', scope: ['punctuation', 'punctuation.separator', 'punctuation.terminator'], settings: { foreground: c.punctuation } },
  { name: 'Class and type names', scope: ['entity.name.class', 'entity.name.type', 'support.class', 'support.type'], settings: { foreground: c.className } },
  { name: 'Tags', scope: ['entity.name.tag', 'punctuation.definition.tag'], settings: { foreground: c.tag } },
  { name: 'Attributes and properties', scope: ['entity.other.attribute-name', 'meta.object-literal.key', 'support.type.property-name'], settings: { foreground: c.attribute } },
  { name: 'Template placeholders', scope: ['variable.other.template', 'punctuation.definition.variable', 'meta.template.expression'], settings: { foreground: c.template, fontStyle: 'italic' } },
  { name: 'YAML keys and JSON keys', scope: ['entity.name.tag.yaml', 'support.type.property-name.json', 'meta.object-literal.key'], settings: { foreground: c.attribute } },
  { name: 'Invalid', scope: ['invalid', 'invalid.illegal'], settings: { foreground: c.invalid, fontStyle: 'underline' } },
];

const semanticTokenColors = (c) => ({
  namespace: c.purple, type: c.className, class: c.className, enum: c.purple,
  interface: c.blue, struct: c.className, typeParameter: c.purple,
  parameter: c.parameter, variable: c.variable, property: c.attribute,
  enumMember: c.constant, decorator: c.pink, function: c.function,
  method: c.function, macro: c.pink, comment: c.comment,
  '*.readonly': c.constant, '*.declaration': c.blue, ...c.semantic,
});

// Workbench roles (spec section 3.1). A palette may set any role; the defaults reproduce 1.2.1.
const withRoles = (c) => ({
  ...c,
  activeAccent: c.activeAccent ?? c.pink,
  activeLineNumber: c.activeLineNumber ?? c.blue,
  attention: c.attention ?? c.pink,
  onAttention: c.onAttention ?? c.onAccent,
  button: c.button ?? c.accent,
  onButton: c.onButton ?? c.onAccent,
  buttonHover: c.buttonHover ?? c.pink,
  listSelection: c.listSelection ?? c.accent,
  onListSelection: c.onListSelection ?? c.onAccent,
  focus: c.focus ?? c.blue,
  scrollHover: c.scrollHover ?? c.purple,
  success: c.success ?? c.cyan,
  untracked: c.untracked ?? c.purple,
  modified: c.modified ?? c.blue,
  deleted: c.deleted ?? c.pink,
  info: c.info ?? c.blue,
  inputBorder: c.inputBorder ?? c.border,
  terminalCursor: c.terminalCursor ?? c.pink,
});

// Keys only some palettes set; left out entirely when the role is undefined.
const optionalColors = (c) => Object.fromEntries(Object.entries({
  'tab.activeModifiedBorder': c.modifiedTabBorder,
  'tab.inactiveModifiedBorder': c.modifiedTabBorder,
  'statusBarItem.remoteBackground': c.remote,
  'statusBarItem.remoteForeground': c.onRemote,
  'statusBarItem.prominentForeground': c.onProminent,
  'debugIcon.breakpointForeground': c.breakpoint,
  'testing.iconPassed': c.testPassed,
  'testing.iconFailed': c.testFailed,
  'terminal.selectionBackground': c.terminalSelection,
  'debugIcon.breakpointCurrentStackframeForeground': c.currentStackframe,
  'debugIcon.breakpointStackframeForeground': c.stackframe,
  'quickInputList.focusBackground': c.quickInputFocus,
  'quickInputList.focusForeground': c.onQuickInputFocus,
  'quickInputList.focusIconForeground': c.onQuickInputFocus,
}).filter(([, value]) => value !== undefined));

const sharedColors = (c) => ({
  'editor.background': c.editor, 'editor.foreground': c.foreground,
  'editorPane.background': c.editor, 'editorGroupHeader.tabsBackground': c.panel,
  'editorGroupHeader.tabsBorder': c.border, 'editorGroup.border': c.border,
  'editorLineNumber.foreground': c.muted, 'editorLineNumber.activeForeground': c.activeLineNumber,
  'editorCursor.foreground': c.attention, 'editorCursor.background': c.editor,
  'editor.selectionBackground': c.selection, 'editor.inactiveSelectionBackground': c.selectionMuted,
  'editor.selectionHighlightBackground': c.selectionMuted, 'editor.wordHighlightBackground': c.selectionMuted,
  'editor.lineHighlightBackground': c.line, 'editorWhitespace.foreground': c.whitespace,
  'editorIndentGuide.background1': c.border, 'editorIndentGuide.activeBackground1': c.purple,
  'editorBracketMatch.background': c.selection, 'editorBracketMatch.border': c.focus,
  'editorOverviewRuler.border': c.border, 'editorOverviewRuler.modifiedForeground': c.modified,
  'editorOverviewRuler.addedForeground': c.success, 'editorOverviewRuler.deletedForeground': c.deleted,
  'editorOverviewRuler.errorForeground': c.error, 'editorOverviewRuler.warningForeground': c.warning,
  'editorError.foreground': c.error, 'editorWarning.foreground': c.warning,
  'editorInfo.foreground': c.info, 'editorHint.foreground': c.purple,
  'editorGutter.modifiedBackground': c.modified, 'editorGutter.addedBackground': c.success,
  'editorGutter.deletedBackground': c.deleted, 'editorGutter.commentRangeForeground': c.muted,
  'activityBar.background': c.panel, 'activityBar.foreground': c.foreground,
  'activityBar.inactiveForeground': c.muted, 'activityBar.activeBorder': c.activeAccent,
  'activityBarBadge.background': c.attention, 'activityBarBadge.foreground': c.onAttention,
  'sideBar.background': c.sidebar, 'sideBar.foreground': c.foreground,
  'sideBarTitle.foreground': c.activeAccent, 'sideBarSectionHeader.background': c.panel,
  'sideBarSectionHeader.foreground': c.foreground, 'sideBarSectionHeader.border': c.border,
  'statusBar.background': c.panel, 'statusBar.foreground': c.foreground,
  'statusBarItem.hoverBackground': c.selection, 'statusBarItem.prominentBackground': c.accent,
  'titleBar.activeBackground': c.panel, 'titleBar.activeForeground': c.foreground,
  'titleBar.inactiveBackground': c.sidebar, 'titleBar.inactiveForeground': c.muted,
  'tab.activeBackground': c.editor, 'tab.activeForeground': c.foreground,
  'tab.inactiveBackground': c.panel, 'tab.inactiveForeground': c.muted,
  'tab.activeBorderTop': c.activeAccent, 'tab.unfocusedActiveBorder': c.purple,
  'panel.background': c.panel, 'panel.border': c.border, 'panelTitle.activeBorder': c.activeAccent,
  'panelTitle.activeForeground': c.foreground, 'panelTitle.inactiveForeground': c.muted,
  'terminal.background': c.terminal, 'terminal.foreground': c.terminalForeground ?? c.foreground,
  'terminalCursor.foreground': c.terminalCursor, 'terminal.ansiBlack': c.terminalBlack ?? c.muted,
  'terminal.ansiRed': c.terminalRed ?? c.pink, 'terminal.ansiGreen': c.terminalGreen ?? c.cyan, 'terminal.ansiYellow': c.terminalYellow ?? c.warning,
  'terminal.ansiBlue': c.terminalBlue ?? c.blue, 'terminal.ansiMagenta': c.terminalMagenta ?? c.purple, 'terminal.ansiCyan': c.terminalCyan ?? c.cyan,
  'terminal.ansiWhite': c.terminalWhite ?? c.foreground, 'terminal.ansiBrightBlack': c.terminalBrightBlack ?? c.muted,
  'terminal.ansiBrightRed': c.terminalBrightRed ?? c.terminalRed ?? c.error, 'terminal.ansiBrightGreen': c.terminalBrightGreen ?? c.terminalGreen ?? c.cyan,
  'terminal.ansiBrightYellow': c.terminalBrightYellow ?? c.terminalYellow ?? c.warning, 'terminal.ansiBrightBlue': c.terminalBrightBlue ?? c.terminalBlue ?? c.blue,
  'terminal.ansiBrightMagenta': c.terminalBrightMagenta ?? c.terminalMagenta ?? c.pink, 'terminal.ansiBrightCyan': c.terminalBrightCyan ?? c.terminalCyan ?? c.cyan,
  'terminal.ansiBrightWhite': c.terminalBrightWhite ?? c.terminalWhite ?? c.foreground,
  'list.activeSelectionBackground': c.listSelection, 'list.activeSelectionForeground': c.onListSelection,
  'list.inactiveSelectionBackground': c.selection, 'list.inactiveSelectionForeground': c.foreground,
  'list.hoverBackground': c.selection, 'list.hoverForeground': c.foreground,
  'list.focusBackground': c.selection, 'list.focusForeground': c.foreground,
  'input.background': c.editor, 'input.foreground': c.foreground, 'input.border': c.inputBorder,
  'input.placeholderForeground': c.muted, 'focusBorder': c.focus,
  'button.background': c.button, 'button.foreground': c.onButton, 'button.hoverBackground': c.buttonHover,
  'badge.background': c.attention, 'badge.foreground': c.onAttention,
  'scrollbarSlider.background': c.selection, 'scrollbarSlider.hoverBackground': c.scrollHover,
  'scrollbarSlider.activeBackground': c.pink,
  'gitDecoration.modifiedResourceForeground': c.modified,
  'gitDecoration.addedResourceForeground': c.success, 'gitDecoration.deletedResourceForeground': c.deleted,
  'gitDecoration.untrackedResourceForeground': c.untracked, 'gitDecoration.conflictingResourceForeground': c.error,
  'gitDecoration.ignoredResourceForeground': c.muted,
  'diffEditor.insertedTextBackground': c.inserted, 'diffEditor.removedTextBackground': c.removed,
  'diffEditor.insertedLineBackground': c.insertedLine, 'diffEditor.removedLineBackground': c.removedLine,
  'minimap.background': c.sidebar, 'minimap.selectionHighlight': c.purple,
  'minimap.findMatchHighlight': c.pink, 'minimap.errorHighlight': c.error,
  'minimap.warningHighlight': c.warning, 'minimapGutter.addedBackground': c.success,
  'minimapGutter.modifiedBackground': c.modified, 'minimapGutter.deletedBackground': c.deleted,
  'notifications.background': c.panel, 'notifications.foreground': c.foreground,
  'notificationsErrorIcon.foreground': c.error, 'notificationsWarningIcon.foreground': c.warning,
  'notificationsInfoIcon.foreground': c.info, 'progressBar.background': c.activeAccent,
  'pickerGroup.border': c.purple, 'pickerGroup.foreground': c.activeAccent,
  'quickInput.background': c.panel, 'quickInput.foreground': c.foreground,
  'welcomePage.background': c.editor, 'welcomePage.progress.foreground': c.activeAccent,
  'notebook.cellBorderColor': c.border, 'notebook.cellEditorBackground': c.editor,
  'notebook.focusedCellBorder': c.activeAccent, 'notebookStatusSuccessIcon.foreground': c.success,
  'notebookStatusRunningIcon.foreground': c.blue, 'notebookStatusErrorIcon.foreground': c.error,
  'notebook.outputContainerBackgroundColor': c.panel, 'charts.blue': c.blue,
  'charts.purple': c.purple, 'charts.pink': c.pink, 'charts.foreground': c.foreground,
  'chat.background': c.editor, 'chat.requestBackground': c.panel,
  'chat.avatarBackground': c.accent, 'chat.avatarForeground': c.onAccent,
  'symbolIcon.functionForeground': c.function, 'symbolIcon.methodForeground': c.function,
  'symbolIcon.classForeground': c.className, 'symbolIcon.variableForeground': c.variable,
  'symbolIcon.propertyForeground': c.attribute, 'symbolIcon.keywordForeground': c.keyword,
});

const palettes = {
  candle: {
    name: 'WitchyNibbles Moonlit Candle', type: 'dark',
    c: {
      // Surfaces (section 3.1): Moonlit's editor/panel/sidebar, witchyterm text.
      editor: '#0D0916', panel: '#171025', sidebar: '#120C1F', terminal: '#0D0916',
      foreground: '#F3EAF7', muted: '#A99AB9', border: '#38234D', inputBorder: '#6E5A80',
      line: '#1D1230', whitespace: '#503762', selection: '#633B79AA', selectionMuted: '#45295C88',
      accent: '#FFD477', onAccent: '#0D0916', pink: '#FF67B7', purple: '#B99AFF', blue: '#77D9FF', cyan: '#74D7E8',
      warning: '#FFB86B', error: '#FF6B9F',
      inserted: '#267E9A55', removed: '#B32F6B55', insertedLine: '#267E9A33', removedLine: '#B32F6B33',
      // Workbench roles (section 3.1 table).
      activeAccent: '#FFD477', activeLineNumber: '#FFD477',
      attention: '#FF67B7', onAttention: '#0D0916', modifiedTabBorder: '#FF67B7',
      button: '#FFD477', onButton: '#0D0916', buttonHover: '#FFE3A3', onProminent: '#0D0916',
      remote: '#FFD477', onRemote: '#0D0916', breakpoint: '#FFD477',
      listSelection: '#633B79', onListSelection: '#F3EAF7', focus: '#B99AFF', scrollHover: '#B99AFF',
      success: '#74E8B8', untracked: '#74E8B8', testPassed: '#74E8B8',
      modified: '#FFB86B', deleted: '#FF6B9F', testFailed: '#FF6B9F', info: '#77D9FF',
      // Syntax (section 3.1 table).
      keyword: '#B99AFF', function: '#FFD477', string: '#74E8B8', className: '#77D9FF',
      number: '#FF9BD7', constant: '#FF9BD7', comment: '#A99AB9', doc: '#CFC3DB', variable: '#F3EAF7',
      operator: '#D3B4FF', punctuation: '#D3B4FF', tag: '#FF86C8', attribute: '#9CCBFF',
      parameter: '#F6B5DD', invalid: '#FF6B9F',
      currentStackframe: '#FFD477', stackframe: '#B99AFF',
      ...terminalFromScheme(witchyterm, 'full'),
      // Types are cyan; declarations must not override the role colours (VS Code scores `function` and `*.declaration` equally).
      semantic: {
        enum: '#77D9FF', typeParameter: '#77D9FF',
        'function.declaration': '#FFD477', 'method.declaration': '#FFD477',
        'variable.declaration': '#F3EAF7', 'parameter.declaration': '#F6B5DD', 'property.declaration': '#9CCBFF',
      },
    },
  },
  dark: {
    name: 'WitchyNibbles Moonlit', type: 'dark',
    c: { editor: '#0D0916', panel: '#171025', sidebar: '#120C1F', foreground: '#F8F2FF', onAccent: '#160A20', muted: '#A99AB9', border: '#38234D', line: '#1D1230', whitespace: '#503762', selection: '#633B79AA', selectionMuted: '#45295C88', accent: '#F04EAB', pink: '#FF67B7', purple: '#B99AFF', blue: '#77D9FF', cyan: '#74D7E8', warning: '#FFB86B', success: '#74E8B8', error: '#FF6B9F', inserted: '#267E9A55', removed: '#B32F6B55', insertedLine: '#267E9A33', removedLine: '#B32F6B33', parameter: '#F6B5DD', punctuation: '#D3B4FF', currentStackframe: '#FF67B7', stackframe: '#B99AFF', ...terminalFromScheme(witchyterm, 'full') } // author decision 2
  },
  light: {
    name: 'WitchyNibbles Daydream', type: 'light',
    c: { editor: '#FFF9FD', panel: '#F5ECFA', sidebar: '#F8F0FB', terminal: '#21152D', terminalBlack: '#DCC7E5', terminalBrightBlack: '#DCC7E5', terminalForeground: '#FFF9FD', terminalRed: '#FF78B8', terminalGreen: '#7DEBFF', terminalYellow: '#FFE38A', terminalBlue: '#77D9FF', terminalMagenta: '#D0B8FF', terminalCyan: '#7DEBFF', terminalWhite: '#FFFFFF', foreground: '#26172F', comment: '#6A4A76', variable: '#26172F', keyword: '#A21763', function: '#075B86', string: '#8A4D00', number: '#5C3196', constant: '#9A185C', operator: '#4F2B7E', className: '#075B86', tag: '#A21763', attribute: '#145C85', template: '#8D3D72', doc: '#6A4A76', invalid: '#B51E55', onAccent: '#FFFFFF', muted: '#735F7D', border: '#DCC7E5', line: '#F5E8F8', whitespace: '#C8A8D3', selection: '#E9B5D899', selectionMuted: '#E9B5D855', accent: '#B52776', pink: '#B52776', purple: '#7042B2', blue: '#176B9A', cyan: '#197F91', warning: '#9A5A00', success: '#0E7553', inputBorder: '#8E78A6', error: '#B51E55', inserted: '#197F9140', removed: '#B51E5540', insertedLine: '#197F9125', removedLine: '#B51E5525', parameter: '#8D3D72', punctuation: '#7042B2', currentStackframe: '#B52776', stackframe: '#7042B2' }
  },
  contrast: {
    name: 'WitchyNibbles Coven Contrast', type: 'hc-black',
    c: { editor: '#000000', panel: '#08050C', sidebar: '#000000', terminal: '#000000', foreground: '#FFFFFF', onAccent: '#000000', muted: '#D8C7FF', border: '#FFFFFF', line: '#171020', whitespace: '#FFFFFF', selection: '#5A1B45', selectionMuted: '#38224A', accent: '#FF67B7', pink: '#FF67B7', purple: '#D0B8FF', blue: '#77D9FF', cyan: '#7DEBFF', warning: '#FFE38A', error: '#FF78A8', inserted: '#173A48', removed: '#4A1930', insertedLine: '#173A48', removedLine: '#4A1930', parameter: '#FFC7EA', punctuation: '#D0B8FF', currentStackframe: '#FF67B7', stackframe: '#D0B8FF', quickInputFocus: '#FF67B7', onQuickInputFocus: '#000000' } // G29: 1.141 leaves the focused quick-input row transparent in high contrast
  }
};

export function createThemes() {
  return Object.values(palettes).map(({ name, type, c: raw }) => {
    // Keep palette authoring compact while guaranteeing every scope has a color.
    const c = withRoles({
      ...sharedTokenColors,
      invalid: '#FF6B9F',
      ...raw,
      function: raw.function ?? sharedTokenColors.function,
      variable: raw.variable ?? sharedTokenColors.variable,
      className: raw.className ?? sharedTokenColors.className,
      attribute: raw.attribute ?? sharedTokenColors.attribute,
      doc: raw.doc ?? sharedTokenColors.doc,
      parameter: raw.parameter ?? sharedTokenColors.template,
      punctuation: raw.punctuation ?? sharedTokenColors.punctuation,
    });
    const theme = { name, type, colors: { ...sharedColors(c), ...optionalColors(c) }, tokenColors: tokenColors(c), semanticHighlighting: true, semanticTokenColors: semanticTokenColors(c) };
    if (theme.tokenColors.some(({ settings }) => typeof settings.foreground !== 'string')) throw new Error(`${name}: token scope missing foreground`);
    const lowContrast = theme.tokenColors.find(({ settings }) => contrast(settings.foreground, c.editor) < 4.5);
    if (lowContrast) throw new Error(`${name}: ${lowContrast.name} token contrast is below 4.5:1`);
    return theme;
  });
}

export const themeFilenames = ['WitchyNibbles-color-theme-moonlit-candle.json', 'WitchyNibbles-color-theme-dark.json', 'WitchyNibbles-color-theme-light.json', 'WitchyNibbles-color-theme-high-contrast.json'];
