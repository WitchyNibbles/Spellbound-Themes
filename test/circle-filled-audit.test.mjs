// Mapping circle-filled to the dirty star (✦) also reaches every registered ID that defaults to it.
// The audit is recorded in docs/research/vscode-1.141-icon-inventory.md ("Audit: circle-filled").
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { defaultBundle, extractRegistrations } from '../scripts/extract-icon-ids.mjs';

const BUNDLE = defaultBundle();
const registrations = BUNDLE && fs.existsSync(BUNDLE) ? extractRegistrations(fs.readFileSync(BUNDLE, 'utf8')) : null;

test('the registered IDs that inherit circle-filled are exactly the audited ones', (t) => {
  if (!registrations) return t.skip('VS Code bundle not available');
  const inheritors = [...registrations]
    .filter(([, entry]) => entry.kind === 'registered' && entry.default === 'circle-filled')
    .map(([id]) => id)
    .sort();
  assert.deepEqual(inheritors, ['ports-forwarded-with-process-icon']);
});

test('terminal-decoration-success is a codicon, so the dirty star does not reach the terminal gutter', (t) => {
  // The workbench also calls registerIcon('terminal-decoration-success', circleFilled), but the codicon table
  // registers the ID first with its own copy of the circle-filled character, and the first registration wins.
  if (!registrations) return t.skip('VS Code bundle not available');
  assert.deepEqual(registrations.get('terminal-decoration-success'), { kind: 'codicon', default: null });
});
