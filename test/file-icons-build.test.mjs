import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileGlyphModules } from '../scripts/file-glyphs/index.mjs';
import { checkFileIconTheme } from '../scripts/lib/checks/file-icons.mjs';
import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES, REQUIRED_LANGUAGE_IDS } from '../scripts/lib/file-icon-requirements.mjs';
import { buildFileIconTheme, mapProblems, readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { createReport } from '../scripts/lib/report.mjs';

const root = path.resolve(import.meta.dirname, '..');
const doc = (...roles) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${roles.map((role) => `<path fill="{${role}}" d="M2 2L14 2L14 14L2 14Z"/>`).join('')}</svg>\n`;
const sources = { parchment: doc('muted', 'muted'), folder: doc('muted', 'muted'), 'folder-open': doc('muted', 'muted'), gem: doc('code', 'code'), 'folder-src': doc('muted', 'muted', 'code'), 'folder-src-open': doc('muted', 'muted', 'code') };
const defaults = { parchment: { category: 'muted', default: 'file' }, folder: { category: 'muted', default: 'folder' }, 'folder-open': { category: 'muted', default: 'folderExpanded' } };
const map = {
  drawings: {
    ...defaults,
    gem: { category: 'code', fileExtensions: ['ts', 'mts'], languageIds: ['typescript'] },
    'folder-src': { category: 'code', folderNames: ['src', 'source'] },
    'folder-src-open': { category: 'code', folderNamesExpanded: ['src', 'source'] },
  },
};

test('buildFileIconTheme resolves every mapped source into the three sets and writes the theme from the map', () => {
  const { theme, files } = buildFileIconTheme(map, sources);
  assert.equal(Object.keys(files).length, 18);
  assert.equal(files['icons/file-icons/dark/gem.svg'], doc('code', 'code').replaceAll('{code}', '#B99AFF'));
  assert.equal(files['icons/file-icons/high-contrast/folder-src.svg'].includes('fill="#D0B8FF"'), true);
  assert.deepEqual(theme.iconDefinitions.gem_light, { iconPath: './file-icons/light/gem.svg' });
  assert.deepEqual(theme.iconDefinitions['folder-open_hc'], { iconPath: './file-icons/high-contrast/folder-open.svg' });
  assert.equal(theme.showLanguageModeIcons, false);
  assert.equal('hidesExplorerArrows' in theme, false);
  assert.deepEqual([theme.file, theme.folder, theme.folderExpanded], ['parchment', 'folder', 'folder-open']);
  assert.deepEqual(theme.fileExtensions, { mts: 'gem', ts: 'gem' });
  assert.deepEqual(theme.languageIds, { typescript: 'gem' });
  assert.deepEqual(theme.folderNamesExpanded, { source: 'folder-src-open', src: 'folder-src-open' });
  assert.deepEqual(theme.light, {
    file: 'parchment_light', folder: 'folder_light', folderExpanded: 'folder-open_light',
    fileExtensions: { mts: 'gem_light', ts: 'gem_light' }, folderNames: { source: 'folder-src_light', src: 'folder-src_light' },
    folderNamesExpanded: { source: 'folder-src-open_light', src: 'folder-src-open_light' }, languageIds: { typescript: 'gem_light' },
  });
  assert.equal(theme.highContrast.fileExtensions.ts, 'gem_hc');
});

test('a map that cannot be built is refused with every problem named', () => {
  const broken = {
    drawings: {
      parchment: { category: 'muted', default: 'file' },
      folder: { category: 'gold', default: 'folder', fileNames: ['README.md'] },
      gem: { category: 'data', fileExtensions: ['ts', 'ts'], globs: ['*.ts'] },
      'gem-cut': { category: 'code', fileExtensions: ['ts'], default: 'folder' },
      'folder-src': { category: 'code', folderNames: ['src'] },
      ghost: { category: 'muted' },
    },
  };
  assert.deepEqual(mapProblems(broken, { parchment: doc('muted'), folder: doc('muted'), gem: doc('code'), 'gem-cut': doc('code'), 'folder-src': doc('muted', 'code'), orphan: doc('muted') }), [
    'folder: category "gold" is not a role',
    'folder: fileNames key "README.md" is not lower case',
    'gem: unknown property globs',
    'gem: fileExtensions lists "ts" twice',
    'gem: category "data" is not painted in its source',
    'folder-src: folderNames needs the twin folder-src-open with the same folderNamesExpanded',
    'ghost: no source icons/file-src/ghost.svg',
    'fileExtensions "ts" is served by gem and gem-cut',
    'default "folder" is set on folder and gem-cut',
    'default "folderExpanded" is set on no drawing',
    'icons/file-src/orphan.svg has no entry in icons/file-icon-map.json',
  ]);
  assert.throws(() => buildFileIconTheme(broken, {}), /icons\/file-icon-map\.json cannot be built:\n/);
});

test('the map refuses an unknown default slot, and an -open drawing without its closed twin', () => {
  const drawings = { ...map.drawings, 'folder-x-open': { category: 'muted', folderNamesExpanded: ['x'], default: 'rootFolder' } };
  assert.deepEqual(mapProblems({ drawings }, { ...sources, 'folder-x-open': doc('muted') }), [
    'folder-x-open: default "rootFolder" is not file, folder, folderExpanded',
    'folder-x-open: folderNamesExpanded needs the twin folder-x with the same folderNames',
  ]);
});

// The gate-5 sample (spec 6.2, 6.3): the drawings and keys of the plan's sample table.
const SAMPLE = {
  'folder-src': { category: 'code', folderNames: ['src', 'source'] },
  'folder-src-open': { category: 'code', folderNamesExpanded: ['src', 'source'] },
  'gem-cut': { category: 'code', fileExtensions: ['ts', 'mts', 'cts'], languageIds: ['typescript'] },
  snake: { category: 'code', fileExtensions: ['py', 'pyw'], languageIds: ['python'] },
  keyring: { category: 'data', fileExtensions: ['json', 'jsonc'], languageIds: ['json', 'jsonc'] },
  contract: { category: 'docs', fileNames: ['license', 'license.md'] },
};

test('the map keeps the defaults and the gate-5 sample as decided (G44), and lists every drawing in module order', () => {
  const { map: committed } = readFileIconInputs(root);
  for (const [name, entry] of Object.entries({ ...defaults, ...SAMPLE })) assert.deepEqual(committed.drawings[name], entry, name);
  assert.deepEqual(Object.keys(committed.drawings), fileGlyphModules.flatMap(({ drawings }) => Object.keys(drawings)));
});

test('the gate-5 theme serves every sample key in all three sets, so the coverage stage no longer lists them as missing', () => {
  const { map: committed, sources } = readFileIconInputs(root);
  const { theme, files } = buildFileIconTheme(committed, sources);
  for (const [name, entry] of Object.entries(SAMPLE)) {
    for (const [property, keys] of Object.entries(entry).filter(([property]) => property !== 'category')) {
      for (const key of keys) {
        assert.deepEqual([theme[property][key], theme.light[property][key], theme.highContrast[property][key]], [name, `${name}_light`, `${name}_hc`], `${property} ${key}`);
      }
    }
  }
  const report = createReport({ enforce: [] });
  checkFileIconTheme({ theme, readSvg: (iconPath) => files[`icons/${iconPath.slice(2)}`] }, report);
  const missing = report.result().pending.flatMap(({ message }) => {
    const [, set, property, keys] = message.match(/^(\w+) set is missing (\w+): (.*)$/) ?? [];
    return set ? keys.split(', ').map((key) => `${set} ${property} ${key}`) : [];
  });
  const served = Object.values(SAMPLE).flatMap((entry) => Object.entries(entry).filter(([property]) => property !== 'category')
    .flatMap(([property, keys]) => keys.flatMap((key) => ['dark', 'light', 'highContrast'].map((set) => `${set} ${property} ${key}`))));
  assert.deepEqual(served.filter((line) => missing.includes(line)), []);
});

// Gate 6 (spec 6, 8): every key the spec lists is served, by exactly one drawing, and no key it does not list.
test('the gate-6 map serves exactly the keys of spec 6: every required extension, file name, folder name and language ID, and no other', () => {
  const { map: committed } = readFileIconInputs(root);
  const served = (property) => Object.values(committed.drawings).flatMap((entry) => entry[property] ?? []).sort();
  assert.deepEqual(served('fileExtensions'), [...REQUIRED_FILE_EXTENSIONS].sort());
  assert.deepEqual(served('fileNames'), [...REQUIRED_FILE_NAMES].sort());
  assert.deepEqual(served('folderNames'), [...REQUIRED_FOLDER_NAMES].sort());
  assert.deepEqual(served('folderNamesExpanded'), [...REQUIRED_FOLDER_NAMES].sort());
  assert.deepEqual(served('languageIds'), [...REQUIRED_LANGUAGE_IDS].sort());
  for (const [name, entry] of Object.entries(committed.drawings)) assert.ok(Object.keys(entry).some((key) => key !== 'category'), `${name} serves a key or a default`);
});

test('the built theme passes the file-icons coverage stage with nothing pending (gate 6, spec 8)', () => {
  const { map: committed, sources } = readFileIconInputs(root);
  const { theme, files } = buildFileIconTheme(committed, sources);
  const report = createReport({ enforce: ['file-icons'] });
  checkFileIconTheme({ theme, readSvg: (iconPath) => files[`icons/${iconPath.slice(2)}`] }, report);
  assert.deepEqual(report.result(), { errors: [], pending: [], warnings: [] });
});

// VS Code's file icon lookup (spec 6): an exact file name first (case-insensitive), then the longest dot-suffix in
// fileExtensions, then the default file. languageIds only apply when neither matches.
const iconOf = (theme, name) => {
  const lower = name.toLowerCase();
  if (theme.fileNames?.[lower]) return theme.fileNames[lower];
  const parts = lower.split('.');
  for (let index = 1; index < parts.length; index += 1) {
    const suffix = parts.slice(index).join('.');
    if (theme.fileExtensions?.[suffix]) return theme.fileExtensions[suffix];
  }
  return theme.file;
};

test('the most specific key wins for the names spec 6 enumerates: lockfiles, configs, tests, .env variants and the special docs', () => {
  const { map: committed, sources } = readFileIconInputs(root);
  const { theme } = buildFileIconTheme(committed, sources);
  const expected = {
    'package-lock.json': 'padlock', 'yarn.lock': 'padlock', 'Cargo.lock': 'padlock', 'sample.lock': 'padlock', 'package.json': 'recipe-card',
    'tsconfig.json': 'gem-gear', 'jsconfig.json': 'gem-gear', 'sample.json': 'keyring', 'jest.config.json': 'flask', 'jest.config.ts': 'flask',
    'sample.test.ts': 'flask', 'sample.spec.tsx': 'flask', 'sample.test.mjs': 'flask', 'sample.tsx': 'gem-ring', 'sample.mts': 'gem-cut',
    'conftest.py': 'flask', 'sample.py': 'snake', 'pytest.ini': 'flask', '.env': 'vial', '.env.local': 'vial', 'sample.env': 'vial',
    'README.md': 'grimoire-open', 'CHANGELOG.md': 'owl', 'LICENSE.md': 'contract', 'sample.md': 'quill', 'requirements.txt': 'recipe-card',
    'sample.txt': 'scroll', 'pyproject.toml': 'recipe-card', 'sample.toml': 'tag', 'Dockerfile': 'crate', '.gitignore': 'veil', 'notes.unknown': 'parchment',
    // The rest of spec 6's enumerated file names (with the ones above, all 27 keys of REQUIRED_FILE_NAMES are exercised below).
    LICENSE: 'contract', 'poetry.lock': 'padlock', '.env.example': 'vial', '.env.development': 'vial', '.env.production': 'vial',
    'jest.config.js': 'flask', 'jest.config.mjs': 'flask', 'jest.config.cjs': 'flask',
  };
  // Every enumerated file name must be one of the sampled names (case-insensitively), so a new spec name cannot go unpinned.
  const sampled = new Set(Object.keys(expected).map((name) => name.toLowerCase()));
  assert.deepEqual(REQUIRED_FILE_NAMES.filter((name) => !sampled.has(name)), [], 'every enumerated file name is sampled');
  assert.deepEqual(Object.fromEntries(Object.keys(expected).map((name) => [name, iconOf(theme, name)])), expected);
});

test('icons/file-icon-theme.json and icons/file-icons/ are a fresh build of the map and the sources (npm run build:file-icons)', () => {
  const { map: committed, sources: committedSources } = readFileIconInputs(root);
  const { theme, files } = buildFileIconTheme(committed, committedSources);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'icons', 'file-icon-theme.json'), 'utf8')), theme);
  const written = fs.readdirSync(path.join(root, 'icons', 'file-icons'), { recursive: true }).filter((file) => file.endsWith('.svg')).map((file) => `icons/file-icons/${file.split(path.sep).join('/')}`);
  assert.deepEqual(written.sort(), Object.keys(files).sort());
  for (const [file, svg] of Object.entries(files)) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), svg, file);
});

test('the 1.2.1 witchy-*.svg icons are gone, and npm run build ends with the file icons', () => {
  assert.deepEqual(fs.readdirSync(path.join(root, 'icons')).filter((file) => /^witchy-.*\.svg$/.test(file)), []);
  const { scripts, contributes } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(scripts['build:file-icons'], 'node scripts/build-file-icons.mjs');
  assert.match(scripts.build, /build-product-icons\.mjs && node scripts\/build-file-icons\.mjs$/);
  assert.deepEqual(contributes.iconThemes, [{ id: 'witchynibbles-icons', label: 'WitchyNibbles Icons', path: './icons/file-icon-theme.json' }]);
});
