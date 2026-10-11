// Spec 9: the README and the CHANGELOG entry of 2.0.0 (the GitHub release notes are pinned in test/release-notes.test.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const pkg = json('package.json');
const SCREENSHOTS = ['moonlit-candle', 'moonlit', 'daydream', 'coven-contrast', 'product-icons', 'terminal'].map((name) => `assets/screenshots/${name}.png`);

test('the README shows the six Marketplace images in order, each a PNG of Marketplace size, and assets/screenshots/ holds nothing else', () => {
  assert.deepEqual([...read('README.md').matchAll(/!\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]), SCREENSHOTS);
  assert.deepEqual(fs.readdirSync(path.join(root, 'assets', 'screenshots')).sort(), SCREENSHOTS.map((file) => path.basename(file)).sort());
  for (const file of SCREENSHOTS) {
    const png = fs.readFileSync(path.join(root, file));
    assert.equal(png.readUInt32BE(0), 0x89504e47, file);
    const [width, height] = [png.readUInt32BE(16), png.readUInt32BE(20)];
    assert.ok(width >= 600 && width <= 1920 && height <= 2000, `${file}: ${width}x${height}`);
    assert.ok(png.length <= 1024 * 1024, `${file}: ${png.length} bytes`);
  }
});

test('the README settings name the contributed themes and recommend highlighted unsaved tabs and Maple Mono NF (spec 3.1, 3.3, 9)', () => {
  const block = read('README.md').match(/```jsonc\n([\s\S]*?)\n```/)[1];
  const settings = JSON.parse(block.split('\n').filter((line) => !line.trim().startsWith('//')).join('\n'));
  assert.ok(pkg.contributes.themes.some(({ label }) => label === settings['workbench.colorTheme']), settings['workbench.colorTheme']);
  assert.equal(settings['workbench.iconTheme'], pkg.contributes.iconThemes[0].id);
  assert.equal(settings['workbench.productIconTheme'], pkg.contributes.productIconThemes[0].id);
  assert.equal(settings['workbench.editor.highlightModifiedTabs'], true);
  assert.match(settings['editor.fontFamily'], /^'Maple Mono NF'/);
  assert.equal(settings['terminal.integrated.minimumContrastRatio'], undefined, 'documented on its own: it lowers contrast');
});

test('the README documents the exact-match terminal setting, the moon image difference, the logo rule and every way to install (spec 1, 6, 9)', () => {
  const readme = read('README.md');
  for (const text of [
    '"terminal.integrated.minimumContrastRatio": 1', 'The extension does not set it', 'moon background image',
    'original drawings', 'not affiliated with', 'Maple Mono NF',
    `https://marketplace.visualstudio.com/items?itemName=${pkg.publisher}.${pkg.name}`, `code --install-extension ${pkg.publisher}.${pkg.name}`,
    'https://github.com/WitchyNibbles/Spellbound-Themes/releases', `${pkg.name}-${pkg.version}.vsix`, 'Install Another Version',
    'npm ci', 'npm run validate', 'npm run package',
  ]) assert.ok(readme.includes(text), text);
  assert.equal(pkg.contributes.configurationDefaults, undefined, 'the package sets no setting (spec 1)');
});

test('the README says the high-contrast file icons are drawn for dark high-contrast themes (final review I1)', () => {
  // VS Code 1.141 applies an icon theme's highContrast set to light high-contrast themes too, where its docs icons are
  // white on white.
  const icons = read('README.md').split('\n## ').find((section) => section.startsWith('The icons'));
  for (const text of ['A dark, a light and a high-contrast set follow the color theme', 'dark high-contrast themes such as Coven Contrast', 'Light High Contrast', 'low contrast']) assert.ok(icons.includes(text), text);
});

test('the README build section names the Node version and every machine-dependent test requirement, and scopes the same-bytes claim (final review M8, M9, M14)', () => {
  const build = read('README.md').split('\n## ').find((section) => section.startsWith('Build locally'));
  for (const text of [
    'Node.js 22 or later', 'npm test', 'python3 with Pillow', 'tesseract', 'git',
    '../witchyterm', 'VS Code 1.141', 'VSCODE_WORKBENCH_JS', 'skipped',
    'export PATH="$PATH:/mnt/c/Windows/System32:/mnt/c/Windows"', 'cmd.exe',
    `${pkg.name}-${pkg.version}.vsix`, 'LF line endings', 'core.autocrlf',
  ]) assert.ok(build.includes(text), text);
  assert.equal(pkg.engines.node, undefined, 'stated in the README, not enforced in package.json');
});

test('CHANGELOG 2.0.0 comes first, counts the drawings, and its upgrade note names each theme\'s changes, every dropped icon key and the way back (spec 5.1, 9)', () => {
  const changelog = read('CHANGELOG.md');
  assert.match(changelog.split('\n').find((line) => line.startsWith('## ')), /^## 2\.0\.0 — \d{4}-\d{2}-\d{2}$/);
  const entry = changelog.slice(changelog.indexOf('## 2.0.0'), changelog.indexOf('## 1.2.1'));
  const upgrade = entry.slice(entry.indexOf('### Upgrading from 1.x'));
  assert.ok(entry.includes('### Upgrading from 1.x'));
  const ids = Object.keys(json('icons/product-icon-theme.json').iconDefinitions);
  const dropped = Object.keys(json('icons/product-icon-baseline-1.2.1.json').svg_sha256).map((file) => file.replace(/\.svg$/, '')).filter((id) => !ids.includes(id));
  assert.equal(dropped.length, 12, dropped.join(', '));
  for (const id of dropped) assert.ok(upgrade.includes(`\`${id}\``), id);
  for (const text of ['Moonlit:', 'Daydream:', 'Coven Contrast:', '#0D0916', '#08060D', '#74E8B8', '#FFB86B', 'Install Another Version', '1.2.1']) assert.ok(upgrade.includes(text), text);
  // Final review M1: 1.2.1's operators inherited bold from `keyword`; 2.0 sets them plain, word operators included.
  for (const text of ['operators', '`new`', '`typeof`', '`and`', '`in`']) assert.ok(upgrade.includes(text), text);
  const theme = json('icons/file-icon-theme.json');
  const count = (key) => Object.keys(theme[key]).length;
  assert.ok(entry.includes(`${Object.keys(json('icons/product-icon-map.json').drawings).length} drawings for ${ids.length} icon IDs`));
  assert.ok(entry.includes(`${Object.keys(json('icons/file-icon-map.json').drawings).length} drawings for ${count('fileExtensions')} file extensions, ${count('fileNames')} file names and ${count('folderNames')} folder names`));
  assert.ok(entry.includes('Moonlit Candle'));
});
