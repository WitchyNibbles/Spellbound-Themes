import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { drawings } from '../scripts/file-glyphs/tests.mjs';
import { drawings as batch1 } from '../scripts/glyphs/batch-1.mjs';
import { readFileIconInputs } from '../scripts/lib/file-icons-build.mjs';
import { filledAt, parseGlyphSvg, pathBounds } from '../scripts/lib/svg-geometry.mjs';

// Ink is compared on a 0.5 grid offset by (0.125, 0.3125), so no sample lands on a whole, half or 45-degree edge.
const SAMPLES = Array.from({ length: 32 }, (_, i) => 0.125 + i / 2).flatMap((x) => Array.from({ length: 32 }, (_, j) => [x, 0.3125 + j / 2]));
const partsOf = (svg) => parseGlyphSvg(svg).paths.map(({ fill, d }) => ({ role: fill.slice(1, -1), d }));
const mapEntry = (name) => readFileIconInputs(path.resolve(import.meta.dirname, '..')).map.drawings[name];
const TEST_BASES = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts'];

test('the tests module draws flask', () => {
  assert.deepEqual(Object.keys(drawings), ['flask']);
});

test('flask: the product test-view flask split into the outline (lip, neck, body) and the liquid painted last, so test files and the Testing view share it', () => {
  const parts = partsOf(drawings.flask());
  assert.deepEqual(parts.map((part) => part.role), ['tests', 'tests']);
  assert.deepEqual(pathBounds([parts[1].d]), { minX: 4.5, maxX: 11.5, minY: 10, maxY: 13 }, 'the liquid, one unit above the floor');
  const productInk = parseGlyphSvg(batch1.flask()).paths.map((part) => part.d);
  const changed = SAMPLES.filter((point) => filledAt(parts.map((part) => part.d), point) !== filledAt(productInk, point));
  assert.deepEqual(changed.map(String), [], 'the same ink as the product flask');
});

test('map: flask serves the enumerated test and spec suffixes, conftest.py, pytest.ini and the jest configs, in tests (spec 6)', () => {
  assert.deepEqual(mapEntry('flask'), {
    category: 'tests',
    fileExtensions: TEST_BASES.flatMap((base) => [`test.${base}`, `spec.${base}`]),
    fileNames: ['conftest.py', 'pytest.ini', 'jest.config.js', 'jest.config.ts', 'jest.config.mjs', 'jest.config.cjs', 'jest.config.json'],
  });
});
