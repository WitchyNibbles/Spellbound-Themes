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

export function pointInPolygon([x, y], polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
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

// End points of straight segments that are neither whole nor .5 (soft warning in section 8).
export function offGridPoints(d) {
  const data = new SVGPathData(d).toAbs().normalizeHVZ();
  const points = [];
  let pen = null;
  for (const command of data.commands) {
    if (command.type === SVGPathData.LINE_TO && pen) {
      for (const point of [pen, [command.x, command.y]]) if (!onHalfGrid(point[0]) || !onHalfGrid(point[1])) points.push(point);
    }
    if ('x' in command && 'y' in command) pen = [command.x, command.y];
  }
  return points;
}
