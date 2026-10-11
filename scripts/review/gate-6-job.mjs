// Review gate 6 (spec 6.3): the gate-5 scenes over the whole file-icon fixture. The job is generated, because its 24
// scenes repeat four templates over pages of the fixture: `node scripts/review/gate-6-job.mjs` writes
// review/jobs/gate-6.json, and test/review-gate-6.test.mjs fails if the committed job drifts from this generator.
// Every template is the gate-5 scene it copies (review/jobs/gate-5.json), with the same chords and the same waits.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FIXTURE = 'review/workspace-files';

// Explorer pages over every top-level file of the fixture, folders hidden, at most 13 rows (at 200% the tree shows
// 14 full rows, gate 5). Grouped by batch, look-alikes on one page: the gems with tsconfig and the two keys; the stack
// shapes; the config objects; the sheets and books; the assets; the flask's keys.
export const FILE_PAGES = {
  'explorer-gems-keys': ['sample.js', 'sample.mjs', 'sample.cjs', 'sample.ts', 'sample.mts', 'sample.cts', 'sample.tsx', 'sample.jsx', 'tsconfig.json', 'jsconfig.json', 'sample.json', 'sample.html', 'sample.htm'],
  'explorer-code-data': ['sample.py', 'sample.pyw', 'sample.sh', 'sample.ps1', 'sample.fish', 'sample.css', 'sample.scss', 'sample.less', 'sample.sql', 'sample.jsonc', 'sample.jsonl', 'sample.db', 'sample.yaml'],
  'explorer-config': ['sample.yml', 'sample.toml', 'sample.env', 'sample.lock', '.env', '.env.local', '.env.development', '.env.production', '.env.example', '.gitignore', 'Dockerfile', 'package.json', 'pyproject.toml'],
  'explorer-docs': ['requirements.txt', 'package-lock.json', 'yarn.lock', 'Cargo.lock', 'poetry.lock', 'sample.md', 'sample.mdx', 'sample.txt', 'README.md', 'CHANGELOG.md', 'LICENSE', 'LICENSE.md', 'notes.unknown'],
  'explorer-assets': ['sample.svg', 'sample.png', 'sample.jpg', 'sample.jpeg', 'sample.gif', 'sample.webp', 'sample.ttf', 'sample.otf', 'sample.woff', 'sample.woff2', 'conftest.py', 'pytest.ini', 'jest.config.js'],
  'explorer-tests': ['jest.config.ts', 'jest.config.mjs', 'jest.config.cjs', 'jest.config.json', 'sample.test.ts', 'sample.test.tsx', 'sample.test.js', 'sample.test.jsx', 'sample.test.mjs', 'sample.test.cjs', 'sample.test.mts', 'sample.test.cts'],
  'explorer-specs': ['sample.spec.ts', 'sample.spec.tsx', 'sample.spec.js', 'sample.spec.jsx', 'sample.spec.mjs', 'sample.spec.cjs', 'sample.spec.mts', 'sample.spec.cts'],
};
// Every folder of the fixture in four groups of five: two closed pages of ten rows, four open pages of ten rows (each
// folder and its one child). No group holds two folders whose names contain one another (test, tests and __tests__;
// cache and __pycache__), so with the rest of the fixture hidden the typed path matches one file only. The closed pages
// put the look-alike badges together: the src grimoire and the lib books (page 1), the dist bottle, the cache jar and
// the tests flask (page 2), the test flask and the fixtures card (page 1).
export const FOLDER_GROUPS = [
  ['src', 'source', 'lib', 'bin', 'potions'],
  ['scripts', 'test', 'fixtures', 'docs', 'assets'],
  ['tests', 'cache', '.github', 'workflows', '.claude'],
  ['__tests__', '__pycache__', 'dist', '.venv', 'node_modules'],
];
const CHILDREN = { src: 'index.ts', fixtures: 'pins.grimoire' };
const childOf = (folder) => CHILDREN[folder] ?? '.keep';
// Tabs: every file drawing gate 6 adds, four tabs a page (at 200% the editor between the closed side bars holds four,
// gate 5), with the gate-5 ts gem and json keyring beside their look-alikes.
export const TAB_PAGES = {
  'tabs-gems': ['sample.js', 'sample.tsx', 'sample.ts', 'sample.html'],
  'tabs-code': ['sample.sh', 'sample.ps1', 'sample.fish', 'sample.css'],
  'tabs-data': ['sample.sql', 'sample.jsonl', 'sample.db', 'sample.yaml'],
  'tabs-config': ['sample.toml', 'sample.env', 'sample.lock', 'package.json'],
  'tabs-config-2': ['tsconfig.json', 'Dockerfile', '.gitignore', 'sample.json'],
  'tabs-docs': ['sample.md', 'sample.txt', 'README.md', 'CHANGELOG.md'],
  'tabs-assets-tests': ['sample.svg', 'sample.png', 'sample.ttf', 'sample.test.ts'],
};
// Quick open: six sample files a page, the rest of the fixture hidden, `sample.` typed, the first row focused (F9).
export const QUICK_OPEN_PAGES = {
  'quick-open-code': ['sample.js', 'sample.tsx', 'sample.html', 'sample.sh', 'sample.ps1', 'sample.fish'],
  'quick-open-data': ['sample.css', 'sample.sql', 'sample.jsonl', 'sample.db', 'sample.yaml', 'sample.toml'],
  'quick-open-assets': ['sample.env', 'sample.lock', 'sample.md', 'sample.svg', 'sample.ttf', 'sample.test.ts'],
};
export const BREADCRUMBS_FILE = 'README.md';

const KEYS = {
  explorer: 'ctrl+alt+shift+4', // workbench.view.explorer
  collapse: 'alt+shift+F9', // workbench.files.action.collapseExplorerFolders
  focusEditor: 'ctrl+alt+shift+a', // workbench.action.focusActiveEditorGroup
  quickOpen: 'alt+shift+F7', // workbench.action.quickOpen
  reveal: 'alt+shift+F8', // reveal the active file and focus the Files Explorer
  closeAll: 'alt+shift+F5', // workbench.action.closeAllEditors
  closeSidebar: 'ctrl+alt+shift+F8',
  closeAuxiliaryBar: 'ctrl+alt+shift+F9',
};
const fileClass = (name) => `${name.toLowerCase()}-name-file-icon`;
const folderClass = (name) => `${name.toLowerCase()}-name-folder-icon`;
const INSIDE = 'const inside = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom; };';
const focusEditor = [{ press: KEYS.focusEditor, wait: 500 }, { waitFor: "!!document.activeElement?.closest('.part.editor')", timeout: 10000 }];
const open = (file) => [
  { press: KEYS.quickOpen, wait: 800 }, { insert: file, wait: 300 }, { until: 'quick-input-row', file: file.split('/').at(-1), timeout: 10000 }, { press: 'Enter', wait: 1500 },
];
// The gate-5 Explorer wait: exactly these rows, each label inside the tree's list box; closed: nothing expanded or
// selected and the tree not focused; open: these folders expanded, the focus in the tree.
const explorerWait = (classes, expanded) => `(() => { const view = document.querySelector('.part.sidebar .explorer-folders-view'); const list = view?.querySelector('.monaco-list'); if (!list) return false; const box = list.getBoundingClientRect(); ${INSIDE} const rows = [...view.querySelectorAll('.monaco-list-row')]; const row = (name) => rows.find((r) => r.querySelector('.monaco-icon-label')?.classList.contains(name)); return rows.length === ${classes.length} && ${JSON.stringify([...new Set(classes)])}.every((name) => !!row(name) && inside(row(name).querySelector('.monaco-icon-label'))) && ${expanded
  ? `${JSON.stringify(expanded)}.every((name) => row(name).getAttribute('aria-expanded') === 'true') && view.contains(document.activeElement)`
  : "rows.every((r) => r.getAttribute('aria-expanded') !== 'true' && !r.classList.contains('selected')) && !view.contains(document.activeElement)"}; })()`;
const labelsWait = (container, classes, extra = '') => `(() => { const c = document.querySelector('${container}'); const box = c?.getBoundingClientRect(); if (!box || !box.width) return false; ${INSIDE} const labels = [...c.querySelectorAll('.monaco-icon-label')]; return ${JSON.stringify(classes)}.every((name) => labels.some((el) => el.classList.contains(name) && inside(el)))${extra}; })()`;
const exclude = (entries, shown) => ({ 'files.exclude': Object.fromEntries(entries.filter((entry) => !shown.includes(entry)).sort().map((entry) => [entry, true])) });
const SIDEBAR = [{ name: 'sidebar', selector: '.part.sidebar', maxHeight: 420 }];
// Quick open ranks recently opened files first, and every theme and scale repeats the scenes: every scene that opens a
// file hides the rest of the fixture and turns the history off, so the typed name or path matches one file.
const NO_HISTORY = { 'search.quickOpen.includeHistory': false };

export function gate6Job(entries) {
  const folders = FOLDER_GROUPS.flat();
  const scenes = [
    ...Object.entries(FILE_PAGES).map(([name, files]) => ({
      name, settings: exclude(entries, files),
      setup: [{ press: KEYS.explorer, wait: 1200 }, { press: KEYS.collapse, wait: 500 }, ...focusEditor, { waitFor: explorerWait(files.map(fileClass)) }],
      crops: SIDEBAR,
    })),
    ...[FOLDER_GROUPS.slice(0, 2).flat(), FOLDER_GROUPS.slice(2).flat()].map((shown, index) => ({
      name: `explorer-folders${index ? `-${index + 1}` : ''}`, settings: exclude(entries, shown),
      setup: [{ press: KEYS.explorer, wait: 1200 }, { press: KEYS.collapse, wait: 500 }, ...focusEditor, { waitFor: explorerWait(shown.map(folderClass)) }],
      crops: SIDEBAR,
    })),
    ...FOLDER_GROUPS.map((group, index) => ({
      name: `explorer-open${index ? `-${index + 1}` : ''}`,
      // node_modules is in VS Code's default search.exclude, which quick open honours.
      settings: { ...exclude(entries, group), ...NO_HISTORY, ...(group.includes('node_modules') ? { 'search.exclude': { '**/node_modules': false } } : {}) },
      setup: [
        { press: KEYS.explorer, wait: 1200 }, { press: KEYS.collapse, wait: 500 }, ...focusEditor,
        ...group.flatMap((folder) => open(`${folder}/${childOf(folder)}`)),
        { press: KEYS.reveal, wait: 1000 },
        { waitFor: explorerWait(group.flatMap((folder) => [folderClass(folder), fileClass(childOf(folder))]), group.map(folderClass)) },
      ],
      crops: SIDEBAR,
      teardown: [{ press: KEYS.closeAll, wait: 800 }, { press: KEYS.collapse, wait: 500 }],
    })),
    ...Object.entries(TAB_PAGES).map(([name, files]) => ({
      name, settings: { ...exclude(entries, files), ...NO_HISTORY },
      setup: [
        { press: KEYS.closeSidebar, wait: 500 }, { press: KEYS.closeAuxiliaryBar, wait: 500 }, ...focusEditor, ...files.flatMap(open),
        { waitFor: labelsWait('.part.editor .tabs-and-actions-container', files.map(fileClass), ` && c.querySelectorAll('.tab').length === ${files.length}`) },
      ],
      crops: [{ name: 'tabs', selector: '.part.editor .tabs-and-actions-container' }],
      teardown: [{ press: KEYS.closeAll, wait: 800 }],
    })),
    {
      name: 'breadcrumbs', settings: { ...exclude(entries, [BREADCRUMBS_FILE]), ...NO_HISTORY },
      setup: [...focusEditor, ...open(BREADCRUMBS_FILE), { waitFor: labelsWait('.part.editor .breadcrumbs-control', [fileClass(BREADCRUMBS_FILE)]) }],
      crops: [{ name: 'breadcrumbs', selector: '.part.editor .breadcrumbs-control' }],
      teardown: [{ press: KEYS.closeAll, wait: 800 }],
    },
    ...Object.entries(QUICK_OPEN_PAGES).map(([name, files]) => ({
      name, settings: { ...exclude(entries, files), ...NO_HISTORY },
      setup: [
        ...focusEditor, { press: KEYS.quickOpen, wait: 800 }, { insert: 'sample.', wait: 300 }, { until: 'quick-input-row', timeout: 10000 },
        { waitFor: labelsWait('.quick-input-widget .monaco-list', files.map(fileClass)) },
      ],
      crops: [{ name: 'widget', selector: '.quick-input-widget' }],
      teardown: [{ press: 'Escape', wait: 500 }],
    })),
  ];
  return {
    expectVersion: '1.141.0',
    port: 9333,
    mode: 'device-scale',
    helperVsix: 'spellbound-review-helper.vsix',
    workspace: FIXTURE,
    passes: [{ name: 'main', vsix: ['spellbound-main.vsix'], scales: [1, 2] }],
    scenes,
    commitSheets: scenes.flatMap((scene) => scene.crops.map((crop) => `main-${scene.name}-${crop.name}`)),
  };
}

export const fixtureEntries = (root) => fs.readdirSync(path.join(root, FIXTURE)).sort();

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(import.meta.dirname, '..', '..');
  const job = gate6Job(fixtureEntries(root));
  fs.writeFileSync(path.join(root, 'review', 'jobs', 'gate-6.json'), `${JSON.stringify(job, null, 2)}\n`);
  console.log(`Wrote review/jobs/gate-6.json: ${job.scenes.length} scenes, ${job.commitSheets.length} sheets`);
}
