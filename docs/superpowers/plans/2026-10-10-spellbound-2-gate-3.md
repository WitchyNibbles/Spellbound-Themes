# Spellbound Themes 2.0, Gate 2 to Review Gate 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the repo from the approved review gate 2 to review gate 3: fix the defects the gate-2 reviews deferred (clearance measure, knockout vertices, gate harness arguments, terminal profile, icon-sheet capacity, Windows test portability, privacy), draw the `panel` batch (9 IDs) and the `debug` batch (23 IDs), enforce both batch stages, and produce the gate-3 screenshot evidence in real VS Code 1.141. Then stop for the author.

**Architecture:** The drawing pipeline is unchanged: drawings are code in `scripts/glyphs/`, `npm run draw:glyphs` writes the SVGs, `scripts/claim-drawing.mjs` maps IDs to a drawing and codepoint, and `npm run build:product-icons` builds the WOFF and the theme. Two new modules, `scripts/glyphs/panel.mjs` and `scripts/glyphs/debug.mjs`, join `glyphModules`. `scripts/lib/svg-geometry.mjs` gains `outlineGap`, the one clearance measure every glyph test uses from now on. The gate harness gets a fail-fast argument parser, a paged icon sheet, a profile-free PowerShell terminal, a privacy scan of every committed sheet, per-scene settings, a pointer step, and gate-3 scenes for the panel title icons, every breakpoint state, a stopped debug session, the debug toolbar and the Testing view.

**Tech Stack:** Node 24 (ES modules, `node:test`), svgicons2svgfont 15.0.1, svg2ttf 6.1.0, ttf2woff 3.0.0, fontkit 2.0.4, svg-pathdata 7.2.0, @vscode/vsce 3.x, agent-browser 0.38.1 (glyph sheets, contact sheets), Python 3 with Pillow and tesseract (privacy scan OCR), VS Code 1.141.0 for Windows (gate captures), Windows PowerShell 5.1 (terminal decorations at the gate), js-debug (the built-in Node debugger, for the debug scenes).

**Spec:** `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`, especially section 4 (glyph rules, with the gate-2 exceptions), 5.2 ("Panel and views", "Debug and testing", the breakpoint-footprint and paused-on-breakpoint paragraphs), 7 (glossary), 8, 11 (D3, D4, D6), 11.1 (G1) and 11.2 (gate-2 decisions G9-G17). Previous plans: `docs/superpowers/plans/2026-10-10-spellbound-2-phase-1.md` (conventions, harness) and `docs/superpowers/plans/2026-10-10-spellbound-2-gate-2.md` (glyph-task format, gate run). Gate-2 evidence and approval: `docs/qa/2.0-gate-2/README.md`. Executors read the spec alongside this plan; section numbers below refer to the spec.

## Global Constraints

Kept from the earlier plans (still valid):

- `engines.vscode` stays `^1.100.0`. The package stays declarative: no `main`, no activation events. The review helper extension in `review/` is never referenced from the root `package.json` and is excluded from the VSIX.
- Font ID `witchynibbles-product-icons`, family `WitchyNibbles Product Icons`, file `icons/witchynibbles-product-icons.woff`, theme `src` path `./witchynibbles-product-icons.woff`.
- Glyph sources: `viewBox="0 0 16 16"`, no `width`/`height`, only `<svg>` and `<path>` elements, filled paths only, no `stroke`, no `transform`, no `fill-rule="evenodd"`, every inner subpath wound opposite to its container. Font scale: 64 font units per grid unit (`fontHeight: 1024`), no `centerHorizontally`/`centerVertically`.
- The witchyterm scheme is pinned in this repo (`src/witchyterm-moonlit-candle.scheme.json`); `../witchyterm` is never modified.
- Never kill VS Code by image name (`taskkill /IM Code.exe` would close the author's own editor). Review instances run with their own `--user-data-dir` and `--extensions-dir` and are closed by PID or CDP only.
- The VS Code 1.141 install is found at run time, never written down: `defaultBundle()` in `scripts/extract-icon-ids.mjs` (or `VSCODE_WORKBENCH_JS`), and `%LOCALAPPDATA%\Programs\Microsoft VS Code` in `run-gate.mjs`. The stock Codicon font is `<install>/2a59476c9b/resources/app/out/media/codicon.ttf`.

Gate 3:

- Version stays `1.2.1` and `galleryBanner.color` stays `#110d24`; the `release` stage stays pending.
- **No commits until the author approves gate 3.** The one exception is the author's own commit of this plan, before Task 1 (see Before Task 1). Work stays on the checked-out `spellbound-2.0` branch, with no new branches or worktrees. Each task ends with a tree snapshot, `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_N` (N is the task number; the `g3/` folder keeps gate 2's `review-out/TREE_N` files intact; `review-out/` is git-ignored), and the next task's changes are `git add -A && git diff --cached $(cat review-out/g3/TREE_N)`. The tree is dirty throughout and the gate manifest records `repoDirty: true`. When the author commits, messages end with the attribution line the session provides, and the author identity is the repo-local `user.name`/`user.email`.
- Privacy: no Windows or WSL user name, user directory, or account email is ever written into a tracked file, a plan, a commit message or a committed screenshot. Docs write `<user>`. Every committed sheet passes `node scripts/review/privacy-scan.mjs` (Task 3) and a look by the executor before it is staged.
- Codepoints: existing drawings keep theirs. Panel drawings take `E130`-`E135`, debug drawings `E136`-`E147`, both contiguous. A codepoint is never reused within a release (retired ones are listed in the map).
- Modules: `scripts/glyphs/panel.mjs` and `scripts/glyphs/debug.mjs`, each exporting `drawings` and `variants` like `chrome.mjs`; `scripts/glyphs/index.mjs` ends as `export const glyphModules = [batch1, chrome, status, panel, debug];`. No gate variant is drawn in this plan (`icons/product-src-variants/` stays absent), so `run-gate.mjs` skips the variants pass.
- Pinned keys stay **170** (132 core + 38 extras). `gutter-lightbulb-sparkle-filled` joins the editor batch at gate 4 (G11), not here. Keys this plan proposes but does not pin (`debug-disconnect`, `debug-breakpoint-log-unverified`) go to the author in the gate README. Batch `panel` has 9 IDs, `debug` 23.
- Validation stages: Task 5 appends `product-batch:panel` and Task 9 appends `product-batch:debug` to `scripts/validation-stage.json`, each only once every ID of its batch is mapped.
- Drawings follow section 4 as amended at gate 2: keylines; breakpoint glyphs on the Codicon footprint 4-12 about (8,8) (the log diamond may span 3-13); whole-number edges for horizontal and vertical strokes; odd-width central features on pixel column 7 (x 7-8); accents ≥3×3 (dot) or ≥4×4 (shape); one full unit between an accent and a stroke, measured with `outlineGap` (Task 1) on the outlines before any `knockOut`; cut-outs ≥2 units except straight slots ≥4 long and the documented exceptions; no gap or sliver under 1 unit; the only off-grid points stay those of `gear`, `sync-arrows` and `cat-slash` (G16).
- `node scripts/validate.mjs` writes its `✗` lines to stderr. Every command that pipes validate output into `grep` uses `2>&1`.
- agent-browser: every command block starts with `export AGENT_BROWSER_SESSION=spellbound-gate3`, every screenshot path is absolute (`"$PWD/…"`), and the block ends with `agent-browser close`. `review-out/` is git-ignored, so pages and PNGs written there never enter a snapshot.
- `run-gate.mjs` (after Task 3) rejects unknown options with exit code 2 and prints its usage with `--help`; dry runs use `--scales` and `--scenes`. Before Task 3, never pass it an argument you have not checked: any unknown argument starts a full gate-1 run.
- Test totals below were measured by applying this plan's tasks in order to a scratch worktree of HEAD (`eb3794d` plus the commit of this plan). They are the real-repo values: in a worktree without the `../witchyterm` sibling, `test/witchyterm-pin.test.mjs` skips its one test, so `ℹ pass` is one lower there and `ℹ skipped 1` appears. In a git worktree `node_modules` is a symlink that `git status` lists and `git add -A` stages; unstage it (`git reset -q node_modules`) before `git write-tree` there. In the real repo none of this applies.

### Glyph sheet procedure (used by every drawing task)

```bash
export AGENT_BROWSER_SESSION=spellbound-gate3
npm run glyph-sheet
agent-browser set viewport 1800 1400 1
agent-browser open "file://$PWD/review-out/glyph-sheet/index.html"
agent-browser screenshot --full "$PWD/review-out/glyph-sheet/sheet@1x.png"
agent-browser set viewport 1800 1400 2
agent-browser open "file://$PWD/review-out/glyph-sheet/index.html"
agent-browser screenshot --full "$PWD/review-out/glyph-sheet/sheet@2x.png"
agent-browser close
```

Expected: both PNGs exist and every drawing renders from the built font (no empty boxes). Open them with the Read tool; crop and upscale with nearest-neighbour scaling (PIL) when a 16px glyph is too small to judge in the full sheet. A drawing that passes its tests but does not read at 16px is redrawn before the task ends (gate-2 lesson: reviewers who rendered the glyphs caught what code review missed).

## Review Focus

The five ways this work is most likely to fail a user, none of which the gate-2 tests exercise, and the test that now pins each:

1. **The paused line shows the wrong mark.** When the debugger stops on a line with a breakpoint, VS Code draws the stack-frame glyph with `debug-stackframe-dot` laid over it by a CSS `::after` in the same centred box. If the frame's clear area and the dot do not coincide, the user sees a dot sitting on the arrow's stroke, or the moon alone. Expected: the dot lands exactly in the frame's empty middle, and `debug-stackframe-focused` is the same frame with the same dot. Pinned by `debug-stackframe-dot is a 4x4 moon dot at 6-10, and the focused frame holds exactly that dot` and `the stack frame keeps the overlay area clear by 1 unit and fills its tip` (Task 7), and by the gate's `debug-stopped` scene, which waits for an element carrying both the breakpoint and the stack-frame classes (Task 10).
2. **A breakpoint mark jumps or becomes ambiguous when its state changes.** Breakpoints switch between plain, disabled, conditional, log and unverified while the user works; a glyph off the shared footprint moves in the gutter, and two states drawn alike lose information that VS Code only shows through the icon. Expected: every state on the 4-12 footprint (log on 3-13), disabled and unverified distinguishable at 16px, and the moons following the live moon breakpoint. Pinned by `every breakpoint glyph sits on the Codicon footprint, 4-12 about (8,8); the log diamond on 3-13`, `unverified and disabled differ where it shows: the dashed ring has gaps where the ring is solid` and `the moons are built from the live moon breakpoint, not from a copy of its numbers` (Task 6), and by the `breakpoints` scene, which brings every drawn state on screen at every scale (Task 10).
3. **A panel or debug glyph never reaches the screen, so a broken drawing ships unseen.** In 1.141 the Output, Debug Console and Problems tab icons show only with `workbench.panel.showLabels: false`, `terminal-kill` only in the terminal picker, Stop only as the Call Stack session action or the toolbar's Alt alternative, and the unverified breakpoint only in the Breakpoints view. Expected: the gate reaches each surface, waits for each ID on screen (not merely in the DOM), and documents the IDs 1.141 never draws. Pinned by `gate 3 waits, without an optional step, for every panel and debug ID, or names why it cannot` (Task 10), whose `NOT_IN_CONTEXT` list names the IDs 1.141 never draws.
4. **A committed screenshot leaks a user name.** The Debug Console prints the launch command with the Windows user directory, a Call Stack tooltip shows an absolute path, and a PowerShell profile can print anything. Expected: no committed sheet, manifest or README contains a user name, user directory or email, and the check fails closed when it cannot run. Pinned by the privacy-scan tests (Task 3: a planted path, a spaced OCR path, missing OCR, unresolvable user name) and by `every scene that moves the pointer parks it on the status bar and waits for tooltips to close before the next scene` (Task 10), and run on every committed sheet in Task 11.
5. **A clearance test that passes while shapes collide.** The gate-2 clearance helper measured endpoint distances only: two crossing bars measured 4 units apart, and an accent dropped inside a stroke measured the distance to the far edge. Expected: 0 wherever outlines cross, touch or one solid lies inside the other's ink. Pinned by the `outlineGap` tests (Task 1), which every clearance test in Tasks 4-9 then uses.

## Resolved decisions

The decisions this plan applies or must respect, and what it does for each.

| # | Decision | Tasks | What this plan does |
| :- | :- | :- | :- |
| G1 | Moon breakpoint: plain disc | Task 6 | `debug-hint` is claimed onto the existing `moon-breakpoint` (E116); the other moons are built from the live moon breakpoint. |
| D3 | Moonlit Candle stackframes: current gold, other lavender | none | Colours are already in the themes; Task 7 keeps the frame glyph an outline with a filled tip, so both colours read. |
| D4 | `debug-hint` reuses the breakpoint; unverified is a dashed ring; `-conditional-disabled`, `-log-disabled`, `-conditional-unverified` reuse existing drawings; "the author may overrule it at the debug gate" | Tasks 6, 11 | Task 6 draws the moon outline, dashed ring, `=` moon and diamond and claims the reused IDs onto them. Task 11's README asks the author to keep the pairing or draw hollow disabled forms. |
| G11 | `gutter-lightbulb-sparkle-filled` joins the editor batch at gate 4 | none | Not pinned here; the key count stays 170. |
| G12 | Witch hat stays solid (exception to the one-accent rule) | Task 11 | The quill's solid vane asks for the same exception; the README asks the author. |
| G13 | Status readings approved; `terminal-decoration-error` ✕ is a 1.41 cut-out | Task 9 | The passed-test check is cut 2.12 across, so it needs no new exception. |
| G16 | Off-grid points only in `gear`, `sync-arrows`, `cat-slash` | Tasks 5, 9 | The across-modules grid test stays unchanged; panel and debug drawings add no off-grid point. |
| Gate-2 ledger | Deferred to gate 3: clearance helper misses crossing edges; `clipHalfPlane` duplicate points; icon-sheet view off-screen at 200%; `run-gate.mjs` ignores unknown args; terminal prompt depends on the author's PowerShell profile; `package-contents` test fails on native Windows Node | Tasks 1, 2, 3 | Task 1 adds `outlineGap`; Task 2 fixes `clipHalfPlane`; Task 3 fixes the harness items and adds the privacy scan. |

## File structure

Created:

- `scripts/glyphs/panel.mjs` (Tasks 4, 5), `scripts/glyphs/debug.mjs` (Tasks 6-9): glyph modules.
- `scripts/review/args.mjs`, `scripts/review/privacy-scan.mjs` (Task 3).
- `test/panel-glyphs.test.mjs` (Task 4), `test/debug-glyphs.test.mjs` (Task 6), `test/review-args.test.mjs`, `test/privacy-scan.test.mjs` (Task 3).
- `icons/product-src/*.svg` for the 24 new drawings (generated).
- `review/jobs/gate-3.json`, `review/helper-extension/breakpoints.json`, `review/workspace/unbrewed.js`, `review/workspace/brews.spec.js` (Task 10).
- `docs/qa/2.0-gate-3/` (Task 11): README, manifest and 20 contact sheets.

Modified:

- `scripts/lib/svg-geometry.mjs` (`outlineGap`, Task 1), `scripts/glyphs/primitives.mjs` (`clipHalfPlane`, Task 2), `scripts/glyphs/batch-1.mjs` (`parts.flame`, Task 4), `scripts/glyphs/index.mjs`, `scripts/validation-stage.json`.
- `icons/product-icon-map.json`, `icons/product-icon-theme.json`, `icons/witchynibbles-product-icons.woff` (regenerated in every drawing task).
- `test/svg-geometry.test.mjs`, `test/status-glyphs.test.mjs`, `test/glyph-primitives.test.mjs`, `test/glyph-parts.test.mjs`, `test/product-icon-theme.test.mjs`, `test/review-harness.test.mjs`, `test/package-contents.test.mjs`.
- `scripts/review/run-gate.mjs`, `scripts/review/capture.mjs`, `review/helper-extension/{extension.js,package.json,README.md}`, `review/profile/{keybindings.json,settings.base.json}`, `review/jobs/gate-2.json` (terminal scene focus), `review/workspace/debug-target.js` (Tasks 3, 10).
- `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (section 5.2, Task 9).

Not committed (git-ignored): `review-out/g3-panel/make.mjs` (Task 4, reused in Task 5), the debug comparison pages (Tasks 6-9), snapshots in `review-out/g3/`, sheets and dry runs under `review-out/`.

## Staging: how each batch counts down

Unmapped IDs per batch, from `node scripts/validate.mjs --only product-batch:<batch> 2>&1 | grep -c 'does not map'`, and the map size from `npm run build:product-icons`:

| After | `panel` | `debug` | Drawings / IDs in the map | Stages enforced |
| :- | :- | :- | :- | :- |
| HEAD | 9 | 23 | 47 / 90 | base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status |
| Tasks 1-3 | 9 | 23 | 47 / 90 | same |
| Task 4 | 7 | 23 | 49 / 92 | same |
| Task 5 | 0 | 23 | 53 / 99 | + product-batch:panel |
| Task 6 | 0 | 15 | 57 / 107 | same |
| Task 7 | 0 | 9 | 63 / 113 | same |
| Task 8 | 0 | 1 | 70 / 121 | same |
| Task 9 | 0 | 0 | 71 / 122 | + product-batch:debug |

The `editor` (33) and `symbols` (15) batches, `file-icons` and `release` stay pending throughout. At 53 drawings and above the icon sheet has two pages (Task 3), which the gate-3 job expects.

## Codepoints for the new drawings

| Codepoint | Drawing | Task | IDs |
| :- | :- | :- | :- |
| E130 | `quill` | 4 | output-view-icon |
| E131 | `console-spider` | 4 | debug-console-view-icon |
| E132 | `broom` | 5 | clear-all, notifications-clear-all |
| E133 | `funnel` | 5 | filter |
| E134 | `bin` | 5 | trash, terminal-kill |
| E135 | `expand-corners` | 5 | panel-maximize |
| E136 | `moon-outline` | 6 | debug-breakpoint-disabled |
| E137 | `dashed-ring` | 6 | debug-breakpoint-unverified, debug-breakpoint-conditional-unverified |
| E138 | `moon-equals` | 6 | debug-breakpoint-conditional, debug-breakpoint-conditional-disabled |
| E139 | `diamond` | 6 | debug-breakpoint-log, debug-breakpoint-log-disabled |
| E13A | `stackframe-arrow` | 7 | debug-stackframe |
| E13B | `stackframe-moon` | 7 | debug-stackframe-focused |
| E13C | `moon-dot` | 7 | debug-stackframe-dot |
| E13D | `step-over` | 7 | debug-step-over |
| E13E | `step-into` | 7 | debug-step-into |
| E13F | `step-out` | 7 | debug-step-out |
| E140 | `play-filled` | 8 | debug-start |
| E141 | `play-outline` | 8 | run, testing-run-icon |
| E142 | `play-stacked` | 8 | testing-run-all-icon |
| E143 | `continue` | 8 | debug-continue |
| E144 | `pause` | 8 | debug-pause |
| E145 | `stop-square` | 8 | debug-stop |
| E146 | `restart` | 8 | debug-restart |
| E147 | `check-disc` | 9 | testing-passed-icon |

Existing drawings that gain IDs: `warning-triangle` (E120) takes `markers-view-icon` (Task 5, spec 5.2 "uses `warning`"); `moon-breakpoint` (E116) takes `debug-hint` (Task 6, G1/D4). No existing drawing changes shape; `parts.flame` is extracted from the candle byte-identically (Task 4).

---

## Before Task 1

The author commits this plan on `spellbound-2.0` before Task 1 starts. Executors do not make that commit. Check it:

Run: `git status --short | wc -l && git log -1 --format=%s -- docs/superpowers/plans/2026-10-10-spellbound-2-gate-3.md`
Expected: `0`, then the subject of the author's commit. If the first line is not `0`, stop and ask the author: an uncommitted plan would end up in Task 1's snapshot.

Then check the tools the plan needs: `node --version` (v24), `agent-browser --version` (0.38.1), `python3 -c "import PIL"` and `tesseract --version` (the privacy scan in Task 3 fails closed without them), and that `node -e "import('./scripts/extract-icon-ids.mjs').then(m => console.log(m.defaultBundle() ? 'bundle found' : 'no bundle'))"` prints `bundle found`.

---

## Part A: deferred gate-2 geometry items

The final gate-2 review deferred two geometry defects to gate 3 (SDD ledger, gate 2, "Final review"):

1. The clearance helper `gap` in `test/status-glyphs.test.mjs` measures endpoint-to-segment distances only. Two outlines whose long edges cross, with every endpoint far from the other outline, report a positive clearance: a plus made of two 10×1 bars reports 4. A solid lying wholly inside another solid (an accent dropped into a stroke) reports the distance to the outer edge. Every one-unit clearance test of the status batch, and the panel tests in Part B, depend on this measure.
2. `clipHalfPlane` in `scripts/glyphs/primitives.mjs` (used by `knockOut`) inserts an intersection point when an edge ends exactly on the region boundary, so a boundary through a vertex emits that vertex twice (`M2 0L2 0L2 4L2 4L0 2Z` for a diamond cut through its top and bottom vertices). With non-dyadic coefficients the "exact" case comes out as ±5e-17 and still emits a near-duplicate. No current drawing hits it (`cat-slash` cuts no vertex exactly), but the debug batch's knockouts may.

Task 3 fixes the deferred harness items (see its introduction). Task 1 also adds two cheap pins the ledger asked for: which badge each dirty-branch drawing carries, and which drawing each dirty-branch ID maps to (a swap of ✦ and ✓, in `status.mjs` or in the map, passed every gate-2 test).

### Task 1: `outlineGap`, a clearance measure that sees crossing and overlapping outlines

**Files:**
- Modify: `scripts/lib/svg-geometry.mjs` (new export `outlineGap`), `test/svg-geometry.test.mjs`, `test/status-glyphs.test.mjs` (local helper replaced; one new test), `test/product-icon-theme.test.mjs` (one new test)

**Interfaces:**
- Consumes: `subpaths(d)` (polygons as arrays of `[x, y]`), `pointInPolygon`, `signedArea`.
- Produces: `outlineGap(a, b)` in `scripts/lib/svg-geometry.mjs`: `a` and `b` are arrays of polygons (as returned by `subpaths`); returns `0` when any edge of `a` crosses or touches an edge of `b`, or when a solid (clockwise) outline of one has a vertex inside the other's ink (positive nonzero winding); else the smallest endpoint-to-segment distance either way. For nested outlines (a cut-out in a fill, an accent inside a frame's hole) that is the wall between them. Measured against a hole alone (winding -1) nothing counts as ink, so an accent inside a hole measures the wall to the hole's edge. Measure against outlines before `knockOut`: its pieces abut along the cut, so a point on that seam measures 0. Part B and the debug batch measure every clearance with it. `test/status-glyphs.test.mjs` imports it as `gap`, so its existing tests are unchanged.

- [ ] **Step 1: Write the failing test**

In `test/svg-geometry.test.mjs`, change the import line to:

```js
import { filledAt, offGridPoints, outlineGap, parseGlyphSvg, pathBounds, signedArea, subpaths, windingProblems } from '../scripts/lib/svg-geometry.mjs';
```

and append:

```js

test('outlineGap: the shortest distance between separate or nested outlines, 0 where they cross, touch or overlap', () => {
  const square = (x, y, size) => subpaths(`M${x} ${y}h${size}v${size}h-${size}z`);
  assert.equal(outlineGap(square(0, 0, 2), square(5, 0, 2)), 3, 'side by side');
  assert.equal(outlineGap(square(0, 0, 8), subpaths('M3 3v2h2v-2z')), 3, 'nested: the wall around a cut-out');
  assert.equal(outlineGap(square(0, 0, 8), square(3, 3, 2)), 0, 'a solid inside a solid overlaps it');
  assert.equal(outlineGap(subpaths('M0 0h8v8H0zM1 1v6h6V1z'), square(3, 3, 2)), 2, 'an accent inside a frame: the wall to the inner edge');
  // Two long bars crossing as a plus: every corner is 4 units from the other bar, but the edges cross.
  assert.equal(outlineGap(subpaths('M0 4h10v1H0z'), subpaths('M4 0h1v10H4z')), 0, 'crossing');
  assert.equal(outlineGap(square(0, 0, 2), square(2, 1, 2)), 0, 'touching along an edge');
  assert.equal(outlineGap(subpaths('M0 0L4 1L0 2z'), subpaths('M4 0h2v2h-2z')), 0, 'a vertex on the other outline');
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `node --test test/svg-geometry.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|SyntaxError'`
Expected: `SyntaxError: The requested module '../scripts/lib/svg-geometry.mjs' does not provide an export named 'outlineGap'`, then `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1`.

(For the record: the old status-test helper returns `4` for the crossing plus and `3` for the solid inside a solid, measured with a copy of it; the new function must return `0` for both.)

- [ ] **Step 3: Implement `outlineGap`**

In `scripts/lib/svg-geometry.mjs`, insert directly above `export function pointInPolygon`:

```js
const pointToSegment = ([px, py], [[ax, ay], [bx, by]]) => {
  const [dx, dy] = [bx - ax, by - ay];
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const orientation = (o, a, b) => Math.sign((a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]));
// True when two segments cross or touch. Collinear touching is caught by outlineGap's endpoint distances, which are 0.
const segmentsCross = ([p, q], [r, s]) => orientation(p, q, r) * orientation(p, q, s) < 0 && orientation(r, s, p) * orientation(r, s, q) < 0;
const segmentsOf = (polygons) => polygons.flatMap((poly) => poly.map((point, index) => [point, poly[(index + 1) % poly.length]]));
// Positive winding at a point: inside the polygons' ink. Measured against a hole alone (winding -1), nothing is ink.
const inked = (polygons, point) => polygons.reduce((sum, poly) => sum + (pointInPolygon(point, poly) ? Math.sign(signedArea(poly)) : 0), 0) > 0;
// A solid outline of p (clockwise) with a vertex inside q's ink overlaps q.
const overlaps = (p, q) => p.some((poly) => signedArea(poly) > 0 && poly.some((point) => inked(q, point)));

// Shortest distance between two sets of outlines (polygons from subpaths): 0 where an edge of one crosses or touches an
// edge of the other, or where a solid outline of one lies inside the other's ink; else the smallest endpoint-to-segment
// distance either way. For nested outlines (a cut-out inside a fill, an accent inside a frame's hole) this is the wall
// between them. Section 4's clearances are measured with it. Measure against an outline before knockOut: the pieces
// knockOut returns abut along the cut, so a point on that seam measures 0.
export function outlineGap(a, b) {
  const [edgesA, edgesB] = [segmentsOf(a), segmentsOf(b)];
  if (edgesA.some((edge) => edgesB.some((other) => segmentsCross(edge, other)))) return 0;
  if (overlaps(a, b) || overlaps(b, a)) return 0;
  return Math.min(
    ...edgesA.flatMap(([p, q]) => edgesB.flatMap((edge) => [pointToSegment(p, edge), pointToSegment(q, edge)])),
    ...edgesB.flatMap(([p, q]) => edgesA.flatMap((edge) => [pointToSegment(p, edge), pointToSegment(q, edge)])),
  );
}
```

Run: `node --test test/svg-geometry.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 10`, `ℹ pass 10`, `ℹ fail 0`.

- [ ] **Step 4: Use it in the status tests, and pin each dirty-branch badge**

In `test/status-glyphs.test.mjs`:

1. Change the two import lines to:

```js
import { crescent, polygon, rect, svgDocument } from '../scripts/glyphs/primitives.mjs';
```

```js
import { filledAt, outlineGap as gap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';
```

2. Replace the comment `// Helpers for Tasks 7-10. Clearances are measured on the flattened outlines (curves sampled as in subpaths).` with:

```js
// Helpers for Tasks 7-10. Clearances are measured on the flattened outlines (curves sampled as in subpaths) with
// outlineGap, which is 0 where two outlines cross.
```

3. Delete the local helpers from `const segmentsOf = …` through the end of `const gap = (a, b) => Math.min(…);` (the block just above `// ---- Severity signals (Task 7) ----`), keeping one blank line before that heading.

4. Directly below the heading `// ---- Dirty-branch sprigs (Task 10) ----`, insert:

```js
test('each dirty-branch state carries its own badge: ✦ changes, ✓ staged, ! conflicts', () => {
  assert.equal(drawings['sprig-changes'](), svgDocument(parts.sprigSmall(), parts.star(12.5, 12.5, 2.5, 1)));
  assert.equal(drawings['sprig-staged'](), svgDocument(parts.sprigSmall(), polygon([[10, 12], [11, 11], [12, 12], [14, 10], [15, 11], [12, 14]])));
  assert.equal(drawings['sprig-conflicts'](), svgDocument(parts.sprigSmall(), rect(13, 9, 2, 3), rect(13, 13, 2, 2)));
});

```

Append to `test/product-icon-theme.test.mjs`:

```js

test('each dirty-branch ID maps to its own sprig drawing in the map', () => {
  const drawingOf = (id) => Object.entries(map.drawings).find(([, { ids }]) => ids.includes(id))?.[0];
  assert.deepEqual(['git-branch-changes', 'git-branch-staged-changes', 'git-branch-conflicts'].map(drawingOf),
    ['sprig-changes', 'sprig-staged', 'sprig-conflicts']);
});
```

Both pins pass at once: they record the shipped pairing, so swapping two badges in `status.mjs`, or claiming a dirty-branch ID onto the wrong sprig in the map, now fails a test.

Run:

```bash
node --test test/status-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
node --test test/status-glyphs.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `ℹ tests 15`, `ℹ pass 15`, `ℹ fail 0` (14 before, plus the badge pin; every clearance test still passes, so no gate-2 drawing had crossing or overlapping outlines); then `ℹ tests 21`, `ℹ pass 21`, `ℹ fail 0`; then `ℹ tests 231`, `ℹ fail 0`.

- [ ] **Step 5: Snapshot the tree**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_1`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_1`.

### Task 2: `knockOut` emits no duplicate point when a cut passes through a vertex, even through rounding noise

**Files:**
- Modify: `scripts/glyphs/primitives.mjs` (`clipHalfPlane`), `test/glyph-primitives.test.mjs`

**Interfaces:**
- Consumes: `knockOut(paths, region)`, `polygon` (primitives).
- Produces: the same `knockOut` contract; a region boundary through a vertex now keeps that vertex once, also when the vertex is on the boundary only up to floating-point noise (|side| < 1e-9). Every existing SVG and the WOFF are byte-identical (checked in Step 4).

- [ ] **Step 1: Write the failing test**

Append to `test/glyph-primitives.test.mjs`:

```js

test('knockOut adds no duplicate points when the region boundary passes through a vertex', () => {
  // x >= 2 cuts the diamond through its top and bottom vertices; the kept half is the left triangle, three points.
  const diamond = polygon([[2, 0], [4, 2], [2, 4], [0, 2]]);
  assert.deepEqual(knockOut([diamond], [[1, 0, 2]]), ['M2 0L2 4L0 2Z']);
  // -0.1x >= -0.3 meets the apex (3, 3) up to floating-point noise (about 5e-17); it still counts as on the boundary.
  assert.deepEqual(knockOut([polygon([[0, 0], [6, 0], [3, 3]])], [[-0.1, 0, -0.3]]), ['M3 0L6 0L3 3Z']);
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `node --test test/glyph-primitives.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|actual:|expected:'`
Expected: `ℹ tests 6`, `ℹ pass 5`, `ℹ fail 1`, with `actual: [ 'M2 0L2 0L2 4L2 4L0 2Z' ]` and `expected: [ 'M2 0L2 4L0 2Z' ]`.

- [ ] **Step 3: Intersect only edges whose ends lie strictly on opposite sides, with a 1e-9 boundary tolerance**

In `scripts/glyphs/primitives.mjs`, replace

```js
// Sutherland-Hodgman clip of one closed polygon against the half-plane a*x + b*y >= c. The result keeps the winding.
function clipHalfPlane(points, [a, b, c]) {
  const side = ([x, y]) => a * x + b * y - c;
  const out = [];
  points.forEach((q, index) => {
    const p = points.at(index - 1);
    const [sp, sq] = [side(p), side(q)];
    if ((sp >= 0) !== (sq >= 0)) {
```

with

```js
// Sutherland-Hodgman clip of one closed polygon against the half-plane a*x + b*y >= c. The result keeps the winding.
// An edge gets an intersection point only when its ends lie strictly on opposite sides: a vertex on the boundary is
// kept as itself, so a boundary through a vertex adds no duplicate point.
function clipHalfPlane(points, [a, b, c]) {
  // Values within 1e-9 of the boundary count as on it, so floating-point noise cannot make a near-duplicate point.
  const side = ([x, y]) => {
    const value = a * x + b * y - c;
    return Math.abs(value) < 1e-9 ? 0 : value;
  };
  const out = [];
  points.forEach((q, index) => {
    const p = points.at(index - 1);
    const [sp, sq] = [side(p), side(q)];
    if ((sp > 0 && sq < 0) || (sp < 0 && sq > 0)) {
```

The rest of the function is unchanged. A vertex on the boundary (`side` = 0) is still pushed once by `if (sq >= 0) out.push(q)`. Both changes are needed: with the strict-sign test alone (measured) the second assertion still fails with `actual: [ 'M3 3L3 0L6 0L3 3Z' ]`.

- [ ] **Step 4: Run the tests and prove the output did not change**

```bash
node --test test/glyph-primitives.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
cp icons/witchynibbles-product-icons.woff review-out/before.woff
npm run draw:glyphs
npm run build:product-icons
git status --short icons
cmp icons/witchynibbles-product-icons.woff review-out/before.woff && echo "woff identical"
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `ℹ tests 6`, `ℹ pass 6`, `ℹ fail 0`; `Wrote 47 glyph SVGs`; `Built 47 product icon drawings for 90 icon IDs in icons/witchynibbles-product-icons.woff`; no `git status` line (all 47 SVGs and the theme are byte-identical); `woff identical`; `ℹ tests 232`, `ℹ fail 0`.

- [ ] **Step 5: Snapshot the tree**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_2`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_2`.

---

### Task 3: Harness fixes: safer gate arguments, a profile-free terminal, a paged icon sheet, and a privacy scan

Everything here works on the 47 drawings of `eb3794d` and keeps working at 71: the icon-sheet test computes its pages from `Math.max(71, map size)`. Its outputs were measured after Tasks 1-2.

**Files:**
- Create: `scripts/review/args.mjs`, `scripts/review/privacy-scan.mjs`, `test/review-args.test.mjs`, `test/privacy-scan.test.mjs`
- Modify: `scripts/review/run-gate.mjs` (arguments), `scripts/review/capture.mjs` (shell-integration path), `review/helper-extension/{extension.js,package.json,README.md}` (icon-sheet pages, version 0.0.3), `review/profile/keybindings.json` (two chords), `review/profile/settings.base.json` (PowerShell profile), `review/jobs/gate-2.json` (terminal scene: focus first), `test/review-harness.test.mjs`, `test/package-contents.test.mjs`

**Interfaces:**
- Consumes: nothing from Tasks 1-2.
- Produces:
  - `parseGateArgs(argv) -> { job, skipVariants, help, scales: number[] | null, scenes: string[] | null }`, `filterJob(job, { scales, scenes }) -> job` and `USAGE` (`scripts/review/args.mjs`). `run-gate.mjs` reads and cuts the job before anything else: an unknown option, a stray argument, an empty `--scales=`/`--scenes=` list, an unknown scene, a scale no pass captures or a missing job file stops it with the message, the usage and exit 2, before it builds or launches anything (it used to start a full gate-1 run). `--help` prints the usage; `--scales=1,2` and `--scenes=a,b` cut a dry run down, and the manifest then records `dryRun`.
  - Helper command `spellboundReview.iconSheetPage` and chord `ctrl+alt+shift+F4`: the icon sheet is three views of 17 rows, 51 drawings a page, and each view header reads `page N of M`. Task 10's two icon-sheet scenes rely on both.
  - Chord `ctrl+alt+shift+a` (`workbench.action.focusActiveEditorGroup`), pressed by every PowerShell terminal scene before it opens the terminal.
  - The Spellbound PowerShell profile: `-NoLogo -NoProfile -NoExit -Command "function global:prompt { 'PS workspace> ' }; try { . '{{shellIntegrationPs1}}' } catch {}"`. The `try`/`catch` is what VS Code's own injection uses: under a Restricted execution policy the error would print the script path. `capture.mjs` fills in the install path (`'` doubled for PowerShell's single quotes) and stops if the file is missing.
  - `findPrivateText(text, names) -> string[]`, `normaliseOcr(text)`, `machineUserNames()` and the CLI `node scripts/review/privacy-scan.mjs <file>...`. It reads `.png` with OCR (python3 with Pillow upscales 3×, tesseract reads) and `.json`, `.md`, `.txt` as text. It flags the machine's user names (WSL user, Windows `%USERNAME%`, the `%USERPROFILE%` folder), `C:\Users\…`, `\\wsl.localhost\…\home\…`, `/home/…`, `/Users/…` and email addresses, after joining the spaces OCR puts around `:` and slashes. Exit 0: nothing found. Exit 1: found (it prints the kind, never the text). Exit 2, failing closed: no file, a missing or unsupported file, no Windows user name under WSL, no Pillow or no tesseract. Task 10 and Task 11 run it on every sheet, the manifest and the README before they are committed.

- [ ] **Step 1: Write the failing tests**

Create `test/review-args.test.mjs`:

```js
// run-gate.mjs starts a build, a packaging step and a capture run that takes about 15 minutes per gate, so a typo in its
// arguments must stop it before any of that, and a dry run must be able to cut the job down without editing the file.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { filterJob, parseGateArgs } from '../scripts/review/args.mjs';

const root = path.resolve(import.meta.dirname, '..');
const job = () => ({
  passes: [
    { name: 'main', vsix: ['spellbound-main.vsix'], scales: [1, 1.25, 1.5, 2] },
    { name: 'variants', vsix: ['spellbound-variants.vsix'], scales: [1, 2], scenes: ['debug', 'icon-sheet'] },
  ],
  scenes: [{ name: 'panel' }, { name: 'debug' }, { name: 'icon-sheet' }],
});

test('parseGateArgs reads --job, --skip-variants, --scales and --scenes', () => {
  assert.deepEqual(parseGateArgs([]), { job: 'review/jobs/gate-1.json', skipVariants: false, help: false, scales: null, scenes: null });
  assert.deepEqual(parseGateArgs(['--job', 'review/jobs/gate-3.json', '--skip-variants', '--scales=1,2', '--scenes', 'debug,icon-sheet']),
    { job: 'review/jobs/gate-3.json', skipVariants: true, help: false, scales: [1, 2], scenes: ['debug', 'icon-sheet'] });
  assert.equal(parseGateArgs(['--help']).help, true);
});

test('parseGateArgs rejects unknown options, stray arguments, bad scales and empty lists', () => {
  assert.throws(() => parseGateArgs(['--jobs', 'review/jobs/gate-3.json']), /Unknown option '--jobs'/);
  assert.throws(() => parseGateArgs(['review/jobs/gate-3.json']), /Unexpected argument 'review\/jobs\/gate-3\.json'/);
  assert.throws(() => parseGateArgs(['--scales=1,150%']), /--scales takes numbers such as 1,1.25/);
  // An empty list would drop every pass, and the run would build, package and launch a capture of nothing.
  assert.throws(() => parseGateArgs(['--scales=']), /--scales needs at least one value/);
  assert.throws(() => parseGateArgs(['--scenes', ' , ']), /--scenes needs at least one value/);
});

test('filterJob keeps only the asked scales and scenes, and drops a pass left with nothing to capture', () => {
  const cut = filterJob(job(), { scales: [1], scenes: ['panel', 'debug'] });
  assert.deepEqual(cut.passes, [
    { name: 'main', vsix: ['spellbound-main.vsix'], scales: [1], scenes: ['panel', 'debug'] },
    { name: 'variants', vsix: ['spellbound-variants.vsix'], scales: [1], scenes: ['debug'] },
  ]);
  assert.deepEqual(filterJob(job(), { scales: [1.5], scenes: null }).passes.map((pass) => pass.name), ['main']);
  assert.deepEqual(filterJob(job(), { scales: null, scenes: ['panel'] }).passes.map((pass) => pass.name), ['main']);
  assert.deepEqual(filterJob(job(), { scales: null, scenes: null }), job());
  assert.throws(() => filterJob(job(), { scales: null, scenes: ['panels'] }), /Unknown scene 'panels'/);
  assert.throws(() => filterJob(job(), { scales: [3], scenes: null }), /No pass captures at scale 3/);
});

test('run-gate.mjs stops on an unknown option before it builds or launches anything, and prints usage for --help', () => {
  const run = (...args) => spawnSync(process.execPath, ['scripts/review/run-gate.mjs', ...args], { cwd: root, encoding: 'utf8', timeout: 10000 });
  const bad = run('--jobs', 'review/jobs/gate-3.json');
  assert.equal(bad.status, 2, bad.stderr);
  assert.match(bad.stderr, /Unknown option '--jobs'/);
  assert.match(bad.stderr, /^Usage: node scripts\/review\/run-gate\.mjs/m);
  const help = run('--help');
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /^Usage: node scripts\/review\/run-gate\.mjs/m);
  // The job is read and cut down before anything runs, so a typo in a scene name or a job path also stops at once.
  for (const [args, message] of [[['--job', 'review/jobs/gate-2.json', '--scenes=terminl'], /Unknown scene 'terminl'/],
    [['--job', 'review/jobs/gate-2.json', '--scales=3'], /No pass captures at scale 3/], [['--job', 'review/jobs/gate-9.json'], /ENOENT/]]) {
    const result = run(...args);
    assert.equal(result.status, 2, args.join(' '));
    assert.match(result.stderr, message);
    assert.match(result.stderr, /^Usage: /m);
  }
});
```

Create `test/privacy-scan.test.mjs`:

```js
// Gate evidence goes to a public repository. The Debug Console prints the launch command with the Windows user directory,
// and a shell prompt or an `ll` listing prints user names, so every sheet and text file is scanned before it is
// committed, and a scan that cannot run must fail rather than pass.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findPrivateText, normaliseOcr } from '../scripts/review/privacy-scan.mjs';

const root = path.resolve(import.meta.dirname, '..');
const sheet = path.join(root, 'docs', 'qa', '2.0-gate-2', 'main-terminal-panel.png');
const scan = (files, env = {}) => spawnSync(process.execPath, ['scripts/review/privacy-scan.mjs', ...files],
  { cwd: root, encoding: 'utf8', env: { ...process.env, ...env }, timeout: 120000 });

test('findPrivateText flags the machine user names and any user directory, whatever the case or slash', () => {
  const names = ['wanda', 'morgana'];
  assert.deepEqual(findPrivateText('Problems 3  Output  Debug Console', names), []);
  assert.deepEqual(findPrivateText('"C:\\Users\\Wanda\\AppData\\Local\\Temp\\x\\code-node.cmd"', names),
    ['user name "wanda"', 'user directory "C:\\Users\\Wanda"']);
  assert.deepEqual(findPrivateText('drwxr-xr-x - morgana 10 Oct', names), ['user name "morgana"']);
  assert.deepEqual(findPrivateText('cd /home/someone/projects', names), ['user directory "/home/someone"']);
  assert.deepEqual(findPrivateText('/mnt/c/Users/<user>/AppData', names), [], 'the documented placeholder is fine');
});

test('findPrivateText reads paths the way OCR spaces them, WSL network paths and email addresses', () => {
  assert.equal(normaliseOcr('C: \\Users\\Someone\\ AppData'), 'C:\\Users\\Someone\\AppData');
  assert.deepEqual(findPrivateText('"C: \\Users\\Someone\\ AppData\\Local"', []), ['user directory "C:\\Users\\Someone"']);
  assert.deepEqual(findPrivateText('\\\\wsl.localhost\\Ubuntu\\home\\someone\\projects', []), ['user directory "\\\\wsl.localhost\\Ubuntu\\home\\someone"']);
  assert.deepEqual(findPrivateText('Author: Someone <someone@example.org>', []), ['email address "someone@example.org"']);
  assert.deepEqual(findPrivateText('review@localhost (the fixture identity)', []), [], 'no top-level domain, no address');
});

test('findPrivateText ignores names too short to match reliably', () => {
  assert.deepEqual(findPrivateText('a quick wizard', ['a', 'qu']), []);
});

test('the scan reads text files and reports the kind of finding, never the text it matched', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'privacy-scan-test-'));
  const clean = path.join(dir, 'README.md');
  const leaky = path.join(dir, 'manifest.json');
  fs.writeFileSync(clean, '# Gate\n\nRun: 2026-10-10 · repo abc (dirty)\n');
  fs.writeFileSync(leaky, JSON.stringify({ workDir: 'C:\\Users\\Someone\\AppData\\Local\\Temp', author: 'someone@example.org' }));
  const ok = scan([clean]);
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /^✓ .*README\.md$/m);
  const bad = scan([leaky]);
  assert.equal(bad.status, 1, bad.stderr);
  assert.match(bad.stdout, /✗ .*manifest\.json: 2 finding\(s\): user directory, email address/);
  assert.doesNotMatch(bad.stdout, /Someone|someone/);
  fs.rmSync(dir, { recursive: true });
});

test('the scan fails closed: nothing to scan, a missing or unsupported file', () => {
  const none = scan([]);
  assert.equal(none.status, 2);
  assert.match(none.stderr, /nothing to scan/);
  const missing = scan(['docs/qa/2.0-gate-3/*.png']); // an unmatched shell glob arrives as itself
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /no such file/);
  const other = scan(['.vscodeignore']);
  assert.equal(other.status, 2);
  assert.match(other.stderr, /only \.png, \.json, \.md and \.txt/);
});

test('the scan fails closed under WSL when it cannot read the Windows user name', () => {
  const result = scan([path.join(root, 'README.md')], { WSL_DISTRO_NAME: 'Ubuntu', PRIVACY_SCAN_CMD: '/nonexistent/cmd.exe' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /cannot read the Windows user name/);
});

test('the scan fails closed when Pillow or tesseract cannot run', () => {
  const noPillow = scan([sheet], { PRIVACY_SCAN_PYTHON: '/nonexistent/python3' });
  assert.equal(noPillow.status, 2);
  assert.match(noPillow.stderr, /with Pillow/);
  const noOcr = scan([sheet], { PRIVACY_SCAN_TESSERACT: '/nonexistent/tesseract' });
  assert.equal(noOcr.status, 2);
  assert.match(noOcr.stderr, /cannot run \/nonexistent\/tesseract/);
});
```

Apply the harness and package-contents test changes (from the repository root):

```bash
git apply <<'PATCH'
diff --git a/test/package-contents.test.mjs b/test/package-contents.test.mjs
index bf72731..35a1d8e 100644
--- a/test/package-contents.test.mjs
+++ b/test/package-contents.test.mjs
@@ -9,7 +9,10 @@ const allowed = [/^package\.json$/, /^README\.md$/, /^CHANGELOG\.md$/, /^LICENSE
 const pendingRelease = [/^icons\/product-src\//, /^icons\/product-icon-(map|ids|baseline-[^/]*)\.json$/, /^icons\/README\.md$/];
 
 test('the vsix file list (vsce ls) holds only allowlisted paths', () => {
-  const listed = execFileSync('npx', ['vsce', 'ls', '--no-dependencies'], { cwd: root, encoding: 'utf8' })
+  // vsce's own entry script under the running Node, not `npx`: on native Windows npx is npx.cmd, which execFileSync can
+  // only start through a shell.
+  const vsce = path.join(root, 'node_modules', '@vscode', 'vsce', 'vsce');
+  const listed = execFileSync(process.execPath, [vsce, 'ls', '--no-dependencies'], { cwd: root, encoding: 'utf8' })
     .split('\n').map((line) => line.trim()).filter(Boolean);
   const pending = listed.filter((file) => pendingRelease.some((re) => re.test(file)));
   console.log(`# packaged icon sources/data awaiting a release decision (${pending.length}):\n${pending.map((file) => `#   ${file}`).join('\n')}`);
diff --git a/test/review-harness.test.mjs b/test/review-harness.test.mjs
index 74ef986..c0f66ac 100644
--- a/test/review-harness.test.mjs
+++ b/test/review-harness.test.mjs
@@ -22,6 +22,7 @@ test('every file the harness needs exists', () => {
     'review/helper-extension/package.json', 'review/helper-extension/extension.js', 'review/helper-extension/README.md',
     'review/helper-extension/media/sheet.svg', ...JOBS,
     'scripts/review/stage-extension.mjs', 'scripts/review/capture.mjs', 'scripts/review/run-gate.mjs', 'scripts/review/contact-sheet.mjs',
+    'scripts/review/args.mjs', 'scripts/review/privacy-scan.mjs',
   ]) assert.ok(exists(file), file);
 });
 
@@ -120,13 +121,20 @@ test('gate 2 keeps the three severity toasts on screen for every theme of the no
   assert.match(helper, /onDidChangeActiveColorTheme\(/, 'the helper raises the toasts again when the theme changes');
 });
 
-test('the terminal profile used for command decorations gets shell integration injected', () => {
-  // VS Code 1.141 injects shell integration on Windows only into powershell.exe, pwsh.exe and Git Bash, and only when the
-  // profile's args are empty or just -NoLogo (ptyHostMain.js). The default WSL fish profile gets none, so no decorations.
+test('the terminal profile skips the user profile and sources shell integration itself', () => {
+  // Gate 2 ran PowerShell with -NoLogo only, so VS Code injected shell integration but the author's own profile also
+  // loaded, and its prompt decided what the committed main-terminal-panel showed. -NoProfile keeps any user path out of
+  // the prompt; VS Code then no longer injects (1.141 ptyHostMain.js injects only when the args are empty or -NoLogo),
+  // so the profile defines a fixed prompt and dot-sources the script, whose install path capture.mjs fills in.
   const binding = json('review/profile/keybindings.json').find((candidate) => candidate.command === 'workbench.action.terminal.newWithProfile');
   const profile = json('review/profile/settings.base.json')['terminal.integrated.profiles.windows'][binding.args.profileName];
   assert.match(profile.path, /\\powershell\.exe$/i);
-  assert.ok(profile.args.length === 0 || (profile.args.length === 1 && profile.args[0].toLowerCase() === '-nologo'), JSON.stringify(profile.args));
+  assert.deepEqual(profile.args.slice(0, 4).map((arg) => arg.toLowerCase()), ['-nologo', '-noprofile', '-noexit', '-command']);
+  // try/catch as VS Code's own injection does: under a Restricted execution policy the error would print the path.
+  assert.match(profile.args[4], /^function global:prompt \{ 'PS workspace> ' \}; try \{ \. '\{\{shellIntegrationPs1\}\}' \} catch \{\}$/, 'fixed prompt first, then shell integration');
+  const capture = read('scripts/review/capture.mjs');
+  assert.match(capture, /'contrib', 'terminal', 'common', 'scripts', 'shellIntegration\.ps1'/);
+  assert.match(capture, /replaceAll\('\{\{shellIntegrationPs1\}\}', JSON\.stringify\(shellIntegrationPs1\.replaceAll\("'", "''"\)\)/, 'capture.mjs fills in the script path, quotes doubled');
 });
 
 test('the gate 2 terminal scene types only commands whose output names no path, user or machine', () => {
@@ -207,27 +215,38 @@ test('the debug target runs in Node mode through a wrapper, never as a second fu
   assert.match(lines[runAt], /%\*$/, 'passes js-debug arguments through');
 });
 
-test('the icon sheet shows every drawing at every scale: side-by-side views in a maximized panel', () => {
+test('the icon sheet shows every drawing at 200%: pages of three views of 17 rows', () => {
   // Gate run 2026-10-10T01-41-22: the single tree in a default-height panel showed 13 rows at 100% and 5 at 200%.
-  // Phase 2 passes 36 drawings, the most two views hold at 200%, so the helper contributes three.
+  // Gate 2 (47 drawings, three views): at 200% the panel between the side bar and the chat bar was 428 CSS px wide, so
+  // the third view was off its right edge. Measured in a gate-3 dry run at 200% with both side bars closed: the
+  // maximized panel is 904 CSS px wide, each view is 228 px wide whatever their number (five views overflowed by 236 px)
+  // and its list is 382 px tall, 17 rows of 22 px. So the helper shows three views of 17 rows, 51 drawings a page, and
+  // a chord turns the page (gate 3 captures one scene per page).
   const helper = json('review/helper-extension/package.json');
   const views = helper.contributes.views.spellboundReview;
-  assert.ok(views.length >= 2, 'several views share the panel width');
+  assert.equal(views.length, 3);
+  assert.ok(views.length * 228 <= 904, 'three views fit the panel width at 200%');
   const source = read('review/helper-extension/extension.js');
   assert.match(source, /require\('\.\/package\.json'\)\.contributes\.views\.spellboundReview/, 'extension.js fills every contributed view');
-  // Maximized panel at 200% on a 1080p screen: about 516 CSS px window, minus title bar, status bar and panel header.
-  const drawings = Object.keys(json('icons/product-icon-map.json').drawings).length;
-  const rowsPerView = Math.ceil(drawings / views.length);
-  assert.ok(rowsPerView * 22 + 22 <= 516 - 35 - 22 - 35, `${rowsPerView} rows fit a maximized panel at 200%`);
+  assert.match(source, /const ROWS_PER_VIEW = 17;/);
+  assert.ok(17 * 22 <= 382, '17 rows fit a 382 px list');
+  assert.match(source, /sheet\.description = `page \$\{page \+ 1\} of \$\{pages\}`/, 'every view header names its page');
+  // Gate 3 ends with 71 drawings (47 + 6 panel + 18 debug): two pages, whatever the map holds now.
+  const drawings = Math.max(71, Object.keys(json('icons/product-icon-map.json').drawings).length);
+  assert.equal(Math.ceil(drawings / (17 * views.length)), 2);
+  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
+  assert.ok(keyOf('spellboundReview.iconSheetPage'), 'a chord turns the page');
 
-  const maximize = json('review/profile/keybindings.json').find((binding) => binding.command === 'workbench.action.toggleMaximizedPanel');
+  const maximize = keyOf('workbench.action.toggleMaximizedPanel');
   assert.ok(maximize, 'a chord toggles the maximized panel');
   for (const file of GATES) {
-    const scene = json(file).scenes.find((candidate) => candidate.name === 'icon-sheet');
-    assert.ok(scene.setup.some((step) => step.press === maximize.key), `${file}: setup maximizes the panel`);
-    const teardown = scene.teardown.map((step) => step.press);
-    assert.ok(teardown.indexOf(maximize.key) >= 0 && teardown.indexOf(maximize.key) < teardown.indexOf('ctrl+alt+shift+e'),
-      `${file}: teardown restores the panel size before closing it, so later scenes keep the default layout`);
+    const scenes = json(file).scenes;
+    const first = scenes.find((candidate) => candidate.name === 'icon-sheet');
+    assert.ok(first.setup.some((step) => step.press === maximize), `${file}: setup maximizes the panel`);
+    const last = scenes.filter((candidate) => candidate.name.startsWith('icon-sheet')).at(-1);
+    const teardown = last.teardown.map((step) => step.press);
+    assert.ok(teardown.indexOf(maximize) >= 0 && teardown.indexOf(maximize) < teardown.indexOf('ctrl+alt+shift+e'),
+      `${file}: the last icon-sheet scene restores the panel size before closing it, so later scenes keep the default layout`);
   }
 });
 
@@ -249,7 +268,8 @@ test('the gate 2 terminal scene maximizes the panel, so both decorated commands
   const terminal = json('review/jobs/gate-2.json').scenes.find((scene) => scene.name === 'terminal');
   const presses = terminal.setup.map((step) => step.press);
   const typed = presses.findIndex((key) => bindings.some((binding) => binding.key === key && binding.command === 'workbench.action.terminal.sendSequence'));
-  assert.ok(presses.indexOf(keyOf('workbench.action.terminal.newWithProfile')) < presses.indexOf(maximize), 'opens the terminal, then maximizes');
+  const opens = presses.indexOf(keyOf('workbench.action.terminal.newWithProfile'));
+  assert.ok(opens >= 0 && opens < presses.indexOf(maximize), 'opens the terminal, then maximizes');
   assert.ok(presses.indexOf(maximize) >= 0 && presses.indexOf(maximize) < typed, 'maximizes before typing the commands');
   const teardown = terminal.teardown.map((step) => step.press);
   assert.deepEqual(teardown, [maximize, keyOf('workbench.action.closePanel')], 'restores the panel size, then closes it');
@@ -271,3 +291,18 @@ test('restoring the workspace never shows up as a change in the terminal listing
   assert.ok(body.length > 0, 'restoreWorkspace is a function');
   assert.match(body, /\.equals\(/, 'compares contents before rewriting a file');
 });
+
+test('every PowerShell terminal scene focuses the editor group before opening the terminal', () => {
+  // Gate 2: with the chat input focused, the newWithProfile chord opened nothing; the terminal scene worked only after the
+  // scenes before it had moved the focus.
+  const bindings = json('review/profile/keybindings.json');
+  const keyOf = (command) => bindings.find((binding) => binding.command === command).key;
+  const opens = keyOf('workbench.action.terminal.newWithProfile');
+  const scenes = GATES.flatMap((file) => json(file).scenes.filter((scene) => (scene.setup ?? []).some((step) => step.press === opens)));
+  assert.ok(scenes.length > 0);
+  for (const scene of scenes) {
+    const presses = scene.setup.map((step) => step.press);
+    const focus = presses.indexOf(keyOf('workbench.action.focusActiveEditorGroup'));
+    assert.ok(focus >= 0 && focus < presses.indexOf(opens), scene.name);
+  }
+});
PATCH
```

What the patch does:
- lists `args.mjs` and `privacy-scan.mjs` among the harness files;
- replaces the gate-2 terminal-profile test (args empty or `-NoLogo`) with one that requires `-NoProfile`, the fixed prompt and the dot-sourced script;
- makes the gate-2 ordering assertion fail when the open-terminal press is missing (it passed vacuously; it stays green before and after this task);
- replaces the icon-sheet test with one for pages: three views, 17 rows each, two pages for 71 drawings, a page chord, and the last icon-sheet scene of every gate restoring the panel;
- adds `every PowerShell terminal scene focuses the editor group before opening the terminal`, which loops over every gate job;
- runs `vsce` through Node in `test/package-contents.test.mjs`. On native Windows `npx` is `npx.cmd`, which `execFileSync` starts only through a shell (`spawnSync npx ENOENT`).

`test/review-args.test.mjs` also checks that empty lists, an unknown scene, an uncaptured scale and a missing job file stop `run-gate.mjs` with exit 2 and the usage. `test/privacy-scan.test.mjs` has one test per fail-closed case, an OCR-spacing case, and a text-file case that checks the output never repeats the matched text.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/review-args.test.mjs test/privacy-scan.test.mjs test/review-harness.test.mjs test/package-contents.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected:

```
ℹ tests 24
ℹ pass 18
ℹ fail 6
```

With `--test-reporter=tap … | grep '^not ok'`, the failures are the two new files (`ERR_MODULE_NOT_FOUND` for `scripts/review/args.mjs` and `scripts/review/privacy-scan.mjs`) and these four tests:
- `every file the harness needs exists`
- `the terminal profile skips the user profile and sources shell integration itself`
- `the icon sheet shows every drawing at 200%: pages of three views of 17 rows`
- `every PowerShell terminal scene focuses the editor group before opening the terminal`

Do not run `node scripts/review/run-gate.mjs` with any argument before Step 4: until then an unknown argument starts a full gate-1 run (about 15 minutes).

- [ ] **Step 3: Add the argument parser and the privacy scanner**

Create `scripts/review/args.mjs`:

```js
// Arguments of run-gate.mjs. Parsed before anything is built or launched, so a typo stops the run instead of starting
// a full gate run with the default job.
import { parseArgs } from 'node:util';

export const USAGE = `Usage: node scripts/review/run-gate.mjs [--job <file>] [--skip-variants] [--scales <list>] [--scenes <list>]
  --job <file>       gate job (default review/jobs/gate-1.json)
  --skip-variants    capture only the main pass
  --scales <list>    dry run: only these scales, for example --scales=1 or --scales=1,2
  --scenes <list>    dry run: only these scenes, in job order, for example --scenes=terminal,icon-sheet
  --help             print this text`;

const list = (option, value) => {
  if (value === undefined) return null;
  const items = value.split(',').map((item) => item.trim()).filter(Boolean);
  if (!items.length) throw new Error(`--${option} needs at least one value`);
  return items;
};

export function parseGateArgs(argv) {
  const { values } = parseArgs({
    args: argv,
    strict: true,
    allowPositionals: false,
    options: {
      job: { type: 'string', default: 'review/jobs/gate-1.json' },
      'skip-variants': { type: 'boolean', default: false },
      scales: { type: 'string' },
      scenes: { type: 'string' },
      help: { type: 'boolean', default: false },
    },
  });
  const scales = list('scales', values.scales)?.map((item) => {
    const scale = Number(item);
    if (!(scale > 0)) throw new Error(`--scales takes numbers such as 1,1.25; got '${item}'`);
    return scale;
  }) ?? null;
  return { job: values.job, skipVariants: values['skip-variants'], help: values.help, scales, scenes: list('scenes', values.scenes) };
}

// Cuts a gate job down for a dry run. Scene order and each scene's steps stay as in the job file.
export function filterJob(job, { scales, scenes }) {
  const known = job.scenes.map((scene) => scene.name);
  for (const scene of scenes ?? []) if (!known.includes(scene)) throw new Error(`Unknown scene '${scene}' (the job has ${known.join(', ')})`);
  const passes = job.passes.map((pass) => {
    const cut = { ...pass };
    if (scales) cut.scales = pass.scales.filter((scale) => scales.includes(scale));
    if (scenes) cut.scenes = (pass.scenes ?? known).filter((scene) => scenes.includes(scene));
    return cut;
  }).filter((pass) => pass.scales.length && (!pass.scenes || pass.scenes.length));
  for (const scale of scales ?? []) {
    if (!passes.some((pass) => pass.scales.includes(scale))) throw new Error(`No pass captures at scale ${scale}`);
  }
  return { ...job, passes };
}
```

Create `scripts/review/privacy-scan.mjs`:

```js
#!/usr/bin/env node
// Scans gate evidence before it is committed and reports user names, user directories and email addresses in it.
// Usage: node scripts/review/privacy-scan.mjs <file>...
//   .png files are read with OCR (python3 with Pillow upscales them 3x, then tesseract reads them); .json, .md and .txt
//   files are read as text. Exit 0: nothing found. Exit 1: something found. Exit 2: the scan could not run (no file
//   given, a missing or unsupported file, no Windows user name under WSL, no Pillow or tesseract): it fails closed.
// The names come from this machine at run time (the WSL user, Windows %USERNAME% and the %USERPROFILE% folder), and
// the output names the kind of finding, never the name, so no name is written to disk or into committed output.
// PRIVACY_SCAN_CMD, PRIVACY_SCAN_PYTHON and PRIVACY_SCAN_TESSERACT override cmd.exe, python3 and tesseract (tests).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TEXT = new Set(['.json', '.md', '.txt']);

// OCR spaces out path separators ("C: \Users\Name\ AppData"); join them before matching.
export const normaliseOcr = (text) => text.replace(/[ \t]*([:\\/])[ \t]*/g, '$1');

export function findPrivateText(text, names) {
  const flat = normaliseOcr(text);
  const found = [];
  for (const name of names.filter((candidate) => candidate.length >= 3)) {
    if (new RegExp(`(?<![a-z])${escape(name)}(?![a-z])`, 'i').test(flat)) found.push(`user name "${name.toLowerCase()}"`);
  }
  const directories = /[A-Za-z]:\\Users\\(?!<user>)[^\\\s"']+|\\\\wsl(?:\.localhost|\$)\\[^\\\s"']+\\home\\[^\\\s"']+|\/(?:home|Users)\/(?!<user>)[^/\s"']+/g;
  for (const [match] of flat.matchAll(directories)) found.push(`user directory "${match}"`);
  for (const [match] of flat.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) found.push(`email address "${match}"`);
  return found;
}

const isWsl = () => Boolean(process.env.WSL_DISTRO_NAME)
  || (fs.existsSync('/proc/version') && /microsoft/i.test(fs.readFileSync('/proc/version', 'utf8')));

export function machineUserNames() {
  const names = new Set([os.userInfo().username]);
  if (!isWsl()) return [...names];
  let output;
  try {
    output = execFileSync(process.env.PRIVACY_SCAN_CMD ?? 'cmd.exe', ['/d', '/c', 'echo %USERNAME%^|%USERPROFILE%'], { cwd: '/mnt/c', encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    throw new Error('cannot read the Windows user name through cmd.exe (WSL interop off?); refusing to scan without it');
  }
  const [user, profile] = output.trim().split('|');
  if (!user || user.includes('%')) throw new Error('cmd.exe returned no Windows user name; refusing to scan without it');
  names.add(user);
  if (profile && !profile.includes('%')) names.add(path.win32.basename(profile));
  return [...names];
}

// Grey, light text on dark, three times larger: tesseract misses 100% UI text on a dark theme without this.
const PREPARE = `import sys
from PIL import Image, ImageOps
image = Image.open(sys.argv[1]).convert('L')
if sum(image.resize((64, 64)).getdata()) / 4096 < 128:
    image = ImageOps.invert(image)
image.resize((image.width * 3, image.height * 3), Image.LANCZOS).save(sys.argv[2])`;

function checkOcrTools() {
  const python = process.env.PRIVACY_SCAN_PYTHON ?? 'python3';
  const tesseract = process.env.PRIVACY_SCAN_TESSERACT ?? 'tesseract';
  try {
    execFileSync(python, ['-I', '-c', 'import PIL'], { stdio: 'ignore' });
  } catch {
    throw new Error(`cannot run ${python} with Pillow, which the OCR needs to read 100% UI text`);
  }
  try {
    execFileSync(tesseract, ['--version'], { stdio: 'ignore' });
  } catch {
    throw new Error(`cannot run ${tesseract} (OCR)`);
  }
  return { python, tesseract };
}

function ocr(file, scratch, { python, tesseract }) {
  const prepared = path.join(scratch, 'prepared.png');
  execFileSync(python, ['-I', '-c', PREPARE, file, prepared], { stdio: 'ignore' });
  return execFileSync(tesseract, [prepared, 'stdout'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
}

function main(files) {
  if (!files.length) throw new Error('nothing to scan: give the sheets, manifest.json and README.md to check');
  for (const file of files) {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`no such file: ${file}`);
    const kind = path.extname(file).toLowerCase();
    if (kind !== '.png' && !TEXT.has(kind)) throw new Error(`cannot scan ${file}: only .png, .json, .md and .txt`);
  }
  const names = machineUserNames();
  const tools = files.some((file) => path.extname(file).toLowerCase() === '.png') ? checkOcrTools() : null;
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'privacy-scan-'));
  let problems = 0;
  try {
    for (const file of files) {
      const kind = path.extname(file).toLowerCase();
      let text = kind === '.png' ? ocr(file, scratch, tools) : fs.readFileSync(file, 'utf8');
      if (kind === '.json') text = text.replaceAll('\\\\', '\\'); // JSON escapes each backslash of a Windows path
      const found = findPrivateText(text, names);
      problems += found.length;
      // The kind of finding only, never the matched text, so the output can be pasted into a review.
      console.log(`${found.length ? '✗' : '✓'} ${file}${found.length ? `: ${found.length} finding(s): ${found.map((item) => item.split(' "')[0]).join(', ')}` : ''}`);
    }
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
  return problems ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(`privacy-scan: ${error.message}`);
    process.exitCode = 2;
  }
}
```

- [ ] **Step 4: Apply the runner, capture, helper, profile and gate-2 job changes**

```bash
git apply <<'PATCH'
diff --git a/review/helper-extension/README.md b/review/helper-extension/README.md
index 00dceb1..78d418b 100644
--- a/review/helper-extension/README.md
+++ b/review/helper-extension/README.md
@@ -1,3 +1,3 @@
 # Spellbound review helper
 
-A throwaway extension installed only into the isolated review VS Code that `npm run review:gate` launches. It lists every mapped product-icon drawing at 16px in three side-by-side panel trees, registers a fake test controller so the Testing view shows pass and fail icons, puts one error, one warning and one info problem on notes.md, raises notifications (one long warning; and, while toggled on, one info, one warning and one error, raised again on every theme change so they outlast VS Code's toast timeout through the theme loop), shows a multi-step quick pick with a Back button, toggles status bar entries for the four Copilot states and the two spinners (states a signed-out review profile cannot reach), and puts the fixture repository into the staged or conflicted state through the built-in git extension's API. It is never published, never referenced from the root `package.json`, and excluded from the Spellbound VSIX by `.vscodeignore`.
+A throwaway extension installed only into the isolated review VS Code that `npm run review:gate` launches. It lists every mapped product-icon drawing at 16px in three side-by-side panel trees, 51 per page (a command turns the page), registers a fake test controller so the Testing view shows pass and fail icons, puts one error, one warning and one info problem on notes.md, raises notifications (one long warning; and, while toggled on, one info, one warning and one error, raised again on every theme change so they outlast VS Code's toast timeout through the theme loop), shows a multi-step quick pick with a Back button, toggles status bar entries for the four Copilot states and the two spinners (states a signed-out review profile cannot reach), and puts the fixture repository into the staged or conflicted state through the built-in git extension's API. It is never published, never referenced from the root `package.json`, and excluded from the Spellbound VSIX by `.vscodeignore`.
diff --git a/review/helper-extension/extension.js b/review/helper-extension/extension.js
index 5edb0f0..b2e7480 100644
--- a/review/helper-extension/extension.js
+++ b/review/helper-extension/extension.js
@@ -33,12 +33,23 @@ function activate(context) {
     item.description = description;
     return item;
   });
-  // Side-by-side views (every view package.json contributes), so every row fits a maximized panel even at 200%.
-  const perView = Math.ceil(items.length / sheetViews.length);
-  sheetViews.forEach((id, index) => {
-    const part = items.slice(index * perView, (index + 1) * perView);
-    context.subscriptions.push(vscode.window.registerTreeDataProvider(id, { getTreeItem: (item) => item, getChildren: () => part }));
-  });
+  // Side-by-side views (every view package.json contributes) in a maximized panel, in pages. Measured at 200% (gate 3
+  // dry run, 1080p screen): a view's list is 382 CSS px tall (17 rows of 22 px) and a view is 228 px wide, so three
+  // views fit the 904 px panel and a page holds 51 drawings. spellboundReview.iconSheetPage turns the page; every view
+  // header says which page is shown.
+  const ROWS_PER_VIEW = 17;
+  const perPage = ROWS_PER_VIEW * sheetViews.length;
+  const pages = Math.max(1, Math.ceil(items.length / perPage));
+  let page = 0;
+  const pageChanged = new vscode.EventEmitter();
+  const sheets = sheetViews.map((id, index) => vscode.window.createTreeView(id, { treeDataProvider: {
+    onDidChangeTreeData: pageChanged.event,
+    getTreeItem: (item) => item,
+    getChildren: () => items.slice(page * perPage + index * ROWS_PER_VIEW, page * perPage + (index + 1) * ROWS_PER_VIEW),
+  } }));
+  const describePage = () => { for (const sheet of sheets) sheet.description = `page ${page + 1} of ${pages}`; };
+  describePage();
+  context.subscriptions.push(pageChanged, ...sheets);
 
   const controller = vscode.tests.createTestController('spellboundReview', 'Spellbound review');
   const pass = controller.createTestItem('pass', 'moonwater brews');
@@ -112,7 +123,12 @@ function activate(context) {
       pick.onDidHide(() => pick.dispose());
       pick.show();
     }),
-    vscode.commands.registerCommand('spellboundReview.scm', (state) => scmState(state)));
+    vscode.commands.registerCommand('spellboundReview.scm', (state) => scmState(state)),
+    vscode.commands.registerCommand('spellboundReview.iconSheetPage', () => {
+      page = (page + 1) % pages;
+      describePage();
+      pageChanged.fire();
+    }));
 }
 
 module.exports = { activate };
diff --git a/review/helper-extension/package.json b/review/helper-extension/package.json
index 6e3e5ab..58fded8 100644
--- a/review/helper-extension/package.json
+++ b/review/helper-extension/package.json
@@ -2,7 +2,7 @@
   "name": "spellbound-review-helper",
   "displayName": "Spellbound review helper",
   "description": "Review-only helper for the Spellbound gate screenshots. Not part of the published extension.",
-  "version": "0.0.2",
+  "version": "0.0.3",
   "publisher": "witchynibbles-review",
   "engines": { "vscode": "^1.100.0" },
   "main": "./extension.js",
@@ -20,7 +20,8 @@
       { "command": "spellboundReview.severities", "title": "Spellbound Review: Toggle an info, a warning and an error notification, raised again on every theme change" },
       { "command": "spellboundReview.statusSignals", "title": "Spellbound Review: Toggle the Copilot-state and spinner status entries" },
       { "command": "spellboundReview.quickInput", "title": "Spellbound Review: Show a multi-step quick pick" },
-      { "command": "spellboundReview.scm", "title": "Spellbound Review: Put the fixture repository into a git state" }
+      { "command": "spellboundReview.scm", "title": "Spellbound Review: Put the fixture repository into a git state" },
+      { "command": "spellboundReview.iconSheetPage", "title": "Spellbound Review: Show the next page of the icon sheet" }
     ]
   }
 }
diff --git a/review/jobs/gate-2.json b/review/jobs/gate-2.json
index 57d8846..9fcc4d4 100644
--- a/review/jobs/gate-2.json
+++ b/review/jobs/gate-2.json
@@ -127,6 +127,7 @@
     {
       "name": "terminal",
       "setup": [
+        { "press": "ctrl+alt+shift+a", "wait": 500 },
         { "press": "ctrl+alt+shift+p", "wait": 8000 },
         { "press": "ctrl+alt+shift+m", "wait": 1500 },
         { "press": "ctrl+alt+shift+s", "wait": 2500 },
diff --git a/review/profile/keybindings.json b/review/profile/keybindings.json
index 7119472..8934a77 100644
--- a/review/profile/keybindings.json
+++ b/review/profile/keybindings.json
@@ -31,5 +31,7 @@
   { "key": "ctrl+alt+shift+h", "command": "spellboundReview.scm", "args": "changes" },
   { "key": "ctrl+alt+shift+p", "command": "workbench.action.terminal.newWithProfile", "args": { "profileName": "Spellbound PowerShell" } },
   { "key": "ctrl+alt+shift+s", "command": "workbench.action.terminal.sendSequence", "args": { "text": "Write-Output 'moonwater brews'\r" } },
-  { "key": "ctrl+alt+shift+x", "command": "workbench.action.terminal.sendSequence", "args": { "text": "Write-Error 'nightshade spilled'\r" } }
+  { "key": "ctrl+alt+shift+x", "command": "workbench.action.terminal.sendSequence", "args": { "text": "Write-Error 'nightshade spilled'\r" } },
+  { "key": "ctrl+alt+shift+a", "command": "workbench.action.focusActiveEditorGroup" },
+  { "key": "ctrl+alt+shift+F4", "command": "spellboundReview.iconSheetPage" }
 ]
diff --git a/review/profile/settings.base.json b/review/profile/settings.base.json
index 5bf7fcc..c4174b9 100644
--- a/review/profile/settings.base.json
+++ b/review/profile/settings.base.json
@@ -20,6 +20,9 @@
   "terminal.integrated.defaultProfile.windows": "Ubuntu (WSL)",
   "terminal.integrated.fontFamily": "'Maple Mono NF', Consolas, monospace",
   "terminal.integrated.profiles.windows": {
-    "Spellbound PowerShell": { "path": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", "args": ["-NoLogo"] }
+    "Spellbound PowerShell": {
+      "path": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
+      "args": ["-NoLogo", "-NoProfile", "-NoExit", "-Command", "function global:prompt { 'PS workspace> ' }; try { . '{{shellIntegrationPs1}}' } catch {}"]
+    }
   }
 }
diff --git a/scripts/review/capture.mjs b/scripts/review/capture.mjs
index 64587a8..9afa90e 100644
--- a/scripts/review/capture.mjs
+++ b/scripts/review/capture.mjs
@@ -159,7 +159,14 @@ const rectOf = (cdp, { selector, maxHeight }) => cdp.evaluate(`(() => {
   return { x: r.x, y: r.y, width: r.width, height: ${maxHeight ? `Math.min(r.height, ${maxHeight})` : 'r.height'} };
 })()`);
 
-const baseSettings = JSON.parse(fs.readFileSync(path.join(work, 'profile', 'settings.base.json'), 'utf8'));
+// The review PowerShell profile runs with -NoProfile, so the author's own profile (and any prompt that prints a user
+// path) never loads. VS Code injects shell integration only when a profile's args are empty or -NoLogo, so the profile
+// sources the script itself, inside try/catch (as VS Code does), so a Restricted execution policy prints no path. Its
+// path depends on the install, so it is filled in here: ' doubled for PowerShell's single quotes, then JSON-escaped.
+const shellIntegrationPs1 = path.join(job.codeDir, commitDir, 'resources', 'app', 'out', 'vs', 'workbench', 'contrib', 'terminal', 'common', 'scripts', 'shellIntegration.ps1');
+if (!fs.existsSync(shellIntegrationPs1)) throw new Error(`no shell integration script at ${shellIntegrationPs1}`);
+const baseSettings = JSON.parse(fs.readFileSync(path.join(work, 'profile', 'settings.base.json'), 'utf8')
+  .replaceAll('{{shellIntegrationPs1}}', JSON.stringify(shellIntegrationPs1.replaceAll("'", "''")).slice(1, -1)));
 const keybindings = fs.readFileSync(path.join(work, 'profile', 'keybindings.json'), 'utf8');
 const capturesDir = path.join(work, 'captures');
 // A pass can write the fixture to disk (notes.md reached disk after the first pass of run 2026-10-10T01-41-22),
diff --git a/scripts/review/run-gate.mjs b/scripts/review/run-gate.mjs
index 0261d21..f0e3bb4 100644
--- a/scripts/review/run-gate.mjs
+++ b/scripts/review/run-gate.mjs
@@ -1,13 +1,27 @@
 // Builds, packages, captures on Windows VS Code, and assembles contact sheets.
-// Usage: node scripts/review/run-gate.mjs [--job review/jobs/gate-1.json] [--skip-variants]
+// Usage: see USAGE in args.mjs (node scripts/review/run-gate.mjs --help).
 import fs from 'node:fs';
 import path from 'node:path';
 import crypto from 'node:crypto';
 import { execFileSync, spawnSync } from 'node:child_process';
+import { USAGE, filterJob, parseGateArgs } from './args.mjs';
 
 const root = path.resolve(import.meta.dirname, '..', '..');
-const args = process.argv.slice(2);
-const jobFile = args.includes('--job') ? args[args.indexOf('--job') + 1] : 'review/jobs/gate-1.json';
+// Arguments and the job are checked before anything is built or launched: a bad option, an unknown job file, scene
+// or scale stops here with the usage.
+let args;
+let job;
+try {
+  args = parseGateArgs(process.argv.slice(2));
+  if (args.help) {
+    console.log(USAGE);
+    process.exit(0);
+  }
+  job = filterJob(JSON.parse(fs.readFileSync(path.join(root, args.job), 'utf8')), args);
+} catch (error) {
+  console.error(`${error.message}\n${USAGE}`);
+  process.exit(2);
+}
 const run = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
 const out = path.join(root, 'review-out', run);
 const sh = (command, commandArgs, options = {}) => execFileSync(command, commandArgs, { encoding: 'utf8', ...options }).trim();
@@ -20,7 +34,6 @@ const codeDirWin = process.env.SPELLBOUND_CODE_DIR ?? `${localAppData}\\Programs
 const codeExe = path.join(toWsl(codeDirWin), 'Code.exe');
 const work = path.join(toWsl(localAppData), 'Temp', 'spellbound-review', run);
 const vsce = path.join(root, 'node_modules', '.bin', 'vsce');
-const job = JSON.parse(fs.readFileSync(path.join(root, jobFile), 'utf8'));
 
 // 1. Build and package the extension, plus a variant build for the gate questions.
 execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
@@ -30,7 +43,7 @@ const variantDir = path.join(root, 'icons', 'product-src-variants');
 const variantArgs = fs.existsSync(variantDir)
   ? fs.readdirSync(variantDir).filter((file) => file.endsWith('.svg')).map((file) => `--variant=${file.split('.')[0]}=icons/product-src-variants/${file}`)
   : [];
-if (!args.includes('--skip-variants') && variantArgs.length) execFileSync('node', ['scripts/review/stage-extension.mjs', out, ...variantArgs], { cwd: root, stdio: 'inherit' });
+if (!args.skipVariants && variantArgs.length) execFileSync('node', ['scripts/review/stage-extension.mjs', out, ...variantArgs], { cwd: root, stdio: 'inherit' });
 else job.passes = job.passes.filter((pass) => pass.name !== 'variants');
 
 // 2. Package the review helper with one row per drawing.
@@ -99,6 +112,7 @@ const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
 manifest.run = run;
 manifest.repoCommit = sh('git', ['rev-parse', 'HEAD'], { cwd: root });
 manifest.repoDirty = sh('git', ['status', '--porcelain'], { cwd: root }) !== '';
+if (args.scales || args.scenes) manifest.dryRun = { scales: args.scales, scenes: args.scenes }; // a cut-down run is never gate evidence
 for (const capture of manifest.captures) capture.sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(out, 'captures', capture.file))).digest('hex');
 fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
 execFileSync('node', ['scripts/review/contact-sheet.mjs', out], { cwd: root, stdio: 'inherit' });
PATCH
```

What the patch does:
- `run-gate.mjs` parses its arguments with `parseGateArgs` before anything else (unknown option: the message, the usage, exit 2; `--help`: the usage, exit 0). It cuts the job with `filterJob` and records `manifest.dryRun` when `--scales` or `--scenes` is given.
- `capture.mjs` replaces the `{{shellIntegrationPs1}}` placeholder with `<codeDir>\<commit>\resources\app\out\vs\workbench\contrib\terminal\common\scripts\shellIntegration.ps1`.
- The helper pages the icon sheet: `createTreeView` per view, 17 rows, `page N of M` as the view description, and `spellboundReview.iconSheetPage`. It is now version 0.0.3.
- `keybindings.json` appends `ctrl+alt+shift+a` (focus the editor group) and `ctrl+alt+shift+F4` (next icon-sheet page).
- `settings.base.json` sets the profile above.
- `gate-2.json` adds `{ "press": "ctrl+alt+shift+a", "wait": 500 }` before the terminal chord, so gate 2 stays reproducible on its own.

Why the profile changed: gate 2's profile (`-NoLogo` only) loaded the author's own PowerShell profile, whose prompt decided what the committed terminal sheet showed. VS Code 1.141 injects shell integration only when a profile's args are empty or `-NoLogo` (`ptyHostMain.js`), so with `-NoProfile` the profile defines a fixed prompt first (shell integration wraps whatever prompt exists) and then dot-sources the script.

Why the sheet is paged (measured at 200% in VS Code 1.141, both side bars closed): the maximized panel is 904 CSS px wide, each view is 228 px wide whatever their number (five views overflowed by 236 px, four by 10), and a view's list is 382 px tall, which is 17 rows of 22 px. So 71 drawings cannot fit one 200% screenshot. Three views of 17 rows fit, and a second page holds the rest.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test test/review-args.test.mjs test/privacy-scan.test.mjs test/review-harness.test.mjs test/package-contents.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected:

```
ℹ tests 33
ℹ pass 33
ℹ fail 0
```

Then: `npm test 2>&1 | grep -E '^ℹ (tests|pass|fail)' && npm run validate 2>&1 | tail -1`
Expected: `ℹ tests 244` (Task 2's 232 plus 12), `ℹ pass 244`, `ℹ fail 0`. Validate passes with the stages enforced so far.

And: `node scripts/review/run-gate.mjs --jobs x; echo $?` and `node scripts/review/run-gate.mjs --job review/jobs/gate-2.json --scenes=; echo $?`
Expected, each at once, with nothing built: the message (`Unknown option '--jobs'`, `--scenes needs at least one value`), the usage, and `2`.

- [ ] **Step 6: Check the privacy scanner on known sheets**

```bash
node scripts/review/privacy-scan.mjs docs/qa/2.0-gate-1/main-terminal-panel.png docs/qa/2.0-gate-2/main-terminal-panel.png docs/qa/2.0-gate-2/manifest.json docs/qa/2.0-gate-2/README.md; echo "exit $?"
node scripts/review/privacy-scan.mjs; echo "exit $?"
```

Expected: four `✓` lines and `exit 0`; then `privacy-scan: nothing to scan: …` and `exit 2`. Gate 1's sheet is the redacted one. If the git-ignored originals from the gate-2 redaction are still on this machine, `node scripts/review/privacy-scan.mjs review-out/privacy-originals/main-terminal-panel.png` prints a `✗` line whose findings include `user name` and exits 1 (checked while writing this task).

- [ ] **Step 7: Check the two changed gate-2 scenes in VS Code 1.141 (one scale, about 3 minutes)**

```bash
export AGENT_BROWSER_SESSION=spellbound-gate3
node scripts/review/run-gate.mjs --job review/jobs/gate-2.json --scales=1 --scenes=terminal,icon-sheet --skip-variants
node scripts/review/privacy-scan.mjs review-out/<run>/sheets/*.png
```

Expected: `Gate run complete: …/review-out/<run> (16 captures, 0 warnings)`, then two `✓` lines. Use the `<run>` id that line prints.

The terminal scene runs first here, with no earlier scene to move the focus, so this also checks the focus fix. Open both sheets with the Read tool:
- `main-terminal-panel` shows `PS workspace>` prompts, the success dot on the `Write-Output` line and the error mark on the `Write-Error` line.
- `main-icon-sheet-panel` shows three views headed `page 1 of 1`, holding all 47 drawings, 17 + 17 + 13.

(Checked while writing this task, before the `try`/`catch` was added: 16 captures, 0 warnings, both sheets clean. The profile with `try`/`catch` was then checked in the gate-3 terminal scene at 100% and 200%; see Task 10 Step 6.)

- [ ] **Step 8: Snapshot the tree**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_3`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_3` (gate-3 snapshots live in `review-out/g3/`, so gate 2's `review-out/TREE_N` files are not overwritten).

---

## Part B: panel batch (9 IDs)

Part B draws the "Panel and views" group of spec section 5.2: six drawings, E130-E135, for 8 IDs, plus `markers-view-icon` claimed onto the status batch's `warning-triangle` (spec: "uses `warning`"). The drawings live in `scripts/glyphs/panel.mjs`, fourth in `glyphModules`. One shape is reused from batch 1 through a new part (byte-identical): the candle flame as the ink drop (`parts.flame`). The debug console's window is written out as its own open path (Task 4 says why), so it does not share the terminal's frame.

Where the panel IDs show in VS Code 1.141 (registered defaults from the 1.141 bundle; Part D's harness puts them on screen):

| ID | Default | Where it shows |
| :- | :- | :- |
| `output-view-icon` | `output` (EB9D) | Panel title, when `workbench.panel.showLabels` is `false` (the setting exists in 1.141, default `true`); the view's icon in the activity bar or side bar if the view is moved there. |
| `debug-console-view-icon` | `debug-console` (EB9B) | Same as above. |
| `markers-view-icon` | `warning` (EA6C) | Same as above (Problems). |
| `clear-all`, `notifications-clear-all` | `clear-all` (EABF) | Output and Debug Console title bars (Clear), the notification center header (Clear All Notifications). |
| `filter` | `filter` (EAF1) | Filter buttons in the Problems, Output and Debug Console title bars. Not verified on screen in this draft. |
| `trash`, `terminal-kill` | `trash` (EA81) | The terminal panel toolbar (Kill Terminal; visible in the gate-2 terminal sheets). |
| `panel-maximize` | `screen-full` (EB4C) | The panel title bar (Maximize Panel). VS Code 1.141 keeps the same icon, toggled, while the panel is maximized (`workbench.action.toggleMaximizedPanel` has `icon: panel-maximize` and a `toggled` state with no icon of its own). |

Codepoints:

| Codepoint | Drawing | Task | IDs |
| :- | :- | :- | :- |
| E130 | `quill` | 4 | output-view-icon |
| E131 | `console-spider` | 4 | debug-console-view-icon |
| E132 | `broom` | 5 | clear-all, notifications-clear-all |
| E133 | `funnel` | 5 | filter |
| E134 | `bin` | 5 | trash, terminal-kill |
| E135 | `expand-corners` | 5 | panel-maximize |
| (E120) | `warning-triangle` (status batch) | 5 | + markers-view-icon |

Unmapped `panel` IDs (`node scripts/validate.mjs --only product-batch:panel 2>&1 | grep -c 'does not map'`): 9 at HEAD, 7 after Task 4, 0 after Task 5.

### Task 4: Panel module, shared flame, the output and debug-console view icons

**Files:**
- Create: `scripts/glyphs/panel.mjs`, `test/panel-glyphs.test.mjs`, `icons/product-src/{quill,console-spider}.svg` (generated), `review-out/g3-panel/make.mjs` (git-ignored; Task 5 reuses it)
- Modify: `scripts/glyphs/batch-1.mjs` (`parts.flame`), `scripts/glyphs/index.mjs`, `test/glyph-parts.test.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: `outlineGap` (Task 1); `parts`, `disc`, `leaf`, `polygon`, `rect`, `frame`, `svgDocument`; `defaultBundle()` from `scripts/extract-icon-ids.mjs` (locates the stock `codicon.ttf` without a user path).
- Produces: `parts.flame(cx, top, bottom, half)` (one path string: the candle's flame, pointed top, round bottom, `2 * half` wide, curves only) in `scripts/glyphs/batch-1.mjs`, with the candle byte-identical; the module `scripts/glyphs/panel.mjs` (`drawings`, `variants`, a local `band45(p, q)` helper), fourth in `glyphModules`; the drawings `quill` (E130) and `console-spider` (E131); `test/panel-glyphs.test.mjs` with the helpers `pathsOf`, `piecesOf`, `box`, `bounds`, `outlinesOf`, `at45OrSquare`, which Task 5 appends to.

- [ ] **Step 1: Write the failing tests**

In `test/glyph-parts.test.mjs`, change the primitives import to:

```js
import { frame, rect, svgDocument } from '../scripts/glyphs/primitives.mjs';
```

and append:

```js

test('parts.flame is the candle flame, unchanged', () => {
  assert.equal(drawings.candle(), svgDocument(frame(6, 9, 4, 6, { r: 0 }), rect(7, 8, 2, 1), parts.flame(8, 1, 7, 2)));
});
```

Create `test/panel-glyphs.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parts } from '../scripts/glyphs/batch-1.mjs';
import { drawings } from '../scripts/glyphs/panel.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers. Clearances use outlineGap (0 where outlines cross or overlap), on the flattened outlines.
const pathsOf = (name) => parseGlyphSvg(drawings[name]()).paths.map((path) => path.d);
const piecesOf = (name) => pathsOf(name).join('').split(/(?=M)/); // one path string per subpath, in drawing order
const box = (ds) => Object.fromEntries(Object.entries(pathBounds(ds)).map(([key, value]) => [key, Number(value.toFixed(2))]));
const bounds = (name) => box(pathsOf(name));
const outlinesOf = (d) => [d].flat().flatMap((part) => subpaths(part));
const at45OrSquare = (poly) => poly.every(([x1, y1], index) => {
  const [x2, y2] = poly[(index + 1) % poly.length];
  return x1 === x2 || y1 === y2 || Math.abs(x2 - x1) === Math.abs(y2 - y1);
});

test('panel drawings follow the glyph rules: no errors and no warnings', () => {
  for (const [name, draw] of Object.entries(drawings)) {
    const { errors, warnings } = glyphRuleProblems(draw());
    assert.deepEqual({ errors, warnings }, { errors: [], warnings: [] }, name);
  }
});

// ---- View icons (Task 4) ----
test('output (quill): vane, shaft, a 4x5 ink drop and two written lines, inside x1-15 y1-15', () => {
  assert.deepEqual(bounds('quill'), { minX: 1, maxX: 15, minY: 1, maxY: 15 });
  const drop = parts.flame(3, 10, 15, 2);
  assert.ok(pathsOf('quill').join('').includes(drop), 'the ink drop is the candle flame shape, x1-5 y10-15');
  assert.deepEqual(box([drop]), { minX: 1, maxX: 5, minY: 10, maxY: 15 }); // shape accent at least 4x4 (section 4)
  const rest = pathsOf('quill').join('').replace(drop, '');
  assert.ok(outlineGap(outlinesOf(drop), outlinesOf(rest)) >= 1, 'the drop keeps one unit from the quill and the lines');
  for (const [point, filled] of [[[12, 12.5], true], [[12, 14.5], true], [[12, 13.5], false], [[11, 5], true]]) {
    assert.equal(filledAt(pathsOf('quill'), point), filled, `${point}`);
  }
});

test('debug console: a window open at its lower-right corner, a prompt, and a six-legged spider breaking out', () => {
  assert.deepEqual(bounds('console-spider'), { minX: 1, maxX: 15, minY: 2, maxY: 15 });
  const [window, prompt, body, ...legs] = piecesOf('console-spider');
  const spider = [body, ...legs];
  assert.equal(legs.length, 6, 'six legs');
  // The corner is open: the right wall stops at y8 and the bottom wall at x6, and no window ink lies below or right of that.
  assert.deepEqual(box([window]), { minX: 1, maxX: 13, minY: 2, maxY: 12 });
  assert.ok(filledAt([window], [12.5, 7.5]) && filledAt([window], [5.5, 11.5]), 'the walls reach y8 and x6');
  for (let x = 6.25; x < 15; x += 0.5) for (let y = 8.25; y < 15; y += 0.5) assert.ok(!filledAt([window], [x, y]), `window ink at ${x},${y}`);
  // The spider's body is the filled part, 4x4, in the open corner.
  assert.deepEqual(box([body]), { minX: 9, maxX: 13, minY: 10, maxY: 14 });
  assert.ok(filledAt(pathsOf('console-spider'), [11, 12]));
  // One full unit between the window, the prompt and the spider (section 4).
  assert.ok(outlineGap(outlinesOf(window), outlinesOf(spider)) >= 1, 'spider to window');
  assert.ok(outlineGap(outlinesOf(window), outlinesOf(prompt)) >= 1, 'prompt to window');
  assert.ok(outlineGap(outlinesOf(prompt), outlinesOf(spider)) >= 1, 'prompt to spider');
  // Legs and prompt are straight or 45-degree strokes.
  for (const piece of [prompt, ...legs]) assert.ok(outlinesOf(piece).every(at45OrSquare), piece);
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `node --test test/panel-glyphs.test.mjs test/glyph-parts.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module'`
Expected: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/scripts/glyphs/panel.mjs'`, then `ℹ tests 6`, `ℹ pass 4`, `ℹ fail 2` (the panel file, and the new parts test with `TypeError: parts.flame is not a function`).

- [ ] **Step 3: Move the flame into `parts` (byte-identical)**

In `scripts/glyphs/batch-1.mjs`:

1. Replace the two comment lines above `export const parts = {` with:

```js
// Shared parts (phase 2): the status batch builds bell-dot, the copilot cat variants and the dirty-branch sprigs from
// these, so a variant never drifts from its base drawing; the panel batch (gate 3) builds its ink drops from the
// flame. Each returns path strings for svgDocument.
```

2. Insert above `  // Small git-branch sprig (a different drawing from the activity-bar herb sprig).`:

```js
  // Flame (or drop): pointed top, round bottom, 2 * half wide, all curves, so every point stays on the grid.
  flame: (cx, top, bottom, half) => `M${cx} ${top}C${cx + half * 0.6} ${top + 1.5} ${cx + half} ${bottom - half - 0.6} ${cx + half} ${bottom - half}`
    + `A${half} ${half} 0 0 1 ${cx - half} ${bottom - half}C${cx - half} ${bottom - half - 0.6} ${cx - half * 0.6} ${top + 1.5} ${cx} ${top}Z`,
```

3. Delete the module-level flame (the comment `// Flame: pointed top, round bottom; shape-bearing accent 4 wide.`, the two-line `const flame = …;` and the blank line after it).

4. In `drawings.candle`, replace `  flame(8, 1, 7, 2), // accent: flame x6-10, y1-7, one unit above the wick` with `  parts.flame(8, 1, 7, 2), // accent: flame x6-10, y1-7, one unit above the wick (shape-bearing accent 4 wide)`.

Run: `npm run draw:glyphs && git status --short icons && node --test test/glyph-parts.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `Wrote 47 glyph SVGs`, no `git status` line (the candle is byte-identical), `ℹ tests 5`, `ℹ pass 5`, `ℹ fail 0`.

- [ ] **Step 4: Create the panel module with the two view icons**

Create `scripts/glyphs/panel.mjs`:

```js
// Gate 3 `panel` batch (spec section 5.2, "Panel and views"): output, debug console, clear-all, filter, trash and
// panel-maximize. `markers-view-icon` reuses the status batch's warning triangle (claimed in Task 5, no drawing here).
import { parts } from './batch-1.mjs';
import { disc, leaf, polygon, rect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

// 45-degree band from p to q, 1.41 across (each long edge 0.5 + 0.5 off the centre line), ends cut square to the band.
// With p and q on the half grid every corner lands on the grid too.
const band45 = ([x1, y1], [x2, y2]) => {
  const [ox, oy] = (x2 - x1) * (y2 - y1) > 0 ? [0.5, -0.5] : [0.5, 0.5];
  return polygon([[x1 + ox, y1 + oy], [x2 + ox, y2 + oy], [x2 - ox, y2 - oy], [x1 - ox, y1 - oy]]);
};

// ---- View icons (Task 4) ----
// output-view-icon: a quill over two written lines; the ink drop is the filled part (spec 5.2). The vane is solid: an
// outlined vane (leaf ring 6 wide with a 3-wide hole) read as a spoon or a racket at 16px, so the vane is drawn like
// the witch hat, solid, and the drop stays the accent. The stock Codicon `output` is a notepad.
drawings.quill = () => svgDocument(
  leaf([7, 9], [15, 1], 4.5), // vane, tip at the top right, 4.5 across its middle (at 5 the arcs overshoot the tip)
  band45([7, 9], [5.5, 10.5]), // shaft and nib, running out of the vane's lower tip
  parts.flame(3, 10, 15, 2), // accent: ink drop x1-5, y10-15 (the candle flame's shape, 4x5)
  rect(9, 12, 6, 1), // written line x9-15, y12-13
  rect(8, 14, 7, 1), // written line x8-15, y14-15
);

// debug-console-view-icon: a console window with a spider breaking out of its open lower-right corner, the stock
// Codicon layout (window, prompt, bug over the corner). A spider drawn inside a closed window either fused with the
// frame or, as an X of legs, read as a cancel cross (⊠) beside the house close and terminal-error. The window keeps the
// terminal's r1 corners and 1-unit walls but is smaller (x1-13, y2-12) and written out as one open path: knockOut on
// the closed frame would flatten its corner arcs off the grid. Every gap between window, prompt and spider is 1 unit.
const openWindow = 'M2 2H12A1 1 0 0 1 13 3V8H12V3H2V11H6V12H2A1 1 0 0 1 1 11V3A1 1 0 0 1 2 2Z'; // open from x6 / y8 to the corner
drawings['console-spider'] = () => svgDocument(
  openWindow, // window x1-13, y2-12
  polygon([[3, 5], [4, 4], [6, 6], [4, 8], [3, 7], [4, 6]]), // prompt ❯ x3-6, y4-8, 1.41 across
  disc(11, 12, 2), // accent: body x9-13, y10-14
  band45([9.5, 10.5], [8.5, 9.5]), band45([12.5, 10.5], [13.5, 9.5]), // upper legs
  band45([9.5, 13.5], [8.5, 14.5]), band45([12.5, 13.5], [13.5, 14.5]), // lower legs, down to y15
  rect(7, 12, 2, 1), rect(13, 12, 2, 1), // side legs x7-9 and x13-15, y12-13
);

```

In `scripts/glyphs/index.mjs`, add `import * as panel from './panel.mjs';` below the status import and end the file with `export const glyphModules = [batch1, chrome, status, panel];`.

Run: `node --test test/panel-glyphs.test.mjs test/glyph-parts.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 8`, `ℹ pass 8`, `ℹ fail 0`.

- [ ] **Step 5: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs quill E130 output-view-icon
node scripts/claim-drawing.mjs console-spider E131 debug-console-view-icon
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓'
node scripts/validate.mjs --only product-batch:panel 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{quill,console-spider}.svg
```

Expected:
- `Wrote 49 glyph SVGs`.
- `quill (E130) <- output-view-icon` and `console-spider (E131) <- debug-console-view-icon`.
- `Built 49 product icon drawings for 92 icon IDs in icons/witchynibbles-product-icons.woff`.
- `✓ WitchyNibbles package validation passed (enforced: product-pipeline)`, no `✗` line.
- `7`.
- `ℹ tests 250`, `ℹ fail 0` (1 parts test, 3 panel tests, 2 drawing drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M7 9A8.236 8.236 0 0 1 15 1A8.236 8.236 0 0 1 7 9ZM7.5 9.5L6 11L5 10L6.5 8.5ZM3 10C4.2 11.5 5 12.4 5 13A2 2 0 0 1 1 13C1 12.4 1.8 11.5 3 10ZM9 12L15 12L15 13L9 13ZM8 14L15 14L15 15L8 15Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2H12A1 1 0 0 1 13 3V8H12V3H2V11H6V12H2A1 1 0 0 1 1 11V3A1 1 0 0 1 2 2ZM3 5L4 4L6 6L4 8L3 7L4 6ZM9 12A2 2 0 1 1 13 12A2 2 0 1 1 9 12ZM9 11L8 10L9 9L10 10ZM12 10L13 9L14 10L13 11ZM10 14L9 15L8 14L9 13ZM13 13L14 14L13 15L12 14ZM7 12L9 12L9 13L7 13ZM13 12L15 12L15 13L13 13Z"/></svg>
```

- [ ] **Step 6: Inspect against the stock Codicons**

Write the comparison page once (Task 5 reuses it). It finds the stock font through `defaultBundle()`, so no user path is written anywhere:

```bash
mkdir -p review-out/g3-panel
cat > review-out/g3-panel/make.mjs <<'MAKE'
// Panel drawings from the built font beside the stock Codicons they replace, at 12/16/24px on dark, light and gold.
import fs from 'node:fs';
import path from 'node:path';
import { defaultBundle } from '../../scripts/extract-icon-ids.mjs';

const out = path.resolve('review-out/g3-panel');
const bundle = defaultBundle();
if (!bundle) throw new Error('VS Code 1.141 not found: set VSCODE_WORKBENCH_JS');
fs.copyFileSync('icons/witchynibbles-product-icons.woff', path.join(out, 'house.woff'));
fs.copyFileSync(bundle.replace(/vs\/workbench\/workbench\.desktop\.main\.js$/, 'media/codicon.ttf'), path.join(out, 'codicon.ttf'));
const { drawings } = JSON.parse(fs.readFileSync('icons/product-icon-map.json', 'utf8'));
// [drawing, stock Codicon character it replaces] (codepoints from the 1.141 bundle's codicon table)
const rows = [
  ['quill', 'EB9D'], ['console-spider', 'EB9B'], ['broom', 'EABF'], ['funnel', 'EAF1'], ['bin', 'EA81'],
  ['expand-corners', 'EB4C'], ['warning-triangle', 'EA6C'], // markers-view-icon
  ['close', 'EA76'], ['terminal-error', 'EBFB'], ['terminal', 'EA85'], // house neighbours the panel glyphs must not be confused with
];
const glyph = (family, codepoint, size) => `<span style="font:${size}px/1 ${family}">&#x${codepoint};</span>`;
const strip = (family, codepoint) => [12, 16, 24].map((size) => glyph(family, codepoint, size)).join('');
const cells = (name, stock) => [['#120C1F', '#A99AB9'], ['#F5ECFA', '#735F7D'], ['#FFD477', '#0D0916']]
  .map(([bg, fg]) => `<td style="background:${bg};color:${fg}">${strip('H', drawings[name].codepoint)}<i></i>${strip('C', stock)}</td>`).join('');
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Panel vs Codicon</title>
<style>@font-face{font-family:H;src:url(house.woff)}@font-face{font-family:C;src:url(codicon.ttf)}
body{margin:8px;font:12px system-ui;background:#fff}table{border-collapse:collapse}th{text-align:left;padding:2px 8px;font-weight:500}
td{padding:6px 10px;white-space:nowrap}td span{display:inline-block;margin-right:10px;vertical-align:middle}i{display:inline-block;width:16px}</style>
<table><tr><th></th><th>dark: house 12/16/24 · Codicon 12/16/24</th><th>light</th><th>gold</th></tr>
${rows.filter(([name]) => name in drawings).map(([name, stock]) => `<tr><th>${name}</th>${cells(name, stock)}</tr>`).join('\n')}</table>`);
console.log(path.join(out, 'index.html'));
MAKE
node review-out/g3-panel/make.mjs
export AGENT_BROWSER_SESSION=spellbound-gate3
for dpr in 1 2; do
  agent-browser set viewport 900 640 $dpr
  agent-browser open "file://$PWD/review-out/g3-panel/index.html"
  agent-browser screenshot --full "$PWD/review-out/g3-panel/compare@${dpr}x.png"
done
agent-browser close
```

Then run the glyph sheet procedure (Global Constraints). Open the PNGs with the Read tool; crop the 16px cells and upscale them with nearest-neighbour scaling (PIL) to judge single pixels. The page puts `close`, `terminal-error` and `terminal` under the panel rows, because those are the house glyphs a small window-and-bug could be mistaken for. Check that, at 16px and 100% on all three backgrounds:

- the quill reads as a feather with an ink drop and two written lines, not a spoon, a leaf or a paintbrush; the drop stays a separate round blob at 12px;
- the debug console reads as a console window with a bug breaking out of its open lower-right corner, like the stock `debug-console` beside it, and not as a cross in a box (`close`, `terminal-error`) or as the house `terminal`. At 16px/100% the small `❯` shrinks to a ▸ mark; at 12px the spider is a speck, as the stock bug is.

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_4`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_4`.

### Task 5: Broom, funnel, bin, expand corners, markers; enforce `product-batch:panel`

**Files:**
- Create: `icons/product-src/{broom,funnel,bin,expand-corners}.svg` (generated)
- Modify: `scripts/glyphs/panel.mjs`, `test/panel-glyphs.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `scripts/validation-stage.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: Task 4's module, `band45` and test helpers (`piecesOf`, `at45OrSquare` included); `parts.flame`; `frame`, `polygon`, `rect` (primitives); `review-out/g3-panel/make.mjs` (Task 4).
- Produces: the drawings `broom` (E132), `funnel` (E133), `bin` (E134), `expand-corners` (E135); `markers-view-icon` on `warning-triangle` (E120); a theme that maps all 9 panel IDs; the stage `product-batch:panel` enforced by `npm run validate`.

- [ ] **Step 1: Write the failing tests**

Append to `test/panel-glyphs.test.mjs`:

```js

// ---- Actions (Task 5) ----
// Fill symmetry, sampled with the font's nonzero rule on a 0.5 grid offset so no sample lands on an edge.
const symmetric = (name, mirror) => {
  for (let x = 0.3; x < 16; x += 0.5) {
    for (let y = 0.6; y < 16; y += 0.5) {
      if (filledAt(pathsOf(name), [x, y]) !== filledAt(pathsOf(name), mirror([x, y]))) return `${x.toFixed(1)},${y.toFixed(1)}`;
    }
  }
  return true;
};
const aboutX8 = ([x, y]) => [16 - x, y];
const aboutY8 = ([x, y]) => [x, 16 - y];
// Width of a polygon along the horizontal line at y (the span between its first and last edge crossings).
const widthAt = (poly, y) => {
  const xs = poly.flatMap(([x1, y1], index) => {
    const [x2, y2] = poly[(index + 1) % poly.length];
    return (y1 <= y) !== (y2 <= y) ? [x1 + ((y - y1) * (x2 - x1)) / (y2 - y1)] : [];
  });
  return Math.max(...xs) - Math.min(...xs);
};

test('clear-all (broom): a 45-degree handle, filled bristles at least 4x4, two swept lines, each part one unit apart', () => {
  const [handle, bristles, ...lines] = piecesOf('broom');
  assert.deepEqual(bounds('broom'), { minX: 3, maxX: 15, minY: 1, maxY: 15 });
  assert.deepEqual(box([bristles]), { minX: 3, maxX: 10, minY: 6, maxY: 13 });
  assert.ok(outlineGap(outlinesOf(handle), outlinesOf(bristles)) >= 1, 'handle to bristles');
  assert.ok(outlineGap(outlinesOf(lines), outlinesOf([handle, bristles])) >= 1, 'lines to broom');
  assert.ok(outlinesOf(handle).every(at45OrSquare), 'handle edges run at 45 degrees');
});

test('filter (funnel): a hollow cone whose hole is at least 2 units wide all the way down, and a drop for the spout', () => {
  assert.deepEqual(bounds('funnel'), { minX: 1, maxX: 15, minY: 3, maxY: 15 });
  assert.equal(symmetric('funnel', aboutX8), true);
  for (const [point, filled] of [[[8, 3.5], true], [[8, 6], false], [[4, 4.5], false], [[7.5, 7.5], false], [[8, 8.5], true], [[8, 9.5], false], [[8, 13], true]]) {
    assert.equal(filledAt(pathsOf('funnel'), point), filled, `${point}`);
  }
  // Section 4: a cut-out is at least 2 units. The hole is a trapezoid with a 2-unit flat bottom, not a V whose tip
  // narrows to nothing (that tip filled in at 16px).
  const [, hole, drop] = piecesOf('funnel');
  const [holeOutline] = outlinesOf(hole);
  for (let y = 4.25; y < 8; y += 0.5) assert.ok(widthAt(holeOutline, y) >= 2, `hole width at y${y}: ${widthAt(holeOutline, y)}`);
  assert.equal(drop, parts.flame(8, 10, 15, 2), 'the drop is the candle flame shape, x6-10 y10-15');
  assert.ok(outlineGap(outlinesOf(drop), outlinesOf(piecesOf('funnel').slice(0, 2))) >= 1, 'drop to cone');
});

test('trash (bin): a solid lid one unit above an open body with two ribs, every gap 2 units, mirrored about x = 8', () => {
  assert.deepEqual(bounds('bin'), { minX: 2, maxX: 14, minY: 1, maxY: 15 });
  assert.equal(symmetric('bin', aboutX8), true);
  const [lid, ...body] = piecesOf('bin');
  assert.deepEqual(box([lid]), { minX: 2, maxX: 14, minY: 1, maxY: 4 });
  assert.ok(outlineGap(outlinesOf(lid), outlinesOf(body)) >= 1, 'lid to body');
  const row = [3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5].map((x) => (filledAt(pathsOf('bin'), [x, 10]) ? '#' : '.')).join('');
  assert.equal(row, '#..#..#..#', 'wall, 2-unit gap, rib, 2-unit gap, rib, 2-unit gap, wall');
});

test('panel-maximize (expand corners): four 1-unit corner brackets on the 12x12 square, mirrored about x = 8 and y = 8', () => {
  assert.deepEqual(bounds('expand-corners'), { minX: 2, maxX: 14, minY: 2, maxY: 14 });
  assert.equal(piecesOf('expand-corners').length, 4);
  assert.equal(symmetric('expand-corners', aboutX8), true);
  assert.equal(symmetric('expand-corners', aboutY8), true);
  for (const [point, filled] of [[[2.5, 2.5], true], [[5.5, 2.5], true], [[6.5, 2.5], false], [[2.5, 5.5], true], [[2.5, 6.5], false], [[3.5, 3.5], false]]) {
    assert.equal(filledAt(pathsOf('expand-corners'), point), filled, `${point}`);
  }
});
```

Append to `test/product-icon-theme.test.mjs`:

```js

test('every panel-batch ID maps to its own drawing and codepoint', () => {
  const panel = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'panel').map(([id]) => id).sort();
  const drawingOf = (id) => Object.entries(map.drawings).find(([, { ids }]) => ids.includes(id))?.[0];
  assert.deepEqual(Object.fromEntries(panel.map((id) => [id, drawingOf(id)])), {
    'clear-all': 'broom', 'debug-console-view-icon': 'console-spider', filter: 'funnel', 'markers-view-icon': 'warning-triangle',
    'notifications-clear-all': 'broom', 'output-view-icon': 'quill', 'panel-maximize': 'expand-corners', 'terminal-kill': 'bin', trash: 'bin',
  });
  for (const [name, codepoint] of [['quill', 'E130'], ['console-spider', 'E131'], ['broom', 'E132'], ['funnel', 'E133'], ['bin', 'E134'], ['expand-corners', 'E135'], ['warning-triangle', 'E120']]) {
    assert.equal(map.drawings[name].codepoint, codepoint, name);
  }
  for (const id of panel) assert.equal(theme.iconDefinitions[id]?.fontCharacter, `\\${map.drawings[drawingOf(id)].codepoint}`, id);
});
```

Run: `node --test test/panel-glyphs.test.mjs test/product-icon-theme.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|TypeError|AssertionError'`
Expected: `ℹ tests 14`, `ℹ pass 9`, `ℹ fail 5`: the four new drawing tests (`TypeError: drawings[name] is not a function`) and the coverage test (`AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal`, the ID-to-drawing table).

- [ ] **Step 2: Append the drawings**

In `scripts/glyphs/panel.mjs`, change the primitives import to:

```js
import { disc, frame, leaf, polygon, rect, svgDocument } from './primitives.mjs';
```

and append:

```js

// ---- Actions (Task 5) ----
// clear-all, notifications-clear-all: a broom sweeping lines; the bristles are the filled part. The stock Codicon is a
// cross over three lines. The handle is a 45-degree band, 1.41 across, whose end stops 1.41 short of the bristles' top
// edge (both square to the handle); the bristles fan out from 2.8 to 7.1 units wide.
drawings.broom = () => svgDocument(
  polygon([[14, 1], [15, 2], [10.5, 6.5], [9.5, 5.5]]), // handle, x9.5-15, y1-6.5
  polygon([[8, 6], [10, 8], [8, 13], [3, 8]]), // accent: bristles x3-10, y6-13
  rect(11, 11, 4, 1), // swept line x11-15, y11-12
  rect(10, 14, 5, 1), // swept line x10-15, y14-15
);

// filter: a funnel; the ink drop is the spout's liquid (spec 5.2: "liquid in the spout"). A hollow spout 4 units wide
// leaves a 2-unit channel, too narrow for an accent with one unit of clearance, so the liquid leaves the funnel as a
// drop where the spout would be. The cone walls are 1 unit at the rim and 1.41 across on the 45-degree sides. The hole
// is a trapezoid with a 2-unit flat bottom (x7-9, y8), so it is at least 2 units wide all the way down (section 4); a
// V-shaped hole narrowed to nothing at its tip, which filled in at 16px.
drawings.funnel = () => svgDocument(
  polygon([[1, 3], [15, 3], [15, 4], [10, 9], [6, 9], [1, 4]]), // cone x1-15, y3-9, flat bottom x6-10
  polygon([[3, 4], [13, 4], [9, 8], [7, 8]], 'ccw'), // hollow inside, 10 wide at the rim, 2 at the bottom
  parts.flame(8, 10, 15, 2), // accent: drop x6-10, y10-15, one unit below the cone
);

// trash, terminal-kill: a bin with a solid lid (the filled part) one unit above an open body with two ribs, every gap
// 2 units (section 4 cut-out minimum). The body is straight-sided, so every edge stays on whole numbers; the stock
// Codicon tapers.
drawings.bin = () => svgDocument(
  polygon([[2, 2], [6, 2], [6, 1], [10, 1], [10, 2], [14, 2], [14, 4], [2, 4]]), // accent: lid x2-14, y2-4, knob x6-10, y1-2
  frame(3, 5, 10, 10), // body x3-13, y5-15, 1-unit walls
  rect(6, 7, 1, 6), // rib x6-7, y7-13
  rect(9, 7, 1, 6), // rib x9-10, y7-13
);

// panel-maximize: four corner brackets on the 12x12 square keyline (x2-14, y2-14), like the stock screen-full (outline
// x2-14, y2-14), 1-unit strokes on whole numbers, arms 4 long. VS Code shows the same icon, toggled, while the panel is
// maximized. No filled part.
const bracket = [[2, 2], [6, 2], [6, 3], [3, 3], [3, 6], [2, 6]]; // top-left
drawings['expand-corners'] = () => svgDocument(
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sy]) => polygon(bracket.map(([x, y]) => [sx > 0 ? x : 16 - x, sy > 0 ? y : 16 - y]))),
);
```

Run: `node --test test/panel-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 7`, `ℹ pass 7`, `ℹ fail 0`.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs broom E132 clear-all notifications-clear-all
node scripts/claim-drawing.mjs funnel E133 filter
node scripts/claim-drawing.mjs bin E134 trash terminal-kill
node scripts/claim-drawing.mjs expand-corners E135 panel-maximize
node scripts/claim-drawing.mjs warning-triangle E120 warning dialog-warning markers-view-icon
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓'
node scripts/validate.mjs --only product-batch:panel 2>&1 | grep -E '^✗|^✓'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
cat icons/product-src/{broom,funnel,bin,expand-corners}.svg
```

Expected:
- `Wrote 53 glyph SVGs`.
- `broom (E132) <- clear-all, notifications-clear-all`, `funnel (E133) <- filter`, `bin (E134) <- trash, terminal-kill`, `expand-corners (E135) <- panel-maximize`, `warning-triangle (E120) <- warning, dialog-warning, markers-view-icon`. The claim script moves a re-claimed drawing to the end of the map, so `warning-triangle` now follows `expand-corners` in `icons/product-icon-map.json` (cosmetic; the gate-2 ledger noted the same for `status-dot`).
- `Built 53 product icon drawings for 99 icon IDs in icons/witchynibbles-product-icons.woff`.
- `✓ WitchyNibbles package validation passed (enforced: product-pipeline)` and `✓ WitchyNibbles package validation passed (enforced: product-batch:panel)`, no `✗` line.
- `ℹ tests 259`, `ℹ fail 0` (4 panel tests, 1 coverage test, 4 drawing drift cases).
- The SVGs are exactly:

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M14 1L15 2L10.5 6.5L9.5 5.5ZM8 6L10 8L8 13L3 8ZM11 11L15 11L15 12L11 12ZM10 14L15 14L15 15L10 15Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M1 3L15 3L15 4L10 9L6 9L1 4ZM7 8L9 8L13 4L3 4ZM8 10C9.2 11.5 10 12.4 10 13A2 2 0 0 1 6 13C6 12.4 6.8 11.5 8 10Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2L6 2L6 1L10 1L10 2L14 2L14 4L2 4ZM4 5H12A1 1 0 0 1 13 6V14A1 1 0 0 1 12 15H4A1 1 0 0 1 3 14V6A1 1 0 0 1 4 5ZM4 14L12 14L12 6L4 6ZM6 7L7 7L7 13L6 13ZM9 7L10 7L10 13L9 13Z"/></svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2L6 2L6 3L3 3L3 6L2 6ZM14 6L13 6L13 3L10 3L10 2L14 2ZM2 10L3 10L3 13L6 13L6 14L2 14ZM14 14L10 14L10 13L13 13L13 10L14 10Z"/></svg>
```

- [ ] **Step 4: Inspect against the stock Codicons**

Re-run the Task 4 Step 6 render block (from `node review-out/g3-panel/make.mjs` to `agent-browser close`; the page now has 10 rows: the six panel drawings, `warning-triangle`, and the house `close`, `terminal-error` and `terminal` for reference), then the glyph sheet procedure. Open the PNGs with the Read tool, upscaling 16px crops with nearest-neighbour scaling, and check that at 16px and 100% on all three backgrounds:

- the broom reads as a broom (handle and a filled fan of bristles) with two swept lines, not as an arrow or a pen;
- the funnel reads as a funnel with a drop leaving it, its 45-degree walls stay one line each, and the hole stays open down to the flat bottom (the first, V-shaped hole filled in at its tip);
- the bin reads as a bin with a lid; the ribs stay two separate lines (2-unit gaps);
- the four corner brackets stay four, on the stock glyph's 12×12 square, and do not merge at 12px;
- every glyph is about the optical size of the stock Codicon beside it.

- [ ] **Step 5: Enforce the panel stage**

Replace `scripts/validation-stage.json` with:

```json
{
  "$comment": "Stages that npm run validate enforces. Phases append stage names as their work lands; validate --release enforces every stage.",
  "enforce": ["base", "color-themes", "product-pipeline", "product-batch:1", "product-batch:chrome", "product-batch:status", "product-batch:panel"]
}
```

Run:

```bash
npm run validate 2>&1 | grep -v '^⚠' | grep -v '^>' | grep .
npm run validate 2>&1 | grep -c 'product-batch:panel'
node scripts/validate.mjs --release 2>&1 | grep -c 'product-batch:panel'
npm run validate 2>&1 | grep '^⚠' | cut -c1-60
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:

```
… 92 pending problems in stages not yet enforced: product-batch:editor (33), product-batch:debug (23), product-batch:symbols (15), release (2), file-icons (19) (use --verbose to list)
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel)
1
0
⚠ icons/product-src/cat-slash.svg straight-segment points 
⚠ icons/product-src/gear.svg straight-segment points off t
⚠ icons/product-src/sync-arrows.svg straight-segment point
ℹ tests 259
ℹ fail 0
```

The three `⚠` lines are the off-grid points accepted at gate 2 (G16); no panel drawing adds one (the across-modules grid test in `test/glyph-grid.test.mjs` also holds the panel module to the grid).

- [ ] **Step 6: Snapshot the tree**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_5`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_5`.

---

---

## Part C: debug batch (23 IDs)

Part C draws the `debug` group of spec section 5.2 ("Debug and testing"): 18 drawings, E136-E147, for 22 IDs, plus `debug-hint` on the existing moon breakpoint (E116). The drawings live in `scripts/glyphs/debug.mjs`, fifth in `glyphModules`. Decision G1 made the moon breakpoint a plain disc; decision D4 pairs the disabled and unverified breakpoint states with existing drawings and lets VS Code's state colours carry the difference (spec 5.2: "the author may overrule it at the debug gate"). The glossary's full moon means "here": breakpoints, the current stack frame, and where a step lands.

**What VS Code 1.141 does with these glyphs (read from the 1.141 bundle, `workbench.desktop.main.{js,css}`, while writing this part):**

- The gutter box is `.monaco-editor .glyph-margin-widgets .cgmr { position: absolute; display: flex; align-items: center; justify-content: center }`. Every glyph-margin icon is centred in it, so breakpoint states only line up if they share a centre and footprint (spec 5.2: 4-12 about (8,8)).
- When execution stops on a line that has a breakpoint, the breakpoint decoration and the stack-frame decoration land on the same element, which then carries both classes. The icon stylesheet emits one `.codicon-<id>:before` rule per icon in registration order, and the codicon table registers `debug-breakpoint` (and `-conditional`) before `debug-stackframe` and `debug-stackframe-focused`, so the frame glyph wins `::before`. VS Code then adds `debug-stackframe-dot` with `.codicon-debug-breakpoint.codicon-debug-stackframe:after { content: var(--vscode-icon-debug-stackframe-dot-content); font-family: …; position: absolute }` (the same for `-conditional` and for `-stackframe-focused`). An absolutely positioned child of the flex box is centred like the glyph, so the dot is drawn in the same 16-unit box: a dot drawn at 6-10 lands at 6-10 of the frame. The dot takes `debugIcon.breakpointForeground` (`… .codicon-debug-breakpoint.codicon-debug-stackframe::after { color: … !important }`); the frame takes `debugIcon.breakpointCurrentStackframeForeground` or `debugIcon.breakpointStackframeForeground`.
- The gutter frame is shown for every stopped frame of the focused session (`top-stack-frame-margin` with `debug-stackframe`, `focused-stack-frame-margin` with `debug-stackframe-focused`). Whenever the stop is not in column 1 (`s.range.startColumn>1` in `vzr`), VS Code also draws an inline arrow before the stopped column: `.debug-top-stack-frame-column { font: 16px/1 codicon }` with the literal content `\uEB8B`. That includes the first statement of an indented line, the usual stop inside any function or loop body, where the arrow carries the `start-of-line` class and sits in the indentation (`position: absolute; transform: translate(-17px, -50%)`). Both the font family and the character are hard-coded, so that inline arrow is always the stock Codicon and no product icon theme can change it. Gate 1's `evidence-debug-stop.png` shows the mid-line case.
- `debug-hint` is drawn at `opacity: .4` when it is not on a breakpoint or frame line.

**Codepoints for the debug drawings:**

| Codepoint | Drawing | Task | IDs |
| :- | :- | :- | :- |
| (E116) | existing `moon-breakpoint` | 6 | debug-breakpoint, + debug-hint |
| E136 | `moon-outline` | 6 | debug-breakpoint-disabled |
| E137 | `dashed-ring` | 6 | debug-breakpoint-unverified, debug-breakpoint-conditional-unverified |
| E138 | `moon-equals` | 6 | debug-breakpoint-conditional, debug-breakpoint-conditional-disabled |
| E139 | `diamond` | 6 | debug-breakpoint-log, debug-breakpoint-log-disabled |
| E13A | `stackframe-arrow` | 7 | debug-stackframe |
| E13B | `stackframe-moon` | 7 | debug-stackframe-focused |
| E13C | `moon-dot` | 7 | debug-stackframe-dot |
| E13D | `step-over` | 7 | debug-step-over |
| E13E | `step-into` | 7 | debug-step-into |
| E13F | `step-out` | 7 | debug-step-out |
| E140 | `play-filled` | 8 | debug-start |
| E141 | `play-outline` | 8 | run, testing-run-icon |
| E142 | `play-stacked` | 8 | testing-run-all-icon |
| E143 | `continue` | 8 | debug-continue |
| E144 | `pause` | 8 | debug-pause |
| E145 | `stop-square` | 8 | debug-stop |
| E146 | `restart` | 8 | debug-restart |
| E147 | `check-disc` | 9 | testing-passed-icon |

Staging (unmapped debug IDs, `node scripts/validate.mjs --only product-batch:debug 2>&1 | grep -c 'does not map'`): 23 before Task 6, then 15, 9, 1, and 0 after Task 9, which appends `product-batch:debug` to `scripts/validation-stage.json`. No gate variant is drawn for the debug batch: the author's choices at this gate (D4's pairing, the solid toolbar, the run-all chevron) are about drawings that already exist, and the README offers the alternatives in words.

---

### Task 6: Debug batch, breakpoints (moon outline, dashed ring, `=` moon, diamond) and the hint

**Files:**
- Create: `scripts/glyphs/debug.mjs`, `test/debug-glyphs.test.mjs`, `icons/product-src/{moon-outline,dashed-ring,moon-equals,diamond}.svg` (generated)
- Modify: `scripts/glyphs/index.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)

**Interfaces:**
- Consumes: `drawings['moon-breakpoint']` and `drawings.skull` from `scripts/glyphs/batch-1.mjs` (read live, never copied); `drawings['sync-arrows']` from `scripts/glyphs/status.mjs` (gate-2 Task 7 test); `disc`, `polygon`, `rect`, `svgDocument` from `scripts/glyphs/primitives.mjs`; `outlineGap` (Task 1), `parseGlyphSvg`, `pathBounds`, `subpaths`, `filledAt` from `scripts/lib/svg-geometry.mjs`; `scripts/claim-drawing.mjs`; Part B's `scripts/glyphs/panel.mjs` already in `glyphModules`.
- Produces: the module `scripts/glyphs/debug.mjs` (`drawings`, `variants`; `variants` stays empty), fifth in `glyphModules`; the drawings `moon-outline` (E136), `dashed-ring` (E137), `moon-equals` (E138), `diamond` (E139); `debug-hint` on E116; `test/debug-glyphs.test.mjs` with the helpers `pathsOf`, `box`, `bounds`, `outlinesOf`, `keys`, `gap` (`outlineGap`, imported under that name as in the status tests), `inkAt`, `polar`, which Tasks 7-9 append to.

**Decisions G1 and D4.** `debug-hint` (the faint mark under the mouse in the gutter) is the moon breakpoint itself. The three states VS Code adds on top of the four base breakpoints reuse a base drawing: `debug-breakpoint-conditional-disabled` takes the `=` moon, `debug-breakpoint-log-disabled` the diamond and `debug-breakpoint-conditional-unverified` the dashed ring; the disabled and unverified foreground colours carry the state. `debug-breakpoint-disabled` itself is the moon outline (spec 5.2), so a plain disabled breakpoint is hollow while a disabled conditional or log breakpoint is the filled shape in the disabled colour. That asymmetry is the spec's pairing; the gate README asks the author about it.

- [ ] **Step 1: Check the preconditions**

```bash
node -e "import('./scripts/glyphs/index.mjs').then(({ glyphModules }) => console.log(glyphModules.length))"
node scripts/validate.mjs --only product-batch:debug 2>&1 | grep -c 'does not map'
node -e "const m=require('./icons/product-icon-map.json').drawings; console.log(m['moon-breakpoint'].codepoint, m['moon-breakpoint'].ids.join(' '), Object.keys(m).length)"
node -e "const p=require('./icons/product-icon-ids.json').ids; console.log(Object.values(p).filter((e) => e.batch === 'debug').length)"
```

Expected: `4` (batch 1, chrome, status, panel), `23`, `E116 debug-breakpoint 53`, `23`. If any line differs, stop: Part B has not landed.

- [ ] **Step 2: Write the failing test**

`test/debug-glyphs.test.mjs` (the imports and helpers already cover Tasks 7-9):

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawings as batchOne } from '../scripts/glyphs/batch-1.mjs';
import { drawings } from '../scripts/glyphs/debug.mjs';
import { disc, polygon, svgDocument } from '../scripts/glyphs/primitives.mjs';
import { drawings as status } from '../scripts/glyphs/status.mjs';
import { filledAt, outlineGap as gap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

// Helpers for Tasks 6-9 (the same measures as test/status-glyphs.test.mjs; clearances with outlineGap).
const pathsOf = (svg) => parseGlyphSvg(svg).paths.map((path) => path.d);
const box = (ds) => Object.fromEntries(Object.entries(pathBounds(ds)).map(([key, value]) => [key, Number(value.toFixed(2))]));
const bounds = (svg) => box(pathsOf(svg));
const outlinesOf = (svg) => subpaths(pathsOf(svg).join(''));
const keys = (polygons) => polygons.map((poly) => JSON.stringify(poly));
const inkAt = (name, point, all = drawings) => filledAt(pathsOf(all[name]()), point);
const polar = (r, degrees) => [8 + r * Math.cos((degrees * Math.PI) / 180), 8 + r * Math.sin((degrees * Math.PI) / 180)];

// ---- Breakpoints (Task 6) ----
test('every breakpoint glyph sits on the Codicon footprint, 4-12 about (8,8); the log diamond on 3-13', () => {
  const footprint = { minX: 4, maxX: 12, minY: 4, maxY: 12 };
  assert.deepEqual(bounds(batchOne['moon-breakpoint']()), footprint);
  assert.deepEqual(bounds(drawings['moon-outline']()), footprint);
  assert.deepEqual(bounds(drawings['moon-equals']()), footprint);
  const dashed = bounds(drawings['dashed-ring']());
  assert.deepEqual([dashed.minY, dashed.maxY], [4, 12]);
  assert.ok(dashed.minX >= 4 && dashed.maxX <= 12 && dashed.minX + dashed.maxX === 16, JSON.stringify(dashed));
  assert.deepEqual(bounds(drawings.diamond()), { minX: 3, maxX: 13, minY: 3, maxY: 13 });
});

test('the moons are built from the live moon breakpoint, not from a copy of its numbers', () => {
  const [moon] = subpaths(pathsOf(batchOne['moon-breakpoint']())[0]);
  for (const name of ['moon-outline', 'moon-equals']) assert.deepEqual(outlinesOf(drawings[name]())[0], moon, name);
  // Swap in a larger moon for a moment: every debug moon must follow it, the outline's hole and the dashes included.
  const original = batchOne['moon-breakpoint'];
  batchOne['moon-breakpoint'] = () => svgDocument(disc(8, 8, 5));
  try {
    const [swapped] = subpaths(disc(8, 8, 5));
    for (const name of ['moon-outline', 'moon-equals']) assert.deepEqual(outlinesOf(drawings[name]())[0], swapped, name);
    assert.equal(inkAt('moon-outline', [8, 3.5]), true, 'a 1-unit ring at the new radius');
    assert.equal(inkAt('moon-outline', [8, 4.5]), false, 'the hole follows the new radius');
    assert.equal(inkAt('dashed-ring', [8, 3.5]), true, 'the top dash sits on the new ring');
    assert.equal(inkAt('dashed-ring', [8, 4.5]), false);
  } finally {
    batchOne['moon-breakpoint'] = original;
  }
});

test('breakpoint holes and dashes are real under the font fill rule', () => {
  // moon-outline: a 1-unit ring; moon-equals: two slots with 2 units of moon between them.
  assert.equal(inkAt('moon-outline', [8, 8]), false);
  assert.equal(inkAt('moon-outline', [8, 4.5]), true);
  for (const point of [[8, 6.5], [8, 9.5]]) assert.equal(inkAt('moon-equals', point), false, `= slot at ${point}`);
  for (const point of [[8, 8], [8, 4.7], [8, 11.3], [5, 8]]) assert.equal(inkAt('moon-equals', point), true, `moon at ${point}`);
  // dashed-ring: ink in the middle of each dash, nothing in the middle of each gap or inside the ring.
  for (let degrees = 30; degrees < 360; degrees += 60) {
    assert.equal(inkAt('dashed-ring', polar(3.5, degrees)), true, `dash at ${degrees}`);
    assert.equal(inkAt('dashed-ring', polar(3.5, degrees + 30)), false, `gap at ${degrees + 30}`);
  }
  assert.equal(inkAt('dashed-ring', [8, 8]), false);
});

test('unverified and disabled differ where it shows: the dashed ring has gaps where the ring is solid', () => {
  for (const degrees of [0, 60, 120, 180, 240, 300]) {
    assert.equal(inkAt('moon-outline', polar(3.5, degrees)), true);
    assert.equal(inkAt('dashed-ring', polar(3.5, degrees)), false);
  }
});
```

Run: `node --test test/debug-glyphs.test.mjs 2>&1 | grep -m1 -o 'ERR_MODULE_NOT_FOUND'`
Expected: `ERR_MODULE_NOT_FOUND` (`scripts/glyphs/debug.mjs` does not exist yet).

- [ ] **Step 3: Create the module with the breakpoint drawings**

`scripts/glyphs/debug.mjs`:

```js
// Debug batch (spec section 5.2 "Debug and testing"; decisions D3, D4 and G1). The full moon means "here" (glossary,
// section 7): a breakpoint, the current stack frame, where a step lands. Tasks 6-9 append to these objects.
import { drawings as batchOne } from './batch-1.mjs';
import { disc, polygon, rect, svgDocument } from './primitives.mjs';
import { parseGlyphSvg, pathBounds } from '../lib/svg-geometry.mjs';

export const drawings = {};
export const variants = {};

// ---- Breakpoints (Task 6) ----
// Every breakpoint glyph sits on the Codicon footprint, an 8-unit shape centred on (8,8) (spec 5.2), so the gutter mark
// does not jump when a breakpoint changes state. The moons are built from the live batch-1 moon breakpoint (G1: a plain
// disc, x4-12), so a later change to it reaches every moon here.
const moon = () => {
  const [d] = parseGlyphSvg(batchOne['moon-breakpoint']()).paths.map((path) => path.d);
  const { minX, maxX, minY, maxY } = pathBounds([d]);
  return { d, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, r: (maxX - minX) / 2 };
};

// debug-breakpoint-disabled: the moon as a 1-unit ring. VS Code's disabled colour carries the rest of the state.
drawings['moon-outline'] = () => {
  const { d, cx, cy, r } = moon();
  return svgDocument(d, disc(cx, cy, r - 1, 'ccw'));
};

// debug-breakpoint-unverified (and -conditional-unverified, D4): the same ring in six dashes. Each dash is the ring
// between two angles with round ends (arcs only, so no straight-segment point can leave the grid). Dashes are 26
// degrees long, centred on 30, 90, ... 330 degrees, so the top and bottom dashes reach y4 and y12; the round ends of
// neighbouring dashes are 1.07 apart (section 4: no gap under 1 unit). Eight dashes read as a faint dotted ring at
// 16px, four as a ring with notches.
const at = (cx, cy, r, degrees) => [cx + r * Math.cos((degrees * Math.PI) / 180), cy + r * Math.sin((degrees * Math.PI) / 180)];
const fmt = (value) => Number(value.toFixed(3));
const pt = ([x, y]) => `${fmt(x)} ${fmt(y)}`;
function ringDash(cx, cy, r, from, to) {
  const [outerFrom, outerTo, innerTo, innerFrom] = [at(cx, cy, r, from), at(cx, cy, r, to), at(cx, cy, r - 1, to), at(cx, cy, r - 1, from)];
  return `M${pt(outerFrom)}A${r} ${r} 0 0 1 ${pt(outerTo)}A0.5 0.5 0 0 1 ${pt(innerTo)}A${r - 1} ${r - 1} 0 0 0 ${pt(innerFrom)}A0.5 0.5 0 0 1 ${pt(outerFrom)}Z`;
}
drawings['dashed-ring'] = () => {
  const { cx, cy, r } = moon();
  return svgDocument([30, 90, 150, 210, 270, 330].map((centre) => ringDash(cx, cy, r, centre - 13, centre + 13)));
};

// debug-breakpoint-conditional (and -conditional-disabled, D4): the moon with '=' cut out, two 1-unit slots 4 long
// (x6-10; y6-7 and y9-10), section 4's straight-slot exception. 2 units of moon between the slots; the
// thinnest wall is at the slot corners, 4 - 2.83 = 1.17 from the rim.
drawings['moon-equals'] = () => {
  const { d, cx, cy } = moon();
  return svgDocument(d, rect(cx - 2, cy - 2, 4, 1, 'ccw'), rect(cx - 2, cy + 1, 4, 1, 'ccw'));
};

// debug-breakpoint-log (and -log-disabled, D4): a square on its point, x3-13 (spec 5.2 lets the log diamond span 3-13,
// like Codicon's). Its area (50) matches the moon's (50.3), so a logpoint and a breakpoint read with the same weight.
drawings.diamond = () => svgDocument(polygon([[8, 3], [13, 8], [8, 13], [3, 8]]));
```

In `scripts/glyphs/index.mjs`, add the import below the panel import and append `debug` to the list, so the file reads:

```js
import * as batch1 from './batch-1.mjs';
import * as chrome from './chrome.mjs';
import * as status from './status.mjs';
import * as panel from './panel.mjs';
import * as debug from './debug.mjs';

export const glyphModules = [batch1, chrome, status, panel, debug];
```

Run: `node --test test/debug-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 4`, `ℹ fail 0`.

The moon-swap test catches a drawing that copies the moon's numbers instead of reading the live moon: replacing `d` with `disc(8, 8, 4)` in `moon-equals` makes it fail with `AssertionError [ERR_ASSERTION]: moon-equals` (checked while writing).

- [ ] **Step 4: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs moon-breakpoint E116 debug-breakpoint debug-hint
node scripts/claim-drawing.mjs moon-outline E136 debug-breakpoint-disabled
node scripts/claim-drawing.mjs dashed-ring E137 debug-breakpoint-unverified debug-breakpoint-conditional-unverified
node scripts/claim-drawing.mjs moon-equals E138 debug-breakpoint-conditional debug-breakpoint-conditional-disabled
node scripts/claim-drawing.mjs diamond E139 debug-breakpoint-log debug-breakpoint-log-disabled
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:debug 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:
- `Wrote 57 glyph SVGs`.
- The claims print `moon-breakpoint (E116) <- debug-breakpoint, debug-hint`, `moon-outline (E136) <- debug-breakpoint-disabled`, `dashed-ring (E137) <- debug-breakpoint-unverified, debug-breakpoint-conditional-unverified`, `moon-equals (E138) <- debug-breakpoint-conditional, debug-breakpoint-conditional-disabled` and `diamond (E139) <- debug-breakpoint-log, debug-breakpoint-log-disabled`, none with a `removed` suffix; `retiredCodepoints` does not change. Re-claiming `moon-breakpoint` moves its entry to the end of the map (cosmetic, as with `status-dot` at gate 2).
- `Built 57 product icon drawings for 107 icon IDs in icons/witchynibbles-product-icons.woff`.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ WitchyNibbles package validation passed (enforced: product-pipeline)`. The dashed ring adds no warning: its dashes are drawn with arcs only.
- The debug count is `15`.
- `ℹ tests 267`, `ℹ fail 0` (8 more than Task 5: 4 debug tests, 4 drift cases).

- [ ] **Step 5: Inspect the sheet**

Run the glyph sheet procedure and read both PNGs. Check:
- at 16px the five breakpoint marks (moon, outline, dashed ring, `=` moon, diamond) share one centre, and the diamond reads as the same weight as the moon;
- the dashed ring reads as a broken ring, clearly different from the solid outline, on all three backgrounds;
- both `=` slots show as two separate lines at 16px and 24px (at 12px they may merge into one notch; no surface draws breakpoints at 12px).

- [ ] **Step 6: Snapshot the tree**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_6`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_6`.

---

### Task 7: Debug batch, stack frames, the overlay dot and the steps

**Files:**
- Modify: `scripts/glyphs/debug.mjs`, `test/debug-glyphs.test.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)
- Create: `icons/product-src/{stackframe-arrow,stackframe-moon,moon-dot,step-over,step-into,step-out}.svg` (generated)

**Interfaces:**
- Consumes: the Task 6 module and test helpers.
- Produces: the drawings `stackframe-arrow` (E13A), `stackframe-moon` (E13B), `moon-dot` (E13C), `step-over` (E13D), `step-into` (E13E), `step-out` (E13F).

**The overlay (spec section 4, "Spin-safe and overlay-safe", and 5.2 "Paused on a breakpoint").** See the bundle notes at the top of Part C: the frame glyph wins `::before` on a breakpoint line and `debug-stackframe-dot` is centred over it in the same box. So the frame keeps 6-10 clear by 1 unit, the dot is exactly 6-10, and `debug-stackframe-focused` holds that same dot, so a focused frame and a paused-on-breakpoint frame are the same picture. The test pins this as an identity: the outlines of `stackframe-moon` are exactly the outlines of `stackframe-arrow` plus those of `moon-dot`.

- [ ] **Step 1: Write the failing tests**

Append to `test/debug-glyphs.test.mjs`:

```js

// ---- Stack frames and steps (Task 7) ----
test('debug-stackframe-dot is a 4x4 moon dot at 6-10, and the focused frame holds exactly that dot', () => {
  assert.deepEqual(bounds(drawings['moon-dot']()), { minX: 6, maxX: 10, minY: 6, maxY: 10 });
  // The overlay case (frame glyph plus the CSS ::after dot) and the focused frame must be the same picture.
  const overlay = [...outlinesOf(drawings['stackframe-arrow']()), ...outlinesOf(drawings['moon-dot']())];
  assert.deepEqual(keys(outlinesOf(drawings['stackframe-moon']())).sort(), keys(overlay).sort());
});

test('the stack frame keeps the overlay area clear by 1 unit and fills its tip', () => {
  const frame = outlinesOf(drawings['stackframe-arrow']());
  const clearance = gap(subpaths(disc(8, 8, 2)), frame);
  assert.ok(clearance >= 1 - 1e-9, `clearance ${clearance}`);
  for (const point of [[8, 8], [6.2, 8], [9.8, 8], [8, 6.2], [8, 9.8]]) assert.equal(inkAt('stackframe-arrow', point), false, `${point}`);
  for (const point of [[12, 8], [14, 8], [2.5, 8], [6, 3.5], [6, 12.5]]) assert.equal(inkAt('stackframe-arrow', point), true, `${point}`);
});

test('each step arrow lands on a 3x3 moon on pixel column 7, 1 unit or more clear of the arrow', () => {
  const moon = subpaths(disc(7.5, 12.5, 1.5));
  assert.deepEqual(box([disc(7.5, 12.5, 1.5)]), { minX: 6, maxX: 9, minY: 11, maxY: 14 });
  for (const name of ['step-over', 'step-into', 'step-out']) {
    const all = outlinesOf(drawings[name]());
    assert.ok(keys(all).includes(keys(moon)[0]), `${name} has the moon`);
    const arrow = all.filter((poly) => !keys(moon).includes(JSON.stringify(poly)));
    const clearance = gap(moon, arrow);
    assert.ok(clearance >= 1 - 1e-9, `${name} clearance ${clearance}`);
  }
  // Stems on column 7 (x7-8); step-into points down to the moon, step-out points up away from it.
  for (const [name, y] of [['step-into', 2], ['step-out', 9]]) {
    assert.equal(inkAt(name, [7.5, y]), true, `${name} stem`);
    for (const x of [6.5, 8.5]) assert.equal(inkAt(name, [x, y]), false, `${name} beside the stem`);
  }
  assert.equal(inkAt('step-into', [5.5, 6.5]), true, 'step-into head is wide at the top');
  assert.equal(inkAt('step-into', [5.5, 4.5]), false);
  assert.equal(inkAt('step-out', [5.5, 4.5]), true, 'step-out head is wide at the bottom');
  assert.equal(inkAt('step-out', [5.5, 6.5]), false);
  // The stem shows for 5 units, so the arrow over the moon never reads as '!' (a wedge straight over a dot).
  for (const [name, y] of [['step-into', 5], ['step-out', 6]]) {
    assert.equal(inkAt(name, [7.5, y]), true, `${name}: stem at y${y}`);
    assert.equal(inkAt(name, [6.5, y]), false, `${name}: no head at y${y}`);
  }
  // step-over: a band over the moon (open below) and a head below its right leg.
  assert.equal(inkAt('step-over', [7.5, 4.5]), true);
  assert.equal(inkAt('step-over', [7.5, 8]), false);
  assert.equal(inkAt('step-over', [11.5, 10]), true);
});
```

Run: `node --test --test-reporter=tap test/debug-glyphs.test.mjs | grep -E '^not ok|  error|^# (pass|fail)'`
Expected:

```
not ok 5 - debug-stackframe-dot is a 4x4 moon dot at 6-10, and the focused frame holds exactly that dot
  error: 'drawings.moon-dot is not a function'
not ok 6 - the stack frame keeps the overlay area clear by 1 unit and fills its tip
  error: 'drawings.stackframe-arrow is not a function'
not ok 7 - each step arrow lands on a 3x3 moon on pixel column 7, 1 unit or more clear of the arrow
  error: 'drawings[name] is not a function'
# pass 4
# fail 3
```

- [ ] **Step 2: Append the drawings**

Append to `scripts/glyphs/debug.mjs`:

```js

// ---- Stack frames and steps (Task 7) ----
// When execution stops on a line that has a breakpoint, VS Code 1.141 adds the frame's class to the breakpoint's glyph
// and draws debug-stackframe-dot over it with CSS (`.codicon-debug-breakpoint.codicon-debug-stackframe:after`, the same
// for -conditional and for -stackframe-focused): `position: absolute` inside the glyph-margin box `.cgmr`, which is
// `display: flex; align-items: center; justify-content: center`. The dot is centred in the same 16-unit box as the frame
// glyph, so a dot drawn at 6-10 lands at 6-10 of the frame. The frames keep that area clear by 1 unit (section 4).
const moonDot = () => disc(8, 8, 2); // debug-stackframe-dot: the moon at 4x4, x6-10, y6-10

// debug-stackframe: Codicon's tag-shaped pointer, x2-15, y3-13, as a 1-unit outline with 45-degree nose sides (1.06
// across). The nose is filled from x11 (the accent, spec 5.2: the tip), exactly 1 unit right of the dot. The pointer is
// larger than the 8-unit signal keyline because it has to hold the 4x4 dot with 1 unit of clearance.
const pointer = () => [
  polygon([[2, 3], [10, 3], [15, 8], [10, 13], [2, 13]]),
  polygon([[3, 4], [9.5, 4], [11, 5.5], [11, 10.5], [9.5, 12], [3, 12]], 'ccw'),
];
drawings['stackframe-arrow'] = () => svgDocument(pointer());
// debug-stackframe-focused: the same pointer holding the moon dot exactly where the overlay draws it, so a focused
// frame and a paused-on-breakpoint frame look the same.
drawings['stackframe-moon'] = () => svgDocument(pointer(), moonDot());
drawings['moon-dot'] = () => svgDocument(moonDot());

// debug-step-over / -into / -out: an arrow and the moon below it, where the step lands. The arrows keep the chrome
// arrows' stem on pixel column 7 and the chrome head's 2:1 sides, shortened to 5 wide and 4 deep so the stem stays
// visible: with the full chrome head (7 wide, 6 deep) and a 3-unit stem, the wedge over the dot read as '!' at 14-16px.
// The moon is the odd-width 3x3 dot on column 7 (x6-9, y11-14), the dot-like minimum, not the 4x4 overlay dot.
const stepMoon = () => disc(7.5, 12.5, 1.5);
const arrowDown = [[7, 1], [8, 1], [8, 6], [10, 6], [8, 10], [7, 10], [5, 6], [7, 6]]; // stem y1-6, head x5-10, y6-10
const flipY = (points, sum) => points.map(([x, y]) => [x, sum - y]);
drawings['step-into'] = () => svgDocument(polygon(arrowDown), stepMoon()); // tip 1 unit above the moon
drawings['step-out'] = () => svgDocument(polygon(flipY(arrowDown, 11)), stepMoon()); // the same arrow turned up, y1-10
// step-over: a half-ring band over the moon (outer r 4.5, inner 3.5 about (7.5, 8.5): x3-12, legs ending square at y9)
// and a filled 45-degree head below its right leg, pointing down (x8.5-14.5, y9-12, 6 wide and 3 deep), 1.68 clear of
// the moon. A 5-wide head (x9-14) shrank to a nub at 14px.
const overArc = 'M3 9V8.5A4.5 4.5 0 0 1 12 8.5V9H11V8.5A3.5 3.5 0 0 0 4 8.5V9Z';
drawings['step-over'] = () => svgDocument(overArc, polygon([[8.5, 9], [14.5, 9], [11.5, 12]]), stepMoon());
```

Run: `node --test test/debug-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 7`, `ℹ fail 0`. Measured clearances: frame to dot 1.00 (the filled nose starts at x11, the dot ends at x10), step-into and step-out 1.00 (flat tip or stem end 1 unit from the moon), step-over 1.68.

The stem checks catch the `!` shape: putting back the full chrome head (`[[7, 1], [8, 1], [8, 4], [11, 4], [8, 10], [7, 10], [4, 4], [7, 4]]`) fails the step test (checked while writing).

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs stackframe-arrow E13A debug-stackframe
node scripts/claim-drawing.mjs stackframe-moon E13B debug-stackframe-focused
node scripts/claim-drawing.mjs moon-dot E13C debug-stackframe-dot
node scripts/claim-drawing.mjs step-over E13D debug-step-over
node scripts/claim-drawing.mjs step-into E13E debug-step-into
node scripts/claim-drawing.mjs step-out E13F debug-step-out
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:debug 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:
- `Wrote 63 glyph SVGs`.
- The claims print `stackframe-arrow (E13A) <- debug-stackframe`, `stackframe-moon (E13B) <- debug-stackframe-focused`, `moon-dot (E13C) <- debug-stackframe-dot`, `step-over (E13D) <- debug-step-over`, `step-into (E13E) <- debug-step-into` and `step-out (E13F) <- debug-step-out`.
- `Built 63 product icon drawings for 113 icon IDs in icons/witchynibbles-product-icons.woff`.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ … (enforced: product-pipeline)`.
- The debug count is `9`.
- `ℹ tests 276`, `ℹ fail 0` (9 more than Task 6: 3 debug tests, 6 drift cases).

- [ ] **Step 4: Inspect the sheet and the overlay**

Run the glyph sheet procedure and check:
- at 16px the stack frame reads as Codicon's tag-shaped pointer with a solid nose, and the focused frame shows a round dot in its middle, clear of the outline on every side;
- the three steps read as over / into / out at 14px and 16px: a hump with a head on the right, an arrow down onto the moon, an arrow up away from it; step-into and step-out show a stem between the head and the moon end and never read as `!`;
- `moon-dot` is a round 4×4 dot, not a square.

Then check the overlay in a replica of the 1.141 gutter CSS (a page in `review-out/`, git-ignored):

```bash
export AGENT_BROWSER_SESSION=spellbound-gate3
mkdir -p review-out/debug-overlay && cp icons/witchynibbles-product-icons.woff review-out/debug-overlay/house.woff
cat > review-out/debug-overlay/index.html <<'HTML'
<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:H;src:url(house.woff)}body{margin:8px;background:#0D0916}
.cgmr{position:relative;display:inline-flex;align-items:center;justify-content:center;width:18px;height:19px;font:16px/1 H;color:#FFD477;margin-right:6px}
.cgmr::before{content:var(--b)}.cgmr.dot::after{content:'\E13C';font-family:H;position:absolute;color:#FFD477}
</style>
<span class="cgmr dot" style="--b:'\E13A'"></span><span class="cgmr" style="--b:'\E13B'"></span>
<span class="cgmr dot" style="--b:'\E13A';color:#B99AFF"></span>
<span class="cgmr" style="--b:'\E116'"></span><span class="cgmr" style="--b:'\E136'"></span><span class="cgmr" style="--b:'\E137'"></span><span class="cgmr" style="--b:'\E138'"></span><span class="cgmr" style="--b:'\E139'"></span>
HTML
for dpr in 1 2; do
  agent-browser set viewport 300 60 $dpr
  agent-browser open "file://$PWD/review-out/debug-overlay/index.html"
  agent-browser screenshot "$PWD/review-out/debug-overlay/overlay@${dpr}x.png"
done
agent-browser close
```

Open both PNGs (upscale the 1x one with nearest-neighbour). Expected: the first two marks (frame plus `::after` dot, and `stackframe-moon`) match within antialiasing (max 8/255 at 16px, measured at DPR 1 and 2; two composited glyph layers against one); the third shows the lavender other-frame colour with a gold dot in the same place; the five breakpoint marks after it share one centre.

- [ ] **Step 5: Snapshot the tree**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_7`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_7`.

---

### Task 8: Debug batch, run and test triangles and the debug toolbar

**Files:**
- Modify: `scripts/glyphs/debug.mjs`, `test/debug-glyphs.test.mjs`, `icons/product-icon-map.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated)
- Create: `icons/product-src/{play-filled,play-outline,play-stacked,continue,pause,stop-square,restart}.svg` (generated)

**Interfaces:**
- Consumes: the Task 6 module and test helpers; `drawings['sync-arrows']` from `scripts/glyphs/status.mjs`.
- Produces: the drawings `play-filled` (E140), `play-outline` (E141), `play-stacked` (E142), `continue` (E143), `pause` (E144), `stop-square` (E145), `restart` (E146).

**Spec 5.2:** `debug-start` is the filled play triangle; `run` and `testing-run-icon` (which inherits `run`) are the outline; `testing-run-all-icon` is two stacked triangles with the front one filled; continue, pause, stop and restart fill their main shape. One play triangle (x4-13, y2-14) is reused, moved, for debug-start, run, run-all and continue, so the toolbar and the Testing view share one silhouette.

**Rejected while drawing (16px renders beside the stock Codicons):** a run-all made of a filled triangle with a bracket-shaped remnant of a second triangle on its left read as `[▶`, too close to continue's `|▶`; Codicon's own layout (a second outline offset down and left) does not fit these 2:3 sides, because that offset runs parallel to the lower side and leaves under 1 unit between the two triangles. The chosen run-all puts the second triangle ahead of the filled one, as an open chevron, and reads as two triangles at 16px.

- [ ] **Step 1: Write the failing tests**

Append to `test/debug-glyphs.test.mjs`:

```js

// ---- Run, test and debug toolbar (Task 8) ----
const play = [[4, 2], [13, 8], [4, 14]];
const shifted = (dx) => subpaths(polygon(play.map(([x, y]) => [x + dx, y])))[0];

test('every run glyph uses one play triangle: debug-start filled, run outlined with a real hole', () => {
  assert.deepEqual(outlinesOf(drawings['play-filled']()), [shifted(0)]);
  assert.deepEqual(outlinesOf(drawings['play-outline']())[0], shifted(0));
  assert.deepEqual(bounds(drawings['play-outline']()), bounds(drawings['play-filled']()));
  assert.equal(inkAt('play-filled', [7, 8]), true);
  assert.equal(inkAt('play-outline', [7, 8]), false);
  assert.equal(inkAt('play-outline', [4.5, 8]), true);
});

test('run-all: the front triangle is the play triangle, filled; the one behind shows as a chevron 1 unit clear', () => {
  const [front, ...behind] = outlinesOf(drawings['play-stacked']());
  assert.deepEqual(front, shifted(-3));
  const clearance = gap([front], behind);
  assert.ok(clearance >= 1 - 1e-9, `clearance ${clearance}`);
  assert.equal(inkAt('play-stacked', [14, 8]), true, 'the chevron tip');
  assert.equal(inkAt('play-stacked', [11, 8]), false, 'between the front tip and the chevron');
});

test('continue is a bar and the play triangle; pause and stop are solid and centred on (8,8)', () => {
  assert.ok(keys(outlinesOf(drawings.continue())).includes(JSON.stringify(shifted(2))));
  assert.equal(inkAt('continue', [3, 8]), true);
  assert.equal(inkAt('continue', [5, 8]), false);
  assert.deepEqual(bounds(drawings.pause()), { minX: 3, maxX: 13, minY: 2, maxY: 14 });
  for (const point of [[4.5, 8], [11.5, 8]]) assert.equal(inkAt('pause', point), true);
  assert.equal(inkAt('pause', [8, 8]), false);
  assert.deepEqual(bounds(drawings['stop-square']()), { minX: 3, maxX: 13, minY: 3, maxY: 13 });
});

// Arrowheads are the triangular outlines; half-turn asymmetry is the share of ink whose 180-degree image is empty.
const heads = (svg) => outlinesOf(svg).filter((poly) => poly.length === 3).length;
const halfTurnMiss = (svg, [cx, cy]) => {
  const paths = pathsOf(svg);
  let ink = 0;
  let miss = 0;
  for (let x = 0.125; x < 16; x += 0.25) {
    for (let y = 0.125; y < 16; y += 0.25) {
      if (!filledAt(paths, [x, y])) continue;
      ink += 1;
      if (!filledAt(paths, [2 * cx - x, 2 * cy - y])) miss += 1;
    }
  }
  return miss / ink;
};

test('restart is one arrow, open at the upper left, never the half-turn-symmetric sync', () => {
  assert.equal(heads(drawings.restart()), 1, 'restart has one arrowhead');
  assert.equal(heads(status['sync-arrows']()), 2, 'sync has two');
  assert.equal(outlinesOf(drawings.restart()).length, 2, 'one band and one head');
  assert.equal(inkAt('restart', [11.18, 12.18]), true, 'band at the lower right');
  assert.equal(inkAt('restart', [4.82, 5.82]), false, 'gap at the upper left');
  // About its own band centre (8,9), over a third of restart's ink has no ink at its 180-degree image; sync, turned about
  // (8,8), maps onto itself, so the measure tells the two apart.
  assert.ok(halfTurnMiss(drawings.restart(), [8, 9]) > 0.2, `restart miss ${halfTurnMiss(drawings.restart(), [8, 9])}`);
  assert.ok(halfTurnMiss(status['sync-arrows'](), [8, 8]) < 0.02, `sync miss ${halfTurnMiss(status['sync-arrows'](), [8, 8])}`);
});
```

Run: `node --test --test-reporter=tap test/debug-glyphs.test.mjs | grep -E '^not ok|  error|^# (pass|fail)'`
Expected:

```
not ok 8 - every run glyph uses one play triangle: debug-start filled, run outlined with a real hole
  error: 'drawings.play-filled is not a function'
not ok 9 - run-all: the front triangle is the play triangle, filled; the one behind shows as a chevron 1 unit clear
  error: 'drawings.play-stacked is not a function'
not ok 10 - continue is a bar and the play triangle; pause and stop are solid and centred on (8,8)
  error: 'drawings.continue is not a function'
not ok 11 - restart is one arrow, open at the upper left, never the half-turn-symmetric sync
  error: 'drawings.restart is not a function'
# pass 7
# fail 4
```

- [ ] **Step 2: Append the drawings**

Append to `scripts/glyphs/debug.mjs`:

```js

// ---- Run, test and debug toolbar (Task 8) ----
// One play triangle for every run glyph: x4-13, y2-14 with 2:3 sides (Codicon's play fills about the same box).
// debug-start is filled; run and testing-run-icon (which inherits run) are its outline (spec 5.2).
const play = [[4, 2], [13, 8], [4, 14]];
const shiftX = (points, dx) => points.map(([x, y]) => [x + dx, y]);
drawings['play-filled'] = () => svgDocument(polygon(play));
// 1-unit back edge; the inner sides are parallel to the outer ones, 1.11 across, with every point on the grid.
drawings['play-outline'] = () => svgDocument(polygon(play), polygon([[5, 4], [11, 8], [5, 12]], 'ccw'));
// testing-run-all-icon: the play triangle moved 3 left and filled (the front triangle), and a second one behind it
// (the triangle moved 2 right) of which only the two sides show, as an open chevron 1.66 across, 1.11 clear of the front
// triangle. Codicon offsets the second triangle down and left; with these sides that offset runs parallel to the
// lower side and leaves under 1 unit between the two, and a bar in front of the triangle is debug-continue.
drawings['play-stacked'] = () => svgDocument(polygon(shiftX(play, -3)), polygon([[6, 2], [15, 8], [6, 14], [6, 12], [12, 8], [6, 4]]));
// debug-continue: a 2-unit bar and the play triangle moved 2 right, filled (the main shape, spec 5.2).
drawings.continue = () => svgDocument(rect(2, 2, 2, 12), polygon(shiftX(play, 2)));
// debug-pause and debug-stop: solid shapes on the square keyline, centred on (8,8).
drawings.pause = () => svgDocument(rect(3, 2, 3, 12), rect(10, 2, 3, 12)); // bars x3-6 and x10-13, 4 apart
drawings['stop-square'] = () => svgDocument(rect(3, 3, 10, 10)); // x3-13, y3-13
// debug-restart: one arrow round, anticlockwise like Codicon's: a 1-unit band (r 4-5 about (8,9), x3-13, y4-14) from the
// top, round by the right and the bottom to the left side, open at the upper left, and a filled 45-degree head on the
// top end pointing into the gap (base x8, y1.5-7.5; tip (5, 4.5)). sync (status batch) is two arrows chasing each other
// and is half-turn symmetric; restart has one head and is not.
drawings.restart = () => svgDocument('M8 4A5 5 0 1 1 3 9H4A4 4 0 1 0 8 5Z', polygon([[8, 1.5], [8, 7.5], [5, 4.5]]));
```

Run: `node --test test/debug-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 11`, `ℹ fail 0`. Measured: the run-all chevron is 1.11 clear of the front triangle.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs play-filled E140 debug-start
node scripts/claim-drawing.mjs play-outline E141 run testing-run-icon
node scripts/claim-drawing.mjs play-stacked E142 testing-run-all-icon
node scripts/claim-drawing.mjs continue E143 debug-continue
node scripts/claim-drawing.mjs pause E144 debug-pause
node scripts/claim-drawing.mjs stop-square E145 debug-stop
node scripts/claim-drawing.mjs restart E146 debug-restart
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:debug 2>&1 | grep -c 'does not map'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:
- `Wrote 70 glyph SVGs`.
- The claims print `play-filled (E140) <- debug-start`, `play-outline (E141) <- run, testing-run-icon`, `play-stacked (E142) <- testing-run-all-icon`, `continue (E143) <- debug-continue`, `pause (E144) <- debug-pause`, `stop-square (E145) <- debug-stop` and `restart (E146) <- debug-restart`.
- `Built 70 product icon drawings for 121 icon IDs in icons/witchynibbles-product-icons.woff`.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ … (enforced: product-pipeline)`.
- The debug count is `1` (`testing-passed-icon`).
- `ℹ tests 287`, `ℹ fail 0` (11 more than Task 7: 4 debug tests, 7 drift cases).

- [ ] **Step 4: Inspect the sheet**

Run the glyph sheet procedure and check:
- at 16px `play-filled` is solid and `play-outline` has a clear hole, the same size;
- run-all reads as two triangles (a filled one and an open chevron ahead of it), not as continue;
- continue, pause and stop are solid and the same height as the play triangle; restart reads as one curved arrow and never as the two-arrow sync beside it on the sheet.

- [ ] **Step 5: Snapshot the tree**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_8`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_8`.

---

### Task 9: Debug batch, the passed-test disc; close the batch

**Files:**
- Modify: `scripts/glyphs/debug.mjs`, `test/debug-glyphs.test.mjs`, `test/product-icon-theme.test.mjs`, `icons/product-icon-map.json`, `scripts/validation-stage.json`, `icons/product-icon-theme.json` and `icons/witchynibbles-product-icons.woff` (regenerated), `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (section 5.2, "Paused on a breakpoint")
- Create: `icons/product-src/check-disc.svg` (generated)

**Interfaces:**
- Consumes: the Task 6 module and test helpers; `drawings.skull` from batch 1; `pinned`, `theme` in `test/product-icon-theme.test.mjs`.
- Produces: the drawing `check-disc` (E147); every debug ID mapped; the `product-batch:debug` stage enforced by `npm run validate`.

- [ ] **Step 1: Write the failing tests**

Append to `test/debug-glyphs.test.mjs`:

```js

// ---- Test result (Task 9) ----
test('testing-passed is a disc on the skull footprint with the check cut out as a real hole', () => {
  assert.deepEqual(bounds(drawings['check-disc']()), bounds(batchOne.skull()));
  for (const point of [[6, 8.5], [10, 6.5], [7, 10]]) assert.equal(inkAt('check-disc', point), false, `check at ${point}`);
  for (const point of [[8, 3], [4, 11], [10, 10.5], [3, 8]]) assert.equal(inkAt('check-disc', point), true, `disc at ${point}`);
});
```

Append to `test/product-icon-theme.test.mjs`:

```js

test('every debug-batch ID is mapped; the reused breakpoint drawings and the run alias share their glyphs', () => {
  const debug = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === 'debug').map(([id]) => id);
  assert.equal(debug.length, 23);
  for (const id of debug) assert.ok(id in theme.iconDefinitions, id);
  const glyph = (id) => theme.iconDefinitions[id].fontCharacter;
  // G1/D4: the hint is the moon breakpoint; the disabled and unverified variants reuse a drawing and let VS Code's
  // state colours carry the difference.
  assert.equal(glyph('debug-hint'), glyph('debug-breakpoint'));
  assert.equal(glyph('debug-breakpoint-conditional-disabled'), glyph('debug-breakpoint-conditional'));
  assert.equal(glyph('debug-breakpoint-log-disabled'), glyph('debug-breakpoint-log'));
  assert.equal(glyph('debug-breakpoint-conditional-unverified'), glyph('debug-breakpoint-unverified'));
  assert.equal(glyph('testing-run-icon'), glyph('run'));
  assert.notEqual(glyph('debug-start'), glyph('run'));
});
```

The grid test of gate 2 (`across every module, only gear, sync-arrows and cat-slash have off-grid straight-segment points (G3)`) needs no change: every debug drawing is on the grid, and the dashed ring has no straight segments.

Run: `node --test --test-reporter=tap test/debug-glyphs.test.mjs test/product-icon-theme.test.mjs test/glyph-grid.test.mjs | grep -E '^not ok|  error|^# (pass|fail)'`
Expected:

```
not ok 12 - testing-passed is a disc on the skull footprint with the check cut out as a real hole
  error: 'drawings.check-disc is not a function'
not ok 45 - every debug-batch ID is mapped; the reused breakpoint drawings and the run alias share their glyphs
  error: 'testing-passed-icon'
# pass 43
# fail 2
```

- [ ] **Step 2: Append the drawing**

Append to `scripts/glyphs/debug.mjs`:

```js

// ---- Test result (Task 9) ----
// testing-passed-icon sits beside testing-failed-icon (the skull) in the Testing view and the editor gutter, so it uses
// the skull's footprint (x2-14), like warning and info. The check is cut out 2.12 across (3 tall), which meets the
// 2-unit cut-out minimum without an exception; the disc keeps at least 1.53 units of wall around it.
drawings['check-disc'] = () => svgDocument(disc(8, 8, 6), polygon([[4, 8], [5.5, 6.5], [7, 8], [10.5, 4.5], [12, 6], [7, 11]], 'ccw'));
```

Run: `node --test test/debug-glyphs.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'`
Expected: `ℹ tests 12`, `ℹ fail 0`.

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs check-disc E147 testing-passed-icon
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline 2>&1 | grep -E '^✗|^✓|^⚠'
node scripts/validate.mjs --only product-batch:debug 2>&1 | grep -E '^✗|^✓'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected:
- `Wrote 71 glyph SVGs`.
- `check-disc (E147) <- testing-passed-icon`.
- `Built 71 product icon drawings for 122 icon IDs in icons/witchynibbles-product-icons.woff`.
- `⚠` lines only for `cat-slash`, `gear` and `sync-arrows`, then `✓ … (enforced: product-pipeline)`.
- `✓ WitchyNibbles package validation passed (enforced: product-batch:debug)`.
- `ℹ tests 290`, `ℹ fail 0` (3 more than Task 8: 1 debug test, 1 coverage test, 1 drift case).

- [ ] **Step 4: Enforce the debug stage**

Replace `scripts/validation-stage.json` with:

```json
{
  "$comment": "Stages that npm run validate enforces. Phases append stage names as their work lands; validate --release enforces every stage.",
  "enforce": ["base", "color-themes", "product-pipeline", "product-batch:1", "product-batch:chrome", "product-batch:status", "product-batch:panel", "product-batch:debug"]
}
```

Run: `npm run validate 2>&1 | grep -v '^>' | grep .`
Expected:

```
… 69 pending problems in stages not yet enforced: product-batch:editor (33), product-batch:symbols (15), release (2), file-icons (19) (use --verbose to list)
⚠ icons/product-src/cat-slash.svg straight-segment points off the whole/half grid: (5.8, 4.85) (10.875, 15) (9.625, 5) (13.417, 12.583) (10.375, 14) (6.375, 6) …
⚠ icons/product-src/gear.svg straight-segment points off the whole/half grid: (11.182, 3.404) (12.243, 2.343) (13.657, 3.757) (12.596, 4.818) (12.596, 11.182) (13.657, 12.243) …
⚠ icons/product-src/sync-arrows.svg straight-segment points off the whole/half grid: (5.706, 4.723) (5.132, 3.904) (10.294, 11.277) (10.868, 12.096)
✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug)
```

Run: `node -e "const m=require('./icons/product-icon-map.json').drawings; console.log(Object.entries(m).filter(([,d])=>/^E1(3[6-9A-F]|4[0-7])$/.test(d.codepoint)).length, Object.keys(m).length)"`
Expected: `18 71`.

- [ ] **Step 5: Inspect the sheet**

Run the glyph sheet procedure and check:
- at 16px the check in `check-disc` is a clear cut-out on all three backgrounds, and the disc has the skull's height and baseline;
- `check-disc` and `skull` read as the passed/failed pair.

- [ ] **Step 6: Record the inline stack-frame arrow in spec 5.2**

In `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`, at the end of the paragraph that starts `Paused on a breakpoint:`, after `so the two coincide.`, append:

```markdown
 The inline arrow that VS Code adds before the stopped column whenever the stop is not in column 1 (`.debug-top-stack-frame-column`, also at the first statement of an indented line, where it sits in the indentation; character U+EB8B in the `codicon` font family, both hard-coded in 1.141) always shows the stock Codicon: a product icon theme cannot reach it. `debug-breakpoint-conditional-disabled` and `debug-breakpoint-conditional-unverified` are mapped as D4 decided but never drawn in 1.141: a disabled or unverified conditional breakpoint shows the plain disabled or unverified icon.
```

Run: `grep -c 'hard-coded in 1.141' docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`
Expected: `1`.

- [ ] **Step 7: Notes for the gate-3 README**

The gate task copies these into the README:

- Decisions for the author:
  - D4 pairing as drawn: `debug-breakpoint-disabled` is the hollow moon, but `-conditional-disabled` and `-log-disabled` are the filled `=` moon and diamond in the disabled colour, and `-conditional-unverified` is the dashed ring without the `=`. Keep, or draw hollow `=`-moon and diamond outlines for the disabled states (two more drawings in the debug batch)?
  - The debug toolbar mixes weights: continue (a 2-unit bar and a filled triangle), pause (two 3-unit bars) and stop (a 10×10 square) are solid where Codicon draws outlines, while the steps (1-unit stems with filled heads and a 3×3 moon) and restart (a 1-unit band with a filled head) stay light; in 1.141's toolbar order the row reads solid, light, light, light, light, solid. Keep it, make continue, pause and stop outlines to match the steps and restart, or make the whole family heavier? Only the toolbar's drag handle and Disconnect stay stock.
  - `testing-run-all-icon` is a filled triangle with an open chevron ahead of it, not Codicon's second outline offset down and left (which these 2:3 sides cannot fit with 1 unit of clearance). Keep?
- Choices the author may overrule: the stack-frame pointer is larger than the 8-unit signal keyline (x2-15, y3-13), because it has to hold the 4×4 overlay dot with 1 unit of clearance; the steps use a 3×3 moon on pixel column 7 (x6-9), not the 4×4 overlay dot centred on 8, so the moon lines up with the arrow stems; the unverified ring has six round-ended dashes (eight read as a faint dotted ring at 16px, four as a ring with notches); the log diamond spans 3-13 and has the moon's area; the passed-test check is cut out 2.12 across and meets the 2-unit minimum, unlike the gate-2 ✕ exception.
- Known and not fixable by the theme: whenever a stop is not in column 1, VS Code adds an inline stack-frame arrow before the stopped column, and it is always the stock Codicon (spec 5.2). That includes the first statement of an indented line, where the arrow sits in the indentation, so it shows on most stops inside a function body. The themed frame shows in the gutter only. This bears on spec section 1's "no stock Codicon visible" criterion.

- [ ] **Step 8: Snapshot the tree**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_9`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_9`.

---

---

## Part D: review gate 3 (harness and run)

### How each gate-3 ID is brought on screen (checked in VS Code 1.141 while writing this part)

Each row was checked in the 1.141 bundle (`workbench.desktop.main.js`, `.css`) and then in dry runs of the gate-3 job at 100% and 200% (see Task 10 Step 6). "Class" is what the job's non-optional waits match.

| ID | Where 1.141 draws it | Class waited for | Scene |
| :- | :- | :- | :- |
| `markers-view-icon`, `output-view-icon`, `debug-console-view-icon` | View-container icons. The panel draws them only when its tabs show icons (`workbench.panel.showLabels: false`, a scene setting) | `.part.panel .codicon-<id>` | `panel-icons` |
| `panel-maximize` | Panel title, Toggle Maximized Panel (same icon when toggled) | `.part.panel .codicon-panel-maximize` | `panel-icons` |
| `filter` | Problems filter box, the More Filters button (`submenu.view.filter`, icon `Codicon.filter`) | `.part.panel .codicon-filter` | `panel-icons` |
| `clear-all` | Output title, Clear Output (`workbench.output.action.clearOutput`, icon `Codicon.clearAll`). The Debug Console's clear button is `debug-console-clear-all` (unpinned, default `clear-all`, so it shows the same drawing) | `.part.panel .codicon-clear-all` | `output` |
| `notifications-clear-all` | Notification centre header | `.notifications-center.visible .codicon-notifications-clear-all` | `notifications-center` |
| `trash` | Terminal title, Kill Terminal (the view-title action uses `Codicon.trash` directly) | `.part.panel .codicon-trash` | `terminal` |
| `terminal-kill` | Terminal quick access (`term ` prefix): the kill button on each terminal entry; the focused entry shows its buttons | `.quick-input-widget .codicon-terminal-kill` | `terminal-picker` |
| `debug-breakpoint` (batch 1), `-disabled`, `-log`, `-log-disabled`, `-conditional` | Glyph margin and the Breakpoints view, from `review/helper-extension/breakpoints.json` | `.part.editor .margin .codicon-<id>` | `breakpoints` |
| `debug-hint` | Glyph margin under the pointer (`breakpoint-helper-decoration`), on a line without a breakpoint | `.part.editor .margin .codicon-debug-hint` after a `hover` step | `breakpoints` |
| `debug-start` | Run and Debug view title, next to the launch configuration | `.part.sidebar .codicon-debug-start` | `breakpoints` |
| `debug-breakpoint-unverified` | A breakpoint in `unbrewed.js`, which the program never loads: js-debug leaves it unbound during the session. Shown in the Breakpoints view, which is on screen at 200% only because the scenes hide Variables and Watch first | the icon inside its pane body and inside `.part.sidebar` (not just in the DOM) | `debug-stopped` |
| `debug-stackframe`, `debug-stackframe-dot` | Stopped on the plain breakpoint in `stir`: one glyph-margin element carries both classes, and CSS draws the dot as `::after` (`.codicon-debug-breakpoint.codicon-debug-stackframe::after`) | `.part.editor .margin .codicon-debug-breakpoint.codicon-debug-stackframe` | `debug-stopped` |
| `debug-continue`, `-step-over`, `-step-into`, `-step-out`, `-restart` | Floating debug toolbar (`debug.toolBarLocation` default `floating`) | `.debug-toolbar .codicon-<id>` | `debug-stopped` |
| `debug-stop` | The floating toolbar shows Disconnect (`debug-disconnect`, unpinned) for js-debug's child session, with Stop as its Alt alternative and in its dropdown (a menu entry without an icon). The gate shows Stop's icon in the Call Stack: the launch session row's inline actions, which appear while the row is hovered | `.part.sidebar .debug-call-stack .monaco-list-row:hover .codicon-debug-stop` after a `hover` step | `debug-stopped` |
| `debug-stackframe-focused` (+ dot) | Call Stack Down focuses the caller (line 11), which holds the conditional breakpoint | `.part.editor .margin .codicon-debug-breakpoint-conditional.codicon-debug-stackframe-focused` | `debug-focused` |
| `debug-pause` | Floating toolbar while running (all breakpoints disabled, then Continue; the fixture keeps running on a timer) | `.debug-toolbar .codicon-debug-pause` | `debug-running` |
| `testing-run-all-icon` | Testing view title, Run Tests | `.part.sidebar .codicon-testing-run-all-icon` | `testing` |
| `testing-run-icon` | Gutter of `brews.spec.js` before a run (two helper tests with a location) | `.part.editor .margin .codicon-testing-run-icon` | `testing` |
| `testing-passed-icon` | Test Explorer rows and the gutter after Run All | sidebar and `.part.editor .margin .codicon-testing-passed-icon` | `testing-results` |
| `run` | No surface reachable in the review profile draws `codicon-run`. The terminal title's and terminal editor's Run Active File actions are hidden by default; the terminal quick-fix list, the walkthrough accessible view and the npm scripts view need states the fixture does not have. `testing-run-icon` (default `run`) shows the same drawing in the gutter | none. The icon sheet renders the first ID of each drawing, so it shows `codicon-run` only if `run` is listed first (the brief lists `play-outline` as `run, testing-run-icon`) | `icon-sheet` |
| `debug-breakpoint-conditional-disabled`, `debug-breakpoint-conditional-unverified` | Never drawn in 1.141: `L6` (getBreakpointMessageAndIcon) builds the icon family as data, function, log or plain, and reads the conditional family only for its regular icon, so a disabled conditional breakpoint shows `debug-breakpoint-disabled` and an unverified one `debug-breakpoint-unverified` | none. The icon sheet shows their drawings under each drawing's first ID (`moon-equals` under `debug-breakpoint-conditional`, `dashed-ring` under `debug-breakpoint-unverified`), not these IDs' own classes | `icon-sheet` |

Findings that shaped the harness:

- The Debug Console prints the launch command, `"<Windows user directory>\AppData\Local\Temp\spellbound-review\<run>\workspace\.vscode\code-node.cmd" .\debug-target.js`, so every `full.png` of a debug scene shows the Windows user name. Raw captures are never committed. No committed crop includes the Debug Console body: `debug-stopped` crops only the panel title (`.part.panel > .title`), and `output` crops only the title too, because Output channels log workspace paths. Task 11 scans every committed sheet with `scripts/review/privacy-scan.mjs`. While writing this part, the scanner flagged the `full.png` and passed the `panel-title` crop of the same capture.
- Before the debug batch is mapped, the stopped line mixes fonts: the element carries the batch-1 `debug-breakpoint` class (the product font) and the stock `debug-stackframe` class, so only the `::after` dot rendered in the dry run. Once Part C maps the debug IDs, both rules use the product font.
- Gate 2's terminal profile (`-NoLogo` only) loaded the author's PowerShell profile, which decided what the committed prompt showed. With `-NoProfile`, VS Code stops injecting shell integration (1.141 `ptyHostMain.js` injects only when the args are empty or `-NoLogo`), so the profile defines a fixed prompt (`PS workspace> `) and dot-sources `shellIntegration.ps1` itself. Both decorations still appear (checked in the dry run).
- With the chat input focused, the terminal chord opened nothing at gate 2. The gate-3 terminal scene first runs Focus Active Editor Group; in a dry run that started with `--scenes=terminal,...` (no earlier scene), the terminal opened.
- The icon sheet: at gate 2 the maximized panel at 200% sat between the side bar and the chat bar (428 CSS px), so the third view was off its right edge. Measured at 200% with both side bars closed: the panel is 904 CSS px wide, a view is 228 px wide whatever the number of views (five views overflowed by 236 px; four by 10), and a view's list is 382 px tall, 17 rows of 22 px. So 71 drawings cannot fit one 200% screenshot. The helper now shows three views of 17 rows, 51 drawings a page, with "page N of M" in every view header; gate 3 has one scene per page (`icon-sheet`, `icon-sheet-2`), and each waits (not optionally) for its page and until no view scrolls and every row icon lies inside the panel. Checked with the sheet padded to 71 rows at 100% and 200%.
- The pointer: a `hover` step leaves the pointer where it put it, and at the first dry run it stayed on the Call Stack row for every later scene. The icon sheet then showed a hover-highlighted row with a tooltip over the next one, and a Call Stack frame's tooltip is an absolute path, which holds the Windows user directory. Now every scene that hovers raises `workbench.hover.delay` and `workbench.hover.reducedDelay` (scene settings), so no tooltip appears over its own captures, and ends with a teardown that parks the pointer on an empty stretch of the status bar and waits until no tooltip is shown. `capture.mjs` also waits, before every screenshot, until no `.workbench-hover`/`.monaco-hover` is visible. The hover point goes to CDP unscaled in both capture modes: in a zoom-mode run at 200%, the point scaled by the zoom factor missed the glyph margin and the unscaled one reached it.
- The Breakpoints view at 200%: the Run view ended at Call Stack, so the Breakpoints rows were off screen while the DOM-only wait passed. The breakpoints scene now hides Variables and Watch (one `runCommands` chord) right after opening the Run view, and the waits require each breakpoint icon to lie inside its pane body and the side bar. Measured at 200%: Call Stack and Breakpoints both fit, with the unverified row at 458-477 px in a pane that ends at 478 px. Loaded Scripts is left alone: 1.141 shows it only while a session supports loaded scripts (`when` on the loaded-scripts context), collapsed to its header, so a toggle before the session cannot hide it; with that header on screen the Breakpoints rows still fit at 200%.
- Toggling `workbench.panel.showLabels` (the `panel-icons` scene) left the next scene's panel title with overlapping tabs and actions at 200% (the composite bar did not recompute its overflow). `panel-icons` therefore runs last.

### Task 10: Gate-3 scenes: panel, debug and testing states, scene settings, pointer steps that clean up after themselves

**Files:**
- Create: `review/jobs/gate-3.json`, `review/helper-extension/breakpoints.json`, `review/workspace/unbrewed.js`, `review/workspace/brews.spec.js`
- Modify: `scripts/review/capture.mjs` (scene settings, `hover` step, a no-tooltip wait before every screenshot), `review/helper-extension/{extension.js,package.json,README.md}` (breakpoints command, located tests, version 0.0.4), `review/profile/keybindings.json` (12 chords), `review/workspace/debug-target.js` (lines 7-17 appended; lines 1-6, which gate 1 quick-opens, unchanged), `test/review-harness.test.mjs`

**Interfaces:**
- Consumes:
  - Task 3: `spellboundReview.iconSheetPage` and `ctrl+alt+shift+F4`, the `page N of M` view descriptions, `ctrl+alt+shift+a`, the profile-free PowerShell profile, `--scales`/`--scenes`, `privacy-scan.mjs`.
  - Parts B and C: only the map (`icons/product-icon-map.json`; 71 drawings, so the sheet has two pages) and the batch fields of `icons/product-icon-ids.json`. Every wait matches a codicon class, which the stock icons carry too.
- Produces:
  - `review/jobs/gate-3.json`: 13 scenes in this order: output, notifications-center, terminal, terminal-picker, breakpoints, debug-stopped, debug-focused, debug-running, testing, testing-results, icon-sheet, icon-sheet-2, panel-icons. It has 20 `commitSheets` and a `variants` pass over the four debug scenes and both icon-sheet pages, which `run-gate.mjs` drops when `icons/product-src-variants/` is empty.
  - Job schema read by `capture.mjs`:
    - `scene.settings`, applied before the setup and to every capture of the scene. Every scene's setup now starts in the first theme.
    - the step `{ "hover": "<expression returning { x, y } in CSS px>" }`. It moves the pointer there (unscaled in both capture modes; checked in zoom mode too), and the pointer stays until a later hover step moves it.
  - Pointer hygiene, pinned by a test over every gate job: a scene that hovers sets `workbench.hover.delay` and `workbench.hover.reducedDelay` to 600000 in its `settings`, so no tooltip appears over its captures, and ends its teardown with a `hover` that parks the pointer on the widest empty stretch of the status bar, then a wait until no `.workbench-hover`/`.monaco-hover` is visible. `capture.mjs` also waits, before every screenshot, until no tooltip is visible (10 s, then the run stops).
  - The Breakpoints view on screen: the breakpoints scene hides Variables and Watch (`ctrl+alt+shift+F11`, a `runCommands` chord) right after opening the Run view. The breakpoint waits of the breakpoints and debug-stopped scenes check that each icon lies inside its pane body and the side bar.
  - Helper command `spellboundReview.breakpoints`, which sets `breakpoints.json` and replaces any existing breakpoints. Two located helper tests in `brews.spec.js`.
  - Chords:

    | Chord (`ctrl+alt+shift+`) | Action |
    | :- | :- |
    | `i` | set the breakpoints |
    | `z` | quick open `brews.spec.js` |
    | `F1` | Call Stack Down |
    | `F2` | Continue |
    | `F3` | Disable All Breakpoints |
    | `F5` | show the notification centre |
    | `F6` | clear all notifications |
    | `F7` | toggle Output |
    | `F8` | close the side bar |
    | `F9` | close the secondary side bar |
    | `F10` | quick open `term ` (terminal quick access) |
    | `F11` | `runCommands`: hide the Variables and Watch views |

- [ ] **Step 1: Write the failing tests**

```bash
git apply <<'PATCH'
diff --git a/test/review-harness.test.mjs b/test/review-harness.test.mjs
index c0f66ac..5a7dcef 100644
--- a/test/review-harness.test.mjs
+++ b/test/review-harness.test.mjs
@@ -11,13 +11,14 @@ const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
 const json = (file) => JSON.parse(read(file));
 const exists = (file) => fs.existsSync(path.join(root, file));
 
-const GATES = ['review/jobs/gate-1.json', 'review/jobs/gate-2.json'];
+const GATES = ['review/jobs/gate-1.json', 'review/jobs/gate-2.json', 'review/jobs/gate-3.json'];
 const JOBS = [...GATES, 'review/jobs/smoke.json'];
 const PLAIN_KEYS = new Set(['Enter', 'Escape', 'Tab', 'Backspace']);
 
 test('every file the harness needs exists', () => {
   for (const file of [
     'review/workspace/spells.ts', 'review/workspace/debug-target.js', 'review/workspace/notes.md', 'review/workspace/README.md',
+    'review/workspace/unbrewed.js', 'review/workspace/brews.spec.js', 'review/helper-extension/breakpoints.json',
     'review/workspace/.vscode/launch.json', 'review/profile/settings.base.json', 'review/profile/keybindings.json',
     'review/helper-extension/package.json', 'review/helper-extension/extension.js', 'review/helper-extension/README.md',
     'review/helper-extension/media/sheet.svg', ...JOBS,
@@ -43,7 +44,7 @@ test('job files follow the schema and press only bound chords or plain keys', ()
     for (const scene of job.scenes) {
       assert.ok(scene.crops?.length, `${file} ${scene.name} has no crops`);
       for (const step of [...(scene.setup ?? []), ...(scene.teardown ?? [])]) {
-        assert.ok(step.press || step.insert || step.waitFor || step.wait, `${file} ${scene.name}: empty step`);
+        assert.ok(step.press || step.insert || step.hover || step.waitFor || step.wait, `${file} ${scene.name}: empty step`);
         if (step.press) assert.ok(bound.has(step.press) || PLAIN_KEYS.has(step.press), `${file} ${scene.name}: ${step.press} is not bound`);
       }
     }
@@ -306,3 +307,149 @@ test('every PowerShell terminal scene focuses the editor group before opening th
     assert.ok(focus >= 0 && focus < presses.indexOf(opens), scene.name);
   }
 });
+
+// ---- Gate 3: panel and debug batches ----
+// Batch IDs whose own class no gate scene can wait for. The gate shows their drawings only: in context through the IDs
+// that share them, and in the icon sheet, which renders the first ID of each drawing (run-gate.mjs writes ids[0]).
+const NOT_IN_CONTEXT = {
+  run: 'no 1.141 surface reachable in the review profile draws codicon-run (the terminal title Run Active File action is '
+    + 'hidden by default); testing-run-icon, on the same drawing, is waited for in the gutter',
+  // 1.141 L6 (getBreakpointMessageAndIcon) builds the icon family as data, function, log or plain; the conditional
+  // family is only read for its regular icon, so a disabled or unverified conditional breakpoint takes the plain icon.
+  'debug-breakpoint-conditional-disabled': 'never drawn in 1.141: a disabled conditional breakpoint shows debug-breakpoint-disabled',
+  'debug-breakpoint-conditional-unverified': 'never drawn in 1.141: an unverified conditional breakpoint shows debug-breakpoint-unverified',
+};
+// The stackframe dot has no element of its own: CSS draws it (::after) on a glyph that is both a breakpoint and a frame.
+const OVERLAYS = {
+  'debug-stackframe-dot': ['codicon-debug-breakpoint.codicon-debug-stackframe', 'codicon-debug-breakpoint-conditional.codicon-debug-stackframe-focused'],
+};
+
+test('gate 3 waits, without an optional step, for every panel and debug ID, or names why it cannot', () => {
+  const job = json('review/jobs/gate-3.json');
+  const waits = job.scenes.flatMap((scene) => (scene.setup ?? []).filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''))).join(' ');
+  const { ids } = json('icons/product-icon-ids.json');
+  const batchIds = Object.entries(ids).filter(([, entry]) => ['panel', 'debug'].includes(entry.batch)).map(([id]) => id);
+  assert.equal(batchIds.length, 32);
+  for (const id of batchIds) {
+    if (id in NOT_IN_CONTEXT) continue;
+    for (const selector of OVERLAYS[id] ?? [`codicon-${id}`]) {
+      assert.match(waits, new RegExp(`${selector.replace(/\./g, '\\.')}(?![\\w-])`), `${id}: ${selector}`);
+    }
+  }
+});
+
+test('gate 3 shows the panel tab icons through a scene setting that holds for the setup and every capture', () => {
+  // output-view-icon, debug-console-view-icon and markers-view-icon are view-container icons: the panel draws them only
+  // when its tabs show icons (workbench.panel.showLabels false). capture.mjs applies scene.settings before the setup.
+  const scene = json('review/jobs/gate-3.json').scenes.find((candidate) => candidate.name === 'panel-icons');
+  assert.deepEqual(scene.settings, { 'workbench.panel.showLabels': false });
+  const source = read('scripts/review/capture.mjs');
+  const loop = source.slice(source.indexOf('for (const scene of job.scenes'));
+  assert.ok(loop.indexOf('settingsFor(job.themes[0], sceneSettings)') < loop.indexOf('for (const step of scene.setup'), 'scene settings are written before the setup');
+  assert.match(loop, /settingsFor\(theme, \{ \.\.\.sceneSettings, \.\.\.variant\.settings \}\)/, 'and kept for every capture');
+});
+
+test('gate 3 reaches debug-hint by moving the pointer onto the glyph margin', () => {
+  const scene = json('review/jobs/gate-3.json').scenes.find((candidate) => candidate.name === 'breakpoints');
+  const hover = scene.setup.findIndex((step) => step.hover);
+  assert.ok(hover >= 0, 'a hover step');
+  assert.match(scene.setup[hover].hover, /\.glyph-margin/);
+  assert.ok(scene.setup.slice(hover + 1).some((step) => !step.optional && String(step.waitFor).includes('codicon-debug-hint')), 'then waits for the hint');
+  assert.match(read('scripts/review/capture.mjs'), /Input\.dispatchMouseEvent', \{ type: 'mouseMoved'/);
+});
+
+test('the gate 3 breakpoint plan sets each breakpoint kind 1.141 draws once, on code, and stops where the stackframe overlays need it', () => {
+  const plan = json('review/helper-extension/breakpoints.json').breakpoints;
+  const kinds = plan.map((breakpoint) => breakpoint.icon);
+  assert.deepEqual([...kinds].sort(), ['debug-breakpoint', 'debug-breakpoint-conditional', 'debug-breakpoint-disabled',
+    'debug-breakpoint-log', 'debug-breakpoint-log-disabled', 'debug-breakpoint-unverified']);
+  for (const { file, line, icon, enabled = true, condition, logMessage } of plan) {
+    const source = read(`review/workspace/${file}`).split('\n');
+    assert.ok(source[line - 1]?.trim() && !source[line - 1].trim().startsWith('//'), `${icon}: line ${line} of ${file} is code`);
+    assert.equal(enabled, !icon.endsWith('-disabled'), `${icon}: enabled`);
+    assert.equal(Boolean(condition), icon.includes('conditional'), `${icon}: condition`);
+    assert.equal(Boolean(logMessage), icon.includes('-log'), `${icon}: log message`);
+  }
+  // The only enabled plain breakpoint is inside stir (the top frame stops on it); its caller holds the conditional one,
+  // whose condition is false, so Call Stack Down focuses a conditional breakpoint line without ever stopping on it.
+  const target = read('review/workspace/debug-target.js').split('\n');
+  const stop = plan.find((breakpoint) => breakpoint.icon === 'debug-breakpoint');
+  const caller = plan.find((breakpoint) => breakpoint.icon === 'debug-breakpoint-conditional');
+  assert.equal(stop.file, 'debug-target.js');
+  assert.match(target.slice(0, stop.line - 1).reverse().find((text) => /^\S/.test(text)), /^function stir\(/, 'the plain breakpoint is inside stir');
+  assert.match(target[caller.line - 1], /stir\(/, 'the conditional breakpoint is on the call');
+  assert.match(caller.condition, /^brewed < 0$/, 'a condition that is false in the fixture');
+  assert.ok(!read('review/workspace/debug-target.js').includes('unbrewed'), 'debug-target.js never loads unbrewed.js');
+  // The keep-alive timer (Pause needs a running program) must end on its own if Stop misses the process.
+  assert.match(read('review/workspace/debug-target.js'), /clearInterval\(alive\)/);
+  assert.doesNotMatch(read('review/workspace/debug-target.js'), /setInterval\(\(\) => \{\}/);
+  assert.ok(plan.filter((breakpoint) => breakpoint.icon.endsWith('-unverified')).every((breakpoint) => breakpoint.file === 'unbrewed.js'));
+  const helper = read('review/helper-extension/extension.js');
+  assert.match(helper, /require\('\.\/breakpoints\.json'\)/);
+  assert.match(helper, /removeBreakpoints\(vscode\.debug\.breakpoints\)/, 'the command replaces earlier breakpoints');
+});
+
+test('gate 3 captures one icon-sheet scene per page, each checking on screen that every row is visible', () => {
+  // The helper pages the sheet (51 drawings a page at 200%); each scene waits for its page and until no view scrolls and
+  // every row icon lies inside the panel. Both side bars are closed first, so the panel has its full width.
+  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
+  const scenes = json('review/jobs/gate-3.json').scenes.filter((scene) => scene.name.startsWith('icon-sheet'));
+  assert.deepEqual(scenes.map((scene) => scene.name), ['icon-sheet', 'icon-sheet-2']);
+  const presses = scenes[0].setup.map((step) => step.press);
+  const maximize = keyOf('workbench.action.toggleMaximizedPanel');
+  for (const command of ['workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar']) {
+    assert.ok(presses.indexOf(keyOf(command)) >= 0 && presses.indexOf(keyOf(command)) < presses.indexOf(maximize), `runs ${command} before maximizing`);
+  }
+  assert.equal(scenes[1].setup[0].press, keyOf('spellboundReview.iconSheetPage'), 'the second scene turns the page');
+  scenes.forEach((scene, index) => {
+    const waits = scene.setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''));
+    assert.ok(waits.some((wait) => wait.includes(`'page ${index + 1} of 2'`)), `${scene.name} waits for page ${index + 1}`);
+    const check = waits.find((wait) => wait.includes('.monaco-list-rows'));
+    assert.ok(check, `${scene.name} waits, not optionally, until every row is visible`);
+    assert.match(check, /lists\.length === 3/);
+    assert.match(check, /rows\.offsetHeight <= list\.clientHeight/, 'no view scrolls');
+    assert.match(check, /r\.right <= box\.right/, 'every row icon is inside the panel');
+  });
+});
+
+test('every scene that moves the pointer parks it on the status bar and waits for tooltips to close before the next scene', () => {
+  // Gate-3 dry run 2026-10-10T13-37-53: the pointer left on the Call Stack row stayed there for every later scene, so the
+  // icon sheet showed a hover-highlighted row and its tooltip. A Call Stack frame's tooltip is an absolute path, which
+  // holds the Windows user directory.
+  const scenes = GATES.flatMap((file) => json(file).scenes.map((scene) => ({ file, scene })))
+    .filter(({ scene }) => [...(scene.setup ?? []), ...(scene.teardown ?? [])].some((step) => step.hover));
+  assert.ok(scenes.length >= 2);
+  for (const { file, scene } of scenes) {
+    const [park, wait] = (scene.teardown ?? []).slice(-2);
+    assert.match(String(park?.hover), /\.part\.statusbar/, `${file} ${scene.name}: the teardown parks the pointer on the status bar`);
+    assert.ok(wait && !wait.optional && /\.workbench-hover, \.monaco-hover/.test(String(wait.waitFor)), `${file} ${scene.name}: then waits for tooltips to close`);
+    for (const key of ['workbench.hover.delay', 'workbench.hover.reducedDelay']) {
+      assert.ok(scene.settings?.[key] >= 60000, `${file} ${scene.name}: ${key} keeps tooltips off its own captures`);
+    }
+  }
+  const capture = read('scripts/review/capture.mjs');
+  const shot = capture.indexOf("await shoot('full')");
+  assert.ok(capture.lastIndexOf("label: 'hover tooltips to close'", shot) > capture.lastIndexOf('await delay(1500)', shot), 'every screenshot waits for tooltips to close');
+  // The hover point goes to CDP unscaled in both capture modes (measured in a zoom-mode run at 200%).
+  assert.match(capture, /dispatchMouseEvent', \{ type: 'mouseMoved', x, y \}/);
+});
+
+test('the Breakpoints view is on screen where gate 3 claims it: other Run views hidden, waits check the viewport', () => {
+  // Gate-3 dry run 2026-10-10T13-37-53: at 200% the Run view ended at Call Stack and the Breakpoints rows were out of view,
+  // although the waits (which only checked the DOM) passed.
+  const bindings = json('review/profile/keybindings.json');
+  const hide = bindings.find((binding) => binding.command === 'runCommands' && binding.args.commands.includes('workbench.debug.variablesView.toggleVisibility'));
+  assert.deepEqual(hide.args.commands, ['workbench.debug.variablesView.toggleVisibility', 'workbench.debug.watchExpressionsView.toggleVisibility']);
+  const scenes = json('review/jobs/gate-3.json').scenes;
+  const presses = scenes.find((scene) => scene.name === 'breakpoints').setup.map((step) => step.press);
+  assert.equal(presses.indexOf(hide.key), presses.indexOf(keyOfDebugView()) + 1, 'the views are hidden right after the Run view opens');
+  for (const [name, selectors] of [['breakpoints', ['debug-breakpoint', 'debug-breakpoint-disabled', 'debug-breakpoint-log', 'debug-breakpoint-log-disabled', 'debug-breakpoint-conditional']],
+    ['debug-stopped', ['debug-breakpoint-unverified']]]) {
+    const waits = scenes.find((scene) => scene.name === name).setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''));
+    const check = waits.find((wait) => wait.includes('.debug-breakpoints'));
+    assert.ok(check, `${name} waits for the Breakpoints view`);
+    assert.match(check, /inside\(r, body\) && inside\(r, side\)/, `${name}: inside its pane and the side bar, not just in the DOM`);
+    for (const id of selectors) assert.ok(check.includes(`'.codicon-${id}'`), `${name}: ${id}`);
+  }
+  function keyOfDebugView() { return bindings.find((binding) => binding.command === 'workbench.view.debug').key; }
+});
PATCH
```

What the patch does:
- adds gate 3 to `GATES`, so Task 3's icon-sheet and terminal-focus tests now cover it too;
- lists the new fixture files;
- lets a step be a `hover`;
- adds seven gate-3 tests:
  - coverage of every `panel` and `debug` ID (`OVERLAYS` names the two class pairs on which CSS draws `debug-stackframe-dot`);
  - scene settings;
  - the `debug-hint` hover;
  - the breakpoint plan, including a keep-alive timer that ends on its own;
  - one icon-sheet scene per page;
  - pointer hygiene: every hovering scene parks the pointer and waits for tooltips, sets the hover delays, and every screenshot waits for tooltips;
  - the Breakpoints view: the hide chord, its place in the breakpoints scene, and visibility (not existence) waits.
  `NOT_IN_CONTEXT` names the three batch IDs whose own class no scene can wait for, with the reason, and the comment says what the gate shows instead: their drawings, through the IDs that share them and in the icon sheet (which renders each drawing's first ID).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/review-harness.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected:

```
ℹ tests 28
ℹ pass 16
ℹ fail 12
```

The twelve failures (`--test-reporter=tap … | grep '^not ok'`):
- `every file the harness needs exists`
- `job files follow the schema and press only bound chords or plain keys`
- `every committed sheet is one the gate job produces`
- `the icon sheet shows every drawing at 200%: pages of three views of 17 rows`
- `every PowerShell terminal scene focuses the editor group before opening the terminal`
- `gate 3 waits, without an optional step, for every panel and debug ID, or names why it cannot`
- `gate 3 shows the panel tab icons through a scene setting that holds for the setup and every capture`
- `gate 3 reaches debug-hint by moving the pointer onto the glyph margin`
- `the gate 3 breakpoint plan sets each breakpoint kind 1.141 draws once, on code, and stops where the stackframe overlays need it`
- `gate 3 captures one icon-sheet scene per page, each checking on screen that every row is visible`
- `every scene that moves the pointer parks it on the status bar and waits for tooltips to close before the next scene`
- `the Breakpoints view is on screen where gate 3 claims it: other Run views hidden, waits check the viewport`

The first five fail because `review/jobs/gate-3.json` does not exist yet.

- [ ] **Step 3: Add the gate-3 job, the breakpoint plan and the two fixture files**

Create `review/jobs/gate-3.json`:

```json
{
  "expectVersion": "1.141.0",
  "port": 9333,
  "mode": "device-scale",
  "helperVsix": "spellbound-review-helper.vsix",
  "passes": [
    { "name": "main", "vsix": ["spellbound-main.vsix"], "scales": [1, 1.25, 1.5, 2] },
    { "name": "variants", "vsix": ["spellbound-variants.vsix"], "scales": [1, 2], "scenes": ["breakpoints", "debug-stopped", "debug-focused", "debug-running", "icon-sheet", "icon-sheet-2"] }
  ],
  "scenes": [
    {
      "name": "output",
      "setup": [
        { "press": "ctrl+alt+shift+F7", "wait": 1500 },
        { "waitFor": "!!document.querySelector('.part.panel .codicon-clear-all')", "timeout": 10000 }
      ],
      "crops": [
        { "name": "title", "selector": ".part.panel > .title" }
      ],
      "teardown": [
        { "press": "ctrl+alt+shift+e", "wait": 800 }
      ]
    },
    {
      "name": "notifications-center",
      "setup": [
        { "press": "ctrl+alt+shift+0", "wait": 1000 },
        { "press": "ctrl+alt+shift+F5", "wait": 1000 },
        { "waitFor": "!!document.querySelector('.notifications-center.visible .codicon-notifications-clear-all')", "timeout": 10000 }
      ],
      "crops": [
        { "name": "list", "selector": ".notifications-center" }
      ],
      "teardown": [
        { "press": "ctrl+alt+shift+F6", "wait": 500 },
        { "press": "Escape", "wait": 500 }
      ]
    },
    {
      "name": "terminal",
      "setup": [
        { "press": "ctrl+alt+shift+a", "wait": 500 },
        { "press": "ctrl+alt+shift+p", "wait": 8000 },
        { "press": "ctrl+alt+shift+m", "wait": 1500 },
        { "press": "ctrl+alt+shift+s", "wait": 2500 },
        { "press": "ctrl+alt+shift+x", "wait": 2500 },
        { "waitFor": "!!document.querySelector('.terminal-command-decoration.codicon-terminal-decoration-success') && !!document.querySelector('.terminal-command-decoration.codicon-terminal-decoration-error')", "timeout": 30000 },
        { "waitFor": "!!document.querySelector('.part.panel .codicon-trash')", "timeout": 10000 }
      ],
      "crops": [
        { "name": "panel", "selector": ".part.panel" }
      ],
      "teardown": [
        { "press": "ctrl+alt+shift+m", "wait": 800 },
        { "press": "ctrl+alt+shift+e" }
      ]
    },
    {
      "name": "terminal-picker",
      "setup": [
        { "press": "ctrl+alt+shift+F10", "wait": 1200 },
        { "waitFor": "!!document.querySelector('.quick-input-widget .codicon-terminal-kill')", "timeout": 10000 }
      ],
      "crops": [
        { "name": "widget", "selector": ".quick-input-widget" }
      ],
      "teardown": [
        { "press": "Escape", "wait": 500 }
      ]
    },
    {
      "name": "breakpoints",
      "settings": { "workbench.hover.delay": 600000, "workbench.hover.reducedDelay": 600000 },
      "setup": [
        { "press": "ctrl+alt+shift+5", "wait": 800 },
        { "press": "ctrl+alt+shift+F11", "wait": 800 },
        { "press": "ctrl+alt+shift+i", "wait": 1000 },
        { "press": "ctrl+alt+shift+q", "wait": 800 },
        { "press": "Enter", "wait": 1500 },
        { "waitFor": "!!document.querySelector('.part.editor .margin .codicon-debug-breakpoint') && !!document.querySelector('.part.editor .margin .codicon-debug-breakpoint-disabled') && !!document.querySelector('.part.editor .margin .codicon-debug-breakpoint-conditional') && !!document.querySelector('.part.editor .margin .codicon-debug-breakpoint-log') && !!document.querySelector('.part.editor .margin .codicon-debug-breakpoint-log-disabled')", "timeout": 20000 },
        { "waitFor": "(() => { const inside = (r, box) => r.top >= box.top && r.bottom <= box.bottom && r.left >= box.left && r.right <= box.right; const side = document.querySelector('.part.sidebar')?.getBoundingClientRect(); return !!side && ['.codicon-debug-breakpoint', '.codicon-debug-breakpoint-disabled', '.codicon-debug-breakpoint-log', '.codicon-debug-breakpoint-log-disabled', '.codicon-debug-breakpoint-conditional'].every((selector) => [...document.querySelectorAll(`.part.sidebar .debug-breakpoints ${selector}`)].some((el) => { const r = el.getBoundingClientRect(); const body = el.closest('.pane-body')?.getBoundingClientRect(); return r.width > 0 && !!body && inside(r, body) && inside(r, side); })); })()", "timeout": 10000 },
        { "waitFor": "!!document.querySelector('.part.sidebar .codicon-debug-start')", "timeout": 10000 },
        { "hover": "(() => { const editor = document.querySelector('.part.editor .monaco-editor'); const line = [...(editor?.querySelectorAll('.margin .line-numbers') ?? [])].find((el) => el.textContent.trim() === '12'); const glyphs = editor?.querySelector('.margin .glyph-margin'); if (!line || !glyphs) return null; const a = line.getBoundingClientRect(); const b = glyphs.getBoundingClientRect(); return b.width ? { x: b.x + b.width / 2, y: a.y + a.height / 2 } : null; })()" },
        { "waitFor": "!!document.querySelector('.part.editor .margin .codicon-debug-hint')", "timeout": 10000 }
      ],
      "crops": [
        { "name": "code", "selector": ".part.editor .monaco-editor", "maxHeight": 300 },
        { "name": "sidebar", "selector": ".part.sidebar" }
      ],
      "teardown": [
        { "hover": "(() => { const bar = document.querySelector('.part.statusbar'); if (!bar) return null; const box = bar.getBoundingClientRect(); const items = [...bar.querySelectorAll('.statusbar-item')].map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0).sort((a, b) => a.left - b.left); let best = null; let from = box.left; for (const r of [...items, { left: box.right, right: box.right }]) { if (!best || r.left - from > best.gap) best = { gap: r.left - from, x: (from + r.left) / 2 }; from = Math.max(from, r.right); } return best && best.gap >= 8 ? { x: best.x, y: box.top + box.height / 2 } : null; })()" },
        { "waitFor": "![...document.querySelectorAll('.workbench-hover, .monaco-hover')].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('.hidden'); })", "timeout": 10000 }
      ]
    },
    {
      "name": "debug-stopped",
      "settings": { "workbench.hover.delay": 600000, "workbench.hover.reducedDelay": 600000 },
      "setup": [
        { "press": "ctrl+alt+shift+3", "wait": 2000 },
        { "waitFor": "!!document.querySelector('.part.editor .margin .codicon-debug-breakpoint.codicon-debug-stackframe')", "timeout": 40000 },
        { "waitFor": "(() => { const inside = (r, box) => r.top >= box.top && r.bottom <= box.bottom && r.left >= box.left && r.right <= box.right; const side = document.querySelector('.part.sidebar')?.getBoundingClientRect(); return !!side && ['.codicon-debug-breakpoint-unverified'].every((selector) => [...document.querySelectorAll(`.part.sidebar .debug-breakpoints ${selector}`)].some((el) => { const r = el.getBoundingClientRect(); const body = el.closest('.pane-body')?.getBoundingClientRect(); return r.width > 0 && !!body && inside(r, body) && inside(r, side); })); })()", "timeout": 20000 },
        { "waitFor": "!!document.querySelector('.debug-toolbar .codicon-debug-continue') && !!document.querySelector('.debug-toolbar .codicon-debug-step-over') && !!document.querySelector('.debug-toolbar .codicon-debug-step-into') && !!document.querySelector('.debug-toolbar .codicon-debug-step-out') && !!document.querySelector('.debug-toolbar .codicon-debug-restart')", "timeout": 20000 },
        { "hover": "(() => { const row = [...document.querySelectorAll('.part.sidebar .debug-call-stack .monaco-list-row')].find((candidate) => candidate.querySelector('.session')); const label = row?.querySelector('.session .name') ?? row?.querySelector('.session'); if (!label) return null; const box = label.getBoundingClientRect(); return { x: box.left + Math.min(20, box.width / 2), y: box.top + box.height / 2 }; })()" },
        { "waitFor": "!!document.querySelector('.part.sidebar .debug-call-stack .monaco-list-row:hover .codicon-debug-stop')", "timeout": 10000 }
      ],
      "crops": [
        { "name": "code", "selector": ".part.editor .monaco-editor", "maxHeight": 300 },
        { "name": "sidebar", "selector": ".part.sidebar" },
        { "name": "toolbar", "selector": ".debug-toolbar" },
        { "name": "panel-title", "selector": ".part.panel > .title" }
      ],
      "teardown": [
        { "hover": "(() => { const bar = document.querySelector('.part.statusbar'); if (!bar) return null; const box = bar.getBoundingClientRect(); const items = [...bar.querySelectorAll('.statusbar-item')].map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0).sort((a, b) => a.left - b.left); let best = null; let from = box.left; for (const r of [...items, { left: box.right, right: box.right }]) { if (!best || r.left - from > best.gap) best = { gap: r.left - from, x: (from + r.left) / 2 }; from = Math.max(from, r.right); } return best && best.gap >= 8 ? { x: best.x, y: box.top + box.height / 2 } : null; })()" },
        { "waitFor": "![...document.querySelectorAll('.workbench-hover, .monaco-hover')].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('.hidden'); })", "timeout": 10000 }
      ]
    },
    {
      "name": "debug-focused",
      "setup": [
        { "press": "ctrl+alt+shift+F1", "wait": 1500 },
        { "waitFor": "!!document.querySelector('.part.editor .margin .codicon-debug-breakpoint-conditional.codicon-debug-stackframe-focused')", "timeout": 10000 }
      ],
      "crops": [
        { "name": "code", "selector": ".part.editor .monaco-editor", "maxHeight": 300 },
        { "name": "sidebar", "selector": ".part.sidebar" }
      ]
    },
    {
      "name": "debug-running",
      "setup": [
        { "press": "ctrl+alt+shift+F3", "wait": 800 },
        { "press": "ctrl+alt+shift+F2", "wait": 2000 },
        { "waitFor": "!!document.querySelector('.debug-toolbar .codicon-debug-pause')", "timeout": 10000 }
      ],
      "crops": [
        { "name": "toolbar", "selector": ".debug-toolbar" }
      ],
      "teardown": [
        { "press": "ctrl+alt+shift+t", "wait": 1500 },
        { "press": "ctrl+alt+shift+e", "wait": 500 }
      ]
    },
    {
      "name": "testing",
      "setup": [
        { "press": "ctrl+alt+shift+6", "wait": 1500 },
        { "press": "ctrl+alt+shift+z", "wait": 800 },
        { "press": "Enter", "wait": 2000 },
        { "waitFor": "!!document.querySelector('.part.sidebar .codicon-testing-run-all-icon')", "timeout": 10000 },
        { "waitFor": "!!document.querySelector('.part.editor .margin .codicon-testing-run-icon')", "timeout": 20000 }
      ],
      "crops": [
        { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 300 },
        { "name": "code", "selector": ".part.editor .monaco-editor", "maxHeight": 160 }
      ]
    },
    {
      "name": "testing-results",
      "setup": [
        { "press": "ctrl+alt+shift+r", "wait": 2500 },
        { "waitFor": "!!document.querySelector('.part.sidebar .codicon-testing-passed-icon') && !!document.querySelector('.part.editor .margin .codicon-testing-passed-icon')", "timeout": 20000 }
      ],
      "crops": [
        { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 300 },
        { "name": "code", "selector": ".part.editor .monaco-editor", "maxHeight": 160 }
      ],
      "teardown": [
        { "press": "ctrl+alt+shift+e", "wait": 500 }
      ]
    },
    {
      "name": "icon-sheet",
      "setup": [
        { "press": "ctrl+alt+shift+F8", "wait": 500 },
        { "press": "ctrl+alt+shift+F9", "wait": 500 },
        { "press": "ctrl+alt+shift+7", "wait": 1500 },
        { "press": "ctrl+alt+shift+m", "wait": 1500 },
        { "waitFor": "[...document.querySelectorAll('.part.panel .pane-header .description')].some((el) => el.textContent.trim() === 'page 1 of 2')", "timeout": 10000 },
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
        { "waitFor": "[...document.querySelectorAll('.part.panel .pane-header .description')].some((el) => el.textContent.trim() === 'page 2 of 2')", "timeout": 10000 },
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
    },
    {
      "name": "panel-icons",
      "settings": { "workbench.panel.showLabels": false },
      "setup": [
        { "press": "ctrl+alt+shift+o", "wait": 1500 },
        { "waitFor": "!!document.querySelector('.part.panel .codicon-markers-view-icon') && !!document.querySelector('.part.panel .codicon-output-view-icon') && !!document.querySelector('.part.panel .codicon-debug-console-view-icon')", "timeout": 20000 },
        { "waitFor": "!!document.querySelector('.part.panel .codicon-panel-maximize') && !!document.querySelector('.part.panel .codicon-filter')", "timeout": 10000 }
      ],
      "crops": [
        { "name": "title", "selector": ".part.panel > .title" },
        { "name": "panel", "selector": ".part.panel", "maxHeight": 200 }
      ],
      "teardown": [
        { "press": "ctrl+alt+shift+e", "wait": 800 }
      ]
    }
  ],
  "commitSheets": [
    "main-output-title", "main-notifications-center-list", "main-terminal-panel", "main-terminal-picker-widget",
    "main-breakpoints-code", "main-breakpoints-sidebar", "main-debug-stopped-code", "main-debug-stopped-sidebar",
    "main-debug-stopped-toolbar", "main-debug-stopped-panel-title", "main-debug-focused-code", "main-debug-running-toolbar",
    "main-testing-sidebar", "main-testing-code", "main-testing-results-sidebar", "main-testing-results-code",
    "main-icon-sheet-panel", "main-icon-sheet-2-panel", "main-panel-icons-title", "main-panel-icons-panel"
  ]
}
```

Create `review/helper-extension/breakpoints.json`:

```json
{
  "$comment": "Breakpoints spellboundReview.breakpoints sets for gate 3 (lines are 1-based; icon = the class VS Code 1.141 draws for it). Execution stops on the plain breakpoint in stir (line 9: debug-stackframe with the dot overlay); Call Stack Down then focuses the caller on line 11, whose conditional breakpoint never fires (debug-stackframe-focused with the dot overlay). unbrewed.js is never loaded, so its breakpoint shows as unverified during the session. 1.141 never draws debug-breakpoint-conditional-disabled or -conditional-unverified: a disabled or unverified conditional breakpoint gets the plain disabled or unverified icon (L6 in workbench.desktop.main.js), so the plan has no such breakpoint.",
  "breakpoints": [
    {"file": "debug-target.js", "line": 2, "enabled": false, "icon": "debug-breakpoint-disabled"},
    {"file": "debug-target.js", "line": 4, "enabled": false, "logMessage": "brewed {brewed}", "icon": "debug-breakpoint-log-disabled"},
    {"file": "debug-target.js", "line": 6, "logMessage": "brewed {brewed}", "icon": "debug-breakpoint-log"},
    {"file": "debug-target.js", "line": 9, "icon": "debug-breakpoint"},
    {"file": "debug-target.js", "line": 11, "condition": "brewed < 0", "icon": "debug-breakpoint-conditional"},
    {"file": "unbrewed.js", "line": 2, "icon": "debug-breakpoint-unverified"}
  ]
}
```

Create `review/workspace/unbrewed.js`:

```js
// Review fixture: debug-target.js never loads this file, so its breakpoints stay unverified (unbound) during a session.
const unbrewed = 'mandrake';
console.log(unbrewed);
```

Create `review/workspace/brews.spec.js`. It is not named `*.test.js` because `node --test` would pick that name up as a test file of this repository and fail on its undefined `test`.

```js
// Review fixture: the review helper reports these two tests (run icons in the gutter before a run, passed icons after it).
test('moonwater settles', () => {});
test('starlight glows', () => {});
```

- [ ] **Step 4: Apply the capture, helper, chord and fixture changes**

```bash
git apply <<'PATCH'
diff --git a/review/helper-extension/README.md b/review/helper-extension/README.md
index 78d418b..4e4d606 100644
--- a/review/helper-extension/README.md
+++ b/review/helper-extension/README.md
@@ -1,3 +1,3 @@
 # Spellbound review helper
 
-A throwaway extension installed only into the isolated review VS Code that `npm run review:gate` launches. It lists every mapped product-icon drawing at 16px in three side-by-side panel trees, 51 per page (a command turns the page), registers a fake test controller so the Testing view shows pass and fail icons, puts one error, one warning and one info problem on notes.md, raises notifications (one long warning; and, while toggled on, one info, one warning and one error, raised again on every theme change so they outlast VS Code's toast timeout through the theme loop), shows a multi-step quick pick with a Back button, toggles status bar entries for the four Copilot states and the two spinners (states a signed-out review profile cannot reach), and puts the fixture repository into the staged or conflicted state through the built-in git extension's API. It is never published, never referenced from the root `package.json`, and excluded from the Spellbound VSIX by `.vscodeignore`.
+A throwaway extension installed only into the isolated review VS Code that `npm run review:gate` launches. It lists every mapped product-icon drawing at 16px in three side-by-side panel trees, 51 per page (a command turns the page), registers a fake test controller so the Testing view shows pass and fail icons (two of its tests point at brews.spec.js, so the editor gutter shows their run and passed icons), sets one breakpoint of each kind from `breakpoints.json`, puts one error, one warning and one info problem on notes.md, raises notifications (one long warning; and, while toggled on, one info, one warning and one error, raised again on every theme change so they outlast VS Code's toast timeout through the theme loop), shows a multi-step quick pick with a Back button, toggles status bar entries for the four Copilot states and the two spinners (states a signed-out review profile cannot reach), and puts the fixture repository into the staged or conflicted state through the built-in git extension's API. It is never published, never referenced from the root `package.json`, and excluded from the Spellbound VSIX by `.vscodeignore`.
diff --git a/review/helper-extension/extension.js b/review/helper-extension/extension.js
index b2e7480..831cb9d 100644
--- a/review/helper-extension/extension.js
+++ b/review/helper-extension/extension.js
@@ -1,9 +1,11 @@
 // Review helper: shows every mapped drawing at 16px in side-by-side trees, creates a Testing provider so the Testing
-// container and pass/fail icons appear, raises notifications, and puts the review fixture into the states that the
-// status-batch glyphs need (Problems severities, staged and conflicted git branch, Copilot states, spinners, quick input).
+// container, the gutter run icons and pass/fail icons appear, raises notifications, sets one breakpoint of each kind,
+// and puts the review fixture into the states that the status-batch glyphs need (Problems severities, staged and
+// conflicted git branch, Copilot states, spinners, quick input).
 const path = require('path');
 const vscode = require('vscode');
 const rows = require('./ids.json'); // written by run-gate.mjs: [{ id, label, description }]
+const breakpointPlan = require('./breakpoints.json').breakpoints;
 const sheetViews = require('./package.json').contributes.views.spellboundReview.map(({ id }) => id);
 
 async function gitRepository() {
@@ -51,20 +53,28 @@ function activate(context) {
   describePage();
   context.subscriptions.push(pageChanged, ...sheets);
 
+  const folder = vscode.workspace.workspaceFolders?.[0];
   const controller = vscode.tests.createTestController('spellboundReview', 'Spellbound review');
   const pass = controller.createTestItem('pass', 'moonwater brews');
   const fail = controller.createTestItem('fail', 'nightshade spills');
-  controller.items.replace([pass, fail]);
+  // Gate 3: two tests with a location, so brews.spec.js shows testing-run-icon in the gutter before a run and
+  // testing-passed-icon after it. The failing test has no location, so no failure peek opens over that editor.
+  const located = folder ? ['moonwater settles', 'starlight glows'].map((label, index) => {
+    const item = controller.createTestItem(`brew-${index}`, label, vscode.Uri.joinPath(folder.uri, 'brews.spec.js'));
+    item.range = new vscode.Range(index + 1, 0, index + 1, 40);
+    return item;
+  }) : [];
+  controller.items.replace([pass, fail, ...located]);
   controller.createRunProfile('Run', vscode.TestRunProfileKind.Run, (request) => {
     const run = controller.createTestRun(request);
     run.passed(pass, 5);
     run.failed(fail, new vscode.TestMessage('The cauldron spilled.'), 7);
+    for (const item of located) run.passed(item, 3);
     run.end();
   }, true);
 
   // One problem of each severity on notes.md, so the Problems tree and the status bar show error, warning and info.
   const diagnostics = vscode.languages.createDiagnosticCollection('spellbound-review');
-  const folder = vscode.workspace.workspaceFolders?.[0];
   if (folder) {
     const line = (n) => new vscode.Range(n, 0, n, 9);
     diagnostics.set(vscode.Uri.joinPath(folder.uri, 'notes.md'), [
@@ -128,6 +138,13 @@ function activate(context) {
       page = (page + 1) % pages;
       describePage();
       pageChanged.fire();
+    }),
+    // Gate 3: one breakpoint of each kind (breakpoints.json), replacing whatever the previous scene left.
+    vscode.commands.registerCommand('spellboundReview.breakpoints', () => {
+      if (!folder) return;
+      vscode.debug.removeBreakpoints(vscode.debug.breakpoints);
+      vscode.debug.addBreakpoints(breakpointPlan.map(({ file, line, enabled = true, condition, logMessage }) => new vscode.SourceBreakpoint(
+        new vscode.Location(vscode.Uri.joinPath(folder.uri, file), new vscode.Position(line - 1, 0)), enabled, condition, undefined, logMessage)));
     }));
 }
 
diff --git a/review/helper-extension/package.json b/review/helper-extension/package.json
index 58fded8..b12e40f 100644
--- a/review/helper-extension/package.json
+++ b/review/helper-extension/package.json
@@ -2,7 +2,7 @@
   "name": "spellbound-review-helper",
   "displayName": "Spellbound review helper",
   "description": "Review-only helper for the Spellbound gate screenshots. Not part of the published extension.",
-  "version": "0.0.3",
+  "version": "0.0.4",
   "publisher": "witchynibbles-review",
   "engines": { "vscode": "^1.100.0" },
   "main": "./extension.js",
@@ -21,7 +21,8 @@
       { "command": "spellboundReview.statusSignals", "title": "Spellbound Review: Toggle the Copilot-state and spinner status entries" },
       { "command": "spellboundReview.quickInput", "title": "Spellbound Review: Show a multi-step quick pick" },
       { "command": "spellboundReview.scm", "title": "Spellbound Review: Put the fixture repository into a git state" },
-      { "command": "spellboundReview.iconSheetPage", "title": "Spellbound Review: Show the next page of the icon sheet" }
+      { "command": "spellboundReview.iconSheetPage", "title": "Spellbound Review: Show the next page of the icon sheet" },
+      { "command": "spellboundReview.breakpoints", "title": "Spellbound Review: Set one breakpoint of each kind in the debug fixture" }
     ]
   }
 }
diff --git a/review/profile/keybindings.json b/review/profile/keybindings.json
index 8934a77..fb975ad 100644
--- a/review/profile/keybindings.json
+++ b/review/profile/keybindings.json
@@ -33,5 +33,17 @@
   { "key": "ctrl+alt+shift+s", "command": "workbench.action.terminal.sendSequence", "args": { "text": "Write-Output 'moonwater brews'\r" } },
   { "key": "ctrl+alt+shift+x", "command": "workbench.action.terminal.sendSequence", "args": { "text": "Write-Error 'nightshade spilled'\r" } },
   { "key": "ctrl+alt+shift+a", "command": "workbench.action.focusActiveEditorGroup" },
-  { "key": "ctrl+alt+shift+F4", "command": "spellboundReview.iconSheetPage" }
+  { "key": "ctrl+alt+shift+F4", "command": "spellboundReview.iconSheetPage" },
+  { "key": "ctrl+alt+shift+i", "command": "spellboundReview.breakpoints" },
+  { "key": "ctrl+alt+shift+z", "command": "workbench.action.quickOpen", "args": "brews.spec.js" },
+  { "key": "ctrl+alt+shift+F1", "command": "workbench.action.debug.callStackDown" },
+  { "key": "ctrl+alt+shift+F2", "command": "workbench.action.debug.continue" },
+  { "key": "ctrl+alt+shift+F3", "command": "workbench.debug.viewlet.action.disableAllBreakpoints" },
+  { "key": "ctrl+alt+shift+F5", "command": "notifications.showList" },
+  { "key": "ctrl+alt+shift+F6", "command": "notifications.clearAll" },
+  { "key": "ctrl+alt+shift+F7", "command": "workbench.action.output.toggleOutput" },
+  { "key": "ctrl+alt+shift+F8", "command": "workbench.action.closeSidebar" },
+  { "key": "ctrl+alt+shift+F9", "command": "workbench.action.closeAuxiliaryBar" },
+  { "key": "ctrl+alt+shift+F10", "command": "workbench.action.quickOpen", "args": "term " },
+  { "key": "ctrl+alt+shift+F11", "command": "runCommands", "args": { "commands": ["workbench.debug.variablesView.toggleVisibility", "workbench.debug.watchExpressionsView.toggleVisibility"] } }
 ]
diff --git a/review/workspace/debug-target.js b/review/workspace/debug-target.js
index 82a7850..c96eabc 100644
--- a/review/workspace/debug-target.js
+++ b/review/workspace/debug-target.js
@@ -4,3 +4,14 @@ for (const potion of potions) {
   brewed += potion.length;
 }
 console.log(brewed);
+function stir(potion) {
+  const swirl = potion.toUpperCase();
+  return swirl.length;
+}
+const strength = stir(potions[0]);
+console.log(strength);
+// Keeps the program alive after Continue, so the debug toolbar shows Pause. Stop ends the process; the timer also ends
+// when the inspector closes (the debugger is gone) and after ten minutes at most, so nothing outlives a missed Stop.
+const inspector = require('node:inspector');
+const started = Date.now();
+const alive = setInterval(() => { if (!inspector.url() || Date.now() - started > 10 * 60 * 1000) clearInterval(alive); }, 1000);
diff --git a/scripts/review/capture.mjs b/scripts/review/capture.mjs
index 9afa90e..e362fe8 100644
--- a/scripts/review/capture.mjs
+++ b/scripts/review/capture.mjs
@@ -136,10 +136,23 @@ async function shutdown({ child, cdp }) {
   try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* already gone */ }
 }
 
+// Tooltips (workbench hovers, editor hovers) that are on screen. Every screenshot waits until there are none.
+const NO_TOOLTIP = `![...document.querySelectorAll('.workbench-hover, .monaco-hover')].some((el) => {
+  const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('.hidden'); })`;
+
 async function runStep(cdp, step, where) {
   try {
     if (step.press) await cdp.press(step.press);
     if (step.insert) await cdp.insert(step.insert);
+    // hover: an expression that returns the { x, y } (CSS px) to move the mouse to, for states only a pointer reaches
+    // (the debug-hint breakpoint helper in the glyph margin, the Call Stack row actions). The pointer stays there until
+    // a later hover step moves it (scenes that hover park it on the status bar in their teardown). CDP takes the point in
+    // the page's CSS px in both modes: in a zoom-mode run at 200%, the same point scaled by the zoom factor missed the
+    // glyph margin and the unscaled point reached it.
+    if (step.hover) {
+      const { x, y } = await waitFor(() => cdp.evaluate(step.hover), { timeout: step.timeout ?? 30000, label: step.hover });
+      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
+    }
     if (step.waitFor) await waitFor(() => cdp.evaluate(step.waitFor), { timeout: step.timeout ?? 30000, label: step.waitFor });
   } catch (error) {
     if (!step.optional) throw error;
@@ -212,12 +225,18 @@ for (const pass of job.passes) {
       for (const scene of job.scenes.filter((s) => !pass.scenes || pass.scenes.includes(s.name))) {
         const where = `${pass.name}/${scale}/${scene.name}`;
         log(`  ${scene.name}`);
+        // A scene's own settings (gate 3: panel tabs as icons) hold for its setup and every capture. Each setup starts
+        // in the first theme, not in the last theme of the previous scene.
+        const sceneSettings = scene.settings ?? {};
+        writeUserFile(userDataDir, 'settings.json', settingsFor(job.themes[0], sceneSettings));
+        await waitFor(() => cdp.evaluate(themeApplied(job.themes[0].signature)), { timeout: 20000, label: `theme ${job.themes[0].label}` });
         for (const step of scene.setup ?? []) await runStep(cdp, step, where);
         for (const theme of job.themes) {
           for (const variant of scene.variants ?? [{ name: 'default', settings: {} }]) {
-            writeUserFile(userDataDir, 'settings.json', settingsFor(theme, variant.settings));
+            writeUserFile(userDataDir, 'settings.json', settingsFor(theme, { ...sceneSettings, ...variant.settings }));
             await waitFor(() => cdp.evaluate(themeApplied(theme.signature)), { timeout: 20000, label: `theme ${theme.label}` });
             await delay(1500);
+            await waitFor(() => cdp.evaluate(NO_TOOLTIP), { timeout: 10000, label: 'hover tooltips to close' });
             const stem = path.join(capturesDir, pass.name, String(scale), scene.name, theme.slug, variant.name);
             const shoot = async (crop, clip) => {
               const file = path.join(stem, `${crop}.png`);
PATCH
```

What the patch does:
- `capture.mjs`:
  - the `hover` step (`Input.dispatchMouseEvent`, `mouseMoved`, the point unscaled);
  - `scene.settings`, written with the first theme before each scene's setup and merged into every capture's settings;
  - before every screenshot, a wait (10 s) until no tooltip is visible.
- Helper:
  - `spellboundReview.breakpoints`;
  - two tests located in `brews.spec.js` (lines 2 and 3), reported as passed. The failing test keeps no location, so no failure peek opens over the editor.
  - version 0.0.4.
- `keybindings.json`: the twelve chords listed under Interfaces, appended.
- `debug-target.js`, new lines 7-17:
  - `stir`, with the plain breakpoint inside it;
  - its call, which holds the conditional breakpoint;
  - a log line;
  - a one-second interval that keeps the program alive after Continue, so the toolbar shows Pause. It clears itself when the inspector closes and after ten minutes at most, so a missed Stop leaves nothing running.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test test/review-harness.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 28`, `ℹ pass 28`, `ℹ fail 0`.

Then: `npm test 2>&1 | grep -E '^ℹ (tests|pass|fail)' && npm run validate 2>&1 | tail -1`
Expected:
- `ℹ tests 297` (Task 9's 290 plus 7), `ℹ pass 297`, `ℹ fail 0`.
- Validate passes with `product-batch:panel` and `product-batch:debug` enforced (Parts B and C).

- [ ] **Step 6: Dry-run the gate-3 scenes in VS Code 1.141 (one scale)**

```bash
export AGENT_BROWSER_SESSION=spellbound-gate3
node scripts/review/run-gate.mjs --job review/jobs/gate-3.json --scales=1 --skip-variants
node scripts/review/privacy-scan.mjs review-out/<run>/sheets/*.png review-out/<run>/captures/manifest.json
```

Expected, after about 6 minutes: `Gate run complete: …/review-out/<run> (136 captures, 0 warnings)` (use that `<run>` id). That is 13 scenes giving 34 captures per theme (`full` plus each crop), times four themes. Then one `✓` per sheet and for the manifest, and exit 0.

If a non-optional wait times out, the run stops and names the selector. Cut the run down with `--scenes=<that scene and the scenes before it that set its state>` while fixing it. Scenes that need an earlier scene's state:

| Scene | Needs |
| :- | :- |
| `terminal-picker` | `terminal` |
| `debug-stopped` | `breakpoints` |
| `debug-focused` | `debug-stopped` |
| `debug-running` | `debug-focused` |
| `testing-results` | `testing` |
| `icon-sheet-2` | `icon-sheet` |

The others start from any state. A `✗` from the scan means a crop shows machine text, most likely the Debug Console body or an Output channel: narrow that crop rather than blurring the sheet.

Then open every sheet under `review-out/<run>/sheets/` with the Read tool and check that each glyph the scene waited for is visible, not just present:
- `debug-stopped-sidebar`: the Call Stack session row shows its inline actions, including Stop, with no tooltip; below it, the Breakpoints view with all six rows, the unverified `unbrewed.js` ring last.
- `breakpoints-sidebar`: the Run and Debug title with the start button, Call Stack, and the Breakpoints view with all six rows.
- `debug-stopped-toolbar`: continue, step over, into and out, and restart, with Disconnect last.
- `breakpoints-code`: the faint hint on line 12.
- `terminal-picker-widget`: the pencil and the kill button on `1: powershell`.
- `debug-stopped-code`: the stackframe with the moon dot on line 9.
- `debug-focused-code`: the focused frame with the dot on line 11.
- The icon sheet: page 1 shows 51 drawings and page 2 shows 20, with no view cut off, no row hover-highlighted and no tooltip (the same for the testing and panel-icons crops).

How this was checked while writing (Parts B and C did not exist yet), with stand-ins:
- Stock Codicons stood in for the panel and debug drawings. Every wait matches a codicon class, which stock icons carry.
- A temporary, reverted change to `run-gate.mjs` padded the icon sheet's `ids.json` to 71 rows by repeating the 47 drawings.

With the final job and the files of this task:
- The whole job at 100% and 200% before the review fixes: run 2026-10-10T13-37-53, `272 captures, 0 warnings`.
- After the review fixes, the scenes they touch (terminal, terminal-picker, the four debug scenes, testing, testing-results, both icon-sheet pages, panel-icons) at 100% and 200%: run 2026-10-10T14-15-27, `240 captures, 0 warnings`, 19 sheets and the manifest all `✓` in the privacy scan. I opened the sheets: the Breakpoints view with all six rows at both scales, Stop on the hovered row with no tooltip, and no hover highlight or tooltip in the icon sheet, testing or panel-icons crops.
- The breakpoints and debug-stopped scenes with `"mode": "zoom"` at 200% (a temporary copy of the job): `32 captures, 0 warnings`. The same run with the hover point scaled by the zoom factor timed out on `debug-hint`, which is why the point is not scaled.
- Before the drawings exist, the stopped line shows only the `::after` dot. The element carries the batch-1 `debug-breakpoint` class (product font) and the stock `debug-stackframe` class, so the fonts mix. Once Part C maps the debug IDs, both rules use the product font.

- [ ] **Step 7: Snapshot the tree**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_10`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_10`.

### Task 11: Run gate 3 and hand it to the author

**Files:**
- Create: `docs/qa/2.0-gate-3/README.md`, `docs/qa/2.0-gate-3/manifest.json`, `docs/qa/2.0-gate-3/*.png` (the 20 `commitSheets` of `review/jobs/gate-3.json`, plus `variants-*` sheets if Parts B or C left gate variants)

**Interfaces:**
- Consumes: everything above; the README notes and author questions that Parts B and C record (drawing choices, rejected forms, any gate variant).
- Produces: the review-gate-3 package. This plan ends here; the editor and symbols batches (gate 4) start only after the author approves.

- [ ] **Step 1: Verify the preconditions**

Run: `npm test 2>&1 | grep -E '^ℹ (tests|fail)' && npm run validate 2>&1 | grep -E '^…|^✓' && ls icons/product-src-variants 2>/dev/null; node -e "console.log(Object.keys(require('./icons/product-icon-map.json').drawings).length)"`
Expected: `ℹ fail 0`; validate passes with `product-batch:panel` and `product-batch:debug` enforced, and only `product-batch:editor`, `product-batch:symbols`, `release` and `file-icons` pending; no `icons/product-src-variants/` folder (this plan draws no gate variant); `71` drawings (the icon sheet needs two pages, which the `icon-sheet-2` scene waits for).

- [ ] **Step 2: Run the full gate**

Run: `AGENT_BROWSER_SESSION=spellbound-gate3 npm run review:gate -- --job review/jobs/gate-3.json`
Expected, after about 25 minutes: `Gate run complete: …/review-out/<run> (<n> captures, 0 warnings)`. Main pass: 4 scales × 136 = 544. Variants pass, only when `icons/product-src-variants/` holds a file: 2 scales × 4 themes × (breakpoints 3 + debug-stopped 5 + debug-focused 3 + debug-running 2 + icon-sheet 2 + icon-sheet-2 2) = 136, for 680 in all. With no variant file, `run-gate.mjs` drops the variants pass (544 captures). Re-run if a non-optional step failed (the run stops and names it). Note the `<run>` id the last line prints: Step 4 copies that run, not the newest folder (a later dry run would be newer).

- [ ] **Step 3: Review the sheets yourself before the author does**

Open every sheet in the `commitSheets` list with the Read tool. Record in the README, per glyph: blur at 125%/150% beyond what snapped strokes allow; whether each breakpoint state reads at 16px/100% against the others in `breakpoints-code` (plain moon, disabled, log, log-disabled, conditional; the unverified ring in `debug-stopped-sidebar`); whether the moon dot of `debug-stackframe-dot` sits on the stackframe glyph at line 9 (`debug-stopped-code`) and on the focused glyph at line 11 (`debug-focused-code`) at every scale; whether `restart` can be mistaken for `sync`; whether the toolbar glyphs keep one optical size beside the stock Disconnect; and whether the bin, broom, funnel, quill and console spider read at 16px in the panel title (`panel-icons-title`, `output-title`, `terminal-panel`). Do not redraw anything now. Also record the colour of the moon dot on the focused frame (line 11): the 100% dry run of the assembled plan (2026-10-10T14-39-09) showed it lavender like the frame, not the breakpoint gold the `::after` rule (`debugIcon.breakpointForeground`) predicts; say which it is at every scale and, if it is the frame colour, note that the dot then reads as part of the frame rather than as the breakpoint.

- [ ] **Step 4: Copy the sheets and the manifest, then scan them**

```bash
RUN=review-out/<run> # the id Step 2 printed
node -e "process.exit(require('./$RUN/captures/manifest.json').dryRun ? 1 : 0)" || echo "STOP: $RUN is a dry run, not gate evidence"
mkdir -p docs/qa/2.0-gate-3
for name in $(node -e "console.log(require('./review/jobs/gate-3.json').commitSheets.join(' '))"); do
  if [ -f "$RUN/sheets/$name.png" ]; then cp "$RUN/sheets/$name.png" docs/qa/2.0-gate-3/; else echo "not produced: $name"; fi
done
for sheet in "$RUN"/sheets/variants-*.png; do [ -f "$sheet" ] && cp "$sheet" docs/qa/2.0-gate-3/; done
cp "$RUN/captures/manifest.json" docs/qa/2.0-gate-3/manifest.json
chmod 644 docs/qa/2.0-gate-3/*
ls docs/qa/2.0-gate-3 | wc -l
node scripts/review/privacy-scan.mjs docs/qa/2.0-gate-3/*.png docs/qa/2.0-gate-3/manifest.json
```

Expected: no `STOP` line and no `not produced` lines; `21` files (20 sheets and the manifest) plus any `variants-*` sheets; one `✓` per sheet and for the manifest, and exit 0 (exit 2 means the scan could not run: fix that, never skip it). Then open `main-terminal-panel.png`, `main-terminal-picker-widget.png`, `main-debug-stopped-sidebar.png` and `main-debug-stopped-panel-title.png` with the Read tool: the scan reads text, so also check by eye that no path, user or machine name shows (the gate-2 handoff rule: open every screenshot before it is committed).

- [ ] **Step 5: Write `docs/qa/2.0-gate-3/README.md`**

Fill the angle-bracket fields from the run and from Step 3; every other line is final text.

````markdown
# Spellbound 2.0, review gate 3 (panel and debug batches)

- Run: <run id> · VS Code <version> (<commit dir>) · mode <device-scale|zoom> · repo <commit> (dirty: gate-3 work is uncommitted, so `repoDirty` is true)
- Reproduce: `AGENT_BROWSER_SESSION=spellbound-gate3 npm run review:gate -- --job review/jobs/gate-3.json` (`--help` lists the dry-run options; harness in docs/superpowers/plans/2026-10-10-spellbound-2-phase-1.md, Part D; gate-3 harness fixes in docs/superpowers/plans/2026-10-10-spellbound-2-gate-3.md, Task 3; gate-3 scenes in the same plan, Task 10)
- Raw captures (not committed): review-out/<run>/captures. `manifest.json` here lists all <n> with their sha256: main pass 4 scales × 136<, variants pass 2 scales × 68>. <k> warnings<: list them>.
- Committed here: the 20 `commitSheets` from `review/jobs/gate-3.json`<, and the variants sheets>. Every sheet, this README and the manifest passed `node scripts/review/privacy-scan.mjs`, and every sheet was checked by eye. Raw `full.png` captures of the debug scenes show the Debug Console, which prints the launch command with the Windows user directory; no committed crop includes it.

## Preconditions
- `npm test`: <n> of <n> pass. `npm run validate`: passes with `base`, `color-themes`, `product-pipeline`, `product-batch:1`, `product-batch:chrome`, `product-batch:status`, `product-batch:panel` and `product-batch:debug` enforced; `editor`, `symbols`, `file-icons` and `release` are pending, as staged validation allows.
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
- **Decision: the debug toolbar's weight.** Continue (a 2-unit bar and a filled triangle), pause (two 3-unit bars) and stop (a 10×10 square) are solid where Codicon draws outlines; the steps (1-unit stems, filled heads, a 3×3 moon) and restart (a 1-unit band with a filled head) stay light, so the row reads solid, light, light, light, light, solid (main-debug-stopped-toolbar, main-debug-running-toolbar). Options: keep, make continue, pause and stop outlines, or make the whole family heavier. Recommendation: keep; the solid controls are the ones a user reaches for first.
- **Decision: `testing-run-all-icon`.** A filled triangle with an open chevron ahead of it, not Codicon's second outline offset down and left (which these 2:3 sides cannot fit with 1 unit of clearance). Options: keep, or redraw as two offset outlines with smaller triangles. Recommendation: keep (main-testing-sidebar).
- **Decision: the quill's solid vane (`output-view-icon`).** An exception to section 4's one-filled-accent rule, like the witch hat (G12): every outlined vane read as a spoon or a racket at 16px. The ink drop stays the accent. Recommendation: keep (main-panel-icons-title).
- **Decision: the funnel (`filter`).** The "liquid in the spout" is a drop below the cone, not a liquid inside a hollow spout: a 4-wide hollow spout leaves a 2-unit channel, too narrow for an accent with 1-unit clearance. The cone's hole is a trapezoid at least 2 units wide all the way down. Recommendation: keep.
- **Decision: quill and broom.** Both are a diagonal implement from upper right to lower left with two short lines at the lower right, and both can sit in the Output title bar (the view icon with `showLabels: false`, and Clear Output). They are distinguishable at 16px but look like one family. Options: keep, or move the broom's swept lines to the lower left. Recommendation: keep unless main-output-title shows them confusable.
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
- The 4×5 ink drops (quill, funnel) render as round dots at 16px; the drop shape shows at 24px (batch 1 recorded the same for a 4×5 flame).
- `expand-corners` is 12×12 (x2-14), like the stock glyph.
- The stack-frame pointer is larger than the 8-unit signal keyline (x2-15, y3-13), because it holds the 4×4 overlay dot with 1 unit of clearance.
- The steps use a 3×3 moon on pixel column 7 (x6-9), not the 4×4 overlay dot, so the moon lines up with the arrow stems; step-over's head is 6×3, 1.68 clear of the moon.
- The unverified ring has six round-ended dashes (eight read as a faint dotted ring at 16px, four as a ring with notches).
- The log diamond spans 3-13 (spec 5.2) and has the moon's area.
- The passed-test check is cut out 2.12 across and meets the 2-unit minimum, unlike the gate-2 ✕ exception.
- Known and not fixable by the theme: whenever a stop is not in column 1 (including the first statement of an indented line), VS Code draws an inline stack-frame arrow before the stopped column in the stock `codicon` font with a hard-coded character, so it is always the stock Codicon (spec 5.2). The themed frame shows in the gutter only. This bears on spec section 1's "no stock Codicon visible" criterion.
- The review terminal runs Windows PowerShell with `-NoProfile`, a fixed `PS workspace>` prompt and VS Code's shell integration sourced by the profile, so the committed terminal sheet no longer depends on the author's own PowerShell profile (gate 2's showed whatever that profile printed).
- <glyph-level notes from Step 3>

## Known staging artifacts (not defects)
- Every pinned ID in the editor and symbols batches still shows its stock Codicon (layout toggles, `case-sensitive`/`whole-word`/`regex`, the ✧ `sparkle`, the symbols).
- Unpinned IDs stay on Codicons: `debug-disconnect` (floating toolbar), `debug-restart-frame` (Call Stack row actions), `record` (Take Performance Profile), `debug-console-clear-all` shows the broom through its default, `terminal-decoration-incomplete` (open prompt line).
- No surface reachable in the review profile draws `codicon-run` (the Run Active File actions are hidden by default; the other uses need states the fixture lacks), so the play outline shows as `testing-run-icon` in the gutter, and as `run` in the icon sheet when `run` is its drawing's first ID. `debug-breakpoint-conditional-disabled` and `-conditional-unverified` are never rendered (see Decisions).
- The pointer rests on the line-12 glyph margin in the breakpoints scene (for `debug-hint`) and on the launch-session row in Call Stack in debug-stopped (for Stop's inline action). Those two scenes keep tooltips off (`workbench.hover.delay`), every screenshot waits until no tooltip is shown, and each scene parks the pointer on the status bar when it ends.
- Variables and Watch are hidden in the Run view from the breakpoints scene on, so Call Stack and the Breakpoints view fit the side bar at 200%. Both side bars stay closed after the icon-sheet scenes, so main-panel-icons-* show a full-width panel.
- <harness framing notes from Step 3, if any>

## Harness changes made for this gate
- New scenes: output, notifications-center, terminal-picker, breakpoints, debug-stopped, debug-focused, debug-running, testing, testing-results, icon-sheet-2, panel-icons (run last: toggling the panel's tab labels left the next scene's panel title overlapping at 200%). Reworked: terminal (focuses the editor group first, so it no longer depends on the scenes before it; PowerShell without the user profile), icon-sheet (closes both side bars; pages of 51 drawings).
- Job schema: `scene.settings` (applied to the setup and every capture; every scene's setup now starts in the first theme) and the `hover` step (moves the pointer, for `debug-hint` and the Call Stack row actions).
- `run-gate.mjs` stops with its usage on an unknown option (it used to start a full gate-1 run), has `--help`, and takes `--scales` and `--scenes` for dry runs (the manifest then records `dryRun`). Gate 2's terminal scene also focuses the editor group first, so it no longer depends on earlier scenes either.
- Helper extension: one breakpoint of each drawn kind (`breakpoints.json`), two tests located in brews.spec.js, three icon-sheet views in pages of 51 (`spellboundReview.iconSheetPage`). Fixture: debug-target.js gains `stir` and a timer (lines 1-6 unchanged); new unbrewed.js and brews.spec.js.
- `scripts/review/privacy-scan.mjs`: scans committed sheets (OCR) and text files for the machine's user names, user directories and email addresses (names read at run time, never stored), and fails closed when it cannot run.
- `capture.mjs`: every screenshot waits until no tooltip is shown; the `hover` step sends its point to CDP unscaled in both capture modes; scene settings; the PowerShell profile sources shell integration inside `try`/`catch`.
- `test/package-contents.test.mjs` runs `vsce` through Node, so it passes on native Windows (`npx` there is `npx.cmd`).
- <fixes made while running, with the failed run id and the cause>

## Approval
Author: approve gate 3 as is / approve with the changes listed below / redraw. Gate 4 (editor and symbols batches) starts only after approval.
````

Then scan the README: `node scripts/review/privacy-scan.mjs docs/qa/2.0-gate-3/README.md; echo "exit $?"`. Expected: one `✓` line and `exit 0`.

- [ ] **Step 6: Snapshot the tree and stop**

Run: `mkdir -p review-out/g3 && git add -A && git write-tree | tee review-out/g3/TREE_11`
Expected: one 40-character tree id, also saved in `review-out/g3/TREE_11`.

Stop here. Report the README path `docs/qa/2.0-gate-3/README.md`, the tree id in `review-out/g3/TREE_11` and the run id to the author, and wait for the gate decisions. Do not commit (the author commits after gate 3) and do not start the editor or symbols batches.

---

## Later plans (after the author approves gate 3)

**Gate 4: editor and symbols batches.** `editor` (33 IDs, plus `gutter-lightbulb-sparkle-filled` on the ✧ cluster, G11, for 171 pinned keys) and `symbols` (15 IDs). The icon sheet then passes 102 drawings, so gate 4 adds a third page scene (Task 3's test fails until it does). The gate-3 decisions on `debug-disconnect` and `debug-breakpoint-log-unverified`, if taken as recommended, add two map lines and two pinned keys. After gate 4, `npm run validate -- --release` lists only `file-icons` and `release`.

---

## Review notes

The plan was assembled from three drafted parts (A+B geometry fixes and panel batch, C debug batch, D gate harness and run), each written and measured on its own scratch worktree, then reviewed adversarially by a reviewer who applied every step and rendered the glyphs itself. Every review issue was applied except the two noted below.

- **Panel, major 1 (`console-spider` read as ⊠): applied.** The reviewer's corner spider (a console window with its lower-right corner open and a six-legged spider breaking out, the stock layout) replaces the spider inside a closed terminal frame; the brief's instruction to reuse the terminal frame was dropped for this drawing, and `parts.terminalFrame` was not added.
- **Panel, major 2 (`outlineGap` blind to a solid inside a solid): applied**, with the wrong "nested" test case corrected. Minors applied: `clipHalfPlane` tolerance, map pins per ID, `expand-corners` at 12×12, the funnel's hole at least 2 units wide all the way down.
- **Debug, major 1 (`step-into` read as `!`, `step-out` as a spade): applied** with the reviewer's 5×4 head on 2:1 sides; step-over takes a 6×3 head that reads at 14px. **Major 2 (stock inline arrow on more stops than stated): applied** to the spec sentence and the README. Minors applied: the moon-swap test catches a hard-coded hole, the restart test can fail (one arrowhead, half-turn asymmetry on ink), "within antialiasing" wording, the `moon-equals` wall comment.
- **Harness, major 1 (pointer and tooltips in committed sheets, a Call Stack tooltip can show the user directory): applied.** Hover scenes keep tooltips off, every capture waits for no tooltip, every hovering scene parks the pointer, pinned by a test over every job. **Major 2 (Breakpoints view off screen at 200%): applied**; the waits check the viewport. **Major 3 (privacy scan failed open): applied**; it exits 2 when it cannot resolve names, run OCR, or find a file, and it normalises OCR spacing and scans the manifest and README as text.
- **Harness, minor m6 (scale the hover point in zoom mode): rejected after measuring.** The scaled point timed out on `debug-hint`; the unscaled point passed at 200% in zoom mode. The code comment records it.
- **Harness, minors m9 and m10 (source-grepping tests; deriving page scenes): not taken.** The pinned page arithmetic fails closed, so a later gate is told to add a page.
- **Icon-sheet capacity:** the debug batch crosses 54 drawings, where gate 2's three-view sheet ran out; the paged sheet moved from the harness task into Task 3 so it lands before the debug tasks.

## Self-review notes

- **Spec 5.2 "Panel and views" rows.** `output-view-icon` (quill, ink drop), `debug-console-view-icon` (console with a spider, body filled): Task 4. `clear-all`, `notifications-clear-all` (broom, bristles), `filter` (funnel, drop), `trash`, `terminal-kill` (bin, lid), `panel-maximize` (expand corners), `markers-view-icon` (uses warning): Task 5. That is the 9 `panel` IDs.
- **Spec 5.2 "Debug and testing" rows.** Breakpoints, `debug-hint` and the D4 reuses: Task 6. `debug-stackframe`, `-focused`, `-dot`, steps: Task 7. `debug-start`, `run`, `testing-run-icon`, `testing-run-all-icon`, `debug-continue`, `-pause`, `-stop`, `-restart`: Task 8. `testing-passed-icon`: Task 9. That is the 23 `debug` IDs. The breakpoint-footprint and paused-on-breakpoint paragraphs are pinned by the Task 6 and Task 7 tests and shown by the Task 10 scenes.
- **Section 4 rules pinned by tests.** Footprints (Task 6); overlay clear area and dot coincidence (Task 7); real holes for the `=` slots and the check (Tasks 6, 9); 1-unit clearances measured with `outlineGap` (Tasks 1, 4-9); cut-outs ≥2 units including the funnel's (Task 5); no new off-grid point (the across-modules grid test, unchanged); drift for every new SVG.
- **Section 8.** Superset coverage per batch: Tasks 5 and 9 append `product-batch:panel` and `product-batch:debug` once every ID is mapped, and their coverage tests name each ID and its drawing. Font geometry: `npm run validate --only product-pipeline` in every drawing task.
- **Deferred gate-2 items.** Clearance helper: Task 1. `clipHalfPlane`: Task 2. Icon-sheet capacity, `run-gate.mjs` arguments, terminal profile, `package-contents` on native Windows, the vacuous ordering assertion: Task 3. Privacy of committed sheets: Tasks 3, 10, 11.
- **Names used across tasks.** `outlineGap` (Task 1); `parts.flame` (Task 4); `glyphModules = [batch1, chrome, status, panel, debug]` (Tasks 4, 6); drawing names and codepoints as in the codepoint table; stages `product-batch:panel` and `product-batch:debug`; `parseGateArgs`, `findPrivateText`, `normaliseOcr`, `machineUserNames` (Task 3); helper commands and scene names as in Task 10.
- **Changed after the end-to-end run.** The Run-view chord no longer toggles Loaded Scripts (1.141 shows that view only during a session, collapsed, so the toggle could not hide it); the edit changes one keybinding line and one assertion, and every patch hunk's line counts were re-checked (32 hunks). Task 11 Step 3 records the focused-frame dot colour.
- **Checked while writing.** Each part was applied in order on a scratch worktree and every output in it was measured there; the harness was run in real VS Code 1.141 at 100% and 200% with stock panel and debug glyphs. The assembled plan was then applied end to end on a fresh worktree, and every count and output in Tasks 1-10 above comes from that run. From that worktree, a one-scale dry run of the gate-3 job at 100% with the real panel and debug drawings (run 2026-10-10T14-39-09) gave 136 captures and 0 warnings; every panel and debug glyph on its sheets is the house drawing (only the documented Disconnect button and inline stack-frame arrow stay stock), line 9 shows the frame with the moon dot, and all 21 sheets and the manifest pass the privacy scan.
- **Not checked while writing.** The full four-scale gate-3 run (Task 11), and the gate-3 scenes at 125%, 150% and 200% with the real panel and debug drawings (only 100% was run with them). `test/package-contents.test.mjs` under a real Windows Node install (checked under VS Code's Electron in Node mode).

## Execution

Recommended: **subagent-driven** (superpowers:subagent-driven-development), because the tasks hand exact interfaces and geometry to one another (`outlineGap`, `parts.flame`, the live moon breakpoint, the paged icon sheet the gate-3 job expects), and a fresh reviewer per task who renders each glyph sheet independently catches a drawing that passes its tests but fails at 16px, as the gate-2 and gate-3 reviews did.
