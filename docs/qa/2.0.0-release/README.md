# Spellbound Themes 2.0.0: the Marketplace images

- Release run: 2026-10-11T17-12-20 · VS Code 1.141.0 (2a59476c9b) · device-scale 100% · window 1440×900 · repo b0637d47ce2b669d8534f91b3bade6d953ef5fad (dirty: the release work is uncommitted) · installed VSIX witchynibbles-theme-collection-2.0.0.vsix, sha256 2b69726a4670d076ab35f513d49b3b51a643dec6b13cb78f95222fe4451e5b5c. It differs from the shipped VSIX (the install check below) only in `extension/readme.md` and `extension/changelog.md`, which were edited after the images were taken; every file VS Code reads at run time is byte-identical, so the images show the shipped themes and icons.
- Install check: run 2026-10-11T18-23-02, the packaged witchynibbles-theme-collection-2.0.0.vsix (sha256 4cdba9c8567ae50facb817c25fd0541eaf01ea659083fa0051e331d3d55c7365) installed with `--install-extension` into a fresh profile; the four color themes, the product icon font and the 2.0.0 file icons loaded (`--scenes=showcase`, 8 captures, 0 warnings). The review's fixes to README.md and CHANGELOG.md changed only `extension/readme.md` and `extension/changelog.md` from the VSIX of the first install check (run 2026-10-11T17-49-57, sha256 4759166eef96f69082d73c2d83690e71581c3c5956e46fb860486560882a12e3), so nothing VS Code draws changed; this run was made to try the harness's new port and process check (Review, I3) on the real VS Code, and installs the shipped VSIX.
- Reproduce: `node scripts/review/release-job.mjs` (writes review/jobs/release.json), `npm run package`, `node scripts/review/run-gate.mjs --job review/jobs/release.json --vsix witchynibbles-theme-collection-2.0.0.vsix`; Windows Terminal: `scripts/review/windows-terminal.ps1`; the images: `python3 scripts/release/release-images.py` (plan: docs/superpowers/plans/2026-10-11-spellbound-2-release.md, Tasks 5-8).
- `manifest.json` here lists the run's 40 captures with their sha256. Raw captures and contact sheets are not committed.

## The images

- `moonlit-candle.png`, `moonlit.png`, `daydream.png`, `coven-contrast.png`: the showcase scene's full window in each color theme (`captures/main/1/showcase/<theme>/default/full.png`), pixels unchanged.
- `product-icons.png`: the review helper's icon sheet, every product icon drawing at 16 px with its name and IDs, in Moonlit Candle; its three pages (`icon-sheet`, `icon-sheet-2`, `icon-sheet-3`, crop `panel`), each cut 8 px below its last row, stacked.
- `terminal.png`: left, VS Code's integrated terminal (`terminal`, crop `panel`, Moonlit Candle; `terminal.integrated.minimumContrastRatio` 1, Maple Mono NF 16 px, line height 1.1; panel tabs as icons), cut 8 px below its last row and to the width of the right half; right, Windows Terminal with witchyterm's Moonlit Candle profile (Maple Mono NF 12 pt, 93% acrylic over a `#0D0916` backdrop, the moon background image at 12%), 96 dpi, 647×502. Both run `scripts/ritual.fish` in the run's workspace: witchyterm's `ll --no-user`, then the 16 colours.

## Seen

- `moonlit-candle.png`, `moonlit.png`, `daydream.png`, `coven-contrast.png` (1440×900 each): the activity bar's grimoire (with the unsaved-count badge 1), scrying glass, sprig, spider, rune tiles and flask, witch hat and gear at the bottom; the Explorer's 19 rows with `.github`, `docs`, `scripts` closed and `assets`, `src`, `tests` open, each file with its drawing; the tabs `spellbook.py`, `styles.css` (✦ and the pink top border) and `familiars.ts` (active); the breadcrumb `src ⋆ familiars.ts ⋆ …`; TypeScript in the theme's colours with bold keywords and italic comments. Daydream draws the light file-icon set and Coven Contrast the high-contrast set. VS Code 1.141's own chrome shows a Copilot chat button and a "Sign In" button in the title bar, and the code-action lightbulb as the candle glyph at line 1.
- `product-icons.png` (1382×1100): the three pages in order, every row whole with about 8 px below the last; the next page's top border shows as a thin line at each join; page 3 holds the last 7 drawings, its other two views empty.
- `terminal.png` (1318×578): on both sides the same 13 `ll` rows of the run's folder (`.github`, `assets`, `docs`, `scripts`, `src`, `tests`, `.env.example`, `.gitignore`, `CHANGELOG.md`, `LICENSE`, `package.json`, `README.md`, `tsconfig.json`) with the same sizes and times, eza's icons and no owner column, then the eight lines of colour names and swatches. Left: VS Code's panel tab icons (the Problems icon's badge 3 is the review helper's three sample problems) and the cursor block below the last line; the panel's actions at the top right are outside the cut. Right: the tab "Spellbound ritual" with the moon icon, the moon background image faint at the bottom right, the cursor not drawn at the moment of capture (it blinks), the `#0D0916` backdrop at the window's rounded corners and nothing of the desktop. Each half is a pixel-for-pixel copy of its capture.
- Exact colours (Task 8 Step 3): which of witchyterm's 16 colours occur exactly in each half:

  ```
  black          #1D1230  VS Code yes  Windows Terminal yes
  brightBlack    #6E5A80  VS Code yes  Windows Terminal yes
  red            #FF6B9F  VS Code yes  Windows Terminal yes
  brightRed      #FF8FB5  VS Code yes  Windows Terminal yes
  green          #74E8B8  VS Code yes  Windows Terminal yes
  brightGreen    #9DF2CE  VS Code yes  Windows Terminal yes
  yellow         #FFD477  VS Code yes  Windows Terminal yes
  brightYellow   #FFE3A3  VS Code yes  Windows Terminal yes
  blue           #77D9FF  VS Code yes  Windows Terminal yes
  brightBlue     #A3E6FF  VS Code yes  Windows Terminal yes
  purple         #B99AFF  VS Code yes  Windows Terminal yes
  brightPurple   #D0B8FF  VS Code yes  Windows Terminal yes
  cyan           #74D7E8  VS Code yes  Windows Terminal yes
  brightCyan     #A0E9F2  VS Code yes  Windows Terminal yes
  white          #E6DCEE  VS Code yes  Windows Terminal yes
  brightWhite    #FFFFFF  VS Code yes  Windows Terminal yes
  ```

## Known staging artifacts (not defects)

- The status bar's problem counts are the review helper's three sample problems (on a `notes.md` outside this fixture).
- The panel's "Icon sheet" tab and the icon sheet itself are the review helper's; they are not part of the extension.
- `styles.css` is left unsaved on purpose: the ✦ and the pink border the README recommends.

## Privacy

Every image, this README and the manifest passed `node scripts/review/privacy-scan.mjs` and were checked by eye: no user name, path, machine name or e-mail; `ll` shows no owner column; neither terminal draws a prompt.

## Review

Whole-branch review of `main..spellbound-2.0` with the release staged (2026-10-11): 0 Critical, 3 Important, 16 Minor. Fixed:

- I1: the README says the high-contrast file icons are drawn for dark high-contrast themes such as Coven Contrast, and that VS Code also uses them with a light high-contrast theme, where they have low contrast (the palette is unchanged).
- I3: `capture.mjs` refuses to launch when the debugging port is already in use, checks that the browser behind the port is the VS Code process it started (its PID) before it drives anything, closes only that browser, and closes its own VS Code by PID when a launch fails (`scripts/review/cdp-guard.mjs`).
- M1: the CHANGELOG's upgrade note, the README and the release notes say operators lost their bold, including the words the grammars mark as operators (`new`, `typeof`, `and`, `in` and the like).
- M2: `run-gate.mjs --vsix` takes only a `.vsix` file and records the sha256 of the copy it installed.
- M3: `verify-live-readme-images.py` reports a missing README.md, a packed readme that is not UTF-8, a missing git, a body cut short and any other error in its report and one line, never a traceback.
- M4: the package-contents test requires package.json, README, CHANGELOG and LICENSE in the VSIX.
- M5: tests rebuild the themes and the product icon font and theme and compare them byte for byte with the committed files.
- M6: `validate --only` stops (exit 2) on an empty list or a stage no check uses.
- M7: the release check takes any release version from 2.0.0 on; the metadata test reads the version from the top CHANGELOG entry.
- M8, M9, M14: the README's build section names Node.js 22 or later, every test that depends on the machine (the witchyterm clone, the VS Code 1.141 bundle, the Windows folders on `PATH` under WSL) and the tools the tests need, and limits the same-bytes claim to a checkout with LF line endings.
- M10: the contact sheets use an agent-browser session of their own, named in every call, and close only that session.
- M11: this README says how the image run's VSIX differs from the shipped one, and the sweep below is stated as it is.
- M13: the unused 1.x `fixtures/showcase.*` files are removed; `icons/README.md` no longer describes `product-src-variants/` as a folder that is there.
- M15: Moonlit's dead `terminal` value and the stale gem-rough comment are gone (the themes are byte-identical).
- M16: `windows-terminal.ps1` looks for its window 15 s past the deadline, so one that opens late is closed by its handle too.

Kept, with reasons:

- I2 (about 62 MB of gate screenshots under `docs/qa/` go to public history with the fast-forward): reported to the author, who decides before the push.
- I1's palette: a mid-tone high-contrast palette that reaches 3:1 on black and on white would change the VSIX and Coven Contrast's image; that is the author's call. The README note is the fix for now.
- M12 (VS Code's default colours show through in the witchy themes: the `debugIcon.*` toolbar keys, and `testing.iconPassed` outside Moonlit Candle): deferred. It is theme design work, and no regression: 1.2.1 leaves the same keys unset.
- M8's suggestion to stub `cmd.exe` in the privacy-scan tests: the README documents the requirement instead, as ruled; the tests still read the real Windows user name under WSL.
- M16's second point (the capture assumes the window is on top): unchanged. The script brings its window to the front over its own full-screen backdrop, and the eye check of `terminal.png` covers it.

Repository-wide privacy sweep of every tracked .md, .json and .txt file (81 files): exit 1, with findings in 8 files, each inspected and a false positive: in six plans, image names ending in `@1x.png` and `@2x.png` that match the e-mail pattern, invented test fixtures, and `…` and `*` placeholders in quoted paths; in package-lock.json, a dependency author's address; in LICENSE.md, the author's own copyright line, public on purpose. No other user name, user directory or e-mail address is in a tracked text file.
