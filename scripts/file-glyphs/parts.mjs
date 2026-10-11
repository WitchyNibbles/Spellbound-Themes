// File-icon parts (spec 6.1, 6.2). A drawing is a list of painted parts, each one <path> filled with a role token
// (`{muted}`, `{code}` …) that the build resolves per set. Paint order is list order, so an accent comes last.
// Section-4 shapes come from scripts/glyphs/primitives.mjs; this module never copies them.
import { ROLES } from '../lib/file-icon-palette.mjs';
import { polygon } from '../glyphs/primitives.mjs';

export const painted = (role, ...ds) => ({ role, d: ds.flat(Infinity).join('') });

export function fileIconDocument(...parts) {
  const list = parts.flat(Infinity);
  if (!list.length) throw new Error('A file-icon document needs at least one painted part');
  const paths = list.map(({ role, d }) => {
    if (!ROLES.includes(role)) throw new Error(`Unknown file-icon role ${role}`);
    if (!d) throw new Error(`The ${role} part has no path data`);
    return `<path fill="{${role}}" d="${d}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${paths.join('')}</svg>\n`;
}

// ---- Folder construction (spec 6, 6.2) ----
// Folder badges sit in this 7x7 box in the lower right; the folder outline is knocked out 1 unit around it.
export const BADGE_BOX = Object.freeze({ x: 8, y: 8, w: 7, h: 7 });

// The folder is the product symbol-folder glyph (scripts/glyphs/editor.mjs) split into two muted parts, so a tree
// shows the same folder with or without this file icon theme: x1-15, y2-14 (the 14x12 landscape keyline), 1-unit walls,
// r1 outer corners. The tab, x1-8 and y2-6 with 45-degree shoulders, is the filled part (spec 6: the default folder's
// tab is filled) and is painted last; the body meets it only along x = 8 and y = 6, whole numbers, so the two parts
// leave no anti-aliased seam. The open folder keeps the tab and the back (top wall, right wall to y8) and adds the front
// flap: a parallelogram x1-15, y8-14 whose sides run at 2:1 and are 1.5 units across horizontally (1.34 across the
// stroke, section 4's diagonal weight). Where the flap's left side meets the back's left wall the gap narrows under 1
// unit, so the wedge below y10 is filled. `badge: true` cuts the walls back 1 unit short of BADGE_BOX (x >= 7, y >= 7);
// the cut ends are drawn, not clipped, so the corner arcs stay arcs.
const TAB = 'M1 3A1 1 0 0 1 2 2H6L8 4V5L7 6H1Z';
const BODY = {
  closed: ['M8 4H14A1 1 0 0 1 15 5V13A1 1 0 0 1 14 14H2A1 1 0 0 1 1 13V6H2V13H14V5H8Z'],
  closedBadge: ['M8 4H14A1 1 0 0 1 15 5V7H14V5H8Z', 'M1 6H2V13H7V14H2A1 1 0 0 1 1 13Z'],
  open: ['M8 4H13A1 1 0 0 1 14 5V8H13V5H8Z', 'M1 6H2V10H3L4 8H15L12 14H2A1 1 0 0 1 1 13Z', polygon([[5, 9], [13, 9], [11, 13], [3, 13]], 'ccw')],
  openBadge: ['M8 4H13A1 1 0 0 1 14 5V7H13V5H8Z', 'M1 6H2V10H3L4 8H7V9H5L3 13H7V14H2A1 1 0 0 1 1 13Z'],
};

export function folderBody({ open = false, badge = false } = {}) {
  const body = BODY[`${open ? 'open' : 'closed'}${badge ? 'Badge' : ''}`];
  return [painted('muted', body), painted('muted', TAB)];
}
