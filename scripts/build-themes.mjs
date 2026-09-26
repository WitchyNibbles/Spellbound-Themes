import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createThemes, themeFilenames } from '../src/theme-definition.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(resolve(root, 'themes'), { recursive: true });
for (const [index, theme] of createThemes().entries()) {
  if (Object.values(theme.colors).some((value) => typeof value !== 'string') || Object.values(theme.semanticTokenColors).some((value) => typeof value !== 'string')) {
    throw new Error(`${theme.name}: undefined theme color`);
  }
  await writeFile(resolve(root, 'themes', themeFilenames[index]), `${JSON.stringify(theme, null, 2)}\n`, 'utf8');
}
