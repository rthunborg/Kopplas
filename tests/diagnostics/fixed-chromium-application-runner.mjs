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

/** The worker is owned by the runner's bounded, separate Linux process group. */
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

/** Own only the spawned child group; retain native close, including timeouts. */
export async function runOwnedChild(io, argv, env, milliseconds, capture = false) {
  const child = io.spawn(argv, env, capture);
  let closed = false, expired = false, output = '', overflow = false;
  const timers = [];
  const later = (callback, delay) => { const id = io.setTimeout(callback, delay); timers.push(id); return id; };
  let rejectCleanup;
  const cleanupFailure = new Promise((_, no) => { rejectCleanup = no; });
  const stop = () => { if (!closed) { expired = true; try { io.killGroup(child, 'SIGTERM'); } catch { rejectCleanup(new Error('cleanup')); } } };
  io.onSignal(stop);
  const ending = new Promise((yes, no) => {
    child.once('error', () => no(new Error('cleanup')));
    child.once('close', (code, signal) => { closed = true; yes({ code, signal, expired, output, overflow }); });
    if (capture) child.stdout?.on('data', chunk => { if (output.length + chunk.length > 256) { overflow = true; stop(); } else output += chunk.toString('utf8'); });
  });
  try {
    later(stop, milliseconds);
    // Deadline fires TERM, then only this group's KILL. No child may detach indefinitely.
    const watchdog = new Promise((_, no) => {
      const schedule = () => {
        if (closed) return;
        if (expired) {
          try { io.killGroup(child, 'SIGKILL'); } catch { no(new Error('cleanup')); return; }
          later(() => { if (!closed) no(new Error('cleanup')); }, 1000);
        }
        else later(schedule, 1000);
      };
      later(schedule, milliseconds + 1000);
    });
    return await Promise.race([ending, watchdog, cleanupFailure]);
  } finally {
    timers.forEach(id => io.clearTimeout(id)); io.offSignal(stop);
    if (!closed) io.killGroup(child, 'SIGKILL');
  }
}

function productionRuntime() {
  const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const signals = ['SIGINT', 'SIGTERM'];
  const io = { platform: process.platform, version: process.version, argv: process.argv, env: process.env,
    admitCandidate, packageAdmission, bounded, now: () => performance.now(),
    async bindings() { const entries = await Promise.all(SOURCES.map(async path => { const data = await readFile(join(repo, path)); return [path, { bytes: data.length, sha256: hash(data) }]; })); return Object.fromEntries(entries); },
    async gitIdentity() { const command = args => new Promise((yes, no) => execFile('git', ['-C', repo, ...args], { timeout: 5000, maxBuffer: 256, windowsHide: true }, (error, stdout) => error ? no(new Error('binding')) : yes(stdout.trim())));
      requireFact(await command(['status', '--porcelain', '--untracked-files=normal']) === '', 'binding');
      return { executionSha: await command(['rev-parse', 'HEAD']), sourceTree: await command(['rev-parse', 'HEAD^{tree}']) }; },
    async cliPath() { const require = createRequire(import.meta.url); const manifest = require.resolve('@playwright/test/package.json'); const data = JSON.parse(await readFile(manifest, 'utf8'));
      requireFact(data.version === '1.61.1' && data.bin?.playwright === 'cli.js', 'admission'); return join(dirname(manifest), 'cli.js'); },
    async freshOutput() { const base = await realpath(repo); const parent = join(base, 'test-results'); await mkdir(parent, { recursive: true }); requireFact(await realpath(parent) === parent && !(await lstat(parent)).isSymbolicLink(), 'write');
      const out = join(parent, 'fixed-chromium-application'); await mkdir(out); requireFact(await realpath(out) === out && !(await lstat(out)).isSymbolicLink(), 'write'); },
    async readReport() { return readFile(join(repo, OUTPUT, 'general-browser.json')); },
    async readAttachment(path) { requireFact(typeof path === 'string', 'report'); const base = await realpath(join(repo, OUTPUT, 'results')); const target = await realpath(resolve(repo, path)); requireFact(contained(base, target) && !(await lstat(target)).isSymbolicLink(), 'report'); return readFile(target); },
    async writeProvenance(value) { const text = JSON.stringify(validateProvenance(value)); await writeFile(join(repo, OUTPUT, 'provenance.json'), text, { flag: 'wx', mode: 0o600 }); },
    spawn(argv, env, capture) { return spawn(process.execPath, argv, { cwd: repo, env, detached: true, stdio: capture ? ['ignore', 'pipe', 'ignore'] : 'inherit' }); },
    killGroup(child, signal) { if (Number.isInteger(child.pid) && child.pid > 0) { try { process.kill(-child.pid, signal); } catch (error) { if (error.code !== 'ESRCH') throw new Error('cleanup'); } } },
    setTimeout, clearTimeout,
    onSignal(callback) { signals.forEach(signal => process.on(signal, callback)); },
    offSignal(callback) { signals.forEach(signal => process.off(signal, callback)); },
  };
  const bootstrap = `import { pathToFileURL } from 'node:url'; try { const module = await import(pathToFileURL(process.argv[2]).href); const result = await module.runCompatibility(process.argv[3]); process.stdout.write(JSON.stringify(result)); } catch { process.exitCode = 1; }`;
  io.compatibility = async candidate => {
    const result = await runOwnedChild(io, ['--input-type=module', '-e', bootstrap, 'fixed-chromium-compatibility', fileURLToPath(import.meta.url), candidate.executable], io.env, 15000, true);
    requireFact(!result.expired && !result.overflow && result.code === 0 && result.signal === null, 'compatibility');
    const value = JSON.parse(result.output); requireFact(exact(value, ['version', 'closed']) && value.version === PIN && value.closed === true, 'compatibility'); return value;
  };
  io.application = async (path, env, cli) => {
    requireFact(path === CONFIG, 'binding');
    const result = await runOwnedChild(io, [cli, 'test', '--config', CONFIG], env, 1500000, false);
    return { code: result.code, signal: result.signal, expired: result.expired };
  };
  return io;
}

export async function runApplication(io = productionRuntime()) {
  let record, candidate, packages, outputReady = false, failure = 'setup';
  const nativeActions = { compatibilityLaunches: 0, applicationInvocations: 0 };
  try {
    checkApplicationArguments(io);
    const identity = await io.gitIdentity(), sources = await io.bindings(); checkSourceBindings(sources);
    requireFact(/^[0-9a-f]{40}$/.test(identity.executionSha) && /^[0-9a-f]{40}$/.test(identity.sourceTree), 'binding');
    await io.freshOutput(); outputReady = true;
    failure = 'admission';
    const admission = await io.bounded(Promise.all([io.admitCandidate(io.argv[3]), io.packageAdmission()]), 15000);
    [candidate, packages] = admission; checkPinnedCandidate(candidate);
    requireFact(packages.provenance.sdk === '1.61.1' && /^v22\.\d+\.\d+$/.test(packages.provenance.node)
      && ['testManifestSha256', 'playwrightManifestSha256', 'coreManifestSha256'].every(k => hex(packages.provenance[k])), 'admission');
    record = { schemaVersion: 1, mode: 'isolated-full158-application', ...identity, sources,
      packages: { node: packages.provenance.node, sdk: packages.provenance.sdk,
        testManifestSha256: packages.provenance.testManifestSha256, playwrightManifestSha256: packages.provenance.playwrightManifestSha256, coreManifestSha256: packages.provenance.coreManifestSha256 },
      acquisition: candidate.receipt, compatibility: null, cli: { state: 'not-executed', nativeExit: null, signal: null },
      report: null, population: null, visuals: [], failure: 'admission', nativeActions };
    failure = 'compatibility'; nativeActions.compatibilityLaunches = 1;
    record.compatibility = await io.compatibility(candidate);
    requireFact(exact(record.compatibility, ['version', 'closed']) && record.compatibility.version === PIN && record.compatibility.closed === true, 'compatibility');
    failure = 'binding';
    const again = await io.bounded(io.admitCandidate(candidate.executable), 15000); checkPinnedCandidate(again);
    requireFact(JSON.stringify(candidate) === JSON.stringify(again) && JSON.stringify(sources) === JSON.stringify(await io.bindings()), 'binding');
    requireFact(packages.provenance.sourceSha256 === sources['tests/diagnostics/no-store-stream-probe.mjs'].sha256
      && packages.provenance.packageSha256 === sources['package.json'].sha256
      && packages.provenance.lockSha256 === sources['pnpm-lock.yaml'].sha256
      && packages.provenance.nvmSha256 === sources['.nvmrc'].sha256, 'binding');
    const cli = await io.cliPath(), env = sealEnvironment(io.env, candidate.executable);
    failure = 'suite'; nativeActions.applicationInvocations = 1;
    record.cli = { state: 'aborted', nativeExit: null, signal: 'other' };
    const child = await io.application(CONFIG, env, cli);
    record.cli = child.signal || child.expired || child.code === null
      ? { state: 'aborted', nativeExit: null, signal: ['SIGINT', 'SIGTERM', 'SIGKILL'].includes(child.signal) ? child.signal : 'other' }
      : { state: child.code === 0 ? 'completed' : 'failed', nativeExit: child.code, signal: null };
    failure = 'report';
    const bytes = await io.readReport(); record.report = { bytes: bytes.length, sha256: hash(bytes) };
    const result = await inspectReport(bytes, io.readAttachment); record.population = result.population; record.visuals = result.visuals;
    failure = 'binding'; requireFact(JSON.stringify(sources) === JSON.stringify(await io.bindings()), 'binding');
    failure = record.cli.state === 'completed' ? 'none' : 'suite';
    record.failure = failure; validateProvenance(record);
  } catch (error) {
    failure = FAILURES.has(error?.message) && error.message !== 'none' ? error.message : failure;
    if (record) record.failure = failure;
  }
  if (record && outputReady) {
    try { await io.writeProvenance(record); } catch { failure = 'write'; }
  }
  const code = failure === 'none' ? 0 : record?.cli.nativeExit > 0 ? record.cli.nativeExit : 1;
  return { exitCode: code, failure, record };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await runApplication();
  process.stdout.write(`fixed-chromium-application ${result.failure === 'none' ? 'diagnostic-complete' : 'unavailable'}\n`);
  process.exitCode = result.exitCode;
}
