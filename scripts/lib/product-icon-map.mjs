export const PRODUCT_FONT = Object.freeze({
  id: 'witchynibbles-product-icons',
  family: 'WitchyNibbles Product Icons',
  file: 'icons/witchynibbles-product-icons.woff',
  themeSrc: './witchynibbles-product-icons.woff',
});

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Spec section 5.1: one SVG and one codepoint per drawing, many IDs per codepoint.
export function validateMap(map, { sourceFiles }) {
  const errors = [];
  if (map?.fontId !== PRODUCT_FONT.id) errors.push(`product-icon-map.json fontId must be ${PRODUCT_FONT.id}`);
  if (map?.fontFamily !== PRODUCT_FONT.family) errors.push(`product-icon-map.json fontFamily must be ${PRODUCT_FONT.family}`);
  if (!map?.drawings || typeof map.drawings !== 'object' || Array.isArray(map.drawings)) {
    errors.push('product-icon-map.json must have a "drawings" object (drawing-based format, spec section 5.1)');
    return errors;
  }
  const retired = new Set(map.retiredCodepoints ?? []);
  const codepoints = new Map();
  const owners = new Map();
  for (const [name, drawing] of Object.entries(map.drawings)) {
    if (!KEBAB.test(name)) errors.push(`Invalid drawing name: ${name}`);
    const codepoint = drawing?.codepoint ?? '';
    if (!/^E[0-9A-F]{3}$/.test(codepoint)) errors.push(`${name} has invalid codepoint ${codepoint}`);
    else if (codepoints.has(codepoint)) errors.push(`${name} reuses codepoint ${codepoint} of ${codepoints.get(codepoint)}`);
    else if (retired.has(codepoint)) errors.push(`${name} uses retired codepoint ${codepoint}`);
    else codepoints.set(codepoint, name);
    if (!Array.isArray(drawing?.ids) || !drawing.ids.length) errors.push(`${name} must list at least one icon ID`);
    for (const id of drawing?.ids ?? []) {
      if (!KEBAB.test(id)) errors.push(`${name} lists invalid icon ID ${id}`);
      else if (owners.has(id)) errors.push(`${id} is listed by both ${owners.get(id)} and ${name}`);
      else owners.set(id, name);
    }
    if (!sourceFiles.includes(`${name}.svg`)) errors.push(`Missing SVG source icons/product-src/${name}.svg`);
  }
  for (const file of sourceFiles) {
    if (!(file.replace(/\.svg$/, '') in map.drawings)) errors.push(`icons/product-src/${file} belongs to no drawing`);
  }
  return errors;
}

export function iconDefinitionsFor(map) {
  const entries = Object.values(map.drawings).flatMap(({ codepoint, ids }) =>
    ids.map((id) => [id, { fontCharacter: `\\${codepoint}`, fontId: PRODUCT_FONT.id }]));
  return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));
}

// Maps `ids` to drawing `name` (creating or replacing it), taking them away from any other drawing.
// `removed` lists the drawings left with no IDs; they are dropped and their codepoints retired.
export function claimDrawing(map, { name, codepoint, ids }) {
  const retired = new Set(map.retiredCodepoints ?? []);
  const drawings = {};
  const removed = [];
  for (const [other, drawing] of Object.entries(map.drawings)) {
    if (other === name) continue;
    const remaining = drawing.ids.filter((id) => !ids.includes(id));
    if (remaining.length) drawings[other] = { ...drawing, ids: remaining };
    else { removed.push(other); retired.add(drawing.codepoint); }
  }
  const previous = map.drawings[name];
  if (previous && previous.codepoint !== codepoint) retired.add(previous.codepoint);
  drawings[name] = { codepoint, ids: [...ids] };
  return { map: { ...map, retiredCodepoints: [...retired].sort(), drawings }, removed };
}

// Removes every drawing marked `legacy` (the 1.2.1 sources kept from Task 10 to Task 16) and retires its codepoint.
export function dropLegacy(map) {
  const retired = new Set(map.retiredCodepoints ?? []);
  const drawings = {};
  const removed = [];
  for (const [name, drawing] of Object.entries(map.drawings)) {
    if (drawing.legacy) { removed.push(name); retired.add(drawing.codepoint); } else drawings[name] = drawing;
  }
  return { map: { ...map, retiredCodepoints: [...retired].sort(), drawings }, removed };
}
