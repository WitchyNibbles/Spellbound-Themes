// Writes one source per file drawing to icons/file-src/<drawing>.svg (spec 6.1) and removes sources no module draws.
import fs from 'node:fs';
import path from 'node:path';
import { fileGlyphModules } from './file-glyphs/index.mjs';

const dir = path.resolve(import.meta.dirname, '..', 'icons', 'file-src');
const entries = fileGlyphModules.flatMap(({ drawings }) => Object.entries(drawings));
const names = entries.map(([name]) => name);
const repeated = names.filter((name, index) => names.indexOf(name) !== index);
if (repeated.length) throw new Error(`File drawings named twice: ${[...new Set(repeated)].join(', ')}`);
fs.mkdirSync(dir, { recursive: true });
for (const [name, draw] of entries) fs.writeFileSync(path.join(dir, `${name}.svg`), draw());
const stale = fs.readdirSync(dir).filter((file) => !names.includes(file.replace(/\.svg$/, '')));
for (const file of stale) fs.rmSync(path.join(dir, file));
console.log(`Wrote ${entries.length} file-icon sources${stale.length ? `, removed ${stale.join(', ')}` : ''}`);
