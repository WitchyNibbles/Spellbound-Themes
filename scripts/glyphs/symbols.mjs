// Gate 4 `symbols` batch (spec section 5.2, "Symbols"): the symbol-kind icons of the suggest widget, the Outline view
// and the breadcrumbs. Codicon meanings are kept (cube = method, wrench = property, [x] = variable ...), redrawn in the
// house style. They stand side by side in long 16px lists, coloured per kind by symbolIcon.*Foreground, and several
// kinds share a colour, so every drawing differs from every other symbol drawing in silhouette.
// Shared as in the 1.141 codicon.ttf: method and function (one codepoint), string and text (identical outlines),
// module and namespace (one codepoint, the outline of `bracket`, so they take the status batch's braces).
import { letters } from './editor.mjs';
import { disc, frame, polygon, rect, ring, roundRect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

const mirror = (points) => points.map(([x, y]) => [16 - x, y]); // about x = 8

// ---- Letters and brackets (Task 10) ----
// Letterforms are the set's one letter construction, the shared `letters` of the editor module (Task 5), called at draw
// time so a change to the letters reaches abc. At the symbols size they are 4 units wide, x-height 6 (y6-12), the b's
// ascender to y3, 1 unit apart. The a is double-storey: a single-storey a (a bowl as tall as the x-height with a square
// stem side) read as `o` at 16px ("obc").
// One bracket construction: the letter stroke, y2-14, serifs 2 long. `[` at x2-5; `]` is its mirror about x = 8.
const squareBracket = [[2, 2], [5, 2], [5, 3], [3, 3], [3, 13], [5, 13], [5, 14], [2, 14]];

// symbol-string, symbol-text: `abc`, the stock picture of both, x1-15, y3-12. Letterforms only, no filled part.
drawings.abc = () => svgDocument(
  letters.a(1, 12, { xHeight: 6, width: 4 }), // x1-5, y6-12
  letters.b(6, 12, { ascender: 9, bowl: 6, width: 4 }), // x6-10, y3-12
  letters.c(11, 12, { xHeight: 6, width: 4 }), // x11-15, y6-12
);

// symbol-variable: `[x]`. The x is the house `close` construction (batch-1.mjs: two 4-point bands with bevel ends) at 6x6: 45-degree
// bands 1.41 across, x5-11 and y5-11 on (8,8), each diagonal covering 6 pixels, the four notches empty at 16px. Axis-aligned
// end caps (6-point bands) were tried and the 16px rasterizer's anti-aliasing (also seen in an unhinted fill) merged rows 8-9 into a V on a bar. 2 units inside
// each bracket stem (x3). Stroke glyph, no filled part.
drawings['bracket-x'] = () => svgDocument(
  polygon(squareBracket), polygon(mirror(squareBracket)),
  polygon([[5, 6], [6, 5], [11, 10], [10, 11]]), polygon([[10, 5], [11, 6], [6, 11], [5, 10]]),
);

// symbol-keyword: lines of code with the keyword as a solid 5x3 block (the filled part), where the stock glyph boxes
// the first word. Lines 1 unit, 2 units apart.
drawings['keyword-lines'] = () => svgDocument(
  rect(2, 2, 5, 3), // accent: keyword x2-7, y2-5
  rect(9, 3, 5, 1), // rest of the first line x9-14
  rect(2, 7, 12, 1), rect(2, 10, 12, 1), rect(2, 13, 8, 1),
);

// symbol-snippet: a template block whose bottom edge is still open, drawn in dashes (the stock picture). Top and sides
// have the terminal frame's r1 outer corners and 1-unit walls; three 2-unit dashes, 2 units apart and 2 below the
// walls. Stroke glyph, no filled part.
drawings['snippet-frame'] = () => svgDocument(
  'M4 2H12A1 1 0 0 1 13 3V11H12V3H4V11H3V3A1 1 0 0 1 4 2Z', // top and sides x3-13, y2-11
  rect(3, 13, 2, 1), rect(7, 13, 2, 1), rect(11, 13, 2, 1), // dashes y13-14
);

// ---- Members (Task 11) ----
// Isometric boxes on 2:1 slopes (section 4's advisory angles). The top face is the filled part, one 1.5-unit step
// (1.34 across the slope) above the sides. Slanted walls are 1.5 tall (1.34 across), vertical walls 1 unit.
// symbol-method, symbol-function: a cube x2-14, y1-15. Its front edge is 1 unit on pixel column 7 (section 4), so the
// left face's hole is 4 wide and the right face's 5.
drawings.cube = () => svgDocument(
  polygon([[8, 1], [14, 4], [8, 7], [2, 4]]), // accent: top face x2-14, y1-7
  polygon([[2, 5.5], [8, 8.5], [14, 5.5], [14, 12], [8, 15], [2, 12]]), // sides
  polygon([[3, 7.5], [7, 9.5], [7, 13], [3, 11]], 'ccw'), // left face
  polygon([[8, 10], [13, 7.5], [13, 11], [8, 13.5]], 'ccw'), // right face
);

// symbol-field: a flat slab x1-15, y3-13, the cube's flat sibling (the stock field is a squashed method cube). Sides
// this low cannot hold a 2-unit hole, so they are one 1.5-unit band under the top face.
drawings.slab = () => svgDocument(
  polygon([[8, 3], [15, 6.5], [8, 10], [1, 6.5]]), // accent: top face x1-15, y3-10
  polygon([[1, 8], [8, 11.5], [15, 8], [15, 9.5], [8, 13], [1, 9.5]]), // sides
);

// symbol-property: an open-end wrench, one solid shape with the jaw cut out (the stock wrench is an outline). The head
// is a disc on (11,5) of radius sqrt(11.25), the radius at which every straight edge ends on the half grid. Handle and
// jaw run along x + y = 16 (45 degrees) and are both 2.12 across (x + y from 14.5 to 17.5), so the jaw clears the
// 2-unit cut-out minimum. A 1.41 handle would end off the grid where it meets the head.
const R = Math.sqrt(11.25).toFixed(3);
drawings.wrench = () => svgDocument(
  `M14 3.5A${R} ${R} 0 0 1 9.5 8L3.5 14L2 12.5L8 6.5A${R} ${R} 0 0 1 12.5 2L10.5 4L12 5.5Z`, // x2-14.35, y1.65-14
);

// symbol-constant: a solid block with `=` cut out (the house `=` of the conditional breakpoint): two 1-unit slots 6
// long (section 4 straight-slot exception), 2 units apart. 10x10 (x3-13), one unit inside the square keyline, so the
// solid block keeps about the cube's weight in a 16px list (summed canvas coverage of the built font at 16px: 87 and 82).
drawings['equals-block'] = () => svgDocument(roundRect(3, 3, 10, 10, 1), rect(5, 6, 6, 1, 'ccw'), rect(5, 9, 6, 1, 'ccw'));

// ---- Types (Task 12) ----
// symbol-class: the stock picture of a class and its members, a small node tree: a solid 5x5 parent (the filled part)
// at the upper left, one child to its right and one below and to the right, each a 5x5 frame with a 3x3 hole.
// 1-unit connectors on the nodes' centre lines; each runs 1 unit into the node it joins, so no seam is left.
drawings['class-tree'] = () => svgDocument(
  rect(2, 2, 5, 5), // accent: parent x2-7, y2-7
  rect(6, 4, 4, 1), // connector x6-10, y4-5
  frame(9, 2, 5, 5, { r: 0 }), // child x9-14, y2-7
  polygon([[4, 6], [5, 6], [5, 11], [10, 11], [10, 12], [4, 12]]), // connector down the parent's column, then right
  frame(9, 9, 5, 5, { r: 0 }), // child x9-14, y9-14
);

// symbol-interface: the stock lollipop, a solid 3x3 dot (the filled part) on a 1-unit stick into a 7-unit ring. Both
// diameters are odd, so dot, stick and ring share pixel row 7 (section 4). x1-15, y4-11.
drawings.lollipop = () => svgDocument(disc(2.5, 7.5, 1.5), rect(3, 7, 6, 1), ring(11.5, 7.5, 3.5));

// symbol-enum: the stock two cards: an outline card in front (x1-10, y7-14) with one value line, and the card behind
// it solid (the filled part), an L of 4-unit arms kept 1 unit clear of the front card. The stock enum-member (not
// pinned, so it stays stock) is the reverse, a solid front card, so the two kinds stay apart in a list.
drawings.cards = () => svgDocument(
  'M7 2H14A1 1 0 0 1 15 3V8A1 1 0 0 1 14 9H11V6H6V3A1 1 0 0 1 7 2Z', // accent: back card x6-15, y2-9
  frame(1, 7, 9, 7), // front card x1-10, y7-14
  rect(3, 10, 5, 1), // value line x3-8, y10-11
);
