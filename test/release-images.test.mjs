// scripts/release/release-images.py (spec 9): the Marketplace images are real captures, copied, trimmed and placed side by
// side, never drawn. Synthetic captures stand in for a release run here; their content is noise, so a test that compares
// bytes proves a pixel-for-pixel copy rather than "about the same colours".
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const script = path.join(root, 'scripts', 'release', 'release-images.py');
const PANEL = [23, 16, 37]; // a panel background
const FILL = [13, 9, 22]; // #0D0916, the script's fill and gutter
// Writes a PNG of the given mode and size on a background; inside the box [x, y, width, height] every pixel is a
// deterministic, never-background colour that varies from pixel to pixel (seeded). RGBA captures take the given alpha.
const MAKE = `import sys
from PIL import Image
file, mode = sys.argv[1], sys.argv[2]
w, h, r, g, b, x, y, bw, bh, seed, alpha = map(int, sys.argv[3:14])
image = Image.new('RGBA' if mode == 'RGBA' else 'RGB', (w, h), (r, g, b, alpha) if mode == 'RGBA' else (r, g, b))
for py in range(y, y + bh):
    for px in range(x, x + bw):
        pixel = (100 + (px * 31 + py * 17 + seed) % 156, 100 + (px * 7 + py * 53 + seed * 3) % 156, 100 + (px * 11 + py * 3 + seed * 5) % 156)
        image.putpixel((px, py), pixel + (alpha,) if mode == 'RGBA' else pixel)
if mode == 'L':
    image = image.convert('L')
image.save(file)`;
const make = (file, size, box, { background = PANEL, seed = 0, mode = 'RGB', alpha = 255 } = {}) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  execFileSync('python3', ['-c', MAKE, file, mode, ...size, ...background, ...box, seed, alpha].map(String));
};
// Size of a PNG, and the sha256 of the RGB bytes of each region [left, top, right, bottom].
const probe = (file, boxes = []) => JSON.parse(execFileSync('python3', ['-c', `import hashlib, json, sys
from PIL import Image
image = Image.open(sys.argv[1]).convert('RGB')
print(json.dumps([image.size, [hashlib.sha256(image.crop(tuple(b)).tobytes()).hexdigest() for b in json.loads(sys.argv[2])]]))`, file, JSON.stringify(boxes)], { encoding: 'utf8' }));
const solid = (color, width, height) => createHash('sha256').update(Buffer.from(Array.from({ length: width * height }, () => color).flat())).digest('hex');
const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const capture = (run, scene, crop, theme = 'moonlit-candle') => path.join(run, 'captures', 'main', '1', scene, theme, 'default', `${crop}.png`);
const withRun = (fn) => {
  const run = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-release-images-'));
  try { fn(run); } finally { fs.rmSync(run, { recursive: true, force: true }); }
};
const run = (...args) => spawnSync('python3', [script, ...args], { encoding: 'utf8' });
const THEMES = ['moonlit-candle', 'moonlit', 'daydream', 'coven-contrast'];
const makeThemes = (dir, size = [64, 48], options = () => ({})) => THEMES.forEach((theme, index) => make(capture(dir, 'showcase', 'full', theme), size, [0, 0, ...size], { seed: index, ...options(theme) }));
// A refused input exits non-zero with a message on stderr (no traceback) and leaves nothing at the output path.
const refused = (result, ...mentions) => {
  assert.notEqual(result.status, 0, 'exit status');
  assert.doesNotMatch(result.stderr, /Traceback/);
  mentions.forEach((text) => assert.ok(result.stderr.includes(text), `stderr names ${text}: ${result.stderr}`));
};

test('themes: one image per color theme, the showcase\'s full window copied byte for byte, each input\'s provenance printed', () => withRun((dir) => {
  makeThemes(dir);
  const result = run('themes', dir, path.join(dir, 'out'));
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(fs.readdirSync(path.join(dir, 'out')).sort(), THEMES.map((theme) => `${theme}.png`).sort());
  THEMES.forEach((theme) => {
    const source = capture(dir, 'showcase', 'full', theme);
    assert.deepEqual(probe(path.join(dir, 'out', `${theme}.png`), [[0, 0, 64, 48]]), probe(source, [[0, 0, 64, 48]]), theme);
    assert.ok(result.stdout.includes(sha256(source)), `provenance sha256 of ${theme}`);
    assert.ok(result.stdout.includes(path.relative(dir, source)), `provenance path of ${theme}`);
    assert.ok(result.stdout.includes(`${path.join(dir, 'out', `${theme}.png`)}: 64x48`), `size line of ${theme}`);
  });
  assert.ok(!result.stdout.includes(dir + path.sep + 'captures'), 'provenance paths are relative to the run directory');
}));

test('themes: a missing capture, captures of different sizes, a blank capture: refused with a message, nothing written', () => withRun((dir) => {
  makeThemes(dir);
  fs.rmSync(capture(dir, 'showcase', 'full', 'daydream'));
  refused(run('themes', dir, path.join(dir, 'out')), capture(dir, 'showcase', 'full', 'daydream'));
  assert.equal(fs.existsSync(path.join(dir, 'out')), false, 'no output directory, so no partial set');
  make(capture(dir, 'showcase', 'full', 'daydream'), [65, 48], [0, 0, 65, 48]);
  refused(run('themes', dir, path.join(dir, 'out')), 'daydream', '65x48');
  assert.equal(fs.existsSync(path.join(dir, 'out')), false);
  make(capture(dir, 'showcase', 'full', 'daydream'), [64, 48], [0, 0, 0, 0]);
  refused(run('themes', dir, path.join(dir, 'out')), 'daydream');
  assert.equal(fs.existsSync(path.join(dir, 'out')), false);
}));

test('input modes: opaque RGB, or RGBA with every alpha 255 (then the alpha is dropped, the colours kept); anything else is refused', () => withRun((dir) => {
  makeThemes(dir, [64, 48], (theme) => (theme === 'moonlit' ? { mode: 'RGBA' } : {}));
  const result = run('themes', dir, path.join(dir, 'out'));
  assert.equal(result.status, 0, result.stderr);
  const opaque = capture(dir, 'showcase', 'full', 'moonlit');
  assert.deepEqual(probe(path.join(dir, 'out', 'moonlit.png'), [[0, 0, 64, 48]]), probe(opaque, [[0, 0, 64, 48]]));
  assert.equal(execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nprint(Image.open(sys.argv[1]).mode)', path.join(dir, 'out', 'moonlit.png')], { encoding: 'utf8' }).trim(), 'RGB');
  fs.rmSync(path.join(dir, 'out'), { recursive: true });
  make(opaque, [64, 48], [0, 0, 64, 48], { mode: 'RGBA', alpha: 254 });
  refused(run('themes', dir, path.join(dir, 'out')), 'moonlit', 'alpha');
  assert.equal(fs.existsSync(path.join(dir, 'out')), false);
  make(opaque, [64, 48], [0, 0, 64, 48], { mode: 'L' });
  refused(run('themes', dir, path.join(dir, 'out')), 'moonlit', 'mode L');
  assert.equal(fs.existsSync(path.join(dir, 'out')), false);
}));

test('sheet: the three icon-sheet pages, each cut 8 px below and right of its last content, stacked top to bottom, pixels copied', () => withRun((dir) => {
  make(capture(dir, 'icon-sheet', 'panel'), [60, 40], [5, 5, 20, 16], { seed: 1 }); // content to x25, y21: 33x29
  make(capture(dir, 'icon-sheet-2', 'panel'), [60, 40], [5, 5, 30, 20], { seed: 2 }); // 43x33
  make(capture(dir, 'icon-sheet-3', 'panel'), [60, 40], [5, 5, 20, 16], { seed: 3 }); // 33x29
  const result = run('sheet', dir, path.join(dir, 'sheet.png'));
  assert.equal(result.status, 0, result.stderr);
  const [size, shas] = probe(path.join(dir, 'sheet.png'), [[0, 0, 33, 29], [0, 29, 43, 62], [0, 62, 33, 91], [33, 0, 43, 29], [33, 62, 43, 91]]);
  assert.deepEqual(size, [43, 29 + 33 + 29]);
  const page = (scene, box) => probe(capture(dir, scene, 'panel'), [box])[1][0];
  assert.deepEqual(shas.slice(0, 3), [page('icon-sheet', [0, 0, 33, 29]), page('icon-sheet-2', [0, 0, 43, 33]), page('icon-sheet-3', [0, 0, 33, 29])], 'pages in order, pixels as captured');
  assert.deepEqual(shas.slice(3), [solid(FILL, 10, 29), solid(FILL, 10, 29)], 'the narrower pages padded with #0D0916');
  assert.ok(result.stdout.includes(sha256(capture(dir, 'icon-sheet-2', 'panel'))), 'provenance sha256');
  assert.match(result.stdout, /crop 0,0,43,33/);
}));

// A panel as VS Code draws it: a 1-px border round the edge with anti-aliased rounded corners, and view separators from
// below the tab bar down to the bottom border, so no line of the capture is a single colour from end to end; the content
// (noise, never crossing a separator) fills only the top. Content boxes are [x, y, width, height].
const MAKE_PANEL = `import json, sys
from PIL import Image
file, seed = sys.argv[1], int(sys.argv[2])
w, h, boxes = 120, 90, json.loads(sys.argv[3])
image = Image.new('RGB', (w, h), (23, 16, 37))
for x in range(8, w - 8):
    image.putpixel((x, 0), (45, 40, 56)); image.putpixel((x, h - 1), (45, 40, 56))
for y in range(8, h - 8):
    image.putpixel((0, y), (45, 40, 56)); image.putpixel((w - 1, y), (45, 40, 56))
for x, y in [(1, 6), (2, 4), (4, 2), (6, 1), (1, h - 7), (2, h - 5), (4, h - 3), (6, h - 2), (w - 2, h - 7), (w - 3, h - 5), (w - 5, h - 3), (w - 7, h - 2)]:
    image.putpixel((x, y), (36, 30, 48))
for x in (40, 80):
    for y in range(6, h - 1):
        image.putpixel((x, y), (56, 35, 77))
for bx, by, bw, bh in boxes:
    for py in range(by, by + bh):
        for px in range(bx, bx + bw):
            image.putpixel((px, py), (100 + (px * 31 + py * 17 + seed) % 156, 100 + (px * 7 + py * 53 + seed * 3) % 156, 100 + (px * 11 + py * 3 + seed * 5) % 156))
image.save(file)`;
const makePanel = (file, boxes, seed) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  execFileSync('python3', ['-c', MAKE_PANEL, file, String(seed), JSON.stringify(boxes)]);
};

test('sheet: the panel\'s border and its full-height view separators are not content: each page is cut 8 px below its last row', () => withRun((dir) => {
  // Content ends at x 103 on every page (right 104 + 8 = 112) and at y 19, 27, 21 (bottom 20/28/22 + 8 = 28/36/30).
  makePanel(capture(dir, 'icon-sheet', 'panel'), [[4, 4, 30, 16], [44, 8, 30, 12], [84, 4, 20, 10]], 1);
  makePanel(capture(dir, 'icon-sheet-2', 'panel'), [[4, 4, 30, 24], [44, 8, 30, 12], [84, 4, 20, 10]], 2);
  makePanel(capture(dir, 'icon-sheet-3', 'panel'), [[4, 4, 30, 18], [84, 4, 20, 6]], 3);
  const result = run('sheet', dir, path.join(dir, 'sheet.png'));
  assert.equal(result.status, 0, result.stderr);
  const [size, shas] = probe(path.join(dir, 'sheet.png'), [[0, 0, 112, 28], [0, 28, 112, 64], [0, 64, 112, 94]]);
  assert.deepEqual(size, [112, 28 + 36 + 30], 'borders, separators and corners left out of the content bounds');
  const page = (scene, box) => probe(capture(dir, scene, 'panel'), [box])[1][0];
  assert.deepEqual(shas, [page('icon-sheet', [0, 0, 112, 28]), page('icon-sheet-2', [0, 0, 112, 36]), page('icon-sheet-3', [0, 0, 112, 30])], 'pixels as captured, separators included');
  assert.match(result.stdout, /icon-sheet\/moonlit-candle\/default\/panel\.png sha256 [0-9a-f]{64} size 120x90 crop 0,0,112,28/);
  assert.match(result.stdout, /icon-sheet-2\/moonlit-candle\/default\/panel\.png sha256 [0-9a-f]{64} size 120x90 crop 0,0,112,36/);
  assert.match(result.stdout, /icon-sheet-3\/moonlit-candle\/default\/panel\.png sha256 [0-9a-f]{64} size 120x90 crop 0,0,112,30/);
}));

test('sheet: a missing page, or a page that trims to almost nothing: refused with a message, no file written', () => withRun((dir) => {
  make(capture(dir, 'icon-sheet', 'panel'), [60, 40], [5, 5, 20, 16]);
  make(capture(dir, 'icon-sheet-3', 'panel'), [60, 40], [5, 5, 20, 16]);
  refused(run('sheet', dir, path.join(dir, 'sheet.png')), capture(dir, 'icon-sheet-2', 'panel'));
  assert.equal(fs.existsSync(path.join(dir, 'sheet.png')), false);
  make(capture(dir, 'icon-sheet-2', 'panel'), [60, 40], [5, 5, 4, 4]); // a stray 4x4 patch on a blank panel
  refused(run('sheet', dir, path.join(dir, 'sheet.png')), 'icon-sheet-2');
  assert.equal(fs.existsSync(path.join(dir, 'sheet.png')), false);
}));

test('terminal: VS Code\'s terminal panel, cut to the Windows Terminal capture\'s width, then a 24 px gutter, then Windows Terminal, pixels copied', () => withRun((dir) => {
  make(capture(dir, 'terminal', 'panel'), [80, 50], [2, 2, 70, 16], { seed: 4 }); // trimmed to 80x26, cut to 50x26
  make(path.join(dir, 'wt.png'), [50, 30], [0, 0, 50, 30], { background: [0, 0, 0], seed: 5 });
  const result = run('terminal', dir, path.join(dir, 'wt.png'), path.join(dir, 'terminal.png'));
  assert.equal(result.status, 0, result.stderr);
  const [size, shas] = probe(path.join(dir, 'terminal.png'), [[0, 0, 50, 26], [0, 26, 50, 30], [50, 0, 74, 30], [74, 0, 124, 30]]);
  assert.deepEqual(size, [50 + 24 + 50, 30]);
  assert.deepEqual(shas, [probe(capture(dir, 'terminal', 'panel'), [[0, 0, 50, 26]])[1][0], solid(FILL, 50, 4), solid(FILL, 24, 30), probe(path.join(dir, 'wt.png'), [[0, 0, 50, 30]])[1][0]]);
  assert.match(result.stdout, /VS Code 50 px \| gutter 24 px \| Windows Terminal 50 px/);
  assert.ok(result.stdout.includes(sha256(path.join(dir, 'wt.png'))), 'the Windows Terminal capture\'s sha256 (it is not in the harness manifest)');
}));

test('terminal: a missing Windows Terminal capture, a non-opaque one, a missing VS Code panel: refused with a message, no file written', () => withRun((dir) => {
  make(capture(dir, 'terminal', 'panel'), [80, 50], [2, 2, 70, 16]);
  refused(run('terminal', dir, path.join(dir, 'wt.png'), path.join(dir, 'terminal.png')), 'wt.png');
  assert.equal(fs.existsSync(path.join(dir, 'terminal.png')), false);
  make(path.join(dir, 'wt.png'), [50, 30], [0, 0, 50, 30], { mode: 'RGBA', alpha: 200 });
  refused(run('terminal', dir, path.join(dir, 'wt.png'), path.join(dir, 'terminal.png')), 'wt.png', 'alpha');
  assert.equal(fs.existsSync(path.join(dir, 'terminal.png')), false);
  make(path.join(dir, 'wt.png'), [50, 30], [0, 0, 50, 30]);
  fs.rmSync(capture(dir, 'terminal', 'panel'));
  refused(run('terminal', dir, path.join(dir, 'wt.png'), path.join(dir, 'terminal.png')), capture(dir, 'terminal', 'panel'));
  assert.equal(fs.existsSync(path.join(dir, 'terminal.png')), false);
}));

// A terminal panel as VS Code draws it: its field (#0D0916) is the most frequent colour, unlike the corner pixels outside
// the rounded 1-px border and the tab strip (#171025, the panel colour); the strip holds the panel's view icons at the
// left and its action icons at the top right; the field holds text and, below it, a solid cursor block. Items are
// [x, y, width, height] boxes of noise, or [x, y, width, height, r, g, b] solid boxes.
const MAKE_TERMINAL = `import json, sys
from PIL import Image
file, seed = sys.argv[1], int(sys.argv[2])
w, h, items = 120, 90, json.loads(sys.argv[3])
image = Image.new('RGB', (w, h), (23, 16, 37))
for y in range(13, h - 1):
    for x in range(1, w - 1):
        image.putpixel((x, y), (13, 9, 22))
for x in range(8, w - 8):
    image.putpixel((x, 0), (45, 40, 56)); image.putpixel((x, h - 1), (45, 40, 56))
for y in range(8, h - 8):
    image.putpixel((0, y), (45, 40, 56)); image.putpixel((w - 1, y), (45, 40, 56))
for x, y in [(1, 6), (2, 4), (4, 2), (6, 1), (1, h - 7), (2, h - 5), (4, h - 3), (6, h - 2), (w - 2, h - 7), (w - 3, h - 5), (w - 5, h - 3), (w - 7, h - 2)]:
    image.putpixel((x, y), (36, 30, 48))
for item in items:
    bx, by, bw, bh = item[:4]
    for py in range(by, by + bh):
        for px in range(bx, bx + bw):
            image.putpixel((px, py), tuple(item[4:]) if len(item) > 4 else (100 + (px * 31 + py * 17 + seed) % 156, 100 + (px * 7 + py * 53 + seed * 3) % 156, 100 + (px * 11 + py * 3 + seed * 5) % 156))
image.save(file)`;
const makeTerminal = (file, items, seed = 6) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  execFileSync('python3', ['-c', MAKE_TERMINAL, file, String(seed), JSON.stringify(items)]);
};
const TERMINAL_ITEMS = [[4, 3, 16, 7], [92, 3, 16, 7], [6, 16, 40, 20], [6, 60, 4, 8, 255, 103, 183]]; // view icons, actions, text, cursor

test('terminal: the background is the panel\'s most frequent colour, so the trim keeps the tab strip\'s actions, the text and the cursor block', () => withRun((dir) => {
  // Content ends at x 107 (the action icons: right 108 + 8 = 116) and y 67 (the cursor: bottom 68 + 8 = 76).
  makeTerminal(capture(dir, 'terminal', 'panel'), TERMINAL_ITEMS);
  make(path.join(dir, 'wt.png'), [130, 40], [0, 0, 130, 40], { background: [0, 0, 0], seed: 7 });
  const result = run('terminal', dir, path.join(dir, 'wt.png'), path.join(dir, 'terminal.png'));
  assert.equal(result.status, 0, result.stderr);
  const [size, shas] = probe(path.join(dir, 'terminal.png'), [[0, 0, 116, 76], [116, 0, 140, 76], [140, 0, 270, 40]]);
  assert.deepEqual(size, [116 + 24 + 130, 76]);
  assert.deepEqual(shas, [probe(capture(dir, 'terminal', 'panel'), [[0, 0, 116, 76]])[1][0], solid(FILL, 24, 76), probe(path.join(dir, 'wt.png'), [[0, 0, 130, 40]])[1][0]]);
  assert.match(result.stdout, /terminal\/moonlit-candle\/default\/panel\.png sha256 [0-9a-f]{64} size 120x90 crop 0,0,116,76/);
}));
