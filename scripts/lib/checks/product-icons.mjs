import { createRequire } from 'node:module';
import { FONT_STREAM_OPTIONS, FONT_UNITS_PER_GRID_UNIT } from '../product-font.mjs';
import { PRODUCT_FONT, iconDefinitionsFor, validateMap } from '../product-icon-map.mjs';
import { offGridPoints, parseGlyphSvg, pathBounds, windingProblems } from '../svg-geometry.mjs';

const fontkit = createRequire(import.meta.url)('fontkit');
const PIPELINE = 'product-pipeline';
const BOX_TOLERANCE = 2; // font units; svg2ttf rounds to integers and approximates cubics with quadratics

export function checkProductIconContribution({ packageJson, readJson, readFile, exists }, report) {
  const fail = (message) => report.fail('base', message);
  const contributions = packageJson.contributes?.productIconThemes ?? [];
  if (contributions.length !== 1) { fail(`Expected 1 product icon theme contribution, found ${contributions.length}`); return null; }
  const relative = contributions[0].path?.replace(/^\.\//, '');
  if (!relative || !exists(relative)) { fail(`Missing product icon theme contribution: ${contributions[0].path}`); return null; }
  let theme;
  try { theme = readJson(relative); } catch (error) { fail(`${relative} is invalid JSON: ${error.message}`); return null; }
  const fonts = Array.isArray(theme.fonts) ? theme.fonts : [];
  const font = fonts[0];
  if (fonts.length !== 1) fail(`${relative} must declare exactly one custom product icon font`);
  if (font?.id !== PRODUCT_FONT.id) fail(`${relative} must use font id ${PRODUCT_FONT.id}`);
  if (font?.family !== PRODUCT_FONT.family) fail(`${relative} must use font family ${PRODUCT_FONT.family}`);
  const sources = Array.isArray(font?.src) ? font.src : [];
  if (sources.length !== 1 || sources[0]?.format !== 'woff' || sources[0]?.path !== PRODUCT_FONT.themeSrc) fail(`${relative} must reference ${PRODUCT_FONT.themeSrc} as WOFF`);
  if (!exists(PRODUCT_FONT.file)) fail(`Missing custom product icon font: ${PRODUCT_FONT.file}`);
  else if (readFile(PRODUCT_FONT.file).subarray(0, 4).toString('ascii') !== 'wOFF') fail(`${PRODUCT_FONT.file} is not a valid WOFF file`);
  for (const [id, definition] of Object.entries(theme.iconDefinitions ?? {})) {
    if (definition?.fontId !== PRODUCT_FONT.id) fail(`${relative} icon ${id} must reference ${PRODUCT_FONT.id}`);
    if (typeof definition?.fontCharacter !== 'string' || !/^\\E[0-9A-F]{3}$/.test(definition.fontCharacter)) fail(`${relative} icon ${id} must use a private-use codepoint such as \\E100`);
  }
  return theme;
}

// Superset rule: extra mappings never fail; each missing pinned key fails its batch stage.
export function checkPinnedCoverage({ pinned, theme }, report) {
  const defined = theme?.iconDefinitions ?? {};
  for (const [id, { batch }] of Object.entries(pinned.ids)) {
    if (!(id in defined)) report.fail(`product-batch:${batch}`, `product icon theme does not map ${id} (batch ${batch})`);
  }
}

export function checkProductIconMap({ map, sourceFiles, theme }, report) {
  const errors = validateMap(map, { sourceFiles });
  for (const error of errors) report.fail(PIPELINE, error);
  if (errors.length) return false;
  const expected = iconDefinitionsFor(map);
  const actual = theme?.iconDefinitions ?? {};
  const differs = Object.keys(expected).length !== Object.keys(actual).length
    || Object.entries(expected).some(([id, definition]) => actual[id]?.fontCharacter !== definition.fontCharacter);
  if (differs) report.fail(PIPELINE, 'icons/product-icon-theme.json is stale against icons/product-icon-map.json; run npm run build:product-icons');
  return true;
}

export function glyphRuleProblems(svg) {
  const errors = [];
  const warnings = [];
  const parsed = parseGlyphSvg(svg);
  if (parsed.viewBox !== '0 0 16 16') errors.push('viewBox must be "0 0 16 16"');
  if (parsed.width !== undefined || parsed.height !== undefined) errors.push('must not set width or height on <svg>');
  const others = [...new Set(parsed.elements.filter((name) => name !== 'svg' && name !== 'path'))];
  if (others.length) errors.push(`only <svg> and <path> elements are allowed (found ${others.join(', ')})`);
  if (!parsed.paths.length) errors.push('contains no <path>');
  if (/\bstroke(?:-[a-z]+)?\s*=|stroke\s*:/i.test(svg)) errors.push('uses stroke; expand strokes to filled outlines');
  if (/fill-rule\s*[=:]\s*["']?evenodd|clip-rule/i.test(svg)) errors.push('uses fill-rule evenodd; cut-outs must be counter-wound subpaths');
  if (/\btransform\s*=/i.test(svg)) errors.push('uses transform; bake transforms into the path data');
  for (const path of parsed.paths) {
    if (!path.d.trim()) errors.push('has a <path> without d');
    if (!path.fill || path.fill === 'none') errors.push('every <path> needs a fill');
  }
  const ds = parsed.paths.map((path) => path.d).filter(Boolean);
  try {
    errors.push(...windingProblems(ds));
    const off = [...new Set(ds.flatMap(offGridPoints).map(([x, y]) => `(${+x.toFixed(3)}, ${+y.toFixed(3)})`))];
    if (off.length) warnings.push(`straight-segment points off the whole/half grid: ${off.slice(0, 6).join(' ')}${off.length > 6 ? ' …' : ''}`);
  } catch (error) {
    errors.push(`path data could not be parsed: ${error.message}`);
  }
  return { errors, warnings };
}

export function checkGlyphSources({ svgs }, report) {
  for (const [file, svg] of Object.entries(svgs)) {
    const { errors, warnings } = glyphRuleProblems(svg);
    for (const error of errors) report.fail(PIPELINE, `icons/product-src/${file} ${error}`);
    for (const warning of warnings) report.warn(`icons/product-src/${file} ${warning}`);
  }
}

export function checkBuildFlags({ sources }, report) {
  for (const [file, text] of Object.entries(sources)) {
    for (const flag of ['centerHorizontally', 'centerVertically']) {
      if (new RegExp(`\\b${flag}\\s*:`).test(text)) report.fail(PIPELINE, `${file} sets ${flag}; it moves glyphs off the grid (spec section 4)`);
    }
  }
  if ('centerHorizontally' in FONT_STREAM_OPTIONS || 'centerVertically' in FONT_STREAM_OPTIONS) report.fail(PIPELINE, 'FONT_STREAM_OPTIONS must not contain centring flags');
  if (FONT_STREAM_OPTIONS.fontHeight !== 16 * FONT_UNITS_PER_GRID_UNIT) report.fail(PIPELINE, 'FONT_STREAM_OPTIONS.fontHeight must be 1024');
}

const box = ({ minX, minY, maxX, maxY }) => `${Math.round(minX)},${Math.round(minY)} to ${Math.round(maxX)},${Math.round(maxY)}`;

export function checkFontGeometry({ woff, map, svgs }, report) {
  const font = fontkit.create(woff);
  const scale = FONT_UNITS_PER_GRID_UNIT;
  for (const [name, { codepoint }] of Object.entries(map.drawings)) {
    const glyph = font.glyphForCodePoint(Number.parseInt(codepoint, 16));
    if (!glyph?.path?.commands?.length) { report.fail(PIPELINE, `${name} (${codepoint}) is empty in the built font`); continue; }
    if (glyph.advanceWidth !== 16 * scale) report.fail(PIPELINE, `${name} advance width is ${glyph.advanceWidth}, expected ${16 * scale}`);
    const svg = svgs[name];
    if (!svg) continue;
    const source = pathBounds(parseGlyphSvg(svg).paths.map((path) => path.d));
    const expected = { minX: source.minX * scale, maxX: source.maxX * scale, minY: (16 - source.maxY) * scale, maxY: (16 - source.minY) * scale };
    const actual = glyph.path.bbox;
    if (['minX', 'maxX', 'minY', 'maxY'].some((key) => Math.abs(actual[key] - expected[key]) > BOX_TOLERANCE)) {
      report.fail(PIPELINE, `${name} glyph box ${box(actual)} differs from its source bounds ${box(expected)} at ${scale} units per grid unit`);
    }
  }
}
