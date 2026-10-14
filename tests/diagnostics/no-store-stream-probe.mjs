// Standalone synthetic experiment. Importing this module starts no resources.
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
// PAIRED-ADDITION-BEGIN imports
import { mkdtemp, realpath, stat, lstat, chmod, appendFile } from 'node:fs/promises';
import { dirname, join, relative, isAbsolute } from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { execFile } from 'node:child_process';
import { get as httpsGet } from 'node:https';
// PAIRED-ADDITION-END imports

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
    // PAIRED-ADDITION-BEGIN fence
    const paired = pairedCases.get(browser);
    if (paired) {
      if (page) { page.off('response', publicResponse); page.off('requestfinished', publicFinished); page.off('requestfailed', publicFailed); }
      if (cdp) for (const [name, handler] of handlers) cdp.off(name, handler);
      const frozen = freezeObservation(row);
      clearTimeout(timer);
      paired.rows.push(frozen);
      if (spec.control === 'none' && spec.arm !== 'native-text') {
        try { paired.bodies.push(await bodyProof(frozen, nativeResponse)); }
        catch { failure = 'internal'; }
      }
      if (timedOut) failure = 'deadline';
    }
    // PAIRED-ADDITION-END fence
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

// PAIRED-ADDITION-BEGIN implementation
// This opt-in lane uses only public SDK methods. Default main and classifier stay authoritative.
const pairedCases = new WeakMap();
export const FIXED = Object.freeze({ version: '158.0.8104.0', baseline: '149.0.7827.55', sdk: '1.61.1',
  platform: 'linux64', revision: '1717709', generation: '1791951285551907', bytes: 202355055,
  md5: '4bc3c2aa1a735657f7d063a96d84baa2', md5Base64: 'S8PCqhpzVlf30GOpbYS6og==',
  artifact: 'chrome-for-testing-public-158.0.8104.0-linux64',
  metadataUrl: 'https://googlechromelabs.github.io/chrome-for-testing/158.0.8104.0.json',
  url: 'https://storage.googleapis.com/chrome-for-testing-public/158.0.8104.0/linux64/chrome-linux64.zip' });
const PAIRED_FAILURE = new Set([...FAILURE, 'provenance']);
const PAIR_RESULTS = new Set(['harness-failure', 'no-execution', 'paired-inconclusive', 'paired-full-native-clean', 'paired-reader-remedy-observed', 'paired-defect-persists']);
const hex = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const exactKeys = (value, keys) => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join('|') === [...keys].sort().join('|');
const safeInteger = (value, maximum) => Number.isInteger(value) && value >= 0 && value <= maximum;
export function freezeObservation(row) {
  const copy = JSON.parse(JSON.stringify(row));
  for (const event of copy.events) Object.freeze(event);
  Object.freeze(copy.events);
  return Object.freeze(copy);
}
const framing = row => row.noStore && row.gzip && row.chunked && !row.contentLengthPresent;
const positive = row => delivered(row) && correlated(row) && framing(row);
const nativeFailure = row => [row.publicTerminal, row.cdpTerminal, row.nativeFinished].includes('failed');
const bodyMatches = body => body.bytes === EXPECTED.decodedBytes && body.sha256 === EXPECTED.decodedSha256;

export async function bodyProof(row, response, milliseconds = 750) {
  const proof = { case: row.case, attempted: false, afterFrozenEof: false, state: 'not-requested', bytes: null, sha256: null, deadlineMs: 750 };
  // Bytes/hash alone never qualify EOF. No controls, native-text, or ambiguous identities.
  if (row.control !== 'none' || row.arm === 'native-text' || !positive(row)) return Object.freeze(proof);
  if (!Object.isFrozen(row) || !Object.isFrozen(row.events) || !response || milliseconds < 1 || milliseconds > 750) throw new Error('internal');
  proof.attempted = true; proof.afterFrozenEof = true;
  // Handlers return values, never write evidence. Timeout/teardown settlement cannot promote a proof.
  const operation = Promise.resolve().then(() => response.body()).then(body => {
    if (!Buffer.isBuffer(body) || body.length > 324) return { state: 'failed', bytes: null, sha256: null };
    return { state: 'available', bytes: body.length, sha256: sha256(body) };
  }, () => ({ state: 'failed', bytes: null, sha256: null }));
  try { Object.assign(proof, await bounded(operation, milliseconds)); }
  catch { proof.state = 'timeout'; }
  return Object.freeze(proof);
}

export function classifyPair(engines, failure = 'none') {
  const done = (result, exitCode = 0) => ({ result, fullNativeStatus: result === 'paired-full-native-clean' ? 'clean' : 'inconclusive', exitCode });
  if (failure !== 'none' || engines.some(engine => engine.failure !== 'none')) return done('harness-failure', 1);
  if (engines.length !== 2 || engines.some(engine => !engine.executed)) return done('no-execution', 1);
  if (engines.some(engine => engine.rows.length !== 8 || !engine.rows.slice(6).every(validControl))) return done('harness-failure', 1);
  const [baseline, fixed] = engines;
  const validPair = engines.every(engine => engine.rows.every(correlated) && engine.rows.every(framing) && engine.bodies.length === 4);
  const reproduced = validPair && baseline.rows.slice(0, 4).every(positive)
    && baseline.rows.slice(0, 4).some(row => row.publicTerminal === 'failed' && row.cdpTerminal === 'failed')
    && classify(baseline.rows).result === 'discrepancy-reproduced';
  if (!reproduced) return done('paired-inconclusive');
  const readers = fixed.rows.slice(0, 4);
  const qualified = readers.every((row, i) => positive(row)
    && ['finished', 'failed'].includes(row.publicTerminal) && ['finished', 'failed'].includes(row.cdpTerminal)
    && (['finished', 'failed'].includes(row.nativeFinished) || (row.nativeFinished === 'unknown' && [row.publicTerminal, row.cdpTerminal].includes('failed')))
    && fixed.bodies[i].case === row.case && fixed.bodies[i].attempted && fixed.bodies[i].afterFrozenEof
    && ['available', 'failed'].includes(fixed.bodies[i].state));
  if (!qualified) return done('paired-inconclusive');
  const clean = readers.every(row => row.publicTerminal === 'finished' && row.cdpTerminal === 'finished' && row.nativeFinished === 'finished')
    && fixed.bodies.every(body => body.state === 'available' && bodyMatches(body));
  const hostClean = fixed.rows.slice(4, 6).every(row => row.reader === 'not-exercised' && row.serverFinish && !row.serverPrematureClose
    && row.publicTerminal === 'finished' && row.cdpTerminal === 'finished' && row.nativeFinished === 'finished'
    && row.nativeBody === 'available' && row.nativeBodyBytes === EXPECTED.decodedBytes && row.nativeBodySha256 === EXPECTED.decodedSha256);
  if (clean && hostClean) return done('paired-full-native-clean');
  if (clean) return done('paired-reader-remedy-observed');
  if (readers.some(nativeFailure) || fixed.bodies.some(body => body.state === 'failed' || (body.state === 'available' && !bodyMatches(body)))) return done('paired-defect-persists');
  return done('paired-inconclusive');
}

export function checkTransport(status, headers) {
  if (status !== 200 || headers['x-goog-generation'] !== FIXED.generation
    || headers['x-goog-stored-content-length'] !== String(FIXED.bytes) || headers['content-length'] !== String(FIXED.bytes)
    || headers['x-goog-stored-content-encoding'] !== 'identity'
    || !String(headers['x-goog-hash']).split(',').map(s => s.trim()).includes(`md5=${FIXED.md5Base64}`)) throw new Error('provenance');
}
export function checkArchiveBytes(bytes) {
  if (bytes.length !== FIXED.bytes || createHash('md5').update(bytes).digest('hex') !== FIXED.md5) throw new Error('provenance');
  return { zipBytes: bytes.length, zipSha256: sha256(bytes), zipMd5: FIXED.md5 };
}
export function checkMetadata(metadata) {
  const artifacts = metadata?.downloads?.chrome;
  if (metadata?.version !== FIXED.version || metadata?.revision !== FIXED.revision || !Array.isArray(artifacts)
    || artifacts.filter(item => item?.platform === FIXED.platform).length !== 1
    || artifacts.find(item => item?.platform === FIXED.platform)?.url !== FIXED.url) throw new Error('provenance');
}
export async function officialMetadata(transport = httpsGet) {
  return new Promise((yes, no) => {
    let timer, request, settled = false, size = 0; const chunks = [];
    const finish = error => { if (settled) return; settled = true; clearTimeout(timer);
      if (error) no(new Error('provenance')); else {
        try { checkMetadata(JSON.parse(Buffer.concat(chunks).toString('utf8'))); yes(); }
        catch { no(new Error('provenance')); }
      }
    };
    request = transport(FIXED.metadataUrl, { headers: { 'Accept-Encoding': 'identity' } }, response => {
      if (response.statusCode !== 200) { response.destroy(); request.destroy(); finish(true); return; }
      response.on('data', bytes => { size += bytes.length; if (size > 65536) { response.destroy(); request.destroy(); finish(true); } else chunks.push(bytes); });
      response.once('end', () => finish(false)); response.once('error', () => finish(true)); response.once('aborted', () => finish(true));
    });
    request.once('error', () => finish(true));
    timer = setTimeout(() => { request.destroy(); finish(true); }, 5000);
  });
}
export async function downloadFixed(method, transport = httpsGet) {
  return new Promise((yes, no) => {
    let settled = false; const chunks = []; let length = 0;
    const finish = (error, value) => { if (settled) return; settled = true; clearTimeout(timer); if (error) no(new Error('provenance')); else yes(value); };
    const request = transport(FIXED.url, { method, headers: { 'Accept-Encoding': 'identity' } }, response => {
      try { checkTransport(response.statusCode, response.headers); }
      catch { response.destroy(); request.destroy(); finish(true); return; }
      if (method === 'HEAD') { response.resume(); finish(false, null); return; }
      response.on('data', chunk => {
        length += chunk.length;
        if (length > FIXED.bytes || length > 210000000) { response.destroy(); request.destroy(); finish(true); return; }
        chunks.push(chunk);
      });
      response.once('end', () => { if (length !== FIXED.bytes) finish(true); else finish(false, Buffer.concat(chunks)); });
      response.once('error', () => finish(true)); response.once('aborted', () => finish(true));
    });
    request.once('error', () => finish(true));
    const timer = setTimeout(() => { request.destroy(); finish(true); }, method === 'HEAD' ? 5000 : 150000);
  });
}

// Parse the ZIP directory ourselves: no archive tools/scripts, traversal, links, or overwrite.
export function zipEntries(zip) {
  const fail = () => { throw new Error('provenance'); };
  if (!Buffer.isBuffer(zip) || zip.length < 22 || zip.length > 210000000) fail();
  let end = zip.length - 22;
  while (end >= Math.max(0, zip.length - 65557) && zip.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0 || end < zip.length - 65557 || zip.readUInt16LE(end + 20) + end + 22 !== zip.length) fail();
  const count = zip.readUInt16LE(end + 10), size = zip.readUInt32LE(end + 12), start = zip.readUInt32LE(end + 16);
  if (zip.readUInt16LE(end + 4) || zip.readUInt16LE(end + 6) || count !== zip.readUInt16LE(end + 8) || !count || count > 20000 || start + size !== end) fail();
  let cursor = start, expanded = 0; const names = new Set(), entries = [];
  for (let i = 0; i < count; i++) {
    if (cursor + 46 > end || zip.readUInt32LE(cursor) !== 0x02014b50) fail();
    const flags = zip.readUInt16LE(cursor + 8), method = zip.readUInt16LE(cursor + 10), compressed = zip.readUInt32LE(cursor + 20), bytes = zip.readUInt32LE(cursor + 24);
    const n = zip.readUInt16LE(cursor + 28), extra = zip.readUInt16LE(cursor + 30), comment = zip.readUInt16LE(cursor + 32);
    const mode = zip.readUInt32LE(cursor + 38) >>> 16, offset = zip.readUInt32LE(cursor + 42);
    if (cursor + 46 + n + extra + comment > end || !n || flags & 1 || ![0, 8].includes(method) || zip.readUInt16LE(cursor + 34)) fail();
    const nameBytes = zip.subarray(cursor + 46, cursor + 46 + n), name = nameBytes.toString('utf8');
    const directory = name.endsWith('/'), parts = (directory ? name.slice(0, -1) : name).split('/');
    if (!Buffer.from(name).equals(nameBytes) || name.includes('\\') || name.includes(':') || /[\x00-\x1f\x7f]/.test(name)
      || parts.some(part => !part || part === '.' || part === '..') || parts[0] !== 'chrome-linux64' || names.has(name.replace(/\/$/, ''))
      || ![0, 0x8000, 0x4000].includes(mode & 0xf000) || ((mode & 0xf000) === 0x4000) !== directory && (mode & 0xf000) !== 0) fail();
    names.add(name.replace(/\/$/, '')); expanded += bytes;
    if (expanded > 1073741824 || directory && bytes || offset + 30 > start || zip.readUInt32LE(offset) !== 0x04034b50
      || zip.readUInt16LE(offset + 6) !== flags || zip.readUInt16LE(offset + 8) !== method) fail();
    const localName = zip.readUInt16LE(offset + 26), localExtra = zip.readUInt16LE(offset + 28), data = offset + 30 + localName + localExtra;
    if (data + compressed > start || !zip.subarray(offset + 30, offset + 30 + localName).equals(nameBytes)) fail();
    entries.push({ name, directory, bytes, compressed, data, method, mode });
    cursor += 46 + n + extra + comment;
  }
  if (cursor !== end || !entries.some(entry => entry.name === 'chrome-linux64/chrome' && !entry.directory && entry.mode & 0o111)) fail();
  return entries;
}
export function contained(root, path) { const part = relative(root, path); return part !== '' && !isAbsolute(part) && part !== '..' && !part.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`); }
export async function extractFixed(zip, root, deadline) {
  const entries = zipEntries(zip);
  for (const entry of entries) {
    if (performance.now() > deadline) throw new Error('deadline');
    const target = resolve(root, entry.name);
    if (!contained(root, target)) throw new Error('provenance');
    if (entry.directory) { await mkdir(target, { recursive: true }); continue; }
    await mkdir(dirname(target), { recursive: true });
    const compressed = zip.subarray(entry.data, entry.data + entry.compressed);
    const body = entry.method === 0 ? compressed : inflateRawSync(compressed, { maxOutputLength: Math.max(1, entry.bytes) });
    if (body.length !== entry.bytes) throw new Error('provenance');
    await writeFile(target, body, { flag: 'wx', mode: entry.mode & 0o777 });
  }
  const executable = join(root, 'chrome-linux64/chrome');
  if (!contained(await realpath(root), await realpath(executable)) || (await lstat(executable)).isSymbolicLink()) throw new Error('provenance');
  await chmod(executable, 0o755);
  return executable;
}
export function checkExecutableVersion(stdout, stderr, version) {
  if (![FIXED.version, FIXED.baseline].includes(version) || stderr || typeof stdout !== 'string'
    || !new RegExp(`^(Google Chrome for Testing|Chromium) ${version.replaceAll('.', '\\.')}\\r?\\n?$`).test(stdout)) throw new Error('version');
  return version;
}
async function executableReceipt(path, version) {
  const info = await stat(path);
  if (!info.isFile() || !safeInteger(info.size, 1073741824) || info.size < 1 || !(info.mode & 0o111)) throw new Error('provenance');
  const bytes = await readFile(path);
  if (bytes.length !== info.size) throw new Error('provenance');
  const actual = await new Promise((yes, no) => execFile(path, ['--version'], { timeout: 5000, maxBuffer: 256, windowsHide: true }, (error, stdout, stderr) => {
    if (error) { no(new Error('version')); return; }
    try { yes(checkExecutableVersion(stdout, stderr, version)); } catch { no(new Error('version')); }
  }));
  return { version: actual, bytes: bytes.length, sha256: sha256(bytes), product: 'full-chrome' };
}
const receiptKeys = ['artifact', 'platform', 'version', 'revision', 'generation', 'zipBytes', 'zipMd5', 'zipSha256', 'sha256Authority', 'executable'];
export function validateReceipt(receipt) {
  if (!exactKeys(receipt, receiptKeys) || receipt.artifact !== FIXED.artifact || receipt.platform !== FIXED.platform || receipt.version !== FIXED.version
    || receipt.revision !== FIXED.revision || receipt.generation !== FIXED.generation || receipt.zipBytes !== FIXED.bytes || receipt.zipMd5 !== FIXED.md5
    || !hex(receipt.zipSha256) || receipt.sha256Authority !== 'computed-acquired-bytes' || !validExecutable(receipt.executable, FIXED.version)) throw new Error('provenance');
}
function validExecutable(value, version) { return exactKeys(value, ['version', 'bytes', 'sha256', 'product']) && value.version === version && value.product === 'full-chrome' && safeInteger(value.bytes, 1073741824) && value.bytes > 0 && hex(value.sha256); }
async function acquireFixed() {
  if (process.platform !== 'linux' || !process.env.RUNNER_TEMP || !process.env.GITHUB_OUTPUT) throw new Error('setup');
  const start = performance.now(), deadline = start + 175000;
  const root = await mkdtemp(join(await realpath(process.env.RUNNER_TEMP), 'kopplas-fixed-chromium-'));
  await officialMetadata();
  await downloadFixed('HEAD');
  const zip = await bounded(downloadFixed('GET'), Math.min(150000, deadline - performance.now()));
  const transport = checkArchiveBytes(zip);
  const executable = await extractFixed(zip, root, deadline);
  const receipt = { artifact: FIXED.artifact, platform: FIXED.platform, version: FIXED.version, revision: FIXED.revision, generation: FIXED.generation,
    ...transport, sha256Authority: 'computed-acquired-bytes', executable: await executableReceipt(executable, FIXED.version) };
  validateReceipt(receipt);
  if (performance.now() > deadline) throw new Error('deadline');
  await writeFile(join(root, 'receipt.json'), JSON.stringify(receipt), { flag: 'wx', mode: 0o600 });
  // Runner-private handoff, never diagnostic output or artifact. Fail closed on line injection.
  if (/[\r\n]/.test(executable)) throw new Error('privacy');
  await appendFile(process.env.GITHUB_OUTPUT, `executable=${executable}\n`);
}
async function admitCandidate(path) {
  if (process.platform !== 'linux' || !process.env.RUNNER_TEMP || typeof path !== 'string') throw new Error('setup');
  const base = await realpath(process.env.RUNNER_TEMP), executable = await realpath(path), root = dirname(dirname(executable));
  if (!contained(base, root) || dirname(root) !== base || !/^kopplas-fixed-chromium-[a-zA-Z0-9]+$/.test(root.slice(base.length + 1))
    || executable !== join(root, 'chrome-linux64/chrome') || path !== executable || (await lstat(path)).isSymbolicLink()) throw new Error('provenance');
  const text = await readFile(join(root, 'receipt.json'), 'utf8');
  if (Buffer.byteLength(text) > 2048) throw new Error('provenance');
  const receipt = JSON.parse(text); validateReceipt(receipt);
  const actual = await executableReceipt(executable, FIXED.version);
  if (JSON.stringify(actual) !== JSON.stringify(receipt.executable)) throw new Error('provenance');
  return { executable, receipt };
}
async function packageAdmission() {
  const require = createRequire(import.meta.url), testManifest = require.resolve('@playwright/test/package.json');
  const testRequire = createRequire(testManifest), playwrightManifest = testRequire.resolve('playwright/package.json');
  const playwrightRequire = createRequire(playwrightManifest), coreManifest = playwrightRequire.resolve('playwright-core/package.json');
  const paths = [testManifest, playwrightManifest, coreManifest];
  const manifests = await Promise.all(paths.map(path => readFile(path)));
  if (manifests.some(bytes => JSON.parse(bytes).version !== FIXED.sdk) || !/^v22\.\d+\.\d+$/.test(process.version)) throw new Error('version');
  const nvm = await readFile(new URL('../../.nvmrc', import.meta.url));
  if (nvm.toString().trim() !== '22') throw new Error('version');
  const { chromium } = await import('@playwright/test');
  if (chromium !== testRequire('playwright').chromium || chromium !== playwrightRequire('playwright-core').chromium) throw new Error('version');
  if (EXPECTED.decodedBytes !== 324 || EXPECTED.decodedSha256 !== '0420236d41fefa877b55ef66e2b78d6f46a46f2f8ebfdd662bc6e1ce2d43b8fe'
    || EXPECTED.compressedBytes !== 347 || EXPECTED.compressedSha256 !== 'ffce20bb3e0b9766dc35c4f0d9626874851c353b85de3c3b4e8bffda09ec07a7') throw new Error('provenance');
  const provenance = { sourceSha256: sha256(await readFile(fileURLToPath(import.meta.url))), packageSha256: sha256(await readFile(new URL('../../package.json', import.meta.url))),
    lockSha256: sha256(await readFile(new URL('../../pnpm-lock.yaml', import.meta.url))), nvmSha256: sha256(nvm),
    testManifestSha256: sha256(manifests[0]), playwrightManifestSha256: sha256(manifests[1]), coreManifestSha256: sha256(manifests[2]), sdk: FIXED.sdk,
    node: process.version, baseline: await executableReceipt(chromium.executablePath(), FIXED.baseline) };
  return { chromium, provenance, baselinePath: chromium.executablePath() };
}

async function runEngine(chromium, path, version) {
  const evidence = { executed: false, rows: [], bodies: [], failure: 'none', versions: { node: process.version, playwright: FIXED.sdk, chromium: 'unknown' } };
  const start = performance.now(); let browser, server, setupTask, open = true;
  const sockets = new Set(), state = { current: null, origin: '' };
  try {
    setupTask = (async () => {
      browser = await chromium.launch({ headless: true, executablePath: path, timeout: 8000 });
      if (!open) { await browser.close(); throw new Error('deadline'); }
      evidence.versions.chromium = browser.version();
      if (evidence.versions.chromium !== version) throw new Error('version');
      pairedCases.set(browser, evidence);
      server = createServer((req, res) => {
        if (req.method === 'GET' && req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><title>Synthetic stream probe</title>'); return; }
        const current = state.current;
        if (!current || req.method !== 'GET' || req.url !== current.path || current.response) { res.writeHead(404); res.end(); return; }
        current.response = res; current.recorder.record('server-request');
        res.on('finish', () => current.recorder.mutate(() => { current.row.serverFinish = true; current.recorder.record('server-finish'); }));
        res.on('close', () => current.recorder.mutate(() => { current.row.serverPrematureClose = !res.writableFinished; current.recorder.record('server-close'); }));
        res.on('error', () => {});
        res.writeHead(200, { 'Content-Type': 'text/x-component', 'Content-Encoding': 'gzip', 'Cache-Control': CACHE, 'Transfer-Encoding': 'chunked' });
        if (current.spec.arm === 'reader-one') res.end(COMPRESSED); else res.write(PREFIX);
      });
      server.on('connection', socket => { sockets.add(socket); socket.once('close', () => sockets.delete(socket)); socket.on('error', () => {}); });
      await new Promise((yes, no) => { server.once('error', no); server.listen(0, '127.0.0.1', yes); });
      state.origin = `http://127.0.0.1:${server.address().port}`;
    })();
    await bounded(setupTask, 10000); evidence.executed = true;
    for (const spec of CASES) {
      if (performance.now() - start > 96000) throw new Error('deadline');
      const result = await runCase(browser, state, spec);
      if (result.failure !== 'none') { evidence.failure = result.failure; break; }
    }
  } catch (error) { evidence.failure = PAIRED_FAILURE.has(error?.message) && error.message !== 'none' ? error.message : 'setup'; }
  finally {
    open = false; state.current?.recorder.stop(); state.current = null;
    try {
      const closedBrowser = browser ? browser.close() : Promise.resolve();
      const closedServer = server ? new Promise((yes, no) => server.close(error => error ? no(error) : yes())) : Promise.resolve();
      for (const socket of sockets) socket.destroy();
      await bounded(Promise.all([closedBrowser, closedServer, Promise.allSettled(setupTask ? [setupTask] : [])]), 5000);
    } catch { evidence.failure = 'cleanup'; }
    if (browser) pairedCases.delete(browser);
  }
  if (performance.now() - start > 110000) evidence.failure = 'deadline';
  if (!evidence.executed) evidence.versions.chromium = 'unknown';
  if (evidence.failure === 'none' && (evidence.rows.length !== 8 || !evidence.rows.slice(6).every(validControl))) evidence.failure = 'control';
  return evidence;
}

// Resource-free protocol tests supply fake public SDK objects, never a browser launch.
export async function pairedCaseProof(browser, state, spec, evidence) {
  pairedCases.set(browser, evidence);
  try { return await runCase(browser, state, spec); }
  finally { pairedCases.delete(browser); }
}

const sourceKeys = ['sourceSha256', 'packageSha256', 'lockSha256', 'nvmSha256', 'testManifestSha256', 'playwrightManifestSha256', 'coreManifestSha256', 'sdk', 'node', 'baseline'];
function validateBody(body, row) {
  if (!exactKeys(body, ['case', 'attempted', 'afterFrozenEof', 'state', 'bytes', 'sha256', 'deadlineMs']) || body.case !== row.case || body.deadlineMs !== 750
    || typeof body.attempted !== 'boolean' || typeof body.afterFrozenEof !== 'boolean' || !['not-requested', 'available', 'failed', 'timeout'].includes(body.state)
    || body.attempted !== body.afterFrozenEof || body.attempted !== (body.state !== 'not-requested') || body.attempted && !positive(row)
    || (body.state === 'available' ? !safeInteger(body.bytes, 324) || !hex(body.sha256) : body.bytes !== null || body.sha256 !== null)) throw new Error('schema');
}
export function pairedReport(provenance, receipt, engines, failure) {
  if (!PAIRED_FAILURE.has(failure) || engines.length !== 2) throw new Error('schema');
  if (provenance !== null && (!exactKeys(provenance, sourceKeys) || sourceKeys.slice(0, 7).some(key => !hex(provenance[key]))
    || provenance.sdk !== FIXED.sdk || !/^v22\.\d+\.\d+$/.test(provenance.node) || !validExecutable(provenance.baseline, FIXED.baseline))) throw new Error('schema');
  if (receipt !== null) validateReceipt(receipt);
  if (engines.some(engine => engine.executed) && (!provenance || !receipt)) throw new Error('provenance');
  const normalized = engines.map((engine, index) => {
    if (!exactKeys(engine, ['executed', 'rows', 'bodies', 'failure', 'versions']) || typeof engine.executed !== 'boolean'
      || !exactKeys(engine.versions, ['node', 'playwright', 'chromium'])
      || !PAIRED_FAILURE.has(engine.failure) || !Array.isArray(engine.rows) || !Array.isArray(engine.bodies)) throw new Error('schema');
    if (!engine.executed && (engine.rows.length || engine.bodies.length || engine.versions.chromium !== 'unknown')) throw new Error('schema');
    if (engine.executed && engine.versions.chromium !== (index === 0 ? FIXED.baseline : FIXED.version)) throw new Error('version');
    let original;
    if (engine.executed) {
      // A stopped partial series stays explicit failure; pad only the unchanged engine report,
      // never the paired frozen rows (which remain the exact executed observations).
      if (engine.rows.length > 8 || engine.bodies.length > 4 || engine.rows.length !== 8 && engine.failure === 'none') throw new Error('schema');
      const full = CASES.map((spec, i) => engine.rows[i] ?? newObservation(spec));
      original = JSON.parse(report(engine.versions, full, FAILURE.has(engine.failure) ? engine.failure : 'setup').json);
      if (original.cases.slice(0, engine.rows.length).some((row, i) => JSON.stringify(row) !== JSON.stringify(engine.rows[i]))) throw new Error('schema');
    } else original = JSON.parse(admissionReport(engine.versions, FAILURE.has(engine.failure) && engine.failure !== 'none' ? engine.failure : 'setup').json);
    for (const [i, body] of engine.bodies.entries()) validateBody(body, engine.rows[i]);
    return { engine: index === 0 ? 'full-chrome-149' : 'cft-full-chrome-158', executed: engine.executed, failure: engine.failure,
      original, rows: engine.rows, bodies: engine.bodies };
  });
  const verdict = classifyPair(engines, failure);
  if (!PAIR_RESULTS.has(verdict.result)) throw new Error('schema');
  const output = { schemaVersion: 1, kind: 'synthetic-fixed-chromium-pair', provenance, acquisition: receipt, expected: { ...EXPECTED },
    harnessFailure: failure, result: verdict.result, fullNativeStatus: verdict.fullNativeStatus, engines: normalized };
  // Original reports retain their own <=16KiB ceiling; storing rows twice is unnecessary.
  for (const engine of output.engines) { engine.original.cases = engine.rows; delete engine.rows; }
  const json = JSON.stringify(output) + '\n';
  if (Buffer.byteLength(json) > 49152) throw new Error('schema');
  return { json, exitCode: verdict.exitCode };
}
const unexecutedEngine = () => ({ executed: false, rows: [], bodies: [], failure: 'none', versions: { node: process.version, playwright: 'unknown', chromium: 'unknown' } });
export async function pairedMain() {
  const acquire = process.argv[2] === '--acquire-fixed-chromium';
  if (acquire) {
    try { if (process.argv.length !== 3) throw new Error('setup'); await acquireFixed(); process.stdout.write('fixed-chromium-acquisition ready\n'); }
    catch { process.stderr.write('fixed-chromium-acquisition unavailable\n'); process.exitCode = 1; }
    return;
  }
  const start = performance.now(); let provenance = null, receipt = null, failure = 'none';
  const engines = [unexecutedEngine(), unexecutedEngine()];
  try {
    if (process.argv.length !== 4 || process.env.DEBUG || process.env.PWDEBUG || process.platform !== 'linux') throw new Error('setup');
    const admission = await bounded((async () => ({ candidate: await admitCandidate(process.argv[3]), packages: await packageAdmission() }))(), 15000);
    receipt = admission.candidate.receipt; provenance = admission.packages.provenance;
    engines[0] = await runEngine(admission.packages.chromium, admission.packages.baselinePath, FIXED.baseline);
    if (engines[0].failure === 'none' && performance.now() - start <= 115000) engines[1] = await runEngine(admission.packages.chromium, admission.candidate.executable, FIXED.version);
    else if (engines[0].failure === 'none') failure = 'deadline';
  } catch (error) { failure = PAIRED_FAILURE.has(error?.message) && error.message !== 'none' ? error.message : 'setup'; }
  if (performance.now() - start > 230000) failure = 'deadline';
  try {
    const output = pairedReport(provenance, receipt, engines, failure);
    await mkdir('test-results', { recursive: true });
    await writeFile('test-results/fixed-chromium-paired-probe.json', output.json, { encoding: 'utf8', flag: 'wx' });
    process.stdout.write(`fixed-chromium-paired-probe ${JSON.parse(output.json).result} ${Buffer.byteLength(output.json)}B\n`);
    if (output.exitCode) process.stderr.write('fixed-chromium-paired-probe unavailable\n');
    process.exitCode = output.exitCode;
  } catch { process.stderr.write('fixed-chromium-paired-probe write\n'); process.exitCode = 1; }
}
// PAIRED-ADDITION-END implementation
// PAIRED-ADDITION-BEGIN entry
const pairedEntry = process.argv[2] === '--paired-fixed-chromium' || process.argv[2] === '--acquire-fixed-chromium';
if (pairedEntry && process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await pairedMain();
// PAIRED-ADDITION-END entry
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url) /* PAIRED-EXPRESSION-BEGIN */ && !pairedEntry /* PAIRED-EXPRESSION-END */) await main();
