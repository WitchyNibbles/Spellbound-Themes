// Final review M5: two generated outputs could drift from their generators unnoticed. validate reads the committed
// themes/*.json while the theme tests read createThemes(), and checkFontGeometry compares only each glyph's bounding box,
// so an interior change to a product icon source did not trip it. Both builds are deterministic, so each is regenerated
// here and compared byte for byte with the committed files (npm run build rewrites them; npm run package does it first).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createThemes, themeFilenames } from '../src/theme-definition.mjs';
import { buildProductIcons } from '../scripts/lib/product-icons-build.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('themes/*.json are exactly what createThemes() writes (run npm run build after changing src/theme-definition.mjs)', () => {
  const themes = createThemes();
  assert.equal(themes.length, themeFilenames.length);
  assert.deepEqual(fs.readdirSync(path.join(root, 'themes')).sort(), [...themeFilenames].sort(), 'no stale theme file');
  for (const [index, theme] of themes.entries()) {
    const file = path.join('themes', themeFilenames[index]);
    assert.ok(fs.readFileSync(path.join(root, file), 'utf8') === `${JSON.stringify(theme, null, 2)}\n`, `${file} differs from its generator`);
  }
});

test('the product icon font and theme are exactly what a fresh build writes (run npm run build:product-icons)', async () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-product-drift-'));
  try {
    const { fontPath, themePath } = await buildProductIcons({ root, outDir });
    for (const built of [fontPath, themePath]) {
      const file = path.join('icons', path.basename(built));
      assert.ok(fs.readFileSync(built).equals(fs.readFileSync(path.join(root, file))), `${file} differs from a fresh build`);
    }
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
});
