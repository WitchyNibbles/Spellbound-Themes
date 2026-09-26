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
  { name: 'Keywords', scope: ['keyword', 'storage', 'storage.type', 'storage.modifier'], settings: { foreground: c.keyword, fontStyle: 'bold' } },
  { name: 'Functions', scope: ['entity.name.function', 'support.function', 'variable.function', 'meta.function-call'], settings: { foreground: c.function, fontStyle: 'bold' } },
  { name: 'Built-in functions', scope: ['support.function.builtin', 'support.type.builtin', 'support.constant'], settings: { foreground: c.function } },
  { name: 'Strings', scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: c.string } },
  { name: 'Numbers', scope: ['constant.numeric'], settings: { foreground: c.number } },
  { name: 'Booleans and constants', scope: ['constant.language', 'constant.character', 'constant.other'], settings: { foreground: c.constant, fontStyle: 'bold' } },
  { name: 'Operators', scope: ['keyword.operator', 'keyword.operator.assignment', 'keyword.operator.arithmetic', 'keyword.operator.comparison'], settings: { foreground: c.operator } },
  { name: 'Punctuation', scope: ['punctuation', 'punctuation.separator', 'punctuation.terminator'], settings: { foreground: c.punctuation } },
  { name: 'Class and type names', scope: ['entity.name.class', 'entity.name.type', 'support.class', 'support.type'], settings: { foreground: c.className, fontStyle: 'bold' } },
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
  '*.readonly': c.constant, '*.declaration': c.blue,
});

const contrastRatio = (foreground, background) => {
  const channel = (hex, offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255;
  const luminance = (hex) => {
    const rgb = [channel(hex, 1), channel(hex, 3), channel(hex, 5)].map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const [a, b] = [luminance(foreground), luminance(background)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

const sharedColors = (c) => ({
  'editor.background': c.editor, 'editor.foreground': c.foreground,
  'editorPane.background': c.editor, 'editorGroupHeader.tabsBackground': c.panel,
  'editorGroupHeader.tabsBorder': c.border, 'editorGroup.border': c.border,
  'editorLineNumber.foreground': c.muted, 'editorLineNumber.activeForeground': c.blue,
  'editorCursor.foreground': c.pink, 'editorCursor.background': c.editor,
  'editor.selectionBackground': c.selection, 'editor.inactiveSelectionBackground': c.selectionMuted,
  'editor.selectionHighlightBackground': c.selectionMuted, 'editor.wordHighlightBackground': c.selectionMuted,
  'editor.lineHighlightBackground': c.line, 'editorWhitespace.foreground': c.whitespace,
  'editorIndentGuide.background1': c.border, 'editorIndentGuide.activeBackground1': c.purple,
  'editorBracketMatch.background': c.selection, 'editorBracketMatch.border': c.blue,
  'editorOverviewRuler.border': c.border, 'editorOverviewRuler.modifiedForeground': c.blue,
  'editorOverviewRuler.addedForeground': c.cyan, 'editorOverviewRuler.deletedForeground': c.pink,
  'editorOverviewRuler.errorForeground': c.error, 'editorOverviewRuler.warningForeground': c.warning,
  'editorError.foreground': c.error, 'editorWarning.foreground': c.warning,
  'editorInfo.foreground': c.blue, 'editorHint.foreground': c.purple,
  'editorGutter.modifiedBackground': c.blue, 'editorGutter.addedBackground': c.cyan,
  'editorGutter.deletedBackground': c.pink, 'editorGutter.commentRangeForeground': c.muted,
  'activityBar.background': c.panel, 'activityBar.foreground': c.foreground,
  'activityBar.inactiveForeground': c.muted, 'activityBar.activeBorder': c.pink,
  'activityBarBadge.background': c.pink, 'activityBarBadge.foreground': c.onAccent,
  'sideBar.background': c.sidebar, 'sideBar.foreground': c.foreground,
  'sideBarTitle.foreground': c.pink, 'sideBarSectionHeader.background': c.panel,
  'sideBarSectionHeader.foreground': c.foreground, 'sideBarSectionHeader.border': c.border,
  'statusBar.background': c.panel, 'statusBar.foreground': c.foreground,
  'statusBarItem.hoverBackground': c.selection, 'statusBarItem.prominentBackground': c.accent,
  'titleBar.activeBackground': c.panel, 'titleBar.activeForeground': c.foreground,
  'titleBar.inactiveBackground': c.sidebar, 'titleBar.inactiveForeground': c.muted,
  'tab.activeBackground': c.editor, 'tab.activeForeground': c.foreground,
  'tab.inactiveBackground': c.panel, 'tab.inactiveForeground': c.muted,
  'tab.activeBorderTop': c.pink, 'tab.unfocusedActiveBorder': c.purple,
  'panel.background': c.panel, 'panel.border': c.border, 'panelTitle.activeBorder': c.pink,
  'panelTitle.activeForeground': c.foreground, 'panelTitle.inactiveForeground': c.muted,
  'terminal.background': c.terminal, 'terminal.foreground': c.terminalForeground ?? c.foreground,
  'terminalCursor.foreground': c.pink, 'terminal.ansiBlack': c.terminalBlack ?? c.muted,
  'terminal.ansiRed': c.terminalRed ?? c.pink, 'terminal.ansiGreen': c.terminalGreen ?? c.cyan, 'terminal.ansiYellow': c.terminalYellow ?? c.warning,
  'terminal.ansiBlue': c.terminalBlue ?? c.blue, 'terminal.ansiMagenta': c.terminalMagenta ?? c.purple, 'terminal.ansiCyan': c.terminalCyan ?? c.cyan,
  'terminal.ansiWhite': c.terminalWhite ?? c.foreground, 'terminal.ansiBrightBlack': c.terminalBrightBlack ?? c.muted,
  'terminal.ansiBrightRed': c.terminalRed ?? c.error, 'terminal.ansiBrightGreen': c.terminalGreen ?? c.cyan,
  'terminal.ansiBrightYellow': c.terminalYellow ?? c.warning, 'terminal.ansiBrightBlue': c.terminalBlue ?? c.blue,
  'terminal.ansiBrightMagenta': c.terminalMagenta ?? c.pink, 'terminal.ansiBrightCyan': c.terminalCyan ?? c.cyan,
  'terminal.ansiBrightWhite': c.terminalBrightWhite ?? c.terminalWhite ?? c.foreground,
  'list.activeSelectionBackground': c.accent, 'list.activeSelectionForeground': c.onAccent,
  'list.inactiveSelectionBackground': c.selection, 'list.inactiveSelectionForeground': c.foreground,
  'list.hoverBackground': c.selection, 'list.hoverForeground': c.foreground,
  'list.focusBackground': c.selection, 'list.focusForeground': c.foreground,
  'input.background': c.editor, 'input.foreground': c.foreground, 'input.border': c.border,
  'input.placeholderForeground': c.muted, 'focusBorder': c.blue,
  'button.background': c.accent, 'button.foreground': c.onAccent, 'button.hoverBackground': c.pink,
  'badge.background': c.pink, 'badge.foreground': c.onAccent,
  'scrollbarSlider.background': c.selection, 'scrollbarSlider.hoverBackground': c.purple,
  'scrollbarSlider.activeBackground': c.pink,
  'gitDecoration.modifiedResourceForeground': c.blue,
  'gitDecoration.addedResourceForeground': c.cyan, 'gitDecoration.deletedResourceForeground': c.pink,
  'gitDecoration.untrackedResourceForeground': c.purple, 'gitDecoration.conflictingResourceForeground': c.error,
  'gitDecoration.ignoredResourceForeground': c.muted,
  'diffEditor.insertedTextBackground': c.inserted, 'diffEditor.removedTextBackground': c.removed,
  'diffEditor.insertedLineBackground': c.insertedLine, 'diffEditor.removedLineBackground': c.removedLine,
  'minimap.background': c.sidebar, 'minimap.selectionHighlight': c.purple,
  'minimap.findMatchHighlight': c.pink, 'minimap.errorHighlight': c.error,
  'minimap.warningHighlight': c.warning, 'minimapGutter.addedBackground': c.cyan,
  'minimapGutter.modifiedBackground': c.blue, 'minimapGutter.deletedBackground': c.pink,
  'notifications.background': c.panel, 'notifications.foreground': c.foreground,
  'notificationsErrorIcon.foreground': c.error, 'notificationsWarningIcon.foreground': c.warning,
  'notificationsInfoIcon.foreground': c.blue, 'progressBar.background': c.pink,
  'pickerGroup.border': c.purple, 'pickerGroup.foreground': c.pink,
  'quickInput.background': c.panel, 'quickInput.foreground': c.foreground,
  'welcomePage.background': c.editor, 'welcomePage.progress.foreground': c.pink,
  'notebook.cellBorderColor': c.border, 'notebook.cellEditorBackground': c.editor,
  'notebook.focusedCellBorder': c.pink, 'notebookStatusSuccessIcon.foreground': c.cyan,
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
  dark: {
    name: 'WitchyNibbles Moonlit', type: 'dark',
    c: { editor: '#0D0916', panel: '#171025', sidebar: '#120C1F', terminal: '#08060D', foreground: '#F8F2FF', onAccent: '#160A20', muted: '#A99AB9', border: '#38234D', line: '#1D1230', whitespace: '#503762', selection: '#633B79AA', selectionMuted: '#45295C88', accent: '#F04EAB', pink: '#FF67B7', purple: '#B99AFF', blue: '#77D9FF', cyan: '#74D7E8', warning: '#FFD477', error: '#FF6B9F', inserted: '#267E9A55', removed: '#B32F6B55', insertedLine: '#267E9A33', removedLine: '#B32F6B33', parameter: '#F6B5DD', punctuation: '#D3B4FF' }
  },
  light: {
    name: 'WitchyNibbles Daydream', type: 'light',
    c: { editor: '#FFF9FD', panel: '#F5ECFA', sidebar: '#F8F0FB', terminal: '#21152D', terminalBlack: '#DCC7E5', terminalBrightBlack: '#DCC7E5', terminalForeground: '#FFF9FD', terminalRed: '#FF78B8', terminalGreen: '#7DEBFF', terminalYellow: '#FFE38A', terminalBlue: '#77D9FF', terminalMagenta: '#D0B8FF', terminalCyan: '#7DEBFF', terminalWhite: '#FFFFFF', foreground: '#26172F', comment: '#6A4A76', variable: '#26172F', keyword: '#A21763', function: '#075B86', string: '#8A4D00', number: '#5C3196', constant: '#9A185C', operator: '#4F2B7E', className: '#075B86', tag: '#A21763', attribute: '#145C85', template: '#8D3D72', doc: '#6A4A76', invalid: '#B51E55', onAccent: '#FFFFFF', muted: '#735F7D', border: '#DCC7E5', line: '#F5E8F8', whitespace: '#C8A8D3', selection: '#E9B5D899', selectionMuted: '#E9B5D855', accent: '#B52776', pink: '#B52776', purple: '#7042B2', blue: '#176B9A', cyan: '#197F91', warning: '#9A5A00', error: '#B51E55', inserted: '#197F9140', removed: '#B51E5540', insertedLine: '#197F9125', removedLine: '#B51E5525', parameter: '#8D3D72', punctuation: '#7042B2' }
  },
  contrast: {
    name: 'WitchyNibbles Coven Contrast', type: 'hc-black',
    c: { editor: '#000000', panel: '#08050C', sidebar: '#000000', terminal: '#000000', foreground: '#FFFFFF', onAccent: '#000000', muted: '#D8C7FF', border: '#FFFFFF', line: '#171020', whitespace: '#FFFFFF', selection: '#5A1B45', selectionMuted: '#38224A', accent: '#FF67B7', pink: '#FF67B7', purple: '#D0B8FF', blue: '#77D9FF', cyan: '#7DEBFF', warning: '#FFE38A', error: '#FF78A8', inserted: '#173A48', removed: '#4A1930', insertedLine: '#173A48', removedLine: '#4A1930', parameter: '#FFC7EA', punctuation: '#D0B8FF' }
  }
};

export function createThemes() {
  return Object.values(palettes).map(({ name, type, c: raw }) => {
    // Keep palette authoring compact while guaranteeing every scope has a color.
    const c = {
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
    };
    const theme = { name, type, colors: sharedColors(c), tokenColors: tokenColors(c), semanticHighlighting: true, semanticTokenColors: semanticTokenColors(c) };
    if (theme.tokenColors.some(({ settings }) => typeof settings.foreground !== 'string')) throw new Error(`${name}: token scope missing foreground`);
    const lowContrast = theme.tokenColors.find(({ settings }) => contrastRatio(settings.foreground, c.editor) < 4.5);
    if (lowContrast) throw new Error(`${name}: ${lowContrast.name} token contrast is below 4.5:1`);
    return theme;
  });
}

export const themeFilenames = ['WitchyNibbles-color-theme-dark.json', 'WitchyNibbles-color-theme-light.json', 'WitchyNibbles-color-theme-high-contrast.json'];
