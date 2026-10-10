#!/usr/bin/env node
// Diffs the icon registrations in a local VS Code workbench bundle against icons/product-icon-ids.json.
// Run by hand when the pin is refreshed (spec section 8); not part of npm run validate.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// The pinned 1.141 build in a per-user Windows install (%LOCALAPPDATA%\Programs\Microsoft VS Code), seen from WSL.
export const BUNDLE_IN_USER_DIR = 'AppData/Local/Programs/Microsoft VS Code/2a59476c9b/resources/app/out/vs/workbench/workbench.desktop.main.js';

// VSCODE_WORKBENCH_JS wins; otherwise the first Windows user directory that holds the pinned build, or null.
export function defaultBundle({ env = process.env, usersDir = '/mnt/c/Users' } = {}) {
  if (env.VSCODE_WORKBENCH_JS) return env.VSCODE_WORKBENCH_JS;
  const users = fs.existsSync(usersDir) ? fs.readdirSync(usersDir).sort() : [];
  return users.map((user) => path.join(usersDir, user, BUNDLE_IN_USER_DIR)).find((file) => fs.existsSync(file)) ?? null;
}

const escapeName = (name) => name.replace(/\$/g, '\\$');

export function extractRegistrations(source) {
  // Minified names change per build, so find the two functions from calls whose shape is known.
  const codiconFn = source.match(/([\w$]{1,6})\("tree-item-expanded","chevron-down"\)/)?.[1];
  const registerFn = source.match(/([\w$]{1,6})\("explorer-view-icon",/)?.[1];
  if (!codiconFn || !registerFn) throw new Error('Could not locate the codicon table or registerIcon in the bundle');

  const registrations = new Map();
  const camelToId = new Map();
  const codiconCall = new RegExp(`(?:([A-Za-z0-9]+):)?${escapeName(codiconFn)}\\("([a-z0-9-]+)",(?:"([a-z0-9-]+)"|[0-9.e]+)\\)`, 'g');
  for (const [, camel, id, aliasOf] of source.matchAll(codiconCall)) {
    if (camel) camelToId.set(camel, id);
    if (!registrations.has(id)) registrations.set(id, aliasOf ? { kind: 'alias', default: aliasOf } : { kind: 'codicon', default: null });
  }

  // Codicons register at startup before any workbench registerIcon call, so codicon entries win (inventory rule 5).
  const variableToId = new Map();
  const registerCall = new RegExp(`(?:([\\w$]+)=)?${escapeName(registerFn)}\\("([a-z0-9-]+)",([\\w$]+)(?:\\.([A-Za-z0-9]+))?`, 'g');
  for (const [, variable, id, objectOrVariable, property] of source.matchAll(registerCall)) {
    if (variable) variableToId.set(variable, id);
    if (registrations.has(id)) continue;
    const target = property ? (camelToId.get(property) ?? property) : (variableToId.get(objectOrVariable) ?? `?${objectOrVariable}`);
    registrations.set(id, { kind: 'registered', default: target });
  }
  return registrations;
}

export function diffPinned(pinned, registrations) {
  const missing = [];
  const changed = [];
  for (const [id, entry] of Object.entries(pinned.ids)) {
    const actual = registrations.get(id);
    if (!actual) { missing.push(id); continue; }
    if (actual.kind !== entry.kind || (actual.default ?? null) !== (entry.default ?? null)) {
      changed.push({ id, pinned: { kind: entry.kind, default: entry.default ?? null }, actual });
    }
  }
  const unpinned = [...registrations.keys()].filter((id) => !(id in pinned.ids));
  return { missing, changed, unpinned };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bundle = process.argv[2] ?? defaultBundle();
  if (!bundle) throw new Error('VS Code 1.141 bundle not found: pass its path or set VSCODE_WORKBENCH_JS');
  const pinnedPath = path.resolve(import.meta.dirname, '..', 'icons', 'product-icon-ids.json');
  const pinned = JSON.parse(fs.readFileSync(pinnedPath, 'utf8'));
  const { missing, changed, unpinned } = diffPinned(pinned, extractRegistrations(fs.readFileSync(bundle, 'utf8')));
  console.log(`Pinned list: VS Code ${pinned.vscode.version} (${Object.keys(pinned.ids).length} keys). Bundle: ${bundle}`);
  for (const id of missing) console.log(`✗ missing from the bundle: ${id}`);
  for (const { id, pinned: was, actual } of changed) console.log(`✗ ${id}: pinned ${was.kind} ${was.default}, bundle ${actual.kind} ${actual.default}`);
  console.log(`${unpinned.length} registered IDs are not pinned (extended tier and beyond).`);
  if (missing.length || changed.length) process.exitCode = 1;
  else console.log('✓ the pinned list matches the bundle');
}
