# Spellbound Themes 2.0, Gate 3 to Review Gate 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the repo from the approved review gate 3 to review gate 4: fix the harness items the gate-3 reviews deferred to "before the gate-4 run" (tooltips in crops, scene settings applied before the setup, a silent empty dry run, the `<user>` WSL path, the unchecked excuse lists) and the deferred geometry-test minors, pin `gutter-lightbulb-sparkle-filled` (G11), draw the `editor` batch (34 IDs) and the `symbols` batch (15 IDs), enforce both batch stages, and produce the gate-4 screenshot evidence in real VS Code 1.141. Then stop for the author.

**Architecture:** The drawing pipeline is unchanged: drawings are code in `scripts/glyphs/`, `npm run draw:glyphs` writes the SVGs, `scripts/claim-drawing.mjs` maps IDs to a drawing and codepoint, and `npm run build:product-icons` builds the WOFF and the theme. Three new modules join `glyphModules`: `scripts/glyphs/editor.mjs` (the ✧ cluster, hatpins, pages and folders, tree actions, find toggles, replace; it owns the set's one letter construction, exported as `letters`), `scripts/glyphs/layout.mjs` (the title bar's layout toggles, the splits and Customize Layout, from one window-and-pane part) and `scripts/glyphs/symbols.mjs` (the symbol kinds; `abc` is written with the editor module's `letters`). The gate harness waits for every settings write through the window title, re-checks for tooltips after the last crop, releases a chord's modifiers (gate 3's Disconnect came from a held Alt), gains a `hold` step, a third icon-sheet page, a helper that reports one symbol of each kind for `*.grimoire` fixtures, and 21 gate-4 scenes.

**Tech Stack:** Node 24 (ES modules, `node:test`), svgicons2svgfont 15.0.1, svg2ttf 6.1.0, ttf2woff 3.0.0, fontkit 2.0.4, svg-pathdata 7.2.0, @vscode/vsce 3.x, agent-browser 0.38.1 (glyph sheets, comparison pages, contact sheets), Python 3 with Pillow and tesseract (privacy scan OCR, nearest-neighbour crops), VS Code 1.141.0 for Windows (gate captures) with its built-in TypeScript, git, Copilot (signed out) and js-debug.

**Spec:** `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`, especially section 4 (glyph rules, with the gate-2 and gate-3 exceptions), 5.1, 5.2 ("Editor, find, layout, SCM" and "Symbols"), 7 (glossary), 8, 11 (D7), 11.2 (G11, G14, G16) and 11.3 (G20-G23). Previous plans: `docs/superpowers/plans/2026-10-10-spellbound-2-phase-1.md` (conventions, harness), `docs/superpowers/plans/2026-10-10-spellbound-2-gate-2.md` and `docs/superpowers/plans/2026-10-10-spellbound-2-gate-3.md` (glyph-task format, gate run). Gate-3 evidence and approval: `docs/qa/2.0-gate-3/README.md`. Executors read the spec alongside this plan; section numbers below refer to the spec.

## Global Constraints

Kept from the earlier plans (still valid):

- `engines.vscode` stays `^1.100.0`. The package stays declarative: no `main`, no activation events. The review helper extension in `review/` is never referenced from the root `package.json` and is excluded from the VSIX.
- Font ID `witchynibbles-product-icons`, family `WitchyNibbles Product Icons`, file `icons/witchynibbles-product-icons.woff`, theme `src` path `./witchynibbles-product-icons.woff`.
- Glyph sources: `viewBox="0 0 16 16"`, no `width`/`height`, only `<svg>` and `<path>` elements, filled paths only, no `stroke`, no `transform`, no `fill-rule="evenodd"`, every inner subpath wound opposite to its container. Font scale: 64 font units per grid unit (`fontHeight: 1024`), no `centerHorizontally`/`centerVertically`.
- The witchyterm scheme is pinned in this repo (`src/witchyterm-moonlit-candle.scheme.json`); `../witchyterm` is never modified.
- Never kill VS Code by image name (`taskkill /IM Code.exe` would close the author's own editor). Review instances run with their own `--user-data-dir` and `--extensions-dir` and are closed by PID or CDP only. Only Tasks 1 and 13 (dry runs) and 14 (the gate run) launch VS Code, always through `scripts/review/run-gate.mjs`.
- The VS Code 1.141 install is found at run time, never written down: `defaultBundle()` in `scripts/extract-icon-ids.mjs` (or `VSCODE_WORKBENCH_JS`), and `%LOCALAPPDATA%\Programs\Microsoft VS Code` in `run-gate.mjs`. The comparison pages copy the stock `codicon.ttf` next to the bundle through `defaultBundle()`, so no path is written anywhere.

Gate 4:

- Version stays `1.2.1` and `galleryBanner.color` stays `#110d24`; the `release` stage stays pending.
- **No commits until the author approves gate 4.** The one exception is the author's own commit of this plan, before Task 1 (see Before Task 1). Work stays on the checked-out `spellbound-2.0` branch, with no new branches or worktrees. Each task ends with a tree snapshot, `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_N` (N is the task number; `g4/` keeps the gate-3 snapshots in `review-out/g3/` intact; `review-out/` is git-ignored), and the next task's changes are `git add -A && git diff --cached $(cat review-out/g4/TREE_N)`. Worktree-isolated subagents (the recommended execution) put their worktrees under `.claude/worktrees/`, which Task 1 adds to `.gitignore` (and `.claude/**` to `.vscodeignore`); before Task 1 none may exist (see Before Task 1), and only that folder is ignored in git, so other files under `.claude/` still show in `git status`. Because every snapshot stages the tree, `git status --short` lists the whole gate's work from Task 2 on; a step that checks for stray changes uses `git diff --name-only` (working tree against the last snapshot). The tree is dirty throughout and the gate manifest records `repoDirty: true`. When the author commits, messages end with the attribution line the session provides, and the author identity is the repo-local `user.name`/`user.email`.
- Privacy: no Windows or WSL user name, user directory, or account email is ever written into a tracked file, a plan, a commit message or a committed screenshot. Docs write `<user>`. Every committed sheet passes `node scripts/review/privacy-scan.mjs` and a look by the executor before it is staged. Raw captures stay in `review-out/` and are never copied anywhere tracked.
- `node scripts/extract-icon-ids.mjs` prints the resolved bundle path on its first line, and that path holds the Windows user name. Always filter its output to the result lines (`| grep -E '^✓|^✗'`) and never paste the path anywhere.
- Codepoints: existing drawings keep theirs. Editor drawings (Part B1) take `E148`-`E159`, layout drawings (Part B2) `E160`-`E168`, symbol drawings (Part C) `E170`-`E17A`. The gaps `E15A`-`E15F`, `E169`-`E16F` and `E17B`-`E17F` stay unused. A codepoint is never reused within a release (retired ones are listed in the map).
- Modules: `scripts/glyphs/editor.mjs`, `scripts/glyphs/layout.mjs` and `scripts/glyphs/symbols.mjs`, each exporting `drawings` and `variants` like `chrome.mjs` (`variants` stays empty); `scripts/glyphs/index.mjs` ends as `export const glyphModules = [batch1, chrome, status, panel, debug, editor, layout, symbols];`. Every lettered glyph uses `letters` from `editor.mjs` (Task 5); `symbols.mjs` imports it and draws no letters of its own. No gate variant is drawn in this plan (`icons/product-src-variants/` stays absent), so `run-gate.mjs` drops the variants pass.
- Pinned keys go from **172** to **173** (132 core + 41 extras) in Task 2, which pins `gutter-lightbulb-sparkle-filled` (G11). Batch `editor` then has 34 IDs, `symbols` 15. Spec 11.2's G11 line ("171 keys then") is the gate-2 record and stays as written; section 5.1 carries the 173.
- Validation stages: Task 9 appends `product-batch:editor` and Task 12 appends `product-batch:symbols` to `scripts/validation-stage.json`, each only once every ID of its batch is mapped.
- Drawings follow section 4 as amended at gates 2 and 3: keylines; whole-number edges for horizontal and vertical strokes; odd-width central features on pixel column 7 (x 7-8); accents ≥3×3 (dot) or ≥4×4 (shape); one full unit between an accent and a stroke, measured with `outlineGap` on the outlines (it throws on an empty set, so a filter that matched nothing cannot pass a clearance test); cut-outs ≥2 units except straight slots ≥4 long and the documented exceptions; no gap or sliver under 1 unit; the only off-grid points stay those of `gear`, `sync-arrows` and `cat-slash` (G16), and the only sub-unit radius the dashed ring's (G21).
- `node scripts/validate.mjs` writes its `✗` lines to stderr. Every command that pipes validate output into `grep` uses `2>&1`.
- agent-browser: every command block starts with `export AGENT_BROWSER_SESSION=spellbound-gate4` (one session name for every executor of this plan), every screenshot path is absolute (`"$PWD/…"`), and the block ends with `agent-browser close`. `review-out/` is git-ignored, so pages and PNGs written there never enter a snapshot.
- Scratch files: comparison pages live in `review-out/g4-editor/`, `review-out/g4-layout/` and `review-out/g4-symbols/`. Never name a scratch file `*-test.mjs`, `*.test.mjs` or `test-*.mjs` anywhere in the repo, `review-out/` included: `node --test` collects them and `npm test` runs them (a drafter's `review-out/…/t1-test.mjs` failed `npm test`).
- `run-gate.mjs` rejects unknown options with exit code 2 and prints its usage with `--help`; dry runs use `--scales`, `--scenes` and `--skip-variants`. After Task 1 it also stops with its usage when no pass would capture an asked scene.
- Test totals below were measured by applying this plan's tasks in order, Task 1 to Task 13, to a scratch worktree of HEAD (`2ec5b09`) with the `../witchyterm` sibling present, so nothing skipped. They are the real-repo values: in a worktree without that sibling, `test/witchyterm-pin.test.mjs` skips its one test, so `ℹ pass` is one lower there and `ℹ skipped 1` appears. In a git worktree `node_modules` is a symlink that `git add -A` stages; unstage it (`git reset -q node_modules`) before `git write-tree` there. In the real repo none of this applies. `node --test` with several files runs them in file-name order, and the TAP numbers run on across the files.

### Glyph sheet procedure (used by every drawing task)

```bash
export AGENT_BROWSER_SESSION=spellbound-gate4
npm run glyph-sheet
agent-browser set viewport 1800 1400 1
agent-browser open "file://$PWD/review-out/glyph-sheet/index.html"
agent-browser screenshot --full "$PWD/review-out/glyph-sheet/sheet@1x.png"
agent-browser set viewport 1800 1400 2
agent-browser open "file://$PWD/review-out/glyph-sheet/index.html"
agent-browser screenshot --full "$PWD/review-out/glyph-sheet/sheet@2x.png"
agent-browser close
```

Expected: both PNGs exist and every drawing renders from the built font (no empty boxes). Open them with the Read tool; crop and upscale with nearest-neighbour scaling (PIL) when a 16px glyph is too small to judge in the full sheet. A drawing that passes its tests but does not read at 16px is redrawn before the task ends (gate-2 and gate-3 lesson: reviewers who rendered the glyphs caught what code review missed). Each drawing task also renders its comparison page (house glyph beside the stock Codicon it replaces) and judges the 16px cells at 1x and 2x.

## Review Focus

The five ways this work is most likely to fail a user, none of which the gate-3 tests exercise, and the test that now pins each:

1. **A gate sheet shows a state the user never sees, and the author decides on it.** `capture.mjs` pressed every chord's modifiers down and never released them, so VS Code kept Alt held and drew Alt alternatives: gate 3's toolbar "Disconnect" (the reason recorded for G23 came from it) and Split Editor Down where Right was asked for. Expected: no modifier is held after a chord unless a step asks for it, and the gate-4 sheets show exactly the state each scene names. Pinned by `capture.mjs releases the modifiers of every chord, and holds Alt only where a step asks` and `gate 4 waits for the two debug IDs pinned after the gate-3 run` (Task 13).
2. **A scene captures before its own settings apply.** The scene-settings wait passed at once whenever the theme did not change (a cut-down run, a variant), and six gate-4 scenes depend on a setting (header and row actions always shown in `explorer` and `scm`, the split direction in `split-down`, the side bar on the right in the two `layout-right` scenes, no file icon theme in `suggest`). Expected: every settings write is in force before the setup and before every capture. Pinned by `every settings write is applied before the run goes on, even when the theme stays the same` (Task 1) and `gate 4 scene settings: header and row actions always shown, the split direction, no file icon theme for the suggest list` (Task 13).
3. **A letter closes up at 16px, so `Aa`, `ab̲`, `AB` or `abc` stop reading as words.** The find toggles and the symbols' `abc` are letters drawn at 16px; a counter under 2 units or a 1.5-unit stem fills in, and a single-storey `a` read as "obc". Expected: one letter construction for the whole set, every counter a real hole of at least 2×2, a double-storey `a`. Pinned by `the toggles share one letter construction …`, `every toggle counter is a real hole at least 2 units across …` and `the shared letters keep the construction at the symbols size …` (Task 5; a 1-unit `a` counter fails all three), and by `abc (string, text): the shared letters at the symbols size, read row by row at 16px, with a double-storey a` and `abc calls the live shared letters of the editor module (Task 5) at the symbols size, not a copy of them` (Task 10; a single-storey `a` fails both).
4. **A layout control shows the wrong side or the wrong state.** The title bar's layout controls swap `-off` and on glyphs as parts are hidden and shown, and swap left and right IDs when the side bar moves; a pane on the wrong side, or an on/off pair that differs in more than the pane, tells the user the opposite of the truth. Pinned by `on and off differ only in the pane: one hole, the size of the pane` and `the right pane is the left pane mirrored about x = 8, and the bottom pane the left pane turned onto the bottom edge` (Task 8), `every layout ID maps to the drawing of its Codicon default, so layout IDs share a drawing exactly when they share a default` (Task 9), and `gate 4 reaches each layout toggle state in the title bar and checks nothing covers it` (Task 13).
5. **Two symbol kinds look alike in a 16px list.** The suggest widget, Go to Symbol and the Outline put the symbol icons side by side, and colour does not separate them (class `#77D9FF` and the default field and interface `#75BEFF` in three themes; six kinds take the plain foreground). Expected: every symbol glyph named without its label in a one-colour 16px list. Pinned by `at 16px every symbol drawing differs from every other, and from the braces of module and namespace, in 40+ pixels` (Task 12; measured minimum 46, `snippet-frame` against `braces`) and by `every symbols-batch ID maps to its drawing and codepoint, shared only where the stock Codicon shares` (Task 12), plus Task 12 Step 4's explicit list judgement in all four themes.

## Resolved decisions

The decisions this plan applies or must respect, and what it does for each.

| # | Decision | Tasks | What this plan does |
| :- | :- | :- | :- |
| G11 | `gutter-lightbulb-sparkle-filled` joins the editor batch on the ✧ cluster at gate 4 | 2, 13, 14 | Task 2 pins it (`registered`, default `sparkle-filled`, `extra`, `editor`, read from the 1.141 bundle) and claims it onto `sparkle-cluster` with `sparkle`; 173 keys; spec 2 and 5.1 and the inventory say so. Task 13 waits for it in the gutter of `hexes.ts` line 4, where the built-in Copilot's Fix and Explain are the only actions. |
| G14 | A ✦ badge is 5×5 with a waist of 1 | 2 | The cluster's two small stars and the 7×7 pin head use waist 1; the large cluster star uses the dirty star's 1.5 core. |
| G12, G26 | Solid silhouettes allowed as exceptions (witch hat, quill vane) | 11, 14 | The wrench (`symbol-property`) is one solid shape with the jaw cut out; the README asks the author to keep it. |
| G16 | Off-grid points only in `gear`, `sync-arrows`, `cat-slash` | 2-12 | No editor, layout or symbol drawing adds one; the across-modules grid test is unchanged, and every drawing task expects exactly those three `⚠` lines. |
| G20 | `debug-breakpoint-log-unverified` on the dashed ring | 13 | A logpoint on `unbrewed.js` line 3 (`breakpoints.json`), waited for in the gutter during the session. |
| G21 | The one sub-unit radius is the dashed ring | 2-12 | No new drawing adds a sub-unit radius or gap. Task 7 pins the ring's own dash spacing (≥1 unit). |
| G22 | Restart stays light (1-unit band, filled head) | 4 | `refresh` is restart's construction mirrored about x = 8, so the two weigh the same and turn opposite ways. |
| G23 | `debug-disconnect` on the Stop square | 13, 14 | Waited for on the floating toolbar with Alt held: in 1.141 it is Stop's Alt alternative for a Node.js launch. Gate 3 saw it in Stop's place only because Alt was left held. The README asks the author to correct the reason recorded in spec 11.3; this plan does not edit G23. |
| D7 | Legacy layout keys dropped; `panel-right`/`-off`, `auxiliarybar-left-layout-icon`/`-off`, `panel-bottom` are mirrored pane drawings in the editor batch | 8, 9 | IDs share a drawing exactly when their registered defaults share a Codicon; right = left mirrored about x = 8, bottom = left turned onto the bottom edge, from one part. Pinned by a mirror test and the sharing test. |
| Spec 5.2 Symbols | Codicon meanings kept, redrawn in the house style | 10-12 | 11 drawings; the stock sharing kept (method/function, string/text, module/namespace on `braces`). Task 12 records the batch as a table in spec 5.2. |
| Gate-3 ledger | Deferred to before the gate-4 run: tooltip re-check and `.debug-hover-widget`; `NOT_IN_CONTEXT` keys never checked; `filterJob` empty-pass guard (and, found in this plan's review, the variants pass dropped only after it); scene-settings wait on subset runs; `\\wsl.localhost\…\<user>` false positive. Deferred minors: dash-gap assertion, knockOut complement, step-arrow guard, badge-literal comment, debug coverage title | 1, 7 | Task 1 fixes the five harness items test-first; Task 7 closes the geometry and test minors (two were already closed at HEAD and are only checked). |

## File structure

Created:

- `scripts/glyphs/editor.mjs` (Tasks 2-6), `scripts/glyphs/layout.mjs` (Tasks 8, 9), `scripts/glyphs/symbols.mjs` (Tasks 10-12): glyph modules.
- `test/editor-glyphs.test.mjs` (Task 2), `test/layout-glyphs.test.mjs` (Task 8), `test/symbols-glyphs.test.mjs` (Task 10).
- `icons/product-src/*.svg` for the 38 new drawings (generated).
- `review/jobs/gate-4.json`, `review/workspace/hexes.ts`, `review/workspace/symbols.grimoire`, `review/workspace/charms.grimoire` (Task 13).
- `docs/qa/2.0-gate-4/` (Task 14): README, manifest and 22 contact sheets.

Modified:

- `scripts/review/capture.mjs` (Task 1: tooltip selector and re-check, `applySettings`; Task 13: modifier release, `hold` step), `scripts/review/args.mjs`, `scripts/review/run-gate.mjs`, `scripts/review/privacy-scan.mjs`, `.gitignore`, `.vscodeignore` (Task 1).
- `review/helper-extension/{extension.js,package.json,README.md,breakpoints.json}` (Task 13, version 0.0.5), `review/profile/keybindings.json` (Task 13, 17 chords).
- `scripts/glyphs/index.mjs` (Tasks 2, 8, 10), `scripts/validation-stage.json` (Tasks 9, 12).
- `icons/product-icon-ids.json` (Task 2, G11), `icons/product-icon-map.json`, `icons/product-icon-theme.json`, `icons/witchynibbles-product-icons.woff` (regenerated in every drawing task).
- `test/review-harness.test.mjs` (Tasks 1, 11, 13), `test/review-args.test.mjs`, `test/privacy-scan.test.mjs` (Task 1), `test/product-icon-ids.test.mjs` (Task 2), `test/product-icon-theme.test.mjs` (Tasks 2-7, 9, 12), `test/glyph-primitives.test.mjs`, `test/debug-glyphs.test.mjs`, `test/status-glyphs.test.mjs` (Task 7).
- `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (Task 2: sections 2 and 5.1, 173 keys; Task 12: the Symbols table in 5.2), `docs/research/vscode-1.141-icon-inventory.md` (Task 2).

Not committed (git-ignored): `review-out/g4-editor/make.mjs` (Task 2, reused in Tasks 3-6), `review-out/g4-layout/make.mjs` (Task 8, reused in Task 9), `review-out/g4-symbols/make.mjs` (Task 10, reused in Tasks 11-12), snapshots in `review-out/g4/`, sheets and dry runs under `review-out/`.

## Staging: how each batch counts down

Unmapped IDs per batch, from `node scripts/validate.mjs --only product-batch:<batch> 2>&1 | grep -c 'does not map'`, the map size from `npm run build:product-icons`, and `npm test`:

| After | `editor` | `symbols` | Drawings / IDs in the map | `npm test` tests | Stages enforced |
| :- | :- | :- | :- | :- | :- |
| HEAD | 33 | 15 | 71 / 124 | 302 | base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug |
| Task 1 | 33 | 15 | 71 / 124 | 309 | same |
| Task 2 | 30 (34 once G11 is pinned) | 15 | 74 / 128 | 318 | same |
| Task 3 | 25 | 15 | 79 / 133 | 328 | same |
| Task 4 | 21 | 15 | 83 / 137 | 337 | same |
| Task 5 | 17 | 15 | 87 / 141 | 346 | same |
| Task 6 | 14 | 15 | 89 / 144 | 351 | same |
| Task 7 | 14 | 15 | 89 / 144 | 352 | same |
| Task 8 | 3 | 15 | 95 / 155 | 364 | same |
| Task 9 | 0 | 15 | 98 / 158 | 371 | + product-batch:editor |
| Task 10 | 0 | 8 | 102 / 165 | 381 | same |
| Task 11 | 0 | 3 | 106 / 170 | 389 | same |
| Task 12 | 0 | 0 | 109 / 173 | 397 | + product-batch:symbols |
| Task 13 | 0 | 0 | 109 / 173 | 405 | same |

`file-icons` (19) and `release` (2) stay pending throughout. The map passes 102 drawings in Task 11, so the icon sheet needs a third page from then on: Task 11 moves the page-count assertion to three pages, and Task 13 adds the `icon-sheet-3` scene. At 109 drawings the pages hold 51, 51 and 7.

## Codepoints for the new drawings

| Codepoint | Drawing | Task | IDs |
| :- | :- | :- | :- |
| E148 | `sparkle-cluster` | 2 | sparkle, gutter-lightbulb-sparkle-filled |
| E149 | `pin-round` | 2 | pinned |
| E14A | `pin-star` | 2 | pinned-dirty |
| E14B | `page` | 3 | symbol-file |
| E14C | `page-plus` | 3 | new-file |
| E14D | `page-arrow` | 3 | go-to-file |
| E14E | `folder` | 3 | symbol-folder |
| E14F | `folder-plus` | 3 | new-folder |
| E150 | `collapse-stack` | 4 | collapse-all |
| E151 | `tree-node` | 4 | list-tree |
| E152 | `undo-arrow` | 4 | discard |
| E153 | `refresh-arrow` | 4 | refresh |
| E154 | `toggle-case` | 5 | case-sensitive |
| E155 | `toggle-word` | 5 | whole-word |
| E156 | `toggle-regex` | 5 | regex |
| E157 | `toggle-preserve` | 5 | preserve-case |
| E158 | `replace-box` | 6 | find-replace |
| E159 | `replace-stack` | 6 | find-replace-all, search-replace-all |
| E160 | `pane-left` | 8 | panel-left, auxiliarybar-left-layout-icon |
| E161 | `pane-left-off` | 8 | panel-left-off, auxiliarybar-left-off-layout-icon |
| E162 | `pane-right` | 8 | auxiliarybar-right-layout-icon, panel-right |
| E163 | `pane-right-off` | 8 | auxiliarybar-right-off-layout-icon, panel-right-off |
| E164 | `pane-bottom` | 8 | panel-layout-icon, panel-bottom |
| E165 | `pane-bottom-off` | 8 | panel-layout-icon-off |
| E166 | `split-horizontal` | 9 | split-horizontal |
| E167 | `split-vertical` | 9 | split-vertical |
| E168 | `four-panes` | 9 | configure-layout-icon |
| E170 | `abc` | 10 | symbol-string, symbol-text |
| E171 | `bracket-x` | 10 | symbol-variable |
| E172 | `keyword-lines` | 10 | symbol-keyword |
| E173 | `snippet-frame` | 10 | symbol-snippet |
| E174 | `cube` | 11 | symbol-method, symbol-function |
| E175 | `slab` | 11 | symbol-field |
| E176 | `wrench` | 11 | symbol-property |
| E177 | `equals-block` | 11 | symbol-constant |
| E178 | `class-tree` | 12 | symbol-class |
| E179 | `lollipop` | 12 | symbol-interface |
| E17A | `cards` | 12 | symbol-enum |

Existing drawing that gains IDs: `braces` (E128, status batch) takes `symbol-module` and `symbol-namespace` (Task 10; the stock EA8B outline is identical to `bracket`'s EB0F). No existing drawing changes shape. E15A-E15F, E169-E16F and E17B-E17F stay unused.

---

## Before Task 1

The author commits this plan on `spellbound-2.0` before Task 1 starts. Executors do not make that commit. Check it:

Run: `git status --short | wc -l && git log -1 --format=%s -- docs/superpowers/plans/2026-10-10-spellbound-2-gate-4.md && git worktree list | wc -l`
Expected: `0`, then the subject of the author's commit, then `1` (the main repo only). If the first line is not `0`, stop and ask the author: an uncommitted plan would end up in Task 1's snapshot. If `git worktree list` shows more than the main repo (stale agent worktrees under `.claude/worktrees/`), stop and ask the author: until Task 1 ignores that folder, `git add -A` would stage them as embedded repositories and `vsce` would package their files (`test/package-contents.test.mjs` fails).

Then check the tools the plan needs: `node --version` (v24), `agent-browser --version` (0.38.1), `python3 -c "import PIL"` and `tesseract --version` (the privacy scan fails closed without them), `node -e "import('./scripts/extract-icon-ids.mjs').then(m => console.log(m.defaultBundle() ? 'bundle found' : 'no bundle'))"` prints `bundle found`, and `npm test 2>&1 | grep -E '^ℹ (tests|fail)'` prints `ℹ tests 302` and `ℹ fail 0`.

---

## Part A: harness fixes deferred to "before the gate-4 run"

The gate-3 final review deferred five harness items to "before the gate-4 run" (SDD ledger, gate 3, "Final fix wave" and the Task 3 and Task 10 minors). Each one can put a wrong or private picture into a committed sheet, or start a run that captures nothing, so they land before any drawing task:

1. `capture.mjs` checks for a tooltip once, before the `full` screenshot of each theme. A tooltip that opens while the crops are taken ends up in them, and a tooltip can show a path (a Call Stack frame's tooltip is an absolute path). The selector also misses the debug hover (`.debug-hover-widget`, a variable's value while stopped), which is neither a `.workbench-hover` nor a `.monaco-hover`.
2. The gate-3 coverage test never checks that the keys of `NOT_IN_CONTEXT` (and `PINNED_AFTER_GATE_3_RUN`, `OVERLAYS`) are batch IDs. A key that is not one (a typo, an ID that moved batches) excuses nothing and goes unnoticed.
3. `filterJob` drops a pass left with nothing to capture. When a dry run asks for a scene that is in no pass's own `scenes` list, every pass is dropped, and `run-gate.mjs` builds, packages and launches a capture of nothing (unreachable with the gate-1 to gate-3 jobs, whose main pass has no list; the gate-4 job has a variants pass with one). `run-gate.mjs` also dropped the variants pass (`--skip-variants`, or no variant drawing) only after `filterJob` had accepted the job, so a scene only that pass captures slipped through the same way (found in the gate-4 plan review).
4. After writing a scene's settings, `capture.mjs` waits only until the first theme is applied. In a cut-down run (`--scenes`), or when a variant changes a setting but not the theme, the window already shows that theme, so the wait passes at once and the setup can start before VS Code has read the scene's settings. Gate 4 has six scenes that depend on a scene setting (`explorer`, `scm`, `split-down`, `layout-right`, `layout-right-swap`, `suggest`).
5. `findPrivateText` accepts the documented `<user>` placeholder in `C:\Users\<user>` and `/home/<user>`, but flags `\\wsl.localhost\Ubuntu\home\<user>` and `\\wsl$\…\home\<user>`.

How item 4 is fixed, checked in VS Code 1.141 while writing this part: every settings write now also sets `window.title` to `${rootName}` followed by one or two zero-width spaces (alternating, so each write differs from the one before), and `capture.mjs` waits until `document.title` ends with exactly that mark. A probe scene with `"window.title": "spellbound-token-one"` showed `document.title` equal to the token, and the command centre in the title bar then showed the token too, so a visible token is not an option. With the zero-width mark the command centre still reads "workspace" (checked in the gate-2 `workbench` titlebar crop of run 2026-10-10T21-03-03).

The deferred dashed-ring dash-gap assertion is a geometry test and is Part B2's.

One more item comes from this plan's own review: worktree-isolated subagents (the recommended execution) check out whole copies of the repo under `.claude/worktrees/`. Untracked, they are staged by every snapshot's `git add -A` as embedded repositories, and `vsce` packages their files, which fails `test/package-contents.test.mjs`. Task 1 ignores that folder in git and in the VSIX. Only `.claude/worktrees/` is ignored in git: the author may track project settings in `.claude/` later.

### Task 1: Harness fixes: tooltips after the last crop, settings that are applied before the setup, no silent empty dry run, the `<user>` WSL path, agent worktrees ignored

**Files:**
- Modify: `scripts/review/capture.mjs` (tooltip selector and re-check, `applySettings`), `scripts/review/args.mjs` (`filterJob`), `scripts/review/run-gate.mjs` (the variants pass dropped before `filterJob`), `scripts/review/privacy-scan.mjs` (WSL placeholder), `.gitignore`, `.vscodeignore`, `test/review-harness.test.mjs`, `test/review-args.test.mjs`, `test/privacy-scan.test.mjs`

**Interfaces:**
- Consumes: nothing from other tasks of this plan.
- Produces:
  - `NO_TOOLTIP` (`capture.mjs`) covers `.workbench-hover, .monaco-hover, .debug-hover-widget`. After the last crop of each theme and variant, `capture.mjs` evaluates it again and stops the run with `<pass>/<scale>/<scene>/<theme>: a tooltip opened during the captures` if a tooltip is shown.
  - `applySettings(theme, extra)` inside the capture loop: writes `settings.json` with `window.title` set to `${rootName}` and a zero-width mark, waits (20 s) until the window title ends with that mark, then waits for the theme. Every settings write in the scene loop (the scene's settings before its setup, each theme and variant before its captures) goes through it. Task 13's scenes rely on it.
  - `filterJob(job, { scales, scenes, skipVariants })` throws `No pass captures scene '<name>'` when no remaining pass would capture an asked scene; with `skipVariants` it drops the variants pass first. `run-gate.mjs` passes `skipVariants` when `--skip-variants` is given or `icons/product-src-variants/` holds no drawing, and turns the error into exit 2 with the usage, before it builds anything.
  - `.gitignore` holds `.claude/worktrees/` and `.vscodeignore` holds `.claude/**`.
  - `findPrivateText` accepts `\\wsl.localhost\…\home\<user>` and `\\wsl$\…\home\<user>`.

- [ ] **Step 1: Write the failing tests**

```bash
git apply <<'PATCH'
diff --git a/test/privacy-scan.test.mjs b/test/privacy-scan.test.mjs
index 1a965e3..00e9b4d 100644
--- a/test/privacy-scan.test.mjs
+++ b/test/privacy-scan.test.mjs
@@ -32,6 +32,13 @@ test('findPrivateText reads paths the way OCR spaces them, WSL network paths and
   assert.deepEqual(findPrivateText('review@localhost (the fixture identity)', []), [], 'no top-level domain, no address');
 });
 
+test('findPrivateText accepts the documented <user> placeholder in a WSL network path too', () => {
+  // Gate-3 review: C:\Users\<user> and /home/<user> passed, but \\wsl.localhost\...\home\<user> was flagged.
+  assert.deepEqual(findPrivateText('\\\\wsl.localhost\\Ubuntu\\home\\<user>\\projects', []), []);
+  assert.deepEqual(findPrivateText('\\\\wsl$\\Ubuntu\\home\\<user>\\projects', []), []);
+  assert.deepEqual(findPrivateText('\\\\wsl$\\Ubuntu\\home\\someone\\projects', []), ['user directory "\\\\wsl$\\Ubuntu\\home\\someone"']);
+});
+
 test('findPrivateText ignores names too short to match reliably', () => {
   assert.deepEqual(findPrivateText('a quick wizard', ['a', 'qu']), []);
 });
diff --git a/test/review-args.test.mjs b/test/review-args.test.mjs
index 430e8a1..d8a3692 100644
--- a/test/review-args.test.mjs
+++ b/test/review-args.test.mjs
@@ -3,6 +3,8 @@
 import test from 'node:test';
 import assert from 'node:assert/strict';
 import { spawnSync } from 'node:child_process';
+import fs from 'node:fs';
+import os from 'node:os';
 import path from 'node:path';
 import { filterJob, parseGateArgs } from '../scripts/review/args.mjs';
 
@@ -44,6 +46,46 @@ test('filterJob keeps only the asked scales and scenes, and drops a pass left wi
   assert.throws(() => filterJob(job(), { scales: [3], scenes: null }), /No pass captures at scale 3/);
 });
 
+test('filterJob stops when no pass would capture an asked scene, rather than dropping every pass', () => {
+  // Gate-3 review: a scene that is in no pass's own scenes list left the cut job with no pass at all, and run-gate.mjs
+  // went on to build, package and launch a capture of nothing.
+  const listed = () => ({
+    passes: [
+      { name: 'main', vsix: ['spellbound-main.vsix'], scales: [1, 2], scenes: ['panel'] },
+      { name: 'variants', vsix: ['spellbound-variants.vsix'], scales: [1, 2], scenes: ['debug'] },
+    ],
+    scenes: [{ name: 'panel' }, { name: 'debug' }, { name: 'icon-sheet' }],
+  });
+  assert.throws(() => filterJob(listed(), { scales: null, scenes: ['icon-sheet'] }), /No pass captures scene 'icon-sheet'/);
+  assert.throws(() => filterJob(listed(), { scales: [2], scenes: ['panel', 'icon-sheet'] }), /No pass captures scene 'icon-sheet'/);
+  assert.deepEqual(filterJob(listed(), { scales: null, scenes: ['debug'] }).passes.map((pass) => pass.name), ['variants']);
+  // With --skip-variants (or no variant drawing) the variants pass is gone before the check, so its scenes stop too.
+  assert.throws(() => filterJob(listed(), { scales: null, scenes: ['debug'], skipVariants: true }), /No pass captures scene 'debug'/);
+});
+
+test('run-gate.mjs drops the variants pass before it cuts the job, so a scene only that pass captures stops with --skip-variants', () => {
+  // Gate-4 review: run-gate.mjs dropped the variants pass after filterJob had accepted a scene only that pass captures,
+  // which left a capture of nothing. PATH is emptied so that a run-gate.mjs without the fix fails at its first shell
+  // command instead of building anything.
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-job-'));
+  const file = path.join(dir, 'job.json');
+  fs.writeFileSync(file, JSON.stringify({
+    passes: [
+      { name: 'main', vsix: ['spellbound-main.vsix'], scales: [1], scenes: ['panel'] },
+      { name: 'variants', vsix: ['spellbound-variants.vsix'], scales: [1], scenes: ['icon-sheet'] },
+    ],
+    scenes: [{ name: 'panel' }, { name: 'icon-sheet' }],
+  }));
+  try {
+    const result = spawnSync(process.execPath, ['scripts/review/run-gate.mjs', '--job', path.relative(root, file), '--skip-variants', '--scenes=icon-sheet'],
+      { cwd: root, encoding: 'utf8', timeout: 10000, env: { ...process.env, PATH: '' } });
+    assert.equal(result.status, 2, result.stderr);
+    assert.match(result.stderr, /No pass captures scene 'icon-sheet'/);
+  } finally {
+    fs.rmSync(dir, { recursive: true, force: true });
+  }
+});
+
 test('run-gate.mjs stops on an unknown option before it builds or launches anything, and prints usage for --help', () => {
   const run = (...args) => spawnSync(process.execPath, ['scripts/review/run-gate.mjs', ...args], { cwd: root, encoding: 'utf8', timeout: 10000 });
   const bad = run('--jobs', 'review/jobs/gate-3.json');
diff --git a/test/review-harness.test.mjs b/test/review-harness.test.mjs
index 785140f..2931f40 100644
--- a/test/review-harness.test.mjs
+++ b/test/review-harness.test.mjs
@@ -350,8 +350,56 @@ test('gate 3 shows the panel tab icons through a scene setting that holds for th
   assert.deepEqual(scene.settings, { 'workbench.panel.showLabels': false });
   const source = read('scripts/review/capture.mjs');
   const loop = source.slice(source.indexOf('for (const scene of job.scenes'));
-  assert.ok(loop.indexOf('settingsFor(job.themes[0], sceneSettings)') < loop.indexOf('for (const step of scene.setup'), 'scene settings are written before the setup');
-  assert.match(loop, /settingsFor\(theme, \{ \.\.\.sceneSettings, \.\.\.variant\.settings \}\)/, 'and kept for every capture');
+  assert.ok(loop.indexOf('applySettings(job.themes[0], sceneSettings)') < loop.indexOf('for (const step of scene.setup'), 'scene settings are applied before the setup');
+  assert.match(loop, /applySettings\(theme, \{ \.\.\.sceneSettings, \.\.\.variant\.settings \}\)/, 'and kept for every capture');
+});
+
+test('every ID the gate-3 coverage test excuses or reaches through an overlay is a panel or debug ID', () => {
+  // Gate-3 review: a key in these lists that is not a batch ID (a typo, or an ID that moved batches) excuses nothing and
+  // goes unnoticed.
+  const { ids } = json('icons/product-icon-ids.json');
+  for (const id of [...Object.keys(NOT_IN_CONTEXT), ...Object.keys(PINNED_AFTER_GATE_3_RUN), ...Object.keys(OVERLAYS)]) {
+    assert.ok(['panel', 'debug'].includes(ids[id]?.batch), id);
+  }
+});
+
+test('agent worktrees under .claude/worktrees/ never reach a snapshot or the VSIX', () => {
+  // Gate-4 review: worktree-isolated subagents put whole checkouts under .claude/worktrees/. Untracked, they were staged
+  // by every snapshot's git add -A as embedded repositories, and vsce packaged their files (the package-contents test
+  // failed). Only the worktrees folder is ignored in git: the author may track project settings in .claude/ later.
+  assert.ok(read('.gitignore').split('\n').includes('.claude/worktrees/'), '.gitignore');
+  assert.ok(read('.vscodeignore').split('\n').includes('.claude/**'), '.vscodeignore');
+});
+
+test('no tooltip is in any capture: checked before the first screenshot of each theme and again after its last crop', () => {
+  // Gate-3 review: NO_TOOLTIP was checked once, before the full screenshot, so a tooltip that opened during the crops
+  // would be in them. A debug hover (a variable's value while stopped) is a .debug-hover-widget, not a .monaco-hover.
+  const capture = read('scripts/review/capture.mjs');
+  const selector = capture.match(/const NO_TOOLTIP = `!\[\.\.\.document\.querySelectorAll\('([^']+)'\)\]/)[1];
+  assert.deepEqual(selector.split(', '), ['.workbench-hover', '.monaco-hover', '.debug-hover-widget']);
+  const lastCrop = capture.indexOf('await shoot(crop.name, clip);');
+  const recheck = capture.indexOf('if (!(await cdp.evaluate(NO_TOOLTIP)))', lastCrop);
+  assert.ok(lastCrop > 0 && recheck > lastCrop, 'checked again after the last crop');
+  assert.ok(recheck < capture.indexOf('for (const step of scene.teardown'), 'before the teardown moves on');
+  assert.match(capture.slice(recheck, recheck + 200), /throw new Error\(`\$\{where\}\/\$\{theme\.slug\}: a tooltip/);
+});
+
+test('every settings write is applied before the run goes on, even when the theme stays the same', () => {
+  // Gate-3 review: after writing a scene's settings, capture.mjs waited only for the first theme, which a cut-down run
+  // (--scenes) or a variant in the same theme already showed, so the setup could start before VS Code had read the
+  // scene's settings. Every write now carries its own window title (the workspace name and one or two zero-width spaces,
+  // so the command centre still reads "workspace"), and capture.mjs waits until the window shows it.
+  const capture = read('scripts/review/capture.mjs');
+  const start = capture.indexOf('const applySettings = async');
+  assert.ok(start > 0, 'one function writes the settings and waits for them');
+  const body = capture.slice(start, capture.indexOf('\n    };\n', start));
+  assert.match(body, /'\\u200b'\.repeat\(1 \+ \(\+\+settingsWrites % 2\)\)/, 'each write differs from the one before it');
+  assert.match(body, /'window\.title': `\\\$\{rootName\}\$\{mark\}`/);
+  // Awaited, both of them: without the await the run races the settings again (gate-4 review mutation).
+  assert.match(body, /await waitFor\(\(\) => cdp\.evaluate\(`document\.title\.endsWith\(\$\{JSON\.stringify\(mark\)\}\) && !document\.title\.endsWith/);
+  assert.match(body, /await waitFor\(\(\) => cdp\.evaluate\(themeApplied\(theme\.signature\)\)/, 'and still waits for the theme');
+  const loop = capture.slice(capture.indexOf('for (const scene of job.scenes'));
+  assert.equal(loop.split("writeUserFile(userDataDir, 'settings.json'").length - 1, 0, 'the scene loop writes settings only through applySettings');
 });
 
 test('gate 3 reaches debug-hint by moving the pointer onto the glyph margin', () => {
PATCH
```

What the patch does:
- `test/privacy-scan.test.mjs`: the `<user>` placeholder passes in both WSL network path forms; a real name in the same position is still flagged.
- `test/review-args.test.mjs`: a scene that no pass captures stops `filterJob`, with or without `--scales`; a scene only the variants pass captures keeps that pass alone, and stops once `skipVariants` drops that pass; `run-gate.mjs` with `--skip-variants` and a scene only the variants pass captures exits 2 (spawned with an empty `PATH`, so a `run-gate.mjs` without the fix fails at its first shell command instead of building anything).
- `test/review-harness.test.mjs`:
  - the gate-3 scene-settings test now looks for `applySettings(...)` where it looked for `settingsFor(...)` (same order: before the setup, and merged into every capture);
  - `every ID the gate-3 coverage test excuses or reaches through an overlay is a panel or debug ID` pins the three lists. It passes at once: it guards the lists, and no production code changes for it;
  - the tooltip test requires `.debug-hover-widget` in `NO_TOOLTIP` and a re-check after the last crop that stops the run;
  - the settings test requires one `applySettings` with the alternating zero-width mark, the awaited title wait and the awaited theme wait (without `await` the run races the settings again), and no other settings write in the scene loop;
  - `agent worktrees under .claude/worktrees/ never reach a snapshot or the VSIX` requires the two ignore lines.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/review-args.test.mjs test/privacy-scan.test.mjs test/review-harness.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected:

```
ℹ tests 48
ℹ pass 41
ℹ fail 7
```

With `--test-reporter=tap … | grep '^not ok'` the seven failures are `not ok 3`, `14`, `15`, `39`, `41`, `42` and `43` (the files run in name order and the numbers run on across them):
- `findPrivateText accepts the documented <user> placeholder in a WSL network path too`
- `filterJob stops when no pass would capture an asked scene, rather than dropping every pass`
- `run-gate.mjs drops the variants pass before it cuts the job, so a scene only that pass captures stops with --skip-variants`
- `gate 3 shows the panel tab icons through a scene setting that holds for the setup and every capture`
- `agent worktrees under .claude/worktrees/ never reach a snapshot or the VSIX`
- `no tooltip is in any capture: checked before the first screenshot of each theme and again after its last crop`
- `every settings write is applied before the run goes on, even when the theme stays the same`

- [ ] **Step 3: Fix the scanner, the job filter, the capture loop and the ignore files**

```bash
git apply <<'PATCH'
diff --git a/.gitignore b/.gitignore
index d7e980e..1e6de64 100644
--- a/.gitignore
+++ b/.gitignore
@@ -6,3 +6,4 @@ node_modules/
 .playwright-mcp/
 .DS_Store
 review-out/
+.claude/worktrees/
diff --git a/.vscodeignore b/.vscodeignore
index eb0651d..770d0ee 100644
--- a/.vscodeignore
+++ b/.vscodeignore
@@ -18,3 +18,4 @@ review/**
 review-out/**
 icons/product-src-variants/**
 .superpowers/**
+.claude/**
diff --git a/scripts/review/args.mjs b/scripts/review/args.mjs
index a455023..c99564f 100644
--- a/scripts/review/args.mjs
+++ b/scripts/review/args.mjs
@@ -37,11 +37,13 @@ export function parseGateArgs(argv) {
   return { job: values.job, skipVariants: values['skip-variants'], help: values.help, scales, scenes: list('scenes', values.scenes) };
 }
 
-// Cuts a gate job down for a dry run. Scene order and each scene's steps stay as in the job file.
-export function filterJob(job, { scales, scenes }) {
+// Cuts a gate job down for a dry run. Scene order and each scene's steps stay as in the job file. With skipVariants
+// (--skip-variants, or no variant drawing to stage) the variants pass is dropped first, so the checks below see only
+// the passes that will run.
+export function filterJob(job, { scales, scenes, skipVariants = false }) {
   const known = job.scenes.map((scene) => scene.name);
   for (const scene of scenes ?? []) if (!known.includes(scene)) throw new Error(`Unknown scene '${scene}' (the job has ${known.join(', ')})`);
-  const passes = job.passes.map((pass) => {
+  const passes = job.passes.filter((pass) => !(skipVariants && pass.name === 'variants')).map((pass) => {
     const cut = { ...pass };
     if (scales) cut.scales = pass.scales.filter((scale) => scales.includes(scale));
     if (scenes) cut.scenes = (pass.scenes ?? known).filter((scene) => scenes.includes(scene));
@@ -50,5 +52,9 @@ export function filterJob(job, { scales, scenes }) {
   for (const scale of scales ?? []) {
     if (!passes.some((pass) => pass.scales.includes(scale))) throw new Error(`No pass captures at scale ${scale}`);
   }
+  // A scene left out of every pass's own scenes list would otherwise leave a job with no pass, captured silently.
+  for (const scene of scenes ?? []) {
+    if (!passes.some((pass) => (pass.scenes ?? known).includes(scene))) throw new Error(`No pass captures scene '${scene}'`);
+  }
   return { ...job, passes };
 }
diff --git a/scripts/review/capture.mjs b/scripts/review/capture.mjs
index e362fe8..4d255b1 100644
--- a/scripts/review/capture.mjs
+++ b/scripts/review/capture.mjs
@@ -136,8 +136,9 @@ async function shutdown({ child, cdp }) {
   try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* already gone */ }
 }
 
-// Tooltips (workbench hovers, editor hovers) that are on screen. Every screenshot waits until there are none.
-const NO_TOOLTIP = `![...document.querySelectorAll('.workbench-hover, .monaco-hover')].some((el) => {
+// Tooltips (workbench hovers, editor hovers, the debug hover over a variable) that are on screen. Every screenshot waits
+// until there are none, and the captures of a theme are checked again after the last crop.
+const NO_TOOLTIP = `![...document.querySelectorAll('.workbench-hover, .monaco-hover, .debug-hover-widget')].some((el) => {
   const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('.hidden'); })`;
 
 async function runStep(cdp, step, where) {
@@ -182,6 +183,7 @@ const baseSettings = JSON.parse(fs.readFileSync(path.join(work, 'profile', 'sett
   .replaceAll('{{shellIntegrationPs1}}', JSON.stringify(shellIntegrationPs1.replaceAll("'", "''")).slice(1, -1)));
 const keybindings = fs.readFileSync(path.join(work, 'profile', 'keybindings.json'), 'utf8');
 const capturesDir = path.join(work, 'captures');
+let settingsWrites = 0; // applySettings marks each write with a window title that differs from the previous one
 // A pass can write the fixture to disk (notes.md reached disk after the first pass of run 2026-10-10T01-41-22),
 // which changed the SCM state for every later scale. Each launch therefore starts from a pristine copy.
 const workspaceDir = path.join(work, 'workspace');
@@ -216,6 +218,17 @@ for (const pass of job.passes) {
     log(`${pass.name} @ ${scale * 100}%: launching`);
     const session = await launch({ userDataDir, extensionsDir, scale });
     const { cdp } = session;
+    // Writes the settings and waits until VS Code has read them. A theme wait alone passes at once when the theme does
+    // not change (a cut-down run, a variant), so each write also sets its own window title: the workspace name and one or
+    // two zero-width spaces, alternating, so the command centre still reads "workspace" and each write differs from the
+    // one before it.
+    const applySettings = async (theme, extra) => {
+      const mark = '\u200b'.repeat(1 + (++settingsWrites % 2));
+      writeUserFile(userDataDir, 'settings.json', settingsFor(theme, { ...extra, 'window.title': `\${rootName}${mark}` }));
+      await waitFor(() => cdp.evaluate(`document.title.endsWith(${JSON.stringify(mark)}) && !document.title.endsWith(${JSON.stringify(`\u200b${mark}`)})`),
+        { timeout: 20000, label: `the settings for ${theme.label}` });
+      await waitFor(() => cdp.evaluate(themeApplied(theme.signature)), { timeout: 20000, label: `theme ${theme.label}` });
+    };
     try {
       const dpr = await cdp.evaluate('window.devicePixelRatio');
       if (Math.abs(dpr - scale) > 0.01) throw new Error(`devicePixelRatio is ${dpr}, expected ${scale}; set "mode": "zoom" in the job file`);
@@ -228,13 +241,11 @@ for (const pass of job.passes) {
         // A scene's own settings (gate 3: panel tabs as icons) hold for its setup and every capture. Each setup starts
         // in the first theme, not in the last theme of the previous scene.
         const sceneSettings = scene.settings ?? {};
-        writeUserFile(userDataDir, 'settings.json', settingsFor(job.themes[0], sceneSettings));
-        await waitFor(() => cdp.evaluate(themeApplied(job.themes[0].signature)), { timeout: 20000, label: `theme ${job.themes[0].label}` });
+        await applySettings(job.themes[0], sceneSettings);
         for (const step of scene.setup ?? []) await runStep(cdp, step, where);
         for (const theme of job.themes) {
           for (const variant of scene.variants ?? [{ name: 'default', settings: {} }]) {
-            writeUserFile(userDataDir, 'settings.json', settingsFor(theme, { ...sceneSettings, ...variant.settings }));
-            await waitFor(() => cdp.evaluate(themeApplied(theme.signature)), { timeout: 20000, label: `theme ${theme.label}` });
+            await applySettings(theme, { ...sceneSettings, ...variant.settings });
             await delay(1500);
             await waitFor(() => cdp.evaluate(NO_TOOLTIP), { timeout: 10000, label: 'hover tooltips to close' });
             const stem = path.join(capturesDir, pass.name, String(scale), scene.name, theme.slug, variant.name);
@@ -249,6 +260,9 @@ for (const pass of job.passes) {
               if (!clip) { manifest.warnings.push(`${where}/${theme.slug}: no element for ${crop.selector}`); continue; }
               await shoot(crop.name, clip);
             }
+            // Checked again after the last crop: a tooltip that opened during the crops would be in them, and a tooltip
+            // can show a path (gate-3 review). The run stops rather than keep such a capture.
+            if (!(await cdp.evaluate(NO_TOOLTIP))) throw new Error(`${where}/${theme.slug}: a tooltip opened during the captures`);
           }
         }
         for (const step of scene.teardown ?? []) await runStep(cdp, step, where);
diff --git a/scripts/review/privacy-scan.mjs b/scripts/review/privacy-scan.mjs
index a278b54..dc78f48 100644
--- a/scripts/review/privacy-scan.mjs
+++ b/scripts/review/privacy-scan.mjs
@@ -26,7 +26,7 @@ export function findPrivateText(text, names) {
   for (const name of names.filter((candidate) => candidate.length >= 3)) {
     if (new RegExp(`(?<![a-z])${escape(name)}(?![a-z])`, 'i').test(flat)) found.push(`user name "${name.toLowerCase()}"`);
   }
-  const directories = /[A-Za-z]:\\Users\\(?!<user>)[^\\\s"']+|\\\\wsl(?:\.localhost|\$)\\[^\\\s"']+\\home\\[^\\\s"']+|\/(?:home|Users)\/(?!<user>)[^/\s"']+/g;
+  const directories = /[A-Za-z]:\\Users\\(?!<user>)[^\\\s"']+|\\\\wsl(?:\.localhost|\$)\\[^\\\s"']+\\home\\(?!<user>)[^\\\s"']+|\/(?:home|Users)\/(?!<user>)[^/\s"']+/g;
   for (const [match] of flat.matchAll(directories)) found.push(`user directory "${match}"`);
   for (const [match] of flat.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) found.push(`email address "${match}"`);
   return found;
diff --git a/scripts/review/run-gate.mjs b/scripts/review/run-gate.mjs
index f0e3bb4..575afe6 100644
--- a/scripts/review/run-gate.mjs
+++ b/scripts/review/run-gate.mjs
@@ -7,6 +7,10 @@ import { execFileSync, spawnSync } from 'node:child_process';
 import { USAGE, filterJob, parseGateArgs } from './args.mjs';
 
 const root = path.resolve(import.meta.dirname, '..', '..');
+const variantDir = path.join(root, 'icons', 'product-src-variants');
+const variantArgs = fs.existsSync(variantDir)
+  ? fs.readdirSync(variantDir).filter((file) => file.endsWith('.svg')).map((file) => `--variant=${file.split('.')[0]}=icons/product-src-variants/${file}`)
+  : [];
 // Arguments and the job are checked before anything is built or launched: a bad option, an unknown job file, scene
 // or scale stops here with the usage.
 let args;
@@ -17,7 +21,9 @@ try {
     console.log(USAGE);
     process.exit(0);
   }
-  job = filterJob(JSON.parse(fs.readFileSync(path.join(root, args.job), 'utf8')), args);
+  // The variants pass runs only with a variant drawing and without --skip-variants. It is dropped before the job is cut
+  // down, so a scene only that pass captures stops here too (gate-4 review).
+  job = filterJob(JSON.parse(fs.readFileSync(path.join(root, args.job), 'utf8')), { ...args, skipVariants: args.skipVariants || !variantArgs.length });
 } catch (error) {
   console.error(`${error.message}\n${USAGE}`);
   process.exit(2);
@@ -39,12 +45,7 @@ const vsce = path.join(root, 'node_modules', '.bin', 'vsce');
 execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
 fs.mkdirSync(out, { recursive: true });
 execFileSync('node', ['scripts/review/stage-extension.mjs', out], { cwd: root, stdio: 'inherit' });
-const variantDir = path.join(root, 'icons', 'product-src-variants');
-const variantArgs = fs.existsSync(variantDir)
-  ? fs.readdirSync(variantDir).filter((file) => file.endsWith('.svg')).map((file) => `--variant=${file.split('.')[0]}=icons/product-src-variants/${file}`)
-  : [];
-if (!args.skipVariants && variantArgs.length) execFileSync('node', ['scripts/review/stage-extension.mjs', out, ...variantArgs], { cwd: root, stdio: 'inherit' });
-else job.passes = job.passes.filter((pass) => pass.name !== 'variants');
+if (job.passes.some((pass) => pass.name === 'variants')) execFileSync('node', ['scripts/review/stage-extension.mjs', out, ...variantArgs], { cwd: root, stdio: 'inherit' });
 
 // 2. Package the review helper with one row per drawing.
 const map = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'product-icon-map.json'), 'utf8'));
PATCH
```

The capture source holds `'\u200b'` as an escape sequence, never the character itself (an invisible character in source is unreviewable): `grep -cP '\x{200B}' scripts/review/capture.mjs` prints `0`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test test/review-args.test.mjs test/privacy-scan.test.mjs test/review-harness.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 48`, `ℹ pass 48`, `ℹ fail 0`.

Then: `npm test 2>&1 | grep -E '^ℹ (tests|pass|fail)' && npm run validate 2>&1 | tail -1`
Expected:
- `ℹ tests 309` (302 at HEAD plus 7), `ℹ pass 309`, `ℹ fail 0`.
- `✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug)`.

- [ ] **Step 5: Dry-run the fixed capture loop in VS Code 1.141**

Two cut-down runs, the case item 4 is about (scenes with their own settings, started without the scenes before them), plus the gate-2 title bar for the command centre:

```bash
export AGENT_BROWSER_SESSION=spellbound-gate4
node scripts/review/run-gate.mjs --job review/jobs/gate-3.json --scales=1 --scenes=breakpoints,debug-stopped,panel-icons --skip-variants
node scripts/review/run-gate.mjs --job review/jobs/gate-2.json --scales=1 --scenes=workbench --skip-variants
node scripts/review/run-gate.mjs --job review/jobs/gate-3.json --scenes=nothing; echo "exit $?"
```

Expected:
- First run: `Gate run complete: …/review-out/<run> (44 captures, 0 warnings)` (breakpoints 3 + debug-stopped 5 + panel-icons 3 captures per theme, four themes). The two hover scenes keep their tooltips off and the re-check after their crops passes.
- Second run: `Gate run complete: …/review-out/<run> (64 captures, 0 warnings)`. Open `review-out/<run>/captures/main/1/workbench/moonlit-candle/default/titlebar.png` with the Read tool: the command centre reads `workspace`, as before this task (the zero-width mark does not show).
- Third command: `Unknown scene 'nothing' (the job has output, …)`, the usage, `exit 2`.

Measured in the end-to-end run of this plan: runs 2026-10-10T22-25-30 (44 captures, 0 warnings, about one minute) and 2026-10-10T22-23-54 (64 captures, 0 warnings); the titlebar crop read `workspace`. The gate-3 `breakpoints` scene timed out twice on `debug-hint` before that run passed: it moves the pointer onto the glyph margin, and a pointer moved over the review window at the same time takes the hover away. Keep the pointer off the review window during a run, and re-run a hover scene that times out.

- [ ] **Step 6: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_1`
Expected: one 40-character tree id, also saved in `review-out/g4/TREE_1`.

## Part B1: editor batch, first half (20 IDs)

Part B1 draws the first half of the `editor` group of spec section 5.2 ("Editor, find, layout, SCM"): 18 drawings, E148-E159, for 20 IDs. It also pins `gutter-lightbulb-sparkle-filled` (decision G11) and claims it onto the ✧ cluster beside `sparkle`, so the pinned list grows to **173 keys (132 core + 41 extras)** and the `editor` batch to 34 IDs. The drawings live in `scripts/glyphs/editor.mjs`, sixth in `glyphModules`. Reused by import, so a change propagates: the batch-1 ✦ (`parts.star`, read at draw time) for the ✧ cluster and the `pinned-dirty` head, with a test that swaps the part and watches both follow; the module's own `page()`, `folder()` and `letters` for every page, folder and lettered glyph. `refresh` is drawn as the debug batch's `restart` mirrored about x = 8, and a test pins both the mirror and where the two differ. Part B2 (`layout.mjs`) draws the other 14 editor IDs and enforces `product-batch:editor`.

Where the Part B1 IDs show in VS Code 1.141 (kind and default from the 1.141 bundle via `scripts/extract-icon-ids.mjs`; Part D's harness puts them on screen):

| ID | Kind, default | Where it shows |
| :- | :- | :- |
| `sparkle` | codicon (EC10) | Chat and Copilot actions (title bars, the chat input, inline chat). |
| `gutter-lightbulb-sparkle-filled` | registered, default `sparkle-filled` (EC21) | Editor gutter, in place of the light bulb, when every code action on the line is an AI action (inventory, light-bulb paragraph). |
| `pinned`, `pinned-dirty` | codicon (EBA0, EBB2) | The tab-action box of a pinned editor tab, clean or dirty (with `workbench.editor.pinnedTabsOnSeparateRow` off, the default). |
| `new-file`, `new-folder`, `refresh`, `collapse-all` | codicon (EA7F, EA80, EB37, EAC5) | Explorer title bar (New File, New Folder, Refresh Explorer, Collapse Folders); `refresh` and `collapse-all` also in Search and the SCM view. |
| `go-to-file` | codicon (EA94) | Source Control: Open File on a changed-file row. |
| `discard` | codicon (EAE2) | Source Control: Discard Changes on a changed-file row and group. |
| `list-tree` | codicon (EB86) | Search and Source Control title bars (View as Tree, shown while the view is a list). |
| `symbol-file`, `symbol-folder` | codicon (EB60, EA83) | Breadcrumbs, quick open (`Ctrl+P`) and the outline when no file icon theme supplies one. |
| `case-sensitive`, `whole-word`, `regex` | codicon (EAB1, EB7E, EB38) | Find widget and the Search view's input toggles (16px). |
| `preserve-case` | codicon (EB2E) | The replace input of the find widget and the Search view. |
| `find-replace` | registered, default `replace` (EB3D) | Find widget: Replace. |
| `find-replace-all`, `search-replace-all` | registered, both default `replace-all` (EB3C) | Find widget and Search view: Replace All. Both default to the same codicon, so they share one drawing. |

Codepoints:

| Codepoint | Drawing | Task | IDs |
| :- | :- | :- | :- |
| E148 | `sparkle-cluster` | 2 | sparkle, gutter-lightbulb-sparkle-filled |
| E149 | `pin-round` | 2 | pinned |
| E14A | `pin-star` | 2 | pinned-dirty |
| E14B | `page` | 3 | symbol-file |
| E14C | `page-plus` | 3 | new-file |
| E14D | `page-arrow` | 3 | go-to-file |
| E14E | `folder` | 3 | symbol-folder |
| E14F | `folder-plus` | 3 | new-folder |
| E150 | `collapse-stack` | 4 | collapse-all |
| E151 | `tree-node` | 4 | list-tree |
| E152 | `undo-arrow` | 4 | discard |
| E153 | `refresh-arrow` | 4 | refresh |
| E154 | `toggle-case` | 5 | case-sensitive |
| E155 | `toggle-word` | 5 | whole-word |
| E156 | `toggle-regex` | 5 | regex |
| E157 | `toggle-preserve` | 5 | preserve-case |
| E158 | `replace-box` | 6 | find-replace |
| E159 | `replace-stack` | 6 | find-replace-all, search-replace-all |

No existing drawing changes shape or gains an ID. E15A-E15F stay unused (B1's range ends at E15F; Part B2 starts at E160).

Staging (unmapped `editor` IDs, `node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -c 'does not map'`, and the map size from `npm run build:product-icons`): 33 before Part B1; 34 once Task 2 pins G11; then 30, 25, 21, 17 and 14 after Tasks 2 to 6. The 14 left are Part B2's layout IDs. Drawings / IDs in the map: 74 / 128, 79 / 133, 83 / 137, 87 / 141, 89 / 144. Part B1 does not touch `scripts/validation-stage.json`.

**Measured totals.** Every count below was measured by applying this plan in order, from Task 1, to a scratch worktree of `2ec5b09` (Global Constraints), so the totals include Part A's five tests.

**Scratch files.** The comparison page lives in `review-out/g4-editor/` (git-ignored). Scratch files are never named like a test (Global Constraints).

---

### Task 2: Pin G11; editor module; the ✧ cluster and the hatpins

**Files:**
- Create: `scripts/glyphs/editor.mjs`, `test/editor-glyphs.test.mjs`, `icons/product-src/{sparkle-cluster,pin-round,pin-star}.svg` (generated), `review-out/g4-editor/make.mjs` (git-ignored; Tasks 3 to 6 reuse it)
- Modify: `icons/product-icon-ids.json`, `test/product-icon-ids.test.mjs`, `test/product-icon-theme.test.mjs`, `scripts/glyphs/index.mjs`, `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (sections 2 and 5.1), `docs/research/vscode-1.141-icon-inventory.md`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: `parts.star` and `drawings.close` from `scripts/glyphs/batch-1.mjs` (the star read at draw time, never copied); `disc`, `polygon`, `rect`, `svgDocument` from `scripts/glyphs/primitives.mjs`; `outlineGap`, `filledAt`, `parseGlyphSvg`, `pathBounds`, `subpaths` from `scripts/lib/svg-geometry.mjs`; `glyphRuleProblems`; `defaultBundle()` from `scripts/extract-icon-ids.mjs` (locates the stock `codicon.ttf` without a user path); Part A's tree.
- Produces: the pin `gutter-lightbulb-sparkle-filled` (`{ tier: 'extra', kind: 'registered', default: 'sparkle-filled', batch: 'editor' }`; 173 keys); the module `scripts/glyphs/editor.mjs` (`drawings`, `variants`; `variants` stays empty), sixth in `glyphModules`; the drawings `sparkle-cluster` (E148), `pin-round` (E149), `pin-star` (E14A); `test/editor-glyphs.test.mjs` with the helpers `pathsOf`, `round2`, `box`, `bounds`, `outlinesOf`, `glyphOutlines`, `polyBox`, `inkAt(name, point, all = drawings)`, `at45OrSquare`, which Tasks 3 to 6 append to; `expectEditorPins(rows)` in `test/product-icon-theme.test.mjs`.

**Decision G11.** `gutter-lightbulb-sparkle-filled` is the gutter mark VS Code 1.141 draws when every code action on the line is an AI action. Gate 2 decided it joins the editor batch on the ✧ cluster at gate 4 (spec 11.2). The 1.141 bundle registers it with `registerIcon`, default `sparkle-filled` (checked with `scripts/extract-icon-ids.mjs` while writing this task).

- [ ] **Step 1: Check the preconditions**

```bash
node -e "import('./scripts/glyphs/index.mjs').then(({ glyphModules }) => console.log(glyphModules.length))"
node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -c 'does not map'
node -e "const m=require('./icons/product-icon-map.json').drawings; console.log(Object.keys(m).length, Object.values(m).reduce((n, d) => n + d.ids.length, 0))"
node -e "const p=require('./icons/product-icon-ids.json').ids; console.log(Object.keys(p).length, 'gutter-lightbulb-sparkle-filled' in p)"
```

Expected: `5` (batch 1, chrome, status, panel, debug), `33`, `71 124`, `172 false`. If any line differs, stop: the base is not gate 3 plus Part A.

- [ ] **Step 2: Write the failing tests**

In `test/product-icon-ids.test.mjs`:

1. Replace the first test with:

```js
test('132 core IDs plus 41 named extras', () => {
  assert.equal(entries.filter(([, e]) => e.tier === 'core').length, 132);
  assert.equal(entries.filter(([, e]) => e.tier === 'extra').length, 41);
  assert.equal(entries.length, 173);
});
```

2. In the test `the keys added at gate 1 (G4-G6) sit in their batches …`, delete its last assertion, the line `  assert.equal('gutter-lightbulb-sparkle-filled' in pinned.ids, false, 'the all-AI gutter mark stays unpinned until gate 4 (spec 11.2, G11)');`.

3. Insert above `test('every key has a known batch and kind', () => {`:

```js
test('G11: the all-AI gutter mark is pinned in the editor batch with the kind and default the 1.141 bundle registers', () => {
  assert.deepEqual(pinned.ids['gutter-lightbulb-sparkle-filled'], { tier: 'extra', kind: 'registered', default: 'sparkle-filled', batch: 'editor' });
  assert.equal(entries.filter(([, e]) => e.batch === 'editor').length, 34);
});

```

Create `test/editor-glyphs.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings as batchOne, parts } from '../scripts/glyphs/batch-1.mjs';
import { drawings } from '../scripts/glyphs/editor.mjs';
import { disc, rect } from '../scripts/glyphs/primitives.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers for Tasks 2 to 6. Clearances use outlineGap (0 where outlines cross or overlap; it throws on an empty
// side), measured on the flattened outlines.
const pathsOf = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const round2 = (value) => Number(value.toFixed(2));
const box = (ds) => Object.fromEntries(Object.entries(pathBounds(ds)).map(([key, value]) => [key, round2(value)]));
const bounds = (name) => box(pathsOf(name));
const outlinesOf = (ds) => [ds].flat(Infinity).flatMap((d) => subpaths(d));
const glyphOutlines = (name) => outlinesOf(pathsOf(name));
const polyBox = (polys) => {
  const points = polys.flat();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return { minX: round2(Math.min(...xs)), maxX: round2(Math.max(...xs)), minY: round2(Math.min(...ys)), maxY: round2(Math.max(...ys)) };
};
const inkAt = (name, point, all = drawings) => filledAt(parseGlyphSvg(all[name]()).paths.map((path) => path.d), point);
const at45OrSquare = (poly) => poly.every(([x1, y1], index) => {
  const [x2, y2] = poly[(index + 1) % poly.length];
  return x1 === x2 || y1 === y2 || Math.abs(x2 - x1) === Math.abs(y2 - y1);
});

test('editor drawings follow the glyph rules: no errors and no warnings', () => {
  for (const [name, draw] of Object.entries(drawings)) {
    const { errors, warnings } = glyphRuleProblems(draw());
    assert.deepEqual({ errors, warnings }, { errors: [], warnings: [] }, name);
  }
});

// ---- Sparkle and pins (Task 2) ----
test('sparkle (✧ cluster): three ✦, the largest 8x8 on the left, each at least 1 unit from the others', () => {
  assert.deepEqual(bounds('sparkle-cluster'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  const stars = [parts.star(6, 8, 4, 1.5), parts.star(11.5, 4.5, 2.5, 1), parts.star(11.5, 11.5, 2.5, 1)];
  assert.deepEqual(glyphOutlines('sparkle-cluster'), outlinesOf(stars));
  assert.deepEqual(box([stars[0]]), { minX: 2, maxX: 10, minY: 4, maxY: 12 }, 'the filled part is the largest star');
  for (const [a, b] of [[0, 1], [0, 2], [1, 2]]) assert.ok(outlineGap(outlinesOf(stars[a]), outlinesOf(stars[b])) >= 1, `stars ${a} and ${b}`);
});

test('pinned and pinned-dirty: one 45-degree needle, a 7-unit round or ✦ head 1 unit clear of it, centred on (8,8) like close', () => {
  const centre = ({ minX, maxX, minY, maxY }) => [(minX + maxX) / 2, (minY + maxY) / 2];
  const closeCentre = centre(box(parseGlyphSvg(batchOne.close()).paths.map((path) => path.d)));
  for (const name of ['pin-round', 'pin-star']) {
    assert.deepEqual(bounds(name), { minX: 2, maxX: 14, minY: 2, maxY: 14 }, name);
    assert.deepEqual(centre(bounds(name)), closeCentre, `${name} shares the tab-action centre with close`);
    const [needle, ...head] = glyphOutlines(name);
    assert.deepEqual(needle, glyphOutlines('pin-round')[0], `${name}: the same needle`);
    assert.ok(at45OrSquare(needle), `${name}: the needle runs at 45 degrees`);
    assert.ok(outlineGap([needle], head) >= 1, `${name}: one unit between the needle and the head`);
    assert.deepEqual(polyBox(head), { minX: 7, maxX: 14, minY: 2, maxY: 9 }, `${name}: the head`);
  }
  assert.deepEqual(glyphOutlines('pin-round').slice(1), outlinesOf(disc(10.5, 5.5, 3.5)));
  assert.deepEqual(glyphOutlines('pin-star').slice(1), outlinesOf(parts.star(10.5, 5.5, 3.5, 1)));
});

test('the cluster and the ✦ head are built from the live batch-1 star part, not from a copy of its numbers', () => {
  const original = parts.star;
  parts.star = (cx, cy, outer) => rect(cx - outer, cy - outer, 2 * outer, 2 * outer); // a square in the star's place
  try {
    assert.deepEqual(glyphOutlines('sparkle-cluster'), outlinesOf([rect(2, 4, 8, 8), rect(9, 2, 5, 5), rect(9, 9, 5, 5)]));
    assert.deepEqual(glyphOutlines('pin-star').slice(1), outlinesOf(rect(7, 2, 7, 7)));
  } finally {
    parts.star = original;
  }
});
```

Append to `test/product-icon-theme.test.mjs`:

```js
// Gate 4, Part B1: each editor drawing keeps its codepoint and exactly these IDs, in claim order, and every ID reaches
// the theme through that codepoint.
const expectEditorPins = (rows) => {
  for (const [name, codepoint, ids] of rows) {
    assert.equal(map.drawings[name]?.codepoint, codepoint, name);
    assert.deepEqual(map.drawings[name].ids, ids, name);
    for (const id of ids) assert.equal(theme.iconDefinitions[id]?.fontCharacter, `\\${codepoint}`, id);
  }
};

test('editor (Task 2): the ✧ cluster carries sparkle and the all-AI gutter mark (G11); the hatpins carry the pinned tabs', () => {
  expectEditorPins([
    ['sparkle-cluster', 'E148', ['sparkle', 'gutter-lightbulb-sparkle-filled']],
    ['pin-round', 'E149', ['pinned']],
    ['pin-star', 'E14A', ['pinned-dirty']],
  ]);
});
```

Run: `node --test test/product-icon-ids.test.mjs test/editor-glyphs.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/scripts/glyphs/editor.mjs'`, then `ℹ tests 20`, `ℹ pass 16`, `ℹ fail 4`.

Run: `node --test --test-reporter=tap test/product-icon-ids.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^not ok'`
Expected:

```
not ok 1 - 132 core IDs plus 41 named extras
not ok 5 - G11: the all-AI gutter mark is pinned in the editor batch with the kind and default the 1.141 bundle registers
not ok 19 - editor (Task 2): the ✧ cluster carries sparkle and the all-AI gutter mark (G11); the hatpins carry the pinned tabs
```

- [ ] **Step 3: Pin `gutter-lightbulb-sparkle-filled` and update the key counts**

In `icons/product-icon-ids.json`, insert between the `gutter-lightbulb-sparkle` entry and the `info` entry (the keys are sorted):

```json
    "gutter-lightbulb-sparkle-filled": {
      "tier": "extra",
      "kind": "registered",
      "default": "sparkle-filled",
      "batch": "editor"
    },
```

In `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`:

1. Section 2: replace `plus the named extras in section 5.1, for 172 keys in total.` with `plus the named extras in section 5.1, for 173 keys in total.`
2. Section 5.1, the "Added at review gate 1" bullet: replace `stays stock until gate 4, where it joins the editor batch on the ✧ cluster (section 11.2).` with `stayed stock until gate 4, where it joined the editor batch on the ✧ cluster (section 11.2).`
3. Section 5.1, the "Added at review gate 3" bullet: replace `Total: 172 keys (132 core + 40 extras), 173 once gate 4 adds \`gutter-lightbulb-sparkle-filled\`.` with `Total: 172 keys (132 core + 40 extras).` and add this bullet right after it:

```markdown
- Added at gate 4 (G11, section 11.2): `gutter-lightbulb-sparkle-filled` (editor batch, on the ✧ cluster with `sparkle`). Total: 173 keys (132 core + 41 extras).
```

Section 11.2's G11 ("171 keys then") is the gate-2 record and stays as written.

In `docs/research/vscode-1.141-icon-inventory.md`:

1. In the light-bulb paragraph, replace `` `gutter-lightbulb-sparkle-filled` (registered, default `sparkle-filled`: every action on the line is an AI action) and the codicon `sparkle-filled` stay unpinned for now; gate 2 decided that `gutter-lightbulb-sparkle-filled` joins the editor batch on the ✧ cluster at gate 4 (spec section 11.2). `` with `` `gutter-lightbulb-sparkle-filled` (registered, default `sparkle-filled`: every action on the line is an AI action) is pinned in the editor batch on the ✧ cluster since gate 4 (spec section 11.2, G11); the codicon `sparkle-filled` stays unpinned. ``
2. In the Caveats list, replace `(172 keys with kind, default and batch)` with `(173 keys with kind, default and batch)`.

Run:

```bash
node --test test/product-icon-ids.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
node scripts/extract-icon-ids.mjs | grep -E '^✓|^✗'
node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -c 'does not map'
grep -c '173' docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md
```

Expected: `ℹ tests 10`, `ℹ pass 10`, `ℹ fail 0`; `✓ the pinned list matches the bundle` (the script's first line prints the bundle path, which holds the Windows user name: filter it as above and never paste it anywhere); `34`; `2`.

- [ ] **Step 4: Create the editor module with the cluster and the pins**

Create `scripts/glyphs/editor.mjs`:

```js
// Gate 4 `editor` batch, first half (spec section 5.2, "Editor, find, layout, SCM"): the ✧ cluster, the hatpins, pages
// and folders, the tree actions, the find toggles and replace. Tasks 2 to 6 append to these objects.
import { parts } from './batch-1.mjs';
import { disc, polygon, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

// ---- Sparkle and pins (Task 2) ----
// sparkle, gutter-lightbulb-sparkle-filled (G11): the ✧ cluster (glossary: AI actions). Three ✦ from the batch-1 star
// part, called at draw time so a reshaped ✦ reaches them: the largest (8x8 with a 3x3 core, like the dirty star) is the
// filled part, left of centre; two 5x5 ✦ with a waist of 1 (the bell-dot badge) stand to its upper and lower right,
// where the stock sparkle has its second star. The stars keep at least 1.8 units from each other.
drawings['sparkle-cluster'] = () => svgDocument(
  parts.star(6, 8, 4, 1.5), // accent: largest star x2-10, y4-12
  parts.star(11.5, 4.5, 2.5, 1), // x9-14, y2-7
  parts.star(11.5, 11.5, 2.5, 1), // x9-14, y9-14
);

// pinned / pinned-dirty: a hatpin laid like the stock pushpin (head upper right, point lower left) on the stock 12x12
// box (x2-14, centred on (8,8)), because the pin shares the tab-action box with close and the dirty ✦. The needle is a
// 45-degree band 1.41 across on the line x + y = 16; the head (the filled part) is a 7-unit disc or a 7x7 ✦ (waist 1)
// centred on (10.5, 5.5), on the same line. Section 4 keeps one unit between an accent and a stroke: the needle stops
// 1.5 short of the disc and 2.97 short of the ✦. With the needle running into the head, the ✦ read as a spiked mace.
const needle = () => polygon([[2, 13], [6.5, 8.5], [7.5, 9.5], [3, 14]]); // x2-7.5, y8.5-14, ends cut square to the band
drawings['pin-round'] = () => svgDocument(needle(), disc(10.5, 5.5, 3.5)); // accent: head x7-14, y2-9
drawings['pin-star'] = () => svgDocument(needle(), parts.star(10.5, 5.5, 3.5, 1)); // accent: ✦ head x7-14, y2-9
```

In `scripts/glyphs/index.mjs`, add `import * as editor from './editor.mjs';` below the debug import and append `editor` to the list, so the file ends:

```js
import * as debug from './debug.mjs';
import * as editor from './editor.mjs';

export const glyphModules = [batch1, chrome, status, panel, debug, editor];
```

(Part B2 then adds `layout` and Part C `symbols` after `editor`.)

Run: `node --test test/editor-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 4`, `ℹ pass 4`, `ℹ fail 0`.

- [ ] **Step 5: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs sparkle-cluster E148 sparkle gutter-lightbulb-sparkle-filled
node scripts/claim-drawing.mjs pin-round E149 pinned
node scripts/claim-drawing.mjs pin-star E14A pinned-dirty
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{sparkle-cluster,pin-round,pin-star}.svg
```

Expected:
- `Wrote 74 glyph SVGs`.
- `sparkle-cluster (E148) <- sparkle, gutter-lightbulb-sparkle-filled`, `pin-round (E149) <- pinned`, `pin-star (E14A) <- pinned-dirty`.
- `Built 74 product icon drawings for 128 icon IDs in icons/witchynibbles-product-icons.woff`.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ WitchyNibbles package validation passed (enforced: product-pipeline)`.
- `30`.
- `ℹ tests 318`, `ℹ fail 0` (+9: 1 ids test, 4 editor tests, 1 coverage test, 3 drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M6 4L7.5 6.5L10 8L7.5 9.5L6 12L4.5 9.5L2 8L4.5 6.5ZM11.5 2L12.5 3.5L14 4.5L12.5 5.5L11.5 7L10.5 5.5L9 4.5L10.5 3.5ZM11.5 9L12.5 10.5L14 11.5L12.5 12.5L11.5 14L10.5 12.5L9 11.5L10.5 10.5Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 13L6.5 8.5L7.5 9.5L3 14ZM7 5.5A3.5 3.5 0 1 1 14 5.5A3.5 3.5 0 1 1 7 5.5Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 13L6.5 8.5L7.5 9.5L3 14ZM10.5 2L11.5 4.5L14 5.5L11.5 6.5L10.5 9L9.5 6.5L7 5.5L9.5 4.5Z"/></svg>
```

- [ ] **Step 6: Inspect against the stock Codicons**

Write the comparison page once (Tasks 3 to 6 reuse it). It finds the stock font through `defaultBundle()`, so no user path is written anywhere, and it leaves out rows whose drawing is not mapped yet:

```bash
mkdir -p review-out/g4-editor
cat > review-out/g4-editor/make.mjs <<'MAKE'
// Editor drawings (Part B1) from the built font beside the stock Codicons they replace, at 12/16/24px on dark, light
// and gold. Rows whose drawing is not in the map yet are left out, so every task re-runs the same page.
import fs from 'node:fs';
import path from 'node:path';
import { defaultBundle } from '../../scripts/extract-icon-ids.mjs';

const out = path.resolve('review-out/g4-editor');
const bundle = defaultBundle();
if (!bundle) throw new Error('VS Code 1.141 not found: set VSCODE_WORKBENCH_JS');
fs.copyFileSync('icons/witchynibbles-product-icons.woff', path.join(out, 'house.woff'));
fs.copyFileSync(bundle.replace(/vs\/workbench\/workbench\.desktop\.main\.js$/, 'media/codicon.ttf'), path.join(out, 'codicon.ttf'));
const { drawings } = JSON.parse(fs.readFileSync('icons/product-icon-map.json', 'utf8'));
// [drawing, stock Codicon character it replaces] (codepoints from the 1.141 bundle's codicon table)
const rows = [
  ['sparkle-cluster', 'EC10'], ['sparkle-cluster', 'EC21'], // sparkle; sparkle-filled (gutter-lightbulb-sparkle-filled's default)
  ['pin-round', 'EBA0'], ['pin-star', 'EBB2'],
  ['page', 'EB60'], ['page-plus', 'EA7F'], ['page-arrow', 'EA94'], ['folder', 'EA83'], ['folder-plus', 'EA80'],
  ['collapse-stack', 'EAC5'], ['tree-node', 'EB86'], ['undo-arrow', 'EAE2'], ['refresh-arrow', 'EB37'],
  ['toggle-case', 'EAB1'], ['toggle-word', 'EB7E'], ['toggle-regex', 'EB38'], ['toggle-preserve', 'EB2E'],
  ['replace-box', 'EB3D'], ['replace-stack', 'EB3C'],
  // house neighbours an editor glyph must not be confused with: restart and sync (refresh), the dirty ✦ and close (pins)
  ['restart', 'EAD2'], ['sync-arrows', 'EA77'], ['dirty-star', 'EA71'], ['close', 'EA76'],
];
const glyph = (family, codepoint, size) => `<span style="font:${size}px/1 ${family}">&#x${codepoint};</span>`;
const strip = (family, codepoint) => [12, 16, 24].map((size) => glyph(family, codepoint, size)).join('');
const cells = (name, stock) => [['#120C1F', '#A99AB9'], ['#F5ECFA', '#735F7D'], ['#FFD477', '#0D0916']]
  .map(([bg, fg]) => `<td style="background:${bg};color:${fg}">${strip('H', drawings[name].codepoint)}<i></i>${strip('C', stock)}</td>`).join('');
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Editor vs Codicon</title>
<style>@font-face{font-family:H;src:url(house.woff)}@font-face{font-family:C;src:url(codicon.ttf)}
body{margin:8px;font:12px system-ui;background:#fff}table{border-collapse:collapse}th{text-align:left;padding:2px 8px;font-weight:500}
td{padding:6px 10px;white-space:nowrap}td span{display:inline-block;margin-right:10px;vertical-align:middle}i{display:inline-block;width:16px}</style>
<table><tr><th></th><th>dark: house 12/16/24 · Codicon 12/16/24</th><th>light</th><th>gold</th></tr>
${rows.filter(([name]) => name in drawings).map(([name, stock]) => `<tr><th>${name}</th>${cells(name, stock)}</tr>`).join('\n')}</table>`);
console.log(path.join(out, 'index.html'));
MAKE
node review-out/g4-editor/make.mjs
export AGENT_BROWSER_SESSION=spellbound-gate4
for dpr in 1 2; do
  agent-browser set viewport 900 640 $dpr
  agent-browser open "file://$PWD/review-out/g4-editor/index.html"
  agent-browser screenshot --full "$PWD/review-out/g4-editor/compare@${dpr}x.png"
done
agent-browser close
```

Then run the glyph sheet procedure (Global Constraints). Open the PNGs with the Read tool; crop the 16px cells and upscale them with nearest-neighbour scaling (PIL) to judge single pixels. Check that, at 16px and 100% on all three backgrounds:

- the ✧ cluster reads as three stars, the large one solid and the two small ones as `+`-like sparks (as the bell-dot ✦ does at 16px), at the stock sparkle's place; at 12px it is a speck with two dots, as the stock is;
- `pin-round` reads as a pin with a round head; `pin-star` as the same pin with a ✦ head (a star on a wand), and the two swap without the needle moving; both sit on the centre of `close` and the dirty ✦ (the reference rows at the foot of the page);
- the large star of the cluster and the dirty ✦ read as the same family.

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_2`
Expected: one 40-character tree id, also saved in `review-out/g4/TREE_2`.

### Task 3: Pages and folders

**Files:**
- Create: `icons/product-src/{page,page-plus,page-arrow,folder,folder-plus}.svg` (generated)
- Modify: `scripts/glyphs/editor.mjs`, `test/editor-glyphs.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: Task 2's module, test helpers and `expectEditorPins`; `polygon`, `rect`, `svgDocument`; `review-out/g4-editor/make.mjs`.
- Produces: the module-private builders `page({ open })`, `folder({ open })` and `plusBadge(dx, dy)` in `editor.mjs`; the drawings `page` (E14B), `page-plus` (E14C), `page-arrow` (E14D), `folder` (E14E), `folder-plus` (E14F); the test helpers `sameInk(a, b, skip)`, `plusAt(dx, dy)`, `badges`.

**Spec 5.2:** page / folder with `+`, the corner or the tab filled; the `+` stays inside each glyph's keyline (the page's portrait 2-14 × 1-15, the folder's landscape 1-15 × 2-14) and off the page's right-wall column (gate-4 plan review: a `+` on the wall's column read as the wall going on); `go-to-file` a page with an arrow, `symbol-file` a page, `symbol-folder` a folder. Every page drawing comes from one `page()` and every folder drawing from one `folder()`; the open variants (for the `+`) are written out in the same function, and the tests compare their ink with the closed drawing everywhere outside the badge corner, so the two cannot drift apart. The open outlines are written as single paths (like gate 3's console window) rather than cut with `knockOut`, which would flatten the r1 corners off the grid.

- [ ] **Step 1: Write the failing tests**

Append to `test/editor-glyphs.test.mjs`:

```js
// ---- Pages and folders (Task 3) ----
// Ink compared on a 0.5 grid offset by 0.25, so no sample lands on an edge; `skip` leaves out a region.
const sameInk = (a, b, skip = () => false) => {
  for (let x = 0.25; x < 16; x += 0.5) {
    for (let y = 0.25; y < 16; y += 0.5) if (!skip(x, y) && inkAt(a, [x, y]) !== inkAt(b, [x, y])) return `${x},${y}`;
  }
  return true;
};
const plusAt = (dx, dy) => [[10, 12], [12, 12], [12, 10], [13, 10], [13, 12], [15, 12], [15, 13], [13, 13], [13, 15], [12, 15], [12, 13], [10, 13]]
  .map(([x, y]) => [x + dx, y + dy]);
// [base drawing, its +, the corner where the two may differ, the keyline]
const badges = {
  'page-plus': ['page', plusAt(-1, 0), (x, y) => x > 8 && y > 9, { minX: 2, maxX: 14, minY: 1, maxY: 15 }],
  'folder-plus': ['folder', plusAt(0, -1), (x, y) => x > 9 && y > 8, { minX: 1, maxX: 15, minY: 2, maxY: 14 }],
};

test('page (symbol-file): x3-13 with 1-unit walls and a solid 4x4 fold, a real hole one unit inside it', () => {
  assert.deepEqual(bounds('page'), { minX: 3, maxX: 13, minY: 1, maxY: 15 });
  for (const [point, filled] of [[[3.5, 8], true], [[4.5, 8], false], [[12.5, 10], true], [[11.5, 10], false], [[8, 14.5], true], [[8, 13.5], false],
    [[10, 4], true], [[12, 2], false], [[8.5, 4], true], [[7.5, 4], false], [[10, 5.5], true], [[10, 6.5], false]]) {
    assert.equal(inkAt('page', point), filled, `${point}`);
  }
});

test('folder (symbol-folder): x1-15, y2-14 with 1-unit walls and a solid tab, a real hole one unit inside it', () => {
  assert.deepEqual(bounds('folder'), { minX: 1, maxX: 15, minY: 2, maxY: 14 });
  for (const [point, filled] of [[[3, 4], true], [[3, 6.5], false], [[6.5, 3], true], [[10, 4.5], true], [[10, 5.5], false], [[14.5, 9], true],
    [[13.5, 9], false], [[8, 13.5], true], [[8, 12.5], false], [[1.5, 9], true], [[2.5, 9], false]]) {
    assert.equal(inkAt('folder', point), filled, `${point}`);
  }
});

test('new-file and new-folder are the page and the folder, open at the lower right for a 5x5 + one unit clear, inside the keyline', () => {
  for (const [name, [base, plus, corner, keyline]] of Object.entries(badges)) {
    assert.equal(sameInk(name, base, corner), true, `${name} matches ${base} outside the badge corner`);
    const outlines = glyphOutlines(name);
    assert.deepEqual(outlines.at(-1), plus, `${name}: the + is the last outline`);
    assert.ok(outlineGap(outlines.slice(0, -1), [plus]) >= 1, `${name}: + to outline`);
    const { minX, maxX, minY, maxY } = polyBox([plus]);
    assert.equal(inkAt(name, [(minX + maxX) / 2, (minY + maxY) / 2]), true, `${name}: the + centre`);
    const b = bounds(name);
    assert.ok(b.minX >= keyline.minX && b.maxX <= keyline.maxX && b.minY >= keyline.minY && b.maxY <= keyline.maxY, `${name} inside its keyline`);
  }
  assert.deepEqual(polyBox([badges['page-plus'][1]]), { minX: 9, maxX: 14, minY: 10, maxY: 15 });
  assert.deepEqual(polyBox([badges['folder-plus'][1]]), { minX: 10, maxX: 15, minY: 9, maxY: 14 });
  // The page's + stem (column 11) is not on the right wall's column (12), so it does not read as the wall going on.
  assert.deepEqual([inkAt('page-plus', [12.5, 8.5]), inkAt('page-plus', [12.5, 10.5]), inkAt('page-plus', [11.5, 10.5])], [true, false, true]);
});

test('go-to-file is the page with an open-headed arrow inside, one unit clear of the walls and the fold', () => {
  assert.equal(sameInk('page-arrow', 'page', (x, y) => x > 4.5 && x < 11.5 && y > 6 && y < 13.5), true);
  const [outline, hole, ...arrow] = glyphOutlines('page-arrow');
  assert.deepEqual([outline, hole], glyphOutlines('page'));
  assert.ok(outlineGap([outline, hole], arrow) >= 1, 'arrow to page (the hole with its outline, so the arrow is measured to the walls)');
  assert.ok(arrow.every(at45OrSquare), 'the arrow is straight and 45-degree strokes');
  assert.deepEqual(polyBox(arrow), { minX: 5, maxX: 10, minY: 6.5, maxY: 12.5 });
  assert.equal(inkAt('page-arrow', [8.5, 9.5]), true, 'stem and head meet');
  assert.equal(inkAt('page-arrow', [6.5, 8.75]), false, 'the head is open: a filled triangle would cover this');
});
```

Append to `test/product-icon-theme.test.mjs`:

```js
test('editor (Task 3): pages and folders carry the file and folder IDs', () => {
  expectEditorPins([
    ['page', 'E14B', ['symbol-file']],
    ['page-plus', 'E14C', ['new-file']],
    ['page-arrow', 'E14D', ['go-to-file']],
    ['folder', 'E14E', ['symbol-folder']],
    ['folder-plus', 'E14F', ['new-folder']],
  ]);
});
```

Run: `node --test --test-reporter=tap test/editor-glyphs.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^not ok|^  error|^# (tests|pass|fail)'`
Expected:

```
not ok 5 - page (symbol-file): x3-13 with 1-unit walls and a solid 4x4 fold, a real hole one unit inside it
  error: 'drawings[name] is not a function'
not ok 6 - folder (symbol-folder): x1-15, y2-14 with 1-unit walls and a solid tab, a real hole one unit inside it
  error: 'drawings[name] is not a function'
not ok 7 - new-file and new-folder are the page and the folder, open at the lower right for a 5x5 + one unit clear, inside the keyline
  error: 'all[name] is not a function'
not ok 8 - go-to-file is the page with an open-headed arrow inside, one unit clear of the walls and the fold
  error: 'all[name] is not a function'
not ok 18 - editor (Task 3): pages and folders carry the file and folder IDs
  error: |-
# tests 18
# pass 13
# fail 5
```

(The coverage test fails with `AssertionError`, message `page`.)

- [ ] **Step 2: Append the drawings**

In `scripts/glyphs/editor.mjs`, change the primitives import to:

```js
import { disc, polygon, rect, svgDocument } from './primitives.mjs';
```

and append:

```js
// ---- Pages and folders (Task 3) ----
// Page: x3-13, y1-15 (the stock file's footprint, inside the 12x14 portrait keyline), 1-unit walls, r1 corners and a
// dog-ear at the upper right whose fold is the filled part (spec 5.2: corner). The fold is solid from its 45-degree edge
// (9,1)-(13,5) down to y6 and in to x8, so the hole keeps a 1-unit wall below and left of the 4x4 fold triangle.
// `open: true` leaves the lower-right corner open for the + badge: the right wall stops at y9 and the bottom wall at x8,
// each 1 unit or more from the +. Every page drawing calls this function; the page tests fail if the two outlines drift
// apart.
const page = ({ open = false } = {}) => (open
  ? ['M4 1H9L13 5V9H12V6H8V2H4V14H8V15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1Z']
  : ['M4 1H9L13 5V14A1 1 0 0 1 12 15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1Z', polygon([[4, 2], [8, 2], [8, 6], [12, 6], [12, 14], [4, 14]], 'ccw')]);
// Folder: x1-15, y2-14 (the stock folder's footprint, the 14x12 landscape keyline), 1-unit walls, r1 corners; the tab
// (x1-8, y2-6, with a 45-degree shoulder) is the filled part (spec 5.2: tab). `open: true` stops the right wall at y10
// and the bottom wall at x9 for the + badge.
const folder = ({ open = false } = {}) => (open
  ? ['M2 2H6L8 4H14A1 1 0 0 1 15 5V10H14V5H8L7 6H2V13H9V14H2A1 1 0 0 1 1 13V3A1 1 0 0 1 2 2Z']
  : ['M2 2H6L8 4H14A1 1 0 0 1 15 5V13A1 1 0 0 1 14 14H2A1 1 0 0 1 1 13V3A1 1 0 0 1 2 2Z', polygon([[2, 6], [7, 6], [8, 5], [14, 5], [14, 13], [2, 13]], 'ccw')]);
// + badge (spec 5.2: page / folder with +): a 5x5 cross of 1-unit strokes in the lower-right corner, where the stock
// new-file and new-folder put their + disc, moved by (dx, dy) from x10-15, y10-15. The page's sits one unit left
// (x9-14), so its stem (column 11) is not on the right wall's column (12), where it read as the wall going on, and it
// stays inside the portrait keyline; the folder's one unit up (y9-14), inside the landscape keyline. No fill: the fold
// or the tab stays the one filled part.
const plusBadge = (dx, dy) => polygon([[10, 12], [12, 12], [12, 10], [13, 10], [13, 12], [15, 12], [15, 13], [13, 13], [13, 15], [12, 15], [12, 13], [10, 13]]
  .map(([x, y]) => [x + dx, y + dy]));

drawings.page = () => svgDocument(page()); // symbol-file
drawings['page-plus'] = () => svgDocument(page({ open: true }), plusBadge(-1, 0)); // new-file: + x9-14, y10-15
// go-to-file: the page with an arrow into it. The stock arrow enters from outside the page's upper left; this page leaves
// no room there, so the arrow points right inside it: a stem x5-9, y9-10 and an open chevron head x6-10, y6.5-12.5,
// 1.41 across like the chrome chevrons. Pure strokes, so the fold stays the one filled part; 1 unit clear of the walls,
// 1.12 of the fold.
drawings['page-arrow'] = () => svgDocument(page(), rect(5, 9, 4, 1), polygon([[6, 7.5], [7, 6.5], [10, 9.5], [7, 12.5], [6, 11.5], [8, 9.5]]));
drawings.folder = () => svgDocument(folder()); // symbol-folder
drawings['folder-plus'] = () => svgDocument(folder({ open: true }), plusBadge(0, -1)); // new-folder: + x10-15, y9-14
```

Run: `node --test test/editor-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 8`, `ℹ pass 8`, `ℹ fail 0`.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs page E14B symbol-file
node scripts/claim-drawing.mjs page-plus E14C new-file
node scripts/claim-drawing.mjs page-arrow E14D go-to-file
node scripts/claim-drawing.mjs folder E14E symbol-folder
node scripts/claim-drawing.mjs folder-plus E14F new-folder
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{page,page-plus,page-arrow,folder,folder-plus}.svg
```

Expected:
- `Wrote 79 glyph SVGs`.
- `page (E14B) <- symbol-file`, `page-plus (E14C) <- new-file`, `page-arrow (E14D) <- go-to-file`, `folder (E14E) <- symbol-folder`, `folder-plus (E14F) <- new-folder`.
- `Built 79 product icon drawings for 133 icon IDs in icons/witchynibbles-product-icons.woff`.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ … (enforced: product-pipeline)`.
- `25`.
- `ℹ tests 328`, `ℹ fail 0` (+10: 4 editor tests, 1 coverage test, 5 drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M4 1H9L13 5V14A1 1 0 0 1 12 15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1ZM4 14L12 14L12 6L8 6L8 2L4 2Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M4 1H9L13 5V9H12V6H8V2H4V14H8V15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1ZM9 12L11 12L11 10L12 10L12 12L14 12L14 13L12 13L12 15L11 15L11 13L9 13Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M4 1H9L13 5V14A1 1 0 0 1 12 15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1ZM4 14L12 14L12 6L8 6L8 2L4 2ZM5 9L9 9L9 10L5 10ZM6 7.5L7 6.5L10 9.5L7 12.5L6 11.5L8 9.5Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2H6L8 4H14A1 1 0 0 1 15 5V13A1 1 0 0 1 14 14H2A1 1 0 0 1 1 13V3A1 1 0 0 1 2 2ZM2 13L14 13L14 5L8 5L7 6L2 6Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2H6L8 4H14A1 1 0 0 1 15 5V10H14V5H8L7 6H2V13H9V14H2A1 1 0 0 1 1 13V3A1 1 0 0 1 2 2ZM10 11L12 11L12 9L13 9L13 11L15 11L15 12L13 12L13 14L12 14L12 12L10 12Z"/></svg>
```

- [ ] **Step 4: Inspect against the stock Codicons**

Re-run the Task 2 Step 6 render block (from `node review-out/g4-editor/make.mjs` to `agent-browser close`), then the glyph sheet procedure. Check at 16px and 100% on all three backgrounds:

- `page` reads as a sheet with a turned-down corner (the solid fold), the same size as the stock file; `folder` as a folder with a solid tab;
- the `+` of `page-plus` and `folder-plus` stays a `+` (3 pixels each way at 16px) in the open corner, apart from the walls: the page's `+` sits one column left of the right wall, so it does not read as the wall going on, and the folder's stays inside the folder's height; at 12px it shrinks to a speck, as the stock badge's `+` does;
- `page-arrow` reads as a page with an arrow pointing into it, not as a page with a `>` or a play mark.

- [ ] **Step 5: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_3`
Expected: one 40-character tree id.

### Task 4: Tree actions: collapse-all, list-tree, discard, refresh

**Files:**
- Create: `icons/product-src/{collapse-stack,tree-node,undo-arrow,refresh-arrow}.svg` (generated)
- Modify: `scripts/glyphs/editor.mjs`, `test/editor-glyphs.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: Task 2's module and helpers; `drawings.restart` from `scripts/glyphs/debug.mjs` and `drawings['sync-arrows']` from `scripts/glyphs/status.mjs` (in the tests); `roundRect`.
- Produces: the drawings `collapse-stack` (E150), `tree-node` (E151), `undo-arrow` (E152), `refresh-arrow` (E153); the test helper `halfTurnMiss(name, centre, all)`.

**Spec 5.2:** usual shapes, the main shape filled. The filled part of each: the front box (collapse-all), the root node (list-tree), the arrowhead (discard and refresh, as for every arrow in the set).

**`refresh` against `restart` and `sync` (gate-3 lesson).** At 16px the three differ like this: `restart` (debug toolbar only, in the toolbar's green) is one round arrow running anticlockwise, open at the upper left, its head at the top pointing left; `refresh-arrow` is the same construction mirrored about x = 8, running clockwise, open at the upper right, its head pointing right; `sync-arrows` is two arrows chasing round, two heads, and maps onto itself under a half turn. The stock pair is mirrored the same way (stock `refresh` is clockwise, stock `debug-restart` anticlockwise), so the direction carries the same meaning users already read in the stock icons. The test pins the mirror, the two quadrants where the glyphs differ, the head's side, the single head and the half-turn asymmetry. `discard` is a half-turn hook opening to the lower left, not a round arrow, so it stays apart from all three.

- [ ] **Step 1: Write the failing tests**

In `test/editor-glyphs.test.mjs`, add two imports, so the import block reads:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings as batchOne, parts } from '../scripts/glyphs/batch-1.mjs';
import { drawings as debug } from '../scripts/glyphs/debug.mjs';
import { drawings } from '../scripts/glyphs/editor.mjs';
import { disc, rect } from '../scripts/glyphs/primitives.mjs';
import { drawings as status } from '../scripts/glyphs/status.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';
```

and append:

```js
// ---- Tree actions (Task 4) ----
test('collapse-all: a filled front box with a 6x2 − cut out, and the box behind one unit clear of it', () => {
  assert.deepEqual(bounds('collapse-stack'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  const [front, minus, behind] = glyphOutlines('collapse-stack');
  assert.deepEqual(polyBox([front]), { minX: 2, maxX: 12, minY: 2, maxY: 12 });
  assert.deepEqual(polyBox([minus]), { minX: 4, maxX: 10, minY: 6, maxY: 8 });
  assert.ok(outlineGap([front, minus], [behind]) >= 1, 'front box to the box behind');
  for (const [point, filled] of [[[7, 4], true], [[7, 7], false], [[3, 10], true], [[13.5, 9], true], [[12.5, 9], false], [[9, 13.5], true]]) {
    assert.equal(inkAt('collapse-stack', point), filled, `${point}`);
  }
});

test('list-tree: a 3x3 root node one unit clear of a top row, a trunk and two branches, rows every 4 units', () => {
  assert.deepEqual(bounds('tree-node'), { minX: 2, maxX: 14, minY: 3, maxY: 13 });
  const [node, ...strokes] = glyphOutlines('tree-node');
  assert.deepEqual(polyBox([node]), { minX: 2, maxX: 5, minY: 3, maxY: 6 }, 'the node, the dot-accent minimum');
  assert.ok(outlineGap([node], strokes) >= 1, 'node to the strokes');
  const column = [4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5].map((y) => (inkAt('tree-node', [10, y]) ? '#' : '.')).join('');
  assert.equal(column, '#...#...#', 'rows on y4-5, y8-9 and y12-13 at x10');
  for (const y of [7.5, 9.5, 12.5]) assert.equal(inkAt('tree-node', [3.5, y]), true, `trunk at y${y}`);
});

// Arrowheads are the triangular or quadrilateral straight outlines; half-turn asymmetry is the share of ink whose
// 180-degree image is empty (the measure test/debug-glyphs.test.mjs uses for restart and sync).
const halfTurnMiss = (name, [cx, cy], all = drawings) => {
  let ink = 0;
  let miss = 0;
  for (let x = 0.125; x < 16; x += 0.25) {
    for (let y = 0.125; y < 16; y += 0.25) {
      if (!inkAt(name, [x, y], all)) continue;
      ink += 1;
      if (!inkAt(name, [2 * cx - x, 2 * cy - y], all)) miss += 1;
    }
  }
  return miss / ink;
};

test('discard: one filled 2:1 head pointing left on a band that turns back under it, open at the lower left', () => {
  assert.deepEqual(bounds('undo-arrow'), { minX: 2, maxX: 13, minY: 3, maxY: 13 });
  const [head, band] = glyphOutlines('undo-arrow');
  assert.deepEqual(polyBox([head]), { minX: 2, maxX: 6, minY: 3, maxY: 8 });
  assert.equal(head.length, 4, 'one straight head');
  for (const [point, filled] of [[[4, 6], true], [[9, 5.5], true], [[12.5, 9], true], [[9, 12.5], true], [[9, 9], false], [[4, 12.5], false]]) {
    assert.equal(inkAt('undo-arrow', point), filled, `${point}`);
  }
  assert.ok(band.length > 8, 'the band turns on arcs');
});

test('refresh is restart mirrored about x = 8: one head, clockwise, never sync and never restart itself', () => {
  assert.deepEqual(bounds('refresh-arrow'), { minX: 3, maxX: 13, minY: 1.5, maxY: 14 });
  // Sampled off the half grid (x 0.3, 0.8 …; y 0.6, 1.1 …), so no sample lands on an edge of either glyph.
  for (let x = 0.3; x < 16; x += 0.5) {
    for (let y = 0.6; y < 16; y += 0.5) assert.equal(inkAt('refresh-arrow', [x, y]), inkAt('restart', [16 - x, y], debug), `${x},${y}`);
  }
  // Where it shows at 16px: refresh is open at the upper right and its head points right (clockwise); restart is open at
  // the upper left and points left. Probes on the band's centre circle (r4.5 about (8,9)) at 225 and 315 degrees.
  assert.deepEqual([inkAt('refresh-arrow', [4.82, 5.82]), inkAt('refresh-arrow', [11.18, 5.82])], [true, false]);
  assert.deepEqual([inkAt('restart', [4.82, 5.82], debug), inkAt('restart', [11.18, 5.82], debug)], [false, true]);
  assert.deepEqual([inkAt('refresh-arrow', [10.5, 4.3]), inkAt('restart', [10.5, 4.3], debug)], [true, false], 'the head tip, right of the top, above the band');
  assert.equal(glyphOutlines('refresh-arrow').filter((poly) => poly.length === 3).length, 1, 'one head');
  assert.ok(halfTurnMiss('refresh-arrow', [8, 9]) > 0.2, 'not half-turn symmetric like sync');
  assert.ok(halfTurnMiss('sync-arrows', [8, 8], status) < 0.02, 'sync is');
});
```

Append to `test/product-icon-theme.test.mjs`:

```js
test('editor (Task 4): the tree actions carry collapse-all, list-tree, discard and refresh; refresh is not restart', () => {
  expectEditorPins([
    ['collapse-stack', 'E150', ['collapse-all']],
    ['tree-node', 'E151', ['list-tree']],
    ['undo-arrow', 'E152', ['discard']],
    ['refresh-arrow', 'E153', ['refresh']],
  ]);
  assert.notEqual(theme.iconDefinitions.refresh.fontCharacter, theme.iconDefinitions['debug-restart'].fontCharacter);
  assert.notEqual(theme.iconDefinitions.refresh.fontCharacter, theme.iconDefinitions.sync.fontCharacter);
});
```

Run: `node --test --test-reporter=tap test/editor-glyphs.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^not ok|^  error|^# (tests|pass|fail)'`
Expected:

```
not ok 9 - collapse-all: a filled front box with a 6x2 − cut out, and the box behind one unit clear of it
  error: 'drawings[name] is not a function'
not ok 10 - list-tree: a 3x3 root node one unit clear of a top row, a trunk and two branches, rows every 4 units
  error: 'drawings[name] is not a function'
not ok 11 - discard: one filled 2:1 head pointing left on a band that turns back under it, open at the lower left
  error: 'drawings[name] is not a function'
not ok 12 - refresh is restart mirrored about x = 8: one head, clockwise, never sync and never restart itself
  error: 'drawings[name] is not a function'
not ok 23 - editor (Task 4): the tree actions carry collapse-all, list-tree, discard and refresh; refresh is not restart
  error: |-
# tests 23
# pass 18
# fail 5
```

- [ ] **Step 2: Append the drawings**

In `scripts/glyphs/editor.mjs`, change the primitives import to:

```js
import { disc, polygon, rect, roundRect, svgDocument } from './primitives.mjs';
```

and append:

```js
// ---- Tree actions (Task 4) ----
// collapse-all: the stock layout, a box with a − in front of a second box whose right and bottom edges show. The front
// box is the filled part (spec 5.2: main shape), x2-12, y2-12 with r1 corners and the − cut out 6x2 (x4-10, y6-8, the
// 2-unit cut-out minimum); the box behind is a 1-unit L (to x14, y14), one unit clear of it.
drawings['collapse-stack'] = () => svgDocument(
  roundRect(2, 2, 10, 10, 1), // accent: front box x2-12, y2-12
  rect(4, 6, 6, 2, 'ccw'), // − cut out
  'M4 13H13V4H14V13A1 1 0 0 1 13 14H4Z', // the box behind: right edge x13-14, y4-14; bottom edge y13-14, x4-14
);

// list-tree: the stock tree (a top row, a trunk at the left, branches), with the root drawn as a 3x3 node, the filled
// part (spec 5.2: main shape; the dot-accent minimum). Rows every 4 units (y4-5, y8-9, y12-13), x2-14, y3-13 like the
// stock. The trunk starts one unit below the node (section 4: one unit between an accent and a stroke).
drawings['tree-node'] = () => svgDocument(
  rect(2, 3, 3, 3), // accent: root node x2-5, y3-6
  rect(6, 4, 8, 1), // root row x6-14, one unit right of the node
  rect(3, 7, 1, 6), // trunk x3-4, y7-13, under the node's centre
  rect(4, 8, 10, 1), // branch x4-14, y8-9
  rect(4, 12, 10, 1), // last branch x4-14, y12-13 (the trunk ends in it)
);

// discard: the stock undo hook. A filled head pointing left (2:1 sides and a flat 1-unit tip like the chrome arrows,
// x2-6, y3-8; spec 5.2: main shape) on a 1-unit band that runs right, turns down round a half circle (outer r4, inner r3
// about (9,9)) and comes back left to x5. It opens to the lower left and its band turns only half way, so it reads apart
// from the round arrows (refresh, restart, sync).
drawings['undo-arrow'] = () => svgDocument(
  polygon([[6, 3], [6, 8], [2, 6], [2, 5]]), // accent: head x2-6, y3-8
  'M6 5H9A4 4 0 0 1 9 13H5V12H9A3 3 0 0 0 9 6H6Z', // band x5-13, y5-13
);

// refresh: one round arrow, clockwise like the stock refresh. It is restart's construction (debug batch: a 1-unit band
// r4-5 about (8,9), open for a quarter turn, and a 6x3 45-degree head on the band's top end) mirrored about x = 8, so it
// opens at the upper right and its head points right; the stock refresh and debug-restart are mirrored the same way.
// One head and no half-turn symmetry, so it never reads as sync's two chasing arrows.
drawings['refresh-arrow'] = () => svgDocument('M8 5A4 4 0 1 0 12 9H13A5 5 0 1 1 8 4Z', polygon([[8, 1.5], [11, 4.5], [8, 7.5]]));
```

Run: `node --test test/editor-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 12`, `ℹ pass 12`, `ℹ fail 0`.

The mirror test samples off the half grid (x 0.3, 0.8 …; y 0.6, 1.1 …): sampled on the quarter grid, a point on the head's 45-degree edge (8.25, 1.75) counted as ink in one glyph and not in the other (found while writing).

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs collapse-stack E150 collapse-all
node scripts/claim-drawing.mjs tree-node E151 list-tree
node scripts/claim-drawing.mjs undo-arrow E152 discard
node scripts/claim-drawing.mjs refresh-arrow E153 refresh
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{collapse-stack,tree-node,undo-arrow,refresh-arrow}.svg
```

Expected:
- `Wrote 83 glyph SVGs`.
- `collapse-stack (E150) <- collapse-all`, `tree-node (E151) <- list-tree`, `undo-arrow (E152) <- discard`, `refresh-arrow (E153) <- refresh`.
- `Built 83 product icon drawings for 137 icon IDs in icons/witchynibbles-product-icons.woff`.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ … (enforced: product-pipeline)`.
- `21`.
- `ℹ tests 337`, `ℹ fail 0` (+9: 4 editor tests, 1 coverage test, 4 drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M3 2H11A1 1 0 0 1 12 3V11A1 1 0 0 1 11 12H3A1 1 0 0 1 2 11V3A1 1 0 0 1 3 2ZM4 8L10 8L10 6L4 6ZM4 13H13V4H14V13A1 1 0 0 1 13 14H4Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 3L5 3L5 6L2 6ZM6 4L14 4L14 5L6 5ZM3 7L4 7L4 13L3 13ZM4 8L14 8L14 9L4 9ZM4 12L14 12L14 13L4 13Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M6 3L6 8L2 6L2 5ZM6 5H9A4 4 0 0 1 9 13H5V12H9A3 3 0 0 0 9 6H6Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M8 5A4 4 0 1 0 12 9H13A5 5 0 1 1 8 4ZM8 1.5L11 4.5L8 7.5Z"/></svg>
```

- [ ] **Step 4: Inspect against the stock Codicons**

Re-run the Task 2 Step 6 render block, then the glyph sheet procedure. Check at 16px and 100% on all three backgrounds:

- `collapse-stack` reads as a box with a minus in front of a second box, like the stock (solid where the stock is an outline);
- `tree-node` reads as a tree list: a root dot with its row, a trunk and two branches;
- `undo-arrow` reads as an undo hook (↶), the head solid;
- `refresh-arrow` reads as one clockwise round arrow, and beside `restart` and `sync-arrows` (the reference rows) it is told apart from both: opposite direction to restart, one head where sync has two.

- [ ] **Step 5: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_4`
Expected: one 40-character tree id.

### Task 5: The find toggles and the shared letters

**Files:**
- Create: `icons/product-src/{toggle-case,toggle-word,toggle-regex,toggle-preserve}.svg` (generated)
- Modify: `scripts/glyphs/editor.mjs`, `test/editor-glyphs.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: Task 2's module and helpers; Task 4's imports.
- Produces: `export const letters = { A, B, a, b, c }` in `scripts/glyphs/editor.mjs` (each returns path strings for `svgDocument`): `letters.A(x0)` and `letters.B(x0)` (capitals 10 tall on the baseline y13), `letters.a(x0, base, { xHeight = 7, bowl = 4, width = 5 })`, `letters.b(x0, base, { ascender = 10, bowl = 7, width = 5 })`, `letters.c(x0, base, { xHeight = 7, width = 5 })`. Task 6 (replace) and Part C (symbols, `abc`) import them. The drawings `toggle-case` (E154), `toggle-word` (E155), `toggle-regex` (E156), `toggle-preserve` (E157); the test helpers `runs(name, axis, at, all)`, `rounded`, `moved`.

**One letter construction.** The find widget draws the toggles at about 16px, compact, with nothing else in the glyph. Every lettered glyph in the set uses the same construction: 1-unit stems and bars on whole numbers, 45-degree strokes 1.41 across (the A's shoulders, the asterisk), r1 outer corners on the round side and square corners on the stem side and inside, closed counters at least 2×2, letters 1 unit apart, a double-storey `a`. The size is an option of each lowercase letter: the toggles use the large size (5 wide, x-height 7, ascender and capitals 10, like the stock toggles' y3-13); Part C's `abc` uses 4 wide, x-height 6, ascender 9; replace uses a small `b`. The tests measure the stems, bars, heights and counters of the toggles, and the same at Part C's size. The `A` is a pointed arch on vertical stems: at cap height 10 and width 7, the steep straight legs of a typeset A would put points off the grid or thin the stroke below 1 unit.

- [ ] **Step 1: Write the failing tests**

In `test/editor-glyphs.test.mjs`, change two imports to:

```js
import { drawings, letters } from '../scripts/glyphs/editor.mjs';
import { disc, rect, svgDocument } from '../scripts/glyphs/primitives.mjs';
```

and append:

```js
// ---- Find toggles (Task 5) ----
// Lengths of the ink runs along a horizontal (axis 'x') or vertical (axis 'y') line, sampled every 1/8 unit.
const runs = (name, axis, at, all = drawings) => {
  const lengths = [];
  let run = 0;
  for (let t = 1 / 16; t < 16; t += 1 / 8) {
    if (inkAt(name, axis === 'x' ? [t, at] : [at, t], all)) run += 1 / 8;
    else if (run) { lengths.push(run); run = 0; }
  }
  return run ? [...lengths, run] : lengths;
};
const rounded = (polys) => polys.map((poly) => poly.map(([x, y]) => [round2(x), round2(y)]));
const moved = (polys, dx, dy) => polys.map((poly) => poly.map(([x, y]) => [x + dx, y + dy]));

test('the toggles share one letter construction: one A, one a, cap and ascender height 10, x-height 7, 1-unit strokes', () => {
  const [caseA, caseAHole, smallA, smallAHole] = glyphOutlines('toggle-case');
  const [preserveA, preserveAHole, ...capitalB] = glyphOutlines('toggle-preserve');
  const [wordA, wordAHole, wordB] = glyphOutlines('toggle-word');
  assert.deepEqual([preserveA, preserveAHole], [caseA, caseAHole], 'AB starts with the A of Aa');
  assert.deepEqual(rounded(moved([smallA, smallAHole], -7, -1)), rounded([wordA, wordAHole]), 'ab̲ starts with the a of Aa, on its own baseline');
  assert.deepEqual(polyBox([caseA]), { minX: 1, maxX: 8, minY: 3, maxY: 13 }, 'A: cap height 10');
  assert.deepEqual(polyBox(capitalB), { minX: 9, maxX: 14, minY: 3, maxY: 13 }, 'B: cap height 10');
  assert.deepEqual(polyBox([smallA]), { minX: 9, maxX: 14, minY: 6, maxY: 13 }, 'a: x-height 7');
  assert.deepEqual(polyBox([wordB]), { minX: 8, maxX: 13, minY: 2, maxY: 12 }, 'b: ascender 10 on the y12 baseline');
  // Every stem these lines cross is 1 unit wide: the A's legs, the a's bowl wall and stem, the B's stem and lower bowl,
  // the b's stem and bowl.
  for (const [name, y] of [['toggle-case', 11], ['toggle-preserve', 10], ['toggle-word', 10]]) assert.deepEqual(runs(name, 'x', y), [1, 1, 1, 1], `${name} at y${y}`);
  // Every bar is 1 unit tall: the a's top bar, bowl top and foot; the B's three bars; the b's bowl top and foot and the
  // underline. The A's apex is 1.5 deep where its 45-degree shoulders meet, over a 1-unit crossbar.
  assert.deepEqual(runs('toggle-case', 'y', 11.5), [1, 1, 1]);
  assert.deepEqual(runs('toggle-preserve', 'y', 10.5), [1, 1, 1]);
  assert.deepEqual(runs('toggle-word', 'y', 10.5), [1, 1, 1]);
  assert.deepEqual(runs('toggle-case', 'y', 4.5), [1.5, 1]);
});

test('every toggle counter is a real hole at least 2 units across, and the letters stand 1 unit apart', () => {
  for (const [name, holeIndexes] of [['toggle-case', [1, 3]], ['toggle-preserve', [1, 3, 4]], ['toggle-word', [1, 3]]]) {
    const outlines = glyphOutlines(name);
    for (const index of holeIndexes) {
      const { minX, maxX, minY, maxY } = polyBox([outlines[index]]);
      assert.ok(maxX - minX >= 2 && maxY - minY >= 2, `${name} counter ${index}: ${maxX - minX} x ${maxY - minY}`);
      assert.equal(inkAt(name, [(minX + maxX) / 2, (minY + maxY) / 2 + 0.25]), false, `${name} counter ${index} is a hole`);
    }
  }
  // The A's pointed counter holds a 2x2 square above the crossbar (x3.5-5.5, y6-8).
  for (let x = 3.6; x < 5.5; x += 0.3) for (let y = 6.1; y < 8; y += 0.3) assert.equal(inkAt('toggle-case', [x, y]), false, `A counter at ${x},${y}`);
  const [caseA, caseAHole, ...smallA] = glyphOutlines('toggle-case');
  assert.ok(outlineGap([caseA, caseAHole], smallA) >= 1, 'A to a');
  const [preserveA, preserveAHole, ...capitalB] = glyphOutlines('toggle-preserve');
  assert.ok(outlineGap([preserveA, preserveAHole], capitalB) >= 1, 'A to B');
  const [wordA, wordAHole, wordB, wordBHole, underline] = glyphOutlines('toggle-word');
  assert.ok(outlineGap([wordA, wordAHole], [wordB, wordBHole]) >= 1, 'a to b');
  assert.ok(outlineGap([wordA, wordAHole, wordB, wordBHole], [underline]) >= 1, 'ab to the underline');
  assert.deepEqual(polyBox([underline]), { minX: 1, maxX: 15, minY: 13, maxY: 15 });
});

test('regex: a 2x2 full stop on the Aa baseline and a six-armed asterisk at cap height, 1 unit apart', () => {
  const [dot, ...asterisk] = glyphOutlines('toggle-regex');
  assert.deepEqual(polyBox([dot]), { minX: 3, maxX: 5, minY: 11, maxY: 13 });
  assert.deepEqual(polyBox(asterisk), { minX: 6, maxX: 13, minY: 3, maxY: 10 });
  assert.ok(outlineGap([dot], asterisk) >= 1);
  assert.ok(asterisk.every(at45OrSquare), 'upright and 45-degree arms');
  for (const point of [[9.5, 6.5], [9.5, 3.5], [9.5, 9.5], [7, 4], [12, 9], [12, 4], [7, 9]]) assert.equal(inkAt('toggle-regex', point), true, `arm at ${point}`);
  for (const point of [[6.5, 6.5], [12.5, 6.5]]) assert.equal(inkAt('toggle-regex', point), false, `no horizontal arm at ${point}`);
});

test('the shared letters keep the construction at the symbols size: 4 wide, x-height 6, ascender to y3 on the y12 baseline', () => {
  const small = { abc: () => svgDocument(letters.a(1, 12, { xHeight: 6, width: 4 }), letters.b(6, 12, { ascender: 9, bowl: 6, width: 4 }), letters.c(11, 12, { xHeight: 6, width: 4 })) };
  const outlines = outlinesOf(parseGlyphSvg(small.abc()).paths.map((path) => path.d));
  const [a, aHole, b, bHole, c] = outlines;
  assert.deepEqual([polyBox([a]), polyBox([b]), polyBox([c])], [
    { minX: 1, maxX: 5, minY: 6, maxY: 12 }, { minX: 6, maxX: 10, minY: 3, maxY: 12 }, { minX: 11, maxX: 15, minY: 6, maxY: 12 },
  ]);
  assert.deepEqual([polyBox([aHole]), polyBox([bHole])], [{ minX: 2, maxX: 4, minY: 9, maxY: 11 }, { minX: 7, maxX: 9, minY: 7, maxY: 11 }], 'counters 2x2 and 2x4');
  assert.deepEqual(runs('abc', 'x', 10, small), [1, 1, 1, 1, 1], 'stems: a bowl and stem, b stem and bowl, c spine');
  assert.deepEqual(runs('abc', 'y', 2.5, small), [1, 1, 1], 'a: top bar, bowl top, foot');
  assert.deepEqual(runs('abc', 'y', 13, small), [1, 1], 'c: top and foot bars');
  assert.ok(outlineGap([a, aHole], [b, bHole]) >= 1 && outlineGap([b, bHole], [c]) >= 1, 'letters 1 unit apart');
  assert.equal(inkAt('abc', [14.5, 9], small), false, 'c is open on the right');
});
```

Append to `test/product-icon-theme.test.mjs`:

```js
test('editor (Task 5): the four find toggles', () => {
  expectEditorPins([
    ['toggle-case', 'E154', ['case-sensitive']],
    ['toggle-word', 'E155', ['whole-word']],
    ['toggle-regex', 'E156', ['regex']],
    ['toggle-preserve', 'E157', ['preserve-case']],
  ]);
});
```

Run: `node --test --test-reporter=tap test/editor-glyphs.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^not ok|^  error|^# (tests|pass|fail)'`
Expected:

```
not ok 1 - test/editor-glyphs.test.mjs
  error: 'test failed'
not ok 13 - editor (Task 5): the four find toggles
  error: |-
# tests 13
# pass 11
# fail 2
```

The editor test file does not load: `node --test test/editor-glyphs.test.mjs 2>&1 | grep -m1 SyntaxError` prints `SyntaxError: The requested module '../scripts/glyphs/editor.mjs' does not provide an export named 'letters'`.

- [ ] **Step 2: Append the letters and the toggles**

Append to `scripts/glyphs/editor.mjs`:

```js
// ---- Find toggles (Task 5) ----
// One letter construction for every glyph that writes letters (the find toggles here, replace in Task 6, the symbols
// batch through the `letters` export): 1-unit stems and bars on whole numbers, 45-degree strokes 1.41 across, r1 outer
// corners on the round side, square stem side and inner corners, closed counters at least 2x2 (section 4's cut-out
// minimum), letters 1 unit apart, double-storey a. Each lowercase letter takes its size as options, so a smaller set
// keeps the construction. The find widget draws the toggles at about 16px with nothing else in the glyph, so they use the
// large size (the defaults: 5 wide, x-height 7, ascender 10, capitals 10 tall, like the stock toggles' y3-13).
// A: x0 to x0+7, cap height 10 on the baseline y13: a pointed arch on vertical stems (steep diagonals would leave the grid
// or thin below 1 unit), a crossbar at y8-9, a pointed counter above it (5 wide at the bar, 3 at y6) and the opening below.
const capitalA = (x0) => [
  polygon([[x0, 13], [x0, 6], [x0 + 3, 3], [x0 + 4, 3], [x0 + 7, 6], [x0 + 7, 13], [x0 + 6, 13], [x0 + 6, 9], [x0 + 1, 9], [x0 + 1, 13]]),
  polygon([[x0 + 1, 8], [x0 + 6, 8], [x0 + 6, 7], [x0 + 3.5, 4.5], [x0 + 1, 7]], 'ccw'),
];
// B: x0 to x0+5, cap height 10 on the baseline y13: a stem and two bowls (the lower one a unit wider), bars at y3-4, y7-8
// and y12-13; counters 2x3 and 3x4.
const capitalB = (x0) => [
  `M${x0} 3H${x0 + 3}A1 1 0 0 1 ${x0 + 4} 4V7A1 1 0 0 1 ${x0 + 5} 8V12A1 1 0 0 1 ${x0 + 4} 13H${x0}Z`,
  rect(x0 + 1, 4, 2, 3, 'ccw'),
  rect(x0 + 1, 8, 3, 4, 'ccw'),
];
// a: x0 to x0+width on `base`: a top bar at the x-height and a stem down the right (r1 shoulder), and a bowl `bowl` tall
// with r1 corners at the left; counter (width - 2) x (bowl - 2); the xHeight - bowl - 1 units between the top bar and the
// bowl stay open to the left (2 at the default size, 1 at x-height 6).
const smallA = (x0, base, { xHeight = 7, bowl = 4, width = 5 } = {}) => [
  `M${x0 + 1} ${base - xHeight}H${x0 + width - 1}A1 1 0 0 1 ${x0 + width} ${base - xHeight + 1}V${base}H${x0 + 1}A1 1 0 0 1 ${x0} ${base - 1}`
    + `V${base - bowl + 1}A1 1 0 0 1 ${x0 + 1} ${base - bowl}H${x0 + width - 1}V${base - xHeight + 1}H${x0 + 1}Z`,
  rect(x0 + 1, base - bowl + 1, width - 2, bowl - 2, 'ccw'),
];
// b: x0 to x0+width, a stem from `base - ascender` and a bowl `bowl` tall (the x-height) with r1 corners at the right;
// counter (width - 2) x (bowl - 2).
const smallB = (x0, base, { ascender = 10, bowl = 7, width = 5 } = {}) => [
  `M${x0} ${base - ascender}H${x0 + 1}V${base - bowl}H${x0 + width - 1}A1 1 0 0 1 ${x0 + width} ${base - bowl + 1}`
    + `V${base - 1}A1 1 0 0 1 ${x0 + width - 1} ${base}H${x0}Z`,
  rect(x0 + 1, base - bowl + 1, width - 2, bowl - 2, 'ccw'),
];
// c: x0 to x0+width, x-height tall, r1 corners at the left, open on the right: bars at the top and the foot, a 1-unit
// spine; the opening is (width - 1) x (xHeight - 2). No toggle uses it; it is here so the symbols batch writes abc in
// this construction.
const smallC = (x0, base, { xHeight = 7, width = 5 } = {}) => [
  `M${x0 + 1} ${base - xHeight}H${x0 + width}V${base - xHeight + 1}H${x0 + 1}V${base - 1}H${x0 + width}V${base}H${x0 + 1}`
    + `A1 1 0 0 1 ${x0} ${base - 1}V${base - xHeight + 1}A1 1 0 0 1 ${x0 + 1} ${base - xHeight}Z`,
];
// The shared letters (each returns path strings for svgDocument). Part C imports them from here.
export const letters = { A: capitalA, B: capitalB, a: smallA, b: smallB, c: smallC };

// The four toggles have no filled part (spec 5.2).
drawings['toggle-case'] = () => svgDocument(letters.A(1), letters.a(9, 13)); // case-sensitive: Aa, A x1-8, a x9-14
// whole-word: ab over an underline with turned-up ends (the stock bracket), x1-15; 1 unit below the letters.
drawings['toggle-word'] = () => svgDocument(letters.a(2, 12), letters.b(8, 12), polygon([[1, 13], [2, 13], [2, 14], [14, 14], [14, 13], [15, 13], [15, 15], [1, 15]]));
// regex: .* — a 2x2 full stop on the baseline (x3-5, y11-13) and a six-armed asterisk at cap height (x6-13, y3-10), a
// 1-unit upright on x9-10 crossed by two 45-degree bands 1.41 across.
drawings['toggle-regex'] = () => svgDocument(rect(3, 11, 2, 2), rect(9, 3, 1, 7), polygon([[7, 3], [13, 9], [12, 10], [6, 4]]), polygon([[12, 3], [13, 4], [7, 10], [6, 9]]));
drawings['toggle-preserve'] = () => svgDocument(letters.A(1), letters.B(9)); // preserve-case: AB, A x1-8, B x9-14
```

Run: `node --test test/editor-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 16`, `ℹ pass 16`, `ℹ fail 0`.

The letter tests catch a wrong construction (checked while writing): a 1-unit counter in the `a` (`rect(x0 + 1, base - bowl + 1, width - 2, 1, 'ccw')`) fails all three letter tests (the toggle construction, the counters and the symbols size), and a crossbar 1.5 deep in the `A` fails the construction test.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs toggle-case E154 case-sensitive
node scripts/claim-drawing.mjs toggle-word E155 whole-word
node scripts/claim-drawing.mjs toggle-regex E156 regex
node scripts/claim-drawing.mjs toggle-preserve E157 preserve-case
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{toggle-case,toggle-word,toggle-regex,toggle-preserve}.svg
```

Expected:
- `Wrote 87 glyph SVGs`.
- `toggle-case (E154) <- case-sensitive`, `toggle-word (E155) <- whole-word`, `toggle-regex (E156) <- regex`, `toggle-preserve (E157) <- preserve-case`.
- `Built 87 product icon drawings for 141 icon IDs in icons/witchynibbles-product-icons.woff`.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ … (enforced: product-pipeline)`.
- `17`.
- `ℹ tests 346`, `ℹ fail 0` (+9: 4 editor tests, 1 coverage test, 4 drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M1 13L1 6L4 3L5 3L8 6L8 13L7 13L7 9L2 9L2 13ZM2 8L7 8L7 7L4.5 4.5L2 7ZM10 6H13A1 1 0 0 1 14 7V13H10A1 1 0 0 1 9 12V10A1 1 0 0 1 10 9H13V7H10ZM10 12L13 12L13 10L10 10Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M3 5H6A1 1 0 0 1 7 6V12H3A1 1 0 0 1 2 11V9A1 1 0 0 1 3 8H6V6H3ZM3 11L6 11L6 9L3 9ZM8 2H9V5H12A1 1 0 0 1 13 6V11A1 1 0 0 1 12 12H8ZM9 11L12 11L12 6L9 6ZM1 13L2 13L2 14L14 14L14 13L15 13L15 15L1 15Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M3 11L5 11L5 13L3 13ZM9 3L10 3L10 10L9 10ZM7 3L13 9L12 10L6 4ZM12 3L13 4L7 10L6 9Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M1 13L1 6L4 3L5 3L8 6L8 13L7 13L7 9L2 9L2 13ZM2 8L7 8L7 7L4.5 4.5L2 7ZM9 3H12A1 1 0 0 1 13 4V7A1 1 0 0 1 14 8V12A1 1 0 0 1 13 13H9ZM10 7L12 7L12 4L10 4ZM10 12L13 12L13 8L10 8Z"/></svg>
```

- [ ] **Step 4: Inspect against the stock Codicons**

Re-run the Task 2 Step 6 render block, then the glyph sheet procedure. Check at 16px and 100% on all three backgrounds:

- `Aa`, `ab̲`, `.*` and `AB` read as those letters at 16px and 100%, with every counter open (the `a` bowl, the `b` bowl, both `B` bowls, the `A` above its crossbar), and at the stock toggles' height;
- the pointed `A` reads as an A, not as a house or a `∩`;
- `ab̲`'s underline stays separate from the letters; the asterisk reads as an asterisk, not a `✳` blob or an `x`.

- [ ] **Step 5: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_5`
Expected: one 40-character tree id.

### Task 6: Replace and replace-all; close Part B1

**Files:**
- Create: `icons/product-src/{replace-box,replace-stack}.svg` (generated)
- Modify: `scripts/glyphs/editor.mjs`, `test/editor-glyphs.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: `letters.b` (Task 5); `frame`; the test helpers.
- Produces: the drawings `replace-box` (E158) and `replace-stack` (E159); all 20 Part B1 IDs mapped; 14 `editor` IDs left for Part B2.

**Spec 5.2:** usual shapes, the arrowhead filled; `search-replace-all` shares `find-replace-all`'s drawing because both default to the codicon `replace-all` (1.141 bundle). The stock target is a solid box with `c` cut out; with the arrowhead as the one filled part, the target here is an empty frame, and replace-all puts a second frame behind it, drawn like collapse-all's stack.

- [ ] **Step 1: Write the failing tests**

Append to `test/editor-glyphs.test.mjs`:

```js
// ---- Replace (Task 6) ----
test('replace: a small b, an arrow with the one filled head, and an empty target frame, each 1 unit apart', () => {
  assert.deepEqual(bounds('replace-box'), { minX: 1, maxX: 14, minY: 1, maxY: 15 });
  const [b, bHole, band, head, target, targetHole] = glyphOutlines('replace-box');
  assert.deepEqual(polyBox([b]), { minX: 10, maxX: 14, minY: 1, maxY: 7 });
  assert.deepEqual(polyBox([bHole]), { minX: 11, maxX: 13, minY: 4, maxY: 6 }, 'the b counter, 2x2');
  assert.deepEqual(polyBox([head]), { minX: 1.5, maxX: 7.5, minY: 5, maxY: 8 }, 'the head, 6x3 like restart');
  assert.deepEqual(polyBox([target]), { minX: 1, maxX: 9, minY: 9, maxY: 15 });
  assert.ok(outlineGap([b, bHole], [band, head]) >= 1, 'b to arrow');
  assert.ok(outlineGap([head, band], [target, targetHole]) >= 1, 'arrow to target');
  for (const [point, filled] of [[[12, 5], false], [[4.5, 6], true], [[7, 3.5], true], [[5, 12], false], [[1.5, 12], true]]) {
    assert.equal(inkAt('replace-box', point), filled, `${point}`);
  }
});

test('replace-all: the same b and arrow over a smaller target with a second one behind it, 1 unit clear', () => {
  assert.deepEqual(bounds('replace-stack'), { minX: 1, maxX: 14, minY: 1, maxY: 15 });
  const outlines = glyphOutlines('replace-stack');
  assert.deepEqual(outlines.slice(0, 4), glyphOutlines('replace-box').slice(0, 4), 'b, band and head as in replace');
  const [front, frontHole, behind] = outlines.slice(4);
  assert.deepEqual(polyBox([front]), { minX: 1, maxX: 8, minY: 9, maxY: 13 });
  assert.deepEqual(polyBox([frontHole]), { minX: 2, maxX: 7, minY: 10, maxY: 12 }, 'front counter 5x2');
  assert.ok(outlineGap([front, frontHole], [behind]) >= 1, 'front target to the one behind');
  assert.ok(outlineGap(outlines.slice(0, 4), [front, frontHole, behind]) >= 1, 'arrow and b to the targets');
  // Where replace and replace-all differ at 16px: the edge behind the target.
  assert.deepEqual([inkAt('replace-stack', [9.5, 13]), inkAt('replace-box', [9.5, 13])], [true, false]);
  assert.deepEqual([inkAt('replace-stack', [6, 14.5]), inkAt('replace-box', [6, 14.5])], [true, true]);
});
```

Append to `test/product-icon-theme.test.mjs`:

```js
test('editor (Task 6): replace, and replace-all for both IDs that default to it; every Part B1 editor ID is mapped', () => {
  expectEditorPins([
    ['replace-box', 'E158', ['find-replace']],
    ['replace-stack', 'E159', ['find-replace-all', 'search-replace-all']],
  ]);
  // search-replace-all shares find-replace-all's drawing because both default to the codicon replace-all (1.141 bundle).
  assert.equal(pinned.ids['search-replace-all'].default, pinned.ids['find-replace-all'].default);
  const partB1 = ['sparkle', 'gutter-lightbulb-sparkle-filled', 'pinned', 'pinned-dirty', 'new-file', 'new-folder', 'go-to-file', 'symbol-file',
    'symbol-folder', 'collapse-all', 'list-tree', 'discard', 'refresh', 'case-sensitive', 'whole-word', 'regex', 'preserve-case', 'find-replace',
    'find-replace-all', 'search-replace-all'];
  for (const id of partB1) {
    assert.equal(pinned.ids[id]?.batch, 'editor', id);
    assert.ok(id in theme.iconDefinitions, id);
  }
  const codepoints = Object.values(map.drawings).map(({ codepoint }) => codepoint).filter((codepoint) => codepoint >= 'E148' && codepoint <= 'E15F');
  assert.deepEqual(codepoints.sort(), Array.from({ length: 18 }, (_, index) => (0xE148 + index).toString(16).toUpperCase()));
});
```

Run: `node --test --test-reporter=tap test/editor-glyphs.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^not ok|^  error|^# (tests|pass|fail)'`
Expected:

```
not ok 17 - replace: a small b, an arrow with the one filled head, and an empty target frame, each 1 unit apart
  error: 'drawings[name] is not a function'
not ok 18 - replace-all: the same b and arrow over a smaller target with a second one behind it, 1 unit clear
  error: 'drawings[name] is not a function'
not ok 31 - editor (Task 6): replace, and replace-all for both IDs that default to it; every Part B1 editor ID is mapped
  error: |-
# tests 31
# pass 28
# fail 3
```

- [ ] **Step 2: Append the drawings**

In `scripts/glyphs/editor.mjs`, change the primitives import to:

```js
import { disc, frame, polygon, rect, roundRect, svgDocument } from './primitives.mjs';
```

and append:

```js
// ---- Replace (Task 6) ----
// find-replace (default replace), find-replace-all and search-replace-all (both default replace-all): the stock layout,
// a b at the upper right, an arrow hooking down to the left, and the target below it. The stock target is a solid box
// with c cut out; here the arrowhead is the one filled part (spec 5.2), so the target is an empty 1-unit frame (replace)
// or a frame with a second one behind it, drawn like collapse-all's stack (replace-all). The b is the toggles' b at a
// smaller size (ascender 6, bowl 4, counter 2x2); the head is restart's 6x3 45-degree head, pointing down.
const replaceTop = () => [
  letters.b(10, 7, { ascender: 6, bowl: 4, width: 4 }), // b x10-14, y1-7
  'M5 3H9V4H5V5H4V4A1 1 0 0 1 5 3Z', // arrow band x4-9, y3-5, one unit left of the b
  polygon([[1.5, 5], [7.5, 5], [4.5, 8]]), // accent: head x1.5-7.5, y5-8
];
drawings['replace-box'] = () => svgDocument(replaceTop(), frame(1, 9, 8, 6)); // target x1-9, y9-15, 6x4 inside
drawings['replace-stack'] = () => svgDocument(
  replaceTop(),
  frame(1, 9, 7, 4), // front target x1-8, y9-13, 5x2 inside
  'M3 14H9V11H10V14A1 1 0 0 1 9 15H3Z', // the one behind: right edge x9-10, y11-15; bottom edge y14-15, x3-10
);
```

Run: `node --test test/editor-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 18`, `ℹ pass 18`, `ℹ fail 0`.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs replace-box E158 find-replace
node scripts/claim-drawing.mjs replace-stack E159 find-replace-all search-replace-all
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:editor 2>&1 | grep 'does not map' | sed 's/.*does not map //'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{replace-box,replace-stack}.svg
```

Expected:
- `Wrote 89 glyph SVGs`.
- `replace-box (E158) <- find-replace` and `replace-stack (E159) <- find-replace-all, search-replace-all`.
- `Built 89 product icon drawings for 144 icon IDs in icons/witchynibbles-product-icons.woff`.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ … (enforced: product-pipeline)`.
- The 14 Part B2 IDs, one per line, each followed by `(batch editor)`: `auxiliarybar-left-layout-icon`, `auxiliarybar-left-off-layout-icon`, `auxiliarybar-right-layout-icon`, `auxiliarybar-right-off-layout-icon`, `configure-layout-icon`, `panel-bottom`, `panel-layout-icon`, `panel-layout-icon-off`, `panel-left`, `panel-left-off`, `panel-right`, `panel-right-off`, `split-horizontal`, `split-vertical`.
- `ℹ tests 351`, `ℹ fail 0` (+5: 2 editor tests, 1 coverage test, 2 drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M10 1H11V3H13A1 1 0 0 1 14 4V6A1 1 0 0 1 13 7H10ZM11 6L13 6L13 4L11 4ZM5 3H9V4H5V5H4V4A1 1 0 0 1 5 3ZM1.5 5L7.5 5L4.5 8ZM2 9H8A1 1 0 0 1 9 10V14A1 1 0 0 1 8 15H2A1 1 0 0 1 1 14V10A1 1 0 0 1 2 9ZM2 14L8 14L8 10L2 10Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M10 1H11V3H13A1 1 0 0 1 14 4V6A1 1 0 0 1 13 7H10ZM11 6L13 6L13 4L11 4ZM5 3H9V4H5V5H4V4A1 1 0 0 1 5 3ZM1.5 5L7.5 5L4.5 8ZM2 9H7A1 1 0 0 1 8 10V12A1 1 0 0 1 7 13H2A1 1 0 0 1 1 12V10A1 1 0 0 1 2 9ZM2 12L7 12L7 10L2 10ZM3 14H9V11H10V14A1 1 0 0 1 9 15H3Z"/></svg>
```

Run: `npm run validate 2>&1 | grep -v '^>' | grep .`
Expected (the stage stays pending until Part B2 maps its 14 IDs and enforces it):

```
… 50 pending problems in stages not yet enforced: product-batch:editor (14), product-batch:symbols (15), release (2), file-icons (19) (use --verbose to list)
⚠ icons/product-src/cat-slash.svg straight-segment points off the whole/half grid: (5.8, 4.85) (10.875, 15) (9.625, 5) (13.417, 12.583) (10.375, 14) (6.375, 6) …
⚠ icons/product-src/gear.svg straight-segment points off the whole/half grid: (11.182, 3.404) (12.243, 2.343) (13.657, 3.757) (12.596, 4.818) (12.596, 11.182) (13.657, 12.243) …
⚠ icons/product-src/sync-arrows.svg straight-segment points off the whole/half grid: (5.706, 4.723) (5.132, 3.904) (10.294, 11.277) (10.868, 12.096)
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug)
```

Run: `node -e "const m=require('./icons/product-icon-map.json').drawings; console.log(Object.entries(m).filter(([,d])=>/^E1(4[89A-F]|5[0-9A-F])$/.test(d.codepoint)).length, Object.keys(m).length)"`
Expected: `18 89`.

The across-modules grid test of gate 2 (`only gear, sync-arrows and cat-slash have off-grid straight-segment points`) needs no change: every editor drawing is on the grid.

- [ ] **Step 4: Inspect against the stock Codicons**

Re-run the Task 2 Step 6 render block, then the glyph sheet procedure. Check at 16px and 100% on all three backgrounds:

- `replace-box` reads as the stock layout (a `b`, an arrow hooking down, a target box), the arrowhead solid; `replace-stack` reads as the same with a second box behind, and the two are told apart by that box;
- every Part B1 drawing renders from the built font on the sheet (no empty boxes), and the sheet still fits two pages of 51 (89 drawings).

- [ ] **Step 5: Notes for the gate-4 README**

Task 14 Step 5 copies the Part B1 entries into the README; they are written out there (Decisions: refresh against restart, hatpin against pushpin; Choices: the cluster, the hatpins, pages and folders, go-to-file, list-tree, discard, refresh, the find toggles, replace).

- [ ] **Step 6: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_6`
Expected: one 40-character tree id.

---

## Part B2: deferred gate-3 geometry minors, and the layout half of the editor batch (14 IDs)

Part B2 does two things. Task 7 clears the small geometry and test items the gate-3 reviews deferred (SDD ledger, gate 3, Tasks 1, 2, 6, 7 and 9); it changes tests only, and every SVG and the WOFF stay byte-identical. Tasks 8 and 9 draw the layout rows of spec section 5.2 ("Editor, find, layout, SCM"): nine drawings, E160-E168, for the 14 layout IDs of the `editor` batch, in a new module `scripts/glyphs/layout.mjs`, seventh in `glyphModules` (after Part B1's `editor.mjs`). Task 9 ends by enforcing `product-batch:editor`, which passes only because Part B1 has mapped the other 20 editor IDs.

**Which IDs share a drawing.** Every layout ID except the two splits is a registered icon whose default is a layout Codicon (read from the 1.141 bundle and pinned in `icons/product-icon-ids.json`). IDs with the same default get the same drawing, and IDs with different defaults get different drawings, so a mapped ID keeps the meaning of the stock glyph it replaces. The spec's "mirrored pane drawings" (D7) are therefore not extra drawings: `panel-right` already means "right pane" (default `layout-sidebar-right`, the same as `auxiliarybar-right-layout-icon`), and `auxiliarybar-left-layout-icon` means "left pane" (default `layout-sidebar-left`, the same as `panel-left`). The right-pane drawing is the left one mirrored about x = 8 and the bottom one is the left one turned onto the bottom edge, all built from one window-and-pane part, so the mirroring is exact. Task 9's coverage test pins the sharing rule itself (same default, same drawing), not only the table.

**Split orientation.** The Codicon names read backwards, and the stock glyphs confirm it: `split-horizontal` (EB56) has an upright divider, panes side by side; `split-vertical` (EB57) a level one, panes stacked. 1.141 uses `split-horizontal` for Split Editor Right, the terminal's Split and the quick pick's Open to the Side, and `split-vertical` for Split Editor Down (the editor title's Alt action, or its main action when editors split down) and, through `notebook-split-cell`'s default, the notebook's Split Cell.

Where the layout IDs show in VS Code 1.141 (registered defaults and uses read from the 1.141 bundle while writing this part; Part D's harness puts them on screen):

| ID | Default | Where it shows |
| :- | :- | :- |
| `split-horizontal` | codicon (EB56) | Editor title (Split Editor Right), terminal panel toolbar and terminal tabs (Split Terminal), quick pick "Open to the Side" buttons. |
| `split-vertical` | codicon (EB57) | Editor title: Split Editor Down (the Alt alternative of Split Editor Right, or the main action when editors split down); notebook Split Cell (`notebook-split-cell`, unpinned, defaults to `split-vertical`). |
| `panel-left` / `panel-left-off` | `layout-sidebar-left` / `-off` (EBF3 / EC02) | Title-bar layout controls: Toggle Primary Side Bar while the side bar is on the left (`-off` while it is hidden); `panel-left` also in the Customize Layout quick pick. |
| `panel-right` / `panel-right-off` | `layout-sidebar-right` / `-off` (EBF4 / EC00) | The same control while the primary side bar is on the right; `panel-right` also in the Customize Layout quick pick. |
| `auxiliarybar-right-layout-icon` / `auxiliarybar-right-off-layout-icon` | `layout-sidebar-right` / `-off` | Title-bar layout controls: Toggle Secondary Side Bar while the primary side bar is on the left (the 1.141 default). |
| `auxiliarybar-left-layout-icon` / `auxiliarybar-left-off-layout-icon` | `layout-sidebar-left` / `-off` | The same control while the primary side bar is on the right. |
| `panel-layout-icon` / `panel-layout-icon-off` | `layout-panel` / `-off` (EBF2 / EC01) | Title-bar layout controls: Toggle Panel. |
| `panel-bottom` | `layout-panel` | Customize Layout quick pick, the Panel row. |
| `configure-layout-icon` | `layout` (EBEB) | The layout controls' menu and the Customize Layout action. |

Codepoints:

| Codepoint | Drawing | Task | IDs |
| :- | :- | :- | :- |
| E160 | `pane-left` | 8 | panel-left, auxiliarybar-left-layout-icon |
| E161 | `pane-left-off` | 8 | panel-left-off, auxiliarybar-left-off-layout-icon |
| E162 | `pane-right` | 8 | auxiliarybar-right-layout-icon, panel-right |
| E163 | `pane-right-off` | 8 | auxiliarybar-right-off-layout-icon, panel-right-off |
| E164 | `pane-bottom` | 8 | panel-layout-icon, panel-bottom |
| E165 | `pane-bottom-off` | 8 | panel-layout-icon-off |
| E166 | `split-horizontal` | 9 | split-horizontal |
| E167 | `split-vertical` | 9 | split-vertical |
| E168 | `four-panes` | 9 | configure-layout-icon |

Unmapped `editor` IDs (`node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -c 'does not map'`): 14 after Part B1 (its 20 IDs mapped, G11 pinned), 3 after Task 8, 0 after Task 9.

**How the layout window stays apart from the other house frames.** Every layout glyph is one closed square window, x1-15 by y1-15 (the stock layout Codicons' box), radius-1 outer corners, 1-unit walls, holding only straight dividers and rectangular panes. The house `terminal` is a landscape window (y2-14) holding a `❯` and a crescent; the `console-spider` window is smaller (x1-13, y2-12) and open at its lower-right corner, with a `❯`, and its spider breaks out of that corner (the glyph spans x1-15, y2-15); `expand-corners` (`panel-maximize`) is four open brackets on the 2-14 square with no closed outline; the `rune-tiles` (extensions) are separate tiles with the filled one lifted off. Task 8 pins this: no drawing outside `layout.mjs` uses the layout window's outline, the terminal stays landscape, and no expand-corners bracket encloses the centre.

### Task 7: Deferred gate-3 minors: the knockOut complement, the dash spacing, guards and test titles

The gate-3 reviews deferred seven small items (SDD ledger, gate 3). Two are already closed at HEAD and are only checked here; five change tests. No drawing changes.

| Ledger item | State at HEAD | This task |
| :- | :- | :- |
| Gate-3 Task 1: `outlineGap([], x)` returns `Infinity`, so a filtered-empty set passes any clearance check vacuously | Closed by the gate-3 final fix wave: `outlineGap` throws on an empty set, tested by `outlineGap refuses an empty set, which would pass any clearance check vacuously` | Step 1 checks it. Throwing is the right choice: it fails loudly at every call site, future ones included, where an assertion at each call site depends on every test author remembering it. |
| Gate-3 Task 1: the dirty-branch badge pin repeats the badge literals of `status.mjs` | Open | Step 2: a comment saying the repetition is the pin's purpose. |
| Gate-3 Task 2: the `knockOut` vertex test pins only the kept half, and its comment is easy to misread | Open | Step 2: the complement case, `knockOut([diamond], [[-1, 0, -2]])` -> `'M2 0L4 2L2 4Z'`, and a comment that says which half is removed. |
| Gate-3 Task 6: the dashed ring's 1-unit dash spacing (1.069) is stated only in a comment | Open | Step 2: a test that measures every neighbouring pair with `outlineGap`. |
| Gate-3 Task 6: unused imports in `test/debug-glyphs.test.mjs` | Closed: every named import is used once Tasks 7-9 landed | Step 1 checks it. |
| Gate-3 Task 7: the step test finds `arrow` by excluding the moon; nothing asserts it is non-empty | Open (the `outlineGap` throw already prevents a vacuous pass) | Step 2: `assert.ok(arrow.length > 0, …)`, so an empty filter fails with a message naming the step glyph instead of the generic throw. |
| Gate-3 Task 9: the debug coverage test's title no longer describes its drawing and codepoint asserts; `debug.sort()` sorts in place inside an assertion | Open | Step 2: a title that says what it checks, and the list sorted once where it is built (as in the panel test). |

**Files:**
- Modify: `test/glyph-primitives.test.mjs`, `test/debug-glyphs.test.mjs`, `test/status-glyphs.test.mjs`, `test/product-icon-theme.test.mjs`

**Interfaces:**
- Consumes: `knockOut`, `polygon` (primitives); `outlineGap` (imported as `gap` in the debug tests), `subpaths`; `drawings['dashed-ring']` from `scripts/glyphs/debug.mjs`.
- Produces: one new test (`neighbouring dashes of the dashed ring are at least 1 unit apart (section 4: no gap under 1 unit)`); four existing tests with clearer text or an extra assertion. No change under `scripts/` or `icons/`.

- [ ] **Step 1: Check the two items already closed at HEAD**

```bash
grep -c 'an empty set of outlines has no distance' scripts/lib/svg-geometry.mjs
node --test --test-name-pattern='outlineGap refuses an empty set' test/svg-geometry.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
node -e "const s=require('fs').readFileSync('test/debug-glyphs.test.mjs','utf8');const names=[...s.matchAll(/^import \{([^}]*)\}/gm)].flatMap((m)=>m[1].split(',').map((n)=>n.trim().split(' as ').pop()));const body=s.replace(/^import .*$/gm,'');console.log(names.filter((n)=>!body.match(new RegExp('\\\\b'+n+'\\\\b'))).join(' ')||'every named import is used')"
```

Expected: `1`; `ℹ tests 1`, `ℹ pass 1`, `ℹ fail 0`; `every named import is used`. If the first two lines differ, stop: the gate-3 fix wave has not landed, and `outlineGap` needs its guard before any clearance test below can be trusted.

- [ ] **Step 2: Edit the four test files**

These are pins and guards on shipped behaviour, so they pass at once; Step 3 shows that the new dash test bites.

1. In `test/glyph-primitives.test.mjs`, in `knockOut adds no duplicate points when the region boundary passes through a vertex`, replace

```js
  // x >= 2 cuts the diamond through its top and bottom vertices; the kept half is the left triangle, three points.
  const diamond = polygon([[2, 0], [4, 2], [2, 4], [0, 2]]);
  assert.deepEqual(knockOut([diamond], [[1, 0, 2]]), ['M2 0L2 4L0 2Z']);
  // -0.1x >= -0.3 meets the apex (3, 3) up to floating-point noise (about 5e-17); it still counts as on the boundary.
```

with

```js
  // knockOut removes the region, so [[1, 0, 2]] (x >= 2) removes the right half of the diamond and [[-1, 0, -2]]
  // (x <= 2) the left half. Both boundaries run through the top and bottom vertices; whichever half is left over is a
  // triangle of three points, with no vertex repeated.
  const diamond = polygon([[2, 0], [4, 2], [2, 4], [0, 2]]);
  assert.deepEqual(knockOut([diamond], [[1, 0, 2]]), ['M2 0L2 4L0 2Z'], 'x >= 2 removed: the left triangle is left');
  assert.deepEqual(knockOut([diamond], [[-1, 0, -2]]), ['M2 0L4 2L2 4Z'], 'x <= 2 removed: the right triangle is left');
  // -0.1x >= -0.3 (x <= 3, removed) meets the apex (3, 3) up to floating-point noise (about 5e-17); it still counts as
  // on the boundary, so the right half is left with the apex once.
```

2. In `test/debug-glyphs.test.mjs`, insert directly above `test('unverified and disabled differ where it shows: the dashed ring has gaps where the ring is solid', () => {`:

```js
test('neighbouring dashes of the dashed ring are at least 1 unit apart (section 4: no gap under 1 unit)', () => {
  const dashes = pathsOf(drawings['dashed-ring']()).join('').split(/(?=M)/).map((d) => subpaths(d));
  assert.equal(dashes.length, 6);
  dashes.forEach((dash, index) => {
    const next = (index + 1) % dashes.length;
    const clearance = gap(dash, dashes[next]);
    assert.ok(clearance >= 1, `dashes ${index} and ${next}: ${clearance}`);
  });
});

```

and in `each step arrow lands on a 3x3 moon on pixel column 7, 1 unit or more clear of the arrow`, below `const arrow = all.filter((poly) => !keys(moon).includes(JSON.stringify(poly)));`, insert:

```js
    assert.ok(arrow.length > 0, `${name}: the arrow outlines are found`);
```

3. In `test/status-glyphs.test.mjs`, insert directly above `test('each dirty-branch state carries its own badge: ✦ changes, ✓ staged, ! conflicts', () => {`:

```js
// The badge literals below repeat status.mjs on purpose: the pin records which badge each state ships with, so swapping
// two badges, or redrawing one without updating this test, fails here (a ✦/✓ swap passed every gate-2 test).
```

4. In `test/product-icon-theme.test.mjs`, replace

```js
test('every debug-batch ID is mapped; the reused breakpoint drawings and the run alias share their glyphs', () => {
  const debug = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'debug').map(([id]) => id);
```

with

```js
test('every debug-batch ID maps to its drawing and codepoint; the reused breakpoint drawings and the run alias share their glyphs', () => {
  const debug = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'debug').map(([id]) => id).sort();
```

and, in the same test, `assert.deepEqual(Object.fromEntries(debug.sort().map((id) => [id, drawingOf(id)])), {` with `assert.deepEqual(Object.fromEntries(debug.map((id) => [id, drawingOf(id)])), {`.

Run: `node --test test/glyph-primitives.test.mjs test/debug-glyphs.test.mjs test/status-glyphs.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 47`, `ℹ pass 47`, `ℹ fail 0` (46 before, 41 at gate 3 and Part B1's five coverage tests in `test/product-icon-theme.test.mjs`, plus the dash test).

- [ ] **Step 3: Show that the dash test bites, and that no drawing changed**

The neighbouring dashes are 1.069 apart (four pairs) and 1.073 (the two pairs across the horizontal axis), a thin margin over section 4's 1 unit. Lengthen every dash by one degree at each end for a moment, run the test, and restore the file:

```bash
sed -i 's/centre - 13, centre + 13/centre - 14, centre + 14/' scripts/glyphs/debug.mjs
node --test test/debug-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|dashes [0-9] and'
git checkout -- scripts/glyphs/debug.mjs
git diff --name-only scripts
npm run draw:glyphs
git diff --name-only icons
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `ℹ tests 13`, `ℹ pass 12`, `ℹ fail 1` with `AssertionError [ERR_ASSERTION]: dashes 0 and 1: 0.9418250958659374`; no output from the first `git diff --name-only` (the mutation is gone: `debug.mjs` is unchanged since gate 3, so `git checkout --` restores exactly it from the Task 6 snapshot in the index); `Wrote 89 glyph SVGs`; no output from the second (every SVG is byte-identical); `ℹ tests 352`, `ℹ fail 0` (351 after Task 6, plus the dash test). `git status --short` would list the whole gate's staged work here, which is why the check reads the working tree against the index.

- [ ] **Step 4: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_7`
Expected: one 40-character tree id, also saved in `review-out/g4/TREE_7`.

### Task 8: Layout module, the shared window-and-pane part, the six frame toggles

**Files:**
- Create: `scripts/glyphs/layout.mjs`, `test/layout-glyphs.test.mjs`, `icons/product-src/{pane-left,pane-left-off,pane-right,pane-right-off,pane-bottom,pane-bottom-off}.svg` (generated), `review-out/g4-layout/make.mjs` (git-ignored; Task 9 reuses it)
- Modify: `scripts/glyphs/index.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: `polygon`, `roundRect`, `svgDocument` (primitives); `filledAt`, `parseGlyphSvg`, `pathBounds`, `pointInPolygon`, `subpaths` (`scripts/lib/svg-geometry.mjs`); `glyphRuleProblems`; `drawings.terminal` (batch 1) and `drawings['console-spider']`, `drawings['expand-corners']` (panel) for the distinctness test; `glyphModules`; `defaultBundle()` from `scripts/extract-icon-ids.mjs` (locates the stock `codicon.ttf` without a user path); Part B1's `scripts/glyphs/editor.mjs` already in `glyphModules`.
- Produces: the module `scripts/glyphs/layout.mjs` (`drawings`, `variants`; `variants` stays empty), seventh in `glyphModules`, with the local parts `windowOutline()`, `place` (the exact grid maps `left`, `right`, `bottom`, `top`) and `pane(side, [x, y, w, h], dir)`, which Task 9 reuses; the drawings `pane-left` (E160), `pane-left-off` (E161), `pane-right` (E162), `pane-right-off` (E163), `pane-bottom` (E164), `pane-bottom-off` (E165) for 11 IDs; `test/layout-glyphs.test.mjs` with the helpers `pathsOf`, `box`, `bounds`, `outlinesOf`, `keys`, `inkAt`, `pixels`, `row`, `mismatches`, which Task 9 appends to.

**The toggles.** Spec 5.2: "window frame; on = pane filled, off = pane outline". These are universal actions (spec 5.1: familiar silhouettes in the house style), so they keep the stock layout-sidebar and layout-panel silhouettes on the house grid: a side pane 4 deep (x2-6 on the left), a 1-unit divider (x6-7) and the editor area (x7-14). Panes are counter-wound holes cut into the solid window. On: the pane has no hole, so pane, divider and wall read as one solid side, the filled part. Off: the pane's hole is cut, so the pane is an outline. On and off differ in exactly that one hole. VS Code shows the off glyph while the part is hidden and the on glyph (`toggled`) while it is visible.

- [ ] **Step 1: Check the preconditions**

```bash
node -e "import('./scripts/glyphs/index.mjs').then(({ glyphModules }) => console.log(glyphModules.length))"
node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -c 'does not map'
node -e "const p=require('./icons/product-icon-ids.json').ids; console.log(Object.values(p).filter((e) => e.batch === 'editor').length, p['gutter-lightbulb-sparkle-filled']?.batch)"
```

Expected: `6` (batch 1, chrome, status, panel, debug, editor), `14`, `34 editor`. If any line differs, stop: Part B1 has not landed.

- [ ] **Step 2: Write the failing tests**

Create `test/layout-glyphs.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings as batchOne } from '../scripts/glyphs/batch-1.mjs';
import { glyphModules } from '../scripts/glyphs/index.mjs';
import { drawings } from '../scripts/glyphs/layout.mjs';
import { drawings as panel } from '../scripts/glyphs/panel.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';
import { filledAt, parseGlyphSvg, pathBounds, pointInPolygon, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers. Ink is sampled with the font's nonzero rule at the centre of every pixel (x.5, y.5), never on an edge: every
// layout edge is a whole number.
const pathsOf = (svg) => parseGlyphSvg(svg).paths.map((path) => path.d);
const box = (ds) => Object.fromEntries(Object.entries(pathBounds(ds)).map(([key, value]) => [key, Number(value.toFixed(2))]));
const bounds = (svg) => box(pathsOf(svg));
const outlinesOf = (svg) => subpaths(pathsOf(svg).join(''));
const keys = (polygons) => polygons.map((poly) => JSON.stringify(poly)).sort();
const inkAt = (name, [x, y]) => filledAt(pathsOf(drawings[name]()), [x, y]);
const pixels = Array.from({ length: 16 }, (_, index) => index + 0.5);
// One row of pixel centres, x1-15 (the window's columns), as '#' for ink and '.' for none.
const row = (name, y) => pixels.slice(1, 15).map((x) => (inkAt(name, [x, y]) ? '#' : '.')).join('');
// The pixel centres where `name` has ink and `other`, read through `map`, does not (or the other way round).
const mismatches = (name, other, map) => pixels.flatMap((x) => pixels.map((y) => [x, y]))
  .filter((point) => inkAt(name, point) !== inkAt(other, map(point)))
  .map(([x, y]) => `${x},${y}`);

test('layout drawings follow the glyph rules: no errors and no warnings', () => {
  for (const [name, draw] of Object.entries(drawings)) {
    const { errors, warnings } = glyphRuleProblems(draw());
    assert.deepEqual({ errors, warnings }, { errors: [], warnings: [] }, name);
  }
});

test('every layout glyph is one square window, x1-15 y1-15, with 1-unit walls', () => {
  const [window] = outlinesOf(drawings['pane-left']());
  for (const [name, draw] of Object.entries(drawings)) {
    assert.deepEqual(bounds(draw()), { minX: 1, maxX: 15, minY: 1, maxY: 15 }, name);
    assert.deepEqual(outlinesOf(draw())[0], window, `${name} starts with the shared window`);
    for (const point of [[1.5, 4.5], [14.5, 11.5], [4.5, 1.5], [11.5, 14.5]]) assert.equal(inkAt(name, point), true, `${name} wall at ${point}`);
  }
});

test('the layout window is its own frame: no other drawing has it, the terminal is landscape, expand-corners is open', () => {
  const [window] = keys(outlinesOf(drawings['pane-left']()).slice(0, 1));
  for (const module of glyphModules.filter(({ drawings: all }) => all !== drawings)) {
    for (const [name, draw] of Object.entries(module.drawings)) assert.ok(!keys(outlinesOf(draw())).includes(window), name);
  }
  assert.deepEqual(bounds(batchOne.terminal()), { minX: 1, maxX: 15, minY: 2, maxY: 14 });
  assert.deepEqual(bounds(panel['console-spider']()), { minX: 1, maxX: 15, minY: 2, maxY: 15 });
  assert.equal(outlinesOf(panel['expand-corners']()).some((poly) => pointInPolygon([8, 8], poly)), false, 'no bracket encloses the centre');
});

// ---- Frame toggles (Task 8) ----
test('frame toggles: a 4-unit side pane, a divider and the editor area; on fills the pane, off outlines it', () => {
  // The pixel row at y8-9 across the window, x1-15.
  assert.equal(row('pane-left', 8.5), '######.......#');
  assert.equal(row('pane-left-off', 8.5), '#....#.......#');
  assert.equal(row('pane-right', 8.5), '#.......######');
  assert.equal(row('pane-right-off', 8.5), '#.......#....#');
  // The bottom pane across the window's height, read down the pixel column at x8-9.
  const column = (name) => pixels.slice(1, 15).map((y) => (inkAt(name, [8.5, y]) ? '#' : '.')).join('');
  assert.equal(column('pane-bottom'), '#.......######');
  assert.equal(column('pane-bottom-off'), '#.......#....#');
});

test('on and off differ only in the pane: one hole, the size of the pane', () => {
  const panes = { left: [2, 2, 6, 14], right: [10, 2, 14, 14], bottom: [2, 10, 14, 14] };
  for (const [side, [x1, y1, x2, y2]] of Object.entries(panes)) {
    const [on, off] = [outlinesOf(drawings[`pane-${side}`]()), outlinesOf(drawings[`pane-${side}-off`]())];
    const extra = keys(off).filter((key) => !keys(on).includes(key));
    assert.equal(off.length, on.length + 1, side);
    assert.equal(extra.length, 1, side);
    assert.deepEqual(box([`M${JSON.parse(extra[0]).map(([x, y]) => `${x} ${y}`).join('L')}Z`]), { minX: x1, maxX: x2, minY: y1, maxY: y2 }, side);
    // Every pixel centre where on and off differ lies inside the pane, and every pixel of the pane differs.
    const differ = mismatches(`pane-${side}`, `pane-${side}-off`, (point) => point).map((key) => key.split(',').map(Number));
    assert.ok(differ.every(([x, y]) => x > x1 && x < x2 && y > y1 && y < y2), side);
    assert.equal(differ.length, (x2 - x1) * (y2 - y1), side);
  }
});

test('the right pane is the left pane mirrored about x = 8, and the bottom pane the left pane turned onto the bottom edge', () => {
  for (const state of ['', '-off']) {
    assert.deepEqual(mismatches(`pane-right${state}`, `pane-left${state}`, ([x, y]) => [16 - x, y]), [], `right${state}`);
    assert.deepEqual(mismatches(`pane-bottom${state}`, `pane-left${state}`, ([x, y]) => [16 - y, x]), [], `bottom${state}`);
  }
});
```

- [ ] **Step 3: Run them to make sure they fail**

Run: `node --test test/layout-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/scripts/glyphs/layout.mjs'`, then `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1`.

- [ ] **Step 4: Create the layout module with the six toggles**

Create `scripts/glyphs/layout.mjs`:

```js
// Gate 4 `editor` batch, layout half (spec section 5.2, "Editor, find, layout, SCM"): the frame toggles of the title
// bar's layout controls, the split-editor glyphs and Customize Layout. Every glyph is one square window, x1-15 y1-15 (the
// stock layout Codicons' box), with radius-1 outer corners and 1-unit walls. Panes are counter-wound holes cut into the
// solid window (section 4: real holes), so a filled pane is a pane whose hole is not cut.
//
// The window is kept apart from the other house frames: the terminal (x1-15, y2-14) and the debug console's window
// (x1-13, y2-12; its spider breaks out of the open lower-right corner, so the glyph spans x1-15, y2-15) are landscape
// windows holding a prompt, and expand-corners (panel-maximize) is four open brackets on the 2-14 square. A layout
// window is a closed square holding only straight dividers and panes.
import { polygon, roundRect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

const windowOutline = () => roundRect(1, 1, 14, 14, 1);

// A pane is written once, as seen on the left side, and placed by an exact map of the grid onto itself, so the right
// and bottom drawings are true images of the left one: right = mirrored about x = 8; bottom = turned a quarter onto the
// bottom edge; top = reflected about the diagonal, so column 7 becomes row 7.
const place = {
  left: ([x, y]) => [x, y],
  right: ([x, y]) => [16 - x, y],
  bottom: ([x, y]) => [y, 16 - x],
  top: ([x, y]) => [y, x],
};
const pane = (side, [x, y, w, h], dir = 'ccw') => polygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(place[side]), dir);

// ---- Frame toggles (Task 8) ----
// The stock layout-sidebar and layout-panel glyphs on the house grid: a side pane 4 deep (x2-6 on the left), a 1-unit
// divider (x6-7) and the editor area (x7-14). On: the pane is filled, so pane, divider and wall read as one solid side,
// the filled part (spec 5.2); off: the pane is an outline, its hole cut. On and off differ only in that one hole.
// VS Code shows the off glyph while the part is hidden and the on glyph (`toggled`) while it is visible.
const SIDE_PANE = [2, 2, 4, 12];
const EDITOR_AREA = [7, 2, 7, 12];
const paneToggle = (side, on) => [windowOutline(), pane(side, EDITOR_AREA), on ? [] : pane(side, SIDE_PANE)];
drawings['pane-left'] = () => svgDocument(paneToggle('left', true)); // panel-left, auxiliarybar-left-layout-icon
drawings['pane-left-off'] = () => svgDocument(paneToggle('left', false));
drawings['pane-right'] = () => svgDocument(paneToggle('right', true)); // auxiliarybar-right-layout-icon, panel-right
drawings['pane-right-off'] = () => svgDocument(paneToggle('right', false));
drawings['pane-bottom'] = () => svgDocument(paneToggle('bottom', true)); // panel-layout-icon, panel-bottom
drawings['pane-bottom-off'] = () => svgDocument(paneToggle('bottom', false));
```

In `scripts/glyphs/index.mjs`, add `import * as layout from './layout.mjs';` below the editor import (Part B1) and end the file with `export const glyphModules = [batch1, chrome, status, panel, debug, editor, layout];`.

Run: `node --test test/layout-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 6`, `ℹ pass 6`, `ℹ fail 0`.

- [ ] **Step 5: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs pane-left E160 panel-left auxiliarybar-left-layout-icon
node scripts/claim-drawing.mjs pane-left-off E161 panel-left-off auxiliarybar-left-off-layout-icon
node scripts/claim-drawing.mjs pane-right E162 auxiliarybar-right-layout-icon panel-right
node scripts/claim-drawing.mjs pane-right-off E163 auxiliarybar-right-off-layout-icon panel-right-off
node scripts/claim-drawing.mjs pane-bottom E164 panel-layout-icon panel-bottom
node scripts/claim-drawing.mjs pane-bottom-off E165 panel-layout-icon-off
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓'
node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{pane-left,pane-left-off,pane-right,pane-right-off,pane-bottom,pane-bottom-off}.svg
```

Expected:
- `Wrote 95 glyph SVGs` (89 after Part B1, plus 6).
- `pane-left (E160) <- panel-left, auxiliarybar-left-layout-icon`, `pane-left-off (E161) <- panel-left-off, auxiliarybar-left-off-layout-icon`, `pane-right (E162) <- auxiliarybar-right-layout-icon, panel-right`, `pane-right-off (E163) <- auxiliarybar-right-off-layout-icon, panel-right-off`, `pane-bottom (E164) <- panel-layout-icon, panel-bottom`, `pane-bottom-off (E165) <- panel-layout-icon-off`.
- `Built 95 product icon drawings for 155 icon IDs in icons/witchynibbles-product-icons.woff` (IDs: 144 after Part B1, plus 11).
- `✓ WitchyNibbles package validation passed (enforced: product-pipeline)`, no `✗` line.
- `3` (`split-horizontal`, `split-vertical`, `configure-layout-icon`).
- `ℹ tests 364`, `ℹ fail 0` (12 more than after Task 7: 6 layout tests and 6 drawing drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 1H14A1 1 0 0 1 15 2V14A1 1 0 0 1 14 15H2A1 1 0 0 1 1 14V2A1 1 0 0 1 2 1ZM7 14L14 14L14 2L7 2Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 1H14A1 1 0 0 1 15 2V14A1 1 0 0 1 14 15H2A1 1 0 0 1 1 14V2A1 1 0 0 1 2 1ZM7 14L14 14L14 2L7 2ZM2 14L6 14L6 2L2 2Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 1H14A1 1 0 0 1 15 2V14A1 1 0 0 1 14 15H2A1 1 0 0 1 1 14V2A1 1 0 0 1 2 1ZM9 2L2 2L2 14L9 14Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 1H14A1 1 0 0 1 15 2V14A1 1 0 0 1 14 15H2A1 1 0 0 1 1 14V2A1 1 0 0 1 2 1ZM9 2L2 2L2 14L9 14ZM14 2L10 2L10 14L14 14Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 1H14A1 1 0 0 1 15 2V14A1 1 0 0 1 14 15H2A1 1 0 0 1 1 14V2A1 1 0 0 1 2 1ZM14 9L14 2L2 2L2 9Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 1H14A1 1 0 0 1 15 2V14A1 1 0 0 1 14 15H2A1 1 0 0 1 1 14V2A1 1 0 0 1 2 1ZM14 9L14 2L2 2L2 9ZM14 14L14 10L2 10L2 14Z"/></svg>
```

- [ ] **Step 6: Inspect against the stock Codicons**

Write the comparison page once (Task 9 reuses it). It finds the stock font through `defaultBundle()`, so no user path is written anywhere. Under the layout rows the page shows the house `expand-corners`, `terminal`, `console-spider` and `rune-tiles` (the glyphs a window could be confused with), and two rows of the title bar's layout controls as 1.141 lays them out with the side bar on the left (primary side bar, panel, secondary side bar, Customize Layout) in two on/off combinations:

```bash
mkdir -p review-out/g4-layout
cat > review-out/g4-layout/make.mjs <<'MAKE'
// Layout drawings from the built font beside the stock Codicons they replace, at 12/16/24px on dark, light and gold.
import fs from 'node:fs';
import path from 'node:path';
import { defaultBundle } from '../../scripts/extract-icon-ids.mjs';

const out = path.resolve('review-out/g4-layout');
const bundle = defaultBundle();
if (!bundle) throw new Error('VS Code 1.141 not found: set VSCODE_WORKBENCH_JS');
fs.copyFileSync('icons/witchynibbles-product-icons.woff', path.join(out, 'house.woff'));
fs.copyFileSync(bundle.replace(/vs\/workbench\/workbench\.desktop\.main\.js$/, 'media/codicon.ttf'), path.join(out, 'codicon.ttf'));
const { drawings } = JSON.parse(fs.readFileSync('icons/product-icon-map.json', 'utf8'));
// [drawing, stock Codicon character it replaces] (codepoints from the 1.141 bundle's codicon table)
const rows = [
  ['pane-left', 'EBF3'], ['pane-left-off', 'EC02'], ['pane-right', 'EBF4'], ['pane-right-off', 'EC00'],
  ['pane-bottom', 'EBF2'], ['pane-bottom-off', 'EC01'], ['split-horizontal', 'EB56'], ['split-vertical', 'EB57'], ['four-panes', 'EBEB'],
  // house neighbours a window glyph must not be confused with
  ['expand-corners', 'EB4C'], ['terminal', 'EA85'], ['console-spider', 'EB9B'], ['rune-tiles', 'EAE6'],
];
const themes = [['#120C1F', '#A99AB9'], ['#F5ECFA', '#735F7D'], ['#FFD477', '#0D0916']];
const glyph = (family, codepoint, size) => `<span style="font:${size}px/1 ${family}">&#x${codepoint};</span>`;
const strip = (family, codepoint) => [12, 16, 24].map((size) => glyph(family, codepoint, size)).join('');
const cells = (name, stock) => themes
  .map(([bg, fg]) => `<td style="background:${bg};color:${fg}">${strip('H', drawings[name].codepoint)}<i></i>${strip('C', stock)}</td>`).join('');
// The title bar's layout controls in 1.141 with the side bar on the left (primary side bar, panel, secondary side bar,
// Customize Layout) at 16px, in two on/off combinations.
const bar = (names) => names.filter((name) => name in drawings).map((name) => glyph('H', drawings[name].codepoint, 16)).join('');
const controls = [['pane-left', 'pane-bottom', 'pane-right-off', 'four-panes'], ['pane-left-off', 'pane-bottom-off', 'pane-right', 'four-panes']];
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Layout vs Codicon</title>
<style>@font-face{font-family:H;src:url(house.woff)}@font-face{font-family:C;src:url(codicon.ttf)}
body{margin:8px;font:12px system-ui;background:#fff}table{border-collapse:collapse}th{text-align:left;padding:2px 8px;font-weight:500}
td{padding:6px 10px;white-space:nowrap}td span{display:inline-block;margin-right:10px;vertical-align:middle}i{display:inline-block;width:16px}</style>
<table><tr><th></th><th>dark: house 12/16/24 · Codicon 12/16/24</th><th>light</th><th>gold</th></tr>
${rows.filter(([name]) => name in drawings).map(([name, stock]) => `<tr><th>${name}</th>${cells(name, stock)}</tr>`).join('\n')}
${controls.map((names) => `<tr><th>title bar</th>${themes.map(([bg, fg]) => `<td style="background:${bg};color:${fg}">${bar(names)}</td>`).join('')}</tr>`).join('\n')}</table>`);
console.log(path.join(out, 'index.html'));
MAKE
node review-out/g4-layout/make.mjs
export AGENT_BROWSER_SESSION=spellbound-gate4
for dpr in 1 2; do
  agent-browser set viewport 900 700 $dpr
  agent-browser open "file://$PWD/review-out/g4-layout/index.html"
  agent-browser screenshot --full "$PWD/review-out/g4-layout/compare@${dpr}x.png"
done
agent-browser close
```

Then run the glyph sheet procedure (Global Constraints). Open the PNGs with the Read tool; crop the 16px cells and upscale them with nearest-neighbour scaling (PIL) to judge single pixels. Check that, at 16px and 100% on all three backgrounds:

- each on glyph reads as a window with one solid side (left, right, bottom), each off glyph as the same window with an empty pane behind a divider, and each on/off pair reads as one control in two states, as the stock pairs beside them do;
- the right and bottom glyphs are the left one's mirror and quarter turn (same weights, same pane depth);
- in the title-bar rows the controls read as one family, told apart by which side is solid or divided;
- no layout glyph can be taken for `expand-corners` (open brackets), `terminal` (a landscape window with `❯` and a crescent), `console-spider` or `rune-tiles`.

(Seen while writing this part: the house toggles keep the stock silhouettes and are crisper, because every edge is on a whole pixel where the stock walls sit at 1.01-2.03; at 12px the off dividers merge into the walls as the stock ones do.)

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_8`
Expected: one 40-character tree id, also saved in `review-out/g4/TREE_8`.

### Task 9: Split editor and Customize Layout; enforce `product-batch:editor`

**Files:**
- Create: `icons/product-src/{split-horizontal,split-vertical,four-panes}.svg` (generated)
- Modify: `scripts/glyphs/layout.mjs`, `test/layout-glyphs.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `scripts/validation-stage.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: Task 8's module (`windowOutline`, `place`, `pane`) and test helpers (`row`, `mismatches`, `pixels`, `inkAt`, `outlinesOf`, `box`); `outlineGap`, `signedArea` (`scripts/lib/svg-geometry.mjs`); `pinned`, `map`, `theme` in `test/product-icon-theme.test.mjs`; `review-out/g4-layout/make.mjs` (Task 8); Part B1's 20 editor IDs already mapped.
- Produces: the drawings `split-horizontal` (E166), `split-vertical` (E167), `four-panes` (E168); all 14 layout IDs mapped and the sharing rule pinned; every `editor` ID mapped; the stage `product-batch:editor` enforced by `npm run validate`.

**The splits.** Spec 5.2: "window with two panes, the divider following each ID's Codicon orientation; filled part: new pane". The divider is on pixel column 7 (x7-8; row 7 when stacked, section 4's side for odd-width central features), so the old pane is 5 wide (x2-7) and the new pane 6 (x8-14). The new pane holds the filled part as a 4×10 block one unit clear of the divider and the walls (section 4 accent clearance). A toggle's pane joins the wall as one solid side; the split's block floats inside its pane, so a split never reads as a side bar toggle. (A first draft filled the whole new pane the way a toggle does: at 16px the split was a solid half against `pane-right`'s solid third and the two read alike, as did split-vertical and `pane-bottom`.) `split-vertical` is `split-horizontal` reflected about the diagonal, through the same `pane` part.

**Customize Layout.** Spec 5.2: "frame with four panes, one pane filled". The window is divided on column 7 and row 7, like the splits, and the top-left pane is filled the way a toggle's pane is (no hole). The stock `layout` is three separate tiles; four panes in one window also keep it apart from the house `rune-tiles` (extensions), whose filled tile is lifted off three outlined ones.

- [ ] **Step 1: Write the failing tests**

In `test/layout-glyphs.test.mjs`, change the svg-geometry import to:

```js
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, pointInPolygon, signedArea, subpaths } from '../scripts/lib/svg-geometry.mjs';
```

and append:

```js

// ---- Split editor and Customize Layout (Task 9) ----
test('split-horizontal (Split Editor Right): side-by-side panes, the divider on column 7, a block in the new right pane', () => {
  assert.equal(row('split-horizontal', 8.5), '#.....#.####.#');
  // The block is the filled part, a solid 4x10 inside the right pane's hole, one unit clear of the divider and walls.
  const [window, ...inner] = outlinesOf(drawings['split-horizontal']());
  const holes = inner.filter((poly) => signedArea(poly) < 0);
  const blocks = inner.filter((poly) => signedArea(poly) > 0);
  assert.equal(holes.length, 2);
  assert.equal(blocks.length, 1);
  assert.deepEqual(box([`M${blocks[0].map(([x, y]) => `${x} ${y}`).join('L')}Z`]), { minX: 9, maxX: 13, minY: 3, maxY: 13 });
  assert.equal(outlineGap(blocks, [window, ...holes]), 1);
});

test('split-vertical (Split Editor Down) is split-horizontal reflected about the diagonal: stacked panes, divider on row 7', () => {
  assert.deepEqual(mismatches('split-vertical', 'split-horizontal', ([x, y]) => [y, x]), []);
  const column = pixels.slice(1, 15).map((y) => (inkAt('split-vertical', [8.5, y]) ? '#' : '.')).join('');
  assert.equal(column, '#.....#.####.#');
});

test('configure-layout-icon: the window in four panes, the dividers on column 7 and row 7, the top-left pane filled', () => {
  assert.equal(row('four-panes', 4.5), '#######......#');
  assert.equal(row('four-panes', 7.5), '##############');
  assert.equal(row('four-panes', 10.5), '#.....#......#');
  assert.equal(outlinesOf(drawings['four-panes']()).filter((poly) => signedArea(poly) < 0).length, 3, 'three open panes');
});
```

Append to `test/product-icon-theme.test.mjs`:

```js

test('every layout ID maps to the drawing of its Codicon default, so layout IDs share a drawing exactly when they share a default', () => {
  const layout = ['split-horizontal', 'split-vertical', 'panel-left', 'panel-left-off', 'panel-layout-icon', 'panel-layout-icon-off',
    'auxiliarybar-right-layout-icon', 'auxiliarybar-right-off-layout-icon', 'panel-right', 'panel-right-off',
    'auxiliarybar-left-layout-icon', 'auxiliarybar-left-off-layout-icon', 'panel-bottom', 'configure-layout-icon'].sort();
  for (const id of layout) assert.equal(pinned.ids[id]?.batch, 'editor', id);
  const drawingOf = (id) => Object.entries(map.drawings).find(([, { ids }]) => ids.includes(id))?.[0];
  assert.deepEqual(Object.fromEntries(layout.map((id) => [id, drawingOf(id)])), {
    'auxiliarybar-left-layout-icon': 'pane-left', 'auxiliarybar-left-off-layout-icon': 'pane-left-off',
    'auxiliarybar-right-layout-icon': 'pane-right', 'auxiliarybar-right-off-layout-icon': 'pane-right-off',
    'configure-layout-icon': 'four-panes',
    'panel-bottom': 'pane-bottom', 'panel-layout-icon': 'pane-bottom', 'panel-layout-icon-off': 'pane-bottom-off',
    'panel-left': 'pane-left', 'panel-left-off': 'pane-left-off', 'panel-right': 'pane-right', 'panel-right-off': 'pane-right-off',
    'split-horizontal': 'split-horizontal', 'split-vertical': 'split-vertical',
  });
  // The sharing follows the registered defaults (layout-sidebar-left, layout-sidebar-right, layout-panel and their -off
  // forms): one drawing per default, a different drawing for each default, and a codicon ID (no default) on its own.
  const byDefault = Object.groupBy(layout, (id) => pinned.ids[id].default ?? id);
  for (const ids of Object.values(byDefault)) assert.equal(new Set(ids.map(drawingOf)).size, 1, ids.join(', '));
  assert.equal(new Set(layout.map(drawingOf)).size, Object.keys(byDefault).length);
  for (const [name, codepoint] of [['pane-left', 'E160'], ['pane-left-off', 'E161'], ['pane-right', 'E162'], ['pane-right-off', 'E163'],
    ['pane-bottom', 'E164'], ['pane-bottom-off', 'E165'], ['split-horizontal', 'E166'], ['split-vertical', 'E167'], ['four-panes', 'E168']]) {
    assert.equal(map.drawings[name]?.codepoint, codepoint, name);
  }
  for (const id of layout) assert.equal(theme.iconDefinitions[id]?.fontCharacter, `\\${map.drawings[drawingOf(id)]?.codepoint}`, id);
});
```

Run: `node --test --test-reporter=tap test/layout-glyphs.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^not ok|^# (pass|fail)|^  error'`
Expected:

```
not ok 7 - split-horizontal (Split Editor Right): side-by-side panes, the divider on column 7, a block in the new right pane
  error: 'drawings[name] is not a function'
not ok 8 - split-vertical (Split Editor Down) is split-horizontal reflected about the diagonal: stacked panes, divider on row 7
  error: 'drawings[name] is not a function'
not ok 9 - configure-layout-icon: the window in four panes, the dividers on column 7 and row 7, the top-left pane filled
  error: 'drawings[name] is not a function'
not ok 23 - every layout ID maps to the drawing of its Codicon default, so layout IDs share a drawing exactly when they share a default
  error: |-
# pass 19
# fail 4
```

The coverage test fails on the ID-to-drawing table: `split-horizontal`, `split-vertical` and `configure-layout-icon` map to `undefined`.

- [ ] **Step 2: Append the drawings**

Append to `scripts/glyphs/layout.mjs`:

```js

// ---- Split editor and Customize Layout (Task 9) ----
// The Codicon names read backwards: split-horizontal (Split Editor Right, the terminal's Split, Open to the Side) puts
// the panes side by side with an upright divider; split-vertical (Split Editor Down, and the notebook's Split Cell
// through notebook-split-cell's default) stacks them. The divider is on pixel column 7 (x7-8; row 7 when stacked),
// so the old pane is 5 wide (x2-7) and the new pane 6 (x8-14). The new pane holds the filled part (spec 5.2), a 4x10
// block one unit clear of the divider and the walls (section 4 accent clearance). A toggle's pane joins the wall as one
// solid side; this block floats inside its pane, so a split never reads as a side bar toggle.
const split = (side) => [windowOutline(), pane(side, [2, 2, 5, 12]), pane(side, [8, 2, 6, 12]), pane(side, [9, 3, 4, 10], 'cw')];
drawings['split-horizontal'] = () => svgDocument(split('left'));
drawings['split-vertical'] = () => svgDocument(split('top'));

// configure-layout-icon (Customize Layout, the layout controls' menu): the window in four panes, the dividers on column
// 7 and row 7 like the splits, the top-left pane filled like a toggle's pane. The stock `layout` is three separate tiles;
// four panes in one window keep it apart from the house rune tiles (extensions), whose filled tile is lifted off the
// others.
drawings['four-panes'] = () => svgDocument(windowOutline(), pane('left', [8, 2, 6, 5]), pane('left', [2, 8, 5, 6]), pane('left', [8, 8, 6, 6]));
```

Run: `node --test test/layout-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 9`, `ℹ pass 9`, `ℹ fail 0`.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs split-horizontal E166 split-horizontal
node scripts/claim-drawing.mjs split-vertical E167 split-vertical
node scripts/claim-drawing.mjs four-panes E168 configure-layout-icon
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:editor 2>&1 | grep -E '^✗|^✓'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{split-horizontal,split-vertical,four-panes}.svg
```

Expected:
- `Wrote 98 glyph SVGs` (89 after Part B1, plus 9).
- `split-horizontal (E166) <- split-horizontal`, `split-vertical (E167) <- split-vertical`, `four-panes (E168) <- configure-layout-icon`.
- `Built 98 product icon drawings for 158 icon IDs in icons/witchynibbles-product-icons.woff` (IDs: 124 at gate 3, + 20 from Part B1, + 14).
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ … (enforced: product-pipeline)`.
- `✓ WitchyNibbles package validation passed (enforced: product-batch:editor)`.
- `ℹ tests 371`, `ℹ fail 0` (7 more than after Task 8: 3 layout tests, 1 coverage test, 3 drawing drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 1H14A1 1 0 0 1 15 2V14A1 1 0 0 1 14 15H2A1 1 0 0 1 1 14V2A1 1 0 0 1 2 1ZM2 14L7 14L7 2L2 2ZM8 14L14 14L14 2L8 2ZM9 3L13 3L13 13L9 13Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 1H14A1 1 0 0 1 15 2V14A1 1 0 0 1 14 15H2A1 1 0 0 1 1 14V2A1 1 0 0 1 2 1ZM2 2L2 7L14 7L14 2ZM2 8L2 14L14 14L14 8ZM13 9L13 13L3 13L3 9Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 1H14A1 1 0 0 1 15 2V14A1 1 0 0 1 14 15H2A1 1 0 0 1 1 14V2A1 1 0 0 1 2 1ZM8 7L14 7L14 2L8 2ZM2 14L7 14L7 8L2 8ZM8 14L14 14L14 8L8 8Z"/></svg>
```

- [ ] **Step 4: Inspect against the stock Codicons**

Re-run the Task 8 Step 6 render block (from `node review-out/g4-layout/make.mjs` to `agent-browser close`; the page now has 13 rows, and the title-bar rows include Customize Layout), then the glyph sheet procedure. Open the PNGs with the Read tool, upscaling 16px crops with nearest-neighbour scaling, and check that at 16px and 100% on all three backgrounds:

- `split-horizontal` reads as a window split side by side with the new (right) pane marked, `split-vertical` as the same split stacked, and neither reads as `pane-right` or `pane-bottom` (a block floating in its pane, against a solid side);
- `four-panes` reads as a window in four with one pane filled, not as `rune-tiles`, and sits with the toggles in the title-bar rows as one family;
- every glyph is about the optical size of the stock Codicon beside it.

(Seen while writing this part: at 16px the split's block keeps a clear 1-pixel line on all four sides; at 12px the block and its gaps blur into a heavier pane, still unlike the toggles' solid side.)

- [ ] **Step 5: Enforce the editor stage**

Replace `scripts/validation-stage.json` with:

```json
{
  "$comment": "Stages that npm run validate enforces. Phases append stage names as their work lands; validate --release enforces every stage.",
  "enforce": ["base", "color-themes", "product-pipeline", "product-batch:1", "product-batch:chrome", "product-batch:status", "product-batch:panel", "product-batch:debug", "product-batch:editor"]
}
```

Run:

```bash
npm run validate 2>&1 | grep -v '^>' | grep .
npm run validate 2>&1 | grep -c 'product-batch:editor'
node scripts/validate.mjs --release 2>&1 | grep -c 'product-batch:editor'
node -e "const m=require('./icons/product-icon-map.json').drawings; console.log(Object.entries(m).filter(([,d])=>/^E16[0-8]$/.test(d.codepoint)).length)"
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:

```
… 36 pending problems in stages not yet enforced: product-batch:symbols (15), release (2), file-icons (19) (use --verbose to list)
⚠ icons/product-src/cat-slash.svg straight-segment points off the whole/half grid: (5.8, 4.85) (10.875, 15) (9.625, 5) (13.417, 12.583) (10.375, 14) (6.375, 6) …
⚠ icons/product-src/gear.svg straight-segment points off the whole/half grid: (11.182, 3.404) (12.243, 2.343) (13.657, 3.757) (12.596, 4.818) (12.596, 11.182) (13.657, 12.243) …
⚠ icons/product-src/sync-arrows.svg straight-segment points off the whole/half grid: (5.706, 4.723) (5.132, 3.904) (10.294, 11.277) (10.868, 12.096)
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug, product-batch:editor)
1
0
9
ℹ tests 371
ℹ fail 0
```

The three `⚠` lines are the off-grid points accepted at gate 2 (G16); no layout drawing adds one (every layout point is a whole number, and the across-modules grid test in `test/glyph-grid.test.mjs` holds the module to it). If `npm run validate` prints `✗ [product-batch:editor] product icon theme does not map …` lines instead, those IDs are Part B1's: stop, and finish Part B1 before enforcing the stage.

- [ ] **Step 6: Notes for the gate-4 README**

Task 14 Step 5 copies these into the README:

- Choices the author may overrule:
  - The frame toggles keep the stock layout silhouettes on the house grid (a solid side for on, a divided pane for off), as spec 5.1 asks for universal actions. They differ from the stock glyphs only in crisper, pixel-aligned walls and dividers, so at a glance they look stock. A house touch (for example a ✦ on the filled pane) would need a 5×5 accent with 1-unit clearance, which a 4-unit pane cannot hold.
  - The filled pane of an on toggle is a region of the window bounded by its walls and divider, not an accent placed beside a stroke, so it has no 1-unit clearance from the frame (as in the stock glyph). The split's new-pane block does keep that clearance.
  - IDs share a drawing exactly when their registered defaults share a Codicon: `panel-right` (the primary side bar toggle when the side bar is on the right) is the same right-pane glyph as the secondary side bar's `auxiliarybar-right-layout-icon`, and `panel-bottom` (Customize Layout's Panel row) the same bottom-pane glyph as Toggle Panel. D7's "mirrored pane drawings" are these shared drawings, built from one part.
  - The splits put the divider on pixel column 7, so the old pane is 5 wide and the new pane 6, and the new pane holds a floating 4×10 block (a fully filled new pane read as the right or bottom toggle).
  - `configure-layout-icon` is a window in four panes with the top-left pane filled, not the stock three tiles.
- Known: `notebook-split-cell` (unpinned) defaults to `split-vertical`, so the notebook's Split Cell shows the stacked split glyph.

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_9`
Expected: one 40-character tree id, also saved in `review-out/g4/TREE_9`.

---

## Part C: symbols batch (15 IDs)

Part C draws the "Symbols" paragraph of spec section 5.2: 11 drawings, E170-E17A, for 13 IDs, plus `symbol-module` and `symbol-namespace` claimed onto the status batch's `braces` (E128). The drawings live in `scripts/glyphs/symbols.mjs`, eighth and last in `glyphModules`. Codicon meanings are kept (cube = method, wrench = property, `[x]` = variable …), redrawn in the house style; every drawing has one filled part or none. The letterforms of `abc` are Part B1's shared letters (`letters` from `scripts/glyphs/editor.mjs`, Task 5) at the symbols size, so the find toggles and the symbols write one alphabet; the square brackets of `[x]` come from one bracket construction defined in this module (no other module draws one).

**Which IDs share a drawing (read from the 1.141 `codicon.ttf` and the bundle's codicon table while writing this part).** The stock font gives `symbol-method` and `symbol-function` one codepoint (EA8C, with `symbol-constructor`); `symbol-module` and `symbol-namespace` one codepoint (EA8B, with `symbol-package` and `symbol-object`) whose outline is identical to `bracket` (EB0F); and `symbol-string` (EB8D) and `symbol-text` (EA93, with `symbol-key`) two codepoints with identical outlines. This plan keeps exactly that sharing: one cube for method and function, one `abc` for string and text, and the house `{ }` (`braces`, E128, drawn at gate 2 for `bracket`) for module and namespace. Every other symbol kind gets its own drawing, so the 15 IDs show 12 glyphs. Task 12's coverage test pins the table, the three shares and the count.

**Where these IDs show in VS Code 1.141 (the bundle's CompletionItemKind and SymbolKind icon maps).**

| ID | Stock | Suggest widget | Outline, breadcrumbs, `@` symbol picker | Colour key set by the four themes |
| :- | :- | :- | :- | :- |
| `symbol-class` | EB5B | yes | yes | `symbolIcon.classForeground` (types colour) |
| `symbol-method`, `symbol-function` | EA8C | yes | yes | `methodForeground`, `functionForeground` (function colour) |
| `symbol-field` | EB5F | yes | yes | no: VS Code default `#75BEFF` / `#007ACC` |
| `symbol-property` | EB65 | yes | yes | `propertyForeground` (attribute colour) |
| `symbol-variable` | EA88 | yes | yes | `variableForeground` |
| `symbol-constant` | EB5D | yes | yes | no: foreground |
| `symbol-interface` | EB61 | yes | yes | no: `#75BEFF` / `#007ACC` |
| `symbol-enum` | EA95 | yes | yes | no: `symbolIcon.enumeratorForeground`, `#EE9D28` / `#D67E00` |
| `symbol-module` | EA8B | yes | yes | no: foreground |
| `symbol-namespace` | EA8B | no | yes | no: foreground |
| `symbol-keyword` | EB62 | yes | no | `keywordForeground` |
| `symbol-string` | EB8D | no | yes | no: foreground |
| `symbol-text` | EA93 | yes (word suggestions; also the terminal suggest widget's fallback icon) | no | no: foreground |
| `symbol-snippet` | EB66 | yes | no | no: foreground |

Registered IDs that default to these and so inherit the house drawings: `outline-view-icon` (default `symbol-class`: the Outline view's icon when the view is moved to its own container), `terminal-symbol-alias` and `terminal-symbol-method` (`symbol-method`), `terminal-symbol-argument` (`symbol-variable`), `terminal-symbol-option` (`symbol-enum`). The symbols render at 16px in every one of these places. Colour does not separate them: in Moonlit Candle, Moonlit and Coven Contrast `symbol-class` is `#77D9FF` and `symbol-field` and `symbol-interface` take the default `#75BEFF`, and six kinds take the plain foreground, so each drawing must differ from every other in silhouette. Task 12 pins a pixel-difference floor and judges the 16px lists.

Codepoints:

| Codepoint | Drawing | Task | IDs |
| :- | :- | :- | :- |
| E170 | `abc` | 10 | symbol-string, symbol-text |
| E171 | `bracket-x` | 10 | symbol-variable |
| E172 | `keyword-lines` | 10 | symbol-keyword |
| E173 | `snippet-frame` | 10 | symbol-snippet |
| (E128) | `braces` (status batch) | 10 | bracket, + symbol-module, symbol-namespace |
| E174 | `cube` | 11 | symbol-method, symbol-function |
| E175 | `slab` | 11 | symbol-field |
| E176 | `wrench` | 11 | symbol-property |
| E177 | `equals-block` | 11 | symbol-constant |
| E178 | `class-tree` | 12 | symbol-class |
| E179 | `lollipop` | 12 | symbol-interface |
| E17A | `cards` | 12 | symbol-enum |

E17B-E17F stay free. Unmapped `symbols` IDs (`node scripts/validate.mjs --only product-batch:symbols 2>&1 | grep -c 'does not map'`): 15 before Task 10, 8 after Task 10, 3 after Task 11, 0 after Task 12, which appends `product-batch:symbols` to `scripts/validation-stage.json`.

---

### Task 10: Symbols module, `abc` from the shared letters, the bracket construction, `[x]`, keyword, snippet; module and namespace on the braces

**Files:**
- Create: `scripts/glyphs/symbols.mjs`, `test/symbols-glyphs.test.mjs`, `icons/product-src/{abc,bracket-x,keyword-lines,snippet-frame}.svg` (generated), `review-out/g4-symbols/make.mjs` (git-ignored; Tasks 11 and 12 reuse it)
- Modify: `scripts/glyphs/index.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: `letters` from `scripts/glyphs/editor.mjs` (Task 5: `letters.a`, `letters.b`, `letters.c` with their size options); `polygon`, `rect`, `svgDocument` (primitives); `outlineGap`, `filledAt`, `parseGlyphSvg`, `pathBounds`, `subpaths` (`scripts/lib/svg-geometry.mjs`); `glyphRuleProblems`; the status batch's `braces` drawing (E128, claimed, not changed); `defaultBundle()` from `scripts/extract-icon-ids.mjs` (locates the stock `codicon.ttf` without a user path); Parts B1 and B2 already in `glyphModules`.
- Produces: the module `scripts/glyphs/symbols.mjs` (`drawings`, `variants`; `variants` stays empty), last in `glyphModules`; the drawings `abc` (E170), `bracket-x` (E171), `keyword-lines` (E172), `snippet-frame` (E173); `symbol-module` and `symbol-namespace` on `braces` (E128); `test/symbols-glyphs.test.mjs` with the helpers `pathsOf`, `piecesOf`, `box`, `bounds`, `outlinesOf`, `gap`, `inkAt`, `centres`, `row`, `column`, `symmetric`, `aboutX8`, `aboutY8`, which Tasks 11 and 12 append to.

**Letters and brackets.** `abc` is written with Task 5's shared letters at the symbols size, `letters.a(1, 12, { xHeight: 6, width: 4 })`, `letters.b(6, 12, { ascender: 9, bowl: 6, width: 4 })` and `letters.c(11, 12, { xHeight: 6, width: 4 })`: 4 units wide, 1-unit strokes on whole numbers, x-height 6 (y6-12), the `b`'s ascender to y3, 1 unit between letters, r1 outer corners on the round side, square stem side and inner corners, closed counters at least 2×2. Task 5's test `the shared letters keep the construction at the symbols size …` pins those metrics at exactly this size, so this task does not repeat them: it pins how `abc` reads at 16px, row by row, and that it calls the live letters at that size rather than a copy. The `a` must be double-storey: Part C's first draft drew a single-storey `a` (a full-height bowl with a square stem side), and the 16px row read "obc"; the row test fails on it (row 7 shows the bowl's left wall). Square brackets use the same 1-unit stroke, span y2-14 and have 2-unit serifs; the bracket construction lives in this module, since no other module draws one.

- [ ] **Step 1: Check the preconditions**

```bash
node -e "import('./scripts/glyphs/index.mjs').then(({ glyphModules }) => console.log(glyphModules.length))"
node scripts/validate.mjs --only product-batch:symbols 2>&1 | grep -c 'does not map'
node -e "const m=require('./icons/product-icon-map.json').drawings; console.log(m.braces.codepoint, m.braces.ids.join(' '), Object.values(m).filter((d) => /^E17/.test(d.codepoint)).length)"
```

Expected: `7` (batch 1, chrome, status, panel, debug, editor, layout), `15`, `E128 bracket 0`. If any line differs, stop: Parts B1 and B2 have not landed, or a codepoint in E170-E17F is taken.

- [ ] **Step 2: Write the failing test**

Create `test/symbols-glyphs.test.mjs` (the helpers already cover Tasks 11 and 12):

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { letters } from '../scripts/glyphs/editor.mjs';
import { rect } from '../scripts/glyphs/primitives.mjs';
import { drawings } from '../scripts/glyphs/symbols.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers for Tasks 10 to 12. Clearances use outlineGap (0 where outlines cross or overlap; it throws on an empty
// set, so a filter that matched nothing cannot pass), on the flattened outlines.
const pathsOf = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const piecesOf = (name) => pathsOf(name).join('').split(/(?=M)/); // one path string per subpath, in drawing order
const box = (ds) => Object.fromEntries(Object.entries(pathBounds([ds].flat(Infinity))).map(([key, value]) => [key, Number(value.toFixed(2))]));
const bounds = (name) => box(pathsOf(name));
const outlinesOf = (d) => [d].flat(Infinity).flatMap((part) => subpaths(part));
const gap = (a, b) => outlineGap(outlinesOf(a), outlinesOf(b));
const inkAt = (name, point) => filledAt(pathsOf(name), point);
// Ink at the 16 pixel centres of one row (y) or one column (x), '#' ink and '.' empty: at 16px/100% a unit is a pixel.
const centres = Array.from({ length: 16 }, (_, index) => index + 0.5);
const row = (name, y) => centres.map((x) => (inkAt(name, [x, y]) ? '#' : '.')).join('');
const column = (name, x) => centres.map((y) => (inkAt(name, [x, y]) ? '#' : '.')).join('');
// Fill symmetry, sampled with the font's nonzero rule at points that lie on no edge: off the half grid, off the 45-degree
// lines and off the 2:1 slopes of the boxes, for the point and its mirror (y ± x / 2 is never a multiple of 0.25).
const symmetric = (name, mirror) => {
  for (let x = 0.3; x < 16; x += 0.5) {
    for (let y = 0.55; y < 16; y += 0.5) {
      if (inkAt(name, [x, y]) !== inkAt(name, mirror([x, y]))) return `${x.toFixed(1)},${y.toFixed(1)}`;
    }
  }
  return true;
};
const aboutX8 = ([x, y]) => [16 - x, y];
const aboutY8 = ([x, y]) => [x, 16 - y];

test('symbol drawings follow the glyph rules: no errors and no warnings', () => {
  for (const [name, draw] of Object.entries(drawings)) {
    const { errors, warnings } = glyphRuleProblems(draw());
    assert.deepEqual({ errors, warnings }, { errors: [], warnings: [] }, name);
  }
});

// ---- Letters and brackets (Task 10) ----
test('abc (string, text): the shared letters at the symbols size, read row by row at 16px, with a double-storey a', () => {
  assert.deepEqual(bounds('abc'), { minX: 1, maxX: 15, minY: 3, maxY: 12 });
  // Rows of the 16px render, top to bottom. Every stroke is one pixel; the a's counter is 2x2 (rows 9-10), the b's
  // 2x4 (rows 7-10); the c is open on the right for 4 rows; columns 5 and 10 (between the letters) stay empty.
  assert.deepEqual([3.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5].map((y) => row('abc', y)), [
    '......#.........', // b ascender
    '......#.........',
    '..###.####.####.', // a top stroke, b and c tops
    '....#.#..#.#....', // a stem, b counter, c open
    '.####.#..#.#....', // a bowl top
    '.#..#.#..#.#....', // a counter
    '.#..#.#..#.#....',
    '.####.####.####.', // baseline strokes
    '................',
  ]);
});

test('abc calls the live shared letters of the editor module (Task 5) at the symbols size, not a copy of them', () => {
  const original = { ...letters };
  const calls = [];
  for (const name of ['a', 'b', 'c']) letters[name] = (...args) => { calls.push([name, ...args]); return rect(args[0], 6, 4, 6); };
  try {
    assert.deepEqual(outlinesOf(pathsOf('abc')), outlinesOf([rect(1, 6, 4, 6), rect(6, 6, 4, 6), rect(11, 6, 4, 6)]));
    assert.deepEqual(calls, [['a', 1, 12, { xHeight: 6, width: 4 }], ['b', 6, 12, { ascender: 9, bowl: 6, width: 4 }], ['c', 11, 12, { xHeight: 6, width: 4 }]]);
  } finally {
    Object.assign(letters, original);
  }
});

test('[x] (variable): square brackets of the letter stroke, mirrored about x = 8, around a 5x5 saltire 2 or more clear', () => {
  assert.deepEqual(bounds('bracket-x'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  assert.equal(symmetric('bracket-x', aboutX8), true);
  const [left, right, x] = piecesOf('bracket-x');
  assert.deepEqual(box(x), { minX: 5.5, maxX: 10.5, minY: 5.5, maxY: 10.5 });
  assert.ok(gap(x, [left, right]) >= 2, `x to brackets: ${gap(x, [left, right])}`);
  assert.equal(row('bracket-x', 2.5), '..###......###..', 'serifs 2 long');
  assert.equal(column('bracket-x', 2.5), '..############..', 'bracket y2-14');
  for (const [point, filled] of [[[8, 8], true], [[6.5, 6.5], true], [[9.5, 9.5], true], [[6.5, 9.5], true], [[8, 6], false], [[6, 8], false], [[3.5, 8], false]]) {
    assert.equal(inkAt('bracket-x', point), filled, `${point}`);
  }
});

test('keyword: a solid 5x3 keyword and lines 1 unit thick, 2 units apart', () => {
  assert.deepEqual(bounds('keyword-lines'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  const [keyword, ...lines] = piecesOf('keyword-lines');
  assert.deepEqual(box(keyword), { minX: 2, maxX: 7, minY: 2, maxY: 5 }); // dot-like accent, at least 3x3 (section 4)
  assert.ok(gap(keyword, lines) >= 2, 'keyword to lines');
  assert.equal(column('keyword-lines', 2.5), '..###..#..#..#..');
  assert.equal(column('keyword-lines', 13.5), '...#...#..#.....', 'the last line is short');
});

test('snippet: an open frame, mirrored about x = 8, whose bottom edge is three 2-unit dashes 2 units apart', () => {
  assert.deepEqual(bounds('snippet-frame'), { minX: 3, maxX: 13, minY: 2, maxY: 14 });
  assert.equal(symmetric('snippet-frame', aboutX8), true);
  assert.equal(row('snippet-frame', 13.5), '...##..##..##...');
  assert.equal(column('snippet-frame', 3.5), '..#########..#..', 'side wall y2-11, 2 units above the dash');
  assert.equal(row('snippet-frame', 2.5), '...##########...', 'top edge');
  assert.equal(inkAt('snippet-frame', [8, 8]), false);
});
```

Run: `node --test test/symbols-glyphs.test.mjs 2>&1 | grep -m1 -o 'ERR_MODULE_NOT_FOUND'`
Expected: `ERR_MODULE_NOT_FOUND` (`scripts/glyphs/symbols.mjs` does not exist yet).

- [ ] **Step 3: Create the module with the letter drawings**

Create `scripts/glyphs/symbols.mjs`:

```js
// Gate 4 `symbols` batch (spec section 5.2, "Symbols"): the symbol-kind icons of the suggest widget, the Outline view
// and the breadcrumbs. Codicon meanings are kept (cube = method, wrench = property, [x] = variable ...), redrawn in the
// house style. They stand side by side in long 16px lists, coloured per kind by symbolIcon.*Foreground, and several
// kinds share a colour, so every drawing differs from every other symbol drawing in silhouette.
// Shared as in the 1.141 codicon.ttf: method and function (one codepoint), string and text (identical outlines),
// module and namespace (one codepoint, the outline of `bracket`, so they take the status batch's braces).
import { letters } from './editor.mjs';
import { polygon, rect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

const mirror = (points) => points.map(([x, y]) => [16 - x, y]); // about x = 8

// ---- Letters and brackets (Task 10) ----
// Letterforms are the set's one letter construction, the shared `letters` of the editor module (Task 5), called at draw
// time so a change to the letters reaches abc. At the symbols size they are 4 units wide, x-height 6 (y6-12), the b's
// ascender to y3, 1 unit apart. The a is double-storey: a single-storey a (a bowl as tall as the x-height with a square
// stem side) read as `o` at 16px ("obc").
// One bracket construction: the letter stroke, y2-14, serifs 2 long. `[` at x2-5; `]` is its mirror about x = 8.
const squareBracket = [[2, 2], [5, 2], [5, 3], [3, 3], [3, 13], [5, 13], [5, 14], [2, 14]];

// symbol-string, symbol-text: `abc`, the stock picture of both, x1-15, y3-12. Letterforms only, no filled part.
drawings.abc = () => svgDocument(
  letters.a(1, 12, { xHeight: 6, width: 4 }), // x1-5, y6-12
  letters.b(6, 12, { ascender: 9, bowl: 6, width: 4 }), // x6-10, y3-12
  letters.c(11, 12, { xHeight: 6, width: 4 }), // x11-15, y6-12
);

// symbol-variable: `[x]`. The x is a 5x5 saltire on (8,8), arms 1.41 across like close, 2.5 units inside each bracket.
// Stroke glyph, no filled part. (p, q) = (dx + dy, dx - dy); k = half-width, m = arm length, both in that measure.
const saltire = (cx, cy, k, m) => polygon(
  [[k, m], [k, k], [m, k], [m, -k], [k, -k], [k, -m], [-k, -m], [-k, -k], [-m, -k], [-m, k], [-k, k], [-k, m]]
    .map(([p, q]) => [cx + (p + q) / 2, cy + (p - q) / 2]),
);
drawings['bracket-x'] = () => svgDocument(polygon(squareBracket), polygon(mirror(squareBracket)), saltire(8, 8, 1, 4));

// symbol-keyword: lines of code with the keyword as a solid 5x3 block (the filled part), where the stock glyph boxes
// the first word. Lines 1 unit, 2 units apart.
drawings['keyword-lines'] = () => svgDocument(
  rect(2, 2, 5, 3), // accent: keyword x2-7, y2-5
  rect(9, 3, 5, 1), // rest of the first line x9-14
  rect(2, 7, 12, 1), rect(2, 10, 12, 1), rect(2, 13, 8, 1),
);

// symbol-snippet: a template block whose bottom edge is still open, drawn in dashes (the stock picture). Top and sides
// have the terminal frame's r1 outer corners and 1-unit walls; three 2-unit dashes, 2 units apart and 2 below the
// walls. Stroke glyph, no filled part.
drawings['snippet-frame'] = () => svgDocument(
  'M4 2H12A1 1 0 0 1 13 3V11H12V3H4V11H3V3A1 1 0 0 1 4 2Z', // top and sides x3-13, y2-11
  rect(3, 13, 2, 1), rect(7, 13, 2, 1), rect(11, 13, 2, 1), // dashes y13-14
);
```

In `scripts/glyphs/index.mjs`, add `import * as symbols from './symbols.mjs';` below the layout import and append `symbols` to the list, so the file reads:

```js
import * as batch1 from './batch-1.mjs';
import * as chrome from './chrome.mjs';
import * as status from './status.mjs';
import * as panel from './panel.mjs';
import * as debug from './debug.mjs';
import * as editor from './editor.mjs';
import * as layout from './layout.mjs';
import * as symbols from './symbols.mjs';

export const glyphModules = [batch1, chrome, status, panel, debug, editor, layout, symbols];
```

Run: `node --test test/symbols-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 6`, `ℹ pass 6`, `ℹ fail 0`.

The row test catches a single-storey `a` (checked while writing: with the `a` replaced by a full-height bowl, `['M2 6H5V12H2A1 1 0 0 1 1 11V7A1 1 0 0 1 2 6Z', rect(2, 7, 2, 4, 'ccw')]`, both `abc` tests fail; row 7 shows the bowl's left wall). Task 5's letter tests hold the metrics at this size; these two pin the reading and the import.

- [ ] **Step 4: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs abc E170 symbol-string symbol-text
node scripts/claim-drawing.mjs bracket-x E171 symbol-variable
node scripts/claim-drawing.mjs keyword-lines E172 symbol-keyword
node scripts/claim-drawing.mjs snippet-frame E173 symbol-snippet
node scripts/claim-drawing.mjs braces E128 bracket symbol-module symbol-namespace
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓'
node scripts/validate.mjs --only product-batch:symbols 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{abc,bracket-x,keyword-lines,snippet-frame}.svg
```

Expected:
- `Wrote 102 glyph SVGs`.
- `abc (E170) <- symbol-string, symbol-text`, `bracket-x (E171) <- symbol-variable`, `keyword-lines (E172) <- symbol-keyword`, `snippet-frame (E173) <- symbol-snippet`, `braces (E128) <- bracket, symbol-module, symbol-namespace`, none with a `removed` suffix. Re-claiming `braces` moves its entry to the end of the map (cosmetic, as with `warning-triangle` at gate 3).
- `Built 102 product icon drawings for 165 icon IDs in icons/witchynibbles-product-icons.woff`.
- `✓ WitchyNibbles package validation passed (enforced: product-pipeline)`, no `✗` line.
- `8`.
- `ℹ tests 381`, `ℹ fail 0` (10 more than after Task 9: 6 symbol tests, 4 drawing drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 6H4A1 1 0 0 1 5 7V12H2A1 1 0 0 1 1 11V9A1 1 0 0 1 2 8H4V7H2ZM2 11L4 11L4 9L2 9ZM6 3H7V6H9A1 1 0 0 1 10 7V11A1 1 0 0 1 9 12H6ZM7 11L9 11L9 7L7 7ZM12 6H15V7H12V11H15V12H12A1 1 0 0 1 11 11V7A1 1 0 0 1 12 6Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2L5 2L5 3L3 3L3 13L5 13L5 14L2 14ZM14 14L11 14L11 13L13 13L13 3L11 3L11 2L14 2ZM10.5 6.5L9 8L10.5 9.5L9.5 10.5L8 9L6.5 10.5L5.5 9.5L7 8L5.5 6.5L6.5 5.5L8 7L9.5 5.5Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2L7 2L7 5L2 5ZM9 3L14 3L14 4L9 4ZM2 7L14 7L14 8L2 8ZM2 10L14 10L14 11L2 11ZM2 13L10 13L10 14L2 14Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M4 2H12A1 1 0 0 1 13 3V11H12V3H4V11H3V3A1 1 0 0 1 4 2ZM3 13L5 13L5 14L3 14ZM7 13L9 13L9 14L7 14ZM11 13L13 13L13 14L11 14Z"/></svg>
```

- [ ] **Step 5: Inspect against the stock Codicons, as a row and as a list**

Write the comparison page once (Tasks 11 and 12 reuse it). It finds the stock font through `defaultBundle()`, so no user path is written anywhere:

```bash
mkdir -p review-out/g4-symbols
cat > review-out/g4-symbols/make.mjs <<'MAKE'
// Symbol drawings from the built font beside the stock Codicons they replace (12/16/24px on dark, light and gold), every
// mapped symbol glyph in one 16px row, and 16px lists per theme: the Outline view on the side bar in the symbolIcon
// colours, the same list in one colour (silhouette only), the suggest widget on VS Code's default widget background,
// and the stock Codicons. Kinds whose drawing is not mapped yet are left out of the house rows and lists.
import fs from 'node:fs';
import path from 'node:path';
import { defaultBundle } from '../../scripts/extract-icon-ids.mjs';

const out = path.resolve('review-out/g4-symbols');
const bundle = defaultBundle();
if (!bundle) throw new Error('VS Code 1.141 not found: set VSCODE_WORKBENCH_JS');
fs.copyFileSync('icons/witchynibbles-product-icons.woff', path.join(out, 'house.woff'));
fs.copyFileSync(bundle.replace(/vs\/workbench\/workbench\.desktop\.main\.js$/, 'media/codicon.ttf'), path.join(out, 'codicon.ttf'));
const { drawings } = JSON.parse(fs.readFileSync('icons/product-icon-map.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// [symbol kind, house drawing, stock Codicon character (the 1.141 bundle's codicon table), colour key, list label]
const kinds = [
  ['class', 'class-tree', 'EB5B', 'class', 'CandleShop'], ['method', 'cube', 'EA8C', 'method', 'light()'],
  ['function', 'cube', 'EA8C', 'function', 'brew()'], ['field', 'slab', 'EB5F', 'field', 'wickLength'],
  ['property', 'wrench', 'EB65', 'property', 'colour'], ['variable', 'bracket-x', 'EA88', 'variable', 'count'],
  ['constant', 'equals-block', 'EB5D', 'constant', 'MAX_WAX'], ['interface', 'lollipop', 'EB61', 'interface', 'Lightable'],
  ['enum', 'cards', 'EA95', 'enumerator', 'Phase'], ['module', 'braces', 'EA8B', 'module', 'candles'],
  ['namespace', 'braces', 'EA8B', 'namespace', 'Coven'], ['keyword', 'keyword-lines', 'EB62', 'keyword', 'return'],
  ['string', 'abc', 'EB8D', 'string', '"moonlit"'], ['text', 'abc', 'EA93', 'text', 'moonlight'],
  ['snippet', 'snippet-frame', 'EB66', 'snippet', 'for … of'],
];
// House glyphs a symbol could be mistaken for: [drawing, stock character]
const neighbours = [['close', 'EA76'], ['stop-square', 'EAD7'], ['moon-equals', 'EAA7']];
// VS Code 1.141 defaults (dark, light) for the symbolIcon keys the themes leave unset; unlisted keys default to the
// workbench foreground.
const DEFAULTS = {
  class: ['#EE9D28', '#D67E00'], method: ['#B180D7', '#652D90'], function: ['#B180D7', '#652D90'], field: ['#75BEFF', '#007ACC'],
  variable: ['#75BEFF', '#007ACC'], interface: ['#75BEFF', '#007ACC'], enumerator: ['#EE9D28', '#D67E00'],
};
const themes = pkg.contributes.themes.map(({ label, uiTheme, path: file }) => {
  const c = JSON.parse(fs.readFileSync(file, 'utf8')).colors;
  const fg = { vs: '#616161', 'vs-dark': '#CCCCCC', 'hc-black': '#FFFFFF' }[uiTheme];
  const colour = (key) => c[`symbolIcon.${key}Foreground`] ?? DEFAULTS[key]?.[uiTheme === 'vs' ? 1 : 0] ?? fg;
  const widget = { vs: '#F3F3F3', 'vs-dark': '#252526', 'hc-black': '#0C141F' }[uiTheme];
  return { label: label.replace('WitchyNibbles ', ''), side: c['sideBar.background'], text: c['sideBar.foreground'], widget, colour };
});
const mapped = kinds.filter(([, name]) => name in drawings);
const unique = (list) => [...new Map(list.map((kind) => [kind[1], kind])).values()];
const g = (family, codepoint, size, color = '') => `<span class="g" style="font:${size}px/1 ${family};${color && `color:${color}`}">&#x${codepoint};</span>`;
const strip = (family, codepoint) => [12, 16, 24].map((size) => g(family, codepoint, size)).join('');
const compare = [...unique(mapped).map(([, name, stock]) => [name, stock, kinds.filter((k) => k[1] === name).map((k) => k[0]).join(', ')]),
  ...neighbours.filter(([name]) => name in drawings).map(([name, stock]) => [name, stock, 'house neighbour'])]
  .map(([name, stock, note]) => `<tr><th>${name}<small>${note}</small></th>${[['#120C1F', '#A99AB9'], ['#F5ECFA', '#735F7D'], ['#FFD477', '#0D0916']]
    .map(([bg, fg]) => `<td style="background:${bg};color:${fg}">${strip('H', drawings[name].codepoint)}<i></i>${strip('C', stock)}</td>`).join('')}</tr>`).join('\n');
const row = (family, list, pick) => list.map((k) => g(family, pick(k), 16)).join('<b></b>');
const rows = [['#120C1F', '#F3EAF7'], ['#F8F0FB', '#26172F']].map(([bg, fg]) => [['H', unique(mapped), (k) => drawings[k[1]].codepoint], ['C', unique(kinds), (k) => k[2]]]
  .map(([family, list, pick]) => `<div class="row" style="background:${bg};color:${fg}">${row(family, list, pick)}</div>`).join('')).join('');
const list = (bg, text, entries, family, pick, colour) => `<div class="list" style="background:${bg};color:${text}">${entries
  .map((k) => `<div>${g(family, pick(k), 16, colour(k))}<span>${k[4]}</span></div>`).join('')}</div>`;
const house = (k) => drawings[k[1]].codepoint;
const lists = themes.map((t) => `<div class="theme"><h3>${t.label}</h3>${[
  list(t.side, t.text, mapped, 'H', house, (k) => t.colour(k[3])),
  list(t.side, t.text, mapped, 'H', house, () => t.text),
  list(t.widget, t.text, mapped, 'H', house, (k) => t.colour(k[3])),
  list(t.widget, t.text, kinds, 'C', (k) => k[2], (k) => t.colour(k[3])),
].join('')}</div>`).join('');
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Symbols vs Codicon</title>
<style>@font-face{font-family:H;src:url(house.woff)}@font-face{font-family:C;src:url(codicon.ttf)}
body{margin:8px;font:12px system-ui;background:#fff}table{border-collapse:collapse}th{text-align:left;padding:2px 8px;font-weight:500}th small{display:block;color:#666}
td{padding:6px 10px;white-space:nowrap}.g{display:inline-block;vertical-align:middle}td .g{margin-right:10px}i{display:inline-block;width:16px}
.row{display:inline-block;padding:6px 8px;margin:4px 8px 0 0}.row b{display:inline-block;width:6px}
.theme{display:inline-block;vertical-align:top;margin:8px 16px 0 0}.theme h3{margin:4px 0;font-size:12px}
.list{display:inline-block;vertical-align:top;padding:4px 0;width:150px;margin-right:6px;font:13px/22px system-ui}.list div{height:22px;padding:0 6px;white-space:nowrap}.list span{margin-left:6px;vertical-align:middle}</style>
<table><tr><th></th><th>dark: house 12/16/24 · Codicon 12/16/24</th><th>light</th><th>gold</th></tr>
${compare}</table>
<h3>16px row: house, then Codicon (dark, then light)</h3>${rows}
<h3>16px lists per theme: Outline on the side bar in the symbol colours; the same in one colour; suggest widget; stock Codicons</h3>${lists}`);
console.log(path.join(out, 'index.html'));
MAKE
node review-out/g4-symbols/make.mjs
export AGENT_BROWSER_SESSION=spellbound-gate4
for dpr in 1 2; do
  agent-browser set viewport 1400 900 $dpr
  agent-browser open "file://$PWD/review-out/g4-symbols/index.html"
  agent-browser screenshot --full "$PWD/review-out/g4-symbols/compare@${dpr}x.png"
done
agent-browser close
```

Then run the glyph sheet procedure (Global Constraints). Open the PNGs with the Read tool; crop the 16px cells, the row and the lists, and upscale them with nearest-neighbour scaling (PIL) to judge single pixels. The page has three parts: each mapped drawing beside the stock glyph it replaces at 12/16/24px on dark, light and gold (with `close`, `stop-square` and `moon-equals` as the house glyphs a symbol could be mistaken for); one 16px row of every mapped symbol glyph, house above stock; and per theme four 16px lists (the Outline view on the side bar in the theme's symbol colours, the same list in one colour, the suggest widget on VS Code's default widget background, the stock list). Check at 16px and 100%:

- `abc` reads "abc", not "obc" or "dbc"; the three letters stay apart;
- `[x]` reads as an x in square brackets, not as `close` boxed in; the x is centred;
- the keyword glyph reads as lines of text with one solid word, and the snippet as an open frame whose bottom is dashed (three dashes, not a solid line);
- the braces of `candles` and `Coven` (module, namespace) sit in the list at the same optical size as the new glyphs;
- in the one-colour list, `[x]`, `{ }`, keyword, `abc` and snippet can be told apart without colour.

- [ ] **Step 6: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_10`
Expected: one 40-character tree id, also saved in `review-out/g4/TREE_10`.

---

### Task 11: Members: cube, slab, wrench, `=` block

**Files:**
- Create: `icons/product-src/{cube,slab,wrench,equals-block}.svg` (generated)
- Modify: `scripts/glyphs/symbols.mjs`, `test/symbols-glyphs.test.mjs`, `test/review-harness.test.mjs` (the icon sheet's page count), `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: Task 10's module and test helpers; `roundRect` (primitives); `review-out/g4-symbols/make.mjs` (Task 10).
- Produces: the drawings `cube` (E174), `slab` (E175), `wrench` (E176), `equals-block` (E177); the map passes 102 drawings, so the icon sheet's page-count assertion expects three pages from here on (Task 13 adds the third page scene).

**Method and field in one list.** Member completions put methods and fields side by side all the time, and the stock field is the method cube squashed flat. The house keeps that kinship and makes it a silhouette difference: the method is a tall cube (12×14) whose top face is the filled part over two hollow side faces; the field is a flat slab (14×10), a wider solid top face over a single band, because sides that low cannot hold a 2-unit hole. Both use 2:1 slopes (section 4's advisory angles), with 1.5-unit slanted walls (1.34 across the slope).

- [ ] **Step 1: Write the failing tests**

Append to `test/symbols-glyphs.test.mjs`:

```js

// ---- Members (Task 11) ----
test('method (cube): a solid top face 1.34 above two hollow side faces, the front edge on pixel column 7', () => {
  assert.deepEqual(bounds('cube'), { minX: 2, maxX: 14, minY: 1, maxY: 15 });
  const [lid, ...sides] = piecesOf('cube');
  assert.deepEqual(box(lid), { minX: 2, maxX: 14, minY: 1, maxY: 7 });
  assert.ok(gap(lid, sides) >= 1.3, `top face to sides: ${gap(lid, sides)}`); // 1.5 tall on the 2:1 slope = 1.34 across
  // Row 10: left wall, a 4-wide left face, the front edge on column 7, a 5-wide right face, right wall.
  assert.equal(row('cube', 10.5), '..#....#.....#..');
  assert.equal(inkAt('cube', [8, 4]), true, 'top face');
  assert.equal(inkAt('cube', [8, 7.75]), false, 'the step between top face and sides');
  assert.equal(inkAt('cube', [8, 14.5]), true, 'bottom corner');
});

test('field (slab): the flat sibling of the cube, a solid top face over a 1.5-unit band, mirrored about x = 8', () => {
  assert.deepEqual(bounds('slab'), { minX: 1, maxX: 15, minY: 3, maxY: 13 });
  assert.equal(symmetric('slab', aboutX8), true);
  const [lid, band] = piecesOf('slab');
  assert.deepEqual(box(lid), { minX: 1, maxX: 15, minY: 3, maxY: 10 });
  assert.ok(gap(lid, band) >= 1.3, `top face to band: ${gap(lid, band)}`);
  assert.equal(column('slab', 8), '...#######.##...', 'top face y3-10, step, band y11.5-13');
  assert.equal(column('slab', 1.5), '......#.##......', 'top face corner, step, band');
});

test('property (wrench): one solid shape, a 2.12-wide jaw and a 2.12-wide handle on x + y = 16', () => {
  assert.deepEqual(bounds('wrench'), { minX: 2, maxX: 14.35, minY: 1.65, maxY: 14 });
  assert.equal(piecesOf('wrench').length, 1);
  // Across the jaw, square to it (x - y = 9): open from x + y = 14.5 to 17.5 (2.12 across), ink on both sides.
  const onJaw = (s) => [(s + 9) / 2, (s - 9) / 2];
  for (const s of [14.6, 15.5, 16.5, 17.4]) assert.equal(inkAt('wrench', onJaw(s)), false, `jaw at x + y = ${s}`);
  for (const s of [14.2, 17.8]) assert.equal(inkAt('wrench', onJaw(s)), true, `jaw wall at x + y = ${s}`);
  // Across the handle (x - y = -6): ink from x + y = 14.5 to 17.5 only.
  const onHandle = (s) => [(s - 6) / 2, (s + 6) / 2];
  for (const [s, filled] of [[14.2, false], [14.8, true], [16, true], [17.2, true], [17.8, false]]) {
    assert.equal(inkAt('wrench', onHandle(s)), filled, `handle at x + y = ${s}`);
  }
  for (const point of [[9, 5], [11, 7.5], [13.5, 6]]) assert.equal(inkAt('wrench', point), true, `head at ${point}`);
});

test('constant: a solid 10x10 block with "=" cut out as two 6-long slots, mirrored about x = 8 and y = 8', () => {
  assert.deepEqual(bounds('equals-block'), { minX: 3, maxX: 13, minY: 3, maxY: 13 });
  assert.equal(symmetric('equals-block', aboutX8), true);
  assert.equal(symmetric('equals-block', aboutY8), true);
  assert.equal(column('equals-block', 8), '...###.##.###...', 'slots y6-7 and y9-10, 2 units of block between');
  assert.equal(row('equals-block', 6.5), '...##......##...', 'slot x5-11, 2-unit walls');
});
```

Run: `node --test --test-reporter=tap test/symbols-glyphs.test.mjs | grep -E '^not ok|  error|^# (pass|fail)'`
Expected:

```
not ok 7 - method (cube): a solid top face 1.34 above two hollow side faces, the front edge on pixel column 7
  error: 'drawings[name] is not a function'
not ok 8 - field (slab): the flat sibling of the cube, a solid top face over a 1.5-unit band, mirrored about x = 8
  error: 'drawings[name] is not a function'
not ok 9 - property (wrench): one solid shape, a 2.12-wide jaw and a 2.12-wide handle on x + y = 16
  error: 'drawings[name] is not a function'
not ok 10 - constant: a solid 10x10 block with "=" cut out as two 6-long slots, mirrored about x = 8 and y = 8
  error: 'drawings[name] is not a function'
# pass 6
# fail 4
```

These four drawings take the map from 102 to 106 drawings, past the two icon-sheet pages of 51 that gate 3 captures. The gate-3 harness test pins the page count on purpose, so that the gate adding the 103rd drawing also adds a page (`npm test` fails there until it does). Move that assertion to three pages now, test-first, so every task from here on stays green; Task 13 adds the `icon-sheet-3` scene the third page needs:

```bash
git apply <<'PATCH'
diff --git a/test/review-harness.test.mjs b/test/review-harness.test.mjs
index 2931f40..2f0e49a 100644
--- a/test/review-harness.test.mjs
+++ b/test/review-harness.test.mjs
@@ -232,9 +232,10 @@ test('the icon sheet shows every drawing at 200%: pages of three views of 17 row
   assert.match(source, /const ROWS_PER_VIEW = 17;/);
   assert.ok(17 * 22 <= 382, '17 rows fit a 382 px list');
   assert.match(source, /sheet\.description = `page \$\{page \+ 1\} of \$\{pages\}`/, 'every view header names its page');
-  // Gate 3 ends with 71 drawings (47 + 6 panel + 18 debug): two pages, whatever the map holds now.
-  const drawings = Math.max(71, Object.keys(json('icons/product-icon-map.json').drawings).length);
-  assert.equal(Math.ceil(drawings / (17 * views.length)), 2);
+  // Gate 4 shows the map as it stands after the editor, layout and symbols drawings (Parts B and C): more than 102
+  // drawings, so three pages, which gate 4 captures as three scenes. A map past 153 drawings needs a fourth scene.
+  const drawings = Object.keys(json('icons/product-icon-map.json').drawings).length;
+  assert.equal(Math.ceil(drawings / (17 * views.length)), 3, `${drawings} drawings`);
   const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
   assert.ok(keyOf('spellboundReview.iconSheetPage'), 'a chord turns the page');
 
PATCH
```

Run: `node --test --test-name-pattern='the icon sheet shows every drawing' test/review-harness.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|drawings$'`
Expected: `AssertionError [ERR_ASSERTION]: 102 drawings`, `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1` (102 drawings fill two pages). It passes once Step 3 has claimed the four drawings.

- [ ] **Step 2: Append the drawings**

In `scripts/glyphs/symbols.mjs`, change the primitives import to:

```js
import { polygon, rect, roundRect, svgDocument } from './primitives.mjs';
```

and append:

```js

// ---- Members (Task 11) ----
// Isometric boxes on 2:1 slopes (section 4's advisory angles). The top face is the filled part, one 1.5-unit step
// (1.34 across the slope) above the sides. Slanted walls are 1.5 tall (1.34 across), vertical walls 1 unit.
// symbol-method, symbol-function: a cube x2-14, y1-15. Its front edge is 1 unit on pixel column 7 (section 4), so the
// left face's hole is 4 wide and the right face's 5.
drawings.cube = () => svgDocument(
  polygon([[8, 1], [14, 4], [8, 7], [2, 4]]), // accent: top face x2-14, y1-7
  polygon([[2, 5.5], [8, 8.5], [14, 5.5], [14, 12], [8, 15], [2, 12]]), // sides
  polygon([[3, 7.5], [7, 9.5], [7, 13], [3, 11]], 'ccw'), // left face
  polygon([[8, 10], [13, 7.5], [13, 11], [8, 13.5]], 'ccw'), // right face
);

// symbol-field: a flat slab x1-15, y3-13, the cube's flat sibling (the stock field is a squashed method cube). Sides
// this low cannot hold a 2-unit hole, so they are one 1.5-unit band under the top face.
drawings.slab = () => svgDocument(
  polygon([[8, 3], [15, 6.5], [8, 10], [1, 6.5]]), // accent: top face x1-15, y3-10
  polygon([[1, 8], [8, 11.5], [15, 8], [15, 9.5], [8, 13], [1, 9.5]]), // sides
);

// symbol-property: an open-end wrench, one solid shape with the jaw cut out (the stock wrench is an outline). The head
// is a disc on (11,5) of radius sqrt(11.25), the radius at which every straight edge ends on the half grid. Handle and
// jaw run along x + y = 16 (45 degrees) and are both 2.12 across (x + y from 14.5 to 17.5), so the jaw clears the
// 2-unit cut-out minimum. A 1.41 handle would end off the grid where it meets the head.
const R = Math.sqrt(11.25).toFixed(3);
drawings.wrench = () => svgDocument(
  `M14 3.5A${R} ${R} 0 0 1 9.5 8L3.5 14L2 12.5L8 6.5A${R} ${R} 0 0 1 12.5 2L10.5 4L12 5.5Z`, // x2-14.35, y1.65-14
);

// symbol-constant: a solid block with `=` cut out (the house `=` of the conditional breakpoint): two 1-unit slots 6
// long (section 4 straight-slot exception), 2 units apart. 10x10 (x3-13), one unit inside the square keyline, so the
// solid block keeps about the cube's weight in a 16px list (88 and 83 inked pixels).
drawings['equals-block'] = () => svgDocument(roundRect(3, 3, 10, 10, 1), rect(5, 6, 6, 1, 'ccw'), rect(5, 9, 6, 1, 'ccw'));
```

Run: `node --test test/symbols-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 10`, `ℹ pass 10`, `ℹ fail 0`.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs cube E174 symbol-method symbol-function
node scripts/claim-drawing.mjs slab E175 symbol-field
node scripts/claim-drawing.mjs wrench E176 symbol-property
node scripts/claim-drawing.mjs equals-block E177 symbol-constant
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓'
node scripts/validate.mjs --only product-batch:symbols 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{cube,slab,wrench,equals-block}.svg
```

Expected:
- `Wrote 106 glyph SVGs`.
- `cube (E174) <- symbol-method, symbol-function`, `slab (E175) <- symbol-field`, `wrench (E176) <- symbol-property`, `equals-block (E177) <- symbol-constant`.
- `Built 106 product icon drawings for 170 icon IDs in icons/witchynibbles-product-icons.woff`.
- `✓ WitchyNibbles package validation passed (enforced: product-pipeline)`, no `✗` line.
- `3`.
- `ℹ tests 389`, `ℹ fail 0` (8 more than after Task 10: 4 symbol tests, 4 drift cases; the icon-sheet test now passes with 106 drawings).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M8 1L14 4L8 7L2 4ZM2 5.5L8 8.5L14 5.5L14 12L8 15L2 12ZM3 11L7 13L7 9.5L3 7.5ZM8 13.5L13 11L13 7.5L8 10Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M8 3L15 6.5L8 10L1 6.5ZM1 8L8 11.5L15 8L15 9.5L8 13L1 9.5Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M14 3.5A3.354 3.354 0 0 1 9.5 8L3.5 14L2 12.5L8 6.5A3.354 3.354 0 0 1 12.5 2L10.5 4L12 5.5Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M4 3H12A1 1 0 0 1 13 4V12A1 1 0 0 1 12 13H4A1 1 0 0 1 3 12V4A1 1 0 0 1 4 3ZM5 7L11 7L11 6L5 6ZM5 10L11 10L11 9L5 9Z"/></svg>
```

- [ ] **Step 4: Inspect against the stock Codicons, as a row and as a list**

Re-run the Task 10 Step 5 render block (from `node review-out/g4-symbols/make.mjs` to `agent-browser close`), then the glyph sheet procedure. Check at 16px and 100%:

- the cube reads as a cube (a solid lid over two faces split by a front edge), not a hexagon or a bag;
- the slab reads as a flat slab under the cube's lid, not as two stacked layers; in the one-colour list, `light()` (cube) and `wickLength` (slab) are told apart at a glance;
- the wrench reads as a wrench with an open jaw (the jaw stays open at 16px), not as a spoon or a key;
- the `=` block reads as a solid tile with `=` cut out; both slots stay open; it is not mistaken for `stop-square` or `moon-equals` on the page;
- no member glyph is noticeably heavier than its neighbours in the list (the `=` block is the heaviest symbol: 88 of 256 pixels, the cube 83).

- [ ] **Step 5: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_11`
Expected: one 40-character tree id, also saved in `review-out/g4/TREE_11`.

---

### Task 12: Types: class tree, lollipop, cards; the batch side by side; enforce `product-batch:symbols`

**Files:**
- Create: `icons/product-src/{class-tree,lollipop,cards}.svg` (generated)
- Modify: `scripts/glyphs/symbols.mjs`, `test/symbols-glyphs.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `scripts/validation-stage.json`, `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (section 5.2, the Symbols table), `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: Task 10's module and test helpers; `disc`, `frame`, `ring` (primitives); `drawings.braces` from `scripts/glyphs/status.mjs`; `pinned`, `map`, `theme` in `test/product-icon-theme.test.mjs`; `review-out/g4-symbols/make.mjs`.
- Produces: the drawings `class-tree` (E178), `lollipop` (E179), `cards` (E17A); every symbols ID mapped; a test that every pair of symbol glyphs differs at 16px; the stage `product-batch:symbols` enforced by `npm run validate`; spec 5.2's "Symbols" paragraph becomes a table like the other groups, with the letter construction written down.

- [ ] **Step 1: Write the failing tests**

In `test/symbols-glyphs.test.mjs`, add below the primitives import:

```js
import { drawings as status } from '../scripts/glyphs/status.mjs';
```

and append:

```js

// ---- Types, and the batch side by side (Task 12) ----
test('class: a solid 5x5 parent, two 5x5 child frames with 3x3 holes, 1-unit connectors on the centre lines', () => {
  assert.deepEqual(bounds('class-tree'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  const pieces = piecesOf('class-tree'); // parent, connector, upper child (2 subpaths), connector, lower child (2 subpaths)
  assert.equal(pieces.length, 7);
  assert.deepEqual(box(pieces[0]), { minX: 2, maxX: 7, minY: 2, maxY: 7 }); // the parent: shape accent at least 4x4
  assert.ok(gap(pieces[0], pieces.slice(-2)) >= 2, 'parent to the lower child');
  assert.ok(gap(pieces.slice(2, 4), pieces.slice(-2)) >= 2, 'upper child to lower child');
  assert.equal(row('class-tree', 4.5), '..########...#..', 'parent, connector, child with a 3-unit hole');
  assert.equal(row('class-tree', 11.5), '....######...#..', 'connector from the parent column into the lower child');
  assert.equal(column('class-tree', 4.5), '..##########....', 'parent, then the connector down to row 11');
  assert.equal(inkAt('class-tree', [8, 8]), false);
});

test('interface: a solid 3x3 dot on a 1-unit stick on row 7 into a 7-unit ring', () => {
  assert.deepEqual(bounds('lollipop'), { minX: 1, maxX: 15, minY: 4, maxY: 11 });
  assert.deepEqual(box(piecesOf('lollipop')[0]), { minX: 1, maxX: 4, minY: 6, maxY: 9 }); // dot-like accent, 3x3
  assert.equal(row('lollipop', 7.5), '.########.....#.', 'dot, stick, ring wall, 5-unit hole, ring wall');
  assert.equal(row('lollipop', 6.5), '.###....#.....#.', 'the stick is one row');
  assert.equal(row('lollipop', 8.5), '.###....#.....#.');
});

test('enum: a solid back card (an L of 4-unit arms) exactly 1 unit clear of the outline front card and its value line', () => {
  assert.deepEqual(bounds('cards'), { minX: 1, maxX: 15, minY: 2, maxY: 14 });
  const [back, ...front] = piecesOf('cards');
  assert.deepEqual(box(back), { minX: 6, maxX: 15, minY: 2, maxY: 9 });
  assert.equal(Number(gap(back, front).toFixed(3)), 1);
  assert.equal(row('cards', 4.5), '......#########.', 'back card, upper arm');
  assert.equal(row('cards', 7.5), '.#########.####.', 'front card top, 1-unit gap, back card lower arm');
  assert.equal(row('cards', 10.5), '.#.#####.#......', 'front card walls around the value line');
  assert.equal(column('cards', 12.5), '..#######.......', 'the lower arm is 4 units, y2-9');
});

// Pixels of the 16px/100% render: a pixel is ink when at least half of its 4x4 samples are (nonzero rule).
const pixels = (svg) => {
  const ds = parseGlyphSvg(svg).paths.map((path) => path.d);
  return centres.flatMap((py) => centres.map((px) => {
    let count = 0;
    for (const dy of [-0.375, -0.125, 0.125, 0.375]) for (const dx of [-0.375, -0.125, 0.125, 0.375]) count += filledAt(ds, [px + dx, py + dy]) ? 1 : 0;
    return count >= 8;
  }));
};

test('at 16px every symbol drawing differs from every other, and from the braces of module and namespace, in 40+ pixels', () => {
  // The symbol icons stand side by side in the suggest widget, the Outline view and the breadcrumbs, and several kinds
  // share a colour (class, field and interface are all cyan in Moonlit Candle), so they must differ in silhouette. This
  // pins against two drawings converging; the list view of the comparison page is where the reading is judged.
  // Measured minimum when drawn: 46 (snippet-frame and braces).
  const all = { ...Object.fromEntries(Object.entries(drawings).map(([name, draw]) => [name, pixels(draw())])), braces: pixels(status.braces()) };
  const names = Object.keys(all);
  assert.equal(names.length, 12);
  for (const [index, a] of names.entries()) {
    for (const b of names.slice(index + 1)) {
      const differ = all[a].filter((ink, pixel) => ink !== all[b][pixel]).length;
      assert.ok(differ >= 40, `${a} and ${b} differ in ${differ} pixels`);
    }
  }
});
```

Append to `test/product-icon-theme.test.mjs`:

```js

test('every symbols-batch ID maps to its drawing and codepoint, shared only where the stock Codicon shares', () => {
  const symbols = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'symbols').map(([id]) => id).sort();
  assert.equal(symbols.length, 15);
  const drawingOf = (id) => Object.entries(map.drawings).find(([, { ids }]) => ids.includes(id))?.[0];
  assert.deepEqual(Object.fromEntries(symbols.map((id) => [id, drawingOf(id)])), {
    'symbol-class': 'class-tree', 'symbol-constant': 'equals-block', 'symbol-enum': 'cards', 'symbol-field': 'slab',
    'symbol-function': 'cube', 'symbol-interface': 'lollipop', 'symbol-keyword': 'keyword-lines', 'symbol-method': 'cube',
    'symbol-module': 'braces', 'symbol-namespace': 'braces', 'symbol-property': 'wrench', 'symbol-snippet': 'snippet-frame',
    'symbol-string': 'abc', 'symbol-text': 'abc', 'symbol-variable': 'bracket-x',
  });
  for (const [name, codepoint] of [['abc', 'E170'], ['bracket-x', 'E171'], ['keyword-lines', 'E172'], ['snippet-frame', 'E173'],
    ['cube', 'E174'], ['slab', 'E175'], ['wrench', 'E176'], ['equals-block', 'E177'], ['class-tree', 'E178'], ['lollipop', 'E179'],
    ['cards', 'E17A'], ['braces', 'E128']]) {
    assert.equal(map.drawings[name].codepoint, codepoint, name);
  }
  for (const id of symbols) assert.equal(theme.iconDefinitions[id]?.fontCharacter, `\\${map.drawings[drawingOf(id)].codepoint}`, id);
  // The 1.141 codicon.ttf gives method and function one codepoint, module and namespace one codepoint whose outline is
  // the `bracket` glyph's, and string and text two codepoints with identical outlines. Every other symbol kind has its
  // own picture: 15 IDs, 12 glyphs.
  const glyph = (id) => theme.iconDefinitions[id].fontCharacter;
  assert.equal(glyph('symbol-function'), glyph('symbol-method'));
  assert.equal(glyph('symbol-module'), glyph('bracket'));
  assert.equal(glyph('symbol-namespace'), glyph('bracket'));
  assert.equal(glyph('symbol-text'), glyph('symbol-string'));
  assert.equal(new Set(symbols.map(glyph)).size, 12);
});
```

Run: `node --test --test-reporter=tap test/symbols-glyphs.test.mjs test/product-icon-theme.test.mjs | grep -E '^not ok|  error|^# (pass|fail)'`
Expected:

```
not ok 15 - every symbols-batch ID maps to its drawing and codepoint, shared only where the stock Codicon shares
  error: |-
not ok 26 - class: a solid 5x5 parent, two 5x5 child frames with 3x3 holes, 1-unit connectors on the centre lines
  error: 'drawings[name] is not a function'
not ok 27 - interface: a solid 3x3 dot on a 1-unit stick on row 7 into a 7-unit ring
  error: 'drawings[name] is not a function'
not ok 28 - enum: a solid back card (an L of 4-unit arms) exactly 1 unit clear of the outline front card and its value line
  error: 'drawings[name] is not a function'
not ok 29 - at 16px every symbol drawing differs from every other, and from the braces of module and namespace, in 40+ pixels
  error: |-
# pass 24
# fail 5
```

The coverage test fails on the ID-to-drawing table (`'symbol-class': undefined` where `'class-tree'` is expected), the pixel test on its count (`9 !== 12`).

- [ ] **Step 2: Append the drawings**

In `scripts/glyphs/symbols.mjs`, change the primitives import to:

```js
import { disc, frame, polygon, rect, ring, roundRect, svgDocument } from './primitives.mjs';
```

and append:

```js

// ---- Types (Task 12) ----
// symbol-class: the stock picture of a class and its members, a small node tree: a solid 5x5 parent (the filled part)
// at the upper left, one child to its right and one below and to the right, each a 5x5 frame with a 3x3 hole.
// 1-unit connectors on the nodes' centre lines; each runs 1 unit into the node it joins, so no seam is left.
drawings['class-tree'] = () => svgDocument(
  rect(2, 2, 5, 5), // accent: parent x2-7, y2-7
  rect(6, 4, 4, 1), // connector x6-10, y4-5
  frame(9, 2, 5, 5, { r: 0 }), // child x9-14, y2-7
  polygon([[4, 6], [5, 6], [5, 11], [10, 11], [10, 12], [4, 12]]), // connector down the parent's column, then right
  frame(9, 9, 5, 5, { r: 0 }), // child x9-14, y9-14
);

// symbol-interface: the stock lollipop, a solid 3x3 dot (the filled part) on a 1-unit stick into a 7-unit ring. Both
// diameters are odd, so dot, stick and ring share pixel row 7 (section 4). x1-15, y4-11.
drawings.lollipop = () => svgDocument(disc(2.5, 7.5, 1.5), rect(3, 7, 6, 1), ring(11.5, 7.5, 3.5));

// symbol-enum: the stock two cards: an outline card in front (x1-10, y7-14) with one value line, and the card behind
// it solid (the filled part), an L of 4-unit arms kept 1 unit clear of the front card. The stock enum-member (not
// pinned, so it stays stock) is the reverse, a solid front card, so the two kinds stay apart in a list.
drawings.cards = () => svgDocument(
  'M7 2H14A1 1 0 0 1 15 3V8A1 1 0 0 1 14 9H11V6H6V3A1 1 0 0 1 7 2Z', // accent: back card x6-15, y2-9
  frame(1, 7, 9, 7), // front card x1-10, y7-14
  rect(3, 10, 5, 1), // value line x3-8, y10-11
);
```

Run: `node --test test/symbols-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 14`, `ℹ pass 14`, `ℹ fail 0`.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs class-tree E178 symbol-class
node scripts/claim-drawing.mjs lollipop E179 symbol-interface
node scripts/claim-drawing.mjs cards E17A symbol-enum
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠' | cut -c1-60
node scripts/validate.mjs --only product-batch:symbols 2>&1 | grep -E '^✗|^✓'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{class-tree,lollipop,cards}.svg
```

Expected:
- `Wrote 109 glyph SVGs`.
- `class-tree (E178) <- symbol-class`, `lollipop (E179) <- symbol-interface`, `cards (E17A) <- symbol-enum`.
- `Built 109 product icon drawings for 173 icon IDs in icons/witchynibbles-product-icons.woff`: every one of the 173 pinned keys is mapped.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows` (no symbol drawing adds an off-grid point; the across-modules grid test in `test/glyph-grid.test.mjs` holds the module to the grid), then `✓ WitchyNibbles package validation passed (enforced: produ`.
- `✓ WitchyNibbles package validation passed (enforced: product-batch:symbols)`.
- `ℹ tests 397`, `ℹ fail 0` (8 more than after Task 11: 4 symbol tests, 1 coverage test, 3 drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2L7 2L7 7L2 7ZM6 4L10 4L10 5L6 5ZM9 2L14 2L14 7L9 7ZM10 6L13 6L13 3L10 3ZM4 6L5 6L5 11L10 11L10 12L4 12ZM9 9L14 9L14 14L9 14ZM10 13L13 13L13 10L10 10Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M1 7.5A1.5 1.5 0 1 1 4 7.5A1.5 1.5 0 1 1 1 7.5ZM3 7L9 7L9 8L3 8ZM8 7.5A3.5 3.5 0 1 1 15 7.5A3.5 3.5 0 1 1 8 7.5ZM9 7.5A2.5 2.5 0 1 0 14 7.5A2.5 2.5 0 1 0 9 7.5Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M7 2H14A1 1 0 0 1 15 3V8A1 1 0 0 1 14 9H11V6H6V3A1 1 0 0 1 7 2ZM2 7H9A1 1 0 0 1 10 8V13A1 1 0 0 1 9 14H2A1 1 0 0 1 1 13V8A1 1 0 0 1 2 7ZM2 13L9 13L9 8L2 8ZM3 10L8 10L8 11L3 11Z"/></svg>
```

- [ ] **Step 4: Inspect the batch as a row and as a list**

Re-run the Task 10 Step 5 render block, then the glyph sheet procedure. This is the batch's main review: judge the 16px row and the 16px lists of all four themes explicitly, the one-colour list first, and record the verdict per pair in the task report. Check at 16px and 100%:

- every glyph in the one-colour list can be named without its label, and no two neighbours are confusable; the pairs to look at hardest are cube and slab, `[x]` and `{ }`, `{ }` and snippet (the closest pair by pixels, 46 of 256), keyword and `abc`, cards and class tree;
- the class tree reads as a parent with two children, not as a grid or a plug; the lollipop as a dot on a stick into a ring (interface), not a key or a pin; the cards as a solid card behind an outline card, not as two windows;
- in Moonlit Candle, `CandleShop` (class, `#77D9FF`), `wickLength` (field, `#75BEFF`) and `Lightable` (interface, `#75BEFF`) are the same cyan, so they must part by silhouette alone;
- the row's optical weight is even enough that no glyph jumps out except by its filled part (the `=` block, cube and cards are the heaviest).

The pixel test (Step 1) only guards against two drawings converging; this look is what decides the reading.

- [ ] **Step 5: Enforce the symbols stage**

Replace `scripts/validation-stage.json` with (B2 appended `product-batch:editor`):

```json
{
  "$comment": "Stages that npm run validate enforces. Phases append stage names as their work lands; validate --release enforces every stage.",
  "enforce": ["base", "color-themes", "product-pipeline", "product-batch:1", "product-batch:chrome", "product-batch:status", "product-batch:panel", "product-batch:debug", "product-batch:editor", "product-batch:symbols"]
}
```

Run:

```bash
npm run validate 2>&1 | grep -v '^>' | grep .
npm run validate 2>&1 | grep -c 'product-batch:symbols'
node scripts/validate.mjs --release 2>&1 | grep -c 'product-batch:symbols'
node -e "const m=require('./icons/product-icon-map.json').drawings; console.log(Object.values(m).filter((d) => /^E17[0-9A]$/.test(d.codepoint)).length, m.braces.ids.join(' '))"
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:

```
… 21 pending problems in stages not yet enforced: release (2), file-icons (19) (use --verbose to list)
⚠ icons/product-src/cat-slash.svg straight-segment points off the whole/half grid: (5.8, 4.85) (10.875, 15) (9.625, 5) (13.417, 12.583) (10.375, 14) (6.375, 6) …
⚠ icons/product-src/gear.svg straight-segment points off the whole/half grid: (11.182, 3.404) (12.243, 2.343) (13.657, 3.757) (12.596, 4.818) (12.596, 11.182) (13.657, 12.243) …
⚠ icons/product-src/sync-arrows.svg straight-segment points off the whole/half grid: (5.706, 4.723) (5.132, 3.904) (10.294, 11.277) (10.868, 12.096)
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug, product-batch:editor, product-batch:symbols)
1
0
11 bracket symbol-module symbol-namespace
ℹ tests 397
ℹ fail 0
```

Every gate-4 product batch is now enforced; only `release` and `file-icons` stay pending.

- [ ] **Step 6: Record the batch in spec 5.2**

Spec 5.2 lists every other group as a table of IDs, glyph and filled part; the symbols were one sentence. In `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`, replace the one-line "Symbols" paragraph (it starts ``Symbols (`symbol-class`, ``, the last paragraph before "### 5.3 Review gate") with:

```markdown
Symbols (`symbol-class`, `-method`, `-function`, `-field`, `-property`, `-variable`, `-constant`, `-interface`, `-enum`, `-module`, `-namespace`, `-keyword`, `-string`, `-text`, `-snippet`): Codicon meanings kept, redrawn in the house style. The stock font's sharing is kept: `symbol-method` and `symbol-function` share one glyph, `symbol-string` and `symbol-text` another, and `symbol-module` and `symbol-namespace` take the `bracket` braces. Fifteen IDs, twelve glyphs, each told apart from every other by its silhouette at 16px, because several kinds share a colour in the suggest widget, the Outline view and the breadcrumbs.

| IDs | Glyph | Filled part |
| :- | :- | :- |
| `symbol-class` | node tree: parent upper left, a child to its right and one below-right, 1-unit connectors | parent node |
| `symbol-method`, `symbol-function` | isometric cube on 2:1 slopes, front edge on column 7 | top face |
| `symbol-field` | flat slab, the cube's flat sibling: top face over one band | top face |
| `symbol-property` | open-end wrench, one solid shape with the jaw cut out (2.12 wide) | the whole wrench (a solid silhouette like the witch hat and the quill vane; proposed at gate 4; see the gate-4 README) |
| `symbol-variable` | `[x]`: square brackets around a 5×5 saltire | none (strokes) |
| `symbol-constant` | 10×10 tile with `=` cut out (two 1×6 slots) | tile, `=` cut out (proposed at gate 4; see the gate-4 README) |
| `symbol-interface` | lollipop: dot, stick, 7-unit ring on row 7 | dot |
| `symbol-enum` | two cards: solid back card, outline front card with a value line | back card |
| `symbol-module`, `symbol-namespace` | `{ }`, the `bracket` drawing (as in the stock font) | none |
| `symbol-keyword` | lines of text with the first word as a solid block | keyword block |
| `symbol-string`, `symbol-text` | `abc` in the shared letter construction (double-storey `a`) | none (letterforms) |
| `symbol-snippet` | frame open at the bottom, bottom edge three dashes | none (strokes) |

Letterforms share one construction, used by the find toggles and the symbols alike: 1-unit stems and bars on whole numbers, 45° strokes 1.41 across, radius-1 outer corners on the round side, square stem side and inner corners, closed counters at least 2×2, letters 1 unit apart, a double-storey `a`. The find toggles use it 5 units wide with x-height 7 and capitals and ascenders 10; `abc` uses it 4 units wide with x-height 6 (y6–12) and the ascender to y3. Square brackets use the same 1-unit stroke, span y2–14 and have 2-unit serifs.
```

Run: ``grep -c '^| `symbol-' docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md && npm test 2>&1 | grep -E '^ℹ (tests|fail)'``
Expected: `12` (one row per glyph), `ℹ tests 397`, `ℹ fail 0`.

- [ ] **Step 7: Notes for the gate-4 README**

Task 14 Step 5 copies these into the README:

- Decisions for the author:
  - The stock font shares more symbol glyphs than the pinned list covers: `symbol-constructor` is the method cube (EA8C), `symbol-key` the text `abc` (EA93), `symbol-object` and `symbol-package` the module braces (EA8B). They are extended tier, so they stay stock: a TypeScript class's `constructor` shows the stock outline cube beside the house methods, and a JSON outline's keys and objects show the stock `abc` and braces. Pin them on the house drawings (4 more extras, claims only, no drawing), or leave them stock?
  - `equals-block` (constant) is a solid tile with `=` cut out, the heaviest symbol (88 of 256 pixels at 16px); the stock constant is an outline square with `=` strokes. Keep the solid tile, or draw an outline frame with a solid `=`?
  - The wrench (property) is one solid shape with the jaw cut out, like the witch hat (G12) and the quill vane (G26), because a 1.41 handle meets this head off the grid. Keep?
- Choices the author may overrule: the stock sharing is kept exactly (method/function, string/text, module/namespace on the gate-2 braces); the `a` of `abc` is the find toggles' double-storey `a` at the symbols size (a single-storey `a` read as "obc"); the slab (field) is a lid over one band because the low sides cannot hold a 2-unit hole, and it may read as "layers"; the class tree has the parent at the upper left with a child to the right and one below-right (the stock places three diamond nodes); the interface's filled part is the small dot, not the ring; the enum's back card is the solid one, the reverse of the stock enum-member, so an enum and its members differ in a completion list; the keyword and the snippet keep the stock pictures (lines with one boxed word, a frame with a dashed bottom).
- Observation for the colour themes (not a glyph change): in Moonlit Candle, Moonlit and Coven Contrast, `symbolIcon.classForeground` is `#77D9FF` while field and interface take VS Code's default `#75BEFF`, so the three read as one colour; Daydream's `#075B86` class and default `#007ACC` field are close too.

- [ ] **Step 8: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_12`
Expected: one 40-character tree id, also saved in `review-out/g4/TREE_12`.

---

## Part D: review gate 4 (scenes and run)

### How each gate-4 ID is brought on screen (checked in VS Code 1.141 while writing this part)

Each row was found in the 1.141 bundle (`workbench.desktop.main.js` and `.css`, the built-in `git` and `copilot` extensions) and then checked in probe runs and dry runs of the gate-4 job at 100% and 200% (Task 13 Step 6), with stock Codicons standing in for the editor, layout and symbols drawings. Every wait checks that the icon lies inside its container's box, not just that it is in the DOM. No editor or symbols ID needs a `NOT_IN_CONTEXT` entry: 1.141 draws all 49 somewhere the review profile reaches.

| ID | Where 1.141 draws it | Waited for in | Scene |
| :- | :- | :- | :- |
| `new-file`, `new-folder`, `refresh`, `collapse-all` | Explorer, the Folders view title actions (New File, New Folder, Refresh Explorer, Collapse Folders). They show only under the pointer unless `workbench.view.alwaysShowHeaderActions` is on (a scene setting) | `.part.sidebar` | `explorer` |
| `sparkle` | Source Control, the commit message box: the built-in Copilot's Generate Commit Message button, present while signed out. Also the code-action menu, which gives every AI action the ✧ group icon (`ai-actions`) | `.part.sidebar`, `.action-widget` | `scm`, `ai-actions` |
| `discard`, `go-to-file` | Source Control row and group actions of the git extension (`git.clean` `$(discard)`, `git.openFile2` `$(go-to-file)`), shown on every row with `scm.alwaysShowActions` (a scene setting) | `.part.sidebar` | `scm` |
| `pinned` | A pinned (sticky) tab: its Unpin button | `.tab.sticky:not(.dirty) > .tab-actions .codicon-pinned` | `tabs` |
| `pinned-dirty` | A pinned tab with unsaved changes. There is no `codicon-pinned-dirty` element: 1.141's CSS gives the same `codicon-pinned` button `content: var(--vscode-icon-pinned-dirty-content)` on a `.tab.sticky.dirty` | `.tab.sticky.dirty > .tab-actions .codicon-pinned` | `tabs` |
| `split-horizontal`, `split-vertical` | Editor title, Split Editor. Its icon follows `workbench.editor.openSideBySideDirection` (context key `splitEditorsVertically`): `split-horizontal` by default, `split-vertical` with `"down"` (a scene setting); each is the other's Alt alternative | `.part.editor .tabs-and-actions-container .editor-actions` | `tabs`, `split-down` |
| `case-sensitive`, `whole-word`, `regex`, `preserve-case`, `find-replace`, `find-replace-all` | Editor find widget with the replace row open (Replace, `editor.action.startFindReplaceAction`) | `.part.editor .find-widget.visible` | `find-replace` |
| `search-replace-all` (and the find toggles again, `preserve-case`) | Search view with replace open (`workbench.action.replaceInFiles`), a search term and a replacement | `.part.sidebar` | `search-replace` |
| `list-tree` | Problems title, View as Tree, which shows while the view is a table (the scene switches to the table and back) | `.part.panel > .title` | `problems-table` |
| `configure-layout-icon`, `panel-left`, `panel-layout-icon-off`, `auxiliarybar-right-layout-icon` | Title bar layout controls (`workbench.layoutControl.type` is `both` by default): Customize Layout, then one toggle each for the primary side bar, the panel and the secondary side bar, drawn on (filled pane) or off | `.part.titlebar .titlebar-right .action-toolbar-container`, topmost at the icon's centre | `layout-on` (side bar and secondary side bar shown, panel closed) |
| `panel-left-off`, `panel-layout-icon`, `auxiliarybar-right-off-layout-icon` | The same controls in the other states | same | `layout-off` |
| `panel-right`, `auxiliarybar-left-off-layout-icon` | With `workbench.sideBar.location: "right"` (a scene setting) the toggles take their mirrored IDs | same | `layout-right` |
| `panel-right-off`, `auxiliarybar-left-layout-icon` | The mirrored toggles in the other states | same | `layout-right-swap` |
| `panel-bottom` | Only the Customize Layout picker (`workbench.action.customizeLayout`), as the Panel row's icon | `.quick-input-widget .monaco-list` | `layout-customize` |
| `gutter-lightbulb-sparkle-filled` (G11) | The gutter light bulb on a line whose only code actions are AI ones. Line 4 of `hexes.ts` has a type error no TypeScript quick fix repairs, so its only actions are the built-in Copilot's Fix and Explain (`isAI`, offered while signed out because `inlineChat.affordance` is `off` by default). 1.141 puts the bulb in the gutter only for an unindented line whose neighbours are neither blank nor indented (`LightBulbWidget.update`); otherwise it draws the inline `sparkle-filled` codicon, which is not this ID | `.part.editor .monaco-editor`, the `.margin` element | `ai-lightbulb` |
| `symbol-class`, `-method`, `-function`, `-field`, `-property`, `-variable` | Go to Symbol in Editor (`workbench.action.gotoSymbol`) in `symbols.grimoire`, whose symbols come from the review helper (one per `<kind> <name>` line) | `.quick-input-widget .monaco-list` | `symbols` |
| `symbol-constant`, `-interface`, `-enum`, `-module`, `-namespace`, `-string` | The same in `charms.grimoire` | same | `symbols-2` |
| `symbol-keyword`, `symbol-text`, `symbol-snippet`, `symbol-file`, `symbol-folder` | The suggest list on the last line of `symbols.grimoire`, from the helper's completion provider. 1.141 draws `symbol-file` and `symbol-folder` in the suggest list only when the file icon theme has no file or folder icons; with WitchyNibbles Icons it shows the file icons, so the scene sets `workbench.iconTheme: null` | `.part.editor .suggest-widget` | `suggest` |
| `debug-breakpoint-log-unverified` (G20) | A logpoint on line 3 of `unbrewed.js`, which the program never loads, so it stays unverified during the session; shown in the gutter | `.part.editor .monaco-editor`, the `.margin` element | `debug-disconnect` |
| `debug-disconnect` (G23) | The floating debug toolbar, as the Alt alternative of Stop (see the first finding below); the scene holds Alt | `.debug-toolbar` | `debug-disconnect` |

Findings that shaped the scenes and the harness:

- **The capture left Alt held, and gate 3's toolbar evidence came from that.** `capture.mjs` pressed a chord as a key down and a key up with the modifiers set, and never released the modifiers. VS Code takes its modifier state from the last key event it sees (`ModifierKeyEmitter`), so after every `ctrl+alt+shift` chord it kept Alt held and drew Alt alternatives. In probe run 2026-10-10T20-28-26 the editor title showed Split Editor Down (`split-vertical`) in a scene whose setting asked for Split Editor Right, and the reverse in the scene set to `"down"`. The floating debug toolbar is affected the same way. For a Node.js launch, 1.141's `focusedSessionIsAttach` is false (js-debug's child session has a launch parent, and the key requires an attach session all the way up), so the toolbar shows **Stop**, with **Disconnect** as its Alt alternative. Probe run 2026-10-10T20-35-08, with the modifiers released, showed Stop at 100% and 200%. So gate 3's sheets showed Disconnect only because Alt was held, and the gate-3 README's reason for G23 ("js-debug focuses a child session") is wrong. Since G23 put Disconnect on the Stop square, the toolbar looks the same either way. `press` now releases the modifiers. A new `hold` step keeps Alt down until the next press, and the `debug-disconnect` scene uses it before it waits for Disconnect. A probe that kept updating an overlay with the toolbar's classes showed `codicon-debug-disconnect` at the moment of every capture, in all four themes (run 2026-10-10T20-50-52).
- **One Stop left the launch session running.** In run 2026-10-10T20-50-52 the floating toolbar was still there in the next scene: Stop on the focused child session left its launch parent alive. The teardown presses Stop twice and waits until the toolbar is gone.
- **G11 is reachable while signed out.** The built-in Copilot extension is active in the review profile. Its code-action provider offers Fix and Explain (both `isAI`) for any warning or error while `inlineChat.affordance` is `off` (the default). On `hexes.ts:4` TypeScript offers no fix, so `allAIFixes` is true. In probe run 2026-10-10T20-35-08 the margin carried `codicon-gutter-lightbulb-sparkle-filled` at 100%, and the dry runs show it at 100% and 200%. Opening the code-action menu turns the bulb into `gutter-lightbulb-sparkle` (the menu also lists TypeScript's refactors, which are not AI actions). So the bulb and the menu are two scenes.
- **The light bulb's place decides its ID.** 1.141 draws the inline widget, not the gutter decoration, for an indented line or one whose neighbour is blank, and the inline widget uses the stock `sparkle-filled` codicon. A line with only AI fixes inline therefore shows a stock icon whatever this theme maps (README decision).
- **`symbol-file` and `symbol-folder` only show without a file-icon theme.** The suggest renderer uses file and folder icons for File and Folder completions when the file icon theme has them (WitchyNibbles Icons does). The suggest scene clears `workbench.iconTheme` for its own captures only. `symbol-file` is also the group icon of Source Action menu entries (`editor.action.sourceAction`); that surface was not needed.
- **Symbol lists at 200%.** In probe run 2026-10-10T20-35-08 Go to Symbol showed 9 rows at 200% (list 189 CSS px) and the Outline view below the Explorer's Folders view showed 6. The Folders view cannot be hidden in 1.141 (`canToggleVisibility: false`), so the twelve SymbolKinds are split over two fixture files of six, one quick-pick scene each.
- **No built-in language gives every symbol kind.** TypeScript's outline has no Field, Constant or Namespace (its `memberVariable` is a Property and its `const` a Variable), no built-in language reports Namespace, and keyword, text and snippet exist only as completion kinds. The review helper therefore reads the `*.grimoire` fixtures: each `<kind> <name>` line becomes a `DocumentSymbol` of that `SymbolKind`, and its completion provider offers one Keyword, Text, Snippet, File and Folder item.
- **The Customize Layout picker covered the title-bar controls at 200%.** In dry run 2026-10-10T20-52-35 the picker (600 CSS px wide in a 960 px window) lay over the layout controls, and the old `layout-customize` scene's wait still passed. The picker now has its own scene; the four title-bar scenes wait until each icon is the topmost element at its centre (`document.elementFromPoint`), and they crop the layout controls only.
- **A quick-open chord can be lost at startup.** In the first probe the chat input still had the focus when the first scene pressed its quick-open chord, and nothing opened. Every gate-4 quick open now waits for the quick input before it presses Enter, and the first scene focuses the editor group first.
- **The icon sheet's third page.** Parts B1, B2 and C bring the map to 109 drawings (71 + 18 + 9 + 11), so the sheet has three pages of 51: 51, 51 and 7. The dry runs padded the helper's rows to 127 (the most the codepoint ranges allow) with a temporary, reverted change to `run-gate.mjs`; all three pages passed their checks at 100% and 200%.
- **Privacy.** The `debug-disconnect` scene opens the Debug Console, whose body prints the launch command with the Windows user directory, so that scene crops only the toolbar and the code. The Search scene lists match lines from the fixture only. All 22 sheets of dry run 2026-10-10T21-07-45 and its manifest pass the privacy scan.

### Task 13: Gate-4 scenes: every editor and symbols ID on screen, released modifiers, a held Alt for Disconnect, the third icon-sheet page

**Files:**
- Create: `review/jobs/gate-4.json`, `review/workspace/hexes.ts`, `review/workspace/symbols.grimoire`, `review/workspace/charms.grimoire`
- Modify: `scripts/review/capture.mjs` (modifier release, `hold` step), `review/helper-extension/{extension.js,package.json,README.md,breakpoints.json}` (symbol and completion providers, the `unbrewed.js` logpoint, version 0.0.5), `review/profile/keybindings.json` (17 chords), `test/review-harness.test.mjs`

**Interfaces:**
- Consumes:
  - Task 1: `applySettings` (six gate-4 scenes depend on a scene setting), the tooltip re-check, `filterJob`'s scene check.
  - Parts B1, B2 and C: the map (`icons/product-icon-map.json`, 109 drawings, so three icon-sheet pages) and the `editor` and `symbols` batches of `icons/product-icon-ids.json` (49 IDs once B1 pins G11). Every wait matches a codicon class, which stock icons carry too, so the scenes do not depend on the drawings themselves.
- Produces:
  - `review/jobs/gate-4.json`: 21 scenes in this order: explorer, scm, tabs, split-down, find-replace, search-replace, problems-table, layout-on, layout-off, layout-right, layout-right-swap, layout-customize, ai-lightbulb, ai-actions, symbols, symbols-2, suggest, debug-disconnect, icon-sheet, icon-sheet-2, icon-sheet-3. 22 `commitSheets`. A `variants` pass over tabs, find-replace, layout-on, layout-off, ai-lightbulb, symbols, symbols-2 and the three icon-sheet pages, which `run-gate.mjs` drops when `icons/product-src-variants/` is empty.
  - Job schema: the step `{ "hold": "alt" }` presses Alt and keeps it down until the next press. `press` now releases a chord's modifiers after the key.
  - Helper 0.0.5: a document-symbol provider and a completion provider for `**/*.grimoire`; `breakpoints.json` gains the `unbrewed.js` line-3 logpoint (`debug-breakpoint-log-unverified`).
  - Chords:

    | Chord | Action |
    | :- | :- |
    | `ctrl+alt+F1` / `F2` | pin / unpin the active editor |
    | `ctrl+alt+F3` | revert the active file |
    | `ctrl+alt+F4` | find with replace |
    | `ctrl+alt+F5` | replace in files (Search view) |
    | `ctrl+alt+F6` | next Search input box (the replace box) |
    | `ctrl+alt+F7` / `F8` | Problems as a table / as a tree |
    | `ctrl+alt+F9` | Customize Layout |
    | `ctrl+alt+F10` | quick open `hexes.ts:4` |
    | `ctrl+alt+F11` | Quick Fix (code-action menu) |
    | `ctrl+alt+F12` | Go to Symbol in Editor |
    | `alt+shift+F1` | quick open `symbols.grimoire:8` (its last, empty line) |
    | `alt+shift+F2` | trigger suggest |
    | `alt+shift+F3` | quick open `unbrewed.js:3` |
    | `alt+shift+F5` | close all editors |
    | `alt+shift+F6` | quick open `charms.grimoire` |

    Every `ctrl+alt+shift` letter, digit and F1-F11 is taken by gates 1-3, hence the new modifier sets. `alt+shift+F4` is left alone (Alt+F4 closes a window on Windows).

- [ ] **Step 1: Write the failing tests**

```bash
git apply <<'PATCH'
diff --git a/test/review-harness.test.mjs b/test/review-harness.test.mjs
index 2f0e49a..2a317eb 100644
--- a/test/review-harness.test.mjs
+++ b/test/review-harness.test.mjs
@@ -11,7 +11,7 @@ const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
 const json = (file) => JSON.parse(read(file));
 const exists = (file) => fs.existsSync(path.join(root, file));
 
-const GATES = ['review/jobs/gate-1.json', 'review/jobs/gate-2.json', 'review/jobs/gate-3.json'];
+const GATES = ['review/jobs/gate-1.json', 'review/jobs/gate-2.json', 'review/jobs/gate-3.json', 'review/jobs/gate-4.json'];
 const JOBS = [...GATES, 'review/jobs/smoke.json'];
 const PLAIN_KEYS = new Set(['Enter', 'Escape', 'Tab', 'Backspace']);
 
@@ -19,6 +19,7 @@ test('every file the harness needs exists', () => {
   for (const file of [
     'review/workspace/spells.ts', 'review/workspace/debug-target.js', 'review/workspace/notes.md', 'review/workspace/README.md',
     'review/workspace/unbrewed.js', 'review/workspace/brews.spec.js', 'review/helper-extension/breakpoints.json',
+    'review/workspace/hexes.ts', 'review/workspace/symbols.grimoire', 'review/workspace/charms.grimoire',
     'review/workspace/.vscode/launch.json', 'review/profile/settings.base.json', 'review/profile/keybindings.json',
     'review/helper-extension/package.json', 'review/helper-extension/extension.js', 'review/helper-extension/README.md',
     'review/helper-extension/media/sheet.svg', ...JOBS,
@@ -44,7 +45,8 @@ test('job files follow the schema and press only bound chords or plain keys', ()
     for (const scene of job.scenes) {
       assert.ok(scene.crops?.length, `${file} ${scene.name} has no crops`);
       for (const step of [...(scene.setup ?? []), ...(scene.teardown ?? [])]) {
-        assert.ok(step.press || step.insert || step.hover || step.waitFor || step.wait, `${file} ${scene.name}: empty step`);
+        assert.ok(step.press || step.insert || step.hover || step.hold || step.waitFor || step.wait, `${file} ${scene.name}: empty step`);
+        if (step.hold) assert.equal(step.hold, 'alt', `${file} ${scene.name}: only Alt can be held`);
         if (step.press) assert.ok(bound.has(step.press) || PLAIN_KEYS.has(step.press), `${file} ${scene.name}: ${step.press} is not bound`);
       }
     }
@@ -320,10 +322,11 @@ const NOT_IN_CONTEXT = {
   'debug-breakpoint-conditional-disabled': 'never drawn in 1.141: a disabled conditional breakpoint shows debug-breakpoint-disabled',
   'debug-breakpoint-conditional-unverified': 'never drawn in 1.141: an unverified conditional breakpoint shows debug-breakpoint-unverified',
 };
-// Pinned by the author at gate 3 (spec 11.3), after run 2026-10-10T15-54-10; the gate-4 job must wait for them.
-const PINNED_AFTER_GATE_3_RUN = {
-  'debug-disconnect': 'G23: the Node.js floating toolbar shows it in Stop\'s place (js-debug focuses a child session)',
-  'debug-breakpoint-log-unverified': 'G20: needs a logpoint in a file the debugger has not loaded (unbrewed.js)',
+// Pinned by the author at gate 3 (spec 11.3), after run 2026-10-10T15-54-10. The gate-4 job waits for them (debug-disconnect
+// test below).
+const WAITED_FOR_AT_GATE_4 = {
+  'debug-disconnect': 'G23: the Alt alternative of Stop on the Node.js floating toolbar; the debug-disconnect scene holds Alt',
+  'debug-breakpoint-log-unverified': 'G20: a logpoint in unbrewed.js, which the debugger never loads',
 };
 // The stackframe dot has no element of its own: CSS draws it (::after) on a glyph that is both a breakpoint and a frame.
 const OVERLAYS = {
@@ -337,7 +340,7 @@ test('gate 3 waits, without an optional step, for every panel and debug ID, or n
   const batchIds = Object.entries(ids).filter(([, entry]) => ['panel', 'debug'].includes(entry.batch)).map(([id]) => id);
   assert.equal(batchIds.length, 34);
   for (const id of batchIds) {
-    if (id in NOT_IN_CONTEXT || id in PINNED_AFTER_GATE_3_RUN) continue;
+    if (id in NOT_IN_CONTEXT || id in WAITED_FOR_AT_GATE_4) continue;
     for (const selector of OVERLAYS[id] ?? [`codicon-${id}`]) {
       assert.match(waits, new RegExp(`${selector.replace(/\./g, '\\.')}(?![\\w-])`), `${id}: ${selector}`);
     }
@@ -359,7 +362,7 @@ test('every ID the gate-3 coverage test excuses or reaches through an overlay is
   // Gate-3 review: a key in these lists that is not a batch ID (a typo, or an ID that moved batches) excuses nothing and
   // goes unnoticed.
   const { ids } = json('icons/product-icon-ids.json');
-  for (const id of [...Object.keys(NOT_IN_CONTEXT), ...Object.keys(PINNED_AFTER_GATE_3_RUN), ...Object.keys(OVERLAYS)]) {
+  for (const id of [...Object.keys(NOT_IN_CONTEXT), ...Object.keys(WAITED_FOR_AT_GATE_4), ...Object.keys(OVERLAYS)]) {
     assert.ok(['panel', 'debug'].includes(ids[id]?.batch), id);
   }
 });
@@ -412,11 +415,11 @@ test('gate 3 reaches debug-hint by moving the pointer onto the glyph margin', ()
   assert.match(read('scripts/review/capture.mjs'), /Input\.dispatchMouseEvent', \{ type: 'mouseMoved'/);
 });
 
-test('the gate 3 breakpoint plan sets each breakpoint kind 1.141 draws once, on code, and stops where the stackframe overlays need it', () => {
+test('the breakpoint plan sets each breakpoint kind 1.141 draws once, on code, and stops where the stackframe overlays need it', () => {
   const plan = json('review/helper-extension/breakpoints.json').breakpoints;
   const kinds = plan.map((breakpoint) => breakpoint.icon);
   assert.deepEqual([...kinds].sort(), ['debug-breakpoint', 'debug-breakpoint-conditional', 'debug-breakpoint-disabled',
-    'debug-breakpoint-log', 'debug-breakpoint-log-disabled', 'debug-breakpoint-unverified']);
+    'debug-breakpoint-log', 'debug-breakpoint-log-disabled', 'debug-breakpoint-log-unverified', 'debug-breakpoint-unverified']);
   for (const { file, line, icon, enabled = true, condition, logMessage } of plan) {
     const source = read(`review/workspace/${file}`).split('\n');
     assert.ok(source[line - 1]?.trim() && !source[line - 1].trim().startsWith('//'), `${icon}: line ${line} of ${file} is code`);
@@ -443,27 +446,30 @@ test('the gate 3 breakpoint plan sets each breakpoint kind 1.141 draws once, on
   assert.match(helper, /removeBreakpoints\(vscode\.debug\.breakpoints\)/, 'the command replaces earlier breakpoints');
 });
 
-test('gate 3 captures one icon-sheet scene per page, each checking on screen that every row is visible', () => {
+test('gates 3 and 4 capture one icon-sheet scene per page, each checking on screen that every row is visible', () => {
   // The helper pages the sheet (51 drawings a page at 200%); each scene waits for its page and until no view scrolls and
-  // every row icon lies inside the panel. Both side bars are closed first, so the panel has its full width.
+  // every row icon lies inside the panel. Both side bars are closed first, so the panel has its full width. Gate 3 had
+  // two pages (71 drawings); gate 4 has three.
   const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
-  const scenes = json('review/jobs/gate-3.json').scenes.filter((scene) => scene.name.startsWith('icon-sheet'));
-  assert.deepEqual(scenes.map((scene) => scene.name), ['icon-sheet', 'icon-sheet-2']);
-  const presses = scenes[0].setup.map((step) => step.press);
-  const maximize = keyOf('workbench.action.toggleMaximizedPanel');
-  for (const command of ['workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar']) {
-    assert.ok(presses.indexOf(keyOf(command)) >= 0 && presses.indexOf(keyOf(command)) < presses.indexOf(maximize), `runs ${command} before maximizing`);
+  for (const [file, pages] of [['review/jobs/gate-3.json', 2], ['review/jobs/gate-4.json', 3]]) {
+    const scenes = json(file).scenes.filter((scene) => scene.name.startsWith('icon-sheet'));
+    assert.deepEqual(scenes.map((scene) => scene.name), ['icon-sheet', 'icon-sheet-2', 'icon-sheet-3'].slice(0, pages));
+    const presses = scenes[0].setup.map((step) => step.press);
+    const maximize = keyOf('workbench.action.toggleMaximizedPanel');
+    for (const command of ['workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar']) {
+      assert.ok(presses.indexOf(keyOf(command)) >= 0 && presses.indexOf(keyOf(command)) < presses.indexOf(maximize), `runs ${command} before maximizing`);
+    }
+    for (const scene of scenes.slice(1)) assert.equal(scene.setup[0].press, keyOf('spellboundReview.iconSheetPage'), `${scene.name} turns the page`);
+    scenes.forEach((scene, index) => {
+      const waits = scene.setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''));
+      assert.ok(waits.some((wait) => wait.includes(`'page ${index + 1} of ${pages}'`)), `${file} ${scene.name} waits for page ${index + 1}`);
+      const check = waits.find((wait) => wait.includes('.monaco-list-rows'));
+      assert.ok(check, `${scene.name} waits, not optionally, until every row is visible`);
+      assert.match(check, /lists\.length === 3/);
+      assert.match(check, /rows\.offsetHeight <= list\.clientHeight/, 'no view scrolls');
+      assert.match(check, /r\.right <= box\.right/, 'every row icon is inside the panel');
+    });
   }
-  assert.equal(scenes[1].setup[0].press, keyOf('spellboundReview.iconSheetPage'), 'the second scene turns the page');
-  scenes.forEach((scene, index) => {
-    const waits = scene.setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''));
-    assert.ok(waits.some((wait) => wait.includes(`'page ${index + 1} of 2'`)), `${scene.name} waits for page ${index + 1}`);
-    const check = waits.find((wait) => wait.includes('.monaco-list-rows'));
-    assert.ok(check, `${scene.name} waits, not optionally, until every row is visible`);
-    assert.match(check, /lists\.length === 3/);
-    assert.match(check, /rows\.offsetHeight <= list\.clientHeight/, 'no view scrolls');
-    assert.match(check, /r\.right <= box\.right/, 'every row icon is inside the panel');
-  });
 });
 
 test('every scene that moves the pointer parks it on the status bar and waits for tooltips to close before the next scene', () => {
@@ -507,3 +513,162 @@ test('the Breakpoints view is on screen where gate 3 claims it: other Run views
   }
   function keyOfDebugView() { return bindings.find((binding) => binding.command === 'workbench.view.debug').key; }
 });
+
+// ---- Gate 4: editor and symbols batches ----
+// pinned-dirty has no class of its own: 1.141's CSS swaps the content of a dirty pinned tab's codicon-pinned button to
+// var(--vscode-icon-pinned-dirty-content), so the gate waits for that button on a tab that is both sticky and dirty.
+const DRAWN_THROUGH = {
+  'pinned-dirty': ['.tab.sticky.dirty > .tab-actions .codicon-pinned'],
+};
+const gate4 = () => json('review/jobs/gate-4.json');
+const gate4Waits = () => gate4().scenes.flatMap((scene) => (scene.setup ?? []).filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''))).join(' ');
+
+test('gate 4 waits, without an optional step, for every editor and symbols ID on screen', () => {
+  // Checked in VS Code 1.141 while writing the plan: every one of the 49 IDs is drawn somewhere the review profile
+  // reaches, so no ID is excused. Each wait checks that the icon lies inside its container's box, not just in the DOM.
+  const waits = gate4Waits();
+  const { ids } = json('icons/product-icon-ids.json');
+  const batchIds = Object.entries(ids).filter(([, entry]) => ['editor', 'symbols'].includes(entry.batch)).map(([id]) => id);
+  assert.equal(batchIds.length, 49, '34 editor IDs (with G11 gutter-lightbulb-sparkle-filled) and 15 symbols');
+  for (const id of Object.keys(DRAWN_THROUGH)) assert.ok(batchIds.includes(id), id);
+  for (const id of batchIds) {
+    for (const selector of DRAWN_THROUGH[id] ?? [`codicon-${id}`]) {
+      assert.match(waits, new RegExp(`${selector.replace(/[.()]/g, '\\$&')}(?![\\w-])`), `${id}: ${selector}`);
+    }
+  }
+  for (const scene of gate4().scenes.filter((candidate) => !candidate.name.startsWith('icon-sheet'))) {
+    const checks = scene.setup.filter((step) => /'[^']*\.codicon-[^']*'/.test(String(step.waitFor ?? '')));
+    assert.ok(checks.length, `${scene.name} waits for an icon`);
+    for (const step of checks) {
+      assert.match(step.waitFor, /r\.left >= box\.left && r\.right <= box\.right && r\.top >= box\.top && r\.bottom <= box\.bottom/, `${scene.name}: on screen`);
+    }
+  }
+});
+
+test('gate 4 waits for the two debug IDs pinned after the gate-3 run', () => {
+  // G23 and G20 (spec 11.3). For a Node.js launch, 1.141 shows Stop on the floating toolbar and Disconnect as its Alt
+  // alternative (focusedSessionIsAttach is false, because js-debug's child session has a launch parent), so the scene
+  // holds Alt before it waits for Disconnect. Gate 3's toolbar sheets showed Disconnect only because capture.mjs left
+  // Alt held after every chord (probe 2026-10-10T20-28-26 against 2026-10-10T20-35-08).
+  const scene = gate4().scenes.find((candidate) => candidate.name === 'debug-disconnect');
+  const hold = scene.setup.findIndex((step) => step.hold === 'alt');
+  const disconnect = scene.setup.findIndex((step) => !step.optional && String(step.waitFor).includes("'.codicon-debug-disconnect'"));
+  assert.ok(hold >= 0 && disconnect === hold + 1, 'holds Alt, then waits for Disconnect on the toolbar');
+  assert.match(scene.setup[disconnect].waitFor, /document\.querySelector\('\.debug-toolbar'\)/);
+  const unverified = scene.setup.findIndex((step) => !step.optional && String(step.waitFor).includes("'.margin .codicon-debug-breakpoint-log-unverified'"));
+  assert.ok(unverified >= 0 && unverified < hold, 'the unbrewed.js logpoint is waited for in the gutter before Alt is held');
+  for (const id of Object.keys(WAITED_FOR_AT_GATE_4)) assert.match(gate4Waits(), new RegExp(`codicon-${id}(?![\\w-])`), id);
+  const plan = json('review/helper-extension/breakpoints.json').breakpoints;
+  assert.deepEqual(plan.find((breakpoint) => breakpoint.icon === 'debug-breakpoint-log-unverified'),
+    { file: 'unbrewed.js', line: 3, logMessage: 'unbrewed {unbrewed}', icon: 'debug-breakpoint-log-unverified' });
+  // The session ends before the icon sheets: two Stops (the child session, then the launch session) and a wait until the
+  // toolbar is gone (dry run 2026-10-10T20-50-52: one Stop left the launch session running).
+  const stop = json('review/profile/keybindings.json').find((binding) => binding.command === 'workbench.action.debug.stop').key;
+  const [first, second, gone] = scene.teardown;
+  assert.equal(first.press, stop);
+  assert.equal(second.press, stop);
+  assert.match(String(gone.waitFor), /document\.querySelector\('\.debug-toolbar'\)/);
+});
+
+test('capture.mjs releases the modifiers of every chord, and holds Alt only where a step asks', () => {
+  const capture = read('scripts/review/capture.mjs');
+  const press = capture.slice(capture.indexOf('async press(chord)'), capture.indexOf('holdAlt()'));
+  assert.match(press, /for \(const \[bit, name, vk\] of \[\[8, 'Shift', 16\], \[2, 'Control', 17\], \[1, 'Alt', 18\], \[4, 'Meta', 91\]\]\)/);
+  assert.match(press, /type: 'keyUp', modifiers: held, key: name/);
+  assert.match(capture, /holdAlt\(\) \{ return this\.send\('Input\.dispatchKeyEvent', \{ type: 'rawKeyDown', modifiers: 1, key: 'Alt'/);
+  assert.match(capture, /if \(step\.hold === 'alt'\) await cdp\.holdAlt\(\);/);
+  const holds = GATES.flatMap((file) => json(file).scenes.flatMap((scene) => [...(scene.setup ?? []), ...(scene.teardown ?? [])]
+    .filter((step) => step.hold).map(() => `${file} ${scene.name}`)));
+  assert.deepEqual(holds, ['review/jobs/gate-4.json debug-disconnect']);
+});
+
+test('gate 4 reaches each layout toggle state in the title bar and checks nothing covers it', () => {
+  // The layout controls draw panel-left or panel-right (primary side bar), panel-layout-icon (panel) and an
+  // auxiliarybar-*-layout-icon (secondary side bar), each with an -off form when that part is hidden; the side bar's
+  // location decides left or right. At 200% the Customize Layout picker covered the controls (dry run
+  // 2026-10-10T20-52-35), so these waits also check that the icon is the topmost element at its centre.
+  const scenes = Object.fromEntries(gate4().scenes.map((scene) => [scene.name, scene]));
+  for (const [name, location, ids] of [
+    ['layout-on', undefined, ['configure-layout-icon', 'panel-left', 'panel-layout-icon-off', 'auxiliarybar-right-layout-icon']],
+    ['layout-off', undefined, ['panel-left-off', 'panel-layout-icon', 'auxiliarybar-right-off-layout-icon']],
+    ['layout-right', 'right', ['panel-right', 'auxiliarybar-left-off-layout-icon']],
+    ['layout-right-swap', 'right', ['panel-right-off', 'auxiliarybar-left-layout-icon']],
+  ]) {
+    assert.equal(scenes[name].settings?.['workbench.sideBar.location'], location, name);
+    const wait = scenes[name].setup.find((step) => String(step.waitFor).includes('.part.titlebar .titlebar-right .action-toolbar-container')).waitFor;
+    for (const id of ids) assert.ok(wait.includes(`'.codicon-${id}'`), `${name}: ${id}`);
+    assert.match(wait, /el\.contains\(document\.elementFromPoint\(/, `${name}: not covered`);
+  }
+  // panel-bottom is the Panel row of the Customize Layout picker; 1.141 draws it nowhere else.
+  assert.ok(scenes['layout-customize'].setup.some((step) => String(step.waitFor).includes('.quick-input-widget .monaco-list') && String(step.waitFor).includes("'.codicon-panel-bottom'")));
+});
+
+test('gate 4 scene settings: header and row actions always shown, the split direction, no file icon theme for the suggest list', () => {
+  const scenes = Object.fromEntries(gate4().scenes.map((scene) => [scene.name, scene]));
+  // Explorer title actions (new-file, new-folder, refresh, collapse-all) and SCM row actions (discard, go-to-file) show
+  // only under the pointer unless these are set.
+  assert.deepEqual(scenes.explorer.settings, { 'workbench.view.alwaysShowHeaderActions': true });
+  assert.deepEqual(scenes.scm.settings, { 'scm.alwaysShowActions': true });
+  // Split Editor's icon follows the side-by-side direction: split-horizontal by default, split-vertical when "down".
+  assert.equal(scenes.tabs.settings, undefined);
+  assert.deepEqual(scenes['split-down'].settings, { 'workbench.editor.openSideBySideDirection': 'down' });
+  // 1.141 draws symbol-file and symbol-folder in the suggest list only when the file icon theme has no file or folder
+  // icons (the suggest widget's renderer); with WitchyNibbles Icons it shows the file icons instead.
+  assert.deepEqual(scenes.suggest.settings, { 'workbench.iconTheme': null, 'editor.wordBasedSuggestions': 'off' });
+});
+
+test('each gate 4 scene sets up the state it captures and puts the editors back, so it also runs alone', () => {
+  // Gate-4 review: layout-right relied on layout-off to close the secondary side bar, and only split-down's teardown put
+  // back the editors that tabs pinned and changed, so a cut-down run (--scenes) timed out, or met a dirty file.
+  const scenes = Object.fromEntries(gate4().scenes.map((scene) => [scene.name, scene]));
+  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
+  const primary = [keyOf('workbench.view.explorer'), keyOf('workbench.action.closeSidebar')];
+  const secondary = [keyOf('workbench.action.chat.open'), keyOf('workbench.action.closeAuxiliaryBar')];
+  for (const name of ['layout-on', 'layout-off', 'layout-right', 'layout-right-swap']) {
+    const presses = scenes[name].setup.map((step) => step.press);
+    assert.ok(presses.some((press) => primary.includes(press)), `${name} shows or hides the primary side bar itself`);
+    assert.ok(presses.some((press) => secondary.includes(press)), `${name} shows or hides the secondary side bar itself`);
+  }
+  const [pin, unpin, revert, closeAll] = ['workbench.action.pinEditor', 'workbench.action.unpinEditor', 'workbench.action.files.revert',
+    'workbench.action.closeAllEditors'].map(keyOf);
+  for (const name of ['tabs', 'split-down']) {
+    const setup = scenes[name].setup;
+    const teardown = scenes[name].teardown.map((step) => step.press);
+    assert.equal(setup.filter((step) => step.press === pin).length, 2, `${name} pins its two editors`);
+    assert.ok(setup.some((step) => step.insert), `${name} makes one of them dirty`);
+    assert.deepEqual([teardown.includes(revert), teardown.filter((press) => press === unpin).length, teardown.at(-1)], [true, 2, closeAll], `${name} puts the editors back`);
+  }
+});
+
+test('the gate 4 fixtures give one symbol of each kind and a gutter line whose only code actions are AI ones', () => {
+  // Go to Symbol lists 9 rows at 200% (dry run 2026-10-10T20-35-08), so the twelve symbol kinds are split over two files.
+  const kinds = ['symbols.grimoire', 'charms.grimoire'].map((file) => read(`review/workspace/${file}`).split('\n')
+    .map((line) => /^(\w+) (\w+)$/.exec(line)?.[1]).filter(Boolean));
+  assert.deepEqual(kinds.map((list) => list.length), [6, 6]);
+  assert.deepEqual(kinds.flat().sort(), ['class', 'constant', 'enum', 'field', 'function', 'interface', 'method', 'module', 'namespace', 'property', 'string', 'variable']);
+  const helper = read('review/helper-extension/extension.js');
+  assert.match(helper, /registerDocumentSymbolProvider\(\{ pattern: '\*\*\/\*\.grimoire' \}/);
+  assert.match(helper, /registerCompletionItemProvider\(\{ pattern: '\*\*\/\*\.grimoire' \}/);
+  for (const kind of ['Keyword', 'Text', 'Snippet', 'File', 'Folder']) assert.match(helper, new RegExp(`'${kind}'\\]`), kind);
+  // 1.141 puts the light bulb in the gutter only for an unindented line between two non-blank, unindented lines
+  // (LightBulbWidget.update); otherwise it draws the inline sparkle-filled codicon, which is not this ID.
+  const lines = read('review/workspace/hexes.ts').split('\n');
+  const keyOf = (command, args) => json('review/profile/keybindings.json').find((binding) => binding.command === command && binding.args === args)?.key;
+  assert.ok(keyOf('workbench.action.quickOpen', 'hexes.ts:4'));
+  assert.match(lines[3], /^export const crown: number = 'tall';$/, 'a type error no TypeScript quick fix repairs');
+  for (const neighbour of [lines[2], lines[4]]) assert.match(neighbour, /^\S.+/);
+});
+
+test('every gate 4 quick open waits for the quick input before it presses Enter', () => {
+  // The first gate-4 probe lost a quick-open chord at startup (the chat input still had the focus). Waiting for the
+  // widget turns that into a stop that names the scene.
+  const quickOpen = new Set(json('review/profile/keybindings.json').filter((binding) => binding.command === 'workbench.action.quickOpen').map((binding) => binding.key));
+  for (const scene of gate4().scenes) {
+    const steps = [...(scene.setup ?? []), ...(scene.teardown ?? [])];
+    steps.forEach((step, index) => {
+      if (!quickOpen.has(step.press)) return;
+      assert.match(String(steps[index + 1]?.waitFor), /\.quick-input-widget/, `${scene.name}: waits for the quick input`);
+      assert.equal(steps[index + 2]?.press, 'Enter', `${scene.name}: then presses Enter`);
+    });
+  }
+});
PATCH
```

What the patch does:
- adds gate 4 to `GATES`, so the schema, committed-sheet, icon-sheet, terminal-focus and pointer tests cover it, and lists the three new fixtures;
- lets a step be `{ "hold": "alt" }` (Alt only);
- the per-page icon-sheet test covers gate 3 (two pages) and gate 4 (three; the page count itself moved to three pages in Task 11, when the map passed 102 drawings);
- the breakpoint-plan test expects the `debug-breakpoint-log-unverified` logpoint;
- `PINNED_AFTER_GATE_3_RUN` becomes `WAITED_FOR_AT_GATE_4`, with the corrected reason for `debug-disconnect`; the gate-3 coverage test still excuses those two IDs, and a gate-4 test checks the gate-4 job waits for them;
- eight gate-4 tests:
  - every `editor` and `symbols` ID (49) is waited for without an optional step, `pinned-dirty` through `DRAWN_THROUGH` (the CSS-drawn button), and every icon wait checks the container's box;
  - the debug scene: the logpoint in the gutter, then Alt held, then Disconnect on the toolbar; two Stops and a wait for the toolbar to go;
  - `press` releases the modifiers, `holdAlt` exists, and only the gate-4 debug scene holds Alt;
  - the four title-bar layout scenes, their side-bar location, the IDs each waits for and the topmost check; `panel-bottom` in the picker;
  - the scene settings (header and row actions shown, the split direction, no file icon theme for the suggest list);
  - the fixtures: twelve symbol kinds in two files of six, the helper's providers, and a gutter-eligible `hexes.ts` line 4;
  - every quick open waits for the quick input before Enter;
  - every scene sets up the state it captures and puts the editors back, so it also runs alone in a cut-down run: each title-bar layout scene shows or hides both side bars itself (`layout-right` closes the secondary side bar, which the profile opens), and `tabs` and `split-down` each pin and change their two editors and revert, unpin and close them in their own teardown.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/review-harness.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected:

```
ℹ tests 40
ℹ pass 24
ℹ fail 16
```

The sixteen failures (`--test-reporter=tap … | grep '^not ok'`):
- `every file the harness needs exists`
- `job files follow the schema and press only bound chords or plain keys`
- `every committed sheet is one the gate job produces`
- `the icon sheet shows every drawing at 200%: pages of three views of 17 rows`
- `every PowerShell terminal scene focuses the editor group before opening the terminal`
- `the breakpoint plan sets each breakpoint kind 1.141 draws once, on code, and stops where the stackframe overlays need it`
- `gates 3 and 4 capture one icon-sheet scene per page, each checking on screen that every row is visible`
- `every scene that moves the pointer parks it on the status bar and waits for tooltips to close before the next scene`
- `gate 4 waits, without an optional step, for every editor and symbols ID on screen`
- `gate 4 waits for the two debug IDs pinned after the gate-3 run`
- `capture.mjs releases the modifiers of every chord, and holds Alt only where a step asks`
- `gate 4 reaches each layout toggle state in the title bar and checks nothing covers it`
- `gate 4 scene settings: header and row actions always shown, the split direction, no file icon theme for the suggest list`
- `each gate 4 scene sets up the state it captures and puts the editors back, so it also runs alone`
- `the gate 4 fixtures give one symbol of each kind and a gutter line whose only code actions are AI ones`
- `every gate 4 quick open waits for the quick input before it presses Enter`

TAP numbers `1`, `2`, `4`, `16`, `21`, `29`-`31` and `33`-`40`. The first eight fail because `review/jobs/gate-4.json` does not exist yet (or, for the breakpoint plan, the logpoint).

- [ ] **Step 3: Add the gate-4 job and the three fixtures**

Create `review/jobs/gate-4.json`:

```json
{
  "expectVersion": "1.141.0",
  "port": 9333,
  "mode": "device-scale",
  "helperVsix": "spellbound-review-helper.vsix",
  "passes": [
    { "name": "main", "vsix": ["spellbound-main.vsix"], "scales": [1, 1.25, 1.5, 2] },
    { "name": "variants", "vsix": ["spellbound-variants.vsix"], "scales": [1, 2], "scenes": ["tabs", "find-replace", "layout-on", "layout-off", "ai-lightbulb", "symbols", "symbols-2", "icon-sheet", "icon-sheet-2", "icon-sheet-3"] }
  ],
  "scenes": [
    {
      "name": "explorer",
      "settings": { "workbench.view.alwaysShowHeaderActions": true },
      "setup": [
        { "press": "ctrl+alt+shift+a", "wait": 1500 },
        { "press": "ctrl+alt+shift+4", "wait": 1200 },
        { "waitFor": "(() => { const c = document.querySelector('.part.sidebar'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-new-file', '.codicon-new-folder', '.codicon-refresh', '.codicon-collapse-all'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 160 }
      ]
    },
    {
      "name": "scm",
      "settings": { "scm.alwaysShowActions": true },
      "setup": [
        { "press": "ctrl+alt+shift+v", "wait": 2500 },
        { "waitFor": "(() => { const c = document.querySelector('.part.sidebar'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-sparkle', '.codicon-discard', '.codicon-go-to-file'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 20000 }
      ],
      "crops": [
        { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 260 }
      ]
    },
    {
      "name": "tabs",
      "setup": [
        { "press": "ctrl+alt+shift+a", "wait": 500 },
        { "press": "ctrl+alt+shift+y", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "press": "ctrl+alt+F1", "wait": 800 },
        { "press": "ctrl+alt+shift+1", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "press": "ctrl+alt+F1", "wait": 800 },
        { "insert": "✦ ", "wait": 800 },
        { "waitFor": "(() => { const c = document.querySelector('.part.editor .tabs-and-actions-container'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.tab.sticky:not(.dirty) > .tab-actions .codicon-pinned', '.tab.sticky.dirty > .tab-actions .codicon-pinned', '.editor-actions .codicon-split-horizontal'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "tabs", "selector": ".part.editor .tabs-and-actions-container" }
      ],
      "teardown": [
        { "press": "ctrl+alt+F3", "wait": 800 },
        { "press": "ctrl+alt+F2", "wait": 500 },
        { "press": "ctrl+alt+shift+y", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "press": "ctrl+alt+F2", "wait": 500 },
        { "press": "alt+shift+F5", "wait": 1000 }
      ]
    },
    {
      "name": "split-down",
      "settings": { "workbench.editor.openSideBySideDirection": "down" },
      "setup": [
        { "press": "ctrl+alt+shift+a", "wait": 500 },
        { "press": "ctrl+alt+shift+y", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "press": "ctrl+alt+F1", "wait": 800 },
        { "press": "ctrl+alt+shift+1", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "press": "ctrl+alt+F1", "wait": 800 },
        { "insert": "✦ ", "wait": 800 },
        { "waitFor": "(() => { const c = document.querySelector('.part.editor .tabs-and-actions-container'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.tab.sticky:not(.dirty) > .tab-actions .codicon-pinned', '.tab.sticky.dirty > .tab-actions .codicon-pinned', '.editor-actions .codicon-split-vertical'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "tabs", "selector": ".part.editor .tabs-and-actions-container" }
      ],
      "teardown": [
        { "press": "ctrl+alt+F3", "wait": 800 },
        { "press": "ctrl+alt+F2", "wait": 500 },
        { "press": "ctrl+alt+shift+y", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "press": "ctrl+alt+F2", "wait": 500 },
        { "press": "alt+shift+F5", "wait": 1000 }
      ]
    },
    {
      "name": "find-replace",
      "setup": [
        { "press": "ctrl+alt+shift+1", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "press": "ctrl+alt+F4", "wait": 800 },
        { "insert": "potion", "wait": 800 },
        { "waitFor": "(() => { const c = document.querySelector('.part.editor .find-widget.visible'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-case-sensitive', '.codicon-whole-word', '.codicon-regex', '.codicon-preserve-case', '.codicon-find-replace', '.codicon-find-replace-all'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "widget", "selector": ".part.editor .find-widget.visible" }
      ],
      "teardown": [
        { "press": "Escape", "wait": 500 },
        { "press": "alt+shift+F5", "wait": 800 }
      ]
    },
    {
      "name": "search-replace",
      "setup": [
        { "press": "ctrl+alt+F5", "wait": 1500 },
        { "insert": "moonwater", "wait": 1500 },
        { "press": "ctrl+alt+F6", "wait": 500 },
        { "insert": "starwater", "wait": 1500 },
        { "waitFor": "(() => { const c = document.querySelector('.part.sidebar'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-search-replace-all', '.codicon-preserve-case'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 260 }
      ]
    },
    {
      "name": "problems-table",
      "setup": [
        { "press": "ctrl+alt+shift+o", "wait": 1500 },
        { "press": "ctrl+alt+F7", "wait": 1500 },
        { "waitFor": "(() => { const c = document.querySelector('.part.panel > .title'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-list-tree'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "title", "selector": ".part.panel > .title" }
      ],
      "teardown": [
        { "press": "ctrl+alt+F8", "wait": 800 },
        { "press": "ctrl+alt+shift+e", "wait": 800 }
      ]
    },
    {
      "name": "layout-on",
      "setup": [
        { "press": "ctrl+alt+shift+4", "wait": 800 },
        { "press": "ctrl+alt+shift+w", "wait": 1500 },
        { "press": "ctrl+alt+shift+e", "wait": 800 },
        { "waitFor": "(() => { const c = document.querySelector('.part.titlebar .titlebar-right .action-toolbar-container'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-configure-layout-icon', '.codicon-panel-left', '.codicon-panel-layout-icon-off', '.codicon-auxiliarybar-right-layout-icon'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom && el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "controls", "selector": ".part.titlebar .titlebar-right .action-toolbar-container" }
      ]
    },
    {
      "name": "layout-off",
      "setup": [
        { "press": "ctrl+alt+shift+F8", "wait": 800 },
        { "press": "ctrl+alt+shift+F9", "wait": 800 },
        { "press": "ctrl+alt+shift+o", "wait": 1500 },
        { "waitFor": "(() => { const c = document.querySelector('.part.titlebar .titlebar-right .action-toolbar-container'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-panel-left-off', '.codicon-panel-layout-icon', '.codicon-auxiliarybar-right-off-layout-icon'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom && el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "controls", "selector": ".part.titlebar .titlebar-right .action-toolbar-container" }
      ],
      "teardown": [
        { "press": "ctrl+alt+shift+e", "wait": 800 }
      ]
    },
    {
      "name": "layout-right",
      "settings": { "workbench.sideBar.location": "right" },
      "setup": [
        { "press": "ctrl+alt+shift+4", "wait": 1500 },
        { "press": "ctrl+alt+shift+F9", "wait": 800 },
        { "waitFor": "(() => { const c = document.querySelector('.part.titlebar .titlebar-right .action-toolbar-container'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-panel-right', '.codicon-auxiliarybar-left-off-layout-icon'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom && el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "controls", "selector": ".part.titlebar .titlebar-right .action-toolbar-container" }
      ]
    },
    {
      "name": "layout-right-swap",
      "settings": { "workbench.sideBar.location": "right" },
      "setup": [
        { "press": "ctrl+alt+shift+F8", "wait": 800 },
        { "press": "ctrl+alt+shift+w", "wait": 1500 },
        { "waitFor": "(() => { const c = document.querySelector('.part.titlebar .titlebar-right .action-toolbar-container'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-panel-right-off', '.codicon-auxiliarybar-left-layout-icon'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom && el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "controls", "selector": ".part.titlebar .titlebar-right .action-toolbar-container" }
      ],
      "teardown": [
        { "press": "ctrl+alt+shift+4", "wait": 800 }
      ]
    },
    {
      "name": "layout-customize",
      "setup": [
        { "press": "ctrl+alt+shift+a", "wait": 500 },
        { "press": "ctrl+alt+F9", "wait": 1500 },
        { "waitFor": "(() => { const c = document.querySelector('.quick-input-widget .monaco-list'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-panel-bottom'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "widget", "selector": ".quick-input-widget", "maxHeight": 220 }
      ],
      "teardown": [
        { "press": "Escape", "wait": 500 }
      ]
    },
    {
      "name": "ai-lightbulb",
      "setup": [
        { "press": "ctrl+alt+shift+a", "wait": 500 },
        { "press": "ctrl+alt+F10", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "waitFor": "(() => { const c = document.querySelector('.part.editor .monaco-editor'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.margin .codicon-gutter-lightbulb-sparkle-filled'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 30000 }
      ],
      "crops": [
        { "name": "code", "selector": ".part.editor .monaco-editor", "maxHeight": 140 }
      ]
    },
    {
      "name": "ai-actions",
      "setup": [
        { "press": "ctrl+alt+F11", "wait": 2500 },
        { "waitFor": "(() => { const c = document.querySelector('.action-widget'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-sparkle'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 15000 }
      ],
      "crops": [
        { "name": "widget", "selector": ".action-widget" }
      ],
      "teardown": [
        { "press": "Escape", "wait": 500 },
        { "press": "alt+shift+F5", "wait": 800 }
      ]
    },
    {
      "name": "symbols",
      "setup": [
        { "press": "alt+shift+F1", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "press": "ctrl+alt+F12", "wait": 1500 },
        { "waitFor": "(() => { const c = document.querySelector('.quick-input-widget .monaco-list'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-symbol-class', '.codicon-symbol-method', '.codicon-symbol-function', '.codicon-symbol-field', '.codicon-symbol-property', '.codicon-symbol-variable'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 15000 }
      ],
      "crops": [
        { "name": "widget", "selector": ".quick-input-widget" }
      ],
      "teardown": [
        { "press": "Escape", "wait": 500 }
      ]
    },
    {
      "name": "symbols-2",
      "setup": [
        { "press": "alt+shift+F6", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "press": "ctrl+alt+F12", "wait": 1500 },
        { "waitFor": "(() => { const c = document.querySelector('.quick-input-widget .monaco-list'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-symbol-constant', '.codicon-symbol-interface', '.codicon-symbol-enum', '.codicon-symbol-module', '.codicon-symbol-namespace', '.codicon-symbol-string'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 15000 }
      ],
      "crops": [
        { "name": "widget", "selector": ".quick-input-widget" }
      ],
      "teardown": [
        { "press": "Escape", "wait": 500 }
      ]
    },
    {
      "name": "suggest",
      "settings": { "workbench.iconTheme": null, "editor.wordBasedSuggestions": "off" },
      "setup": [
        { "press": "alt+shift+F1", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "press": "alt+shift+F2", "wait": 2000 },
        { "waitFor": "(() => { const c = document.querySelector('.part.editor .suggest-widget'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-symbol-keyword', '.codicon-symbol-text', '.codicon-symbol-snippet', '.codicon-symbol-file', '.codicon-symbol-folder'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 15000 }
      ],
      "crops": [
        { "name": "widget", "selector": ".part.editor .suggest-widget" }
      ],
      "teardown": [
        { "press": "Escape", "wait": 500 },
        { "press": "alt+shift+F5", "wait": 800 }
      ]
    },
    {
      "name": "debug-disconnect",
      "setup": [
        { "press": "ctrl+alt+shift+5", "wait": 800 },
        { "press": "ctrl+alt+shift+i", "wait": 1000 },
        { "press": "ctrl+alt+shift+3", "wait": 2000 },
        { "waitFor": "(() => { const c = document.querySelector('.part.editor .monaco-editor'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.margin .codicon-debug-breakpoint.codicon-debug-stackframe'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 40000 },
        { "press": "alt+shift+F3", "wait": 800 },
        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
        { "press": "Enter", "wait": 2000 },
        { "waitFor": "(() => { const c = document.querySelector('.part.editor .monaco-editor'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.margin .codicon-debug-breakpoint-unverified', '.margin .codicon-debug-breakpoint-log-unverified'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 20000 },
        { "hold": "alt", "wait": 1000 },
        { "waitFor": "(() => { const c = document.querySelector('.debug-toolbar'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-debug-disconnect'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "toolbar", "selector": ".debug-toolbar" },
        { "name": "code", "selector": ".part.editor .monaco-editor", "maxHeight": 100 }
      ],
      "teardown": [
        { "press": "ctrl+alt+shift+t", "wait": 1500 },
        { "press": "ctrl+alt+shift+t", "wait": 1500 },
        { "waitFor": "(() => { const bar = document.querySelector('.debug-toolbar'); return !bar || !bar.getBoundingClientRect().width; })()", "timeout": 15000 },
        { "press": "ctrl+alt+shift+e", "wait": 500 },
        { "press": "alt+shift+F5", "wait": 800 }
      ]
    },
    {
      "name": "icon-sheet",
      "setup": [
        { "press": "ctrl+alt+shift+F8", "wait": 500 },
        { "press": "ctrl+alt+shift+F9", "wait": 500 },
        { "press": "ctrl+alt+shift+7", "wait": 1500 },
        { "press": "ctrl+alt+shift+m", "wait": 1500 },
        { "waitFor": "[...document.querySelectorAll('.part.panel .pane-header .description')].some((el) => el.textContent.trim() === 'page 1 of 3')", "timeout": 10000 },
        { "waitFor": "(() => { const panel = document.querySelector('.part.panel'); if (!panel) return false; const box = panel.getBoundingClientRect(); const lists = [...panel.querySelectorAll('.pane-body .monaco-list')]; const icons = [...panel.querySelectorAll('.pane-body .monaco-list-row .codicon')]; return lists.length === 3 && icons.length > 0 && lists.every((list) => { const rows = list.querySelector('.monaco-list-rows'); return !!rows && rows.offsetHeight <= list.clientHeight; }) && icons.every((icon) => { const r = icon.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; }); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "panel", "selector": ".part.panel" }
      ]
    },
    {
      "name": "icon-sheet-2",
      "setup": [
        { "press": "ctrl+alt+shift+F4", "wait": 1500 },
        { "waitFor": "[...document.querySelectorAll('.part.panel .pane-header .description')].some((el) => el.textContent.trim() === 'page 2 of 3')", "timeout": 10000 },
        { "waitFor": "(() => { const panel = document.querySelector('.part.panel'); if (!panel) return false; const box = panel.getBoundingClientRect(); const lists = [...panel.querySelectorAll('.pane-body .monaco-list')]; const icons = [...panel.querySelectorAll('.pane-body .monaco-list-row .codicon')]; return lists.length === 3 && icons.length > 0 && lists.every((list) => { const rows = list.querySelector('.monaco-list-rows'); return !!rows && rows.offsetHeight <= list.clientHeight; }) && icons.every((icon) => { const r = icon.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; }); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "panel", "selector": ".part.panel" }
      ]
    },
    {
      "name": "icon-sheet-3",
      "setup": [
        { "press": "ctrl+alt+shift+F4", "wait": 1500 },
        { "waitFor": "[...document.querySelectorAll('.part.panel .pane-header .description')].some((el) => el.textContent.trim() === 'page 3 of 3')", "timeout": 10000 },
        { "waitFor": "(() => { const panel = document.querySelector('.part.panel'); if (!panel) return false; const box = panel.getBoundingClientRect(); const lists = [...panel.querySelectorAll('.pane-body .monaco-list')]; const icons = [...panel.querySelectorAll('.pane-body .monaco-list-row .codicon')]; return lists.length === 3 && icons.length > 0 && lists.every((list) => { const rows = list.querySelector('.monaco-list-rows'); return !!rows && rows.offsetHeight <= list.clientHeight; }) && icons.every((icon) => { const r = icon.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; }); })()", "timeout": 10000 }
      ],
      "crops": [
        { "name": "panel", "selector": ".part.panel" }
      ],
      "teardown": [
        { "press": "ctrl+alt+shift+F4", "wait": 500 },
        { "press": "ctrl+alt+shift+m", "wait": 800 },
        { "press": "ctrl+alt+shift+e" }
      ]
    }
  ],
  "commitSheets": [
    "main-explorer-sidebar",
    "main-scm-sidebar",
    "main-tabs-tabs",
    "main-split-down-tabs",
    "main-find-replace-widget",
    "main-search-replace-sidebar",
    "main-problems-table-title",
    "main-layout-on-controls",
    "main-layout-off-controls",
    "main-layout-right-controls",
    "main-layout-right-swap-controls",
    "main-layout-customize-widget",
    "main-ai-lightbulb-code",
    "main-ai-actions-widget",
    "main-symbols-widget",
    "main-symbols-2-widget",
    "main-suggest-widget",
    "main-debug-disconnect-toolbar",
    "main-debug-disconnect-code",
    "main-icon-sheet-panel",
    "main-icon-sheet-2-panel",
    "main-icon-sheet-3-panel"
  ]
}
```

The long expressions are one pattern, repeated because the job format has no reuse:
- **On screen:** `(() => { const c = document.querySelector('<container>'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['<selector>', …].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && <r inside box> ; })); })()`. The four title-bar waits add `&& el.contains(document.elementFromPoint(<centre of r>))`.
- **Quick input shown:** the widget exists, is not `display: none` and has a height; every quick-open chord is followed by it, then Enter.
- **Icon-sheet page:** `page N of 3` in a view header, then gate 3's check that no view scrolls and every row icon lies inside the panel.

Create `review/workspace/hexes.ts`:

```ts
// Review fixture (gate 4): no TypeScript quick fix repairs line 4, so its only code actions are the AI ones (Fix, Explain),
// and its neighbours are plain code, so VS Code draws its light bulb in the gutter: gutter-lightbulb-sparkle-filled.
export const brim = 'wide';
export const crown: number = 'tall';
export const veil = 'mist';
```

Create `review/workspace/symbols.grimoire`:

```text
# Review fixture (gate 4): the review helper reads each "<kind> <name>" line as one symbol, and suggests on the last line.
class Cauldron
method stir
function brew
field ladle
property colour
variable dose
```

Create `review/workspace/charms.grimoire`:

```text
# Review fixture (gate 4): the review helper reads each "<kind> <name>" line as one symbol.
constant moons
interface Potion
enum Phase
module Coven
namespace Herbs
string incantation
```

`symbols.grimoire` ends with a newline, so its line 8 is empty: the suggest scene opens the list there.

- [ ] **Step 4: Apply the capture, helper and chord changes**

```bash
git apply <<'PATCH'
diff --git a/review/helper-extension/README.md b/review/helper-extension/README.md
index 4e4d606..cc3986c 100644
--- a/review/helper-extension/README.md
+++ b/review/helper-extension/README.md
@@ -1,3 +1,3 @@
 # Spellbound review helper
 
-A throwaway extension installed only into the isolated review VS Code that `npm run review:gate` launches. It lists every mapped product-icon drawing at 16px in three side-by-side panel trees, 51 per page (a command turns the page), registers a fake test controller so the Testing view shows pass and fail icons (two of its tests point at brews.spec.js, so the editor gutter shows their run and passed icons), sets one breakpoint of each kind from `breakpoints.json`, puts one error, one warning and one info problem on notes.md, raises notifications (one long warning; and, while toggled on, one info, one warning and one error, raised again on every theme change so they outlast VS Code's toast timeout through the theme loop), shows a multi-step quick pick with a Back button, toggles status bar entries for the four Copilot states and the two spinners (states a signed-out review profile cannot reach), and puts the fixture repository into the staged or conflicted state through the built-in git extension's API. It is never published, never referenced from the root `package.json`, and excluded from the Spellbound VSIX by `.vscodeignore`.
+A throwaway extension installed only into the isolated review VS Code that `npm run review:gate` launches. It lists every mapped product-icon drawing at 16px in three side-by-side panel trees, 51 per page (a command turns the page), registers a fake test controller so the Testing view shows pass and fail icons (two of its tests point at brews.spec.js, so the editor gutter shows their run and passed icons), sets one breakpoint of each kind from `breakpoints.json`, reads each line of the `*.grimoire` fixtures as one symbol of the kind it names (Go to Symbol shows every symbol icon) and offers a keyword, a text, a snippet, a file and a folder completion in them, puts one error, one warning and one info problem on notes.md, raises notifications (one long warning; and, while toggled on, one info, one warning and one error, raised again on every theme change so they outlast VS Code's toast timeout through the theme loop), shows a multi-step quick pick with a Back button, toggles status bar entries for the four Copilot states and the two spinners (states a signed-out review profile cannot reach), and puts the fixture repository into the staged or conflicted state through the built-in git extension's API. It is never published, never referenced from the root `package.json`, and excluded from the Spellbound VSIX by `.vscodeignore`.
diff --git a/review/helper-extension/breakpoints.json b/review/helper-extension/breakpoints.json
index 9db2640..56c6575 100644
--- a/review/helper-extension/breakpoints.json
+++ b/review/helper-extension/breakpoints.json
@@ -1,11 +1,12 @@
 {
-  "$comment": "Breakpoints spellboundReview.breakpoints sets for gate 3 (lines are 1-based; icon = the class VS Code 1.141 draws for it). Execution stops on the plain breakpoint in stir (line 9: debug-stackframe with the dot overlay); Call Stack Down then focuses the caller on line 11, whose conditional breakpoint never fires (debug-stackframe-focused with the dot overlay). unbrewed.js is never loaded, so its breakpoint shows as unverified during the session. 1.141 never draws debug-breakpoint-conditional-disabled or -conditional-unverified: a disabled or unverified conditional breakpoint gets the plain disabled or unverified icon (L6 in workbench.desktop.main.js), so the plan has no such breakpoint.",
+  "$comment": "Breakpoints spellboundReview.breakpoints sets for gates 3 and 4 (lines are 1-based; icon = the class VS Code 1.141 draws for it). Execution stops on the plain breakpoint in stir (line 9: debug-stackframe with the dot overlay); Call Stack Down then focuses the caller on line 11, whose conditional breakpoint never fires (debug-stackframe-focused with the dot overlay). unbrewed.js is never loaded, so its breakpoint and its logpoint (gate 4: debug-breakpoint-log-unverified) show as unverified during the session. 1.141 never draws debug-breakpoint-conditional-disabled or -conditional-unverified: a disabled or unverified conditional breakpoint gets the plain disabled or unverified icon (L6 in workbench.desktop.main.js), so the plan has no such breakpoint.",
   "breakpoints": [
     {"file": "debug-target.js", "line": 2, "enabled": false, "icon": "debug-breakpoint-disabled"},
     {"file": "debug-target.js", "line": 4, "enabled": false, "logMessage": "brewed {brewed}", "icon": "debug-breakpoint-log-disabled"},
     {"file": "debug-target.js", "line": 6, "logMessage": "brewed {brewed}", "icon": "debug-breakpoint-log"},
     {"file": "debug-target.js", "line": 9, "icon": "debug-breakpoint"},
     {"file": "debug-target.js", "line": 11, "condition": "brewed < 0", "icon": "debug-breakpoint-conditional"},
-    {"file": "unbrewed.js", "line": 2, "icon": "debug-breakpoint-unverified"}
+    {"file": "unbrewed.js", "line": 2, "icon": "debug-breakpoint-unverified"},
+    {"file": "unbrewed.js", "line": 3, "logMessage": "unbrewed {unbrewed}", "icon": "debug-breakpoint-log-unverified"}
   ]
 }
diff --git a/review/helper-extension/extension.js b/review/helper-extension/extension.js
index 831cb9d..1ff0ea3 100644
--- a/review/helper-extension/extension.js
+++ b/review/helper-extension/extension.js
@@ -1,7 +1,8 @@
 // Review helper: shows every mapped drawing at 16px in side-by-side trees, creates a Testing provider so the Testing
 // container, the gutter run icons and pass/fail icons appear, raises notifications, sets one breakpoint of each kind,
-// and puts the review fixture into the states that the status-batch glyphs need (Problems severities, staged and
-// conflicted git branch, Copilot states, spinners, quick input).
+// puts the review fixture into the states that the status-batch glyphs need (Problems severities, staged and
+// conflicted git branch, Copilot states, spinners, quick input), and gives the *.grimoire fixtures one symbol of each
+// kind and a suggest list (gate 4).
 const path = require('path');
 const vscode = require('vscode');
 const rows = require('./ids.json'); // written by run-gate.mjs: [{ id, label, description }]
@@ -139,6 +140,27 @@ function activate(context) {
       describePage();
       pageChanged.fire();
     }),
+    // Gate 4: every symbol kind of the symbols batch, from the *.grimoire fixtures. Each "<kind> <name>" line is one symbol,
+    // so Go to Symbol in Editor draws the twelve symbol-* icons a SymbolKind can carry (six per file: twelve rows do not
+    // fit the quick pick at 200%). Keyword, text and snippet exist only as completion kinds, and file and folder are the
+    // editor batch's symbol-file and symbol-folder, so the suggest list carries those five.
+    vscode.languages.registerDocumentSymbolProvider({ pattern: '**/*.grimoire' }, {
+      provideDocumentSymbols: (document) => {
+        const symbols = [];
+        for (let line = 0; line < document.lineCount; line += 1) {
+          const match = /^(\w+) (\w+)$/.exec(document.lineAt(line).text);
+          const kind = match && Object.keys(vscode.SymbolKind).find((name) => name.toLowerCase() === match[1]);
+          if (!kind) continue;
+          const range = document.lineAt(line).range;
+          symbols.push(new vscode.DocumentSymbol(match[2], match[1], vscode.SymbolKind[kind], range, range));
+        }
+        return symbols;
+      },
+    }),
+    vscode.languages.registerCompletionItemProvider({ pattern: '**/*.grimoire' }, {
+      provideCompletionItems: () => [['brew', 'Keyword'], ['moonlight', 'Text'], ['circle', 'Snippet'], ['moon.png', 'File'], ['herbs', 'Folder']]
+        .map(([label, kind], index) => Object.assign(new vscode.CompletionItem(label, vscode.CompletionItemKind[kind]), { sortText: String(index), detail: kind.toLowerCase() })),
+    }),
     // Gate 3: one breakpoint of each kind (breakpoints.json), replacing whatever the previous scene left.
     vscode.commands.registerCommand('spellboundReview.breakpoints', () => {
       if (!folder) return;
diff --git a/review/helper-extension/package.json b/review/helper-extension/package.json
index b12e40f..6e43165 100644
--- a/review/helper-extension/package.json
+++ b/review/helper-extension/package.json
@@ -2,7 +2,7 @@
   "name": "spellbound-review-helper",
   "displayName": "Spellbound review helper",
   "description": "Review-only helper for the Spellbound gate screenshots. Not part of the published extension.",
-  "version": "0.0.4",
+  "version": "0.0.5",
   "publisher": "witchynibbles-review",
   "engines": { "vscode": "^1.100.0" },
   "main": "./extension.js",
diff --git a/review/profile/keybindings.json b/review/profile/keybindings.json
index 691d6b1..269f17d 100644
--- a/review/profile/keybindings.json
+++ b/review/profile/keybindings.json
@@ -45,5 +45,22 @@
   { "key": "ctrl+alt+shift+F8", "command": "workbench.action.closeSidebar" },
   { "key": "ctrl+alt+shift+F9", "command": "workbench.action.closeAuxiliaryBar" },
   { "key": "ctrl+alt+shift+F10", "command": "workbench.action.quickOpen", "args": "term " },
-  { "key": "ctrl+alt+shift+F11", "command": "runCommands", "args": { "commands": ["workbench.debug.variablesView.toggleVisibility", "workbench.debug.watchExpressionsView.toggleVisibility"] } }
+  { "key": "ctrl+alt+shift+F11", "command": "runCommands", "args": { "commands": ["workbench.debug.variablesView.toggleVisibility", "workbench.debug.watchExpressionsView.toggleVisibility"] } },
+  { "key": "ctrl+alt+F1", "command": "workbench.action.pinEditor" },
+  { "key": "ctrl+alt+F2", "command": "workbench.action.unpinEditor" },
+  { "key": "ctrl+alt+F3", "command": "workbench.action.files.revert" },
+  { "key": "ctrl+alt+F4", "command": "editor.action.startFindReplaceAction" },
+  { "key": "ctrl+alt+F5", "command": "workbench.action.replaceInFiles" },
+  { "key": "ctrl+alt+F6", "command": "search.focus.nextInputBox" },
+  { "key": "ctrl+alt+F7", "command": "workbench.actions.table.workbench.panel.markers.view.viewAsTable" },
+  { "key": "ctrl+alt+F8", "command": "workbench.actions.table.workbench.panel.markers.view.viewAsTree" },
+  { "key": "ctrl+alt+F9", "command": "workbench.action.customizeLayout" },
+  { "key": "ctrl+alt+F10", "command": "workbench.action.quickOpen", "args": "hexes.ts:4" },
+  { "key": "ctrl+alt+F11", "command": "editor.action.quickFix" },
+  { "key": "alt+shift+F1", "command": "workbench.action.quickOpen", "args": "symbols.grimoire:8" },
+  { "key": "alt+shift+F2", "command": "editor.action.triggerSuggest" },
+  { "key": "alt+shift+F3", "command": "workbench.action.quickOpen", "args": "unbrewed.js:3" },
+  { "key": "alt+shift+F5", "command": "workbench.action.closeAllEditors" },
+  { "key": "alt+shift+F6", "command": "workbench.action.quickOpen", "args": "charms.grimoire" },
+  { "key": "ctrl+alt+F12", "command": "workbench.action.gotoSymbol" }
 ]
diff --git a/scripts/review/capture.mjs b/scripts/review/capture.mjs
index 4d255b1..675e0e3 100644
--- a/scripts/review/capture.mjs
+++ b/scripts/review/capture.mjs
@@ -83,8 +83,21 @@ class Cdp {
     for (const type of ['rawKeyDown', 'keyUp']) {
       await this.send('Input.dispatchKeyEvent', { type, modifiers, key: key.key, code: key.code, windowsVirtualKeyCode: key.vk, nativeVirtualKeyCode: key.vk });
     }
+    // Then release the modifiers. VS Code takes the modifier state from the last key event it saw, so without these keyUps
+    // it kept Alt held after every ctrl+alt+shift chord and drew Alt alternatives in later captures: Split Editor Down
+    // for Split Editor Right, and Disconnect for Stop on the Node.js debug toolbar (gate-4 probe 2026-10-10T20-28-26).
+    let held = modifiers;
+    for (const [bit, name, vk] of [[8, 'Shift', 16], [2, 'Control', 17], [1, 'Alt', 18], [4, 'Meta', 91]]) {
+      if (!(held & bit)) continue;
+      held &= ~bit;
+      await this.send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: held, key: name, code: `${name}Left`, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
+    }
   }
 
+  // Holds Alt down until the next press, so VS Code shows a menu item's Alt alternative (gate 4: Disconnect, the Alt
+  // alternative of Stop on the Node.js debug toolbar). A lone Alt keydown never reaches the menu bar: that needs a release.
+  holdAlt() { return this.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', modifiers: 1, key: 'Alt', code: 'AltLeft', windowsVirtualKeyCode: 18, nativeVirtualKeyCode: 18 }); }
+
   insert(text) { return this.send('Input.insertText', { text }); }
 
   async screenshot(file, clip) {
@@ -145,6 +158,7 @@ async function runStep(cdp, step, where) {
   try {
     if (step.press) await cdp.press(step.press);
     if (step.insert) await cdp.insert(step.insert);
+    if (step.hold === 'alt') await cdp.holdAlt();
     // hover: an expression that returns the { x, y } (CSS px) to move the mouse to, for states only a pointer reaches
     // (the debug-hint breakpoint helper in the glyph margin, the Call Stack row actions). The pointer stays there until
     // a later hover step moves it (scenes that hover park it on the status bar in their teardown). CDP takes the point in
PATCH
```

What the patch does:
- `capture.mjs`: `press` releases Shift, Control, Alt and Meta (those the chord used) after the key, so VS Code no longer keeps Alt held; `holdAlt()` and the `{ "hold": "alt" }` step.
- Helper (version 0.0.5): for `**/*.grimoire`, a document-symbol provider (each `<kind> <name>` line is one symbol of the `SymbolKind` it names; other lines, such as the `#` comment, are skipped) and a completion provider (`brew` keyword, `moonlight` text, `circle` snippet, `moon.png` file, `herbs` folder, in that order); `breakpoints.json` gains the `unbrewed.js` line-3 logpoint; README and header comments.
- `keybindings.json`: the 17 chords listed under Interfaces, appended.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test test/review-harness.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 40`, `ℹ pass 40`, `ℹ fail 0`.

Then: `npm test 2>&1 | grep -E '^ℹ (tests|pass|fail)' && npm run validate 2>&1 | tail -1`
Expected:
- `ℹ tests 405` (397 after Task 12, plus 8), `ℹ pass 405`, `ℹ fail 0`.
- `✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug, product-batch:editor, product-batch:symbols)`; only `release` and `file-icons` stay pending.

The `capture.mjs` source still holds no literal zero-width character: `grep -cP '\x{200B}' scripts/review/capture.mjs` prints `0`.

- [ ] **Step 6: Dry-run the gate-4 scenes in VS Code 1.141 (100% and 200%)**

```bash
export AGENT_BROWSER_SESSION=spellbound-gate4
node scripts/review/run-gate.mjs --job review/jobs/gate-4.json --scales=1,2 --skip-variants
node scripts/review/privacy-scan.mjs review-out/<run>/sheets/*.png review-out/<run>/captures/manifest.json
```

This run is not optional: it is the first at 200% with the house drawings (the 100% run below is the only one measured with them while writing). Expected, after about 12 minutes: `Gate run complete: …/review-out/<run> (344 captures, 0 warnings)` (use that `<run>` id). That is 21 scenes giving 43 captures per theme (`full` plus each crop), times four themes and two scales: 172 per scale, measured at 100% with the house drawings (run 2026-10-10T22-33-06), and 344 for both scales computed from it (the drafter's 344-capture run used stock stand-ins). Then one `✓` per sheet (22) and for the manifest, and exit 0.

If a non-optional wait times out, the run stops and names the selector. Cut the run down with `--scenes=<that scene and the scenes before it that set its state>` while fixing it. Scenes that need an earlier scene's state:

| Scene | Needs |
| :- | :- |
| `ai-actions` | `ai-lightbulb` (`hexes.ts` open on line 4) |
| `icon-sheet-2` | `icon-sheet` |
| `icon-sheet-3` | `icon-sheet-2` |

Every other scene sets its own state: each layout scene shows or hides the side bars it captures, and `tabs` and `split-down` each pin and change their editors and put them back in their own teardown (checked alone at 100%: runs 2026-10-10T22-31-14 `layout-right`, 2026-10-10T22-31-43 `tabs` and 2026-10-10T22-32-24 `split-down`, 8 captures and 0 warnings each). A `✗` from the scan means a crop shows machine text: narrow that crop rather than blurring the sheet.

Then open every sheet under `review-out/<run>/sheets/` with the Read tool and check that each glyph the scene waited for is visible, not just present:
- `layout-*-controls`: four controls each, in the states the table above lists; nothing over them at 200%.
- `layout-customize-widget`: the Visibility rows down to the Panel row and the Primary Side Bar Position rows.
- `tabs-tabs`: `notes.md` with the pin, `spells.ts` with the pin-and-dot, Split Editor Right at the right; `split-down-tabs`: the same tabs with Split Editor Down.
- `scm-sidebar`: the ✧ in the commit box; Discard and Open File on both rows and on the Changes header.
- `ai-lightbulb-code`: the bulb in the gutter on line 4 of `hexes.ts`.
- `ai-actions-widget`: Fix and Explain with ✧, the refactor with the wrench.
- `symbols-widget`, `symbols-2-widget`: six rows each, every icon whole; `suggest-widget`: five rows.
- `debug-disconnect-toolbar`: continue, steps, restart and Disconnect (with the house drawings, Disconnect is the Stop square); `debug-disconnect-code`: the dashed rings on lines 2 and 3 of `unbrewed.js`.
- The icon sheet: page 1 shows 51 drawings, page 2 51 and page 3 the other 7 (`cube` to `cards`; `braces` moved to page 2 when Task 10 re-claimed it), no view cut off, no row highlighted, no tooltip.

How the scenes were checked while drafting this part, before Parts B and C existed, with stand-ins:
- Stock Codicons stood in for the editor, layout and symbols drawings. Every wait matches a codicon class, which stock icons carry.
- A temporary, reverted change to `run-gate.mjs` padded the icon sheet's `ids.json` to 127 rows by repeating the 71 drawings (127 is the most the B1, B2 and C codepoint ranges allow).

With the final job and the files of this task:
- End-to-end run of this plan, with the real editor, layout and symbols drawings, at 100% (`AGENT_BROWSER_SESSION=spellbound-gate4 npm run review:gate -- --job review/jobs/gate-4.json --skip-variants --scales=1`): run 2026-10-10T22-33-06, `172 captures, 0 warnings`, about 5 minutes of capture (after the review fixes; the run before them, 2026-10-10T21-44-09, gave the same count). All 22 sheets and the manifest pass the privacy scan. Every row of the list above holds; every glyph the scenes wait for is the house drawing on its sheet (the ✧ cluster in the gutter of line 4 and in the code-action menu, both hatpins, both splits, all eight toggle states, `panel-bottom` in the picker, the twelve Go to Symbol kinds and the five suggest kinds, Disconnect as the Stop square, the two dashed rings).
- While drafting, with stock stand-ins on top of Task 1: the whole job at 100% and 200%, run 2026-10-10T21-07-45, `344 captures, 0 warnings`, 9.7 minutes of capture; all 22 sheets and the manifest passed the privacy scan. The 200% run has not been repeated with the house drawings: Task 14's full run is the first.
- Earlier, before the fixes listed under "Findings": 2026-10-10T20-45-07 (100%, 168 captures, 0 warnings) and 2026-10-10T20-52-35 (200%, 168 captures, 0 warnings, but the Customize Layout picker covered the title-bar controls; now a scene of its own with the topmost check).
- Probes, with throwaway jobs under `review-out/` that drew the DOM facts into an overlay and cropped it: 2026-10-10T20-28-26 (100%: every surface; Alt held), 2026-10-10T20-35-08 (100% and 200%: modifiers released; G11; symbol list heights; Stop on the toolbar), 2026-10-10T20-50-52 (Disconnect held through every capture; `window.title` reaches `document.title`; one Stop left the launch session).

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_13`
Expected: one 40-character tree id, also saved in `review-out/g4/TREE_13`.

### Task 14: Run gate 4 and hand it to the author

**Files:**
- Create: `docs/qa/2.0-gate-4/README.md`, `docs/qa/2.0-gate-4/manifest.json`, `docs/qa/2.0-gate-4/*.png` (the 22 `commitSheets` of `review/jobs/gate-4.json`, plus `variants-*` sheets if Parts B or C left gate variants)

**Interfaces:**
- Consumes: everything above. The README entries that Tasks 6, 9 and 12 record (decisions, choices, the colour observation) are written out in Step 5's template.
- Produces: the review-gate-4 package. This plan ends here; file icons and the release start only after the author approves.

- [ ] **Step 1: Verify the preconditions**

Run: `npm test 2>&1 | grep -E '^ℹ (tests|fail)' && npm run validate 2>&1 | grep -E '^…|^✓' && ls icons/product-src-variants 2>/dev/null; node -e "console.log(Object.keys(require('./icons/product-icon-map.json').drawings).length)"`
Expected: `ℹ tests 405`, `ℹ fail 0`; `… 21 pending problems in stages not yet enforced: release (2), file-icons (19) (use --verbose to list)` and the `✓` line with `product-batch:editor` and `product-batch:symbols` enforced and only `release` and `file-icons` pending; no `icons/product-src-variants/` folder (this plan draws no gate variant); `109` drawings (three icon-sheet pages, which `icon-sheet-3` waits for).

- [ ] **Step 2: Run the full gate**

Run: `AGENT_BROWSER_SESSION=spellbound-gate4 npm run review:gate -- --job review/jobs/gate-4.json`
Expected, after about 25 minutes: `Gate run complete: …/review-out/<run> (<n> captures, 0 warnings)`. Main pass: 4 scales × 172 = 688. Variants pass, only when `icons/product-src-variants/` holds a file: 2 scales × 4 themes × 10 scenes × 2 captures (`full` and one crop) = 160, for 848 in all. With no variant file, `run-gate.mjs` drops the variants pass (688 captures). Re-run if a non-optional step failed (the run stops and names it). Note the `<run>` id the last line prints: Step 4 copies that run, not the newest folder.

- [ ] **Step 3: Review the sheets yourself before the author does**

Open every sheet in the `commitSheets` list with the Read tool, and record in the README, per glyph and per sheet (the "Seen at this gate" lines under each decision, and the glyph notes under "Choices"):
- blur at 125% and 150% beyond what snapped strokes allow;
- each glyph's reading at 16px/100% in its own context: the find toggles `Aa`, `ab̲`, `.*`, `AB` against each other and against the stock toggles they sit beside (main-find-replace-widget, main-search-replace-sidebar); Replace and Replace All told apart (same sheets); the hatpin and the ✦-headed hatpin side by side on the tabs (main-tabs-tabs); new file and new folder, refresh and collapse-all in the Explorer title (main-explorer-sidebar); Discard and Open File on the Source Control rows (main-scm-sidebar);
- the ✧ cluster as `sparkle` in the commit box and the code-action menu (main-scm-sidebar, main-ai-actions-widget) and as `gutter-lightbulb-sparkle-filled` in the gutter beside the line numbers (main-ai-lightbulb-code): does it read as a light-bulb mark there, and does it collide with the line number at 100%;
- the layout toggles: on and off told apart at 100% (filled pane against outline pane) in all four title-bar sheets, and the mirrored right-hand forms matching the left-hand ones (main-layout-right-controls, main-layout-right-swap-controls); `panel-bottom` and the side-bar forms in the picker (main-layout-customize-widget); split-horizontal against split-vertical (main-tabs-tabs, main-split-down-tabs);
- the symbols: each of the fifteen told apart from its neighbours at 16px (main-symbols-widget, main-symbols-2-widget, main-suggest-widget), and the pairs that share a drawing (Part C's sharing) checked against their labels;
- the Disconnect button on the toolbar is the Stop square (main-debug-disconnect-toolbar) and the logpoint's unverified mark is the dashed ring like the plain unverified breakpoint beside it (main-debug-disconnect-code);
- look-alikes across surfaces: `equals-block` and `cards` against `collapse-stack` (the Outline view shows Collapse All in its title and the symbol kinds in its rows; compare main-explorer-sidebar with main-symbols-2-widget), and `keyword-lines` against `tree-node` (main-suggest-widget, main-problems-table-title);
- `collapse-all` against New File, New Folder and Refresh in the Explorer and Search titles: is the solid box too heavy (main-explorer-sidebar, main-search-replace-sidebar)?
- every stock Codicon still visible in a committed sheet, by ID if the DOM gives it (for "Known staging artifacts").

Do not redraw anything now.

- [ ] **Step 4: Copy the sheets and the manifest, then scan them**

```bash
RUN=review-out/<run> # the id Step 2 printed
node -e "process.exit(require('./$RUN/captures/manifest.json').dryRun ? 1 : 0)" || echo "STOP: $RUN is a dry run, not gate evidence"
mkdir -p docs/qa/2.0-gate-4
for name in $(node -e "console.log(require('./review/jobs/gate-4.json').commitSheets.join(' '))"); do
  if [ -f "$RUN/sheets/$name.png" ]; then cp "$RUN/sheets/$name.png" docs/qa/2.0-gate-4/; else echo "not produced: $name"; fi
done
for sheet in "$RUN"/sheets/variants-*.png; do [ -f "$sheet" ] && cp "$sheet" docs/qa/2.0-gate-4/; done
cp "$RUN/captures/manifest.json" docs/qa/2.0-gate-4/manifest.json
chmod 644 docs/qa/2.0-gate-4/*
ls docs/qa/2.0-gate-4 | wc -l
node scripts/review/privacy-scan.mjs docs/qa/2.0-gate-4/*.png docs/qa/2.0-gate-4/manifest.json
```

Expected: no `STOP` line and no `not produced` lines; `23` files (22 sheets and the manifest) plus any `variants-*` sheets; one `✓` per sheet and for the manifest, and exit 0 (exit 2 means the scan could not run: fix that, never skip it). Then open `main-scm-sidebar.png`, `main-search-replace-sidebar.png`, `main-debug-disconnect-code.png` and `main-layout-customize-widget.png` with the Read tool: the scan reads text, so also check by eye that no path, user or machine name shows.

- [ ] **Step 5: Write `docs/qa/2.0-gate-4/README.md`**

Fill the angle-bracket fields from the run and from Step 3 (each decision's "Seen at this gate" line, the glyph notes, the stock Codicons seen); every other line is final text. The decisions and choices of Parts B1 (Task 6 Step 5), B2 (Task 9 Step 6) and C (Task 12 Step 7) are already written in below.

````markdown
# Spellbound 2.0, review gate 4 (editor and symbols batches)

- Run: <run id> · VS Code <version> (<commit dir>) · mode <device-scale|zoom> · repo <commit> (dirty: gate-4 work is uncommitted, so `repoDirty` is true)
- Reproduce: `AGENT_BROWSER_SESSION=spellbound-gate4 npm run review:gate -- --job review/jobs/gate-4.json` (`--help` lists the dry-run options; harness in docs/superpowers/plans/2026-10-10-spellbound-2-phase-1.md, Part D, and the gate-3 plan, Tasks 3 and 10; gate-4 harness fixes and scenes in docs/superpowers/plans/2026-10-10-spellbound-2-gate-4.md, Tasks 1 and 13)
- Raw captures (not committed): review-out/<run>/captures. `manifest.json` here lists all <n> with their sha256: main pass 4 scales × 172<, variants pass 2 scales × 80>. <k> warnings<: list them>.
- Committed here: the 22 `commitSheets` from `review/jobs/gate-4.json`<, and the variants sheets>. Every sheet, this README and the manifest passed `node scripts/review/privacy-scan.mjs`, and every sheet was checked by eye. The raw `full.png` captures of the debug scene show the Debug Console, which prints the launch command with the Windows user directory; no committed crop includes it.

## Preconditions
- `npm test`: <n> of <n> pass. `npm run validate`: passes with every product batch enforced (`base`, `color-themes`, `product-pipeline`, `product-batch:1`, `product-batch:chrome`, `product-batch:status`, `product-batch:panel`, `product-batch:debug`, `product-batch:editor`, `product-batch:symbols`); `file-icons` and `release` are pending, as staged validation allows.
- Grid warnings: only `gear`, `sync-arrows` and `cat-slash`, accepted at gate 2 (G16). <The editor, layout and symbols drawings add none, or list them.>
- Pinned keys: 173 (132 core + 41 extras), with `gutter-lightbulb-sparkle-filled` (G11). The map holds 109 drawings and 173 IDs.

## What to judge
- The find widget with its replace row (main-find-replace-widget): `case-sensitive`, `whole-word`, `regex` in the find box, `preserve-case` in the replace box, Replace (`find-replace`) and Replace All (`find-replace-all`). The Search view (main-search-replace-sidebar): the same toggles and `search-replace-all` beside the replace box.
- Pinned tabs (main-tabs-tabs): `notes.md` pinned (`pinned`) and `spells.ts` pinned with unsaved changes (`pinned-dirty`, which 1.141 draws through CSS on the same button); Split Editor Right (`split-horizontal`) at the right of the title. The same title with editors splitting down shows Split Editor Down (`split-vertical`, main-split-down-tabs).
- The Explorer title (main-explorer-sidebar): New File, New Folder, Refresh, Collapse Folders. Source Control (main-scm-sidebar): the ✧ `sparkle` in the commit box (Generate Commit Message), Discard (`discard`) and Open File (`go-to-file`) on both changed files and Discard on the Changes header.
- Problems as a table (main-problems-table-title): View as Tree (`list-tree`).
- The title-bar layout controls, one sheet per state: side bar and secondary side bar shown, panel closed (main-layout-on-controls: `configure-layout-icon`, `panel-left`, `panel-layout-icon-off`, `auxiliarybar-right-layout-icon`); all three flipped (main-layout-off-controls: `panel-left-off`, `panel-layout-icon`, `auxiliarybar-right-off-layout-icon`); the side bar on the right (main-layout-right-controls: `panel-right`, `auxiliarybar-left-off-layout-icon`; main-layout-right-swap-controls: `panel-right-off`, `auxiliarybar-left-layout-icon`). The Customize Layout picker (main-layout-customize-widget): `panel-bottom` on the Panel row, with the side-bar forms on the rows around it.
- The ✧ cluster as the gutter light bulb of a line whose only fixes are AI ones (`gutter-lightbulb-sparkle-filled`, G11, main-ai-lightbulb-code, line 4 of hexes.ts), and as the AI rows of the code-action menu (`sparkle`, main-ai-actions-widget).
- The symbols, in Go to Symbol in Editor: class, method, function, field, property, variable (main-symbols-widget) and constant, interface, enum, module, namespace, string (main-symbols-2-widget); keyword, text, snippet, and the editor batch's `symbol-file` and `symbol-folder`, in the suggest list (main-suggest-widget, shown without a file icon theme; see Decisions).
- The two debug IDs pinned at gate 3: Disconnect on the floating toolbar, with Alt held (`debug-disconnect`, the Stop square, main-debug-disconnect-toolbar), and the unverified logpoint on line 3 of unbrewed.js (`debug-breakpoint-log-unverified`, the dashed ring, main-debug-disconnect-code, below the unverified breakpoint on line 2).
- Not judged here: the candle (the light bulb). The gate-3 README listed it as "an editor-batch glyph judged at gate 4"; that note was wrong. The candle is batch 1, approved at gate 1 (G5), and no gate-4 scene waits for it.
- Every drawing at 16px, in three pages: main-icon-sheet-panel (51 drawings), main-icon-sheet-2-panel (51) and main-icon-sheet-3-panel (the other 7).
- Each sheet: rows = theme · variant, columns = 100/125/150/200%.

## Decisions for the author at this gate
- **Decision: `refresh` against `restart`.**
  - Finding: `refresh` is the debug toolbar's `restart` mirrored about x = 8 (clockwise, open at the upper right, head pointing right), the same mirroring as the stock refresh and debug-restart pair. At 16px it reads lighter than the stock refresh, because it keeps restart's 1-unit band and smaller circle (r5 about (8,9)).
  - Options: keep the mirrored pair, or give refresh its own construction (a larger r5-6 circle about (8,8) with a smaller head).
  - Recommendation: keep. The two never share a toolbar, restart is green on the debug toolbar, and the direction is the distinction users already read in the stock icons.
  - Seen at this gate: <main-explorer-sidebar, main-search-replace-sidebar beside main-debug-disconnect-toolbar>.
- **Decision: hatpins against the stock pushpin (`pinned`, `pinned-dirty`).**
  - Finding: spec 5.2 asks for hatpins: a 45-degree needle with a round head (`pinned`) or a ✦ head (`pinned-dirty`), centred on close's tab-action box. At 16px the round-headed pin on a diagonal can read as a magnifier or a match (the house search glyph is a ring with the handle at the lower right, so the two differ by fill and orientation), and the ✦-headed pin as a magic wand, a "magic/AI" picture in a set whose ✧ and ✦ already mean AI.
  - Options: keep the hatpins, or return to a pushpin silhouette (both states).
  - Recommendation: decide from main-tabs-tabs; a pushpin silhouette is the fallback if either pin reads as a lens or a wand there.
  - Seen at this gate: <main-tabs-tabs, main-split-down-tabs>.
- **Decision (optional): the layout toggles look stock.**
  - Finding: the six frame toggles keep the stock layout-sidebar and layout-panel silhouettes (spec 5.1: universal actions keep familiar silhouettes), so they differ from the stock glyphs only in crisper, pixel-aligned walls and dividers.
  - Options: keep them stock-shaped, or give them a house touch (for example a ✦ on the filled pane).
  - Recommendation: keep. A 4-unit pane cannot hold a 5×5 ✦ with one unit of clearance.
  - Seen at this gate: <the four main-layout-*-controls sheets>.
- **Decision: pin the stock font's other symbol shares.**
  - Finding: the stock font shares more symbol glyphs than the pinned list covers: `symbol-constructor` is the method cube (EA8C), `symbol-key` the text `abc` (EA93), `symbol-object` and `symbol-package` the module braces (EA8B). They are extended tier, so they stay stock: a TypeScript class's `constructor` shows the stock outline cube beside the house methods, and a JSON outline's keys and objects show the stock `abc` and braces.
  - Options: pin the four on the house drawings (four extras, claims only, no new drawing; 173 keys become 177), or leave them stock.
  - Recommendation: pin them. They are claims on drawings that already exist, and they keep a symbol list from mixing house and stock glyphs for the same picture.
- **Decision: the solid `=` tile (`symbol-constant`).**
  - Finding: `equals-block` is a solid 10×10 tile with `=` cut out, the heaviest symbol (88 of 256 pixels at 16px, the cube 83); the stock constant is an outline square with `=` strokes.
  - Options: keep the solid tile, or draw an outline frame with a solid `=`.
  - Recommendation: keep, unless the tile jumps out of main-symbols-2-widget; an outline frame with a solid `=` would sit close to `moon-equals` and `stop-square` in weight and shape.
  - Seen at this gate: <main-symbols-2-widget>.
- **Decision: the solid wrench (`symbol-property`).**
  - Finding: the wrench is one solid shape with a 2.12-wide jaw cut out, an exception to the one-filled-accent rule like the witch hat (G12) and the quill vane (G26): a 1.41 outlined handle meets this head off the grid.
  - Options: keep the solid wrench, or draw an outline wrench with off-grid points (a G16 exception).
  - Recommendation: keep.
  - Seen at this gate: <main-symbols-widget, main-ai-actions-widget for the stock wrench beside it>.
- **Decision: the reason recorded for G23.**
  - Finding: for a Node.js launch, VS Code 1.141 shows Stop on the floating toolbar, with Disconnect as its Alt alternative: the attach test it uses is false for js-debug's child session, whose parent is a launch. Gate 3's toolbar sheets showed Disconnect only because the capture harness left Alt held after every chord. The pin itself still matters: Disconnect shows while Alt is held and for attach sessions, and it is the Stop square, so the toolbar looks the same either way (main-debug-disconnect-toolbar holds Alt on purpose).
  - Options: keep the pin and correct the reason in the spec (section 11.3, G23: "js-debug focuses a child session, so the Node.js toolbar shows Disconnect where Stop would be"), or keep the text as it is.
  - Recommendation: keep the pin and correct the reason.
- **Decision: the inline AI-only light bulb.**
  - Finding: G11 maps the gutter form. When the line is indented, or a neighbouring line is blank or indented, 1.141 draws the same AI-only bulb inline, with the `sparkle-filled` codicon, which is not pinned, so that bulb stays stock. Every other light bulb, gutter or inline, is already the candle or the ✧. `sparkle-filled` is also the on state of the Search view's AI-results toggle, whose off state is `sparkle` (`search-sparkle-filled` and `search-sparkle-empty` in the 1.141 bundle): today that toggle shows the house ✧ off and the stock filled sparkle on. Pinning `sparkle-filled` onto the ✧ cluster would make both states the same glyph, so the toggle would stop showing its state.
  - Options: leave `sparkle-filled` stock (the mixed toggle stays a known staging artifact); draw a distinct filled cluster later (a new drawing, not a claim); or pin it to the ✧ cluster (one map line, 174 keys) and accept that the Search toggle loses its state.
  - Recommendation: leave it stock at this gate. <Seen at this gate: the ✧ in main-ai-lightbulb-code.>
- **Decision: `symbol-file` and `symbol-folder` in the suggest list.**
  - Finding: with WitchyNibbles Icons active, 1.141 shows file and folder completions with the file icon theme's icons, so these two glyphs reach the suggest list only with a file icon theme that has no file icons (the gate shows them that way, `workbench.iconTheme: null` for that scene only). `symbol-file` also marks Source Action menu entries.
  - Options: keep both mapped as drawn, or drop them from the pinned list.
  - Recommendation: keep them mapped. They cost nothing and show for users of other file icon themes.
- **Decision: approve the editor batch and the symbols batch, or list changes.**
  - Recommendation: approve, subject to the decisions above.

## Evidence for decisions already taken (spec section 11)
- G11: `gutter-lightbulb-sparkle-filled` on the ✧ cluster, in the gutter of hexes.ts line 4 (main-ai-lightbulb-code), beside the ✧ `sparkle` in the code-action menu of the same line (main-ai-actions-widget).
- G20: the unverified logpoint is the dashed ring (main-debug-disconnect-code). G23: Disconnect is the Stop square (main-debug-disconnect-toolbar).
- D7: the side-bar toggles take their mirrored forms with the side bar on the right (main-layout-right-controls, main-layout-right-swap-controls), and `panel-bottom` is the bottom-pane toggle in the Customize Layout picker (main-layout-customize-widget). IDs share a drawing exactly when their registered defaults share a Codicon.
- G14: the ✧ cluster's two small stars are 5×5 ✦ badges with a waist of 1 (main-scm-sidebar, main-ai-actions-widget). The ✦ head of `pinned-dirty` keeps that waist at a new size, 7×7 (main-tabs-tabs).
- G16, G21: no editor, layout or symbol drawing adds an off-grid point or a sub-unit radius (the `⚠` lines of `npm run validate` still name only `gear`, `sync-arrows` and `cat-slash`).
- G22: `refresh` keeps restart's light weight, mirrored (main-explorer-sidebar).

## Choices made in this phase that the author may overrule
- `sparkle-cluster`: three solid ✦, the largest (8×8 with a 3×3 core) at the left and two 5×5 ✦ to its upper and lower right; at 16px the small ones read as `+` sparks, as the bell-dot ✦ does. The stock sparkle has two outlined stars. A section-4 exception: spec 5.2 names the largest star as the filled part, but a 5×5 ✦ cannot be hollow (its arms are 1 unit), so all three are solid.
- Two more section-4 exceptions, both following the stock pictures: the interface lollipop's 3×3 dot touches its stick (the stock lollipop is joined; a 1-unit gap would split the glyph into a dot and a ring at 16px), and the class tree's connectors run into the solid parent node (the stock tree is joined; a gap would leave the children floating).
- Hatpins: the needle stops short of the head (1.5 for the disc, 2.97 for the ✦) because section 4 keeps an accent one unit from a stroke; with the needle running into it, the ✦ head read as a spiked mace.
- Pages and folders: the filled fold and tab are part of the outline, so the page is a solid corner over a 1-unit outline. The `+` badge is a 5×5 stroke `+` in an open corner, not the stock's filled `+` disc (one filled part per glyph); at 12px it shrinks to a speck. The page's `+` sits one column left of the right wall (on the wall's column it read as the wall going on), and the folder's one unit up, inside the folder's keyline.
- `collapse-all`: the front box is solid (spec 5.2: the main shape filled), so it is the heaviest glyph in the Explorer and Search title bars, beside the outlined New File, New Folder and Refresh.
- `go-to-file`: the arrow points right inside the page (stem and open chevron), not into the page from outside as in the stock; the page uses the whole portrait keyline.
- `list-tree`: the root is a 3×3 filled node, and the trunk starts one unit below it.
- `discard`: an undo hook (↶) with a 2:1 head like the chrome arrows, where the stock's tail runs diagonally down.
- Find toggles: one letter construction, larger than `abc`'s (5 wide, x-height 7, capitals 10); the `A` is a pointed arch on vertical stems, because steep straight legs at this size leave the grid or thin below one unit. The regex asterisk has six arms (upright and two 45-degree bands), no horizontal arm.
- Replace: the target is an empty frame (replace-all: a frame with a second one behind), not the stock's solid box with `c` cut out, because the arrowhead is the one filled part. The `b` is the shared letter at a small size. Replace and Replace All therefore differ only in the target at 16px (the second frame behind it); the stock pair also differs by `b`/`ab`. A second letter does not fit: a double-storey `a` with a 2×2 counter needs 6 rows and the `b` beside it a 4-row bowl under its ascender, so `ab` at one x-height takes 9 rows, which leaves no room for the target (a frame with a 2-unit hole and a second one behind it, 1 unit apart) and the arrow inside 16 units with section 4's clearances.
- The on pane of a layout toggle has no clearance from the frame: it is a region of the window bounded by its walls and divider, as in the stock glyph. The split's new-pane block does keep that clearance.
- The splits put the divider on pixel column 7, so the old pane is 5 wide and the new pane 6, and the new pane holds a floating 4×10 block (a fully filled new pane read as the right or bottom toggle).
- `configure-layout-icon` is a window in four panes with the top-left pane filled, not the stock three tiles.
- The symbols keep the stock sharing exactly (method/function, string/text, module/namespace on the gate-2 braces).
- The `a` of `abc` is the find toggles' double-storey `a` at the symbols size: Part C's first draft drew a single-storey `a`, and the row read "obc".
- The slab (field) is a lid over one band, because the low sides cannot hold a 2-unit hole; it may read as "layers".
- The class tree has the parent at the upper left with a child to the right and one below-right (the stock places three diamond nodes); the interface's filled part is the small dot, not the ring; the enum's back card is the solid one, the reverse of the stock enum-member, so an enum and its members differ in a completion list; the keyword and the snippet keep the stock pictures.
- The symbols are shown through the review helper, not a language: no built-in language reports every symbol kind (TypeScript has no field, constant or namespace symbol, and keyword, text and snippet exist only as completion kinds), so the helper reads each line of two small fixture files as one symbol of the kind it names. Go to Symbol in Editor shows them, six per sheet, because twelve rows do not fit the quick pick at 200%.
- `symbol-file` and `symbol-folder` are shown without a file icon theme (see Decisions).
- Disconnect is captured with Alt held (see Decisions).
- <glyph-level notes from Step 3>

## Known staging artifacts (not defects)
- Stock Codicons that stay unpinned and show in these sheets: <from Step 3, for example `compare-changes` (Open Changes) in the editor title, `diff-multiple` on the Source Control Changes header, `wrench` (refactor rows of the code-action menu), `chat-sparkle` in the title bar, the inline `sparkle-filled` (see Decisions)>.
- The Search view's AI-results toggle shows the house ✧ while off (`search-sparkle-empty`, default `sparkle`) and the stock filled sparkle while on (`search-sparkle-filled`, default `sparkle-filled`, not pinned; see Decisions).
- The suggest scene runs without a file icon theme (`workbench.iconTheme: null`) for its own captures; every other scene uses WitchyNibbles Icons.
- The Explorer and Source Control scenes show their header and row actions without the pointer (`workbench.view.alwaysShowHeaderActions`, `scm.alwaysShowActions`), as they appear under the pointer.
- The debug scene holds Alt for its captures, so the toolbar shows Disconnect, not Stop.
- Problems is switched to a table for its scene (View as Tree is the table's title action) and back afterwards.
- The two `layout-right` sheets move the primary side bar to the right for their own captures.
- `notebook-split-cell` (unpinned) defaults to `split-vertical`, so the notebook's Split Cell shows the house stacked split; no gate scene opens a notebook.
- <harness framing notes from Step 3, if any>

## Colour-theme observations (not glyph defects)
- In Moonlit Candle, Moonlit and Coven Contrast, `symbolIcon.classForeground` is `#77D9FF` while field and interface take VS Code's default `#75BEFF`, so the three read as one colour; Daydream's `#075B86` class and default `#007ACC` field are close too. The themes leave `symbolIcon.fieldForeground`, `interfaceForeground`, `enumeratorForeground`, `constantForeground`, `moduleForeground`, `namespaceForeground`, `stringForeground`, `textForeground` and `snippetForeground` unset.
- <from Step 3, per theme, if any>

## Harness changes made for this gate
- Deferred from gate 3 (Task 1): every screenshot set is checked for tooltips again after its last crop, and the debug hover counts as a tooltip; every settings write is waited for through the window title, so a scene's settings are in force before its setup even when the theme does not change; a dry run that asks for a scene no pass captures stops with its usage; the privacy scan accepts the `<user>` placeholder in a WSL network path.
- `capture.mjs` releases a chord's modifiers after the key. Before, VS Code kept Alt held after every `ctrl+alt+shift` chord, so later captures could show Alt alternatives (gate 3's Disconnect; Split Editor Down for Right). A `{ "hold": "alt" }` step holds Alt on purpose.
- New scenes: explorer, scm, tabs, split-down, find-replace, search-replace, problems-table, layout-on, layout-off, layout-right, layout-right-swap, layout-customize, ai-lightbulb, ai-actions, symbols, symbols-2, suggest, debug-disconnect, icon-sheet-3. Every icon wait checks that the icon lies inside its container; the title-bar waits also check that nothing covers it; every quick open waits for the quick input before Enter.
- `run-gate.mjs` drops the variants pass before it cuts the job down, so a scene only that pass captures stops a `--skip-variants` dry run; `.claude/worktrees/` is ignored in git and `.claude/**` in the VSIX.
- The gate-1 to gate-3 jobs no longer reproduce their committed sheets exactly: the shared review workspace gained hexes.ts and the two `.grimoire` fixtures, and the breakpoint plan a seventh breakpoint (the `unbrewed.js` logpoint), which the gate-3 `breakpoints` scene now sets too.
- Helper extension 0.0.5: symbols and completions for the `*.grimoire` fixtures; the `unbrewed.js` logpoint. Fixtures: hexes.ts (a type error only AI actions fix), symbols.grimoire, charms.grimoire.
- <fixes made while running, with the failed run id and the cause: describe the cause in your own words; never paste error output (it contains the Windows Temp path)>

## Approval
Author: approve gate 4 as is / approve with the changes listed below / redraw. File icons and the release start only after approval.
````

Then scan the README: `node scripts/review/privacy-scan.mjs docs/qa/2.0-gate-4/README.md; echo "exit $?"`. Expected: one `✓` line and `exit 0`.

- [ ] **Step 6: Snapshot the tree and stop**

Run: `mkdir -p review-out/g4 && git add -A && git write-tree | tee review-out/g4/TREE_14`
Expected: one 40-character tree id, also saved in `review-out/g4/TREE_14`.

Stop here. Report the README path `docs/qa/2.0-gate-4/README.md`, the tree id in `review-out/g4/TREE_14` and the run id to the author, and wait for the gate decisions. Do not commit (the author commits after gate 4) and do not start the file icons or the release.

---


## Later plans (after the author approves gate 4)

**File icons (spec section 6).** The `file-icons` stage (19 pending problems at gate 4) and the file icon theme's own review gate. The harness carries over: the icon sheet pages, the privacy scan, the settings wait, the modifier release and the scene schema; a file-icon gate needs Explorer, tab, breadcrumb and quick-open scenes with the fixture's file types.

**Release (spec section 9).** Version 2.0.0, `galleryBanner.color`, the `release` stage (2 pending problems), the packaged-file allowlist (`test/package-contents.test.mjs`: icon sources and data still awaiting a release decision), marketplace images, and the decision on the review helper's place (it stays out of the VSIX). After gate 4, `npm run validate -- --release` lists only `file-icons` and `release`.

The gate-4 decisions (the G23 wording, `sparkle-filled`, the four extra symbol pins, `symbol-file` and `symbol-folder`, and any redraw the author asks for) are applied, if taken, before the author's commit of gate 4, as the gate-3 decisions were. Pinning the four symbol shares would take the pinned list from 173 to 177 keys, with claims only; `sparkle-filled` stays stock as the README recommends (pinning it would make the Search view's AI-results toggle show one glyph in both states).

---

## Review notes

The plan was assembled from five drafted parts (A: deferred harness fixes; B1: editor batch, first half; B2: deferred geometry-test minors and the layout half of the editor batch; C: symbols batch; D: gate-4 scenes and run), each drafted and measured on its own scratch worktree of `2ec5b09` without the other parts. The assembled plan was then applied end to end, Task 1 to Task 13, on one fresh worktree, and every count, TAP number, SVG and validate line above comes from that run. Changes made while assembling:

- **One letter construction.** Parts B1 and C each drew `a`, `b` and `c`. Part B1 lands first and owns the construction (`export const letters` in `editor.mjs`), so Task 10 imports it for `abc` and draws no letters of its own. The two drafts differed only in the `a`'s top-right shoulder (B1: an r1 curve; C: square); the `b` and `c` were identical. Part C's metric test of its own letters was dropped (Task 5's `the shared letters keep the construction at the symbols size …` measures the same `abc`); its row-by-row 16px test was kept unchanged, because the B1 shapes give the same pixel rows, and checked against a single-storey `a` (it fails, as it must). A new test pins that `abc` calls the live letters at the symbols size. The `abc` SVG changed by the shoulder; the 40+ pixel look-alike test still measures a minimum of 46 (`snippet-frame` against `braces`). At 16px the house `abc` reads "abc" in the comparison lists and in Go to Symbol.
- **The icon sheet's third page lands with the 103rd drawing.** The gate-3 harness test pins the page count on purpose, so `npm test` failed from Task 11 (106 drawings) until Part D's patch in Task 13. The page-count assertion now moves to three pages in Task 11, test-first, and Task 13's patch no longer carries that hunk (it was regenerated from the applied file).
- **Stray-change check in Task 7.** `git status --short scripts` lists the whole gate's staged work once earlier snapshots have run `git add -A`; Task 7 now checks `git diff --name-only` against the last snapshot.
- **TAP numbers.** `node --test` with several files numbers the tests across files (in file-name order), not per file; Task 1 Step 2 now lists the numbers.
- **Spec 5.2.** The one-line "Symbols" paragraph becomes a table with the letter construction written down (Task 12 Step 6). Sections 2 and 5.1 carry the 173 keys (Task 2). Spec 11.2's G11 ("171 keys then") and 11.3's G23 reason are left as written; the gate README asks the author to correct G23.
- **README entries.** The decisions and choices that Parts B1, B2 and C handed over are written into Task 14's README template, each with a recommendation.
- **Session name and scratch names.** One agent-browser session, `spellbound-gate4`, for every executor; no scratch file named like a test (a drafter's `review-out/…/t1-test.mjs` failed `npm test`).

An adversarial review then applied Tasks 1-13 again on its own worktree (every block and expected output held) and found 0 critical, 3 important and 13 minor issues. All were applied, and Tasks 1-13 were re-applied on the integration worktree from `2ec5b09` with every count re-measured:

- **Agent worktrees (important).** Worktree-isolated subagents check out the repo under `.claude/worktrees/`, which `git add -A` staged as embedded repositories and `vsce` packaged. Task 1 now ignores that folder in git and `.claude/**` in the VSIX, pinned by a test; Before Task 1 stops if `git worktree list` shows more than the main repo.
- **`layout-right` stood on `layout-off` (important).** It now closes the secondary side bar itself; `tabs` puts its editors back in its own teardown and `split-down` pins and changes them itself. A new Task 13 test pins all of it, and each of the three scenes was dry-run alone at 100%.
- **`sparkle-filled` (important).** Pinning it on the ✧ would make the Search view's AI-results toggle show one glyph in both states; the README now recommends leaving it stock and lists the mixed toggle as a staging artifact.
- **Minor.** `--skip-variants` drops the variants pass before `filterJob` (with a spawn test, run with an empty `PATH` so it cannot build); the settings test requires both waits to be awaited; the page's `+` moved off the right wall's column and inside the keyline, the folder's `+` inside its keyline (Task 3, new SVGs); the README gains the section-4 exceptions (three solid ✦, the joined lollipop and class tree), the wand reading of the ✦ hatpin with a neutral recommendation, Replace against Replace All (a second letter does not fit section 4, so they differ by the target only), the solid collapse box, the look-alike checks, the candle note (batch 1, G5), the approve recommendation, the fixtures that change the gate-1 to gate-3 runs, and a warning never to paste error output; the spec's wrench and `=` rows say "proposed at gate 4"; the scene count is six, the console-spider comment gives both the window and the glyph bounds, and the G14 evidence line separates the 5×5 badge from the 7×7 head. Checked and left: the go-to-file comment's "1.12 of the fold" is right (head corner (7, 6.5) to fold corner (8, 6)); the reviewer's 1.000 is the arrow to the walls.

## Self-review notes

- **Spec 5.2 "Editor, find, layout, SCM" rows.** `pinned`/`pinned-dirty` (hatpins), `sparkle` and `gutter-lightbulb-sparkle-filled` (✧ cluster): Task 2. `new-file`/`new-folder`, `go-to-file`, `symbol-file`, `symbol-folder`: Task 3. `collapse-all`, `list-tree`, `discard`, `refresh`: Task 4. `case-sensitive`, `whole-word`, `regex`, `preserve-case`: Task 5. `find-replace`, `find-replace-all`, `search-replace-all`: Task 6. The six frame toggles and their mirrored IDs (D7): Task 8. `split-horizontal`, `split-vertical`, `configure-layout-icon`: Task 9. That is the 34 `editor` IDs; the candle and `circle-filled` rows were done at gates 1 and 2. Every one is waited for on screen in Task 13.
- **Spec 5.2 "Symbols".** `abc`, `[x]`, keyword, snippet, and module and namespace on the braces: Task 10. Method/function, field, property, constant: Task 11. Class, interface, enum, and the batch judged side by side: Task 12. That is the 15 `symbols` IDs, twelve in Go to Symbol and three in the suggest list at the gate.
- **Section 4 rules pinned by tests.** One filled part or none per drawing (each drawing test names it); real holes probed with ink (pages, folders, toggles' counters, the `=` slots, the layout panes); 1-unit clearances measured with `outlineGap` (Tasks 2-6, 8-12); the 2×2 counter minimum and the 1-unit stroke of every letter (Task 5); odd-width central features on column 7 (the splits' divider, the cube's front edge, the lollipop's row); no new off-grid point (the across-modules grid test, unchanged, and three `⚠` lines in every validate run); the dashed ring's 1-unit dash spacing (Task 7); drift for every new SVG.
- **Section 8.** Superset coverage per batch: Task 9 appends `product-batch:editor` and Task 12 `product-batch:symbols` once every ID is mapped, and their coverage tests name each ID, drawing and codepoint. Font geometry: `node scripts/validate.mjs --only product-pipeline` in every drawing task.
- **Deferred gate-3 items.** Tooltip re-check and `.debug-hover-widget`, the `NOT_IN_CONTEXT` key check, the `filterJob` empty-pass guard, the scene-settings wait, the `<user>` WSL path: Task 1. The dash-gap assertion, the knockOut complement, the step-arrow guard, the badge-literal comment, the debug coverage title (and the two items already closed at HEAD, checked): Task 7. G20 and G23 are waited for at gate 4 (Task 13).
- **Names used across tasks.** `applySettings`, `NO_TOOLTIP` (Task 1); `expectEditorPins`, the editor test helpers (Task 2); `letters` (Task 5, consumed by Tasks 6 and 10); `windowOutline`, `place`, `pane` (Task 8, reused in Task 9); the symbols test helpers (Task 10); `holdAlt`, the `hold` step, `DRAWN_THROUGH`, `WAITED_FOR_AT_GATE_4` (Task 13); drawing names and codepoints as in the codepoint table; stages `product-batch:editor` and `product-batch:symbols`; `glyphModules = [batch1, chrome, status, panel, debug, editor, layout, symbols]`.
- **Checked while writing.** Every code block of Tasks 1-13 was applied verbatim, in order, on a fresh worktree of `2ec5b09` (with `../witchyterm` present, so nothing skipped), and every expected output above was measured there: test totals and failing TAP lines, the SVGs byte for byte, the claim lines, the map sizes, the validate output. The comparison pages and the glyph sheet were rendered at 1x and 2x and every new glyph judged at 16px; the drafters' mutation checks were repeated for the `a` counter (fails three letter tests) and the single-storey `a` (fails both `abc` tests). Task 1's cut-down runs (2026-10-10T22-25-30, 44 captures; 2026-10-10T22-23-54, 64 captures; 0 warnings), the three scenes that now stand alone (2026-10-10T22-31-14 `layout-right`, 2026-10-10T22-31-43 `tabs`, 2026-10-10T22-32-24 `split-down`; 8 captures, 0 warnings each) and the 100% dry run of the whole gate-4 job with the house drawings (2026-10-10T22-33-06: 172 captures, 0 warnings; all 22 sheets and the manifest pass the privacy scan; the sheets were opened, before the review fixes in run 2026-10-10T21-44-09 and for the changed scenes again) ran from that worktree. Task 14's commands were checked to parse (`--help`, the job's passes and scenes, `--scales` and `--scenes` errors).
- **Not checked while writing.** The full four-scale gate-4 run and its README (Task 14); the gate-4 scenes at 125%, 150% and 200% with the house drawings (200% only with stock stand-ins, while drafting Part D), which is why Task 13 Step 6's two-scale dry run is mandatory; the variants pass (no gate variant is drawn).

## Execution

Recommended: **subagent-driven** (superpowers:subagent-driven-development). The drawing tasks hand exact geometry and map entries to one another (the batch-1 star, the shared letters, the window-and-pane part, the map the gate tasks read), and a fresh reviewer per task who renders each comparison page and glyph sheet, and for Tasks 13 and 14 opens each gate sheet, catches what the tests cannot (a drawing that fails at 16px, a scene that frames the wrong state), as the gate-2 and gate-3 reviews did. Tasks 1 and 13 launch VS Code only through the harness; Task 14's full run takes about 25 minutes and is run once, after a clean dry run.
