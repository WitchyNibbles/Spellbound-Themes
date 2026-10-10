import test from 'node:test';
import assert from 'node:assert/strict';
import { createReport, formatResult, isEnforced, parseArgs } from '../scripts/lib/report.mjs';

test('only enforced stages fail the run; the rest are pending', () => {
  const report = createReport({ enforce: ['base'] });
  report.fail('base', 'broken');
  report.fail('file-icons', 'later');
  const { errors, pending } = report.result();
  assert.deepEqual(errors.map((e) => e.message), ['broken']);
  assert.deepEqual(pending.map((e) => e.message), ['later']);
});

test('--release enforces every stage', () => {
  assert.equal(isEnforced('file-icons', { enforce: ['base'], release: true }), true);
});

test('--only narrows to the named stages and hides the rest', () => {
  const report = createReport({ enforce: ['base'], only: ['color-themes'] });
  report.fail('base', 'a');
  report.fail('color-themes', 'b');
  const { errors, pending } = report.result();
  assert.deepEqual(errors.map((e) => e.message), ['b']);
  assert.deepEqual(pending, []);
});

test('parseArgs reads the three options', () => {
  assert.deepEqual(parseArgs(['--only', 'a,b', '--verbose']), { release: false, verbose: true, only: ['a', 'b'] });
  assert.throws(() => parseArgs(['--nope']), /Unknown option/);
});

test('formatResult summarises pending stages and warnings', () => {
  const text = formatResult({ errors: [], pending: [{ stage: 'release', message: 'x' }], warnings: ['w'] }, { enforced: ['base'] });
  assert.match(text, /1 pending problems in stages not yet enforced: release \(1\)/);
  assert.match(text, /⚠ w/);
  assert.match(text, /✓ WitchyNibbles package validation passed \(enforced: base\)/);
});
