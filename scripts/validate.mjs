import fs from 'node:fs';
import path from 'node:path';
import { checkOnlyStages, createReport, formatResult, loadStageConfig, parseArgs } from './lib/report.mjs';
import { checkPackage, checkReleaseMetadata } from './lib/checks/package.mjs';
import { checkFileIconTheme } from './lib/checks/file-icons.mjs';
import { checkFileIconPipeline, checkSelectionContrast } from './lib/checks/file-icon-pipeline.mjs';
import { readFileIconInputs } from './lib/file-icons-build.mjs';
import { PINNED_THEME_NAMES, checkThemeContributions, checkThemeFile } from './lib/checks/color-themes.mjs';
import { checkBuildFlags, checkFontGeometry, checkGlyphSources, checkPinnedCoverage, checkProductIconContribution, checkProductIconMap } from './lib/checks/product-icons.mjs';
import { PRODUCT_FONT } from './lib/product-icon-map.mjs';

const root = path.resolve(import.meta.dirname, '..');
let options;
try {
  const stages = loadStageConfig(root);
  options = { ...stages, ...parseArgs(process.argv.slice(2)) };
  // The stage file lists every stage a check uses (each phase appends its stage when its work lands).
  if (options.only) checkOnlyStages(options.only, stages.enforce);
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(2);
}
const report = createReport(options);
const exists = (relative) => fs.existsSync(path.join(root, relative));
const readFile = (relative) => fs.readFileSync(path.join(root, relative));
const readText = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const readJson = (relative) => JSON.parse(readText(relative));
const packageJson = readJson('package.json');

checkPackage({ packageJson, exists, readFile }, report);
checkThemeContributions(packageJson, report);
const scheme = readJson('src/witchyterm-moonlit-candle.scheme.json');
const themeNames = [];
for (const file of fs.readdirSync(path.join(root, 'themes')).filter((name) => name.endsWith('.json')).sort()) {
  const relative = path.join('themes', file);
  let theme;
  try {
    theme = readJson(relative);
  } catch (error) {
    report.fail('base', `${relative} is invalid JSON: ${error.message}`);
    continue;
  }
  checkThemeFile({ relative, theme, scheme }, report);
  themeNames.push(theme.name);
}
for (const name of PINNED_THEME_NAMES) {
  if (!themeNames.includes(name)) report.fail('color-themes', `Missing pinned theme: ${name}`);
}
const productTheme = checkProductIconContribution({ packageJson, readJson, readFile, exists }, report);
const sourceDir = path.join(root, 'icons', 'product-src');
const sourceFiles = fs.existsSync(sourceDir) ? fs.readdirSync(sourceDir).filter((file) => file.endsWith('.svg')).sort() : [];
const svgs = Object.fromEntries(sourceFiles.map((file) => [file, readText(path.join('icons', 'product-src', file))]));
const productMap = readJson('icons/product-icon-map.json');
checkPinnedCoverage({ pinned: readJson('icons/product-icon-ids.json'), theme: productTheme }, report);
checkGlyphSources({ svgs }, report);
const buildSources = ['scripts/build-product-icons.mjs', 'scripts/lib/product-font.mjs', 'scripts/lib/product-icons-build.mjs'].filter(exists);
checkBuildFlags({ sources: Object.fromEntries(buildSources.map((file) => [file, readText(file)])) }, report);
if (checkProductIconMap({ map: productMap, sourceFiles, theme: productTheme }, report) && exists(PRODUCT_FONT.file)) {
  const byDrawing = Object.fromEntries(Object.keys(productMap.drawings).map((name) => [name, svgs[`${name}.svg`]]));
  checkFontGeometry({ woff: readFile(PRODUCT_FONT.file), map: productMap, svgs: byDrawing }, report);
}

checkReleaseMetadata(packageJson, report);
for (const contribution of packageJson.contributes?.iconThemes ?? []) {
  const themePath = contribution.path.replace(/^\.\//, '');
  if (!exists(themePath)) continue;
  const themeDir = path.dirname(path.join(root, themePath));
  const readSvg = (iconPath) => {
    const file = path.join(themeDir, iconPath);
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  };
  checkFileIconTheme({ theme: readJson(themePath), readSvg }, report);
}

// Spec 6.1 and 8 (F3, F9): the file-icon pipeline, enforced from gate 5; full key coverage stays in `file-icons` above.
const fileIconTheme = exists('icons/file-icon-theme.json') ? readJson('icons/file-icon-theme.json') : {};
const builtDir = path.join(root, 'icons', 'file-icons');
const builtFiles = fs.existsSync(builtDir)
  ? fs.readdirSync(builtDir, { recursive: true }).filter((file) => file.endsWith('.svg')).map((file) => `icons/file-icons/${file.split(path.sep).join('/')}`)
  : [];
const built = Object.fromEntries(builtFiles.map((file) => [file, readText(file)]));
checkFileIconPipeline({ ...readFileIconInputs(root), theme: fileIconTheme, built }, report);
const colorThemes = (packageJson.contributes?.themes ?? []).filter((contribution) => exists(contribution.path))
  .map(({ label, uiTheme, path: themePath }) => ({ label, uiTheme, colors: readJson(themePath).colors ?? {} }));
checkSelectionContrast({ built, colorThemes }, report);

const result = report.result();
const enforced = options.only ?? (options.release ? ['every stage'] : options.enforce);
console[result.errors.length ? 'error' : 'log'](formatResult(result, { verbose: options.verbose, enforced }));
if (result.errors.length) process.exitCode = 1;
