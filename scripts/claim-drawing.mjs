// node scripts/claim-drawing.mjs <drawing> <codepoint> <id> [<id> ...]   map IDs to a drawing
// node scripts/claim-drawing.mjs --drop-legacy                            remove every legacy drawing
import fs from 'node:fs';
import path from 'node:path';
import { claimDrawing, dropLegacy } from './lib/product-icon-map.mjs';

const root = path.resolve(import.meta.dirname, '..');
const mapPath = path.join(root, 'icons', 'product-icon-map.json');
const [first, codepoint, ...ids] = process.argv.slice(2);
const dropping = first === '--drop-legacy';
const current = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
if (!dropping && (!first || !codepoint || !ids.length)) throw new Error('usage: claim-drawing.mjs <drawing> <codepoint> <id> [<id> ...]');
const { map, removed } = dropping
  ? dropLegacy(current)
  : claimDrawing(current, { name: first, codepoint, ids });
for (const name of removed) fs.rmSync(path.join(root, 'icons', 'product-src', `${name}.svg`), { force: true });
fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
const summary = dropping ? 'dropped legacy' : `${first} (${codepoint}) <- ${ids.join(', ')}`;
console.log(removed.length ? `${summary}; removed ${removed.join(', ')}` : summary);
