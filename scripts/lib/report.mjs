import fs from 'node:fs';
import path from 'node:path';

export function loadStageConfig(root) {
  const file = path.join(root, 'scripts', 'validation-stage.json');
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(config.enforce)) throw new Error(`${file} must list stages in "enforce"`);
  return { enforce: config.enforce };
}

export function parseArgs(argv) {
  const options = { release: false, verbose: false, only: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--release') options.release = true;
    else if (arg === '--verbose') options.verbose = true;
    else if (arg === '--only') {
      options.only = String(argv[++index] ?? '').split(',').map((stage) => stage.trim()).filter(Boolean);
      if (!options.only.length) throw new Error('--only needs at least one stage, for example --only color-themes');
    } else throw new Error(`Unknown option: ${arg}`);
  }
  return options;
}

// A stage no check uses would enforce nothing, and the run would still pass (final review M6).
export function checkOnlyStages(only, known) {
  for (const stage of only) {
    if (!known.includes(stage)) throw new Error(`Unknown stage '${stage}' for --only (stages: ${known.join(', ')})`);
  }
}

export function isEnforced(stage, { enforce = [], release = false, only = null }) {
  if (only) return only.includes(stage);
  return release || enforce.includes(stage);
}

export function createReport(options) {
  const problems = [];
  const warnings = [];
  return {
    fail(stage, message) { problems.push({ stage, message }); },
    warn(message) { warnings.push(message); },
    result() {
      const errors = problems.filter((problem) => isEnforced(problem.stage, options));
      const pending = options.only ? [] : problems.filter((problem) => !isEnforced(problem.stage, options));
      return { errors, pending, warnings: [...warnings] };
    },
  };
}

export function formatResult({ errors, pending, warnings }, { verbose = false, enforced = [] } = {}) {
  const lines = errors.map(({ stage, message }) => `✗ [${stage}] ${message}`);
  if (pending.length) {
    const counts = Object.entries(Object.groupBy(pending, (problem) => problem.stage))
      .map(([stage, items]) => `${stage} (${items.length})`);
    lines.push(`… ${pending.length} pending problems in stages not yet enforced: ${counts.join(', ')}${verbose ? '' : ' (use --verbose to list)'}`);
    if (verbose) lines.push(...pending.map(({ stage, message }) => `  · [${stage}] ${message}`));
  }
  lines.push(...warnings.map((warning) => `⚠ ${warning}`));
  if (!errors.length) lines.push(`✓ WitchyNibbles package validation passed (enforced: ${enforced.join(', ')})`);
  return lines.join('\n');
}
