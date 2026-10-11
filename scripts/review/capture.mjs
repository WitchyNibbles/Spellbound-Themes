// Runs on Windows under VS Code's Electron in Node mode (ELECTRON_RUN_AS_NODE=1): WSL2 in NAT mode cannot
// reach Windows loopback ports. Node built-ins only (fetch, WebSocket), because it runs outside the repo.
// Usage: Code.exe capture.mjs job.json
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { assertOwnBrowser, assertPortFree } from './cdp-guard.mjs';

const job = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const work = job.workDir;
const log = (message) => console.log(`[capture] ${message}`);
const codeExe = path.join(job.codeDir, 'Code.exe');
const commitDir = fs.readFileSync(path.join(job.codeDir, 'bin', 'code.cmd'), 'utf8').match(/\.\.\\([0-9a-f]+)\\resources\\app\\out\\cli\.js/)[1];
const cliJs = path.join(job.codeDir, commitDir, 'resources', 'app', 'out', 'cli.js');
const vscodeVersion = JSON.parse(fs.readFileSync(path.join(job.codeDir, commitDir, 'resources', 'app', 'package.json'), 'utf8')).version;
const manifest = { vscodeVersion, vscodeCommitDir: commitDir, mode: job.mode, startedAt: new Date().toISOString(), captures: [], warnings: [] };
if (vscodeVersion !== job.expectVersion) manifest.warnings.push(`VS Code ${vscodeVersion}, expected ${job.expectVersion}`);

// The review instance must not inherit Node mode or the parent's VS Code IPC variables.
const cleanEnv = () => Object.fromEntries(Object.entries(process.env).filter(([key]) => key !== 'ELECTRON_RUN_AS_NODE' && !key.startsWith('VSCODE_')));

async function waitFor(check, { timeout = 60000, interval = 250, label }) {
  const started = Date.now();
  for (;;) {
    try { const value = await check(); if (value) return value; } catch { /* not ready yet */ }
    if (Date.now() - started > timeout) throw new Error(`Timed out waiting for ${label}`);
    await delay(interval);
  }
}

function keyInfo(name) {
  if (/^F\d{1,2}$/.test(name)) return { key: name, code: name, vk: 111 + Number(name.slice(1)) };
  if (/^[a-z]$/i.test(name)) return { key: name.toLowerCase(), code: `Key${name.toUpperCase()}`, vk: name.toUpperCase().charCodeAt(0) };
  if (/^\d$/.test(name)) return { key: name, code: `Digit${name}`, vk: 48 + Number(name) };
  const named = { Enter: 13, Escape: 27, Tab: 9, Backspace: 8 };
  if (name in named) return { key: name, code: name, vk: named[name] };
  throw new Error(`Unsupported key ${name}`);
}

class Cdp {
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error(`cannot open ${url}`)); });
    return new Cdp(ws);
  }

  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      if (message.error) waiter.reject(new Error(`${waiter.method}: ${message.error.message}`));
      else waiter.resolve(message.result);
    };
    // A command that closes the target (Browser.close) never gets a reply. Without this, its promise stays
    // pending with nothing left on the event loop, and Node exits with code 13 ("unsettled top-level await").
    ws.onclose = () => {
      for (const waiter of this.pending.values()) waiter.reject(new Error(`${waiter.method}: connection closed`));
      this.pending.clear();
    };
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject, method }));
  }

  async evaluate(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  }

  async press(chord) {
    const parts = chord.split('+');
    const key = keyInfo(parts.pop());
    const modifiers = parts.reduce((mask, part) => mask | { alt: 1, ctrl: 2, meta: 4, shift: 8 }[part.toLowerCase()], 0);
    for (const type of ['rawKeyDown', 'keyUp']) {
      await this.send('Input.dispatchKeyEvent', { type, modifiers, key: key.key, code: key.code, windowsVirtualKeyCode: key.vk, nativeVirtualKeyCode: key.vk });
    }
    // Then release the modifiers. VS Code takes the modifier state from the last key event it saw, so without these keyUps
    // it kept Alt held after every ctrl+alt+shift chord and drew Alt alternatives in later captures: Split Editor Down
    // for Split Editor Right, and Disconnect for Stop on the Node.js debug toolbar (gate-4 probe 2026-10-10T20-28-26).
    let held = modifiers;
    for (const [bit, name, vk] of [[8, 'Shift', 16], [2, 'Control', 17], [1, 'Alt', 18], [4, 'Meta', 91]]) {
      if (!(held & bit)) continue;
      held &= ~bit;
      await this.send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers: held, key: name, code: `${name}Left`, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    }
  }

  // Holds Alt down until the next press, so VS Code shows a menu item's Alt alternative (gate 4: Disconnect, the Alt
  // alternative of Stop on the Node.js debug toolbar). A lone Alt keydown never reaches the menu bar: that needs a release.
  holdAlt() { return this.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', modifiers: 1, key: 'Alt', code: 'AltLeft', windowsVirtualKeyCode: 18, nativeVirtualKeyCode: 18 }); }

  insert(text) { return this.send('Input.insertText', { text }); }

  async screenshot(file, clip) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
  }

  close() { this.ws.close(); }
}

function install(userDataDir, extensionsDir, files) {
  for (const vsix of files) {
    execFileSync(codeExe, [cliJs, `--user-data-dir=${userDataDir}`, `--extensions-dir=${extensionsDir}`, '--install-extension', vsix, '--force'],
      { env: { ...cleanEnv(), ELECTRON_RUN_AS_NODE: '1' }, stdio: 'inherit' });
  }
}

function writeUserFile(userDataDir, name, content) {
  fs.mkdirSync(path.join(userDataDir, 'User'), { recursive: true });
  fs.writeFileSync(path.join(userDataDir, 'User', name), content);
}

// By PID only. Never by image name: that would close the author's own VS Code.
function killChild(child) {
  try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* already gone */ }
}

// Final review I3: only the VS Code this run started is driven or closed. The port must be free before the launch, and the
// browser that answers it afterwards must be the spawned process (its PID); its browser URL, which names that one browser
// instance, is kept for the shutdown.
async function launch({ userDataDir, extensionsDir, scale }) {
  await assertPortFree(job.port);
  const args = [`--user-data-dir=${userDataDir}`, `--extensions-dir=${extensionsDir}`, `--remote-debugging-port=${job.port}`,
    '--disable-workspace-trust', '--skip-welcome', '--skip-release-notes', '--disable-telemetry', '--new-window'];
  if (job.mode === 'device-scale') args.push(`--force-device-scale-factor=${scale}`);
  args.push(path.join(work, 'workspace'));
  const child = spawn(codeExe, args, { env: cleanEnv(), stdio: 'ignore' });
  try {
    const { webSocketDebuggerUrl: browserUrl } = await waitFor(async () => (await fetch(`http://127.0.0.1:${job.port}/json/version`)).json(),
      { timeout: 90000, label: 'the VS Code debugging port' });
    const browser = await Cdp.connect(browserUrl);
    try {
      await assertOwnBrowser((method) => browser.send(method), child.pid);
    } finally {
      browser.close();
    }
    const target = await waitFor(async () => {
      const targets = await (await fetch(`http://127.0.0.1:${job.port}/json/list`)).json();
      return targets.find((t) => t.type === 'page' && t.url.includes('workbench.html'));
    }, { timeout: 90000, label: 'the VS Code workbench target' });
    const cdp = await Cdp.connect(target.webSocketDebuggerUrl);
    await waitFor(() => cdp.evaluate(`!!document.querySelector('.monaco-workbench .part.statusbar')`), { timeout: 90000, label: 'the workbench' });
    return { child, cdp, browserUrl };
  } catch (error) {
    killChild(child);
    throw error;
  }
}

async function shutdown({ child, cdp, browserUrl }) {
  try {
    const browser = await Cdp.connect(browserUrl);
    await Promise.race([browser.send('Browser.close').catch(() => {}), delay(5000)]);
    browser.close();
  } catch { /* fall back to the PID kill */ }
  cdp.close();
  await delay(2000);
  killChild(child);
}

// Tooltips (workbench hovers, editor hovers, the debug hover over a variable) that are on screen. Every screenshot waits
// until there are none, and the captures of a theme are checked again after the last crop.
const NO_TOOLTIP = `![...document.querySelectorAll('.workbench-hover, .monaco-hover, .debug-hover-widget')].some((el) => {
  const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('.hidden'); })`;

// Where the page's pointer rests: the middle of the empty stretch of the activity bar, between its view icons and the
// accounts and settings icons. Nothing there has a tooltip, and no scene draws anything there. The machine's own pointer
// can rest where a new window opens, and a resting pointer keeps a tooltip open (a gate-5 dry run stopped at a 200% launch,
// waiting for tooltips to close before its first capture), so every launch first moves the page's pointer there. The
// status bar, where the gate-3 hover scenes park, did not do: an item that appears later (Ln, Col after a file opens) can
// grow under the pointer, and its tooltip stopped a gate-4 dry run before find-replace at 200%.
const PARK_POINT = `(() => { const bar = document.querySelector('.part.activitybar'); if (!bar) return null; const box = bar.getBoundingClientRect();
  const icons = [...bar.querySelectorAll('.action-item')].map((el) => el.getBoundingClientRect()).filter((r) => r.height > 0); const middle = box.top + box.height / 2;
  const top = Math.max(box.top, ...icons.filter((r) => r.top < middle).map((r) => r.bottom)); const bottom = Math.min(box.bottom, ...icons.filter((r) => r.top >= middle).map((r) => r.top));
  return bottom - top >= 16 ? { x: box.left + box.width / 2, y: (top + bottom) / 2 } : null; })()`;

// Where a stuck non-optional wait left the focus: class names only, never text, values, titles or ids, which can carry a path.
async function focusDiagnostics(cdp) {
  try {
    return await cdp.evaluate(`(() => { const el = document.activeElement; const part = el?.closest('.part'); const quick = document.querySelector('.quick-input-widget');
      return 'active element classes: [' + (el ? [...el.classList].join(' ') : 'none') + '], its part: [' + (part ? [...part.classList].join(' ') : 'none') + '], quick input visible: ' + (!!quick && quick.style.display !== 'none' && quick.getBoundingClientRect().height > 0); })()`);
  } catch { return 'focus diagnostics unavailable'; }
}

async function runStep(cdp, step, where) {
  try {
    if (step.press) await cdp.press(step.press);
    if (step.insert) await cdp.insert(step.insert);
    if (step.hold === 'alt') await cdp.holdAlt();
    // hover: an expression that returns the { x, y } (CSS px) to move the mouse to, for states only a pointer reaches
    // (the debug-hint breakpoint helper in the glyph margin, the Call Stack row actions). The pointer stays there until
    // a later hover step moves it (scenes that hover park it on the status bar in their teardown). CDP takes the point in
    // the page's CSS px in both modes: in a zoom-mode run at 200%, the same point scaled by the zoom factor missed the
    // glyph margin and the unscaled point reached it.
    if (step.hover) {
      const { x, y } = await waitFor(() => cdp.evaluate(step.hover), { timeout: step.timeout ?? 30000, label: step.hover });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    }
    if (step.waitFor) await waitFor(() => cdp.evaluate(step.waitFor), { timeout: step.timeout ?? 30000, label: step.waitFor });
  } catch (error) {
    if (!step.optional) throw error.message.startsWith('Timed out') ? new Error(`${where}: ${error.message}; ${await focusDiagnostics(cdp)}`) : error;
    manifest.warnings.push(`${where}: optional step failed: ${error.message}`);
  }
  await delay(step.wait ?? 300);
}

const themeApplied = (signature) => `(() => { const s = getComputedStyle(document.querySelector('.monaco-workbench'));
  return ${JSON.stringify(signature)}.every(([name, value]) => s.getPropertyValue(name).trim().toLowerCase() === value); })()`;

const rectOf = (cdp, { selector, maxHeight }) => cdp.evaluate(`(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  return { x: r.x, y: r.y, width: r.width, height: ${maxHeight ? `Math.min(r.height, ${maxHeight})` : 'r.height'} };
})()`);

// The review PowerShell profile runs with -NoProfile, so the author's own profile (and any prompt that prints a user
// path) never loads. VS Code injects shell integration only when a profile's args are empty or -NoLogo, so the profile
// sources the script itself, inside try/catch (as VS Code does), so a Restricted execution policy prints no path. Its
// path depends on the install, so it is filled in here: ' doubled for PowerShell's single quotes, then JSON-escaped.
const shellIntegrationPs1 = path.join(job.codeDir, commitDir, 'resources', 'app', 'out', 'vs', 'workbench', 'contrib', 'terminal', 'common', 'scripts', 'shellIntegration.ps1');
if (!fs.existsSync(shellIntegrationPs1)) throw new Error(`no shell integration script at ${shellIntegrationPs1}`);
const baseSettings = JSON.parse(fs.readFileSync(path.join(work, 'profile', 'settings.base.json'), 'utf8')
  .replaceAll('{{shellIntegrationPs1}}', JSON.stringify(shellIntegrationPs1.replaceAll("'", "''")).slice(1, -1)));
const keybindings = fs.readFileSync(path.join(work, 'profile', 'keybindings.json'), 'utf8');
const capturesDir = path.join(work, 'captures');
let settingsWrites = 0; // applySettings marks each write with a window title that differs from the previous one
// A pass can write the fixture to disk (notes.md reached disk after the first pass of run 2026-10-10T01-41-22),
// which changed the SCM state for every later scale. Each launch therefore starts from a pristine copy.
const workspaceDir = path.join(work, 'workspace');
const pristineDir = path.join(work, 'workspace.pristine');
if (!fs.existsSync(pristineDir)) fs.cpSync(workspaceDir, pristineDir, { recursive: true });
// Working files only (git keeps its object files read-only on Windows), and only files whose content changed: a
// rewritten file loses its WSL mode bits and mtime, which the terminal listing shows. Gate 2 scenes change the index and
// the merge state through the git extension; their teardowns (spellboundReview.scm "changes") put them back, and a
// failed teardown stops the run.
function restoreWorkspace(relative = '') {
  for (const entry of fs.readdirSync(path.join(pristineDir, relative), { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const item = path.join(relative, entry.name);
    if (entry.isDirectory()) { fs.mkdirSync(path.join(workspaceDir, item), { recursive: true }); restoreWorkspace(item); continue; }
    const original = fs.readFileSync(path.join(pristineDir, item));
    const target = path.join(workspaceDir, item);
    if (!fs.existsSync(target) || !fs.readFileSync(target).equals(original)) fs.writeFileSync(target, original);
  }
}

for (const pass of job.passes) {
  const extensionsDir = path.join(work, 'ext', pass.name);
  for (const scale of pass.scales) {
    const userDataDir = path.join(work, 'ud', `${pass.name}-${scale}`);
    fs.rmSync(userDataDir, { recursive: true, force: true });
    if (!fs.existsSync(extensionsDir)) install(userDataDir, extensionsDir, [...pass.vsix, job.helperVsix].map((file) => path.join(work, file)));
    const zoom = job.mode === 'zoom' ? { 'window.zoomLevel': Math.log(scale) / Math.log(1.2) } : {};
    // A job's own settings (release: a default-size window) hold from the launch on, under each scene's.
    const settingsFor = (theme, extra = {}) => JSON.stringify({ ...baseSettings, ...zoom, ...job.settings, 'workbench.colorTheme': theme.label, ...extra }, null, 2);
    writeUserFile(userDataDir, 'settings.json', settingsFor(job.themes[0]));
    writeUserFile(userDataDir, 'keybindings.json', keybindings);
    restoreWorkspace();
    log(`${pass.name} @ ${scale * 100}%: launching`);
    const session = await launch({ userDataDir, extensionsDir, scale });
    const { cdp } = session;
    // Writes the settings and waits until VS Code has read them. A theme wait alone passes at once when the theme does
    // not change (a cut-down run, a variant), so each write also sets its own window title: the workspace name and one or
    // two zero-width spaces, alternating, so the command centre still reads "workspace" and each write differs from the
    // one before it.
    const applySettings = async (theme, extra) => {
      const mark = '\u200b'.repeat(1 + (++settingsWrites % 2));
      writeUserFile(userDataDir, 'settings.json', settingsFor(theme, { ...extra, 'window.title': `\${rootName}${mark}` }));
      await waitFor(() => cdp.evaluate(`document.title.endsWith(${JSON.stringify(mark)}) && !document.title.endsWith(${JSON.stringify(`\u200b${mark}`)})`),
        { timeout: 20000, label: `the settings for ${theme.label}` });
      await waitFor(() => cdp.evaluate(themeApplied(theme.signature)), { timeout: 20000, label: `theme ${theme.label}` });
    };
    try {
      const dpr = await cdp.evaluate('window.devicePixelRatio');
      if (Math.abs(dpr - scale) > 0.01) throw new Error(`devicePixelRatio is ${dpr}, expected ${scale}; set "mode": "zoom" in the job file`);
      // VS Code 1.141 sets the product icon font-family to the font *id* (witchynibbles-product-icons), not the family name.
      await waitFor(() => cdp.evaluate(`(() => { const el = document.querySelector('.codicon-explorer-view-icon'); return !!el && getComputedStyle(el, '::before').fontFamily.includes('witchynibbles-product-icons'); })()`),
        { timeout: 60000, label: 'the WitchyNibbles product icons' });
      const park = await waitFor(() => cdp.evaluate(PARK_POINT), { timeout: 10000, label: 'an empty stretch of the activity bar' });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: park.x, y: park.y });
      for (const scene of job.scenes.filter((s) => !pass.scenes || pass.scenes.includes(s.name))) {
        const where = `${pass.name}/${scale}/${scene.name}`;
        log(`  ${scene.name}`);
        // A scene's own settings (gate 3: panel tabs as icons) hold for its setup and every capture. Each setup starts
        // in the first theme, not in the last theme of the previous scene.
        const sceneSettings = scene.settings ?? {};
        await applySettings(job.themes[0], sceneSettings);
        for (const [index, step] of (scene.setup ?? []).entries()) await runStep(cdp, step, `${where} setup[${index}]`);
        for (const theme of job.themes) {
          for (const variant of scene.variants ?? [{ name: 'default', settings: {} }]) {
            await applySettings(theme, { ...sceneSettings, ...variant.settings });
            await delay(1500);
            await waitFor(() => cdp.evaluate(NO_TOOLTIP), { timeout: 10000, label: 'hover tooltips to close' });
            const stem = path.join(capturesDir, pass.name, String(scale), scene.name, theme.slug, variant.name);
            const shoot = async (crop, clip) => {
              const file = path.join(stem, `${crop}.png`);
              await cdp.screenshot(file, clip);
              manifest.captures.push({ pass: pass.name, scale, scene: scene.name, theme: theme.slug, variant: variant.name, crop, file: path.relative(capturesDir, file).split(path.sep).join('/') });
            };
            await shoot('full');
            for (const crop of scene.crops ?? []) {
              const clip = await rectOf(cdp, crop);
              if (!clip) { manifest.warnings.push(`${where}/${theme.slug}: no element for ${crop.selector}`); continue; }
              await shoot(crop.name, clip);
            }
            // Checked again after the last crop: a tooltip that opened during the crops would be in them, and a tooltip
            // can show a path (gate-3 review). The run stops rather than keep such a capture.
            if (!(await cdp.evaluate(NO_TOOLTIP))) throw new Error(`${where}/${theme.slug}: a tooltip opened during the captures`);
          }
        }
        for (const [index, step] of (scene.teardown ?? []).entries()) await runStep(cdp, step, `${where} teardown[${index}]`);
      }
    } finally {
      await shutdown(session);
    }
  }
}

manifest.finishedAt = new Date().toISOString();
fs.mkdirSync(capturesDir, { recursive: true });
fs.writeFileSync(path.join(capturesDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
log(`done: ${manifest.captures.length} captures, ${manifest.warnings.length} warnings`);
