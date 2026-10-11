// The VSIX holds the files VS Code reads at run time and nothing else (2.0.0 release decision R1): the manifest, the
// README, CHANGELOG and LICENSE the extension page shows, the four color themes, the extension icon, and the two icon
// themes with the font and the resolved file icons they load. The screenshots load from GitHub; the icon sources, maps
// and pinned ID lists are build inputs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import yauzl from 'yauzl';

const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const allowed = [
  /^package\.json$/, /^README\.md$/, /^CHANGELOG\.md$/, /^LICENSE\.md$/,
  /^themes\/WitchyNibbles-color-theme-(moonlit-candle|dark|light|high-contrast)\.json$/,
  /^assets\/witchynibbles\.png$/,
  /^icons\/(product-icon-theme\.json|witchynibbles-product-icons\.woff|file-icon-theme\.json)$/,
  /^icons\/file-icons\/(dark|light|high-contrast)\/[a-z0-9-]+\.svg$/,
];

// vsce's own entry script under the running Node, not `npx`: on native Windows npx is npx.cmd, which execFileSync can
// only start through a shell.
const vsce = (...args) => execFileSync(process.execPath, [path.join(root, 'node_modules', '@vscode', 'vsce', 'vsce'), ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
let listing;
const vsceList = () => {
  listing ??= vsce('ls', '--no-dependencies').split('\n').map((line) => line.trim()).filter(Boolean);
  return listing;
};

test('the vsix file list (vsce ls) holds only runtime files: no review/, docs/, scripts, tests, icon sources, maps or screenshots', () => {
  assert.deepEqual(vsceList().filter((file) => !allowed.some((re) => re.test(file))), []);
});

test('the vsix holds every runtime file: the contributed themes, the font, the extension icon and each resolved file icon in three sets', () => {
  const listed = new Set(vsceList());
  for (const { path: file } of [...pkg.contributes.themes, ...pkg.contributes.iconThemes, ...pkg.contributes.productIconThemes]) {
    assert.ok(listed.has(file.replace(/^\.\//, '')), file);
  }
  assert.ok(listed.has('icons/witchynibbles-product-icons.woff'));
  assert.ok(listed.has(pkg.icon));
  const drawings = Object.keys(JSON.parse(fs.readFileSync(path.join(root, 'icons', 'file-icon-map.json'), 'utf8')).drawings);
  for (const set of ['dark', 'light', 'high-contrast']) {
    for (const name of drawings) assert.ok(listed.has(`icons/file-icons/${set}/${name}.svg`), `${set}/${name}`);
  }
  assert.equal([...listed].filter((file) => file.startsWith('icons/file-icons/')).length, 3 * drawings.length, 'no stale resolved icon');
});

test('the vsix holds the four documents: package.json, the README and CHANGELOG the extension page shows, and the license', () => {
  // Final review M4: an over-broad .vscodeignore line could drop the Marketplace README or the license with no test failing.
  const listed = new Set(vsceList());
  for (const file of ['package.json', 'README.md', 'CHANGELOG.md', 'LICENSE.md']) assert.ok(listed.has(file), file);
});

test('the extension icon is a 256x256 PNG (the Marketplace shows it at 128px; 1.2.1 shipped 1254px, three quarters of the VSIX)', () => {
  const icon = fs.readFileSync(path.join(root, pkg.icon));
  assert.equal(icon.readUInt32BE(0), 0x89504e47);
  assert.deepEqual([icon.readUInt32BE(16), icon.readUInt32BE(20)], [256, 256]);
});

const openZip = promisify(yauzl.open);
async function readEntries(file, names) {
  const zip = await openZip(file, { lazyEntries: true });
  const found = {};
  await new Promise((resolve, reject) => {
    zip.on('error', reject);
    zip.on('end', resolve);
    zip.on('entry', (entry) => {
      if (!names.includes(entry.fileName)) return zip.readEntry();
      zip.openReadStream(entry, (error, stream) => {
        if (error) return reject(error);
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => {
          found[entry.fileName] = Buffer.concat(chunks).toString('utf8');
          zip.readEntry();
        });
      });
    });
    zip.readEntry();
  });
  return found;
}

test('a packaged VSIX stays under 512 KB, carries the 2.0.0 tags only, and points its README images at GitHub (spec 9)', async () => {
  const [, imagesUrl] = pkg.scripts.package.match(/--baseImagesUrl (\S+)/);
  const [, contentUrl] = pkg.scripts.package.match(/--baseContentUrl (\S+)/);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-vsix-'));
  try {
    const file = path.join(dir, 'candidate.vsix');
    vsce('package', '--no-dependencies', '--baseImagesUrl', imagesUrl, '--baseContentUrl', contentUrl, '-o', file);
    assert.ok(fs.statSync(file).size < 512 * 1024, `${fs.statSync(file).size} bytes`);
    const { 'extension.vsixmanifest': manifest, 'extension/readme.md': readme } = await readEntries(file, ['extension.vsixmanifest', 'extension/readme.md']);
    // vsce adds a tag for each contribution kind, and one per language word it finds in the description (a "spell",
    // "terminal" or "css" there would add markdown, terminal or css): none may appear beyond these.
    const tags = manifest.match(/<Tags>([^<]*)<\/Tags>/)[1].split(',');
    assert.deepEqual(tags.sort(), [...new Set([...pkg.keywords, 'color-theme', 'icon-theme', 'product-icon-theme', '__web_extension'])].sort());
    const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((match) => match[1]);
    assert.ok(images.length && images.every((url) => url.startsWith(`${imagesUrl}/assets/screenshots/`)), images.join('\n'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
