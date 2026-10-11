#!/usr/bin/env node
// Scans gate evidence before it is committed and reports user names, user directories and email addresses in it.
// Usage: node scripts/review/privacy-scan.mjs <file>...
//   .png files are read with OCR (python3 with Pillow upscales them 3x, then tesseract reads them; a tall image is cut
//   into overlapping horizontal tiles first, because tesseract refuses an image over ~32,000 px once it is upscaled);
//   .json, .md and .txt files are read as text. Exit 0: nothing found. Exit 1: something found. Exit 2: the scan could not run (no file
//   given, a missing or unsupported file, a .png OCR reads fewer than 20 characters from, no Windows user name under WSL, no Pillow or tesseract): it fails closed.
// The names come from this machine at run time (the WSL user, Windows %USERNAME% and the %USERPROFILE% folder), and
// the output names the kind of finding, never the name, so no name is written to disk or into committed output.
// PRIVACY_SCAN_CMD, PRIVACY_SCAN_PYTHON and PRIVACY_SCAN_TESSERACT override cmd.exe, python3 and tesseract (tests).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MIN_OCR_CHARS = 20;
// A tile is TILE_HEIGHT source pixels tall, so 3x upscaled it is far below tesseract's 32,767 px limit. Each tile starts
// TILE_HEIGHT - TILE_OVERLAP below the last; the overlap is larger than the tallest text line, so a line a tile cuts
// is whole in the next one.
export const TILE_HEIGHT = 2000;
export const TILE_OVERLAP = 400;
const TEXT = new Set(['.json', '.md', '.txt']);

// OCR spaces out path separators ("C: \Users\Name\ AppData"); join them before matching.
export const normaliseOcr = (text) => text.replace(/[ \t]*([:\\/])[ \t]*/g, '$1');

export function findPrivateText(text, names) {
  const flat = normaliseOcr(text);
  const found = [];
  for (const name of names.filter((candidate) => candidate.length >= 3)) {
    if (new RegExp(`(?<![a-z])${escape(name)}(?![a-z])`, 'i').test(flat)) found.push(`user name "${name.toLowerCase()}"`);
  }
  const directories = /[A-Za-z]:\\Users\\(?!<user>)[^\\\s"']+|\\\\wsl(?:\.localhost|\$)\\[^\\\s"']+\\home\\(?!<user>)[^\\\s"']+|\/(?:home|Users)\/(?!<user>)[^/\s"']+/g;
  for (const [match] of flat.matchAll(directories)) found.push(`user directory "${match}"`);
  for (const [match] of flat.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) found.push(`email address "${match}"`);
  return found;
}

const isWsl = () => Boolean(process.env.WSL_DISTRO_NAME)
  || (fs.existsSync('/proc/version') && /microsoft/i.test(fs.readFileSync('/proc/version', 'utf8')));

export function machineUserNames() {
  const names = new Set([os.userInfo().username]);
  if (!isWsl()) return [...names];
  let output;
  try {
    output = execFileSync(process.env.PRIVACY_SCAN_CMD ?? 'cmd.exe', ['/d', '/c', 'echo %USERNAME%^|%USERPROFILE%'], { cwd: '/mnt/c', encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    throw new Error('cannot read the Windows user name through cmd.exe (WSL interop off?); refusing to scan without it');
  }
  const [user, profile] = output.trim().split('|');
  if (!user || user.includes('%')) throw new Error('cmd.exe returned no Windows user name; refusing to scan without it');
  names.add(user);
  if (profile && !profile.includes('%')) names.add(path.win32.basename(profile));
  return [...names];
}

// Grey, light text on dark, three times larger: tesseract misses 100% UI text on a dark theme without this. Writes the
// image as overlapping tiles (one tile when it is short); a tile of a single colour has no text and is not written.
const PREPARE = `import sys
from PIL import Image, ImageOps
source, directory, tile_height, overlap = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
image = Image.open(source).convert('L')
if sum(image.resize((64, 64)).getdata()) / 4096 < 128:
    image = ImageOps.invert(image)
top, number = 0, 0
while True:
    bottom = min(top + tile_height, image.height)
    tile = image.crop((0, top, image.width, bottom))
    low, high = tile.getextrema()
    if low != high:
        tile.resize((tile.width * 3, tile.height * 3), Image.LANCZOS).save('%s/tile-%04d.png' % (directory, number))
    if bottom == image.height:
        break
    top += tile_height - overlap
    number += 1`;

function checkOcrTools() {
  const python = process.env.PRIVACY_SCAN_PYTHON ?? 'python3';
  const tesseract = process.env.PRIVACY_SCAN_TESSERACT ?? 'tesseract';
  try {
    execFileSync(python, ['-I', '-c', 'import PIL'], { stdio: 'ignore' });
  } catch {
    throw new Error(`cannot run ${python} with Pillow, which the OCR needs to read 100% UI text`);
  }
  try {
    execFileSync(tesseract, ['--version'], { stdio: 'ignore' });
  } catch {
    throw new Error(`cannot run ${tesseract} (OCR)`);
  }
  return { python, tesseract };
}

// The text of each tile of the image that is not a single colour (none when the whole image is).
function ocr(file, scratch, { python, tesseract }) {
  const directory = fs.mkdtempSync(path.join(scratch, 'tiles-'));
  execFileSync(python, ['-I', '-c', PREPARE, file, directory, String(TILE_HEIGHT), String(TILE_OVERLAP)], { stdio: 'ignore' });
  return fs.readdirSync(directory).sort().map((tile) => execFileSync(tesseract, [path.join(directory, tile), 'stdout'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }));
}

function main(files) {
  if (!files.length) throw new Error('nothing to scan: give the sheets, manifest.json and README.md to check');
  for (const file of files) {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`no such file: ${file}`);
    const kind = path.extname(file).toLowerCase();
    if (kind !== '.png' && !TEXT.has(kind)) throw new Error(`cannot scan ${file}: only .png, .json, .md and .txt`);
  }
  const names = machineUserNames();
  const tools = files.some((file) => path.extname(file).toLowerCase() === '.png') ? checkOcrTools() : null;
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'privacy-scan-'));
  let problems = 0;
  try {
    for (const file of files) {
      const kind = path.extname(file).toLowerCase();
      let texts = kind === '.png' ? ocr(file, scratch, tools) : [fs.readFileSync(file, 'utf8')];
      // Fails closed: an image that OCR read (almost) nothing from is not clean, it is unread.
      if (kind === '.png' && texts.join('').replace(/\s/g, '').length < MIN_OCR_CHARS) throw new Error(`could not scan ${file}: OCR read fewer than ${MIN_OCR_CHARS} characters from it`);
      if (kind === '.json') texts = texts.map((text) => text.replaceAll('\\\\', '\\')); // JSON escapes each backslash of a Windows path
      // A tile is searched on its own; what two tiles both read in their overlap is one finding.
      const all = texts.flatMap((text) => findPrivateText(text, names));
      const found = texts.length > 1 ? [...new Set(all)] : all;
      problems += found.length;
      // The kind of finding only, never the matched text, so the output can be pasted into a review.
      console.log(`${found.length ? '✗' : '✓'} ${file}${found.length ? `: ${found.length} finding(s): ${found.map((item) => item.split(' "')[0]).join(', ')}` : ''}`);
    }
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
  return problems ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(`privacy-scan: ${error.message}`);
    process.exitCode = 2;
  }
}
