import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const allowed = [/^package\.json$/, /^README\.md$/, /^CHANGELOG\.md$/, /^LICENSE[^/]*$/, /^themes\//, /^icons\//, /^assets\//];
// Release decision pending: icon sources and data files are currently packaged; printed so the release phase sees them.
const pendingRelease = [/^icons\/product-src\//, /^icons\/product-icon-(map|ids|baseline-[^/]*)\.json$/, /^icons\/README\.md$/];

test('the vsix file list (vsce ls) holds only allowlisted paths', () => {
  // vsce's own entry script under the running Node, not `npx`: on native Windows npx is npx.cmd, which execFileSync can
  // only start through a shell.
  const vsce = path.join(root, 'node_modules', '@vscode', 'vsce', 'vsce');
  const listed = execFileSync(process.execPath, [vsce, 'ls', '--no-dependencies'], { cwd: root, encoding: 'utf8' })
    .split('\n').map((line) => line.trim()).filter(Boolean);
  const pending = listed.filter((file) => pendingRelease.some((re) => re.test(file)));
  console.log(`# packaged icon sources/data awaiting a release decision (${pending.length}):\n${pending.map((file) => `#   ${file}`).join('\n')}`);
  assert.deepEqual(listed.filter((file) => !allowed.some((re) => re.test(file))), []);
});
