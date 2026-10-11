// Folder drawings with a badge (spec 6, 6.2): the folder construction of parts.mjs with the badge box knocked out,
// plus one solid badge in the category of the folder's contents, painted last.
import { parts } from '../glyphs/batch-1.mjs';
import { disc, polygon, rect, ring } from '../glyphs/primitives.mjs';
import { fileIconDocument, folderBody, painted } from './parts.mjs';

export const drawings = {};

// src, source: a grimoire, one bold silhouette (spec 6: a badge is one solid shape with one feature). A closed book
// standing upright, 6x7 at x9-15, y8-15, flush with the folder's right edge in the 7x7 BADGE_BOX (the free column x8-9
// leaves 2 units to the bottom wall's cut end at x7; the box's top row keeps the 1-unit knockout to the right wall's at
// y7). The spine is the 1-unit column x9-10, set off by a straight slot x10-11, y9-14 (a 1x5 hole, section 4's straight-
// slot exception), so the book reads as a bound volume and not as a plain tile.
const grimoire = () => painted('code', rect(9, 8, 6, 7), rect(10, 9, 1, 5, 'ccw'));

drawings['folder-src'] = () => fileIconDocument(folderBody({ badge: true }), grimoire());
drawings['folder-src-open'] = () => fileIconDocument(folderBody({ open: true, badge: true }), grimoire());

// The other badged folders (spec 6's folder table; gate 6). Each badge is one solid silhouette in the category of the
// folder's contents, inside BADGE_BOX (x8-15, y8-15), so the folder's 1-unit knockout keeps it one unit or more from the
// outline (G42: a badge keeps the clearance). Each badge serves its folder closed and open (`-open`, folderNamesExpanded).
const BADGES = {
  // tests, test, __tests__: a flask, lip x9-14, neck x10-13, body widening on 2:1 sides to a foot x8-15, y14-15.
  tests: () => painted('tests', polygon([[9, 8], [14, 8], [14, 9], [13, 9], [13, 10], [15, 14], [15, 15], [8, 15], [8, 14], [10, 10], [10, 9], [9, 9]])),
  // docs: an open book, two pages with 45-degree chamfers into the gutter, a straight 1x4 gutter slot x11-12, y10-14.
  docs: () => painted('docs', polygon([[8, 8], [10, 8], [11, 9], [12, 9], [13, 8], [15, 8], [15, 14], [13, 14], [12, 15], [11, 15], [10, 14], [8, 14]]), rect(11, 10, 1, 4, 'ccw')),
  // scripts: a wand, a 45-degree band 1.41 across from the lower left, ending in the 5x5 star of gate 2 about (12.5,10.5).
  scripts: () => painted('code', polygon([[9, 15], [8, 14], [10.5, 11.5], [11.5, 12.5]]), parts.star(12.5, 10.5, 2.5, 1)),
  // assets: a crystal, a hexagon pointed at the top and the bottom, x9-14, y8-15, 45-degree facets.
  assets: () => painted('assets', polygon([[11.5, 8], [14, 10.5], [14, 12.5], [11.5, 15], [9, 12.5], [9, 10.5]])),
  // dist: a corked bottle, the cork x10-13, y8-10 wider than the 1-unit neck, the body x8-15, y11-15 with round shoulders.
  dist: () => painted('code', rect(10, 8, 3, 2), rect(11, 10, 1, 1), 'M10 11H13A2 2 0 0 1 15 13V15H8V13A2 2 0 0 1 10 11Z'),
  // lib: stacked books, two slabs one unit apart, the upper one shorter and set in: x9-14 y8-11 over x8-15 y12-15.
  lib: () => painted('code', rect(9, 8, 5, 3), rect(8, 12, 7, 3)),
  // bin: a play triangle, x9-15, y8-15, its point at (15,11.5).
  bin: () => painted('code', polygon([[9, 8], [15, 11.5], [9, 15]])),
  // fixtures: a tarot card turned 45 degrees, 4.24 x 5.66, corners (8,11), (11,8), (15,12), (12,15), with a 2x2 diamond pip hole
  // about (11.5,11.5) (rim 1.41 or more) so it is not a bare diamond beside the assets crystal (gate-6 fix round 1).
  fixtures: () => painted('tests', polygon([[8, 11], [11, 8], [15, 12], [12, 15]]), polygon([[11.5, 10.5], [12.5, 11.5], [11.5, 12.5], [10.5, 11.5]], 'ccw')),
  // .github: a perched bird facing left (a raven, as far as 7 units say): the beak (8,10)-(10,9)-(8,11) on a 2:1 slope, the
  // head x10-14 from y8 with 45-degree shoulders, the body down to x15, y11-15, a tail x14-15 and one leg x12-13, y13-15, a
  // 1-unit slot between them. Redrawn in gate 6: the first silhouette (a slim beak and a straight tail) read as a boot.
  github: () => painted('config', polygon([[8, 10], [10, 9], [11, 8], [13, 8], [14, 9], [14, 10], [15, 11], [15, 15], [14, 15], [14, 14], [13, 13], [13, 15], [12, 15], [12, 13], [10, 13], [10, 12], [9, 11], [8, 11]])),
  // workflows: a ritual circle, a 1-unit ring of diameter 7 about (11.5,11.5) with a 1-unit cross through it (x11-12 and y11-12,
  // the arms overlap in the one solid part), four quarter openings about 1.5 across (inscribed circle; 1.95 along each arm). Redrawn in gate 6: the 2-unit ring with a 3-unit centre
  // read as a plain ring, an `o`.
  workflows: () => painted('config', ring(11.5, 11.5, 3.5, 1), rect(11, 8, 1, 7), rect(8, 11, 7, 1)),
  // .claude: a cat head, ears x8-11 and x12-15 from y11 up to the tips (9.5,8) and (13.5,8) on 2:1 sides, a 1-unit valley between
  // them at y11, the head x8-15 down to y15 with 45-degree chin chamfers. Redrawn in gate 6: the first silhouette (ears 2x2, a
  // 3-unit valley) read as a cup.
  claude: () => painted('config', polygon([[8, 11], [9.5, 8], [11, 11], [12, 11], [13.5, 8], [15, 11], [15, 14], [14, 15], [9, 15], [8, 14]])),
  // .venv: a cauldron, the rim x8-15, y9-10, the bowl x9-14 rounding to y14.5, two feet x9-10 and x13-14 at y14-15.
  venv: () => painted('config', rect(8, 9, 7, 1), 'M9 10H14V12A2.5 2.5 0 0 1 9 12Z', rect(9, 14, 1, 1), rect(13, 14, 1, 1)),
  // node_modules: a spider hanging on its thread (gate-6 ruling: the cobweb read as a K or an up-left arrow at 100%): the thread x11-12,
  // y8-11 (running a unit into the body, whose top is y10, so the two overlap) into a round body of diameter 5 about (11.5,12.5), and
  // two leg bars x8-15, y11-12 and y13-14 across it, a 1-unit notch between them either side of the body (a 1x1 notch is the legs' gap).
  'node-modules': () => painted('config', rect(11, 8, 1, 3), disc(11.5, 12.5, 2.5), rect(8, 11, 7, 1), rect(8, 13, 7, 1)),
  // cache, __pycache__: a pantry jar, a lid x9-14, y8-10 one unit above a wide jar x8-15, y11-15 with round lower corners (r2).
  // Redrawn in gate 6: the first jar (a 7-wide lid over a 5x4 rounded body) read as a bar over a dot.
  cache: () => painted('config', rect(9, 8, 5, 2), 'M8 11H15V13A2 2 0 0 1 13 15H10A2 2 0 0 1 8 13Z'),
};
for (const [name, badge] of Object.entries(BADGES)) {
  drawings[`folder-${name}`] = () => fileIconDocument(folderBody({ badge: true }), badge());
  drawings[`folder-${name}-open`] = () => fileIconDocument(folderBody({ open: true, badge: true }), badge());
}
