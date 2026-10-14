// Standalone synthetic experiment. Importing this module starts no resources.
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

export const PAYLOAD = Buffer.from('synthetic-no-store-stream\n'.repeat(12) + 'tail-12345\n!', 'ascii');
export const COMPRESSED = gzipSync(PAYLOAD, { level: 0 });
export const PREFIX = COMPRESSED.subarray(0, COMPRESSED.length - 8);
const TRAILER = COMPRESSED.subarray(COMPRESSED.length - 8);
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const EXPECTED = Object.freeze({ decodedBytes: PAYLOAD.length, decodedSha256: sha256(PAYLOAD), compressedBytes: COMPRESSED.length, compressedSha256: sha256(COMPRESSED) });
const WINDOW_MS = 8000;
const CACHE = 'private, no-cache, no-store, max-age=0, must-revalidate';
const FAILURE = new Set(['none', 'setup', 'version', 'schema', 'privacy', 'control', 'deadline', 'cleanup', 'internal', 'write']);
const TERMINAL = new Set(['finished', 'failed', 'unknown']);
const READER = new Set(['eof', 'error', 'unknown', 'not-exercised']);
const NATIVE = new Set(['available', 'failed', 'unknown', 'not-requested']);
const EVENT = new Set(['server-request', 'server-finish', 'server-close', 'public-response', 'public-finished', 'public-failed', 'cdp-request', 'cdp-response', 'cdp-data', 'cdp-finished', 'cdp-failed', 'progress', 'acquired', 'release', 'abort', 'truncate', 'reader-eof', 'reader-error', 'native-finished', 'native-body']);
export const CASES = Object.freeze([
  ...['reader-one', 'reader-two', 'native-text'].flatMap(arm => [1, 2].map(repetition => Object.freeze({ case: `${arm}-${repetition}`, arm, repetition, control: 'none' }))),
  Object.freeze({ case: 'caller-abort', arm: 'reader-two', repetition: 1, control: 'abort' }),
  Object.freeze({ case: 'premature-close', arm: 'reader-two', repetition: 1, control: 'truncate' }),
]);

export function newObservation(spec) {
  return { ...spec, noStore: false, gzip: false, chunked: false, contentLengthPresent: false,
    decodedBytes: null, decodedSha256: null, reader: spec.arm === 'native-text' ? 'not-exercised' : 'unknown',
    callerAbort: false, serverTruncate: false, serverFinish: false, serverPrematureClose: false,
    publicTerminal: 'unknown', cdpTerminal: 'unknown', publicMatches: 0, cdpMatches: 0,
    nativeFinished: 'unknown', nativeBody: spec.arm === 'native-text' ? 'unknown' : 'not-requested',
    nativeBodyBytes: null, nativeBodySha256: null, cdpEvents: 0, cdpDecodedBytes: 0, cdpEncodedBytes: 0,
    releasePhase: 'none', events: [], eventOverflow: false };
}

export function eventRecorder(row, now = () => performance.now()) {
  const origin = now();
  let active = true;
  return { record(name) {
    if (!active) return;
    if (!EVENT.has(name)) throw new Error('schema');
    if (row.events.length >= 24) { row.eventOverflow = true; return; }
    row.events.push({ ordinal: row.events.length + 1, milliseconds: Math.max(0, Math.min(WINDOW_MS, Math.round(now() - origin))), event: name });
  }, mutate(callback) { if (active) callback(); }, stop() { active = false; } };
}

export function counted(value) { return value === 0 ? 1 : 'overflow'; }
export function correlated(row) { return row.publicMatches === 1 && row.cdpMatches === 1 && !row.eventOverflow; }
export function delivered(row) { return row.reader === 'eof' && row.decodedBytes === EXPECTED.decodedBytes && row.decodedSha256 === EXPECTED.decodedSha256 && row.serverFinish && !row.serverPrematureClose && !row.callerAbort; }
export function validControl(row) {
  const action = row.control === 'abort' ? row.callerAbort && !row.serverTruncate : row.serverTruncate && !row.callerAbort;
  return action && row.reader === 'error' && row.serverPrematureClose && !row.serverFinish
    && correlated(row) && row.publicTerminal === 'failed' && row.cdpTerminal === 'failed'
    // Playwright 1.61.1 leaves Response.finished() pending on requestfailed.
    // Preserve that unknown; actual public/CDP failures above prove the control.
    && ['unknown', 'failed'].includes(row.nativeFinished) && row.releasePhase === 'withheld'
    && Number.isInteger(row.decodedBytes) && row.decodedBytes > 0 && row.decodedSha256 !== null;
}

export function classify(rows, failure = 'none') {
  if (failure !== 'none') return { result: 'harness-failure', exitCode: 1 };
  if (rows.length !== 8 || !rows.slice(6).every(validControl)) return { result: 'harness-failure', exitCode: 1 };
  const readers = rows.slice(0, 4);
  if (!readers.every(delivered)) return { result: 'inconclusive', exitCode: 0 };
  const positives = rows.slice(0, 6);
  if (!positives.every(correlated)) return { result: 'inconclusive', exitCode: 0 };
  const disagreement = readers.some(r => r.publicTerminal === 'failed' || r.cdpTerminal === 'failed' || r.nativeFinished === 'failed')
    || rows.slice(4, 6).some(r => r.serverFinish && !r.serverPrematureClose && (r.nativeBody === 'failed'
      || (r.nativeBody === 'available' && (r.nativeBodyBytes !== EXPECTED.decodedBytes || r.nativeBodySha256 !== EXPECTED.decodedSha256))));
  if (disagreement) return { result: 'discrepancy-reproduced', exitCode: 0 };
  const clean = positives.every(r => r.serverFinish && !r.serverPrematureClose && r.publicTerminal === 'finished' && r.cdpTerminal === 'finished' && r.nativeFinished === 'finished')
    && rows.slice(4, 6).every(r => r.nativeBody === 'available' && r.nativeBodyBytes === EXPECTED.decodedBytes && r.nativeBodySha256 === EXPECTED.decodedSha256);
  return { result: clean ? 'not-reproduced' : 'inconclusive', exitCode: 0 };
}

// The formatter copies only named fields; validator rejects unknown keys and values.
export function report(versions, rows, failure) {
  const rowKeys = Object.keys(newObservation(CASES[0]));
  const output = { schemaVersion: 1, kind: 'synthetic-native-stream-experiment', versions: { node: versions.node, playwright: versions.playwright, chromium: versions.chromium }, expected: { ...EXPECTED }, result: classify(rows, failure).result, harnessFailure: failure,
    cases: rows.map(row => Object.fromEntries(rowKeys.map(key => [key, key === 'events' ? row.events.map(e => ({ ordinal: e.ordinal, milliseconds: e.milliseconds, event: e.event })) : row[key]]))) };
  validateReport(output);
  // Retain a sanitized receipt even at the simultaneous per-row event limits.
  // Truncation is explicit overflow and cannot retain an identity conclusion.
  while (Buffer.byteLength(JSON.stringify(output) + '\n') > 16320) {
    const longest = output.cases.reduce((a, b) => a.events.length >= b.events.length ? a : b);
    if (!longest.events.length) throw new Error('schema');
    longest.events.pop(); longest.eventOverflow = true;
  }
  if (failure === 'none' && !output.cases.slice(6).every(validControl)) output.harnessFailure = 'control';
  const verdict = classify(output.cases, output.harnessFailure);
  output.result = verdict.result;
  const json = JSON.stringify(output) + '\n';
  if (Buffer.byteLength(json) > 16384) throw new Error('schema');
  return { json, exitCode: verdict.exitCode };
}

export function admissionReport(versions, failure) {
  if (!FAILURE.has(failure) || failure === 'none') throw new Error('schema');
  const header = report(versions, CASES.map(newObservation), failure);
  const value = JSON.parse(header.json);
  value.kind = 'synthetic-native-stream-admission';
  value.result = 'no-execution';
  value.cases = [];
  return { json: JSON.stringify(value) + '\n', exitCode: 1 };
}

export function validateReport(r) {
  const exact = (value, keys) => value && Object.keys(value).sort().join('|') === [...keys].sort().join('|');
  const integer = (n, max) => Number.isInteger(n) && n >= 0 && n <= max;
  const digest = s => s === null || /^[a-f0-9]{64}$/.test(s);
  if (!exact(r, ['schemaVersion', 'kind', 'versions', 'expected', 'result', 'harnessFailure', 'cases']) || r.schemaVersion !== 1 || r.kind !== 'synthetic-native-stream-experiment'
    || !FAILURE.has(r.harnessFailure) || !['harness-failure', 'discrepancy-reproduced', 'not-reproduced', 'inconclusive'].includes(r.result)
    || !exact(r.versions, ['node', 'playwright', 'chromium']) || !Object.values(r.versions).every(v => v === 'unknown' || /^v?\d+\.\d+\.\d+(?:\.\d+)?$/.test(v))
    || !exact(r.expected, Object.keys(EXPECTED)) || Object.keys(EXPECTED).some(k => r.expected[k] !== EXPECTED[k]) || !Array.isArray(r.cases) || r.cases.length !== 8) throw new Error('schema');
  for (const [i, row] of r.cases.entries()) {
    if (!exact(row, Object.keys(newObservation(CASES[i]))) || Object.keys(CASES[i]).some(k => row[k] !== CASES[i][k])) throw new Error('schema');
    for (const key of ['noStore', 'gzip', 'chunked', 'contentLengthPresent', 'callerAbort', 'serverTruncate', 'serverFinish', 'serverPrematureClose', 'eventOverflow']) if (typeof row[key] !== 'boolean') throw new Error('schema');
    if (!READER.has(row.reader) || !TERMINAL.has(row.publicTerminal) || !TERMINAL.has(row.cdpTerminal) || !TERMINAL.has(row.nativeFinished) || !NATIVE.has(row.nativeBody)
      || !['none', 'progress', 'acquired', 'withheld'].includes(row.releasePhase) || ![0, 1, 'overflow'].includes(row.publicMatches) || ![0, 1, 'overflow'].includes(row.cdpMatches)
      || !digest(row.decodedSha256) || !digest(row.nativeBodySha256) || ![row.decodedBytes, row.nativeBodyBytes].every(n => n === null || integer(n, 324))
      || !integer(row.cdpEvents, 128) || !integer(row.cdpDecodedBytes, 4096) || !integer(row.cdpEncodedBytes, 4096) || !Array.isArray(row.events) || row.events.length > 24) throw new Error('schema');
    for (const [j, e] of row.events.entries()) if (!exact(e, ['ordinal', 'milliseconds', 'event']) || e.ordinal !== j + 1 || !integer(e.milliseconds, WINDOW_MS) || !EVENT.has(e.event) || (j && e.milliseconds < row.events[j - 1].milliseconds)) throw new Error('schema');
    if (row.arm === 'native-text' && row.reader !== 'not-exercised') throw new Error('schema');
    if (row.nativeBody !== 'available' && (row.nativeBodyBytes !== null || row.nativeBodySha256 !== null)) throw new Error('schema');
  }
}

export function releaseDecision(spec, signal) {
  if (spec.arm === 'native-text') return signal === 'acquired' ? 'release' : 'invalid';
  if (signal !== 'progress') return 'invalid';
  return spec.control === 'none' ? 'release' : spec.control === 'abort' ? 'abort' : 'truncate';
}

// All task promises get rejection handlers immediately. Late settlements cannot mutate a frozen row.
export function observePromise(promise, recorder, fulfilled, rejected) {
  return Promise.resolve(promise).then(value => recorder.mutate(() => fulfilled(value)), () => recorder.mutate(rejected))
    .catch(() => recorder.mutate(rejected));
}

async function bounded(promise, milliseconds) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('deadline')), milliseconds); })]); }
  finally { clearTimeout(timer); }
}

export async function closeCase({ recorder, detachListeners, abort, detach, close, pending, deadlineClose }) {
  recorder.stop();
  detachListeners();
  // Start every attempt before awaiting: a stalled abort/detach cannot prevent close.
  const attemptedAbort = Promise.resolve().then(abort).catch(() => {});
  const attemptedDetach = Promise.resolve().then(detach).catch(() => {});
  const attemptedClose = Promise.resolve().then(close);
  try {
    await bounded(Promise.all([attemptedAbort, attemptedDetach, attemptedClose, deadlineClose, Promise.allSettled(pending)]), 1000);
  } catch { throw new Error('cleanup'); }
}

export async function browserFetch({ path, nativeText, abortControl }) {
  const controller = new AbortController();
  window.probeAbort = () => controller.abort();
  let bytes = 0;
  const chunks = [];
  let reader;
  try {
    const response = await fetch(path, { signal: controller.signal });
    if (nativeText) { void window.probeSignal({ signal: 'acquired' }).catch(() => {}); return { reader: 'not-exercised' }; }
    reader = response.body.getReader();
    let signalled = false;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.length;
      if (bytes > 324) throw new Error('size');
      chunks.push(part.value);
      if (!signalled && bytes > 0) {
        signalled = true;
        if (abortControl) controller.abort();
        void window.probeSignal({ signal: 'progress', bytes, aborted: abortControl }).catch(() => {});
      }
    }
    const all = new Uint8Array(bytes); let offset = 0;
    for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.length; }
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', all))].map(b => b.toString(16).padStart(2, '0')).join('');
    return { reader: 'eof', bytes, hash };
  } catch {
    const all = new Uint8Array(bytes); let offset = 0;
    for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.length; }
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', all))].map(b => b.toString(16).padStart(2, '0')).join('');
    return { reader: 'error', bytes, hash };
  } finally { if (reader) reader.releaseLock(); }
}

async function runCase(browser, serverState, spec) {
  const row = newObservation(spec);
  const recorder = eventRecorder(row);
  let context;
  let page;
  let cdp;
  const path = `/probe/${spec.case}`;
  const url = `${serverState.origin}${path}`;
  const pending = [];
  let nativeResponse;
  let request;
  let cdpId;
  let signals = 0;
  let failure = 'none';
  let timedOut = false;
  let deadlineClose;
  const started = performance.now();
  const timer = setTimeout(() => {
    timedOut = true; recorder.stop();
    deadlineClose = (context ? context.close() : browser.close()).catch(() => {});
  }, 7000);
  const track = (p, yes, no) => { const task = observePromise(p, recorder, yes, no); pending.push(task); };
  const record = name => recorder.record(name);
  const publicResponse = response => {
    if (response.url() !== url || response.request().method() !== 'GET') return;
    recorder.mutate(() => {
      row.publicMatches = counted(row.publicMatches); record('public-response');
      if (row.publicMatches !== 1) return;
      nativeResponse = response; request = response.request();
      track(response.allHeaders(), headers => {
        row.noStore = headers['cache-control'] === CACHE; row.gzip = headers['content-encoding'] === 'gzip';
        row.chunked = headers['transfer-encoding'] === 'chunked'; row.contentLengthPresent = 'content-length' in headers;
        if (response.status() !== 200 || headers['content-type'] !== 'text/x-component' || !row.noStore || !row.gzip || !row.chunked || row.contentLengthPresent) failure = 'internal';
      }, () => { failure = 'internal'; });
      track(response.finished(), error => { row.nativeFinished = error === null ? 'finished' : 'failed'; record('native-finished'); }, () => { row.nativeFinished = 'failed'; record('native-finished'); });
      if (spec.arm === 'native-text') track(response.text(), text => {
        const body = Buffer.from(text, 'utf8');
        if (body.length > 324) { failure = 'internal'; return; }
        row.nativeBody = 'available'; row.nativeBodyBytes = body.length; row.nativeBodySha256 = sha256(body); record('native-body');
      }, () => { row.nativeBody = 'failed'; record('native-body'); });
    });
  };
  const publicFinished = r => recorder.mutate(() => { if (r === request) { row.publicTerminal = 'finished'; record('public-finished'); } });
  const publicFailed = r => recorder.mutate(() => { if (r === request) { row.publicTerminal = 'failed'; record('public-failed'); } });
  const cdpRequest = e => recorder.mutate(() => {
    if (e.request.url !== url || e.request.method !== 'GET') return;
    row.cdpMatches = counted(row.cdpMatches); record('cdp-request');
    if (row.cdpMatches === 1) cdpId = e.requestId;
  });
  const cdpEvent = (name, apply) => e => recorder.mutate(() => {
    if (e.requestId !== cdpId || cdpId === undefined) return;
    if (++row.cdpEvents > 128) { row.cdpEvents = 128; row.eventOverflow = true; return; }
    record(name); apply(e);
  });
  const handlers = [
    ['Network.requestWillBeSent', cdpRequest], ['Network.responseReceived', cdpEvent('cdp-response', () => {})],
    ['Network.dataReceived', cdpEvent('cdp-data', e => {
      for (const [key, amount] of [['cdpDecodedBytes', e.dataLength], ['cdpEncodedBytes', e.encodedDataLength]]) {
        if (!Number.isInteger(amount) || amount < 0 || row[key] + amount > 4096) { row.eventOverflow = true; continue; }
        row[key] += amount;
      }
    })],
    ['Network.loadingFinished', cdpEvent('cdp-finished', () => { row.cdpTerminal = 'finished'; })],
    ['Network.loadingFailed', cdpEvent('cdp-failed', () => { row.cdpTerminal = 'failed'; })],
  ];
  try {
    context = await browser.newContext();
    page = await context.newPage();
    cdp = await context.newCDPSession(page);
    serverState.current = { path, spec, row, recorder, response: null, released: false };
    page.on('response', publicResponse); page.on('requestfinished', publicFinished); page.on('requestfailed', publicFailed);
    for (const [name, handler] of handlers) cdp.on(name, handler);
    await cdp.send('Network.enable');
    await page.exposeBinding('probeSignal', (source, message) => recorder.mutate(() => {
      if (source.page !== page || source.frame !== page.mainFrame() || ++signals !== 1 || !message || !['progress', 'acquired'].includes(message.signal)) { failure = 'internal'; return; }
      const decision = releaseDecision(spec, message.signal);
      const state = serverState.current;
      if (decision === 'invalid' || !state?.response || state.released) { failure = 'internal'; return; }
      if (message.signal === 'progress' && (!Number.isInteger(message.bytes) || message.bytes < 1 || message.bytes > 324 || message.aborted !== (spec.control === 'abort'))) { failure = 'internal'; return; }
      record(message.signal);
      if (decision === 'release') {
        row.releasePhase = message.signal; state.released = true;
        if (spec.arm !== 'reader-one') { record('release'); state.response.end(TRAILER); }
      } else {
        row.releasePhase = 'withheld';
        if (decision === 'abort') { row.callerAbort = true; record('abort'); }
        else { row.serverTruncate = true; record('truncate'); state.response.destroy(); }
      }
    }));
    await page.goto(`${serverState.origin}/`, { waitUntil: 'load', timeout: 2000 });
    track(page.evaluate(browserFetch, { path, nativeText: spec.arm === 'native-text', abortControl: spec.control === 'abort' }), value => {
      if (spec.arm === 'native-text') return;
      if (!value || !['eof', 'error'].includes(value.reader) || !Number.isInteger(value.bytes) || value.bytes < 0 || value.bytes > 324 || !/^[a-f0-9]{64}$/.test(value.hash)) { failure = 'internal'; return; }
      row.reader = value.reader; row.decodedBytes = value.bytes; row.decodedSha256 = value.hash;
      record(value.reader === 'eof' ? 'reader-eof' : 'reader-error');
    }, () => { failure = 'internal'; });
    while (!timedOut && performance.now() - started < 6900) {
      const consumed = spec.arm === 'native-text' ? row.nativeBody !== 'unknown' : row.reader !== 'unknown';
      if (consumed && row.publicTerminal !== 'unknown' && row.cdpTerminal !== 'unknown' && row.nativeFinished !== 'unknown' && (row.serverFinish || row.serverPrematureClose)) break;
      await new Promise(r => setTimeout(r, 10));
    }
    if (signals !== 1 || !nativeResponse || !serverState.current.response) failure = 'internal';
  } catch {
    failure = timedOut ? 'deadline' : 'internal';
  } finally {
    // Freeze observations first: teardown aborts and late native rejections are not evidence.
    recorder.stop(); serverState.current = null;
    clearTimeout(timer);
    try { await closeCase({ recorder, detachListeners() {
      if (page) { page.off('response', publicResponse); page.off('requestfinished', publicFinished); page.off('requestfailed', publicFailed); }
      if (cdp) for (const [name, handler] of handlers) cdp.off(name, handler);
    }, abort: async () => { if (page && !page.isClosed()) await page.evaluate(() => window.probeAbort?.()).catch(() => {}); },
    detach: async () => { if (cdp && !timedOut) await cdp.detach(); },
    close: async () => { if (context) await context.close(); }, pending, deadlineClose }); }
    catch { failure = 'cleanup'; }
  }
  return { row, failure };
}

export async function main() {
  const versions = { node: process.version, playwright: 'unknown', chromium: 'unknown' };
  const rows = CASES.map(newObservation);
  let failure = 'none';
  let browser;
  let server;
  let setupComplete = false;
  let setupOpen = true;
  let setupTask;
  const sockets = new Set();
  const state = { current: null, origin: '' };
  const started = performance.now();
  try {
    setupTask = (async () => {
      if (PAYLOAD.length !== 324) throw new Error('internal');
      const require = createRequire(import.meta.url);
      versions.playwright = require('@playwright/test/package.json').version;
      const nvm = (await readFile(new URL('../../.nvmrc', import.meta.url), 'utf8')).trim();
      if (versions.playwright !== '1.61.1' || !versions.node.startsWith(`v${nvm}.`)) throw new Error('version');
      const { chromium } = await import('@playwright/test');
      if (!setupOpen) throw new Error('deadline');
      browser = await chromium.launch({ headless: true, timeout: 8000 });
      if (!setupOpen) { await browser.close(); throw new Error('deadline'); }
      versions.chromium = browser.version();
      if (versions.chromium !== '149.0.7827.55') throw new Error('version');
      server = createServer((req, res) => {
        if (req.method === 'GET' && req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><title>Synthetic stream probe</title>'); return; }
        const current = state.current;
        if (!current || req.method !== 'GET' || req.url !== current.path || current.response) { res.writeHead(404); res.end(); return; }
        current.response = res; current.recorder.record('server-request');
        res.on('finish', () => current.recorder.mutate(() => { current.row.serverFinish = true; current.recorder.record('server-finish'); }));
        res.on('close', () => current.recorder.mutate(() => { current.row.serverPrematureClose = !res.writableFinished; current.recorder.record('server-close'); }));
        res.on('error', () => {});
        res.writeHead(200, { 'Content-Type': 'text/x-component', 'Content-Encoding': 'gzip', 'Cache-Control': CACHE, 'Transfer-Encoding': 'chunked' });
        if (current.spec.arm === 'reader-one') res.end(COMPRESSED);
        else res.write(PREFIX);
      });
      server.on('connection', socket => { sockets.add(socket); socket.once('close', () => sockets.delete(socket)); socket.on('error', () => {}); });
      await new Promise((yes, no) => { server.once('error', no); server.listen(0, '127.0.0.1', yes); });
      state.origin = `http://127.0.0.1:${server.address().port}`;
    })();
    await bounded(setupTask, 10000);
    setupComplete = true;
    for (const [i, spec] of CASES.entries()) {
      if (performance.now() - started > 74000) throw new Error('deadline');
      const observation = await runCase(browser, state, spec);
      rows[i] = observation.row;
      if (observation.failure !== 'none') { failure = observation.failure; break; }
    }
  } catch (error) { failure = FAILURE.has(error?.message) && error.message !== 'none' ? error.message : 'setup'; }
  finally {
    setupOpen = false;
    state.current?.recorder.stop(); state.current = null;
    try {
      const browserClosed = browser ? browser.close() : Promise.resolve();
      const serverClosed = server ? new Promise((yes, no) => server.close(error => error ? no(error) : yes())) : Promise.resolve();
      for (const socket of sockets) socket.destroy();
      await bounded(Promise.all([browserClosed, serverClosed, Promise.allSettled(setupTask ? [setupTask] : [])]), 5000);
    } catch { failure = 'cleanup'; }
  }
  if (performance.now() - started > 90000) failure = 'deadline';
  if (failure === 'none' && !rows.slice(6).every(validControl)) failure = 'control';
  try {
    const output = setupComplete ? report(versions, rows, failure) : admissionReport(versions, failure);
    await mkdir('test-results', { recursive: true });
    await writeFile('test-results/native-stream-probe.json', output.json, { encoding: 'utf8', flag: 'wx' });
    process.stdout.write(`native-stream-probe ${JSON.parse(output.json).result} ${Buffer.byteLength(output.json)}B\n`);
    if (output.exitCode) process.stderr.write(`native-stream-probe ${JSON.parse(output.json).harnessFailure}\n`);
    process.exitCode = output.exitCode;
  } catch { process.stderr.write('native-stream-probe write\n'); process.exitCode = 1; }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
