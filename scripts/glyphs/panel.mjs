// Gate 3 `panel` batch (spec section 5.2, "Panel and views"): output, debug console, clear-all, filter, trash and
// panel-maximize. `markers-view-icon` reuses the status batch's warning triangle (claimed in Task 5, no drawing here).
import { parts } from './batch-1.mjs';
import { disc, frame, leaf, polygon, rect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

// 45-degree band from p to q, 1.41 across (each long edge 0.5 + 0.5 off the centre line), ends cut square to the band.
// With p and q on the half grid every corner lands on the grid too.
const band45 = ([x1, y1], [x2, y2]) => {
  const [ox, oy] = (x2 - x1) * (y2 - y1) > 0 ? [0.5, -0.5] : [0.5, 0.5];
  return polygon([[x1 + ox, y1 + oy], [x2 + ox, y2 + oy], [x2 - ox, y2 - oy], [x1 - ox, y1 - oy]]);
};

// ---- View icons (Task 4) ----
// output-view-icon: a quill over two written lines; the ink drop is the filled part (spec 5.2). The vane is solid: an
// outlined vane (leaf ring 6 wide with a 3-wide hole) read as a spoon or a racket at 16px, so the vane is drawn like
// the witch hat, solid, and the drop stays the accent. The stock Codicon `output` is a notepad.
drawings.quill = () => svgDocument(
  leaf([7, 9], [15, 1], 4.5), // vane, tip at the top right, 4.5 across its middle (at 5 the arcs overshoot the tip)
  band45([7, 9], [5.5, 10.5]), // shaft and nib, running out of the vane's lower tip
  parts.flame(3, 10, 15, 2), // accent: ink drop x1-5, y10-15 (the candle flame's shape, 4x5)
  rect(9, 12, 6, 1), // written line x9-15, y12-13
  rect(8, 14, 7, 1), // written line x8-15, y14-15
);

// debug-console-view-icon: a console window with a spider breaking out of its open lower-right corner, the stock
// Codicon layout (window, prompt, bug over the corner). A spider drawn inside a closed window either fused with the
// frame or, as an X of legs, read as a cancel cross (⊠) beside the house close and terminal-error. The window keeps the
// terminal's r1 corners and 1-unit walls but is smaller (x1-13, y2-12) and written out as one open path: knockOut on
// the closed frame would flatten its corner arcs off the grid. Every gap between window, prompt and spider is 1 unit.
const openWindow = 'M2 2H12A1 1 0 0 1 13 3V8H12V3H2V11H6V12H2A1 1 0 0 1 1 11V3A1 1 0 0 1 2 2Z'; // open from x6 / y8 to the corner
drawings['console-spider'] = () => svgDocument(
  openWindow, // window x1-13, y2-12
  polygon([[3, 5], [4, 4], [6, 6], [4, 8], [3, 7], [4, 6]]), // prompt ❯ x3-6, y4-8, 1.41 across
  disc(11, 12, 2), // accent: body x9-13, y10-14
  band45([9.5, 10.5], [8.5, 9.5]), band45([12.5, 10.5], [13.5, 9.5]), // upper legs
  band45([9.5, 13.5], [8.5, 14.5]), band45([12.5, 13.5], [13.5, 14.5]), // lower legs, down to y15
  rect(7, 12, 2, 1), rect(13, 12, 2, 1), // side legs x7-9 and x13-15, y12-13
);

// ---- Actions (Task 5) ----
// clear-all, notifications-clear-all: a broom sweeping lines; the bristles are the filled part. The stock Codicon is a
// cross over three lines. The handle is a 45-degree band, 1.41 across, whose end stops 1.41 short of the bristles' top
// edge (both square to the handle); the bristles fan out from 2.8 to 7.1 units wide.
drawings.broom = () => svgDocument(
  polygon([[14, 1], [15, 2], [10.5, 6.5], [9.5, 5.5]]), // handle, x9.5-15, y1-6.5
  polygon([[8, 6], [10, 8], [8, 13], [3, 8]]), // accent: bristles x3-10, y6-13
  rect(11, 11, 4, 1), // swept line x11-15, y11-12
  rect(10, 14, 5, 1), // swept line x10-15, y14-15
);

// filter: a funnel; the ink drop is the spout's liquid (spec 5.2: "liquid in the spout"). A hollow spout 4 units wide
// leaves a 2-unit channel, too narrow for an accent with one unit of clearance, so the liquid leaves the funnel as a
// drop where the spout would be. The cone walls are 1 unit at the rim and 1.41 across on the 45-degree sides. The hole
// is a trapezoid with a 2-unit flat bottom (x7-9, y8), so it is at least 2 units wide all the way down (section 4); a
// V-shaped hole narrowed to nothing at its tip, which filled in at 16px.
drawings.funnel = () => svgDocument(
  polygon([[1, 3], [15, 3], [15, 4], [10, 9], [6, 9], [1, 4]]), // cone x1-15, y3-9, flat bottom x6-10
  polygon([[3, 4], [13, 4], [9, 8], [7, 8]], 'ccw'), // hollow inside, 10 wide at the rim, 2 at the bottom
  parts.flame(8, 10, 15, 2), // accent: drop x6-10, y10-15, one unit below the cone
);

// trash, terminal-kill: a bin with a solid lid (the filled part) one unit above an open body with two ribs, every gap
// 2 units (section 4 cut-out minimum). The body is straight-sided, so every edge stays on whole numbers; the stock
// Codicon tapers.
drawings.bin = () => svgDocument(
  polygon([[2, 2], [6, 2], [6, 1], [10, 1], [10, 2], [14, 2], [14, 4], [2, 4]]), // accent: lid x2-14, y2-4, knob x6-10, y1-2
  frame(3, 5, 10, 10), // body x3-13, y5-15, 1-unit walls
  rect(6, 7, 1, 6), // rib x6-7, y7-13
  rect(9, 7, 1, 6), // rib x9-10, y7-13
);

// panel-maximize: four corner brackets on the 12x12 square keyline (x2-14, y2-14), like the stock screen-full (outline
// x2-14, y2-14), 1-unit strokes on whole numbers, arms 4 long. VS Code shows the same icon, toggled, while the panel is
// maximized. No filled part.
const bracket = [[2, 2], [6, 2], [6, 3], [3, 3], [3, 6], [2, 6]]; // top-left
drawings['expand-corners'] = () => svgDocument(
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sy]) => polygon(bracket.map(([x, y]) => [sx > 0 ? x : 16 - x, sy > 0 ? y : 16 - y]))),
);
