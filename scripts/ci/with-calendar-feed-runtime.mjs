/** Disposable GitHub-hosted CI only. This is not local resource-launch authority. */
import { spawn, execFile } from "node:child_process";
import { promisify, stripVTControlCharacters } from "node:util";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { readdir, stat, realpath, mkdtemp, appendFile, writeFile, readFile, readlink, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, isIP } from "node:net";
import pg from "pg";

export const INTEGRATION_ARGS = Object.freeze(["run", "test:int", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/full-integration.json"]);
export const BROWSER_ARGS = Object.freeze(["run", "test:smoke"]);
export const ORIGINAL_E2E001_ARGS = Object.freeze(["exec", "playwright", "test", "tests/e2e/calendar-feed.e2e.spec.ts", "--grep", "(?:^| )15[.]5-E2E-001(?: |$)", "--retries=0", "--workers=1", "--reporter=list,json"]);
export const CAUSE_PROOF_ARGS = Object.freeze(["exec", "vitest", "run", "tests/integration/commands/calendar-feed.int.test.ts", "--maxWorkers=1", "--no-file-parallelism", "--testNamePattern=^15[.]5-DIAG001$", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/calendar-feed-cause-proof/native.json"]);
export const CAUSE_PROOF_OUTCOMES = Object.freeze(["PRE_SQL_STOP", "AMBIGUOUS_SQL42501", "NONREPRODUCED", "UNKNOWN_ENGINE_ERROR", "INCOMPARABLE", "CLEANUP_UNVERIFIED", "ORDINARY_SUCCESS", "CAPTURE_UNAVAILABLE"]);
const CAUSE_DIRECTORY = "test-results/calendar-feed-cause-proof";
const TRACE_EVENTS = new Set(["input-invalid", "execute-enter", "key-ready", "status-enter", "status-rpc42501", "status-rpc-error", "status-schema-invalid", "status-valid", "proof-enter", "manage-enter", "manage-rpc42501", "manage-rpcCF409", "manage-rpc-error", "manage-schema-invalid", "manage-valid", "envelope-success", "envelope-UNAUTHENTICATED", "envelope-TENANT_MEMBERSHIP_REQUIRED", "envelope-PERMISSION_DENIED", "envelope-VALIDATION_FAILED", "envelope-TENANT_ACCESS_DENIED", "envelope-COMMAND_CONFLICT", "envelope-SERVER_ERROR", "envelope-other", "context-match", "context-mismatch", "membership-match", "membership-mismatch", "truncated"]);

/** Validate parsed wire data without inspecting native error text or payloads. */
export function validateCauseProofObservation(value) {
  try {
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Reflect.ownKeys(descriptors).some(key => typeof key !== "string")) fail("diagnostic-observation-refused");
    const clean = Object.create(null);
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (!("value" in descriptor)) fail("diagnostic-observation-refused");
      clean[key] = descriptor.value;
    }
    for (const name of ["events", "failures"]) {
      if (!Array.isArray(clean[name]) || clean[name].length > 32) fail("diagnostic-observation-refused");
      const array = clean[name], copy = [];
      for (let i = 0; i < array.length; i++) {
        const descriptor = Object.getOwnPropertyDescriptor(array, String(i));
        if (!descriptor || !("value" in descriptor)) fail("diagnostic-observation-refused");
        copy.push(descriptor.value);
      }
      clean[name] = copy;
    }
    value = clean;
  } catch { fail("diagnostic-observation-refused"); }
  const keys = ["kind", "mode", "outcome", "events", "baseline", "sqlState", "cleanupVerified", "ordinarySettled", "queriesSettled", "failures", "statusDiscriminator"];
  if (!value || typeof value !== "object" || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))
    || value.kind !== "calendar_feed.cause_proof" || value.mode !== "cause-proof" || !CAUSE_PROOF_OUTCOMES.includes(value.outcome)
    || !Array.isArray(value.events) || value.events.length > 16 || !value.events.every(event => typeof event === "string" && TRACE_EVENTS.has(event))
    || !["not-selected", "status", "manage"].includes(value.baseline) || !(value.sqlState === null || SQLSTATE_CATEGORIES.has(value.sqlState) || value.sqlState === "CF409")
    || !Array.isArray(value.failures) || value.failures.length > 32 || !value.failures.every(code => ["protocol-unsettled", "baseline-qualification-or-call", "baseline-rollback", "baseline-reset", "baseline-state", "baseline-close", "fresh-state", "fresh-qualification-or-state", "fresh-protocol", "fresh-close", "fixture-or-ordinary", "fixture-rows", "fixture-canonical", "fixture-absence", "fixture-custody-retained"].includes(code))
    || !["cleanupVerified", "ordinarySettled", "queriesSettled"].every(key => typeof value[key] === "boolean")) fail("diagnostic-observation-refused");
  if (value.statusDiscriminator === null && value.baseline === "status" && (value.sqlState !== null || ["AMBIGUOUS_SQL42501","NONREPRODUCED","UNKNOWN_ENGINE_ERROR"].includes(value.outcome))) fail("diagnostic-observation-refused");
  if (value.statusDiscriminator !== null) {
    try {
      const fields = Object.getOwnPropertyDescriptors(value.statusDiscriminator);
      if (Reflect.ownKeys(fields).length !== 3 || !["schema","origin","permissions"].every(key => Object.hasOwn(fields,key) && "value" in fields[key])) fail("diagnostic-observation-refused");
      const { schema, origin, permissions } = Object.fromEntries(Object.entries(fields).map(([key,descriptor]) => [key,descriptor.value]));
      const names = ["caller_public_usage", "caller_status_execute", "owner_public_usage", "owner_actor_execute", "owner_uid_execute", "owner_subject_execute", "owner_lock_execute", "owner_hash_execute", "owner_tenant_id_select", "owner_member_id_select", "owner_member_tenant_select", "owner_member_user_select", "owner_member_status_select", "owner_member_role_select", "owner_union_tenant_select", "owner_union_member_select", "owner_union_role_select", "owner_tokens_select"];
      const facts = Object.getOwnPropertyDescriptors(permissions);
      if (schema !== "status-origin-v2" || !["UNKNOWN","PLPGSQL_RAISE","ACL_ENGINE"].includes(origin) || Reflect.ownKeys(facts).length !== names.length
        || !names.every(key => Object.hasOwn(facts,key) && "value" in facts[key] && typeof facts[key].value === "boolean")
        || value.baseline !== "status" || ["PRE_SQL_STOP","ORDINARY_SUCCESS","CAPTURE_UNAVAILABLE"].includes(value.outcome) || origin !== "UNKNOWN" && value.sqlState !== "42501") fail("diagnostic-observation-refused");
      value.statusDiscriminator = { schema, origin, permissions: Object.fromEntries(names.map(key => [key,facts[key].value])) };
    } catch { fail("diagnostic-observation-refused"); }
  }
  if (!value.cleanupVerified || !value.ordinarySettled || !value.queriesSettled || value.outcome === "CLEANUP_UNVERIFIED") fail("diagnostic-settlement-unverified");
  return value;
}
export async function finishCauseProof(cwd, env, receipt, observe, privacy) {
  const folder = join(cwd, CAUSE_DIRECTORY), entries = [];
  const upload = join(folder, "upload"); await mkdir(upload, { recursive: true });
  let captureFailed = observe.privacyFailed?.() === true;
  for (const name of ["native.json", "observation.json"]) {
    try {
      const bytes = await readFile(join(folder, name));
      if (bytes.length > 1_000_000) fail("diagnostic-report-refused");
      const data = JSON.parse(bytes.toString("utf8"));
      if (hasSensitiveOutput(bytes.toString("utf8"), privacy)) fail("diagnostic-report-privacy-refused");
      if (name === "native.json") {
        if (data.numTotalTests !== 1 || data.numPendingTests !== 0 || !Number.isSafeInteger(data.numFailedTests) || !Number.isSafeInteger(data.numPassedTests)
          || data.numFailedTests < 0 || data.numPassedTests < 0 || data.numPassedTests + data.numFailedTests !== 1) fail("diagnostic-report-refused");
        await observe(bytes.toString("utf8"));
      } else validateCauseProofObservation(data);
      entries.push({ name, available: true, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
      // Only validated copies are uploaded. A refused original is never deleted,
      // printed, or accidentally swept into the diagnostic artifact directory.
      await writeFile(join(upload, name), bytes, { mode: 0o600 });
    } catch { entries.push({ name, available: false }); if (!["not-attempted", "not-created-confirmed"].includes(receipt.childLaunchState)) captureFailed = true; }
  }
  const safe = { kind: "calendar_feed.diagnostic_receipt", mode: "cause-proof", evidenceClass: "diagnostic-only", acceptanceCredit: 0,
    sourceSha: env.GITHUB_SHA, checkpointId: env.CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT, runId: env.GITHUB_RUN_ID,
    attempt: 1, job: env.GITHUB_JOB, launchAttempted: receipt.launchAttempted, childLaunchState: receipt.childLaunchState,
    childStarted: receipt.childLaunchState === "started" ? true : ["not-attempted", "not-created-confirmed"].includes(receipt.childLaunchState) ? false : null,
    reports: entries.map(({ name, available }) => ({ name, available })),
    cleanupVerified: receipt.keyDeleted && receipt.dbClosed && receipt.custody === null,
    custodyRetained: receipt.custody !== null, failures: [...receipt.failures], captureFailed };
  await writeFile(join(upload, "receipt.json"), JSON.stringify(safe) + "\n", { mode: 0o600 });
  await writeFile(join(upload, "manifest.json"), JSON.stringify({ ...safe, reports: entries }) + "\n", { mode: 0o600 });
  return !captureFailed;
}
export const FEED_FUNCTIONS = Object.freeze([
  "public.fetch_calendar_feed(text,text,jsonb,text)",
  "public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text)",
  "public.read_calendar_feed_status(uuid,uuid)", "public.read_calendar_feed_abuse(uuid)",
]);
const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
class RuntimeFailure extends Error {}
const fail = (code) => { throw new RuntimeFailure(code); };
const DIAGNOSTIC_STAGES = new Set(["admission", "qualification", "port-check", "database-client", "database-connect", "setup-authority", "privacy-preflight", "migration-ledger", "feed-functions",
  "key-id", "entropy", "telemetry", "transaction-begin", "key-collision", "key-create", "transaction-commit", "runtime",
  "child-cleanup", "transaction-rollback", "key-cleanup", "database-close"]);
const SQLSTATE_CATEGORIES = new Map([
  ["42501", "insufficient-privilege"], ["42P01", "undefined-table"], ["42883", "undefined-function"],
  ["42703", "undefined-column"], ["3F000", "invalid-schema"], ["23505", "unique-conflict"],
  ["57014", "query-canceled"], ["25P02", "transaction-aborted"], ["08006", "connection-failure"],
]);
const PROCESS_PHASES = new Set(["capture-invalid", "identity-read-failed", "leader-mismatch", "leader-missing-group-live"]);
function safeDiagnostic(stage, error) {
  // Inspect only an own data descriptor, never native text, getters or causes.
  let code;
  try { code = Object.getOwnPropertyDescriptor(error, "code")?.value; } catch { /* Unclassified, with no native details. */ }
  const known = typeof code === "string" && SQLSTATE_CATEGORIES.has(code);
  const processPhase = error instanceof RuntimeFailure ? Object.getOwnPropertyDescriptor(error, "processPhase")?.value : undefined;
  return { stage: DIAGNOSTIC_STAGES.has(stage) ? stage : "runtime",
    category: known ? SQLSTATE_CATEGORIES.get(code) ?? "unclassified" : error instanceof RuntimeFailure ? "guard-refusal" : "unclassified",
    sqlState: known ? code : null, ...(PROCESS_PHASES.has(processPhase) ? { processPhase } : {}) };
}
const delay = (ms) => new Promise(resolveDelay => setTimeout(resolveDelay, ms));

const PRIVACY_CONTROLS = new Map([
  ["log_statement", "superuser"], ["log_min_error_statement", "superuser"],
  ["log_parameter_max_length", "superuser"], ["log_parameter_max_length_on_error", "user"],
]);
const PRINCIPAL_FACTS = ["session_is_postgres", "current_is_postgres", "same_identity", "session_superuser", "current_superuser", "session_bypass_rls", "current_bypass_rls"];
const PRIVACY_PREFLIGHT_SQL = `with required(name,value) as (values
  ('log_statement','none'),('log_min_error_statement','panic'),
  ('log_parameter_max_length','0'),('log_parameter_max_length_on_error','0'))
select s.name,s.context,current_setting(s.name)=r.value as matches_required,
  has_parameter_privilege(current_user,s.name,'SET') as can_set,
  session_user='postgres' as session_is_postgres,current_user='postgres' as current_is_postgres,
  session_user=current_user as same_identity,
  a.rolsuper as session_superuser,b.rolsuper as current_superuser,
  a.rolbypassrls as session_bypass_rls,b.rolbypassrls as current_bypass_rls
from required r join pg_settings s on s.name=r.name
join pg_roles a on a.rolname=session_user join pg_roles b on b.rolname=current_user
order by s.name`;

/**
 * No native setting values or role names leave this fixed read-only query.
 * @returns {Promise<{controls:{name:string,context:string,matchesRequired:boolean,canSet:boolean}[],principal:Record<string,boolean>}>}
 */
export async function readCalendarFeedPrivacyPreflight(db) {
  const { rows } = await db.query(PRIVACY_PREFLIGHT_SQL);
  const keys = ["name", "context", "matches_required", "can_set", ...PRINCIPAL_FACTS];
  const seen = new Set();
  if (!Array.isArray(rows) || rows.length !== PRIVACY_CONTROLS.size) fail("privacy-preflight-refused");
  for (const row of rows) {
    if (!row || Object.keys(row).length !== keys.length || !keys.every(key => Object.hasOwn(row, key))
      || typeof row.name !== "string" || !PRIVACY_CONTROLS.has(row.name) || seen.has(row.name)
      || row.context !== PRIVACY_CONTROLS.get(row.name)
      || !["matches_required", "can_set", ...PRINCIPAL_FACTS].every(key => typeof row[key] === "boolean")) fail("privacy-preflight-refused");
    seen.add(row.name);
  }
  // Identity/SET authority is observed only: effective privacy, not an inferred
  // superuser or permission grant, is the continuation condition.
  const principal = Object.fromEntries(PRINCIPAL_FACTS.map(key => [key, rows[0][key]]));
  if (rows.some(row => PRINCIPAL_FACTS.some(key => row[key] !== principal[key]))) fail("privacy-preflight-refused");
  return { controls: rows.map(row => ({ name: row.name, context: row.context, matchesRequired: row.matches_required, canSet: row.can_set })), principal };
}

/** Actual authenticated setup authority; never substitute SET ROLE or BYPASSRLS. */
export async function readCalendarFeedSetupAuthority(db) {
  const { rows } = await db.query(`select session_user='supabase_admin' as session_is_setup_admin,
    current_user='supabase_admin' as current_is_setup_admin,session_user=current_user as same_identity,
    a.rolcanlogin as session_login,b.rolcanlogin as current_login,
    a.rolsuper as session_superuser,b.rolsuper as current_superuser
    from pg_roles a join pg_roles b on b.rolname=current_user where a.rolname=session_user`);
  const keys = ["session_is_setup_admin", "current_is_setup_admin", "same_identity", "session_login", "current_login", "session_superuser", "current_superuser"];
  if (!Array.isArray(rows) || rows.length !== 1 || !rows[0] || Object.keys(rows[0]).length !== keys.length
    || !keys.every(key => Object.hasOwn(rows[0], key) && rows[0][key] === true)) fail("setup-authority-refused");
  return Object.fromEntries(keys.map(key => [key, true]));
}

/** Fixed setup call sites only; this is not a process sandbox or a pool. */
export function createCalendarFeedDatabaseClient(stack, purpose = "runtime") {
  validateStackIdentity(stack);
  if (!["runtime", "proof", "absence"].includes(purpose)) fail("setup-purpose-refused");
  const entries = stack.db.Config.Env;
  if (!Array.isArray(entries) || !entries.every(value => typeof value === "string")) fail("setup-credential-refused");
  const candidates = entries.filter(value => value.startsWith("POSTGRES_PASSWORD="));
  if (candidates.length !== 1) fail("setup-credential-refused");
  const password = candidates[0].slice("POSTGRES_PASSWORD=".length);
  if (!password || password.includes("\0")) fail("setup-credential-refused");
  const proof = purpose !== "runtime";
  return new pg.Client({ host: "127.0.0.1", port: 54322, database: "postgres", user: "supabase_admin", password, ssl: false,
    connectionTimeoutMillis: 5_000, query_timeout: proof ? 7_000 : 10_000, statement_timeout: proof ? 5_000 : 8_000,
    ...(proof ? { lock_timeout: 2_000 } : {}),
    options: "-c log_statement=none -c log_min_error_statement=panic -c log_parameter_max_length=0 -c log_parameter_max_length_on_error=0"
      + (purpose === "absence" ? " -c default_transaction_read_only=on" : "") });
}

/** Pure prerequisite validation: CI flags alone do not qualify a machine. */
export function validateAdmission(mode, env, platform) {
  if (!["db", "browser", "cause-proof"].includes(mode)) fail("mode-refused");
  if (platform !== "linux" || env.CI !== "true" || env.GITHUB_ACTIONS !== "true" || env.RUNNER_ENVIRONMENT !== "github-hosted"
    || !/^\d+$/.test(env.GITHUB_RUN_ID ?? "") || !/^\d+$/.test(env.GITHUB_RUN_ATTEMPT ?? "")
    || !/^[a-zA-Z0-9_-]+$/.test(env.GITHUB_JOB ?? "")
    || env.CALENDAR_FEED_CI_DISPOSABLE_STACK !== `${env.GITHUB_RUN_ID}:${env.GITHUB_RUN_ATTEMPT}:${env.GITHUB_JOB}`
    || env.VERCEL || env.VERCEL_ENV || env.CALENDAR_FEED_VERIFIED_VERCEL_IP) fail("ci-admission-refused");
  for (const [key, expected] of [["SUPABASE_TEST_URL", "http://127.0.0.1:54321"], ["SUPABASE_TEST_DB_URL", "postgresql://postgres:postgres@127.0.0.1:54322/postgres"],
    ["NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321"]]) {
    if (env[key] && env[key] !== expected) fail("endpoint-refused");
  }
  if (env.E2E_PORT && env.E2E_PORT !== "3100") fail("port-refused");
  if (env.CALENDAR_FEED_ORIGINAL_E2E001 !== undefined || env.CALENDAR_FEED_ORIGINAL_CHECKPOINT !== undefined) {
    if (env.CALENDAR_FEED_ORIGINAL_E2E001 !== "1" || mode !== "browser" || env.GITHUB_JOB !== "e2e"
      || env.GITHUB_EVENT_NAME !== "workflow_dispatch" || env.GITHUB_RUN_ATTEMPT !== "1"
      || !/^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? "") || !UUID.test(env.CALENDAR_FEED_ORIGINAL_CHECKPOINT ?? "")
      || env.CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT !== undefined || env.CALENDAR_FEED_CAUSE_PROOF_MODE !== undefined) fail("original-e2e001-admission-refused");
  }
  if (mode === "cause-proof" && (env.GITHUB_RUN_ATTEMPT !== "1" || !/^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? "")
    || !UUID.test(env.CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT ?? "") || env.GITHUB_EVENT_NAME !== "workflow_dispatch")) fail("diagnostic-admission-refused");
}

/** Match the actual Docker publication and job-created project identity, not just loopback. */
export function validateStackIdentity({ db, gateway, checkoutTime, now, status }) {
  if (!Number.isFinite(checkoutTime) || checkoutTime <= 0 || checkoutTime > now) fail("checkout-identity-refused");
  for (const [container, name] of [[db, "/supabase_db_kopplas"], [gateway, "/supabase_kong_kopplas"]]) {
    const created = Date.parse(container?.Created);
    if (!/^[0-9a-f]{64}$/.test(container?.Id ?? "") || container.Name !== name || container.State?.Running !== true
      || container.Config?.Labels?.["com.supabase.cli.project"] !== "kopplas"
      || !Number.isFinite(created) || created < checkoutTime || created > now) fail("stack-identity-refused");
  }
  const networkIds = container => Object.values(container.NetworkSettings?.Networks ?? {}).map(network => network.NetworkID);
  if (!networkIds(db).some(id => /^[0-9a-f]{64}$/.test(id ?? "") && networkIds(gateway).includes(id))) fail("stack-network-refused");
  for (const [container, internal, external] of [[db, "5432/tcp", "54322"], [gateway, "8000/tcp", "54321"]]) {
    const bindings = container.NetworkSettings?.Ports?.[internal];
    if (!Array.isArray(bindings) || !bindings.some(binding => binding.HostPort === external && ["127.0.0.1", "0.0.0.0"].includes(binding.HostIp))
      || bindings.some(binding => binding.HostPort !== external)) fail("stack-port-refused");
  }
  if (status?.API_URL !== "http://127.0.0.1:54321" || status?.DB_URL !== "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    || !status.ANON_KEY || !status.SERVICE_ROLE_KEY) fail("stack-status-refused");
  for (const [key, role] of [[status.ANON_KEY, "anon"], [status.SERVICE_ROLE_KEY, "service_role"]]) {
    let claims;
    try { claims = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8")); } catch { fail("stack-key-refused"); }
    if (claims.iss !== "supabase-demo" || claims.role !== role) fail("stack-key-refused");
  }
}

/** Recognize only the exact non-request Next startup address formats. */
function isSafeInfrastructureAddress(line) {
  return /^\s*(?:\[WebServer\]\s*)?- (?:Local|Network):\s+http:\/\/127\.0\.0\.1:(?:3100|3195)\s*$/.test(stripVTControlCharacters(line));
}

/** Inspect raw output in memory before dropping it; never return its contents. */
export function hasSensitiveOutput(line, { keyId, secret, knownValues = /** @type {string[]} */ ([]) }) {
  if ([keyId, secret, ...knownValues].some(value => value && line.includes(value))) return true;
  if (/\/calendar\/feed\/[A-Za-z0-9_%=-]+|x-vercel-forwarded-for|["']?(?:proof|signature|tokenHash|ipHash)["']?\s*[:=]/i.test(line)) return true;
  if (/(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])/i.test(line)) return true;
  // A capability or base64-encoded SHA256 proof has exactly 32 canonical bytes.
  for (const match of line.matchAll(/(?<![A-Za-z0-9+/_-])[A-Za-z0-9+/_-]{43}=?(?![A-Za-z0-9+/_=-])/g)) {
    const raw = match[0];
    const bytes = Buffer.from(raw, "base64url");
    if (bytes.length === 32 && [bytes.toString("base64url"), bytes.toString("base64")].includes(raw)) return true;
  }
  if (isSafeInfrastructureAddress(line)) return false;
  for (const match of line.matchAll(/(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])/g)) if (isIP(match[0]) === 4) return true;
  for (const match of line.matchAll(/(?<![a-f0-9:])(?:[a-f0-9]{0,4}:){2,}[a-f0-9:.]*(?:%[a-z0-9_.-]+)?/gi)) if (isIP(match[0]) === 6) return true;
  return false;
}

/** Never return/persist raw lines. Detection runs before filtering. */
export function createTelemetryObserver({ keyId, secret, persist, knownValues = /** @type {string[]} */ ([]) }) {
  let responseCount = 0, sensitiveOutputCount = 0;
  const observation = () => persist(JSON.stringify({ event: "calendar_feed.runtime_observation", responseCount, sensitiveOutputCount, sensitiveOutputDetected: sensitiveOutputCount !== 0 }) + "\n");
  const observe = async (line) => {
    let record;
    try { record = JSON.parse(line); } catch { /* Unstructured output is still inspected below. */ }
    const validResponse = record !== null && typeof record === "object" && !Array.isArray(record)
      && Object.keys(record).sort().join(",") === "event,status" && record.event === "calendar_feed.response" && [200, 404, 429, 503].includes(record.status);
    const unexpectedResponse = record?.event === "calendar_feed.response" && !validResponse;
    if (hasSensitiveOutput(line, { keyId, secret, knownValues }) || unexpectedResponse) {
      sensitiveOutputCount++;
      await observation();
    }
    if (!validResponse) return;
    responseCount++;
    await persist(JSON.stringify({ event: record.event, status: record.status }) + "\n");
    await observation();
  };
  return Object.assign(observe, { privacyFailed: () => sensitiveOutputCount !== 0 });
}

/** Occupied listeners are refused; an existing app is never adopted or stopped. */
async function assertPortFree(port) {
  await new Promise((accept, reject) => {
    const server = createServer();
    server.once("error", () => reject(new RuntimeFailure("port-occupied")));
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => server.close(error => error ? reject(new RuntimeFailure("port-probe-failed")) : accept()));
  });
}

/** Linux socket inode proof binds readiness to this captured Next PID. */
export function ownsListenerRecord(port, socketLinks, tcpTable) {
  const localAddress = `0100007F:${port.toString(16).toUpperCase().padStart(4, "0")}`;
  const inodes = new Set(socketLinks.map(link => /^socket:\[(\d+)\]$/.exec(link)?.[1]).filter(Boolean));
  return tcpTable.split("\n").slice(1).some(line => {
    const fields = line.trim().split(/\s+/);
    return fields[1] === localAddress && fields[3] === "0A" && inodes.has(fields[9]);
  });
}

/** Inject the clock and HTTP transport to test readiness without real listeners. */
export async function waitForOwnedHttp({ url, child, signal, now = Date.now, sleep = delay, request = fetch }) {
  const deadline = now() + 60_000;
  let exited = false; child.done.then(() => { exited = true; });
  while (now() < deadline && !signal.aborted && !exited) {
    try {
      if (!await child.ownsListener(3195)) { await sleep(250); continue; }
      const response = await request(`${url}/login`, { redirect: "manual", signal: AbortSignal.timeout(2_000) });
      await response.body?.cancel();
      if (response.status === 200 && !exited && await child.ownsListener(3195)) return;
    } catch { /* No raw request/error output. */ }
    await sleep(250);
  }
  fail("readiness-failed");
}

/** Bound a pending operation; the underlying pg/socket has its own matching timeout. */
async function bounded(promise, ms, code, signal) {
  let timer, onAbort;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new RuntimeFailure(code)), ms);
      onAbort = () => reject(new RuntimeFailure("interrupted"));
      if (signal?.aborted) onAbort(); else signal?.addEventListener("abort", onAbort, { once: true });
    })]);
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", onAbort); }
}

async function processIdentity(pid) {
  if (!pid) return null;
  try {
    const raw = await readFile(`/proc/${pid}/stat`, "utf8");
    const tail = raw.slice(raw.lastIndexOf(")") + 2).trim().split(/\s+/);
    if (!/^\d+$/.test(tail[19] ?? "")) fail("child-identity-unverified");
    return { pid, group: Number(tail[2]), startTime: tail[19] };
  } catch (error) { if (error.code === "ENOENT") return null; fail("child-identity-unverified"); }
}

/** One settlement promise owns all signals. A numeric group alone grants nothing. */
export function createOwnedGroupStopper({ pid, done, capturedIdentity, readIdentity, groupExists, signalGroup, settleOutput, now = Date.now, sleep = delay }) {
  let settlement, absent = false, leaderMissing = false;
  const identityFailure = phase => { throw Object.assign(new RuntimeFailure("child-identity-unverified"), { processPhase: phase }); };
  // Once actual absence is observed, later numeric reuse is outside our custody.
  const exists = () => {
    if (absent) return false;
    if (!groupExists()) absent = true;
    return !absent;
  };
  const readWithin = async (read, deadline) => {
    try {
      const identity = await bounded(Promise.resolve().then(read), Math.max(0, deadline - now()), "child-identity-unverified");
      if (now() >= deadline) identityFailure("identity-read-failed");
      return identity;
    }
    catch { identityFailure("identity-read-failed"); }
  };
  const stage = async (signal, deadline, original) => {
    if (!exists()) return false;
    if (!leaderMissing) {
      const current = await readWithin(() => readIdentity(pid), deadline);
      if (current === null) leaderMissing = true;
      else if (!current || current.pid !== pid || current.group !== pid || original.startTime !== current.startTime) identityFailure("leader-mismatch");
      else signalGroup(signal); // Never signal an anonymous descendant group.
    }
    while (exists() && now() < deadline) await sleep(Math.min(50, deadline - now()));
    return !leaderMissing;
  };
  return () => {
    settlement ??= (async () => {
      let forced = false;
      const firstDeadline = now() + 15_000;
      const original = await readWithin(() => capturedIdentity, firstDeadline);
      if (!Number.isSafeInteger(pid) || pid <= 0 || !original || original.pid !== pid || original.group !== pid
        || typeof original.startTime !== "string" || !/^\d+$/.test(original.startTime)) identityFailure("capture-invalid");
      if (exists()) {
        // Installed Playwright handles SIGINT by awaiting task teardown. Any
        // signal requires the same captured Linux process start time. A leader
        // that exited during inspection gets only passive absence observation,
        // sharing these existing stage budgets with the signaling path.
        await stage("SIGINT", firstDeadline, original);
        if (exists()) forced = await stage("SIGTERM", now() + 5_000, original);
        if (exists()) await stage("SIGKILL", now() + 5_000, original);
        if (exists()) {
          if (leaderMissing) identityFailure("leader-missing-group-live");
          fail("child-custody-unverified");
        }
      }
      const result = await bounded(done, 5_000, "child-settle-unverified");
      await bounded(Promise.resolve().then(settleOutput), 5_000, "child-output-unverified");
      return { forced, signal: result.signal };
    })();
    return settlement;
  };
}

export function launchOwned(command, args, env, cwd, observe, spawnProcess = spawn, readIdentity = processIdentity) {
  const child = spawnProcess(command, args, { cwd, env, detached: true, shell: false, stdio: ["ignore", "pipe", "pipe"] });
  let launchState = "attempted-unverified";
  // Actual adapter events, not completion/exit codes, establish launch facts.
  child.once("spawn", () => { launchState = "started"; });
  child.on("error", () => { if (launchState !== "started" && child.pid === undefined) launchState = "not-created-confirmed"; });
  const capturedIdentity = readIdentity(child.pid);
  capturedIdentity.catch(() => undefined); // The settlement path preserves failure.
  // Register listeners immediately; neither spawn errors nor output escape to raw logs.
  let output = Promise.resolve();
  for (const stream of [child.stdout, child.stderr]) {
    let pending = "";
    stream?.setEncoding("utf8");
    stream?.on("data", chunk => {
      pending += chunk;
      const lines = pending.split(/\r?\n/); pending = lines.pop() ?? "";
      if (pending.length > 16_384) { lines.push(pending); pending = ""; }
      for (const line of lines) output = output.then(() => observe(line));
      // Attach a rejection observer now; the error still propagates through settleOutput.
      output.catch(() => undefined);
    });
    stream?.on("end", () => { if (pending) { output = output.then(() => observe(pending)); output.catch(() => undefined); } });
  }
  const done = new Promise(resolveDone => {
    child.once("error", () => resolveDone({ code: null, signal: null }));
    child.once("close", (code, signal) => resolveDone({ code, signal }));
  });
  const groupExists = () => {
    if (!child.pid) return false;
    try { process.kill(-child.pid, 0); return true; } catch (error) { if (error.code === "ESRCH") return false; throw new RuntimeFailure("child-custody-unverified"); }
  };
  const stop = createOwnedGroupStopper({ pid: child.pid, done, capturedIdentity, readIdentity: processIdentity, groupExists,
    signalGroup: signal => {
      try { process.kill(-child.pid, signal); } catch (error) { if (error.code !== "ESRCH") fail("child-signal-unverified"); }
    }, settleOutput: () => output });
  return {
    done,
    launchState: () => launchState,
    async ownsListener(port) {
      if (!child.pid) return false;
      try {
        const fdDirectory = `/proc/${child.pid}/fd`;
        const links = await Promise.all((await readdir(fdDirectory)).map(async fd => { try { return await readlink(`${fdDirectory}/${fd}`); } catch { return ""; } }));
        return ownsListenerRecord(port, links, await readFile("/proc/net/tcp", "utf8"));
      } catch { return false; }
    },
    stop,
  };
}

function defaultDependencies(env, cwd) {
  const exec = promisify(execFile);
  const capture = async (command, args) => {
    try { return (await exec(command, args, { cwd, env, timeout: 15_000, maxBuffer: 2_000_000 })).stdout; }
    catch { fail("qualification-command-failed"); }
  };
  return {
    now: Date.now, sleep: delay, uuid: randomUUID, entropy: randomBytes,
    registerSignal(handler) { process.on("SIGINT", handler); process.on("SIGTERM", handler); return () => { process.off("SIGINT", handler); process.off("SIGTERM", handler); }; },
    async qualify() {
      if (await realpath(cwd) !== await realpath(env.GITHUB_WORKSPACE ?? "")) fail("checkout-path-refused");
      const gitPath = join(cwd, ".git");
      if (!(await stat(gitPath)).isDirectory()) fail("checkout-identity-refused");
      const checkoutTime = (await stat(gitPath)).birthtimeMs;
      const containers = JSON.parse(await capture("docker", ["inspect", "supabase_db_kopplas", "supabase_kong_kopplas"]));
      const status = JSON.parse(await capture("supabase", ["status", "--output", "json"]));
      const stack = { db: containers[0], gateway: containers[1], checkoutTime, now: Date.now(), status };
      validateStackIdentity(stack);
      const entries = await readdir(join(cwd, "supabase", "migrations"));
      const migrations = entries.filter(name => /^\d{14}_.+\.sql$/.test(name)).sort().map(name => ({ version: name.slice(0, 14), name: name.slice(15, -4) }));
      if (!migrations.some(row => row.name === "personal_calendar_feed") || new Set(migrations.map(row => row.version)).size !== migrations.length) fail("migration-source-refused");
      return { status, migrations, stack };
    },
    portFree: assertPortFree,
    async prepareDiagnostic() {
      const folder = join(cwd, CAUSE_DIRECTORY);
      await mkdir(folder, { recursive: true });
      if ((await readdir(folder)).length) fail("diagnostic-output-not-fresh");
    },
    finishDiagnostic: (receipt, observe, privacy) => finishCauseProof(cwd, env, receipt, observe, privacy),
    async readDiagnostic() { return validateCauseProofObservation(JSON.parse(await readFile(join(cwd, CAUSE_DIRECTORY, "observation.json"), "utf8"))); },
    connect: createCalendarFeedDatabaseClient,
    async createTelemetry() { const folder = await mkdtemp(join(tmpdir(), "kopplas-feed-ci-")); const path = join(folder, "responses.jsonl"); await writeFile(path, "", { mode: 0o600 }); return { path, persist: line => appendFile(path, line, { mode: 0o600 }) }; },
    launch: (command, args, childEnv, observe) => launchOwned(command, args, childEnv, cwd, observe),
    ready: (url, child, signal) => waitForOwnedHttp({ url, child, signal }),
  };
}

/** Test-only dedicated qualification. No credential export to child environments. */
export async function qualifyCalendarFeedCauseProof(env = process.env) {
  validateAdmission("cause-proof", env, process.platform);
  return defaultDependencies(env, ROOT).qualify();
}

/**
 * Injected seams permit lifecycle tests without any process/DB/resource launch.
 * @param {{mode?: string, env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform, cwd?: string}} options
 * @param {object} injected
 */
export async function runCalendarFeedRuntime({ mode, env = process.env, platform = process.platform, cwd = ROOT } = {}, injected = {}) {
  const receipt = { event: "calendar_feed.ci_lifecycle", mode: ["db", "browser", "cause-proof"].includes(mode) ? mode : "refused", ready: false,
    launchAttempted: false, childLaunchState: "not-attempted",
    childExitCodes: /** @type {(number|null)[]} */ ([]), keyDeleted: false, dbClosed: false,
    failures: /** @type {string[]} */ ([]),
    diagnostics: /** @type {{stage:string, category:string, sqlState:string|null}[]} */ ([]),
    setupAuthority: /** @type {null | Record<string,boolean>} */ (null),
    privacyPreflight: /** @type {null | {controls:{name:string,context:string,matchesRequired:boolean,canSet:boolean}[],principal:Record<string,boolean>}} */ (null),
    keyOutcome: /** @type {"not-attempted" | "rollback-confirmed" | "deleted-confirmed" | "unverified"} */ ("not-attempted"),
    custody: /** @type {null | {owner:string, job:string|undefined, vaultUuid:string|null, ownedName:string|null, expiry:string, nextAction:string, resumeCondition:string}} */ (null) };
  const children = new Set();
  let db, keyUuid, ownedName, transactionOpen = false, createUncertain = false, browserTeardownUnverified = false, diagnosticUnverified = false;
  let diagnosticPrepared = false, diagnosticObserve = async () => {}, diagnosticPrivacy = { keyId: "", secret: "" };
  let stage = "admission", createAttempted = false, commitAttempted = false, rollbackConfirmed = false;
  const abort = new AbortController();
  const deps = { ...defaultDependencies(env, cwd), ...injected };
  let unregister = () => undefined;
  const checkSignal = () => { if (abort.signal.aborted) fail("interrupted"); };
  let diagnosticHandle;
  const refreshLaunch = () => {
    if (mode !== "cause-proof" || !diagnosticHandle) return;
    let state; try { state = diagnosticHandle.launchState?.(); } catch { /* Remains uncertain. */ }
    if (state === "started") receipt.childLaunchState = "started";
    else if (state === "not-created-confirmed" && receipt.childLaunchState !== "started") receipt.childLaunchState = state;
  };
  const launch = (command, args, childEnv, observer) => {
    checkSignal();
    if (mode === "cause-proof") { receipt.launchAttempted = true; receipt.childLaunchState = "attempted-unverified"; }
    let handle;
    try { handle = deps.launch(command, [...args], childEnv, observer); }
    catch (error) { if (mode === "cause-proof") diagnosticUnverified = true; throw error; }
    children.add(handle);
    if (mode === "cause-proof") { diagnosticHandle = handle; refreshLaunch(); }
    return handle;
  };
  const run = async (command, args, childEnv, observer, timeout) => {
    const handle = launch(command, args, childEnv, observer);
    let result;
    try { result = await bounded(handle.done, timeout, "child-timeout", abort.signal); }
    catch (error) { if (mode === "browser") browserTeardownUnverified = true; if (mode === "cause-proof") diagnosticUnverified = true; throw error; }
    finally { refreshLaunch(); }
    receipt.childExitCodes.push(result.code);
    if (result.code !== 0 || result.signal) {
      // pnpm can map a killed nested Playwright runner to nonzero/null signal.
      // That is never independent proof of its detached server's teardown.
      if (mode === "browser") browserTeardownUnverified = true;
      if (mode === "cause-proof") diagnosticUnverified = true;
      fail("child-failed");
    }
    const stopped = await handle.stop();
    if (mode === "db" && (stopped?.forced !== false || stopped?.signal !== null)) fail("owned-child-cleanup-failed");
    if (mode === "browser" && (stopped?.forced || stopped?.signal)) { browserTeardownUnverified = true; fail("browser-server-teardown-unverified"); }
    children.delete(handle); // Proven settlement cannot be signalled again later.
  };
  try {
    validateAdmission(mode, env, platform);
    unregister = deps.registerSignal(() => abort.abort()); // Before any resource mutation.
    stage = "qualification";
    const { status, migrations, stack } = await deps.qualify(); checkSignal();
    stage = "port-check";
    if (mode !== "cause-proof") await deps.portFree(mode === "db" ? 3195 : 3100); checkSignal();
    if (mode === "cause-proof") { await deps.prepareDiagnostic(); diagnosticPrepared = true; }
    stage = "database-client";
    db = deps.connect(stack);
    // Consume asynchronous connection errors without logging driver internals.
    db.on?.("error", () => abort.abort());
    stage = "database-connect";
    await db.connect(); checkSignal();
    stage = "setup-authority";
    receipt.setupAuthority = await readCalendarFeedSetupAuthority(db); checkSignal();
    stage = "privacy-preflight";
    receipt.privacyPreflight = await readCalendarFeedPrivacyPreflight(db);
    if (!receipt.privacyPreflight.controls.every(control => control.matchesRequired)) fail("privacy-preflight-refused");
    checkSignal();
    stage = "migration-ledger";
    const ledger = await db.query("select version,name from supabase_migrations.schema_migrations order by version");
    if (JSON.stringify(ledger.rows.map(row => ({ version: String(row.version), name: row.name }))) !== JSON.stringify(migrations)) fail("migration-ledger-refused");
    stage = "feed-functions";
    const functions = await db.query("select p.oid::regprocedure::text as identity, pg_get_userbyid(p.proowner) as owner, p.prosecdef as definer from pg_proc p where p.oid=any(array[" + FEED_FUNCTIONS.map((_, i) => `to_regprocedure($${i + 1})`).join(",") + "])", FEED_FUNCTIONS);
    if (functions.rows.length !== FEED_FUNCTIONS.length || functions.rows.some(row => row.owner !== "calendar_feed_owner" || row.definer !== true)) fail("feed-functions-refused");
    checkSignal();
    stage = "key-id";
    const keySuffix = deps.uuid();
    if (!UUID.test(keySuffix)) fail("key-id-refused");
    const keyId = `ci_${keySuffix}`;
    ownedName = `calendar_feed_attestation_${keyId}`;
    stage = "entropy";
    const secret = Buffer.from(deps.entropy(32)).toString("base64url");
    if (!/^[A-Za-z0-9_-]{43}$/.test(secret)) fail("entropy-refused");
    stage = "telemetry";
    const telemetry = await deps.createTelemetry();
    const observe = createTelemetryObserver({ keyId, secret, persist: telemetry.persist });
    diagnosticObserve = observe;
    diagnosticPrivacy = { keyId, secret };
    stage = "transaction-begin";
    await db.query("begin"); transactionOpen = true;
    stage = "key-collision";
    const collision = await db.query("select id from vault.secrets where name=$1", [ownedName]);
    if (collision.rows.length) fail("key-collision-refused");
    checkSignal();
    stage = "key-create";
    createUncertain = true; createAttempted = true;
    const created = await db.query("select vault.create_secret($1,$2,$3) as id", [secret, ownedName, "Disposable calendar feed CI verification"]);
    keyUuid = created.rows[0]?.id;
    if (!UUID.test(keyUuid ?? "")) { keyUuid = undefined; fail("key-create-unverified"); }
    checkSignal();
    stage = "transaction-commit";
    commitAttempted = true; // Irrevocable: a lost COMMIT response cannot be disproved by ROLLBACK.
    await db.query("commit"); transactionOpen = false; createUncertain = false;
    stage = "runtime";
    const childEnv = { ...env, SUPABASE_TEST_REQUIRED: "1", SUPABASE_TEST_URL: status.API_URL, SUPABASE_TEST_ANON_KEY: status.ANON_KEY,
      SUPABASE_TEST_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY, SUPABASE_TEST_DB_URL: status.DB_URL,
      NEXT_PUBLIC_SUPABASE_URL: status.API_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
      NEXT_PUBLIC_APP_URL: `http://127.0.0.1:${mode === "db" ? 3195 : 3100}`, E2E_PORT: "3100",
      CALENDAR_FEED_ATTESTATION_KEY_ID: keyId, CALENDAR_FEED_ATTESTATION_SECRET: secret,
      CALENDAR_FEED_TEST_LOG_FILE: telemetry.path, CALENDAR_FEED_TEST_BASE_URL: `http://127.0.0.1:${mode === "db" ? 3195 : 3100}` };
    if (mode === "cause-proof") {
      childEnv.CALENDAR_FEED_CAUSE_PROOF_MODE = "1";
      await run("pnpm", CAUSE_PROOF_ARGS, childEnv, observe, 240_000);
      try { await deps.readDiagnostic(); } catch { diagnosticUnverified = true; fail("diagnostic-settlement-unverified"); }
    } else if (mode === "db") {
      await run(process.execPath, ["node_modules/next/dist/bin/next", "build"], childEnv, observe, 240_000);
      const server = launch(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3195"], childEnv, observe);
      await deps.ready(childEnv.CALENDAR_FEED_TEST_BASE_URL, server, abort.signal); receipt.ready = true;
      await run("pnpm", INTEGRATION_ARGS, childEnv, observe, 1_800_000);
    } else {
      await run("pnpm", env.CALENDAR_FEED_ORIGINAL_E2E001 === "1" ? ORIGINAL_E2E001_ARGS : BROWSER_ARGS, childEnv, observe, 1_800_000);
    }
    checkSignal();
  } catch (error) {
    // Only our fixed codes are emitted; never preserve native driver/request/assertion details.
    const code = error instanceof RuntimeFailure ? error.message : "runtime-failed";
    receipt.failures.push(code);
    receipt.diagnostics.push(safeDiagnostic(stage, error));
  } finally {
    for (const handle of [...children].reverse()) {
      try {
        const stopped = await handle.stop();
        if (mode === "db" && (stopped?.forced !== false || stopped?.signal !== null)) fail("owned-child-cleanup-failed");
        if (mode === "browser" && (stopped?.forced || stopped?.signal)) browserTeardownUnverified = true;
        children.delete(handle);
      } catch (error) { receipt.failures.push("owned-child-cleanup-failed"); receipt.diagnostics.push(safeDiagnostic("child-cleanup", error)); }
    }
    if (browserTeardownUnverified && !receipt.failures.includes("browser-server-teardown-unverified")) receipt.failures.push("browser-server-teardown-unverified");
    if (diagnosticUnverified) receipt.failures.push("diagnostic-work-settlement-unverified");
    if (transactionOpen) {
      try { await db.query("rollback"); transactionOpen = false; createUncertain = false; rollbackConfirmed = true; }
      catch (error) { receipt.failures.push("transaction-rollback-unverified"); receipt.diagnostics.push(safeDiagnostic("transaction-rollback", error)); }
    }
    // A failed/uncertain DB runtime may retain backend shared-state work even
    // after frontend child settlement. Keep the existing exact key under job
    // custody; stop/end is not rollback or canonical-restoration proof.
    if (mode === "db" && stage === "runtime" && abort.signal.aborted && !receipt.failures.includes("interrupted")) receipt.failures.push("interrupted");
    const dbRuntimeUnverified = mode === "db" && stage === "runtime"
      && (receipt.failures.length > 0 || abort.signal.aborted);
    // Never delete a key while a captured child or transaction remains unverified.
    if (keyUuid && !transactionOpen && !dbRuntimeUnverified && !browserTeardownUnverified && !diagnosticUnverified && !receipt.failures.includes("owned-child-cleanup-failed")) {
      try {
        const result = await db.query("delete from vault.secrets where id=$1::uuid and name=$2 returning id", [keyUuid, ownedName]);
        const remaining = await db.query("select id,name from vault.secrets where id=$1::uuid", [keyUuid]);
        if (remaining.rows.length || result.rows.some(row => row.id !== keyUuid)) fail("key-delete-unverified");
        receipt.keyDeleted = true;
      } catch (error) { receipt.failures.push("owned-key-cleanup-failed"); receipt.diagnostics.push(safeDiagnostic("key-cleanup", error)); }
    } else if (createUncertain) receipt.failures.push("key-create-outcome-unverified");
    if (db) { try { await bounded(db.end(), 5_000, "db-close-unverified"); receipt.dbClosed = true; } catch (error) { receipt.failures.push("db-close-unverified"); receipt.diagnostics.push(safeDiagnostic("database-close", error)); } }
    unregister();
    refreshLaunch(); // Late actual spawn evidence survives wait/cleanup failures.
    if (receipt.failures.length && (createUncertain || (keyUuid && !receipt.keyDeleted) || receipt.failures.some(code => code.includes("cleanup") || code.includes("unverified")))) {
      receipt.custody = { owner: "Isolated CI job operator", job: env.CALENDAR_FEED_CI_DISPOSABLE_STACK,
        vaultUuid: keyUuid ?? null, ownedName: ownedName ?? null, expiry: "Destruction of this disposable GitHub-hosted job",
        nextAction: "Inspect captured CI child/key ownership in the disposable job; do not retry creation or delete by name.",
        resumeCondition: "Owned children settled and the captured UUID/name key is confirmed absent, or the entire disposable job has ended." };
    }
    receipt.keyOutcome = receipt.keyDeleted ? "deleted-confirmed" : !createAttempted ? "not-attempted"
      : rollbackConfirmed && !commitAttempted ? "rollback-confirmed" : "unverified";
  }
  if (mode === "cause-proof" && diagnosticPrepared) {
    try { if (!await deps.finishDiagnostic(receipt, diagnosticObserve, diagnosticPrivacy)) receipt.failures.push("diagnostic-capture-failed"); }
    catch { receipt.failures.push("diagnostic-capture-failed"); }
  }
  return { exitCode: receipt.failures.length ? 1 : 0, receipt };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await runCalendarFeedRuntime({ mode: process.argv.length === 3 ? process.argv[2] : undefined });
  console.log(JSON.stringify(result.receipt));
  process.exitCode = result.exitCode;
}
