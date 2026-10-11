// npm run build:file-icons (spec 6.1): resolves icons/file-src/ into icons/file-icons/{dark,light,high-contrast}/ and
// regenerates icons/file-icon-theme.json from icons/file-icon-map.json.
import fs from 'node:fs';
import path from 'node:path';
import { KEY_PROPERTIES, buildFileIconTheme, readFileIconInputs } from './lib/file-icons-build.mjs';

const root = path.resolve(import.meta.dirname, '..');
const { map, sources } = readFileIconInputs(root);
const { theme, files } = buildFileIconTheme(map, sources);
fs.rmSync(path.join(root, 'icons', 'file-icons'), { recursive: true, force: true });
for (const [relative, svg] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), svg);
}
fs.writeFileSync(path.join(root, 'icons', 'file-icon-theme.json'), `${JSON.stringify(theme, null, 2)}\n`);
const counts = KEY_PROPERTIES.map((property) => `${Object.keys(theme[property] ?? {}).length} ${property}`).join(', ');
console.log(`Built ${Object.keys(map.drawings).length} file-icon drawings (${Object.keys(files).length} SVGs in icons/file-icons/) and icons/file-icon-theme.json: ${counts}`);
