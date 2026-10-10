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

const GATES = ['review/jobs/gate-1.json', 'review/jobs/gate-2.json'];
const JOBS = [...GATES, 'review/jobs/smoke.json'];
const PLAIN_KEYS = new Set(['Enter', 'Escape', 'Tab', 'Backspace']);

test('every file the harness needs exists', () => {
  for (const file of [
    'review/workspace/spells.ts', 'review/workspace/debug-target.js', 'review/workspace/notes.md', 'review/workspace/README.md',
    'review/workspace/.vscode/launch.json', 'review/profile/settings.base.json', 'review/profile/keybindings.json',
    'review/helper-extension/package.json', 'review/helper-extension/extension.js', 'review/helper-extension/README.md',
    'review/helper-extension/media/sheet.svg', ...JOBS,
    'scripts/review/stage-extension.mjs', 'scripts/review/capture.mjs', 'scripts/review/run-gate.mjs', 'scripts/review/contact-sheet.mjs',
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
        assert.ok(step.press || step.insert || step.waitFor || step.wait, `${file} ${scene.name}: empty step`);
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

test('the terminal profile used for command decorations gets shell integration injected', () => {
  // VS Code 1.141 injects shell integration on Windows only into powershell.exe, pwsh.exe and Git Bash, and only when the
  // profile's args are empty or just -NoLogo (ptyHostMain.js). The default WSL fish profile gets none, so no decorations.
  const binding = json('review/profile/keybindings.json').find((candidate) => candidate.command === 'workbench.action.terminal.newWithProfile');
  const profile = json('review/profile/settings.base.json')['terminal.integrated.profiles.windows'][binding.args.profileName];
  assert.match(profile.path, /\\powershell\.exe$/i);
  assert.ok(profile.args.length === 0 || (profile.args.length === 1 && profile.args[0].toLowerCase() === '-nologo'), JSON.stringify(profile.args));
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

test('the icon sheet shows every drawing at every scale: side-by-side views in a maximized panel', () => {
  // Gate run 2026-10-10T01-41-22: the single tree in a default-height panel showed 13 rows at 100% and 5 at 200%.
  // Phase 2 passes 36 drawings, the most two views hold at 200%, so the helper contributes three.
  const helper = json('review/helper-extension/package.json');
  const views = helper.contributes.views.spellboundReview;
  assert.ok(views.length >= 2, 'several views share the panel width');
  const source = read('review/helper-extension/extension.js');
  assert.match(source, /require\('\.\/package\.json'\)\.contributes\.views\.spellboundReview/, 'extension.js fills every contributed view');
  // Maximized panel at 200% on a 1080p screen: about 516 CSS px window, minus title bar, status bar and panel header.
  const drawings = Object.keys(json('icons/product-icon-map.json').drawings).length;
  const rowsPerView = Math.ceil(drawings / views.length);
  assert.ok(rowsPerView * 22 + 22 <= 516 - 35 - 22 - 35, `${rowsPerView} rows fit a maximized panel at 200%`);

  const maximize = json('review/profile/keybindings.json').find((binding) => binding.command === 'workbench.action.toggleMaximizedPanel');
  assert.ok(maximize, 'a chord toggles the maximized panel');
  for (const file of GATES) {
    const scene = json(file).scenes.find((candidate) => candidate.name === 'icon-sheet');
    assert.ok(scene.setup.some((step) => step.press === maximize.key), `${file}: setup maximizes the panel`);
    const teardown = scene.teardown.map((step) => step.press);
    assert.ok(teardown.indexOf(maximize.key) >= 0 && teardown.indexOf(maximize.key) < teardown.indexOf('ctrl+alt+shift+e'),
      `${file}: teardown restores the panel size before closing it, so later scenes keep the default layout`);
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
  assert.ok(presses.indexOf(keyOf('workbench.action.terminal.newWithProfile')) < presses.indexOf(maximize), 'opens the terminal, then maximizes');
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
