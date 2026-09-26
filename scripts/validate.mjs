import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const errors = [];

const exists = (relative) => fs.existsSync(path.join(root, relative));
const fail = (message) => errors.push(message);

const productIconIds = [
  'activity-bar-left', 'activity-bar-right', 'explorer-view-icon', 'search-view-icon',
  'source-control-view-icon', 'debug-alt', 'extensions-view-icon', 'settings-gear',
  'account', 'terminal-view-icon', 'split-horizontal', 'split-vertical', 'close', 'check',
  'add', 'remove', 'search', 'refresh', 'sync', 'go-to-file', 'copy', 'edit', 'save', 'trash',
  'filter', 'ellipsis', 'menu', 'home', 'layout-sidebar-left', 'layout-sidebar-right', 'layout-panel', 'run',
  'debug-start', 'debug-stop', 'debug-pause', 'debug-continue', 'debug-step-over',
  'debug-step-into', 'debug-step-out', 'error', 'warning', 'info', 'symbol-class',
  'symbol-method', 'symbol-property', 'symbol-variable', 'folder', 'file',
];
const productFontId = 'witchynibbles-product-icons';
const productFontFamily = 'WitchyNibbles Product Icons';
const productFontFile = 'icons/witchynibbles-product-icons.woff';
const sourceDir = path.join(root, 'icons', 'product-src');
const puaFor = (index) => `\\${(0xE000 + index).toString(16).toUpperCase()}`;
const themeContributions = packageJson.contributes?.themes ?? [];
if (themeContributions.length !== 3) fail(`Expected 3 color themes, found ${themeContributions.length}`);

for (const contribution of packageJson.contributes?.themes ?? []) {
  if (!exists(contribution.path.replace(/^\.\//, ''))) fail(`Missing theme contribution: ${contribution.path}`);
}
for (const contribution of packageJson.contributes?.iconThemes ?? []) {
  if (!exists(contribution.path.replace(/^\.\//, ''))) fail(`Missing icon theme contribution: ${contribution.path}`);
}
const productIconContributions = packageJson.contributes?.productIconThemes ?? [];
if (productIconContributions.length !== 1) {
  fail(`Expected 1 product icon theme contribution, found ${productIconContributions.length}`);
}
for (const contribution of productIconContributions) {
  const contributionPath = contribution.path?.replace(/^\.\//, '');
  if (!contributionPath || !exists(contributionPath)) {
    fail(`Missing product icon theme contribution: ${contribution.path}`);
    continue;
  }

  let productTheme;
  try {
    productTheme = JSON.parse(fs.readFileSync(path.join(root, contributionPath), 'utf8'));
  } catch (error) {
    fail(`${contributionPath} is invalid JSON: ${error.message}`);
    continue;
  }

  const fonts = Array.isArray(productTheme.fonts) ? productTheme.fonts : [];
  if (fonts.length !== 1) fail(`${contributionPath} must declare exactly one custom product icon font`);
  const font = fonts[0];
  if (!font || font.id !== productFontId) fail(`${contributionPath} must use font id ${productFontId}`);
  if (!font || font.family !== productFontFamily) fail(`${contributionPath} must use font family ${productFontFamily}`);
  const sources = Array.isArray(font?.src) ? font.src : [];
  if (sources.length !== 1 || sources[0]?.format !== 'woff' || sources[0]?.path !== './witchynibbles-product-icons.woff') {
    fail(`${contributionPath} must reference ./witchynibbles-product-icons.woff as WOFF`);
  }
  const fontPath = path.join(root, productFontFile);
  if (!fs.existsSync(fontPath)) {
    fail(`Missing custom product icon font: ${productFontFile}`);
  } else {
    const bytes = fs.readFileSync(fontPath);
    if (bytes.subarray(0, 4).toString('ascii') !== 'wOFF') fail(`${productFontFile} is not a valid WOFF file`);
    const oldFont = path.join(root, 'icons', 'witchy-codicons.woff');
    if (fs.existsSync(oldFont) && crypto.createHash('sha256').update(bytes).digest('hex') === crypto.createHash('sha256').update(fs.readFileSync(oldFont)).digest('hex')) {
      fail(`${productFontFile} is byte-identical to the old Codicons font`);
    }
  }

  const definitions = productTheme.iconDefinitions;
  const definitionEntries = definitions && typeof definitions === 'object' ? Object.entries(definitions) : [];
  const actualIds = definitionEntries.map(([id]) => id).sort();
  const expectedIds = [...productIconIds].sort();
  if (definitionEntries.length !== productIconIds.length || actualIds.some((id, index) => id !== expectedIds[index])) {
    fail(`${contributionPath} must define exactly these ${productIconIds.length} product icons`);
  }
  const usedCharacters = new Set();
  for (const [id, definition] of definitionEntries) {
    const expected = productIconIds.includes(id) ? puaFor(productIconIds.indexOf(id)) : null;
    if (!definition || typeof definition !== 'object') { fail(`${contributionPath} icon ${id} has an invalid definition`); continue; }
    if (definition.fontId !== productFontId) fail(`${contributionPath} icon ${id} must reference ${productFontId}`);
    if (typeof definition.fontCharacter !== 'string' || !/^\\[e-f][0-9a-f]{3,5}$/i.test(definition.fontCharacter)) {
      fail(`${contributionPath} icon ${id} must use a private-use CSS codepoint`);
    } else {
      if (usedCharacters.has(definition.fontCharacter)) fail(`${contributionPath} reuses fontCharacter ${definition.fontCharacter}`);
      usedCharacters.add(definition.fontCharacter);
      if (expected && definition.fontCharacter !== expected) fail(`${contributionPath} icon ${id} must use stable codepoint ${expected}`);
    }
  }

  if (!fs.existsSync(sourceDir)) fail('Missing product icon source directory: icons/product-src');
  for (const id of productIconIds) {
    const svgPath = path.join(sourceDir, `${id}.svg`);
    if (!fs.existsSync(svgPath)) { fail(`Missing product icon SVG: icons/product-src/${id}.svg`); continue; }
    const svg = fs.readFileSync(svgPath, 'utf8');
    if (!/^<svg\b[^>]*\bviewBox=["']0 0 16 16["'][^>]*>/i.test(svg)) fail(`${id}.svg must use viewBox 0 0 16 16`);
    if (!/<path\b/i.test(svg) || !/\bfill=(?:["'][^"']+["']|[^\s>]+)/i.test(svg)) fail(`${id}.svg must contain filled path data`);
    if (/<text\b|<image\b|<use\b|<foreignObject\b|<object\b|<script\b|url\(|data:image|stroke\s*=/i.test(svg)) fail(`${id}.svg contains forbidden text, external, raster, or stroke content`);
    if (!/\bd="[^"']+"/i.test(svg)) fail(`${id}.svg contains no path contour`);
  }

  // If a font parser is installed, verify every mapped glyph has contours. The
  // validator remains usable in the lean packaging environment where it is absent.
  try {
    const require = createRequire(import.meta.url);
    const fontkit = require('fontkit');
    if (fs.existsSync(fontPath)) {
      const parsed = fontkit.openSync(fontPath);
      for (const [id, definition] of definitionEntries) {
        const codePoint = parseInt(definition.fontCharacter.slice(1), 16);
        const glyph = parsed.glyphForCodePoint(codePoint);
        if (!glyph?.path?.commands?.length) fail(`${contributionPath} icon ${id} maps to an empty glyph contour`);
      }
    }
  } catch (error) {
    // The parser is optional in lean packaging environments. Parsing errors are not.
    const missingFontkit = error?.code === 'MODULE_NOT_FOUND'
      && /Cannot find module ['"]fontkit['"]/.test(error.message);
    if (!missingFontkit) fail(`Unable to inspect product icon font: ${error.message}`);
  }
}
if (packageJson.icon && !exists(packageJson.icon)) fail(`Missing extension icon: ${packageJson.icon}`);
if (packageJson.icon && exists(packageJson.icon)) {
  const icon = fs.readFileSync(path.join(root, packageJson.icon));
  if (icon.readUInt32BE(0) !== 0x89504e47 || icon.readUInt32BE(16) < 128 || icon.readUInt32BE(20) < 128) fail('Extension icon must be a PNG at least 128x128');
}

const requiredSemantic = ['namespace', 'type', 'class', 'enum', 'interface', 'struct', 'typeParameter', 'parameter', 'variable', 'property', 'enumMember', 'decorator', 'function', 'method', 'macro', 'comment', '*.readonly', '*.declaration'];

const hexes = (value) => value.match(/#[0-9a-f]{6}(?:[0-9a-f]{2})?/gi) ?? [];
const rgba = (hex) => [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255).concat(hex.length >= 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1);
const composite = (foreground, background) => {
  const fg = rgba(foreground); const bg = rgba(background); const alpha = fg[3] + bg[3] * (1 - fg[3]);
  return fg.slice(0, 3).map((channel, index) => ((channel * fg[3]) + (bg[index] * bg[3] * (1 - fg[3]))) / alpha);
};
const luminance = (hex) => {
  const rgb = (Array.isArray(hex) ? hex : rgba(hex)).slice(0, 3);
  return rgb.reduce((sum, channel, index) => {
    const linear = channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);
};
const contrast = (first, second) => {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};
const compositedContrast = (foreground, background, surface) => contrast(composite(foreground, surface), composite(background, surface));

const themesDir = path.join(root, 'themes');
if (fs.existsSync(themesDir)) {
  for (const file of fs.readdirSync(themesDir).filter((name) => name.endsWith('.json'))) {
    const relative = path.join('themes', file);
    let theme;
    try {
      theme = JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
    } catch (error) {
      fail(`${relative} is invalid JSON: ${error.message}`);
      continue;
    }
    const source = JSON.stringify(theme);
    for (const color of hexes(source)) {
      const rgb = [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16));
      const max = Math.max(...rgb); const min = Math.min(...rgb);
      const hue = max === min ? 0 : ((max === rgb[0] ? (rgb[1] - rgb[2]) / (max - min) : max === rgb[1] ? 2 + (rgb[2] - rgb[0]) / (max - min) : 4 + (rgb[0] - rgb[1]) / (max - min)) * 60 + 360) % 360;
      if (hue >= 75 && hue <= 165 && max - min > 24 && max > 95) fail(`${relative} contains a green accent: ${color}`);
    }
    const colors = theme.colors ?? {};
    if (Object.keys(colors).some((key) => /^gitDecoration\..*ResourceBackground$/.test(key))) fail(`${relative} contains unsupported git decoration background key`);
    if (theme.semanticHighlighting !== true) fail(`${relative} must enable semantic highlighting`);
    const semanticKeys = Object.keys(theme.semanticTokenColors ?? {});
    if (semanticKeys.length < requiredSemantic.length || requiredSemantic.some((key) => !semanticKeys.includes(key))) fail(`${relative} must define all ${requiredSemantic.length} required semantic token keys`);
    for (const token of theme.tokenColors ?? []) if (!token.settings?.foreground) fail(`${relative} token ${token.name ?? '<unnamed>'} has no foreground`);
    for (const [foreground, background, label] of [['editor.foreground', 'editor.background', 'editor'], ['sideBar.foreground', 'sideBar.background', 'sidebar'], ['terminal.foreground', 'terminal.background', 'terminal']]) {
      if (colors[foreground] && colors[background]) {
        const ratio = contrast(colors[foreground], colors[background]);
        if (ratio < 4.5) fail(`${relative} ${label} contrast is ${ratio.toFixed(2)}:1`);
      }
    }
    const terminalAnsiColors = [
      'terminal.ansiBlack', 'terminal.ansiRed', 'terminal.ansiGreen', 'terminal.ansiYellow',
      'terminal.ansiBlue', 'terminal.ansiMagenta', 'terminal.ansiCyan', 'terminal.ansiWhite',
      'terminal.ansiBrightBlack', 'terminal.ansiBrightRed', 'terminal.ansiBrightGreen',
      'terminal.ansiBrightYellow', 'terminal.ansiBrightBlue', 'terminal.ansiBrightMagenta',
      'terminal.ansiBrightCyan', 'terminal.ansiBrightWhite',
    ];
    for (const ansiColor of terminalAnsiColors) {
      if (colors[ansiColor] && colors['terminal.background']) {
        const ratio = contrast(colors[ansiColor], colors['terminal.background']);
        if (ratio < 4.5) fail(`${relative} ${ansiColor} contrast is ${ratio.toFixed(2)}:1 against terminal background`);
      }
    }
    const statePairs = [
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
    for (const [foreground, background, surface, label] of statePairs) {
      if (colors[foreground] && colors[background] && colors[surface]) {
        const ratio = compositedContrast(colors[foreground], colors[background], colors[surface]);
        if (ratio < 4.5) fail(`${relative} ${label} contrast is ${ratio.toFixed(2)}:1 after alpha compositing`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('✓ WitchyNibbles package validation passed');
}
