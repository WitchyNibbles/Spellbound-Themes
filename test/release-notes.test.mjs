// Spec 9: the GitHub release notes of 2.0.0 (docs/release/2.0.0.md, the body of `gh release create`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const vsix = `${pkg.name}-${pkg.version}.vsix`;

test('the release notes name the VSIX and its SHA-256, which matches the VSIX built here when there is one', () => {
  const notes = fs.readFileSync(path.join(root, 'docs', 'release', `${pkg.version}.md`), 'utf8');
  assert.match(notes, new RegExp(`^# WitchyNibbles Spellbound Themes ${pkg.version.replaceAll('.', '\\.')}$`, 'm'));
  assert.ok(notes.includes(`Asset: \`${vsix}\``));
  const [, sha] = notes.match(/^SHA-256: `([0-9a-f]{64})`$/m) ?? [];
  assert.ok(sha, 'a SHA-256 line');
  for (const text of ['https://github.com/WitchyNibbles/Spellbound-Themes/blob/main/CHANGELOG.md', 'Install Another Version', 'releases/tag/v1.2.1']) assert.ok(notes.includes(text), text);
  // npm run package is reproducible (scripts/normalize-vsix.mjs), so a rebuild of the same tree keeps this SHA.
  if (fs.existsSync(path.join(root, vsix))) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, vsix))).digest('hex'), sha, `${vsix} was rebuilt from a different tree`);
});

// vsce rewrites relative links: images onto --baseImagesUrl, every other link onto --baseContentUrl.
const option = (name) => pkg.scripts.package.match(new RegExp(`--${name} (\\S+)`))[1];
const absolute = (markdown) => markdown.replace(/(!?)\[([^\]]*)\]\((?![a-z]+:|#)([^)\s]+)\)/g, (_, image, text, target) => `${image}[${text}](${option(image ? 'baseImagesUrl' : 'baseContentUrl')}/${target})`);
const packed = (entry) => execFileSync('python3', ['-c', 'import sys, zipfile\nsys.stdout.buffer.write(zipfile.ZipFile(sys.argv[1]).read(sys.argv[2]))', path.join(root, vsix), entry]);

test('the VSIX in the repo root, when there is one, was packaged from this README, CHANGELOG and package.json', () => {
  if (!fs.existsSync(path.join(root, vsix))) return;
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(packed('extension/package.json').toString(), read('package.json'), `${vsix} is stale: package.json changed`);
  assert.equal(packed('extension/changelog.md').toString(), absolute(read('CHANGELOG.md')), `${vsix} is stale: CHANGELOG.md changed`);
  assert.equal(packed('extension/readme.md').toString(), absolute(read('README.md')), `${vsix} is stale: README.md changed`);
});
