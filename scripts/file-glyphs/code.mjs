// Code drawings (spec 6, 6.2): objects in the code colour (lavender).
import { polygon } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// gem-cut (ts, mts, cts; spec 6.2: a cut, faceted gem with a flat table, a wide crown and a pointed pavilion, 14
// wide). It sets the gem language of gate 6: the cut gem is wide (x1-15), flat on top and pointed at the bottom, so the
// js rough crystal (tall, pointed at the top) and the tsx/jsx gem in a ring (round) differ from it in silhouette.
// The outline is the pavilion: a 1-unit girdle x1-15, y6-7, and two 45-degree sides 2 units across horizontally (1.41
// across the stroke, section 4's diagonal weight) meeting in a point at (8,14), around a real triangular hole. The
// accent, painted last, is the crown with its flat table: solid x1-15, y1-5, the table x5-11 on top and 45-degree
// sides, one unit clear of the girdle (section 4's accent clearance); 4 tall, so it meets the 4x4 shape minimum.
drawings['gem-cut'] = () => fileIconDocument(
  painted('code', polygon([[1, 6], [15, 6], [15, 7], [8, 14], [1, 7]]), polygon([[3, 7], [13, 7], [8, 12]], 'ccw')),
  painted('code', polygon([[5, 1], [11, 1], [15, 5], [1, 5]])), // accent: the crown and its table
);

// snake (py, pyw; spec 6.2: one 2-unit band in an S-coil, the head at least 4x4). One snake, never the two-snake mark
// (spec 6 logo rule). The band runs from the head at the upper right: the top run y3-5 to the left, the upper coil
// round the left (outer radius 3.5 about (6.5,6.5), inner 1.5), the middle run y8-10 to the right, the lower coil
// round the right (about (9.5,11.5)), and the bottom run y13-15 to the left, ending in a tail cut at 45 degrees to a
// point at (3,15). Odd diameters (7 and 3) sit on .5 centres, so every straight edge is on a whole number; the runs are
// 3 units apart. The accent, painted last, is the head: solid x9-14, y2-6 (5x4) with a round nose, meeting the band
// along x = 9 and bulging one unit above and below it, two units clear of the middle run.
drawings.snake = () => fileIconDocument(
  painted('code', 'M9 3H6.5A3.5 3.5 0 0 0 6.5 10H9.5A1.5 1.5 0 0 1 9.5 13H5L3 15H9.5A3.5 3.5 0 0 0 9.5 8H6.5A1.5 1.5 0 0 1 6.5 5H9Z'),
  painted('code', 'M9 2H12A2 2 0 0 1 12 6H9Z'), // accent: the head
);
