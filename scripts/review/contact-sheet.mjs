// One HTML page per (pass, scene, crop): rows = theme and variant, columns = scale, images at 1:1 device pixels.
// Usage: node scripts/review/contact-sheet.mjs <run-dir>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const runDir = path.resolve(process.argv[2]);
const manifest = JSON.parse(fs.readFileSync(path.join(runDir, 'captures', 'manifest.json'), 'utf8'));
const sheets = path.join(runDir, 'sheets');
fs.mkdirSync(sheets, { recursive: true });
const browser = (...args) => execFileSync('agent-browser', args, { stdio: 'inherit' });
const groups = Object.groupBy(manifest.captures.filter((capture) => capture.crop !== 'full'), (capture) => `${capture.pass}-${capture.scene}-${capture.crop}`);

browser('set', 'viewport', '2400', '1600', '1');
for (const [key, captures] of Object.entries(groups)) {
  const scales = [...new Set(captures.map((capture) => capture.scale))].sort((a, b) => a - b);
  const rowKey = (capture) => `${capture.theme} · ${capture.variant}`;
  const rows = [...new Set(captures.map(rowKey))];
  const cell = (row, scale) => {
    const capture = captures.find((candidate) => rowKey(candidate) === row && candidate.scale === scale);
    return capture ? `<td><img src="../captures/${capture.file}"></td>` : '<td>–</td>';
  };
  const html = `<!doctype html><meta charset="utf-8"><title>${key}</title>
<style>body{margin:12px;font:13px system-ui;background:#808080;color:#111}th,td{padding:6px;vertical-align:top;text-align:left}img{image-rendering:pixelated;display:block}</style>
<h1>${key}</h1><p>VS Code ${manifest.vscodeVersion} · ${manifest.mode} · run ${manifest.run} · repo ${String(manifest.repoCommit).slice(0, 8)}${manifest.repoDirty ? ' (dirty)' : ''} · one image pixel per screen pixel</p>
<table><tr><th></th>${scales.map((scale) => `<th>${scale * 100}%</th>`).join('')}</tr>
${rows.map((row) => `<tr><th>${row}</th>${scales.map((scale) => cell(row, scale)).join('')}</tr>`).join('\n')}</table>`;
  const file = path.join(sheets, `${key}.html`);
  fs.writeFileSync(file, html);
  browser('open', `file://${file}`);
  browser('screenshot', '--full', path.join(sheets, `${key}.png`));
}
console.log(`${Object.keys(groups).length} contact sheets in ${sheets}`);
