// Tests drawings (spec 6): objects in the tests colour (mint).
import { polygon } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// flask (test.* and spec.* files, conftest.py, pytest.ini, jest.config.*; spec 6 and 7: the flask is testing). The
// product test-view flask (scripts/glyphs/batch-1.mjs, gate 1) split into an outline part (lip, neck and body with its
// inside cut out) and the accent, the liquid, painted last. A test fails if the two stop matching.
drawings.flask = () => fileIconDocument(
  painted('tests', 'M5 1H11V2H10V6L14 13V14A1 1 0 0 1 13 15H3A1 1 0 0 1 2 14V13L6 6V2H5Z', 'M7 2V6.5L3 13.5V14H13V13.5L9 6.5V2Z'),
  painted('tests', polygon([[6.5, 10], [9.5, 10], [11.5, 13], [4.5, 13]])), // accent: the liquid
);
