/** Disposable GitHub-hosted CI only. This is not local resource-launch authority. */
import { spawn, execFile } from "node:child_process";
import { promisify, stripVTControlCharacters } from "node:util";
import { randomBytes, randomUUID } from "node:crypto";
import { readdir, stat, realpath, mkdtemp, appendFile, writeFile, readFile, readlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, isIP } from "node:net";
import pg from "pg";

export const INTEGRATION_ARGS = Object.freeze(["run", "test:int", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/full-integration.json"]);
export const BROWSER_ARGS = Object.freeze(["run", "test:smoke"]);
export const FEED_FUNCTIONS = Object.freeze([
  "public.fetch_calendar_feed(text,text,jsonb,text)",
  "public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text)",
  "public.read_calendar_feed_status(uuid,uuid)", "public.read_calendar_feed_abuse(uuid)",
]);
const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
class RuntimeFailure extends Error {}
const fail = (code) => { throw new RuntimeFailure(code); };
const delay = (ms) => new Promise(resolveDelay => setTimeout(resolveDelay, ms));

/** Pure prerequisite validation: CI flags alone do not qualify a machine. */
export function validateAdmission(mode, env, platform) {
  if (!["db", "browser"].includes(mode)) fail("mode-refused");
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
  return async (line) => {
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
  let settlement;
  const signalVerified = async signal => {
    const original = await capturedIdentity;
    const current = await readIdentity(pid);
    if (!original || !current || original.pid !== pid || current.pid !== pid || original.group !== pid || current.group !== pid
      || original.startTime !== current.startTime) fail("child-identity-unverified");
    signalGroup(signal);
  };
  const waitUntilGone = async ms => {
    const deadline = now() + ms;
    while (groupExists() && now() < deadline) await sleep(50);
  };
  return () => {
    settlement ??= (async () => {
      let forced = false;
      if (groupExists()) {
        // Installed Playwright handles SIGINT by awaiting task teardown. Any
        // later signal requires the same captured Linux process start time.
        await signalVerified("SIGINT");
        await waitUntilGone(15_000);
        if (groupExists()) { forced = true; await signalVerified("SIGTERM"); }
        await waitUntilGone(5_000);
        if (groupExists()) await signalVerified("SIGKILL");
        await waitUntilGone(5_000);
        if (groupExists()) fail("child-custody-unverified");
      }
      const result = await bounded(done, 5_000, "child-settle-unverified");
      await settleOutput();
      return { forced, signal: result.signal };
    })();
    return settlement;
  };
}

function launchOwned(command, args, env, cwd, observe) {
  const child = spawn(command, args, { cwd, env, detached: true, shell: false, stdio: ["ignore", "pipe", "pipe"] });
  const capturedIdentity = processIdentity(child.pid);
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
      validateStackIdentity({ db: containers[0], gateway: containers[1], checkoutTime, now: Date.now(), status });
      const entries = await readdir(join(cwd, "supabase", "migrations"));
      const migrations = entries.filter(name => /^\d{14}_.+\.sql$/.test(name)).sort().map(name => ({ version: name.slice(0, 14), name: name.slice(15, -4) }));
      if (!migrations.some(row => row.name === "personal_calendar_feed") || new Set(migrations.map(row => row.version)).size !== migrations.length) fail("migration-source-refused");
      return { status, migrations };
    },
    portFree: assertPortFree,
    connect(status) { return new pg.Client({ connectionString: status.DB_URL, connectionTimeoutMillis: 5_000, query_timeout: 10_000, statement_timeout: 8_000,
      // Session-only settings: native PostgreSQL error/statement logging must
      // not persist the ephemeral secret's extended-query bind parameters.
      options: "-c log_statement=none -c log_min_error_statement=panic -c log_parameter_max_length=0 -c log_parameter_max_length_on_error=0" }); },
    async createTelemetry() { const folder = await mkdtemp(join(tmpdir(), "kopplas-feed-ci-")); const path = join(folder, "responses.jsonl"); await writeFile(path, "", { mode: 0o600 }); return { path, persist: line => appendFile(path, line, { mode: 0o600 }) }; },
    launch: (command, args, childEnv, observe) => launchOwned(command, args, childEnv, cwd, observe),
    ready: (url, child, signal) => waitForOwnedHttp({ url, child, signal }),
  };
}

/**
 * Injected seams permit lifecycle tests without any process/DB/resource launch.
 * @param {{mode?: string, env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform, cwd?: string}} options
 * @param {object} injected
 */
export async function runCalendarFeedRuntime({ mode, env = process.env, platform = process.platform, cwd = ROOT } = {}, injected = {}) {
  const receipt = { event: "calendar_feed.ci_lifecycle", mode: ["db", "browser"].includes(mode) ? mode : "refused", ready: false,
    childExitCodes: /** @type {(number|null)[]} */ ([]), keyDeleted: false, dbClosed: false,
    failures: /** @type {string[]} */ ([]),
    custody: /** @type {null | {owner:string, job:string|undefined, vaultUuid:string|null, ownedName:string|null, expiry:string, nextAction:string, resumeCondition:string}} */ (null) };
  const children = new Set();
  let db, keyUuid, ownedName, transactionOpen = false, createUncertain = false, browserTeardownUnverified = false;
  const abort = new AbortController();
  const deps = { ...defaultDependencies(env, cwd), ...injected };
  let unregister = () => undefined;
  const checkSignal = () => { if (abort.signal.aborted) fail("interrupted"); };
  const launch = (command, args, childEnv, observer) => { checkSignal(); const handle = deps.launch(command, [...args], childEnv, observer); children.add(handle); return handle; };
  const run = async (command, args, childEnv, observer, timeout) => {
    const handle = launch(command, args, childEnv, observer);
    let result;
    try { result = await bounded(handle.done, timeout, "child-timeout", abort.signal); }
    catch (error) { if (mode === "browser") browserTeardownUnverified = true; throw error; }
    receipt.childExitCodes.push(result.code);
    if (result.code !== 0 || result.signal) {
      // pnpm can map a killed nested Playwright runner to nonzero/null signal.
      // That is never independent proof of its detached server's teardown.
      if (mode === "browser") browserTeardownUnverified = true;
      fail("child-failed");
    }
    const stopped = await handle.stop();
    if (mode === "browser" && (stopped?.forced || stopped?.signal)) { browserTeardownUnverified = true; fail("browser-server-teardown-unverified"); }
    children.delete(handle); // Proven settlement cannot be signalled again later.
  };
  try {
    validateAdmission(mode, env, platform);
    unregister = deps.registerSignal(() => abort.abort()); // Before any resource mutation.
    const { status, migrations } = await deps.qualify(); checkSignal();
    await deps.portFree(mode === "db" ? 3195 : 3100); checkSignal();
    db = deps.connect(status);
    // Consume asynchronous connection errors without logging driver internals.
    db.on?.("error", () => abort.abort());
    await db.connect(); checkSignal();
    const ledger = await db.query("select version,name from supabase_migrations.schema_migrations order by version");
    if (JSON.stringify(ledger.rows.map(row => ({ version: String(row.version), name: row.name }))) !== JSON.stringify(migrations)) fail("migration-ledger-refused");
    const functions = await db.query("select p.oid::regprocedure::text as identity, pg_get_userbyid(p.proowner) as owner, p.prosecdef as definer from pg_proc p where p.oid=any(array[" + FEED_FUNCTIONS.map((_, i) => `to_regprocedure($${i + 1})`).join(",") + "])", FEED_FUNCTIONS);
    if (functions.rows.length !== FEED_FUNCTIONS.length || functions.rows.some(row => row.owner !== "calendar_feed_owner" || row.definer !== true)) fail("feed-functions-refused");
    checkSignal();
    const keySuffix = deps.uuid();
    if (!UUID.test(keySuffix)) fail("key-id-refused");
    const keyId = `ci_${keySuffix}`;
    ownedName = `calendar_feed_attestation_${keyId}`;
    const secret = Buffer.from(deps.entropy(32)).toString("base64url");
    if (!/^[A-Za-z0-9_-]{43}$/.test(secret)) fail("entropy-refused");
    const telemetry = await deps.createTelemetry();
    const observe = createTelemetryObserver({ keyId, secret, persist: telemetry.persist });
    await db.query("begin"); transactionOpen = true;
    const collision = await db.query("select id from vault.secrets where name=$1", [ownedName]);
    if (collision.rows.length) fail("key-collision-refused");
    checkSignal();
    createUncertain = true;
    const created = await db.query("select vault.create_secret($1,$2,$3) as id", [secret, ownedName, "Disposable calendar feed CI verification"]);
    keyUuid = created.rows[0]?.id;
    if (!UUID.test(keyUuid ?? "")) { keyUuid = undefined; fail("key-create-unverified"); }
    checkSignal();
    await db.query("commit"); transactionOpen = false; createUncertain = false;
    const childEnv = { ...env, SUPABASE_TEST_REQUIRED: "1", SUPABASE_TEST_URL: status.API_URL, SUPABASE_TEST_ANON_KEY: status.ANON_KEY,
      SUPABASE_TEST_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY, SUPABASE_TEST_DB_URL: status.DB_URL,
      NEXT_PUBLIC_SUPABASE_URL: status.API_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
      NEXT_PUBLIC_APP_URL: `http://127.0.0.1:${mode === "db" ? 3195 : 3100}`, E2E_PORT: "3100",
      CALENDAR_FEED_ATTESTATION_KEY_ID: keyId, CALENDAR_FEED_ATTESTATION_SECRET: secret,
      CALENDAR_FEED_TEST_LOG_FILE: telemetry.path, CALENDAR_FEED_TEST_BASE_URL: `http://127.0.0.1:${mode === "db" ? 3195 : 3100}` };
    if (mode === "db") {
      await run(process.execPath, ["node_modules/next/dist/bin/next", "build"], childEnv, observe, 240_000);
      const server = launch(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3195"], childEnv, observe);
      await deps.ready(childEnv.CALENDAR_FEED_TEST_BASE_URL, server, abort.signal); receipt.ready = true;
      await run("pnpm", INTEGRATION_ARGS, childEnv, observe, 1_800_000);
    } else {
      await run("pnpm", BROWSER_ARGS, childEnv, observe, 1_800_000);
    }
    checkSignal();
  } catch (error) {
    // Only our fixed codes are emitted; never preserve native driver/request/assertion details.
    const code = error instanceof RuntimeFailure ? error.message : "runtime-failed";
    receipt.failures.push(code);
  } finally {
    for (const handle of [...children].reverse()) {
      try {
        const stopped = await handle.stop();
        if (mode === "browser" && (stopped?.forced || stopped?.signal)) browserTeardownUnverified = true;
        children.delete(handle);
      } catch { receipt.failures.push("owned-child-cleanup-failed"); }
    }
    if (browserTeardownUnverified && !receipt.failures.includes("browser-server-teardown-unverified")) receipt.failures.push("browser-server-teardown-unverified");
    if (transactionOpen) {
      try { await db.query("rollback"); transactionOpen = false; createUncertain = false; }
      catch { receipt.failures.push("transaction-rollback-unverified"); }
    }
    // Never delete a key while a captured child or transaction remains unverified.
    if (keyUuid && !transactionOpen && !browserTeardownUnverified && !receipt.failures.includes("owned-child-cleanup-failed")) {
      try {
        const result = await db.query("delete from vault.secrets where id=$1::uuid and name=$2 returning id", [keyUuid, ownedName]);
        const remaining = await db.query("select id,name from vault.secrets where id=$1::uuid", [keyUuid]);
        if (remaining.rows.length || result.rows.some(row => row.id !== keyUuid)) fail("key-delete-unverified");
        receipt.keyDeleted = true;
      } catch { receipt.failures.push("owned-key-cleanup-failed"); }
    } else if (createUncertain) receipt.failures.push("key-create-outcome-unverified");
    if (db) { try { await bounded(db.end(), 5_000, "db-close-unverified"); receipt.dbClosed = true; } catch { receipt.failures.push("db-close-unverified"); } }
    unregister();
    if (receipt.failures.length && (createUncertain || (keyUuid && !receipt.keyDeleted) || receipt.failures.some(code => code.includes("cleanup") || code.includes("unverified")))) {
      receipt.custody = { owner: "Isolated CI job operator", job: env.CALENDAR_FEED_CI_DISPOSABLE_STACK,
        vaultUuid: keyUuid ?? null, ownedName: ownedName ?? null, expiry: "Destruction of this disposable GitHub-hosted job",
        nextAction: "Inspect captured CI child/key ownership in the disposable job; do not retry creation or delete by name.",
        resumeCondition: "Owned children settled and the captured UUID/name key is confirmed absent, or the entire disposable job has ended." };
    }
  }
  return { exitCode: receipt.failures.length ? 1 : 0, receipt };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await runCalendarFeedRuntime({ mode: process.argv.length === 3 ? process.argv[2] : undefined });
  console.log(JSON.stringify(result.receipt));
  process.exitCode = result.exitCode;
}
