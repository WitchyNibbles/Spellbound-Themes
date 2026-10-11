// Docs drawings (spec 6, 6.2): objects in the docs colour (ivory).
import { parts } from '../glyphs/batch-1.mjs';
import { crescent, disc, leaf, polygon, rect, ring, roundRect } from '../glyphs/primitives.mjs';
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

// quill (md, mdx; spec 6: a quill). The product output-view-icon quill (scripts/glyphs/panel.mjs, gate 3) split into an
// outline part and the accent, so a Markdown file and the Output view share one quill: the solid vane (G26), the
// 45-degree shaft and nib, two written lines; the accent, painted last, the ink drop (the candle flame's shape, 4x5).
// A test fails if the two stop matching.
drawings.quill = () => fileIconDocument(
  painted('docs', leaf([7, 9], [15, 1], 4.5), polygon([[7.5, 9.5], [6, 11], [5, 10], [6.5, 8.5]]), rect(9, 12, 6, 1), rect(8, 14, 7, 1)),
  painted('docs', parts.flame(3, 10, 15, 2)), // accent: the ink drop
);

// scroll (txt; spec 6: a curled blank parchment). A sheet unrolling from the top left to the bottom right: the top roll
// (the accent, painted last) a stadium x2-12, y1-5, 10x4, and the bottom roll a stadium x4-14, y11-15, offset two units
// the other way, so the sheet between them is not a symmetric frame. The sheet's sides, 1 unit wide, are x4-5 (y4-13)
// and x11-12 (y3-13): each runs into a roll (part of the silhouette; G42), the interior x5-11, y5-11 is 6x6, blank.
drawings.scroll = () => fileIconDocument(
  painted('docs', rect(4, 4, 1, 9), rect(11, 3, 1, 10), roundRect(4, 11, 10, 4, 2)),
  painted('docs', roundRect(2, 1, 10, 4, 2)), // accent: the top roll
);

// grimoire-open (README.md; spec 6: an open grimoire). An open book x1-15, y2-15, its pages dipping 45 degrees into the
// spine at the top and the bottom; the spine is the 1-unit column x7-8 (section 4: an odd central feature on column 7),
// so the left page's hole is 5 wide and the right one's 6. Three written lines on the left page. The accent, painted
// last, is a crescent on the right page, 4x6, one unit from the spine and the fore edge.
drawings['grimoire-open'] = () => fileIconDocument(
  painted('docs', polygon([[1, 2], [5.5, 2], [7.5, 4], [9.5, 2], [15, 2], [15, 13], [9.5, 13], [7.5, 15], [5.5, 13], [1, 13]]),
    polygon([[2, 3], [4.5, 3], [7, 5.5], [7, 12.5], [6.5, 12], [2, 12]], 'ccw'), polygon([[8, 5.5], [10.5, 3], [14, 3], [14, 12], [8.5, 12], [8, 12.5]], 'ccw'),
    rect(3, 6, 3, 1), rect(3, 8, 3, 1), rect(3, 10, 3, 1)),
  painted('docs', crescent({ cx: 12, cy: 8, r: 3 })), // accent: the crescent
);

// owl (CHANGELOG.md; spec 6 and 7: the owl is time). The product timeline owl (scripts/glyphs/batch-1.mjs, gate 1)
// split into an outline part (eye rings, ear tufts, beak) and the accent, the two 3x3 eyes, painted last. A test fails
// if the two stop matching.
const owlTuft = [[2, 3], [4.5, 5.5], [2, 6.5]];
drawings.owl = () => fileIconDocument(
  painted('docs', ring(4.5, 8.5, 3.5), ring(11.5, 8.5, 3.5), polygon(owlTuft), polygon(owlTuft.map(([x, y]) => [16 - x, y])), polygon([[7, 8.5], [9, 8.5], [8, 13]])),
  painted('docs', disc(4.5, 8.5, 1.5), disc(11.5, 8.5, 1.5)), // accent: the eyes
);
