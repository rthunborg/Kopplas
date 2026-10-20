import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";
import { INTEGRATION_ARGS, BROWSER_ARGS, FEED_FUNCTIONS, validateAdmission, validateStackIdentity, createTelemetryObserver, hasSensitiveOutput, createOwnedGroupStopper, ownsListenerRecord, waitForOwnedHttp, runCalendarFeedRuntime } from "../../../../scripts/ci/with-calendar-feed-runtime.mjs";

const env = {
  NODE_ENV: "test" as const,
  CI: "true", GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: "1", GITHUB_JOB: "db",
  CALENDAR_FEED_CI_DISPOSABLE_STACK: "123:1:db",
};
const keyId = "f8c9b152-1e88-471a-82fa-d45a80394e40";
const keyUuid = "905a0de8-b110-4f89-9096-010db4c6ef12";
const status = { API_URL: "http://127.0.0.1:54321", DB_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres", ANON_KEY: "test-anon", SERVICE_ROLE_KEY: "test-service" };
const migrations = [{ version: "20261020220000", name: "personal_calendar_feed" }];

test("CI command projection rejects entry and argv drift and cannot erase unrelated workflow or wrapper changes", () => {
  const workflow = readFileSync(new URL("../../../../.github/workflows/ci.yml", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const wrapper = readFileSync(new URL("../../../../scripts/ci/with-calendar-feed-runtime.mjs", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const projected = projectCalendarFeedCiCommands(workflow, wrapper);
  assert.ok(projected.includes("pnpm run test:int --reporter=default --reporter=github-actions --reporter=json --outputFile=test-results/full-integration.json"));
  assert.ok(projected.includes("run: pnpm run test:smoke"));
  for (const [before, after] of [
    ["node scripts/ci/with-calendar-feed-runtime.mjs db", "pnpm run test:int"],
    ["node scripts/ci/with-calendar-feed-runtime.mjs db", "node scripts/ci/with-calendar-feed-runtime.mjs browser"],
    ["node scripts/ci/with-calendar-feed-runtime.mjs browser", "pnpm run test:smoke"],
    ["node scripts/ci/with-calendar-feed-runtime.mjs browser", "node scripts/ci/with-calendar-feed-runtime.mjs browser --grep feed"],
    ["      - name: Essential authentication smoke (production app and local Auth)", "      - name: Changed smoke gate"],
  ]) {
    assert.ok(workflow.includes(before));
    assert.throws(() => projectCalendarFeedCiCommands(workflow.replace(before, after), wrapper), /exact workflow entry/);
  }
  assert.throws(() => projectCalendarFeedCiCommands(`${workflow}\nnode scripts/ci/with-calendar-feed-runtime.mjs db\n`, wrapper), /unexpected wrapper entry/);
  for (const [before, after] of [
    ['"run", "test:int"', '"run", "test:int:pilot"'],
    ['"--reporter=default", ', ""], ['"--reporter=github-actions", ', ""], ['"--reporter=json", ', ""],
    ['"--outputFile=test-results/full-integration.json"', '"--outputFile=test-results/foreign.json"'],
    ['"run", "test:smoke"', '"run", "test:e2e"'],
    ["export const BROWSER_ARGS", "const BROWSER_ARGS"],
  ]) {
    assert.ok(wrapper.includes(before));
    assert.throws(() => projectCalendarFeedCiCommands(workflow, wrapper.replace(before, after)), /declaration|argv/);
  }
  assert.throws(() => projectCalendarFeedCiCommands(workflow, `${wrapper}\n// unrelated source drift\n`), /reviewed wrapper source/);
  const inverseHash = (text: string) => createHash("sha256").update(text
    .replace(/      # FIXED-APPLICATION-INPUT-BEGIN\n[\s\S]*?      # FIXED-APPLICATION-INPUT-END\n/, "")
    .replace(/\n  # FIXED-APPLICATION-JOB-BEGIN\n[\s\S]*?  # FIXED-APPLICATION-JOB-END\n$/, "")).digest("hex");
  const originalHash = "48adc320f459b648212ee87950facc76cdda306bb0a14e72f2786c67c2c689e0";
  assert.equal(inverseHash(projected), originalHash);
  const unrelated = projectCalendarFeedCiCommands(`# unrelated workflow drift\n${workflow}`, wrapper);
  assert.ok(unrelated.startsWith("# unrelated workflow drift\n"));
  assert.notEqual(inverseHash(unrelated), originalHash);
});
type Query = { sql: string; params?: unknown[] };
function harness(options: {
  query?: (call: Query) => { rows: Record<string, unknown>[] } | undefined;
  failChild?: number; failStops?: boolean; occupied?: boolean; readinessFailure?: boolean; signalAtCreate?: boolean; closeFailure?: boolean;
  forcedStop?: boolean;
} = {}) {
  const events: string[] = [];
  const queries: Query[] = [];
  const launches: { command: string; args: string[]; childEnv: Record<string, string> }[] = [];
  let signal: () => void = () => undefined;
  const deps = {
    registerSignal(handler: () => void) { events.push("signals-registered"); signal = handler; return () => events.push("signals-unregistered"); },
    async qualify() { events.push("qualified"); return { status, migrations }; },
    async portFree() { events.push("port-checked"); if (options.occupied) throw new Error("fixture occupied"); },
    connect() {
      return {
        async connect() { events.push("connected"); },
        async query(sql: string, params?: unknown[]) {
          events.push(sql.startsWith("select vault.create_secret") ? "create" : sql.startsWith("delete") ? "delete" : sql);
          const call = { sql, params }; queries.push(call);
          const override = options.query?.(call); if (override) return override;
          if (sql.includes("schema_migrations")) return { rows: migrations };
          if (sql.includes("from pg_proc")) return { rows: FEED_FUNCTIONS.map(() => ({ owner: "calendar_feed_owner", definer: true })) };
          if (sql.startsWith("select vault.create_secret")) { if (options.signalAtCreate) signal(); return { rows: [{ id: keyUuid }] }; }
          if (sql.startsWith("delete")) return { rows: [{ id: keyUuid }] };
          return { rows: [] };
        },
        async end() { events.push("db-closed"); if (options.closeFailure) throw new Error("fixture close"); },
      };
    },
    uuid: () => keyId, entropy: () => Buffer.alloc(32, 7),
    async createTelemetry() { return { path: "/private/allowlisted.jsonl", persist: async () => undefined }; },
    launch(command: string, args: string[], childEnv: Record<string, string>) {
      const index = launches.length;
      launches.push({ command, args, childEnv }); events.push(`launch:${index}`);
      const isServer = args.includes("start");
      let finish: (result: { code: number; signal: null }) => void = () => undefined;
      const done = isServer ? new Promise<{ code: number; signal: null }>(resolve => { finish = resolve; }) : Promise.resolve({ code: options.failChild === index ? 17 : 0, signal: null });
      return { done, async stop() { events.push(`settled:${index}`); finish({ code: 0, signal: null }); if (options.failStops) throw new Error("fixture custody"); return { forced: options.forcedStop ?? false, signal: null }; } };
    },
    async ready() { events.push("ready"); if (options.readinessFailure) throw new Error("fixture readiness"); },
  };
  return { deps, events, queries, launches, signal: () => signal() };
}
async function runFixture(mode: string, h = harness()) {
  const result = await runCalendarFeedRuntime({ mode, env, platform: "linux" }, h.deps);
  return { ...h, ...result };
}

test("CI admission rejects arbitrary modes, local actors, hosted URLs and mismatched job identities", () => {
  validateAdmission("db", env, "linux");
  const refused = [
    { mode: "pnpm test", env, platform: "linux" }, { mode: "browser extra", env, platform: "linux" },
    { mode: "db", env, platform: "win32" },
    ...[{ CI: "1" }, { GITHUB_ACTIONS: "false" }, { RUNNER_ENVIRONMENT: "self-hosted" }, { GITHUB_RUN_ID: "" },
      { CALENDAR_FEED_CI_DISPOSABLE_STACK: "another-job" }, { VERCEL: "1" }, { CALENDAR_FEED_VERIFIED_VERCEL_IP: "1" },
      { SUPABASE_TEST_URL: "https://example.supabase.co" }, { SUPABASE_TEST_DB_URL: "postgresql://host/database" },
      { NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321" }, { E2E_PORT: "3000" }].map(change => ({ mode: "db", env: { ...env, ...change }, platform: "linux" })),
  ];
  for (const entry of refused) assert.throws(() => validateAdmission(entry.mode, entry.env, entry.platform));
});

function identity() {
  const jwt = (role: string) => `header.${Buffer.from(JSON.stringify({ iss: "supabase-demo", role })).toString("base64url")}.signature`;
  const container = (kind: "db" | "kong") => ({ Id: (kind === "db" ? "a" : "b").repeat(64), Name: `/supabase_${kind}_kopplas`, Created: "2026-10-20T10:01:00Z", State: { Running: true },
    Config: { Labels: { "com.supabase.cli.project": "kopplas" } }, NetworkSettings: { Networks: { project: { NetworkID: "c".repeat(64) } },
      Ports: { [kind === "db" ? "5432/tcp" : "8000/tcp"]: [{ HostIp: "127.0.0.1", HostPort: kind === "db" ? "54322" : "54321" }] } } });
  return { db: container("db"), gateway: container("kong"), checkoutTime: Date.parse("2026-10-20T10:00:00Z"), now: Date.parse("2026-10-20T10:02:00Z"),
    status: { ...status, ANON_KEY: jwt("anon"), SERVICE_ROLE_KEY: jwt("service_role") } };
}

test("stack qualification proves fresh Docker identity, labels, shared network, publication and demo issuer", () => {
  validateStackIdentity(identity());
  const changes = [
    (v: ReturnType<typeof identity>) => { v.checkoutTime = 0; },
    (v: ReturnType<typeof identity>) => { v.checkoutTime = Number.NaN; },
    (v: ReturnType<typeof identity>) => { v.checkoutTime = v.now + 1; },
    (v: ReturnType<typeof identity>) => { v.db.Created = "invalid"; },
    (v: ReturnType<typeof identity>) => { v.db.Created = "2026-10-19T10:00:00Z"; },
    (v: ReturnType<typeof identity>) => { v.db.Created = "2026-10-21T10:00:00Z"; },
    (v: ReturnType<typeof identity>) => { v.db.Id = ""; },
    (v: ReturnType<typeof identity>) => { v.db.Name = "/foreign"; },
    (v: ReturnType<typeof identity>) => { v.gateway.State.Running = false; },
    (v: ReturnType<typeof identity>) => { v.db.Config.Labels["com.supabase.cli.project"] = "foreign"; },
    (v: ReturnType<typeof identity>) => { v.db.NetworkSettings.Networks.project.NetworkID = "d".repeat(64); },
    (v: ReturnType<typeof identity>) => { v.db.NetworkSettings.Ports["5432/tcp"][0].HostPort = "54323"; },
    (v: ReturnType<typeof identity>) => { v.status.API_URL = "https://hosted.supabase.co"; },
    (v: ReturnType<typeof identity>) => { v.status.ANON_KEY = "invalid"; },
  ];
  for (const change of changes) { const fixture = identity(); change(fixture); assert.throws(() => validateStackIdentity(fixture)); }
});

test("refusal and occupied ports happen before any DB or Vault mutation", async () => {
  const local = harness();
  assert.equal((await runCalendarFeedRuntime({ mode: "db", env, platform: "win32" }, local.deps)).exitCode, 1);
  assert.equal(local.events.length, 0);
  const occupied = await runFixture("db", harness({ occupied: true }));
  assert.equal(occupied.exitCode, 1); assert.equal(occupied.queries.length, 0); assert.equal(occupied.launches.length, 0);
});

test("HTTP readiness requires the captured PID's own loopback LISTEN inode", () => {
  const table = "header\n 0: 0100007F:0C7B 00000000:0000 0A 00000000:00000000 00:00000000 00000000 1001 0 12777\n";
  assert.equal(ownsListenerRecord(3195, ["socket:[12777]"], table), true);
  assert.equal(ownsListenerRecord(3195, ["socket:[99999]"], table), false);
  assert.equal(ownsListenerRecord(3194, ["socket:[12777]"], table), false);
  assert.equal(ownsListenerRecord(3195, ["socket:[12777]"], table.replace("0A", "01")), false);
  assert.equal(ownsListenerRecord(3195, ["socket:[12777]"], table.replace("0100007F", "00000000")), false);
});

test("readiness clock is bounded and never probes an unowned listener", async () => {
  let time = 0, requests = 0;
  const pending = new Promise(() => undefined);
  const fakeRequest = async () => { requests++; return new Response("", { status: 200 }); };
  await assert.rejects(waitForOwnedHttp({ url: "http://127.0.0.1:3195", child: { done: pending, ownsListener: async () => false }, signal: new AbortController().signal,
    now: () => time, sleep: async (ms: number) => { time += ms; }, request: fakeRequest }));
  assert.equal(time, 60_000); assert.equal(requests, 0);
  await waitForOwnedHttp({ url: "http://127.0.0.1:3195", child: { done: pending, ownsListener: async () => true }, signal: new AbortController().signal,
    now: () => 0, sleep: async () => undefined, request: fakeRequest });
  assert.equal(requests, 1);
});

test("current full ledger and feed function ownership are checked before mutation", async () => {
  for (const query of [
    (call: Query) => call.sql.includes("schema_migrations") ? { rows: [{ version: "old", name: "old" }] } : undefined,
    (call: Query) => call.sql.includes("from pg_proc") ? { rows: FEED_FUNCTIONS.map(() => ({ owner: "postgres", definer: true })) } : undefined,
  ]) {
    const result = await runFixture("db", harness({ query }));
    assert.equal(result.exitCode, 1); assert.equal(result.launches.length, 0);
    assert.ok(!result.queries.some(call => call.sql === "begin" || call.sql.includes("vault.create_secret")));
  }
});

test("DB mode fixes full argv, builds with the child's public config and settles every owned group before exact-key deletion", async () => {
  const result = await runFixture("db");
  assert.equal(result.exitCode, 0); assert.equal(result.receipt.keyDeleted, true); assert.equal(result.receipt.dbClosed, true);
  const required = ["run", "test:int", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/full-integration.json"];
  assert.deepEqual([...INTEGRATION_ARGS], required);
  assert.deepEqual(result.launches.map(launch => launch.args), [["node_modules/next/dist/bin/next", "build"], ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3195"], required]);
  assert.equal(result.launches[2].command, "pnpm");
  assert.ok(result.launches.every(launch => launch.childEnv.SUPABASE_TEST_REQUIRED === "1" && launch.childEnv.CALENDAR_FEED_TEST_BASE_URL === "http://127.0.0.1:3195"));
  assert.ok(result.launches.every(launch => launch.childEnv.NEXT_PUBLIC_SUPABASE_URL === status.API_URL && launch.childEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY === status.ANON_KEY));
  assert.ok(result.launches.every(launch => launch.childEnv.CALENDAR_FEED_ATTESTATION_SECRET === result.launches[0].childEnv.CALENDAR_FEED_ATTESTATION_SECRET));
  assert.ok(result.events.indexOf("signals-registered") < result.events.indexOf("begin"));
  assert.ok(result.events.lastIndexOf("settled:1") < result.events.indexOf("delete"));
  const deletion = result.queries.find(call => call.sql.startsWith("delete"));
  assert.match(deletion!.sql, /where id=\$1::uuid and name=\$2/);
  assert.deepEqual(deletion!.params, [keyUuid, `calendar_feed_attestation_ci_${keyId}`]);
  assert.ok(result.events.indexOf("delete") < result.events.indexOf("db-closed"));
  for (const index of [0, 1, 2]) assert.equal(result.events.filter(event => event === `settled:${index}`).length, 1);
});

test("settlement is memoized before concurrent or much later stop calls can see a reused group", async () => {
  let exists = true, probes = 0, outputSettles = 0;
  const signals: string[] = [];
  let current = { pid: 125, group: 125, startTime: "1000" };
  const stop = createOwnedGroupStopper({ pid: 125, done: Promise.resolve({ code: 0, signal: null }), capturedIdentity: Promise.resolve({ ...current }),
    readIdentity: async () => current, groupExists: () => { probes++; return exists; }, signalGroup: (signal: string) => { signals.push(signal); exists = false; },
    settleOutput: async () => { outputSettles++; }, now: () => 0, sleep: async () => undefined });
  const first = stop(), simultaneous = stop();
  assert.equal(first, simultaneous);
  await first;
  const provenProbes = probes;
  exists = true; current = { pid: 125, group: 125, startTime: "9000" }; // A foreign process later owns the same numeric group.
  assert.equal(stop(), first); await stop();
  assert.equal(probes, provenProbes); assert.equal(outputSettles, 1); assert.deepEqual(signals, ["SIGINT"]);
});

test("a reused leader before initial or escalation signal grants no foreign signal authority", async () => {
  for (const replaceAfterInt of [false, true]) {
    let time = 0, identityReads = 0;
    const signals: string[] = [];
    const owned = { pid: 125, group: 125, startTime: "1000" };
    const stop = createOwnedGroupStopper({ pid: 125, done: new Promise(() => undefined), capturedIdentity: Promise.resolve(owned),
      readIdentity: async () => { identityReads++; return { ...owned, startTime: replaceAfterInt && identityReads === 1 ? "1000" : "9000" }; },
      groupExists: () => true, signalGroup: (signal: string) => { signals.push(signal); }, settleOutput: async () => undefined,
      now: () => time, sleep: async (ms: number) => { time += ms; } });
    await assert.rejects(stop(), /child-identity-unverified/);
    const readsAtFailure = identityReads;
    await assert.rejects(stop(), /child-identity-unverified/);
    assert.equal(identityReads, readsAtFailure);
    assert.deepEqual(signals, replaceAfterInt ? ["SIGINT"] : []);
  }
});

test("browser mode runs only existing smoke and awaits its server group before key deletion", async () => {
  const result = await runFixture("browser");
  assert.equal(result.exitCode, 0); assert.equal(result.launches.length, 1);
  assert.deepEqual([...BROWSER_ARGS], ["run", "test:smoke"]);
  assert.deepEqual(result.launches[0].args, ["run", "test:smoke"]);
  assert.equal(result.launches[0].childEnv.CALENDAR_FEED_TEST_BASE_URL, "http://127.0.0.1:3100");
  assert.ok(result.events.indexOf("commit") < result.events.indexOf("launch:0"));
  assert.ok(result.events.lastIndexOf("settled:0") < result.events.indexOf("delete"));
});

test("readiness and child failures keep primary failure and still clean the exact owned key", async () => {
  for (const options of [{ readinessFailure: true }, { failChild: 0 }, { failChild: 2 }]) {
    const result = await runFixture("db", harness(options));
    assert.equal(result.exitCode, 1); assert.ok(result.receipt.failures.length >= 1);
    assert.equal(result.receipt.keyDeleted, true); assert.equal(result.receipt.dbClosed, true);
    assert.ok(result.events.indexOf("delete") > result.events.lastIndexOf(`settled:${result.launches.length - 1}`));
  }
});

test("Vault collision never creates/deletes/adopts another key", async () => {
  const result = await runFixture("browser", harness({ query(call) { if (call.sql === "select id from vault.secrets where name=$1") return { rows: [{ id: keyUuid }] }; } }));
  assert.equal(result.exitCode, 1);
  assert.ok(result.queries.some(call => call.sql === "rollback"));
  assert.ok(!result.queries.some(call => call.sql.includes("vault.create_secret") || call.sql.startsWith("delete")));
});

test("uncertain create is not retried and confirmed rollback avoids name-only cleanup", async () => {
  const result = await runFixture("db", harness({ query(call) { if (call.sql.includes("vault.create_secret")) throw new Error("private SQL arguments must never escape"); return undefined; } }));
  assert.equal(result.exitCode, 1); assert.equal(result.launches.length, 0);
  assert.equal(result.queries.filter(call => call.sql.includes("vault.create_secret")).length, 1);
  assert.ok(result.queries.some(call => call.sql === "rollback"));
  assert.ok(!result.queries.some(call => call.sql.startsWith("delete")));
  assert.ok(!JSON.stringify(result.receipt).includes("private SQL"));
});

test("normal signal during setup is caught before commit/launch and settles rollback/connection", async () => {
  const result = await runFixture("db", harness({ signalAtCreate: true }));
  assert.equal(result.exitCode, 1); assert.ok(result.receipt.failures.includes("interrupted"));
  assert.equal(result.launches.length, 0); assert.ok(!result.queries.some(call => call.sql === "commit"));
  assert.ok(result.queries.some(call => call.sql === "rollback")); assert.equal(result.receipt.dbClosed, true);
});

test("ownership mismatch on deletion blocks success without name-only fallback", async () => {
  const result = await runFixture("browser", harness({ query(call) {
    if (call.sql.startsWith("delete")) return { rows: [] };
    if (call.sql === "select id,name from vault.secrets where id=$1::uuid") return { rows: [{ id: keyUuid, name: "foreign-owned" }] };
  } }));
  assert.equal(result.exitCode, 1); assert.equal(result.receipt.keyDeleted, false); assert.ok(result.receipt.custody);
  assert.equal(result.queries.filter(call => call.sql.startsWith("delete")).length, 1);
});

test("all child and DB cleanup failures survive primary failure; unverified children retain key custody", async () => {
  const result = await runFixture("db", harness({ failChild: 0, failStops: true, closeFailure: true }));
  assert.equal(result.exitCode, 1); assert.ok(result.receipt.failures.includes("child-failed"));
  assert.ok(result.receipt.failures.includes("owned-child-cleanup-failed")); assert.ok(result.receipt.failures.includes("db-close-unverified"));
  assert.equal(result.receipt.keyDeleted, false); assert.ok(result.receipt.custody);
  assert.ok(!result.queries.some(call => call.sql.startsWith("delete")));
});

test("forced browser runner cleanup cannot claim the detached Playwright server settled or delete its key", async () => {
  const result = await runFixture("browser", harness({ forcedStop: true }));
  assert.equal(result.exitCode, 1); assert.ok(result.receipt.failures.includes("browser-server-teardown-unverified"));
  assert.equal(result.receipt.keyDeleted, false); assert.ok(result.receipt.custody);
  assert.equal(result.receipt.custody.vaultUuid, keyUuid);
  assert.equal(result.receipt.custody.ownedName, `calendar_feed_attestation_ci_${keyId}`);
  assert.match(result.receipt.custody.expiry, /disposable GitHub-hosted job/);
  assert.ok(!result.queries.some(call => call.sql.startsWith("delete")));
});

test("nonzero/null-signal nested browser loss retains key custody despite a settled pnpm group", async () => {
  // This injected handle is pnpm only: no captured handle proves settlement of
  // the nested Playwright server, even when pnpm itself stopped cleanly.
  const result = await runFixture("browser", harness({ failChild: 0 }));
  assert.deepEqual(result.receipt.childExitCodes, [17]);
  assert.equal(result.exitCode, 1); assert.equal(result.receipt.keyDeleted, false);
  assert.ok(result.receipt.failures.includes("child-failed"));
  assert.ok(result.receipt.failures.includes("browser-server-teardown-unverified"));
  assert.ok(result.events.includes("settled:0"));
  assert.equal(result.receipt.custody?.vaultUuid, keyUuid);
  assert.equal(result.receipt.custody?.ownedName, `calendar_feed_attestation_ci_${keyId}`);
  assert.ok(!result.queries.some(call => call.sql.startsWith("delete")));
});

test("uncertain create plus rollback failure retains both failures and named custody", async () => {
  const result = await runFixture("browser", harness({ query(call) { if (call.sql.includes("vault.create_secret") || call.sql === "rollback") throw new Error("private failure"); return undefined; } }));
  assert.equal(result.exitCode, 1);
  assert.deepEqual(result.receipt.failures, ["runtime-failed", "transaction-rollback-unverified", "key-create-outcome-unverified"]);
  assert.ok(result.receipt.custody); assert.equal(result.receipt.dbClosed, true);
});

test("telemetry persists actual allowlisted markers and measured leak flags, never raw lines", async () => {
  const persisted: string[] = [];
  const observe = createTelemetryObserver({ keyId: "owned-key-id", secret: "owned-private-key", persist: async (line: string) => { persisted.push(line); } });
  await observe("Next banner");
  assert.equal(persisted.length, 0);
  await observe('{"event":"calendar_feed.response","status":200}');
  assert.deepEqual(JSON.parse(persisted[1]), { event: "calendar_feed.runtime_observation", responseCount: 1, sensitiveOutputCount: 0, sensitiveOutputDetected: false });
  await observe("GET /calendar/feed/sensitive-capability owned-private-key owned-key-id");
  assert.deepEqual(JSON.parse(persisted[2]), { event: "calendar_feed.runtime_observation", responseCount: 1, sensitiveOutputCount: 1, sensitiveOutputDetected: true });
  await observe('{"event":"calendar_feed.response","status":404}');
  assert.deepEqual(JSON.parse(persisted[4]), { event: "calendar_feed.runtime_observation", responseCount: 2, sensitiveOutputCount: 1, sensitiveOutputDetected: true });
  assert.ok(!persisted.join("").includes("sensitive-capability")); assert.ok(!persisted.join("").includes("owned-private-key"));
});

test("standalone and unexpected JSON sensitive values are detected before filtering without retaining them", async () => {
  const raw = Buffer.alloc(32, 29).toString("base64url");
  const proof = Buffer.alloc(32, 203).toString("base64");
  const hash = "9f".repeat(32);
  const vectors = [raw, proof, hash, hash.toUpperCase(), "203.0.113.7", "2001:db8:1234:5678:abcd:ef01:2345:6789", "2001:db8::7", "::1", "::ffff:192.0.2.7", "fe80::1%eth0",
    JSON.stringify({ arbitrary: raw }), JSON.stringify({ extra: hash }), JSON.stringify({ diagnostic: "203.0.113.7" }),
    JSON.stringify({ diagnostic: "[2001:db8::7]" }), JSON.stringify({ unexpected: proof }),
    JSON.stringify({ event: "calendar_feed.response", status: 200, unrelated: "unexpected field" })];
  for (const vector of vectors) {
    const records: string[] = [];
    const observe = createTelemetryObserver({ keyId: "owned-key", secret: "owned-secret", persist: async (line: string) => { records.push(line); } });
    await observe(vector);
    await observe('{"event":"calendar_feed.response","status":200}');
    const latest = JSON.parse(records.at(-1)!);
    assert.equal(latest.sensitiveOutputDetected, true); assert.equal(latest.sensitiveOutputCount, 1); assert.equal(latest.responseCount, 1);
    assert.equal(records.some(record => record.includes(vector)), false);
    assert.ok(records.every(record => ["calendar_feed.response", "calendar_feed.runtime_observation"].includes(JSON.parse(record).event)));
  }
});

test("known proof values and actual keys flag leaks while exact infrastructure and unrelated ordinary output stay clean", async () => {
  const params = { keyId: "owned-key", secret: "owned-secret", knownValues: ["fixture-proof-with-noncanonical-representation"] };
  for (const line of ["owned-key", "owned-secret", "fixture-proof-with-noncanonical-representation"]) assert.equal(hasSensitiveOutput(line, params), true);
  const clean = ["Next banner", "✓ Compiled successfully in 9.2s", "17 tests passed; 0 skipped", '{"diagnostic":"ordinary","durationMs":15}',
    "- Local:         http://127.0.0.1:3195", "\u001b[32m- Network:       http://127.0.0.1:3100\u001b[0m"];
  const records: string[] = [];
  const observe = createTelemetryObserver({ ...params, persist: async (line: string) => { records.push(line); } });
  for (const line of clean) { assert.equal(hasSensitiveOutput(line, params), false); await observe(line); }
  assert.equal(records.length, 0);
  for (const line of ["GET - Local: http://127.0.0.1:3195", "- Local: http://127.0.0.1:3195 request", "- Network: http://203.0.113.7:3195", "- Local: http://127.0.0.1:3195 " + Buffer.alloc(32, 29).toString("base64url")]) assert.equal(hasSensitiveOutput(line, params), true);
});
