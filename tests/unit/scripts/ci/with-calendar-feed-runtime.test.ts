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
  assert.equal(projectCalendarFeedCiCommands(workflow,wrapper.replaceAll("\n","\r\n")),projected);
  assert.equal(projectCalendarFeedCiCommands(workflow),projected); // actual raw checkout and LF CI bytes agree
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

test("live owned HTTP catch retains fixed transport custody and unchanged fetch arguments without examining its rejection", async () => {
  const f=await actualCalendarOwner();
  const http=actualHttpPort(f.api.calendarOrdinaryResponse,async(target,options)=>{
    calls++;assert.ok(target instanceof URL);assert.equal(target.searchParams.get("from"),"1900");assert.deepEqual(options,{headers,redirect:"manual",cache:"no-store"});throw hostile;
  });
  let calls=0,reads=0;const headers={},hostile=Object.defineProperty({},"message",{get(){reads++;throw Error("PRIVATE");}});
  await assert.rejects(http("https://example.invalid/calendar/feed/opaque",{headers,query:{from:"1900"}}),/scenario-http-transport/);
  assert.equal(calls,1);assert.equal(reads,0);assert.ok(f.api.getCustody());
  await f.factory.pool()?.end();
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

test("failed DB readiness build and integration retain the exact key despite frontend settlement", async () => {
  for (const options of [{ readinessFailure: true }, { failChild: 0 }, { failChild: 2 }]) {
    const result = await runFixture("db", harness(options));
    assert.equal(result.exitCode, 1); assert.ok(result.receipt.failures.length >= 1);
    assert.equal(result.receipt.keyDeleted, false); assert.equal(result.receipt.dbClosed, true);
    assert.equal(result.receipt.keyOutcome,"unverified");assert.ok(result.receipt.custody);
    assert.ok(!result.queries.some(call=>call.sql.startsWith("delete")||call.sql.startsWith("select id,name from vault.secrets")));
    assert.ok(result.events.includes(`settled:${result.launches.length - 1}`));
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
const observation=()=>({kind:"calendar_feed.cause_proof",mode:"cause-proof",outcome:"AMBIGUOUS_SQL42501",events:["execute-enter","context-match","status-rpc42501"],baseline:"status",sqlState:"42501",cleanupVerified:true,ordinarySettled:true,queriesSettled:true,failures:[],statusDiscriminator:{schema:"status-origin-v2",origin:"UNKNOWN",permissions:Object.fromEntries(["caller_public_usage", "caller_status_execute", "owner_public_usage", "owner_actor_execute", "owner_uid_execute", "owner_subject_execute", "owner_lock_execute", "owner_hash_execute", "owner_tenant_id_select", "owner_member_id_select", "owner_member_tenant_select", "owner_member_user_select", "owner_member_status_select", "owner_member_role_select", "owner_union_tenant_select", "owner_union_member_select", "owner_union_role_select", "owner_tokens_select"].map(name=>[name,true]))}});
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
    const wire={...observation(),statusDiscriminator:{schema:"status-origin-v2",origin:"ACL_ENGINE",permissions}};
    const validated=validateCauseProofObservation(wire);assert.deepEqual(JSON.parse(JSON.stringify(validated)),wire);assert.equal(Object.keys(validated).length,11);assert.ok(!Object.hasOwn(validated,"candidate"));assert.ok(!Object.hasOwn(validated,"decision"));
  }
});
test("status validator refuses legacy missing field, nested schema pollution, crossfields and accessors",async()=>{
  const seams=await actualFixtureOrigins(),permissions=Object.fromEntries(seams.calendarStatusPermissionNames.map((name:string)=>[name,true]));
  const fact={schema:"status-origin-v2",origin:"ACL_ENGINE",permissions},valid={...observation(),statusDiscriminator:fact};
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

// V2 changes neither canonical auth.uid ACLs nor normal case inventory. These
// are live-source/injected controls, never native migration/RLS execution.
test("v2 actual restricted SQL measures private actor EXECUTE and refuses v1 or mixed fact schemas",async()=>{
  const seams=await actualFixtureOrigins(),permissions=Object.fromEntries(seams.calendarStatusPermissionNames.map((name:string)=>[name,true]));let calls=0;
  const actual=await seams.calendarCauseProofRestricted({query:async(sql:string,params:unknown[])=>{
    calls++;assert.deepEqual(params,["owned-user"]);
    assert.match(sql,/pg_catalog[.]has_function_privilege\('calendar_feed_owner','public[.]calendar_feed_actor_internal\(\)','EXECUTE'\) as owner_actor_execute/);
    assert.match(sql,/pg_catalog[.]has_function_privilege\('calendar_feed_owner','auth[.]uid\(\)','EXECUTE'\) as owner_uid_execute/);
    assert.ok(!sql.includes("owner_auth_usage"));return{rows:[{qualified:true,...permissions}]};
  }},"status","owned-user");assert.equal(calls,1);assert.deepEqual(actual,permissions);
  const wire={...observation(),statusDiscriminator:{schema:"status-origin-v2",origin:"UNKNOWN",permissions}};
  assert.equal(validateCauseProofObservation(wire).statusDiscriminator.schema,"status-origin-v2");
  for(const discriminator of [{...wire.statusDiscriminator,schema:"status-origin-v1"},{...wire.statusDiscriminator,permissions:{...permissions,owner_auth_usage:true}},{...wire.statusDiscriminator,schema:"status-origin-v1",permissions:{...permissions,owner_auth_usage:true}}])assert.throws(()=>validateCauseProofObservation({...wire,statusDiscriminator:discriminator}),/diagnostic-observation-refused/);
});
test("actual baseline catalog expectation accepts only the fixed actor substitutions and retains unrelated source and owner guards",async()=>{
  const seams=await actualFixtureOrigins(),migration=readFileSync(new URL("../../../../supabase/migrations/20261020220000_personal_calendar_feed.sql",import.meta.url),"utf8").replaceAll("\r\n","\n");
  for(const [name,calls] of [["read_calendar_feed_status",3],["manage_calendar_feed",2],["read_calendar_feed_abuse",3]] as const){
    const start=migration.indexOf("create function public."+name+"("),a=migration.indexOf("as $$",start)+5,b=migration.indexOf("$$;",a),original=migration.slice(a,b);
    const expected=seams.calendarCauseProofExpectedBody(migration,name);assert.equal(expected,original.replaceAll("auth.uid()","public.calendar_feed_actor_internal()"));assert.equal(expected.split("public.calendar_feed_actor_internal()").length-1,calls);
    const row={proname:name,owner:"calendar_feed_owner",prosecdef:true,proconfig:['search_path=""'],prosrc:expected};assert.equal(seams.calendarCauseProofSourceMatches(row,migration),true);
    for(const change of [{prosrc:original},{prosrc:expected.replace("begin","begin perform 1;")},{owner:"postgres"},{prosecdef:false},{proconfig:[]}])assert.equal(seams.calendarCauseProofSourceMatches({...row,...change},migration),false);
    assert.throws(()=>seams.calendarCauseProofExpectedBody(migration.replace(original,original.replace("auth.uid()","null")),name),/call count refused/);
  }
  assert.throws(()=>seams.calendarCauseProofExpectedBody(migration,"fetch_calendar_feed"),/source refused/);
});
async function actualActorAclFacts() {
  const helperNames=["calendar_feed_attestation_payload","calendar_feed_verify_attestation_internal","calendar_feed_secret_internal","calendar_feed_actor_internal","calendar_feed_subject_internal","calendar_feed_now_internal"],queries:{sql:string;params:unknown}[]=[];
  const owner={name:"calendar_feed_owner",login:false,inherit:false,superuser:false,bypassRls:false,publicSchemaCreate:false,assumableByJwtRoles:false,unrelatedTableRead:false,generalVaultRead:false};
  const acl=actualFeedRegion("../../../support/calendar-feed-atdd.ts","async function calendarAcl()","/** Both allocated files are serial.","calendarAcl",{adminQuery:async(sql:string,params:unknown)=>{
    queries.push({sql,params});
    if(sql.includes('c.relname name,c.relrowsecurity'))return[];
    if(sql.includes('rolname name,rolcanlogin'))return[{...owner}];
    if(sql.includes('select c.relname "table"'))return[];
    if(sql.includes('r.rolname owner,p.prosecdef'))return["fetch_calendar_feed","manage_calendar_feed","read_calendar_feed_status","read_calendar_feed_abuse"].map(name=>({name,owner:owner.name,securityDefiner:true,emptySearchPath:true,publicExecute:false,volatility:"v",rawAclExact:true,ownerExecute:true,serviceRoleExecute:false,anonExecute:name==="fetch_calendar_feed",authenticatedExecute:name!=="fetch_calendar_feed"}));
    if(sql.includes('p.prosqlbody is not null')){assert.deepEqual(params,[helperNames]);assert.match(sql,/d[.]refobjid='auth[.]uid\(\)'::regprocedure::oid/);assert.match(sql,/d[.]classid='pg_catalog[.]pg_proc'::regclass/);assert.match(sql,/p[.]provolatile='s'/);return helperNames.map(name=>({name,owner:["calendar_feed_actor_internal","calendar_feed_secret_internal"].includes(name)?"postgres":owner.name,volatility:name==="calendar_feed_attestation_payload"?"i":["calendar_feed_actor_internal","calendar_feed_secret_internal","calendar_feed_subject_internal"].includes(name)?"s":"v",rawAclExact:true,ownerExecute:true,serviceRoleExecute:false,securityDefiner:name==="calendar_feed_secret_internal",emptySearchPath:true,sqlStable:["calendar_feed_actor_internal","calendar_feed_secret_internal","calendar_feed_subject_internal"].includes(name),preparsed:name==="calendar_feed_actor_internal",canonicalUidDependency:name==="calendar_feed_actor_internal",jwtExecute:false,publicExecute:false,feedOwnerExecute:true,otherRoleInheritedExecute:false,source:name==="calendar_feed_secret_internal"?"name='calendar_feed_attestation_' || p_key_id":""}));}
    if(sql.includes('information_schema.columns'))return[];
    throw Error("Unexpected injected ACL query");
  }});
  const facts=await acl();assert.equal(queries.length,6);return facts;
}
test("actual ACL source and existing RLS010 reject actor metadata dependency and private execution drift",async()=>{
  const source=readFileSync(new URL("../../../integration/rls/calendar-feed.rls.test.ts",import.meta.url),"utf8"),start=source.indexOf('  test("[P0] 15.5-RLS010'),end=source.indexOf('  test("[P0] 15.5-RLS011',start);assert.ok(start>=0&&end>start);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const run=async(change:(facts:Awaited<ReturnType<typeof actualActorAclFacts>>)=>void)=>{const facts=await actualActorAclFacts();change(facts);let body!:()=>Promise<void>;
    new Function("test","withCalendarFeedFixture","expect","calendarOwnerAclRegression",strip(source.slice(start,end)))((_name:string,fn:()=>Promise<void>)=>{body=fn;},async(_kind:string,fn:(fx:unknown)=>Promise<void>)=>fn({acl:async()=>facts}),(value:unknown)=>({toBe(expected:unknown){assert.equal(value,expected);},toEqual(expected:unknown){assert.deepEqual(value,expected);},toMatchObject(expected:Record<string,unknown>){for(const[key,part]of Object.entries(expected))assert.deepEqual((value as Record<string,unknown>)[key],part);}}),async()=>{});await body();
  };
  await run(()=>{});
  for(const change of [{owner:"calendar_feed_owner"},{securityDefiner:true},{emptySearchPath:false},{sqlStable:false},{preparsed:false},{canonicalUidDependency:false},{feedOwnerExecute:false},{jwtExecute:true},{publicExecute:true},{otherRoleInheritedExecute:true}])await assert.rejects(run(facts=>Object.assign(facts.helpers.find((x:{purpose:string})=>x.purpose==="actor"),change)));
  await assert.rejects(run(facts=>{facts.helpers=facts.helpers.filter((x:{purpose:string})=>x.purpose!=="actor");}));
});
test("new atomic migration cross-validates exact original bodies and eight substitutions without widening historical SQL",()=>{
  const original=readFileSync(new URL("../../../../supabase/migrations/20261020220000_personal_calendar_feed.sql",import.meta.url),"utf8").replaceAll("\r\n","\n"),migration=readFileSync(new URL("../../../../supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql",import.meta.url),"utf8");
  const names=["read_calendar_feed_status","manage_calendar_feed","read_calendar_feed_abuse"],counts=[3,2,3];let total=0;
  for(let i=0;i<names.length;i++){
    const at=original.indexOf("create function public."+names[i]+"("),a=original.indexOf("as $$",at)+5,b=original.indexOf("$$;",a),body=original.slice(a,b),tag="$original_"+i+"$";
    assert.equal(migration.split(tag).length,3);assert.equal(migration.split(tag)[1],body);assert.equal(body.split("auth.uid()").length-1,counts[i]);total+=counts[i];
  }
  assert.equal(total,8);assert.equal(migration.match(/^do \$migration\$/gm)?.length,1);assert.ok(migration.trimEnd().endsWith("$migration$;"));
  assert.match(migration,/execute replace\(definitions\[i\],'auth.uid\(\)','public.calendar_feed_actor_internal\(\)'\)/);
  assert.match(migration,/to_jsonb\(p\)-'prosrc'=metadata\[i\]/);assert.match(migration,/prosrc=replace\(expected_sources\[i\]/);
  assert.match(migration,/language sql stable security invoker set search_path='' return auth.uid\(\)/);
  assert.ok(migration.indexOf("set local role calendar_feed_owner")<migration.indexOf("execute replace(definitions"));assert.ok(migration.indexOf("reset role",migration.indexOf("execute replace(definitions"))>migration.indexOf("execute replace(definitions"));
  assert.match(migration,/revoke create on schema public from calendar_feed_owner/);assert.match(migration,/has_schema_privilege\(owner_role.oid,'public','CREATE'\)/);
  assert.ok(!/grant usage on schema auth|alter role|create role|alter function|security definer set search_path='' return/.test(migration));
});

// Execute the actual catalog guard's finite Boolean predicates with injected
// non-null catalog rows. This is not PostgreSQL/migration or hosted-row evidence.
type OwnerGrantRow = { roleid: number; member: number; set_option: boolean; inherit_option: boolean; admin_option: boolean; grantor: number };
function actualOwnerSetGuard(legacyCounterexample = false) {
  const source=readFileSync(new URL("../../../../supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql",import.meta.url),"utf8").replaceAll("\r\n","\n");
  const start=source.indexOf(" if owner_role.rolcanlogin"),end=source.indexOf(" then\n  raise exception 'calendar actor owner or SET authority refused';",start);assert.ok(start>=0&&end>start);
  let guard=source.slice(start+4,end);
  const direct=guard.split("\n").find(line=>line.includes("not exists(select 1 from pg_catalog.pg_auth_members"))!.trim().slice(7);
  const bad=guard.split("\n").find(line=>line.includes("or exists(select 1 from pg_catalog.pg_auth_members"))!.trim().slice(3);
  const predicate=(sql:string)=>sql.slice(sql.indexOf(" where ")+7,-1);
  const compile=(sql:string,names:Record<string,string>)=>{
    const tokens=sql.match(/<>|=|[()]|[A-Za-z_][A-Za-z_0-9.]*/g)!;assert.equal(tokens.join(""),sql.replace(/\s/g,""));
    const js=tokens.map(token=>({and:"&&",or:"||",not:"!","=":"===","<>":"!==","(":"(",")":")"}[token]??names[token]??(()=>{throw Error("Unrecognized actual guard token");})())).join(" ");
    return new Function("row","facts","return ("+js+");") as (row:OwnerGrantRow|undefined,facts:Record<string,unknown>)=>boolean;
  };
  const rowNames={roleid:"row.roleid",member:"row.member",set_option:"row.set_option",inherit_option:"row.inherit_option","owner_role.oid":"facts.ownerId",executor_oid:"facts.executorId"};
  const directMatch=compile(predicate(direct),rowNames);
  const badSql=predicate(bad),unsafeMatch=compile(legacyCounterexample?badSql.replace("member<>executor_oid or inherit_option)","member<>executor_oid or inherit_option or not set_option)"):badSql,rowNames);
  guard=guard.replace(direct,"directGrant").replace(bad,"unsafeGrant")
    .replace("pg_catalog.pg_has_role(current_user,owner_role.oid,'SET')","effectiveSet")
    .replace("pg_catalog.pg_has_role(current_user,owner_role.oid,'USAGE')","effectiveUsage")
    .replace("pg_catalog.has_schema_privilege(owner_role.oid,'public','CREATE')","publicCreate");
  const attrs=["rolcanlogin","rolinherit","rolsuper","rolcreatedb","rolcreaterole","rolreplication","rolbypassrls"];
  const guardMatch=compile(guard,Object.fromEntries([...attrs.map(name=>["owner_role."+name,"facts."+name]),...["directGrant","unsafeGrant","effectiveSet","effectiveUsage","publicCreate"].map(name=>[name,"facts."+name])]));
  return (rows:OwnerGrantRow[],overrides:Record<string,boolean>={})=>{
    const facts={ownerId:1,executorId:2,...Object.fromEntries(attrs.map(name=>[name,false])),effectiveSet:true,effectiveUsage:false,publicCreate:false,...overrides};
    return guardMatch(undefined,{...facts,directGrant:rows.some(row=>directMatch(row,facts)),unsafeGrant:rows.some(row=>unsafeMatch(row,facts))});
  };
}
const creatorOwnerGrant:OwnerGrantRow={roleid:1,member:2,set_option:false,inherit_option:false,admin_option:true,grantor:3};
const explicitOwnerSetGrant:OwnerGrantRow={roleid:1,member:2,set_option:true,inherit_option:false,admin_option:false,grantor:4};
test("actual owner guard admits parallel native creator ADMIN and explicit SET rows without treating ADMIN as SET",()=>{
  const refuses=actualOwnerSetGuard();
  for(const rows of [[creatorOwnerGrant,explicitOwnerSetGrant],[explicitOwnerSetGrant,creatorOwnerGrant],[explicitOwnerSetGrant]])assert.equal(refuses(rows),false);
  // Counterfactual old predicate must bite this real-source regression fixture.
  assert.equal(actualOwnerSetGuard(true)([creatorOwnerGrant,explicitOwnerSetGrant]),true);
  assert.equal(refuses([creatorOwnerGrant]),true);assert.equal(refuses([]),true);
  for(const admin_option of [false,true])assert.equal(refuses([{...creatorOwnerGrant,admin_option},explicitOwnerSetGrant]),false);
});
test("actual owner guard retains foreign outbound inherited direct effective SET and all seven hardening refusals",()=>{
  const refuses=actualOwnerSetGuard(),safe=[creatorOwnerGrant,explicitOwnerSetGrant];
  for(const admin_option of [false,true])for(const set_option of [false,true]){
    for(const unsafe of [{...explicitOwnerSetGrant,member:9,admin_option,set_option},{...explicitOwnerSetGrant,roleid:9,member:1,admin_option,set_option},{...explicitOwnerSetGrant,inherit_option:true,admin_option,set_option}])assert.equal(refuses([...safe,unsafe]),true);
  }
  assert.equal(refuses(safe,{effectiveSet:false}),true);assert.equal(refuses(safe,{effectiveUsage:true}),true);assert.equal(refuses(safe,{publicCreate:true}),true);
  for(const attr of ["rolcanlogin","rolinherit","rolsuper","rolcreatedb","rolcreaterole","rolreplication","rolbypassrls"])assert.equal(refuses(safe,{[attr]:true}),true);
  // An indirect effective SET claim cannot substitute for the required direct row.
  assert.equal(refuses([creatorOwnerGrant],{effectiveSet:true}),true);
});

// Bounded evaluator for the actual eleven-predicate SQL source grammar only.
// Injected non-native catalog/function results exercise three-valued logic;
// this neither executes SQL nor establishes hosted rows or predicate causes.
type OriginalGuardFixture = { ordinal:number; values:Record<string,unknown>; privileges:Record<string,boolean|null>; acl:Record<string,unknown>[] };
function originalGuardFixture(ordinal=1):OriginalGuardFixture {
  const body="auth.uid() ".repeat([3,2,3][ordinal-1]);
  return{ordinal,values:{"item.proowner":1,"owner_role.oid":1,"item.prosecdef":true,"item.provolatile":"v","item.lanname":"plpgsql","item.proconfig":['search_path=""'],"item.oid":97979,"item.prosrc":body,"expected_sources[i]":body,"call_counts[i]":[3,2,3][ordinal-1],expectedConfig:['search_path=""'],authenticatedOid:2},privileges:{authenticated:true,anon:false,service_role:false},acl:[{"a.grantee":1,"a.is_grantable":false},{"a.grantee":2,"a.is_grantable":false}]};
}
function actualOriginalGuardMatrix() {
  const source=readFileSync(new URL("../../../../supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql",import.meta.url),"utf8").replaceAll("\r\n","\n");
  const at=source.indexOf("  if item.proowner<>owner_role.oid"),raise=source.indexOf("   raise exception 'calendar actor original function refused ",at),end=source.indexOf(";\n  end if;",raise)+1;assert.ok(at>=0&&raise>at&&end>raise);
  const guard=source.slice(at+5,raise).replace(/ then\n$/,""),statement=source.slice(raise,end),expression=statement.slice(statement.indexOf("pg_catalog.jsonb_build_object"),-1);
  const acl=guard.slice(guard.indexOf("exists(select 1 from pg_catalog.aclexplode"),guard.indexOf("\n   or item.prosrc"));assert.ok(acl.endsWith(")"));assert.ok(expression.includes(acl));
  const where=acl.slice(acl.indexOf("where ")+6,-1).replace("(select oid from pg_catalog.pg_roles where rolname='authenticated')","authenticatedOid");
  type Scalar=unknown;
  const isNull=(value:Scalar)=>value===null;
  const equal=(a:Scalar,b:Scalar):boolean|null=>isNull(a)||isNull(b)?null:JSON.stringify(a)===JSON.stringify(b);
  const negate=(value:Scalar):boolean|null=>value===null?null:!value;
  const and=(a:Scalar,b:Scalar):boolean|null=>a===false||b===false?false:a===null||b===null?null:true;
  const or=(a:Scalar,b:Scalar):boolean|null=>a===true||b===true?true:a===null||b===null?null:false;
  let matrixEvaluations=0;
  function evaluate(input:string,fixture:OriginalGuardFixture,extra:Record<string,unknown>={}):unknown {
    const sql=input.replaceAll(acl,"unsafeAcl").replaceAll("array['search_path=\"\"']::text[]","expectedConfig");
    const tokens=sql.match(/'(?:''|[^'])*'|<>|[=(),/\-]|[A-Za-z_][A-Za-z_0-9.]*(?:\[i\])?|[0-9]+/g)!;assert.equal(tokens.join(""),sql.replace(/\s(?=(?:[^']*'[^']*')*[^']*$)/g,""));let index=0;
    const take=(token:string)=>{if(tokens[index]===token){index++;return true;}return false;};
    const need=(token:string)=>{assert.equal(tokens[index++],token);};
    const primary=():unknown=>{
      if(take("(")){const value=disjunction();need(")");return value;}
      const token=tokens[index++];assert.ok(token);
      if(token.startsWith("'"))return token.slice(1,-1).replaceAll("''","'");
      if(/^[0-9]+$/.test(token))return Number(token);
      if(take("(")){
        const args:unknown[]=[];if(!take(")")){do{args.push(disjunction());}while(take(","));need(")");}
        if(token==="length")return args[0]===null?null:Array.from(args[0] as string).length;
        if(token==="replace")return args.some(isNull)?null:(args[0] as string).split(args[1] as string).join(args[2] as string);
        if(token==="pg_catalog.has_function_privilege"){assert.equal(args[1],fixture.values['item.oid']);assert.equal(args[2],"EXECUTE");assert.ok(Object.hasOwn(fixture.privileges,args[0] as string));return fixture.privileges[args[0] as string];}
        if(token==="pg_catalog.jsonb_build_object"){matrixEvaluations++;assert.equal(args.length%2,0);return Object.fromEntries(Array.from({length:args.length/2},(_,i)=>{assert.equal(typeof args[i*2],"string");return[args[i*2] as string,args[i*2+1]];}));}
        throw Error("Unexpected actual SQL function");
      }
      const values:Record<string,unknown>={...fixture.values,...extra,i:fixture.ordinal};assert.ok(Object.hasOwn(values,token),"Unexpected actual SQL field");return values[token];
    };
    const arithmetic=():unknown=>{let value=primary();while(tokens[index]==="-"||tokens[index]==="/"){const op=tokens[index++],right=primary();value=value===null||right===null?null:op==="-"?(value as number)-(right as number):Math.trunc((value as number)/(right as number));}return value;};
    const comparison=():unknown=>{
      const left=arithmetic();
      if(take("is")){const not=take("not");need("distinct");need("from");const right=arithmetic(),same=left===null&&right===null?true:left===null||right===null?false:equal(left,right);return not?same:negate(same);}
      if(tokens[index]==="="||tokens[index]==="<>"){const op=tokens[index++],right=arithmetic(),same=equal(left,right);return op==="="?same:negate(same);}
      const notIn=tokens[index]==="not"&&tokens[index+1]==="in";if(notIn)index++;
      if(take("in")){need("(");const values:unknown[]=[];do{values.push(disjunction());}while(take(","));need(")");const results=values.map(value=>equal(left,value)),found=results.includes(true)?true:results.includes(null)?null:false;return notIn?negate(found):found;}
      assert.equal(notIn,false);return left;
    };
    const negation=():unknown=>take("not")?negate(negation()):comparison();
    const conjunction=():unknown=>{let value=negation();while(take("and"))value=and(value,negation());return value;};
    const disjunction=():unknown=>{let value=conjunction();while(take("or"))value=or(value,conjunction());return value;};
    const value=disjunction();assert.equal(index,tokens.length);return value;
  }
  return{source,statement,guard,evaluations:()=>matrixEvaluations,run(fixtures:OriginalGuardFixture[],priorRefused=false){
    if(priorRefused)return null;
    for(const fixture of fixtures){const unsafeAcl=fixture.acl.some(row=>evaluate(where,fixture,row)===true);if(evaluate(guard,fixture,{unsafeAcl})===true)return evaluate(expression,fixture,{unsafeAcl}) as {schema:string;ordinal:number;checks:Record<string,boolean|null>};}
    return null;
  }};
}
test("actual unchanged original guard emits the named eleven-bit matrix only for its first refusal",()=>{
  const seam=actualOriginalGuardMatrix();assert.equal(seam.run([originalGuardFixture(1),originalGuardFixture(2),originalGuardFixture(3)]),null);assert.equal(seam.evaluations(),0);
  const changes:Record<string,(fx:OriginalGuardFixture)=>void>={owner_matches:fx=>{fx.values['item.proowner']=8;},security_definer:fx=>{fx.values['item.prosecdef']=false;},volatile:fx=>{fx.values['item.provolatile']='s';},plpgsql:fx=>{fx.values['item.lanname']='sql';},exact_proconfig:fx=>{fx.values['item.proconfig']=[];},authenticated_execute:fx=>{fx.privileges.authenticated=false;},anon_denied:fx=>{fx.privileges.anon=true;},service_role_denied:fx=>{fx.privileges.service_role=true;},acl_grantees_safe:fx=>{fx.acl.push({'a.grantee':8,'a.is_grantable':false});},body_exact:fx=>{fx.values['item.prosrc']+=' changed';},call_count_exact:fx=>{fx.values['expected_sources[i]']=fx.values['item.prosrc']='auth.uid()';}};
  for(const [key,change]of Object.entries(changes))for(const ordinal of [1,2,3]){
    const fixtures=Array.from({length:3},(_,i)=>originalGuardFixture(i+1));change(fixtures[ordinal-1]);const report=seam.run(fixtures)!;assert.equal(report.schema,"calendar-original-function-guard-v1");assert.equal(report.ordinal,ordinal);assert.deepEqual(Object.keys(report).sort(),['checks','ordinal','schema']);assert.deepEqual(Object.keys(report.checks).sort(),Object.keys(changes).sort());assert.equal(report.checks[key],false);assert.equal(Object.values(report.checks).filter(value=>value===false).length,1);
  }
  const first=originalGuardFixture(1),last=originalGuardFixture(3);first.values['item.prosecdef']=last.values['item.prosecdef']=false;assert.equal(seam.run([first,originalGuardFixture(2),last])!.ordinal,1);
});
test("actual original guard preserves SQL NULL UNKNOWN prior-guard reach and closed privacy without raw catalog values",()=>{
  const seam=actualOriginalGuardMatrix();const fixture=originalGuardFixture();fixture.values['item.proowner']=8;fixture.values['item.prosecdef']=null;fixture.privileges.anon=null;
  fixture.values['item.proconfig']=['PRIVATE_CONFIG'];fixture.values['item.prosrc']=null;fixture.acl.push({'a.grantee':234567,'a.is_grantable':true});
  const before=seam.evaluations();assert.equal(seam.run([fixture],true),null);assert.equal(seam.evaluations(),before);
  const report=seam.run([fixture])!;assert.equal(report.checks.security_definer,null);assert.equal(report.checks.anon_denied,null);assert.equal(report.checks.call_count_exact,null);assert.equal(report.checks.body_exact,false);assert.equal(report.checks.exact_proconfig,false);
  for(const value of Object.values(report.checks))assert.ok(value===true||value===false||value===null);
  const serialized=JSON.stringify(report);for(const excluded of ['PRIVATE_CONFIG','234567','97979','prosrc','\"proconfig\":','proacl','grantor','auth.uid','calendar_feed_owner','authenticated"'])assert.ok(!serialized.includes(excluded));
  const onlyUnknown=originalGuardFixture();onlyUnknown.values['item.prosecdef']=null;assert.equal(seam.run([onlyUnknown]),null); // unchanged IF(NULL) does not refuse.
});
test("failure-message inverse restores exact original migration guard targets prior checks and following DDL with default P0001",()=>{
  const seam=actualOriginalGuardMatrix(),restored=stripOwnerAclAddition(seam.source).replace(seam.statement,"   raise exception 'calendar actor original function refused';");
  assert.equal(createHash('sha256').update(restored).digest('hex'),'f788d507414dc32ecc45b37dcfa44a45ce01cc36da0417063f4e9da1549a3b91');
  assert.ok(seam.statement.startsWith("   raise exception 'calendar actor original function refused %', pg_catalog.jsonb_build_object("));assert.ok(!/using|errcode|detail|hint|context/i.test(seam.statement));
  assert.equal(seam.source.split('calendar-original-function-guard-v1').length,2);assert.ok(seam.source.indexOf(seam.statement)<seam.source.indexOf('execute $adapter$create function'));
});

function stripOwnerAclAddition(source: string) {
  const declarations=" -- All eight immutable predecessor definitions are checked before any mutation.\n";
  const preflight=" -- Begin all-eight source-comparable preflight (read-only).\n";
  const tail=" -- The complete original three-function guard/matrix and adapter path follow unchanged.\n";
  assert.equal(source.split(declarations).length,2);assert.equal(source.split(preflight).length,2);assert.equal(source.split(tail).length,2);
  const a=source.indexOf(declarations),b=source.indexOf("begin\n if session_user",a);assert.ok(b>a);
  source=source.slice(0,a)+source.slice(b);
  const c=source.indexOf(preflight),d=source.indexOf(tail,c)+tail.length;
  return source.slice(0,c)+source.slice(d);
}

// Finite evaluator of the actual new source guards. It resolves only the closed
// catalog expressions below; unrecognized grammar fails. No PostgreSQL is run.
function ownerAclPredicate(sql: string, values: Record<string,unknown>): boolean|null {
  const tokens=sql.match(/'(?:''|[^'])*'|<>|>=|[=()<>]|[A-Za-z_][A-Za-z_0-9.]*|[0-9]+/g)!;
  assert.equal(tokens.join(""),sql.replace(/\s(?=(?:[^']*'[^']*')*[^']*$)/g,""));let at=0;
  const take=(word:string)=>tokens[at]===word?(at++,true):false;
  const need=(word:string)=>assert.equal(tokens[at++],word);
  const primary=():unknown=>{if(take("(")){const value=or();need(")");return value;}const token=tokens[at++];if(token.startsWith("'"))return token.slice(1,-1).replaceAll("''", "'");if(/^\d+$/.test(token))return Number(token);if(token==="true")return true;if(token==="false")return false;if(token==="null")return null;assert.ok(Object.hasOwn(values,token),"Unknown actual ACL guard field: "+token);return values[token];};
  const eq=(a:unknown,b:unknown)=>a===null||b===null?null:JSON.stringify(a)===JSON.stringify(b);
  const cmp=():unknown=>{const a=primary();if(take("is")){const not=take("not");if(take("null"))return not?a!==null:a===null;if(take("true"))return a===true;need("distinct");need("from");const b=primary(),equal=a===null&&b===null?true:a===null||b===null?false:eq(a,b);return not?equal:!equal;}const op=tokens[at];if(["=","<>",">=","<",">"].includes(op)){at++;const b=primary();if(op==="=")return eq(a,b);if(op==="<>"){const same=eq(a,b);return same===null?null:!same;}return a===null||b===null?null:op===">="?(a as number)>=(b as number):op==="<"?(a as number)<(b as number):(a as number)>(b as number);}return a;};
  const not=():unknown=>take("not")?((v:unknown)=>v===null?null:!v)(not()):cmp();
  const and=():unknown=>{let a=not();while(take("and")){const b=not();a=a===false||b===false?false:a===null||b===null?null:true;}return a;};
  const or=():unknown=>{let a=and();while(take("or")){const b=and();a=a===true||b===true?true:a===null||b===null?null:false;}return a;};
  const result=or();assert.equal(at,tokens.length);assert.ok(result===true||result===false||result===null);return result as boolean|null;
}
function actualAllEightAcl() {
  const source=readFileSync(new URL("../../../../supabase/migrations/20261021102723_calendar_feed_preparsed_actor_identity.sql",import.meta.url),"utf8").replaceAll("\r\n","\n");
  const shapes=JSON.parse(source.split("$source_shapes$")[1]) as Array<Record<string,unknown>>;
  const bodies=Array.from({length:8},(_,i)=>source.split(i<5?"$canonical_"+i+"$":"$original_"+(i-5)+"$")[1]);
  const start=source.indexOf("  if item.proowner is distinct from owner_role.oid"),end=source.indexOf(" then\n   raise exception 'SOURCE_ACL_NOT_COMPARABLE';",start);
  let shapeGuard=source.slice(start+5,end);
  const argtypes="(select coalesce(string_agg((v::regtype)::oid::text,' ' order by n),'') from jsonb_array_elements_text(shape->'types') with ordinality t(v,n))";
  const names="(case when shape->'names'='null'::jsonb then item.proargnames is not null else to_jsonb(item.proargnames) is distinct from shape->'names' end)";
  assert.ok(shapeGuard.includes(argtypes)&&shapeGuard.includes(names));
  shapeGuard=shapeGuard.replace(argtypes,"expectedTypes").replace(names,"badNames").replace("jsonb_array_length(shape->'types')","expectedCount")
    .replace("pg_catalog.pg_get_expr(item.proargdefaults,0)","item.defaultExpr").replaceAll("'public'::regnamespace","publicNamespace")
    .replaceAll("array['search_path=\"\"']::text[]","expectedConfig").replace(/shape->>'([a-z_]+)'/g,(_,key)=>"expected."+key)
    .replaceAll("source_bodies[i]","expectedBody").replace(/::(?:regtype|integer|boolean|text)/g,"");
  const rowStart=source.indexOf("coalesce(bool_and((a.grantor=owner_role.oid"),rowEnd=source.indexOf(") is true),false)",rowStart);
  const rowGuard=source.slice(rowStart+"coalesce(bool_and((".length,rowEnd);
  const aclStart=source.indexOf("  if not acl_safe"),aclEnd=source.indexOf(" then\n   raise exception",aclStart);
  const aclGuard=source.slice(aclStart+5,aclEnd).replace("array[0::oid,owner_role.oid]","defaultGrantees");
  function fixture(i:number){const shape=shapes[i];return {"owner_role.oid":100,publicNamespace:77,"item.proowner":100,"item.proname":shape.name,"item.pronamespace":77,"item.prokind":"f","item.proretset":false,"item.provariadic":0,"item.proallargtypes":null,"item.proargmodes":null,"item.pronargs":(shape.types as string[]).length,"item.proargtypes":(shape.types as string[]).join(" "),expectedTypes:(shape.types as string[]).join(" "),badNames:false,expectedCount:(shape.types as string[]).length,"item.prorettype":shape.returns,"item.pronargdefaults":shape.defaults,"item.defaultExpr":shape.default_expr,"item.lanname":shape.language,"item.prosecdef":shape.definer,"item.provolatile":shape.volatility,"item.proconfig":['search_path=""'],expectedConfig:['search_path=""'],"item.proisstrict":false,"item.proleakproof":false,"item.proparallel":"u","item.prosupport":0,"item.procost":100,"item.prorows":0,"item.protrftypes":null,"item.prosqlbody":null,"item.prosrc":bodies[i],expectedBody:bodies[i],...Object.fromEntries(Object.entries(shape).map(([key,value])=>['expected.'+key,value]))} as Record<string,unknown>;}
  type Acl={grantor:number|null;grantee:number|null;privilege_type:string|null;is_grantable:boolean|null};
  const entry=(grantee:number):Acl=>({grantor:100,grantee,privilege_type:"EXECUTE",is_grantable:false});
  function raw(i:number,rows:Acl[]){const desired=shapes[i].external==="anon"?101:shapes[i].external==="authenticated"?102:null;
    const safe=rows.length>0&&rows.every(row=>ownerAclPredicate(rowGuard,{"owner_role.oid":100,...Object.fromEntries(Object.entries(row).map(([k,v])=>['a.'+k,v]))})===true);
    return ownerAclPredicate(aclGuard,{acl_safe:safe,acl_count:rows.length,distinct_grantees:new Set(rows.map(row=>row.grantee)).size,owner_entries:rows.filter(row=>row.grantee===100).length,grantees:rows.map(row=>row.grantee).sort((a,b)=>(a??-1)-(b??-1)),defaultGrantees:[0,100],intended_grantees:desired===null?[100]:[100,desired]});}
  return {source,shapes,bodies,fixture,shape:(row:Record<string,unknown>)=>ownerAclPredicate(shapeGuard,row),raw,entry};
}

test("all-eight actual preflight cross-validates immutable bodies exact shapes and completes before any owner mutation",()=>{
  const seam=actualAllEightAcl(),predecessor=readFileSync(new URL("../../../../supabase/migrations/20261020220000_personal_calendar_feed.sql",import.meta.url),"utf8").replaceAll("\r\n","\n");assert.equal(seam.shapes.length,8);
  for(let i=0;i<8;i++){
    const shape=seam.shapes[i],at=predecessor.indexOf("create function "+String(shape.identity).split("(")[0]+"("),start=predecessor.indexOf("as $$",at)+5,end=predecessor.indexOf("$$;",start);assert.ok(at>=0&&start>at&&end>start);assert.equal(seam.bodies[i],predecessor.slice(start,end));
    const good=seam.fixture(i);assert.equal(seam.shape(good),false);
    const bad:Record<string,unknown>={"item.proowner":999,"item.proname":"drift","item.pronamespace":999,"item.prokind":"p","item.proretset":true,"item.provariadic":1,"item.proallargtypes":[],"item.proargmodes":[],"item.pronargs":99,"item.proargtypes":"wrong",badNames:true,"item.prorettype":"text","item.pronargdefaults":99,"item.defaultExpr":"wrong","item.lanname":"wrong","item.prosecdef":!shape.definer,"item.provolatile":"wrong","item.proconfig":[],"item.proisstrict":true,"item.proleakproof":true,"item.proparallel":"s","item.prosupport":99,"item.procost":1,"item.prorows":99,"item.protrftypes":[],"item.prosqlbody":"other","item.prosrc":seam.bodies[i]+" drift"};
    for(const [key,value]of Object.entries(bad))assert.equal(seam.shape({...good,[key]:value}),true,`${i}:${key}`);
  }
  const firstMutation=seam.source.indexOf(" execute 'set local role");assert.ok(firstMutation>seam.source.indexOf("-- End all-eight source-comparable preflight"));assert.ok(seam.source.indexOf("array_position(canonical_oids,null)")<firstMutation);assert.ok(seam.source.indexOf("not p.oid=any(canonical_oids)")<firstMutation);assert.ok(seam.source.indexOf("call_counts[i-5]")<firstMutation);
  // Exact old source recovered, including ALL original3 guard/matrix and suffix.
  const original=stripOwnerAclAddition(seam.source);assert.equal(createHash("sha256").update(original).digest("hex"),"d0f75428527392aca0d2be34685d83c8d1169479f9c29ad6f5349c5a24afb919");
});

test("each actual raw ACL guard accepts only owner-granted D or its own I and rejects every unsafe tuple before SET",()=>{
  const seam=actualAllEightAcl();
  for(let i=0;i<8;i++){
    const intended=[seam.entry(100),...(i===4?[seam.entry(101)]:i>=5?[seam.entry(102)]:[])],defaults=[seam.entry(0),seam.entry(100)];
    assert.equal(seam.raw(i,defaults),false);assert.equal(seam.raw(i,intended),false);
    const drift=[...intended,seam.entry(999)],duplicate=[...intended,seam.entry(100)];
    for(const unsafe of [[],intended.filter(row=>row.grantee!==100),drift,duplicate,[...defaults,seam.entry(i===4?101:102)],...['grantor','privilege_type','is_grantable'].flatMap(key=>intended.map((_,n)=>intended.map((row,m)=>m===n?{...row,[key]:key==='grantor'?666:key==='privilege_type'?'UPDATE':true}:row))),...intended.map((_,n)=>intended.map((row,m)=>m===n?{...row,grantor:null}:row))])assert.equal(seam.raw(i,unsafe),true,`target${i}`);
    for(const extra of [101,102,103])if(!intended.some(row=>row.grantee===extra))assert.equal(seam.raw(i,[...intended,seam.entry(extra)]),true);
  }
});

test("complete RLS010 actual assertions reject raw ACL owner service subject and clock drift and run UUID proof first",async()=>{
  const source=readFileSync(new URL("../../../integration/rls/calendar-feed.rls.test.ts",import.meta.url),"utf8"),start=source.indexOf('  test("[P0] 15.5-RLS010'),end=source.indexOf('  test("[P0] 15.5-RLS011',start),body=source.slice(start,end);
  assert.ok(body.indexOf("await calendarOwnerAclRegression()")<body.indexOf("await withCalendarFeedFixture"));assert.match(body, /180_000/);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const run=async(change:(facts:Awaited<ReturnType<typeof actualActorAclFacts>>)=>void)=>{const facts=await actualActorAclFacts();change(facts);let callback!:()=>Promise<void>;const order:string[]=[];
    new Function("test","withCalendarFeedFixture","expect","calendarOwnerAclRegression",strip(body))((_name:string,fn:()=>Promise<void>)=>{callback=fn;},async(_kind:string,fn:(fx:unknown)=>Promise<void>)=>{order.push("fixture");return fn({acl:async()=>facts});},(value:unknown)=>({toBe(expected:unknown){assert.equal(value,expected);},toEqual(expected:unknown){assert.deepEqual(value,expected);},toMatchObject(expected:Record<string,unknown>){for(const[key,part]of Object.entries(expected))assert.deepEqual((value as Record<string,unknown>)[key],part);}}),async()=>{order.push("UUID");});await callback();assert.deepEqual(order,["UUID","fixture"]);
  };
  await run(()=>{});
  for(const purpose of ['fetch','manage','status','abuse'])for(const drift of [{rawAclExact:false},{ownerExecute:false},{serviceRoleExecute:true},{volatility:'s'},{securityDefiner:false}])await assert.rejects(run(facts=>Object.assign(facts.functions.find((x:{purpose:string})=>x.purpose===purpose),drift)));
  for(const purpose of ['canonical','verifier','subject','clock']){
    for(const drift of [{rawAclExact:false},{ownerExecute:false},{serviceRoleExecute:true},{owner:'postgres'},{volatility:'wrong'},{securityDefiner:true}])await assert.rejects(run(facts=>Object.assign(facts.helpers.find((x:{purpose:string})=>x.purpose===purpose),drift)));
    await assert.rejects(run(facts=>{facts.helpers=facts.helpers.filter((x:{purpose:string})=>x.purpose!==purpose);}));
  }
});

async function actualOwnerAclSeams(){return (await actualFixtureOrigins()) as unknown as {calendarOwnerAclSource:(source:string,adapter:string,owner:string,migrator:string,schema:string,fn:string)=>{bootstrap:string;identity:string;create:string;revoke:string;grant:string;reconcile:string};calendarOwnerAclExercise:(sql:(text:string,values?:unknown[])=>Promise<{rows:Record<string,unknown>[]}>,input:Record<string,unknown>)=>Promise<void>};}
function ownerAclSources(){const root=new URL("../../../../supabase/migrations/",import.meta.url);return{source:readFileSync(new URL("20261020220000_personal_calendar_feed.sql",root),"utf8"),adapter:readFileSync(new URL("20261021102723_calendar_feed_preparsed_actor_identity.sql",root),"utf8"),owner:"cf_acl_o_"+"1".repeat(32),migrator:"cf_acl_m_"+"1".repeat(32),schema:"cf_acl_s_"+"1".repeat(32),fn:"cf_acl_f_"+"1".repeat(32)};}

test("actual native regression construction uses reversible bootstrap exact predecessor commands and actual owner fragment only",async()=>{
  const {calendarOwnerAclSource:prepare}=await actualOwnerAclSeams(),s=ownerAclSources(),p=prepare(s.source,s.adapter,s.owner,s.migrator,s.schema,s.fn);
  assert.ok(p.bootstrap.includes(`create role ${s.owner}`));assert.ok(p.create.includes(`${s.schema}.${s.fn}(p_tenant_id uuid,p_attempt_id uuid default null)`));
  assert.equal(p.revoke,`revoke all on function ${p.identity} from public,anon,authenticated,service_role;`);assert.equal(p.grant,`grant execute on function ${p.identity} to authenticated;`);
  const fragment=s.adapter.split(" -- Begin exact owner ACL reconciliation fragment.\n")[1].split(" -- End exact owner ACL reconciliation fragment.")[0];assert.ok(p.reconcile.includes(fragment));
  for(const drift of [s.source.replace('do $$','do $other$'),s.source.replace('revoke all on function public.calendar_feed_attestation_payload(jsonb),','revoke all on function public.unrelated(jsonb),'),s.source.replace(s.source.split(/\r?\n/).find(line=>line.startsWith('revoke all on function ')&&line.includes('public.read_calendar_feed_status(uuid,uuid)'))!, 'revoke all on function public.read_calendar_feed_status(uuid,uuid) from public;'),s.source+'\n'+s.source.split(/\r?\n/).find(line=>line.startsWith('grant execute on function public.read_calendar_feed_status'))])assert.throws(()=>prepare(drift,s.adapter,s.owner,s.migrator,s.schema,s.fn));
  for(const drift of [s.adapter.replace(" -- Begin exact owner ACL reconciliation fragment."," -- other"),s.adapter.replace("1..cardinality(canonical_oids)","1..8")])assert.throws(()=>prepare(s.source,drift,s.owner,s.migrator,s.schema,s.fn));
  assert.throws(()=>prepare(s.source,s.adapter,'calendar_feed_owner',s.migrator,s.schema,s.fn));
});

async function runOwnerAclExercise(fault: string|null=null){
  const seams=await actualOwnerAclSeams(),s=ownerAclSources(),prepared=seams.calendarOwnerAclSource(s.source,s.adapter,s.owner,s.migrator,s.schema,s.fn),calls:string[]=[];let current=s.migrator,fixed=false,ownerCalls=0;
  const sql=async(text:string)=>{calls.push(text);
    if(text.includes("current_setting('createrole_self_grant')"))return{rows:[{session:s.migrator,current:current,rolcanlogin:false,rolinherit:false,rolsuper:fault==='super',rolcreatedb:false,rolcreaterole:true,rolreplication:false,rolbypassrls:false,self_grant:""}]};
    if(text.startsWith('select session_user'))return{rows:[{session:s.migrator,current,rolcanlogin:false,rolinherit:false,rolsuper:false,rolcreatedb:false,rolcreaterole:false,rolreplication:false,rolbypassrls:false}]};
    if(text.startsWith('select pg_has_role'))return{rows:[{can_set:true,can_use:fault==='inherit',inherited:false}]};
    if(text.includes('snapshot'))return{rows:[{snapshot:'unchanged'}]};
    if(text.startsWith('select p.oid::text'))return{rows:[{oid:'1234',metadata:fixed&&fault==='metadata'?{changed:true}:{same:true},acl:fixed?'intended':'default',anon:!fixed,authenticated:true,service:!fixed,intended:fixed,independent_grant:false}]};
    if(text.startsWith('set local role ')){current=s.owner;ownerCalls++;}
    if(text===prepared.reconcile){assert.equal(current,s.owner);fixed=true;if(fault==='reconcile')throw Error('PRIVATE_SQL_NATIVE');}
    if(text.startsWith('do $$ begin raise'))throw Object.assign(new Error('calendar owned ACL forced rollback'),{code:'P0001'});
    if(text==='rollback to savepoint owner_acl_failure'){fixed=false;current=s.migrator;}
    if(text==='reset role'){if(fault==='reset')throw Error('PRIVATE_RESET_NATIVE');current=s.migrator;}
    return{rows:[]};
  };
  try {await seams.calendarOwnerAclExercise(sql,{...s,prepared});return{calls,ownerCalls};}catch(error){return{calls,ownerCalls,error};}
}

test("actual UUID-only operation sequence proves rollback negative before success while preserving ordinary and owner boundaries",async()=>{
  const result=await runOwnerAclExercise();assert.equal(result.error,undefined);assert.equal(result.ownerCalls,2);
  const calls=result.calls;assert.ok(calls.indexOf('rollback to savepoint owner_acl_failure')<calls.lastIndexOf('reset role'));
  assert.equal(calls.filter(line=>line.startsWith('do $owned$')).length,2);assert.equal(calls.filter(line=>line.startsWith('alter function ')).length,1);
  assert.ok(!calls.some(line=>/create.*public[.]|alter role|drop |select cf_acl_s_/.test(line)));
  for(const fault of ['super','inherit','reconcile','reset','metadata']){const result=await runOwnerAclExercise(fault);assert.ok(result.error,fault);if(fault==='super')assert.ok(!result.calls.some(line=>line.includes('do $$\ndeclare feed_owner')));if(fault==='reconcile')assert.ok(result.calls.includes('rollback to savepoint owner_acl_failure'));}
});

test("native regression source bounds parallel catalog effects and retains real protocol rollback fresh-absence cleanup ordering",()=>{
  const source=readFileSync(new URL('../../../support/calendar-feed-atdd.ts',import.meta.url),'utf8'),body=source.slice(source.indexOf('export async function calendarOwnerAclRegression()'),source.indexOf('/** Name-only bootstrap adaptation'));
  assert.equal(body.match(/await capture\(/g)?.length,2);assert.match(body,/runtime.validateAdmission\("db"/);assert.match(body,/runtime.validateStackIdentity\(stack\)/);assert.match(body,/status.DB_URL === LOCAL_SUPABASE_DB_URL/);assert.match(body,/runtime.createCalendarFeedDatabaseClient\(stack,"proof"\)/);assert.match(body,/runtime.createCalendarFeedDatabaseClient\(stack,"absence"\)/);
  assert.ok(body.indexOf('await qualify(main)')<body.indexOf('await calendarOwnerAclExercise'));assert.ok(body.indexOf('Promise.allSettled([...pending])')<body.indexOf('await calendarCauseProofIdle'));assert.ok(body.indexOf('await calendarCauseProofIdle')<body.indexOf('await sql("rollback")'));assert.ok(body.indexOf('await sql("rollback")')<body.indexOf('reset session authorization; reset role'));
  assert.ok(body.indexOf('await main.end()')<body.indexOf('await fresh.connect()'));assert.ok(body.includes('await qualify(fresh); await absence(fresh)'));assert.ok(!/drop role|drop schema|rollback.*catch.*return|calendar_feed_secret_internal/.test(body));
});

// Execute the EXACT live helper cleanup region with injected clients/promises.
// No imports, process, PG, connection, timer or resource is created by controls.
function actualOwnerAclCleanup(state: Record<string,unknown>) {
  const source=readFileSync(new URL('../../../support/calendar-feed-atdd.ts',import.meta.url),'utf8').replaceAll("\r\n","\n");
  const a=source.indexOf('  cleaning = true; // close primary admission'),b=source.indexOf('\n}\n\n/** Name-only bootstrap adaptation',a);assert.ok(a>=0&&b>a);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  return new Function('state',`return (async()=>{const {pending,main,stack,runtime,failures,qualify,absence,sql,calendarCauseProofIdle,calendarOwnerAclCustody,suffix}=state;
    let connected=true,cleaning=false,transportFailed=state.transportFailed??false,settled=false,mainAbsent=false,freshAbsent=false,mainClosed=false,freshClosed=false;
    const fail=stage=>failures.push(new Error('Calendar owner ACL proof '+stage+'; values redacted'));
    ${strip(source.slice(a,b))}
  })();`)(state) as Promise<void>;
}
function ownerAclCleanupState(faults: string[] = [], primary = false) {
  const events:string[]=[],suffix='owned',custody=new Map([[suffix,{owned:true}]]),failures=primary?[new Error('Fixed primary failure')]:[];
  let freshError:(()=>void)|undefined;
  const connection=(kind:string)=>({on(_event:string,fn:()=>void){freshError=fn;},async connect(){events.push(kind+':connect');if(faults.includes('fresh-connect'))throw Error('PRIVATE_CONNECT');if(faults.includes('fresh-transport'))freshError?.();},async end(){events.push(kind+':end');if(faults.includes(kind+'-end'))throw Error('PRIVATE_CLOSE');}});
  const main=connection('main'),fresh=connection('fresh');
  return {events,failures,custody,main,pending:new Set<Promise<unknown>>(),suffix,calendarOwnerAclCustody:custody,stack:{},transportFailed:faults.includes('main-transport'),runtime:{createCalendarFeedDatabaseClient(_stack:unknown,purpose:string){assert.equal(purpose,'absence');events.push('fresh:create');return fresh;}},
    async sql(text:string){events.push(text);if(faults.includes(text==='rollback'?'rollback':'reset'))throw Error('PRIVATE_SQL');return {rows:[]};},
    async qualify(client:unknown){const kind=client===main?'main':'fresh';events.push(kind+':qualify');if(faults.includes(kind+'-qualify'))throw Error('PRIVATE_QUALIFY');},
    async absence(client:unknown){const kind=client===main?'main':'fresh';events.push(kind+':absence');if(faults.includes(kind+'-absence'))throw Error('PRIVATE_ABSENCE');},
    async calendarCauseProofIdle(client:unknown){const kind=client===main?'main':'fresh';events.push(kind+':idle');return !faults.includes(kind+'-idle');}};
}

test("actual native cleanup joins pending work before rollback and never credits timeout or failed identity as owned absence",async()=>{
  const state=ownerAclCleanupState();let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});state.pending.add(pending);
  const run=actualOwnerAclCleanup(state);await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(state.events,[]);assert.equal(state.custody.size,1);release();await run;
  assert.deepEqual(state.events,['main:idle','rollback','reset session authorization; reset role','main:qualify','main:absence','main:end','fresh:create','fresh:connect','fresh:qualify','fresh:absence','fresh:idle','fresh:end']);assert.equal(state.custody.size,0);
  for(const fault of ['main-idle','rollback','reset','main-qualify','main-absence','fresh-qualify','fresh-absence','fresh-idle','main-end','fresh-end','main-transport','fresh-transport']){
    const state=ownerAclCleanupState([fault]);await assert.rejects(actualOwnerAclCleanup(state));assert.equal(state.custody.size,1,fault);
    if(fault==='main-idle')assert.ok(!state.events.includes('rollback'));if(['rollback','reset','main-qualify'].includes(fault))assert.ok(!state.events.includes('main:absence'));
    assert.ok(state.events.includes('main:end'));assert.ok(state.events.includes('fresh:end'));
  }
});

test("actual native cleanup preserves the primary and ALL independent cleanup failures without raw native causes",async()=>{
  const state=ownerAclCleanupState(['rollback','main-end','fresh-qualify','fresh-end'],true);
  const pending=Promise.reject(Error('PRIVATE_PENDING_SQL'));void pending.catch(()=>{});state.pending.add(pending);
  let report:AggregateError|undefined;try{await actualOwnerAclCleanup(state);}catch(error){report=error as AggregateError;}
  assert.ok(report);assert.equal(report.errors.length,6);assert.equal(report.errors[0],state.failures[0]);assert.equal(state.custody.size,1);
  const text=report.errors.map(error=>error.message).join(' ');assert.ok(!text.includes('PRIVATE_'));assert.ok(!report.errors.some(error=>Object.hasOwn(error,'cause')));
  assert.deepEqual(state.events,['main:idle','rollback','main:end','fresh:create','fresh:connect','fresh:qualify','fresh:idle','fresh:end']);
  const cleanPrimary=ownerAclCleanupState([],true);await assert.rejects(actualOwnerAclCleanup(cleanPrimary));assert.equal(cleanPrimary.custody.size,0);assert.equal(cleanPrimary.failures.length,1);
});

// Actual full factory module body, installed Pool, fake EventEmitter clients.
// Only ES module wrapping/types are removed; no lifecycle implementation is copied.
async function actualRetiredFactory(config: {mode?:string;manualClock?:boolean;queryHandler?:(sql:string,params:readonly unknown[])=>unknown[]}={}) {
  const {createRequire}=await import("node:module"),require=createRequire(import.meta.url),pgRequire=createRequire(require.resolve("pg")),InstalledPool=pgRequire("pg-pool");
  const timers=new Map<object,{fn:()=>void;ms:number}>(),clients:FakeClient[]=[];let acquiredPool:InstanceType<typeof InstalledPool>;
  class FakeClient extends EventEmitter {
    _queryable=true;_ending=false;status="I";release!:(destroy?:boolean)=>void;releases:unknown[]=[];ends=0;queryCalls:string[]=[];finishConnect?:()=>void;finishQuery?:()=>void;
    constructor(){super();clients.push(this);}
    connect(callback:(error?:Error)=>void){this.finishConnect=()=>callback();if(config.mode!=="late-connect")queueMicrotask(this.finishConnect);}
    getTransactionStatus(){return config.mode==="missing-status"?undefined:this.status;}
    query(sql:string,params:readonly unknown[]=[]){this.queryCalls.push(sql);let done!:(value:{rows:unknown[]})=>void,fail!:(error:Error)=>void;const result=new Promise<{rows:unknown[]}>((resolve,reject)=>{done=resolve;fail=reject;});
      const complete=()=>{try{const rows=config.queryHandler?config.queryHandler(sql,params):[{sql}];this.status=sql==="begin"?"T":sql==="commit"||sql==="rollback"||sql==="discard all"?"I":this.status; if(sql==="bad")throw Error("PRIVATE_QUERY");done({rows});}catch(error){this.status="E";fail(error as Error);}queueMicrotask(()=>this.emit("drain"));};
      this.finishQuery=complete;if(config.mode!=="pending-query")queueMicrotask(complete);return result;
    }
    end(callback?:()=>void){this.ends++;this._ending=true;if(config.mode==="retire-throw")throw Error("PRIVATE_RETIRE");if(config.mode==="missing-end")return;
      queueMicrotask(()=>{if(config.mode==="async-error")this.emit("error",Error("PRIVATE_ASYNC"));this.emit("end");callback?.();});
    }
  }
  const WrappedPool=function(options:Record<string,unknown>){acquiredPool=new InstalledPool({...options,Client:FakeClient});acquiredPool.on("acquire",(client:FakeClient)=>{
    // Installed Pool assigns the public release property immediately after this
    // event, including the late-acquisition retirement inside its callback.
    let release=client.release;Object.defineProperty(client,"release",{configurable:true,get:()=>release,set:(next:typeof release)=>{release=function(destroy){client.releases.push(destroy);return next(destroy);};}});
  });return acquiredPool;};
  const set=(fn:()=>void,ms:number)=>{if(!config.manualClock)return setTimeout(fn,ms);const token={};timers.set(token,{fn,ms});return token;};
  const clear=(token:ReturnType<typeof setTimeout>|object)=>{if(!config.manualClock)clearTimeout(token as ReturnType<typeof setTimeout>);else timers.delete(token);};
  const source=readFileSync(new URL("../../../factories/admin-sql.ts",import.meta.url),"utf8");
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const body=strip(source.slice(source.indexOf("let pool: Pool | null"))).replace(/^export /gm,"");
  const api=new Function("Pool","assertLocalStack","LOCAL_SUPABASE_DB_URL","setTimeout","clearTimeout",body+"\nreturn {adminRetiredSession,adminSession,adminQuery,getPool,AdminRetiredSessionError};")(WrappedPool,()=>{},"fixed-local-test-only",set,clear) as {adminRetiredSession<T>(run:(port:{query(sql:string):Promise<unknown[]>})=>Promise<T>):Promise<T>;adminSession<T>(run:(port:{query(sql:string):Promise<unknown[]>})=>Promise<T>):Promise<T>;getPool:()=>InstanceType<typeof InstalledPool>;AdminRetiredSessionError:new(verified:boolean,facts:string[])=>Error};
  return {api,clients,timers,pool:()=>acquiredPool,tick:async(ms:number)=>{for(const [token,timer]of [...timers])if(timer.ms===ms){timers.delete(token);timer.fn();}await new Promise(resolve=>setImmediate(resolve));},flush:()=>new Promise(resolve=>setImmediate(resolve))};
}

test("actual retired factory requires native drain and final idle then destroys the exact installed-Pool client once",async()=>{
  const f=await actualRetiredFactory(),value={identity:true};const result=await f.api.adminRetiredSession(async port=>{const rows=await port.query("select fixed");assert.deepEqual(rows,[{sql:"select fixed"}]);return value;});assert.equal(result,value);
  assert.equal(f.clients.length,1);assert.deepEqual(f.clients[0].releases,[true]);assert.equal(f.pool().idleCount,0);assert.equal(f.pool().totalCount,0);assert.ok(!f.clients[0].queryCalls.includes("discard all"));
  const original=Error("FOREIGN");assert.throws(()=>f.pool().emit("error",original,new EventEmitter()),error=>error===original);assert.equal(f.pool().emit("error",Error("OWNED_LATE"),f.clients[0]),true);assert.doesNotThrow(()=>f.clients[0].emit("error",Error("OWNED_CLIENT_LATE")));
  await f.pool().end();
});

test("actual owned error gate preserves foreign listeners monitors receivers and concurrent registrations",async()=>{
  const f=await actualRetiredFactory({mode:"async-error"}),pool=f.api.getPool();let foreign=0,monitored=0;const {errorMonitor}=await import("node:events");pool.on("error",()=>{foreign++;});pool.on(errorMonitor,()=>{monitored++;});
  const first=f.api.adminRetiredSession(async()=>1),second=f.api.adminRetiredSession(async()=>2);
  void first.catch(()=>{});void second.catch(()=>{});await f.flush();
  await assert.rejects(first);await assert.rejects(second);assert.equal(foreign,0);assert.equal(monitored,0);assert.equal(f.clients.length,2);for(const client of f.clients)assert.deepEqual(client.releases,[true]);
  const error=Error("FOREIGN");assert.equal(pool.emit("error",error,new EventEmitter()),true);assert.equal(foreign,1);assert.equal(monitored,1);
  const other=new EventEmitter();assert.throws(()=>pool.emit.call(other,"error",error),value=>value===error);let seen:unknown;other.on("error",value=>{seen=value;});assert.equal(pool.emit.call(other,"error",error),true);assert.equal(seen,error);assert.equal(pool.emit("unused-event"),false);
  await pool.end();
});

test("actual retired factory refuses overlap and early return and closes late query admission before bounded retirement",async()=>{
  const f=await actualRetiredFactory({mode:"pending-query",manualClock:true});let port!:{query(sql:string):Promise<unknown[]>};let pending:Promise<unknown[]>|undefined;
  const run=f.api.adminRetiredSession(async p=>{port=p;pending=p.query("select pending");void pending.catch(()=>{});await assert.rejects(p.query("overlap"));return 1;});void run.catch(()=>{});await f.flush();
  assert.deepEqual(f.clients[0].queryCalls,["select pending"]);assert.deepEqual(f.clients[0].releases,[true]);await assert.rejects(port.query("late"));assert.deepEqual(f.clients[0].queryCalls,["select pending"]);
  await f.tick(5_000);await assert.rejects(run);f.clients[0].finishQuery?.();await f.flush();assert.equal(f.pool().idleCount,0);await f.pool().end();
});

test("actual retired factory rejects absent end retirement throws missing status and deadline without certifying backend cleanup",async()=>{
  for(const mode of ["missing-end","retire-throw","missing-status"]){const f=await actualRetiredFactory({mode,manualClock:true});let called=false;const run=f.api.adminRetiredSession(async()=>{called=true;return 1;});void run.catch(()=>{});await f.flush();await f.tick(5_000);await assert.rejects(run);assert.equal(called,mode!=="missing-status");assert.deepEqual(f.clients[0].releases,[true]);assert.equal(f.pool().idleCount,0);await f.pool().end();}
  const f=await actualRetiredFactory({manualClock:true});let release!:()=>void;const hold=new Promise<void>(resolve=>{release=resolve;});const run=f.api.adminRetiredSession(async()=>{await hold;return 1;});void run.catch(()=>{});await f.flush();await f.tick(20_000);await f.tick(5_000);await assert.rejects(run);release();await f.flush();assert.deepEqual(f.clients[0].releases,[true]);await f.pool().end();
});

test("actual retired acquisition registers and destroys late clients without invoking callback or changing default session behavior",async()=>{
  const f=await actualRetiredFactory({mode:"late-connect",manualClock:true});let called=false;const run=f.api.adminRetiredSession(async()=>{called=true;});void run.catch(()=>{});await f.flush();await f.tick(5_000);await assert.rejects(run);f.clients[0].finishConnect?.();await f.flush();assert.equal(called,false);assert.deepEqual(f.clients[0].releases,[true]);assert.doesNotThrow(()=>f.pool().emit("error",Error("LATE"),f.clients[0]));await f.pool().end();
  const normal=await actualRetiredFactory();assert.equal(await normal.api.adminSession(async()=>7),7);assert.deepEqual(normal.clients[0].queryCalls,["discard all"]);assert.deepEqual(normal.clients[0].releases,[undefined]);await normal.pool().end();
});


async function actualCalendarOwner(options:{faults?:string[];purpose?:"clock"|"subject"|"fetch";unsafe?:Record<string,unknown>;failure?:unknown}={}) {
  const purpose=options.purpose??"clock",fixed=readFileSync(new URL("../../../../supabase/migrations/20261020220000_personal_calendar_feed.sql",import.meta.url),"utf8").replaceAll("\r\n","\n");
  const names={clock:"calendar_feed_now_internal",subject:"calendar_feed_subject_internal",fetch:"fetch_calendar_feed"},name=names[purpose];
  const at=fixed.indexOf("create function public."+name+"("),start=fixed.indexOf("as $$",at)+5,end=fixed.indexOf("$$;",start),body=fixed.slice(start,end);
  const metadata={oid:"90001",proname:name,proowner:90002,pronamespace:2200,prolang:purpose==="fetch"?13563:14,prokind:"f",proretset:false,provariadic:0,proallargtypes:null,proargmodes:null,pronargs:purpose==="clock"?0:4,proargtypes:purpose==="clock"?"":purpose==="subject"?"2950 2950 2950 16":"25 25 3802 25",proargnames:purpose==="clock"?null:purpose==="subject"?["p_tenant","p_membership","p_actor","p_admin"]:["p_token_hash","p_ip_hash","p_claims","p_signature"],prorettype:purpose==="clock"?1184:purpose==="subject"?16:3802,pronargdefaults:purpose==="subject"?2:0,prosecdef:purpose==="fetch",provolatile:purpose==="subject"?"s":"v",proconfig:['search_path=""'],proisstrict:false,proleakproof:false,proparallel:"u",prosupport:0,procost:100,prorows:0,protrftypes:null,prosqlbody:null,prosrc:body,proacl:["owner=X/owner",...(purpose==="fetch"?["anon=X/owner"]:[])]};
  const definition=(text:string,language:string,vol:string)=>`CREATE OR REPLACE FUNCTION public.${name}()\n RETURNS fixed\n LANGUAGE ${language}\n ${vol==="s"?"STABLE":"VOLATILE"}\n SET search_path TO ''\nAS $function$${text}$function$\n`;
  const canonical={oid:"90001",metadata,definition:definition(body,purpose==="fetch"?"plpgsql":"sql",metadata.provolatile),body,language:purpose==="fetch"?"plpgsql":"sql",default_expr:purpose==="subject"?"NULL::uuid, false":null,identityQualified:true,ownerQualified:true,setQualified:true,notInherited:true,schemaQualified:true,noCreate:true,aclQualified:true};
  let row=structuredClone(canonical),before=structuredClone(row),current="postgres",create=false,hadFailure=false;
  const calls:string[]=[],faults=[...(options.faults??[])];
  const driver=(sql:string,params:readonly unknown[])=>{
    const phase=sql.startsWith("select p.oid::text oid")?"catalog":sql.startsWith("CREATE OR REPLACE")?"replace":sql;
    calls.push(phase);const fault=phase==="catalog"&&hadFailure&&faults.includes("catalog-after-error")?"catalog-after-error":phase;if(faults.includes(fault)){faults.splice(faults.indexOf(fault),1);hadFailure=true;throw options.failure??Error("PRIVATE_FAILURE");}
    if(sql==="begin")before=structuredClone(row);
    if(sql==="rollback"){row=structuredClone(before);create=false;current="postgres";}
    if(phase==="catalog"){assert.match(sql,/prosupport\x27,p\.prosupport::oid::bigint/);assert.equal(current,"postgres");assert.equal(create,false);assert.equal(params[0],`public.${name}(${purpose==="clock"?"":purpose==="subject"?"uuid,uuid,uuid,boolean":"text,text,jsonb,text"})`);return [{...structuredClone(row),...options.unsafe}];}
    if(sql==="grant create on schema public to calendar_feed_owner"){assert.equal(current,"postgres");create=true;}
    if(sql==="set local role calendar_feed_owner")current="calendar_feed_owner";
    if(sql.startsWith("select session_user="))return[{qualified:current==="calendar_feed_owner"}];
    if(phase==="replace"){assert.equal(current,"calendar_feed_owner");assert.equal(create,true);const pieces=sql.split("$function$");assert.equal(pieces.length,3);row.body=pieces[1];row.metadata.prosrc=pieces[1];row.language=sql.includes(" LANGUAGE plpgsql\n")?"plpgsql":"sql";row.metadata.prolang=row.language==="plpgsql"?13563:14;row.metadata.provolatile=sql.includes(" STABLE\n")?"s":"v";row.definition=sql;}
    if(sql==="reset role")current="postgres";
    if(sql==="revoke create on schema public from calendar_feed_owner"){assert.equal(current,"postgres");create=false;}
    if(sql==="select public.calendar_feed_now_internal() now"){assert.equal(current,"calendar_feed_owner");assert.equal(create,false);return[{now:"2026-10-20T12:05:00Z"}];}
    if(sql==="commit"){assert.equal(current,"postgres");assert.equal(create,false);}
    return[];
  };
  const factory=await actualRetiredFactory({queryHandler:driver});
  const {AsyncLocalStorage}=await import("node:async_hooks");
  const origins=await actualFixtureOrigins();
  const api=actualFeedRegion("../../../support/calendar-feed-atdd.ts","// Owner-scoped serial operations.","async function calendarFault", "({calendarOrdinaryResponse,calendarFetchPort,calendarSerialControls,calendarOwnerAtomic,calendarOwnerFacts,calendarOwnerDefinition,calendarPublish,calendarRestore,calendarReadClock,calendarWorkScope,calendarSettle,calendarInt009Subject,calendarOwnedStates,getCustody:()=>calendarSharedCustody})",{AsyncLocalStorage,calendarFixtureOrigin:origins.calendarFixtureOrigin,adminRetiredSession:factory.api.adminRetiredSession,AdminRetiredSessionError:factory.api.AdminRetiredSessionError,calendarCanonicalSourceUrl:new URL("../../../../supabase/migrations/20261020220000_personal_calendar_feed.sql",import.meta.url),readFile:async()=>fixed,redactFailure:()=>Error("fixed redacted"),hashFeedToken:()=>"fixed",tokenFromUrl:()=>"fixed",adminQuery:async()=>[],iso:(value:unknown)=>value,hashFeedIp:()=>"fixed"}) as {calendarOrdinaryResponse:(request:()=>Promise<Response>)=>Promise<{status:number;headers:Record<string,string>;body:string}>;calendarFetchPort:(anon:{rpc:(name:string,args:Record<string,unknown>)=>PromiseLike<unknown>})=>{rpc:(name:string,args:Record<string,unknown>)=>Promise<unknown>};calendarSerialControls:(fx:{pendingRequests:Set<Promise<unknown>>;workClosed:boolean})=>Promise<{withDatabaseTime:<T>(iso:string,run:()=>Promise<T>)=>Promise<T>}>;calendarOwnerAtomic:(purpose:string,body:string,operation:Record<string,unknown>)=>Promise<{row:typeof canonical;now:unknown}>;calendarOwnerFacts:(rows:unknown,purpose:string,body:string)=>unknown;calendarPublish:(purpose:string,body:(body:string)=>string,subjectFault?:boolean)=>Promise<void>;calendarRestore:(purpose:string)=>Promise<void>;calendarReadClock:()=>Promise<unknown>;calendarWorkScope:<T>(fx:{pendingRequests:Set<Promise<unknown>>},run:()=>Promise<T>,capture?:ReturnType<typeof origins.createCalendarInt009Capture>)=>Promise<T>;calendarSettle:(fx:{pendingRequests:Set<Promise<unknown>>},timeout?:number)=>Promise<void>;calendarInt009Subject:(purpose:string)=>ReturnType<typeof origins.createCalendarInt009Capture>|undefined;calendarOwnedStates:Map<string,unknown>;getCustody:()=>unknown};
  return{api,factory,calls,canonical,body,row:()=>row};
}

test("actual owner operation commits private read or qualified replacement before ordinary callback and restores full original metadata",async()=>{
  for(const purpose of ["clock","subject","fetch"] as const){const f=await actualCalendarOwner({purpose});
    const value={ordinary:true};await f.api.calendarPublish(purpose,()=>" owned test body ",purpose==="subject");
    const publish=f.calls.lastIndexOf("commit");assert.ok(publish>f.calls.indexOf("replace"));assert.equal(f.factory.clients.length,2);for(const c of f.factory.clients)assert.deepEqual(c.releases,[true]);
    const returned=await f.api.calendarWorkScope({pendingRequests:new Set()},async()=>{assert.equal(f.row().body," owned test body ");assert.equal(f.factory.pool().totalCount,0);return value;});assert.equal(returned,value);
    await f.api.calendarRestore(purpose);assert.deepEqual(f.row(),f.canonical);assert.equal(f.api.getCustody(),null);assert.equal(f.api.calendarOwnedStates.size,0);assert.ok(!f.calls.some(call=>/grant execute|alter.*owner|create role/i.test(call)));await f.factory.pool()?.end();
  }
  const f=await actualCalendarOwner();assert.equal(await f.api.calendarReadClock(),"2026-10-20T12:05:00Z");assert.ok(!f.calls.includes("grant create on schema public to calendar_feed_owner"));assert.ok(f.calls.includes("set local role calendar_feed_owner"));await f.factory.pool()?.end();
});

test("actual owner preflight refuses identity SET inheritance schema ACL shape OID and getters before any owner mutation",async()=>{
  for(const unsafe of [{identityQualified:false},{ownerQualified:false},{setQualified:false},{notInherited:false},{schemaQualified:false},{aclQualified:false},{noCreate:false},{oid:17},{metadata:{prosrc:"PRIVATE"}},{body:"drift"}]){
    const f=await actualCalendarOwner({unsafe});await assert.rejects(f.api.calendarPublish("clock",()=>"changed"));assert.ok(!f.calls.includes("grant create on schema public to calendar_feed_owner"));assert.ok(!f.calls.includes("set local role calendar_feed_owner"));assert.ok(!f.calls.includes("replace"));await f.factory.pool()?.end();
  }
  const f=await actualCalendarOwner();let reads=0;const hostile={...f.canonical};Object.defineProperty(hostile,"body",{get(){reads++;throw Error("PRIVATE");}});assert.throws(()=>f.api.calendarOwnerFacts([hostile],"clock",f.body));assert.equal(reads,0);
  const nested={...f.canonical,metadata:{...f.canonical.metadata,proacl:["fixed"]}};Object.defineProperty(nested.metadata.proacl,"0",{get(){reads++;throw Error("PRIVATE");}});assert.throws(()=>f.api.calendarOwnerFacts([nested],"clock",f.body));assert.equal(reads,0);await f.factory.pool()?.end();
  const proxy=new Proxy({}, {ownKeys(){throw Error("PRIVATE_PROXY");},get(){reads++;throw Error("PRIVATE_GET");}}),g=await actualCalendarOwner({unsafe:{metadata:proxy}});let error:unknown;try{await g.api.calendarPublish("clock",()=>"changed");}catch(failure){error=failure;}assert.ok(error);assert.ok(!String(error).includes("PRIVATE"));assert.equal(reads,0);assert.ok(!g.calls.includes("replace"));await g.factory.pool()?.end();
});

test("actual owner SQL commit rollback reset and restoration failures retain fixed primary plus ALL cleanup facts and custody",async()=>{
  for(const faults of [["replace"],["replace","rollback"],["replace","reset role"],["commit"],["replace","rollback","reset role","catalog-after-error"]]){
    const f=await actualCalendarOwner();const captured=await f.api.calendarOwnerAtomic("clock",f.body,{kind:"capture"});f.calls.length=0;
    // Faults are injected in the actual installed-Pool query adapter, not return labels.
    const g=await actualCalendarOwner({faults});let failure:unknown;try{await g.api.calendarOwnerAtomic("clock",g.body,{kind:"replace",body:"changed",expected:captured.row});}catch(error){failure=error;}
    assert.ok(failure instanceof AggregateError);if(faults.includes("catalog-after-error"))assert.ok(failure.errors.length>=4);assert.ok(!String(failure).includes("PRIVATE"));assert.ok(g.calls.includes("rollback"));assert.ok(g.calls.includes("reset role"));
    if(faults.includes("commit")||faults.includes("rollback")||faults.includes("reset role"))assert.ok(g.api.getCustody());
    else {assert.equal(g.api.getCustody(),null);assert.deepEqual(g.row(),g.canonical);}
    await f.factory.pool()?.end();await g.factory.pool()?.end();
  }
  const f=await actualCalendarOwner();await f.api.calendarPublish("clock",()=>"changed");f.row().metadata.proacl=["unexpected"];await assert.rejects(f.api.calendarRestore("clock"));assert.ok(f.api.getCustody());await assert.rejects(f.api.calendarPublish("clock",()=>"later"));await f.factory.pool()?.end();
});

test("actual ordinary-work drain does not confuse callback rejection or timeout with underlying settlement",async()=>{
  const f=await actualCalendarOwner();let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;}),set=new Set<Promise<unknown>>([pending]);let returned=false;
  const scope=f.api.calendarWorkScope({pendingRequests:set},async()=>{throw Error("PRIVATE_CALLBACK");});void scope.catch(()=>{});void scope.finally(()=>{returned=true;}).catch(()=>{});await f.factory.flush();assert.equal(returned,false);
  set.delete(pending);release();await assert.rejects(scope);assert.equal(f.api.getCustody(),null);
  const never=new Set<Promise<unknown>>([new Promise(()=>{})]);await assert.rejects(f.api.calendarSettle({pendingRequests:never},1));assert.ok(f.api.getCustody());await assert.rejects(f.api.calendarPublish("clock",()=>"changed"));assert.equal(f.calls.length,0);await f.factory.pool()?.end();
});


async function actualCanonicalComposition(fault?:"seed"|"cleanup"|"custody"|"prior-seam") {
  const source=readFileSync(new URL("../../../support/calendar-feed-atdd.ts",import.meta.url),"utf8").replaceAll("\r\n","\n"),start="/** Same exported canonical setup/cleanup",end="function redactFailure";
  assert.equal(source.split(start).length,2);assert.equal(source.split(end).length,2);
  const region=source.slice(source.indexOf(start),source.indexOf(end)).replace(/^export /gm,"");const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const events:string[]=[],inputs:unknown[][]=[];let counter=0;const user=(id:string)=>({id});
  const role={base:{tenantA:{id:"A"},tenantB:{id:"B"},adminA:user("adminA"),adminB:user("adminB"),orphanUser:user("orphan")},users:{montor:user("own"),projektledare:user("planner")},extraUsers:[user("canonical-extra")]};
  const fx={pendingRequests:new Set<Promise<unknown>>(),finalizers:new Set<()=>Promise<void>>(),workClosed:false};
  const api=new Function("createRoleAwarePhaseAFixture","cleanupRoleAwarePhaseAFixture","makeAuthedServerClient","adminQuery","randomUUID","calendarFixtureStep","calendarFixtureDiagnostic","redactFailure","feedKeyFromEnv","seedRoleAwarePhaseAUsers","bindCalendarFixture","calendarWorkScope","calendarSettle","calendarOwnerRefused","cleanupCalendarOwnedRows","deleteAuthUser","calendarOwnedStates",strip(`let calendarSharedCustody=null;${region}`)+"\nreturn {withCalendarFeedFixture,calendarSeedBookingFixture,custody:()=>calendarFixtureCustody,retain:()=>{calendarSharedCustody={purpose:'clock',phase:'test-owned-uncertainty'};}};")(
    async()=>{events.push("canonical:create");return role;},async(value:unknown)=>{assert.equal(value,role);events.push("canonical:cleanup");if(fault==="cleanup")throw Error("PRIVATE_CANONICAL");},
    async(value:unknown)=>{events.push("client");inputs.push([value]);return{user:value};},
    async(sql:string,params:unknown[])=>{if(sql.startsWith("select id from public.tenant_memberships")){inputs.push(params);return[{id:"membership-"+params[1]}];}if(sql.startsWith("insert into public.person_profiles")){events.push("profile");inputs.push(params);if(fault==="seed"&&params[2]==="membership-own")throw Error("PRIVATE_SEED");return[];}events.push("absence");return[];},()=>"UUID-"+(++counter),
    async(_stage:string,run:()=>Promise<unknown>)=>run(),(_stage:string,error:unknown)=>error instanceof Error?error:Error("safe"),()=>Error("safe"),()=>{},
    async(value:unknown)=>{assert.equal(value,role.base);events.push("additional");return{extraUsers:[user("additional")]};},async(base:unknown)=>{assert.ok(base);return fx;},async(_fx:unknown,run:()=>Promise<unknown>)=>run(),async()=>{events.push("settle");},()=>Error("safe custody"),async(tenants:unknown)=>{assert.deepEqual(tenants,["A","B"]);events.push("row:cleanup");},async(id:string)=>{assert.equal(id,"additional");events.push("auth:cleanup");},new Map(fault==="prior-seam"?[["clock",{held:true}]]:[])
  ) as {withCalendarFeedFixture:(lane:string,run:(fx:unknown)=>Promise<void>,capture?:{publish():void;close():void})=>Promise<void>;calendarSeedBookingFixture:(base:typeof role)=>Promise<Record<string,unknown>>;retain:()=>void;custody:()=>Set<unknown>};
  return{api,events,inputs,role,fx};
}

test("actual canonical fixture composition preserves the same four profile/client seeds and cleanup identities",async()=>{
  const f=await actualCanonicalComposition();const seeded=await f.api.calendarSeedBookingFixture(f.role);assert.deepEqual(seeded.tenantIds,["A","B"]);assert.equal(f.events.filter(x=>x==="profile").length,4);assert.equal(f.events.filter(x=>x==="client").length,4);
  assert.deepEqual(f.inputs.filter(input=>input.length===2),[["A","adminA"],["A","own"],["A","planner"],["B","adminB"]]);assert.deepEqual(f.inputs.filter(input=>input.length===1).map(input=>(input[0] as {id:string}).id),["adminA","planner","own","adminB"]);
  assert.equal(seeded.base,f.role.base);assert.equal((seeded.montorClient as {user:unknown}).user,f.role.users.montor);
  f.events.length=0;const primary=Error("safe primary");await assert.rejects(f.api.withCalendarFeedFixture("row-isolated",async()=>{f.events.push("callback");throw primary;}));assert.ok(f.fx.workClosed);assert.ok(f.events.indexOf("settle")<f.events.indexOf("row:cleanup"));assert.ok(f.events.indexOf("row:cleanup")<f.events.indexOf("canonical:cleanup"));assert.ok(f.events.includes("auth:cleanup"));
  const baseline=readFileSync(new URL("../../../support/bookings-atdd.ts",import.meta.url),"utf8");assert.match(baseline,/await createRoleAwarePhaseAFixture\(\)/);assert.match(baseline,/await cleanupRoleAwarePhaseAFixture\(roleFixture\)/);assert.match(baseline,/seedProfile\(base.tenantB.id, base.adminB\)/);
});

test("actual composition cleans after seed failure but retains canonical/Auth/rows when owner custody is uncertain",async()=>{
  const seed=await actualCanonicalComposition("seed");await assert.rejects(seed.api.withCalendarFeedFixture("row-isolated",async()=>{throw Error("must not run");}));assert.equal(seed.events.filter(x=>x==="profile").length,4);assert.ok(seed.events.includes("canonical:cleanup"));assert.ok(!seed.events.includes("client"));
  const prior=await actualCanonicalComposition("prior-seam");await assert.rejects(prior.api.withCalendarFeedFixture("row-isolated",async()=>{throw Error("must not run");}));assert.deepEqual(prior.events,[]);
  const held=await actualCanonicalComposition();await assert.rejects(held.api.withCalendarFeedFixture("row-isolated",async()=>{held.api.retain();}));assert.equal(held.api.custody().size,1);assert.ok(!held.events.some(event=>["row:cleanup","canonical:cleanup","auth:cleanup","absence"].includes(event)));
  const both=await actualCanonicalComposition("cleanup");let error:unknown;try{await both.api.withCalendarFeedFixture("row-isolated",async()=>{throw Error("safe primary");});}catch(failure){error=failure;}assert.ok(error instanceof AggregateError);assert.ok(both.events.includes("auth:cleanup"));assert.ok(both.events.includes("absence"));
});

test("actual RLS002 uses a different spoof for every negative caller and checks each exact physical no-mutation result",async()=>{
  const source=readFileSync(new URL("../../../integration/rls/calendar-feed.rls.test.ts",import.meta.url),"utf8").replaceAll("\r\n","\n"),start=source.indexOf('  test("[P0] 15.5-RLS002'),end=source.indexOf("\n  });",start);assert.ok(start>0&&end>start);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const subject=(tenantId:string,name:string)=>({tenantId,userId:"user-"+name,membershipId:"member-"+name,profileId:"profile-"+name}),subjects={own:subject("A","own"),admin:subject("A","admin"),planner:subject("A","planner"),peer:subject("A","peer"),foreign:subject("B","foreign"),platformOnly:subject("A","platform")};
  let callback!:()=>Promise<void>,legitimate=0,negatives=0,physical=0;const state={owned:true};
  const fx={subjects,rawManage:async(name:keyof typeof subjects,_intent:unknown,overrides?:Record<string,unknown>)=>{if(!overrides){assert.equal(name,"foreign");assert.equal(physical,0);legitimate++;return{denied:false,rows:[{legitimate:true}]};}assert.ok(Object.entries(overrides).some(([key,value])=>key!=="profileId"&&value!==(subjects[name] as Record<string,unknown>)[key]));negatives++;return{denied:true,rows:[]};},physical:async()=>{physical++;return state;}};
  const expect=(value:unknown)=>({toBe:(expected:unknown)=>assert.equal(value,expected),toEqual:(expected:unknown)=>assert.deepEqual(value,expected)});
  new Function("test","withCalendarFeedFixture","expect","lifecycle","randomUUID",strip(source.slice(start,end+"\n  });".length)))((_name:string,run:()=>Promise<void>)=>{callback=run;},async(_lane:string,run:(fx:unknown)=>Promise<void>)=>run(fx),expect,()=>({}),()=>"different-tenant");await callback();assert.equal(legitimate,1);assert.equal(negatives,21);assert.equal(physical,22);
});


test("actual withDatabaseTime awaits committed retired publication then joins callback work before canonical restore on success and assertion failure",async()=>{
  for(const fail of [false,true]){const f=await actualCalendarOwner(),pendingRequests=new Set<Promise<unknown>>(),fx={pendingRequests,workClosed:false},serial=await f.api.calendarSerialControls(fx);let release!:()=>void;const actual=new Promise<void>(resolve=>{release=resolve;});let callback=false;
    const run=serial.withDatabaseTime("2026-10-20T12:05:00Z",async()=>{callback=true;assert.equal(f.calls.at(-1),"commit");assert.equal(f.factory.pool().totalCount,0);pendingRequests.add(actual);void actual.then(()=>pendingRequests.delete(actual));if(fail)throw Error("PRIVATE_ASSERTION");return fx;});void run.catch(()=>{});
    await f.factory.flush();assert.equal(callback,true);assert.ok(f.row().body.includes("2026-10-20T12:05:00Z"));assert.equal(f.calls.filter(call=>call==="replace").length,1);
    release();if(fail)await assert.rejects(run);else assert.equal(await run,fx);assert.deepEqual(f.row(),f.canonical);assert.equal(f.api.getCustody(),null);await f.factory.pool()?.end();
  }
});

test("actual E2E002 empty agenda keeps structure visible copy keyboard href and one settings surface without weakening populated agenda",async()=>{
  const source=readFileSync(new URL("../../../e2e/calendar-feed.e2e.spec.ts",import.meta.url),"utf8").replaceAll("\r\n","\n"),start=source.indexOf('        if (variant.scenario === "no-profile")'),end=source.indexOf(" // single lifecycle surface",start);assert.ok(start>0&&end>start);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  for(const scenario of ["no-profile","own-and-foreign"]){const checks:string[]=[],locator=(name:string)=>({name}),personal={name:"personal",getByLabel:()=>locator("agenda"),getByText:(text:string,opts:unknown)=>{assert.equal(text,"Inga egna bokningar i perioden.");assert.deepEqual(opts,{exact:true});return locator("empty");},getByRole:()=>locator("link")},page={name:"page",keyboard:{press:async(key:string)=>{checks.push("key:"+key);}},getByRole:()=>locator("heading")};
    const expect=(value:{name:string})=>({toBeVisible:async()=>{checks.push(value.name+":visible");},toBeAttached:async()=>{checks.push(value.name+":attached");},toHaveCount:async(count:number)=>{checks.push(value.name+":count:"+count);},toHaveAttribute:async(name:string,value:string)=>{assert.equal(name,"href");assert.equal(value,"/settings/calendar");checks.push("href");},toHaveURL:async(pattern:RegExp)=>{assert.ok(pattern.test("/settings/calendar"));checks.push("url");}});
    const run=new Function("variant","expect","personal","page","calendarNames","tabTo","calendarUI",strip(`async function actual(){${source.slice(start,end)}}`)+"return actual;")({scenario,host:"agenda"},expect,personal,page,{title:"Kalenderprenumeration"},async()=>{checks.push("keyboard-focus");},()=>({create:locator("create")}));await run();
    assert.ok(checks.includes("link:visible"));assert.ok(checks.includes("link:count:1"));assert.ok(checks.includes("href"));assert.ok(checks.includes("keyboard-focus"));assert.ok(checks.includes("key:Enter"));assert.ok(checks.includes("heading:count:1"));assert.ok(checks.includes("create:count:1"));
    if(scenario==="no-profile"){assert.ok(checks.includes("personal:visible"));assert.ok(checks.includes("agenda:attached"));assert.ok(checks.includes("empty:visible"));assert.ok(!checks.includes("agenda:visible"));}else{assert.ok(checks.includes("agenda:visible"));assert.ok(!checks.includes("agenda:attached"));}
  }
});


test("failed DB signal cancellation launch timeout and forced or unknown stop cannot delete or read back the key",async()=>{
  for(const failure of ["signal","cancel","post-run-cancel","launch","timeout","stop","forced","unknown-stop"]){const h=harness();
    const launch=h.deps.launch;h.deps.launch=(command,args,childEnv)=>{if(failure==="launch")throw Error("PRIVATE launch");const handle=launch(command,args,childEnv);
      if(!args.includes("start"))return{...handle,done:failure==="signal"?Promise.resolve({code:null as unknown as number,signal:"SIGTERM" as unknown as null}):failure==="timeout"?actualFeedRegion("../../../../scripts/ci/with-calendar-feed-runtime.mjs","async function bounded(","async function processIdentity(","bounded",{RuntimeFailure:Error})(new Promise(()=>{}),1,"child-timeout"):handle.done};
      return{...handle,async stop(){const result=await handle.stop();if(failure==="post-run-cancel")h.signal();if(failure==="stop")throw Error("PRIVATE stop");return failure==="forced"?{forced:true,signal:null}:failure==="unknown-stop"?undefined as unknown as typeof result:result;}};};
    const ready=h.deps.ready;h.deps.ready=async()=>{if(failure==="cancel")h.signal();await ready();};
    // Run the actual bounded deadline with a finite1ms injected child dependency.
    // This is offline promise behavior, not a real process timeout or backend proof.
    const result=await runFixture("db",h);assert.equal(result.exitCode,1);assert.equal(result.receipt.keyDeleted,false);assert.equal(result.receipt.keyOutcome,"unverified");assert.ok(result.receipt.custody);assert.equal(result.receipt.dbClosed,true);
    assert.ok(!result.queries.some(call=>call.sql.startsWith("delete")||call.sql.startsWith("select id,name from vault.secrets")));assert.ok(!JSON.stringify(result.receipt).includes("PRIVATE"));
  }
});


function actualHttpPort(response:(request:()=>Promise<Response>)=>Promise<unknown>,fetch:(...args:unknown[])=>Promise<unknown>,pending=new Set<Promise<unknown>>()) {
  const source=readFileSync(new URL("../../../support/calendar-feed-atdd.ts",import.meta.url),"utf8").replaceAll("\r\n","\n");
  const start="    http: (url,options={}) =>",end="    trustedFetch:";
  assert.equal(source.split(start).length,2);assert.equal(source.split(end).length,2);
  const trackStart="  function track<T>(request: Promise<T>): Promise<T> {",trackEnd="  const fixture: BoundFixture =";
  assert.equal(source.split(trackStart).length,2);assert.equal(source.split(trackEnd).length,2);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  return new Function("pendingRequests","testOrigin","fetch","calendarOrdinaryResponse",strip(source.slice(source.indexOf(trackStart),source.indexOf(trackEnd)))+"\nreturn "+strip(`({${source.slice(source.indexOf(start),source.indexOf(end))}}).http`))(
    pending,()=>"https://example.invalid",fetch,response) as (url:string,options?:unknown)=>Promise<unknown>;
}

// The actual public function is evaluated with fixed in-memory dependencies;
// this proves its status erasure and the existing dependency wiring, not HTTP/SQL.
function actualPublicFeed() {
  return actualFeedRegion("../../../../src/server/calendar-feed/public-feed.ts","export async function publicCalendarFeed",undefined,"publicCalendarFeed",{
    feedKeyFromEnv:()=>({keyId:"fixed",secret:"fixed"}),resolveTrustedFeedIp:()=>null,feedPlatformIpTrustEnabled:()=>false,
    isCalendarFeedToken:()=>true,hashFeedToken:()=>"fixed",hashFeedIp:()=>"fixed",FEED_SCHEMA:"fixed",FETCH_DOMAIN:"fixed",randomUUID:()=>"fixed",signFeedProof:()=>"fixed",
    createSupabasePublicClient:()=>{throw Error("Unexpected client creation");},reply:(status:number,body:string)=>new Response(body,{status}),eventsFromResult:()=>[],encodeCalendarFeed:()=>"fixed"
  }) as (raw:string,headers:Headers,dependencies:unknown)=>Promise<Response>;
}

test("actual clock scope retains caught HTTP rejection after tracked promise removal and refuses restoration and later shared seams",async()=>{
  const f=await actualCalendarOwner(),pending=new Set<Promise<unknown>>(),fx={pendingRequests:pending,workClosed:false};
  const http=actualHttpPort(f.api.calendarOrdinaryResponse,async()=>{throw Error("PRIVATE transport");},pending),serial=await f.api.calendarSerialControls(fx);
  let caught=false;await assert.rejects(serial.withDatabaseTime("2026-10-20T12:00:00Z",async()=>{await http("https://example.invalid/feed").catch(()=>{caught=true;});assert.equal(pending.size,0);return "caught";}));
  assert.equal(caught,true);assert.ok(f.api.getCustody());assert.equal(f.api.calendarOwnedStates.size,1);assert.equal(f.calls.filter(x=>x==="replace").length,1);
  const before=f.calls.length;await assert.rejects(f.api.calendarRestore("clock"));await assert.rejects(f.api.calendarPublish("clock",()=>"later"));assert.equal(f.calls.length,before);await f.factory.pool()?.end();
});

test("actual body abort or non-server status retains custody but completed HTTP 503 restores the clock",async()=>{
  for(const kind of ["body","status","completed"]){const f=await actualCalendarOwner(),pending=new Set<Promise<unknown>>(),fx={pendingRequests:pending,workClosed:false};
    const response=kind==="body"?{status:200,headers:new Headers(),text:async()=>{throw Error("PRIVATE abort");}}:kind==="status"?{status:0}:new Response("completed",{status:503});
    const http=actualHttpPort(f.api.calendarOrdinaryResponse,async()=>response,pending),serial=await f.api.calendarSerialControls(fx);
    const run=serial.withDatabaseTime("2026-10-20T12:00:00Z",async()=>http("https://example.invalid/feed").catch(()=>"caught"));
    if(kind==="completed"){assert.deepEqual(await run,{status:503,headers:{"content-type":"text/plain;charset=UTF-8"},body:"completed"});assert.equal(f.api.getCustody(),null);assert.deepEqual(f.row(),f.canonical);assert.equal(f.calls.filter(x=>x==="replace").length,2);}
    else{await assert.rejects(run);assert.ok(f.api.getCustody());assert.equal(f.calls.filter(x=>x==="replace").length,1);}await f.factory.pool()?.end();
  }
});

test("closed fetch port invokes the same receiver and arguments once and preserves result and rejection identity",async()=>{
  const f=await actualCalendarOwner(),args={fixed:true},value={data:null,error:{fixed:true},status:403};let calls=0;
  const anon={rpc(name:string,input:Record<string,unknown>){assert.equal(this,anon);assert.equal(name,"fetch_calendar_feed");assert.equal(input,args);calls++;return Promise.resolve(value);}};
  assert.equal(await f.api.calendarFetchPort(anon).rpc("fetch_calendar_feed",args),value);assert.equal(calls,1);assert.equal(f.api.getCustody(),null);
  const rejection={},g=await actualCalendarOwner(),rejecting={rpc(){return Promise.reject(rejection);}};
  assert.equal(await g.api.calendarFetchPort(rejecting).rpc("fetch_calendar_feed",args).catch(error=>error),rejection);assert.ok(g.api.getCustody());await f.factory.pool()?.end();await g.factory.pool()?.end();
});

test("installed Postgrest status zero is latched before actual public 503 erasure and blocks clock restoration",async()=>{
  const require=nodeModule.createRequire(import.meta.url),supabaseRequire=nodeModule.createRequire(require.resolve("@supabase/supabase-js"));
  const {PostgrestClient}=supabaseRequire("@supabase/postgrest-js");let requests=0;
  const anon=new PostgrestClient("https://example.invalid/rest/v1",{fetch:async()=>{requests++;throw Error("PRIVATE transport");}});
  const f=await actualCalendarOwner(),serial=await f.api.calendarSerialControls({pendingRequests:new Set(),workClosed:false}),publicFeed=actualPublicFeed();
  await assert.rejects(serial.withDatabaseTime("2026-10-20T12:00:00Z",async()=>{const source=readFileSync(new URL("../../../support/calendar-feed-atdd.ts",import.meta.url),"utf8").replaceAll("\r\n","\n"),start="    trustedFetch:",end="    physical:";
    assert.equal(source.split(start).length,2);assert.equal(source.split(end).length,2);
    const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
    const trusted=new Function("track","calendarOrdinaryResponse","publicCalendarFeed","calendarFetchPort","anon","return "+strip(`({${source.slice(source.indexOf(start),source.indexOf(end))}}).trustedFetch`))((value:unknown)=>value,f.api.calendarOrdinaryResponse,publicFeed,f.api.calendarFetchPort,anon);
    const response=await trusted("https://example.invalid/calendar/feed/opaque",null);assert.equal(response.status,503);return response;}));
  assert.equal(requests,1);assert.ok(f.api.getCustody());assert.equal(f.calls.filter(x=>x==="replace").length,1);await f.factory.pool()?.end();
});

test("completed RPC denial and server errors remain healthy despite actual public 503 mapping",async()=>{
  for(const status of [400,403,500,503]){const f=await actualCalendarOwner(),serial=await f.api.calendarSerialControls({pendingRequests:new Set(),workClosed:false}),value={status,data:null,error:{fixed:true}};let calls=0;
    const response=await serial.withDatabaseTime("2026-10-20T12:00:00Z",()=>actualPublicFeed()("opaque",new Headers(),{client:f.api.calendarFetchPort({rpc:async()=>{calls++;return value;}}),trustedIp:null}));
    assert.equal(calls,1);assert.equal(response.status,503);assert.equal(f.api.getCustody(),null);assert.deepEqual(f.row(),f.canonical);await f.factory.pool()?.end();
  }
});

test("closed fetch status validation latches missing malformed accessor proxy and status-zero results without reading payload getters",async()=>{
  let reads=0;const accessor=Object.defineProperty({data:null,error:null},"status",{get(){reads++;throw Error("PRIVATE");}}),proxy=new Proxy({}, {getOwnPropertyDescriptor(){throw Error("PRIVATE");},get(_target,key){if(key==="then")return undefined;reads++;throw Error("PRIVATE");}});
  for(const result of [{status:0},{status:NaN},{status:"200"},{status:600},{},accessor,proxy]){const f=await actualCalendarOwner();assert.equal(await f.api.calendarFetchPort({rpc:async()=>result}).rpc("fetch_calendar_feed",{}),result);assert.ok(f.api.getCustody());await f.factory.pool()?.end();}
  assert.equal(reads,0);const f=await actualCalendarOwner();let calls=0;await assert.rejects(f.api.calendarFetchPort({rpc:async()=>{calls++;return{};}}).rpc("unrelated",{}));assert.equal(calls,0);assert.ok(f.api.getCustody());await f.factory.pool()?.end();
});


function actualNudgeOuter(mode:"healthy"|"before"|"clients"|"inner"|"both"|"override"|"after"="healthy",sink?:(line:string)=>void) {
  const events:string[]=[],lines:string[]=[],inner=Object.defineProperty({},"cause",{get(){throw Error("PRIVATE getter");}}),outer={fixed:"outer"},cleanup={fixed:"cleanup"};
  const user=(id:string)=>({id}),fx={base:{tenantA:{id:"owned"},adminA:user("admin"),adminB:user("foreign"),orphanUser:user("orphan")},users:{projektledare:user("planner"),montor:user("own"),saljare:user("seller"),ekonomi:user("economy")},roleUnionUser:user("mixed"),invitedUser:user("invited"),disabledUser:user("disabled"),tenantIds:["owned"],adminClient:{reused:"admin"},plannerClient:{reused:"planner"},montorClient:{reused:"own"},foreignClient:{reused:"foreign"}};
  const api=actualFeedRegion("../../../support/time-reports-atdd.ts","function throwFixtureFailures","export async function setRoles","({withTimeReportFixture,createNudgeFailureLabels,throwFixtureFailures})",{
    withBookingFixture:async(run:(fx:unknown)=>Promise<void>)=>{events.push("booking");if(mode==="before")throw outer;try{await run(fx);}finally{events.push("outer-cleanup");if(mode==="override"||mode==="after")throw outer;}},
    makeAuthedServerClient:async(value:{id:string})=>{events.push("client:"+value.id);if(mode==="clients"&&value.id==="seller")throw inner;return{user:value};},
    cleanupOwnedTimeReports:async(value:unknown)=>{assert.equal(value,fx.tenantIds);events.push("report-cleanup");if(mode==="both")throw cleanup;}
  }) as {throwFixtureFailures:(primary:{error:unknown}|undefined,errors:unknown[],message:string)=>void;withTimeReportFixture:(run:(value:Record<string,unknown>)=>Promise<void>,labels?:unknown)=>Promise<void>;createNudgeFailureLabels:(sink?:(line:string)=>void)=>{at(site:string):void;failure(boundary?:string):void}};
  const labels=api.createNudgeFailureLabels(sink??(line=>lines.push(line)));
  const callback=async(value:Record<string,unknown>)=>{events.push("callback");assert.equal(value.base,fx.base);const clients=value.clients as Record<string,unknown>;assert.equal(clients.admin,fx.adminClient);assert.equal(clients.foreign,fx.foreignClient);if(["inner","both","override"].includes(mode))throw inner;};
  return{api,labels,events,lines,inner,outer,cleanup,callback,fx};
}

test("actual opted-in outer nudge boundary distinguishes opaque before and after callback without changing final identity",async()=>{
  for(const mode of ["before","after","override"] as const){const f=actualNudgeOuter(mode);const result=await f.api.withTimeReportFixture(f.callback,f.labels).catch(error=>error);assert.equal(result,f.outer);
    assert.ok(f.lines.some(line=>line.includes(mode==="before"?"OPAQUE_OUTER_BEFORE_CALLBACK_UNKNOWN":mode==="after"?"OPAQUE_OUTER_AFTER_CALLBACK_UNKNOWN":"DIFFERENT_FROM_OBSERVED_INNER")));
    if(mode==="before"){assert.deepEqual(f.events,["booking"]);assert.ok(f.lines.every(line=>line.includes("clients=NOT_STARTED")));}
    else{assert.ok(f.events.indexOf("report-cleanup")<f.events.indexOf("outer-cleanup"));}
  }
});

test("actual nudge clients callback and cleanup failures retain original precedence cause and operation order",async()=>{
  for(const mode of ["clients","inner","both"] as const){const f=actualNudgeOuter(mode);const result=await f.api.withTimeReportFixture(f.callback,f.labels).catch(error=>error);
    if(mode==="both"){assert.ok(result instanceof AggregateError);assert.equal(result.cause,f.inner);assert.equal(result.errors[0],f.inner);assert.equal(result.errors[1],f.cleanup);}
    else assert.equal(result,f.inner);
    assert.equal(f.events.filter(event=>event.startsWith("client:")).length,6);assert.equal(f.events.filter(event=>event==="outer-cleanup").length,1);
    if(mode==="clients"){assert.ok(!f.events.includes("callback"));assert.ok(!f.events.includes("report-cleanup"));assert.ok(f.lines.some(line=>line.includes("clients=REJECTED")));}
    else{assert.equal(f.events.filter(event=>event==="callback").length,1);assert.equal(f.events.filter(event=>event==="report-cleanup").length,1);assert.ok(f.lines.some(line=>line.includes("site=report-callback")&&line.includes("report=REJECTED")));}
  }
});

test("actual nudge labels are healthy/default silent and sink failures cannot mask original failures or touch hostile properties",async()=>{
  const healthy=actualNudgeOuter();await healthy.api.withTimeReportFixture(healthy.callback,healthy.labels);assert.deepEqual(healthy.lines,[]);
  const normal=actualNudgeOuter("inner");assert.equal(await normal.api.withTimeReportFixture(normal.callback).catch(error=>error),normal.inner);assert.deepEqual(normal.lines,[]);
  const sink=actualNudgeOuter("override",()=>{throw Error("PRIVATE sink");});assert.equal(await sink.api.withTimeReportFixture(sink.callback,sink.labels).catch(error=>error),sink.outer);
  const bounded=actualNudgeOuter();for(let i=0;i<40;i++)bounded.labels.failure();assert.equal(bounded.lines.length,16);assert.ok(bounded.lines.at(-1)?.includes("UNKNOWN"));assert.ok(bounded.lines.every(line=>Buffer.byteLength(line)<=512&&!line.includes("PRIVATE")));
});

test("actual enclosing NUDGE004 final catch preserves its final error and emits fixed test boundary",async()=>{
  const f=actualNudgeOuter(),source=readFileSync(new URL("../../../integration/notifications/time-report-nudge-producer.int.test.ts",import.meta.url),"utf8").replaceAll("\r\n","\n");
  const start=source.indexOf('  test("[P0] 15.4-NUDGE-004'),end=source.indexOf('  test("[P0] 15.4-NUDGE-005',start);assert.ok(start>0&&end>start);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;let run!:(context:{task:{meta:object}})=>Promise<void>;
  new Function("test","createNudgeFailureLabels","createNudgeTaskMetaSink","withTimeReportFixture",strip(source.slice(start,end)))((_name:string,callback:()=>Promise<void>)=>{run=callback;},()=>f.labels,actualNudgeMetaSink(),async()=>{throw f.outer;});
  assert.equal(await run({task:{meta:{}}}).catch(error=>error),f.outer);assert.ok(f.lines.some(line=>line.includes("site=test-boundary boundary=TEST_FINAL")));
});

function nudgeRecipientControl(fail=false) {
  const f=actualNudgeOuter(),events:string[]=[],users=Array.from({length:3},(_,i)=>({id:"user"+i}));let batches=0,bookings=0;
  const run=actualFeedRegion("../../../support/time-reports-atdd.ts","export async function withNudgeRecipients",undefined,"withNudgeRecipients",{
    crypto:{randomUUID:()=>"fixed"},seedRoleAwarePhaseAUsers:async(base:unknown)=>{assert.equal(base,f.fx.base);batches++;return{extraUsers:users,users:{projektledare:users[0],montor:users[1]},roleUnionUser:users[2]};},
    adminQuery:async(sql:string)=>{events.push(sql.startsWith("insert")?"profile":"delete");return[];},seedReportBooking:async(value:unknown)=>{assert.equal(value,f.fx);bookings++;return"booking";},cleanupOwnedTimeReports:async()=>{events.push("reports");if(fail)throw f.cleanup;},deleteAuthUser:async()=>{events.push("auth");},throwFixtureFailures:f.api.throwFixtureFailures
  }) as (fx:unknown,run:(recipients:unknown[])=>Promise<void>,labels?:unknown)=>Promise<void>;
  return{f,events,run,counts:()=>({batches,bookings})};
}

test("actual labelled recipient composition keeps all27 recipients nine seeds and original ordered cleanup",async()=>{
  const x=nudgeRecipientControl();let calls=0;await x.run(x.f.fx,async recipients=>{calls++;assert.equal(recipients.length,27);x.events.push("callback");},x.f.labels);
  assert.equal(calls,1);assert.deepEqual(x.counts(),{batches:9,bookings:27});assert.deepEqual(x.f.lines,[]);assert.equal(x.events.filter(x=>x==="profile").length,27);assert.equal(x.events.filter(x=>x==="auth").length,27);assert.ok(x.events.indexOf("callback")<x.events.indexOf("reports"));assert.ok(x.events.indexOf("reports")<x.events.indexOf("delete"));assert.ok(x.events.indexOf("delete")<x.events.indexOf("auth"));
});

async function labelledBrowserControl(sink?:(line:string)=>void) {
  const seams=await actualBrowserSeams(),lines:string[]=[],labels=seams.createCalendarFailureLabels(sink??(line=>lines.push(line))),registry=seams.createCalendarLifecycleObservations({settlementTimeoutMs:5,labels}),events=new EventEmitter();
  const observe=(action:"create"|"rotate"|"revoke",options:{readback?:()=>Promise<unknown>;completion?:()=>Promise<boolean>;noCompletion?:boolean;requestPredicate?:(value:unknown)=>boolean}={})=>{
    const label=labels.register(action),wait=(field:"request"|"response")=>seams.calendarEventWaiter({subscribe:listener=>{events.on(action+field,listener);},unsubscribe:listener=>{events.off(action+field,listener);},predicate:field==="request"?(options.requestPredicate??(()=>true)):()=>true,stage:field==="request"?"action-request":"action-response",timeoutMs:1000,label:state=>label?.set(field,state)});
    const result=registry.observe({label,request:()=>wait("request"),response:()=>wait("response"),readback:options.readback??(async()=>({fixed:true})),...(!options.noCompletion?{completion:options.completion??(async()=>true)}:{})});return result;
  };
  const match=(action:string)=>{events.emit(action+"request",{});events.emit(action+"response",{});};
  const report=()=>{labels.capture("PRE_CLEANUP");labels.capture("FINAL");labels.failure();labels.publish();};
  return{seams,lines,labels,registry,observe,match,events,report};
}

test("actual browser records keep successful create distinct from rotate native-pending and revoke not registered",async()=>{
  const x=await labelledBrowserControl(),first=x.observe("create");x.match("create");await first;
  let release!:(value:boolean)=>void;const completion=new Promise<boolean>(yes=>{release=yes;}),second=x.observe("rotate",{completion:()=>completion});x.match("rotate");await second;
  const unsettled=await x.registry.cancelAndSettle();assert.equal(unsettled.settled,false);x.report();
  assert.ok(x.lines.some(line=>line.includes("action=create ordinal=1")&&line.includes("completion=SETTLED_SUCCESS")&&line.includes("observation=SETTLED_SUCCESS")));
  assert.ok(x.lines.some(line=>line.includes("action=rotate ordinal=2")&&line.includes("completion=PENDING")));
  assert.ok(!x.lines.some(line=>line.includes("action=revoke")),"unregistered actions have no row, which is not backend absence proof");
  release(true);assert.equal((await x.registry.cancelAndSettle()).settled,true);
});

test("actual waiter labels distinguish matched response from failed or cancelled request and never-started work",async()=>{
  for(const failed of [false,true]){const x=await labelledBrowserControl(),pending=x.observe("create",{requestPredicate:()=>{if(failed)throw Error("PRIVATE predicate");return true;}});x.events.emit("createresponse",{});if(failed)x.events.emit("createrequest",{});const settled=x.registry.cancelAndSettle();await assert.rejects(pending);assert.equal((await settled).settled,false);x.report();
    assert.ok(x.lines.some(line=>line.includes("action=create")&&line.includes("response=MATCHED")&&line.includes(failed?"request=SETTLED_FAILURE":"request=CANCELLED")&&line.includes("readback=NOT_STARTED")&&line.includes("completion=NOT_STARTED")));
  }
});

test("actual browser readback failure native failure and optional completion have independent terminal states",async()=>{
  const read=await labelledBrowserControl(),bad=read.observe("create",{readback:async()=>{throw Error("PRIVATE SQL");}});read.match("create");await assert.rejects(bad);await read.registry.cancelAndSettle();read.report();assert.ok(read.lines.some(line=>line.includes("readback=SETTLED_FAILURE")));
  const native=await labelledBrowserControl(),good=native.observe("create",{completion:async()=>false});native.match("create");await good;assert.equal((await native.registry.cancelAndSettle()).settled,false);native.report();assert.ok(native.lines.some(line=>line.includes("readback=SETTLED_SUCCESS")&&line.includes("completion=SETTLED_FAILURE")&&line.includes("observation=SETTLED_SUCCESS")));
  const optional=await labelledBrowserControl(),done=optional.observe("create",{noCompletion:true});optional.match("create");await done;assert.equal((await optional.registry.cancelAndSettle()).settled,true);assert.equal(optional.lines.length,0);optional.report();assert.ok(optional.lines.some(line=>line.includes("completion=NOT_APPLICABLE")));
});

test("actual concurrent browser records preserve pending readback and post-cancel observation separately",async()=>{
  const x=await labelledBrowserControl();let release!:(value:unknown)=>void;const held=new Promise(yes=>{release=yes;}),first=x.observe("create",{readback:()=>held}),second=x.observe("rotate");x.match("create");x.match("rotate");await second;
  assert.equal((await x.registry.cancelAndSettle()).settled,false);x.labels.capture("PRE_CLEANUP");release({fixed:true});await assert.rejects(first);await x.registry.cancelAndSettle();x.labels.capture("FINAL");x.labels.failure();x.labels.publish();assert.ok(x.lines.some(line=>line.includes("snapshot=PRE_CLEANUP")&&line.includes("readback=PENDING")));assert.ok(x.lines.some(line=>line.includes("action=create")&&line.includes("readback=SETTLED_SUCCESS")&&line.includes("observation=CANCELLED")));
});

test("actual label budgets sink failures and invalid registration never affect lifecycle behavior or expose payload getters",async()=>{
  const x=await labelledBrowserControl(()=>{throw Error("PRIVATE sink");}),done=x.observe("create");x.match("create");assert.deepEqual(await done,{fixed:true});assert.equal((await x.registry.cancelAndSettle()).settled,true);
  const bad=await labelledBrowserControl(()=>{throw Error("PRIVATE sink");}),safe=bad.seams.calendarBrowserDiagnostic("action-readback",{}),failed=bad.observe("create",{readback:async()=>{throw safe;}});bad.match("create");assert.equal(await failed.catch(error=>error),safe);await bad.registry.cancelAndSettle();
  const y=await labelledBrowserControl();y.labels.register("create");y.labels.register("create");for(let i=0;i<20;i++){y.labels.capture("PRE_CLEANUP");y.labels.capture("FINAL");y.labels.failure();}y.labels.publish();assert.equal(y.lines.length,2);assert.ok(y.lines.every(line=>line.includes("UNKNOWN")&&Buffer.byteLength(line)<=512));assert.ok(Buffer.byteLength(y.lines.join("\n"))<8192);
});

test("label instrumentation preserves actual promise observer timer operation counts and default silent waiters",async()=>{
  // Independently captured from 166cad1c21f423b96c815a3f5b34d2fb81bc28bf:
  // tests/e2e/support/calendar-feed-atdd.ts blob e0517e8c3e11a4bf9052a920a14e65356a234156.
  // Runtime Git history is unavailable in shallow CI checkouts and nonportable worktrees.
  const baseline=[7,8,6,5,14,2],patterns=[/\.then\(/g,/\.catch\(/g,/new Promise/g,/setTimeout\(/g,/adminQuery[<(]/g,/\.rpc\(/g];
  const counts=(source:string)=>patterns.map(pattern=>(source.match(pattern)??[]).length);
  const after=readFileSync(new URL("../../../e2e/support/calendar-feed-atdd.ts",import.meta.url),"utf8");
  const ownedContinuation="void promise.then(()=>work.delete(promise),()=>{invalid=true;work.delete(promise);});";
  assert.equal(after.split(ownedContinuation).length-1,1);
  // Exact admitted protocol ownership delta only; all six historical operation
  // dimensions remain guarded after removing that one immediately owned observer.
  const priorOperations=after.replace(ownedContinuation,"");
  assert.deepEqual(counts(priorOperations),baseline);
  for(const extra of [".then(",".catch(","new Promise","setTimeout(","adminQuery<",".rpc("]){
    assert.throws(()=>assert.deepEqual(counts(priorOperations+extra),baseline));
  }
  const x=await labelledBrowserControl(),done=x.observe("create");x.match("create");await done;await x.registry.cancelAndSettle();assert.deepEqual(x.lines,[]);
});

test("installed Node test runner receives only fixed bounded source labels from actual source with original failure preserved",async()=>{
  const {spawnSync}=await import("node:child_process"),source=readFileSync(new URL("../../../support/time-reports-atdd.ts",import.meta.url),"utf8"),start=source.indexOf("export const nudgeFailureSites"),end=source.indexOf("export async function withTimeReportFixture");assert.ok(start>0&&end>start);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const script="import {test} from 'node:test';\n"+strip(source.slice(start,end))+"\ntest('fixed source boundary',()=>{const original=Error('FIXED_ORIGINAL');try{throw original;}catch(error){createNudgeFailureLabels().failure();if(error!==original)throw Error('IDENTITY_CHANGED');throw error;}});";
  const result=spawnSync(process.execPath,["--input-type=module"],{input:script,encoding:"utf8",timeout:10000,env:{SystemRoot:process.env.SystemRoot,NODE_ENV:"test"}});
  assert.equal(result.status,1);assert.match(result.stderr,/calendar-source-label-v1 case=NUDGE004/);assert.match(result.stdout,/FIXED_ORIGINAL/);assert.ok(!result.stderr.includes("PRIVATE"));
});


test("actual recipient cleanup retains the callback and every reached cleanup error in original order",async()=>{
  const x=nudgeRecipientControl(true);let caught:unknown;try{await x.run(x.f.fx,async()=>{throw x.f.inner;},x.f.labels);}catch(error){caught=error;}
  assert.ok(caught instanceof AggregateError);assert.equal(caught.cause,x.f.inner);assert.deepEqual(caught.errors,[x.f.inner,x.f.cleanup]);assert.equal(x.events.filter(event=>event==="auth").length,27);assert.equal(x.events.filter(event=>event==="delete").length,3);assert.ok(x.f.lines.some(line=>line.includes("site=recipients-callback")));assert.ok(x.f.lines.some(line=>line.includes("site=cleanup-reports")));
});

test("actual labelled caller assertions match their frozen baseline and opt-in is restricted to NUDGE004 and exact three browser cases",async()=>{
  const ts=await import("typescript");
  // Ordered assertion AST text, normalized exactly as the original comparison, captured
  // independently from 166cad1c21f423b96c815a3f5b34d2fb81bc28bf (not current source).
  const baselines=[
    {path:"integration/notifications/time-report-nudge-producer.int.test.ts",blob:"ec7aa1b4036bc63fc0eb4a438faff4794de011ff",count:260,sha256:"6607e4720f23b6653d5d08f4e3157268949eafffb0cc2fe115b0931cfae67e78"},
    {path:"e2e/calendar-feed.e2e.spec.ts",blob:"2baa9ef0b2a74bf2ef9e573aa0b076987b7cc2cd",count:268,sha256:"25fffb090536cc2e1a4d269f7ab8298f6e096700b6dd7dd0466c7fb37a944a95"},
  ];
  for(const baseline of baselines){
    const after=readFileSync(new URL("../../../"+baseline.path,import.meta.url),"utf8");
    const assertions=(text:string)=>{const ast=ts.createSourceFile(baseline.path,text,ts.ScriptTarget.Latest,true),calls:string[]=[];const visit=(node:import("typescript").Node)=>{if(ts.isCallExpression(node)&&((ts.isIdentifier(node.expression)&&node.expression.text==="expect")||(ts.isPropertyAccessExpression(node.expression)&&/^(?:to|rejects|resolves)/.test(node.expression.name.text))))calls.push(node.getText(ast).replace(/\s+/g,""));ts.forEachChild(node,visit);};visit(ast);return calls;};
    const verify=(source:string)=>{const calls=assertions(source);assert.equal(calls.length,baseline.count);assert.equal(createHash("sha256").update(JSON.stringify(calls)).digest("hex"),baseline.sha256);};
    assert.match(baseline.blob,/^[a-f0-9]{40}$/);verify(after);
    const changed=after.replace("expect(","expect(false&&");assert.notEqual(changed,after);assert.throws(()=>verify(changed));
    assert.throws(()=>verify(after+"\nexpect(false).toBe(true);"));
    if(baseline.path.includes("nudge"))assert.equal((after.match(/const labels=createNudgeFailureLabels\(createNudgeTaskMetaSink\(task\.meta\)\)/g)??[]).length,1);
    else{assert.equal((after.match(/createCalendarFailureLabels\(/g)??[]).length,3);assert.ok(after.includes('competingAction==="revoke"?createCalendarFailureLabels(undefined,"E2E010-revoke"):undefined'));for(const name of ["E2E001","E2E007"])assert.ok(after.includes('createCalendarFailureLabels(undefined,"'+name+'")'));}
  }
});


test("actual labelled browser observation preserves receiver arguments result and safe failure identity once",async()=>{
  const seams=await actualBrowserSeams(),labels=seams.createCalendarFailureLabels(()=>{throw Error("PRIVATE sink");}),registry=seams.createCalendarLifecycleObservations({labels,settlementTimeoutMs:5}),events=new EventEmitter(),matched={},result={fixed:true};let readbacks=0,completions=0;
  const label=labels.register("create"),wait=(field:"request"|"response")=>seams.calendarEventWaiter({subscribe:listener=>{events.on(field,listener);},unsubscribe:listener=>{events.off(field,listener);},predicate:value=>value===matched,stage:field==="request"?"action-request":"action-response",timeoutMs:1000,label:state=>label?.set(field,state)});
  const input={label,request:()=>wait("request"),response:()=>wait("response"),async readback(request:unknown,signal:AbortSignal){assert.equal(this,input);assert.equal(request,matched);assert.ok(signal instanceof AbortSignal);readbacks++;return result;},async completion(request:unknown){assert.equal(this,input);assert.equal(request,matched);completions++;return true;}};
  const actual=registry.observe(input);events.emit("request",matched);events.emit("response",matched);assert.equal(await actual,result);assert.equal((await registry.cancelAndSettle()).settled,true);assert.equal(readbacks,1);assert.equal(completions,1);
  const g=await labelledBrowserControl(),safe=g.seams.calendarBrowserDiagnostic("action-readback",{}),bad=g.observe("create",{readback:async()=>{throw safe;}});g.match("create");assert.equal(await bad.catch(error=>error),safe);await g.registry.cancelAndSettle();
});


test("SOURCE-LABEL-01 actual helper and enclosing NUDGE004 catch preserve same different and genuinely absent final relations",async()=>{
  const source=readFileSync(new URL("../../../integration/notifications/time-report-nudge-producer.int.test.ts",import.meta.url),"utf8").replaceAll("\r\n","\n"),start=source.indexOf('  test("[P0] 15.4-NUDGE-004'),end=source.indexOf('  test("[P0] 15.4-NUDGE-005',start);assert.ok(start>0&&end>start);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  for(const mode of ["clients","override","before","after"] as const){const f=actualNudgeOuter(mode);let run!:(context:{task:{meta:object}})=>Promise<void>,ordinaryCalls=0;
    new Function("test","createNudgeFailureLabels","createNudgeTaskMetaSink","withTimeReportFixture","withNudgeRecipients",strip(source.slice(start,end)))((_name:string,callback:()=>Promise<void>)=>{run=callback;},()=>f.labels,actualNudgeMetaSink(),
      (callback:(fx:Record<string,unknown>)=>Promise<void>,labels:unknown)=>f.api.withTimeReportFixture(callback,labels),
      async(fx:Record<string,unknown>,_callback:unknown,labels:unknown)=>{ordinaryCalls++;assert.equal(fx.base,f.fx.base);assert.equal(labels,f.labels);if(mode==="override")throw f.inner;});
    const final=await run({task:{meta:{}}}).catch(error=>error);assert.equal(final,mode==="clients"?f.inner:f.outer);
    const expected=mode==="clients"?"SAME_AS_OBSERVED_INNER":mode==="override"?"DIFFERENT_FROM_OBSERVED_INNER":"NO_INNER_OBSERVED";
    const finalLine=f.lines.find(line=>line.includes("boundary=TEST_FINAL"));assert.ok(finalLine);assert.ok(finalLine.includes("final_identity_relation="+expected));
    const outerLines=f.lines.filter(line=>line.includes("boundary=OPAQUE_OUTER_"));assert.ok(outerLines.length);assert.ok(outerLines.at(-1)?.includes("final_identity_relation="+expected));
    for(const line of f.lines.filter(line=>line.includes("boundary=LOCAL")))assert.ok(line.includes("final_identity_relation=UNKNOWN"));
    if(mode==="clients"||mode==="before"){assert.equal(ordinaryCalls,0);assert.ok(!f.events.includes("report-cleanup"));}
    else{assert.equal(ordinaryCalls,1);assert.equal(f.events.filter(event=>event==="report-cleanup").length,1);assert.ok(f.events.indexOf("report-cleanup")<f.events.indexOf("outer-cleanup"));}
    assert.ok(f.lines.every(line=>Buffer.byteLength(line)<=512&&!line.includes("PRIVATE")));
  }
});

test("SOURCE-LABEL-01 local and unestablished test-final snapshots stay unknown while sink failure preserves original final error",async()=>{
  const f=actualNudgeOuter();f.labels.failure();f.labels.failure("TEST_FINAL");assert.ok(f.lines.every(line=>line.includes("final_identity_relation=UNKNOWN")));assert.ok(!f.lines.some(line=>line.includes("NO_INNER_OBSERVED")));
  const source=readFileSync(new URL("../../../integration/notifications/time-report-nudge-producer.int.test.ts",import.meta.url),"utf8"),start=source.indexOf('  test("[P0] 15.4-NUDGE-004'),end=source.indexOf('  test("[P0] 15.4-NUDGE-005',start),strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const throwing=actualNudgeOuter("clients",()=>{throw Error("PRIVATE sink");});let run!:(context:{task:{meta:object}})=>Promise<void>;
  new Function("test","createNudgeFailureLabels","createNudgeTaskMetaSink","withTimeReportFixture",strip(source.slice(start,end)))((_name:string,callback:()=>Promise<void>)=>{run=callback;},()=>throwing.labels,actualNudgeMetaSink(),(callback:(fx:Record<string,unknown>)=>Promise<void>,labels:unknown)=>throwing.api.withTimeReportFixture(callback,labels));
  assert.equal(await run({task:{meta:{}}}).catch(error=>error),throwing.inner);assert.equal(throwing.events.filter(event=>event==="outer-cleanup").length,1);
});


function actualNudgeMetaSink() {
  const sites=actualFeedRegion("../../../support/time-reports-atdd.ts","export const nudgeFailureSites","export async function withTimeReportFixture","nudgeFailureSites",{});
  return actualFeedRegion("../../../integration/notifications/time-report-nudge-producer.int.test.ts","export function createNudgeTaskMetaSink","const asOf =","createNudgeTaskMetaSink",{nudgeFailureSites:sites}) as (meta:object)=>(line:unknown)=>void;
}

async function actualMetaJsonReport(meta:object) {
  const {JsonReporter}=await import("vitest/node"),reporter=new JsonReporter({}),output:string[]=[];
  // Actual installed public reporter, real onTestRunEnd. Only the output method
  // is replaced; no app/runner collection/setup/output file is started.
  reporter.onInit({config:{},snapshot:{summary:{}},logger:{log(){throw Error("Unexpected output path");},warn(){throw Error("Unexpected running task");}}} as never);
  Object.assign(reporter,{writeReport:async(value:string)=>{output.push(value);}});
  const file={type:"suite",name:"closed metadata transport",filepath:"fixed-nudge-control.test.ts",mode:"run",result:{state:"fail"},tasks:[] as unknown[]};
  file.tasks.push({type:"test",name:"[P0] 15.4-NUDGE-004",suite:file,mode:"run",meta,result:{state:"fail",errors:[]}});
  await reporter.onTestRunEnd([{task:file}] as never);assert.equal(output.length,1);
  return JSON.parse(output[0]) as {numFailedTests:number;testResults:{assertionResults:{title:string;meta:Record<string,unknown>}[]}[]};
}

function actualMetaNudge(mode:Parameters<typeof actualNudgeOuter>[0]="clients") {
  const f=actualNudgeOuter(mode),meta:Record<string,unknown>={},lines:string[]=[];
  const source=readFileSync(new URL("../../../integration/notifications/time-report-nudge-producer.int.test.ts",import.meta.url),"utf8"),start=source.indexOf('  test("[P0] 15.4-NUDGE-004'),end=source.indexOf('  test("[P0] 15.4-NUDGE-005',start);assert.ok(start>0&&end>start);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  let run!:(context:{task:{meta:object}})=>Promise<void>,bodyCalls=0;
  new Function("test","createNudgeFailureLabels","createNudgeTaskMetaSink","withTimeReportFixture","withNudgeRecipients",strip(source.slice(start,end)))((_name:string,callback:typeof run)=>{run=callback;},
    (injected:(line:string)=>void)=>f.api.createNudgeFailureLabels(line=>{lines.push(line);injected(line);}),actualNudgeMetaSink(),
    (callback:(fx:Record<string,unknown>)=>Promise<void>,opt:unknown)=>f.api.withTimeReportFixture(callback,opt),
    async(fx:Record<string,unknown>)=>{bodyCalls++;assert.equal(fx.base,f.fx.base);if(mode==="override")throw f.inner;});
  return{...f,meta,lines,run:()=>run({task:{meta}}),bodyCalls:()=>bodyCalls};
}

test("VITEST-META actual helper and public NUDGE callback carry stable final relations through the real installed JsonReporter",async()=>{
  for(const mode of ["before","after","clients","override"] as const){const f=actualMetaNudge(mode),actual=await f.run().catch(error=>error);assert.equal(actual,mode==="clients"?f.inner:f.outer);
    const report=await actualMetaJsonReport(f.meta),assertion=report.testResults[0].assertionResults[0];assert.equal(report.numFailedTests,1);assert.equal(assertion.title,"[P0] 15.4-NUDGE-004");assert.ok(Object.hasOwn(assertion.meta,"calendarSourceLabelsV1"));assert.deepEqual(assertion.meta.calendarSourceLabelsV1,f.lines);
    const relation=mode==="clients"?"SAME_AS_OBSERVED_INNER":mode==="override"?"DIFFERENT_FROM_OBSERVED_INNER":"NO_INNER_OBSERVED";
    assert.ok(f.lines.at(-1)?.includes("boundary=TEST_FINAL")&&f.lines.at(-1)?.includes("final_identity_relation="+relation));assert.equal(f.bodyCalls(),mode==="clients"||mode==="before"?0:1);
    if(mode!=="before")assert.equal(f.events.filter(event=>event==="outer-cleanup").length,1);
  }
});

test("VITEST-META strict carrier excludes nonprimitive secret unknown field enum schema prototype accessor and oversize inputs from reporter publication",async()=>{
  const f=actualMetaNudge("before");await f.run().catch(()=>{});const valid=f.lines[0];assert.ok(valid);
  let getters=0;const hostile=Object.defineProperty({},"toString",{get(){getters++;throw Error("PRIVATE");}});
  const invalid:unknown[]=[hostile,Object(valid),null,{},valid+" PRIVATE",valid+"\n",valid.replace("case=NUDGE004","case=OTHER"),valid.replace("site=outer-await","site=private"),valid.replace("factory=UNKNOWN","factory=PRIVATE"),valid.replace("NO_INNER_OBSERVED","PRIVATE"),valid.replace("clients=NOT_STARTED","clients=PRIVATE"),valid.replace("booking_entered=false","booking_entered=PRIVATE")," ".repeat(513),valid+" key=PRIVATE",valid.replace("boundary=OPAQUE_OUTER_BEFORE_CALLBACK_UNKNOWN","boundary=LOCAL")];
  for(const value of invalid){const meta={};const sink=actualNudgeMetaSink()(meta);assert.doesNotThrow(()=>sink(value));assert.deepEqual(meta,{});const report=await actualMetaJsonReport(meta);assert.deepEqual(report.testResults[0].assertionResults[0].meta,{});assert.ok(!JSON.stringify(report).includes("PRIVATE"));}
  const proto=Object.create({foreign:true}),metaAccessor=Object.defineProperty({},"calendarSourceLabelsV1",{get(){getters++;throw Error("PRIVATE");}}),proxy=new Proxy({}, {getPrototypeOf(){throw Error("PRIVATE");}});
  for(const meta of [proto,metaAccessor,proxy])assert.doesNotThrow(()=>actualNudgeMetaSink()(meta)(valid));assert.equal(getters,0);
});

test("VITEST-META reserves its own frozen arrays preserves other metadata and refuses preexisting or replaced foreign slots",async()=>{
  const f=actualMetaNudge("before");await f.run().catch(()=>{});const valid=f.lines[0],other={kept:true},meta:Record<string,unknown>={other},sink=actualNudgeMetaSink()(meta);sink(valid);const first=meta.calendarSourceLabelsV1;assert.ok(Object.isFrozen(first));sink(valid);assert.notEqual(meta.calendarSourceLabelsV1,first);assert.deepEqual(first,[valid]);assert.deepEqual(meta.calendarSourceLabelsV1,[valid,valid]);assert.equal(meta.other,other);
  const report=await actualMetaJsonReport(meta);assert.deepEqual(report.testResults[0].assertionResults[0].meta,{other:{kept:true},calendarSourceLabelsV1:[valid,valid]});
  const foreign={PRIVATE:"not owned"},occupied={calendarSourceLabelsV1:foreign,other};actualNudgeMetaSink()(occupied)(valid);assert.equal(occupied.calendarSourceLabelsV1,foreign);assert.equal(occupied.other,other);
  Object.defineProperty(meta,"calendarSourceLabelsV1",{value:foreign,configurable:true});sink(valid);assert.equal(meta.calendarSourceLabelsV1,foreign);
  // Refusal is not a generic sanitizer: preexisting foreign metadata is untouched,
  // and is deliberately not offered as a safe owned-publication reporter input.
});

test("VITEST-META healthy default budget and recording failures cannot change original fixture results or cleanup",async()=>{
  const healthy=actualMetaNudge("healthy");await healthy.run();assert.deepEqual(healthy.meta,{});assert.deepEqual(healthy.lines,[]);
  const bounded:Record<string,unknown>={},labels=actualNudgeOuter().api.createNudgeFailureLabels(actualNudgeMetaSink()(bounded));for(let i=0;i<40;i++)labels.failure();const values=bounded.calendarSourceLabelsV1 as string[];assert.equal(values.length,16);assert.ok(values.at(-1)?.includes("boundary=UNKNOWN"));assert.ok(values.every(line=>Buffer.byteLength(line)<=512));assert.ok(values.reduce((n,line)=>n+line.length,0)<=8192);assert.deepEqual((await actualMetaJsonReport(bounded)).testResults[0].assertionResults[0].meta.calendarSourceLabelsV1,values);
  const direct:Record<string,unknown>={},directSink=actualNudgeMetaSink()(direct);for(let i=0;i<20;i++)directSink(values[0]);assert.equal((direct.calendarSourceLabelsV1 as readonly string[]).length,16);
  const frozen=actualMetaNudge("clients");Object.freeze(frozen.meta);assert.equal(await frozen.run().catch(error=>error),frozen.inner);assert.ok(!Object.hasOwn(frozen.meta,"calendarSourceLabelsV1"));assert.equal(frozen.events.filter(event=>event==="outer-cleanup").length,1);
  const foreign=actualMetaNudge("override"),slot={notOwned:true};foreign.meta.calendarSourceLabelsV1=slot;assert.equal(await foreign.run().catch(error=>error),foreign.outer);assert.equal(foreign.meta.calendarSourceLabelsV1,slot);assert.ok(foreign.events.indexOf("report-cleanup")<foreign.events.indexOf("outer-cleanup"));
});


function actualBrowserReadback(label:{set(field:string,state:string):void},options:{matched:object;result:unknown;frontend?:string;failure?:unknown;terminal?:unknown;page?:unknown;onRead?:(request:object,signal:unknown)=>void}){
  const source=readFileSync(new URL("../../../e2e/support/calendar-feed-atdd.ts",import.meta.url),"utf8"),start=source.indexOf("readback: async (request, signal) => {"),end=source.indexOf("\n              },",start);assert.ok(start>0&&end>start);
  const expression=source.slice(start+"readback: ".length,end)+"\n}";
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  return new Function("calendarLabel","label","labelsByRequest","management","calendarRequestTerminalAtDrain","sourcePage","actionInput","committedAttempt","return ("+strip(expression)+");")(
    (run:()=>void)=>{try{run();}catch{/* same no-throw seam */}},label,new Map(),{frontendState:()=>options.frontend??"UNKNOWN"},options.terminal,options.page??{isClosed:()=>false},
    (request:object)=>{assert.equal(request,options.matched);return{action:"create",attemptId:"fixed",revision:0};},
    async(_input:unknown,signal:unknown,request:object)=>{options.onRead?.(request,signal);if(options.failure)throw options.failure;return options.result;}
  ) as (request:object,signal?:AbortSignal)=>Promise<{committed:true;snapshot:unknown}>;
}

test("browser committed readback preserves actual caller arguments errors and frontend facts without constructing finished promises",async()=>{
  const seams=await actualBrowserSeams();
  for(const state of ["SUCCESS","TERMINAL_FAILURE","UNKNOWN"]){
    const lines:string[]=[],labels=seams.createCalendarFailureLabels(line=>lines.push(line)),label=labels.register("create")!,request={},snapshot={},signal=new AbortController().signal;let calls=0;
    const run=actualBrowserReadback(label,{matched:request,result:snapshot,frontend:state,onRead(actual,actualSignal){assert.equal(actual,request);assert.equal(actualSignal,signal);calls++;}});
    const result=await run(request,signal);assert.equal(result.committed,true);assert.equal(result.snapshot,snapshot);assert.equal(calls,1);labels.capture("PRE_CLEANUP");labels.capture("FINAL");labels.failure();labels.publish();
    assert.ok(lines.every(line=>line.includes("completion="+(state==="SUCCESS"?"SETTLED_SUCCESS":state==="TERMINAL_FAILURE"?"SETTLED_FAILURE":"UNKNOWN"))));
  }
  const request={},original=Object.assign(Error("PRIVATE"),{cause:{}}),label=seams.createCalendarFailureLabels(()=>{}).register("create")!;
  await assert.rejects(actualBrowserReadback(label,{matched:request,result:{},failure:original})(request),error=>error===original);
  const source=readFileSync(new URL("../../../e2e/support/calendar-feed-atdd.ts",import.meta.url),"utf8");assert.ok(!source.includes("response.finished()"));assert.ok(!source.includes("completion: async request =>"));
});

test("browser v3 immutable pre-cleanup and final snapshots preserve mixed action and scenario states without early output",async()=>{
  const x=await labelledBrowserControl(),first=x.observe("create");x.match("create");await first;
  let release!:(value:boolean)=>void;const second=x.observe("rotate",{completion:()=>new Promise<boolean>(yes=>{release=yes;})});x.match("rotate");await second;
  x.labels.scenario("PENDING");x.labels.capture("PRE_CLEANUP");assert.equal(x.lines.length,0);release(false);await x.registry.cancelAndSettle();x.labels.scenario("SETTLED_FAILURE");x.labels.capture("FINAL");x.labels.failure();x.labels.publish();
  assert.equal(x.lines.length,4);assert.ok(x.lines.some(line=>line.includes("snapshot=PRE_CLEANUP")&&line.includes("action=rotate")&&line.includes("completion=PENDING")&&line.includes("scenario=PENDING")));
  assert.ok(x.lines.some(line=>line.includes("snapshot=FINAL")&&line.includes("action=rotate")&&line.includes("completion=SETTLED_FAILURE")&&line.includes("scenario=SETTLED_FAILURE")));
  assert.ok(!x.lines.some(line=>line.includes("action=revoke")));assert.ok(x.lines.some(line=>line.includes("action=create")&&line.includes("observation=SETTLED_SUCCESS")));
});

test("browser v3 closed producer rows match finite parser contract and exact 28 browser plus16 nudge cap without extra unknown rows",async()=>{
  const seams=await actualBrowserSeams(),all:string[]=[];
  const cases=[["E2E001",["create","rotate","revoke"]],["E2E007",["create","revoke"]],["E2E010-revoke",["create","revoke"]]] as const;
  for(const [name,actions] of cases)for(let attempt=0;attempt<2;attempt++){
    const lines:string[]=[],labels=seams.createCalendarFailureLabels(line=>lines.push(line),name);for(const action of actions)labels.register(action);labels.scenario("SETTLED_SUCCESS");labels.capture("PRE_CLEANUP");labels.capture("FINAL");labels.failure();labels.publish();labels.publish();
    assert.equal(lines.length,actions.length*2);assert.ok(lines.length<=16);all.push(...lines);
    for(const line of lines){assert.ok(/^[\x20-\x7e]{1,512}$/.test(line));const fields=Object.fromEntries(line.split(" ").slice(1).map(part=>part.split("=")));assert.deepEqual(Object.keys(fields),["case","snapshot","site","scenario","action","ordinal","registration","request","response","readback","completion","completionPhase","observation","terminalAtDrain"]);assert.equal(fields.case,name);assert.ok(["PRE_CLEANUP","FINAL"].includes(fields.snapshot!));assert.equal(fields.scenario,"SETTLED_SUCCESS");}
  }
  assert.equal(all.length,28);assert.equal(all.length+16,44);assert.ok(all.length+16<48);
  const none:string[]=[],empty=seams.createCalendarFailureLabels(line=>none.push(line),"E2E007");empty.capture("PRE_CLEANUP");empty.capture("FINAL");empty.failure();empty.publish();assert.equal(none.length,2);assert.ok(none.every(line=>line.includes("action=none ordinal=0")));
  const bad:string[]=[],labels=seams.createCalendarFailureLabels(line=>bad.push(line));labels.register("create");labels.capture("PRE_CLEANUP");labels.capture("PRE_CLEANUP");labels.register("create");labels.capture("FINAL");labels.failure();labels.publish();assert.equal(bad.length,2);assert.ok(bad.every(line=>line.endsWith("state=UNKNOWN")));
});

test("browser v3 malformed fields and throwing sink never touch payload getters change lifecycle identity or emit on healthy completion",async()=>{
  const seams=await actualBrowserSeams();let touched=0;const hostile=new Proxy({}, {get(){touched++;throw Error("PRIVATE");},getOwnPropertyDescriptor(){touched++;throw Error("PRIVATE");}});
  const lines:string[]=[],labels=seams.createCalendarFailureLabels(line=>lines.push(line)),record=labels.register("create")!;
  record.set("readback",hostile as never);labels.capture("PRE_CLEANUP");labels.capture("FINAL");labels.failure();labels.publish();assert.equal(touched,0);assert.equal(lines.length,2);assert.ok(lines.every(line=>line.endsWith("state=UNKNOWN")));
  const healthy=await labelledBrowserControl(),work=healthy.observe("create");healthy.match("create");await work;await healthy.registry.cancelAndSettle();healthy.labels.capture("PRE_CLEANUP");healthy.labels.capture("FINAL");healthy.labels.publish();assert.deepEqual(healthy.lines,[]);
  const throwing=await labelledBrowserControl(()=>{throw Error("PRIVATE sink");}),safe=throwing.seams.calendarBrowserDiagnostic("action-readback",{}),failed=throwing.observe("create",{readback:async()=>{throw safe;}});throwing.match("create");assert.equal(await failed.catch(error=>error),safe);await throwing.registry.cancelAndSettle();assert.doesNotThrow(()=>throwing.report());
});


test("browser v3 actual enclosing selected case catches preserve primary or cleanup override identity with fixed output and rotate remains silent",async()=>{
  const ts=await import("typescript"),seams=await actualBrowserSeams(),source=readFileSync(new URL("../../../e2e/calendar-feed.e2e.spec.ts",import.meta.url),"utf8"),ast=ts.createSourceFile("calendar-feed.e2e.spec.ts",source,ts.ScriptTarget.Latest,true),callbacks=new Map<string,string>();
  const visit=(node:import("typescript").Node)=>{if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==="test"&&node.arguments.length===2){const title=node.arguments[0]!.getText(ast);for(const id of ["001","007","010-"])if(title.includes("15.5-E2E-"+id)){const callback=node.arguments[1]!;callbacks.set(id,callback.getText(ast));}}ts.forEachChild(node,visit);};visit(ast);assert.equal(callbacks.size,3);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  for(const [id,mode] of [["001","primary"],["007","primary"],["007","cleanup"],["007","early"],["010-","primary"],["010-","rotate"]] as const){
    const lines:string[]=[],events:string[]=[],primary=Error("PRIVATE primary"),cleanup=Error("PRIVATE cleanup"),context={async newPage(){events.push("page");return{};},async close(){events.push("close");if(mode==="cleanup")throw cleanup;}},browser={async newContext(){events.push("context");return context;}},page={context(){return{browser(){if(mode==="early")return null;return browser;}}}};let fixtures=0;
    const run=new Function("createCalendarFailureLabels","withCalendarBrowserFixture","calendarBrowserCleanup","competingAction","return ("+strip(callbacks.get(id)!)+");")(
      (_sink:unknown,name:"E2E001"|"E2E007"|"E2E010-revoke")=>seams.createCalendarFailureLabels(line=>lines.push(line),name),
      async(_page:unknown,_scenario:unknown,_callback:unknown,labels?:import("../../../e2e/support/calendar-feed-atdd").CalendarFailureLabels)=>{fixtures++;events.push("fixture");labels?.scenario("PENDING");labels?.capture("PRE_CLEANUP");labels?.scenario("SETTLED_FAILURE");throw primary;},
      async(steps:{run():Promise<unknown>}[],captured?:{error:unknown})=>{assert.equal(captured?.error,primary);for(const step of steps)await step.run();},mode==="rotate"?"rotate":"revoke") as (input:unknown,info?:unknown)=>Promise<void>;
    const thrown=await run({resourcePage:page},{project:{use:{baseURL:"fixed"}}}).catch(error=>error);
    if(mode==="cleanup")assert.equal(thrown,cleanup);else if(mode!=="early")assert.equal(thrown,primary);else assert.match(thrown.message,/requires the owned browser/);
    assert.equal(fixtures,mode==="early"?0:1);if(id==="007"&&mode!=="early")assert.ok(events.indexOf("close")>events.indexOf("fixture"));
    if(mode==="rotate")assert.equal(lines.length,0);else{assert.equal(lines.length,2);assert.ok(lines.every(line=>line.startsWith("calendar-source-label-v3 ")&&!line.includes("PRIVATE")));assert.ok(lines.some(line=>line.includes("snapshot=FINAL")));}
  }
});


test("browser v3 public terminal facts prioritize page and failure presence without reading error payload",async()=>{
  const {calendarRequestTerminalAtDrain:sample}=await actualBrowserSeams();let failures=0,timings=0;
  const request={failure(){failures++;return null;},timing(){timings++;return {responseEnd:1};}};
  assert.equal(sample({isClosed:()=>true},request),"TARGET_CLOSED");assert.equal(failures,0);assert.equal(timings,0);
  assert.equal(sample({isClosed:()=>false}),"UNAVAILABLE");
  const hostile=Object.defineProperty({},"errorText",{get(){throw Error("PRIVATE");}});
  for(const failure of [{errorText:""},hostile,{}])assert.equal(sample({isClosed:()=>false},{failure:()=>failure,timing(){throw Error("must not read");}}),"FAILED_OPEN");
  for(const failure of [undefined,"PRIVATE",false,[],1])assert.equal(sample({isClosed:()=>false},{failure:()=>failure,timing:()=>({responseEnd:1})}),"UNKNOWN");
  assert.equal(sample({isClosed(){throw Error("PRIVATE");}},request),"UNKNOWN");
  assert.equal(sample({isClosed:()=>0} as never,request),"UNKNOWN");
  assert.equal(sample({isClosed:()=>false},{failure(){throw Error("PRIVATE");},timing:()=>({responseEnd:1})}),"UNKNOWN");
});

test("browser v3 timing accepts only an own finite data responseEnd and preserves empty failure ambiguity",async()=>{
  const {calendarRequestTerminalAtDrain:sample}=await actualBrowserSeams();
  for(const [timing,expected] of [[{responseEnd:-1},"NO_END_NO_FAILURE_OPEN"],[{responseEnd:0},"END_WITHOUT_FAILURE_OPEN"],[{responseEnd:9},"END_WITHOUT_FAILURE_OPEN"],[{responseEnd:-2},"UNKNOWN"],[{responseEnd:Infinity},"UNKNOWN"],[{responseEnd:NaN},"UNKNOWN"],[{responseEnd:"PRIVATE"},"UNKNOWN"],[null,"UNKNOWN"],[Object.create({responseEnd:1}),"UNKNOWN"],[Object.defineProperty({},"responseEnd",{get(){throw Error("PRIVATE");}}),"UNKNOWN"],[new Proxy({},{getOwnPropertyDescriptor(){throw Error("PRIVATE");}}),"UNKNOWN"]] as const){
    assert.equal(sample({isClosed:()=>false},{failure:()=>null,timing:()=>timing}),expected);
  }
  assert.equal(sample({isClosed:()=>false},{failure:()=>null,timing(){throw Error("PRIVATE");}}),"UNKNOWN");
  // SDK maps an empty failure text to null; timing alone cannot identify the finished event.
  assert.equal(sample({isClosed:()=>false},{failure:()=>null,timing:()=>({responseEnd:1})}),"END_WITHOUT_FAILURE_OPEN");
});

test("browser v3 actual matched request is sampled once after drain and remains immutable after target closure",async()=>{
  const seams=await actualBrowserSeams(),lines:string[]=[],labels=seams.createCalendarFailureLabels(line=>lines.push(line));
  const label=labels.register("create")!;let closed=false,failureCalls=0,timingCalls=0,responseCalls=0,finishedCalls=0;
  const request={failure(){assert.equal(this,request);failureCalls++;return null;},timing(){assert.equal(this,request);timingCalls++;return {responseEnd:7};},async response(){assert.equal(this,request);responseCalls++;return {async finished(){finishedCalls++;return null;}};}};
  const readback=actualBrowserReadback(label,{matched:request,result:{},terminal:seams.calendarRequestTerminalAtDrain,page:{isClosed:()=>closed}});
  assert.equal((await readback(request)).committed,true);assert.equal(failureCalls,0);
  labels.capture("PRE_CLEANUP");labels.sampleAtDrain();closed=true;labels.sampleAtDrain();labels.capture("FINAL");labels.failure();labels.publish();
  assert.equal(failureCalls,1);assert.equal(timingCalls,1);assert.equal(responseCalls,0);assert.equal(finishedCalls,0);
  assert.ok(lines[0]!.endsWith("terminalAtDrain=NOT_SAMPLED"));assert.ok(lines[1]!.endsWith("terminalAtDrain=END_WITHOUT_FAILURE_OPEN"));
  label.bindTerminal?.(()=>{throw Error("late PRIVATE");});labels.sampleAtDrain();assert.equal(failureCalls,1);
});

test("browser v3 unavailable omitted malformed and throwing samples preserve original errors and fixed row caps",async()=>{
  const seams=await actualBrowserSeams();
  for(const mode of ["missing","omitted","throwing","malformed","duplicate"] as const){
    const lines:string[]=[],labels=seams.createCalendarFailureLabels(line=>lines.push(line)),label=labels.register("create")!;
    if(mode==="throwing")label.bindTerminal?.(()=>{throw Error("PRIVATE");});
    if(mode==="malformed")label.bindTerminal?.(()=>"PRIVATE" as never);
    if(mode==="duplicate"){label.bindTerminal?.(()=>"FAILED_OPEN");label.bindTerminal?.(()=>"END_WITHOUT_FAILURE_OPEN");}
    const cause={},original=Object.assign(Error("PRIVATE"),{cause});let caught:unknown;
    try{try{throw original;}finally{labels.capture("PRE_CLEANUP");if(mode!=="omitted")labels.sampleAtDrain();}}catch(error){caught=error;}
    labels.capture("FINAL");labels.failure();labels.publish();assert.equal(caught,original);assert.equal((caught as Error).cause,cause);
    const expected=mode==="omitted"?"NOT_SAMPLED":mode==="missing"?"UNAVAILABLE":"UNKNOWN";
    assert.ok(lines[1]!.endsWith("terminalAtDrain="+expected));assert.equal(lines.length,2);assert.ok(lines.every(line=>/^[\x20-\x7e]{1,512}$/.test(line)&&!line.includes("PRIVATE")));
  }
  const source=readFileSync(new URL("../../../e2e/support/calendar-feed-atdd.ts",import.meta.url),"utf8");
  const drain=source.indexOf("const settlement = await observations.cancelAndSettle(protocolWork)"),caught=source.indexOf('catch (error) { cleanupAllowed = false;',drain),sample=source.indexOf('calendarLabel(()=>labels?.sampleAtDrain());',caught),dispose=source.indexOf('await fault.dispose()',sample);
  assert.ok(drain>0&&caught>drain&&sample>caught&&dispose>sample);assert.equal(source.split('labels?.sampleAtDrain()').length-1,1);
});


async function managedAdmissionControl(){
  const seams=await actualBrowserSeams(),ledger=seams.createCalendarManageAdmission<object>(),request={};
  const identity={tenantId:"00000000-0000-4000-8000-000000000001",membershipId:"00000000-0000-4000-8000-000000000002",actorId:"00000000-0000-4000-8000-000000000003",action:"create" as const,attemptId:"00000000-0000-4000-8000-000000000004",expectedRevision:0,nextRevision:1};
  const token={id:"00000000-0000-4000-8000-000000000005",tenant_id:identity.tenantId,membership_id:identity.membershipId,attempt_id:identity.attemptId,action:identity.action,revision:1,expected_revision:0};
  const audit={target_id:token.id,actor_user_id:identity.actorId,command:"calendar_feed.create",metadata:{attemptId:identity.attemptId,revision:1}};
  ledger.activate();return {seams,ledger,request,identity,token,audit};
}

test("managed admission freezes exact Request identity and requires exact token plus unique attributable audit",async()=>{
  const x=await managedAdmissionControl();assert.equal(x.ledger.admit(x.request,x.identity),true);assert.equal(x.ledger.begin(x.request),true);
  x.identity.actorId="00000000-0000-4000-8000-000000000099";assert.notEqual(x.ledger.identity(x.request)!.actorId,x.identity.actorId);assert.ok(Object.isFrozen(x.ledger.identity(x.request)));
  assert.equal(x.ledger.certify(x.request,[x.token],[x.audit]),true);x.ledger.close();assert.equal(x.ledger.ready(),true);
  for(const patch of [{tenant_id:"wrong"},{membership_id:"wrong"},{attempt_id:"wrong"},{action:"rotate"},{revision:2},{expected_revision:1}]){const c=await managedAdmissionControl();c.ledger.admit(c.request,c.identity);c.ledger.begin(c.request);assert.equal(c.ledger.certify(c.request,[{...c.token,...patch}],[c.audit]),false);c.ledger.close();assert.equal(c.ledger.ready(),false);}
  for(const patch of [{target_id:"wrong"},{actor_user_id:"wrong"},{command:"calendar_feed.rotate"},{metadata:{attemptId:"wrong",revision:1}},{metadata:{attemptId:"00000000-0000-4000-8000-000000000004",revision:2}}]){const c=await managedAdmissionControl();c.ledger.admit(c.request,c.identity);c.ledger.begin(c.request);assert.equal(c.ledger.certify(c.request,[c.token],[{...c.audit,...patch}]),false);}
  const c=await managedAdmissionControl();c.ledger.admit(c.request,c.identity);c.ledger.begin(c.request);assert.equal(c.ledger.certify(c.request,[c.token],[c.audit,c.audit]),false);assert.equal(c.ledger.certify({},[c.token],[c.audit]),false);
});

test("managed admission never launders stale duplicate or replay proof and preserves pre-send-only retry",async()=>{
  const x=await managedAdmissionControl();x.ledger.admit(x.request,x.identity);x.ledger.begin(x.request);assert.equal(x.ledger.certify(x.request,[x.token],[x.audit]),true);
  const duplicate={};assert.equal(x.ledger.admit(duplicate,x.identity),false);assert.equal(x.ledger.certify(duplicate,[x.token],[x.audit]),false);x.ledger.close();assert.equal(x.ledger.ready(),false);
  const c=await managedAdmissionControl();assert.equal(c.ledger.admit(c.request,c.identity),true);c.ledger.notAdmitted(c.request);const retry={};assert.equal(c.ledger.admit(retry,c.identity),true);assert.equal(c.ledger.begin(retry),true);assert.equal(c.ledger.certify(retry,[c.token],[c.audit]),true);c.ledger.close();assert.equal(c.ledger.ready(),true);
  const unsafe=await managedAdmissionControl();unsafe.ledger.admit(unsafe.request,unsafe.identity);unsafe.ledger.begin(unsafe.request);unsafe.ledger.notAdmitted(unsafe.request);assert.equal(unsafe.ledger.admit({},unsafe.identity),false);
});

test("managed admission separates observed frontend terminal failure from backend commit and owns the same protocol promise",async()=>{
  const x=await managedAdmissionControl();x.ledger.admit(x.request,x.identity);x.ledger.begin(x.request);x.ledger.frontend(x.request,"TERMINAL_FAILURE");x.ledger.frontend(x.request,"SUCCESS");assert.equal(x.ledger.frontendState(x.request),"TERMINAL_FAILURE");
  let release!:()=>void;const protocol=new Promise<void>(resolve=>{release=resolve;});assert.equal(x.ledger.own(protocol),protocol);assert.equal(x.ledger.certify(x.request,[x.token],[x.audit]),true);const work=x.ledger.close();assert.deepEqual(work,[protocol]);assert.equal(x.ledger.ready(),false);release();await protocol;assert.equal(x.ledger.ready(),true);assert.equal(x.ledger.frontendState(x.request),"TERMINAL_FAILURE");
  const y=await managedAdmissionControl();y.ledger.admit(y.request,y.identity);y.ledger.begin(y.request);y.ledger.frontend(y.request,"TERMINAL_FAILURE");y.ledger.close();assert.equal(y.ledger.ready(),false);
  const registry=x.seams.createCalendarLifecycleObservations({settlementTimeoutMs:2});let done!:()=>void;const held=new Promise<void>(resolve=>{done=resolve;});assert.equal((await registry.cancelAndSettle([held])).settled,false);done();await held;
});

test("managed admission rejects getter proxy malformed and uninstalled or reopened authority",async()=>{
  for(const hostile of [Object.defineProperty({},"tenantId",{enumerable:true,get(){throw Error("PRIVATE");}}),new Proxy({},{ownKeys(){throw Error("PRIVATE");}}),{}]){const x=await managedAdmissionControl();assert.equal(x.ledger.admit(x.request,hostile as never),false);x.ledger.close();assert.equal(x.ledger.ready(),false);}
  const x=await managedAdmissionControl();x.ledger.close();x.ledger.activate();assert.equal(x.ledger.admit(x.request,x.identity),false);assert.equal(x.ledger.begin(x.request),false);
  const y=await managedAdmissionControl();y.ledger.admit(y.request,y.identity);y.ledger.begin(y.request);const hostile=Object.defineProperty({...y.token},"revision",{get(){throw Error("PRIVATE");}});assert.equal(y.ledger.certify(y.request,[hostile],[y.audit]),false);
});

async function actualManageRoutingControl(){
  const seams=await actualBrowserSeams(),source=readFileSync(new URL("../../../e2e/support/calendar-feed-atdd.ts",import.meta.url),"utf8");
  const start=source.indexOf("const management=createCalendarManageAdmission<Request>()"),end=source.indexOf("management.activate();",start)+"management.activate();".length;assert.ok(start>0&&end>start);
  const actionStart=source.indexOf("function actionInput(request:"),actionEnd=source.indexOf("\nfunction deferred",actionStart);assert.ok(actionEnd>actionStart);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const parser=new Function(strip(source.slice(actionStart,actionEnd))+";return actionInput;")();
  const events=new Map<string,(request:object)=>void>();let gate!:(route:unknown)=>Promise<unknown>;
  const context={on(event:string,fn:(request:object)=>void){events.set(event,fn);},async route(predicate:(url:URL)=>boolean,handler:(route:unknown)=>Promise<unknown>){assert.equal(predicate(new URL("http://localhost/settings/calendar?x=1")),true);gate=handler;}};
  const subject={membership:"00000000-0000-4000-8000-000000000002",user:{id:"00000000-0000-4000-8000-000000000003"}},ownTenant="00000000-0000-4000-8000-000000000001";
  const execute=new Function("createCalendarManageAdmission","page","subject","ownTenant","calendarLabel","calendarBrowserDiagnostic","actionInput","return "+strip("(async()=>{let transportVerified=true;"+source.slice(start,end)+"return {management,reserve,forward,labelsByRequest};})()"));
  const actual=await execute(seams.createCalendarManageAdmission,{context:()=>context},subject,ownTenant,(run:()=>void)=>{try{run();}catch{/* actual no-throw wrapper */}},seams.calendarBrowserDiagnostic,parser) as {management:ReturnType<typeof seams.createCalendarManageAdmission<object>>;reserve(request:object,input:unknown):boolean;forward(request:object,route:unknown,send:()=>Promise<unknown>):Promise<unknown>};
  const request=(input:unknown)=>({method:()=>"POST",headers:()=>({"next-action":"fixed"}),url:()=>"http://localhost/settings/calendar",postData:()=>JSON.stringify(input)});
  return{...actual,gate,events,request,subject,ownTenant};
}

test("actual context route fences late manage dispatch irreversibly and keeps malformed requests out of backend",async()=>{
  const x=await actualManageRoutingControl(),input={action:"create",revision:0,attemptId:"00000000-0000-4000-8000-000000000004"},request=x.request([input]);let forwards=0,aborts=0;
  await x.gate({request:()=>request,async continue(){forwards++;},async abort(){aborts++;},async fallback(){throw Error("unexpected fallback");}});assert.equal(forwards,1);assert.equal(aborts,0);
  x.management.close();const late=x.request([input]);await x.gate({request:()=>late,async continue(){forwards++;},async abort(){aborts++;}});assert.equal(forwards,1);assert.equal(aborts,1);assert.equal(x.management.identity(late),undefined);assert.equal(x.management.ready(),false);
  for(const body of [[{...input,extra:"PRIVATE"}],["$reference"],{bad:true}]){const y=await actualManageRoutingControl();let sent=0;await y.gate({request:()=>y.request(body),async continue(){sent++;},async fallback(){sent++;},async abort(){}});y.management.close();assert.equal(sent,0);assert.equal(y.management.ready(),false);}
  const y=await actualManageRoutingControl();let read=0;await y.gate({request:()=>y.request(["$undefined"]),async fallback(){read++;},async abort(){throw Error("unexpected abort");}});assert.equal(read,1);
});

test("actual shared fault dispatch rechecks fence after a hold and cannot forward reserved work through cleanup",async()=>{
  const x=await actualManageRoutingControl(),input={action:"create",revision:0,attemptId:"00000000-0000-4000-8000-000000000004"},request=x.request([input]);assert.equal(x.reserve(request,input),true);x.management.close();let abort=0,send=0;
  await assert.rejects(x.forward(request,{async abort(){abort++;}},async()=>{send++;}),/Calendar browser failure/);assert.equal(abort,1);assert.equal(send,0);assert.equal(x.management.ready(),true);
  const source=readFileSync(new URL("../../../e2e/support/calendar-feed-atdd.ts",import.meta.url),"utf8"),fault=source.slice(source.indexOf("async armFault(kind)"),source.indexOf("async attemptReceipt()"));assert.ok(fault.includes('await forward(request,route,()=>route.continue())'));assert.ok(fault.includes('await forward(request,route,()=>route.fetch({ timeout: 15_000 }))'));assert.ok(fault.includes('await route.abort("failed");management.notAdmitted(request)'));assert.ok(!fault.includes('await route.continue();'));
});


test("actual calendar and attached context constructors block service workers without changing existing options",()=>{
  const spec=readFileSync(new URL("../../../e2e/calendar-feed.e2e.spec.ts",import.meta.url),"utf8"),attached=readFileSync(new URL("../../../e2e/support/resource-cdp-attachment.ts",import.meta.url),"utf8");
  const extract=(source:string,start:string,end:string)=>{const a=source.indexOf(start),b=source.indexOf(end,a);assert.ok(a>=0&&b>a);return source.slice(a+start.length,b);};
  const stock=extract(spec,"test.use(",");"),phone=extract(spec,"browser.newContext(",");"),cdp=extract(attached,"browser.newContext(",");");
  const evaluate=(text:string)=>new Function("testInfo","baseURL","return ("+text+");")({project:{use:{baseURL:"http://localhost"}}},"http://localhost");
  assert.deepEqual(evaluate(stock),{trace:"off",screenshot:"off",video:"off",serviceWorkers:"block"});
  assert.deepEqual(evaluate(phone),{baseURL:"http://localhost",viewport:{width:360,height:640},hasTouch:true,serviceWorkers:"block"});
  assert.deepEqual(evaluate(cdp),{baseURL:"http://localhost",serviceWorkers:"block"});
  for(const options of [stock,phone,cdp])for(const bad of [options.replace('serviceWorkers:"block"','serviceWorkers:"allow"'),options.replace(', serviceWorkers:"block"','')])assert.notEqual(evaluate(bad).serviceWorkers,"block");
});

test("actual owned fault callback joins held dispatch and preserves failure disposal",async()=>{
  const x=await actualManageRoutingControl(),source=readFileSync(new URL("../../../e2e/support/calendar-feed-atdd.ts",import.meta.url),"utf8"),start=source.indexOf("async armFault(kind)"),end=source.indexOf("async attemptReceipt()",start);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const dStart=source.indexOf("function deferred<T>()"),dEnd=source.indexOf("\n",source.indexOf("return {",dStart));
  // Compile the exact complete declared helper and actual armFault method.
  const deferredEnd=source.indexOf("\n}",dStart)+2;assert.ok(dEnd>dStart&&deferredEnd>dStart);
  const deferred=new Function(strip(source.slice(dStart,deferredEnd))+";return deferred;")();
  let handler!:(route:unknown)=>Promise<unknown>;const activeFaults=new Set<unknown>();
  const seams=await actualBrowserSeams();
  const factory=new Function("management","reserve","forward","actionInput","page","deferred","activeFaults","calendarBrowserDiagnostic","calendarFailures","committedAttempt",strip("let transportVerified=true;const fixture={"+source.slice(start,end)+"};")+"return {arm:fixture.armFault,verified:()=>transportVerified};");
  const parserStart=source.indexOf("function actionInput(request:"),parserEnd=source.indexOf("\nfunction deferred",parserStart),parser=new Function(strip(source.slice(parserStart,parserEnd))+";return actionInput;")();
  const control=factory(x.management,x.reserve,x.forward,parser,{async route(_path:string,h:typeof handler){handler=h;},async unroute(){}},deferred,activeFaults,seams.calendarBrowserDiagnostic,(errors:Error[])=>new AggregateError(errors),async()=>{throw Error("must not read backend for pre-send");});
  const fault=await control.arm("hold-before-send"),input={action:"create",revision:0,attemptId:"00000000-0000-4000-8000-000000000004"},request=x.request([input]);let sends=0,aborts=0;
  const work=handler({request:()=>request,async continue(){sends++;},async abort(){aborts++;}});await fault.reached;
  const owned=x.management.close();assert.equal(owned.length,1);await fault.release();await work;await assert.rejects(fault.dispose(),/Calendar browser failure/);assert.equal(sends,0);assert.equal(aborts,2);assert.equal(x.management.ready(),true);assert.equal(control.verified(),false);
});


async function int009Control(options:Parameters<typeof actualCalendarOwner>[0]={}) {
  const origins=await actualFixtureOrigins(),capture=origins.createCalendarInt009Capture(),f=await actualCalendarOwner({purpose:"subject",...options}),meta:Record<string,unknown>={};
  const run=(callback:()=>Promise<unknown>)=>f.api.calendarWorkScope({pendingRequests:new Set()},callback,capture);
  return {...f,origins,capture,meta,run,publish(){capture.publish(meta);return meta.calendarInt009SetupV1 as readonly {kind:string;publication:string;operation:string;guard:string;nativeClass:string;sqlstate:string}[]|undefined;}};
}

test("INT009 actual subject owner captures first rejected operation own native code before erasure and preserves query fingerprint",async()=>{
  const original=Object.freeze(Object.assign(Error("PRIVATE_SQL_TOKEN"),{name:"error",code:"42601",cause:{PRIVATE:true}}));
  const plain=await actualCalendarOwner({purpose:"subject",faults:["replace"],failure:original});await plain.api.calendarPublish("subject",()=>" owned test body ",true).catch(()=>{});
  const f=await int009Control({faults:["replace"],failure:original});await f.run(()=>f.api.calendarPublish("subject",()=>" owned test body ",true)).catch(()=>{});const records=f.publish()!;
  assert.deepEqual(records[0],{kind:"PRIMARY",publication:"REPLACE",operation:"REPLACE_DDL",guard:"UNKNOWN",nativeClass:"error",sqlstate:"42601"});assert.deepEqual(f.calls,plain.calls);assert.equal(records.filter(r=>r.kind==="PRIMARY").length,1);assert.ok(!JSON.stringify(f.meta).includes("PRIVATE"));assert.equal(original.cause.PRIVATE,true);
  const report=await actualMetaJsonReport(f.meta),serialized=report.testResults[0].assertionResults[0].meta;assert.deepEqual(serialized.calendarInt009SetupV1,records);assert.ok(Buffer.byteLength(JSON.stringify(serialized,null,10),"ascii")<=4096);await f.factory.pool()?.end();await plain.factory.pool()?.end();
});

test("INT009 actual preflight selects existing combined or hardcoded field guard before any owner mutation",async()=>{
  for(const [unsafe,guard]of [[{identityQualified:false},"ROW_QUALIFICATION"],[{metadata:{prosrc:"PRIVATE"}},"MISSING_METADATA"],[{schemaQualified:false},"SCHEMA_AUTHORITY"]] as const){
    const f=await int009Control({unsafe});await f.run(()=>f.api.calendarPublish("subject",()=>"changed",true)).catch(()=>{});const rows=f.publish()!;assert.equal(rows[0].publication,unsafe.schemaQualified===false?"REPLACE":"CAPTURE");assert.equal(rows[0].guard,guard);assert.ok(!f.calls.includes("replace"));assert.ok(!f.calls.includes("grant create on schema public to calendar_feed_owner"));await f.factory.pool()?.end();
  }
  const f=await int009Control();f.capture.phase("CAPTURE","PRE_CATALOG");await f.run(async()=>{assert.throws(()=>f.api.calendarOwnerFacts([{...f.canonical,metadata:{...f.canonical.metadata,provolatile:"v"}}],"subject",f.body));});assert.equal(f.publish()![0].guard,"FIELD:provolatile");await f.factory.pool()?.end();
});

test("INT009 actual owner callback unreached and verified callback failure never invent BEGIN or failed retirement",async()=>{
  for(const entered of [false,true]){
    const f=await int009Control(),native=Object.freeze(Object.assign(Error("PRIVATE"),{code:"42501"}));let calls=0;
    const retired=async(run:(sql:{query:(text:string)=>Promise<unknown[]>})=>Promise<unknown>)=>{
      if(entered)try{await run({query:async()=>{calls++;throw native;}});}catch{/* existing replacement boundary */}
      throw new f.factory.api.AdminRetiredSessionError(true,["callback-failed"]);
    };
    const atomic=f.api.calendarOwnerAtomic as unknown as (purpose:string,body:string,operation:object,retired:unknown)=>Promise<unknown>;
    f.capture.phase("CAPTURE");await f.run(()=>atomic("subject",f.body,{kind:"capture"},retired)).catch(()=>{});const rows=f.publish()!;
    assert.equal(rows[0].operation,entered?"BEGIN":"UNREACHED");assert.equal(rows[0].sqlstate,entered?"42501":"UNKNOWN");assert.equal(rows[0].nativeClass,"UNKNOWN");assert.equal(calls,entered?4:0);assert.ok(rows.every(row=>!row.operation.includes("RETIREMENT")));await f.factory.pool()?.end();
  }
});

test("INT009 native proxy rejection avoids traps and inherited accessor frozen metadata and late sink cannot affect errors",async()=>{
  const {createCalendarInt009Capture:make}=await actualFixtureOrigins();let traps=0;
  const proxy=new Proxy({}, {getOwnPropertyDescriptor(){traps++;throw Error("PRIVATE");},getPrototypeOf(){traps++;throw Error("PRIVATE");},ownKeys(){traps++;throw Error("PRIVATE");},defineProperty(){traps++;throw Error("PRIVATE");}});
  const getter=Object.defineProperty({},"code",{get(){traps++;throw Error("PRIVATE");}});
  for(const error of [proxy,getter,Object.create({name:"error",code:"42501"}),Object.freeze({name:"PRIVATE",code:"PRIVATE"})]){
    const capture=make(),meta:Record<string,unknown>={};capture.phase("CAPTURE","PRE_CATALOG");assert.doesNotThrow(()=>capture.fail("UNKNOWN",error));capture.publish(meta);const rows=meta.calendarInt009SetupV1 as {nativeClass:string;sqlstate:string}[];assert.equal(rows[0].nativeClass,"UNKNOWN");assert.equal(rows[0].sqlstate,"UNKNOWN");
  }
  for(const meta of [proxy,Object.freeze({}),Object.defineProperty({},"calendarInt009SetupV1",{get(){traps++;throw Error("PRIVATE");}})]){const c=make();c.fail();assert.doesNotThrow(()=>c.publish(meta));}
  const foreign={PRIVATE:true},meta={calendarInt009SetupV1:foreign};const c=make();c.fail();c.publish(meta);assert.equal(meta.calendarInt009SetupV1,foreign);assert.equal(traps,0);
  const closed=make(),silent={};closed.close();closed.fail();closed.publish(silent);assert.deepEqual(silent,{});
});

test("INT009 immutable primary cleanup overflow and reporter byte cap remain local and healthy/default silent",async()=>{
  const {createCalendarInt009Capture:make}=await actualFixtureOrigins(),a=make(),b=make(),meta:Record<string,unknown>={},healthy={};a.phase("REPLACE","REPLACE_DDL");a.fail("UNKNOWN",Object.freeze({name:"error",code:"42P13"}));b.publish(healthy);assert.deepEqual(healthy,{});
  for(let i=0;i<9;i++)a.cleanup("REQUALIFY",{name:"error",code:"42501"});a.publish(meta);const rows=meta.calendarInt009SetupV1 as readonly Record<string,string>[];assert.equal(rows.length,4);assert.equal(rows[0].sqlstate,"42P13");assert.equal(rows[3].guard,"OMITTED");assert.ok(Object.isFrozen(rows)&&rows.every(Object.isFrozen));const snapshot=JSON.stringify(rows);a.fail("STATE");a.cleanup("ROLLBACK");a.phase("UNKNOWN");a.publish({});assert.equal(JSON.stringify(rows),snapshot);
  const report=await actualMetaJsonReport(meta),published=report.testResults[0].assertionResults[0].meta;assert.deepEqual(published.calendarInt009SetupV1,rows);assert.ok(/^[\x00-\x7f]*$/.test(JSON.stringify(published)));assert.ok(Buffer.byteLength(JSON.stringify(published,null,10))<=4096);

});

function actualInt009Callback() {
  const source=readFileSync(new URL("../../../integration/commands/calendar-feed.int.test.ts",import.meta.url),"utf8"),start=source.indexOf('  test("[P0] 15.5-INT009'),end=source.indexOf('  test("[P0] 15.5-INT010',start);assert.ok(start>0&&end>start);
  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  return (make:unknown,fixture:unknown,expect:unknown)=>{let callback!:(context:unknown)=>Promise<void>;new Function("test","createCalendarInt009Capture","withCalendarFeedFixture","lifecycle","expect",strip(source.slice(start,end)))((_name:string,run:typeof callback)=>{callback=run;},make,fixture,()=>({action:"create"}),expect);return callback;};
}

test("INT009 actual enclosing callback preserves setup error identity cause and cleanup override while later work stays unreached",async()=>{
  const {createCalendarInt009Capture:make}=await actualFixtureOrigins(),compile=actualInt009Callback();
  for(const mode of ["setup","sink","override","healthy"] as const){const primary=Object.assign(Error("PRIVATE"),{cause:{}}),outer=Object.assign(Error("PRIVATE"),{cause:{}}),meta={},events:string[]=[];
    const run=compile(make,async(_lane:string,callback:(fx:unknown)=>Promise<void>,capture:ReturnType<typeof make>)=>{
      if(mode==="setup"||mode==="sink"){capture.phase("CAPTURE","PRE_CATALOG");capture.fail("ROW_FIELDS");try{throw primary;}catch(error){capture.publish();throw error;}finally{events.push("outer-cleanup");capture.close();} }
      await callback({subjects:{own:{}},serial:{barrier:async()=>({waitUntilEntered:async()=>{},release:async()=>{},assertOwnedObjectsAbsent:async()=>{events.push("inner-cleanup");if(mode==="override")throw outer;}})},manage:async()=>{events.push("manage");return{outcome:"denied"};},setAuthority:async()=>{events.push("role");},physical:async()=>({tokens:[],audits:[]})});
    },()=>({toBe(){if(mode==="override")throw primary;},toHaveLength(){}}));
    const task=mode==="sink"?Object.defineProperty({},"meta",{get(){throw Error("PRIVATE sink");}}):{meta};
    const caught=await run({task}).catch(error=>error);if(mode==="setup"||mode==="sink"){assert.equal(caught,primary);assert.equal(caught.cause,primary.cause);assert.deepEqual(events,["outer-cleanup"]);assert.equal(Object.hasOwn(meta,"calendarInt009SetupV1"),mode!=="sink");}else if(mode==="override"){assert.equal(caught,outer);assert.equal(caught.cause,outer.cause);assert.ok(events.indexOf("role")>events.indexOf("manage"));assert.ok(events.includes("inner-cleanup"));}else{assert.equal(caught,undefined);assert.deepEqual(meta,{});}
  }
});


test("INT009 actual successful owner callback followed by wrapper rejection remains wrapper UNKNOWN not COMMIT failure",async()=>{
  const f=await int009Control();let operations=0;
  const retired=async(run:(session:{query:(sql:string)=>Promise<unknown[]>})=>Promise<unknown>)=>{await run({query:async(sql)=>{operations++;return sql.startsWith("select p.oid")?[structuredClone(f.canonical)]:[];}});throw new f.factory.api.AdminRetiredSessionError(false,["retirement-unverified"]);};
  const atomic=f.api.calendarOwnerAtomic as unknown as (purpose:string,body:string,operation:object,retired:unknown)=>Promise<unknown>;
  f.capture.phase("CAPTURE");await f.run(()=>atomic("subject",f.body,{kind:"capture"},retired)).catch(()=>{});const rows=f.publish()!;assert.equal(rows[0].operation,"WRAPPER_OUTCOME_UNKNOWN");assert.equal(rows[0].sqlstate,"UNKNOWN");assert.equal(operations,4);assert.ok(f.api.getCustody());await f.factory.pool()?.end();
});


test("INT009 actual scoped captures stay distinct and altered guard publication fails the source oracle",async()=>{
  const a=await int009Control({unsafe:{identityQualified:false}}),b=await int009Control({faults:["replace"],failure:Object.freeze({code:"42P13"})});
  await Promise.all([a.run(()=>a.api.calendarPublish("subject",()=>"changed",true)).catch(()=>{}),b.run(()=>b.api.calendarPublish("subject",()=>"changed",true)).catch(()=>{})]);assert.equal(a.publish()![0].guard,"ROW_QUALIFICATION");assert.equal(b.publish()![0].sqlstate,"42P13");await a.factory.pool()?.end();await b.factory.pool()?.end();
  const source=readFileSync(new URL("../../../support/calendar-feed-atdd.ts",import.meta.url),"utf8"),start=source.indexOf("function calendarOwnerFacts("),end=source.indexOf("const calendarOwnerCatalogSql=",start),strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const run=(text:string)=>{const c=a.origins.createCalendarInt009Capture(),meta:Record<string,unknown>={};c.phase("CAPTURE","PRE_CATALOG");const facts=new Function("calendarInt009Guard","calendarOwnerRefused",strip(text)+";return calendarOwnerFacts;")((_purpose:string,guard:string)=>c.fail(guard),()=>Error("fixed"));assert.throws(()=>facts([],"subject","fixed"));c.publish(meta);return meta.calendarInt009SetupV1 as {guard:string}[]|undefined;};
  const region=source.slice(start,end);assert.equal(run(region)![0].guard,"ROW_COUNT");const altered=region.replace('calendarInt009Guard(purpose,"ROW_COUNT");',"");assert.notEqual(region,altered);assert.throws(()=>assert.equal(run(altered)?.[0]?.guard,"ROW_COUNT"));
});


test("INT009 actual fixture final errors publish through the controlled sink without replacing primary or cleanup errors",async()=>{
  const {createCalendarInt009Capture:make}=await actualFixtureOrigins(),primary=Object.assign(Error("PRIVATE"),{cause:{}});
  for(const fault of [undefined,"cleanup"] as const){const f=await actualCanonicalComposition(fault),meta:Record<string,unknown>={},capture=make(()=>meta);capture.phase("CAPTURE","PRE_CATALOG");capture.fail("ROW_FIELDS");const error=await f.api.withCalendarFeedFixture("row-isolated",async()=>{throw primary;},capture).catch(error=>error);assert.ok(error instanceof AggregateError);assert.equal(error.errors[0],primary);assert.equal(error.errors[0].cause,primary.cause);assert.ok(Object.hasOwn(meta,"calendarInt009SetupV1"));assert.ok(f.events.includes("canonical:cleanup")&&f.events.includes("auth:cleanup"));if(fault)assert.ok(error.errors.length>1);}
  const f=await actualCanonicalComposition(),capture=make(()=>{throw Error("PRIVATE sink");});capture.fail();const error=await f.api.withCalendarFeedFixture("row-isolated",async()=>{throw primary;},capture).catch(error=>error);assert.equal(error.errors[0],primary);
});

test("INT009 actual entire subject barrier setup closes capture before later restore cleanup",async()=>{
  const f=await int009Control(),source=readFileSync(new URL("../../../support/calendar-feed-atdd.ts",import.meta.url),"utf8"),start=source.indexOf("async function calendarBarrier("),end=source.indexOf("/** Independent small RFC5545",start),strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
  const names=["randomUUID","adminSession","calendarPublish","calendarRestore","calendarSettle","adminQuery","redactFailure","calendarOwnerRefused","calendarInt009Subject"];
  const barrier=new Function(...names,strip("let calendarSharedCustody=null;"+source.slice(start,end))+";return calendarBarrier;")(()=>"00000000-0000-4000-8000-000000000001",async(run:(session:{query:()=>Promise<unknown[]>})=>Promise<unknown>)=>run({query:async()=>[]}),f.api.calendarPublish,f.api.calendarRestore,f.api.calendarSettle,async()=>[],()=>Error("fixed"),()=>Error("fixed"),f.api.calendarInt009Subject);
  const fx={pendingRequests:new Set<Promise<unknown>>(),finalizers:new Set<()=>Promise<void>>()};
  const owned=await f.run(()=>barrier({stage:"management-before-authority",tenantId:"fixed",membershipId:"fixed"},fx)) as {release():Promise<void>;assertOwnedObjectsAbsent():Promise<void>};
  f.capture.phase("REPLACE","DEFINITION");f.capture.fail("STATE");f.capture.cleanup("SETUP_CLEANUP",Error("PRIVATE later cleanup"));assert.equal(f.publish(),undefined);await owned.release();await owned.assertOwnedObjectsAbsent();assert.deepEqual(f.meta,{});await f.factory.pool()?.end();
});


function actualCanonicalCatalogProjection() {
  const source=readFileSync(new URL("../../../support/calendar-feed-atdd.ts",import.meta.url),"utf8").replaceAll("\r\n","\n"),prefix="const calendarOwnerCatalogSql=`",start=source.indexOf(prefix)+prefix.length,end=source.indexOf("`;\nexport async function calendarOwnerAtomic",start);assert.ok(start>prefix.length&&end>start);
  const query=source.slice(start,end),addition=",'proargtypes',p.proargtypes::text";
  const inverse=(sql:string)=>{assert.equal(sql.split(addition).length-1,1);return createHash("sha256").update(sql.replace(addition,"")).digest("hex");};
  // Independently bound BEFORE editing in INT009-canonical-catalog-source-analysis.json.
  assert.equal(inverse(query),"67687b5b6b0bd34031df3374d1b04f2222a0a34fe2cb9314fae6169d2c430a60");
  const facts=source.slice(source.indexOf("function calendarOwnerFacts("),source.indexOf("const calendarOwnerCatalogSql="));assert.equal(createHash("sha256").update(facts).digest("hex"),"3cd5094c031027b20f5c61cb0ddceba589ac05fd6fe61872eae3defa7df87085");
  return {query,inverse,addition};
}

test("canonical catalog projection has one native oidvector text cast with exact authority and strict guard inverse",()=>{
  const {query,inverse,addition}=actualCanonicalCatalogProjection();assert.ok(query.includes("to_jsonb(p)||jsonb_build_object("));assert.ok(query.includes("'proargtypes',p.proargtypes::text"));
  for(const altered of [query.replace(addition,""),query.replace("p.proargtypes::text","p.proargtypes::jsonb"),query.replace("session_user='postgres'","true"),query.replace("not has_schema_privilege(o.oid,n.oid,'CREATE')","true"),query.replace("p.oid=to_regprocedure($1)","true")])assert.throws(()=>assert.equal(inverse(altered),"67687b5b6b0bd34031df3374d1b04f2222a0a34fe2cb9314fae6169d2c430a60"));
});

test("canonical catalog synthetic PG17 array representation bridges only explicit text projection to exact ordered argument guards",async()=>{
  actualCanonicalCatalogProjection();
  // Synthetic contract fixtures, not executed PostgreSQL. Official PG17 source
  // establishes oidvector JSON arrays of OID strings and oidvectorout text order.
  for(const [purpose,vector,text]of [["clock",[],""],["subject",["2950","2950","2950","16"],"2950 2950 2950 16"],["fetch",["25","25","3802","25"],"25 25 3802 25"]] as const){
    const f=await actualCalendarOwner({purpose}),raw={...f.canonical,metadata:{...f.canonical.metadata,proargtypes:[...vector]}};
    assert.throws(()=>f.api.calendarOwnerFacts([raw],purpose,f.body));
    const projected={...raw,metadata:{...raw.metadata,proargtypes:vector.join(" ")}};assert.equal(projected.metadata.proargtypes,text);assert.doesNotThrow(()=>f.api.calendarOwnerFacts([projected],purpose,f.body));
    for(const bad of [undefined,null,[...vector],text+" "," "+text,"2950 2950 16 2950","2950 2950 2950","2950 2950 2950 16 16","25 25 25 3802"]){if(bad===text)continue;assert.throws(()=>f.api.calendarOwnerFacts([{...projected,metadata:{...projected.metadata,proargtypes:bad}}],purpose,f.body));}
    const missing={...projected.metadata} as Record<string,unknown>;delete missing.proargtypes;assert.throws(()=>f.api.calendarOwnerFacts([{...projected,metadata:missing}],purpose,f.body));
    for(const patch of [{oid:"wrong"},{aclQualified:false},{body:f.body+"drift"},{ownerQualified:false},{setQualified:false},{notInherited:false},{default_expr:"wrong"}])assert.throws(()=>f.api.calendarOwnerFacts([{...projected,...patch}],purpose,f.body));
    await f.factory.pool()?.end();
  }
});
