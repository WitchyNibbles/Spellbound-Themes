// Named waits shared by the gate jobs. A step { "until": "<name>", ...options } becomes { "waitFor": "<expression>" }
// in the job.json that run-gate.mjs writes for capture.mjs, so a wait is written once and every job uses the same one.

// A quick input (quick open, Go to Symbol, a quick pick) with a focused result row inside its list. Gate 4 waited only
// for the widget to show, and Enter opens nothing until a row is focused (spec 6.3). With "file", the focused row must be
// that file: VS Code puts "<lower-case name>-name-file-icon" on the row's icon label, so no row text is read.
const quickInputRow = ({ file } = {}) => `(() => { const w = document.querySelector('.quick-input-widget');
  if (!w || w.style.display === 'none' || !w.getBoundingClientRect().height) return false;
  const list = w.querySelector('.quick-input-list .monaco-list'); const row = list?.querySelector('.monaco-list-row.focused');
  if (!row) return false; const box = list.getBoundingClientRect(); const r = row.getBoundingClientRect();
  return r.height > 0 && r.top >= box.top && r.bottom <= box.bottom${file
    ? ` && !!row.querySelector('.monaco-icon-label')?.classList.contains(${JSON.stringify(`${file.toLowerCase()}-name-file-icon`)})` : ''}; })()`;

export const WAITS = Object.freeze({ 'quick-input-row': quickInputRow });

export function resolveWaits(job) {
  const resolve = (step, where) => {
    if (step.file !== undefined && step.until === undefined) throw new Error(`${where}: file belongs to an until step`);
    if (step.until === undefined) return step;
    if (!Object.hasOwn(WAITS, step.until)) throw new Error(`${where}: unknown wait '${step.until}' (known: ${Object.keys(WAITS).join(', ')})`);
    if (step.waitFor !== undefined) throw new Error(`${where}: a step names a wait or gives waitFor, not both`);
    const { until, file, ...rest } = step;
    return { ...rest, waitFor: WAITS[until]({ file }) };
  };
  return {
    ...job,
    scenes: job.scenes.map((scene) => {
      const resolved = { ...scene };
      for (const phase of ['setup', 'teardown']) {
        if (scene[phase]) resolved[phase] = scene[phase].map((step, index) => resolve(step, `${scene.name} ${phase}[${index}]`));
      }
      return resolved;
    }),
  };
}
