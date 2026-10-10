# Spellbound Themes 2.0, Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the repo from 1.2.1 to the 2.0 design's first review gate: the section 8 checks exist and enforce what phase 1 delivers, Moonlit Candle and the semantic/typography/terminal fixes ship in the color themes, the product icon pipeline is drawing-based and geometry-exact, the first 21 glyph designs are drawn, and a reproducible real-VS-Code screenshot run produces the gate evidence.

**Architecture:** `scripts/validate.mjs` becomes a thin orchestrator over small check modules in `scripts/lib/`, each tagged with a *stage*; `scripts/validation-stage.json` lists the stages `npm run validate` enforces, and `--release` enforces all of them. Color themes stay generated from `src/theme-definition.mjs`, refactored onto named workbench roles. Product glyph SVGs are generated from code (`scripts/glyphs/`) with winding-correct primitives, built into one font by a drawing-based map (one SVG and one codepoint per drawing, many IDs per codepoint). Gate screenshots come from a real VS Code 1.141 on Windows, driven over the Chrome DevTools Protocol by a script that runs under VS Code's own Electron in Node mode.

**Tech Stack:** Node 24 (ES modules, `node:test`), svgicons2svgfont 15.0.1, svg2ttf 6.1.0, ttf2woff 3.0.0, fontkit 2.0.4, svg-pathdata 7.2.0 (new explicit devDependency, already in the lockfile), @vscode/vsce 3.x, agent-browser 0.38 (contact sheets), VS Code 1.141.0 for Windows (gate captures).

**Spec:** `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (with review fixes, section 10). Research: `docs/research/vscode-1.141-icon-inventory.md`. Executors read the spec alongside this plan; section numbers below refer to the spec.

## Global Constraints

- `engines.vscode` stays `^1.100.0`. The package stays declarative: no `main`, no activation events. The review helper extension in `review/` is never referenced from the root `package.json` and is excluded from the VSIX.
- Version stays `1.2.1` and `galleryBanner.color` stays `#110d24` during phase 1. `2.0.0` and `#0D0916` happen in phase 4 (release); the validator already checks them under the `release` stage.
- Font ID `witchynibbles-product-icons`, family `WitchyNibbles Product Icons`, file `icons/witchynibbles-product-icons.woff`, theme `src` path `./witchynibbles-product-icons.woff`.
- Glyph sources: `viewBox="0 0 16 16"`, no `width`/`height`, only `<svg>` and `<path>` elements, filled paths only, no `stroke`, no `transform`, no `fill-rule="evenodd"`, every inner subpath wound opposite to its container. Font scale: 64 font units per grid unit (`fontHeight: 1024`), no `centerHorizontally`/`centerVertically`.
- New 2.0 drawings take codepoints from `E100` upward, assigned from the table before Task 12 (drawing Tasks 12-15); a codepoint is never reused within a release (retired ones are listed in the map).
- New theme label `WitchyNibbles Moonlit Candle`, file `themes/WitchyNibbles-color-theme-moonlit-candle.json`, `uiTheme: vs-dark`, first in `contributes.themes`.
- Colours are copied verbatim from spec section 3.1 and 3.2: Candle editor `#0D0916`, panel `#171025`, sidebar `#120C1F`, text `#F3EAF7`, muted `#A99AB9`, border/subtle `#6E5A80`, dividers `#38234D`, gold `#FFD477`, pink `#FF67B7`, lavender `#B99AFF` / `#633B79`, mint `#74E8B8`, amber `#FFB86B`, rose `#FF6B9F`, cyan `#77D9FF`; on-pink and on-gold foreground `#0D0916`. Moonlit mint `#74E8B8`, amber `#FFB86B`, and the full witchyterm terminal scheme. Daydream mint `#0E7553`, amber `#9A5A00`, UI-boundary border `#8E78A6`. Coven Contrast keeps its colours (white borders included) and stays free of green.
- Green allowlist: Moonlit Candle and Moonlit `#74E8B8`, `#9DF2CE`; Daydream `#0E7553`; Coven none.
- The witchyterm scheme is pinned in this repo (`src/witchyterm-moonlit-candle.scheme.json`); `../witchyterm` is never modified.
- Never kill VS Code by image name (`taskkill /IM Code.exe` would close the author's own editor). Review instances run with their own `--user-data-dir` and `--extensions-dir` and are closed by PID or CDP only.
- The VS Code 1.141 bundle on this machine is at `/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js`. The path in the task brief omits the `2a59476c9b/` commit folder; `07f806f999/` is the older 1.140.0.
- The spec's corrected first batch is **21 designs** (the brief's "22" predates the fix that removed the double-counted terminal). Because each chevron orientation is its own drawing (section 5.1), the 21 designs are **23 SVG drawings**.
- No commits during this run: the author approves commits after the gate. Work stays on the checked-out `spellbound-2.0` branch, with no new branches or worktrees. Each task's "Commit" step is replaced by a tree snapshot (`git add -A && git write-tree`), so the next task's changes can be shown with `git add -A && git diff --cached <tree>`. Where a step expects a clean tree, the tree is dirty; the gate manifest records that as `repoDirty`. When the author commits, messages end with the attribution line the session provides.

## Review Focus

1. **A TextMate child scope inheriting bold.** In 1.2.1 `keyword.operator`, `support.function.builtin`, `support.type.builtin` and `support.type.property-name` silently inherit bold from their parent rules, because a rule without `fontStyle` inherits it. Expected: only keyword and `storage.type` text is bold. Pinned by the inheritance check in Task 2 and the explicit `fontStyle: ''` assertions in Task 8.
2. **A Moonlit Candle function declaration rendered cyan.** VS Code scores the semantic selectors `function` and `*.declaration` the same (100 each, confirmed in the 1.141 bundle's `parseTokenSelector`), so the declaration colour can win. Expected: function and method names are gold everywhere. Pinned by the `function.declaration` / `method.declaration` assertions in Task 7.
3. **A glyph whose hole renders solid.** A cut-out drawn in the same direction as its outline looks right in a browser preview (which honours `evenodd`), but the font pipeline fills with nonzero winding. Expected: holes stay holes in VS Code. Pinned by the winding check (Task 4), the primitive orientation tests (Task 11) and the drift test that runs every drawing through the glyph rules (Task 11).
4. **An alias ID left on a stock Codicon.** `tree-item-expanded`, `toolbar-more`, `menu-submenu`, `quick-input-back`, `dialog-*` and `plus` copy a glyph without inheriting a mapping. Expected: each is mapped by its own key. Pinned by the pinned-list test (Task 3) and the batch-1 coverage assertion in Task 16.
5. **A registered ID inheriting a newly themed codicon with the wrong meaning.** `terminal-decoration-success` and `ports-forwarded-with-process-icon` default to `circle-filled`, so the ✦ dirty mark reaches them. Expected: they get their own glyphs by release, and the gate shows the phase-1 state honestly. Pinned by the `circle-filled` audit and its test in Task 12; `terminal-decoration-success` sits in the `status` batch, so `--release` fails until it has its own mapping.

## Resolved decisions

The author decided all 14 open decisions on 2026-10-10, as the reviewers recommended (spec section 11). Each affected task carries a **Decision** line with the concrete instruction; this table is the index.

| # | Decision | Phase 1 tasks affected | What phase 1 does |
| :- | :- | :- | :- |
| 1 | Terminal: palette equals witchyterm; `ll` matches exactly at `terminal.integrated.minimumContrastRatio: 1`, documented in the README, not set by the package; the moon background image is a known difference | Task 17, Task 18 | Keeps the captures at the default 4.5 and at 1 as evidence for the README; changes no setting in the package. |
| 2 | Moonlit's terminal takes the full scheme (`'full'`) | Task 2, Task 9 | Pins and generates Moonlit's background `#0D0916`, foreground, cursor, selection and the 16 ANSI colours. |
| 3 | Stackframe colours: Candle current gold `#FFD477`, other lavender `#B99AFF`; other themes role-equivalent | Task 9, Task 18 | Sets both `debugIcon.*Stackframe*` keys in all four themes and lists the non-Candle values as phase-1 choices at the gate. |
| 4 | Breakpoints: (i) `debug-hint` reuses the breakpoint drawing; (ii) `debug-breakpoint-unverified` dashed ring; (iii) `-conditional-disabled`, `-log-disabled`, `-conditional-unverified` reuse drawings; (iv) crater only if it survives 16px | Task 3, Task 13, Task 18 | Pins the four new keys in the `debug` batch; draws the crater and the plain-disc variant; the author picks at the gate. |
| 5 | Copilot states as cat-head variants (unavailable slash, snooze closed eyes, dot star, warning at the gate), status batch | Task 3, Task 15 | Pins `copilot-warning`, `-snooze`, `-dot` in the `status` batch; draws none of them in phase 1. |
| 6 | Spider on the five Run-view section icons accepted | Task 18 | Nothing to change; the gate shows the Run and Debug views. |
| 7 | Legacy layout keys dropped; mirrored toggles added in the `editor` batch | Task 3, Task 10, Task 16 | Pins `panel-right`/`-off`, `auxiliarybar-left-layout-icon`/`-off-layout-icon` and `panel-bottom` in the `editor` batch; keeps the 1.2.1 layout glyphs as legacy drawings only until Task 16. |
| 8 | File icons from one placeholder source per drawing, resolved into three sets; 3:1 on resolved colours; file-icon gate | none (phase 3) | The file-icon check reads the resolved SVGs, so it applies unchanged. |
| 9 | Category column; assets category cyan; muted folder bodies; lockfile `fileNames` | Task 5 | Adds the four lockfile `fileNames` to the required keys. |
| 10 | `light` docs `#3B2A47`; `highContrast` tests `#74E8B8`, config `#A99AB9` | none (phase 3) | The 3:1 check is value-agnostic. |
| 11 | Keep `source`, `test`, `__tests__`, `pyw`, `languageIds`; drop `vite.config.ts` | Task 5 | Adds the folder aliases and `pyw` to the required keys. |
| 12 | Enlarged search lens and gear hub; crescent and plain-dot variants, author picks per icon | Task 14, Task 15, Task 18 | Draws both variants; both reach the gate. |
| 13 | Skull row adds "danger / secret" | none (phase 4) | No phase 1 work. |
| 14 | Borders: `#6E5A80` only on editor, sidebar and panel; Daydream UI-boundary border `#8E78A6`; Coven keeps white | Task 8 | Sets Daydream's `inputBorder` and adds the 3:1 border check. |

## Staging decision: validation staged by batch, no temporary mappings

The brief asks to choose between (A) temporarily mapping every non-batch-1 core ID so validation passes, and (B) staging validation by batch. This plan uses **(B)**, and IDs outside batch 1 fall back to stock Codicons during phase 1.

- **The gate should compare against what really ships.** Section 4 draws the glyphs on the Codicon grid "so unmapped fallbacks blend in", and the ~97 extended-tier IDs stay on Codicons in 2.0. Reviewing batch 1 next to real Codicons tests that promise. Placeholder or legacy glyphs would put a third style in every screenshot.
- **Temporary glyphs would need their own exemption machinery.** The 1.2.1 sources fail the new rules (four use `evenodd`, five more have same-direction inner subpaths, 29 of them sit off the half-unit grid), so mapping them means a waiver list for each rule. A batch list is one array.
- **Nothing temporary can ship by accident.** `npm run package` runs `validate --release`, which enforces every batch, the file-icon stage and the release metadata. The 2.0 package cannot be built until all of them pass.
- **Progress is visible.** Each later glyph group adds one stage name (`product-batch:chrome` and so on) to `scripts/validation-stage.json`, and `--verbose` lists what is left.

The legacy 1.2.1 drawings are kept only from Task 10 to Task 16, so the build keeps working while the pipeline changes underneath them. Task 16 removes them.

Stage names used by the validator:

| Stage | Enforced from | Covers |
| :- | :- | :- |
| `base` | Task 1 | Checks that exist in 1.2.1 and still apply |
| `color-themes` | Task 2 | Section 8 colour checks |
| `product-pipeline` | Task 4 | Map format, glyph source rules, build flags, font geometry |
| `product-batch:1` | Task 4 | Mapping of the 48 IDs that the 23 batch-1 drawings cover |
| `product-batch:chrome`, `:panel`, `:status`, `:debug`, `:editor`, `:symbols` | phase 2, one per group | The other 112 pinned IDs |
| `file-icons` | phase 3 | Section 6 / section 8 file-icon checks |
| `release` | phase 4 (`--release`) | Version 2.0.0, banner `#0D0916` |

## File structure

Created:

- `src/color.mjs`: colour math shared by the theme generator and the validator.
- `src/witchyterm-moonlit-candle.scheme.json`: pinned copy of the witchyterm Windows Terminal scheme.
- `scripts/validation-stage.json`: the stages `npm run validate` enforces.
- `scripts/lib/report.mjs`: staged problem collection, CLI options, output formatting.
- `scripts/lib/checks/package.mjs`: package contributions, extension icon, release metadata.
- `scripts/lib/checks/color-themes.mjs`: every colour-theme check.
- `scripts/lib/checks/product-icons.mjs`: product icon contribution, coverage, map, glyph rules, build flags, font geometry.
- `scripts/lib/checks/file-icons.mjs`: file-icon theme checks.
- `scripts/lib/file-icon-requirements.mjs`: the section 6 key lists and sidebar colours.
- `scripts/lib/svg-geometry.mjs`: SVG parsing, flattening, winding, bounds, grid scan.
- `scripts/lib/product-icon-map.mjs`: map validation and `iconDefinitions` generation.
- `scripts/lib/product-font.mjs`: font stream options and `buildFont()`.
- `scripts/lib/product-icons-build.mjs`: `buildProductIcons()` used by the CLI and the review staging.
- `scripts/extract-icon-ids.mjs`: manual bundle-vs-pin diff (section 8).
- `icons/product-icon-ids.json`: pinned 160-key list with tier, kind, default and batch.
- `scripts/glyphs/primitives.mjs`, `scripts/glyphs/batch-1.mjs`, `scripts/glyphs/index.mjs`: glyph authoring code.
- `scripts/draw-product-glyphs.mjs`: writes generated SVGs.
- `scripts/render-glyph-sheet.mjs`: HTML contact sheet of the built font.
- `icons/product-src-variants/`: gate-only alternative drawings (not in the font).
- `scripts/review/stage-extension.mjs`, `scripts/review/capture.mjs`, `scripts/review/run-gate.mjs`, `scripts/review/contact-sheet.mjs`: gate screenshot procedure.
- `review/workspace/`, `review/profile/`, `review/helper-extension/`, `review/jobs/gate-1.json`: fixtures for the gate run.
- `docs/qa/2.0-gate-1/`: committed contact sheets, manifest and gate checklist.
- `test/*.test.mjs` and `test/fixtures/`: `node:test` suites.

Modified:

- `scripts/validate.mjs` (rewritten as an orchestrator), `scripts/build-product-icons.mjs` (thin CLI), `src/theme-definition.mjs`, `scripts/build-themes.mjs` (unchanged API), `icons/product-icon-map.json` (drawing-based), `icons/product-src/*` (replaced), `icons/product-icon-theme.json` and the WOFF (regenerated), `themes/*.json` (regenerated), `package.json`, `.gitignore`, `.vscodeignore`, `icons/README.md`, `docs/research/vscode-1.141-icon-inventory.md`.

---

## Part A: validation first (spec section 8)

### Task 1: Staged validator foundation

Split the 224-line `scripts/validate.mjs` into check modules with stage tags, without changing what passes today.

**Files:**
- Create: `src/color.mjs`, `scripts/lib/report.mjs`, `scripts/lib/checks/package.mjs`, `scripts/lib/checks/color-themes.mjs`, `scripts/lib/checks/product-icons.mjs`, `scripts/validation-stage.json`, `test/color.test.mjs`, `test/report.test.mjs`
- Modify: `scripts/validate.mjs` (rewrite), `src/theme-definition.mjs:43-51` (use `contrast` from `src/color.mjs`), `package.json` (scripts, devDependency), `.gitignore`, `.vscodeignore`

**Interfaces:**
- Produces: `src/color.mjs` exports `hexes(text) -> string[]`, `rgba(hex) -> [r,g,b,a]`, `composite(fg, bg) -> [r,g,b]`, `luminance(colorOrRgb) -> number`, `contrast(a, b) -> number`, `compositedContrast(fg, bg, surface) -> number`, `hsv(hex) -> { hue, chroma, max }`, `isGreenAccent(hex) -> boolean`.
- Produces: `scripts/lib/report.mjs` exports `loadStageConfig(root) -> { enforce: string[] }`, `parseArgs(argv) -> { release, verbose, only }`, `isEnforced(stage, options) -> boolean`, `createReport(options) -> { fail(stage, message), warn(message), result() -> { errors, pending, warnings } }`, `formatResult(result, { verbose, enforced }) -> string`. A problem is `{ stage, message }`.
- Produces: check functions take `(context, report)` and only call `report.fail(stage, message)` / `report.warn(message)`.

- [ ] **Step 1: Install dependencies and add the test runner**

```bash
cd ~/projects/Spellbound-Themes
npm ci
npm install --save-dev --save-exact svg-pathdata@7.2.0
```

Edit `package.json` `scripts` to:

```json
"scripts": {
  "build": "node scripts/build-themes.mjs && node scripts/build-product-icons.mjs",
  "build:product-icons": "node scripts/build-product-icons.mjs",
  "test": "node --test",
  "validate": "node scripts/validate.mjs",
  "package": "npm run build && node scripts/validate.mjs --release && vsce package --no-dependencies --baseImagesUrl https://raw.githubusercontent.com/WitchyNibbles/Spellbound-Themes/main --baseContentUrl https://github.com/WitchyNibbles/Spellbound-Themes/blob/main && node scripts/normalize-vsix.mjs"
}
```

`--release` makes packaging enforce every stage, so a half-finished 2.0 can never be packaged. Append `review-out/` to `.gitignore`. Append these lines to `.vscodeignore`:

```
test/**
review/**
review-out/**
icons/product-src-variants/**
```

- [ ] **Step 2: Write the failing tests**

`test/color.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { compositedContrast, contrast, hexes, isGreenAccent } from '../src/color.mjs';

test('contrast matches WCAG reference values', () => {
  assert.equal(contrast('#FFFFFF', '#000000'), 21);
  assert.equal(contrast('#0E7553', '#FFF9FD').toFixed(2), '5.48');
  assert.equal(contrast('#6E5A80', '#0D0916').toFixed(2), '3.22');
});

test('alpha colours are composited over the surface before measuring', () => {
  assert.ok(compositedContrast('#F8F2FF', '#633B79AA', '#0D0916') > 4.5);
});

test('green detection: mint is green, cyan and gold are not', () => {
  assert.equal(isGreenAccent('#74E8B8'), true);
  assert.equal(isGreenAccent('#0E7553'), true);
  assert.equal(isGreenAccent('#74D7E8'), false);
  assert.equal(isGreenAccent('#FFD477'), false);
});

test('hexes finds 6- and 8-digit colours', () => {
  assert.deepEqual(hexes('a #12ABef b #633B79AA'), ['#12ABef', '#633B79AA']);
});
```

`test/report.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createReport, formatResult, isEnforced, parseArgs } from '../scripts/lib/report.mjs';

test('only enforced stages fail the run; the rest are pending', () => {
  const report = createReport({ enforce: ['base'] });
  report.fail('base', 'broken');
  report.fail('file-icons', 'later');
  const { errors, pending } = report.result();
  assert.deepEqual(errors.map((e) => e.message), ['broken']);
  assert.deepEqual(pending.map((e) => e.message), ['later']);
});

test('--release enforces every stage', () => {
  assert.equal(isEnforced('file-icons', { enforce: ['base'], release: true }), true);
});

test('--only narrows to the named stages and hides the rest', () => {
  const report = createReport({ enforce: ['base'], only: ['color-themes'] });
  report.fail('base', 'a');
  report.fail('color-themes', 'b');
  const { errors, pending } = report.result();
  assert.deepEqual(errors.map((e) => e.message), ['b']);
  assert.deepEqual(pending, []);
});

test('parseArgs reads the three options', () => {
  assert.deepEqual(parseArgs(['--only', 'a,b', '--verbose']), { release: false, verbose: true, only: ['a', 'b'] });
  assert.throws(() => parseArgs(['--nope']), /Unknown option/);
});

test('formatResult summarises pending stages and warnings', () => {
  const text = formatResult({ errors: [], pending: [{ stage: 'release', message: 'x' }], warnings: ['w'] }, { enforced: ['base'] });
  assert.match(text, /1 pending problems in stages not yet enforced: release \(1\)/);
  assert.match(text, /⚠ w/);
  assert.match(text, /✓ WitchyNibbles package validation passed \(enforced: base\)/);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/color.mjs` and `scripts/lib/report.mjs`.

- [ ] **Step 4: Write `src/color.mjs`**

```js
// Colour math shared by the theme generator and the validator (WCAG 2.x relative luminance).
export const hexes = (text) => text.match(/#[0-9a-f]{6}(?:[0-9a-f]{2})?/gi) ?? [];

export const rgba = (hex) => [1, 3, 5]
  .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
  .concat(hex.length >= 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1);

export const composite = (foreground, background) => {
  const fg = rgba(foreground);
  const bg = rgba(background);
  const alpha = fg[3] + bg[3] * (1 - fg[3]);
  return fg.slice(0, 3).map((channel, index) => ((channel * fg[3]) + (bg[index] * bg[3] * (1 - fg[3]))) / alpha);
};

export const luminance = (color) => {
  const rgb = (Array.isArray(color) ? color : rgba(color)).slice(0, 3);
  return rgb.reduce((sum, channel, index) => {
    const linear = channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);
};

export const contrast = (first, second) => {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};

export const compositedContrast = (foreground, background, surface) =>
  contrast(composite(foreground, surface), composite(background, surface));

export function hsv(hex) {
  const rgb = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  const chroma = max - min;
  let hue = 0;
  if (chroma) {
    const [r, g, b] = rgb;
    const sector = max === r ? (g - b) / chroma : max === g ? 2 + (b - r) / chroma : 4 + (r - g) / chroma;
    hue = (sector * 60 + 360) % 360;
  }
  return { hue, chroma, max };
}

// The 1.2.1 green-accent rule: hue 75-165, visibly saturated, not near-black.
export const isGreenAccent = (hex) => {
  const { hue, chroma, max } = hsv(hex);
  return hue >= 75 && hue <= 165 && chroma > 24 && max > 95;
};
```

In `src/theme-definition.mjs`, delete the local `contrastRatio` function (lines 43-51), add `import { contrast } from './color.mjs';` at the top, and replace `contrastRatio(settings.foreground, c.editor)` with `contrast(settings.foreground, c.editor)`.

- [ ] **Step 5: Write `scripts/lib/report.mjs`**

```js
import fs from 'node:fs';
import path from 'node:path';

export function loadStageConfig(root) {
  const file = path.join(root, 'scripts', 'validation-stage.json');
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(config.enforce)) throw new Error(`${file} must list stages in "enforce"`);
  return { enforce: config.enforce };
}

export function parseArgs(argv) {
  const options = { release: false, verbose: false, only: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--release') options.release = true;
    else if (arg === '--verbose') options.verbose = true;
    else if (arg === '--only') options.only = String(argv[++index] ?? '').split(',').filter(Boolean);
    else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

export function isEnforced(stage, { enforce = [], release = false, only = null }) {
  if (only) return only.includes(stage);
  return release || enforce.includes(stage);
}

export function createReport(options) {
  const problems = [];
  const warnings = [];
  return {
    fail(stage, message) { problems.push({ stage, message }); },
    warn(message) { warnings.push(message); },
    result() {
      const errors = problems.filter((problem) => isEnforced(problem.stage, options));
      const pending = options.only ? [] : problems.filter((problem) => !isEnforced(problem.stage, options));
      return { errors, pending, warnings: [...warnings] };
    },
  };
}

export function formatResult({ errors, pending, warnings }, { verbose = false, enforced = [] } = {}) {
  const lines = errors.map(({ stage, message }) => `✗ [${stage}] ${message}`);
  if (pending.length) {
    const counts = Object.entries(Object.groupBy(pending, (problem) => problem.stage))
      .map(([stage, items]) => `${stage} (${items.length})`);
    lines.push(`… ${pending.length} pending problems in stages not yet enforced: ${counts.join(', ')}${verbose ? '' : ' (use --verbose to list)'}`);
    if (verbose) lines.push(...pending.map(({ stage, message }) => `  · [${stage}] ${message}`));
  }
  lines.push(...warnings.map((warning) => `⚠ ${warning}`));
  if (!errors.length) lines.push(`✓ WitchyNibbles package validation passed (enforced: ${enforced.join(', ')})`);
  return lines.join('\n');
}
```

`scripts/validation-stage.json`:

```json
{
  "$comment": "Stages that npm run validate enforces. Phases append stage names as their work lands; validate --release enforces every stage.",
  "enforce": ["base"]
}
```

- [ ] **Step 6: Move the existing checks into modules (behaviour unchanged)**

`scripts/lib/checks/package.mjs`:

```js
export function checkPackage({ packageJson, exists, readFile }, report) {
  const fail = (message) => report.fail('base', message);
  const relative = (contributionPath) => contributionPath.replace(/^\.\//, '');
  for (const contribution of packageJson.contributes?.themes ?? []) {
    if (!exists(relative(contribution.path))) fail(`Missing theme contribution: ${contribution.path}`);
  }
  for (const contribution of packageJson.contributes?.iconThemes ?? []) {
    if (!exists(relative(contribution.path))) fail(`Missing icon theme contribution: ${contribution.path}`);
  }
  if (packageJson.icon && !exists(packageJson.icon)) fail(`Missing extension icon: ${packageJson.icon}`);
  if (packageJson.icon && exists(packageJson.icon)) {
    const icon = readFile(packageJson.icon);
    if (icon.readUInt32BE(0) !== 0x89504e47 || icon.readUInt32BE(16) < 128 || icon.readUInt32BE(20) < 128) {
      fail('Extension icon must be a PNG at least 128x128');
    }
  }
}
```

`scripts/lib/checks/color-themes.mjs` (parity version; Task 2 extends it):

```js
import { compositedContrast, contrast, hexes, isGreenAccent } from '../../../src/color.mjs';

export const REQUIRED_SEMANTIC = ['namespace', 'type', 'class', 'enum', 'interface', 'struct', 'typeParameter', 'parameter', 'variable', 'property', 'enumMember', 'decorator', 'function', 'method', 'macro', 'comment', '*.readonly', '*.declaration'];

export const ANSI_KEYS = [
  'terminal.ansiBlack', 'terminal.ansiRed', 'terminal.ansiGreen', 'terminal.ansiYellow',
  'terminal.ansiBlue', 'terminal.ansiMagenta', 'terminal.ansiCyan', 'terminal.ansiWhite',
  'terminal.ansiBrightBlack', 'terminal.ansiBrightRed', 'terminal.ansiBrightGreen', 'terminal.ansiBrightYellow',
  'terminal.ansiBrightBlue', 'terminal.ansiBrightMagenta', 'terminal.ansiBrightCyan', 'terminal.ansiBrightWhite',
];

const TEXT_PAIRS = [
  ['editor.foreground', 'editor.background', 'editor'],
  ['sideBar.foreground', 'sideBar.background', 'sidebar'],
  ['terminal.foreground', 'terminal.background', 'terminal'],
];

const STATE_PAIRS = [
  ['editor.foreground', 'editor.selectionBackground', 'editor.background', 'editor selection'],
  ['editor.foreground', 'editor.selectionHighlightBackground', 'editor.background', 'editor selection highlight'],
  ['editor.foreground', 'editor.inactiveSelectionBackground', 'editor.background', 'editor inactive selection'],
  ['editor.foreground', 'diffEditor.insertedTextBackground', 'editor.background', 'inserted diff text'],
  ['editor.foreground', 'diffEditor.removedTextBackground', 'editor.background', 'removed diff text'],
  ['list.activeSelectionForeground', 'list.activeSelectionBackground', 'sideBar.background', 'active list selection'],
  ['list.inactiveSelectionForeground', 'list.inactiveSelectionBackground', 'sideBar.background', 'inactive list selection'],
  ['list.hoverForeground', 'list.hoverBackground', 'sideBar.background', 'list hover'],
  ['list.focusForeground', 'list.focusBackground', 'sideBar.background', 'list focus'],
];

export function checkThemeContributions(packageJson, report) {
  const themes = packageJson.contributes?.themes ?? [];
  if (themes.length !== 3) report.fail('base', `Expected 3 color themes, found ${themes.length}`);
}

export function checkThemeFile({ relative, theme }, report) {
  const fail = (message) => report.fail('base', `${relative} ${message}`);
  for (const color of hexes(JSON.stringify(theme))) {
    if (isGreenAccent(color)) fail(`contains a green accent: ${color}`);
  }
  const colors = theme.colors ?? {};
  if (Object.keys(colors).some((key) => /^gitDecoration\..*ResourceBackground$/.test(key))) fail('contains unsupported git decoration background key');
  if (theme.semanticHighlighting !== true) fail('must enable semantic highlighting');
  const semanticKeys = Object.keys(theme.semanticTokenColors ?? {});
  if (REQUIRED_SEMANTIC.some((key) => !semanticKeys.includes(key))) fail(`must define all ${REQUIRED_SEMANTIC.length} required semantic token keys`);
  for (const token of theme.tokenColors ?? []) {
    if (!token.settings?.foreground) fail(`token ${token.name ?? '<unnamed>'} has no foreground`);
  }
  for (const [foreground, background, label] of TEXT_PAIRS) {
    if (colors[foreground] && colors[background]) {
      const ratio = contrast(colors[foreground], colors[background]);
      if (ratio < 4.5) fail(`${label} contrast is ${ratio.toFixed(2)}:1`);
    }
  }
  for (const key of ANSI_KEYS) {
    if (colors[key] && colors['terminal.background']) {
      const ratio = contrast(colors[key], colors['terminal.background']);
      if (ratio < 4.5) fail(`${key} contrast is ${ratio.toFixed(2)}:1 against terminal background`);
    }
  }
  for (const [foreground, background, surface, label] of STATE_PAIRS) {
    if (colors[foreground] && colors[background] && colors[surface]) {
      const ratio = compositedContrast(colors[foreground], colors[background], colors[surface]);
      if (ratio < 4.5) fail(`${label} contrast is ${ratio.toFixed(2)}:1 after alpha compositing`);
    }
  }
}
```

`scripts/lib/checks/product-icons.mjs`: create it with one export, `checkProductIconContribution({ root, packageJson, exists }, report)`. Its body is the current `validate.mjs` code for product icons, moved verbatim: the constants on lines 13-27 (`productIconIds` through `puaFor`), the `productIconContributions` count check on lines 37-40, and the `for (const contribution of productIconContributions)` block on lines 41-128. Make three mechanical substitutions: `fail(` becomes `report.fail('base', `; `exists(...)` and `root` come from the argument; `createRequire` and `crypto` are imported at the top of the module. Task 4 replaces this function, so do not improve it now.

- [ ] **Step 7: Rewrite `scripts/validate.mjs` as the orchestrator**

```js
import fs from 'node:fs';
import path from 'node:path';
import { createReport, formatResult, loadStageConfig, parseArgs } from './lib/report.mjs';
import { checkPackage } from './lib/checks/package.mjs';
import { checkThemeContributions, checkThemeFile } from './lib/checks/color-themes.mjs';
import { checkProductIconContribution } from './lib/checks/product-icons.mjs';

const root = path.resolve(import.meta.dirname, '..');
const options = { ...loadStageConfig(root), ...parseArgs(process.argv.slice(2)) };
const report = createReport(options);
const exists = (relative) => fs.existsSync(path.join(root, relative));
const readFile = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const packageJson = readJson('package.json');

checkPackage({ packageJson, exists, readFile }, report);
checkThemeContributions(packageJson, report);
for (const file of fs.readdirSync(path.join(root, 'themes')).filter((name) => name.endsWith('.json')).sort()) {
  const relative = path.join('themes', file);
  let theme;
  try {
    theme = readJson(relative);
  } catch (error) {
    report.fail('base', `${relative} is invalid JSON: ${error.message}`);
    continue;
  }
  checkThemeFile({ relative, theme }, report);
}
checkProductIconContribution({ root, packageJson, exists }, report);

const result = report.result();
const enforced = options.only ?? (options.release ? ['every stage'] : options.enforce);
console[result.errors.length ? 'error' : 'log'](formatResult(result, { verbose: options.verbose, enforced }));
if (result.errors.length) process.exitCode = 1;
```

- [ ] **Step 8: Run tests and the validator**

Run: `npm test`
Expected: PASS (9 tests).

Run: `npm run build && npm run validate && git status --short themes icons`
Expected: `✓ WitchyNibbles package validation passed (enforced: base)`, and no changes under `themes/` or `icons/` (the refactor regenerates identical files).

Run: `npm run validate -- --release`
Expected: the same pass line with `(enforced: every stage)`.

- [ ] **Step 9: Commit**

```bash
git add src/color.mjs src/theme-definition.mjs scripts/validate.mjs scripts/validation-stage.json scripts/lib test package.json package-lock.json .gitignore .vscodeignore
git commit -m "Split the validator into staged check modules"
```

---

### Task 2: Colour-theme checks from section 8 (red)

**Files:**
- Create: `src/witchyterm-moonlit-candle.scheme.json`, `test/color-theme-checks.test.mjs`, `test/witchyterm-pin.test.mjs`
- Modify: `scripts/lib/checks/color-themes.mjs`, `scripts/validate.mjs`, `scripts/validation-stage.json`

**Interfaces:**
- Consumes: `createReport`, `contrast`, `compositedContrast`, `hexes`, `isGreenAccent` (Task 1).
- Produces (`scripts/lib/checks/color-themes.mjs`): `WT_TO_VSCODE` (Windows Terminal field to VS Code key), `ANSI_FIELDS` (the 16 colour fields), `SCHEME_FIELD_SETS = { full, ansi }`, `PINNED_TERMINAL = { [themeName]: 'full' | 'ansi' }`, `PINNED_THEME_NAMES`, `GREEN_ALLOWLIST`, `SUCCESS_KEYS`, `WARNING_KEYS`, `ON_COLOR_PAIRS`, `schemeToVSCodeColors(scheme, fieldSet) -> { [vscodeKey]: hex }`, `checkThemeContributions(packageJson, report)`, `checkThemeFile({ relative, theme, scheme }, report)`. Task 9's theme generator mirrors `WT_TO_VSCODE`.

**Decision 2:** `PINNED_TERMINAL['WitchyNibbles Moonlit']` is `'full'`, the same as Moonlit Candle; Task 9 generates it. The comment above `PINNED_TERMINAL` names the decision.

- [ ] **Step 1: Pin the witchyterm scheme**

```bash
cp ../witchyterm/dist/windows-terminal/moonlit-candle.scheme.json src/witchyterm-moonlit-candle.scheme.json
```

`test/witchyterm-pin.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sibling = path.join(root, '..', 'witchyterm', 'dist', 'windows-terminal', 'moonlit-candle.scheme.json');

test('the pinned scheme still equals witchyterm (skipped when the sibling repo is absent)', (t) => {
  if (!fs.existsSync(sibling)) return t.skip('../witchyterm not checked out');
  const pinned = JSON.parse(fs.readFileSync(path.join(root, 'src', 'witchyterm-moonlit-candle.scheme.json'), 'utf8'));
  assert.deepEqual(pinned, JSON.parse(fs.readFileSync(sibling, 'utf8')));
});
```

- [ ] **Step 2: Write the failing check tests**

`test/color-theme-checks.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createReport } from '../scripts/lib/report.mjs';
import { REQUIRED_SEMANTIC, checkThemeContributions, checkThemeFile, schemeToVSCodeColors } from '../scripts/lib/checks/color-themes.mjs';
import scheme from '../src/witchyterm-moonlit-candle.scheme.json' with { type: 'json' };

const run = (fn) => {
  const report = createReport({ enforce: ['base', 'color-themes'] });
  fn(report);
  return report.result().errors.map((error) => error.message);
};

const theme = (name, { colors = {}, tokenColors, semantic = {} } = {}) => ({
  name,
  type: 'dark',
  semanticHighlighting: true,
  semanticTokenColors: { ...Object.fromEntries(REQUIRED_SEMANTIC.map((key) => [key, '#F3EAF7'])), ...semantic },
  colors: {
    'editor.background': '#0D0916', 'editor.foreground': '#F3EAF7',
    'gitDecoration.addedResourceForeground': '#77D9FF', 'editorWarning.foreground': '#FFB86B',
    ...colors,
  },
  tokenColors: tokenColors ?? [
    { name: 'Keywords', scope: ['keyword', 'storage.type'], settings: { foreground: '#B99AFF', fontStyle: 'bold' } },
    { name: 'Operators', scope: ['keyword.operator'], settings: { foreground: '#D3B4FF', fontStyle: '' } },
  ],
});
const check = (t) => run((report) => checkThemeFile({ relative: 't.json', theme: t, scheme }, report));
const candleColors = () => schemeToVSCodeColors(scheme, 'full');

test('four themes, Moonlit Candle first', () => {
  const messages = run((report) => checkThemeContributions({ contributes: { themes: [{ label: 'WitchyNibbles Moonlit' }] } }, report));
  assert.ok(messages.includes('Expected 4 color themes, found 1'));
  assert.ok(messages.includes('WitchyNibbles Moonlit Candle must be the first color theme'));
});

test('a clean theme passes', () => {
  assert.deepEqual(check(theme('Test')), []);
});

test('bold outside keyword and storage.type is rejected', () => {
  const messages = check(theme('Test', { tokenColors: [
    { name: 'Functions', scope: ['entity.name.function'], settings: { foreground: '#FFD477', fontStyle: 'bold' } },
  ] }));
  assert.ok(messages.some((m) => m.includes('rule "Functions" sets bold on entity.name.function')));
});

test('a child scope without fontStyle inherits bold and is rejected', () => {
  const messages = check(theme('Test', { tokenColors: [
    { name: 'Keywords', scope: ['keyword'], settings: { foreground: '#B99AFF', fontStyle: 'bold' } },
    { name: 'Operators', scope: ['keyword.operator'], settings: { foreground: '#D3B4FF' } },
  ] }));
  assert.ok(messages.some((m) => m.includes('rule "Operators" scope keyword.operator inherits bold from keyword')));
});

test('bold semantic tokens other than keywords are rejected', () => {
  const messages = check(theme('Test', { semantic: { function: { foreground: '#FFD477', bold: true } } }));
  assert.ok(messages.some((m) => m.includes('semantic token function sets bold')));
});

test('green is allowed only from the per-theme allowlist', () => {
  assert.ok(check(theme('Test', { colors: { 'charts.green': '#74E8B8' } })).some((m) => m.includes('green accent outside the success allowlist: #74E8B8')));
  assert.equal(check(theme('WitchyNibbles Moonlit Candle', { colors: { ...candleColors() } })).some((m) => m.includes('green')), false);
  assert.ok(check(theme('WitchyNibbles Moonlit Candle', { colors: { ...candleColors(), 'charts.green': '#3DDC84' } })).some((m) => m.includes('#3DDC84')));
});

test('Moonlit Candle terminal must equal the full witchyterm scheme', () => {
  const messages = check(theme('WitchyNibbles Moonlit Candle', { colors: { ...candleColors(), 'terminal.ansiGreen': '#000000', 'terminal.background': '#08060D' } }));
  assert.ok(messages.includes('t.json terminal.ansiGreen is #000000, expected #74E8B8 (witchyterm green)'));
  assert.ok(messages.includes('t.json terminal.background is #08060D, expected #0D0916 (witchyterm background)'));
});

test('Moonlit is held to the full scheme too (decision 2)', () => {
  const messages = check(theme('WitchyNibbles Moonlit', { colors: { ...schemeToVSCodeColors(scheme, 'full'), 'terminal.background': '#08060D', 'terminal.ansiRed': '#FF0000' } }));
  assert.ok(messages.some((m) => m.includes('terminal.ansiRed is #FF0000')));
  assert.ok(messages.includes('t.json terminal.background is #08060D, expected #0D0916 (witchyterm background)'));
});

test('unpinned themes keep the 4.5:1 ANSI contrast rule', () => {
  const messages = check(theme('Test', { colors: { 'terminal.background': '#0D0916', 'terminal.ansiBlack': '#1D1230' } }));
  assert.ok(messages.some((m) => m.includes('terminal.ansiBlack contrast is')));
});

test('success and warning colours need 4.5:1 on the editor', () => {
  const messages = check(theme('Test', { colors: { 'gitDecoration.addedResourceForeground': '#2E4A3F' } }));
  assert.ok(messages.some((m) => m.startsWith('t.json success gitDecoration.addedResourceForeground #2E4A3F is')));
});

test('foregrounds on accent fills need 4.5:1', () => {
  const messages = check(theme('Test', { colors: { 'badge.background': '#FF67B7', 'badge.foreground': '#F3EAF7' } }));
  assert.ok(messages.some((m) => m.startsWith('t.json badge.foreground on badge.background is')));
});

test('every token colour needs 4.5:1 on the editor', () => {
  const messages = check(theme('Test', { tokenColors: [{ name: 'Murky', scope: ['comment'], settings: { foreground: '#333333', fontStyle: 'italic' } }] }));
  assert.ok(messages.some((m) => m.startsWith('t.json token "Murky" #333333 is')));
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test test/color-theme-checks.test.mjs`
Expected: FAIL: `schemeToVSCodeColors` is not exported, and the new messages are missing.

- [ ] **Step 4: Replace `scripts/lib/checks/color-themes.mjs`**

Keep `REQUIRED_SEMANTIC`, `ANSI_KEYS`, `TEXT_PAIRS` and `STATE_PAIRS` from Task 1 exactly as they are, and replace everything after them with:

```js
// Spec section 3.1: Windows Terminal field -> VS Code colour key.
export const WT_TO_VSCODE = Object.freeze({
  background: 'terminal.background', foreground: 'terminal.foreground',
  cursorColor: 'terminalCursor.foreground', selectionBackground: 'terminal.selectionBackground',
  black: 'terminal.ansiBlack', red: 'terminal.ansiRed', green: 'terminal.ansiGreen', yellow: 'terminal.ansiYellow',
  blue: 'terminal.ansiBlue', purple: 'terminal.ansiMagenta', cyan: 'terminal.ansiCyan', white: 'terminal.ansiWhite',
  brightBlack: 'terminal.ansiBrightBlack', brightRed: 'terminal.ansiBrightRed', brightGreen: 'terminal.ansiBrightGreen',
  brightYellow: 'terminal.ansiBrightYellow', brightBlue: 'terminal.ansiBrightBlue', brightPurple: 'terminal.ansiBrightMagenta',
  brightCyan: 'terminal.ansiBrightCyan', brightWhite: 'terminal.ansiBrightWhite',
});
export const ANSI_FIELDS = Object.keys(WT_TO_VSCODE).slice(4);
export const SCHEME_FIELD_SETS = Object.freeze({ full: Object.keys(WT_TO_VSCODE), ansi: ANSI_FIELDS });

// Themes whose terminal equals the pinned witchyterm scheme (section 8 replaces their ANSI contrast check).
// Author decision 2: Moonlit takes the full scheme, like Moonlit Candle.
export const PINNED_TERMINAL = Object.freeze({
  'WitchyNibbles Moonlit Candle': 'full',
  'WitchyNibbles Moonlit': 'full',
});
export const PINNED_THEME_NAMES = Object.keys(PINNED_TERMINAL);

// Section 8: the green ban narrowed to the settled success-mint values. Coven Contrast has no entry.
export const GREEN_ALLOWLIST = Object.freeze({
  'WitchyNibbles Moonlit Candle': ['#74E8B8', '#9DF2CE'],
  'WitchyNibbles Moonlit': ['#74E8B8', '#9DF2CE'],
  'WitchyNibbles Daydream': ['#0E7553'],
});

export const SUCCESS_KEYS = ['gitDecoration.addedResourceForeground', 'editorGutter.addedBackground', 'notebookStatusSuccessIcon.foreground', 'testing.iconPassed'];
export const WARNING_KEYS = ['editorWarning.foreground', 'notificationsWarningIcon.foreground'];
const REQUIRED_STATUS_KEYS = ['gitDecoration.addedResourceForeground', 'editorWarning.foreground'];

// Section 3.1 pins dark text on pink and gold fills; this keeps every theme's filled controls readable.
export const ON_COLOR_PAIRS = [
  ['button.foreground', 'button.background'],
  ['button.foreground', 'button.hoverBackground'],
  ['badge.foreground', 'badge.background'],
  ['activityBarBadge.foreground', 'activityBarBadge.background'],
  ['statusBarItem.remoteForeground', 'statusBarItem.remoteBackground'],
  ['statusBarItem.prominentForeground', 'statusBarItem.prominentBackground'],
  ['chat.avatarForeground', 'chat.avatarBackground'],
];

const isBoldScope = (scope) => scope === 'keyword'
  || (scope.startsWith('keyword.') && !scope.startsWith('keyword.operator'))
  || scope === 'storage.type' || scope.startsWith('storage.type.');
const scopesOf = (rule) => (Array.isArray(rule.scope) ? rule.scope : String(rule.scope ?? '').split(','))
  .map((scope) => scope.trim().split(/\s+/).pop())
  .filter(Boolean);
const hasStyle = (rule, style) => String(rule.settings?.fontStyle ?? '').split(/\s+/).includes(style);
const upper = (hex) => hex.slice(0, 7).toUpperCase();

export function schemeToVSCodeColors(scheme, fieldSet) {
  return Object.fromEntries(SCHEME_FIELD_SETS[fieldSet].map((field) => [WT_TO_VSCODE[field], scheme[field]]));
}

export function checkThemeContributions(packageJson, report) {
  const themes = packageJson.contributes?.themes ?? [];
  if (themes.length !== 4) report.fail('color-themes', `Expected 4 color themes, found ${themes.length}`);
  if (themes[0]?.label !== 'WitchyNibbles Moonlit Candle') report.fail('color-themes', 'WitchyNibbles Moonlit Candle must be the first color theme');
}

export function checkThemeFile({ relative, theme, scheme }, report) {
  const base = (message) => report.fail('base', `${relative} ${message}`);
  const fail = (message) => report.fail('color-themes', `${relative} ${message}`);
  const colors = theme.colors ?? {};
  const editor = colors['editor.background'];

  // Kept from 1.2.1.
  if (Object.keys(colors).some((key) => /^gitDecoration\..*ResourceBackground$/.test(key))) base('contains unsupported git decoration background key');
  if (theme.semanticHighlighting !== true) base('must enable semantic highlighting');
  const semanticKeys = Object.keys(theme.semanticTokenColors ?? {});
  if (REQUIRED_SEMANTIC.some((key) => !semanticKeys.includes(key))) base(`must define all ${REQUIRED_SEMANTIC.length} required semantic token keys`);
  for (const token of theme.tokenColors ?? []) if (!token.settings?.foreground) base(`token ${token.name ?? '<unnamed>'} has no foreground`);
  for (const [foreground, background, label] of TEXT_PAIRS) {
    if (colors[foreground] && colors[background]) {
      const ratio = contrast(colors[foreground], colors[background]);
      if (ratio < 4.5) base(`${label} contrast is ${ratio.toFixed(2)}:1`);
    }
  }
  for (const [foreground, background, surface, label] of STATE_PAIRS) {
    if (colors[foreground] && colors[background] && colors[surface]) {
      const ratio = compositedContrast(colors[foreground], colors[background], colors[surface]);
      if (ratio < 4.5) base(`${label} contrast is ${ratio.toFixed(2)}:1 after alpha compositing`);
    }
  }

  // Green: allowlist instead of a blanket ban.
  const allowed = (GREEN_ALLOWLIST[theme.name] ?? []).map(upper);
  for (const color of new Set(hexes(JSON.stringify(theme)).map(upper))) {
    if (isGreenAccent(color) && !allowed.includes(color)) fail(`contains a green accent outside the success allowlist: ${color}`);
  }

  // Terminal: equality for pinned themes, contrast for the others.
  const fieldSet = PINNED_TERMINAL[theme.name];
  if (fieldSet) {
    for (const [key, expected] of Object.entries(schemeToVSCodeColors(scheme, fieldSet))) {
      const field = Object.keys(WT_TO_VSCODE).find((name) => WT_TO_VSCODE[name] === key);
      if ((colors[key] ?? '').toUpperCase() !== expected.toUpperCase()) fail(`${key} is ${colors[key] ?? 'unset'}, expected ${expected} (witchyterm ${field})`);
    }
  } else {
    for (const key of ANSI_KEYS) {
      if (colors[key] && colors['terminal.background']) {
        const ratio = contrast(colors[key], colors['terminal.background']);
        if (ratio < 4.5) base(`${key} contrast is ${ratio.toFixed(2)}:1 against terminal background`);
      }
    }
  }

  // Typography: bold only on keyword and storage.type scopes, and no silent inheritance of bold.
  const boldScopes = [];
  for (const rule of theme.tokenColors ?? []) {
    if (!hasStyle(rule, 'bold')) continue;
    for (const scope of scopesOf(rule)) {
      if (isBoldScope(scope)) boldScopes.push(scope);
      else fail(`rule "${rule.name}" sets bold on ${scope}; bold is reserved for keyword and storage.type scopes`);
    }
  }
  const allBold = (theme.tokenColors ?? []).filter((rule) => hasStyle(rule, 'bold')).flatMap(scopesOf);
  for (const rule of theme.tokenColors ?? []) {
    if (rule.settings && 'fontStyle' in rule.settings) continue;
    for (const scope of scopesOf(rule)) {
      const parent = allBold.find((boldScope) => scope.startsWith(`${boldScope}.`));
      if (parent) fail(`rule "${rule.name}" scope ${scope} inherits bold from ${parent}; set fontStyle explicitly`);
    }
  }
  for (const [key, value] of Object.entries(theme.semanticTokenColors ?? {})) {
    if (value && typeof value === 'object' && value.bold === true && !key.startsWith('keyword')) fail(`semantic token ${key} sets bold; bold is reserved for keywords`);
  }

  // Every token colour reaches 4.5:1 on the editor.
  if (editor) {
    for (const rule of theme.tokenColors ?? []) {
      const foreground = rule.settings?.foreground;
      if (foreground && contrast(foreground, editor) < 4.5) fail(`token "${rule.name}" ${foreground} is ${contrast(foreground, editor).toFixed(2)}:1 on editor.background (needs 4.5:1)`);
    }
    for (const [key, value] of Object.entries(theme.semanticTokenColors ?? {})) {
      const foreground = typeof value === 'string' ? value : value?.foreground;
      if (foreground && contrast(foreground, editor) < 4.5) fail(`semantic token ${key} ${foreground} is ${contrast(foreground, editor).toFixed(2)}:1 on editor.background (needs 4.5:1)`);
    }
  }

  // Success/added and warning colours.
  for (const key of REQUIRED_STATUS_KEYS) if (!colors[key]) fail(`must define ${key}`);
  for (const [label, keys] of [['success', SUCCESS_KEYS], ['warning', WARNING_KEYS]]) {
    for (const key of keys) {
      if (colors[key] && editor) {
        const ratio = contrast(colors[key], editor);
        if (ratio < 4.5) fail(`${label} ${key} ${colors[key]} is ${ratio.toFixed(2)}:1 on editor.background (needs 4.5:1)`);
      }
    }
  }

  // Foregrounds on accent fills.
  for (const [foreground, background] of ON_COLOR_PAIRS) {
    if (colors[foreground] && colors[background]) {
      const ratio = contrast(colors[foreground], colors[background]);
      if (ratio < 4.5) fail(`${foreground} on ${background} is ${ratio.toFixed(2)}:1 (needs 4.5:1)`);
    }
  }
}
```

The 1.2.1 blanket green ban is gone: green is now judged only against the allowlist. The `isGreenAccent` import is unchanged.

- [ ] **Step 5: Wire the scheme and the pinned-theme presence check into `scripts/validate.mjs`**

Change the import to `import { PINNED_THEME_NAMES, checkThemeContributions, checkThemeFile } from './lib/checks/color-themes.mjs';`. Before the theme loop add `const scheme = readJson('src/witchyterm-moonlit-candle.scheme.json'); const themeNames = [];`. In the loop, call `checkThemeFile({ relative, theme, scheme }, report); themeNames.push(theme.name);`. After the loop add:

```js
for (const name of PINNED_THEME_NAMES) {
  if (!themeNames.includes(name)) report.fail('color-themes', `Missing pinned theme: ${name}`);
}
```

Set `scripts/validation-stage.json` `enforce` to `["base", "color-themes"]`.

- [ ] **Step 6: Run the tests (green) and the validator (red, as intended)**

Run: `npm test`
Expected: PASS.

Run: `node scripts/validate.mjs --only color-themes`
Expected: FAIL. These are the checks Tasks 7-9 turn green, roughly 60 lines:
- `Expected 4 color themes, found 3`, `WitchyNibbles Moonlit Candle must be the first color theme`, `Missing pinned theme: WitchyNibbles Moonlit Candle`;
- for each of the three theme files: `rule "Keywords" sets bold on storage` and `on storage.modifier`, bold on the Functions, Booleans and Class rules, and inherited bold on `keyword.operator…`, `support.function.builtin`, `support.type.builtin` and `support.type.property-name…` (a 1.2.1 bug that the new check exposes);
- for the dark theme: the `terminal.… is …, expected … (witchyterm …)` lines for every field that differs from the full scheme, including `terminal.background`, `terminal.foreground` and `terminal.selectionBackground` (decision 2).

Run: `node scripts/validate.mjs --only base`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/witchyterm-moonlit-candle.scheme.json scripts/lib/checks/color-themes.mjs scripts/validate.mjs scripts/validation-stage.json test/color-theme-checks.test.mjs test/witchyterm-pin.test.mjs
git commit -m "Add section 8 colour-theme checks (failing until Candle lands)"
```

---

### Task 3: Pinned product icon key list and the extraction script

**Files:**
- Create: `scripts/extract-icon-ids.mjs`, `icons/product-icon-ids.json`, `test/extract-icon-ids.test.mjs`, `test/product-icon-ids.test.mjs`
- Modify: `docs/research/vscode-1.141-icon-inventory.md`

**Interfaces:**
- Produces: `extractRegistrations(source: string) -> Map<id, { kind: 'codicon' | 'alias' | 'registered', default: string | null }>` and `diffPinned(pinned, registrations) -> { missing: string[], changed: { id, pinned, actual }[], unpinned: string[] }`.
- Produces: `icons/product-icon-ids.json`, shaped `{ vscode: { version, commit }, ids: { [id]: { tier: 'core' | 'extra', kind, default, batch } } }`. `batch` is one of `'1' | 'chrome' | 'panel' | 'status' | 'debug' | 'editor' | 'symbols'`, and the validator stage is `product-batch:<batch>`.

**Decisions 4, 5, 7:** pin 12 more keys, all tier `extra`: `debug-breakpoint-unverified`, `debug-breakpoint-conditional-disabled`, `debug-breakpoint-log-disabled`, `debug-breakpoint-conditional-unverified` in the `debug` batch (4 ii/iii); `copilot-warning`, `copilot-snooze`, `copilot-dot` in the `status` batch (5); `panel-right`, `panel-right-off`, `auxiliarybar-left-layout-icon`, `auxiliarybar-left-off-layout-icon`, `panel-bottom` in the `editor` batch (7). The total is 160 keys (132 core + 28 extras). `layout-sidebar-left`, `layout-sidebar-right` and `layout-panel` are never pinned (7). `debug-hint` stays in the `debug` batch; it reuses the moon-breakpoint drawing when that batch is claimed (4 i).

- [ ] **Step 1: Write the failing extraction test**

`test/extract-icon-ids.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { diffPinned, extractRegistrations } from '../scripts/extract-icon-ids.mjs';

// The shape of the minified 1.141 bundle: codicons via fe(id, char|alias), workbench icons via ze(id, default, ...).
const bundle = 'var A={add:fe("add",6e4),files:fe("files",60001),chevronDown:fe("chevron-down",60002),'
  + 'treeItemExpanded:fe("tree-item-expanded","chevron-down"),debugStop:fe("debug-stop",60003)};'
  + 'var x1=ze("explorer-view-icon",A.files,d(1,null)),x2=ze("widget-close",A.add,d(2,null)),'
  + 'x3=ze("debug-stop",A.debugStop,d(3,null)),x4=ze("chained-icon",x1,d(4,null));';

test('extracts codicons, aliases and registered defaults', () => {
  const ids = extractRegistrations(bundle);
  assert.deepEqual(ids.get('explorer-view-icon'), { kind: 'registered', default: 'files' });
  assert.deepEqual(ids.get('tree-item-expanded'), { kind: 'alias', default: 'chevron-down' });
  assert.deepEqual(ids.get('add'), { kind: 'codicon', default: null });
  assert.deepEqual(ids.get('chained-icon'), { kind: 'registered', default: 'explorer-view-icon' });
});

test('first registration wins: a workbench ID that is also a codicon stays a codicon', () => {
  assert.deepEqual(extractRegistrations(bundle).get('debug-stop'), { kind: 'codicon', default: null });
});

test('diffPinned reports missing, changed and unpinned IDs', () => {
  const pinned = { ids: {
    'explorer-view-icon': { kind: 'registered', default: 'files' },
    'widget-close': { kind: 'registered', default: 'close' },
    'gone-icon': { kind: 'codicon', default: null },
  } };
  const { missing, changed, unpinned } = diffPinned(pinned, extractRegistrations(bundle));
  assert.deepEqual(missing, ['gone-icon']);
  assert.deepEqual(changed.map((c) => c.id), ['widget-close']);
  assert.ok(unpinned.includes('add'));
});

test('throws a clear error on an unrecognised bundle', () => {
  assert.throws(() => extractRegistrations('nothing here'), /Could not locate/);
});
```

Run: `node --test test/extract-icon-ids.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 2: Write `scripts/extract-icon-ids.mjs`**

```js
#!/usr/bin/env node
// Diffs the icon registrations in a local VS Code workbench bundle against icons/product-icon-ids.json.
// Run by hand when the pin is refreshed (spec section 8); not part of npm run validate.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_BUNDLE = '/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js';
const escapeName = (name) => name.replace(/\$/g, '\\$');

export function extractRegistrations(source) {
  // Minified names change per build, so find the two functions from calls whose shape is known.
  const codiconFn = source.match(/([\w$]{1,6})\("tree-item-expanded","chevron-down"\)/)?.[1];
  const registerFn = source.match(/([\w$]{1,6})\("explorer-view-icon",/)?.[1];
  if (!codiconFn || !registerFn) throw new Error('Could not locate the codicon table or registerIcon in the bundle');

  const registrations = new Map();
  const camelToId = new Map();
  const codiconCall = new RegExp(`(?:([A-Za-z0-9]+):)?${escapeName(codiconFn)}\\("([a-z0-9-]+)",(?:"([a-z0-9-]+)"|[0-9.e]+)\\)`, 'g');
  for (const [, camel, id, aliasOf] of source.matchAll(codiconCall)) {
    if (camel) camelToId.set(camel, id);
    if (!registrations.has(id)) registrations.set(id, aliasOf ? { kind: 'alias', default: aliasOf } : { kind: 'codicon', default: null });
  }

  // Codicons register at startup before any workbench registerIcon call, so codicon entries win (inventory rule 5).
  const variableToId = new Map();
  const registerCall = new RegExp(`(?:([\\w$]+)=)?${escapeName(registerFn)}\\("([a-z0-9-]+)",([\\w$]+)(?:\\.([A-Za-z0-9]+))?`, 'g');
  for (const [, variable, id, objectOrVariable, property] of source.matchAll(registerCall)) {
    if (variable) variableToId.set(variable, id);
    if (registrations.has(id)) continue;
    const target = property ? (camelToId.get(property) ?? property) : (variableToId.get(objectOrVariable) ?? `?${objectOrVariable}`);
    registrations.set(id, { kind: 'registered', default: target });
  }
  return registrations;
}

export function diffPinned(pinned, registrations) {
  const missing = [];
  const changed = [];
  for (const [id, entry] of Object.entries(pinned.ids)) {
    const actual = registrations.get(id);
    if (!actual) { missing.push(id); continue; }
    if (actual.kind !== entry.kind || (actual.default ?? null) !== (entry.default ?? null)) {
      changed.push({ id, pinned: { kind: entry.kind, default: entry.default ?? null }, actual });
    }
  }
  const unpinned = [...registrations.keys()].filter((id) => !(id in pinned.ids));
  return { missing, changed, unpinned };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bundle = process.argv[2] ?? process.env.VSCODE_WORKBENCH_JS ?? DEFAULT_BUNDLE;
  const pinnedPath = path.resolve(import.meta.dirname, '..', 'icons', 'product-icon-ids.json');
  const pinned = JSON.parse(fs.readFileSync(pinnedPath, 'utf8'));
  const { missing, changed, unpinned } = diffPinned(pinned, extractRegistrations(fs.readFileSync(bundle, 'utf8')));
  console.log(`Pinned list: VS Code ${pinned.vscode.version} (${Object.keys(pinned.ids).length} keys). Bundle: ${bundle}`);
  for (const id of missing) console.log(`✗ missing from the bundle: ${id}`);
  for (const { id, pinned: was, actual } of changed) console.log(`✗ ${id}: pinned ${was.kind} ${was.default}, bundle ${actual.kind} ${actual.default}`);
  console.log(`${unpinned.length} registered IDs are not pinned (extended tier and beyond).`);
  if (missing.length || changed.length) process.exitCode = 1;
  else console.log('✓ the pinned list matches the bundle');
}
```

Run: `node --test test/extract-icon-ids.test.mjs`
Expected: PASS.

- [ ] **Step 3: Seed `icons/product-icon-ids.json` once**

Save this as `scripts/seed-icon-ids.mjs`. Run it once, check its output, then delete it; it is a one-off migration and is not committed. Refreshes later use `extract-icon-ids.mjs` and hand edits.

```js
import fs from 'node:fs';
import { extractRegistrations } from './extract-icon-ids.mjs';

const BUNDLE = '/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js';
const inventory = fs.readFileSync('docs/research/vscode-1.141-icon-inventory.md', 'utf8');
const coreSection = inventory.slice(inventory.indexOf('## Core tier'), inventory.indexOf('## Extended tier'));
const coreIds = [...coreSection.matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((match) => match[1]);
const extras = ['account', 'debug-alt', 'run', 'settings-gear', 'gear', 'ellipsis', 'trash', 'more', 'plus',
  'dialog-close', 'dialog-error', 'dialog-info', 'dialog-warning', 'timeline-view-icon', 'debug-stackframe-dot', 'copilot-unavailable',
  // Author decisions 4, 5 and 7.
  'debug-breakpoint-unverified', 'debug-breakpoint-conditional-disabled', 'debug-breakpoint-log-disabled', 'debug-breakpoint-conditional-unverified',
  'copilot-warning', 'copilot-snooze', 'copilot-dot',
  'panel-right', 'panel-right-off', 'auxiliarybar-left-layout-icon', 'auxiliarybar-left-off-layout-icon', 'panel-bottom'];

// Batch = the review gate that must approve the drawing behind each key (spec section 5.2 groups; batch 1 = section 5.3).
const BATCHES = {
  1: ['explorer-view-icon', 'search-view-icon', 'search', 'source-control-view-icon', 'run-view-icon', 'debug-alt',
    'test-view-icon', 'extensions-view-icon', 'remote-explorer-view-icon', 'accounts-view-bar-icon', 'account',
    'settings-view-bar-icon', 'settings-gear', 'gear', 'extensions-manage', 'notifications-configure',
    'chat-view-icon', 'copilot', 'timeline-view-icon', 'terminal', 'terminal-view-icon',
    'chevron-down', 'tree-item-expanded', 'view-pane-container-expanded', 'search-show-replace', 'find-expanded', 'folding-expanded',
    'view-pane-container-collapsed', 'search-hide-replace', 'find-collapsed', 'folding-collapsed', 'menu-submenu',
    'notifications-expand', 'close', 'widget-close', 'panel-close', 'notifications-clear', 'dialog-close',
    'breadcrumb-separator', 'circle-filled', 'light-bulb', 'gutter-lightbulb', 'error', 'dialog-error', 'testing-failed-icon',
    'bell', 'git-branch', 'debug-breakpoint'],
  chrome: ['arrow-left', 'arrow-right', 'quick-input-back', 'find-previous-match', 'find-next-match',
    'diff-editor-previous-change', 'diff-editor-next-change', 'add', 'plus', 'terminal-new', 'diff-insert',
    'remove', 'diff-remove', 'check', 'toolbar-more', 'ellipsis', 'more'],
  panel: ['output-view-icon', 'debug-console-view-icon', 'markers-view-icon', 'clear-all', 'notifications-clear-all',
    'filter', 'trash', 'terminal-kill', 'panel-maximize'],
  status: ['warning', 'dialog-warning', 'info', 'dialog-info', 'terminal-decoration-error', 'terminal-decoration-success',
    'bell-dot', 'remote', 'sync', 'bracket', 'loading', 'copilot-unavailable', 'copilot-warning', 'copilot-snooze', 'copilot-dot'],
  debug: ['debug-breakpoint-disabled', 'debug-hint', 'debug-breakpoint-conditional', 'debug-breakpoint-log',
    'debug-stackframe', 'debug-stackframe-focused', 'debug-stackframe-dot', 'debug-step-over', 'debug-step-into',
    'debug-step-out', 'debug-start', 'run', 'testing-run-icon', 'testing-run-all-icon', 'debug-continue',
    'debug-pause', 'debug-stop', 'debug-restart', 'testing-passed-icon', 'debug-breakpoint-unverified',
    'debug-breakpoint-conditional-disabled', 'debug-breakpoint-log-disabled', 'debug-breakpoint-conditional-unverified'],
  editor: ['pinned', 'pinned-dirty', 'sparkle', 'new-file', 'new-folder', 'go-to-file', 'symbol-file', 'symbol-folder',
    'collapse-all', 'list-tree', 'discard', 'refresh', 'case-sensitive', 'whole-word', 'regex', 'preserve-case',
    'find-replace', 'find-replace-all', 'search-replace-all', 'split-horizontal', 'split-vertical',
    'panel-left', 'panel-left-off', 'panel-layout-icon', 'panel-layout-icon-off', 'auxiliarybar-right-layout-icon',
    'auxiliarybar-right-off-layout-icon', 'configure-layout-icon', 'panel-right', 'panel-right-off',
    'auxiliarybar-left-layout-icon', 'auxiliarybar-left-off-layout-icon', 'panel-bottom'],
  symbols: ['symbol-class', 'symbol-method', 'symbol-function', 'symbol-field', 'symbol-property', 'symbol-variable',
    'symbol-constant', 'symbol-interface', 'symbol-enum', 'symbol-module', 'symbol-namespace', 'symbol-keyword',
    'symbol-string', 'symbol-text', 'symbol-snippet'],
};

const batchOf = new Map(Object.entries(BATCHES).flatMap(([batch, ids]) => ids.map((id) => [id, batch])));
const registrations = extractRegistrations(fs.readFileSync(BUNDLE, 'utf8'));
const all = [...coreIds.map((id) => [id, 'core']), ...extras.map((id) => [id, 'extra'])];
if (coreIds.length !== 132 || all.length !== 160 || batchOf.size !== 160) throw new Error(`counts: core ${coreIds.length}, all ${all.length}, batched ${batchOf.size}`);
const ids = {};
for (const [id, tier] of all.sort(([a], [b]) => a.localeCompare(b))) {
  const registration = registrations.get(id);
  if (!registration) throw new Error(`${id} is not registered in the bundle`);
  if (!batchOf.has(id)) throw new Error(`${id} has no batch`);
  ids[id] = { tier, kind: registration.kind, default: registration.default, batch: batchOf.get(id) };
}
fs.writeFileSync('icons/product-icon-ids.json', `${JSON.stringify({ vscode: { version: '1.141.0', commit: '2a59476c9bfcb90b3ddc372c36762471b7dfad1c' }, ids }, null, 2)}\n`);
console.log(`wrote ${Object.keys(ids).length} keys`);
```

Run: `node scripts/seed-icon-ids.mjs && rm scripts/seed-icon-ids.mjs`
Expected: `wrote 160 keys`.

Run: `node scripts/extract-icon-ids.mjs`
Expected: `✓ the pinned list matches the bundle`, plus the count of unpinned IDs.

Spot-check the JSON. `timeline-view-icon` is registered with default `history`. `debug-stackframe-dot` and `copilot-unavailable` are codicons. `tree-item-expanded` is an alias of `chevron-down`. `debug-stop` is a codicon.

- [ ] **Step 4: Write the pinned-list test**

`test/product-icon-ids.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import pinned from '../icons/product-icon-ids.json' with { type: 'json' };

const entries = Object.entries(pinned.ids);
const BATCHES = ['1', 'chrome', 'panel', 'status', 'debug', 'editor', 'symbols'];

test('132 core IDs plus 28 named extras', () => {
  assert.equal(entries.filter(([, e]) => e.tier === 'core').length, 132);
  assert.equal(entries.filter(([, e]) => e.tier === 'extra').length, 28);
});

test('the keys added by author decisions 4, 5 and 7 sit in their batches', () => {
  for (const id of ['debug-breakpoint-unverified', 'debug-breakpoint-conditional-disabled', 'debug-breakpoint-log-disabled', 'debug-breakpoint-conditional-unverified']) assert.equal(pinned.ids[id]?.batch, 'debug', id);
  for (const id of ['copilot-warning', 'copilot-snooze', 'copilot-dot']) assert.equal(pinned.ids[id]?.batch, 'status', id);
  for (const id of ['panel-right', 'panel-right-off', 'auxiliarybar-left-layout-icon', 'auxiliarybar-left-off-layout-icon', 'panel-bottom']) assert.equal(pinned.ids[id]?.batch, 'editor', id);
});

test('every key has a known batch and kind', () => {
  for (const [id, entry] of entries) {
    assert.ok(BATCHES.includes(entry.batch), `${id} batch ${entry.batch}`);
    assert.ok(['codicon', 'alias', 'registered'].includes(entry.kind), `${id} kind ${entry.kind}`);
  }
});

test('batch 1 is exactly the 48 IDs behind the 23 first-batch drawings', () => {
  assert.equal(entries.filter(([, e]) => e.batch === '1').length, 48);
});

test('alias IDs that do not inherit are pinned as their own keys', () => {
  for (const id of ['tree-item-expanded', 'toolbar-more', 'menu-submenu', 'quick-input-back', 'dialog-close', 'dialog-error', 'dialog-info', 'dialog-warning', 'plus', 'more']) {
    assert.ok(id in pinned.ids, id);
  }
  assert.equal(pinned.ids['tree-item-expanded'].kind, 'alias');
});

test('IDs that inherit circle-filled are pinned so release forces their own glyphs', () => {
  assert.equal(pinned.ids['terminal-decoration-success'].default, 'circle-filled');
  assert.equal(pinned.ids['terminal-decoration-success'].batch, 'status');
});

test('dropped 1.2.1 keys, including the legacy layout keys (decision 7), are not pinned', () => {
  for (const id of ['home', 'activity-bar-left', 'activity-bar-right', 'menu', 'copy', 'edit', 'save', 'file', 'folder', 'layout-sidebar-left', 'layout-sidebar-right', 'layout-panel']) {
    assert.equal(id in pinned.ids, false, id);
  }
});
```

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Apply the deferred inventory edits (section 8)**

In `docs/research/vscode-1.141-icon-inventory.md`:

1. Replace the bullet `- The full extracted registry (399 workbench IDs with defaults and descriptions) is next to this file: \`reg.tsv\` and \`registry.json\`.` with `- The keys this repo relies on are pinned in \`icons/product-icon-ids.json\` (160 keys with kind, default and batch). \`node scripts/extract-icon-ids.mjs [bundle]\` diffs a local workbench bundle against that pin. The earlier \`reg.tsv\`/\`registry.json\` were never committed.`
2. Add this section before `## Extended tier`:

```markdown
## Registered IDs the core tables omit

Three IDs that a normal 1.141 session shows are missing from the tables above. The 2.0 spec maps them as extras (section 5.1):

| ID (iconDefinitions key) | Kind / default | Where it appears |
|---|---|---|
| `timeline-view-icon` | registered, default `history` | Timeline view icon (only visible when the view leaves the Explorer container) |
| `debug-stackframe-dot` | codicon | Drawn by CSS `::after` over `debug-stackframe` / `debug-stackframe-focused` when paused on a breakpoint |
| `copilot-unavailable` | codicon | Status bar chat entry where completions are off (by default Markdown and plain text) |

Five more registered IDs appear only when the side bars swap sides or in Customize Layout. The spec maps them as extras too (author decision 7):

| ID (iconDefinitions key) | Kind / default | Where it appears |
|---|---|---|
| `panel-right` / `panel-right-off` | registered, default `layout-sidebar-right` / `layout-sidebar-right-off` | Toggle Primary Side Bar when the side bar is on the right |
| `auxiliarybar-left-layout-icon` / `auxiliarybar-left-off-layout-icon` | registered, default `layout-sidebar-left` / `layout-sidebar-left-off` | Toggle Secondary Side Bar when it is on the left |
| `panel-bottom` | registered, default `layout-panel` | Bottom panel in the layout controls |

Decisions 4 and 5 also pin five codicons that no table above lists: `debug-breakpoint-conditional-disabled`, `debug-breakpoint-log-disabled`, `debug-breakpoint-conditional-unverified`, `copilot-snooze` and `copilot-dot`.
```

- [ ] **Step 6: Commit**

```bash
git add scripts/extract-icon-ids.mjs icons/product-icon-ids.json test/extract-icon-ids.test.mjs test/product-icon-ids.test.mjs docs/research/vscode-1.141-icon-inventory.md
git commit -m "Pin the 160 product icon keys and add the bundle diff script"
```

---

### Task 4: Product-icon checks from section 8 (red)

**Files:**
- Create: `scripts/lib/svg-geometry.mjs`, `scripts/lib/product-icon-map.mjs`, `scripts/lib/product-font.mjs`, `test/svg-geometry.test.mjs`, `test/product-icon-checks.test.mjs`
- Modify: `scripts/lib/checks/product-icons.mjs` (rewrite), `scripts/validate.mjs`, `scripts/validation-stage.json`

**Interfaces:**
- Produces (`svg-geometry.mjs`): `parseGlyphSvg(text) -> { viewBox, width, height, elements: string[], paths: { d, fill, fillRule }[] }`, `subpaths(d) -> number[][][]` (flattened polygons), `signedArea(polygon) -> number` (positive = clockwise on screen), `pointInPolygon(point, polygon) -> boolean`, `windingProblems(ds: string[]) -> string[]`, `pathBounds(ds: string[]) -> { minX, maxX, minY, maxY }`, `offGridPoints(d) -> [x, y][]`.
- Produces (`product-icon-map.mjs`): `PRODUCT_FONT = { id, family, file, themeSrc }`, `validateMap(map, { sourceFiles }) -> string[]`, `iconDefinitionsFor(map) -> { [id]: { fontCharacter, fontId } }` (sorted by ID).
- Produces (`product-font.mjs`): `FONT_UNITS_PER_GRID_UNIT = 64`, `FONT_STREAM_OPTIONS` (frozen, without centring flags), `buildFont({ fontId, fontFamily, version, glyphs: { name, codepoint, svg }[] }) -> Promise<Buffer>` (WOFF).
- Produces (`checks/product-icons.mjs`): `checkProductIconContribution({ packageJson, readJson, readFile, exists }, report) -> theme | null`, `checkPinnedCoverage({ pinned, theme }, report)`, `checkProductIconMap({ map, sourceFiles, theme }, report) -> boolean` (true when the map is valid), `glyphRuleProblems(svg) -> { errors, warnings }`, `checkGlyphSources({ svgs }, report)` where `svgs` maps file name to text, `checkBuildFlags({ sources }, report)`, `checkFontGeometry({ woff, map, svgs }, report)`.

- [ ] **Step 1: Write the failing geometry tests**

`test/svg-geometry.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { offGridPoints, parseGlyphSvg, pathBounds, signedArea, subpaths, windingProblems } from '../scripts/lib/svg-geometry.mjs';

test('signed area is positive for clockwise-on-screen paths', () => {
  assert.ok(signedArea(subpaths('M2 2h4v4H2z')[0]) > 0);
  assert.ok(signedArea(subpaths('M2 2v4h4V2z')[0]) < 0);
});

test('a counter-wound hole passes; a same-direction hole is reported', () => {
  assert.deepEqual(windingProblems(['M2 2h12v12H2zM5 5v6h6V5z']), []);
  assert.match(windingProblems(['M2 2h12v12H2zM5 5h6v6H5z'])[0], /wound the same way as its container/);
});

test('an island inside a hole must be wound like the outer shape', () => {
  assert.deepEqual(windingProblems(['M2 2h12v12H2zM4 4v8h8V4zM6 6h4v4H6z']), []);
});

test('overlapping shapes are not containers of each other', () => {
  assert.deepEqual(windingProblems(['M3 4L4 3L13 12L12 13Z M12 3L13 4L4 13L3 12Z']), []);
});

test('arcs are flattened, so circular rings are checked too', () => {
  assert.deepEqual(windingProblems(['M8 2a6 6 0 1 1 0 12a6 6 0 1 1 0-12zM8 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8z']), []);
  assert.equal(windingProblems(['M8 2a6 6 0 1 1 0 12a6 6 0 1 1 0-12zM8 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8z']).length, 1);
});

test('bounds are exact and grid scan flags only off-grid straight segments', () => {
  assert.deepEqual(pathBounds(['M3 6L4 5L8 9L12 5L13 6L8 11Z']), { minX: 3, maxX: 13, minY: 5, maxY: 11 });
  assert.deepEqual(offGridPoints('M2 2h4.5v4H2z'), []);
  assert.ok(offGridPoints('M2.3 2h4v4H2z').length > 0);
});

test('parseGlyphSvg reads root attributes, elements and path data', () => {
  const parsed = parseGlyphSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16"><path fill="currentColor" d="M1 1h2v2H1z"/></svg>');
  assert.equal(parsed.viewBox, '0 0 16 16');
  assert.equal(parsed.width, '16');
  assert.deepEqual(parsed.elements, ['svg', 'path']);
  assert.equal(parsed.paths[0].d, 'M1 1h2v2H1z');
});
```

Run: `node --test test/svg-geometry.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 2: Write `scripts/lib/svg-geometry.mjs`**

```js
import { SVGPathData } from 'svg-pathdata';

const CURVE_STEPS = 16;
const EPSILON = 1e-6;
const attribute = (source, name) => source.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];

export function parseGlyphSvg(text) {
  const rootAttributes = text.match(/<svg\b([^>]*)>/i)?.[1] ?? '';
  return {
    viewBox: attribute(rootAttributes, 'viewBox'),
    width: attribute(rootAttributes, 'width'),
    height: attribute(rootAttributes, 'height'),
    elements: [...text.matchAll(/<([a-zA-Z][\w:-]*)\b/g)].map((match) => match[1].toLowerCase()),
    paths: [...text.matchAll(/<path\b([^>]*)\/?>/gi)].map((match) => ({
      d: attribute(match[1], 'd') ?? '',
      fill: attribute(match[1], 'fill'),
      fillRule: attribute(match[1], 'fill-rule'),
    })),
  };
}

// Flattens path data into closed polygons (arcs become cubics, cubics are sampled).
export function subpaths(d) {
  const data = new SVGPathData(d).toAbs().normalizeHVZ().normalizeST().qtToC().aToC();
  const polygons = [];
  let current = null;
  let pen = [0, 0];
  for (const command of data.commands) {
    if (command.type === SVGPathData.MOVE_TO) {
      current = [[command.x, command.y]];
      polygons.push(current);
    } else if (command.type === SVGPathData.LINE_TO) {
      current.push([command.x, command.y]);
    } else if (command.type === SVGPathData.CURVE_TO) {
      const [x0, y0] = pen;
      for (let step = 1; step <= CURVE_STEPS; step += 1) {
        const t = step / CURVE_STEPS;
        const u = 1 - t;
        current.push([
          u * u * u * x0 + 3 * u * u * t * command.x1 + 3 * u * t * t * command.x2 + t * t * t * command.x,
          u * u * u * y0 + 3 * u * u * t * command.y1 + 3 * u * t * t * command.y2 + t * t * t * command.y,
        ]);
      }
    }
    if ('x' in command && 'y' in command) pen = [command.x, command.y];
  }
  return polygons
    .map((points) => {
      const [first] = points;
      const last = points.at(-1);
      return Math.abs(first[0] - last[0]) < EPSILON && Math.abs(first[1] - last[1]) < EPSILON ? points.slice(0, -1) : points;
    })
    .filter((points) => points.length >= 3);
}

// Positive = clockwise on screen, because SVG y grows downward.
export function signedArea(polygon) {
  let sum = 0;
  for (let index = 0; index < polygon.length; index += 1) {
    const [x1, y1] = polygon[index];
    const [x2, y2] = polygon[(index + 1) % polygon.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

export function pointInPolygon([x, y], polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const containedIn = (inner, outer) => Math.abs(signedArea(inner)) < Math.abs(signedArea(outer))
  && inner.every((point) => pointInPolygon(point, outer));
const centroid = (polygon) => polygon.reduce(([sx, sy], [x, y]) => [sx + x / polygon.length, sy + y / polygon.length], [0, 0]);

// Spec section 4/8: every inner subpath is wound opposite to its immediate container,
// because svgicons2svgfont and svg2ttf ignore fill-rule and fill with nonzero winding.
export function windingProblems(ds) {
  const polygons = ds.flatMap((d) => subpaths(d));
  const problems = [];
  polygons.forEach((inner, index) => {
    const containers = polygons.filter((outer, other) => other !== index && containedIn(inner, outer));
    if (!containers.length) return;
    const parent = containers.reduce((best, next) => (Math.abs(signedArea(next)) < Math.abs(signedArea(best)) ? next : best));
    if (Math.sign(signedArea(inner)) === Math.sign(signedArea(parent))) {
      const [cx, cy] = centroid(inner).map((value) => Number(value.toFixed(2)));
      problems.push(`subpath around (${cx}, ${cy}) is wound the same way as its container, so it renders solid`);
    }
  });
  return problems;
}

export function pathBounds(ds) {
  const { minX, maxX, minY, maxY } = new SVGPathData(ds.join(' ')).getBounds();
  return { minX, maxX, minY, maxY };
}

const onHalfGrid = (value) => Math.abs(value * 2 - Math.round(value * 2)) < 1e-3;

// End points of straight segments that are neither whole nor .5 (soft warning in section 8).
export function offGridPoints(d) {
  const data = new SVGPathData(d).toAbs().normalizeHVZ();
  const points = [];
  let pen = null;
  for (const command of data.commands) {
    if (command.type === SVGPathData.LINE_TO && pen) {
      for (const point of [pen, [command.x, command.y]]) if (!onHalfGrid(point[0]) || !onHalfGrid(point[1])) points.push(point);
    }
    if ('x' in command && 'y' in command) pen = [command.x, command.y];
  }
  return points;
}
```

Run: `node --test test/svg-geometry.test.mjs`
Expected: PASS.

- [ ] **Step 3: Write the failing product-icon check tests**

`test/product-icon-checks.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createReport } from '../scripts/lib/report.mjs';
import { buildFont, FONT_STREAM_OPTIONS } from '../scripts/lib/product-font.mjs';
import { iconDefinitionsFor, validateMap } from '../scripts/lib/product-icon-map.mjs';
import { checkBuildFlags, checkFontGeometry, checkPinnedCoverage, checkProductIconMap, glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';

const svg = (d, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"${extra}><path fill="currentColor" d="${d}"/></svg>`;
const collect = (enforce, fn) => {
  const report = createReport({ enforce });
  fn(report);
  return report.result();
};
const map = (drawings, extra = {}) => ({ fontId: 'witchynibbles-product-icons', fontFamily: 'WitchyNibbles Product Icons', drawings, ...extra });

test('glyph rules: a clean glyph has no errors', () => {
  assert.deepEqual(glyphRuleProblems(svg('M2 2h12v12H2zM5 5v6h6V5z')).errors, []);
});

test('glyph rules reject width, stroke, evenodd, transform, extra elements and bad winding', () => {
  const errors = (text) => glyphRuleProblems(text).errors.join(' | ');
  assert.match(errors(svg('M2 2h4v4H2z', ' width="16"')), /width or height/);
  assert.match(errors(svg('M2 2h4v4H2z').replace('fill="currentColor"', 'fill="currentColor" stroke="#000"')), /stroke/);
  assert.match(errors(svg('M2 2h4v4H2z').replace('fill="currentColor"', 'fill="currentColor" fill-rule="evenodd"')), /evenodd/);
  assert.match(errors(svg('M2 2h4v4H2z').replace('<path', '<path transform="scale(2)"')), /transform/);
  assert.match(errors(svg('M2 2h4v4H2z').replace('</svg>', '<circle r="2"/></svg>')), /only <svg> and <path>/);
  assert.match(errors(svg('M2 2h12v12H2zM5 5h6v6H5z')), /wound the same way/);
});

test('glyph rules warn (not fail) on off-grid straight segments', () => {
  const { errors, warnings } = glyphRuleProblems(svg('M2.3 2h4v4H2z'));
  assert.deepEqual(errors, []);
  assert.match(warnings[0], /off the whole\/half grid/);
});

test('coverage failures are tagged with the batch stage', () => {
  const pinned = { ids: { close: { batch: '1' }, check: { batch: 'chrome' } } };
  const { errors, pending } = collect(['product-batch:1'], (r) => checkPinnedCoverage({ pinned, theme: { iconDefinitions: {} } }, r));
  assert.deepEqual(errors.map((e) => e.stage), ['product-batch:1']);
  assert.deepEqual(pending.map((e) => e.stage), ['product-batch:chrome']);
});

test('map validation: codepoints, IDs, sources', () => {
  const sourceFiles = ['a.svg', 'b.svg', 'orphan.svg'];
  const errors = validateMap(map({
    a: { codepoint: 'E100', ids: ['close', 'widget-close'] },
    b: { codepoint: 'E100', ids: ['close'] },
    c: { codepoint: 'E1', ids: [] },
  }, { retiredCodepoints: ['E0FF'] }), { sourceFiles });
  const text = errors.join(' | ');
  assert.match(text, /b reuses codepoint E100 of a/);
  assert.match(text, /close is listed by both a and b/);
  assert.match(text, /c has invalid codepoint E1/);
  assert.match(text, /c must list at least one icon ID/);
  assert.match(text, /Missing SVG source icons\/product-src\/c\.svg/);
  assert.match(text, /orphan\.svg belongs to no drawing/);
  assert.match(validateMap({ fontId: 'witchynibbles-product-icons', fontFamily: 'WitchyNibbles Product Icons', icons: {} }, { sourceFiles: [] }).join(), /drawing-based format/);
});

test('one codepoint serves every ID of a drawing', () => {
  const defs = iconDefinitionsFor(map({ chevron: { codepoint: 'E10C', ids: ['chevron-down', 'tree-item-expanded'] } }));
  assert.equal(defs['chevron-down'].fontCharacter, '\\E10C');
  assert.equal(defs['tree-item-expanded'].fontCharacter, '\\E10C');
});

test('a stale generated theme is reported', () => {
  const m = map({ a: { codepoint: 'E100', ids: ['close'] } });
  const { errors } = collect(['product-pipeline'], (r) => checkProductIconMap({ map: m, sourceFiles: ['a.svg'], theme: { iconDefinitions: {} } }, r));
  assert.match(errors.map((e) => e.message).join(), /is stale/);
});

test('build flags: centring options are rejected', () => {
  assert.equal('centerHorizontally' in FONT_STREAM_OPTIONS, false);
  const { errors } = collect(['product-pipeline'], (r) => checkBuildFlags({ sources: { 'x.mjs': 'new Stream({ centerVertically: true })' } }, r));
  assert.match(errors[0].message, /x\.mjs sets centerVertically/);
});

test('font geometry: glyph boxes equal source bounds at 64 units per grid unit', async () => {
  const corner = svg('M10 10h4v4h-4z');
  const m = map({ corner: { codepoint: 'E100', ids: ['corner'] } });
  const woff = await buildFont({ fontId: m.fontId, fontFamily: m.fontFamily, version: '2.0', glyphs: [{ name: 'corner', codepoint: 'E100', svg: corner }] });
  assert.deepEqual(collect(['product-pipeline'], (r) => checkFontGeometry({ woff, map: m, svgs: { corner } }, r)).errors, []);
  const moved = collect(['product-pipeline'], (r) => checkFontGeometry({ woff, map: m, svgs: { corner: svg('M9 10h4v4H9z') } }, r));
  assert.match(moved.errors[0].message, /corner glyph box .* differs from its source bounds/);
});
```

Run: `node --test test/product-icon-checks.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 4: Write `scripts/lib/product-icon-map.mjs` and `scripts/lib/product-font.mjs`**

`scripts/lib/product-icon-map.mjs`:

```js
export const PRODUCT_FONT = Object.freeze({
  id: 'witchynibbles-product-icons',
  family: 'WitchyNibbles Product Icons',
  file: 'icons/witchynibbles-product-icons.woff',
  themeSrc: './witchynibbles-product-icons.woff',
});

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Spec section 5.1: one SVG and one codepoint per drawing, many IDs per codepoint.
export function validateMap(map, { sourceFiles }) {
  const errors = [];
  if (map?.fontId !== PRODUCT_FONT.id) errors.push(`product-icon-map.json fontId must be ${PRODUCT_FONT.id}`);
  if (map?.fontFamily !== PRODUCT_FONT.family) errors.push(`product-icon-map.json fontFamily must be ${PRODUCT_FONT.family}`);
  if (!map?.drawings || typeof map.drawings !== 'object' || Array.isArray(map.drawings)) {
    errors.push('product-icon-map.json must have a "drawings" object (drawing-based format, spec section 5.1)');
    return errors;
  }
  const retired = new Set(map.retiredCodepoints ?? []);
  const codepoints = new Map();
  const owners = new Map();
  for (const [name, drawing] of Object.entries(map.drawings)) {
    if (!KEBAB.test(name)) errors.push(`Invalid drawing name: ${name}`);
    const codepoint = drawing?.codepoint ?? '';
    if (!/^E[0-9A-F]{3}$/.test(codepoint)) errors.push(`${name} has invalid codepoint ${codepoint}`);
    else if (codepoints.has(codepoint)) errors.push(`${name} reuses codepoint ${codepoint} of ${codepoints.get(codepoint)}`);
    else if (retired.has(codepoint)) errors.push(`${name} uses retired codepoint ${codepoint}`);
    else codepoints.set(codepoint, name);
    if (!Array.isArray(drawing?.ids) || !drawing.ids.length) errors.push(`${name} must list at least one icon ID`);
    for (const id of drawing?.ids ?? []) {
      if (!KEBAB.test(id)) errors.push(`${name} lists invalid icon ID ${id}`);
      else if (owners.has(id)) errors.push(`${id} is listed by both ${owners.get(id)} and ${name}`);
      else owners.set(id, name);
    }
    if (!sourceFiles.includes(`${name}.svg`)) errors.push(`Missing SVG source icons/product-src/${name}.svg`);
  }
  for (const file of sourceFiles) {
    if (!(file.replace(/\.svg$/, '') in map.drawings)) errors.push(`icons/product-src/${file} belongs to no drawing`);
  }
  return errors;
}

export function iconDefinitionsFor(map) {
  const entries = Object.values(map.drawings).flatMap(({ codepoint, ids }) =>
    ids.map((id) => [id, { fontCharacter: `\\${codepoint}`, fontId: PRODUCT_FONT.id }]));
  return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));
}
```

`scripts/lib/product-font.mjs`:

```js
import { Readable } from 'node:stream';
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont';
import svg2ttf from 'svg2ttf';
import ttf2woff from 'ttf2woff';

export const FONT_UNITS_PER_GRID_UNIT = 64;

// Spec section 4: no centring flags (they move asymmetric glyphs off the grid). With viewBox 0 0 16 16,
// no width/height and usePathBounds off, normalize gives every glyph the same 64 units per grid unit.
export const FONT_STREAM_OPTIONS = Object.freeze({
  fixedWidth: true,
  normalize: true,
  preserveAspectRatio: true,
  fontHeight: 1024,
  descent: 0,
  round: 1e6,
});

export async function buildFont({ fontId, fontFamily, version, glyphs }) {
  if (!glyphs.length) throw new Error('Cannot build a product icon font without drawings');
  const stream = new SVGIcons2SVGFontStream({
    ...FONT_STREAM_OPTIONS,
    fontName: fontFamily,
    fontId,
    metadata: 'Original WitchyNibbles product icon artwork.',
    log: () => {},
  });
  const chunks = [];
  stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise((resolve, reject) => {
    stream.once('end', resolve);
    stream.once('error', reject);
  });
  for (const { name, codepoint, svg } of glyphs) {
    const glyph = Readable.from([svg]);
    glyph.metadata = { name, unicode: [String.fromCodePoint(Number.parseInt(codepoint, 16))] };
    stream.write(glyph);
  }
  stream.end();
  await done;
  const ttf = svg2ttf(Buffer.concat(chunks).toString('utf8'), {
    id: fontId,
    familyname: fontFamily,
    fullname: fontFamily,
    description: 'Original WitchyNibbles product icons for Visual Studio Code.',
    copyright: 'Copyright WitchyNibbles.',
    url: 'https://marketplace.visualstudio.com/publishers/EimiMartinez',
    version,
    ts: 0,
  });
  return Buffer.from(ttf2woff(new Uint8Array(ttf.buffer)).buffer);
}
```

- [ ] **Step 5: Rewrite `scripts/lib/checks/product-icons.mjs`**

```js
import { createRequire } from 'node:module';
import { FONT_STREAM_OPTIONS, FONT_UNITS_PER_GRID_UNIT } from '../product-font.mjs';
import { PRODUCT_FONT, iconDefinitionsFor, validateMap } from '../product-icon-map.mjs';
import { offGridPoints, parseGlyphSvg, pathBounds, windingProblems } from '../svg-geometry.mjs';

const fontkit = createRequire(import.meta.url)('fontkit');
const PIPELINE = 'product-pipeline';
const BOX_TOLERANCE = 2; // font units; svg2ttf rounds to integers and approximates cubics with quadratics

export function checkProductIconContribution({ packageJson, readJson, readFile, exists }, report) {
  const fail = (message) => report.fail('base', message);
  const contributions = packageJson.contributes?.productIconThemes ?? [];
  if (contributions.length !== 1) { fail(`Expected 1 product icon theme contribution, found ${contributions.length}`); return null; }
  const relative = contributions[0].path?.replace(/^\.\//, '');
  if (!relative || !exists(relative)) { fail(`Missing product icon theme contribution: ${contributions[0].path}`); return null; }
  let theme;
  try { theme = readJson(relative); } catch (error) { fail(`${relative} is invalid JSON: ${error.message}`); return null; }
  const fonts = Array.isArray(theme.fonts) ? theme.fonts : [];
  const font = fonts[0];
  if (fonts.length !== 1) fail(`${relative} must declare exactly one custom product icon font`);
  if (font?.id !== PRODUCT_FONT.id) fail(`${relative} must use font id ${PRODUCT_FONT.id}`);
  if (font?.family !== PRODUCT_FONT.family) fail(`${relative} must use font family ${PRODUCT_FONT.family}`);
  const sources = Array.isArray(font?.src) ? font.src : [];
  if (sources.length !== 1 || sources[0]?.format !== 'woff' || sources[0]?.path !== PRODUCT_FONT.themeSrc) fail(`${relative} must reference ${PRODUCT_FONT.themeSrc} as WOFF`);
  if (!exists(PRODUCT_FONT.file)) fail(`Missing custom product icon font: ${PRODUCT_FONT.file}`);
  else if (readFile(PRODUCT_FONT.file).subarray(0, 4).toString('ascii') !== 'wOFF') fail(`${PRODUCT_FONT.file} is not a valid WOFF file`);
  for (const [id, definition] of Object.entries(theme.iconDefinitions ?? {})) {
    if (definition?.fontId !== PRODUCT_FONT.id) fail(`${relative} icon ${id} must reference ${PRODUCT_FONT.id}`);
    if (typeof definition?.fontCharacter !== 'string' || !/^\\E[0-9A-F]{3}$/.test(definition.fontCharacter)) fail(`${relative} icon ${id} must use a private-use codepoint such as \\E100`);
  }
  return theme;
}

// Superset rule: extra mappings never fail; each missing pinned key fails its batch stage.
export function checkPinnedCoverage({ pinned, theme }, report) {
  const defined = theme?.iconDefinitions ?? {};
  for (const [id, { batch }] of Object.entries(pinned.ids)) {
    if (!(id in defined)) report.fail(`product-batch:${batch}`, `product icon theme does not map ${id} (batch ${batch})`);
  }
}

export function checkProductIconMap({ map, sourceFiles, theme }, report) {
  const errors = validateMap(map, { sourceFiles });
  for (const error of errors) report.fail(PIPELINE, error);
  if (errors.length) return false;
  const expected = iconDefinitionsFor(map);
  const actual = theme?.iconDefinitions ?? {};
  const differs = Object.keys(expected).length !== Object.keys(actual).length
    || Object.entries(expected).some(([id, definition]) => actual[id]?.fontCharacter !== definition.fontCharacter);
  if (differs) report.fail(PIPELINE, 'icons/product-icon-theme.json is stale against icons/product-icon-map.json; run npm run build:product-icons');
  return true;
}

export function glyphRuleProblems(svg) {
  const errors = [];
  const warnings = [];
  const parsed = parseGlyphSvg(svg);
  if (parsed.viewBox !== '0 0 16 16') errors.push('viewBox must be "0 0 16 16"');
  if (parsed.width !== undefined || parsed.height !== undefined) errors.push('must not set width or height on <svg>');
  const others = [...new Set(parsed.elements.filter((name) => name !== 'svg' && name !== 'path'))];
  if (others.length) errors.push(`only <svg> and <path> elements are allowed (found ${others.join(', ')})`);
  if (!parsed.paths.length) errors.push('contains no <path>');
  if (/\bstroke(?:-[a-z]+)?\s*=|stroke\s*:/i.test(svg)) errors.push('uses stroke; expand strokes to filled outlines');
  if (/fill-rule\s*[=:]\s*["']?evenodd|clip-rule/i.test(svg)) errors.push('uses fill-rule evenodd; cut-outs must be counter-wound subpaths');
  if (/\btransform\s*=/i.test(svg)) errors.push('uses transform; bake transforms into the path data');
  for (const path of parsed.paths) {
    if (!path.d.trim()) errors.push('has a <path> without d');
    if (!path.fill || path.fill === 'none') errors.push('every <path> needs a fill');
  }
  const ds = parsed.paths.map((path) => path.d).filter(Boolean);
  try {
    errors.push(...windingProblems(ds));
    const off = [...new Set(ds.flatMap(offGridPoints).map(([x, y]) => `(${+x.toFixed(3)}, ${+y.toFixed(3)})`))];
    if (off.length) warnings.push(`straight-segment points off the whole/half grid: ${off.slice(0, 6).join(' ')}${off.length > 6 ? ' …' : ''}`);
  } catch (error) {
    errors.push(`path data could not be parsed: ${error.message}`);
  }
  return { errors, warnings };
}

export function checkGlyphSources({ svgs }, report) {
  for (const [file, svg] of Object.entries(svgs)) {
    const { errors, warnings } = glyphRuleProblems(svg);
    for (const error of errors) report.fail(PIPELINE, `icons/product-src/${file} ${error}`);
    for (const warning of warnings) report.warn(`icons/product-src/${file} ${warning}`);
  }
}

export function checkBuildFlags({ sources }, report) {
  for (const [file, text] of Object.entries(sources)) {
    for (const flag of ['centerHorizontally', 'centerVertically']) {
      if (new RegExp(`\\b${flag}\\s*:`).test(text)) report.fail(PIPELINE, `${file} sets ${flag}; it moves glyphs off the grid (spec section 4)`);
    }
  }
  if ('centerHorizontally' in FONT_STREAM_OPTIONS || 'centerVertically' in FONT_STREAM_OPTIONS) report.fail(PIPELINE, 'FONT_STREAM_OPTIONS must not contain centring flags');
  if (FONT_STREAM_OPTIONS.fontHeight !== 16 * FONT_UNITS_PER_GRID_UNIT) report.fail(PIPELINE, 'FONT_STREAM_OPTIONS.fontHeight must be 1024');
}

const box = ({ minX, minY, maxX, maxY }) => `${Math.round(minX)},${Math.round(minY)} to ${Math.round(maxX)},${Math.round(maxY)}`;

export function checkFontGeometry({ woff, map, svgs }, report) {
  const font = fontkit.create(woff);
  const scale = FONT_UNITS_PER_GRID_UNIT;
  for (const [name, { codepoint }] of Object.entries(map.drawings)) {
    const glyph = font.glyphForCodePoint(Number.parseInt(codepoint, 16));
    if (!glyph?.path?.commands?.length) { report.fail(PIPELINE, `${name} (${codepoint}) is empty in the built font`); continue; }
    if (glyph.advanceWidth !== 16 * scale) report.fail(PIPELINE, `${name} advance width is ${glyph.advanceWidth}, expected ${16 * scale}`);
    const svg = svgs[name];
    if (!svg) continue;
    const source = pathBounds(parseGlyphSvg(svg).paths.map((path) => path.d));
    const expected = { minX: source.minX * scale, maxX: source.maxX * scale, minY: (16 - source.maxY) * scale, maxY: (16 - source.minY) * scale };
    const actual = glyph.path.bbox;
    if (['minX', 'maxX', 'minY', 'maxY'].some((key) => Math.abs(actual[key] - expected[key]) > BOX_TOLERANCE)) {
      report.fail(PIPELINE, `${name} glyph box ${box(actual)} differs from its source bounds ${box(expected)} at ${scale} units per grid unit`);
    }
  }
}
```

The 1.2.1 checks for the 48-ID list, index-derived codepoints, unique `fontCharacter` per ID and one SVG per ID are gone (section 8 "Checks removed or changed"), and so is the comparison with the old `witchy-codicons.woff` (that file no longer exists). The optional-fontkit fallback goes too: devDependencies are required to validate.

- [ ] **Step 6: Wire the product checks into `scripts/validate.mjs`**

Replace the product import and call with:

```js
import { checkBuildFlags, checkFontGeometry, checkGlyphSources, checkPinnedCoverage, checkProductIconContribution, checkProductIconMap } from './lib/checks/product-icons.mjs';
```

```js
const productTheme = checkProductIconContribution({ packageJson, readJson, readFile, exists }, report);
const sourceDir = path.join(root, 'icons', 'product-src');
const sourceFiles = fs.existsSync(sourceDir) ? fs.readdirSync(sourceDir).filter((file) => file.endsWith('.svg')).sort() : [];
const svgs = Object.fromEntries(sourceFiles.map((file) => [file, fs.readFileSync(path.join(sourceDir, file), 'utf8')]));
const productMap = readJson('icons/product-icon-map.json');
checkPinnedCoverage({ pinned: readJson('icons/product-icon-ids.json'), theme: productTheme }, report);
checkGlyphSources({ svgs }, report);
checkBuildFlags({ sources: Object.fromEntries(['scripts/build-product-icons.mjs', 'scripts/lib/product-font.mjs'].filter(exists).map((file) => [file, fs.readFileSync(path.join(root, file), 'utf8')])) }, report);
if (checkProductIconMap({ map: productMap, sourceFiles, theme: productTheme }, report) && exists('icons/witchynibbles-product-icons.woff')) {
  const byDrawing = Object.fromEntries(Object.keys(productMap.drawings).map((name) => [name, svgs[`${name}.svg`]]));
  checkFontGeometry({ woff: readFile('icons/witchynibbles-product-icons.woff'), map: productMap, svgs: byDrawing }, report);
}
```

Set `scripts/validation-stage.json` `enforce` to `["base", "color-themes", "product-pipeline", "product-batch:1"]`.

- [ ] **Step 7: Run tests (green) and the validator (red, as intended)**

Run: `npm test`
Expected: PASS.

Run: `node scripts/validate.mjs --only product-pipeline,product-batch:1`
Expected: FAIL with:
- `product-icon-map.json must have a "drawings" object (drawing-based format, spec section 5.1)`;
- `scripts/build-product-icons.mjs sets centerHorizontally …` and `… sets centerVertically …`;
- winding errors for the legacy sources `explorer-view-icon.svg` (3), `extensions-view-icon.svg`, `search-view-icon.svg`, `filter.svg`, `search.svg`, `terminal-view-icon.svg` (2), `trash.svg` (3), `warning.svg`, plus `uses fill-rule evenodd` for `debug-alt.svg`, `explorer-view-icon.svg`, `extensions-view-icon.svg`, `search-view-icon.svg`;
- 37 `product icon theme does not map … (batch 1)` lines (11 of the 48 batch-1 IDs are mapped by 1.2.1 keys);
- warnings for 29 legacy sources off the half grid.

Run: `node scripts/validate.mjs --only base`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add scripts/lib test/svg-geometry.test.mjs test/product-icon-checks.test.mjs scripts/validate.mjs scripts/validation-stage.json
git commit -m "Add section 8 product-icon checks (failing until the batch-1 drawings land)"
```

---

### Task 5: File-icon and release checks (pending stages)

**Files:**
- Create: `scripts/lib/file-icon-requirements.mjs`, `scripts/lib/checks/file-icons.mjs`, `test/file-icon-checks.test.mjs`
- Modify: `scripts/lib/checks/package.mjs` (add `checkReleaseMetadata`), `scripts/validate.mjs`

**Interfaces:**
- Produces: `REQUIRED_FILE_EXTENSIONS`, `REQUIRED_FILE_NAMES`, `REQUIRED_FOLDER_NAMES`, `SIDEBARS = { dark: '#120C1F', light: '#F8F0FB', highContrast: '#000000' }`; `checkFileIconTheme({ theme, readSvg }, report)` (stage `file-icons`); `checkReleaseMetadata(packageJson, report)` (stage `release`).

**Decisions 9, 10, 11:** the required lists include the keys decisions 9 and 11 add: the lockfile `fileNames` `package-lock.json`, `yarn.lock`, `cargo.lock`, `poetry.lock` (lower case, because `fileNames` match case-insensitively), the folder aliases `source`, `test`, `__tests__`, and the extension `pyw`. `vite.config.ts` is not required (dropped). Decision 10's colours do not change the check, because the 3:1 rule applies whatever values are chosen. Decision 8 resolves colour placeholders at build time, so the check reads the resolved SVGs that the theme references.

- [ ] **Step 1: Write the failing tests**

`test/file-icon-checks.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createReport } from '../scripts/lib/report.mjs';
import { checkFileIconTheme } from '../scripts/lib/checks/file-icons.mjs';
import { checkReleaseMetadata } from '../scripts/lib/checks/package.mjs';
import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES } from '../scripts/lib/file-icon-requirements.mjs';

const run = (fn) => {
  const report = createReport({ enforce: ['file-icons', 'release'] });
  fn(report);
  return report.result().errors.map((e) => `${e.stage}: ${e.message}`);
};
const all = (keys, icon) => Object.fromEntries(keys.map((key) => [key, icon]));
const set = (icon) => ({
  file: icon, folder: icon, folderExpanded: icon,
  fileExtensions: all(REQUIRED_FILE_EXTENSIONS, icon), fileNames: all(REQUIRED_FILE_NAMES, icon),
  folderNames: all(REQUIRED_FOLDER_NAMES, icon), folderNamesExpanded: all(REQUIRED_FOLDER_NAMES, icon),
});
const complete = () => ({
  showLanguageModeIcons: false,
  iconDefinitions: { d: { iconPath: './d.svg' }, l: { iconPath: './l.svg' }, h: { iconPath: './h.svg' } },
  ...set('d'), light: set('l'), highContrast: set('h'),
});
const svgs = { './d.svg': '<svg><path fill="#B99AFF"/></svg>', './l.svg': '<svg><path fill="#7042B2"/></svg>', './h.svg': '<svg><path fill="#D0B8FF"/></svg>' };

test('section 6 lists include the enumerated test and .env keys', () => {
  assert.ok(REQUIRED_FILE_EXTENSIONS.includes('test.ts') && REQUIRED_FILE_EXTENSIONS.includes('spec.mjs'));
  assert.ok(REQUIRED_FILE_NAMES.includes('.env.local') && REQUIRED_FILE_NAMES.includes('jest.config.json'));
  assert.ok(REQUIRED_FOLDER_NAMES.includes('__pycache__'));
});

test('decisions 9 and 11 add lockfiles, folder aliases and pyw', () => {
  for (const name of ['package-lock.json', 'yarn.lock', 'cargo.lock', 'poetry.lock']) assert.ok(REQUIRED_FILE_NAMES.includes(name), name);
  for (const name of ['source', 'test', '__tests__']) assert.ok(REQUIRED_FOLDER_NAMES.includes(name), name);
  assert.ok(REQUIRED_FILE_EXTENSIONS.includes('pyw'));
  assert.equal(REQUIRED_FILE_NAMES.includes('vite.config.ts'), false);
});

test('a complete theme passes', () => {
  assert.deepEqual(run((r) => checkFileIconTheme({ theme: complete(), readSvg: (p) => svgs[p] }, r)), []);
});

test('the 1.2.1 shape fails: no light/highContrast sets, no showLanguageModeIcons', () => {
  const theme = { ...complete(), light: undefined, highContrast: undefined, showLanguageModeIcons: undefined };
  const messages = run((r) => checkFileIconTheme({ theme, readSvg: (p) => svgs[p] }, r)).join('\n');
  assert.match(messages, /file-icons: file-icon-theme.json must set "showLanguageModeIcons": false/);
  assert.match(messages, /has no "light" set/);
  assert.match(messages, /has no "highContrast" set/);
});

test('missing keys and low-contrast colours are reported per set', () => {
  const theme = complete();
  delete theme.light.fileNames['.env.local'];
  const messages = run((r) => checkFileIconTheme({ theme, readSvg: (p) => (p === './l.svg' ? '<svg><path fill="#F3EAF7"/></svg>' : svgs[p]) }, r)).join('\n');
  assert.match(messages, /light set is missing fileNames: \.env\.local/);
  assert.match(messages, /light icon l uses #F3EAF7 at 1\.\d\d:1 on #F8F0FB \(needs 3:1\)/);
});

test('release metadata: version 2.0.0 and banner #0D0916', () => {
  const messages = run((r) => checkReleaseMetadata({ version: '1.2.1', galleryBanner: { color: '#110d24' } }, r));
  assert.deepEqual(messages, ['release: package.json version must be 2.0.0 at release (found 1.2.1)', 'release: package.json galleryBanner.color must be #0D0916 at release (found #110d24)']);
});
```

Run: `node --test test/file-icon-checks.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 2: Write `scripts/lib/file-icon-requirements.mjs`**

```js
// Spec section 6 keys a file icon theme can express. fileNames match case-insensitively; keys are lower case here.
const TEST_BASES = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts'];

export const REQUIRED_FILE_EXTENSIONS = [
  'js', 'mjs', 'cjs', 'ts', 'mts', 'cts', 'tsx', 'jsx', 'py', 'pyw', 'html', 'htm', 'css', 'scss', 'less', 'sql', 'sh',
  'fish', 'ps1', 'json', 'jsonc', 'jsonl', 'yaml', 'yml', 'toml', 'env', 'lock', 'db', 'md', 'mdx', 'txt', 'svg',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'otf', 'woff', 'woff2',
  ...TEST_BASES.flatMap((base) => [`test.${base}`, `spec.${base}`]),
];

export const REQUIRED_FILE_NAMES = [
  '.env', '.env.local', '.env.development', '.env.production', '.env.example',
  'readme.md', 'license', 'license.md', 'changelog.md', 'package.json', 'pyproject.toml', 'requirements.txt',
  'tsconfig.json', 'jsconfig.json', 'dockerfile', '.gitignore', 'conftest.py', 'pytest.ini',
  'jest.config.js', 'jest.config.ts', 'jest.config.mjs', 'jest.config.cjs', 'jest.config.json',
  'package-lock.json', 'yarn.lock', 'cargo.lock', 'poetry.lock',
];

export const REQUIRED_FOLDER_NAMES = [
  'src', 'source', 'tests', 'test', '__tests__', 'docs', 'scripts', 'assets', 'dist', 'lib', 'bin', 'fixtures', '.github', 'workflows',
  '.claude', '.venv', 'node_modules', 'cache', '__pycache__',
];

export const SIDEBARS = Object.freeze({ dark: '#120C1F', light: '#F8F0FB', highContrast: '#000000' });
```

- [ ] **Step 3: Write `scripts/lib/checks/file-icons.mjs` and `checkReleaseMetadata`**

```js
import { contrast, hexes } from '../../../src/color.mjs';
import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES, SIDEBARS } from '../file-icon-requirements.mjs';

const STAGE = 'file-icons';
const lowerKeys = (object) => new Set(Object.keys(object ?? {}).map((key) => key.toLowerCase()));

export function checkFileIconTheme({ theme, readSvg }, report) {
  const fail = (message) => report.fail(STAGE, message);
  if (theme.showLanguageModeIcons !== false) fail('file-icon-theme.json must set "showLanguageModeIcons": false');
  const sets = { dark: theme, light: theme.light, highContrast: theme.highContrast };
  for (const [setName, set] of Object.entries(sets)) {
    if (!set) { fail(`file-icon-theme.json has no "${setName}" set`); continue; }
    for (const key of ['file', 'folder', 'folderExpanded']) if (!set[key]) fail(`${setName} set has no "${key}" icon`);
    for (const [property, required] of [
      ['fileExtensions', REQUIRED_FILE_EXTENSIONS], ['fileNames', REQUIRED_FILE_NAMES],
      ['folderNames', REQUIRED_FOLDER_NAMES], ['folderNamesExpanded', REQUIRED_FOLDER_NAMES],
    ]) {
      const present = lowerKeys(set[property]);
      const missing = required.filter((key) => !present.has(key));
      if (missing.length) fail(`${setName} set is missing ${property}: ${missing.join(', ')}`);
    }
    const iconIds = new Set([set.file, set.folder, set.folderExpanded,
      ...['fileExtensions', 'fileNames', 'folderNames', 'folderNamesExpanded'].flatMap((property) => Object.values(set[property] ?? {}))].filter(Boolean));
    for (const iconId of iconIds) {
      const iconPath = theme.iconDefinitions?.[iconId]?.iconPath;
      if (!iconPath) { fail(`${setName} set references undefined icon ${iconId}`); continue; }
      const svg = readSvg(iconPath);
      if (svg == null) { fail(`${iconId} points to missing ${iconPath}`); continue; }
      for (const color of new Set(hexes(svg).map((hex) => hex.slice(0, 7).toUpperCase()))) {
        const ratio = contrast(color, SIDEBARS[setName]);
        if (ratio < 3) fail(`${setName} icon ${iconId} uses ${color} at ${ratio.toFixed(2)}:1 on ${SIDEBARS[setName]} (needs 3:1)`);
      }
    }
  }
}
```

Append to `scripts/lib/checks/package.mjs`:

```js
export function checkReleaseMetadata(packageJson, report) {
  if (packageJson.version !== '2.0.0') report.fail('release', `package.json version must be 2.0.0 at release (found ${packageJson.version})`);
  const banner = packageJson.galleryBanner?.color;
  if (banner?.toUpperCase() !== '#0D0916') report.fail('release', `package.json galleryBanner.color must be #0D0916 at release (found ${banner})`);
}
```

- [ ] **Step 4: Wire both into `scripts/validate.mjs`**

Add the imports `import { checkPackage, checkReleaseMetadata } from './lib/checks/package.mjs';` and `import { checkFileIconTheme } from './lib/checks/file-icons.mjs';`, then before the result block:

```js
checkReleaseMetadata(packageJson, report);
for (const contribution of packageJson.contributes?.iconThemes ?? []) {
  const themePath = contribution.path.replace(/^\.\//, '');
  if (!exists(themePath)) continue;
  const themeDir = path.dirname(path.join(root, themePath));
  const readSvg = (iconPath) => {
    const file = path.join(themeDir, iconPath);
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  };
  checkFileIconTheme({ theme: readJson(themePath), readSvg }, report);
}
```

The `enforce` list does not change: `file-icons` and `release` stay pending until phases 3 and 4.

- [ ] **Step 5: Run tests and check the staged output**

Run: `npm test`
Expected: PASS.

Run: `node scripts/validate.mjs --verbose`
Expected: exit 1, still from the `color-themes` and product stages. A `… N pending problems in stages not yet enforced: file-icons (…), release (2), product-batch:chrome (…), …` line follows, and with `--verbose` it lists `file-icon-theme.json must set "showLanguageModeIcons": false`, `has no "light" set`, `has no "highContrast" set`, the missing-key lines, and the two release lines.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/file-icon-requirements.mjs scripts/lib/checks/file-icons.mjs scripts/lib/checks/package.mjs scripts/validate.mjs test/file-icon-checks.test.mjs
git commit -m "Add file-icon and release checks as pending stages"
```

---

## Part B: color themes (spec section 3)

### Task 6: Refactor the theme generator onto workbench roles (no output change)

Section 3.1 assigns workbench keys by *role* (main accent, needs-you, selection, success, modified, error, info). In 1.2.1 those keys are hard-wired to `c.pink`, `c.blue` and `c.cyan`. This task introduces named roles whose defaults reproduce 1.2.1 exactly. A golden test proves nothing moved.

**Files:**
- Create: `test/golden/1.2.1/` (three copied theme files), `test/theme-golden.test.mjs`
- Modify: `src/theme-definition.mjs`

**Interfaces:**
- Consumes: `contrast` from `src/color.mjs` (Task 1).
- Produces: palette role tokens a palette may set: `activeAccent`, `activeLineNumber`, `attention`, `onAttention`, `button`, `onButton`, `buttonHover`, `listSelection`, `onListSelection`, `focus`, `scrollHover`, `success`, `untracked`, `modified`, `deleted`, `info`, `inputBorder`, `terminalCursor`. It also produces optional keys, emitted only when their role is set: `modifiedTabBorder`, `remote`/`onRemote`, `onProminent`, `breakpoint`, `testPassed`, `testFailed`, `terminalSelection`, `terminalBright*` (one token per bright ANSI colour), and `semantic` (an object merged over the semantic token map). `createThemes()` and `themeFilenames` keep their signatures.

- [ ] **Step 1: Snapshot 1.2.1 and write the golden test**

```bash
mkdir -p test/golden/1.2.1 && cp themes/*.json test/golden/1.2.1/
```

`test/theme-golden.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createThemes } from '../src/theme-definition.mjs';

const goldenDir = path.join(import.meta.dirname, 'golden', '1.2.1');

test('the role refactor reproduces every 1.2.1 theme exactly', () => {
  const themes = createThemes();
  for (const file of fs.readdirSync(goldenDir)) {
    const golden = JSON.parse(fs.readFileSync(path.join(goldenDir, file), 'utf8'));
    const generated = themes.find((theme) => theme.name === golden.name);
    assert.ok(generated, `missing ${golden.name}`);
    assert.deepEqual(generated, golden);
  }
});
```

Run: `node --test test/theme-golden.test.mjs`
Expected: PASS (it is a safety net: it must stay green through Step 3).

- [ ] **Step 2: Add the role and optional-key helpers**

In `src/theme-definition.mjs`, add after `semanticTokenColors`:

```js
// Workbench roles (spec section 3.1). A palette may set any role; the defaults reproduce 1.2.1.
const withRoles = (c) => ({
  ...c,
  activeAccent: c.activeAccent ?? c.pink,
  activeLineNumber: c.activeLineNumber ?? c.blue,
  attention: c.attention ?? c.pink,
  onAttention: c.onAttention ?? c.onAccent,
  button: c.button ?? c.accent,
  onButton: c.onButton ?? c.onAccent,
  buttonHover: c.buttonHover ?? c.pink,
  listSelection: c.listSelection ?? c.accent,
  onListSelection: c.onListSelection ?? c.onAccent,
  focus: c.focus ?? c.blue,
  scrollHover: c.scrollHover ?? c.purple,
  success: c.success ?? c.cyan,
  untracked: c.untracked ?? c.purple,
  modified: c.modified ?? c.blue,
  deleted: c.deleted ?? c.pink,
  info: c.info ?? c.blue,
  inputBorder: c.inputBorder ?? c.border,
  terminalCursor: c.terminalCursor ?? c.pink,
});

// Keys only some palettes set; left out entirely when the role is undefined.
const optionalColors = (c) => Object.fromEntries(Object.entries({
  'tab.activeModifiedBorder': c.modifiedTabBorder,
  'tab.inactiveModifiedBorder': c.modifiedTabBorder,
  'statusBarItem.remoteBackground': c.remote,
  'statusBarItem.remoteForeground': c.onRemote,
  'statusBarItem.prominentForeground': c.onProminent,
  'debugIcon.breakpointForeground': c.breakpoint,
  'testing.iconPassed': c.testPassed,
  'testing.iconFailed': c.testFailed,
  'terminal.selectionBackground': c.terminalSelection,
}).filter(([, value]) => value !== undefined));
```

Change the last line of `semanticTokenColors` from `'*.readonly': c.constant, '*.declaration': c.blue,` to `'*.readonly': c.constant, '*.declaration': c.blue, ...c.semantic,` (spreading `undefined` adds nothing).

- [ ] **Step 3: Point `sharedColors` at the roles**

Make these exact substitutions in `sharedColors` (every other entry stays as it is):

| Key(s) | Was | Becomes |
| :- | :- | :- |
| `editorLineNumber.activeForeground` | `c.blue` | `c.activeLineNumber` |
| `editorCursor.foreground` | `c.pink` | `c.attention` |
| `editorBracketMatch.border`, `focusBorder` | `c.blue` | `c.focus` |
| `editorOverviewRuler.modifiedForeground`, `editorGutter.modifiedBackground`, `gitDecoration.modifiedResourceForeground`, `minimapGutter.modifiedBackground` | `c.blue` | `c.modified` |
| `editorOverviewRuler.addedForeground`, `editorGutter.addedBackground`, `gitDecoration.addedResourceForeground`, `minimapGutter.addedBackground`, `notebookStatusSuccessIcon.foreground` | `c.cyan` | `c.success` |
| `editorOverviewRuler.deletedForeground`, `editorGutter.deletedBackground`, `gitDecoration.deletedResourceForeground`, `minimapGutter.deletedBackground` | `c.pink` | `c.deleted` |
| `editorInfo.foreground`, `notificationsInfoIcon.foreground` | `c.blue` | `c.info` |
| `activityBar.activeBorder`, `sideBarTitle.foreground`, `tab.activeBorderTop`, `panelTitle.activeBorder`, `progressBar.background`, `pickerGroup.foreground`, `welcomePage.progress.foreground`, `notebook.focusedCellBorder` | `c.pink` | `c.activeAccent` |
| `activityBarBadge.background`, `badge.background` | `c.pink` | `c.attention` |
| `activityBarBadge.foreground`, `badge.foreground` | `c.onAccent` | `c.onAttention` |
| `terminalCursor.foreground` | `c.pink` | `c.terminalCursor` |
| `list.activeSelectionBackground` / `list.activeSelectionForeground` | `c.accent` / `c.onAccent` | `c.listSelection` / `c.onListSelection` |
| `input.border` | `c.border` | `c.inputBorder` |
| `button.background` / `button.foreground` / `button.hoverBackground` | `c.accent` / `c.onAccent` / `c.pink` | `c.button` / `c.onButton` / `c.buttonHover` |
| `scrollbarSlider.hoverBackground` | `c.purple` | `c.scrollHover` |
| `gitDecoration.untrackedResourceForeground` | `c.purple` | `c.untracked` |

Give each bright ANSI key its own token, with the old expression as the fallback:

```js
'terminal.ansiBrightRed': c.terminalBrightRed ?? c.terminalRed ?? c.error,
'terminal.ansiBrightGreen': c.terminalBrightGreen ?? c.terminalGreen ?? c.cyan,
'terminal.ansiBrightYellow': c.terminalBrightYellow ?? c.terminalYellow ?? c.warning,
'terminal.ansiBrightBlue': c.terminalBrightBlue ?? c.terminalBlue ?? c.blue,
'terminal.ansiBrightMagenta': c.terminalBrightMagenta ?? c.terminalMagenta ?? c.pink,
'terminal.ansiBrightCyan': c.terminalBrightCyan ?? c.terminalCyan ?? c.cyan,
```

In `createThemes()`, wrap the resolved palette with `withRoles(...)`, and build `colors` as `{ ...sharedColors(c), ...optionalColors(c) }`:

```js
export function createThemes() {
  return Object.values(palettes).map(({ name, type, c: raw }) => {
    // Keep palette authoring compact while guaranteeing every scope has a color.
    const c = withRoles({
      ...sharedTokenColors,
      invalid: '#FF6B9F',
      ...raw,
      function: raw.function ?? sharedTokenColors.function,
      variable: raw.variable ?? sharedTokenColors.variable,
      className: raw.className ?? sharedTokenColors.className,
      attribute: raw.attribute ?? sharedTokenColors.attribute,
      doc: raw.doc ?? sharedTokenColors.doc,
      parameter: raw.parameter ?? sharedTokenColors.template,
      punctuation: raw.punctuation ?? sharedTokenColors.punctuation,
    });
    const theme = { name, type, colors: { ...sharedColors(c), ...optionalColors(c) }, tokenColors: tokenColors(c), semanticHighlighting: true, semanticTokenColors: semanticTokenColors(c) };
    if (theme.tokenColors.some(({ settings }) => typeof settings.foreground !== 'string')) throw new Error(`${name}: token scope missing foreground`);
    const lowContrast = theme.tokenColors.find(({ settings }) => contrast(settings.foreground, c.editor) < 4.5);
    if (lowContrast) throw new Error(`${name}: ${lowContrast.name} token contrast is below 4.5:1`);
    return theme;
  });
}
```

- [ ] **Step 4: Verify nothing moved**

Run: `node --test test/theme-golden.test.mjs && npm run build && git status --short themes`
Expected: PASS, and `git status` shows no changes under `themes/`.

- [ ] **Step 5: Commit**

```bash
git add src/theme-definition.mjs test/golden test/theme-golden.test.mjs
git commit -m "Route theme colours through named workbench roles"
```

---

### Task 7: Moonlit Candle

**Files:**
- Create: `test/theme-definition.test.mjs`
- Modify: `src/theme-definition.mjs` (palette and filename), `package.json` (`contributes.themes`), `themes/WitchyNibbles-color-theme-moonlit-candle.json` (generated)

**Interfaces:**
- Consumes: roles and optional keys (Task 6).
- Produces: theme `WitchyNibbles Moonlit Candle`, first in `createThemes()` and `themeFilenames`.

Values come from spec section 3.1. Three values the spec leaves open are chosen here and listed for the gate:
- `button.hoverBackground` is a lighter gold, `#FFE3A3` (the scheme's brightYellow). The spec fixes only the `#0D0916` text "also on hover", and this keeps hover inside the main-accent role.
- `statusBarItem.prominentForeground` is `#0D0916`. Without it, prominent items would put `#F3EAF7` text on gold.
- Parameters keep Moonlit's `#F6B5DD`. The syntax table does not list them.

- [ ] **Step 1: Write the failing tests**

`test/theme-definition.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createThemes, themeFilenames } from '../src/theme-definition.mjs';
import packageJson from '../package.json' with { type: 'json' };

const themes = createThemes();
const byName = (name) => themes.find((theme) => theme.name === name);
const rule = (theme, name) => theme.tokenColors.find((entry) => entry.name === name);
const candle = byName('WitchyNibbles Moonlit Candle');

test('Moonlit Candle is generated first and contributed first', () => {
  assert.equal(themes[0].name, 'WitchyNibbles Moonlit Candle');
  assert.equal(themes[0].type, 'dark');
  assert.equal(themeFilenames[0], 'WitchyNibbles-color-theme-moonlit-candle.json');
  assert.deepEqual(packageJson.contributes.themes[0], { label: 'WitchyNibbles Moonlit Candle', uiTheme: 'vs-dark', path: './themes/WitchyNibbles-color-theme-moonlit-candle.json' });
  assert.equal(packageJson.contributes.themes.length, 4);
});

test('surfaces and text', () => {
  const c = candle.colors;
  assert.equal(c['editor.background'], '#0D0916');
  assert.equal(c['panel.background'], '#171025');
  assert.equal(c['sideBar.background'], '#120C1F');
  assert.equal(c['editor.foreground'], '#F3EAF7');
  assert.equal(c['input.border'], '#6E5A80');
  assert.equal(c['editorGroup.border'], '#38234D');
});

test('main accent is gold with dark text', () => {
  const c = candle.colors;
  for (const key of ['activityBar.activeBorder', 'tab.activeBorderTop', 'panelTitle.activeBorder', 'progressBar.background', 'button.background', 'statusBarItem.remoteBackground', 'sideBarTitle.foreground', 'editorLineNumber.activeForeground']) {
    assert.equal(c[key], '#FFD477', key);
  }
  assert.equal(c['button.foreground'], '#0D0916');
  assert.equal(c['statusBarItem.remoteForeground'], '#0D0916');
});

test('needs-you is pink with dark text', () => {
  const c = candle.colors;
  for (const key of ['activityBarBadge.background', 'badge.background', 'tab.activeModifiedBorder', 'tab.inactiveModifiedBorder', 'editorCursor.foreground', 'terminalCursor.foreground']) {
    assert.equal(c[key], '#FF67B7', key);
  }
  assert.equal(c['activityBarBadge.foreground'], '#0D0916');
  assert.equal(c['badge.foreground'], '#0D0916');
});

test('selection, focus and status roles', () => {
  const c = candle.colors;
  assert.equal(c['focusBorder'], '#B99AFF');
  assert.equal(c['editorBracketMatch.border'], '#B99AFF');
  assert.equal(c['scrollbarSlider.hoverBackground'], '#B99AFF');
  assert.equal(c['list.activeSelectionBackground'], '#633B79');
  assert.equal(c['editor.selectionBackground'], '#633B79AA');
  for (const key of ['gitDecoration.addedResourceForeground', 'gitDecoration.untrackedResourceForeground', 'editorGutter.addedBackground', 'testing.iconPassed', 'notebookStatusSuccessIcon.foreground']) assert.equal(c[key], '#74E8B8', key);
  for (const key of ['gitDecoration.modifiedResourceForeground', 'editorGutter.modifiedBackground', 'editorWarning.foreground', 'notificationsWarningIcon.foreground']) assert.equal(c[key], '#FFB86B', key);
  for (const key of ['editorError.foreground', 'gitDecoration.deletedResourceForeground', 'editorGutter.deletedBackground', 'testing.iconFailed']) assert.equal(c[key], '#FF6B9F', key);
  assert.equal(c['editorInfo.foreground'], '#77D9FF');
  assert.equal(c['debugIcon.breakpointForeground'], '#FFD477');
});

test('syntax colours follow the section 3.1 table', () => {
  const expected = { Keywords: '#B99AFF', Functions: '#FFD477', Strings: '#74E8B8', 'Class and type names': '#77D9FF', Numbers: '#FF9BD7', 'Booleans and constants': '#FF9BD7', Comments: '#A99AB9', Documentation: '#CFC3DB', Variables: '#F3EAF7', Operators: '#D3B4FF', Punctuation: '#D3B4FF', Tags: '#FF86C8', 'Attributes and properties': '#9CCBFF' };
  for (const [name, color] of Object.entries(expected)) assert.equal(rule(candle, name).settings.foreground, color, name);
});

test('function and method declarations stay gold despite the *.declaration tie', () => {
  assert.equal(candle.semanticTokenColors['function.declaration'], '#FFD477');
  assert.equal(candle.semanticTokenColors['method.declaration'], '#FFD477');
  assert.equal(candle.semanticTokenColors['variable.declaration'], '#F3EAF7');
  assert.equal(candle.semanticTokenColors.enum, '#77D9FF');
  assert.equal(candle.semanticTokenColors.typeParameter, '#77D9FF');
});
```

Run: `node --test test/theme-definition.test.mjs`
Expected: FAIL: `themes[0].name` is `WitchyNibbles Moonlit`.

- [ ] **Step 2: Add the palette (first in `palettes`) and the filename**

In `src/theme-definition.mjs`, insert as the first entry of `palettes`:

```js
  candle: {
    name: 'WitchyNibbles Moonlit Candle', type: 'dark',
    c: {
      // Surfaces (section 3.1): Moonlit's editor/panel/sidebar, witchyterm text.
      editor: '#0D0916', panel: '#171025', sidebar: '#120C1F', terminal: '#0D0916',
      foreground: '#F3EAF7', muted: '#A99AB9', border: '#38234D', inputBorder: '#6E5A80',
      line: '#1D1230', whitespace: '#503762', selection: '#633B79AA', selectionMuted: '#45295C88',
      accent: '#FFD477', onAccent: '#0D0916', pink: '#FF67B7', purple: '#B99AFF', blue: '#77D9FF', cyan: '#74D7E8',
      warning: '#FFB86B', error: '#FF6B9F',
      inserted: '#267E9A55', removed: '#B32F6B55', insertedLine: '#267E9A33', removedLine: '#B32F6B33',
      // Workbench roles (section 3.1 table).
      activeAccent: '#FFD477', activeLineNumber: '#FFD477',
      attention: '#FF67B7', onAttention: '#0D0916', modifiedTabBorder: '#FF67B7',
      button: '#FFD477', onButton: '#0D0916', buttonHover: '#FFE3A3', onProminent: '#0D0916',
      remote: '#FFD477', onRemote: '#0D0916', breakpoint: '#FFD477',
      listSelection: '#633B79', onListSelection: '#F3EAF7', focus: '#B99AFF', scrollHover: '#B99AFF',
      success: '#74E8B8', untracked: '#74E8B8', testPassed: '#74E8B8',
      modified: '#FFB86B', deleted: '#FF6B9F', testFailed: '#FF6B9F', info: '#77D9FF',
      // Syntax (section 3.1 table).
      keyword: '#B99AFF', function: '#FFD477', string: '#74E8B8', className: '#77D9FF',
      number: '#FF9BD7', constant: '#FF9BD7', comment: '#A99AB9', doc: '#CFC3DB', variable: '#F3EAF7',
      operator: '#D3B4FF', punctuation: '#D3B4FF', tag: '#FF86C8', attribute: '#9CCBFF',
      parameter: '#F6B5DD', invalid: '#FF6B9F',
      // Types are cyan; declarations must not override the role colours (VS Code scores `function` and `*.declaration` equally).
      semantic: {
        enum: '#77D9FF', typeParameter: '#77D9FF',
        'function.declaration': '#FFD477', 'method.declaration': '#FFD477',
        'variable.declaration': '#F3EAF7', 'parameter.declaration': '#F6B5DD', 'property.declaration': '#9CCBFF',
      },
    },
  },
```

Change `themeFilenames` to:

```js
export const themeFilenames = ['WitchyNibbles-color-theme-moonlit-candle.json', 'WitchyNibbles-color-theme-dark.json', 'WitchyNibbles-color-theme-light.json', 'WitchyNibbles-color-theme-high-contrast.json'];
```

In `package.json`, insert as the first `contributes.themes` entry:

```json
{
  "label": "WitchyNibbles Moonlit Candle",
  "uiTheme": "vs-dark",
  "path": "./themes/WitchyNibbles-color-theme-moonlit-candle.json"
}
```

- [ ] **Step 3: Run the tests and regenerate**

Run: `npm run build && npm test`
Expected: PASS (the golden test still passes, because the three 1.2.1 themes are unchanged).

Run: `node scripts/validate.mjs --only color-themes`
Expected: FAIL, but `Expected 4 color themes`, `must be the first color theme` and `Missing pinned theme` are gone. What remains are the bold-rule lines (Task 8) and the terminal equality lines for Candle (Candle's ANSI colours still use the 1.2.1 fallbacks) and Moonlit (Task 9).

- [ ] **Step 4: Commit**

```bash
git add src/theme-definition.mjs package.json themes/WitchyNibbles-color-theme-moonlit-candle.json test/theme-definition.test.mjs
git commit -m "Add the WitchyNibbles Moonlit Candle color theme"
```

---

### Task 8: Semantic fixes (Moonlit, Daydream) and typography (all four)

**Files:**
- Modify: `src/theme-definition.mjs` (`tokenColors`, Moonlit and Daydream palettes), `test/theme-definition.test.mjs`, `themes/*.json` (generated), `scripts/lib/checks/color-themes.mjs`, `test/color-theme-checks.test.mjs`
- Delete: `test/golden/`, `test/theme-golden.test.mjs` (they did their job in Tasks 6-7; from here on the 1.2.1 output changes on purpose)

**Interfaces:**
- Consumes: `success` and `inputBorder` roles (Task 6).
- Produces: token rules `Keywords` (`keyword`, `storage.type`, bold), `Storage` (`storage`, no style), `Storage modifiers` (`storage.modifier`, italic), and `Operators` with `fontStyle: ''`. `UI_BORDER_THEMES` and the 3:1 `input.border` check in `scripts/lib/checks/color-themes.mjs`.

**Decision 14:** Daydream's `inputBorder` (which feeds `input.border`) becomes the UI-boundary border `#8E78A6` (3.75 / 3.50 / 3.39:1 on editor, sidebar and panel); its `border` `#DCC7E5` stays the decorative divider. Candle keeps `#6E5A80` (3.02:1 on the panel, the lowest, accepted). Coven Contrast keeps its white borders. A validator check holds these three themes' `input.border` to 3:1 on the editor, sidebar and panel backgrounds. Moonlit is not in the check, because decision 14 names no Moonlit value; its `#38234D` input border is listed at the gate (Task 18).

- [ ] **Step 1: Write the failing tests**

Append to `test/theme-definition.test.mjs`:

```js
const moonlit = byName('WitchyNibbles Moonlit');
const daydream = byName('WitchyNibbles Daydream');
const coven = byName('WitchyNibbles Coven Contrast');

test('Moonlit gets mint success and amber warning', () => {
  for (const key of ['gitDecoration.addedResourceForeground', 'editorGutter.addedBackground', 'notebookStatusSuccessIcon.foreground']) assert.equal(moonlit.colors[key], '#74E8B8', key);
  for (const key of ['editorWarning.foreground', 'notificationsWarningIcon.foreground']) assert.equal(moonlit.colors[key], '#FFB86B', key);
});

test('Daydream gets dark mint success and keeps its amber warning', () => {
  assert.equal(daydream.colors['gitDecoration.addedResourceForeground'], '#0E7553');
  assert.equal(daydream.colors['editorGutter.addedBackground'], '#0E7553');
  assert.equal(daydream.colors['editorWarning.foreground'], '#9A5A00');
});

test('Coven Contrast keeps its own status colours', () => {
  assert.equal(coven.colors['gitDecoration.addedResourceForeground'], '#7DEBFF');
  assert.equal(coven.colors['editorWarning.foreground'], '#FFE38A');
});

test('UI-boundary borders reach 3:1 on editor, sidebar and panel (decision 14)', () => {
  assert.equal(daydream.colors['input.border'], '#8E78A6');
  assert.equal(daydream.colors['editorGroup.border'], '#DCC7E5');
  assert.equal(coven.colors['input.border'], '#FFFFFF');
  for (const theme of [candle, daydream, coven]) {
    for (const surface of ['editor.background', 'sideBar.background', 'panel.background']) {
      assert.ok(contrast(theme.colors['input.border'], theme.colors[surface]) >= 3, `${theme.name} ${surface}`);
    }
  }
});

for (const theme of themes) {
  test(`${theme.name}: bold only on keyword and storage.type; italic on comments, docs and storage modifiers`, () => {
    assert.deepEqual(rule(theme, 'Keywords').scope, ['keyword', 'storage.type']);
    assert.equal(rule(theme, 'Keywords').settings.fontStyle, 'bold');
    assert.equal(rule(theme, 'Storage modifiers').settings.fontStyle, 'italic');
    assert.equal(rule(theme, 'Storage').settings.fontStyle, undefined);
    assert.equal(rule(theme, 'Comments').settings.fontStyle, 'italic');
    assert.equal(rule(theme, 'Documentation').settings.fontStyle, 'italic');
    for (const name of ['Functions', 'Booleans and constants', 'Class and type names']) assert.equal(rule(theme, name).settings.fontStyle, undefined, name);
    // keyword.operator is a child of the bold keyword rule; the empty style stops the inheritance.
    assert.equal(rule(theme, 'Operators').settings.fontStyle, '');
  });
}
```

Add `import { contrast } from '../src/color.mjs';` to the imports at the top of the file.

Append to `test/color-theme-checks.test.mjs`:

```js
test('the UI-boundary border needs 3:1 on editor, sidebar and panel (decision 14)', () => {
  const messages = check(theme('WitchyNibbles Daydream', { colors: { 'editor.background': '#FFF9FD', 'sideBar.background': '#F8F0FB', 'panel.background': '#F5ECFA', 'input.border': '#DCC7E5' } }));
  assert.ok(messages.some((m) => m.startsWith('t.json input.border #DCC7E5 is')));
});
```

Run: `node --test test/theme-definition.test.mjs test/color-theme-checks.test.mjs`
Expected: FAIL on the Moonlit, Daydream, border and typography tests.

- [ ] **Step 2: Change the token rules**

In `tokenColors`, replace the `Keywords`, `Functions`, `Booleans and constants`, `Operators` and `Class and type names` rules with the following, and add the two storage rules directly after `Keywords`:

```js
  { name: 'Keywords', scope: ['keyword', 'storage.type'], settings: { foreground: c.keyword, fontStyle: 'bold' } },
  { name: 'Storage', scope: ['storage'], settings: { foreground: c.keyword } },
  { name: 'Storage modifiers', scope: ['storage.modifier'], settings: { foreground: c.keyword, fontStyle: 'italic' } },
  { name: 'Functions', scope: ['entity.name.function', 'support.function', 'variable.function', 'meta.function-call'], settings: { foreground: c.function } },
```

```js
  { name: 'Booleans and constants', scope: ['constant.language', 'constant.character', 'constant.other'], settings: { foreground: c.constant } },
  { name: 'Operators', scope: ['keyword.operator', 'keyword.operator.assignment', 'keyword.operator.arithmetic', 'keyword.operator.comparison'], settings: { foreground: c.operator, fontStyle: '' } },
```

```js
  { name: 'Class and type names', scope: ['entity.name.class', 'entity.name.type', 'support.class', 'support.type'], settings: { foreground: c.className } },
```

- [ ] **Step 3: Apply the semantic fixes**

In the `dark` (Moonlit) palette, set `warning: '#FFB86B'` (was `#FFD477`) and add `success: '#74E8B8'`. In the `light` (Daydream) palette, add `success: '#0E7553'` and `inputBorder: '#8E78A6'` (decision 14). Do not touch the `contrast` palette.

In `scripts/lib/checks/color-themes.mjs`, add after `GREEN_ALLOWLIST`:

```js
// Author decision 14: the UI-boundary border reaches 3:1 on the surfaces it is used on. Moonlit has no settled value.
export const UI_BORDER_THEMES = ['WitchyNibbles Moonlit Candle', 'WitchyNibbles Daydream', 'WitchyNibbles Coven Contrast'];
const UI_BORDER_SURFACES = ['editor.background', 'sideBar.background', 'panel.background'];
```

and in `checkThemeFile`, before the `// Foregrounds on accent fills.` block:

```js
  // UI-boundary border (decision 14).
  if (UI_BORDER_THEMES.includes(theme.name) && colors['input.border']) {
    for (const surface of UI_BORDER_SURFACES) {
      if (!colors[surface]) continue;
      const ratio = contrast(colors['input.border'], colors[surface]);
      if (ratio < 3) fail(`input.border ${colors['input.border']} is ${ratio.toFixed(2)}:1 on ${surface} (needs 3:1)`);
    }
  }
```

- [ ] **Step 4: Remove the golden snapshot and run everything**

```bash
git rm -r -q test/golden test/theme-golden.test.mjs
npm run build && npm test
```

Expected: PASS.

Run: `node scripts/validate.mjs --only color-themes`
Expected: FAIL only on the `terminal.… is …, expected …` lines for Candle and Moonlit (Task 9). All bold, inheritance and border lines are gone.

- [ ] **Step 5: Commit**

```bash
git add src/theme-definition.mjs test/theme-definition.test.mjs themes scripts/lib/checks/color-themes.mjs test/color-theme-checks.test.mjs
git commit -m "Apply semantic status colours, keyword-only bold and the Daydream border"
```

---

### Task 9: Terminal ANSI parity with witchyterm

**Files:**
- Modify: `src/theme-definition.mjs`, `test/theme-definition.test.mjs`, `themes/*.json` (generated)

**Interfaces:**
- Consumes: `src/witchyterm-moonlit-candle.scheme.json` (Task 2), the `terminalBright*`, `terminalCursor` and `terminalSelection` tokens (Task 6).
- Produces: `terminalFromScheme(scheme, fields: 'full' | 'ansi')`, a palette fragment that mirrors `WT_TO_VSCODE` (Task 2). The optional palette tokens `currentStackframe` and `stackframe`.

**Decision 2:** Moonlit uses `'full'`, like Moonlit Candle: its terminal background becomes `#0D0916` (was `#08060D`), and its terminal foreground, cursor and selection become the witchyterm values. `PINNED_TERMINAL['WitchyNibbles Moonlit']` is already `'full'` (Task 2).

**Decision 3:** set `debugIcon.breakpointCurrentStackframeForeground` and `debugIcon.breakpointStackframeForeground` in all four themes. Moonlit Candle takes gold `#FFD477` and lavender `#B99AFF`. The other themes take role-equivalent values from their own palettes, their main accent for the current frame and their lavender for other frames: Moonlit `#FF67B7` / `#B99AFF`, Daydream `#B52776` / `#7042B2`, Coven Contrast `#FF67B7` / `#D0B8FF`. These three pairs are phase-1 choices that the gate lists for the author to overrule (Task 18).

- [ ] **Step 1: Write the failing tests**

Append to `test/theme-definition.test.mjs`:

```js
import scheme from '../src/witchyterm-moonlit-candle.scheme.json' with { type: 'json' };
import { schemeToVSCodeColors } from '../scripts/lib/checks/color-themes.mjs';

test('Moonlit Candle terminal equals the witchyterm scheme (all 20 fields)', () => {
  for (const [key, value] of Object.entries(schemeToVSCodeColors(scheme, 'full'))) assert.equal(candle.colors[key], value, key);
});

test('Moonlit terminal equals the witchyterm scheme too (decision 2)', () => {
  for (const [key, value] of Object.entries(schemeToVSCodeColors(scheme, 'full'))) assert.equal(moonlit.colors[key], value, key);
});

test('Moonlit terminal background is the witchyterm background', () => {
  assert.equal(moonlit.colors['terminal.background'], '#0D0916');
});

test('Daydream and Coven terminals are unchanged', () => {
  assert.equal(daydream.colors['terminal.ansiGreen'], '#7DEBFF');
  assert.equal(daydream.colors['terminal.background'], '#21152D');
  assert.equal(coven.colors['terminal.background'], '#000000');
});

test('stackframe colours (decision 3)', () => {
  const expected = {
    'WitchyNibbles Moonlit Candle': ['#FFD477', '#B99AFF'],
    'WitchyNibbles Moonlit': ['#FF67B7', '#B99AFF'],
    'WitchyNibbles Daydream': ['#B52776', '#7042B2'],
    'WitchyNibbles Coven Contrast': ['#FF67B7', '#D0B8FF'],
  };
  for (const theme of themes) {
    const [current, other] = expected[theme.name];
    assert.equal(theme.colors['debugIcon.breakpointCurrentStackframeForeground'], current, theme.name);
    assert.equal(theme.colors['debugIcon.breakpointStackframeForeground'], other, theme.name);
  }
});
```

Move the two new `import` lines to the top of the file with the other imports. Run: `node --test test/theme-definition.test.mjs`
Expected: FAIL on the scheme, Moonlit background and stackframe tests.

- [ ] **Step 2: Map the scheme into the palettes**

At the top of `src/theme-definition.mjs`:

```js
import witchyterm from './witchyterm-moonlit-candle.scheme.json' with { type: 'json' };

// Spec section 3.1 key mapping (Windows Terminal -> palette tokens read by sharedColors). Mirrors WT_TO_VSCODE in the validator.
const terminalFromScheme = (s, fields) => ({
  terminalBlack: s.black, terminalRed: s.red, terminalGreen: s.green, terminalYellow: s.yellow,
  terminalBlue: s.blue, terminalMagenta: s.purple, terminalCyan: s.cyan, terminalWhite: s.white,
  terminalBrightBlack: s.brightBlack, terminalBrightRed: s.brightRed, terminalBrightGreen: s.brightGreen,
  terminalBrightYellow: s.brightYellow, terminalBrightBlue: s.brightBlue, terminalBrightMagenta: s.brightPurple,
  terminalBrightCyan: s.brightCyan, terminalBrightWhite: s.brightWhite,
  ...(fields === 'full'
    ? { terminal: s.background, terminalForeground: s.foreground, terminalCursor: s.cursorColor, terminalSelection: s.selectionBackground }
    : {}),
});
```

Add `...terminalFromScheme(witchyterm, 'full'),` as the last entry of the Candle palette's `c`. Add `...terminalFromScheme(witchyterm, 'full'), // author decision 2` as the last entry of the Moonlit (`dark`) palette's `c`.

Add the stackframe keys to `optionalColors`:

```js
  'debugIcon.breakpointCurrentStackframeForeground': c.currentStackframe,
  'debugIcon.breakpointStackframeForeground': c.stackframe,
```

and the tokens to each palette's `c` (author decision 3): Candle `currentStackframe: '#FFD477', stackframe: '#B99AFF'`; Moonlit (`dark`) `currentStackframe: '#FF67B7', stackframe: '#B99AFF'`; Daydream (`light`) `currentStackframe: '#B52776', stackframe: '#7042B2'`; Coven Contrast (`contrast`) `currentStackframe: '#FF67B7', stackframe: '#D0B8FF'`.

- [ ] **Step 3: Run everything**

Run: `npm run build && npm test`
Expected: PASS.

Run: `node scripts/validate.mjs --only color-themes,base`
Expected: `✓ WitchyNibbles package validation passed (enforced: color-themes, base)`.

- [ ] **Step 4: Commit**

```bash
git add src/theme-definition.mjs test/theme-definition.test.mjs themes
git commit -m "Match the Moonlit Candle and Moonlit terminals to witchyterm and set stackframe colours"
```

---

## Part C: product icon pipeline and the first batch (spec sections 4, 5.1, 5.3)

### Task 10: Drawing-based build pipeline and map migration

The build gets the drawing-based map and loses the centring flags. Because the new build cannot read the old map, the migration lands in the same task. The 1.2.1 SVGs become `legacy-*` drawings so the font keeps building until Task 16.

**Files:**
- Create: `scripts/lib/product-icons-build.mjs`, `test/build-product-icons.test.mjs`, `test/fixtures/product-root/package.json`, `test/fixtures/product-root/icons/product-icon-map.json`, `test/fixtures/product-root/icons/product-src/corner.svg`, `test/fixtures/product-root/icons/product-src/ring.svg`
- Modify: `scripts/build-product-icons.mjs` (thin CLI), `scripts/validate.mjs` (build-flag source list), `icons/product-icon-map.json` (migrated), `icons/product-src/*` (renamed or removed), `icons/product-icon-theme.json` and the WOFF (regenerated)

**Interfaces:**
- Consumes: `buildFont`, `FONT_STREAM_OPTIONS` (Task 4), `validateMap`, `iconDefinitionsFor`, `PRODUCT_FONT` (Task 4).
- Produces: `buildProductIcons({ root, outDir = root, overrides = {} }) -> Promise<{ drawings, ids, fontPath, themePath }>`. It reads the map and sources from `root` and writes `icons/witchynibbles-product-icons.woff` and `icons/product-icon-theme.json` under `outDir`. `overrides` maps a drawing name to an alternative SVG path; Task 17 uses it for gate variants.
- Produces: map format `{ fontId, fontFamily, retiredCodepoints: string[], drawings: { [name]: { codepoint, ids, legacy? } } }`.

**Decision 7:** `layout-sidebar-left`, `layout-sidebar-right` and `layout-panel` stay mapped as legacy drawings here only, so behaviour is unchanged until Task 16 drops every legacy drawing. 2.0 drops those three keys; the title-bar toggles, including the mirrored `panel-right`/`-off`, `auxiliarybar-left-layout-icon`/`-off-layout-icon` and `panel-bottom`, are drawn in the phase 2 `editor` batch.

- [ ] **Step 1: Create the build fixtures and the failing test**

`test/fixtures/product-root/package.json`: `{ "version": "2.0.0" }`

`test/fixtures/product-root/icons/product-icon-map.json`:

```json
{
  "fontId": "witchynibbles-product-icons",
  "fontFamily": "WitchyNibbles Product Icons",
  "retiredCodepoints": [],
  "drawings": {
    "corner": { "codepoint": "E100", "ids": ["corner-a", "corner-b"] },
    "ring": { "codepoint": "E101", "ids": ["ring"] }
  }
}
```

`test/fixtures/product-root/icons/product-src/corner.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M10 10h4v4h-4z"/></svg>
```

`test/fixtures/product-root/icons/product-src/ring.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M8 2a6 6 0 1 1 0 12a6 6 0 1 1 0-12zM8 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8z"/></svg>
```

`test/build-product-icons.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { buildProductIcons } from '../scripts/lib/product-icons-build.mjs';
import { createReport } from '../scripts/lib/report.mjs';
import { checkBuildFlags } from '../scripts/lib/checks/product-icons.mjs';

const fontkit = createRequire(import.meta.url)('fontkit');
const root = path.resolve(import.meta.dirname, '..');
const fixture = path.join(import.meta.dirname, 'fixtures', 'product-root');
const tempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-build-'));
const box = (fontPath, codepoint) => {
  const { minX, minY, maxX, maxY } = fontkit.openSync(fontPath).glyphForCodePoint(codepoint).path.bbox;
  return [minX, minY, maxX, maxY].map(Math.round);
};

test('one glyph per drawing; every ID of a drawing shares its codepoint', async () => {
  const { drawings, ids, fontPath, themePath } = await buildProductIcons({ root: fixture, outDir: tempDir() });
  assert.equal(drawings, 2);
  assert.equal(ids, 3);
  const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));
  assert.equal(theme.iconDefinitions['corner-a'].fontCharacter, '\\E100');
  assert.equal(theme.iconDefinitions['corner-b'].fontCharacter, '\\E100');
  assert.deepEqual(theme.fonts[0].src, [{ path: './witchynibbles-product-icons.woff', format: 'woff' }]);
  // Source x 10-14, y 10-14 -> font x 640-896, y (16-14)*64 to (16-10)*64: no centring, one scale.
  assert.deepEqual(box(fontPath, 0xE100), [640, 128, 896, 384]);
});

test('overrides swap one drawing source without touching the map', async () => {
  const outDir = tempDir();
  const alternative = path.join(outDir, 'alt.svg');
  fs.writeFileSync(alternative, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2h4v4H2z"/></svg>');
  const { fontPath } = await buildProductIcons({ root: fixture, outDir, overrides: { corner: alternative } });
  assert.deepEqual(box(fontPath, 0xE100), [128, 640, 384, 896]);
  await assert.rejects(buildProductIcons({ root: fixture, outDir, overrides: { nope: alternative } }), /unknown drawings: nope/);
});

test('the repo build sources carry no centring flags', () => {
  const report = createReport({ enforce: ['product-pipeline'] });
  const sources = Object.fromEntries(['scripts/build-product-icons.mjs', 'scripts/lib/product-icons-build.mjs']
    .map((file) => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
  checkBuildFlags({ sources }, report);
  assert.deepEqual(report.result().errors, []);
});
```

Run: `node --test test/build-product-icons.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `product-icons-build.mjs`.

- [ ] **Step 2: Write `scripts/lib/product-icons-build.mjs` and the CLI**

```js
import fs from 'node:fs';
import path from 'node:path';
import { buildFont } from './product-font.mjs';
import { PRODUCT_FONT, iconDefinitionsFor, validateMap } from './product-icon-map.mjs';

export async function buildProductIcons({ root, outDir = root, overrides = {} }) {
  const map = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'product-icon-map.json'), 'utf8'));
  const sourceDir = path.join(root, 'icons', 'product-src');
  const sourceFiles = fs.existsSync(sourceDir) ? fs.readdirSync(sourceDir).filter((file) => file.endsWith('.svg')).sort() : [];
  const errors = validateMap(map, { sourceFiles });
  if (errors.length) throw new Error(`icons/product-icon-map.json is invalid:\n${errors.join('\n')}`);
  const unknown = Object.keys(overrides).filter((name) => !(name in map.drawings));
  if (unknown.length) throw new Error(`Overrides name unknown drawings: ${unknown.join(', ')}`);

  const glyphs = Object.entries(map.drawings).map(([name, { codepoint }]) => ({
    name,
    codepoint,
    svg: fs.readFileSync(overrides[name] ?? path.join(sourceDir, `${name}.svg`), 'utf8'),
  }));
  const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const woff = await buildFont({ fontId: PRODUCT_FONT.id, fontFamily: PRODUCT_FONT.family, version: version.split('.').slice(0, 2).join('.'), glyphs });

  const iconsOut = path.join(outDir, 'icons');
  fs.mkdirSync(iconsOut, { recursive: true });
  const fontPath = path.join(iconsOut, path.basename(PRODUCT_FONT.file));
  fs.writeFileSync(fontPath, woff);
  const theme = {
    $schema: 'vscode://schemas/product-icon-theme',
    fonts: [{ id: PRODUCT_FONT.id, family: PRODUCT_FONT.family, src: [{ path: PRODUCT_FONT.themeSrc, format: 'woff' }], weight: 'normal', style: 'normal' }],
    iconDefinitions: iconDefinitionsFor(map),
  };
  const themePath = path.join(iconsOut, 'product-icon-theme.json');
  fs.writeFileSync(themePath, `${JSON.stringify(theme, null, 2)}\n`);
  return { drawings: glyphs.length, ids: Object.keys(theme.iconDefinitions).length, fontPath, themePath };
}
```

Replace the whole of `scripts/build-product-icons.mjs` with:

```js
import path from 'node:path';
import { buildProductIcons } from './lib/product-icons-build.mjs';

const root = path.resolve(import.meta.dirname, '..');
const { drawings, ids, fontPath } = await buildProductIcons({ root });
console.log(`Built ${drawings} product icon drawings for ${ids} icon IDs in ${path.relative(root, fontPath)}`);
```

In `scripts/validate.mjs`, change the `checkBuildFlags` source list to `['scripts/build-product-icons.mjs', 'scripts/lib/product-font.mjs', 'scripts/lib/product-icons-build.mjs']`.

Run: `node --test test/build-product-icons.test.mjs`
Expected: PASS.

- [ ] **Step 3: Migrate the repo map (one-off script, not committed)**

Save as `scripts/migrate-product-map.mjs`, run it, then delete it:

```js
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const old = JSON.parse(fs.readFileSync('icons/product-icon-map.json', 'utf8'));
// Spec section 5.1: keys dropped in 2.0 (file/folder are replaced by symbol-file/symbol-folder later).
const dropped = ['home', 'activity-bar-left', 'activity-bar-right', 'menu', 'copy', 'edit', 'save', 'file', 'folder'];
const drawings = {};
for (const [id, codepoint] of Object.entries(old.icons)) {
  if (dropped.includes(id)) {
    execFileSync('git', ['rm', '-q', `icons/product-src/${id}.svg`]);
    continue;
  }
  execFileSync('git', ['mv', `icons/product-src/${id}.svg`, `icons/product-src/legacy-${id}.svg`]);
  drawings[`legacy-${id}`] = { codepoint, ids: [id], legacy: true };
}
const map = { fontId: old.fontId, fontFamily: old.fontFamily, retiredCodepoints: dropped.map((id) => old.icons[id]).sort(), drawings };
fs.writeFileSync('icons/product-icon-map.json', `${JSON.stringify(map, null, 2)}\n`);
console.log(`${Object.keys(drawings).length} legacy drawings, ${map.retiredCodepoints.length} retired codepoints`);
```

Run: `node scripts/migrate-product-map.mjs && rm scripts/migrate-product-map.mjs`
Expected: `39 legacy drawings, 9 retired codepoints`.

- [ ] **Step 4: Build and confirm the geometry fix on real glyphs**

Run: `npm run build:product-icons`
Expected: `Built 39 product icon drawings for 39 icon IDs in icons/witchynibbles-product-icons.woff`.

Run: `node scripts/validate.mjs --only product-pipeline`
Expected: FAIL only with glyph-rule errors on the legacy sources: winding errors in `legacy-explorer-view-icon`, `legacy-extensions-view-icon`, `legacy-search-view-icon`, `legacy-filter`, `legacy-search`, `legacy-terminal-view-icon` and `legacy-trash`, and `uses fill-rule evenodd` in `legacy-debug-alt`, `legacy-explorer-view-icon`, `legacy-extensions-view-icon` and `legacy-search-view-icon` (plus `legacy-warning`). There must be **no** `differs from its source bounds`, `is stale`, `sets centerHorizontally` or map errors. In particular `legacy-extensions-view-icon` now sits at its source position; in 1.2.1 the centring flags moved it from y 4-10.5 to 4.74-11.26.

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A scripts/lib/product-icons-build.mjs scripts/build-product-icons.mjs scripts/validate.mjs test/build-product-icons.test.mjs test/fixtures/product-root icons
git commit -m "Build product icons from a drawing-based map without centring"
```

---

### Task 11: Glyph authoring toolkit

Glyphs are written as code with primitives that set winding by construction, then written to `icons/product-src/*.svg` (the committed sources the build reads). A drift test keeps the committed SVGs equal to the generator, and runs every drawing through the section 4 rules.

**Files:**
- Create: `scripts/glyphs/primitives.mjs`, `scripts/glyphs/batch-1.mjs`, `scripts/glyphs/index.mjs`, `scripts/draw-product-glyphs.mjs`, `scripts/claim-drawing.mjs`, `scripts/render-glyph-sheet.mjs`, `test/glyph-primitives.test.mjs`, `test/glyph-drift.test.mjs`, `test/claim-drawing.test.mjs`
- Modify: `scripts/lib/product-icon-map.mjs` (add `claimDrawing`, `dropLegacy`), `package.json` (scripts)

**Interfaces:**
- Produces (`primitives.mjs`): `polygon(points, dir = 'cw')`, `rect(x, y, w, h, dir)`, `roundRect(x, y, w, h, r, dir)`, `disc(cx, cy, r, dir)`, `ring(cx, cy, r, stroke = 1) -> string[]`, `frame(x, y, w, h, { stroke = 1, r = 1 }) -> string[]`, `crescent({ cx, cy, r, thickness = 2, facing = 'right' | 'left' | 'up' | 'down', dir })`, `leaf([x1, y1], [x2, y2], width, dir)`, `svgDocument(...parts) -> string`. `dir` is `'cw'` for solid shapes and `'ccw'` for holes. A crescent with `r = 3` and `thickness = 2` is 4×6, the smallest that meets the section 4 minimum (4×4, at least 2 thick).
- Produces (`batch-1.mjs`): mutable exports `drawings: { [name]: () => svg }` and `variants: { ['name.variant']: () => svg }`. Variants are written to `icons/product-src-variants/` and never enter the map.
- Produces (`index.mjs`): `glyphModules`, the list of glyph modules (batch 1 now, later batches append).
- Produces (`product-icon-map.mjs`): `claimDrawing(map, { name, codepoint, ids }) -> { map, removed }` and `dropLegacy(map) -> { map, removed }`. `removed` lists the drawings that lost all their IDs; their codepoints are retired.

- [ ] **Step 1: Write the failing tests**

`test/glyph-primitives.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { crescent, disc, frame, leaf, polygon, rect, ring, roundRect, svgDocument } from '../scripts/glyphs/primitives.mjs';
import { pathBounds, signedArea, subpaths, windingProblems } from '../scripts/lib/svg-geometry.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';

const sign = (d) => Math.sign(signedArea(subpaths(d)[0]));

test('every primitive honours its direction', () => {
  for (const [label, cw, ccw] of [
    ['polygon', polygon([[2, 2], [6, 2], [4, 6]]), polygon([[2, 2], [6, 2], [4, 6]], 'ccw')],
    ['rect', rect(2, 2, 4, 4), rect(2, 2, 4, 4, 'ccw')],
    ['roundRect', roundRect(2, 2, 12, 12, 1), roundRect(2, 2, 12, 12, 1, 'ccw')],
    ['disc', disc(8, 8, 4), disc(8, 8, 4, 'ccw')],
    ['leaf', leaf([4, 8], [12, 8], 4), leaf([4, 8], [12, 8], 4, 'ccw')],
    ['crescent', crescent({ cx: 8, cy: 8, r: 3 }), crescent({ cx: 8, cy: 8, r: 3, dir: 'ccw' })],
  ]) {
    assert.equal(sign(cw), 1, `${label} cw`);
    assert.equal(sign(ccw), -1, `${label} ccw`);
  }
});

test('crescent r=3 is 4x6 in every facing', () => {
  assert.deepEqual(pathBounds([crescent({ cx: 8, cy: 8, r: 3, facing: 'right' })]), { minX: 5, maxX: 9, minY: 5, maxY: 11 });
  const up = pathBounds([crescent({ cx: 8, cy: 8, r: 3, facing: 'up' })]);
  assert.equal(Math.round(up.maxX - up.minX), 6);
  assert.equal(Math.round(up.maxY - up.minY), 4);
});

test('frames and rings come out with real holes', () => {
  assert.deepEqual(windingProblems([frame(3, 1, 10, 14).join('')]), []);
  assert.deepEqual(windingProblems([[...ring(8, 8, 6), crescent({ cx: 8, cy: 8, r: 3 })].join('')]), []);
});

test('svgDocument output satisfies the glyph rules', () => {
  assert.deepEqual(glyphRuleProblems(svgDocument(frame(2, 2, 12, 12), disc(8, 8, 2))).errors, []);
});
```

`test/claim-drawing.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { claimDrawing, dropLegacy } from '../scripts/lib/product-icon-map.mjs';

const base = () => ({
  fontId: 'witchynibbles-product-icons', fontFamily: 'WitchyNibbles Product Icons', retiredCodepoints: ['E01B'],
  drawings: {
    'legacy-close': { codepoint: 'E00C', ids: ['close'], legacy: true },
    'legacy-check': { codepoint: 'E00D', ids: ['check'], legacy: true },
  },
});

test('claiming IDs takes them from other drawings and retires emptied ones', () => {
  const { map, removed } = claimDrawing(base(), { name: 'close', codepoint: 'E10F', ids: ['close', 'widget-close'] });
  assert.deepEqual(removed, ['legacy-close']);
  assert.deepEqual(map.drawings.close, { codepoint: 'E10F', ids: ['close', 'widget-close'] });
  assert.ok('legacy-check' in map.drawings);
  assert.deepEqual(map.retiredCodepoints, ['E00C', 'E01B']);
});

test('dropLegacy removes every legacy drawing and retires its codepoint', () => {
  const { map, removed } = dropLegacy(claimDrawing(base(), { name: 'close', codepoint: 'E10F', ids: ['close'] }).map);
  assert.deepEqual(removed, ['legacy-check']);
  assert.deepEqual(Object.keys(map.drawings), ['close']);
  assert.ok(map.retiredCodepoints.includes('E00D'));
});
```

`test/glyph-drift.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { glyphModules } from '../scripts/glyphs/index.mjs';
import { glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';

const icons = path.resolve(import.meta.dirname, '..', 'icons');

for (const { drawings, variants } of glyphModules) {
  for (const [kind, entries, dir] of [['drawing', drawings, 'product-src'], ['variant', variants, 'product-src-variants']]) {
    for (const [name, draw] of Object.entries(entries)) {
      test(`${kind} ${name}: committed SVG matches the generator and passes the glyph rules`, () => {
        const svg = draw();
        assert.deepEqual(glyphRuleProblems(svg).errors, []);
        assert.equal(fs.readFileSync(path.join(icons, dir, `${name}.svg`), 'utf8'), svg, 'run npm run draw:glyphs');
      });
    }
  }
}
```

Run: `npm test`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for the glyph modules and missing `claimDrawing`.

- [ ] **Step 2: Write `scripts/glyphs/primitives.mjs`**

```js
// Glyph primitives on the 16-unit grid. 'cw' = solid (clockwise on screen), 'ccw' = hole.
// The font pipeline fills with nonzero winding, so a hole must be wound opposite to its container (spec section 4).
import { signedArea } from '../lib/svg-geometry.mjs';

const fmt = (value) => Number(value.toFixed(3)).toString();
const pt = ([x, y]) => `${fmt(x)} ${fmt(y)}`;

export function polygon(points, dir = 'cw') {
  const clockwise = signedArea(points) > 0;
  const ordered = clockwise === (dir === 'cw') ? points : [...points].reverse();
  const [first, ...rest] = ordered;
  return `M${pt(first)}${rest.map((p) => `L${pt(p)}`).join('')}Z`;
}

export const rect = (x, y, w, h, dir = 'cw') => polygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], dir);

export function roundRect(x, y, w, h, r, dir = 'cw') {
  if (r === 0) return rect(x, y, w, h, dir);
  const a = `A${fmt(r)} ${fmt(r)} 0 0 ${dir === 'cw' ? 1 : 0} `;
  if (dir === 'cw') {
    return `M${pt([x + r, y])}H${fmt(x + w - r)}${a}${pt([x + w, y + r])}V${fmt(y + h - r)}${a}${pt([x + w - r, y + h])}H${fmt(x + r)}${a}${pt([x, y + h - r])}V${fmt(y + r)}${a}${pt([x + r, y])}Z`;
  }
  return `M${pt([x + r, y])}${a}${pt([x, y + r])}V${fmt(y + h - r)}${a}${pt([x + r, y + h])}H${fmt(x + w - r)}${a}${pt([x + w, y + h - r])}V${fmt(y + r)}${a}${pt([x + w - r, y])}Z`;
}

export function disc(cx, cy, r, dir = 'cw') {
  const a = `A${fmt(r)} ${fmt(r)} 0 1 ${dir === 'cw' ? 1 : 0} `;
  return `M${pt([cx - r, cy])}${a}${pt([cx + r, cy])}${a}${pt([cx - r, cy])}Z`;
}

export const ring = (cx, cy, r, stroke = 1) => [disc(cx, cy, r, 'cw'), disc(cx, cy, r - stroke, 'ccw')];

// Frame: radius-1 outer corners, sharp inner corners (section 4 advisory defaults).
export const frame = (x, y, w, h, { stroke = 1, r = 1 } = {}) => [
  roundRect(x, y, w, h, r, 'cw'),
  rect(x + stroke, y + stroke, w - 2 * stroke, h - 2 * stroke, 'ccw'),
];

const TURN = { right: 0, down: 90, left: 180, up: 270 };

// Outer disc (cx, cy, r) minus an equal disc shifted `thickness` toward `facing` (the opening).
// Width across the opening axis = r + thickness / 2; thickest point = thickness.
export function crescent({ cx, cy, r, thickness = 2, facing = 'right', dir = 'cw' }) {
  const half = thickness / 2;
  const h = Math.sqrt(r * r - half * half);
  const angle = (TURN[facing] * Math.PI) / 180;
  const rotate = ([x, y]) => [cx + x * Math.cos(angle) - y * Math.sin(angle), cy + x * Math.sin(angle) + y * Math.cos(angle)];
  const top = rotate([half, -h]);
  const bottom = rotate([half, h]);
  const rr = fmt(r);
  return dir === 'cw'
    ? `M${pt(bottom)}A${rr} ${rr} 0 1 1 ${pt(top)}A${rr} ${rr} 0 0 0 ${pt(bottom)}Z`
    : `M${pt(top)}A${rr} ${rr} 0 1 0 ${pt(bottom)}A${rr} ${rr} 0 0 1 ${pt(top)}Z`;
}

// Lens between two tips, `width` across its middle.
export function leaf([x1, y1], [x2, y2], width, dir = 'cw') {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const sagitta = width / 2;
  const r = (length * length) / (8 * sagitta) + sagitta / 2;
  const a = `A${fmt(r)} ${fmt(r)} 0 0 ${dir === 'cw' ? 1 : 0} `;
  return `M${pt([x1, y1])}${a}${pt([x2, y2])}${a}${pt([x1, y1])}Z`;
}

export const svgDocument = (...parts) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="${parts.flat(Infinity).join('')}"/></svg>\n`;
```

`scripts/glyphs/batch-1.mjs`:

```js
// First batch (spec section 5.3): 21 designs, 23 drawings. Tasks 12-15 append to these objects.
import { crescent, disc, frame, leaf, polygon, rect, ring, roundRect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};
```

`scripts/glyphs/index.mjs`:

```js
import * as batch1 from './batch-1.mjs';

export const glyphModules = [batch1];
```

`scripts/draw-product-glyphs.mjs`:

```js
import fs from 'node:fs';
import path from 'node:path';
import { glyphModules } from './glyphs/index.mjs';

const root = path.resolve(import.meta.dirname, '..');
let written = 0;
for (const { drawings, variants } of glyphModules) {
  for (const [dir, entries] of [['product-src', drawings], ['product-src-variants', variants]]) {
    fs.mkdirSync(path.join(root, 'icons', dir), { recursive: true });
    for (const [name, draw] of Object.entries(entries)) {
      fs.writeFileSync(path.join(root, 'icons', dir, `${name}.svg`), draw());
      written += 1;
    }
  }
}
console.log(`Wrote ${written} glyph SVGs`);
```

- [ ] **Step 3: Add `claimDrawing`/`dropLegacy` and the claim CLI**

Append to `scripts/lib/product-icon-map.mjs`:

```js
export function claimDrawing(map, { name, codepoint, ids }) {
  const retired = new Set(map.retiredCodepoints ?? []);
  const drawings = {};
  const removed = [];
  for (const [other, drawing] of Object.entries(map.drawings)) {
    if (other === name) continue;
    const remaining = drawing.ids.filter((id) => !ids.includes(id));
    if (remaining.length) drawings[other] = { ...drawing, ids: remaining };
    else { removed.push(other); retired.add(drawing.codepoint); }
  }
  const previous = map.drawings[name];
  if (previous && previous.codepoint !== codepoint) retired.add(previous.codepoint);
  drawings[name] = { codepoint, ids: [...ids] };
  return { map: { ...map, retiredCodepoints: [...retired].sort(), drawings }, removed };
}

export function dropLegacy(map) {
  const retired = new Set(map.retiredCodepoints ?? []);
  const drawings = {};
  const removed = [];
  for (const [name, drawing] of Object.entries(map.drawings)) {
    if (drawing.legacy) { removed.push(name); retired.add(drawing.codepoint); } else drawings[name] = drawing;
  }
  return { map: { ...map, retiredCodepoints: [...retired].sort(), drawings }, removed };
}
```

`scripts/claim-drawing.mjs`:

```js
// node scripts/claim-drawing.mjs <drawing> <codepoint> <id> [<id> ...]   map IDs to a drawing
// node scripts/claim-drawing.mjs --drop-legacy                            remove every legacy drawing
import fs from 'node:fs';
import path from 'node:path';
import { claimDrawing, dropLegacy } from './lib/product-icon-map.mjs';

const root = path.resolve(import.meta.dirname, '..');
const mapPath = path.join(root, 'icons', 'product-icon-map.json');
const [first, codepoint, ...ids] = process.argv.slice(2);
const current = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
if (first !== '--drop-legacy' && (!first || !codepoint || !ids.length)) throw new Error('usage: claim-drawing.mjs <drawing> <codepoint> <id> [<id> ...]');
const { map, removed } = first === '--drop-legacy'
  ? dropLegacy(current)
  : claimDrawing(current, { name: first, codepoint, ids });
for (const name of removed) fs.rmSync(path.join(root, 'icons', 'product-src', `${name}.svg`), { force: true });
fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
console.log(`${first === '--drop-legacy' ? 'dropped legacy' : `${first} (${codepoint}) <- ${ids.join(', ')}`}${removed.length ? `; removed ${removed.join(', ')}` : ''}`);
```

- [ ] **Step 4: Write the contact-sheet renderer**

`scripts/render-glyph-sheet.mjs`:

```js
// Renders the built font at 12/16/24px on each theme's activity bar and side bar colours, plus the variant SVGs.
// Usage: node scripts/render-glyph-sheet.mjs  ->  review-out/glyph-sheet/index.html
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const out = path.join(root, 'review-out', 'glyph-sheet');
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(root, 'icons', 'witchynibbles-product-icons.woff'), path.join(out, 'font.woff'));

const map = JSON.parse(read('icons/product-icon-map.json'));
const themes = JSON.parse(read('package.json')).contributes.themes.map(({ label, path: themePath }) => {
  const c = JSON.parse(read(themePath)).colors;
  return { label, bar: c['activityBar.background'], active: c['activityBar.foreground'], inactive: c['activityBar.inactiveForeground'], side: c['sideBar.background'], text: c['sideBar.foreground'] };
});
const variantDir = path.join(root, 'icons', 'product-src-variants');
const variantFiles = fs.existsSync(variantDir) ? fs.readdirSync(variantDir).filter((file) => file.endsWith('.svg')).sort() : [];

const glyph = (codepoint) => (size) => `<span class="g" style="font-size:${size}px">&#x${codepoint};</span>`;
const inline = (file) => (size) => fs.readFileSync(path.join(variantDir, file), 'utf8').trim().replace('<svg ', `<svg width="${size}" height="${size}" `);
const cells = (render) => themes.map((t) => `<td style="background:${t.bar};color:${t.inactive}">${render(12)}${render(16)}${render(24)}<span style="color:${t.active}">${render(24)}</span></td><td style="background:${t.side};color:${t.text}">${render(16)}</td>`).join('');
const rows = [
  ...Object.entries(map.drawings).map(([name, { codepoint, ids }]) => `<tr><th>${name}<small>${codepoint} · ${ids.join(' ')}</small></th>${cells(glyph(codepoint))}</tr>`),
  ...variantFiles.map((file) => `<tr><th>${file}<small>variant for the gate (not in the font)</small></th>${cells(inline(file))}</tr>`),
];
const html = `<!doctype html><meta charset="utf-8"><title>Glyph sheet</title>
<style>@font-face{font-family:WNPI;src:url(font.woff)}body{margin:16px;font:12px system-ui;background:#fff;color:#222}
table{border-collapse:collapse}th{text-align:left;padding:4px 8px;font-weight:600;vertical-align:top}th small{display:block;font-weight:400;color:#666;max-width:260px}
td{padding:6px 10px;white-space:nowrap}.g{font-family:WNPI;line-height:1;display:inline-block;margin-right:8px;vertical-align:middle}svg{margin-right:8px;vertical-align:middle}</style>
<table><tr><th></th>${themes.map((t) => `<th colspan="2">${t.label}<small>activity bar 12/16/24 inactive, 24 active · side bar 16</small></th>`).join('')}</tr>${rows.join('\n')}</table>`;
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log(path.join(out, 'index.html'));
```

Add to `package.json` `scripts`: `"draw:glyphs": "node scripts/draw-product-glyphs.mjs"` and `"glyph-sheet": "node scripts/render-glyph-sheet.mjs"`.

- [ ] **Step 5: Run the tests**

Run: `npm run draw:glyphs && npm test`
Expected: `Wrote 0 glyph SVGs`, and every test passes (the drift suite has no cases yet).

- [ ] **Step 6: Smoke-test the sheet with agent-browser**

```bash
npm run glyph-sheet
agent-browser set viewport 1800 1400 1
agent-browser open "file://$PWD/review-out/glyph-sheet/index.html"
agent-browser screenshot --full review-out/glyph-sheet/sheet@1x.png
agent-browser set viewport 1800 1400 2
agent-browser screenshot --full review-out/glyph-sheet/sheet@2x.png
```

Expected: both PNGs exist and show the 39 legacy glyphs in four theme columns. Open them with the Read tool and confirm the glyphs render from the font (they are not empty boxes). This is a Chromium-on-Linux preview for drawing iterations; the gate itself uses Windows VS Code (Task 17).

- [ ] **Step 7: Commit**

```bash
git add scripts/glyphs scripts/draw-product-glyphs.mjs scripts/claim-drawing.mjs scripts/render-glyph-sheet.mjs scripts/lib/product-icon-map.mjs test/glyph-primitives.test.mjs test/glyph-drift.test.mjs test/claim-drawing.test.mjs package.json
git commit -m "Add winding-safe glyph primitives, generator, claim helper and contact sheet"
```

---

### Drawing tasks 12-15: shared procedure and codepoints

Every drawing follows section 4. Each drawing task repeats the same loop:

1. Append the drawing code to `scripts/glyphs/batch-1.mjs`.
2. Run `npm run draw:glyphs`.
3. Claim the IDs with `node scripts/claim-drawing.mjs …` (commands given per task).
4. Run `npm run build:product-icons`, then `node scripts/validate.mjs --only product-pipeline` (no errors may mention the new drawings; soft grid warnings on curves and diagonals are acceptable).
5. Run `npm test`.
6. Run `npm run glyph-sheet`, screenshot with agent-browser at DPR 1 and 2 (Task 11 Step 6), and inspect the PNGs with the Read tool at 12, 16 and 24px against the checklist below.
7. Commit.

The coordinates given are a first pass that already satisfies the keylines, minimum sizes and winding. If the sheet shows a legibility problem, adjust inside the same keyline and say what changed in the commit message. Do not change a metaphor (spec section 5.2 is settled).

Per-drawing checklist (from section 4):
- inside its keyline; outer edges of activity-bar glyphs on even coordinates where the drawing allows;
- horizontal and vertical edges on whole numbers, so a 1-unit stroke runs n to n+1;
- one filled accent on the meaning-bearing part: dot-like ≥3×3, shape-bearing ≥4×4 (crescent: `r ≥ 3`, at least 2 thick);
- one full unit between an accent and any stroke; cut-outs ≥2×2, except straight slots ≥4 long; no sliver under 1 unit;
- odd-width central features on pixel column 7 (x 7-8).

| Codepoint | Drawing | Task | IDs |
| :- | :- | :- | :- |
| E100 | `explorer-grimoire` | 14 | explorer-view-icon |
| E101 | `scrying-glass` | 14 | search-view-icon, search |
| E102 | `herb-sprig` | 14 | source-control-view-icon |
| E103 | `spider` | 14 | run-view-icon, debug-alt |
| E104 | `flask` | 14 | test-view-icon |
| E105 | `rune-tiles` | 14 | extensions-view-icon |
| E106 | `moon-gate` | 15 | remote-explorer-view-icon |
| E107 | `witch-hat` | 15 | accounts-view-bar-icon, account |
| E108 | `gear` | 15 | settings-view-bar-icon, settings-gear, gear, extensions-manage, notifications-configure |
| E109 | `cat-head` | 15 | chat-view-icon, copilot |
| E10A | `owl` | 15 | timeline-view-icon |
| E10B | `terminal` | 15 | terminal, terminal-view-icon |
| E10C | `chevron-down` | 12 | chevron-down, tree-item-expanded, view-pane-container-expanded, search-show-replace, find-expanded, folding-expanded |
| E10D | `chevron-right` | 12 | view-pane-container-collapsed, search-hide-replace, find-collapsed, folding-collapsed, menu-submenu |
| E10E | `chevron-up` | 12 | notifications-expand |
| E10F | `close` | 12 | close, widget-close, panel-close, notifications-clear, dialog-close |
| E110 | `star-separator` | 12 | breadcrumb-separator |
| E111 | `dirty-star` | 12 | circle-filled |
| E112 | `candle` | 13 | light-bulb, gutter-lightbulb |
| E113 | `skull` | 13 | error, dialog-error, testing-failed-icon |
| E114 | `bell` | 13 | bell |
| E115 | `sprig-small` | 13 | git-branch |
| E116 | `moon-breakpoint` | 13 | debug-breakpoint |

Batch-1 coverage, counting down: 37 unmapped batch-1 IDs before Task 12, then 19 after Task 12, 12 after Task 13, 10 after Task 14 and 0 after Task 15. Check with `node scripts/validate.mjs --only product-batch:1 | grep -c 'does not map'`.

---

### Task 12: Batch 1, shared chrome (chevrons, close, ⋆, ✦) and the `circle-filled` audit

**Files:**
- Create: `icons/product-src/{chevron-down,chevron-right,chevron-up,close,star-separator,dirty-star}.svg` (generated), `test/circle-filled-audit.test.mjs`
- Modify: `scripts/glyphs/batch-1.mjs`, `icons/product-icon-map.json`, `docs/research/vscode-1.141-icon-inventory.md`, generated theme and font

**Interfaces:**
- Consumes: primitives, `claim-drawing.mjs`, `extractRegistrations` (Task 3).
- Produces: drawings `chevron-down`, `chevron-right`, `chevron-up`, `close`, `star-separator`, `dirty-star`.

- [ ] **Step 1: Audit `circle-filled` before re-mapping it (spec section 5.2 requires it)**

```bash
B="/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js"
grep -o 'ze("[a-z0-9-]*",[A-Za-z]\{1,3\}\.circleFilled' "$B" | sort -u
grep -o '.\{60\}\.circleFilled[^C].\{40\}' "$B" | grep -v 'ze("' | head -40
```

Expected first command: `terminal-decoration-success` and `ports-forwarded-with-process-icon`. The second lists the direct consumers. Append to the inventory doc:

```markdown
## Audit: `circle-filled` (before the 2.0 ✦ re-mapping)

Mapping `circle-filled` to the ✦ dirty mark also changes:

- Registered IDs that default to it, which inherit the ✦: `terminal-decoration-success` (terminal gutter, mapped separately in the 2.0 status group) and `ports-forwarded-with-process-icon` (Ports view, extended tier, stays on the inherited ✦ unless mapped).
- Direct uses of the glyph: the Open Editors dirty indicator (wanted), chat "thinking" rows and their spinner item, agent-session status and read indicators, the colour swatches in the terminal "change color" quick pick, profile list items, and the Extension Host profile actions.
- Phase 1 renders all of these as ✦. The review gate shows the terminal gutter and Open Editors; the author decides whether any other consumer needs its own key.
```

`test/circle-filled-audit.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractRegistrations } from '../scripts/extract-icon-ids.mjs';

const BUNDLE = process.env.VSCODE_WORKBENCH_JS ?? '/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js';

test('the registered IDs that inherit circle-filled are exactly the audited ones', (t) => {
  if (!fs.existsSync(BUNDLE)) return t.skip('VS Code bundle not available');
  const inheritors = [...extractRegistrations(fs.readFileSync(BUNDLE, 'utf8'))]
    .filter(([, entry]) => entry.kind === 'registered' && entry.default === 'circle-filled')
    .map(([id]) => id)
    .sort();
  assert.deepEqual(inheritors, ['ports-forwarded-with-process-icon', 'terminal-decoration-success']);
});
```

- [ ] **Step 2: Append the drawings**

Append to `scripts/glyphs/batch-1.mjs`:

```js
// ---- Shared chrome (Task 12) ----
// Chevrons: ~1.4-unit 45-degree bands, 2 units deep at the apex; one pre-rotated drawing per orientation (section 5.1).
drawings['chevron-down'] = () => svgDocument(polygon([[3, 6], [4, 5], [8, 9], [12, 5], [13, 6], [8, 11]]));
drawings['chevron-right'] = () => svgDocument(polygon([[5, 4], [6, 3], [11, 8], [6, 13], [5, 12], [9, 8]]));
drawings['chevron-up'] = () => svgDocument(polygon([[3, 10], [8, 5], [13, 10], [12, 11], [8, 7], [4, 11]]));
// Close and the dirty star swap in the same tab-action box: same centre (8,8), same 10-unit span (3-13).
drawings.close = () => svgDocument(polygon([[3, 4], [4, 3], [13, 12], [12, 13]]), polygon([[12, 3], [13, 4], [4, 13], [3, 12]]));
drawings['dirty-star'] = () => svgDocument(polygon([[8, 3], [9, 7], [13, 8], [9, 9], [8, 13], [7, 9], [3, 8], [7, 7]]));
// Breadcrumb separator: small five-point star with a solid core.
drawings['star-separator'] = () => svgDocument(polygon([[8, 4.5], [9, 7], [11.5, 7], [9.5, 8.5], [10.5, 11], [8, 9.5], [5.5, 11], [6.5, 8.5], [4.5, 7], [7, 7]]));
```

- [ ] **Step 3: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs chevron-down E10C chevron-down tree-item-expanded view-pane-container-expanded search-show-replace find-expanded folding-expanded
node scripts/claim-drawing.mjs chevron-right E10D view-pane-container-collapsed search-hide-replace find-collapsed folding-collapsed menu-submenu
node scripts/claim-drawing.mjs chevron-up E10E notifications-expand
node scripts/claim-drawing.mjs close E10F close widget-close panel-close notifications-clear dialog-close
node scripts/claim-drawing.mjs star-separator E110 breadcrumb-separator
node scripts/claim-drawing.mjs dirty-star E111 circle-filled
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline
node scripts/validate.mjs --only product-batch:1 | grep -c 'does not map'
npm test
```

Expected: the `close` claim prints `removed legacy-close`. Validation shows no errors for the six new drawings (only the legacy errors from Task 10). The batch-1 count is `19`. Tests pass, including six new drift cases and the audit test.

- [ ] **Step 4: Inspect the sheet**

Run `npm run glyph-sheet` and the agent-browser commands from Task 11 Step 6. Confirm at 16px that the ✦ and the ✕ look the same size, that the chevrons read as chevrons at 12px, and that ⋆ is clearly not ✦.

- [ ] **Step 5: Commit**

```bash
git add -A scripts/glyphs icons test/circle-filled-audit.test.mjs docs/research/vscode-1.141-icon-inventory.md
git commit -m "Draw batch-1 chrome glyphs and record the circle-filled audit"
```

---

### Task 13: Batch 1, signals (candle, skull, bell, small sprig, moon breakpoint)

**Files:**
- Create: `icons/product-src/{candle,skull,bell,sprig-small,moon-breakpoint}.svg`, `icons/product-src-variants/moon-breakpoint.plain.svg` (generated)
- Modify: `scripts/glyphs/batch-1.mjs`, `icons/product-icon-map.json`, generated theme and font

**Interfaces:**
- Produces: drawings `candle`, `skull`, `bell`, `sprig-small`, `moon-breakpoint`, and the variant `moon-breakpoint.plain`.

**Decision 4 (iv):** the crater stays only if it survives a real 16px render, so both versions go to the gate. Draw both: the crater goes into the font, and the plain disc goes into `icons/product-src-variants/`. The gate run builds a variant VSIX with the plain disc, and the author picks one at the gate. `debug-hint` will reuse this drawing (decision 4 i), but it is claimed with the `debug` batch in phase 2, not here.

Footprints: `moon-breakpoint` uses the Codicon breakpoint footprint, an 8-unit disc on 4-12 centred on (8,8) (section 5.2). The skull replaces full-size `error` in the status bar and the Problems tree, so it uses the ~12-unit footprint of Codicon `error` rather than the 8-unit signal keyline. That keyline row covers gutter and terminal decorations and breakpoints. Record this reading in the gate checklist (Task 18).

- [ ] **Step 1: Append the drawings**

```js
// ---- Signals (Task 13) ----
// Flame: pointed top, round bottom; shape-bearing accent 4x5.
const flame = (cx, top, bottom, half) => `M${cx} ${top}C${cx + half * 0.6} ${top + 1.5} ${cx + half} ${bottom - half - 0.6} ${cx + half} ${bottom - half}`
  + `A${half} ${half} 0 0 1 ${cx - half} ${bottom - half}C${cx - half} ${bottom - half - 0.6} ${cx - half * 0.6} ${top + 1.5} ${cx} ${top}Z`;

drawings.candle = () => svgDocument(
  frame(5, 8, 6, 7, { r: 0 }), // wax body x5-11, y8-15, 1-unit walls, 4x5 inside
  rect(7, 7, 2, 1), // wick x7-9, y7-8
  flame(8, 1, 6, 2), // accent: flame x6-10, y1-6, one unit above the wick
);

drawings.skull = () => svgDocument(
  roundRect(2, 2, 12, 9, 4), // cranium x2-14, y2-11
  rect(5, 10, 6, 4), // jaw x5-11, y10-14 (overlaps the cranium; same winding, so they merge)
  roundRect(4, 6, 3, 3, 1, 'ccw'), // left eye x4-7, y6-9
  roundRect(9, 6, 3, 3, 1, 'ccw'), // right eye x9-12, y6-9
  rect(6, 11, 4, 1, 'ccw'), // teeth line: straight 4-unit slot (section 4 exception)
);

// Hand bell. Keep the top-right corner (x10-15, y1-6) free so bell-dot can add its ✦ there in phase 2.
drawings.bell = () => svgDocument(
  rect(7, 1, 2, 3), // handle x7-9, y1-4
  'M6 4H10C11.1 4 12 4.9 12 6V11L14 13H2L4 11V6C4 4.9 4.9 4 6 4Z', // flared bell, clockwise
  'M6 5C5.4 5 5 5.4 5 6V11.4L4.4 12H11.6L11 11.4V6C11 5.4 10.6 5 10 5Z', // inside, counter-clockwise
  disc(8, 14, 1), // clapper x7-9, y13-15
);

// Small git-branch sprig (a different drawing from the activity-bar herb sprig).
drawings['sprig-small'] = () => svgDocument(
  rect(4, 6, 1, 9), // stem x4-5, y6-15
  leaf([4.5, 1], [4.5, 6], 4), // leaf on the stem (commit node), x2.5-6.5, y1-6
  polygon([[5, 12], [10, 7], [11, 8], [5, 14]]), // branch, ~1.4-unit 45-degree band
  leaf([10.5, 7.5], [13.5, 4.5], 4), // leaf at the branch tip (commit node)
);

drawings['moon-breakpoint'] = () => svgDocument(disc(8, 8, 4), disc(9, 7, 1, 'ccw')); // 8-unit full moon, 2x2 crater
variants['moon-breakpoint.plain'] = () => svgDocument(disc(8, 8, 4)); // decision 4(iv) alternative
```

- [ ] **Step 2: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs candle E112 light-bulb gutter-lightbulb
node scripts/claim-drawing.mjs skull E113 error dialog-error testing-failed-icon
node scripts/claim-drawing.mjs bell E114 bell
node scripts/claim-drawing.mjs sprig-small E115 git-branch
node scripts/claim-drawing.mjs moon-breakpoint E116 debug-breakpoint
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline
node scripts/validate.mjs --only product-batch:1 | grep -c 'does not map'
npm test
```

Expected: `skull` removes `legacy-error`. No pipeline errors mention the new drawings. The batch-1 count is `12`. Tests pass.

- [ ] **Step 3: Inspect the sheet**

At 16px the skull's eyes must read as two holes (not one smudge), and the flame must read as a flame. Compare `moon-breakpoint` with the variant row: if the crater reads as an eyeball at 16px, note it for the gate. Do not swap the drawings; the author picks at the gate (decision 4 iv).

- [ ] **Step 4: Commit**

```bash
git add -A scripts/glyphs icons
git commit -m "Draw batch-1 signal glyphs (candle, skull, bell, sprig, moon)"
```

---

### Task 14: Batch 1, identity A (grimoire, scrying glass, herb sprig, spider, flask, rune tiles)

**Files:**
- Create: `icons/product-src/{explorer-grimoire,scrying-glass,herb-sprig,spider,flask,rune-tiles}.svg`, `icons/product-src-variants/scrying-glass.dot.svg` (generated)
- Modify: `scripts/glyphs/batch-1.mjs`, `icons/product-icon-map.json`, generated theme and font

**Interfaces:**
- Produces: drawings `explorer-grimoire`, `scrying-glass`, `herb-sprig`, `spider`, `flask`, `rune-tiles`, and the variant `scrying-glass.dot`.

**Decision 12:** the lens is enlarged to hold the crescent. It is already the largest lens the square keyline allows next to the handle (ring r 5), so the main drawing carries the 4×6 crescent. Draw the variant with a 4×4 plain dot in place of the crescent. Both reach the gate, and the author picks per icon.

- [ ] **Step 1: Append the drawings**

```js
// ---- Identity A (Task 14) ----
drawings['explorer-grimoire'] = () => svgDocument(
  roundRect(2, 1, 12, 14, 1), // cover x2-14, y1-15
  rect(4, 2, 9, 11, 'ccw'), // inside: left wall 2 units (spine), bottom wall 2 units (page block)
  crescent({ cx: 10, cy: 8, r: 3, facing: 'right' }), // accent: crescent clasp x7-11, y5-11
);

// Lens upper right, handle lower left (match the Codicon `search` orientation; check it in the 1.141 codicon font).
const lensAndHandle = () => [ring(9, 7, 5), polygon([[2, 13], [5.5, 9.5], [6.5, 10.5], [3, 14]])];
drawings['scrying-glass'] = () => svgDocument(lensAndHandle(), crescent({ cx: 9, cy: 7, r: 3, facing: 'right' })); // crescent 1 unit inside the rim
variants['scrying-glass.dot'] = () => svgDocument(lensAndHandle(), disc(9, 7, 2)); // decision 12 fallback

drawings['herb-sprig'] = () => svgDocument(
  rect(4, 5, 1, 10), // stem x4-5, y5-15
  leaf([4.5, 1], [4.5, 5], 4), // leaf on the stem (commit node)
  polygon([[5, 11], [10, 6], [11, 7], [5, 13]]), // branch
  leaf([10.5, 6.5], [13.5, 3.5], 4), // leaf at the branch tip (commit node)
);

// Spider on a thread; the play triangle is the accent on its body. Legs: three per side, mirrored about x = 8,
// each a 1-unit (H/V) or ~1.4-unit (45-degree) band that starts inside the body ring (4-5 units from (8,9))
// and ends at the circle-14 keyline (about 7 units from (8,8)).
const mirror = (points) => points.map(([x, y]) => [16 - x, y]);
const spiderLegs = [
  [[2.5, 4.5], [3.5, 3.5], [5.5, 5.5], [4.5, 6.5]], // upper leg, 45 degrees
  [[1.5, 9], [3.5, 9], [3.5, 10], [1.5, 10]], // middle leg, horizontal
  [[3, 13], [4, 14], [5.5, 12.5], [4.5, 11.5]], // lower leg, 45 degrees
];
drawings.spider = () => svgDocument(
  rect(7, 1, 1, 3), // thread on pixel column 7, y1-4
  ring(8, 9, 5), // body x3-13, y4-14
  polygon([[6, 7], [10, 9], [6, 11]]), // accent: play triangle 4x4, at least 1 unit inside the ring
  spiderLegs.map((leg) => polygon(leg)),
  spiderLegs.map((leg) => polygon(mirror(leg))),
);

drawings.flask = () => svgDocument(
  'M5 1H11V2H10V6L14 13V14A1 1 0 0 1 13 15H3A1 1 0 0 1 2 14V13L6 6V2H5Z', // lip, neck and body, clockwise
  'M7 2V6.27L3 13.27V14H13V13.27L9 6.27V2Z', // inside, counter-clockwise
  polygon([[6, 10], [10, 10], [11.7, 13], [4.3, 13]]), // accent: liquid, ~1 unit inside the walls
);

// Codicon extensions layout: an L of three tiles plus one lifted tile. The 3x3 tile interiors cannot hold a rune
// mark that meets the cut-out rules, so the tiles are plain; raise this at the gate.
drawings['rune-tiles'] = () => svgDocument(
  frame(2, 9, 5, 5, { r: 0 }), // bottom-left tile x2-7, y9-14
  frame(6, 9, 5, 5, { r: 0 }), // bottom-right tile x6-11 (shares the x6-7 wall)
  frame(2, 5, 5, 5, { r: 0 }), // upper tile y5-10 (shares the y9-10 wall)
  rect(9, 2, 5, 5), // accent: lifted tile x9-14, y2-7, two units clear of the others
);
```

Before claiming, check the spider legs on the sheet. If a leg end lands outside the keyline circle or inside the body's hole, move its outer or inner vertices along the leg direction. The validator does not catch keyline overshoot; the sheet does.

- [ ] **Step 2: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs explorer-grimoire E100 explorer-view-icon
node scripts/claim-drawing.mjs scrying-glass E101 search-view-icon search
node scripts/claim-drawing.mjs herb-sprig E102 source-control-view-icon
node scripts/claim-drawing.mjs spider E103 run-view-icon debug-alt
node scripts/claim-drawing.mjs flask E104 test-view-icon
node scripts/claim-drawing.mjs rune-tiles E105 extensions-view-icon
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline
node scripts/validate.mjs --only product-batch:1 | grep -c 'does not map'
npm test
```

Expected: the four evenodd legacy sources (`legacy-explorer-view-icon`, `legacy-search-view-icon`, `legacy-debug-alt`, `legacy-extensions-view-icon`) and `legacy-search` are removed, and their errors disappear. The batch-1 count is `10`. Tests pass.

- [ ] **Step 3: Inspect the sheet at 24px (activity bar) and 16px (compact)**

Check that the grimoire reads as a book (spine and page block), that the crescent in the lens stays a crescent at 16px (if it reads as a "c" or a smudge, note it for decision 12), and that the herb sprig and the small sprig are clearly two sizes of the same idea.

- [ ] **Step 4: Commit**

```bash
git add -A scripts/glyphs icons
git commit -m "Draw batch-1 identity glyphs: grimoire, scrying glass, sprig, spider, flask, tiles"
```

---

### Task 15: Batch 1, identity B (moon gate, witch hat, gear, cat head, owl, terminal)

**Files:**
- Create: `icons/product-src/{moon-gate,witch-hat,gear,cat-head,owl,terminal}.svg`, `icons/product-src-variants/gear.dot.svg` (generated)
- Modify: `scripts/glyphs/batch-1.mjs`, `icons/product-icon-map.json`, generated theme and font

**Interfaces:**
- Produces: drawings `moon-gate`, `witch-hat`, `gear`, `cat-head`, `owl`, `terminal`, and the variant `gear.dot`.

**Decision 12:** the main gear enlarges the hub to r 4 so it can hold the 4×6 crescent with one unit of clearance. Draw the variant with a smaller hub (r 3) and a 4×4 plain dot. Both reach the gate, and the author picks per icon.

**Decision 5:** do not draw the Copilot states here. `copilot-unavailable` (cat head with a slash), `copilot-snooze` (closed eyes), `copilot-dot` (star) and `copilot-warning` (drawing decided at the status-batch gate) are cat-head variants in the phase 2 `status` batch.

- [ ] **Step 1: Append the drawings**

```js
// ---- Identity B (Task 15) ----
drawings['moon-gate'] = () => svgDocument(
  'M2 15V8A6 6 0 0 1 14 8V15H13V8A5 5 0 0 0 3 8V15Z', // arch with a 1-unit wall, open at the ground
  rect(1, 14, 3, 1), rect(12, 14, 3, 1), // feet
  crescent({ cx: 8, cy: 8, r: 3, facing: 'right' }), // accent x5-9, y5-11, two units inside the arch
);

drawings['witch-hat'] = () => svgDocument(
  roundRect(1, 12, 14, 2, 1), // wide brim x1-15, y12-14
  polygon([[4, 12], [8, 3], [9, 2], [13, 2], [11, 4], [12, 12]]), // cone, tip bent to the right
  polygon([[6.7, 8], [8.7, 3.8], [9.4, 3], [10.6, 3], [10, 4.4], [10.5, 8]], 'ccw'), // hollow upper cone (~1-unit walls)
  rect(5.5, 11, 5, 1, 'ccw'), // straight 5-unit slot that separates the band from the brim
  // accent: the solid band is the cone between the hollow (y8) and the slot (y11)
);

// Spin-safe (section 4): symmetric about (8,8), one tooth pointing up.
const gearOutline = ({ cx = 8, cy = 8, teeth = 8, outer = 7, root = 5.6, toothHalf = 0.3 } = {}) => {
  const points = [];
  for (let k = 0; k < teeth; k += 1) {
    const mid = (k / teeth) * 2 * Math.PI - Math.PI / 2;
    const gap = Math.PI / teeth;
    for (const [angle, radius] of [[mid - gap, root], [mid - toothHalf - 0.1, root], [mid - toothHalf, outer], [mid + toothHalf, outer], [mid + toothHalf + 0.1, root]]) {
      points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
    }
  }
  return polygon(points);
};
drawings.gear = () => svgDocument(gearOutline(), disc(8, 8, 4, 'ccw'), crescent({ cx: 8, cy: 8, r: 3, facing: 'right' })); // enlarged hub
variants['gear.dot'] = () => svgDocument(gearOutline(), disc(8, 8, 3, 'ccw'), disc(8, 8, 2)); // decision 12 fallback

drawings['cat-head'] = () => svgDocument(
  polygon([[2, 2], [6, 5], [10, 5], [14, 2], [14, 12], [11, 15], [5, 15], [2, 12]]), // head with pointed ears
  polygon([[3, 4], [5.7, 6], [10.3, 6], [13, 4], [13, 11.6], [10.6, 14], [5.4, 14], [3, 11.6]], 'ccw'), // 1-unit wall
  leaf([4, 10], [7.5, 10], 3), leaf([8.5, 10], [12, 10], 3), // accent: almond eyes 3.5x3, symmetric about x = 8
);

// Owl: low ear tufts, round eyes, pointed chin; a different silhouette from the cat.
drawings.owl = () => svgDocument(
  polygon([[2, 2], [5, 4], [11, 4], [14, 2], [14, 10], [8, 15], [2, 10]]),
  polygon([[3, 3.9], [4.7, 5], [11.3, 5], [13, 3.9], [13, 9.5], [8, 13.7], [3, 9.5]], 'ccw'),
  disc(5.5, 8.5, 1.5), disc(10.5, 8.5, 1.5), // accent: eyes 3x3 (odd diameter, centres on .5)
);

drawings.terminal = () => svgDocument(
  frame(1, 2, 14, 12), // window x1-15, y2-14
  polygon([[3, 5], [4, 4], [7, 7], [4, 10], [3, 9], [5, 7]]), // prompt ❯, x3-7, y4-10
  crescent({ cx: 11, cy: 8, r: 3, facing: 'right' }), // accent x8-12, y5-11, where the cursor would be
);
```

- [ ] **Step 2: Draw, claim, build, validate**

```bash
npm run draw:glyphs
node scripts/claim-drawing.mjs moon-gate E106 remote-explorer-view-icon
node scripts/claim-drawing.mjs witch-hat E107 accounts-view-bar-icon account
node scripts/claim-drawing.mjs gear E108 settings-view-bar-icon settings-gear gear extensions-manage notifications-configure
node scripts/claim-drawing.mjs cat-head E109 chat-view-icon copilot
node scripts/claim-drawing.mjs owl E10A timeline-view-icon
node scripts/claim-drawing.mjs terminal E10B terminal terminal-view-icon
npm run build:product-icons
node scripts/validate.mjs --only product-pipeline
node scripts/validate.mjs --only product-batch:1
npm test
```

Expected: `node scripts/validate.mjs --only product-batch:1` prints `✓ WitchyNibbles package validation passed (enforced: product-batch:1)`. Pipeline errors remain only for the legacy sources that are left (`legacy-filter`, `legacy-trash`, `legacy-warning`). Tests pass.

- [ ] **Step 3: Inspect the sheet**

At 16px the cat and the owl must be told apart by silhouette alone. In the planning preview the first-pass owl and cat were close (both have a shield-shaped head with two upper points), so expect to push them apart within their keylines, for example a rounder owl head with lower, wider tufts, and record the change. The gear must look balanced (it spins with `~spin`). The terminal's ❯ and crescent must not merge.

- [ ] **Step 4: Commit**

```bash
git add -A scripts/glyphs icons
git commit -m "Draw batch-1 identity glyphs: moon gate, hat, gear, cat, owl, terminal"
```

---

### Task 16: Close batch 1 (drop the legacy drawings, staged validation green)

**Files:**
- Create: `test/product-icon-theme.test.mjs`
- Modify: `icons/product-icon-map.json`, `icons/product-src/legacy-*.svg` (removed), generated theme and font, `icons/README.md`

**Interfaces:**
- Consumes: `claim-drawing.mjs --drop-legacy` (Task 11).
- Produces: a product icon theme that maps exactly the 48 batch-1 IDs through 23 drawings. Every other ID falls back to stock Codicons until phase 2.

**Decision 7:** dropping the legacy drawings also unmaps `layout-sidebar-left`, `layout-sidebar-right`, `layout-panel`, `refresh`, `sync`, `check` and the other 1.2.1 keys outside batch 1. That is the staging decision above. The three layout keys do not come back; the toggles they used to theme are drawn in the phase 2 `editor` batch.

- [ ] **Step 1: Write the failing theme test**

`test/product-icon-theme.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import pinned from '../icons/product-icon-ids.json' with { type: 'json' };
import theme from '../icons/product-icon-theme.json' with { type: 'json' };
import map from '../icons/product-icon-map.json' with { type: 'json' };

const batchOne = Object.entries(pinned.ids).filter(([, entry]) => entry.batch === '1').map(([id]) => id);

test('every batch-1 ID is mapped by its own key, aliases included', () => {
  for (const id of batchOne) assert.ok(id in theme.iconDefinitions, id);
  for (const alias of ['tree-item-expanded', 'menu-submenu', 'dialog-close', 'dialog-error']) assert.ok(alias in theme.iconDefinitions, alias);
});

test('23 drawings, no legacy drawings, no IDs outside the pinned list', () => {
  assert.equal(Object.keys(map.drawings).length, 23);
  assert.equal(Object.values(map.drawings).some((drawing) => drawing.legacy), false);
  for (const id of Object.keys(theme.iconDefinitions)) assert.ok(id in pinned.ids, `${id} is not pinned`);
});
```

Run: `node --test test/product-icon-theme.test.mjs`
Expected: FAIL: the map still holds legacy drawings (16 of them).

- [ ] **Step 2: Drop the legacy drawings and rebuild**

```bash
node scripts/claim-drawing.mjs --drop-legacy
npm run build:product-icons
```

Expected: `Built 23 product icon drawings for 48 icon IDs in icons/witchynibbles-product-icons.woff`.

- [ ] **Step 3: Update `icons/README.md`**

Replace its product-icon paragraph with:

```markdown
The product icon theme is built from the drawing-based map in `product-icon-map.json`: each drawing has one SVG in `product-src/`, one private-use codepoint, and the list of VS Code icon IDs that use it. Drawings are written as code in `scripts/glyphs/` (`npm run draw:glyphs` regenerates the SVGs; the tests fail if a committed SVG drifts from its generator). `node scripts/claim-drawing.mjs <drawing> <codepoint> <id…>` assigns IDs, and `npm run build:product-icons` regenerates `product-icon-theme.json` and `witchynibbles-product-icons.woff`. `product-icon-ids.json` pins the VS Code 1.141 keys the theme must cover. `product-src-variants/` holds alternatives for review gates; they never enter the font.
```

- [ ] **Step 4: Run the full staged validation**

Run: `npm test && npm run validate`
Expected: all tests pass; `✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1)`, and a pending line counting `product-batch:chrome (17)`, `product-batch:panel (9)`, `product-batch:status (15)`, `product-batch:debug (23)`, `product-batch:editor (33)`, `product-batch:symbols (15)`, `file-icons (…)` and `release (2)`.

Run: `npm run validate -- --release`
Expected: exit 1, listing exactly those pending problems as errors. This proves the 2.0 package cannot ship from this state.

- [ ] **Step 5: Commit**

```bash
git add -A icons test/product-icon-theme.test.mjs
git commit -m "Complete product icon batch 1 and retire the 1.2.1 drawings"
```

---

## Part D: reproducible gate screenshots (spec section 5.3)

### How real VS Code is driven on this machine (checked while writing this plan)

- **WSL cannot reach Windows loopback.** This WSL2 install runs in NAT mode (there is no `%UserProfile%\.wslconfig`). A probe listener on Windows `127.0.0.1:9339` was unreachable from WSL at both `127.0.0.1` and the host IP. So `agent-browser connect <port>` from WSL cannot attach to a Windows `Code.exe --remote-debugging-port`.
- **VS Code's own Electron runs Node scripts on Windows.** Running `Code.exe` with `ELECTRON_RUN_AS_NODE=1` (passed through `WSLENV=ELECTRON_RUN_AS_NODE/w`) printed `v24.21.0 43.7.7 function function win32`: Node 24, Electron 43, and global `WebSocket` and `fetch`, on Windows. Scripts must live on a Windows path, because Node refuses `\\wsl.localhost` paths (`ERR_UNC_HOST_NOT_ALLOWED`).
- **Therefore:** a dependency-free CDP client (`scripts/review/capture.mjs`) is copied to `%LOCALAPPDATA%\Temp\spellbound-review\<run>` and runs under `Code.exe` in Node mode. It launches a *second*, isolated VS Code 1.141 (`--user-data-dir`, `--extensions-dir`, `--remote-debugging-port`, `--force-device-scale-factor`), drives it with CDP key events and VS Code commands, and captures with `Page.captureScreenshot`. These are the real workbench's own rendered pixels: Chromium/Skia with Windows DirectWrite, at the requested device scale.
- **Scale.** `--force-device-scale-factor` reproduces Windows display scale (100/125/150/200%), the case the spec says blurs. The display here is 1920×1080 at 96 DPI. If the flag is not honoured (the spike checks `devicePixelRatio`), set `"mode": "zoom"` in the job file to use `window.zoomLevel = ln(scale) / ln(1.2)` (1.2239, 2.2239, 3.8018) instead. Window zoom changes `devicePixelRatio` in Electron too.
- **agent-browser** (WSL, headless Chromium) assembles the captures into contact sheets and previews glyphs during drawing. It never stands in for VS Code at the gate.
- **Fallbacks if the CDP spike fails.** (B) PowerShell `Graphics.CopyFromScreen` on the review window's rectangle, with `WScript.Shell.SendKeys` for the same keybindings. It is real pixels but slower and focus-sensitive. (C) WSL mirrored networking (`networkingMode=mirrored` in `.wslconfig`, then `wsl --shutdown`), which lets `agent-browser connect 9333` work directly. (C) edits the author's machine configuration and restarts every WSL session, so it needs the author's explicit consent and is never done automatically.

### Task 17: Screenshot harness

**Files:**
- Create: `review/workspace/spells.ts`, `review/workspace/debug-target.js`, `review/workspace/notes.md`, `review/workspace/README.md`, `review/workspace/.vscode/launch.json`, `review/profile/settings.base.json`, `review/profile/keybindings.json`, `review/helper-extension/package.json`, `review/helper-extension/extension.js`, `review/helper-extension/README.md`, `review/helper-extension/media/sheet.svg`, `review/jobs/smoke.json`, `review/jobs/gate-1.json`, `scripts/review/stage-extension.mjs`, `scripts/review/capture.mjs`, `scripts/review/run-gate.mjs`, `scripts/review/contact-sheet.mjs`
- Modify: `package.json` (script `review:gate`)

**Interfaces:**
- Consumes: `buildProductIcons({ root, outDir, overrides })` (Task 10); the built themes; `icons/product-icon-map.json`.
- Produces: `node scripts/review/run-gate.mjs [--job <file>] [--skip-variants]`, which writes `review-out/<run>/` containing the VSIX files, `captures/<pass>/<scale>/<scene>/<theme>/<variant>/<crop>.png`, `captures/manifest.json` (VS Code version and commit, mode, repo commit, sha256 per capture, warnings) and `sheets/*.html|png`.
- Job file schema: `{ expectVersion, port, mode: 'device-scale' | 'zoom', helperVsix, passes: [{ name, vsix: string[], scales: number[], scenes?: string[] }], scenes: [{ name, setup: Step[], variants?: [{ name, settings }], crops: [{ name, selector, maxHeight? }], teardown?: Step[] }], commitSheets?: string[] }`. A step is `{ press?: 'ctrl+alt+shift+1', insert?: string, waitFor?: jsExpression, optional?: boolean, timeout?: ms, wait?: ms }`. `run-gate.mjs` fills in `codeDir`, `workDir` and `themes`.

**Decision 1:** the terminal scene captures `ll` twice, at the default `terminal.integrated.minimumContrastRatio` (4.5) and at `1`. The package sets neither. Keep both captures as evidence: at `1` the output must match Windows Terminal exactly, and the phase 4 README documents that setting.

- [ ] **Step 1: Spike: launch, connect, check scale, capture once**

```bash
WIN_LOCAL=$(cmd.exe /d /c 'echo %LOCALAPPDATA%' 2>/dev/null | tr -d '\r')
SPIKE="$(wslpath -u "$WIN_LOCAL")/Temp/spellbound-spike"; mkdir -p "$SPIKE"
CODE="$(wslpath -u "$WIN_LOCAL")/Programs/Microsoft VS Code/Code.exe"
cat > "$SPIKE/probe.mjs" <<'PROBE'
const port = 9333;
const close = process.argv.includes('--close');
if (close) {
  const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
  setTimeout(() => process.exit(0), 1000);
} else {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('workbench.html'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const send = (method, params = {}) => new Promise((resolve) => {
    const mine = ++id;
    ws.addEventListener('message', function on(event) { const m = JSON.parse(event.data); if (m.id === mine) { ws.removeEventListener('message', on); resolve(m.result); } });
    ws.send(JSON.stringify({ id: mine, method, params }));
  });
  const { result } = await send('Runtime.evaluate', { expression: 'JSON.stringify({ dpr: devicePixelRatio, w: innerWidth, h: innerHeight, title: document.title })', returnByValue: true });
  console.log(result.value);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  (await import('node:fs')).writeFileSync(new URL('./probe.png', import.meta.url), Buffer.from(shot.data, 'base64'));
  ws.close();
}
PROBE
cd /mnt/c && env -u ELECTRON_RUN_AS_NODE "$CODE" --user-data-dir="$(wslpath -w "$SPIKE")\\ud" --extensions-dir="$(wslpath -w "$SPIKE")\\ext" --remote-debugging-port=9333 --force-device-scale-factor=1.25 --disable-workspace-trust --skip-welcome --skip-release-notes --new-window >/dev/null 2>&1 &
```

Wait until the window is up (about 15 seconds; poll by re-running the probe below, or use Monitor with an until-loop on it), then:

```bash
cd /mnt/c && WSLENV=ELECTRON_RUN_AS_NODE/w ELECTRON_RUN_AS_NODE=1 "$CODE" "$(wslpath -w "$SPIKE/probe.mjs")"
WSLENV=ELECTRON_RUN_AS_NODE/w ELECTRON_RUN_AS_NODE=1 "$CODE" "$(wslpath -w "$SPIKE/probe.mjs")" --close
```

Expected: JSON with `"dpr":1.25` and the window title, and `probe.png` whose pixel width is 1.25 × `w`. Open `probe.png` with the Read tool. The review window then closes; the author's own VS Code is untouched.

Decision point:
- If the probe connects and `dpr` is 1.25, continue with `"mode": "device-scale"`.
- If it connects but `dpr` is 1, continue with `"mode": "zoom"` in both job files.
- If it cannot connect, stop and report to the author with fallbacks (B) and (C) above. Do not edit `.wslconfig`.

Remove the spike folder afterwards: `rm -rf "$SPIKE"`.

- [ ] **Step 2: Write the review workspace and profile**

`review/workspace/spells.ts`:

```ts
// Review fixture: a missing function (quick-fix light bulb on line 11), a type error (status bar error count), foldable blocks.
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
```

`review/workspace/debug-target.js`:

```js
const potions = ['moonwater', 'nightshade'];
let brewed = 0;
for (const potion of potions) {
  brewed += potion.length;
}
console.log(brewed);
```

`review/workspace/notes.md`: `# Grimoire notes` followed by one line of text (a Markdown file makes the chat status show its "completions off" state, the `copilot-unavailable` case).

`review/workspace/README.md`: `# Spellbound review workspace` plus one sentence saying it is a gate fixture.

`review/workspace/.vscode/launch.json` (Windows has no Node, so VS Code's own Electron runs the program):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Brew",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/debug-target.js",
      "runtimeExecutable": "${env:LOCALAPPDATA}\\Programs\\Microsoft VS Code\\Code.exe",
      "env": { "ELECTRON_RUN_AS_NODE": "1" },
      "console": "internalConsole"
    }
  ]
}
```

`review/profile/settings.base.json`:

```json
{
  "workbench.iconTheme": "witchynibbles-icons",
  "workbench.productIconTheme": "witchynibbles-product-icons",
  "workbench.experimental.modernUI": true,
  "workbench.activityBar.compact": false,
  "workbench.secondarySideBar.defaultVisibility": "visible",
  "workbench.editor.highlightModifiedTabs": true,
  "workbench.startupEditor": "none",
  "workbench.tips.enabled": false,
  "editor.showFoldingControls": "always",
  "editor.lightbulb.enabled": "on",
  "security.workspace.trust.enabled": false,
  "window.newWindowDimensions": "maximized",
  "window.restoreWindows": "none",
  "update.mode": "none",
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": false,
  "telemetry.telemetryLevel": "off",
  "git.openRepositoryInParentFolders": "never",
  "terminal.integrated.defaultProfile.windows": "Ubuntu (WSL)",
  "terminal.integrated.fontFamily": "'Maple Mono NF', Consolas, monospace"
}
```

`review/profile/keybindings.json` (unique chords, so steps never depend on menu text):

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
  { "key": "ctrl+alt+shift+y", "command": "workbench.action.quickOpen", "args": "notes.md" }
]
```

- [ ] **Step 3: Write the review helper extension (never shipped)**

`review/helper-extension/package.json`:

```json
{
  "name": "spellbound-review-helper",
  "displayName": "Spellbound review helper",
  "description": "Review-only helper for the Spellbound gate screenshots. Not part of the published extension.",
  "version": "0.0.1",
  "publisher": "witchynibbles-review",
  "engines": { "vscode": "^1.100.0" },
  "main": "./extension.js",
  "activationEvents": ["onStartupFinished"],
  "contributes": {
    "viewsContainers": { "panel": [{ "id": "spellboundReview", "title": "Icon sheet", "icon": "media/sheet.svg" }] },
    "views": { "spellboundReview": [{ "id": "spellboundReview.iconSheet", "name": "Icon sheet" }] },
    "commands": [{ "command": "spellboundReview.notify", "title": "Spellbound Review: Show a long notification" }]
  }
}
```

`review/helper-extension/extension.js`:

```js
// Review helper: shows every mapped drawing at 16px in a tree, creates a Testing provider so the Testing
// container and pass/fail icons appear, and raises a long notification (expand chevron, gear, close).
const vscode = require('vscode');
const rows = require('./ids.json'); // written by run-gate.mjs: [{ id, label, description }]

function activate(context) {
  const items = rows.map(({ id, label, description }) => {
    const item = new vscode.TreeItem(label);
    item.iconPath = new vscode.ThemeIcon(id);
    item.description = description;
    return item;
  });
  context.subscriptions.push(vscode.window.registerTreeDataProvider('spellboundReview.iconSheet', { getTreeItem: (item) => item, getChildren: () => items }));

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

  context.subscriptions.push(controller, vscode.commands.registerCommand('spellboundReview.notify', () =>
    vscode.window.showWarningMessage('The cauldron needs attention: this message is long on purpose, so the toast shows its expand chevron, its configure gear and its close button for the review screenshots.', 'Stir')));
}

module.exports = { activate };
```

`review/helper-extension/README.md`: one paragraph saying what the helper is for and that it is never published. `review/helper-extension/media/sheet.svg`: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="M2 2h12v12H2zM4 4v8h8V4z"/></svg>`.

- [ ] **Step 4: Write `scripts/review/stage-extension.mjs`**

```js
// Packages the extension for review. Usage:
//   node scripts/review/stage-extension.mjs <outDir>                                 -> spellbound-main.vsix
//   node scripts/review/stage-extension.mjs <outDir> --variant=<drawing>=<svg> ...   -> spellbound-variants.vsix
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildProductIcons } from '../lib/product-icons-build.mjs';

const root = path.resolve(import.meta.dirname, '..', '..');
const [outArg, ...rest] = process.argv.slice(2);
const outDir = path.resolve(outArg);
const overrides = Object.fromEntries(rest.filter((arg) => arg.startsWith('--variant=')).map((arg) => {
  const [name, file] = arg.slice('--variant='.length).split('=');
  return [name, path.resolve(root, file)];
}));
const label = Object.keys(overrides).length ? 'variants' : 'main';
const ext = path.join(outDir, `ext-${label}`);
fs.rmSync(ext, { recursive: true, force: true });
for (const item of ['package.json', 'README.md', 'CHANGELOG.md', 'LICENSE.md', '.vscodeignore', 'themes', 'icons', 'assets']) {
  fs.cpSync(path.join(root, item), path.join(ext, item), { recursive: true });
}
if (label === 'variants') await buildProductIcons({ root, outDir: ext, overrides });
const vsix = path.join(outDir, `spellbound-${label}.vsix`);
execFileSync(path.join(root, 'node_modules', '.bin', 'vsce'), ['package', '--no-dependencies',
  '--baseImagesUrl', 'https://raw.githubusercontent.com/WitchyNibbles/Spellbound-Themes/main',
  '--baseContentUrl', 'https://github.com/WitchyNibbles/Spellbound-Themes/blob/main', '-o', vsix], { cwd: ext, stdio: 'inherit' });
console.log(vsix);
```

- [ ] **Step 5: Write `scripts/review/capture.mjs` (runs on Windows)**

```js
// Runs on Windows under VS Code's Electron in Node mode (ELECTRON_RUN_AS_NODE=1): WSL2 in NAT mode cannot
// reach Windows loopback ports. Node built-ins only (fetch, WebSocket), because it runs outside the repo.
// Usage: Code.exe capture.mjs job.json
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const job = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const work = job.workDir;
const log = (message) => console.log(`[capture] ${message}`);
const codeExe = path.join(job.codeDir, 'Code.exe');
const commitDir = fs.readFileSync(path.join(job.codeDir, 'bin', 'code.cmd'), 'utf8').match(/\.\.\\([0-9a-f]+)\\resources\\app\\out\\cli\.js/)[1];
const cliJs = path.join(job.codeDir, commitDir, 'resources', 'app', 'out', 'cli.js');
const vscodeVersion = JSON.parse(fs.readFileSync(path.join(job.codeDir, commitDir, 'resources', 'app', 'package.json'), 'utf8')).version;
const manifest = { vscodeVersion, vscodeCommitDir: commitDir, mode: job.mode, startedAt: new Date().toISOString(), captures: [], warnings: [] };
if (vscodeVersion !== job.expectVersion) manifest.warnings.push(`VS Code ${vscodeVersion}, expected ${job.expectVersion}`);

// The review instance must not inherit Node mode or the parent's VS Code IPC variables.
const cleanEnv = () => Object.fromEntries(Object.entries(process.env).filter(([key]) => key !== 'ELECTRON_RUN_AS_NODE' && !key.startsWith('VSCODE_')));

async function waitFor(check, { timeout = 60000, interval = 250, label }) {
  const started = Date.now();
  for (;;) {
    try { const value = await check(); if (value) return value; } catch { /* not ready yet */ }
    if (Date.now() - started > timeout) throw new Error(`Timed out waiting for ${label}`);
    await delay(interval);
  }
}

function keyInfo(name) {
  if (/^F\d{1,2}$/.test(name)) return { key: name, code: name, vk: 111 + Number(name.slice(1)) };
  if (/^[a-z]$/i.test(name)) return { key: name.toLowerCase(), code: `Key${name.toUpperCase()}`, vk: name.toUpperCase().charCodeAt(0) };
  if (/^\d$/.test(name)) return { key: name, code: `Digit${name}`, vk: 48 + Number(name) };
  const named = { Enter: 13, Escape: 27, Tab: 9, Backspace: 8 };
  if (name in named) return { key: name, code: name, vk: named[name] };
  throw new Error(`Unsupported key ${name}`);
}

class Cdp {
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error(`cannot open ${url}`)); });
    return new Cdp(ws);
  }

  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      if (message.error) waiter.reject(new Error(`${waiter.method}: ${message.error.message}`));
      else waiter.resolve(message.result);
    };
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject, method }));
  }

  async evaluate(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  }

  async press(chord) {
    const parts = chord.split('+');
    const key = keyInfo(parts.pop());
    const modifiers = parts.reduce((mask, part) => mask | { alt: 1, ctrl: 2, meta: 4, shift: 8 }[part.toLowerCase()], 0);
    for (const type of ['rawKeyDown', 'keyUp']) {
      await this.send('Input.dispatchKeyEvent', { type, modifiers, key: key.key, code: key.code, windowsVirtualKeyCode: key.vk, nativeVirtualKeyCode: key.vk });
    }
  }

  insert(text) { return this.send('Input.insertText', { text }); }

  async screenshot(file, clip) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
  }

  close() { this.ws.close(); }
}

function install(userDataDir, extensionsDir, files) {
  for (const vsix of files) {
    execFileSync(codeExe, [cliJs, `--user-data-dir=${userDataDir}`, `--extensions-dir=${extensionsDir}`, '--install-extension', vsix, '--force'],
      { env: { ...cleanEnv(), ELECTRON_RUN_AS_NODE: '1' }, stdio: 'inherit' });
  }
}

function writeUserFile(userDataDir, name, content) {
  fs.mkdirSync(path.join(userDataDir, 'User'), { recursive: true });
  fs.writeFileSync(path.join(userDataDir, 'User', name), content);
}

async function launch({ userDataDir, extensionsDir, scale }) {
  const args = [`--user-data-dir=${userDataDir}`, `--extensions-dir=${extensionsDir}`, `--remote-debugging-port=${job.port}`,
    '--disable-workspace-trust', '--skip-welcome', '--skip-release-notes', '--disable-telemetry', '--new-window'];
  if (job.mode === 'device-scale') args.push(`--force-device-scale-factor=${scale}`);
  args.push(path.join(work, 'workspace'));
  const child = spawn(codeExe, args, { env: cleanEnv(), stdio: 'ignore' });
  const target = await waitFor(async () => {
    const targets = await (await fetch(`http://127.0.0.1:${job.port}/json/list`)).json();
    return targets.find((t) => t.type === 'page' && t.url.includes('workbench.html'));
  }, { timeout: 90000, label: 'the VS Code workbench target' });
  const cdp = await Cdp.connect(target.webSocketDebuggerUrl);
  await waitFor(() => cdp.evaluate(`!!document.querySelector('.monaco-workbench .part.statusbar')`), { timeout: 90000, label: 'the workbench' });
  return { child, cdp };
}

async function shutdown({ child, cdp }) {
  try {
    const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${job.port}/json/version`)).json();
    const browser = await Cdp.connect(webSocketDebuggerUrl);
    await browser.send('Browser.close').catch(() => {});
  } catch { /* fall back to the PID kill */ }
  cdp.close();
  await delay(2000);
  // By PID only. Never by image name: that would close the author's own VS Code.
  try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* already gone */ }
}

async function runStep(cdp, step, where) {
  try {
    if (step.press) await cdp.press(step.press);
    if (step.insert) await cdp.insert(step.insert);
    if (step.waitFor) await waitFor(() => cdp.evaluate(step.waitFor), { timeout: step.timeout ?? 30000, label: step.waitFor });
  } catch (error) {
    if (!step.optional) throw error;
    manifest.warnings.push(`${where}: optional step failed: ${error.message}`);
  }
  await delay(step.wait ?? 300);
}

const themeApplied = (signature) => `(() => { const s = getComputedStyle(document.querySelector('.monaco-workbench'));
  return ${JSON.stringify(signature)}.every(([name, value]) => s.getPropertyValue(name).trim().toLowerCase() === value); })()`;

const rectOf = (cdp, { selector, maxHeight }) => cdp.evaluate(`(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  return { x: r.x, y: r.y, width: r.width, height: ${maxHeight ? `Math.min(r.height, ${maxHeight})` : 'r.height'} };
})()`);

const baseSettings = JSON.parse(fs.readFileSync(path.join(work, 'profile', 'settings.base.json'), 'utf8'));
const keybindings = fs.readFileSync(path.join(work, 'profile', 'keybindings.json'), 'utf8');
const capturesDir = path.join(work, 'captures');

for (const pass of job.passes) {
  const extensionsDir = path.join(work, 'ext', pass.name);
  for (const scale of pass.scales) {
    const userDataDir = path.join(work, 'ud', `${pass.name}-${scale}`);
    fs.rmSync(userDataDir, { recursive: true, force: true });
    if (!fs.existsSync(extensionsDir)) install(userDataDir, extensionsDir, [...pass.vsix, job.helperVsix].map((file) => path.join(work, file)));
    const zoom = job.mode === 'zoom' ? { 'window.zoomLevel': Math.log(scale) / Math.log(1.2) } : {};
    const settingsFor = (theme, extra = {}) => JSON.stringify({ ...baseSettings, ...zoom, 'workbench.colorTheme': theme.label, ...extra }, null, 2);
    writeUserFile(userDataDir, 'settings.json', settingsFor(job.themes[0]));
    writeUserFile(userDataDir, 'keybindings.json', keybindings);
    log(`${pass.name} @ ${scale * 100}%: launching`);
    const session = await launch({ userDataDir, extensionsDir, scale });
    const { cdp } = session;
    try {
      const dpr = await cdp.evaluate('window.devicePixelRatio');
      if (Math.abs(dpr - scale) > 0.01) throw new Error(`devicePixelRatio is ${dpr}, expected ${scale}; set "mode": "zoom" in the job file`);
      await waitFor(() => cdp.evaluate(`(() => { const el = document.querySelector('.codicon-explorer-view-icon'); return !!el && getComputedStyle(el, '::before').fontFamily.includes('WitchyNibbles'); })()`),
        { timeout: 60000, label: 'the WitchyNibbles product icons' });
      for (const scene of job.scenes.filter((s) => !pass.scenes || pass.scenes.includes(s.name))) {
        const where = `${pass.name}/${scale}/${scene.name}`;
        log(`  ${scene.name}`);
        for (const step of scene.setup ?? []) await runStep(cdp, step, where);
        for (const theme of job.themes) {
          for (const variant of scene.variants ?? [{ name: 'default', settings: {} }]) {
            writeUserFile(userDataDir, 'settings.json', settingsFor(theme, variant.settings));
            await waitFor(() => cdp.evaluate(themeApplied(theme.signature)), { timeout: 20000, label: `theme ${theme.label}` });
            await delay(1500);
            const stem = path.join(capturesDir, pass.name, String(scale), scene.name, theme.slug, variant.name);
            const record = (crop, file) => manifest.captures.push({ pass: pass.name, scale, scene: scene.name, theme: theme.slug, variant: variant.name, crop, file: path.relative(capturesDir, file).split(path.sep).join('/') });
            await cdp.screenshot(path.join(stem, 'full.png'));
            record('full', path.join(stem, 'full.png'));
            for (const crop of scene.crops ?? []) {
              const clip = await rectOf(cdp, crop);
              if (!clip) { manifest.warnings.push(`${where}/${theme.slug}: no element for ${crop.selector}`); continue; }
              await cdp.screenshot(path.join(stem, `${crop.name}.png`), clip);
              record(crop.name, path.join(stem, `${crop.name}.png`));
            }
          }
        }
        for (const step of scene.teardown ?? []) await runStep(cdp, step, where);
      }
    } finally {
      await shutdown(session);
    }
  }
}

manifest.finishedAt = new Date().toISOString();
fs.mkdirSync(capturesDir, { recursive: true });
fs.writeFileSync(path.join(capturesDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
log(`done: ${manifest.captures.length} captures, ${manifest.warnings.length} warnings`);
```

- [ ] **Step 6: Write `scripts/review/run-gate.mjs` and `scripts/review/contact-sheet.mjs`**

`scripts/review/run-gate.mjs`:

```js
// Builds, packages, captures on Windows VS Code, and assembles contact sheets.
// Usage: node scripts/review/run-gate.mjs [--job review/jobs/gate-1.json] [--skip-variants]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..', '..');
const args = process.argv.slice(2);
const jobFile = args.includes('--job') ? args[args.indexOf('--job') + 1] : 'review/jobs/gate-1.json';
const run = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const out = path.join(root, 'review-out', run);
const sh = (command, commandArgs, options = {}) => execFileSync(command, commandArgs, { encoding: 'utf8', ...options }).trim();
const winEnv = (name) => sh('cmd.exe', ['/d', '/c', `echo %${name}%`], { cwd: '/mnt/c' }).replace(/\r/g, '');
const toWsl = (p) => sh('wslpath', ['-u', p]);
const toWin = (p) => sh('wslpath', ['-w', p]);

const localAppData = winEnv('LOCALAPPDATA');
const codeDirWin = process.env.SPELLBOUND_CODE_DIR ?? `${localAppData}\\Programs\\Microsoft VS Code`;
const codeExe = path.join(toWsl(codeDirWin), 'Code.exe');
const work = path.join(toWsl(localAppData), 'Temp', 'spellbound-review', run);
const vsce = path.join(root, 'node_modules', '.bin', 'vsce');
const job = JSON.parse(fs.readFileSync(path.join(root, jobFile), 'utf8'));

// 1. Build and package the extension, plus a variant build for the gate questions.
execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
fs.mkdirSync(out, { recursive: true });
execFileSync('node', ['scripts/review/stage-extension.mjs', out], { cwd: root, stdio: 'inherit' });
const variantDir = path.join(root, 'icons', 'product-src-variants');
const variantArgs = fs.existsSync(variantDir)
  ? fs.readdirSync(variantDir).filter((file) => file.endsWith('.svg')).map((file) => `--variant=${file.split('.')[0]}=icons/product-src-variants/${file}`)
  : [];
if (!args.includes('--skip-variants') && variantArgs.length) execFileSync('node', ['scripts/review/stage-extension.mjs', out, ...variantArgs], { cwd: root, stdio: 'inherit' });
else job.passes = job.passes.filter((pass) => pass.name !== 'variants');

// 2. Package the review helper with one row per drawing.
const map = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'product-icon-map.json'), 'utf8'));
const helper = path.join(out, 'helper');
fs.cpSync(path.join(root, 'review', 'helper-extension'), helper, { recursive: true });
fs.writeFileSync(path.join(helper, 'ids.json'), JSON.stringify(Object.entries(map.drawings).map(([name, { ids }]) => ({ id: ids[0], label: name, description: ids.join(', ') }))));
execFileSync(vsce, ['package', '--no-dependencies', '--skip-license', '--allow-missing-repository', '-o', path.join(out, job.helperVsix)], { cwd: helper, stdio: 'inherit' });

// 3. Copy to the Windows side; Windows Node cannot read \\wsl.localhost paths.
fs.mkdirSync(work, { recursive: true });
for (const file of fs.readdirSync(out).filter((name) => name.endsWith('.vsix'))) fs.copyFileSync(path.join(out, file), path.join(work, file));
fs.copyFileSync(path.join(root, 'scripts', 'review', 'capture.mjs'), path.join(work, 'capture.mjs'));
fs.cpSync(path.join(root, 'review', 'profile'), path.join(work, 'profile'), { recursive: true });
const workspace = path.join(work, 'workspace');
fs.cpSync(path.join(root, 'review', 'workspace'), workspace, { recursive: true });
const git = (...gitArgs) => execFileSync('git', ['-c', 'user.name=review', '-c', 'user.email=review@localhost', ...gitArgs], { cwd: workspace, stdio: 'ignore' });
git('init', '-q', '-b', 'moonlit-review');
git('add', '-A');
git('commit', '-q', '-m', 'review fixture');
fs.appendFileSync(path.join(workspace, 'spells.ts'), '\n// stirred during review\n'); // modified -> amber
fs.writeFileSync(path.join(workspace, 'new-spell.ts'), 'export const fresh = true;\n'); // untracked -> mint

// 4. Fill machine paths and theme signatures, then capture under VS Code's Electron in Node mode.
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
job.codeDir = codeDirWin;
job.workDir = toWin(work);
job.themes = packageJson.contributes.themes.map(({ label, path: themePath }) => {
  const colors = JSON.parse(fs.readFileSync(path.join(root, themePath), 'utf8')).colors;
  return {
    label,
    slug: label.replace(/^WitchyNibbles /, '').toLowerCase().replace(/\s+/g, '-'),
    signature: [['--vscode-editor-background', colors['editor.background'].toLowerCase()], ['--vscode-activityBar-activeBorder', colors['activityBar.activeBorder'].toLowerCase()]],
  };
});
fs.writeFileSync(path.join(work, 'job.json'), JSON.stringify(job, null, 2));
const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1', WSLENV: [process.env.WSLENV, 'ELECTRON_RUN_AS_NODE/w'].filter(Boolean).join(':') };
const result = spawnSync(codeExe, [toWin(path.join(work, 'capture.mjs')), toWin(path.join(work, 'job.json'))], { cwd: '/mnt/c', env, stdio: 'inherit', timeout: 2 * 60 * 60 * 1000 });
if (result.status !== 0) throw new Error(`capture failed (exit ${result.status}); partial output in ${work}`);

// 5. Bring captures back, record provenance, build sheets.
fs.cpSync(path.join(work, 'captures'), path.join(out, 'captures'), { recursive: true });
const manifestPath = path.join(out, 'captures', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.run = run;
manifest.repoCommit = sh('git', ['rev-parse', 'HEAD'], { cwd: root });
manifest.repoDirty = sh('git', ['status', '--porcelain'], { cwd: root }) !== '';
for (const capture of manifest.captures) capture.sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(out, 'captures', capture.file))).digest('hex');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
execFileSync('node', ['scripts/review/contact-sheet.mjs', out], { cwd: root, stdio: 'inherit' });
console.log(`Gate run complete: ${out} (${manifest.captures.length} captures, ${manifest.warnings.length} warnings)`);
```

`scripts/review/contact-sheet.mjs`:

```js
// One HTML page per (pass, scene, crop): rows = theme and variant, columns = scale, images at 1:1 device pixels.
// Usage: node scripts/review/contact-sheet.mjs <run-dir>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const runDir = path.resolve(process.argv[2]);
const manifest = JSON.parse(fs.readFileSync(path.join(runDir, 'captures', 'manifest.json'), 'utf8'));
const sheets = path.join(runDir, 'sheets');
fs.mkdirSync(sheets, { recursive: true });
const browser = (...args) => execFileSync('agent-browser', args, { stdio: 'inherit' });
const groups = Object.groupBy(manifest.captures.filter((capture) => capture.crop !== 'full'), (capture) => `${capture.pass}-${capture.scene}-${capture.crop}`);

browser('set', 'viewport', '2400', '1600', '1');
for (const [key, captures] of Object.entries(groups)) {
  const scales = [...new Set(captures.map((capture) => capture.scale))].sort((a, b) => a - b);
  const rowKey = (capture) => `${capture.theme} · ${capture.variant}`;
  const rows = [...new Set(captures.map(rowKey))];
  const cell = (row, scale) => {
    const capture = captures.find((candidate) => rowKey(candidate) === row && candidate.scale === scale);
    return capture ? `<td><img src="../captures/${capture.file}"></td>` : '<td>–</td>';
  };
  const html = `<!doctype html><meta charset="utf-8"><title>${key}</title>
<style>body{margin:12px;font:13px system-ui;background:#808080;color:#111}th,td{padding:6px;vertical-align:top;text-align:left}img{image-rendering:pixelated;display:block}</style>
<h1>${key}</h1><p>VS Code ${manifest.vscodeVersion} · ${manifest.mode} · run ${manifest.run} · repo ${String(manifest.repoCommit).slice(0, 8)}${manifest.repoDirty ? ' (dirty)' : ''} · one image pixel per screen pixel</p>
<table><tr><th></th>${scales.map((scale) => `<th>${scale * 100}%</th>`).join('')}</tr>
${rows.map((row) => `<tr><th>${row}</th>${scales.map((scale) => cell(row, scale)).join('')}</tr>`).join('\n')}</table>`;
  const file = path.join(sheets, `${key}.html`);
  fs.writeFileSync(file, html);
  browser('open', `file://${file}`);
  browser('screenshot', '--full', path.join(sheets, `${key}.png`));
}
console.log(`${Object.keys(groups).length} contact sheets in ${sheets}`);
```

Add `"review:gate": "node scripts/review/run-gate.mjs"` to `package.json` `scripts`.

- [ ] **Step 7: Write the job files**

`review/jobs/gate-1.json`:

```json
{
  "expectVersion": "1.141.0",
  "port": 9333,
  "mode": "device-scale",
  "helperVsix": "spellbound-review-helper.vsix",
  "passes": [
    { "name": "main", "vsix": ["spellbound-main.vsix"], "scales": [1, 1.25, 1.5, 2] },
    { "name": "variants", "vsix": ["spellbound-variants.vsix"], "scales": [1, 2], "scenes": ["workbench", "debug"] }
  ],
  "scenes": [
    {
      "name": "workbench",
      "setup": [
        { "press": "ctrl+alt+shift+4", "wait": 800 },
        { "press": "ctrl+alt+shift+w", "wait": 2000 },
        { "press": "ctrl+alt+shift+y", "wait": 800 }, { "press": "Enter", "wait": 1500 }, { "insert": "✦ " },
        { "press": "ctrl+alt+shift+1", "wait": 800 }, { "press": "Enter", "wait": 5000 },
        { "waitFor": "!!document.querySelector('.codicon-light-bulb, .codicon-gutter-lightbulb')", "timeout": 20000, "optional": true }
      ],
      "variants": [
        { "name": "default", "settings": {} },
        { "name": "compact", "settings": { "workbench.activityBar.compact": true } }
      ],
      "crops": [
        { "name": "activitybar", "selector": ".part.activitybar" },
        { "name": "tabs", "selector": ".part.editor .tabs-and-actions-container" },
        { "name": "breadcrumbs", "selector": ".part.editor .breadcrumbs-control" },
        { "name": "gutter", "selector": ".part.editor .monaco-editor .margin", "maxHeight": 320 },
        { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 420 },
        { "name": "statusbar", "selector": ".part.statusbar" },
        { "name": "chat", "selector": ".part.auxiliarybar" },
        { "name": "titlebar", "selector": ".part.titlebar" }
      ]
    },
    {
      "name": "debug",
      "setup": [
        { "press": "ctrl+alt+shift+u", "wait": 800 }, { "press": "Enter", "wait": 1200 }, { "press": "ctrl+alt+shift+2" },
        { "press": "ctrl+alt+shift+q", "wait": 800 }, { "press": "Enter", "wait": 1200 }, { "press": "ctrl+alt+shift+2" },
        { "press": "ctrl+alt+shift+5", "wait": 800 },
        { "press": "ctrl+alt+shift+3" },
        { "waitFor": "!!document.querySelector('.codicon-debug-stackframe, .codicon-debug-stackframe-focused')", "timeout": 40000 }
      ],
      "crops": [
        { "name": "gutter", "selector": ".part.editor .monaco-editor .margin", "maxHeight": 260 },
        { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 420 },
        { "name": "activitybar", "selector": ".part.activitybar" },
        { "name": "debug-toolbar", "selector": ".debug-toolbar" },
        { "name": "statusbar", "selector": ".part.statusbar" }
      ],
      "teardown": [{ "press": "ctrl+alt+shift+t", "wait": 1500 }]
    },
    {
      "name": "testing",
      "setup": [{ "press": "ctrl+alt+shift+6", "wait": 1500 }, { "press": "ctrl+alt+shift+r", "wait": 2500 }],
      "crops": [{ "name": "activitybar", "selector": ".part.activitybar" }, { "name": "sidebar", "selector": ".part.sidebar", "maxHeight": 300 }]
    },
    {
      "name": "icon-sheet",
      "setup": [{ "press": "ctrl+alt+shift+7", "wait": 1500 }],
      "crops": [{ "name": "panel", "selector": ".part.panel" }],
      "teardown": [{ "press": "ctrl+alt+shift+e" }]
    },
    {
      "name": "notifications",
      "setup": [{ "press": "ctrl+alt+shift+0", "wait": 1500 }],
      "crops": [{ "name": "toasts", "selector": ".notifications-toasts" }, { "name": "statusbar", "selector": ".part.statusbar" }],
      "teardown": [{ "press": "Escape" }]
    },
    {
      "name": "terminal",
      "setup": [{ "press": "ctrl+alt+shift+8", "wait": 7000 }, { "press": "ctrl+alt+shift+9", "wait": 3000 }],
      "variants": [
        { "name": "contrast-4.5", "settings": {} },
        { "name": "contrast-1", "settings": { "terminal.integrated.minimumContrastRatio": 1 } }
      ],
      "crops": [{ "name": "panel", "selector": ".part.panel" }],
      "teardown": [{ "press": "ctrl+alt+shift+e" }]
    }
  ],
  "commitSheets": [
    "main-workbench-activitybar", "main-workbench-tabs", "main-workbench-breadcrumbs", "main-workbench-gutter",
    "main-workbench-statusbar", "main-workbench-chat", "main-workbench-sidebar", "main-debug-gutter",
    "main-debug-sidebar", "main-icon-sheet-panel", "main-notifications-toasts", "main-terminal-panel",
    "variants-workbench-activitybar", "variants-debug-gutter"
  ]
}
```

`review/jobs/smoke.json`: the same file with `"passes": [{ "name": "main", "vsix": ["spellbound-main.vsix"], "scales": [1.25] }]` and only the `workbench` scene.

- [ ] **Step 8: Smoke run**

Run: `node scripts/review/run-gate.mjs --job review/jobs/smoke.json --skip-variants`
Expected: one review window opens, cycles through the four themes in both activity-bar sizes, and closes. The run prints `Gate run complete: review-out/<run> (72 captures, N warnings)`: 4 themes × 2 variants × (1 full + 8 crops). `review-out/<run>/sheets/` holds 8 PNGs. Open `main-workbench-activitybar.png` and `main-workbench-tabs.png` with the Read tool: the activity bar must show the batch-1 glyphs (grimoire, scrying glass, sprig, spider, rune tiles, hat, gear), not Codicons, and the inactive dirty tab must show ✦. Every warning in the manifest must be understood. A missing selector means the 1.141 DOM differs: inspect it with `cdp.evaluate` in a scratch probe and fix the selector in both job files.

- [ ] **Step 9: Commit**

```bash
git add review scripts/review package.json
git commit -m "Add the real-VS-Code screenshot procedure for review gates"
```

---

### Task 18: Run the gate and hand it to the author

**Files:**
- Create: `docs/qa/2.0-gate-1/README.md`, `docs/qa/2.0-gate-1/manifest.json`, `docs/qa/2.0-gate-1/*.png` (the `commitSheets` list)

**Interfaces:**
- Consumes: everything above.
- Produces: the review-gate package. Phase 1 ends here; nothing in phase 2 starts before the author approves.

**Choices the author makes at this gate:** 4 (iv) (crater or plain disc: `main-debug-gutter` vs `variants-debug-gutter`) and 12 (crescent or plain dot, per icon, for the search lens and the gear hub: `variants-workbench-activitybar`). **Evidence for decisions already taken:** 1 (`main-terminal-panel` at contrast 4.5 and 1, beside `windows-terminal-ll.png`), 2 (the Moonlit row shows the `#0D0916` terminal background), 3 (`main-debug-gutter` shows the gold current-stackframe arrow beside the gold moon in Candle), 6 (spider on the debug views: `main-debug-sidebar`).

- [ ] **Step 1: Verify the preconditions**

Run: `npm test && npm run validate && git status --short`
Expected: tests pass, staged validation passes, and the tree is clean (the manifest records `repoDirty`).

- [ ] **Step 2: Run the full gate**

Run: `npm run review:gate`
Expected: 768 captures. Main pass: 4 scales × (72 workbench + 24 debug + 12 testing + 8 icon-sheet + 12 notifications + 16 terminal) = 576. Variants pass: 2 scales × (72 + 24) = 192. The manifest lists warnings only for optional steps (for example, no light bulb because the TypeScript server was slow); re-run if a non-optional step failed.

- [ ] **Step 3: Best-effort Windows Terminal reference capture**

For the terminal comparison, open Windows Terminal with the Moonlit Candle scheme in the same workspace and run `ll`:

```bash
WS=$(ls -d /mnt/c/Users/*/AppData/Local/Temp/spellbound-review/*/workspace | tail -1)
wt.exe -w new wsl.exe --cd "$WS" -e fish -i -c "ll; sleep 30" &
sleep 6
powershell.exe -NoProfile -Command '
Add-Type -AssemblyName System.Drawing
Add-Type "using System; using System.Runtime.InteropServices; public class W { [DllImport(\"user32.dll\")] public static extern IntPtr GetForegroundWindow(); [DllImport(\"user32.dll\")] public static extern bool GetWindowRect(IntPtr h, out R r); public struct R { public int L, T, Ri, B; } }"
$r = New-Object W+R; [W]::GetWindowRect([W]::GetForegroundWindow(), [ref]$r) | Out-Null
$b = New-Object Drawing.Bitmap ($r.Ri - $r.L), ($r.B - $r.T); [Drawing.Graphics]::FromImage($b).CopyFromScreen($r.L, $r.T, 0, 0, $b.Size)
$b.Save("$env:TEMP\spellbound-wt-ll.png")'
cp "$(wslpath -u "$(cmd.exe /d /c 'echo %TEMP%' | tr -d '\r')")/spellbound-wt-ll.png" docs/qa/2.0-gate-1/windows-terminal-ll.png
```

If the window capture misses (focus raced), take the screenshot by hand with Win+Shift+S and save it under the same name. Windows Terminal's moon background image cannot be reproduced in VS Code (a known difference the README lists, decision 1), so compare text colours only.

- [ ] **Step 4: Review the sheets yourself before the author does**

Open every PNG in the `commitSheets` list with the Read tool. For each, record in the README any glyph that blurs at 125%/150% beyond what the snapped strokes allow, any accent that vanishes at 12px (chat toolbar) or 16px (compact activity bar), and whether ✦ and ✕ match in the tab. Do not redraw anything now. The author decides at the gate.

- [ ] **Step 5: Write `docs/qa/2.0-gate-1/README.md`**

Copy the chosen sheets and the manifest:

```bash
RUN=$(ls -d review-out/*/ | tail -1)
mkdir -p docs/qa/2.0-gate-1
for name in $(node -e "console.log(require('./review/jobs/gate-1.json').commitSheets.join(' '))"); do cp "$RUN/sheets/$name.png" docs/qa/2.0-gate-1/; done
cp "$RUN/captures/manifest.json" docs/qa/2.0-gate-1/manifest.json
```

Write the README with these sections, filled from the run:

```markdown
# Spellbound 2.0, review gate 1 (product icons batch 1)

- Run: <run id> · VS Code <version> (<commit dir>) · mode <device-scale|zoom> · repo <commit>
- Reproduce: `npm run review:gate` (Windows VS Code 1.141 driven over CDP from VS Code's own Electron; see docs/superpowers/plans/2026-10-10-spellbound-2-phase-1.md, Part D)
- Raw captures (not committed): review-out/<run>/captures (manifest with sha256 here)

## What to judge
The 21 designs (23 drawings): grimoire, scrying glass, herb sprig, spider, flask, rune tiles, moon gate, witch hat, gear, cat head, owl, terminal, chevron (down/right/up), close, ⋆, ✦, candle, skull, bell, small sprig, moon breakpoint. Each sheet: rows = theme · variant, columns = 100/125/150/200%.

## Decisions for the author at this gate
- 4(iv) Moon crater or plain disc at 16px: compare main-debug-gutter with variants-debug-gutter.
- 12 Search lens and gear hub, per icon: crescent (main) or plain dot (variants-workbench-activitybar).
- `circle-filled` consumers that now show ✦ (see the inventory audit): keep, or give any its own key?

## Evidence for decisions already taken (spec section 11)
- 1 Terminal: main-terminal-panel at minimumContrastRatio 4.5 vs 1, and windows-terminal-ll.png; at 1 the colours must match.
- 2 Moonlit terminal: full scheme, background #0D0916.
- 3 Stackframe colours: the gold current-stackframe arrow next to the gold moon in main-debug-gutter (Candle).
- 6 Spider on all five debug views: main-debug-sidebar.

## Choices made in phase 1 that the author may overrule
- Candle `button.hoverBackground` #FFE3A3, `statusBarItem.prominentForeground` #0D0916, parameters #F6B5DD (unspecified in section 3.1).
- Skull drawn on the ~12-unit Codicon `error` footprint, not the 8-unit signal keyline.
- Rune tiles are plain: a rune mark does not fit the cut-out rules in a 5×5 tile.
- Stackframe colours outside Candle (decision 3): Moonlit #FF67B7 / #B99AFF, Daydream #B52776 / #7042B2, Coven Contrast #FF67B7 / #D0B8FF (main accent for the current frame, lavender for other frames).
- Moonlit's input border stays #38234D: decision 14 names no Moonlit value, so the 3:1 border check covers only Candle, Daydream and Coven Contrast.
- <glyph-level notes from Step 4>

## Known phase-1 staging artifacts (not defects)
- Every pinned ID outside batch 1 shows its stock Codicon (validation is staged by batch).
- `terminal-decoration-success` inherits the ✦ until the status batch maps its own dot.
- Layout toggles show Codicons until the phase 2 `editor` batch draws them (decision 7).

## Approval
Author: approve batch 1 as is / approve with changes listed below / redraw. Phase 2 starts only after approval.
```

- [ ] **Step 6: Commit and stop**

```bash
git add docs/qa/2.0-gate-1
git commit -m "Record review gate 1 evidence for product icon batch 1"
```

Stop here. Report the gate README path to the author and wait for the decision. Do not start phase 2.

---

## Later phases (each gets its own plan after the gate)

**Phase 2: remaining product glyph groups.** Draw the `chrome` (17 IDs), `panel` (9), `status` (15), `debug` (23), `editor` (33) and `symbols` (15) batches in a new `scripts/glyphs/batch-2.mjs` (added to `glyphModules`), with codepoints from `E117` upward and the same toolkit and drift tests. Each group adds its `product-batch:<group>` stage to `scripts/validation-stage.json` when its drawings land, and goes through its own screenshot gate with `review/jobs/` variants of `gate-1.json`. The debug group's gate includes the stopped-on-breakpoint scene that already exists. The keys from decisions 4, 5 and 7 are already pinned (Task 3). In the `debug` batch, `debug-hint` claims the moon-breakpoint drawing (as chosen at gate 1), `debug-breakpoint-unverified` is a dashed ring, and `-conditional-disabled`, `-log-disabled` and `-conditional-unverified` reuse the `=` moon, the diamond and the dashed ring (spec section 5.2). In the `status` batch, `copilot-unavailable`, `-snooze`, `-dot` and `-warning` are cat-head variants (slash, closed eyes, star, and a warning drawing the status gate decides). In the `editor` batch, `panel-right`/`-off`, `auxiliarybar-left-layout-icon`/`-off-layout-icon` and `panel-bottom` are mirrored pane drawings of the frame toggles. Decisions 3 and 6 need no phase 2 work. Section 5.2's special rules apply here: `debug-stackframe-dot` at 6-10 inside a clear stackframe area, spin-balanced `loading`/`sync`, bell-dot's ✦ in the space the bell left free, triangle fill rules for `debug-start` vs `run`, and split glyphs following each Codicon orientation. `npm run validate -- --release` stops listing product batches when this phase is done.

**Phase 3: file icons.** The file icon theme is redrawn per section 6: about 30 types, 16 folder badges with open and closed variants (`source`, `test` and `__tests__` as aliases of `src` and `tests`), the special file names (including the lockfile `fileNames` `package-lock.json`, `yarn.lock`, `Cargo.lock`, `poetry.lock` with the padlock), `pyw` with `py`, the kept `languageIds` block, no `vite.config.ts`, and `showLanguageModeIcons: false`. Each drawing has one source SVG with colour-role placeholders, and a build step resolves it into the dark, `light` and `highContrast` sets (decision 8). Colours follow the section 6 category table, with the seventh category assets (images and fonts) in cyan `#77D9FF` on dark, muted folder bodies and badges in their contents' category (decision 9), and `light` docs `#3B2A47`, `highContrast` tests `#74E8B8` and config `#A99AB9` (decision 10). The `.env` vial's skull reads as "danger / secret" (decision 13). The `file-icons` stage (Task 5) already encodes the required keys, including those from decisions 9 and 11, and checks 3:1 on the resolved colours; the phase adds it to `enforce`. Before the full set, a file-icon gate with the same harness reviews a sample (one folder badge, one multi-colour special file, two or three common types) at 100% and 200% plus a grayscale pass, and the author approves before the rest is drawn.

**Phase 4: release 2.0.0.** Set the version to `2.0.0` and `galleryBanner.color` to `#0D0916` (the `release` stage checks both). Rewrite the `package.json` description and keywords around Moonlit Candle (drop "pastel"). Rewrite the README with Maple Mono NF, the `workbench.editor.highlightModifiedTabs: true` recommendation, the terminal note (the palette equals witchyterm; `ll` matches exactly with `terminal.integrated.minimumContrastRatio: 1`, which the README documents and the package does not set; Windows Terminal's moon background image is a known difference), and a statement that the icons are original and unaffiliated. Write the CHANGELOG 2.0.0 entry with "Upgrading from 1.x" (per-theme changes, new terminal colours, dropped icon keys, reinstalling 1.2.1 through "Install Another Version"). Produce the Marketplace images with the gate harness: one workbench per theme, the product icon sheet at 16px in a real workbench, and VS Code's terminal beside Windows Terminal. Propose the section 7 glossary additions to witchyterm (including "danger / secret" on the skull row, decision 13) without changing witchyterm. `npm run package` then succeeds only because `validate --release` passes.

---

## Self-review notes (run against the spec while writing)

- **Coverage.** §3.1 is covered by Tasks 7 and 9 (the Modern UI keys stay at their defaults, as the spec says; nothing to implement). §3.2 by Tasks 8 and 9. §3.3 by Task 8 (the Maple Mono README line is phase 4). §4 by Task 4 (rules), Task 10 (font build), Task 11 (primitives) and Tasks 12-15 (drawings). §5.1 by Tasks 3, 10 and 11. §5.2 for batch 1 by Tasks 12-15 (the rest is phase 2). §5.3 by Tasks 17-18. §6 checks by Task 5 (drawing is phase 3). §7 is phase 4. §8 by Tasks 1-5, plus the inventory edits (Task 3) and the `circle-filled` audit (Task 12). §9 is phase 4.
- **Section 8 removals.** The green blanket ban (Task 2), ANSI contrast for pinned themes (Task 2), theme count 3 (Task 2), the 48-ID literal and `entries.length !== 48` (Tasks 4 and 10), index-derived codepoints, the unique-fontCharacter check and one-SVG-per-ID (Task 4) are all removed.
- **Names used across tasks.** `createReport`/`report.fail(stage, message)`, `checkThemeFile({ relative, theme, scheme })`, `schemeToVSCodeColors`, `PINNED_TERMINAL`, `validateMap`, `iconDefinitionsFor`, `claimDrawing`, `dropLegacy`, `buildFont`, `FONT_STREAM_OPTIONS`, `buildProductIcons({ root, outDir, overrides })`, `glyphRuleProblems`, `glyphModules`, `drawings`/`variants`. Each is defined once (in the task named in its Interfaces block) and used with the same signature afterwards.
- **Checked while writing.** On this machine: winding detection on good, bad, island, crossing and arc cases; exact font placement without centring (corner glyph at 640-896 / 128-384); fontkit `path.bbox` within 1 font unit of `svg-pathdata` bounds for arcs; all 23 first-pass drawings and 3 variants pass the winding check and build into a font with zero geometry mismatches; VS Code's Electron runs Node 24 on Windows with `WebSocket` and `fetch`; WSL cannot reach Windows loopback; the setting keys used in the review profile all exist in the 1.141 bundle; and the 1.141 semantic scorer gives `function` and `*.declaration` the same score.
- **Not checked while writing (and therefore the Task 17 spike).** CDP against a running `Code.exe`, the `--force-device-scale-factor` behaviour, and the 1.141 DOM selectors used for crops.

## Execution

Recommended: **subagent-driven** (superpowers:subagent-driven-development). The 18 tasks hand exact interfaces to one another (`report.fail` stages, the map format, `buildProductIcons`, the drawing names), and a mistake shipped in an early task, such as a wrong winding rule or a mis-staged check, silently weakens every later one. A fresh reviewer per task catches that cheaply. Tasks 12-15 are artwork with a visual check and benefit most from an independent look at the contact sheet.
