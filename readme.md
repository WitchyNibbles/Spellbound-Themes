# WitchyNibbles Spellbound Themes

A coordinated VS Code collection with three color themes, matching file icons, and an original product icon font. Moonlit purple, neon pink, and electric blue carry the palette across Python, JavaScript, TypeScript, CSS, JSON, and YAML.

## Choose your atmosphere

- **Moonlit:** dark aubergine surfaces with lavender and neon accents.
- **Daydream:** pale lilac surfaces with deep purple text.
- **Coven Contrast:** high contrast dark surfaces with clear focus and selection states.

The collection avoids green accents.

## Install and select

Build the VSIX with npm run package, then use **Extensions: Install from VSIX...** in VS Code. The Marketplace publisher is EimiMartinez.

After installation, use the Command Palette to select:

1. **Preferences: Color Theme** → a WitchyNibbles color theme.
2. **Preferences: File Icon Theme** → WitchyNibbles Icons.
3. **Preferences: Product Icon Theme** → WitchyNibbles Product Icons.

## Original product icons

Version 1.2.0 replaces the bundled stock Codicons font with a WitchyNibbles font built from 48 original SVG sources. The most visible workbench icons include a spellbook for Explorer, a crystal search lens, a lunar source control branch, a witch hat profile, and a cauldron terminal. Familiar controls such as close, check, and split remain recognizable at small sizes.

Product icon fonts are monochrome. VS Code colors the glyphs with the active color theme.

![Preview of eight original WitchyNibbles product icons](https://github.com/WitchyNibbles/pastel-princess/raw/HEAD/assets/screenshots/product-icons.png)

## Color theme previews

![WitchyNibbles Moonlit preview](https://github.com/WitchyNibbles/pastel-princess/raw/HEAD/assets/screenshots/moonlit.png)

![WitchyNibbles Daydream preview](https://github.com/WitchyNibbles/pastel-princess/raw/HEAD/assets/screenshots/daydream.png)

![WitchyNibbles Coven Contrast preview](https://github.com/WitchyNibbles/pastel-princess/raw/HEAD/assets/screenshots/coven-contrast.png)

## Build locally

From this directory:

~~~
npm install
npm run build
npm run validate
npm run package
~~~

The build regenerates the color themes and product icon font. Validation checks theme references, color contrast, product icon sources and font mappings, and forbidden green accents. The package command creates a VSIX; it does not publish to Marketplace.

## Feedback

For a readability or icon issue, include the theme name, VS Code version, affected UI action or language, and a screenshot.

## License

MIT. See [LICENSE.md](https://github.com/WitchyNibbles/pastel-princess/blob/HEAD/LICENSE.md).
