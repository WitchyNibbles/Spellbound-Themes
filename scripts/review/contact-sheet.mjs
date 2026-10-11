// One HTML page per (pass, scene, crop): rows = theme and variant, columns = scale, each scale followed by the same
// captures in grayscale (spec 6.3), images at 1:1 device pixels. The sheets render in an agent-browser session of their
// own, named in every call whatever AGENT_BROWSER_SESSION says, and only that session is closed at the end, also when a
// sheet fails (final review M10: the default session may be the author's or another agent's).
// Usage: node scripts/review/contact-sheet.mjs <run-dir>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const runDir = path.resolve(process.argv[2]);
const manifest = JSON.parse(fs.readFileSync(path.join(runDir, 'captures', 'manifest.json'), 'utf8'));
const sheets = path.join(runDir, 'sheets');
fs.mkdirSync(sheets, { recursive: true });
const session = `spellbound-sheets-${process.pid}`;
const browser = (...args) => execFileSync('agent-browser', ['--session', session, ...args], { stdio: 'inherit' });
const groups = Object.groupBy(manifest.captures.filter((capture) => capture.crop !== 'full'), (capture) => `${capture.pass}-${capture.scene}-${capture.crop}`);

try {
  browser('set', 'viewport', '2400', '1600', '1');
  for (const [key, captures] of Object.entries(groups)) {
    const scales = [...new Set(captures.map((capture) => capture.scale))].sort((a, b) => a - b);
    const rowKey = (capture) => `${capture.theme} · ${capture.variant}`;
    const rows = [...new Set(captures.map(rowKey))];
    const cell = (row, scale, gray) => {
      const capture = captures.find((candidate) => rowKey(candidate) === row && candidate.scale === scale);
      return capture ? `<td><img src="../captures/${capture.file}"${gray ? ' style="filter:grayscale(1)"' : ''}></td>` : '<td>–</td>';
    };
    const html = `<!doctype html><meta charset="utf-8"><title>${key}</title>
<style>body{margin:12px;font:13px system-ui;background:#808080;color:#111}th,td{padding:6px;vertical-align:top;text-align:left}img{image-rendering:pixelated;display:block}</style>
<h1>${key}</h1><p>VS Code ${manifest.vscodeVersion} · ${manifest.mode} · run ${manifest.run} · repo ${String(manifest.repoCommit).slice(0, 8)}${manifest.repoDirty ? ' (dirty)' : ''} · one image pixel per screen pixel</p>
<table><tr><th></th>${scales.map((scale) => `<th>${scale * 100}%</th><th>${scale * 100}% grayscale</th>`).join('')}</tr>
${rows.map((row) => `<tr><th>${row}</th>${scales.map((scale) => cell(row, scale, false) + cell(row, scale, true)).join('')}</tr>`).join('\n')}</table>`;
    const file = path.join(sheets, `${key}.html`);
    fs.writeFileSync(file, html);
    browser('open', `file://${file}`);
    browser('screenshot', '--full', path.join(sheets, `${key}.png`));
  }
} finally {
  try { browser('close'); } catch { /* the session is already gone */ }
}
console.log(`${Object.keys(groups).length} contact sheets in ${sheets}`);
