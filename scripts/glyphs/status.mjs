// Status batch (spec section 5.2 "Status and signals"; gate-1 decisions G4 and G6). Tasks 7-10 append to these objects.
import { crescent, disc, knockOut, polygon, rect, svgDocument } from './primitives.mjs';
import { parts } from './batch-1.mjs';

export const drawings = {};
export const variants = {};

// ---- Severity signals (Task 7) ----
// warning and info replace full-size Codicons in the status bar and the Problems tree next to the skull, so they use
// the skull's footprint (x2-14, y2-14), not the 8-unit signal keyline. The cut-outs are 2 wide, centred on x = 8.
drawings['warning-triangle'] = () => svgDocument(
  polygon([[8, 2], [14, 14], [2, 14]]), // triangle x2-14, y2-14, 2:1 sides
  rect(7, 7, 2, 3, 'ccw'), // ! stem x7-9, y7-10 (starts at y7, where the sides leave a 1.5-unit wall)
  rect(7, 11, 2, 2, 'ccw'), // ! dot x7-9, y11-13, 1 unit above the base
);
drawings['info-disc'] = () => svgDocument(
  disc(8, 8, 6), // disc x2-14, y2-14
  rect(7, 4, 2, 2, 'ccw'), // i dot x7-9, y4-6
  rect(7, 7, 2, 5, 'ccw'), // i stem x7-9, y7-12
);
// Saltire (✕) as one polygon. Two overlapping counter-wound bars would wind to -1 where they cross (disc +1, two holes
// -1 each) and fill that square. (p, q) = (dx + dy, dx - dy); k = half-width, m = arm length, both in that measure.
const saltire = (cx, cy, k, m, dir = 'cw') => polygon(
  [[k, m], [k, k], [m, k], [m, -k], [k, -k], [k, -m], [-k, -m], [-k, -k], [-m, -k], [-m, k], [-k, k], [-k, m]]
    .map(([p, q]) => [cx + (p + q) / 2, cy + (p - q) / 2]),
  dir,
);
// Terminal gutter: 8-unit signal keyline (4-12). The ✕ arms are 1.41 across, like `close`. The first pass followed the
// 2-unit cut-out minimum (k 1.5, arms 2.12 across); at 16px/100% the ✕ closed up and the glyph read as a ring.
drawings['terminal-error'] = () => svgDocument(disc(8, 8, 4), saltire(8, 8, 1, 4, 'ccw')); // ✕ x5.5-10.5, wall >= 1.08
// Small dot (G4): smaller than the 8-unit moon breakpoint so the two never read as the same mark.
drawings['status-dot'] = () => svgDocument(disc(8, 8, 3)); // x5-11, y5-11

// ---- Bell-dot, remote, sync, loading, bracket (Task 8) ----
const fmt = (value) => Number(value.toFixed(3)).toString();
const pt = ([x, y]) => `${fmt(x)} ${fmt(y)}`;
const mirror = (points) => points.map(([x, y]) => [16 - x, y]); // about x = 8
const halfTurn = (points) => points.map(([x, y]) => [16 - x, 16 - y]); // 180 degrees about (8,8)

// bell-dot: the whole bell (unchanged, so bell and bell-dot swap in the status bar without the outline moving) plus a
// 5x5 ✦ in the corner the bell leaves free (x10-15, y1-6). Measured clearance: exactly 1.00 to the handle (x9), 1.20 to
// the dome. A 4x4 ✦ read as a speck, and a waist of 1.25 or more turns a 5x5 star into a diamond or octagon (a dot at
// 16px), so the waist stays 1: any waist under 1.25 keeps four distinct points, and 1 is the widest on the half grid.
drawings['bell-dot'] = () => svgDocument(parts.bell(), parts.star(12.5, 3.5, 2.5, 1));

// remote: a small moon gate for the status bar's remote indicator. 2-unit arch (outer r6, inner r4, both centred on
// (8,8)), no feet; the r3 crescent sits concentric inside it with 1 unit of clearance at the top and the left. A
// 2.5-thick crescent filled toward a disc at 16px, so it keeps the 2-unit thickness.
drawings['moon-gate-small'] = () => svgDocument(
  'M2 14V8A6 6 0 0 1 14 8V14H12V8A4 4 0 0 0 4 8V14Z', // arch x2-14, y2-14, clockwise
  crescent({ cx: 8, cy: 8, r: 3, facing: 'right' }), // accent x5-9, y5-11
);

// sync (spin-safe, section 4): two 1-unit ring bands (r4-5 about (8,8)) chasing clockwise, each ending in a filled
// head on the horizontal axis; the second arrow is the first turned 180 degrees about (8,8), so the glyph is balanced.
const at = (r, degrees) => [8 + r * Math.cos((degrees * Math.PI) / 180), 8 + r * Math.sin((degrees * Math.PI) / 180)];
const ringBand = (from, to, inner, outer) =>
  `M${pt(at(outer, from))}A${outer} ${outer} 0 0 1 ${pt(at(outer, to))}L${pt(at(inner, to))}A${inner} ${inner} 0 0 0 ${pt(at(inner, from))}Z`;
const syncHead = [[10.5, 8], [14.5, 8], [12.5, 10.5]]; // 4 wide, centred on the band (x12-13), pointing down
drawings['sync-arrows'] = () => svgDocument(
  ringBand(235, 360, 4, 5), polygon(syncHead), // upper arrow: from the upper left round to the right, head pointing down
  ringBand(55, 180, 4, 5), polygon(halfTurn(syncHead)), // lower arrow: the same turned 180 degrees
);

// loading (spin-safe): a crescent whose outer circle is concentric with (8,8), so VS Code's spin keeps it in place.
drawings['loading-crescent'] = () => svgDocument(crescent({ cx: 8, cy: 8, r: 6, thickness: 3, facing: 'right' })); // x2-9.5, y2-14

// bracket: { } with 1-unit strokes on whole numbers and 45-degree nibs, mirrored about x = 8.
const brace = [[5, 2], [7, 2], [7, 3], [5, 3], [5, 7], [4, 8], [5, 9], [5, 13], [7, 13], [7, 14], [5, 14], [4, 13], [4, 9], [3, 8], [4, 7], [4, 3]];
drawings.braces = () => svgDocument(polygon(brace), polygon(mirror(brace))); // x3-13, y2-14

// ---- Copilot status (Task 9): cat-head variants (decision D5) ----
// copilot-unavailable: the cat crossed out. The slash runs at 2:1 (x5-13.5, y1-15), right of centre, so the knockout
// band around it takes the whole right eye and leaves both ear tips and the whole left eye; a 45-degree slash through
// the centre cut the left ear off, and without eyes the head read as a tulip. The band |2x - y - 10.5| < 3.75 leaves
// (3.75 - 1.5) / sqrt(5) = 1.006 units on each side of the slash (exactly sqrt(5) would land at 0.99997 after the
// 3-decimal rounding of the cut points). The right eye (2x - y from 6.81 to 14.19) falls inside the band and is left
// out; the left eye (2x - y at most 5.19) stays 1.71 clear.
const slash = [[5, 1], [6.5, 1], [13.5, 15], [12, 15]]; // |2x - y - 10.5| <= 1.5: 1.5 wide on each row, 1.34 across the stroke
drawings['cat-slash'] = () => svgDocument(knockOut(parts.catHeadOutline(), [[2, -1, 6.75], [-2, 1, -14.25]]), parts.catEyes()[0], polygon(slash));

// copilot-snooze: closed eyes, drawn as lids (2-unit crescents opening upward) on the eye footprint (x4-7.5, x8.5-12).
// Slits (3x1 bars) read as a flat stare at 16px; the lids read as asleep. 1.0 clear of the head wall and of each other.
drawings['cat-asleep'] = () => svgDocument(
  parts.catHeadOutline(),
  crescent({ cx: 5.75, cy: 9, r: 1.75, thickness: 2, facing: 'up' }), // left lid x4-7.5, y8-10.75
  crescent({ cx: 10.25, cy: 9, r: 1.75, thickness: 2, facing: 'up' }), // right lid x8.5-12
);

// copilot-dot (shown while a chat promotion is unseen): the cat with its eyes, plus a ✦ pip between the ears
// (glossary: ✦ = needs attention), where Codicon puts its dot. A ✦ in place of the eyes read as a '+' on the face.
// The pip is 3 wide, so it sits on pixel column 7 (x6-9, section 4), 1 unit above the head.
drawings['cat-star'] = () => svgDocument(parts.catHeadOutline(), parts.catEyes(), parts.star(7.5, 2.5, 1.5, 0.5)); // pip x6-9, y1-4

// copilot-warning (quota reached; prominent status item): a solid cat head with the '!' cut out (stem 2x5 at x7-9, y6-11;
// dot 2x2 at y12-14), louder than the outline cats, which suits a warning. 1 unit of head stays solid above (y5), between
// and below (chin y15). Chosen at gate 2 over an outline cat with a '!' for eyes, whose 2-unit '!' was easy to miss at
// 16px. A warning triangle inside the outline head read as a nose, and Codicon's lower-right badge left the head in
// broken pieces at 16px.
drawings['cat-warning'] = () => svgDocument(
  parts.catHeadOutline()[0], // the head silhouette, filled (the shared outer outline, so a reshaped cat head follows)
  rect(7, 6, 2, 5, 'ccw'), // ! stem
  rect(7, 12, 2, 2, 'ccw'), // ! dot
);

// ---- Dirty-branch sprigs (Task 10, decision G6) ----
// The git extension swaps git-branch for these whenever the repository is dirty. Each is the small sprig plus one solid
// badge in the free lower-right corner (x9-15, y9-15), where Codicon puts its badges. The sprig leaves no room for a
// Codicon-style disc badge: a disc that clears the branch by 1 unit has r <= 2.8, too small for a cut-out symbol.
// Every badge stays at least 1 unit clear of the branch band (x + y = 19) and of the bulge of the tip leaf, whose arc
// comes down to about (12, 8): a 6x6 ✦ centred on (12,12) came within 0.96 of it.
const dirtyBadges = {
  changes: parts.star(12.5, 12.5, 2.5, 1), // ✦ x10-15, y10-15: glossary ✦ = changed; waist 1 like bell-dot (1.25 or more turns it into a round dot); measured 2.01 clear of the sprig
  staged: polygon([[10, 12], [11, 11], [12, 12], [14, 10], [15, 11], [12, 14]]), // ✓ x10-15, y10-14: ready to commit
  conflicts: [rect(13, 9, 2, 3), rect(13, 13, 2, 2)], // ! x13-15, y9-15: needs resolving, as in warning
};
drawings['sprig-changes'] = () => svgDocument(parts.sprigSmall(), dirtyBadges.changes);
drawings['sprig-staged'] = () => svgDocument(parts.sprigSmall(), dirtyBadges.staged);
drawings['sprig-conflicts'] = () => svgDocument(parts.sprigSmall(), dirtyBadges.conflicts);
