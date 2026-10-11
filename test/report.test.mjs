import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { checkOnlyStages, createReport, formatResult, isEnforced, parseArgs } from '../scripts/lib/report.mjs';

const root = path.resolve(import.meta.dirname, '..');

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

// Final review M6: --only with a misspelt stage, or with no value, enforced nothing and still printed "✓ … passed".
test('--only needs at least one stage, and only stages a check uses', () => {
  for (const argv of [['--only'], ['--only', ''], ['--only', ',']]) assert.throws(() => parseArgs(argv), /--only needs at least one stage/, argv.join(' '));
  assert.throws(() => checkOnlyStages(['base', 'colour-themes'], ['base', 'color-themes']), /Unknown stage 'colour-themes' for --only/);
  assert.doesNotThrow(() => checkOnlyStages(['color-themes', 'base'], ['base', 'color-themes']));
});

test('validate --only stops with exit 2 on an unknown or missing stage, before any check passes', () => {
  const validate = (...args) => spawnSync(process.execPath, ['scripts/validate.mjs', ...args], { cwd: root, encoding: 'utf8' });
  for (const args of [['--only', 'colour-themes'], ['--only']]) {
    const result = validate(...args);
    assert.equal(result.status, 2, args.join(' '));
    assert.doesNotMatch(result.stdout + result.stderr, /passed/);
    assert.match(result.stderr, /--only/);
  }
});

test('formatResult summarises pending stages and warnings', () => {
  const text = formatResult({ errors: [], pending: [{ stage: 'release', message: 'x' }], warnings: ['w'] }, { enforced: ['base'] });
  assert.match(text, /1 pending problems in stages not yet enforced: release \(1\)/);
  assert.match(text, /⚠ w/);
  assert.match(text, /✓ WitchyNibbles package validation passed \(enforced: base\)/);
});
