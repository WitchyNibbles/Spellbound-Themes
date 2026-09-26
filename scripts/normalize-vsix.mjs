import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import yauzl from 'yauzl';
import yazl from 'yazl';

const openZip = promisify(yauzl.open);
const epoch = new Date('1980-01-01T00:00:00.000Z');
const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));
const inputPath = process.argv[2] ?? `${packageJson.name}-${packageJson.version}.vsix`;
const absoluteInput = path.resolve(inputPath);
const temporaryPath = `${absoluteInput}.normalizing-${process.pid}`;

async function readEntries() {
  const zip = await openZip(absoluteInput, { lazyEntries: true });
  const entries = [];
  await new Promise((resolve, reject) => {
    zip.on('error', reject);
    zip.on('end', resolve);
    zip.readEntry();
    zip.on('entry', (entry) => {
      if (/\/$/.test(entry.fileName)) {
        zip.readEntry();
        return;
      }
      zip.openReadStream(entry, (error, stream) => {
        if (error) return reject(error);
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => {
          entries.push({ name: entry.fileName, data: Buffer.concat(chunks) });
          zip.readEntry();
        });
      });
    });
  });
  return entries;
}

async function writeZip(entries) {
  const zip = new yazl.ZipFile();
  const output = fs.createWriteStream(temporaryPath, { mode: 0o644 });
  const finished = new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
    zip.outputStream.on('error', reject);
  });
  zip.outputStream.pipe(output);
  for (const entry of entries) {
    zip.addBuffer(entry.data, entry.name, { mtime: epoch, mode: 0o100644, compress: true });
  }
  zip.end();
  await finished;
}

try {
  const entries = await readEntries();
  await writeZip(entries);
  fs.renameSync(temporaryPath, absoluteInput);
  console.log(`Normalized ${path.basename(absoluteInput)} (${entries.length} files)`);
} catch (error) {
  if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath);
  throw error;
}
