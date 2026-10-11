// The reference a 16px render is judged against (spec 6.2): each pixel's area coverage, estimated with ss x ss samples
// per pixel (32x by default), filled with nonzero winding (the SVG default and the font pipeline's rule). Chromium's own
// anti-aliasing of a 16px fill is not the truth (gate-4 lesson), so drawings are judged against this.
import { subpaths } from './svg-geometry.mjs';

// ds: path data strings in the 16-unit viewBox. Returns px * px coverages (row-major, 0..1).
export function coverage(ds, px, ss = 32) {
  const edges = ds.flatMap((d) => subpaths(d)).flatMap((poly) => poly.map((point, index) => [point, poly[(index + 1) % poly.length]]));
  const samples = px * ss;
  const unit = 16 / samples;
  const hits = new Float64Array(px * px);
  for (let row = 0; row < samples; row += 1) {
    const y = (row + 0.5) * unit;
    const crossings = edges
      .filter(([[, y1], [, y2]]) => (y1 <= y && y < y2) || (y2 <= y && y < y1))
      .map(([[x1, y1], [x2, y2]]) => [x1 + ((y - y1) * (x2 - x1)) / (y2 - y1), y2 > y1 ? 1 : -1])
      .sort((a, b) => a[0] - b[0]);
    const base = Math.floor(row / ss) * px;
    let winding = 0;
    let next = 0;
    for (let column = 0; column < samples; column += 1) {
      const x = (column + 0.5) * unit;
      while (next < crossings.length && crossings[next][0] <= x) winding += crossings[next++][1];
      if (winding !== 0) hits[base + Math.floor(column / ss)] += 1;
    }
  }
  return Array.from(hits, (count) => count / (ss * ss));
}
