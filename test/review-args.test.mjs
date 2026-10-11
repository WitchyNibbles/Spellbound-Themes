// run-gate.mjs starts a build, a packaging step and a capture run that takes about 15 minutes per gate, so a typo in its
// arguments must stop it before any of that, and a dry run must be able to cut the job down without editing the file.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { filterJob, parseGateArgs } from '../scripts/review/args.mjs';

const root = path.resolve(import.meta.dirname, '..');
const job = () => ({
  passes: [
    { name: 'main', vsix: ['spellbound-main.vsix'], scales: [1, 1.25, 1.5, 2] },
    { name: 'variants', vsix: ['spellbound-variants.vsix'], scales: [1, 2], scenes: ['debug', 'icon-sheet'] },
  ],
  scenes: [{ name: 'panel' }, { name: 'debug' }, { name: 'icon-sheet' }],
});

test('parseGateArgs reads --job, --skip-variants, --scales and --scenes', () => {
  assert.deepEqual(parseGateArgs([]), { job: 'review/jobs/gate-1.json', skipVariants: false, help: false, scales: null, scenes: null });
  assert.deepEqual(parseGateArgs(['--job', 'review/jobs/gate-3.json', '--skip-variants', '--scales=1,2', '--scenes', 'debug,icon-sheet']),
    { job: 'review/jobs/gate-3.json', skipVariants: true, help: false, scales: [1, 2], scenes: ['debug', 'icon-sheet'] });
  assert.equal(parseGateArgs(['--help']).help, true);
});

test('parseGateArgs rejects unknown options, stray arguments, bad scales and empty lists', () => {
  assert.throws(() => parseGateArgs(['--jobs', 'review/jobs/gate-3.json']), /Unknown option '--jobs'/);
  assert.throws(() => parseGateArgs(['review/jobs/gate-3.json']), /Unexpected argument 'review\/jobs\/gate-3\.json'/);
  assert.throws(() => parseGateArgs(['--scales=1,150%']), /--scales takes numbers such as 1,1.25/);
  // An empty list would drop every pass, and the run would build, package and launch a capture of nothing.
  assert.throws(() => parseGateArgs(['--scales=']), /--scales needs at least one value/);
  assert.throws(() => parseGateArgs(['--scenes', ' , ']), /--scenes needs at least one value/);
});

test('filterJob keeps only the asked scales and scenes, and drops a pass left with nothing to capture', () => {
  const cut = filterJob(job(), { scales: [1], scenes: ['panel', 'debug'] });
  assert.deepEqual(cut.passes, [
    { name: 'main', vsix: ['spellbound-main.vsix'], scales: [1], scenes: ['panel', 'debug'] },
    { name: 'variants', vsix: ['spellbound-variants.vsix'], scales: [1], scenes: ['debug'] },
  ]);
  assert.deepEqual(filterJob(job(), { scales: [1.5], scenes: null }).passes.map((pass) => pass.name), ['main']);
  assert.deepEqual(filterJob(job(), { scales: null, scenes: ['panel'] }).passes.map((pass) => pass.name), ['main']);
  assert.deepEqual(filterJob(job(), { scales: null, scenes: null }), job());
  assert.throws(() => filterJob(job(), { scales: null, scenes: ['panels'] }), /Unknown scene 'panels'/);
  assert.throws(() => filterJob(job(), { scales: [3], scenes: null }), /No pass captures at scale 3/);
});

test('filterJob stops when no pass would capture an asked scene, rather than dropping every pass', () => {
  // Gate-3 review: a scene that is in no pass's own scenes list left the cut job with no pass at all, and run-gate.mjs
  // went on to build, package and launch a capture of nothing.
  const listed = () => ({
    passes: [
      { name: 'main', vsix: ['spellbound-main.vsix'], scales: [1, 2], scenes: ['panel'] },
      { name: 'variants', vsix: ['spellbound-variants.vsix'], scales: [1, 2], scenes: ['debug'] },
    ],
    scenes: [{ name: 'panel' }, { name: 'debug' }, { name: 'icon-sheet' }],
  });
  assert.throws(() => filterJob(listed(), { scales: null, scenes: ['icon-sheet'] }), /No pass captures scene 'icon-sheet'/);
  assert.throws(() => filterJob(listed(), { scales: [2], scenes: ['panel', 'icon-sheet'] }), /No pass captures scene 'icon-sheet'/);
  assert.deepEqual(filterJob(listed(), { scales: null, scenes: ['debug'] }).passes.map((pass) => pass.name), ['variants']);
  // With --skip-variants (or no variant drawing) the variants pass is gone before the check, so its scenes stop too.
  assert.throws(() => filterJob(listed(), { scales: null, scenes: ['debug'], skipVariants: true }), /No pass captures scene 'debug'/);
});

test('run-gate.mjs drops the variants pass before it cuts the job, so a scene only that pass captures stops with --skip-variants', () => {
  // Gate-4 review: run-gate.mjs dropped the variants pass after filterJob had accepted a scene only that pass captures,
  // which left a capture of nothing. PATH is emptied so that a run-gate.mjs without the fix fails at its first shell
  // command instead of building anything.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-job-'));
  const file = path.join(dir, 'job.json');
  fs.writeFileSync(file, JSON.stringify({
    passes: [
      { name: 'main', vsix: ['spellbound-main.vsix'], scales: [1], scenes: ['panel'] },
      { name: 'variants', vsix: ['spellbound-variants.vsix'], scales: [1], scenes: ['icon-sheet'] },
    ],
    scenes: [{ name: 'panel' }, { name: 'icon-sheet' }],
  }));
  try {
    const result = spawnSync(process.execPath, ['scripts/review/run-gate.mjs', '--job', path.relative(root, file), '--skip-variants', '--scenes=icon-sheet'],
      { cwd: root, encoding: 'utf8', timeout: 10000, env: { ...process.env, PATH: '' } });
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /No pass captures scene 'icon-sheet'/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('run-gate.mjs stops on an unknown option before it builds or launches anything, and prints usage for --help', () => {
  const run = (...args) => spawnSync(process.execPath, ['scripts/review/run-gate.mjs', ...args], { cwd: root, encoding: 'utf8', timeout: 10000 });
  const bad = run('--jobs', 'review/jobs/gate-3.json');
  assert.equal(bad.status, 2, bad.stderr);
  assert.match(bad.stderr, /Unknown option '--jobs'/);
  assert.match(bad.stderr, /^Usage: node scripts\/review\/run-gate\.mjs/m);
  const help = run('--help');
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /^Usage: node scripts\/review\/run-gate\.mjs/m);
  // The job is read and cut down before anything runs, so a typo in a scene name or a job path also stops at once.
  for (const [args, message] of [[['--job', 'review/jobs/gate-2.json', '--scenes=terminl'], /Unknown scene 'terminl'/],
    [['--job', 'review/jobs/gate-2.json', '--scales=3'], /No pass captures at scale 3/], [['--job', 'review/jobs/gate-9.json'], /ENOENT/]]) {
    const result = run(...args);
    assert.equal(result.status, 2, args.join(' '));
    assert.match(result.stderr, message);
    assert.match(result.stderr, /^Usage: /m);
  }
});
