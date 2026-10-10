import test from 'node:test';
import assert from 'node:assert/strict';
import { createReport } from '../scripts/lib/report.mjs';
import { buildFont, FONT_STREAM_OPTIONS } from '../scripts/lib/product-font.mjs';
import { iconDefinitionsFor, validateMap } from '../scripts/lib/product-icon-map.mjs';
import { checkBuildFlags, checkFontGeometry, checkPinnedCoverage, checkProductIconMap, glyphRuleProblems } from '../scripts/lib/checks/product-icons.mjs';

const svg = (d, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"${extra}><path fill="currentColor" d="${d}"/></svg>`;
const collect = (enforce, fn) => {
  const report = createReport({ enforce });
  fn(report);
  return report.result();
};
const map = (drawings, extra = {}) => ({ fontId: 'witchynibbles-product-icons', fontFamily: 'WitchyNibbles Product Icons', drawings, ...extra });

test('glyph rules: a clean glyph has no errors', () => {
  assert.deepEqual(glyphRuleProblems(svg('M2 2h12v12H2zM5 5v6h6V5z')).errors, []);
});

test('glyph rules reject width, stroke, evenodd, transform, extra elements and bad winding', () => {
  const errors = (text) => glyphRuleProblems(text).errors.join(' | ');
  assert.match(errors(svg('M2 2h4v4H2z', ' width="16"')), /width or height/);
  assert.match(errors(svg('M2 2h4v4H2z').replace('fill="currentColor"', 'fill="currentColor" stroke="#000"')), /stroke/);
  assert.match(errors(svg('M2 2h4v4H2z').replace('fill="currentColor"', 'fill="currentColor" fill-rule="evenodd"')), /evenodd/);
  assert.match(errors(svg('M2 2h4v4H2z').replace('<path', '<path transform="scale(2)"')), /transform/);
  assert.match(errors(svg('M2 2h4v4H2z').replace('</svg>', '<circle r="2"/></svg>')), /only <svg> and <path>/);
  assert.match(errors(svg('M2 2h12v12H2zM5 5h6v6H5z')), /wound the same way/);
});

test('glyph rules warn (not fail) on off-grid straight segments', () => {
  const { errors, warnings } = glyphRuleProblems(svg('M2.3 2h4v4H2z'));
  assert.deepEqual(errors, []);
  assert.match(warnings[0], /off the whole\/half grid/);
});

test('coverage failures are tagged with the batch stage', () => {
  const pinned = { ids: { close: { batch: '1' }, check: { batch: 'chrome' } } };
  const { errors, pending } = collect(['product-batch:1'], (r) => checkPinnedCoverage({ pinned, theme: { iconDefinitions: {} } }, r));
  assert.deepEqual(errors.map((e) => e.stage), ['product-batch:1']);
  assert.deepEqual(pending.map((e) => e.stage), ['product-batch:chrome']);
});

test('map validation: codepoints, IDs, sources', () => {
  const sourceFiles = ['a.svg', 'b.svg', 'orphan.svg'];
  const errors = validateMap(map({
    a: { codepoint: 'E100', ids: ['close', 'widget-close'] },
    b: { codepoint: 'E100', ids: ['close'] },
    c: { codepoint: 'E1', ids: [] },
  }, { retiredCodepoints: ['E0FF'] }), { sourceFiles });
  const text = errors.join(' | ');
  assert.match(text, /b reuses codepoint E100 of a/);
  assert.match(text, /close is listed by both a and b/);
  assert.match(text, /c has invalid codepoint E1/);
  assert.match(text, /c must list at least one icon ID/);
  assert.match(text, /Missing SVG source icons\/product-src\/c\.svg/);
  assert.match(text, /orphan\.svg belongs to no drawing/);
  assert.match(validateMap({ fontId: 'witchynibbles-product-icons', fontFamily: 'WitchyNibbles Product Icons', icons: {} }, { sourceFiles: [] }).join(), /drawing-based format/);
});

test('one codepoint serves every ID of a drawing', () => {
  const defs = iconDefinitionsFor(map({ chevron: { codepoint: 'E10C', ids: ['chevron-down', 'tree-item-expanded'] } }));
  assert.equal(defs['chevron-down'].fontCharacter, '\\E10C');
  assert.equal(defs['tree-item-expanded'].fontCharacter, '\\E10C');
});

test('a stale generated theme is reported', () => {
  const m = map({ a: { codepoint: 'E100', ids: ['close'] } });
  const { errors } = collect(['product-pipeline'], (r) => checkProductIconMap({ map: m, sourceFiles: ['a.svg'], theme: { iconDefinitions: {} } }, r));
  assert.match(errors.map((e) => e.message).join(), /is stale/);
});

test('build flags: centring options are rejected', () => {
  assert.equal('centerHorizontally' in FONT_STREAM_OPTIONS, false);
  const { errors } = collect(['product-pipeline'], (r) => checkBuildFlags({ sources: { 'x.mjs': 'new Stream({ centerVertically: true })' } }, r));
  assert.match(errors[0].message, /x\.mjs sets centerVertically/);
});

test('font geometry: glyph boxes equal source bounds at 64 units per grid unit', async () => {
  const corner = svg('M10 10h4v4h-4z');
  const m = map({ corner: { codepoint: 'E100', ids: ['corner'] } });
  const woff = await buildFont({ fontId: m.fontId, fontFamily: m.fontFamily, version: '2.0', glyphs: [{ name: 'corner', codepoint: 'E100', svg: corner }] });
  assert.deepEqual(collect(['product-pipeline'], (r) => checkFontGeometry({ woff, map: m, svgs: { corner } }, r)).errors, []);
  const moved = collect(['product-pipeline'], (r) => checkFontGeometry({ woff, map: m, svgs: { corner: svg('M9 10h4v4H9z') } }, r));
  assert.match(moved.errors[0].message, /corner glyph box .* differs from its source bounds/);
});
