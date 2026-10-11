// Folder drawings with a badge (spec 6, 6.2): the folder construction of parts.mjs with the badge box knocked out,
// plus one solid badge in the category of the folder's contents, painted last.
import { rect } from '../glyphs/primitives.mjs';
import { fileIconDocument, folderBody, painted } from './parts.mjs';

export const drawings = {};

// src, source: a grimoire, one bold silhouette (spec 6: a badge is one solid shape with one feature). A closed book
// standing upright, 6x7 at x9-15, y8-15, flush with the folder's right edge in the 7x7 BADGE_BOX (the free column x8-9
// leaves 2 units to the bottom wall's cut end at x7; the box's top row keeps the 1-unit knockout to the right wall's at
// y7). The spine is the 1-unit column x9-10, set off by a straight slot x10-11, y9-14 (a 1x5 hole, section 4's straight-
// slot exception), so the book reads as a bound volume and not as a plain tile.
const grimoire = () => painted('code', rect(9, 8, 6, 7), rect(10, 9, 1, 5, 'ccw'));

drawings['folder-src'] = () => fileIconDocument(folderBody({ badge: true }), grimoire());
drawings['folder-src-open'] = () => fileIconDocument(folderBody({ open: true, badge: true }), grimoire());
