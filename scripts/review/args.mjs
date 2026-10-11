// Arguments of run-gate.mjs. Parsed before anything is built or launched, so a typo stops the run instead of starting
// a full gate run with the default job.
import { parseArgs } from 'node:util';

export const USAGE = `Usage: node scripts/review/run-gate.mjs [--job <file>] [--skip-variants] [--scales <list>] [--scenes <list>]
  --job <file>       gate job (default review/jobs/gate-1.json)
  --skip-variants    capture only the main pass
  --scales <list>    dry run: only these scales, for example --scales=1 or --scales=1,2
  --scenes <list>    dry run: only these scenes, in job order, for example --scenes=terminal,icon-sheet
  --help             print this text`;

const list = (option, value) => {
  if (value === undefined) return null;
  const items = value.split(',').map((item) => item.trim()).filter(Boolean);
  if (!items.length) throw new Error(`--${option} needs at least one value`);
  return items;
};

export function parseGateArgs(argv) {
  const { values } = parseArgs({
    args: argv,
    strict: true,
    allowPositionals: false,
    options: {
      job: { type: 'string', default: 'review/jobs/gate-1.json' },
      'skip-variants': { type: 'boolean', default: false },
      scales: { type: 'string' },
      scenes: { type: 'string' },
      help: { type: 'boolean', default: false },
    },
  });
  const scales = list('scales', values.scales)?.map((item) => {
    const scale = Number(item);
    if (!(scale > 0)) throw new Error(`--scales takes numbers such as 1,1.25; got '${item}'`);
    return scale;
  }) ?? null;
  return { job: values.job, skipVariants: values['skip-variants'], help: values.help, scales, scenes: list('scenes', values.scenes) };
}

// Cuts a gate job down for a dry run. Scene order and each scene's steps stay as in the job file. With skipVariants
// (--skip-variants, or no variant drawing to stage) the variants pass is dropped first, so the checks below see only
// the passes that will run.
export function filterJob(job, { scales, scenes, skipVariants = false }) {
  const known = job.scenes.map((scene) => scene.name);
  for (const scene of scenes ?? []) if (!known.includes(scene)) throw new Error(`Unknown scene '${scene}' (the job has ${known.join(', ')})`);
  const passes = job.passes.filter((pass) => !(skipVariants && pass.name === 'variants')).map((pass) => {
    const cut = { ...pass };
    if (scales) cut.scales = pass.scales.filter((scale) => scales.includes(scale));
    if (scenes) cut.scenes = (pass.scenes ?? known).filter((scene) => scenes.includes(scene));
    return cut;
  }).filter((pass) => pass.scales.length && (!pass.scenes || pass.scenes.length));
  for (const scale of scales ?? []) {
    if (!passes.some((pass) => pass.scales.includes(scale))) throw new Error(`No pass captures at scale ${scale}`);
  }
  // A scene left out of every pass's own scenes list would otherwise leave a job with no pass, captured silently.
  for (const scene of scenes ?? []) {
    if (!passes.some((pass) => (pass.scenes ?? known).includes(scene))) throw new Error(`No pass captures scene '${scene}'`);
  }
  return { ...job, passes };
}
