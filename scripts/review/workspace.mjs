// The review fixture a gate job opens. A job may name a folder of review/ ("workspace"; gate 5: review/workspace-files,
// the file-icon fixture); without it, the gate 1-4 fixture review/workspace, which becomes a git repository in the
// gate-2 states.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const DEFAULT_WORKSPACE = 'review/workspace';

// With the repo root, the folder must also exist, so run-gate.mjs stops before it builds anything.
export function workspaceOf(job, root) {
  const workspace = job.workspace ?? DEFAULT_WORKSPACE;
  if (typeof workspace !== 'string' || !/^review\/[\w-][\w.-]*$/.test(workspace)) {
    throw new Error(`"workspace" must name a folder of review/, such as review/workspace-files; got ${JSON.stringify(workspace)}`);
  }
  if (root && !fs.statSync(path.join(root, workspace), { throwIfNoEntry: false })?.isDirectory()) throw new Error(`The job's workspace ${workspace} is not a folder`);
  return workspace;
}

// Copies the job's fixture to dest. Any fixture but the default one is copied as it is, with no repository, so the
// Explorer shows no git colours or badges over the file icons.
export function prepareWorkspace(root, job, dest) {
  const source = workspaceOf(job, root);
  fs.cpSync(path.join(root, source), dest, { recursive: true });
  if (source !== DEFAULT_WORKSPACE) return;
  const git = (...gitArgs) => execFileSync('git', ['-c', 'user.name=review', '-c', 'user.email=review@localhost', ...gitArgs], { cwd: dest, stdio: 'ignore' });
  git('init', '-q', '-b', 'moonlit-review');
  git('config', 'core.fileMode', 'false'); // Windows-side writes drop WSL mode bits; the terminal's git must not list them
  // Windows git checks files out as written (LF). With its default core.autocrlf true, a merge --abort wrote README.md back
  // with CRLF, the next scale's restore put LF back, and the stale index size made the next merge refuse to run.
  git('config', 'core.autocrlf', 'false');
  git('add', '-A');
  git('commit', '-q', '-m', 'review fixture');
  // Gate 2 git states: the git extension (Windows git) needs an identity to merge, a branch that conflicts with this one
  // on README.md (git-branch-conflicts, spellboundReview.scm), and an upstream, so the status bar shows sync, not Publish.
  git('config', 'user.name', 'review');
  git('config', 'user.email', 'review@localhost');
  const readmePath = path.join(dest, 'README.md');
  const readme = fs.readFileSync(readmePath, 'utf8');
  git('checkout', '-q', '-b', 'rival-brew');
  fs.writeFileSync(readmePath, readme.replace('This folder is a fixture', 'This folder is a rival fixture'));
  git('commit', '-q', '-am', 'rival brew');
  git('checkout', '-q', 'moonlit-review');
  fs.writeFileSync(readmePath, readme.replace('This folder is a fixture', 'This folder is a moonlit fixture'));
  git('commit', '-q', '-am', 'moonlit brew');
  git('init', '-q', '--bare', '../origin.git'); // a relative URL, so WSL git and Windows git both resolve it
  git('remote', 'add', 'origin', '../origin.git');
  git('push', '-q', '-u', 'origin', 'moonlit-review');
  const spellsPath = path.join(dest, 'spells.ts');
  fs.writeFileSync(spellsPath, fs.readFileSync(spellsPath, 'utf8').replace('// Review fixture:', '// Review fixture, stirred:')); // diff-remove + diff-insert
  fs.appendFileSync(spellsPath, '\n// stirred during review\n'); // modified -> amber
  fs.writeFileSync(path.join(dest, 'new-spell.ts'), 'export const fresh = true;\n'); // untracked -> mint
}
