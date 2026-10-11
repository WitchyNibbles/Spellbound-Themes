// Builds, packages, captures on Windows VS Code, and assembles contact sheets.
// Usage: see USAGE in args.mjs (node scripts/review/run-gate.mjs --help).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { USAGE, filterJob, parseGateArgs } from './args.mjs';
import { resolveWaits } from './waits.mjs';
import { prepareWorkspace, workspaceOf } from './workspace.mjs';

const root = path.resolve(import.meta.dirname, '..', '..');
const variantDir = path.join(root, 'icons', 'product-src-variants');
const variantArgs = fs.existsSync(variantDir)
  ? fs.readdirSync(variantDir).filter((file) => file.endsWith('.svg')).map((file) => `--variant=${file.split('.')[0]}=icons/product-src-variants/${file}`)
  : [];
// Arguments and the job are checked before anything is built or launched: a bad option, an unknown job file, scene,
// scale, named wait or workspace stops here with the usage.
let args;
let job;
try {
  args = parseGateArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
    process.exit(0);
  }
  // The variants pass runs only with a variant drawing and without --skip-variants. It is dropped before the job is cut
  // down, so a scene only that pass captures stops here too (gate-4 review).
  job = resolveWaits(filterJob(JSON.parse(fs.readFileSync(path.join(root, args.job), 'utf8')), { ...args, skipVariants: args.skipVariants || !variantArgs.length }));
  workspaceOf(job, root);
  if (args.vsix && !fs.statSync(path.resolve(root, args.vsix), { throwIfNoEntry: false })?.isFile()) throw new Error(`--vsix ${args.vsix} is not a file`);
} catch (error) {
  console.error(`${error.message}\n${USAGE}`);
  process.exit(2);
}
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

// 1. Build and package the extension (or take the VSIX given with --vsix, unchanged: the release check installs the
//    packaged VSIX itself), plus a variant build for the gate questions.
execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
fs.mkdirSync(out, { recursive: true });
if (args.vsix) fs.copyFileSync(path.resolve(root, args.vsix), path.join(out, 'spellbound-main.vsix'));
else execFileSync('node', ['scripts/review/stage-extension.mjs', out], { cwd: root, stdio: 'inherit' });
if (job.passes.some((pass) => pass.name === 'variants')) execFileSync('node', ['scripts/review/stage-extension.mjs', out, ...variantArgs], { cwd: root, stdio: 'inherit' });

// 2. Package the review helper with one row per drawing.
const map = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'product-icon-map.json'), 'utf8'));
const helper = path.join(out, 'helper');
fs.cpSync(path.join(root, 'review', 'helper-extension'), helper, { recursive: true });
fs.writeFileSync(path.join(helper, 'ids.json'), JSON.stringify(Object.entries(map.drawings).map(([name, { ids }]) => ({ id: ids[0], label: name, description: ids.join(', ') }))));
execFileSync(vsce, ['package', '--no-dependencies', '--skip-license', '--allow-missing-repository', '-o', path.join(out, job.helperVsix)], { cwd: helper, stdio: 'inherit' });

// 3. Copy to the Windows side; Windows Node cannot read \\wsl.localhost paths.
fs.mkdirSync(work, { recursive: true });
for (const file of fs.readdirSync(out).filter((name) => name.endsWith('.vsix'))) fs.copyFileSync(path.join(out, file), path.join(work, file));
for (const script of ['capture.mjs', 'cdp-guard.mjs']) fs.copyFileSync(path.join(root, 'scripts', 'review', script), path.join(work, script));
fs.cpSync(path.join(root, 'review', 'profile'), path.join(work, 'profile'), { recursive: true });
// The job's fixture, as the folder "workspace" (the window title and command centre read "workspace" in every gate).
prepareWorkspace(root, job, path.join(work, 'workspace'));

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
// The copy this run installed, not the path given: that file can change during the run.
if (args.vsix) manifest.installedVsix = { file: path.basename(args.vsix), sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(out, 'spellbound-main.vsix'))).digest('hex') };
if (args.scales || args.scenes) manifest.dryRun = { scales: args.scales, scenes: args.scenes }; // a cut-down run is never gate evidence
for (const capture of manifest.captures) capture.sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(out, 'captures', capture.file))).digest('hex');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
execFileSync('node', ['scripts/review/contact-sheet.mjs', out], { cwd: root, stdio: 'inherit' });
console.log(`Gate run complete: ${out} (${manifest.captures.length} captures, ${manifest.warnings.length} warnings)`);
