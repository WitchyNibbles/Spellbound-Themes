// First batch (spec section 5.3): 21 designs, 23 drawings. Tasks 12-15 append to these objects.
import { crescent, disc, frame, leaf, polygon, rect, ring, roundRect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

// ---- Shared chrome (Task 12) ----
// Chevrons: ~1.4-unit 45-degree bands, 2 units deep at the apex; one pre-rotated drawing per orientation (section 5.1).
drawings['chevron-down'] = () => svgDocument(polygon([[3, 6], [4, 5], [8, 9], [12, 5], [13, 6], [8, 11]]));
drawings['chevron-right'] = () => svgDocument(polygon([[5, 4], [6, 3], [11, 8], [6, 13], [5, 12], [9, 8]]));
drawings['chevron-up'] = () => svgDocument(polygon([[3, 10], [8, 5], [13, 10], [12, 11], [8, 7], [4, 11]]));
// Close and the dirty star swap in the same tab-action box: same centre (8,8), same 10-unit span (3-13).
drawings.close = () => svgDocument(polygon([[3, 4], [4, 3], [13, 12], [12, 13]]), polygon([[12, 3], [13, 4], [4, 13], [3, 12]]));
// Inner vertices at 1.5 from the centre (a 3x3 solid core): at 1.0 the 16px render read as a thin '+' and lighter than the close.
drawings['dirty-star'] = () => svgDocument(polygon([[8, 3], [9.5, 6.5], [13, 8], [9.5, 9.5], [8, 13], [6.5, 9.5], [3, 8], [6.5, 6.5]]));
// Breadcrumb separator: small five-point star with a solid core.
drawings['star-separator'] = () => svgDocument(polygon([[8, 4.5], [9, 7], [11.5, 7], [9.5, 8.5], [10.5, 11], [8, 9.5], [5.5, 11], [6.5, 8.5], [4.5, 7], [7, 7]]));

// ---- Signals (Task 13) ----
// Flame: pointed top, round bottom; shape-bearing accent 4 wide.
const flame = (cx, top, bottom, half) => `M${cx} ${top}C${cx + half * 0.6} ${top + 1.5} ${cx + half} ${bottom - half - 0.6} ${cx + half} ${bottom - half}`
  + `A${half} ${half} 0 0 1 ${cx - half} ${bottom - half}C${cx - half} ${bottom - half - 0.6} ${cx - half * 0.6} ${top + 1.5} ${cx} ${top}Z`;

// Adjusted after the 16px sheet: the first-pass 4x5 flame lost its point and read as a round dot, so the flame is 4x6;
// the 6x7 body read as a jar, so the body is a 4-wide pillar.
drawings.candle = () => svgDocument(
  frame(6, 9, 4, 6, { r: 0 }), // wax body x6-10, y9-15, 1-unit walls, 2x4 inside
  rect(7, 8, 2, 1), // wick x7-9, y8-9
  flame(8, 1, 7, 2), // accent: flame x6-10, y1-7, one unit above the wick
);

drawings.skull = () => svgDocument(
  roundRect(2, 2, 12, 9, 4), // cranium x2-14, y2-11
  rect(5, 10, 6, 4), // jaw x5-11, y10-14 (overlaps the cranium; same winding, so they merge)
  roundRect(4, 6, 3, 3, 1, 'ccw'), // left eye x4-7, y6-9
  roundRect(9, 6, 3, 3, 1, 'ccw'), // right eye x9-12, y6-9
  rect(6, 11, 4, 1, 'ccw'), // teeth line: straight 4-unit slot (section 4 exception)
);

// Hand bell. Keep the top-right corner (x10-15, y1-6) free so bell-dot can add its ✦ there in phase 2.
drawings.bell = () => svgDocument(
  rect(7, 1, 2, 3), // handle x7-9, y1-4
  'M6 4H10C11.1 4 12 4.9 12 6V11L14 13H2L4 11V6C4 4.9 4.9 4 6 4Z', // flared bell, clockwise
  'M6 5C5.4 5 5 5.4 5 6V11.4L4.4 12H11.6L11 11.4V6C11 5.4 10.6 5 10 5Z', // inside, counter-clockwise
  disc(8, 14, 1), // clapper x7-9, y13-15
);

// Small git-branch sprig (a different drawing from the activity-bar herb sprig).
drawings['sprig-small'] = () => svgDocument(
  rect(4, 6, 1, 9), // stem x4-5, y6-15
  leaf([4.5, 1], [4.5, 6], 4), // leaf on the stem (commit node), x2.5-6.5, y1-6
  polygon([[5, 12], [10, 7], [11, 8], [5, 14]]), // branch, ~1.4-unit 45-degree band
  leaf([10.5, 7.5], [13.5, 4.5], 4), // leaf at the branch tip (commit node)
);

// Gate 1 (decision 4 iv): plain disc. The 2x2 crater was a 1-2 px hole at 16px/100% and read as a pupil.
drawings['moon-breakpoint'] = () => svgDocument(disc(8, 8, 4)); // 8-unit full moon

// ---- Identity A (Task 14) ----
// Adjusted after the 16px sheet: the first-pass cover (one hole, 2-unit spine and bottom wall) read as a picture frame.
// A 1-unit page slot (straight-slot exception, open at the fore-edge) splits off the back cover, so it reads as a book.
drawings['explorer-grimoire'] = () => svgDocument(
  roundRect(2, 1, 12, 14, 1), // cover x2-14, y1-15
  rect(4, 2, 9, 10, 'ccw'), // inside x4-13, y2-12: 2-unit spine on the left
  rect(4, 13, 10, 1, 'ccw'), // page slot x4-14, y13-14, open at the fore-edge; the y12-13 page block and y14-15 back cover remain
  crescent({ cx: 10, cy: 7, r: 3, facing: 'right' }), // accent: crescent clasp x7-11, y4-10, 2 units clear of the walls
);

// Lens upper left, handle lower right: the 1.141 codicon.ttf `search` glyph has this orientation.
const lensAndHandle = () => [ring(7, 7, 5), polygon([[14, 13], [10.5, 9.5], [9.5, 10.5], [13, 14]])];
// Gate 1 (decision 12): plain dot. The crescent shrank to a 1-2 px sliver in the 16px compact bar at 100%.
drawings['scrying-glass'] = () => svgDocument(lensAndHandle(), disc(7, 7, 2));

// Adjusted after the 16px sheet: the first pass was the small sprig moved up one unit (and its 4x4 top leaf drew as a
// circle), so the two could not be told apart. The activity-bar sprig now has the three commit nodes of the Codicon
// source-control layout (top, bottom, branch tip); sprig-small keeps two.
drawings['herb-sprig'] = () => svgDocument(
  leaf([4.5, 1], [4.5, 6], 4), // top leaf (commit node), x2.5-6.5, y1-6
  rect(4, 6, 1, 4), // stem x4-5, y6-10
  leaf([4.5, 10], [4.5, 15], 4), // bottom leaf (commit node), x2.5-6.5, y10-15
  polygon([[5, 8], [9, 4], [10, 5], [5, 10]]), // branch, ~1.4-unit 45-degree band
  leaf([9.5, 4.5], [13, 1], 4), // leaf at the branch tip (commit node)
);

// Spider on a thread; the play triangle is the accent on its body. Adjusted after the 16px sheet: the first pass (ring
// body r 5 with seven evenly spaced spokes, legs only ~1.4 units long) read as a gear or a sun. The body is now an
// 8x12 stadium, which still holds the 4x4 triangle with a unit of clearance, and frees 2-3 units on each side for
// legs. Three legs per side, mirrored about x = 8, each starting inside the body wall.
const mirror = (points) => points.map(([x, y]) => [16 - x, y]);
const spiderLegs = [
  [[2, 5], [3, 4], [5, 6], [4, 7]], // front leg, 45 degrees up
  [[2, 9], [5, 9], [5, 10], [2, 10]], // middle leg, horizontal x2-5, y9-10
  [[2.5, 12.5], [3.5, 13.5], [5, 12], [4, 11]], // back leg, 45 degrees down
];
drawings.spider = () => svgDocument(
  rect(7, 1, 1, 3), // thread on pixel column 7, y1-4 (runs into the body wall)
  roundRect(4, 3, 8, 12, 4), // body x4-12, y3-15
  roundRect(5, 4, 6, 10, 3, 'ccw'), // body inside x5-11, y4-14 (straight sides y7-11)
  polygon([[6, 7], [10, 9], [6, 11]]), // accent: play triangle 4x4, at least 1 unit inside the wall
  spiderLegs.map((leg) => polygon(leg)),
  spiderLegs.map((leg) => polygon(mirror(leg))),
);

drawings.flask = () => svgDocument(
  'M5 1H11V2H10V6L14 13V14A1 1 0 0 1 13 15H3A1 1 0 0 1 2 14V13L6 6V2H5Z', // lip, neck and body, clockwise
  'M7 2V6.27L3 13.27V14H13V13.27L9 6.27V2Z', // inside, counter-clockwise
  polygon([[6, 10], [10, 10], [11.7, 13], [4.3, 13]]), // accent: liquid, ~1 unit inside the walls
);

// Codicon extensions layout: an L of three tiles plus one lifted tile. The 3x3 tile interiors cannot hold a rune
// mark that meets the cut-out rules, so the tiles are plain; raise this at the gate.
drawings['rune-tiles'] = () => svgDocument(
  frame(2, 9, 5, 5, { r: 0 }), // bottom-left tile x2-7, y9-14
  frame(6, 9, 5, 5, { r: 0 }), // bottom-right tile x6-11 (shares the x6-7 wall)
  frame(2, 5, 5, 5, { r: 0 }), // upper tile y5-10 (shares the y9-10 wall)
  rect(9, 2, 5, 5), // accent: lifted tile x9-14, y2-7, two units clear of the others
);

// ---- Identity B (Task 15) ----
drawings['moon-gate'] = () => svgDocument(
  'M2 15V8A6 6 0 0 1 14 8V15H13V8A5 5 0 0 0 3 8V15Z', // arch with a 1-unit wall, open at the ground
  rect(1, 14, 3, 1), rect(12, 14, 3, 1), // feet
  crescent({ cx: 8, cy: 8, r: 3, facing: 'right' }), // accent x5-9, y5-11, two units inside the arch
);

// Adjusted after the 16px sheet: the first-pass slot (x5.5-10.5) put vertical edges off the whole-number grid and left
// sub-unit slivers joining the band to the brim. The cone now stops at y11, a clean 1-unit gap above the brim.
drawings['witch-hat'] = () => svgDocument(
  roundRect(1, 12, 14, 2, 1), // wide brim x1-15, y12-14
  polygon([[4, 11], [8, 3], [9, 2], [13, 2], [11, 4], [12, 11]]), // cone x4-12, y2-11, 2:1 left side, tip bent to the right
  // hollow upper cone y4-8, walls parallel to the cone (left ~1.1 across, right 1); snapping these points to the half
  // grid gave either a 0.9 left wall or a small window that made the cone read solid
  polygon([[6.75, 8], [8.75, 4], [10, 4], [10.571, 8]], 'ccw'),
  // accent: the solid band is the cone between the hollow (y8) and the gap above the brim (y11)
);

// Spin-safe (section 4): symmetric about (8,8), one tooth pointing up. Adjusted after the 16px sheet: the first-pass
// polar teeth (4.2 units wide at the tip) left almost no gap at the root and read as a notched disc. Teeth are now
// 2-unit parallel bands (the top, bottom and side teeth land on whole numbers, x7-9 / y7-9) with ~2.3-unit root gaps.
const gearOutline = ({ cx = 8, cy = 8, teeth = 8, outer = 7, root = 5.5, half = 1 } = {}) => {
  const fmt = (value) => Number(value.toFixed(3)).toString();
  const at = (u, v, along, across) => `${fmt(cx + u[0] * along + v[0] * across)} ${fmt(cy + u[1] * along + v[1] * across)}`;
  const base = Math.sqrt(root * root - half * half);
  let d = '';
  let first = '';
  for (let k = 0; k < teeth; k += 1) {
    const angle = (k / teeth) * 2 * Math.PI - Math.PI / 2;
    const u = [Math.cos(angle), Math.sin(angle)];
    const v = [-Math.sin(angle), Math.cos(angle)]; // clockwise on screen
    const start = at(u, v, base, -half);
    if (k === 0) first = start;
    d += `${k === 0 ? 'M' : `A${fmt(root)} ${fmt(root)} 0 0 1 `}${start}L${at(u, v, outer, -half)}L${at(u, v, outer, half)}L${at(u, v, base, half)}`;
  }
  return `${d}A${fmt(root)} ${fmt(root)} 0 0 1 ${first}Z`;
};
// Gate 1 (decision 12): plain dot in the hub. The crescent turned into a smudge at 16px/100%.
drawings.gear = () => svgDocument(gearOutline(), disc(8, 8, 3, 'ccw'), disc(8, 8, 2));

drawings['cat-head'] = () => svgDocument(
  polygon([[2, 2], [6, 5], [10, 5], [14, 2], [14, 12], [11, 15], [5, 15], [2, 12]]), // head with pointed ears
  polygon([[3, 4], [5.7, 6], [10.3, 6], [13, 4], [13, 11.6], [10.6, 14], [5.4, 14], [3, 11.6]], 'ccw'), // 1-unit wall
  leaf([4, 10], [7.5, 10], 3), leaf([8.5, 10], [12, 10], 3), // accent: almond eyes 3.5x3, symmetric about x = 8
);

// Owl: round head with tufts swept outward, round eyes and a beak. Adjusted after the 16px sheet: the first pass (a
// shield head with two upper points) was the cat's silhouette with a pointed chin, so the two could not be told apart.
const owlTuft = [[2, 2], [5.7, 4.1], [3.3, 6.2]]; // tip on the square keyline corner, base inside the 1-unit head wall
drawings.owl = () => svgDocument(
  ring(8, 9, 6), // head x2-14, y3-15
  polygon(owlTuft), polygon(mirror(owlTuft)), // ear tufts
  disc(5.5, 8.5, 1.5), disc(10.5, 8.5, 1.5), // accent: eyes 3x3 (odd diameter, centres on .5), 2 apart, ~1 unit inside the wall
  polygon([[7, 11], [9, 11], [8, 13]]), // beak x7-9, y11-13, one unit below the eyes (without it the round head read as a devil)
);

drawings.terminal = () => svgDocument(
  frame(1, 2, 14, 12), // window x1-15, y2-14
  polygon([[3, 5], [4, 4], [7, 7], [4, 10], [3, 9], [5, 7]]), // prompt ❯, x3-7, y4-10
  crescent({ cx: 11, cy: 8, r: 3, facing: 'right' }), // accent x8-12, y5-11, where the cursor would be
);
