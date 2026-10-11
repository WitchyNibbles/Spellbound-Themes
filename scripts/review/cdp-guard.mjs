// Keeps the capture harness to the VS Code it started (final review I3). capture.mjs drives a page through the Chrome
// DevTools port and closes the browser behind it; whatever else answers that port (a second gate run, a review instance
// left over from a crashed run, any Chromium or Electron app started with the same port) must never be driven or
// closed. Node built-ins only: run-gate copies this file next to capture.mjs into a Windows temp folder.
import net from 'node:net';

// True when something accepts a connection on the port. No answer either way within the timeout counts as in use, so an
// unclear port fails closed.
export function portInUse(port, { host = '127.0.0.1', timeout = 2000 } = {}) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    const settle = (inUse) => { socket.destroy(); resolve(inUse); };
    socket.setTimeout(timeout, () => settle(true));
    socket.once('connect', () => settle(true));
    socket.once('error', (error) => settle(error.code !== 'ECONNREFUSED'));
  });
}

// Before the launch: a port that already answers belongs to something the harness did not start.
export async function assertPortFree(port, options) {
  if (await portInUse(port, options)) {
    throw new Error(`port ${port} is already in use (another review instance, or any app with a debugging port there); refusing to launch VS Code, so the harness never drives or closes a window it did not start`);
  }
}

// After the launch: the browser behind the port must be the process the harness spawned. `send` is a CDP call on the
// browser target (SystemInfo.getProcessInfo lists the browser process with its PID). Anything else, or no answer, fails.
export async function assertOwnBrowser(send, pid) {
  let browsers;
  try {
    const { processInfo } = await send('SystemInfo.getProcessInfo');
    browsers = (processInfo ?? []).filter((info) => info.type === 'browser');
  } catch (error) {
    throw new Error(`cannot tell whose browser answers the debugging port (${error.message}); refusing to drive or close it`);
  }
  if (browsers.length !== 1) throw new Error(`cannot tell whose browser answers the debugging port (${browsers.length} browser processes listed); refusing to drive or close it`);
  if (browsers[0].id !== pid) throw new Error(`the debugging port belongs to browser process ${browsers[0].id}, not the VS Code the harness started (PID ${pid}); refusing to drive or close it`);
}
