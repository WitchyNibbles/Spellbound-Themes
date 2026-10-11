# Spellbound Themes 2.0.0 Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the repo from the committed review gate 6 (every file icon drawn, `file-icons` enforced, decisions in spec 11.7) to a reproducible, verified `witchynibbles-theme-collection-2.0.0.vsix` and a local release commit on `spellbound-2.0`: version 2.0.0, banner `#0D0916`, description and keywords around Moonlit Candle, six Marketplace images captured in real VS Code 1.141 and Windows Terminal, the README and CHANGELOG of spec 9, GitHub release notes, and the exact publish commands for the author. First fix the latent `outlineGap` stack overflow, test first. Pushing, tagging, publishing and merging stay the author's.

**Architecture:** No theme, palette, glyph or drawing changes. The release adds metadata (`package.json`, `package-lock.json`), turns on the `release` stage, ships only runtime files in the VSIX, and reuses the gate harness for the images: a generated job (`scripts/review/release-job.mjs` writes `review/jobs/release.json`) opens a small showcase fixture (`review/workspace-release/`) in VS Code's default 1024×768 window at 100% and captures one workbench per color theme, the review helper's product icon sheet (three pages), and witchyterm's `ll` in the integrated terminal. Two small harness additions make that possible: a job-level `settings` block written before the launch, and `run-gate.mjs --vsix <file>`, which installs the packaged VSIX itself instead of a staged build and records its sha256. A PowerShell script captures Windows Terminal running the same terminal sample over the same folder; `scripts/release/release-images.py` copies, trims and places the real captures side by side (it draws nothing). `scripts/verify-live-readme-images.py` is generalized to 2.0.0 and gains `--offline`.

**Tech Stack:** Node 24 (ES modules, `node:test`), @vscode/vsce 3.9.2, yauzl 3.4.0, agent-browser 0.38.1 (contact sheets), Python 3 with Pillow (image assembly, privacy OCR) and tesseract, VS Code 1.141.0 for Windows (captures), Windows Terminal with witchyterm's Moonlit Candle profile, Windows PowerShell 5.1, fish 3.7 and eza 0.18 in WSL (witchyterm's `ll`).

**Spec:** `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md`, sections 1 (success criterion), 3 (themes; the settings the README documents), 5.1 (the dropped keys), 6 (the logo rule), 7 (glossary), 8 (the `release` bullet and `validate --release`), 9 (all of it), 11.5 F1 and 11.7 (gate-6 decisions). Previous plan and format: `docs/superpowers/plans/2026-10-11-spellbound-2-gate-6.md` (its Global Constraints, harness conventions and job generator are reused here). Executors read the spec alongside this plan; section numbers refer to the spec.

## Global Constraints

Kept from the earlier plans (still valid):

- `engines.vscode` stays `^1.100.0`. The package stays declarative: no `main`, no `configurationDefaults` (spec 1: the package does not set `terminal.integrated.minimumContrastRatio`). The review helper in `review/` is never referenced from the root `package.json` and stays out of the VSIX.
- No theme, glyph, codepoint, drawing, palette or map change: 177 pinned keys, 109 product drawings, the gate-6 file-icon map. `npm run build` leaves `themes/`, `icons/witchynibbles-product-icons.woff`, `icons/product-icon-theme.json`, `icons/file-icons/**` and `icons/file-icon-theme.json` byte for byte as they are (Task 10 checks it).
- The theme ids stay: the four color theme labels, `witchynibbles-icons`, `witchynibbles-product-icons`.
- Never kill VS Code by image name. Review instances run with their own `--user-data-dir` and `--extensions-dir` and are closed by PID or CDP only, always through `scripts/review/run-gate.mjs`. Only Tasks 7 and 10 launch VS Code; only Task 8 launches Windows Terminal. Neither runs while another agent's gate run is capturing (a new window takes the focus).
- The VS Code install, the Windows user directory and the Windows Terminal profile GUID are found at run time, never written down.
- `node scripts/validate.mjs` writes its `✗` lines to stderr: every command that pipes it uses `2>&1`. The three accepted product grid warnings (`cat-slash`, `gear`, `sync-arrows`, G16) and the 21 `⚠ F9` lines (G45) print in every run; commands filter them with `grep -vE 'cat-slash|gear\.svg|sync-arrows|^⚠ F9'`.
- `run-gate.mjs` rejects unknown options (exit 2) and prints its usage with `--help`; a run with `--scales` or `--scenes` is marked `dryRun` in its manifest and is never release evidence.
- Every test file lives in `test/` and ends in `.test.mjs`; each keeps its own helpers. Never name a scratch file `*-test.mjs`, `*.test.mjs` or `test-*.mjs`. Scratch files live in `review-out/rel/` (git-ignored).

Release:

- **Commits.** Task 1 is a standalone bug fix and is committed when it passes. Tasks 2-11 are not committed: each ends with a tree snapshot, `mkdir -p review-out/rel && git add -A && git write-tree | tee review-out/rel/TREE_N`, and the next task's changes are `git add -A && git diff --cached $(cat review-out/rel/TREE_N)`. Task 12 makes the one release commit after the author approves the release package. Never `git checkout --` or `git restore` a file in Tasks 2-11 (HEAD lacks the release work); restore from a copy under `review-out/rel/`. Commit messages end with the attribution line the session provides.
- **Never push, tag, publish or merge.** No `git push`, no `git tag`, no `gh release`, no `vsce publish`, no `vsce login`, no merge into `main`. Those are the author's (section "Publishing: the author's steps").
- **Privacy.** No Windows or WSL user name, user directory or account email is ever written into a tracked file, a plan, a commit message or a committed image. Docs write `<user>`. Every committed image, QA file, README, CHANGELOG and release note passes `node scripts/review/privacy-scan.mjs` and a look by the executor. A failed run's or a failed PowerShell script's output holds Windows paths with the user name: never paste it into a tracked file.
- **Honest images.** Every Marketplace image is a real capture, or real captures cropped and placed side by side. Nothing is drawn, retouched, recoloured or resampled. Each image's provenance (run id, scene, theme, crop, the capture's sha256 in the manifest) is recorded in `docs/qa/2.0.0-release/`.
- agent-browser (the contact sheets): every command block that runs the harness starts with `export AGENT_BROWSER_SESSION=spellbound-release`; after a run, `agent-browser session list` reads `No active sessions`.

### Environment

- Run `npm test`, `npm run validate`, `npm run package`, the harness (`node scripts/review/run-gate.mjs`) and `node scripts/review/privacy-scan.mjs` outside the sandbox, with the Windows system folders on `PATH`: `export PATH="$PATH:/mnt/c/Windows/System32:/mnt/c/Windows"` (they reach `cmd.exe`, `powershell.exe`, `wt.exe` and the Windows VS Code through WSL interop). Without them, four privacy-scan tests fail and the harness cannot launch VS Code.
- Test totals are real-repo values with the `../witchyterm` sibling present (`ℹ pass` equals `ℹ tests`, no `ℹ skipped`). In a copy without the sibling, `ℹ pass` is one lower and `ℹ skipped 1` appears; the commands grep `ℹ tests` and `ℹ fail`, which read the same in both.
- Shell snippets are bash.

## Review Focus

The five ways this release is most likely to fail a user that no single task's code would show, and what pins each:

1. **The README's settings block names a theme that does not exist** (a label or id typo, copied by every reader into `settings.json`, silently falls back to the default theme). Pinned by `the README settings name the contributed themes …` (Task 9), which parses the block and checks each value against `package.json`.
2. **The Marketplace page shows broken or stale images.** The VSIX does not ship them (R1): they load from `raw.githubusercontent.com/…/main`, so a wrong path, a missing push or a renamed file breaks the page. Pinned by `the README shows the six Marketplace images …` (Task 9), `a packaged VSIX … points its README images at GitHub` (Task 3), `verify-live-readme-images.py --offline` (Task 10) and the same script online after the author's push.
3. **The VSIX misses a runtime file or ships junk.** An over-broad `.vscodeignore` line would drop a theme or the font and VS Code would show stock icons; a loose one would ship `review/` or `docs/`. Pinned by the allowlist and required-file tests (Task 3), and by installing the packaged VSIX itself into a fresh VS Code profile (Task 10: the four theme signatures, the product font, and the file icons drawn from the `…-2.0.0` extension folder).
4. **A Marketplace image leaks the author's user name or a path.** The terminal is the risk: `ll` prints the owner column, a prompt prints the working directory, and witchyterm's greeting prints the user name. Pinned by `the terminal runs only the ritual …` (Task 5: `ll --no-user`, `fish -c` with no prompt), the privacy scan and the eye check of every image (Tasks 7, 8).
5. **The Marketplace listing gets wrong tags.** vsce adds a tag for each language word it finds in the description (`spell` → `markdown`, `terminal`, `css`, `js`, `python`, `sql`, …), and the Marketplace takes at most 30 keywords. Pinned by `a packaged VSIX … carries the 2.0.0 tags only` (Task 3), which reads `<Tags>` from a real package.

## Resolved decisions

Decisions this plan takes that the spec does not; the author may overrule any of them at Task 12, where they are recorded as spec 11.8.

| # | Decision | Why | Task |
| :- | :- | :- | :- |
| R1 | The VSIX ships runtime files only: the four themes, both icon theme JSONs, the font, the resolved file icons, the extension icon, `package.json`, README, CHANGELOG, LICENSE. Out: `icons/product-src/**`, `icons/product-icon-map.json`, `icons/product-icon-ids.json`, `icons/product-icon-baseline-1.2.1.json`, `icons/file-icon-map.json`, `icons/README.md` (the "awaiting a release decision" list in `test/package-contents.test.mjs`) and `assets/screenshots/**` (the README images load from GitHub; vsce rewrites the links whether or not the files are packaged, checked while planning). | VS Code reads none of them; the sources stay in the public repository. | 3 |
| R2 | The extension icon `assets/witchynibbles.png` is resized from 1254×1254 to 256×256 (1.5 MB to about 100 KB, same artwork, Pillow LANCZOS). | It was three quarters of the VSIX; the Marketplace shows it at 128 px. | 3 |
| R3 | The `release` stage joins `scripts/validation-stage.json`, so `npm run validate` enforces every stage. | The stage file's own rule: phases append a stage when its work lands. | 2 |
| R4 | The images are taken in VS Code's default window (1024×768, centred: `window.newWindowDimensions: "default"` for this job only) at 100%, not in the review's maximized 1920×1032 window. | A 1024-wide image shows near 1:1 on the Marketplace page; a 1920-wide one is halved, and its 16 px icons with it. | 4, 5, 7 |
| R5 | The terminal sample is `scripts/ritual.fish` in the fixture: witchyterm's `ll --no-user` (eza's own flag: the owner column left out), then the 16 ANSI colours as text and swatches, run as `fish -i -c "source scripts/ritual.fish"` with no prompt, by VS Code (a scene-only terminal profile) and by Windows Terminal (witchyterm's Moonlit Candle profile) over the same folder. Windows Terminal is captured over a plain `#0D0916` backdrop, so its 93% acrylic shows the theme's background, not the desktop. | The spec's `ll`, with no user name, path or desktop in a public image. `../witchyterm/docs/screenshots/shell-ritual.png` is a real Windows Terminal capture but cannot be used: its greeting and owner column show the WSL user name, a symlink target shows a Windows user directory, and it lists a home folder, not the release fixture. | 5, 8 |
| R6 | The product icon image is the review helper's icon sheet (every drawing at 16 px with its name and IDs) on its three pages, in Moonlit Candle, stacked top to bottom. | The whole sheet in a real workbench (spec 9), as one image. | 7 |
| R7 | `scripts/verify-icon-release.py` stays as the frozen record of 1.2.1 (it checks the 1.2.1 VSIX and the 48 1.2.1 sources) and is not run for 2.0.0. `scripts/verify-live-readme-images.py` is generalized: version from `package.json`, images from the README, compared with the committed files (the VSIX no longer carries them), `--offline` before the push. | The 1.2.1 script fails on every 2.0 source by design. | 10 |
| R8 | The README carries the spec-7 glossary as a table of what the icons mean. Proposing the glossary additions to witchyterm (spec 2, 7) is left to the author; this plan does not touch witchyterm. | Users read the icons; the proposal is an external action. | 9 |
| R9 | Description: `Moonlit Candle: candle-gold accents and lavender light on a moonlit night, plus Moonlit, Daydream and Coven Contrast, with original file and product icons.` Keywords: `theme`, `dark theme`, `light theme`, `high contrast`, `witchy`, `moonlit candle`, `candle`, `gold`, `purple`, `file icons`, `product icons`, `icon theme` (12; `pastel`, `neon`, `pink` dropped). | Spec 9; no word in the description triggers a vsce language tag. | 2 |

## File structure

Created:

- `scripts/review/release-job.mjs` and `review/jobs/release.json` (generated) (Task 5); `review/workspace-release/` (Task 5, 15 files: `.env.example`, `.github/workflows/validate.yml`, `.gitignore`, `CHANGELOG.md`, `LICENSE`, `README.md`, `assets/moon.svg`, `docs/rituals.md`, `package.json`, `scripts/ritual.fish`, `src/familiars.ts`, `src/spellbook.py`, `src/styles.css`, `tests/familiars.test.ts`, `tsconfig.json`).
- `scripts/release/release-images.py` (Task 6); `scripts/review/windows-terminal.ps1` (Task 8).
- `assets/screenshots/moonlit-candle.png` (Task 7), `assets/screenshots/terminal.png` (Task 8).
- `docs/qa/2.0.0-release/README.md`, `docs/qa/2.0.0-release/manifest.json` (Tasks 7, 8, 10, 11); `docs/release/2.0.0.md` (Task 10).
- Tests: `test/release-metadata.test.mjs` (Task 2), `test/review-release.test.mjs` (Task 5), `test/release-images.test.mjs` (Task 6), `test/release-docs.test.mjs` (Task 9), `test/release-notes.test.mjs` (Task 10).

Modified:

- `scripts/lib/svg-geometry.mjs`, `test/svg-geometry.test.mjs` (Task 1).
- `package.json`, `package-lock.json`, `scripts/validation-stage.json`, `test/file-icon-checks.test.mjs` (Task 2).
- `.vscodeignore`, `assets/witchynibbles.png`, `test/package-contents.test.mjs` (Task 3).
- `scripts/review/args.mjs`, `scripts/review/run-gate.mjs`, `scripts/review/capture.mjs`, `test/review-args.test.mjs`, `test/review-harness.test.mjs` (Tasks 4, 5).
- `assets/screenshots/{moonlit,daydream,coven-contrast,product-icons}.png` (replaced, Task 7).
- `README.md`, `CHANGELOG.md` (Task 9); `scripts/verify-live-readme-images.py` (Task 10); the spec, status line and section 11.8 (Task 12).

Not changed: `themes/`, everything under `icons/` (only `.vscodeignore` decides what of it ships), every drawing module, the builds, `scripts/lib/checks/*`, `scripts/verify-icon-release.py`, `review/profile/*`, the review helper, the gate fixtures and jobs.

Not committed (git-ignored): `review-out/rel/`, every run under `review-out/`, `*.vsix`.

## Staging: test totals

`B` is the `ℹ tests` total Before Task 1 measures (647 if gate 6 ended as its plan says). Every later total is `B` plus the same delta.

| After | `npm test` tests | `validate` summary | New or changed tests |
| :- | :- | :- | :- |
| Before Task 1 | B (647) | `… 2 pending problems in stages not yet enforced: release (2) (use --verbose to list)` | |
| Task 1 | B + 2 | same | 2 in `svg-geometry` |
| Task 2 | B + 4 | no pending line; `✓` ends `file-icons, release)` | 2 in `release-metadata`; 1 replaced in `file-icon-checks` |
| Task 3 | B + 6 | same | `package-contents`: 2 replaced by 4 |
| Task 4 | B + 9 | same | 1 new and 1 changed in `review-args`, 2 in `review-harness` |
| Task 5 | B + 14 | same | 5 in `review-release` |
| Task 6 | B + 17 | same | 3 in `release-images` |
| Tasks 7, 8 | B + 17 | same | |
| Task 9 | B + 21 | same | 4 in `release-docs` |
| Task 10 | B + 22 | same | 1 in `release-notes` |

Computed from per-file counts measured while planning on a copy of HEAD (`86d01bb`, the gate-5 state, 492 tests) with Tasks 1-6, 9 and 10 applied.

---

## Before Task 1

Gate 6 is committed and the author commits this plan before Task 1. Executors make neither commit. Check both, and the tools:

Run: `git branch --show-current && git log --format=%s -3 && git status --short | wc -l`
Expected: `spellbound-2.0`; the subject of the author's commit of this plan; a subject starting `Spellbound 2.0 gate 6`; `0`. If gate 6 is not committed or the tree is dirty, stop and ask the author: uncommitted gate-6 work would end up in the release.

Run: `grep -c '^### 11.7' docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md && node -e "const s=require('./scripts/validation-stage.json').enforce; console.log(s.slice(-2).join(' '), Object.keys(require('./icons/file-icon-map.json').drawings).length, Object.keys(require('./icons/product-icon-map.json').drawings).length)" && ls icons/file-src/owl.svg`
Expected: `1`, then `file-icons:pipeline file-icons 63 109` (if gate 6's decisions changed the drawing count, note it: Task 9 uses measured counts), then the owl source.

Measure the base and record it:

```bash
export PATH="$PATH:/mnt/c/Windows/System32:/mnt/c/Windows"
mkdir -p review-out/rel
npm test 2>&1 | grep -E '^ℹ (tests|pass|fail|skipped)' | tee review-out/rel/BASE
node scripts/validate.mjs 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows|^⚠ F9' | grep -E '^…|^✓|^✗' | tee -a review-out/rel/BASE
node scripts/validate.mjs 2>&1 | grep -c '^⚠ F9' | tee -a review-out/rel/BASE
```

Expected: `ℹ tests 647`, `ℹ pass 647`, `ℹ fail 0`, `ℹ skipped 0`; `… 2 pending problems in stages not yet enforced: release (2) (use --verbose to list)`; the `✓` line ending `file-icons:pipeline, file-icons)`; `21`. If `ℹ tests` differs, that number is `B`. If `ℹ fail` is not `0`, stop and fix the environment first.

Check the tools: `node --version` (v24), `agent-browser --version` (0.38.1), `python3 -c "import PIL"`, `tesseract --version`, `node -e "console.log(require('@vscode/vsce/package.json').version)"` (3.9.2), `fish -i -c 'functions -q ll; and eza --help | grep -c -- --no-user'` (`1`: witchyterm's `ll` exists and eza has `--no-user`), `(cd /mnt/c && cmd.exe /d /c where wt.exe) | wc -l` (`1` or more: Windows Terminal).

---

## Part A: code

### Task 1: `outlineGap` no longer overflows the stack on large outlines

`outlineGap` (`scripts/lib/svg-geometry.mjs`) spreads every point-to-segment distance into one `Math.min(...)` call: `4 × |edges A| × |edges B|` arguments. Past roughly 125,000 arguments V8 throws `RangeError: Maximum call stack size exceeded` (measured: two 100-point rings pass, two 200-point rings throw). The owl file icon's outline (four rings, two tufts and the beak: 269 flattened points) against its eyes (130 points) is 139,880 arguments, so gate 6 had to measure the owl by ink instead (its plan: "measure such drawings per pair of subpaths, or by ink"). The fix is a loop; the result is the same number.

**Files:**
- Modify: `scripts/lib/svg-geometry.mjs` (`outlineGap`), `test/svg-geometry.test.mjs`

**Interfaces:**
- Consumes: `outlineGap(a, b)`, `subpaths(d)`, `parseGlyphSvg(text)` (unchanged signatures); `icons/file-src/owl.svg` (gate 6: the outline part first, the eyes last).
- Produces: `outlineGap(a, b) -> number` with the same contract, for outlines of any size.

- [ ] **Step 1: Write the failing tests**

In `test/svg-geometry.test.mjs`, add after `import assert from 'node:assert/strict';`:

```js
import fs from 'node:fs';
import path from 'node:path';
```

and append at the end of the file:

```js
// Gate 6: outlineGap overflowed the call stack once two outlines held a few hundred flattened points each (the owl file
// icon's four rings measured together): it spread every point-to-segment distance into one Math.min call.
test('outlineGap measures outlines of hundreds of points each without overflowing the stack', () => {
  const ring = (cx, cy, r, n, clockwise = true) => {
    const points = Array.from({ length: n }, (_, i) => [cx + r * Math.cos((2 * Math.PI * i) / n), cy + r * Math.sin((2 * Math.PI * i) / n)]);
    return clockwise ? points : points.reverse();
  };
  assert.ok(Math.abs(outlineGap([ring(4, 8, 2, 400)], [ring(12, 8, 2, 400)]) - 4) < 1e-9, 'side by side: 4 between the rims');
  const nested = outlineGap([ring(8, 8, 6, 400), ring(8, 8, 5, 400, false)], [ring(8, 8, 2, 400)]);
  assert.ok(nested > 2.999 && nested <= 3, `nested: the wall from the frame's inner edge to the disc (measured ${nested})`);
});

test('outlineGap measures the owl file icon\'s eyes against its rings, tufts and beak in one call (G42: one unit)', () => {
  const svg = fs.readFileSync(path.resolve(import.meta.dirname, '..', 'icons', 'file-src', 'owl.svg'), 'utf8');
  const [outline, eyes] = parseGlyphSvg(svg).paths;
  const gap = outlineGap(subpaths(outline.d), subpaths(eyes.d));
  assert.ok(gap >= 1 - 0.01, `the eyes keep one unit from the rest of the owl (measured ${gap})`);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `node --test test/svg-geometry.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|RangeError' | sort | uniq -c`
Expected: `2   RangeError: Maximum call stack size exceeded`, `ℹ fail 2`, `ℹ pass 11`, `ℹ tests 13` (measured with the owl drawn as gate 6's plan draws it). If gate 6 redrew the owl smaller and its test already passes, `ℹ fail 1`: the 400-point test still pins the bug.

- [ ] **Step 3: Replace the spread with a loop**

In `scripts/lib/svg-geometry.mjs`, in `outlineGap`, replace

```js
  return Math.min(
    ...edgesA.flatMap(([p, q]) => edgesB.flatMap((edge) => [pointToSegment(p, edge), pointToSegment(q, edge)])),
    ...edgesB.flatMap(([p, q]) => edgesA.flatMap((edge) => [pointToSegment(p, edge), pointToSegment(q, edge)])),
  );
```

with

```js
  // A loop, not Math.min(...): spreading every distance into one call overflowed the stack once two outlines held a few
  // hundred flattened points each (the owl file icon's four rings measured together).
  let gap = Infinity;
  for (const [from, to] of [[edgesA, edgesB], [edgesB, edgesA]]) {
    for (const [p, q] of from) for (const edge of to) gap = Math.min(gap, pointToSegment(p, edge), pointToSegment(q, edge));
  }
  return gap;
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
export PATH="$PATH:/mnt/c/Windows/System32:/mnt/c/Windows"
node --test test/svg-geometry.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `ℹ tests 13`, `ℹ pass 13`, `ℹ fail 0` (the owl measures 0.9987 with gate 6's geometry; the file runs in about 0.3 s); `ℹ tests B+2`, `ℹ fail 0` (every drawing test that uses `outlineGap` gets the same numbers: the minimum is the same minimum).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/svg-geometry.mjs test/svg-geometry.test.mjs
git commit -m "Fix outlineGap overflowing the call stack on large outlines

<attribution line from the session>"
```

Gate 6's drawing tests that measure the owl by ink or per pair stay as they are (they pass either way).

---

### Task 2: Release metadata, and `npm run validate` enforces `release`

**Files:**
- Create: `test/release-metadata.test.mjs`
- Modify: `package.json`, `package-lock.json` (both through `npm version`), `scripts/validation-stage.json`, `test/file-icon-checks.test.mjs`

**Interfaces:**
- Consumes: `checkReleaseMetadata(packageJson, report)` (`scripts/lib/checks/package.mjs`, unchanged: version `2.0.0`, banner `#0D0916`).
- Produces: `package.json` `version` `2.0.0`, `galleryBanner` `{ color: '#0D0916', theme: 'dark' }`, the R9 description and keywords; `scripts/validation-stage.json` `enforce` ending `"file-icons:pipeline", "file-icons", "release"`.

- [ ] **Step 1: Write the failing tests**

Create `test/release-metadata.test.mjs`:

```js
// Spec 8 and 9: the release metadata of Spellbound Themes 2.0.0.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const json = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('package.json and package-lock.json are 2.0.0, with the #0D0916 dark gallery banner (spec 8, 9)', () => {
  const pkg = json('package.json');
  const lock = json('package-lock.json');
  assert.equal(pkg.version, '2.0.0');
  assert.deepEqual(pkg.galleryBanner, { color: '#0D0916', theme: 'dark' });
  assert.deepEqual([lock.version, lock.packages[''].version], ['2.0.0', '2.0.0']);
});

test('the description and keywords name Moonlit Candle and its candle-gold look, and drop pastel (spec 9)', () => {
  const { description, keywords } = json('package.json');
  assert.equal(description, 'Moonlit Candle: candle-gold accents and lavender light on a moonlit night, plus Moonlit, Daydream and Coven Contrast, with original file and product icons.');
  assert.deepEqual(keywords, ['theme', 'dark theme', 'light theme', 'high contrast', 'witchy', 'moonlit candle', 'candle', 'gold', 'purple', 'file icons', 'product icons', 'icon theme']);
  assert.ok(keywords.length <= 30, 'the Marketplace takes at most 30 keywords');
  assert.doesNotMatch(`${description} ${keywords.join(' ')}`, /pastel/i);
});
```

In `test/file-icon-checks.test.mjs`, replace the test gate 6 wrote (Task 8 of its plan)

```js
test('npm run validate enforces file-icons:pipeline and then file-icons (full key coverage, gate 6), after the product batches', () => {
  const { enforce } = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '..', 'scripts', 'validation-stage.json'), 'utf8'));
  assert.deepEqual(enforce.slice(-2), ['file-icons:pipeline', 'file-icons']);
});
```

with

```js
test('npm run validate enforces file-icons:pipeline, file-icons, then release (2.0.0, R3), after the product batches', () => {
  const { enforce } = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '..', 'scripts', 'validation-stage.json'), 'utf8'));
  assert.deepEqual(enforce.slice(-3), ['file-icons:pipeline', 'file-icons', 'release']);
});
```

(If gate 6 worded that test differently, replace whichever test in that file reads `scripts/validation-stage.json`.)

Run: `node --test --test-reporter=tap test/release-metadata.test.mjs test/file-icon-checks.test.mjs 2>&1 | grep -E '^not ok' | sed 's/^not ok [0-9]* - //'`
Expected: the two new tests and `npm run validate enforces file-icons:pipeline, file-icons, then release (2.0.0, R3), after the product batches`, nothing else.

- [ ] **Step 2: Bump the version in both files**

Run: `npm version 2.0.0 --no-git-tag-version && git diff --stat package.json package-lock.json`
Expected: `v2.0.0`; `package-lock.json | 4 ++--` and `package.json | 2 +-` (the lockfile's `version` and `packages[""].version`; no commit, no tag; checked while planning).

- [ ] **Step 3: Description, keywords, banner, stage**

In `package.json`, replace the `description` line with

```json
  "description": "Moonlit Candle: candle-gold accents and lavender light on a moonlit night, plus Moonlit, Daydream and Coven Contrast, with original file and product icons.",
```

the `keywords` array with

```json
  "keywords": [
    "theme",
    "dark theme",
    "light theme",
    "high contrast",
    "witchy",
    "moonlit candle",
    "candle",
    "gold",
    "purple",
    "file icons",
    "product icons",
    "icon theme"
  ],
```

and, in `galleryBanner`, `"color": "#110d24"` with `"color": "#0D0916"` (`"theme": "dark"` stays). In `scripts/validation-stage.json`, change the end of `enforce` from `"file-icons"]` to `"file-icons", "release"]`.

- [ ] **Step 4: Run the tests and both validations**

```bash
node --test test/release-metadata.test.mjs test/file-icon-checks.test.mjs 2>&1 | grep -E '^ℹ fail'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/validate.mjs 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows|^⚠ F9' | grep -E '^…|^✓|^✗'
node scripts/validate.mjs --release 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows|^⚠ F9' | grep -E '^…|^✓|^✗'
```

Expected: `ℹ fail 0`; `ℹ tests B+4`, `ℹ fail 0`; `✓ WitchyNibbles package validation passed (enforced: base, color-themes, product-pipeline, product-batch:1, product-batch:chrome, product-batch:status, product-batch:panel, product-batch:debug, product-batch:editor, product-batch:symbols, file-icons:pipeline, file-icons, release)` and no `…` line; `✓ WitchyNibbles package validation passed (enforced: every stage)`. With gate 6 in, the spec-8 release checks (version, banner) are all that `validate --release` still required: every other stage is already enforced.

- [ ] **Step 5: Snapshot**

Run: `git add -A && git write-tree | tee review-out/rel/TREE_2`
Expected: one tree id.

---

### Task 3: The VSIX holds runtime files only (R1), with a 256 px icon (R2)

**Files:**
- Modify: `.vscodeignore`, `assets/witchynibbles.png`, `test/package-contents.test.mjs` (rewritten)

**Interfaces:**
- Consumes: `package.json` `contributes`, `icon`, `keywords`, `scripts.package` (its `--baseImagesUrl` and `--baseContentUrl`); `icons/file-icon-map.json` (drawing names); yauzl 3.4.0 (devDependency).
- Produces: a VSIX of 203 files (14 plus 3 × 63 resolved file icons) under 512 KB, with the tags `keywords ∪ {color-theme, icon-theme, product-icon-theme, __web_extension}`.

- [ ] **Step 1: Write the failing tests**

Replace the whole of `test/package-contents.test.mjs` with:

```js
// The VSIX holds the files VS Code reads at run time and nothing else (2.0.0 release decision R1): the manifest, the
// README, CHANGELOG and LICENSE the extension page shows, the four color themes, the extension icon, and the two icon
// themes with the font and the resolved file icons they load. The screenshots load from GitHub; the icon sources, maps
// and pinned ID lists are build inputs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import yauzl from 'yauzl';

const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const allowed = [
  /^package\.json$/, /^README\.md$/, /^CHANGELOG\.md$/, /^LICENSE\.md$/,
  /^themes\/WitchyNibbles-color-theme-(moonlit-candle|dark|light|high-contrast)\.json$/,
  /^assets\/witchynibbles\.png$/,
  /^icons\/(product-icon-theme\.json|witchynibbles-product-icons\.woff|file-icon-theme\.json)$/,
  /^icons\/file-icons\/(dark|light|high-contrast)\/[a-z0-9-]+\.svg$/,
];

// vsce's own entry script under the running Node, not `npx`: on native Windows npx is npx.cmd, which execFileSync can
// only start through a shell.
const vsce = (...args) => execFileSync(process.execPath, [path.join(root, 'node_modules', '@vscode', 'vsce', 'vsce'), ...args], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
let listing;
const vsceList = () => {
  listing ??= vsce('ls', '--no-dependencies').split('\n').map((line) => line.trim()).filter(Boolean);
  return listing;
};

test('the vsix file list (vsce ls) holds only runtime files: no review/, docs/, scripts, tests, icon sources, maps or screenshots', () => {
  assert.deepEqual(vsceList().filter((file) => !allowed.some((re) => re.test(file))), []);
});

test('the vsix holds every runtime file: the contributed themes, the font, the extension icon and each resolved file icon in three sets', () => {
  const listed = new Set(vsceList());
  for (const { path: file } of [...pkg.contributes.themes, ...pkg.contributes.iconThemes, ...pkg.contributes.productIconThemes]) {
    assert.ok(listed.has(file.replace(/^\.\//, '')), file);
  }
  assert.ok(listed.has('icons/witchynibbles-product-icons.woff'));
  assert.ok(listed.has(pkg.icon));
  const drawings = Object.keys(JSON.parse(fs.readFileSync(path.join(root, 'icons', 'file-icon-map.json'), 'utf8')).drawings);
  for (const set of ['dark', 'light', 'high-contrast']) {
    for (const name of drawings) assert.ok(listed.has(`icons/file-icons/${set}/${name}.svg`), `${set}/${name}`);
  }
  assert.equal([...listed].filter((file) => file.startsWith('icons/file-icons/')).length, 3 * drawings.length, 'no stale resolved icon');
});

test('the extension icon is a 256x256 PNG (the Marketplace shows it at 128px; 1.2.1 shipped 1254px, three quarters of the VSIX)', () => {
  const icon = fs.readFileSync(path.join(root, pkg.icon));
  assert.equal(icon.readUInt32BE(0), 0x89504e47);
  assert.deepEqual([icon.readUInt32BE(16), icon.readUInt32BE(20)], [256, 256]);
});

const openZip = promisify(yauzl.open);
async function readEntries(file, names) {
  const zip = await openZip(file, { lazyEntries: true });
  const found = {};
  await new Promise((resolve, reject) => {
    zip.on('error', reject);
    zip.on('end', resolve);
    zip.on('entry', (entry) => {
      if (!names.includes(entry.fileName)) return zip.readEntry();
      zip.openReadStream(entry, (error, stream) => {
        if (error) return reject(error);
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => {
          found[entry.fileName] = Buffer.concat(chunks).toString('utf8');
          zip.readEntry();
        });
      });
    });
    zip.readEntry();
  });
  return found;
}

test('a packaged VSIX stays under 512 KB, carries the 2.0.0 tags only, and points its README images at GitHub (spec 9)', async () => {
  const [, imagesUrl] = pkg.scripts.package.match(/--baseImagesUrl (\S+)/);
  const [, contentUrl] = pkg.scripts.package.match(/--baseContentUrl (\S+)/);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-vsix-'));
  try {
    const file = path.join(dir, 'candidate.vsix');
    vsce('package', '--no-dependencies', '--baseImagesUrl', imagesUrl, '--baseContentUrl', contentUrl, '-o', file);
    assert.ok(fs.statSync(file).size < 512 * 1024, `${fs.statSync(file).size} bytes`);
    const { 'extension.vsixmanifest': manifest, 'extension/readme.md': readme } = await readEntries(file, ['extension.vsixmanifest', 'extension/readme.md']);
    // vsce adds a tag for each contribution kind, and one per language word it finds in the description (a "spell",
    // "terminal" or "css" there would add markdown, terminal or css): none may appear beyond these.
    const tags = manifest.match(/<Tags>([^<]*)<\/Tags>/)[1].split(',');
    assert.deepEqual(tags.sort(), [...new Set([...pkg.keywords, 'color-theme', 'icon-theme', 'product-icon-theme', '__web_extension'])].sort());
    const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((match) => match[1]);
    assert.ok(images.length && images.every((url) => url.startsWith(`${imagesUrl}/assets/screenshots/`)), images.join('\n'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
```

Run: `node --test --test-reporter=tap test/package-contents.test.mjs 2>&1 | grep -E '^not ok|^# (tests|pass|fail)' | sed 's/^not ok [0-9]* - //'`
Expected: the allowlist test (it lists `icons/product-src/…`, the maps, `icons/README.md` and the screenshots), the icon test (`[ 1254, 1254 ]`), the packaged test (about 2 MB: the 1.5 MB icon and the screenshots), `# tests 4`, `# pass 1`, `# fail 3` (measured on a copy of HEAD).

- [ ] **Step 2: Leave the build inputs and the screenshots out of the VSIX**

Append to `.vscodeignore`:

```
# Release 2.0.0 (decision R1): only what VS Code reads at run time. The README images load from GitHub; the icon sources,
# maps and pinned ID lists are build inputs.
assets/screenshots/**
icons/README.md
icons/product-src/**
icons/product-icon-map.json
icons/product-icon-ids.json
icons/product-icon-baseline-1.2.1.json
icons/file-icon-map.json
```

- [ ] **Step 3: Resize the extension icon (R2)**

```bash
cp assets/witchynibbles.png review-out/rel/witchynibbles-1254.png
python3 -c "from PIL import Image; Image.open('assets/witchynibbles.png').resize((256, 256), Image.LANCZOS).save('assets/witchynibbles.png', optimize=True)"
python3 -c "from PIL import Image; print(Image.open('assets/witchynibbles.png').size)"; stat -c %s assets/witchynibbles.png
```

Expected: `(256, 256)` and about 102,500 bytes (measured while planning). Open `assets/witchynibbles.png` with the Read tool: the same witch, hat, cat and laptop, sharp at 256 px.

- [ ] **Step 4: Run the tests**

```bash
node --test test/package-contents.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node_modules/.bin/vsce ls --no-dependencies | grep -v '^icons/file-icons/'
```

Expected: `ℹ tests 4`, `ℹ pass 4`; `ℹ tests B+6`, `ℹ fail 0`; exactly these 12 lines, in any order: `package.json`, `README.md`, `LICENSE.md`, `CHANGELOG.md`, the four `themes/WitchyNibbles-color-theme-*.json`, `icons/witchynibbles-product-icons.woff`, `icons/product-icon-theme.json`, `icons/file-icon-theme.json`, `assets/witchynibbles.png` (measured while planning).

- [ ] **Step 5: Snapshot**

Run: `git add -A && git write-tree | tee review-out/rel/TREE_3`
Expected: one tree id.

---

### Task 4: Harness: a job's own settings from the launch on, and `--vsix`

**Files:**
- Modify: `scripts/review/args.mjs`, `scripts/review/run-gate.mjs`, `scripts/review/capture.mjs`, `test/review-args.test.mjs`, `test/review-harness.test.mjs`

**Interfaces:**
- Consumes: `parseGateArgs(argv)`, `USAGE` (`args.mjs`); `settingsFor` and `writeUserFile` in `capture.mjs`; the manifest `run-gate.mjs` writes.
- Produces: `parseGateArgs(argv) -> { job, skipVariants, help, scales, scenes, vsix }` (`vsix`: a path or `null`; `--vsix=` throws `--vsix needs a file`); `run-gate.mjs --vsix <file>` copies that file as the main pass's `spellbound-main.vsix` (no staging), stops with exit 2 and `--vsix <file> is not a file` before building when it is missing, and records `manifest.installedVsix = { file, sha256 }`; `capture.mjs` merges `job.settings` into every settings write, the one before the launch included.

- [ ] **Step 1: Write the failing tests**

In `test/review-args.test.mjs`, in the test `parseGateArgs reads --job, --skip-variants, --scales and --scenes`, add `vsix: null` to both expected objects:

```js
  assert.deepEqual(parseGateArgs([]), { job: 'review/jobs/gate-1.json', skipVariants: false, help: false, scales: null, scenes: null, vsix: null });
  assert.deepEqual(parseGateArgs(['--job', 'review/jobs/gate-3.json', '--skip-variants', '--scales=1,2', '--scenes', 'debug,icon-sheet']),
    { job: 'review/jobs/gate-3.json', skipVariants: true, help: false, scales: [1, 2], scenes: ['debug', 'icon-sheet'], vsix: null });
```

and insert before the test `parseGateArgs rejects unknown options, stray arguments, bad scales and empty lists`:

```js
test('parseGateArgs reads --vsix, the package the release check installs, and refuses an empty one', () => {
  assert.equal(parseGateArgs(['--job', 'review/jobs/release.json', '--vsix', 'witchynibbles-theme-collection-2.0.0.vsix']).vsix, 'witchynibbles-theme-collection-2.0.0.vsix');
  assert.throws(() => parseGateArgs(['--vsix=']), /--vsix needs a file/);
});
```

Append to `test/review-harness.test.mjs`:

```js
// ---- Release 2.0.0 ----
test('a job\'s own settings hold from the launch on, under each scene\'s settings, and never pick a theme', () => {
  // The release job opens VS Code's default-size window instead of the review's maximized one: window.newWindowDimensions
  // is read when the window opens, so it must be in the settings written before the launch.
  const capture = read('scripts/review/capture.mjs');
  assert.match(capture, /const settingsFor = \(theme, extra = \{\}\) => JSON\.stringify\(\{ \.\.\.baseSettings, \.\.\.zoom, \.\.\.job\.settings, 'workbench\.colorTheme': theme\.label, \.\.\.extra \}, null, 2\);/);
  const launchWrite = capture.indexOf("writeUserFile(userDataDir, 'settings.json', settingsFor(job.themes[0]));");
  assert.ok(launchWrite > 0 && launchWrite < capture.indexOf('const session = await launch('), 'written before the launch');
  for (const file of JOBS) {
    for (const key of ['workbench.colorTheme', 'workbench.iconTheme', 'workbench.productIconTheme']) assert.ok(!(key in (json(file).settings ?? {})), `${file} keeps ${key}`);
  }
});

test('run-gate installs the VSIX given with --vsix in the main pass unchanged, records its sha256, and stops before building when it is missing', () => {
  const runGate = read('scripts/review/run-gate.mjs');
  assert.match(runGate, /if \(args\.vsix\) fs\.copyFileSync\(path\.resolve\(root, args\.vsix\), path\.join\(out, 'spellbound-main\.vsix'\)\);\nelse execFileSync\('node', \['scripts\/review\/stage-extension\.mjs', out\]/);
  assert.match(runGate, /manifest\.installedVsix = \{ file: path\.basename\(args\.vsix\), sha256: crypto\.createHash\('sha256'\)/);
  const missing = spawnSync(process.execPath, ['scripts/review/run-gate.mjs', '--job', 'review/jobs/smoke.json', '--vsix', 'no-such.vsix'], { cwd: root, encoding: 'utf8' });
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /--vsix no-such\.vsix is not a file/);
});
```

Run: `node --test --test-reporter=tap test/review-args.test.mjs test/review-harness.test.mjs 2>&1 | grep -E '^not ok|^# (tests|pass|fail)' | sed 's/^not ok [0-9]* - //'`
Expected: `parseGateArgs reads --job, --skip-variants, --scales and --scenes`, `parseGateArgs reads --vsix, …`, `a job's own settings hold from the launch on, …`, `run-gate installs the VSIX given with --vsix …` (today it exits 2 on `Unknown option '--vsix'`, before building), `# tests 61`, `# pass 57`, `# fail 4` (measured on a copy of HEAD; gate 6 adds no test to these two files).

- [ ] **Step 2: `args.mjs`**

Replace the first three lines of `USAGE`

```js
export const USAGE = `Usage: node scripts/review/run-gate.mjs [--job <file>] [--skip-variants] [--scales <list>] [--scenes <list>]
  --job <file>       gate job (default review/jobs/gate-1.json)
  --skip-variants    capture only the main pass
```

with

```js
export const USAGE = `Usage: node scripts/review/run-gate.mjs [--job <file>] [--skip-variants] [--scales <list>] [--scenes <list>] [--vsix <file>]
  --job <file>       gate job (default review/jobs/gate-1.json)
  --skip-variants    capture only the main pass
  --vsix <file>      install this VSIX in the main pass instead of a staged build (release: the packaged VSIX itself)
```

In `parseGateArgs`, add `vsix: { type: 'string' },` after `scenes: { type: 'string' },` in `options`, and replace the `return` line with

```js
  if (values.vsix !== undefined && !values.vsix.trim()) throw new Error('--vsix needs a file');
  return { job: values.job, skipVariants: values['skip-variants'], help: values.help, scales, scenes: list('scenes', values.scenes), vsix: values.vsix ?? null };
```

- [ ] **Step 3: `run-gate.mjs`**

In the `try` block, after `workspaceOf(job, root);`, add

```js
  if (args.vsix && !fs.statSync(path.resolve(root, args.vsix), { throwIfNoEntry: false })?.isFile()) throw new Error(`--vsix ${args.vsix} is not a file`);
```

Replace

```js
// 1. Build and package the extension, plus a variant build for the gate questions.
execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
fs.mkdirSync(out, { recursive: true });
execFileSync('node', ['scripts/review/stage-extension.mjs', out], { cwd: root, stdio: 'inherit' });
```

with

```js
// 1. Build and package the extension (or take the VSIX given with --vsix, unchanged: the release check installs the
//    packaged VSIX itself), plus a variant build for the gate questions.
execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
fs.mkdirSync(out, { recursive: true });
if (args.vsix) fs.copyFileSync(path.resolve(root, args.vsix), path.join(out, 'spellbound-main.vsix'));
else execFileSync('node', ['scripts/review/stage-extension.mjs', out], { cwd: root, stdio: 'inherit' });
```

and before `if (args.scales || args.scenes) manifest.dryRun = …`, add

```js
if (args.vsix) manifest.installedVsix = { file: path.basename(args.vsix), sha256: crypto.createHash('sha256').update(fs.readFileSync(path.resolve(root, args.vsix))).digest('hex') };
```

- [ ] **Step 4: `capture.mjs`**

Replace

```js
    const settingsFor = (theme, extra = {}) => JSON.stringify({ ...baseSettings, ...zoom, 'workbench.colorTheme': theme.label, ...extra }, null, 2);
```

with

```js
    // A job's own settings (release: a default-size window) hold from the launch on, under each scene's.
    const settingsFor = (theme, extra = {}) => JSON.stringify({ ...baseSettings, ...zoom, ...job.settings, 'workbench.colorTheme': theme.label, ...extra }, null, 2);
```

(`run-gate.mjs` writes the job with its `settings` into `job.json`: `filterJob` and `resolveWaits` keep every job field.)

- [ ] **Step 5: Run the tests**

```bash
node --test test/review-args.test.mjs test/review-harness.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/review/run-gate.mjs --help | head -1
```

Expected: `ℹ tests 61`, `ℹ pass 61`; `ℹ tests B+9`, `ℹ fail 0`; the usage line ending `[--vsix <file>]`.

- [ ] **Step 6: Snapshot**

Run: `git add -A && git write-tree | tee review-out/rel/TREE_4`
Expected: one tree id.

---

### Task 5: The release fixture and the release job

The job (R4, R5, R6): VS Code's default window at 100%, all four themes, five scenes. `showcase`: the Explorer over the whole fixture with `src` open, three tabs (Python, CSS left unsaved, TypeScript active), the TypeScript code in the editor; the activity bar, status bar, tab, breadcrumb and Explorer title icons are the product icons. `icon-sheet`, `icon-sheet-2`, `icon-sheet-3`: gate 4's three icon-sheet scenes (51 drawings a page). `terminal`: a scene-only WSL profile runs `scripts/ritual.fish` with `terminal.integrated.minimumContrastRatio` 1. A run gives 5 scenes × 2 captures (`full` and the scene's crop) × 4 themes = 40 captures and 5 contact sheets.

**Files:**
- Create: the 15 files of `review/workspace-release/` (below), `scripts/review/release-job.mjs`, `review/jobs/release.json` (generated), `test/review-release.test.mjs`
- Modify: `test/review-harness.test.mjs` (`RELEASE` in `JOBS`)

**Interfaces:**
- Consumes: the review chords in `review/profile/keybindings.json` (`ctrl+alt+shift+4` Explorer, `alt+shift+F9` collapse, `ctrl+alt+shift+a` focus the editor group, `alt+shift+F7` quick open, `alt+shift+F8` reveal and focus the Files Explorer, `ctrl+alt+F3` revert, `alt+shift+F5` close all editors, `ctrl+alt+shift+F8`/`F9` close the side bars, `ctrl+alt+shift+7` icon sheet, `ctrl+alt+shift+F4` next page, `ctrl+alt+shift+m` maximize the panel, `ctrl+alt+shift+e` close the panel, `ctrl+alt+shift+8` new terminal with the default profile); the named wait `quick-input-row`; `job.settings` (Task 4).
- Produces: `releaseJob({ name, version })`, `FIXTURE`, `OPEN_FILES`, `DIRTY_FILE`, `EXPLORER_ROWS`, `FOLDERS`, `RITUAL`, `TERMINAL_PROFILE_NAME`, `TERMINAL_PROFILE`, `SHEET_PAGES` (exported by `scripts/review/release-job.mjs`); `node scripts/review/release-job.mjs` writes `review/jobs/release.json`. The capture paths Task 6 reads: `captures/main/1/showcase/<theme>/default/full.png`, `captures/main/1/icon-sheet{,-2,-3}/moonlit-candle/default/panel.png`, `captures/main/1/terminal/moonlit-candle/default/panel.png`.

- [ ] **Step 1: Write the failing tests**

Create `test/review-release.test.mjs`:

```js
// The release job (spec 9): the Marketplace screenshots in VS Code 1.141, generated by scripts/review/release-job.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DIRTY_FILE, EXPLORER_ROWS, FIXTURE, FOLDERS, OPEN_FILES, RITUAL, SHEET_PAGES, TERMINAL_PROFILE, TERMINAL_PROFILE_NAME, releaseJob } from '../scripts/review/release-job.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const job = () => json('review/jobs/release.json');
const scene = (name) => job().scenes.find((candidate) => candidate.name === name);
const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command && binding.args === undefined)?.key;

test('review/jobs/release.json is the generator\'s job for this package (node scripts/review/release-job.mjs)', () => {
  assert.deepEqual(job(), releaseJob(json('package.json')));
});

test('the release job opens its fixture in VS Code\'s default window at 100%, in all four themes, no scene picking a theme', () => {
  const { workspace, settings, passes, scenes, commitSheets } = job();
  assert.equal(workspace, FIXTURE);
  assert.deepEqual(settings, { 'window.newWindowDimensions': 'default' });
  assert.deepEqual(passes, [{ name: 'main', vsix: ['spellbound-main.vsix'], scales: [1] }]);
  assert.deepEqual(scenes.map(({ name }) => name), ['showcase', 'icon-sheet', 'icon-sheet-2', 'icon-sheet-3', 'terminal']);
  assert.deepEqual(commitSheets, [], 'the images go to assets/screenshots/, not to a gate folder');
  for (const { name, settings: own = {} } of scenes) {
    for (const key of ['workbench.colorTheme', 'workbench.iconTheme', 'workbench.productIconTheme']) assert.ok(!(key in own), `${name} keeps ${key}`);
  }
});

test('the showcase waits for the whole fixture in the Explorer, three tabs with one unsaved, and the installed 2.0.0 file icons', () => {
  const top = fs.readdirSync(path.join(root, FIXTURE));
  const src = fs.readdirSync(path.join(root, FIXTURE, 'src'));
  assert.deepEqual([...EXPLORER_ROWS].sort(), [...top, ...src].sort(), 'every top-level entry and src\'s files, once');
  assert.deepEqual(FOLDERS, top.filter((entry) => fs.statSync(path.join(root, FIXTURE, entry)).isDirectory()).sort());
  for (const file of OPEN_FILES) assert.ok(fs.existsSync(path.join(root, FIXTURE, file)), file);
  const { setup, teardown } = scene('showcase');
  assert.deepEqual(setup.filter((step) => step.insert).map((step) => step.insert), [...OPEN_FILES.slice(0, 2), ' ', OPEN_FILES[2]]);
  const wait = setup.at(-1).waitFor;
  assert.ok(wait.includes(`rows.length === ${EXPLORER_ROWS.length}`) && wait.includes("tabs.querySelectorAll('.tab.dirty').length === 1"));
  assert.ok(wait.includes(`".witchynibbles-theme-collection-${json('package.json').version}/icons/file-icons/dark/gem-cut.svg"`));
  // Closing an unsaved editor opens a save dialog: the teardown reverts it first.
  const revert = keyOf('workbench.action.files.revert');
  assert.deepEqual(teardown.filter((step) => step.insert || step.press === revert).map((step) => step.insert ?? 'revert'), [DIRTY_FILE, 'revert']);
  const tracked = spawnSync('git', ['check-ignore', '--no-index', '--stdin'], { cwd: root, input: [...top, ...src.map((file) => `src/${file}`)].map((entry) => `${FIXTURE}/${entry}`).join('\n'), encoding: 'utf8' });
  assert.equal(tracked.stdout, '', 'git tracks the whole fixture');
});

test('the icon sheet scenes turn gate 4\'s three pages of 51 drawings, and the last puts the panel back', () => {
  const drawings = Object.keys(json('icons/product-icon-map.json').drawings).length;
  assert.equal(Math.ceil(drawings / 51), SHEET_PAGES, `${drawings} drawings`);
  const pages = job().scenes.filter(({ name }) => name.startsWith('icon-sheet'));
  pages.forEach(({ setup }, index) => assert.ok(setup.some((step) => String(step.waitFor).includes(`'page ${index + 1} of ${SHEET_PAGES}'`)), `page ${index + 1}`));
  assert.deepEqual(pages.at(-1).teardown.map((step) => step.press), [keyOf('spellboundReview.iconSheetPage'), keyOf('workbench.action.toggleMaximizedPanel'), keyOf('workbench.action.closePanel')]);
});

test('the terminal runs only the ritual, with no prompt: witchyterm\'s ll without the owner column, then the 16 colours', () => {
  const { settings, setup } = scene('terminal');
  assert.deepEqual(settings['terminal.integrated.profiles.windows'], { [TERMINAL_PROFILE_NAME]: TERMINAL_PROFILE });
  assert.equal(settings['terminal.integrated.defaultProfile.windows'], TERMINAL_PROFILE_NAME);
  assert.equal(settings['terminal.integrated.minimumContrastRatio'], 1, 'the README setting for an exact match');
  assert.deepEqual(TERMINAL_PROFILE, { path: 'C:\\Windows\\System32\\wsl.exe', args: ['-e', 'fish', '-i', '-c', 'source scripts/ritual.fish'] });
  assert.ok(setup.some((step) => step.press === keyOf('workbench.action.terminal.new')), 'opens the default profile');
  const commands = read(path.join(FIXTURE, RITUAL)).split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
  assert.deepEqual(commands, [
    'll --no-user',
    'echo',
    'set -l names black red green yellow blue magenta cyan white',
    'for i in (seq 0 7)',
    'set -l name $names[(math $i + 1)]',
    "printf '\\e[3%sm%-8s\\e[0m \\e[4%sm      \\e[0m \\e[10%sm      \\e[0m \\e[9%smbright %s\\e[0m\\n' $i $name $i $i $i $name",
    'end',
    'sleep 3600',
  ]);
});
```

In `test/review-harness.test.mjs`, replace

```js
const GATE_6 = 'review/jobs/gate-6.json';
const JOBS = [...GATES, GATE_5, GATE_6, 'review/jobs/smoke.json'];
```

with

```js
const GATE_6 = 'review/jobs/gate-6.json';
const RELEASE = 'review/jobs/release.json';
const JOBS = [...GATES, GATE_5, GATE_6, RELEASE, 'review/jobs/smoke.json'];
```

Run: `node --test test/review-release.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)|Cannot find module' && node --test --test-reporter=tap test/review-harness.test.mjs 2>&1 | grep -E '^not ok|^# (tests|pass|fail)' | sed 's/^not ok [0-9]* - //'`
Expected: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/scripts/review/release-job.mjs' …`, `ℹ tests 1`, `ℹ pass 0`, `ℹ fail 1`; then `every file the harness needs exists`, `job files follow the schema and press only bound chords or plain keys`, `a job's own settings hold from the launch on, …`, `# tests 52`, `# pass 49`, `# fail 3` (no `release.json` yet; measured on a copy of HEAD).

- [ ] **Step 2: Write the fixture**

Create these files under `review/workspace-release/` (every line is final text; LF line endings). `src/spellbook.py` is a copy: `cp fixtures/showcase.py review/workspace-release/src/spellbook.py`.

`.env.example`:

```
# Copy to .env. A review fixture: nothing here is a secret.
MOON_PHASE=waxing-gibbous
CANDLE_COUNT=3
```

`.github/workflows/validate.yml`:

```yaml
name: validate
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
```

`.gitignore`:

```
node_modules/
dist/
.env
```

`CHANGELOG.md`:

```markdown
# Changelog

## 0.3.0

- Familiars come strongest first.
```

`LICENSE`:

```
A review fixture of WitchyNibbles Spellbound Themes. The project's license is LICENSE.md at the repository root.
```

`README.md`:

```markdown
# Moonlit familiars

A small review fixture: the workspace the Spellbound Themes Marketplace screenshots show.
```

`assets/moon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#ffd477"/></svg>
```

`docs/rituals.md`:

```markdown
# Rituals

Run `npm test` before every full moon, and light one candle per failing familiar.
```

`package.json`:

```json
{
  "name": "moonlit-familiars",
  "version": "0.3.0",
  "private": true,
  "type": "module"
}
```

`scripts/ritual.fish` (R5; ASCII only):

```fish
# The terminal sample of the release image (spec 9). VS Code and Windows Terminal both run it in this folder, with no
# prompt: witchyterm's ll without the owner column, then the 16 ANSI colours, each as text and as a swatch.
ll --no-user
echo
set -l names black red green yellow blue magenta cyan white
for i in (seq 0 7)
    set -l name $names[(math $i + 1)]
    printf '\e[3%sm%-8s\e[0m \e[4%sm      \e[0m \e[10%sm      \e[0m \e[9%smbright %s\e[0m\n' $i $name $i $i $i $name
end
sleep 3600
```

`src/familiars.ts`:

```ts
// Familiars of the coven, strongest first. A review fixture for the Spellbound Themes screenshots.
type Affinity = "moon" | "candle" | "tide";

/** A familiar bound to one witch; `power` runs from 0 to 99. */
export interface Familiar {
  readonly id: number;
  name: string;
  affinity: Affinity;
  power: number;
  awake?: boolean;
}

const familiars: Familiar[] = [
  { id: 1, name: "Miso", affinity: "moon", power: 42, awake: true },
  { id: 2, name: "Pixel", affinity: "candle", power: 77 },
  { id: 3, name: "Orbit", affinity: "tide", power: 13, awake: false },
];

export class Coven {
  private readonly members = new Map<number, Familiar>();

  summon(familiar: Familiar): this {
    this.members.set(familiar.id, familiar);
    return this;
  }

  get strongest(): Familiar | undefined {
    return byPower([...this.members.values()])[0];
  }
}

export function byPower<T extends { power: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => right.power - left.power);
}

export const names: string[] = byPower(familiars).map(({ name }) => `${name} the familiar`);
```

`src/styles.css`:

```css
/* Candlelight for the familiars page. */
:root {
  --night: #0d0916;
  --candle: #ffd477;
}

.familiar[data-awake="true"] {
  color: var(--candle);
  font-weight: 600;
}
```

`tests/familiars.test.ts` (no import from outside the fixture, so the TypeScript server reports nothing):

```ts
import { byPower } from "../src/familiars.js";

const ranked = byPower([{ power: 1 }, { power: 3 }]);
if (ranked[0].power !== 3) throw new Error("the strongest familiar comes first");
```

`tsconfig.json`:

```json
{
  "compilerOptions": { "target": "ES2022", "module": "NodeNext", "strict": true, "noEmit": true },
  "include": ["src", "tests"]
}
```

The fixture is under `review/**`, which `.vscodeignore` excludes, and `npm test` collects only `test/**/*.test.mjs` (`tests/familiars.test.ts` never runs).

- [ ] **Step 3: Write the generator and the job**

Create `scripts/review/release-job.mjs`:

```js
// The release job (spec 9): the Marketplace screenshots, captured in VS Code 1.141 by the review harness. Generated, so
// its long waits are written once: `node scripts/review/release-job.mjs` writes review/jobs/release.json, and
// test/review-release.test.mjs fails if the committed job drifts from this generator. Scenes: the workbench in each color
// theme (showcase), the product icon sheet on its three pages (icon-sheet, -2, -3; gate 4's scenes), and witchyterm's ll
// in the integrated terminal (terminal). Run it with --vsix and the packaged VSIX, so the images show the release itself.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FIXTURE = 'review/workspace-release';
// Opened in this order: the last is the editor the screenshots show; the second is left unsaved (the ✦ and, with
// workbench.editor.highlightModifiedTabs, the pink border the README recommends).
export const OPEN_FILES = ['src/spellbook.py', 'src/styles.css', 'src/familiars.ts'];
export const DIRTY_FILE = OPEN_FILES[1];
// The showcase Explorer, top to bottom: folders first, src open over its three files, then the files.
export const EXPLORER_ROWS = ['.github', 'assets', 'docs', 'scripts', 'src', 'familiars.ts', 'spellbook.py', 'styles.css', 'tests',
  '.env.example', '.gitignore', 'CHANGELOG.md', 'LICENSE', 'package.json', 'README.md', 'tsconfig.json'];
export const FOLDERS = ['.github', 'assets', 'docs', 'scripts', 'src', 'tests'];
// The terminal sample (Task 8 runs the same file in Windows Terminal). wsl.exe starts in the workspace folder; fish -c
// draws no prompt, so no path shows.
export const RITUAL = 'scripts/ritual.fish';
export const TERMINAL_PROFILE_NAME = 'Spellbound ritual';
export const TERMINAL_PROFILE = { path: 'C:\\Windows\\System32\\wsl.exe', args: ['-e', 'fish', '-i', '-c', `source ${RITUAL}`] };
export const SHEET_PAGES = 3;

const KEYS = {
  explorer: 'ctrl+alt+shift+4', // workbench.view.explorer
  collapse: 'alt+shift+F9', // workbench.files.action.collapseExplorerFolders
  focusEditor: 'ctrl+alt+shift+a', // workbench.action.focusActiveEditorGroup
  quickOpen: 'alt+shift+F7', // workbench.action.quickOpen
  reveal: 'alt+shift+F8', // reveal the active file and focus the Files Explorer
  revert: 'ctrl+alt+F3', // workbench.action.files.revert
  closeAll: 'alt+shift+F5', // workbench.action.closeAllEditors
  closeSidebar: 'ctrl+alt+shift+F8',
  closeAuxiliaryBar: 'ctrl+alt+shift+F9',
  iconSheet: 'ctrl+alt+shift+7', // spellboundReview.iconSheet.focus
  nextPage: 'ctrl+alt+shift+F4', // spellboundReview.iconSheetPage
  maximizePanel: 'ctrl+alt+shift+m', // workbench.action.toggleMaximizedPanel
  closePanel: 'ctrl+alt+shift+e', // workbench.action.closePanel
  newTerminal: 'ctrl+alt+shift+8', // workbench.action.terminal.new (the default profile)
};
const fileClass = (name) => `${name.toLowerCase()}-name-file-icon`;
const folderClass = (name) => `${name.toLowerCase()}-name-folder-icon`;
const INSIDE = 'const inside = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; };';
const focusEditor = [{ press: KEYS.focusEditor, wait: 500 }, { waitFor: "!!document.activeElement?.closest('.part.editor')", timeout: 10000 }];
const open = (file) => [
  { press: KEYS.quickOpen, wait: 800 }, { insert: file, wait: 300 }, { until: 'quick-input-row', file: file.split('/').at(-1), timeout: 10000 }, { press: 'Enter', wait: 1500 },
];

// Every Explorer row inside the tree, src open, three tabs with one unsaved, the editor focused, and the ts icon drawn
// from this package's own folder (eimimartinez.<name>-<version>), so the capture shows the installed release.
const showcaseWait = ({ name, version }) => {
  const classes = EXPLORER_ROWS.map((entry) => (FOLDERS.includes(entry) ? folderClass(entry) : fileClass(entry)));
  const icon = `.${name}-${version}/icons/file-icons/dark/gem-cut.svg`;
  return `(() => { const view = document.querySelector('.part.sidebar .explorer-folders-view'); const list = view?.querySelector('.monaco-list'); const tabs = document.querySelector('.part.editor .tabs-and-actions-container'); if (!list || !tabs) return false; const box = list.getBoundingClientRect(); ${INSIDE} const rows = [...view.querySelectorAll('.monaco-list-row')]; const row = (name) => rows.find((r) => r.querySelector('.monaco-icon-label')?.classList.contains(name)); const ts = row(${JSON.stringify(fileClass('familiars.ts'))})?.querySelector('.monaco-icon-label'); return rows.length === ${classes.length} && ${JSON.stringify(classes)}.every((name) => !!row(name) && inside(row(name).querySelector('.monaco-icon-label'))) && row(${JSON.stringify(folderClass('src'))}).getAttribute('aria-expanded') === 'true' && tabs.querySelectorAll('.tab').length === ${OPEN_FILES.length} && tabs.querySelectorAll('.tab.dirty').length === 1 && !!ts && getComputedStyle(ts, '::before').backgroundImage.toLowerCase().includes(${JSON.stringify(icon)}) && !!document.activeElement?.closest('.part.editor'); })()`;
};
// Gate 4's icon-sheet waits: the page's header, and every row of the three views inside the panel.
const pageWait = (page) => `[...document.querySelectorAll('.part.panel .pane-header .description')].some((el) => el.textContent.trim() === 'page ${page} of ${SHEET_PAGES}')`;
const ROWS_WAIT = "(() => { const panel = document.querySelector('.part.panel'); if (!panel) return false; const box = panel.getBoundingClientRect(); const lists = [...panel.querySelectorAll('.pane-body .monaco-list')]; const icons = [...panel.querySelectorAll('.pane-body .monaco-list-row .codicon')]; return lists.length === 3 && icons.length > 0 && lists.every((list) => { const rows = list.querySelector('.monaco-list-rows'); return !!rows && rows.offsetHeight <= list.clientHeight; }) && icons.every((icon) => { const r = icon.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; }); })()";
const PANEL = [{ name: 'panel', selector: '.part.panel' }];

export function releaseJob({ name, version }) {
  const sheet = Array.from({ length: SHEET_PAGES }, (_, index) => ({
    name: `icon-sheet${index ? `-${index + 1}` : ''}`,
    setup: [
      ...(index ? [{ press: KEYS.nextPage, wait: 1500 }] : [
        { press: KEYS.closeSidebar, wait: 500 }, { press: KEYS.closeAuxiliaryBar, wait: 500 }, { press: KEYS.iconSheet, wait: 1500 }, { press: KEYS.maximizePanel, wait: 1500 },
      ]),
      { waitFor: pageWait(index + 1), timeout: 10000 },
      { waitFor: ROWS_WAIT, timeout: 10000 },
    ],
    crops: PANEL,
    ...(index === SHEET_PAGES - 1 ? { teardown: [{ press: KEYS.nextPage, wait: 500 }, { press: KEYS.maximizePanel, wait: 800 }, { press: KEYS.closePanel }] } : {}),
  }));
  const scenes = [
    {
      name: 'showcase',
      // Explorer title actions (new file, new folder, refresh, collapse) shown without the pointer; .github not compacted
      // into ".github/workflows", so each row is one folder; no quick-open history ahead of a typed path.
      settings: { 'workbench.view.alwaysShowHeaderActions': true, 'explorer.compactFolders': false, 'search.quickOpen.includeHistory': false },
      setup: [
        { press: KEYS.closeAuxiliaryBar, wait: 500 }, { press: KEYS.explorer, wait: 1200 }, { press: KEYS.collapse, wait: 500 }, ...focusEditor,
        ...open(OPEN_FILES[0]), ...open(DIRTY_FILE), { insert: ' ', wait: 500 }, ...open(OPEN_FILES[2]),
        { press: KEYS.reveal, wait: 1000 }, ...focusEditor,
        { waitFor: showcaseWait({ name, version }), timeout: 20000 },
      ],
      crops: [{ name: 'workbench', selector: '.monaco-workbench' }],
      // The unsaved file is reverted before the editors close: closing it unsaved would open a save dialog.
      teardown: [...open(DIRTY_FILE), { press: KEYS.revert, wait: 800 }, { press: KEYS.closeAll, wait: 800 }, { press: KEYS.collapse, wait: 500 }],
    },
    ...sheet,
    {
      name: 'terminal',
      // witchyterm's palette as Windows Terminal draws it: no contrast lift (README), Maple Mono NF (the base profile) at
      // 16px with a 1.1 line height (witchyterm's 12pt and cell height). Panel tabs as icons.
      settings: {
        'terminal.integrated.profiles.windows': { [TERMINAL_PROFILE_NAME]: TERMINAL_PROFILE },
        'terminal.integrated.defaultProfile.windows': TERMINAL_PROFILE_NAME,
        'terminal.integrated.minimumContrastRatio': 1,
        'terminal.integrated.fontSize': 16,
        'terminal.integrated.lineHeight': 1.1,
        'workbench.panel.showLabels': false,
      },
      setup: [
        { press: KEYS.closeSidebar, wait: 500 }, { press: KEYS.closeAuxiliaryBar, wait: 500 }, ...focusEditor,
        { press: KEYS.newTerminal, wait: 8000 }, { press: KEYS.maximizePanel, wait: 1500 },
        { waitFor: "!!document.querySelector('.part.panel .xterm')", timeout: 20000 },
        // fish, eza and the swatches have printed; the ritual then sleeps, so the screen stays as it is.
        { wait: 4000 },
      ],
      crops: PANEL,
      teardown: [{ press: KEYS.maximizePanel, wait: 800 }, { press: KEYS.closePanel }],
    },
  ];
  return {
    expectVersion: '1.141.0',
    port: 9333,
    mode: 'device-scale',
    helperVsix: 'spellbound-review-helper.vsix',
    workspace: FIXTURE,
    // VS Code's default window (centred, not maximized) at 100%: a workbench the Marketplace page shows near 1:1.
    settings: { 'window.newWindowDimensions': 'default' },
    passes: [{ name: 'main', vsix: ['spellbound-main.vsix'], scales: [1] }],
    scenes,
    commitSheets: [],
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(import.meta.dirname, '..', '..');
  const job = releaseJob(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')));
  fs.writeFileSync(path.join(root, 'review', 'jobs', 'release.json'), `${JSON.stringify(job, null, 2)}\n`);
  console.log(`Wrote review/jobs/release.json: ${job.scenes.length} scenes`);
}
```

```bash
node scripts/review/release-job.mjs
node --test test/review-release.test.mjs test/review-harness.test.mjs 2>&1 | grep -E '^ℹ (tests|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `Wrote review/jobs/release.json: 5 scenes`; `ℹ tests 57`, `ℹ fail 0`; `ℹ tests B+14`, `ℹ fail 0`.

- [ ] **Step 4: Check that the harness reads the job, without launching anything**

```bash
node --input-type=module -e "
import fs from 'node:fs';
import { filterJob } from './scripts/review/args.mjs';
import { resolveWaits } from './scripts/review/waits.mjs';
import { workspaceOf } from './scripts/review/workspace.mjs';
const job = resolveWaits(filterJob(JSON.parse(fs.readFileSync('review/jobs/release.json', 'utf8')), { scales: null, scenes: null }));
console.log(workspaceOf(job, '.'), job.scenes.length, job.scenes.flatMap((scene) => [...scene.setup, ...(scene.teardown ?? [])]).filter((step) => step.until).length, JSON.stringify(job.settings));
"
node scripts/review/run-gate.mjs --job review/jobs/release.json --scales=3 2>&1 | head -1; echo "exit ${PIPESTATUS[0]}"
```

Expected: `review/workspace-release 5 0 {"window.newWindowDimensions":"default"}` (every named wait resolved); `No pass captures at scale 3`, `exit 2` (measured while planning).

- [ ] **Step 5: Snapshot**

Run: `git add -A && git write-tree | tee review-out/rel/TREE_5`
Expected: one tree id.

---

### Task 6: `scripts/release/release-images.py`: real captures, copied, trimmed, placed

**Files:**
- Create: `scripts/release/release-images.py`, `test/release-images.test.mjs`

**Interfaces:**
- Consumes: the capture paths of Task 5 (`<run>/captures/main/1/<scene>/<theme>/default/<crop>.png`); a Windows Terminal PNG (Task 8).
- Produces: `python3 scripts/release/release-images.py themes <run-dir> <out-dir>` (one `<theme>.png` per color theme, the showcase's `full.png` re-saved), `… sheet <run-dir> <out.png>` (the three icon-sheet panels, each trimmed, stacked), `… terminal <run-dir> <wt.png> <out.png>` (the trimmed VS Code terminal panel cut to the Windows Terminal capture's width, a 24 px `#0D0916` gutter, the Windows Terminal capture). Each prints `<out>: <w>x<h>`; `terminal` also prints `VS Code <n> px | gutter 24 px | Windows Terminal <m> px`.

- [ ] **Step 1: Write the failing tests**

Create `test/release-images.test.mjs`:

```js
// scripts/release/release-images.py (spec 9): the Marketplace images are real captures, copied, trimmed and placed side by
// side, never drawn. Synthetic captures stand in for a release run here.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const script = path.join(root, 'scripts', 'release', 'release-images.py');
const PANEL = [23, 16, 37]; // a panel background
// Writes a PNG of the given size and background with one white box [x, y, width, height]; prints nothing.
const MAKE = `import sys
from PIL import Image, ImageDraw
w, h, r, g, b, x, y, bw, bh = map(int, sys.argv[2:11])
image = Image.new('RGB', (w, h), (r, g, b))
ImageDraw.Draw(image).rectangle((x, y, x + bw - 1, y + bh - 1), fill=(255, 255, 255))
image.save(sys.argv[1])`;
const make = (file, size, box, background = PANEL) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  execFileSync('python3', ['-c', MAKE, file, ...size, ...background, ...box].map(String));
};
// Width, height and the RGB of a few points of a PNG.
const probe = (file, points = []) => JSON.parse(execFileSync('python3', ['-c', `import json, sys
from PIL import Image
image = Image.open(sys.argv[1]).convert('RGB')
print(json.dumps([image.size, [image.getpixel(tuple(p)) for p in json.loads(sys.argv[2])]]))`, file, JSON.stringify(points)], { encoding: 'utf8' }));
const capture = (run, scene, crop, theme = 'moonlit-candle') => path.join(run, 'captures', 'main', '1', scene, theme, 'default', `${crop}.png`);
const withRun = (fn) => {
  const run = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-release-images-'));
  try { fn(run); } finally { fs.rmSync(run, { recursive: true, force: true }); }
};

test('themes: one image per color theme, the showcase\'s full window with its pixels unchanged', () => withRun((run) => {
  const themes = ['moonlit-candle', 'moonlit', 'daydream', 'coven-contrast'];
  themes.forEach((theme, index) => make(capture(run, 'showcase', 'full', theme), [64, 48], [index, index, 5, 5]));
  execFileSync('python3', [script, 'themes', run, path.join(run, 'out')]);
  assert.deepEqual(fs.readdirSync(path.join(run, 'out')).sort(), themes.map((theme) => `${theme}.png`).sort());
  themes.forEach((theme, index) => {
    const points = [[index, index], [index + 5, index + 5]];
    assert.deepEqual(probe(path.join(run, 'out', `${theme}.png`), points), probe(capture(run, 'showcase', 'full', theme), points), theme);
  });
}));

test('sheet: the three icon-sheet pages, each cut 8 px below and right of its last content, stacked top to bottom', () => withRun((run) => {
  make(capture(run, 'icon-sheet', 'panel'), [60, 40], [5, 5, 20, 10]); // content to x25, y15: 33x23
  make(capture(run, 'icon-sheet-2', 'panel'), [60, 40], [5, 5, 30, 20]); // 43x33
  make(capture(run, 'icon-sheet-3', 'panel'), [60, 40], [5, 5, 20, 10]); // 33x23
  execFileSync('python3', [script, 'sheet', run, path.join(run, 'sheet.png')]);
  const [size, [page2, filler, page3]] = probe(path.join(run, 'sheet.png'), [[5, 23 + 5], [40, 5], [5, 23 + 33 + 5]]);
  assert.deepEqual(size, [43, 23 + 33 + 23]);
  assert.deepEqual([page2, filler, page3], [[255, 255, 255], [13, 9, 22], [255, 255, 255]], 'pages in order, the narrower ones padded with #0D0916');
}));

test('terminal: VS Code\'s terminal panel, cut to the Windows Terminal capture\'s width, then a 24 px gutter, then Windows Terminal', () => withRun((run) => {
  make(capture(run, 'terminal', 'panel'), [80, 50], [2, 2, 70, 10]); // trimmed to 80x20, cut to 50x20
  make(path.join(run, 'wt.png'), [50, 30], [0, 0, 50, 30], [0, 0, 0]);
  execFileSync('python3', [script, 'terminal', run, path.join(run, 'wt.png'), path.join(run, 'terminal.png')]);
  const [size, [left, gutter, right]] = probe(path.join(run, 'terminal.png'), [[49, 5], [60, 5], [74, 29]]);
  assert.deepEqual(size, [50 + 24 + 50, 30]);
  assert.deepEqual([left, gutter, right], [[255, 255, 255], [13, 9, 22], [255, 255, 255]]);
}));
```

Run: `node --test test/release-images.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 3`, `ℹ pass 0`, `ℹ fail 3` (python3 cannot open the script).

- [ ] **Step 2: Write the script**

Create `scripts/release/release-images.py` (ASCII only):

```python
"""Assemble the Marketplace images of spec 9 from real captures.

Nothing is drawn: every pixel comes from a VS Code capture of the release run (review/jobs/release.json) or from the
Windows Terminal capture (scripts/review/windows-terminal.ps1). The script copies, crops away trailing background, and
places captures next to each other on the Moonlit Candle background, then saves plain PNGs (no text chunks).

Usage:
  python3 scripts/release/release-images.py themes <run-dir> <out-dir>        one workbench per color theme
  python3 scripts/release/release-images.py sheet <run-dir> <out.png>         the three icon-sheet pages, stacked
  python3 scripts/release/release-images.py terminal <run-dir> <wt.png> <out.png>   VS Code's terminal beside Windows Terminal
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops

BACKGROUND = (0x0D, 0x09, 0x16)  # Moonlit Candle's editor and terminal background (spec 3.1)
GUTTER = 24  # between VS Code and Windows Terminal
MARGIN = 8  # background kept below and right of the content when trimming
THEMES = ("moonlit-candle", "moonlit", "daydream", "coven-contrast")
SHEET_THEME = "moonlit-candle"
SHEET_SCENES = ("icon-sheet", "icon-sheet-2", "icon-sheet-3")


def capture(run, scene, crop, theme=SHEET_THEME):
    return Image.open(Path(run) / "captures" / "main" / "1" / scene / theme / "default" / f"{crop}.png").convert("RGB")


def trim(image):
    """Cuts the rows below and the columns right of the content, keeping MARGIN: background is the bottom-right pixel's colour."""
    background = Image.new("RGB", image.size, image.getpixel((image.width - 1, image.height - 1)))
    box = ImageChops.difference(image, background).getbbox()
    if box is None:
        raise SystemExit("a capture holds nothing but background")
    return image.crop((0, 0, min(image.width, box[2] + MARGIN), min(image.height, box[3] + MARGIN)))


def save(image, out):
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    image.save(out, "PNG", optimize=True)
    print(f"{out}: {image.width}x{image.height}")


def themes(run, out_dir):
    for theme in THEMES:
        save(capture(run, "showcase", "full", theme), Path(out_dir) / f"{theme}.png")


def sheet(run, out):
    pages = [trim(capture(run, scene, "panel")) for scene in SHEET_SCENES]
    image = Image.new("RGB", (max(page.width for page in pages), sum(page.height for page in pages)), BACKGROUND)
    top = 0
    for page in pages:
        image.paste(page, (0, top))
        top += page.height
    save(image, out)


def terminal(run, windows_terminal, out):
    right = Image.open(windows_terminal).convert("RGB")
    left = trim(capture(run, "terminal", "panel"))
    left = left.crop((0, 0, min(left.width, right.width), left.height))
    image = Image.new("RGB", (left.width + GUTTER + right.width, max(left.height, right.height)), BACKGROUND)
    image.paste(left, (0, 0))
    image.paste(right, (left.width + GUTTER, 0))
    save(image, out)
    print(f"VS Code {left.width} px | gutter {GUTTER} px | Windows Terminal {right.width} px")


COMMANDS = {"themes": (themes, 2), "sheet": (sheet, 2), "terminal": (terminal, 3)}
if __name__ == "__main__":
    command, arguments = (sys.argv[1], sys.argv[2:]) if len(sys.argv) > 1 else (None, [])
    if command not in COMMANDS or len(arguments) != COMMANDS[command][1]:
        raise SystemExit(__doc__)
    COMMANDS[command][0](*arguments)
```

- [ ] **Step 3: Run the tests**

```bash
node --test test/release-images.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
```

Expected: `ℹ tests 3`, `ℹ pass 3`; `ℹ tests B+17`, `ℹ fail 0`.

- [ ] **Step 4: Snapshot**

Run: `git add -A && git write-tree | tee review-out/rel/TREE_6`
Expected: one tree id.

---

## Part B: the Marketplace images

### Task 7: Capture the workbenches and the product icon sheet in VS Code 1.141

**Files:**
- Modify (replace): `assets/screenshots/moonlit.png`, `assets/screenshots/daydream.png`, `assets/screenshots/coven-contrast.png`, `assets/screenshots/product-icons.png`
- Create: `assets/screenshots/moonlit-candle.png`, `docs/qa/2.0.0-release/manifest.json`

**Interfaces:**
- Consumes: Tasks 2-6; `npm run package`.
- Produces: the release run `<RUN>` (its workspace stays in the Windows Temp folder for Task 8), four theme images and the stacked icon sheet.

- [ ] **Step 1: Package the release candidate**

```bash
export PATH="$PATH:/mnt/c/Windows/System32:/mnt/c/Windows"
npm run package 2>&1 | grep -E '^Built|validation passed|Packaged|Normalized'
```

Expected: `Built 109 product icon drawings for 177 icon IDs in icons/witchynibbles-product-icons.woff`, the file-icon `Built 63 …` line, the theme build line, `✓ WitchyNibbles package validation passed (enforced: every stage)`, `DONE  Packaged: …/witchynibbles-theme-collection-2.0.0.vsix (203 files, …)`, `Normalized witchynibbles-theme-collection-2.0.0.vsix (203 files)`. The README is still 1.2.1's: this VSIX only feeds the captures, and no image shows the README.

- [ ] **Step 2: Dry-run the showcase, and measure the window**

```bash
export AGENT_BROWSER_SESSION=spellbound-release
node scripts/review/run-gate.mjs --job review/jobs/release.json --vsix witchynibbles-theme-collection-2.0.0.vsix --scenes=showcase
agent-browser session list
```

Expected: `1 contact sheets in …`, `Gate run complete: …/review-out/<dry run> (8 captures, 0 warnings)` (1 scene × 2 captures × 4 themes); `No active sessions`. Never paste the output of a failed run.

Run: `python3 -c "from PIL import Image; print(Image.open('review-out/<dry run>/captures/main/1/showcase/moonlit-candle/default/full.png').size)"`
Expected: `(1024, 768)`, VS Code's default window. Any width from 1000 to 1280 is VS Code's default for this display and is fine: note it for the QA README. If it reads `(1920, 1032)`, VS Code ignored `window.newWindowDimensions`: stop and ask the author whether to accept 1920×1032 images at 100% or to capture at 150% (`scales: [1.5]` in the generator and `"main" / "1.5"` in `release-images.py`); do not choose alone.

Open the four `full.png` with the Read tool. If a wait timed out instead, the run names the scene and the step. Fixes, in order:
- The showcase wait never passes while the focus diagnostics show the editor focused: the file-icon URL condition is the likely miss (the extension folder's name). Replace it in `showcaseWait` by `.includes('/icons/file-icons/dark/gem-cut.svg')`, update the matching assertion in `test/review-release.test.mjs`, regenerate, and rely on `manifest.installedVsix` for the version. Re-run.
- `rows.length` is one short because VS Code still compacted `.github` and `workflows` into one row: add `review/workspace-release/.github/CODEOWNERS` (one line, `# review fixture`), so `.github` has two children and cannot be compacted; regenerate (the fixture tests read the folder).
- A save dialog: the teardown's revert did not reach the unsaved editor. Add `...focusEditor` after `...open(DIRTY_FILE)` in the teardown and regenerate.

Every fix goes through the generator and its tests, never by editing `review/jobs/release.json`.

- [ ] **Step 3: Run the release job**

```bash
export AGENT_BROWSER_SESSION=spellbound-release
node scripts/review/run-gate.mjs --job review/jobs/release.json --vsix witchynibbles-theme-collection-2.0.0.vsix
agent-browser session list
```

Expected: `5 contact sheets in …`, `Gate run complete: …/review-out/<RUN> (40 captures, 0 warnings)` (5 scenes × 2 × 4 themes; a few minutes); `No active sessions`. Note `<RUN>`. Keep the pointer off the review window. Open `review-out/<RUN>/sheets/main-terminal-panel.png`: if the terminal shows a greeting, a prompt or an owner column, stop (Task 8's image would show the same) and report it to the author.

Run: `node -e "const m=require('./review-out/<RUN>/captures/manifest.json'); console.log(m.vscodeVersion, m.dryRun ?? 'full run', m.installedVsix.file, m.installedVsix.sha256 === require('crypto').createHash('sha256').update(require('fs').readFileSync('witchynibbles-theme-collection-2.0.0.vsix')).digest('hex'))"`
Expected: `1.141.0 full run witchynibbles-theme-collection-2.0.0.vsix true`.

- [ ] **Step 4: Assemble the theme images and the icon sheet**

```bash
RUN=review-out/<RUN>
python3 scripts/release/release-images.py themes "$RUN" assets/screenshots
python3 scripts/release/release-images.py sheet "$RUN" assets/screenshots/product-icons.png
ls -l assets/screenshots
```

Expected: four `assets/screenshots/<theme>.png: 1024x768` lines (or the size Step 2 measured), `assets/screenshots/product-icons.png: <w>x<h>` (about 976 wide and 1,300 tall: three panels of a title, a view header and 17 rows); each file well under 1 MB.

- [ ] **Step 5: Look at every image before anyone else does**

Open `assets/screenshots/moonlit-candle.png`, `moonlit.png`, `daydream.png`, `coven-contrast.png` and `product-icons.png` with the Read tool (crop and upscale 2× with PIL, nearest neighbour, where a detail is too small). Check, and note for the QA README:
- Each theme image: the activity bar shows the product icons (grimoire, scrying glass, sprig, spider, flask, rune tiles, witch hat, gear); the Explorer shows the fixture with the file icons (the `.github`, `assets`, `docs`, `scripts`, `src` and `tests` badges; vial, veil, owl, contract, recipe card, open grimoire, gem with a gear; in `src` the gem, the snake and the paintbrush); three tabs, `styles.css` with the ✦ and the pink top border, `familiars.ts` active; the breadcrumb ⋆; the TypeScript code in the theme's syntax colours (keywords bold, comments and the doc comment italic); Daydream shows the light file-icon set and Coven Contrast the high-contrast set.
- Nothing that does not belong: no toast, dialog, tooltip, hover or sign-in popup; the title reads `workspace`; no path, user or machine name anywhere.
- The icon sheet: three pages in order (`page 1 of 3` … `page 3 of 3`), every row whole, the 16 px glyphs crisp, nothing cut at a page edge.
- Known staging artifacts, not defects (they go in the QA README): the status bar's problem counts are the review helper's three sample problems on a `notes.md` that is not in this fixture; the panel's "Icon sheet" tab is the review helper's.

A wrong image is re-captured (Step 3 again, with the cause fixed in the generator), never edited.

- [ ] **Step 6: Scan them and keep the manifest**

```bash
mkdir -p docs/qa/2.0.0-release
cp review-out/<RUN>/captures/manifest.json docs/qa/2.0.0-release/manifest.json
chmod 644 assets/screenshots/*.png docs/qa/2.0.0-release/*
node scripts/review/privacy-scan.mjs assets/screenshots/moonlit-candle.png assets/screenshots/moonlit.png assets/screenshots/daydream.png assets/screenshots/coven-contrast.png assets/screenshots/product-icons.png docs/qa/2.0.0-release/manifest.json; echo "exit $?"
```

Expected: one `✓` per file and `exit 0` (exit 2 means the scan could not run: fix that, never skip it).

- [ ] **Step 7: Snapshot**

Run: `git add -A && git write-tree | tee review-out/rel/TREE_7`
Expected: one tree id. Leave `<RUN>`'s Windows workspace where it is: Task 8 lists it.

---

### Task 8: Windows Terminal beside the VS Code terminal

The VS Code half is the release run's `terminal` capture (Moonlit Candle, `minimumContrastRatio` 1). The Windows Terminal half is a new capture of witchyterm's Moonlit Candle profile running the same `scripts/ritual.fish` in the same folder: `<RUN>`'s workspace under `%LOCALAPPDATA%\Temp\spellbound-review\<RUN>\workspace`, which both terminals list with the same files, sizes and times. The capture needs the desktop free for about 15 seconds (a backdrop and a terminal window open and close).

**Files:**
- Create: `scripts/review/windows-terminal.ps1`, `assets/screenshots/terminal.png`, `docs/qa/2.0.0-release/README.md`

**Interfaces:**
- Consumes: `<RUN>` (Task 7), `scripts/release/release-images.py terminal`, `src/witchyterm-moonlit-candle.scheme.json`.
- Produces: `assets/screenshots/terminal.png`; the release QA README.

- [ ] **Step 1: Write the capture script**

Create `scripts/review/windows-terminal.ps1` (ASCII only: Windows PowerShell 5.1 reads a file without a byte-order mark as ANSI):

```powershell
# Captures Windows Terminal running the release terminal sample (spec 9): witchyterm's Moonlit Candle profile, wsl.exe
# in the release run's workspace, `fish -i -c "source scripts/ritual.fish"`, exactly what the VS Code terminal scene runs.
# A plain #0D0916 backdrop is shown behind the window first, so the profile's translucency shows the theme's own
# background and nothing from the desktop. Prints one line, "dpi=<n> size=<w>x<h>", and never a path.
# Usage (Windows PowerShell 5.1, from a copy under %TEMP%):
#   powershell.exe -NoProfile -ExecutionPolicy Bypass -File windows-terminal.ps1 -Workspace <dir> -Out <png>
param(
  [Parameter(Mandatory = $true)][string]$Workspace,
  [Parameter(Mandatory = $true)][string]$Out
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing, System.Windows.Forms
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class SpellboundWin {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern IntPtr FindWindow(string className, string title);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr window);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr window);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr window, uint message, IntPtr wParam, IntPtr lParam);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr window, int attribute, out RECT rect, int size);
}
'@
[SpellboundWin]::SetProcessDPIAware() | Out-Null

# The visible profile that uses witchyterm's scheme (witchyterm themes one profile, spec 3.1's pinned scheme).
$settingsFile = Join-Path $env:LOCALAPPDATA 'Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json'
$settings = ((Get-Content -Raw -Encoding UTF8 $settingsFile) -split "`n" | Where-Object { $_ -notmatch '^\s*//' }) -join "`n" | ConvertFrom-Json
$profiles = @($settings.profiles.list | Where-Object { $_.colorScheme -eq 'Moonlit Candle' -and -not $_.hidden })
if ($profiles.Count -ne 1) { throw "expected one visible Windows Terminal profile with the Moonlit Candle scheme, found $($profiles.Count)" }

$title = 'Spellbound ritual'
$backdrop = New-Object System.Windows.Forms.Form
$backdrop.FormBorderStyle = 'None'
$backdrop.StartPosition = 'Manual'
$backdrop.Bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$backdrop.BackColor = [System.Drawing.ColorTranslator]::FromHtml('#0D0916')
$backdrop.ShowInTaskbar = $false
$backdrop.Show()
[System.Windows.Forms.Application]::DoEvents()
try {
  Start-Process wt.exe -ArgumentList @('-w', 'new', '--pos', '120,120', '--size', '60,24', '-p', $profiles[0].guid, '--title', "`"$title`"",
    '--suppressApplicationTitle', 'wsl.exe', '--cd', "`"$Workspace`"", '-e', 'fish', '-i', '-c', '"source scripts/ritual.fish"')
  $window = [IntPtr]::Zero
  $deadline = (Get-Date).AddSeconds(30)
  while ($window -eq [IntPtr]::Zero -and (Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 250
    [System.Windows.Forms.Application]::DoEvents()
    $window = [SpellboundWin]::FindWindow($null, $title)
  }
  if ($window -eq [IntPtr]::Zero) { throw "no Windows Terminal window titled '$title' within 30 s" }
  [SpellboundWin]::SetForegroundWindow($window) | Out-Null
  # fish, eza and the swatches print within a few seconds; the ritual then sleeps, so the window stays as it is.
  for ($i = 0; $i -lt 40; $i++) { Start-Sleep -Milliseconds 250; [System.Windows.Forms.Application]::DoEvents() }
  # The window's own bounds without the drop shadow (DWMWA_EXTENDED_FRAME_BOUNDS).
  $rect = New-Object SpellboundWin+RECT
  [SpellboundWin]::DwmGetWindowAttribute($window, 9, [ref]$rect, [System.Runtime.InteropServices.Marshal]::SizeOf($rect)) | Out-Null
  $width = $rect.Right - $rect.Left
  $height = $rect.Bottom - $rect.Top
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $bitmap.Size)
  $bitmap.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
  "dpi=$([SpellboundWin]::GetDpiForWindow($window)) size=${width}x${height}"
  [SpellboundWin]::PostMessage($window, 0x10, [IntPtr]::Zero, [IntPtr]::Zero) | Out-Null # WM_CLOSE
} finally {
  $backdrop.Close()
}
```

Check that it parses (nothing runs) and is ASCII:

```bash
cp scripts/review/windows-terminal.ps1 review-out/rel/windows-terminal.ps1
(cd /mnt/c && powershell.exe -NoProfile -Command "\$e=\$null; \$t=\$null; [void][System.Management.Automation.Language.Parser]::ParseInput([IO.File]::ReadAllText('$(wslpath -w "$PWD/review-out/rel/windows-terminal.ps1")'), [ref]\$t, [ref]\$e); if (\$e.Count) { \$e | ForEach-Object { \$_.Message + ' line ' + \$_.Extent.StartLineNumber } } else { 'parsed: no errors' }")
grep -nP '[^\x00-\x7F]' scripts/review/windows-terminal.ps1; echo "non-ascii exit $?"
```

Expected: `parsed: no errors` (checked while planning); `non-ascii exit 1`.

- [ ] **Step 2: Capture Windows Terminal over the release run's folder**

Nothing else may use the desktop for 15 seconds, and no review run may be capturing. Paths stay in variables and are never printed:

```bash
export PATH="$PATH:/mnt/c/Windows/System32:/mnt/c/Windows"
RUN=<RUN>
LAD=$(wslpath -u "$(cd /mnt/c && cmd.exe /d /c 'echo %LOCALAPPDATA%' | tr -d '\r')")
WORK="$LAD/Temp/spellbound-review/$RUN"
test -f "$WORK/workspace/scripts/ritual.fish" && echo "release workspace found"
cp scripts/review/windows-terminal.ps1 "$WORK/windows-terminal.ps1"
(cd /mnt/c && powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(wslpath -w "$WORK/windows-terminal.ps1")" -Workspace "$(wslpath -w "$WORK/workspace")" -Out "$(wslpath -w "$WORK/windows-terminal.png")") 2>&1 | tail -1 | grep -E '^dpi=' || echo "capture failed: read the Windows error in this shell only, never in a tracked file"
cp "$WORK/windows-terminal.png" "review-out/$RUN/windows-terminal.png"
```

Expected: `release workspace found`, then `dpi=96 size=<w>x<h>` (about 600 wide and 500 tall: 60×24 cells of Maple Mono NF 12 pt, the tab bar and the frame). Note the line for the QA README.

Open `review-out/<RUN>/windows-terminal.png` with the Read tool. It must show: the tab "Spellbound ritual"; the `ll` rows of the release folder (`.github`, `assets`, `docs`, `scripts`, `src`, `tests`, `.env.example`, `.gitignore`, `CHANGELOG.md`, `LICENSE`, `package.json`, `README.md`, `tsconfig.json`) with eza's icons and no owner column; the eight lines of colour names and swatches; the moon background image faint in a corner; no greeting, no prompt, nothing of the desktop behind the frame.

If the script failed, or the window shows anything else (a greeting, a prompt, another profile, a path), do not retry blindly and do not take a screenshot by other means: stop and report to the author what was seen. The hand fallback (a Win+Shift+S window snip of the same `wt.exe` command) is the author's to take.

If `dpi=` is not `96`, the display is scaled and the two halves draw 12 pt at different pixel sizes. Note it; the composite stays two real captures, each at its own scale, and the QA README says so.

- [ ] **Step 3: Place the two terminals side by side, and measure the colours**

```bash
RUN=review-out/<RUN>
python3 scripts/release/release-images.py terminal "$RUN" "$RUN/windows-terminal.png" assets/screenshots/terminal.png
```

Expected: `assets/screenshots/terminal.png: <W>x<H>` (about 1,230 wide), then `VS Code <n> px | gutter 24 px | Windows Terminal <m> px` with `n` equal to `m` (the VS Code panel is wider and is cut to Windows Terminal's width). Note `n`.

Measure which of witchyterm's 16 colours appear exactly in each half (`<n>` from the line above):

```bash
python3 - assets/screenshots/terminal.png <n> <<'EOF'
import json, sys
from PIL import Image
scheme = json.load(open('src/witchyterm-moonlit-candle.scheme.json'))
image = Image.open(sys.argv[1]).convert('RGB')
split = int(sys.argv[2])
def colours(box):
    return {'#%02X%02X%02X' % rgb for _, rgb in image.crop(box).getcolors(1 << 24)}
left, right = colours((0, 0, split, image.height)), colours((split + 24, 0, image.width, image.height))
for name in ['black', 'red', 'green', 'yellow', 'blue', 'purple', 'cyan', 'white']:
    for field in (name, 'bright' + name.capitalize()):
        print(f"{field:14} {scheme[field]}  VS Code {'yes' if scheme[field] in left else 'no'}  Windows Terminal {'yes' if scheme[field] in right else 'no'}")
EOF
```

Expected: `VS Code yes` on all 16 lines (gate 1 measured that VS Code draws witchyterm's colours exactly at contrast 1; a `no` there is a finding: stop and report it). On the Windows Terminal side, text colours read `yes`; a colour that occurs only as a swatch background may read `no`, because the profile's 93% opacity blends cell backgrounds with the backdrop. Record the 16 lines in the QA README.

Open `assets/screenshots/terminal.png` with the Read tool: VS Code's panel (tab icons, the terminal) on the left, Windows Terminal on the right, the same rows in the same colours, no owner column, no prompt, no path.

- [ ] **Step 4: Write `docs/qa/2.0.0-release/README.md`**

Fill the angle-bracket fields from Tasks 7 and 8; every other line is final text.

````markdown
# Spellbound Themes 2.0.0: the Marketplace images

- Release run: <RUN> · VS Code <version> (<commit dir>) · device-scale 100% · window <w>×<h> · repo <commit> (dirty: the release work is uncommitted) · installed VSIX witchynibbles-theme-collection-2.0.0.vsix, sha256 <sha256 of the release candidate>
- Reproduce: `node scripts/review/release-job.mjs` (writes review/jobs/release.json), `npm run package`, `node scripts/review/run-gate.mjs --job review/jobs/release.json --vsix witchynibbles-theme-collection-2.0.0.vsix`; Windows Terminal: `scripts/review/windows-terminal.ps1`; the images: `python3 scripts/release/release-images.py` (plan: docs/superpowers/plans/2026-10-11-spellbound-2-release.md, Tasks 5-8).
- `manifest.json` here lists the run's 40 captures with their sha256. Raw captures and contact sheets are not committed.

## The images

- `moonlit-candle.png`, `moonlit.png`, `daydream.png`, `coven-contrast.png`: the showcase scene's full window in each color theme (`captures/main/1/showcase/<theme>/default/full.png`), pixels unchanged.
- `product-icons.png`: the review helper's icon sheet, every product icon drawing at 16 px with its name and IDs, in Moonlit Candle; its three pages (`icon-sheet`, `icon-sheet-2`, `icon-sheet-3`, crop `panel`), each cut 8 px below its last row, stacked.
- `terminal.png`: left, VS Code's integrated terminal (`terminal`, crop `panel`, Moonlit Candle; `terminal.integrated.minimumContrastRatio` 1, Maple Mono NF 16 px, line height 1.1; panel tabs as icons), cut 8 px below its last row and to the width of the right half; right, Windows Terminal with witchyterm's Moonlit Candle profile (Maple Mono NF 12 pt, 93% acrylic over a `#0D0916` backdrop, the moon background image at 12%), <dpi> dpi, <w>×<h>. Both run `scripts/ritual.fish` in the run's workspace: witchyterm's `ll --no-user`, then the 16 colours.

## Seen

- <one line per image, from Task 7 Step 5 and Task 8 Steps 2-3>
- Exact colours (Task 8 Step 3): <the 16 lines>

## Known staging artifacts (not defects)

- The status bar's problem counts are the review helper's three sample problems (on a `notes.md` outside this fixture).
- The panel's "Icon sheet" tab and the icon sheet itself are the review helper's; they are not part of the extension.
- `styles.css` is left unsaved on purpose: the ✦ and the pink border the README recommends.

## Privacy

Every image, this README and the manifest passed `node scripts/review/privacy-scan.mjs` and were checked by eye: no user name, path, machine name or e-mail; `ll` shows no owner column; neither terminal draws a prompt.
````

- [ ] **Step 5: Scan and snapshot**

```bash
node scripts/review/privacy-scan.mjs assets/screenshots/terminal.png docs/qa/2.0.0-release/README.md; echo "exit $?"
git add -A && git write-tree | tee review-out/rel/TREE_8
```

Expected: two `✓` lines, `exit 0`; one tree id.

---

## Part C: the words, the package, the review

### Task 9: README and CHANGELOG 2.0.0

**Files:**
- Modify: `README.md` (rewritten), `CHANGELOG.md` (the 2.0.0 entry on top)
- Create: `test/release-docs.test.mjs`

**Interfaces:**
- Consumes: `package.json` (`publisher`, `name`, `version`, `contributes`); `icons/product-icon-baseline-1.2.1.json` (the 48 IDs of 1.2.1), `icons/product-icon-theme.json`, `icons/product-icon-map.json`, `icons/file-icon-map.json`, `icons/file-icon-theme.json`; the six images.
- Produces: the README of spec 9 and the CHANGELOG entry with "Upgrading from 1.x".

- [ ] **Step 1: Write the failing tests**

Create `test/release-docs.test.mjs`:

```js
// Spec 9: the README and the CHANGELOG entry of 2.0.0 (the GitHub release notes are pinned in test/release-notes.test.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const pkg = json('package.json');
const SCREENSHOTS = ['moonlit-candle', 'moonlit', 'daydream', 'coven-contrast', 'product-icons', 'terminal'].map((name) => `assets/screenshots/${name}.png`);

test('the README shows the six Marketplace images in order, each a PNG of Marketplace size, and assets/screenshots/ holds nothing else', () => {
  assert.deepEqual([...read('README.md').matchAll(/!\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]), SCREENSHOTS);
  assert.deepEqual(fs.readdirSync(path.join(root, 'assets', 'screenshots')).sort(), SCREENSHOTS.map((file) => path.basename(file)).sort());
  for (const file of SCREENSHOTS) {
    const png = fs.readFileSync(path.join(root, file));
    assert.equal(png.readUInt32BE(0), 0x89504e47, file);
    const [width, height] = [png.readUInt32BE(16), png.readUInt32BE(20)];
    assert.ok(width >= 600 && width <= 1920 && height <= 2000, `${file}: ${width}x${height}`);
    assert.ok(png.length <= 1024 * 1024, `${file}: ${png.length} bytes`);
  }
});

test('the README settings name the contributed themes and recommend highlighted unsaved tabs and Maple Mono NF (spec 3.1, 3.3, 9)', () => {
  const block = read('README.md').match(/```jsonc\n([\s\S]*?)\n```/)[1];
  const settings = JSON.parse(block.split('\n').filter((line) => !line.trim().startsWith('//')).join('\n'));
  assert.ok(pkg.contributes.themes.some(({ label }) => label === settings['workbench.colorTheme']), settings['workbench.colorTheme']);
  assert.equal(settings['workbench.iconTheme'], pkg.contributes.iconThemes[0].id);
  assert.equal(settings['workbench.productIconTheme'], pkg.contributes.productIconThemes[0].id);
  assert.equal(settings['workbench.editor.highlightModifiedTabs'], true);
  assert.match(settings['editor.fontFamily'], /^'Maple Mono NF'/);
  assert.equal(settings['terminal.integrated.minimumContrastRatio'], undefined, 'documented on its own: it lowers contrast');
});

test('the README documents the exact-match terminal setting, the moon image difference, the logo rule and every way to install (spec 1, 6, 9)', () => {
  const readme = read('README.md');
  for (const text of [
    '"terminal.integrated.minimumContrastRatio": 1', 'The extension does not set it', 'moon background image',
    'original drawings', 'not affiliated with', 'Maple Mono NF',
    `https://marketplace.visualstudio.com/items?itemName=${pkg.publisher}.${pkg.name}`, `code --install-extension ${pkg.publisher}.${pkg.name}`,
    'https://github.com/WitchyNibbles/Spellbound-Themes/releases', `${pkg.name}-${pkg.version}.vsix`, 'Install Another Version',
    'npm ci', 'npm run validate', 'npm run package',
  ]) assert.ok(readme.includes(text), text);
  assert.equal(pkg.contributes.configurationDefaults, undefined, 'the package sets no setting (spec 1)');
});

test('CHANGELOG 2.0.0 comes first, counts the drawings, and its upgrade note names each theme\'s changes, every dropped icon key and the way back (spec 5.1, 9)', () => {
  const changelog = read('CHANGELOG.md');
  assert.match(changelog.split('\n').find((line) => line.startsWith('## ')), /^## 2\.0\.0 — \d{4}-\d{2}-\d{2}$/);
  const entry = changelog.slice(changelog.indexOf('## 2.0.0'), changelog.indexOf('## 1.2.1'));
  const upgrade = entry.slice(entry.indexOf('### Upgrading from 1.x'));
  assert.ok(entry.includes('### Upgrading from 1.x'));
  const ids = Object.keys(json('icons/product-icon-theme.json').iconDefinitions);
  const dropped = Object.keys(json('icons/product-icon-baseline-1.2.1.json').svg_sha256).map((file) => file.replace(/\.svg$/, '')).filter((id) => !ids.includes(id));
  assert.equal(dropped.length, 12, dropped.join(', '));
  for (const id of dropped) assert.ok(upgrade.includes(`\`${id}\``), id);
  for (const text of ['Moonlit:', 'Daydream:', 'Coven Contrast:', '#0D0916', '#08060D', '#74E8B8', '#FFB86B', 'Install Another Version', '1.2.1']) assert.ok(upgrade.includes(text), text);
  const theme = json('icons/file-icon-theme.json');
  const count = (key) => Object.keys(theme[key]).length;
  assert.ok(entry.includes(`${Object.keys(json('icons/product-icon-map.json').drawings).length} drawings for ${ids.length} icon IDs`));
  assert.ok(entry.includes(`${Object.keys(json('icons/file-icon-map.json').drawings).length} drawings for ${count('fileExtensions')} file extensions, ${count('fileNames')} file names and ${count('folderNames')} folder names`));
  assert.ok(entry.includes('Moonlit Candle'));
});
```

The twelve dropped keys are derived, not listed: the 1.2.1 baseline's 48 IDs minus the 2.0 theme's, which gives `home`, `activity-bar-left`, `activity-bar-right`, `menu`, `copy`, `edit`, `save`, `file`, `folder`, `layout-sidebar-left`, `layout-sidebar-right`, `layout-panel` (spec 5.1; measured while planning).

Run: `node --test test/release-docs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ tests 4`, `ℹ pass 0`, `ℹ fail 4`.

- [ ] **Step 2: Measure the counts the CHANGELOG states**

Run: `node -e "const j=(f)=>require('./'+f); const t=j('icons/file-icon-theme.json'); console.log(Object.keys(j('icons/product-icon-map.json').drawings).length, Object.keys(j('icons/product-icon-theme.json').iconDefinitions).length, Object.keys(j('icons/file-icon-map.json').drawings).length, ...['fileExtensions','fileNames','folderNames'].map((k)=>Object.keys(t[k]).length))"`
Expected: `109 177 63 57 27 19` (gate 6's plan). If gate 6's decisions changed a number, use the measured one in Step 4's text.

- [ ] **Step 3: Rewrite `README.md`**

Replace the whole file with (every line is final text):

````markdown
# WitchyNibbles Spellbound Themes

Four VS Code color themes, a file icon theme and a product icon theme that share one witchy palette. The flagship, **Moonlit Candle**, is the palette of [witchyterm](https://github.com/WitchyNibbles/moonlit-candle), the same theme for Claude Code, Windows Terminal and fish: candle gold for what is active, pink for what needs you, lavender for selection and focus, on a deep moonlit night.

![WitchyNibbles Moonlit Candle with the WitchyNibbles file and product icons in VS Code](assets/screenshots/moonlit-candle.png)

## The color themes

- **WitchyNibbles Moonlit Candle** (dark): gold `#FFD477` for the active tab, buttons and functions, pink `#FF67B7` for badges and the cursor, lavender `#B99AFF` for selection, keywords and focus, mint for added, amber for modified, rose for errors. Its integrated terminal is witchyterm's Moonlit Candle scheme, colour for colour.
- **WitchyNibbles Moonlit** (dark): the same night with neon pink accents, mint for added and amber for warnings, and the same terminal colours.
- **WitchyNibbles Daydream** (light): pale lilac surfaces with deep purple text.
- **WitchyNibbles Coven Contrast** (high contrast): black surfaces, white borders, pink focus.

In all four, only keywords are bold; comments, documentation and storage modifiers are italic.

![WitchyNibbles Moonlit](assets/screenshots/moonlit.png)

![WitchyNibbles Daydream](assets/screenshots/daydream.png)

![WitchyNibbles Coven Contrast](assets/screenshots/coven-contrast.png)

## The icons

**WitchyNibbles Icons**, the file icon theme, draws each file type as a small object, coloured by what it holds: code lavender, data gold, style pink, tests mint, config muted, docs ivory, images and fonts cyan. Folders carry a badge for their contents. A dark, a light and a high-contrast set follow the color theme.

**WitchyNibbles Product Icons**, the product icon theme, redraws the icons of the workbench: the 132 icons VS Code 1.141 shows in a normal session, from the activity bar to the debug toolbar, and 45 related ones. Icons outside that set keep VS Code's own.

![Every WitchyNibbles product icon in VS Code at 16px, in Moonlit Candle](assets/screenshots/product-icons.png)

The file and product icons are original drawings made for this extension. A file icon may echo a language's name, never its logo, and the icons are not affiliated with or endorsed by any language, framework or tool.

| Icon | Means |
| :- | :- |
| ✦ | needs attention or changed: an unsaved tab, notifications, a dirty branch |
| ✧ cluster | AI actions |
| candle | an idea or a code action (the light bulb) |
| full moon | here, a stop point: breakpoints and the current step |
| sprig | a branch, source control |
| cat | helpers and familiars: chat and Copilot |
| owl | time: the timeline, the changelog |
| skull | failure or error; danger or a secret |
| flask | testing |
| broom | clearing |
| ⋆ | a separator |

## Settings

Pick the themes with **Preferences: Color Theme**, **Preferences: File Icon Theme** and **Preferences: Product Icon Theme**, or add them to your `settings.json` with the two settings the themes cannot set for you:

```jsonc
{
  "workbench.colorTheme": "WitchyNibbles Moonlit Candle",
  "workbench.iconTheme": "witchynibbles-icons",
  "workbench.productIconTheme": "witchynibbles-product-icons",
  // Unsaved tabs get Moonlit Candle's pink border (VS Code's default is false).
  "workbench.editor.highlightModifiedTabs": true,
  // witchyterm's font, with its italics. Install Maple Mono NF first.
  "editor.fontFamily": "'Maple Mono NF', Consolas, monospace",
  "terminal.integrated.fontFamily": "'Maple Mono NF'"
}
```

[Maple Mono NF](https://github.com/subframe7536/maple-font) is the font witchyterm uses; a color theme cannot choose a font, so it is a recommendation.

## The terminal

Moonlit Candle and Moonlit give the integrated terminal witchyterm's Windows Terminal scheme: the background, foreground, cursor, selection and all 16 ANSI colours. VS Code lightens text it finds too dim (`terminal.integrated.minimumContrastRatio`, 4.5 by default), and witchyterm's black `#1D1230` and bright black `#6E5A80` are dim on purpose. For colours that match Windows Terminal exactly, add:

```json
"terminal.integrated.minimumContrastRatio": 1
```

The extension does not set it for you: at 1, dim text keeps witchyterm's low contrast.

![witchyterm's ll and the 16 ANSI colours: VS Code's terminal on the left, Windows Terminal on the right](assets/screenshots/terminal.png)

Left, VS Code's integrated terminal in Moonlit Candle with `terminal.integrated.minimumContrastRatio` at 1; right, Windows Terminal with witchyterm's Moonlit Candle profile. Both run witchyterm's `ll` in the same folder, then print the 16 colours.

Known differences:

- Windows Terminal draws witchyterm's moon background image and its translucency; VS Code's terminal has no background image, so it is plain `#0D0916`.
- The unsaved-tab ✦ takes the tab's text colour, because no theme colour reaches it; the pink comes from the tab border above.

## Install

- **Visual Studio Marketplace:** search for WitchyNibbles Spellbound Themes in the Extensions view, open the [Marketplace page](https://marketplace.visualstudio.com/items?itemName=EimiMartinez.witchynibbles-theme-collection), or run `code --install-extension EimiMartinez.witchynibbles-theme-collection`.
- **GitHub Releases:** download `witchynibbles-theme-collection-2.0.0.vsix` from [Releases](https://github.com/WitchyNibbles/Spellbound-Themes/releases), then run **Extensions: Install from VSIX...** in VS Code, or `code --install-extension witchynibbles-theme-collection-2.0.0.vsix`.
- **Back to 1.2.1:** in the Extensions view, open the gear menu of WitchyNibbles Spellbound Themes, choose **Install Another Version...** and pick 1.2.1. The [CHANGELOG](CHANGELOG.md) lists what changed.

Requires VS Code 1.100 or later; the icons are drawn for VS Code 1.141.

## Build locally

```sh
npm ci
npm run validate
npm run package
```

`npm run package` builds the themes and icons, runs every validation check (`validate --release`), and packages `witchynibbles-theme-collection-2.0.0.vsix` with fixed timestamps, so the same source gives the same bytes. It does not publish. `npm test` runs the unit tests; the review-harness tests expect WSL with Windows interop, and one test compares the terminal scheme with a witchyterm checkout beside this one (`../witchyterm`) when there is one.

The screenshots are taken in VS Code 1.141 by the review harness (`review/jobs/release.json`) and served from `assets/screenshots/` in this repository.

## License

MIT. [LICENSE.md](LICENSE.md).
````

Check that the three outside links still resolve: `gh repo view WitchyNibbles/moonlit-candle --json visibility -q .visibility` (`PUBLIC`), `gh repo view subframe7536/maple-font --json name -q .name` (`maple-font`), `npx vsce show EimiMartinez.witchynibbles-theme-collection | head -1` (`WitchyNibbles Spellbound Themes`; all three checked while planning).

- [ ] **Step 4: Add the CHANGELOG entry**

In `CHANGELOG.md`, insert this after the `# Changelog` line and its blank line, before `## 1.2.1 — 2026-09-26`. Fill `<date>` with `date +%F`; the six counts are Step 2's:

```markdown
## 2.0.0 — <date>

Spellbound Themes 2.0 shares witchyterm's Moonlit Candle palette and redraws every icon.

- **New color theme, WitchyNibbles Moonlit Candle**, first in the list: candle gold `#FFD477` for what is active, pink `#FF67B7` for what needs you, lavender `#B99AFF` for selection and focus, mint for added, amber for modified, on Moonlit's night surfaces. Its integrated terminal is witchyterm's Moonlit Candle scheme.
- **Product icons redrawn from scratch:** 109 drawings for 177 icon IDs, every icon of a normal VS Code 1.141 session. Moons mark breakpoints, a candle the code actions, a cat chat and Copilot, a ✦ the unsaved tab.
- **File icons redrawn as objects coloured by category** (code, data, style, tests, config, docs, assets), with badged folders: 63 drawings for 57 file extensions, 27 file names and 19 folder names, in dark, light and high-contrast sets. They are original drawings: they echo a language's name, never its logo.
- **Typography in all four themes:** only keywords are bold; comments, documentation and storage modifiers are italic.
- The README recommends `workbench.editor.highlightModifiedTabs` and Maple Mono NF, and documents `terminal.integrated.minimumContrastRatio: 1` for colours that match Windows Terminal exactly.

### Upgrading from 1.x

The Marketplace updates the extension across major versions, so this is the only warning you get. What changes:

- Moonlit: functions, classes, types and constants are no longer bold. Added and untracked files are mint `#74E8B8` (were cyan `#74D7E8`), warnings amber `#FFB86B` (were gold `#FFD477`). The integrated terminal takes witchyterm's scheme: background `#0D0916` (was `#08060D`), foreground `#F3EAF7`, selection `#633B79` and all 16 ANSI colours. Debug stack frames are pink `#FF67B7` (current) and lavender `#B99AFF`.
- Daydream: the same bold and italic changes. Added and untracked files are dark mint `#0E7553` (were teal `#197F91`); input borders are `#8E78A6`, so they reach 3:1. Debug stack frames are `#B52776` and `#7042B2`.
- Coven Contrast: the same bold and italic changes. The focused row of a quick pick is pink `#FF67B7` with black text and icons. Debug stack frames are `#FF67B7` and `#D0B8FF`.
- Product icon keys dropped, so these fall back to VS Code's Codicons: `home`, `activity-bar-left`, `activity-bar-right`, `menu`, `copy`, `edit`, `save`; `file` and `folder` (the theme maps `symbol-file` and `symbol-folder` instead); `layout-sidebar-left`, `layout-sidebar-right` and `layout-panel` (the theme maps VS Code's registered layout toggles instead).
- Every file icon is new. `vite.config.ts` has no icon of its own any more (it shows the TypeScript gem), and icons that other extensions contribute for languages no longer show through (`showLanguageModeIcons` is off).
- To keep 1.2.1: in the Extensions view, open the gear menu of WitchyNibbles Spellbound Themes, choose **Install Another Version...** and pick 1.2.1; if VS Code offers 2.0.0 again, turn off **Auto Update** for the extension in the same menu. The 1.2.1 VSIX also stays on [GitHub Releases](https://github.com/WitchyNibbles/Spellbound-Themes/releases/tag/v1.2.1).

```

Every theme value above was measured while planning by diffing `main`'s theme files against `spellbound-2.0`'s (gate 6 changes no theme). Check them again: `git diff main -- themes/WitchyNibbles-color-theme-dark.json themes/WitchyNibbles-color-theme-light.json themes/WitchyNibbles-color-theme-high-contrast.json | grep -E '^[-+] ' | grep -iE 'added|warning|terminal\.(background|foreground|selection)|stackframe|input\.border|quickInputList' | head -40`.

- [ ] **Step 5: Run the tests, scan the texts**

```bash
node --test test/release-docs.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/review/privacy-scan.mjs README.md CHANGELOG.md; echo "exit $?"
```

Expected: `ℹ tests 4`, `ℹ pass 4`; `ℹ tests B+21`, `ℹ fail 0`; two `✓` lines, `exit 0` (both texts passed the scan while planning).

- [ ] **Step 6: Snapshot**

Run: `git add -A && git write-tree | tee review-out/rel/TREE_9`
Expected: one tree id.

---

### Task 10: Build and verify the VSIX; release notes

**Files:**
- Modify: `scripts/verify-live-readme-images.py` (rewritten), `docs/qa/2.0.0-release/README.md` (the install-check line)
- Create: `docs/release/2.0.0.md`, `test/release-notes.test.mjs`

**Interfaces:**
- Consumes: everything above.
- Produces: `witchynibbles-theme-collection-2.0.0.vsix` (git-ignored; the file the author publishes) and its SHA-256 in `docs/release/2.0.0.md`; `python3 scripts/verify-live-readme-images.py [--offline]`.

- [ ] **Step 1: Generalize the image check (R7)**

Replace the whole of `scripts/verify-live-readme-images.py` with:

```python
"""Check that every image the packaged README shows equals the committed file, and is live on GitHub (spec 9).

The Marketplace page and VS Code's extension page load the README images from raw.githubusercontent.com/.../main,
because the VSIX does not ship them. Run it with --offline before the push (the files are compared with the index),
and without it after the release commit is on origin/main and before `vsce publish` (compared with HEAD and fetched).
It prints a JSON report. Exit 0: every image matches. raw.githubusercontent.com caches for about five minutes: if a
fetch still returns 1.2.1's image, run it again after that.
Usage: python3 scripts/verify-live-readme-images.py [--offline]
"""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.request import urlopen
from zipfile import ZipFile

if sys.argv[1:] not in ([], ["--offline"]):
    raise SystemExit(__doc__)
OFFLINE = sys.argv[1:] == ["--offline"]
ROOT = Path(__file__).resolve().parent.parent
PACKAGE = json.loads((ROOT / "package.json").read_text())
VSIX = ROOT / f"{PACKAGE['name']}-{PACKAGE['version']}.vsix"
BASE = re.search(r"--baseImagesUrl (\S+)", PACKAGE["scripts"]["package"]).group(1) + "/"
IMAGE = re.compile(r"!\[[^\]]*\]\(([^)\s]+)\)")


def digest(data: bytes) -> str:
    return sha256(data).hexdigest()


def git(*args: str) -> bytes:
    return subprocess.run(["git", *args], cwd=ROOT, check=True, capture_output=True).stdout


with ZipFile(VSIX) as package:
    readme = package.read("extension/readme.md")
packed = IMAGE.findall(readme.decode())
expected = [BASE + path for path in IMAGE.findall((ROOT / "README.md").read_text())]
if not expected or packed != expected:
    raise SystemExit(f"The packaged README shows {packed}; README.md shows {expected}")
results = []
for url in packed:
    path = url.removeprefix(BASE)
    committed = git("show", f"{'' if OFFLINE else 'HEAD'}:{path}")
    if (ROOT / path).read_bytes() != committed:
        raise SystemExit(f"{path} differs from its {'staged' if OFFLINE else 'committed'} version")
    result = {"url": url, "path": path, "sha256": digest(committed)}
    if not OFFLINE:
        with urlopen(url, timeout=15) as response:
            body = response.read()
            result |= {"http_status": response.status, "remote_sha256": digest(body), "body_match": body == committed}
        if result["http_status"] != 200 or not result["body_match"]:
            raise SystemExit(f"The live image differs from the committed file: {url}")
    results.append(result)
report = {
    "invocation": "python3 scripts/verify-live-readme-images.py" + (" --offline" if OFFLINE else ""),
    "checked_at_utc": datetime.now(timezone.utc).isoformat(),
    "commit": git("rev-parse", "HEAD").decode().strip(),
    "vsix": VSIX.name,
    "vsix_sha256": digest(VSIX.read_bytes()),
    "packed_readme_sha256": digest(readme),
    "results": results,
}
if not OFFLINE:
    report["origin_main"] = git("rev-parse", "origin/main").decode().strip()
    if report["origin_main"] != report["commit"]:
        raise SystemExit("HEAD is not origin/main: push the release commit first")
print(json.dumps(report, indent=2))
```

`scripts/verify-icon-release.py` stays as it is: it verifies the 1.2.1 release only and is not run for 2.0.0 (R7).

- [ ] **Step 2: Package, and check that the build changed nothing**

```bash
export PATH="$PATH:/mnt/c/Windows/System32:/mnt/c/Windows"
npm run package 2>&1 | grep -E 'validation passed|Packaged|Normalized'
git add -A && git diff --cached --stat $(cat review-out/rel/TREE_9) -- themes icons | wc -l
```

Expected: `✓ WitchyNibbles package validation passed (enforced: every stage)`, `DONE  Packaged: …/witchynibbles-theme-collection-2.0.0.vsix (203 files, …)`, `Normalized witchynibbles-theme-collection-2.0.0.vsix (203 files)`; `0` (the build reproduced every committed theme and icon file).

- [ ] **Step 3: List the VSIX against the allowlist, read its manifest, size it**

```bash
python3 - witchynibbles-theme-collection-2.0.0.vsix <<'EOF'
import re, sys, zipfile
z = zipfile.ZipFile(sys.argv[1])
names = z.namelist()
allowed = [r'\[Content_Types\]\.xml', r'extension\.vsixmanifest', r'extension/(package\.json|readme\.md|changelog\.md|LICENSE\.md)',
           r'extension/themes/WitchyNibbles-color-theme-(moonlit-candle|dark|light|high-contrast)\.json', r'extension/assets/witchynibbles\.png',
           r'extension/icons/(product-icon-theme\.json|witchynibbles-product-icons\.woff|file-icon-theme\.json)',
           r'extension/icons/file-icons/(dark|light|high-contrast)/[a-z0-9-]+\.svg']
print('outside the allowlist:', [n for n in names if not any(re.fullmatch(a, n) for a in allowed)])
print('never shipped:', [n for n in names if re.search(r'(^|/)(review|review-out|docs|scripts|test|\.superpowers|file-src|product-src|product-src-variants|screenshots)/', n)])
manifest = z.read('extension.vsixmanifest').decode()
print(len(names), 'files;', re.search(r'<Identity [^>]*Version="([^"]+)"', manifest).group(1), re.findall(r'Branding\.\w+" Value="([^"]+)"', manifest))
print('tags:', re.search(r'<Tags>([^<]*)</Tags>', manifest).group(1))
EOF
stat -c %s witchynibbles-theme-collection-2.0.0.vsix
```

Expected: `outside the allowlist: []`, `never shipped: []`, `203 files; 2.0.0 ['#0D0916', 'dark']`, `tags: theme,dark theme,light theme,high contrast,witchy,moonlit candle,candle,gold,purple,file icons,product icons,icon theme,color-theme,icon-theme,product-icon-theme,__web_extension`; a size under 524288 (about 0.2 MB: 137 KB was measured with gate 5's 27 resolved icons, and gate 6's 162 more add about 60 KB).

- [ ] **Step 4: Check that it is reproducible**

```bash
cp witchynibbles-theme-collection-2.0.0.vsix review-out/rel/first.vsix
npm run package > /dev/null 2>&1
sha256sum review-out/rel/first.vsix witchynibbles-theme-collection-2.0.0.vsix | cut -d' ' -f1 | uniq | wc -l
```

Expected: `1` (the same bytes; checked while planning on two packagings of a copy of HEAD).

- [ ] **Step 5: Install the packaged VSIX into a fresh VS Code profile**

```bash
export AGENT_BROWSER_SESSION=spellbound-release
node scripts/review/run-gate.mjs --job review/jobs/release.json --vsix witchynibbles-theme-collection-2.0.0.vsix --scenes=showcase
agent-browser session list
```

Expected: `Gate run complete: …/review-out/<install run> (8 captures, 0 warnings)`; `No active sessions`. The run installs the exact VSIX with VS Code's own `--install-extension` into a new `--user-data-dir` and `--extensions-dir`, and it passes only if the product icon font is `witchynibbles-product-icons` at launch; if, for each of the four themes, `--vscode-editor-background` and `--vscode-activityBar-activeBorder` equal that theme's values (all four color themes load); and if the showcase's file icons are drawn from the `…witchynibbles-theme-collection-2.0.0/icons/file-icons/` folder (the file icon theme loads). It is marked `dryRun` (one scene): an install check, not image evidence.

Run: `node -e "const m=require('./review-out/<install run>/captures/manifest.json'); console.log(m.installedVsix.sha256 === require('crypto').createHash('sha256').update(require('fs').readFileSync('witchynibbles-theme-collection-2.0.0.vsix')).digest('hex'), m.warnings.length)"`
Expected: `true 0`. Open the run's four `full.png` with the Read tool: each matches its committed image in `assets/screenshots/` (the same workbench; the cursor may blink differently).

Add this line to `docs/qa/2.0.0-release/README.md`, after the "Release run" line:

```markdown
- Install check: run <install run>, the packaged witchynibbles-theme-collection-2.0.0.vsix (sha256 <sha256>) installed with `--install-extension` into a fresh profile; the four color themes, the product icon font and the 2.0.0 file icons loaded (`--scenes=showcase`, 8 captures, 0 warnings).
```

- [ ] **Step 6: Check the README images offline**

```bash
git add -A
python3 scripts/verify-live-readme-images.py --offline | python3 -c "import json,sys; r=json.load(sys.stdin); print(r['vsix'], len(r['results']), [x['path'].split('/')[-1] for x in r['results']])"
```

Expected: `witchynibbles-theme-collection-2.0.0.vsix 6 ['moonlit-candle.png', 'moonlit.png', 'daydream.png', 'coven-contrast.png', 'product-icons.png', 'terminal.png']`: the packaged README points at exactly the six staged images (checked while planning on a copy).

- [ ] **Step 7: Write the release notes and their test**

Create `test/release-notes.test.mjs`:

```js
// Spec 9: the GitHub release notes of 2.0.0 (docs/release/2.0.0.md, the body of `gh release create`).
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const vsix = `${pkg.name}-${pkg.version}.vsix`;

test('the release notes name the VSIX and its SHA-256, which matches the VSIX built here when there is one', () => {
  const notes = fs.readFileSync(path.join(root, 'docs', 'release', `${pkg.version}.md`), 'utf8');
  assert.match(notes, new RegExp(`^# WitchyNibbles Spellbound Themes ${pkg.version.replaceAll('.', '\\.')}$`, 'm'));
  assert.ok(notes.includes(`Asset: \`${vsix}\``));
  const [, sha] = notes.match(/^SHA-256: `([0-9a-f]{64})`$/m) ?? [];
  assert.ok(sha, 'a SHA-256 line');
  for (const text of ['https://github.com/WitchyNibbles/Spellbound-Themes/blob/main/CHANGELOG.md', 'Install Another Version', 'releases/tag/v1.2.1']) assert.ok(notes.includes(text), text);
  // npm run package is reproducible (scripts/normalize-vsix.mjs), so a rebuild of the same tree keeps this SHA.
  if (fs.existsSync(path.join(root, vsix))) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, vsix))).digest('hex'), sha, `${vsix} was rebuilt from a different tree`);
});
```

Run: `node --test test/release-notes.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
Expected: `ℹ fail 1` (no notes yet).

Create `docs/release/2.0.0.md`, with `<sha256>` the output of `sha256sum witchynibbles-theme-collection-2.0.0.vsix | cut -d' ' -f1` (the notes live under `docs/`, which the VSIX does not ship, so writing them does not change the VSIX):

```markdown
# WitchyNibbles Spellbound Themes 2.0.0

Spellbound Themes 2.0 shares witchyterm's Moonlit Candle palette and redraws every icon.

- **New: WitchyNibbles Moonlit Candle**, first in the theme list: candle gold for what is active, pink for what needs you, lavender for selection, on a deep moonlit night. Its integrated terminal is witchyterm's Moonlit Candle scheme.
- **Product icons redrawn** in one style, for every icon of a normal VS Code 1.141 session.
- **File icons redrawn** as small objects coloured by category, with badged folders, in dark, light and high-contrast sets.
- **Typography:** only keywords are bold; comments, documentation and storage modifiers are italic.

**Upgrading from 1.x:** the themes look different (Moonlit loses most of its bold and gains mint and amber), twelve product icon keys are dropped and every file icon changes. The [CHANGELOG](https://github.com/WitchyNibbles/Spellbound-Themes/blob/main/CHANGELOG.md) lists every change. To stay on 1.2.1, use **Install Another Version...** in the Extensions view, or the VSIX of [v1.2.1](https://github.com/WitchyNibbles/Spellbound-Themes/releases/tag/v1.2.1).

Manual installation: download the VSIX below, then choose **Extensions: Install from VSIX...** in VS Code.

Asset: `witchynibbles-theme-collection-2.0.0.vsix`
SHA-256: `<sha256>`

The VS Code Marketplace listing is published separately from these GitHub downloads.
```

- [ ] **Step 8: Run everything**

```bash
node --test test/release-notes.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|fail)'
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/validate.mjs 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows|^⚠ F9' | grep -E '^…|^✓|^✗'
node scripts/review/privacy-scan.mjs docs/release/2.0.0.md docs/qa/2.0.0-release/README.md; echo "exit $?"
```

Expected: `ℹ tests 1`, `ℹ pass 1`; `ℹ tests B+22`, `ℹ fail 0`; the `✓` line ending `file-icons, release)` and no `…` line; two `✓` lines, `exit 0`.

- [ ] **Step 9: Snapshot**

Run: `git add -A && git write-tree | tee review-out/rel/TREE_10`
Expected: one tree id. Keep `witchynibbles-theme-collection-2.0.0.vsix` in the repo root (git-ignored): it is the file the author publishes. If anything the VSIX ships changes after this step (Task 11's fixes), repeat Steps 2-8.

---

### Task 11: Whole-branch review of `main..spellbound-2.0` before the release commit

The review covers everything the release will put on `main`: the eleven gate commits and Task 1's commit (`main..HEAD`) plus the staged release work, that is `git diff --cached main` after `git add -A`. A fresh reviewer that has not seen this session does it (superpowers:requesting-code-review), on the most capable model, read-only.

**Files:**
- Modify: whatever the accepted findings require (each with its test first), `docs/qa/2.0.0-release/README.md` (the review's outcome)

- [ ] **Step 1: Size the review and sweep the repository for private data**

```bash
export PATH="$PATH:/mnt/c/Windows/System32:/mnt/c/Windows"
git add -A
git diff --cached --stat main | tail -1
git diff --cached --stat main -- . ':(exclude)docs/superpowers' ':(exclude)docs/qa' ':(exclude)icons/file-icons' ':(exclude)icons/file-src' ':(exclude)icons/product-src' ':(exclude)review/workspace-files' | tail -1
node scripts/review/privacy-scan.mjs $(git ls-files '*.md' '*.json' '*.txt') > review-out/rel/privacy-sweep.txt 2>&1; echo "exit $?"; grep -vc '^✓' review-out/rel/privacy-sweep.txt
git ls-files | grep -E '^(review-out|\.superpowers|\.claude/worktrees)/|\.vsix$' | wc -l
```

Expected: two `N files changed` lines (the whole branch, then the part a reviewer reads line by line); `exit 0` and `0` (no tracked text file holds a user name, user directory or e-mail address; the gate PNGs were scanned at their gates and the release PNGs in Tasks 7-8); `0` (no run output, agent state or VSIX is tracked). A finding in the sweep is a Critical review finding: report the file and the kind of finding (the scan never prints the name) to the author.

- [ ] **Step 2: Dispatch the reviewer**

Dispatch a fresh subagent (superpowers:requesting-code-review) with this brief, filled with the two stat lines:

```text
Review the Spellbound Themes 2.0.0 release before it is committed and merged to main: `git diff --cached main` in
/home/<user>/projects/Spellbound-Themes (staged; read-only: do not edit, stage, commit or run the review harness).
Spec: docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md (sections 1, 3, 5.1, 6, 8, 9, 11).
Plan: docs/superpowers/plans/2026-10-11-spellbound-2-release.md (its Resolved decisions R1-R9 are deliberate).
Size: <stat line 1>; read line by line: <stat line 2>. Plans and gate evidence (docs/superpowers, docs/qa) are context.

Report findings as Critical / Important / Minor, each with file:line and why it matters to a user. Check:
1. What ships (vsce ls; the VSIX in the repo root): only runtime files; every theme, icon theme, font and resolved icon
   present; package.json metadata (version 2.0.0, banner #0D0916, description, keywords) as spec 9 and R9 say.
2. README.md and CHANGELOG.md against the code: every setting name and value, theme label and id, colour, count and
   claim is true of themes/, icons/ and package.json; the CHANGELOG's per-theme changes match `git diff main -- themes`;
   the dropped keys match spec 5.1; nothing promised that the package does not do.
3. Build and validation code (scripts/, src/, scripts/lib/): correctness, a check that can pass vacuously, a stage
   that is never enforced, a generated file that can drift from its generator.
4. The review harness (scripts/review/, review/): anything that could put a path, user or machine name into a
   committed file or image; anything that could close a VS Code it did not start.
5. Tests (test/): tests that cannot fail, tests that pin the wrong thing, skipped or environment-dependent tests.
6. Repository hygiene for a public repo: stray files, large binaries, files that belong in .gitignore or .vscodeignore.
```

- [ ] **Step 3: Act on the findings**

- Critical and Important: fix each, test first (a failing test that shows the problem, then the fix), in the owning task's style. If a fix touches anything the VSIX ships (`package.json`, README, CHANGELOG, LICENSE, `themes/`, `icons/`, `assets/witchynibbles.png`), repeat Task 10 Steps 2-8 (a new SHA-256 in the release notes). If a fix changes what an image shows, re-capture (Tasks 7-8); never edit an image.
- Minor: fix it if cheap and safe; otherwise list it in the QA README under "Review" with the reason it stays.
- A finding that contradicts a spec decision or R1-R9 goes to the author at Task 12; do not fix it alone.

Add to `docs/qa/2.0.0-release/README.md`:

```markdown
## Review

Whole-branch review of `main..spellbound-2.0` with the release staged (<date>): <n> Critical, <n> Important, <n> Minor. Fixed: <one line each>. Kept, with reasons: <one line each>. Repository-wide privacy sweep of every tracked .md, .json and .txt file: clean.
```

- [ ] **Step 4: Re-run the gates**

```bash
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
node scripts/validate.mjs --release 2>&1 | grep -vE 'cat-slash|gear\.svg|sync-arrows|^⚠ F9' | grep -E '^…|^✓|^✗'
node --test test/release-notes.test.mjs 2>&1 | grep -E '^ℹ fail'
node scripts/review/privacy-scan.mjs docs/qa/2.0.0-release/README.md; echo "exit $?"
git add -A && git write-tree | tee review-out/rel/TREE_11
```

Expected: `ℹ tests B+22` plus any tests the fixes added, `ℹ fail 0`; `✓ WitchyNibbles package validation passed (enforced: every stage)`; `ℹ fail 0` (the notes' SHA-256 matches the VSIX); `✓`, `exit 0`; one tree id.

---

### Task 12: The author's approval, the release commit, the publish handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-10-10-witchyterm-parity-design.md` (status line, section 11.8)

- [ ] **Step 1: Hand the release package to the author and wait**

Report to the author, then wait for an explicit approval:
- The six images (`assets/screenshots/*.png`) and `docs/qa/2.0.0-release/README.md` (provenance, the colour table, the staging artifacts, the review's outcome).
- `README.md`, the CHANGELOG 2.0.0 entry, `docs/release/2.0.0.md`, the `package.json` description and keywords (R9).
- The decisions R1-R9, each to approve or change.
- The VSIX: name, size, file count, SHA-256, and the install check's result.
- Anything the steps above stopped on or noted (the window size, the Windows Terminal DPI, the colour table's `no` lines, review findings kept).

Apply each change the author asks for through the task that owns it (with its tests), then repeat Task 10 Steps 2-8 if the VSIX contents changed.

- [ ] **Step 2: Record the release decisions in the spec**

In the spec's header, append `; release decided (section 11.8)` to the `Status` line. Append after section 11.7 (fill `<date>`, and the changes if the author made any):

```markdown
### 11.8 Release decisions (<date>)

Taken while planning the release (docs/superpowers/plans/2026-10-11-spellbound-2-release.md), approved by the author<, with these changes: …>.

- R1 The VSIX ships runtime files only; the icon sources, maps, pinned ID lists, `icons/README.md` and the screenshots stay in the repository (the README images load from GitHub).
- R2 The extension icon is 256×256.
- R3 `npm run validate` enforces the `release` stage.
- R4 The Marketplace images are taken in VS Code's default window at 100%.
- R5 The terminal image runs witchyterm's `ll --no-user` and the 16 colours in both terminals over the same folder, with no prompt; Windows Terminal is captured over a `#0D0916` backdrop.
- R6 The product icon image is the review icon sheet's three pages, stacked.
- R7 `scripts/verify-icon-release.py` stays the 1.2.1 record; `scripts/verify-live-readme-images.py` checks 2.0.0 and later.
- R8 The README carries the section-7 glossary; the proposal to witchyterm is the author's.
- R9 The description and keywords of section 9.
```

- [ ] **Step 3: The release commit**

```bash
export PATH="$PATH:/mnt/c/Windows/System32:/mnt/c/Windows"
npm test 2>&1 | grep -E '^ℹ (tests|fail)'
git add -A
git status --short | grep -vE '^(M |A |D |R )' | wc -l
git commit -m "Spellbound Themes 2.0.0: release metadata, Marketplace images, README and CHANGELOG

<attribution line from the session>"
git log --oneline -1 && git status --short | wc -l
python3 scripts/verify-live-readme-images.py --offline > /dev/null && echo "images staged equal committed"
```

Expected: `ℹ fail 0`; `0` (everything staged); the commit; `0`; `images staged equal committed`. Do not push, tag, merge or publish.

- [ ] **Step 4: Hand over the publish steps**

Give the author the section "Publishing: the author's steps" below, the commit id, the VSIX path and its SHA-256, and stop.

---

## Publishing: the author's steps

Run from the repository root on the release commit, with `witchynibbles-theme-collection-2.0.0.vsix` (Task 10) beside it. The executor runs none of these.

```bash
# 0. The VSIX is the one the release notes name.
grep -F "$(sha256sum witchynibbles-theme-collection-2.0.0.vsix | cut -d' ' -f1)" docs/release/2.0.0.md

# 1. main moves to the release (main is an ancestor of spellbound-2.0: a fast-forward).
git checkout main
git merge --ff-only spellbound-2.0
git push origin main

# 2. The README images are live on GitHub and equal the committed files. raw.githubusercontent.com caches for about
#    five minutes: if it still serves 1.2.1's images, wait and run it again. Keep the report.
python3 scripts/verify-live-readme-images.py | tee docs/qa/2.0.0-live-image-verification.json

# 3. Tag and GitHub release, with the VSIX as its asset.
git tag -a v2.0.0 -m "WitchyNibbles Spellbound Themes 2.0.0"
git push origin v2.0.0
gh release create v2.0.0 witchynibbles-theme-collection-2.0.0.vsix --verify-tag --title "WitchyNibbles 2.0.0" --notes-file docs/release/2.0.0.md

# 4. The Marketplace: the same VSIX, not a rebuild. Needs a Personal Access Token for publisher EimiMartinez
#    (npx vsce login EimiMartinez once, or VSCE_PAT in the environment).
npx vsce publish --packagePath witchynibbles-theme-collection-2.0.0.vsix

# 5. Check.
npx vsce show EimiMartinez.witchynibbles-theme-collection | head -12   # Version 2.0.0 listed; the tags of Task 10 Step 3
gh release view v2.0.0                                                  # the asset and the notes
# Open https://marketplace.visualstudio.com/items?itemName=EimiMartinez.witchynibbles-theme-collection: six images load.

# 6. Optional: keep the live check's report.
git add docs/qa/2.0.0-live-image-verification.json
git commit -m "Record the live image check of 2.0.0"
git push origin main
```

Between step 1 and step 4 the 1.2.1 Marketplace page already shows the 2.0 screenshots (it loads them from `main`): run steps 1-4 back to back. Step 6 changes only `docs/`, which the VSIX does not ship. Proposing the section-7 glossary additions to witchyterm (R8) is a separate, optional step.

---

## Self-review notes

- **Spec 9.** Version 2.0.0 and banner `#0D0916` (Task 2, enforced by `validate` from Task 2 and by `--release`); description and keywords naming Moonlit Candle and its gold/candle look, `pastel` dropped (Task 2, R9; the tags checked in a real package, Task 3); one screenshot per color theme showing code, the Explorer's file icons and the product icons (Tasks 5, 7); the product icon sheet in a real workbench at 16 px (Tasks 5, 7, R6); a VS Code terminal beside Windows Terminal showing the shared palette (Tasks 5, 8, R5); the README recommends `highlightModifiedTabs: true`, documents `minimumContrastRatio: 1` (the package does not set it), lists the moon background image as a known difference and recommends Maple Mono NF (Task 9, pinned by `release-docs`); CHANGELOG 2.0.0 with "Upgrading from 1.x": the per-theme changes, the new terminal colours, the dropped keys of spec 5.1, "Install Another Version" (Task 9).
- **Spec 1, 6, 8.** `validate --release` passes with every stage enforced (Tasks 2, 7, 10); the README states that the icons are original and not affiliated (Task 9); the package sets no setting (`release-docs`).
- **Asked for beyond the spec.** The `outlineGap` fix, test first (Task 1); the VSIX verification: allowlist, required files, tags, size, reproducibility, an install into an isolated profile (Tasks 3, 10); release notes and the author's publish commands (Task 10, "Publishing"); the whole-branch review (Task 11); the environment note (Global Constraints).
- **Placeholder scan.** The angle-bracket fields are run-dependent values (`<RUN>`, `<dry run>`, `<install run>`, `<date>`, sizes, the SHA-256, the attribution line, the QA README's seen-lines and the review's counts), each filled from a named step. No TODO, no TBD. No user name, directory or e-mail (`<user>` only).
- **Names across tasks.** `outlineGap` (Task 1); `releaseJob`, `FIXTURE`, `OPEN_FILES`, `DIRTY_FILE`, `EXPLORER_ROWS`, `FOLDERS`, `RITUAL`, `TERMINAL_PROFILE_NAME`, `TERMINAL_PROFILE`, `SHEET_PAGES` (Task 5, used by its test); `parseGateArgs(...).vsix`, `manifest.installedVsix`, `job.settings` (Task 4, used in Tasks 5, 7, 10); the scene and crop names `showcase/full`, `icon-sheet{,-2,-3}/panel`, `terminal/panel` (Task 5, read by `release-images.py`, Task 6); `assets/screenshots/{moonlit-candle,moonlit,daydream,coven-contrast,product-icons,terminal}.png` (Tasks 7, 8, 9); session `spellbound-release`; snapshots `review-out/rel/TREE_N`.
- **Checked while writing.** On a copy of HEAD (`86d01bb`, the gate-5 state) with a stand-in owl source built from gate 6's owl geometry: the `outlineGap` overflow and fix (RangeError at 200-point rings and on the owl, 0.9987 after); `npm version 2.0.0 --no-git-tag-version`; the metadata, package-contents (red 1 of 4, green 4 of 4; tags as listed; 137 KB at 27 resolved icons), harness (red 4, green 61), release-job (red 1 and 3, green 57), release-images (3), release-docs (4, with the gate-6 counts substituted) and release-notes (1) tests; the release job through `filterJob`, `resolveWaits` and `workspaceOf`, and `--scales=3` and a missing `--vsix` both exit 2; two packagings give the same SHA-256; vsce rewrites the README links with the screenshots excluded; `verify-live-readme-images.py --offline`; the fish swatch loop's output; eza 0.18 has `--no-user`; witchyterm's `ll` is defined in `fish -i`; the PowerShell script parses; the README, CHANGELOG and notes pass the privacy scan; the three outside links resolve; the Marketplace lists 1.2.1 and 1.0.0 for "Install Another Version".
- **Not checked while writing.** Nothing was launched (no VS Code, Windows Terminal or agent-browser): the default window's size, the showcase wait's file-icon URL, the terminal scene in VS Code, the Windows Terminal capture (the `wt.exe` flags, the title lookup, the DWM bounds, the backdrop and the acrylic), and every image are the executor's, with the fixes and stops listed in Tasks 7 and 8. The gate-6 totals (647 tests, 63 drawings, 21 F9 lines) come from gate 6's plan; Before Task 1 measures them.

## Execution

Recommended: **subagent-driven** (superpowers:subagent-driven-development). Tasks 1-6 are independent code with their own tests, where a fresh reviewer per task is cheap; Tasks 7, 8 and 10 launch VS Code and Windows Terminal and need one executor who keeps the pointer and the keyboard off the screen; Task 11 is by design a fresh reviewer; Task 12 waits for the author.
