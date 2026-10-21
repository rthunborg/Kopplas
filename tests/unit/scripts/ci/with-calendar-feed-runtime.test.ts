import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import * as nodeModule from "node:module";
import { EventEmitter } from "node:events";
import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";
import { INTEGRATION_ARGS, BROWSER_ARGS, CAUSE_PROOF_ARGS, FEED_FUNCTIONS, validateAdmission, validateStackIdentity, validateCauseProofObservation, finishCauseProof, createCalendarFeedDatabaseClient, createTelemetryObserver, hasSensitiveOutput, createOwnedGroupStopper, ownsListenerRecord, waitForOwnedHttp, runCalendarFeedRuntime, launchOwned } from "../../../../scripts/ci/with-calendar-feed-runtime.mjs";
import { captureCalendarFeedTrace, recordCalendarFeedTrace, recordCalendarFeedContext, recordCalendarFeedMembership, executeCalendarFeed } from "../../../../src/server/commands/calendar-feed/calendar-feed-db";
import { CommandError } from "../../../../src/server/commands/command-errors";
import { validateCalendarFeedIntent } from "../../../../src/features/calendar-feed/validation";

const env = {
  NODE_ENV: "test" as const,
  CI: "true", GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: "1", GITHUB_JOB: "db",
  CALENDAR_FEED_CI_DISPOSABLE_STACK: "123:1:db",
};
const keyId = "f8c9b152-1e88-471a-82fa-d45a80394e40";
const keyUuid = "905a0de8-b110-4f89-9096-010db4c6ef12";
const status = { API_URL: "http://127.0.0.1:54321", DB_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres", ANON_KEY: "test-anon", SERVICE_ROLE_KEY: "test-service" };
const migrations = [{ version: "20261020220000", name: "personal_calendar_feed" }];
function privacyRows(): Record<string, unknown>[] {
  return ["log_statement", "log_min_error_statement", "log_parameter_max_length", "log_parameter_max_length_on_error"].map(name => ({
    name, context: name === "log_parameter_max_length_on_error" ? "user" : "superuser", matches_required: true, can_set: false,
    session_is_postgres: false, current_is_postgres: false, same_identity: true,
    session_superuser: true, current_superuser: true, session_bypass_rls: true, current_bypass_rls: true,
  }));
}
function authorityRow(): Record<string, unknown> {
  return { session_is_setup_admin: true, current_is_setup_admin: true, same_identity: true,
    session_login: true, current_login: true, session_superuser: true, current_superuser: true };
}
const setupPassword = "PRIVATE fixture existing container credential";

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
  connectFailure?: unknown;
} = {}) {
  const events: string[] = [];
  const queries: Query[] = [];
  const launches: { command: string; args: string[]; childEnv: Record<string, string> }[] = [];
  let signal: () => void = () => undefined;
  const deps = {
    registerSignal(handler: () => void) { events.push("signals-registered"); signal = handler; return () => events.push("signals-unregistered"); },
    async qualify() { events.push("qualified"); return { status, migrations, stack: identity() }; },
    async portFree() { events.push("port-checked"); if (options.occupied) throw new Error("fixture occupied"); },
    connect() {
      events.push("client-created");
      return {
        async connect() { events.push("connected"); if (options.connectFailure !== undefined) throw options.connectFailure; },
        async query(sql: string, params?: unknown[]) {
          events.push(sql.startsWith("select vault.create_secret") ? "create" : sql.startsWith("delete") ? "delete" : sql);
          const call = { sql, params }; queries.push(call);
          const override = options.query?.(call); if (override) return override;
          if (sql.startsWith("select session_user='supabase_admin'")) return { rows: [authorityRow()] };
          if (sql.startsWith("with required(name,value)")) return { rows: privacyRows() };
          if (sql.includes("schema_migrations")) return { rows: migrations };
          if (sql.includes("from pg_proc")) return { rows: FEED_FUNCTIONS.map(() => ({ owner: "calendar_feed_owner", definer: true })) };
          if (sql.startsWith("select vault.create_secret")) { if (options.signalAtCreate) signal(); return { rows: [{ id: keyUuid }] }; }
          if (sql.startsWith("delete")) return { rows: [{ id: keyUuid }] };
          return { rows: [] };
        },
        async end() { events.push("db-closed"); if (options.closeFailure) throw new Error("fixture close"); },
      };
    },
    uuid: () => { events.push("key-id"); return keyId; }, entropy: () => { events.push("entropy"); return Buffer.alloc(32, 7); },
    async createTelemetry() { return { path: "/private/allowlisted.jsonl", persist: async () => undefined }; },
    launch(command: string, args: string[], childEnv: Record<string, string>) {
      const index = launches.length;
      launches.push({ command, args, childEnv }); events.push(`launch:${index}`);
      const isServer = args.includes("start");
      let finish: (result: { code: number; signal: null }) => void = () => undefined;
      const done = isServer ? new Promise<{ code: number; signal: null }>(resolve => { finish = resolve; }) : Promise.resolve({ code: options.failChild === index ? 17 : 0, signal: null });
      return { done, launchState: () => "started", async stop() { events.push(`settled:${index}`); finish({ code: 0, signal: null }); if (options.failStops) throw new Error("fixture custody"); return { forced: options.forcedStop ?? false, signal: null }; } };
    },
    async ready() { events.push("ready"); if (options.readinessFailure) throw new Error("fixture readiness"); },
  };
  return { deps, events, queries, launches, signal: () => signal() };
}
async function runFixture(mode: string, h = harness()) {
  const result = await runCalendarFeedRuntime({ mode, env, platform: "linux" }, h.deps);
  return { ...h, ...result };
}

test("real pg setup client fixes captured credential principal publication and all four privacy startup controls", async () => {
  const previous = Object.fromEntries(["PGOPTIONS", "PGUSER", "PGPASSWORD", "PGHOST", "PGPORT", "PGDATABASE", "PGSSLMODE"].map(key => [key, process.env[key]]));
  for (const key of Object.keys(previous)) process.env[key] = "PRIVATE untrusted ambient choice";
  try {
    for (const purpose of ["runtime", "proof", "absence"]) {
      const client = createCalendarFeedDatabaseClient(identity(), purpose);
      // pg8.22 exposes these installed internals, omitted from its public types.
      const installed = client as unknown as { getStartupConf(): { options: string; statement_timeout: string; user: string; database: string; lock_timeout?: string };
        connectionParameters: { query_timeout: number; password: string; host: string; port: number; ssl: boolean } };
      const startup = installed.getStartupConf(), config = installed.connectionParameters;
      assert.equal(startup.options, "-c log_statement=none -c log_min_error_statement=panic -c log_parameter_max_length=0 -c log_parameter_max_length_on_error=0"
        + (purpose === "absence" ? " -c default_transaction_read_only=on" : ""));
      assert.equal(startup.user, "supabase_admin"); assert.equal(startup.database, "postgres");
      assert.equal(config.host, "127.0.0.1"); assert.equal(config.port, 54322); assert.equal(config.ssl, false);
      assert.ok(config.password === setupPassword); // No credential value in assertion diagnostics.
      assert.equal(startup.statement_timeout, purpose === "runtime" ? "8000" : "5000");
      assert.equal(config.query_timeout, purpose === "runtime" ? 10_000 : 7_000);
      if (purpose !== "runtime") assert.equal(startup.lock_timeout, "2000");
      await client.end(); // Construction/end only: never connect or launch a service.
    }
  } finally {
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

test("setup construction refuses missing duplicate malformed or foreign source credentials without guesses or fallback", async () => {
  const changes = [
    (v: ReturnType<typeof identity>) => { v.db.Config.Env = []; },
    (v: ReturnType<typeof identity>) => { v.db.Config.Env = ["POSTGRES_PASSWORD="]; },
    (v: ReturnType<typeof identity>) => { v.db.Config.Env.push(`POSTGRES_PASSWORD=${setupPassword}`); },
    (v: ReturnType<typeof identity>) => { v.db.Config.Env = ["PGPASSWORD=PRIVATE wrong source"]; },
    (v: ReturnType<typeof identity>) => { v.db.Config.Env = ["POSTGRES_PASSWORD=PRIVATE\0invalid"]; },
    (v: ReturnType<typeof identity>) => { (v.db.Config as { Env: unknown }).Env = [null]; },
    (v: ReturnType<typeof identity>) => { (v.db.Config as { Env: unknown }).Env = undefined; },
    (v: ReturnType<typeof identity>) => { v.db.Name = "/supabase_db_foreign"; },
    (v: ReturnType<typeof identity>) => { v.status.DB_URL = "postgresql://PRIVATE.invalid/foreign"; },
    (v: ReturnType<typeof identity>) => { v.db.Created = "2026-10-19T10:00:00Z"; },
  ];
  for (const change of changes) {
    const stack = identity(); change(stack);
    const h = harness();
    const result = await runCalendarFeedRuntime({ mode: "db", env, platform: "linux" }, { ...h.deps,
      qualify: async () => ({ status, migrations, stack }), connect: createCalendarFeedDatabaseClient });
    assert.equal(result.exitCode, 1); assert.equal(result.receipt.keyOutcome, "not-attempted");
    assert.equal(h.launches.length, 0); assert.ok(!h.events.includes("entropy") && !h.events.includes("key-id"));
    assert.equal(h.queries.length, 0); assert.equal(result.receipt.setupAuthority, null);
    assert.equal(result.receipt.diagnostics[0].stage, "database-client");
    assert.ok(!JSON.stringify(result.receipt).includes("PRIVATE"));
  }
  assert.throws(() => createCalendarFeedDatabaseClient(identity(), "alternate"), /setup-purpose-refused/);
});

test("actual setup authority rejects every false missing malformed duplicate or unexpected identity before secrets", async () => {
  const malformed = [
    [] as Record<string, unknown>[], [authorityRow(), authorityRow()],
    ...Object.keys(authorityRow()).map(key => [{ ...authorityRow(), [key]: false }]),
    ...Object.keys(authorityRow()).map(key => [{ ...authorityRow(), [key]: "true" }]),
    [{ ...authorityRow(), raw_identity: "PRIVATE unknown role" }],
    (() => { const row = authorityRow(); delete row.session_superuser; return [row]; })(),
  ];
  for (const rows of malformed) {
    const result = await runFixture("db", harness({ query(call) {
      return call.sql.startsWith("select session_user='supabase_admin'") ? { rows } : undefined;
    } }));
    assert.equal(result.exitCode, 1); assert.deepEqual(result.receipt.failures, ["setup-authority-refused"]);
    assert.equal(result.receipt.diagnostics[0].stage, "setup-authority");
    assert.equal(result.receipt.keyOutcome, "not-attempted"); assert.equal(result.receipt.dbClosed, true);
    assert.equal(result.receipt.privacyPreflight, null); assert.equal(result.launches.length, 0);
    assert.ok(!result.events.includes("entropy") && !result.events.includes("key-id"));
    assert.equal(result.queries.length, 1); assert.ok(!JSON.stringify(result.receipt).includes("PRIVATE"));
  }
});

test("setup credentials never add privileged configuration to application or test children", async () => {
  for (const mode of ["db", "browser"]) {
    const result = await runFixture(mode);
    assert.equal(result.exitCode, 0);
    for (const child of result.launches) {
      assert.equal(child.childEnv.SUPABASE_TEST_DB_URL, status.DB_URL);
      assert.ok(!Object.values(child.childEnv).some(value => value === setupPassword));
      assert.ok(!Object.keys(child.childEnv).some(key => /(?:SETUP|ADMIN_DB|POSTGRES_PASSWORD)/.test(key)));
      assert.ok(!Object.values(child.childEnv).some(value => typeof value === "string" && value.includes("supabase_admin")));
    }
    assert.ok(!JSON.stringify(result.receipt).includes(setupPassword));
  }
});

test("privacy preflight rejects incomplete unknown duplicate malformed contexts and unsafe controls before any secret", async () => {
  const malformed: ((rows: Record<string, unknown>[]) => unknown)[] = [
    () => null, rows => rows.slice(1), rows => [...rows, rows[0]],
    rows => { rows[1] = { ...rows[0] }; return rows; },
    rows => { rows[0].name = "PRIVATE unknown control"; return rows; },
    rows => { rows[0].context = "user"; return rows; },
    rows => { rows[3].context = "superuser"; return rows; },
    rows => { rows[0].matches_required = "true"; return rows; },
    rows => { rows[0].can_set = 1; return rows; },
    rows => { rows[0].session_superuser = null; return rows; },
    rows => { delete rows[0].can_set; return rows; },
    rows => { rows[0].raw_value = "PRIVATE native payload"; return rows; },
    rows => { rows[0].same_identity = false; return rows; },
    ...[0, 1, 2, 3].map(index => (rows: Record<string, unknown>[]) => { rows[index].matches_required = false; return rows; }),
  ];
  for (const mutate of malformed) {
    const result = await runFixture("db", harness({ query(call) {
      if (call.sql.startsWith("with required(name,value)")) return { rows: mutate(privacyRows()) as Record<string, unknown>[] };
      return undefined;
    } }));
    assert.equal(result.exitCode, 1); assert.deepEqual(result.receipt.failures, ["privacy-preflight-refused"]);
    assert.deepEqual(result.receipt.diagnostics, [{ stage: "privacy-preflight", category: "guard-refusal", sqlState: null }]);
    assert.equal(result.receipt.keyOutcome, "not-attempted"); assert.equal(result.receipt.dbClosed, true);
    assert.equal(result.launches.length, 0);
    assert.ok(!result.events.includes("entropy") && !result.events.includes("key-id"));
    assert.ok(!result.queries.some(call => call.sql === "begin" || call.sql.includes("vault.")));
    assert.equal(JSON.stringify(result.receipt).includes("PRIVATE"), false);
  }
});

test("same client setup authority and privacy proof precede entropy without making SET ACL observations a gate", async () => {
  const result = await runFixture("db");
  assert.equal(result.exitCode, 0); assert.equal(result.events.filter(event => event === "client-created").length, 1);
  const proof = result.queries.find(call => call.sql.startsWith("with required(name,value)"))!;
  assert.equal(proof.params, undefined); assert.ok(proof.sql.includes("current_setting(s.name)=r.value"));
  assert.ok(!/\b(?:set_config|alter|grant|set role)\b/i.test(proof.sql));
  assert.ok(result.events.indexOf("connected") < result.events.indexOf(proof.sql));
  assert.ok(result.events.indexOf(result.queries[0].sql) < result.events.indexOf(proof.sql));
  assert.deepEqual(result.receipt.setupAuthority, authorityRow());
  assert.ok(result.events.indexOf(proof.sql) < result.events.indexOf("key-id"));
  assert.ok(result.events.indexOf(proof.sql) < result.events.indexOf("entropy"));
  assert.ok(result.events.indexOf("entropy") < result.events.indexOf("begin"));
  assert.ok(result.events.indexOf("delete") < result.events.indexOf("db-closed"));
  assert.ok(result.receipt.privacyPreflight?.controls.every(control => control.matchesRequired && control.canSet === false));
  assert.equal(result.receipt.privacyPreflight?.principal.same_identity, true);
  assert.equal(result.receipt.privacyPreflight?.principal.current_superuser, true);
  assert.equal(result.receipt.keyOutcome, "deleted-confirmed");
});

test("privacy query and close failures retain separate sanitized diagnostics with no secret or fallback", async () => {
  const privateText = "PRIVATE native SQL value params detail hint URL token proof key";
  const result = await runFixture("browser", harness({ closeFailure: true, query(call) {
    if (call.sql.startsWith("with required(name,value)")) throw Object.assign(new Error(privateText), { code: "42501", detail: privateText });
    return undefined;
  } }));
  assert.equal(result.exitCode, 1); assert.equal(result.receipt.dbClosed, false);
  assert.deepEqual(result.receipt.failures, ["runtime-failed", "db-close-unverified"]);
  assert.deepEqual(result.receipt.diagnostics, [
    { stage: "privacy-preflight", category: "insufficient-privilege", sqlState: "42501" },
    { stage: "database-close", category: "unclassified", sqlState: null },
  ]);
  assert.equal(result.receipt.privacyPreflight, null); assert.equal(result.receipt.keyOutcome, "not-attempted");
  assert.equal(result.launches.length, 0); assert.ok(!result.events.includes("entropy"));
  assert.equal(result.queries.length, 2); assert.equal(JSON.stringify(result.receipt).includes(privateText), false);
});

test("setup failures report the reached fixed stage and allowlisted SQLSTATE without native details", async () => {
  const privateText = "PRIVATE native query params detail hint stack cause URL token proof key 2001:db8::1";
  const error = Object.assign(new Error(privateText), { code: "42501", detail: privateText, hint: privateText,
    query: privateText, params: [privateText], cause: new Error(privateText) });
  for (const [stage, query] of [
    ["database-connect", null], ["setup-authority", "select session_user='supabase_admin'"], ["migration-ledger", "select version,name"], ["feed-functions", "select p.oid"],
    ["transaction-begin", "begin"], ["key-collision", "select id from vault.secrets where name=$1"],
  ] as const) {
    const h = harness({ connectFailure: query === null ? error : undefined,
      query(call) { if (query !== null && call.sql.startsWith(query)) throw error; return undefined; } });
    const result = await runFixture("db", h);
    assert.equal(result.exitCode, 1); assert.deepEqual(result.receipt.failures, ["runtime-failed"]);
    assert.deepEqual(result.receipt.diagnostics, [{ stage, category: "insufficient-privilege", sqlState: "42501" }]);
    assert.equal(result.receipt.keyOutcome, "not-attempted"); assert.equal(result.receipt.dbClosed, true);
    assert.equal(result.launches.length, 0); assert.equal(result.queries.some(call => call.sql.includes("vault.create_secret")), false);
    assert.equal(JSON.stringify(result.receipt).includes(privateText), false);
    if (stage === "key-collision") assert.ok(result.events.includes("rollback"));
  }
});

test("setup diagnostics ignore unknown inherited or accessor SQLSTATE and never traverse error payloads", async () => {
  const privateText = "PRIVATE payload must not enter diagnostics";
  const unknown = Object.assign(new Error(privateText), { code: privateText });
  const inherited = Object.create({ code: "42501" });
  const accessor = new Error(privateText);
  let getterReads = 0;
  for (const field of ["code", "detail", "hint", "query", "params", "cause", "toJSON"])
    Object.defineProperty(accessor, field, { get() { getterReads++; throw new Error(privateText); } });
  for (const error of [unknown, inherited, accessor]) {
    const result = await runFixture("db", harness({ connectFailure: error }));
    assert.equal(result.exitCode, 1);
    assert.deepEqual(result.receipt.diagnostics, [{ stage: "database-connect", category: "unclassified", sqlState: null }]);
    assert.equal(result.receipt.keyOutcome, "not-attempted"); assert.equal(result.receipt.dbClosed, true);
    assert.equal(JSON.stringify(result.receipt).includes(privateText), false);
  }
  assert.equal(getterReads, 0);
});

test("COMMIT uncertainty is not cleared by ROLLBACK and only exact UUID cleanup can confirm absence", async () => {
  for (const deleteFails of [true, false]) {
    const result = await runFixture("db", harness({ query(call) {
      if (call.sql === "commit") throw Object.assign(new Error("PRIVATE lost commit response"), { code: "08006" });
      if (deleteFails && call.sql.startsWith("delete")) throw Object.assign(new Error("PRIVATE cleanup"), { code: "42501" });
      return undefined;
    } }));
    assert.equal(result.exitCode, 1); assert.equal(result.launches.length, 0); assert.equal(result.receipt.dbClosed, true);
    assert.ok(result.events.includes("rollback"));
    assert.equal(result.receipt.keyOutcome, deleteFails ? "unverified" : "deleted-confirmed");
    assert.equal(result.receipt.keyDeleted, !deleteFails);
    assert.deepEqual(result.receipt.diagnostics[0], { stage: "transaction-commit", category: "connection-failure", sqlState: "08006" });
    if (deleteFails) {
      assert.deepEqual(result.receipt.diagnostics[1], { stage: "key-cleanup", category: "insufficient-privilege", sqlState: "42501" });
      assert.equal(result.receipt.custody?.vaultUuid, keyUuid);
    } else {
      assert.equal(result.receipt.custody, null);
      assert.deepEqual(result.queries.find(call => call.sql.startsWith("delete"))?.params,
        [keyUuid, `calendar_feed_attestation_ci_${keyId}`]);
      assert.ok(result.queries.some(call => call.sql === "select id,name from vault.secrets where id=$1::uuid"));
    }
    assert.equal(JSON.stringify(result.receipt).includes("PRIVATE"), false);
  }
});

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
    Config: { Labels: { "com.supabase.cli.project": "kopplas" }, Env: [`POSTGRES_PASSWORD=${setupPassword}`] }, NetworkSettings: { Networks: { project: { NetworkID: "c".repeat(64) } },
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

test("a valid captured leader disappearing during inspection settles only after actual group absence and latches it", async () => {
  for (const disappearance of [0, 150, 16_000, 24_000]) {
    let time = 0, probes = 0, reads = 0, drained = 0, reused = false;
    const signals: string[] = [];
    const owned = { pid: 125, group: 125, startTime: "1000" };
    const stop = createOwnedGroupStopper({ pid: 125, done: Promise.resolve({ code: 0, signal: null }), capturedIdentity: Promise.resolve(owned),
      readIdentity: async () => { reads++; return null; }, groupExists: () => { probes++; return reads === 0 || reused || time < disappearance; },
      signalGroup: (signal: string) => { signals.push(signal); }, settleOutput: async () => { drained++; reused = true; },
      now: () => time, sleep: async (ms: number) => { time += ms; } });
    const settled = await stop(), provenProbes = probes;
    assert.deepEqual(settled, { forced: false, signal: null }); assert.equal(reads, 1); assert.equal(drained, 1);
    assert.deepEqual(signals, []); assert.equal(time, disappearance);
    await stop(); assert.equal(probes, provenProbes); // Drain-time numeric reuse is never adopted.
  }
});

test("missing leaders with persistent groups exhaust only existing budgets and never authorize a signal", async () => {
  let time = 0, reads = 0, drained = 0;
  const signals: string[] = [];
  const stop = createOwnedGroupStopper({ pid: 125, done: Promise.resolve({ code: 0, signal: null }),
    capturedIdentity: Promise.resolve({ pid: 125, group: 125, startTime: "1000" }), readIdentity: async () => { reads++; return null; },
    groupExists: () => true, signalGroup: (signal: string) => { signals.push(signal); }, settleOutput: async () => { drained++; },
    now: () => time, sleep: async (ms: number) => { time += ms; } });
  await assert.rejects(stop(), error => error instanceof Error && error.message === "child-identity-unverified"
    && (error as Error & { processPhase: string }).processPhase === "leader-missing-group-live");
  assert.equal(time, 25_000); assert.equal(reads, 1); assert.equal(drained, 0); assert.deepEqual(signals, []);
  await assert.rejects(stop()); assert.equal(time, 25_000);
});

test("invalid capture, changed group and identity read failure remain failures even if the group later disappears", async () => {
  const owned = { pid: 125, group: 125, startTime: "1000" };
  for (const fixture of [
    { capture: null, read: async () => owned, phase: "capture-invalid" },
    { capture: { ...owned, group: 126 }, read: async () => owned, phase: "capture-invalid" },
    { capture: { ...owned, startTime: "PRIVATE invalid" }, read: async () => owned, phase: "capture-invalid" },
    { capture: owned, read: async () => ({ ...owned, group: 126 }), phase: "leader-mismatch" },
    { capture: owned, read: async () => ({ ...owned, startTime: "9000" }), phase: "leader-mismatch" },
    { capture: owned, read: async () => { throw new Error("PRIVATE process details"); }, phase: "identity-read-failed" },
  ]) {
    let inspected = false, signals = 0, drained = 0;
    const stop = createOwnedGroupStopper({ pid: 125, done: Promise.resolve({ code: 0, signal: null }), capturedIdentity: Promise.resolve(fixture.capture),
      readIdentity: async () => { inspected = true; return fixture.read(); }, groupExists: () => !inspected,
      signalGroup: () => { signals++; }, settleOutput: async () => { drained++; } });
    await assert.rejects(stop(), error => error instanceof Error && error.message === "child-identity-unverified"
      && (error as Error & { processPhase: string }).processPhase === fixture.phase);
    assert.equal(signals, 0); assert.equal(drained, 0);
  }
});

test("verified live leaders retain escalation identity checks and forced-stop semantics", async () => {
  let time = 0, exists = true, reads = 0;
  const signals: string[] = [], owned = { pid: 125, group: 125, startTime: "1000" };
  const stop = createOwnedGroupStopper({ pid: 125, done: Promise.resolve({ code: 0, signal: null }), capturedIdentity: Promise.resolve(owned),
    readIdentity: async () => { reads++; return owned; }, groupExists: () => exists,
    signalGroup: (signal: string) => { signals.push(signal); if (signal === "SIGKILL") exists = false; }, settleOutput: async () => undefined,
    now: () => time, sleep: async (ms: number) => { time += ms; } });
  assert.deepEqual(await stop(), { forced: true, signal: null });
  assert.deepEqual(signals, ["SIGINT", "SIGTERM", "SIGKILL"]); assert.equal(reads, 3); assert.equal(time, 20_000);
});

test("actual absence cannot bypass bounded child completion or bounded output drain", async () => {
  for (const pendingOutput of [false, true]) {
    let drains = 0;
    const stop = createOwnedGroupStopper({ pid: 125,
      done: pendingOutput ? Promise.resolve({ code: 0, signal: null }) : new Promise(() => undefined),
      capturedIdentity: Promise.resolve({ pid: 125, group: 125, startTime: "1000" }), readIdentity: async () => null,
      groupExists: () => false, signalGroup: () => assert.fail("absent group must never be signaled"),
      settleOutput: () => { drains++; return new Promise(() => undefined); } });
    await assert.rejects(stop(), pendingOutput ? /child-output-unverified/ : /child-settle-unverified/);
    assert.equal(drains, pendingOutput ? 1 : 0);
  }
});

test("full wrapper missing-leader race deletes the exact key only after absence and output; persistent groups keep custody", async () => {
  for (const persistent of [false, true]) {
    const h = harness(); let time = 0, exists = true, signals = 0;
    const launch = h.deps.launch.bind(h.deps);
    h.deps.launch = (command, args, childEnv) => {
      const child = launch(command, args, childEnv);
      if (h.launches.length !== 1) return child;
      return { ...child, stop: createOwnedGroupStopper({ pid: 125, done: child.done,
        capturedIdentity: Promise.resolve({ pid: 125, group: 125, startTime: "1000" }),
        readIdentity: async () => { if (!persistent) exists = false; return null; }, groupExists: () => exists,
        signalGroup: () => { signals++; }, settleOutput: async () => { h.events.push("actual-output-drained"); },
        now: () => time, sleep: async (ms: number) => { time += ms; } }) };
    };
    const result = await runFixture("db", h);
    assert.equal(signals, 0); assert.equal(result.exitCode, persistent ? 1 : 0);
    if (persistent) {
      assert.deepEqual(result.receipt.failures, ["child-identity-unverified", "owned-child-cleanup-failed"]);
      assert.equal((result.receipt.diagnostics[0] as { processPhase?: string }).processPhase, "leader-missing-group-live");
      assert.equal(result.receipt.keyOutcome, "unverified"); assert.equal(result.receipt.keyDeleted, false);
      assert.ok(result.receipt.custody); assert.equal(result.launches.length, 1); assert.equal(result.receipt.dbClosed, true);
      assert.ok(!result.queries.some(call => call.sql.startsWith("delete")));
    } else {
      assert.equal(result.receipt.keyOutcome, "deleted-confirmed"); assert.equal(result.launches.length, 3);
      assert.ok(result.events.indexOf("actual-output-drained") < result.events.indexOf("delete"));
    }
    assert.ok(!JSON.stringify(result.receipt).includes("1000"));
  }
});

let fixtureDiagnostics: Promise<typeof import("../../../support/calendar-feed-atdd")> | undefined;
function actualFixtureDiagnostics() {
  // Execute the uniquely bounded actual pure source, never its shared DB/auth
  // imports. These injected contracts cannot prove a native failing branch/code.
  fixtureDiagnostics ??= (async () => {
    const source = readFileSync(new URL("../../../support/calendar-feed-atdd.ts", import.meta.url), "utf8");
    const start = "// Pure fixture diagnostics:", end = "// End pure fixture diagnostics.";
    assert.equal(source.split(start).length, 2); assert.equal(source.split(end).length, 2);
    const pureSource = source.slice(source.indexOf(start), source.indexOf(end));
    const strip = (nodeModule as unknown as { stripTypeScriptTypes(source: string): string }).stripTypeScriptTypes;
    assert.equal(typeof strip, "function");
    return import(`data:text/javascript;base64,${Buffer.from(strip(pureSource)).toString("base64")}`);
  })();
  return fixtureDiagnostics;
}
function fixtureFailureMessages(error: Error): string[] {
  return [error.message, ...(error instanceof AggregateError ? error.errors.flatMap(fixtureFailureMessages) : [])];
}

test("actual fixture diagnostics preserve only allowlisted own-data SQLSTATE with no native text or payload access", async () => {
  const { calendarFixtureDiagnostic } = await actualFixtureDiagnostics();
  let getters = 0;
  const privateText = "PRIVATE fixture URL token proof key SQL parameters";
  const error = Object.defineProperties(new Error(privateText), {
    code: { value: "42501" }, detail: { value: privateText }, query: { value: privateText },
    cause: { get() { getters++; throw Error(privateText); } }, then: { get() { getters++; throw Error(privateText); } },
  });
  const safe = calendarFixtureDiagnostic("bind-membership", error);
  assert.equal(safe.message, "Calendar fixture failure [stage=bind-membership;category=insufficient-privilege;sqlstate=42501]");
  assert.equal(safe.cause, undefined); assert.ok(!safe.stack?.includes(privateText));
  assert.equal(getters, 0);
  for (const invalid of ["CF409", "42501 PRIVATE", 42501, undefined, null, Symbol("PRIVATE")]) {
    const unknown = calendarFixtureDiagnostic("bind-profile", { code: invalid, message: privateText });
    assert.match(unknown.message, /category=unknown;sqlstate=unavailable/);
    assert.ok(!unknown.message.includes(privateText));
  }
});

test("actual fixture diagnostic descriptor inspection refuses inherited accessor and malformed aggregate properties", async () => {
  const { calendarFixtureDiagnostic } = await actualFixtureDiagnostics();
  let getters = 0;
  const inherited = Object.create({ code: "42501" });
  const accessor = Object.defineProperties({}, { code: { get() { getters++; return "42501"; } },
    errors: { get() { getters++; return [Error("PRIVATE")]; } } });
  const trapped = new Proxy({}, { getOwnPropertyDescriptor() { throw Error("PRIVATE descriptor"); } });
  for (const error of [inherited, accessor, trapped, { errors: "PRIVATE", code: "42501" }, { errors: [] }]) {
    assert.match(calendarFixtureDiagnostic("not-admitted", error).message, /stage=unknown;category=unknown;sqlstate=unavailable/);
  }
  assert.equal(getters, 0);
});

test("actual fixture bounded aggregates retain reaching primary cleanup stages and explicitly mark cycles and truncation", async () => {
  const { calendarFixtureDiagnostic } = await actualFixtureDiagnostics();
  const primary = calendarFixtureDiagnostic("bind-profile", { code: "23503", message: "PRIVATE" });
  const cleanup = calendarFixtureDiagnostic("owned-row-cleanup", { code: "42501", query: "PRIVATE" });
  assert.equal(calendarFixtureDiagnostic("scenario", primary), primary);
  const messages = fixtureFailureMessages(calendarFixtureDiagnostic("canonical-fixture-cleanup", new AggregateError([primary, cleanup], "PRIVATE")));
  assert.match(messages[1], /stage=bind-profile;category=foreign-key;sqlstate=23503/);
  assert.match(messages[2], /stage=owned-row-cleanup;category=insufficient-privilege;sqlstate=42501/);
  assert.ok(messages.every(message => !message.includes("PRIVATE")));
  const cycle: { errors: unknown[] } = { errors: [] }; cycle.errors.push(cycle);
  assert.ok(fixtureFailureMessages(calendarFixtureDiagnostic("scenario", cycle)).some(message => message.includes("category=cycle")));
  let deep: unknown = Error("PRIVATE"); for (let i = 0; i < 10; i++) deep = new AggregateError([deep], "PRIVATE");
  assert.ok(fixtureFailureMessages(calendarFixtureDiagnostic("scenario", deep)).some(message => message.includes("category=truncated")));
  const wide = fixtureFailureMessages(calendarFixtureDiagnostic("scenario", new AggregateError(Array.from({ length: 100 }, () => ({ code: "42501" })), "PRIVATE")));
  assert.equal(wide.length, 16); assert.match(wide.at(-1)!, /category=truncated/);
});

test("actual fixture catch wrapper invokes operations once preserves successful values and never observes a client or thenable", async () => {
  const { calendarFixtureStep } = await actualFixtureDiagnostics();
  let calls = 0, payloadReads = 0;
  const result = { ordinary: true };
  assert.equal(await calendarFixtureStep("additional-users", () => { calls++; return result; }), result);
  assert.equal(calls, 1);
  const failure = Object.defineProperties({ code: "42P01" }, {
    then: { get() { payloadReads++; throw Error("PRIVATE"); } }, client: { get() { payloadReads++; throw Error("PRIVATE"); } },
    cause: { get() { payloadReads++; throw Error("PRIVATE"); } },
  });
  await assert.rejects(calendarFixtureStep("bind-profile", () => { calls++; throw failure; }), /stage=bind-profile;category=undefined-table;sqlstate=42P01/);
  await assert.rejects(calendarFixtureStep("cleanup-absence-check", () => { calls++; return Promise.reject(failure); }), /stage=cleanup-absence-check;category=undefined-table/);
  assert.equal(calls, 3); assert.equal(payloadReads, 0);
});

test("actual fixture diagnostics keep upstream message-only replacement and swallowed outcomes explicitly unknown", async () => {
  const { calendarFixtureDiagnostic, calendarFixtureStep } = await actualFixtureDiagnostics();
  // Canonical createTenant/createAuthUser/sign-in/deleteAuthUser copy message,
  // not code. The owned catch cannot reconstruct it from message or cause.
  const messageOnly = Object.assign(new Error("PRIVATE canonical 42501"), { cause: { code: "42501" } });
  const first = calendarFixtureDiagnostic("booking-fixture-before-callback", messageOnly);
  assert.equal(first.message, "Calendar fixture failure [stage=booking-fixture-before-callback;category=unknown;sqlstate=unavailable]");
  const finalReplacement = await calendarFixtureStep("owned-row-cleanup", async () => {
    try { throw { code: "23503" }; } finally { throw new Error("PRIVATE DISCARD replacement"); }
  }).catch(error => error as Error);
  assert.match(finalReplacement.message, /stage=owned-row-cleanup;category=unknown/);
  assert.ok(!fixtureFailureMessages(finalReplacement).some(message => message.includes("23503")));
  // A canonical best-effort warning is not a rejected outcome at the owned catch.
  const noFailure = await calendarFixtureStep("canonical-fixture-cleanup", () => "completed-without-owned-rejection");
  assert.equal(noFailure, "completed-without-owned-rejection");
});

test("actual fixture pre-callback coarse stage and fine owned stages survive outer aggregation without invented substage", async () => {
  const { calendarFixtureDiagnostic } = await actualFixtureDiagnostics();
  const coarse = calendarFixtureDiagnostic("booking-fixture-before-callback", { code: "23514" });
  const own = calendarFixtureDiagnostic("additional-users", { code: "23505" });
  const cleanup = calendarFixtureDiagnostic("additional-auth-cleanup", new Error("PRIVATE already erased"));
  const aggregate = calendarFixtureDiagnostic("scenario", new AggregateError([coarse, own, cleanup], "PRIVATE"));
  const messages = fixtureFailureMessages(aggregate);
  assert.match(messages[1], /stage=booking-fixture-before-callback;category=check-constraint/);
  assert.match(messages[2], /stage=additional-users;category=unique-conflict/);
  assert.match(messages[3], /stage=additional-auth-cleanup;category=unknown/);
});

let installedFailureTransport: Promise<(error: unknown) => Promise<{ numFailedTests: number; testResults: { assertionResults: { failureMessages: string[] }[] }[] }>> | undefined;
function actualInstalledFailureTransport() {
  installedFailureTransport ??= (async () => {
    const require = nodeModule.createRequire(import.meta.url);
    const fromVitest = nodeModule.createRequire(require.resolve("vitest/package.json"));
    const runnerEntry = pathToFileURL(fromVitest.resolve("@vitest/runner"));
    const runnerSource = readFileSync(new URL("./chunk-artifact.js", runnerEntry), "utf8");
    const start = "function failTask(result, err, diffOptions) {", end = "function markTasksAsSkipped(";
    assert.equal(runnerSource.split(start).length, 2); assert.equal(runnerSource.split(end).length, 2);
    const actualFailTask = runnerSource.slice(runnerSource.indexOf(start), runnerSource.indexOf(end));
    const { processError } = await import(pathToFileURL(fromVitest.resolve("@vitest/utils/error")).href);
    // Execute the exact installed body. These two control-error classes are not
    // used by our AggregateError inputs; processError is the actual installation.
    const failTask = new Function("PendingError", "TestRunAbortError", "processError", `${actualFailTask}\nreturn failTask;`)(class {}, class {}, processError) as
      (result: { state: string; errors?: unknown[] }, error: unknown) => void;
    const { JsonReporter } = await import("vitest/node");
    return async error => {
      const result: { state: string; errors?: unknown[] } = { state: "run" }; failTask(result, error);
      const file = { type: "suite", name: "fixture transport", filepath: "fixture-transport.test.ts", tasks: [] as unknown[], result: { state: "fail" } };
      file.tasks.push({ type: "test", name: "one failing fixture", suite: file, result, meta: {}, mode: "run" });
      const output: string[] = [];
      const reporter = new JsonReporter({});
      // No runner/start/collection, output file or service: the public reporter
      // writes its real JSON into this in-memory logger using a synthetic task.
      reporter.onInit({ config: {}, snapshot: { summary: {} }, logger: { log(value: string) { output.push(value); }, warn() { throw Error("Unexpected reporter warning"); } } } as never);
      await reporter.onTestRunEnd([{ task: file }] as never);
      assert.equal(output.length, 1); return JSON.parse(output[0]);
    };
  })();
  return installedFailureTransport;
}

async function actualFixtureOrigins() {
    const source = readFileSync(new URL("../../../support/calendar-feed-atdd.ts", import.meta.url), "utf8");
    const between = (start: string, end: string) => {
      assert.equal(source.split(start).length, 2); assert.equal(source.split(end).length, 2);
      return source.slice(source.indexOf(start), source.indexOf(end));
    };
    const pure = between("// Pure fixture diagnostics:", "// End pure fixture diagnostics.");
    const matcher = between("function redactMatchers", "export const expectCalendar");
    const guards = source.slice(source.indexOf("export function tokenFromUrl"));
    assert.equal(source.split("export function tokenFromUrl").length, 2);
    const strip = (nodeModule as unknown as { stripTypeScriptTypes(source: string): string }).stripTypeScriptTypes;
    return import(`data:text/javascript;base64,${Buffer.from(strip(`${pure}\n${matcher}\n${guards}\nexport { redactMatchers };`)).toString("base64")}`);
}

async function actualFirstCalendarCase(path: string, dependencies: Record<string, unknown>) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const start = source.indexOf('  test("[P0] 15.5-'); assert.ok(start >= 0);
  const end = source.indexOf("\n  });", start); assert.ok(end > start);
  const strip = (nodeModule as unknown as { stripTypeScriptTypes(source: string): string }).stripTypeScriptTypes;
  let callback: (() => Promise<void>) | undefined;
  new Function("test", ...Object.keys(dependencies), strip(source.slice(start, end + "\n  });".length)))(
    (_name: string, run: () => Promise<void>) => { callback = run; }, ...Object.values(dependencies));
  assert.ok(callback); return callback();
}

test("live issuance guards expose only closed consumed outcome classes and retain success identity and access order", async () => {
  const { issuedUrl, tokenFromUrl, calendarFixtureDiagnostic } = await actualFixtureOrigins();
  const report = await actualInstalledFailureTransport();
  let forbiddenReads = 0;
  for (const outcome of ["denied", "unavailable", "conflict", "replayed", "PRIVATE unexpected"]) {
    let reads = 0;
    const result = Object.defineProperties({}, { outcome: { get() { reads++; return outcome; } },
      issuedUrl: { get() { forbiddenReads++; throw Error("PRIVATE URL"); } },
      cause: { get() { forbiddenReads++; throw Error("PRIVATE cause"); } } });
    let failure!: Error;
    try { issuedUrl(result); assert.fail("Expected closed issuance guard"); } catch (error) { failure = error as Error; }
    const stage = outcome.startsWith("PRIVATE") ? "unknown-noncommitted" : outcome;
    assert.match(failure.message, new RegExp(`stage=scenario-issued-${stage};category=unknown`));
    assert.equal(reads, 1); assert.equal(calendarFixtureDiagnostic("scenario", failure), failure);
    const json = await report(failure); assert.equal(json.numFailedTests, 1);
    assert.ok(!JSON.stringify(json).includes("PRIVATE"));
  }
  assert.equal(forbiddenReads, 0);
  assert.throws(() => issuedUrl({ outcome: "committed", issuedUrl: null }), /scenario-issued-committed-missing-url/);
  const url = `https://example.invalid/calendar/feed/${"a".repeat(43)}`, accesses: string[] = [];
  const committed = Object.defineProperties({}, { outcome: { get() { accesses.push("outcome"); return "committed"; } },
    issuedUrl: { get() { accesses.push("url"); return url; } } });
  assert.equal(issuedUrl(committed), url); assert.deepEqual(accesses, ["outcome", "url", "url"]);
  assert.equal(tokenFromUrl(url), "a".repeat(43));
  assert.throws(() => tokenFromUrl("https://example.invalid/PRIVATE"), /scenario-canonical-token-route/);
});

test("live matcher and synchronous allowed-site wrappers preserve once calls values and controlled callsite frames without native field reads", async () => {
  const { redactMatchers, calendarFixtureAssertionAt, calendarFixtureDiagnostic } = await actualFixtureOrigins();
  let calls = 0, reads = 0;
  const hostile = Object.defineProperties({}, Object.fromEntries(["message", "stack", "cause", "code", "actual", "expected", "then"].map(key => [key, { get() { reads++; throw Error("PRIVATE"); } }])));
  const marker = {}, args = [Symbol("PRIVATE argument")];
  const assertion = redactMatchers({ pass(...received: unknown[]) { calls++; assert.equal(received[0], args[0]); return marker; }, fail() { calls++; throw hostile; } });
  assert.equal(assertion.pass(...args), marker); assert.equal(calls, 1);
  let failure!: Error;
  function controlledAssertionCallsite() { assertion.fail(); }
  try { controlledAssertionCallsite(); } catch (error) { failure = error as Error; }
  assert.match(failure.message, /stage=scenario-assertion;category=unknown/);
  assert.ok(failure.stack?.includes("controlledAssertionCallsite"));
  assert.equal(calendarFixtureDiagnostic("scenario", failure), failure);
  assert.equal(calendarFixtureAssertionAt("scenario-rls001-own", () => marker), marker);
  for (const site of ["own", "admin", "planner", "mixed"]) {
    assert.throws(() => calendarFixtureAssertionAt(`scenario-rls001-${site}`, () => { calls++; throw hostile; }), new RegExp(`stage=scenario-rls001-${site}`));
  }
  assert.equal(calls, 6); assert.equal(reads, 0); assert.ok(!failure.stack?.includes("PRIVATE"));
});

test("actual first INT001 and API001 callbacks stop at the live issuance guard after exactly their existing preceding operations", async () => {
  const seams = await actualFixtureOrigins(), report = await actualInstalledFailureTransport();
  for (const [path, expected] of [
    ["../../../integration/commands/calendar-feed.int.test.ts", ["manage"]],
    ["../../../integration/calendar-feed/public-feed.int.test.ts", ["seed", "manage"]],
  ] as const) {
    const calls: string[] = [];
    const fixture = { async seedBookings() { calls.push("seed"); }, async manage() { calls.push("manage"); return { outcome: "unavailable", issuedUrl: null }; } };
    const failure = await actualFirstCalendarCase(path, { withCalendarFeedFixture: async (_lane: string, run: (fx: unknown) => Promise<void>) => run(fixture),
      lifecycle: () => ({}), bookingSeed: (value: unknown) => value, issuedUrl: seams.issuedUrl, tokenFromUrl: seams.tokenFromUrl }).then(() => assert.fail("Expected first callback failure"), error => error);
    assert.deepEqual(calls, expected); assert.match(failure.message, /scenario-issued-unavailable/);
    const json = await report(seams.calendarFixtureDiagnostic("scenario", failure));
    assert.equal(json.numFailedTests, 1); assert.match(json.testResults[0].assertionResults[0].failureMessages[0], /scenario-issued-unavailable/);
  }
});

test("actual first RLS001 callback identifies each allowed subject without altering preceding calls or inspecting matcher arguments", async () => {
  const seams = await actualFixtureOrigins(), report = await actualInstalledFailureTransport();
  for (const failingSubject of ["own", "admin", "planner", "mixed"]) {
    const calls: string[] = [], subjects = ["own", "admin", "planner", "mixed"];
    const fixture = { async setAuthority() { calls.push("authority"); }, async rawManage(subject: string) { calls.push(subject); return { denied: subject === failingSubject }; } };
    const failure = await actualFirstCalendarCase("../../../integration/rls/calendar-feed.rls.test.ts", {
      withCalendarFeedFixture: async (_lane: string, run: (fx: unknown) => Promise<void>) => run(fixture), lifecycle: () => ({}),
      calendarFixtureAssertionAt: seams.calendarFixtureAssertionAt,
      expect: (actual: unknown) => seams.redactMatchers({ toBe(expected: unknown) { assert.equal(actual, expected); } }),
    }).then(() => assert.fail("Expected subject failure"), error => error);
    assert.deepEqual(calls, ["authority", ...subjects.slice(0, subjects.indexOf(failingSubject) + 1)]);
    const json = await report(seams.calendarFixtureDiagnostic("scenario", failure));
    assert.equal(json.numFailedTests, 1); assert.match(json.testResults[0].assertionResults[0].failureMessages[0], new RegExp(`scenario-rls001-${failingSubject}`));
  }
});

test("actual first callbacks retain precise safe assertion frames and unknown upstream limits after successful issuance", async () => {
  const seams = await actualFixtureOrigins(), report = await actualInstalledFailureTransport();
  const url = `https://example.invalid/calendar/feed/${"a".repeat(43)}`;
  const expect = (actual: unknown) => seams.redactMatchers({ toBe(expected: unknown) { assert.equal(actual, expected); },
    toHaveLength(expected: number) { assert.equal((actual as unknown[]).length, expected); } });
  for (const path of ["../../../integration/commands/calendar-feed.int.test.ts", "../../../integration/calendar-feed/public-feed.int.test.ts"]) {
    const calls: string[] = [];
    const fixture = { subjects: { foreign: { tenantId: "foreign" }, peer: { membershipId: "peer", userId: "peer" } },
      async seedBookings() { calls.push("seed"); }, async manage() { calls.push("manage"); return { outcome: "committed", issuedUrl: url }; },
      async physical() { calls.push("physical"); return { tokens: [] }; }, async http() { calls.push("http"); return { status: 503 }; } };
    const failure = await actualFirstCalendarCase(path, { withCalendarFeedFixture: async (_lane: string, run: (fx: unknown) => Promise<void>) => run(fixture),
      lifecycle: () => ({}), bookingSeed: (value: unknown) => value, issuedUrl: seams.issuedUrl, tokenFromUrl: seams.tokenFromUrl, expect }).then(() => assert.fail("Expected actual first assertion failure"), error => error);
    assert.deepEqual(calls, path.includes("commands") ? ["manage", "physical"] : ["seed", "manage", "http"]);
    const messages = (await report(seams.calendarFixtureDiagnostic("scenario", failure))).testResults[0].assertionResults[0].failureMessages;
    assert.equal(messages.length, 1); assert.match(messages[0], /stage=scenario-assertion/);
    assert.ok(messages[0].includes("eval at actualFirstCalendarCase"));
  }
  // A pre-guard rejection has no invented issuance origin. Direct own code may
  // survive, but erased/unmapped upstream information stays explicitly unknown.
  for (const rejection of [new Error("PRIVATE erased upstream"), { code: "42501", detail: "PRIVATE" }]) {
    let manages = 0;
    const failure = await actualFirstCalendarCase("../../../integration/calendar-feed/public-feed.int.test.ts", {
      withCalendarFeedFixture: async (_lane: string, run: (fx: unknown) => Promise<void>) => run({ seedBookings: async () => { throw rejection; }, manage: async () => { manages++; } }),
      bookingSeed: (value: unknown) => value,
    }).catch(error => seams.calendarFixtureDiagnostic("scenario", error));
    assert.equal(manages, 0); assert.match(failure.message, /stage=scenario;/);
    assert.ok(!failure.stack?.includes("PRIVATE"));
    assert.match(failure.message, rejection instanceof Error ? /category=unknown;sqlstate=unavailable/ : /category=insufficient-privilege;sqlstate=42501/);
  }
});

test("live owned HTTP catch emits fixed origin and preserves the existing fetch arguments without examining its rejection", async () => {
  const seams = await actualFixtureOrigins();
  const source = readFileSync(new URL("../../../support/calendar-feed-atdd.ts", import.meta.url), "utf8");
  const start = "    http: (url,options={}) =>", end = "    trustedFetch:";
  assert.equal(source.split(start).length, 2); assert.equal(source.split(end).length, 2);
  const httpSource = source.slice(source.indexOf(start), source.indexOf(end));
  const strip = (nodeModule as unknown as { stripTypeScriptTypes(source: string): string }).stripTypeScriptTypes;
  let calls = 0, reads = 0; const headers = {}, hostile = Object.defineProperty({}, "message", { get() { reads++; throw Error("PRIVATE"); } });
  const make = (fetch: (...args: unknown[]) => Promise<unknown>, response: (value: unknown) => unknown) => new Function("track", "testOrigin", "fetch", "response", "calendarFixtureOrigin", `return ${strip(`({${httpSource}}).http`)};`)(
    (value: unknown) => value, () => "https://example.invalid", fetch, response, seams.calendarFixtureOrigin);
  const http = make(async (target, options) => { calls++; assert.ok(target instanceof URL); assert.equal(target.searchParams.get("from"), "1900"); assert.deepEqual(options, { headers, redirect: "manual", cache: "no-store" }); throw hostile; }, value => value);
  await assert.rejects(http("https://example.invalid/calendar/feed/opaque", { headers, query: { from: "1900" } }), /scenario-http-transport/);
  assert.equal(calls, 1); assert.equal(reads, 0);
  const result = {}; assert.equal(await make(async () => result, value => value)("https://example.invalid/calendar/feed/opaque"), result);
});

test("installed failure transport reproduces lost nested diagnostics without treating reporter absence as unknown in process", async () => {
  const report = await actualInstalledFailureTransport();
  const leaf = new Error("Calendar fixture failure [stage=bind-profile;category=insufficient-privilege;sqlstate=42501]");
  const nested = new AggregateError([leaf], "Calendar fixture failure group [stage=canonical-fixture-cleanup]");
  const oldShape = new AggregateError([nested], "Calendar fixture failure group [stage=scenario]");
  assert.equal(nested.errors[0], leaf); // The in-process positive control exists.
  const json = await report(oldShape), messages = json.testResults[0].assertionResults[0].failureMessages;
  assert.equal(json.numFailedTests, 1); assert.equal(messages.length, 1);
  assert.match(messages[0], /group \[stage=canonical-fixture-cleanup\]/);
  assert.ok(!messages[0].includes("sqlstate=42501"));
});

test("actual repaired fixture diagnostics reach installed JSON as ordered primary and cleanup leaves within one failed case", async () => {
  const { calendarFixtureDiagnostic } = await actualFixtureDiagnostics(), report = await actualInstalledFailureTransport();
  const primary = calendarFixtureDiagnostic("bind-profile", { code: "42501", message: "PRIVATE native" });
  const unknown = calendarFixtureDiagnostic("booking-fixture-before-callback", new Error("PRIVATE lost 23503"));
  const cleanup = calendarFixtureDiagnostic("owned-row-cleanup", { code: "23503", query: "PRIVATE query" });
  const nested = calendarFixtureDiagnostic("canonical-fixture-cleanup", new AggregateError([primary, new AggregateError([unknown, cleanup], "PRIVATE")], "PRIVATE"));
  const final = calendarFixtureDiagnostic("scenario", new AggregateError([nested], "PRIVATE"));
  assert.ok(final instanceof AggregateError); assert.equal(final.errors.length, 3);
  assert.ok(final.errors.every((error: Error) => !(error instanceof AggregateError)));
  const json = await report(final), messages = json.testResults[0].assertionResults[0].failureMessages;
  assert.equal(json.numFailedTests, 1); assert.equal(messages.length, 3);
  assert.match(messages[0], /stage=bind-profile;category=insufficient-privilege;sqlstate=42501/);
  assert.match(messages[1], /stage=booking-fixture-before-callback;category=unknown;sqlstate=unavailable/);
  assert.match(messages[2], /stage=owned-row-cleanup;category=foreign-key;sqlstate=23503/);
  assert.ok(!JSON.stringify(json).includes("PRIVATE"));
});

test("installed diagnostic JSON retains closed getter cycle and truncation negatives without native payload or accessor reads", async () => {
  const { calendarFixtureDiagnostic } = await actualFixtureDiagnostics(), report = await actualInstalledFailureTransport();
  let getters = 0;
  const privateText = "PRIVATE URL TOKEN PROOF KEY SQL PARAMS";
  const hostile = Object.defineProperties({}, { code: { get() { getters++; throw Error(privateText); } },
    cause: { get() { getters++; throw Error(privateText); } }, message: { value: privateText }, detail: { value: privateText },
    query: { value: privateText }, params: { value: [privateText] }, then: { get() { getters++; throw Error(privateText); } } });
  const cycle: { errors: unknown[] } = { errors: [] }; cycle.errors.push(cycle);
  let deep: unknown = { code: "42501", message: privateText };
  for (let i = 0; i < 10; i++) deep = new AggregateError([deep], privateText);
  const failure = calendarFixtureDiagnostic("scenario", new AggregateError([hostile, Object.create({ code: "42501" }), cycle, deep], privateText));
  const json = await report(failure), messages = json.testResults[0].assertionResults[0].failureMessages;
  assert.equal(json.numFailedTests, 1); assert.equal(getters, 0);
  assert.ok(messages.some(message => message.includes("category=unknown;sqlstate=unavailable")));
  assert.ok(messages.some(message => message.includes("category=cycle")));
  assert.ok(messages.some(message => message.includes("category=truncated")));
  assert.ok(!JSON.stringify(json).includes(privateText));
  assert.ok(!messages.some(message => message.includes("sqlstate=42501")));
  const wide = calendarFixtureDiagnostic("scenario", new AggregateError(Array.from({ length: 100 }, () => ({ code: "42501", message: privateText })), privateText));
  const wideJson = await report(wide), wideMessages = wideJson.testResults[0].assertionResults[0].failureMessages;
  assert.equal(wideMessages.length, 15); assert.match(wideMessages.at(-1)!, /category=truncated/);
  assert.ok(!JSON.stringify(wideJson).includes(privateText));
});

test("the actual allocated policy case rejects missing extra DELETE ALL names and broadened roles without filtering rows", async () => {
  // This executes the exact catalog assertion with injected rows, not Postgres,
  // RLS or a migration reset. Its native case and query count remain unchanged.
  const source = readFileSync(new URL("../../../integration/rls/acceptance-tables-migration-reset.int.test.ts", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const start = '  it("[P0] each table has exactly the approved role-specific policies (NO DELETE or ALL policy)"';
  assert.equal(source.split(start).length, 2);
  const at = source.indexOf(start), end = source.indexOf("\n  });", at);
  assert.ok(end > at);
  const strip = (nodeModule as unknown as { stripTypeScriptTypes(source: string): string }).stripTypeScriptTypes;
  const code = strip(source.slice(at, end + "\n  });".length));
  const tables = ["quote_acceptances", "jobs", "job_events"];
  const rows = (table: string) => [...["INSERT", "SELECT", "UPDATE"].map(cmd => ({ policyname: `${table}_${cmd.toLowerCase()}_own`, cmd, roles: ["authenticated"] })),
    ...(table === "jobs" ? [{ policyname: "calendar_feed_owner_jobs", cmd: "SELECT", roles: ["calendar_feed_owner"] }] : [])];
  async function run(change: (values: ReturnType<typeof rows>, table: string) => ReturnType<typeof rows> = value => value) {
    const queries: string[] = []; let body: (() => Promise<void>) | undefined;
    new Function("it", "skipUnlessStack", "stackUp", "ACCEPTANCE_TABLES", "adminQuery", "expect", code)(
      (_name: string, test: () => Promise<void>) => { body = test; }, () => false, true, tables,
      async (sql: string, params: string[]) => { assert.equal(sql, "select policyname,cmd,roles::text[] as roles from pg_policies where schemaname = 'public' and tablename = $1"); queries.push(params[0]); return change(rows(params[0]), params[0]); },
      (value: unknown) => ({ toEqual(expected: unknown) { assert.deepEqual(value, expected); } }),
    );
    assert.ok(body); await body(); assert.deepEqual(queries, tables);
  }
  await run();
  for (const mutate of [
    (r: ReturnType<typeof rows>) => r.slice(0, -1),
    (r: ReturnType<typeof rows>) => [...r, { policyname: "extra", cmd: "SELECT", roles: ["authenticated"] }],
    (r: ReturnType<typeof rows>) => r.map((row, i) => i ? row : { ...row, cmd: "DELETE" }),
    (r: ReturnType<typeof rows>) => r.map((row, i) => i ? row : { ...row, cmd: "ALL" }),
    (r: ReturnType<typeof rows>) => r.map((row, i) => i ? row : { ...row, policyname: "renamed" }),
    (r: ReturnType<typeof rows>) => r.map(row => row.policyname === "calendar_feed_owner_jobs" ? { ...row, roles: ["authenticated"] } : row),
    (r: ReturnType<typeof rows>) => r.map(row => row.policyname === "calendar_feed_owner_jobs" ? { ...row, roles: ["calendar_feed_owner", "public"] } : row),
  ]) await assert.rejects(run((r, table) => table === "jobs" ? mutate(r) : r));
});

let browserSeams: Promise<typeof import("../../../e2e/support/calendar-feed-atdd")> | undefined;
function actualBrowserSeams() {
  // The existing bare-Node alias hook selects a sibling fixture directory before
  // tenants.ts. Execute the actual self-contained source region, without loading
  // its DB/browser adapters, copying implementation or changing the shared hook.
  browserSeams ??= (async () => {
    const source = readFileSync(new URL("../../../e2e/support/calendar-feed-atdd.ts", import.meta.url), "utf8");
    const start = "// Pure diagnostic/observation seams:", end = "/** Accessible labels";
    assert.equal(source.split(start).length, 2); assert.equal(source.split(end).length, 2);
    const pureSource = source.slice(source.indexOf(start), source.indexOf(end));
    // Installed Node22 exposes this API; repository @types/node20 predates it.
    const strip = (nodeModule as unknown as { stripTypeScriptTypes(source: string): string }).stripTypeScriptTypes;
    assert.equal(typeof strip, "function");
    const executable = strip(pureSource);
    return import(`data:text/javascript;base64,${Buffer.from(executable).toString("base64")}`);
  })();
  return browserSeams;
}

test("actual browser diagnostic seam emits only closed stages categories and SQLSTATE without traversing native payloads", async () => {
  const { calendarBrowserDiagnostic } = await actualBrowserSeams();
  let getters = 0;
  const privateText = "PRIVATE capability proof URL key SQL parameters";
  const hostile = Object.defineProperties({}, { code: { get() { getters++; throw new Error(privateText); } },
    message: { value: privateText }, cause: { get() { getters++; throw new Error(privateText); } }, stack: { value: privateText } });
  const unknown = calendarBrowserDiagnostic("not-admitted" as never, hostile);
  assert.equal(unknown.message, "Calendar browser failure [stage=unknown;category=unknown;sqlstate=unavailable]");
  assert.equal(getters, 0); assert.equal(unknown.cause, undefined); assert.ok(!unknown.stack?.includes(privateText));
  const known = calendarBrowserDiagnostic("cleanup-sql", Object.assign(new Error(privateText), { code: "42501", detail: privateText, cause: hostile }));
  assert.equal(known.message, "Calendar browser failure [stage=cleanup-sql;category=database;sqlstate=42501]");
  assert.equal(known.cause, undefined); assert.ok(!known.stack?.includes(privateText));
  assert.equal(calendarBrowserDiagnostic("scenario", known), known); // Preserve safe nested cleanup diagnostics.
});

test("actual browser event waiter preserves matching, removes listeners and observes timeout predicate and cancellation failures", async () => {
  const { calendarEventWaiter } = await actualBrowserSeams();
  const events = new EventEmitter();
  const waiter = (predicate: (value: number) => boolean, timeoutMs = 5) => calendarEventWaiter({
    subscribe: listener => { events.on("response", listener); }, unsubscribe: listener => { events.off("response", listener); },
    predicate, stage: "action-response", timeoutMs });
  const matching = waiter(value => value === 7, 100);
  events.emit("response", 6); assert.equal(events.listenerCount("response"), 1);
  events.emit("response", 7); assert.equal(await matching.promise, 7); assert.equal(events.listenerCount("response"), 0);
  const timed = waiter(() => false); await assert.rejects(timed.promise, /stage=action-response;category=timeout/);
  assert.equal(events.listenerCount("response"), 0);
  const bad = waiter(() => { throw new Error("PRIVATE predicate value"); }); events.emit("response", 7);
  await assert.rejects(bad.promise, error => error instanceof Error && !error.message.includes("PRIVATE"));
  const cancelled = waiter(() => true); cancelled.cancel(); cancelled.cancel();
  await assert.rejects(cancelled.promise, /category=cancelled/); assert.equal(events.listenerCount("response"), 0);
});

test("actual browser observation handles early response rejection and abandoned outer promise before request arrives", async () => {
  const { calendarEventWaiter, createCalendarLifecycleObservations } = await actualBrowserSeams();
  const events = new EventEmitter(), registry = createCalendarLifecycleObservations({ settlementTimeoutMs: 100 });
  let readbacks = 0;
  const waiter = (kind: "request" | "response", timeoutMs: number) => calendarEventWaiter({
    subscribe: listener => { events.on(kind, listener); }, unsubscribe: listener => { events.off(kind, listener); },
    predicate: () => true, stage: kind === "request" ? "action-request" : "action-response", timeoutMs });
  const observation = registry.observe({ request: () => waiter("request", 100), response: () => waiter("response", 5),
    readback: async () => { readbacks++; return true; } });
  // Deliberately do not await the outer promise until after the inner rejection;
  // node:test would report an unhandledRejection if either observer were missing.
  await new Promise(resolve => setTimeout(resolve, 15));
  const settled = await registry.cancelAndSettle();
  assert.equal(settled.settled, true); assert.ok(settled.errors.length > 0); assert.equal(readbacks, 0);
  await assert.rejects(observation, /category=timeout/);
  assert.equal(events.listenerCount("request"), 0); assert.equal(events.listenerCount("response"), 0);
});

test("actual browser observation handles setup failure after first waiter and preserves successful real readback values", async () => {
  const { calendarEventWaiter, createCalendarLifecycleObservations } = await actualBrowserSeams();
  const events = new EventEmitter(), registry = createCalendarLifecycleObservations({ settlementTimeoutMs: 100 });
  const response = () => calendarEventWaiter<number>({ subscribe: listener => { events.on("response", listener); },
    unsubscribe: listener => { events.off("response", listener); }, predicate: () => true, stage: "action-response", timeoutMs: 100 });
  const failed = registry.observe({ response, request() { throw new Error("PRIVATE setup details"); }, readback: async () => true });
  await assert.rejects(failed, error => error instanceof Error && !error.message.includes("PRIVATE"));
  assert.equal(events.listenerCount("response"), 0);
  const success = registry.observe({ response, request: () => ({ promise: Promise.resolve(7), cancel() {} }),
    readback: async (value, signal) => { assert.equal(signal.aborted, false); return { actualRequest: value, committed: true }; } });
  events.emit("response", 9);
  assert.deepEqual(await success, { actualRequest: 7, committed: true });
  const final = await registry.cancelAndSettle(); assert.equal(final.settled, true); assert.equal(final.errors.length, 1);
});

test("actual browser bounded cancellation cannot claim in-flight readback settled and retains errors until actual completion", async () => {
  const { createCalendarLifecycleObservations } = await actualBrowserSeams();
  const registry = createCalendarLifecycleObservations({ settlementTimeoutMs: 5 });
  let release!: () => void, entered!: () => void, settled = false;
  const started = new Promise<void>(resolve => { entered = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
  const observation = registry.observe({ request: () => ({ promise: Promise.resolve(7), cancel() {} }),
    response: () => ({ promise: Promise.resolve(true), cancel() {} }),
    readback: async (_request, signal) => { entered(); await gate; assert.equal(signal.aborted, true); return true; } });
  void observation.finally(() => { settled = true; }).catch(() => undefined);
  await started;
  const pending = await registry.cancelAndSettle();
  assert.equal(pending.settled, false); assert.equal(settled, false);
  assert.ok(pending.errors.some(error => error.message.includes("stage=cleanup-lifecycle;category=timeout")));
  release(); await assert.rejects(observation, /category=cancelled/);
  const completed = await registry.cancelAndSettle(); assert.equal(completed.settled, true);
  assert.ok(completed.errors.length > 0); assert.equal(settled, true);
});

test("actual browser listener removal failure keeps cancellation unverified even after all observation promises settle", async () => {
  const { calendarEventWaiter, createCalendarLifecycleObservations } = await actualBrowserSeams();
  const registry = createCalendarLifecycleObservations({ settlementTimeoutMs: 100 });
  let removals = 0;
  const observation = registry.observe({ request: () => ({ promise: Promise.resolve(7), cancel() {} }),
    response: () => calendarEventWaiter({ subscribe() {}, unsubscribe() { removals++; throw new Error("PRIVATE listener details"); },
      predicate: () => true, stage: "action-response", timeoutMs: 5 }), readback: async () => true });
  await assert.rejects(observation, error => error instanceof Error && !error.message.includes("PRIVATE"));
  const result = await registry.cancelAndSettle();
  assert.equal(result.settled, false); assert.equal(removals, 1); assert.ok(result.errors.length > 0);
  for (const error of result.errors) { assert.equal(error.cause, undefined); assert.ok(!error.stack?.includes("PRIVATE")); }
});

test("actual browser matched events cannot credit pending or failed HTTP completion as settled transport", async () => {
  const { createCalendarLifecycleObservations } = await actualBrowserSeams();
  for (const outcome of ["complete", "failed", "rejected"] as const) {
    const registry = createCalendarLifecycleObservations({ settlementTimeoutMs: 5 });
    let finish!: (value: boolean) => void, fail!: (error: Error) => void;
    const completion = new Promise<boolean>((resolve, reject) => { finish = resolve; fail = reject; });
    const observation = registry.observe({ request: () => ({ promise: Promise.resolve(7), cancel() {} }),
      response: () => ({ promise: Promise.resolve(true), cancel() {} }), readback: async () => true,
      completion: async request => { assert.equal(request, 7); return completion; } });
    assert.equal(await observation, true); // Actual body completion remains a separate condition.
    assert.equal((await registry.cancelAndSettle()).settled, false);
    if (outcome === "rejected") fail(new Error("PRIVATE native completion details")); else finish(outcome === "complete");
    const result = await registry.cancelAndSettle();
    assert.equal(result.settled, outcome === "complete");
    if (outcome !== "complete") assert.ok(result.errors.length > 0);
    assert.ok(result.errors.every(error => !error.stack?.includes("PRIVATE") && error.cause === undefined));
  }
  const unmatched = createCalendarLifecycleObservations({ settlementTimeoutMs: 5 });
  let completionCalls = 0;
  const observation = unmatched.observe({ request: () => ({ promise: Promise.reject(new Error("PRIVATE unmatched request")), cancel() {} }),
    response: () => ({ promise: Promise.resolve(true), cancel() {} }), readback: async () => true,
    completion: async () => { completionCalls++; return true; } });
  await assert.rejects(observation);
  assert.equal((await unmatched.cancelAndSettle()).settled, false); assert.equal(completionCalls, 0);
  const failedSetup = createCalendarLifecycleObservations({ settlementTimeoutMs: 5 });
  const failedObservation = failedSetup.observe({ request() { throw new Error("PRIVATE listener setup"); },
    response: () => ({ promise: Promise.resolve(true), cancel() {} }), readback: async () => true, completion: async () => true });
  await assert.rejects(failedObservation);
  assert.equal((await failedSetup.cancelAndSettle()).settled, false);
});

test("actual browser finally cleanup executes every step and retains primary plus all sanitized cleanup errors", async () => {
  const { calendarBrowserCleanup } = await actualBrowserSeams();
  const calls: string[] = [];
  await assert.rejects(calendarBrowserCleanup([
    { stage: "cleanup-fault-release", async run() { calls.push("release"); throw new Error("PRIVATE gate details"); } },
    { stage: "cleanup-lifecycle", async run() { calls.push("join"); } },
    { stage: "cleanup-page", async run() { calls.push("page"); throw Object.assign(new Error("PRIVATE page details"), { code: "42501" }); } },
  ], { error: new Error("PRIVATE original failure") }), error => {
    assert.ok(error instanceof AggregateError); assert.equal(error.errors.length, 3);
    assert.ok(error.errors[0].message.includes("stage=scenario"));
    assert.ok(error.errors[1].message.includes("stage=cleanup-fault-release"));
    assert.ok(error.errors[2].message.includes("stage=cleanup-page;category=database;sqlstate=42501"));
    assert.ok(error.errors.every((nested: Error) => nested.cause === undefined && !nested.stack?.includes("PRIVATE")));
    return true;
  });
  assert.deepEqual(calls, ["release", "join", "page"]);
});

test("installed polling deadline cannot credit pending actual SQL callbacks despite successful HTTP completion", async () => {
  const { createCalendarLifecycleObservations } = await actualBrowserSeams();
  const { iso } = nodeModule.createRequire(import.meta.url)("../../../../node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core/lib/coreBundle.js") as {
    iso: { monotonicTime(): number; pollAgainstDeadline(callback: () => Promise<{ continuePolling: boolean; result: boolean }>, deadline: number, intervals: number[]): Promise<{ timedOut: boolean }> };
  };
  const registry = createCalendarLifecycleObservations({ settlementTimeoutMs: 5 });
  let releaseTokens!: () => void, releaseAudit!: () => void, finishedQueries = 0, httpComplete = false, callbackCompleted = false;
  const tokens = new Promise<void>(resolve => { releaseTokens = resolve; }), audit = new Promise<void>(resolve => { releaseAudit = resolve; });
  const observation = registry.observe({ request: () => ({ promise: Promise.resolve(7), cancel() {} }),
    response: () => ({ promise: Promise.resolve(true), cancel() {} }), completion: async () => { httpComplete = true; return true; },
    readback: async (_request, signal) => {
      const result = await iso.pollAgainstDeadline(() => registry.trackReadback(async () => {
        await Promise.allSettled([
          registry.trackReadback(() => tokens.then(() => { finishedQueries++; })),
          registry.trackReadback(() => audit.then(() => { finishedQueries++; })),
        ]);
        callbackCompleted = true;
        if (signal.aborted) throw Object.assign(new Error("Injected cancellation"), { name: "AbortError" });
        return { continuePolling: false, result: true };
      }), iso.monotonicTime() + 100, [1]);
      if (result.timedOut) throw Object.assign(new Error("Injected polling deadline"), { name: "TimeoutError" });
      return true;
    } });
  await assert.rejects(observation, /category=timeout/);
  assert.equal(httpComplete, true); assert.equal(finishedQueries, 0);
  assert.equal((await registry.cancelAndSettle()).settled, false);
  releaseTokens(); assert.equal((await registry.cancelAndSettle()).settled, false); assert.equal(finishedQueries, 1);
  releaseAudit(); const actual = await registry.cancelAndSettle();
  assert.equal(actual.settled, true); assert.equal(finishedQueries, 2);
  assert.equal(callbackCompleted, true);
  assert.ok(actual.errors.some(error => error.message.includes("category=timeout")));
});

test("tracked sibling SQL failures remain owned through outer deadline and preserve every sanitized failure", async () => {
  const { createCalendarLifecycleObservations } = await actualBrowserSeams();
  const registry = createCalendarLifecycleObservations({ settlementTimeoutMs: 5 });
  let rejectTokens!: (error: Error) => void, rejectAudit!: (error: Error) => void, started!: () => void;
  const tokens = new Promise<void>((_resolve, reject) => { rejectTokens = reject; });
  const audit = new Promise<void>((_resolve, reject) => { rejectAudit = reject; });
  const entered = new Promise<void>(resolve => { started = resolve; });
  const callback = registry.trackReadback(async () => {
    const siblings = [registry.trackReadback(() => tokens), registry.trackReadback(() => audit)]; started();
    await Promise.allSettled(siblings); throw new Error("PRIVATE callback failure");
  });
  await entered;
  rejectTokens(Object.assign(new Error("PRIVATE token query"), { code: "42501" }));
  const first = await registry.cancelAndSettle(); assert.equal(first.settled, false);
  rejectAudit(Object.assign(new Error("PRIVATE audit query"), { code: "57014" }));
  await assert.rejects(callback, error => error instanceof Error && !error.message.includes("PRIVATE"));
  const final = await registry.cancelAndSettle(); assert.equal(final.settled, true);
  assert.ok(final.errors.some(error => error.message.includes("sqlstate=42501")));
  assert.ok(final.errors.some(error => error.message.includes("sqlstate=57014")));
  assert.ok(final.errors.length >= 3);
  assert.ok(final.errors.every(error => error.cause === undefined && !error.stack?.includes("PRIVATE")));
});

test("readback ownership closes before drain and refuses queued and late callbacks without launching SQL", async () => {
  const { createCalendarLifecycleObservations } = await actualBrowserSeams();
  const registry = createCalendarLifecycleObservations({ settlementTimeoutMs: 5 }); let launches = 0;
  const queued = registry.trackReadback(async () => { launches++; return true; });
  const draining = registry.cancelAndSettle(); // closes synchronously before queued factory invocation
  await assert.rejects(queued, /category=cancelled/);
  assert.equal((await draining).settled, true); assert.equal(launches, 0);
  const late = registry.trackReadback(async () => { launches++; return true; });
  await assert.rejects(late, /category=cancelled/); assert.equal(launches, 0);
  assert.ok((await registry.cancelAndSettle()).errors.length >= 2);
});

test("the exact returned readback promise observes abandoned factory and native query rejections immediately", async () => {
  const { createCalendarLifecycleObservations } = await actualBrowserSeams();
  const registry = createCalendarLifecycleObservations({ settlementTimeoutMs: 5 });
  // Intentionally abandon both returned promises until the next turn; node:test
  // detects any unobserved adopting async wrapper or rejection branch.
  const sync = registry.trackReadback(() => { throw new Error("PRIVATE sync query"); });
  const async = registry.trackReadback(() => Promise.reject(Object.assign(new Error("PRIVATE async query"), { code: "42501" })));
  await new Promise(resolve => setImmediate(resolve));
  await assert.rejects(sync, error => error instanceof Error && !error.stack?.includes("PRIVATE"));
  await assert.rejects(async, /sqlstate=42501/);
  const final = await registry.cancelAndSettle(); assert.equal(final.settled, true); assert.equal(final.errors.length, 2);
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
  assert.equal(result.receipt.keyOutcome, "rollback-confirmed");
  assert.deepEqual(result.receipt.diagnostics, [{ stage: "key-create", category: "unclassified", sqlState: null }]);
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
  assert.equal(result.receipt.keyOutcome, "unverified");
  assert.deepEqual(result.receipt.diagnostics.map(item => item.stage), ["runtime", "child-cleanup", "database-close"]);
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
  assert.equal(result.receipt.keyOutcome, "unverified");
  assert.deepEqual(result.receipt.diagnostics, [
    { stage: "key-create", category: "unclassified", sqlState: null },
    { stage: "transaction-rollback", category: "unclassified", sqlState: null },
  ]);
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


const diagnosticEnv={...env,GITHUB_SHA:"a".repeat(40),GITHUB_EVENT_NAME:"workflow_dispatch",CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT:keyId};
const observation=()=>({kind:"calendar_feed.cause_proof",mode:"cause-proof",outcome:"AMBIGUOUS_SQL42501",events:["execute-enter","context-match","status-rpc42501"],baseline:"status",sqlState:"42501",cleanupVerified:true,ordinarySettled:true,queriesSettled:true,failures:[],statusDiscriminator:{schema:"status-origin-v1",origin:"UNKNOWN",permissions:Object.fromEntries(["caller_public_usage", "caller_status_execute", "owner_public_usage", "owner_auth_usage", "owner_uid_execute", "owner_subject_execute", "owner_lock_execute", "owner_hash_execute", "owner_tenant_id_select", "owner_member_id_select", "owner_member_tenant_select", "owner_member_user_select", "owner_member_status_select", "owner_member_role_select", "owner_union_tenant_select", "owner_union_member_select", "owner_union_role_select", "owner_tokens_select"].map(name=>[name,true]))}});
const traceExpected={tenantId:"owned-tenant",userId:"owned-user",membershipId:"owned-member",attemptId:"owned-attempt",action:"create",revision:0};
test("actual per-invocation trace preserves once-call value and error identity and isolates concurrent and nested scopes",async()=>{
  const value={},failure={private:"PRIVATE"};let calls=0;
  const result=await captureCalendarFeedTrace(traceExpected,async()=>{calls++;recordCalendarFeedContext("owned-tenant","owned-user",{action:"create",revision:0,attemptId:"owned-attempt"});recordCalendarFeedMembership("owned-member");return value;});
  assert.equal(calls,1);assert.equal(result.ok&&result.value,value);assert.deepEqual(result.events,["context-match","membership-match"]);
  const bad=await captureCalendarFeedTrace(traceExpected,async()=>{throw failure;});assert.equal(!bad.ok&&bad.error,failure);
  const [a,b]=await Promise.all([captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("status-enter");await Promise.resolve();recordCalendarFeedTrace("status-valid");}),captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("manage-enter");})]);
  assert.deepEqual(a.events,["status-enter","status-valid"]);assert.deepEqual(b.events,["manage-enter"]);
  const outer=await captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("execute-enter");const inner=await captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("status-enter");});assert.deepEqual(inner.events,["status-enter"]);recordCalendarFeedTrace("key-ready");});assert.deepEqual(outer.events,["execute-enter","key-ready"]);
  recordCalendarFeedTrace("status-enter");assert.deepEqual((await captureCalendarFeedTrace(traceExpected,async()=>{})).events,[]);
});
test("actual trace bounds hostile expected getters and event overflow without serializing values",async()=>{
  let getters=0,run=0;const bad=Object.defineProperty({...traceExpected},"tenantId",{get(){getters++;throw Error("PRIVATE");}});
  await assert.rejects(captureCalendarFeedTrace(bad,async()=>{run++;}),/expected-context refused/);assert.equal(getters,0);assert.equal(run,0);
  const result=await captureCalendarFeedTrace(traceExpected,async()=>{for(let i=0;i<40;i++)recordCalendarFeedTrace("status-enter");});assert.equal(result.events.length,16);assert.equal(result.events[15],"truncated");assert.ok(!JSON.stringify(result.events).includes("PRIVATE"));
});
test("actual management adapter records each existing error branch after one original RPC await",async()=>{
  for(const [code,event]of [["42501","manage-rpc42501"],["CF409","manage-rpcCF409"],["unknown","manage-rpc-error"]] as const){let calls=0;const args={private:"PRIVATE"};const client={rpc:async(name:string,received:unknown)=>{calls++;assert.equal(name,"manage_calendar_feed");assert.equal(received,args);return{data:null,error:{code}};}};
    const result=await captureCalendarFeedTrace(traceExpected,()=>executeCalendarFeed(client as never,args));assert.equal(result.ok,false);assert.equal(calls,1);assert.deepEqual(result.events,[event]);assert.ok(!JSON.stringify(result.events).includes("PRIVATE"));
  }
  const result=await captureCalendarFeedTrace(traceExpected,()=>executeCalendarFeed({rpc:async()=>({data:{outcome:"committed",revision:1},error:null})} as never,{}));assert.equal(result.ok&&result.value.revision,1);assert.deepEqual(result.events,["manage-valid"]);
});
test("actual baseline decision chooses one observed boundary only and pg timeout is not protocol settlement",async()=>{
  const seams=await actualFixtureOrigins();
  assert.equal(seams.calendarCauseProofSelection(["context-match","status-rpc42501"]),"status");
  assert.equal(seams.calendarCauseProofSelection(["context-match","membership-match","manage-rpc42501"]),"manage");
  for(const events of [["status-rpc42501"],["context-match","membership-mismatch","manage-rpc42501"],["context-match","status-rpc42501","truncated"],["context-match","status-rpc-error"]])assert.equal(seams.calendarCauseProofSelection(events),"not-selected");
  let now=0;const client={readyForQuery:false};assert.equal(await seams.calendarCauseProofIdle(client,()=>now,async()=>{now+=1000;}),false);
  now=0;assert.equal(await seams.calendarCauseProofIdle(client,()=>now,async()=>{now+=1000;if(now===3000)client.readyForQuery=true;}),true);
});
test("cause-proof launches only fixed one-case argv and joins diagnostic work before exact key deletion",async()=>{
  const h=harness();let verified=false,finished=false;
  const result=await runCalendarFeedRuntime({mode:"cause-proof",env:diagnosticEnv,platform:"linux"},{...h.deps,prepareDiagnostic:async()=>{},readDiagnostic:async()=>{verified=true;return observation();},finishDiagnostic:async(receipt:{keyDeleted:boolean})=>{assert.equal(verified,true);assert.equal(receipt.keyDeleted,true);finished=true;return true;}});
  assert.equal(result.exitCode,0);assert.equal(h.launches.length,1);assert.equal(h.launches[0].command,"pnpm");assert.deepEqual(h.launches[0].args,CAUSE_PROOF_ARGS);assert.equal(h.launches[0].childEnv.CALENDAR_FEED_CAUSE_PROOF_MODE,"1");assert.ok(!h.events.includes("ready"));assert.ok(!h.events.includes("port-checked"));assert.equal(finished,true);assert.ok(h.events.indexOf("settled:0")<h.events.indexOf("delete"));
});
test("abnormal or unverified diagnostic work retains key custody and never infers cleanup from child exit",async()=>{
  for(const failChild of [true,false]){const h=harness(failChild?{failChild:0}:{});const result=await runCalendarFeedRuntime({mode:"cause-proof",env:diagnosticEnv,platform:"linux"},{...h.deps,prepareDiagnostic:async()=>{},readDiagnostic:async()=>{throw Error("PRIVATE pending work");},finishDiagnostic:async()=>true});assert.equal(result.exitCode,1);assert.equal(result.receipt.keyDeleted,false);assert.ok(result.receipt.custody);assert.ok(!h.events.includes("delete"));assert.ok(!JSON.stringify(result.receipt).includes("PRIVATE"));}
  const h=harness();const result=await runCalendarFeedRuntime({mode:"cause-proof",env:{...diagnosticEnv,GITHUB_RUN_ATTEMPT:"2",CALENDAR_FEED_CI_DISPOSABLE_STACK:"123:2:db"},platform:"linux"},h.deps);assert.equal(result.exitCode,1);assert.equal(h.launches.length,0);assert.ok(!h.events.includes("entropy"));
});
test("diagnostic wire schema refuses pending cleanup unknown fields values and getters without raw output",()=>{
  assert.equal(validateCauseProofObservation(observation()).outcome,"AMBIGUOUS_SQL42501");
  for(const change of [{cleanupVerified:false},{ordinarySettled:false},{queriesSettled:false},{events:["PRIVATE secret"]},{sqlState:"PRIVATE"},{extra:"PRIVATE"},{failures:["PRIVATE"]}])assert.throws(()=>validateCauseProofObservation({...observation(),...change}),/diagnostic-/);
  let gets=0;const hostile=Object.defineProperty(observation(),"outcome",{get(){gets++;throw Error("PRIVATE");}});assert.throws(()=>validateCauseProofObservation(hostile),/diagnostic-observation-refused/);assert.equal(gets,0);
  const cycle=observation() as unknown as {events:unknown[]};cycle.events=[cycle];assert.throws(()=>validateCauseProofObservation(cycle),/diagnostic-observation-refused/);
});


test("actual installed failed native report and closed observation upload distinctly without publishing custody handles",async()=>{
  const folder=await mkdtemp(join(tmpdir(),"calendar-report-control-")), reports=join(folder,"test-results/calendar-feed-cause-proof");
  try{
    await mkdir(reports,{recursive:true}); const report=await actualInstalledFailureTransport();
    const native=await report(new Error("Fixed diagnostic failure; values redacted"));
    await writeFile(join(reports,"native.json"),JSON.stringify(native));await writeFile(join(reports,"observation.json"),JSON.stringify(observation()));
    const receipt={launchAttempted:true,childLaunchState:"started",childExitCodes:[1],keyDeleted:false,dbClosed:true,custody:{ownedName:"PRIVATE custody",vaultUuid:"PRIVATE UUID"},failures:["child-failed"]};
    assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"private-key",secret:"private-secret"}),true);
    assert.equal((JSON.parse(await readFile(join(reports,"upload/native.json"),"utf8")) as {numFailedTests:number}).numFailedTests,1);
    const metadata=await readFile(join(reports,"upload/receipt.json"),"utf8");assert.ok(!metadata.includes("PRIVATE"));assert.equal(JSON.parse(metadata).evidenceClass,"diagnostic-only");assert.equal(JSON.parse(metadata).custodyRetained,true);
  }finally{assert.ok(resolve(folder).startsWith(resolve(tmpdir())+"\\" ) || resolve(folder).startsWith(resolve(tmpdir())+"/"));await rm(folder,{recursive:true,force:true});}
});
test("diagnostic missing or sensitive native reports fail capture and never enter the upload tree",async()=>{
  const folder=await mkdtemp(join(tmpdir(),"calendar-report-negative-")), reports=join(folder,"test-results/calendar-feed-cause-proof");
  try{
    await mkdir(reports,{recursive:true});await writeFile(join(reports,"observation.json"),JSON.stringify(observation()));
    const receipt={launchAttempted:true,childLaunchState:"started",childExitCodes:[0],keyDeleted:true,dbClosed:true,custody:null,failures:[]};
    assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"key",secret:"PRIVATE sensitive"}),false);
    await writeFile(join(reports,"native.json"),JSON.stringify({numTotalTests:1,numPendingTests:0,numFailedTests:0,numPassedTests:1,private:"PRIVATE sensitive"}));
    assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"key",secret:"PRIVATE sensitive"}),false);
    await assert.rejects(stat(join(reports,"upload/native.json")));
    assert.ok(!(await readFile(join(reports,"upload/manifest.json"),"utf8")).includes("PRIVATE"));
    await writeFile(join(reports,"native.json"),JSON.stringify({numTotalTests:16,numPendingTests:15,numFailedTests:0,numPassedTests:1}));
    assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"key",secret:"PRIVATE sensitive"}),false);
    await assert.rejects(stat(join(reports,"upload/native.json")));
  }finally{assert.ok(resolve(folder).startsWith(resolve(tmpdir())+"\\") || resolve(folder).startsWith(resolve(tmpdir())+"/"));await rm(folder,{recursive:true,force:true});}
});


function actualFeedRegion(path: string, start: string, end: string | undefined, exported: string, dependencies: Record<string, unknown>) {
  const source=readFileSync(new URL(path,import.meta.url),"utf8").replaceAll("\r\n","\n");
  assert.equal(source.split(start).length,2);if(end)assert.equal(source.split(end).length,2);
  const region=source.slice(source.indexOf(start),end?source.indexOf(end):undefined).replace(/^export /gm,"");
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  return new Function(...Object.keys(dependencies),strip(region)+"\nreturn "+exported+";")(...Object.values(dependencies));
}
test("actual status mapper distinguishes existing RPC and schema erasure after one await without exposing native error fields",async()=>{
  const status=actualFeedRegion("../../../../src/server/read-models/calendar-feed.ts","export async function readCalendarFeedStatus","export async function readCalendarFeedSettings","readCalendarFeedStatus",{recordCalendarFeedTrace,CommandError});
  for(const [reply,event]of [[{data:null,error:{code:"42501",detail:"PRIVATE"}},"status-rpc42501"],[{data:null,error:{code:"other",message:"PRIVATE"}},"status-rpc-error"],[{data:{active:"PRIVATE"},error:null},"status-schema-invalid"]] as const){let calls=0;const result=await captureCalendarFeedTrace(traceExpected,()=>status({rpc:async()=>{calls++;return reply;}},"owned-tenant","owned-attempt"));assert.equal(calls,1);assert.equal(result.ok,false);assert.deepEqual(result.events,[event]);assert.ok(!JSON.stringify(result.events).includes("PRIVATE"));}
});
test("actual management dispatcher keeps literal commands and unchanged stable outcomes while observing the closed envelope result once",async()=>{
  for(const code of ["UNAUTHENTICATED","TENANT_MEMBERSHIP_REQUIRED","PERMISSION_DENIED","VALIDATION_FAILED","TENANT_ACCESS_DENIED","COMMAND_CONFLICT","SERVER_ERROR"]){let calls=0;
    const manage=actualFeedRegion("../../../../src/server/commands/calendar-feed/manage-calendar-feed.ts","function calendarFeedConfig",undefined,"manageCalendarFeed",{
      validateCalendarFeedIntent,defineCommand:(config:unknown)=>config,runCommand:async()=>{calls++;return{ok:false,code};},recordCalendarFeedTrace,recordCalendarFeedContext,recordCalendarFeedMembership,
      feedKeyFromEnv:()=>{throw Error("Unexpected execute");},readCalendarFeedStatus:()=>{throw Error("Unexpected status");},executeCalendarFeed,FEED_SCHEMA:"fixed",MANAGE_DOMAIN:"fixed",issueCalendarFeedToken:()=>{},signFeedProof:()=>{}
    });
    const result=await captureCalendarFeedTrace(traceExpected,()=>manage({}, {action:"create",revision:0,attemptId:keyId}));assert.equal(calls,1);assert.deepEqual(result.events,["envelope-"+code]);
    assert.equal(result.ok&&(result.value as {outcome:string}).outcome,code==="COMMAND_CONFLICT"?"conflict":code==="SERVER_ERROR"?"unavailable":"denied");
  }
});


test("actual source registration guards isolate the one diagnostic declaration and preserve the fifteen normal command cases",async()=>{
  const ts=await import("typescript");const source=readFileSync(new URL("../../../integration/commands/calendar-feed.int.test.ts",import.meta.url),"utf8");
  const ast=ts.createSourceFile("calendar-feed.int.test.ts",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
  const guards=ast.statements.filter(ts.isIfStatement);assert.equal(guards.length,2);
  const evaluate=(index:number,mode:string|undefined)=>new Function("process","return ("+guards[index].expression.getText(ast)+");")({env:{CALENDAR_FEED_CAUSE_PROOF_MODE:mode}});
  assert.equal(evaluate(0,"1"),true);assert.equal(evaluate(1,"1"),false);
  for(const mode of [undefined,"0","other"]){assert.equal(evaluate(0,mode),false);assert.equal(evaluate(1,mode),true);}
  const names=(node:import("typescript").Node)=>{const ids:string[]=[];function walk(child:import("typescript").Node){if(ts.isCallExpression(child)&&child.expression.getText(ast)==="test"&&ts.isStringLiteral(child.arguments[0]))ids.push(child.arguments[0].text);ts.forEachChild(child,walk);}walk(node);return ids;};
  assert.deepEqual(names(guards[0].thenStatement),["15.5-DIAG001"]);assert.equal(names(guards[1].thenStatement).length,15);assert.ok(names(guards[1].thenStatement).every(name=>name.includes("15.5-INT")));
});


// Execute the actual diagnostic caller; no copied cleanup model or native I/O.
async function actualCauseCleanup(options: { row?: unknown; rejectAbsence?: boolean; rowsFail?: boolean; canonicalFail?: boolean; pending?: boolean; badIds?: boolean } = {}) {
  const ids=Array.from({length:12},(_,i)=>`10000000-0000-4000-8000-${String(i+1).padStart(12,"0")}`);
  const user=(id:string)=>({id});
  const fixture={base:{tenantA:{id:ids[0]},tenantB:{id:ids[1]},adminA:user(ids[2]),adminB:user(ids[3]),orphanUser:user(ids[4])},extraUsers:ids.slice(5).map(user),users:{montor:user(ids[5])}};
  if(options.badIds)fixture.extraUsers[0]=fixture.base.adminA;
  const calls:{sql:string;params:unknown}[]=[],order:string[]=[];
  const capture=async (_expected:unknown,run:()=>Promise<unknown>)=>{await run();if(options.pending)throw Error("PRIVATE command rejected");return{ok:true,value:{outcome:"denied"},events:[]};};
  const dependencies={
    process:{env:{CALENDAR_FEED_CAUSE_PROOF_MODE:"1"}},createRoleAwarePhaseAFixture:async()=>fixture,
    adminQuery:async(sql:string,params:unknown)=>{if(sql.includes("tenant_memberships"))return[{id:ids[6]}];calls.push({sql,params});order.push("absence");if(options.rejectAbsence)throw Error("PRIVATE SQL");return options.row===undefined?[{visibilityQualified:true,tenantsAbsent:true,authUsersAbsent:true}]:options.row;},
    makeAuthedServerClient:async()=>({}),lifecycle:()=>({attemptId:ids[7],correlationId:ids[8]}),captureCalendarFeedTrace:capture,
    manageCalendarFeed:async()=>({outcome:"denied"}),calendarCauseProofSelection:()=>"not-selected",
    cleanupCalendarOwnedRows:async()=>{order.push("rows");if(options.rowsFail)throw Error("PRIVATE rows");},
    cleanupRoleAwarePhaseAFixture:async()=>{order.push("canonical");if(options.canonicalFail)throw Error("PRIVATE canonical");}
  };
  const source=readFileSync(new URL("../../../support/calendar-feed-atdd.ts",import.meta.url),"utf8");
  const start="export async function runCalendarFeedCauseProof";assert.equal(source.split(start).length,2);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  // Exact current caller in an ES module retains import.meta syntax; no imports
  // execute in this not-selected-baseline path and no runtime body is rewritten.
  const moduleSource="export default function(dependencies){const {"+Object.keys(dependencies).join(",")+"}=dependencies;"+strip(source.slice(source.indexOf(start))).replace(/^export /gm,"")+";return runCalendarFeedCauseProof;}";
  const bound=await import("data:text/javascript;base64,"+Buffer.from(moduleSource).toString("base64"));
  const run=bound.default(dependencies);
  const report=await run();assert.ok(!JSON.stringify(report).includes("PRIVATE"));
  return{report,calls,order,ids};
}
test("actual diagnostic caller requires same-statement current-role visibility and exact known Auth plus tenant absence",async()=>{
  const result=await actualCauseCleanup();assert.equal(result.report.cleanupVerified,true);assert.deepEqual(result.order,["rows","canonical","absence"]);assert.equal(result.calls.length,1);
  const {sql,params}=result.calls[0];assert.match(sql,/select r[.]rolsuper or r[.]rolbypassrls from pg_catalog[.]pg_roles r where r[.]rolname=current_user/);
  assert.match(sql,/not exists\(select 1 from public[.]tenants where id=any\(\$1::uuid\[\]\)\)/);assert.match(sql,/not exists\(select 1 from auth[.]users where id=any\(\$2::uuid\[\]\)\)/);
  assert.deepEqual(params,[result.ids.slice(0,2),result.ids.slice(2)]);
  for(const [superuser,bypass]of [[false,false],[true,false],[false,true],[true,true]])for(const tenantsAbsent of [false,true])for(const authUsersAbsent of [false,true]){
    const row={visibilityQualified:superuser||bypass,tenantsAbsent,authUsersAbsent};const item=await actualCauseCleanup({row:[row]});
    assert.equal(item.report.cleanupVerified,(superuser||bypass)&&tenantsAbsent&&authUsersAbsent);if(!item.report.cleanupVerified){assert.equal(item.report.outcome,"CLEANUP_UNVERIFIED");assert.deepEqual(item.report.failures,["fixture-absence"]);assert.throws(()=>validateCauseProofObservation(item.report),/settlement-unverified/);}
  }
});
test("actual cleanup rejects malformed and hidden-row observations without invoking data accessors or retaining swallowed errors",async()=>{
  let gets=0;const fields={visibilityQualified:true,tenantsAbsent:true,authUsersAbsent:true};
  const getter=Object.defineProperty({...fields},"visibilityQualified",{get(){gets++;throw Error("PRIVATE getter");}});
  const inherited=Object.create(fields),symbol={...fields,[Symbol("PRIVATE")]:true};
  const nonArray=Object.defineProperty({0:fields},"length",{get(){gets++;throw Error("PRIVATE length");}});
  for(const row of [nonArray,[],[fields,fields],[{...fields,visibilityQualified:null}],[{...fields,visibilityQualified:1}],[{...fields,authUsersAbsent:"true"}],[{tenantsAbsent:true,authUsersAbsent:true}],[{...fields,extra:true}],[getter],[inherited],[symbol],[null],new Proxy([],{getOwnPropertyDescriptor(){throw Error("PRIVATE proxy");}})]){
    const result=await actualCauseCleanup({row});assert.equal(result.report.cleanupVerified,false);assert.deepEqual(result.report.failures,["fixture-absence"]);
  }
  assert.equal(gets,0);const rejected=await actualCauseCleanup({rejectAbsence:true});assert.equal(rejected.report.cleanupVerified,false);
  // A resolved canonical Auth-delete error can leave a user while tenants vanished.
  const residual=await actualCauseCleanup({row:[{...fields,authUsersAbsent:false}]});assert.equal(residual.report.cleanupVerified,false);assert.deepEqual(residual.order,["rows","canonical","absence"]);
});
test("actual cleanup retains primary and all reachable cleanup failures and never deletes against unsettled or invalid owned references",async()=>{
  const failed=await actualCauseCleanup({rowsFail:true,canonicalFail:true,rejectAbsence:true});assert.deepEqual(failed.report.failures,["fixture-rows","fixture-canonical","fixture-absence"]);assert.equal(failed.report.outcome,"CLEANUP_UNVERIFIED");
  const pending=await actualCauseCleanup({pending:true});assert.deepEqual(pending.order,[]);assert.deepEqual(pending.report.failures,["fixture-or-ordinary","fixture-custody-retained"]);assert.equal(pending.report.ordinarySettled,false);
  const invalid=await actualCauseCleanup({badIds:true});assert.deepEqual(invalid.order,[]);assert.deepEqual(invalid.report.failures,["fixture-absence"]);
});

test("actual spawn adapter records event facts monotonically without exit-code inference or real processes",async()=>{
  for(const initialPid of [undefined,123]){
    const child=Object.assign(new EventEmitter(),{pid:initialPid,stdout:null,stderr:null});
    const handle=launchOwned("fixed",[],{},"fixed",async()=>{},(()=>child) as never,(async()=>null) as never);
    assert.equal(handle.launchState(),"attempted-unverified");child.emit("error",Error("PRIVATE spawn"));assert.equal(handle.launchState(),initialPid===undefined?"not-created-confirmed":"attempted-unverified");
    child.pid=123;child.emit("spawn");assert.equal(handle.launchState(),"started");child.emit("error",Error("PRIVATE later"));assert.equal(handle.launchState(),"started");child.emit("close",null,null);await handle.done;assert.equal(handle.launchState(),"started");
  }
});
test("started diagnostic wait timeout has no exit code but remains capture-failed with retained custody",async(t)=>{
  t.mock.timers.enable({apis:["setTimeout"]});const h=harness();let entered!:()=>void;const launched=new Promise<void>(resolve=>{entered=resolve;});
  let finish!:(value:{code:number;signal:null})=>void;
  const pending=runCalendarFeedRuntime({mode:"cause-proof",env:diagnosticEnv,platform:"linux"},{...h.deps,prepareDiagnostic:async()=>{},launch:()=>{entered();return{launchState:()=>"started",done:new Promise(resolve=>{finish=resolve;}),stop:async()=>{finish({code:0,signal:null});return{forced:true,signal:null};}};},finishDiagnostic:async(receipt:{childLaunchState:string;launchAttempted:boolean;childExitCodes:unknown[]})=>{assert.equal(receipt.childLaunchState,"started");assert.equal(receipt.launchAttempted,true);assert.equal(receipt.childExitCodes.length,0);return false;}});
  await launched;t.mock.timers.tick(240001);const result=await pending;assert.equal(result.exitCode,1);assert.equal(result.receipt.keyDeleted,false);assert.ok(result.receipt.custody);assert.ok(result.receipt.failures.includes("diagnostic-capture-failed"));
});
test("diagnostic launch exceptions and late actual evidence retain uncertainty independently of eventual exit and cleanup",async()=>{
  for(const kind of ["throw","missing","late","refused"]){const h=harness();let state=kind==="refused"?"not-created-confirmed":"attempted-unverified";
    const result=await runCalendarFeedRuntime({mode:"cause-proof",env:diagnosticEnv,platform:"linux"},{...h.deps,prepareDiagnostic:async()=>{},readDiagnostic:async()=>{throw Error("PRIVATE missing");},launch:()=>{if(kind==="throw")throw Error("PRIVATE uncertain start");return{launchState:()=>state,done:Promise.resolve({code:1,signal:null}),stop:async()=>{if(kind==="late")state="started";return{forced:false,signal:null};}};},finishDiagnostic:async()=>false});
    assert.equal(result.receipt.launchAttempted,true);assert.equal(result.receipt.childLaunchState,kind==="late"?"started":kind==="refused"?"not-created-confirmed":"attempted-unverified");assert.equal(result.receipt.keyDeleted,false);assert.ok(result.receipt.custody);assert.ok(!JSON.stringify(result.receipt).includes("PRIVATE"));
  }
});
test("actual missing-report publication distinguishes proven no-start from started or uncertain launch with receipt and manifest parity",async()=>{
  const folder=await mkdtemp(join(tmpdir(),"calendar-launch-report-"));try{
    for(const state of ["not-attempted","not-created-confirmed","attempted-unverified","started"]){const receipt={launchAttempted:state!=="not-attempted",childLaunchState:state,childExitCodes:[],keyDeleted:false,dbClosed:true,custody:{ownedName:"PRIVATE"},failures:[]};const expected=state==="started"||state==="attempted-unverified";
      assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{},{keyId:"key",secret:"secret"}),!expected);
      const upload=join(folder,"test-results/calendar-feed-cause-proof/upload"),a=JSON.parse(await readFile(join(upload,"receipt.json"),"utf8")),b=JSON.parse(await readFile(join(upload,"manifest.json"),"utf8"));
      assert.equal(a.captureFailed,expected);assert.equal(a.childLaunchState,state);assert.equal(a.childStarted,state==="started"?true:state==="attempted-unverified"?null:false);assert.equal(a.launchAttempted,receipt.launchAttempted);for(const key of ["captureFailed","childLaunchState","childStarted","launchAttempted"])assert.deepEqual(a[key],b[key]);assert.ok(!JSON.stringify(a).includes("PRIVATE"));
    }
  }finally{assert.ok(resolve(folder).startsWith(resolve(tmpdir())+"\\")||resolve(folder).startsWith(resolve(tmpdir())+"/"));await rm(folder,{recursive:true,force:true});}
});

// Current source extraction executes the actual restricted SELECT/baseline helpers.
// Injected connections and finite ErrorResponse frames are not native SQL evidence.
test("status discriminator classifies actual installed pg-protocol frames by own finite source routine only",async()=>{
  const seams=await actualFixtureOrigins();
  const require=nodeModule.createRequire(import.meta.url), pgRequire=nodeModule.createRequire(require.resolve("pg"));
  const {parse}=pgRequire("pg-protocol");
  for(const [routine,expected] of [["exec_stmt_raise","PLPGSQL_RAISE"],["aclcheck_error","ACL_ENGINE"],["aclcheck_error_col","ACL_ENGINE"],["PRIVATE routine","UNKNOWN"]]){
    const payload=Buffer.from("SERROR\0C42501\0MPRIVATE message\0R"+routine+"\0\0"),frame=Buffer.alloc(payload.length+5);frame[0]=69;frame.writeInt32BE(payload.length+4,1);payload.copy(frame,5);
    const stream=new EventEmitter();let error:unknown;const done=parse(stream,(value:unknown)=>{error=value;});stream.emit("data",frame);stream.emit("end");await done;
    assert.equal(seams.calendarStatusErrorOrigin(error),expected);
    assert.equal(seams.calendarStatusErrorOrigin({...error as object,code:"23505"}),"UNKNOWN");
  }
  let gets=0;
  const hostile=Object.defineProperty({code:"42501"},"routine",{get(){gets++;throw Error("PRIVATE");}});
  for(const value of [null,undefined,{},Object.create({code:"42501",routine:"exec_stmt_raise"}),hostile,{code:42501,routine:"exec_stmt_raise"},{code:"42501",routine:{}},new Proxy({},{getOwnPropertyDescriptor(){throw Error("PRIVATE");}})])assert.equal(seams.calendarStatusErrorOrigin(value),"UNKNOWN");
  assert.equal(gets,0);
});
test("actual status qualification adds exactly eighteen fixed inquiries to one original parameterized SELECT",async()=>{
  const seams=await actualFixtureOrigins(),names=seams.calendarStatusPermissionNames as string[];
  assert.equal(names.length,18);assert.equal(new Set(names).size,18);
  const all=Object.fromEntries(names.map(name=>[name,true]));
  for(const falseName of [null,...names]){
    const permissions={...all,...(falseName?{[falseName]:false}:{})},calls:{sql:string;params:unknown[]}[]=[];
    const result=await seams.calendarCauseProofRestricted({query:async(sql:string,params:unknown[])=>{calls.push({sql,params});return{rows:[{qualified:true,...permissions}]};}},"status","owned-user");
    assert.deepEqual(result,permissions);assert.equal(calls.length,1);assert.deepEqual(calls[0].params,["owned-user"]);
    assert.equal((calls[0].sql.match(/pg_catalog[.]has_/g)||[]).length,18);assert.match(calls[0].sql,/ as qualified, pg_catalog[.]has_schema_privilege/);
    assert.match(calls[0].sql,/pg_catalog[.]has_table_privilege\('calendar_feed_owner','public.calendar_feed_tokens','SELECT'\) as owner_tokens_select/);
    for(const name of names)assert.equal((calls[0].sql.match(new RegExp(" as "+name+"(?:,| from)","g"))||[]).length,1);
    let baselineCalls=0;const values=["owned-tenant","owned-attempt"];
    const baseline=await seams.calendarCauseProofBaseline({query:async(sql:string,params:unknown[])=>{baselineCalls++;assert.equal(params,values);assert.equal(sql,"select public.read_calendar_feed_status($1::uuid,$2::uuid)");throw{code:"42501",routine:"aclcheck_error",message:"PRIVATE"};}},"status",values,result);
    assert.equal(baselineCalls,1);assert.deepEqual(baseline.statusDiscriminator.permissions,permissions);assert.equal(baseline.statusDiscriminator.origin,"ACL_ENGINE");assert.ok(!JSON.stringify(baseline).includes("PRIVATE"));
  }
});
test("actual qualification rejects malformed rows and data accessors before any baseline while management remains original",async()=>{
  const seams=await actualFixtureOrigins(),all=Object.fromEntries(seams.calendarStatusPermissionNames.map((name:string)=>[name,true]));let gets=0;
  const row={qualified:true,...all},getter=Object.defineProperty({...row},"owner_tokens_select",{get(){gets++;throw Error("PRIVATE");}});
  for(const rows of [[],[row,row],[{...row,qualified:false}],[{...row,owner_tokens_select:null}],[{...row,extra:true}],[{qualified:true}],[getter],[Object.create(row)],new Proxy([],{getOwnPropertyDescriptor(){throw Error("PRIVATE");}})])await assert.rejects(seams.calendarCauseProofRestricted({query:async()=>({rows})},"status","user"));
  await assert.rejects(seams.calendarCauseProofRestricted({query:async()=>{throw Error("PRIVATE");}},"status","user"));assert.equal(gets,0);
  let calls=0;assert.equal(await seams.calendarCauseProofRestricted({query:async(sql:string,params:unknown[])=>{calls++;assert.ok(!sql.includes("has_"));assert.deepEqual(params,["user"]);return{rows:[{qualified:true}]};}},"manage","user"),null);assert.equal(calls,1);
  const values=Array.from({length:10},(_,i)=>i);const managed=await seams.calendarCauseProofBaseline({query:async(sql:string,params:unknown[])=>{assert.equal(params,values);assert.match(sql,/manage_calendar_feed/);throw{code:"42501",routine:"exec_stmt_raise"};}},"manage",values,null);assert.equal(managed.statusDiscriminator,null);assert.equal(managed.outcome,"AMBIGUOUS_SQL42501");
});
test("status strict wire schema preserves false TABLE_ACL_ONLY without a necessary privilege or cause claim",async()=>{
  const seams=await actualFixtureOrigins(),names=seams.calendarStatusPermissionNames as string[],all=Object.fromEntries(names.map(name=>[name,true]));
  // Source-supported counterexample: sufficient column SELECT can coexist with
  // table SELECT=false. Column coverage is deliberately NOT measured here.
  for(const candidate of [null,...names.filter(name=>name!=="owner_tokens_select")])for(const tableBit of [true,false]){
    const permissions={...all,owner_tokens_select:tableBit,...(candidate?{[candidate]:false}:{})};
    const wire={...observation(),statusDiscriminator:{schema:"status-origin-v1",origin:"ACL_ENGINE",permissions}};
    const validated=validateCauseProofObservation(wire);assert.deepEqual(JSON.parse(JSON.stringify(validated)),wire);assert.equal(Object.keys(validated).length,11);assert.ok(!Object.hasOwn(validated,"candidate"));assert.ok(!Object.hasOwn(validated,"decision"));
  }
});
test("status validator refuses legacy missing field, nested schema pollution, crossfields and accessors",async()=>{
  const seams=await actualFixtureOrigins(),permissions=Object.fromEntries(seams.calendarStatusPermissionNames.map((name:string)=>[name,true]));
  const fact={schema:"status-origin-v1",origin:"ACL_ENGINE",permissions},valid={...observation(),statusDiscriminator:fact};
  const legacy={...observation()} as Record<string,unknown>;delete legacy.statusDiscriminator;
  let gets=0;const getter=Object.defineProperty({...permissions},"owner_tokens_select",{get(){gets++;throw Error("PRIVATE");}});
  for(const bad of [legacy,{...valid,baseline:"manage"},{...valid,sqlState:null},{...valid,statusDiscriminator:{...fact,schema:"old"}},{...valid,statusDiscriminator:{...fact,origin:"exec_stmt_raise"}},{...valid,statusDiscriminator:{...fact,extra:"PRIVATE"}},{...valid,statusDiscriminator:{...fact,permissions:{...permissions,extra:true}}},{...valid,statusDiscriminator:{...fact,permissions:getter}},{...valid,statusDiscriminator:new Proxy({},{ownKeys(){throw Error("PRIVATE");}})},{...valid,[Symbol("PRIVATE")]:true}])assert.throws(()=>validateCauseProofObservation(bad),/diagnostic-observation-refused/);
  assert.equal(gets,0);assert.equal(validateCauseProofObservation({...observation(),baseline:"manage",statusDiscriminator:null}).statusDiscriminator,null);
  assert.throws(()=>validateCauseProofObservation({...observation(),statusDiscriminator:null}),/diagnostic-observation-refused/);
  assert.equal(validateCauseProofObservation({...observation(),outcome:"INCOMPARABLE",sqlState:null,statusDiscriminator:null}).statusDiscriminator,null);
  assert.equal(validateCauseProofObservation({...valid,sqlState:null,statusDiscriminator:{...fact,origin:"UNKNOWN"}}).statusDiscriminator.origin,"UNKNOWN");
});
test("actual baseline preserves success and finite SQLSTATE outcomes without promoting routine labels",async()=>{
  const seams=await actualFixtureOrigins(),permissions=Object.fromEntries(seams.calendarStatusPermissionNames.map((name:string)=>[name,true]));
  for(const code of [null,"CF409","57014","PRIVATE"]){let calls=0;const result=await seams.calendarCauseProofBaseline({query:async()=>{calls++;if(code)throw{code,routine:"exec_stmt_raise",detail:"PRIVATE"};}},"status",["tenant","attempt"],permissions);assert.equal(calls,1);assert.equal(result.statusDiscriminator.origin,"UNKNOWN");assert.equal(result.sqlState,code&&["CF409","57014"].includes(code)?code:null);assert.equal(result.outcome,code===null||code==="CF409"?"NONREPRODUCED":"UNKNOWN_ENGINE_ERROR");}
});

test("new strict observation fits existing caps and producer retains the exact million-byte report boundary",async()=>{
  assert.ok(Buffer.byteLength(JSON.stringify(observation()))<8192);
  const folder=await mkdtemp(join(tmpdir(),"calendar-status-cap-")),reports=join(folder,"test-results/calendar-feed-cause-proof");
  const receipt={launchAttempted:true,childLaunchState:"started",childExitCodes:[0],keyDeleted:true,dbClosed:true,custody:null,failures:[]};
  try {
    await mkdir(reports,{recursive:true});await writeFile(join(reports,"observation.json"),JSON.stringify(observation()));
    const native=JSON.stringify({numTotalTests:1,numPendingTests:0,numFailedTests:1,numPassedTests:0});
    for(const bytes of [1000000,1000001]){
      await writeFile(join(reports,"native.json"),native+" ".repeat(bytes-Buffer.byteLength(native)));
      assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{},{keyId:"private-key",secret:"private-secret"}),bytes===1000000);
    }
  } finally {assert.ok(resolve(folder).startsWith(resolve(tmpdir())+"\\")||resolve(folder).startsWith(resolve(tmpdir())+"/"));await rm(folder,{recursive:true,force:true});}
});
