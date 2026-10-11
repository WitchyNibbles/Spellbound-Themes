// Docs drawings (spec 6, 6.2): objects in the docs colour (ivory).
import { disc, rect } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// contract (LICENSE, LICENSE.md; spec 6.2: an ivory sheet with two text bars and a gold wax-seal disc of diameter 6 in
// the lower right, the multi-colour case). The sheet is the parchment's footprint without the fold (x3-13, y1-15,
// 1-unit walls, r1 corners), so a license and a plain file differ in silhouette. Two text bars, x5-11 and x5-9 at y4
// and y7. The seal, painted last, is the one part in another role ({data}): solid, diameter 6 about (11,12), x8-14,
// y9-15, reaching one unit past the sheet's right edge. The sheet is knocked out around it, drawn and not clipped so
// the corner arcs stay arcs: the right wall stops at y8 and the bottom wall at x7, at least 1.12 units from the disc,
// so ivory and gold read as two shapes in grayscale too.
drawings.contract = () => fileIconDocument(
  painted('docs', 'M4 1H12A1 1 0 0 1 13 2V8H12V2H4V14H7V15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1Z', rect(5, 4, 6, 1), rect(5, 7, 4, 1)),
  painted('data', disc(11, 12, 3)), // accent: the wax seal
);
