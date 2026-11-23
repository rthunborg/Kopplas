import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { createClient } from "@supabase/supabase-js";
import ts from "typescript";
import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

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
const markerHeader = "x-kopplas-e2e-request-marker";
const requestMarker = "c550779c-8fc7-44e7-aac8-3bc26bb41d18";
const secondMarker = "11788b30-697d-42f8-b7c0-8668ba755ced";
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
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
      assert.ok(Buffer.byteLength(contents) <= 2048);
      if (files.has(file)) throw new Error("EEXIST");
      files.set(file, { contents });
    },
    renameSync(from: string, to: string) {
      files.set(to, files.get(from)!);
      files.delete(from);
    },
    linkSync(from: string, to: string) {
      if (files.has(to)) throw new Error("EEXIST");
      files.set(to, files.get(from)!);
    },
    unlinkSync(file: string) {if (!files.delete(file)) throw new Error("ENOENT");},
  };

  function load(env: Record<string, string>, pid: number) {
    const hook: { exports?: (config: { webServer: unknown }) => Promise<void> } = {};
    const servers: Array<{receiver: unknown; args: unknown[]}> = [];
    const http = {
      createServer(this: unknown, ...args: unknown[]) {
        servers.push({receiver: this, args});
        return {listener: args.find(value => typeof value === "function") as (...args: unknown[]) => unknown};
      },
    };
    const originalCreateServer = http.createServer;
    const sandbox = {
      module: hook, URL, Buffer, Headers, Request, Response,
      Date: { now: () => now + wallElapsed },
      performance: { now: () => elapsed },
      setTimeout(callback: () => void, delay: number) {
        assert.equal(delay, 25);
        timers.push(callback);
        return {unref() {}};
      },
      process: {
        cwd: process.cwd, pid, env, uptime: () => 10,
        kill: (target: number, signal: number) => probes.push([target, signal]),
        argv: ["node", path.resolve("node_modules/next/dist/bin/next"), "start", "--port", "3100"],
      },
      require(name: string) {
        if (name === "node:fs") return fs;
        if (name === "node:path") return path;
        if (name === "node:http") return http;
        if (name === "node:async_hooks") return {AsyncLocalStorage};
        assert.equal(name, "node:crypto");
        return { randomUUID: () => runId, createHash };
      },
      fetch: async function (this: unknown, input: unknown, init: unknown) {
        calls.push({ receiver: this, input, init });
        return Response.json([{ id: "synthetic-upstream-row" }]);
      },
    };
    vm.runInNewContext(preload, sandbox);
    return { hook: hook.exports!, fetch: sandbox.fetch as typeof globalThis.fetch, http, originalCreateServer, servers };
  }

  const server = load(startupEnv, serverPid);
  return {
    ...server, files, directories, probes, calls, load, startupEnv,
    incoming<T>(listener: (request: {headers: Record<string, string>; rawHeaders: string[]}, response: unknown) => T,
      marker: string | null = requestMarker, overrides: Record<string, unknown> = {}): T {
      const request = {method: "GET", url: "/customers", headers: {host: "127.0.0.1:3100", ...(marker === null ? {} : {[markerHeader]: marker})},
        rawHeaders: ["Host", "127.0.0.1:3100", ...(marker === null ? [] : ["X-Kopplas-E2e-Request-Marker", marker])], ...overrides};
      const created = server.http.createServer(listener);
      return Reflect.apply(created.listener, created, [request, {original: "response"}]) as T;
    },
    releaseHeld(file = held) {
      const receipt = JSON.parse(files.get(file)!.contents);
      files.set(file.replace(/\.held$/, ".release"), {contents: JSON.stringify({...receipt, released: true})});
    },
    timerCount: () => timers.length,
    arm(overrides: Record<string, unknown> = {}) {
      files.set(controlFile, { contents: JSON.stringify({
        schemaVersion: 1, runId, attemptId, actorUserId, outcome: "error", expiresAt: now + 60_000, ...overrides,
        ...(overrides.outcome === "hold" && !Object.hasOwn(overrides, "requestMarkers") ? {requestMarkers: [requestMarker]} : {}),
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
  const pending = h.incoming(() => h.fetch.call(receiver, request, init));
  assert.equal(h.files.has(held), true);
  assert.equal(h.calls.length, 0);
  assert.equal((await h.fetch(customerUrl, authenticated)).status, 400);
  assert.equal(h.calls.length, 0);

  h.releaseHeld();
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
  const pending = h.incoming(() => h.fetch(customerUrl, authenticated));
  assert.equal(h.files.has(held), true);
  h.tick(15_000, -1_000);
  assert.equal((await pending).status, 400);
  assert.deepEqual(h.calls, []);
});

test("control expiry, disarm, or replacement cannot release an old held request", async () => {
  for (const fault of ["expired", "disarmed", "replacement"]) {
    const h = harness();
    h.arm({ outcome: "hold", expiresAt: now + 25 });
    const pending = h.incoming(() => h.fetch(customerUrl, authenticated));
    assert.equal(h.files.has(held), true);
    if (fault === "disarmed") h.files.delete(controlFile);
    if (fault === "replacement") h.arm({ outcome: "hold", attemptId: sessionId });
    h.releaseHeld();
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
    const pending = h.incoming(() => h.fetch(customerUrl, authenticated));
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

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => {resolve = done;});
  return {promise, resolve};
}

test("incoming wrapper preserves server construction, listener receiver, arguments, return and original errors", async () => {
  const h = harness(), receiver = {}, options = {}, response = {};
  const request = {method: "GET", url: "/ordinary", headers: {host: "original"}, rawHeaders: ["Host", "original"]};
  const result = {}, original = {original: true};
  const listener = function (this: unknown, incoming: unknown, outgoing: unknown) {
    assert.equal(this, receiver); assert.equal(incoming, request); assert.equal(outgoing, response); return result;
  };
  const server = h.http.createServer.call(receiver, options, listener);
  assert.equal(h.servers[0].receiver, receiver); assert.equal(h.servers[0].args[0], options);
  assert.equal(Reflect.apply(server.listener, receiver, [request, response]), result);
  const throwing = h.http.createServer(() => {throw original;});
  assert.throws(() => throwing.listener(request, response), error => error === original);
  const rejecting = h.http.createServer(async () => {await Promise.resolve(); throw original;});
  await assert.rejects(rejecting.listener(request, response) as Promise<void>, error => error === original);
  const promised = Promise.resolve(result), returning = h.http.createServer(() => promised);
  assert.equal(returning.listener(request, response), promised);
  const runner = h.load({}, ownerPid);
  assert.equal(runner.http.createServer, runner.originalCreateServer);
});

test("real async contexts remain isolated across awaited interleaving and bind the exact first claimed read", async () => {
  const h = harness(), a = deferred(), b = deferred(), enteredB = deferred();
  h.arm({outcome: "hold", requestMarkers: [requestMarker, secondMarker]});
  const first = h.incoming(async request => {
    assert.equal(Object.hasOwn(request.headers, markerHeader), false);
    assert.equal(request.rawHeaders.some(value => value.toLowerCase() === markerHeader), false);
    await Promise.resolve(); await a.promise; return h.fetch(customerUrl, authenticated);
  });
  const receiver = {}, outgoing = new Request(customerUrl, authenticated), options = {cache: "no-store"} as const;
  const second = h.incoming(async () => {
    await Promise.resolve(); await b.promise;
    const pending = h.fetch.call(receiver, outgoing, options); enteredB.resolve(); return pending;
  }, secondMarker);
  assert.equal((await h.fetch(customerUrl, authenticated)).status, 400);
  assert.equal(h.files.has(held), false);
  b.resolve(); await enteredB.promise;
  const receipt = JSON.parse(h.files.get(held)!.contents);
  assert.ok(receipt.markerDigest === digest(secondMarker));
  assert.equal(h.files.get(held)!.contents.includes(requestMarker), false);
  assert.equal(h.files.get(held)!.contents.includes(secondMarker), false);
  a.resolve(); assert.equal((await first).status, 400);
  assert.equal(h.calls.length, 0);
  h.releaseHeld(); h.tick(25);
  assert.equal((await second).status, 200);
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0].receiver, receiver);
  assert.equal(h.calls[0].input, outgoing); assert.equal(h.calls[0].init, options);
  assert.equal(new Headers(outgoing.headers).has(markerHeader), false);
  h.files.delete(controlFile); h.tick(25);
  assert.equal(h.timerCount(), 0);
});

test("missing malformed unregistered duplicated redirected and reused markers cannot bind or forward a matching hold", async () => {
  for (const variant of ["missing", "malformed", "unregistered", "duplicate", "redirected", "prefetch", "reused"] as const) {
    const h = harness(); h.arm({outcome: "hold"});
    if (variant === "reused") h.incoming(() => undefined);
    const marker = variant === "missing" ? null : variant === "malformed" ? "invalid" : variant === "unregistered" ? secondMarker : requestMarker;
    const overrides = variant === "duplicate" ? {rawHeaders: [markerHeader, requestMarker, markerHeader, requestMarker]}
      : variant === "redirected" ? {url: "/different-route"}
        : variant === "prefetch" ? {headers: {[markerHeader]: requestMarker, "next-router-prefetch": "1"}} : {};
    const response = await h.incoming(async request => {
      assert.equal(Object.hasOwn(request.headers, markerHeader), false);
      assert.equal(request.rawHeaders.some(value => value.toLowerCase() === markerHeader), false);
      return h.fetch(customerUrl, authenticated);
    }, marker, overrides);
    assert.equal(response.status, 400, variant); assert.equal(h.files.has(held), false, variant); assert.equal(h.calls.length, 0, variant);
  }
});

test("old attempt context and removed registration refuse a held read while ordinary reads remain unchanged", async () => {
  for (const variant of ["attempt", "registration"] as const) {
    const h = harness(), gate = deferred(); h.arm({outcome: "hold"});
    const pending = h.incoming(async () => {await gate.promise; return h.fetch(customerUrl, authenticated);});
    h.arm({outcome: "hold", ...(variant === "attempt" ? {attemptId: sessionId} : {requestMarkers: []})});
    gate.resolve(); assert.equal((await pending).status, 400);
    assert.equal(h.files.has(held), false); assert.equal(h.calls.length, 0);
  }
  const h = harness(); h.arm({outcome: "hold", requestMarkers: []});
  assert.equal((await h.incoming(() => h.fetch(customerUrl, authenticated))).status, 400);
  assert.equal((await h.fetch(customerUrl.replace("/customers?", "/ordinary?"), authenticated)).status, 200);
  assert.equal(h.calls.length, 1);
});

test("foreign or oversized release receipts cannot forward the owned held operation", async () => {
  for (const patch of [{runId: sessionId}, {attemptId: sessionId}, {actorUserId: otherUserId}, {expiresAt: now},
    {markerDigest: digest(secondMarker)}, {extra: true}, {extra: "x".repeat(2048)}]) {
    const h = harness(); h.arm({outcome: "hold"});
    const pending = h.incoming(() => h.fetch(customerUrl, authenticated));
    const receipt = JSON.parse(h.files.get(held)!.contents);
    h.files.set(release, {contents: JSON.stringify({...receipt, released: true, ...patch})});
    h.tick(25); assert.equal((await pending).status, 400); assert.equal(h.calls.length, 0);
  }
});

test("marker registration control is bounded and expiry or disarm clears its private registry timer", async () => {
  const h = harness();
  h.arm({outcome: "hold", requestMarkers: Array.from({length: 9}, (_, index) => `c550779c-8fc7-44e7-aac8-${String(index).padStart(12, "0")}`)});
  assert.equal((await h.incoming(() => h.fetch(customerUrl, authenticated))).status, 200);
  assert.equal(h.files.has(held), false); assert.equal(h.timerCount(), 0);
  for (const disarm of [false, true]) {
    const active = harness(); active.arm({outcome: "hold", expiresAt: now + 25});
    const pending = active.incoming(() => active.fetch(customerUrl, authenticated));
    if (disarm) active.files.delete(controlFile);
    active.tick(25); assert.equal((await pending).status, 400); assert.equal(active.timerCount(), 0);
  }
});

test("one incoming context cannot claim another held operation before or after its release", async () => {
  const h = harness(); h.arm({outcome: "hold"});
  await h.incoming(async () => {
    const first = h.fetch(customerUrl, authenticated);
    assert.equal((await h.fetch(customerUrl, authenticated)).status, 400);
    h.releaseHeld(); h.tick(25);
    assert.equal((await first).status, 200);
    assert.equal((await h.fetch(customerUrl, authenticated)).status, 400);
    assert.equal(h.calls.length, 1);
  });
});

const crmSource = readFileSync("tests/e2e/crm/customers.e2e.spec.ts", "utf8");
const crmAst = ts.createSourceFile("customers.e2e.spec.ts", crmSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
function findNode(predicate: (node: ts.Node) => boolean, root: ts.Node = crmAst): ts.Node {
  let found: ts.Node | undefined;
  function visit(node: ts.Node) {if (!found && predicate(node)) found = node; if (!found) ts.forEachChild(node, visit);}
  visit(root); assert.ok(found, "Expected actual P0 source node"); return found;
}
const p0Call = findNode(node => ts.isCallExpression(node) && node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])
  && node.arguments[0].text.startsWith("[P0] E35-6-T-error-retry")) as ts.CallExpression;
const p0Callback = p0Call.arguments[1] as ts.ArrowFunction;
function browserFunctions(names: string[], scope: Record<string, unknown>) {
  const functions = names.map(name => findNode(node => ts.isFunctionDeclaration(node) && node.name?.text === name, p0Callback).getText(crmAst));
  const compiled = ts.transpileModule(functions.join("\n"), {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
  const exports: Record<string, (...args: unknown[]) => unknown> = {};
  vm.runInNewContext(compiled + `\nObject.assign(exports, {${names.join(",")}});`, {Buffer, ...scope, exports});
  return exports;
}

test("actual P0 receipt selector joins the registered Request object and refuses foreign or replaced receipts", () => {
  const request = {}, other = {}, registered = new Map([[digest(requestMarker), request]]);
  const attempt = {attemptId, expiresAt: now + 60_000, held};
  const receipt = {schemaVersion: 1, runId, attemptId, actorUserId, expiresAt: attempt.expiresAt, markerDigest: digest(requestMarker)};
  let contents = JSON.stringify(receipt);
  const api = browserFunctions(["readHeldBinding", "selectHeldRequest"], {
    runId, control: controlFile, ownedControl: "owned", Date: {now: () => now}, isolated: {adminA: {id: actorUserId}}, markerRequests: registered,
    readControl: (file: string) => file === held ? contents : "owned",
  });
  assert.equal(api.selectHeldRequest(attempt), request); assert.notEqual(api.selectHeldRequest(attempt), other);
  for (const patch of [{attemptId: sessionId}, {actorUserId: otherUserId}, {markerDigest: digest(secondMarker)}, {extra: true}]) {
    contents = JSON.stringify({...receipt, ...patch});
    assert.throws(() => api.selectHeldRequest(attempt), /ownership refused/);
  }
  contents = JSON.stringify(receipt, null, 1);
  assert.throws(() => api.selectHeldRequest(attempt), /ownership refused/);
});

test("actual P0 completion predicate rejects another object's event, pre-release completion and metadata without native completion", () => {
  const assignment = findNode(node => ts.isBinaryExpression(node) && ts.isIdentifier(node.left)
    && node.left.text === "retryConfirmed", p0Callback) as ts.BinaryExpression;
  const completions = new WeakMap(), request = {}, other = {};
  const compiled = ts.transpileModule(`function check(request: object, response: {ok(): boolean}, finished: boolean) {return ${assignment.right.getText(crmAst)};}`,
    {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
  const exports: {check?: (request: object, response: {ok(): boolean}, finished: boolean) => boolean} = {};
  vm.runInNewContext(compiled + "exports.check = check;", {exports, retryCompletions: completions});
  const response = {ok: () => true};
  assert.equal(exports.check!(request, response, true), false);
  completions.set(other, true); assert.equal(exports.check!(request, response, true), false);
  completions.set(request, false); assert.equal(exports.check!(request, response, true), false);
  completions.set(request, true); assert.equal(exports.check!(request, response, false), false);
  assert.equal(exports.check!(request, {ok: () => false}, true), false);
  assert.equal(exports.check!(request, response, true), true);
});

test("only actual P0 uses the public derived trace-off test type and guards before marker transmission", () => {
  assert.ok(ts.isIdentifier(p0Call.expression) && p0Call.expression.text === "p0Test");
  const derived = findNode(node => ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "p0Test") as ts.VariableDeclaration;
  let trace: unknown;
  vm.runInNewContext(derived.initializer!.getText(crmAst), {test: {extend: (options: {trace: unknown}) => {trace = options.trace;}}});
  assert.equal(trace, "off");
  let derivedCalls = 0;
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "p0Test") derivedCalls++;
    ts.forEachChild(node, visit);
  }
  visit(crmAst); assert.equal(derivedCalls, 1);
  const firstStatement = (p0Callback.body as ts.Block).statements[0].getText(crmAst);
  const check = (trace: string) => vm.runInNewContext(firstStatement, {trace, expect: (actual: string) => ({toBe: (expected: string) => assert.equal(actual, expected)})});
  check("off"); assert.throws(() => check("on-first-retry"));
});

test("installed Playwright resolves the actual public P0 extension to trace off while other cases retain configured retry tracing", () => {
  const require = createRequire(import.meta.url);
  const {test: ordinary} = require("@playwright/test");
  const playwrightRequire = createRequire(require.resolve("@playwright/test"));
  const root = path.dirname(playwrightRequire.resolve("playwright/package.json"));
  const {fixtures: {FixturePool}} = playwrightRequire(path.join(root, "lib/common/index.js"));
  const derivedDeclaration = findNode(node => ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "p0Test") as ts.VariableDeclaration;
  const derived = vm.runInNewContext(derivedDeclaration.initializer!.getText(crmAst), {test: ordinary});
  function resolved(testType: object) {
    // Qualification only: use the installed pool's actual option-resolution logic,
    // including project retry tracing, rather than simulate fixture precedence.
    const symbol = Object.getOwnPropertySymbols(testType).find(value => value.description === "testType");
    assert.ok(symbol);
    const implementation = (testType as Record<symbol, {fixtures: unknown}>)[symbol];
    const pool = new FixturePool(implementation.fixtures, () => assert.fail("Actual trace fixture resolution refused"), undefined, undefined,
      {overrides: {trace: "on-first-retry"}, location: {file: "synthetic-project", line: 1, column: 1}});
    return pool.resolve("trace");
  }
  assert.equal(resolved(ordinary).fn, "on-first-retry");
  const p0 = resolved(derived);
  assert.equal(p0.fn, "off"); assert.equal(p0.scope, "worker");
});

test("actual P0 route registers at most eight requests, retains original headers and uses fallback chaining", async () => {
  const requestMarkers: string[] = [], markerRequests = new Map();
  let contents = JSON.stringify({schemaVersion: 1, runId, attemptId, actorUserId, outcome: "hold", expiresAt: now + 60_000, requestMarkers: []});
  let count = 0, forwarded = 0, aborted = false;
  const api = browserFunctions(["isPrefetch", "blockPrefetch"], {
    clickStarted: true, hold: {attemptId}, released: false, control: controlFile, runId,
    ownedControl: contents, requestMarkerHeader: markerHeader, requestMarkers, markerRequests, createHash,
    crypto: {randomUUID: () => `c550779c-8fc7-44e7-aac8-${String(++count).padStart(12, "0")}`}, Date: {now: () => now},
    readControl: () => contents,
    publish: (_file: string, next: string, previous: string) => {assert.ok(previous === contents); assert.ok(Buffer.byteLength(next) <= 2048); contents = next;},
  });
  const headers = {cookie: "synthetic-in-memory-cookie", rsc: "1", "x-original": "retained"};
  const route = () => {
    const request = {method: () => "GET", headers: () => ({rsc: "1"}), allHeaders: async () => headers, redirectedFrom: () => null};
    return {request: () => request, abort: async () => {aborted = true;}, fallback: async (options: {headers: Record<string, string>}) => {
      forwarded++;
      assert.ok(Object.entries(headers).every(([key, value]) => options.headers[key] === value));
      assert.ok(typeof options.headers[markerHeader] === "string");
      assert.ok(markerRequests.get(digest(options.headers[markerHeader])) === request);
    }};
  };
  for (let index = 0; index < 8; index++) await api.blockPrefetch(route());
  assert.equal(forwarded, 8); assert.equal(requestMarkers.length, 8); assert.equal(markerRequests.size, 8);
  assert.equal(Object.hasOwn(headers, markerHeader), false);
  const before = contents;
  await assert.rejects(api.blockPrefetch(route()) as Promise<void>, /registration refused/);
  assert.equal(aborted, true); assert.equal(forwarded, 8); assert.ok(contents === before);
});

test("actual P0 route leaves ordinary POST and pre-click traffic unchanged and refuses redirected markers", async () => {
  for (const variant of ["post", "pre-click", "redirect", "existing-marker", "prefetch"] as const) {
    const requestMarkers: string[] = [], markerRequests = new Map();
    let forwarded = false, aborted = false;
    const api = browserFunctions(["isPrefetch", "blockPrefetch"], {
      clickStarted: variant !== "pre-click", hold: {attemptId}, released: false, requestMarkerHeader: markerHeader,
      requestMarkers, markerRequests,
    });
    const headers = variant === "existing-marker" ? {[markerHeader]: "synthetic-refused"} : variant === "prefetch" ? {purpose: "prefetch"} : {};
    const request = {method: () => variant === "post" ? "POST" : "GET", headers: () => headers,
      allHeaders: async () => headers, redirectedFrom: () => variant === "redirect" ? {} : null};
    const route = {request: () => request, abort: async () => {aborted = true;}, fallback: async (options?: unknown) => {
      assert.equal(options, undefined); forwarded = true;
    }};
    if (variant === "redirect" || variant === "existing-marker") await assert.rejects(api.blockPrefetch(route) as Promise<void>, /registration refused/);
    else await api.blockPrefetch(route);
    assert.equal(forwarded, variant === "post" || variant === "pre-click");
    assert.equal(aborted, variant !== "post" && variant !== "pre-click");
    assert.equal(markerRequests.size, 0); assert.equal(requestMarkers.length, 0);
  }
});

test("actual P0 private cleanup refuses changed files and release ownership, and publish rejects oversized controls", () => {
  const removed: string[] = [];
  let contents: string | undefined = "changed";
  const api = browserFunctions(["removeOwned", "releaseHold", "publish"], {
    readControl: () => contents, rmSync: (file: string) => {removed.push(file);},
    control: controlFile, ownedControl: "owned",
  });
  assert.throws(() => api.removeOwned("synthetic", "owned"), /ownership changed/); assert.equal(removed.length, 0);
  contents = "owned"; api.removeOwned("synthetic", "owned"); assert.equal(removed.length, 1);
  contents = undefined; api.removeOwned("synthetic", "owned"); assert.equal(removed.length, 1);
  assert.throws(() => api.releaseHold({}), /not held/);
  assert.throws(() => api.publish(controlFile, "x".repeat(2049)), /size refused/);
});
