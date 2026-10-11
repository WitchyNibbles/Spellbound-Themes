// Assets drawings (spec 6): images and fonts, in the assets colour (each theme's blue, F8).
import { crescent, disc, frame, polygon, rect, roundRect } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// compass (svg; spec 6: a drafting compass). Two legs from the hinge at (8,4), 2:1 bands 1.5 units across horizontally
// (1.34 across the stroke, as the open folder's flap): the right leg runs on to its foot at y15, the left leg stops at
// y13 and ends in a 1-unit needle, x2-3, y13-15. The planned bow between the legs read as the crossbar of a letter A at
// 16px, so it is dropped: the needle makes the two legs unlike, and a pair of unlike legs under a ring is a compass. The
// accent, painted last, is the hinge: a 4-unit ring about (8,3), x6-10, y1-5, with a real 2-unit hole, over the legs'
// tops (part of the silhouette; G42).
drawings.compass = () => fileIconDocument(
  painted('assets', polygon([[6.5, 4], [8, 4], [3.5, 13], [3, 13], [3, 15], [2, 15], [2, 13]]), polygon([[8, 4], [9.5, 4], [15, 15], [13.5, 15]])),
  painted('assets', disc(8, 3, 2), disc(8, 3, 1, 'ccw')), // accent: the hinge
);

// portrait (png, jpg, jpeg, gif, webp; spec 6: a framed portrait with a moon, the multi-colour case of 6.2). A
// landscape frame x1-15, y2-14 with r1 corners, a hill rising to (6,9) on 45-degree slopes from its floor. The accent,
// painted last, is the moon in another role, gold ({data}): crescent({ cx: 10, cy: 7, r: 2.5, thickness: 3 }), 4x5,
// clear of the frame and the hill.
drawings.portrait = () => fileIconDocument(
  painted('assets', roundRect(1, 2, 14, 12, 1), polygon([[2, 3], [14, 3], [14, 13], [10, 13], [6, 9], [2, 13]], 'ccw')),
  painted('data', crescent({ cx: 10, cy: 7, r: 2.5, thickness: 3 })), // accent: the moon
);

// type-block (ttf, otf, woff, woff2; spec 6: a type block). A piece of type seen from its face: a 1-unit frame x2-14,
// y1-15 with r1 corners. The accent, painted last, is the letter on it: a solid T, bar x4-12, y3-5 and stem x7-9,
// y5-13, one unit inside the frame.
drawings['type-block'] = () => fileIconDocument(
  painted('assets', frame(2, 1, 12, 14)),
  painted('assets', rect(4, 3, 8, 2), rect(7, 5, 2, 8)), // accent: the letter
);
