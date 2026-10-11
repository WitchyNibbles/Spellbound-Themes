# Changelog

## 2.0.0 — 2026-10-11

Spellbound Themes 2.0 shares the palette of the [Moonlit Candle](https://github.com/WitchyNibbles/moonlit-candle) terminal theme (witchyterm) and redraws the file icons and the workbench's product icons.

- **New color theme, WitchyNibbles Moonlit Candle**, first in the list: candle gold `#FFD477` for what is active, pink `#FF67B7` for what needs you, lavender `#B99AFF` for keywords and focus, mint for added, amber for modified, on Moonlit's night surfaces. Its integrated terminal is witchyterm's Moonlit Candle scheme.
- **Product icons redrawn from scratch:** 109 drawings for 177 icon IDs, every icon of a normal VS Code 1.141 session. Moons mark breakpoints, a candle the code actions, a cat chat and Copilot, a ✦ the unsaved tab.
- **File icons redrawn as objects coloured by category** (code, data, style, tests, config, docs, assets), with badged folders: 63 drawings for 57 file extensions, 27 file names and 19 folder names, in dark, light and high-contrast sets. They are original drawings: they echo a language's name, never its logo.
- **Typography in all four themes:** only keywords are bold, and not the ones the grammars mark as operators; comments, documentation and storage modifiers are italic.
- The README recommends `workbench.editor.highlightModifiedTabs` and Maple Mono NF, and documents `terminal.integrated.minimumContrastRatio: 1` for colours that match Windows Terminal exactly.

### Upgrading from 1.x

The Marketplace updates the extension across major versions, so this is the only warning you get. What changes:

- Moonlit: functions, classes, types, constants and operators are no longer bold, and storage modifiers (`static`, `readonly`, `async`) are italic instead of bold. Operators lost the bold they inherited from keywords, and so did the words the grammars mark as operators: TypeScript's `new`, `typeof`, `instanceof`, `delete` and `keyof`, Python's `and`, `or`, `not`, `in` and `is`. Added files and added lines are mint `#74E8B8` (were cyan `#74D7E8`), warnings amber `#FFB86B` (were gold `#FFD477`). The integrated terminal takes witchyterm's scheme: background `#0D0916` (was `#08060D`), foreground `#F3EAF7`, selection `#633B79` and all 16 ANSI colours. Debug stack frames are pink `#FF67B7` (current) and lavender `#B99AFF`.
- Daydream: the same bold and italic changes. Added files and added lines are dark mint `#0E7553` (were teal `#197F91`); input borders are `#8E78A6`, so they reach 3:1. Debug stack frames are `#B52776` and `#7042B2`.
- Coven Contrast: the same bold and italic changes. The focused row of a quick pick is pink `#FF67B7` with black text and icons. Debug stack frames are `#FF67B7` and `#D0B8FF`.
- Product icon keys dropped, so these fall back to VS Code's Codicons: `home`, `activity-bar-left`, `activity-bar-right`, `menu`, `copy`, `edit`, `save`; `file` and `folder` (the theme maps `symbol-file` and `symbol-folder` instead); `layout-sidebar-left`, `layout-sidebar-right` and `layout-panel` (the theme maps VS Code's registered layout toggles instead).
- Every file icon is new. `vite.config.ts` has no icon of its own any more (it shows the TypeScript gem), and icons that other extensions contribute for languages no longer show through (`showLanguageModeIcons` is off).
- To keep 1.2.1: in the Extensions view, open the gear menu of WitchyNibbles Spellbound Themes, choose **Install Another Version...** and pick 1.2.1; if VS Code offers 2.0.0 again, turn off **Auto Update** for the extension in the same menu. The 1.2.1 VSIX also stays on [GitHub Releases](https://github.com/WitchyNibbles/Spellbound-Themes/releases/tag/v1.2.1).

## 1.2.1 — 2026-09-26

- Refined three Activity Bar icons: Explorer is a grimoire with a pentagram and varied sticky notes, Extensions is a pair of eyeglasses, and Manage is a witchy crystal wand. Search, Source Control, and Run/Debug retain their existing artwork.
- Rebuilt the product icon font from the final WitchyNibbles artwork.
- Fixed extension detail image URLs to load screenshots from the public Spellbound-Themes repository.

## 1.2.0 — 2026-09-26

- Replaced the stock Codicons product font with an original WitchyNibbles icon font generated from 48 SVG sources.
- Added witchy workbench glyphs for Explorer, Search, Source Control, Debug, Extensions, Settings, Account, Terminal, and common actions.
- Added a product icon preview and validation for SVG sources, font contours, and stable icon mappings.

## 1.1.0 — 2026-09-26

- Expanded the selectable product icon theme and its validation.

## 1.0.0 — 2026-09-26

- Released Moonlit, Daydream, and Coven Contrast color themes.
- Added matching file icons, screenshots, and VSIX packaging.
