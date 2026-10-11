// The defaults (spec 6, 6.2): what every file and folder shows when no other entry matches. All muted.
import { polygon } from '../glyphs/primitives.mjs';
import { fileIconDocument, folderBody, painted } from './parts.mjs';

export const drawings = {};

// parchment (default `file`): the product symbol-file page split into two muted parts, so a file looks the same with or
// without this file icon theme. The sheet: x3-13, y1-15 (inside the 12x14 portrait keyline), 1-unit walls, r1 corners.
// The fold, painted last, is the accent (spec 6.2): solid x8-13, y1-6 under the 4-unit 45-degree edge (9,1)-(13,5),
// meeting the sheet only along x = 8 and y = 6, whole numbers, so the parts leave no anti-aliased seam.
drawings.parchment = () => fileIconDocument(
  painted('muted', 'M4 1H8V2H4V14H12V6H13V14A1 1 0 0 1 12 15H4A1 1 0 0 1 3 14V2A1 1 0 0 1 4 1Z'),
  painted('muted', polygon([[8, 1], [9, 1], [13, 5], [13, 6], [8, 6]])), // accent: the fold
);

// folder (default `folder`) and folder-open (default `folderExpanded`): the folder construction with no badge; the
// filled tab is the accent.
drawings.folder = () => fileIconDocument(folderBody());
drawings['folder-open'] = () => fileIconDocument(folderBody({ open: true }));
