# WitchyNibbles icon assets

The file icon theme is defined in file-icon-theme.json.

The product icon theme is built from the drawing-based map in `product-icon-map.json`: each drawing has one SVG in `product-src/`, one private-use codepoint, and the list of VS Code icon IDs that use it. Drawings are written as code in `scripts/glyphs/` (`npm run draw:glyphs` regenerates the SVGs; the tests fail if a committed SVG drifts from its generator). `node scripts/claim-drawing.mjs <drawing> <codepoint> <id…>` assigns IDs, and `npm run build:product-icons` regenerates `product-icon-theme.json` and `witchynibbles-product-icons.woff`. `product-icon-ids.json` pins the VS Code 1.141 keys the theme must cover. `product-src-variants/` holds alternatives for review gates; they never enter the font.

These product glyphs were drawn for this extension. They do not use the VS Code Codicons font. Product icon themes are monochrome; VS Code applies the active color theme to them.
