// Glyph primitives on the 16-unit grid. 'cw' = solid (clockwise on screen), 'ccw' = hole.
// The font pipeline fills with nonzero winding, so a hole must be wound opposite to its container (spec section 4).
import { signedArea, subpaths } from '../lib/svg-geometry.mjs';

const fmt = (value) => Number(value.toFixed(3)).toString();
const pt = ([x, y]) => `${fmt(x)} ${fmt(y)}`;

export function polygon(points, dir = 'cw') {
  const clockwise = signedArea(points) > 0;
  const ordered = clockwise === (dir === 'cw') ? points : [...points].reverse();
  const [first, ...rest] = ordered;
  return `M${pt(first)}${rest.map((p) => `L${pt(p)}`).join('')}Z`;
}

export const rect = (x, y, w, h, dir = 'cw') => polygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], dir);

export function roundRect(x, y, w, h, r, dir = 'cw') {
  if (r === 0) return rect(x, y, w, h, dir);
  const a = `A${fmt(r)} ${fmt(r)} 0 0 ${dir === 'cw' ? 1 : 0} `;
  if (dir === 'cw') {
    return `M${pt([x + r, y])}H${fmt(x + w - r)}${a}${pt([x + w, y + r])}V${fmt(y + h - r)}${a}${pt([x + w - r, y + h])}H${fmt(x + r)}${a}${pt([x, y + h - r])}V${fmt(y + r)}${a}${pt([x + r, y])}Z`;
  }
  return `M${pt([x + r, y])}${a}${pt([x, y + r])}V${fmt(y + h - r)}${a}${pt([x + r, y + h])}H${fmt(x + w - r)}${a}${pt([x + w, y + h - r])}V${fmt(y + r)}${a}${pt([x + w - r, y])}Z`;
}

export function disc(cx, cy, r, dir = 'cw') {
  const a = `A${fmt(r)} ${fmt(r)} 0 1 ${dir === 'cw' ? 1 : 0} `;
  return `M${pt([cx - r, cy])}${a}${pt([cx + r, cy])}${a}${pt([cx - r, cy])}Z`;
}

export const ring = (cx, cy, r, stroke = 1) => [disc(cx, cy, r, 'cw'), disc(cx, cy, r - stroke, 'ccw')];

// Frame: radius-1 outer corners, sharp inner corners (section 4 advisory defaults).
export const frame = (x, y, w, h, { stroke = 1, r = 1 } = {}) => [
  roundRect(x, y, w, h, r, 'cw'),
  rect(x + stroke, y + stroke, w - 2 * stroke, h - 2 * stroke, 'ccw'),
];

const TURN = { right: 0, down: 90, left: 180, up: 270 };

// Outer disc (cx, cy, r) minus an equal disc shifted `thickness` toward `facing` (the opening).
// Width across the opening axis = r + thickness / 2; thickest point = thickness.
export function crescent({ cx, cy, r, thickness = 2, facing = 'right', dir = 'cw' }) {
  const half = thickness / 2;
  const h = Math.sqrt(r * r - half * half);
  const angle = (TURN[facing] * Math.PI) / 180;
  const rotate = ([x, y]) => [cx + x * Math.cos(angle) - y * Math.sin(angle), cy + x * Math.sin(angle) + y * Math.cos(angle)];
  const top = rotate([half, -h]);
  const bottom = rotate([half, h]);
  const rr = fmt(r);
  return dir === 'cw'
    ? `M${pt(bottom)}A${rr} ${rr} 0 1 1 ${pt(top)}A${rr} ${rr} 0 0 0 ${pt(bottom)}Z`
    : `M${pt(top)}A${rr} ${rr} 0 1 0 ${pt(bottom)}A${rr} ${rr} 0 0 1 ${pt(top)}Z`;
}

// Lens between two tips, `width` across its middle.
export function leaf([x1, y1], [x2, y2], width, dir = 'cw') {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const sagitta = width / 2;
  const r = (length * length) / (8 * sagitta) + sagitta / 2;
  const a = `A${fmt(r)} ${fmt(r)} 0 0 ${dir === 'cw' ? 1 : 0} `;
  return `M${pt([x1, y1])}${a}${pt([x2, y2])}${a}${pt([x1, y1])}Z`;
}

export const svgDocument = (...parts) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" d="${parts.flat(Infinity).join('')}"/></svg>\n`;

// Sutherland-Hodgman clip of one closed polygon against the half-plane a*x + b*y >= c. The result keeps the winding.
function clipHalfPlane(points, [a, b, c]) {
  const side = ([x, y]) => a * x + b * y - c;
  const out = [];
  points.forEach((q, index) => {
    const p = points.at(index - 1);
    const [sp, sq] = [side(p), side(q)];
    if ((sp >= 0) !== (sq >= 0)) {
      const t = sp / (sp - sq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
    if (sq >= 0) out.push(q);
  });
  return out;
}

const polygonArea = (points) => (points.length < 3 ? 0 : Math.abs(signedArea(points)));

// Knockout: removes the convex region where every half-plane [a, b, c] (a*x + b*y >= c) holds, so an accent can sit in
// a gap cut out of a shared part. Path strings that do not reach the region come back unchanged. The others are
// flattened (arcs become short straight segments) and split into disjoint pieces, one per half-plane, each keeping
// the winding of its source subpath, so solids stay solid and holes stay holes. A counter-wound "eraser" subpath
// cannot do this: over empty space it winds to -1, and the font pipeline fills any nonzero winding.
export function knockOut(paths, region) {
  return [paths].flat(Infinity).flatMap((d) => {
    const polygons = subpaths(d);
    if (polygons.every((poly) => polygonArea(region.reduce(clipHalfPlane, poly)) < 1e-6)) return [d];
    return polygons
      .flatMap((poly) => region.map(([a, b, c], index) => [...region.slice(0, index), [-a, -b, -c]].reduce(clipHalfPlane, poly)))
      .filter((piece) => polygonArea(piece) > 1e-6)
      .map((piece) => `M${piece.map(pt).join('L')}Z`);
  });
}
