import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createReport } from '../scripts/lib/report.mjs';
import { checkFileIconTheme } from '../scripts/lib/checks/file-icons.mjs';
import { checkFileIconPipeline, checkSelectionContrast, fileGlyphProblems } from '../scripts/lib/checks/file-icon-pipeline.mjs';
import { buildFileIconTheme, readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { checkReleaseMetadata } from '../scripts/lib/checks/package.mjs';
import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES, REQUIRED_LANGUAGE_IDS } from '../scripts/lib/file-icon-requirements.mjs';

const run = (fn) => {
  const report = createReport({ enforce: ['file-icons', 'release'] });
  fn(report);
  return report.result().errors.map((e) => `${e.stage}: ${e.message}`);
};
const all = (keys, icon) => Object.fromEntries(keys.map((key) => [key, icon]));
const set = (icon) => ({
  file: icon, folder: icon, folderExpanded: icon,
  fileExtensions: all(REQUIRED_FILE_EXTENSIONS, icon), fileNames: all(REQUIRED_FILE_NAMES, icon),
  folderNames: all(REQUIRED_FOLDER_NAMES, icon), folderNamesExpanded: all(REQUIRED_FOLDER_NAMES, icon),
  languageIds: all(REQUIRED_LANGUAGE_IDS, icon),
});
const complete = () => ({
  showLanguageModeIcons: false,
  iconDefinitions: { d: { iconPath: './d.svg' }, l: { iconPath: './l.svg' }, h: { iconPath: './h.svg' } },
  ...set('d'), light: set('l'), highContrast: set('h'),
});
const svgs = { './d.svg': '<svg><path fill="#B99AFF"/></svg>', './l.svg': '<svg><path fill="#7042B2"/></svg>', './h.svg': '<svg><path fill="#D0B8FF"/></svg>' };

test('section 6 lists include the enumerated test and .env keys', () => {
  assert.ok(REQUIRED_FILE_EXTENSIONS.includes('test.ts') && REQUIRED_FILE_EXTENSIONS.includes('spec.mjs'));
  assert.ok(REQUIRED_FILE_NAMES.includes('.env.local') && REQUIRED_FILE_NAMES.includes('jest.config.json'));
  assert.ok(REQUIRED_FOLDER_NAMES.includes('__pycache__'));
});

test('decisions 9 and 11 add lockfiles, folder aliases and pyw', () => {
  for (const name of ['package-lock.json', 'yarn.lock', 'cargo.lock', 'poetry.lock']) assert.ok(REQUIRED_FILE_NAMES.includes(name), name);
  for (const name of ['source', 'test', '__tests__']) assert.ok(REQUIRED_FOLDER_NAMES.includes(name), name);
  assert.ok(REQUIRED_FILE_EXTENSIONS.includes('pyw'));
  assert.equal(REQUIRED_FILE_NAMES.includes('vite.config.ts'), false);
});

test('D11: the 1.2.1 languageIds block stays required, so the gate-5 theme cannot drop it unnoticed', () => {
  assert.deepEqual(REQUIRED_LANGUAGE_IDS, ['python', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'css', 'scss', 'json', 'jsonc', 'yaml', 'markdown']);
  const theme = complete();
  delete theme.highContrast.languageIds.markdown;
  assert.deepEqual(run((r) => checkFileIconTheme({ theme, readSvg: (p) => svgs[p] }, r)), ['file-icons: highContrast set is missing languageIds: markdown']);
});

test('a complete theme passes', () => {
  assert.deepEqual(run((r) => checkFileIconTheme({ theme: complete(), readSvg: (p) => svgs[p] }, r)), []);
});

test('the 1.2.1 shape fails: no light/highContrast sets, no showLanguageModeIcons', () => {
  const theme = { ...complete(), light: undefined, highContrast: undefined, showLanguageModeIcons: undefined };
  const messages = run((r) => checkFileIconTheme({ theme, readSvg: (p) => svgs[p] }, r)).join('\n');
  assert.match(messages, /file-icons: file-icon-theme.json must set "showLanguageModeIcons": false/);
  assert.match(messages, /has no "light" set/);
  assert.match(messages, /has no "highContrast" set/);
});

test('missing keys and low-contrast colours are reported per set', () => {
  const theme = complete();
  delete theme.light.fileNames['.env.local'];
  const messages = run((r) => checkFileIconTheme({ theme, readSvg: (p) => (p === './l.svg' ? '<svg><path fill="#F3EAF7"/></svg>' : svgs[p]) }, r)).join('\n');
  assert.match(messages, /light set is missing fileNames: \.env\.local/);
  assert.match(messages, /light icon l uses #F3EAF7 at 1\.\d\d:1 on #F8F0FB \(needs 3:1\)/);
});

test('release metadata: version 2.0.0 and banner #0D0916', () => {
  const messages = run((r) => checkReleaseMetadata({ version: '1.2.1', galleryBanner: { color: '#110d24' } }, r));
  assert.deepEqual(messages, ['release: package.json version must be 2.0.0 at release (found 1.2.1)', 'release: package.json galleryBanner.color must be #0D0916 at release (found #110d24)']);
});

// ---- file-icons:pipeline (gate 5) ----
const doc = (paths, svgAttributes = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"') => `<svg ${svgAttributes}>${paths}</svg>\n`;
const square = 'M2 2L14 2L14 14L2 14Z';
const squareHole = 'M2 2L14 2L14 14L2 14ZM4 4L4 12L12 12L12 4Z';

test('file-glyph source rules: a fileIconDocument with role tokens and real holes passes clean', () => {
  assert.deepEqual(fileGlyphProblems(doc(`<path fill="{muted}" d="${squareHole}"/><path fill="{data}" d="M6 6L10 6L10 10L6 10Z"/>`)), { errors: [], warnings: [] });
});

test('file-glyph source rules (spec 8): role tokens only, the 16-unit viewBox, <svg> and <path> only, no opacity, real holes in each part', () => {
  const cases = [
    [doc(`<path fill="#B99AFF" d="${square}"/>`), ['part 1 fill "#B99AFF" is not a role token', 'uses hex colours (#B99AFF); paint with role tokens']],
    [doc(`<path fill="{gold}" d="${square}"/>`), ['part 1 fill "{gold}" is not a role token']],
    [doc(`<path fill="{muted}" d="${square}"/>`, 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"'), ['viewBox must be "0 0 16 16"']],
    [doc(`<path fill="{muted}" d="${square}"/>`, 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"'), ['must not set width or height on <svg>', '<svg> takes only xmlns and viewBox (found width, height)']],
    [doc(`<path fill="{muted}" opacity="0.5" fill-opacity="0.5" d="${square}"/>`), ['<path> takes only fill and d (found opacity, fill-opacity)']],
    [doc(`<linearGradient id="g"/><path fill="{muted}" d="${square}"/><text>A</text>`), ['only <svg> and <path> elements are allowed (found lineargradient, text)']],
    [doc(`<path fill="{muted}" d="M2 2L14 2L14 14L2 14ZM4 4L12 4L12 12L4 12Z"/>`), ['part 1 ({muted}): subpath around (8, 8) is wound the same way as its container, so it renders solid']],
    [doc(''), ['contains no <path>']],
  ];
  for (const [svg, errors] of cases) assert.deepEqual(fileGlyphProblems(svg).errors, errors, svg);
});

test('file-glyph source rules: holes are checked per part, so an accent painted over another part is not a winding error', () => {
  assert.deepEqual(fileGlyphProblems(doc(`<path fill="{muted}" d="${square}"/><path fill="{data}" d="M6 6L10 6L10 10L6 10Z"/>`)).errors, []);
  assert.deepEqual(fileGlyphProblems(doc(`<path fill="{muted}" d="M2 2L14.2 2L14.2 14L2 14Z"/>`)).warnings, ['straight-segment points off the whole/half grid: (14.2, 2) (14.2, 14)']);
});

// Stage inputs as validate.mjs reads them: the map, the sources, the committed theme and the committed resolved SVGs.
const pipelineRun = (inputs, enforce = ['file-icons:pipeline']) => {
  const report = createReport({ enforce });
  checkFileIconPipeline(inputs, report);
  const { errors, warnings } = report.result();
  return { errors: errors.map((e) => `${e.stage}: ${e.message}`), warnings };
};
const pipelineFixture = () => {
  const sources = { parchment: doc(`<path fill="{muted}" d="${squareHole}"/>`), folder: doc(`<path fill="{muted}" d="${squareHole}"/>`), 'folder-open': doc(`<path fill="{muted}" d="${squareHole}"/>`) };
  const map = { drawings: { parchment: { category: 'muted', default: 'file' }, folder: { category: 'muted', default: 'folder' }, 'folder-open': { category: 'muted', default: 'folderExpanded' } } };
  const { theme, files } = buildFileIconTheme(map, sources);
  return { map, sources, theme: structuredClone(theme), built: { ...files } };
};

test('file-icons:pipeline: the committed map, sources, resolved sets and theme pass', () => {
  const root = path.resolve(import.meta.dirname, '..');
  const { map, sources } = readFileIconInputs(root);
  const dir = path.join(root, 'icons', 'file-icons');
  const built = Object.fromEntries(fs.readdirSync(dir, { recursive: true }).filter((file) => file.endsWith('.svg'))
    .map((file) => [`icons/file-icons/${file.split(path.sep).join('/')}`, fs.readFileSync(path.join(dir, file), 'utf8')]));
  const theme = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'file-icon-theme.json'), 'utf8'));
  assert.deepEqual(pipelineRun({ map, sources, theme, built }), { errors: [], warnings: [] });
});

test('file-icons:pipeline fails a theme or resolved set that is not a fresh build, an extra file, a shown language icon and a colour under 3:1', () => {
  const inputs = pipelineFixture();
  inputs.theme.showLanguageModeIcons = true;
  inputs.built['icons/file-icons/light/folder.svg'] = inputs.built['icons/file-icons/light/folder.svg'].replace('#735F7D', '#E9DDF0');
  delete inputs.built['icons/file-icons/dark/parchment.svg'];
  inputs.built['icons/file-icons/dark/witchy-file.svg'] = '<svg/>';
  assert.deepEqual(pipelineRun(inputs).errors, [
    'file-icons:pipeline: icons/file-icon-theme.json must set "showLanguageModeIcons": false',
    'file-icons:pipeline: icons/file-icon-theme.json differs from a fresh build (run npm run build:file-icons)',
    'file-icons:pipeline: icons/file-icons/dark/parchment.svg is missing (run npm run build:file-icons)',
    'file-icons:pipeline: icons/file-icons/light/folder.svg differs from a fresh build (run npm run build:file-icons)',
    'file-icons:pipeline: icons/file-icons/dark/witchy-file.svg is not produced by the build',
    'file-icons:pipeline: light icon folder uses #E9DDF0 at 1.17:1 on #F8F0FB (needs 3:1)',
  ]);
});

test('file-icons:pipeline fails a source that breaks the rules and a map that cannot be built, and keeps them out of the other stages', () => {
  const inputs = pipelineFixture();
  inputs.sources.parchment = inputs.sources.parchment.replace('{muted}', '#A99AB9');
  inputs.map.drawings.folder.category = 'gold';
  const { errors } = pipelineRun(inputs);
  assert.deepEqual(errors, [
    'file-icons:pipeline: icons/file-src/parchment.svg part 1 fill "#A99AB9" is not a role token',
    'file-icons:pipeline: icons/file-src/parchment.svg uses hex colours (#A99AB9); paint with role tokens',
    'file-icons:pipeline: icons/file-icon-map.json: parchment: category "muted" is not painted in its source',
    'file-icons:pipeline: icons/file-icon-map.json: folder: category "gold" is not a role',
  ]);
  assert.deepEqual(pipelineRun(inputs, ['file-icons']).errors, []);
});

test('F9: a warning, never a failure, for each resolved colour under 3:1 on a theme\'s active selection or quick-input focus', () => {
  const { built } = pipelineFixture();
  const report = createReport({ enforce: ['file-icons:pipeline'] });
  checkSelectionContrast({ built, colorThemes: [
    { label: 'Candle', uiTheme: 'vs-dark', colors: { 'sideBar.background': '#120C1F', 'list.activeSelectionBackground': '#633B79' } },
    { label: 'Pink', uiTheme: 'vs', colors: { 'sideBar.background': '#F8F0FB', 'list.activeSelectionBackground': '#B52776', 'quickInputList.focusBackground': '#E9B5D899' } },
  ] }, report);
  assert.deepEqual(report.result(), { errors: [], pending: [], warnings: [
    'F9: Pink list.activeSelectionBackground #B52776: light #735F7D (folder, folder-open, parchment) at 1.04:1 (under 3:1)',
  ] });
});

test('F9 names both selection keys in one line when the quick-input focus falls back to the active selection', () => {
  const { built } = pipelineFixture();
  const report = createReport({ enforce: [] });
  checkSelectionContrast({ built, colorThemes: [{ label: 'Moonlit', uiTheme: 'vs-dark', colors: { 'sideBar.background': '#120C1F', 'list.activeSelectionBackground': '#F04EAB' } }] }, report);
  assert.deepEqual(report.result().warnings, ['F9: Moonlit list.activeSelectionBackground and quickInputList.focusBackground #F04EAB: dark #A99AB9 (folder, folder-open, parchment) at 1.25:1 (under 3:1)']);
});

test('npm run validate enforces file-icons:pipeline and then file-icons (full key coverage, gate 6), after the product batches', () => {
  const { enforce } = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '..', 'scripts', 'validation-stage.json'), 'utf8'));
  assert.deepEqual(enforce.slice(-2), ['file-icons:pipeline', 'file-icons']);
});

test('F9 checks a quick-input focus of its own, and the dark set against every dark color theme', () => {
  const { built } = pipelineFixture();
  const report = createReport({ enforce: [] });
  checkSelectionContrast({ built, colorThemes: [
    { label: 'Candle', uiTheme: 'vs-dark', colors: { 'sideBar.background': '#120C1F', 'list.activeSelectionBackground': '#633B79' } },
    { label: 'Moonlit', uiTheme: 'vs-dark', colors: { 'sideBar.background': '#120C1F', 'list.activeSelectionBackground': '#633B79', 'quickInputList.focusBackground': '#F04EAB' } },
  ] }, report);
  assert.deepEqual(report.result().warnings, ['F9: Moonlit quickInputList.focusBackground #F04EAB: dark #A99AB9 (folder, folder-open, parchment) at 1.25:1 (under 3:1)']);
});

test('file-icons:pipeline passes a source\'s grid warning on as a warning, never an error', () => {
  const inputs = pipelineFixture();
  inputs.sources.parchment = doc('<path fill="{muted}" d="M2 2L14.2 2L14.2 14L2 14Z"/>');
  assert.deepEqual(pipelineRun(inputs).warnings, ['icons/file-src/parchment.svg straight-segment points off the whole/half grid: (14.2, 2) (14.2, 14)']);
});
