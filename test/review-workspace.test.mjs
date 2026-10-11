// The review fixtures a gate job opens. Gates 1-4 open review/workspace, which run-gate.mjs turns into a git repository
// in the gate-2 states; a job may name another folder of review/ (gate 5: review/workspace-files, the file-icon fixture).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES } from '../scripts/lib/file-icon-requirements.mjs';
import { DEFAULT_WORKSPACE, prepareWorkspace, workspaceOf } from '../scripts/review/workspace.mjs';

const root = path.resolve(import.meta.dirname, '..');
const listing = (dir, relative = '') => fs.readdirSync(path.join(dir, relative), { withFileTypes: true }).flatMap((entry) => {
  const item = path.posix.join(relative, entry.name);
  return entry.isDirectory() ? [`${item}/`, ...listing(dir, item)] : [item];
}).sort();

test('workspaceOf reads the job\'s "workspace", a folder of review/, and defaults to the gate 1-4 fixture', () => {
  assert.equal(DEFAULT_WORKSPACE, 'review/workspace');
  assert.equal(workspaceOf({}), 'review/workspace');
  assert.equal(workspaceOf({ workspace: 'review/workspace-files' }), 'review/workspace-files');
  for (const workspace of ['../outside', '/tmp/x', 'review/..', 'review/a/b', 'review/', 'workspace', 7]) {
    assert.throws(() => workspaceOf({ workspace }), /"workspace" must name a folder of review\//, String(workspace));
  }
  assert.equal(workspaceOf({}, root), 'review/workspace', 'with the repo root, the folder must exist');
  assert.throws(() => workspaceOf({ workspace: 'review/no-such-fixture' }, root), /review\/no-such-fixture is not a folder/);
  for (const file of ['review/jobs/gate-1.json', 'review/jobs/gate-2.json', 'review/jobs/gate-3.json', 'review/jobs/gate-4.json', 'review/jobs/smoke.json']) {
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')).workspace, undefined, `${file} keeps the default fixture`);
  }
});

test('prepareWorkspace turns the default fixture into the gate-2 git states and copies any other fixture as it is', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-workspace-'));
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trimEnd();
  try {
    // The default fixture: a repository on moonlit-review with an upstream, a branch that conflicts with it, and the
    // changes the gate-2 status-bar scenes show (spells.ts modified, new-spell.ts untracked).
    const gate = path.join(dir, 'gate', 'workspace');
    prepareWorkspace(root, {}, gate);
    assert.equal(git(gate, 'branch', '--show-current'), 'moonlit-review');
    assert.deepEqual(git(gate, 'branch', '--format=%(refname:short)').split('\n').sort(), ['moonlit-review', 'rival-brew']);
    assert.equal(git(gate, 'remote', 'get-url', 'origin'), '../origin.git');
    assert.deepEqual(git(gate, 'status', '--porcelain').split('\n').sort(), [' M spells.ts', '?? new-spell.ts']);
    assert.equal(git(gate, 'config', 'core.autocrlf'), 'false');
    assert.equal(git(gate, 'config', 'core.fileMode'), 'false');

    // Any other fixture: the same files, no repository, so the Explorer shows no git colours or badges over the icons.
    const fixtureRoot = path.join(dir, 'repo');
    fs.mkdirSync(path.join(fixtureRoot, 'review', 'tiny', 'folder'), { recursive: true });
    fs.writeFileSync(path.join(fixtureRoot, 'review', 'tiny', 'a.unknown'), '');
    fs.writeFileSync(path.join(fixtureRoot, 'review', 'tiny', 'folder', '.keep'), '');
    const files = path.join(dir, 'files', 'workspace');
    prepareWorkspace(fixtureRoot, { workspace: 'review/tiny' }, files);
    assert.deepEqual(listing(files), ['a.unknown', 'folder/', 'folder/.keep']);
    assert.ok(!fs.existsSync(path.join(dir, 'files', 'origin.git')), 'no upstream either');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---- Gate 5: the file-icon fixture (spec 6.3) ----
const FIXTURE = 'review/workspace-files';
// Spec 6 writes these names with capitals; file names match case-insensitively, so the fixture spells them as users do.
const SPELLING = { 'readme.md': 'README.md', license: 'LICENSE', 'license.md': 'LICENSE.md', 'changelog.md': 'CHANGELOG.md', dockerfile: 'Dockerfile', 'cargo.lock': 'Cargo.lock' };
// Children that do more than let their folder expand: the breadcrumbs scene opens src/index.ts, and the symbols scene
// opens fixtures/pins.grimoire, whose lines the review helper reads as one symbol each. Every other folder holds .keep.
const CHILDREN = { src: 'index.ts', fixtures: 'pins.grimoire' };
// Matched by no key, so they show the default parchment and the default folder.
const UNMATCHED = { file: 'notes.unknown', folder: 'potions' };
const fixtureFiles = () => listing(path.join(root, FIXTURE)).filter((item) => !item.endsWith('/'));

test('the file-icon fixture holds one file per required extension and file name, and every required folder with one child', () => {
  const top = fs.readdirSync(path.join(root, FIXTURE), { withFileTypes: true });
  const files = top.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  const folders = top.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  assert.deepEqual(files, [...REQUIRED_FILE_EXTENSIONS.map((ext) => `sample.${ext}`), ...REQUIRED_FILE_NAMES.map((name) => SPELLING[name] ?? name), UNMATCHED.file].sort());
  assert.deepEqual(folders, [...REQUIRED_FOLDER_NAMES, UNMATCHED.folder].sort());
  for (const folder of folders) assert.deepEqual(fs.readdirSync(path.join(root, FIXTURE, folder)), [CHILDREN[folder] ?? '.keep'], folder);
  for (const name of Object.keys(SPELLING)) assert.ok(REQUIRED_FILE_NAMES.includes(name), `${name} is a required file name`);
  // Windows (where the review VS Code runs) folds case, so no two entries may differ only in case.
  const lower = [...files, ...folders].map((name) => name.toLowerCase());
  assert.equal(new Set(lower).size, lower.length);
  // The unmatched pair matches nothing: no required extension is a dot-suffix of the file, and no name equals either.
  const suffixes = UNMATCHED.file.split('.').map((_, index, parts) => parts.slice(index + 1).join('.')).filter(Boolean);
  assert.ok(suffixes.every((suffix) => !REQUIRED_FILE_EXTENSIONS.includes(suffix)) && !REQUIRED_FILE_NAMES.includes(UNMATCHED.file), UNMATCHED.file);
  assert.ok(!REQUIRED_FOLDER_NAMES.includes(UNMATCHED.folder), UNMATCHED.folder);
  // Empty files, but the two that carry content for a scene. README.md is a key like any other and stays empty.
  for (const file of fixtureFiles()) {
    const size = fs.statSync(path.join(root, FIXTURE, file)).size;
    assert.equal(size > 0, file === 'fixtures/pins.grimoire', `${file}: ${size} bytes`);
  }
  assert.deepEqual(fs.readFileSync(path.join(root, FIXTURE, 'fixtures', 'pins.grimoire'), 'utf8').trim().split('\n').map((line) => line.split(' ')[0]),
    ['constructor', 'key', 'object', 'package'], 'one symbol of each kind gate 4 pinned after its run (G34)');
});

test('git tracks the whole file-icon fixture: node_modules and every other fixture folder pass the ignore rules', () => {
  // The repo ignores node_modules/ anywhere, which would drop the fixture's node_modules folder from every commit (and the
  // gate 6 cobweb with it). One negated rule re-includes it; check-ignore runs every rule git has, global ones included.
  const lines = fs.readFileSync(path.join(root, '.gitignore'), 'utf8').split('\n');
  assert.ok(lines.indexOf(`!${FIXTURE}/node_modules/`) > lines.indexOf('node_modules/'), 'the negation follows node_modules/');
  const paths = fixtureFiles().map((file) => `${FIXTURE}/${file}`);
  const result = spawnSync('git', ['check-ignore', '--no-index', '--stdin'], { cwd: root, input: paths.join('\n'), encoding: 'utf8' });
  assert.equal(result.stdout, '', 'no fixture file is ignored');
  assert.equal(result.status, 1, result.stderr);
});

test('npm test runs only the suites under test/, never the fixture\'s sample.test.* files or its empty package.json', () => {
  // node --test without a pattern collects **/*.test.{js,mjs,cjs,ts,mts,cts} and **/test/**/*.js anywhere: the fixture's
  // sample.test.* files would run as tests, and the .js and .ts ones fail on the fixture's empty package.json.
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts.test, 'node --test "test/**/*.test.mjs"');
  assert.ok(fixtureFiles().some((file) => /\.test\.(js|mjs|cjs|ts|mts|cts)$/.test(file)), 'the fixture does hold such files');
  assert.ok(fs.readdirSync(path.join(root, 'test')).filter((file) => file.endsWith('.mjs')).every((file) => file.endsWith('.test.mjs')), 'every suite matches the pattern');
});
