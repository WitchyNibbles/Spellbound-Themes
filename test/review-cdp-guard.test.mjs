// Final review I3: the capture harness drove and closed whatever answered on the debugging port (a second gate run, a
// review instance left over from a crashed run, any Chromium or Electron app started with that port). It now refuses a
// port that is already in use before it launches, and drives or closes only the browser whose process is the VS Code it
// started. capture.mjs itself needs Windows VS Code, so its wiring is pinned by source; the guard runs here.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import { once } from 'node:events';
import path from 'node:path';
import { assertOwnBrowser, assertPortFree } from '../scripts/review/cdp-guard.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('assertPortFree refuses a port something already listens on, and passes once it is free', async () => {
  const server = net.createServer((socket) => socket.destroy()).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  try {
    await assert.rejects(assertPortFree(port), new RegExp(`port ${port} is already in use`));
  } finally {
    server.close();
    await once(server, 'close');
  }
  await assertPortFree(port);
});

test('assertOwnBrowser accepts only the browser process the harness started, and fails closed when it cannot tell', async () => {
  const processInfo = [{ type: 'renderer', id: 4300, cpuTime: 0 }, { type: 'browser', id: 4242, cpuTime: 0 }, { type: 'GPU', id: 4400, cpuTime: 0 }];
  const methods = [];
  const send = async (method) => { methods.push(method); return { processInfo }; };
  await assertOwnBrowser(send, 4242);
  assert.deepEqual(methods, ['SystemInfo.getProcessInfo']);
  await assert.rejects(assertOwnBrowser(send, 1111), /browser process 4242, not the VS Code the harness started \(PID 1111\)/);
  await assert.rejects(assertOwnBrowser(async () => ({ processInfo: [{ type: 'renderer', id: 4300 }] }), 4242), /cannot tell/);
  await assert.rejects(assertOwnBrowser(async () => ({}), 4242), /cannot tell/);
  await assert.rejects(assertOwnBrowser(async () => { throw new Error("SystemInfo.getProcessInfo: 'SystemInfo.getProcessInfo' wasn't found"); }, 4242), /cannot tell/);
});

test('capture.mjs checks the port before it launches and the browser PID before it drives anything, and closes only that browser', () => {
  const capture = read('scripts/review/capture.mjs');
  assert.match(capture, /^import \{ assertOwnBrowser, assertPortFree \} from '\.\/cdp-guard\.mjs';$/m);
  const launch = capture.slice(capture.indexOf('async function launch('), capture.indexOf('async function shutdown('));
  const portCheck = launch.indexOf('await assertPortFree(job.port);');
  const spawned = launch.indexOf('spawn(codeExe, args');
  const pidCheck = launch.indexOf('await assertOwnBrowser((method) => browser.send(method), child.pid);');
  const pageList = launch.indexOf('/json/list');
  assert.ok(portCheck > 0 && portCheck < spawned, 'the port is checked before VS Code is launched');
  assert.ok(pidCheck > spawned && pidCheck < pageList, 'the browser PID is checked before a page is chosen');
  assert.ok(launch.indexOf('Cdp.connect(target.webSocketDebuggerUrl)') > pageList, 'and before anything is driven');
  assert.match(launch, /return \{ child, cdp, browserUrl \};/);
  assert.match(launch, /catch \(error\) \{\n\s+killChild\(child\);\n\s+throw error;/, 'a failed launch closes its own VS Code, by PID');
  const shutdown = capture.slice(capture.indexOf('async function shutdown('), capture.indexOf('// Tooltips'));
  assert.match(shutdown, /async function shutdown\(\{ child, cdp, browserUrl \}\)/);
  assert.match(shutdown, /Cdp\.connect\(browserUrl\)/, 'Browser.close goes to the browser checked at launch');
  assert.doesNotMatch(shutdown, /json\/version/, 'never to whatever answers the port at the end');
  const killChild = capture.slice(capture.indexOf('function killChild('), capture.indexOf('async function launch('));
  assert.match(killChild, /execFileSync\('taskkill', \['\/PID', String\(child\.pid\), '\/T', '\/F'\]/);
});

test('cdp-guard.mjs imports only Node built-ins, and run-gate copies it next to capture.mjs', () => {
  const guard = read('scripts/review/cdp-guard.mjs');
  const specifiers = [...guard.matchAll(/^\s*import\s[^'"]*['"]([^'"]+)['"]/gm)].map((match) => match[1]);
  for (const specifier of specifiers) assert.match(specifier, /^node:/, specifier);
  assert.match(read('scripts/review/run-gate.mjs'), /for \(const script of \['capture\.mjs', 'cdp-guard\.mjs'\]\) fs\.copyFileSync\(path\.join\(root, 'scripts', 'review', script\), path\.join\(work, script\)\);/);
});
