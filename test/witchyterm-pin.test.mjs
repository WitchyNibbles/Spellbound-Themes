import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sibling = path.join(root, '..', 'witchyterm', 'dist', 'windows-terminal', 'moonlit-candle.scheme.json');

test('the pinned scheme still equals witchyterm (skipped when the sibling repo is absent)', (t) => {
  if (!fs.existsSync(sibling)) return t.skip('../witchyterm not checked out');
  const pinned = JSON.parse(fs.readFileSync(path.join(root, 'src', 'witchyterm-moonlit-candle.scheme.json'), 'utf8'));
  assert.deepEqual(pinned, JSON.parse(fs.readFileSync(sibling, 'utf8')));
});
