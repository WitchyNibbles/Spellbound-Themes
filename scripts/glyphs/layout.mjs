// Gate 4 `editor` batch, layout half (spec section 5.2, "Editor, find, layout, SCM"): the frame toggles of the title
// bar's layout controls, the split-editor glyphs and Customize Layout. Every glyph is one square window, x1-15 y1-15 (the
// stock layout Codicons' box), with radius-1 outer corners and 1-unit walls. Panes are counter-wound holes cut into the
// solid window (section 4: real holes), so a filled pane is a pane whose hole is not cut.
//
// The window is kept apart from the other house frames: the terminal (x1-15, y2-14) and the debug console's window
// (x1-13, y2-12; its spider breaks out of the open lower-right corner, so the glyph spans x1-15, y2-15) are landscape
// windows holding a prompt, and expand-corners (panel-maximize) is four open brackets on the 2-14 square. A layout
// window is a closed square holding only straight dividers and panes.
import { polygon, roundRect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

const windowOutline = () => roundRect(1, 1, 14, 14, 1);

// A pane is written once, as seen on the left side, and placed by an exact map of the grid onto itself, so the right
// and bottom drawings are true images of the left one: right = mirrored about x = 8; bottom = turned a quarter onto the
// bottom edge; top = reflected about the diagonal, so column 7 becomes row 7.
const place = {
  left: ([x, y]) => [x, y],
  right: ([x, y]) => [16 - x, y],
  bottom: ([x, y]) => [y, 16 - x],
  top: ([x, y]) => [y, x],
};
const pane = (side, [x, y, w, h], dir = 'ccw') => polygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(place[side]), dir);

// ---- Frame toggles (Task 8) ----
// The stock layout-sidebar and layout-panel glyphs on the house grid: a side pane 4 deep (x2-6 on the left), a 1-unit
// divider (x6-7) and the editor area (x7-14). On: the pane is filled, so pane, divider and wall read as one solid side,
// the filled part (spec 5.2); off: the pane is an outline, its hole cut. On and off differ only in that one hole.
// VS Code shows the off glyph while the part is hidden and the on glyph (`toggled`) while it is visible.
const SIDE_PANE = [2, 2, 4, 12];
const EDITOR_AREA = [7, 2, 7, 12];
const paneToggle = (side, on) => [windowOutline(), pane(side, EDITOR_AREA), on ? [] : pane(side, SIDE_PANE)];
drawings['pane-left'] = () => svgDocument(paneToggle('left', true)); // panel-left, auxiliarybar-left-layout-icon
drawings['pane-left-off'] = () => svgDocument(paneToggle('left', false));
drawings['pane-right'] = () => svgDocument(paneToggle('right', true)); // auxiliarybar-right-layout-icon, panel-right
drawings['pane-right-off'] = () => svgDocument(paneToggle('right', false));
drawings['pane-bottom'] = () => svgDocument(paneToggle('bottom', true)); // panel-layout-icon, panel-bottom
drawings['pane-bottom-off'] = () => svgDocument(paneToggle('bottom', false));

// ---- Split editor and Customize Layout (Task 9) ----
// The Codicon names read backwards: split-horizontal (Split Editor Right, the terminal's Split, Open to the Side) puts
// the panes side by side with an upright divider; split-vertical (Split Editor Down, and the notebook's Split Cell
// through notebook-split-cell's default) stacks them. The divider is on pixel column 7 (x7-8; row 7 when stacked),
// so the old pane is 5 wide (x2-7) and the new pane 6 (x8-14). The new pane holds the filled part (spec 5.2), a 4x10
// block one unit clear of the divider and the walls (section 4 accent clearance). A toggle's pane joins the wall as one
// solid side; this block floats inside its pane, so a split never reads as a side bar toggle.
const split = (side) => [windowOutline(), pane(side, [2, 2, 5, 12]), pane(side, [8, 2, 6, 12]), pane(side, [9, 3, 4, 10], 'cw')];
drawings['split-horizontal'] = () => svgDocument(split('left'));
drawings['split-vertical'] = () => svgDocument(split('top'));

// configure-layout-icon (Customize Layout, the layout controls' menu): the window in four panes, the dividers on column
// 7 and row 7 like the splits, the top-left pane filled like a toggle's pane. The stock `layout` is three separate tiles;
// four panes in one window keep it apart from the house rune tiles (extensions), whose filled tile is lifted off the
// others.
drawings['four-panes'] = () => svgDocument(windowOutline(), pane('left', [8, 2, 6, 5]), pane('left', [2, 8, 5, 6]), pane('left', [8, 8, 6, 6]));
