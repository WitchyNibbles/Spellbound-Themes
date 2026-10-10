# Spellbound 2.0, review gate 1 (product icons batch 1)

- Run: 2026-10-10T02-14-08 · VS Code 1.141.0 (2a59476c9b) · mode device-scale · repo 903bb2ef (dirty: all phase-1 work is uncommitted, so `repoDirty` is true)
- Reproduce: `npm run review:gate` (Windows VS Code 1.141 driven over CDP from VS Code's own Electron; see docs/superpowers/plans/2026-10-10-spellbound-2-phase-1.md, Part D)
- Raw captures (not committed): review-out/2026-10-10T02-14-08/captures. `manifest.json` here lists all 768 with their sha256: main pass 4 scales × 144, variants pass 2 scales × 96. 0 warnings.
- Committed here: the 14 `commitSheets` from `review/jobs/gate-1.json`, `windows-terminal-ll.png`, and two evidence strips cut from raw full captures (`evidence-debug-stop.png` from `main/{1,2}/debug/<theme>/default/full.png`, `evidence-lightbulb.png` from `main/{1,2}/workbench/<theme>/default/full.png`). In those strips the 100% column is upscaled 2x (nearest neighbour) and the 200% column is 1:1.

## Preconditions (plan Task 18, Step 1)
- `npm test`: 128 of 128 pass. `npm run validate`: passes with `base`, `color-themes`, `product-pipeline` and `product-batch:1` enforced. The other stages are pending, as staged validation allows.
- The tree is not clean. Commits for this run are held back for the author, so all phase-1 work (168 entries in `git status --short`) is still uncommitted. This is why the manifest records `repoDirty: true` against 903bb2ef. Step 6's commit has not been made either. Once the author approves and commits phase 1, re-run Step 1 and expect a clean tree. The captures do not need re-running, because they were taken from this working tree.
- Validation also warns (without blocking) about straight-segment points off the whole/half grid in bell, cat-head, explorer-grimoire, flask, gear, moon-gate, owl, scrying-glass, terminal and witch-hat. These are diagonal or arc-tangent endpoints such as the gear teeth and the flask shoulders. They may add to the 125% softening noted below. Snap them or accept them as drawn?

## What to judge
The 21 designs (23 drawings): grimoire, scrying glass, herb sprig, spider, flask, rune tiles, moon gate, witch hat, gear, cat head, owl, terminal, chevron (down/right/up), close, ⋆, ✦, candle, skull, bell, small sprig, moon breakpoint. Each sheet: rows = theme · variant, columns = 100/125/150/200%.

`main-icon-sheet-panel` is the only sheet that shows all 23 drawings at 16px in a real workbench. Moon gate, owl, terminal, candle and the small sprig appear nowhere else in this run (see "Findings" for why the candle and the sprig are missing from the editor and status bar).

## Decisions for the author at this gate
- 4(iv) Moon crater or plain disc at 16px: compare main-debug-gutter (crater) with variants-debug-gutter (plain disc), line 6. At 100% the crater is a 1-2 px hole near the top right, so the disc reads as a dot with a pupil. From 125% up it reads as a crater. The plain disc is the cleaner mark at 100%.
- 12 Search lens and gear hub, per icon: crescent (main-workbench-activitybar) or plain dot (variants-workbench-activitybar). At 24px and at 150%/200% both read. In the compact bar (16px) at 100%, both crescents shrink to a 1-2 px sliver, and the gear's crescent turns into a smudge in the hub. The plain dots stay legible there, and in the chat title toolbar and the toast (also 16px).
- `circle-filled` consumers that now show ✦ (see the inventory audit): keep, or give any its own key?
- New from this run: `gutter-lightbulb-sparkle` (and `gutter-lightbulb-auto-fix`). In 1.141's default session (chat on), the quick fix on `spells.ts` line 11 shows `gutter-lightbulb-sparkle`, not `light-bulb`/`gutter-lightbulb`. Both IDs are extended tier and unmapped, so the stock sparkle bulb shows instead of the candle in every theme and at every scale (`evidence-lightbulb.png`). Pin them to the candle (or a candle-with-✦ variant) in phase 2?
- New from this run: `git-branch-changes`, `git-branch-staged-changes`, `git-branch-conflicts`. The git extension uses these in the status bar whenever the tree is dirty (confirmed in 1.141 `extensions/git/dist/main.js`). The fixture is dirty on purpose, so the status bar shows the stock branch-with-badge icon, and the small sprig (`git-branch`) appears only on a clean tree. Pin them as sprig variants in the `status` batch?

## Evidence for decisions already taken (spec section 11)
- 1 Terminal: main-terminal-panel at minimumContrastRatio 4.5 vs 1, and windows-terminal-ll.png (Windows Terminal, Moonlit Candle profile, same workspace, `ll`). Measured on the Moonlit Candle 100% captures: at 1, VS Code draws the `ll` text in exactly the Windows Terminal colours (#FFE3A3, #A99AB9, #B99AFF, #6E5A80). At 4.5, VS Code lifts the #6E5A80 permission dashes to #8A7A99/#665674 and leaves the rest alone. The background differs: Windows Terminal draws the moon image at 12% opacity (around #14101D), VS Code draws plain #0D0916. That is the known difference.
- 2 Moonlit terminal: full scheme. The Moonlit rows of main-terminal-panel have the #0D0916 terminal background (measured), the same as Moonlit Candle.
- 3 Stackframe colours: the stop is at line 4, column 20, so VS Code draws the current-stackframe arrow inline before `length`, not in the gutter. main-debug-gutter therefore shows only the breakpoint-coloured small dot on line 4. `evidence-debug-stop.png` shows the arrow: gold #FFD477 in Candle (measured) beside the gold moon on line 6; Daydream #B52776 (measured); Moonlit and Coven Contrast pink.
- 6 Spider: the Run and Debug activity bar entry is the spider in every theme and scale (main-workbench-activitybar, main-debug-sidebar). The five Run-view section icons show only when a view is moved into its own container, which this run does not do. main-debug-sidebar shows the section headers without icons, and the icon sheet lists the spider under `run-view-icon, debug-alt`.

## Choices made in phase 1 that the author may overrule
- Candle `button.hoverBackground` #FFE3A3, `statusBarItem.prominentForeground` #0D0916, parameters #F6B5DD (unspecified in section 3.1).
- Skull drawn on the ~12-unit Codicon `error` footprint, not the 8-unit signal keyline.
- Rune tiles are plain: a rune mark does not fit the cut-out rules in a 5×5 tile.
- Stackframe colours outside Candle (decision 3): Moonlit #FF67B7 / #B99AFF, Daydream #B52776 / #7042B2, Coven Contrast #FF67B7 / #D0B8FF (main accent for the current frame, lavender for other frames).
- Moonlit's input border stays #38234D: decision 14 names no Moonlit value, so the 3:1 border check covers only Candle, Daydream and Coven Contrast.
- Glyph-level notes from the review (Step 4). Nothing was redrawn.
  - 125% softening: the candle flame, spider legs, gear teeth and sprig leaves go soft on the fractional grid. Chevrons, ✕, ✦, skull and rune tiles stay close to crisp. 150% and 200% are sharp. No glyph breaks apart, so this is within what snapped strokes allow.
  - Crescents at 16px/100%: see decision 12. The grimoire's crescent survives in the tree (icon sheet), but in the activity bar the Explorer badge covers the lower right of the book and half the crescent (VS Code's badge position, every theme).
  - Spider: at 16px it reads as a six-legged beetle with a 3 px play mark, close to the stock `debug-alt` silhouette rather than a spider.
  - Owl and cat head share the pointed-ear outline. At 16px/100% the owl reads as a second cat face (icon sheet, both themes).
  - ✦ and ✕ in the tab: same height and centre line at all four scales. The ✦ is a little lighter (thin arms) but matches. They differ in colour only because one is the dirty inactive tab and the other the active tab's close button.
  - 12px: no batch-1 glyph renders at about 12px in this run. The chat input toolbar shows stock Codicons, and the chat title toolbar (gear, ✕, chevron) is 16px.
  - Red and blue fringes on the activity bar glyphs at 100% come from Windows ClearType, which Chromium applies to the icon font. Stock Codicons get them too, so they are not a glyph defect.

## Known phase-1 staging artifacts (not defects)
- Every pinned ID outside batch 1 shows its stock Codicon (validation is staged by batch): debug toolbar, warning, remote indicator, `bell-dot`, layout toggles and so on.
- `terminal-decoration-success` does not inherit the ✦: the codicon table registers it first with its own copy of the `circle-filled` character (see the inventory audit). The terminal gutter success mark stays the stock dot until the `status` batch maps it.
- Layout toggles show Codicons until the phase 2 `editor` batch draws them (decision 7).
- Toasts show gear and ✕ but no expand chevron, because the message renders fully expanded. `notifications-expand` (chevron-up) is visible only in the icon sheet.
- Harness framing: the debug gutter crop at 200% runs into the panel's "Problems" tab (the editor is shorter than 260 CSS px there). The debug sidebar crop at 100%/125% ends before Call Stack. In the terminal listing, notes.md shows `rwxrwxrwx` from the second launch on, because the Windows-side workspace restore cannot keep WSL mode bits. Git ignores modes in the fixture (`core.fileMode false`).

## Harness fixes made while running this gate
- Debug scene: js-debug launched `Code.exe` without the launch config's `ELECTRON_RUN_AS_NODE`, so the target started as a full VS Code (handing `debug-target.js` to the default VS Code instance) and the breakpoint never bound (run 2026-10-10T01-25-55 timed out). `review/workspace/.vscode/code-node.cmd` now sets Node mode itself, and the launch config uses it as `runtimeExecutable`.
- Icon sheet: one tree in a default-height panel showed 13 of 23 rows at 100% and 5 at 200% (run 2026-10-10T01-41-22). The helper now splits the rows over two side-by-side views, and the scene maximizes the panel (chord `ctrl+alt+shift+m`) and restores it in teardown.
- SCM state across scales: `debug.saveBeforeStart` saves the dirty notes.md when the debug scene starts, so every launch after the first saw a third change. `capture.mjs` now restores the fixture's working files before each launch, rewriting only files whose content changed. The fixture repo sets `core.fileMode false` so the rewrite does not show in the terminal (run 2026-10-10T02-02-52 showed every file as modified).
- Windows Terminal reference: the plan's inline PowerShell lost its escaped quotes on the way from WSL, and `wt.exe` split the command at `;`. The capture ran as a `.ps1` file with `-File`, `wt.exe` got `-p <Moonlit Candle profile GUID>` and `ll\; sleep 30`.

## Approval
Approved with changes on 2026-10-10. Every decision was taken as recommended and is recorded as G1-G8 in spec section 11.1.
- Applied before the phase-1 commit: the plain disc is the moon breakpoint, and plain dots fill the search lens and the gear hub (G1, G2). The gate variants in `icons/product-src-variants/` were removed. The stray `cmp.png` was deleted.
- Carried into phase 2: grid snapping (G3), the `circle-filled` keys (G4), the gutter lightbulb IDs (G5), the dirty-branch sprig variants (G6) and the five redraws (G7).
- The phase-1 colour choices above stand.
