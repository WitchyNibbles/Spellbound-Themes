# Spellbound Themes 2.0, Phase 2 to Review Gate 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the repo from the approved review gate 1 to review gate 2: apply the gate-1 decisions that belong before gate 2 (G3 grid snapping, G4 to G6 new keys, G5 light bulbs on the candle, G7 redraws of five batch-1 glyphs), draw the `chrome` batch (17 IDs) and the `status` batch (19 IDs), enforce both batch stages, and produce the gate-2 screenshot evidence in real VS Code 1.141. Then stop for the author.

**Architecture:** The drawing pipeline from phase 1 is unchanged: drawings are code in `scripts/glyphs/`, `npm run draw:glyphs` writes the SVGs, `scripts/claim-drawing.mjs` maps IDs to a drawing and codepoint, and `npm run build:product-icons` builds the WOFF and the theme. Two new modules, `scripts/glyphs/chrome.mjs` and `scripts/glyphs/status.mjs`, join `glyphModules`. `scripts/glyphs/batch-1.mjs` gains an exported `parts` object (bell, cat head, cat eyes, small sprig, ✦), so the status variants are built from the same geometry as their batch-1 base drawings. Two geometry helpers are added: `filledAt` (nonzero fill test, for clearance and shape tests) and `knockOut` (clip a shared part around an accent). The phase-1 gate harness gets eight new scenes and three reworked ones (workbench, notifications, terminal), helper commands that reach the states the status glyphs need (git index, merge conflict, notification severities, shell-integrated terminal, Copilot states, spinners), and a third icon-sheet view.

**Tech Stack:** Node 24 (ES modules, `node:test`), svgicons2svgfont 15.0.1, svg2ttf 6.1.0, ttf2woff 3.0.0, fontkit 2.0.4, svg-pathdata 7.2.0, @vscode/vsce 3.x, agent-browser 0.38.1 (glyph sheets, contact sheets), VS Code 1.141.0 for Windows (gate captures), Windows PowerShell 5.1 (terminal decorations at the gate).

**Spec:** `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`, especially section 4 (glyph rules), 5.1, 5.2, 5.3, 8 and 11.1 (gate-1 decisions G1-G8). Phase-1 plan: `docs/superpowers/plans/2026-10-10-spellbound-2-phase-1.md` (conventions, harness). Gate-1 checklist: `docs/qa/2.0-gate-1/README.md`. Executors read the spec alongside this plan; section numbers below refer to the spec.

## Global Constraints

Kept from phase 1 (still valid, copied verbatim):

- `engines.vscode` stays `^1.100.0`. The package stays declarative: no `main`, no activation events. The review helper extension in `review/` is never referenced from the root `package.json` and is excluded from the VSIX.
- Font ID `witchynibbles-product-icons`, family `WitchyNibbles Product Icons`, file `icons/witchynibbles-product-icons.woff`, theme `src` path `./witchynibbles-product-icons.woff`.
- Glyph sources: `viewBox="0 0 16 16"`, no `width`/`height`, only `<svg>` and `<path>` elements, filled paths only, no `stroke`, no `transform`, no `fill-rule="evenodd"`, every inner subpath wound opposite to its container. Font scale: 64 font units per grid unit (`fontHeight: 1024`), no `centerHorizontally`/`centerVertically`.
- The witchyterm scheme is pinned in this repo (`src/witchyterm-moonlit-candle.scheme.json`); `../witchyterm` is never modified.
- Never kill VS Code by image name (`taskkill /IM Code.exe` would close the author's own editor). Review instances run with their own `--user-data-dir` and `--extensions-dir` and are closed by PID or CDP only.
- The VS Code 1.141 bundle on this machine is at `/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js`; `07f806f999/` is the older 1.140.0.

Gate 2:

- Version stays `1.2.1` and `galleryBanner.color` stays `#110d24`; the `release` stage stays pending (2 problems).
- **No commits until the author approves gate 2.** The one exception is the author's own commit of this plan and the spec amendment, before Task 1 (see Before Task 1). Work stays on the checked-out `spellbound-2.0` branch, with no new branches or worktrees. Each task ends with a tree snapshot, `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_N` (N is the task number, so `review-out/TREE_1` … `review-out/TREE_12`; `review-out/` is git-ignored, so the files never enter a tree), and the next task's changes are `git add -A && git diff --cached $(cat review-out/TREE_N)`. The tree is dirty throughout and the gate manifest records `repoDirty: true`. When the author commits, messages end with the attribution line the session provides.
- Codepoints: redrawn batch-1 drawings keep their names and codepoints (E100-E116). Chrome drawings take `E117`-`E11E`, status drawings `E120`-`E12F`, both contiguous; `E11F` stays unused (`validateMap` allows gaps). A codepoint is never reused within a release (retired ones are listed in the map).
- Modules: `scripts/glyphs/chrome.mjs` and `scripts/glyphs/status.mjs`, each exporting `drawings` and `variants` like `batch-1.mjs`; `scripts/glyphs/index.mjs` ends as `export const glyphModules = [batch1, chrome, status];`.
- Shared parts (Task 2, snapped in Task 4), in `scripts/glyphs/batch-1.mjs`: `parts.star(cx, cy, outer, inner)` returns one path string (the four-point ✦ polygon); `parts.bell()`, `parts.catHeadOutline()`, `parts.catEyes()` (`[left, right]`) and `parts.sprigSmall()` return arrays of path strings for `svgDocument`. Nothing of `parts.bell()` lies inside x10-15, y1-6.
- Pinned keys: **170** (132 core + 38 extras). The brief named 166; the author decided 170 while this plan was written (spec section 11.1, the amendment under G5): the candle also takes `gutter-lightbulb-aifix-auto-fix` and the inline light-bulb codicons `lightbulb-sparkle`, `lightbulb-autofix` and `lightbulb-sparkle-autofix`, all in batch 1. Task 1 shows why. Batch `1` has 54 IDs, `chrome` 17, `status` 19.
- Validation stages: Task 6 appends `product-batch:chrome` and Task 10 appends `product-batch:status` to `scripts/validation-stage.json`, each only once every ID of its batch is mapped.
- Drawings follow section 4: keylines, whole-number edges for horizontal and vertical strokes, odd-width central features on pixel column 7 (x 7-8), accents ≥3×3 (dot) or ≥4×4 (shape), one full unit between an accent and a stroke, cut-outs ≥2×2 except straight slots ≥4 long, no gap or sliver under 1 unit, spin-safe `loading`/`sync`/`gear`.
- `node scripts/validate.mjs` writes its `✗` lines to stderr. Every command that pipes validate output into `grep` uses `2>&1`.
- agent-browser: every command block starts with `export AGENT_BROWSER_SESSION=spellbound-gate2` (the default session is one browser shared by every agent on the machine), every screenshot path is absolute (`"$PWD/…"`; a relative path resolves against the daemon's directory and fails with `No such file or directory`), and the block ends with `agent-browser close`. `review-out/` is git-ignored, so pages and PNGs written there never enter a snapshot.
- Test totals below were measured on a scratch copy of HEAD 81ff905 with every task applied in order. Without `../witchyterm` one more test is reported as skipped; `ℹ tests` and `ℹ fail 0` are the same either way.

### Glyph sheet procedure (used by every drawing task)

```bash
export AGENT_BROWSER_SESSION=spellbound-gate2
npm run glyph-sheet
agent-browser set viewport 1800 1400 1
agent-browser open "file://$PWD/review-out/glyph-sheet/index.html"
agent-browser screenshot --full "$PWD/review-out/glyph-sheet/sheet@1x.png"
agent-browser set viewport 1800 1400 2
agent-browser open "file://$PWD/review-out/glyph-sheet/index.html"
agent-browser screenshot --full "$PWD/review-out/glyph-sheet/sheet@2x.png"
agent-browser close
```

Expected: both PNGs exist and every drawing renders from the built font (no empty boxes). Open them with the Read tool; crop and upscale with nearest-neighbour scaling (PIL) when a 16px glyph is too small to judge in the full sheet.

## Review Focus

The five ways this work is most likely to fail a user, none of which phase 1's tests exercise, and the test that now pins each:

1. **The quick-fix light bulb stays a stock Codicon.** 1.141 draws the code-action bulb inline on most lines of real code, with the codicons `lightbulb-sparkle`, `lightbulb-autofix` and `lightbulb-sparkle-autofix`, and in the gutter only on unindented lines between unindented neighbours, with the `gutter-lightbulb*` IDs. Mapping only the gutter IDs (G5 before its amendment) changes nothing a user sees. Expected: the candle in both places. Pinned by the candle test in Task 1 (all eight IDs on E112) and by the gate-2 job, which waits (not optionally) for a `codicon-gutter-lightbulb*` element in the `bulb-gutter` scene and for the inline `.lightBulbWidget` with a `codicon-lightbulb-*` class in the `workbench` scene, whose `code` crop shows it (Task 11).
2. **A solid that renders as a hole.** `windingProblems` only compares subpaths nested inside one another. A shape that overlaps another with the opposite winding cancels to zero where they meet (a first owl redraw had a counter-clockwise body crossing its clockwise eye rings), and the font pipeline leaves that area empty. Expected: nonzero winding wherever a drawing means ink. Pinned by `no drawing or variant has a negative winding anywhere` in Task 3, which samples every module, drawings and variants, on a 0.25 grid.
3. **A spinning glyph that wobbles.** VS Code rotates `loading`, `sync` and `gear` about the element centre. A glyph whose mass is off (8,8) orbits instead of spinning. Expected: bounds centred on (8,8) for `sync` and `gear`, a 180° symmetric `sync`, and a loading crescent whose outer circle is the r6 circle about (8,8). Pinned by the sync centre and half-turn tests and the loading-circle test (Task 8) and the gear bounds test (Task 4).
4. **A shared part changes and a variant breaks.** bell-dot, the four Copilot states and the three dirty-branch sprigs sit next to their base drawings in the same status bar slot. If a base drawing changes (Task 4 snaps the bell and the cat head), an accent can touch the outline or the outline can jump between states. Expected: every variant is built from the live `parts`, keeps the base silhouette, and keeps one full unit between accent and stroke. Pinned by `each drawing that uses a part is exactly that part` (Task 2), the bell corner test (Task 4), and the clearance, silhouette and identity tests in Tasks 8, 9 and 10, which all measure against `parts.*()` at test time.
5. **A state glyph that never reaches the gate.** The dirty, staged and conflicted branch icons, the terminal success and error decorations, the unread bell and the Copilot states only render in states a fresh session does not show, so a broken drawing would ship unseen; and a scene that leaves the fixture mid-merge corrupts every later capture. Expected: the gate reaches each state and restores the repository after it. Pinned by `gate 2 waits, without an optional step, for every chrome and status glyph`, `gate 2 scenes that change the fixture repository put it back` and `the terminal profile used for command decorations gets shell integration injected` (Task 11).

## Resolved decisions

The author took G1-G8 at gate 1 (spec section 11.1). This table says what this plan does for each.

| # | Decision | Tasks | What this plan does |
| :- | :- | :- | :- |
| G1 | Moon breakpoint: plain disc | none | Applied before the phase-1 commit (`moon-breakpoint` is the plain disc). `debug-hint` claims it in the debug batch (gate 3). |
| G2 | Search lens and gear hub: plain dot | Task 4 | Applied in phase 1. Task 4 confirms `scrying-glass` has no off-grid points and snaps the gear's axis teeth around the unchanged hub. |
| G3 | Snap off-grid points where the shape does not distort; document the rest | Tasks 4, 10, 12 | Task 4 snaps bell, cat head, flask and the gear's four axis teeth, and fixes the validator false positive behind the grimoire, moon-gate and terminal warnings. A new test holds batch 1 on the grid, except the gear's 45° teeth. New phase-2 drawings are on the grid except the curve ends of `sync-arrows` and the knockout cut points of `cat-slash`; Task 10 adds a test that pins exactly those three drawings (`gear`, `sync-arrows`, `cat-slash`) as the only ones with off-grid points. Task 12 lists the remaining warnings for the author. |
| G4 | `circle-filled` consumers keep the ✦; `terminal-decoration-success` and `ports-forwarded-with-process-icon` get their own keys in `status` | Tasks 1, 7, 10 | Task 1 pins `ports-forwarded-with-process-icon`. Task 7 draws the small dot (`status-dot`, E123) for `terminal-decoration-success`; Task 10 adds the ports ID to it. `circle-filled` keeps the ✦. |
| G5, as amended | `gutter-lightbulb-sparkle` and `gutter-lightbulb-auto-fix` map to the candle; amended while this plan was written (spec 11.1, under G5): the candle also takes `gutter-lightbulb-aifix-auto-fix`, `lightbulb-sparkle`, `lightbulb-autofix` and `lightbulb-sparkle-autofix`, all in batch 1, for 170 pinned keys | Tasks 1, 11 | Task 1 pins and claims the six IDs for the candle: the three gutter IDs (`-sparkle`, `-auto-fix`, `-aifix-auto-fix`) and the three inline codicons (`lightbulb-sparkle`, `-autofix`, `-sparkle-autofix`), because the bulb gate 1 saw was the inline `lightbulb-sparkle`. `gutter-lightbulb-sparkle-filled` (all actions are AI actions) stays unpinned and goes to the author. Task 11 shows the candle inline (line 10) and in the gutter (line 16). |
| G6 | `git-branch-changes`, `-staged-changes`, `-conflicts` are sprig variants in `status` | Tasks 1, 10, 11 | Task 1 pins them. Task 10 draws the small sprig with a ✦, ✓ or ! badge. Task 11 puts the fixture repository into each state. |
| G7 | Redraw spider, owl, witch hat, moon gate, grimoire | Tasks 2, 3 | Task 2 extracts `parts` byte-identically; Task 3 redraws the five, with tests that pin what each must and must not contain, and updates the spec 5.2 rows. |
| G8 | Batch 1 approved with these changes; phase-1 colours stand | Task 12 | No colour change. The five redraws and the snapped bell go back to the author at gate 2. |

## File structure

Created:

- `scripts/glyphs/chrome.mjs` (Tasks 5, 6), `scripts/glyphs/status.mjs` (Tasks 7-10): glyph modules.
- `test/glyph-parts.test.mjs` (Task 2), `test/glyph-redraws.test.mjs` (Task 3), `test/glyph-grid.test.mjs` (Task 4, extended in Task 10), `test/chrome-glyphs.test.mjs` (Task 5), `test/status-glyphs.test.mjs` (Task 7).
- `icons/product-src/*.svg` for the 24 new drawings, `icons/product-src-variants/ellipsis.small.svg`, `icons/product-src-variants/cat-warning.solid.svg` (generated).
- `review/jobs/gate-2.json` (Task 11).
- `docs/qa/2.0-gate-2/` (Task 12): README, manifest and 22 contact sheets.

Modified:

- `scripts/glyphs/batch-1.mjs` (`parts`, redraws, snaps), `scripts/glyphs/index.mjs`, `scripts/glyphs/primitives.mjs` (`knockOut`), `scripts/lib/svg-geometry.mjs` (`filledAt`, `offGridPoints`), `scripts/validation-stage.json`.
- `icons/product-icon-ids.json`, `icons/product-icon-map.json`, `icons/product-icon-theme.json`, `icons/witchynibbles-product-icons.woff`, the redrawn and snapped `icons/product-src/*.svg`.
- `test/product-icon-ids.test.mjs`, `test/product-icon-theme.test.mjs`, `test/svg-geometry.test.mjs`, `test/glyph-primitives.test.mjs`, `test/review-harness.test.mjs`.
- `review/helper-extension/{package.json,extension.js,README.md}`, `review/profile/{keybindings.json,settings.base.json}`, `review/workspace/spells.ts`, `scripts/review/run-gate.mjs`, `scripts/review/capture.mjs` (comment only).
- `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (sections 2, 5.1, 5.2; section 11.1 already carries the G5 amendment and is not edited), `docs/research/vscode-1.141-icon-inventory.md`.

Not committed (git-ignored): `review-out/compare/compare.mjs` (Task 3), `review-out/chrome-compare/make.mjs` (Task 5), sheets and dry runs under `review-out/`.

## Staging: how each batch counts down

Validation stays staged by batch (phase-1 staging decision). Unmapped IDs per batch, from `node scripts/validate.mjs --only product-batch:<batch> 2>&1 | grep -c 'does not map'`:

| After | `1` | `chrome` | `status` | Stages enforced |
| :- | :- | :- | :- | :- |
| HEAD 81ff905 | 0 (48 IDs) | 17 | 15 | base, color-themes, product-pipeline, product-batch:1 |
| Task 1, pins added (Step 3) | 6 | 17 | 19 | same |
| Task 1, done | 0 (54 IDs) | 17 | 19 | same |
| Task 5 | 0 | 10 | 19 | same |
| Task 6 | 0 | 0 | 19 | + product-batch:chrome |
| Task 7 | 0 | 0 | 13 | same |
| Task 8 | 0 | 0 | 8 | same |
| Task 9 | 0 | 0 | 4 | same |
| Task 10 | 0 | 0 | 0 | + product-batch:status |

The `editor` (33), `panel` (9), `debug` (23) and `symbols` (15) batches, `file-icons` (19) and `release` (2) stay pending throughout.

## Codepoints for the new drawings

| Codepoint | Drawing | Task | IDs |
| :- | :- | :- | :- |
| E117 | `arrow-right` | 5 | arrow-right |
| E118 | `arrow-left` | 5 | arrow-left, quick-input-back |
| E119 | `arrow-down` | 5 | find-next-match, diff-editor-next-change |
| E11A | `arrow-up` | 5 | find-previous-match, diff-editor-previous-change |
| E11B | `add` | 6 | add, plus, terminal-new, diff-insert |
| E11C | `remove` | 6 | remove, diff-remove |
| E11D | `check` | 6 | check |
| E11E | `ellipsis` (+ gate variant `ellipsis.small`) | 6 | ellipsis, more, toolbar-more |
| E11F | unused | | |
| E120 | `warning-triangle` | 7 | warning, dialog-warning |
| E121 | `info-disc` | 7 | info, dialog-info |
| E122 | `terminal-error` | 7 | terminal-decoration-error |
| E123 | `status-dot` | 7, 10 | terminal-decoration-success (7), ports-forwarded-with-process-icon (10) |
| E124 | `bell-dot` | 8 | bell-dot |
| E125 | `moon-gate-small` | 8 | remote |
| E126 | `sync-arrows` | 8 | sync |
| E127 | `loading-crescent` | 8 | loading |
| E128 | `braces` | 8 | bracket |
| E129 | `cat-slash` | 9 | copilot-unavailable |
| E12A | `cat-asleep` | 9 | copilot-snooze |
| E12B | `cat-star` | 9 | copilot-dot |
| E12C | `cat-warning` (+ gate variant `cat-warning.solid`) | 9 | copilot-warning |
| E12D | `sprig-changes` | 10 | git-branch-changes |
| E12E | `sprig-staged` | 10 | git-branch-staged-changes |
| E12F | `sprig-conflicts` | 10 | git-branch-conflicts |

Existing drawings that change: `candle` (E112) gains six IDs (Task 1); `explorer-grimoire` (E100), `spider` (E103), `moon-gate` (E106), `witch-hat` (E107) and `owl` (E10A) are redrawn (Task 3); `bell` (E114), `cat-head` (E109), `flask` (E104) and `gear` (E108) are snapped (Task 4). The map ends with 47 drawings for 90 IDs.

Gate variants: a file in `icons/product-src-variants/` is named `<drawing>.<label>.svg`; `run-gate.mjs` passes it as `--variant=<text before the first dot>=…`, and `test/review-harness.test.mjs` requires that drawing to exist. Gate 2 has two variants, for two different drawings, so one variants pass shows both.

---

## Before Task 1

The author commits this plan and the spec amendment under G5 (section 11.1) on `spellbound-2.0` before Task 1 starts. Executors do not make that commit. Check it:

Run: `git status --short | wc -l && git log -1 --format=%s -- docs/superpowers/plans/2026-10-10-spellbound-2-gate-2.md docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`
Expected: `0`, then the subject of the author's commit (not `Spellbound 2.0 phase 1: …`). Task 1 Step 6 expects exactly 8 `git status` lines: an uncommitted plan would add a ninth, and an uncommitted spec amendment would end up in Task 1's diff and snapshot. If the first line is not `0`, stop and ask the author.

---

## Part A: keys and light bulbs (gate-1 decisions G4, G5, G6)

### Task 1: Pin the gate-1 keys and claim every code-action light bulb for the candle

**Files:**
- Modify: `icons/product-icon-ids.json` (10 new keys), `test/product-icon-ids.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json` (candle IDs), `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated by `npm run build:product-icons`), `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (sections 2, 5.1, the 5.2 candle row), `docs/research/vscode-1.141-icon-inventory.md`

**Interfaces:**
- Consumes: `extractRegistrations(source)` and `node scripts/extract-icon-ids.mjs` (phase 1 Task 3); `claimDrawing` through `node scripts/claim-drawing.mjs` (phase 1 Task 11); the `candle` drawing at `E112` (phase 1 Task 13).
- Produces: 170 pinned keys (132 core + 38 extras). Batch `1` grows from 48 to 54 IDs, all mapped; the candle carries eight. Batch `status` grows from 15 to 19 IDs (`git-branch-changes`, `git-branch-staged-changes`, `git-branch-conflicts`, `ports-forwarded-with-process-icon`), which Tasks 7-10 map. Tasks 7 and 10 rely on these pins.

**Decisions G4, G5 as amended, G6 (spec section 11.1), and why G5 needed the amendment.** The code-action light bulb has two renderings and five states. The widget picks the icon in `Sqi` (minified name in 1.141); its `i` argument is true when the bulb is drawn in the gutter and false when it is drawn inline in the text (a content widget):

```
s.allAIFixes ? (gutter: gutter-lightbulb-sparkle-filled, inline: sparkle-filled)
: s.hasAutoFix ? (s.hasAIFix ? gutter-lightbulb-aifix-auto-fix / lightbulb-sparkle-autofix : gutter-lightbulb-auto-fix / lightbulb-autofix)
: s.hasAIFix ? gutter-lightbulb-sparkle / lightbulb-sparkle
: gutter-lightbulb / light-bulb
```

With chat on, an AI fix ("Fix with Copilot") is offered for every diagnostic, so `hasAIFix` is true almost everywhere, even in the signed-out review profile. The widget draws inline whenever the line is indented or a neighbouring line is blank or indented (`update()` in the widget), which is most lines of real code. In the gate-1 fixture the quick fix on `spells.ts` line 11 is drawn inline on line 10, so what gate 1 saw (`evidence-lightbulb.png`) was the inline codicon `lightbulb-sparkle`, not a gutter ID. This was confirmed while writing this plan: a run of the gate-2 workbench scene with only the gutter IDs claimed still showed the stock sparkle bulb at line 10; with the inline codicons claimed it showed the candle, and a fixture line drawn in the gutter (line 16, Task 11) showed the candle in the gutter. So G5 ("the candle wherever the quick-fix bulb shows") needs six IDs, not two:

- gutter: `gutter-lightbulb-sparkle`, `gutter-lightbulb-auto-fix`, `gutter-lightbulb-aifix-auto-fix` (registered IDs; the third shows when a preferred quick fix and an AI fix coexist);
- inline: the codicons `lightbulb-sparkle`, `lightbulb-autofix`, `lightbulb-sparkle-autofix` (`lightbulb-sparkle-autofix` has the same character as `lightbulb-sparkle` but is its own key, so it needs its own entry).

All six go to batch `1` and the candle. This is four keys more than the 166 the brief fixes; the author decided it while this plan was written, and spec section 11.1 records it as an amendment under G5 (170 pinned keys). Mapping the two codicons also reaches two other uses in the 1.141 bundle: the "accept detected language" status entry (`$(lightbulb-autofix)`) and the short label of the inline-edit chat status (`$(lightbulb-sparkle)`). Both mean "a suggestion you can apply", so the candle fits; the README lists them.

The fifth state, every action on the line being an AI action, uses `gutter-lightbulb-sparkle-filled` (gutter) and the codicon `sparkle-filled` (inline). Its default is a filled star, not a bulb, and glossary section 7 gives AI actions the ✧ cluster, which is drawn with the `editor` batch (gate 4). Pinning it now would push a key into a later plan, so it stays unpinned and stock; the README asks the author whether the editor plan should pin it for ✧ or this batch for the candle. `sparkle-filled` itself is a general chat codicon and stays unpinned.

- [ ] **Step 1: Confirm each key in the 1.141 bundle and the built-in git extension**

```bash
B="/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js"
G="/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/extensions/git/dist/main.js"
grep -o 'ze("gutter-lightbulb[a-z-]*",[A-Za-z.]*' "$B"
grep -o 'ze("ports-forwarded-with-process-icon",[A-Za-z.]*' "$B"
grep -o 'fe("\(git-branch-[a-z-]*\|lightbulb-[a-z-]*\|sparkle-filled\|circle-filled\)",[0-9]*)' "$B"
grep -o 's.allAIFixes?(n=i?.\{0,200\}' "$B"
grep -o '"\$(lightbulb-autofix)"\|"\$(lightbulb-sparkle)"' "$B" | sort | uniq -c
grep -o '\$(git-branch[a-z-]*)' "$G" | sort | uniq -c
grep -o 'case(this.repository.mergeInProgress.\{0,260\}' "$G"
```

Expected (`ze` is the minified `registerIcon`, `fe` the codicon table's `register`; `extractRegistrations` finds both by call shape, so the minified names do not matter to the scripts):

```
ze("gutter-lightbulb",A.lightBulb
ze("gutter-lightbulb-auto-fix",A.lightbulbAutofix
ze("gutter-lightbulb-sparkle",A.lightbulbSparkle
ze("gutter-lightbulb-aifix-auto-fix",A.lightbulbSparkleAutofix
ze("gutter-lightbulb-sparkle-filled",A.sparkleFilled
ze("ports-forwarded-with-process-icon",A.circleFilled
fe("circle-filled",60017)
fe("lightbulb-autofix",60179)
fe("lightbulb-sparkle",60447)
fe("sparkle-filled",60449)
fe("lightbulb-empty",60480)
fe("git-branch-changes",60524)
fe("git-branch-staged-changes",60525)
fe("git-branch-conflicts",60526)
fe("git-branch-create",60527)
fe("git-branch-delete",60527)
fe("git-branch-compact",60558)
fe("lightbulb-compact",60595)
fe("lightbulb-sparkle-autofix",60447)
s.allAIFixes?(n=i?i$o:A.sparkleFilled,s.validActions.length===1&&(r=!0)):s.hasAutoFix?s.hasAIFix?n=i?t$o:A.lightbulbSparkleAutofix:n=i?Z2o:A.lightbulbAutofix:s.hasAIFix?n=i?e$o:A.lightbulbSparkle:n=i?J2o:A.lightBulb;le
      2 "$(lightbulb-autofix)"
      1 "$(lightbulb-sparkle)"
      4 $(git-branch)
      1 $(git-branch-changes)
      1 $(git-branch-conflicts)
      1 $(git-branch-staged-changes)
case(this.repository.mergeInProgress||!!this.repository.rebaseCommit):return"$(git-branch-conflicts)";case this.repository.indexGroup.resourceStates.length>0:return"$(git-branch-staged-changes)";case this.repository.workingTreeGroup.resourceStates.length+this.repository.untrackedGroup.resourceSt
```

What this shows: the five `gutter-lightbulb*` IDs are registered icons whose defaults are codicon references (`J2o`, `Z2o`, `e$o`, `t$o`, `i$o` are their variables, used when `i` is true, the gutter); the inline branch uses the codicons `A.lightBulb`, `A.lightbulbAutofix`, `A.lightbulbSparkle`, `A.lightbulbSparkleAutofix` and `A.sparkleFilled` directly. `ports-forwarded-with-process-icon` is a registered icon defaulting to `circle-filled`, so it inherits the ✦ today. The three `git-branch-*` IDs are plain codicons with their own characters (60524-60526); the git extension's status bar item writes them as `$(…)` text: conflicts while a merge or rebase is in progress, else staged when the index is not empty, else changes when the working tree or the untracked group is not empty, else `git-branch`. The two `$(lightbulb-autofix)` strings are the "accept detected language" status entries and `$(lightbulb-sparkle)` is the inline-edit chat status label.

Then read the kinds and defaults exactly as the pin will record them:

```bash
node --input-type=module <<'JS'
import fs from 'node:fs';
import { extractRegistrations } from './scripts/extract-icon-ids.mjs';
const B = '/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js';
const r = extractRegistrations(fs.readFileSync(B, 'utf8'));
for (const id of ['gutter-lightbulb-sparkle', 'gutter-lightbulb-auto-fix', 'gutter-lightbulb-aifix-auto-fix', 'gutter-lightbulb-sparkle-filled',
  'lightbulb-sparkle', 'lightbulb-autofix', 'lightbulb-sparkle-autofix', 'git-branch-changes', 'git-branch-staged-changes',
  'git-branch-conflicts', 'ports-forwarded-with-process-icon']) console.log(id, JSON.stringify(r.get(id)));
console.log('gutter-lightbulb*:', [...r.keys()].filter((id) => id.startsWith('gutter-lightbulb')).join(' '));
JS
```

Expected:

```
gutter-lightbulb-sparkle {"kind":"registered","default":"lightbulb-sparkle"}
gutter-lightbulb-auto-fix {"kind":"registered","default":"lightbulb-autofix"}
gutter-lightbulb-aifix-auto-fix {"kind":"registered","default":"lightbulb-sparkle-autofix"}
gutter-lightbulb-sparkle-filled {"kind":"registered","default":"sparkle-filled"}
lightbulb-sparkle {"kind":"codicon","default":null}
lightbulb-autofix {"kind":"codicon","default":null}
lightbulb-sparkle-autofix {"kind":"codicon","default":null}
git-branch-changes {"kind":"codicon","default":null}
git-branch-staged-changes {"kind":"codicon","default":null}
git-branch-conflicts {"kind":"codicon","default":null}
ports-forwarded-with-process-icon {"kind":"registered","default":"circle-filled"}
gutter-lightbulb*: gutter-lightbulb gutter-lightbulb-auto-fix gutter-lightbulb-sparkle gutter-lightbulb-aifix-auto-fix gutter-lightbulb-sparkle-filled
```

The last line is the complete list of `gutter-lightbulb*` IDs in 1.141. If any line differs, stop: the bundle is not the 1.141.0 build the pin names.

- [ ] **Step 2: Write the failing tests**

In `test/product-icon-ids.test.mjs`, replace

```js
test('132 core IDs plus 28 named extras', () => {
  assert.equal(entries.filter(([, e]) => e.tier === 'core').length, 132);
  assert.equal(entries.filter(([, e]) => e.tier === 'extra').length, 28);
});
```

with

```js
test('132 core IDs plus 38 named extras', () => {
  assert.equal(entries.filter(([, e]) => e.tier === 'core').length, 132);
  assert.equal(entries.filter(([, e]) => e.tier === 'extra').length, 38);
  assert.equal(entries.length, 170);
});
```

Insert directly above `test('every key has a known batch and kind', () => {`:

```js
test('the keys added at gate 1 (G4-G6) sit in their batches with the kind and default the 1.141 bundle registers', () => {
  const expected = {
    'gutter-lightbulb-sparkle': { kind: 'registered', default: 'lightbulb-sparkle', batch: '1' },
    'gutter-lightbulb-auto-fix': { kind: 'registered', default: 'lightbulb-autofix', batch: '1' },
    'gutter-lightbulb-aifix-auto-fix': { kind: 'registered', default: 'lightbulb-sparkle-autofix', batch: '1' },
    'lightbulb-sparkle': { kind: 'codicon', default: null, batch: '1' },
    'lightbulb-autofix': { kind: 'codicon', default: null, batch: '1' },
    'lightbulb-sparkle-autofix': { kind: 'codicon', default: null, batch: '1' },
    'git-branch-changes': { kind: 'codicon', default: null, batch: 'status' },
    'git-branch-staged-changes': { kind: 'codicon', default: null, batch: 'status' },
    'git-branch-conflicts': { kind: 'codicon', default: null, batch: 'status' },
    'ports-forwarded-with-process-icon': { kind: 'registered', default: 'circle-filled', batch: 'status' },
  };
  for (const [id, entry] of Object.entries(expected)) assert.deepEqual(pinned.ids[id], { tier: 'extra', ...entry }, id);
  assert.equal('gutter-lightbulb-sparkle-filled' in pinned.ids, false, 'the all-AI gutter mark stays unpinned (gate 2 question)');
});

```

Replace

```js
test('batch 1 is exactly the 48 IDs behind the 23 first-batch drawings', () => {
  assert.equal(entries.filter(([, e]) => e.batch === '1').length, 48);
});
```

with

```js
test('batch 1 is exactly the 54 IDs behind the 23 first-batch drawings', () => {
  // 48 at gate 1, plus the six light-bulb IDs the candle claims (G5): three gutter IDs and the three inline codicons.
  assert.equal(entries.filter(([, e]) => e.batch === '1').length, 54);
});
```

Append to `test/product-icon-theme.test.mjs`:

```js

test('the candle carries every code-action light bulb, in the gutter and inline (G5)', () => {
  assert.deepEqual(map.drawings.candle.ids, ['light-bulb', 'gutter-lightbulb', 'gutter-lightbulb-sparkle', 'gutter-lightbulb-auto-fix',
    'gutter-lightbulb-aifix-auto-fix', 'lightbulb-sparkle', 'lightbulb-autofix', 'lightbulb-sparkle-autofix']);
  assert.equal(map.drawings.candle.codepoint, 'E112');
});
```

These are the only test literals that count pinned keys: `grep -rn '\b160\b\|\b48\b\|\b28\b' test/` finds lines 8, 10, 26 and 27 of `test/product-icon-ids.test.mjs` (the two tests replaced above) and `'5.48'` in `test/color.test.mjs` (a contrast ratio). The `23 drawings` test in `test/product-icon-theme.test.mjs` counts drawings, which this task does not change; Task 5 replaces it.

Run: `node --test --test-reporter=tap test/product-icon-ids.test.mjs test/product-icon-theme.test.mjs | grep -E '^not ok|^# (pass|fail)'`
Expected:

```
not ok 1 - 132 core IDs plus 38 named extras
not ok 3 - the keys added at gate 1 (G4-G6) sit in their batches with the kind and default the 1.141 bundle registers
not ok 5 - batch 1 is exactly the 54 IDs behind the 23 first-batch drawings
not ok 11 - the candle carries every code-action light bulb, in the gutter and inline (G5)
# pass 7
# fail 4
```

- [ ] **Step 3: Pin the ten keys**

```bash
node --input-type=module <<'JS'
import fs from 'node:fs';
const file = 'icons/product-icon-ids.json';
const pinned = JSON.parse(fs.readFileSync(file, 'utf8'));
const added = {
  'gutter-lightbulb-sparkle': { kind: 'registered', default: 'lightbulb-sparkle', batch: '1' },
  'gutter-lightbulb-auto-fix': { kind: 'registered', default: 'lightbulb-autofix', batch: '1' },
  'gutter-lightbulb-aifix-auto-fix': { kind: 'registered', default: 'lightbulb-sparkle-autofix', batch: '1' },
  'lightbulb-sparkle': { kind: 'codicon', default: null, batch: '1' },
  'lightbulb-autofix': { kind: 'codicon', default: null, batch: '1' },
  'lightbulb-sparkle-autofix': { kind: 'codicon', default: null, batch: '1' },
  'git-branch-changes': { kind: 'codicon', default: null, batch: 'status' },
  'git-branch-staged-changes': { kind: 'codicon', default: null, batch: 'status' },
  'git-branch-conflicts': { kind: 'codicon', default: null, batch: 'status' },
  'ports-forwarded-with-process-icon': { kind: 'registered', default: 'circle-filled', batch: 'status' },
};
for (const [id, entry] of Object.entries(added)) {
  if (id in pinned.ids) throw new Error(`${id} is already pinned`);
  pinned.ids[id] = { tier: 'extra', ...entry };
}
pinned.ids = Object.fromEntries(Object.entries(pinned.ids).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(file, `${JSON.stringify(pinned, null, 2)}\n`);
console.log(`${Object.keys(pinned.ids).length} pinned keys`);
JS
node scripts/extract-icon-ids.mjs
```

Expected:

```
170 pinned keys
Pinned list: VS Code 1.141.0 (170 keys). Bundle: /mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js
967 registered IDs are not pinned (extended tier and beyond).
✓ the pinned list matches the bundle
```

The keys were already sorted in the file, so the diff is ten inserted blocks.

Run: `node scripts/validate.mjs 2>&1 | grep -v '^⚠'`
Expected: the output is exactly

```
✗ [product-batch:1] product icon theme does not map gutter-lightbulb-aifix-auto-fix (batch 1)
✗ [product-batch:1] product icon theme does not map gutter-lightbulb-auto-fix (batch 1)
✗ [product-batch:1] product icon theme does not map gutter-lightbulb-sparkle (batch 1)
✗ [product-batch:1] product icon theme does not map lightbulb-autofix (batch 1)
✗ [product-batch:1] product icon theme does not map lightbulb-sparkle (batch 1)
✗ [product-batch:1] product icon theme does not map lightbulb-sparkle-autofix (batch 1)
… 137 pending problems in stages not yet enforced: product-batch:chrome (17), product-batch:editor (33), product-batch:status (19), product-batch:panel (9), product-batch:debug (23), product-batch:symbols (15), release (2), file-icons (19) (use --verbose to list)
```

with no `✓` line (`node scripts/validate.mjs` on its own exits 1).

- [ ] **Step 4: Claim the light bulbs for the candle, keeping the IDs it already has**

`claimDrawing` (`scripts/lib/product-icon-map.mjs`) sets the drawing's list to exactly the IDs given (`drawings[name] = { codepoint, ids: [...ids] }`). An ID left off the command is unmapped, not kept, and a different codepoint retires the old one. So the command repeats the candle's two existing IDs and its codepoint, then adds the six:

```bash
node scripts/claim-drawing.mjs candle E112 light-bulb gutter-lightbulb gutter-lightbulb-sparkle gutter-lightbulb-auto-fix gutter-lightbulb-aifix-auto-fix lightbulb-sparkle lightbulb-autofix lightbulb-sparkle-autofix
npm run build:product-icons
```

Expected:

```
candle (E112) <- light-bulb, gutter-lightbulb, gutter-lightbulb-sparkle, gutter-lightbulb-auto-fix, gutter-lightbulb-aifix-auto-fix, lightbulb-sparkle, lightbulb-autofix, lightbulb-sparkle-autofix
Built 23 product icon drawings for 54 icon IDs in icons/witchynibbles-product-icons.woff
```

`claimDrawing` rebuilds the drawings object with the claimed drawing last, so `candle` moves to the end of `icons/product-icon-map.json`, and to the end of the batch-1 rows on the review icon sheet. `iconDefinitions` are sorted by ID, so the theme diff is the six new keys only, all `\\E112`.

- [ ] **Step 5: Update the spec and the inventory**

In `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`:

- Section 2, replace `All 132 core-tier IDs, plus the named extras in section 5.1, for 160 keys in total.` with `All 132 core-tier IDs, plus the named extras in section 5.1, for 170 keys in total.`
- Section 2, replace ``(`more`, `plus`, `dialog-*`, `copilot-warning`, `debug-breakpoint-unverified`)`` with ``(`more`, `plus`, `dialog-*`, `copilot-warning`, `debug-breakpoint-unverified`, `ports-forwarded-with-process-icon` and the `gutter-lightbulb-*` / `lightbulb-*` keys added at gate 1)``.
- Section 5.1, replace `Total: 160 keys (132 core + 28 extras).` with:

```markdown
Added at review gate 1 (section 11.1): `gutter-lightbulb-sparkle`, `gutter-lightbulb-auto-fix`, `gutter-lightbulb-aifix-auto-fix` and the inline light-bulb codicons `lightbulb-sparkle`, `lightbulb-autofix`, `lightbulb-sparkle-autofix` (batch 1, claimed by the candle; G5 as amended in section 11.1: with chat on, every quick-fix bulb is one of these, in the gutter or inline); `git-branch-changes`, `git-branch-staged-changes`, `git-branch-conflicts` (status batch, sprig variants; G6) and `ports-forwarded-with-process-icon` (status batch, the `terminal-decoration-success` dot; G4). `gutter-lightbulb-sparkle-filled` (the gutter mark when every action on the line is an AI action) is not pinned; the author decides at gate 2. Total: 170 keys (132 core + 38 extras).
```

- Section 5.2, in the "Editor, find, layout, SCM" table, replace the row ``| `light-bulb`, `gutter-lightbulb` | candle | flame |`` with ``| `light-bulb`, `gutter-lightbulb`, `gutter-lightbulb-sparkle`, `gutter-lightbulb-auto-fix`, `gutter-lightbulb-aifix-auto-fix`, `lightbulb-sparkle`, `lightbulb-autofix`, `lightbulb-sparkle-autofix` | candle | flame |``.
- Section 11.1: no edit. The amendment under G5 (committed with this plan, see Before Task 1) already records the six candle IDs and the 170 keys; appending to the G5 bullet would repeat it.

In `docs/research/vscode-1.141-icon-inventory.md`, after the paragraph that starts `Decisions 4 and 5 also pin five codicons that no table above lists`, insert:

```markdown
Review gate 1 (spec section 11.1) pins ten more keys, found in the gate captures and in the code-action and git sources:

| ID (iconDefinitions key) | Kind / default | Where it appears |
|---|---|---|
| `gutter-lightbulb-sparkle` | registered, default `lightbulb-sparkle` | Gutter light bulb when an AI fix is offered and no preferred fix (with chat on, the usual quick-fix case) |
| `gutter-lightbulb-auto-fix` | registered, default `lightbulb-autofix` | Gutter light bulb with a preferred quick fix and no AI fix |
| `gutter-lightbulb-aifix-auto-fix` | registered, default `lightbulb-sparkle-autofix` | Gutter light bulb with both a preferred quick fix and an AI fix |
| `lightbulb-sparkle` | codicon | Inline light bulb, AI fix offered; also the inline-edit chat status label |
| `lightbulb-autofix` | codicon | Inline light bulb, preferred quick fix; also the "accept detected language" status entry |
| `lightbulb-sparkle-autofix` | codicon (same character as `lightbulb-sparkle`) | Inline light bulb, preferred quick fix and AI fix |
| `git-branch-changes` | codicon | Status bar branch (git extension) with working-tree or untracked changes |
| `git-branch-staged-changes` | codicon | Status bar branch with staged changes |
| `git-branch-conflicts` | codicon | Status bar branch while a merge or rebase is in progress |
| `ports-forwarded-with-process-icon` | registered, default `circle-filled` | Ports view: a forwarded port with a running process |

The light-bulb widget draws in the gutter only when the line is not indented, the lines above and below are neither blank nor indented, and no other glyph-margin decoration sits on the line; otherwise it draws inline in the text and uses the plain codicons. `light-bulb` and `gutter-lightbulb` were pinned in phase 1. `gutter-lightbulb-sparkle-filled` (registered, default `sparkle-filled`: every action on the line is an AI action) and the codicon `sparkle-filled` stay unpinned for now.
```

In the same file, replace `(160 keys with kind, default and batch)` with `(170 keys with kind, default and batch)`. In the `circle-filled` audit, replace ``only `ports-forwarded-with-process-icon` (Ports view, extended tier, stays on the inherited ✦ unless mapped).`` with ``only `ports-forwarded-with-process-icon` (Ports view, extended tier). Since gate 1 (G4) it is pinned in the `status` batch and shares the small-dot drawing of `terminal-decoration-success`.``

- [ ] **Step 6: Verify**

Run: `npm test 2>&1 | grep -E '^ℹ (tests|fail)' && npm run validate 2>&1 | grep -v '^⚠' | grep -v '^>' | grep . && git status --short`
Expected:

```
ℹ tests 127
ℹ fail 0
… 137 pending problems in stages not yet enforced: product-batch:chrome (17), product-batch:editor (33), product-batch:status (19), product-batch:panel (9), product-batch:debug (23), product-batch:symbols (15), release (2), file-icons (19) (use --verbose to list)
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1)
 M docs/research/vscode-1.141-icon-inventory.md
 M docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md
 M icons/product-icon-ids.json
 M icons/product-icon-map.json
 M icons/product-icon-theme.json
 M icons/witchynibbles-product-icons.woff
 M test/product-icon-ids.test.mjs
 M test/product-icon-theme.test.mjs
```

(125 tests before this task; the two new ones pass.)

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_1`
Expected: one 40-character tree id, also saved in `review-out/TREE_1`. Task 2's changes are then `git add -A && git diff --cached $(cat review-out/TREE_1)`.

---
## Part B: batch-1 redraws and grid snaps (G7, G3)

Part B gives the later parts their shared geometry: `parts` in `scripts/glyphs/batch-1.mjs` (the snapped bell, cat head, cat eyes, small sprig and ✦) and `filledAt` in `scripts/lib/svg-geometry.mjs`. No codepoint, drawing name or ID mapping changes in this part, so `icons/product-icon-map.json` and `icons/product-icon-theme.json` stay byte-identical; only SVG sources and the WOFF change.

Order: Task 2 introduces `parts` with byte-identical output. Task 3 redraws the five G7 glyphs. Task 4 does the G3 grid snaps (including the bell change that frees bell-dot's corner) and fixes a validator false positive.

**Drawn and checked while writing this part.** Every coordinate below was run through `glyphRuleProblems` (0 errors; after Task 4 the only batch-1 warning is the gear's documented 45° teeth) and rendered at 12, 16 and 24 CSS px, at device scale 1 and 2, in `#A99AB9` on `#120C1F`, `#735F7D` on `#F5ECFA` and `#0D0916` on `#FFD477`, next to the stock Codicon from the 1.141 `codicon.ttf`, and inspected at 16px/100%. Findings that shaped the drawings: the stadium spider with a play mark reads as the `debug-alt` beetle and the round-head owl as a second cat (gate 1); an owl with a U-shaped body under the eyes reads as a grinning cat in goggles, so the owl is its face only; a hollow witch hat this narrow leaves sub-2-unit slivers, so the hat is a solid silhouette; an r3 crescent in the moon gate reads as a C or a dot at 12px, an r4 one as a crescent; a bell whose dome starts under a 4×2 crown reads as a stepped lamp, so the snapped bell keeps its dome and lengthens the handle.

---

### Task 2: Shared `parts` in batch 1 (byte-identical output)

**Files:**
- Create: `test/glyph-parts.test.mjs`
- Modify: `scripts/glyphs/batch-1.mjs`

**Interfaces:**
- Consumes: `polygon`, `rect`, `disc`, `leaf`, `svgDocument` (`scripts/glyphs/primitives.mjs`); the drift test (`test/glyph-drift.test.mjs`).
- Produces: `export const parts` in `scripts/glyphs/batch-1.mjs` with `parts.star(cx, cy, outer, inner)` (one path string, the ✦ polygon), `parts.bell()`, `parts.catHeadOutline()`, `parts.catEyes()` (`[left, right]`) and `parts.sprigSmall()` (arrays of path strings for `svgDocument`). Task 4 changes the bell and the cat-outline geometry; the signatures stay. `drawings['dirty-star']`, `bell`, `sprig-small` and `cat-head` are rewritten on top of these parts with byte-identical SVG output.

- [ ] **Step 1: Write the failing test**

`test/glyph-parts.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings, parts } from '../scripts/glyphs/batch-1.mjs';
import { svgDocument } from '../scripts/glyphs/primitives.mjs';

test('batch-1 exposes the shared parts that the status batch builds on', () => {
  for (const name of ['bell', 'catHeadOutline', 'catEyes', 'sprigSmall', 'star']) assert.equal(typeof parts[name], 'function', name);
  for (const name of ['bell', 'catHeadOutline', 'catEyes', 'sprigSmall']) {
    const paths = parts[name]();
    assert.ok(Array.isArray(paths) && paths.length > 0 && paths.every((d) => typeof d === 'string' && d.startsWith('M')), name);
  }
  assert.equal(parts.catEyes().length, 2, 'catEyes() is [left, right]');
});

test('each drawing that uses a part is exactly that part', () => {
  assert.equal(drawings['dirty-star'](), svgDocument(parts.star(8, 8, 5, 1.5)));
  assert.equal(drawings.bell(), svgDocument(parts.bell()));
  assert.equal(drawings['sprig-small'](), svgDocument(parts.sprigSmall()));
  assert.equal(drawings['cat-head'](), svgDocument(parts.catHeadOutline(), parts.catEyes()));
});

test('parts.star is the four-point ✦: tips at outer, waist at inner, centred on (cx, cy)', () => {
  assert.equal(parts.star(8, 8, 5, 1.5), 'M8 3L9.5 6.5L13 8L9.5 9.5L8 13L6.5 9.5L3 8L6.5 6.5Z');
  assert.equal(parts.star(12, 4, 3, 1), 'M12 1L13 3L15 4L13 5L12 7L11 5L9 4L11 3Z');
});
```

Run: `node --test test/glyph-parts.test.mjs`
Expected: FAIL with `SyntaxError: The requested module '../scripts/glyphs/batch-1.mjs' does not provide an export named 'parts'`.

- [ ] **Step 2: Add `parts` after `export const variants = {};`**

In `scripts/glyphs/batch-1.mjs`, insert directly below the line `export const variants = {};`:

```js

// Shared parts (phase 2): the status batch builds bell-dot, the copilot cat variants and the dirty-branch sprigs from
// these, so a variant never drifts from its base drawing. Each returns path strings for svgDocument.
export const parts = {
  // ✦: four tips at `outer` from (cx, cy) on the axes, waist vertices at `inner` on the diagonals (a solid core).
  star: (cx, cy, outer, inner) => polygon([[cx, cy - outer], [cx + inner, cy - inner], [cx + outer, cy], [cx + inner, cy + inner],
    [cx, cy + outer], [cx - inner, cy + inner], [cx - outer, cy], [cx - inner, cy - inner]]),
  // Hand bell. Task 4 frees the top-right corner (x10-15, y1-6) for bell-dot's ✦.
  bell: () => [
    rect(7, 1, 2, 3), // handle x7-9, y1-4
    'M6 4H10C11.1 4 12 4.9 12 6V11L14 13H2L4 11V6C4 4.9 4.9 4 6 4Z', // flared bell, clockwise
    'M6 5C5.4 5 5 5.4 5 6V11.4L4.4 12H11.6L11 11.4V6C11 5.4 10.6 5 10 5Z', // inside, counter-clockwise
    disc(8, 14, 1), // clapper x7-9, y13-15
  ],
  catHeadOutline: () => [
    polygon([[2, 2], [6, 5], [10, 5], [14, 2], [14, 12], [11, 15], [5, 15], [2, 12]]), // head with pointed ears
    polygon([[3, 4], [5.7, 6], [10.3, 6], [13, 4], [13, 11.6], [10.6, 14], [5.4, 14], [3, 11.6]], 'ccw'), // 1-unit wall
  ],
  catEyes: () => [leaf([4, 10], [7.5, 10], 3), leaf([8.5, 10], [12, 10], 3)], // [left, right]: almond eyes 3.5x3, symmetric about x = 8
  // Small git-branch sprig (a different drawing from the activity-bar herb sprig).
  sprigSmall: () => [
    rect(4, 6, 1, 9), // stem x4-5, y6-15
    leaf([4.5, 1], [4.5, 6], 4), // leaf on the stem (commit node), x2.5-6.5, y1-6
    polygon([[5, 12], [10, 7], [11, 8], [5, 14]]), // branch, ~1.4-unit 45-degree band
    leaf([10.5, 7.5], [13.5, 4.5], 4), // leaf at the branch tip (commit node)
  ],
};
```

- [ ] **Step 3: Rewrite the four drawings on top of the parts**

Replace

```js
drawings['dirty-star'] = () => svgDocument(polygon([[8, 3], [9.5, 6.5], [13, 8], [9.5, 9.5], [8, 13], [6.5, 9.5], [3, 8], [6.5, 6.5]]));
```

with

```js
drawings['dirty-star'] = () => svgDocument(parts.star(8, 8, 5, 1.5));
```

Replace the whole block from `// Hand bell. Keep the top-right corner (x10-15, y1-6) free so bell-dot can add its ✦ there in phase 2.` through the closing `);` of `drawings['sprig-small']` (the block just above `// Gate 1 (decision 4 iv)`) with

```js
drawings.bell = () => svgDocument(parts.bell());
drawings['sprig-small'] = () => svgDocument(parts.sprigSmall());

```

Replace

```js
drawings['cat-head'] = () => svgDocument(
  polygon([[2, 2], [6, 5], [10, 5], [14, 2], [14, 12], [11, 15], [5, 15], [2, 12]]), // head with pointed ears
  polygon([[3, 4], [5.7, 6], [10.3, 6], [13, 4], [13, 11.6], [10.6, 14], [5.4, 14], [3, 11.6]], 'ccw'), // 1-unit wall
  leaf([4, 10], [7.5, 10], 3), leaf([8.5, 10], [12, 10], 3), // accent: almond eyes 3.5x3, symmetric about x = 8
);
```

with

```js
drawings['cat-head'] = () => svgDocument(parts.catHeadOutline(), parts.catEyes()); // accent: the eyes
```

- [ ] **Step 4: Prove the output is byte-identical**

Run: `npm run draw:glyphs && git status --short icons`
Expected: `Wrote 23 glyph SVGs`, and `git status` lists only the four files Task 1 changed (`icons/product-icon-ids.json`, `icons/product-icon-map.json`, `icons/product-icon-theme.json`, `icons/witchynibbles-product-icons.woff`): no SVG changed.

Run: `npm test 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 130`, `ℹ fail 0` (the 3 new tests pass, and the drift cases still match the committed SVGs).

- [ ] **Step 5: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_2`
Expected: one 40-character tree id, also saved in `review-out/TREE_2`.

---

### Task 3: Redraw spider, owl, witch hat, moon gate and grimoire (G7)

**Files:**
- Create: `test/glyph-redraws.test.mjs`
- Modify: `scripts/glyphs/batch-1.mjs`, `scripts/lib/svg-geometry.mjs`, `test/svg-geometry.test.mjs`, `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (section 5.2 rows)
- Regenerated: `icons/product-src/{spider,owl,witch-hat,moon-gate,explorer-grimoire}.svg`, `icons/witchynibbles-product-icons.woff`
- Create (git-ignored, not in the snapshot): `review-out/compare/compare.mjs`

**Interfaces:**
- Consumes: `parts` (Task 2), `parseGlyphSvg`, `subpaths`, `pointInPolygon`, `signedArea`, `glyphModules`.
- Produces: `filledAt(ds, [x, y])` in `scripts/lib/svg-geometry.mjs`: true when the point is filled under the nonzero rule the font pipeline uses (Task 4 uses it to pin bell-dot's free corner). New geometry for `spider` (E103), `owl` (E10A), `witch-hat` (E107), `moon-gate` (E106) and `explorer-grimoire` (E100), with names and codepoints unchanged. `test/glyph-redraws.test.mjs`, whose negative-winding test covers every module in `glyphModules`, so Tasks 5-10 inherit it. `review-out/compare/compare.mjs` (before/after/Codicon page), reused by Task 4.

**Decision G7** overrides spec 5.2 for the spider: no play mark; the filled part is the round body. Every redraw stays inside the keyline the phase-1 drawing used (circle 14 for the spider; spider and owl bounds stay within the old x2-14 / y1-15 extents except the moon gate, which now fills the round keyline). Two choices made while drawing go to the gate-2 README (Task 12): the moon gate drops its feet so the arch fills the round keyline, and the witch hat becomes a solid silhouette.

- [ ] **Step 1: Write the failing `filledAt` test**

In `test/svg-geometry.test.mjs`, change the import line to

```js
import { filledAt, offGridPoints, parseGlyphSvg, pathBounds, signedArea, subpaths, windingProblems } from '../scripts/lib/svg-geometry.mjs';
```

and append

```js

test('filledAt applies the nonzero rule the font pipeline uses', () => {
  const frame = ['M2 2h12v12H2z', 'M4 4v8h8V4z']; // 12x12 square with a counter-wound 8x8 hole
  assert.equal(filledAt(frame, [3, 8]), true);
  assert.equal(filledAt(frame, [8, 8]), false);
  assert.equal(filledAt(frame, [15, 8]), false);
  assert.equal(filledAt(['M2 2h12v12H2z', 'M4 4h8v8H4z'], [8, 8]), true); // same-direction "hole" stays solid
});
```

Run: `node --test test/svg-geometry.test.mjs`
Expected: FAIL with `SyntaxError: The requested module '../scripts/lib/svg-geometry.mjs' does not provide an export named 'filledAt'`.

- [ ] **Step 2: Add `filledAt`**

In `scripts/lib/svg-geometry.mjs`, insert directly above `const containedIn =`:

```js
// Nonzero fill test at one point, the rule svgicons2svgfont and svg2ttf apply (curves flattened as in subpaths). Exact for
// simple (non-self-intersecting) subpaths, which is all the primitives produce.
export function filledAt(ds, point) {
  let winding = 0;
  for (const polygon of ds.flatMap((d) => subpaths(d))) if (pointInPolygon(point, polygon)) winding += Math.sign(signedArea(polygon));
  return winding !== 0;
}

```

Run: `node --test test/svg-geometry.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 8`, `ℹ fail 0`.

- [ ] **Step 3: Write the failing redraw tests**

`test/glyph-redraws.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings } from '../scripts/glyphs/batch-1.mjs';
import { glyphModules } from '../scripts/glyphs/index.mjs';
import { filledAt, parseGlyphSvg, pointInPolygon, signedArea, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Gate 1 decision G7: what each redraw must (and must not) contain, sampled with the font's nonzero fill rule.
const ds = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const fill = (name) => {
  const paths = ds(name);
  return (x, y) => filledAt(paths, [x, y]);
};

test('spider: solid round body without a play mark, thread on pixel column 7, eight separate feet', () => {
  const at = fill('spider');
  for (const [x, y] of [[6.5, 8], [8, 8], [9.5, 8], [8, 6], [8, 10]]) assert.ok(at(x, y), `body at ${x},${y}`);
  assert.ok(at(7.5, 2) && !at(8.5, 2) && !at(6.5, 2), 'thread x7-8');
  const feet = [[4.5, 2.5], [2.25, 5.5], [2.25, 10.5], [4.5, 13.5]];
  for (const [x, y] of [...feet, ...feet.map(([x, y]) => [16 - x, y])]) assert.ok(at(x, y), `foot at ${x},${y}`);
  for (const [x, y] of [[3, 4.5], [13, 4.5], [3, 11.5], [13, 11.5], [2.5, 8], [13.5, 8], [4, 8], [12, 8]]) assert.ok(!at(x, y), `gap between legs at ${x},${y}`);
});

test('spider: every foot ends on the circle-14 keyline (within 7.25 of (8,8)), as in phase 1', () => {
  const points = ds('spider').flatMap((d) => subpaths(d)).flat();
  assert.deepEqual(points.filter(([x, y]) => Math.hypot(x - 8, y - 8) > 7.25), []);
});

test('owl: large eye discs in eye rings, tufts and a beak, an open brow and no mouth, so it cannot be the cat', () => {
  const owl = fill('owl');
  for (const x of [4.5, 11.5]) {
    assert.ok(owl(x, 8.5), `pupil at ${x}`);
    assert.ok(!owl(x, 6.5), `eye hole around the pupil at ${x}`);
    assert.ok(owl(x, 5.5), `eye ring at ${x}`);
  }
  assert.ok(owl(8, 10), 'beak');
  assert.ok(owl(8, 8.75), 'the beak closes the junction where the rings touch');
  assert.ok(!owl(8, 5.5), 'open brow between the eyes');
  assert.ok(!owl(8, 14) && !owl(4, 13.5), 'no U under the eyes (it read as a grin)');
  assert.ok(fill('cat-head')(8, 5.5), 'the cat has its head wall where the owl has the open brow');
});

test('witch hat: bent tip, a slot that sets the band off, a pointed brim', () => {
  const at = fill('witch-hat');
  assert.ok(at(8, 7) && at(8, 10.5) && at(8, 13), 'cone, band and brim');
  assert.ok(!at(8, 8.5) && !at(9.5, 8.5), 'band notch: a 1-unit slot at y8-9');
  assert.ok(at(13.25, 2.5) && !at(12.5, 4.5), 'tip bent over to the right');
  assert.ok(!at(1.5, 12.25) && at(1.5, 13), 'brim tapers to a point (not a bar)');
});

test('moon gate: 2-unit arch and an r4 crescent with a deep bite', () => {
  const at = fill('moon-gate');
  assert.ok(at(8, 1.5) && at(8, 2.5) && !at(8, 3.5), 'arch top y1-3');
  assert.ok(at(1.5, 10) && at(2.5, 10) && !at(3.5, 10), 'arch legs x1-3');
  assert.ok(at(4.5, 9) && at(5.5, 9) && !at(7, 9), 'crescent back x4-6 filled, bite open');
});

test('grimoire: crescent clasp upper left, lower right clear for the Explorer badge', () => {
  const at = fill('explorer-grimoire');
  assert.ok(at(5.5, 6) && !at(8.5, 6), 'crescent at x5-9, y3-9');
  for (let x = 9.5; x <= 12.5; x += 0.5) for (let y = 9.5; y <= 11.5; y += 0.5) assert.ok(!at(x, y), `badge zone ${x},${y}`);
});

test('grimoire: the crescent clasp clears the Explorer badge measured in the gate-1 24px captures', () => {
  // Badge circle in glyph units, measured on docs/qa/2.0-gate-1/main-workbench-activitybar.png (24px bar): centre
  // (12.5, 13.17), r 5.33. The crescent is the last subpath of the drawing.
  const clasp = subpaths(ds('explorer-grimoire')[0]).at(-1);
  for (const [x, y] of clasp) assert.ok(Math.hypot(x - 12.5, y - 13.17) > 5.33, `${x},${y}`);
});

test('no drawing or variant has a negative winding anywhere (a solid drawn as a hole)', () => {
  // windingProblems only checks subpaths nested inside one another; a solid that overlaps another solid with the
  // opposite winding (a first owl redraw had one) cancels to a hole the validator does not see. Covers every module.
  for (const { drawings: all, variants } of glyphModules) {
    for (const [name, draw] of [...Object.entries(all), ...Object.entries(variants)]) {
      const polygons = parseGlyphSvg(draw()).paths.flatMap((path) => subpaths(path.d));
      for (let x = 0.125; x < 16; x += 0.25) for (let y = 0.125; y < 16; y += 0.25) {
        const winding = polygons.reduce((sum, polygon) => sum + (pointInPolygon([x, y], polygon) ? Math.sign(signedArea(polygon)) : 0), 0);
        assert.ok(winding >= 0, `${name} at ${x},${y}`);
      }
    }
  }
});
```

Run: `node --test --test-reporter=tap test/glyph-redraws.test.mjs | grep -E '^not ok|  error:|^# (pass|fail)'`
Expected: 6 failures, one or two per redraw. The keyline and winding tests pass already: they guard the redraws against regressions.

```
not ok 1 - spider: solid round body without a play mark, thread on pixel column 7, eight separate feet
  error: 'body at 8,8'
not ok 3 - owl: large eye discs in eye rings, tufts and a beak, an open brow and no mouth, so it cannot be the cat
  error: 'eye ring at 4.5'
not ok 4 - witch hat: bent tip, a slot that sets the band off, a pointed brim
  error: 'cone, band and brim'
not ok 5 - moon gate: 2-unit arch and an r4 crescent with a deep bite
  error: 'arch top y1-3'
not ok 6 - grimoire: crescent clasp upper left, lower right clear for the Explorer badge
  error: 'crescent at x5-9, y3-9'
not ok 7 - grimoire: the crescent clasp clears the Explorer badge measured in the gate-1 24px captures
  error: '11,9.828'
# pass 2
# fail 6
```

- [ ] **Step 4: Redraw the five glyphs**

In `scripts/glyphs/batch-1.mjs`:

(a) Grimoire. Replace

```js
  crescent({ cx: 10, cy: 7, r: 3, facing: 'right' }), // accent: crescent clasp x7-11, y4-10, 2 units clear of the walls
```

with

```js
  // accent: crescent clasp x5-9, y3-9, one unit clear of the spine and the top wall. Gate 1 (G7): moved from x7-11,
  // y4-10 to the upper left, because VS Code draws the Explorer badge over the lower right of the activity-bar icon.
  crescent({ cx: 8, cy: 6, r: 3, facing: 'right' }),
```

(b) Spider. Replace the whole block from `// Spider on a thread; the play triangle is the accent on its body.` through the closing `);` of `drawings.spider` (the block just above `drawings.flask`) with the code below. `mirror` stays defined here, because the owl uses it.

```js
// Spider on a thread. Gate 1 (G7): the stadium body with a play mark read as the stock debug-alt beetle, so the body
// is now a solid round disc centred on (8,8) (the filled part) with eight splayed legs, four per side, mirrored about
// x = 8 and about y = 8. Each leg is two straight bands that meet at a knee: the front legs' 45-degree bands are 1.41
// across, the second legs' 1.06; feet and arms are 1-unit straight bands on whole numbers. Every foot stays on the
// circle-14 keyline of phase 1 (farthest point 7.21 from (8,8)). Leg ends run into the body.
const mirror = (points) => points.map(([x, y]) => [16 - x, y]);
const flipY = (points) => points.map(([x, y]) => [x, 16 - y]);
const upperLegs = [
  [[4, 2], [5, 2], [5, 4], [7, 6], [6, 7], [4, 5]], // front leg: foot x4-5, y2-5, then 45 degrees in to the body
  [[2, 4.5], [3.5, 6], [6, 6], [6, 7], [3, 7], [2, 6]], // second leg: arm y6-7 out to x3, then 45 degrees up, cut at x2
];
const spiderLegs = [...upperLegs, ...upperLegs.map(flipY)];
drawings.spider = () => svgDocument(
  rect(7, 1, 1, 5), // thread on pixel column 7, y1-6 (runs into the body)
  disc(8, 8, 3), // accent: round body x5-11, y5-11, solid
  spiderLegs.map((leg) => polygon(leg)),
  spiderLegs.map((leg) => polygon(mirror(leg))),
);

```

(c) Moon gate. Replace

```js
drawings['moon-gate'] = () => svgDocument(
  'M2 15V8A6 6 0 0 1 14 8V15H13V8A5 5 0 0 0 3 8V15Z', // arch with a 1-unit wall, open at the ground
  rect(1, 14, 3, 1), rect(12, 14, 3, 1), // feet
  crescent({ cx: 8, cy: 8, r: 3, facing: 'right' }), // accent x5-9, y5-11, two units inside the arch
);
```

with

```js
// Gate 1 (G7): thicker arch, stronger crescent cut. The arch now fills the round keyline (outer r7) with a 2-unit
// wall, and the crescent grows from r3 to r4 at the same 2-unit thickness, so the bite is a larger share of the moon.
// The feet are dropped: the legs already stand on the keyline edge (x1-3, x13-15), so feet would leave the grid.
drawings['moon-gate'] = () => svgDocument(
  'M1 15V8A7 7 0 0 1 15 8V15H13V8A5 5 0 0 0 3 8V15Z', // arch x1-15, y1-15, 2-unit wall (outer r7, inner r5), open at the ground
  crescent({ cx: 8, cy: 9, r: 4, facing: 'right' }), // accent x4-9, y5-13: one unit inside the left leg, two below the arch top
);
```

(d) Witch hat. Replace the whole block from `// Adjusted after the 16px sheet: the first-pass slot (x5.5-10.5)` through the closing `);` of `drawings['witch-hat']` (the block just above `// Spin-safe (section 4)`) with

```js
// Gate 1 (G7): the outline cone on a flat bar read as a triangle on a bar. The hat is now a solid silhouette (a hollow
// cone this narrow leaves sub-2-unit slivers): a pointed, curved brim, a band, and a cone whose tip bends over to the
// right. A 1-unit slot at y8-9 is the band notch that sets the band off. Cone and band share the same 2:1 sides
// (x = 6.5 - (y - 8) / 2 on the left, x = 10 + (y - 8) / 2 on the right), so the slot reads as one cut through one cone.
drawings['witch-hat'] = () => svgDocument(
  'M1 13C4 11.5 12 11.5 15 13C12 14.5 4 14.5 1 13Z', // brim x1-15, ~y12.1-13.9, pointed at both ends
  polygon([[4, 13], [6, 9], [10.5, 9], [12.5, 13]]), // accent: band y9-13 (its lower unit runs into the brim)
  'M6.5 8L8.5 4C9.5 2 11 1 13 1.5L14 4L12 3C11 3.5 10.3 5 10 8Z', // cone y1-8, tip bent over to (14, 4)
);

```

(e) Owl. Replace the whole block from `// Owl: round head with tufts swept outward` through the closing `);` of `drawings.owl` (the block just above `drawings.terminal`) with

```js
// Owl. Gate 1 (G7): the round head with corner tufts read as a second cat at 16px, and a first redraw with a U-shaped
// body under the eyes read as a grinning cat in goggles. The owl is now its face: two eye rings that meet at x = 8 (odd
// 7-unit diameter, centres on .5), each holding a 3x3 eye disc with one unit of clearance, ear tufts on the rings and a
// beak whose top edge closes the junction where the rings touch. The brow between the eyes is open (the cat has its
// head wall there), and each 7-unit eye ring is twice the width of the cat's 3.5-unit almond eye. Bounds y3-13.
const owlTuft = [[2, 3], [4.5, 5.5], [2, 6.5]]; // tip on x2, like the cat's ear tips; base inside the eye ring wall
drawings.owl = () => svgDocument(
  ring(4.5, 8.5, 3.5), ring(11.5, 8.5, 3.5), // eye rings x1-8 and x8-15, y5-12, 1-unit wall
  disc(4.5, 8.5, 1.5), disc(11.5, 8.5, 1.5), // accent: eyes 3x3, one unit inside each ring
  polygon(owlTuft), polygon(mirror(owlTuft)), // ear tufts
  polygon([[7, 8.5], [9, 8.5], [8, 13]]), // beak x7-9, y8.5-13; its top edge lies inside the ring walls
);

```

Run: `node --test test/glyph-redraws.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 8`, `ℹ fail 0`.

- [ ] **Step 5: Show that the drift test catches the stale SVGs, then regenerate**

Run: `node --test --test-reporter=tap test/glyph-drift.test.mjs | grep '^not ok'`
Expected: exactly the five redrawn drawings:

```
not ok 12 - drawing explorer-grimoire: committed SVG matches the generator and passes the glyph rules
not ok 15 - drawing spider: committed SVG matches the generator and passes the glyph rules
not ok 18 - drawing moon-gate: committed SVG matches the generator and passes the glyph rules
not ok 19 - drawing witch-hat: committed SVG matches the generator and passes the glyph rules
not ok 22 - drawing owl: committed SVG matches the generator and passes the glyph rules
```

Run: `npm run draw:glyphs && npm run build:product-icons && git add -A && git diff --cached --stat $(cat review-out/TREE_2) -- icons`
Expected: `Wrote 23 glyph SVGs`, `Built 23 product icon drawings for 54 icon IDs in icons/witchynibbles-product-icons.woff`, and the diff names exactly `icons/product-src/explorer-grimoire.svg`, `icons/product-src/moon-gate.svg`, `icons/product-src/owl.svg`, `icons/product-src/spider.svg`, `icons/product-src/witch-hat.svg` and `icons/witchynibbles-product-icons.woff` (the map and the theme are unchanged).

- [ ] **Step 6: Update spec section 5.2 (G7 overrides the spider row)**

In `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`, in the "Activity bar and identity" table, replace each of these rows in place (other rows sit between them):

```markdown
| `explorer-view-icon` | grimoire, no sticky notes | crescent clasp |
| `run-view-icon`, `debug-alt` | spider on a thread | play triangle on its body |
| `remote-explorer-view-icon` | moon-gate arch | crescent |
| `accounts-view-bar-icon`, `account` | witch hat, wide brim, bent tip | band |
| `timeline-view-icon` | owl face | eyes |
```

with, respectively,

```markdown
| `explorer-view-icon` | grimoire, no sticky notes | crescent clasp, upper left, clear of the Explorer badge (gate 1, G7) |
| `run-view-icon`, `debug-alt` | spider on a thread: round body, eight splayed legs, no play mark (gate 1, G7) | body |
| `remote-explorer-view-icon` | moon-gate arch with a 2-unit wall (gate 1, G7) | crescent |
| `accounts-view-bar-icon`, `account` | witch hat silhouette, pointed curved brim, bent tip (gate 1, G7) | band, set off by a 1-unit notch |
| `timeline-view-icon` | owl face: eye rings, ear tufts, beak (gate 1, G7) | eyes |
```

- [ ] **Step 7: Validate, test and inspect against the stock Codicons**

Run: `node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'`
Expected: exactly

```
⚠ icons/product-src/bell.svg straight-segment points off the whole/half grid: (5, 11.4) (4.4, 12) (11.6, 12) (11, 11.4)
⚠ icons/product-src/cat-head.svg straight-segment points off the whole/half grid: (3, 11.6) (5.4, 14) (10.6, 14) (13, 11.6) (10.3, 6) (5.7, 6)
⚠ icons/product-src/explorer-grimoire.svg straight-segment points off the whole/half grid: (9, 8.828)
⚠ icons/product-src/flask.svg straight-segment points off the whole/half grid: (7, 6.27) (3, 13.27) (13, 13.27) (9, 6.27) (11.7, 13) (4.3, 13)
⚠ icons/product-src/gear.svg straight-segment points off the whole/half grid: (7, 2.592) (9, 2.592) (11.117, 3.469) (12.243, 2.343) (13.657, 3.757) (12.531, 4.883) …
⚠ icons/product-src/moon-gate.svg straight-segment points off the whole/half grid: (9, 12.873)
⚠ icons/product-src/terminal.svg straight-segment points off the whole/half grid: (12, 10.828)
✓ WitchyNibbles package validation passed (enforced: product-pipeline)
```

No `✗` line, and no warning for `owl`, `spider` or `witch-hat`. The grimoire, moon-gate and terminal points are crescent tips (Task 4 explains the false positive). Task 4 removes all but `gear`.

Run: `npm test 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 139`, `ℹ fail 0`.

Write the comparison page (a review helper, git-ignored):

```bash
mkdir -p review-out/compare
cat > review-out/compare/compare.mjs <<'EOF'
// Before/after/Codicon sheet for gate-1 redraws and snaps (not committed; review-out/ is ignored).
// Usage: node review-out/compare/compare.mjs <before-git-ref-or-tree> <drawing> [<drawing> ...]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [ref, ...names] = process.argv.slice(2);
const out = path.resolve('review-out/compare');
const CODICON_TTF = '/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/media/codicon.ttf';
fs.copyFileSync(CODICON_TTF, path.join(out, 'codicon.ttf'));
// Stock Codicon each drawing replaces (codepoints from the 1.141 workbench bundle's codicon table).
const stock = { spider: 0xeb91, owl: 0xea82, 'witch-hat': 0xeb99, 'moon-gate': 0xeb39, 'explorer-grimoire': 0xeaf0, bell: 0xeaa2,
  'cat-head': 0xec1e, flask: 0xea79, gear: 0xeb51, terminal: 0xea85, 'scrying-glass': 0xea6d };
const before = (name) => execFileSync('git', ['show', `${ref}:icons/product-src/${name}.svg`], { encoding: 'utf8' });
const after = (name) => fs.readFileSync(`icons/product-src/${name}.svg`, 'utf8');
const svg = (text) => (size) => text.trim().replace('<svg ', `<svg width="${size}" height="${size}" `);
const font = (codepoint) => (size) => `<span class="c" style="font-size:${size}px">&#x${codepoint.toString(16)};</span>`;
const panels = [['#120C1F', '#A99AB9'], ['#F5ECFA', '#735F7D']];
const row = (label, items) => `<tr><th>${label}</th>${panels.map(([bg, fg]) => `<td style="background:${bg};color:${fg}">${[12, 16, 24].map((size) => items.map((item) => item(size)).join('')).join('<i></i>')}</td>`).join('')}</tr>`;
const rows = names.map((name) => row(`${name}: before · after · Codicon`, [svg(before(name)), svg(after(name)), font(stock[name])]));
rows.push(row('16px set: cat-head · owl · spider · debug-alt · history', [svg(after('cat-head')), svg(after('owl')), svg(after('spider')), font(0xeb91), font(0xea82)]));
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><style>@font-face{font-family:codicon;src:url(codicon.ttf)}
body{margin:8px;font:11px system-ui;background:#777;color:#fff}table{border-collapse:collapse}th{text-align:left;padding:2px 8px;white-space:nowrap}
td{padding:6px 10px;white-space:nowrap}i{display:inline-block;width:14px}.c{font-family:codicon;line-height:1;display:inline-block;vertical-align:middle;margin-right:6px}
svg{vertical-align:middle;margin-right:6px}</style><table>${rows.join('\n')}</table>`);
console.log(path.join(out, 'index.html'));
EOF
node review-out/compare/compare.mjs 81ff905 spider owl witch-hat moon-gate explorer-grimoire
export AGENT_BROWSER_SESSION=spellbound-gate2
agent-browser set viewport 1500 700 1
agent-browser open "file://$PWD/review-out/compare/index.html"
agent-browser screenshot "$PWD/review-out/compare/g7@1x.png"
agent-browser set viewport 1500 700 2
agent-browser open "file://$PWD/review-out/compare/index.html"
agent-browser screenshot "$PWD/review-out/compare/g7@2x.png"
agent-browser close
```

Expected: the script prints the path of `index.html`, and both screenshots are saved. (The stock column shows `copilot` for the cat and `search` for the scrying glass: both IDs are mapped to those drawings too.) Open `g7@1x.png` and `g7@2x.png` with the Read tool. At 16px/100% confirm, and say in the task notes what you saw:
- the spider reads as a spider (round body, eight legs, thread), not as the `debug-alt` beetle beside it;
- the owl reads as an owl face (two eye rings with pupils, tufts, beak) and cannot be mistaken for the cat head in the 16px set;
- the hat reads as a witch hat (bent tip, a 1px slot above the band, a pointed brim), not a triangle on a bar;
- the moon gate shows a crescent, not a dot, inside a heavy arch;
- the grimoire's crescent sits in the upper left, with the lower right of the cover empty.

If one fails, adjust it inside the same keyline, re-run Steps 4-7, and record what changed in a code comment. Do not change a metaphor.

Then run the glyph sheet procedure (Global Constraints) to confirm the five drawings render from the built font.

- [ ] **Step 8: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_3`
Expected: one 40-character tree id, also saved in `review-out/TREE_3`.

---

### Task 4: Grid snaps (G3), bell-dot's free corner, and the crescent false positive

**Files:**
- Create: `test/glyph-grid.test.mjs`
- Modify: `scripts/glyphs/batch-1.mjs` (`parts.bell`, `parts.catHeadOutline`, `drawings.flask`, `gearOutline`), `scripts/lib/svg-geometry.mjs` (`offGridPoints`), `test/svg-geometry.test.mjs`, `test/glyph-parts.test.mjs`
- Regenerated: `icons/product-src/{bell,cat-head,flask,gear}.svg`, `icons/witchynibbles-product-icons.woff`

**Interfaces:**
- Consumes: `filledAt` (Task 3), `parts` (Task 2), `review-out/compare/compare.mjs` (Task 3).
- Produces:
  - Snapped `parts.bell()` and `parts.catHeadOutline()` with the Task 2 signatures. Task 8 (bell-dot), Task 9 (Copilot states) and the drift tests build on this geometry.
  - A bell with nothing inside x10-15, y1-6, pinned by a test: the dome starts at y6 and the handle runs x7-9, y1-7.
  - An `offGridPoints` that no longer reports the zero-length closing segment of a curve-only subpath.
  - `test/glyph-grid.test.mjs`: every batch-1 drawing on the whole/half grid except the documented gear teeth, and the gear's spin balance. It covers batch 1 only; the chrome and status modules keep the validator's soft warning (Task 12 lists theirs).

The gate-1 warning list named bell, cat-head, explorer-grimoire, flask, gear, moon-gate, owl, scrying-glass, terminal and witch-hat. After Task 3 the owl, spider and witch hat have no off-grid points, and `scrying-glass` has none since G2 replaced its crescent with a plain dot. The warnings on `explorer-grimoire`, `moon-gate` and `terminal` were never real geometry: `normalizeHVZ` turns a crescent's closing `Z` into a zero-length line onto its own start point, which is an arc end such as `(12, 10.828)`, and the scan counted it as a straight segment. That leaves four real snaps: bell, cat-head, flask and gear.

- [ ] **Step 1: Write the failing tests**

Append to `test/svg-geometry.test.mjs`:

```js

test('a closing Z that lands on its own start is not a straight segment', () => {
  assert.deepEqual(offGridPoints('M11 9.828A3 3 0 1 1 11 4.172A3 3 0 0 0 11 9.828Z'), []); // crescent tips are arc ends
  assert.deepEqual(offGridPoints('M2.3 2L6 2L6 6Z').map(([x, y]) => `${x},${y}`), ['2.3,2', '2.3,2']); // a real closing line still counts
});
```

In `test/glyph-parts.test.mjs`, add below the `svgDocument` import

```js
import { filledAt } from '../scripts/lib/svg-geometry.mjs';
```

and append

```js

test('parts.bell leaves the top-right corner (x10-15, y1-6) empty for the bell-dot ✦', () => {
  const bell = parts.bell();
  for (let x = 10.25; x < 15; x += 0.25) for (let y = 1.25; y < 6; y += 0.25) assert.ok(!filledAt(bell, [x, y]), `${x},${y}`);
});
```

`test/glyph-grid.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings } from '../scripts/glyphs/batch-1.mjs';
import { offGridPoints, parseGlyphSvg, pathBounds } from '../scripts/lib/svg-geometry.mjs';

// Gate 1 decision G3: batch-1 straight segments sit on the whole/half grid. The one documented exception is the gear's
// 45-degree teeth (see the comment above gearOutline in scripts/glyphs/batch-1.mjs).
const ds = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const offGrid = (name) => ds(name).flatMap((d) => offGridPoints(d));

for (const name of Object.keys(drawings).filter((key) => key !== 'gear')) {
  test(`${name}: every straight-segment point is on the whole/half grid`, () => {
    assert.deepEqual(offGrid(name), []);
  });
}

test('gear: only the 45-degree teeth are off the grid; the axis teeth are snapped', () => {
  const points = offGrid('gear');
  assert.ok(points.length > 0);
  for (const [x, y] of points) assert.ok(Math.abs(x - 8) > 2 && Math.abs(y - 8) > 2, `(${x}, ${y}) is not on a diagonal tooth`);
});

test('gear: still spin-safe after the snap, bounds centred on (8,8)', () => {
  assert.deepEqual(pathBounds(ds('gear')), { minX: 1, maxX: 15, minY: 1, maxY: 15 });
});
```

Run: `node --test --test-reporter=tap test/glyph-grid.test.mjs test/glyph-parts.test.mjs test/svg-geometry.test.mjs | grep -E '^not ok|^# (pass|fail)'`
Expected:

```
not ok 9 - bell: every straight-segment point is on the whole/half grid
not ok 12 - explorer-grimoire: every straight-segment point is on the whole/half grid
not ok 16 - flask: every straight-segment point is on the whole/half grid
not ok 18 - moon-gate: every straight-segment point is on the whole/half grid
not ok 20 - cat-head: every straight-segment point is on the whole/half grid
not ok 22 - terminal: every straight-segment point is on the whole/half grid
not ok 23 - gear: only the 45-degree teeth are off the grid; the axis teeth are snapped
not ok 28 - parts.bell leaves the top-right corner (x10-15, y1-6) empty for the bell-dot ✦
not ok 37 - a closing Z that lands on its own start is not a straight segment
# pass 28
# fail 9
```

(The gear bounds test passes already; it guards the snap in Step 6.)

- [ ] **Step 2: Skip zero-length segments in `offGridPoints`**

In `scripts/lib/svg-geometry.mjs`, replace

```js
// End points of straight segments that are neither whole nor .5 (soft warning in section 8).
export function offGridPoints(d) {
  const data = new SVGPathData(d).toAbs().normalizeHVZ();
  const points = [];
  let pen = null;
  for (const command of data.commands) {
    if (command.type === SVGPathData.LINE_TO && pen) {
```

with

```js
// End points of straight segments that are neither whole nor .5 (soft warning in section 8). A zero-length segment
// is skipped: normalizeHVZ turns the Z of a curve-only subpath (a crescent) into a line onto its own start point.
export function offGridPoints(d) {
  const data = new SVGPathData(d).toAbs().normalizeHVZ();
  const points = [];
  let pen = null;
  for (const command of data.commands) {
    const zeroLength = pen && Math.abs(command.x - pen[0]) < EPSILON && Math.abs(command.y - pen[1]) < EPSILON;
    if (command.type === SVGPathData.LINE_TO && pen && !zeroLength) {
```

(`EPSILON` is the existing `1e-6` constant at the top of the file.)

Run the Step 1 command again.
Expected: 5 failures left (`bell`, `flask`, `cat-head`, `gear: only the 45-degree teeth …`, `parts.bell leaves the top-right corner …`), `# pass 32`.

- [ ] **Step 3: Snap the bell and free its top-right corner**

The Task 2 bell's dome starts at y4 and its shoulder arc reaches (11.4, 4.6), inside the corner bell-dot needs; its inner flare also sits on 11.4/4.4/11.6. In `scripts/glyphs/batch-1.mjs`, replace the `bell:` entry of `parts` (from `// Hand bell. Task 4 frees the top-right corner` through its closing `],`) with

```js
  // Hand bell. Nothing of it lies inside x10-15, y1-6, so bell-dot can put its ✦ there (test/glyph-parts.test.mjs).
  // Gate 1 (G3): the dome used to start at y4 (its shoulder reached (11.4, 4.6), inside that corner) and the inner flare
  // sat on 11.4/4.4/11.6. The dome now starts at y6 under a longer handle (x7-9, y1-7, running into the dome), and the
  // inner flare is on the half grid, parallel to the outer flare (x + y = 16.5 on the left, x - y = -0.5 on the right).
  bell: () => [
    rect(7, 1, 2, 6), // handle x7-9, y1-7
    'M6 6H10C11.1 6 12 6.9 12 8V11L14 13H2L4 11V8C4 6.9 4.9 6 6 6Z', // dome from y6 and flared body, clockwise
    'M6 7C5.4 7 5 7.4 5 8V11.5L4.5 12H11.5L11 11.5V8C11 7.4 10.6 7 10 7Z', // inside x5-11, y7-12, counter-clockwise
    disc(8, 14, 1), // clapper x7-9, y13-15
  ],
```

- [ ] **Step 4: Snap the cat head's inner wall**

In `parts.catHeadOutline`, replace

```js
    polygon([[3, 4], [5.7, 6], [10.3, 6], [13, 4], [13, 11.6], [10.6, 14], [5.4, 14], [3, 11.6]], 'ccw'), // 1-unit wall
```

with

```js
    // inside, counter-clockwise. Gate 1 (G3): snapped from 5.7/10.3/11.6/5.4/10.6 to the half grid; the chin chamfers
    // stay parallel to the outer ones (~1.06 across) and the ear walls are 1.0-1.1.
    polygon([[3, 4], [5.5, 6], [10.5, 6], [13, 4], [13, 11.5], [10.5, 14], [5.5, 14], [3, 11.5]], 'ccw'),
```

The eyes keep at least one unit to every wall: 1 unit to x3 at the eye tips, and 1.77 to the chin chamfer.

- [ ] **Step 5: Snap the flask**

Replace

```js
drawings.flask = () => svgDocument(
  'M5 1H11V2H10V6L14 13V14A1 1 0 0 1 13 15H3A1 1 0 0 1 2 14V13L6 6V2H5Z', // lip, neck and body, clockwise
  'M7 2V6.27L3 13.27V14H13V13.27L9 6.27V2Z', // inside, counter-clockwise
  polygon([[6, 10], [10, 10], [11.7, 13], [4.3, 13]]), // accent: liquid, ~1 unit inside the walls
);
```

with

```js
// Gate 1 (G3): the inner shoulders moved from y6.27/13.27 to y6.5/13.5. The inner walls keep the outer 7:4 slope, so
// the side walls are ~1.12 across (was 1.0). The liquid's corners moved onto the half grid, 1.05-1.3 inside the walls;
// its top narrowed from 4 units (x6-10) to 3 (x6.5-9.5) to keep that clearance.
drawings.flask = () => svgDocument(
  'M5 1H11V2H10V6L14 13V14A1 1 0 0 1 13 15H3A1 1 0 0 1 2 14V13L6 6V2H5Z', // lip, neck and body, clockwise
  'M7 2V6.5L3 13.5V14H13V13.5L9 6.5V2Z', // inside, counter-clockwise
  polygon([[6.5, 10], [9.5, 10], [11.5, 13], [4.5, 13]]), // accent: liquid y10-13, one unit above the floor
);
```

- [ ] **Step 6: Snap the gear's axis teeth and document the diagonal ones**

Replace

```js
// 2-unit parallel bands (the top, bottom and side teeth land on whole numbers, x7-9 / y7-9) with ~2.3-unit root gaps.
const gearOutline = ({ cx = 8, cy = 8, teeth = 8, outer = 7, root = 5.5, half = 1 } = {}) => {
  const fmt = (value) => Number(value.toFixed(3)).toString();
  const at = (u, v, along, across) => `${fmt(cx + u[0] * along + v[0] * across)} ${fmt(cy + u[1] * along + v[1] * across)}`;
  const base = Math.sqrt(root * root - half * half);
```

with

```js
// 2-unit parallel bands (the top, bottom and side teeth land on whole numbers, x7-9 / y7-9) with ~2.3-unit root gaps.
// Gate 1 (G3): `base` (the tooth's root corners, measured along the tooth) is 5.5, so the four axis teeth end on the
// half grid (y2.5, x13.5 ...) and the root arc radius follows from it (5.59, was 5.5). Kept off the grid on purpose:
// the corners of the four 45-degree teeth sit at 8 ± (along ± across) / sqrt(2), which no half-unit value reaches
// while the tooth stays a 2-unit parallel band; snapping them makes those teeth uneven trapezoids.
const gearOutline = ({ cx = 8, cy = 8, teeth = 8, outer = 7, base = 5.5, half = 1 } = {}) => {
  const fmt = (value) => Number(value.toFixed(3)).toString();
  const at = (u, v, along, across) => `${fmt(cx + u[0] * along + v[0] * across)} ${fmt(cy + u[1] * along + v[1] * across)}`;
  const root = Math.hypot(base, half);
```

The rest of `gearOutline` is unchanged.

Run the Step 1 command again.
Expected: no `not ok` lines, `# pass 37`, `# fail 0`.

- [ ] **Step 7: Regenerate, build, validate, test**

Run: `npm run draw:glyphs && npm run build:product-icons && git add -A && git diff --cached --stat $(cat review-out/TREE_3) -- icons`
Expected: `Wrote 23 glyph SVGs`, `Built 23 product icon drawings for 54 icon IDs in icons/witchynibbles-product-icons.woff`, and the diff names exactly `icons/product-src/bell.svg`, `icons/product-src/cat-head.svg`, `icons/product-src/flask.svg`, `icons/product-src/gear.svg` and `icons/witchynibbles-product-icons.woff`.

Run: `npm run validate 2>&1 | grep -v '^>' | grep .`
Expected:

```
… 137 pending problems in stages not yet enforced: product-batch:chrome (17), product-batch:editor (33), product-batch:status (19), product-batch:panel (9), product-batch:debug (23), product-batch:symbols (15), release (2), file-icons (19) (use --verbose to list)
⚠ icons/product-src/gear.svg straight-segment points off the whole/half grid: (11.182, 3.404) (12.243, 2.343) (13.657, 3.757) (12.596, 4.818) (12.596, 11.182) (13.657, 12.243) …
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1)
```

Run: `npm test 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 165`, `ℹ fail 0`.

- [ ] **Step 8: Inspect the snaps**

```bash
node review-out/compare/compare.mjs $(cat review-out/TREE_3) bell cat-head flask gear terminal explorer-grimoire moon-gate
export AGENT_BROWSER_SESSION=spellbound-gate2
agent-browser set viewport 1500 700 1
agent-browser open "file://$PWD/review-out/compare/index.html"
agent-browser screenshot "$PWD/review-out/compare/g3@1x.png"
agent-browser set viewport 1500 700 2
agent-browser open "file://$PWD/review-out/compare/index.html"
agent-browser screenshot "$PWD/review-out/compare/g3@2x.png"
agent-browser close
```

(`git show <tree>:<path>` reads a file from a `write-tree` id, so the Task 3 snapshot is the "before".) Open both PNGs with the Read tool. Confirm at 16px/100% that:
- cat-head, flask and gear look the same as before (the snaps move points by at most 0.3 units; the flask's liquid is a little narrower at the top);
- the bell still reads as a bell, with the longer handle as its only visible change;
- terminal, grimoire and moon gate are unchanged by this task.

- [ ] **Step 9: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_4`
Expected: one 40-character tree id, also saved in `review-out/TREE_4`.

---
## Part C: chrome batch (17 IDs)

The `chrome` batch is the spec 5.2 "Shared chrome" rows that batch 1 left out: arrows, add/plus/remove, check and the three dots. It is 8 drawings in `scripts/glyphs/chrome.mjs` (E117-E11E), split into two tasks a reviewer can reject separately: Task 5 draws the four arrows, Task 6 draws add, remove, check and the dots and enforces `product-batch:chrome`. Part C does not use `parts`.

**Prerequisite:** Tasks 1-4. Before Task 5 the map holds 23 drawings for 54 IDs, `glyphModules` is `[batch1]`, `test/product-icon-theme.test.mjs` still asserts 23 drawings, and `product-batch:status` has 19 pinned keys.

**Reference measurements (stock Codicons, 1.141 `codicon.ttf`, converted to the 16-unit grid, y down).** Reproduce with:

```bash
node -e "const f=require('./node_modules/fontkit').openSync('/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/media/codicon.ttf'),s=16/f.unitsPerEm;for(const [n,c] of [['add',0xEA60],['arrow-down',0xEA9A],['arrow-left',0xEA9B],['arrow-right',0xEA9C],['arrow-up',0xEAA1],['check',0xEAB2],['ellipsis',0xEA7C],['remove',0xEB3B],['close',0xEA76],['chevron-down',0xEAB4]]){const b=f.glyphForCodePoint(c).path.bbox,r=(v)=>Math.round(v*2)/2;console.log(n,'x',r(b.minX*s)+'-'+r(b.maxX*s),'y',r(16-b.maxY*s)+'-'+r(16-b.minY*s))}"
```

Expected:

```
add x 1-14 y 1-14
arrow-down x 3-14 y 2-14
arrow-left x 2-14 y 3-14
arrow-right x 2-14 y 3-14
arrow-up x 3-14 y 2-14
check x 1.5-14.5 y 3-12
ellipsis x 3-13 y 7-9
remove x 1-14 y 7-8
close x 2-14 y 2-14
chevron-down x 3-13 y 5-10.5
```

| Codicon | Construction | House drawing |
| :- | :- | :- |
| `arrow-right` / `-left` | 1-unit stem on row 8 (y 8-9); open 90° head, 6 deep, 11 tall | 2-14 / 4-11; stem on row 7 (y 7-8); filled head 6 deep, 7 tall, 2:1 sides, 1-unit flat tip |
| `arrow-up` / `-down` | stem on column 8 (x 8-9) | 4-11 / 2-14; stem on column 7 (x 7-8) |
| `add` | 1-unit bars on x 7-8 and y 7-8, round ends | 2-13 / 2-13; same bars, square ends |
| `remove` | 1-unit bar | 2-13 / 7-8 |
| `check` | 1-unit stroke, round ends | 2-14 / 3-12; chevron band (2 tall, ~1.4 across, 45°) |
| `ellipsis` | three 2×2 dots | 1-14 / 6-9; three 3×3 dots, 2 apart (gate variant `ellipsis.small`: 2×2 dots on 3-13) |

Two choices differ from the stock Codicons on purpose, and go to the author:

- **Stems on row or column 7.** The stock arrows put their stem on pixel row or column 8. Section 4 puts every odd-width central feature on column 7, as Codicon `add` does, so all four arrows use row 7 or column 7. Rotating `arrow-right` by 90° about (8,8) would put the up and down stems on column 8, so the vertical arrows are the horizontal ones reflected in the main diagonal.
- **Dots are 13 wide.** The dots are 3×3, the dot-like accent minimum. With 1-unit gaps (x 2-13) they ran into one bar at 12px, so the gaps are 2 units and the row is 13 wide, one unit past the 10-12 action keyline, and past the 2-14 square keyline where `more` is drawn at 24px in the activity bar. The variant `ellipsis.small` (Codicon-sized 2×2 dots on x 3-13) goes to the gate beside it, so rejecting the 3×3 dots costs no redraw cycle.

The `arrow-up` and `arrow-down` Codicon IDs are not pinned and are not claimed: `product-icon-theme.test.mjs` fails on any mapped ID outside the pinned list.

---

### Task 5: Chrome arrows (right, left, down, up)

**Files:**
- Create: `scripts/glyphs/chrome.mjs`, `test/chrome-glyphs.test.mjs`, `icons/product-src/{arrow-right,arrow-left,arrow-down,arrow-up}.svg` (generated)
- Modify: `scripts/glyphs/index.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated by `npm run build:product-icons`)
- Create (git-ignored, not in the snapshot): `review-out/chrome-compare/make.mjs`

**Interfaces:**
- Consumes: `polygon`, `svgDocument` (primitives); `parseGlyphSvg`, `pathBounds`, `pointInPolygon`, `subpaths` (`scripts/lib/svg-geometry.mjs`); `claim-drawing.mjs`; the drift test and the negative-winding test (Task 3), which pick up every module in `glyphModules`.
- Produces: the module `scripts/glyphs/chrome.mjs` (exports `drawings`, `variants`), second in `glyphModules`; the drawings `arrow-right` (E117), `arrow-left` (E118), `arrow-down` (E119), `arrow-up` (E11A); the helpers in `test/chrome-glyphs.test.mjs` (`ds`, `outline`, `key`, `rounded`, `bounds`, `inside`, `reflect`), which Task 6 reuses; a count-free map test in `test/product-icon-theme.test.mjs`, which Tasks 6-10 rely on.

- [ ] **Step 1: Write the failing arrow tests**

`test/chrome-glyphs.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings } from '../scripts/glyphs/chrome.mjs';
import { parseGlyphSvg, pathBounds, pointInPolygon, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Geometry helpers. Points are compared as sorted sets, so a reflected outline matches whatever order polygon() wrote.
const ds = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const outline = (name) => {
  const polygons = ds(name).flatMap((d) => subpaths(d));
  assert.equal(polygons.length, 1, `${name} is one outline`);
  return polygons[0];
};
const key = (points) => points.map(([x, y]) => `${Number(x.toFixed(3))},${Number(y.toFixed(3))}`).sort();
const rounded = (bounds) => Object.fromEntries(Object.entries(bounds).map(([name, value]) => [name, Number(value.toFixed(2))]));
const bounds = (name) => rounded(pathBounds(ds(name)));
const inside = (name, point) => pointInPolygon(point, outline(name));
const reflect = {
  aboutX8: ([x, y]) => [16 - x, y], // mirror about the vertical line x = 8
  aboutColumn7: ([x, y]) => [15 - x, y], // mirror about the centre of pixel column 7 (x = 7.5)
  aboutRow7: ([x, y]) => [x, 15 - y], // mirror about the centre of pixel row 7 (y = 7.5)
  diagonal: ([x, y]) => [y, x], // reflect in the main diagonal: right <-> down, left <-> up
};

// ---- Arrows (Task 5) ----
test('arrow-right: 12 long (x2-14), head 6x7 (y4-11), every vertex on whole numbers', () => {
  assert.deepEqual(bounds('arrow-right'), { minX: 2, maxX: 14, minY: 4, maxY: 11 });
  assert.ok(outline('arrow-right').flat().every(Number.isInteger));
});

test('arrow-right: 1-unit stem on pixel row 7 and a filled head at least 5x5', () => {
  assert.equal(inside('arrow-right', [3, 7.5]), true);
  assert.equal(inside('arrow-right', [3, 6.5]), false);
  assert.equal(inside('arrow-right', [3, 8.5]), false);
  for (const point of [[9, 5], [9, 10], [13.5, 7.5]]) assert.equal(inside('arrow-right', point), true, `head covers ${point}`);
  // head reaches at least 5 deep and 5 tall (section 4 shape-accent minimum)
  assert.equal(inside('arrow-right', [8.5, 5.5]), true);
  assert.equal(inside('arrow-right', [12.5, 7]), true);
});

test('arrow-left is arrow-right mirrored about x = 8', () => {
  assert.deepEqual(key(outline('arrow-left')), key(outline('arrow-right').map(reflect.aboutX8)));
});

test('arrow-down and arrow-up are arrow-right and arrow-left reflected in the diagonal', () => {
  assert.deepEqual(key(outline('arrow-down')), key(outline('arrow-right').map(reflect.diagonal)));
  assert.deepEqual(key(outline('arrow-up')), key(outline('arrow-left').map(reflect.diagonal)));
});

test('arrow-up and arrow-down: stem on pixel column 7, like Codicon add', () => {
  for (const [name, y] of [['arrow-up', 13], ['arrow-down', 3]]) {
    assert.equal(inside(name, [7.5, y]), true, name);
    assert.equal(inside(name, [6.5, y]), false, name);
    assert.equal(inside(name, [8.5, y]), false, name);
  }
});

test('every arrow is symmetric about the centre line of its stem', () => {
  for (const name of ['arrow-right', 'arrow-left']) assert.deepEqual(key(outline(name).map(reflect.aboutRow7)), key(outline(name)), name);
  for (const name of ['arrow-up', 'arrow-down']) assert.deepEqual(key(outline(name).map(reflect.aboutColumn7)), key(outline(name)), name);
});
```

Run: `node --test test/chrome-glyphs.test.mjs 2>&1 | grep -m1 -o 'ERR_MODULE_NOT_FOUND'`
Expected: `ERR_MODULE_NOT_FOUND` (`scripts/glyphs/chrome.mjs` does not exist yet).

- [ ] **Step 2: Create the chrome module and register it**

`scripts/glyphs/chrome.mjs`:

```js
// Phase 2 `chrome` batch (spec section 5.2, shared chrome): arrows, add/remove, check and the three dots.
// House stroke as in the batch-1 chevrons and close: straight strokes 1 unit wide on whole numbers, 45-degree bands
// about 1.4 units across. Odd-width central features sit on pixel column/row 7 (x/y 7-8), like Codicon add (section 4).
import { polygon, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

// ---- Arrows (Task 5) ----
// Stem with a filled head; the head is the accent (section 4). One pre-rotated drawing per orientation (section 5.1).
// Stock Codicon arrows (1.141 codicon.ttf) are 12 long (2-14) with open 90-degree heads. This head is 6 deep and 7 tall
// with 2:1 sides and a 1-unit flat tip: on the 16px sheet a 45-degree 4x9 head read as a wedge (and as a hat when
// pointing up), and a 4x5 head was too small next to the stem.
const arrowRight = [[2, 7], [8, 7], [8, 4], [14, 7], [14, 8], [8, 11], [8, 8], [2, 8]]; // stem x2-8, y7-8; head x8-14, y4-11
const mirrorX = (points) => points.map(([x, y]) => [16 - x, y]); // about x = 8: the stem stays on row 7
const transpose = (points) => points.map(([x, y]) => [y, x]); // row 7 becomes column 7
drawings['arrow-right'] = () => svgDocument(polygon(arrowRight));
drawings['arrow-left'] = () => svgDocument(polygon(mirrorX(arrowRight)));
drawings['arrow-down'] = () => svgDocument(polygon(transpose(arrowRight)));
drawings['arrow-up'] = () => svgDocument(polygon(transpose(mirrorX(arrowRight))));
```

Replace `scripts/glyphs/index.mjs` with:

```js
import * as batch1 from './batch-1.mjs';
import * as chrome from './chrome.mjs';

export const glyphModules = [batch1, chrome];
```

Run: `node --test test/chrome-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 6`, `ℹ pass 6`, `ℹ fail 0`.

- [ ] **Step 3: Replace the hard-coded drawing count in the theme test**

`test/product-icon-theme.test.mjs` asserts exactly 23 drawings, which every new drawing breaks. Make the map match the generators instead. Add below the `map` import:

```js
import { glyphModules } from '../scripts/glyphs/index.mjs';
```

Replace:

```js
test('23 drawings, no legacy drawings, no IDs outside the pinned list', () => {
  assert.equal(Object.keys(map.drawings).length, 23);
```

with:

```js
test('the map holds exactly the generated drawings, no legacy drawings, no IDs outside the pinned list', () => {
  const generated = glyphModules.flatMap(({ drawings }) => Object.keys(drawings));
  assert.deepEqual(Object.keys(map.drawings).sort(), generated.sort());
```

The two lines after it (the legacy check and the pinned-ID check) stay.

Run: `node --test --test-reporter=tap 2>/dev/null | grep '^not ok'`
Expected: exactly 5 failures: the four new drift cases (`drawing arrow-right`, `arrow-left`, `arrow-down`, `arrow-up`: `committed SVG matches the generator …`, ENOENT, the SVGs are not drawn yet) and `the map holds exactly the generated drawings, no legacy drawings, no IDs outside the pinned list` (the arrows are not claimed yet).

- [ ] **Step 4: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs arrow-right E117 arrow-right
node scripts/claim-drawing.mjs arrow-left E118 arrow-left quick-input-back
node scripts/claim-drawing.mjs arrow-down E119 find-next-match diff-editor-next-change
node scripts/claim-drawing.mjs arrow-up E11A find-previous-match diff-editor-previous-change
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓'
node scripts/validate.mjs --only product-batch:chrome 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/arrow-right.svg icons/product-src/arrow-up.svg
```

Expected:
- `Wrote 27 glyph SVGs`.
- The claims print `arrow-right (E117) <- arrow-right`, `arrow-left (E118) <- arrow-left, quick-input-back`, `arrow-down (E119) <- find-next-match, diff-editor-next-change` and `arrow-up (E11A) <- find-previous-match, diff-editor-previous-change`, with no `removed` suffix.
- `Built 27 product icon drawings for 61 icon IDs in icons/witchynibbles-product-icons.woff`.
- `✓ WitchyNibbles package validation passed (enforced: product-pipeline)` and no `✗` line. The font-geometry check covers the four new glyphs.
- The chrome count is `10`.
- `ℹ tests 175`, `ℹ fail 0` (6 in `chrome-glyphs`, 4 drift cases).
- The two SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 7L8 7L8 4L14 7L14 8L8 11L8 8L2 8Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M7 14L7 8L4 8L7 2L8 2L11 8L8 8L8 14Z"/></svg>
```

`glyphRuleProblems` reports 0 errors and 0 warnings for all four arrows: every vertex is a whole number.

- [ ] **Step 5: Inspect against the stock Codicons**

Write the comparison page once (Task 6 reuses it):

```bash
mkdir -p review-out/chrome-compare
cat > review-out/chrome-compare/make.mjs <<'EOF'
// Chrome drawings from the built font beside the stock Codicons they replace, at 12/16/24px on dark and light.
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('review-out/chrome-compare');
const codicons = '/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/media/codicon.ttf';
fs.copyFileSync('icons/witchynibbles-product-icons.woff', path.join(out, 'house.woff'));
fs.copyFileSync(codicons, path.join(out, 'codicon.ttf'));
const { drawings } = JSON.parse(fs.readFileSync('icons/product-icon-map.json', 'utf8'));
// [drawing, stock Codicon character it replaces] (codepoints from the 1.141 bundle's codicon table)
const rows = [
  ['arrow-right', 'EA9C'], ['arrow-left', 'EA9B'], ['arrow-down', 'EA9A'], ['arrow-up', 'EAA1'],
  ['add', 'EA60'], ['remove', 'EB3B'], ['check', 'EAB2'], ['ellipsis', 'EA7C'],
  ['close', 'EA76'], ['chevron-down', 'EAB4'], // batch-1 house reference
];
const glyph = (family, codepoint, size) => `<span style="font:${size}px/1 ${family}">&#x${codepoint};</span>`;
const strip = (family, codepoint) => [12, 16, 24].map((size) => glyph(family, codepoint, size)).join('');
const cells = (name, stock) => [['#120C1F', '#A99AB9'], ['#F5ECFA', '#735F7D']]
  .map(([bg, fg]) => `<td style="background:${bg};color:${fg}">${strip('H', drawings[name].codepoint)}<i></i>${strip('C', stock)}</td>`).join('');
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Chrome vs Codicon</title>
<style>@font-face{font-family:H;src:url(house.woff)}@font-face{font-family:C;src:url(codicon.ttf)}
body{margin:8px;font:12px system-ui;background:#fff}table{border-collapse:collapse}th{text-align:left;padding:2px 8px;font-weight:500}
td{padding:6px 10px;white-space:nowrap}td span{display:inline-block;margin-right:10px;vertical-align:middle}i{display:inline-block;width:16px}</style>
<table><tr><th></th><th>dark: house 12/16/24 · Codicon 12/16/24</th><th>light: house 12/16/24 · Codicon 12/16/24</th></tr>
${rows.filter(([name]) => name in drawings).map(([name, stock]) => `<tr><th>${name}</th>${cells(name, stock)}</tr>`).join('\n')}</table>`);
console.log(path.join(out, 'index.html'));
EOF
```

Render the comparison page at DPR 1 and 2, then run the glyph sheet procedure (Global Constraints):

```bash
node review-out/chrome-compare/make.mjs
export AGENT_BROWSER_SESSION=spellbound-gate2
agent-browser set viewport 760 460 1
agent-browser open "file://$PWD/review-out/chrome-compare/index.html"
agent-browser screenshot --full "$PWD/review-out/chrome-compare/compare@1x.png"
agent-browser set viewport 760 460 2
agent-browser open "file://$PWD/review-out/chrome-compare/index.html"
agent-browser screenshot --full "$PWD/review-out/chrome-compare/compare@2x.png"
agent-browser close
```

Expected: the comparison page has 6 rows (4 arrows, `close`, `chevron-down`). Open the PNGs with the Read tool, upscaling the 1x one with nearest-neighbour scaling if needed, and check that:

- at 16px and 100%, each arrow reads as an arrow pointing the right way, with a triangular head, not a wedge or a hat;
- the stem is one crisp pixel row or column, with no 2-pixel grey smear;
- at 12px the head is still a separate blob from the stem;
- beside the house `close` and chevron, the arrows look like the same family;
- beside the stock arrows, they are about the same length (the head is 7 tall against the stock 11).

If a head needs adjusting, stay inside x 8-14 and y 4-11 with the head at least 5×5, keep whole-number vertices, update the bounds test, and note the change in the task report.

- [ ] **Step 6: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_5`
Expected: one 40-character tree id, also saved in `review-out/TREE_5`.

---

### Task 6: Add, remove, check, dots; enforce `product-batch:chrome`

**Files:**
- Create: `icons/product-src/{add,remove,check,ellipsis}.svg`, `icons/product-src-variants/ellipsis.small.svg` (generated)
- Modify: `scripts/glyphs/chrome.mjs`, `test/chrome-glyphs.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `scripts/validation-stage.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: Task 5's module and test helpers; `disc`, `rect` (primitives); `review-out/chrome-compare/make.mjs` (Task 5).
- Produces: the drawings `add` (E11B), `remove` (E11C), `check` (E11D), `ellipsis` (E11E) and the gate variant `ellipsis.small`; a theme that maps all 17 chrome IDs; the stage `product-batch:chrome` enforced by `npm run validate`.

- [ ] **Step 1: Write the failing tests**

Append to `test/chrome-glyphs.test.mjs`:

```js

// ---- Add, remove, check, dots (Task 6) ----
test('add: 1-unit bars on pixel column 7 and row 7, 11 long (2-13)', () => {
  assert.deepEqual(bounds('add'), { minX: 2, maxX: 13, minY: 2, maxY: 13 });
  for (const [point, expected] of [[[7.5, 3], true], [[6.5, 3], false], [[8.5, 3], false], [[3, 7.5], true], [[3, 6.5], false], [[3, 8.5], false]]) {
    assert.equal(inside('add', point), expected, `${point}`);
  }
});

test('add is symmetric about column 7.5, row 7.5 and the diagonal', () => {
  for (const mirror of [reflect.aboutColumn7, reflect.aboutRow7, reflect.diagonal]) assert.deepEqual(key(outline('add').map(mirror)), key(outline('add')));
});

test('remove is the horizontal bar of add', () => {
  assert.deepEqual(key(outline('remove')), ['13,7', '13,8', '2,7', '2,8']);
  assert.deepEqual([bounds('remove').minX, bounds('remove').maxX], [bounds('add').minX, bounds('add').maxX]);
});

test('check: one band of 45-degree edges, 2 units tall at the bend, x2-14 y3-12', () => {
  const points = outline('check');
  points.forEach(([x1, y1], index) => {
    const [x2, y2] = points[(index + 1) % points.length];
    assert.equal(Math.abs(x2 - x1), Math.abs(y2 - y1), `edge ${x1},${y1} -> ${x2},${y2} is 45 degrees`);
  });
  assert.deepEqual(bounds('check'), { minX: 2, maxX: 14, minY: 3, maxY: 12 });
  assert.equal(inside('check', [6, 11]), true);
  assert.equal(inside('check', [6, 9.5]), false);
  assert.equal(inside('check', [6, 12.5]), false);
});

test('ellipsis: three 3x3 dots on row 7.5, 2 units apart, the middle one centred on column 7.5', () => {
  const dots = ds('ellipsis').flatMap((d) => d.split(/(?=M)/)).map((d) => rounded(pathBounds([d])));
  assert.deepEqual(dots, [
    { minX: 1, maxX: 4, minY: 6, maxY: 9 },
    { minX: 6, maxX: 9, minY: 6, maxY: 9 },
    { minX: 11, maxX: 14, minY: 6, maxY: 9 },
  ]);
});
```

Append to `test/product-icon-theme.test.mjs`:

```js

test('every chrome-batch ID is mapped by its own key, aliases included', () => {
  const chrome = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'chrome').map(([id]) => id);
  assert.equal(chrome.length, 17);
  for (const id of chrome) assert.ok(id in theme.iconDefinitions, id);
});
```

Run: `node --test test/chrome-glyphs.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|AssertionError'`
Expected: `ℹ tests 15`, `ℹ pass 9`, `ℹ fail 6`: the five new chrome tests (`TypeError: drawings[name] is not a function`) and the chrome coverage test (`AssertionError [ERR_ASSERTION]: add`).

- [ ] **Step 2: Append the drawings and the gate variant**

In `scripts/glyphs/chrome.mjs`, change the import line to:

```js
import { disc, polygon, rect, svgDocument } from './primitives.mjs';
```

and append:

```js

// ---- Add, remove, check, dots (Task 6) ----
// Stock Codicon add and remove: 1-unit bars on x/y 7-8, 13 long (1-14). These are 11 long (2-13): inside the 10-12
// action keyline, centred on 7.5 like the Codicon bars, and the same optical size as the batch-1 close (3-13).
const plusOutline = [[2, 7], [7, 7], [7, 2], [8, 2], [8, 7], [13, 7], [13, 8], [8, 8], [8, 13], [7, 13], [7, 8], [2, 8]];
drawings.add = () => svgDocument(polygon(plusOutline));
drawings.remove = () => svgDocument(rect(2, 7, 11, 1));
// The chevron band bent into a check: 2 units tall, about 1.4 across, 45-degree edges, ends cut square to the stroke.
// Stock Codicon check spans x1.5-14.5, y3-12 with a 1-unit stroke.
drawings.check = () => svgDocument(polygon([[2, 8], [3, 7], [6, 10], [13, 3], [14, 4], [6, 12]]));
// Three filled dots, each the 3x3 dot-like minimum, 2 units apart (x1-14). Stock Codicon ellipsis has 2x2 dots on
// x3-13. At 1-unit gaps (x2-13) the dots ran into one bar at 12px.
drawings.ellipsis = () => svgDocument([2.5, 7.5, 12.5].map((cx) => disc(cx, 7.5, 1.5)));
// Gate 2 alternative inside the 10-12 action keyline: Codicon-sized 2x2 dots on x3-13, y7-9 (an even-width row, so it
// is centred on 8; below the 3x3 dot-accent minimum). The author picks at gate 2; the loser is deleted.
variants['ellipsis.small'] = () => svgDocument([4, 8, 12].map((cx) => disc(cx, 8, 1)));
```

Run: `node --test test/chrome-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 11`, `ℹ pass 11`, `ℹ fail 0`.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs add E11B add plus terminal-new diff-insert
node scripts/claim-drawing.mjs remove E11C remove diff-remove
node scripts/claim-drawing.mjs check E11D check
node scripts/claim-drawing.mjs ellipsis E11E ellipsis more toolbar-more
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓'
node scripts/validate.mjs --only product-batch:chrome 2>&1 | grep -E '^✗|^✓'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{add,remove,check,ellipsis}.svg icons/product-src-variants/ellipsis.small.svg
```

Expected:
- `Wrote 32 glyph SVGs` (31 drawings and the variant).
- The four claims print `add (E11B) <- add, plus, terminal-new, diff-insert`, `remove (E11C) <- remove, diff-remove`, `check (E11D) <- check` and `ellipsis (E11E) <- ellipsis, more, toolbar-more`.
- `Built 31 product icon drawings for 71 icon IDs in icons/witchynibbles-product-icons.woff`.
- `✓ WitchyNibbles package validation passed (enforced: product-pipeline)` and `✓ WitchyNibbles package validation passed (enforced: product-batch:chrome)`, with no `✗` line.
- `ℹ tests 186`, `ℹ fail 0` (5 in `chrome-glyphs`, 4 drawing drift cases, 1 variant drift case, 1 chrome coverage).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 7L7 7L7 2L8 2L8 7L13 7L13 8L8 8L8 13L7 13L7 8L2 8Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 7L13 7L13 8L2 8Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 8L3 7L6 10L13 3L14 4L6 12Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M1 7.5A1.5 1.5 0 1 1 4 7.5A1.5 1.5 0 1 1 1 7.5ZM6 7.5A1.5 1.5 0 1 1 9 7.5A1.5 1.5 0 1 1 6 7.5ZM11 7.5A1.5 1.5 0 1 1 14 7.5A1.5 1.5 0 1 1 11 7.5Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M3 8A1 1 0 1 1 5 8A1 1 0 1 1 3 8ZM7 8A1 1 0 1 1 9 8A1 1 0 1 1 7 8ZM11 8A1 1 0 1 1 13 8A1 1 0 1 1 11 8Z"/></svg>
```

`glyphRuleProblems` reports 0 errors and 0 warnings for the four drawings and the variant.

- [ ] **Step 4: Inspect against the stock Codicons**

If `review-out/chrome-compare/make.mjs` is missing (fresh checkout), re-create it from Task 5 Step 5 first. Re-run the Task 5 Step 5 render block (from `node review-out/chrome-compare/make.mjs` to `agent-browser close`), then the glyph sheet procedure; the comparison page now has 10 rows, and the glyph sheet ends with the `ellipsis.small.svg` variant row. Open the PNGs with the Read tool and check that:

- the plus and the minus are single crisp pixel rows or columns at 100%, the same length as each other;
- the plus is about the optical size of the house `close`;
- the check has the weight of the house chevron and `close`, heavier than the stock check, as the chevron is;
- the 3×3 dots and the `ellipsis.small` dots both stay three separate dots at 12px on both backgrounds.

Do not choose between `ellipsis` and `ellipsis.small`; the author picks at the gate.

- [ ] **Step 5: Enforce the chrome stage**

Replace `scripts/validation-stage.json` with:

```json
{
  "$comment": "Stages that npm run validate enforces. Phases append stage names as their work lands; validate --release enforces every stage.",
  "enforce": ["base", "color-themes", "product-pipeline", "product-batch:1", "product-batch:chrome"]
}
```

Run:

```bash
npm run validate 2>&1 | grep -v '^⚠' | grep -v '^>' | grep .
npm run validate 2>&1 | grep -c 'product-batch:chrome'
node scripts/validate.mjs --release 2>&1 | grep -c 'product-batch:chrome'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:

```
… 120 pending problems in stages not yet enforced: product-batch:editor (33), product-batch:status (19), product-batch:panel (9), product-batch:debug (23), product-batch:symbols (15), release (2), file-icons (19) (use --verbose to list)
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome)
1
0
ℹ tests 186
ℹ fail 0
```

The `1` is the `✓ … enforced` line, the only line naming the chrome stage. The `0`: `--release` still exits 1, but only for the other stages. No `⚠` line names a chrome drawing.

- [ ] **Step 6: Notes for the gate-2 README**

Task 12 copies these facts into the README ("What to judge" and "Choices"). Where the chrome IDs show in 1.141:

- `find-previous-match` / `find-next-match`: the find widget, next to the house `close` and the stock `case-sensitive`, `whole-word` and `regex` icons.
- `diff-editor-previous-change` / `diff-editor-next-change`: the diff editor toolbar.
- `quick-input-back`: multi-step quick picks.
- `arrow-left` / `arrow-right`: Go Back / Go Forward in the title bar (command center, Modern UI), and the revert-change arrow between the panes of the side-by-side diff editor.
- `add` / `plus` / `terminal-new`: the chat title, the terminal panel toolbar, and every registered icon whose default is `add` (`keybindings-add`, `watch-expressions-add`, `diff-review-insert`, `ai-customization-add` …).
- `diff-insert` / `diff-remove`: the inline diff gutter indicators (`diffEditor.renderIndicators`, on by default).
- `toolbar-more`: the `…` overflow in every toolbar; `more`: the activity bar overflow (24px, 16px compact) when the bar has more containers than fit; `ellipsis`: Search's "Toggle Search Details" (`search-details` defaults to it).
- `check`: Settings editor boolean checkboxes and multi-select quick-pick checkboxes (the Checkbox/Toggle widget uses `check`), checked rows in action-list dropdowns such as the chat model picker, the chat-editing "Keep" buttons, and the SCM Commit button. Context-menu checkmarks use `menu-selection`, an unpinned alias (`fe("menu-selection","check")`), and stay stock.

Points for the author: the arrow stems are on row or column 7 while the stock arrows use 8; the arrowheads are filled while the stock heads are open; the dots are 3×3 and 13 wide, outside the 10-12 action keyline (alternative `ellipsis.small`).

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_6`
Expected: one 40-character tree id, also saved in `review-out/TREE_6`.

---
## Part D: status batch (19 IDs)

Part D draws the `status` group of spec section 5.2 ("Status and signals"), the dirty-branch sprigs of G6 and the ports dot of G4: 16 drawings, E120-E12F, for 19 IDs, plus one gate variant for `copilot-warning` (decision D5: the drawing is chosen at this gate). The drawings live in `scripts/glyphs/status.mjs`, third in `glyphModules`. Shared silhouettes come from `parts` (Tasks 2 and 4), and every clearance test measures against the live `parts`, so a later change to a base drawing fails a test instead of passing unnoticed.

**Prerequisite:** Tasks 1-6. Before Task 7 the map holds 31 drawings for 71 IDs, `glyphModules` is `[batch1, chrome]`, and `product-batch:status` has 19 pinned keys, all unmapped. After Task 7 the map holds 35 drawings; Task 8 takes it to 40, over the 36 that two icon-sheet views hold at 200% (`the icon sheet shows every drawing at every scale`), so Task 8 first gives the review helper a third view.

**Footprints (spec section 4 keylines):**
- `warning` and `info` replace full-size Codicons in the status bar and the Problems tree, next to the skull (`error`). They use the skull's footprint (x2-14, y2-14), the reading gate 1 accepted for the skull, so the three severities line up.
- `terminal-decoration-error` uses the 8-unit signal keyline (4-12). `terminal-decoration-success` and the ports dot are a 6-unit dot (5-11): G4 and spec 5.2 ask for a "small dot", smaller than the 8-unit moon breakpoint. The README offers the 8-unit alternative.
- The Copilot states keep the cat-head silhouette, so the chat status item does not jump between states.
- `sync` and `loading` are spin-safe about (8,8) (section 4, normative).
- `bell-dot` is the whole bell (unchanged) plus a 5×5 ✦ in the corner Task 4 freed.

**Knockouts.** One drawing (copilot-unavailable) puts an accent across a shared part. A counter-wound "eraser" subpath cannot cut the gap: over empty space it winds to -1, and the font fills any nonzero winding. Task 9 therefore adds `knockOut(paths, region)` to the primitives. It clips the part's subpaths against a convex region (Sutherland-Hodgman) and keeps each piece's winding. That drawing gets soft off-grid warnings at the points where the knockout band (2x - y = 6.75 to 14.25) cuts the head's straight edges. The nearest whole-number band, 2x - y = 7 to 14, leaves 0.89 units around the slash, under 1, and its chin-edge cuts are still off the grid. A wider whole-number band, 6 to 15, leaves 1.34 and two off-grid points but cuts 0.34 more of the head on each side; Task 12's README offers it to the author. Section 8 makes those warnings non-blocking, and Task 12 lists them.

Each drawing task follows the glyph loop: append code, `npm run draw:glyphs`, claim, `npm run build:product-icons`, `node scripts/validate.mjs --only product-pipeline`, `npm test`, glyph sheet procedure. Each task draws only its own drawings: `npm run draw:glyphs` writes an SVG for every drawing in every module, and the build rejects an SVG that no map entry claims (`icons/product-src/<file> belongs to no drawing`), so a later task's drawing must not be present early.

---

### Task 7: Status batch, severity signals (warning, info, terminal decorations)

**Files:**
- Create: `scripts/glyphs/status.mjs`, `test/status-glyphs.test.mjs`, `icons/product-src/{warning-triangle,info-disc,terminal-error,status-dot}.svg` (generated)
- Modify: `scripts/glyphs/index.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: `parts` and `drawings.skull` from `scripts/glyphs/batch-1.mjs`; `disc`, `polygon`, `rect`, `svgDocument`; `filledAt` (Task 3); `claim-drawing.mjs`; the count-free map test (Task 5).
- Produces: the module `scripts/glyphs/status.mjs` (`drawings`, `variants`), third in `glyphModules`; the drawings `warning-triangle` (E120), `info-disc` (E121), `terminal-error` (E122), `status-dot` (E123); `test/status-glyphs.test.mjs` with the helpers `pathsOf`, `box`, `bounds`, `outlinesOf`, `without`, `gap`, which Tasks 8-10 append to.

- [ ] **Step 1: Check the preconditions**

```bash
node -e "import('./scripts/glyphs/batch-1.mjs').then(({ parts, drawings }) => console.log(Object.keys(parts).sort().join(' '), parts.star(8, 8, 5, 1.5) === drawings['dirty-star']().match(/d=\"([^\"]*)\"/)[1]))"
node -e "const p = require('./icons/product-icon-ids.json').ids; console.log(['git-branch-changes', 'git-branch-staged-changes', 'git-branch-conflicts', 'ports-forwarded-with-process-icon'].map((id) => p[id]?.batch).join(' '), Object.values(p).filter((e) => e.batch === 'status').length)"
node scripts/validate.mjs --only product-batch:status 2>&1 | grep -c 'does not map'
node -e "console.log(Object.keys(require('./icons/product-icon-map.json').drawings).length)"
```

Expected: `bell catEyes catHeadOutline sprigSmall star true`, `status status status status 19`, `19`, `31`. If any line differs, stop: Task 1, 2 or 6 has not landed.

- [ ] **Step 2: Write the failing test**

`test/status-glyphs.test.mjs` (the imports and helpers already cover Tasks 8-10):

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings as batchOne, parts } from '../scripts/glyphs/batch-1.mjs';
import { crescent, polygon, svgDocument } from '../scripts/glyphs/primitives.mjs';
import { drawings, variants } from '../scripts/glyphs/status.mjs';
import { filledAt, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers for Tasks 7-10. Clearances are measured on the flattened outlines (curves sampled as in subpaths).
const pathsOf = (svg) => parseGlyphSvg(svg).paths.map((path) => path.d);
const box = (ds) => Object.fromEntries(Object.entries(pathBounds(ds)).map(([key, value]) => [key, Number(value.toFixed(2))]));
const bounds = (svg) => box(pathsOf(svg));
const outlinesOf = (svg) => subpaths(pathsOf(svg).join(''));
const without = (polygons, d) => {
  const removed = subpaths(d).map((poly) => JSON.stringify(poly));
  return polygons.filter((poly) => !removed.includes(JSON.stringify(poly)));
};
const segmentsOf = (polygons) => polygons.flatMap((poly) => poly.map((point, index) => [point, poly[(index + 1) % poly.length]]));
const pointToSegment = ([px, py], [[ax, ay], [bx, by]]) => {
  const [dx, dy] = [bx - ax, by - ay];
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
// Shortest distance between two sets of outlines that do not cross (endpoint-to-segment distances, both ways).
const gap = (a, b) => Math.min(
  ...segmentsOf(a).flatMap(([p, q]) => segmentsOf(b).flatMap((s) => [pointToSegment(p, s), pointToSegment(q, s)])),
  ...segmentsOf(b).flatMap(([p, q]) => segmentsOf(a).flatMap((s) => [pointToSegment(p, s), pointToSegment(q, s)])),
);

// ---- Severity signals (Task 7) ----
test('warning and info use the skull footprint, so the Problems tree and the status bar line up', () => {
  const skull = bounds(batchOne.skull());
  assert.deepEqual(skull, { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  assert.deepEqual(bounds(drawings['warning-triangle']()), skull);
  assert.deepEqual(bounds(drawings['info-disc']()), skull);
});

test('terminal decorations stay inside the 8-unit signal keyline, centred on (8,8)', () => {
  assert.deepEqual(bounds(drawings['terminal-error']()), { minX: 4, maxX: 12, minY: 4, maxY: 12 });
  assert.deepEqual(bounds(drawings['status-dot']()), { minX: 5, maxX: 11, minY: 5, maxY: 11 });
});

test('severity cut-outs are holes under the font fill rule, with ink between and around them', () => {
  // filledAt applies the nonzero rule the font pipeline uses. Two overlapping counter-wound bars in place of the one
  // saltire polygon would wind to -1 at the centre of the ✕ and fill it, which this catches at (8,8).
  const cases = {
    'warning-triangle': { holes: [[8, 8.5], [8, 12]], filled: [[8, 10.5], [6, 13], [8, 4]] }, // ! stem and dot; ink between, beside, above
    'info-disc': { holes: [[8, 5], [8, 9.5]], filled: [[8, 6.5], [4, 8]] }, // i dot and stem; ink between and beside
    'terminal-error': { holes: [[8, 8], [6.5, 6.5], [9.5, 9.5]], filled: [[8, 4.5], [5, 8]] }, // ✕ centre and two arms; disc between arms
  };
  for (const [name, { holes, filled }] of Object.entries(cases)) {
    const paths = pathsOf(drawings[name]());
    for (const point of holes) assert.equal(filledAt(paths, point), false, `${name}: hole at ${point}`);
    for (const point of filled) assert.equal(filledAt(paths, point), true, `${name}: ink at ${point}`);
  }
});
```

Run: `node --test test/status-glyphs.test.mjs 2>&1 | grep -m1 -o 'ERR_MODULE_NOT_FOUND'`
Expected: `ERR_MODULE_NOT_FOUND` (`scripts/glyphs/status.mjs` does not exist yet).

- [ ] **Step 3: Create the module with the severity drawings**

`scripts/glyphs/status.mjs`:

```js
// Status batch (spec section 5.2 "Status and signals"; gate-1 decisions G4 and G6). Tasks 7-10 append to these objects.
import { disc, polygon, rect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

// ---- Severity signals (Task 7) ----
// warning and info replace full-size Codicons in the status bar and the Problems tree next to the skull, so they use
// the skull's footprint (x2-14, y2-14), not the 8-unit signal keyline. The cut-outs are 2 wide, centred on x = 8.
drawings['warning-triangle'] = () => svgDocument(
  polygon([[8, 2], [14, 14], [2, 14]]), // triangle x2-14, y2-14, 2:1 sides
  rect(7, 7, 2, 3, 'ccw'), // ! stem x7-9, y7-10 (starts at y7, where the sides leave a 1.5-unit wall)
  rect(7, 11, 2, 2, 'ccw'), // ! dot x7-9, y11-13, 1 unit above the base
);
drawings['info-disc'] = () => svgDocument(
  disc(8, 8, 6), // disc x2-14, y2-14
  rect(7, 4, 2, 2, 'ccw'), // i dot x7-9, y4-6
  rect(7, 7, 2, 5, 'ccw'), // i stem x7-9, y7-12
);
// Saltire (✕) as one polygon. Two overlapping counter-wound bars would wind to -1 where they cross (disc +1, two holes
// -1 each) and fill that square. (p, q) = (dx + dy, dx - dy); k = half-width, m = arm length, both in that measure.
const saltire = (cx, cy, k, m, dir = 'cw') => polygon(
  [[k, m], [k, k], [m, k], [m, -k], [k, -k], [k, -m], [-k, -m], [-k, -k], [-m, -k], [-m, k], [-k, k], [-k, m]]
    .map(([p, q]) => [cx + (p + q) / 2, cy + (p - q) / 2]),
  dir,
);
// Terminal gutter: 8-unit signal keyline (4-12). The ✕ arms are 1.41 across, like `close`. The first pass followed the
// 2-unit cut-out minimum (k 1.5, arms 2.12 across); at 16px/100% the ✕ closed up and the glyph read as a ring.
drawings['terminal-error'] = () => svgDocument(disc(8, 8, 4), saltire(8, 8, 1, 4, 'ccw')); // ✕ x5.5-10.5, wall >= 1.08
// Small dot (G4): smaller than the 8-unit moon breakpoint so the two never read as the same mark.
drawings['status-dot'] = () => svgDocument(disc(8, 8, 3)); // x5-11, y5-11
```

Replace `scripts/glyphs/index.mjs` with:

```js
import * as batch1 from './batch-1.mjs';
import * as chrome from './chrome.mjs';
import * as status from './status.mjs';

export const glyphModules = [batch1, chrome, status];
```

Run: `node --test test/status-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 3`, `ℹ fail 0`.

- [ ] **Step 4: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs warning-triangle E120 warning dialog-warning
node scripts/claim-drawing.mjs info-disc E121 info dialog-info
node scripts/claim-drawing.mjs terminal-error E122 terminal-decoration-error
node scripts/claim-drawing.mjs status-dot E123 terminal-decoration-success
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:status 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:
- `Wrote 36 glyph SVGs`.
- The claims print `warning-triangle (E120) <- warning, dialog-warning`, `info-disc (E121) <- info, dialog-info`, `terminal-error (E122) <- terminal-decoration-error` and `status-dot (E123) <- terminal-decoration-success`, with no `removed` suffix.
- `Built 35 product icon drawings for 77 icon IDs in icons/witchynibbles-product-icons.woff`.
- The only `⚠` line is the gear's; then `✓ WitchyNibbles package validation passed (enforced: product-pipeline)`.
- The status count is `13`.
- `ℹ tests 193`, `ℹ fail 0` (3 status tests, 4 drift cases).

- [ ] **Step 5: Inspect the sheet**

Run the glyph sheet procedure and read both PNGs. Check:
- at 16px, the `!` and the `i` cut-outs show as two separate holes, not one smudge;
- warning, info and skull have the same height and baseline;
- `terminal-error` reads as a ✕ in a disc at 16px, not as a ring;
- `status-dot` is visibly smaller than `moon-breakpoint`.

At 12px the `!` may merge into one notch; that is accepted, because no surface draws these at 12px.

- [ ] **Step 6: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_7`
Expected: one 40-character tree id, also saved in `review-out/TREE_7`.

---

### Task 8: Status batch, bell-dot, remote, sync, loading, bracket

**Files:**
- Modify: `review/helper-extension/package.json`, `review/helper-extension/extension.js`, `test/review-harness.test.mjs` (the icon sheet gets a third view), `scripts/glyphs/status.mjs`, `test/status-glyphs.test.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)
- Create: `icons/product-src/{bell-dot,moon-gate-small,sync-arrows,loading-crescent,braces}.svg` (generated)

**Interfaces:**
- Consumes: `parts.bell()` and `parts.star()` (Tasks 2 and 4), `crescent`, the Task 7 test helpers.
- Produces: a review helper that fills every icon-sheet view its `package.json` contributes (three, up to 54 drawings at 200%; Task 11 builds on it); the drawings `bell-dot` (E124), `moon-gate-small` (E125), `sync-arrows` (E126), `loading-crescent` (E127) and `braces` (E128).

**Spin-safe (section 4).** VS Code rotates `loading` and `sync` (with the spin modifier) about the element centre. The sync glyph is 180° symmetric about (8,8), so its bounds are centred there. A crescent's bounds can never be centred, because its mass sits on one side, so the loading test pins its outer circle to the r6 circle about (8,8).

- [ ] **Step 1: Give the icon sheet a third view**

In `test/review-harness.test.mjs`, replace

```js
test('the icon sheet shows every drawing at every scale: two side-by-side views in a maximized panel', () => {
  // Gate run 2026-10-10T01-41-22: the single tree in a default-height panel showed 13 rows at 100% and 5 at 200%.
  const helper = json('review/helper-extension/package.json');
  const views = helper.contributes.views.spellboundReview;
  assert.equal(views.length, 2, 'two views share the panel width');
  const source = read('review/helper-extension/extension.js');
  for (const { id } of views) assert.ok(source.includes(`'${id}'`), `extension.js registers ${id}`);
```

with

```js
test('the icon sheet shows every drawing at every scale: side-by-side views in a maximized panel', () => {
  // Gate run 2026-10-10T01-41-22: the single tree in a default-height panel showed 13 rows at 100% and 5 at 200%.
  // Phase 2 passes 36 drawings, the most two views hold at 200%, so the helper contributes three.
  const helper = json('review/helper-extension/package.json');
  const views = helper.contributes.views.spellboundReview;
  assert.ok(views.length >= 2, 'several views share the panel width');
  const source = read('review/helper-extension/extension.js');
  assert.match(source, /require\('\.\/package\.json'\)\.contributes\.views\.spellboundReview/, 'extension.js fills every contributed view');
```

Run: `node --test --test-reporter=tap test/review-harness.test.mjs | grep -E '^not ok|^# (pass|fail)'`
Expected: `not ok 11 - the icon sheet shows every drawing at every scale: side-by-side views in a maximized panel`, `# pass 12`, `# fail 1`.

In `review/helper-extension/package.json`, replace

```json
    "views": { "spellboundReview": [{ "id": "spellboundReview.iconSheet", "name": "Icon sheet" }, { "id": "spellboundReview.iconSheet2", "name": "Icon sheet (cont.)" }] },
```

with

```json
    "views": { "spellboundReview": [
      { "id": "spellboundReview.iconSheet", "name": "Icon sheet" },
      { "id": "spellboundReview.iconSheet2", "name": "Icon sheet (cont.)" },
      { "id": "spellboundReview.iconSheet3", "name": "Icon sheet (end)" }
    ] },
```

In `review/helper-extension/extension.js`, replace the first line's `in two trees,` with `in side-by-side trees,`; add below `const rows = require('./ids.json'); // written by run-gate.mjs: [{ id, label, description }]`

```js
const sheetViews = require('./package.json').contributes.views.spellboundReview.map(({ id }) => id);
```

and replace

```js
  // Two views side by side, so every row fits a maximized panel even at 200%.
  const half = Math.ceil(items.length / 2);
  for (const [id, part] of [['spellboundReview.iconSheet', items.slice(0, half)], ['spellboundReview.iconSheet2', items.slice(half)]]) {
    context.subscriptions.push(vscode.window.registerTreeDataProvider(id, { getTreeItem: (item) => item, getChildren: () => part }));
  }
```

with

```js
  // Side-by-side views (every view package.json contributes), so every row fits a maximized panel even at 200%.
  const perView = Math.ceil(items.length / sheetViews.length);
  sheetViews.forEach((id, index) => {
    const part = items.slice(index * perView, (index + 1) * perView);
    context.subscriptions.push(vscode.window.registerTreeDataProvider(id, { getTreeItem: (item) => item, getChildren: () => part }));
  });
```

Run: `node --check review/helper-extension/extension.js && node --test test/review-harness.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 13`, `ℹ fail 0`.

- [ ] **Step 2: Write the failing drawing tests**

Append to `test/status-glyphs.test.mjs`:

```js

// ---- Bell-dot, remote, sync, loading, bracket (Task 8) ----
const centre = ({ minX, maxX, minY, maxY }) => [(minX + maxX) / 2, (minY + maxY) / 2];

test('sync is balanced about (8,8), so the spin modifier does not wobble it', () => {
  const [cx, cy] = centre(pathBounds(pathsOf(drawings['sync-arrows']())));
  assert.ok(Math.abs(cx - 8) <= 0.05 && Math.abs(cy - 8) <= 0.05, `centre (${cx}, ${cy})`);
});

test('sync maps onto itself under a half turn about (8,8)', () => {
  const key = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;
  const points = outlinesOf(drawings['sync-arrows']()).flat();
  const set = new Set(points.map(key));
  assert.deepEqual(points.filter(([x, y]) => !set.has(key([16 - x, 16 - y]))), []);
});

test('loading: the crescent outer circle is the r6 circle centred on (8,8)', () => {
  const points = outlinesOf(drawings['loading-crescent']()).flat();
  const far = Math.max(...points.map(([x, y]) => Math.hypot(x - 8, y - 8)));
  assert.ok(Math.abs(far - 6) <= 0.05, `farthest point ${far} from (8,8)`);
  const { minX, minY, maxY } = pathBounds(pathsOf(drawings['loading-crescent']()));
  for (const [label, value, expected] of [['minX', minX, 2], ['minY', minY, 2], ['maxY', maxY, 14]]) {
    assert.ok(Math.abs(value - expected) <= 0.05, `${label} ${value}`);
  }
});

test('bell-dot: the whole bell plus a 5x5 ✦ in the free top-right corner, at least 1 unit clear', () => {
  const star = parts.star(12.5, 3.5, 2.5, 1);
  assert.equal(drawings['bell-dot'](), svgDocument(parts.bell(), star), 'the bell itself is untouched');
  assert.deepEqual(box([star]), { minX: 10, maxX: 15, minY: 1, maxY: 6 });
  const clearance = gap(subpaths(star), parts.bell().flatMap((d) => subpaths(d)));
  assert.ok(clearance >= 1 - 1e-9, `clearance ${clearance}`);
});

test('remote, sync and bracket stay on their keylines', () => {
  assert.deepEqual(bounds(drawings['moon-gate-small']()), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  assert.deepEqual(bounds(drawings['sync-arrows']()), { minX: 1.5, maxX: 14.5, minY: 3, maxY: 13 });
  assert.deepEqual(bounds(drawings.braces()), { minX: 3, maxX: 13, minY: 2, maxY: 14 });
});
```

Run: `node --test --test-reporter=tap test/status-glyphs.test.mjs | grep -E '^not ok|  error|^# (pass|fail)'`
Expected:

```
not ok 4 - sync is balanced about (8,8), so the spin modifier does not wobble it
  error: 'drawings.sync-arrows is not a function'
not ok 5 - sync maps onto itself under a half turn about (8,8)
  error: 'drawings.sync-arrows is not a function'
not ok 6 - loading: the crescent outer circle is the r6 circle centred on (8,8)
  error: 'drawings.loading-crescent is not a function'
not ok 7 - bell-dot: the whole bell plus a 5x5 ✦ in the free top-right corner, at least 1 unit clear
  error: 'drawings.bell-dot is not a function'
not ok 8 - remote, sync and bracket stay on their keylines
  error: 'drawings.moon-gate-small is not a function'
# pass 3
# fail 5
```

- [ ] **Step 3: Append the drawings**

In `scripts/glyphs/status.mjs`, replace the import line with:

```js
import { crescent, disc, polygon, rect, svgDocument } from './primitives.mjs';
import { parts } from './batch-1.mjs';
```

and append:

```js

// ---- Bell-dot, remote, sync, loading, bracket (Task 8) ----
const fmt = (value) => Number(value.toFixed(3)).toString();
const pt = ([x, y]) => `${fmt(x)} ${fmt(y)}`;
const mirror = (points) => points.map(([x, y]) => [16 - x, y]); // about x = 8
const halfTurn = (points) => points.map(([x, y]) => [16 - x, 16 - y]); // 180 degrees about (8,8)

// bell-dot: the whole bell (unchanged, so bell and bell-dot swap in the status bar without the outline moving) plus a
// 5x5 ✦ in the corner the bell leaves free (x10-15, y1-6). Clearance: exactly 1 unit to the handle (x9), 1.2 to the
// dome. A 4x4 ✦ read as a speck at 16px/100%.
drawings['bell-dot'] = () => svgDocument(parts.bell(), parts.star(12.5, 3.5, 2.5, 1));

// remote: a small moon gate for the status bar's remote indicator. 2-unit arch (outer r6, inner r4, both centred on
// (8,8)), no feet; the r3 crescent sits concentric inside it with 1 unit of clearance at the top and the left. A
// 2.5-thick crescent filled toward a disc at 16px, so it keeps the 2-unit thickness.
drawings['moon-gate-small'] = () => svgDocument(
  'M2 14V8A6 6 0 0 1 14 8V14H12V8A4 4 0 0 0 4 8V14Z', // arch x2-14, y2-14, clockwise
  crescent({ cx: 8, cy: 8, r: 3, facing: 'right' }), // accent x5-9, y5-11
);

// sync (spin-safe, section 4): two 1-unit ring bands (r4-5 about (8,8)) chasing clockwise, each ending in a filled
// head on the horizontal axis; the second arrow is the first turned 180 degrees about (8,8), so the glyph is balanced.
const at = (r, degrees) => [8 + r * Math.cos((degrees * Math.PI) / 180), 8 + r * Math.sin((degrees * Math.PI) / 180)];
const ringBand = (from, to, inner, outer) =>
  `M${pt(at(outer, from))}A${outer} ${outer} 0 0 1 ${pt(at(outer, to))}L${pt(at(inner, to))}A${inner} ${inner} 0 0 0 ${pt(at(inner, from))}Z`;
const syncHead = [[10.5, 8], [14.5, 8], [12.5, 10.5]]; // 4 wide, centred on the band (x12-13), pointing down
drawings['sync-arrows'] = () => svgDocument(
  ringBand(235, 360, 4, 5), polygon(syncHead), // upper arrow: from the upper left round to the right, head pointing down
  ringBand(55, 180, 4, 5), polygon(halfTurn(syncHead)), // lower arrow: the same turned 180 degrees
);

// loading (spin-safe): a crescent whose outer circle is concentric with (8,8), so VS Code's spin keeps it in place.
drawings['loading-crescent'] = () => svgDocument(crescent({ cx: 8, cy: 8, r: 6, thickness: 3, facing: 'right' })); // x2-9.5, y2-14

// bracket: { } with 1-unit strokes on whole numbers and 45-degree nibs, mirrored about x = 8.
const brace = [[5, 2], [7, 2], [7, 3], [5, 3], [5, 7], [4, 8], [5, 9], [5, 13], [7, 13], [7, 14], [5, 14], [4, 13], [4, 9], [3, 8], [4, 7], [4, 3]];
drawings.braces = () => svgDocument(polygon(brace), polygon(mirror(brace))); // x3-13, y2-14
```

Run: `node --test test/status-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 8`, `ℹ fail 0`. The bell-dot clearance is exactly 1.0 (the handle); on the Task 2 bell, before Task 4 freed the corner, the same star came within 0.08 of the shoulder, so the test catches a bell that grows back into the corner.

- [ ] **Step 4: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs bell-dot E124 bell-dot
node scripts/claim-drawing.mjs moon-gate-small E125 remote
node scripts/claim-drawing.mjs sync-arrows E126 sync
node scripts/claim-drawing.mjs loading-crescent E127 loading
node scripts/claim-drawing.mjs braces E128 bracket
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:status 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:
- `Wrote 41 glyph SVGs`, and the claim lines `bell-dot (E124) <- bell-dot`, `moon-gate-small (E125) <- remote`, `sync-arrows (E126) <- sync`, `loading-crescent (E127) <- loading`, `braces (E128) <- bracket`.
- `Built 40 product icon drawings for 82 icon IDs in icons/witchynibbles-product-icons.woff`.
- Exactly two `⚠` lines, then the `✓ … (enforced: product-pipeline)` line:

```
⚠ icons/product-src/gear.svg straight-segment points off the whole/half grid: (11.182, 3.404) (12.243, 2.343) (13.657, 3.757) (12.596, 4.818) (12.596, 11.182) (13.657, 12.243) …
⚠ icons/product-src/sync-arrows.svg straight-segment points off the whole/half grid: (5.706, 4.723) (5.132, 3.904) (10.294, 11.277) (10.868, 12.096)
```

  The sync points are the band ends at 235° and 55°, where the straight end cut of a ring band meets two arcs; they cannot sit on the grid while the arrow follows the circle.
- The status count is `8`.
- `ℹ tests 203`, `ℹ fail 0` (5 status tests, 5 drift cases).

- [ ] **Step 5: Inspect the sheet**

Run the glyph sheet procedure and check:
- at 16px the ✦ reads as a star beside the bell (not as a '+' speck), and the bell is the same as `bell`;
- the remote gate's crescent stays a crescent (not a sliver) at 16px; the status bar draws it dark on the gold `statusBarItem.remoteBackground`;
- `sync` reads as two arrows chasing round, with both heads visible at 16px;
- the loading crescent is not a sliver at 12px;
- `{ }` keeps visible nibs at 16px.

- [ ] **Step 6: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_8`
Expected: one 40-character tree id, also saved in `review-out/TREE_8`.

---

### Task 9: Status batch, Copilot states (cat-head variants)

**Files:**
- Modify: `scripts/glyphs/primitives.mjs`, `test/glyph-primitives.test.mjs`, `scripts/glyphs/status.mjs`, `test/status-glyphs.test.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)
- Create: `icons/product-src/{cat-slash,cat-asleep,cat-star,cat-warning}.svg`, `icons/product-src-variants/cat-warning.solid.svg` (generated)

**Interfaces:**
- Consumes: `parts.catHeadOutline()`, `parts.catEyes()` (`[left, right]`), `parts.star()`, `drawings['cat-head']`, `crescent`, `subpaths`, `signedArea`.
- Produces: `knockOut(paths, region)` in `scripts/glyphs/primitives.mjs`. `region` is an array of half-planes `[a, b, c]` meaning `a*x + b*y >= c`, whose intersection is the convex area to remove; the return value is an array of path strings (inputs that do not reach the region come back unchanged; the others come back as flattened pieces that keep their winding). The drawings `cat-slash` (E129), `cat-asleep` (E12A), `cat-star` (E12B), `cat-warning` (E12C), and the gate variant `cat-warning.solid`, which `run-gate.mjs` passes as `--variant=cat-warning=…` so the variants VSIX swaps it in for `cat-warning` (Task 11 shows it in a status bar).

**Decision D5:** `copilot-unavailable`, `-snooze`, `-dot` and `-warning` are cat-head variants: a slash, closed eyes, a star, and a warning drawing decided at this gate. Where VS Code shows them (1.141 bundle, chat status entry): `copilot-unavailable` when chat is disabled or untrusted, and by default in Markdown and plain-text files; `copilot-snooze` while completions are snoozed; `copilot-dot` while a chat promotion is unseen (`showPip`); `copilot-warning` when the quota is reached, with the prominent background.

The warning candidates for the author: **A** (main, `cat-warning`): the outline cat with its eyes replaced by a `!` in the house cut-out proportions. **B** (variant, `cat-warning.solid`): a solid cat head with the `!` cut out, louder than the outline cats, which suits a warning. Rejected while drawing, at 16px/100%: a warning triangle inside the outline face (reads as a nose; a `!` cut out of it would be a 1-unit slot under 4 long, which section 4 forbids), and Codicon's own layout, a triangle badge in the lower right with the head knocked out around it (the head broke into pieces). Two readings of spec 5.2 changed while drawing and go to the README: `copilot-unavailable` keeps one eye (the knockout band around the slash takes the whole right eye); `copilot-dot` keeps both eyes and adds a ✦ pip between the ears (a ✦ in place of the eyes read as a '+' on the face).

- [ ] **Step 1: Write the failing knockOut test**

In `test/glyph-primitives.test.mjs`, change the primitives import to

```js
import { crescent, disc, frame, knockOut, leaf, polygon, rect, ring, roundRect, svgDocument } from '../scripts/glyphs/primitives.mjs';
```

and append:

```js

test('knockOut removes a convex region, keeps holes as holes and leaves other paths untouched', () => {
  const region = [[1, 0, 7], [0, -1, -5]]; // x >= 7 and y <= 5: the frame's top-right corner
  const far = rect(12, 12, 2, 2);
  const kept = knockOut([frame(2, 2, 8, 8, { r: 0 }), far], region);
  assert.equal(kept.at(-1), far);
  assert.deepEqual(kept.slice(0, -1).map((d) => Math.sign(signedArea(subpaths(d)[0]))), [1, 1, -1, -1], 'two solid pieces, two hole pieces');
  assert.deepEqual(windingProblems([kept.join('')]), []);
  assert.deepEqual(glyphRuleProblems(svgDocument(kept)).errors, []);
  assert.deepEqual(subpaths(kept.join('')).flat().filter(([x, y]) => x > 7 + 1e-9 && y < 5 - 1e-9), []);
  assert.deepEqual(roundedBounds(kept.join('')), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  // The wall pieces left of x = 7 and below y = 5 are still there: the frame is open only at the corner.
  assert.deepEqual(roundedBounds(kept.slice(0, -1).join('')), { minX: 2, maxX: 10, minY: 2, maxY: 10 });
});
```

Run: `node --test test/glyph-primitives.test.mjs 2>&1 | grep -m1 SyntaxError`
Expected: `SyntaxError: The requested module '../scripts/glyphs/primitives.mjs' does not provide an export named 'knockOut'`.

- [ ] **Step 2: Add knockOut to the primitives**

In `scripts/glyphs/primitives.mjs`, change the geometry import to `import { signedArea, subpaths } from '../lib/svg-geometry.mjs';` and append:

```js

// Sutherland-Hodgman clip of one closed polygon against the half-plane a*x + b*y >= c. The result keeps the winding.
function clipHalfPlane(points, [a, b, c]) {
  const side = ([x, y]) => a * x + b * y - c;
  const out = [];
  points.forEach((q, index) => {
    const p = points.at(index - 1);
    const [sp, sq] = [side(p), side(q)];
    if ((sp >= 0) !== (sq >= 0)) {
      const t = sp / (sp - sq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
    if (sq >= 0) out.push(q);
  });
  return out;
}

const polygonArea = (points) => (points.length < 3 ? 0 : Math.abs(signedArea(points)));

// Knockout: removes the convex region where every half-plane [a, b, c] (a*x + b*y >= c) holds, so an accent can sit in
// a gap cut out of a shared part. Path strings that do not reach the region come back unchanged. The others are
// flattened (arcs become short straight segments) and split into disjoint pieces, one per half-plane, each keeping
// the winding of its source subpath, so solids stay solid and holes stay holes. A counter-wound "eraser" subpath
// cannot do this: over empty space it winds to -1, and the font pipeline fills any nonzero winding.
export function knockOut(paths, region) {
  return [paths].flat(Infinity).flatMap((d) => {
    const polygons = subpaths(d);
    if (polygons.every((poly) => polygonArea(region.reduce(clipHalfPlane, poly)) < 1e-6)) return [d];
    return polygons
      .flatMap((poly) => region.map(([a, b, c], index) => [...region.slice(0, index), [-a, -b, -c]].reduce(clipHalfPlane, poly)))
      .filter((piece) => polygonArea(piece) > 1e-6)
      .map((piece) => `M${piece.map(pt).join('L')}Z`);
  });
}
```

(`pt` is the existing point formatter at the top of `primitives.mjs`.)

Run: `node --test test/glyph-primitives.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 5`, `ℹ fail 0`.

- [ ] **Step 3: Write the failing Copilot tests**

Append to `test/status-glyphs.test.mjs`:

```js

// ---- Copilot states (Task 9) ----
test('copilot states keep the cat-head silhouette, so the status item does not jump', () => {
  const head = bounds(batchOne['cat-head']());
  assert.deepEqual(bounds(drawings['cat-asleep']()), head);
  assert.deepEqual(bounds(drawings['cat-warning']()), head);
  assert.deepEqual(bounds(variants['cat-warning.solid']()), head);
  assert.deepEqual(bounds(drawings['cat-star']()), { ...head, minY: 1 }); // the pip rises to y1
  assert.deepEqual(bounds(drawings['cat-slash']()), { ...head, minY: 1 }); // the slash runs y1-15
});

test('copilot-unavailable: a slash 1 unit clear of the knocked-out head and of the left eye', () => {
  const slash = polygon([[5, 1], [6.5, 1], [13.5, 15], [12, 15]]);
  const all = outlinesOf(drawings['cat-slash']());
  const rest = without(all, slash);
  assert.equal(rest.length, all.length - 1, 'the slash appears once');
  const [leftEye] = parts.catEyes();
  assert.equal(without(rest, leftEye).length, rest.length - 1, 'the left eye is drawn whole');
  const clearance = gap(subpaths(slash), rest);
  assert.ok(clearance >= 1 - 1e-9, `clearance ${clearance}`);
});

test('copilot-snooze: the closed lids keep 1 unit from the head wall and from each other', () => {
  const lids = [crescent({ cx: 5.75, cy: 9, r: 1.75, thickness: 2, facing: 'up' }), crescent({ cx: 10.25, cy: 9, r: 1.75, thickness: 2, facing: 'up' })];
  const head = parts.catHeadOutline().flatMap((d) => subpaths(d));
  for (const lid of lids) assert.ok(gap(subpaths(lid), head) >= 1 - 1e-3, 'lid to head');
  assert.ok(gap(subpaths(lids[0]), subpaths(lids[1])) >= 1 - 1e-3, 'lid to lid');
  assert.equal(drawings['cat-asleep'](), svgDocument(parts.catHeadOutline(), lids));
});

test('copilot-dot: the ✦ pip sits between the ears on pixel column 7, 1 unit above the head', () => {
  const pip = parts.star(7.5, 2.5, 1.5, 0.5);
  assert.equal(drawings['cat-star'](), svgDocument(parts.catHeadOutline(), parts.catEyes(), pip), 'the cat head and both eyes, unchanged, plus the pip');
  assert.deepEqual(box([pip]), { minX: 6, maxX: 9, minY: 1, maxY: 4 }); // pixel column 7 (section 4)
  const clearance = gap(subpaths(pip), without(outlinesOf(drawings['cat-star']()), pip));
  assert.ok(clearance >= 1 - 1e-9, `clearance ${clearance}`);
});

test('copilot-warning goes to the gate with a main drawing and one variant, each "!" 1 unit inside the head', () => {
  const bang = [polygon([[7, 7], [9, 7], [9, 10], [7, 10]]), polygon([[7, 11], [9, 11], [9, 13], [7, 13]])];
  assert.equal(drawings['cat-warning'](), svgDocument(parts.catHeadOutline(), bang));
  assert.ok(gap(subpaths(bang.join('')), parts.catHeadOutline().flatMap((d) => subpaths(d))) >= 1 - 1e-9, 'main: "!" to head wall');
  assert.deepEqual(Object.keys(variants), ['cat-warning.solid']);
  const solid = outlinesOf(variants['cat-warning.solid']());
  assert.equal(solid.length, 3, 'one solid head, two cut-outs');
  const [head, ...cuts] = solid;
  assert.ok(cuts.every((cut) => gap([cut], [head]) >= 1 - 1e-9), 'variant: each cut-out leaves a 1-unit wall');
});
```

Run: `node --test --test-reporter=tap test/status-glyphs.test.mjs | grep -E '^not ok|  error|^# (pass|fail)'`
Expected:

```
not ok 9 - copilot states keep the cat-head silhouette, so the status item does not jump
  error: 'drawings.cat-asleep is not a function'
not ok 10 - copilot-unavailable: a slash 1 unit clear of the knocked-out head and of the left eye
  error: 'drawings.cat-slash is not a function'
not ok 11 - copilot-snooze: the closed lids keep 1 unit from the head wall and from each other
  error: 'drawings.cat-asleep is not a function'
not ok 12 - copilot-dot: the ✦ pip sits between the ears on pixel column 7, 1 unit above the head
  error: 'drawings.cat-star is not a function'
not ok 13 - copilot-warning goes to the gate with a main drawing and one variant, each "!" 1 unit inside the head
  error: 'drawings.cat-warning is not a function'
# pass 8
# fail 5
```

- [ ] **Step 4: Append the drawings**

In `scripts/glyphs/status.mjs`, change the primitives import to `import { crescent, disc, knockOut, polygon, rect, svgDocument } from './primitives.mjs';` and append:

```js

// ---- Copilot status (Task 9): cat-head variants (decision D5) ----
// copilot-unavailable: the cat crossed out. The slash runs at 2:1 (x5-13.5, y1-15), right of centre, so the knockout
// band around it takes the whole right eye and leaves both ear tips and the whole left eye; a 45-degree slash through
// the centre cut the left ear off, and without eyes the head read as a tulip. The band |2x - y - 10.5| < 3.75 leaves
// (3.75 - 1.5) / sqrt(5) = 1.006 units on each side of the slash (exactly sqrt(5) would land at 0.99997 after the
// 3-decimal rounding of the cut points). The right eye (2x - y from 6.81 to 14.19) falls inside the band and is left
// out; the left eye (2x - y at most 5.19) stays 1.71 clear.
const slash = [[5, 1], [6.5, 1], [13.5, 15], [12, 15]]; // |2x - y - 10.5| <= 1.5: 1.5 wide on each row, 1.34 across the stroke
drawings['cat-slash'] = () => svgDocument(knockOut(parts.catHeadOutline(), [[2, -1, 6.75], [-2, 1, -14.25]]), parts.catEyes()[0], polygon(slash));

// copilot-snooze: closed eyes, drawn as lids (2-unit crescents opening upward) on the eye footprint (x4-7.5, x8.5-12).
// Slits (3x1 bars) read as a flat stare at 16px; the lids read as asleep. 1.0 clear of the head wall and of each other.
drawings['cat-asleep'] = () => svgDocument(
  parts.catHeadOutline(),
  crescent({ cx: 5.75, cy: 9, r: 1.75, thickness: 2, facing: 'up' }), // left lid x4-7.5, y8-10.75
  crescent({ cx: 10.25, cy: 9, r: 1.75, thickness: 2, facing: 'up' }), // right lid x8.5-12
);

// copilot-dot (shown while a chat promotion is unseen): the cat with its eyes, plus a ✦ pip between the ears
// (glossary: ✦ = needs attention), where Codicon puts its dot. A ✦ in place of the eyes read as a '+' on the face.
// The pip is 3 wide, so it sits on pixel column 7 (x6-9, section 4), 1 unit above the head.
drawings['cat-star'] = () => svgDocument(parts.catHeadOutline(), parts.catEyes(), parts.star(7.5, 2.5, 1.5, 0.5)); // pip x6-9, y1-4

// copilot-warning (quota reached; prominent status item): decided at gate 2 (D5).
// Main: a '!' in place of the eyes, in the house cut-out proportions (2-unit stem and dot on x7-9), 1 unit inside the wall.
drawings['cat-warning'] = () => svgDocument(parts.catHeadOutline(), rect(7, 7, 2, 3), rect(7, 11, 2, 2));
// Variant: a solid cat head with the '!' cut out (stem 2x5 at x7-9, y6-11; dot 2x2 at y12-14), louder than the outline
// cats, which suits a warning. 1 unit of head stays solid above (y5), between and below (chin y15). A warning triangle
// inside the outline head read as a nose, and Codicon's lower-right badge left the head in broken pieces at 16px.
variants['cat-warning.solid'] = () => svgDocument(
  polygon([[2, 2], [6, 5], [10, 5], [14, 2], [14, 12], [11, 15], [5, 15], [2, 12]]), // the head silhouette, filled
  rect(7, 6, 2, 5, 'ccw'), // ! stem
  rect(7, 12, 2, 2, 'ccw'), // ! dot
);
```

Run: `node --test test/status-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 13`, `ℹ fail 0`. Measured: slash to head 1.006, slash to left eye 1.706, lids 1.001 to the head and to each other, pip 1.000 to the head, main `!` 1.000 to the inner wall.

- [ ] **Step 5: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs cat-slash E129 copilot-unavailable
node scripts/claim-drawing.mjs cat-asleep E12A copilot-snooze
node scripts/claim-drawing.mjs cat-star E12B copilot-dot
node scripts/claim-drawing.mjs cat-warning E12C copilot-warning
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:status 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
ls icons/product-src-variants
```

Expected:
- `Wrote 46 glyph SVGs` (44 drawings, 2 variants), and the claim lines `cat-slash (E129) <- copilot-unavailable`, `cat-asleep (E12A) <- copilot-snooze`, `cat-star (E12B) <- copilot-dot`, `cat-warning (E12C) <- copilot-warning`.
- `Built 44 product icon drawings for 86 icon IDs in icons/witchynibbles-product-icons.woff`.
- Exactly these three `⚠` lines, then `✓ WitchyNibbles package validation passed (enforced: product-pipeline)`, and no `✗` line. The `cat-slash` points are where the knockout band cuts the head's straight edges (`(5.8, 4.85)` is on the left ear edge, at 2x - y = 6.75). `cat-asleep`, `cat-star` and `cat-warning` have no warning (the snapped head is on the half grid).

```
⚠ icons/product-src/cat-slash.svg straight-segment points off the whole/half grid: (5.8, 4.85) (10.875, 15) (9.625, 5) (13.417, 12.583) (10.375, 14) (6.375, 6) …
⚠ icons/product-src/gear.svg straight-segment points off the whole/half grid: (11.182, 3.404) (12.243, 2.343) (13.657, 3.757) (12.596, 4.818) (12.596, 11.182) (13.657, 12.243) …
⚠ icons/product-src/sync-arrows.svg straight-segment points off the whole/half grid: (5.706, 4.723) (5.132, 3.904) (10.294, 11.277) (10.868, 12.096)
```

- The status count is `4`.
- `ℹ tests 214`, `ℹ fail 0` (1 knockOut test, 5 status tests, 4 drawing and 1 variant drift cases).
- `cat-warning.solid.svg` and `ellipsis.small.svg`.

- [ ] **Step 6: Inspect the sheet**

Run the glyph sheet procedure; the variant rows come after the drawings. Check at 16px that:
- all four read as the cat from `copilot`, with the slashed cat keeping both ears and its left eye;
- the lids read as closed eyes, not as a frown;
- the pip is a visible mark above the head;
- both `copilot-warning` candidates read as an alerting cat.

Do not choose between the two warning candidates; the author picks at the gate.

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_9`
Expected: one 40-character tree id, also saved in `review-out/TREE_9`.

---

### Task 10: Status batch, dirty-branch sprigs and the ports dot; close the batch

**Files:**
- Modify: `scripts/glyphs/status.mjs`, `test/status-glyphs.test.mjs`, `test/glyph-grid.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `scripts/validation-stage.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated), `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (section 5.2, "Status and signals")
- Create: `icons/product-src/{sprig-changes,sprig-staged,sprig-conflicts}.svg` (generated)

**Interfaces:**
- Consumes: `parts.sprigSmall()`, `parts.star()`, the `status-dot` drawing (E123).
- Produces: the drawings `sprig-changes` (E12D), `sprig-staged` (E12E) and `sprig-conflicts` (E12F); `ports-forwarded-with-process-icon` on E123; the `product-batch:status` stage enforced by `npm run validate`; a grid test over every module that pins the drawings allowed off the grid (`gear`, `sync-arrows`, `cat-slash`).

**Decision G6, and the badge choice.** The git extension (1.141 `extensions/git/dist/main.js`, Task 1 Step 1) picks the branch icon in this order: `git-branch-conflicts` during a merge or rebase, then `git-branch-staged-changes` when the index is not empty, then `git-branch-changes` when the working tree or untracked files are dirty, otherwise `git-branch`. Codicon draws each as the branch plus a 7-unit disc badge in the lower right (x9-16, y9-16) with the symbol cut out: ✱, + and !. These drawings keep that corner (x9-15, y9-15) but use a solid symbol without a disc: the small sprig's branch band (x + y = 19) and the bulge of its tip leaf leave room only for a disc of r ≤ 2.8 at 1 unit of clearance, too small to hold a cut-out symbol at 16px. The badges:
- changes = ✦ (glossary: ✦ = changed; witchyterm's git dirty mark);
- staged = ✓, "ready to commit", chosen over Codicon's + because the ✦ at this size already reads close to a '+', and the ✓ is the only one of the three with a diagonal silhouette, so the three states stay apart at 16px;
- conflicts = !, "needs resolving", the mark of the warning triangle.

**Decision G4:** `ports-forwarded-with-process-icon` (registered, default `circle-filled`) takes the `terminal-decoration-success` small dot. Re-claiming E123 with both IDs keeps the codepoint, so no codepoint is retired.

- [ ] **Step 1: Write the failing tests**

Append to `test/status-glyphs.test.mjs`:

```js

// ---- Dirty-branch sprigs (Task 10) ----
test('dirty-branch sprigs: one badge each in the lower-right corner, 1 unit clear of the sprig', () => {
  const sprig = subpaths(parts.sprigSmall().join(''));
  const badges = new Set();
  for (const name of ['sprig-changes', 'sprig-staged', 'sprig-conflicts']) {
    const badge = without(outlinesOf(drawings[name]()), parts.sprigSmall().join(''));
    assert.equal(outlinesOf(drawings[name]()).length, sprig.length + badge.length, `${name} keeps the whole sprig`);
    const { minX, maxX, minY, maxY } = pathBounds(badge.map((poly) => `M${poly.map(([x, y]) => `${x} ${y}`).join('L')}Z`));
    assert.ok(minX >= 9 && maxX <= 15 && minY >= 9 && maxY <= 15, `${name} badge ${minX}-${maxX} x ${minY}-${maxY}`);
    const clearance = gap(badge, sprig);
    assert.ok(clearance >= 1 - 1e-9, `${name} clearance ${clearance}`);
    badges.add(JSON.stringify(badge));
  }
  assert.equal(badges.size, 3);
});
```

Append to `test/product-icon-theme.test.mjs`:

```js

test('every status-batch ID is mapped; the aliases and the ports dot share their drawings', () => {
  const status = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'status').map(([id]) => id);
  assert.equal(status.length, 19);
  for (const id of status) assert.ok(id in theme.iconDefinitions, id);
  const glyph = (id) => theme.iconDefinitions[id].fontCharacter;
  assert.equal(glyph('dialog-warning'), glyph('warning'));
  assert.equal(glyph('dialog-info'), glyph('info'));
  assert.equal(glyph('ports-forwarded-with-process-icon'), glyph('terminal-decoration-success'));
});
```

In `test/glyph-grid.test.mjs` (Task 4), add below the `drawings` import

```js
import { glyphModules } from '../scripts/glyphs/index.mjs';
```

and append

```js

test('across every module, only gear, sync-arrows and cat-slash have off-grid straight-segment points (G3)', () => {
  // gear: the corners of the 45-degree teeth (Task 4); sync-arrows: the band ends at 235 and 55 degrees (Task 8);
  // cat-slash: where the knockout band cuts the head's straight edges (Task 9). Every other drawing stays on the grid.
  const offGridDrawings = glyphModules.flatMap(({ drawings: all }) => Object.entries(all))
    .filter(([, draw]) => parseGlyphSvg(draw()).paths.some((path) => offGridPoints(path.d).length > 0))
    .map(([name]) => name);
  assert.deepEqual(offGridDrawings, ['gear', 'sync-arrows', 'cat-slash']);
});
```

This test passes already: cat-slash (Task 9) is the last drawing with off-grid points, and the test keeps the sprigs and every later drawing on the grid.

Run: `node --test --test-reporter=tap test/status-glyphs.test.mjs test/product-icon-theme.test.mjs test/glyph-grid.test.mjs | grep -E '^not ok|  error|^# (pass|fail)'`
Expected:

```
not ok 30 - every status-batch ID is mapped; the aliases and the ports dot share their drawings
  error: 'git-branch-changes'
not ok 44 - dirty-branch sprigs: one badge each in the lower-right corner, 1 unit clear of the sprig
  error: 'drawings[name] is not a function'
# pass 42
# fail 2
```

- [ ] **Step 2: Append the drawings**

Append to `scripts/glyphs/status.mjs`:

```js

// ---- Dirty-branch sprigs (Task 10, decision G6) ----
// The git extension swaps git-branch for these whenever the repository is dirty. Each is the small sprig plus one solid
// badge in the free lower-right corner (x9-15, y9-15), where Codicon puts its badges. The sprig leaves no room for a
// Codicon-style disc badge: a disc that clears the branch by 1 unit has r <= 2.8, too small for a cut-out symbol.
// Every badge stays at least 1 unit clear of the branch band (x + y = 19) and of the bulge of the tip leaf, whose arc
// comes down to about (12, 8): a 6x6 ✦ centred on (12,12) came within 0.96 of it.
const dirtyBadges = {
  changes: parts.star(12.5, 12.5, 2.5, 1), // ✦ x10-15, y10-15: glossary ✦ = changed (witchyterm's git dirty mark)
  staged: polygon([[10, 12], [11, 11], [12, 12], [14, 10], [15, 11], [12, 14]]), // ✓ x10-15, y10-14: ready to commit
  conflicts: [rect(13, 9, 2, 3), rect(13, 13, 2, 2)], // ! x13-15, y9-15: needs resolving, as in warning
};
drawings['sprig-changes'] = () => svgDocument(parts.sprigSmall(), dirtyBadges.changes);
drawings['sprig-staged'] = () => svgDocument(parts.sprigSmall(), dirtyBadges.staged);
drawings['sprig-conflicts'] = () => svgDocument(parts.sprigSmall(), dirtyBadges.conflicts);
```

Run: `node --test test/status-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 14`, `ℹ fail 0`. Measured clearances: changes 2.01, staged 2.12, conflicts 1.15.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs sprig-changes E12D git-branch-changes
node scripts/claim-drawing.mjs sprig-staged E12E git-branch-staged-changes
node scripts/claim-drawing.mjs sprig-conflicts E12F git-branch-conflicts
node scripts/claim-drawing.mjs status-dot E123 terminal-decoration-success ports-forwarded-with-process-icon
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:status 2>&1 | grep -E '^✗|^✓'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:
- `Wrote 49 glyph SVGs`.
- The claims print `sprig-changes (E12D) <- git-branch-changes`, `sprig-staged (E12E) <- git-branch-staged-changes`, `sprig-conflicts (E12F) <- git-branch-conflicts` and `status-dot (E123) <- terminal-decoration-success, ports-forwarded-with-process-icon`. None prints `removed`, and `retiredCodepoints` does not change.
- `Built 47 product icon drawings for 90 icon IDs in icons/witchynibbles-product-icons.woff`.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ … (enforced: product-pipeline)`.
- `✓ WitchyNibbles package validation passed (enforced: product-batch:status)`.
- `ℹ tests 220`, `ℹ fail 0` (1 sprig test, 1 status coverage test, 1 grid test, 3 drift cases).

- [ ] **Step 4: Enforce the status stage**

Replace `scripts/validation-stage.json` with:

```json
{
  "$comment": "Stages that npm run validate enforces. Phases append stage names as their work lands; validate --release enforces every stage.",
  "enforce": ["base", "color-themes", "product-pipeline", "product-batch:1", "product-batch:chrome", "product-batch:status"]
}
```

Run: `npm run validate 2>&1 | grep -v '^>' | grep .`
Expected:

```
… 101 pending problems in stages not yet enforced: product-batch:editor (33), product-batch:panel (9), product-batch:debug (23), product-batch:symbols (15), release (2), file-icons (19) (use --verbose to list)
⚠ icons/product-src/cat-slash.svg straight-segment points off the whole/half grid: (5.8, 4.85) (10.875, 15) (9.625, 5) (13.417, 12.583) (10.375, 14) (6.375, 6) …
⚠ icons/product-src/gear.svg straight-segment points off the whole/half grid: (11.182, 3.404) (12.243, 2.343) (13.657, 3.757) (12.596, 4.818) (12.596, 11.182) (13.657, 12.243) …
⚠ icons/product-src/sync-arrows.svg straight-segment points off the whole/half grid: (5.706, 4.723) (5.132, 3.904) (10.294, 11.277) (10.868, 12.096)
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status)
```

Run: `node -e "const m=require('./icons/product-icon-map.json').drawings; console.log(Object.entries(m).filter(([,d])=>/^E12[0-9A-F]$/.test(d.codepoint)).length, Object.keys(m).length)"`
Expected: `16 47`.

- [ ] **Step 5: Inspect the sheet**

Run the glyph sheet procedure and check:
- at 16px the three sprigs differ at a glance: ✦, ✓ and !;
- no badge touches the branch or its tip leaf;
- `status-dot` now lists both IDs.

- [ ] **Step 6: Update spec section 5.2 (G4, G6)**

In `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`, in the "Status and signals" table, replace the row

```markdown
| `terminal-decoration-success` | small dot | dot |
```

with

```markdown
| `terminal-decoration-success`, `ports-forwarded-with-process-icon` | small dot, 6 units (gate 1, G4) | dot |
```

and insert directly below the row ``| `git-branch` | small herb sprig | leaves |``:

```markdown
| `git-branch-changes` / `git-branch-staged-changes` / `git-branch-conflicts` | small herb sprig with a solid ✦ / ✓ / ! badge in the lower right (gate 1, G6) | badge |
```

Run: `grep -n -A1 '^| .git-branch. |' docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md && grep -c 'ports-forwarded-with-process-icon. | small dot' docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`
Expected: the `git-branch` row followed by the new sprig-variants row, then `1`.

- [ ] **Step 7: Notes for the gate-2 README**

Task 12 copies these into the README:

- Decision for the author, D5 `copilot-warning`: candidate A (`cat-warning`, a `!` in place of the eyes) or candidate B (`cat-warning.solid`, a solid head with the `!` cut out).
- Choices the author may overrule: warning and info sit on the skull's footprint (x2-14), not the 8-unit signal keyline; the `terminal-decoration-error` ✕ is a 1.41-wide cut-out, under the 2-unit cut-out minimum (the 2.12 version closed into a ring at 16px/100%); `terminal-decoration-success` and `ports-forwarded-with-process-icon` are a 6-unit dot (5-11), off the 8-unit signal keyline and smaller than `terminal-decoration-error` (4-12), the alternative being `disc(8, 8, 4)`, the outline of `moon-breakpoint`; bell-dot is the whole bell plus a 5×5 ✦ exactly 1 unit from the handle; `remote` keeps the 2-unit crescent thickness (2.5 filled toward a disc at 16px); copilot-unavailable keeps one eye (the slash takes the right eye; spec 5.2 lists the eyes as the filled part); copilot-dot keeps the eyes and adds a 3×3 ✦ pip on column 7 (spec 5.2 says "star"); copilot-snooze draws closed eyes as 2-unit lids; the dirty-branch sprigs carry a solid ✦ / ✓ / ! in Codicon's badge corner with no disc, and staged is ✓ where Codicon uses +; the `bracket` nibs and corner chamfers are 0.71-unit 45° necks, under section 4's 1-unit minimum (a whole-pixel brace read as [ ] at 16px).
- Off-grid points accepted under G3: the `sync-arrows` band ends at 235° and 55° (arc ends), the `cat-slash` cut points, where the knockout band (2x - y = 6.75 to 14.25) cuts the head's straight edges (band edges on the half grid, 2x - y = 7 to 14, would leave 0.89 units around the slash, under 1, and the chin-edge cuts would still be off the grid).

- [ ] **Step 8: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_10`
Expected: one 40-character tree id, also saved in `review-out/TREE_10`.

---
## Part E: review gate 2 (chrome and status batches, the G7 redraws, G3 snapping)

### How each gate-2 glyph is brought on screen (checked while writing this plan)

The phase-1 harness reaches only the states gate 1 needed. Gate 2's glyphs mostly appear in states a fresh session does not show, so this part adds scenes, chords, helper commands and fixture changes. The harness was run once against VS Code 1.141.0 (`2a59476c9b`) from a scratch copy of the repo with every task of this plan applied, main pass at 100%, all 12 scenes, 4 themes: `168 captures, 0 warnings`, `22 contact sheets`, about 3 minutes of capture. The captures named under Task 11 Step 7 were opened and showed what that step lists. That run predates the three waits that are now required (see Self-review, Not checked while writing); Task 11 Step 7 is the first run that exercises them.

| Glyph IDs | State needed | How the gate reaches it |
| :- | :- | :- |
| `git-branch-changes` | working tree or untracked changes | the fixture as `run-gate.mjs` leaves it (spells.ts modified, new-spell.ts untracked); every scene's status bar |
| `git-branch-staged-changes` | non-empty index | `spellboundReview.scm` `"staged"` stages spells.ts through the git extension API (`repository.add`) |
| `git-branch-conflicts` | merge in progress | `spellboundReview.scm` `"conflict"` runs `repository.merge('rival-brew')`; `run-gate.mjs` commits a `rival-brew` branch that conflicts with `moonlit-review` on README.md. `"changes"` aborts the merge and unstages, in each teardown |
| `sync` | branch with an upstream | `run-gate.mjs` pushes the fixture branch to a bare `../origin.git` (relative URL, so both WSL git and Windows git resolve it); the status bar shows the sync item instead of Publish Branch |
| `error`, `warning`, `info` (Problems, status bar, toasts) | diagnostics of each severity; notifications of each severity | the helper puts one error, one warning and one info on notes.md at startup; `spellboundReview.severities` raises one toast of each |
| `bell-dot` | an unread notification | any toast while the notification center is closed |
| `terminal-decoration-success`, `-error` | shell integration | VS Code 1.141 injects shell integration on Windows only into `powershell.exe`/`pwsh.exe` with no args or just `-NoLogo`, and into Git Bash (`ptyHostMain.js`); `wsl.exe` gets none, so the gate-1 fish terminal had no decorations. A review-only profile, `Spellbound PowerShell`, runs `Write-Output 'moonwater brews'` (success) and `Get-Item no-such-spell` (error). The author's PowerShell profile (starship) loads; shell integration wraps its prompt |
| `remote` | none | the remote indicator is always at the left of the status bar |
| `find-previous-match`, `find-next-match` | find widget open | `actions.find` on spells.ts, typing `potion` |
| `diff-insert`, `diff-remove`, `diff-editor-previous-change`, `-next-change` | diff editor with an edit and a removal | `git.openChange` on spells.ts; `run-gate.mjs` also edits line 1 of spells.ts, so the diff has a removed and an inserted line |
| `quick-input-back`, `check` | multi-step quick pick | `spellboundReview.quickInput` shows step 2 of 3 with the Back button and two checked items. `check` also shows on the SCM Commit button in the `scm-staged` scene |
| `gutter-lightbulb-*`, `lightbulb-sparkle` | a quick fix on an unindented line between unindented lines; a quick fix on an indented line | the fixture gains lines 15-17 in spells.ts (`summonCharm()` on line 16 is a missing function), and the `bulb-gutter` scene puts the cursor on it; the `workbench` scene keeps the cursor on line 11, whose bulb is drawn inline on line 10 |
| `copilot-unavailable`, `-snooze`, `-dot`, `-warning` | a signed-in Copilot in the right state | not reachable: the review profile is signed out, and then the chat status entry always shows `$(copilot)`. `spellboundReview.statusSignals` shows a status bar entry with the four `$(…)` icons instead, rendered by the same status bar code |
| `loading`, `sync` spinning | work in progress | the same toggle shows `$(loading~spin) $(sync~spin)`; each capture catches one frame, so the four theme rows show four angles, a direct check of the spin-safe rule |
| `add`, `plus`, `terminal-new`, `toolbar-more`, `ellipsis`, `arrow-left`, `arrow-right`, `close`, `bracket` | none | chat title (`add`), terminal toolbar, every view title (`toolbar-more`), title bar navigation (arrows), the language status `{ }` in the status bar |
| all of the above, plus `ports-forwarded-with-process-icon`, the owl and the moon gate | none | the icon sheet lists every drawing at 16px |

---

### Task 11: Gate-2 harness: scenes, chords, helper commands and fixture states

**Files:**
- Create: `review/jobs/gate-2.json`
- Modify: `test/review-harness.test.mjs`, `review/helper-extension/extension.js`, `review/helper-extension/package.json`, `review/helper-extension/README.md`, `review/profile/keybindings.json`, `review/profile/settings.base.json`, `review/workspace/spells.ts`, `scripts/review/run-gate.mjs`, `scripts/review/capture.mjs` (comment only)

**Interfaces:**
- Consumes: the job schema, `capture.mjs` and `contact-sheet.mjs` (phase 1 Task 17), unchanged in behaviour; the three-view helper (Task 8); every drawing and variant in `icons/product-icon-map.json` and `icons/product-src-variants/` (Tasks 1-10).
- Produces: `review/jobs/gate-2.json` (main pass 4 scales × 12 scenes; variants pass 100%/200% × `status-signals`, `icon-sheet`); helper commands `spellboundReview.severities`, `.statusSignals`, `.quickInput`, `.scm(state: 'changes' | 'staged' | 'conflict')`; chords `ctrl+alt+shift+{b,o,f,d,c,k,n,j,v,g,l,h,p,s,x}`; the terminal profile `Spellbound PowerShell`. `run-gate.mjs` and `capture.mjs` keep their CLI. Gate 1 and the smoke job still run; their captures now also show the notes.md problems, the sync item, the edited line 1 and lines 15-17 of spells.ts.

- [ ] **Step 1: Write the failing tests**

Apply this patch to `test/review-harness.test.mjs` as Tasks 8-10 leave it (Tasks 9 and 10 do not touch the file):

```bash
git apply <<'PATCH'
--- a/test/review-harness.test.mjs
+++ b/test/review-harness.test.mjs
@@ -11,7 +11,8 @@ const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
 const json = (file) => JSON.parse(read(file));
 const exists = (file) => fs.existsSync(path.join(root, file));
 
-const JOBS = ['review/jobs/gate-1.json', 'review/jobs/smoke.json'];
+const GATES = ['review/jobs/gate-1.json', 'review/jobs/gate-2.json'];
+const JOBS = [...GATES, 'review/jobs/smoke.json'];
 const PLAIN_KEYS = new Set(['Enter', 'Escape', 'Tab', 'Backspace']);
 
 test('every file the harness needs exists', () => {
@@ -60,11 +61,58 @@ test('the gate covers four scales, both activity bar sizes, and both terminal co
 });
 
 test('every committed sheet is one the gate job produces', () => {
-  const job = json('review/jobs/gate-1.json');
-  const produced = new Set(job.passes.flatMap((pass) => job.scenes
-    .filter((scene) => !pass.scenes || pass.scenes.includes(scene.name))
-    .flatMap((scene) => scene.crops.map((crop) => `${pass.name}-${scene.name}-${crop.name}`))));
-  for (const sheet of job.commitSheets) assert.ok(produced.has(sheet), sheet);
+  for (const file of GATES) {
+    const job = json(file);
+    const produced = new Set(job.passes.flatMap((pass) => job.scenes
+      .filter((scene) => !pass.scenes || pass.scenes.includes(scene.name))
+      .flatMap((scene) => scene.crops.map((crop) => `${pass.name}-${scene.name}-${crop.name}`))));
+    for (const sheet of job.commitSheets) assert.ok(produced.has(sheet), `${file}: ${sheet}`);
+  }
+});
+
+test('gate 2 waits, without an optional step, for every chrome and status glyph it has to show in context', () => {
+  // Each ID below only renders in a specific state (dirty or staged branch, merge conflict, a branch with an upstream,
+  // unread notification, toast of each severity, shell-integrated command, open find widget, diff editor, multi-step
+  // quick pick, gutter light bulb), so the scene must reach that state. An optional wait only warns, so it does not count.
+  const job = json('review/jobs/gate-2.json');
+  const waits = job.scenes.flatMap((scene) => (scene.setup ?? []).filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''))).join(' ');
+  for (const id of ['git-branch-changes', 'git-branch-staged-changes', 'git-branch-conflicts', 'sync', 'bell-dot', 'info', 'warning',
+    'error', 'terminal-decoration-success', 'terminal-decoration-error', 'find-next-match', 'diff-insert', 'diff-remove',
+    'diff-editor-next-change', 'quick-input-back', 'copilot-warning', 'gutter-lightbulb']) {
+    assert.match(waits, new RegExp(`codicon-${id}(?![\\w-])`), id);
+  }
+  // The inline light bulb (the one gate 1 saw) is a content widget, div.lightBulbWidget, carrying the codicon classes
+  // of lightbulb-sparkle, lightbulb-autofix or lightbulb-sparkle-autofix (1.141 _updateLightBulbTitleAndIcon).
+  const workbench = job.scenes.find((scene) => scene.name === 'workbench');
+  assert.ok(workbench.setup.some((step) => !step.optional && String(step.waitFor ?? '').includes('.lightBulbWidget[class*=codicon-lightbulb-]')),
+    'the workbench scene waits for the inline light bulb');
+  assert.deepEqual(job.passes.find((pass) => pass.name === 'main').scales, [1, 1.25, 1.5, 2]);
+  assert.ok(job.passes.find((pass) => pass.name === 'variants').scenes.includes('status-signals'), 'the copilot-warning variant reaches a status bar');
+});
+
+test('gate 2 scenes that change the fixture repository put it back', () => {
+  // A scene runs once per launch and the next scene starts from whatever it left; the scm chord with "changes" restores
+  // the dirty-branch state (merge aborted, index empty) before the next scene.
+  const bindings = json('review/profile/keybindings.json');
+  const restore = bindings.find((binding) => binding.command === 'spellboundReview.scm' && binding.args === 'changes').key;
+  const changing = new Set(bindings.filter((binding) => binding.command === 'spellboundReview.scm' && binding.args !== 'changes').map((binding) => binding.key));
+  for (const scene of json('review/jobs/gate-2.json').scenes) {
+    if (!(scene.setup ?? []).some((step) => changing.has(step.press))) continue;
+    assert.ok((scene.teardown ?? []).some((step) => step.press === restore), `${scene.name} restores the dirty branch`);
+  }
+  const runGate = read('scripts/review/run-gate.mjs');
+  assert.match(runGate, /'checkout', '-q', '-b', 'rival-brew'/, 'the fixture has a branch that conflicts');
+  assert.match(runGate, /'remote', 'add', 'origin', '\.\.\/origin\.git'/, 'the fixture has an upstream with a relative URL');
+  assert.match(read('review/helper-extension/extension.js'), /merge\('rival-brew'\)/);
+});
+
+test('the terminal profile used for command decorations gets shell integration injected', () => {
+  // VS Code 1.141 injects shell integration on Windows only into powershell.exe, pwsh.exe and Git Bash, and only when the
+  // profile's args are empty or just -NoLogo (ptyHostMain.js). The default WSL fish profile gets none, so no decorations.
+  const binding = json('review/profile/keybindings.json').find((candidate) => candidate.command === 'workbench.action.terminal.newWithProfile');
+  const profile = json('review/profile/settings.base.json')['terminal.integrated.profiles.windows'][binding.args.profileName];
+  assert.match(profile.path, /\\powershell\.exe$/i);
+  assert.ok(profile.args.length === 0 || (profile.args.length === 1 && profile.args[0].toLowerCase() === '-nologo'), JSON.stringify(profile.args));
 });
 
 test('the smoke job is the gate job cut down to one pass at 125% and the workbench scene', () => {
@@ -97,7 +145,13 @@ test('the helper extension wires the chords the profile binds and stays out of t
   const bindings = json('review/profile/keybindings.json');
   const commands = new Set(bindings.map((binding) => binding.command));
   assert.ok(commands.has(`${helper.contributes.views.spellboundReview[0].id}.focus`));
-  assert.ok(commands.has(helper.contributes.commands[0].command));
+  const contributed = new Set(helper.contributes.commands.map((command) => command.command));
+  for (const command of contributed) assert.ok(commands.has(command), `${command} is bound`);
+  for (const command of [...commands].filter((name) => name.startsWith('spellboundReview.') && !name.endsWith('.focus'))) {
+    assert.ok(contributed.has(command), `${command} is contributed by the helper`);
+  }
+  const source = read('review/helper-extension/extension.js');
+  for (const command of contributed) assert.ok(source.includes(`'${command}'`), `extension.js registers ${command}`);
   const rootPackage = json('package.json');
   assert.equal(rootPackage.scripts['review:gate'], 'node scripts/review/run-gate.mjs');
   assert.equal(rootPackage.main, undefined);
@@ -143,11 +197,13 @@ test('the icon sheet shows every drawing at every scale: side-by-side views in a
 
   const maximize = json('review/profile/keybindings.json').find((binding) => binding.command === 'workbench.action.toggleMaximizedPanel');
   assert.ok(maximize, 'a chord toggles the maximized panel');
-  const scene = json('review/jobs/gate-1.json').scenes.find((candidate) => candidate.name === 'icon-sheet');
-  assert.ok(scene.setup.some((step) => step.press === maximize.key), 'setup maximizes the panel');
-  const teardown = scene.teardown.map((step) => step.press);
-  assert.ok(teardown.indexOf(maximize.key) >= 0 && teardown.indexOf(maximize.key) < teardown.indexOf('ctrl+alt+shift+e'),
-    'teardown restores the panel size before closing it, so later scenes keep the default layout');
+  for (const file of GATES) {
+    const scene = json(file).scenes.find((candidate) => candidate.name === 'icon-sheet');
+    assert.ok(scene.setup.some((step) => step.press === maximize.key), `${file}: setup maximizes the panel`);
+    const teardown = scene.teardown.map((step) => step.press);
+    assert.ok(teardown.indexOf(maximize.key) >= 0 && teardown.indexOf(maximize.key) < teardown.indexOf('ctrl+alt+shift+e'),
+      `${file}: teardown restores the panel size before closing it, so later scenes keep the default layout`);
+  }
 });
 
 test('every launch starts from the pristine workspace, so all scales show the same SCM state', () => {
PATCH
git diff --stat test/review-harness.test.mjs
```

Expected: `git apply` prints nothing, then

```
 test/review-harness.test.mjs | 80 +++++++++++++++++++++++++++++++++++++-------
 1 file changed, 68 insertions(+), 12 deletions(-)
```

(`git diff` compares with the index, which the Task 10 snapshot left at that tree.) If `git apply` reports `patch does not apply`, the file is not the Task 8 version: compare it with `git show $(cat review-out/TREE_8):test/review-harness.test.mjs`.

Run: `node --test --test-reporter=tap test/review-harness.test.mjs | grep -E '^not ok|^# (tests|pass|fail)'`
Expected:

```
not ok 1 - every file the harness needs exists
not ok 2 - job files follow the schema and press only bound chords or plain keys
not ok 4 - every committed sheet is one the gate job produces
not ok 5 - gate 2 waits, without an optional step, for every chrome and status glyph it has to show in context
not ok 6 - gate 2 scenes that change the fixture repository put it back
not ok 7 - the terminal profile used for command decorations gets shell integration injected
not ok 14 - the icon sheet shows every drawing at every scale: side-by-side views in a maximized panel
# tests 16
# pass 9
# fail 7
```

Tests 1, 2, 4, 5 and 14 fail because `review/jobs/gate-2.json` does not exist yet; 6 and 7 because the `spellboundReview.scm` and `Spellbound PowerShell` chords are not bound yet.

- [ ] **Step 2: Write `review/jobs/gate-2.json`**

Derived from `gate-1.json`: same header and main scales; the debug and testing scenes are dropped (gate 3 and 4 material); the workbench scene waits, none of it optional, for the inline light bulb, the dirty-branch icon and the sync item, and crops the whole editor (`code`) so the inline light bulb is in frame; the notifications scene raises one toast per severity and waits for all three; the terminal scene uses the PowerShell profile; eight scenes are new (bulb-gutter, problems, find, diff, quick-input, status-signals, scm-staged, scm-conflict).

```json
{
  "expectVersion": "1.141.0",
  "port": 9333,
  "mode": "device-scale",
  "helperVsix": "spellbound-review-helper.vsix",
  "passes": [
    { "name": "main", "vsix": ["spellbound-main.vsix"], "scales": [1, 1.25, 1.5, 2] },
    { "name": "variants", "vsix": ["spellbound-variants.vsix"], "scales": [1, 2], "scenes": ["status-signals", "icon-sheet"] }
  ],
  "scenes": [
    {
      "name": "workbench",
      "setup": [
        { "press": "ctrl+alt+shift+4", "wait": 800 },
        { "press": "ctrl+alt+shift+w", "wait": 2000 },
        { "press": "ctrl+alt+shift+y", "wait": 800 }, { "press": "Enter", "wait": 1500 }, { "insert": "✦ " },
        { "press": "ctrl+alt+shift+1", "wait": 800 }, { "press": "Enter", "wait": 5000 },
        { "waitFor": "!!document.querySelector('.part.editor .lightBulbWidget[class*=codicon-lightbulb-]')", "timeout": 20000 },
        { "waitFor": "!!document.querySelector('.part.statusbar .codicon-git-branch-changes')", "timeout": 20000 },
        { "waitFor": "!!document.querySelector('.part.statusbar .codicon-sync')", "timeout": 20000 }
      ],
      "variants": [
        { "name": "default", "settings": {} },
        { "name": "compact", "settings": { "workbench.activityBar.compact": true } }
      ],
      "crops": [
        { "name": "activitybar", "selector": ".part.activitybar" },
        { "name": "tabs", "selector": ".part.editor .tabs-and-actions-container" },
        { "name": "code", "selector": ".part.editor .monaco-editor", "maxHeight": 320 },
        { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 420 },
        { "name": "statusbar", "selector": ".part.statusbar" },
        { "name": "chat", "selector": ".part.auxiliarybar" },
        { "name": "titlebar", "selector": ".part.titlebar" }
      ]
    },
    {
      "name": "bulb-gutter",
      "setup": [
        { "press": "ctrl+alt+shift+b", "wait": 800 }, { "press": "Enter", "wait": 4000 },
        { "waitFor": "!!document.querySelector('.part.editor .margin [class*=codicon-gutter-lightbulb]')", "timeout": 20000 }
      ],
      "crops": [{ "name": "code", "selector": ".part.editor .monaco-editor", "maxHeight": 420 }]
    },
    {
      "name": "problems",
      "setup": [
        { "press": "ctrl+alt+shift+o", "wait": 1500 },
        { "waitFor": "!!document.querySelector('.part.panel .marker-icon.codicon-info, .part.panel .marker-icon .codicon-info') && !!document.querySelector('.part.panel .codicon-error')", "timeout": 20000 }
      ],
      "crops": [{ "name": "panel", "selector": ".part.panel" }, { "name": "statusbar", "selector": ".part.statusbar" }],
      "teardown": [{ "press": "ctrl+alt+shift+e", "wait": 800 }]
    },
    {
      "name": "find",
      "setup": [
        { "press": "ctrl+alt+shift+1", "wait": 800 }, { "press": "Enter", "wait": 1500 },
        { "press": "ctrl+alt+shift+f", "wait": 800 }, { "insert": "potion", "wait": 800 },
        { "waitFor": "!!document.querySelector('.find-widget.visible .codicon-find-next-match')", "timeout": 10000 }
      ],
      "crops": [{ "name": "widget", "selector": ".part.editor .find-widget.visible" }],
      "teardown": [{ "press": "Escape", "wait": 500 }]
    },
    {
      "name": "diff",
      "setup": [
        { "press": "ctrl+alt+shift+d", "wait": 2500 },
        { "waitFor": "!!document.querySelector('.monaco-diff-editor .codicon-diff-insert') && !!document.querySelector('.monaco-diff-editor .codicon-diff-remove')", "timeout": 20000 },
        { "waitFor": "!!document.querySelector('.part.editor .codicon-diff-editor-next-change')", "timeout": 10000 }
      ],
      "crops": [{ "name": "editor", "selector": ".part.editor", "maxHeight": 300 }],
      "teardown": [{ "press": "ctrl+alt+shift+c", "wait": 800 }]
    },
    {
      "name": "quick-input",
      "setup": [
        { "press": "ctrl+alt+shift+k", "wait": 1200 },
        { "waitFor": "!!document.querySelector('.quick-input-widget .codicon-quick-input-back')", "timeout": 10000 }
      ],
      "crops": [{ "name": "widget", "selector": ".quick-input-widget" }],
      "teardown": [{ "press": "Escape", "wait": 500 }]
    },
    {
      "name": "notifications",
      "setup": [
        { "press": "ctrl+alt+shift+n", "wait": 1500 },
        { "waitFor": "!!document.querySelector('.notifications-toasts .codicon-error') && !!document.querySelector('.notifications-toasts .codicon-warning') && !!document.querySelector('.notifications-toasts .codicon-info')", "timeout": 10000 },
        { "waitFor": "!!document.querySelector('.part.statusbar .codicon-bell-dot')", "timeout": 10000 }
      ],
      "crops": [{ "name": "toasts", "selector": ".notifications-toasts" }, { "name": "statusbar", "selector": ".part.statusbar" }],
      "teardown": [{ "press": "Escape", "wait": 500 }]
    },
    {
      "name": "status-signals",
      "setup": [
        { "press": "ctrl+alt+shift+j", "wait": 800 },
        { "waitFor": "!!document.querySelector('.part.statusbar .codicon-copilot-warning')", "timeout": 10000 }
      ],
      "crops": [{ "name": "statusbar", "selector": ".part.statusbar" }],
      "teardown": [{ "press": "ctrl+alt+shift+j", "wait": 500 }]
    },
    {
      "name": "scm-staged",
      "setup": [
        { "press": "ctrl+alt+shift+v", "wait": 1200 },
        { "press": "ctrl+alt+shift+g", "wait": 1500 },
        { "waitFor": "!!document.querySelector('.part.statusbar .codicon-git-branch-staged-changes')", "timeout": 20000 }
      ],
      "crops": [{ "name": "statusbar", "selector": ".part.statusbar" }, { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 420 }],
      "teardown": [
        { "press": "ctrl+alt+shift+h", "wait": 1500 },
        { "waitFor": "!!document.querySelector('.part.statusbar .codicon-git-branch-changes')", "timeout": 20000 }
      ]
    },
    {
      "name": "scm-conflict",
      "setup": [
        { "press": "ctrl+alt+shift+l", "wait": 2500 },
        { "waitFor": "!!document.querySelector('.part.statusbar .codicon-git-branch-conflicts')", "timeout": 20000 }
      ],
      "crops": [{ "name": "statusbar", "selector": ".part.statusbar" }, { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 420 }],
      "teardown": [
        { "press": "ctrl+alt+shift+h", "wait": 2000 },
        { "waitFor": "!!document.querySelector('.part.statusbar .codicon-git-branch-changes')", "timeout": 20000 },
        { "press": "ctrl+alt+shift+4", "wait": 800 }
      ]
    },
    {
      "name": "terminal",
      "setup": [
        { "press": "ctrl+alt+shift+p", "wait": 8000 },
        { "press": "ctrl+alt+shift+s", "wait": 2500 },
        { "press": "ctrl+alt+shift+x", "wait": 2500 },
        { "waitFor": "!!document.querySelector('.terminal-command-decoration.codicon-terminal-decoration-success') && !!document.querySelector('.terminal-command-decoration.codicon-terminal-decoration-error')", "timeout": 30000 }
      ],
      "crops": [{ "name": "panel", "selector": ".part.panel" }],
      "teardown": [{ "press": "ctrl+alt+shift+e" }]
    },
    {
      "name": "icon-sheet",
      "setup": [{ "press": "ctrl+alt+shift+7", "wait": 1500 }, { "press": "ctrl+alt+shift+m", "wait": 1500 }],
      "crops": [{ "name": "panel", "selector": ".part.panel" }],
      "teardown": [{ "press": "ctrl+alt+shift+m", "wait": 800 }, { "press": "ctrl+alt+shift+e" }]
    }
  ],
  "commitSheets": [
    "main-workbench-activitybar", "main-workbench-tabs", "main-workbench-code", "main-workbench-sidebar",
    "main-workbench-statusbar", "main-workbench-titlebar", "main-workbench-chat", "main-bulb-gutter-code",
    "main-problems-panel", "main-find-widget", "main-diff-editor", "main-quick-input-widget", "main-notifications-toasts",
    "main-notifications-statusbar", "main-status-signals-statusbar", "main-scm-staged-statusbar", "main-scm-staged-sidebar",
    "main-scm-conflict-statusbar", "main-terminal-panel", "main-icon-sheet-panel", "variants-status-signals-statusbar",
    "variants-icon-sheet-panel"
  ]
}
```

The inline light-bulb wait was optional at gate 1; here it is required, like the gutter one. The 1.141 widget is a content widget, `div.lightBulbWidget`, and `_updateLightBulbTitleAndIcon` adds the icon's codicon classes to it only when the bulb is drawn inline, so `[class*=codicon-lightbulb-]` matches `lightbulb-sparkle`, `lightbulb-autofix` and `lightbulb-sparkle-autofix` and nothing in the gutter. The sync wait is not transient: the git extension's sync item shows `$(sync)` whenever the branch has an upstream (`git.enableStatusBarSync` defaults to true), with ahead/behind counts only when they are not zero, and `$(sync~spin)` while a sync runs, which still carries `codicon-sync`. `run-gate.mjs` pushes the fixture branch with `-u` (Step 5), so the item is there from the first git status to the end of the run, merge included.

Scene order matters: each scene starts where the previous one left off within a launch. `bulb-gutter` moves the cursor to line 16, `find` reopens spells.ts at 11:12, `diff` opens the diff of the active spells.ts and closes it again, `scm-staged` opens the Source Control view, and `scm-conflict`'s teardown restores the dirty branch and returns to the Explorer before `terminal` and `icon-sheet`.

- [ ] **Step 3: Bind the chords and add the terminal profile**

Replace `review/profile/keybindings.json` with:

```json
[
  { "key": "ctrl+alt+shift+1", "command": "workbench.action.quickOpen", "args": "spells.ts:11:12" },
  { "key": "ctrl+alt+shift+2", "command": "editor.debug.action.toggleBreakpoint" },
  { "key": "ctrl+alt+shift+3", "command": "workbench.action.debug.start" },
  { "key": "ctrl+alt+shift+4", "command": "workbench.view.explorer" },
  { "key": "ctrl+alt+shift+5", "command": "workbench.view.debug" },
  { "key": "ctrl+alt+shift+6", "command": "workbench.view.extension.test" },
  { "key": "ctrl+alt+shift+7", "command": "spellboundReview.iconSheet.focus" },
  { "key": "ctrl+alt+shift+8", "command": "workbench.action.terminal.new" },
  { "key": "ctrl+alt+shift+9", "command": "workbench.action.terminal.sendSequence", "args": { "text": "ll\r" } },
  { "key": "ctrl+alt+shift+0", "command": "spellboundReview.notify" },
  { "key": "ctrl+alt+shift+q", "command": "workbench.action.quickOpen", "args": "debug-target.js:4" },
  { "key": "ctrl+alt+shift+u", "command": "workbench.action.quickOpen", "args": "debug-target.js:6" },
  { "key": "ctrl+alt+shift+w", "command": "workbench.action.chat.open" },
  { "key": "ctrl+alt+shift+e", "command": "workbench.action.closePanel" },
  { "key": "ctrl+alt+shift+r", "command": "testing.runAll" },
  { "key": "ctrl+alt+shift+t", "command": "workbench.action.debug.stop" },
  { "key": "ctrl+alt+shift+y", "command": "workbench.action.quickOpen", "args": "notes.md" },
  { "key": "ctrl+alt+shift+m", "command": "workbench.action.toggleMaximizedPanel" },
  { "key": "ctrl+alt+shift+b", "command": "workbench.action.quickOpen", "args": "spells.ts:16:24" },
  { "key": "ctrl+alt+shift+o", "command": "workbench.actions.view.problems" },
  { "key": "ctrl+alt+shift+f", "command": "actions.find" },
  { "key": "ctrl+alt+shift+d", "command": "git.openChange" },
  { "key": "ctrl+alt+shift+c", "command": "workbench.action.closeActiveEditor" },
  { "key": "ctrl+alt+shift+k", "command": "spellboundReview.quickInput" },
  { "key": "ctrl+alt+shift+n", "command": "spellboundReview.severities" },
  { "key": "ctrl+alt+shift+j", "command": "spellboundReview.statusSignals" },
  { "key": "ctrl+alt+shift+v", "command": "workbench.view.scm" },
  { "key": "ctrl+alt+shift+g", "command": "spellboundReview.scm", "args": "staged" },
  { "key": "ctrl+alt+shift+l", "command": "spellboundReview.scm", "args": "conflict" },
  { "key": "ctrl+alt+shift+h", "command": "spellboundReview.scm", "args": "changes" },
  { "key": "ctrl+alt+shift+p", "command": "workbench.action.terminal.newWithProfile", "args": { "profileName": "Spellbound PowerShell" } },
  { "key": "ctrl+alt+shift+s", "command": "workbench.action.terminal.sendSequence", "args": { "text": "Write-Output 'moonwater brews'\r" } },
  { "key": "ctrl+alt+shift+x", "command": "workbench.action.terminal.sendSequence", "args": { "text": "Get-Item no-such-spell\r" } }
]
```

The first eighteen bindings are unchanged from gate 1. In `review/profile/settings.base.json`, replace the last line before the closing brace, `"terminal.integrated.fontFamily": "'Maple Mono NF', Consolas, monospace"`, with:

```json
  "terminal.integrated.fontFamily": "'Maple Mono NF', Consolas, monospace",
  "terminal.integrated.profiles.windows": {
    "Spellbound PowerShell": { "path": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", "args": ["-NoLogo"] }
  }
```

The default profile stays `Ubuntu (WSL)`, so gate 1's `ll` scene is unchanged.

- [ ] **Step 4: Extend the helper extension**

Replace `review/helper-extension/package.json` with:

```json
{
  "name": "spellbound-review-helper",
  "displayName": "Spellbound review helper",
  "description": "Review-only helper for the Spellbound gate screenshots. Not part of the published extension.",
  "version": "0.0.2",
  "publisher": "witchynibbles-review",
  "engines": { "vscode": "^1.100.0" },
  "main": "./extension.js",
  "activationEvents": ["onStartupFinished"],
  "extensionDependencies": ["vscode.git"],
  "contributes": {
    "viewsContainers": { "panel": [{ "id": "spellboundReview", "title": "Icon sheet", "icon": "media/sheet.svg" }] },
    "views": { "spellboundReview": [
      { "id": "spellboundReview.iconSheet", "name": "Icon sheet" },
      { "id": "spellboundReview.iconSheet2", "name": "Icon sheet (cont.)" },
      { "id": "spellboundReview.iconSheet3", "name": "Icon sheet (end)" }
    ] },
    "commands": [
      { "command": "spellboundReview.notify", "title": "Spellbound Review: Show a long notification" },
      { "command": "spellboundReview.severities", "title": "Spellbound Review: Show an info, a warning and an error notification" },
      { "command": "spellboundReview.statusSignals", "title": "Spellbound Review: Toggle the Copilot-state and spinner status entries" },
      { "command": "spellboundReview.quickInput", "title": "Spellbound Review: Show a multi-step quick pick" },
      { "command": "spellboundReview.scm", "title": "Spellbound Review: Put the fixture repository into a git state" }
    ]
  }
}
```

Replace `review/helper-extension/extension.js` with:

```js
// Review helper: shows every mapped drawing at 16px in side-by-side trees, creates a Testing provider so the Testing
// container and pass/fail icons appear, raises notifications, and puts the review fixture into the states that the
// status-batch glyphs need (Problems severities, staged and conflicted git branch, Copilot states, spinners, quick input).
const path = require('path');
const vscode = require('vscode');
const rows = require('./ids.json'); // written by run-gate.mjs: [{ id, label, description }]
const sheetViews = require('./package.json').contributes.views.spellboundReview.map(({ id }) => id);

async function gitRepository() {
  const git = vscode.extensions.getExtension('vscode.git');
  const api = (git.isActive ? git.exports : await git.activate()).getAPI(1);
  for (let tries = 0; tries < 80 && !api.repositories.length; tries += 1) await new Promise((resolve) => setTimeout(resolve, 250));
  if (!api.repositories.length) throw new Error('the review workspace has no git repository');
  return api.repositories[0];
}

// 'changes': the fixture as run-gate.mjs leaves it (modified + untracked: git-branch-changes).
// 'staged': spells.ts staged (git-branch-staged-changes). 'conflict': rival-brew merged into a conflict (git-branch-conflicts).
async function scmState(state) {
  const repo = await gitRepository();
  await repo.status();
  if (repo.state.mergeChanges.length) await repo.mergeAbort();
  if (repo.state.indexChanges.length) await repo.revert([]); // unstage everything; git merge refuses a dirty index
  if (state === 'staged') await repo.add([path.join(repo.rootUri.fsPath, 'spells.ts')]);
  if (state === 'conflict') await repo.merge('rival-brew').catch(() => { /* the conflict is the point */ });
  await repo.status();
}

function activate(context) {
  const items = rows.map(({ id, label, description }) => {
    const item = new vscode.TreeItem(label);
    item.iconPath = new vscode.ThemeIcon(id);
    item.description = description;
    return item;
  });
  // Side-by-side views (every view package.json contributes), so every row fits a maximized panel even at 200%.
  const perView = Math.ceil(items.length / sheetViews.length);
  sheetViews.forEach((id, index) => {
    const part = items.slice(index * perView, (index + 1) * perView);
    context.subscriptions.push(vscode.window.registerTreeDataProvider(id, { getTreeItem: (item) => item, getChildren: () => part }));
  });

  const controller = vscode.tests.createTestController('spellboundReview', 'Spellbound review');
  const pass = controller.createTestItem('pass', 'moonwater brews');
  const fail = controller.createTestItem('fail', 'nightshade spills');
  controller.items.replace([pass, fail]);
  controller.createRunProfile('Run', vscode.TestRunProfileKind.Run, (request) => {
    const run = controller.createTestRun(request);
    run.passed(pass, 5);
    run.failed(fail, new vscode.TestMessage('The cauldron spilled.'), 7);
    run.end();
  }, true);

  // One problem of each severity on notes.md, so the Problems tree and the status bar show error, warning and info.
  const diagnostics = vscode.languages.createDiagnosticCollection('spellbound-review');
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (folder) {
    const line = (n) => new vscode.Range(n, 0, n, 9);
    diagnostics.set(vscode.Uri.joinPath(folder.uri, 'notes.md'), [
      new vscode.Diagnostic(line(2), 'The moonwater boiled over.', vscode.DiagnosticSeverity.Error),
      new vscode.Diagnostic(line(2), 'Nightshade is out of its drawer.', vscode.DiagnosticSeverity.Warning),
      new vscode.Diagnostic(line(0), 'Steep for one more minute.', vscode.DiagnosticSeverity.Information),
    ]);
  }

  // Status bar entries for states the review profile cannot reach: Copilot states need a signed-in Copilot, and the
  // spinners only turn while work runs. Same $(id) rendering as the real entries. Toggled by spellboundReview.statusSignals.
  const signals = [
    vscode.window.createStatusBarItem('spellboundReview.copilotStates', vscode.StatusBarAlignment.Right, -1000),
    vscode.window.createStatusBarItem('spellboundReview.spinners', vscode.StatusBarAlignment.Right, -1001),
  ];
  signals[0].text = '$(copilot-unavailable) $(copilot-snooze) $(copilot-dot) $(copilot-warning)';
  signals[1].text = '$(loading~spin) $(sync~spin)';
  let signalsShown = false;

  context.subscriptions.push(controller, diagnostics, ...signals,
    vscode.commands.registerCommand('spellboundReview.notify', () =>
      vscode.window.showWarningMessage('The cauldron needs attention: this message is long on purpose, so the toast shows its expand chevron, its configure gear and its close button for the review screenshots.', 'Stir')),
    vscode.commands.registerCommand('spellboundReview.severities', () => {
      vscode.window.showInformationMessage('The moon is waxing.');
      vscode.window.showWarningMessage('The cauldron is simmering.');
      vscode.window.showErrorMessage('The potion curdled.');
    }),
    vscode.commands.registerCommand('spellboundReview.statusSignals', () => {
      signalsShown = !signalsShown;
      for (const item of signals) if (signalsShown) item.show(); else item.hide();
    }),
    vscode.commands.registerCommand('spellboundReview.quickInput', () => {
      const pick = vscode.window.createQuickPick();
      pick.title = 'Choose the potions';
      pick.step = 2;
      pick.totalSteps = 3;
      pick.buttons = [vscode.QuickInputButtons.Back];
      pick.canSelectMany = true;
      pick.items = [{ label: 'Moonwater' }, { label: 'Nightshade' }, { label: 'Starlight' }];
      pick.selectedItems = [pick.items[0], pick.items[2]];
      pick.onDidHide(() => pick.dispose());
      pick.show();
    }),
    vscode.commands.registerCommand('spellboundReview.scm', (state) => scmState(state)));
}

module.exports = { activate };
```

Replace the paragraph in `review/helper-extension/README.md` (the paragraph below the heading) with:

```markdown
A throwaway extension installed only into the isolated review VS Code that `npm run review:gate` launches. It lists every mapped product-icon drawing at 16px in three side-by-side panel trees, registers a fake test controller so the Testing view shows pass and fail icons, puts one error, one warning and one info problem on notes.md, raises notifications (one long warning; one info, one warning and one error), shows a multi-step quick pick with a Back button, toggles status bar entries for the four Copilot states and the two spinners (states a signed-out review profile cannot reach), and puts the fixture repository into the staged or conflicted state through the built-in git extension's API. It is never published, never referenced from the root `package.json`, and excluded from the Spellbound VSIX by `.vscodeignore`.
```

Run: `node --check review/helper-extension/extension.js`
Expected: no output.

- [ ] **Step 5: Give the fixture a gutter light bulb, a rival branch, an upstream and a removed line**

Replace `review/workspace/spells.ts` with:

```ts
// Review fixture: missing functions (quick-fix light bulb inline on line 11, in the gutter on line 16), a type error (status bar error count), foldable blocks.
export interface Potion {
  name: string;
  strength: number;
}

export function brew(potion: Potion): string {
  if (potion.strength > 3) {
    return `${potion.name} glows`;
  }
  return stirCauldron(potion);
}

export const moonwater: Potion = { name: 'moonwater', strength: 'five' };
export const wand = 'oak';
export const charm = summonCharm();
export const robe = 'night';
```

Line 16 is unindented between two unindented lines, so its quick-fix bulb is drawn in the gutter; the bulb for line 11 stays inline on line 10, and the type error stays on line 14.

In `scripts/review/run-gate.mjs`, replace:

```js
git('add', '-A');
git('commit', '-q', '-m', 'review fixture');
fs.appendFileSync(path.join(workspace, 'spells.ts'), '\n// stirred during review\n'); // modified -> amber
```

with:

```js
git('add', '-A');
git('commit', '-q', '-m', 'review fixture');
// Gate 2 git states: the git extension (Windows git) needs an identity to merge, a branch that conflicts with this one
// on README.md (git-branch-conflicts, spellboundReview.scm), and an upstream, so the status bar shows sync, not Publish.
git('config', 'user.name', 'review');
git('config', 'user.email', 'review@localhost');
const readmePath = path.join(workspace, 'README.md');
const readme = fs.readFileSync(readmePath, 'utf8');
git('checkout', '-q', '-b', 'rival-brew');
fs.writeFileSync(readmePath, readme.replace('This folder is a fixture', 'This folder is a rival fixture'));
git('commit', '-q', '-am', 'rival brew');
git('checkout', '-q', 'moonlit-review');
fs.writeFileSync(readmePath, readme.replace('This folder is a fixture', 'This folder is a moonlit fixture'));
git('commit', '-q', '-am', 'moonlit brew');
git('init', '-q', '--bare', '../origin.git'); // a relative URL, so WSL git and Windows git both resolve it
git('remote', 'add', 'origin', '../origin.git');
git('push', '-q', '-u', 'origin', 'moonlit-review');
const spellsPath = path.join(workspace, 'spells.ts');
fs.writeFileSync(spellsPath, fs.readFileSync(spellsPath, 'utf8').replace('// Review fixture:', '// Review fixture, stirred:')); // diff-remove + diff-insert
fs.appendFileSync(spellsPath, '\n// stirred during review\n'); // modified -> amber
```

`origin.git` sits beside `workspace/` in the Windows run folder, outside the pristine copy that `capture.mjs` restores from.

In `scripts/review/capture.mjs`, replace the comment

```js
// Working files only (git keeps its object files read-only on Windows, and the repository never changes), and only
// files whose content changed: a rewritten file loses its WSL mode bits and mtime, which the terminal listing shows.
```

with

```js
// Working files only (git keeps its object files read-only on Windows), and only files whose content changed: a
// rewritten file loses its WSL mode bits and mtime, which the terminal listing shows. Gate 2 scenes change the index and
// the merge state through the git extension; their teardowns (spellboundReview.scm "changes") put them back, and a
// failed teardown stops the run.
```

- [ ] **Step 6: Run the tests**

Run: `npm test 2>&1 | grep -E '^ℹ (tests|fail)' && npm run validate 2>&1 | tail -1`
Expected: `ℹ tests 223`, `ℹ fail 0` (`test/review-harness.test.mjs` has 16 tests, 13 before), and `✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status)`.

- [ ] **Step 7: One-scale dry run in real VS Code**

```bash
mkdir -p review-out
node -e "const j=require('./review/jobs/gate-2.json');j.passes=[j.passes[0]];j.passes[0].scales=[1];j.commitSheets=[];require('fs').writeFileSync('review-out/gate-2-dry.json',JSON.stringify(j,null,2))"
AGENT_BROWSER_SESSION=spellbound-gate2 npm run review:gate -- --job review-out/gate-2-dry.json --skip-variants
```

(`contact-sheet.mjs` drives agent-browser; the variable keeps it off the shared default session.)

Expected, after about 4 minutes: `[capture] done: 168 captures, 0 warnings`, `22 contact sheets in …/review-out/<run>/sheets` and `Gate run complete: …/review-out/<run> (168 captures, 0 warnings)` (the script prints absolute paths). 168 = 4 themes × (workbench 2 variants × 8 + bulb-gutter 2 + problems 3 + find 2 + diff 2 + quick-input 2 + notifications 3 + status-signals 2 + scm-staged 3 + scm-conflict 3 + terminal 2 + icon-sheet 2); each scene captures `full` plus its crops. Open with the Read tool, in `review-out/<run>/captures/main/1/`:

- `workbench/moonlit-candle/default/code.png`: the candle (not the stock sparkle bulb) left of the `}` on line 10.
- `bulb-gutter/moonlit-candle/default/code.png`: the candle in the gutter, left of the line number 16.
- `scm-conflict/moonlit-candle/default/statusbar.png`: the moon gate, the conflicts sprig and `moonlit-review*!`, the sync arrows, then the problem counts skull 4, warning 1, info 1 (three TypeScript errors in spells.ts and the notes.md error). `scm-staged/…/statusbar.png` shows the staged sprig and `moonlit-review*+`; `workbench/…/statusbar.png` the changes sprig and `moonlit-review*`.
- `terminal/moonlit-candle/default/panel.png`: a success dot left of `Write-Output 'moonwater brews'` and an error mark left of `Get-Item no-such-spell`.
- `notifications/…/toasts.png`: three toasts (skull, warning triangle, info), and `notifications/…/statusbar.png` ends with the bell-dot.
- `status-signals/…/statusbar.png`: the four cat states and the two spinners left of the bell.
- `find/…/widget.png`, `diff/…/editor.png`, `quick-input/…/widget.png`: the find arrows, the `+`/`-` diff indicators with the up/down change arrows, and the Back arrow with checked boxes.
- `icon-sheet/…/panel.png`: three views listing all 47 drawings.

If a non-optional wait times out, the run stops with `Timed out waiting for …` and names the scene; fix that scene before Task 12. The dry run's `review-out/` folder is not committed.

- [ ] **Step 8: Snapshot the tree**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_11`
Expected: one 40-character tree id, also saved in `review-out/TREE_11`.

---

### Task 12: Run gate 2 and hand it to the author

**Files:**
- Create: `docs/qa/2.0-gate-2/README.md`, `docs/qa/2.0-gate-2/manifest.json`, `docs/qa/2.0-gate-2/*.png` (the 22 `commitSheets` of `review/jobs/gate-2.json`)

**Interfaces:**
- Consumes: everything above (Tasks 1-11), and the README notes from Tasks 6 and 10.
- Produces: the review-gate-2 package. This plan ends here; the panel and debug batches (gate 3) start only after the author approves.

**Choices the author makes at this gate:** D5 `copilot-warning` (`cat-warning` or `cat-warning.solid`); `ellipsis` or `ellipsis.small`; where `gutter-lightbulb-sparkle-filled` goes; the witch hat as a solid silhouette; the three status readings that differ from spec 5.2 (one-eyed slashed cat, the pip, the 1.41 ✕ cut-out); G3's remaining off-grid points; approval of the five G7 redraws, the snapped bell, the `chrome` batch and the `status` batch. **Evidence for decisions already taken:** G4, G5, G6, G7 and D5's state list.

- [ ] **Step 1: Verify the preconditions**

Run: `npm test 2>&1 | grep -E '^ℹ (tests|fail)' && npm run validate 2>&1 | grep -E '^…|^✓' && git status --short | wc -l`
Expected: `ℹ tests 223`, `ℹ fail 0`; `… 101 pending problems in stages not yet enforced: product-batch:editor (33), product-batch:panel (9), product-batch:debug (23), product-batch:symbols (15), release (2), file-icons (19) (use --verbose to list)` and `✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status)`; a non-zero line count. The tree is dirty (no commits during this plan), so the manifest will record `repoDirty: true`.

- [ ] **Step 2: Run the full gate**

Run: `AGENT_BROWSER_SESSION=spellbound-gate2 npm run review:gate -- --job review/jobs/gate-2.json`
Expected, after about 15 minutes: `24 contact sheets in …/review-out/<run>/sheets` and `Gate run complete: …/review-out/<run> (704 captures, 0 warnings)`. Main pass: 4 scales × 168 = 672. Variants pass (the font with `cat-warning.solid` and `ellipsis.small` swapped in): 2 scales × 4 themes × (status-signals 2 + icon-sheet 2) = 32. If `icons/product-src-variants/` were empty, `run-gate.mjs` would drop the variants pass (672 captures, 22 sheets); here it holds the two variants. Re-run if a non-optional step failed (the run stops and names it); optional-step warnings go into the README.

- [ ] **Step 3: Review the sheets yourself before the author does**

Open every PNG in the `commitSheets` list with the Read tool. Record in the README, per glyph: anything that blurs at 125%/150% beyond what snapped strokes allow; any accent that vanishes at 16px/100% (the bell-dot ✦, the sprig badges, the Copilot eyes, lids and pip, the terminal success dot); whether the arrows and the `+` sit on one crisp pixel column or row at 100% and 200%; whether the four spinner frames in `main-status-signals-statusbar` keep the same centre; whether the five redraws read as spider, owl, witch hat, moon gate and grimoire at 16px (compact activity bar and icon sheet); and whether the compact activity bar's Explorer badge still covers part of the grimoire's clasp. Do not redraw anything now.

- [ ] **Step 4: Copy the sheets and the manifest**

```bash
RUN=$(ls -d review-out/20*/ | tail -1) # the timestamped run folders, not compare/, chrome-compare/ or glyph-sheet/
mkdir -p docs/qa/2.0-gate-2
for name in $(node -e "console.log(require('./review/jobs/gate-2.json').commitSheets.join(' '))"); do
  if [ -f "$RUN/sheets/$name.png" ]; then cp "$RUN/sheets/$name.png" docs/qa/2.0-gate-2/; else echo "not produced: $name"; fi
done
cp "$RUN/captures/manifest.json" docs/qa/2.0-gate-2/manifest.json
ls docs/qa/2.0-gate-2 | wc -l
```

Expected: no `not produced` lines and `23` (22 sheets and the manifest).

- [ ] **Step 5: Write `docs/qa/2.0-gate-2/README.md`**

Fill the angle-bracket fields from the run and from Step 3; every other line is final text.

````markdown
# Spellbound 2.0, review gate 2 (chrome and status batches, batch-1 redraws and snaps)

- Run: <run id> · VS Code <version> (<commit dir>) · mode <device-scale|zoom> · repo <commit> (dirty: phase-2 work is uncommitted, so `repoDirty` is true)
- Reproduce: `AGENT_BROWSER_SESSION=spellbound-gate2 npm run review:gate -- --job review/jobs/gate-2.json` (Windows VS Code 1.141 driven over CDP from VS Code's own Electron; harness in docs/superpowers/plans/2026-10-10-spellbound-2-phase-1.md, Part D, gate-2 scenes in docs/superpowers/plans/2026-10-10-spellbound-2-gate-2.md, Task 11)
- Raw captures (not committed): review-out/<run>/captures. `manifest.json` here lists all <n> with their sha256: main pass 4 scales × 168, variants pass 2 scales × 16. <k> warnings<: list them>.
- Committed here: the 22 `commitSheets` from `review/jobs/gate-2.json`.

## Preconditions
- `npm test`: <n> of <n> pass. `npm run validate`: passes with `base`, `color-themes`, `product-pipeline`, `product-batch:1`, `product-batch:chrome` and `product-batch:status` enforced; `editor`, `panel`, `debug`, `symbols`, `file-icons` and `release` are pending, as staged validation allows.
- Grid warnings left after G3 snapping, each accepted as drawn because snapping it would distort the shape:
  - `gear`: the corners of the four 45° teeth, which no half-unit value reaches while a tooth stays a 2-unit parallel band. The four axis teeth are snapped.
  - `sync-arrows`: the four band ends at 235° and 55°, where a ring band's straight end cut meets two arcs.
  - `cat-slash`: the points where the knockout band (2x - y = 6.75 to 14.25) cuts the head's straight edges. Band edges on the half grid (2x - y = 7 to 14) would leave 0.89 units of clearance around the slash, under the 1-unit minimum, and the cuts on the slanted chin edge would still be off the grid. Choice for the author: a wider whole-number band (2x - y = 6 to 15) leaves 1.34 units of clearance and only two off-grid points, but trims 0.34 more of the head on each side of the slash.
- No warning is left on bell, cat-head, explorer-grimoire, flask, moon-gate, owl, scrying-glass, terminal or witch-hat. The grimoire, moon-gate and terminal warnings at gate 1 were the validator counting a crescent's zero-length closing `Z` as a straight segment; that is fixed.

## What to judge
- The five redraws (G7): spider, owl, witch hat, moon gate, grimoire. The spider, witch hat and grimoire are in main-workbench-activitybar (default and compact; the grimoire with the Explorer badge on it). The owl and the moon gate show only in main-icon-sheet-panel: the Timeline view lives in the Explorer and the review profile has no remote extension.
- The snaps (G3): bell, cat head, flask, gear. Only the bell changes visibly: its dome now starts at y6 under a longer handle, so bell-dot's ✦ fits beside it.
- The chrome batch: arrows (title bar Go Back / Go Forward, find widget, diff editor, quick input Back), `+` and `-` (chat title, terminal toolbar, diff indicators), check (quick pick boxes, SCM Commit button), the three dots (every view title, `…`).
- The status batch: warning, info and the skull in Problems, toasts and the status bar; the terminal success dot and error mark; the bell with ✦; the remote moon gate; sync; the bracket (the `{ }` before the language name in the status bar); the three sprig variants; the four cat states and the two spinners.
- The candle on every code-action light bulb: inline at line 10 (main-workbench-code) and in the gutter at line 16 (main-bulb-gutter-code).
- Each sheet: rows = theme · variant, columns = 100/125/150/200%.

## Decisions for the author at this gate
- D5 `copilot-warning`: candidate A, the outline cat with a `!` for eyes (main-status-signals-statusbar, main-icon-sheet-panel), or candidate B, a solid cat head with the `!` cut out (variants-status-signals-statusbar, variants-icon-sheet-panel). <reviewer note from Step 3>.
- `toolbar-more` / `ellipsis` / `more`: 3×3 dots 13 units wide (main) or Codicon-sized 2×2 dots on x 3-13 inside the action keyline (`ellipsis.small`). The 2×2 alternative is shown only in variants-icon-sheet-panel: the variants pass's only other sheet, variants-status-signals-statusbar, crops the status bar, which has no `…`.
- `gutter-lightbulb-sparkle-filled` (the gutter mark when every action on the line is an AI action; default: a filled star) is not pinned and stays stock. Pin it to the ✧ cluster in the editor batch (gate 4), to the candle now, or leave it stock?
- Witch hat: a solid silhouette, an exception to section 4's one-filled-accent rule, because a hollow cone under 4 units wide leaves cut-outs under 2 units. Its brim ends in points that render soft at 16px. Keep?
- Status readings that differ from spec 5.2 or section 4; approve, and update the spec, or redraw: `copilot-unavailable` keeps one eye (the slash takes the right eye; the spec lists the eyes as the filled part); `copilot-dot` keeps both eyes and adds a 3×3 ✦ pip between the ears (the spec says "star"); the `terminal-decoration-error` ✕ is a 1.41-wide cut-out, under the 2-unit cut-out minimum.
- G3: accept the remaining off-grid points listed under Preconditions, or name the drawings to redraw.
- Approve batch 1 as redrawn and snapped, the chrome batch and the status batch, or list changes.

## Evidence for decisions already taken (spec section 11.1)
- G4: `terminal-decoration-success` has its own small dot (main-terminal-panel, the `Write-Output` line); `ports-forwarded-with-process-icon` shares that drawing and appears only in the icon sheet (no forwarded ports in the review profile). The dirty tab ✦ is unchanged (main-workbench-tabs).
- G5 as amended (170 keys: the candle also takes `gutter-lightbulb-aifix-auto-fix` and the inline codicons `lightbulb-sparkle`, `lightbulb-autofix`, `lightbulb-sparkle-autofix`): the candle at both quick fixes on spells.ts, inline (main-workbench-code) and in the gutter (main-bulb-gutter-code), in every theme and scale. Mapping the inline codicons also puts the candle on the "accept detected language" status entry and the inline-edit chat status label.
- G6: the three sprig variants in a real status bar: changes (main-workbench-statusbar), staged (main-scm-staged-statusbar), conflicts (main-scm-conflict-statusbar). The plain `git-branch` sprig shows only on a clean tree, which this fixture never has; it was approved at gate 1.
- G7: see "What to judge".
- D5 state list: unavailable (slash), snooze (closed eyes), dot (✦ pip) in main-status-signals-statusbar.

## Choices made in phase 2 that the author may overrule
- Redraws (G7): the spider has a solid round body centred on (8,8), eight knee-bent legs on the circle-14 keyline and its thread on pixel column 7 (spec 5.2 row updated: the filled part is the body). The owl is its face: two eye rings with 3×3 eyes, tufts and a beak, no body (a U-shaped body read as a grin). The moon gate has a 2-unit arch on the full round keyline (outer r7, no feet) and an r4 crescent. The grimoire's crescent moved to x5-9, y3-9; in the compact bar the 13px Explorer badge still covers the clasp's lower tip (about 5% of the crescent), and a smaller clasp would break the 4×4 minimum.
- Snaps (G3): the bell's dome starts at y6 under a handle that runs to y7 (a crown version read as a stepped lamp); the flask's liquid top narrowed from 4 to 3 units to keep 1-unit clearance on the half grid; the cat head's inner wall and the gear's axis teeth moved by at most 0.3 units.
- Chrome: arrow stems on pixel row or column 7, where the stock arrows use 8; filled arrowheads, where the stock heads are open; `add`/`remove` 11 long (2-13), inside the action keyline.
- Status: warning and info on the skull's footprint (x2-14), not the 8-unit signal keyline; `terminal-decoration-success` and `ports-forwarded-with-process-icon` a 6-unit dot (5-11), off the 8-unit keyline and smaller than `terminal-decoration-error` (4-12), the alternative being an 8-unit disc, the outline of `moon-breakpoint`; bell-dot is the whole bell plus a 5×5 ✦ exactly 1 unit from the handle (a 4×4 ✦ read as a speck); `remote` keeps a 2-unit crescent (2.5 filled toward a disc at 16px); `copilot-snooze` draws closed eyes as 2-unit lids; the dirty-branch sprigs carry a solid ✦ / ✓ / ! in Codicon's badge corner with no disc, and staged is ✓ where Codicon uses +; the `bracket` nibs and corner chamfers are 0.71-unit 45° necks, under section 4's 1-unit minimum (a whole-pixel brace read as [ ] at 16px).
- Copilot states and spinners are shown by a helper status entry, not the real chat entry: the signed-out review profile always shows `$(copilot)`. The status bar draws both the same way. A signed-in check of `copilot-unavailable` in notes.md is a one-minute manual step if wanted.
- Terminal decorations are captured in Windows PowerShell, the only always-installed shell VS Code injects shell integration into on Windows; the WSL fish terminal of gate 1 gets none. The glyphs are the same in any shell.
- The fixture repository now has a `rival-brew` branch, an upstream (`../origin.git`), an edited line 1 and three new lines (15-17) in spells.ts, so the conflict, sync, diff-remove and gutter-bulb states exist. Gate 1's scenes still run; their status bars now show the sync item and four errors.
- <glyph-level notes from Step 3>

## Known phase-2 staging artifacts (not defects)
- Every pinned ID in the panel, debug, editor and symbols batches still shows its stock Codicon: `markers-view-icon`, `filter`, `clear-all`, `trash`, the layout toggles, the debug toolbar, `case-sensitive`/`whole-word`/`regex` in the find widget, the ✧ `sparkle`, the symbols in the breadcrumbs.
- Extended-tier IDs stay on Codicons by design (spec section 2): `terminal-decoration-incomplete` (the circle on the open prompt line), `terminal-powershell` (terminal tab), `lock`, and context-menu checkmarks (`menu-selection`).
- The Problems row that has focus shows the quick-fix candle in place of its severity icon (VS Code behaviour).
- Spinner frames are random per capture; compare centres, not angles.
- <harness framing notes from Step 3, if any>

## Harness changes made for this gate
- New scenes: bulb-gutter, problems, find, diff, quick-input, status-signals, scm-staged, scm-conflict. Reworked: workbench (waits for the inline light bulb, the dirty-branch icon and the sync item; crops the whole editor so the inline light bulb is in frame), notifications (one toast per severity) and terminal (PowerShell, one passing and one failing command). Debug and testing scenes are left to gates 3 and 4.
- Helper extension: problems of three severities on notes.md, severity toasts, a multi-step quick pick, the Copilot-state and spinner status entries, git states through the git extension API, and three icon-sheet views.
- <fixes made while running, with the failed run id and the cause>

## Approval
Author: approve gate 2 as is / approve with the changes listed below / redraw. Gate 3 (panel and debug batches) starts only after approval.
````

- [ ] **Step 6: Snapshot the tree and stop**

Run: `mkdir -p review-out && git add -A && git write-tree | tee review-out/TREE_12`
Expected: one 40-character tree id, also saved in `review-out/TREE_12`.

Stop here. Report the README path `docs/qa/2.0-gate-2/README.md`, the tree id in `review-out/TREE_12` and the run id to the author, and wait for the gate decisions. Do not commit (the author commits after gate 2) and do not start the panel, debug, editor or symbols batches.

---
## Later plans (after the author approves gate 2)

**Gate 3: panel and debug batches.** `panel` (9 IDs) and `debug` (23 IDs), with the debug gate's stopped-on-breakpoint scene from gate 1, `debug-hint` on the moon breakpoint, and the reused drawings for the disabled and unverified breakpoint states. The stage names `product-batch:panel` and `product-batch:debug` are appended when each batch is complete.

**Gate 4: editor and symbols batches.** `editor` (33 IDs, plus `gutter-lightbulb-sparkle-filled` if the author pins it for the ✧ cluster at gate 2) and `symbols` (15 IDs). After gate 4, `npm run validate -- --release` lists only `file-icons` and `release`.

---

## Review notes

The plan was assembled from four drafted sections and an adversarial review of each. Every review issue was applied, except the parts listed here.

- **Keys, major 1 (171 keys, `gutter-lightbulb-sparkle-filled` in the editor batch): partly rejected.** Kept: the three inline light-bulb codicons and `gutter-lightbulb-aifix-auto-fix` on the candle, because G5 as written (two gutter IDs) does not change the bulb gate 1 saw (the inline `lightbulb-sparkle`), shown by a real VS Code run; the author has since decided it, and spec section 11.1 records it as an amendment under G5 (170 keys), so the plan states it as decided in Global Constraints, the decisions table and Task 1. Rejected: pinning `gutter-lightbulb-sparkle-filled` now, in either the editor batch (it would push a key into the gate-4 plan and change its pending count) or batch 1 (its default is the AI star, not a bulb, and glossary section 7 gives AI the ✧). It stays unpinned and goes to the author. Total 170 keys, editor batch unchanged at 33.
- **Keys, major 4 (copilot-warning candidate B):** applied, but the replacement differs from both reviews' proposals in one way: the status draft's Codicon-layout badge variant was also rendered and dropped (at 16px the knocked-out head broke into pieces), so the gate compares the outline cat with a `!` (A) against the reviewer's solid head with a `!` cut out (B, `cat-warning.solid`). Variant names follow the drawing name (`cat-warning.*`), because `run-gate.mjs` and the harness test resolve a variant by the text before its first dot.
- **Status, major 1 (bell-dot): applied with a larger star.** The review's 4×4 ✦ beside the whole bell was replaced by a 5×5 ✦ beside the whole bell, because Task 4 adopts the redraws review's bell (dome from y6, longer handle), which leaves exactly 1 unit to the handle. No knockout is needed, the bell outline is unchanged, and the 4×4 star read as a speck at 16px.
- **Status, minor (status-dot 6 units vs 8):** kept at 6 units, because G4 and spec 5.2 ask for a "small dot" distinct from the 8-unit moon; the README offers the 8-unit alternative.
- **Status, minor (moon-gate-small crescent thickness 2.5):** kept at 2 after a 16px render (2.5 filled toward a disc); listed in the README.
- **Redraws, minor (compare.mjs Codicons for cat-head and scrying-glass):** kept `copilot` and `search`, because both IDs are mapped to those drawings too; the agent-browser session part of the issue was applied.
- **Chrome, minor (ellipsis variant name `ellipsis-2x2`):** applied as `ellipsis.small`; a hyphenated name would make `run-gate.mjs` look for a drawing called `ellipsis-2x2`.

Open after assembly (none blocks execution): which gutter ID the `bulb-gutter` scene shows (`gutter-lightbulb-sparkle` or `-aifix-auto-fix`) is not recorded by the harness; all three gutter IDs are on the candle, so the capture is the same either way.

## Self-review notes

- **Gate-1 decisions.** G3: Task 4 (snaps, validator fix, grid test), Task 12 (accepted points). G4: Tasks 1, 7, 10. G5: Tasks 1, 11. G6: Tasks 1, 10, 11. G7: Tasks 2, 3. G1, G2 and G8 need no work beyond what the table records.
- **Spec 5.2 "Shared chrome" rows.** `arrow-left`, `arrow-right`, `quick-input-back`, `find-previous-match`, `find-next-match`, `diff-editor-previous-change`, `diff-editor-next-change`: Task 5. `add`, `plus`, `terminal-new`, `diff-insert`, `remove`, `diff-remove`, `check`, `toolbar-more`, `ellipsis`, `more`: Task 6. That is the 17 `chrome` IDs; the chevron, `breadcrumb-separator` and `close` rows were batch 1.
- **Spec 5.2 "Status and signals" rows.** `warning`, `dialog-warning`, `info`, `dialog-info`, `terminal-decoration-error`, `terminal-decoration-success`: Task 7. `bell-dot`, `remote`, `sync`, `bracket`, `loading`: Task 8. `copilot-unavailable` (activity-bar table row, drawn here), `copilot-snooze`, `copilot-dot`, `copilot-warning`: Task 9. G6's three sprigs and G4's ports ID: Task 10. That is the 19 `status` IDs; `error`, `bell` and `git-branch` were batch 1. `markers-view-icon` ("uses warning") belongs to the `panel` batch and stays for gate 3.
- **Section 8.** Superset coverage per batch: Tasks 6 and 10 append `product-batch:chrome` and `product-batch:status` once every ID is mapped, and their coverage tests in `test/product-icon-theme.test.mjs` name each ID. Glyph source rules and drift: every new drawing and variant passes through `test/glyph-drift.test.mjs`. The soft grid warning is tightened for batch 1 (Task 4) and its remaining hits are listed at the gate. Font geometry: `npm run validate --only product-pipeline` in every drawing task. `release` stays pending.
- **Section 4 rules pinned by tests.** Spin-safe `sync`, `loading`, `gear` (Tasks 4, 8); bell-dot's ✦ clear of the bell by ≥ 1 unit (Task 8) and the bell's free corner (Task 4); arrows and `+` on pixel column/row 7 (Tasks 5, 6); the warning, info and terminal-error cut-outs are holes under the font's fill rule (Task 7); one-unit accent clearances for the Copilot states and sprig badges (Tasks 9, 10); only `gear`, `sync-arrows` and `cat-slash` off the grid (Tasks 4, 10); the spider on the circle-14 keyline (Task 3); no negative winding anywhere (Task 3); the drift test covers SVG regeneration for every module (Tasks 3, 5-10).
- **Names used across tasks.** `parts.star`, `parts.bell`, `parts.catHeadOutline`, `parts.catEyes`, `parts.sprigSmall` (Task 2); `filledAt` (Task 3); `knockOut` (Task 9); `glyphModules = [batch1, chrome, status]` (Tasks 5, 7); drawing names and codepoints as in the codepoint table; variants `ellipsis.small` and `cat-warning.solid`; stages `product-batch:chrome` and `product-batch:status`; helper commands `spellboundReview.severities`, `.statusSignals`, `.quickInput`, `.scm`. Each is defined once and used with the same signature afterwards.
- **Checked while writing.** All twelve tasks were applied in order to a scratch copy of HEAD 81ff905: every red and green test result, `Wrote …`/`Built …` line, claim line, validate output and test total in this plan is from that run. Every new or changed drawing has 0 `glyphRuleProblems` errors and was inspected at 12/16/24 px, DPR 1 and 2, on dark, light and gold backgrounds beside its stock Codicon. The one-scale gate-2 dry run in real VS Code 1.141 produced 168 captures and 0 warnings. After the review fixes (snapshot files, the Task 7 hole test, the Task 9 cat-star identity check, the Task 10 grid test and spec rows, the Task 11 patch and waits), Tasks 1-11 were re-run end to end on a fresh scratch copy of HEAD 81ff905 plus the spec amendment, and every count and output from Task 1 to Task 11 was taken from that run (125, 127, 130, 139, 165, 175, 186, 193, 203, 214, 220, 223 tests).
- **Not checked while writing.** The full four-scale gate run and its variants pass (Task 12), and the 125%/150% renders. The three waits that became required after the dry run (the inline `.lightBulbWidget`, the status bar `codicon-sync`, the warning toast) were checked against the 1.141 workbench bundle and git extension, not in a second real run; Task 11 Step 7 is the first run that exercises them.

## Execution

Recommended: **subagent-driven** (superpowers:subagent-driven-development), because the tasks hand exact interfaces and geometry to one another (`parts`, the snapped bell that bell-dot measures against, the count-free map test, the three-view helper), and a fresh reviewer per task, looking at each glyph sheet independently, catches a drawing that passes its tests but fails at 16px before later tasks build on it.
