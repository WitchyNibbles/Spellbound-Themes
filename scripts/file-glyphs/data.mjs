// Data drawings (spec 6, 6.2): objects in the data colour (gold).
import { crescent, disc, rect, ring } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// keyring (json, jsonc; spec 6.2: a 1-unit ring top left with two keys hanging at different lengths, the key bows
// the accent). The ring: r3 about (6,4), 1 unit thick, its hole a real 4-unit hole. Key A hangs from the ring's
// lower left: a 1-unit shaft x4-5 down to y13 with one tooth to the left; key B from its right: a shaft x9-10 down to
// y15 with two teeth to the right, so the two hang at different lengths and their teeth point apart. The accent,
// painted last, is the two bows: solid 3x3 discs on .5 centres (odd diameter, section 4), so each covers whole pixels
// and each shaft runs down its bow's middle. They overlap the ring band they hang on and keep 0.31 units of it to the
// hole; the two keys stay 2.39 units apart. Touching the ring, and two discs in one accent part, are exceptions to
// section 4's accent rules that the gate-5 README puts to the author.
drawings.keyring = () => fileIconDocument(
  painted('data', ring(6, 4, 3), rect(4, 9, 1, 4), rect(2, 11, 2, 1), rect(9, 6, 1, 9), rect(10, 12, 2, 1), rect(10, 14, 2, 1)),
  painted('data', disc(4.5, 7.5, 1.5), disc(9.5, 5.5, 1.5)), // accent: the key bows
);

// cabinet (sql; spec 6: an apothecary drawer cabinet). The body x3-14, y4-14 on two 1x1 feet, six drawers in two
// columns and three rows (real 4x2 holes, 1-unit walls). The accent, painted last, is the cornice: solid x2-15, y1-5,
// one unit wider than the body on each side and overlapping the body's top wall (y4-5; the same ink either way), 13x4
// (the 4x4 shape minimum; part of the silhouette, G42). The cabinet is centred on x = 8.5: two columns of even
// drawers need an odd inside width, so it sits at x2-15, half a unit right of the portrait keyline.
drawings.cabinet = () => fileIconDocument(
  painted('data', rect(3, 4, 11, 10), rect(4, 5, 4, 2, 'ccw'), rect(9, 5, 4, 2, 'ccw'), rect(4, 8, 4, 2, 'ccw'), rect(9, 8, 4, 2, 'ccw'),
    rect(4, 11, 4, 2, 'ccw'), rect(9, 11, 4, 2, 'ccw'), rect(3, 14, 1, 1), rect(13, 14, 1, 1)),
  painted('data', rect(2, 1, 13, 4)), // accent: the cornice
);

// beads (jsonl; spec 6: a string of beads, which must differ in silhouette from the yaml cairn, the db cylinder and the
// lib books). A garland, open at the top: the string a 1-unit U, x2-14, y3-12 (radius 6 about (8,6), its arms cut at
// y3). The accent, painted last, is five 3-unit beads on .5 centres (the dot minimum): two capping the arm tips at
// (2.5,3.5) and (13.5,3.5), three along the arc at (3.5,9.5), (8,11.5) and (12.5,9.5), all threaded on the string
// (part of the silhouette, like the key bows; G42), at least 1.9 units apart. Beads on the arms and along the arc keep
// it from reading as a bikini top (two big end beads under straps).
drawings.beads = () => fileIconDocument(
  painted('data', 'M2 3H3V6A5 5 0 0 0 13 6V3H14V6A6 6 0 0 1 2 6Z'),
  painted('data', disc(2.5, 3.5, 1.5), disc(13.5, 3.5, 1.5), disc(3.5, 9.5, 1.5), disc(8, 11.5, 1.5), disc(12.5, 9.5, 1.5)), // accent: the beads
);

// cylinder (db; spec 6: a cylinder with a crescent). x2-14, y1-15: the top an elliptical ring (rx 6, ry 2 about (8,3),
// a real 10x2 hole), the walls and the curved floor 1 unit, the body's hole flat-topped at y6 (1 unit under the top's
// lowest point). The accent, painted last, is the crescent on the front: crescent({ cx: 8, cy: 10, r: 2.5,
// thickness: 3 }), 4 wide and 5 tall (the 4x4 shape minimum), 1.5 units from the body's top and floor.
drawings.cylinder = () => fileIconDocument(
  painted('data', 'M2 3A6 2 0 0 1 14 3V13A6 2 0 0 1 2 13Z', 'M3 3A5 1 0 0 0 13 3A5 1 0 0 0 3 3Z', 'M3 6V13A5 1 0 0 0 13 13V6Z'),
  painted('data', crescent({ cx: 8, cy: 10, r: 2.5, thickness: 3 })), // accent: the crescent
);
