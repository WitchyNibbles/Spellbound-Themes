// Config drawings (spec 6): objects in the config colour (muted lilac, the folder colour too).
import { crescent, disc, frame, polygon, rect, roundRect } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// cairn (yaml, yml; spec 6: a stone cairn, which must differ in silhouette from the jsonl beads, the db cylinder and the
// lib books). Three flat stones stacked off-centre, each a stadium one unit above the next: x2-14 y12-15, x3-12 y8-11,
// x6-12 y5-7. The accent, painted last, is the top stone: a 3-unit pebble about (8.5,2.5), x7-10, y1-4, one unit above
// the stack (the 3x3 dot minimum).
drawings.cairn = () => fileIconDocument(
  painted('config', roundRect(2, 12, 12, 3, 1.5), roundRect(3, 8, 9, 3, 1.5), roundRect(6, 5, 6, 2, 1)),
  painted('config', disc(8.5, 2.5, 1.5)), // accent: the top stone
);

// tag (toml; spec 6: a tag on a string). The string is a 1-unit hook from the top left corner, x1-5, y1-5. The accent,
// painted last, is the tag: solid, x4-15, y4-12, pointed at the left with 45-degree edges, a real 2-unit eyelet about
// (8,8); the string stops 1.41 units short of it.
drawings.tag = () => fileIconDocument(
  painted('config', 'M1 1H2V2A2 2 0 0 0 4 4H5V5H4A3 3 0 0 1 1 2Z'),
  painted('config', polygon([[8, 4], [15, 4], [15, 12], [8, 12], [4, 8]]), disc(8, 8, 1, 'ccw')), // accent: the tag
);

// vial (env, .env and its variants; spec 6: a stoppered vial with a skull label, which at 16px "becomes a label with two
// eye pixels"). The stopper x6-11, y1-3, one unit above the neck; the neck x6-11, y4-7 (a 3-unit opening); the body
// x4-13, y6-15, 1-unit walls, r1 lower corners. The accent, painted last, is the label: solid x6-11, y9-13, one unit
// inside the walls, with two 1x1 eye holes at x7-8 and x9-10, y10-11 (spec 6's named exception to the 2-unit cut-out).
drawings.vial = () => fileIconDocument(
  painted('config', rect(6, 1, 5, 2), 'M6 4H11V6H13V14A1 1 0 0 1 12 15H5A1 1 0 0 1 4 14V6H6Z', 'M7 5V7H5V14H12V7H10V5Z'),
  painted('config', rect(6, 9, 5, 4), rect(7, 10, 1, 1, 'ccw'), rect(9, 10, 1, 1, 'ccw')), // accent: the skull label
);

// padlock (lock, package-lock.json, yarn.lock, Cargo.lock, poetry.lock; spec 6: a padlock with a crescent keyhole).
// The shackle is a 2-unit arch, outer radius 4 about (8,5), x4-12, y1-7 (at 1 unit it thinned to a hairline at 16px).
// The accent, painted last, is the body: solid x2-14, y7-15, r1 corners, under the shackle along y = 7 (part of the
// silhouette; G42), with a crescent keyhole cut out (a real hole, 2 thick, 3.5x5).
drawings.padlock = () => fileIconDocument(
  painted('config', 'M4 7V5A4 4 0 0 1 12 5V7H10V5A2 2 0 0 0 6 5V7Z'),
  painted('config', roundRect(2, 7, 12, 8, 1), crescent({ cx: 8, cy: 11, r: 2.5, dir: 'ccw' })), // accent: the body
);

// recipe-card (package.json, pyproject.toml, requirements.txt; spec 6: a recipe card). A landscape index card, x1-15,
// y2-14, 1-unit frame with r1 corners, two ruled lines x3-13 and x3-10 at y9 and y11. The accent, painted last, is the
// card's title block: solid x3-9, y4-7, one unit inside the frame. Landscape, so it differs from the portrait contract.
drawings['recipe-card'] = () => fileIconDocument(
  painted('config', frame(1, 2, 14, 12), rect(3, 9, 10, 1), rect(3, 11, 7, 1)),
  painted('config', rect(3, 4, 6, 3)), // accent: the title block
);

// gem-gear (tsconfig.json, jsconfig.json; spec 6: a cut gem with a small gear; the 16px rule: "a cog with a hole").
// The ts cut gem (gem-cut) in the config colour, with its lower right knocked out 1 unit around the badge box (x >= 7,
// y >= 7, drawn, not clipped): the girdle and the left side of the pavilion remain. The accent, painted last, is the
// cog in the badge box x8-15, y8-15: a stepped octagon with a real 3-unit hole about (11.5,11.5), one unit from the gem.
drawings['gem-gear'] = () => fileIconDocument(
  painted('config', polygon([[5, 1], [11, 1], [15, 5], [1, 5]]), polygon([[1, 6], [15, 6], [15, 7], [3, 7], [7, 11], [7, 13], [1, 7]])),
  painted('config', polygon([[10, 8], [13, 8], [13, 9], [14, 9], [14, 10], [15, 10], [15, 13], [14, 13], [14, 14], [13, 14], [13, 15], [10, 15],
    [10, 14], [9, 14], [9, 13], [8, 13], [8, 10], [9, 10], [9, 9], [10, 9]]), disc(11.5, 11.5, 1.5, 'ccw')), // accent: the cog
);

// crate (Dockerfile; spec 6: a wooden shipping crate, never the whale). A square-cornered frame x1-15, y2-15 with a
// middle plank: two real 12x5 panels. The accent, painted last, is the bracing: two 45-degree struts, one per panel, as
// one part of two subpaths, each rising from the plank (or the bottom bar) to the bar above it, 2 units across
// horizontally (1.41 across the stroke): x2-9, y3-8 and x2-9, y9-14. Part of the silhouette (G42), so they touch it.
drawings.crate = () => fileIconDocument(
  painted('config', rect(1, 2, 14, 13), rect(2, 3, 12, 5, 'ccw'), rect(2, 9, 12, 5, 'ccw')),
  painted('config', polygon([[2, 8], [7, 3], [9, 3], [4, 8]]), polygon([[2, 14], [7, 9], [9, 9], [4, 14]])), // accent: the struts
);

// veil (.gitignore; spec 6: a veil). Two solid curtains parted in the middle and tied back, hanging from y4: each is a
// 5-wide drape at the top that narrows to a waist 2 wide at y9 (x4 and x12, the ties) and flares to a hem at y15 (the
// hems 4 apart, so the pair never reads as trouser legs). The accent, painted last, is the rod they hang from: solid
// x1-15, y1-3, one unit above the drapes.
drawings.veil = () => fileIconDocument(
  painted('config', 'M2 4H7C7 6 5 7.5 4 9C4 11 5 13 6 15H2Z', 'M9 4H14V15H10C11 13 12 11 12 9C11 7.5 9 6 9 4Z'),
  painted('config', rect(1, 1, 14, 2)), // accent: the rod
);
