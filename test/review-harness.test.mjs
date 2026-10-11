// Task 17: the gate screenshot harness. The capture itself needs Windows VS Code, so these tests pin the parts
// that can go wrong without it: job files that reference real chords, scenes and drawings, a capture script that
// runs outside the repo on Node built-ins alone, and a helper extension that never reaches the published package.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES } from '../scripts/lib/file-icon-requirements.mjs';
import { WAITS } from '../scripts/review/waits.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const exists = (file) => fs.existsSync(path.join(root, file));

const GATES = ['review/jobs/gate-1.json', 'review/jobs/gate-2.json', 'review/jobs/gate-3.json', 'review/jobs/gate-4.json'];
const GATE_5 = 'review/jobs/gate-5.json';
const GATE_6 = 'review/jobs/gate-6.json';
const JOBS = [...GATES, GATE_5, GATE_6, 'review/jobs/smoke.json'];
const PLAIN_KEYS = new Set(['Enter', 'Escape', 'Tab', 'Backspace']);

test('every file the harness needs exists', () => {
  for (const file of [
    'review/workspace/spells.ts', 'review/workspace/debug-target.js', 'review/workspace/notes.md', 'review/workspace/README.md',
    'review/workspace/unbrewed.js', 'review/workspace/brews.spec.js', 'review/helper-extension/breakpoints.json',
    'review/workspace/hexes.ts', 'review/workspace/symbols.grimoire', 'review/workspace/charms.grimoire',
    'review/workspace/.vscode/launch.json', 'review/profile/settings.base.json', 'review/profile/keybindings.json',
    'review/helper-extension/package.json', 'review/helper-extension/extension.js', 'review/helper-extension/README.md',
    'review/helper-extension/media/sheet.svg', ...JOBS,
    'scripts/review/stage-extension.mjs', 'scripts/review/capture.mjs', 'scripts/review/run-gate.mjs', 'scripts/review/contact-sheet.mjs',
    'scripts/review/args.mjs', 'scripts/review/privacy-scan.mjs', 'scripts/review/waits.mjs', 'scripts/review/workspace.mjs',
  ]) assert.ok(exists(file), file);
});

test('job files follow the schema and press only bound chords or plain keys', () => {
  const bound = new Set(json('review/profile/keybindings.json').map((binding) => binding.key));
  for (const file of JOBS) {
    const job = json(file);
    assert.equal(job.expectVersion, '1.141.0', file);
    assert.ok(['device-scale', 'zoom'].includes(job.mode), `${file} mode`);
    assert.ok(Number.isInteger(job.port), `${file} port`);
    assert.equal(job.helperVsix, 'spellbound-review-helper.vsix', file);
    const sceneNames = job.scenes.map((scene) => scene.name);
    assert.equal(new Set(sceneNames).size, sceneNames.length, `${file} duplicate scene`);
    for (const pass of job.passes) {
      assert.ok(pass.vsix.length && pass.scales.length, `${file} ${pass.name}`);
      for (const scene of pass.scenes ?? []) assert.ok(sceneNames.includes(scene), `${file} ${pass.name} names unknown scene ${scene}`);
    }
    for (const scene of job.scenes) {
      assert.ok(scene.crops?.length, `${file} ${scene.name} has no crops`);
      for (const step of [...(scene.setup ?? []), ...(scene.teardown ?? [])]) {
        assert.ok(step.press || step.insert || step.hover || step.hold || step.waitFor || step.until || step.wait, `${file} ${scene.name}: empty step`);
        if (step.hold) assert.equal(step.hold, 'alt', `${file} ${scene.name}: only Alt can be held`);
        if (step.until) assert.ok(Object.hasOwn(WAITS, step.until), `${file} ${scene.name}: ${step.until} is not a named wait`);
        if (step.file) assert.ok(step.until, `${file} ${scene.name}: file belongs to an until step`);
        if (step.press) assert.ok(bound.has(step.press) || PLAIN_KEYS.has(step.press), `${file} ${scene.name}: ${step.press} is not bound`);
      }
    }
  }
});

test('the gate covers four scales, both activity bar sizes, and both terminal contrast settings', () => {
  const job = json('review/jobs/gate-1.json');
  assert.deepEqual(job.passes.find((pass) => pass.name === 'main').scales, [1, 1.25, 1.5, 2]);
  const workbench = job.scenes.find((scene) => scene.name === 'workbench');
  assert.deepEqual(workbench.variants.map((variant) => variant.settings['workbench.activityBar.compact'] ?? false), [false, true]);
  const terminal = job.scenes.find((scene) => scene.name === 'terminal');
  // Decision 1: captured at the default 4.5 and at 1; the package sets neither.
  assert.deepEqual(terminal.variants.map((variant) => variant.settings['terminal.integrated.minimumContrastRatio']), [undefined, 1]);
  assert.ok(job.scenes.find((scene) => scene.name === 'debug').setup.some((step) => String(step.waitFor).includes('debug-stackframe')), 'debug scene stops on a breakpoint');
});

test('every committed sheet is one the gate job produces', () => {
  for (const file of [...GATES, GATE_5, GATE_6]) {
    const job = json(file);
    const produced = new Set(job.passes.flatMap((pass) => job.scenes
      .filter((scene) => !pass.scenes || pass.scenes.includes(scene.name))
      .flatMap((scene) => scene.crops.map((crop) => `${pass.name}-${scene.name}-${crop.name}`))));
    for (const sheet of job.commitSheets) assert.ok(produced.has(sheet), `${file}: ${sheet}`);
  }
});

test('gate 2 waits, without an optional step, for every chrome and status glyph it has to show in context', () => {
  // Each ID below only renders in a specific state (dirty or staged branch, merge conflict, a branch with an upstream,
  // unread notification, toast of each severity, shell-integrated command, open find widget, diff editor, multi-step
  // quick pick, gutter light bulb), so the scene must reach that state. An optional wait only warns, so it does not count.
  const job = json('review/jobs/gate-2.json');
  const waits = job.scenes.flatMap((scene) => (scene.setup ?? []).filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''))).join(' ');
  for (const id of ['git-branch-changes', 'git-branch-staged-changes', 'git-branch-conflicts', 'sync', 'bell-dot', 'info', 'warning',
    'error', 'terminal-decoration-success', 'terminal-decoration-error', 'find-next-match', 'diff-insert', 'diff-remove',
    'diff-editor-next-change', 'quick-input-back', 'copilot-warning', 'gutter-lightbulb']) {
    assert.match(waits, new RegExp(`codicon-${id}(?![\\w-])`), id);
  }
  // The inline light bulb (the one gate 1 saw) is a content widget, div.lightBulbWidget, carrying the codicon classes
  // of lightbulb-sparkle, lightbulb-autofix or lightbulb-sparkle-autofix (1.141 _updateLightBulbTitleAndIcon).
  const workbench = job.scenes.find((scene) => scene.name === 'workbench');
  assert.ok(workbench.setup.some((step) => !step.optional && String(step.waitFor ?? '').includes('.lightBulbWidget[class*=codicon-lightbulb-]')),
    'the workbench scene waits for the inline light bulb');
  assert.deepEqual(job.passes.find((pass) => pass.name === 'main').scales, [1, 1.25, 1.5, 2]);
  assert.ok(job.passes.find((pass) => pass.name === 'variants').scenes.includes('status-signals'), 'the copilot-warning variant reached a status bar (gate 2 evidence; no variants are left after the decision)');
});

test('gate 2 scenes that change the fixture repository put it back', () => {
  // A scene runs once per launch and the next scene starts from whatever it left; the scm chord with "changes" restores
  // the dirty-branch state (merge aborted, index empty) before the next scene.
  const bindings = json('review/profile/keybindings.json');
  const restore = bindings.find((binding) => binding.command === 'spellboundReview.scm' && binding.args === 'changes').key;
  const changing = new Set(bindings.filter((binding) => binding.command === 'spellboundReview.scm' && binding.args !== 'changes').map((binding) => binding.key));
  for (const scene of json('review/jobs/gate-2.json').scenes) {
    if (!(scene.setup ?? []).some((step) => changing.has(step.press))) continue;
    assert.ok((scene.teardown ?? []).some((step) => step.press === restore), `${scene.name} restores the dirty branch`);
  }
  // prepareWorkspace (scripts/review/workspace.mjs) builds the repository; test/review-workspace.test.mjs checks the states.
  const workspace = read('scripts/review/workspace.mjs');
  assert.match(workspace, /'checkout', '-q', '-b', 'rival-brew'/, 'the fixture has a branch that conflicts');
  assert.match(workspace, /'remote', 'add', 'origin', '\.\.\/origin\.git'/, 'the fixture has an upstream with a relative URL');
  assert.match(read('review/helper-extension/extension.js'), /merge\('rival-brew'\)/);
});

test('gate 2 keeps the three severity toasts on screen for every theme of the notifications scene', () => {
  // VS Code 1.141 purges a non-sticky toast after 10 s (info), 12 s (warning) or 15 s (error) while the window has focus
  // (NotificationsToasts.PURGE_TIMEOUT), and capture.mjs loops over four themes after the setup, so toasts raised once in
  // the setup are gone for the later themes (the coven-contrast toasts.png of run 2026-10-10T09-57-26 lost the info toast).
  // The severities command is therefore a toggle that raises the three toasts again on every theme change (VS Code
  // replaces a toast with the same message, so the stack does not grow); the scene's teardown turns it off.
  const chord = json('review/profile/keybindings.json').find((binding) => binding.command === 'spellboundReview.severities').key;
  const scene = json('review/jobs/gate-2.json').scenes.find((candidate) => candidate.name === 'notifications');
  assert.ok(scene.setup.some((step) => step.press === chord), 'the notifications scene turns the severity toasts on');
  assert.ok(scene.teardown.some((step) => step.press === chord), 'the notifications scene turns the severity toasts off');
  const helper = read('review/helper-extension/extension.js');
  assert.match(helper, /onDidChangeActiveColorTheme\(/, 'the helper raises the toasts again when the theme changes');
});

test('the terminal profile skips the user profile and sources shell integration itself', () => {
  // Gate 2 ran PowerShell with -NoLogo only, so VS Code injected shell integration but the author's own profile also
  // loaded, and its prompt decided what the committed main-terminal-panel showed. -NoProfile keeps any user path out of
  // the prompt; VS Code then no longer injects (1.141 ptyHostMain.js injects only when the args are empty or -NoLogo),
  // so the profile defines a fixed prompt and dot-sources the script, whose install path capture.mjs fills in.
  const binding = json('review/profile/keybindings.json').find((candidate) => candidate.command === 'workbench.action.terminal.newWithProfile');
  const profile = json('review/profile/settings.base.json')['terminal.integrated.profiles.windows'][binding.args.profileName];
  assert.match(profile.path, /\\powershell\.exe$/i);
  assert.deepEqual(profile.args.slice(0, 4).map((arg) => arg.toLowerCase()), ['-nologo', '-noprofile', '-noexit', '-command']);
  // try/catch as VS Code's own injection does: under a Restricted execution policy the error would print the path.
  assert.match(profile.args[4], /^function global:prompt \{ 'PS workspace> ' \}; try \{ \. '\{\{shellIntegrationPs1\}\}' \} catch \{\}$/, 'fixed prompt first, then shell integration');
  const capture = read('scripts/review/capture.mjs');
  assert.match(capture, /'contrib', 'terminal', 'common', 'scripts', 'shellIntegration\.ps1'/);
  assert.match(capture, /replaceAll\('\{\{shellIntegrationPs1\}\}', JSON\.stringify\(shellIntegrationPs1\.replaceAll\("'", "''"\)\)/, 'capture.mjs fills in the script path, quotes doubled');
});

test('the gate 2 terminal scene types only commands whose output names no path, user or machine', () => {
  // main-terminal-panel is committed to a public repo. A failing path lookup (Get-Item no-such-spell) printed
  // C:\Users\<user>\AppData\Local\Temp\...; Write-Error fails the command ($? is false, so shell integration reports a
  // non-zero exit and draws terminal-decoration-error) and prints only its own message.
  const scene = json('review/jobs/gate-2.json').scenes.find((candidate) => candidate.name === 'terminal');
  const bindings = new Map(json('review/profile/keybindings.json').map((binding) => [binding.key, binding]));
  const typed = scene.setup.filter((step) => step.press && bindings.get(step.press)?.command === 'workbench.action.terminal.sendSequence')
    .map((step) => bindings.get(step.press).args.text);
  assert.deepEqual(typed, ["Write-Output 'moonwater brews'\r", "Write-Error 'nightshade spilled'\r"]);
});

test('the smoke job is the gate job cut down to one pass at 125% and the workbench scene', () => {
  const gate = json('review/jobs/gate-1.json');
  const smoke = json('review/jobs/smoke.json');
  assert.deepEqual(smoke.passes, [{ name: 'main', vsix: ['spellbound-main.vsix'], scales: [1.25] }]);
  assert.deepEqual(smoke.scenes, gate.scenes.filter((scene) => scene.name === 'workbench'));
  for (const key of ['expectVersion', 'port', 'mode', 'helperVsix']) assert.equal(smoke[key], gate[key], key);
});

test('capture.mjs imports only Node built-ins, because it runs from a Windows temp folder', () => {
  const source = read('scripts/review/capture.mjs');
  const specifiers = [...source.matchAll(/^\s*import\s[^'"]*['"]([^'"]+)['"]/gm)].map((match) => match[1]);
  assert.ok(specifiers.length > 0);
  for (const specifier of specifiers) assert.match(specifier, /^node:/, specifier);
  assert.doesNotMatch(source, /\/IM\b/i, 'never kill VS Code by image name');
});

test('every gate variant drawing replaces a drawing the map knows', () => {
  const { drawings } = json('icons/product-icon-map.json');
  const variantDir = path.join(root, 'icons', 'product-src-variants');
  const files = fs.existsSync(variantDir) ? fs.readdirSync(variantDir) : [];
  for (const file of files.filter((name) => name.endsWith('.svg'))) {
    assert.ok(file.split('.')[0] in drawings, file);
  }
});

test('the helper extension wires the chords the profile binds and stays out of the published package', () => {
  const helper = json('review/helper-extension/package.json');
  const bindings = json('review/profile/keybindings.json');
  const commands = new Set(bindings.map((binding) => binding.command));
  assert.ok(commands.has(`${helper.contributes.views.spellboundReview[0].id}.focus`));
  const contributed = new Set(helper.contributes.commands.map((command) => command.command));
  for (const command of contributed) assert.ok(commands.has(command), `${command} is bound`);
  for (const command of [...commands].filter((name) => name.startsWith('spellboundReview.') && !name.endsWith('.focus'))) {
    assert.ok(contributed.has(command), `${command} is contributed by the helper`);
  }
  const source = read('review/helper-extension/extension.js');
  for (const command of contributed) assert.ok(source.includes(`'${command}'`), `extension.js registers ${command}`);
  const rootPackage = json('package.json');
  assert.equal(rootPackage.scripts['review:gate'], 'node scripts/review/run-gate.mjs');
  assert.equal(rootPackage.main, undefined);
  assert.doesNotMatch(JSON.stringify(rootPackage.contributes), /review/);
  assert.ok(read('.vscodeignore').split('\n').includes('review/**'));
});

test('the activity bar ID the capture waits on is themed by the product icon theme', () => {
  const capture = read('scripts/review/capture.mjs');
  const id = capture.match(/\.codicon-([a-z-]+)'\);\s*return !!el && getComputedStyle/)[1];
  const { drawings } = json('icons/product-icon-map.json');
  assert.ok(Object.values(drawings).some(({ ids }) => ids.includes(id)), id);
});

test('the debug target runs in Node mode through a wrapper, never as a second full VS Code', () => {
  // js-debug launches the runtime without the launch config's ELECTRON_RUN_AS_NODE, so Code.exe started as the
  // full app (handing debug-target.js to the default VS Code instance) and the breakpoint never bound (gate run
  // 2026-10-10T01-25-55). A .cmd wrapper sets Node mode itself before it starts Code.exe.
  const config = json('review/workspace/.vscode/launch.json').configurations.find((c) => c.name === 'Brew');
  const wrapperPath = config.runtimeExecutable.replace('${workspaceFolder}', 'review/workspace').replace(/\\/g, '/');
  assert.match(wrapperPath, /^review\/workspace\/.+\.cmd$/, config.runtimeExecutable);
  assert.ok(exists(wrapperPath), wrapperPath);
  assert.equal(config.env?.ELECTRON_RUN_AS_NODE, undefined, 'the wrapper, not env, sets Node mode');
  const lines = read(wrapperPath).split(/\r?\n/).map((line) => line.trim().toLowerCase());
  const setAt = lines.indexOf('set electron_run_as_node=1');
  const runAt = lines.findIndex((line) => !line.startsWith('rem') && line.includes('code.exe'));
  assert.ok(setAt >= 0 && runAt > setAt, 'sets ELECTRON_RUN_AS_NODE=1 before starting Code.exe');
  assert.match(lines[runAt], /%\*$/, 'passes js-debug arguments through');
});

test('the icon sheet shows every drawing at 200%: pages of three views of 17 rows', () => {
  // Gate run 2026-10-10T01-41-22: the single tree in a default-height panel showed 13 rows at 100% and 5 at 200%.
  // Gate 2 (47 drawings, three views): at 200% the panel between the side bar and the chat bar was 428 CSS px wide, so
  // the third view was off its right edge. Measured in a gate-3 dry run at 200% with both side bars closed: the
  // maximized panel is 904 CSS px wide, each view is 228 px wide whatever their number (five views overflowed by 236 px)
  // and its list is 382 px tall, 17 rows of 22 px. So the helper shows three views of 17 rows, 51 drawings a page, and
  // a chord turns the page (gate 3 captures one scene per page).
  const helper = json('review/helper-extension/package.json');
  const views = helper.contributes.views.spellboundReview;
  assert.equal(views.length, 3);
  assert.ok(views.length * 228 <= 904, 'three views fit the panel width at 200%');
  const source = read('review/helper-extension/extension.js');
  assert.match(source, /require\('\.\/package\.json'\)\.contributes\.views\.spellboundReview/, 'extension.js fills every contributed view');
  assert.match(source, /const ROWS_PER_VIEW = 17;/);
  assert.ok(17 * 22 <= 382, '17 rows fit a 382 px list');
  assert.match(source, /sheet\.description = `page \$\{page \+ 1\} of \$\{pages\}`/, 'every view header names its page');
  // Gate 4 shows the map as it stands after the editor, layout and symbols drawings (Parts B and C): more than 102
  // drawings, so three pages, which gate 4 captures as three scenes. A map past 153 drawings needs a fourth scene.
  const drawings = Object.keys(json('icons/product-icon-map.json').drawings).length;
  assert.equal(Math.ceil(drawings / (17 * views.length)), 3, `${drawings} drawings`);
  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
  assert.ok(keyOf('spellboundReview.iconSheetPage'), 'a chord turns the page');

  const maximize = keyOf('workbench.action.toggleMaximizedPanel');
  assert.ok(maximize, 'a chord toggles the maximized panel');
  for (const file of GATES) {
    const scenes = json(file).scenes;
    const first = scenes.find((candidate) => candidate.name === 'icon-sheet');
    assert.ok(first.setup.some((step) => step.press === maximize), `${file}: setup maximizes the panel`);
    const last = scenes.filter((candidate) => candidate.name.startsWith('icon-sheet')).at(-1);
    const teardown = last.teardown.map((step) => step.press);
    assert.ok(teardown.indexOf(maximize) >= 0 && teardown.indexOf(maximize) < teardown.indexOf('ctrl+alt+shift+e'),
      `${file}: the last icon-sheet scene restores the panel size before closing it, so later scenes keep the default layout`);
  }
});

test('every launch starts from the pristine workspace, so all scales show the same SCM state', () => {
  // Gate run 2026-10-10T01-41-22: notes.md reached disk after the 100% pass, so later scales showed a third change.
  const source = read('scripts/review/capture.mjs');
  const restore = source.indexOf('restoreWorkspace()', source.indexOf('for (const pass of job.passes)'));
  assert.ok(restore > 0, 'capture.mjs restores the workspace inside the pass loop');
  assert.ok(restore < source.indexOf('await launch(', restore), 'before launching VS Code');
});

test('the gate 2 terminal scene maximizes the panel, so both decorated commands stay in the viewport at 200%', () => {
  // Gate run 2026-10-10T10-38-44: the unmaximized panel holds about 7 terminal rows at 200% (10 at 150%). The two commands
  // scrolled out (at 150% only sticky scroll still showed the failing command, with no decoration) and at 200% the wait
  // for both decorations timed out. The teardown restores the panel before closing it: the icon-sheet scene toggles it.
  const bindings = json('review/profile/keybindings.json');
  const keyOf = (command) => bindings.find((binding) => binding.command === command).key;
  const maximize = keyOf('workbench.action.toggleMaximizedPanel');
  const terminal = json('review/jobs/gate-2.json').scenes.find((scene) => scene.name === 'terminal');
  const presses = terminal.setup.map((step) => step.press);
  const typed = presses.findIndex((key) => bindings.some((binding) => binding.key === key && binding.command === 'workbench.action.terminal.sendSequence'));
  const opens = presses.indexOf(keyOf('workbench.action.terminal.newWithProfile'));
  assert.ok(opens >= 0 && opens < presses.indexOf(maximize), 'opens the terminal, then maximizes');
  assert.ok(presses.indexOf(maximize) >= 0 && presses.indexOf(maximize) < typed, 'maximizes before typing the commands');
  const teardown = terminal.teardown.map((step) => step.press);
  assert.deepEqual(teardown, [maximize, keyOf('workbench.action.closePanel')], 'restores the panel size, then closes it');
});

test('the fixture keeps LF line endings, so a merge abort does not dirty README.md for the next scale', () => {
  // Gate run 2026-10-10T10-28-47: Windows git (core.autocrlf true) wrote README.md back with CRLF on the 100% pass's
  // merge --abort; the 125% launch restored the LF original, the index still held the CRLF size, and git merge refused
  // ("Your local changes to the following files would be overwritten by merge: README.md"), so scm-conflict timed out.
  assert.match(read('scripts/review/workspace.mjs'), /git\('config', 'core\.autocrlf', 'false'\)/);
});

test('restoring the workspace never shows up as a change in the terminal listing', () => {
  // Gate run 2026-10-10T02-02-52: files rewritten from Windows lose their WSL mode bits, so WSL git (ll, the prompt)
  // listed every file as modified. The fixture repo ignores modes, and only files whose content changed are rewritten.
  assert.match(read('scripts/review/workspace.mjs'), /git\('config', 'core\.fileMode', 'false'\)/);
  const source = read('scripts/review/capture.mjs');
  const body = source.slice(source.indexOf('function restoreWorkspace'), source.indexOf('\n}\n', source.indexOf('function restoreWorkspace')));
  assert.ok(body.length > 0, 'restoreWorkspace is a function');
  assert.match(body, /\.equals\(/, 'compares contents before rewriting a file');
});

test('every PowerShell terminal scene focuses the editor group before opening the terminal', () => {
  // Gate 2: with the chat input focused, the newWithProfile chord opened nothing; the terminal scene worked only after the
  // scenes before it had moved the focus.
  const bindings = json('review/profile/keybindings.json');
  const keyOf = (command) => bindings.find((binding) => binding.command === command).key;
  const opens = keyOf('workbench.action.terminal.newWithProfile');
  const scenes = GATES.flatMap((file) => json(file).scenes.filter((scene) => (scene.setup ?? []).some((step) => step.press === opens)));
  assert.ok(scenes.length > 0);
  for (const scene of scenes) {
    const presses = scene.setup.map((step) => step.press);
    const focus = presses.indexOf(keyOf('workbench.action.focusActiveEditorGroup'));
    assert.ok(focus >= 0 && focus < presses.indexOf(opens), scene.name);
  }
});

// ---- Gate 3: panel and debug batches ----
// Batch IDs whose own class no gate scene can wait for. The gate shows their drawings only: in context through the IDs
// that share them, and in the icon sheet, which renders the first ID of each drawing (run-gate.mjs writes ids[0]).
const NOT_IN_CONTEXT = {
  run: 'no 1.141 surface reachable in the review profile draws codicon-run (the terminal title Run Active File action is '
    + 'hidden by default); testing-run-icon, on the same drawing, is waited for in the gutter',
  // 1.141 L6 (getBreakpointMessageAndIcon) builds the icon family as data, function, log or plain; the conditional
  // family is only read for its regular icon, so a disabled or unverified conditional breakpoint takes the plain icon.
  'debug-breakpoint-conditional-disabled': 'never drawn in 1.141: a disabled conditional breakpoint shows debug-breakpoint-disabled',
  'debug-breakpoint-conditional-unverified': 'never drawn in 1.141: an unverified conditional breakpoint shows debug-breakpoint-unverified',
};
// Pinned by the author at gate 3 (spec 11.3), after run 2026-10-10T15-54-10. The gate-4 job waits for them (debug-disconnect
// test below).
const WAITED_FOR_AT_GATE_4 = {
  'debug-disconnect': 'G23: the Alt alternative of Stop on the Node.js floating toolbar; the debug-disconnect scene holds Alt',
  'debug-breakpoint-log-unverified': 'G20: a logpoint in unbrewed.js, which the debugger never loads',
};
// Pinned by the author after the committed gate-4 run (2026-10-11T00-50-16), which never waited for them. The gate-4 test
// below skips them; the gate-5 job waits for them (its symbols scene).
const PINNED_AFTER_GATE_4_RUN = {
  'symbol-constructor': 'G34: pinned by the author after run 2026-10-11T00-50-16; the next gate job must wait for it',
  'symbol-key': 'G34: pinned by the author after run 2026-10-11T00-50-16; the next gate job must wait for it',
  'symbol-object': 'G34: pinned by the author after run 2026-10-11T00-50-16; the next gate job must wait for it',
  'symbol-package': 'G34: pinned by the author after run 2026-10-11T00-50-16; the next gate job must wait for it',
};
// The stackframe dot has no element of its own: CSS draws it (::after) on a glyph that is both a breakpoint and a frame.
const OVERLAYS = {
  'debug-stackframe-dot': ['codicon-debug-breakpoint.codicon-debug-stackframe', 'codicon-debug-breakpoint-conditional.codicon-debug-stackframe-focused'],
};

test('gate 3 waits, without an optional step, for every panel and debug ID, or names why it cannot', () => {
  const job = json('review/jobs/gate-3.json');
  const waits = job.scenes.flatMap((scene) => (scene.setup ?? []).filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''))).join(' ');
  const { ids } = json('icons/product-icon-ids.json');
  const batchIds = Object.entries(ids).filter(([, entry]) => ['panel', 'debug'].includes(entry.batch)).map(([id]) => id);
  assert.equal(batchIds.length, 34);
  for (const id of batchIds) {
    if (id in NOT_IN_CONTEXT || id in WAITED_FOR_AT_GATE_4) continue;
    for (const selector of OVERLAYS[id] ?? [`codicon-${id}`]) {
      assert.match(waits, new RegExp(`${selector.replace(/\./g, '\\.')}(?![\\w-])`), `${id}: ${selector}`);
    }
  }
});

test('gate 3 shows the panel tab icons through a scene setting that holds for the setup and every capture', () => {
  // output-view-icon, debug-console-view-icon and markers-view-icon are view-container icons: the panel draws them only
  // when its tabs show icons (workbench.panel.showLabels false). capture.mjs applies scene.settings before the setup.
  const scene = json('review/jobs/gate-3.json').scenes.find((candidate) => candidate.name === 'panel-icons');
  assert.deepEqual(scene.settings, { 'workbench.panel.showLabels': false });
  const source = read('scripts/review/capture.mjs');
  const loop = source.slice(source.indexOf('for (const scene of job.scenes'));
  assert.ok(loop.indexOf('applySettings(job.themes[0], sceneSettings)') < loop.indexOf('for (const [index, step] of (scene.setup'), 'scene settings are applied before the setup');
  assert.match(loop, /applySettings\(theme, \{ \.\.\.sceneSettings, \.\.\.variant\.settings \}\)/, 'and kept for every capture');
});

test('every ID the gate-3 coverage test excuses or reaches through an overlay is a panel or debug ID', () => {
  // Gate-3 review: a key in these lists that is not a batch ID (a typo, or an ID that moved batches) excuses nothing and
  // goes unnoticed.
  const { ids } = json('icons/product-icon-ids.json');
  for (const id of [...Object.keys(NOT_IN_CONTEXT), ...Object.keys(WAITED_FOR_AT_GATE_4), ...Object.keys(OVERLAYS)]) {
    assert.ok(['panel', 'debug'].includes(ids[id]?.batch), id);
  }
});

test('agent worktrees under .claude/worktrees/ never reach a snapshot or the VSIX', () => {
  // Gate-4 review: worktree-isolated subagents put whole checkouts under .claude/worktrees/. Untracked, they were staged
  // by every snapshot's git add -A as embedded repositories, and vsce packaged their files (the package-contents test
  // failed). Only the worktrees folder is ignored in git: the author may track project settings in .claude/ later.
  assert.ok(read('.gitignore').split('\n').includes('.claude/worktrees/'), '.gitignore');
  assert.ok(read('.vscodeignore').split('\n').includes('.claude/**'), '.vscodeignore');
});

test('no tooltip is in any capture: checked before the first screenshot of each theme and again after its last crop', () => {
  // Gate-3 review: NO_TOOLTIP was checked once, before the full screenshot, so a tooltip that opened during the crops
  // would be in them. A debug hover (a variable's value while stopped) is a .debug-hover-widget, not a .monaco-hover.
  const capture = read('scripts/review/capture.mjs');
  const selector = capture.match(/const NO_TOOLTIP = `!\[\.\.\.document\.querySelectorAll\('([^']+)'\)\]/)[1];
  assert.deepEqual(selector.split(', '), ['.workbench-hover', '.monaco-hover', '.debug-hover-widget']);
  const lastCrop = capture.indexOf('await shoot(crop.name, clip);');
  const recheck = capture.indexOf('if (!(await cdp.evaluate(NO_TOOLTIP)))', lastCrop);
  assert.ok(lastCrop > 0 && recheck > lastCrop, 'checked again after the last crop');
  assert.ok(recheck < capture.indexOf('for (const [index, step] of (scene.teardown'), 'before the teardown moves on');
  assert.match(capture.slice(recheck, recheck + 200), /throw new Error\(`\$\{where\}\/\$\{theme\.slug\}: a tooltip/);
});

test('every settings write is applied before the run goes on, even when the theme stays the same', () => {
  // Gate-3 review: after writing a scene's settings, capture.mjs waited only for the first theme, which a cut-down run
  // (--scenes) or a variant in the same theme already showed, so the setup could start before VS Code had read the
  // scene's settings. Every write now carries its own window title (the workspace name and one or two zero-width spaces,
  // so the command centre still reads "workspace"), and capture.mjs waits until the window shows it.
  const capture = read('scripts/review/capture.mjs');
  const start = capture.indexOf('const applySettings = async');
  assert.ok(start > 0, 'one function writes the settings and waits for them');
  const body = capture.slice(start, capture.indexOf('\n    };\n', start));
  assert.match(body, /'\\u200b'\.repeat\(1 \+ \(\+\+settingsWrites % 2\)\)/, 'each write differs from the one before it');
  assert.match(body, /'window\.title': `\\\$\{rootName\}\$\{mark\}`/);
  // Awaited, both of them: without the await the run races the settings again (gate-4 review mutation).
  assert.match(body, /await waitFor\(\(\) => cdp\.evaluate\(`document\.title\.endsWith\(\$\{JSON\.stringify\(mark\)\}\) && !document\.title\.endsWith/);
  assert.match(body, /await waitFor\(\(\) => cdp\.evaluate\(themeApplied\(theme\.signature\)\)/, 'and still waits for the theme');
  const loop = capture.slice(capture.indexOf('for (const scene of job.scenes'));
  assert.equal(loop.split("writeUserFile(userDataDir, 'settings.json'").length - 1, 0, 'the scene loop writes settings only through applySettings');
});

test('gate 3 reaches debug-hint by moving the pointer onto the glyph margin', () => {
  const scene = json('review/jobs/gate-3.json').scenes.find((candidate) => candidate.name === 'breakpoints');
  const hover = scene.setup.findIndex((step) => step.hover);
  assert.ok(hover >= 0, 'a hover step');
  assert.match(scene.setup[hover].hover, /\.glyph-margin/);
  assert.ok(scene.setup.slice(hover + 1).some((step) => !step.optional && String(step.waitFor).includes('codicon-debug-hint')), 'then waits for the hint');
  assert.match(read('scripts/review/capture.mjs'), /Input\.dispatchMouseEvent', \{ type: 'mouseMoved'/);
});

test('the breakpoint plan sets each breakpoint kind 1.141 draws once, on code, and stops where the stackframe overlays need it', () => {
  const plan = json('review/helper-extension/breakpoints.json').breakpoints;
  const kinds = plan.map((breakpoint) => breakpoint.icon);
  assert.deepEqual([...kinds].sort(), ['debug-breakpoint', 'debug-breakpoint-conditional', 'debug-breakpoint-disabled',
    'debug-breakpoint-log', 'debug-breakpoint-log-disabled', 'debug-breakpoint-log-unverified', 'debug-breakpoint-unverified']);
  for (const { file, line, icon, enabled = true, condition, logMessage } of plan) {
    const source = read(`review/workspace/${file}`).split('\n');
    assert.ok(source[line - 1]?.trim() && !source[line - 1].trim().startsWith('//'), `${icon}: line ${line} of ${file} is code`);
    assert.equal(enabled, !icon.endsWith('-disabled'), `${icon}: enabled`);
    assert.equal(Boolean(condition), icon.includes('conditional'), `${icon}: condition`);
    assert.equal(Boolean(logMessage), icon.includes('-log'), `${icon}: log message`);
  }
  // The only enabled plain breakpoint is inside stir (the top frame stops on it); its caller holds the conditional one,
  // whose condition is false, so Call Stack Down focuses a conditional breakpoint line without ever stopping on it.
  const target = read('review/workspace/debug-target.js').split('\n');
  const stop = plan.find((breakpoint) => breakpoint.icon === 'debug-breakpoint');
  const caller = plan.find((breakpoint) => breakpoint.icon === 'debug-breakpoint-conditional');
  assert.equal(stop.file, 'debug-target.js');
  assert.match(target.slice(0, stop.line - 1).reverse().find((text) => /^\S/.test(text)), /^function stir\(/, 'the plain breakpoint is inside stir');
  assert.match(target[caller.line - 1], /stir\(/, 'the conditional breakpoint is on the call');
  assert.match(caller.condition, /^brewed < 0$/, 'a condition that is false in the fixture');
  assert.ok(!read('review/workspace/debug-target.js').includes('unbrewed'), 'debug-target.js never loads unbrewed.js');
  // The keep-alive timer (Pause needs a running program) must end on its own if Stop misses the process.
  assert.match(read('review/workspace/debug-target.js'), /clearInterval\(alive\)/);
  assert.doesNotMatch(read('review/workspace/debug-target.js'), /setInterval\(\(\) => \{\}/);
  assert.ok(plan.filter((breakpoint) => breakpoint.icon.endsWith('-unverified')).every((breakpoint) => breakpoint.file === 'unbrewed.js'));
  const helper = read('review/helper-extension/extension.js');
  assert.match(helper, /require\('\.\/breakpoints\.json'\)/);
  assert.match(helper, /removeBreakpoints\(vscode\.debug\.breakpoints\)/, 'the command replaces earlier breakpoints');
});

test('gates 3 and 4 capture one icon-sheet scene per page, each checking on screen that every row is visible', () => {
  // The helper pages the sheet (51 drawings a page at 200%); each scene waits for its page and until no view scrolls and
  // every row icon lies inside the panel. Both side bars are closed first, so the panel has its full width. Gate 3 had
  // two pages (71 drawings); gate 4 has three.
  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
  for (const [file, pages] of [['review/jobs/gate-3.json', 2], ['review/jobs/gate-4.json', 3]]) {
    const scenes = json(file).scenes.filter((scene) => scene.name.startsWith('icon-sheet'));
    assert.deepEqual(scenes.map((scene) => scene.name), ['icon-sheet', 'icon-sheet-2', 'icon-sheet-3'].slice(0, pages));
    const presses = scenes[0].setup.map((step) => step.press);
    const maximize = keyOf('workbench.action.toggleMaximizedPanel');
    for (const command of ['workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar']) {
      assert.ok(presses.indexOf(keyOf(command)) >= 0 && presses.indexOf(keyOf(command)) < presses.indexOf(maximize), `runs ${command} before maximizing`);
    }
    for (const scene of scenes.slice(1)) assert.equal(scene.setup[0].press, keyOf('spellboundReview.iconSheetPage'), `${scene.name} turns the page`);
    scenes.forEach((scene, index) => {
      const waits = scene.setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''));
      assert.ok(waits.some((wait) => wait.includes(`'page ${index + 1} of ${pages}'`)), `${file} ${scene.name} waits for page ${index + 1}`);
      const check = waits.find((wait) => wait.includes('.monaco-list-rows'));
      assert.ok(check, `${scene.name} waits, not optionally, until every row is visible`);
      assert.match(check, /lists\.length === 3/);
      assert.match(check, /rows\.offsetHeight <= list\.clientHeight/, 'no view scrolls');
      assert.match(check, /r\.right <= box\.right/, 'every row icon is inside the panel');
    });
  }
});

test('every scene that moves the pointer parks it on the status bar and waits for tooltips to close before the next scene', () => {
  // Gate-3 dry run 2026-10-10T13-37-53: the pointer left on the Call Stack row stayed there for every later scene, so the
  // icon sheet showed a hover-highlighted row and its tooltip. A Call Stack frame's tooltip is an absolute path, which
  // holds the Windows user directory.
  const scenes = GATES.flatMap((file) => json(file).scenes.map((scene) => ({ file, scene })))
    .filter(({ scene }) => [...(scene.setup ?? []), ...(scene.teardown ?? [])].some((step) => step.hover));
  assert.ok(scenes.length >= 2);
  for (const { file, scene } of scenes) {
    const [park, wait] = (scene.teardown ?? []).slice(-2);
    assert.match(String(park?.hover), /\.part\.statusbar/, `${file} ${scene.name}: the teardown parks the pointer on the status bar`);
    assert.ok(wait && !wait.optional && /\.workbench-hover, \.monaco-hover/.test(String(wait.waitFor)), `${file} ${scene.name}: then waits for tooltips to close`);
    for (const key of ['workbench.hover.delay', 'workbench.hover.reducedDelay']) {
      assert.ok(scene.settings?.[key] >= 60000, `${file} ${scene.name}: ${key} keeps tooltips off its own captures`);
    }
  }
  const capture = read('scripts/review/capture.mjs');
  const shot = capture.indexOf("await shoot('full')");
  assert.ok(capture.lastIndexOf("label: 'hover tooltips to close'", shot) > capture.lastIndexOf('await delay(1500)', shot), 'every screenshot waits for tooltips to close');
  // The hover point goes to CDP unscaled in both capture modes (measured in a zoom-mode run at 200%).
  assert.match(capture, /dispatchMouseEvent', \{ type: 'mouseMoved', x, y \}/);
});

test('the Breakpoints view is on screen where gate 3 claims it: other Run views hidden, waits check the viewport', () => {
  // Gate-3 dry run 2026-10-10T13-37-53: at 200% the Run view ended at Call Stack and the Breakpoints rows were out of view,
  // although the waits (which only checked the DOM) passed.
  const bindings = json('review/profile/keybindings.json');
  const hide = bindings.find((binding) => binding.command === 'runCommands' && binding.args.commands.includes('workbench.debug.variablesView.toggleVisibility'));
  assert.deepEqual(hide.args.commands, ['workbench.debug.variablesView.toggleVisibility', 'workbench.debug.watchExpressionsView.toggleVisibility']);
  const scenes = json('review/jobs/gate-3.json').scenes;
  const presses = scenes.find((scene) => scene.name === 'breakpoints').setup.map((step) => step.press);
  assert.equal(presses.indexOf(hide.key), presses.indexOf(keyOfDebugView()) + 1, 'the views are hidden right after the Run view opens');
  for (const [name, selectors] of [['breakpoints', ['debug-breakpoint', 'debug-breakpoint-disabled', 'debug-breakpoint-log', 'debug-breakpoint-log-disabled', 'debug-breakpoint-conditional']],
    ['debug-stopped', ['debug-breakpoint-unverified']]]) {
    const waits = scenes.find((scene) => scene.name === name).setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''));
    const check = waits.find((wait) => wait.includes('.debug-breakpoints'));
    assert.ok(check, `${name} waits for the Breakpoints view`);
    assert.match(check, /inside\(r, body\) && inside\(r, side\)/, `${name}: inside its pane and the side bar, not just in the DOM`);
    for (const id of selectors) assert.ok(check.includes(`'.codicon-${id}'`), `${name}: ${id}`);
  }
  function keyOfDebugView() { return bindings.find((binding) => binding.command === 'workbench.view.debug').key; }
});

// ---- Gate 4: editor and symbols batches ----
// pinned-dirty has no class of its own: 1.141's CSS swaps the content of a dirty pinned tab's codicon-pinned button to
// var(--vscode-icon-pinned-dirty-content), so the gate waits for that button on a tab that is both sticky and dirty.
const DRAWN_THROUGH = {
  'pinned-dirty': ['.tab.sticky.dirty > .tab-actions .codicon-pinned'],
};
const gate4 = () => json('review/jobs/gate-4.json');
const gate4Waits = () => gate4().scenes.flatMap((scene) => (scene.setup ?? []).filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''))).join(' ');

test('gate 4 waits, without an optional step, for every editor and symbols ID on screen', () => {
  // Checked in VS Code 1.141 while writing the plan: every one of the 49 IDs then pinned is drawn somewhere the review profile
  // reaches, so no ID is excused. Each wait checks that the icon lies inside its container's box, not just in the DOM.
  const waits = gate4Waits();
  const { ids } = json('icons/product-icon-ids.json');
  const batchIds = Object.entries(ids).filter(([, entry]) => ['editor', 'symbols'].includes(entry.batch)).map(([id]) => id);
  assert.equal(batchIds.length, 53, '34 editor IDs (with G11 gutter-lightbulb-sparkle-filled) and 19 symbols (with the four G34 shares)');
  for (const id of Object.keys(PINNED_AFTER_GATE_4_RUN)) assert.ok(batchIds.includes(id), id);
  for (const id of Object.keys(DRAWN_THROUGH)) assert.ok(batchIds.includes(id), id);
  for (const id of batchIds.filter((candidate) => !(candidate in PINNED_AFTER_GATE_4_RUN))) {
    for (const selector of DRAWN_THROUGH[id] ?? [`codicon-${id}`]) {
      assert.match(waits, new RegExp(`${selector.replace(/[.()]/g, '\\$&')}(?![\\w-])`), `${id}: ${selector}`);
    }
  }
  for (const scene of gate4().scenes.filter((candidate) => !candidate.name.startsWith('icon-sheet'))) {
    const checks = scene.setup.filter((step) => /'[^']*\.codicon-[^']*'/.test(String(step.waitFor ?? '')));
    assert.ok(checks.length, `${scene.name} waits for an icon`);
    for (const step of checks) {
      assert.match(step.waitFor, /r\.left >= box\.left && r\.right <= box\.right && r\.top >= box\.top && r\.bottom <= box\.bottom/, `${scene.name}: on screen`);
    }
  }
});

test('gate 4 waits for the two debug IDs pinned after the gate-3 run', () => {
  // G23 and G20 (spec 11.3). For a Node.js launch, 1.141 shows Stop on the floating toolbar and Disconnect as its Alt
  // alternative (focusedSessionIsAttach is false, because js-debug's child session has a launch parent), so the scene
  // holds Alt before it waits for Disconnect. Gate 3's toolbar sheets showed Disconnect only because capture.mjs left
  // Alt held after every chord (probe 2026-10-10T20-28-26 against 2026-10-10T20-35-08).
  const scene = gate4().scenes.find((candidate) => candidate.name === 'debug-disconnect');
  const hold = scene.setup.findIndex((step) => step.hold === 'alt');
  const disconnect = scene.setup.findIndex((step) => !step.optional && String(step.waitFor).includes("'.codicon-debug-disconnect'"));
  assert.ok(hold >= 0 && disconnect === hold + 1, 'holds Alt, then waits for Disconnect on the toolbar');
  assert.match(scene.setup[disconnect].waitFor, /document\.querySelector\('\.debug-toolbar'\)/);
  const unverified = scene.setup.findIndex((step) => !step.optional && String(step.waitFor).includes("'.margin .codicon-debug-breakpoint-log-unverified'"));
  assert.ok(unverified >= 0 && unverified < hold, 'the unbrewed.js logpoint is waited for in the gutter before Alt is held');
  for (const id of Object.keys(WAITED_FOR_AT_GATE_4)) assert.match(gate4Waits(), new RegExp(`codicon-${id}(?![\\w-])`), id);
  const plan = json('review/helper-extension/breakpoints.json').breakpoints;
  assert.deepEqual(plan.find((breakpoint) => breakpoint.icon === 'debug-breakpoint-log-unverified'),
    { file: 'unbrewed.js', line: 3, logMessage: 'unbrewed {unbrewed}', icon: 'debug-breakpoint-log-unverified' });
  // The session ends before the icon sheets: two Stops (the child session, then the launch session) and a wait until the
  // toolbar is gone (dry run 2026-10-10T20-50-52: one Stop left the launch session running).
  const stop = json('review/profile/keybindings.json').find((binding) => binding.command === 'workbench.action.debug.stop').key;
  const [first, second, gone] = scene.teardown;
  assert.equal(first.press, stop);
  assert.equal(second.press, stop);
  assert.match(String(gone.waitFor), /document\.querySelector\('\.debug-toolbar'\)/);
});

test('capture.mjs releases the modifiers of every chord, and holds Alt only where a step asks', () => {
  const capture = read('scripts/review/capture.mjs');
  const press = capture.slice(capture.indexOf('async press(chord)'), capture.indexOf('holdAlt()'));
  assert.match(press, /for \(const \[bit, name, vk\] of \[\[8, 'Shift', 16\], \[2, 'Control', 17\], \[1, 'Alt', 18\], \[4, 'Meta', 91\]\]\)/);
  assert.match(press, /type: 'keyUp', modifiers: held, key: name/);
  assert.match(capture, /holdAlt\(\) \{ return this\.send\('Input\.dispatchKeyEvent', \{ type: 'rawKeyDown', modifiers: 1, key: 'Alt'/);
  assert.match(capture, /if \(step\.hold === 'alt'\) await cdp\.holdAlt\(\);/);
  const holds = GATES.flatMap((file) => json(file).scenes.flatMap((scene) => [...(scene.setup ?? []), ...(scene.teardown ?? [])]
    .filter((step) => step.hold).map(() => `${file} ${scene.name}`)));
  assert.deepEqual(holds, ['review/jobs/gate-4.json debug-disconnect']);
});

test('gate 4 reaches each layout toggle state in the title bar and checks nothing covers it', () => {
  // The layout controls draw panel-left or panel-right (primary side bar), panel-layout-icon (panel) and an
  // auxiliarybar-*-layout-icon (secondary side bar), each with an -off form when that part is hidden; the side bar's
  // location decides left or right. At 200% the Customize Layout picker covered the controls (dry run
  // 2026-10-10T20-52-35), so these waits also check that the icon is the topmost element at its centre.
  const scenes = Object.fromEntries(gate4().scenes.map((scene) => [scene.name, scene]));
  for (const [name, location, ids] of [
    ['layout-on', undefined, ['configure-layout-icon', 'panel-left', 'panel-layout-icon-off', 'auxiliarybar-right-layout-icon']],
    ['layout-off', undefined, ['panel-left-off', 'panel-layout-icon', 'auxiliarybar-right-off-layout-icon']],
    ['layout-right', 'right', ['panel-right', 'auxiliarybar-left-off-layout-icon']],
    ['layout-right-swap', 'right', ['panel-right-off', 'auxiliarybar-left-layout-icon']],
  ]) {
    assert.equal(scenes[name].settings?.['workbench.sideBar.location'], location, name);
    const wait = scenes[name].setup.find((step) => String(step.waitFor).includes('.part.titlebar .titlebar-right .action-toolbar-container')).waitFor;
    for (const id of ids) assert.ok(wait.includes(`'.codicon-${id}'`), `${name}: ${id}`);
    assert.match(wait, /el\.contains\(document\.elementFromPoint\(/, `${name}: not covered`);
  }
  // panel-bottom is the Panel row of the Customize Layout picker; 1.141 draws it nowhere else.
  assert.ok(scenes['layout-customize'].setup.some((step) => String(step.waitFor).includes('.quick-input-widget .monaco-list') && String(step.waitFor).includes("'.codicon-panel-bottom'")));
});

test('gate 4 scene settings: header and row actions always shown, the split direction, no file icon theme for the suggest list', () => {
  const scenes = Object.fromEntries(gate4().scenes.map((scene) => [scene.name, scene]));
  // Explorer title actions (new-file, new-folder, refresh, collapse-all) and SCM row actions (discard, go-to-file) show
  // only under the pointer unless these are set.
  assert.deepEqual(scenes.explorer.settings, { 'workbench.view.alwaysShowHeaderActions': true });
  assert.deepEqual(scenes.scm.settings, { 'scm.alwaysShowActions': true });
  // Split Editor's icon follows the side-by-side direction: split-horizontal by default, split-vertical when "down".
  assert.equal(scenes.tabs.settings, undefined);
  assert.deepEqual(scenes['split-down'].settings, { 'workbench.editor.openSideBySideDirection': 'down' });
  // 1.141 draws symbol-file and symbol-folder in the suggest list only when the file icon theme has no file or folder
  // icons (the suggest widget's renderer); with WitchyNibbles Icons it shows the file icons instead.
  assert.deepEqual(scenes.suggest.settings, { 'workbench.iconTheme': null, 'editor.wordBasedSuggestions': 'off' });
});

test('each gate 4 scene sets up the state it captures and puts the editors back, so it also runs alone', () => {
  // Gate-4 review: layout-right relied on layout-off to close the secondary side bar, and only split-down's teardown put
  // back the editors that tabs pinned and changed, so a cut-down run (--scenes) timed out, or met a dirty file.
  const scenes = Object.fromEntries(gate4().scenes.map((scene) => [scene.name, scene]));
  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
  const primary = [keyOf('workbench.view.explorer'), keyOf('workbench.action.closeSidebar')];
  const secondary = [keyOf('workbench.action.chat.open'), keyOf('workbench.action.closeAuxiliaryBar')];
  for (const name of ['layout-on', 'layout-off', 'layout-right', 'layout-right-swap']) {
    const presses = scenes[name].setup.map((step) => step.press);
    assert.ok(presses.some((press) => primary.includes(press)), `${name} shows or hides the primary side bar itself`);
    assert.ok(presses.some((press) => secondary.includes(press)), `${name} shows or hides the secondary side bar itself`);
  }
  const [pin, unpin, revert, closeAll] = ['workbench.action.pinEditor', 'workbench.action.unpinEditor', 'workbench.action.files.revert',
    'workbench.action.closeAllEditors'].map(keyOf);
  for (const name of ['tabs', 'split-down']) {
    const setup = scenes[name].setup;
    const teardown = scenes[name].teardown.map((step) => step.press);
    assert.equal(setup.filter((step) => step.press === pin).length, 2, `${name} pins its two editors`);
    assert.ok(setup.some((step) => step.insert), `${name} makes one of them dirty`);
    assert.deepEqual([teardown.includes(revert), teardown.filter((press) => press === unpin).length, teardown.at(-1)], [true, 2, closeAll], `${name} puts the editors back`);
  }
});

test('the gate 4 fixtures give one symbol of each kind and a gutter line whose only code actions are AI ones', () => {
  // Go to Symbol lists 9 rows at 200% (dry run 2026-10-10T20-35-08), so the twelve symbol kinds are split over two files.
  const kinds = ['symbols.grimoire', 'charms.grimoire'].map((file) => read(`review/workspace/${file}`).split('\n')
    .map((line) => /^(\w+) (\w+)$/.exec(line)?.[1]).filter(Boolean));
  assert.deepEqual(kinds.map((list) => list.length), [6, 6]);
  assert.deepEqual(kinds.flat().sort(), ['class', 'constant', 'enum', 'field', 'function', 'interface', 'method', 'module', 'namespace', 'property', 'string', 'variable']);
  const helper = read('review/helper-extension/extension.js');
  assert.match(helper, /registerDocumentSymbolProvider\(\{ pattern: '\*\*\/\*\.grimoire' \}/);
  assert.match(helper, /registerCompletionItemProvider\(\{ pattern: '\*\*\/\*\.grimoire' \}/);
  for (const kind of ['Keyword', 'Text', 'Snippet', 'File', 'Folder']) assert.match(helper, new RegExp(`'${kind}'\\]`), kind);
  // 1.141 puts the light bulb in the gutter only for an unindented line between two non-blank, unindented lines
  // (LightBulbWidget.update); otherwise it draws the inline sparkle-filled codicon, which is not this ID.
  const lines = read('review/workspace/hexes.ts').split('\n');
  const keyOf = (command, args) => json('review/profile/keybindings.json').find((binding) => binding.command === command && binding.args === args)?.key;
  assert.ok(keyOf('workbench.action.quickOpen', 'hexes.ts:4'));
  assert.match(lines[3], /^export const crown: number = 'tall';$/, 'a type error no TypeScript quick fix repairs');
  for (const neighbour of [lines[2], lines[4]]) assert.match(neighbour, /^\S.+/);
});

test('every gate 4 quick open waits for a focused row of the file it opens before it presses Enter', () => {
  // The first gate-4 probe lost a quick-open chord at startup (the chat input still had the focus). Waiting for the
  // widget turns that into a stop that names the scene. Gate 5 (spec 6.3): a visible widget is not enough, because Enter
  // opens nothing until a result row is focused, so the wait is the shared focused-row wait, naming the file.
  const quickOpen = new Map(json('review/profile/keybindings.json').filter((binding) => binding.command === 'workbench.action.quickOpen').map((binding) => [binding.key, binding.args]));
  let checked = 0;
  for (const scene of gate4().scenes) {
    for (const phase of ['setup', 'teardown']) {
      const steps = scene[phase] ?? [];
      steps.forEach((step, index) => {
        if (!quickOpen.has(step.press)) return;
        const wait = steps[index + 1];
        assert.equal(wait?.until, 'quick-input-row', `${scene.name} ${phase}[${index}]: waits for a focused row`);
        assert.ok(!wait.optional, `${scene.name} ${phase}[${index}]: not optionally`);
        assert.equal(wait.file, quickOpen.get(step.press).split(':')[0], `${scene.name} ${phase}[${index}]: the row of the file the chord opens`);
        assert.equal(steps[index + 2]?.press, 'Enter', `${scene.name} ${phase}[${index}]: then presses Enter`);
        checked += 1;
      });
    }
  }
  assert.equal(checked, 12, 'every quick open of the gate-4 job');
  assert.doesNotMatch(JSON.stringify(gate4()), /return !!w && w\.style\.display !== 'none' && w\.getBoundingClientRect\(\)\.height > 0; \}\)\(\)/, 'no visibility-only quick-input wait is left');
});

test('every gate 4 quick open follows a wait for the editor group to hold the focus', () => {
  // Fix round 1: scm leaves the focus in the commit input, and a quick-open chord that lands before the focus chord has
  // taken effect never opens the widget (the 200% tabs timeout). Since the last focus chord, a non-optional wait on the
  // focus must come before any quick-open chord.
  const keys = json('review/profile/keybindings.json');
  const quickOpen = new Set(keys.filter((binding) => binding.command === 'workbench.action.quickOpen').map((binding) => binding.key));
  const focus = keys.find((binding) => binding.command === 'workbench.action.focusActiveEditorGroup').key;
  let checked = 0;
  for (const scene of gate4().scenes) {
    let focused = true; // no focus chord yet in this phase: nothing to wait for
    for (const phase of ['setup', 'teardown']) {
      focused = true;
      (scene[phase] ?? []).forEach((step, index) => {
        if (step.press === focus) focused = false;
        else if (!step.optional && String(step.waitFor ?? '').includes("document.activeElement?.closest('.part.editor')")) focused = true;
        else if (quickOpen.has(step.press)) {
          assert.ok(focused, `${scene.name} ${phase}[${index}]: waits for the editor group focus before the quick open`);
          checked += 1;
        }
      });
    }
  }
  assert.ok(checked >= 6, 'the check reached the quick-open chords');
  for (const name of ['tabs', 'split-down', 'ai-lightbulb']) {
    const setup = gate4().scenes.find((scene) => scene.name === name).setup;
    assert.equal(setup[0].press, focus, name);
    assert.match(String(setup[1].waitFor), /^!!document\.activeElement\?\.closest\('\.part\.editor'\)$/, `${name}: the focus wait follows the focus chord`);
    assert.equal(setup[1].timeout, 10000);
  }
});

test('a capture timeout names the scene and step and describes the focus without any text', () => {
  const capture = read('scripts/review/capture.mjs');
  assert.match(capture, /for \(const \[index, step\] of \(scene\.setup \?\? \[\]\)\.entries\(\)\) await runStep\(cdp, step, `\$\{where\} setup\[\$\{index\}\]`\);/);
  assert.match(capture, /for \(const \[index, step\] of \(scene\.teardown \?\? \[\]\)\.entries\(\)\) await runStep\(cdp, step, `\$\{where\} teardown\[\$\{index\}\]`\);/);
  assert.match(capture, /if \(!step\.optional\) throw error\.message\.startsWith\('Timed out'\) \? new Error\(`\$\{where\}: \$\{error\.message\}; \$\{await focusDiagnostics\(cdp\)\}`\) : error;/);
  const diagnostics = capture.slice(capture.indexOf('async function focusDiagnostics'), capture.indexOf('async function runStep'));
  assert.match(diagnostics, /classList/);
  assert.match(diagnostics, /closest\('\.part'\)/);
  assert.match(diagnostics, /\.quick-input-widget/);
  for (const forbidden of ['textContent', 'innerText', '.value', '.title', 'getAttribute', 'outerHTML', 'id']) {
    assert.ok(!new RegExp(`\\.${forbidden}\\b`).test(diagnostics) && !diagnostics.includes(`${forbidden}(`), `no ${forbidden} in the diagnostics`);
  }
});

test('the contact sheet adds a grayscale copy of every capture beside each scale, and closes its agent-browser session', () => {
  // Spec 6.3: every drawing stays identifiable in grayscale, so each scale gets a second column of the same captures with
  // filter: grayscale(1). Gate 4: the session the sheets open stayed open after every gate run; it is closed even when a
  // screenshot fails. A fake agent-browser on PATH records the calls.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spellbound-sheet-'));
  try {
    const bin = path.join(dir, 'bin');
    fs.mkdirSync(bin);
    fs.writeFileSync(path.join(bin, 'agent-browser'), '#!/bin/sh\necho "$*" >> "$SHEET_LOG"\nif [ "$1" = screenshot ] && [ -n "$SHEET_FAIL" ]; then exit 1; fi\nexit 0\n', { mode: 0o755 });
    const run = path.join(dir, 'run');
    fs.mkdirSync(path.join(run, 'captures'), { recursive: true });
    const capture = (scale, crop) => ({ pass: 'main', scale, scene: 'tabs', theme: 'daydream', variant: 'default', crop, file: `main/${scale}/tabs/daydream/default/${crop}.png` });
    fs.writeFileSync(path.join(run, 'captures', 'manifest.json'), JSON.stringify({ vscodeVersion: '1.141.0', mode: 'device-scale', run: 'r', repoCommit: '0123456789', repoDirty: true,
      captures: [capture(1, 'full'), capture(1, 'tabs'), capture(2, 'tabs')] }));
    const sheet = (env) => spawnSync(process.execPath, ['scripts/review/contact-sheet.mjs', run],
      { cwd: root, encoding: 'utf8', timeout: 20000, env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, SHEET_LOG: path.join(dir, 'log'), ...env } });
    const calls = () => fs.readFileSync(path.join(dir, 'log'), 'utf8').trim().split('\n');

    const ok = sheet({});
    assert.equal(ok.status, 0, ok.stderr);
    const html = fs.readFileSync(path.join(run, 'sheets', 'main-tabs-tabs.html'), 'utf8');
    assert.deepEqual([...html.matchAll(/<th>([^<]*)<\/th>/g)].map((match) => match[1]), ['', '100%', '100% grayscale', '200%', '200% grayscale', 'daydream · default']);
    const images = [...html.matchAll(/<img src="([^"]+)"( style="filter:grayscale\(1\)")?>/g)].map((match) => [match[1], Boolean(match[2])]);
    assert.deepEqual(images, [['../captures/main/1/tabs/daydream/default/tabs.png', false], ['../captures/main/1/tabs/daydream/default/tabs.png', true],
      ['../captures/main/2/tabs/daydream/default/tabs.png', false], ['../captures/main/2/tabs/daydream/default/tabs.png', true]]);
    assert.equal(calls().at(-1), 'close', 'the session is closed after the last sheet');

    fs.rmSync(path.join(dir, 'log'));
    const failed = sheet({ SHEET_FAIL: '1' });
    assert.notEqual(failed.status, 0, 'a failed screenshot fails the sheet step');
    assert.deepEqual(calls().slice(-2).map((call) => call.split(' ')[0]), ['screenshot', 'close'], 'and still closes the session');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---- Gate 5: the file-icon sample (spec 6.3) ----
const gate5 = () => json(GATE_5);
const gate5Scene = (name) => gate5().scenes.find((scene) => scene.name === name);
// The sample of spec 6.2 as the Explorer shows it: the src badge folder and its alias, ts, py and json with their other
// extensions, LICENSE and LICENSE.md, and one entry of each default (potions and notes.unknown match no key).
const GATE_5_SAMPLE = {
  folders: ['potions', 'source', 'src'],
  files: ['LICENSE', 'LICENSE.md', 'notes.unknown', 'sample.cts', 'sample.json', 'sample.jsonc', 'sample.mts', 'sample.py', 'sample.pyw', 'sample.ts'],
};
// VS Code marks a row's icon label with "<lower-case name>-name-file-icon" (or -name-folder-icon); the waits look for these.
const fileClass = (name) => `${name.toLowerCase()}-name-file-icon`;
const folderClass = (name) => `${name.toLowerCase()}-name-folder-icon`;
const ON_SCREEN = /r\.left >= box\.left && r\.right <= box\.right && r\.top >= box\.top && r\.bottom <= box\.bottom/;

test('gate 5 opens the file-icon fixture with the WitchyNibbles file and product icon themes, in all four color themes at 100% and 200%', () => {
  const job = gate5();
  assert.equal(job.workspace, 'review/workspace-files');
  assert.deepEqual(job.passes, [{ name: 'main', vsix: ['spellbound-main.vsix'], scales: [1, 2] }]);
  assert.deepEqual(job.scenes.map((scene) => scene.name), ['explorer-closed', 'explorer-open', 'tabs', 'breadcrumbs', 'quick-open', 'symbols']);
  assert.deepEqual(job.commitSheets, ['main-explorer-closed-sidebar', 'main-explorer-open-sidebar', 'main-tabs-tabs', 'main-breadcrumbs-breadcrumbs', 'main-quick-open-widget', 'main-symbols-widget']);
  const base = json('review/profile/settings.base.json');
  assert.equal(base['workbench.iconTheme'], json('package.json').contributes.iconThemes[0].id);
  assert.equal(base['workbench.productIconTheme'], json('package.json').contributes.productIconThemes[0].id);
  for (const scene of job.scenes) {
    for (const key of ['workbench.iconTheme', 'workbench.productIconTheme', 'workbench.colorTheme']) assert.ok(!(key in (scene.settings ?? {})), `${scene.name} keeps ${key}`);
  }
  // capture.mjs shoots every scene in every theme run-gate.mjs reads from the package, and the package has four.
  assert.equal(json('package.json').contributes.themes.length, 4);
  assert.match(read('scripts/review/run-gate.mjs'), /job\.themes = packageJson\.contributes\.themes\.map/);
  for (const scene of job.scenes) {
    const checks = scene.setup.filter((step) => step.waitFor && !step.optional && /\.(monaco-icon-label|codicon-)/.test(step.waitFor));
    assert.ok(checks.length, `${scene.name} waits for its icons`);
    for (const step of checks) assert.match(step.waitFor, ON_SCREEN, `${scene.name}: on screen, not just in the DOM`);
  }
});

test('gate 5 frames the sample in the Explorer and quick open: every other fixture entry is excluded', () => {
  // The fixture holds a file or folder for every key of spec 6 (gate 6 needs them all); at 200% the Explorer shows about
  // 16 rows, so gate 5 hides everything but the sample with files.exclude, a scene setting.
  const keys = [...REQUIRED_FILE_EXTENSIONS, ...REQUIRED_FILE_NAMES, ...REQUIRED_FOLDER_NAMES];
  for (const key of ['src', 'source', 'ts', 'mts', 'cts', 'py', 'pyw', 'json', 'jsonc', 'license', 'license.md']) assert.ok(keys.includes(key), key);
  const top = fs.readdirSync(path.join(root, 'review', 'workspace-files'));
  const sample = [...GATE_5_SAMPLE.folders, ...GATE_5_SAMPLE.files];
  for (const name of sample) assert.ok(top.includes(name), `${name} is in the fixture`);
  for (const name of ['potions', 'notes.unknown']) assert.ok(!keys.includes(name) && !keys.includes(name.split('.').at(-1)), `${name} matches no key`);
  // explorer-open also hides source: with src and potions open, the tree holds 14 full rows at 200% (326 CSS px of 22-px
  // rows), and source is the alias explorer-closed already shows.
  for (const [name, hidden] of [['explorer-closed', []], ['explorer-open', ['source']], ['quick-open', []]]) {
    const exclude = gate5Scene(name).settings['files.exclude'];
    assert.deepEqual(Object.keys(exclude).sort(), [...top.filter((entry) => !sample.includes(entry)), ...hidden].sort(), name);
    assert.ok(Object.values(exclude).every((value) => value === true), name);
  }
});

test('gate 5 shows the sample in the Explorer closed, then src and the default folder open with LICENSE selected in a focused tree', () => {
  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
  const closed = gate5Scene('explorer-closed').setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? '')).find((wait) => wait.includes('.explorer-folders-view'));
  assert.ok(closed, 'explorer-closed waits for the Explorer rows');
  for (const name of [...GATE_5_SAMPLE.folders.map(folderClass), ...GATE_5_SAMPLE.files.map(fileClass)]) assert.ok(closed.includes(`"${name}"`), `explorer-closed: ${name}`);
  assert.ok(closed.includes(`rows.length === ${GATE_5_SAMPLE.folders.length + GATE_5_SAMPLE.files.length}`), 'only the sample');
  assert.match(closed, /const box = list\.getBoundingClientRect\(\)/, 'every row inside the tree, not behind the Outline header');
  assert.match(closed, /rows\.every\(\(r\) => r\.getAttribute\('aria-expanded'\) !== 'true' && !r\.classList\.contains\('selected'\)\)/, 'no folder open, no row selected');
  const collapse = keyOf('workbench.files.action.collapseExplorerFolders');
  for (const name of ['explorer-closed', 'explorer-open']) assert.ok(gate5Scene(name).setup.some((step) => step.press === collapse), `${name} collapses the folders first`);

  const scene = gate5Scene('explorer-open');
  const opened = scene.setup.filter((step) => step.insert).map((step) => step.insert);
  assert.deepEqual(opened, ['src/index.ts', 'potions/.keep', 'LICENSE'], 'opening a child reveals and expands its folder; LICENSE last, so it is the one selected');
  const reveal = json('review/profile/keybindings.json').find((binding) => binding.command === 'runCommands' && binding.args.commands.includes('workbench.files.action.showActiveFileInExplorer'));
  assert.deepEqual(reveal.args.commands, ['workbench.files.action.showActiveFileInExplorer', 'workbench.files.action.focusFilesExplorer']);
  const presses = scene.setup.map((step) => step.press);
  assert.ok(presses.lastIndexOf(reveal.key) > presses.lastIndexOf('Enter'), 'reveals LICENSE and focuses the tree after the last file opens');
  const wait = scene.setup.at(-1).waitFor;
  const shown = [...GATE_5_SAMPLE.folders.filter((name) => name !== 'source').map(folderClass), ...GATE_5_SAMPLE.files.map(fileClass), fileClass('index.ts'), fileClass('.keep')];
  for (const name of shown) assert.ok(wait.includes(`"${name}"`), `explorer-open: ${name}`);
  assert.ok(wait.includes(`rows.length === ${shown.length}`) && shown.length === 14, 'the sample without source, and the two children');
  assert.match(wait, /const box = list\.getBoundingClientRect\(\)/, 'every row inside the tree');
  assert.match(wait, /\['src-name-folder-icon', 'potions-name-folder-icon'\]\.every\(\(name\) => row\(name\)\.getAttribute\('aria-expanded'\) === 'true'\)/);
  assert.match(wait, /license\.classList\.contains\('selected'\) && license\.classList\.contains\('focused'\) && view\.contains\(document\.activeElement\)/,
    'LICENSE on the active selection colour (F9 evidence), not the inactive one');
  assert.deepEqual(scene.teardown.map((step) => step.press), [keyOf('workbench.action.closeAllEditors'), collapse]);
});

test('gate 5 opens ts, py, json and LICENSE in tabs and pins LICENSE, so a tab shows the gate-4 pushpin', () => {
  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
  const scene = gate5Scene('tabs');
  assert.deepEqual(scene.setup.filter((step) => step.insert).map((step) => step.insert), ['sample.ts', 'sample.py', 'sample.json', 'LICENSE']);
  const presses = scene.setup.map((step) => step.press);
  // At 200% (960 CSS px) the editor between the two side bars held about two tabs, and the other two scrolled away.
  for (const command of ['workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar']) {
    assert.ok(presses.indexOf(keyOf(command)) >= 0 && presses.indexOf(keyOf(command)) < scene.setup.findIndex((step) => step.insert), `tabs runs ${command} before it opens a file`);
  }
  assert.ok(presses.indexOf(keyOf('workbench.action.pinEditor')) > presses.lastIndexOf('Enter'), 'pins LICENSE, the active editor');
  const wait = scene.setup.at(-1).waitFor;
  for (const name of ['sample.ts', 'sample.py', 'sample.json', 'LICENSE']) assert.ok(wait.includes(`"${fileClass(name)}"`), name);
  assert.ok(wait.includes("c.querySelectorAll('.tab').length === 4"));
  assert.ok(wait.includes("'.tab.sticky:not(.dirty) > .tab-actions .codicon-pinned'"), 'the pushpin (G32) on the pinned tab');
  assert.ok(wait.includes("classList.contains('license-name-file-icon')"), 'on the LICENSE tab');
  assert.deepEqual(scene.teardown.map((step) => step.press), [keyOf('workbench.action.unpinEditor'), keyOf('workbench.action.closeAllEditors')]);
  const breadcrumbs = gate5Scene('breadcrumbs');
  assert.deepEqual(breadcrumbs.setup.filter((step) => step.insert).map((step) => step.insert), ['src/index.ts']);
  // 1.141 draws no icon on a folder item of the breadcrumb bar, only on the file item.
  assert.ok(breadcrumbs.setup.at(-1).waitFor.includes(`"${fileClass('index.ts')}"`), 'breadcrumbs: index.ts');
  assert.ok(breadcrumbs.setup.at(-1).waitFor.includes("c.querySelectorAll('.monaco-breadcrumb-item.folder').length === 1"), 'breadcrumbs: the src item');
});

test('gate 5 waits for the four symbol shares pinned after the gate-4 run (G34)', () => {
  const scene = gate5Scene('symbols');
  assert.deepEqual(scene.setup.filter((step) => step.insert).map((step) => step.insert), ['fixtures/pins.grimoire']);
  const goto = json('review/profile/keybindings.json').find((binding) => binding.command === 'workbench.action.gotoSymbol').key;
  const presses = scene.setup.map((step) => step.press);
  assert.ok(presses.indexOf(goto) > presses.lastIndexOf('Enter'), 'Go to Symbol in the grimoire');
  const wait = scene.setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? '')).find((candidate) => candidate.includes('.quick-input-widget .monaco-list'));
  for (const id of Object.keys(PINNED_AFTER_GATE_4_RUN)) assert.ok(wait.includes(`'.codicon-${id}'`), id);
  assert.match(wait, ON_SCREEN);
});

test('every gate 5 quick open types its file, waits for that file\'s row to be focused, then presses Enter; quick-open waits for a focused row', () => {
  const keys = json('review/profile/keybindings.json');
  const quickOpen = keys.find((binding) => binding.command === 'workbench.action.quickOpen' && binding.args === undefined).key;
  const focus = keys.find((binding) => binding.command === 'workbench.action.focusActiveEditorGroup').key;
  let checked = 0;
  for (const scene of gate5().scenes) {
    const steps = scene.setup;
    let focused = false; // gate-4 lesson: a quick-open chord is lost while another part (the chat input) holds the focus
    steps.forEach((step, index) => {
      if (step.press === focus) focused = false;
      if (String(step.waitFor ?? '') === "!!document.activeElement?.closest('.part.editor')" && !step.optional) focused = true;
      if (step.press !== quickOpen) return;
      assert.ok(focused, `${scene.name} setup[${index}]: waits for the editor group focus first`);
      const [typed, wait, enter] = steps.slice(index + 1, index + 4);
      assert.ok(typed.insert, `${scene.name} setup[${index}]: types what to open`);
      assert.equal(wait.until, 'quick-input-row', `${scene.name} setup[${index}]: waits for a focused row`);
      assert.ok(!wait.optional);
      if (scene.name === 'quick-open') {
        assert.equal(wait.file, undefined, 'the list scene keeps whichever row quick open focuses');
        assert.notEqual(enter?.press, 'Enter', 'and keeps the list open');
      } else {
        assert.equal(wait.file, typed.insert.split('/').at(-1), `${scene.name} setup[${index}]: the row of ${typed.insert}`);
        assert.equal(enter.press, 'Enter');
      }
      checked += 1;
    });
  }
  assert.equal(checked, 10, 'explorer-open 3, tabs 4, breadcrumbs 1, quick-open 1, symbols 1');
});

test('every launch parks the page pointer on the empty stretch of the activity bar, and no extension recommendation toast opens', () => {
  // Gate-5 dry runs: a 200% launch stopped waiting for tooltips to close before its first capture (the machine's pointer
  // rested over the new window); parked on a status bar gap, the pointer later sat on an item that had grown under it; and
  // opening sample.py raised the "install the recommended Python extension" toast.
  const capture = read('scripts/review/capture.mjs');
  const point = capture.match(/const PARK_POINT = `([^`]+)`;/)?.[1];
  assert.ok(point, 'one park point');
  assert.match(point, /document\.querySelector\('\.part\.activitybar'\)/);
  assert.match(point, /bar\.querySelectorAll\('\.action-item'\)/, 'between the icons, not on one');
  const park = capture.indexOf("await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: park.x, y: park.y });");
  assert.ok(park > capture.indexOf("label: 'the WitchyNibbles product icons'") && park < capture.indexOf('for (const scene of job.scenes'), 'after the launch, before the first scene');
  assert.equal(json('review/profile/settings.base.json')['extensions.ignoreRecommendations'], true);
});
