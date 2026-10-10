// Packages the extension for review. Usage:
//   node scripts/review/stage-extension.mjs <outDir>                                 -> spellbound-main.vsix
//   node scripts/review/stage-extension.mjs <outDir> --variant=<drawing>=<svg> ...   -> spellbound-variants.vsix
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildProductIcons } from '../lib/product-icons-build.mjs';

const root = path.resolve(import.meta.dirname, '..', '..');
const [outArg, ...rest] = process.argv.slice(2);
const outDir = path.resolve(outArg);
const overrides = Object.fromEntries(rest.filter((arg) => arg.startsWith('--variant=')).map((arg) => {
  const [name, file] = arg.slice('--variant='.length).split('=');
  return [name, path.resolve(root, file)];
}));
const label = Object.keys(overrides).length ? 'variants' : 'main';
const ext = path.join(outDir, `ext-${label}`);
fs.rmSync(ext, { recursive: true, force: true });
for (const item of ['package.json', 'README.md', 'CHANGELOG.md', 'LICENSE.md', '.vscodeignore', 'themes', 'icons', 'assets']) {
  fs.cpSync(path.join(root, item), path.join(ext, item), { recursive: true });
}
if (label === 'variants') await buildProductIcons({ root, outDir: ext, overrides });
const vsix = path.join(outDir, `spellbound-${label}.vsix`);
execFileSync(path.join(root, 'node_modules', '.bin', 'vsce'), ['package', '--no-dependencies',
  '--baseImagesUrl', 'https://raw.githubusercontent.com/WitchyNibbles/Spellbound-Themes/main',
  '--baseContentUrl', 'https://github.com/WitchyNibbles/Spellbound-Themes/blob/main', '-o', vsix], { cwd: ext, stdio: 'inherit' });
console.log(vsix);
