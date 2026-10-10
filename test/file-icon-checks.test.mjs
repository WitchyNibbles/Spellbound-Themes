import test from 'node:test';
import assert from 'node:assert/strict';
import { createReport } from '../scripts/lib/report.mjs';
import { checkFileIconTheme } from '../scripts/lib/checks/file-icons.mjs';
import { checkReleaseMetadata } from '../scripts/lib/checks/package.mjs';
import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES } from '../scripts/lib/file-icon-requirements.mjs';

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
