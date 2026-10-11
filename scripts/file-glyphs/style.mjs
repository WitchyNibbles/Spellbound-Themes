// Style drawings (spec 6): objects in the style colour (pink).
import { parts } from '../glyphs/batch-1.mjs';
import { leaf, polygon } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// paintbrush (css, scss, less; spec 6: a paintbrush with a star tip). One brush on the 45-degree diagonal x + y = 16,
// handle at the lower left: the handle a band 1.41 across (x1-6, y10-15), the ferrule 2.83 across (x4-9, y7-12), the
// bristles a lens from (7.5,8.5) to (10.5,5.5), 3 across. The accent, painted last, is the star at the tip: the 5x5 ✦
// of gate 2 (parts.star(…, 2.5, 1)) about (12.5,3.5), x10-15, y1-6, 1.41 units clear of the bristles' tip (it sits
// beyond the brush, so it keeps the clearance; G42).
drawings.paintbrush = () => fileIconDocument(
  painted('style', polygon([[1, 14], [5, 10], [6, 11], [2, 15]]), polygon([[4, 10], [7, 7], [9, 9], [6, 12]]), leaf([7.5, 8.5], [10.5, 5.5], 3)),
  painted('style', parts.star(12.5, 3.5, 2.5, 1)), // accent: the star tip
);
