// Writes the file-icon sheet (spec 6.3) to review-out/file-icon-sheet/index.html with the resolved SVGs beside it.
// Usage: npm run file-icon-sheet
import fs from 'node:fs';
import path from 'node:path';
import { fileIconSheet } from './lib/file-icon-sheet.mjs';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'review-out', 'file-icon-sheet');
const { html, files } = fileIconSheet({ root });
fs.rmSync(path.join(out, 'svg'), { recursive: true, force: true });
for (const [relative, text] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(path.join(out, relative)), { recursive: true });
  fs.writeFileSync(path.join(out, relative), text);
}
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log(`${path.relative(root, path.join(out, 'index.html'))}: ${Object.keys(files).length} resolved SVGs`);
