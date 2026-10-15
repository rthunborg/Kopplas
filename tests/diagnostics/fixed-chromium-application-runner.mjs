// Opt-in application verification. Importing starts no resources.
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, realpath, lstat } from 'node:fs/promises';
import { resolve, dirname, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn, execFile } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { admitCandidate, packageAdmission, validateReceipt } from './no-store-stream-probe.mjs';

export const PIN = '158.0.8104.0';
export const CONFIG = 'playwright.fixed-chromium-application.config.ts';
export const OUTPUT = 'test-results/fixed-chromium-application';
export const SOURCES = Object.freeze([CONFIG, 'tests/diagnostics/fixed-chromium-application-runner.mjs',
  'tests/diagnostics/fixed-chromium-owned-process.c',
  'tests/diagnostics/no-store-stream-probe.mjs', '.github/workflows/ci.yml', 'playwright.config.ts',
  'tests/e2e/scheduling-views.atdd.e2e.spec.ts', 'tests/e2e/support/scheduling-views-atdd.ts',
  '_bmad-output/implementation-artifacts/spec-15-1-the-five-scheduling-views-2.md',
  'package.json', 'pnpm-lock.yaml', '.nvmrc']);
export const VISUALS = Object.freeze(['desktop-schema-week', 'desktop-resources-week', 'desktop-team-week',
  'desktop-capacity-week', 'desktop-personal-calendar-week', 'phone-agenda', 'phone-capacity-summary',
  'phone-editor-draft', 'phone-editor-save-failure', 'phone-confirmed-retry', 'phone-long-multi-assignee-labels']);
const hash = data => createHash('sha256').update(data).digest('hex');
const hex = value => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
const integer = value => Number.isSafeInteger(value) && value >= 0;
const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const requireFact = (value, failure) => { if (!value) throw new Error(failure); };
const contained = (base, path) => { const rel = relative(base, path); return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel); };
const FAILURES = new Set(['none', 'setup', 'admission', 'compatibility', 'binding', 'suite', 'report', 'cleanup', 'write']);

export function checkApplicationArguments(runtime) {
  requireFact(runtime.platform === 'linux' && /^v22\.\d+\.\d+$/.test(runtime.version)
    && runtime.argv.length === 4 && runtime.argv[2] === '--verify-application' && typeof runtime.argv[3] === 'string'
    && runtime.argv[3].length > 0 && !/[\r\n\0]/.test(runtime.argv[3]) && runtime.env.CI === 'true'
    && runtime.env.SUPABASE_TEST_REQUIRED === '1' && !runtime.env.DEBUG && !runtime.env.PWDEBUG, 'setup');
}
export function checkPinnedCandidate(candidate) {
  requireFact(exact(candidate, ['executable', 'receipt']) && typeof candidate.executable === 'string', 'admission');
  validateReceipt(candidate.receipt);
  requireFact(candidate.receipt.zipSha256 === '6d15a1a00e6c8a97d04783ccb3ee0ec79ecf964dca75aff5ca8e39c3a270fa1b'
    && candidate.receipt.zipBytes === 202355055 && candidate.receipt.executable.bytes === 304586056
    && candidate.receipt.executable.sha256 === '831b57f57d85e72f5a633f4ab2974bdc7047739119838fd774cbf06b3fd907c6', 'admission');
}
export function checkSourceBindings(bindings) {
  requireFact(exact(bindings, SOURCES), 'binding');
  for (const value of Object.values(bindings)) requireFact(exact(value, ['bytes', 'sha256']) && integer(value.bytes) && value.bytes > 0 && hex(value.sha256), 'binding');
}
export function sealEnvironment(env, executable) {
  const child = { ...env, CI: 'true', KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE: 'verify-application', FIXED_CHROMIUM_EXECUTABLE: executable };
  // These external Playwright overrides may change report/config/selection authority.
  for (const name of Object.keys(child)) if (name.startsWith('PLAYWRIGHT_') || name.startsWith('PW_')) delete child[name];
  delete child.NODE_OPTIONS;
  return child;
}
export function validateProvenance(value) {
  requireFact(exact(value, ['schemaVersion', 'mode', 'executionSha', 'sourceTree', 'sources', 'packages', 'acquisition',
    'compatibility', 'cli', 'report', 'population', 'visuals', 'failure', 'nativeActions']), 'binding');
  requireFact(value.schemaVersion === 1 && value.mode === 'isolated-full158-application'
    && /^[0-9a-f]{40}$/.test(value.executionSha) && /^[0-9a-f]{40}$/.test(value.sourceTree)
    && FAILURES.has(value.failure), 'binding');
  checkSourceBindings(value.sources);
  requireFact(exact(value.packages, ['node', 'sdk', 'testManifestSha256', 'playwrightManifestSha256', 'coreManifestSha256'])
    && /^v22\.\d+\.\d+$/.test(value.packages.node) && value.packages.sdk === '1.61.1'
    && ['testManifestSha256', 'playwrightManifestSha256', 'coreManifestSha256'].every(k => hex(value.packages[k])), 'binding');
  if (value.acquisition !== null) validateReceipt(value.acquisition);
  if (value.compatibility !== null) requireFact(exact(value.compatibility, ['version', 'closed']) && value.compatibility.version === PIN && value.compatibility.closed === true, 'compatibility');
  requireFact(exact(value.cli, ['state', 'nativeExit', 'signal']) && ['not-executed', 'completed', 'failed', 'aborted'].includes(value.cli.state)
    && (value.cli.nativeExit === null || (integer(value.cli.nativeExit) && value.cli.nativeExit <= 255))
    && [null, 'SIGINT', 'SIGTERM', 'SIGKILL', 'other'].includes(value.cli.signal), 'binding');
  requireFact((value.cli.state === 'not-executed' && value.cli.nativeExit === null && value.cli.signal === null)
    || (value.cli.state === 'completed' && value.cli.nativeExit === 0 && value.cli.signal === null)
    || (value.cli.state === 'failed' && value.cli.nativeExit > 0 && value.cli.signal === null)
    || (value.cli.state === 'aborted' && value.cli.nativeExit === null && value.cli.signal !== null), 'binding');
  if (value.report !== null) requireFact(exact(value.report, ['bytes', 'sha256']) && integer(value.report.bytes) && value.report.bytes > 0 && hex(value.report.sha256), 'report');
  if (value.population !== null) requireFact(exact(value.population, ['titles', 'attempts', 'passed', 'failed', 'skipped', 'flaky', 'schedulingTitles', 'schedulingPassed', 'schedulingSkipped', 'attemptMs'])
    && Object.values(value.population).every(integer), 'report');
  requireFact(Array.isArray(value.visuals) && value.visuals.length <= 11 && new Set(value.visuals.map(v => v.name)).size === value.visuals.length, 'report');
  for (const visual of value.visuals) requireFact(exact(visual, ['name', 'bytes', 'sha256']) && VISUALS.includes(visual.name) && integer(visual.bytes) && visual.bytes > 8 && hex(visual.sha256), 'report');
  requireFact(exact(value.nativeActions, ['compatibilityLaunches', 'applicationInvocations'])
    && [0, 1].includes(value.nativeActions.compatibilityLaunches) && [0, 1].includes(value.nativeActions.applicationInvocations), 'binding');
  if (value.failure === 'none') requireFact(value.acquisition !== null && value.compatibility !== null && value.cli.state === 'completed'
    && value.report !== null && value.population?.titles === 382 && value.population.failed === 0 && value.population.flaky === 0
    && value.population.schedulingTitles === 18 && value.population.schedulingPassed === 18 && value.population.schedulingSkipped === 0
    && value.visuals.length === 11 && value.nativeActions.applicationInvocations === 1 && value.nativeActions.compatibilityLaunches === 1, 'report');
  requireFact(Buffer.byteLength(JSON.stringify(value)) <= 8192, 'binding');
  return value;
}

/** Read original JSON without rewriting/filtering any response/test evidence. */
export async function inspectReport(bytes, readAttachment) {
  requireFact(Buffer.isBuffer(bytes) && bytes.length > 0 && bytes.length <= 67108864, 'report');
  const report = JSON.parse(bytes.toString('utf8'));
  requireFact(report && Array.isArray(report.suites) && Array.isArray(report.errors) && report.errors.length === 0 && report.stats, 'report');
  const counts = { titles: 0, attempts: 0, passed: 0, failed: 0, skipped: 0, flaky: 0,
    schedulingTitles: 0, schedulingPassed: 0, schedulingSkipped: 0, attemptMs: 0 };
  const ids = new Set(), visuals = new Map();
  const walk = async suites => {
    for (const suite of suites) {
      requireFact(suite && Array.isArray(suite.specs ?? []) && Array.isArray(suite.suites ?? []), 'report');
      for (const spec of suite.specs ?? []) {
        requireFact(typeof spec.id === 'string' && typeof spec.file === 'string' && Array.isArray(spec.tests) && spec.tests.length > 0, 'report');
        for (const test of spec.tests) {
          const id = `${spec.id}:${test.projectId}`;
          requireFact(!ids.has(id) && test.projectName === 'chromium' && typeof test.projectId === 'string'
            && ['expected', 'unexpected', 'skipped', 'flaky'].includes(test.status)
            && Array.isArray(test.results) && test.results.length > 0 && test.results.length <= 2, 'report');
          ids.add(id); counts.titles++;
          const scheduling = spec.file.replaceAll('\\', '/').endsWith('scheduling-views.atdd.e2e.spec.ts');
          if (scheduling) { counts.schedulingTitles++; if (test.status === 'expected') counts.schedulingPassed++; if (test.status === 'skipped') counts.schedulingSkipped++; }
          if (test.status === 'flaky') counts.flaky++;
          for (const result of test.results) {
            requireFact(['passed', 'failed', 'timedOut', 'skipped', 'interrupted'].includes(result.status)
              && integer(result.retry) && result.retry <= 1 && integer(result.duration), 'report');
            counts.attemptMs += result.duration;
            if (result.status === 'skipped') { counts.skipped++; continue; }
            counts.attempts++; if (result.status === 'passed') counts.passed++; else counts.failed++;
            if (scheduling && result.status === 'passed') for (const attachment of result.attachments ?? []) {
              if (!VISUALS.includes(attachment.name)) continue;
              requireFact(attachment.contentType === 'image/png', 'report');
              const png = typeof attachment.body === 'string' ? Buffer.from(attachment.body, 'base64') : await readAttachment(attachment.path);
              requireFact(Buffer.isBuffer(png) && png.length > 8 && png.length <= 10485760 && png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'report');
              visuals.set(attachment.name, { name: attachment.name, bytes: png.length, sha256: hash(png) });
            }
          }
        }
      }
      await walk(suite.suites ?? []);
    }
  };
  await walk(report.suites);
  const testRows = [];
  const flatten = suites => { for (const suite of suites) { for (const spec of suite.specs ?? []) testRows.push(...spec.tests); flatten(suite.suites ?? []); } };
  flatten(report.suites);
  for (const [name, status] of [['expected', 'expected'], ['unexpected', 'unexpected'], ['skipped', 'skipped'], ['flaky', 'flaky']]) {
    requireFact(integer(report.stats[name]) && report.stats[name] === testRows.filter(t => t.status === status).length, 'report');
  }
  requireFact(counts.attemptMs <= 800000, 'report');
  return { population: counts, visuals: VISUALS.filter(name => visuals.has(name)).map(name => visuals.get(name)) };
}

/** Invoked only inside the admitted broker-owned compatibility leaf. */
export async function runCompatibility(path, actions) {
  const io = actions ?? { admitCandidate, packageAdmission };
  const candidate = await io.admitCandidate(path); checkPinnedCandidate(candidate);
  const packages = await io.packageAdmission();
  let browser;
  try {
    browser = await packages.chromium.launch({ executablePath: candidate.executable, channel: 'chromium', headless: true, timeout: 15000 });
    requireFact(browser.version() === PIN, 'compatibility');
    await browser.close(); browser = null;
    return { version: PIN, closed: true };
  } finally { if (browser) await browser.close(); }
}

export async function bounded(task, milliseconds) {
  let timer;
  try { return await Promise.race([task, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('admission')), milliseconds); })]); }
  finally { clearTimeout(timer); }
}

/** Resource-free process adapter. Production ownership is the root broker below.
 * A group signal is never a whole-tree proof: adapters must supply owned-tree
 * kill and independent leader/tree confirmation, including the SDK's detached PG. */
export async function runOwnedChild(io, argv, env, milliseconds, capture = false) {
  requireFact(typeof io.killOwnedTree === 'function' && typeof io.confirmOwnedCleanup === 'function', 'cleanup');
  const child = io.spawn(argv, env, capture);
  let closed = false, treeConfirmed = false, expired = false, output = '', overflow = false;
  const timers = [];
  const later = (callback, delay) => { const id = io.setTimeout(callback, delay); timers.push(id); return id; };
  let rejectCleanup;
  const cleanupFailure = new Promise((_, no) => { rejectCleanup = no; });
  let refused = false;
  const stop = () => { if (!closed && !refused) {
    refused = true; expired = true;
    try { io.killGroup(child, 'SIGTERM'); } catch { rejectCleanup(new Error('cleanup')); }
    later(() => { if (!treeConfirmed) { try { io.killOwnedTree(child, 'SIGKILL'); } catch { rejectCleanup(new Error('cleanup')); } } }, 1000);
    later(() => { if (!treeConfirmed) rejectCleanup(new Error('cleanup')); }, 2000);
  } };
  io.onSignal(stop);
  const ending = new Promise((yes, no) => {
    child.once('error', () => no(new Error('cleanup')));
    child.once('close', (code, signal) => { closed = true; yes({ code, signal, expired, output, overflow }); });
    if (capture) child.stdout?.on('data', chunk => { if (output.length + chunk.length > 256) { overflow = true; stop(); } else output += chunk.toString('utf8'); });
  });
  try {
    later(stop, milliseconds);
    const result = await Promise.race([ending, cleanupFailure]);
    if (!refused) later(() => rejectCleanup(new Error('cleanup')), 2000);
    const proof = await Promise.race([io.confirmOwnedCleanup(child), cleanupFailure]);
    requireFact(proof?.leaderReaped === true && proof?.sameLeafEmpty === true && proof?.forcedResidue !== true, 'cleanup');
    treeConfirmed = true;
    return result;
  } finally {
    timers.forEach(id => io.clearTimeout(id)); io.offSignal(stop);
    if (!treeConfirmed) io.killOwnedTree(child, 'SIGKILL');
  }
}

// CAPABILITY-DIAGNOSTIC-BEGIN: data only; no native action or output on import.
export const CAPABILITY_STAGES = Object.freeze(['entry','host-preflight','owner-start','owner-ready','capsule-request',
  'capsule-result','ownership-finish','receipt-directory','receipt-write','terminal']);
export const CAPABILITY_REASONS = Object.freeze(['unknown','precondition-rejected','filesystem-read-failed','owner-start-failed',
  'owner-transport-failed','owner-ready-timeout','control-invalid','capsule-request-failed','capsule-timeout',
  'capsule-result-rejected','ownership-unconfirmed','ownership-finish-failed','receipt-directory-failed','receipt-write-failed',
  'cancelled','lifetime-refused']);
export const CAPSULE_PREDICATE_REASONS = Object.freeze(['capsule-expiration-rejected','capsule-confirmation-rejected','capsule-reap-rejected','capsule-leaf-rejected','capsule-residue-rejected','capsule-json-rejected','capsule-shape-rejected','capsule-node-rejected','capsule-uid-rejected','capsule-gid-rejected','capsule-groups-shape-rejected','capsule-groups-count-rejected','capsule-groups-id-rejected','capsule-detachment-rejected','capsule-status-rejected','capsule-no-new-privileges-rejected','capsule-cap-inheritable-rejected','capsule-cap-permitted-rejected','capsule-cap-effective-rejected','capsule-cap-bounding-rejected','capsule-cap-ambient-rejected']);
const CAPABILITY_KEYS = ['schemaVersion','kind','mode','outcome','stage','reason','exitCode','nativeSource','nativeCode','nativeSignal','ownerEvidence'];
export function encodeCapabilityFailure(value) {
  requireFact(exact(value,CAPABILITY_KEYS) && value.schemaVersion === 1 && value.kind === 'fixed-chromium-capability-failure'
    && value.mode === 'capability' && value.outcome === 'failed' && value.exitCode === 1
    && CAPABILITY_STAGES.includes(value.stage) && (CAPABILITY_REASONS.includes(value.reason)
      || (CAPSULE_PREDICATE_REASONS.includes(value.reason) && value.nativeSource==='capsule-result' && value.nativeCode===125))
    && ['unavailable','owner-transport','capsule-result'].includes(value.nativeSource)
    && (value.nativeCode === null || (integer(value.nativeCode) && value.nativeCode <= 255))
    && [null,'SIGINT','SIGTERM','SIGKILL','other'].includes(value.nativeSignal)
    && ['unavailable','partial','protocol-confirmed'].includes(value.ownerEvidence)
    && (value.nativeSource !== 'unavailable' || (value.nativeCode === null && value.nativeSignal === null)), 'admission');
  const line = JSON.stringify(Object.fromEntries(CAPABILITY_KEYS.map(key => [key,value[key]]))) + '\n';
  requireFact(Buffer.byteLength(line) <= 768, 'admission'); return line;
}
// CAPSULE-DETAIL-BEGIN: reported data, never an authority/success channel.
export const CAPSULE_BOUNDARIES = Object.freeze(['unknown','stdin-open','stdin-dup','stdout-dup','no-new-privileges','securebits','ambient-clear','bounding-read','bounding-drop','bounding-limit','groups-drop','gid-drop','uid-drop','capset','uid-check','euid-check','gid-check','egid-check','groups-check','no-new-privileges-check','workload-chdir','fd-close-range','node-directory-format','node-path-length','environment-clear','env-home','env-path','env-ci','env-db-required','env-runtime-temp','env-browser-path','env-app-mode','env-attestation-key','env-attestation-secret','node-exec']);
export function peekCapsuleDetail(value) {
  const unknown = Object.freeze({schemaVersion:1,kind:'fixed-chromium-capsule-native-detail',stage:'unknown',errno:null});
  if (value?.code !== 125 || typeof value.output !== 'string' || Buffer.byteLength(value.output)>192) return unknown;
  try {
    const marker=JSON.parse(value.output);
    if (!exact(marker,['schemaVersion','kind','stage','errno']) || marker.schemaVersion!==1 || marker.kind!=='owned-capsule-refusal'
      || !CAPSULE_BOUNDARIES.includes(marker.stage) || !(marker.errno===null || (integer(marker.errno) && marker.errno>0 && marker.errno<=2147483647))) return unknown;
    return Object.freeze({schemaVersion:1,kind:'fixed-chromium-capsule-native-detail',stage:marker.stage,errno:marker.errno});
  } catch { return unknown; }
}
export function encodeCapsuleDetail(value) {
  requireFact(exact(value,['schemaVersion','kind','stage','errno']) && value.schemaVersion===1 && value.kind==='fixed-chromium-capsule-native-detail'
    && CAPSULE_BOUNDARIES.includes(value.stage) && (value.errno===null || (integer(value.errno) && value.errno>0 && value.errno<=2147483647)), 'admission');
  return JSON.stringify({schemaVersion:1,kind:value.kind,stage:value.stage,errno:value.errno})+'\n';
}
// CAPSULE-DETAIL-END
export function createCapabilityDiagnostic() {
  let stage = 'entry', evidence = 'unavailable', frozen, latestNative = {}, candidateDetail, frozenDetail;
  return {
    enter(value) { if (!frozen && CAPABILITY_STAGES.includes(value)) stage = value; },
    evidence(value) { if (!frozen && ['partial','protocol-confirmed'].includes(value)) evidence = value; },
    native(value) { if (!frozen) latestNative = value; },
    detail(value) { if (!frozen) candidateDetail = peekCapsuleDetail(value); },
    frozenDetail() { return frozenDetail; },
    freeze(reason = 'unknown', native = latestNative) {
      if (!frozen) frozen = Object.freeze({schemaVersion:1,kind:'fixed-chromium-capability-failure',mode:'capability',outcome:'failed',
        stage,reason:CAPABILITY_REASONS.includes(reason) || CAPSULE_PREDICATE_REASONS.includes(reason) ? reason : 'unknown',exitCode:1,
        nativeSource:['owner-transport','capsule-result'].includes(native.source) ? native.source : 'unavailable',
        nativeCode:integer(native.code) && native.code <= 255 ? native.code : null,
        nativeSignal:native.signal === 0 || native.signal == null ? null : native.signal === 2 || native.signal === 'SIGINT' ? 'SIGINT'
          : native.signal === 9 || native.signal === 'SIGKILL' ? 'SIGKILL' : native.signal === 15 || native.signal === 'SIGTERM' ? 'SIGTERM' : 'other',
        ownerEvidence:evidence});
      if (frozenDetail===undefined && frozen.nativeSource==='capsule-result' && frozen.nativeCode===125) frozenDetail=candidateDetail ?? peekCapsuleDetail(null);
      return frozen;
    },
  };
}
export function publishCapabilityFailure(record, host, detail) {
  let committed = false, stdoutAttempted = false, stderrAttempted = false;
  let bundle = 'fixed-chromium-application unavailable\n';
  try {
    const extra=record.nativeSource==='capsule-result' && record.nativeCode===125 && detail ? encodeCapsuleDetail(detail) : '';
    const value=encodeCapabilityFailure(record)+extra+bundle; requireFact(Buffer.byteLength(value)<=816,'admission'); bundle=value;
  } catch { /* no fabricated diagnostic */ }
  const fallback = () => { if (!committed && !stderrAttempted) attempt(host.stderr,false); };
  function attempt(stream, primary) {
    if (committed || (primary ? stdoutAttempted : stderrAttempted)) return;
    if (primary) stdoutAttempted = true; else stderrAttempted = true;
    const failed = () => { if (primary) fallback(); }; // inert error absorption survives until exit
    try { stream.on('error',failed); stream.write(bundle,error => { if (error) failed(); }); }
    catch { failed(); }
  }
  return { attempt() { attempt(host.stdout,true); }, commit() { committed = true; } };
}
export async function runCapabilityEntry(factory = productionRuntime, host = process) {
  const diagnostic = createCapabilityDiagnostic(); let io;
  try {
    io = factory(); io.enableCapabilityDiagnostic(diagnostic);
    await io.capability(); return {failure:'none',exitCode:0};
  } catch {
    const record = diagnostic.freeze(); host.exitCode = 1;
    try { await io?.finishOwnership(); await io?.failureCompletion(); }
    catch { /* existing unconfirmed failure stays failure; no raw diagnostic */ }
    const publisher = publishCapabilityFailure(record,host,diagnostic.frozenDetail());
    try { publisher.attempt(); }
    finally { publisher.commit(); host.exit(1); }
    return {failure:'admission',exitCode:1}; // only reachable in an invalid nonterminating host mock
  }
}
// CAPABILITY-DIAGNOSTIC-END

/** Exact fixed-mode transport. stdout is owned by the reviewed root broker;
 * native workload stdout is never connected to this authentication channel. */
export function createHostedOwner(io, authority) {
  requireFact(exact(authority, ['generation', 'source', 'unit']) && /^[a-f0-9-]{36}$/.test(authority.generation)
    && hex(authority.source) && authority.unit === `kopplas-fixed-${authority.generation}.service`, 'admission');
  const child = io.start(authority);
  const diagnostic = io.capabilityDiagnostic;
  let resolveFailure;
  const failureCompletion = new Promise(resolve => { resolveFailure = resolve; });
  let buffer = '', ready = false, refused = false, stage = null, last = null, completed = false;
  let resolveReady, rejectReady;
  const startup = new Promise((yes, no) => { resolveReady = yes; rejectReady = no; });
  let startupTimer = io.setTimeout(() => refuse('admission','owner-ready-timeout'), 15000), refusalTimer;
  function refuse(reason = 'cleanup', observed = 'ownership-unconfirmed', native) {
    if (refused || completed) return;
    diagnostic?.freeze(observed,native);
    refused = true;
    try { child.stdin.write('STOP\n'); child.stdin.end(); } catch { /* journal/provider remains owner */ }
    rejectReady(new Error(reason));
    // Root owner independently handles EOF/force. Client never kills the owner.
    refusalTimer = io.setTimeout(() => {
      if (stage) io.clearTimeout(stage.timer);
      stage?.no(new Error('cleanup')); stage = null;
      if (startupTimer) io.clearTimeout(startupTimer);
      io.offSignal(refuse);
      try {
        io.handoff(authority); // exact previously registered unit only; request != proof
        child.stdout.destroy?.(); child.stdin.destroy?.(); child.unref?.();
      } catch (error) { if (!diagnostic) throw error; }
      finally { resolveFailure(); }
    }, 2000);
  }
  function receive(line) {
    let value; try { value = JSON.parse(line); } catch { refuse('cleanup','control-invalid'); return; }
    if (value.generation !== authority.generation || refused) return;
    if (value.event === 'ready') {
      if (ready || !exact(value, ['event','generation','source','unit','durable','workloads'])
        || value.source !== authority.source || value.unit !== authority.unit || value.durable !== true || value.workloads !== 0) { refuse('cleanup','control-invalid'); return; }
      diagnostic?.evidence('partial');
      ready = true; io.clearTimeout(startupTimer); startupTimer = null; resolveReady(); return;
    }
    if (value.event !== 'stage' || !ready || !stage || !exact(value,
      ['event','generation','stage','code','signal','expired','reaped','empty','confirmed','residue','output'])
      || value.stage !== stage.name || !Number.isInteger(value.code) || value.code < -1 || value.code > 255
      || !integer(value.signal) || typeof value.output !== 'string' || Buffer.byteLength(value.output) > 16384
      || ['expired','reaped','empty','confirmed','residue'].some(key => typeof value[key] !== 'boolean')) { refuse('cleanup','control-invalid'); return; }
    const pending = stage; stage = null; last = value;
    io.clearTimeout(pending.timer);
    if (!value.confirmed || !value.reaped || !value.empty || value.residue) {
      const failure = Object.assign(new Error('cleanup'), { nativeCode:value.code, nativeSignal:value.signal });
      diagnostic?.freeze('ownership-unconfirmed',{source:'capsule-result',code:value.code,signal:value.signal});
      pending.no(failure); refuse();
    }
    else { diagnostic?.evidence('protocol-confirmed'); pending.yes(value); }
  }
  child.stdout.on('data', chunk => {
    if (refused || completed) return;
    buffer += chunk.toString('utf8');
    if (Buffer.byteLength(buffer) > 32768) { refuse('cleanup','control-invalid'); return; }
    let at; while ((at = buffer.indexOf('\n')) >= 0) { const line = buffer.slice(0, at); buffer = buffer.slice(at + 1); receive(line); }
  });
  child.once('error', () => refuse('cleanup','owner-transport-failed'));
  child.stdin.on?.('error', () => refuse('cleanup','owner-transport-failed')); child.stdout.on('error', () => refuse('cleanup','owner-transport-failed'));
  child.once('close', (code,signal) => { if (!completed) refuse('cleanup','owner-transport-failed',{source:'owner-transport',code,signal}); });
  io.onSignal(refuse);
  return {
    ready: startup,
    failureCompletion: () => completed ? Promise.resolve() : failureCompletion,
    async run(name) {
      await startup;
      requireFact(!refused && !completed && !stage && ['compatibility','application','capsule'].includes(name), 'cleanup');
      if (name === 'application') requireFact(last?.stage === 'compatibility' && last.code === 0 && !last.expired, 'compatibility');
      if (name === 'compatibility' || name === 'capsule') requireFact(last === null, 'cleanup');
      return new Promise((yes, no) => {
        stage = { name, yes, no, timer:io.setTimeout(() => refuse('cleanup',name === 'capsule' ? 'capsule-timeout' : 'ownership-unconfirmed'),name === 'application' ? 1500000 : name === 'capsule' ? 4000 : 15000) };
        try { child.stdin.write(`${name === 'capsule' ? 'CAPABILITY' : name.toUpperCase()}\n`); }
        catch (error) { diagnostic?.freeze('capsule-request-failed'); throw error; }
      });
    },
    cancel: refuse,
    async finish() {
      requireFact(!refused && !stage && last?.confirmed === true, 'cleanup');
      completed = true; child.stdin.write('FINISH\n'); child.stdin.end();
      io.offSignal(refuse); if (startupTimer) io.clearTimeout(startupTimer); if (refusalTimer) io.clearTimeout(refusalTimer);
    },
  };
}

function productionRuntime() {
  const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const signals = ['SIGINT', 'SIGTERM'];
  // A generation is revocable before an owner exists, including pending I/O.
  let owner, admission, refused = false, diagnostic;
  const enter = value => diagnostic?.enter(value);
  const fact = (value,failure,reason = 'precondition-rejected') => { if (!value) diagnostic?.freeze(reason); requireFact(value,failure); };
  const observed = async (task,reason) => { try { return await task; } catch (error) { diagnostic?.freeze(reason); throw error; } };
  const callbacks = new Set();
  let rejectRefusal;
  const revocation = new Promise((_, reject) => { rejectRefusal = reject; });
  // A signal can arrive before the first await attaches its race.
  revocation.catch(() => {});
  const active = () => requireFact(!refused, 'admission');
  const until = async task => { active(); const value = await Promise.race([task, revocation]); active(); return value; };
  const refuse = (reason = 'cancelled') => {
    if (refused) return;
    diagnostic?.freeze(reason);
    refused = true; rejectRefusal(new Error(owner ? 'cleanup' : 'admission')); owner?.cancel();
    for (const callback of callbacks) callback();
  };
  const release = () => { signals.forEach(signal => process.off(signal, refuse)); };
  signals.forEach(signal => process.on(signal, refuse));
  const io = { platform: process.platform, version: process.version, argv: process.argv, env: process.env,
    admitCandidate, packageAdmission,
    bounded: async (task, milliseconds) => { try { const result = await bounded(until(task), milliseconds); active(); return result; }
      catch (error) { refuse('lifetime-refused'); throw error; } },
    checkActive: active, awaitActive: until, releaseLifetime: release, now: () => performance.now(),
    async bindings() { const entries = await Promise.all(SOURCES.map(async path => { const data = await readFile(join(repo, path)); return [path, { bytes: data.length, sha256: hash(data) }]; })); return Object.fromEntries(entries); },
    async gitIdentity() { const command = args => { active(); return new Promise((yes, no) => execFile('git', ['-C', repo, ...args], { timeout: 5000, maxBuffer: 256, windowsHide: true }, (error, stdout) => error ? no(new Error('binding')) : yes(stdout.trim()))); };
      requireFact(await command(['status', '--porcelain', '--untracked-files=normal']) === '', 'binding');
      return { executionSha: await command(['rev-parse', 'HEAD']), sourceTree: await command(['rev-parse', 'HEAD^{tree}']) }; },
    async cliPath() { const require = createRequire(import.meta.url); const manifest = require.resolve('@playwright/test/package.json'); const data = JSON.parse(await readFile(manifest, 'utf8'));
      requireFact(data.version === '1.61.1' && data.bin?.playwright === 'cli.js', 'admission'); return join(dirname(manifest), 'cli.js'); },
    async freshOutput() { active(); const base = await realpath(repo); active(); const parent = join(base, 'test-results'); await mkdir(parent, { recursive: true }); active(); requireFact(await realpath(parent) === parent && !(await lstat(parent)).isSymbolicLink(), 'write'); active();
      const out = join(parent, 'fixed-chromium-application'); await mkdir(out); active(); requireFact(await realpath(out) === out && !(await lstat(out)).isSymbolicLink(), 'write'); },
    async readReport() { return readFile(join(workloadRepo(), OUTPUT, 'general-browser.json')); },
    async readAttachment(path) { requireFact(typeof path === 'string', 'report'); const base = await realpath(join(workloadRepo(), OUTPUT, 'results')); const target = await realpath(resolve(workloadRepo(), path)); requireFact(contained(base, target) && !(await lstat(target)).isSymbolicLink(), 'report'); return readFile(target); },
    async writeProvenance(value) { const text = JSON.stringify(validateProvenance(value)); await writeFile(join(repo, OUTPUT, 'provenance.json'), text, { flag: 'wx', mode: 0o600 }); },
    setTimeout, clearTimeout,
    onSignal(callback) { callbacks.add(callback); },
    offSignal(callback) { callbacks.delete(callback); },
  };
  function workloadRepo() {
    const root = io.env.FIXED_CHROMIUM_BROKER_ROOT, path = io.env.FIXED_CHROMIUM_WORKLOAD_REPO;
    requireFact(typeof root === 'string' && isAbsolute(root) && path === join(root, 'workload'), 'admission'); return path;
  }
  async function startOwner() {
    enter('host-preflight'); active();
    fact(io.platform === 'linux' && io.version === 'v22.23.3' && io.env.GITHUB_SHA === io.env.FIXED_CHROMIUM_HOSTED_ADMISSION_SHA
      && /^[a-f0-9]{40}$/.test(io.env.GITHUB_SHA ?? '') && ['capability','application'].includes(io.env.FIXED_CHROMIUM_HOSTED_ADMISSION), 'admission');
    const root = io.env.FIXED_CHROMIUM_BROKER_ROOT; workloadRepo();
    const st = await observed(until(lstat(root)),'filesystem-read-failed');
    const binary = join(root, 'broker'), bs = await observed(until(lstat(binary)),'filesystem-read-failed');
    fact(!st.isSymbolicLink() && st.isDirectory() && st.uid === 0 && (st.mode & 0o777) === 0o711
      && !bs.isSymbolicLink() && bs.isFile() && bs.uid === 0 && (bs.mode & 0o777) === 0o700, 'admission');
    const authority = { generation: io.env.FIXED_CHROMIUM_BROKER_GENERATION, source: io.env.FIXED_CHROMIUM_BROKER_SOURCE_SHA256, unit: io.env.FIXED_CHROMIUM_BROKER_UNIT };
    enter('owner-start');
    try { owner = createHostedOwner({ ...io,
      start: () => spawn('/usr/bin/sudo', ['-n','/usr/bin/systemd-run',`--unit=${authority.unit}`,'--service-type=exec','--quiet','--pipe','--wait',
        '--property=User=root','--property=Delegate=','--property=DelegateSubgroup=broker','--property=NoNewPrivileges=yes',
        '--property=CapabilityBoundingSet=CAP_CHOWN CAP_DAC_OVERRIDE CAP_FOWNER CAP_SETUID CAP_SETGID CAP_SETPCAP CAP_KILL',
        '--property=AmbientCapabilities=','--property=RuntimeMaxSec=1502','--property=TimeoutStopSec=2','--property=KillMode=control-group',
        binary,'--admitted-session',join(root,'control','session')], { cwd: repo, env: { PATH: '/usr/bin:/bin' }, stdio: ['pipe','pipe','inherit'] }),
      handoff: value => { const stop = spawn('/usr/bin/sudo', ['-n','/usr/bin/systemctl','--no-block','stop',value.unit],
        { env: { PATH:'/usr/bin:/bin' }, stdio:'ignore' }); stop.on('error', () => {}); stop.unref(); },
    }, authority); } catch (error) { diagnostic?.freeze('owner-start-failed'); throw error; }
    enter('owner-ready');
    owner.ready.catch(() => {});
    if (refused) owner.cancel();
    await until(owner.ready); return owner;
  }
  async function ownedAdmission() {
    if (!admission) admission = (async () => {
      requireFact(io.env.FIXED_CHROMIUM_HOSTED_ADMISSION === 'application', 'admission');
      active(); const control = await startOwner(); active();
      const result = await control.run('compatibility'); active();
      requireFact(result.code === 0 && result.signal === 0 && !result.expired, 'compatibility');
      const value = JSON.parse(result.output);
      requireFact(exact(value,['candidate','packages','compatibility']), 'admission'); checkPinnedCandidate(value.candidate);
      requireFact(value.packages.node === 'v22.23.3' && value.packages.sdk === '1.61.1', 'admission');
      return value;
    })();
    return admission;
  }
  io.admitCandidate = async path => {
    active(); const value = await ownedAdmission(); active();
    requireFact(path === io.argv[3] || path === value.candidate.executable, 'binding');
    // The version was executed in the retained owned leaf. Revalidation binds
    // unchanged acquired bytes, never another unmanaged --version process.
    for (const target of [io.argv[3], value.candidate.executable]) {
      requireFact(!(await lstat(target)).isSymbolicLink(), 'binding'); active();
      const bytes = await readFile(target); active(); requireFact(bytes.length === value.candidate.receipt.executable.bytes
        && hash(bytes) === value.candidate.receipt.executable.sha256, 'binding');
    }
    return value.candidate;
  };
  io.packageAdmission = async () => { active(); const value = await ownedAdmission(); active(); return { provenance: value.packages }; };
  io.compatibility = async () => { active(); const value = await ownedAdmission(); active(); return value.compatibility; };
  io.application = async (path, env, cli) => {
    active();
    requireFact(path === CONFIG && cli.endsWith('/cli.js') && env.CI === 'true', 'binding');
    const result = await owner.run('application');
    active(); await owner.finish(); active();
    return { code: result.code < 0 ? null : result.code, signal: result.signal === 0 ? null : result.signal === 9 ? 'SIGKILL' : result.signal === 15 ? 'SIGTERM' : 'other', expired: result.expired };
  };
  io.enableCapabilityDiagnostic = value => { diagnostic = value; io.capabilityDiagnostic = value; };
  io.failureCompletion = () => owner ? owner.failureCompletion() : Promise.resolve();
  io.finishOwnership = async () => { refuse('lifetime-refused'); release(); };
  io.capability = async () => {
    try {
    enter('host-preflight'); active();
    fact(io.env.FIXED_CHROMIUM_HOSTED_ADMISSION === 'capability', 'admission');
    const control = await startOwner(); active();
    enter('capsule-request');
    const value = await control.run('capsule'); active();
    enter('capsule-result');
    diagnostic?.native({source:'capsule-result',code:value.code,signal:value.signal});
    diagnostic?.detail(value); // peek only; freeze remains at the original first failed predicate
    const predicate = reason => value.code===125 ? reason : 'capsule-result-rejected';
    fact(value.expired,'cleanup',predicate('capsule-expiration-rejected'));
    fact(value.confirmed,'cleanup',predicate('capsule-confirmation-rejected'));
    fact(value.reaped,'cleanup',predicate('capsule-reap-rejected'));
    fact(value.empty,'cleanup',predicate('capsule-leaf-rejected'));
    fact(!value.residue,'cleanup',predicate('capsule-residue-rejected'));
    let actual; try { actual = JSON.parse(value.output); } catch (error) { diagnostic?.freeze(predicate('capsule-json-rejected')); throw error; }
    let node;
    try { node=actual.node; } catch (error) { diagnostic?.freeze(value.code===125 ? 'capsule-shape-rejected' : 'unknown'); throw error; }
    fact(node==='v22.23.3','admission',predicate('capsule-node-rejected'));
    fact(integer(actual.uid) && actual.uid>0,'admission',predicate('capsule-uid-rejected'));
    fact(integer(actual.gid) && actual.gid>0,'admission',predicate('capsule-gid-rejected'));
    fact(Array.isArray(actual.groups),'admission',predicate('capsule-groups-shape-rejected'));
    fact(actual.groups.length<=1,'admission',predicate('capsule-groups-count-rejected'));
    fact(actual.groups.every(gid=>gid===actual.gid),'admission',predicate('capsule-groups-id-rejected'));
    fact(actual.detached===true,'admission',predicate('capsule-detachment-rejected'));
    fact(typeof actual.status==='string','admission',predicate('capsule-status-rejected'));
    fact(/^NoNewPrivs:\s+1$/m.test(actual.status),'admission',predicate('capsule-no-new-privileges-rejected'));
    for(const [key,reason] of [['CapInh','capsule-cap-inheritable-rejected'],['CapPrm','capsule-cap-permitted-rejected'],
      ['CapEff','capsule-cap-effective-rejected'],['CapBnd','capsule-cap-bounding-rejected'],['CapAmb','capsule-cap-ambient-rejected']])
      fact(new RegExp(`^${key}:\\s+0+$`,'m').test(actual.status),'admission',predicate(reason));
    enter('ownership-finish');
    await observed(control.finish(),'ownership-finish-failed'); active();
    const receipt = { schemaVersion:1, capabilityOnly:true, source:io.env.FIXED_CHROMIUM_BROKER_SOURCE_SHA256,
      detachedDescendant:true, droppedAuthority:true, leaderReaped:true, sameLeafEmpty:true };
    enter('receipt-directory');
    await observed(until(mkdir(join(repo,'test-results'),{recursive:true})),'receipt-directory-failed'); active();
    enter('receipt-write');
    await observed(until(writeFile(join(repo,'test-results','fixed-chromium-hosted-capability.json'),JSON.stringify(receipt),{flag:'wx',mode:0o600})),'receipt-write-failed');
    return receipt;
    } catch (error) { diagnostic?.freeze(); refuse('lifetime-refused'); throw error; }
    finally { release(); }
  };
  return io;
}

export async function runApplication(io = productionRuntime()) {
  let record, candidate, packages, outputReady = false, failure = 'setup';
  const nativeActions = { compatibilityLaunches: 0, applicationInvocations: 0 };
  const active = () => io.checkActive?.();
  const until = task => io.awaitActive ? io.awaitActive(task) : task;
  try {
    active();
    checkApplicationArguments(io);
    const identity = await until(io.gitIdentity()); active();
    const sources = await until(io.bindings()); active(); checkSourceBindings(sources);
    requireFact(/^[0-9a-f]{40}$/.test(identity.executionSha) && /^[0-9a-f]{40}$/.test(identity.sourceTree), 'binding');
    await until(io.freshOutput()); active(); outputReady = true;
    failure = 'admission';
    const admission = await io.bounded(Promise.all([io.admitCandidate(io.argv[3]), io.packageAdmission()]), 15000);
    active(); [candidate, packages] = admission; checkPinnedCandidate(candidate);
    requireFact(packages.provenance.sdk === '1.61.1' && /^v22\.\d+\.\d+$/.test(packages.provenance.node)
      && ['testManifestSha256', 'playwrightManifestSha256', 'coreManifestSha256'].every(k => hex(packages.provenance[k])), 'admission');
    record = { schemaVersion: 1, mode: 'isolated-full158-application', ...identity, sources,
      packages: { node: packages.provenance.node, sdk: packages.provenance.sdk,
        testManifestSha256: packages.provenance.testManifestSha256, playwrightManifestSha256: packages.provenance.playwrightManifestSha256, coreManifestSha256: packages.provenance.coreManifestSha256 },
      acquisition: candidate.receipt, compatibility: null, cli: { state: 'not-executed', nativeExit: null, signal: null },
      report: null, population: null, visuals: [], failure: 'admission', nativeActions };
    failure = 'compatibility'; nativeActions.compatibilityLaunches = 1;
    record.compatibility = await io.compatibility(candidate);
    active();
    requireFact(exact(record.compatibility, ['version', 'closed']) && record.compatibility.version === PIN && record.compatibility.closed === true, 'compatibility');
    failure = 'binding';
    const again = await io.bounded(io.admitCandidate(candidate.executable), 15000); active(); checkPinnedCandidate(again);
    requireFact(JSON.stringify(candidate) === JSON.stringify(again) && JSON.stringify(sources) === JSON.stringify(await io.bindings()), 'binding');
    active();
    requireFact(packages.provenance.sourceSha256 === sources['tests/diagnostics/no-store-stream-probe.mjs'].sha256
      && packages.provenance.packageSha256 === sources['package.json'].sha256
      && packages.provenance.lockSha256 === sources['pnpm-lock.yaml'].sha256
      && packages.provenance.nvmSha256 === sources['.nvmrc'].sha256, 'binding');
    const cli = await until(io.cliPath()); active(); const env = sealEnvironment(io.env, candidate.executable);
    failure = 'suite'; nativeActions.applicationInvocations = 1;
    record.cli = { state: 'aborted', nativeExit: null, signal: 'other' };
    const child = await io.application(CONFIG, env, cli);
    active();
    record.cli = child.signal || child.expired || child.code === null
      ? { state: 'aborted', nativeExit: null, signal: ['SIGINT', 'SIGTERM', 'SIGKILL'].includes(child.signal) ? child.signal : 'other' }
      : { state: child.code === 0 ? 'completed' : 'failed', nativeExit: child.code, signal: null };
    failure = 'report';
    const bytes = await io.readReport(); active(); record.report = { bytes: bytes.length, sha256: hash(bytes) };
    const result = await inspectReport(bytes, io.readAttachment); active(); record.population = result.population; record.visuals = result.visuals;
    failure = 'binding'; requireFact(JSON.stringify(sources) === JSON.stringify(await io.bindings()), 'binding'); active();
    failure = record.cli.state === 'completed' ? 'none' : 'suite';
    record.failure = failure; validateProvenance(record);
  } catch (error) {
    failure = FAILURES.has(error?.message) && error.message !== 'none' ? error.message : failure;
    if (record && error?.nativeCode >= 0 && error.nativeCode <= 255 && error.nativeSignal === 0) {
      record.cli = { state:error.nativeCode === 0 ? 'completed' : 'failed', nativeExit:error.nativeCode, signal:null };
    }
    if (record) record.failure = failure;
  }
  if (failure !== 'none' && io.finishOwnership) await io.finishOwnership();
  io.releaseLifetime?.();
  if (record && outputReady) {
    try { await io.writeProvenance(record); } catch { failure = 'write'; }
  }
  const code = failure === 'none' ? 0 : record?.cli.nativeExit > 0 ? record.cli.nativeExit : 1;
  return { exitCode: code, failure, record };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = process.argv.length === 3 && process.argv[2] === '--capability-capsule'
    ? await runCapabilityEntry()
    : await runApplication();
  process.stdout.write(`fixed-chromium-application ${result.failure === 'none' ? 'diagnostic-complete' : 'unavailable'}\n`);
  process.exitCode = result.exitCode;
}
