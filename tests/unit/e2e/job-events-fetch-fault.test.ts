import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { createClient } from "@supabase/supabase-js";
import ts from "typescript";

const preload = readFileSync("tests/support/job-events-fetch-fault.cjs", "utf8");
const origin = "http://127.0.0.1:54321";
const applicationUrl = "http://127.0.0.1:3100";
const controlFile = path.resolve("test-results/private/crm-read-fetch-fault.json");
const jobControlFile = path.resolve("test-results/private/job-events-fetch-fault.json");
const ownerPid = 1234;
const serverPid = 2345;
const runId = "36555423-fbb7-4420-b85d-977566676157";
const attemptId = "edc366f2-2435-4ab9-a62c-ac670d3ddaf2";
const actorUserId = "ac6d38fe-36fa-447a-b29c-62048ce39103";
const otherUserId = "a4423657-92bd-4ca6-901c-aa9936f72200";
const sessionId = "1ead1096-7604-4e20-8a05-6c5dba85a995";
const jobId = "ad385a39-47a3-4c2d-af6f-d898225ecaf3";
const now = 100_000;
const held = `${controlFile}.${runId}.${attemptId}.held`;
const release = `${controlFile}.${runId}.${attemptId}.release`;
const exactQuery = new URLSearchParams({
  select: "id,customer_type,display_name,org_nr,email,phone,city,archived_at,created_at",
  archived_at: "is.null", order: "display_name.asc",
});
const customerUrl = `${origin}/rest/v1/customers?${exactQuery}`;

function token(overrides: Record<string, unknown> = {}) {
  const claims = { role: "authenticated", aud: "authenticated", sub: actorUserId, session_id: sessionId, exp: 200, ...overrides };
  return `header.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.signature`;
}

function harness() {
  const files = new Map<string, { contents: string; symlink?: boolean }>();
  const directories = new Set<string>();
  const probes: Array<[number, number]> = [];
  const calls: { receiver: unknown; input: unknown; init: unknown }[] = [];
  const timers: Array<() => void> = [];
  let elapsed = 0;
  let wallElapsed = 0;
  const startupEnv = {
    E2E_JOB_EVENTS_FETCH_FAULT_STARTUP: "true",
    E2E_JOB_EVENTS_FETCH_FAULT_OWNER_PID: String(ownerPid),
    NEXT_PUBLIC_SUPABASE_URL: origin,
    NEXT_PUBLIC_APP_URL: applicationUrl,
  };
  const fs = {
    mkdirSync: (file: string) => directories.add(file),
    existsSync: (file: string) => files.has(file),
    lstatSync(file: string) {
      const record = files.get(file);
      if (!record && !directories.has(file)) throw new Error("ENOENT");
      return {
        isFile: () => !!record,
        isSymbolicLink: () => record?.symlink ?? false,
        size: record ? Buffer.byteLength(record.contents) : 0,
      };
    },
    readFileSync: (file: string) => files.get(file)!.contents,
    writeFileSync(file: string, contents: string, options: { flag: string; mode: number }) {
      assert.deepEqual([options.flag, options.mode], ["wx", 0o600]);
      if (files.has(file)) throw new Error("EEXIST");
      files.set(file, { contents });
    },
    renameSync(from: string, to: string) {
      files.set(to, files.get(from)!);
      files.delete(from);
    },
  };

  function load(env: Record<string, string>, pid: number) {
    const hook: { exports?: (config: { webServer: unknown }) => Promise<void> } = {};
    const sandbox = {
      module: hook, URL, Buffer, Headers, Request, Response,
      Date: { now: () => now + wallElapsed },
      performance: { now: () => elapsed },
      setTimeout(callback: () => void, delay: number) {
        assert.equal(delay, 25);
        timers.push(callback);
      },
      process: {
        cwd: process.cwd, pid, env, uptime: () => 10,
        kill: (target: number, signal: number) => probes.push([target, signal]),
        argv: ["node", path.resolve("node_modules/next/dist/bin/next"), "start", "--port", "3100"],
      },
      require(name: string) {
        if (name === "node:fs") return fs;
        if (name === "node:path") return path;
        assert.equal(name, "node:crypto");
        return { randomUUID: () => runId };
      },
      fetch: async function (this: unknown, input: unknown, init: unknown) {
        calls.push({ receiver: this, input, init });
        return Response.json([{ id: "synthetic-upstream-row" }]);
      },
    };
    vm.runInNewContext(preload, sandbox);
    return { hook: hook.exports!, fetch: sandbox.fetch as typeof globalThis.fetch };
  }

  const { fetch } = load(startupEnv, serverPid);
  return {
    fetch, files, directories, probes, calls, load, startupEnv,
    arm(overrides: Record<string, unknown> = {}) {
      files.set(controlFile, { contents: JSON.stringify({
        schemaVersion: 1, runId, attemptId, actorUserId, outcome: "error", expiresAt: now + 60_000, ...overrides,
      }) });
    },
    tick(ms: number, wallMs = ms) {
      elapsed += ms;
      wallElapsed += wallMs;
      const pending = timers.splice(0);
      for (const timer of pending) timer();
    },
  };
}

const authenticated = { headers: { Authorization: `Bearer ${token()}` } };

test("fresh singular Next boot supplies the CRM control and creates the baseline contrast directory", async () => {
  const h = harness();
  const env: Record<string, string> = {};
  const runner = h.load(env, ownerPid);
  const server = { url: applicationUrl, env: h.startupEnv, reuseExistingServer: false };
  await assert.rejects(runner.hook({ webServer: { ...server, reuseExistingServer: true } }), /fresh server handshake/);
  await assert.rejects(runner.hook({ webServer: { ...server, url: "http://127.0.0.1:3200" } }), /fresh server handshake/);
  assert.deepEqual(env, {});
  assert.equal(h.directories.has(path.resolve("tmp/private/story35-3")), false);

  await runner.hook({ webServer: server });
  assert.deepEqual(h.probes, [[ownerPid, 0], [serverPid, 0]]);
  assert.equal(h.directories.has(path.resolve("tmp/private/story35-3")), true);
  assert.equal(env.E2E_JOB_EVENTS_FETCH_FAULT_CONTROL, jobControlFile);
  assert.equal(env.E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID, runId);
  assert.equal(env.E2E_CRM_READ_FAULT_CONTROL, controlFile);
});

test("the actual customer-list reader and pinned SDK match the controlled query error", async () => {
  const h = harness();
  h.arm();
  const requests: string[] = [];
  const db = createClient(origin, "synthetic-anon-key", {
    accessToken: async () => token(),
    global: { fetch: (input, init) => {
      requests.push(input instanceof Request ? input.url : String(input));
      return h.fetch(input, init);
    } },
  });
  const readSource = ts.transpileModule(readFileSync("src/features/crm/read.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports: { readCustomerList?: () => Promise<{ rows: unknown[]; error: string | null }> } = {};
  vm.runInNewContext(readSource, {
    exports, require(name: string) {
      assert.equal(name, "@/server/db/supabase-server-client");
      return { createSupabaseServerClient: async () => db };
    },
  });
  const result = await exports.readCustomerList!();
  assert.deepEqual(requests, [customerUrl]);
  assert.equal(result.rows.length, 0);
  assert.equal(result.error, "Ett tillfälligt fel inträffade. Försök igen om en stund.");
  assert.deepEqual(h.calls, []);
});

test("only the exact request can receive the bounded PostgREST error", async () => {
  const h = harness();
  h.arm();
  const response = await h.fetch(customerUrl, authenticated);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { code: "TEST_UNAVAILABLE", message: "Synthetic customer-list fault" });
  assert.deepEqual(h.calls, []);

  for (const url of [
    customerUrl.replace(origin, "http://localhost:54321"),
    customerUrl.replace("/customers?", "/customers_other?"),
    customerUrl.replace("archived_at=is.null", "id=eq.example"),
    customerUrl.replace("display_name.asc", "display_name.desc"),
    customerUrl.replace("display_name", "personnummer"),
    `${customerUrl}&limit=1`, `${customerUrl}&order=display_name.asc`, `${customerUrl}#`,
    customerUrl.replace("127.0.0.1", "user:password@127.0.0.1"),
  ]) assert.equal((await h.fetch(url, authenticated)).status, 200, url);
  assert.equal((await h.fetch(customerUrl, { ...authenticated, method: "POST" })).status, 200);
  assert.equal((await h.fetch(new Request(customerUrl, { ...authenticated, method: "HEAD" }))).status, 200);
  assert.equal(h.calls.length, 11);
});

test("unarmed requests and wrong, privileged, or invalid session claims pass through", async () => {
  const h = harness();
  assert.equal((await h.fetch(customerUrl, authenticated)).status, 200);
  h.arm();
  for (const claims of [
    { sub: otherUserId }, { role: "anon" }, { role: "service_role" }, { aud: "anon" },
    { session_id: "invalid" }, { exp: now / 1000 }, { exp: "200" },
  ]) {
    assert.equal((await h.fetch(customerUrl, { headers: { Authorization: `Bearer ${token(claims)}` } })).status, 200);
  }
  assert.equal((await h.fetch(customerUrl)).status, 200);
  assert.equal((await h.fetch(customerUrl, { headers: { Authorization: "Bearer header.eA.signature" } })).status, 200);
  assert.equal(h.calls.length, 10);
});

test("foreign, stale, oversized, or malformed control state passes through", async () => {
  const h = harness();
  for (const overrides of [
    { schemaVersion: 2 }, { runId: attemptId }, { attemptId: [attemptId] }, { actorUserId: "unknown" },
    { expiresAt: now }, { expiresAt: now + 60_001 }, { expiresAt: "160000" },
    { outcome: "pass" }, { extra: "unsupported" },
  ]) {
    h.arm(overrides);
    assert.equal((await h.fetch(customerUrl, authenticated)).status, 200);
  }
  for (const record of [{ contents: "{" }, { contents: "{}".padEnd(2049) }, { contents: "{}", symlink: true }]) {
    h.files.set(controlFile, record);
    assert.equal((await h.fetch(customerUrl, authenticated)).status, 200);
  }
  assert.equal(h.calls.length, 12);
});

test("one fresh held request forwards the original receiver, request and options after release", async () => {
  const h = harness();
  h.arm({ outcome: "hold" });
  const receiver = { label: "original receiver" };
  const request = new Request(customerUrl, authenticated);
  const init = { cache: "no-store" } as const;
  const pending = h.fetch.call(receiver, request, init);
  assert.equal(h.files.get(held)?.contents, "held");
  assert.equal(h.calls.length, 0);
  assert.equal((await h.fetch(customerUrl, authenticated)).status, 400);
  assert.equal(h.calls.length, 0);

  h.files.set(release, { contents: "release" });
  h.tick(25);
  assert.equal((await pending).status, 200);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].receiver, receiver);
  assert.equal(h.calls[0].input, request);
  assert.equal(h.calls[0].init, init);
});

test("a hold has a monotonic deadline even if wall time moves backwards", async () => {
  const h = harness();
  h.arm({ outcome: "hold" });
  const pending = h.fetch(customerUrl, authenticated);
  assert.equal(h.files.get(held)?.contents, "held");
  h.tick(15_000, -1_000);
  assert.equal((await pending).status, 400);
  assert.deepEqual(h.calls, []);
});

test("control expiry, disarm, or replacement cannot release an old held request", async () => {
  for (const fault of ["expired", "disarmed", "replacement"]) {
    const h = harness();
    h.arm({ outcome: "hold", expiresAt: now + 25 });
    const pending = h.fetch(customerUrl, authenticated);
    assert.equal(h.files.get(held)?.contents, "held");
    if (fault === "disarmed") h.files.delete(controlFile);
    if (fault === "replacement") h.arm({ outcome: "hold", attemptId: sessionId });
    h.files.set(release, { contents: "release" });
    h.tick(25, fault === "expired" ? 25 : 0);
    assert.equal((await pending).status, 400, fault);
    assert.deepEqual(h.calls, []);
  }
});

test("pre-existing, malformed, or symlinked releases cannot forward a hold", async () => {
  for (const fault of ["pre-existing", "malformed", "symlinked"]) {
    const h = harness();
    h.arm({ outcome: "hold" });
    if (fault === "pre-existing") h.files.set(release, { contents: "release" });
    const pending = h.fetch(customerUrl, authenticated);
    assert.equal(h.files.has(held), fault !== "pre-existing");
    if (fault === "malformed") h.files.set(release, { contents: "invalid" });
    if (fault === "symlinked") h.files.set(release, { contents: "release", symlink: true });
    h.tick(25);
    assert.equal((await pending).status, 400, fault);
    assert.deepEqual(h.calls, []);
  }
});

test("the existing job-events transport fault remains independent", async () => {
  const h = harness();
  h.arm({ outcome: "hold" });
  h.files.set(jobControlFile, { contents: JSON.stringify({ schemaVersion: 1, runId, armed: true, actorUserId, jobId }) });
  const params = new URLSearchParams({
    select: "id,event_type,occurred_at", order: "occurred_at.asc,id.asc", limit: "500", offset: "0", job_id: `eq.${jobId}`,
  });
  const url = `${origin}/rest/v1/job_events?${params}`;
  await assert.rejects(h.fetch(url, authenticated), /Controlled local safe job-events transport failure/);
  assert.equal(h.files.has(held), false);
  assert.deepEqual(h.calls, []);
});

test("fixed Chromium setup publishes the same CRM control without writing the read-only contrast parent", async () => {
  const h = harness();
  const env: Record<string, string> = { KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE: "verify-application" };
  await h.load(env, ownerPid).hook({ webServer: { url: applicationUrl, env: h.startupEnv, reuseExistingServer: false } });
  assert.deepEqual([...h.directories], [path.dirname(controlFile)]);
  assert.equal(env.E2E_JOB_EVENTS_FETCH_FAULT_CONTROL, jobControlFile);
  assert.equal(env.E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID, runId);
  assert.equal(env.E2E_CRM_READ_FAULT_CONTROL, controlFile);
});
