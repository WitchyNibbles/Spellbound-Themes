# Spellbound Themes 2.0: witchyterm parity

- **Date:** 2026-10-10
- **Status:** design agreed in a grilling session; spec review applied (section 10); all author decisions taken (section 11)
- **Inspiration:** `../witchyterm` (Moonlit Candle for Claude Code, Windows Terminal, fish/Tide), whose palette lives in `witchyterm/witchy/palette.py`
- **Research:** `docs/research/vscode-1.141-icon-inventory.md` (every product icon ID visible in a normal VS Code 1.141 session, with resolution rules)

## 1. Goal

Make the VS Code collection look as good as witchyterm and read as the same brand:

1. A new flagship color theme, **WitchyNibbles Moonlit Candle**, that uses witchyterm's palette and role hierarchy.
2. Product icons redrawn from scratch in one consistent style, covering every icon a user sees in a normal session.
3. File icons redrawn as full colour objects, coloured by category, for the file types the author actually opens.
4. One shared glyph glossary across witchyterm and this repo.

**Success criterion:** in VS Code 1.141 with Moonlit Candle, the WitchyNibbles file icons and the WitchyNibbles product icons selected, no stock Codicon is visible in the core-tier surfaces of section 5.2, the integrated terminal's palette equals the witchyterm Moonlit Candle scheme, `ll` matches Windows Terminal with that scheme exactly when `terminal.integrated.minimumContrastRatio` is `1`, and `npm run validate` passes. The README documents that setting; the package does not set it. Known difference: Windows Terminal's moon background image has no VS Code equivalent.

## 2. Scope

In:

- Color themes: new Moonlit Candle; semantic and typography fixes to Moonlit, Daydream and Coven Contrast.
- Product icon theme: full redraw. All 132 core-tier IDs, plus the named extras in section 5.1, for 170 keys in total. Work is sized by distinct drawings, not by keys.
- File icon theme: full redraw, ~30 file types, ~15 folder names, special file names, dark/light/high-contrast sets resolved by a build step from one source per drawing.
- Build and validation scripts for all of the above.
- README, CHANGELOG, Marketplace screenshots, version 2.0.0.

Out:

- Any extension code (`main`/activation). The package stays declarative. A moon-phase status bar item or sabbat accents are a possible later idea, not part of this work.
- The ~97 extended-tier icon IDs from the inventory keep falling back to Codicons, except the extended-tier IDs that section 5.1 maps on purpose (`more`, `plus`, `dialog-*`, `copilot-warning`, `debug-breakpoint-unverified`, `ports-forwarded-with-process-icon` and the `gutter-lightbulb-*` / `lightbulb-*` keys added at gate 1).
- Brand logos of any language or tool.
- Changing witchyterm itself, except proposing glossary additions (section 7) to it.
- `engines.vscode` stays `^1.100.0`. Older hosts ignore keys they do not know.

## 3. Color themes

### 3.1 Moonlit Candle (new, listed first in `contributes.themes`)

`uiTheme: vs-dark`. Surfaces reuse Moonlit's editor `#0D0916`, panel `#171025` and sidebar `#120C1F`. The terminal background is witchyterm's `#0D0916` (Moonlit's current terminal is `#08060D`), so the terminal matches Windows Terminal. Text is `#F3EAF7` (Moonlit's foreground is `#F8F2FF`), muted `#A99AB9`, border/subtle `#6E5A80` where a border must reach 3:1, decorative dividers `#38234D`. `#6E5A80` is used only on the editor, sidebar and panel surfaces (3.22, 3.13 and 3.02:1; the panel value is the lowest and is accepted).

Workbench roles:

| Role | Colour | Surfaces |
| :- | :- | :- |
| Main accent | gold `#FFD477` | `activityBar.activeBorder`, `tab.activeBorderTop`, `panelTitle.activeBorder`, `progressBar.background`, `button.background` (text `#0D0916`, also on hover), remote indicator (`statusBarItem.remoteBackground`, text `#0D0916`), `sideBarTitle.foreground`, active line number |
| Needs you | pink `#FF67B7` | `activityBarBadge.background`, `badge.background`, notification counts (all with foreground `#0D0916`; a light foreground fails on pink), `tab.activeModifiedBorder` / `tab.inactiveModifiedBorder`, `editorCursor.foreground`, `terminalCursor.foreground` |
| Selection and focus | lavender `#B99AFF` / `#633B79` | list selection, `focusBorder`, bracket match border, scrollbar hover, `editor.selectionBackground` (`#633B79` with alpha) |
| Success / added | mint `#74E8B8` | git added/untracked-added, gutter added, test pass, `notebookStatusSuccessIcon.foreground` |
| Modified | amber `#FFB86B` | git modified, gutter modified, `editorWarning.foreground`, `notificationsWarningIcon.foreground` |
| Error / deleted | rose `#FF6B9F` | errors, git deleted, gutter deleted, test fail |
| Info / shell | cyan `#77D9FF` | `editorInfo.foreground`, info icons |
| Breakpoints | gold `#FFD477` | `debugIcon.breakpointForeground` (reads as a full moon with the section 5 glyphs) |
| Stackframes | gold `#FFD477` / lavender `#B99AFF` | `debugIcon.breakpointCurrentStackframeForeground` (gold) / `debugIcon.breakpointStackframeForeground` (lavender) |

Limits of the "Needs you" row: no colour key reaches the dirty-tab dot. The ✦ that replaces it (section 5.2) is a glyph swap only and takes the tab foreground (`tab.activeForeground` / `tab.inactiveForeground`), so it cannot be pink. The pink modified borders show only when the user sets `workbench.editor.highlightModifiedTabs: true` (default `false`), which the README recommends.

Modern UI: VS Code 1.141 turns on `workbench.experimental.modernUI` by default. Its card gaps use `modernUI.shellBackground` and `modernUI.inactiveShellBackground`, which default to the title bar backgrounds. They are left at those defaults unless the gap colour should differ from the title bar.

Divergence from witchyterm, on purpose: witchyterm's `eza` colours new files gold. Here added is mint, because gold already means "active/selected".

Syntax (TextMate and semantic tokens):

| Token | Colour | Style |
| :- | :- | :- |
| keywords, `storage.type` | lavender `#B99AFF` | bold |
| `storage.modifier` | lavender `#B99AFF` | italic, not bold |
| functions, methods | gold `#FFD477` | |
| strings | mint `#74E8B8` | |
| types, classes, interfaces | cyan `#77D9FF` | |
| numbers, constants, booleans | soft pink `#FF9BD7` | |
| comments | `#A99AB9` | italic |
| docs | `#CFC3DB` | italic |
| variables | `#F3EAF7` | |
| punctuation, operators | `#D3B4FF` | |
| tags | `#FF86C8` | |
| attributes, properties | `#9CCBFF` | |

`storage.modifier` is a subscope of `storage`, so the bold rule must name `storage.type`, not `storage`. Today `src/theme-definition.mjs` puts `storage.modifier` in the bold keyword rule; it moves to the italic rule.

Every token colour must reach 4.5:1 on the editor background; the existing check in `src/theme-definition.mjs` enforces it.

Terminal ANSI: the 16 colours, background, foreground, cursor and selection equal `witchyterm/dist/windows-terminal/moonlit-candle.scheme.json` exactly. Key mapping:

| Windows Terminal | VS Code |
| :- | :- |
| `background` / `foreground` | `terminal.background` / `terminal.foreground` |
| `cursorColor` | `terminalCursor.foreground` |
| `selectionBackground` | `terminal.selectionBackground` |
| `black` … `white` | `terminal.ansiBlack` … `terminal.ansiWhite` |
| `brightBlack` … `brightWhite` | `terminal.ansiBrightBlack` … `terminal.ansiBrightWhite` |
| `purple` / `brightPurple` | `terminal.ansiMagenta` / `terminal.ansiBrightMagenta` |

The scheme's `black` `#1D1230` (1.11:1) and `brightBlack` `#6E5A80` (3.22:1) are below 4.5:1 on `#0D0916`. That is witchyterm's design and is kept; section 8 replaces the ANSI contrast check with an equality check for the pinned themes. VS Code's `terminal.integrated.minimumContrastRatio` (default 4.5) adjusts such cells at render time, so `ll` matches Windows Terminal exactly only at `1` (section 1).

### 3.2 Moonlit, Daydream, Coven Contrast

- Moonlit keeps neon pink as its accent.
- Moonlit and Daydream get the semantic fixes: a success/added green and an amber warning instead of gold.
  - Moonlit: mint `#74E8B8`, amber `#FFB86B`.
  - Daydream: dark mint `#0E7553` (5.48:1 on editor `#FFF9FD`, 5.11:1 on sidebar `#F8F0FB`, 4.95:1 on panel `#F5ECFA`) and amber `#9A5A00`, Daydream's existing warning colour (5.27 / 4.91 / 4.76:1).
- Daydream gets a separate UI-boundary border `#8E78A6` (3.75 / 3.50 / 3.39:1 on editor, sidebar and panel) where a border must reach 3:1. `#DCC7E5` stays the decorative divider.
- Coven Contrast keeps its own high-contrast colours, stays free of green, keeps its white borders, and only adopts the typography rules.
- Moonlit's integrated terminal takes the full Moonlit Candle scheme, because the dark themes match Windows Terminal: background `#0D0916` (today `#08060D`), foreground, cursor, selection and the 16 ANSI colours.
- Stackframe colours (section 3.1) in Moonlit, Daydream and Coven Contrast take role-equivalent values from each palette: the main accent for the current frame and the lavender for other frames. Phase 1 chooses them, and the author may overrule them.

### 3.3 Typography (all four themes)

- Bold only on keywords. Functions, classes, types and constants lose bold.
- Italic on comments, documentation and storage modifiers.
- The README recommends Maple Mono NF (witchyterm's font) with its italics. A color theme cannot set the font.

## 4. Glyph design system (product and file icons)

- Grid: 16×16, viewBox `0 0 16 16`, 1px padding, strokes of 1 unit, matching Codicons so unmapped fallbacks blend in.
- One filled accent shape per icon, on the part that carries the meaning (liquid, moon, flame, arrowhead, save lid, the active pane). Pure stroke glyphs (close, plus, minus, check, chevron) have no fill. Exception (gate 2): the witch hat is drawn solid, because a hollow cone under 4 units wide leaves cut-outs under 2 units.
- Product icon SVGs contain filled paths only (strokes expanded to outlines), because the font pipeline rejects `stroke`.
- File icons are full colour SVGs, objects per type (section 6), category coloured.

Render sizes in VS Code 1.141 (the same glyph is drawn at several sizes):

| Surface | Size |
| :- | :- |
| Activity bar | 24px (16px in compact mode) |
| Toolbars, status bar, tabs, trees, secondary side bar and panel bars (so `chat-view-icon` is a 16px glyph) | 16px |
| Chat toolbars (compact codicon size) | about 12px |
| Gutter and terminal decorations | about 14–16px |

At 24px one unit is 1.5 device pixels. Where the drawing allows, the outer silhouette edges of the activity-bar glyphs use even coordinates (2, 4 … 14), so they also land on whole pixels at 24px. This is guidance, not a hard rule.

Pixel grid. The font is unhinted, so outline coordinates are drawn exactly as written. A 1px stroke that straddles two pixels renders at about half coverage, which drops an inactive glyph below 3:1 (Daydream `#735F7D` on `#F5ECFA`: 4.99:1 snapped, about 2.0:1 straddling).

- The edges of every horizontal or vertical stroke, fill and cut-out sit on whole numbers: a 1-unit stroke runs from n to n+1, never centred on n.
- 45° diagonals are about 1.25–1.4 units measured across the stroke, so they look as dense as 1-unit straight strokes (guidance).
- A circle's centre is on a whole number when its diameter is even and on .5 when it is odd. Prefer even diameters (4, 8, 10, 12, 14) centred on (8,8).
- (8,8) is a pixel boundary, so an odd-width central feature cannot sit exactly in the middle. Put it on pixel column 7 (x 7–8), as Codicon `add` does, and use the same side in every glyph.
- No radius, sliver or gap under 1 unit.
- Accepted off-grid points (gate 2): the corners of the gear's four 45° teeth, the four band ends of `sync` at 235° and 55°, and the points where the `copilot-unavailable` knockout band cuts the cat head's straight edges. Snapping them would distort the shape or break the 1-unit clearance.
- Snapping guarantees crisp edges only at whole device scales (100%, 200%). At 125% and 150% it only keeps the blur from getting worse.

Keylines (taken from the measured Codicon bounds):

| Kind | Live area |
| :- | :- |
| Round view icons | circle 14 (1–15) |
| Square glyphs | 12 (2–14) |
| Portrait / landscape glyphs | 12×14 (2–14 × 1–15) / 14×12 |
| Action glyphs | 10–12 |
| Chevrons | 10×5 (or 5×10) |
| Status and gutter signals, breakpoints | 8 (4–12) |
| Overlay dots | 4 (6–10) |

Filled accents and cut-outs:

- Dot-like accents (liquid, round dots) are at least 3×3.
- Shape-bearing accents (crescent, triangle, diamond, drop, flame, leaf) are at least 4×4 and preferably 5×5. A crescent is at least 2 units thick at its widest point.
- The search lens and the gear hub are enlarged to hold the crescent. Both a crescent variant and a plain-dot variant are drawn, and the author picks per icon at the review gate (section 5.3).
- Star accents (✦, ⋆) get a solid core; their minimum size is set by a 16px render check of the real glyph. Set at gate 2: a ✦ badge is 5×5 with a waist of 1 (`parts.star(…, 2.5, 1)`), a 3-px `+` at 16px and a star at 24px; a waist of 1.25 or more turns it into a round dot. The one smaller star is the 3×3 `copilot-dot` pip.
- Clearance between an accent and a stroke is one full, pixel-aligned unit.
- A cut-out inside a fill is at least 2 units in both directions. The exception is a straight, pixel-aligned slot at least 4 units long (the `i` stem, the `=` bars). A second exception (gate 2): the `terminal-decoration-error` ✕ arms are 1.41 units across, like `close`, because a 2-unit ✕ closed up and read as a ring at 16px.
- Cut-outs must be real holes: a subpath wound opposite to its parent, or a boolean subtract applied before export. The font pipeline (svgicons2svgfont, svg2ttf) ignores `fill-rule` and fills with nonzero winding, so an `evenodd` hole drawn in the same direction as its parent renders solid. Four 1.2.1 sources rely on `evenodd` (`explorer-view-icon`, `debug-alt`, `extensions-view-icon`, `search-view-icon`) and are already wrong in the shipped font; the 2.0 redraw replaces them.

Spin-safe and overlay-safe (normative):

- VS Code rotates `loading`, `tree-item-loading`, `sync` and `gear` (with the spin modifier) about the element centre. These glyphs are balanced around (8,8), and the loading crescent's outer circle is concentric with (8,8).
- `debug-stackframe` and `debug-stackframe-focused` keep a clear area around 6–10 for the `debug-stackframe-dot` overlay (section 5.2).
- The dirty ✦ and `close` swap in the same tab-action box, so they share a centre and optical size.

Advisory drawing defaults: angles of 0°, 45° and 90°, plus 2:1 slopes where needed; frame corners with radius 1 and sharp inner corners; diagonal stroke ends cut horizontally or vertically so no half-covered pixels are left. These apply to the outline geometry, since product SVGs are filled outlines.

Font build:

- `scripts/build-product-icons.mjs` must drop `centerHorizontally` and `centerVertically`. They translate each glyph by its own path bounding box, which moves asymmetric glyphs off the grid (bell-dot with ✦, the stackframe arrows that must line up with VS Code's overlay, pinned). In 1.2.1, `extensions-view-icon` source y 4–10.5 became 4.74–11.26 for this reason.
- `normalize: true` does not enlarge small glyphs: with `viewBox="0 0 16 16"`, no `width`/`height` attributes and `usePathBounds` off, every glyph gets the same scale of 64 font units per grid unit (`fontHeight: 1024`). Keeping it, or setting `normalize: false` with `fontHeight: 1024`, both give one shared scale.

## 5. Product icons

### 5.1 Rules

- Metaphors only for views, identity and status signals. Universal actions keep familiar silhouettes in the house style.
- Keys follow `docs/research/vscode-1.141-icon-inventory.md`. Alias IDs that do not inherit (for example `tree-item-expanded`, `toolbar-more`, `menu-submenu`, `quick-input-back`, `dialog-*`, `plus`) get their own explicit entries.
- Keys beyond the 132 core-tier IDs, included on purpose: `account`, `debug-alt`, `run`, `settings-gear`, `gear`, `ellipsis`, `trash` (helper codicons used directly), `more`, `plus`, `dialog-close`, `dialog-error`, `dialog-info`, `dialog-warning` (extended-tier aliases), and three registered IDs the inventory omits: `timeline-view-icon`, `debug-stackframe-dot` and `copilot-unavailable`. Added by the author decisions (section 11): `debug-breakpoint-unverified`, `debug-breakpoint-conditional-disabled`, `debug-breakpoint-log-disabled`, `debug-breakpoint-conditional-unverified` (debug batch); `copilot-warning`, `copilot-snooze`, `copilot-dot` (status batch); `panel-right`, `panel-right-off`, `auxiliarybar-left-layout-icon`, `auxiliarybar-left-off-layout-icon`, `panel-bottom` (editor batch).
- Added at review gate 1 (section 11.1): `gutter-lightbulb-sparkle`, `gutter-lightbulb-auto-fix`, `gutter-lightbulb-aifix-auto-fix` and the inline light-bulb codicons `lightbulb-sparkle`, `lightbulb-autofix`, `lightbulb-sparkle-autofix` (batch 1, claimed by the candle; G5 as amended in section 11.1: with chat on, every quick-fix bulb is one of these, in the gutter or inline); `git-branch-changes`, `git-branch-staged-changes`, `git-branch-conflicts` (status batch, sprig variants; G6) and `ports-forwarded-with-process-icon` (status batch, the `terminal-decoration-success` dot; G4). Total: 170 keys (132 core + 38 extras). `gutter-lightbulb-sparkle-filled` (the gutter mark when every action on the line is an AI action) stays stock until gate 4, where it joins the editor batch on the ✧ cluster (section 11.2) and the total becomes 171.
- Dropped keys from 1.2.1: `home`, `activity-bar-left`, `activity-bar-right`, `menu`, `copy`, `edit`, `save` (not core-tier). `file`/`folder` are replaced by `symbol-file`/`symbol-folder`. `split-vertical` stays: it is a core ID (the Alt state of Split Editor), and it was given a glyph in the design interview. The legacy `layout-sidebar-left`, `layout-sidebar-right` and `layout-panel` keys are dropped too; the registered toggle keys in section 5.2 replace them.
- Several IDs share one glyph drawing. The map format is drawing-based: each drawing has one SVG source and one codepoint, and lists the IDs that use it. Codepoints are stored in the map, are never reused within a release, and are not derived from an ID's position in a list.
- A product icon theme cannot rotate a glyph per ID (only tree twisties are rotated by VS Code's CSS). Every orientation used is its own pre-rotated drawing, so "one chevron" means separate down, right and up drawings, each ID taking the orientation of its Codicon default.

### 5.2 Glyphs

Activity bar and identity:

| IDs | Glyph | Filled part |
| :- | :- | :- |
| `explorer-view-icon` | grimoire, no sticky notes | crescent clasp, upper left, clear of the Explorer badge (gate 1, G7) |
| `search-view-icon`, `search` | magnifier with an enlarged lens ("scrying glass") holding a plain dot (gate 1, G2) | disc |
| `source-control-view-icon` | herb sprig laid out like a branch graph | leaves (commit nodes) |
| `run-view-icon`, `debug-alt` | spider on a thread: round body, eight splayed legs, no play mark (gate 1, G7) | body |
| `test-view-icon` | flask | liquid |
| `extensions-view-icon` | four rune tiles in the Codicon layout, one lifted | lifted tile |
| `remote-explorer-view-icon` | moon-gate arch with a 2-unit wall (gate 1, G7) | crescent |
| `accounts-view-bar-icon`, `account` | witch hat silhouette, pointed curved brim, bent tip (gate 1, G7); every part solid (gate 2, section 4) | band, set off by a 1-unit notch |
| `settings-view-bar-icon`, `settings-gear`, `gear`, `extensions-manage`, `notifications-configure` | gear silhouette with an enlarged hub | plain dot in the hub (gate 1, G2) |
| `chat-view-icon`, `copilot` | cat head | eyes |
| `copilot-unavailable` (status bar, shown by default in Markdown and plain-text files because Copilot completions are off there; drawn with the status batch) | cat head with a slash | left eye; the knockout band around the slash takes the right one (gate 2) |
| `timeline-view-icon` | owl face: eye rings, ear tufts, beak (gate 1, G7) | eyes |
| `terminal`, `terminal-view-icon` | terminal frame with `❯` | crescent |

`debug-alt` is also the default of the five Run-view section icons, so the spider shows on all of them. That spread is accepted.

`timeline-view-icon` (registered default `history`, not in the inventory) is mapped as its own key, not through `history`, so the owl does not reach `timeline-open` or `testing-queued-icon`. Timeline is a view inside the Explorer container, so the owl shows only when the user moves the view to its own container or the panel.

Shared chrome:

| IDs | Glyph |
| :- | :- |
| `chevron-down`, `tree-item-expanded`, `view-pane-container-expanded`, `view-pane-container-collapsed`, `search-show-replace`, `search-hide-replace`, `find-expanded`, `find-collapsed`, `folding-expanded`, `folding-collapsed`, `menu-submenu`, `notifications-expand` | one chevron, drawn pre-rotated in each orientation used (section 5.1) |
| `breadcrumb-separator` | ⋆ small star |
| `arrow-left`, `arrow-right`, `quick-input-back`, `find-previous-match`, `find-next-match`, `diff-editor-previous-change`, `diff-editor-next-change` | stem, filled head |
| `close`, `widget-close`, `panel-close`, `notifications-clear`, `dialog-close` | crossed strokes |
| `add`, `plus`, `terminal-new`, `diff-insert`, `remove`, `diff-remove` | strokes |
| `check` | stroke |
| `toolbar-more`, `ellipsis`, `more` | three filled 3×3 dots, 2 units apart, x 1–14 (gate 2; one unit past the action keyline) |

Panel and views:

| IDs | Glyph | Filled part |
| :- | :- | :- |
| `output-view-icon` | quill over lines | ink drop |
| `debug-console-view-icon` | terminal frame with a small spider | spider body |
| `markers-view-icon` | uses `warning` | |
| `clear-all`, `notifications-clear-all` | broom sweeping lines | bristles |
| `filter` | funnel | liquid in the spout |
| `trash`, `terminal-kill` | bin | lid |
| `panel-maximize` | expand corners | |

Status and signals:

| IDs | Glyph | Filled part |
| :- | :- | :- |
| `error`, `dialog-error`, `testing-failed-icon` | skull | skull, eyes cut out |
| `warning`, `dialog-warning` | triangle with `!` | triangle, `!` cut out |
| `info`, `dialog-info` | circle with `i` | disc, `i` cut out |
| `terminal-decoration-error` | small ✕ in a disc | disc, ✕ cut out 1.41 across (gate 2, section 4) |
| `terminal-decoration-success`, `ports-forwarded-with-process-icon` | small dot, 6 units (gate 1, G4) | dot |
| `bell` / `bell-dot` | hand bell / bell with a 5×5 ✦ beside the handle (gate 2) | ✦ |
| `remote` | small moon gate | crescent |
| `git-branch` | small herb sprig | leaves |
| `git-branch-changes` / `git-branch-staged-changes` / `git-branch-conflicts` | small herb sprig with a solid ✦ / ✓ / ! badge in the lower right (gate 1, G6) | badge |
| `sync` | two arrows chasing round | heads |
| `bracket` | `{ }` | |
| `loading` | crescent moon (spun by VS Code) | crescent |
| `copilot-snooze` | cat head with closed eyes, drawn as 2-unit lids | lids |
| `copilot-dot` | cat head with both eyes and a 3×3 ✦ pip between the ears (gate 2) | eyes, pip |
| `copilot-warning` | solid cat head with `!` cut out (gate 2) | head, `!` cut out |

Debug and testing (the moon means "here"):

| IDs | Glyph | Filled part |
| :- | :- | :- |
| `debug-breakpoint`, `debug-hint` | plain full moon; the crater did not survive the 16px render (gate 1, G1) | disc |
| `debug-breakpoint-disabled` | moon outline | |
| `debug-breakpoint-unverified` | dashed ring | |
| `debug-breakpoint-conditional` | moon with `=` cut out | disc |
| `debug-breakpoint-log` | diamond | diamond |
| `debug-breakpoint-conditional-disabled`, `debug-breakpoint-log-disabled`, `debug-breakpoint-conditional-unverified` | reuse existing drawings: the `=` moon, the diamond and the dashed ring; VS Code's disabled and unverified colours carry the state (pairing chosen while applying the decision; the author may overrule it at the debug gate) | as reused |
| `debug-stackframe` / `debug-stackframe-focused` | pointer arrow / arrow with moon dot | tip / moon |
| `debug-stackframe-dot` | moon dot, 4×4 at 6–10 | dot |
| `debug-step-over`, `debug-step-into`, `debug-step-out` | arrow with moon dot | moon |
| `debug-start` / `run`, `testing-run-icon` | `debug-start`: filled play triangle; `run` and `testing-run-icon` (which inherits `run`): outline play triangle | triangle |
| `testing-run-all-icon` | two stacked triangles | front triangle |
| `debug-continue`, `debug-pause`, `debug-stop`, `debug-restart` | bar+play, two bars, square, circular arrow | main shape |
| `testing-passed-icon` | disc with check cut out | disc |

Breakpoint footprint: every breakpoint glyph matches the Codicon footprint, an 8-unit shape centred on (8,8) spanning 4–12 (the log diamond may span 3–13, as Codicon's does). Breakpoint states that stay on Codicons (function, data and their variants) then sit in the same place, and the glyph does not jump when a breakpoint changes state.

Paused on a breakpoint: VS Code draws `debug-stackframe-dot` over `debug-stackframe` and `debug-stackframe-focused` with a CSS `::after` overlay, coloured by `debugIcon.breakpointForeground`. The focused glyph's moon dot sits at the same place (6–10), so the two coincide.

Editor, find, layout, SCM:

| IDs | Glyph | Filled part |
| :- | :- | :- |
| `light-bulb`, `gutter-lightbulb`, `gutter-lightbulb-sparkle`, `gutter-lightbulb-auto-fix`, `gutter-lightbulb-aifix-auto-fix`, `lightbulb-sparkle`, `lightbulb-autofix`, `lightbulb-sparkle-autofix` | candle | flame |
| `circle-filled` (dirty tab dot) | ✦ (audit every other use of `circle-filled` before changing it) | ✦ |
| `pinned` / `pinned-dirty` | hatpin, round head / ✦ head | head |
| `sparkle`; `gutter-lightbulb-sparkle-filled` from gate 4 (section 11.2) | three-star cluster ✧ | largest star |
| `new-file` / `new-folder` | page / folder with `+` | corner / tab |
| `go-to-file`, `symbol-file`, `symbol-folder` | page with arrow, page, folder | corner / tab |
| `collapse-all`, `list-tree`, `discard`, `refresh` | usual shapes | main shape |
| `case-sensitive`, `whole-word`, `regex`, `preserve-case` | `Aa`, `ab̲`, `.*`, `AB` in the house stroke | |
| `find-replace`, `find-replace-all`, `search-replace-all` | usual shapes | arrowhead |
| `split-horizontal`, `split-vertical` | window with two panes, the divider following each ID's Codicon orientation | new pane |
| `panel-left`/`-off`, `panel-layout-icon`/`-off`, `auxiliarybar-right-layout-icon`/`auxiliarybar-right-off-layout-icon` | window frame; on = pane filled, off = pane outline | pane |
| `panel-right`/`-off`, `auxiliarybar-left-layout-icon`/`auxiliarybar-left-off-layout-icon`, `panel-bottom` | mirrored pane drawings of the frame toggles above (side bars swapped; `panel-bottom` the bottom pane) | pane |
| `configure-layout-icon` | frame with four panes | one pane |

Symbols (`symbol-class`, `-method`, `-function`, `-field`, `-property`, `-variable`, `-constant`, `-interface`, `-enum`, `-module`, `-namespace`, `-keyword`, `-string`, `-text`, `-snippet`): Codicon meanings kept (cube = method, wrench = property, `[x]` = variable, …), redrawn in the house style.

### 5.3 Review gate

1. Draw a first batch of 21: the 12 activity bar/identity drawings (including `terminal`) plus chevron, close, ⋆, ✦ dirty dot, candle, skull, bell, the small `git-branch` sprig (a separate drawing from the source-control sprig) and the moon breakpoint.
2. Screenshot them in real VS Code in all four color themes:
   - at 100%, 125%, 150% and 200% zoom (or Windows display scale), since the fractional scales are the ones that blur;
   - the activity bar in default (24px) and compact (16px) sizes, and one chat toolbar at its compact size (about 12px);
   - with the Modern UI on, which is the 1.141 default.
3. The author picks crater or plain disc for the moon breakpoint, and crescent or plain dot for the search lens and the gear hub (per icon), from the variant screenshots.
4. The author approves before the remaining glyphs are drawn, group by group. The debug group's screenshots include a line where execution is stopped on a breakpoint, to check the `debug-stackframe-dot` overlay.

## 6. File icons

- Full objects per type, coloured by category: code lavender, data gold, style pink, tests mint, config muted, docs ivory, assets (images and fonts) cyan. Every table below gives each row's category.
- Folder bodies are muted; each folder badge takes the category of the folder's contents.
- Three sets: dark (Moonlit Candle colours), `light` (Daydream's darker colours), `highContrast` (Coven Contrast colours). Each reaches 3:1 against its theme's sidebar (`#120C1F`, `#F8F0FB`, `#000000`). Values:

| Category | dark | `light` | `highContrast` |
| :- | :- | :- | :- |
| code | `#B99AFF` | `#7042B2` | `#D0B8FF` |
| data | `#FFD477` | `#8A4D00` | `#FFE38A` |
| style | `#FF67B7` | `#B52776` | `#FF67B7` |
| tests | `#74E8B8` | `#0E7553` | `#74E8B8` (13.98:1) |
| config | `#A99AB9` | `#735F7D` | `#A99AB9` (8.01:1) |
| docs | `#F3EAF7` | `#3B2A47` (11.72:1) | `#FFFFFF` |
| assets | `#77D9FF` | chosen in phase 3 from Daydream's cyan role, at 3:1 | chosen in phase 3 from Coven's cyan role, at 3:1 |

- The `highContrast` mint is a file-icon colour only; the Coven Contrast color theme stays free of green (section 3.2).
- Production: one source SVG per drawing, with colour-role placeholders instead of hex values. A build step resolves each source into the dark, `light` and `highContrast` sets, and the 3:1 check runs on the resolved colours.
- Review gate: before the full set is drawn, a file-icon gate like section 5.3 reviews a sample (one folder badge, one multi-colour special file and two or three common types) at 100% and 200%, plus a grayscale pass. The author approves before the rest is drawn.

- Logo rule: an object may echo a language's name, never its logo. No Python two-snake mark, React atom, Docker whale or PowerShell `>_` badge. The README states the icons are original and not affiliated with any language or tool.
- The file icon theme sets `"showLanguageModeIcons": false`, so icons that other extensions contribute for languages (often logos) never show through. The theme keeps its own `languageIds` block from 1.2.1, and those entries still apply.
- File icon themes have no globs or prefix patterns. `fileNames` match exactly (case-insensitive), and `fileExtensions` match dot-separated suffixes, longest first (`test.ts` matches `foo.test.ts` and outranks `ts`).
- A file or folder that matches no entry falls back to the default parchment and the default folder.

16px rules (file icons render in a 16px tree slot):

- Section 4's grid, padding, pixel-grid and accent rules apply to file icons too.
- A detail below the accent minimum is dropped or merged into a solid silhouette with one feature: the `.env` skull label becomes a label with two eye pixels, the tsconfig gear a cog with a hole, each folder badge one bold silhouette.
- Folder badges sit in a fixed box of about 7×7 in the bottom-right, with a 1-unit knockout gap from the folder outline.
- Icons in the same category that are easy to confuse differ in silhouette (overall outline), not only in facets or colour: the js, ts and tsx/jsx gems; the json keyring and the html skeleton key; the yaml cairn, the jsonl beads, the db cylinder and the lib books. The metaphors stay as listed.

Types:

| Types | Object | Category |
| :- | :- | :- |
| js, mjs, cjs | rough crystal | code |
| ts, mts, cts | cut, faceted gem | code |
| tsx, jsx | gem set in a ring | code |
| py, pyw | single coiled snake | code |
| html, htm | skeleton key | code |
| css, scss, less | paintbrush with a star tip | style |
| sql | apothecary drawer cabinet | data |
| sh | stone tablet with `❯` | code |
| fish | fish skeleton | code |
| ps1 | stone tablet with `$` | code |
| json, jsonc | keyring | data |
| jsonl | string of beads | data |
| yaml, yml | stone cairn | config |
| toml | tag on a string | config |
| env, `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.example` | stoppered vial with a skull label | config |
| lock, and the `fileNames` `package-lock.json`, `yarn.lock`, `Cargo.lock`, `poetry.lock` | padlock with a crescent keyhole | config |
| db | cylinder with a crescent | data |
| md, mdx | quill | docs |
| txt | curled blank parchment | docs |
| svg | drafting compass | assets |
| png, jpg, jpeg, gif, webp | framed portrait with a moon | assets |
| ttf, otf, woff, woff2 | type block | assets |
| any other file | plain parchment, folded corner | none (muted) |

The `.env.*` variants are listed as `fileNames`, because `.env.local` exposes the suffixes `env.local` and `local`, not `env`. The lockfiles are `fileNames` for the same reason: `package-lock.json` only exposes `json`.

Special file names:

| Files | Object | Category |
| :- | :- | :- |
| README.md | open grimoire | docs |
| LICENSE, LICENSE.md | contract with a wax seal | docs |
| CHANGELOG.md | owl | docs |
| package.json, pyproject.toml, requirements.txt | recipe card | config |
| tsconfig.json, jsconfig.json | cut gem with a small gear | config |
| Dockerfile | wooden shipping crate | config |
| .gitignore | veil | config |
| `fileExtensions` `test.{ts,tsx,js,jsx,mjs,cjs,mts,cts}` and `spec.{ts,tsx,js,jsx,mjs,cjs,mts,cts}`; `fileNames` `conftest.py`, `pytest.ini`, `jest.config.{js,ts,mjs,cjs,json}` | flask (mint) | tests |

The 1.2.1 `jest.config.js` entry is covered by the enumerated `jest.config.*` keys. The 1.2.1 `vite.config.ts` entry is dropped.

`test_*.py` and `*_test.py` cannot be expressed in a file icon theme (`test_foo.py` only exposes the suffix `py`), so pytest files show the Python snake; the `tests` folder badge still marks them by location.

Folders: a muted folder outline with a small badge, with separate closed and open icons (`folderNames` and `folderNamesExpanded`). The Category column is the badge colour.

| Folder | Badge | Category |
| :- | :- | :- |
| default | none; the tab is filled | none (muted) |
| src, source | grimoire | code |
| tests, test, __tests__ | flask | tests |
| docs | open book | docs |
| scripts | wand with ✦ tip | code |
| assets | crystal | assets |
| dist | corked jar | code |
| lib | stacked books | code |
| bin | play triangle | code |
| fixtures | tarot card | tests |
| .github | raven | config |
| workflows | ritual circle | config |
| .claude | cat | config |
| .venv | cauldron | config |
| node_modules | cobweb | config |
| cache, __pycache__ | pantry jar | config |

## 7. Shared glossary

witchyterm is the source of truth. Additions and changes from this work:

| Glyph | Meaning |
| :- | :- |
| 🐈 cat | helpers and familiars: background jobs and chat/AI assistants |
| 🧪 flask | testing |
| 🧹 broom | cwd (terminal) and clearing/sweeping (VS Code) |
| ✦ | needs attention / changed: git dirty, dirty tab, unread notifications |
| ✧ cluster | AI actions |
| 🕯️ candle | idea / code action |
| 🌕 full moon | here / stop point: breakpoints, current step |
| 🌿 sprig | branch / source control |
| 🦉 owl | time / timeline / changelog |
| 💀 skull | failure / error; danger / secret |
| ⋆ | separator |

## 8. Validation

Committed data that the checks read:

- `icons/product-icon-ids.json`: the pinned VS Code 1.141 key list (the 132 core-tier IDs with default and tier, plus the extras in section 5.1). `../witchyterm` and the VS Code install are not part of the package, so values are pinned in this repo.
- `scripts/extract-icon-ids.mjs`: extracts the `registerIcon` registrations from a local `workbench.desktop.main.js` and diffs them against the pinned list. It is run by hand when the pin is refreshed (for example quarterly), not in `npm run validate`.
- The inventory's sentence that `reg.tsv` and `registry.json` sit next to it is wrong (they were never committed); it is removed or the files are committed together with the pinned list.
- The pinned witchyterm scheme values for section 3.1.

`npm run validate` additionally checks:

- Four color themes; Moonlit Candle first.
- Every token colour reaches 4.5:1 on its editor background (existing check, applied to the new theme).
- Each theme's success/added and warning colours reach 4.5:1 on its editor background (Daydream `#0E7553` and `#9A5A00`).
- Bold appears only on keyword and `storage.type` scopes, in all four themes.
- Moonlit Candle's and Moonlit's terminal background, foreground, cursor, selection and 16 ANSI colours equal the pinned witchyterm scheme.
- The UI-boundary border (`input.border`) of Moonlit Candle, Daydream and Coven Contrast reaches 3:1 on its theme's editor, sidebar and panel backgrounds.
- The product icon theme maps a superset of the pinned key list, so extra mappings never fail the build. Every glyph source obeys section 4: viewBox `0 0 16 16` with no `width`/`height`, filled paths only, no `text`/`image`/`use`, no `fill-rule="evenodd"`, and every inner subpath wound opposite to its container.
- A soft warning (not a failure) when straight-segment coordinates in a glyph source are neither whole numbers nor .5.
- `scripts/build-product-icons.mjs` does not set `centerHorizontally` or `centerVertically`, and the built font keeps one scale: each glyph's bounding box equals its source path bounds at 64 font units per grid unit.
- The file icon theme defines dark, `light` and `highContrast` sets for every type, special file name and folder in section 6, including the enumerated test, `.env` and lockfile keys and the folder aliases; every resolved icon colour reaches 3:1 on its sidebar background; `showLanguageModeIcons` is exactly `false`.
- At release: `galleryBanner.color` is `#0D0916` and the version is 2.0.0.

Checks removed or changed in `scripts/validate.mjs` and `scripts/build-product-icons.mjs`:

- Green-accent ban (hue 75–165): narrowed to an allowlist of the settled success-mint values, Moonlit Candle and Moonlit `#74E8B8` and `#9DF2CE`, Daydream `#0E7553`. Coven Contrast stays green-free. As written today the ban rejects mint.
- ANSI 4.5:1 contrast loop: replaced by the equality check above for Moonlit Candle and Moonlit (witchyterm's `black` and `brightBlack` cannot pass it). Kept for Daydream and Coven Contrast.
- Theme count: 3 becomes 4.
- The hard-coded 48-ID list in `validate.mjs` and the `entries.length !== 48` check in the build: replaced by reading `icons/product-icon-ids.json`.
- Index-derived codepoints, the unique-`fontCharacter` check and the one-SVG-per-ID check: replaced by the drawing-based map of section 5.1 (one SVG and one codepoint per drawing, many IDs per codepoint).

## 9. Release

- Version 2.0.0: product icons redrawn and keys dropped, and Moonlit loses most of its bold.
- `galleryBanner.color` becomes `#0D0916`.
- `package.json` `description` and `keywords` name Moonlit Candle and its gold/candle look (today they say "Moonlit purple, neon pink, and electric blue" and include "pastel").
- README and Marketplace images: one screenshot per color theme, the product icon sheet shown in a real workbench at 16px, and a VS Code terminal beside Windows Terminal showing the shared palette. The README recommends `workbench.editor.highlightModifiedTabs: true` (section 3.1), documents `terminal.integrated.minimumContrastRatio: 1` for an exact `ll` match (the package does not set it), and lists Windows Terminal's moon background image as a known difference (section 1).
- CHANGELOG entry for 2.0.0, with an "Upgrading from 1.x" note: what changes per theme (Moonlit loses bold and gains mint and amber, new terminal colours, dropped icon keys), and that 1.2.1 can be reinstalled with "Install Another Version". The Marketplace auto-updates across major versions, so the note is the only warning users get.

## 10. Review changes

- Section 2 and 5.1: stated the real key count (132 core + 16 named extras = 148) and the extended-tier aliases that are in scope; `engines` stays `^1.100.0`.
- Section 3.1: surfaces sentence no longer claims the terminal background and text are Moonlit's.
- Section 3.1: `notebookStatusSuccessIcon` and `notificationsWarningIcon` keys corrected to their `.foreground` names.
- Section 3.1: badge, notification-count and button-hover foregrounds pinned to `#0D0916`.
- Section 3.1: the dirty-tab ✦ cannot be pink; pink modified borders need `workbench.editor.highlightModifiedTabs`.
- Section 3.1: Modern UI shell-background keys noted.
- Section 3.1: `storage` bold/italic overlap fixed (`storage.type` bold, `storage.modifier` italic only).
- Section 3.1: terminal match includes the background; Windows Terminal to VS Code key mapping added; the sub-4.5:1 `black`/`brightBlack` noted.
- Section 3.2: Daydream mint `#0E7553` and amber `#9A5A00` filled in; Coven stays green-free; the "Q3" reference replaced by the decision.
- Section 4: corrected the font-build diagnosis (centring flags move glyphs; `normalize` does not rescale).
- Section 4: added render sizes, pixel-grid rules, keylines, tiered accent and cut-out minimums, and spin-safe and overlay-safe rules.
- Section 4: cut-outs must be real holes, because the font pipeline ignores `fill-rule`.
- Section 5.1: drawing-based map format; chevrons need pre-rotated drawings; "Q19" reference replaced.
- Section 5.2: `timeline-view-icon` named (mapped as its own key, rarely visible).
- Section 5.2: `debug-stackframe-dot` and `copilot-unavailable` added.
- Section 5.2: run/debug triangle assignment spelled out; breakpoint footprint fixed to the Codicon 4–12 box; split glyph orientation stated.
- Section 5.3: batch count corrected to 21 (terminal was counted twice); screenshots extended to 125%/150%, compact activity bar, 12px chat toolbar, Modern UI and a stopped-on-breakpoint line.
- Section 6: added a colour table with known values per set; `showLanguageModeIcons: false`; unmatched-name fallback; 16px rules.
- Section 6: test patterns replaced by enumerable keys (`test_*.py` dropped as inexpressible); `.env.*` variants and `jest.config.*` enumerated.
- Section 8: pinned key list and extraction script named; the inventory's dangling `reg.tsv`/`registry.json` reference flagged.
- Section 8: new checks (semantic colours, bold scopes, font scale, fill rule, special file names, `showLanguageModeIcons`, release metadata) and a list of existing checks that must change.
- Section 9: `package.json` description and keywords, README setting, and a CHANGELOG upgrade note.

## 11. Author decisions (2026-10-10)

All final, taken as the reviewers recommended.

- D1 Terminal criterion: palette equals the witchyterm scheme; `ll` matches exactly with `terminal.integrated.minimumContrastRatio: 1`, documented in the README and not set by the package; "identically" dropped; the moon background image is a known difference (sections 1, 3.1, 9).
- D2 Moonlit's terminal takes the full scheme: background `#0D0916`, foreground, cursor, selection and ANSI (sections 3.2, 8).
- D3 Moonlit Candle stackframes: current gold `#FFD477`, other lavender `#B99AFF`; the other themes take role-equivalent values chosen in phase 1 (sections 3.1, 3.2).
- D4 `debug-hint` reuses the breakpoint drawing; `debug-breakpoint-unverified` is a dashed ring; `-conditional-disabled`, `-log-disabled` and `-conditional-unverified` reuse existing drawings; crater and plain disc both go to the gate (sections 5.1, 5.2, 5.3).
- D5 `copilot-warning`, `copilot-snooze`, `copilot-dot` and `copilot-unavailable` are cat-head variants in the status batch: slash, closed eyes, star, warning drawing decided at the gate (sections 5.1, 5.2).
- D6 The spider on the five Run-view section icons that default to `debug-alt` is accepted (section 5.2).
- D7 The legacy layout keys are dropped; `panel-right`/`-off`, `auxiliarybar-left-layout-icon`/`-off` and `panel-bottom` are mirrored pane drawings in the editor batch (sections 5.1, 5.2).
- D8 File icons: one source SVG per drawing with colour-role placeholders, resolved by a build step into three sets; 3:1 on resolved colours; a file-icon review gate (sections 6, 8).
- D9 Category column in every file-icon table; assets (images, fonts) is a seventh category in cyan `#77D9FF` (dark); folder bodies muted, badges take their contents' category; lockfile `fileNames` get the padlock (section 6).
- D10 `light` docs `#3B2A47`; `highContrast` tests `#74E8B8`, config `#A99AB9` (section 6).
- D11 Kept: folder aliases `source`, `test`, `__tests__`, the `pyw` extension and the `languageIds` block; `jest.config.js` covered by the enumerated keys; `vite.config.ts` dropped (section 6).
- D12 The search lens and gear hub are enlarged to hold the crescent; crescent and plain-dot variants are both drawn, and the author picks per icon at the gate (sections 4, 5.2, 5.3).
- D13 The glossary's skull row adds "danger / secret" (section 7).
- D14 Borders: `#6E5A80` only on editor, sidebar and panel (3.02:1 on panel noted); Daydream gets a UI-boundary border `#8E78A6`, `#DCC7E5` stays decorative; Coven keeps white borders (sections 3.1, 3.2, 8).

### 11.1 Gate 1 decisions (2026-10-10)

Taken at review gate 1 (`docs/qa/2.0-gate-1/README.md`), all as recommended.

- G1 (D4 iv) Moon breakpoint: plain disc. At 16px/100% the crater was a 1-2 px hole that read as a pupil.
- G2 (D12) Search lens and gear hub: plain dot for both. The crescents became slivers or smudges in the 16px compact bar at 100%.
- G3 Off-grid straight-segment points (bell, cat-head, explorer-grimoire, flask, gear, moon-gate, owl, scrying-glass, terminal, witch-hat): snap them where the shape does not distort; accept and document the rest. Done in phase 2 with the redraws.
- G4 `circle-filled` consumers keep the ✦. `terminal-decoration-success` and `ports-forwarded-with-process-icon` get their own keys in the `status` batch.
- G5 `gutter-lightbulb-sparkle` and `gutter-lightbulb-auto-fix` map to the candle in phase 2. In 1.141 with chat on, the quick-fix gutter never shows `light-bulb`.
  - Amended while planning gate 2 (author, 2026-10-10): the candle also takes `gutter-lightbulb-aifix-auto-fix` and the inline codicons `lightbulb-sparkle`, `lightbulb-autofix` and `lightbulb-sparkle-autofix`, all in batch 1. In 1.141 the quick fix at the gate-1 line is drawn inline with these codicons, so mapping only the gutter IDs left the stock bulb visible. The pinned list grows to 170 keys.
- G6 `git-branch-changes`, `git-branch-staged-changes` and `git-branch-conflicts` are sprig variants in the `status` batch.
- G7 Batch-1 redraws, first in phase 2: spider (round body, eight splayed legs, no play mark; it read as the stock beetle), owl (ear tufts and large eye discs; it read as a second cat), witch hat (bent tip and a band notch; it read as a triangle on a bar), moon gate (thicker arch, stronger crescent cut), grimoire (crescent moved to the upper left, clear of the Explorer badge that VS Code draws at the lower right).
- G8 Batch 1 is approved with these changes. The phase-1 colour choices listed in the gate README stand.

### 11.2 Gate 2 decisions (2026-10-10)

Taken at review gate 2 (`docs/qa/2.0-gate-2/README.md`), all as recommended.

- G9 (D5) `copilot-warning`: the solid cat head with the `!` cut out. At 16px it cannot be mistaken for another Copilot state; the outline cat's 2-unit `!` was easy to miss.
- G10 `toolbar-more`, `ellipsis`, `more`: 3×3 dots, 13 units wide. The Codicon-sized 2×2 dots were below the dot-accent minimum.
- G11 `gutter-lightbulb-sparkle-filled` is pinned to the ✧ cluster in the editor batch at gate 4 (171 keys then). It stays stock until then.
- G12 The witch hat stays a solid silhouette, an exception to the one-accent rule (section 4).
- G13 Status readings approved as drawn, and sections 4 and 5.2 updated: `copilot-unavailable` keeps the left eye, `copilot-dot` keeps both eyes and adds a ✦ pip between the ears, and the `terminal-decoration-error` ✕ is a 1.41-unit cut-out.
- G14 The ✦ on `bell-dot` and `sprig-changes` stays a 5×5 ✦ (a `+` at 16px, a star at 24px), not a plain dot.
- G15 The 3×3 `copilot-dot` pip keeps its size.
- G16 (G3) The remaining off-grid points in `gear`, `sync` and `copilot-unavailable` are accepted as drawn (section 4). The `copilot-unavailable` knockout band stays at 2x − y = 6.75 to 14.25.
- G17 Batch 1 as redrawn and snapped, the chrome batch and the status batch are approved with G9–G16.
