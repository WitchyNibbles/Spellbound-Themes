// Gate evidence goes to a public repository. The Debug Console prints the launch command with the Windows user directory,
// and a shell prompt or an `ll` listing prints user names, so every sheet and text file is scanned before it is
// committed, and a scan that cannot run must fail rather than pass.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findPrivateText, normaliseOcr } from '../scripts/review/privacy-scan.mjs';

const root = path.resolve(import.meta.dirname, '..');
const sheet = path.join(root, 'docs', 'qa', '2.0-gate-2', 'main-terminal-panel.png');
const scan = (files, env = {}) => spawnSync(process.execPath, ['scripts/review/privacy-scan.mjs', ...files],
  { cwd: root, encoding: 'utf8', env: { ...process.env, ...env }, timeout: 120000 });

test('findPrivateText flags the machine user names and any user directory, whatever the case or slash', () => {
  const names = ['wanda', 'morgana'];
  assert.deepEqual(findPrivateText('Problems 3  Output  Debug Console', names), []);
  assert.deepEqual(findPrivateText('"C:\\Users\\Wanda\\AppData\\Local\\Temp\\x\\code-node.cmd"', names),
    ['user name "wanda"', 'user directory "C:\\Users\\Wanda"']);
  assert.deepEqual(findPrivateText('drwxr-xr-x - morgana 10 Oct', names), ['user name "morgana"']);
  assert.deepEqual(findPrivateText('cd /home/someone/projects', names), ['user directory "/home/someone"']);
  assert.deepEqual(findPrivateText('/mnt/c/Users/<user>/AppData', names), [], 'the documented placeholder is fine');
});

test('findPrivateText reads paths the way OCR spaces them, WSL network paths and email addresses', () => {
  assert.equal(normaliseOcr('C: \\Users\\Someone\\ AppData'), 'C:\\Users\\Someone\\AppData');
  assert.deepEqual(findPrivateText('"C: \\Users\\Someone\\ AppData\\Local"', []), ['user directory "C:\\Users\\Someone"']);
  assert.deepEqual(findPrivateText('\\\\wsl.localhost\\Ubuntu\\home\\someone\\projects', []), ['user directory "\\\\wsl.localhost\\Ubuntu\\home\\someone"']);
  assert.deepEqual(findPrivateText('Author: Someone <someone@example.org>', []), ['email address "someone@example.org"']);
  assert.deepEqual(findPrivateText('review@localhost (the fixture identity)', []), [], 'no top-level domain, no address');
});

test('findPrivateText accepts the documented <user> placeholder in a WSL network path too', () => {
  // Gate-3 review: C:\Users\<user> and /home/<user> passed, but \\wsl.localhost\...\home\<user> was flagged.
  assert.deepEqual(findPrivateText('\\\\wsl.localhost\\Ubuntu\\home\\<user>\\projects', []), []);
  assert.deepEqual(findPrivateText('\\\\wsl$\\Ubuntu\\home\\<user>\\projects', []), []);
  assert.deepEqual(findPrivateText('\\\\wsl$\\Ubuntu\\home\\someone\\projects', []), ['user directory "\\\\wsl$\\Ubuntu\\home\\someone"']);
});

test('findPrivateText ignores names too short to match reliably', () => {
  assert.deepEqual(findPrivateText('a quick wizard', ['a', 'qu']), []);
});

test('the scan reads text files and reports the kind of finding, never the text it matched', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'privacy-scan-test-'));
  const clean = path.join(dir, 'README.md');
  const leaky = path.join(dir, 'manifest.json');
  fs.writeFileSync(clean, '# Gate\n\nRun: 2026-10-10 · repo abc (dirty)\n');
  fs.writeFileSync(leaky, JSON.stringify({ workDir: 'C:\\Users\\Someone\\AppData\\Local\\Temp', author: 'someone@example.org' }));
  const ok = scan([clean]);
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /^✓ .*README\.md$/m);
  const bad = scan([leaky]);
  assert.equal(bad.status, 1, bad.stderr);
  assert.match(bad.stdout, /✗ .*manifest\.json: 2 finding\(s\): user directory, email address/);
  assert.doesNotMatch(bad.stdout, /Someone|someone/);
  fs.rmSync(dir, { recursive: true });
});

test('the scan fails closed: nothing to scan, a missing or unsupported file', () => {
  const none = scan([]);
  assert.equal(none.status, 2);
  assert.match(none.stderr, /nothing to scan/);
  const missing = scan(['docs/qa/2.0-gate-3/*.png']); // an unmatched shell glob arrives as itself
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /no such file/);
  const other = scan(['.vscodeignore']);
  assert.equal(other.status, 2);
  assert.match(other.stderr, /only \.png, \.json, \.md and \.txt/);
});

test('the scan fails closed under WSL when it cannot read the Windows user name', () => {
  const result = scan([path.join(root, 'README.md')], { WSL_DISTRO_NAME: 'Ubuntu', PRIVACY_SCAN_CMD: '/nonexistent/cmd.exe' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /cannot read the Windows user name/);
});

test('the scan fails closed when Pillow or tesseract cannot run', () => {
  const noPillow = scan([sheet], { PRIVACY_SCAN_PYTHON: '/nonexistent/python3' });
  assert.equal(noPillow.status, 2);
  assert.match(noPillow.stderr, /with Pillow/);
  const noOcr = scan([sheet], { PRIVACY_SCAN_TESSERACT: '/nonexistent/tesseract' });
  assert.equal(noOcr.status, 2);
  assert.match(noOcr.stderr, /cannot run \/nonexistent\/tesseract/);
});

// Draws a PNG with Pillow (light text on a dark ground, as the 100% dark-theme sheets are); null when Pillow is absent.
const draw = (file, text) => {
  const script = `import sys
from PIL import Image, ImageDraw, ImageFont
image = Image.new('RGB', (900, 160), (30, 30, 36))
if sys.argv[2]:
    try:
        font = ImageFont.truetype('DejaVuSans.ttf', 24)
    except OSError:
        font = ImageFont.load_default()
    ImageDraw.Draw(image).text((20, 60), sys.argv[2], fill=(220, 220, 220), font=font)
image.save(sys.argv[1])`;
  return spawnSync('python3', ['-I', '-c', script, file, text], { encoding: 'utf8' }).status === 0;
};
const ocrAvailable = () => spawnSync('tesseract', ['--version']).status === 0;

test('the scan finds a planted user directory in a PNG, light text on a dark ground', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'privacy-scan-test-'));
  const png = path.join(dir, 'planted.png');
  if (!ocrAvailable() || !draw(png, 'launch C:\\Users\\Someone\\projects\\spellbound node debug')) { fs.rmSync(dir, { recursive: true }); return t.skip('Pillow or tesseract is absent'); }
  const result = scan([png]);
  fs.rmSync(dir, { recursive: true });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.doesNotMatch(result.stdout, /Someone/);
});

test('the scan fails closed on a PNG it could read nothing from (a blank image is not clean)', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'privacy-scan-test-'));
  const png = path.join(dir, 'blank.png');
  if (!ocrAvailable() || !draw(png, '')) { fs.rmSync(dir, { recursive: true }); return t.skip('Pillow or tesseract is absent'); }
  const result = scan([png]);
  fs.rmSync(dir, { recursive: true });
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.match(result.stderr, /blank\.png/);
  assert.match(result.stderr, /could not scan/);
});
