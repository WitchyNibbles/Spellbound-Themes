// Phase 2 `chrome` batch (spec section 5.2, shared chrome): arrows, add/remove, check and the three dots.
// House stroke as in the batch-1 chevrons and close: straight strokes 1 unit wide on whole numbers, 45-degree bands
// about 1.4 units across. Odd-width central features sit on pixel column/row 7 (x/y 7-8), like Codicon add (section 4).
import { disc, polygon, rect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

// ---- Arrows (Task 5) ----
// Stem with a filled head; the head is the accent (section 4). One pre-rotated drawing per orientation (section 5.1).
// Stock Codicon arrows (1.141 codicon.ttf) are 12 long (2-14) with open 90-degree heads. This head is 6 deep and 7 tall
// with 2:1 sides and a 1-unit flat tip: on the 16px sheet a 45-degree 4x9 head read as a wedge (and as a hat when
// pointing up), and a 4x5 head was too small next to the stem.
const arrowRight = [[2, 7], [8, 7], [8, 4], [14, 7], [14, 8], [8, 11], [8, 8], [2, 8]]; // stem x2-8, y7-8; head x8-14, y4-11
const mirrorX = (points) => points.map(([x, y]) => [16 - x, y]); // about x = 8: the stem stays on row 7
const transpose = (points) => points.map(([x, y]) => [y, x]); // row 7 becomes column 7
drawings['arrow-right'] = () => svgDocument(polygon(arrowRight));
drawings['arrow-left'] = () => svgDocument(polygon(mirrorX(arrowRight)));
drawings['arrow-down'] = () => svgDocument(polygon(transpose(arrowRight)));
drawings['arrow-up'] = () => svgDocument(polygon(transpose(mirrorX(arrowRight))));

// ---- Add, remove, check, dots (Task 6) ----
// Stock Codicon add and remove: 1-unit bars on x/y 7-8, 13 long (1-14). These are 11 long (2-13): inside the 10-12
// action keyline, centred on 7.5 like the Codicon bars, and the same optical size as the batch-1 close (3-13).
const plusOutline = [[2, 7], [7, 7], [7, 2], [8, 2], [8, 7], [13, 7], [13, 8], [8, 8], [8, 13], [7, 13], [7, 8], [2, 8]];
drawings.add = () => svgDocument(polygon(plusOutline));
drawings.remove = () => svgDocument(rect(2, 7, 11, 1));
// The chevron band bent into a check: 2 units tall, about 1.4 across, 45-degree edges, ends cut square to the stroke.
// Stock Codicon check spans x1.5-14.5, y3-12 with a 1-unit stroke.
drawings.check = () => svgDocument(polygon([[2, 8], [3, 7], [6, 10], [13, 3], [14, 4], [6, 12]]));
// Three filled dots, each the 3x3 dot-like minimum, 2 units apart (x1-14). Stock Codicon ellipsis has 2x2 dots on
// x3-13. At 1-unit gaps (x2-13) the dots ran into one bar at 12px. Chosen at gate 2 over Codicon-sized 2x2 dots on
// x3-13, which fit the action keyline but sit below the 3x3 dot-accent minimum.
drawings.ellipsis = () => svgDocument([2.5, 7.5, 12.5].map((cx) => disc(cx, 7.5, 1.5)));
