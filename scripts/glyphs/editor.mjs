// Gate 4 `editor` batch, first half (spec section 5.2, "Editor, find, layout, SCM"): the ✧ cluster, the pushpin, pages
// and folders, the tree actions, the find toggles and replace. Tasks 2 to 6 append to these objects.
import { parts } from './batch-1.mjs';
import { frame, polygon, rect, roundRect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

// ---- Sparkle and pins (Task 2) ----
// sparkle, gutter-lightbulb-sparkle-filled (G11): the ✧ cluster (glossary: AI actions). Three ✦ from the batch-1 star
// part, called at draw time so a reshaped ✦ reaches them: the largest (8x8 with a 3x3 core, like the dirty star) is the
// filled part, left of centre; two 5x5 ✦ with a waist of 1 (the bell-dot badge) stand to its upper and lower right,
// where the stock sparkle has its second star. The stars keep at least 1.8 units from each other.
drawings['sparkle-cluster'] = () => svgDocument(
  parts.star(6, 8, 4, 1.5), // accent: largest star x2-10, y4-12
  parts.star(11.5, 4.5, 2.5, 1), // x9-14, y2-7
  parts.star(11.5, 11.5, 2.5, 1), // x9-14, y9-14
);

// pinned / pinned-dirty (G32: the gate-4 hatpins read as a match, a magnifier and a magic wand): a pushpin laid like
// the stock one, head upper right and point lower left on the line x + y = 16, inside close's 3-13 box and centred like
// it. Drawn in (u, v): u = x - y runs along the pin (needle -10 .. head +10), v = x + y - 16 across it, so 45-degree
// steps in (u, v) are horizontal or vertical on screen and whole (u, v) land on the half grid. The head is the filled
// part (spec 5.2: head): a flange and a cap 4.24 across (v ±3) joined by a waist 2.83 across (v ±2), with 45-degree
// shoulders, so it keeps the stock silhouette (wide, narrow, wide) and reads as a pin, not a block or an arrow. The
// needle is a bevel-ended band 1.41 across (the close construction) stopping 1.41 short of the flange (section 4).
// pinned-dirty adds the 5x5 ✦ badge (bell-dot size, live batch-1 star) at the lower right, x9-14, where the stock puts
// its dirty dot: 1.06 clear of the pin. With the badge inside 3-13 the pin's middle could be no wider than the needle
// (an arrow or a hammer at 16px), so the badge stands one unit past the pin's box, as the stock dot does (to 15).
const alongPin = (uv) => uv.map(([u, v]) => [(16 + u + v) / 2, (16 + v - u) / 2]);
const pushpin = () => [
  polygon(alongPin([[-9, -1], [-5, -1], [-5, 1], [-9, 1]])), // needle x3-6, y10-13
  polygon(alongPin([[-3, -3], [-1, -3], [0, -2], [4, -2], [5, -3], [7, -3], [7, 3], [5, 3], [4, 2], [0, 2], [-1, 3], [-3, 3]])), // accent: head x5-13, y3-11
];
drawings.pushpin = () => svgDocument(pushpin());
drawings['pushpin-dirty'] = () => svgDocument(pushpin(), parts.star(11.5, 11.5, 2.5, 1)); // ✦ x9-14, y9-14

// ---- Pages and folders (Task 3) ----
// Page: x3-13, y1-15 (the stock file's footprint, inside the 12x14 portrait keyline), 1-unit walls, r1 corners and a
// dog-ear at the upper right whose fold is the filled part (spec 5.2: corner). The fold is solid from its 45-degree edge
// (9,1)-(13,5) down to y6 and in to x8, so the hole keeps a 1-unit wall below and left of the 4x4 fold triangle.
// `open: true` leaves the lower-right corner open for the + badge: the right wall stops at y9 and the bottom wall at x8,
// each 1 unit or more from the +. Every page drawing calls this function; the page tests fail if the two outlines drift
// apart.
const page = ({ open = false } = {}) => (open
  ? ['M4 1H9L13 5V9H12V6H8V2H4V14H8V15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1Z']
  : ['M4 1H9L13 5V14A1 1 0 0 1 12 15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1Z', polygon([[4, 2], [8, 2], [8, 6], [12, 6], [12, 14], [4, 14]], 'ccw')]);
// Folder: x1-15, y2-14 (the stock folder's footprint, the 14x12 landscape keyline), 1-unit walls, r1 corners; the tab
// (x1-8, y2-6, with a 45-degree shoulder) is the filled part (spec 5.2: tab). `open: true` stops the right wall at y8
// and the bottom wall at x9 for the + badge.
const folder = ({ open = false } = {}) => (open
  ? ['M2 2H6L8 4H14A1 1 0 0 1 15 5V8H14V5H8L7 6H2V13H9V14H2A1 1 0 0 1 1 13V3A1 1 0 0 1 2 2Z']
  : ['M2 2H6L8 4H14A1 1 0 0 1 15 5V13A1 1 0 0 1 14 14H2A1 1 0 0 1 1 13V3A1 1 0 0 1 2 2Z', polygon([[2, 6], [7, 6], [8, 5], [14, 5], [14, 13], [2, 13]], 'ccw')]);
// + badge (spec 5.2: page / folder with +): a 5x5 cross of 1-unit strokes in the lower-right corner, where the stock
// new-file and new-folder put their + disc, moved by (dx, dy) from x10-15, y10-15. The page's sits one unit left
// (x9-14), so its stem (column 11) is not on the right wall's column (12), where it read as the wall going on, and it
// stays inside the portrait keyline; the folder's one unit up (y9-14), inside the landscape keyline. No fill: the fold
// or the tab stays the one filled part.
const plusBadge = (dx, dy) => polygon([[10, 12], [12, 12], [12, 10], [13, 10], [13, 12], [15, 12], [15, 13], [13, 13], [13, 15], [12, 15], [12, 13], [10, 13]]
  .map(([x, y]) => [x + dx, y + dy]));

drawings.page = () => svgDocument(page()); // symbol-file
drawings['page-plus'] = () => svgDocument(page({ open: true }), plusBadge(-1, 0)); // new-file: + x9-14, y10-15
// go-to-file: the page with an arrow into it. The stock arrow enters from outside the page's upper left; this page leaves
// no room there, so the arrow points right inside it: a stem x5-9, y9-10 and an open chevron head x6-10, y6.5-12.5,
// 1.41 across like the chrome chevrons. Pure strokes, so the fold stays the one filled part; 1 unit clear of the walls,
// 1.12 of the fold.
drawings['page-arrow'] = () => svgDocument(page(), rect(5, 9, 4, 1), polygon([[6, 7.5], [7, 6.5], [10, 9.5], [7, 12.5], [6, 11.5], [8, 9.5]]));
drawings.folder = () => svgDocument(folder()); // symbol-folder
drawings['folder-plus'] = () => svgDocument(folder({ open: true }), plusBadge(0, -1)); // new-folder: + x10-15, y9-14

// ---- Tree actions (Task 4) ----
// collapse-all: the stock layout, a box with a − in front of a second box whose right and bottom edges show. The front
// box is the filled part (spec 5.2: main shape), x2-12, y2-12 with r1 corners and the − cut out 6x2 (x4-10, y6-8, the
// 2-unit cut-out minimum); the box behind is a 1-unit L (to x14, y14), one unit clear of it.
drawings['collapse-stack'] = () => svgDocument(
  roundRect(2, 2, 10, 10, 1), // accent: front box x2-12, y2-12
  rect(4, 6, 6, 2, 'ccw'), // − cut out
  'M4 13H13V4H14V13A1 1 0 0 1 13 14H4Z', // the box behind: right edge x13-14, y4-14; bottom edge y13-14, x4-14
);

// list-tree: the stock tree (a top row, a trunk at the left, branches), with the root drawn as a 3x3 node, the filled
// part (spec 5.2: main shape; the dot-accent minimum). Rows every 4 units (y4-5, y8-9, y12-13), x2-14, y3-13 like the
// stock. The trunk starts one unit below the node (section 4: one unit between an accent and a stroke).
drawings['tree-node'] = () => svgDocument(
  rect(2, 3, 3, 3), // accent: root node x2-5, y3-6
  rect(6, 4, 8, 1), // root row x6-14, one unit right of the node
  rect(3, 7, 1, 6), // trunk x3-4, y7-13, under the node's centre
  rect(4, 8, 10, 1), // branch x4-14, y8-9
  rect(4, 12, 10, 1), // last branch x4-14, y12-13 (the trunk ends in it)
);

// discard: the stock undo hook. A filled head pointing left (2:1 sides and a flat 1-unit tip like the chrome arrows,
// x2-6, y3-8; spec 5.2: main shape) on a 1-unit band that runs right, turns down round a half circle (outer r4, inner r3
// about (9,9)) and comes back left to x5. It opens to the lower left and its band turns only half way, so it reads apart
// from the round arrows (refresh, restart, sync).
drawings['undo-arrow'] = () => svgDocument(
  polygon([[6, 3], [6, 8], [2, 6], [2, 5]]), // accent: head x2-6, y3-8
  'M6 5H9A4 4 0 0 1 9 13H5V12H9A3 3 0 0 0 9 6H6Z', // band x5-13, y5-13
);

// refresh: one round arrow, clockwise like the stock refresh. It is restart's construction (debug batch: a 1-unit band
// r4-5 about (8,9), open for a quarter turn, and a 6x3 45-degree head on the band's top end) mirrored about x = 8, so it
// opens at the upper right and its head points right; the stock refresh and debug-restart are mirrored the same way.
// One head and no half-turn symmetry, so it never reads as sync's two chasing arrows.
drawings['refresh-arrow'] = () => svgDocument('M8 5A4 4 0 1 0 12 9H13A5 5 0 1 1 8 4Z', polygon([[8, 1.5], [11, 4.5], [8, 7.5]]));

// ---- Find toggles (Task 5) ----
// One letter construction for every glyph that writes letters (the find toggles here, replace in Task 6, the symbols
// batch through the `letters` export): 1-unit stems and bars on whole numbers, 45-degree strokes 1.41 across, r1 outer
// corners on the round side, square stem side and inner corners, closed counters at least 2x2 (section 4's cut-out
// minimum), letters 1 unit apart, double-storey a. Each lowercase letter takes its size as options, so a smaller set
// keeps the construction. The find widget draws the toggles at about 16px with nothing else in the glyph, so they use the
// large size (the defaults: 5 wide, x-height 7, ascender 10, capitals 10 tall, like the stock toggles' y3-13).
// A: x0 to x0+7, cap height 10 on the baseline y13: a pointed arch on vertical stems (steep diagonals would leave the grid
// or thin below 1 unit), a crossbar at y8-9, a pointed counter above it (5 wide at the bar, 3 at y6) and the opening below.
const capitalA = (x0) => [
  polygon([[x0, 13], [x0, 6], [x0 + 3, 3], [x0 + 4, 3], [x0 + 7, 6], [x0 + 7, 13], [x0 + 6, 13], [x0 + 6, 9], [x0 + 1, 9], [x0 + 1, 13]]),
  polygon([[x0 + 1, 8], [x0 + 6, 8], [x0 + 6, 7], [x0 + 3.5, 4.5], [x0 + 1, 7]], 'ccw'),
];
// B: x0 to x0+5, cap height 10 on the baseline y13: a stem and two bowls (the lower one a unit wider), bars at y3-4, y7-8
// and y12-13; counters 2x3 and 3x4.
const capitalB = (x0) => [
  `M${x0} 3H${x0 + 3}A1 1 0 0 1 ${x0 + 4} 4V7A1 1 0 0 1 ${x0 + 5} 8V12A1 1 0 0 1 ${x0 + 4} 13H${x0}Z`,
  rect(x0 + 1, 4, 2, 3, 'ccw'),
  rect(x0 + 1, 8, 3, 4, 'ccw'),
];
// a: x0 to x0+width on `base`: a top bar at the x-height and a stem down the right (r1 shoulder), and a bowl `bowl` tall
// with r1 corners at the left; counter (width - 2) x (bowl - 2); the xHeight - bowl - 1 units between the top bar and the
// bowl stay open to the left (2 at the default size, 1 at x-height 6).
const smallA = (x0, base, { xHeight = 7, bowl = 4, width = 5 } = {}) => [
  `M${x0 + 1} ${base - xHeight}H${x0 + width - 1}A1 1 0 0 1 ${x0 + width} ${base - xHeight + 1}V${base}H${x0 + 1}A1 1 0 0 1 ${x0} ${base - 1}`
    + `V${base - bowl + 1}A1 1 0 0 1 ${x0 + 1} ${base - bowl}H${x0 + width - 1}V${base - xHeight + 1}H${x0 + 1}Z`,
  rect(x0 + 1, base - bowl + 1, width - 2, bowl - 2, 'ccw'),
];
// b: x0 to x0+width, a stem from `base - ascender` and a bowl `bowl` tall (the x-height) with r1 corners at the right;
// counter (width - 2) x (bowl - 2).
const smallB = (x0, base, { ascender = 10, bowl = 7, width = 5 } = {}) => [
  `M${x0} ${base - ascender}H${x0 + 1}V${base - bowl}H${x0 + width - 1}A1 1 0 0 1 ${x0 + width} ${base - bowl + 1}`
    + `V${base - 1}A1 1 0 0 1 ${x0 + width - 1} ${base}H${x0}Z`,
  rect(x0 + 1, base - bowl + 1, width - 2, bowl - 2, 'ccw'),
];
// c: x0 to x0+width, x-height tall, r1 corners at the left, open on the right: bars at the top and the foot, a 1-unit
// spine; the opening is (width - 1) x (xHeight - 2). No toggle uses it; it is here so the symbols batch writes abc in
// this construction.
const smallC = (x0, base, { xHeight = 7, width = 5 } = {}) => [
  `M${x0 + 1} ${base - xHeight}H${x0 + width}V${base - xHeight + 1}H${x0 + 1}V${base - 1}H${x0 + width}V${base}H${x0 + 1}`
    + `A1 1 0 0 1 ${x0} ${base - 1}V${base - xHeight + 1}A1 1 0 0 1 ${x0 + 1} ${base - xHeight}Z`,
];
// The shared letters (each returns path strings for svgDocument). Part C imports them from here.
export const letters = { A: capitalA, B: capitalB, a: smallA, b: smallB, c: smallC };

// The four toggles have no filled part (spec 5.2).
drawings['toggle-case'] = () => svgDocument(letters.A(1), letters.a(9, 13)); // case-sensitive: Aa, A x1-8, a x9-14
// whole-word: ab over an underline with turned-up ends (the stock bracket), x1-15; 1 unit below the letters.
drawings['toggle-word'] = () => svgDocument(letters.a(2, 12), letters.b(8, 12), polygon([[1, 13], [2, 13], [2, 14], [14, 14], [14, 13], [15, 13], [15, 15], [1, 15]]));
// regex: .* — a 2x2 full stop on the baseline (x3-5, y11-13) and a six-armed asterisk at cap height (x6-13, y3-10), a
// 1-unit upright on x9-10 crossed by two 45-degree bands 1.41 across.
drawings['toggle-regex'] = () => svgDocument(rect(3, 11, 2, 2), rect(9, 3, 1, 7), polygon([[7, 3], [13, 9], [12, 10], [6, 4]]), polygon([[12, 3], [13, 4], [7, 10], [6, 9]]));
drawings['toggle-preserve'] = () => svgDocument(letters.A(1), letters.B(9)); // preserve-case: AB, A x1-8, B x9-14

// ---- Replace (Task 6) ----
// find-replace (default replace), find-replace-all and search-replace-all (both default replace-all): the stock layout,
// a b at the upper right, an arrow hooking down to the left, and the target below it. The stock target is a solid box
// with c cut out; here the arrowhead is the one filled part (spec 5.2), so the target is an empty 1-unit frame (replace)
// or a frame with a second one behind it, drawn like collapse-all's stack (replace-all). The b is the toggles' b at a
// smaller size (ascender 6, bowl 4, counter 2x2); the head is restart's 6x3 45-degree head, pointing down.
const replaceTop = () => [
  letters.b(10, 7, { ascender: 6, bowl: 4, width: 4 }), // b x10-14, y1-7
  'M5 3H9V4H5V5H4V4A1 1 0 0 1 5 3Z', // arrow band x4-9, y3-5, one unit left of the b
  polygon([[1.5, 5], [7.5, 5], [4.5, 8]]), // accent: head x1.5-7.5, y5-8
];
drawings['replace-box'] = () => svgDocument(replaceTop(), frame(1, 9, 8, 6)); // target x1-9, y9-15, 6x4 inside
drawings['replace-stack'] = () => svgDocument(
  replaceTop(),
  frame(1, 9, 7, 4), // front target x1-8, y9-13, 5x2 inside
  'M3 14H9V11H10V14A1 1 0 0 1 9 15H3Z', // the one behind: right edge x9-10, y11-15; bottom edge y14-15, x3-10
);
