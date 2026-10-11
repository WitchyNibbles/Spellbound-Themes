import { SVGPathData } from 'svg-pathdata';

const CURVE_STEPS = 16;
const EPSILON = 1e-6;
const attribute = (source, name) => source.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];

export function parseGlyphSvg(text) {
  const rootAttributes = text.match(/<svg\b([^>]*)>/i)?.[1] ?? '';
  return {
    viewBox: attribute(rootAttributes, 'viewBox'),
    width: attribute(rootAttributes, 'width'),
    height: attribute(rootAttributes, 'height'),
    elements: [...text.matchAll(/<([a-zA-Z][\w:-]*)\b/g)].map((match) => match[1].toLowerCase()),
    paths: [...text.matchAll(/<path\b([^>]*)\/?>/gi)].map((match) => ({
      d: attribute(match[1], 'd') ?? '',
      fill: attribute(match[1], 'fill'),
      fillRule: attribute(match[1], 'fill-rule'),
    })),
  };
}

// Flattens path data into closed polygons (arcs become cubics, cubics are sampled).
export function subpaths(d) {
  const data = new SVGPathData(d).toAbs().normalizeHVZ().normalizeST().qtToC().aToC();
  const polygons = [];
  let current = null;
  let pen = [0, 0];
  for (const command of data.commands) {
    if (command.type === SVGPathData.MOVE_TO) {
      current = [[command.x, command.y]];
      polygons.push(current);
    } else if (command.type === SVGPathData.LINE_TO) {
      current.push([command.x, command.y]);
    } else if (command.type === SVGPathData.CURVE_TO) {
      const [x0, y0] = pen;
      for (let step = 1; step <= CURVE_STEPS; step += 1) {
        const t = step / CURVE_STEPS;
        const u = 1 - t;
        current.push([
          u * u * u * x0 + 3 * u * u * t * command.x1 + 3 * u * t * t * command.x2 + t * t * t * command.x,
          u * u * u * y0 + 3 * u * u * t * command.y1 + 3 * u * t * t * command.y2 + t * t * t * command.y,
        ]);
      }
    }
    if ('x' in command && 'y' in command) pen = [command.x, command.y];
  }
  return polygons
    .map((points) => {
      const [first] = points;
      const last = points.at(-1);
      return Math.abs(first[0] - last[0]) < EPSILON && Math.abs(first[1] - last[1]) < EPSILON ? points.slice(0, -1) : points;
    })
    .filter((points) => points.length >= 3);
}

// Positive = clockwise on screen, because SVG y grows downward.
export function signedArea(polygon) {
  let sum = 0;
  for (let index = 0; index < polygon.length; index += 1) {
    const [x1, y1] = polygon[index];
    const [x2, y2] = polygon[(index + 1) % polygon.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

const pointToSegment = ([px, py], [[ax, ay], [bx, by]]) => {
  const [dx, dy] = [bx - ax, by - ay];
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const orientation = (o, a, b) => Math.sign((a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]));
// True when two segments cross or touch. Collinear touching is caught by outlineGap's endpoint distances, which are 0.
const segmentsCross = ([p, q], [r, s]) => orientation(p, q, r) * orientation(p, q, s) < 0 && orientation(r, s, p) * orientation(r, s, q) < 0;
const segmentsOf = (polygons) => polygons.flatMap((poly) => poly.map((point, index) => [point, poly[(index + 1) % poly.length]]));
// Positive winding at a point: inside the polygons' ink. Measured against a hole alone (winding -1), nothing is ink.
const inked = (polygons, point) => polygons.reduce((sum, poly) => sum + (pointInPolygon(point, poly) ? Math.sign(signedArea(poly)) : 0), 0) > 0;
// A solid outline of p (clockwise) with a vertex inside q's ink overlaps q.
const overlaps = (p, q) => p.some((poly) => signedArea(poly) > 0 && poly.some((point) => inked(q, point)));

// Shortest distance between two sets of outlines (polygons from subpaths): 0 where an edge of one crosses or touches an
// edge of the other, or where a solid outline of one lies inside the other's ink; else the smallest endpoint-to-segment
// distance either way. For nested outlines (a cut-out inside a fill, an accent inside a frame's hole) this is the wall
// between them. Section 4's clearances are measured with it. Measure against an outline before knockOut: the pieces
// knockOut returns abut along the cut, so a point on that seam measures 0.
export function outlineGap(a, b) {
  if (!a.length || !b.length) throw new Error('outlineGap: an empty set of outlines has no distance (a filtered set that matched nothing would pass any clearance check)');
  const [edgesA, edgesB] = [segmentsOf(a), segmentsOf(b)];
  if (edgesA.some((edge) => edgesB.some((other) => segmentsCross(edge, other)))) return 0;
  if (overlaps(a, b) || overlaps(b, a)) return 0;
  // A loop, not Math.min(...): spreading every distance into one call overflowed the stack once two outlines held a few
  // hundred flattened points each (the owl file icon's four rings measured together).
  let gap = Infinity;
  for (const [from, to] of [[edgesA, edgesB], [edgesB, edgesA]]) {
    for (const [p, q] of from) for (const edge of to) gap = Math.min(gap, pointToSegment(p, edge), pointToSegment(q, edge));
  }
  return gap;
}

export function pointInPolygon([x, y], polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Nonzero fill test at one point, the rule svgicons2svgfont and svg2ttf apply (curves flattened as in subpaths). Exact for
// simple (non-self-intersecting) subpaths, which is all the primitives produce.
export function filledAt(ds, point) {
  let winding = 0;
  for (const polygon of ds.flatMap((d) => subpaths(d))) if (pointInPolygon(point, polygon)) winding += Math.sign(signedArea(polygon));
  return winding !== 0;
}

const containedIn = (inner, outer) => Math.abs(signedArea(inner)) < Math.abs(signedArea(outer))
  && inner.every((point) => pointInPolygon(point, outer));
const centroid = (polygon) => polygon.reduce(([sx, sy], [x, y]) => [sx + x / polygon.length, sy + y / polygon.length], [0, 0]);

// Spec section 4/8: every inner subpath is wound opposite to its immediate container,
// because svgicons2svgfont and svg2ttf ignore fill-rule and fill with nonzero winding.
export function windingProblems(ds) {
  const polygons = ds.flatMap((d) => subpaths(d));
  const problems = [];
  polygons.forEach((inner, index) => {
    const containers = polygons.filter((outer, other) => other !== index && containedIn(inner, outer));
    if (!containers.length) return;
    const parent = containers.reduce((best, next) => (Math.abs(signedArea(next)) < Math.abs(signedArea(best)) ? next : best));
    if (Math.sign(signedArea(inner)) === Math.sign(signedArea(parent))) {
      const [cx, cy] = centroid(inner).map((value) => Number(value.toFixed(2)));
      problems.push(`subpath around (${cx}, ${cy}) is wound the same way as its container, so it renders solid`);
    }
  });
  return problems;
}

export function pathBounds(ds) {
  const { minX, maxX, minY, maxY } = new SVGPathData(ds.join(' ')).getBounds();
  return { minX, maxX, minY, maxY };
}

const onHalfGrid = (value) => Math.abs(value * 2 - Math.round(value * 2)) < 1e-3;

// End points of straight segments that are neither whole nor .5 (soft warning in section 8). A zero-length segment
// is skipped: normalizeHVZ turns the Z of a curve-only subpath (a crescent) into a line onto its own start point.
export function offGridPoints(d) {
  const data = new SVGPathData(d).toAbs().normalizeHVZ();
  const points = [];
  let pen = null;
  for (const command of data.commands) {
    const zeroLength = pen && Math.abs(command.x - pen[0]) < EPSILON && Math.abs(command.y - pen[1]) < EPSILON;
    if (command.type === SVGPathData.LINE_TO && pen && !zeroLength) {
      for (const point of [pen, [command.x, command.y]]) if (!onHalfGrid(point[0]) || !onHalfGrid(point[1])) points.push(point);
    }
    if ('x' in command && 'y' in command) pen = [command.x, command.y];
  }
  return points;
}
