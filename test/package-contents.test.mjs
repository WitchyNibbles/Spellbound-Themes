import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const allowed = [/^package\.json$/, /^README\.md$/, /^CHANGELOG\.md$/, /^LICENSE[^/]*$/, /^themes\//, /^icons\//, /^assets\//];
// Release decision pending: icon sources and data files are currently packaged; printed so the release phase sees them.
const pendingRelease = [/^icons\/product-src\//, /^icons\/product-icon-(map|ids|baseline-[^/]*)\.json$/, /^icons\/file-icon-map\.json$/, /^icons\/README\.md$/];

// vsce's own entry script under the running Node, not `npx`: on native Windows npx is npx.cmd, which execFileSync can
// only start through a shell.
let listing;
const vsceList = () => {
  listing ??= execFileSync(process.execPath, [path.join(root, 'node_modules', '@vscode', 'vsce', 'vsce'), 'ls', '--no-dependencies'], { cwd: root, encoding: 'utf8' })
    .split('\n').map((line) => line.trim()).filter(Boolean);
  return listing;
};

test('the vsix file list (vsce ls) holds only allowlisted paths', () => {
  const listed = vsceList();
  const pending = listed.filter((file) => pendingRelease.some((re) => re.test(file)));
  console.log(`# packaged icon sources/data awaiting a release decision (${pending.length}):\n${pending.map((file) => `#   ${file}`).join('\n')}`);
  assert.deepEqual(listed.filter((file) => !allowed.some((re) => re.test(file))), []);
});

test('the vsix ships the file icon theme and its resolved sets, never the role-token sources (spec 6.1)', () => {
  const listed = vsceList();
  assert.ok(listed.includes('icons/file-icon-theme.json'));
  for (const set of ['dark', 'light', 'high-contrast']) assert.ok(listed.includes(`icons/file-icons/${set}/parchment.svg`), set);
  assert.deepEqual(listed.filter((file) => file.startsWith('icons/file-src/') || /^icons\/witchy-/.test(file)), []);
});
