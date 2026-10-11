import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/style.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, outlineGap, parseGlyphSvg, pathBounds, subpaths } from '../scripts/lib/svg-geometry.mjs';

const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const probe = (ds, cases, label) => {
  for (const [point, filled] of cases) assert.equal(filledAt(ds, point), filled, `${label} ${point}`);
};
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];
const box = ({ minX, maxX, minY, maxY }) => [minX, maxX, minY, maxY].map((value) => Number(value.toFixed(2)));
// One drawing against its construction: the roles of its parts in paint order, its bounds and its accent's (the last
// part), the accent's distance from the rest (0 where G42 lets an accent that is part of the silhouette touch it; else
// at least the unit of section 4, less 0.01 for flattened arcs), and ink probes away from every edge.
const checkShape = (svg, { roles, bounds, accent, gap, ink }, label) => {
  const parts = partsOf(svg);
  assert.deepEqual(parts.map((part) => part.role), roles, `${label}: roles in paint order`);
  assert.deepEqual(box(pathBounds(parts.map((part) => part.d))), bounds, `${label}: bounds`);
  assert.deepEqual(box(pathBounds([parts.at(-1).d])), accent, `${label}: accent bounds`);
  const measured = outlineGap(parts.slice(0, -1).flatMap((part) => subpaths(part.d)), subpaths(parts.at(-1).d));
  if (gap === 0) assert.equal(measured, 0, `${label}: the accent is part of the silhouette and meets it (G42)`);
  else assert.ok(measured >= gap - 0.01, `${label}: the accent keeps ${gap} from the outline (measured ${measured.toFixed(3)})`);
  probe(parts.map((part) => part.d), ink, label);
};

test('the style module draws paintbrush', () => {
  assert.deepEqual(Object.keys(drawings), ['paintbrush']);
});

test('paintbrush (css, scss, less): handle, ferrule and bristles on one 45-degree diagonal, the 5x5 star tip painted last, clear of the bristles', () => {
  checkShape(drawings.paintbrush(), {
    roles: ['style', 'style'], bounds: [1, 15, 1, 15], accent: [10, 15, 1, 6], gap: 1,
    ink: [
      [[2, 14], true], [[1.5, 12.5], false], [[6.5, 9.5], true], [[9, 7], true], [[11, 5], false], // handle, ferrule, bristles, the gap
      [[12.5, 3.5], true], [[12.5, 1.5], true], [[14.5, 3.5], true], [[11, 2], false], [[14, 2], false], // the star, its waist
    ],
  }, 'paintbrush');
});

test('map: paintbrush serves css, scss and less and the css and scss languages, in style', () => {
  assert.deepEqual(mapEntry('paintbrush'), { category: 'style', fileExtensions: ['css', 'scss', 'less'], languageIds: ['css', 'scss'] });
});
