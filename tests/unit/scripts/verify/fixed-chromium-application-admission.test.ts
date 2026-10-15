import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import vm from "node:vm";
import ts from "typescript";
import { test } from "node:test";
import { bounded, checkApplicationArguments, checkPinnedCandidate, inspectReport, runApplication, runCompatibility,
  runOwnedChild, sealEnvironment, validateProvenance, createHostedOwner, SOURCES, VISUALS } from "../../../diagnostics/fixed-chromium-application-runner.mjs";
import { FIXED, validateReceipt } from "../../../diagnostics/no-store-stream-probe.mjs";

const sha = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
const source = (path: string) => readFileSync(path, "utf8");
const candidate = () => ({ executable: "/runner/kopplas-fixed-chromium-abc/chrome-linux64/chrome", receipt: {
  artifact: "chrome-for-testing-public-158.0.8104.0-linux64", platform: "linux64", version: "158.0.8104.0",
  revision: "1717709", generation: "1791951285551907", zipBytes: 202355055,
  zipMd5: "4bc3c2aa1a735657f7d063a96d84baa2", zipSha256: "6d15a1a00e6c8a97d04783ccb3ee0ec79ecf964dca75aff5ca8e39c3a270fa1b",
  sha256Authority: "computed-acquired-bytes", executable: { version: "158.0.8104.0", bytes: 304586056,
    sha256: "831b57f57d85e72f5a633f4ab2974bdc7047739119838fd774cbf06b3fd907c6", product: "full-chrome" },
} });
const bindings = () => Object.fromEntries(SOURCES.map(path => [path, { bytes: 10, sha256: sha(path) }]));
const nativeReport = () => {
  const png = Buffer.from([137,80,78,71,13,10,26,10,1,2,3]);
  const specs = Array.from({ length: 382 }, (_, i) => ({ id: `test-${i}`, file: i < 18 ? "scheduling-views.atdd.e2e.spec.ts" : "other.e2e.spec.ts",
    tests: [{ projectId: "chromium", projectName: "chromium", status: "expected",
      results: [{ status: "passed", retry: 0, duration: 1, attachments: i === 0 ? VISUALS.map(name => ({ name, contentType: "image/png", body: png.toString("base64") })) : [] }] }] }));
  return { suites: [{ specs, suites: [] }], errors: [], stats: { expected: 382, unexpected: 0, skipped: 0, flaky: 0 } };
};
function fixture() {
  const history: string[] = [], sources = bindings();
  const state = { report: nativeReport(), exit: 0, signal: null as string | null, expired: false,
    captures: [] as unknown[], changed: false, invocations: 0, compatibility: 0 };
  const io = {
    platform: "linux", version: "v22.23.3", argv: ["node", "runner", "--verify-application", candidate().executable],
    env: { CI: "true", SUPABASE_TEST_REQUIRED: "1" },
    gitIdentity: async () => ({ executionSha: "a".repeat(40), sourceTree: "b".repeat(40) }),
    bindings: async () => state.changed ? { ...sources, "package.json": { bytes: 9, sha256: "f".repeat(64) } } : sources,
    freshOutput: async () => { history.push("fresh"); },
    admitCandidate: async () => { history.push("admit"); return candidate(); },
    packageAdmission: async () => ({ provenance: { node: "v22.23.3", sdk: "1.61.1", testManifestSha256: "c".repeat(64),
      playwrightManifestSha256: "d".repeat(64), coreManifestSha256: "e".repeat(64),
      sourceSha256: sources["tests/diagnostics/no-store-stream-probe.mjs"].sha256,
      packageSha256: sources["package.json"].sha256, lockSha256: sources["pnpm-lock.yaml"].sha256, nvmSha256: sources[".nvmrc"].sha256 } }),
    bounded: async <T>(task: Promise<T>, ms: number) => { assert.equal(ms, 15000); return task; },
    compatibility: async () => { state.compatibility++; history.push("compatibility"); return { version: "158.0.8104.0", closed: true }; },
    cliPath: async () => "/installed/@playwright/test/cli.js",
    application: async (path: string, env: Record<string,string>, cli: string) => {
      assert.equal(path, "playwright.fixed-chromium-application.config.ts"); assert.equal(cli, "/installed/@playwright/test/cli.js");
      assert.equal(env.KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE, "verify-application"); state.invocations++; history.push("application");
      return { code: state.exit, signal: state.signal, expired: state.expired };
    },
    readReport: async () => Buffer.from(JSON.stringify(state.report)),
    readAttachment: async () => { throw new Error("DENIED native filesystem"); },
    writeProvenance: async (record: unknown) => { state.captures.push(JSON.parse(JSON.stringify(record))); },
  };
  const run = () => runApplication(io as unknown as Parameters<typeof runApplication>[0]);
  return { io, state, history, run };
}

test("actual runner admits one compatibility launch then one full CLI and binds all eleven captures", async () => {
  const f = fixture(), result = await f.run(); assert.equal(result.exitCode, 0);
  assert.equal(f.state.invocations, 1); assert.equal(f.state.compatibility, 1);
  assert.deepEqual(f.history, ["fresh", "admit", "compatibility", "admit", "application"]);
  const record = JSON.parse(JSON.stringify(result.record)) as { visuals: unknown[]; population: { schedulingPassed: number } };
  assert.equal(record.visuals.length, 11); assert.equal(record.population.schedulingPassed, 18);
  assert.equal(f.state.captures.length, 1);
});
for (const [name, mutate] of [
  ["wrong flag", (f: ReturnType<typeof fixture>) => { f.io.argv[2] = "--paired-fixed-chromium"; }],
  ["extra selector", (f: ReturnType<typeof fixture>) => { f.io.argv.push("--grep", "AC2"); }],
  ["wrong platform", (f: ReturnType<typeof fixture>) => { f.io.platform = "win32"; }],
  ["wrong Node", (f: ReturnType<typeof fixture>) => { f.io.version = "v24.0.0"; }],
  ["missing local-stack gate", (f: ReturnType<typeof fixture>) => { f.io.env.SUPABASE_TEST_REQUIRED = "0"; }],
  ["not CI", (f: ReturnType<typeof fixture>) => { f.io.env.CI = "false"; }],
] as const) test(`actual argv refuses ${name} before any native route`, async () => {
  const f = fixture(); mutate(f); assert.throws(() => checkApplicationArguments(f.io));
  const result = await f.run(); assert.notEqual(result.exitCode, 0); assert.equal(f.state.invocations, 0); assert.equal(f.state.compatibility, 0);
});
for (const stage of ["admitCandidate", "packageAdmission", "compatibility", "cliPath"] as const) {
  test(`actual runner ${stage} failure never executes application and late settlement cannot promote it`, async () => {
    const f = fixture(); const methods = f.io as unknown as Record<string, () => Promise<unknown>>;
    methods[stage] = async () => { throw new Error("admission"); };
    const result = await f.run(); assert.notEqual(result.exitCode, 0); assert.equal(f.state.invocations, 0);
    await Promise.resolve(); assert.equal(f.state.invocations, 0);
  });
}
for (const field of ["zipSha256", "version", "generation", "sha256Authority"] as const) test(`actual computed pin refuses wrong ${field}`, () => {
  const value = candidate(); value.receipt[field] = "wrong"; assert.throws(() => checkPinnedCandidate(value));
});
test("actual receipt pin rejects unknown data rather than publishing it", () => {
  const value = candidate(); Object.assign(value.receipt, { url: "PRIVATE" }); assert.throws(() => checkPinnedCandidate(value));
});
test("actual runner stops on revalidation or source mutation before CLI", async () => {
  const f = fixture(); f.io.compatibility = async () => { f.state.changed = true; return { version: "158.0.8104.0", closed: true }; };
  const result = await f.run(); assert.equal(result.failure, "binding"); assert.equal(f.state.invocations, 0);
});
test("original failed native child exit and physical response failures remain failed", async () => {
  const f = fixture(); f.state.exit = 7;
  const result = await f.run(); assert.equal(result.exitCode, 7); assert.equal(result.record?.cli.nativeExit, 7); assert.equal(result.failure, "suite");
});
test("native cancellation is aborted, never successful", async () => {
  const f = fixture(); f.state.signal = "SIGTERM";
  const result = await f.run(); assert.notEqual(result.exitCode, 0); assert.equal(result.record?.cli.state, "aborted");
});
for (const fault of ["missing report", "malformed report", "capture missing", "skipped scheduling", "flaky", "interrupted", "budget", "duplicate ID"] as const) test(`actual report refuses ${fault}`, async () => {
  const f = fixture(), first = f.state.report.suites[0].specs[0].tests[0];
  if (fault === "missing report") f.io.readReport = async () => { throw new Error("report"); };
  if (fault === "malformed report") f.io.readReport = async () => Buffer.from("{");
  if (fault === "capture missing") first.results[0].attachments.pop();
  if (fault === "skipped scheduling") { first.status = "skipped"; first.results[0].status = "skipped"; f.state.report.stats.expected--; f.state.report.stats.skipped++; }
  if (fault === "flaky") { first.status = "flaky"; f.state.report.stats.expected--; f.state.report.stats.flaky++; }
  if (fault === "interrupted") first.results[0].status = "interrupted";
  if (fault === "budget") first.results[0].duration = 800001;
  if (fault === "duplicate ID") f.state.report.suites[0].specs[1].id = "test-0";
  const result = await f.run(); assert.notEqual(result.exitCode, 0); assert.equal(f.state.invocations, 1); assert.equal(result.record?.cli.nativeExit, 0);
});
test("actual report counters preserve serial retry results distinctly", async () => {
  const value = nativeReport(); const row = value.suites[0].specs[0].tests[0];
  row.status = "unexpected"; row.results = [{ status: "failed", retry: 0, duration: 20, attachments: [] }, { status: "failed", retry: 1, duration: 25, attachments: [] }];
  value.stats.expected--; value.stats.unexpected++;
  const result = await inspectReport(Buffer.from(JSON.stringify(value)), async () => { throw new Error("DENIED"); });
  assert.equal(result.population.titles, 382); assert.equal(result.population.attempts, 383); assert.equal(result.population.failed, 2); assert.equal(result.population.schedulingPassed, 17);
});
test("actual runner rejects stale exclusive output and provenance write failures", async () => {
  const f = fixture(); f.io.freshOutput = async () => { throw new Error("write"); };
  assert.notEqual((await f.run()).exitCode, 0); assert.equal(f.state.invocations, 0);
  const g = fixture(); g.io.writeProvenance = async () => { throw new Error("write"); };
  assert.equal((await g.run()).failure, "write");
});
test("sealed environment rejects caller selector/report/node injection without changing source config", () => {
  const value = sealEnvironment({ PLAYWRIGHT_JSON_OUTPUT_NAME: "foreign", PW_TEST_HTML_REPORT: "foreign", NODE_OPTIONS: "foreign", SUPABASE_TEST_REQUIRED: "1" }, candidate().executable);
  assert.equal(value.SUPABASE_TEST_REQUIRED, "1"); assert.equal(value.PLAYWRIGHT_JSON_OUTPUT_NAME, undefined); assert.equal(value.NODE_OPTIONS, undefined);
});
test("actual compatibility code confirms exact launch options/version and awaited close", async () => {
  const events: string[] = [];
  const browser = { version: () => "158.0.8104.0", close: async () => { events.push("close"); } };
  const actions = { admitCandidate: async () => candidate(), packageAdmission: async () => ({ chromium: { launch: async (options: unknown) => {
    assert.deepEqual(options, { executablePath: candidate().executable, channel: "chromium", headless: true, timeout: 15000 }); events.push("launch"); return browser;
  } } }) };
  assert.deepEqual(await runCompatibility(candidate().executable, actions), { version: "158.0.8104.0", closed: true }); assert.deepEqual(events, ["launch", "close"]);
  browser.version = () => "149.0.7827.55"; await assert.rejects(runCompatibility(candidate().executable, actions)); assert.equal(events.at(-1), "close");
});

function config(path: string, env = { CI: "true", KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE: "verify-application", FIXED_CHROMIUM_EXECUTABLE: candidate().executable }) {
  const text = ts.transpileModule(source(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: Record<string, unknown> = {};
  const require = (name: string): unknown => name === "@playwright/test" ? { defineConfig: (value: unknown) => value, devices: { "Desktop Chrome": { viewport: { width: 1280, height: 720 }, defaultBrowserType: "chromium" } } }
    : name === "./playwright.config" ? { default: config("playwright.config.ts", env) }
      : name === "./tests/support/test-env" ? new Proxy({}, { get: (_target, key) => String(key) }) : (() => { throw new Error(`DENIED import ${name}`); })();
  vm.runInNewContext(text, { exports, require, process: { env, platform: "linux", version: "v22.23.3" } });
  return exports.default as Record<string, unknown>;
}
test("actual effective config preserves complete original inventory/setup/use/budgets and isolates only allowed fields", () => {
  const original = config("playwright.config.ts"), fixed = config("playwright.fixed-chromium-application.config.ts");
  for (const field of Object.keys(original).filter(k => !["use", "projects", "reporter"].includes(k))) assert.deepEqual(JSON.parse(JSON.stringify(fixed[field])), JSON.parse(JSON.stringify(original[field])));
  const originalUse = original.use as Record<string,unknown>, fixedUse = fixed.use as Record<string,unknown>;
  for (const field of Object.keys(originalUse)) assert.deepEqual(fixedUse[field], originalUse[field]);
  assert.equal(fixedUse.channel, "chromium"); assert.deepEqual(JSON.parse(JSON.stringify(fixedUse.launchOptions)), { executablePath: candidate().executable });
  assert.equal(fixed.outputDir, "test-results/fixed-chromium-application/results/");
  assert.match(JSON.stringify(fixed.reporter), /800000/); assert.equal((fixed.projects as unknown[]).length, 1);
});
test("actual isolated config refuses direct/default/missing-candidate invocation", () => {
  for (const env of [{ CI: "true", KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE: "", FIXED_CHROMIUM_EXECUTABLE: candidate().executable },
    { CI: "true", KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE: "verify-application", FIXED_CHROMIUM_EXECUTABLE: "" }]) assert.throws(() => config("playwright.fixed-chromium-application.config.ts", env));
});

test("actual export-only inverse recovers full independently reviewed probe", () => {
  const after = readFileSync("tests/diagnostics/no-store-stream-probe.mjs");
  const inverse = after.toString().replace("export async function admitCandidate(path)", "async function admitCandidate(path)").replace("export async function packageAdmission()", "async function packageAdmission()");
  assert.equal(sha(inverse.replaceAll("\r\n", "\n")), "e4ff29811169cff384d9d75ad992730e5726a34f8659287763be24ddef7bfd67");
});
test("actual workflow inverse preserves every original job/input/gate/authority byte", () => {
  const after = source(".github/workflows/ci.yml");
  const inverse = after.replace(/      # FIXED-APPLICATION-INPUT-BEGIN\n[\s\S]*?      # FIXED-APPLICATION-INPUT-END\n/, "")
    .replace(/\n  # FIXED-APPLICATION-JOB-BEGIN\n[\s\S]*?  # FIXED-APPLICATION-JOB-END\n$/, "");
  assert.equal(sha(inverse.replaceAll("\r\n", "\n")), "25c9f3672f4538a95d5fb573421739ae14be757d0a2b72fc39e756dfcae1d304");
});
const ci = source(".github/workflows/ci.yml"), optional = ci.slice(ci.indexOf("  # FIXED-APPLICATION-JOB-BEGIN"));
const expression = optional.match(/    if: \$\{\{ ([^\n]+) \}\}/)?.[1];
function eligible(event: string, verify: string, general: string, opt: boolean, cancelled = false) {
  assert.ok(expression);
  return vm.runInNewContext(expression, { always: () => true, cancelled: () => cancelled,
    github: { event_name: event }, inputs: { fixed_chromium_application_verification: opt }, needs: { verify: { result: verify }, e2e: { result: general } } });
}
for (const [event, verify, general, opt, cancelled, expected] of [
  ["workflow_dispatch", "success", "failure", true, false, true], ["workflow_dispatch", "success", "success", true, false, true],
  ["workflow_dispatch", "success", "failure", false, false, false], ["workflow_dispatch", "failure", "failure", true, false, false],
  ["push", "success", "success", true, false, false], ["workflow_dispatch", "success", "skipped", true, false, false],
  ["workflow_dispatch", "success", "cancelled", true, false, false], ["workflow_dispatch", "success", "failure", true, true, false],
] as const) test(`actual optional condition ${event}/${verify}/${general}/${opt}/${cancelled}`, () => assert.equal(eligible(event, verify, general, opt, cancelled), expected));
test("actual optional workflow preserves original required red and publisher native-success fence", () => {
  assert.match(optional, /timeout-minutes: 25/); assert.match(optional, /SUPABASE_TEST_REQUIRED: "1"/);
  assert.match(optional, /receipt_publish.conclusion == 'success' && steps.receipt_publish.outputs.acquisition_receipt_written == 'true'/);
  assert.doesNotMatch(optional, /continue-on-error|--grep|--shard|--retries|--timeout/);
  assert.match(ci, /      - name: E2E tests \(Playwright\)[\s\S]*?run: pnpm run test:e2e/);
  assert.equal([...ci.matchAll(/uses: actions\/checkout@v4/g)].length, 8);
});

test("actual existing candidate function preserves containment/receipt/recomputed executable authority with mocked production I/O", async () => {
  const text = source("tests/diagnostics/no-store-stream-probe.mjs");
  const start = text.indexOf("export async function admitCandidate(path)"), end = text.indexOf("export async function packageAdmission()", start);
  const actual = text.slice(start, end).replace(/^export /, "");
  const value = candidate(), records: string[] = [];
  const dependencies = { Buffer, FIXED, process: { platform: "linux", env: { RUNNER_TEMP: "/runner" } },
    realpath: async (p: string) => p, dirname: (p: string) => p.slice(0,p.lastIndexOf("/")), join: (...parts: string[]) => parts.join("/"),
    contained: (base: string,p: string) => p.startsWith(base+"/"), lstat: async () => ({ isSymbolicLink: () => false }),
    readFile: async () => JSON.stringify(value.receipt), validateReceipt,
    executableReceipt: async () => { records.push("recompute"); return value.receipt.executable; },
  };
  const call = vm.runInNewContext(`(${actual})`, dependencies) as (path: string) => Promise<unknown>;
  assert.deepEqual(JSON.parse(JSON.stringify(await call(value.executable))), value); assert.deepEqual(records, ["recompute"]);
  await assert.rejects(call("/foreign/chrome"));
  dependencies.lstat = async () => ({ isSymbolicLink: () => true }); await assert.rejects(call(value.executable));
});

test("actual owned-child deadline kills only its group, observes close and clears all timers/listeners", async () => {
  const child = new EventEmitter() as EventEmitter & { pid: number; stdout: EventEmitter }; child.pid=123; child.stdout=new EventEmitter();
  const timers = new Map<number,() => void>(), killed: string[] = [], listeners = new Set<() => void>(); let next=0;
  const io = { spawn: () => child, killGroup: (_child: unknown,signal: string) => { killed.push(signal); },
    killOwnedTree: (_child: unknown,signal: string) => { killed.push(signal); },
    confirmOwnedCleanup: async () => ({leaderReaped:true,sameLeafEmpty:true,forcedResidue:false}),
    onSignal: (fn: () => void) => { listeners.add(fn); }, offSignal: (fn: () => void) => { listeners.delete(fn); },
    setTimeout: (fn: () => void) => { const id=++next; timers.set(id,fn); return id; }, clearTimeout: (id: number) => { timers.delete(id); } };
  const pending=runOwnedChild(io,[],{},15,false); timers.get(1)?.(); timers.get(2)?.();
  child.emit("close",null,"SIGKILL"); const result=await pending;
  assert.equal(result.expired,true); assert.deepEqual(killed,["SIGTERM","SIGKILL"]); assert.equal(timers.size,0); assert.equal(listeners.size,0);
});


test("actual bounded admission is settled after timeout without any compatibility/CLI/late receipt promotion", async () => {
  const f=fixture(); let settle: (value: ReturnType<typeof candidate>) => void = () => {};
  f.io.admitCandidate = () => new Promise(resolve => { settle=resolve; });
  f.io.bounded = <T>(task: Promise<T>) => bounded(task, 1);
  const result=await f.run(); assert.notEqual(result.exitCode,0); assert.equal(f.state.compatibility,0); assert.equal(f.state.invocations,0);
  settle(candidate()); await new Promise(resolve => setTimeout(resolve, 2));
  assert.equal(f.state.compatibility,0); assert.equal(f.state.invocations,0); assert.equal(f.state.captures.length,0);
});
test("actual provenance rejects unknown public fields and never exposes raw private launch paths", async () => {
  const f=fixture(), result=await f.run(); assert.ok(result.record);
  const record=JSON.parse(JSON.stringify(result.record)); assert.doesNotMatch(JSON.stringify(record), /kopplas-fixed-chromium-abc|\/installed\//);
  record.url="PRIVATE"; assert.throws(() => validateProvenance(record)); delete record.url;
  record.packages.stderr="PRIVATE"; assert.throws(() => validateProvenance(record)); delete record.packages.stderr;
  record.visuals.push(record.visuals[0]); assert.throws(() => validateProvenance(record));
});
test("actual compatibility close failure and delayed close cannot start application", async () => {
  const f=fixture(); f.io.compatibility = async () => ({version:"158.0.8104.0",closed:false});
  assert.notEqual((await f.run()).exitCode,0); assert.equal(f.state.invocations,0);
});

function packageFixture() {
  const text=source("tests/diagnostics/no-store-stream-probe.mjs");
  const start=text.indexOf("export async function packageAdmission()"), end=text.indexOf("async function runEngine",start);
  const actual=text.slice(start,end).replace(/^export /,"").replaceAll("import.meta.url","'file:///repo/tests/diagnostics/no-store-stream-probe.mjs'")
    .replace("await import('@playwright/test')","await sdkImport()");
  const state={sdk:"1.61.1",nvm:"22",version:"v22.23.3",same:true,baselineCalls:0};
  const chromium={executablePath:()=>"/baseline/chrome"};
  const manifests: Record<string,string>={"@playwright/test/package.json":"/sdk/test/package.json","playwright/package.json":"/sdk/playwright/package.json","playwright-core/package.json":"/sdk/core/package.json"};
  const resolver=Object.assign((name:string)=>{assert.ok(["playwright","playwright-core"].includes(name));return{chromium};},{resolve:(name:string)=>manifests[name]});
  const context={FIXED, fileURLToPath: (url: string | URL) => new URL(url).pathname, process:{get version(){return state.version;}},createRequire:()=>resolver,Buffer,URL,sha256:sha,
    readFile:async(path:unknown)=>Buffer.from(String(path).endsWith(".nvmrc")?state.nvm:String(path).startsWith("/sdk/")?JSON.stringify({version:state.sdk}):"source-binding"),
    sdkImport:async()=>({chromium:state.same?chromium:{}}),
    EXPECTED:{decodedBytes:324,decodedSha256:"0420236d41fefa877b55ef66e2b78d6f46a46f2f8ebfdd662bc6e1ce2d43b8fe",compressedBytes:347,compressedSha256:"ffce20bb3e0b9766dc35c4f0d9626874851c353b85de3c3b4e8bffda09ec07a7"},
    executableReceipt:async(path:string,version:string)=>{assert.equal(path,"/baseline/chrome");assert.equal(version,"149.0.7827.55");state.baselineCalls++;return{version,bytes:1,sha256:"f".repeat(64),product:"full-chrome"};},
  };
  const call=vm.runInNewContext(`(${actual})`,context) as ()=>Promise<{provenance:{sdk:string}}>;
  return{state,call};
}
test("actual reviewed package admission checks all real module branches before its unchanged baseline seam",async()=>{
  const f=packageFixture();assert.equal((await f.call()).provenance.sdk,"1.61.1");assert.equal(f.state.baselineCalls,1);
});
for(const fault of ["sdk","nvm","Node","module identity"] as const)test(`actual reviewed package admission refuses ${fault}`,async()=>{
  const f=packageFixture();if(fault==="sdk")f.state.sdk="1.62.0";if(fault==="nvm")f.state.nvm="24";
  if(fault==="Node")f.state.version="v24.0.0";if(fault==="module identity")f.state.same=false;
  await assert.rejects(f.call(), /version/);assert.equal(f.state.baselineCalls,0);
});
test("actual runner validates SDK admission before compatibility",async()=>{
  const f=fixture(), original=f.io.packageAdmission;
  f.io.packageAdmission=async()=>{const result=await original();result.provenance.sdk="1.62.0";return result;};
  assert.notEqual((await f.run()).exitCode,0);assert.equal(f.state.compatibility,0);assert.equal(f.state.invocations,0);
});
test("actual acquisition uploader rejects physically true output when publisher runner failed",()=>{
  const expression=optional.match(/        if: \$\{\{ ([^\n]*receipt_publish.conclusion[^\n]*) \}\}/)?.[1];assert.ok(expression);
  const evaluate=(conclusion:string,flag:string)=>vm.runInNewContext(expression,{always:()=>true,cancelled:()=>false,env:{FIXED_CHROMIUM_HOSTED_ADMISSION:"application"},steps:{receipt_publish:{conclusion,outputs:{acquisition_receipt_written:flag}}}});
  assert.equal(evaluate("failure","true"),false);assert.equal(evaluate("success","false"),false);assert.equal(evaluate("success","true"),true);
});


for(const argv of [["--paired-fixed-chromium","/private/chrome"],["--verify-application","/private/chrome","--grep","AC2"]]) test(`actual CLI entry refuses ${argv[0]}/${argv.length} without any native action`,async()=>{
  const text=source("tests/diagnostics/fixed-chromium-application-runner.mjs").replace(/^import[\s\S]*?;\n/gm,"")
    .replace(/\bexport(?=\s+(?:const|async|function))/g,"").replaceAll("import.meta.url","'file:///repo/tests/diagnostics/fixed-chromium-application-runner.mjs'");
  let actions=0,output="";const denied=()=>{actions++;throw new Error("DENIED native action");};
  const process={argv:["node","/repo/tests/diagnostics/fixed-chromium-application-runner.mjs",...argv],platform:"linux",version:"v22.23.3",
    env:{CI:"true",SUPABASE_TEST_REQUIRED:"1"},on(){},off(){},stdout:{write:(value:string)=>{output+=value;}},exitCode:0,execPath:"/node"};
  await vm.runInNewContext(`(async()=>{${text}\n})()`,{process,Buffer,createHash,performance:{now:()=>0},setTimeout,clearTimeout,
    resolve:(value:string)=>value,dirname:(value:string)=>value.slice(0,value.lastIndexOf("/")),fileURLToPath:(url:string)=>new URL(url).pathname,
    admitCandidate:denied,packageAdmission:denied,validateReceipt,spawn:denied,execFile:denied});
  assert.equal(process.exitCode,1);assert.equal(actions,0);assert.equal(output,"fixed-chromium-application unavailable\n");
});

// Same production runner and actual installed SDK launchProcess as the retained
// independent RED witness. Only OS/process/kernel operations are injected.
for (const mode of ["compatibility", "application"] as const) test(`retained detached-browser assertion GREEN for ${mode} whole-leaf ownership`, async () => {
  const sdk = source("node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core/lib/coreBundle.js");
  const begin = sdk.indexOf("async function launchProcess(options) {"), end = sdk.indexOf("\nfunction envArrayToObject", begin);
  assert.ok(begin > 0 && end > begin);
  const browser = Object.assign(new EventEmitter(), {pid:777,stdout:new EventEmitter(),stderr:new EventEmitter()});
  const helper = Object.assign(new EventEmitter(), {pid:123,stdout:new EventEmitter()});
  let browserAlive=true, reaped=false, detached=false; const foreignAlive=true;
  const launch = vm.runInNewContext(`(${sdk.slice(begin,end)})`, {
    childProcess:{spawn:(_cmd:unknown,_args:unknown,options:{detached:boolean})=>{detached=options.detached;return browser;}},
    process:{platform:"linux",kill:()=>{throw new Error("DENIED unmanaged group cleanup");}},
    readline:{createInterface:()=>({on(){}})},removeFolders:async()=>[],gracefullyCloseSet:new Set(),killSet:new Set(),
    addProcessHandlerIfNeeded(){},removeProcessHandlersIfNeeded(){},
  });
  const sdkOwner=await launch({command:"/admitted/chrome",args:[],env:{},tempDirectories:[],log(){},onExit(){},
    handleSIGTERM:true,attemptToGracefullyClose:()=>new Promise(()=>{})});
  const timers=new Map<number,{fn:()=>void,delay:number}>();let id=0;
  const io={spawn:()=>helper,onSignal(){},offSignal(){},
    setTimeout:(fn:()=>void,delay:number)=>{timers.set(++id,{fn,delay});return id;},clearTimeout:(value:number)=>timers.delete(value),
    killGroup:()=>{void sdkOwner.gracefullyClose();},
    killOwnedTree:()=>{browserAlive=false;reaped=true;browser.emit("close",null,"SIGKILL");helper.emit("close",null,"SIGKILL");},
    confirmOwnedCleanup:async()=>({leaderReaped:reaped,sameLeafEmpty:!browserAlive,forcedResidue:false})};
  const pending=runOwnedChild(io,[],{},mode==="application"?1500000:15000,true);
  timers.get(1)?.fn();timers.get(2)?.fn();
  const outcome=await pending;
  assert.equal(detached,true);assert.equal(outcome.expired,true);
  assert.equal(browserAlive,false,"Browser survives outside the only group killed by the production runner");
  assert.equal(foreignAlive,true);assert.equal(timers.size,0);
});
test("retained early SIGTERM assertion GREEN with irreversible cancellation-relative force",async()=>{
  const helper=Object.assign(new EventEmitter(),{pid:123});
  const timers=new Map<number,{fn:()=>void,delay:number}>(), killed:string[]=[];let id=0,signal=()=>{};
  const io={spawn:()=>helper,onSignal:(fn:()=>void)=>{signal=fn;},offSignal(){},
    setTimeout:(fn:()=>void,delay:number)=>{timers.set(++id,{fn,delay});return id;},clearTimeout:(value:number)=>timers.delete(value),
    killGroup:()=>killed.push("TERM"),killOwnedTree:()=>killed.push("TREE-KILL"),
    confirmOwnedCleanup:async()=>({leaderReaped:true,sameLeafEmpty:true,forcedResidue:false})};
  const pending=runOwnedChild(io,[],{},1500000,false);signal();
  const delaysAtCancellation=[...timers.values()].map(value=>value.delay);signal();
  assert.ok(delaysAtCancellation.some(delay=>delay<=2000),"Force cleanup remains scheduled at 1,501,000ms after start");
  assert.deepEqual([...timers.values()].map(value=>value.delay),delaysAtCancellation);
  helper.emit("close",null,"SIGTERM");await pending;assert.equal(timers.size,0);assert.deepEqual(killed,["TERM"]);
});
for (const proof of [{leaderReaped:false,sameLeafEmpty:true},{leaderReaped:true,sameLeafEmpty:false},
  {leaderReaped:true,sameLeafEmpty:true,forcedResidue:true}]) test(`actual adapter refuses partial/residual cleanup ${JSON.stringify(proof)}`,async()=>{
  const child=new EventEmitter();
  const io={spawn:()=>child,killGroup(){},killOwnedTree(){},confirmOwnedCleanup:async()=>proof,
    onSignal(){},offSignal(){},setTimeout:()=>1,clearTimeout(){}};
  const pending=runOwnedChild(io,[],{},15,false);child.emit("close",0,null);
  await assert.rejects(pending,/cleanup/);
});
function ownerFixture() {
  const child=Object.assign(new EventEmitter(),{stdout:new EventEmitter(),stdin:Object.assign(new EventEmitter(),{
    write:(value:string)=>{commands.push(value);},end(){},destroy(){}}),unref(){}});
  const commands:string[]=[],handoffs:string[]=[];const timers=new Map<number,{fn:()=>void,delay:number}>();let id=0,signal=()=>{};
  const authority={generation:"12345678-1234-1234-1234-123456789abc",source:"a".repeat(64),unit:"kopplas-fixed-12345678-1234-1234-1234-123456789abc.service"};
  const owner=createHostedOwner({start:()=>child,setTimeout:(fn:()=>void,delay:number)=>{timers.set(++id,{fn,delay});return id;},
    clearTimeout:(value:number)=>timers.delete(value),onSignal:(fn:()=>void)=>{signal=fn;},offSignal(){},handoff:(v:{unit:string})=>handoffs.push(v.unit)},authority);
  const emit=(value:unknown)=>child.stdout.emit("data",Buffer.from(JSON.stringify(value)+"\n"));
  const ack=()=>emit({event:"ready",...authority,durable:true,workloads:0});
  const stage=(name:string,change:Record<string,unknown>={})=>emit({event:"stage",generation:authority.generation,stage:name,code:0,signal:0,
    expired:false,reaped:true,empty:true,confirmed:true,residue:false,output:"{}",...change});
  const tick=(delay:number)=>{for(const [key,value]of [...timers])if(value.delay===delay){timers.delete(key);value.fn();}};
  return{child,owner,commands,handoffs,timers,authority,emit,ack,stage,tick,cancel:()=>signal()};
}
test("actual broker protocol requires durable zero-workload ACK before either fixed stage",async()=>{
  const f=ownerFixture();const before=f.owner.run("compatibility");await Promise.resolve();assert.deepEqual(f.commands,[]);
  f.ack();await f.owner.ready;await Promise.resolve();assert.deepEqual(f.commands,["COMPATIBILITY\n"]);
  f.stage("compatibility");await before;const app=f.owner.run("application");await Promise.resolve();
  assert.deepEqual(f.commands,["COMPATIBILITY\n","APPLICATION\n"]);f.stage("application");await app;
  await f.owner.finish();assert.equal(f.commands.at(-1),"FINISH\n");assert.equal(f.timers.size,0);
});
for(const bad of [{durable:false},{workloads:1},{source:"f".repeat(64)},{unit:"foreign.service"}])test(`actual ACK refuses ${JSON.stringify(bad)}`,async()=>{
  const f=ownerFixture();const waiting=assert.rejects(f.owner.ready,/cleanup/);
  f.emit({event:"ready",...f.authority,durable:true,workloads:0,...bad});await waiting;f.tick(2000);
  assert.equal(f.commands.includes("APPLICATION\n"),false);assert.deepEqual(f.handoffs,[f.authority.unit]);
});
for(const bad of [{empty:false},{reaped:false},{confirmed:false},{residue:true},{signal:-1},{output:"x".repeat(16385)}])test(`actual phase refuses ${JSON.stringify(Object.keys(bad))}`,async()=>{
  const f=ownerFixture();f.ack();await f.owner.ready;const pending=f.owner.run("compatibility");await Promise.resolve();
  const failure=assert.rejects(pending,/cleanup/);f.stage("compatibility",bad);f.tick(2000);await failure;
  f.stage("compatibility");await assert.rejects(f.owner.run("application"),/cleanup|compatibility/);
  assert.equal(f.commands.includes("APPLICATION\n"),false);
});
for(const loss of ["signal","owner error","owner close","control error","oversize control"])test(`actual independent-owner transport ${loss} preserves failure and exact-unit handoff`,async()=>{
  const f=ownerFixture();f.ack();await f.owner.ready;const pending=f.owner.run("compatibility");await Promise.resolve();const failed=assert.rejects(pending,/cleanup/);
  if(loss==="signal")f.cancel();if(loss==="owner error")f.child.emit("error",new Error("lost"));if(loss==="owner close")f.child.emit("close",1);
  if(loss==="control error")f.child.stdin.emit("error",new Error("broken"));if(loss==="oversize control")f.child.stdout.emit("data",Buffer.alloc(32769,120));
  f.cancel();f.tick(2000);await failed;assert.deepEqual(f.handoffs,[f.authority.unit]);
  f.stage("compatibility");await assert.rejects(f.owner.run("application"));assert.equal(f.commands.includes("APPLICATION\n"),false);
});
test("actual runner retains native CLI zero while cleanup remains failed",async()=>{
  const f=fixture();f.io.application=async()=>{throw Object.assign(new Error("cleanup"),{nativeCode:0,nativeSignal:0});};
  const result=await f.run();assert.equal(result.failure,"cleanup");assert.equal(result.exitCode,1);assert.equal(result.record?.cli.nativeExit,0);
});
test("actual C owner has retained-leaf direct observation, atomic birth and child authority drop; no guessed/group cleanup",()=>{
  const c=source("tests/diagnostics/fixed-chromium-owned-process.c");
  assert.match(c,/CLONE_INTO_CGROUP \| CLONE_PIDFD/);assert.match(c,/waitid\(P_PIDFD/);
  assert.match(c,/reaped && empty && !read_failed/);assert.match(c,/write_at\(leaf,"cgroup.kill","1"\)/);
  assert.match(c,/FORCE_MS = 1000, FINISH_MS = 2000/);assert.match(c,/now-refusal>=FINISH_MS/);
  assert.match(c,/frozen\(leaf\)!=1/);assert.match(c,/setgroups\(0,NULL\)/);assert.match(c,/setresuid\(s.uid,s.uid,s.uid\)/);
  assert.match(c,/PR_CAPBSET_DROP/);assert.match(c,/SYS_capset/);assert.match(c,/PR_SET_NO_NEW_PRIVS/);assert.match(c,/SYS_close_range/);
  assert.match(c,/durable\("registered","none",0\)/);assert.match(c,/durable\("born",name,0\) \|\| write_at/);
  assert.doesNotMatch(c,/\brmdir\(|\bkill\(-|system\(|popen\(|cgroup\.procs",O_WRONLY/);
});
test("actual optional capsule is separately source-admitted and never retries the application",()=>{
  assert.match(optional,/FIXED_CHROMIUM_HOSTED_ADMISSION_SHA/);assert.match(optional,/capability\|application/);
  assert.match(optional,/--capability-capsule/);assert.match(optional,/env.FIXED_CHROMIUM_HOSTED_ADMISSION == 'application'/);
  assert.match(optional,/clang-18 -std=c11/);assert.match(optional,/--no-create-home --shell \/usr\/sbin\/nologin/);
  assert.doesNotMatch(optional,/docker run|--privileged|--network host|systemctl.*reset-failed/);
});
test("actual adapter bounds missing whole-tree proof after native leader closes",async()=>{
  const child=new EventEmitter(), timers=new Map<number,{fn:()=>void,delay:number}>();let id=0,kills=0;
  const io={spawn:()=>child,killGroup(){},killOwnedTree:()=>{kills++;},confirmOwnedCleanup:()=>new Promise(()=>{}),
    onSignal(){},offSignal(){},setTimeout:(fn:()=>void,delay:number)=>{timers.set(++id,{fn,delay});return id;},clearTimeout:(value:number)=>timers.delete(value)};
  const pending=runOwnedChild(io,[],{},1500000,false);child.emit("close",0,null);await new Promise<void>(resolve=>setImmediate(resolve));
  const failed=assert.rejects(pending,/cleanup/);for(const value of timers.values())if(value.delay===2000)value.fn();await failed;
  assert.equal(kills,1);assert.equal(timers.size,0);
});
test("actual optional capability condition skips browser acquisition, publisher and application artifacts",()=>{
  const block=(name:string)=>optional.slice(optional.indexOf(`      - name: ${name}`)).split(/\n      - name: /)[0];
  for(const name of ["Install Playwright browser (chromium + OS deps)","Start local Supabase stack","Migration reset (empty DB → migrate → seed)",
    "Acquire exact full158 with reviewed authority","Publish fresh acquisition boundary authority","Upload fixed application native JSON","Upload fixed application provenance"])
    assert.match(block(name),/env.FIXED_CHROMIUM_HOSTED_ADMISSION == 'application'/);
});

// R1: independent actual-production witness plus bounded pre-owner/signal/ACK regressions.
for (const variant of ["root", "binary", "early-signal", "late-ACK", "before-git"]) test(`actual production refusal fences pending ${variant} startup`, async () => {
  await vm.runInNewContext(`(async () => {${"  const text = runnerText;\n  const start = text.indexOf('function productionRuntime() {');\n  const end = text.indexOf('\\nexport async function runApplication', start);\n  assert.ok(start > 0 && end > start);\n  const actual = text.slice(start, end).replaceAll('import.meta.url', \"'file:///repo/tests/diagnostics/fixed-chromium-application-runner.mjs'\");\n  const timers = new Map(); let next = 0, settleRoot;\n  const commands = [], serviceLaunches = [], handoffs = [], signals = new Map();\n  const child = Object.assign(new EventEmitter(), {\n    stdout: Object.assign(new EventEmitter(), { destroy() {} }),\n    stdin: Object.assign(new EventEmitter(), { write: value => commands.push(value), end() {}, destroy() {} }), unref() {},\n  });\n  const env = { CI:'true', SUPABASE_TEST_REQUIRED:'1', GITHUB_SHA:'a'.repeat(40),\n    FIXED_CHROMIUM_HOSTED_ADMISSION_SHA:'a'.repeat(40), FIXED_CHROMIUM_HOSTED_ADMISSION:'application',\n    FIXED_CHROMIUM_BROKER_ROOT:'/owned', FIXED_CHROMIUM_WORKLOAD_REPO:'/owned/workload',\n    FIXED_CHROMIUM_BROKER_GENERATION:'12345678-1234-1234-1234-123456789abc',\n    FIXED_CHROMIUM_BROKER_SOURCE_SHA256:'b'.repeat(64),\n    FIXED_CHROMIUM_BROKER_UNIT:'kopplas-fixed-12345678-1234-1234-1234-123456789abc.service' };\n  const denied = () => { throw new Error('DENIED native action'); };\n  const requireFact = (value, failure) => { if (!value) throw new Error(failure); };\n  const runtime = vm.runInNewContext(`(${actual})`, {\n    resolve:posix.resolve, dirname:posix.dirname, join:posix.join, isAbsolute:posix.isAbsolute,\n    fileURLToPath:value => new URL(value).pathname, CONFIG, OUTPUT, SOURCES,\n    hash:value => createHash('sha256').update(value).digest('hex'),\n    process:{ platform:'linux',version:'v22.23.3',env,argv:['node','runner','--verify-application','/original/chrome'],\n      on:(name,fn) => signals.set(name,fn), off:(name,fn) => { if(signals.get(name)===fn) signals.delete(name); } },\n    performance:{now:()=>0}, admitCandidate:denied,packageAdmission:denied,\n    bounded:(task,ms) => { assert.equal(ms,15000); return bounded(task,1); },\n    createHostedOwner,requireFact,hex:value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value),\n    lstat:path => path===(variant==='binary' ? '/owned/broker' : '/owned') && variant!=='late-ACK' ? new Promise(resolve => { settleRoot=resolve; })\n      : Promise.resolve({isSymbolicLink:()=>false,isDirectory:()=>true,isFile:()=>true,uid:0,mode:path==='/owned'?0o711:0o700}),\n    readFile:denied,writeFile:denied,mkdir:denied,realpath:denied,execFile:denied,createRequire:denied,\n    setTimeout:(fn,delay)=>{ const id=++next;timers.set(id,{fn,delay});return id; },clearTimeout:id=>timers.delete(id),\n    spawn:(command,argv)=>{\n      if(argv.includes('/usr/bin/systemd-run')) { serviceLaunches.push({command,argv});return child; }\n      handoffs.push(argv);return Object.assign(new EventEmitter(),{unref(){}});\n    },\n  })();\n  runtime.gitIdentity = async()=> variant==='before-git' ? new Promise(resolve => {settleRoot=resolve;}) : ({executionSha:'a'.repeat(40),sourceTree:'c'.repeat(40)});\n  runtime.bindings = async()=>Object.fromEntries(SOURCES.map(path=>[path,{bytes:1,sha256:'d'.repeat(64)}]));\n  runtime.freshOutput = async()=>{};\n  const pending = runApplication(runtime);\n  for(let i=0;i<100;i++) await Promise.resolve();\n  if(variant==='early-signal'||variant==='late-ACK'||variant==='before-git') signals.get('SIGTERM')?.();\n  const result = await pending;\n  assert.equal(result.failure,variant==='late-ACK'?'cleanup':'admission');assert.equal(result.exitCode,1);assert.equal(serviceLaunches.length,variant==='late-ACK'?1:0);\n  // Resolve the real production startup's delayed filesystem preflight AFTER terminal refusal.\n  if(variant!=='late-ACK') settleRoot({isSymbolicLink:()=>false,isDirectory:()=>true,isFile:()=>true,uid:0,mode:variant==='binary'?0o700:0o711});\n  await new Promise(resolve=>setImmediate(resolve));\n  const observedLaunches=serviceLaunches.length;\n  if(observedLaunches) {\n    child.stdout.emit('data',Buffer.from(JSON.stringify({event:'ready',generation:env.FIXED_CHROMIUM_BROKER_GENERATION,\n      source:env.FIXED_CHROMIUM_BROKER_SOURCE_SHA256,unit:env.FIXED_CHROMIUM_BROKER_UNIT,durable:true,workloads:0})+'\\n'));\n    await new Promise(resolve=>setImmediate(resolve));\n  }\n  const lateCommands=[...commands];\n  // Settle the mock control transport and its refusal timers; never launch anything native.\n  child.emit('close',1);\n  for(const [id,timer]of [...timers]) if(timer.delay===2000){timers.delete(id);timer.fn();}\n  await new Promise(resolve=>setImmediate(resolve));\n  console.log(JSON.stringify({terminalFailure:result.failure,terminalExit:result.exitCode,\n    lateServiceLaunches:observedLaunches,lateCommands,remainingTimers:timers.size,nativeActions:0}));\n  assert.equal(timers.size,0);\n  assert.equal(commands.includes('COMPATIBILITY\\n'),false);\n  assert.equal(observedLaunches,variant==='late-ACK'?1:0,'Owner creation continues after terminal admission timeout and release is not permanently revoked');"}})()`, {
    variant, runnerText: source("tests/diagnostics/fixed-chromium-application-runner.mjs"), assert, vm,
    posix: await import("node:path").then(m => m.posix), EventEmitter, createHash, Buffer, URL, setImmediate,
    bounded, createHostedOwner, runApplication, SOURCES, CONFIG: "playwright.fixed-chromium-application.config.ts", OUTPUT: "test-results/fixed-chromium-application", console: { log() {} },
  });
});

test("actual capability mode has no optional DB lifecycle while application retains cleanup", async () => {
  const { createRequire } = await import("node:module");
  const req = createRequire(import.meta.url), er = createRequire(req.resolve("eslint")), yr = createRequire(er.resolve("@eslint/eslintrc"));
  const steps = yr("js-yaml").load(source(".github/workflows/ci.yml")).jobs["fixed-chromium-application-verification"].steps as {name:string;if:string;run?:string}[];
  for (const mode of ["capability", "application"]) for (const name of ["Install Supabase CLI", "Start local Supabase stack", "Migration reset (empty DB → migrate → seed)", "Stop local Supabase stack"]) {
    const step = steps.find(value => value.name === name); assert.ok(step);
    const expression = step.if.replace(/^\$\{\{\s*|\s*\}\}$/g, "");
    assert.equal(vm.runInNewContext(expression, {always:()=>true, env:{FIXED_CHROMIUM_HOSTED_ADMISSION:mode}}), mode === "application", `${mode}/${name}`);
    if(name === "Stop local Supabase stack") assert.equal(step.run,"supabase stop");
  }
});


// Capability diagnostics: actual module AND terminal CLI, with all native interfaces denied/mocked.
async function capabilityCLI(fault: string, primary = "pending-true", secondary = "pending-true") {
  const posix = (await import("node:path")).posix;
  const commands: string[] = [], handoffs: string[] = [], exits: number[] = [];
  const writes = {stdout:[] as string[],stderr:[] as string[]};
  const retained: (()=>void)[] = [], timers=new Map<number,{fn:()=>void;delay:number}>(), signals=new Map<string,()=>void>();
  let id=0,launches=0,settle:()=>void=()=>{};
  const PRIVATE="PRIVATE secret /home/private bearer credential payload";
  const denied=()=>{throw new Error(PRIVATE);};
  const stream=(name:"stdout"|"stderr",behavior:string)=>Object.assign(new EventEmitter(),{
    write:(value:string,callback?:(error?:Error)=>void)=>{
      writes[name].push(value);if(callback)retained.push(()=>callback(new Error(PRIVATE)));
      if(behavior==="throw")throw new Error(PRIVATE);
      if(behavior==="callback-error")callback?.(new Error(PRIVATE));
      if(behavior==="event-error")output[name].emit("error",new Error(PRIVATE));
      return behavior!=="pending-false";
    },
  });
  const output={stdout:stream("stdout",primary),stderr:stream("stderr",secondary)};
  const child=Object.assign(new EventEmitter(),{stdout:Object.assign(new EventEmitter(),{destroy(){}}),
    stdin:Object.assign(new EventEmitter(),{write:(value:string)=>{commands.push(value);
      if((fault==="request"&&value==="CAPABILITY\n")||(fault==="finish"&&value==="FINISH\n"))throw new Error(PRIVATE);},end(){},destroy(){}}),unref(){}});
  const env={CI:"true",SUPABASE_TEST_REQUIRED:"1",GITHUB_SHA:"a".repeat(40),FIXED_CHROMIUM_HOSTED_ADMISSION_SHA:"a".repeat(40),
    FIXED_CHROMIUM_HOSTED_ADMISSION:fault==="mode"?"unadmitted":"capability",FIXED_CHROMIUM_BROKER_ROOT:"/owned",
    FIXED_CHROMIUM_WORKLOAD_REPO:"/owned/workload",FIXED_CHROMIUM_BROKER_GENERATION:"12345678-1234-1234-1234-123456789abc",
    FIXED_CHROMIUM_BROKER_SOURCE_SHA256:"b".repeat(64),FIXED_CHROMIUM_BROKER_UNIT:"kopplas-fixed-12345678-1234-1234-1234-123456789abc.service"};
  const terminal=new Error("TERMINAL SENTINEL");
  const process={platform:"linux",version:"v22.23.3",env,argv:["node","/repo/tests/diagnostics/fixed-chromium-application-runner.mjs","--capability-capsule"],
    stdout:output.stdout,stderr:output.stderr,exitCode:0,exit:(code:number)=>{exits.push(code);throw terminal;},
    on:(name:string,fn:()=>void)=>{if(fault==="construction")throw new Error(PRIVATE);signals.set(name,fn);},
    off:(name:string,fn:()=>void)=>{if(signals.get(name)===fn)signals.delete(name);}};
  const context={process,Buffer,createHash,performance:{now:()=>0},...posix,fileURLToPath:(url:string)=>new URL(url).pathname,
    setTimeout:(fn:()=>void,delay:number)=>{const key=++id;timers.set(key,{fn,delay});return key;},clearTimeout:(key:number)=>timers.delete(key),
    lstat:async(path:string)=>{if(fault==="root"&&path==="/owned")throw new Error(PRIVATE);
      if(fault==="cancel-root"&&path==="/owned")await new Promise<void>(resolve=>{settle=resolve;});
      return {isSymbolicLink:()=>false,isDirectory:()=>true,isFile:()=>true,uid:fault==="binary"&&path.endsWith("broker")?1:0,mode:path==="/owned"?0o711:0o700};},
    mkdir:async()=>{if(fault==="directory")throw new Error(PRIVATE);},
    writeFile:async()=>{if(fault==="write")throw new Error(PRIVATE);if(fault==="cancel-write")await new Promise<void>(resolve=>{settle=resolve;});},
    readFile:denied,realpath:denied,execFile:denied,createRequire:denied,admitCandidate:denied,packageAdmission:denied,validateReceipt,
    spawn:(_command:string,argv:string[])=>{if(argv.includes("/usr/bin/systemd-run")){launches++;if(fault==="spawn")throw new Error(PRIVATE);return child;}
      handoffs.push(argv.at(-1)!);if(fault==="handoff")throw new Error(PRIVATE);return Object.assign(new EventEmitter(),{unref(){}});},
    hooks:{} as {encode: (record:unknown)=>string;stages:readonly string[];reasons:readonly string[];publish:(record:unknown,host:unknown)=>{attempt:()=>void;commit:()=>void}},
  };
  const text=source("tests/diagnostics/fixed-chromium-application-runner.mjs").replace(/^import[\s\S]*?;\n/gm,"")
    .replace(/\bexport(?=\s+(?:const|async|function))/g,"").replaceAll("import.meta.url","'file:///repo/tests/diagnostics/fixed-chromium-application-runner.mjs'")
    .replace("if (process.argv[1] &&", "hooks.encode=encodeCapabilityFailure;hooks.stages=CAPABILITY_STAGES;hooks.reasons=CAPABILITY_REASONS;hooks.publish=publishCapabilityFailure;\nif (process.argv[1] &&");
  const running=vm.runInNewContext(`(async()=>{${text}\n})()`,context) as Promise<unknown>;
  const outcome=running.then(()=>null,error=>error);
  const flush=async()=>{for(let i=0;i<100;i++)await Promise.resolve();};
  const tick=async(delay:number)=>{for(const[key,value]of [...timers])if(value.delay===delay){timers.delete(key);value.fn();}await flush();};
  const ack=(invalid=false)=>child.stdout.emit("data",Buffer.from(JSON.stringify({event:"ready",generation:env.FIXED_CHROMIUM_BROKER_GENERATION,
    source:invalid?"c".repeat(64):env.FIXED_CHROMIUM_BROKER_SOURCE_SHA256,unit:env.FIXED_CHROMIUM_BROKER_UNIT,durable:true,workloads:0})+"\n"));
  const stage=(invalid=false)=>child.stdout.emit("data",Buffer.from(JSON.stringify({event:"stage",generation:env.FIXED_CHROMIUM_BROKER_GENERATION,
    stage:"capsule",code:0,signal:0,expired:true,reaped:true,empty:!invalid,confirmed:true,residue:false,
    output:JSON.stringify({node:fault==="bad-payload"?"v24.0.0":"v22.23.3",uid:1001,gid:1001,groups:[1001],detached:true,
      status:"NoNewPrivs:\t1\nCapInh:\t0000\nCapPrm:\t0000\nCapEff:\t0000\nCapBnd:\t0000\nCapAmb:\t0000"})})+"\n"));
  const finish=async()=>{
    await flush();if(launches&&fault!=="spawn"){
      if(fault==="close")child.emit("close",42,null);
      else if(fault==="timeout")await tick(15000);
      else {ack(fault==="invalid-ACK");await flush();if(commands.includes("CAPABILITY\n")&&fault!=="request"){
        if(fault==="capsule-timeout")await tick(4000);else stage(fault==="result");}}
    }
    await flush();if([...timers.values()].some(value=>value.delay===2000)){
      assert.deepEqual(exits,[],"CLI exited before existing bounded cleanup/handoff");await tick(2000);
    }
    assert.equal(await outcome,terminal);assert.deepEqual(exits,[1]);assert.equal(process.exitCode,1);
    const lines=[...writes.stdout,...writes.stderr];const record=JSON.parse(lines.find(value=>value.startsWith("{"))!.split("\n")[0]);
    assert.equal(record.exitCode,1);assert.ok(!JSON.stringify(record).includes(PRIVATE));assert.equal(timers.size,0);
    return record as Record<string,unknown>;
  };
  return{child,fault,commands,handoffs,exits,writes,retained,timers,signals,output,context,terminal,outcome,flush,tick,ack,stage,finish,
    cancel:()=>signals.get("SIGTERM")?.(),settle:()=>settle(),get launches(){return launches;}};
}
for(const [fault,stage,reason] of [
  ["construction","entry","unknown"],["mode","host-preflight","precondition-rejected"],
  ["root","host-preflight","filesystem-read-failed"],["binary","host-preflight","precondition-rejected"],
  ["spawn","owner-start","owner-start-failed"],["close","owner-ready","owner-transport-failed"],
  ["timeout","owner-ready","owner-ready-timeout"],["invalid-ACK","owner-ready","control-invalid"],
  ["request","capsule-request","capsule-request-failed"],["result","capsule-request","ownership-unconfirmed"],
  ["finish","ownership-finish","ownership-finish-failed"],["directory","receipt-directory","receipt-directory-failed"],
])test(`capability actual CLI ${fault} failure is frozen and terminal`,{timeout:2000},async()=>{
  const f=await capabilityCLI(fault),record=await f.finish();assert.equal(record.stage,stage);assert.equal(record.reason,reason);
  if(fault==="close"){assert.equal(record.nativeCode,42);assert.equal(record.nativeSource,"owner-transport");}
  if(fault==="result"){assert.equal(record.nativeCode,0);assert.equal(record.nativeSource,"capsule-result");
    const payload=await capabilityCLI("bad-payload"),bad=await payload.finish();assert.equal(bad.stage,"capsule-result");assert.equal(bad.reason,"capsule-result-rejected");assert.equal(bad.nativeCode,0);
    const timed=await capabilityCLI("capsule-timeout"),expired=await timed.finish();assert.equal(expired.reason,"capsule-timeout");assert.equal(expired.nativeCode,null);
  }
  assert.equal(f.writes.stdout.length,1);assert.equal(f.writes.stderr.length,0);
});
test("capability actual CLI receipt-write failure survives both failed sinks",{timeout:2000},async()=>{
  const f=await capabilityCLI("write","throw","throw"),record=await f.finish();assert.equal(record.stage,"receipt-write");
  assert.equal(record.reason,"receipt-write-failed");assert.equal(record.nativeCode,0);
  assert.equal(f.writes.stdout.length,1);assert.equal(f.writes.stderr.length,1);
});
test("capability actual CLI cancellation preserves first refusal and waits only existing handoff",{timeout:2000},async()=>{
  for(const fault of ["cancel-root","cancel-ACK","handoff"]){const f=await capabilityCLI(fault);await f.flush();
    if(fault!=="cancel-root")f.ack();await f.flush();f.cancel();await f.flush();
    if(fault!=="cancel-root"){assert.deepEqual(f.exits,[]);await f.tick(2000);}
    assert.equal(await f.outcome,f.terminal);assert.deepEqual(f.exits,[1]);
    const record=JSON.parse(f.writes.stdout[0].split("\n")[0]);assert.equal(record.reason,"cancelled");
    f.settle();f.ack();f.stage();await f.flush();assert.equal(f.commands.includes("APPLICATION\n"),false);
    if(fault==="cancel-root")assert.equal(f.launches,0);
  }
  const prior=await capabilityCLI("close");await prior.flush();prior.child.emit("close",42,null);await prior.flush();prior.cancel();await prior.tick(2000);
  assert.equal(await prior.outcome,prior.terminal);const earlier=JSON.parse(prior.writes.stdout[0].split("\n")[0]);
  assert.equal(earlier.reason,"owner-transport-failed");assert.equal(earlier.nativeCode,42);assert.deepEqual(prior.exits,[1]);
});
test("capability actual CLI late result/write/signal cannot promote or rewrite failure",{timeout:2000},async()=>{
  const f=await capabilityCLI("cancel-write");await f.flush();f.ack();await f.flush();f.stage();await f.flush();f.cancel();await f.flush();
  assert.equal(await f.outcome,f.terminal);assert.deepEqual(f.exits,[1]);const frozen=f.writes.stdout[0];
  assert.equal(JSON.parse(frozen.split("\n")[0]).reason,"cancelled");f.settle();f.stage();f.cancel();await f.flush();
  assert.equal(f.writes.stdout[0],frozen);assert.equal(f.writes.stdout.length,1);assert.equal(f.writes.stderr.length,0);
  const earlier=await capabilityCLI("root");await earlier.flush();earlier.cancel();const result=await earlier.finish();assert.equal(result.reason,"filesystem-read-failed");
});
test("capability actual CLI bounds untrusted schema and nonsettling publication including generic output",{timeout:2000},async()=>{
  for(const [primary,secondary]of [["pending-false","pending-true"],["pending-true","pending-true"],["throw","pending-false"],
    ["callback-error","throw"],["event-error","pending-true"],["throw","throw"]]){
    const f=await capabilityCLI("mode",primary,secondary),record=await f.finish(),snapshot=JSON.stringify(record);
    assert.equal(f.writes.stdout.length,1);assert.ok(f.writes.stderr.length<=1);
    for(const value of [...f.writes.stdout,...f.writes.stderr]){assert.equal(value.split("\n").length,3);assert.ok(value.endsWith("fixed-chromium-application unavailable\n"));assert.ok(Buffer.byteLength(value)<=816);}
    for(const callback of f.retained)callback();f.output.stdout.emit("error",new Error("PRIVATE"));if(f.writes.stderr.length)f.output.stderr.emit("error",new Error("PRIVATE"));
    assert.equal(JSON.stringify(record),snapshot);assert.equal(f.writes.stdout.length,1);assert.ok(f.writes.stderr.length<=1);assert.deepEqual(f.exits,[1]);
    const {encode,stages,reasons}=f.context.hooks;assert.equal(stages.length,10);assert.equal(reasons.length,16);assert.equal(Object.keys(record).length,11);
    for(const stage of stages)for(const reason of reasons)assert.ok(Buffer.byteLength(encode({...record,stage,reason}))<=768);
    for(const bad of [{...record,secret:"PRIVATE"},{...record,stage:"PRIVATE"},{...record,reason:"PRIVATE"},{...record,nativeCode:256},{...record,nativeCode:-1},{...record,nativeCode:0.5},{...record,nativeSource:"PRIVATE"},{...record,nativeSignal:"PRIVATE"},{...record,ownerEvidence:"PRIVATE"}])assert.throws(()=>encode(bad));
    const publisher=f.context.hooks.publish({...record,extra:"PRIVATE"},{stdout:f.output.stdout,stderr:f.output.stderr});publisher.attempt();publisher.commit();
    assert.ok(f.writes.stdout.at(-1)!.includes("unavailable"));assert.ok(!f.writes.stdout.at(-1)!.includes("PRIVATE"));
  }
});


// Native125 diagnosis reuses the existing full-module CLI VM harness, not copied production logic.
async function capsule125CLI(actual: Record<string,unknown> = {}, result: Record<string,unknown> = {}, output?:string, code=125, sink="pending-true") {
  const unit=source("tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts");
  const start=unit.indexOf("async function capabilityCLI("),end=unit.indexOf("\nfor(const [fault,stage,reason]",start);
  let body=unit.slice(start,end).replace('const posix = (await import("node:path")).posix;','const posix = injectedPosix;')
    .replace('hooks.encode=encodeCapabilityFailure;','hooks.peek=peekCapsuleDetail;hooks.predicates=CAPSULE_PREDICATE_REASONS;hooks.boundaries=CAPSULE_BOUNDARIES;hooks.encode=encodeCapabilityFailure;');
  const at=body.indexOf('  const stage='),to=body.indexOf('  const finish=',at);
  const stage=rStage();
  body=body.slice(0,at)+stage+body.slice(to);
  const javascript=ts.transpileModule(body,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
  const call=vm.runInNewContext(`(()=>{${javascript};return capabilityCLI;})()`,{injectedPosix:(await import("node:path")).posix,
    injectedActual:actual,injectedResult:result,injectedOutput:output,injectedCode:code,assert,EventEmitter,createHash,Buffer,URL,vm,source,validateReceipt});
  return await call("125",sink) as Awaited<ReturnType<typeof capabilityCLI>>;
  function rStage(){return `  const stage=(invalid=false)=>child.stdout.emit("data",Buffer.from(JSON.stringify({event:"stage",generation:env.FIXED_CHROMIUM_BROKER_GENERATION,
    stage:"capsule",code:injectedCode,signal:0,expired:true,reaped:true,empty:!invalid,confirmed:true,residue:false,...injectedResult,
    output:injectedOutput===undefined?JSON.stringify({node:"v22.23.3",uid:1001,gid:1001,groups:[1001],detached:true,
      status:"NoNewPrivs:\\t1\\nCapInh:\\t0000\\nCapPrm:\\t0000\\nCapEff:\\t0000\\nCapBnd:\\t0000\\nCapAmb:\\t0000",...injectedActual}):injectedOutput})+"\\n"));\n`;}
}
function capsuleDetail(f:Awaited<ReturnType<typeof capabilityCLI>>) { const bundle=f.writes.stdout[0];return JSON.parse(bundle.split("\n")[1]) as Record<string,unknown>; }
const refusedMarker=(stage:string,errno:number|null=13)=>JSON.stringify({schemaVersion:1,kind:"owned-capsule-refusal",stage,errno});

test("125 actual CLI expiration labels and downstream confirmation guards conserve authority",{timeout:2000},async()=>{
  const f=await capsule125CLI({}, {expired:false},""),record=await f.finish();assert.equal(record.reason,"capsule-expiration-rejected");assert.equal(record.nativeCode,125);
  for(const result of [{confirmed:false},{reaped:false},{empty:false},{residue:true}]){const blocked=await capsule125CLI({},result,""),r=await blocked.finish();assert.equal(r.reason,"ownership-unconfirmed");assert.equal(r.stage,"capsule-request");}
});
test("125 actual CLI JSON/property faults retain non125 compatibility",{timeout:2000},async()=>{
  for(const [output,reason]of [["{","capsule-json-rejected"],["null","capsule-shape-rejected"]]){const f=await capsule125CLI({}, {},output),r=await f.finish();assert.equal(r.reason,reason);assert.equal(r.nativeCode,125);}
  for(const [output,reason]of [["{","capsule-result-rejected"],["null","unknown"]]){const f=await capsule125CLI({}, {},output,0),r=await f.finish();assert.equal(r.reason,reason);assert.equal(f.writes.stdout[0].split("\n").length,3);}
});
test("125 actual CLI Node predicate is fine only for named native125",{timeout:2000},async()=>{
  for(const code of [125,0,42]){const f=await capsule125CLI({node:"v24.0.0"},{},undefined,code),r=await f.finish();assert.equal(r.reason,code===125?"capsule-node-rejected":"capsule-result-rejected");assert.equal(r.nativeCode,code);}
});
test("125 actual CLI UID/GID predicates preserve exact integer bounds",{timeout:2000},async()=>{
  for(const field of ["uid","gid"])for(const value of [0,-1,0.5,null]){const f=await capsule125CLI({[field]:value}),r=await f.finish();assert.equal(r.reason,`capsule-${field}-rejected`);}
});
test("125 actual CLI groups array/count/member checks preserve order",{timeout:2000},async()=>{
  for(const [groups,reason]of [[null,"shape"],[[1001,1001],"count"],[[1002],"id"]]){const f=await capsule125CLI({groups}),r=await f.finish();assert.equal(r.reason,`capsule-groups-${reason}-rejected`);}
});
test("125 actual CLI detached predicate never accepts marker assertions",{timeout:2000},async()=>{
  for(const detached of [false,1,"true",null]){const f=await capsule125CLI({detached}),r=await f.finish();assert.equal(r.reason,"capsule-detachment-rejected");}
});
test("125 actual CLI status/no-new-privileges remain independent requirements",{timeout:2000},async()=>{
  for(const [status,reason]of [[null,"capsule-status-rejected"],["NoNewPrivs:\t0","capsule-no-new-privileges-rejected"]]){const f=await capsule125CLI({status}),r=await f.finish();assert.equal(r.reason,reason);}
});
test("125 actual CLI five capability-set checks preserve ordered failure",{timeout:2000},async()=>{
  const good="NoNewPrivs:\t1\nCapInh:\t0000\nCapPrm:\t0000\nCapEff:\t0000\nCapBnd:\t0000\nCapAmb:\t0000";
  for(const [key,name]of [["CapInh","inheritable"],["CapPrm","permitted"],["CapEff","effective"],["CapBnd","bounding"],["CapAmb","ambient"]]){
    const f=await capsule125CLI({status:good.replace(`${key}:\t0000`,`${key}:\t0001`)}),r=await f.finish();assert.equal(r.reason,`capsule-cap-${name}-rejected`);
  }
});
test("125 actual CLI accepts only reported finite markers/numeric errno",{timeout:2000},async()=>{
  const sample=await capsule125CLI({}, {expired:false},refusedMarker("stdin-open"));await sample.finish();
  const hooks=sample.context.hooks as typeof sample.context.hooks & {boundaries:string[]};assert.equal(hooks.boundaries.length,35);
  for(const stage of hooks.boundaries.filter(v=>v!=="unknown"))for(const errno of [null,13,2147483647]){
    const f=await capsule125CLI({}, {expired:false},refusedMarker(stage,errno)),r=await f.finish(),detail=capsuleDetail(f);
    assert.equal(r.nativeCode,125);assert.equal(r.exitCode,1);assert.equal(detail.stage,stage);assert.equal(detail.errno,errno);assert.equal(r.ownerEvidence,"protocol-confirmed");
  }
});
test("125 actual CLI missing/truncated/spoofed markers stay unknown with no authority",{timeout:2000},async()=>{
  for(const output of ["", "{",refusedMarker("FOREIGN"),refusedMarker("stdin-open",0),refusedMarker("stdin-open",-1),refusedMarker("stdin-open",2147483648),
    JSON.stringify({schemaVersion:1,kind:"foreign",stage:"stdin-open",errno:13}),JSON.stringify({schemaVersion:1,kind:"owned-capsule-refusal",stage:"stdin-open",errno:13,secret:"PRIVATE"})]){
    const f=await capsule125CLI({}, {expired:false},output),r=await f.finish(),detail=capsuleDetail(f);assert.equal(detail.stage,"unknown");assert.equal(detail.errno,null);assert.equal(r.nativeCode,125);assert.equal(f.commands.includes("APPLICATION\n"),false);
  }
  const other=await capsule125CLI({}, {expired:false},refusedMarker("stdin-open"),0);const r=await other.finish();assert.equal(r.nativeSource,"capsule-result");assert.equal(r.nativeCode,0);assert.equal(other.writes.stdout[0].split("\n").length,3);
});
test("125 actual CLI cancellation/late marker cannot rewrite first failure",{timeout:2000},async()=>{
  const f=await capsule125CLI({}, {expired:false},refusedMarker("stdin-open"));await f.flush();f.ack();await f.flush();f.cancel();await f.flush();assert.deepEqual(Array.from(f.exits),[]);await f.tick(2000);
  assert.equal(await f.outcome,f.terminal);const snapshot=f.writes.stdout[0];f.stage();f.cancel();await f.flush();assert.equal(f.writes.stdout[0],snapshot);
  const record=JSON.parse(snapshot.split("\n")[0]);assert.equal(record.reason,"cancelled");assert.equal(record.nativeSource,"unavailable");assert.equal(snapshot.split("\n").length,3);
});
test("125 actual CLI reason qualification/detail bounds/nonsettling sinks retain terminal1",{timeout:2000},async()=>{
  for(const sink of ["pending-true","pending-false","throw","callback-error","event-error"]){const f=await capsule125CLI({}, {expired:false},refusedMarker("node-exec",2147483647),125,sink),record=await f.finish();
    const hooks=f.context.hooks as typeof f.context.hooks & {predicates:string[]};assert.equal(hooks.reasons.length,16);assert.equal(hooks.predicates.length,21);
    for(const reason of hooks.predicates){assert.ok(Buffer.byteLength(hooks.encode({...record,reason}))<=768);for(const change of [{nativeSource:"unavailable",nativeCode:null},{nativeSource:"owner-transport"},{nativeCode:0},{nativeCode:126}])assert.throws(()=>hooks.encode({...record,...change,reason}));}
    for(const value of [...f.writes.stdout,...f.writes.stderr]){assert.ok(Buffer.byteLength(value)<=816);assert.equal(value.split("\n").length,4);assert.ok(!value.includes("PRIVATE"));}
    for(const callback of f.retained)callback();f.output.stdout.emit("error",new Error("PRIVATE"));if(f.writes.stderr.length)f.output.stderr.emit("error",new Error("PRIVATE"));
    assert.equal(f.writes.stdout.length,1);assert.ok(f.writes.stderr.length<=1);assert.deepEqual(Array.from(f.exits),[1]);
  }
});
