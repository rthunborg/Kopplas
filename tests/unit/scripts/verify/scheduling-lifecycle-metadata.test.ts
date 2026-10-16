import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = (p: string) => readFileSync(p, "utf8");
const support = "tests/e2e/support/";
const spec = "tests/e2e/scheduling-views.atdd.e2e.spec.ts";
const compile = (text: string) => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const parsed = (p: string) => ts.createSourceFile(p, source(p), ts.ScriptTarget.Latest, true);
function arrow(p: string, name: string) {
  const file = parsed(p); let value = "";
  function walk(node: ts.Node) {
    if ((ts.isVariableDeclaration(node) || ts.isPropertyAssignment(node) || ts.isPropertyDeclaration(node)) && node.name?.getText(file) === name && node.initializer) value ||= node.initializer.getText(file);
    ts.forEachChild(node, walk);
  }
  walk(file); assert.ok(value, name); return value;
}
function arrows(p: string, name: string) {
  const file = parsed(p), values: string[] = [];
  function walk(node: ts.Node) { if (ts.isPropertyAssignment(node) && node.name.getText(file) === name) values.push(node.initializer.getText(file)); ts.forEachChild(node, walk); }
  walk(file); return values;
}
function fixture(options: { clock?: () => number; sink?: (s: string) => unknown } = {}) {
  const output: string[] = [], exports: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  const context = vm.createContext({ exports, Buffer, URL, Promise, performance: { now: options.clock ?? (() => 1) }, console: { info: options.sink ?? ((s: string) => output.push(s)) } });
  vm.runInContext(compile(source(support + "scheduling-lifecycle-metadata.ts")), context);
  const handlers = new Map<string, (...args: unknown[]) => void>(), contextHandlers = new Map<string, () => void>(), browserHandlers = new Map<string, () => void>();
  const frame = {}, browser = { on: (n: string, f: () => void) => browserHandlers.set(n, f), off: (n: string) => browserHandlers.delete(n) };
  const browserContext = { on: (n: string, f: () => void) => contextHandlers.set(n, f), off: (n: string) => contextHandlers.delete(n), browser: () => browser };
  const page = { on: (n: string, f: (...args: unknown[]) => void) => handlers.set(n, f), off: (n: string) => handlers.delete(n), context: () => browserContext, mainFrame: () => frame, url: () => "http://localhost/scheduling?SECRET=never-export" };
  return { api: exports, output, page, frame, handlers, contextHandlers, browserHandlers };
}
const decoded = (f: ReturnType<typeof fixture>) => JSON.parse(f.output[0]!.replace("[scheduling-lifecycle-metadata] ", ""));
function evaluate(text: string, bindings: Record<string, unknown>): any { // eslint-disable-line @typescript-eslint/no-explicit-any
  const exports: Record<string, unknown> = {};
  vm.runInNewContext(compile("const evaluated = " + text + "; exports.value=evaluated;"), { ...bindings, exports });
  return exports.value;
}
function capture(f: ReturnType<typeof fixture>, finished: Promise<unknown>, body: Promise<string>) {
  const calls: string[] = [], errors: unknown[] = [], captures: Promise<unknown>[] = []; let cancelled = false;
  const request = {}, response = { url: () => "http://localhost/scheduling?q=fixture", ok: () => true, request: () => request, finished: () => { calls.push("finished"); return finished; }, text: () => { calls.push("text"); return body; } };
  const abandoned = Symbol("native abandoned");
  const bindings = { page: f.page, lifecycle: f.api, URL, shutdownStarted: false, responseAdmissionOpen: true, captureOrigin: "http://localhost", admitted: new WeakMap(), requestOrdinal: 0, captureCount: 0, fulfilledCount: 0, rejectedCount: 0, captures, payloads: [], abandoned, ensureActive: () => { if (cancelled) throw abandoned; }, updateTiming: (fn: () => void) => fn(), relativeTime: () => 1, recordFailure: (e: unknown) => errors.push(e), snapshot: () => {} };
  evaluate(arrow(spec, "read"), bindings)(response);
  return { calls, errors, captures, cancel: () => { cancelled = true; }, abandoned };
}
test("lifecycle import and unactivated hooks are inert", () => {
  const f = fixture(); f.api.mark(f.page, "attempt-start"); f.api.finish(f.page);
  assert.equal(f.handlers.size, 0); assert.equal(f.output.length, 0);
});
test("lifecycle joins only identical requests and records bounded sequence", () => {
  let clock = 0; const f = fixture({ clock: () => clock++ }); f.api.activate(f.page, 1);
  const a = {}, b = {}; f.api.mark(f.page, "response-admitted", "event", a, 7, 2); f.api.mark(f.page, "request-failed", "event", a); f.api.mark(f.page, "request-failed", "event", b); f.api.finish(f.page);
  const rows = decoded(f).rows; assert.deepEqual(rows.map((r: { seq: number }) => r.seq), [1, 2, 3, 4]); assert.equal(rows[2].requestOrdinal, 7); assert.equal(rows[3].requestOrdinal, null);
});
test("actual original native failure snapshot still contains exact20 keys", () => {
  const output: string[] = [];
  const entry = { request: { method: () => "GET" }, response: { status: () => 200, headers: () => ({ "content-type": "text/x-component" }) }, requestOrdinal: 1, captureOrdinal: 1, queryPresent: true, phase: "finished", responseMs: 1, finishedStartMs: 2, finishedEndMs: null, bodyStartMs: null, bodyEndMs: null, requestFailedMs: null };
  const fn = evaluate(arrow(spec, "snapshot"), { observerOpen: true, snapshotAttempted: false, updateTiming: (operation: () => void) => operation(), relativeTime: () => 3, captureCount: 1, fulfilledCount: 0, rejectedCount: 0, Buffer, console: { info: (s: string) => output.push(s) } }); fn(entry, "requestfailed");
  const row = JSON.parse(output[0]!.replace("[scheduling-native-response-failure] ", ""));
  assert.deepEqual(Object.keys(row), ["kind", "trigger", "path", "queryPresent", "method", "status", "contentType", "requestOrdinal", "captureOrdinal", "phase", "responseMs", "finishedStartMs", "finishedEndMs", "bodyStartMs", "bodyEndMs", "requestFailedMs", "captureCount", "fulfilledCount", "rejectedCount", "pendingCount"]);
});
test("actual capture retains finished-before-text with no added wait", async () => {
  const f = fixture(); f.api.activate(f.page, 0); let release!: (x: null) => void;
  const c = capture(f, new Promise(resolve => { release = resolve; }), Promise.resolve("payload")); assert.deepEqual(c.calls, ["finished"]);
  release(null); await Promise.all(c.captures); assert.deepEqual(c.calls, ["finished", "text"]); assert.deepEqual(c.errors, []); f.api.finish(f.page);
});
test("actual capture retains native first error under observer sink failure", async () => {
  const f = fixture({ sink: () => { throw new Error("observer"); } }); f.api.activate(f.page, 0); const native = new Error("native");
  const c = capture(f, Promise.reject(native), Promise.resolve("unused")); await Promise.all(c.captures); assert.equal(c.errors[0], native); assert.deepEqual(c.calls, ["finished"]); f.api.finish(f.page);
});
test("actual cancellation and late settlements cannot invoke text or publish again", async () => {
  const f = fixture(); f.api.activate(f.page, 0); let release!: (x: null) => void;
  const c = capture(f, new Promise(resolve => { release = resolve; }), Promise.resolve("unused")); c.cancel(); f.api.finish(f.page); const frozen = f.output[0]; release(null); await Promise.all(c.captures);
  assert.deepEqual(c.calls, ["finished"]); assert.equal(f.output[0], frozen); assert.equal(f.output.length, 1);
});
test("actual six abort hooks preserve original promise arguments and native failures", async () => {
  const f = fixture(); f.api.activate(f.page, 0);
  const sources = [source(support + "scheduling-views-atdd.ts"), source(support + "booking-editor-atdd.ts")];
  const hooks = sources.flatMap(s => [...s.matchAll(/lifecycle\.observeAbort\((this\.page|page), "([a-z-]+)", \(\) => route\.abort\("failed"\)\)/g)]);
  assert.equal(hooks.length, 6);
  for (const hook of hooks) {
    for (const reject of [false, true]) {
      let calls = 0; const native = new Error("native abort"); const promise = reject ? Promise.reject(native) : Promise.resolve();
      const route = { abort: (reason: string) => { assert.equal(reason, "failed"); calls++; return promise; } };
      const run = evaluate("() => " + hook[0].replace("this.page", "page"), { page: f.page, lifecycle: f.api, route }); const returned = run(); assert.equal(returned, promise); if (reject) await assert.rejects(returned, error => error === native); else await returned; assert.equal(calls, 1);
    }
  }
  let continued = 0;
  const route = { request: () => ({ method: () => "GET", headers: () => ({}) }), continue: async () => { continued++; } };
  const work = evaluate(arrow(support + "booking-editor-atdd.ts", "routeWork"), { page: f.page, lifecycle: f.api }); await work(route); assert.equal(continued, 1); f.api.finish(f.page);
});
test("actual normal fixture release does not invent framework page close", async () => {
  const f = fixture(); f.api.activate(f.page, 0); const fn = evaluate(arrows(support + "resource-cdp-attachment.ts", "resourcePage")[0]!, { lifecycle: f.api });
  await fn({ page: f.page }, async () => {}); assert.ok(decoded(f).rows.some((r: { event: string }) => r.event === "fixture-release")); assert.ok(!decoded(f).rows.some((r: { event: string }) => r.event === "page-close"));
});
test("actual attached fixture preserves close order and failed-close error", async () => {
  for (const failed of [false, true]) {
    const f = fixture(); f.api.activate(f.page, 0); const calls: string[] = [], error = new Error("native close");
    const page = Object.assign(f.page, { close: async () => { calls.push("page-close"); if (failed) throw error; } });
    const context = { newPage: async () => page, close: async () => { calls.push("context-close"); } };
    const browser = { newContext: async () => context };
    const fn = evaluate(arrows(support + "resource-cdp-attachment.ts", "resourcePage")[1]!, { lifecycle: f.api, chromium: { connectOverCDP: async () => browser }, cdpEndpoint: "mock" });
    const run = fn({}, async () => {}, { project: { use: {} } }); if (failed) await assert.rejects(run, x => x === error); else await run;
    assert.deepEqual(calls, failed ? ["page-close"] : ["page-close", "context-close"]); assert.equal(f.output.length, 1);
  }
});
test("actual lifecycle events remove only own listeners and export no URL", () => {
  const f = fixture(); f.api.activate(f.page, 0); f.handlers.get("framenavigated")!(f.frame); f.handlers.get("crash")!(); f.contextHandlers.get("close")!(); f.browserHandlers.get("disconnected")!(); f.api.finish(f.page);
  assert.equal(f.handlers.size + f.contextHandlers.size + f.browserHandlers.size, 0); assert.ok(!f.output[0]!.includes("SECRET")); assert.ok(decoded(f).rows.some((r: { route: string }) => r.route === "scheduling"));
  const partial = fixture(); const broken = { ...partial.page, context: () => { throw new Error("unavailable context"); } }; partial.api.activate(broken, 0); partial.api.finish(broken); assert.equal(decoded(partial).flags.listenerUnavailable, true);
});
test("actual row request and encoded byte caps are failclosed metadata only", () => {
  for (const identities of [false, true]) {
    const f = fixture(); f.api.activate(f.page, 0); for (let i = 0; i < 120; i++) f.api.mark(f.page, "request-admitted", "event", identities ? {} : undefined); f.api.finish(f.page);
    const out = decoded(f); assert.equal(out.flags.overflow, true); assert.ok(out.rows.length <= 96); assert.ok(Buffer.byteLength(f.output[0]!) <= 32768 + 32); assert.ok(out.rows.every((r: unknown) => Buffer.byteLength(JSON.stringify(r)) <= 256));
  }
});
test("actual invalid backwards and expired clocks stay partial without timers", () => {
  for (const last of [-1, NaN, 300001]) { let n = 0; const f = fixture({ clock: () => n }); f.api.activate(f.page, 0); n = last; f.api.mark(f.page, "drain"); f.api.finish(f.page); assert.equal(decoded(f).availability, "partial"); }
});
test("actual closed schema rejects arbitrary strings without reading request getters", () => {
  const f = fixture(); f.api.activate(f.page, 0); const sensitive = Object.defineProperty({}, "url", { get() { throw new Error("MUST NOT READ"); } });
  f.api.mark(f.page, "request-admitted", "event", sensitive); f.api.mark(f.page, "password SECRET"); f.api.finish(f.page); assert.equal(decoded(f).flags.privacyRejected, true); assert.ok(!f.output[0]!.includes("SECRET"));
});
test("actual publication adapter handles sync async pending and late failures without await", async () => {
  for (const kind of ["throw", "reject", "pending", "getter"]) {
    let calls = 0;
    const f = fixture({ sink: () => { calls++; if (kind === "throw") throw new Error("observer"); if (kind === "reject") return Promise.reject(new Error("observer")); if (kind === "pending") return new Promise(() => {}); return Object.defineProperty({}, "then", { get() { throw new Error("observer"); } }); } });
    f.api.activate(f.page, 0); f.api.finish(f.page); f.api.finish(f.page); await Promise.resolve(); await Promise.resolve(); assert.equal(calls, 1);
  }
});
test("actual hook sources preserve original operations and no product instrumentation", () => {
  assert.ok(source(spec).includes("const failure = await response.finished();")); assert.ok(source(spec).includes("const payload = await response.text();")); assert.match(source(spec), /test\.setTimeout\(180_000\)/);
  assert.equal((source(support + "scheduling-views-atdd.ts") + source(support + "booking-editor-atdd.ts")).match(/route\.abort\("failed"\)/g)!.length, 6);
  const recorderSource = source(support + "scheduling-lifecycle-metadata.ts"); assert.doesNotMatch(recorderSource, /setTimeout|setInterval|newCDPSession|\.close\(|\.abort\(|\.text\(|\.headers\(/); assert.ok(!recorderSource.includes("router.refresh"));
});
test("actual unchanged duration reporter counts retry durations and keeps overbudget failure", async () => {
  const exports: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  vm.runInNewContext(compile(source("tests/e2e/ci-duration-budget-reporter.ts")), { exports, require: () => ({ assertDurationWithinBudget: ({ elapsedMs, maxMs }: { elapsedMs: number; maxMs: number }) => { if (elapsedMs > maxMs) throw new Error("overbudget"); } }), console: { log() {}, error() {} } });
  const reporter = new exports.default({ maxMs: 800000 }); reporter.onTestEnd({}, { duration: 800000 }); reporter.onTestEnd({}, { duration: 54328 }); assert.equal((await reporter.onEnd()).status, "failed"); assert.match(source("playwright.config.ts"), /maxMs: 800_000/);
});
