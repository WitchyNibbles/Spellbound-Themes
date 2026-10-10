// Runs on Windows under VS Code's Electron in Node mode (ELECTRON_RUN_AS_NODE=1): WSL2 in NAT mode cannot
// reach Windows loopback ports. Node built-ins only (fetch, WebSocket), because it runs outside the repo.
// Usage: Code.exe capture.mjs job.json
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

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
  }

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

async function launch({ userDataDir, extensionsDir, scale }) {
  const args = [`--user-data-dir=${userDataDir}`, `--extensions-dir=${extensionsDir}`, `--remote-debugging-port=${job.port}`,
    '--disable-workspace-trust', '--skip-welcome', '--skip-release-notes', '--disable-telemetry', '--new-window'];
  if (job.mode === 'device-scale') args.push(`--force-device-scale-factor=${scale}`);
  args.push(path.join(work, 'workspace'));
  const child = spawn(codeExe, args, { env: cleanEnv(), stdio: 'ignore' });
  const target = await waitFor(async () => {
    const targets = await (await fetch(`http://127.0.0.1:${job.port}/json/list`)).json();
    return targets.find((t) => t.type === 'page' && t.url.includes('workbench.html'));
  }, { timeout: 90000, label: 'the VS Code workbench target' });
  const cdp = await Cdp.connect(target.webSocketDebuggerUrl);
  await waitFor(() => cdp.evaluate(`!!document.querySelector('.monaco-workbench .part.statusbar')`), { timeout: 90000, label: 'the workbench' });
  return { child, cdp };
}

async function shutdown({ child, cdp }) {
  try {
    const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${job.port}/json/version`)).json();
    const browser = await Cdp.connect(webSocketDebuggerUrl);
    await Promise.race([browser.send('Browser.close').catch(() => {}), delay(5000)]);
    browser.close();
  } catch { /* fall back to the PID kill */ }
  cdp.close();
  await delay(2000);
  // By PID only. Never by image name: that would close the author's own VS Code.
  try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* already gone */ }
}

async function runStep(cdp, step, where) {
  try {
    if (step.press) await cdp.press(step.press);
    if (step.insert) await cdp.insert(step.insert);
    if (step.waitFor) await waitFor(() => cdp.evaluate(step.waitFor), { timeout: step.timeout ?? 30000, label: step.waitFor });
  } catch (error) {
    if (!step.optional) throw error;
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

const baseSettings = JSON.parse(fs.readFileSync(path.join(work, 'profile', 'settings.base.json'), 'utf8'));
const keybindings = fs.readFileSync(path.join(work, 'profile', 'keybindings.json'), 'utf8');
const capturesDir = path.join(work, 'captures');
// A pass can write the fixture to disk (notes.md reached disk after the first pass of run 2026-10-10T01-41-22),
// which changed the SCM state for every later scale. Each launch therefore starts from a pristine copy.
const workspaceDir = path.join(work, 'workspace');
const pristineDir = path.join(work, 'workspace.pristine');
if (!fs.existsSync(pristineDir)) fs.cpSync(workspaceDir, pristineDir, { recursive: true });
// Working files only (git keeps its object files read-only on Windows, and the repository never changes), and only
// files whose content changed: a rewritten file loses its WSL mode bits and mtime, which the terminal listing shows.
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
    const settingsFor = (theme, extra = {}) => JSON.stringify({ ...baseSettings, ...zoom, 'workbench.colorTheme': theme.label, ...extra }, null, 2);
    writeUserFile(userDataDir, 'settings.json', settingsFor(job.themes[0]));
    writeUserFile(userDataDir, 'keybindings.json', keybindings);
    restoreWorkspace();
    log(`${pass.name} @ ${scale * 100}%: launching`);
    const session = await launch({ userDataDir, extensionsDir, scale });
    const { cdp } = session;
    try {
      const dpr = await cdp.evaluate('window.devicePixelRatio');
      if (Math.abs(dpr - scale) > 0.01) throw new Error(`devicePixelRatio is ${dpr}, expected ${scale}; set "mode": "zoom" in the job file`);
      // VS Code 1.141 sets the product icon font-family to the font *id* (witchynibbles-product-icons), not the family name.
      await waitFor(() => cdp.evaluate(`(() => { const el = document.querySelector('.codicon-explorer-view-icon'); return !!el && getComputedStyle(el, '::before').fontFamily.includes('witchynibbles-product-icons'); })()`),
        { timeout: 60000, label: 'the WitchyNibbles product icons' });
      for (const scene of job.scenes.filter((s) => !pass.scenes || pass.scenes.includes(s.name))) {
        const where = `${pass.name}/${scale}/${scene.name}`;
        log(`  ${scene.name}`);
        for (const step of scene.setup ?? []) await runStep(cdp, step, where);
        for (const theme of job.themes) {
          for (const variant of scene.variants ?? [{ name: 'default', settings: {} }]) {
            writeUserFile(userDataDir, 'settings.json', settingsFor(theme, variant.settings));
            await waitFor(() => cdp.evaluate(themeApplied(theme.signature)), { timeout: 20000, label: `theme ${theme.label}` });
            await delay(1500);
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
          }
        }
        for (const step of scene.teardown ?? []) await runStep(cdp, step, where);
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
