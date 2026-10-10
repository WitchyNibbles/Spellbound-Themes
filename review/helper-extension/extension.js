// Review helper: shows every mapped drawing at 16px in two trees, creates a Testing provider so the Testing
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
  // Two views side by side, so every row fits a maximized panel even at 200%.
  const half = Math.ceil(items.length / 2);
  for (const [id, part] of [['spellboundReview.iconSheet', items.slice(0, half)], ['spellboundReview.iconSheet2', items.slice(half)]]) {
    context.subscriptions.push(vscode.window.registerTreeDataProvider(id, { getTreeItem: (item) => item, getChildren: () => part }));
  }

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
