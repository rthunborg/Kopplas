import { openSync, closeSync, readSync, fstatSync, lstatSync, constants } from 'node:fs';
import { pathToFileURL } from 'node:url';

const FIELDS = {
  monitor: ['Current packet', 'Authority', 'Holds', 'Gates'],
  packet: ['Revision', 'Authority', 'Ownership', 'Holds', 'Candidate', 'Pins', 'Running', 'Dimensions', 'Blockers', 'Evidence', 'Next action'],
};
const LIMITS = { monitor: 4000, packet: 12000, readback: 4000 };

// Never expose input values, paths or native exception messages.
function failure(reason, counts) { return { ok: false, reason, counts }; }
function readInput(path, kind) {
  let fd;
  try {
    if (!lstatSync(path).isFile()) return { reason: 'INVALID_FILE' };
    fd = openSync(path, constants.O_RDONLY | (constants.O_NONBLOCK ?? 0));
    if (!fstatSync(fd).isFile()) return { reason: 'INVALID_FILE' };
    const bound = LIMITS[kind] * 4;
    const buffer = Buffer.alloc(bound + 1);
    let total = 0;
    while (total < buffer.length) {
      const read = readSync(fd, buffer, total, buffer.length - total, null);
      if (!read) break;
      total += read;
    }
    if (total > bound) return { reason: 'BYTE_LIMIT' };
    let content;
    try { content = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(buffer.subarray(0, total)); }
    catch { return { reason: 'INVALID_UTF8' }; }
    let count = 0;
    for (const scalar of content) {
      const point = scalar.codePointAt(0);
      if (point >= 0xd800 && point <= 0xdfff) return { reason: 'INVALID_UNICODE' };
      count += 1;
    }
    if (count > LIMITS[kind]) return { reason: 'SCALAR_LIMIT', count };
    const fields = FIELDS[kind === 'readback' ? 'monitor' : kind];
    for (const field of fields) {
      const lines = content.split(/\r?\n/u).filter(line => line.startsWith(`${field}:`));
      if (lines.length !== 1 || !lines[0].slice(field.length + 1).trim()) return { reason: 'INVALID_FIELDS', count };
    }
    return { content, count };
  } catch { return { reason: 'INPUT_UNAVAILABLE' }; }
  finally { if (fd !== undefined) closeSync(fd); }
}

export function checkCoordinationContext(args) {
  const counts = {};
  const paths = {};
  const flags = new Set(['--monitor', '--packet', '--readback']);
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!flags.has(flag) || Object.hasOwn(paths, flag.slice(2)) || typeof value !== 'string' || !value || value.startsWith('--')) return failure('INVALID_ARGUMENTS', counts);
    paths[flag.slice(2)] = value;
  }
  if (!paths.monitor || !paths.packet) return failure('INVALID_ARGUMENTS', counts);
  const inputs = {};
  for (const kind of ['monitor', 'packet', 'readback']) {
    if (!paths[kind]) continue;
    const input = readInput(paths[kind], kind);
    if (input.count !== undefined) counts[kind] = input.count;
    if (input.reason) return failure(input.reason, counts);
    inputs[kind] = input.content;
  }
  if (inputs.readback !== undefined && inputs.readback !== inputs.monitor) return failure('READBACK_MISMATCH', counts);
  return { ok: true, reason: 'VALID', counts };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let result;
  try { result = checkCoordinationContext(process.argv.slice(2)); }
  catch { result = failure('INTERNAL_FAILURE', {}); }
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = result.ok ? 0 : 1;
}
