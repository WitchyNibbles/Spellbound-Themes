// Spec 6.1 (F3): icons/file-icon-map.json and the sources in icons/file-src/ become the three resolved sets in
// icons/file-icons/{dark,light,high-contrast}/ and icons/file-icon-theme.json.
import fs from 'node:fs';
import path from 'node:path';
import { ROLES, SETS, SET_DIRS, resolveSource } from './file-icon-palette.mjs';
import { parseGlyphSvg } from './svg-geometry.mjs';

export const KEY_PROPERTIES = Object.freeze(['fileExtensions', 'fileNames', 'folderNames', 'folderNamesExpanded', 'languageIds']);
export const DEFAULT_SLOTS = Object.freeze(['file', 'folder', 'folderExpanded']);
const SUFFIX = { dark: '', light: '_light', highContrast: '_hc' };
const sameKeys = (a = [], b = []) => a.length === b.length && [...a].sort().join('\n') === [...b].sort().join('\n');

export function readFileIconInputs(root) {
  const map = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'file-icon-map.json'), 'utf8'));
  const dir = path.join(root, 'icons', 'file-src');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith('.svg')).sort() : [];
  return { map, sources: Object.fromEntries(files.map((file) => [file.slice(0, -4), fs.readFileSync(path.join(dir, file), 'utf8')])) };
}

// Every reason the map cannot be built, in a stable order: per drawing (map order), then across drawings, then orphans.
export function mapProblems(map, sources) {
  const problems = [];
  const drawings = map?.drawings ?? {};
  for (const [name, entry] of Object.entries(drawings)) {
    const say = (message) => problems.push(`${name}: ${message}`);
    if (!ROLES.includes(entry.category)) say(`category "${entry.category}" is not a role`);
    for (const property of Object.keys(entry)) {
      if (!['category', 'default', ...KEY_PROPERTIES].includes(property)) say(`unknown property ${property}`);
    }
    for (const property of KEY_PROPERTIES) {
      const keys = entry[property] ?? [];
      for (const key of keys) if (key !== key.toLowerCase()) say(`${property} key "${key}" is not lower case`);
      for (const key of new Set(keys.filter((key, index) => keys.indexOf(key) !== index))) say(`${property} lists "${key}" twice`);
    }
    if ('default' in entry && !DEFAULT_SLOTS.includes(entry.default)) say(`default "${entry.default}" is not ${DEFAULT_SLOTS.join(', ')}`);
    if (sources[name] && ROLES.includes(entry.category) && !parseGlyphSvg(sources[name]).paths.some(({ fill }) => fill === `{${entry.category}}`)) {
      say(`category "${entry.category}" is not painted in its source`);
    }
    // A folder drawing pairs with its -open twin, which serves the same names expanded (spec 6.1).
    if (entry.folderNames && !sameKeys(entry.folderNames, drawings[`${name}-open`]?.folderNamesExpanded)) say(`folderNames needs the twin ${name}-open with the same folderNamesExpanded`);
    const closed = name.replace(/-open$/, '');
    if (entry.folderNamesExpanded && (closed === name || !sameKeys(entry.folderNamesExpanded, drawings[closed]?.folderNames))) say(`folderNamesExpanded needs the twin ${closed === name ? '<name>' : closed} with the same folderNames`);
    if (!sources[name]) say(`no source icons/file-src/${name}.svg`);
  }
  for (const property of KEY_PROPERTIES) {
    const owners = {};
    for (const [name, entry] of Object.entries(drawings)) for (const key of new Set(entry[property] ?? [])) (owners[key] ??= []).push(name);
    for (const [key, names] of Object.entries(owners)) if (names.length > 1) problems.push(`${property} "${key}" is served by ${names.join(' and ')}`);
  }
  for (const slot of DEFAULT_SLOTS) {
    const names = Object.entries(drawings).filter(([, entry]) => entry.default === slot).map(([name]) => name);
    if (names.length !== 1) problems.push(`default "${slot}" is set on ${names.length ? names.join(' and ') : 'no drawing'}`);
  }
  for (const name of Object.keys(sources)) if (!(name in drawings)) problems.push(`icons/file-src/${name}.svg has no entry in icons/file-icon-map.json`);
  return problems;
}

// sources: drawing name -> source SVG text (role tokens). Returns the theme object and the resolved SVGs by path
// relative to the repo root.
export function buildFileIconTheme(map, sources) {
  const problems = mapProblems(map, sources);
  if (problems.length) throw new Error(`icons/file-icon-map.json cannot be built:\n${problems.join('\n')}`);
  const entries = Object.entries(map.drawings);
  const files = {};
  const iconDefinitions = {};
  for (const set of SETS) {
    for (const [name] of entries) {
      files[`icons/file-icons/${SET_DIRS[set]}/${name}.svg`] = resolveSource(sources[name], set);
      iconDefinitions[`${name}${SUFFIX[set]}`] = { iconPath: `./file-icons/${SET_DIRS[set]}/${name}.svg` };
    }
  }
  const associations = (set) => {
    const id = (name) => `${name}${SUFFIX[set]}`;
    const result = Object.fromEntries(DEFAULT_SLOTS.map((slot) => [slot, id(entries.find(([, entry]) => entry.default === slot)[0])]));
    for (const property of KEY_PROPERTIES) {
      const pairs = entries.flatMap(([name, entry]) => (entry[property] ?? []).map((key) => [key, id(name)]));
      if (pairs.length) result[property] = Object.fromEntries(pairs.sort(([a], [b]) => (a < b ? -1 : 1)));
    }
    return result;
  };
  const theme = {
    $schema: 'vscode://schemas/icon-theme',
    $comment: 'Generated by npm run build:file-icons from icons/file-icon-map.json and icons/file-src/ (spec 6.1). Do not edit.',
    showLanguageModeIcons: false,
    iconDefinitions,
    ...associations('dark'),
    light: associations('light'),
    highContrast: associations('highContrast'),
  };
  return { theme, files };
}
