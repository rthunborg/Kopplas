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
test("actual native snapshot retains exact20 fields plus one bounded observation-only request event window", async () => {
  const file=parsed(spec);let intBody:ts.Block|undefined;
  const locate=(node:ts.Node)=>{if(ts.isCallExpression(node)&&node.arguments[0]?.getText(file).includes("15.1-INT-001")){const fn=node.arguments.find(ts.isArrowFunction);if(fn&&ts.isBlock(fn.body))intBody=fn.body;}ts.forEachChild(node,locate);};locate(file);assert.ok(intBody);
  const statements=intBody!.statements;const first=statements.findIndex(n=>ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(file)==="payloads"));const last=statements.findIndex(n=>ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(file)==="openCaptureWindow"));assert.ok(first>=0&&last>first);
  const actualSetup=statements.slice(first,last+1).map(n=>n.getText(file)).join("\n");
  const windows=["before-open","while-open","after-close","unobserved","capacity-unavailable","internal-unavailable"];
  const twenty=["kind","trigger","path","queryPresent","method","status","contentType","requestOrdinal","captureOrdinal","phase","responseMs","finishedStartMs","finishedEndMs","bodyStartMs","bodyEndMs","requestFailedMs","captureCount","fulfilledCount","rejectedCount","pendingCount"];
  const request=(failure="net::ERR_ABORTED",url="http://localhost/scheduling?q=FORBIDDEN-CANARY")=>({url:()=>url,method:()=>"GET",failure:()=>({errorText:failure})});
  const entry=(req:object)=>({request:req,response:{status:()=>200,headers:()=>({"content-type":"text/x-component"})},requestOrdinal:1,captureOrdinal:1,queryPresent:true,phase:"finished",responseMs:1,finishedStartMs:2,finishedEndMs:null,bodyStartMs:null,bodyEndMs:null,requestFailedMs:null});
  function harness(options:{map?:"constructor"|"has"|"set"|"get"|"foreign";sink?:boolean;json?:boolean;oversize?:boolean}={}){
    const output:string[]=[],handlers=new Map<string,unknown>();let maps=0;
    class ObserverMap extends WeakMap<object,unknown>{readonly index:number;constructor(){super();this.index=++maps;if(this.index===1&&options.map==="constructor")throw new Error("private map");}override has(key:object){if(this.index===1&&options.map==="has")throw new Error("private map");return super.has(key);}override set(key:object,value:unknown){if(this.index===1&&options.map==="set")throw new Error("private map");return super.set(key,value);}override get(key:object){if(this.index===1&&options.map==="get")throw new Error("private map");if(this.index===1&&options.map==="foreign")return "FORBIDDEN-CANARY";return super.get(key);}}
    const context=vm.createContext({captureOrigin:"http://localhost",URL,Buffer:options.oversize?{byteLength:()=>1025}:Buffer,WeakMap:ObserverMap,performance:{now:()=>1},page:{url:()=>"http://localhost/scheduling",on:(n:string,f:unknown)=>handlers.set(n,f),off:(n:string)=>handlers.delete(n)},
      lifecycle:{mark(){}},testInfo:{},createSchedulingPassiveMetadata:()=>({stop(){}}),schedulingPassiveShutdowns:new Map(),schedulingAttemptShutdowns:new Map(),
      console:{info:(text:string)=>{if(options.sink)throw new Error("private sink");output.push(text);}},...(options.json?{JSON:{stringify:()=>{throw new Error("private JSON");}}}:{})});
    vm.runInContext(compile(actualSetup),context);
    const api=vm.runInContext(`({observe:observeRequestEvent,window:observedRequestEventWindow,request:readRequest,finished:readFinished,failed:readFailed,read,snapshot,open:openCaptureWindow,close:closeCaptureWindow,shutdown,drain,navigate:navigateAfterBarrier,recordFailure,
      resetSnapshot:()=>{snapshotAttempted=false;},flags:(active,open)=>{captureActivated=active;responseAdmissionOpen=open;},stats:()=>({count:requestEventObserved,unavailable:requestEventUnavailable,opened:requestEventHasOpened,hasFailure,firstFailure,live:live.size,generation,captureCount,fulfilledCount,rejectedCount,payloads:[...payloads]})})`,context);
    return {api,output,handlers};
  }
  const decode=(text:string)=>JSON.parse(text.replace("[scheduling-native-response-failure] ",""));
  const snapshots=(h:ReturnType<typeof harness>)=>h.output.filter(s=>s.startsWith("[scheduling-native-response-failure] "));
  const f=harness(),a=request();f.api.request(a);f.api.snapshot(entry(a),"requestfailed");
  const row=decode(snapshots(f)[0]!);assert.deepEqual(Object.keys(row).slice(0,20),twenty);assert.deepEqual(Object.keys(row),[...twenty,"requestEventWindow"]);assert.equal(row.requestEventWindow,"before-open");assert.ok(Buffer.byteLength(JSON.stringify(row),"utf8")<=1024);
  for(const key of ["kind","trigger","path","method","contentType","phase"])assert.equal(typeof row[key],"string");assert.equal(typeof row.queryPresent,"boolean");
  for(const key of ["status","requestOrdinal","captureOrdinal","responseMs","finishedStartMs","requestFailedMs","captureCount","fulfilledCount","rejectedCount","pendingCount"])assert.equal(typeof row[key],"number");for(const key of ["finishedEndMs","bodyStartMs","bodyEndMs"])assert.equal(row[key],null);
  assert.equal(row.kind,"native-response-failure");assert.equal(row.path,"/scheduling");assert.equal(row.method,"GET");assert.equal(row.status,200);assert.equal(row.contentType,"text/x-component");assert.ok(!JSON.stringify(row).includes("FORBIDDEN-CANARY"));
  f.api.open();f.api.request(a);assert.equal(f.api.window(a),"before-open");const b=request();f.api.request(b);assert.equal(f.api.window(b),"while-open");assert.equal(f.api.window(request()),"unobserved");assert.equal(harness().api.window(a),"unobserved");
  const close=harness(),c=request(),d=request();close.api.open();close.api.request(c);const closing=close.api.close();await Promise.resolve();close.api.request(d);assert.equal(close.api.window(d),"after-close");close.api.finished(c);close.api.finished(d);await closing;
  const count=close.api.stats().count;close.api.request(request());assert.equal(close.api.stats().count,count);assert.equal(close.api.window(request()),"unobserved");
  const late=harness();late.api.open();late.api.shutdown();late.api.request(request());assert.equal(late.api.stats().count,0);assert.equal(late.api.window(request()),"unobserved");assert.equal(late.handlers.size,0);
  const capped=harness();const known=request();capped.api.request(known);for(let i=1;i<256;i++)capped.api.request(request());capped.api.open();capped.api.request(known);const overflow=request();capped.api.request(overflow);assert.equal(capped.api.stats().count,256);assert.equal(capped.api.window(known),"before-open");assert.equal(capped.api.window(overflow),"capacity-unavailable");
  for(const mode of ["constructor","has","set","get","foreign"] as const){const h=harness({map:mode});const req=request();h.api.request(req);assert.equal(h.api.window(req),"internal-unavailable");assert.equal(h.api.stats().live,1);assert.ok(!h.output.join("\n").includes("FORBIDDEN-CANARY"));}
  const hidden=Object.defineProperty({},"url",{get(){throw new Error("must not inspect request");}});const clean=harness();clean.api.observe(hidden);assert.equal(clean.api.window(hidden),"before-open");
  const foreign=harness();foreign.api.request(request("failure","http://foreign.invalid/scheduling"));foreign.api.request(request("failure","http://localhost/other"));assert.equal(foreign.api.stats().count,0);assert.equal(foreign.api.stats().live,0);
  for(const options of [{sink:true},{json:true},{oversize:true}]){const h=harness(options),sentinel=new Error("original primary");h.api.recordFailure(sentinel);h.api.snapshot(entry(request()),"requestfailed");assert.equal(snapshots(h).length,0);assert.equal(h.api.stats().firstFailure,sentinel);}
  const invalid=harness();invalid.api.snapshot({...entry(request()),requestEventWindow:"FORBIDDEN-CANARY"},"requestfailed");const safe=decode(snapshots(invalid)[0]!);assert.equal(safe.requestEventWindow,"unobserved");assert.ok(windows.includes(safe.requestEventWindow));assert.deepEqual(Object.keys(safe),[...twenty,"requestEventWindow"]);
  const timing=harness(),pending=request();timing.api.request(pending);let action=0;const barrier=timing.api.navigate(async()=>{action++;return "kept";});await Promise.resolve();assert.equal(action,0);timing.api.finished(pending);assert.equal(await barrier,"kept");assert.equal(action,1);
  for(const beforeOpen of [true,false]){
    const h=harness(),req=request();if(beforeOpen)h.api.request(req);h.api.open();if(!beforeOpen)h.api.request(req);let finish!:(value:null)=>void;const finished=new Promise<null>(resolve=>{finish=resolve;});const calls:string[]=[];
    h.api.read({url:()=>req.url(),ok:()=>true,status:()=>200,headers:()=>({"content-type":"text/x-component"}),request:()=>req,finished:()=>{calls.push("finished");return finished;},text:async()=>{calls.push("text");return "later body";}});assert.deepEqual(calls,["finished"]);h.api.failed(req);const firstFailure=h.api.stats().firstFailure;assert.equal(firstFailure,"net::ERR_ABORTED");assert.equal(h.api.stats().hasFailure,true);assert.equal(decode(snapshots(h)[0]!).requestEventWindow,beforeOpen?"before-open":"while-open");
    await assert.rejects(h.api.drain(),error=>error===firstFailure);finish(null);for(let i=0;i<8;i++)await Promise.resolve();assert.deepEqual(calls,["finished","text"]);assert.equal(h.api.stats().firstFailure,firstFailure);await assert.rejects(h.api.drain(),error=>error===firstFailure);
  }
  const liveOnly=harness(),unadmitted=request();liveOnly.api.open();liveOnly.api.request(unadmitted);liveOnly.api.failed(unadmitted);assert.equal(liveOnly.api.stats().firstFailure,"net::ERR_ABORTED");assert.equal(snapshots(liveOnly).length,0);
  assert.equal((intBody!.getText(file).match(/\bopenCaptureWindow\(\)/g)??[]).length,1);
  // Execute the actual Booking005 callback, not a copied helper or a replacement assertion body.
  const bookingPath="tests/e2e/booking-series.e2e.spec.ts",bookingFile=parsed(bookingPath);let booking="";
  const findBooking=(n:ts.Node)=>{if(ts.isCallExpression(n)&&n.arguments[0]?.getText(bookingFile).includes("15.2-E2E-005")){const fn=n.arguments.find(ts.isArrowFunction);if(fn)booking=fn.getText(bookingFile).replaceAll("\r\n","\n");}ts.forEachChild(n,findBooking);};findBooking(bookingFile);assert.ok(booking);
  const arm="    const loss = await h.loseNextCommittedSaveResponseOnce();\n";assert.equal(booking.split(arm).length,2);assert.ok(booking.includes("await ready(page, 8);\n"+arm));assert.ok(booking.includes(arm+'    await editor(page).getByTestId("booking-save").click();'));
  async function bookingPorts(callback:string,mode:"ok"|"arm-fails"|"settle-fails"="ok"){
    const events:string[]=[];let armed=false,unknown=false,saved=false,seenReady=false;const sentinel=new Error("native booking carrier"),ids=Array.from({length:8},(_,i)=>"occ"+i),attempt={commandId:"command",proposedSeriesId:"series",proposedOccurrenceIds:ids};const attempts:object[]=[];
    const empty={series:[],occurrences:[],outcomes:[],audit:[]},committed={series:[{id:"series"}],occurrences:ids.map(id=>({id})),outcomes:[{commandId:"command"}],audit:[{targetId:"series",command:"createBookingSeries"}]};let persisted=false;
    const h={seed:async()=>({description:"fixture"}),snapshot:async()=>persisted?committed:empty,attempts:()=>attempts,loseNextCommittedSaveResponseOnce:async()=>{events.push("arm");if(mode==="arm-fails")throw sentinel;armed=true;return{committed:Promise.resolve(attempt)};},settleTransport:async()=>{events.push("settle");if(mode==="settle-fails")throw sentinel;},observeNextSave:async()=>({committed:Promise.resolve(attempt)})};
    const locator=(id:string)=>({id,click:async()=>{events.push(id);if(id==="booking-save"){assert.equal(seenReady,true);assert.equal(armed,true);unknown=true;persisted=true;attempts.push(attempt);}if(id==="booking-retry"){unknown=false;saved=true;attempts.push(attempt);}}});
    const page={getByTestId:locator,reload:async()=>{events.push("reload");}},normalize=(x:unknown)=>JSON.parse(JSON.stringify(x));
    const expect=(value:unknown)=>({toBe:(expected:unknown)=>assert.equal(value,expected),toEqual:(expected:unknown)=>assert.deepEqual(normalize(value),normalize(expected)),toHaveLength:(expected:number)=>assert.equal((value as unknown[]).length,expected),toBeVisible:async()=>assert.equal(unknown,true),toHaveCount:async(expected:number)=>assert.equal(saved?1:0,expected),toHaveValue:async(expected:string)=>assert.equal(expected,"fixture"),toBeDisabled:async()=>assert.equal(unknown,true),toHaveText:async(expected:string)=>{assert.equal(saved,true);assert.equal(expected,"Sparad i systemet");}});
    const fn=evaluate(callback,{expect,signIn:async()=>{events.push("signIn");assert.equal(armed,false);},scheduling:async()=>{events.push("scheduling");assert.equal(armed,false);},draft:async(_page:unknown,_s:unknown,n:number)=>{assert.equal(n,8);assert.equal(armed,false);events.push("draft");},ready:async(_page:unknown,n:number)=>{assert.equal(n,8);assert.equal(armed,false);seenReady=true;events.push("ready");},editor:()=>({getByTestId:locator})});
    let error:unknown;try{await fn({resourcePage:page,bookingSeries:h});}catch(e){error=e;}
    return{events,error,sentinel,attempts};
  }
  const success=await bookingPorts(booking);assert.equal(success.error,undefined);assert.deepEqual(success.events.slice(success.events.indexOf("ready"),success.events.indexOf("booking-save")+1),["ready","arm","booking-save"]);assert.equal(success.attempts.length,2);assert.ok(success.events.includes("reload"));
  const originalByMoveInverse=booking.replace(arm,"").replace("    await scheduling(page);\n",arm+"    await scheduling(page);\n");assert.notEqual(originalByMoveInverse,booking);const old=await bookingPorts(originalByMoveInverse);assert.ok(old.error);assert.ok(!old.events.includes("booking-save"));
  const armFailure=await bookingPorts(booking,"arm-fails");assert.equal(armFailure.error,armFailure.sentinel);assert.ok(!armFailure.events.includes("booking-save"));assert.equal(armFailure.attempts.length,0);
  const settleFailure=await bookingPorts(booking,"settle-fails");assert.equal(settleFailure.error,settleFailure.sentinel);assert.ok(!settleFailure.events.includes("booking-retry"));
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

// Owned Page retirement regressions: actual extracted functions, offline ports only.
function ownedBookingPorts(options: { unroute?: () => Promise<void>; sqlFailure?: unknown; authFailure?: unknown } = {}) {
  const file = parsed(support + "booking-editor-atdd.ts");
  const fn = file.statements.find((n): n is ts.FunctionDeclaration => ts.isFunctionDeclaration(n) && n.name?.text === "bindBookingEditorHarness");
  assert.ok(fn?.body);
  const selected = new Set(["deferred", "releases", "pendingRoutes", "handlerCompletions", "transportOptIn", "transportRetirement", "hasOwnedFailure", "retainOwnedFailure", "retireTransport", "transportDiagnostics", "previewFetchCount", "confirmations", "transports", "observedSaveTimeout", "optionsFailure", "saveHold", "saveFailure", "saveLoss", "previewFailure", "previewRace", "actionInput", "routeWork", "routeHandler", "cleanupScenario"]);
  const declarations = fn.body.statements.filter(n => ts.isVariableStatement(n) && n.declarationList.declarations.some(d => selected.has(d.name.getText(file)))).map(n => n.getText(file)).join("\n");
  const returned = fn.body.statements.find((n): n is ts.ReturnStatement => ts.isReturnStatement(n) && !!n.expression && ts.isObjectLiteralExpression(n.expression));
  assert.ok(returned?.expression && ts.isObjectLiteralExpression(returned.expression));
  const methods = ["dispose", "holdNextSave", "failNextSaveOnce"].map(name => {
    const method = returned.expression!.getChildren(file).flatMap(n => n.getChildren(file)).find(n => ts.isMethodDeclaration(n) && n.name.getText(file) === name);
    assert.ok(method, name); return method.getText(file);
  }).join(",\n");
  const events: string[] = [], auth: string[] = []; let deletes = 0;
  const page = { isClosed: () => false, unroute: async () => { events.push("unroute"); await options.unroute?.(); } };
  const api = evaluate(`(()=>{${declarations};return {retireTransport,${methods},handle:routeHandler,
    addRelease(fn:()=>void){releases.push(fn);}};})()`, {
    page, Promise, Buffer, process: { env: {} }, tenantId: "synthetic-tenant", token: "synthetic-owned", owned: { workRoleId: "synthetic-role" }, users: ["synthetic-a", "synthetic-b"], profiles: [], memberships: [],
    lifecycle: { mark() {}, observeAbort: (_p: unknown, _reason: unknown, operation: () => Promise<unknown>) => operation() },
    adminSession: async (operation: (ports: { query: (sql: string) => Promise<void> }) => Promise<void>) => { events.push("data"); await operation({ query: async sql => { if (sql.startsWith("delete ")) deletes++; if (options.sqlFailure && sql === "begin") throw options.sqlFailure; } }); },
    deleteAuthUser: async (id: string) => { auth.push(id); if (options.authFailure && id === "synthetic-a") throw options.authFailure; },
  });
  return { api, events, auth, deletes: () => deletes };
}
function ownedRoute(events: string[], body = "[]", method = "GET") {
  return {
    request: () => ({ method: () => method, headers: () => ({ "next-action": "synthetic-presence" }), postData: () => body }),
    continue: async () => { events.push("continue"); }, fallback: async () => { events.push("fallback"); }, abort: async () => { events.push("abort"); },
    fetch: async () => { events.push("fetch"); return { ok: () => false, status: () => 503 }; }, fulfill: async () => { events.push("fulfill"); },
  };
}
function ownedSchedulingPorts(options: { oldClose?: () => Promise<void>; newPage?: () => Promise<unknown>; oldCloses?: boolean; unroute?: () => Promise<void>; transportRetire?: () => Promise<void> } = {}) {
  const file = parsed(support + "scheduling-views-atdd.ts");
  const klass = file.statements.find((n): n is ts.ClassDeclaration => ts.isClassDeclaration(n) && n.name?.text === "SchedulingViewsHarness"); assert.ok(klass);
  const events: string[] = [], auth: string[] = []; let oldClosed = false, freshClosed = false, creates = 0, data = 0, delegates = 0;
  const context = { newPage: async () => { creates++; events.push("new"); return options.newPage ? await options.newPage() : fresh; } };
  const old = { isClosed: () => oldClosed, context: () => context,
    unroute: async () => { events.push("old-unroute"); await options.unroute?.(); },
    close: async () => { events.push("old-close"); await options.oldClose?.(); if (options.oldCloses !== false) oldClosed = true; },
    getByRole: () => { throw new Error("Retired locator used"); },
  };
  const fresh = { isClosed: () => freshClosed, context: () => context, route: async () => { events.push("fresh-route"); }, unroute: async () => { events.push("fresh-unroute"); }, close: async () => { events.push("fresh-close"); freshClosed = true; },
    getByTestId: () => ({ locator: () => ({ evaluateAll: async () => { events.push("fresh-visible"); return ["synthetic-booking"]; } }) }),
  };
  const Constructor = evaluate(`(()=>{${klass.getText(file).replace(/^export /, "")};return SchedulingViewsHarness;})()`, {
    randomUUID: () => "synthetic-owned", Promise, URL, Buffer, Date,
    lifecycle: { mark() {}, retireOwnedTarget: () => { events.push("lifecycle-retire"); return { attach: () => { events.push("lifecycle-attach"); } }; } },
    adminSession: async (operation: (ports: { query: () => Promise<void> }) => Promise<void>) => { data++; await operation({ query: async () => {} }); }, deleteAuthUser: async (id: string) => { auth.push(id); },
  });
  const editor = { retireTransport: async () => { events.push("transport-retire"); await options.transportRetire?.(); }, observeNextConfirmedSave: () => { delegates++; }, failNextSaveOnce: () => { delegates++; } };
  const api = new Constructor(old, editor);
  api.scenario = { tenantId: "synthetic-tenant", description: "synthetic-owned" }; api.users = [{ id: "synthetic-user" }];
  return { api, old, fresh, context, events, auth, creates: () => creates, data: () => data, delegates: () => delegates };
}

test("owned transport retirement releases a real held port without deleting the scenario", async () => {
  const f = ownedBookingPorts(), events: string[] = [], hold = await f.api.holdNextSave();
  const work = f.api.handle(ownedRoute(events, JSON.stringify([{ commandId: "synthetic-command", assigneeIds: [], editorReview: {} }]), "POST"));
  await hold.started;
  const retirement = f.api.retireTransport(); await retirement; await work;
  assert.deepEqual(events, ["fetch", "fulfill"]); assert.deepEqual(f.events, ["unroute"]); assert.equal(f.deletes(), 0); assert.deepEqual(f.auth, []);
  await f.api.dispose(); await f.api.dispose();
  assert.equal(f.events.filter(e => e === "data").length, 1); assert.equal(f.auth.length, 2); assert.ok(f.deletes() > 0);
});

test("owned retirement refuses pending failures and keeps default routing and disposal semantics", async () => {
  const plain = ownedBookingPorts(), routes: string[] = [];
  await plain.api.handle(ownedRoute(routes)); await plain.api.failNextSaveOnce();
  await plain.api.handle(ownedRoute(routes, JSON.stringify([{ commandId: "synthetic-command", assigneeIds: [], editorReview: {} }]), "POST"));
  assert.deepEqual(routes, ["continue", "abort"]);
  await plain.api.dispose(); assert.deepEqual(plain.events.slice(0, 2), ["unroute", "data"]); assert.equal(plain.auth.length, 2);
  const failed = ownedBookingPorts(), sentinel = {}; let reject!: (e: unknown) => void;
  const pending = new Promise<void>((_yes, no) => { reject = no; });
  const handling = failed.api.handle({ ...ownedRoute([]), continue: () => pending }); void handling.catch(() => {});
  const retiring = failed.api.retireTransport(); reject(sentinel);
  await assert.rejects(handling, e => e === sentinel);
  await assert.rejects(retiring, e => e === sentinel); assert.equal(failed.deletes(), 0);
  await assert.rejects(failed.api.dispose(), e => e === sentinel); assert.equal(failed.auth.length, 2);
});

test("owned final data cleanup is once-only when transport never settles or cleanup throws", async () => {
  const stuck = ownedBookingPorts();
  void stuck.api.handle({ ...ownedRoute([]), continue: () => new Promise<void>(() => {}) }).catch(() => {});
  void stuck.api.retireTransport().catch(() => {});
  await assert.rejects(stuck.api.dispose(), /retirement unverified/); await assert.rejects(stuck.api.dispose(), /retirement unverified/);
  assert.equal(stuck.events.filter(e => e === "data").length, 1); assert.equal(stuck.auth.length, 2);
  const sentinel = {}, failed = ownedBookingPorts({ unroute: async () => { throw sentinel; }, authFailure: {} });
  await assert.rejects(failed.api.retireTransport(), e => e === sentinel); await assert.rejects(failed.api.dispose(), e => e === sentinel);
  assert.equal(failed.auth.length, 2); assert.equal(failed.events.filter(e => e === "data").length, 1);
  const sql = ownedBookingPorts({ sqlFailure: sentinel }); await sql.api.retireTransport(); await assert.rejects(sql.api.dispose(), e => e === sentinel); assert.equal(sql.auth.length, 2);
});

test("one owned lifecycle handoff retains original Request map rows flags and sole finalizer", () => {
  let clock = 0; const f = fixture({ clock: () => ++clock }), old = Object.assign(f.page, { isClosed: () => closed }); let closed = false;
  const handlers = new Map<string, unknown>(), fresh = { on: (n: string, fn: unknown) => handlers.set(n, fn), off: (n: string) => handlers.delete(n), context: old.context, isClosed: () => false, mainFrame: () => ({}), url: () => "http://localhost/scheduling" };
  f.api.activate(old, 0); const request = {}; f.api.mark(old, "response-admitted", "event", request, 7, 2); f.api.mark(old, "unknown-event");
  const transfer = f.api.retireOwnedTarget(old); assert.equal(f.handlers.size, 0); assert.equal(f.output.length, 0); closed = true; transfer.attach(fresh);
  f.api.mark(fresh, "request-failed", "event", request); f.api.mark(fresh, "request-failed", "event", {}); f.api.mark(old, "booking-dispose", "enter");
  f.api.finish(fresh); assert.equal(f.output.length, 0); f.api.mark(old, "fixture-release", "event"); f.api.finish(old); f.api.finish(fresh); f.api.finish(old);
  assert.equal(f.output.length, 1); const row = decoded(f); assert.equal(row.rows.filter((r: { event: string }) => r.event === "attempt-start").length, 1);
  assert.equal(row.rows[2].requestOrdinal, 7); assert.equal(row.rows[3].requestOrdinal, null); assert.equal(row.flags.privacyRejected, true);
  assert.deepEqual(row.rows.map((r: { seq: number }) => r.seq), row.rows.map((_r: unknown, i: number) => i + 1));
  assert.equal(handlers.size, 0); assert.equal(f.contextHandlers.size, 0); assert.equal(f.browserHandlers.size, 0);
});

test("handoff listener faults remain visible and original caps are never reset", () => {
  const f = fixture(), old = Object.assign(f.page, { isClosed: () => true }); f.api.activate(old, 0);
  for (let i = 0; i < 32; i++) f.api.mark(old, "request-admitted", "event", {});
  const transfer = f.api.retireOwnedTarget(old), fresh = { on: (name: string) => { if (name === "crash") throw new Error("synthetic-listener"); }, off() {}, context: old.context, isClosed: () => false, mainFrame: () => ({}), url: () => "http://localhost/scheduling" };
  assert.throws(() => transfer.attach(fresh)); assert.throws(() => f.api.retireOwnedTarget(old)); f.api.mark(fresh, "request-admitted", "event", {}); f.api.finish(old);
  const row = decoded(f); assert.equal(row.flags.listenerUnavailable, true); assert.equal(row.flags.overflow, true); assert.equal(f.output.length, 1);
});

test("owned helper confirms original close before one same-context child and refuses retired delegates", async () => {
  const f = ownedSchedulingPorts(); assert.equal(await f.api.openOwnRolePage(), f.fresh);
  assert.ok(f.events.indexOf("old-close") < f.events.indexOf("new")); assert.ok(f.events.indexOf("new") < f.events.indexOf("fresh-route")); assert.equal(f.creates(), 1);
  assert.deepEqual(Array.from(await f.api.visibleIds()), ["synthetic-booking"]); assert.throws(() => f.api.editor); assert.throws(() => f.api.observeConfirmedSave()); assert.throws(() => f.api.failNextSaveOnce()); await assert.rejects(f.api.seed(), /Retired booking editor delegate/); assert.equal(f.delegates(), 0);
  await assert.rejects(f.api.openOwnRolePage()); await f.api.closeOwnRolePage(); await f.api.dispose(); await f.api.dispose();
  assert.equal(f.data(), 1); assert.equal(f.auth.length, 1); assert.equal(f.events.filter(e => e === "old-close").length, 1); assert.equal(f.events.filter(e => e === "fresh-close").length, 1);
});

test("uncertain old close forbids creation and late child creation is owned and closed", async () => {
  let settle!: () => void, oldStarted!: () => void; const closeStarted = new Promise<void>(yes => { oldStarted = yes; });
  const f = ownedSchedulingPorts({ oldClose: () => new Promise<void>(yes => { settle = yes; oldStarted(); }) });
  const opening = f.api.openOwnRolePage(); void opening.catch(() => {}); await closeStarted;
  await assert.rejects(f.api.dispose()); assert.equal(f.creates(), 0); assert.equal(f.data(), 1); settle(); await assert.rejects(opening); assert.equal(f.creates(), 0);
  let deliver!: (page: unknown) => void, newStarted!: () => void; const creationStarted = new Promise<void>(yes => { newStarted = yes; });
  const late = ownedSchedulingPorts({ newPage: () => new Promise(yes => { deliver = yes; newStarted(); }) });
  const creating = late.api.openOwnRolePage(); void creating.catch(() => {}); await creationStarted;
  await assert.rejects(late.api.dispose()); deliver(late.fresh); await assert.rejects(creating); await Promise.resolve();
  assert.equal(late.events.filter(e => e === "fresh-close").length, 1); assert.equal(late.data(), 1);
});

test("owned handoff failure retains first error and caller keeps origin and one final passive instance", async () => {
  const sentinel = {}, f = ownedSchedulingPorts({ unroute: async () => { throw sentinel; } });
  await assert.rejects(f.api.openOwnRolePage(), e => e === sentinel); await assert.rejects(f.api.dispose(), e => e === sentinel); assert.equal(f.data(), 1); assert.equal(f.auth.length, 1); assert.equal(f.creates(), 0);
  const file = source(spec), start = file.indexOf('test("[P0] 15.1-INT-001'), end = file.indexOf("// Focus regression:", start), body = file.slice(start, end);
  assert.ok(body.indexOf("new URL(managerPage.url()).origin") < body.indexOf("await h.openOwnRolePage()"));
  assert.ok(body.indexOf("await h.openOwnRolePage()") < body.indexOf("const passive = createSchedulingPassiveMetadata"));
  assert.equal((body.match(/const passive = createSchedulingPassiveMetadata/g) ?? []).length, 1); assert.equal((body.match(/passive.start\(\)/g) ?? []).length, 1);
  assert.ok(body.indexOf('if (!roleReleased)') < body.indexOf('guardedSignIn("denied")')); assert.ok(body.indexOf('guardedSignIn("denied")') < body.indexOf("await guardedStage(() => h.closeOwnRolePage())"));
});

test("retirement release faults and late pass-through cannot be mistaken for a completed handoff", async () => {
  const sentinel = {}, f = ownedBookingPorts(); let released = 0;
  f.api.addRelease(() => { throw sentinel; }); f.api.addRelease(() => { released++; });
  await assert.rejects(f.api.retireTransport(), e => e === sentinel); assert.equal(released, 1); assert.equal(f.deletes(), 0);
  await assert.rejects(f.api.dispose(), e => e === sentinel); assert.equal(f.auth.length, 2);
  const stuck = ownedBookingPorts({ unroute: () => new Promise<void>(() => {}) }); void stuck.api.retireTransport().catch(() => {});
  await assert.rejects(stuck.api.dispose(), /retirement unverified/); assert.equal(stuck.auth.length, 2);
  const late = ownedBookingPorts(); await late.api.retireTransport();
  await assert.rejects(late.api.handle({ fallback: () => { throw sentinel; } }), e => e === sentinel);
  await assert.rejects(late.api.retireTransport(), e => e === sentinel); await assert.rejects(late.api.dispose(), e => e === sentinel);
  const original = ownedBookingPorts(); original.api.addRelease(() => { throw sentinel; });
  await assert.rejects(original.api.dispose(), e => e === sentinel); assert.equal(original.auth.length, 2);
});

/** A regressed microtask spin must not starve the parent test runner's timeout. */
async function ownedHandlerAbortChild(mode: "resolve" | "reject" | "pending" | "default") {
  const { spawn } = await import("node:child_process");
  const file = parsed("tests/unit/scripts/verify/scheduling-lifecycle-metadata.test.ts");
  const helperText = ["ownedBookingPorts", "ownedSchedulingPorts"].map(name => {
    const fn = file.statements.find((node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node) && node.name?.text === name);
    assert.ok(fn); return fn.getText(file);
  }).join("\n");
  const script = String.raw`
    const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
    const mode=__MODE__,helperText=__HELPERS__,support='tests/e2e/support/';
    const source=p=>fs.readFileSync(p,'utf8'),parsed=p=>ts.createSourceFile(p,source(p),99,true);
    const compile=text=>ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
    const evaluate=(text,bindings)=>{const exports={};vm.runInNewContext(compile('const evaluated='+text+';exports.value=evaluated;'),{...bindings,exports});return exports.value};
    const ports=evaluate('(()=>{'+helperText+';return {ownedBookingPorts,ownedSchedulingPorts};})()',{ts,assert,parsed,evaluate,URL,Buffer,Date,Promise,support});
    const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return{promise,resolve,reject}};
    let stage='start',finished=false;
    process.on('beforeExit',()=>{if(!finished){process.stderr.write('incomplete-owned-handler-case');process.exitCode=2;}});
    (async()=>{
      const f=ports.ownedBookingPorts(),inner=deferred(),abort=deferred(),entered=deferred(),sentinel={},abortFailure={};
      const handling=f.api.handle({request:()=>({method:()=> 'GET'}),continue:()=>inner.promise,abort:()=>{entered.resolve();return abort.promise}});
      void handling.catch(()=>{});
      const helper=mode==='default'?undefined:ports.ownedSchedulingPorts({transportRetire:()=>f.api.retireTransport()});
      const opening=helper?.api.openOwnRolePage();if(opening)void opening.catch(()=>{});
      const retirement=mode==='default'?undefined:f.api.retireTransport();let settled=false;
      if(retirement)void retirement.then(()=>{settled=true},()=>{settled=true});
      inner.reject(sentinel);stage='abort-enter';await entered.promise;
      // The real handler is now inside catch, awaiting its abort before finally.
      await new Promise(resolve=>setImmediate(resolve));stage='later-turn';
      assert.equal(settled,false);assert.equal(f.events.includes('unroute'),false);
      if(helper){assert.equal(helper.creates(),0);assert.equal(helper.events.includes('old-close'),false)}
      if(mode==='default'){
        await f.api.dispose();assert.equal(f.auth.length,2);assert.equal(f.events[0],'unroute');
        abort.resolve();await assert.rejects(handling,e=>e===sentinel);
      }else if(mode==='pending'){
        // Original data cleanup must progress even while full handler cleanup never settles.
        await assert.rejects(f.api.dispose(),e=>e===sentinel);assert.equal(f.auth.length,2);assert.equal(settled,false);
      }else{
        if(mode==='reject')abort.reject(abortFailure);else abort.resolve();
        await assert.rejects(handling,e=>e===sentinel);await assert.rejects(retirement,e=>e===sentinel);await assert.rejects(opening,e=>e===sentinel);
        assert.equal(f.events[0],'unroute');assert.equal(helper.creates(),0);
        await assert.rejects(f.api.dispose(),e=>e===sentinel);assert.equal(f.auth.length,2);
        await assert.rejects(helper.api.dispose(),e=>e===sentinel);assert.equal(helper.data(),1);
      }
      stage='complete';finished=true;
      process.stdout.write(JSON.stringify({mode,laterTurn:true,noEarlyDetach:true,noEarlyClose:true,noEarlyChild:true,originalError:true,dataAuth:f.auth.length,pending:mode==='pending',defaultLegacy:mode==='default'})+'\n');
    })().catch(()=>{finished=true;process.stderr.write('owned-handler-case-failed:'+stage);process.exitCode=1});
  `.replace("__MODE__", JSON.stringify(mode)).replace("__HELPERS__", JSON.stringify(helperText));
  return await new Promise<{ mode: string; laterTurn: boolean; noEarlyDetach: boolean; noEarlyClose: boolean; noEarlyChild: boolean; originalError: boolean; dataAuth: number; pending: boolean; defaultLegacy: boolean }>((resolve, reject) => {
    const child = spawn(process.execPath, ["-e", script], { cwd: process.cwd(), windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let output = "", bytes = 0, timedOut = false, settled = false;
    const timeout = setTimeout(() => { timedOut = true; child.kill(); }, 5000);
    const collect = (part: Buffer, stdout: boolean) => { bytes += part.byteLength; if (bytes > 16384) { timedOut = true; child.kill(); return; } if (stdout) output += part.toString("utf8"); };
    child.stdout.on("data", (part: Buffer) => collect(part, true)); child.stderr.on("data", (part: Buffer) => collect(part, false));
    child.once("error", () => { clearTimeout(timeout); if (!settled) { settled = true; reject(new Error("Owned handler child could not start.")); } });
    child.once("close", code => {
      clearTimeout(timeout); if (settled) return; settled = true;
      if (timedOut || code !== 0) { reject(new Error("Owned handler child failed or did not settle.")); return; }
      try { resolve(JSON.parse(output)); } catch { reject(new Error("Owned handler child result unavailable.")); }
    });
  });
}

test("real registered handler drain yields to I/O and rejects only after delayed abort completion", async () => {
  const result = await ownedHandlerAbortChild("resolve");
  assert.equal(result.laterTurn, true); assert.equal(result.noEarlyDetach, true); assert.equal(result.noEarlyClose, true); assert.equal(result.noEarlyChild, true); assert.equal(result.originalError, true); assert.equal(result.dataAuth, 2);
});
test("real handler abort rejection cannot replace the original admitted-work failure", async () => {
  const result = await ownedHandlerAbortChild("reject"); assert.equal(result.originalError, true); assert.equal(result.laterTurn, true); assert.equal(result.dataAuth, 2);
});
test("pending full handler cleanup cannot starve independent original data cleanup", async () => {
  const result = await ownedHandlerAbortChild("pending"); assert.equal(result.pending, true); assert.equal(result.laterTurn, true); assert.equal(result.noEarlyDetach, true); assert.equal(result.dataAuth, 2);
});
test("non-opt-in default disposal still uses original inner-work ordering during pending abort", async () => {
  const result = await ownedHandlerAbortChild("default"); assert.equal(result.defaultLegacy, true); assert.equal(result.laterTurn, true); assert.equal(result.originalError, true); assert.equal(result.dataAuth, 2);
});
