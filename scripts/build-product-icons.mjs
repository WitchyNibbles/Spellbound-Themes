import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont';
import svg2ttf from 'svg2ttf';
import ttf2woff from 'ttf2woff';

const root = path.resolve(import.meta.dirname, '..');
const sourceDirectory = path.join(root, 'icons', 'product-src');
const mapPath = path.join(root, 'icons', 'product-icon-map.json');
const themePath = path.join(root, 'icons', 'product-icon-theme.json');
const fontPath = path.join(root, 'icons', 'witchynibbles-product-icons.woff');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const entries = Object.entries(map.icons ?? {});

if (map.fontId !== 'witchynibbles-product-icons') {
  throw new Error(`Unexpected product icon font ID: ${map.fontId}`);
}
if (map.fontFamily !== 'WitchyNibbles Product Icons') {
  throw new Error(`Unexpected product icon font family: ${map.fontFamily}`);
}
if (entries.length !== 48) {
  throw new Error(`Expected exactly 48 product icon mappings, found ${entries.length}`);
}

const codepoints = new Set();
for (const [iconId, hexadecimal] of entries) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(iconId)) {
    throw new Error(`Invalid product icon ID: ${iconId}`);
  }
  if (!/^E[0-9A-F]{3}$/.test(hexadecimal)) {
    throw new Error(`${iconId} has invalid PUA codepoint: ${hexadecimal}`);
  }
  if (codepoints.has(hexadecimal)) {
    throw new Error(`Duplicate PUA codepoint: ${hexadecimal}`);
  }
  codepoints.add(hexadecimal);
}

const expectedFiles = entries.map(([iconId]) => `${iconId}.svg`).sort();
const sourceFiles = fs.existsSync(sourceDirectory)
  ? fs.readdirSync(sourceDirectory).filter((file) => file.endsWith('.svg')).sort()
  : [];
if (JSON.stringify(sourceFiles) !== JSON.stringify(expectedFiles)) {
  const missing = expectedFiles.filter((file) => !sourceFiles.includes(file));
  const extra = sourceFiles.filter((file) => !expectedFiles.includes(file));
  throw new Error([
    `Expected one exact SVG source for each mapped product icon.`,
    missing.length ? `Missing: ${missing.join(', ')}` : '',
    extra.length ? `Unexpected: ${extra.join(', ')}` : '',
  ].filter(Boolean).join(' '));
}

const fontStream = new SVGIcons2SVGFontStream({
  fontName: map.fontFamily,
  fontId: map.fontId,
  fixedWidth: true,
  centerHorizontally: true,
  centerVertically: true,
  normalize: true,
  preserveAspectRatio: true,
  fontHeight: 1024,
  descent: 0,
  round: 1e6,
  metadata: 'Original WitchyNibbles product icon artwork.',
  log: () => {},
});

const chunks = [];
fontStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
const completed = new Promise((resolve, reject) => {
  fontStream.once('end', resolve);
  fontStream.once('error', reject);
});

for (const [iconId, hexadecimal] of entries) {
  const sourcePath = path.join(sourceDirectory, `${iconId}.svg`);
  const source = fs.readFileSync(sourcePath, 'utf8');
  if (!/<svg\b[^>]*\bviewBox=["']0 0 16 16["']/i.test(source)) {
    throw new Error(`${iconId}.svg must use viewBox=\"0 0 16 16\"`);
  }
  if (/<(?:text|image|use)\b/i.test(source) || /\bstroke\s*=/i.test(source)) {
    throw new Error(`${iconId}.svg must contain original filled vector paths only`);
  }
  if (!/<path\b/i.test(source)) {
    throw new Error(`${iconId}.svg does not contain a path`);
  }

  const glyph = Readable.from([source]);
  glyph.metadata = {
    name: iconId,
    unicode: [String.fromCodePoint(Number.parseInt(hexadecimal, 16))],
  };
  fontStream.write(glyph);
}
fontStream.end();
await completed;

const svgFont = Buffer.concat(chunks).toString('utf8');
const ttf = svg2ttf(svgFont, {
  id: map.fontId,
  familyname: map.fontFamily,
  fullname: map.fontFamily,
  description: 'Original WitchyNibbles product icons for Visual Studio Code.',
  copyright: 'Copyright WitchyNibbles.',
  url: 'https://marketplace.visualstudio.com/publishers/EimiMartinez',
  version: '1.2',
  ts: 0,
});
const woff = ttf2woff(new Uint8Array(ttf.buffer));
fs.writeFileSync(fontPath, Buffer.from(woff.buffer));

const iconDefinitions = Object.fromEntries(entries.map(([iconId, hexadecimal]) => [
  iconId,
  { fontCharacter: `\\${hexadecimal}`, fontId: map.fontId },
]));
const theme = {
  $schema: 'vscode://schemas/product-icon-theme',
  fonts: [{
    id: map.fontId,
    family: map.fontFamily,
    src: [{ path: './witchynibbles-product-icons.woff', format: 'woff' }],
    weight: 'normal',
    style: 'normal',
  }],
  iconDefinitions,
};
fs.writeFileSync(themePath, `${JSON.stringify(theme, null, 2)}\n`);

console.log(`Built ${entries.length} original product icons in ${path.relative(root, fontPath)}`);
