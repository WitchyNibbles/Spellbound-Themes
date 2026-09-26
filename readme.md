# WitchyNibbles Spellbound Themes

Version 1.1.0 adds a matching **WitchyNibbles Product Icons** theme alongside the color themes and file icons.

WitchyNibbles is a coordinated VS Code theme family where moonlit purple meets neon pink and electric blue. It is designed for clear, comfortable coding across Python, JavaScript, TypeScript, CSS, JSON, and YAML, with no green accents.

## Choose your atmosphere

- **Moonlit** — A deep aubergine dark theme with soft lavender surfaces and bright neon token accents.
- **Daydream** — A pale lilac light theme with ink text, royal purple structure, and pink and blue highlights.
- **Coven Contrast** — A high contrast theme for maximum separation and reliable visibility.

The extension includes **WitchyNibbles Icons**, a matching file icon theme.

## Install

The extension can be installed from a local `.vsix`. Run `npm run package`, then in VS Code run `Extensions: Install from VSIX...` and select the generated file.

The Marketplace publisher ID is `EimiMartinez`. The repository does not publish automatically.

After installation, use the Command Palette to choose `Preferences: Color Theme`. For matching files, run `Preferences: File Icon Theme` and select **WitchyNibbles Icons**. For matching command and activity icons, run `Preferences: Product Icon Theme` and select **WitchyNibbles Product Icons**.

## Product icons

After installing the extension, open the Command Palette and choose `Preferences: Product Icon Theme`, then select **WitchyNibbles Product Icons**. The set covers the activity bar, explorer, search, source control, debug, extensions, settings, account, terminal, and common editor actions with the collection's pink, blue, purple, black, and white palette.

## Preview

![WitchyNibbles Moonlit preview](https://github.com/WitchyNibbles/pastel-princess/raw/HEAD/assets/screenshots/moonlit.png)

![WitchyNibbles Daydream preview](https://github.com/WitchyNibbles/pastel-princess/raw/HEAD/assets/screenshots/daydream.png)

![WitchyNibbles Coven Contrast preview](https://github.com/WitchyNibbles/pastel-princess/raw/HEAD/assets/screenshots/coven-contrast.png)

## Build locally

From this directory:

```sh
npm install
npm run build
npm run validate
npm run package
```

`npm run package` creates a VSIX through the local `@vscode/vsce` dependency. The build step generates distributable themes from the source palette files, and validation checks theme references, JSON, contrast, and forbidden green hues.

## Feedback

When reporting a readability issue, include the theme name, VS Code version, language, and a screenshot through the project’s chosen support channel.

## License

MIT. See [LICENSE.md](https://github.com/WitchyNibbles/pastel-princess/blob/HEAD/LICENSE.md).
