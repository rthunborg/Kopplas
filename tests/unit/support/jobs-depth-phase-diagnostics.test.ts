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
function actualWithFixture(create: (observer?: unknown) => Promise<{ dispose(): Promise<void> }>) {
  const source = readFileSync(new URL("../../support/jobs-depth-atdd.ts", import.meta.url), "utf8");
  const observer = source.slice(source.indexOf("function phaseObserver("), source.indexOf("export async function createJobsDepthFixture("));
  const wrapper = source.slice(source.indexOf("export async function withJobsDepthFixture("), source.indexOf("export function cardInput("));
  return new Function("createJobsDepthFixture", `${strip(observer + wrapper.replace("export ", ""))}; return withJobsDepthFixture;`)(create) as
    (run: (fixture: unknown) => Promise<void>, observer?: (...args: unknown[]) => void) => Promise<void>;
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
let timedMeta,initial,passedMeta,originalPreserved=false,lateAttempted=false;
test('synthetic timeout transport',async context=>{
  timedMeta=context.task.meta; const phase=registerJobsDepthPhaseDiagnostics(context);
  phase('import-helper','started');
  await new Promise(resolve=>setTimeout(resolve,120));
  initial=timedMeta.jobsDepthPhaseV1;
  phase('import-helper','returned');phase('fixture-cleanup','started');lateAttempted=true;finishLate();
},20);
test('synthetic original error',async context=>{
  const phase=registerJobsDepthPhaseDiagnostics(context),original=new Error('SYNTHETIC original error');
  phase('assert-role-read','started');
  try {throw original} catch(error) {originalPreserved=error===original;throw error}
});
test('synthetic pass',context=>{passedMeta=context.task.meta;const phase=registerJobsDepthPhaseDiagnostics(context);phase('fixture-role','started');phase('fixture-role','returned')});
afterAll(async()=>{await late;writeFileSync(${JSON.stringify(proof)},JSON.stringify({lateAttempted,frozen:Object.isFrozen(initial),same:initial===timedMeta.jobsDepthPhaseV1,originalPreserved,passHasMeta:Object.hasOwn(passedMeta,'jobsDepthPhaseV1')}))});
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
  assert.equal(timeout.status, "failed"); assert.equal(timeout.meta.jobsDepthPhaseV1.activePhase, "import-helper");
  assert.equal(timeout.meta.jobsDepthPhaseV1.phases[0].returned, 0);
  const original = assertions.find((entry: { title: string }) => entry.title === "synthetic original error");
  assert.equal(original.status, "failed"); assert.ok(original.failureMessages.some((value: string) => value.includes("SYNTHETIC original error")));
  assert.equal(original.meta.jobsDepthPhaseV1.activePhase, "assert-role-read");
  assert.deepEqual(JSON.parse(readFileSync(proof, "utf8")), { lateAttempted: true, frozen: true, same: true, originalPreserved: true, passHasMeta: false });
});
