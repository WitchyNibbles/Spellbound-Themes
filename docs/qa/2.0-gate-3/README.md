# Spellbound 2.0, review gate 3 (panel and debug batches)

- Run: 2026-10-10T15-54-10 · VS Code 1.141.0 (2a59476c9b) · mode device-scale · repo 7fb1667c (dirty: gate-3 work is uncommitted, so `repoDirty` is true); the run used tree 48fd904127e6ab7f4655af1d6c0ec4e568bd43d3 (review-out/g3/TREE_10; only docs/qa/2.0-gate-3 was added after it)
- Reproduce: `AGENT_BROWSER_SESSION=spellbound-gate3 npm run review:gate -- --job review/jobs/gate-3.json` (`--help` lists the dry-run options; harness in docs/superpowers/plans/2026-10-10-spellbound-2-phase-1.md, Part D; gate-3 harness fixes in docs/superpowers/plans/2026-10-10-spellbound-2-gate-3.md, Task 3; gate-3 scenes in the same plan, Task 10)
- Raw captures (not committed): review-out/2026-10-10T15-54-10/captures. `manifest.json` here lists all 544 with their sha256: main pass 4 scales × 136. 0 warnings.
- Committed here: the 20 `commitSheets` from `review/jobs/gate-3.json`. Every sheet, this README and the manifest passed `node scripts/review/privacy-scan.mjs`, and every sheet was checked by eye. Raw `full.png` captures of the debug scenes show the Debug Console, which prints the launch command with the Windows user directory; no committed crop includes it.

## Preconditions
- `npm test`: 297 of 297 pass at the run (300 of 300 after the privacy-scan fix below, 302 of 302 with the gate-3 decisions applied). `npm run validate`: passes with `base`, `color-themes`, `product-pipeline`, `product-batch:1`, `product-batch:chrome`, `product-batch:status`, `product-batch:panel` and `product-batch:debug` enforced; `editor`, `symbols`, `file-icons` and `release` are pending, as staged validation allows.
- Grid warnings: only `gear`, `sync-arrows` and `cat-slash`, accepted at gate 2 (G16). The panel and debug drawings add none.

## What to judge
- The panel batch: the quill (`output-view-icon`) and the console spider (`debug-console-view-icon`) as panel tab icons with the warning triangle (`markers-view-icon`), in main-panel-icons-title (the scene shows the panel tabs as icons, `workbench.panel.showLabels: false`); the funnel (`filter`, Problems filter box) and the expand corners (`panel-maximize`) in the same title; the broom (`clear-all`) in main-output-title and, as `notifications-clear-all`, in main-notifications-center-list (the Debug Console's own clear button, `debug-console-clear-all`, shows the broom by default in main-debug-stopped-panel-title); the bin as `trash` (Kill Terminal, main-terminal-panel) and as `terminal-kill` (terminal quick access, main-terminal-picker-widget).
- The breakpoints, in main-breakpoints-code (lines 2-12 of debug-target.js) and main-breakpoints-sidebar (the Breakpoints view): disabled (line 2), log disabled (4), log (6), plain (9), conditional (11), and the hint under the pointer (12); unverified (unbrewed.js, never loaded) in main-debug-stopped-sidebar.
- Stopped on line 9: the stackframe with the moon dot over it (main-debug-stopped-code); the focused frame on line 11, on the conditional breakpoint, with the dot (main-debug-focused-code).
- The debug toolbar: continue, step over, into, out, restart (main-debug-stopped-toolbar) and pause (main-debug-running-toolbar). js-debug's focused session is a child session, so the floating toolbar shows Disconnect (`debug-disconnect`, unpinned, stock) with Stop as its Alt alternative and in its dropdown (a menu entry without an icon); Stop's icon shows on the hovered launch-session row in Call Stack (main-debug-stopped-sidebar).
- `debug-start` in the Run and Debug title (main-breakpoints-sidebar); `testing-run-all-icon` in the Testing title and `testing-run-icon` in the gutter of brews.spec.js before a run (main-testing-sidebar, main-testing-code); `testing-passed-icon` in the tree and the gutter after Run All (main-testing-results-sidebar, main-testing-results-code).
- Every drawing at 16px, in two pages: main-icon-sheet-panel (51 drawings) and main-icon-sheet-2-panel (the other 20).
- Each sheet: rows = theme · variant, columns = 100/125/150/200%.

## Decisions for the author at this gate
- **Decision: D4 pairing for the disabled and unverified breakpoint states.** As drawn, `debug-breakpoint-disabled` is the hollow moon, but `-conditional-disabled` and `-log-disabled` are the filled `=` moon and diamond in VS Code's disabled colour, and `-conditional-unverified` is the dashed ring without the `=` (1.141 never draws the two conditional states; see the next decision). Options: keep the pairing, or draw hollow `=`-moon and diamond outlines for the disabled states (two more drawings). Recommendation: keep; only `-log-disabled` is visible in 1.141 and the disabled colour carries the state (main-breakpoints-code, line 4).
  - Seen at this gate: at 100% the unverified dashed ring's six gaps barely resolve, so in the Breakpoints view it reads close to the hollow disabled moon; the greyed row text carries most of the difference (main-debug-stopped-sidebar, last row against the first). At 125% and above the dashes are clear.
- **Decision: the debug toolbar's weight.** Continue (a 2-unit bar and a filled triangle), pause (two 3-unit bars) and stop (a 10×10 square) are solid where Codicon draws outlines; the steps (1-unit stems, filled heads, a 3×3 moon) and restart (a 1-unit band with a filled head) stay light, so the row reads solid, light, light, light, light, solid (main-debug-stopped-toolbar, main-debug-running-toolbar). Options: keep, make continue, pause and stop outlines, or make the whole family heavier. Recommendation: keep; the solid controls are the ones a user reaches for first.
  - Seen at this gate: for Node the row does not end solid with Stop. In main-debug-stopped-toolbar and main-debug-running-toolbar it ends with the stock outline Disconnect plug at every scale and theme, and Stop never appears on the toolbar. The solid ending depends on the `debug-disconnect` -> `stop-square` decision below.
  - Also weigh: pause's bars are 3 units wide where continue's bar is 2, and pause (3×12 bars) and stop (10×10) are the heaviest glyphs in the set, likely about 25% above stock.
- **Decision: `testing-run-all-icon`.** A filled triangle with an open chevron ahead of it, not Codicon's second outline offset down and left (which these 2:3 sides cannot fit with 1 unit of clearance). Options: keep, or redraw as two offset outlines with smaller triangles. Recommendation: keep (main-testing-sidebar).
  - Also weigh: at 16px `play-stacked` reads as fast-forward (▶▷) rather than "run all" (main-testing-sidebar, every scale).
- **Decision: the quill's solid vane (`output-view-icon`).** An exception to section 4's one-filled-accent rule, like the witch hat (G12): every outlined vane read as a spoon or a racket at 16px. The ink drop stays the accent. Recommendation: keep (main-panel-icons-title).
  - Also weigh: the shaft touches the vane at a single point (the vane tip at (7,9) on the shaft's end edge); at 2x it reads as a small separate nib.
- **Decision: the funnel (`filter`).** The "liquid in the spout" is a drop below the cone, not a liquid inside a hollow spout: a 4-wide hollow spout leaves a 2-unit channel, too narrow for an accent with 1-unit clearance. The cone's hole is a trapezoid at least 2 units wide all the way down. Recommendation: keep.
  - Seen at this gate: at 100% the drop is a dot, so the funnel can read as a stemless goblet (main-panel-icons-title).
- **Decision: quill and broom.** Both are a diagonal implement from upper right to lower left with two short lines at the lower right, and both can sit in the Output title bar (the view icon with `showLabels: false`, and Clear Output). They are distinguishable at 16px but look like one family. Options: keep, or move the broom's swept lines to the lower left. Recommendation: keep unless main-output-title shows them confusable.
  - Seen at this gate: no committed sheet shows them side by side (main-output-title keeps the tab labels; main-panel-icons-title shows the quill tab with Problems active, so no Clear Output). Compared across the two sheets at 100%, they share the diagonal silhouette: the broom's handle is a thin 1.41 band, faint at 100%, detached from a heavy kite-shaped fan, and the quill's vane is solid with a dot nib.
- **Decision: the focused frame and the top frame.** Focused frame + dot and top frame + dot differ only by colour (the spec documents this, and it is stock behaviour). Options: keep, or give the focused frame a shape difference. Recommendation: keep unless the colour note under "Choices" below (the dot on the focused frame takes the frame colour) changes the author's view.
  - Seen at this gate: on line 11 (main-debug-focused-code) the `::after` dot takes the frame colour (1.141 colours it with the breakpoint colour only for plain breakpoints), so while the frame is focused nothing shows the conditional breakpoint. Drawing option: `stackframe-moon`'s own centre dot sits exactly where the `::after` dot lands; a focused-frame drawing with a hollow or empty centre would let the frame-coloured dot show that a breakpoint is there, even though its colour cannot be fixed.
- **Decision: `debug-breakpoint-conditional-disabled` and `debug-breakpoint-conditional-unverified`.**
  - Finding: VS Code 1.141 never draws either. Its breakpoint-icon function gives a disabled conditional breakpoint the plain disabled icon and an unverified one the plain unverified icon. Both are mapped as D4 decided. The gate shows their drawings (the `=` moon, the dashed ring) through the IDs that share them, in context and in the icon sheet, but not these IDs' own classes, which nothing renders.
  - Options: keep both mapped, or drop them from the pinned list.
  - Recommendation: keep them mapped. They cost nothing, and a later VS Code may draw them.
- **Decision: `debug-disconnect`.**
  - Finding: it is not pinned, yet it ends every Node.js debug toolbar (js-debug focuses a child session, so the toolbar shows Disconnect in Stop's place). It is a stock Codicon beside the Spellbound glyphs (main-debug-stopped-toolbar).
  - Options: pin it to `stop-square` now (one map line, no new drawing), give it a new drawing in a later batch, or leave it stock.
  - Recommendation: pin it to `stop-square` now. The toolbar is the most-seen debug surface.
- **Decision: `debug-breakpoint-log-unverified`.**
  - Finding: it is not pinned, so a logpoint in a file the debugger has not loaded shows the stock icon.
  - Options: pin it to `dashed-ring` (one map line), or leave it stock.
  - Recommendation: pin it to `dashed-ring`. D4 already gives the unverified states the dashed ring.
- **Decision: approve the panel batch and the debug batch, or list changes.**

## Evidence for decisions already taken (spec sections 11.1 and 11.2)
- G1 (moon breakpoint, plain disc) and D4: `debug-hint` on the moon breakpoint drawing, shown at 40% opacity by VS Code (main-breakpoints-code, line 12).
- D4: the log-disabled breakpoint (line 4) shows the diamond in the disabled colour; the unverified breakpoint in unbrewed.js shows the dashed ring in the Breakpoints view (main-debug-stopped-sidebar); the conditional states that reuse drawings are not drawn by 1.141.
- `markers-view-icon` uses the warning triangle (spec 5.2), in main-panel-icons-title.

## Choices made in this phase that the author may overrule
- `console-spider`: a console window (x1-13, y2-12, smaller than the house `terminal` frame) with a short `❯` and a six-legged spider breaking out of its open lower-right corner, following the stock layout. A spider inside a closed window read as a ⊠ beside `close` and `terminal-error`. At 16px the `❯` shrinks to a ▸; at 12px the spider is a speck, as the stock bug is.
- `bin` is straight-sided where the stock trash tapers (a taper would put every side edge off the grid); its lid is the filled part.
- The bin's lid (12×2 plus a 4×1 knob) is commented in the source as the accent but is under the ≥4×4 shape-accent minimum; it renders solid. Note only.
- The 4×5 ink drops (quill, funnel) render as round dots at 16px; the drop shape shows at 24px (batch 1 recorded the same for a 4×5 flame).
- `expand-corners` is 12×12 (x2-14), like the stock glyph.
- The stack-frame pointer is larger than the 8-unit signal keyline (x2-15, y3-13), because it holds the 4×4 overlay dot with 1 unit of clearance.
- The steps use a 3×3 moon on pixel column 7 (x6-9), not the 4×4 overlay dot, so the moon lines up with the arrow stems; step-over's head is 6×3, 1.68 clear of the moon.
- At 12px `step-into` and `step-out` read like "!" and step-over's head becomes a nub. This is inherent to the stock arrow-over-dot metaphor; they read at 14 and 16px.
- The unverified ring has six round-ended dashes (eight read as a faint dotted ring at 16px, four as a ring with notches).
- The round dash ends of `dashed-ring` (scripts/glyphs/debug.mjs) are `A0.5 0.5` arcs. Spec section 4 says "No radius ... under 1 unit"; this is the only glyph with a sub-unit radius. For the author's ruling: keep, or draw the dash ends square.
- The log diamond spans 3-13 (spec 5.2) and has the moon's area.
- The passed-test check is cut out 2.12 across and meets the 2-unit minimum, unlike the gate-2 ✕ exception.
- Known and not fixable by the theme: whenever a stop is not in column 1 (including the first statement of an indented line), VS Code draws an inline stack-frame arrow before the stopped column in the stock `codicon` font with a hard-coded character, so it is always the stock Codicon (spec 5.2). The themed frame shows in the gutter only. This bears on spec section 1's "no stock Codicon visible" criterion.
- The review terminal runs Windows PowerShell with `-NoProfile`, a fixed `PS workspace>` prompt and VS Code's shell integration sourced by the profile, so the committed terminal sheet no longer depends on the author's own PowerShell profile (gate 2's showed whatever that profile printed).
- Glyph notes from the review of this run (every sheet, every scale):
  - Blur at 125% and 150%: none beyond what snapped strokes allow. Horizontal and vertical edges stay sharp at both scales. The softest strokes are the diagonals (the broom handle, the quill shaft, the funnel's cone sides), which is expected for diagonals. Every glyph shows ClearType colour fringes on its edges at all scales: that is VS Code's subpixel text antialiasing applied to the icon font, not a drawing issue.
  - Breakpoints at 16px/100% (main-breakpoints-code): the five states read apart in all four themes. The disabled hollow moon (2) and the log-disabled grey diamond (4) are in the disabled colour; the log diamond (6), plain moon (9) and `=` moon (11) are in the breakpoint colour; and the hint (12) is a dim disc. The two bars of the `=` moon resolve at 100%, and are crisp from 125% up. The unverified dashed ring is covered under the D4 decision above.
  - The moon dot of `debug-stackframe-dot` on line 9 (main-debug-stopped-code): it is centred in the open middle of the stackframe at 100, 125, 150 and 200% in all four themes, in the breakpoint colour (pale gold in moonlit-candle, red in moonlit, daydream and coven-contrast). It reads as the breakpoint seen through the frame.
  - The moon dot on the focused frame, line 11 (main-debug-focused-code): it is centred in the focused frame at all four scales in all four themes. Its colour is the frame's colour at every scale (lavender in moonlit-candle, moonlit and coven-contrast; purple in daydream), not the breakpoint gold or red that `debugIcon.breakpointForeground` would give. The cause is in 1.141's own CSS. The theme participant colours the `::after` dot with `debugIcon.breakpointForeground` only for the plain family (`.codicon-debug-breakpoint.codicon-debug-stackframe::after` and `…-stackframe-focused::after`). The conditional family's `::after` (`.codicon-debug-breakpoint-conditional.codicon-debug-stackframe-focused::after`) gets its content but no colour rule, so it inherits the focused-frame colour (`debugIcon.breakpointStackframeForeground`). The dot also lands on `stackframe-moon`'s own centre dot. It therefore reads as part of the frame, not as the breakpoint: while that frame is focused, nothing on line 11 shows that a conditional breakpoint is there. A plain breakpoint under a focused frame would keep the breakpoint-coloured dot.
  - `restart` against `sync`: restart is one open arrow with one head, in the toolbar's green; `sync-arrows` is two opposed arrows (main-icon-sheet-panel). They are not confusable at any scale.
  - Toolbar optical size beside the stock Disconnect (main-debug-stopped-toolbar): continue is the largest and heaviest mark in the row. The steps are narrow (1-unit stems) and read lighter and smaller. Restart and the stock plug have about the same extent, though the plug is an outline. The row holds together as one family at every scale; the step glyphs are the odd ones out by width, not height.
  - Panel-title glyphs at 16px:
    - The bin (Kill Terminal, main-terminal-panel; quick access, main-terminal-picker-widget) reads clearly: lid, knob and ribbed straight body.
    - The broom (main-output-title, main-notifications-center-list, main-debug-stopped-panel-title) reads as a broom with a heavy fan and two swept lines; its handle is faint at 100%.
    - The funnel (main-panel-icons-title) reads as an open cone over a round drop. At 100% the drop is a dot, so it can also be read as a stemless goblet.
    - The quill (main-panel-icons-title) reads as a feather with a dot nib and two lines.
    - The console spider reads as a console window with a ▸. Its spider is a dark blot at the lower right at 100%, and legible from 150%.
    - Expand corners reads at every scale.
  - The warning triangle as a tab icon (main-panel-icons-title) is half covered by the Problems count badge at 100%. The badge position is VS Code's.

## Known staging artifacts (not defects)
- Every pinned ID in the editor and symbols batches still shows its stock Codicon (layout toggles, `case-sensitive`/`whole-word`/`regex`, the ✧ `sparkle`, the symbols).
- Unpinned IDs stay on Codicons: `debug-disconnect` (floating toolbar), `debug-restart-frame` (Call Stack row actions), `record` (Take Performance Profile), `debug-console-clear-all` shows the broom through its default, `terminal-decoration-incomplete` (open prompt line).
- No surface reachable in the review profile draws `codicon-run` (the Run Active File actions are hidden by default; the other uses need states the fixture lacks), so the play outline shows as `testing-run-icon` in the gutter, and as `run` in the icon sheet when `run` is its drawing's first ID. `debug-breakpoint-conditional-disabled` and `-conditional-unverified` are never rendered (see Decisions).
- The pointer rests on the line-12 glyph margin in the breakpoints scene (for `debug-hint`) and on the launch-session row in Call Stack in debug-stopped (for Stop's inline action). Those two scenes keep tooltips off (`workbench.hover.delay`), every screenshot waits until no tooltip is shown, and each scene parks the pointer on the status bar when it ends.
- Variables and Watch are hidden in the Run view from the breakpoints scene on, so Call Stack and the Breakpoints view fit the side bar at 200%. Both side bars stay closed after the icon-sheet scenes, so main-panel-icons-* show a full-width panel.
- A code-action lightbulb (the candle, an editor-batch glyph judged at gate 4) appears in main-testing-code and main-testing-results-code (line 1) and in main-debug-focused-code (line 10).
- The small hollow circles inside the stopped lines (main-debug-stopped-code, main-debug-focused-code) are VS Code's inline breakpoint candidates (`debug.showInlineBreakpointCandidates`), which 1.141 shows while a session is stopped. They are not breakpoints in the fixture.
- Framing at this run, all scales:
  - The Breakpoints view holds all six rows inside its pane at 200%, both before the session (main-breakpoints-sidebar) and stopped (main-debug-stopped-sidebar, with Loaded Scripts collapsed to its header). The unverified row is the last one, just above the pane's bottom edge.
  - Both icon-sheet pages fit at every scale: three views of 17 rows, no scrolling, no hover highlight, no tooltip.
  - The hover point reached the line-12 glyph margin (`debug-hint` shows) and the Call Stack session row (its inline actions show) at all four scales.
  - At 150% and 200% the panel's tab strip collapses into "…": main-output-title at 200% shows no Output tab label, and the Debug Console filter box drops out of main-debug-stopped-panel-title at 200%. The title actions, including the broom, show at every scale.
  - At 200% the Run and Debug title truncates to "Run And D…"; the green `debug-start` button stays whole.

## Colour-theme observations (not glyph defects)
- coven-contrast: the quick-input focused row is black on near-black (`list.activeSelectionForeground` is `#000000` and the theme sets no `quickInputList.focus*` keys), so the `terminal-kill` bin in the focused terminal-picker row is unreadable (main-terminal-picker-widget, last row). The fix would be to set `quickInputList.focusForeground` and `quickInputList.focusBackground`.
- moonlit, daydream and coven-contrast: the error skull (`editorError.foreground`: pink, or dark magenta in daydream) nearly vanishes on the magenta or pink selected Problems row (main-panel-icons-panel).

## Harness changes made for this gate
- New scenes: output, notifications-center, terminal-picker, breakpoints, debug-stopped, debug-focused, debug-running, testing, testing-results, icon-sheet-2, panel-icons (run last: toggling the panel's tab labels left the next scene's panel title overlapping at 200%). Reworked: terminal (focuses the editor group first, so it no longer depends on the scenes before it; PowerShell without the user profile), icon-sheet (closes both side bars; pages of 51 drawings).
- Job schema: `scene.settings` (applied to the setup and every capture; every scene's setup now starts in the first theme) and the `hover` step (moves the pointer, for `debug-hint` and the Call Stack row actions).
- `run-gate.mjs` stops with its usage on an unknown option (it used to start a full gate-1 run), has `--help`, and takes `--scales` and `--scenes` for dry runs (the manifest then records `dryRun`). Gate 2's terminal scene also focuses the editor group first, so it no longer depends on earlier scenes either.
- Helper extension: one breakpoint of each drawn kind (`breakpoints.json`), two tests located in brews.spec.js, three icon-sheet views in pages of 51 (`spellboundReview.iconSheetPage`). Fixture: debug-target.js gains `stir` and a timer (lines 1-6 unchanged); new unbrewed.js and brews.spec.js.
- `scripts/review/privacy-scan.mjs`: scans committed sheets (OCR) and text files for the machine's user names, user directories and email addresses (names read at run time, never stored), and fails closed when it cannot run.
- `scripts/review/privacy-scan.mjs` fix, made after run 2026-10-10T15-54-10 (it does not affect that run): a `.png` that OCR reads fewer than 20 non-space characters from now exits 2 ("could not scan", naming the file) instead of passing. The 22 committed files were re-scanned afterwards with exit 0.
- `capture.mjs`: every screenshot waits until no tooltip is shown; the `hover` step sends its point to CDP unscaled in both capture modes; scene settings; the PowerShell profile sources shell integration inside `try`/`catch`.
- `test/package-contents.test.mjs` runs `vsce` through Node, so it passes on native Windows (`npx` there is `npx.cmd`).
- Fixes made while running: none. The full run 2026-10-10T15-54-10 passed every non-optional step on its first attempt (544 captures, 0 warnings), and no harness file changed for it.

## Approval
Approved by the author on 2026-10-10, every decision as recommended (spec section 11.3, G18-G30):
- D4 pairing: kept. The disabled states reuse the `=` moon and the diamond in the disabled colour; every unverified state is the dashed ring.
- `debug-breakpoint-conditional-disabled` and `-conditional-unverified`: kept mapped.
- `debug-breakpoint-log-unverified`: pinned on the dashed ring. `debug-disconnect`: pinned on the Stop square, so the Node.js toolbar ends solid. 172 pinned keys (132 core + 40 extras); the gate-4 job waits for both IDs.
- The dashed ring's round 0.5-unit dash ends: kept (spec section 4 records the exception).
- Debug toolbar weights, `testing-run-all-icon`, the quill's solid vane, the funnel, the quill and broom diagonal, and the focused frame: kept as drawn.
- coven-contrast: `quickInputList.focusBackground` `#FF67B7`, `quickInputList.focusForeground` and `quickInputList.focusIconForeground` `#000000`, so the focused terminal-picker row and its bin are readable. The error skull on the selected Problems row stays an observation, with no change at this gate.
- The panel batch and the debug batch: approved. Gate 4 (editor and symbols batches) is next.

The sheets above are the evidence the author judged, so they still show the stock Disconnect plug on the debug toolbar and the unreadable focused row in coven-contrast's terminal picker.
