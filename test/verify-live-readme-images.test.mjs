// scripts/verify-live-readme-images.py (spec 9, R7): every failure lands in the JSON report and ends in one summary
// line, never a traceback; online, it fetches origin main and stops unless HEAD is origin/main.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const IMAGES = { 'img/a.png': 'image a', 'img/b.png': 'image b' };

const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.invalid', ...args], { cwd, encoding: 'utf8', stdio: 'pipe' });
const run = (cwd, ...args) => new Promise((resolve) => {
  execFile('python3', ['scripts/verify-live-readme-images.py', ...args], { cwd }, (error, stdout, stderr) => resolve({ code: error ? error.code : 0, stdout, stderr }));
});

// A tiny package: README.md shows two images, the VSIX's packed README shows them under the base URL.
function fixture(base) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-live-images-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.copyFileSync(path.join(root, 'scripts', 'verify-live-readme-images.py'), path.join(dir, 'scripts', 'verify-live-readme-images.py'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'demo', version: '1.0.0', scripts: { package: `vsce package --baseImagesUrl ${base} --no-dependencies` } }));
  const readme = Object.keys(IMAGES).map((file) => `![${file}](${file})`).join('\n\n');
  fs.writeFileSync(path.join(dir, 'README.md'), `${readme}\n`);
  fs.mkdirSync(path.join(dir, 'img'));
  for (const [file, body] of Object.entries(IMAGES)) fs.writeFileSync(path.join(dir, file), body);
  fs.writeFileSync(path.join(dir, '.gitignore'), '*.vsix\n');
  execFileSync('python3', ['-c', 'import sys, zipfile\nwith zipfile.ZipFile(sys.argv[1], "w") as z: z.writestr("extension/readme.md", sys.argv[2])',
    path.join(dir, 'demo-1.0.0.vsix'), readme.replaceAll('](img/', `](${base}/img/`)]);
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'add', '-A');
  return dir;
}

function assertClean(result, dir) {
  assert.doesNotMatch(result.stdout + result.stderr, /Traceback/);
  assert.ok(!(result.stdout + result.stderr).includes(dir), 'no absolute fixture path in the output');
  assert.ok(!(result.stdout + result.stderr).includes(os.homedir()), 'no home directory in the output');
}

test('offline: passes on the staged images, before the first commit too', async () => {
  const dir = fixture('https://example.invalid/demo/main');
  const result = await run(dir, '--offline');
  assert.equal(result.code, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.results.map((r) => r.path), Object.keys(IMAGES));
  assert.deepEqual(report.failures, []);
  assert.equal(report.commit, null);
});

test('offline: an unstaged change and an image missing from the index are both reported, with one summary line', async () => {
  const dir = fixture('https://example.invalid/demo/main');
  git(dir, 'commit', '-q', '-m', 'init');
  fs.writeFileSync(path.join(dir, 'img/a.png'), 'changed');
  git(dir, 'rm', '-q', '--cached', 'img/b.png');
  const result = await run(dir, '--offline');
  assert.equal(result.code, 1);
  assertClean(result, dir);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.failures.map((f) => f.path), ['img/a.png', 'img/b.png']);
  assert.equal(result.stderr.trim().split('\n').length, 1);
  assert.match(result.stderr, /2 problems/);
});

test('online: fetches origin main first and stops unless HEAD is origin/main; a fetch failure is one clear line', async () => {
  const dir = fixture('http://127.0.0.1:9/demo/main');
  git(dir, 'commit', '-q', '-m', 'init');
  let result = await run(dir);
  assert.equal(result.code, 1);
  assertClean(result, dir);
  assert.match(result.stderr, /git fetch origin main failed/);
  assert.equal(result.stderr.trim().split('\n').length, 1);
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-live-images-origin-'));
  git(remote, 'init', '-q', '--bare', '-b', 'main');
  git(dir, 'remote', 'add', 'origin', remote);
  git(dir, 'push', '-q', 'origin', 'main');
  fs.writeFileSync(path.join(dir, 'notes.txt'), 'later');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'not pushed');
  result = await run(dir);
  assert.equal(result.code, 1);
  assertClean(result, dir);
  assert.match(result.stderr, /push the release commit first/);
  assert.deepEqual(JSON.parse(result.stdout).results, [], 'nothing fetched before the push');
});

test('online: a 404, a wrong body and an unreachable host are each reported by URL, never a traceback', async () => {
  const server = http.createServer((request, response) => {
    if (request.url.endsWith('/img/a.png')) response.end('stale image a');
    else { response.statusCode = 404; response.end('404: Not Found'); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}/demo/main`;
    const dir = fixture(base);
    git(dir, 'commit', '-q', '-m', 'init');
    const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-live-images-origin-'));
    git(remote, 'init', '-q', '--bare', '-b', 'main');
    git(dir, 'remote', 'add', 'origin', remote);
    git(dir, 'push', '-q', 'origin', 'main');
    let result = await run(dir);
    assert.equal(result.code, 1);
    assertClean(result, dir);
    const report = JSON.parse(result.stdout);
    assert.deepEqual(report.failures.map((f) => f.url), [`${base}/img/a.png`, `${base}/img/b.png`]);
    assert.match(report.failures[1].problem, /404/);
    assert.equal(result.stderr.trim().split('\n').length, 1);
    // The same package with the right bodies passes.
    server.removeAllListeners('request');
    server.on('request', (request, response) => {
      const file = Object.keys(IMAGES).find((name) => request.url.endsWith(`/${name}`));
      if (file) response.end(IMAGES[file]); else { response.statusCode = 404; response.end(); }
    });
    result = await run(dir);
    assert.equal(result.code, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout).results.map((r) => r.body_match), [true, true]);
  } finally {
    server.close();
  }
  const dir = fixture('http://127.0.0.1:9/demo/main');
  git(dir, 'commit', '-q', '-m', 'init');
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-live-images-origin-'));
  git(remote, 'init', '-q', '--bare', '-b', 'main');
  git(dir, 'remote', 'add', 'origin', remote);
  git(dir, 'push', '-q', 'origin', 'main');
  const result = await run(dir);
  assert.equal(result.code, 1);
  assertClean(result, dir);
  assert.equal(JSON.parse(result.stdout).failures.length, 2);
});

// Final review M3: each of these ended in a Python traceback that printed absolute paths, with an empty or partial report.
const pythonOnly = () => {
  // A PATH with python3 and nothing else, so the script cannot find git.
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-live-images-bin-'));
  fs.symlinkSync(execFileSync('python3', ['-c', 'import sys; print(sys.executable)'], { encoding: 'utf8' }).trim(), path.join(bin, 'python3'));
  return bin;
};
const runWith = (cwd, env, ...args) => new Promise((resolve) => {
  execFile(path.join(env.PATH, 'python3'), ['scripts/verify-live-readme-images.py', ...args], { cwd, env }, (error, stdout, stderr) => resolve({ code: error ? error.code : 0, stdout, stderr }));
});

test('offline: a missing README.md, a packed readme that is not UTF-8 and a missing git each end in one line, never a traceback', async () => {
  let dir = fixture('https://example.invalid/demo/main');
  fs.rmSync(path.join(dir, 'README.md'));
  let result = await run(dir, '--offline');
  assert.equal(result.code, 1);
  assertClean(result, dir);
  assert.equal(result.stderr.trim().split('\n').length, 1);
  assert.match(result.stderr, /README\.md/);
  assert.equal(JSON.parse(result.stdout).failures.length, 1);

  dir = fixture('https://example.invalid/demo/main');
  execFileSync('python3', ['-c', 'import sys, zipfile\nwith zipfile.ZipFile(sys.argv[1], "w") as z: z.writestr("extension/readme.md", b"\\xff\\xfe not utf-8")', path.join(dir, 'demo-1.0.0.vsix')]);
  result = await run(dir, '--offline');
  assert.equal(result.code, 1);
  assertClean(result, dir);
  assert.equal(result.stderr.trim().split('\n').length, 1);
  assert.match(result.stderr, /not UTF-8/);

  dir = fixture('https://example.invalid/demo/main');
  result = await runWith(dir, { PATH: pythonOnly() }, '--offline');
  assert.equal(result.code, 1);
  assertClean(result, dir);
  assert.equal(result.stderr.trim().split('\n').length, 1);
  assert.match(result.stderr, /git/);
  assert.equal(JSON.parse(result.stdout).failures.length, 1);
});

test('online: a body cut short (IncompleteRead) is reported by URL, never a traceback', async () => {
  // Content-Length promises more than the server sends before it closes the connection.
  const server = net.createServer((socket) => {
    socket.once('data', () => socket.end('HTTP/1.1 200 OK\r\nContent-Length: 100\r\nConnection: close\r\n\r\nshort'));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}/demo/main`;
    const dir = fixture(base);
    git(dir, 'commit', '-q', '-m', 'init');
    const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-live-images-origin-'));
    git(remote, 'init', '-q', '--bare', '-b', 'main');
    git(dir, 'remote', 'add', 'origin', remote);
    git(dir, 'push', '-q', 'origin', 'main');
    const result = await run(dir);
    assert.equal(result.code, 1);
    assertClean(result, dir);
    const report = JSON.parse(result.stdout);
    assert.deepEqual(report.failures.map((f) => f.url), [`${base}/img/a.png`, `${base}/img/b.png`]);
    assert.match(report.failures[0].problem, /could not fetch it/);
    assert.equal(result.stderr.trim().split('\n').length, 1);
  } finally {
    server.close();
  }
});
