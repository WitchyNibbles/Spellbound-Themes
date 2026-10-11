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
// The showcase Explorer, top to bottom: folders first, with assets, src and tests open over their files (code, data,
// style, assets and tests icons), then the files (config, docs); .github, docs and scripts stay closed folder badges.
export const EXPANDED = ['assets', 'src', 'tests'];
export const EXPLORER_ROWS = ['.github', 'assets', 'moon.svg', 'docs', 'scripts', 'src', 'familiars.json', 'familiars.ts', 'spellbook.py', 'styles.css',
  'tests', 'familiars.test.ts', '.env.example', '.gitignore', 'CHANGELOG.md', 'LICENSE', 'package.json', 'README.md', 'tsconfig.json'];
export const FOLDERS = ['.github', 'assets', 'docs', 'scripts', 'src', 'tests'];
// Opened and revealed first, then all editors closed: revealing a file expands its folder in the Explorer and the folder
// stays open when the editor closes.
export const EXPAND_FILES = ['assets/moon.svg', 'tests/familiars.test.ts'];
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
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const open = (file) => [
  { press: KEYS.quickOpen, wait: 800 }, { insert: file, wait: 300 }, { until: 'quick-input-row', file: file.split('/').at(-1), timeout: 10000 }, { press: 'Enter', wait: 1500 },
];

// Every Explorer row inside the tree, src open, three tabs with one unsaved, the editor focused, and the ts icon drawn
// from this package's own folder (eimimartinez.<name>-<version>), so the capture shows the installed release.
const showcaseWait = ({ name, version }) => {
  const classes = EXPLORER_ROWS.map((entry) => (FOLDERS.includes(entry) ? folderClass(entry) : fileClass(entry)));
  // Any of the three file icon sets: a run whose first theme is light or high contrast draws that set's icon.
  const icon = new RegExp(`\\.${escapeRegExp(`${name}-${version}`)}/icons/file-icons/(dark|light|high-contrast)/gem-cut\\.svg`);
  return `(() => { const view = document.querySelector('.part.sidebar .explorer-folders-view'); const list = view?.querySelector('.monaco-list'); const tabs = document.querySelector('.part.editor .tabs-and-actions-container'); if (!list || !tabs) return false; const box = list.getBoundingClientRect(); ${INSIDE} const rows = [...view.querySelectorAll('.monaco-list-row')]; const row = (name) => rows.find((r) => r.querySelector('.monaco-icon-label')?.classList.contains(name)); const ts = row(${JSON.stringify(fileClass('familiars.ts'))})?.querySelector('.monaco-icon-label'); return rows.length === ${classes.length} && ${JSON.stringify(classes)}.every((name) => !!row(name) && inside(row(name).querySelector('.monaco-icon-label'))) && row(${JSON.stringify(folderClass('src'))}).getAttribute('aria-expanded') === 'true' && tabs.querySelectorAll('.tab').length === ${OPEN_FILES.length} && tabs.querySelectorAll('.tab.dirty').length === 1 && !!ts && new RegExp(${JSON.stringify(icon.source)}).test(getComputedStyle(ts, '::before').backgroundImage.toLowerCase()) && !!document.activeElement?.closest('.part.editor'); })()`;
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
      // into ".github/workflows", so each row is one folder; no quick-open history ahead of a typed path; assets/moon.svg
      // opened as text (the image preview is a webview outside .part.editor, where the editor-focus wait never passes).
      settings: {
        'workbench.view.alwaysShowHeaderActions': true, 'explorer.compactFolders': false, 'search.quickOpen.includeHistory': false,
        'workbench.editorAssociations': { '*.svg': 'default' },
      },
      setup: [
        { press: KEYS.closeAuxiliaryBar, wait: 500 }, { press: KEYS.explorer, wait: 1200 }, { press: KEYS.collapse, wait: 500 }, ...focusEditor,
        ...EXPAND_FILES.flatMap((file) => [...open(file), { press: KEYS.reveal, wait: 1000 }, ...focusEditor]), { press: KEYS.closeAll, wait: 800 },
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
        // The panel is maximized before the terminal starts: a resize after the ritual has printed makes ConPTY repaint
        // only the rows the small panel showed, and ll's listing is left in the scrollback (the first release run). It
        // opens on the icon sheet: opened on its Terminal view, the panel starts a terminal of its own, a second one.
        { press: KEYS.closeSidebar, wait: 500 }, { press: KEYS.closeAuxiliaryBar, wait: 500 }, ...focusEditor,
        { press: KEYS.iconSheet, wait: 1500 }, { press: KEYS.maximizePanel, wait: 1500 },
        { waitFor: "(document.querySelector('.part.panel')?.getBoundingClientRect().height ?? 0) > window.innerHeight / 2", timeout: 10000 },
        { press: KEYS.newTerminal, wait: 8000 },
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
