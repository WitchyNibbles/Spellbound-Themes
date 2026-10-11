// Data drawings (spec 6, 6.2): objects in the data colour (gold).
import { disc, rect, ring } from '../glyphs/primitives.mjs';
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
