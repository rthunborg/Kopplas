/** Read-only, diagnostic-only collection for an already failed owned CI stack.
 * Never launches/stops a service, queries SQL, changes logging, or emits raw logs. */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, lstat, realpath } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAdmission, validateStackIdentity } from './with-calendar-feed-runtime.mjs';
import { summarizeAuthCleanupLogs } from '../../tests/support/auth-cleanup-log-summary.ts';
const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const CASE = '[P0] 15.4-NUDGE-004 AC5 AC8 more than25 real recipients continue stable frozen scoped cursor without gaps duplicates or fact return';
const SUITE = '/tests/integration/notifications/time-report-nudge-producer.int.test.ts';
const FORMAT = '{"Id":{{json .Id}},"Name":{{json .Name}},"Created":{{json .Created}},"State":{"Running":{{json .State.Running}}},"Config":{"Labels":{{json .Config.Labels}},"Image":{{json .Config.Image}}},"NetworkSettings":{"Networks":{{json .NetworkSettings.Networks}},"Ports":{{json .NetworkSettings.Ports}}}}';
const ID = /^[0-9a-f]{64}$/;
class CollectorRefusal extends Error {}
const refuse = (code) => { throw new CollectorRefusal(code); };
const CODES = new Set(['admission-refused', 'native-unavailable', 'native-refused', 'window-refused', 'ownership-refused', 'source-changed', 'log-read-failed', 'log-input-incomplete', 'artifact-write-failed']);

export function selectNudgeFailure(report, now) {
  if (!report || !Array.isArray(report.testResults) || report.testResults.length > 3000) refuse('native-refused');
  const matches = report.testResults.flatMap(suite => {
    if (typeof suite.name !== 'string' || !suite.name.replaceAll('\\', '/').endsWith(SUITE) || !Array.isArray(suite.assertionResults)) return [];
    return suite.assertionResults.flatMap((test, index) => test.title === CASE && test.status === 'failed' ? [{suite, test, index}] : []);
  });
  if (!matches.length) return null;
  if (matches.length !== 1) refuse('native-refused');
  const {suite, test, index} = matches[0];
  if (!Array.isArray(test.failureMessages) || test.failureMessages.length < 1 || test.failureMessages.length > 20
    || !test.failureMessages.some(message => typeof message === 'string' && /Fixture Auth deletion failed \[class=(?:api-error|retryable-fetch|unknown-auth|unclassified);status=(?:0|[45]\d{2}|unavailable);code=(?:[a-z_-]+)\]/.test(message))
    || !Array.isArray(test.meta?.calendarSourceLabelsV1) || !test.meta.calendarSourceLabelsV1.some(line => typeof line === 'string' && line.startsWith('calendar-source-label-v1 case=NUDGE004 site=cleanup-auth boundary=LOCAL '))) return null;
  // Native JSON has file times, not individual start times. Only a final executed
  // test under the existing serial/bail partition qualifies this narrow bound.
  if (suite.assertionResults.slice(index + 1).some(test => !['pending', 'skipped'].includes(test.status))
    || !Number.isFinite(test.duration) || test.duration <= 0 || test.duration > 30_000
    || !Number.isFinite(suite.startTime) || !Number.isFinite(suite.endTime) || suite.startTime >= suite.endTime
    || suite.endTime > now || suite.endTime - suite.startTime > 300_000 || test.duration > suite.endTime - suite.startTime) refuse('window-refused');
  const from = Math.max(suite.startTime, Math.floor(suite.endTime - test.duration - 2000));
  const to = Math.min(now, Math.ceil(suite.endTime + 1000));
  if (from >= to || to - from > 33_001) refuse('window-refused');
  return {from: new Date(from).toISOString(), to: new Date(to).toISOString(), durationMs: to - from};
}

export function validateCollectorHead(head, env, event) {
  const expected = env.GITHUB_EVENT_NAME === 'pull_request' ? event.pull_request?.head?.sha : env.GITHUB_SHA;
  if (!/^[0-9a-f]{40}$/.test(expected ?? '') || head !== expected) refuse('ownership-refused');
  return true;
}
export function validateLogSources(snapshot, window) {
  const from = Date.parse(window.from), to = Date.parse(window.to);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to || to - from > 33_001) refuse('window-refused');
  validateStackIdentity(snapshot);
  const auth = snapshot.auth, created = Date.parse(auth?.Created);
  const shared = container => Object.values(container.NetworkSettings?.Networks ?? {}).map(network => network.NetworkID);
  const dbNetworks = shared(snapshot.db), gatewayNetworks = shared(snapshot.gateway);
  if (new Set([snapshot.db.Id, snapshot.gateway.Id, auth?.Id]).size !== 3 || !ID.test(auth?.Id ?? '') || auth.Name !== '/supabase_auth_kopplas' || auth.State?.Running !== true
    || auth.Config?.Labels?.['com.supabase.cli.project'] !== 'kopplas'
    || auth.Config?.Image !== 'public.ecr.aws/supabase/gotrue:v2.195.0'
    || Object.values(auth.NetworkSettings?.Ports ?? {}).some(bindings => Array.isArray(bindings) && bindings.length > 0)
    || !Number.isFinite(created) || created < snapshot.checkoutTime || created > Date.parse(window.from)
    || !shared(auth).some(id => ID.test(id ?? '') && dbNetworks.includes(id) && gatewayNetworks.includes(id))
    || [snapshot.db, snapshot.gateway].some(container => Date.parse(container.Created) > Date.parse(window.from))
    || Date.parse(window.from) < snapshot.checkoutTime || Date.parse(window.to) > snapshot.now) refuse('ownership-refused');
  return true;
}

export function joinDockerLogStreams(stdout, stderr) {
  return stdout + '\n' + stderr;
}
function defaultDependencies(env, cwd) {
  const exec = promisify(execFile), deadline = Date.now() + 30_000;
  const capture = async (command, args, logs = false) => {
    const remaining = Math.min(5000, deadline - Date.now());
    if (remaining <= 0) refuse(logs ? 'log-read-failed' : 'ownership-refused');
    try {
      const result = await exec(command, args, {cwd, env, timeout: remaining, maxBuffer: logs ? 2 * 1024 * 1024 : 262144, windowsHide: true});
      return logs ? joinDockerLogStreams(result.stdout, result.stderr) : result.stdout;
    } catch { refuse(logs ? 'log-read-failed' : 'ownership-refused'); }
  };
  const inspect = async (ids) => {
    const raw = await capture('docker', ['inspect', '--format', FORMAT, ...ids]);
    try { return raw.trim().split(/\r?\n/).map(line => JSON.parse(line)); } catch { refuse('ownership-refused'); }
  };
  let stack;
  return {
    now: Date.now,
    async readNative() {
      const path = join(cwd, 'test-results/full-integration.json');
      try {
        const directory = join(cwd, 'test-results'), parent = await lstat(directory), git = await lstat(join(cwd, '.git'));
        if (!parent.isDirectory() || parent.isSymbolicLink() || await realpath(directory) !== resolve(directory)) refuse('native-refused');
        const info = await lstat(path);
        if (!info.isFile() || info.isSymbolicLink() || info.size > 2 * 1024 * 1024 || !Number.isFinite(info.mtimeMs) || info.mtimeMs < git.birthtimeMs || info.mtimeMs > Date.now() + 1000) refuse('native-refused');
        return JSON.parse(await readFile(path, 'utf8'));
      } catch (error) { if (error instanceof CollectorRefusal) throw error; refuse('native-unavailable'); }
    },
    async qualify(window) {
      if (await realpath(cwd) !== await realpath(env.GITHUB_WORKSPACE ?? '')) refuse('ownership-refused');
      const git = await lstat(join(cwd, '.git'));
      if (!git.isDirectory() || git.isSymbolicLink()) refuse('ownership-refused');
      const eventInfo = await lstat(env.GITHUB_EVENT_PATH);
      if (!eventInfo.isFile() || eventInfo.isSymbolicLink() || eventInfo.size > 2 * 1024 * 1024) refuse('ownership-refused');
      const event = JSON.parse(await readFile(env.GITHUB_EVENT_PATH, 'utf8'));
      const head = (await capture('git', ['-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false', '-c', 'credential.helper=', 'rev-parse', 'HEAD'])).trim();
      validateCollectorHead(head, env, event);
      const containers = await inspect(['supabase_db_kopplas', 'supabase_kong_kopplas', 'supabase_auth_kopplas']);
      if (containers.length !== 3) refuse('ownership-refused');
      const status = JSON.parse(await capture('supabase', ['status', '--output', 'json']));
      stack = {db: containers[0], gateway: containers[1], auth: containers[2], checkoutTime: git.birthtimeMs, now: Date.now(), status};
      validateLogSources(stack, window);
      return stack;
    },
    async revalidate(snapshot, window) {
      const containers = await inspect([snapshot.db.Id, snapshot.gateway.Id, snapshot.auth.Id]);
      if (containers.length !== 3 || containers.some((container, index) => container.Id !== [snapshot.db.Id, snapshot.gateway.Id, snapshot.auth.Id][index])) refuse('source-changed');
      validateLogSources({...snapshot, db: containers[0], gateway: containers[1], auth: containers[2], now: Date.now()}, window);
    },
    readLogs: (id, window) => capture('docker', ['logs', '--timestamps', '--since', window.from, '--until', window.to, '--tail', '4001', id], true),
    async writeSummary(summary) {
      const directory = join(cwd, 'test-results');
      const info = await lstat(directory);
      if (!info.isDirectory() || info.isSymbolicLink() || await realpath(directory) !== resolve(directory)) refuse('artifact-write-failed');
      await writeFile(join(directory, 'auth-cleanup-facts.json'), JSON.stringify(summary) + '\n', {flag: 'wx', mode: 0o600});
    },
  };
}

export async function collectAuthCleanupFacts({env = process.env, platform = process.platform, cwd = ROOT} = {}, injected = {}) {
  const deps = {...defaultDependencies(env, cwd), ...injected};
  const receipt = {kind: 'auth_cleanup.diagnostic_facts', evidenceClass: 'diagnostic-only', acceptanceCredit: 0, phase: 'not-attempted', case: '15.4-NUDGE-004', ownershipVerified: false, sourceRevisionVerified: false, windowQualified: false, windowDurationMs: null, services: [], failures: []};
  let admitted = false;
  try {
    try {
      validateAdmission('db', env, platform);
      if (env.GITHUB_JOB !== 'db' || env.GITHUB_RUN_ATTEMPT !== '1' || !['pull_request', 'workflow_dispatch', 'push'].includes(env.GITHUB_EVENT_NAME)) refuse('admission-refused');
      admitted = true;
    } catch { refuse('admission-refused'); }
    const window = selectNudgeFailure(await deps.readNative(), deps.now());
    if (!window) receipt.phase = 'not-applicable';
    else {
      receipt.windowQualified = true; receipt.windowDurationMs = window.durationMs;
      const snapshot = await deps.qualify(window); validateLogSources(snapshot, window);
      receipt.ownershipVerified = true; receipt.sourceRevisionVerified = true;
      for (const [service, container] of [['auth', snapshot.auth], ['postgres', snapshot.db]]) {
        await deps.revalidate(snapshot, window);
        const raw = await deps.readLogs(container.Id, window);
        await deps.revalidate(snapshot, window);
        const summary = summarizeAuthCleanupLogs(service, raw, window);
        receipt.services.push(summary);
        if (summary.coverage !== 'bounded-window' || summary.unqualifiedTimestampLines) refuse('log-input-incomplete');
      }
      receipt.phase = 'captured';
    }
  } catch (error) {
    receipt.phase = 'unavailable';
    receipt.failures.push(error instanceof CollectorRefusal && CODES.has(error.message) ? error.message : 'ownership-refused');
  }
  if (admitted) {
    try { await deps.writeSummary(receipt); }
    catch { receipt.phase = 'unavailable'; receipt.failures.push('artifact-write-failed'); }
  }
  return {exitCode: receipt.phase === 'unavailable' ? 1 : 0, receipt};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await collectAuthCleanupFacts();
  // Receipt contains only closed facts; never print caught errors or raw output.
  console.log(JSON.stringify(result.receipt)); process.exitCode = result.exitCode;
}
