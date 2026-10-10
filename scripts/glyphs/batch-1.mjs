// First batch (spec section 5.3): 21 designs, 23 drawings. Tasks 12-15 append to these objects.
import { crescent, disc, frame, leaf, polygon, rect, ring, roundRect, svgDocument } from './primitives.mjs';

export const drawings = {};
export const variants = {};

// Shared parts (phase 2): the status batch builds bell-dot, the copilot cat variants and the dirty-branch sprigs from
// these, so a variant never drifts from its base drawing; the panel batch (gate 3) builds its ink drops from the
// flame. Each returns path strings for svgDocument.
export const parts = {
  // ✦: four tips at `outer` from (cx, cy) on the axes, waist vertices at `inner` on the diagonals (a solid core).
  star: (cx, cy, outer, inner) => polygon([[cx, cy - outer], [cx + inner, cy - inner], [cx + outer, cy], [cx + inner, cy + inner],
    [cx, cy + outer], [cx - inner, cy + inner], [cx - outer, cy], [cx - inner, cy - inner]]),
  // Hand bell. Nothing of it lies inside x10-15, y1-6, so bell-dot can put its ✦ there (test/glyph-parts.test.mjs).
  // Gate 1 (G3): the dome used to start at y4 (its shoulder reached (11.4, 4.6), inside that corner) and the inner flare
  // sat on 11.4/4.4/11.6. The dome now starts at y6 under a longer handle (x7-9, y1-7, running into the dome), and the
  // inner flare is on the half grid, parallel to the outer flare (x + y = 16.5 on the left, x - y = -0.5 on the right).
  bell: () => [
    rect(7, 1, 2, 6), // handle x7-9, y1-7
    'M6 6H10C11.1 6 12 6.9 12 8V11L14 13H2L4 11V8C4 6.9 4.9 6 6 6Z', // dome from y6 and flared body, clockwise
    'M6 7C5.4 7 5 7.4 5 8V11.5L4.5 12H11.5L11 11.5V8C11 7.4 10.6 7 10 7Z', // inside x5-11, y7-12, counter-clockwise
    disc(8, 14, 1), // clapper x7-9, y13-15
  ],
  catHeadOutline: () => [
    polygon([[2, 2], [6, 5], [10, 5], [14, 2], [14, 12], [11, 15], [5, 15], [2, 12]]), // head with pointed ears
    // inside, counter-clockwise. Gate 1 (G3): snapped from 5.7/10.3/11.6/5.4/10.6 to the half grid; the chin chamfers
    // stay parallel to the outer ones (~1.06 across) and the ear walls are 1.0-1.1.
    polygon([[3, 4], [5.5, 6], [10.5, 6], [13, 4], [13, 11.5], [10.5, 14], [5.5, 14], [3, 11.5]], 'ccw'),
  ],
  catEyes: () => [leaf([4, 10], [7.5, 10], 3), leaf([8.5, 10], [12, 10], 3)], // [left, right]: almond eyes 3.5x3, symmetric about x = 8
  // Flame (or drop): pointed top, round bottom, 2 * half wide, all curves, so every point stays on the grid.
  flame: (cx, top, bottom, half) => `M${cx} ${top}C${cx + half * 0.6} ${top + 1.5} ${cx + half} ${bottom - half - 0.6} ${cx + half} ${bottom - half}`
    + `A${half} ${half} 0 0 1 ${cx - half} ${bottom - half}C${cx - half} ${bottom - half - 0.6} ${cx - half * 0.6} ${top + 1.5} ${cx} ${top}Z`,
  // Small git-branch sprig (a different drawing from the activity-bar herb sprig).
  sprigSmall: () => [
    rect(4, 6, 1, 9), // stem x4-5, y6-15
    leaf([4.5, 1], [4.5, 6], 4), // leaf on the stem (commit node), x2.5-6.5, y1-6
    polygon([[5, 12], [10, 7], [11, 8], [5, 14]]), // branch, ~1.4-unit 45-degree band
    leaf([10.5, 7.5], [13.5, 4.5], 4), // leaf at the branch tip (commit node)
  ],
};

// ---- Shared chrome (Task 12) ----
// Chevrons: ~1.4-unit 45-degree bands, 2 units deep at the apex; one pre-rotated drawing per orientation (section 5.1).
drawings['chevron-down'] = () => svgDocument(polygon([[3, 6], [4, 5], [8, 9], [12, 5], [13, 6], [8, 11]]));
drawings['chevron-right'] = () => svgDocument(polygon([[5, 4], [6, 3], [11, 8], [6, 13], [5, 12], [9, 8]]));
drawings['chevron-up'] = () => svgDocument(polygon([[3, 10], [8, 5], [13, 10], [12, 11], [8, 7], [4, 11]]));
// Close and the dirty star swap in the same tab-action box: same centre (8,8), same 10-unit span (3-13).
drawings.close = () => svgDocument(polygon([[3, 4], [4, 3], [13, 12], [12, 13]]), polygon([[12, 3], [13, 4], [4, 13], [3, 12]]));
// Inner vertices at 1.5 from the centre (a 3x3 solid core): at 1.0 the 16px render read as a thin '+' and lighter than the close.
drawings['dirty-star'] = () => svgDocument(parts.star(8, 8, 5, 1.5));
// Breadcrumb separator: small five-point star with a solid core.
drawings['star-separator'] = () => svgDocument(polygon([[8, 4.5], [9, 7], [11.5, 7], [9.5, 8.5], [10.5, 11], [8, 9.5], [5.5, 11], [6.5, 8.5], [4.5, 7], [7, 7]]));

// ---- Signals (Task 13) ----
// Adjusted after the 16px sheet: the first-pass 4x5 flame lost its point and read as a round dot, so the flame is 4x6;
// the 6x7 body read as a jar, so the body is a 4-wide pillar.
drawings.candle = () => svgDocument(
  frame(6, 9, 4, 6, { r: 0 }), // wax body x6-10, y9-15, 1-unit walls, 2x4 inside
  rect(7, 8, 2, 1), // wick x7-9, y8-9
  parts.flame(8, 1, 7, 2), // accent: flame x6-10, y1-7, one unit above the wick (shape-bearing accent 4 wide)
);

drawings.skull = () => svgDocument(
  roundRect(2, 2, 12, 9, 4), // cranium x2-14, y2-11
  rect(5, 10, 6, 4), // jaw x5-11, y10-14 (overlaps the cranium; same winding, so they merge)
  roundRect(4, 6, 3, 3, 1, 'ccw'), // left eye x4-7, y6-9
  roundRect(9, 6, 3, 3, 1, 'ccw'), // right eye x9-12, y6-9
  rect(6, 11, 4, 1, 'ccw'), // teeth line: straight 4-unit slot (section 4 exception)
);

drawings.bell = () => svgDocument(parts.bell());
drawings['sprig-small'] = () => svgDocument(parts.sprigSmall());

// Gate 1 (decision 4 iv): plain disc. The 2x2 crater was a 1-2 px hole at 16px/100% and read as a pupil.
drawings['moon-breakpoint'] = () => svgDocument(disc(8, 8, 4)); // 8-unit full moon

// ---- Identity A (Task 14) ----
// Adjusted after the 16px sheet: the first-pass cover (one hole, 2-unit spine and bottom wall) read as a picture frame.
// A 1-unit page slot (straight-slot exception, open at the fore-edge) splits off the back cover, so it reads as a book.
drawings['explorer-grimoire'] = () => svgDocument(
  roundRect(2, 1, 12, 14, 1), // cover x2-14, y1-15
  rect(4, 2, 9, 10, 'ccw'), // inside x4-13, y2-12: 2-unit spine on the left
  rect(4, 13, 10, 1, 'ccw'), // page slot x4-14, y13-14, open at the fore-edge; the y12-13 page block and y14-15 back cover remain
  // accent: crescent clasp x5-9, y3-9, one unit clear of the spine and the top wall. Gate 1 (G7): moved from x7-11,
  // y4-10 to the upper left, because VS Code draws the Explorer badge over the lower right of the activity-bar icon.
  crescent({ cx: 8, cy: 6, r: 3, facing: 'right' }),
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

// Spider on a thread. Gate 1 (G7): the stadium body with a play mark read as the stock debug-alt beetle, so the body
// is now a solid round disc centred on (8,8) (the filled part) with eight splayed legs, four per side, mirrored about
// x = 8 and about y = 8. Each leg is two straight bands that meet at a knee: the front legs' 45-degree bands are 1.41
// across, the second legs' 1.06; feet and arms are 1-unit straight bands on whole numbers. Every foot stays within 0.25 of the
// circle-14 keyline of phase 1 (farthest point 7.21 from (8,8), so the feet overshoot the radius-7 circle by 0.21). Leg ends run into the body.
const mirror = (points) => points.map(([x, y]) => [16 - x, y]);
const flipY = (points) => points.map(([x, y]) => [x, 16 - y]);
const upperLegs = [
  [[4, 2], [5, 2], [5, 4], [7, 6], [6, 7], [4, 5]], // front leg: foot x4-5, y2-5, then 45 degrees in to the body
  [[2, 4.5], [3.5, 6], [6, 6], [6, 7], [3, 7], [2, 6]], // second leg: arm y6-7 out to x3, then 45 degrees up, cut at x2
];
const spiderLegs = [...upperLegs, ...upperLegs.map(flipY)];
drawings.spider = () => svgDocument(
  rect(7, 1, 1, 5), // thread on pixel column 7, y1-6 (runs into the body)
  disc(8, 8, 3), // accent: round body x5-11, y5-11, solid
  spiderLegs.map((leg) => polygon(leg)),
  spiderLegs.map((leg) => polygon(mirror(leg))),
);

// Gate 1 (G3): the inner shoulders moved from y6.27/13.27 to y6.5/13.5. The inner walls keep the outer 7:4 slope, so
// the side walls are ~1.12 across (was 1.0). The liquid's corners moved onto the half grid, 1.05-1.3 inside the walls;
// its top narrowed from 4 units (x6-10) to 3 (x6.5-9.5) to keep that clearance.
drawings.flask = () => svgDocument(
  'M5 1H11V2H10V6L14 13V14A1 1 0 0 1 13 15H3A1 1 0 0 1 2 14V13L6 6V2H5Z', // lip, neck and body, clockwise
  'M7 2V6.5L3 13.5V14H13V13.5L9 6.5V2Z', // inside, counter-clockwise
  polygon([[6.5, 10], [9.5, 10], [11.5, 13], [4.5, 13]]), // accent: liquid y10-13, one unit above the floor
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
// Gate 1 (G7): thicker arch, stronger crescent cut. The arch now fills the round keyline (outer r7) with a 2-unit
// wall, and the crescent grows from r3 to r4 at the same 2-unit thickness, so the bite is a larger share of the moon.
// The feet are dropped: the legs already stand on the keyline edge (x1-3, x13-15), so feet would leave the grid.
drawings['moon-gate'] = () => svgDocument(
  'M1 15V8A7 7 0 0 1 15 8V15H13V8A5 5 0 0 0 3 8V15Z', // arch x1-15, y1-15, 2-unit wall (outer r7, inner r5), open at the ground
  crescent({ cx: 8, cy: 9, r: 4, facing: 'right' }), // accent x4-9, y5-13: one unit inside the left leg, two below the arch top
);

// Gate 1 (G7): the outline cone on a flat bar read as a triangle on a bar. The hat is now a solid silhouette (a hollow
// cone this narrow leaves sub-2-unit slivers): a pointed, curved brim, a band, and a cone whose tip bends over to the
// right. A 1-unit slot at y8-9 is the band notch that sets the band off. The left sides of cone and band share one
// 2:1 line (x = 6.5 - (y - 8) / 2), so the slot reads as one cut through one cone on that side; the band's right side
// continues 2:1 (x = 10 + (y - 8) / 2 below the slot), while the cone's right edge above the slot is the near-vertical
// start of the bent tip, not 2:1.
drawings['witch-hat'] = () => svgDocument(
  'M1 13C4 11.5 12 11.5 15 13C12 14.5 4 14.5 1 13Z', // brim x1-15, y11.875-14.125, pointed at both ends
  polygon([[4, 13], [6, 9], [10.5, 9], [12.5, 13]]), // accent: band y9-13 (its lower unit runs into the brim)
  'M6.5 8L8.5 4C9.5 2 11 1 13 1.5L14 4L12 3C11 3.5 10.3 5 10 8Z', // cone y1-8, tip bent over to (14, 4)
);

// Spin-safe (section 4): symmetric about (8,8), one tooth pointing up. Adjusted after the 16px sheet: the first-pass
// polar teeth (4.2 units wide at the tip) left almost no gap at the root and read as a notched disc. Teeth are now
// 2-unit parallel bands (the top, bottom and side teeth land on whole numbers, x7-9 / y7-9) with ~2.3-unit root gaps.
// Gate 1 (G3): `base` (the tooth's root corners, measured along the tooth) is 5.5, so the four axis teeth end on the
// half grid (y2.5, x13.5 ...) and the root arc radius follows from it (5.59, was 5.5). Kept off the grid on purpose:
// the corners of the four 45-degree teeth sit at 8 ± (along ± across) / sqrt(2), which no half-unit value reaches
// while the tooth stays a 2-unit parallel band; snapping them makes those teeth uneven trapezoids.
const gearOutline = ({ cx = 8, cy = 8, teeth = 8, outer = 7, base = 5.5, half = 1 } = {}) => {
  const fmt = (value) => Number(value.toFixed(3)).toString();
  const at = (u, v, along, across) => `${fmt(cx + u[0] * along + v[0] * across)} ${fmt(cy + u[1] * along + v[1] * across)}`;
  const root = Math.hypot(base, half);
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

drawings['cat-head'] = () => svgDocument(parts.catHeadOutline(), parts.catEyes()); // accent: the eyes

// Owl. Gate 1 (G7): the round head with corner tufts read as a second cat at 16px, and a first redraw with a U-shaped
// body under the eyes read as a grinning cat in goggles. The owl is now its face: two eye rings that meet at x = 8 (odd
// 7-unit diameter, centres on .5), each holding a 3x3 eye disc with one unit of clearance, ear tufts on the rings and a
// beak whose top edge closes the junction where the rings touch. The brow between the eyes is open (the cat has its
// head wall there), and each 7-unit eye ring is twice the width of the cat's 3.5-unit almond eye. Bounds y3-13.
const owlTuft = [[2, 3], [4.5, 5.5], [2, 6.5]]; // tip on x2, like the cat's ear tips; base inside the eye ring wall
drawings.owl = () => svgDocument(
  ring(4.5, 8.5, 3.5), ring(11.5, 8.5, 3.5), // eye rings x1-8 and x8-15, y5-12, 1-unit wall
  disc(4.5, 8.5, 1.5), disc(11.5, 8.5, 1.5), // accent: eyes 3x3, one unit inside each ring
  polygon(owlTuft), polygon(mirror(owlTuft)), // ear tufts
  polygon([[7, 8.5], [9, 8.5], [8, 13]]), // beak x7-9, y8.5-13; its top edge lies inside the ring walls
);

drawings.terminal = () => svgDocument(
  frame(1, 2, 14, 12), // window x1-15, y2-14
  polygon([[3, 5], [4, 4], [7, 7], [4, 10], [3, 9], [5, 7]]), // prompt ❯, x3-7, y4-10
  crescent({ cx: 11, cy: 8, r: 3, facing: 'right' }), // accent x8-12, y5-11, where the cursor would be
);
