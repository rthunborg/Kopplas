import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import * as nodeModule from "node:module";
import { createJobsDepthPhaseDiagnostics, jobsDepthDiagnosticPhases, registerJobsDepthPhaseDiagnostics } from "../../support/jobs-depth-phase-diagnostics";

type Snapshot = { activePhase: string | null; elapsedMs: number; phases: { phase: string; elapsedMs: number; started: number; returned: number; rejected: number }[] };
const snapshot = (meta: object) => (meta as { jobsDepthPhaseV1: Snapshot }).jobsDepthPhaseV1;
type RequestTiming = { state: string; requests: { subjectOrdinal: number; requestOrdinal: number; startElapsedMs: number;
  outerElapsedMs: number; outerState: string; requestState: string; headersElapsedMs: number | "UNAVAILABLE";
  proxyMs: number | "UNAVAILABLE"; upstreamMs: number | "UNAVAILABLE" }[] };
const requestSnapshot = (meta: object) => (meta as { jobsDepthPhaseV1: { requestTiming: RequestTiming } }).jobsDepthPhaseV1.requestTiming;

test("RLS phase evidence is fixed, bounded, failure-only and immutable after abort", () => {
  const meta = {}, controller = new AbortController(); let now = 10;
  let failed!: () => void, finished!: () => void;
  const phase = registerJobsDepthPhaseDiagnostics({ task: { meta }, signal: controller.signal,
    onTestFailed: fn => { failed = fn; }, onTestFinished: fn => { finished = fn; } }, () => now);
  phase("import-helper", "started"); now = 30; phase("import-helper", "returned");
  phase("fixture-role", "started"); now = 50;
  assert.deepEqual(meta, {});
  controller.abort("PRIVATE reason must never enter metadata");
  now = 900; phase("fixture-role", "returned"); phase("fixture-cleanup", "started");
  failed(); const value = snapshot(meta);
  assert.equal(value.activePhase, "fixture-role"); assert.equal(value.elapsedMs, 40);
  assert.deepEqual(value.phases, [
    { phase: "import-helper", started: 1, returned: 1, rejected: 0, elapsedMs: 20 },
    { phase: "fixture-role", started: 1, returned: 0, rejected: 0, elapsedMs: 20 },
  ]);
  assert.ok(Object.isFrozen(value) && Object.isFrozen(value.phases) && value.phases.every(Object.isFrozen));
  failed(); finished(); assert.equal(snapshot(meta), value);
  assert.ok(!JSON.stringify(meta).includes("PRIVATE"));
});

test("RLS phase ordinary rejection and cleanup retain distinct timing without error values", () => {
  const meta = {}; let now = 0;
  const d = createJobsDepthPhaseDiagnostics(meta, () => now);
  d.observe("assert-role-read", "started"); now = 3; d.observe(null, "rejected");
  d.observe("fixture-cleanup", "started"); now = 600_900; d.observe("fixture-cleanup", "returned"); d.publishFailure();
  assert.equal(snapshot(meta).elapsedMs, 600_000);
  assert.deepEqual(snapshot(meta).phases, [
    { phase: "assert-role-read", started: 1, returned: 0, rejected: 1, elapsedMs: 3 },
    { phase: "fixture-cleanup", started: 1, returned: 1, rejected: 0, elapsedMs: 600_000 },
  ]);
});

test("RLS phase foreign metadata, hostile metadata, invalid clock/labels and excessive counts are contained", () => {
  const foreign = { kept: true }, occupied = { jobsDepthPhaseV1: foreign };
  createJobsDepthPhaseDiagnostics(occupied).publishFailure(); assert.equal(occupied.jobsDepthPhaseV1, foreign);
  let getters = 0; const accessor = Object.defineProperty({}, "jobsDepthPhaseV1", { get() { getters++; throw Error("PRIVATE"); } });
  const hostile = new Proxy({}, { getPrototypeOf() { throw Error("PRIVATE"); } });
  for (const meta of [accessor, hostile, Object.freeze({})]) assert.doesNotThrow(() => createJobsDepthPhaseDiagnostics(meta).publishFailure());
  assert.equal(getters, 0);
  for (const clock of [() => { throw Error("PRIVATE"); }, () => NaN, () => -1]) {
    const meta = {}, d = createJobsDepthPhaseDiagnostics(meta, clock); d.observe("fixture-role", "started"); d.publishFailure(); assert.deepEqual(meta, {});
  }
  for (const mode of ["invalid", "overlap", "count", "backwards"] as const) {
    const meta = {}; let now = 2; const d = createJobsDepthPhaseDiagnostics(meta, () => now);
    if (mode === "invalid") d.observe("PRIVATE" as never, "started");
    if (mode === "overlap") { d.observe("fixture-role", "started"); d.observe("fixture-clients", "started"); }
    if (mode === "backwards") { d.observe("fixture-role", "started"); now = 1; d.observe("fixture-role", "returned"); }
    if (mode === "count") for (let i = 0; i < 101; i++) { d.observe("fixture-role", "started"); d.observe("fixture-role", "returned"); }
    d.publishFailure(); assert.deepEqual(meta, {});
  }
  assert.ok(jobsDepthDiagnosticPhases.length <= 40);
});

const strip = (nodeModule as unknown as { stripTypeScriptTypes(source: string): string }).stripTypeScriptTypes;
function actualWithFixture(create: (observer?: unknown, fetchOverride?: unknown) => Promise<{ dispose(): Promise<void> }>) {
  const source = readFileSync(new URL("../../support/jobs-depth-atdd.ts", import.meta.url), "utf8");
  const observer = source.slice(source.indexOf("function phaseObserver("), source.indexOf("export async function createJobsDepthFixture("));
  const wrapper = source.slice(source.indexOf("export async function withJobsDepthFixture("), source.indexOf("export function cardInput("));
  return new Function("createJobsDepthFixture", `${strip(observer + wrapper.replace("export ", ""))}; return withJobsDepthFixture;`)(create) as
    (run: (fixture: unknown) => Promise<void>, observer?: (...args: unknown[]) => void, fetchOverride?: typeof fetch) => Promise<void>;
}

test("actual helper keeps callback/cleanup order and original rejection identity even when observer throws", async () => {
  for (const mode of ["success", "callback-error", "cleanup-error", "setup-error"] as const) {
    for (const observed of [false, true]) {
      const events: string[] = [], inner = Error("SYNTHETIC inner"), cleanup = Error("SYNTHETIC cleanup"), setup = Error("SYNTHETIC setup");
      const run = actualWithFixture(async () => { events.push("setup"); if (mode === "setup-error") throw setup;
        return { async dispose() { events.push("cleanup"); if (mode === "cleanup-error") throw cleanup; } }; });
      const result = await run(async () => { events.push("callback"); if (mode === "callback-error" || mode === "cleanup-error") throw inner; },
        observed ? () => { throw Error("SYNTHETIC observer"); } : undefined).catch(error => error);
      assert.equal(result, mode === "success" ? undefined : mode === "callback-error" ? inner : mode === "setup-error" ? setup : cleanup);
      assert.deepEqual(events, mode === "setup-error" ? ["setup"] : ["setup", "callback", "cleanup"]);
    }
  }
});

test("actual fixture forwards only its explicit fetch seam without changing setup/callback/cleanup order", async () => {
  const events: string[] = [], observer = () => {}, delegate = (() => Promise.resolve({} as Response)) as typeof fetch;
  const run = actualWithFixture(async (phase, fetchOverride) => {
    events.push("setup"); assert.equal(phase, observer); assert.equal(fetchOverride, delegate);
    return { async dispose() { events.push("cleanup"); } };
  });
  await run(async () => { events.push("callback"); }, observer, delegate);
  assert.deepEqual(events, ["setup", "callback", "cleanup"]);
});

test("RLS request capture forwards once without inspecting arguments or bodies and leaves disarmed calls alone", async () => {
  const meta = {}; let now = 0, bodyReads = 0, headerReads = 0;
  const input = new Proxy({}, { get() { throw Error("PRIVATE input"); } }) as Request;
  const init = new Proxy({}, { get() { throw Error("PRIVATE init"); } }) as RequestInit;
  const response = Object.defineProperty({ headers: { get(name: string) {
    headerReads++; assert.ok(["x-kong-proxy-latency", "x-kong-upstream-latency"].includes(name)); return name.includes("proxy") ? "0" : "321";
  } } }, "body", { get() { bodyReads++; throw Error("PRIVATE body"); } }) as unknown as Response;
  const calls: unknown[][] = [], original = Promise.resolve(response), receiver = {};
  const delegate = function (this: unknown, ...args: unknown[]) { assert.equal(this, receiver); calls.push(args); return original; } as typeof fetch;
  const d = createJobsDepthPhaseDiagnostics(meta, () => now, delegate);
  assert.equal(d.fetch.call(receiver, input, init), original, "disarmed path preserves the delegate promise");
  assert.equal(headerReads, 0);
  d.observe("assert-own-read", "started"); now = 2;
  const pending = d.fetch.call(receiver, input, init); now = 12;
  assert.equal(await pending, response); now = 15; d.observe("assert-own-read", "returned");
  d.publishFailure();
  assert.deepEqual(calls, [[input, init], [input, init]]); assert.equal(bodyReads, 0); assert.equal(headerReads, 2);
  assert.deepEqual(requestSnapshot(meta), { version: 1, state: "captured", requests: [{ subjectOrdinal: 0, requestOrdinal: 1,
    startElapsedMs: 2, outerElapsedMs: 15, outerState: "returned", requestState: "headers", headersElapsedMs: 10, proxyMs: 0, upstreamMs: 321 }] });
  assert.ok(!JSON.stringify(meta).includes("PRIVATE"));
});

test("RLS request capture accepts only bounded canonical integer Kong values", async () => {
  for (const value of [null, "", " 1", "1 ", "01", "+1", "-1", "1.0", "1e2", "1,2", "1ms", "NaN", "Infinity", "600001", "99999999999999999999", "throw", "0", "600000"]) {
    const meta = {}; let now = 0;
    const response = { headers: { get() { if (value === "throw") throw Error("PRIVATE header"); return value; } } } as unknown as Response;
    const d = createJobsDepthPhaseDiagnostics(meta, () => now, (() => Promise.resolve(response)) as typeof fetch);
    d.observe("assert-own-read", "started"); const pending = d.fetch("PRIVATE URL"); now = 1;
    assert.equal(await pending, response); d.observe("assert-own-read", "returned"); d.publishFailure();
    const expected = value === "0" ? 0 : value === "600000" ? 600000 : "UNAVAILABLE";
    assert.equal(requestSnapshot(meta).requests[0].proxyMs, expected);
    assert.equal(requestSnapshot(meta).requests[0].upstreamMs, expected);
    assert.ok(!JSON.stringify(meta).includes("PRIVATE"));
  }
});

test("RLS request capture preserves synchronous and async rejection identity and request-only failures preserve phases", async () => {
  for (const mode of ["sync", "async", "clock", "headers-clock", "overflow", "subject"] as const) {
    const meta = {}; let now = 0, calls = 0;
    const original = Error("PRIVATE original"), response = { headers: { get() { return null; } } } as unknown as Response;
    const d = createJobsDepthPhaseDiagnostics(meta, () => now, (() => {
      calls++; if (mode === "sync") throw original; if (mode === "headers-clock") now = NaN;
      return mode === "async" ? Promise.reject(original) : Promise.resolve(response);
    }) as typeof fetch);
    if (mode === "subject") { d.observe("assert-own-read", "started"); d.observe("assert-own-read", "returned"); }
    d.observe("assert-own-read", "started");
    if (mode === "clock") now = NaN;
    if (mode === "sync") assert.throws(() => d.fetch("PRIVATE URL"), error => error === original);
    else if (mode === "async") await assert.rejects(d.fetch("PRIVATE URL"), error => error === original);
    else for (let i = 0; i < (mode === "overflow" ? 5 : 1); i++) assert.equal(await d.fetch("PRIVATE URL"), response);
    now = 10; d.observe("assert-own-read", "returned"); d.publishFailure();
    assert.equal(snapshot(meta).phases[0].returned, mode === "subject" ? 2 : 1);
    assert.equal(calls, mode === "overflow" ? 5 : 1);
    assert.equal(requestSnapshot(meta).state, ["clock", "headers-clock", "overflow", "subject"].includes(mode) ? "unavailable" : "captured");
    if (["clock", "headers-clock", "overflow", "subject"].includes(mode)) assert.deepEqual(requestSnapshot(meta).requests, []);
    assert.ok(!JSON.stringify(meta).includes("PRIVATE"));
  }
});

test("RLS request ordinals and the complete 36-record limit stay bounded without adding requests", async () => {
  const meta = {}; let calls = 0;
  const response = { headers: { get() { return null; } } } as unknown as Response;
  const d = createJobsDepthPhaseDiagnostics(meta, () => 0, (() => { calls++; return Promise.resolve(response); }) as typeof fetch);
  const phases = ["assert-own-read", ...Array(5).fill("assert-role-read"), ...Array(3).fill("assert-inactive-read")] as const;
  for (const phase of phases) {
    d.observe(phase, "started");
    for (let i = 0; i < 4; i++) assert.equal(await d.fetch("PRIVATE URL"), response);
    d.observe(phase, "returned");
  }
  d.publishFailure(); const rows = requestSnapshot(meta).requests;
  assert.equal(rows.length, 36); assert.equal(calls, 36);
  assert.deepEqual(rows.map(row => row.subjectOrdinal), Array.from({ length: 9 }, (_, i) => Array(4).fill(i)).flat());
  assert.deepEqual(rows.map(row => row.requestOrdinal), Array(9).fill([1, 2, 3, 4]).flat());
});

test("RLS fixed subject ordinals and pending headers freeze before late response or outer completion", async () => {
  const meta = {}, abort = new AbortController(); let now = 0, failed!: () => void, headerReads = 0;
  let resolve!: (response: Response) => void;
  const pending = new Promise<Response>(done => { resolve = done; });
  const phase = registerJobsDepthPhaseDiagnostics({ task: { meta }, signal: abort.signal,
    onTestFailed: fn => { failed = fn; }, onTestFinished: () => {} }, () => now, (() => pending) as typeof fetch);
  phase("assert-own-read", "started"); phase("assert-own-read", "returned");
  for (let i = 0; i < 5; i++) { phase("assert-role-read", "started"); phase("assert-role-read", "returned"); }
  phase("assert-inactive-read", "started"); now = 2;
  const result = phase.fetch("PRIVATE URL"); now = 12; abort.abort(); failed();
  const frozen = requestSnapshot(meta), serialized = JSON.stringify(meta);
  assert.deepEqual(frozen.requests, [{ subjectOrdinal: 6, requestOrdinal: 1, startElapsedMs: 2,
    outerElapsedMs: 12, outerState: "pending", requestState: "pending", headersElapsedMs: "UNAVAILABLE", proxyMs: "UNAVAILABLE", upstreamMs: "UNAVAILABLE" }]);
  const response = { headers: { get() { headerReads++; return "123"; } } } as unknown as Response;
  now = 900; resolve(response); assert.equal(await result, response);
  phase("assert-inactive-read", "returned"); failed();
  assert.equal(JSON.stringify(meta), serialized); assert.equal(headerReads, 0);
  assert.ok(Object.isFrozen(frozen) && Object.isFrozen(frozen.requests) && frozen.requests.every(Object.isFrozen));
});

test("actual authenticated factory default options, local guard, sign-in and observer are unchanged", async () => {
  const source = readFileSync(new URL("../../factories/tenants/core.ts", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  const factory = source.slice(source.indexOf("export async function makeAuthedServerClient("), source.indexOf("/**\n * Delete a single", source.indexOf("export async function makeAuthedServerClient(")));
  for (const override of [undefined, 0, 1, 2, (() => Promise.resolve({} as Response)) as typeof fetch]) for (const refuse of [false, true]) {
    const events: string[] = [], user = { email: "synthetic@example.test", password: "synthetic-password" };
    const client = { auth: { async signInWithPassword(input: unknown) { events.push("signin"); assert.deepEqual(input, user); return { error: null }; } } };
    const observed = {}, guardError = Error("SYNTHETIC local guard refusal");
    const make = new Function("assertLocalStack", "createClient", "LOCAL_SUPABASE_URL", "LOCAL_SUPABASE_ANON_KEY", "observeQuoteSendRpcs",
      `${strip(factory.replace("export ", ""))}; return makeAuthedServerClient;`)(
      () => { events.push("guard"); if (refuse) throw guardError; }, (url: string, key: string, options: unknown) => {
        events.push("client"); assert.equal(url, "synthetic-loopback"); assert.equal(key, "synthetic-key");
        assert.deepEqual(options, { auth: { autoRefreshToken: false, persistSession: false }, ...(typeof override === "function" ? { global: { fetch: override } } : {}) });
        return client;
      }, "synthetic-loopback", "synthetic-key", (value: unknown) => { events.push("observer"); assert.equal(value, client); return { client: observed }; });
    if (refuse) { await assert.rejects(make(user, override), error => error === guardError); assert.deepEqual(events, ["guard"]); }
    else { assert.equal(await make(user, override), observed); assert.deepEqual(events, ["guard", "client", "signin", "observer"]); }
  }
});

test("actual installed Vitest timeout and JsonReporter preserve frozen phase, original failure and pass outcome", { timeout: 45_000 }, () => {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  mkdirSync(join(root, "tmp/private"), { recursive: true });
  const directory = mkdtempSync(join(root, "tmp/private/rls001-phase-proof-"));
  const fixture = join(directory, "synthetic-phase.test.ts"), report = join(directory, "native.json"), proof = join(directory, "proof.json");
  const helper = fileURLToPath(new URL("../../support/jobs-depth-phase-diagnostics.ts", import.meta.url)).replaceAll("\\", "/");
  writeFileSync(fixture, `import {test,afterAll} from 'vitest';
import {writeFileSync} from 'node:fs';
import {registerJobsDepthPhaseDiagnostics} from ${JSON.stringify(helper)};
let finishLate; const late=new Promise(resolve=>{finishLate=resolve});
let timedMeta,initial,passedMeta,originalPreserved=false,lateAttempted=false,headerReads=0;
test('synthetic timeout transport',async context=>{
  const response={headers:{get(){headerReads++;return '321'}}};
  timedMeta=context.task.meta; const phase=registerJobsDepthPhaseDiagnostics(context,undefined,()=>new Promise(resolve=>setTimeout(()=>resolve(response),120)));
  phase('assert-own-read','started');
  await phase.fetch('SYNTHETIC input');
  initial=timedMeta.jobsDepthPhaseV1;
  phase('assert-own-read','returned');phase('fixture-cleanup','started');lateAttempted=true;finishLate();
},20);
test('synthetic original error',async context=>{
  const original=new Error('SYNTHETIC original error');
  const phase=registerJobsDepthPhaseDiagnostics(context,undefined,()=>Promise.reject(original));
  phase('assert-role-read','started');
  try {await phase.fetch('SYNTHETIC input')} catch(error) {originalPreserved=error===original;throw error}
});
test('synthetic pass',context=>{passedMeta=context.task.meta;const phase=registerJobsDepthPhaseDiagnostics(context);phase('fixture-role','started');phase('fixture-role','returned')});
afterAll(async()=>{await late;writeFileSync(${JSON.stringify(proof)},JSON.stringify({lateAttempted,frozen:Object.isFrozen(initial),same:initial===timedMeta.jobsDepthPhaseV1,originalPreserved,passHasMeta:Object.hasOwn(passedMeta,'jobsDepthPhaseV1'),headerReads}))});
`, "utf8");
  const config = join(directory, "vitest.config.mjs");
  writeFileSync(config, `export default {root:${JSON.stringify(directory)},envDir:${JSON.stringify(directory)},test:{include:['synthetic-phase.test.ts'],environment:'node',setupFiles:[],globalSetup:[],testTimeout:1000,hookTimeout:1000,retry:0,fileParallelism:false,maxWorkers:1,pool:'forks'}}`, "utf8");
  const result = spawnSync(process.execPath, [join(root, "node_modules/vitest/vitest.mjs"), "run", "--config", config, "--reporter=json", "--outputFile", report],
    { cwd: directory, timeout: 35_000, maxBuffer: 1_048_576, encoding: "utf8", windowsHide: true });
  assert.equal(result.error, undefined, "bounded synthetic runner must complete"); assert.equal(result.signal, null); assert.equal(result.status, 1, "two deliberate synthetic failures expected");
  const native = JSON.parse(readFileSync(report, "utf8"));
  assert.equal(native.numTotalTests, 3); assert.equal(native.numFailedTests, 2); assert.equal(native.numPassedTests, 1); assert.equal(native.numPendingTests, 0);
  const assertions = native.testResults[0].assertionResults;
  const timeout = assertions.find((entry: { title: string }) => entry.title === "synthetic timeout transport");
  assert.equal(timeout.status, "failed"); assert.equal(timeout.meta.jobsDepthPhaseV1.activePhase, "assert-own-read");
  assert.equal(timeout.meta.jobsDepthPhaseV1.phases[0].returned, 0);
  assert.equal(timeout.meta.jobsDepthPhaseV1.requestTiming.requests[0].requestState, "pending");
  assert.equal(timeout.meta.jobsDepthPhaseV1.requestTiming.requests[0].headersElapsedMs, "UNAVAILABLE");
  const original = assertions.find((entry: { title: string }) => entry.title === "synthetic original error");
  assert.equal(original.status, "failed"); assert.ok(original.failureMessages.some((value: string) => value.includes("SYNTHETIC original error")));
  assert.equal(original.meta.jobsDepthPhaseV1.activePhase, "assert-role-read");
  assert.equal(original.meta.jobsDepthPhaseV1.requestTiming.requests[0].requestState, "rejected");
  assert.deepEqual(JSON.parse(readFileSync(proof, "utf8")), { lateAttempted: true, frozen: true, same: true, originalPreserved: true, passHasMeta: false, headerReads: 0 });
});
