import fs from 'node:fs';
import path from 'node:path';
import { buildFont } from './product-font.mjs';
import { PRODUCT_FONT, iconDefinitionsFor, validateMap } from './product-icon-map.mjs';

// Spec section 5.1: one glyph per drawing, every ID of a drawing shares its codepoint.
// `overrides` maps a drawing name to an alternative SVG path (gate variants, Task 17).
export async function buildProductIcons({ root, outDir = root, overrides = {} }) {
  const map = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'product-icon-map.json'), 'utf8'));
  const sourceDir = path.join(root, 'icons', 'product-src');
  const sourceFiles = fs.existsSync(sourceDir) ? fs.readdirSync(sourceDir).filter((file) => file.endsWith('.svg')).sort() : [];
  const errors = validateMap(map, { sourceFiles });
  if (errors.length) throw new Error(`icons/product-icon-map.json is invalid:\n${errors.join('\n')}`);
  const unknown = Object.keys(overrides).filter((name) => !(name in map.drawings));
  if (unknown.length) throw new Error(`Overrides name unknown drawings: ${unknown.join(', ')}`);

  const glyphs = Object.entries(map.drawings).map(([name, { codepoint }]) => ({
    name,
    codepoint,
    svg: fs.readFileSync(overrides[name] ?? path.join(sourceDir, `${name}.svg`), 'utf8'),
  }));
  const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const woff = await buildFont({ fontId: PRODUCT_FONT.id, fontFamily: PRODUCT_FONT.family, version: version.split('.').slice(0, 2).join('.'), glyphs });

  const iconsOut = path.join(outDir, 'icons');
  fs.mkdirSync(iconsOut, { recursive: true });
  const fontPath = path.join(iconsOut, path.basename(PRODUCT_FONT.file));
  fs.writeFileSync(fontPath, woff);
  const theme = {
    $schema: 'vscode://schemas/product-icon-theme',
    fonts: [{ id: PRODUCT_FONT.id, family: PRODUCT_FONT.family, src: [{ path: PRODUCT_FONT.themeSrc, format: 'woff' }], weight: 'normal', style: 'normal' }],
    iconDefinitions: iconDefinitionsFor(map),
  };
  const themePath = path.join(iconsOut, 'product-icon-theme.json');
  fs.writeFileSync(themePath, `${JSON.stringify(theme, null, 2)}\n`);
  return { drawings: glyphs.length, ids: Object.keys(theme.iconDefinitions).length, fontPath, themePath };
}
