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

  // VS Code 1.141 purges a toast after 10 s (info), 12 s (warning) or 15 s (error) while the window has focus, but the
  // capture loop shoots four themes after one setup. While spellboundReview.severities is on, every theme change raises
  // the three toasts again, so each theme gets fresh ones well before its screenshot (capture.mjs waits 1.5 s after the
  // theme applies). VS Code closes a toast whose message matches the new one, so the stack keeps three toasts.
  const raiseSeverities = () => {
    vscode.window.showInformationMessage('The moon is waxing.');
    vscode.window.showWarningMessage('The cauldron is simmering.');
    vscode.window.showErrorMessage('The potion curdled.');
  };
  let severitiesListener;

  context.subscriptions.push(controller, diagnostics, ...signals, { dispose: () => severitiesListener?.dispose() },
    vscode.commands.registerCommand('spellboundReview.notify', () =>
      vscode.window.showWarningMessage('The cauldron needs attention: this message is long on purpose, so the toast shows its expand chevron, its configure gear and its close button for the review screenshots.', 'Stir')),
    vscode.commands.registerCommand('spellboundReview.severities', () => {
      if (severitiesListener) {
        severitiesListener.dispose();
        severitiesListener = undefined;
        return;
      }
      severitiesListener = vscode.window.onDidChangeActiveColorTheme(raiseSeverities);
      raiseSeverities();
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
