# Spellbound Themes 2.0, Gate 4 to Review Gate 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the repo from the approved review gate 4 to review gate 5: build the file-icon pipeline of spec 6.1 (drawings as code with colour-role tokens, committed sources, one palette, a drawing-based map, a build into three resolved sets and the theme JSON, the 1.2.1 `witchy-*.svg` icons deleted), enforce the new validation stage `file-icons:pipeline` with the F9 soft warning, draw the three defaults and the gate-5 sample of spec 6.2 (`parchment`, `folder`, `folder-open`, the `src` folder closed and open, the ts gem, the py snake, the json keyring, the LICENSE contract), take the gate-4 harness to gate 5 (a job's own fixture, focused-row quick-input waits, a grayscale column, the session closed, the pointer parked), add the file fixture `review/workspace-files/` and the gate-5 job, and produce the gate-5 evidence in real VS Code 1.141. Then stop for the author.

**Architecture:** File icons get their own drawing pipeline beside the product icons. Drawings are code in `scripts/file-glyphs/` (`defaults.mjs`, `folders.mjs`, `code.mjs`, `data.mjs`, `docs.mjs`, listed in `index.mjs` as `fileGlyphModules`), built from painted parts (`scripts/file-glyphs/parts.mjs`: `painted(role, …)`, `fileIconDocument`, the folder construction `folderBody`/`BADGE_BOX`) and the section-4 primitives. `npm run draw:file-icons` writes one role-token source per drawing to `icons/file-src/`; `scripts/lib/file-icon-palette.mjs` is the one colour table; `icons/file-icon-map.json` maps drawings to keys; `npm run build:file-icons` (also the last step of `npm run build`) resolves every source into `icons/file-icons/{dark,light,high-contrast}/` and regenerates `icons/file-icon-theme.json`. `scripts/lib/checks/file-icon-pipeline.mjs` holds the source rules (`fileGlyphProblems`), the stage (`checkFileIconPipeline`: rules, map, fresh-build equality, 3:1 on the side bars) and the F9 warning (`checkSelectionContrast`). `npm run file-icon-sheet` renders every drawing on each theme's side bar, selection and quick-input focus, the eight roles, a grayscale copy and a 32×-supersampled reference (`scripts/lib/supersample.mjs`). The gate harness gains `scripts/review/workspace.mjs` (the job's `"workspace"` and the gate-2 git fixture, moved out of `run-gate.mjs`) and `scripts/review/waits.mjs` (named waits, `quick-input-row`); the contact sheet adds grayscale columns and closes its session; `capture.mjs` parks the page pointer at launch.

**Tech Stack:** Node 24 (ES modules, `node:test`), svg-pathdata 7.2.0, the product-icon toolchain unchanged (svgicons2svgfont 15.0.1, svg2ttf 6.1.0, ttf2woff 3.0.0, fontkit 2.0.4), @vscode/vsce 3.x, agent-browser 0.38.1 (file-icon sheet, contact sheets), Python 3 with Pillow (reference crops, throwaway renders, nearest-neighbour crops) and tesseract (privacy scan OCR), VS Code 1.141.0 for Windows (gate captures) with its built-in TypeScript, git, Copilot (signed out) and js-debug.

**Spec:** `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`, especially section 4 (glyph rules and their exceptions), 6 (all of it: the palette, the logo rule, the 16px rules, the tables), 6.1 (pipeline), 6.2 (house construction and the gate-5 sample), 6.3 (gates 5 and 6), 8 (the file-icon bullets), 11 (D8-D11), 11.4 (G32, G34, G39) and 11.5 (F1-F9). Previous plan and format: `docs/superpowers/plans/2026-10-10-spellbound-2-gate-4.md`. Gate-4 evidence and approval: `docs/qa/2.0-gate-4/README.md`. Executors read the spec alongside this plan; section numbers below refer to the spec.

## Global Constraints

Kept from the earlier plans (still valid):

- `engines.vscode` stays `^1.100.0`. The package stays declarative: no `main`, no activation events. The review helper extension in `review/` is never referenced from the root `package.json` and is excluded from the VSIX.
- Font ID `witchynibbles-product-icons`, family `WitchyNibbles Product Icons`, file `icons/witchynibbles-product-icons.woff`. No product glyph, codepoint or pinned key changes in this plan: 177 pinned keys, all mapped, 109 drawings. `npm run build` must leave the color themes and the product font byte for byte as they are (Tasks 6 and 13 check it).
- The file icon theme keeps its id `witchynibbles-icons` and its path `./icons/file-icon-theme.json` in `contributes.iconThemes`.
- The witchyterm scheme is pinned in this repo; `../witchyterm` is never modified.
- Never kill VS Code by image name (`taskkill /IM Code.exe` would close the author's own editor). Review instances run with their own `--user-data-dir` and `--extensions-dir` and are closed by PID or CDP only. Only Task 14 (a gate-4 dry run), Task 15 (the gate-5 dry run) and Task 16 (the gate run) launch VS Code, always through `scripts/review/run-gate.mjs`.
- The VS Code 1.141 install is found at run time, never written down (`run-gate.mjs` looks under `%LOCALAPPDATA%\Programs\Microsoft VS Code`). This plan does not run `scripts/extract-icon-ids.mjs`; if an executor runs it, its first line holds the resolved bundle path with the Windows user name: filter its output to the result lines (`| grep -E '^✓|^✗'`) and never paste the path anywhere.
- `node scripts/validate.mjs` writes its `✗` lines to stderr. Every command that pipes validate output into `grep` uses `2>&1`. The three accepted product grid warnings (`gear`, `sync-arrows`, `cat-slash`, G16) print in every run; commands that show the whole validate output filter them with `grep -vE 'cat-slash|gear\.svg|sync-arrows'`.
- `run-gate.mjs` rejects unknown options with exit code 2 and prints its usage with `--help`; dry runs use `--scales`, `--scenes` and `--skip-variants`, and a dry run's manifest is marked `dryRun` and is never gate evidence.

Gate 5:

- Version stays `1.2.1` and `galleryBanner.color` stays `#110d24`; the `release` stage stays pending, and so does `file-icons` (full key coverage) until gate 6 (F1, F3).
- **No commits until the author approves gate 5.** The one exception is the author's own commit of this plan, before Task 1 (see Before Task 1). Work stays on the checked-out `spellbound-2.0` branch, with no new branches. Each task ends with a tree snapshot, `mkdir -p review-out/g5 && git add -A && git write-tree | tee review-out/g5/TREE_N` (N is the task number; `g5/` keeps the gate-4 snapshots in `review-out/g4/` intact; `review-out/` is git-ignored), and the next task's changes are `git add -A && git diff --cached $(cat review-out/g5/TREE_N)`. Worktree-isolated subagents put their worktrees under `.claude/worktrees/`, which git and the VSIX ignore since gate 4. Because every snapshot stages the tree, `git status --short` lists the whole gate's work from Task 1 on; a step that checks for stray changes uses `git diff --name-only` (working tree against the last snapshot). The tree is dirty throughout and the gate manifest records `repoDirty: true`. When the author commits, messages end with the attribution line the session provides, and the author identity is the repo-local `user.name`/`user.email`.
- Privacy: no Windows or WSL user name, user directory, or account email is ever written into a tracked file, a plan, a commit message or a committed screenshot. Docs write `<user>`. Every committed sheet passes `node scripts/review/privacy-scan.mjs` and a look by the executor before it is staged. Raw captures stay in `review-out/` and are never copied anywhere tracked. A failed run's last line (`capture failed …; partial output in …`) holds the Windows Temp path with the Windows user name: never paste run output into a tracked file, a plan or a report.
- agent-browser: every command block starts with `export AGENT_BROWSER_SESSION=spellbound-gate5` (one session name for every executor of this plan), every screenshot path is absolute (`"$PWD/…"`), and a drawing task's own blocks end with `agent-browser close`. From Task 14 on `contact-sheet.mjs` closes the session at the end of every gate run, also when a sheet fails. Keep the pointer off the review window during a run (the harness parks the page pointer at launch, Task 14).
- Scratch files: prototype renders live in `review-out/g5-pipeline/`, throwaway sample renders in `review-out/g5-sample/` (Tasks 9, 10 and 13), the sheet in `review-out/file-icon-sheet/`, harness probes in `review-out/g5-harness/`. Never name a scratch file `*-test.mjs`, `*.test.mjs` or `test-*.mjs` anywhere in the repo, `review-out/` included.
- `npm test` is `node --test` (every test file Node finds) up to Task 14 and `node --test "test/**/*.test.mjs"` from Task 15 Step 3 on, set before the fixture `review/workspace-files/` exists: the fixture holds `sample.test.{js,mjs,cjs,ts,mts,cts}` files and an empty `package.json`, which the bare `node --test` collects and fails on. Every test file of this plan lives in `test/` and ends in `.test.mjs` (Task 15 pins it); a helper module under `test/` would be collected as a suite, so each test file keeps its own few helpers.
- Test totals below were measured by applying this plan's tasks in order, Task 1 to Task 15, to a scratch worktree of HEAD (`538035f`) without the `../witchyterm` sibling. They are given as the real-repo values: there `test/witchyterm-pin.test.mjs` runs its one test, so `ℹ pass` equals `ℹ tests`; in a worktree without the sibling `ℹ pass` is one lower and `ℹ skipped 1` appears (the commands grep `ℹ tests` and `ℹ fail`, which read the same in both, except where a step prints `ℹ pass` too). In a git worktree `node_modules` is a symlink that `git add -A` stages; unstage it (`git reset -q node_modules`) before `git write-tree` there. In the real repo none of this applies. `node --test` with several files runs them in file-name order, and the TAP numbers run on across the files.

File-icon pipeline (Tasks 1-13):

- File-icon drawings are code in `scripts/file-glyphs/` (`defaults.mjs`, then `folders.mjs`, `code.mjs`, `data.mjs`, `docs.mjs`), listed in `scripts/file-glyphs/index.mjs`, which ends as `export const fileGlyphModules = [defaults, folders, code, data, docs];`; the map lists the drawings in that order (Task 13 pins it). Gate 6 adds drawings to these modules, not a module per drawing. Every painted part is `painted(role, …)` with one of the eight roles of `scripts/lib/file-icon-palette.mjs` (`code`, `data`, `style`, `tests`, `config`, `docs`, `assets`, `muted`); `fileIconDocument` writes one `<path fill="{role}" d="…"/>` per part in paint order, the accent last, and nothing else. Section-4 shapes come from `scripts/glyphs/primitives.mjs`, never copied; folders from `folderBody`/`BADGE_BOX` in `scripts/file-glyphs/parts.mjs`.
- Every source passes `fileGlyphProblems` with no error and **no warning** (the drift test asserts both): viewBox `0 0 16 16`, `<svg>` with only `xmlns` and `viewBox`, `<path>` with only `fill` and `d`, role tokens only (no hex, opacity, stroke, transform, fill-rule, style, gradient), holes counter-wound within each part, straight-segment points on the whole/half grid. Do not use `knockOut` on a subpath with arcs: it flattens them into off-grid segments; knockouts are drawn as straight ends.
- Two parts that touch meet only along whole-number horizontal or vertical edges (or overlap), so separate fills leave no anti-aliased seam.
- Drawings follow section 4 and 6.2: keylines (portrait 12×14, landscape 14×12, round 14; badges in the 7×7 box x8-15, y8-15 with the folder knocked out 1 unit around it); whole-number edges; accents ≥3×3 (dot) or ≥4×4 (shape); one full unit between an accent and a stroke, measured with `outlineGap` (it throws on an empty set), except where the accent is part of the object's silhouette (the parchment fold and the folder tab, inherited from the product glyphs (G39); the snake's head; the key bows, two discs in one accent part), which this gate puts to the author as a section-4 exception (Task 16's README): until the author rules, gate 6 does not add another; cut-outs ≥2 units except straight slots ≥4 long; no gap or sliver under 1 unit; real holes. Every drawing gets tests that fail if the shape is wrong: bounds per keyline, accent bounds, clearances, ink probes of every hole and stroke width, the role of each part, a silhouette test against its look-alike, and the map pin. Ink samples avoid edges: the 0.25-offset grid for straight edges, (0.125, 0.3125) where 45° edges or a mirror test are involved.
- After changing a drawing: `npm run draw:file-icons`, add or update its `icons/file-icon-map.json` entry (lower-case keys; `category` must be a role painted in the source; folder drawings pair with their `-open` twin), `npm run build:file-icons`. Never edit `icons/file-icons/**` or `icons/file-icon-theme.json` by hand: `file-icons:pipeline` fails them against a fresh build. The file-icon sheet resolves the committed `icons/file-src/`, so run `npm run draw:file-icons` before it.
- Validation stages: Task 8 appends `file-icons:pipeline` to `scripts/validation-stage.json`. `file-icons` (full coverage, now including the eleven D11 `languageIds`, Task 6) and `release` stay pending. F9 lines are `⚠` warnings, never failures.
- Throwaway renders (`review-out/g5-sample/sketch.mjs`, `compose.py`, Task 9): coverage at 32× supersampling in Node, composited per theme in Python/Pillow. Used for candidates before a drawing is written and for the gem-language sketch, never for the judgement of a committed drawing (that is the file-icon sheet).

Gate harness (Tasks 14-16):

- A job may name its fixture (`"workspace"`, a folder of `review/`); the gate 1-4 and smoke jobs keep `review/workspace`, which alone becomes the gate-2 git repository. The gate-5 fixture is `review/workspace-files/` (105 files, generated once in Task 15 from `scripts/lib/file-icon-requirements.mjs`, committed, reused by gate 6). Git keeps its `node_modules/` through `!review/workspace-files/node_modules/`; the VSIX excludes it with `review/**`.
- Gate 5 runs at 100% and 200% only, so a `--scales=1,2` dry run is the whole job; its manifest is marked `dryRun` and is never gate evidence (Task 16 Step 4 checks).

### File-icon sheet procedure (used by every drawing task)

```bash
export AGENT_BROWSER_SESSION=spellbound-gate5
npm run file-icon-sheet
for dpr in 1 2; do
  agent-browser set viewport 1700 1200 $dpr
  agent-browser open "file://$PWD/review-out/file-icon-sheet/index.html"
  agent-browser wait --fn "document.body.dataset.ready === 'yes'"
  agent-browser screenshot --full "$PWD/review-out/file-icon-sheet/sheet@${dpr}x.png"
  rect=$(agent-browser eval "(() => { const r = document.querySelector('#reference').getBoundingClientRect(); return [r.left, r.top + scrollY, r.right, r.bottom + scrollY].map(Math.round).join(' '); })()" | tr -d '"')
  python3 -c "import sys; from PIL import Image; d=$dpr; b=[int(v)*d for v in sys.argv[1:]]; Image.open('review-out/file-icon-sheet/sheet@${dpr}x.png').crop(b).save('review-out/file-icon-sheet/reference@${dpr}x.png')" $rect
done
agent-browser close
```

Expected: `review-out/file-icon-sheet/index.html: N resolved SVGs` with N = 3 × (drawings + 8) (33 with the three defaults, 51 once Task 13 lands), and four PNGs: `sheet@1x.png`, `sheet@2x.png` (the whole sheet) and `reference@1x.png`, `reference@2x.png` (the magnified reference table, cropped from the full-page capture: an element screenshot of `#reference` comes back blank below the first rows once the table is taller than the viewport). Each drawing task gives the sizes it measured. The sheet shows every drawing in its theme's set at 16 and 32px on each color theme's side bar, active selection and quick-input focus; `parchment` re-resolved in each of the eight roles (F9 evidence); each 16px icon magnified 8× (16 device pixels at 1×, 32 at 2×), Chromium's render beside the 32×-supersampled reference; and the whole sheet again in grayscale. Open the PNGs with the Read tool; crop and upscale the 16px cells with nearest-neighbour scaling (PIL) when a cell is too small. Judge at 1× and 2× on all four side bars and in grayscale, structure against the reference (gate-4 lesson: Chromium's anti-aliasing of a 16px fill is not the truth). A drawing that passes its tests but does not read at 16px is redrawn before the task ends. Task 16 commits `sheet@1x.png` and `sheet@2x.png` as `docs/qa/2.0-gate-5/file-icon-sheet@1x.png` and `file-icon-sheet@2x.png`.

## Review Focus

The five ways this work is most likely to fail a user, none of which the gate-4 tests exercise, and the test that now pins each:

1. **What ships is not what was reviewed.** A hand edit to `icons/file-icon-theme.json` or a resolved SVG, a forgotten `npm run build:file-icons` after a drawing change, a stray file in `icons/file-icons/` (a renamed drawing's old SVG), or a hex written into a source that bypasses the palette would ship icons nobody judged, or one that vanishes on its own side bar. Pinned by `file-icons:pipeline fails a theme or resolved set that is not a fresh build, an extra file, a shown language icon and a colour under 3:1` and `file-icons:pipeline: the committed map, sources, resolved sets and theme pass` (Task 8). The stage's wiring into `npm run validate` is checked by Task 8 Step 3 (a one-character edit fails `npm run validate`), not by a test, as for every earlier stage, `icons/file-icon-theme.json and icons/file-icons/ are a fresh build of the map and the sources (npm run build:file-icons)` (Task 6), `icons/file-src holds exactly one source per drawing, …` and the per-drawing drift cases (Task 4), `every palette colour reaches 3:1 on its set's sidebar (spec section 6)` (Task 1) and `file-glyph source rules (spec 8): role tokens only, …` (Task 2).
2. **A sample file shows the parchment in the real tree.** A key mistyped, upper-case, on the wrong property, missing from one set, served by two drawings, or a folder twin without its expanded names makes VS Code fall back to the default; the 1.2.1 `languageIds` block (D11) could vanish with the 1.2.1 icons. Pinned by `a map that cannot be built is refused with every problem named`, `the map refuses an unknown default slot, and an -open drawing without its closed twin` and `D11: the 1.2.1 languageIds block stays required, …` (Task 6), the per-drawing map pins (`map: folder-src serves src and source closed, …`, `map: gem-cut …`, `map: snake …`, `map: keyring …`, `map: contract …`, Tasks 9-13), and `the gate-5 map: the three defaults and the six sample drawings of spec 6.2, in module order, and nothing else` and `the gate-5 theme serves every sample key in all three sets, so the coverage stage no longer lists them as missing` (Task 13).
3. **A hole or a stroke closes up at 16px, two parts show a seam, or a look-alike reads as its neighbour.** File icons are several fills; a per-glyph winding check would flag legitimate accents and miss per-part errors, and parts that abut on fractional edges leave a light line. Pinned by `file-glyph source rules: holes are checked per part, …` (Task 2), `folderBody(): … together the product symbol-folder glyph` (Task 3) and `parchment: … together the product symbol-file page` (Task 4), the reference's own tests (`the 32x reference fills with nonzero winding: …`, Task 5), the ink probes of every drawing (the spine slot, the gem's hole and 2-unit 45° sides, the ring's hole, the snake's counters; Tasks 9-13) and the silhouette tests (`folder-src and folder-src-open differ from the default folders only in the badge corner`, Task 9; `contract differs from the default parchment in silhouette: …`, Task 13; `gem-cut sets the gem language …`, Task 10).
4. **The VSIX ships the role-token sources, or not the resolved sets.** A source with `fill="{muted}"` renders black; a missing set leaves Daydream or Coven Contrast without icons. Pinned by `the vsix ships the file icon theme and its resolved sets, never the role-token sources (spec 6.1)` (Task 7).
5. **The author decides on a state the user never sees.** A selected Explorer row in an unfocused tree is drawn in `list.inactiveSelectionBackground`, not the active selection F9 is about; Enter before a quick-open row is focused opens nothing or the wrong file; at 200% a 15th Explorer row and the third and fourth tab were out of view while DOM waits passed. Pinned by `gate 5 shows the sample in the Explorer closed, then src and the default folder open with LICENSE selected in a focused tree` and `every gate 5 quick open types its file, waits for that file's row to be focused, then presses Enter; …` (Task 15), `resolveWaits writes a named wait out as the waitFor expression capture.mjs evaluates` and `every gate 4 quick open waits for a focused row of the file it opens before it presses Enter` (Task 14), and the row-count and list-box checks of the Explorer and tabs tests (Task 15).

## Resolved decisions

The decisions this plan applies or must respect, and what it does for each.

| # | Decision | Tasks | What this plan does |
| :- | :- | :- | :- |
| F1 | File-icon plans cover section 6 only; the release is planned afterwards | all | Version `1.2.1`, `release` pending; `file-icon-map.json` joins the pending-release file list (Task 7). |
| F2 | Two file-icon gates: gate 5 the pipeline and a sample, gate 6 the rest | 9-13, 16 | The sample of spec 6.2 and nothing more; keys outside it fall back to the new defaults until gate 6. |
| F3, D8 | Drawings are code with role tokens, committed sources, one palette, a map, a build into three sets and the theme; validation split into `file-icons:pipeline` (gate 5) and `file-icons` (gate 6) | 1-8 | Palette module, `icons/file-src/`, `icons/file-icon-map.json`, `npm run build:file-icons` into `icons/file-icons/` and the theme; `file-icons:pipeline` enforced in Task 8; `file-icons` stays pending. |
| F4 | Gate surfaces: Explorer (closed, open, a selected row), tabs, breadcrumbs, quick open; four themes at 100% and 200%; grayscale column; static file-icon sheet; fixture named by the job's `workspace` | 5, 14-16 | The file-icon sheet (Task 5); `workspace` and `prepareWorkspace`, the grayscale column (Task 14); the fixture and six scenes (Task 15); Task 16 commits the file-icon sheet beside the contact sheets. |
| F5 | Deferred harness items taken in: session closed, focused-row quick-input waits, the four G34 pins waited for, the pushpin on a pinned tab. Still deferred: test-hygiene helpers, per-theme Disconnect, `search-replace` teardown, gate 1-3 jobs reproducing | 14, 15 | `contact-sheet.mjs` closes the session; `quick-input-row` (gate 4 retrofitted, gate 5 uses it); `symbols` waits for `PINNED_AFTER_GATE_4_RUN`; `tabs` waits for the pushpin on pinned `LICENSE`. The deferred items are named in the README's harness section. |
| F6, D9 | Eight closed roles, muted folder bodies, badges in their contents' category, transparent interiors, no opacity or gradients | 1, 2, 8, 9-13 | `ROLES` frozen; `fileIconDocument` refuses other roles; `fileGlyphProblems` allows only `fill` and `d` on `<path>`; every sample part is `painted(role, …)`. |
| F7 | One outline plus one filled accent, which may take another role; folder badges solid on a muted folder | 3, 4, 9-13 | parchment: sheet + fold; folders: body + filled tab; `folderBody({ badge: true })` knocks the outline back 1 unit around `BADGE_BOX`; badge: a solid `{code}` grimoire; gem: the solid crown; snake: the head; keyring: the two bows (one part); contract: the `{data}` seal, the sample's one second role. |
| F8, D10 | `light` docs `#3B2A47`; hc tests `#74E8B8` and config `#A99AB9`; assets each theme's blue | 1 | Pinned literal palette; the assets values tied to each theme's `charts.blue` by a test. |
| F9 | Warn under 3:1 on active selection and quick-input focus; dark set against both dark themes; show a selected and a focused row; the author picks the fix | 5, 8, 15, 16 | `themeBackdrops` (quick-input focus falls back to the active selection, VS Code's default); `checkSelectionContrast` warns (3 lines after Task 8, 12 after Task 13), for every color theme of a set and for a quick-input focus of its own (both pinned in Task 8); the sheet's role strip; `explorer-open` (active selection in a focused tree) and `quick-open` (focused row); the README's F9 decision. |
| D11 | Keep the `languageIds` block | 6, 10-12 | The 1.2.1 block goes with the 1.2.1 icons and comes back from the map; its 11 keys join the pending `file-icons` stage (`REQUIRED_LANGUAGE_IDS`); `typescript`, `python`, `json`, `jsonc` mapped, 7 left for gate 6. |
| Spec 6 logo rule | Echo the name, never the logo | 11 | One snake, one band, one head; a test pins it. |
| Spec 6 look-alikes | Differ in silhouette | 9, 10, 13 | The gem language sketch (ts, js, tsx); contract against parchment; badged folders against the plain ones. |
| Spec 6.1 (6), (7) | VSIX ships the resolved sets, not `file-src`; 1.2.1 `witchy-*.svg` and definitions deleted | 6, 7 | `.vscodeignore` `icons/file-src/**`; 12 files removed and a test fails if one returns. |
| G32 | The pushpin for `pinned` | 15 | `tabs` pins `LICENSE` and waits for `.tab.sticky:not(.dirty) > .tab-actions .codicon-pinned` on it. |
| G34 | Four symbol shares pinned; the next gate job must wait for them | 15 | `symbols` scene on `fixtures/pins.grimoire`; the test reads `PINNED_AFTER_GATE_4_RUN` (comment updated). |
| G39 | `symbol-file` and `symbol-folder` stay mapped | 3, 4 | `parchment` and `folder` are those product glyphs split into outline and accent; a test fails if either stops matching. |

## File structure

Created:

- `scripts/lib/file-icon-palette.mjs` (Task 1), `scripts/file-glyphs/parts.mjs` (Tasks 2, 3), `scripts/lib/checks/file-icon-pipeline.mjs` (Tasks 2, 8), `scripts/file-glyphs/defaults.mjs`, `scripts/file-glyphs/index.mjs`, `scripts/draw-file-icons.mjs` (Task 4), `scripts/lib/supersample.mjs`, `scripts/lib/file-icon-backdrops.mjs`, `scripts/lib/file-icon-sheet.mjs`, `scripts/render-file-icon-sheet.mjs` (Task 5), `scripts/lib/file-icons-build.mjs`, `scripts/build-file-icons.mjs`, `icons/file-icon-map.json` (Task 6).
- `scripts/file-glyphs/folders.mjs` (Task 9), `scripts/file-glyphs/code.mjs` (Tasks 10, 11), `scripts/file-glyphs/data.mjs` (Task 12), `scripts/file-glyphs/docs.mjs` (Task 13).
- `icons/file-src/*.svg` (9 sources, generated: Tasks 4, 9-13) and `icons/file-icons/{dark,light,high-contrast}/*.svg` (27 resolved SVGs, generated: Tasks 6, 9-13).
- `scripts/review/waits.mjs`, `scripts/review/workspace.mjs` (Task 14); `review/workspace-files/` (105 files) and `review/jobs/gate-5.json` (Task 15).
- Tests: `test/file-icon-palette.test.mjs` (Task 1), `test/file-glyph-parts.test.mjs` (Tasks 2, 3), `test/file-glyph-defaults.test.mjs`, `test/file-glyph-drift.test.mjs` (Task 4), `test/file-icon-sheet.test.mjs` (Task 5), `test/file-icons-build.test.mjs` (Tasks 6, 13), `test/file-glyph-folders.test.mjs` (Task 9), `test/file-glyph-code.test.mjs` (Tasks 10, 11), `test/file-glyph-data.test.mjs` (Task 12), `test/file-glyph-docs.test.mjs` (Task 13), `test/review-workspace.test.mjs` (Tasks 14, 15).
- `docs/qa/2.0-gate-5/` (Task 16): README, manifest, six contact sheets, `file-icon-sheet@1x.png`, `file-icon-sheet@2x.png`.

Modified:

- `package.json` scripts: `draw:file-icons` (Task 4), `file-icon-sheet` (Task 5), `build:file-icons` and `build` (Task 6), `test` (Task 15).
- `icons/file-icon-theme.json` (regenerated: Tasks 6, 9-13), `icons/README.md` (Task 6), `scripts/lib/file-icon-requirements.mjs` and `scripts/lib/checks/file-icons.mjs` (Task 6, `REQUIRED_LANGUAGE_IDS`), `.vscodeignore` (Task 7), `scripts/validate.mjs`, `scripts/validation-stage.json` (Task 8), `scripts/file-glyphs/index.mjs` (Tasks 9, 10, 12, 13), `icons/file-icon-map.json` (Tasks 9-13).
- `scripts/review/run-gate.mjs` (Task 14: `resolveWaits`, `workspaceOf` before the build, `prepareWorkspace`), `scripts/review/contact-sheet.mjs` (Task 14: grayscale columns, `close` in `finally`), `scripts/review/capture.mjs` (Task 14: `PARK_POINT`), `review/profile/settings.base.json` (Task 14), `review/jobs/gate-4.json` (Task 14: 12 quick-input waits), `review/profile/keybindings.json` (Task 15: `alt+shift+F7`/`F8`/`F9`), `.gitignore` (Task 15).
- Tests: `test/file-icon-checks.test.mjs` (Tasks 2, 6, 8), `test/package-contents.test.mjs` (Task 7), `test/review-args.test.mjs` (Task 14), `test/review-harness.test.mjs` (Tasks 14, 15).

Deleted: `icons/witchy-{code,css,data,file,folder,javascript,json,python,style,test,typescript,yaml}.svg` (Task 6).

Not committed (git-ignored): `review-out/g5-pipeline/` (prototype renders), `review-out/g5-sample/` (`sketch.mjs`, `compose.py`, `badge-tab.mjs`, `gem-language.mjs`, `lineup.mjs`, their JSON and PNGs), `review-out/file-icon-sheet/`, `review-out/g5-harness/`, snapshots in `review-out/g5/`, dry runs under `review-out/`.

## Staging: how the file icons count down

`npm test` totals are real-repo values. `file-icons` is the pending count from `node scripts/validate.mjs 2>&1 | grep '^…'` (the dark-set keys still missing per property in brackets: fileExtensions / fileNames / folderNames / folderNamesExpanded / languageIds, from `--verbose`; `light` and `highContrast` the same). Resolved SVGs are the files in `icons/file-icons/`; sheet SVGs the count `npm run file-icon-sheet` prints; F9 the `^⚠ F9` lines.

| After | `npm test` tests | Stages enforced | `file-icons` pending | Sources / map drawings | Resolved SVGs | Sheet SVGs | F9 warnings |
| :- | :- | :- | :- | :- | :- | :- | :- |
| HEAD | 410 | base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug, product-batch:editor, product-batch:symbols | 19 (1.2.1 theme) | 0 / – | – (12 `witchy-*.svg`) | – | – |
| Task 1 | 415 | same | 19 | 0 / – | – | – | – |
| Task 2 | 421 | same | 19 | 0 / – | – | – | – |
| Task 3 | 425 | same | 19 | 0 / – | – | – | – |
| Task 4 | 433 | same | 19 | 3 / – | – | – | – |
| Task 5 | 437 | same | 19 | 3 / – | – | 33 | – |
| Task 6 | 444 | same | 15 (57/27/19/19/11) | 3 / 3 | 9 | 33 | – |
| Task 7 | 445 | same | 15 | 3 / 3 | 9 | 33 | – |
| Task 8 | 453 | + file-icons:pipeline | 15 (57/27/19/19/11) | 3 / 3 | 9 | 33 | 3 |
| Task 9 | 459 | same | 15 (57/27/17/17/11) | 5 / 5 | 15 | 39 | 6 |
| Task 10 | 464 | same | 15 (54/27/17/17/10) | 6 / 6 | 18 | 42 | 6 |
| Task 11 | 467 | same | 15 (52/27/17/17/9) | 7 / 7 | 21 | 45 | 6 |
| Task 12 | 471 | same | 15 (50/27/17/17/7) | 8 / 8 | 24 | 48 | 9 |
| Task 13 | 477 | same | 15 (50/25/17/17/7) | 9 / 9 | 27 | 51 | 12 |
| Task 14 | 483 | same | 15 | 9 / 9 | 27 | 51 | 12 |
| Task 15 | 492 | same | 15 | 9 / 9 | 27 | 51 | 12 |

`release (2)` stays pending throughout; the summary line reads `… 21 pending problems … release (2), file-icons (19)` until Task 6 and `… 17 pending problems … release (2), file-icons (15)` from then on. `file-icons` goes from 19 to 15 lines in Task 6 (the 1.2.1 colour and set-shape problems go; each set now lists five missing key properties, one line per set and property, 5 × 3) and stays 15 while any key of a property is missing, so the sample shortens the lines without removing one. The D11 `languageIds` line loses `typescript` (Task 10), `python` (Task 11), `json` and `jsonc` (Task 12). Keys per property in the built theme (`npm run build:file-icons`): Task 9 `0/0/2/2/0`, Task 10 `3/0/2/2/1`, Task 11 `5/0/2/2/2`, Task 12 `7/0/2/2/4`, Task 13 `7/2/2/2/4`.

---

## Before Task 1

The author commits this plan on `spellbound-2.0` before Task 1 starts. Executors do not make that commit. Check it:

Run: `git status --short | wc -l && git log -1 --format=%s -- docs/superpowers/plans/2026-10-11-spellbound-2-gate-5.md`
Expected: `0`, then the subject of the author's commit. If the first line is not `0`, stop and ask the author: an uncommitted plan would end up in Task 1's snapshot.

Run: `git worktree list | wc -l`
Expected: `1` (the main repo only). The planning worktrees under `.claude/worktrees/` are removed before execution; if any other worktree is listed, stop and ask the author.

Then check the tools the plan needs: `node --version` (v24), `agent-browser --version` (0.38.1), `python3 -c "import PIL"` and `tesseract --version` (the reference crops and the privacy scan fail without them). Task 1 Step 1 checks the base itself (`npm test` 410, the 1.2.1 icons, the pending stages).

---

## Part A: the file-icon pipeline and the default drawings

Part A builds the pipeline of spec 6.1 and draws the three defaults of spec 6.2 (`parchment`, `folder`, `folder-open`). Drawings are code in `scripts/file-glyphs/` with role tokens instead of hex values (`fill="{muted}"`); `npm run draw:file-icons` writes the committed sources to `icons/file-src/`; `scripts/lib/file-icon-palette.mjs` is the one colour table; `icons/file-icon-map.json` maps drawings to keys; `npm run build:file-icons` resolves every source into `icons/file-icons/{dark,light,high-contrast}/` and regenerates `icons/file-icon-theme.json` (also run by `npm run build`). The 1.2.1 `icons/witchy-*.svg` are deleted. The new stage `file-icons:pipeline` (spec 8) is enforced from Task 8; the full-coverage stage `file-icons` stays pending until gate 6. `npm run file-icon-sheet` is the review sheet every drawing task runs (the file-icon sheet procedure, Global Constraints).

What Part B consumes, by name: `ROLES`, `PALETTE`, `SETS`, `SET_DIRS`, `resolveSource` (palette); `painted`, `fileIconDocument`, `folderBody`, `BADGE_BOX` (parts); `fileGlyphModules` (index, Part B appends `folders, code, data, docs`); the map format; `fileGlyphProblems` (every drawing passes it with no warning, through the drift test).

The defaults reuse the approved gate-4 product glyphs: `parchment` is the product `page` (`symbol-file`) and `folder` the product `folder` (`symbol-folder`), each split into an outline part and the filled accent, and a test fails if either stops matching. A tree then shows the same file and folder whether VS Code draws them from this file icon theme or, with another file icon theme or none, from the product icons (breadcrumbs, quick open).

**Measured totals.** Every count below was measured by applying the plan in order (Global Constraints); the lines grep `ℹ tests` and `ℹ fail`, which read the same with or without the `../witchyterm` sibling.

**Scratch files.** Prototype renders live in `review-out/g5-pipeline/` (git-ignored); the sheet writes `review-out/file-icon-sheet/`. Scratch files are never named like a test.

---

### Task 1: The file-icon palette

**Files:**
- Create: `scripts/lib/file-icon-palette.mjs`, `test/file-icon-palette.test.mjs`

**Interfaces:**
- Consumes: `contrast` from `src/color.mjs`; `SIDEBARS` from `scripts/lib/file-icon-requirements.mjs` (the three sidebars of spec 6, already pinned there; never copied); the color theme files (`charts.blue`, F8).
- Produces: `ROLES`, `PALETTE`, `SETS`, `SET_DIRS` (all frozen) and `resolveSource(svg, set)`, which Tasks 5, 6 and 8 and Part B use.

- [ ] **Step 1: Check the preconditions**

```bash
ls icons/witchy-*.svg | wc -l
ls scripts/file-glyphs icons/file-src 2>&1 | grep -c 'No such file'
node scripts/validate.mjs 2>&1 | grep -E '^…'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `12`; `2`; `… 21 pending problems in stages not yet enforced: release (2), file-icons (19) (use --verbose to list)`; `ℹ tests 410`, `ℹ fail 0`. If any line differs, stop: the base is not the approved gate 4.

- [ ] **Step 2: Write the failing test**

Create `test/file-icon-palette.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { contrast } from '../src/color.mjs';
import { SIDEBARS } from '../scripts/lib/file-icon-requirements.mjs';
import { PALETTE, ROLES, SETS, SET_DIRS, resolveSource } from '../scripts/lib/file-icon-palette.mjs';

const themeColours = (file) => JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '..', 'themes', file), 'utf8')).colors;

test('eight roles and three sets, frozen; the highContrast set is written to high-contrast/', () => {
  assert.deepEqual(ROLES, ['code', 'data', 'style', 'tests', 'config', 'docs', 'assets', 'muted']);
  assert.deepEqual(SETS, ['dark', 'light', 'highContrast']);
  assert.deepEqual(SET_DIRS, { dark: 'dark', light: 'light', highContrast: 'high-contrast' });
  for (const value of [ROLES, SETS, SET_DIRS, PALETTE, ...Object.values(PALETTE)]) assert.ok(Object.isFrozen(value));
});

test('the palette is the table of spec section 6, with the assets blues of F8 and muted on the config values', () => {
  assert.deepEqual(PALETTE, {
    dark: { code: '#B99AFF', data: '#FFD477', style: '#FF67B7', tests: '#74E8B8', config: '#A99AB9', docs: '#F3EAF7', assets: '#77D9FF', muted: '#A99AB9' },
    light: { code: '#7042B2', data: '#8A4D00', style: '#B52776', tests: '#0E7553', config: '#735F7D', docs: '#3B2A47', assets: '#176B9A', muted: '#735F7D' },
    highContrast: { code: '#D0B8FF', data: '#FFE38A', style: '#FF67B7', tests: '#74E8B8', config: '#A99AB9', docs: '#FFFFFF', assets: '#77D9FF', muted: '#A99AB9' },
  });
  for (const set of SETS) assert.deepEqual(Object.keys(PALETTE[set]), ROLES, set);
});

test('F8: assets is each theme\'s blue role (charts.blue of Moonlit Candle, Daydream and Coven Contrast)', () => {
  assert.equal(PALETTE.dark.assets, themeColours('WitchyNibbles-color-theme-moonlit-candle.json')['charts.blue']);
  assert.equal(PALETTE.light.assets, themeColours('WitchyNibbles-color-theme-light.json')['charts.blue']);
  assert.equal(PALETTE.highContrast.assets, themeColours('WitchyNibbles-color-theme-high-contrast.json')['charts.blue']);
});

test('every palette colour reaches 3:1 on its set\'s sidebar (spec section 6)', () => {
  const low = [];
  for (const set of SETS) {
    for (const [role, hex] of Object.entries(PALETTE[set])) {
      const ratio = contrast(hex, SIDEBARS[set]);
      if (ratio < 3) low.push(`${set} ${role} ${hex} ${ratio.toFixed(2)}:1`);
    }
  }
  assert.deepEqual(low, []);
  const weakest = Math.min(...SETS.flatMap((set) => Object.values(PALETTE[set]).map((hex) => contrast(hex, SIDEBARS[set]))));
  assert.ok(weakest >= 3, `weakest ${weakest.toFixed(2)}:1`);
});

test('resolveSource puts the set\'s hex in place of every role token and throws on an unknown role', () => {
  const source = '<svg viewBox="0 0 16 16"><path fill="{muted}" d="M0 0Z"/><path fill="{data}" d="M1 1Z"/><path fill="{muted}" d="M2 2Z"/></svg>';
  assert.equal(resolveSource(source, 'light'), '<svg viewBox="0 0 16 16"><path fill="#735F7D" d="M0 0Z"/><path fill="#8A4D00" d="M1 1Z"/><path fill="#735F7D" d="M2 2Z"/></svg>');
  assert.equal(resolveSource(source, 'highContrast').includes('{'), false);
  assert.throws(() => resolveSource('<path fill="{gold}"/>', 'dark'), /unknown file-icon role \{gold\}/i);
  assert.throws(() => resolveSource('<path fill="{muted}"/>', 'sepia'), /unknown file-icon set sepia/i);
});
```

Run: `node --test test/file-icon-palette.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/scripts/lib/file-icon-palette.mjs'`, then `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1`.

- [ ] **Step 3: Write the palette**

Create `scripts/lib/file-icon-palette.mjs`:

```js
// Spec section 6: the one colour table of the file icons. Sources carry role tokens (`fill="{code}"`) instead of hex
// values; the build resolves each source into the dark (Moonlit Candle and Moonlit), light (Daydream) and highContrast
// (Coven Contrast) sets (section 6.1, F3, F6). Assets is each theme's blue role (F8); muted takes the config values.
const freezeAll = (sets) => Object.freeze(Object.fromEntries(Object.entries(sets).map(([set, roles]) => [set, Object.freeze(roles)])));

export const ROLES = Object.freeze(['code', 'data', 'style', 'tests', 'config', 'docs', 'assets', 'muted']);
export const SETS = Object.freeze(['dark', 'light', 'highContrast']);
export const SET_DIRS = Object.freeze({ dark: 'dark', light: 'light', highContrast: 'high-contrast' });
export const PALETTE = freezeAll({
  dark: { code: '#B99AFF', data: '#FFD477', style: '#FF67B7', tests: '#74E8B8', config: '#A99AB9', docs: '#F3EAF7', assets: '#77D9FF', muted: '#A99AB9' },
  light: { code: '#7042B2', data: '#8A4D00', style: '#B52776', tests: '#0E7553', config: '#735F7D', docs: '#3B2A47', assets: '#176B9A', muted: '#735F7D' },
  highContrast: { code: '#D0B8FF', data: '#FFE38A', style: '#FF67B7', tests: '#74E8B8', config: '#A99AB9', docs: '#FFFFFF', assets: '#77D9FF', muted: '#A99AB9' },
});

// Every `{…}` in the source is a role token; anything that is not one of the eight roles is an error, never left in.
export function resolveSource(svg, set) {
  const colours = PALETTE[set];
  if (!colours) throw new Error(`Unknown file-icon set ${set}`);
  return svg.replace(/\{([^{}]*)\}/g, (token, role) => {
    if (!ROLES.includes(role)) throw new Error(`Unknown file-icon role ${token}`);
    return colours[role];
  });
}
```

Run:

```bash
node --test test/file-icon-palette.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `ℹ tests 5`, `ℹ pass 5`, `ℹ fail 0`; `ℹ tests 415`, `ℹ fail 0`. The weakest palette colour on its sidebar is the `light` tests mint, `#0E7553` at 5.11:1 on `#F8F0FB` (dark: muted and config 7.29:1; highContrast: style 7.88:1).

- [ ] **Step 4: Snapshot the tree**

Run: `mkdir -p review-out/g5 && git add -A && git write-tree | tee review-out/g5/TREE_1`
Expected: one 40-character tree id, also saved in `review-out/g5/TREE_1`.

### Task 2: Painted parts, the file-icon document and the source rules

**Files:**
- Create: `scripts/file-glyphs/parts.mjs`, `scripts/lib/checks/file-icon-pipeline.mjs`, `test/file-glyph-parts.test.mjs`
- Modify: `test/file-icon-checks.test.mjs`

**Interfaces:**
- Consumes: `ROLES` (Task 1); `parseGlyphSvg`, `windingProblems`, `offGridPoints` from `scripts/lib/svg-geometry.mjs`.
- Produces: `painted(role, ...ds)` and `fileIconDocument(...parts)` in `scripts/file-glyphs/parts.mjs`; `fileGlyphProblems(svg)` → `{ errors, warnings }` in `scripts/lib/checks/file-icon-pipeline.mjs` (the source rules of spec 8; the drift test of Task 4 and the stage of Task 8 apply it).

The product rule check (`glyphRuleProblems`) cannot be reused as it is: it checks winding across all paths of a glyph, and a file icon is several fills painted in order, so an accent painted over another part would read as a same-wound hole. `fileGlyphProblems` checks holes per part, and is stricter on the markup: `<path fill="{role}" d="…">` and nothing else, so `opacity`, `fill-opacity`, `stroke`, `transform`, `fill-rule`, `style` and gradients (spec 6.2, 8) cannot appear.

- [ ] **Step 1: Write the failing tests**

Create `test/file-glyph-parts.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { rect } from '../scripts/glyphs/primitives.mjs';
import { fileIconDocument, painted } from '../scripts/file-glyphs/parts.mjs';

test('painted joins its path data, nested lists included, under one role', () => {
  assert.deepEqual(painted('muted', rect(1, 1, 2, 2), [rect(4, 4, 2, 2), [rect(8, 8, 2, 2)]]), { role: 'muted', d: 'M1 1L3 1L3 3L1 3ZM4 4L6 4L6 6L4 6ZM8 8L10 8L10 10L8 10Z' });
});

test('fileIconDocument writes one <path> per painted part, in paint order, with the role token as its fill and no other attribute', () => {
  const svg = fileIconDocument(painted('muted', rect(2, 2, 4, 4)), [painted('data', rect(8, 8, 3, 3))]);
  assert.equal(svg, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{muted}" d="M2 2L6 2L6 6L2 6Z"/><path fill="{data}" d="M8 8L11 8L11 11L8 11Z"/></svg>\n');
});

test('fileIconDocument refuses an unknown role, an empty part and a document with no part', () => {
  assert.throws(() => fileIconDocument(painted('gold', rect(1, 1, 2, 2))), /unknown file-icon role gold/i);
  assert.throws(() => fileIconDocument(painted('muted')), /muted part has no path data/);
  assert.throws(() => fileIconDocument(), /at least one painted part/);
});
```

In `test/file-icon-checks.test.mjs`, add below the `checkFileIconTheme` import:

```js
import { fileGlyphProblems } from '../scripts/lib/checks/file-icon-pipeline.mjs';
```

and append:

```js
// ---- file-icons:pipeline (gate 5) ----
const doc = (paths, svgAttributes = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"') => `<svg ${svgAttributes}>${paths}</svg>\n`;
const square = 'M2 2L14 2L14 14L2 14Z';
const squareHole = 'M2 2L14 2L14 14L2 14ZM4 4L4 12L12 12L12 4Z';

test('file-glyph source rules: a fileIconDocument with role tokens and real holes passes clean', () => {
  assert.deepEqual(fileGlyphProblems(doc(`<path fill="{muted}" d="${squareHole}"/><path fill="{data}" d="M6 6L10 6L10 10L6 10Z"/>`)), { errors: [], warnings: [] });
});

test('file-glyph source rules (spec 8): role tokens only, the 16-unit viewBox, <svg> and <path> only, no opacity, real holes in each part', () => {
  const cases = [
    [doc(`<path fill="#B99AFF" d="${square}"/>`), ['part 1 fill "#B99AFF" is not a role token', 'uses hex colours (#B99AFF); paint with role tokens']],
    [doc(`<path fill="{gold}" d="${square}"/>`), ['part 1 fill "{gold}" is not a role token']],
    [doc(`<path fill="{muted}" d="${square}"/>`, 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"'), ['viewBox must be "0 0 16 16"']],
    [doc(`<path fill="{muted}" d="${square}"/>`, 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"'), ['must not set width or height on <svg>', '<svg> takes only xmlns and viewBox (found width, height)']],
    [doc(`<path fill="{muted}" opacity="0.5" fill-opacity="0.5" d="${square}"/>`), ['<path> takes only fill and d (found opacity, fill-opacity)']],
    [doc(`<linearGradient id="g"/><path fill="{muted}" d="${square}"/><text>A</text>`), ['only <svg> and <path> elements are allowed (found lineargradient, text)']],
    [doc(`<path fill="{muted}" d="M2 2L14 2L14 14L2 14ZM4 4L12 4L12 12L4 12Z"/>`), ['part 1 ({muted}): subpath around (8, 8) is wound the same way as its container, so it renders solid']],
    [doc(''), ['contains no <path>']],
  ];
  for (const [svg, errors] of cases) assert.deepEqual(fileGlyphProblems(svg).errors, errors, svg);
});

test('file-glyph source rules: holes are checked per part, so an accent painted over another part is not a winding error', () => {
  assert.deepEqual(fileGlyphProblems(doc(`<path fill="{muted}" d="${square}"/><path fill="{data}" d="M6 6L10 6L10 10L6 10Z"/>`)).errors, []);
  assert.deepEqual(fileGlyphProblems(doc(`<path fill="{muted}" d="M2 2L14.2 2L14.2 14L2 14Z"/>`)).warnings, ['straight-segment points off the whole/half grid: (14.2, 2) (14.2, 14)']);
});
```

Run: `node --test test/file-glyph-parts.test.mjs test/file-icon-checks.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Cannot find module '…/scripts/file-glyphs/parts.mjs'` and `Cannot find module '…/scripts/lib/checks/file-icon-pipeline.mjs'`, then `ℹ tests 2`, `ℹ pass 0`, `ℹ fail 2`.

- [ ] **Step 2: Write the parts and the rule check**

Create `scripts/file-glyphs/parts.mjs`:

```js
// File-icon parts (spec 6.1, 6.2). A drawing is a list of painted parts, each one <path> filled with a role token
// (`{muted}`, `{code}` …) that the build resolves per set. Paint order is list order, so an accent comes last.
// Section-4 shapes come from scripts/glyphs/primitives.mjs; this module never copies them.
import { ROLES } from '../lib/file-icon-palette.mjs';

export const painted = (role, ...ds) => ({ role, d: ds.flat(Infinity).join('') });

export function fileIconDocument(...parts) {
  const list = parts.flat(Infinity);
  if (!list.length) throw new Error('A file-icon document needs at least one painted part');
  const paths = list.map(({ role, d }) => {
    if (!ROLES.includes(role)) throw new Error(`Unknown file-icon role ${role}`);
    if (!d) throw new Error(`The ${role} part has no path data`);
    return `<path fill="{${role}}" d="${d}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${paths.join('')}</svg>\n`;
}
```

Create `scripts/lib/checks/file-icon-pipeline.mjs`:

```js
// Stage `file-icons:pipeline` (spec 8, F3): the rules every file-icon source obeys.
import { ROLES } from '../file-icon-palette.mjs';
import { offGridPoints, parseGlyphSvg, windingProblems } from '../svg-geometry.mjs';

const attributeNames = (tag) => [...tag.matchAll(/([\w:-]+)\s*=/g)].map((match) => match[1]);

// Section 6.2 and 8: viewBox 0 0 16 16 with no size, only <svg> and <path>, <path fill="{role}" d="…"> and nothing
// else (so no opacity, fill-opacity, stroke, transform, fill-rule, style or gradient), no hex anywhere, and real holes.
// Holes are checked per part: each <path> is its own fill, and an accent painted over another part is not a hole.
export function fileGlyphProblems(svg) {
  const errors = [];
  const warnings = [];
  const parsed = parseGlyphSvg(svg);
  const svgTag = svg.match(/<svg\b([^>]*)>/i)?.[1] ?? '';
  if (parsed.viewBox !== '0 0 16 16') errors.push('viewBox must be "0 0 16 16"');
  if (parsed.width !== undefined || parsed.height !== undefined) errors.push('must not set width or height on <svg>');
  const extraSvg = attributeNames(svgTag).filter((name) => !['xmlns', 'viewBox'].includes(name));
  if (extraSvg.length) errors.push(`<svg> takes only xmlns and viewBox (found ${extraSvg.join(', ')})`);
  const others = [...new Set(parsed.elements.filter((name) => name !== 'svg' && name !== 'path'))];
  if (others.length) errors.push(`only <svg> and <path> elements are allowed (found ${others.join(', ')})`);
  const pathTags = [...svg.matchAll(/<path\b([^>]*?)\/?>/gi)].map((match) => match[1]);
  if (!pathTags.length) errors.push('contains no <path>');
  const extraPath = [...new Set(pathTags.flatMap((tag) => attributeNames(tag).filter((name) => !['fill', 'd'].includes(name))))];
  if (extraPath.length) errors.push(`<path> takes only fill and d (found ${extraPath.join(', ')})`);
  parsed.paths.forEach(({ fill, d }, index) => {
    const role = fill?.match(/^\{(\w+)\}$/)?.[1];
    if (!ROLES.includes(role)) errors.push(`part ${index + 1} fill "${fill}" is not a role token`);
    if (!d.trim()) errors.push(`part ${index + 1} has no path data`);
  });
  const hexes = [...new Set(svg.match(/#[0-9a-f]{3,8}\b/gi) ?? [])];
  if (hexes.length) errors.push(`uses hex colours (${hexes.join(', ')}); paint with role tokens`);
  try {
    parsed.paths.forEach(({ fill, d }, index) => {
      for (const problem of windingProblems([d])) errors.push(`part ${index + 1} (${fill}): ${problem}`);
    });
    const off = [...new Set(parsed.paths.flatMap(({ d }) => offGridPoints(d)).map(([x, y]) => `(${+x.toFixed(3)}, ${+y.toFixed(3)})`))];
    if (off.length) warnings.push(`straight-segment points off the whole/half grid: ${off.slice(0, 6).join(' ')}${off.length > 6 ? ' …' : ''}`);
  } catch (error) {
    errors.push(`path data could not be parsed: ${error.message}`);
  }
  return { errors, warnings };
}
```

Run:

```bash
node --test test/file-glyph-parts.test.mjs test/file-icon-checks.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `ℹ tests 12`, `ℹ pass 12`, `ℹ fail 0` (3 parts tests; 6 existing and 3 new checks tests); `ℹ tests 421`, `ℹ fail 0`.

- [ ] **Step 3: Snapshot the tree**

Run: `mkdir -p review-out/g5 && git add -A && git write-tree | tee review-out/g5/TREE_2`
Expected: one tree id.

### Task 3: The folder construction (`folderBody`, `BADGE_BOX`)

**Files:**
- Modify: `scripts/file-glyphs/parts.mjs`, `test/file-glyph-parts.test.mjs`

**Interfaces:**
- Consumes: `polygon` from `scripts/glyphs/primitives.mjs`; `drawings.folder` from `scripts/glyphs/editor.mjs` (the product `symbol-folder`, in the test only); `filledAt`, `outlineGap`, `parseGlyphSvg`, `pathBounds`, `subpaths`, `windingProblems`; `SVGPathData` (the test reads the straight segments' slopes).
- Produces: `BADGE_BOX` (frozen `{ x: 8, y: 8, w: 7, h: 7 }`) and `folderBody({ open = false, badge = false })` → `[body, tab]`, two `muted` painted parts with the tab painted last. Task 4 draws `folder` and `folder-open` from it; Part B appends a badge part in its category to `folderBody({ badge: true })` and `folderBody({ open: true, badge: true })`.

Construction (spec 6, 6.2; geometry measured and adjusted while drafting, see the notes):

- Closed: the product `symbol-folder` split in two. The body is x1-15, y2-14 overall (the 14×12 landscape keyline; spec 6.2 proposed a 14×11 body, here the body is y4-14 under a tab that rises to y2, which is the approved product silhouette), 1-unit walls, r1 outer corners. The tab, x1-8 and y2-6 with 45° shoulders, is the filled part. Body and tab meet only along x = 8 and y = 6, whole numbers, so separate `<path>` fills leave no anti-aliased seam.
- Open: the same tab, the back (top wall, right wall x13-14 down to y8) and a front flap, a parallelogram x1-15, y8-14 whose sides run at 2:1 (dy:dx) and are 1.5 units across horizontally (1.34 across the stroke, section 4's diagonal weight). Where the flap's left side meets the back's left wall the gap narrows under one unit, so the wedge below y10 is filled; above it the gap is 1 to 2 units.
- Badge: the walls stop one unit short of `BADGE_BOX` (nothing at x ≥ 7 and y ≥ 7). The cut ends are drawn as straight ends, not clipped with `knockOut`, because `knockOut` flattens the arcs of any subpath it touches into off-grid segments, which `fileGlyphProblems` warns about.

- [ ] **Step 1: Write the failing tests**

In `test/file-glyph-parts.test.mjs`, replace the import block with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { SVGPathData } from 'svg-pathdata';
import { rect } from '../scripts/glyphs/primitives.mjs';
import { BADGE_BOX, fileIconDocument, folderBody, painted } from '../scripts/file-glyphs/parts.mjs';
import { drawings as productGlyphs } from '../scripts/glyphs/editor.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths, windingProblems } from '../scripts/lib/svg-geometry.mjs';
```

and append:

```js
// ---- Folder construction (Task 3) ----
// Ink is compared on a 0.5 grid offset by 0.25, so no sample lands on an edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.25 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.25 + j / 2]));
const inkOf = (parts) => (point) => filledAt(parts.map((part) => part.d), point);
const differences = (a, b, keep = () => true) => SAMPLES.filter((point) => keep(point) && a(point) !== b(point)).map(String);
const knockedOut = ([x, y]) => x > BADGE_BOX.x - 1 && y > BADGE_BOX.y - 1; // the box and the 1-unit knockout around it
// Slopes of the straight segments (arcs left out), as |dy / dx|; horizontal and vertical segments are skipped.
const slopes = (d) => {
  const found = [];
  let pen = null;
  for (const command of new SVGPathData(d).toAbs().normalizeHVZ().commands) {
    if (command.type === SVGPathData.LINE_TO && pen[0] !== command.x && pen[1] !== command.y) found.push(Math.abs((command.y - pen[1]) / (command.x - pen[0])));
    if ('x' in command) pen = [command.x, command.y];
  }
  return found;
};
const probe = (parts, cases, label) => {
  for (const [point, filled] of cases) assert.equal(inkOf(parts)(point), filled, `${label} ${point}`);
};

test('BADGE_BOX is the 7x7 box at x8-15, y8-15 (spec 6.2)', () => {
  assert.deepEqual(BADGE_BOX, { x: 8, y: 8, w: 7, h: 7 });
  assert.ok(Object.isFrozen(BADGE_BOX));
});

test('folderBody(): a muted body then the filled muted tab, together the product symbol-folder glyph (x1-15, y2-14)', () => {
  const parts = folderBody();
  assert.deepEqual(parts.map((part) => part.role), ['muted', 'muted']);
  assert.deepEqual(differences(inkOf(parts), (point) => filledAt(parseGlyphSvg(productGlyphs.folder()).paths.map((path) => path.d), point)), []);
  assert.deepEqual(pathBounds(parts.map((part) => part.d)), { minX: 1, maxX: 15, minY: 2, maxY: 14 });
  probe([parts[1]], [[[3, 4], true], [[6.5, 3], true], [[7.5, 5], true], [[3, 6.5], false], [[10, 4.5], false]], 'tab');
  probe(parts, [[[10, 4.5], true], [[10, 5.5], false], [[14.5, 9], true], [[13.5, 9], false], [[8, 13.5], true], [[8, 12.5], false], [[1.5, 9], true], [[2.5, 9], false]], 'closed');
});

test('folderBody({ open: true }): the back, a front flap with 2:1 sides 1.5 units across, a real hole in it, the wedge below y10 filled', () => {
  const parts = folderBody({ open: true });
  assert.deepEqual(parts.map((part) => part.role), ['muted', 'muted']);
  assert.deepEqual(parts[1], folderBody()[1], 'the same tab as the closed folder');
  assert.deepEqual(pathBounds(parts.map((part) => part.d)), { minX: 1, maxX: 15, minY: 2, maxY: 14 });
  assert.deepEqual([...new Set(slopes(parts[0].d))], [2], 'every slanted edge of the body is 2:1');
  probe(parts, [
    [[10, 6.5], false], [[10, 8.5], true], [[8, 11], false], [[8, 13.5], true], // above the flap, its top edge, its hole, its bottom
    [[14.25, 8.5], true], [[14.75, 9], false], [[12.25, 11], true], [[13.25, 11], true], [[11.75, 11], false], [[13.75, 11], false], // right side x12-13.5 at y11
    [[4.75, 9.25], true], [[3.5, 9.5], true], [[2.75, 9], false], [[2.5, 11], true], [[1.5, 9], true], // left side, the open wedge above y10, the filled one below
    [[13.5, 6.5], true], [[12.5, 6.5], false], // the back's right wall, x13-14, behind the flap
  ], 'open');
  assert.equal(windingProblems(parts.map((part) => part.d)).length, 0);
});

test('folderBody({ badge: true }) is the same folder with everything within 1 unit of the badge box knocked out, the tab untouched', () => {
  const box = subpaths(rect(BADGE_BOX.x, BADGE_BOX.y, BADGE_BOX.w, BADGE_BOX.h));
  for (const open of [false, true]) {
    const [plain, badged] = [folderBody({ open }), folderBody({ open, badge: true })];
    assert.deepEqual(badged[1], plain[1], `open ${open}: the tab`);
    assert.deepEqual(differences(inkOf(plain), inkOf(badged), (point) => !knockedOut(point)), [], `open ${open}: unchanged outside the knockout`);
    assert.deepEqual(SAMPLES.filter((point) => knockedOut(point) && inkOf(badged)(point)).map(String), [], `open ${open}: nothing inside the knockout`);
    assert.equal(outlineGap(subpaths(badged[0].d), box), 1, `open ${open}: one unit from the box`);
  }
});
```

Run: `node --test test/file-glyph-parts.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|does not provide'`
Expected: `SyntaxError: The requested module '../scripts/file-glyphs/parts.mjs' does not provide an export named 'BADGE_BOX'`, then `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1`.

- [ ] **Step 2: Write the folder construction**

In `scripts/file-glyphs/parts.mjs`, add below the palette import:

```js
import { polygon } from '../glyphs/primitives.mjs';
```

and append:

```js
// ---- Folder construction (spec 6, 6.2) ----
// Folder badges sit in this 7x7 box in the lower right; the folder outline is knocked out 1 unit around it.
export const BADGE_BOX = Object.freeze({ x: 8, y: 8, w: 7, h: 7 });

// The folder is the product symbol-folder glyph (scripts/glyphs/editor.mjs) split into two muted parts, so a tree
// shows the same folder with or without this file icon theme: x1-15, y2-14 (the 14x12 landscape keyline), 1-unit walls,
// r1 outer corners. The tab, x1-8 and y2-6 with 45-degree shoulders, is the filled part (spec 6: the default folder's
// tab is filled) and is painted last; the body meets it only along x = 8 and y = 6, whole numbers, so the two parts
// leave no anti-aliased seam. The open folder keeps the tab and the back (top wall, right wall to y8) and adds the front
// flap: a parallelogram x1-15, y8-14 whose sides run at 2:1 and are 1.5 units across horizontally (1.34 across the
// stroke, section 4's diagonal weight). Where the flap's left side meets the back's left wall the gap narrows under 1
// unit, so the wedge below y10 is filled. `badge: true` cuts the walls back 1 unit short of BADGE_BOX (x >= 7, y >= 7);
// the cut ends are drawn, not clipped, so the corner arcs stay arcs.
const TAB = 'M1 3A1 1 0 0 1 2 2H6L8 4V5L7 6H1Z';
const BODY = {
  closed: ['M8 4H14A1 1 0 0 1 15 5V13A1 1 0 0 1 14 14H2A1 1 0 0 1 1 13V6H2V13H14V5H8Z'],
  closedBadge: ['M8 4H14A1 1 0 0 1 15 5V7H14V5H8Z', 'M1 6H2V13H7V14H2A1 1 0 0 1 1 13Z'],
  open: ['M8 4H13A1 1 0 0 1 14 5V8H13V5H8Z', 'M1 6H2V10H3L4 8H15L12 14H2A1 1 0 0 1 1 13Z', polygon([[5, 9], [13, 9], [11, 13], [3, 13]], 'ccw')],
  openBadge: ['M8 4H13A1 1 0 0 1 14 5V7H13V5H8Z', 'M1 6H2V10H3L4 8H7V9H5L3 13H7V14H2A1 1 0 0 1 1 13Z'],
};

export function folderBody({ open = false, badge = false } = {}) {
  const body = BODY[`${open ? 'open' : 'closed'}${badge ? 'Badge' : ''}`];
  return [painted('muted', body), painted('muted', TAB)];
}
```

Run:

```bash
node --test test/file-glyph-parts.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `ℹ tests 7`, `ℹ pass 7`, `ℹ fail 0`; `ℹ tests 425`, `ℹ fail 0`.

The open-folder probes fail if the flap's sides are drawn 1 unit across instead of 1.5 (checked while drafting: replacing the flap hole with `[[4.5, 9], [13.5, 9], [11.5, 13], [2.5, 13]]` fails 2 tests).

- [ ] **Step 3: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_3`
Expected: one tree id.

### Task 4: The default drawings, `npm run draw:file-icons` and the drift test

**Files:**
- Create: `scripts/file-glyphs/defaults.mjs`, `scripts/file-glyphs/index.mjs`, `scripts/draw-file-icons.mjs`, `test/file-glyph-defaults.test.mjs`, `test/file-glyph-drift.test.mjs`, `icons/file-src/{parchment,folder,folder-open}.svg` (generated)
- Modify: `package.json` (`draw:file-icons`)

**Interfaces:**
- Consumes: `polygon`; `painted`, `fileIconDocument`, `folderBody` (Tasks 2, 3); `fileGlyphProblems` (Task 2); `drawings.page` from `scripts/glyphs/editor.mjs` (test only).
- Produces: `drawings` in `scripts/file-glyphs/defaults.mjs` (`parchment`, `folder`, `folder-open`); `fileGlyphModules = [defaults]` in `scripts/file-glyphs/index.mjs` (Part B makes it `[defaults, folders, code, data, docs]`); `npm run draw:file-icons`, which writes `icons/file-src/<drawing>.svg` for every drawing, removes sources no module draws and refuses a name drawn twice.

`parchment` (default `file`; spec 6.2: muted portrait sheet x3-13 with a 4-unit folded corner, the fold the accent) is the product `page` split in two: the sheet, a C-shaped 1-unit outline x3-13, y1-15 with r1 corners, and the fold, solid x8-13, y1-6 under the 4-unit 45° edge (9,1)-(13,5), painted last. They meet along x = 8 and y = 6 only.

- [ ] **Step 1: Write the failing tests**

Create `test/file-glyph-defaults.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings } from '../scripts/file-glyphs/defaults.mjs';
import { fileIconDocument, folderBody } from '../scripts/file-glyphs/parts.mjs';
import { drawings as productGlyphs } from '../scripts/glyphs/editor.mjs';
import { filledAt, parseGlyphSvg, pathBounds } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by 0.25, so no sample lands on an edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.25 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.25 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ fill, d }));
const inkOf = (ds) => (point) => filledAt(ds, point);
const drawingInk = (name) => inkOf(partsOf(drawings[name]()).map((part) => part.d));
const differences = (a, b) => SAMPLES.filter((point) => a(point) !== b(point)).map(String);

test('the default drawings are parchment, folder and folder-open', () => {
  assert.deepEqual(Object.keys(drawings), ['parchment', 'folder', 'folder-open']);
});

test('parchment: a muted sheet x3-13, y1-15 and the muted fold painted last, together the product symbol-file page', () => {
  const [sheet, fold] = partsOf(drawings.parchment());
  assert.deepEqual([sheet.fill, fold.fill], ['{muted}', '{muted}']);
  assert.deepEqual(pathBounds([sheet.d, fold.d]), { minX: 3, maxX: 13, minY: 1, maxY: 15 });
  assert.deepEqual(differences(inkOf([sheet.d, fold.d]), inkOf(parseGlyphSvg(productGlyphs.page()).paths.map((path) => path.d))), []);
  assert.deepEqual(pathBounds([fold.d]), { minX: 8, maxX: 13, minY: 1, maxY: 6 }, 'the fold: 5x5 with a 4-unit 45-degree edge');
  for (const [point, filled] of [[[10, 4], true], [[12.5, 5.5], true], [[8.5, 1.5], true], [[12, 2], false], [[10.5, 1.5], false]]) {
    assert.equal(inkOf([fold.d])(point), filled, `fold ${point}`);
  }
  for (const [point, filled] of [[[3.5, 8], true], [[4.5, 8], false], [[12.5, 10], true], [[11.5, 10], false], [[8, 14.5], true], [[8, 13.5], false], [[6, 1.5], true], [[6, 2.5], false], [[10, 6.5], false]]) {
    assert.equal(drawingInk('parchment')(point), filled, `parchment ${point}`);
  }
});

test('folder and folder-open are the folder construction, closed and open, with no badge', () => {
  assert.equal(drawings.folder(), fileIconDocument(folderBody()));
  assert.equal(drawings['folder-open'](), fileIconDocument(folderBody({ open: true })));
});

test('folder and folder-open differ in silhouette (the front flap), not only inside', () => {
  const changed = differences(drawingInk('folder'), drawingInk('folder-open'));
  assert.ok(changed.length >= 100, `${changed.length} of 1024 samples differ (145 as drawn)`);
  assert.ok(changed.some((point) => point === '14.75,9.25'), 'the flap leaves the closed folder\'s right wall');
});
```

Create `test/file-glyph-drift.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileGlyphModules } from '../scripts/file-glyphs/index.mjs';
import { fileGlyphProblems } from '../scripts/lib/checks/file-icon-pipeline.mjs';

const sources = path.resolve(import.meta.dirname, '..', 'icons', 'file-src');
const names = fileGlyphModules.flatMap(({ drawings }) => Object.keys(drawings));

test('icons/file-src holds exactly one source per drawing, and no drawing name is used twice', () => {
  assert.equal(new Set(names).size, names.length);
  assert.deepEqual(fs.readdirSync(sources).sort(), names.map((name) => `${name}.svg`).sort());
});

for (const { drawings } of fileGlyphModules) {
  for (const [name, draw] of Object.entries(drawings)) {
    test(`file drawing ${name}: committed source matches the generator and passes the file-glyph rules with no warning`, () => {
      const svg = draw();
      assert.deepEqual(fileGlyphProblems(svg), { errors: [], warnings: [] });
      assert.equal(fs.readFileSync(path.join(sources, `${name}.svg`), 'utf8'), svg, 'run npm run draw:file-icons');
    });
  }
}
```

Run: `node --test test/file-glyph-defaults.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Cannot find module '…/scripts/file-glyphs/defaults.mjs'` and `Cannot find module '…/scripts/file-glyphs/index.mjs'`, then `ℹ tests 2`, `ℹ pass 0`, `ℹ fail 2`.

- [ ] **Step 2: Write the defaults, the module list and the draw script**

Create `scripts/file-glyphs/defaults.mjs`:

```js
// The defaults (spec 6, 6.2): what every file and folder shows when no other entry matches. All muted.
import { polygon } from '../glyphs/primitives.mjs';
import { fileIconDocument, folderBody, painted } from './parts.mjs';

export const drawings = {};

// parchment (default `file`): the product symbol-file page split into two muted parts, so a file looks the same with or
// without this file icon theme. The sheet: x3-13, y1-15 (inside the 12x14 portrait keyline), 1-unit walls, r1 corners.
// The fold, painted last, is the accent (spec 6.2): solid x8-13, y1-6 under the 4-unit 45-degree edge (9,1)-(13,5),
// meeting the sheet only along x = 8 and y = 6, whole numbers, so the parts leave no anti-aliased seam.
drawings.parchment = () => fileIconDocument(
  painted('muted', 'M4 1H8V2H4V14H12V6H13V14A1 1 0 0 1 12 15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1Z'),
  painted('muted', polygon([[8, 1], [9, 1], [13, 5], [13, 6], [8, 6]])), // accent: the fold
);

// folder (default `folder`) and folder-open (default `folderExpanded`): the folder construction with no badge; the
// filled tab is the accent.
drawings.folder = () => fileIconDocument(folderBody());
drawings['folder-open'] = () => fileIconDocument(folderBody({ open: true }));
```

Create `scripts/file-glyphs/index.mjs`:

```js
import * as defaults from './defaults.mjs';

export const fileGlyphModules = [defaults];
```

Create `scripts/draw-file-icons.mjs`:

```js
// Writes one source per file drawing to icons/file-src/<drawing>.svg (spec 6.1) and removes sources no module draws.
import fs from 'node:fs';
import path from 'node:path';
import { fileGlyphModules } from './file-glyphs/index.mjs';

const dir = path.resolve(import.meta.dirname, '..', 'icons', 'file-src');
const entries = fileGlyphModules.flatMap(({ drawings }) => Object.entries(drawings));
const names = entries.map(([name]) => name);
const repeated = names.filter((name, index) => names.indexOf(name) !== index);
if (repeated.length) throw new Error(`File drawings named twice: ${[...new Set(repeated)].join(', ')}`);
fs.mkdirSync(dir, { recursive: true });
for (const [name, draw] of entries) fs.writeFileSync(path.join(dir, `${name}.svg`), draw());
const stale = fs.readdirSync(dir).filter((file) => !names.includes(file.replace(/\.svg$/, '')));
for (const file of stale) fs.rmSync(path.join(dir, file));
console.log(`Wrote ${entries.length} file-icon sources${stale.length ? `, removed ${stale.join(', ')}` : ''}`);
```

In `package.json` `scripts`, add after `"draw:glyphs"`:

```json
    "draw:file-icons": "node scripts/draw-file-icons.mjs",
```

Run: `node --test --test-reporter=tap test/file-glyph-defaults.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^not ok'`
Expected (the drawings pass; the sources are not written yet):

```
not ok 5 - icons/file-src holds exactly one source per drawing, and no drawing name is used twice
not ok 6 - file drawing parchment: committed source matches the generator and passes the file-glyph rules with no warning
not ok 7 - file drawing folder: committed source matches the generator and passes the file-glyph rules with no warning
not ok 8 - file drawing folder-open: committed source matches the generator and passes the file-glyph rules with no warning
```

- [ ] **Step 3: Draw the sources**

```bash
npm run draw:file-icons
node --test test/file-glyph-defaults.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/file-src/{parchment,folder,folder-open}.svg
```

Expected:
- `Wrote 3 file-icon sources`.
- `ℹ tests 8`, `ℹ pass 8`, `ℹ fail 0`; `ℹ tests 433`, `ℹ fail 0` (+8: 4 default tests, 1 file-list test, 3 drift cases).
- The sources are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{muted}" d="M4 1H8V2H4V14H12V6H13V14A1 1 0 0 1 12 15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1Z"/><path fill="{muted}" d="M8 1L9 1L13 5L13 6L8 6Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{muted}" d="M8 4H14A1 1 0 0 1 15 5V13A1 1 0 0 1 14 14H2A1 1 0 0 1 1 13V6H2V13H14V5H8Z"/><path fill="{muted}" d="M1 3A1 1 0 0 1 2 2H6L8 4V5L7 6H1Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{muted}" d="M8 4H13A1 1 0 0 1 14 5V8H13V5H8ZM1 6H2V10H3L4 8H15L12 14H2A1 1 0 0 1 1 13ZM3 13L11 13L13 9L5 9Z"/><path fill="{muted}" d="M1 3A1 1 0 0 1 2 2H6L8 4V5L7 6H1Z"/></svg>
```

The defaults are rendered and judged in Task 5, which writes the sheet that every drawing task uses.

- [ ] **Step 4: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_4`
Expected: one tree id.

### Task 5: The file-icon sheet, its 32× reference, and the judgement of the defaults

**Files:**
- Create: `scripts/lib/supersample.mjs`, `scripts/lib/file-icon-backdrops.mjs`, `scripts/lib/file-icon-sheet.mjs`, `scripts/render-file-icon-sheet.mjs`, `test/file-icon-sheet.test.mjs`
- Modify: `package.json` (`file-icon-sheet`)

**Interfaces:**
- Consumes: `subpaths` (svg-geometry); `composite` (`src/color.mjs`); `fileGlyphModules`; `PALETTE`, `ROLES`, `SET_DIRS`, `resolveSource`; the committed sources in `icons/file-src/`; `package.json` `contributes.themes` and the four color theme files.
- Produces: `coverage(ds, px, ss = 32)` (the 32×-supersampled reference: each pixel's area coverage with nonzero winding); `THEME_SETS` (`uiTheme` → set) and `themeBackdrops(colors)` → `{ sidebar, selection, quickInputFocus }` (Task 8's F9 warning uses both); `fileIconSheet({ root })` → `{ html, files }`; `npm run file-icon-sheet`, which writes `review-out/file-icon-sheet/index.html` and `svg/<set dir>/<drawing>.svg` beside it.

The sheet resolves the committed sources itself (not the built `icons/file-icons/`), so it works from Task 4 on; Task 8's stage proves the built sets equal a fresh resolve. It shows, for each color theme (its set from `uiTheme`): every drawing at 16 and 32px on the side bar, the active selection (`list.activeSelectionBackground`) and the focused quick-input row (`quickInputList.focusBackground`, which falls back to the active selection in Moonlit Candle, Moonlit and Daydream as in VS Code 1.141; Coven Contrast sets it, G29); then `parchment` re-resolved in each of the eight roles (the F9 evidence); then each 16px icon (16 device pixels at 1×, 32 at 2×), magnified 8×, as Chromium draws it beside the 32×-supersampled reference; and all of it again under `filter: grayscale(1)`. The reference is computed in Node (`coverage`) and composited in the page, so a 16px judgement never rests on Chromium's anti-aliasing alone (gate-4 lesson).

- [ ] **Step 1: Write the failing tests**

Create `test/file-icon-sheet.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { disc, rect } from '../scripts/glyphs/primitives.mjs';
import { ROLES } from '../scripts/lib/file-icon-palette.mjs';
import { THEME_SETS, themeBackdrops } from '../scripts/lib/file-icon-backdrops.mjs';
import { fileIconSheet } from '../scripts/lib/file-icon-sheet.mjs';
import { coverage } from '../scripts/lib/supersample.mjs';

const root = path.resolve(import.meta.dirname, '..');
const round = (values) => values.map((value) => Number(value.toFixed(3)));

test('the 32x reference: a whole-unit square covers its pixels fully, a half-unit offset covers half of each pixel it straddles', () => {
  const crisp = coverage([rect(2, 2, 1, 1)], 16);
  assert.equal(crisp[2 * 16 + 2], 1);
  assert.equal(crisp.reduce((sum, value) => sum + value, 0), 1);
  const straddling = round(coverage([rect(2.5, 2, 1, 1)], 16));
  assert.deepEqual([straddling[2 * 16 + 2], straddling[2 * 16 + 3]], [0.5, 0.5]);
  assert.deepEqual(round(coverage([rect(2.5, 2, 1, 1)], 32)).slice(4 * 32 + 4, 4 * 32 + 8), [0, 1, 1, 0], 'at 2x the same square is crisp');
});

test('the 32x reference fills with nonzero winding: a counter-wound hole is empty, a same-wound inner square stays ink', () => {
  const hole = coverage([rect(2, 2, 12, 12), rect(4, 4, 8, 8, 'ccw')], 16);
  const solid = coverage([rect(2, 2, 12, 12), rect(4, 4, 8, 8)], 16);
  assert.deepEqual([hole[8 * 16 + 8], solid[8 * 16 + 8], hole[2 * 16 + 2]], [0, 1, 1]);
  const area = coverage([disc(8, 8, 4)], 16).reduce((sum, value) => sum + value, 0);
  assert.ok(Math.abs(area - Math.PI * 16) < 0.1, `a radius-4 disc covers ${area.toFixed(3)} pixels (arcs are flattened, 50.199 of 16π)`);
});

test('backdrops: the sidebar, the active selection and the quick-input focus of each color theme, with VS Code\'s fallbacks', () => {
  assert.deepEqual(THEME_SETS, { 'vs-dark': 'dark', vs: 'light', 'hc-black': 'highContrast' });
  assert.deepEqual(themeBackdrops({ 'sideBar.background': '#120C1F', 'list.activeSelectionBackground': '#633B79' }), { sidebar: '#120C1F', selection: '#633B79', quickInputFocus: '#633B79' });
  assert.deepEqual(themeBackdrops({ 'sideBar.background': '#000000', 'list.activeSelectionBackground': '#FF67B7', 'quickInputList.focusBackground': '#FFFFFF80' }), { sidebar: '#000000', selection: '#FF67B7', quickInputFocus: '#808080' });
  assert.deepEqual(themeBackdrops({ 'sideBar.background': '#F8F0FB', 'list.activeSelectionBackground': '#E9B5D899' }), { sidebar: '#F8F0FB', selection: '#EFCDE6', quickInputFocus: '#EFCDE6' });
});

test('the sheet shows every drawing in each theme\'s set at 16 and 32px on three backdrops, parchment in all eight roles, a grayscale copy and the reference', () => {
  const { html, files } = fileIconSheet({ root });
  const themes = ['WitchyNibbles Moonlit Candle', 'WitchyNibbles Moonlit', 'WitchyNibbles Daydream', 'WitchyNibbles Coven Contrast'];
  for (const label of themes) assert.ok(html.includes(label), label);
  for (const drawing of ['parchment', 'folder', 'folder-open']) {
    for (const set of ['dark', 'light', 'high-contrast']) assert.ok(`svg/${set}/${drawing}.svg` in files, `${set}/${drawing}`);
  }
  for (const role of ROLES) assert.ok(`svg/dark/role-${role}.svg` in files && html.includes(`parchment as ${role}`), role);
  assert.match(files['svg/light/role-style.svg'], /fill="#B52776"/);
  assert.equal(html.match(/class="sheet( gray)?"/g).length, 2, 'the colour sheet and its grayscale copy');
  assert.match(html, /\.gray\{filter:grayscale\(1\)\}/);
  assert.match(html, /id="reference"/);
});
```

Run: `node --test test/file-icon-sheet.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Cannot find module '…/scripts/lib/file-icon-backdrops.mjs'`, then `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1`.

- [ ] **Step 2: Write the reference, the backdrops and the sheet**

Create `scripts/lib/supersample.mjs`:

```js
// The reference a 16px render is judged against (spec 6.2): each pixel's area coverage, estimated with ss x ss samples
// per pixel (32x by default), filled with nonzero winding (the SVG default and the font pipeline's rule). Chromium's own
// anti-aliasing of a 16px fill is not the truth (gate-4 lesson), so drawings are judged against this.
import { subpaths } from './svg-geometry.mjs';

// ds: path data strings in the 16-unit viewBox. Returns px * px coverages (row-major, 0..1).
export function coverage(ds, px, ss = 32) {
  const edges = ds.flatMap((d) => subpaths(d)).flatMap((poly) => poly.map((point, index) => [point, poly[(index + 1) % poly.length]]));
  const samples = px * ss;
  const unit = 16 / samples;
  const hits = new Float64Array(px * px);
  for (let row = 0; row < samples; row += 1) {
    const y = (row + 0.5) * unit;
    const crossings = edges
      .filter(([[, y1], [, y2]]) => (y1 <= y && y < y2) || (y2 <= y && y < y1))
      .map(([[x1, y1], [x2, y2]]) => [x1 + ((y - y1) * (x2 - x1)) / (y2 - y1), y2 > y1 ? 1 : -1])
      .sort((a, b) => a[0] - b[0]);
    const base = Math.floor(row / ss) * px;
    let winding = 0;
    let next = 0;
    for (let column = 0; column < samples; column += 1) {
      const x = (column + 0.5) * unit;
      while (next < crossings.length && crossings[next][0] <= x) winding += crossings[next++][1];
      if (winding !== 0) hits[base + Math.floor(column / ss)] += 1;
    }
  }
  return Array.from(hits, (count) => count / (ss * ss));
}
```

Create `scripts/lib/file-icon-backdrops.mjs`:

```js
// The rows a file icon is drawn on in VS Code 1.141, per color theme (spec 6.3, 8, F9): the side bar, the active
// (focused) selection, and the focused quick-input row. A colour with alpha is composited over the surface it is
// drawn on: the list selection over the side bar, the quick-input focus over the quick input's own background.
import { composite } from '../../src/color.mjs';

// contributes.themes uiTheme -> file-icon set.
export const THEME_SETS = Object.freeze({ 'vs-dark': 'dark', vs: 'light', 'hc-black': 'highContrast' });

const toHex = (rgb) => `#${rgb.map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
const over = (colour, surface) => toHex(composite(colour, surface));

// quickInputList.focusBackground defaults to list.activeSelectionBackground in dark and light themes (VS Code's colour
// registry); high-contrast themes default to none, and Coven Contrast sets it (G29). The quick-input list sits on
// quickInput.background, not on the side bar; a theme that sets none falls back to the side bar here.
export function themeBackdrops(colors) {
  const sidebar = colors['sideBar.background'];
  const selection = colors['list.activeSelectionBackground'];
  return {
    sidebar: over(sidebar, sidebar),
    selection: over(selection, sidebar),
    quickInputFocus: over(colors['quickInputList.focusBackground'] ?? selection, colors['quickInput.background'] ?? sidebar),
  };
}
```

Create `scripts/lib/file-icon-sheet.mjs`:

```js
// The file-icon sheet (spec 6.3, F9): every resolved drawing at 16 and 32px on each color theme's side bar, active
// selection and quick-input focus; parchment re-resolved in each of the eight roles; a grayscale copy of all of it; and
// each 16px icon (16 device pixels at 1x, 32 at 2x) beside its 32x-supersampled reference, magnified 8x.
import fs from 'node:fs';
import path from 'node:path';
import { fileGlyphModules } from '../file-glyphs/index.mjs';
import { THEME_SETS, themeBackdrops } from './file-icon-backdrops.mjs';
import { PALETTE, ROLES, SET_DIRS, resolveSource } from './file-icon-palette.mjs';
import { coverage } from './supersample.mjs';
import { parseGlyphSvg } from './svg-geometry.mjs';

const readJson = (root, relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const round = (values) => values.map((value) => Number(value.toFixed(3)));

export function fileIconSheet({ root }) {
  const themes = readJson(root, 'package.json').contributes.themes.map(({ label, uiTheme, path: themePath }) => {
    const colors = readJson(root, themePath).colors;
    const set = THEME_SETS[uiTheme];
    const text = colors['sideBar.foreground'];
    const selected = colors['list.activeSelectionForeground'] ?? text;
    return { label, set, dir: SET_DIRS[set], backdrops: themeBackdrops(colors), text, selected, focused: colors['quickInputList.focusForeground'] ?? selected };
  });
  const names = fileGlyphModules.flatMap(({ drawings }) => Object.keys(drawings));
  const sources = Object.fromEntries(names.map((name) => {
    const file = path.join(root, 'icons', 'file-src', `${name}.svg`);
    if (!fs.existsSync(file)) throw new Error(`${path.relative(root, file)} is missing: run npm run draw:file-icons`);
    return [name, fs.readFileSync(file, 'utf8')];
  }));
  const files = {};
  for (const set of Object.keys(SET_DIRS)) {
    for (const name of names) files[`svg/${SET_DIRS[set]}/${name}.svg`] = resolveSource(sources[name], set);
    for (const role of ROLES) files[`svg/${SET_DIRS[set]}/role-${role}.svg`] = resolveSource(sources.parchment.replace(/\{\w+\}/g, `{${role}}`), set);
  }
  const reference = Object.fromEntries(names.map((name) => {
    const parts = parseGlyphSvg(sources[name]).paths;
    return [name, { roles: parts.map(({ fill }) => fill.slice(1, -1)), 16: parts.map(({ d }) => round(coverage([d], 16))), 32: parts.map(({ d }) => round(coverage([d], 32))) }];
  }));

  const icon = (dir, file) => `<i class="i16" style="background-image:url(svg/${dir}/${file}.svg)"></i><i class="i32" style="background-image:url(svg/${dir}/${file}.svg)"></i>`;
  const cells = (file) => themes.map((t) => [[t.backdrops.sidebar, t.text], [t.backdrops.selection, t.selected], [t.backdrops.quickInputFocus, t.focused]]
    .map(([background, color]) => `<td style="background:${background};color:${color}">${icon(t.dir, file)}<span>Aa</span></td>`).join('')).join('');
  const rows = [
    ...names.map((name) => `<tr><th>${name}</th>${cells(name)}</tr>`),
    ...ROLES.map((role) => `<tr><th>parchment as ${role}</th>${cells(`role-${role}`)}</tr>`),
  ];
  const head = `<tr><th></th>${themes.map((t) => `<th colspan="3">${t.label}<small>${t.set} set · side bar · selected row · quick-input focus · 16 and 32px</small></th>`).join('')}</tr>`;
  const refRows = names.map((name) => `<tr><th>${name}</th>${themes.map((t, index) => ['browser', 'reference']
    .map((kind) => `<td style="background:${t.backdrops.sidebar}"><canvas data-kind="${kind}" data-drawing="${name}" data-theme="${index}"></canvas></td>`).join('')).join('')}</tr>`);
  const refHead = `<tr><th></th>${themes.map((t) => `<th colspan="2">${t.label}<small>16px as the browser draws it · 32x-supersampled reference</small></th>`).join('')}</tr>`;
  const sheet = (gray) => `<div class="sheet${gray ? ' gray' : ''}"><h2>${gray ? 'Grayscale' : 'Colour'}</h2>
<table>${head}${rows.join('\n')}</table>
<h3>16px icon (16 device pixels at 1×, 32 at 2×), magnified 8x</h3><table${gray ? '' : ' id="reference"'}>${refHead}${refRows.join('\n')}</table></div>`;
  const data = { themes: themes.map(({ set, dir, backdrops }) => ({ set, dir, sidebar: backdrops.sidebar })), palette: PALETTE, reference };
  const html = `<!doctype html><meta charset="utf-8"><title>File-icon sheet</title>
<style>body{margin:16px;font:12px system-ui;background:#fff;color:#222}h2{margin:16px 0 4px}h3{margin:12px 0 4px;font-size:13px}
table{border-collapse:collapse}th{text-align:left;padding:4px 8px;font-weight:600;vertical-align:middle}th small{display:block;font-weight:400;color:#666;max-width:220px}
td{padding:6px 8px;white-space:nowrap}td span{vertical-align:middle;font-size:13px}
.i16,.i32{display:inline-block;vertical-align:middle;margin-right:6px;background-repeat:no-repeat}.i16{width:16px;height:16px;background-size:16px 16px}.i32{width:32px;height:32px;background-size:32px 32px}
canvas{display:block;width:128px;height:128px;image-rendering:pixelated}.gray{filter:grayscale(1)}</style>
${sheet(false)}
${sheet(true)}
<script>
const DATA = ${JSON.stringify(data)};
const px = window.devicePixelRatio >= 2 ? 32 : 16;
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const pending = [];
for (const canvas of document.querySelectorAll('canvas[data-drawing]')) {
  const theme = DATA.themes[canvas.dataset.theme];
  const ref = DATA.reference[canvas.dataset.drawing];
  canvas.width = px; canvas.height = px;
  const ctx = canvas.getContext('2d');
  if (canvas.dataset.kind === 'reference') {
    const image = ctx.createImageData(px, px);
    for (let i = 0; i < px * px; i += 1) {
      let colour = rgb(theme.sidebar);
      ref[px].forEach((cover, part) => { const ink = rgb(DATA.palette[theme.set][ref.roles[part]]); colour = colour.map((c, k) => c * (1 - cover[i]) + ink[k] * cover[i]); });
      image.data.set([...colour.map(Math.round), 255], i * 4);
    }
    ctx.putImageData(image, 0, 0);
  } else {
    ctx.fillStyle = theme.sidebar; ctx.fillRect(0, 0, px, px);
    const svg = new Image();
    pending.push(new Promise((resolve) => { svg.onload = () => { ctx.drawImage(svg, 0, 0, px, px); resolve(); }; svg.onerror = resolve; }));
    svg.src = 'svg/' + theme.dir + '/' + canvas.dataset.drawing + '.svg';
  }
}
Promise.all(pending).then(() => { document.body.dataset.ready = 'yes'; });
</script>`;
  return { html, files };
}
```

Create `scripts/render-file-icon-sheet.mjs`:

```js
// Writes the file-icon sheet (spec 6.3) to review-out/file-icon-sheet/index.html with the resolved SVGs beside it.
// Usage: npm run file-icon-sheet
import fs from 'node:fs';
import path from 'node:path';
import { fileIconSheet } from './lib/file-icon-sheet.mjs';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'review-out', 'file-icon-sheet');
const { html, files } = fileIconSheet({ root });
fs.rmSync(path.join(out, 'svg'), { recursive: true, force: true });
for (const [relative, text] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(path.join(out, relative)), { recursive: true });
  fs.writeFileSync(path.join(out, relative), text);
}
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log(`${path.relative(root, path.join(out, 'index.html'))}: ${Object.keys(files).length} resolved SVGs`);
```

In `package.json` `scripts`, add after `"glyph-sheet"`:

```json
    "file-icon-sheet": "node scripts/render-file-icon-sheet.mjs",
```

Run:

```bash
node --test test/file-icon-sheet.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `ℹ tests 4`, `ℹ pass 4`, `ℹ fail 0`; `ℹ tests 437`, `ℹ fail 0`.

- [ ] **Step 3: Run the file-icon sheet procedure and judge the defaults**

Run the file-icon sheet procedure (Global Constraints).
Expected: `review-out/file-icon-sheet/index.html: 33 resolved SVGs` (3 sets × (3 drawings + 8 role copies)); `sheet@1x.png` 1700×2144, `sheet@2x.png` 3400×4288, `reference@1x.png` 1247×464, `reference@2x.png` 2494×928 (cropped from the full-page capture by the procedure).

Open the PNGs with the Read tool; crop and upscale the 16px cells with nearest-neighbour scaling (PIL) where the full sheet is too small. Check, at 16px, at 1× and 2×, on all four side bars and in the grayscale copy:

- `parchment` reads as a sheet with a dog-ear, `folder` as a closed folder with a solid tab, `folder-open` as the same folder with the front flap tipped open; the three are told apart in grayscale by silhouette alone.
- In the reference table, Chromium's 16px render and the 32× reference show the same structure: crisp 1-unit walls, the fold and the tab solid, no seam where two parts meet, the open flap's 2:1 sides as even 1-2 pixel steps.
- What was seen while drafting (this is the record the gate README cites): all three read at 1× and 2× on Moonlit Candle, Moonlit, Daydream and Coven Contrast side bars and in grayscale; browser and reference agree at both scales. Three open-folder constructions were rejected on the prototype renders before this one: flap sides 1 unit across (blurred into half-covered columns at 1×), the whole wedge filled from y8 (merged with the tab into one dark block on the left), and a flap with a straight left side (read as a closed folder with a line across it).
- On the selected row and the quick-input focus of Moonlit, Daydream and Coven Contrast every muted icon nearly disappears (1.02-1.25:1), and the role strip shows the same for every role but docs on those three themes; Moonlit Candle's selection keeps every role above 3:1. This is the F9 evidence (Task 8 warns on it); no drawing changes for it.

A drawing that passes its tests but does not read at 16px is redrawn before the task ends.

- [ ] **Step 4: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_5`
Expected: one tree id.

### Task 6: The map, `npm run build:file-icons`, the new theme; the 1.2.1 icons deleted

**Files:**
- Create: `icons/file-icon-map.json`, `scripts/lib/file-icons-build.mjs`, `scripts/build-file-icons.mjs`, `test/file-icons-build.test.mjs`, `icons/file-icons/{dark,light,high-contrast}/{parchment,folder,folder-open}.svg` (generated)
- Modify: `package.json` (`build:file-icons`, `build`), `icons/file-icon-theme.json` (regenerated), `scripts/lib/file-icon-requirements.mjs`, `scripts/lib/checks/file-icons.mjs`, `test/file-icon-checks.test.mjs`, `icons/README.md`
- Delete: `icons/witchy-{code,css,data,file,folder,javascript,json,python,style,test,typescript,yaml}.svg`

**Interfaces:**
- Consumes: `ROLES`, `SETS`, `SET_DIRS`, `resolveSource`; `parseGlyphSvg`.
- Produces: `KEY_PROPERTIES`, `DEFAULT_SLOTS`, `readFileIconInputs(root)` → `{ map, sources }` (every `icons/file-src/*.svg`), `mapProblems(map, sources)` → strings, and `buildFileIconTheme(map, sources)` → `{ theme, files }` (throws with every problem when the map cannot be built; `files` keys are repo-relative, `icons/file-icons/<set dir>/<drawing>.svg`). Icon IDs: `<drawing>`, `<drawing>_light`, `<drawing>_hc`; `showLanguageModeIcons: false`; no `hidesExplorerArrows`; each key property written only when some drawing serves it, keys sorted. `REQUIRED_LANGUAGE_IDS` in `scripts/lib/file-icon-requirements.mjs`.

The map refuses: a category that is not a role or is not painted in the drawing's source (so a folder's category is its badge's role, spec 6); an unknown property (no globs: spec 6); an upper-case or repeated key; a key served by two drawings in one property; a default slot set on no drawing or on two; a `folderNames` drawing without its `-open` twin serving the same `folderNamesExpanded` (and the reverse); a mapped drawing with no source; a source with no map entry.

The 1.2.1 theme's `languageIds` block (D11) goes with the 1.2.1 icons: its keys come back from the map as Part B and gate 6 draw them (Part B: `typescript`, `python`, `json`, `jsonc`). So that the block cannot be lost unnoticed, its eleven keys join the pending `file-icons` coverage stage as `REQUIRED_LANGUAGE_IDS`. Between gate 5 and gate 6, every key outside the sample falls back to the new parchment and folder; nothing ships in between (spec 6.1).

- [ ] **Step 1: Write the failing tests**

Create `test/file-icons-build.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildFileIconTheme, mapProblems, readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';

const root = path.resolve(import.meta.dirname, '..');
const doc = (...roles) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${roles.map((role) => `<path fill="{${role}}" d="M2 2L14 2L14 14L2 14Z"/>`).join('')}</svg>\n`;
const sources = { parchment: doc('muted', 'muted'), folder: doc('muted', 'muted'), 'folder-open': doc('muted', 'muted'), gem: doc('code', 'code'), 'folder-src': doc('muted', 'muted', 'code'), 'folder-src-open': doc('muted', 'muted', 'code') };
const defaults = { parchment: { category: 'muted', default: 'file' }, folder: { category: 'muted', default: 'folder' }, 'folder-open': { category: 'muted', default: 'folderExpanded' } };
const map = {
  drawings: {
    ...defaults,
    gem: { category: 'code', fileExtensions: ['ts', 'mts'], languageIds: ['typescript'] },
    'folder-src': { category: 'code', folderNames: ['src', 'source'] },
    'folder-src-open': { category: 'code', folderNamesExpanded: ['src', 'source'] },
  },
};

test('buildFileIconTheme resolves every mapped source into the three sets and writes the theme from the map', () => {
  const { theme, files } = buildFileIconTheme(map, sources);
  assert.equal(Object.keys(files).length, 18);
  assert.equal(files['icons/file-icons/dark/gem.svg'], doc('code', 'code').replaceAll('{code}', '#B99AFF'));
  assert.equal(files['icons/file-icons/high-contrast/folder-src.svg'].includes('fill="#D0B8FF"'), true);
  assert.deepEqual(theme.iconDefinitions.gem_light, { iconPath: './file-icons/light/gem.svg' });
  assert.deepEqual(theme.iconDefinitions['folder-open_hc'], { iconPath: './file-icons/high-contrast/folder-open.svg' });
  assert.equal(theme.showLanguageModeIcons, false);
  assert.equal('hidesExplorerArrows' in theme, false);
  assert.deepEqual([theme.file, theme.folder, theme.folderExpanded], ['parchment', 'folder', 'folder-open']);
  assert.deepEqual(theme.fileExtensions, { mts: 'gem', ts: 'gem' });
  assert.deepEqual(theme.languageIds, { typescript: 'gem' });
  assert.deepEqual(theme.folderNamesExpanded, { source: 'folder-src-open', src: 'folder-src-open' });
  assert.deepEqual(theme.light, {
    file: 'parchment_light', folder: 'folder_light', folderExpanded: 'folder-open_light',
    fileExtensions: { mts: 'gem_light', ts: 'gem_light' }, folderNames: { source: 'folder-src_light', src: 'folder-src_light' },
    folderNamesExpanded: { source: 'folder-src-open_light', src: 'folder-src-open_light' }, languageIds: { typescript: 'gem_light' },
  });
  assert.equal(theme.highContrast.fileExtensions.ts, 'gem_hc');
});

test('a map that cannot be built is refused with every problem named', () => {
  const broken = {
    drawings: {
      parchment: { category: 'muted', default: 'file' },
      folder: { category: 'gold', default: 'folder', fileNames: ['README.md'] },
      gem: { category: 'data', fileExtensions: ['ts', 'ts'], globs: ['*.ts'] },
      'gem-cut': { category: 'code', fileExtensions: ['ts'], default: 'folder' },
      'folder-src': { category: 'code', folderNames: ['src'] },
      ghost: { category: 'muted' },
    },
  };
  assert.deepEqual(mapProblems(broken, { parchment: doc('muted'), folder: doc('muted'), gem: doc('code'), 'gem-cut': doc('code'), 'folder-src': doc('muted', 'code'), orphan: doc('muted') }), [
    'folder: category "gold" is not a role',
    'folder: fileNames key "README.md" is not lower case',
    'gem: unknown property globs',
    'gem: fileExtensions lists "ts" twice',
    'gem: category "data" is not painted in its source',
    'folder-src: folderNames needs the twin folder-src-open with the same folderNamesExpanded',
    'ghost: no source icons/file-src/ghost.svg',
    'fileExtensions "ts" is served by gem and gem-cut',
    'default "folder" is set on folder and gem-cut',
    'default "folderExpanded" is set on no drawing',
    'icons/file-src/orphan.svg has no entry in icons/file-icon-map.json',
  ]);
  assert.throws(() => buildFileIconTheme(broken, {}), /icons\/file-icon-map\.json cannot be built:\n/);
});

test('the map refuses an unknown default slot, and an -open drawing without its closed twin', () => {
  const drawings = { ...map.drawings, 'folder-x-open': { category: 'muted', folderNamesExpanded: ['x'], default: 'rootFolder' } };
  assert.deepEqual(mapProblems({ drawings }, { ...sources, 'folder-x-open': doc('muted') }), [
    'folder-x-open: default "rootFolder" is not file, folder, folderExpanded',
    'folder-x-open: folderNamesExpanded needs the twin folder-x with the same folderNames',
  ]);
});

test('the gate-5 map: the three defaults, each serving one default slot', () => {
  const { map: committed } = readFileIconInputs(root);
  for (const [name, entry] of Object.entries(defaults)) assert.deepEqual(committed.drawings[name], entry, name);
});

test('icons/file-icon-theme.json and icons/file-icons/ are a fresh build of the map and the sources (npm run build:file-icons)', () => {
  const { map: committed, sources: committedSources } = readFileIconInputs(root);
  const { theme, files } = buildFileIconTheme(committed, committedSources);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'icons', 'file-icon-theme.json'), 'utf8')), theme);
  const written = fs.readdirSync(path.join(root, 'icons', 'file-icons'), { recursive: true }).filter((file) => file.endsWith('.svg')).map((file) => `icons/file-icons/${file.split(path.sep).join('/')}`);
  assert.deepEqual(written.sort(), Object.keys(files).sort());
  for (const [file, svg] of Object.entries(files)) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), svg, file);
});

test('the 1.2.1 witchy-*.svg icons are gone, and npm run build ends with the file icons', () => {
  assert.deepEqual(fs.readdirSync(path.join(root, 'icons')).filter((file) => /^witchy-.*\.svg$/.test(file)), []);
  const { scripts, contributes } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(scripts['build:file-icons'], 'node scripts/build-file-icons.mjs');
  assert.match(scripts.build, /build-product-icons\.mjs && node scripts\/build-file-icons\.mjs$/);
  assert.deepEqual(contributes.iconThemes, [{ id: 'witchynibbles-icons', label: 'WitchyNibbles Icons', path: './icons/file-icon-theme.json' }]);
});
```

In `test/file-icon-checks.test.mjs`:

1. Replace the requirements import with:

```js
import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES, REQUIRED_LANGUAGE_IDS } from '../scripts/lib/file-icon-requirements.mjs';
```

2. In `set`, add after the `folderNames`/`folderNamesExpanded` line:

```js
  languageIds: all(REQUIRED_LANGUAGE_IDS, icon),
```

3. Insert above `test('a complete theme passes', () => {` (the block ends with the blank line that separates it from that test):

```js
test('D11: the 1.2.1 languageIds block stays required, so the gate-5 theme cannot drop it unnoticed', () => {
  assert.deepEqual(REQUIRED_LANGUAGE_IDS, ['python', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'css', 'scss', 'json', 'jsonc', 'yaml', 'markdown']);
  const theme = complete();
  delete theme.highContrast.languageIds.markdown;
  assert.deepEqual(run((r) => checkFileIconTheme({ theme, readSvg: (p) => svgs[p] }, r)), ['file-icons: highContrast set is missing languageIds: markdown']);
});

```

Run: `node --test test/file-icons-build.test.mjs test/file-icon-checks.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module|does not provide'`
Expected: `SyntaxError: The requested module '../scripts/lib/file-icon-requirements.mjs' does not provide an export named 'REQUIRED_LANGUAGE_IDS'` and `Cannot find module '…/scripts/lib/file-icons-build.mjs'`, then `ℹ tests 2`, `ℹ pass 0`, `ℹ fail 2`.

- [ ] **Step 2: Keep the languageIds keys in the coverage stage**

In `scripts/lib/file-icon-requirements.mjs`, insert above `export const SIDEBARS`:

```js
// D11 keeps the 1.2.1 languageIds block (spec 6, 6.1); these are its keys, pointed at the new drawings as they land.
export const REQUIRED_LANGUAGE_IDS = [
  'python', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'css', 'scss', 'json', 'jsonc', 'yaml', 'markdown',
];

```

In `scripts/lib/checks/file-icons.mjs`, import `REQUIRED_LANGUAGE_IDS` beside the other lists and add `  languageIds: REQUIRED_LANGUAGE_IDS,` as the last entry of `REQUIRED_KEYS`.

- [ ] **Step 3: Write the build and the map**

Create `scripts/lib/file-icons-build.mjs`:

```js
// Spec 6.1 (F3): icons/file-icon-map.json and the sources in icons/file-src/ become the three resolved sets in
// icons/file-icons/{dark,light,high-contrast}/ and icons/file-icon-theme.json.
import fs from 'node:fs';
import path from 'node:path';
import { ROLES, SETS, SET_DIRS, resolveSource } from './file-icon-palette.mjs';
import { parseGlyphSvg } from './svg-geometry.mjs';

export const KEY_PROPERTIES = Object.freeze(['fileExtensions', 'fileNames', 'folderNames', 'folderNamesExpanded', 'languageIds']);
export const DEFAULT_SLOTS = Object.freeze(['file', 'folder', 'folderExpanded']);
const SUFFIX = { dark: '', light: '_light', highContrast: '_hc' };
const sameKeys = (a = [], b = []) => a.length === b.length && [...a].sort().join('\n') === [...b].sort().join('\n');

export function readFileIconInputs(root) {
  const map = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'file-icon-map.json'), 'utf8'));
  const dir = path.join(root, 'icons', 'file-src');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith('.svg')).sort() : [];
  return { map, sources: Object.fromEntries(files.map((file) => [file.slice(0, -4), fs.readFileSync(path.join(dir, file), 'utf8')])) };
}

// Every reason the map cannot be built, in a stable order: per drawing (map order), then across drawings, then orphans.
export function mapProblems(map, sources) {
  const problems = [];
  const drawings = map?.drawings ?? {};
  for (const [name, entry] of Object.entries(drawings)) {
    const say = (message) => problems.push(`${name}: ${message}`);
    if (!ROLES.includes(entry.category)) say(`category "${entry.category}" is not a role`);
    for (const property of Object.keys(entry)) {
      if (!['category', 'default', ...KEY_PROPERTIES].includes(property)) say(`unknown property ${property}`);
    }
    for (const property of KEY_PROPERTIES) {
      const keys = entry[property] ?? [];
      for (const key of keys) if (key !== key.toLowerCase()) say(`${property} key "${key}" is not lower case`);
      for (const key of new Set(keys.filter((key, index) => keys.indexOf(key) !== index))) say(`${property} lists "${key}" twice`);
    }
    if ('default' in entry && !DEFAULT_SLOTS.includes(entry.default)) say(`default "${entry.default}" is not ${DEFAULT_SLOTS.join(', ')}`);
    if (sources[name] && ROLES.includes(entry.category) && !parseGlyphSvg(sources[name]).paths.some(({ fill }) => fill === `{${entry.category}}`)) {
      say(`category "${entry.category}" is not painted in its source`);
    }
    // A folder drawing pairs with its -open twin, which serves the same names expanded (spec 6.1).
    if (entry.folderNames && !sameKeys(entry.folderNames, drawings[`${name}-open`]?.folderNamesExpanded)) say(`folderNames needs the twin ${name}-open with the same folderNamesExpanded`);
    const closed = name.replace(/-open$/, '');
    if (entry.folderNamesExpanded && (closed === name || !sameKeys(entry.folderNamesExpanded, drawings[closed]?.folderNames))) say(`folderNamesExpanded needs the twin ${closed === name ? '<name>' : closed} with the same folderNames`);
    if (!sources[name]) say(`no source icons/file-src/${name}.svg`);
  }
  for (const property of KEY_PROPERTIES) {
    const owners = {};
    for (const [name, entry] of Object.entries(drawings)) for (const key of new Set(entry[property] ?? [])) (owners[key] ??= []).push(name);
    for (const [key, names] of Object.entries(owners)) if (names.length > 1) problems.push(`${property} "${key}" is served by ${names.join(' and ')}`);
  }
  for (const slot of DEFAULT_SLOTS) {
    const names = Object.entries(drawings).filter(([, entry]) => entry.default === slot).map(([name]) => name);
    if (names.length !== 1) problems.push(`default "${slot}" is set on ${names.length ? names.join(' and ') : 'no drawing'}`);
  }
  for (const name of Object.keys(sources)) if (!(name in drawings)) problems.push(`icons/file-src/${name}.svg has no entry in icons/file-icon-map.json`);
  return problems;
}

// sources: drawing name -> source SVG text (role tokens). Returns the theme object and the resolved SVGs by path
// relative to the repo root.
export function buildFileIconTheme(map, sources) {
  const problems = mapProblems(map, sources);
  if (problems.length) throw new Error(`icons/file-icon-map.json cannot be built:\n${problems.join('\n')}`);
  const entries = Object.entries(map.drawings);
  const files = {};
  const iconDefinitions = {};
  for (const set of SETS) {
    for (const [name] of entries) {
      files[`icons/file-icons/${SET_DIRS[set]}/${name}.svg`] = resolveSource(sources[name], set);
      iconDefinitions[`${name}${SUFFIX[set]}`] = { iconPath: `./file-icons/${SET_DIRS[set]}/${name}.svg` };
    }
  }
  const associations = (set) => {
    const id = (name) => `${name}${SUFFIX[set]}`;
    const result = Object.fromEntries(DEFAULT_SLOTS.map((slot) => [slot, id(entries.find(([, entry]) => entry.default === slot)[0])]));
    for (const property of KEY_PROPERTIES) {
      const pairs = entries.flatMap(([name, entry]) => (entry[property] ?? []).map((key) => [key, id(name)]));
      if (pairs.length) result[property] = Object.fromEntries(pairs.sort(([a], [b]) => (a < b ? -1 : 1)));
    }
    return result;
  };
  const theme = {
    $schema: 'vscode://schemas/icon-theme',
    $comment: 'Generated by npm run build:file-icons from icons/file-icon-map.json and icons/file-src/ (spec 6.1). Do not edit.',
    showLanguageModeIcons: false,
    iconDefinitions,
    ...associations('dark'),
    light: associations('light'),
    highContrast: associations('highContrast'),
  };
  return { theme, files };
}
```

Create `scripts/build-file-icons.mjs`:

```js
// npm run build:file-icons (spec 6.1): resolves icons/file-src/ into icons/file-icons/{dark,light,high-contrast}/ and
// regenerates icons/file-icon-theme.json from icons/file-icon-map.json.
import fs from 'node:fs';
import path from 'node:path';
import { KEY_PROPERTIES, buildFileIconTheme, readFileIconInputs } from './lib/file-icons-build.mjs';

const root = path.resolve(import.meta.dirname, '..');
const { map, sources } = readFileIconInputs(root);
const { theme, files } = buildFileIconTheme(map, sources);
fs.rmSync(path.join(root, 'icons', 'file-icons'), { recursive: true, force: true });
for (const [relative, svg] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), svg);
}
fs.writeFileSync(path.join(root, 'icons', 'file-icon-theme.json'), `${JSON.stringify(theme, null, 2)}\n`);
const counts = KEY_PROPERTIES.map((property) => `${Object.keys(theme[property] ?? {}).length} ${property}`).join(', ');
console.log(`Built ${Object.keys(map.drawings).length} file-icon drawings (${Object.keys(files).length} SVGs in icons/file-icons/) and icons/file-icon-theme.json: ${counts}`);
```

Create `icons/file-icon-map.json`:

```json
{
  "$comment": "Spec 6.1: per drawing in icons/file-src/, its category (a role of scripts/lib/file-icon-palette.mjs) and the keys it serves. Keys are lower case, and a key belongs to at most one drawing per property. A folder drawing pairs with its -open twin, which serves the same names in folderNamesExpanded. npm run build:file-icons writes icons/file-icons/ and icons/file-icon-theme.json from it.",
  "drawings": {
    "parchment": { "category": "muted", "default": "file" },
    "folder": { "category": "muted", "default": "folder" },
    "folder-open": { "category": "muted", "default": "folderExpanded" }
  }
}
```

In `package.json` `scripts`, replace `"build"` and add `"build:file-icons"` after `"build:product-icons"`:

```json
    "build": "node scripts/build-themes.mjs && node scripts/build-product-icons.mjs && node scripts/build-file-icons.mjs",
    "build:file-icons": "node scripts/build-file-icons.mjs",
```

In `icons/README.md`, replace the line `The file icon theme is defined in file-icon-theme.json.` with:

```markdown
The file icon theme is built from the drawing-based map in `file-icon-map.json`: each drawing is written as code in `scripts/file-glyphs/` with colour-role tokens instead of hex values (`npm run draw:file-icons` regenerates the sources in `file-src/`; the tests fail if a committed source drifts from its generator), and the map lists each drawing's category and the file extensions, file names, folder names and language IDs it serves. `npm run build:file-icons` resolves every source into the dark, light and high-contrast sets in `file-icons/` (colours from `scripts/lib/file-icon-palette.mjs`) and regenerates `file-icon-theme.json`; do not edit either by hand. `npm run file-icon-sheet` renders every drawing for review.
```

- [ ] **Step 4: Delete the 1.2.1 icons and build**

```bash
git rm -q icons/witchy-*.svg
npm run build:file-icons
node --test test/file-icons-build.test.mjs test/file-icon-checks.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/validate.mjs 2>&1 | grep -E '^…'
npm run build 2>&1 | grep -E '^Built' && git status --short themes icons/witchynibbles-product-icons.woff icons/product-icon-theme.json | wc -l
```

Expected:
- `Built 3 file-icon drawings (9 SVGs in icons/file-icons/) and icons/file-icon-theme.json: 0 fileExtensions, 0 fileNames, 0 folderNames, 0 folderNamesExpanded, 0 languageIds`.
- `ℹ tests 16`, `ℹ pass 16`, `ℹ fail 0` (6 build tests; 10 checks tests).
- `ℹ tests 444`, `ℹ fail 0`.
- `… 17 pending problems in stages not yet enforced: release (2), file-icons (15) (use --verbose to list)`. `file-icons` drops from 19 to 15 lines: the 1.2.1 colour and set-shape problems are gone, and each set now lists five missing key properties (`--verbose` shows `languageIds` among them).
- `Built 109 product icon drawings for 177 icon IDs in icons/witchynibbles-product-icons.woff`, then the file-icon line above, then `0` (the whole build leaves the color themes and the product font unchanged).

`icons/file-icon-theme.json` is exactly:

```json
{
  "$schema": "vscode://schemas/icon-theme",
  "$comment": "Generated by npm run build:file-icons from icons/file-icon-map.json and icons/file-src/ (spec 6.1). Do not edit.",
  "showLanguageModeIcons": false,
  "iconDefinitions": {
    "parchment": {
      "iconPath": "./file-icons/dark/parchment.svg"
    },
    "folder": {
      "iconPath": "./file-icons/dark/folder.svg"
    },
    "folder-open": {
      "iconPath": "./file-icons/dark/folder-open.svg"
    },
    "parchment_light": {
      "iconPath": "./file-icons/light/parchment.svg"
    },
    "folder_light": {
      "iconPath": "./file-icons/light/folder.svg"
    },
    "folder-open_light": {
      "iconPath": "./file-icons/light/folder-open.svg"
    },
    "parchment_hc": {
      "iconPath": "./file-icons/high-contrast/parchment.svg"
    },
    "folder_hc": {
      "iconPath": "./file-icons/high-contrast/folder.svg"
    },
    "folder-open_hc": {
      "iconPath": "./file-icons/high-contrast/folder-open.svg"
    }
  },
  "file": "parchment",
  "folder": "folder",
  "folderExpanded": "folder-open",
  "light": {
    "file": "parchment_light",
    "folder": "folder_light",
    "folderExpanded": "folder-open_light"
  },
  "highContrast": {
    "file": "parchment_hc",
    "folder": "folder_hc",
    "folderExpanded": "folder-open_hc"
  }
}
```

- [ ] **Step 5: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_6`
Expected: one tree id.

### Task 7: Package the resolved sets, never the sources

**Files:**
- Modify: `.vscodeignore`, `test/package-contents.test.mjs`

**Interfaces:**
- Consumes: `vsce ls` (as the existing package test does).
- Produces: `icons/file-src/**` out of the VSIX (like `icons/product-src-variants/**`); `icons/file-icon-map.json` on the pending-release list beside `product-icon-map.json`.

- [ ] **Step 1: Write the failing test**

Replace `test/package-contents.test.mjs` with (one `vsce ls` shared by both tests):

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const allowed = [/^package\.json$/, /^README\.md$/, /^CHANGELOG\.md$/, /^LICENSE[^/]*$/, /^themes\//, /^icons\//, /^assets\//];
// Release decision pending: icon sources and data files are currently packaged; printed so the release phase sees them.
const pendingRelease = [/^icons\/product-src\//, /^icons\/product-icon-(map|ids|baseline-[^/]*)\.json$/, /^icons\/file-icon-map\.json$/, /^icons\/README\.md$/];

// vsce's own entry script under the running Node, not `npx`: on native Windows npx is npx.cmd, which execFileSync can
// only start through a shell.
let listing;
const vsceList = () => {
  listing ??= execFileSync(process.execPath, [path.join(root, 'node_modules', '@vscode', 'vsce', 'vsce'), 'ls', '--no-dependencies'], { cwd: root, encoding: 'utf8' })
    .split('\n').map((line) => line.trim()).filter(Boolean);
  return listing;
};

test('the vsix file list (vsce ls) holds only allowlisted paths', () => {
  const listed = vsceList();
  const pending = listed.filter((file) => pendingRelease.some((re) => re.test(file)));
  console.log(`# packaged icon sources/data awaiting a release decision (${pending.length}):\n${pending.map((file) => `#   ${file}`).join('\n')}`);
  assert.deepEqual(listed.filter((file) => !allowed.some((re) => re.test(file))), []);
});

test('the vsix ships the file icon theme and its resolved sets, never the role-token sources (spec 6.1)', () => {
  const listed = vsceList();
  assert.ok(listed.includes('icons/file-icon-theme.json'));
  for (const set of ['dark', 'light', 'high-contrast']) assert.ok(listed.includes(`icons/file-icons/${set}/parchment.svg`), set);
  assert.deepEqual(listed.filter((file) => file.startsWith('icons/file-src/') || /^icons\/witchy-/.test(file)), []);
});
```

Run: `node --test --test-reporter=tap test/package-contents.test.mjs 2>&1 | grep -E '^not ok|^# (tests|pass|fail)'`
Expected: `not ok 2 - the vsix ships the file icon theme and its resolved sets, never the role-token sources (spec 6.1)`, `# tests 2`, `# pass 1`, `# fail 1`.

- [ ] **Step 2: Keep the sources out of the VSIX**

In `.vscodeignore`, add `icons/file-src/**` on the line after `icons/product-src-variants/**`.

Run:

```bash
node --test test/package-contents.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|awaiting|file-icon-map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `# packaged icon sources/data awaiting a release decision (114):`, `#   icons/file-icon-map.json`, `ℹ tests 2`, `ℹ pass 2`, `ℹ fail 0`; `ℹ tests 445`, `ℹ fail 0`.

- [ ] **Step 3: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_7`
Expected: one tree id.

### Task 8: Enforce `file-icons:pipeline`, with the F9 warning

**Files:**
- Modify: `scripts/lib/checks/file-icon-pipeline.mjs`, `scripts/validate.mjs`, `scripts/validation-stage.json`, `test/file-icon-checks.test.mjs`

**Interfaces:**
- Consumes: `fileGlyphProblems` (Task 2); `buildFileIconTheme`, `mapProblems`, `readFileIconInputs` (Task 6); `THEME_SETS`, `themeBackdrops` (Task 5); `SIDEBARS`; `contrast`, `hexes`.
- Produces: `checkFileIconPipeline({ map, sources, theme, built }, report)` (stage `file-icons:pipeline`: the source rules, `showLanguageModeIcons` false, the map, the theme and every resolved file equal to a fresh build with no extra file, 3:1 on the sidebar for every resolved colour); `checkSelectionContrast({ built, colorThemes }, report)` (F9: `report.warn` only, one line per theme, backdrop and colour, naming the drawings; the two selection keys share a line when they resolve to the same colour). `file-icons:pipeline` appended to `scripts/validation-stage.json`.

- [ ] **Step 1: Write the failing tests**

In `test/file-icon-checks.test.mjs`, replace the import lines above the `checkReleaseMetadata` import with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createReport } from '../scripts/lib/report.mjs';
import { checkFileIconTheme } from '../scripts/lib/checks/file-icons.mjs';
import { checkFileIconPipeline, checkSelectionContrast, fileGlyphProblems } from '../scripts/lib/checks/file-icon-pipeline.mjs';
import { buildFileIconTheme, readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
```

and append:

```js
// Stage inputs as validate.mjs reads them: the map, the sources, the committed theme and the committed resolved SVGs.
const pipelineRun = (inputs, enforce = ['file-icons:pipeline']) => {
  const report = createReport({ enforce });
  checkFileIconPipeline(inputs, report);
  const { errors, warnings } = report.result();
  return { errors: errors.map((e) => `${e.stage}: ${e.message}`), warnings };
};
const pipelineFixture = () => {
  const sources = { parchment: doc(`<path fill="{muted}" d="${squareHole}"/>`), folder: doc(`<path fill="{muted}" d="${squareHole}"/>`), 'folder-open': doc(`<path fill="{muted}" d="${squareHole}"/>`) };
  const map = { drawings: { parchment: { category: 'muted', default: 'file' }, folder: { category: 'muted', default: 'folder' }, 'folder-open': { category: 'muted', default: 'folderExpanded' } } };
  const { theme, files } = buildFileIconTheme(map, sources);
  return { map, sources, theme: structuredClone(theme), built: { ...files } };
};

test('file-icons:pipeline: the committed map, sources, resolved sets and theme pass', () => {
  const root = path.resolve(import.meta.dirname, '..');
  const { map, sources } = readFileIconInputs(root);
  const dir = path.join(root, 'icons', 'file-icons');
  const built = Object.fromEntries(fs.readdirSync(dir, { recursive: true }).filter((file) => file.endsWith('.svg'))
    .map((file) => [`icons/file-icons/${file.split(path.sep).join('/')}`, fs.readFileSync(path.join(dir, file), 'utf8')]));
  const theme = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'file-icon-theme.json'), 'utf8'));
  assert.deepEqual(pipelineRun({ map, sources, theme, built }), { errors: [], warnings: [] });
});

test('file-icons:pipeline fails a theme or resolved set that is not a fresh build, an extra file, a shown language icon and a colour under 3:1', () => {
  const inputs = pipelineFixture();
  inputs.theme.showLanguageModeIcons = true;
  inputs.built['icons/file-icons/light/folder.svg'] = inputs.built['icons/file-icons/light/folder.svg'].replace('#735F7D', '#E9DDF0');
  delete inputs.built['icons/file-icons/dark/parchment.svg'];
  inputs.built['icons/file-icons/dark/witchy-file.svg'] = '<svg/>';
  assert.deepEqual(pipelineRun(inputs).errors, [
    'file-icons:pipeline: icons/file-icon-theme.json must set "showLanguageModeIcons": false',
    'file-icons:pipeline: icons/file-icon-theme.json differs from a fresh build (run npm run build:file-icons)',
    'file-icons:pipeline: icons/file-icons/dark/parchment.svg is missing (run npm run build:file-icons)',
    'file-icons:pipeline: icons/file-icons/light/folder.svg differs from a fresh build (run npm run build:file-icons)',
    'file-icons:pipeline: icons/file-icons/dark/witchy-file.svg is not produced by the build',
    'file-icons:pipeline: light icon folder uses #E9DDF0 at 1.17:1 on #F8F0FB (needs 3:1)',
  ]);
});

test('file-icons:pipeline fails a source that breaks the rules and a map that cannot be built, and keeps them out of the other stages', () => {
  const inputs = pipelineFixture();
  inputs.sources.parchment = inputs.sources.parchment.replace('{muted}', '#A99AB9');
  inputs.map.drawings.folder.category = 'gold';
  const { errors } = pipelineRun(inputs);
  assert.deepEqual(errors, [
    'file-icons:pipeline: icons/file-src/parchment.svg part 1 fill "#A99AB9" is not a role token',
    'file-icons:pipeline: icons/file-src/parchment.svg uses hex colours (#A99AB9); paint with role tokens',
    'file-icons:pipeline: icons/file-icon-map.json: parchment: category "muted" is not painted in its source',
    'file-icons:pipeline: icons/file-icon-map.json: folder: category "gold" is not a role',
  ]);
  assert.deepEqual(pipelineRun(inputs, ['file-icons']).errors, []);
});

test('F9: a warning, never a failure, for each resolved colour under 3:1 on a theme\'s active selection or quick-input focus', () => {
  const { built } = pipelineFixture();
  const report = createReport({ enforce: ['file-icons:pipeline'] });
  checkSelectionContrast({ built, colorThemes: [
    { label: 'Candle', uiTheme: 'vs-dark', colors: { 'sideBar.background': '#120C1F', 'list.activeSelectionBackground': '#633B79' } },
    { label: 'Pink', uiTheme: 'vs', colors: { 'sideBar.background': '#F8F0FB', 'list.activeSelectionBackground': '#B52776', 'quickInputList.focusBackground': '#E9B5D899' } },
  ] }, report);
  assert.deepEqual(report.result(), { errors: [], pending: [], warnings: [
    'F9: Pink list.activeSelectionBackground #B52776: light #735F7D (folder, folder-open, parchment) at 1.04:1 (under 3:1)',
  ] });
});

test('F9 names both selection keys in one line when the quick-input focus falls back to the active selection', () => {
  const { built } = pipelineFixture();
  const report = createReport({ enforce: [] });
  checkSelectionContrast({ built, colorThemes: [{ label: 'Moonlit', uiTheme: 'vs-dark', colors: { 'sideBar.background': '#120C1F', 'list.activeSelectionBackground': '#F04EAB' } }] }, report);
  assert.deepEqual(report.result().warnings, ['F9: Moonlit list.activeSelectionBackground and quickInputList.focusBackground #F04EAB: dark #A99AB9 (folder, folder-open, parchment) at 1.25:1 (under 3:1)']);
});

test('npm run validate enforces file-icons:pipeline, after the product batches', () => {
  const { enforce } = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '..', 'scripts', 'validation-stage.json'), 'utf8'));
  assert.equal(enforce.at(-1), 'file-icons:pipeline');
  assert.equal(enforce.includes('file-icons'), false, 'full coverage stays pending until gate 6');
});

test('F9 checks a quick-input focus of its own, and the dark set against every dark color theme', () => {
  const { built } = pipelineFixture();
  const report = createReport({ enforce: [] });
  checkSelectionContrast({ built, colorThemes: [
    { label: 'Candle', uiTheme: 'vs-dark', colors: { 'sideBar.background': '#120C1F', 'list.activeSelectionBackground': '#633B79' } },
    { label: 'Moonlit', uiTheme: 'vs-dark', colors: { 'sideBar.background': '#120C1F', 'list.activeSelectionBackground': '#633B79', 'quickInputList.focusBackground': '#F04EAB' } },
  ] }, report);
  assert.deepEqual(report.result().warnings, ['F9: Moonlit quickInputList.focusBackground #F04EAB: dark #A99AB9 (folder, folder-open, parchment) at 1.25:1 (under 3:1)']);
});

test('file-icons:pipeline passes a source\'s grid warning on as a warning, never an error', () => {
  const inputs = pipelineFixture();
  inputs.sources.parchment = doc('<path fill="{muted}" d="M2 2L14.2 2L14.2 14L2 14Z"/>');
  assert.deepEqual(pipelineRun(inputs).warnings, ['icons/file-src/parchment.svg straight-segment points off the whole/half grid: (14.2, 2) (14.2, 14)']);
});
```

Run: `node --test test/file-icon-checks.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|does not provide'`
Expected: `SyntaxError: The requested module '../scripts/lib/checks/file-icon-pipeline.mjs' does not provide an export named 'checkFileIconPipeline'`, then `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1`.

- [ ] **Step 2: Write the stage and the warning**

Replace `scripts/lib/checks/file-icon-pipeline.mjs` with:

```js
// Stage `file-icons:pipeline` (spec 8, F3): the rules every file-icon source obeys.
import { isDeepStrictEqual } from 'node:util';
import { contrast, hexes } from '../../../src/color.mjs';
import { THEME_SETS, themeBackdrops } from '../file-icon-backdrops.mjs';
import { ROLES, SET_DIRS } from '../file-icon-palette.mjs';
import { SIDEBARS } from '../file-icon-requirements.mjs';
import { buildFileIconTheme, mapProblems } from '../file-icons-build.mjs';
import { offGridPoints, parseGlyphSvg, windingProblems } from '../svg-geometry.mjs';

const STAGE = 'file-icons:pipeline';
const SET_OF_DIR = Object.fromEntries(Object.entries(SET_DIRS).map(([set, dir]) => [dir, set]));
// 'icons/file-icons/<dir>/<drawing>.svg' -> [set, drawing]
const setAndDrawing = (file) => {
  const [, dir, name] = file.match(/^icons\/file-icons\/([^/]+)\/([^/]+)\.svg$/) ?? [];
  return [SET_OF_DIR[dir], name];
};
const coloursOf = (svg) => [...new Set(hexes(svg).map((hex) => hex.slice(0, 7).toUpperCase()))];

const attributeNames = (tag) => [...tag.matchAll(/([\w:-]+)\s*=/g)].map((match) => match[1]);

// Section 6.2 and 8: viewBox 0 0 16 16 with no size, only <svg> and <path>, <path fill="{role}" d="…"> and nothing
// else (so no opacity, fill-opacity, stroke, transform, fill-rule, style or gradient), no hex anywhere, and real holes.
// Holes are checked per part: each <path> is its own fill, and an accent painted over another part is not a hole.
export function fileGlyphProblems(svg) {
  const errors = [];
  const warnings = [];
  const parsed = parseGlyphSvg(svg);
  const svgTag = svg.match(/<svg\b([^>]*)>/i)?.[1] ?? '';
  if (parsed.viewBox !== '0 0 16 16') errors.push('viewBox must be "0 0 16 16"');
  if (parsed.width !== undefined || parsed.height !== undefined) errors.push('must not set width or height on <svg>');
  const extraSvg = attributeNames(svgTag).filter((name) => !['xmlns', 'viewBox'].includes(name));
  if (extraSvg.length) errors.push(`<svg> takes only xmlns and viewBox (found ${extraSvg.join(', ')})`);
  const others = [...new Set(parsed.elements.filter((name) => name !== 'svg' && name !== 'path'))];
  if (others.length) errors.push(`only <svg> and <path> elements are allowed (found ${others.join(', ')})`);
  const pathTags = [...svg.matchAll(/<path\b([^>]*?)\/?>/gi)].map((match) => match[1]);
  if (!pathTags.length) errors.push('contains no <path>');
  const extraPath = [...new Set(pathTags.flatMap((tag) => attributeNames(tag).filter((name) => !['fill', 'd'].includes(name))))];
  if (extraPath.length) errors.push(`<path> takes only fill and d (found ${extraPath.join(', ')})`);
  parsed.paths.forEach(({ fill, d }, index) => {
    const role = fill?.match(/^\{(\w+)\}$/)?.[1];
    if (!ROLES.includes(role)) errors.push(`part ${index + 1} fill "${fill}" is not a role token`);
    if (!d.trim()) errors.push(`part ${index + 1} has no path data`);
  });
  const hexes = [...new Set(svg.match(/#[0-9a-f]{3,8}\b/gi) ?? [])];
  if (hexes.length) errors.push(`uses hex colours (${hexes.join(', ')}); paint with role tokens`);
  try {
    parsed.paths.forEach(({ fill, d }, index) => {
      for (const problem of windingProblems([d])) errors.push(`part ${index + 1} (${fill}): ${problem}`);
    });
    const off = [...new Set(parsed.paths.flatMap(({ d }) => offGridPoints(d)).map(([x, y]) => `(${+x.toFixed(3)}, ${+y.toFixed(3)})`))];
    if (off.length) warnings.push(`straight-segment points off the whole/half grid: ${off.slice(0, 6).join(' ')}${off.length > 6 ? ' …' : ''}`);
  } catch (error) {
    errors.push(`path data could not be parsed: ${error.message}`);
  }
  return { errors, warnings };
}

// Spec 8 (F3), enforced from gate 5. map: icons/file-icon-map.json; sources: drawing -> icons/file-src/ text; theme: the
// committed icons/file-icon-theme.json; built: every committed SVG under icons/file-icons/, by repo-relative path.
export function checkFileIconPipeline({ map, sources, theme, built }, report) {
  const fail = (message) => report.fail(STAGE, message);
  for (const [name, svg] of Object.entries(sources)) {
    const { errors, warnings } = fileGlyphProblems(svg);
    for (const error of errors) fail(`icons/file-src/${name}.svg ${error}`);
    for (const warning of warnings) report.warn(`icons/file-src/${name}.svg ${warning}`);
  }
  if (theme.showLanguageModeIcons !== false) fail('icons/file-icon-theme.json must set "showLanguageModeIcons": false');
  const problems = mapProblems(map, sources);
  for (const problem of problems) fail(`icons/file-icon-map.json: ${problem}`);
  if (!problems.length) {
    let fresh;
    try {
      fresh = buildFileIconTheme(map, sources);
    } catch (error) {
      fail(`the file icons cannot be built: ${error.message}`);
    }
    if (fresh) {
      if (!isDeepStrictEqual(theme, fresh.theme)) fail('icons/file-icon-theme.json differs from a fresh build (run npm run build:file-icons)');
      for (const [file, svg] of Object.entries(fresh.files)) {
        if (!(file in built)) fail(`${file} is missing (run npm run build:file-icons)`);
        else if (built[file] !== svg) fail(`${file} differs from a fresh build (run npm run build:file-icons)`);
      }
      for (const file of Object.keys(built)) if (!(file in fresh.files)) fail(`${file} is not produced by the build`);
    }
  }
  for (const [file, svg] of Object.entries(built)) {
    const [set, name] = setAndDrawing(file);
    if (!set) continue;
    for (const colour of coloursOf(svg)) {
      const ratio = contrast(colour, SIDEBARS[set]);
      if (ratio < 3) fail(`${set} icon ${name} uses ${colour} at ${ratio.toFixed(2)}:1 on ${SIDEBARS[set]} (needs 3:1)`);
    }
  }
}

// F9 (spec 8): a soft warning for each resolved colour under 3:1 on a color theme's active selection or focused
// quick-input row, composited over its side bar. colorThemes: [{ label, uiTheme, colors }] from contributes.themes, so
// the dark set is checked against both Moonlit Candle and Moonlit.
export function checkSelectionContrast({ built, colorThemes }, report) {
  for (const { label, uiTheme, colors } of colorThemes) {
    const set = THEME_SETS[uiTheme];
    const { selection, quickInputFocus } = themeBackdrops(colors);
    const backdrops = selection === quickInputFocus
      ? [['list.activeSelectionBackground and quickInputList.focusBackground', selection]]
      : [['list.activeSelectionBackground', selection], ['quickInputList.focusBackground', quickInputFocus]];
    const users = {};
    for (const [file, svg] of Object.entries(built)) {
      const [fileSet, name] = setAndDrawing(file);
      if (fileSet === set) for (const colour of coloursOf(svg)) (users[colour] ??= []).push(name);
    }
    for (const [keys, backdrop] of backdrops) {
      for (const [colour, names] of Object.entries(users)) {
        const ratio = contrast(colour, backdrop);
        if (ratio < 3) report.warn(`F9: ${label} ${keys} ${backdrop}: ${set} ${colour} (${names.sort().join(', ')}) at ${ratio.toFixed(2)}:1 (under 3:1)`);
      }
    }
  }
}
```

In `scripts/validate.mjs`, add below the `checkFileIconTheme` import:

```js
import { checkFileIconPipeline, checkSelectionContrast } from './lib/checks/file-icon-pipeline.mjs';
import { readFileIconInputs } from './lib/file-icons-build.mjs';
```

and insert above `const result = report.result();` (the block ends with a blank line, so `const result` stays a paragraph of its own):

```js
// Spec 6.1 and 8 (F3, F9): the file-icon pipeline, enforced from gate 5; full key coverage stays in `file-icons` above.
const fileIconTheme = exists('icons/file-icon-theme.json') ? readJson('icons/file-icon-theme.json') : {};
const builtDir = path.join(root, 'icons', 'file-icons');
const builtFiles = fs.existsSync(builtDir)
  ? fs.readdirSync(builtDir, { recursive: true }).filter((file) => file.endsWith('.svg')).map((file) => `icons/file-icons/${file.split(path.sep).join('/')}`)
  : [];
const built = Object.fromEntries(builtFiles.map((file) => [file, readText(file)]));
checkFileIconPipeline({ ...readFileIconInputs(root), theme: fileIconTheme, built }, report);
const colorThemes = (packageJson.contributes?.themes ?? []).filter((contribution) => exists(contribution.path))
  .map(({ label, uiTheme, path: themePath }) => ({ label, uiTheme, colors: readJson(themePath).colors ?? {} }));
checkSelectionContrast({ built, colorThemes }, report);

```

Run: `node --test --test-reporter=tap test/file-icon-checks.test.mjs 2>&1 | grep -E '^# (tests|pass|fail)|^not ok'`
Expected: `not ok 16 - npm run validate enforces file-icons:pipeline, after the product batches`, `# tests 18`, `# pass 17`, `# fail 1`.

- [ ] **Step 3: Enforce the stage**

In `scripts/validation-stage.json`, append `"file-icons:pipeline"` to `enforce` (after `"product-batch:symbols"`).

Run:

```bash
node --test test/file-icon-checks.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/validate.mjs 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows'
sed -i 's/#735F7D/#735F7E/' icons/file-icons/light/folder.svg && node scripts/validate.mjs 2>&1 | grep -E '^✗'; npm run build:file-icons > /dev/null && node scripts/validate.mjs --only file-icons:pipeline 2>&1 | grep -E '^✗|^✓'
```

Expected:
- `ℹ tests 18`, `ℹ pass 18`, `ℹ fail 0`; `ℹ tests 453`, `ℹ fail 0`.
- Validate (the three accepted product grid warnings, G16, filtered out):

```
… 17 pending problems in stages not yet enforced: release (2), file-icons (15) (use --verbose to list)
⚠ F9: WitchyNibbles Moonlit list.activeSelectionBackground and quickInputList.focusBackground #F04EAB: dark #A99AB9 (folder, folder-open, parchment) at 1.25:1 (under 3:1)
⚠ F9: WitchyNibbles Daydream list.activeSelectionBackground and quickInputList.focusBackground #B52776: light #735F7D (folder, folder-open, parchment) at 1.04:1 (under 3:1)
⚠ F9: WitchyNibbles Coven Contrast list.activeSelectionBackground and quickInputList.focusBackground #FF67B7: highContrast #A99AB9 (folder, folder-open, parchment) at 1.02:1 (under 3:1)
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug, product-batch:editor, product-batch:symbols, file-icons:pipeline)
```

- `✗ [file-icons:pipeline] icons/file-icons/light/folder.svg differs from a fresh build (run npm run build:file-icons)` (a hand-edited resolved icon fails the enforced stage), then, rebuilt, `✓ WitchyNibbles package validation passed (enforced: file-icons:pipeline)`.

The F9 lines are the gate-5 evidence for the author (spec 8, F9): with only the muted defaults drawn, the dark set already fails Moonlit's pink selection, and the `light` and `highContrast` sets fail Daydream's and Coven's selections, whose colours equal those sets' style colour. Part B's drawings add their colours to these lines.

- [ ] **Step 4: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_8 && git status --short | grep -c '^D  icons/witchy-'`
Expected: one tree id, then `12`.


## Part B: the sample drawings

Part B draws the gate-5 sample of spec 6.2 on Part A's pipeline: the `src` folder (closed and open) with a grimoire badge, the `ts` cut gem, the `py` snake, the `json` keyring and the LICENSE contract. Each drawing is code in its group module (`folders.mjs`, `code.mjs`, `data.mjs`, `docs.mjs`), tested first (keyline bounds, accent size and role, 1-unit clearances measured with `outlineGap`, real holes probed with ink, the roles of every part, a silhouette test for the look-alike, the map pin), then drawn, mapped, built and judged with the file-icon sheet procedure at 16px, 1× and 2×, on all four side bars, the selection rows and in grayscale, against the 32×-supersampled reference. `scripts/file-glyphs/index.mjs` ends as `[defaults, folders, code, data, docs]`.

Task 10 also sets the gem language (spec 6.2): only `gem-cut` is drawn, and throwaway renders in `review-out/g5-sample/` show that the js rough crystal and the tsx/jsx gem in a ring, both gate 6, keep their own silhouettes beside it.

**Measured totals.** `npm test` goes 453 → 459 → 464 → 467 → 471 → 477. `node scripts/validate.mjs` keeps `… 17 pending problems in stages not yet enforced: release (2), file-icons (15)` throughout: the coverage stage prints one line per set and key property while any key of that property is missing, so the sample shortens the lines without removing one (the D11 `languageIds` line goes from 11 keys to 7). The F9 warnings grow from 3 to 12. The `reference@Nx.png` sizes are crops of the full-page capture (the file-icon sheet procedure).

**Scratch files.** Throwaway renders live in `review-out/g5-sample/` (git-ignored): `sketch.mjs` (32×-supersampled coverage of candidate drawings) and `compose.py` (a PNG per candidate list, 16px at 8× and 32px at 4× on the four side bars, then grayscale, then actual size with a selected-row cell), written in Task 9 and reused in Tasks 10 and 13. Nothing there is named like a test.

---

### Task 9: The `src` folder, closed and open (`folders.mjs`)

**Files:**
- Create: `scripts/file-glyphs/folders.mjs`, `test/file-glyph-folders.test.mjs`, `icons/file-src/{folder-src,folder-src-open}.svg` (generated), `icons/file-icons/{dark,light,high-contrast}/{folder-src,folder-src-open}.svg` (generated)
- Modify: `scripts/file-glyphs/index.mjs`, `icons/file-icon-map.json`, `icons/file-icon-theme.json` (regenerated)

**Interfaces:**
- Consumes: `folderBody`, `BADGE_BOX`, `painted`, `fileIconDocument` (`scripts/file-glyphs/parts.mjs`, Part A); `rect` (`scripts/glyphs/primitives.mjs`); `drawings` of `defaults.mjs` (test only); `readFileIconInputs`; `filledAt`, `outlineGap`, `parseGlyphSvg`, `pathBounds`, `subpaths`.
- Produces: `drawings` in `scripts/file-glyphs/folders.mjs` (`folder-src`, `folder-src-open`); `fileGlyphModules = [defaults, folders]`; map entries `folder-src` (`folderNames` `src`, `source`) and `folder-src-open` (`folderNamesExpanded` the same), category `code`.

Construction (spec 6, 6.2): `folderBody({ badge: true })` and `folderBody({ open: true, badge: true })` unchanged (the muted body with the badge box knocked out, then the filled muted tab), then one `{code}` part: the grimoire, a solid closed book 6×7 at x9-15, y8-15 in the 7×7 `BADGE_BOX`, flush with the folder's right edge. Its one feature is the spine: the column x9-10, set off by a straight 1×5 slot x10-11, y9-14 (a counter-wound hole; section 4's straight-slot exception). It sits exactly one unit from the right wall's cut end (y7) and two from the bottom wall's (x7). The badged folders keep the filled tab (Part A's `folderBody`); the hollow-tab alternative is rendered in Step 5 for the gate README.

- [ ] **Step 1: Write the failing tests**

Create `test/file-glyph-folders.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/folders.mjs';
import { drawings as defaults } from '../scripts/file-glyphs/defaults.mjs';
import { BADGE_BOX, folderBody } from '../scripts/file-glyphs/parts.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by 0.25, so no sample lands on an edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.25 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.25 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const inkOf = (svg) => (point) => filledAt(partsOf(svg).map((part) => part.d), point);
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

test('the folders module draws folder-src and folder-src-open', () => {
  assert.deepEqual(Object.keys(drawings), ['folder-src', 'folder-src-open']);
});

test('folder-src: the badged folder, then a solid code grimoire 6x7 in the badge box with a real spine slot (spec 6.2)', () => {
  for (const [name, open] of [['folder-src', false], ['folder-src-open', true]]) {
    const [body, tab, badge] = partsOf(drawings[name]());
    assert.deepEqual([body, tab].map(({ role, d }) => ({ role, d })), folderBody({ open, badge: true }), `${name}: the folder construction with the badge box knocked out`);
    assert.equal(badge.role, 'code', `${name}: the badge takes the category of src (code)`);
    assert.deepEqual(pathBounds([badge.d]), { minX: 9, maxX: 15, minY: 8, maxY: 15 }, `${name}: the grimoire, 6x7 at the right of the 7x7 box`);
    const { minX, maxX, minY, maxY } = pathBounds([badge.d]);
    assert.ok(minX >= BADGE_BOX.x && maxX <= BADGE_BOX.x + BADGE_BOX.w && minY >= BADGE_BOX.y && maxY <= BADGE_BOX.y + BADGE_BOX.h, `${name}: inside BADGE_BOX`);
    assert.equal(outlineGap(subpaths(body.d), subpaths(badge.d)), 1, `${name}: one unit from the folder outline`);
    probe([badge.d], [
      [[9.5, 11], true], [[10.5, 8.5], true], [[10.5, 11], false], [[10.5, 13.5], false], [[10.5, 14.5], true], // the spine, the slot x10-11 y9-14 (a hole), its ends
      [[11.5, 11], true], [[14.5, 8.5], true], [[14.5, 14.5], true], [[8.5, 11], false], // the cover, the free column x8-9
    ], name);
  }
});

test('folder-src and folder-src-open differ from the default folders only in the badge corner', () => {
  for (const [name, plain] of [['folder-src', 'folder'], ['folder-src-open', 'folder-open']]) {
    const [badged, base] = [inkOf(drawings[name]()), inkOf(defaults[plain]())];
    const changed = SAMPLES.filter((point) => badged(point) !== base(point));
    assert.deepEqual(changed.filter(([x, y]) => x < BADGE_BOX.x - 1 || y < BADGE_BOX.y - 1).map(String), [], `${name}: unchanged outside the knockout`);
    assert.ok(changed.length >= 100, `${name}: ${changed.length} of 1024 samples differ`);
  }
});

test('map: folder-src serves src and source closed, its -open twin the same names expanded, both in code', () => {
  assert.deepEqual(mapEntry('folder-src'), { category: 'code', folderNames: ['src', 'source'] });
  assert.deepEqual(mapEntry('folder-src-open'), { category: 'code', folderNamesExpanded: ['src', 'source'] });
});
```

Run: `node --test test/file-glyph-folders.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/scripts/file-glyphs/folders.mjs' imported from …/test/file-glyph-folders.test.mjs`, then `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1`.

- [ ] **Step 2: Write the folders module**

Create `scripts/file-glyphs/folders.mjs`:

```js
// Folder drawings with a badge (spec 6, 6.2): the folder construction of parts.mjs with the badge box knocked out,
// plus one solid badge in the category of the folder's contents, painted last.
import { rect } from '../glyphs/primitives.mjs';
import { fileIconDocument, folderBody, painted } from './parts.mjs';

export const drawings = {};

// src, source: a grimoire, one bold silhouette (spec 6: a badge is one solid shape with one feature). A closed book
// standing upright, 6x7 at x9-15, y8-15, flush with the folder's right edge in the 7x7 BADGE_BOX (the free column x8-9
// leaves 2 units to the bottom wall's cut end at x7; the box's top row keeps the 1-unit knockout to the right wall's at
// y7). The spine is the 1-unit column x9-10, set off by a straight slot x10-11, y9-14 (a 1x5 hole, section 4's straight-
// slot exception), so the book reads as a bound volume and not as a plain tile.
const grimoire = () => painted('code', rect(9, 8, 6, 7), rect(10, 9, 1, 5, 'ccw'));

drawings['folder-src'] = () => fileIconDocument(folderBody({ badge: true }), grimoire());
drawings['folder-src-open'] = () => fileIconDocument(folderBody({ open: true, badge: true }), grimoire());
```

Replace `scripts/file-glyphs/index.mjs` with:

```js
import * as defaults from './defaults.mjs';
import * as folders from './folders.mjs';

export const fileGlyphModules = [defaults, folders];
```

Run: `node --test --test-reporter=tap test/file-glyph-folders.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^not ok|^# (tests|pass|fail)'`
Expected (the drawings pass; the sources and the map entries are not written yet):

```
not ok 1 - icons/file-src holds exactly one source per drawing, and no drawing name is used twice
not ok 5 - file drawing folder-src: committed source matches the generator and passes the file-glyph rules with no warning
not ok 6 - file drawing folder-src-open: committed source matches the generator and passes the file-glyph rules with no warning
not ok 10 - map: folder-src serves src and source closed, its -open twin the same names expanded, both in code
# tests 10
# pass 6
# fail 4
```

- [ ] **Step 3: Map, draw, build, validate**

In `icons/file-icon-map.json`, add after the `folder-open` entry (a comma after it):

```json
    "folder-src": { "category": "code", "folderNames": ["src", "source"] },
    "folder-src-open": { "category": "code", "folderNamesExpanded": ["src", "source"] }
```

```bash
npm run draw:file-icons
npm run build:file-icons
node --test test/file-glyph-folders.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/validate.mjs 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows'
cat icons/file-src/folder-src.svg icons/file-src/folder-src-open.svg
```

Expected:
- `Wrote 5 file-icon sources`; `Built 5 file-icon drawings (15 SVGs in icons/file-icons/) and icons/file-icon-theme.json: 0 fileExtensions, 0 fileNames, 2 folderNames, 2 folderNamesExpanded, 0 languageIds`.
- `ℹ tests 10`, `ℹ pass 10`, `ℹ fail 0`; `ℹ tests 459`, `ℹ fail 0` (+6: 4 folder tests, 2 drift cases).
- `… 17 pending problems in stages not yet enforced: release (2), file-icons (15) (use --verbose to list)`, then six `⚠ F9` lines (Task 8's three muted lines now name `folder-src` and `folder-src-open` too, and one code line per theme: `dark #B99AFF (folder-src, folder-src-open) at 1.43:1` on Moonlit's `#F04EAB`, `light #7042B2 … at 1.13:1` on Daydream's `#B52776`, `highContrast #D0B8FF … at 1.52:1` on Coven Contrast's `#FF67B7`), then `✓ WitchyNibbles package validation passed (enforced: …, file-icons:pipeline)`. `--verbose` no longer lists `src` and `source` under `folderNames` and `folderNamesExpanded` (17 of 19 left).
- The sources are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{muted}" d="M8 4H14A1 1 0 0 1 15 5V7H14V5H8ZM1 6H2V13H7V14H2A1 1 0 0 1 1 13Z"/><path fill="{muted}" d="M1 3A1 1 0 0 1 2 2H6L8 4V5L7 6H1Z"/><path fill="{code}" d="M9 8L15 8L15 15L9 15ZM10 14L11 14L11 9L10 9Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{muted}" d="M8 4H13A1 1 0 0 1 14 5V7H13V5H8ZM1 6H2V10H3L4 8H7V9H5L3 13H7V14H2A1 1 0 0 1 1 13Z"/><path fill="{muted}" d="M1 3A1 1 0 0 1 2 2H6L8 4V5L7 6H1Z"/><path fill="{code}" d="M9 8L15 8L15 15L9 15ZM10 14L11 14L11 9L10 9Z"/></svg>
```

The badge test fails if the spine slot is wound like the book (checked while drafting: `rect(10, 9, 1, 5)` without `'ccw'` fails 1 test, the slot reads as ink).

- [ ] **Step 4: Write the throwaway sketch renderer**

Create `review-out/g5-sample/sketch.mjs` (scratch, git-ignored):

```js
// Throwaway: coverage of candidate drawings at 16 and 32px (32x supersampled), for compose.py.
// Usage: node sketch.mjs <candidates.mjs> <out.json>; candidates export `candidates` = { name: [{ role, d }, ...] }.
import fs from 'node:fs';
import path from 'node:path';
import { coverage } from '../../scripts/lib/supersample.mjs';
import { PALETTE } from '../../scripts/lib/file-icon-palette.mjs';
const [file, out] = process.argv.slice(2);
const { candidates } = await import(path.resolve(file));
const data = { palette: PALETTE, items: Object.entries(candidates).map(([name, parts]) => ({ name, parts: parts.flat(Infinity).map(({ role, d }) => ({ role, c16: coverage([d], 16), c32: coverage([d], 32) })) })) };
fs.writeFileSync(out, JSON.stringify(data));
console.log(`${data.items.length} candidates -> ${out}`);
```

Create `review-out/g5-sample/compose.py`:

```python
# Throwaway: composes sketch.mjs coverage into a PNG: per candidate, each theme's sidebar at 16px (8x) and 32px (4x),
# then grayscale, then actual-size 16/32 on each sidebar.
import json, sys
from PIL import Image, ImageDraw
data = json.load(open(sys.argv[1])); out = sys.argv[2]
themes = [('Candle', 'dark', '#120C1F'), ('Moonlit', 'dark', '#120C1F'), ('Daydream', 'light', '#F8F0FB'), ('Coven', 'highContrast', '#000000')]
sel = {'Candle': '#633B79', 'Moonlit': '#F04EAB', 'Daydream': '#B52776', 'Coven': '#FF67B7'}
rgb = lambda h: tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
def render(item, theme, px, bg):
    _, s, _ = theme
    img = Image.new('RGB', (px, px))
    pix = []
    for i in range(px * px):
        c = list(rgb(bg))
        for part in item['parts']:
            cov = part['c%d' % px][i]; ink = rgb(data['palette'][s][part['role']])
            c = [c[k] * (1 - cov) + ink[k] * cov for k in range(3)]
        pix.append(tuple(round(v) for v in c))
    img.putdata(pix); return img
cell = 128; pad = 8
cols = len(themes) * 2 * 2 + len(themes)  # colour 16/32, gray 16/32, plus actual-size column
W = 140 + cols * (cell + pad); H = 20 + len(data['items']) * (cell + pad)
sheet = Image.new('RGB', (W, H), (255, 255, 255)); d = ImageDraw.Draw(sheet)
for r, item in enumerate(data['items']):
    y = 20 + r * (cell + pad); d.text((4, y + 50), item['name'], fill=(0, 0, 0))
    x = 140
    for gray in (False, True):
        for t in themes:
            for px in (16, 32):
                im = render(item, t, px, t[2]).resize((cell, cell), Image.NEAREST)
                if gray: im = im.convert('L').convert('RGB')
                sheet.paste(im, (x, y)); x += cell + pad
    for t in themes:
        box = Image.new('RGB', (cell, cell), rgb(t[2]))
        box.paste(render(item, t, 16, t[2]), (8, 8)); box.paste(render(item, t, 32, t[2]), (32, 8))
        sb = Image.new('RGB', (16, 16), rgb(sel[t[0]])); s16 = render(item, t, 16, sel[t[0]]); box.paste(s16, (8, 48))
        box.paste(render(item, t, 16, t[2]).convert('L').convert('RGB'), (8, 72))
        sheet.paste(box, (x, y)); x += cell + pad
for i, t in enumerate(themes):
    d.text((140 + i * 2 * (cell + pad), 4), t[0] + ' 16 | 32', fill=(0, 0, 0))
sheet.save(out); print(out, sheet.size)
```

- [ ] **Step 5: Judge the badge, with the hollow-tab alternative beside it**

Create `review-out/g5-sample/badge-tab.mjs`:

```js
// Throwaway (Task 9): the badged folder with the filled tab (as drawn) against the hollow-tab alternative (F7 read
// strictly: the badge is the only filled part). Evidence for the gate README; not drawn into the plan.
import { polygon, rect } from '../../scripts/glyphs/primitives.mjs';
import { folderBody } from '../../scripts/file-glyphs/parts.mjs';
const p = (role, ...ds) => ({ role, d: ds.flat(Infinity).join('') });
const grimoire = p('code', rect(9, 8, 6, 7), rect(10, 9, 1, 5, 'ccw'));
const TAB = 'M1 3A1 1 0 0 1 2 2H6L8 4V5L7 6H1Z';
const hollowTab = p('muted', TAB, polygon([[2, 3], [5, 3], [6, 4], [6, 5], [2, 5]], 'ccw'));
export const candidates = {
  'src filled tab': [...folderBody({ badge: true }), grimoire],
  'src hollow tab': [folderBody({ badge: true })[0], hollowTab, grimoire],
  'src-open filled tab': [...folderBody({ open: true, badge: true }), grimoire],
  'src-open hollow tab': [folderBody({ open: true, badge: true })[0], hollowTab, grimoire],
};
```

```bash
node review-out/g5-sample/sketch.mjs review-out/g5-sample/badge-tab.mjs review-out/g5-sample/badge-tab.json
python3 review-out/g5-sample/compose.py review-out/g5-sample/badge-tab.json review-out/g5-sample/badge-tab.png
```

Expected: `4 candidates -> review-out/g5-sample/badge-tab.json`, `review-out/g5-sample/badge-tab.png (2860, 564)`.

Then run the file-icon sheet procedure (Global Constraints). Expected: `review-out/file-icon-sheet/index.html: 39 resolved SVGs` (3 × (5 drawings + 8 role copies)); `sheet@1x.png` 1700×2880, `sheet@2x.png` 3400×5760, `reference@1x.png` 1272×744, `reference@2x.png` 2544×1488.

Open the PNGs with the Read tool (crop and upscale the 16px cells with nearest-neighbour scaling where needed). Check at 16px, 1× and 2×, on the four side bars, the selected rows and in grayscale:

- `folder-src` reads as the default folder with a solid book in the lower-right corner, the spine slot open (one dark column inside the badge at 1×), the badge one clear pixel from the right wall's end; `folder-src-open` as the open folder with the same book, the flap's left side and its filled wedge still telling it from the closed folder. Browser and reference agree at both scales.
- In grayscale the badge separates from the folder by the knockout and its mass, not by colour.
- What was seen while drafting: both read on all four side bars at 1× and 2× and in grayscale. Two other badges were rejected on the sketch renders: a book with a page notch cut into its lower right (read as an `L` or a hook) and a 7×7 tile with the slot (a square block, heavier than the folder around it). With the hollow tab (`badge-tab.png`) the folder is lighter than the default folder beside it and the book is the only mass; with the filled tab the badged folder keeps the default folder's weight. The code badge falls under 3:1 on Moonlit's, Daydream's and Coven Contrast's selected rows (F9, the warning lines above).

A drawing that passes its tests but does not read at 16px is redrawn before the task ends.

- [ ] **Step 6: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_9`
Expected: one tree id.

### Task 10: The cut gem (`gem-cut`, ts) and the gem language

**Files:**
- Create: `scripts/file-glyphs/code.mjs`, `test/file-glyph-code.test.mjs`, `icons/file-src/gem-cut.svg` and `icons/file-icons/*/gem-cut.svg` (generated)
- Modify: `scripts/file-glyphs/index.mjs`, `icons/file-icon-map.json`, `icons/file-icon-theme.json` (regenerated)

**Interfaces:**
- Consumes: `polygon`; `painted`, `fileIconDocument`; `SVGPathData` (the test reads the slopes); Task 9's `review-out/g5-sample/sketch.mjs` and `compose.py`.
- Produces: `drawings['gem-cut']` in `scripts/file-glyphs/code.mjs`; `fileGlyphModules = [defaults, folders, code]`; map entry `gem-cut` (`fileExtensions` `ts`, `mts`, `cts`; `languageIds` `typescript`; category `code`). The gem language for gate 6 (Step 5).

Construction (spec 6.2: a cut, faceted gem, flat table, wide crown, pointed pavilion, 14 wide; the table facet the accent). The outline is the pavilion: a 1-unit girdle x1-15, y6-7, and two 45° sides, 2 units across horizontally (1.41 across the stroke, section 4's diagonal weight), meeting in a point at (8,14) around a real triangular hole. The accent, painted last, is the crown with its flat table: solid x1-15, y1-5 (the table x5-11 on top, 45° sides), one unit clear of the girdle. Spec 6.2 names the table facet alone; at 16 units a table facet inside an outlined crown is at most 6×2 (under the 4×4 shape minimum), so the whole crown is the filled facet, and the 1-unit cut under it is the girdle line that makes the gem read as cut. The gem is 14 wide and 13 tall (y1-14): a 4-unit crown (the accent minimum), the 1-unit cut, the 1-unit girdle and a 45° pavilion need 13 rows, one more than the 14×12 landscape keyline, so the gem uses the round keyline's height.

- [ ] **Step 1: Write the failing tests**

Create `test/file-glyph-code.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { SVGPathData } from 'svg-pathdata';
import { drawings } from '../scripts/file-glyphs/code.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by (0.125, 0.3125), so no sample lands on a whole, half or 45-degree edge,
// mirrored or not.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.125 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.3125 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
// Width of the ink along the row y, sampled every 1/8 unit.
const rowWidth = (ds, y) => Array.from({ length: 128 }, (_, i) => 0.0625 + i / 8).filter((x) => filledAt(ds, [x, y])).length / 8;
// Slopes |dy / dx| of the straight segments that are neither horizontal nor vertical.
const slopes = (d) => {
  const found = [];
  let pen = null;
  for (const command of new SVGPathData(d).toAbs().normalizeHVZ().commands) {
    if (command.type === SVGPathData.LINE_TO && pen[0] !== command.x && pen[1] !== command.y) found.push(Math.abs((command.y - pen[1]) / (command.x - pen[0])));
    if ('x' in command) pen = [command.x, command.y];
  }
  return found;
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

test('the code module draws gem-cut', () => {
  assert.deepEqual(Object.keys(drawings), ['gem-cut']);
});

test('gem-cut (ts): a 1-unit pavilion under a 1-unit girdle, 14 wide, and the solid crown with its flat table painted last, 1 unit above (spec 6.2)', () => {
  const [pavilion, crown] = partsOf(drawings['gem-cut']());
  assert.deepEqual([pavilion.role, crown.role], ['code', 'code']);
  assert.deepEqual(pathBounds([pavilion.d, crown.d]), { minX: 1, maxX: 15, minY: 1, maxY: 14 }, '14 wide, 13 tall');
  assert.deepEqual(pathBounds([crown.d]), { minX: 1, maxX: 15, minY: 1, maxY: 5 }, 'the accent: 14x4, over the 4x4 shape minimum');
  assert.deepEqual(pathBounds([pavilion.d]), { minX: 1, maxX: 15, minY: 6, maxY: 14 });
  assert.equal(outlineGap(subpaths(pavilion.d), subpaths(crown.d)), 1, 'the crown is one unit clear of the girdle');
  assert.deepEqual([...new Set([...slopes(pavilion.d), ...slopes(crown.d)])], [1], 'every slanted edge is 45 degrees');
  const ds = [pavilion.d, crown.d];
  probe(ds, [
    [[8, 1.5], true], [[5.25, 1.25], true], [[4.25, 1.25], false], [[1.5, 4.75], true], [[1.5, 3.5], false], // the table and the crown's 45-degree sides
    [[8, 5.5], false], [[1.5, 5.5], false], [[14.5, 5.5], false], // the 1-unit cut under the crown
    [[8, 6.5], true], [[1.5, 6.5], true], [[14.5, 6.5], true], // the girdle, x1-15
    [[8, 9], false], [[8, 11.5], false], [[8, 12.5], true], [[8, 13.5], true], [[8, 14.25], false], // the hole (real), the point at the bottom
    [[3.75, 10], false], [[4.25, 10], true], [[5.75, 10], true], [[6.25, 10], false], // the left side: 2 units across horizontally (1.41 across)
    [[9.75, 10], false], [[10.25, 10], true], [[11.75, 10], true], [[12.25, 10], false], // the right side
  ], 'gem-cut');
  assert.deepEqual(SAMPLES.filter(([x, y]) => filledAt(ds, [x, y]) !== filledAt(ds, [16 - x, y])).map(String), [], 'mirrored about x = 8');
});

test('gem-cut sets the gem language (spec 6, 6.2): flat on top, widest at the girdle, pointed at the bottom', () => {
  const ds = partsOf(drawings['gem-cut']()).map((part) => part.d);
  assert.deepEqual([rowWidth(ds, 1.25), rowWidth(ds, 6.5), rowWidth(ds, 13.5)], [6.5, 14, 1]);
});

test('map: gem-cut serves ts, mts and cts and the typescript language, in code', () => {
  assert.deepEqual(mapEntry('gem-cut'), { category: 'code', fileExtensions: ['ts', 'mts', 'cts'], languageIds: ['typescript'] });
});
```

Run: `node --test test/file-glyph-code.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/scripts/file-glyphs/code.mjs' imported from …/test/file-glyph-code.test.mjs`, then `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1`.

The samples are offset by (0.125, 0.3125), not the defaults' 0.25: on the 0.25 grid, samples land exactly on the 45° edges (x + y whole), and the mirror test then reports edge points as asymmetric (seen while drafting).

- [ ] **Step 2: Write the code module**

Create `scripts/file-glyphs/code.mjs`:

```js
// Code drawings (spec 6, 6.2): objects in the code colour (lavender).
import { polygon } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// gem-cut (ts, mts, cts; spec 6.2: a cut, faceted gem with a flat table, a wide crown and a pointed pavilion, 14
// wide). It sets the gem language of gate 6: the cut gem is wide (x1-15), flat on top and pointed at the bottom, so the
// js rough crystal (tall, pointed at the top) and the tsx/jsx gem in a ring (round) differ from it in silhouette.
// The outline is the pavilion: a 1-unit girdle x1-15, y6-7, and two 45-degree sides 2 units across horizontally (1.41
// across the stroke, section 4's diagonal weight) meeting in a point at (8,14), around a real triangular hole. The
// accent, painted last, is the crown with its flat table: solid x1-15, y1-5, the table x5-11 on top and 45-degree
// sides, one unit clear of the girdle (section 4's accent clearance); 4 tall, so it meets the 4x4 shape minimum.
drawings['gem-cut'] = () => fileIconDocument(
  painted('code', polygon([[1, 6], [15, 6], [15, 7], [8, 14], [1, 7]]), polygon([[3, 7], [13, 7], [8, 12]], 'ccw')),
  painted('code', polygon([[5, 1], [11, 1], [15, 5], [1, 5]])), // accent: the crown and its table
);
```

Replace `scripts/file-glyphs/index.mjs` with:

```js
import * as code from './code.mjs';
import * as defaults from './defaults.mjs';
import * as folders from './folders.mjs';

export const fileGlyphModules = [defaults, folders, code];
```

Run: `node --test --test-reporter=tap test/file-glyph-code.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^not ok|^# (tests|pass|fail)'`
Expected:

```
not ok 4 - map: gem-cut serves ts, mts and cts and the typescript language, in code
not ok 5 - icons/file-src holds exactly one source per drawing, and no drawing name is used twice
not ok 11 - file drawing gem-cut: committed source matches the generator and passes the file-glyph rules with no warning
# tests 11
# pass 8
# fail 3
```

- [ ] **Step 3: Map, draw, build, validate**

In `icons/file-icon-map.json`, add after the `folder-src-open` entry (and a comma after that entry):

```json
    "gem-cut": { "category": "code", "fileExtensions": ["ts", "mts", "cts"], "languageIds": ["typescript"] }
```

```bash
npm run draw:file-icons
npm run build:file-icons
node --test test/file-glyph-code.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/validate.mjs 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows' | grep -cE '^⚠ F9'
node scripts/validate.mjs --verbose 2>&1 | grep -E 'dark set is missing languageIds'
cat icons/file-src/gem-cut.svg
```

Expected:
- `Wrote 6 file-icon sources`; `Built 6 file-icon drawings (18 SVGs in icons/file-icons/) and icons/file-icon-theme.json: 3 fileExtensions, 0 fileNames, 2 folderNames, 2 folderNamesExpanded, 1 languageIds`.
- `ℹ tests 11`, `ℹ pass 11`, `ℹ fail 0`; `ℹ tests 464`, `ℹ fail 0` (+5: 4 code tests, 1 drift case).
- `6` (the code lines now read `(folder-src, folder-src-open, gem-cut)`); the pending summary is unchanged (`release (2), file-icons (15)`).
- `  · [file-icons] dark set is missing languageIds: python, javascript, javascriptreact, typescriptreact, css, scss, json, jsonc, yaml, markdown` (10 of D11's 11 keys; `typescript` is served).
- The source is exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{code}" d="M1 6L15 6L15 7L8 14L1 7ZM8 12L13 7L3 7Z"/><path fill="{code}" d="M5 1L11 1L15 5L1 5Z"/></svg>
```

The probes fail if the pavilion's sides are 1 unit across horizontally (0.71 across the stroke) instead of 2 (checked while drafting: the hole `[[2.5, 7], [13.5, 7], [8, 12.5]]` fails 1 test).

- [ ] **Step 4: Sketch the gem language (throwaway)**

Create `review-out/g5-sample/gem-language.mjs`:

```js
// Throwaway (Task 10): the three gem silhouettes of spec 6 at 16px. Only gem-cut is drawn into the plan; js and tsx are
// gate-6 sketches that prove the cut gem leaves them room.
import { polygon, ring } from '../../scripts/glyphs/primitives.mjs';
const p = (role, ...ds) => ({ role, d: ds.flat(Infinity).join('') });
export const candidates = {
  // ts, mts, cts: wide (14), flat table on top, widest at the girdle, pointed at the bottom (as drawn in code.mjs).
  'ts gem-cut': [
    p('code', polygon([[1, 6], [15, 6], [15, 7], [8, 14], [1, 7]]), polygon([[3, 7], [13, 7], [8, 12]], 'ccw')),
    p('code', polygon([[5, 1], [11, 1], [15, 5], [1, 5]])),
  ],
  // js, mjs, cjs (gate 6): narrow and tall, pointed at the top, two points of unequal height (a rough cluster).
  'js rough crystal': [
    p('code', polygon([[7, 5], [10, 2], [13, 5], [13, 15], [7, 15]]), polygon([[10, 4], [12, 6], [12, 14], [8, 14], [8, 6]], 'ccw')),
    p('code', polygon([[2, 15], [2, 10], [4, 8], [6, 10], [6, 15]])),
  ],
  // tsx, jsx (gate 6): round (a 10-unit ring band), a small cut gem set on top, pointing down into the band.
  'tsx gem in a ring': [p('code', ring(8, 10, 5, 1)), p('code', polygon([[5, 1], [11, 1], [13, 3], [8, 7], [3, 3]]))],
};
```

```bash
node review-out/g5-sample/sketch.mjs review-out/g5-sample/gem-language.mjs review-out/g5-sample/gem-language.json
python3 review-out/g5-sample/compose.py review-out/g5-sample/gem-language.json review-out/g5-sample/gem-language.png
```

Expected: `3 candidates -> review-out/g5-sample/gem-language.json`, `review-out/g5-sample/gem-language.png (2860, 428)`.

Open `gem-language.png`. The three must differ in silhouette at 16px, in colour and in grayscale (spec 6: the js, ts and tsx/jsx gems):

- ts, the cut gem: wide (14), flat on top, widest at the girdle, pointed at the bottom.
- js, the rough crystal: narrow and tall (portrait), pointed at the top, a second, shorter point beside it, unequal heights; no girdle, no table.
- tsx/jsx, the gem in a ring: round (a 10-unit ring band) with a small cut gem on top, its point down into the band; the ring hole is the largest empty shape of the three.

What was seen while drafting: the three are told apart at 16px on every side bar and in grayscale by outline alone (on the 1024-sample grid the ink differs in 384 samples ts/js, 240 ts/tsx, 288 js/tsx). The js sketch at 16px can read as a bar chart or a building (two upright blocks); gate 6 should tilt or facet the short crystal. Only `gem-cut` is drawn in this plan.

- [ ] **Step 5: Run the file-icon sheet procedure and judge `gem-cut`**

Run the file-icon sheet procedure. Expected: `… 42 resolved SVGs`; `sheet@1x.png` 1700×3248, `sheet@2x.png` 3400×6496, `reference@1x.png` 1272×884, `reference@2x.png` 2544×1768.

Check at 16px, 1× and 2×, four side bars, selected rows, grayscale: `gem-cut` reads as a cut gem: a solid crown, one clear row (the cut), the girdle, an outlined V with its hole open to the point. The 45° sides render as even 2-pixel steps in the reference and in the browser; no seam between crown and girdle (they do not touch). What was seen while drafting: it reads in all four themes at both scales and in grayscale; it is the heaviest of the sample (the solid crown), and sits one row higher than the folders (y1-14). Three gems were rejected on sketch renders: the crown resting on a bare V with no girdle (it read as a gem too, but uncut: crown and V merged into one shape at the girdle corners), a 3-unit crown floating over the girdle (under the 4×4 accent minimum), and a crown on a 2-unit girdle (one heavy block).

- [ ] **Step 6: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_10`
Expected: one tree id.

### Task 11: The snake (`snake`, py)

**Files:**
- Create: `icons/file-src/snake.svg` and `icons/file-icons/*/snake.svg` (generated)
- Modify: `scripts/file-glyphs/code.mjs`, `test/file-glyph-code.test.mjs`, `icons/file-icon-map.json`, `icons/file-icon-theme.json` (regenerated)

**Interfaces:**
- Consumes: Task 10's module and test helpers.
- Produces: `drawings.snake`; map entry `snake` (`fileExtensions` `py`, `pyw`; `languageIds` `python`; category `code`).

Construction (spec 6.2: one 2-unit band in an S-coil; the head at least 4×4). The band runs from the head at the upper right: the top run y3-5 to the left, the upper coil round the left (outer radius 3.5 about (6.5,6.5), inner 1.5), the middle run y8-10, the lower coil round the right (about (9.5,11.5)), the bottom run y13-15 to the left, ending in a tail cut at 45° to a point at (3,15). Odd diameters (7 and 3) sit on .5 centres, so every straight edge is on a whole number; the runs are 3 units apart. The accent, painted last, is the head: solid x9-14, y2-6 (5×4) with a round nose, meeting the band along x = 9 and bulging one unit above and below it, two units clear of the middle run. One band and one head: a single snake, never the two-snake mark (spec 6's logo rule; a test pins it).

- [ ] **Step 1: Write the failing tests**

In `test/file-glyph-code.test.mjs`, replace the first test with:

```js
test('the code module draws gem-cut and snake', () => {
  assert.deepEqual(Object.keys(drawings), ['gem-cut', 'snake']);
});
```

and append:

```js
test('snake (py): one 2-unit band in an S-coil with a tapered tail, then the solid head (5x4) painted last (spec 6.2)', () => {
  const [band, head] = partsOf(drawings.snake());
  assert.deepEqual([band.role, head.role], ['code', 'code']);
  assert.deepEqual([subpaths(band.d).length, subpaths(head.d).length], [1, 1], 'one band and one head: a single snake, never the two-snake mark (spec 6 logo rule)');
  assert.deepEqual(pathBounds([band.d, head.d]), { minX: 3, maxX: 14, minY: 2, maxY: 15 });
  assert.deepEqual(pathBounds([head.d]), { minX: 9, maxX: 14, minY: 2, maxY: 6 }, 'the accent: 5x4, over the 4x4 shape minimum');
  const ds = [band.d, head.d];
  probe(ds, [
    [[7.5, 2.5], false], [[7.5, 3.5], true], [[7.5, 4.5], true], [[7.5, 5.5], false], // the top run, y3-5
    [[8, 7.5], false], [[8, 8.5], true], [[8, 9.5], true], [[8, 10.5], false], // the middle run, y8-10
    [[7, 12.5], false], [[7, 13.5], true], [[7, 14.5], true], // the bottom run, y13-15
    [[2.75, 6.5], false], [[3.5, 6.5], true], [[4.5, 6.5], true], [[5.5, 6.5], false], // the upper coil's left side, x3-5
    [[10.5, 11.5], false], [[11.5, 11.5], true], [[12.5, 11.5], true], [[13.25, 11.5], false], // the lower coil's right side, x11-13
    [[3.85, 3.85], false], [[4.73, 4.73], true], [[5.62, 5.62], false], // 2 units across the upper coil at 45 degrees (radii 3.5 and 1.5)
    [[10.5, 6.5], false], [[5, 11.5], false], // the coils open to the right, then to the left: an S
    [[11, 2.5], true], [[13.5, 4], true], [[11, 5.5], true], [[11, 7], false], // the head bulges 1 unit above and below the band, 2 units clear of the middle run
    [[3.25, 14.5], false], [[3.75, 14.75], true], [[4.5, 13.25], false], [[5.5, 13.5], true], // the tail tapers along a 45-degree cut to a point at (3,15)
  ], 'snake');
});

test('map: snake serves py and pyw and the python language, in code', () => {
  assert.deepEqual(mapEntry('snake'), { category: 'code', fileExtensions: ['py', 'pyw'], languageIds: ['python'] });
});
```

Run: `node --test --test-reporter=tap test/file-glyph-code.test.mjs 2>&1 | grep -E '^not ok|^  error|^# (tests|pass|fail)'`
Expected:

```
not ok 1 - the code module draws gem-cut and snake
  error: |-
not ok 5 - snake (py): one 2-unit band in an S-coil with a tapered tail, then the solid head (5x4) painted last (spec 6.2)
  error: 'drawings.snake is not a function'
not ok 6 - map: snake serves py and pyw and the python language, in code
  error: |-
# tests 6
# pass 3
# fail 3
```

- [ ] **Step 2: Append the snake**

Append to `scripts/file-glyphs/code.mjs`:

```js
// snake (py, pyw; spec 6.2: one 2-unit band in an S-coil, the head at least 4x4). One snake, never the two-snake mark
// (spec 6 logo rule). The band runs from the head at the upper right: the top run y3-5 to the left, the upper coil
// round the left (outer radius 3.5 about (6.5,6.5), inner 1.5), the middle run y8-10 to the right, the lower coil
// round the right (about (9.5,11.5)), and the bottom run y13-15 to the left, ending in a tail cut at 45 degrees to a
// point at (3,15). Odd diameters (7 and 3) sit on .5 centres, so every straight edge is on a whole number; the runs are
// 3 units apart. The accent, painted last, is the head: solid x9-14, y2-6 (5x4) with a round nose, meeting the band
// along x = 9 and bulging one unit above and below it, two units clear of the middle run.
drawings.snake = () => fileIconDocument(
  painted('code', 'M9 3H6.5A3.5 3.5 0 0 0 6.5 10H9.5A1.5 1.5 0 0 1 9.5 13H5L3 15H9.5A3.5 3.5 0 0 0 9.5 8H6.5A1.5 1.5 0 0 1 6.5 5H9Z'),
  painted('code', 'M9 2H12A2 2 0 0 1 12 6H9Z'), // accent: the head
);
```

Run: `node --test --test-reporter=tap test/file-glyph-code.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^not ok|^# (tests|pass|fail)'`
Expected:

```
not ok 6 - map: snake serves py and pyw and the python language, in code
not ok 7 - icons/file-src holds exactly one source per drawing, and no drawing name is used twice
not ok 14 - file drawing snake: committed source matches the generator and passes the file-glyph rules with no warning
# tests 14
# pass 11
# fail 3
```

- [ ] **Step 3: Map, draw, build, validate**

In `icons/file-icon-map.json`, add after the `gem-cut` entry (and a comma after that entry):

```json
    "snake": { "category": "code", "fileExtensions": ["py", "pyw"], "languageIds": ["python"] }
```

```bash
npm run draw:file-icons
npm run build:file-icons
node --test test/file-glyph-code.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/validate.mjs 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows' | grep -cE '^⚠ F9'
node scripts/validate.mjs --verbose 2>&1 | grep -E 'dark set is missing languageIds'
cat icons/file-src/snake.svg
```

Expected:
- `Wrote 7 file-icon sources`; `Built 7 file-icon drawings (21 SVGs in icons/file-icons/) and icons/file-icon-theme.json: 5 fileExtensions, 0 fileNames, 2 folderNames, 2 folderNamesExpanded, 2 languageIds`.
- `ℹ tests 14`, `ℹ pass 14`, `ℹ fail 0`; `ℹ tests 467`, `ℹ fail 0` (+3: 2 code tests, 1 drift case).
- `6` (the code lines now end `gem-cut, snake)`).
- `  · [file-icons] dark set is missing languageIds: javascript, javascriptreact, typescriptreact, css, scss, json, jsonc, yaml, markdown`.
- The source is exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{code}" d="M9 3H6.5A3.5 3.5 0 0 0 6.5 10H9.5A1.5 1.5 0 0 1 9.5 13H5L3 15H9.5A3.5 3.5 0 0 0 9.5 8H6.5A1.5 1.5 0 0 1 6.5 5H9Z"/><path fill="{code}" d="M9 2H12A2 2 0 0 1 12 6H9Z"/></svg>
```

- [ ] **Step 4: Run the file-icon sheet procedure and judge `snake`**

Run the file-icon sheet procedure. Expected: `… 45 resolved SVGs`; `sheet@1x.png` 1700×3616, `sheet@2x.png` 3400×7232, `reference@1x.png` 1272×1024, `reference@2x.png` 2544×2048.

Check at 16px, 1× and 2×: `snake` reads as a snake, an S-shaped body with a round head at the upper right and a tapering tail, not as the letter S or a `$`: the head is the widest part, and the two counters stay open (3 rows each). What was seen while drafting: it reads in all four themes and in grayscale; browser and reference agree, the coils' curves anti-alias evenly and the runs stay crisp. Rejected on sketch renders: a 4×4 round head at the band's end (an S with a pin), and a pointed viper head (read as an S-shaped arrow).

- [ ] **Step 5: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_11`
Expected: one tree id.

### Task 12: The keyring (`keyring`, json) (`data.mjs`)

**Files:**
- Create: `scripts/file-glyphs/data.mjs`, `test/file-glyph-data.test.mjs`, `icons/file-src/keyring.svg` and `icons/file-icons/*/keyring.svg` (generated)
- Modify: `scripts/file-glyphs/index.mjs`, `icons/file-icon-map.json`, `icons/file-icon-theme.json` (regenerated)

**Interfaces:**
- Consumes: `disc`, `rect`, `ring`; `painted`, `fileIconDocument`; `outlineGap`, `subpaths`, `filledAt`.
- Produces: `drawings.keyring` in `scripts/file-glyphs/data.mjs`; `fileGlyphModules = [defaults, folders, code, data]`; map entry `keyring` (`fileExtensions` `json`, `jsonc`; `languageIds` `json`, `jsonc`; category `data`).

Construction (spec 6.2: a 1-unit ring top left with two keys hanging at different lengths; the key bows the accent). The ring: r3 about (6,4), 1 unit thick, a real 4-unit hole. Key A hangs from the ring's lower left: a 1-unit shaft x4-5 to y13, one tooth to the left (x2-4, y11-12). Key B from its right: a shaft x9-10 to y15, two teeth to the right (x10-12 at y12 and y14). The accent, painted last, is the two bows in one part: solid 3×3 discs about (4.5,7.5) and (9.5,5.5) (odd diameter on .5 centres in x and y, section 4, so each bow covers whole pixels and each shaft runs down its bow's middle), each overlapping the ring band it hangs on and keeping 0.31 units of band to the hole, so the ring's hole stays whole. The two keys stay 2.39 units apart. The bows touch the ring instead of keeping section 4's 1-unit accent clearance, and the accent is two discs in one part: both are put to the author as an exception (Task 16's README, the house construction). A first version hung key A one unit further right, its bow on (5.5,8): a whole-number y centre for an odd diameter, which blurs the bow's top and bottom rows at 16px; the adversarial review caught it.

- [ ] **Step 1: Write the failing tests**

Create `test/file-glyph-data.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/data.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
const boxOf = (polygon) => {
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)].map((value) => Number(value.toFixed(3)));
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

test('the data module draws keyring', () => {
  assert.deepEqual(Object.keys(drawings), ['keyring']);
});

test('keyring (json): a 1-unit ring at the top left with a real hole, two keys hanging at different lengths, the two solid bows painted last (spec 6.2)', () => {
  const [outline, bows] = partsOf(drawings.keyring());
  assert.deepEqual([outline.role, bows.role], ['data', 'data']);
  assert.deepEqual(pathBounds([outline.d, bows.d]), { minX: 2, maxX: 12, minY: 1, maxY: 15 });
  const [ringOuter, ringHole, shaftA, toothA, shaftB, ...teethB] = subpaths(outline.d);
  const [bowA, bowB] = subpaths(bows.d);
  assert.deepEqual([boxOf(ringOuter), boxOf(ringHole)], [[3, 9, 1, 7], [4, 8, 2, 6]], 'the ring: r3 about (6,4), 1 unit thick');
  assert.deepEqual([boxOf(bowA), boxOf(bowB)], [[3, 6, 6, 9], [8, 11, 4, 7]], 'the accent: two 3x3 bows (the dot minimum), on whole pixels');
  assert.equal(teethB.length, 2);
  for (const bow of [bowA, bowB]) {
    assert.equal(outlineGap([ringOuter], [bow]), 0, 'each bow overlaps the ring it hangs on');
    assert.ok(outlineGap([ringHole], [bow]) > 0.3, 'and leaves the ring\'s hole whole');
  }
  assert.ok(outlineGap([shaftA, toothA, bowA], [shaftB, ...teethB, bowB]) >= 1, 'the two keys stay one unit apart');
  probe([outline.d, bows.d], [
    [[6, 4], false], [[6, 2.25], false], [[4.25, 4], false], [[6, 1.5], true], [[3.5, 4], true], // the ring's hole (real) and band
    [[4.5, 7.5], true], [[9.5, 5.5], true], // the bows
    [[4.5, 12.5], true], [[4.5, 13.5], false], [[2.5, 11.5], true], [[2.5, 12.5], false], // key A: shaft x4-5 to y13, one tooth to the left
    [[9.5, 14.5], true], [[11.5, 12.5], true], [[11.5, 13.5], false], [[11.5, 14.5], true], // key B: shaft x9-10 to y15, two teeth to the right
    [[8, 9], false], [[7.5, 11], false], [[10.5, 9], false], // between the keys
  ], 'keyring');
});

test('map: keyring serves json and jsonc and both languages, in data', () => {
  assert.deepEqual(mapEntry('keyring'), { category: 'data', fileExtensions: ['json', 'jsonc'], languageIds: ['json', 'jsonc'] });
});
```

Run: `node --test test/file-glyph-data.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/scripts/file-glyphs/data.mjs' imported from …/test/file-glyph-data.test.mjs`, then `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1`.

- [ ] **Step 2: Write the data module**

Create `scripts/file-glyphs/data.mjs`:

```js
// Data drawings (spec 6, 6.2): objects in the data colour (gold).
import { disc, rect, ring } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// keyring (json, jsonc; spec 6.2: a 1-unit ring top left with two keys hanging at different lengths, the key bows
// the accent). The ring: r3 about (6,4), 1 unit thick, its hole a real 4-unit hole. Key A hangs from the ring's
// lower left: a 1-unit shaft x4-5 down to y13 with one tooth to the left; key B from its right: a shaft x9-10 down to
// y15 with two teeth to the right, so the two hang at different lengths and their teeth point apart. The accent,
// painted last, is the two bows: solid 3x3 discs on .5 centres (odd diameter, section 4), so each covers whole pixels
// and each shaft runs down its bow's middle. They overlap the ring band they hang on and keep 0.31 units of it to the
// hole; the two keys stay 2.39 units apart. Touching the ring, and two discs in one accent part, are exceptions to
// section 4's accent rules that the gate-5 README puts to the author.
drawings.keyring = () => fileIconDocument(
  painted('data', ring(6, 4, 3), rect(4, 9, 1, 4), rect(2, 11, 2, 1), rect(9, 6, 1, 9), rect(10, 12, 2, 1), rect(10, 14, 2, 1)),
  painted('data', disc(4.5, 7.5, 1.5), disc(9.5, 5.5, 1.5)), // accent: the key bows
);
```

Replace `scripts/file-glyphs/index.mjs` with:

```js
import * as code from './code.mjs';
import * as data from './data.mjs';
import * as defaults from './defaults.mjs';
import * as folders from './folders.mjs';

export const fileGlyphModules = [defaults, folders, code, data];
```

Run: `node --test --test-reporter=tap test/file-glyph-data.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^not ok|^# (tests|pass|fail)'`
Expected:

```
not ok 3 - map: keyring serves json and jsonc and both languages, in data
not ok 4 - icons/file-src holds exactly one source per drawing, and no drawing name is used twice
not ok 12 - file drawing keyring: committed source matches the generator and passes the file-glyph rules with no warning
# tests 12
# pass 9
# fail 3
```

- [ ] **Step 3: Map, draw, build, validate**

In `icons/file-icon-map.json`, add after the `snake` entry (and a comma after that entry):

```json
    "keyring": { "category": "data", "fileExtensions": ["json", "jsonc"], "languageIds": ["json", "jsonc"] }
```

```bash
npm run draw:file-icons
npm run build:file-icons
node --test test/file-glyph-data.test.mjs test/file-glyph-drift.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/validate.mjs 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows' | grep -E '^⚠ F9.*keyring'
node scripts/validate.mjs --verbose 2>&1 | grep -E 'dark set is missing languageIds'
cat icons/file-src/keyring.svg
```

Expected:
- `Wrote 8 file-icon sources`; `Built 8 file-icon drawings (24 SVGs in icons/file-icons/) and icons/file-icon-theme.json: 7 fileExtensions, 0 fileNames, 2 folderNames, 2 folderNamesExpanded, 4 languageIds`.
- `ℹ tests 12`, `ℹ pass 12`, `ℹ fail 0`; `ℹ tests 471`, `ℹ fail 0` (+4: 3 data tests, 1 drift case).
- Three new F9 lines (nine in all):

```
⚠ F9: WitchyNibbles Moonlit list.activeSelectionBackground and quickInputList.focusBackground #F04EAB: dark #FFD477 (keyring) at 2.34:1 (under 3:1)
⚠ F9: WitchyNibbles Daydream list.activeSelectionBackground and quickInputList.focusBackground #B52776: light #8A4D00 (keyring) at 1.12:1 (under 3:1)
⚠ F9: WitchyNibbles Coven Contrast list.activeSelectionBackground and quickInputList.focusBackground #FF67B7: highContrast #FFE38A (keyring) at 2.11:1 (under 3:1)
```

- `  · [file-icons] dark set is missing languageIds: javascript, javascriptreact, typescriptreact, css, scss, yaml, markdown`.
- The source is exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{data}" d="M3 4A3 3 0 1 1 9 4A3 3 0 1 1 3 4ZM4 4A2 2 0 1 0 8 4A2 2 0 1 0 4 4ZM4 9L5 9L5 13L4 13ZM2 11L4 11L4 12L2 12ZM9 6L10 6L10 15L9 15ZM10 12L12 12L12 13L10 13ZM10 14L12 14L12 15L10 15Z"/><path fill="{data}" d="M3 7.5A1.5 1.5 0 1 1 6 7.5A1.5 1.5 0 1 1 3 7.5ZM8 5.5A1.5 1.5 0 1 1 11 5.5A1.5 1.5 0 1 1 8 5.5Z"/></svg>
```

The clearance test fails if a bow leaves the ring (checked while drafting: the long key's bow at `disc(10.5, 6.5, 1.5)` fails 1 test).

- [ ] **Step 4: Run the file-icon sheet procedure and judge `keyring`**

Run the file-icon sheet procedure. Expected: `… 48 resolved SVGs`; `sheet@1x.png` 1700×3984, `sheet@2x.png` 3400×7968, `reference@1x.png` 1272×1164, `reference@2x.png` 2544×2328.

Check at 16px, 1× and 2×: `keyring` reads as a ring with two keys hanging from it, the ring's hole open, the two shafts separate, the short key's tooth to the left and the long key's two teeth to the right; both bows cover whole pixels (no half-covered top or bottom row, against the reference). What was seen while planning: it reads in all four themes and in grayscale, the bows as round knobs where the keys meet the ring; browser and reference agree. At 1× bow A meets the ring's lower-left curve in one lump while the hole stays open; at 2× the disc is distinct. Rejected on sketch renders: an 8-unit ring with 4-unit bows (the bows and the ring merged into one blob), 4-unit bows on the 6-unit ring (the same blob, smaller), the long key's bow set off the ring (a key floating beside the ring), and, after the adversarial review, the first version's short key on x5-6 with its bow on a whole-number y centre (`disc(5.5, 8, 1.5)`: its top and bottom rows half covered at 16px, section 4).

- [ ] **Step 5: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_12`
Expected: one tree id.

### Task 13: The contract (`contract`, LICENSE) (`docs.mjs`); the sample side by side

**Files:**
- Create: `scripts/file-glyphs/docs.mjs`, `test/file-glyph-docs.test.mjs`, `icons/file-src/contract.svg` and `icons/file-icons/*/contract.svg` (generated)
- Modify: `scripts/file-glyphs/index.mjs`, `test/file-icons-build.test.mjs`, `icons/file-icon-map.json`, `icons/file-icon-theme.json` (regenerated)

**Interfaces:**
- Consumes: `disc`, `rect`; `painted`, `fileIconDocument`; `drawings.parchment` (test only); `fileGlyphModules`; `checkFileIconTheme`, `createReport` (the coverage stage run in a test, nothing enforced).
- Produces: `drawings.contract` in `scripts/file-glyphs/docs.mjs`; `fileGlyphModules = [defaults, folders, code, data, docs]` (final); map entry `contract` (`fileNames` `license`, `license.md`; category `docs`); the whole-sample pins in `test/file-icons-build.test.mjs`.

Construction (spec 6.2: an ivory sheet with two text bars; a gold, `{data}`, wax-seal disc of diameter 6, lower right). The sheet is the parchment's footprint without the fold (x3-13, y1-15, 1-unit walls, r1 corners), so a license and a plain file differ in silhouette. Two text bars: x5-11 at y4 and x5-9 at y7. The seal, painted last, is the one part in another role: solid, diameter 6 about (11,12), x8-14, y9-15, one unit past the sheet's right edge. The sheet is knocked out around it, drawn and not clipped so the corner arcs stay arcs: the right wall stops at y8 and the bottom wall at x7, 1.12 units from the disc at the nearest point, so ivory and gold read as two shapes in grayscale too.

- [ ] **Step 1: Write the failing tests**

Create `test/file-glyph-docs.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/docs.mjs';
import { drawings as defaults } from '../scripts/file-glyphs/defaults.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by 0.25, so no sample lands on an edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.25 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.25 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const inkOf = (svg) => (point) => filledAt(partsOf(svg).map((part) => part.d), point);
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];

test('the docs module draws contract', () => {
  assert.deepEqual(Object.keys(drawings), ['contract']);
});

test('contract (LICENSE): an ivory sheet with two text bars, knocked out around a gold wax-seal disc of diameter 6, painted last (spec 6.2)', () => {
  const [sheet, seal] = partsOf(drawings.contract());
  assert.deepEqual([sheet.role, seal.role], ['docs', 'data'], 'the seal is the one part in another role');
  assert.deepEqual(pathBounds([sheet.d]), { minX: 3, maxX: 13, minY: 1, maxY: 15 }, 'the sheet: x3-13, y1-15, inside the portrait keyline');
  assert.deepEqual(pathBounds([seal.d]), { minX: 8, maxX: 14, minY: 9, maxY: 15 }, 'the seal: diameter 6 about (11,12), lower right');
  // 1.12 to the right wall's cut end at (12,8); the flattened disc measures 1.13.
  const gap = outlineGap(subpaths(sheet.d), subpaths(seal.d));
  assert.ok(gap >= 1 && gap < 1.2, `${gap.toFixed(3)}: one unit or more from the sheet and the bars, so the two read apart in grayscale, and no more than the knockout needs`);
  probe([sheet.d, seal.d], [
    [[8, 3.5], false], [[8, 4.5], true], [[8, 5.5], false], [[11.5, 4.5], false], // the first bar, x5-11, y4-5, 1 unit from the right wall
    [[6, 7.5], true], [[10, 7.5], false], // the second bar, x5-9, y7-8, shorter
    [[3.5, 8], true], [[4.5, 8], false], [[8, 1.5], true], [[8, 2.5], false], // the left and top walls
    [[12.5, 2.5], true], [[12.5, 7.5], true], [[12.5, 8.5], false], // no fold: the right wall runs to the top, and stops at y8
    [[6.5, 14.5], true], [[7.5, 14.5], false], [[8, 11], false], // the bottom wall stops at x7; the sheet's inside is empty
    [[11, 12], true], [[11, 9.25], true], [[13.75, 12], true], [[14.25, 12], false], // the solid seal
  ], 'contract');
});

test('contract differs from the default parchment in silhouette: no fold, and the seal over the lower-right corner', () => {
  const [contract, parchment] = [inkOf(drawings.contract()), inkOf(defaults.parchment())];
  const changed = SAMPLES.filter((point) => contract(point) !== parchment(point));
  assert.ok(changed.length >= 100, `${changed.length} of 1024 samples differ`);
  assert.deepEqual([contract([12.25, 2.25]), parchment([12.25, 2.25])], [true, false], 'the corner the parchment folds');
});

test('map: contract serves LICENSE and LICENSE.md, in docs', () => {
  assert.deepEqual(mapEntry('contract'), { category: 'docs', fileNames: ['license', 'license.md'] });
});
```

In `test/file-icons-build.test.mjs`, replace the import of `../scripts/lib/file-icons-build.mjs` with:

```js
import { fileGlyphModules } from '../scripts/file-glyphs/index.mjs';
import { checkFileIconTheme } from '../scripts/lib/checks/file-icons.mjs';
import { buildFileIconTheme, mapProblems, readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { createReport } from '../scripts/lib/report.mjs';
```

and replace the test `the gate-5 map: the three defaults, each serving one default slot` with:

```js
// The gate-5 sample (spec 6.2, 6.3): the drawings and keys of the plan's sample table.
const SAMPLE = {
  'folder-src': { category: 'code', folderNames: ['src', 'source'] },
  'folder-src-open': { category: 'code', folderNamesExpanded: ['src', 'source'] },
  'gem-cut': { category: 'code', fileExtensions: ['ts', 'mts', 'cts'], languageIds: ['typescript'] },
  snake: { category: 'code', fileExtensions: ['py', 'pyw'], languageIds: ['python'] },
  keyring: { category: 'data', fileExtensions: ['json', 'jsonc'], languageIds: ['json', 'jsonc'] },
  contract: { category: 'docs', fileNames: ['license', 'license.md'] },
};

test('the gate-5 map: the three defaults and the six sample drawings of spec 6.2, in module order, and nothing else', () => {
  const { map: committed } = readFileIconInputs(root);
  assert.deepEqual(committed.drawings, { ...defaults, ...SAMPLE });
  assert.deepEqual(Object.keys(committed.drawings), fileGlyphModules.flatMap(({ drawings }) => Object.keys(drawings)));
});

test('the gate-5 theme serves every sample key in all three sets, so the coverage stage no longer lists them as missing', () => {
  const { map: committed, sources } = readFileIconInputs(root);
  const { theme, files } = buildFileIconTheme(committed, sources);
  for (const [name, entry] of Object.entries(SAMPLE)) {
    for (const [property, keys] of Object.entries(entry).filter(([property]) => property !== 'category')) {
      for (const key of keys) {
        assert.deepEqual([theme[property][key], theme.light[property][key], theme.highContrast[property][key]], [name, `${name}_light`, `${name}_hc`], `${property} ${key}`);
      }
    }
  }
  const report = createReport({ enforce: [] });
  checkFileIconTheme({ theme, readSvg: (iconPath) => files[`icons/${iconPath.slice(2)}`] }, report);
  const missing = report.result().pending.flatMap(({ message }) => {
    const [, set, property, keys] = message.match(/^(\w+) set is missing (\w+): (.*)$/) ?? [];
    return set ? keys.split(', ').map((key) => `${set} ${property} ${key}`) : [];
  });
  const served = Object.values(SAMPLE).flatMap((entry) => Object.entries(entry).filter(([property]) => property !== 'category')
    .flatMap(([property, keys]) => keys.flatMap((key) => ['dark', 'light', 'highContrast'].map((set) => `${set} ${property} ${key}`))));
  assert.deepEqual(served.filter((line) => missing.includes(line)), []);
  assert.ok(missing.includes('dark languageIds javascript'), 'keys outside the sample stay pending until gate 6');
});
```

Run: `node --test test/file-glyph-docs.test.mjs test/file-icons-build.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/scripts/file-glyphs/docs.mjs' imported from …/test/file-glyph-docs.test.mjs`, then `ℹ tests 8`, `ℹ pass 5`, `ℹ fail 3` (the docs file, and the two sample tests: the map has no `contract`, so `license` is still missing).

- [ ] **Step 2: Write the docs module**

Create `scripts/file-glyphs/docs.mjs`:

```js
// Docs drawings (spec 6, 6.2): objects in the docs colour (ivory).
import { disc, rect } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// contract (LICENSE, LICENSE.md; spec 6.2: an ivory sheet with two text bars and a gold wax-seal disc of diameter 6 in
// the lower right, the multi-colour case). The sheet is the parchment's footprint without the fold (x3-13, y1-15,
// 1-unit walls, r1 corners), so a license and a plain file differ in silhouette. Two text bars, x5-11 and x5-9 at y4
// and y7. The seal, painted last, is the one part in another role ({data}): solid, diameter 6 about (11,12), x8-14,
// y9-15, reaching one unit past the sheet's right edge. The sheet is knocked out around it, drawn and not clipped so
// the corner arcs stay arcs: the right wall stops at y8 and the bottom wall at x7, at least 1.12 units from the disc,
// so ivory and gold read as two shapes in grayscale too.
drawings.contract = () => fileIconDocument(
  painted('docs', 'M4 1H12A1 1 0 0 1 13 2V8H12V2H4V14H7V15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1Z', rect(5, 4, 6, 1), rect(5, 7, 4, 1)),
  painted('data', disc(11, 12, 3)), // accent: the wax seal
);
```

Replace `scripts/file-glyphs/index.mjs` with:

```js
import * as code from './code.mjs';
import * as data from './data.mjs';
import * as defaults from './defaults.mjs';
import * as docs from './docs.mjs';
import * as folders from './folders.mjs';

export const fileGlyphModules = [defaults, folders, code, data, docs];
```

Run: `node --test --test-reporter=tap test/file-glyph-docs.test.mjs test/file-glyph-drift.test.mjs test/file-icons-build.test.mjs 2>&1 | grep -E '^not ok|^# (tests|pass|fail)'`
Expected:

```
not ok 4 - map: contract serves LICENSE and LICENSE.md, in docs
not ok 5 - icons/file-src holds exactly one source per drawing, and no drawing name is used twice
not ok 14 - file drawing contract: committed source matches the generator and passes the file-glyph rules with no warning
not ok 18 - the gate-5 map: the three defaults and the six sample drawings of spec 6.2, in module order, and nothing else
not ok 19 - the gate-5 theme serves every sample key in all three sets, so the coverage stage no longer lists them as missing
# tests 21
# pass 16
# fail 5
```

- [ ] **Step 3: Map, draw, build, validate**

In `icons/file-icon-map.json`, add after the `keyring` entry (and a comma after that entry):

```json
    "contract": { "category": "docs", "fileNames": ["license", "license.md"] }
```

```bash
npm run draw:file-icons
npm run build:file-icons
node --test test/file-glyph-docs.test.mjs test/file-glyph-drift.test.mjs test/file-icons-build.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/validate.mjs 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows'
node scripts/validate.mjs --verbose 2>&1 | grep 'dark set is missing' | awk -F': ' '{ print $1 ": " split($NF, keys, ", ") }'
cat icons/file-src/contract.svg
npm run build 2>&1 | grep -E '^Built' && git status --short themes icons/witchynibbles-product-icons.woff icons/product-icon-theme.json | wc -l
```

Expected:
- `Wrote 9 file-icon sources`; `Built 9 file-icon drawings (27 SVGs in icons/file-icons/) and icons/file-icon-theme.json: 7 fileExtensions, 2 fileNames, 2 folderNames, 2 folderNamesExpanded, 4 languageIds`.
- `ℹ tests 21`, `ℹ pass 21`, `ℹ fail 0`; `ℹ tests 477`, `ℹ fail 0` (+6: 4 docs tests, 1 drift case, the build file's sample test split in two).
- Validate (the three accepted product grid warnings, G16, filtered out):

```
… 17 pending problems in stages not yet enforced: release (2), file-icons (15) (use --verbose to list)
⚠ F9: WitchyNibbles Moonlit list.activeSelectionBackground and quickInputList.focusBackground #F04EAB: dark #F3EAF7 (contract) at 2.81:1 (under 3:1)
⚠ F9: WitchyNibbles Moonlit list.activeSelectionBackground and quickInputList.focusBackground #F04EAB: dark #FFD477 (contract, keyring) at 2.34:1 (under 3:1)
⚠ F9: WitchyNibbles Moonlit list.activeSelectionBackground and quickInputList.focusBackground #F04EAB: dark #A99AB9 (folder, folder-open, folder-src, folder-src-open, parchment) at 1.25:1 (under 3:1)
⚠ F9: WitchyNibbles Moonlit list.activeSelectionBackground and quickInputList.focusBackground #F04EAB: dark #B99AFF (folder-src, folder-src-open, gem-cut, snake) at 1.43:1 (under 3:1)
⚠ F9: WitchyNibbles Daydream list.activeSelectionBackground and quickInputList.focusBackground #B52776: light #3B2A47 (contract) at 2.19:1 (under 3:1)
⚠ F9: WitchyNibbles Daydream list.activeSelectionBackground and quickInputList.focusBackground #B52776: light #8A4D00 (contract, keyring) at 1.12:1 (under 3:1)
⚠ F9: WitchyNibbles Daydream list.activeSelectionBackground and quickInputList.focusBackground #B52776: light #735F7D (folder, folder-open, folder-src, folder-src-open, parchment) at 1.04:1 (under 3:1)
⚠ F9: WitchyNibbles Daydream list.activeSelectionBackground and quickInputList.focusBackground #B52776: light #7042B2 (folder-src, folder-src-open, gem-cut, snake) at 1.13:1 (under 3:1)
⚠ F9: WitchyNibbles Coven Contrast list.activeSelectionBackground and quickInputList.focusBackground #FF67B7: highContrast #FFFFFF (contract) at 2.67:1 (under 3:1)
⚠ F9: WitchyNibbles Coven Contrast list.activeSelectionBackground and quickInputList.focusBackground #FF67B7: highContrast #FFE38A (contract, keyring) at 2.11:1 (under 3:1)
⚠ F9: WitchyNibbles Coven Contrast list.activeSelectionBackground and quickInputList.focusBackground #FF67B7: highContrast #A99AB9 (folder, folder-open, folder-src, folder-src-open, parchment) at 1.02:1 (under 3:1)
⚠ F9: WitchyNibbles Coven Contrast list.activeSelectionBackground and quickInputList.focusBackground #FF67B7: highContrast #D0B8FF (folder-src, folder-src-open, gem-cut, snake) at 1.52:1 (under 3:1)
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug, product-batch:editor, product-batch:symbols, file-icons:pipeline)
```

- The coverage stage's dark lines, keys still missing per property (each `light` and `highContrast` line the same): `fileExtensions: 50`, `fileNames: 25`, `folderNames: 17`, `folderNamesExpanded: 17`, `languageIds: 7` (after Task 8: 57, 27, 19, 19, 11).
- The source is exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="{docs}" d="M4 1H12A1 1 0 0 1 13 2V8H12V2H4V14H7V15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1ZM5 4L11 4L11 5L5 5ZM5 7L9 7L9 8L5 8Z"/><path fill="{data}" d="M8 12A3 3 0 1 1 14 12A3 3 0 1 1 8 12Z"/></svg>
```

The contract test fails if the knockout is short of a unit (checked while drafting: the right wall stopping at y9, `V9` for `V8`, fails 1 test).

- `Built 109 product icon drawings for 177 icon IDs in icons/witchynibbles-product-icons.woff`, then the file-icon line above, then `0` (the whole build leaves the color themes and the product font unchanged, and rewrites the file icons byte for byte: `git add -A && git write-tree` after it gives the same tree as Step 6).

- [ ] **Step 4: Run the file-icon sheet procedure and judge `contract`**

Run the file-icon sheet procedure. Expected: `… 51 resolved SVGs`; `sheet@1x.png` 1700×4352, `sheet@2x.png` 3400×8704, `reference@1x.png` 1272×1304, `reference@2x.png` 2544×2608.

Check at 16px, 1× and 2×: `contract` reads as a document with two lines of text and a round seal at its lower-right corner, the seal apart from the sheet (one clear pixel to the wall's cut end) in colour and in grayscale; beside `parchment` it is told apart by the missing fold and the seal. What was seen while drafting: it reads in all four themes and in grayscale at both scales; browser and reference agree.

- [ ] **Step 5: Judge the sample side by side**

Create `review-out/g5-sample/lineup.mjs`:

```js
// Throwaway (Task 13): every committed source as a sketch.mjs candidate list, for the side-by-side judgement.
import fs from 'node:fs';
import path from 'node:path';
import { fileGlyphModules } from '../../scripts/file-glyphs/index.mjs';
import { parseGlyphSvg } from '../../scripts/lib/svg-geometry.mjs';
const dir = path.resolve(import.meta.dirname, '../../icons/file-src');
export const candidates = Object.fromEntries(fileGlyphModules.flatMap(({ drawings }) => Object.keys(drawings)).map((name) => [name,
  parseGlyphSvg(fs.readFileSync(path.join(dir, `${name}.svg`), 'utf8')).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }))]));
```

```bash
node review-out/g5-sample/sketch.mjs review-out/g5-sample/lineup.mjs review-out/g5-sample/lineup.json
python3 review-out/g5-sample/compose.py review-out/g5-sample/lineup.json review-out/g5-sample/lineup.png
```

Expected: `9 candidates -> review-out/g5-sample/lineup.json`, `review-out/g5-sample/lineup.png (2860, 1244)`.

Judge `lineup.png` with the sheet of Step 4 (its colour rows hold every drawing at 16 and 32px on every side bar, selected row and quick-input focus; its grayscale copy the same):

- Every drawing is named without its label at 16px in one colour (grayscale): page, folder, open folder, folder with a book, gem, snake, keys, document with a seal. The look-alikes of the sample differ in silhouette: `contract` from `parchment` (the fold, the seal), `folder-src` from `folder` (the badge corner), `folder-src-open` from `folder-open`.
- Weight: the defaults are 1-unit outlines; `gem-cut` (solid crown) and `snake` (2-unit band) are the heaviest, `keyring` and `contract` sit between. In a tree the code icons stand out a step more than the rest; that is the category, not a defect.
- Position: `gem-cut` spans y1-14 and `snake` y2-15; the folders y2-14 and the sheets y1-15. In a row of 16px icons they line up; the gem's flat top sits one pixel higher than a folder's tab.
- On the selected rows of Moonlit, Daydream and Coven Contrast (and their quick-input focus, which is the same colour) every colour of the sample is under 3:1: muted 1.02-1.25:1, code 1.13-1.52:1, data 1.12-2.34:1, docs 2.19-2.81:1; the badge, the gem, the snake and the folders nearly vanish on Daydream's `#B52776`. On Moonlit Candle's `#633B79` every drawing keeps 3:1. This is the F9 evidence for the gate README (twelve warning lines, Step 3).
- What was seen while drafting: all nine read at 1× and 2× on the four side bars and in grayscale; no drawing was redrawn after its task.

- [ ] **Step 6: Snapshot the tree**

Run: `git add -A && git write-tree | tee review-out/g5/TREE_13`
Expected: one tree id.


## Part C: the gate-5 harness, the file fixture, and review gate 5

Part C takes the gate-4 harness to gate 5 (spec 6.3, F4, F5): a job may name its own fixture, a quick-input wait requires a focused result row, the contact sheet adds a grayscale column, the gate run closes its agent-browser session, and a new fixture `review/workspace-files/` holds a file or folder for every key of spec 6. Then the gate-5 job, its dry runs, and the gate run with its README. Part C draws nothing and maps nothing; its scenes match VS Code's own class names (`<name>-name-file-icon`, `codicon-*`), so they do not depend on the drawings of Parts A and B, only the pictures in the sheets do.

Part C was drafted on `538035f` alone and its numbers were re-measured with Parts A and B applied first (Task 14 adds 6 tests, Task 15 adds 9: 477 → 483 → 492). Capture counts, test names, the TAP numbers inside the three review test files and every wait are the same with or without Parts A and B; only the icons in the sheets differ. Part C changes no file Parts A and B change, except `package.json`, where Task 15 sets `scripts.test` with `npm pkg set` so the scripts Part A added stay as they are.

### How each gate-5 surface is brought on screen (checked in VS Code 1.141 while drafting this part)

| Scene | What it shows | How | Waits for | Crop |
| :- | :- | :- | :- | :- |
| `explorer-closed` | The sample, folders closed: `potions` (matches no key: the default folder), `source` and `src` (the `src` badge), `LICENSE`, `LICENSE.md`, `notes.unknown` (the default parchment), `sample.ts`/`.mts`/`.cts`, `sample.py`/`.pyw`, `sample.json`/`.jsonc` | Scene setting `files.exclude` hides the other 92 top-level entries of the fixture; Collapse Folders; focus moves to the editor group, so no row is focused | 13 rows, each sample label inside the tree's list box, none expanded or selected, the tree not focused | `.part.sidebar`, 420 CSS px |
| `explorer-open` | `src` and `potions` expanded (`src/index.ts`, `potions/.keep`), `LICENSE` selected in the focused tree | Opens `src/index.ts`, `potions/.keep`, then `LICENSE` by quick open (auto-reveal expands each parent); one chord reveals the active file and focuses the Files Explorer. `source` is excluded too (see findings) | 14 rows inside the list box; `src` and `potions` `aria-expanded="true"`; the `LICENSE` row `selected` and `focused` with the focus inside the tree, so it is drawn in `list.activeSelectionBackground` (F9) | `.part.sidebar`, 420 CSS px |
| `tabs` | `sample.ts`, `sample.py`, `sample.json` and `LICENSE` open, `LICENSE` pinned with the gate-4 pushpin (G32) | Both side bars closed; four quick opens; Pin Editor on `LICENSE` (the active editor) | The four tab labels inside the tab bar, exactly four tabs, `.tab.sticky:not(.dirty) > .tab-actions .codicon-pinned` on the `LICENSE` tab | `.part.editor .tabs-and-actions-container` |
| `breadcrumbs` | `src › index.ts` | Quick open `src/index.ts` | The `index.ts` file label inside the breadcrumb bar and one folder item | `.part.editor .breadcrumbs-control` |
| `quick-open` | `sample.` listed: ts, py, json and their sibling extensions, the first row focused (`quickInputList.focusBackground`, F9) | Quick open, type `sample.` (same `files.exclude` as `explorer-closed`) | The shared focused-row wait, then the ts, py and json labels inside the list | `.quick-input-widget` |
| `symbols` | Go to Symbol in `fixtures/pins.grimoire`: `symbol-constructor`, `symbol-key`, `symbol-object`, `symbol-package` (G34, `PINNED_AFTER_GATE_4_RUN`) | Quick open the grimoire; Go to Symbol in Editor. The review helper (gate 4) reads each `<kind> <name>` line as one symbol | The four `codicon-symbol-*` classes inside the list | `.quick-input-widget` |

Every scene runs in all four color themes at 100% and 200%, with WitchyNibbles Icons and WitchyNibbles Product Icons selected (the review profile's base settings; no gate-5 scene overrides either). A run gives 6 scenes × 2 captures (`full` and one crop) × 4 themes × 2 scales = 96 captures and six contact sheets.

Findings that shaped the fixture, the scenes and the harness:

- **The fixture breaks `npm test` as `node --test` collects it.** Without a pattern, `node --test` (Node 24) runs every `**/*.test.{js,mjs,cjs,ts,mts,cts}` and `**/test/**/*.js` in the repo. The fixture's `sample.test.*` files ran as six extra test files, and the `.js` and `.ts` ones failed on the fixture's empty `package.json` (`Invalid package config`): 416 tests, 2 failures, in a probe. `npm test` now runs `node --test "test/**/*.test.mjs"`, which collects exactly the 410 tests of `538035f` (checked) and also stops `review-out/` scratch files from running.
- **Git ignored the fixture's `node_modules`.** `.gitignore` line 1 (`node_modules/`) matched `review/workspace-files/node_modules/.keep` (`git check-ignore`), so the gate-6 cobweb folder would never have been committed. A negated rule re-includes that one folder; a test runs `git check-ignore --no-index` over every fixture file (global ignore rules included). No other fixture name (`.venv`, `.claude`, `.github`, `__pycache__`, `cache`, `dist`, `bin`, `lib`) is ignored.
- **At 200% the Explorer tree holds 14 full rows.** Its list is 326 CSS px tall (rows of 22 px) in the 1080p review window, measured with a probe overlay. The closed sample is 13 rows; with `src` and `potions` open it is 15, and the last row was cut by 4 CSS px, so the strict wait (each label inside the list box) timed out. `explorer-open` therefore also excludes `source`, the alias `explorer-closed` shows. Hiding the Outline and Timeline panes instead (`outline.toggleVisibility`, `timeline.toggleVisibility` through `runCommands`) did nothing in 1.141 and left the focus in the tree.
- **At 200% the editor between the two side bars held two tabs.** The other two scrolled out of the tab bar and the tabs wait timed out (`main/2/tabs`). The `tabs` scene closes both side bars first; the Explorer scenes open the primary side bar again themselves.
- **1.141 draws no icon on a folder item of the breadcrumb bar**, only on the file item (probe: the `src` item's `.monaco-icon-label` carries no `folder-icon` class). The `breadcrumbs` scene therefore waits for the file label and one folder item.
- **A resting pointer opened a tooltip.** A 200% launch stopped waiting for tooltips to close before its first capture: the machine's own pointer rested where the new window opened. Parking the page's pointer on a status-bar gap (the gate-3 park point) then stopped a gate-4 dry run before `find-replace` at 200%: a status-bar item that appears later grew under it. Every launch now moves the page's pointer to the middle of the activity bar's empty stretch, between its view icons and the accounts and settings icons, where nothing has a tooltip and no scene draws.
- **Opening `sample.py` raised "install the recommended Python extension".** The review profile sets `extensions.ignoreRecommendations: true`.
- **Quick open with a typed name needs a focused row, not a visible widget.** The list fills after the widget shows; Enter before a row is focused opens nothing. The shared wait (`{ "until": "quick-input-row", "file": "<name>" }`) also checks that the focused row is the asked file, through VS Code's `<lower-case name>-name-file-icon` class (no row text is read). Typing `sample.ts` lists `sample.ts` first, ahead of `sample.test.ts` and `sample.spec.ts`; the wait would stop the run if it did not.
- **The quick-open list puts "recently opened" files first.** In a full run the focused row is `sample.py` (the most recently opened match, from `tabs`); run alone, the order differs. The wait does not depend on which row is focused.
- **F9 is wider than the style colour.** Computed from spec 6's palette and the four theme files (`contrast` from `src/color.mjs`): on Moonlit Candle's selection `#633B79` every role reaches 3:1 (style 3.24, the lowest); on Moonlit's `#F04EAB` no role does (1.23 to 2.81); on Daydream's `#B52776` every role is 1.00 to 1.13 except docs 2.19; on Coven Contrast's `#FF67B7` (list selection and quick-input focus, G29) 1.00 to 2.67. Daydream and Moonlit set no `quickInputList.focusBackground`, so their focused quick-input row takes the list selection colour (seen in the dry runs). Part A's soft warning reports these; Task 16's README puts them in front of the author with the sheets.
- **Privacy.** The fixture folder is copied as `workspace`, so the window title and the command centre read `workspace`. The Explorer, tabs, breadcrumbs and quick open show only fixture names. A failed run's last line (`capture failed …; partial output in …`) holds the Windows Temp path with the Windows user name: never paste error output anywhere tracked.
- **The agent-browser session.** `contact-sheet.mjs` opens the session that renders the sheets and now closes it in a `finally`; the run prints `✓ Browser closed` before `… contact sheets in …`. `agent-browser session list` can still show the session for a second or two while its daemon exits, then prints `No active sessions`.

### Task 14: Harness for gate 5: a job's own workspace, a shared focused-row wait, the grayscale column, the session closed, the pointer parked

**Files:**
- Create: `scripts/review/waits.mjs`, `scripts/review/workspace.mjs`, `test/review-workspace.test.mjs`
- Modify: `scripts/review/run-gate.mjs`, `scripts/review/contact-sheet.mjs`, `scripts/review/capture.mjs`, `review/profile/settings.base.json`, `review/jobs/gate-4.json` (its 12 quick-input waits), `test/review-args.test.mjs`, `test/review-harness.test.mjs`

**Interfaces:**
- Consumes: nothing from Parts A and B.
- Produces:
  - Job field `"workspace"`: a folder of `review/` (`/^review\/[\w-][\w.-]*$/`), default `review/workspace`. `workspaceOf(job, root?)` (`scripts/review/workspace.mjs`) returns it and, given the repo root, throws `The job's workspace <w> is not a folder`; `run-gate.mjs` calls it before it builds anything (exit 2 with the usage). `prepareWorkspace(root, job, dest)` copies the fixture to `dest`; only the default fixture becomes the gate-2 git repository (the code moved verbatim from `run-gate.mjs`), any other is copied as it is, with no repository. `DEFAULT_WORKSPACE = 'review/workspace'`. The gate 1-4 jobs and `smoke.json` have no `workspace` field.
  - Named waits (`scripts/review/waits.mjs`): a step `{ "until": "quick-input-row", "file"?: "<name>", "timeout"?: n }` becomes `{ "waitFor": WAITS['quick-input-row']({ file }), "timeout"?: n }` in the `job.json` that `run-gate.mjs` writes (`resolveWaits(job)`, called before anything is built; an unknown name, `until` with `waitFor`, or `file` without `until` stops with exit 2). `quick-input-row`: the quick input is visible and its list has a `.monaco-list-row.focused` inside the list box; with `file`, that row's icon label carries `<file lower-cased>-name-file-icon`.
  - `review/jobs/gate-4.json`: every quick-open chord is followed by `{ "until": "quick-input-row", "file": "<the chord's file>", "timeout": 10000 }` instead of the visibility-only wait (12 steps). The captures are unchanged.
  - `contact-sheet.mjs`: each scale is followed by a `<scale>% grayscale` column of the same captures (`style="filter:grayscale(1)"`); `agent-browser close` runs in a `finally`.
  - `capture.mjs`: `PARK_POINT`, and every launch moves the page's pointer there before the first scene.
  - `review/profile/settings.base.json`: `"extensions.ignoreRecommendations": true`.

Why the gate-4 job is retrofitted: it is the only job that presses Enter after a quick open, and the one gate 6 copies scenes from. The stricter wait cannot change a crop; it only turns a lost Enter into a stop that names the step. The gate 1-3 jobs press Enter after a fixed delay and stay as they are (F5: still deferred, with their reproduction).

- [ ] **Step 1: Write the failing tests**

```bash
git apply <<'PATCH'
diff --git a/test/review-args.test.mjs b/test/review-args.test.mjs
index d8a3692..b7bb02f 100644
--- a/test/review-args.test.mjs
+++ b/test/review-args.test.mjs
@@ -7,6 +7,7 @@ import fs from 'node:fs';
 import os from 'node:os';
 import path from 'node:path';
 import { filterJob, parseGateArgs } from '../scripts/review/args.mjs';
+import { WAITS, resolveWaits } from '../scripts/review/waits.mjs';
 
 const root = path.resolve(import.meta.dirname, '..');
 const job = () => ({
@@ -86,6 +87,49 @@ test('run-gate.mjs drops the variants pass before it cuts the job, so a scene on
   }
 });
 
+test('resolveWaits writes a named wait out as the waitFor expression capture.mjs evaluates', () => {
+  // Gate-4 review: quick-input waits checked only that the widget was visible, so Enter could land before a result row
+  // was focused. The focused-row wait is written once (scripts/review/waits.mjs) and every job names it.
+  const job = { passes: [], scenes: [{ name: 'open', setup: [{ press: 'alt+shift+F7' }, { until: 'quick-input-row', file: 'Sample.ts', timeout: 10000 }, { press: 'Enter' }],
+    teardown: [{ until: 'quick-input-row' }] }] };
+  const [, wait] = resolveWaits(job).scenes[0].setup;
+  assert.deepEqual(Object.keys(wait).sort(), ['timeout', 'waitFor']);
+  assert.equal(wait.waitFor, WAITS['quick-input-row']({ file: 'Sample.ts' }));
+  assert.match(wait.waitFor, /\.quick-input-list/);
+  assert.match(wait.waitFor, /\.monaco-list-row\.focused/, 'a focused result row, not only a visible widget');
+  assert.match(wait.waitFor, /r\.top >= box\.top && r\.bottom <= box\.bottom/, 'inside the list, not scrolled away');
+  assert.match(wait.waitFor, /classList\.contains\("sample\.ts-name-file-icon"\)/, 'the focused row is the file asked for (VS Code lowercases the name class)');
+  assert.doesNotMatch(WAITS['quick-input-row']({}), /name-file-icon/, 'without a file, any focused row');
+  assert.equal(resolveWaits(job).scenes[0].teardown[0].waitFor, WAITS['quick-input-row']({}));
+  assert.deepEqual(job.scenes[0].setup[1], { until: 'quick-input-row', file: 'Sample.ts', timeout: 10000 }, 'the job itself is not changed');
+  assert.throws(() => resolveWaits({ scenes: [{ name: 'x', setup: [{ until: 'quick-input-rows' }] }] }), /x setup\[0\]: unknown wait 'quick-input-rows'/);
+  assert.throws(() => resolveWaits({ scenes: [{ name: 'x', setup: [{ until: 'quick-input-row', waitFor: 'true' }] }] }), /x setup\[0\]: a step names a wait or gives waitFor, not both/);
+  assert.throws(() => resolveWaits({ scenes: [{ name: 'x', teardown: [{ waitFor: 'true', file: 'a.ts' }] }] }), /x teardown\[0\]: file belongs to an until step/);
+});
+
+test('run-gate.mjs stops before it builds anything when the job names a missing workspace or an unknown wait', () => {
+  // PATH is emptied, as above, so a run-gate.mjs that went on would fail at its first shell command instead of building.
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-job-'));
+  const file = path.join(dir, 'job.json');
+  const base = { passes: [{ name: 'main', vsix: ['spellbound-main.vsix'], scales: [1] }], scenes: [{ name: 'panel', crops: [{ name: 'c', selector: 'body' }] }] };
+  try {
+    for (const [job, message] of [
+      [{ ...base, workspace: 'review/no-such-fixture' }, /review\/no-such-fixture is not a folder/],
+      [{ ...base, workspace: '../outside' }, /"workspace" must name a folder of review\//],
+      [{ ...base, scenes: [{ ...base.scenes[0], setup: [{ until: 'nothing' }] }] }, /panel setup\[0\]: unknown wait 'nothing'/],
+    ]) {
+      fs.writeFileSync(file, JSON.stringify(job));
+      const result = spawnSync(process.execPath, ['scripts/review/run-gate.mjs', '--job', path.relative(root, file)],
+        { cwd: root, encoding: 'utf8', timeout: 10000, env: { ...process.env, PATH: '' } });
+      assert.equal(result.status, 2, result.stderr);
+      assert.match(result.stderr, message);
+      assert.match(result.stderr, /^Usage: /m);
+    }
+  } finally {
+    fs.rmSync(dir, { recursive: true, force: true });
+  }
+});
+
 test('run-gate.mjs stops on an unknown option before it builds or launches anything, and prints usage for --help', () => {
   const run = (...args) => spawnSync(process.execPath, ['scripts/review/run-gate.mjs', ...args], { cwd: root, encoding: 'utf8', timeout: 10000 });
   const bad = run('--jobs', 'review/jobs/gate-3.json');
diff --git a/test/review-harness.test.mjs b/test/review-harness.test.mjs
index d04d46b..33b0b46 100644
--- a/test/review-harness.test.mjs
+++ b/test/review-harness.test.mjs
@@ -4,7 +4,10 @@
 import test from 'node:test';
 import assert from 'node:assert/strict';
 import fs from 'node:fs';
+import os from 'node:os';
 import path from 'node:path';
+import { spawnSync } from 'node:child_process';
+import { WAITS } from '../scripts/review/waits.mjs';
 
 const root = path.resolve(import.meta.dirname, '..');
 const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
@@ -24,7 +27,7 @@ test('every file the harness needs exists', () => {
     'review/helper-extension/package.json', 'review/helper-extension/extension.js', 'review/helper-extension/README.md',
     'review/helper-extension/media/sheet.svg', ...JOBS,
     'scripts/review/stage-extension.mjs', 'scripts/review/capture.mjs', 'scripts/review/run-gate.mjs', 'scripts/review/contact-sheet.mjs',
-    'scripts/review/args.mjs', 'scripts/review/privacy-scan.mjs',
+    'scripts/review/args.mjs', 'scripts/review/privacy-scan.mjs', 'scripts/review/waits.mjs', 'scripts/review/workspace.mjs',
   ]) assert.ok(exists(file), file);
 });
 
@@ -45,8 +48,10 @@ test('job files follow the schema and press only bound chords or plain keys', ()
     for (const scene of job.scenes) {
       assert.ok(scene.crops?.length, `${file} ${scene.name} has no crops`);
       for (const step of [...(scene.setup ?? []), ...(scene.teardown ?? [])]) {
-        assert.ok(step.press || step.insert || step.hover || step.hold || step.waitFor || step.wait, `${file} ${scene.name}: empty step`);
+        assert.ok(step.press || step.insert || step.hover || step.hold || step.waitFor || step.until || step.wait, `${file} ${scene.name}: empty step`);
         if (step.hold) assert.equal(step.hold, 'alt', `${file} ${scene.name}: only Alt can be held`);
+        if (step.until) assert.ok(Object.hasOwn(WAITS, step.until), `${file} ${scene.name}: ${step.until} is not a named wait`);
+        if (step.file) assert.ok(step.until, `${file} ${scene.name}: file belongs to an until step`);
         if (step.press) assert.ok(bound.has(step.press) || PLAIN_KEYS.has(step.press), `${file} ${scene.name}: ${step.press} is not bound`);
       }
     }
@@ -104,9 +109,10 @@ test('gate 2 scenes that change the fixture repository put it back', () => {
     if (!(scene.setup ?? []).some((step) => changing.has(step.press))) continue;
     assert.ok((scene.teardown ?? []).some((step) => step.press === restore), `${scene.name} restores the dirty branch`);
   }
-  const runGate = read('scripts/review/run-gate.mjs');
-  assert.match(runGate, /'checkout', '-q', '-b', 'rival-brew'/, 'the fixture has a branch that conflicts');
-  assert.match(runGate, /'remote', 'add', 'origin', '\.\.\/origin\.git'/, 'the fixture has an upstream with a relative URL');
+  // prepareWorkspace (scripts/review/workspace.mjs) builds the repository; test/review-workspace.test.mjs checks the states.
+  const workspace = read('scripts/review/workspace.mjs');
+  assert.match(workspace, /'checkout', '-q', '-b', 'rival-brew'/, 'the fixture has a branch that conflicts');
+  assert.match(workspace, /'remote', 'add', 'origin', '\.\.\/origin\.git'/, 'the fixture has an upstream with a relative URL');
   assert.match(read('review/helper-extension/extension.js'), /merge\('rival-brew'\)/);
 });
 
@@ -283,13 +289,13 @@ test('the fixture keeps LF line endings, so a merge abort does not dirty README.
   // Gate run 2026-10-10T10-28-47: Windows git (core.autocrlf true) wrote README.md back with CRLF on the 100% pass's
   // merge --abort; the 125% launch restored the LF original, the index still held the CRLF size, and git merge refused
   // ("Your local changes to the following files would be overwritten by merge: README.md"), so scm-conflict timed out.
-  assert.match(read('scripts/review/run-gate.mjs'), /git\('config', 'core\.autocrlf', 'false'\)/);
+  assert.match(read('scripts/review/workspace.mjs'), /git\('config', 'core\.autocrlf', 'false'\)/);
 });
 
 test('restoring the workspace never shows up as a change in the terminal listing', () => {
   // Gate run 2026-10-10T02-02-52: files rewritten from Windows lose their WSL mode bits, so WSL git (ll, the prompt)
   // listed every file as modified. The fixture repo ignores modes, and only files whose content changed are rewritten.
-  assert.match(read('scripts/review/run-gate.mjs'), /git\('config', 'core\.fileMode', 'false'\)/);
+  assert.match(read('scripts/review/workspace.mjs'), /git\('config', 'core\.fileMode', 'false'\)/);
   const source = read('scripts/review/capture.mjs');
   const body = source.slice(source.indexOf('function restoreWorkspace'), source.indexOf('\n}\n', source.indexOf('function restoreWorkspace')));
   assert.ok(body.length > 0, 'restoreWorkspace is a function');
@@ -668,18 +674,28 @@ test('the gate 4 fixtures give one symbol of each kind and a gutter line whose o
   for (const neighbour of [lines[2], lines[4]]) assert.match(neighbour, /^\S.+/);
 });
 
-test('every gate 4 quick open waits for the quick input before it presses Enter', () => {
+test('every gate 4 quick open waits for a focused row of the file it opens before it presses Enter', () => {
   // The first gate-4 probe lost a quick-open chord at startup (the chat input still had the focus). Waiting for the
-  // widget turns that into a stop that names the scene.
-  const quickOpen = new Set(json('review/profile/keybindings.json').filter((binding) => binding.command === 'workbench.action.quickOpen').map((binding) => binding.key));
+  // widget turns that into a stop that names the scene. Gate 5 (spec 6.3): a visible widget is not enough, because Enter
+  // opens nothing until a result row is focused, so the wait is the shared focused-row wait, naming the file.
+  const quickOpen = new Map(json('review/profile/keybindings.json').filter((binding) => binding.command === 'workbench.action.quickOpen').map((binding) => [binding.key, binding.args]));
+  let checked = 0;
   for (const scene of gate4().scenes) {
-    const steps = [...(scene.setup ?? []), ...(scene.teardown ?? [])];
-    steps.forEach((step, index) => {
-      if (!quickOpen.has(step.press)) return;
-      assert.match(String(steps[index + 1]?.waitFor), /\.quick-input-widget/, `${scene.name}: waits for the quick input`);
-      assert.equal(steps[index + 2]?.press, 'Enter', `${scene.name}: then presses Enter`);
-    });
+    for (const phase of ['setup', 'teardown']) {
+      const steps = scene[phase] ?? [];
+      steps.forEach((step, index) => {
+        if (!quickOpen.has(step.press)) return;
+        const wait = steps[index + 1];
+        assert.equal(wait?.until, 'quick-input-row', `${scene.name} ${phase}[${index}]: waits for a focused row`);
+        assert.ok(!wait.optional, `${scene.name} ${phase}[${index}]: not optionally`);
+        assert.equal(wait.file, quickOpen.get(step.press).split(':')[0], `${scene.name} ${phase}[${index}]: the row of the file the chord opens`);
+        assert.equal(steps[index + 2]?.press, 'Enter', `${scene.name} ${phase}[${index}]: then presses Enter`);
+        checked += 1;
+      });
+    }
   }
+  assert.equal(checked, 12, 'every quick open of the gate-4 job');
+  assert.doesNotMatch(JSON.stringify(gate4()), /return !!w && w\.style\.display !== 'none' && w\.getBoundingClientRect\(\)\.height > 0; \}\)\(\)/, 'no visibility-only quick-input wait is left');
 });
 
 test('every gate 4 quick open follows a wait for the editor group to hold the focus', () => {
@@ -726,3 +742,53 @@ test('a capture timeout names the scene and step and describes the focus without
     assert.ok(!new RegExp(`\\.${forbidden}\\b`).test(diagnostics) && !diagnostics.includes(`${forbidden}(`), `no ${forbidden} in the diagnostics`);
   }
 });
+
+test('the contact sheet adds a grayscale copy of every capture beside each scale, and closes its agent-browser session', () => {
+  // Spec 6.3: every drawing stays identifiable in grayscale, so each scale gets a second column of the same captures with
+  // filter: grayscale(1). Gate 4: the session the sheets open stayed open after every gate run; it is closed even when a
+  // screenshot fails. A fake agent-browser on PATH records the calls.
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-sheet-'));
+  try {
+    const bin = path.join(dir, 'bin');
+    fs.mkdirSync(bin);
+    fs.writeFileSync(path.join(bin, 'agent-browser'), '#!/bin/sh\necho "$*" >> "$SHEET_LOG"\nif [ "$1" = screenshot ] && [ -n "$SHEET_FAIL" ]; then exit 1; fi\nexit 0\n', { mode: 0o755 });
+    const run = path.join(dir, 'run');
+    fs.mkdirSync(path.join(run, 'captures'), { recursive: true });
+    const capture = (scale, crop) => ({ pass: 'main', scale, scene: 'tabs', theme: 'daydream', variant: 'default', crop, file: `main/${scale}/tabs/daydream/default/${crop}.png` });
+    fs.writeFileSync(path.join(run, 'captures', 'manifest.json'), JSON.stringify({ vscodeVersion: '1.141.0', mode: 'device-scale', run: 'r', repoCommit: '0123456789', repoDirty: true,
+      captures: [capture(1, 'full'), capture(1, 'tabs'), capture(2, 'tabs')] }));
+    const sheet = (env) => spawnSync(process.execPath, ['scripts/review/contact-sheet.mjs', run],
+      { cwd: root, encoding: 'utf8', timeout: 20000, env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, SHEET_LOG: path.join(dir, 'log'), ...env } });
+    const calls = () => fs.readFileSync(path.join(dir, 'log'), 'utf8').trim().split('\n');
+
+    const ok = sheet({});
+    assert.equal(ok.status, 0, ok.stderr);
+    const html = fs.readFileSync(path.join(run, 'sheets', 'main-tabs-tabs.html'), 'utf8');
+    assert.deepEqual([...html.matchAll(/<th>([^<]*)<\/th>/g)].map((match) => match[1]), ['', '100%', '100% grayscale', '200%', '200% grayscale', 'daydream · default']);
+    const images = [...html.matchAll(/<img src="([^"]+)"( style="filter:grayscale\(1\)")?>/g)].map((match) => [match[1], Boolean(match[2])]);
+    assert.deepEqual(images, [['../captures/main/1/tabs/daydream/default/tabs.png', false], ['../captures/main/1/tabs/daydream/default/tabs.png', true],
+      ['../captures/main/2/tabs/daydream/default/tabs.png', false], ['../captures/main/2/tabs/daydream/default/tabs.png', true]]);
+    assert.equal(calls().at(-1), 'close', 'the session is closed after the last sheet');
+
+    fs.rmSync(path.join(dir, 'log'));
+    const failed = sheet({ SHEET_FAIL: '1' });
+    assert.notEqual(failed.status, 0, 'a failed screenshot fails the sheet step');
+    assert.deepEqual(calls().slice(-2).map((call) => call.split(' ')[0]), ['screenshot', 'close'], 'and still closes the session');
+  } finally {
+    fs.rmSync(dir, { recursive: true, force: true });
+  }
+});
+
+test('every launch parks the page pointer on the empty stretch of the activity bar, and no extension recommendation toast opens', () => {
+  // Gate-5 dry runs: a 200% launch stopped waiting for tooltips to close before its first capture (the machine's pointer
+  // rested over the new window); parked on a status bar gap, the pointer later sat on an item that had grown under it; and
+  // opening sample.py raised the "install the recommended Python extension" toast.
+  const capture = read('scripts/review/capture.mjs');
+  const point = capture.match(/const PARK_POINT = `([^`]+)`;/)?.[1];
+  assert.ok(point, 'one park point');
+  assert.match(point, /document\.querySelector\('\.part\.activitybar'\)/);
+  assert.match(point, /bar\.querySelectorAll\('\.action-item'\)/, 'between the icons, not on one');
+  const park = capture.indexOf("await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: park.x, y: park.y });");
+  assert.ok(park > capture.indexOf("label: 'the WitchyNibbles product icons'") && park < capture.indexOf('for (const scene of job.scenes'), 'after the launch, before the first scene');
+  assert.equal(json('review/profile/settings.base.json')['extensions.ignoreRecommendations'], true);
+});
diff --git a/test/review-workspace.test.mjs b/test/review-workspace.test.mjs
new file mode 100644
index 0000000..ad821a0
--- /dev/null
+++ b/test/review-workspace.test.mjs
@@ -0,0 +1,58 @@
+// The review fixtures a gate job opens. Gates 1-4 open review/workspace, which run-gate.mjs turns into a git repository
+// in the gate-2 states; a job may name another folder of review/ (gate 5: review/workspace-files, the file-icon fixture).
+import test from 'node:test';
+import assert from 'node:assert/strict';
+import fs from 'node:fs';
+import os from 'node:os';
+import path from 'node:path';
+import { execFileSync } from 'node:child_process';
+import { DEFAULT_WORKSPACE, prepareWorkspace, workspaceOf } from '../scripts/review/workspace.mjs';
+
+const root = path.resolve(import.meta.dirname, '..');
+const listing = (dir, relative = '') => fs.readdirSync(path.join(dir, relative), { withFileTypes: true }).flatMap((entry) => {
+  const item = path.posix.join(relative, entry.name);
+  return entry.isDirectory() ? [`${item}/`, ...listing(dir, item)] : [item];
+}).sort();
+
+test('workspaceOf reads the job\'s "workspace", a folder of review/, and defaults to the gate 1-4 fixture', () => {
+  assert.equal(DEFAULT_WORKSPACE, 'review/workspace');
+  assert.equal(workspaceOf({}), 'review/workspace');
+  assert.equal(workspaceOf({ workspace: 'review/workspace-files' }), 'review/workspace-files');
+  for (const workspace of ['../outside', '/tmp/x', 'review/..', 'review/a/b', 'review/', 'workspace', 7]) {
+    assert.throws(() => workspaceOf({ workspace }), /"workspace" must name a folder of review\//, String(workspace));
+  }
+  assert.equal(workspaceOf({}, root), 'review/workspace', 'with the repo root, the folder must exist');
+  assert.throws(() => workspaceOf({ workspace: 'review/no-such-fixture' }, root), /review\/no-such-fixture is not a folder/);
+  for (const file of ['review/jobs/gate-1.json', 'review/jobs/gate-2.json', 'review/jobs/gate-3.json', 'review/jobs/gate-4.json', 'review/jobs/smoke.json']) {
+    assert.equal(JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')).workspace, undefined, `${file} keeps the default fixture`);
+  }
+});
+
+test('prepareWorkspace turns the default fixture into the gate-2 git states and copies any other fixture as it is', () => {
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-workspace-'));
+  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trimEnd();
+  try {
+    // The default fixture: a repository on moonlit-review with an upstream, a branch that conflicts with it, and the
+    // changes the gate-2 status-bar scenes show (spells.ts modified, new-spell.ts untracked).
+    const gate = path.join(dir, 'gate', 'workspace');
+    prepareWorkspace(root, {}, gate);
+    assert.equal(git(gate, 'branch', '--show-current'), 'moonlit-review');
+    assert.deepEqual(git(gate, 'branch', '--format=%(refname:short)').split('\n').sort(), ['moonlit-review', 'rival-brew']);
+    assert.equal(git(gate, 'remote', 'get-url', 'origin'), '../origin.git');
+    assert.deepEqual(git(gate, 'status', '--porcelain').split('\n').sort(), [' M spells.ts', '?? new-spell.ts']);
+    assert.equal(git(gate, 'config', 'core.autocrlf'), 'false');
+    assert.equal(git(gate, 'config', 'core.fileMode'), 'false');
+
+    // Any other fixture: the same files, no repository, so the Explorer shows no git colours or badges over the icons.
+    const fixtureRoot = path.join(dir, 'repo');
+    fs.mkdirSync(path.join(fixtureRoot, 'review', 'tiny', 'folder'), { recursive: true });
+    fs.writeFileSync(path.join(fixtureRoot, 'review', 'tiny', 'a.unknown'), '');
+    fs.writeFileSync(path.join(fixtureRoot, 'review', 'tiny', 'folder', '.keep'), '');
+    const files = path.join(dir, 'files', 'workspace');
+    prepareWorkspace(fixtureRoot, { workspace: 'review/tiny' }, files);
+    assert.deepEqual(listing(files), ['a.unknown', 'folder/', 'folder/.keep']);
+    assert.ok(!fs.existsSync(path.join(dir, 'files', 'origin.git')), 'no upstream either');
+  } finally {
+    fs.rmSync(dir, { recursive: true, force: true });
+  }
+});
PATCH
```

What the patch does:
- `test/review-args.test.mjs`: `resolveWaits` writes the named wait out (the focused row, inside the list, the lower-cased name class with `file`, any focused row without it), leaves the job object unchanged, and stops on an unknown name, on `until` with `waitFor`, and on `file` without `until`; `run-gate.mjs` exits 2 with the usage for a missing workspace, a workspace outside `review/`, and an unknown wait (spawned with an empty `PATH`, so a run-gate without the checks fails at its first shell command instead of building).
- `test/review-workspace.test.mjs` (new): `workspaceOf` reads `"workspace"`, rejects anything but a folder name under `review/`, checks the folder with the repo root, and the gate 1-4 and smoke jobs keep the default; `prepareWorkspace` builds the gate-2 git states from the default fixture (branch `moonlit-review` with an upstream `../origin.git`, `rival-brew`, ` M spells.ts`, `?? new-spell.ts`, `core.autocrlf` and `core.fileMode` false) and copies another fixture file for file with no repository (it runs WSL git in a temp folder).
- `test/review-harness.test.mjs`:
  - the schema test accepts `until` steps, only with a known name, and `file` only on them; the file list names the two new modules;
  - the three tests that read the git setup out of `run-gate.mjs` read `scripts/review/workspace.mjs`;
  - `every gate 4 quick open waits for the quick input before it presses Enter` becomes `every gate 4 quick open waits for a focused row of the file it opens before it presses Enter`: all 12 quick opens, the file each chord opens, no visibility-only wait left;
  - `the contact sheet adds a grayscale copy …` runs `contact-sheet.mjs` against a two-scale manifest with a fake `agent-browser` on `PATH` that records its calls: headers `100%`, `100% grayscale`, `200%`, `200% grayscale`, each crop twice (the second grayscale), `close` last, and `close` after a failed screenshot too;
  - `every launch parks the page pointer …` requires `PARK_POINT` on the activity bar between its icons, the pointer moved there after the launch and before the first scene, and `extensions.ignoreRecommendations`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/review-args.test.mjs test/review-harness.test.mjs test/review-workspace.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|ERR_MODULE_NOT_FOUND' | sort -u`
Expected: `ℹ tests 3`, `ℹ pass 0`, `ℹ fail 3`, and `Error [ERR_MODULE_NOT_FOUND]` lines: each file stops at its import (`scripts/review/waits.mjs` for the first two, `scripts/review/workspace.mjs` for the third).

- [ ] **Step 3: Create the two modules, and run the tests again**

```bash
cat > scripts/review/waits.mjs <<'EOF'
// Named waits shared by the gate jobs. A step { "until": "<name>", ...options } becomes { "waitFor": "<expression>" }
// in the job.json that run-gate.mjs writes for capture.mjs, so a wait is written once and every job uses the same one.

// A quick input (quick open, Go to Symbol, a quick pick) with a focused result row inside its list. Gate 4 waited only
// for the widget to show, and Enter opens nothing until a row is focused (spec 6.3). With "file", the focused row must be
// that file: VS Code puts "<lower-case name>-name-file-icon" on the row's icon label, so no row text is read.
const quickInputRow = ({ file } = {}) => `(() => { const w = document.querySelector('.quick-input-widget');
  if (!w || w.style.display === 'none' || !w.getBoundingClientRect().height) return false;
  const list = w.querySelector('.quick-input-list .monaco-list'); const row = list?.querySelector('.monaco-list-row.focused');
  if (!row) return false; const box = list.getBoundingClientRect(); const r = row.getBoundingClientRect();
  return r.height > 0 && r.top >= box.top && r.bottom <= box.bottom${file
    ? ` && !!row.querySelector('.monaco-icon-label')?.classList.contains(${JSON.stringify(`${file.toLowerCase()}-name-file-icon`)})` : ''}; })()`;

export const WAITS = Object.freeze({ 'quick-input-row': quickInputRow });

export function resolveWaits(job) {
  const resolve = (step, where) => {
    if (step.file !== undefined && step.until === undefined) throw new Error(`${where}: file belongs to an until step`);
    if (step.until === undefined) return step;
    if (!Object.hasOwn(WAITS, step.until)) throw new Error(`${where}: unknown wait '${step.until}' (known: ${Object.keys(WAITS).join(', ')})`);
    if (step.waitFor !== undefined) throw new Error(`${where}: a step names a wait or gives waitFor, not both`);
    const { until, file, ...rest } = step;
    return { ...rest, waitFor: WAITS[until]({ file }) };
  };
  return {
    ...job,
    scenes: job.scenes.map((scene) => {
      const resolved = { ...scene };
      for (const phase of ['setup', 'teardown']) {
        if (scene[phase]) resolved[phase] = scene[phase].map((step, index) => resolve(step, `${scene.name} ${phase}[${index}]`));
      }
      return resolved;
    }),
  };
}
EOF
cat > scripts/review/workspace.mjs <<'EOF'
// The review fixture a gate job opens. A job may name a folder of review/ ("workspace"; gate 5: review/workspace-files,
// the file-icon fixture); without it, the gate 1-4 fixture review/workspace, which becomes a git repository in the
// gate-2 states.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const DEFAULT_WORKSPACE = 'review/workspace';

// With the repo root, the folder must also exist, so run-gate.mjs stops before it builds anything.
export function workspaceOf(job, root) {
  const workspace = job.workspace ?? DEFAULT_WORKSPACE;
  if (typeof workspace !== 'string' || !/^review\/[\w-][\w.-]*$/.test(workspace)) {
    throw new Error(`"workspace" must name a folder of review/, such as review/workspace-files; got ${JSON.stringify(workspace)}`);
  }
  if (root && !fs.statSync(path.join(root, workspace), { throwIfNoEntry: false })?.isDirectory()) throw new Error(`The job's workspace ${workspace} is not a folder`);
  return workspace;
}

// Copies the job's fixture to dest. Any fixture but the default one is copied as it is, with no repository, so the
// Explorer shows no git colours or badges over the file icons.
export function prepareWorkspace(root, job, dest) {
  const source = workspaceOf(job, root);
  fs.cpSync(path.join(root, source), dest, { recursive: true });
  if (source !== DEFAULT_WORKSPACE) return;
  const git = (...gitArgs) => execFileSync('git', ['-c', 'user.name=review', '-c', 'user.email=review@localhost', ...gitArgs], { cwd: dest, stdio: 'ignore' });
  git('init', '-q', '-b', 'moonlit-review');
  git('config', 'core.fileMode', 'false'); // Windows-side writes drop WSL mode bits; the terminal's git must not list them
  // Windows git checks files out as written (LF). With its default core.autocrlf true, a merge --abort wrote README.md back
  // with CRLF, the next scale's restore put LF back, and the stale index size made the next merge refuse to run.
  git('config', 'core.autocrlf', 'false');
  git('add', '-A');
  git('commit', '-q', '-m', 'review fixture');
  // Gate 2 git states: the git extension (Windows git) needs an identity to merge, a branch that conflicts with this one
  // on README.md (git-branch-conflicts, spellboundReview.scm), and an upstream, so the status bar shows sync, not Publish.
  git('config', 'user.name', 'review');
  git('config', 'user.email', 'review@localhost');
  const readmePath = path.join(dest, 'README.md');
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
  const spellsPath = path.join(dest, 'spells.ts');
  fs.writeFileSync(spellsPath, fs.readFileSync(spellsPath, 'utf8').replace('// Review fixture:', '// Review fixture, stirred:')); // diff-remove + diff-insert
  fs.appendFileSync(spellsPath, '\n// stirred during review\n'); // modified -> amber
  fs.writeFileSync(path.join(dest, 'new-spell.ts'), 'export const fresh = true;\n'); // untracked -> mint
}
EOF
node --test test/review-args.test.mjs test/review-harness.test.mjs test/review-workspace.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
node --test --test-reporter=tap test/review-args.test.mjs test/review-harness.test.mjs test/review-workspace.test.mjs 2>&1 | grep -E '^not ok'
```

Expected: `ℹ tests 54`, `ℹ pass 50`, `ℹ fail 4`; the failures are the behaviours the modules alone do not give:
- `not ok 7 - run-gate.mjs stops before it builds anything when the job names a missing workspace or an unknown wait`
- `not ok 48 - every gate 4 quick open waits for a focused row of the file it opens before it presses Enter`
- `not ok 51 - the contact sheet adds a grayscale copy of every capture beside each scale, and closes its agent-browser session`
- `not ok 52 - every launch parks the page pointer on the empty stretch of the activity bar, and no extension recommendation toast opens`

(`prepareWorkspace` passes already: the git setup moved into the module verbatim. Its test failing here would mean the move changed it.)

- [ ] **Step 4: Wire the harness: run-gate, the contact sheet, the park point, the profile, the gate-4 waits**

```bash
git apply <<'PATCH'
diff --git a/review/jobs/gate-4.json b/review/jobs/gate-4.json
index 14c433e..d29377d 100644
--- a/review/jobs/gate-4.json
+++ b/review/jobs/gate-4.json
@@ -37,11 +37,11 @@
         { "press": "ctrl+alt+shift+a", "wait": 500 },
         { "waitFor": "!!document.activeElement?.closest('.part.editor')", "timeout": 10000 },
         { "press": "ctrl+alt+shift+y", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "notes.md", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "press": "ctrl+alt+F1", "wait": 800 },
         { "press": "ctrl+alt+shift+1", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "spells.ts", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "press": "ctrl+alt+F1", "wait": 800 },
         { "insert": "✦ ", "wait": 800 },
@@ -54,7 +54,7 @@
         { "press": "ctrl+alt+F3", "wait": 800 },
         { "press": "ctrl+alt+F2", "wait": 500 },
         { "press": "ctrl+alt+shift+y", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "notes.md", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "press": "ctrl+alt+F2", "wait": 500 },
         { "press": "alt+shift+F5", "wait": 1000 }
@@ -67,11 +67,11 @@
         { "press": "ctrl+alt+shift+a", "wait": 500 },
         { "waitFor": "!!document.activeElement?.closest('.part.editor')", "timeout": 10000 },
         { "press": "ctrl+alt+shift+y", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "notes.md", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "press": "ctrl+alt+F1", "wait": 800 },
         { "press": "ctrl+alt+shift+1", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "spells.ts", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "press": "ctrl+alt+F1", "wait": 800 },
         { "insert": "✦ ", "wait": 800 },
@@ -84,7 +84,7 @@
         { "press": "ctrl+alt+F3", "wait": 800 },
         { "press": "ctrl+alt+F2", "wait": 500 },
         { "press": "ctrl+alt+shift+y", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "notes.md", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "press": "ctrl+alt+F2", "wait": 500 },
         { "press": "alt+shift+F5", "wait": 1000 }
@@ -94,7 +94,7 @@
       "name": "find-replace",
       "setup": [
         { "press": "ctrl+alt+shift+1", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "spells.ts", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "press": "ctrl+alt+F4", "wait": 800 },
         { "insert": "potion", "wait": 800 },
@@ -210,7 +210,7 @@
         { "press": "ctrl+alt+shift+a", "wait": 500 },
         { "waitFor": "!!document.activeElement?.closest('.part.editor')", "timeout": 10000 },
         { "press": "ctrl+alt+F10", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "hexes.ts", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "waitFor": "(() => { const c = document.querySelector('.part.editor .monaco-editor'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.margin .codicon-gutter-lightbulb-sparkle-filled'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 30000 }
       ],
@@ -236,7 +236,7 @@
       "name": "symbols",
       "setup": [
         { "press": "alt+shift+F1", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "symbols.grimoire", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "press": "ctrl+alt+F12", "wait": 1500 },
         { "waitFor": "(() => { const c = document.querySelector('.quick-input-widget .monaco-list'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-symbol-class', '.codicon-symbol-method', '.codicon-symbol-function', '.codicon-symbol-field', '.codicon-symbol-property', '.codicon-symbol-variable'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 15000 }
@@ -252,7 +252,7 @@
       "name": "symbols-2",
       "setup": [
         { "press": "alt+shift+F6", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "charms.grimoire", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "press": "ctrl+alt+F12", "wait": 1500 },
         { "waitFor": "(() => { const c = document.querySelector('.quick-input-widget .monaco-list'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-symbol-constant', '.codicon-symbol-interface', '.codicon-symbol-enum', '.codicon-symbol-module', '.codicon-symbol-namespace', '.codicon-symbol-string'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 15000 }
@@ -269,7 +269,7 @@
       "settings": { "workbench.iconTheme": null, "editor.wordBasedSuggestions": "off" },
       "setup": [
         { "press": "alt+shift+F1", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "symbols.grimoire", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "press": "alt+shift+F2", "wait": 2000 },
         { "waitFor": "(() => { const c = document.querySelector('.part.editor .suggest-widget'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-symbol-keyword', '.codicon-symbol-text', '.codicon-symbol-snippet', '.codicon-symbol-file', '.codicon-symbol-folder'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 15000 }
@@ -290,7 +290,7 @@
         { "press": "ctrl+alt+shift+3", "wait": 2000 },
         { "waitFor": "(() => { const c = document.querySelector('.part.editor .monaco-editor'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.margin .codicon-debug-breakpoint.codicon-debug-stackframe'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 40000 },
         { "press": "alt+shift+F3", "wait": 800 },
-        { "waitFor": "(() => { const w = document.querySelector('.quick-input-widget'); return !!w && w.style.display !== 'none' && w.getBoundingClientRect().height > 0; })()", "timeout": 10000 },
+        { "until": "quick-input-row", "file": "unbrewed.js", "timeout": 10000 },
         { "press": "Enter", "wait": 2000 },
         { "waitFor": "(() => { const c = document.querySelector('.part.editor .monaco-editor'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.margin .codicon-debug-breakpoint-unverified', '.margin .codicon-debug-breakpoint-log-unverified'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 20000 },
         { "hold": "alt", "wait": 1000 },
diff --git a/review/profile/settings.base.json b/review/profile/settings.base.json
index c4174b9..7379929 100644
--- a/review/profile/settings.base.json
+++ b/review/profile/settings.base.json
@@ -15,6 +15,7 @@
   "update.mode": "none",
   "extensions.autoUpdate": false,
   "extensions.autoCheckUpdates": false,
+  "extensions.ignoreRecommendations": true,
   "telemetry.telemetryLevel": "off",
   "git.openRepositoryInParentFolders": "never",
   "terminal.integrated.defaultProfile.windows": "Ubuntu (WSL)",
diff --git a/scripts/review/capture.mjs b/scripts/review/capture.mjs
index b57799a..f298229 100644
--- a/scripts/review/capture.mjs
+++ b/scripts/review/capture.mjs
@@ -154,6 +154,17 @@ async function shutdown({ child, cdp }) {
 const NO_TOOLTIP = `![...document.querySelectorAll('.workbench-hover, .monaco-hover, .debug-hover-widget')].some((el) => {
   const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('.hidden'); })`;
 
+// Where the page's pointer rests: the middle of the empty stretch of the activity bar, between its view icons and the
+// accounts and settings icons. Nothing there has a tooltip, and no scene draws anything there. The machine's own pointer
+// can rest where a new window opens, and a resting pointer keeps a tooltip open (a gate-5 dry run stopped at a 200% launch,
+// waiting for tooltips to close before its first capture), so every launch first moves the page's pointer there. The
+// status bar, where the gate-3 hover scenes park, did not do: an item that appears later (Ln, Col after a file opens) can
+// grow under the pointer, and its tooltip stopped a gate-4 dry run before find-replace at 200%.
+const PARK_POINT = `(() => { const bar = document.querySelector('.part.activitybar'); if (!bar) return null; const box = bar.getBoundingClientRect();
+  const icons = [...bar.querySelectorAll('.action-item')].map((el) => el.getBoundingClientRect()).filter((r) => r.height > 0); const middle = box.top + box.height / 2;
+  const top = Math.max(box.top, ...icons.filter((r) => r.top < middle).map((r) => r.bottom)); const bottom = Math.min(box.bottom, ...icons.filter((r) => r.top >= middle).map((r) => r.top));
+  return bottom - top >= 16 ? { x: box.left + box.width / 2, y: (top + bottom) / 2 } : null; })()`;
+
 // Where a stuck non-optional wait left the focus: class names only, never text, values, titles or ids, which can carry a path.
 async function focusDiagnostics(cdp) {
   try {
@@ -257,6 +268,8 @@ for (const pass of job.passes) {
       // VS Code 1.141 sets the product icon font-family to the font *id* (witchynibbles-product-icons), not the family name.
       await waitFor(() => cdp.evaluate(`(() => { const el = document.querySelector('.codicon-explorer-view-icon'); return !!el && getComputedStyle(el, '::before').fontFamily.includes('witchynibbles-product-icons'); })()`),
         { timeout: 60000, label: 'the WitchyNibbles product icons' });
+      const park = await waitFor(() => cdp.evaluate(PARK_POINT), { timeout: 10000, label: 'an empty stretch of the activity bar' });
+      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: park.x, y: park.y });
       for (const scene of job.scenes.filter((s) => !pass.scenes || pass.scenes.includes(s.name))) {
         const where = `${pass.name}/${scale}/${scene.name}`;
         log(`  ${scene.name}`);
diff --git a/scripts/review/contact-sheet.mjs b/scripts/review/contact-sheet.mjs
index a62ee6f..1108dbc 100644
--- a/scripts/review/contact-sheet.mjs
+++ b/scripts/review/contact-sheet.mjs
@@ -1,4 +1,6 @@
-// One HTML page per (pass, scene, crop): rows = theme and variant, columns = scale, images at 1:1 device pixels.
+// One HTML page per (pass, scene, crop): rows = theme and variant, columns = scale, each scale followed by the same
+// captures in grayscale (spec 6.3), images at 1:1 device pixels. The agent-browser session that renders the sheets is
+// closed at the end, also when a sheet fails.
 // Usage: node scripts/review/contact-sheet.mjs <run-dir>
 import fs from 'node:fs';
 import path from 'node:path';
@@ -11,23 +13,27 @@ fs.mkdirSync(sheets, { recursive: true });
 const browser = (...args) => execFileSync('agent-browser', args, { stdio: 'inherit' });
 const groups = Object.groupBy(manifest.captures.filter((capture) => capture.crop !== 'full'), (capture) => `${capture.pass}-${capture.scene}-${capture.crop}`);
 
-browser('set', 'viewport', '2400', '1600', '1');
-for (const [key, captures] of Object.entries(groups)) {
-  const scales = [...new Set(captures.map((capture) => capture.scale))].sort((a, b) => a - b);
-  const rowKey = (capture) => `${capture.theme} · ${capture.variant}`;
-  const rows = [...new Set(captures.map(rowKey))];
-  const cell = (row, scale) => {
-    const capture = captures.find((candidate) => rowKey(candidate) === row && candidate.scale === scale);
-    return capture ? `<td><img src="../captures/${capture.file}"></td>` : '<td>–</td>';
-  };
-  const html = `<!doctype html><meta charset="utf-8"><title>${key}</title>
+try {
+  browser('set', 'viewport', '2400', '1600', '1');
+  for (const [key, captures] of Object.entries(groups)) {
+    const scales = [...new Set(captures.map((capture) => capture.scale))].sort((a, b) => a - b);
+    const rowKey = (capture) => `${capture.theme} · ${capture.variant}`;
+    const rows = [...new Set(captures.map(rowKey))];
+    const cell = (row, scale, gray) => {
+      const capture = captures.find((candidate) => rowKey(candidate) === row && candidate.scale === scale);
+      return capture ? `<td><img src="../captures/${capture.file}"${gray ? ' style="filter:grayscale(1)"' : ''}></td>` : '<td>–</td>';
+    };
+    const html = `<!doctype html><meta charset="utf-8"><title>${key}</title>
 <style>body{margin:12px;font:13px system-ui;background:#808080;color:#111}th,td{padding:6px;vertical-align:top;text-align:left}img{image-rendering:pixelated;display:block}</style>
 <h1>${key}</h1><p>VS Code ${manifest.vscodeVersion} · ${manifest.mode} · run ${manifest.run} · repo ${String(manifest.repoCommit).slice(0, 8)}${manifest.repoDirty ? ' (dirty)' : ''} · one image pixel per screen pixel</p>
-<table><tr><th></th>${scales.map((scale) => `<th>${scale * 100}%</th>`).join('')}</tr>
-${rows.map((row) => `<tr><th>${row}</th>${scales.map((scale) => cell(row, scale)).join('')}</tr>`).join('\n')}</table>`;
-  const file = path.join(sheets, `${key}.html`);
-  fs.writeFileSync(file, html);
-  browser('open', `file://${file}`);
-  browser('screenshot', '--full', path.join(sheets, `${key}.png`));
+<table><tr><th></th>${scales.map((scale) => `<th>${scale * 100}%</th><th>${scale * 100}% grayscale</th>`).join('')}</tr>
+${rows.map((row) => `<tr><th>${row}</th>${scales.map((scale) => cell(row, scale, false) + cell(row, scale, true)).join('')}</tr>`).join('\n')}</table>`;
+    const file = path.join(sheets, `${key}.html`);
+    fs.writeFileSync(file, html);
+    browser('open', `file://${file}`);
+    browser('screenshot', '--full', path.join(sheets, `${key}.png`));
+  }
+} finally {
+  try { browser('close'); } catch { /* the session is already gone */ }
 }
 console.log(`${Object.keys(groups).length} contact sheets in ${sheets}`);
diff --git a/scripts/review/run-gate.mjs b/scripts/review/run-gate.mjs
index 575afe6..9a3fa6f 100644
--- a/scripts/review/run-gate.mjs
+++ b/scripts/review/run-gate.mjs
@@ -5,14 +5,16 @@ import path from 'node:path';
 import crypto from 'node:crypto';
 import { execFileSync, spawnSync } from 'node:child_process';
 import { USAGE, filterJob, parseGateArgs } from './args.mjs';
+import { resolveWaits } from './waits.mjs';
+import { prepareWorkspace, workspaceOf } from './workspace.mjs';
 
 const root = path.resolve(import.meta.dirname, '..', '..');
 const variantDir = path.join(root, 'icons', 'product-src-variants');
 const variantArgs = fs.existsSync(variantDir)
   ? fs.readdirSync(variantDir).filter((file) => file.endsWith('.svg')).map((file) => `--variant=${file.split('.')[0]}=icons/product-src-variants/${file}`)
   : [];
-// Arguments and the job are checked before anything is built or launched: a bad option, an unknown job file, scene
-// or scale stops here with the usage.
+// Arguments and the job are checked before anything is built or launched: a bad option, an unknown job file, scene,
+// scale, named wait or workspace stops here with the usage.
 let args;
 let job;
 try {
@@ -23,7 +25,8 @@ try {
   }
   // The variants pass runs only with a variant drawing and without --skip-variants. It is dropped before the job is cut
   // down, so a scene only that pass captures stops here too (gate-4 review).
-  job = filterJob(JSON.parse(fs.readFileSync(path.join(root, args.job), 'utf8')), { ...args, skipVariants: args.skipVariants || !variantArgs.length });
+  job = resolveWaits(filterJob(JSON.parse(fs.readFileSync(path.join(root, args.job), 'utf8')), { ...args, skipVariants: args.skipVariants || !variantArgs.length }));
+  workspaceOf(job, root);
 } catch (error) {
   console.error(`${error.message}\n${USAGE}`);
   process.exit(2);
@@ -59,35 +62,8 @@ fs.mkdirSync(work, { recursive: true });
 for (const file of fs.readdirSync(out).filter((name) => name.endsWith('.vsix'))) fs.copyFileSync(path.join(out, file), path.join(work, file));
 fs.copyFileSync(path.join(root, 'scripts', 'review', 'capture.mjs'), path.join(work, 'capture.mjs'));
 fs.cpSync(path.join(root, 'review', 'profile'), path.join(work, 'profile'), { recursive: true });
-const workspace = path.join(work, 'workspace');
-fs.cpSync(path.join(root, 'review', 'workspace'), workspace, { recursive: true });
-const git = (...gitArgs) => execFileSync('git', ['-c', 'user.name=review', '-c', 'user.email=review@localhost', ...gitArgs], { cwd: workspace, stdio: 'ignore' });
-git('init', '-q', '-b', 'moonlit-review');
-git('config', 'core.fileMode', 'false'); // Windows-side writes drop WSL mode bits; the terminal's git must not list them
-// Windows git checks files out as written (LF). With its default core.autocrlf true, a merge --abort wrote README.md back
-// with CRLF, the next scale's restore put LF back, and the stale index size made the next merge refuse to run.
-git('config', 'core.autocrlf', 'false');
-git('add', '-A');
-git('commit', '-q', '-m', 'review fixture');
-// Gate 2 git states: the git extension (Windows git) needs an identity to merge, a branch that conflicts with this one
-// on README.md (git-branch-conflicts, spellboundReview.scm), and an upstream, so the status bar shows sync, not Publish.
-git('config', 'user.name', 'review');
-git('config', 'user.email', 'review@localhost');
-const readmePath = path.join(workspace, 'README.md');
-const readme = fs.readFileSync(readmePath, 'utf8');
-git('checkout', '-q', '-b', 'rival-brew');
-fs.writeFileSync(readmePath, readme.replace('This folder is a fixture', 'This folder is a rival fixture'));
-git('commit', '-q', '-am', 'rival brew');
-git('checkout', '-q', 'moonlit-review');
-fs.writeFileSync(readmePath, readme.replace('This folder is a fixture', 'This folder is a moonlit fixture'));
-git('commit', '-q', '-am', 'moonlit brew');
-git('init', '-q', '--bare', '../origin.git'); // a relative URL, so WSL git and Windows git both resolve it
-git('remote', 'add', 'origin', '../origin.git');
-git('push', '-q', '-u', 'origin', 'moonlit-review');
-const spellsPath = path.join(workspace, 'spells.ts');
-fs.writeFileSync(spellsPath, fs.readFileSync(spellsPath, 'utf8').replace('// Review fixture:', '// Review fixture, stirred:')); // diff-remove + diff-insert
-fs.appendFileSync(spellsPath, '\n// stirred during review\n'); // modified -> amber
-fs.writeFileSync(path.join(workspace, 'new-spell.ts'), 'export const fresh = true;\n'); // untracked -> mint
+// The job's fixture, as the folder "workspace" (the window title and command centre read "workspace" in every gate).
+prepareWorkspace(root, job, path.join(work, 'workspace'));
 
 // 4. Fill machine paths and theme signatures, then capture under VS Code's Electron in Node mode.
 const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
PATCH
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test test/review-args.test.mjs test/review-harness.test.mjs test/review-workspace.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 54`, `ℹ pass 54`, `ℹ fail 0`.

Then: `npm test 2>&1 | grep -E '^ℹ (tests|pass|fail)' && npm run validate 2>&1 | tail -1 && grep -cP '\x{200B}' scripts/review/capture.mjs`
Expected:
- `ℹ tests 483`, `ℹ pass 483`, `ℹ fail 0` (477 + 6).
- `✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug, product-batch:editor, product-batch:symbols, file-icons:pipeline)`, unchanged by this task.
- `0` (no literal zero-width character in `capture.mjs`).

- [ ] **Step 6: Dry-run the gate-4 quick-open scenes (100% and 200%) and check the sheet changes**

```bash
export AGENT_BROWSER_SESSION=spellbound-gate5
node scripts/review/run-gate.mjs --job review/jobs/gate-4.json --scales=1,2 --skip-variants --scenes=tabs,split-down,find-replace,ai-lightbulb,symbols,symbols-2,suggest,debug-disconnect
node scripts/review/privacy-scan.mjs review-out/<run>/sheets/*.png review-out/<run>/captures/manifest.json
agent-browser session list
```

Expected, after about 5 minutes: `✓ Browser closed`, `9 contact sheets in …/sheets`, `Gate run complete: …/review-out/<run> (136 captures, 0 warnings)` (8 scenes, 9 crops and 8 `full` per theme, four themes, two scales). Then one `✓` per sheet and for the manifest, exit 0, and `No active sessions` (repeat the command once if the daemon was still exiting). Open `review-out/<run>/sheets/main-tabs-tabs.png` and `main-symbols-widget.png` with the Read tool: each scale is followed by a grayscale column of the same captures, and the tabs and symbols are the gate-4 states (`notes.md` pinned, `spells.ts` pinned and dirty; six symbol rows); the file icons in the tabs are this gate's (`notes.md` the default parchment, `spells.ts` the cut gem). Measured with Tasks 1-13 applied: run 2026-10-11T04-58-48, 136 captures, 0 warnings, about 5 minutes; nine sheets and the manifest pass the privacy scan; `No active sessions` at once.

Never paste a failed run's output: its last line holds the Windows Temp path with the user name. If a non-optional wait times out, the run names the scene and step; keep the pointer off the review window while it runs.

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out/g5 && git add -A && git write-tree | tee review-out/g5/TREE_14`
Expected: one 40-character tree id, also saved in `review-out/g5/TREE_14`.

### Task 15: The file fixture and the gate-5 job

**Files:**
- Create: `review/workspace-files/` (105 files: 57 `sample.<ext>`, 27 special file names, 20 folders with one child each, `notes.unknown`), `review/jobs/gate-5.json`
- Modify: `.gitignore`, `package.json` (`scripts.test`), `review/profile/keybindings.json` (3 chords), `test/review-harness.test.mjs`, `test/review-workspace.test.mjs`

**Interfaces:**
- Consumes: Task 14 (`workspace`, `until`/`quick-input-row`, the park point, `extensions.ignoreRecommendations`); `scripts/lib/file-icon-requirements.mjs` (`REQUIRED_FILE_EXTENSIONS`, `REQUIRED_FILE_NAMES`, `REQUIRED_FOLDER_NAMES`, unchanged since 1.2.1); gate 4's `PINNED_AFTER_GATE_4_RUN`, the review helper's `*.grimoire` symbol provider, and the pin, unpin, close-all, Go to Symbol and side-bar chords.
- Produces:
  - `review/workspace-files/`: `sample.<ext>` for every required extension; every required file name, spelled as spec 6 writes it (`README.md`, `LICENSE`, `LICENSE.md`, `CHANGELOG.md`, `Dockerfile`, `Cargo.lock`; the rest lower case); every required folder with one child: `src/index.ts` (the breadcrumbs scene), `fixtures/pins.grimoire` (the symbols scene: `constructor Brew`, `key moonphase`, `object Cauldron`, `package herbs`), `.keep` in every other; plus `notes.unknown` and `potions/.keep`, which match no key (the defaults). Every file is empty except `pins.grimoire`. Gate 6 reuses it whole.
  - `.gitignore`: `!review/workspace-files/node_modules/` after `node_modules/`. `npm test`: `node --test "test/**/*.test.mjs"`.
  - Chords: `alt+shift+F7` quick open (no filter; the scene types the name), `alt+shift+F8` reveal the active file in the Explorer and focus the Files Explorer (`runCommands`), `alt+shift+F9` collapse the Explorer's folders.
  - `review/jobs/gate-5.json`: `"workspace": "review/workspace-files"`, one `main` pass at scales 1 and 2, the six scenes of the table above, `commitSheets` `main-explorer-closed-sidebar`, `main-explorer-open-sidebar`, `main-tabs-tabs`, `main-breadcrumbs-breadcrumbs`, `main-quick-open-widget`, `main-symbols-widget`.

- [ ] **Step 1: Write the failing tests**

```bash
git apply <<'PATCH'
diff --git a/test/review-harness.test.mjs b/test/review-harness.test.mjs
index 33b0b46..8b6dd46 100644
--- a/test/review-harness.test.mjs
+++ b/test/review-harness.test.mjs
@@ -7,6 +7,7 @@ import fs from 'node:fs';
 import os from 'node:os';
 import path from 'node:path';
 import { spawnSync } from 'node:child_process';
+import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES } from '../scripts/lib/file-icon-requirements.mjs';
 import { WAITS } from '../scripts/review/waits.mjs';
 
 const root = path.resolve(import.meta.dirname, '..');
@@ -15,7 +16,8 @@ const json = (file) => JSON.parse(read(file));
 const exists = (file) => fs.existsSync(path.join(root, file));
 
 const GATES = ['review/jobs/gate-1.json', 'review/jobs/gate-2.json', 'review/jobs/gate-3.json', 'review/jobs/gate-4.json'];
-const JOBS = [...GATES, 'review/jobs/smoke.json'];
+const GATE_5 = 'review/jobs/gate-5.json';
+const JOBS = [...GATES, GATE_5, 'review/jobs/smoke.json'];
 const PLAIN_KEYS = new Set(['Enter', 'Escape', 'Tab', 'Backspace']);
 
 test('every file the harness needs exists', () => {
@@ -70,7 +72,7 @@ test('the gate covers four scales, both activity bar sizes, and both terminal co
 });
 
 test('every committed sheet is one the gate job produces', () => {
-  for (const file of GATES) {
+  for (const file of [...GATES, GATE_5]) {
     const job = json(file);
     const produced = new Set(job.passes.flatMap((pass) => job.scenes
       .filter((scene) => !pass.scenes || pass.scenes.includes(scene.name))
@@ -335,7 +337,7 @@ const WAITED_FOR_AT_GATE_4 = {
   'debug-breakpoint-log-unverified': 'G20: a logpoint in unbrewed.js, which the debugger never loads',
 };
 // Pinned by the author after the committed gate-4 run (2026-10-11T00-50-16), which never waited for them. The gate-4 test
-// below skips them; the next gate job must wait for them.
+// below skips them; the gate-5 job waits for them (its symbols scene).
 const PINNED_AFTER_GATE_4_RUN = {
   'symbol-constructor': 'G34: pinned by the author after run 2026-10-11T00-50-16; the next gate job must wait for it',
   'symbol-key': 'G34: pinned by the author after run 2026-10-11T00-50-16; the next gate job must wait for it',
@@ -779,6 +781,153 @@ test('the contact sheet adds a grayscale copy of every capture beside each scale
   }
 });
 
+// ---- Gate 5: the file-icon sample (spec 6.3) ----
+const gate5 = () => json(GATE_5);
+const gate5Scene = (name) => gate5().scenes.find((scene) => scene.name === name);
+// The sample of spec 6.2 as the Explorer shows it: the src badge folder and its alias, ts, py and json with their other
+// extensions, LICENSE and LICENSE.md, and one entry of each default (potions and notes.unknown match no key).
+const GATE_5_SAMPLE = {
+  folders: ['potions', 'source', 'src'],
+  files: ['LICENSE', 'LICENSE.md', 'notes.unknown', 'sample.cts', 'sample.json', 'sample.jsonc', 'sample.mts', 'sample.py', 'sample.pyw', 'sample.ts'],
+};
+// VS Code marks a row's icon label with "<lower-case name>-name-file-icon" (or -name-folder-icon); the waits look for these.
+const fileClass = (name) => `${name.toLowerCase()}-name-file-icon`;
+const folderClass = (name) => `${name.toLowerCase()}-name-folder-icon`;
+const ON_SCREEN = /r\.left >= box\.left && r\.right <= box\.right && r\.top >= box\.top && r\.bottom <= box\.bottom/;
+
+test('gate 5 opens the file-icon fixture with the WitchyNibbles file and product icon themes, in all four color themes at 100% and 200%', () => {
+  const job = gate5();
+  assert.equal(job.workspace, 'review/workspace-files');
+  assert.deepEqual(job.passes, [{ name: 'main', vsix: ['spellbound-main.vsix'], scales: [1, 2] }]);
+  assert.deepEqual(job.scenes.map((scene) => scene.name), ['explorer-closed', 'explorer-open', 'tabs', 'breadcrumbs', 'quick-open', 'symbols']);
+  assert.deepEqual(job.commitSheets, ['main-explorer-closed-sidebar', 'main-explorer-open-sidebar', 'main-tabs-tabs', 'main-breadcrumbs-breadcrumbs', 'main-quick-open-widget', 'main-symbols-widget']);
+  const base = json('review/profile/settings.base.json');
+  assert.equal(base['workbench.iconTheme'], json('package.json').contributes.iconThemes[0].id);
+  assert.equal(base['workbench.productIconTheme'], json('package.json').contributes.productIconThemes[0].id);
+  for (const scene of job.scenes) {
+    for (const key of ['workbench.iconTheme', 'workbench.productIconTheme', 'workbench.colorTheme']) assert.ok(!(key in (scene.settings ?? {})), `${scene.name} keeps ${key}`);
+  }
+  // capture.mjs shoots every scene in every theme run-gate.mjs reads from the package, and the package has four.
+  assert.equal(json('package.json').contributes.themes.length, 4);
+  assert.match(read('scripts/review/run-gate.mjs'), /job\.themes = packageJson\.contributes\.themes\.map/);
+  for (const scene of job.scenes) {
+    const checks = scene.setup.filter((step) => step.waitFor && !step.optional && /\.(monaco-icon-label|codicon-)/.test(step.waitFor));
+    assert.ok(checks.length, `${scene.name} waits for its icons`);
+    for (const step of checks) assert.match(step.waitFor, ON_SCREEN, `${scene.name}: on screen, not just in the DOM`);
+  }
+});
+
+test('gate 5 frames the sample in the Explorer and quick open: every other fixture entry is excluded', () => {
+  // The fixture holds a file or folder for every key of spec 6 (gate 6 needs them all); at 200% the Explorer shows about
+  // 16 rows, so gate 5 hides everything but the sample with files.exclude, a scene setting.
+  const keys = [...REQUIRED_FILE_EXTENSIONS, ...REQUIRED_FILE_NAMES, ...REQUIRED_FOLDER_NAMES];
+  for (const key of ['src', 'source', 'ts', 'mts', 'cts', 'py', 'pyw', 'json', 'jsonc', 'license', 'license.md']) assert.ok(keys.includes(key), key);
+  const top = fs.readdirSync(path.join(root, 'review', 'workspace-files'));
+  const sample = [...GATE_5_SAMPLE.folders, ...GATE_5_SAMPLE.files];
+  for (const name of sample) assert.ok(top.includes(name), `${name} is in the fixture`);
+  for (const name of ['potions', 'notes.unknown']) assert.ok(!keys.includes(name) && !keys.includes(name.split('.').at(-1)), `${name} matches no key`);
+  // explorer-open also hides source: with src and potions open, the tree holds 14 full rows at 200% (326 CSS px of 22-px
+  // rows), and source is the alias explorer-closed already shows.
+  for (const [name, hidden] of [['explorer-closed', []], ['explorer-open', ['source']], ['quick-open', []]]) {
+    const exclude = gate5Scene(name).settings['files.exclude'];
+    assert.deepEqual(Object.keys(exclude).sort(), [...top.filter((entry) => !sample.includes(entry)), ...hidden].sort(), name);
+    assert.ok(Object.values(exclude).every((value) => value === true), name);
+  }
+});
+
+test('gate 5 shows the sample in the Explorer closed, then src and the default folder open with LICENSE selected in a focused tree', () => {
+  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
+  const closed = gate5Scene('explorer-closed').setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? '')).find((wait) => wait.includes('.explorer-folders-view'));
+  assert.ok(closed, 'explorer-closed waits for the Explorer rows');
+  for (const name of [...GATE_5_SAMPLE.folders.map(folderClass), ...GATE_5_SAMPLE.files.map(fileClass)]) assert.ok(closed.includes(`"${name}"`), `explorer-closed: ${name}`);
+  assert.ok(closed.includes(`rows.length === ${GATE_5_SAMPLE.folders.length + GATE_5_SAMPLE.files.length}`), 'only the sample');
+  assert.match(closed, /const box = list\.getBoundingClientRect\(\)/, 'every row inside the tree, not behind the Outline header');
+  assert.match(closed, /rows\.every\(\(r\) => r\.getAttribute\('aria-expanded'\) !== 'true' && !r\.classList\.contains\('selected'\)\)/, 'no folder open, no row selected');
+  const collapse = keyOf('workbench.files.action.collapseExplorerFolders');
+  for (const name of ['explorer-closed', 'explorer-open']) assert.ok(gate5Scene(name).setup.some((step) => step.press === collapse), `${name} collapses the folders first`);
+
+  const scene = gate5Scene('explorer-open');
+  const opened = scene.setup.filter((step) => step.insert).map((step) => step.insert);
+  assert.deepEqual(opened, ['src/index.ts', 'potions/.keep', 'LICENSE'], 'opening a child reveals and expands its folder; LICENSE last, so it is the one selected');
+  const reveal = json('review/profile/keybindings.json').find((binding) => binding.command === 'runCommands' && binding.args.commands.includes('workbench.files.action.showActiveFileInExplorer'));
+  assert.deepEqual(reveal.args.commands, ['workbench.files.action.showActiveFileInExplorer', 'workbench.files.action.focusFilesExplorer']);
+  const presses = scene.setup.map((step) => step.press);
+  assert.ok(presses.lastIndexOf(reveal.key) > presses.lastIndexOf('Enter'), 'reveals LICENSE and focuses the tree after the last file opens');
+  const wait = scene.setup.at(-1).waitFor;
+  const shown = [...GATE_5_SAMPLE.folders.filter((name) => name !== 'source').map(folderClass), ...GATE_5_SAMPLE.files.map(fileClass), fileClass('index.ts'), fileClass('.keep')];
+  for (const name of shown) assert.ok(wait.includes(`"${name}"`), `explorer-open: ${name}`);
+  assert.ok(wait.includes(`rows.length === ${shown.length}`) && shown.length === 14, 'the sample without source, and the two children');
+  assert.match(wait, /const box = list\.getBoundingClientRect\(\)/, 'every row inside the tree');
+  assert.match(wait, /\['src-name-folder-icon', 'potions-name-folder-icon'\]\.every\(\(name\) => row\(name\)\.getAttribute\('aria-expanded'\) === 'true'\)/);
+  assert.match(wait, /license\.classList\.contains\('selected'\) && license\.classList\.contains\('focused'\) && view\.contains\(document\.activeElement\)/,
+    'LICENSE on the active selection colour (F9 evidence), not the inactive one');
+  assert.deepEqual(scene.teardown.map((step) => step.press), [keyOf('workbench.action.closeAllEditors'), collapse]);
+});
+
+test('gate 5 opens ts, py, json and LICENSE in tabs and pins LICENSE, so a tab shows the gate-4 pushpin', () => {
+  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
+  const scene = gate5Scene('tabs');
+  assert.deepEqual(scene.setup.filter((step) => step.insert).map((step) => step.insert), ['sample.ts', 'sample.py', 'sample.json', 'LICENSE']);
+  const presses = scene.setup.map((step) => step.press);
+  // At 200% (960 CSS px) the editor between the two side bars held about two tabs, and the other two scrolled away.
+  for (const command of ['workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar']) {
+    assert.ok(presses.indexOf(keyOf(command)) >= 0 && presses.indexOf(keyOf(command)) < scene.setup.findIndex((step) => step.insert), `tabs runs ${command} before it opens a file`);
+  }
+  assert.ok(presses.indexOf(keyOf('workbench.action.pinEditor')) > presses.lastIndexOf('Enter'), 'pins LICENSE, the active editor');
+  const wait = scene.setup.at(-1).waitFor;
+  for (const name of ['sample.ts', 'sample.py', 'sample.json', 'LICENSE']) assert.ok(wait.includes(`"${fileClass(name)}"`), name);
+  assert.ok(wait.includes("c.querySelectorAll('.tab').length === 4"));
+  assert.ok(wait.includes("'.tab.sticky:not(.dirty) > .tab-actions .codicon-pinned'"), 'the pushpin (G32) on the pinned tab');
+  assert.ok(wait.includes("classList.contains('license-name-file-icon')"), 'on the LICENSE tab');
+  assert.deepEqual(scene.teardown.map((step) => step.press), [keyOf('workbench.action.unpinEditor'), keyOf('workbench.action.closeAllEditors')]);
+  const breadcrumbs = gate5Scene('breadcrumbs');
+  assert.deepEqual(breadcrumbs.setup.filter((step) => step.insert).map((step) => step.insert), ['src/index.ts']);
+  // 1.141 draws no icon on a folder item of the breadcrumb bar, only on the file item.
+  assert.ok(breadcrumbs.setup.at(-1).waitFor.includes(`"${fileClass('index.ts')}"`), 'breadcrumbs: index.ts');
+  assert.ok(breadcrumbs.setup.at(-1).waitFor.includes("c.querySelectorAll('.monaco-breadcrumb-item.folder').length === 1"), 'breadcrumbs: the src item');
+});
+
+test('gate 5 waits for the four symbol shares pinned after the gate-4 run (G34)', () => {
+  const scene = gate5Scene('symbols');
+  assert.deepEqual(scene.setup.filter((step) => step.insert).map((step) => step.insert), ['fixtures/pins.grimoire']);
+  const goto = json('review/profile/keybindings.json').find((binding) => binding.command === 'workbench.action.gotoSymbol').key;
+  const presses = scene.setup.map((step) => step.press);
+  assert.ok(presses.indexOf(goto) > presses.lastIndexOf('Enter'), 'Go to Symbol in the grimoire');
+  const wait = scene.setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? '')).find((candidate) => candidate.includes('.quick-input-widget .monaco-list'));
+  for (const id of Object.keys(PINNED_AFTER_GATE_4_RUN)) assert.ok(wait.includes(`'.codicon-${id}'`), id);
+  assert.match(wait, ON_SCREEN);
+});
+
+test('every gate 5 quick open types its file, waits for that file\'s row to be focused, then presses Enter; quick-open waits for a focused row', () => {
+  const keys = json('review/profile/keybindings.json');
+  const quickOpen = keys.find((binding) => binding.command === 'workbench.action.quickOpen' && binding.args === undefined).key;
+  const focus = keys.find((binding) => binding.command === 'workbench.action.focusActiveEditorGroup').key;
+  let checked = 0;
+  for (const scene of gate5().scenes) {
+    const steps = scene.setup;
+    let focused = false; // gate-4 lesson: a quick-open chord is lost while another part (the chat input) holds the focus
+    steps.forEach((step, index) => {
+      if (step.press === focus) focused = false;
+      if (String(step.waitFor ?? '') === "!!document.activeElement?.closest('.part.editor')" && !step.optional) focused = true;
+      if (step.press !== quickOpen) return;
+      assert.ok(focused, `${scene.name} setup[${index}]: waits for the editor group focus first`);
+      const [typed, wait, enter] = steps.slice(index + 1, index + 4);
+      assert.ok(typed.insert, `${scene.name} setup[${index}]: types what to open`);
+      assert.equal(wait.until, 'quick-input-row', `${scene.name} setup[${index}]: waits for a focused row`);
+      assert.ok(!wait.optional);
+      if (scene.name === 'quick-open') {
+        assert.equal(wait.file, undefined, 'the list scene keeps whichever row quick open focuses');
+        assert.notEqual(enter?.press, 'Enter', 'and keeps the list open');
+      } else {
+        assert.equal(wait.file, typed.insert.split('/').at(-1), `${scene.name} setup[${index}]: the row of ${typed.insert}`);
+        assert.equal(enter.press, 'Enter');
+      }
+      checked += 1;
+    });
+  }
+  assert.equal(checked, 10, 'explorer-open 3, tabs 4, breadcrumbs 1, quick-open 1, symbols 1');
+});
+
 test('every launch parks the page pointer on the empty stretch of the activity bar, and no extension recommendation toast opens', () => {
   // Gate-5 dry runs: a 200% launch stopped waiting for tooltips to close before its first capture (the machine's pointer
   // rested over the new window); parked on a status bar gap, the pointer later sat on an item that had grown under it; and
diff --git a/test/review-workspace.test.mjs b/test/review-workspace.test.mjs
index ad821a0..be3b81d 100644
--- a/test/review-workspace.test.mjs
+++ b/test/review-workspace.test.mjs
@@ -5,7 +5,8 @@ import assert from 'node:assert/strict';
 import fs from 'node:fs';
 import os from 'node:os';
 import path from 'node:path';
-import { execFileSync } from 'node:child_process';
+import { execFileSync, spawnSync } from 'node:child_process';
+import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES } from '../scripts/lib/file-icon-requirements.mjs';
 import { DEFAULT_WORKSPACE, prepareWorkspace, workspaceOf } from '../scripts/review/workspace.mjs';
 
 const root = path.resolve(import.meta.dirname, '..');
@@ -56,3 +57,57 @@ test('prepareWorkspace turns the default fixture into the gate-2 git states and
     fs.rmSync(dir, { recursive: true, force: true });
   }
 });
+
+// ---- Gate 5: the file-icon fixture (spec 6.3) ----
+const FIXTURE = 'review/workspace-files';
+// Spec 6 writes these names with capitals; file names match case-insensitively, so the fixture spells them as users do.
+const SPELLING = { 'readme.md': 'README.md', license: 'LICENSE', 'license.md': 'LICENSE.md', 'changelog.md': 'CHANGELOG.md', dockerfile: 'Dockerfile', 'cargo.lock': 'Cargo.lock' };
+// Children that do more than let their folder expand: the breadcrumbs scene opens src/index.ts, and the symbols scene
+// opens fixtures/pins.grimoire, whose lines the review helper reads as one symbol each. Every other folder holds .keep.
+const CHILDREN = { src: 'index.ts', fixtures: 'pins.grimoire' };
+// Matched by no key, so they show the default parchment and the default folder.
+const UNMATCHED = { file: 'notes.unknown', folder: 'potions' };
+const fixtureFiles = () => listing(path.join(root, FIXTURE)).filter((item) => !item.endsWith('/'));
+
+test('the file-icon fixture holds one file per required extension and file name, and every required folder with one child', () => {
+  const top = fs.readdirSync(path.join(root, FIXTURE), { withFileTypes: true });
+  const files = top.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
+  const folders = top.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
+  assert.deepEqual(files, [...REQUIRED_FILE_EXTENSIONS.map((ext) => `sample.${ext}`), ...REQUIRED_FILE_NAMES.map((name) => SPELLING[name] ?? name), UNMATCHED.file].sort());
+  assert.deepEqual(folders, [...REQUIRED_FOLDER_NAMES, UNMATCHED.folder].sort());
+  for (const folder of folders) assert.deepEqual(fs.readdirSync(path.join(root, FIXTURE, folder)), [CHILDREN[folder] ?? '.keep'], folder);
+  for (const name of Object.keys(SPELLING)) assert.ok(REQUIRED_FILE_NAMES.includes(name), `${name} is a required file name`);
+  // Windows (where the review VS Code runs) folds case, so no two entries may differ only in case.
+  const lower = [...files, ...folders].map((name) => name.toLowerCase());
+  assert.equal(new Set(lower).size, lower.length);
+  // The unmatched pair matches nothing: no required extension is a dot-suffix of the file, and no name equals either.
+  const suffixes = UNMATCHED.file.split('.').map((_, index, parts) => parts.slice(index + 1).join('.')).filter(Boolean);
+  assert.ok(suffixes.every((suffix) => !REQUIRED_FILE_EXTENSIONS.includes(suffix)) && !REQUIRED_FILE_NAMES.includes(UNMATCHED.file), UNMATCHED.file);
+  assert.ok(!REQUIRED_FOLDER_NAMES.includes(UNMATCHED.folder), UNMATCHED.folder);
+  // Empty files, but the two that carry content for a scene. README.md is a key like any other and stays empty.
+  for (const file of fixtureFiles()) {
+    const size = fs.statSync(path.join(root, FIXTURE, file)).size;
+    assert.equal(size > 0, file === 'fixtures/pins.grimoire', `${file}: ${size} bytes`);
+  }
+  assert.deepEqual(fs.readFileSync(path.join(root, FIXTURE, 'fixtures', 'pins.grimoire'), 'utf8').trim().split('\n').map((line) => line.split(' ')[0]),
+    ['constructor', 'key', 'object', 'package'], 'one symbol of each kind gate 4 pinned after its run (G34)');
+});
+
+test('git tracks the whole file-icon fixture: node_modules and every other fixture folder pass the ignore rules', () => {
+  // The repo ignores node_modules/ anywhere, which would drop the fixture's node_modules folder from every commit (and the
+  // gate 6 cobweb with it). One negated rule re-includes it; check-ignore runs every rule git has, global ones included.
+  const lines = fs.readFileSync(path.join(root, '.gitignore'), 'utf8').split('\n');
+  assert.ok(lines.indexOf(`!${FIXTURE}/node_modules/`) > lines.indexOf('node_modules/'), 'the negation follows node_modules/');
+  const paths = fixtureFiles().map((file) => `${FIXTURE}/${file}`);
+  const result = spawnSync('git', ['check-ignore', '--no-index', '--stdin'], { cwd: root, input: paths.join('\n'), encoding: 'utf8' });
+  assert.equal(result.stdout, '', 'no fixture file is ignored');
+  assert.equal(result.status, 1, result.stderr);
+});
+
+test('npm test runs only the suites under test/, never the fixture\'s sample.test.* files or its empty package.json', () => {
+  // node --test without a pattern collects **/*.test.{js,mjs,cjs,ts,mts,cts} and **/test/**/*.js anywhere: the fixture's
+  // sample.test.* files would run as tests, and the .js and .ts ones fail on the fixture's empty package.json.
+  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts.test, 'node --test "test/**/*.test.mjs"');
+  assert.ok(fixtureFiles().some((file) => /\.test\.(js|mjs|cjs|ts|mts|cts)$/.test(file)), 'the fixture does hold such files');
+  assert.ok(fs.readdirSync(path.join(root, 'test')).filter((file) => file.endsWith('.mjs')).every((file) => file.endsWith('.test.mjs')), 'every suite matches the pattern');
+});
PATCH
```

What the patch does:
- `test/review-workspace.test.mjs`:
  - `the file-icon fixture holds one file per required extension and file name, and every required folder with one child`: the top level is exactly the required lists (imported, never copied) plus `notes.unknown` and `potions`; each folder holds exactly its one child; no two names differ only in case (the review VS Code runs on Windows); the unmatched pair matches no key; every file is empty but `fixtures/pins.grimoire`, whose kinds are the four G34 pins;
  - `git tracks the whole file-icon fixture …`: the negated rule follows `node_modules/`, and `git check-ignore --no-index` reports no fixture file;
  - `npm test runs only the suites under test/ …`: the pattern, that the fixture really holds `sample.test.*` files, and that every `.mjs` under `test/` matches the pattern.
- `test/review-harness.test.mjs`: gate 5 joins the schema and committed-sheet checks (`GATE_5`; not `GATES`, whose tests are about the icon-sheet pages gate 5 does not have), and six gate-5 tests:
  - the workspace, the pass (`main`, scales 1 and 2), the scene names and sheets, both WitchyNibbles icon themes in the base settings and overridden by no scene, four package themes, and every icon wait checked on screen;
  - the `files.exclude` framing of `explorer-closed`, `explorer-open` (plus `source`) and `quick-open` against the fixture listing, and the sample keys against the requirement lists;
  - the Explorer scenes: every sample label waited for, the row counts (13 and 14), no row open or selected when closed, `src` and `potions` open and `LICENSE` selected and focused in a focused tree when open, the files opened and the reveal chord, the teardown;
  - the tabs (the four files, side bars closed first, `LICENSE` pinned with the pushpin, unpinned and closed in the teardown) and the breadcrumbs;
  - `gate 5 waits for the four symbol shares pinned after the gate-4 run (G34)`: every key of `PINNED_AFTER_GATE_4_RUN`, whose comment now says the gate-5 job waits for them;
  - every gate-5 quick open: focus wait first, the typed name, the focused-row wait for that file, Enter; `quick-open` keeps whichever row is focused and the list open (10 quick opens).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/review-harness.test.mjs test/review-workspace.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)' && node --test --test-reporter=tap test/review-harness.test.mjs test/review-workspace.test.mjs 2>&1 | grep -E '^not ok'`
Expected: `ℹ tests 55`, `ℹ pass 43`, `ℹ fail 12`:
- `not ok 1 - every file the harness needs exists`
- `not ok 2 - job files follow the schema and press only bound chords or plain keys`
- `not ok 4 - every committed sheet is one the gate job produces`
- `not ok 44` to `not ok 49`: the six gate-5 job tests
- `not ok 53 - the file-icon fixture holds one file per required extension and file name, and every required folder with one child`
- `not ok 54 - git tracks the whole file-icon fixture: node_modules and every other fixture folder pass the ignore rules`
- `not ok 55 - npm test runs only the suites under test/, never the fixture's sample.test.* files or its empty package.json`

- [ ] **Step 3: Narrow `npm test`, then write the fixture**

The fixture holds `sample.test.{js,mjs,cjs,ts,mts,cts}` files and an empty `package.json`. A bare `node --test` (the `npm test` of Tasks 1-14) collects those files and fails on the empty `package.json` (`Invalid package config`), so `scripts.test` is narrowed to `test/**/*.test.mjs` first, before any fixture file exists: no task's `npm test` ever sees the fixture under the old script. Every test file of Tasks 1-15 is `test/<name>.test.mjs`, so the narrowed script collects the same suites. `npm pkg set` changes only the `test` line of `package.json` and leaves the scripts Tasks 4-6 added in place.

```bash
npm pkg set scripts.test='node --test "test/**/*.test.mjs"'
node --input-type=module <<'EOF'
import fs from 'node:fs';
import path from 'node:path';
import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES } from './scripts/lib/file-icon-requirements.mjs';

const dir = 'review/workspace-files';
// Spec 6 spells these names with capitals; file names match case-insensitively.
const SPELLING = { 'readme.md': 'README.md', license: 'LICENSE', 'license.md': 'LICENSE.md', 'changelog.md': 'CHANGELOG.md', dockerfile: 'Dockerfile', 'cargo.lock': 'Cargo.lock' };
// One child per folder; src and fixtures hold the files the breadcrumbs and symbols scenes open.
const CHILDREN = { src: 'index.ts', fixtures: 'pins.grimoire' };
const write = (file, text = '') => {
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), text);
};
for (const ext of REQUIRED_FILE_EXTENSIONS) write(`sample.${ext}`);
for (const name of REQUIRED_FILE_NAMES) write(SPELLING[name] ?? name);
for (const folder of [...REQUIRED_FOLDER_NAMES, 'potions']) write(`${folder}/${CHILDREN[folder] ?? '.keep'}`);
write('fixtures/pins.grimoire', 'constructor Brew\nkey moonphase\nobject Cauldron\npackage herbs\n');
write('notes.unknown');
EOF
find review/workspace-files -type f | wc -l
git check-ignore --no-index --verbose review/workspace-files/node_modules/.keep
```

Expected: `105`, then `.gitignore:1:node_modules/	review/workspace-files/node_modules/.keep` (the repo's rule still drops it: the next step re-includes it).

- [ ] **Step 4: Re-include `node_modules`, add the chords, write the job**

```bash
git apply <<'PATCH'
diff --git a/.gitignore b/.gitignore
index 1e6de64..76cd370 100644
--- a/.gitignore
+++ b/.gitignore
@@ -2,6 +2,8 @@ node_modules/
 *.vsix
 .vscode/
 !review/workspace/.vscode/
+# The file-icon review fixture has a node_modules folder of its own (gate 5; test/review-workspace.test.mjs).
+!review/workspace-files/node_modules/
 .vscode-test/
 .playwright-mcp/
 .DS_Store
diff --git a/review/profile/keybindings.json b/review/profile/keybindings.json
index 269f17d..f9a015d 100644
--- a/review/profile/keybindings.json
+++ b/review/profile/keybindings.json
@@ -62,5 +62,8 @@
   { "key": "alt+shift+F3", "command": "workbench.action.quickOpen", "args": "unbrewed.js:3" },
   { "key": "alt+shift+F5", "command": "workbench.action.closeAllEditors" },
   { "key": "alt+shift+F6", "command": "workbench.action.quickOpen", "args": "charms.grimoire" },
-  { "key": "ctrl+alt+F12", "command": "workbench.action.gotoSymbol" }
+  { "key": "ctrl+alt+F12", "command": "workbench.action.gotoSymbol" },
+  { "key": "alt+shift+F7", "command": "workbench.action.quickOpen" },
+  { "key": "alt+shift+F8", "command": "runCommands", "args": { "commands": ["workbench.files.action.showActiveFileInExplorer", "workbench.files.action.focusFilesExplorer"] } },
+  { "key": "alt+shift+F9", "command": "workbench.files.action.collapseExplorerFolders" }
 ]
PATCH
cat > review/jobs/gate-5.json <<'EOF'
{
  "expectVersion": "1.141.0",
  "port": 9333,
  "mode": "device-scale",
  "helperVsix": "spellbound-review-helper.vsix",
  "workspace": "review/workspace-files",
  "passes": [
    {"name": "main", "vsix": ["spellbound-main.vsix"], "scales": [1, 2]}
  ],
  "scenes": [
    {
      "name": "explorer-closed",
      "settings": {"files.exclude": {".claude": true, ".env": true, ".env.development": true, ".env.example": true, ".env.local": true, ".env.production": true, ".github": true, ".gitignore": true, ".venv": true, "CHANGELOG.md": true, "Cargo.lock": true, "Dockerfile": true, "README.md": true, "__pycache__": true, "__tests__": true, "assets": true, "bin": true, "cache": true, "conftest.py": true, "dist": true, "docs": true, "fixtures": true, "jest.config.cjs": true, "jest.config.js": true, "jest.config.json": true, "jest.config.mjs": true, "jest.config.ts": true, "jsconfig.json": true, "lib": true, "node_modules": true, "package-lock.json": true, "package.json": true, "poetry.lock": true, "pyproject.toml": true, "pytest.ini": true, "requirements.txt": true, "sample.cjs": true, "sample.css": true, "sample.db": true, "sample.env": true, "sample.fish": true, "sample.gif": true, "sample.htm": true, "sample.html": true, "sample.jpeg": true, "sample.jpg": true, "sample.js": true, "sample.jsonl": true, "sample.jsx": true, "sample.less": true, "sample.lock": true, "sample.md": true, "sample.mdx": true, "sample.mjs": true, "sample.otf": true, "sample.png": true, "sample.ps1": true, "sample.scss": true, "sample.sh": true, "sample.spec.cjs": true, "sample.spec.cts": true, "sample.spec.js": true, "sample.spec.jsx": true, "sample.spec.mjs": true, "sample.spec.mts": true, "sample.spec.ts": true, "sample.spec.tsx": true, "sample.sql": true, "sample.svg": true, "sample.test.cjs": true, "sample.test.cts": true, "sample.test.js": true, "sample.test.jsx": true, "sample.test.mjs": true, "sample.test.mts": true, "sample.test.ts": true, "sample.test.tsx": true, "sample.toml": true, "sample.tsx": true, "sample.ttf": true, "sample.txt": true, "sample.webp": true, "sample.woff": true, "sample.woff2": true, "sample.yaml": true, "sample.yml": true, "scripts": true, "test": true, "tests": true, "tsconfig.json": true, "workflows": true, "yarn.lock": true}},
      "setup": [
        {"press": "ctrl+alt+shift+4", "wait": 1200},
        {"press": "alt+shift+F9", "wait": 500},
        {"press": "ctrl+alt+shift+a", "wait": 500},
        {"waitFor": "!!document.activeElement?.closest('.part.editor')", "timeout": 10000},
        {"waitFor": "(() => { const view = document.querySelector('.part.sidebar .explorer-folders-view'); const list = view?.querySelector('.monaco-list'); if (!list) return false; const box = list.getBoundingClientRect(); const inside = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; }; const rows = [...view.querySelectorAll('.monaco-list-row')]; const row = (name) => rows.find((r) => r.querySelector('.monaco-icon-label')?.classList.contains(name)); return rows.length === 13 && [\"potions-name-folder-icon\", \"source-name-folder-icon\", \"src-name-folder-icon\", \"license-name-file-icon\", \"license.md-name-file-icon\", \"notes.unknown-name-file-icon\", \"sample.cts-name-file-icon\", \"sample.json-name-file-icon\", \"sample.jsonc-name-file-icon\", \"sample.mts-name-file-icon\", \"sample.py-name-file-icon\", \"sample.pyw-name-file-icon\", \"sample.ts-name-file-icon\"].every((name) => !!row(name) && inside(row(name).querySelector('.monaco-icon-label'))) && rows.every((r) => r.getAttribute('aria-expanded') !== 'true' && !r.classList.contains('selected')) && !view.contains(document.activeElement); })()", "timeout": 10000}
      ],
      "crops": [
        {"name": "sidebar", "selector": ".part.sidebar", "maxHeight": 420}
      ]
    },
    {
      "name": "explorer-open",
      "settings": {"files.exclude": {".claude": true, ".env": true, ".env.development": true, ".env.example": true, ".env.local": true, ".env.production": true, ".github": true, ".gitignore": true, ".venv": true, "CHANGELOG.md": true, "Cargo.lock": true, "Dockerfile": true, "README.md": true, "__pycache__": true, "__tests__": true, "assets": true, "bin": true, "cache": true, "conftest.py": true, "dist": true, "docs": true, "fixtures": true, "jest.config.cjs": true, "jest.config.js": true, "jest.config.json": true, "jest.config.mjs": true, "jest.config.ts": true, "jsconfig.json": true, "lib": true, "node_modules": true, "package-lock.json": true, "package.json": true, "poetry.lock": true, "pyproject.toml": true, "pytest.ini": true, "requirements.txt": true, "sample.cjs": true, "sample.css": true, "sample.db": true, "sample.env": true, "sample.fish": true, "sample.gif": true, "sample.htm": true, "sample.html": true, "sample.jpeg": true, "sample.jpg": true, "sample.js": true, "sample.jsonl": true, "sample.jsx": true, "sample.less": true, "sample.lock": true, "sample.md": true, "sample.mdx": true, "sample.mjs": true, "sample.otf": true, "sample.png": true, "sample.ps1": true, "sample.scss": true, "sample.sh": true, "sample.spec.cjs": true, "sample.spec.cts": true, "sample.spec.js": true, "sample.spec.jsx": true, "sample.spec.mjs": true, "sample.spec.mts": true, "sample.spec.ts": true, "sample.spec.tsx": true, "sample.sql": true, "sample.svg": true, "sample.test.cjs": true, "sample.test.cts": true, "sample.test.js": true, "sample.test.jsx": true, "sample.test.mjs": true, "sample.test.mts": true, "sample.test.ts": true, "sample.test.tsx": true, "sample.toml": true, "sample.tsx": true, "sample.ttf": true, "sample.txt": true, "sample.webp": true, "sample.woff": true, "sample.woff2": true, "sample.yaml": true, "sample.yml": true, "scripts": true, "source": true, "test": true, "tests": true, "tsconfig.json": true, "workflows": true, "yarn.lock": true}},
      "setup": [
        {"press": "ctrl+alt+shift+4", "wait": 1200},
        {"press": "alt+shift+F9", "wait": 500},
        {"press": "ctrl+alt+shift+a", "wait": 500},
        {"waitFor": "!!document.activeElement?.closest('.part.editor')", "timeout": 10000},
        {"press": "alt+shift+F7", "wait": 800},
        {"insert": "src/index.ts", "wait": 300},
        {"until": "quick-input-row", "file": "index.ts", "timeout": 10000},
        {"press": "Enter", "wait": 1500},
        {"press": "alt+shift+F7", "wait": 800},
        {"insert": "potions/.keep", "wait": 300},
        {"until": "quick-input-row", "file": ".keep", "timeout": 10000},
        {"press": "Enter", "wait": 1500},
        {"press": "alt+shift+F7", "wait": 800},
        {"insert": "LICENSE", "wait": 300},
        {"until": "quick-input-row", "file": "LICENSE", "timeout": 10000},
        {"press": "Enter", "wait": 1500},
        {"press": "alt+shift+F8", "wait": 1000},
        {"waitFor": "(() => { const view = document.querySelector('.part.sidebar .explorer-folders-view'); const list = view?.querySelector('.monaco-list'); if (!list) return false; const box = list.getBoundingClientRect(); const inside = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; }; const rows = [...view.querySelectorAll('.monaco-list-row')]; const row = (name) => rows.find((r) => r.querySelector('.monaco-icon-label')?.classList.contains(name)); const license = row('license-name-file-icon'); return rows.length === 14 && [\"potions-name-folder-icon\", \"src-name-folder-icon\", \"license-name-file-icon\", \"license.md-name-file-icon\", \"notes.unknown-name-file-icon\", \"sample.cts-name-file-icon\", \"sample.json-name-file-icon\", \"sample.jsonc-name-file-icon\", \"sample.mts-name-file-icon\", \"sample.py-name-file-icon\", \"sample.pyw-name-file-icon\", \"sample.ts-name-file-icon\", \"index.ts-name-file-icon\", \".keep-name-file-icon\"].every((name) => !!row(name) && inside(row(name).querySelector('.monaco-icon-label'))) && ['src-name-folder-icon', 'potions-name-folder-icon'].every((name) => row(name).getAttribute('aria-expanded') === 'true') && license.classList.contains('selected') && license.classList.contains('focused') && view.contains(document.activeElement); })()", "timeout": 10000}
      ],
      "crops": [
        {"name": "sidebar", "selector": ".part.sidebar", "maxHeight": 420}
      ],
      "teardown": [
        {"press": "alt+shift+F5", "wait": 800},
        {"press": "alt+shift+F9", "wait": 500}
      ]
    },
    {
      "name": "tabs",
      "setup": [
        {"press": "ctrl+alt+shift+F8", "wait": 500},
        {"press": "ctrl+alt+shift+F9", "wait": 500},
        {"press": "ctrl+alt+shift+a", "wait": 500},
        {"waitFor": "!!document.activeElement?.closest('.part.editor')", "timeout": 10000},
        {"press": "alt+shift+F7", "wait": 800},
        {"insert": "sample.ts", "wait": 300},
        {"until": "quick-input-row", "file": "sample.ts", "timeout": 10000},
        {"press": "Enter", "wait": 1500},
        {"press": "alt+shift+F7", "wait": 800},
        {"insert": "sample.py", "wait": 300},
        {"until": "quick-input-row", "file": "sample.py", "timeout": 10000},
        {"press": "Enter", "wait": 1500},
        {"press": "alt+shift+F7", "wait": 800},
        {"insert": "sample.json", "wait": 300},
        {"until": "quick-input-row", "file": "sample.json", "timeout": 10000},
        {"press": "Enter", "wait": 1500},
        {"press": "alt+shift+F7", "wait": 800},
        {"insert": "LICENSE", "wait": 300},
        {"until": "quick-input-row", "file": "LICENSE", "timeout": 10000},
        {"press": "Enter", "wait": 1500},
        {"press": "ctrl+alt+F1", "wait": 800},
        {"waitFor": "(() => { const c = document.querySelector('.part.editor .tabs-and-actions-container'); const box = c?.getBoundingClientRect(); if (!box || !box.width) return false; const inside = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; }; const labels = [...c.querySelectorAll('.monaco-icon-label')]; return [\"sample.ts-name-file-icon\", \"sample.py-name-file-icon\", \"sample.json-name-file-icon\", \"license-name-file-icon\"].every((name) => labels.some((el) => el.classList.contains(name) && inside(el))) && c.querySelectorAll('.tab').length === 4 && [...c.querySelectorAll('.tab.sticky:not(.dirty) > .tab-actions .codicon-pinned')].some((el) => inside(el) && !!el.closest('.tab').querySelector('.monaco-icon-label')?.classList.contains('license-name-file-icon')); })()", "timeout": 10000}
      ],
      "crops": [
        {"name": "tabs", "selector": ".part.editor .tabs-and-actions-container"}
      ],
      "teardown": [
        {"press": "ctrl+alt+F2", "wait": 500},
        {"press": "alt+shift+F5", "wait": 800}
      ]
    },
    {
      "name": "breadcrumbs",
      "setup": [
        {"press": "ctrl+alt+shift+a", "wait": 500},
        {"waitFor": "!!document.activeElement?.closest('.part.editor')", "timeout": 10000},
        {"press": "alt+shift+F7", "wait": 800},
        {"insert": "src/index.ts", "wait": 300},
        {"until": "quick-input-row", "file": "index.ts", "timeout": 10000},
        {"press": "Enter", "wait": 1500},
        {"waitFor": "(() => { const c = document.querySelector('.part.editor .breadcrumbs-control'); const box = c?.getBoundingClientRect(); if (!box || !box.width) return false; const inside = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; }; const labels = [...c.querySelectorAll('.monaco-icon-label')]; return [\"index.ts-name-file-icon\"].every((name) => labels.some((el) => el.classList.contains(name) && inside(el))) && c.querySelectorAll('.monaco-breadcrumb-item.folder').length === 1; })()", "timeout": 10000}
      ],
      "crops": [
        {"name": "breadcrumbs", "selector": ".part.editor .breadcrumbs-control"}
      ],
      "teardown": [
        {"press": "alt+shift+F5", "wait": 800}
      ]
    },
    {
      "name": "quick-open",
      "settings": {"files.exclude": {".claude": true, ".env": true, ".env.development": true, ".env.example": true, ".env.local": true, ".env.production": true, ".github": true, ".gitignore": true, ".venv": true, "CHANGELOG.md": true, "Cargo.lock": true, "Dockerfile": true, "README.md": true, "__pycache__": true, "__tests__": true, "assets": true, "bin": true, "cache": true, "conftest.py": true, "dist": true, "docs": true, "fixtures": true, "jest.config.cjs": true, "jest.config.js": true, "jest.config.json": true, "jest.config.mjs": true, "jest.config.ts": true, "jsconfig.json": true, "lib": true, "node_modules": true, "package-lock.json": true, "package.json": true, "poetry.lock": true, "pyproject.toml": true, "pytest.ini": true, "requirements.txt": true, "sample.cjs": true, "sample.css": true, "sample.db": true, "sample.env": true, "sample.fish": true, "sample.gif": true, "sample.htm": true, "sample.html": true, "sample.jpeg": true, "sample.jpg": true, "sample.js": true, "sample.jsonl": true, "sample.jsx": true, "sample.less": true, "sample.lock": true, "sample.md": true, "sample.mdx": true, "sample.mjs": true, "sample.otf": true, "sample.png": true, "sample.ps1": true, "sample.scss": true, "sample.sh": true, "sample.spec.cjs": true, "sample.spec.cts": true, "sample.spec.js": true, "sample.spec.jsx": true, "sample.spec.mjs": true, "sample.spec.mts": true, "sample.spec.ts": true, "sample.spec.tsx": true, "sample.sql": true, "sample.svg": true, "sample.test.cjs": true, "sample.test.cts": true, "sample.test.js": true, "sample.test.jsx": true, "sample.test.mjs": true, "sample.test.mts": true, "sample.test.ts": true, "sample.test.tsx": true, "sample.toml": true, "sample.tsx": true, "sample.ttf": true, "sample.txt": true, "sample.webp": true, "sample.woff": true, "sample.woff2": true, "sample.yaml": true, "sample.yml": true, "scripts": true, "test": true, "tests": true, "tsconfig.json": true, "workflows": true, "yarn.lock": true}},
      "setup": [
        {"press": "ctrl+alt+shift+a", "wait": 500},
        {"waitFor": "!!document.activeElement?.closest('.part.editor')", "timeout": 10000},
        {"press": "alt+shift+F7", "wait": 800},
        {"insert": "sample.", "wait": 300},
        {"until": "quick-input-row", "timeout": 10000},
        {"waitFor": "(() => { const c = document.querySelector('.quick-input-widget .monaco-list'); const box = c?.getBoundingClientRect(); if (!box || !box.width) return false; const inside = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; }; const labels = [...c.querySelectorAll('.monaco-icon-label')]; return [\"sample.ts-name-file-icon\", \"sample.py-name-file-icon\", \"sample.json-name-file-icon\"].every((name) => labels.some((el) => el.classList.contains(name) && inside(el))); })()", "timeout": 10000}
      ],
      "crops": [
        {"name": "widget", "selector": ".quick-input-widget"}
      ],
      "teardown": [
        {"press": "Escape", "wait": 500}
      ]
    },
    {
      "name": "symbols",
      "setup": [
        {"press": "ctrl+alt+shift+a", "wait": 500},
        {"waitFor": "!!document.activeElement?.closest('.part.editor')", "timeout": 10000},
        {"press": "alt+shift+F7", "wait": 800},
        {"insert": "fixtures/pins.grimoire", "wait": 300},
        {"until": "quick-input-row", "file": "pins.grimoire", "timeout": 10000},
        {"press": "Enter", "wait": 1500},
        {"press": "ctrl+alt+F12", "wait": 1500},
        {"waitFor": "(() => { const c = document.querySelector('.quick-input-widget .monaco-list'); const box = c?.getBoundingClientRect(); return !!box && box.width > 0 && ['.codicon-symbol-constructor', '.codicon-symbol-key', '.codicon-symbol-object', '.codicon-symbol-package'].every((s) => [...c.querySelectorAll(s)].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; })); })()", "timeout": 15000}
      ],
      "crops": [
        {"name": "widget", "selector": ".quick-input-widget"}
      ],
      "teardown": [
        {"press": "Escape", "wait": 500},
        {"press": "alt+shift+F5", "wait": 800}
      ]
    }
  ],
  "commitSheets": [
    "main-explorer-closed-sidebar",
    "main-explorer-open-sidebar",
    "main-tabs-tabs",
    "main-breadcrumbs-breadcrumbs",
    "main-quick-open-widget",
    "main-symbols-widget"
  ]
}
EOF
```

The job, scene by scene (the table at the top of this part says what each shows):
- `files.exclude` (three scenes) lists every top-level fixture entry outside the sample, 92 names; `explorer-open` adds `source`.
- Each icon wait checks that the icon or label lies inside its container's box: the Explorer waits use the tree's list box, not the side bar, so a row behind the Outline header does not count (the 200% finding).
- Every quick open is `alt+shift+F7`, the typed name, `{ "until": "quick-input-row", "file": … }`, Enter, after a wait for the editor group's focus (the gate-4 lesson).

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test test/review-harness.test.mjs test/review-workspace.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 55`, `ℹ pass 55`, `ℹ fail 0`.

Then: `npm test 2>&1 | grep -E '^ℹ (tests|pass|fail)' && npm run validate 2>&1 | grep -E '^…|^✓' && git add -A && git ls-files review/workspace-files | wc -l && git ls-files review/workspace-files/node_modules`
Expected:
- `ℹ tests 492`, `ℹ pass 492`, `ℹ fail 0` (483 + 9). The total comes only from `test/**/*.test.mjs`: if it jumps by six or more, or fails with `Invalid package config`, `scripts.test` lost its pattern (measured with the bare `node --test` and the fixture in place: 498 tests, the six fixture files collected, `Invalid package config` twice).
- `… 17 pending problems in stages not yet enforced: release (2), file-icons (15) (use --verbose to list)` and the `✓` line of Task 14, unchanged.
- `105`, then `review/workspace-files/node_modules/.keep`.

- [ ] **Step 6: Dry-run the gate-5 job (100% and 200%) and look at every sheet**

```bash
export AGENT_BROWSER_SESSION=spellbound-gate5
node scripts/review/run-gate.mjs --job review/jobs/gate-5.json --scales=1,2
node scripts/review/privacy-scan.mjs review-out/<run>/sheets/*.png review-out/<run>/captures/manifest.json
agent-browser session list
```

Gate 5 has only these two scales, so this dry run is the whole job; `--scales` only marks the manifest as a dry run (never gate evidence). Expected, after about 4 minutes: `✓ Browser closed`, `6 contact sheets in …/sheets`, `Gate run complete: …/review-out/<run> (96 captures, 0 warnings)`; one `✓` per sheet and for the manifest, exit 0; `No active sessions`. Measured with Tasks 1-14 applied: run 2026-10-11T05-04-47, 96 captures, 0 warnings, about 3.5 minutes; six sheets and the manifest pass the privacy scan; sheets 2400×3552 (both Explorer sheets), 7489×1600 (tabs, breadcrumbs), 3749×1796 (quick open), 3749×1600 (symbols).

Open every sheet under `review-out/<run>/sheets/` with the Read tool. Each row is a theme; the columns are 100%, 100% grayscale, 200%, 200% grayscale. Check, in every theme and at both scales:
- `main-explorer-closed-sidebar`: the 13 sample rows, folders closed, no row highlighted; the Outline header below.
- `main-explorer-open-sidebar`: `potions` with `.keep` and `src` with `index.ts` open, `LICENSE` on the active selection colour (Moonlit Candle `#633B79`, Moonlit `#F04EAB`, Daydream `#B52776`, Coven Contrast `#FF67B7`) with the focus outline, 14 rows, the last (`sample.ts`) whole at 200%.
- `main-tabs-tabs`: `LICENSE` first with the pushpin, then `sample.ts`, `sample.py`, `sample.json`, all four whole at 200%.
- `main-breadcrumbs-breadcrumbs`: `src`, the separator, the `index.ts` icon and name.
- `main-quick-open-widget`: `sample.` typed; the focused row (`sample.py` in a full run) on the focus colour with its Open to the Side and Remove buttons; ts, py and json rows below.
- `main-symbols-widget`: four rows, the house cube (constructor), `abc` (key) and braces (object, package).
- Nothing in any crop is covered by a tooltip, a toast or a hover highlight, and no row carries a problem or git colour.

What the sheets show with this plan's drawings (run 2026-10-11T05-04-47): `potions` the default folder, `source` and `src` the badged folder, `LICENSE` and `LICENSE.md` the contract, `notes.unknown` and `.keep` the parchment, the ts files and `index.ts` the cut gem, the py files the snake, the json files the keyring, in every theme and both scales; on the selected `LICENSE` row and the focused quick-open row of Moonlit, Daydream and Coven Contrast the icon fades into the pink (F9), on Daydream almost entirely. While drafting, with the 1.2.1 icons, each finding above was fixed and re-run: runs 2026-10-11T03-19-22 (stopped: breadcrumbs folder icon), 03-23-53 (stopped at 200%: tabs scrolled), 03-27-17 (stopped at 200%: the 15th Explorer row cut), 03-32-37 (stopped at a 200% launch: resting pointer), 03-35-33 (96 captures, 0 warnings, before the park point moved to the activity bar), 03-52-38 (the final job and harness: 96 captures, 0 warnings). The waits match VS Code's class names, not drawings, so the 1.2.1 icons and these give the same counts.

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out/g5 && git add -A && git write-tree | tee review-out/g5/TREE_15`
Expected: one 40-character tree id, also saved in `review-out/g5/TREE_15`.

### Task 16: Run gate 5 and hand it to the author

**Files:**
- Create: `docs/qa/2.0-gate-5/README.md`, `docs/qa/2.0-gate-5/manifest.json`, the six `commitSheets` of `review/jobs/gate-5.json` as `docs/qa/2.0-gate-5/*.png`, and the file-icon sheet at 1× and 2× (`docs/qa/2.0-gate-5/file-icon-sheet@1x.png`, `file-icon-sheet@2x.png`)

**Interfaces:**
- Consumes: everything above: the pipeline and validation stage of Part A (`file-icons:pipeline`, the F9 soft warning, `npm run file-icon-sheet` with its role strip and grayscale copy), the sample drawings of Part B, and Tasks 14 and 15. Step 5's template already carries the drawing choices and decisions of Parts A and B, each with a recommendation.
- Produces: the review-gate-5 package. This plan ends here; gate 6 is planned after the gate-5 decisions land (spec 6.3).

- [ ] **Step 1: Verify the preconditions**

Run: `npm test 2>&1 | grep -E '^ℹ (tests|fail)' && npm run validate 2>&1 | grep -E '^…|^⚠|^✓' && node -e "console.log(Object.keys(require('./icons/file-icon-map.json').drawings).join(' '))" && ls icons/witchy-*.svg 2>/dev/null | wc -l`
Expected: `ℹ tests 492`, `ℹ fail 0`; `… 17 pending problems in stages not yet enforced: release (2), file-icons (15) (use --verbose to list)` (full coverage stays pending until gate 6); the three accepted grid lines (`cat-slash`, `gear`, `sync-arrows`) and the twelve `⚠ F9` lines of Task 13 Step 3 (four colours on each of Moonlit's, Daydream's and Coven Contrast's selection colours; the table in Step 5's template); the `✓` line with `file-icons:pipeline` enforced; the nine drawings `parchment folder folder-open folder-src folder-src-open gem-cut snake keyring contract` (in the map's order); `0` (the 1.2.1 `witchy-*.svg` files are gone; `git status` would list their staged deletions instead).

Then run the file-icon sheet procedure (Global Constraints) and keep its `review-out/file-icon-sheet/sheet@1x.png` and `sheet@2x.png` for Step 4. Expected as in Task 13 Step 4: `… 51 resolved SVGs`, `sheet@1x.png` 1700×4352, `sheet@2x.png` 3400×8704.

- [ ] **Step 2: Run the full gate**

Run: `AGENT_BROWSER_SESSION=spellbound-gate5 npm run review:gate -- --job review/jobs/gate-5.json`
Expected, after about 4 minutes: `✓ Browser closed`, `6 contact sheets in …`, `Gate run complete: …/review-out/<run> (96 captures, 0 warnings)` (6 scenes × 2 captures × 4 themes × 2 scales). Note the `<run>` id: Step 4 copies that run, not the newest folder. If a non-optional wait times out, the run stops and names the scene and step; re-run once with the pointer off the review window, and fix the scene if it stops again. Never paste the output of a failed run (it holds the Windows Temp path).

- [ ] **Step 3: Review the sheets yourself before the author does**

Open every sheet with the Read tool, and the two file-icon sheets, and record in the README (the "Seen at this gate" lines and the notes under "Choices"):
- each sample drawing at 16px at 100% and 200%, in all four themes and in the grayscale columns: does it read as its object (the parchment with its fold, the folder and its tab, the open folder's flap, the `src` grimoire badge, the contract with its seal, the cut gem, the snake, the keyring) beside the other sample icons, and against the 32×-supersampled reference on the file-icon sheet;
- the gem language (ts, mts, cts in `main-explorer-closed-sidebar`, `main-tabs-tabs`, `main-quick-open-widget`, `main-breadcrumbs-breadcrumbs`): would js and tsx gems have room to differ in silhouette (spec 6, 16px rules);
- `folder-src-open` (the `src` row of `main-explorer-open-sidebar`, the file-icon sheet): does it read as open at 100%, with the knockout leaving only the flap's left side and a 3-unit stub of its top edge;
- `snake` at 100% (not only 200%): a snake, or the letter S;
- the house construction across the sample: one outline plus one accent per drawing, the four accents that touch their outline (the fold, the tab, the snake's head, the key bows), keylines (portrait 12×14 against the folders' 14-wide body), the badge's 1-unit knockout from the folder outline, closed and open folders told apart;
- the `src` badge and the default folder side by side (`main-explorer-closed-sidebar`, `main-explorer-open-sidebar`), and the default parchment beside `LICENSE`, `.keep` and `notes.unknown`;
- F9: every sample icon on the selected `LICENSE` row (`main-explorer-open-sidebar`) and on the focused quick-open row (`main-quick-open-widget`), per theme, and the file-icon sheet's role strip (the parchment in all eight roles on each theme's selection and quick-input focus colours); whether an icon disappears on a row, and in which themes;
- the pushpin on the pinned `LICENSE` tab (`main-tabs-tabs`) and the four G34 symbols (`main-symbols-widget`);
- every stock or 1.2.1 icon still visible (for "Known staging artifacts").

Do not redraw anything now.

- [ ] **Step 4: Copy the sheets and the manifest, then scan them**

```bash
RUN=review-out/<run> # the id Step 2 printed
node -e "process.exit(require('./$RUN/captures/manifest.json').dryRun ? 1 : 0)" || echo "STOP: $RUN is a dry run, not gate evidence"
mkdir -p docs/qa/2.0-gate-5
for name in $(node -e "console.log(require('./review/jobs/gate-5.json').commitSheets.join(' '))"); do
  if [ -f "$RUN/sheets/$name.png" ]; then cp "$RUN/sheets/$name.png" docs/qa/2.0-gate-5/; else echo "not produced: $name"; fi
done
cp review-out/file-icon-sheet/sheet@1x.png docs/qa/2.0-gate-5/file-icon-sheet@1x.png
cp review-out/file-icon-sheet/sheet@2x.png docs/qa/2.0-gate-5/file-icon-sheet@2x.png
cp "$RUN/captures/manifest.json" docs/qa/2.0-gate-5/manifest.json
chmod 644 docs/qa/2.0-gate-5/*
ls docs/qa/2.0-gate-5 | wc -l
node scripts/review/privacy-scan.mjs docs/qa/2.0-gate-5/*.png docs/qa/2.0-gate-5/manifest.json; echo "exit $?"
```

Expected: no `STOP` line and no `not produced` lines; `9` files (six sheets, two file-icon sheets, the manifest); one `✓` per file and `exit 0` (exit 2 means the scan could not run: fix that, never skip it). Then open `main-explorer-open-sidebar.png`, `main-quick-open-widget.png` and both file-icon sheets with the Read tool: the scan reads text, so also check by eye that no path, user or machine name shows. Raw captures stay in `review-out/`.

- [ ] **Step 5: Write `docs/qa/2.0-gate-5/README.md`**

Fill the angle-bracket fields from the run and from Step 3; every other line is final text. The Choices entries for the drawings are final text; complete their "Seen at this gate" lines from Step 3.

````markdown
# Spellbound 2.0, review gate 5 (file-icon pipeline and sample)

- Run: <run id> · VS Code <version> (<commit dir>) · mode device-scale · repo <commit> (dirty: gate-5 work is uncommitted, so `repoDirty` is true)
- Reproduce: `AGENT_BROWSER_SESSION=spellbound-gate5 npm run review:gate -- --job review/jobs/gate-5.json` (`--help` lists the dry-run options; gate-5 harness and scenes in docs/superpowers/plans/2026-10-11-spellbound-2-gate-5.md, Part C). The file-icon sheet: `npm run file-icon-sheet` (same plan, Part A).
- Raw captures (not committed): review-out/<run>/captures. `manifest.json` here lists all <n> with their sha256: 6 scenes × 2 captures × 4 themes × 2 scales = 96. <k> warnings<: list them>.
- Committed here: the six `commitSheets` of `review/jobs/gate-5.json` and the file-icon sheet at 1× and 2×. Every sheet, this README and the manifest passed `node scripts/review/privacy-scan.mjs`, and every sheet was checked by eye. The fixture is copied as `workspace`, so no path shows in the title bar.

## Preconditions
- `npm test`: <n> of <n> pass. `npm run validate`: passes with `file-icons:pipeline` enforced beside every product stage; `file-icons` (full key coverage, gate 6) and `release` stay pending, as staged validation allows.
- F9 soft warnings (`⚠`, not failures): 12 lines, one per resolved colour and theme under 3:1 on its selection colour (the table under Decisions).
- The map holds nine drawings: `parchment`, `folder`, `folder-open` (the defaults), `folder-src`, `folder-src-open`, `gem-cut`, `snake`, `keyring`, `contract`. The 1.2.1 `witchy-*.svg` files are gone. No product glyph changed (177 pinned keys).

## What to judge
- Each sheet: rows = theme · variant; columns = 100%, 100% grayscale, 200%, 200% grayscale.
- The Explorer with the sample, folders closed (main-explorer-closed-sidebar): `potions` (the default folder: it matches no key), `source` and `src` (the `src` badge), `LICENSE` and `LICENSE.md` (the contract), `notes.unknown` (the default parchment), `sample.ts`/`.mts`/`.cts` (the cut gem), `sample.py`/`.pyw` (the snake), `sample.json`/`.jsonc` (the keyring).
- The same with `potions` and `src` open and `LICENSE` selected in the focused tree (main-explorer-open-sidebar): the open folders, the default parchment on `.keep`, the gem on `src/index.ts`, and the contract on the active selection colour (F9). `source` is hidden in this scene: at 200% the tree holds 14 full rows.
- Tabs (main-tabs-tabs): `LICENSE` pinned with the gate-4 pushpin (G32), then `sample.ts`, `sample.py`, `sample.json`.
- The breadcrumb bar (main-breadcrumbs-breadcrumbs): `src › index.ts`. VS Code 1.141 draws no icon on a folder item there, only on the file.
- Quick open (main-quick-open-widget): `sample.` typed, ts, py and json with their sibling extensions, the first row focused (F9).
- Go to Symbol (main-symbols-widget): `symbol-constructor` (the cube), `symbol-key` (`abc`), `symbol-object` and `symbol-package` (the braces), pinned at gate 4 (G34) and waited for here.
- The file-icon sheet (file-icon-sheet@1x.png, file-icon-sheet@2x.png): every drawing at 16 and 32px on each theme's sidebar, list selection and quick-input focus colours, against a 32×-supersampled reference; the role strip (the parchment in each of the eight roles); a grayscale copy.

## Decisions for the author at this gate
- **Decision: the house construction (F6, F7, section 6.2).**
  - Finding: every drawing is a 1-unit outline in its category colour plus one filled accent, which may take another role (the gold seal on the contract); folder badges are solid silhouettes in a 7×7 box at x 8-15, y 8-15, with the folder outline knocked out 1 unit around it; interiors are transparent; no opacity or gradients; portrait objects use the 12×14 keyline. Accents that are part of the object's silhouette touch their outline instead of keeping section 4's 1-unit clearance: the parchment fold and the folder tab (as the approved product `symbol-file` and `symbol-folder`, G39), the snake's head (it continues the band) and the key bows (they hang on the ring; two discs in one accent part). Accents that sit on the object keep the clearance (the gem's crown, the contract's seal, the `src` badge). <one line from Step 3: how the sample reads as a family at 100% and 200%, and in grayscale>
  - Options: approve the construction for gate 6, or name the rule to change (accent role, keylines, badge box, knockout), or require the 1-unit clearance for every accent (next decision).
  - Recommendation: approve, unless Step 3 found a sample drawing that the construction itself, not its geometry, keeps from reading at 16px.
  - Seen at this gate: <main-explorer-closed-sidebar, main-explorer-open-sidebar, the file-icon sheet>.
- **Decision: accents that touch their outline (section 4 exceptions).**
  - Finding: section 4 asks one full unit between an accent and a stroke and one filled accent shape per icon, and lists its exceptions by name (gates 2 and 4). Four accents of this sample touch or overlap their own outline: the parchment fold and the folder tab (the gate-4 product page and folder split into outline and accent; G39 kept them mapped), the snake's head (it meets the band along x = 9, so the head continues the body), and the keyring's bows (they overlap the ring by up to a unit, so the keys hang on it; the accent is two 3×3 discs in one part). Nothing in the `file-icons:pipeline` stage checks clearance, so only this ruling decides it. Gate 6 copies the house construction. <from Step 3: whether any of the four reads as merged into its outline at 16px>
  - Options: (a) accept the four as named section-4 exceptions, with the rule that an accent which is part of the object's silhouette (a fold, a tab, a head, a bow) may touch its outline and an accent that sits on the object (a crown, a seal, a badge) keeps the unit; (b) require the 1-unit clearance for every accent: the fold and tab then differ from `symbol-file` and `symbol-folder`, the snake's head floats off its body and the bows off the ring.
  - Recommendation: (a), and record the four in section 4's exception list with the rule, so gate 6 applies it the same way.
  - Seen at this gate: <the file-icon sheet's magnified reference, main-tabs-tabs>.
- **Decision: the gem language (section 6.2: gate 5 sets it with ts).**
  - Finding: `gem-cut` (ts, mts, cts) is a cut gem: wide (14), flat on top, widest at the girdle, pointed at the bottom; the solid crown with its flat table is the accent (see Choices). It sets the language gate 6 follows, sketched while planning (Task 10 Step 4, `review-out/g5-sample/gem-language.png`, not committed): js, the rough crystal, narrow and tall, pointed at the top, a second shorter point beside it, no girdle or table; tsx/jsx, the gem in a ring, round, a 10-unit ring band with a small cut gem set on top, point down. The three differ in 240-384 of 1024 ink samples, and read apart at 16px in every theme and in grayscale. Risk for gate 6: the js sketch's two upright blocks can read as a bar chart or a building. <from Step 3>
  - Options: approve the cut gem and the language as the reference for gate 6, or change it now.
  - Recommendation: approve, with the note that gate 6 tilts or facets the short js crystal so it does not read as a bar chart.
  - Seen at this gate: <main-explorer-closed-sidebar, main-tabs-tabs, main-quick-open-widget, main-breadcrumbs-breadcrumbs>.
- **Decision: approve each sample drawing.** One line each, from Step 3; the construction notes come from Parts A and B (see Choices):
  - `parchment` (every unmatched file; `notes.unknown`, `.keep`): <reading>.
  - `folder` and `folder-open` (every unmatched folder; `potions`): <reading>.
  - `folder-src` and `folder-src-open` (`src`, `source`): <reading>.
  - `contract` (`LICENSE`, `LICENSE.md`): <reading>.
  - `gem-cut` (ts, mts, cts): <reading>.
  - `snake` (py, pyw): <reading>.
  - `keyring` (json, jsonc): <reading>.
  - Recommendation: approve each that reads as its object at 16px at 100% and in grayscale; list a redraw for any that does not. The optional overrides are listed under Choices (the 14×11 folder, the hollow tab on badged folders, the gem's height, the seal colour).
- **Decision: F9, file icons on a selected or focused row.**
  - Finding: on the active selection and the focused quick-input row, file icons lose most of their contrast in three of the four themes, not only the style colour. Contrast of each role on the selection colour (spec 6 palette; `contrast` from `src/color.mjs`; Daydream and Moonlit set no `quickInputList.focusBackground`, so their focused quick-input row takes the list selection colour, as the quick-open sheet shows):

    | Theme (set) | Selection | code | data | style | tests | config | docs | assets | muted |
    | :- | :- | :- | :- | :- | :- | :- | :- | :- | :- |
    | Moonlit Candle (dark) | `#633B79` | 3.75 | 6.14 | 3.24 | 5.75 | 3.29 | 7.37 | 5.41 | 3.29 |
    | Moonlit (dark) | `#F04EAB` | 1.43 | 2.34 | 1.23 | 2.19 | 1.25 | 2.81 | 2.06 | 1.25 |
    | Daydream (`light`) | `#B52776` | 1.13 | 1.12 | 1.00 | 1.05 | 1.04 | 2.19 | 1.03 | 1.04 |
    | Coven Contrast (`highContrast`) | `#FF67B7` | 1.52 | 2.11 | 1.00 | 1.77 | 1.02 | 2.67 | 1.67 | 1.02 |

    The palette cannot fix this and keep its categories: against Daydream's `#B52776` (relative luminance 0.126) a colour needs a luminance of at least 0.477, which is 1.79:1 on Daydream's sidebar `#F8F0FB`, or at most 0.009, which is near black for every role; against Coven's `#FF67B7` (0.344) it needs at most 0.081 (above 1 is impossible), which is 2.63:1 on Coven's black sidebar, so no value reaches 3:1 on both. <Seen at this gate: per theme, which sample icons fade or vanish on the selected `LICENSE` row and the focused quick-open row, and what the role strip shows>
  - Options: (a) accept: the row's label stays readable and the icon returns when the row loses the selection or focus; F9's soft warning stays as the record. (b) Change the selection colours of Moonlit, Daydream and Coven Contrast (`list.activeSelectionBackground`, and `quickInputList.focusBackground` where set) to colours every role reaches 3:1 on, a colour-theme change that reopens G29 for Coven. (c) Give the icons a keyline in another role on selected rows: not possible, a file icon theme cannot style a selected row differently.
  - Recommendation: (a), accept for the icons at gate 5, with the table above and the twelve `⚠ F9` lines as the record: no icon colour can fix this (the icon palette cannot reach 3:1 on these selection colours and on the side bars at once), and (b) changes the look of three color themes for a state that lasts only while a row is selected. Any change to the selection colours is a separate color-theme decision, taken as its own task before gate 6 if the author wants it; it is not a file-icon change.
- **Decision: approve gate 5, or list changes.** Gate 6 (the remaining drawings in batches, then the whole set) is planned only after these decisions land.
  - Recommendation: approve, subject to the decisions above.

## Evidence for decisions already taken (spec section 11)
- G32: the pushpin on the pinned `LICENSE` tab (main-tabs-tabs).
- G34: `symbol-constructor`, `symbol-key`, `symbol-object` and `symbol-package` on the cube, `abc` and braces in Go to Symbol (main-symbols-widget); gate 5 waits for each (`PINNED_AFTER_GATE_4_RUN`).
- F8: the assets colour is each theme's blue (role strip of the file-icon sheet).
- F9: the selected and focused rows (main-explorer-open-sidebar, main-quick-open-widget) and the role strip, with the table above.

## Choices made in this phase that the author may overrule
Drawings (Parts A and B; every geometry change against the proposed geometry of spec 6.2):

- **The defaults are the gate-4 product glyphs, so the folder is 14×12 overall, not a 14×11 body.** `parchment` is the product `page` (`symbol-file`) and `folder` the product `folder` (`symbol-folder`), each split into an outline and a filled accent (a test fails if either stops matching), so a file or folder looks the same with or without this file icon theme (breadcrumbs and quick open use the product icons when another file icon theme is set). Spec 6.2 proposed a 14×11 body; the approved product folder is x1-15, y2-14: the body y4-14 under a tab that rises to y2. Alternative: a lower 14×11 body with the tab inside its top row, which would then differ from `symbol-folder`. Recommendation: keep 14×12. Seen at this gate: <file-icon sheet, main-explorer-closed-sidebar>.
- **The open folder's flap.** A front flap x1-15, y8-14 whose sides run at 2:1 (dy:dx) and are 1.5 units across horizontally (1.34 across the stroke, section 4's diagonal weight); where the flap's left side meets the back's left wall the gap narrows under 1 unit, so that wedge is filled below y10. Rejected on 32× renders while planning: 1-unit sides (blurred into half-covered columns at 100%), the wedge filled from y8 (one heavy block with the tab), a flap with a straight left side (read as a closed folder with a line across it). Recommendation: keep. Seen at this gate: <main-explorer-open-sidebar (`potions`, `src`), file-icon sheet>.
- **Badged folders keep the filled tab.** `folderBody({ badge: true })` is the default folder with the badge box knocked out, so a badged folder has two solid masses: the muted tab and the badge in its category. Alternative: a hollow tab on badged folders (F7's one-accent rule read strictly; the badge is then the only filled part). On the planning renders (Task 9 Step 5, `review-out/g5-sample/badge-tab.png`, not committed) the hollow tab made the badged folder lighter than the default folder beside it. Recommendation: keep the filled tab, so every folder in a tree weighs the same and only the badge differs. Seen at this gate: <main-explorer-closed-sidebar: `potions` beside `source` and `src`>.
- **The badge knockout is drawn, not clipped, and exactly 1 unit:** the right wall stops at y7 and the bottom wall at x7 (a clip would flatten the corner arcs into off-grid segments). `BADGE_BOX` (x8-15, y8-15, as spec 6.2 places it) overhangs the folder's bottom edge by one unit. On `folder-src-open` the knockout leaves only the flap's left side, its filled wedge and a 3-unit stub of its top edge, so the open state reads mostly from the left of the icon; it still differs from `folder-src` by the wedge. Recommendation: keep; if the open badged folder does not read as open at 100%, redraw the flap's left part, not the knockout. Seen at this gate: <file-icon sheet, magnified reference; main-explorer-open-sidebar, the `src` row>.
- **The `src` badge is a grimoire with a spine slot, not a spine notch.** A solid closed book 6×7 at x9-15, y8-15 (one column of the 7×7 box left free, so the book stands portrait, flush with the folder's right edge), its one feature a straight 1×5 slot x10-11, y9-14 that sets off a 1-unit spine (section 4's straight-slot exception). Spec 6.2 says "a cut spine notch"; a notch cut in from an edge read as an `L` or a hook on the planning renders. Rejected: a book with a page notch at its lower right; a 7×7 tile with the slot (heavier than the folder around it). Recommendation: keep. Seen at this gate: <main-explorer-closed-sidebar, main-explorer-open-sidebar>.
- **`gem-cut`: the whole crown is the accent, and the gem is 13 tall.** Spec 6.2 names the table facet as the accent; inside an outlined crown the table is at most 6×2, under the 4×4 shape minimum, so the crown is solid (the table x5-11 on top, 45° sides) and floats one unit above a 1-unit girdle, which gives the gem its cut line. The pavilion is a 1-unit outline whose 45° sides are 2 units across horizontally. The gem is 14 wide as proposed but 13 tall (y1-14), one row more than the 14×12 landscape keyline: 4 (crown) + 1 (cut) + 1 (girdle) + 7 (pavilion). It is the heaviest drawing of the sample and its flat top sits one pixel above a folder's tab. Rejected: the crown on a bare V (uncut), a 3-unit crown (under the minimum), a crown on a 2-unit girdle (one heavy block). Alternative: shift it to y2-15 (the point then reaches the sheets' bottom edge). Recommendation: keep y1-14. Seen at this gate: <main-explorer-closed-sidebar, main-tabs-tabs>.
- **`snake`:** a geometric S of one 2-unit band (coils of outer radius 3.5 and inner 1.5 on .5 centres, runs 3 units apart), a 5×4 head with a round nose bulging one unit above and below the band, a tail cut at 45° to a point. One band and one head (spec 6's logo rule; a test pins it). It can read as a stylised S; the head and the taper make it a snake. Rejected: a 4×4 round head (an S with a pin), a pointed viper head (an S-shaped arrow). Recommendation: keep. Seen at this gate: <main-tabs-tabs, main-quick-open-widget>.
- **`keyring`:** the bows are the 3×3 dot minimum (one accent part, two discs on .5 centres, so each covers whole pixels), overlapping the ring band so the keys hang on it and keeping 0.31 units of band to the hole; the keys hang straight down, the short one (x4-5) with one tooth to the left, the long one (x9-10) with two to the right, 2.39 units apart. The bows touching the ring are one of the accent exceptions under Decisions. Rejected: 4×4 bows (merged with the ring into a blob), a bow off the ring (a floating key), and the first version's short key one unit further right, whose bow sat on a whole-number y centre and blurred at 16px. Recommendation: keep. Seen at this gate: <main-explorer-closed-sidebar, main-tabs-tabs>.
- **`contract`:** the sheet has no fold (the parchment has one), so LICENSE and a plain file differ in silhouette; the second text bar is shorter (x5-9); the seal (diameter 6 about (11,12), as proposed) reaches one unit past the sheet's right edge, and the sheet is knocked out around it by 1.12 units (right wall to y8, bottom wall to x7). Recommendation: keep. Seen at this gate: <main-explorer-open-sidebar (`LICENSE` beside `.keep`), main-tabs-tabs>.
- **The seal is gold (`{data}`), as spec 6.2 proposes.** In grayscale ivory and gold are close in value, and the 1.12-unit knockout is what keeps them apart; on the pink selections gold measures 1.12-2.34:1 and ivory 2.19-2.81:1. Alternatives: an ivory seal (one colour; the sample then has no multi-colour case) or the style pink (worse on the pink selections). Recommendation: keep gold, the sample's one multi-colour case. Seen at this gate: <main-explorer-open-sidebar, file-icon sheet grayscale copy>.

Gate harness (Part C):

- The gate shows the sample through `files.exclude`: the fixture holds a file or folder for every key of spec 6 (gate 6 needs them all), and at 200% the Explorer shows 14 rows, so each Explorer and quick-open scene hides everything but the sample. `explorer-open` also hides `source`, the `src` alias `explorer-closed` shows.
- The default folder is shown on `potions/` and the default parchment on `notes.unknown` and `.keep`, names no key matches.
- The quick-open list's focused row is whichever file quick open puts first: in a full run the most recently opened match (`sample.py`).
- <glyph-level notes from Step 3>

## Known staging artifacts (not defects)
- Keys outside the sample show the default parchment and folder until gate 6 (spec 6.1, step 7): in these sheets `index.ts` and every sample file are matched, so only `notes.unknown`, `.keep` and `potions` show the defaults on purpose; any other fixture file would too.
- The breadcrumb bar shows no folder icon (VS Code 1.141 draws none there).
- The `tabs` scene closes both side bars (at 200% the editor between them held two tabs); the Explorer scenes collapse the folders first and open them by revealing files.
- The quick-open row shows Open to the Side and Remove from Recently Opened on the focused row: VS Code's own, drawn by the product icon theme.
- The quick-open input shows the text caret after `sample.` in some cells and not in others (the caret's blink phase at capture time), not a difference between themes.
- <stock or 1.2.1 icons seen, from Step 3, if any>

## Colour-theme observations (not glyph defects)
- In Moonlit and Coven Contrast the matched part of a focused quick-input row (`sample.`, `quickInputList.focusHighlightForeground` unset) is drawn in the list highlight colour on the pink focus colour and is hard to read (main-quick-open-widget); Daydream's is too. <confirm per theme from Step 3>
- <from Step 3, per theme, if any>

## Harness changes made for this gate
- A job may name its fixture (`"workspace"`, a folder of `review/`); the gate 1-4 jobs keep `review/workspace`, which alone becomes the gate-2 git repository. Gate 5 uses `review/workspace-files/`: an empty file per required extension and file name, every required folder with one child, and `notes.unknown` and `potions/` for the defaults. Git keeps its `node_modules` folder through a negated ignore rule, and `npm test` now runs only `test/**/*.test.mjs` (the fixture's `sample.test.*` files would otherwise run).
- Quick-input waits require a focused result row of the asked file (`{ "until": "quick-input-row", "file": … }`, one shared wait); the gate-4 job uses it for its 12 quick opens.
- The contact sheet adds a grayscale column after each scale, and closes its agent-browser session, also when a sheet fails.
- Every launch parks the page's pointer on the activity bar's empty stretch before the first scene (a resting pointer kept a tooltip open), and the review profile ignores extension recommendations (opening `sample.py` raised one).
- Still deferred (F5): the test-hygiene helpers, the per-theme Disconnect check, the `search-replace` teardown, and the gate 1-3 jobs reproducing their sheets. The park point and the grayscale columns apply to every job, and the gate 1-3 jobs have not been re-run with them (gate 4 was re-run on a subset in the plan's dry runs, gate 5 in full).
- <fixes made while running, with the failed run id and the cause in your own words; never paste error output (it holds the Windows Temp path)>

## Approval
Author: approve gate 5 as is / approve with the changes listed below / redraw. Gate 6 starts only after approval.
````

Then scan the README: `node scripts/review/privacy-scan.mjs docs/qa/2.0-gate-5/README.md; echo "exit $?"`. Expected: one `✓` line and `exit 0`.

- [ ] **Step 6: Snapshot the tree and stop**

Run: `mkdir -p review-out/g5 && git add -A && git write-tree | tee review-out/g5/TREE_16`
Expected: one 40-character tree id, also saved in `review-out/g5/TREE_16`.

Stop here. Report the README path `docs/qa/2.0-gate-5/README.md`, the tree id and the run id to the author, and wait for the gate decisions. Do not commit (the author commits after gate 5) and do not start gate 6.

## Later plans (after the author approves gate 5)

**Gate 6 (spec 6.3).** The remaining drawings of section 6 in batches (code; data and config; docs, assets and tests; folders), added to the five modules of this plan, then the whole set judged together over every fixture file, with Explorer pages that scroll the full tree; `file-icons` (full key coverage, including the seven `languageIds` still missing) is enforced when the last batch lands. The gem language approved here (and the js bar-chart note) is its rule for js and tsx/jsx. Planned after the gate-5 decisions land.

**If the author picks option (b) for F9.** A change to the selection colours of Moonlit, Daydream and Coven Contrast is a color-theme task (it reopens G29 for Coven), planned and reviewed on its own before gate 6; no file-icon colour changes for it.

**Release (spec section 9, F1).** Planned after gate 6, because its Marketplace images need the finished icons. It also adds the README statement of spec 6's logo rule: the file icons are original and not affiliated with any language or tool.

The gate-5 decisions (the house construction, each drawing, any override listed under Choices, F9) are applied, if taken, before the author's commit of gate 5, as the gate-3 and gate-4 decisions were.

---

## Review notes

The plan was assembled from three drafted parts, each drafted and measured on its own scratch worktree of `538035f` without the `../witchyterm` sibling: Part A (pipeline and defaults, 8 tasks), Part B (the sample drawings, 5 tasks, drafted on top of Part A's tree) and Part C (harness, fixture, gate-5 job and run, 3 tasks, drafted alone). The assembled plan was then applied end to end, Task 1 to Task 15, on one fresh worktree of `538035f` (Task 16's gate run excepted), and every count, TAP number, SVG, sheet size and validate line above comes from that run. Changes made while assembling:

- **Order and numbering.** Part A, then Part B, then Part C: Tasks 1-8, 9-13, 14-16. Every cross-reference, snapshot name (`review-out/g5/TREE_N`), code comment that named a part task (`Folder construction (Task 3)`, the throwaway renders of Tasks 9, 10 and 13) and expected number was rewritten for this order. The part headings stay as plan sections, as in the gate-4 plan.
- **The file-icon sheet procedure.** Part A's block took the reference table with `agent-browser screenshot "#reference"`, which comes back blank below the first rows once the table is taller than the viewport (Part B measured it). The header now crops the reference from the full-page capture, and Task 5's sizes were re-measured with it (`reference@1x.png` 1247×464, `reference@2x.png` 2494×928; Part A had 1246×464 and 2492×928 from the element screenshot). Tasks 9-13 already assumed the crop and measured the same sizes here.
- **`npm test` and the fixture.** The fixture's `sample.test.*` files and empty `package.json` break the bare `node --test` (measured here with the fixture in place: 498 tests, the six fixture files collected, `Invalid package config` twice). Part C narrowed `scripts.test` in Task 15 Step 4, one step after the fixture was written; the narrowing now runs first in Task 15 Step 3, before any fixture file exists, so no `npm test` of any task ever meets the fixture under the old script. Every test file of Tasks 1-15 is `test/<name>.test.mjs` (Task 15's test pins it), so the narrowed script collects the same tests the bare one did (483 after Task 14; 492 after Task 15, its nine new tests).
- **Collisions between the parts.** Parts A and B touch none of `scripts/review/*`, `review/**`, `.gitignore` or `test/review-*.test.mjs`; Part C's patches applied unchanged on Part B's tree, and the harness files after Task 15 are byte for byte Part C's. The one shared file is `package.json`: Part A adds four scripts, Part C sets `scripts.test` with `npm pkg set`, which leaves them in place (checked by diff).
- **The file-icon sheet names.** Part C's Task 16 copies `review-out/file-icon-sheet/sheet@1x.png` and `sheet@2x.png`; those are the procedure's names, now said once in the header; the hedge in Task 16 Step 1 was replaced by the expected count and sizes.
- **Part C's [A+B] placeholders** were replaced by measured values: Task 14 483 tests and the `✓` line with `file-icons:pipeline`; Task 15 492 tests; the dry runs' icons described as this plan's drawings.
- **Task 8 Step 2's red run** grepped `^not ok` from the default reporter, which prints none; it now uses `--test-reporter=tap` and the `#` summary lines.
- **Task 16 Step 1** checked that the 1.2.1 icons are gone with `git status --short icons/witchy-*.svg | wc -l` and expected `0`; after the snapshots' `git add -A` their staged deletions print 12 lines. It now counts the files on disk (`ls … | wc -l`, `0`).
- **Task 15 Step 6** said the Explorer sheets show "the Outline and Timeline headers"; the measured sheets show the Outline header only.
- **The gate README.** The "Choices the author may overrule" slot now carries Parts A and B's ten entries (the 14×12 folder, the open-folder flap, the filled tab on badged folders with the hollow alternative, the drawn 1-unit knockout, the `src` spine slot, the gem's crown accent and 13-unit height, the snake, the 3×3 key bows, the contract, the seal colour), each with one recommendation. The gem-language decision now names the crown accent, the js and tsx sketches and the bar-chart risk for gate 6; the F9 recommendation says that no icon colour can fix it and that any selection-colour change is a separate color-theme decision; the F9 count is 12.
- **Header.** Written from the parts' notes: one session name `spellbound-gate5`, snapshots in `review-out/g5/`, no commits before the author approves gate 5, the privacy and extract-icon-ids rules, the `npm test` change, the five Review Focus items chosen across the parts, the resolved decisions F1-F9, D8-D11, G32, G34 and G39, and one staging table.


An adversarial review then applied Tasks 1-15 again on its own worktree of `538035f` (every Expected reproduced but one; its trees equalled the integration run's once two inserts whose trailing blank line the plan left ambiguous were pasted the same way) and ran mutants against the tests: 0 critical, 3 important and 11 minor findings. All were applied, and Tasks 1-15 were re-applied on a fresh integration worktree with every count re-measured (`npm test` +1 from Task 6, +3 from Task 8; final 492):

- **The keyring's short key was off the pixel grid (important).** Its bow `disc(5.5, 8, 1.5)` had an odd diameter on a whole-number y centre, against section 4, so its top and bottom rows were half covered at 16px, and the test pinned that box. Key A now hangs one unit to the left (shaft x4-5, tooth x2-4) and its bow is `disc(4.5, 7.5, 1.5)`: both bows cover whole pixels, each keeps 0.31 units of ring band to the hole, the keys stay 2.39 apart (Task 12: drawing, comment, construction text, test bounds, bow boxes and probes, the expected source). Judged on the file-icon sheet at 16px, 1× and 2×, on the four side bars and in grayscale against the 32× reference: the bows are crisp; at 1× bow A meets the ring's lower-left curve in one lump while the hole stays open, at 2× it is a distinct disc. It reads; no further change.
- **Spec 8 and F9 requirements no test pinned (important).** Five mutants survived: F9 skipping a quick-input focus of its own, F9 checking one theme per set, the map dropping its `-open`-twin and default-slot checks, and the stage dropping a source's grid warning. Three tests were added test-first in their owning tasks: `the map refuses an unknown default slot, and an -open drawing without its closed twin` (Task 6), `F9 checks a quick-input focus of its own, and the dark set against every dark color theme` and `file-icons:pipeline passes a source's grid warning on as a warning, never an error` (Task 8). All five mutants now fail one test each (checked on the integration worktree).
- **Section-4 accent exceptions the README never put to the author (important).** The parchment fold and the folder tab (inherited from the product glyphs, G39), the snake's head and the key bows touch their outline, and the keyring's accent is two discs. The README gains a decision, "accents that touch their outline (section 4 exceptions)", with the recommendation to accept the four as named exceptions under one rule (an accent that is part of the silhouette may touch its outline; one that sits on the object keeps the unit); the house-construction finding names them, and Global Constraints tells gate 6 not to add another before the ruling. The keyring comment says it; the snake's comment already describes the head meeting the band, so it is unchanged.
- **Minor.** Task 7 Step 1 grepped `ℹ` lines from the TAP reporter (now `#` lines). Tasks 10-13 now say to add the comma after the previous map entry. The README's knockout entry and Task 16 Step 3 now ask the author to judge `folder-src-open` at 100% (the knockout leaves only the flap's left side and a stub), and Step 3 asks for the snake's reading at 100%. The Release plan carries spec 6's logo-rule README statement. The sheet's reference label says "16px icon (16 device pixels at 1×, 32 at 2×)" (Task 5, the header). `themeBackdrops` composites the quick-input focus over `quickInput.background` (every focus colour is opaque today, so no number changed). Review Focus 1 says the stage's wiring into `npm run validate` is checked by Task 8 Step 3, not by a test, as for every earlier stage. The README lists the quick-open caret's blink as a staging artifact and the gate 1-3 jobs as not re-run with the park point (the reviewer's alternative, a gate-2 `--scales=2` dry run, was not taken: the risk is disclosed and F5 defers those jobs). Tasks 6 and 8 now say their inserted blocks end with a blank line, which the trees keep, so a verbatim paste gives the plan's trees. No minor finding was declined.

## Self-review notes

- **Spec 6 (file icons).** The palette table, three sets and 3:1 on the side bars: Task 1 (literal palette, contrast test), Task 8 (3:1 on every resolved colour, enforced). Categories as roles, muted folder bodies, badges in their contents' category: Tasks 1, 2, 3, 9. Assets each theme's blue (F8): Task 1. Production with role placeholders: Tasks 2, 4, 6. Logo rule: Task 11 (one snake, one band, one head). `showLanguageModeIcons: false`: Tasks 6, 8. The `languageIds` block kept (D11): Task 6 (`REQUIRED_LANGUAGE_IDS`), Tasks 10-12 map four of its keys. Fallback to the default parchment and folder: Tasks 4, 6 (one drawing per default slot). The 16px rules: badge box and knockout, Task 3; look-alikes by silhouette, Tasks 9, 10, 13. The rows of the tables beyond the sample are gate 6.
- **Spec 6.1.** (1) drawings as code with role tokens: Tasks 2, 4, 9-13; (2) `draw:file-icons` and the drift test: Task 4; (3) the palette module: Task 1; (4) the map with categories, keys and `-open` twins: Task 6; (5) `build:file-icons` and `npm run build`: Task 6; (6) the VSIX ships the resolved sets, not `file-src`: Task 7; (7) the 1.2.1 icons deleted, `languageIds` kept: Task 6.
- **Spec 6.2.** Section 4 in full and the closed palette: Task 2 (`fileGlyphProblems`), the drawing tests of Tasks 3, 4, 9-13. One outline plus one accent: every drawing test names its parts and roles; the four accents that touch their outline (fold, tab, snake head, key bows) go to the author as a section-4 decision (Task 16). Keylines and the badge box: bounds tests per drawing (the gem's 13 rows are a listed choice). Look-alikes: Tasks 9, 10, 13. The 32× reference: Task 5. Grayscale: the sheet (Task 5) and the contact sheets (Task 14). The sample table: parchment and folders Tasks 3-4, `src` Task 9, ts Task 10, py Task 11, json Task 12, LICENSE Task 13.
- **Spec 6.3.** The `workspace` field, the session closed, the focused-row waits, the grayscale column: Task 14; the file-icon sheet at 1× and 2× with its grayscale copy: Task 5 and the header procedure; the fixture, the gate-5 job and its six scenes: Task 15; the README asking for the house construction, each drawing and F9: Task 16.
- **Spec 8.** `file-icons:pipeline`: role tokens only, viewBox and size, no `text`/`image`/`use`/opacity/gradient (Task 2), resolved sets equal a fresh build, 3:1, `showLanguageModeIcons` (Task 8), enforced from Task 8; `file-icons` stays pending (Task 8's test). The F9 soft warning on the list selection and on a quick-input focus of its own, the dark set against both Moonlit Candle and Moonlit: Task 8, each pinned by a test.
- **Spec 11.5.** F1 (no release work), F2 (gate 5 = pipeline and sample), F3 (Tasks 1-8), F4 (Tasks 5, 14-16), F5 (Tasks 14, 15; the rest named as deferred in the README), F6 and F7 (Tasks 1-4, 9-13), F8 (Task 1), F9 (Tasks 5, 8, 15, 16).
- **Placeholder scan.** The only angle-bracket fields are the run-dependent ones of Task 16's README template and the `<run>` id of the dry-run commands, as in the gate-4 plan. No TODO or TBD. No user name, user directory or email.
- **Names used across tasks.** `ROLES`, `PALETTE`, `SETS`, `SET_DIRS`, `resolveSource` (Task 1); `painted`, `fileIconDocument`, `fileGlyphProblems` (Task 2); `folderBody`, `BADGE_BOX` (Task 3, used in Tasks 4 and 9); `fileGlyphModules` (Task 4, `[defaults, folders, code, data, docs]` after Task 13); `coverage`, `THEME_SETS`, `themeBackdrops`, `fileIconSheet` (Task 5, used in Task 8); `KEY_PROPERTIES`, `DEFAULT_SLOTS`, `readFileIconInputs`, `mapProblems`, `buildFileIconTheme`, `REQUIRED_LANGUAGE_IDS` (Task 6); `checkFileIconPipeline`, `checkSelectionContrast` (Task 8); `WAITS`, `resolveWaits`, `workspaceOf`, `prepareWorkspace`, `DEFAULT_WORKSPACE`, `PARK_POINT` (Task 14); `GATE_5`, `GATE_5_SAMPLE`, `PINNED_AFTER_GATE_4_RUN` (Task 15); drawing names `parchment`, `folder`, `folder-open`, `folder-src`, `folder-src-open`, `gem-cut`, `snake`, `keyring`, `contract`; stage `file-icons:pipeline`; session `spellbound-gate5`. All of them were exercised by the end-to-end application (every suite passes).
- **Checked while writing.** Every code block and command of Tasks 1-15 was applied verbatim, in order, on a fresh worktree of `538035f` (without `../witchyterm`, so `ℹ skipped 1` there), after the adversarial review's findings were applied; every expected output above was measured there: test totals and failing TAP lines, the sources byte for byte, the built theme, the validate and F9 lines, the build lines, the sheet sizes, the fixture counts. The trees after Tasks 1-4 equal the first integration run's; the later ones differ by the review's changes only. The review's five surviving mutants (S1-S5) were re-run against the new tests and each fails one. The file-icon sheet was rendered at 1× and 2× in Tasks 5 and 9-13 and judged (every drawing reads on the four side bars and in grayscale; browser and reference agree; the redrawn keyring's bows cover whole pixels). Task 14's gate-4 dry run (run 2026-10-11T04-58-48: 136 captures, 0 warnings) and Task 15's gate-5 dry run (run 2026-10-11T05-04-47: 96 captures, 0 warnings, sheet sizes as written) ran through `run-gate.mjs`; every sheet of both, the two manifests and the four file-icon sheet PNGs pass the privacy scan, and every gate-5 sheet was opened. Task 16's guard against a dry-run manifest was checked on a gate-5 dry run (it prints the STOP line), the job parses (`--scales=3` stops with the usage), and Task 16 Step 1's preconditions were measured (492 tests, the 12 F9 lines, `0`).
- **Not checked while writing.** Task 16's full gate run and its README (the gate-5 job at 100% and 200% is exactly the dry run's scope, so only the `dryRun` flag differs); the real repo with `../witchyterm` (its one extra test passes there, as at gate 4).

## Execution

Recommended: **subagent-driven** (superpowers:subagent-driven-development), as for gates 3 and 4. The drawing tasks hand exact geometry and names to one another (the folder construction, the module list, the map the later tasks extend, the F9 lines), and a fresh reviewer per task who runs the file-icon sheet procedure and judges every drawing at 16px against the reference, and for Tasks 14-16 opens every gate sheet, catches what the tests cannot (a drawing that fails at 16px, a scene that frames the wrong state). Tasks 14 and 15 launch VS Code only through the harness for their dry runs; Task 16's run takes about 4 minutes and is run once, after a clean Task 15 dry run.
