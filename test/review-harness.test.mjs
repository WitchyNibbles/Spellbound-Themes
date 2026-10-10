// Task 17: the gate screenshot harness. The capture itself needs Windows VS Code, so these tests pin the parts
// that can go wrong without it: job files that reference real chords, scenes and drawings, a capture script that
// runs outside the repo on Node built-ins alone, and a helper extension that never reaches the published package.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const exists = (file) => fs.existsSync(path.join(root, file));

const GATES = ['review/jobs/gate-1.json', 'review/jobs/gate-2.json', 'review/jobs/gate-3.json'];
const JOBS = [...GATES, 'review/jobs/smoke.json'];
const PLAIN_KEYS = new Set(['Enter', 'Escape', 'Tab', 'Backspace']);

test('every file the harness needs exists', () => {
  for (const file of [
    'review/workspace/spells.ts', 'review/workspace/debug-target.js', 'review/workspace/notes.md', 'review/workspace/README.md',
    'review/workspace/unbrewed.js', 'review/workspace/brews.spec.js', 'review/helper-extension/breakpoints.json',
    'review/workspace/.vscode/launch.json', 'review/profile/settings.base.json', 'review/profile/keybindings.json',
    'review/helper-extension/package.json', 'review/helper-extension/extension.js', 'review/helper-extension/README.md',
    'review/helper-extension/media/sheet.svg', ...JOBS,
    'scripts/review/stage-extension.mjs', 'scripts/review/capture.mjs', 'scripts/review/run-gate.mjs', 'scripts/review/contact-sheet.mjs',
    'scripts/review/args.mjs', 'scripts/review/privacy-scan.mjs',
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
        assert.ok(step.press || step.insert || step.hover || step.waitFor || step.wait, `${file} ${scene.name}: empty step`);
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
  for (const file of GATES) {
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
  const runGate = read('scripts/review/run-gate.mjs');
  assert.match(runGate, /'checkout', '-q', '-b', 'rival-brew'/, 'the fixture has a branch that conflicts');
  assert.match(runGate, /'remote', 'add', 'origin', '\.\.\/origin\.git'/, 'the fixture has an upstream with a relative URL');
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
  // Gate 3 ends with 71 drawings (47 + 6 panel + 18 debug): two pages, whatever the map holds now.
  const drawings = Math.max(71, Object.keys(json('icons/product-icon-map.json').drawings).length);
  assert.equal(Math.ceil(drawings / (17 * views.length)), 2);
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
  assert.match(read('scripts/review/run-gate.mjs'), /git\('config', 'core\.autocrlf', 'false'\)/);
});

test('restoring the workspace never shows up as a change in the terminal listing', () => {
  // Gate run 2026-10-10T02-02-52: files rewritten from Windows lose their WSL mode bits, so WSL git (ll, the prompt)
  // listed every file as modified. The fixture repo ignores modes, and only files whose content changed are rewritten.
  assert.match(read('scripts/review/run-gate.mjs'), /git\('config', 'core\.fileMode', 'false'\)/);
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
// Pinned by the author at gate 3 (spec 11.3), after run 2026-10-10T15-54-10; the gate-4 job must wait for them.
const PINNED_AFTER_GATE_3_RUN = {
  'debug-disconnect': 'G23: the Node.js floating toolbar shows it in Stop\'s place (js-debug focuses a child session)',
  'debug-breakpoint-log-unverified': 'G20: needs a logpoint in a file the debugger has not loaded (unbrewed.js)',
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
    if (id in NOT_IN_CONTEXT || id in PINNED_AFTER_GATE_3_RUN) continue;
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
  assert.ok(loop.indexOf('settingsFor(job.themes[0], sceneSettings)') < loop.indexOf('for (const step of scene.setup'), 'scene settings are written before the setup');
  assert.match(loop, /settingsFor\(theme, \{ \.\.\.sceneSettings, \.\.\.variant\.settings \}\)/, 'and kept for every capture');
});

test('gate 3 reaches debug-hint by moving the pointer onto the glyph margin', () => {
  const scene = json('review/jobs/gate-3.json').scenes.find((candidate) => candidate.name === 'breakpoints');
  const hover = scene.setup.findIndex((step) => step.hover);
  assert.ok(hover >= 0, 'a hover step');
  assert.match(scene.setup[hover].hover, /\.glyph-margin/);
  assert.ok(scene.setup.slice(hover + 1).some((step) => !step.optional && String(step.waitFor).includes('codicon-debug-hint')), 'then waits for the hint');
  assert.match(read('scripts/review/capture.mjs'), /Input\.dispatchMouseEvent', \{ type: 'mouseMoved'/);
});

test('the gate 3 breakpoint plan sets each breakpoint kind 1.141 draws once, on code, and stops where the stackframe overlays need it', () => {
  const plan = json('review/helper-extension/breakpoints.json').breakpoints;
  const kinds = plan.map((breakpoint) => breakpoint.icon);
  assert.deepEqual([...kinds].sort(), ['debug-breakpoint', 'debug-breakpoint-conditional', 'debug-breakpoint-disabled',
    'debug-breakpoint-log', 'debug-breakpoint-log-disabled', 'debug-breakpoint-unverified']);
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

test('gate 3 captures one icon-sheet scene per page, each checking on screen that every row is visible', () => {
  // The helper pages the sheet (51 drawings a page at 200%); each scene waits for its page and until no view scrolls and
  // every row icon lies inside the panel. Both side bars are closed first, so the panel has its full width.
  const keyOf = (command) => json('review/profile/keybindings.json').find((binding) => binding.command === command)?.key;
  const scenes = json('review/jobs/gate-3.json').scenes.filter((scene) => scene.name.startsWith('icon-sheet'));
  assert.deepEqual(scenes.map((scene) => scene.name), ['icon-sheet', 'icon-sheet-2']);
  const presses = scenes[0].setup.map((step) => step.press);
  const maximize = keyOf('workbench.action.toggleMaximizedPanel');
  for (const command of ['workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar']) {
    assert.ok(presses.indexOf(keyOf(command)) >= 0 && presses.indexOf(keyOf(command)) < presses.indexOf(maximize), `runs ${command} before maximizing`);
  }
  assert.equal(scenes[1].setup[0].press, keyOf('spellboundReview.iconSheetPage'), 'the second scene turns the page');
  scenes.forEach((scene, index) => {
    const waits = scene.setup.filter((step) => !step.optional).map((step) => String(step.waitFor ?? ''));
    assert.ok(waits.some((wait) => wait.includes(`'page ${index + 1} of 2'`)), `${scene.name} waits for page ${index + 1}`);
    const check = waits.find((wait) => wait.includes('.monaco-list-rows'));
    assert.ok(check, `${scene.name} waits, not optionally, until every row is visible`);
    assert.match(check, /lists\.length === 3/);
    assert.match(check, /rows\.offsetHeight <= list\.clientHeight/, 'no view scrolls');
    assert.match(check, /r\.right <= box\.right/, 'every row icon is inside the panel');
  });
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
