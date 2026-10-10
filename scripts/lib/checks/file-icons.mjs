import { contrast, hexes } from '../../../src/color.mjs';
import { REQUIRED_FILE_EXTENSIONS, REQUIRED_FILE_NAMES, REQUIRED_FOLDER_NAMES, SIDEBARS } from '../file-icon-requirements.mjs';

const STAGE = 'file-icons';
const REQUIRED_KEYS = Object.entries({
  fileExtensions: REQUIRED_FILE_EXTENSIONS,
  fileNames: REQUIRED_FILE_NAMES,
  folderNames: REQUIRED_FOLDER_NAMES,
  folderNamesExpanded: REQUIRED_FOLDER_NAMES,
});
const lowerKeys = (object) => new Set(Object.keys(object ?? {}).map((key) => key.toLowerCase()));

export function checkFileIconTheme({ theme, readSvg }, report) {
  const fail = (message) => report.fail(STAGE, message);
  if (theme.showLanguageModeIcons !== false) fail('file-icon-theme.json must set "showLanguageModeIcons": false');
  const sets = { dark: theme, light: theme.light, highContrast: theme.highContrast };
  for (const [setName, set] of Object.entries(sets)) {
    if (!set) { fail(`file-icon-theme.json has no "${setName}" set`); continue; }
    for (const key of ['file', 'folder', 'folderExpanded']) if (!set[key]) fail(`${setName} set has no "${key}" icon`);
    for (const [property, required] of REQUIRED_KEYS) {
      const present = lowerKeys(set[property]);
      const missing = required.filter((key) => !present.has(key));
      if (missing.length) fail(`${setName} set is missing ${property}: ${missing.join(', ')}`);
    }
    const mappedIds = REQUIRED_KEYS.flatMap(([property]) => Object.values(set[property] ?? {}));
    const iconIds = new Set([set.file, set.folder, set.folderExpanded, ...mappedIds].filter(Boolean));
    for (const iconId of iconIds) {
      const iconPath = theme.iconDefinitions?.[iconId]?.iconPath;
      if (!iconPath) { fail(`${setName} set references undefined icon ${iconId}`); continue; }
      const svg = readSvg(iconPath);
      if (svg == null) { fail(`${iconId} points to missing ${iconPath}`); continue; }
      for (const color of new Set(hexes(svg).map((hex) => hex.slice(0, 7).toUpperCase()))) {
        const ratio = contrast(color, SIDEBARS[setName]);
        if (ratio < 3) fail(`${setName} icon ${iconId} uses ${color} at ${ratio.toFixed(2)}:1 on ${SIDEBARS[setName]} (needs 3:1)`);
      }
    }
  }
}
