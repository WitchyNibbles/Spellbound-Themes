// Renders the built font at 12/16/24px on each theme's activity bar and side bar colours, plus the variant SVGs.
// Usage: node scripts/render-glyph-sheet.mjs  ->  review-out/glyph-sheet/index.html
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const out = path.join(root, 'review-out', 'glyph-sheet');
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(root, 'icons', 'witchynibbles-product-icons.woff'), path.join(out, 'font.woff'));

const map = JSON.parse(read('icons/product-icon-map.json'));
const themes = JSON.parse(read('package.json')).contributes.themes.map(({ label, path: themePath }) => {
  const c = JSON.parse(read(themePath)).colors;
  return { label, bar: c['activityBar.background'], active: c['activityBar.foreground'], inactive: c['activityBar.inactiveForeground'], side: c['sideBar.background'], text: c['sideBar.foreground'] };
});
const variantDir = path.join(root, 'icons', 'product-src-variants');
const variantFiles = fs.existsSync(variantDir) ? fs.readdirSync(variantDir).filter((file) => file.endsWith('.svg')).sort() : [];

const glyph = (codepoint) => (size) => `<span class="g" style="font-size:${size}px">&#x${codepoint};</span>`;
const inline = (file) => (size) => fs.readFileSync(path.join(variantDir, file), 'utf8').trim().replace('<svg ', `<svg width="${size}" height="${size}" `);
const cells = (render) => themes.map((t) => `<td style="background:${t.bar};color:${t.inactive}">${render(12)}${render(16)}${render(24)}<span style="color:${t.active}">${render(24)}</span></td><td style="background:${t.side};color:${t.text}">${render(16)}</td>`).join('');
const rows = [
  ...Object.entries(map.drawings).map(([name, { codepoint, ids }]) => `<tr><th>${name}<small>${codepoint} · ${ids.join(' ')}</small></th>${cells(glyph(codepoint))}</tr>`),
  ...variantFiles.map((file) => `<tr><th>${file}<small>variant for the gate (not in the font)</small></th>${cells(inline(file))}</tr>`),
];
const html = `<!doctype html><meta charset="utf-8"><title>Glyph sheet</title>
<style>@font-face{font-family:WNPI;src:url(font.woff)}body{margin:16px;font:12px system-ui;background:#fff;color:#222}
table{border-collapse:collapse}th{text-align:left;padding:4px 8px;font-weight:600;vertical-align:top}th small{display:block;font-weight:400;color:#666;max-width:260px}
td{padding:6px 10px;white-space:nowrap}.g{font-family:WNPI;line-height:1;display:inline-block;margin-right:8px;vertical-align:middle}svg{margin-right:8px;vertical-align:middle}</style>
<table><tr><th></th>${themes.map((t) => `<th colspan="2">${t.label}<small>activity bar 12/16/24 inactive, 24 active · side bar 16</small></th>`).join('')}</tr>${rows.join('\n')}</table>`;
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log(path.join(out, 'index.html'));
