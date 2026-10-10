// Debug batch (spec section 5.2 "Debug and testing"; decisions D3, D4 and G1). The full moon means "here" (glossary,
// section 7): a breakpoint, the current stack frame, where a step lands. Tasks 6-9 append to these objects.
import { drawings as batchOne } from './batch-1.mjs';
import { disc, polygon, rect, svgDocument } from './primitives.mjs';
import { parseGlyphSvg, pathBounds } from '../lib/svg-geometry.mjs';

export const drawings = {};
export const variants = {};

// ---- Breakpoints (Task 6) ----
// Every breakpoint glyph sits on the Codicon footprint, an 8-unit shape centred on (8,8) (spec 5.2), so the gutter mark
// does not jump when a breakpoint changes state. The moons are built from the live batch-1 moon breakpoint (G1: a plain
// disc, x4-12), so a later change to it reaches every moon here.
const moon = () => {
  const [d] = parseGlyphSvg(batchOne['moon-breakpoint']()).paths.map((path) => path.d);
  const { minX, maxX, minY, maxY } = pathBounds([d]);
  return { d, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, r: (maxX - minX) / 2 };
};

// debug-breakpoint-disabled: the moon as a 1-unit ring. VS Code's disabled colour carries the rest of the state.
drawings['moon-outline'] = () => {
  const { d, cx, cy, r } = moon();
  return svgDocument(d, disc(cx, cy, r - 1, 'ccw'));
};

// debug-breakpoint-unverified (and -conditional-unverified, D4): the same ring in six dashes. Each dash is the ring
// between two angles with round ends (arcs only, so no straight-segment point can leave the grid). Dashes are 26
// degrees long, centred on 30, 90, ... 330 degrees, so the top and bottom dashes reach y4 and y12; the round ends of
// neighbouring dashes are 1.07 apart (section 4: no gap under 1 unit). Eight dashes read as a faint dotted ring at
// 16px, four as a ring with notches.
const at = (cx, cy, r, degrees) => [cx + r * Math.cos((degrees * Math.PI) / 180), cy + r * Math.sin((degrees * Math.PI) / 180)];
const fmt = (value) => Number(value.toFixed(3));
const pt = ([x, y]) => `${fmt(x)} ${fmt(y)}`;
function ringDash(cx, cy, r, from, to) {
  const [outerFrom, outerTo, innerTo, innerFrom] = [at(cx, cy, r, from), at(cx, cy, r, to), at(cx, cy, r - 1, to), at(cx, cy, r - 1, from)];
  return `M${pt(outerFrom)}A${r} ${r} 0 0 1 ${pt(outerTo)}A0.5 0.5 0 0 1 ${pt(innerTo)}A${r - 1} ${r - 1} 0 0 0 ${pt(innerFrom)}A0.5 0.5 0 0 1 ${pt(outerFrom)}Z`;
}
drawings['dashed-ring'] = () => {
  const { cx, cy, r } = moon();
  return svgDocument([30, 90, 150, 210, 270, 330].map((centre) => ringDash(cx, cy, r, centre - 13, centre + 13)));
};

// debug-breakpoint-conditional (and -conditional-disabled, D4): the moon with '=' cut out, two 1-unit slots 4 long
// (x6-10; y6-7 and y9-10), section 4's straight-slot exception. 2 units of moon between the slots; the
// thinnest wall is at the slot corners, 4 - 2.83 = 1.17 from the rim.
drawings['moon-equals'] = () => {
  const { d, cx, cy } = moon();
  return svgDocument(d, rect(cx - 2, cy - 2, 4, 1, 'ccw'), rect(cx - 2, cy + 1, 4, 1, 'ccw'));
};

// debug-breakpoint-log (and -log-disabled, D4): a square on its point, x3-13 (spec 5.2 lets the log diamond span 3-13,
// like Codicon's). Its area (50) matches the moon's (50.3), so a logpoint and a breakpoint read with the same weight.
drawings.diamond = () => svgDocument(polygon([[8, 3], [13, 8], [8, 13], [3, 8]]));

// ---- Stack frames and steps (Task 7) ----
// When execution stops on a line that has a breakpoint, VS Code 1.141 adds the frame's class to the breakpoint's glyph
// and draws debug-stackframe-dot over it with CSS (`.codicon-debug-breakpoint.codicon-debug-stackframe:after`, the same
// for -conditional and for -stackframe-focused): `position: absolute` inside the glyph-margin box `.cgmr`, which is
// `display: flex; align-items: center; justify-content: center`. The dot is centred in the same 16-unit box as the frame
// glyph, so a dot drawn at 6-10 lands at 6-10 of the frame. The frames keep that area clear by 1 unit (section 4).
const moonDot = () => disc(8, 8, 2); // debug-stackframe-dot: the moon at 4x4, x6-10, y6-10

// debug-stackframe: Codicon's tag-shaped pointer, x2-15, y3-13, as a 1-unit outline with 45-degree nose sides (1.06
// across). The nose is filled from x11 (the accent, spec 5.2: the tip), exactly 1 unit right of the dot. The pointer is
// larger than the 8-unit signal keyline because it has to hold the 4x4 dot with 1 unit of clearance.
const pointer = () => [
  polygon([[2, 3], [10, 3], [15, 8], [10, 13], [2, 13]]),
  polygon([[3, 4], [9.5, 4], [11, 5.5], [11, 10.5], [9.5, 12], [3, 12]], 'ccw'),
];
drawings['stackframe-arrow'] = () => svgDocument(pointer());
// debug-stackframe-focused: the same pointer holding the moon dot exactly where the overlay draws it, so a focused
// frame and a paused-on-breakpoint frame look the same.
drawings['stackframe-moon'] = () => svgDocument(pointer(), moonDot());
drawings['moon-dot'] = () => svgDocument(moonDot());

// debug-step-over / -into / -out: an arrow and the moon below it, where the step lands. The arrows keep the chrome
// arrows' stem on pixel column 7 and the chrome head's 2:1 sides, shortened to 5 wide and 4 deep so the stem stays
// visible: with the full chrome head (7 wide, 6 deep) and a 3-unit stem, the wedge over the dot read as '!' at 14-16px.
// The moon is the odd-width 3x3 dot on column 7 (x6-9, y11-14), the dot-like minimum, not the 4x4 overlay dot.
const stepMoon = () => disc(7.5, 12.5, 1.5);
const arrowDown = [[7, 1], [8, 1], [8, 6], [10, 6], [8, 10], [7, 10], [5, 6], [7, 6]]; // stem y1-6, head x5-10, y6-10
const flipY = (points, sum) => points.map(([x, y]) => [x, sum - y]);
drawings['step-into'] = () => svgDocument(polygon(arrowDown), stepMoon()); // tip 1 unit above the moon
drawings['step-out'] = () => svgDocument(polygon(flipY(arrowDown, 11)), stepMoon()); // the same arrow turned up, y1-10
// step-over: a half-ring band over the moon (outer r 4.5, inner 3.5 about (7.5, 8.5): x3-12, legs ending square at y9)
// and a filled 45-degree head below its right leg, pointing down (x8.5-14.5, y9-12, 6 wide and 3 deep), 1.68 clear of
// the moon. A 5-wide head (x9-14) shrank to a nub at 14px.
const overArc = 'M3 9V8.5A4.5 4.5 0 0 1 12 8.5V9H11V8.5A3.5 3.5 0 0 0 4 8.5V9Z';
drawings['step-over'] = () => svgDocument(overArc, polygon([[8.5, 9], [14.5, 9], [11.5, 12]]), stepMoon());

// ---- Run, test and debug toolbar (Task 8) ----
// One play triangle for every run glyph: x4-13, y2-14 with 2:3 sides (Codicon's play fills about the same box).
// debug-start is filled; run and testing-run-icon (which inherits run) are its outline (spec 5.2).
const play = [[4, 2], [13, 8], [4, 14]];
const shiftX = (points, dx) => points.map(([x, y]) => [x + dx, y]);
drawings['play-filled'] = () => svgDocument(polygon(play));
// 1-unit back edge; the inner sides are parallel to the outer ones, 1.11 across, with every point on the grid.
drawings['play-outline'] = () => svgDocument(polygon(play), polygon([[5, 4], [11, 8], [5, 12]], 'ccw'));
// testing-run-all-icon: the play triangle moved 3 left and filled (the front triangle), and a second one behind it
// (the triangle moved 2 right) of which only the two sides show, as an open chevron 1.66 across, 1.11 clear of the front
// triangle. Codicon offsets the second triangle down and left; with these sides that offset runs parallel to the
// lower side and leaves under 1 unit between the two, and a bar in front of the triangle is debug-continue.
drawings['play-stacked'] = () => svgDocument(polygon(shiftX(play, -3)), polygon([[6, 2], [15, 8], [6, 14], [6, 12], [12, 8], [6, 4]]));
// debug-continue: a 2-unit bar and the play triangle moved 2 right, filled (the main shape, spec 5.2).
drawings.continue = () => svgDocument(rect(2, 2, 2, 12), polygon(shiftX(play, 2)));
// debug-pause and debug-stop: solid shapes on the square keyline, centred on (8,8).
drawings.pause = () => svgDocument(rect(3, 2, 3, 12), rect(10, 2, 3, 12)); // bars x3-6 and x10-13, 4 apart
drawings['stop-square'] = () => svgDocument(rect(3, 3, 10, 10)); // x3-13, y3-13
// debug-restart: one arrow round, anticlockwise like Codicon's: a 1-unit band (r 4-5 about (8,9), x3-13, y4-14) from the
// top, round by the right and the bottom to the left side, open at the upper left, and a filled 45-degree head on the
// top end pointing into the gap (base x8, y1.5-7.5; tip (5, 4.5)). sync (status batch) is two arrows chasing each other
// and is half-turn symmetric; restart has one head and is not.
drawings.restart = () => svgDocument('M8 4A5 5 0 1 1 3 9H4A4 4 0 1 0 8 5Z', polygon([[8, 1.5], [8, 7.5], [5, 4.5]]));

// ---- Test result (Task 9) ----
// testing-passed-icon sits beside testing-failed-icon (the skull) in the Testing view and the editor gutter, so it uses
// the skull's footprint (x2-14), like warning and info. The check is cut out 2.12 across (3 tall), which meets the
// 2-unit cut-out minimum without an exception; the disc keeps at least 1.53 units of wall around it.
drawings['check-disc'] = () => svgDocument(disc(8, 8, 6), polygon([[4, 8], [5.5, 6.5], [7, 8], [10.5, 4.5], [12, 6], [7, 11]], 'ccw'));
