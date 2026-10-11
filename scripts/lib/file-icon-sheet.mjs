// The file-icon sheet (spec 6.3, F9): every resolved drawing at 16 and 32px on each color theme's side bar, active
// selection and quick-input focus; parchment re-resolved in each of the eight roles; a grayscale copy of all of it; and
// each 16px icon (16 device pixels at 1x, 32 at 2x) beside its 32x-supersampled reference, magnified 8x.
import fs from 'node:fs';
import path from 'node:path';
import { fileGlyphModules } from '../file-glyphs/index.mjs';
import { THEME_SETS, themeBackdrops } from './file-icon-backdrops.mjs';
import { PALETTE, ROLES, SET_DIRS, resolveSource } from './file-icon-palette.mjs';
import { coverage } from './supersample.mjs';
import { parseGlyphSvg } from './svg-geometry.mjs';

const readJson = (root, relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const round = (values) => values.map((value) => Number(value.toFixed(3)));

export function fileIconSheet({ root }) {
  const themes = readJson(root, 'package.json').contributes.themes.map(({ label, uiTheme, path: themePath }) => {
    const colors = readJson(root, themePath).colors;
    const set = THEME_SETS[uiTheme];
    const text = colors['sideBar.foreground'];
    const selected = colors['list.activeSelectionForeground'] ?? text;
    return { label, set, dir: SET_DIRS[set], backdrops: themeBackdrops(colors), text, selected, focused: colors['quickInputList.focusForeground'] ?? selected };
  });
  const names = fileGlyphModules.flatMap(({ drawings }) => Object.keys(drawings));
  const sources = Object.fromEntries(names.map((name) => {
    const file = path.join(root, 'icons', 'file-src', `${name}.svg`);
    if (!fs.existsSync(file)) throw new Error(`${path.relative(root, file)} is missing: run npm run draw:file-icons`);
    return [name, fs.readFileSync(file, 'utf8')];
  }));
  const files = {};
  for (const set of Object.keys(SET_DIRS)) {
    for (const name of names) files[`svg/${SET_DIRS[set]}/${name}.svg`] = resolveSource(sources[name], set);
    for (const role of ROLES) files[`svg/${SET_DIRS[set]}/role-${role}.svg`] = resolveSource(sources.parchment.replace(/\{\w+\}/g, `{${role}}`), set);
  }
  const reference = Object.fromEntries(names.map((name) => {
    const parts = parseGlyphSvg(sources[name]).paths;
    return [name, { roles: parts.map(({ fill }) => fill.slice(1, -1)), 16: parts.map(({ d }) => round(coverage([d], 16))), 32: parts.map(({ d }) => round(coverage([d], 32))) }];
  }));

  const icon = (dir, file) => `<i class="i16" style="background-image:url(svg/${dir}/${file}.svg)"></i><i class="i32" style="background-image:url(svg/${dir}/${file}.svg)"></i>`;
  const cells = (file) => themes.map((t) => [[t.backdrops.sidebar, t.text], [t.backdrops.selection, t.selected], [t.backdrops.quickInputFocus, t.focused]]
    .map(([background, color]) => `<td style="background:${background};color:${color}">${icon(t.dir, file)}<span>Aa</span></td>`).join('')).join('');
  const rows = [
    ...names.map((name) => `<tr><th>${name}</th>${cells(name)}</tr>`),
    ...ROLES.map((role) => `<tr><th>parchment as ${role}</th>${cells(`role-${role}`)}</tr>`),
  ];
  const head = `<tr><th></th>${themes.map((t) => `<th colspan="3">${t.label}<small>${t.set} set · side bar · selected row · quick-input focus · 16 and 32px</small></th>`).join('')}</tr>`;
  const refRows = names.map((name) => `<tr><th>${name}</th>${themes.map((t, index) => ['browser', 'reference']
    .map((kind) => `<td style="background:${t.backdrops.sidebar}"><canvas data-kind="${kind}" data-drawing="${name}" data-theme="${index}"></canvas></td>`).join('')).join('')}</tr>`);
  const refHead = `<tr><th></th>${themes.map((t) => `<th colspan="2">${t.label}<small>16px as the browser draws it · 32x-supersampled reference</small></th>`).join('')}</tr>`;
  const sheet = (gray) => `<div class="sheet${gray ? ' gray' : ''}"><h2>${gray ? 'Grayscale' : 'Colour'}</h2>
<table>${head}${rows.join('\n')}</table>
<h3>16px icon (16 device pixels at 1×, 32 at 2×), magnified 8x</h3><table${gray ? '' : ' id="reference"'}>${refHead}${refRows.join('\n')}</table></div>`;
  const data = { themes: themes.map(({ set, dir, backdrops }) => ({ set, dir, sidebar: backdrops.sidebar })), palette: PALETTE, reference };
  const html = `<!doctype html><meta charset="utf-8"><title>File-icon sheet</title>
<style>body{margin:16px;font:12px system-ui;background:#fff;color:#222}h2{margin:16px 0 4px}h3{margin:12px 0 4px;font-size:13px}
table{border-collapse:collapse}th{text-align:left;padding:4px 8px;font-weight:600;vertical-align:middle}th small{display:block;font-weight:400;color:#666;max-width:220px}
td{padding:6px 8px;white-space:nowrap}td span{vertical-align:middle;font-size:13px}
.i16,.i32{display:inline-block;vertical-align:middle;margin-right:6px;background-repeat:no-repeat}.i16{width:16px;height:16px;background-size:16px 16px}.i32{width:32px;height:32px;background-size:32px 32px}
canvas{display:block;width:128px;height:128px;image-rendering:pixelated}.gray{filter:grayscale(1)}</style>
${sheet(false)}
${sheet(true)}
<script>
const DATA = ${JSON.stringify(data)};
const px = window.devicePixelRatio >= 2 ? 32 : 16;
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const pending = [];
for (const canvas of document.querySelectorAll('canvas[data-drawing]')) {
  const theme = DATA.themes[canvas.dataset.theme];
  const ref = DATA.reference[canvas.dataset.drawing];
  canvas.width = px; canvas.height = px;
  const ctx = canvas.getContext('2d');
  if (canvas.dataset.kind === 'reference') {
    const image = ctx.createImageData(px, px);
    for (let i = 0; i < px * px; i += 1) {
      let colour = rgb(theme.sidebar);
      ref[px].forEach((cover, part) => { const ink = rgb(DATA.palette[theme.set][ref.roles[part]]); colour = colour.map((c, k) => c * (1 - cover[i]) + ink[k] * cover[i]); });
      image.data.set([...colour.map(Math.round), 255], i * 4);
    }
    ctx.putImageData(image, 0, 0);
  } else {
    ctx.fillStyle = theme.sidebar; ctx.fillRect(0, 0, px, px);
    const svg = new Image();
    pending.push(new Promise((resolve) => { svg.onload = () => { ctx.drawImage(svg, 0, 0, px, px); resolve(); }; svg.onerror = resolve; }));
    svg.src = 'svg/' + theme.dir + '/' + canvas.dataset.drawing + '.svg';
  }
}
Promise.all(pending).then(() => { document.body.dataset.ready = 'yes'; });
</script>`;
  return { html, files };
}
