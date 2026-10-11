// Stage `file-icons:pipeline` (spec 8, F3): the rules every file-icon source obeys.
import { isDeepStrictEqual } from 'node:util';
import { contrast, hexes } from '../../../src/color.mjs';
import { THEME_SETS, themeBackdrops } from '../file-icon-backdrops.mjs';
import { ROLES, SET_DIRS } from '../file-icon-palette.mjs';
import { SIDEBARS } from '../file-icon-requirements.mjs';
import { buildFileIconTheme, mapProblems } from '../file-icons-build.mjs';
import { offGridPoints, parseGlyphSvg, windingProblems } from '../svg-geometry.mjs';

const STAGE = 'file-icons:pipeline';
const SET_OF_DIR = Object.fromEntries(Object.entries(SET_DIRS).map(([set, dir]) => [dir, set]));
// 'icons/file-icons/<dir>/<drawing>.svg' -> [set, drawing]
const setAndDrawing = (file) => {
  const [, dir, name] = file.match(/^icons\/file-icons\/([^/]+)\/([^/]+)\.svg$/) ?? [];
  return [SET_OF_DIR[dir], name];
};
const coloursOf = (svg) => [...new Set(hexes(svg).map((hex) => hex.slice(0, 7).toUpperCase()))];

const attributeNames = (tag) => [...tag.matchAll(/([\w:-]+)\s*=/g)].map((match) => match[1]);

// Section 6.2 and 8: viewBox 0 0 16 16 with no size, only <svg> and <path>, <path fill="{role}" d="…"> and nothing
// else (so no opacity, fill-opacity, stroke, transform, fill-rule, style or gradient), no hex anywhere, and real holes.
// Holes are checked per part: each <path> is its own fill, and an accent painted over another part is not a hole.
export function fileGlyphProblems(svg) {
  const errors = [];
  const warnings = [];
  const parsed = parseGlyphSvg(svg);
  const svgTag = svg.match(/<svg\b([^>]*)>/i)?.[1] ?? '';
  if (parsed.viewBox !== '0 0 16 16') errors.push('viewBox must be "0 0 16 16"');
  if (parsed.width !== undefined || parsed.height !== undefined) errors.push('must not set width or height on <svg>');
  const extraSvg = attributeNames(svgTag).filter((name) => !['xmlns', 'viewBox'].includes(name));
  if (extraSvg.length) errors.push(`<svg> takes only xmlns and viewBox (found ${extraSvg.join(', ')})`);
  const others = [...new Set(parsed.elements.filter((name) => name !== 'svg' && name !== 'path'))];
  if (others.length) errors.push(`only <svg> and <path> elements are allowed (found ${others.join(', ')})`);
  const pathTags = [...svg.matchAll(/<path\b([^>]*?)\/?>/gi)].map((match) => match[1]);
  if (!pathTags.length) errors.push('contains no <path>');
  const extraPath = [...new Set(pathTags.flatMap((tag) => attributeNames(tag).filter((name) => !['fill', 'd'].includes(name))))];
  if (extraPath.length) errors.push(`<path> takes only fill and d (found ${extraPath.join(', ')})`);
  parsed.paths.forEach(({ fill, d }, index) => {
    const role = fill?.match(/^\{(\w+)\}$/)?.[1];
    if (!ROLES.includes(role)) errors.push(`part ${index + 1} fill "${fill}" is not a role token`);
    if (!d.trim()) errors.push(`part ${index + 1} has no path data`);
  });
  const hexes = [...new Set(svg.match(/#[0-9a-f]{3,8}\b/gi) ?? [])];
  if (hexes.length) errors.push(`uses hex colours (${hexes.join(', ')}); paint with role tokens`);
  try {
    parsed.paths.forEach(({ fill, d }, index) => {
      for (const problem of windingProblems([d])) errors.push(`part ${index + 1} (${fill}): ${problem}`);
    });
    const off = [...new Set(parsed.paths.flatMap(({ d }) => offGridPoints(d)).map(([x, y]) => `(${+x.toFixed(3)}, ${+y.toFixed(3)})`))];
    if (off.length) warnings.push(`straight-segment points off the whole/half grid: ${off.slice(0, 6).join(' ')}${off.length > 6 ? ' …' : ''}`);
  } catch (error) {
    errors.push(`path data could not be parsed: ${error.message}`);
  }
  return { errors, warnings };
}

// Spec 8 (F3), enforced from gate 5. map: icons/file-icon-map.json; sources: drawing -> icons/file-src/ text; theme: the
// committed icons/file-icon-theme.json; built: every committed SVG under icons/file-icons/, by repo-relative path.
export function checkFileIconPipeline({ map, sources, theme, built }, report) {
  const fail = (message) => report.fail(STAGE, message);
  for (const [name, svg] of Object.entries(sources)) {
    const { errors, warnings } = fileGlyphProblems(svg);
    for (const error of errors) fail(`icons/file-src/${name}.svg ${error}`);
    for (const warning of warnings) report.warn(`icons/file-src/${name}.svg ${warning}`);
  }
  if (theme.showLanguageModeIcons !== false) fail('icons/file-icon-theme.json must set "showLanguageModeIcons": false');
  const problems = mapProblems(map, sources);
  for (const problem of problems) fail(`icons/file-icon-map.json: ${problem}`);
  if (!problems.length) {
    let fresh;
    try {
      fresh = buildFileIconTheme(map, sources);
    } catch (error) {
      fail(`the file icons cannot be built: ${error.message}`);
    }
    if (fresh) {
      if (!isDeepStrictEqual(theme, fresh.theme)) fail('icons/file-icon-theme.json differs from a fresh build (run npm run build:file-icons)');
      for (const [file, svg] of Object.entries(fresh.files)) {
        if (!(file in built)) fail(`${file} is missing (run npm run build:file-icons)`);
        else if (built[file] !== svg) fail(`${file} differs from a fresh build (run npm run build:file-icons)`);
      }
      for (const file of Object.keys(built)) if (!(file in fresh.files)) fail(`${file} is not produced by the build`);
    }
  }
  for (const [file, svg] of Object.entries(built)) {
    const [set, name] = setAndDrawing(file);
    if (!set) continue;
    for (const colour of coloursOf(svg)) {
      const ratio = contrast(colour, SIDEBARS[set]);
      if (ratio < 3) fail(`${set} icon ${name} uses ${colour} at ${ratio.toFixed(2)}:1 on ${SIDEBARS[set]} (needs 3:1)`);
    }
  }
}

// F9 (spec 8): a soft warning for each resolved colour under 3:1 on a color theme's active selection or focused
// quick-input row, composited over its side bar. colorThemes: [{ label, uiTheme, colors }] from contributes.themes, so
// the dark set is checked against both Moonlit Candle and Moonlit.
export function checkSelectionContrast({ built, colorThemes }, report) {
  for (const { label, uiTheme, colors } of colorThemes) {
    const set = THEME_SETS[uiTheme];
    const { selection, quickInputFocus } = themeBackdrops(colors);
    const backdrops = selection === quickInputFocus
      ? [['list.activeSelectionBackground and quickInputList.focusBackground', selection]]
      : [['list.activeSelectionBackground', selection], ['quickInputList.focusBackground', quickInputFocus]];
    const users = {};
    for (const [file, svg] of Object.entries(built)) {
      const [fileSet, name] = setAndDrawing(file);
      if (fileSet === set) for (const colour of coloursOf(svg)) (users[colour] ??= []).push(name);
    }
    for (const [keys, backdrop] of backdrops) {
      for (const [colour, names] of Object.entries(users)) {
        const ratio = contrast(colour, backdrop);
        if (ratio < 3) report.warn(`F9: ${label} ${keys} ${backdrop}: ${set} ${colour} (${names.sort().join(', ')}) at ${ratio.toFixed(2)}:1 (under 3:1)`);
      }
    }
  }
}
