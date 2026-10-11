// Code drawings (spec 6, 6.2): objects in the code colour (lavender).
import { polygon, rect, ring } from '../glyphs/primitives.mjs';
import { fileIconDocument, painted } from './parts.mjs';

export const drawings = {};

// gem-cut (ts, mts, cts; spec 6.2: a cut, faceted gem with a flat table, a wide crown and a pointed pavilion, 14
// wide). It sets the gem language of gate 6: the cut gem is wide (x1-15), flat on top and pointed at the bottom, so the
// js rough crystal (tall, pointed at the top) and the tsx/jsx gem in a ring (round) differ from it in silhouette.
// The outline is the pavilion: a 1-unit girdle x1-15, y6-7, and two 45-degree sides 2 units across horizontally (1.41
// across the stroke, section 4's diagonal weight) meeting in a point at (8,14), around a real triangular hole. The
// accent, painted last, is the crown with its flat table: solid x1-15, y1-5, the table x5-11 on top and 45-degree
// sides, one unit clear of the girdle (section 4's accent clearance); 4 tall, so it meets the 4x4 shape minimum.
drawings['gem-cut'] = () => fileIconDocument(
  painted('code', polygon([[1, 6], [15, 6], [15, 7], [8, 14], [1, 7]]), polygon([[3, 7], [13, 7], [8, 12]], 'ccw')),
  painted('code', polygon([[5, 1], [11, 1], [15, 5], [1, 5]])), // accent: the crown and its table
);

// snake (py, pyw; spec 6.2: one 2-unit band in an S-coil, the head at least 4x4). One snake, never the two-snake mark
// (spec 6 logo rule). The band runs from the head at the upper right: the top run y3-5 to the left, the upper coil
// round the left (outer radius 3.5 about (6.5,6.5), inner 1.5), the middle run y8-10 to the right, the lower coil
// round the right (about (9.5,11.5)), and the bottom run y13-15 to the left, ending in a tail cut at 45 degrees to a
// point at (3,15). Odd diameters (7 and 3) sit on .5 centres, so every straight edge is on a whole number; the runs are
// 3 units apart. The accent, painted last, is the head: solid x9-14, y2-6 (5x4) with a round nose, meeting the band
// along x = 9 and bulging one unit above and below it, two units clear of the middle run.
drawings.snake = () => fileIconDocument(
  painted('code', 'M9 3H6.5A3.5 3.5 0 0 0 6.5 10H9.5A1.5 1.5 0 0 1 9.5 13H5L3 15H9.5A3.5 3.5 0 0 0 9.5 8H6.5A1.5 1.5 0 0 1 6.5 5H9Z'),
  painted('code', 'M9 2H12A2 2 0 0 1 12 6H9Z'), // accent: the head
);

// gem-rough (js, mjs, cjs; spec 6 and G43: a rough crystal cluster, narrow and tall, pointed at the top, with shorter
// points leaning out). Fix round 1: the first drawing (a tall outlined crystal beside a short solid one on a shared
// baseline) read as a two-bar chart or a bottle at 16px, so the cluster is three solid, pointed, faceted crystals.
// The first part, solid like the accent, holds the tall crystal and the small one: the tall one is x7-11, y1-15, a
// 2:1 spire (4 units tall, 2 across each side) over vertical walls, its lower left cut at 45 degrees; the small one
// is x12-14, pointed at (13,8), its lower right cut at 45 degrees, one unit clear of the tall one. The accent,
// painted last, is the leaning crystal: solid, x2-6, y7-15, pointed at (3,7) with a 2:1 left shoulder and a 45-degree
// right shoulder, its lower left cut at 45 degrees. It keeps one unit from the tall crystal (G42: it sits beside it).
// Every point is sharp (no flat tops), every foot is cut, and no two crystals share a baseline or a point height, so
// the group reads as a cluster and not as bars.
drawings['gem-rough'] = () => fileIconDocument(
  painted('code',
    polygon([[7, 13], [7, 5], [9, 1], [11, 5], [11, 15], [9, 15]]), // the tall crystal
    polygon([[12, 10], [13, 8], [14, 10], [14, 13], [12, 15]])), // the small crystal
  painted('code', polygon([[2, 13], [2, 9], [3, 7], [6, 10], [6, 15], [4, 15]])), // accent: the leaning crystal
);

// gem-ring (tsx, jsx; spec 6 and G43: a round 10-unit ring band with a small cut gem set on top, point down). The
// outline is the band: ring(8, 10, 5), x3-13, y5-15, 1 unit, a real 8-unit hole. The accent, painted last, is the
// stone: a cut gem 8 wide, x4-12, y1-7, flat table x6-10, every slanted edge at 45 degrees, its point at (8,7) passing
// through the band (y5-6) and jutting one unit into the hole like a set stone, so ring and stone read as one object (a
// setting, part of the silhouette; G42).
drawings['gem-ring'] = () => fileIconDocument(
  painted('code', ring(8, 10, 5)),
  painted('code', polygon([[6, 1], [10, 1], [12, 3], [8, 7], [4, 3]])), // accent: the stone
);

// skeleton-key (html, htm; spec 6: a skeleton key, which must differ in silhouette from the json keyring). One key
// lying flat, not keys hanging from a ring: the bow is a 1-unit ring, ring(4, 8, 3), x1-7, y5-11 with a real 4-unit
// hole; the shaft a 1-unit bar x6-15, y7-8, running into the bow. The accent, painted last, is the bit: solid x11-15,
// y8-12, hanging under the shaft's end, two teeth split by a 1-unit notch x13-14, y10-12 (part of the key's silhouette,
// like the snake's head; G42).
drawings['skeleton-key'] = () => fileIconDocument(
  painted('code', ring(4, 8, 3), rect(6, 7, 9, 1)),
  painted('code', polygon([[11, 8], [15, 8], [15, 12], [14, 12], [14, 10], [13, 10], [13, 12], [11, 12]])), // accent: the bit
);

// tablet-prompt (sh; spec 6: a stone tablet with ❯). An arched tablet, a headstone: x2-14, y1-15, 1-unit walls, the
// arch radius 6 about (8,7). The accent, painted last, is the prompt ❯: a solid chevron 2 units across horizontally
// (1.41 across), x5-10.5, y6-13, one unit above the floor and two or more from the walls.
drawings['tablet-prompt'] = () => fileIconDocument(
  painted('code', 'M2 15V7A6 6 0 0 1 14 7V15ZM3 14H13V7A5 5 0 0 0 3 7Z'),
  painted('code', polygon([[5, 6], [7, 6], [10.5, 9.5], [7, 13], [5, 13], [8.5, 9.5]])), // accent: the prompt
);

// tablet-dollar (ps1; spec 6: a stone tablet with $, never the PowerShell >_ mark). A slab with 45-degree chamfered top
// corners, x2-14, y1-15, so it differs in silhouette from the arched sh tablet; the chamfers' inner edges are 2 units
// across horizontally. The accent, painted last, is the $: three 1-unit bars x5-11 at y5, y8 and y11, the left side
// x5-6 between the first two, the right side x10-11 between the last two (2-unit counters), and 2-unit stubs x7-9
// above and below.
drawings['tablet-dollar'] = () => fileIconDocument(
  painted('code', polygon([[4, 1], [12, 1], [14, 3], [14, 15], [2, 15], [2, 3]]), polygon([[5, 2], [11, 2], [13, 4], [13, 14], [3, 14], [3, 4]], 'ccw')),
  painted('code', rect(7, 4, 2, 1), rect(5, 5, 6, 1), rect(5, 6, 1, 2), rect(5, 8, 6, 1), rect(10, 9, 1, 2), rect(5, 11, 6, 1), rect(7, 12, 2, 1)), // accent: the $
);

// fish-bones (fish; spec 6: a fish skeleton). Facing right, symmetric about the spine y7-8: a forked tail x1-4 (two
// 45-degree bands, 2 units across horizontally), the spine x3-10, two ribs x5-6 (y4-11) and x7-8 (y3-12), one unit
// apart. The accent, painted last, is the head: a half disc of radius 3.5 about (11.5,7.5) on a flat back at x10, x10-15,
// y4-11, meeting the spine along x = 10 (part of the silhouette, like the snake's head; G42), with a real 2x2 eye
// x11-13, y6-8, one unit or more from its edges.
drawings['fish-bones'] = () => fileIconDocument(
  painted('code', polygon([[1, 5], [2, 4], [4, 6], [4, 9], [2, 11], [1, 10], [2.5, 8.5], [2.5, 6.5]]), rect(3, 7, 7, 1), rect(5, 4, 1, 7), rect(7, 3, 1, 9)),
  painted('code', 'M10 4H11.5A3.5 3.5 0 0 1 11.5 11H10Z', rect(11, 6, 2, 2, 'ccw')), // accent: the head
);
