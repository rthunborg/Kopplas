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
  const selected = new Set(["deferred", "releases", "pendingRoutes", "handlerCompletions", "transportOptIn", "transportRetirement", "ownedRetirementOnly", "hasOwnedFailure", "retainOwnedFailure", "retireTransport", "transportDiagnostics", "previewFetchCount", "confirmations", "transports", "observedSaveTimeout", "optionsFailure", "saveHold", "saveFailure", "saveLoss", "previewFailure", "previewRace", "actionInput", "routeWork", "routeHandler", "cleanupScenario"]);
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
  const file = source(spec), start = file.indexOf('roleResponseTest("[P0] 15.1-INT-001'), end = file.indexOf("// Focus regression:", start), body = file.slice(start, end);
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


// Appended role-child release regressions; the original29-case prefix stays byte-exact.
function childReleaseDeferred() {
  let resolve!: () => void, reject!: (error: unknown) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  void promise.catch(() => {}); return { promise, resolve, reject };
}
const childReleaseTurn = () => new Promise<void>(resolve => setImmediate(resolve));
function childReleasePorts(options: { register?: () => Promise<void>; unroute?: () => Promise<void>; close?: () => Promise<void> } = {}) {
  const f = ownedSchedulingPorts(), registration = childReleaseDeferred();
  const fresh = f.fresh as unknown as { route: (pattern: string, handler: unknown) => Promise<void>; unroute: (pattern: string, handler: unknown) => Promise<void>; close: () => Promise<void>; isClosed: () => boolean };
  const originalClose = fresh.close; let handler: unknown, invoked = false, removalSettled = false, externalClosed = false;
  const originalIsClosed = fresh.isClosed;
  fresh.isClosed = () => externalClosed || originalIsClosed();
  fresh.route = (pattern, callback) => {
    assert.equal(pattern, "**/*"); assert.equal(invoked, false);
    invoked = true; handler = callback; f.events.push("child-register-invoked"); registration.resolve();
    return options.register ? options.register() : Promise.resolve();
  };
  fresh.unroute = (pattern, callback) => {
    assert.equal(pattern, "**/*"); assert.equal(invoked, true); assert.equal(callback, handler);
    f.events.push("child-exact-unroute");
    try {
      return (options.unroute ? options.unroute() : Promise.resolve()).then(() => { removalSettled = true; }, error => { removalSettled = true; throw error; });
    } catch (error) { removalSettled = true; throw error; }
  };
  fresh.close = async () => {
    if (invoked) assert.equal(removalSettled, true, "Child closed before owned unroute settled");
    f.events.push("child-close"); await options.close?.(); await originalClose();
  };
  return { ...f, registration, closeExternally: () => { externalClosed = true; } };
}
test("child route release precedes one cached close and repeated data cleanup", async () => {
  const f = childReleasePorts(); await f.api.openOwnRolePage();
  const a = f.api.closeOwnRolePage(), b = f.api.closeOwnRolePage(); assert.equal(a, b); await a;
  await f.api.dispose(); await f.api.dispose();
  assert.ok(f.events.indexOf("child-exact-unroute") < f.events.indexOf("child-close"));
  assert.equal(f.events.filter(e => e === "child-exact-unroute").length, 1); assert.equal(f.events.filter(e => e === "child-close").length, 1);
  assert.equal(f.data(), 1); assert.equal(f.auth.length, 1);
});
test("pending child registration blocks removal and close while independent data progresses", async () => {
  const registration = childReleaseDeferred(), f = childReleasePorts({ register: () => registration.promise });
  const opening = f.api.openOwnRolePage(); void opening.catch(() => {}); await f.registration.promise;
  const closing = f.api.closeOwnRolePage(); void closing.catch(() => {});
  await childReleaseTurn(); assert.equal(f.events.includes("child-exact-unroute"), false); assert.equal(f.events.includes("child-close"), false);
  await assert.rejects(f.api.dispose(), /release unverified/); assert.equal(f.data(), 1); assert.equal(f.auth.length, 1);
  registration.resolve(); await assert.rejects(opening); await assert.rejects(closing);
  assert.equal(f.events.filter(e => e === "child-exact-unroute").length, 1); assert.equal(f.events.filter(e => e === "child-close").length, 1);
});
test("failed or throwing possibly-installed child registration still removes the exact handler before close", async () => {
  for (const synchronous of [false, true]) {
    const sentinel = {}, f = childReleasePorts({ register: () => { if (synchronous) throw sentinel; return Promise.reject(sentinel); } });
    await assert.rejects(f.api.openOwnRolePage(), error => error === sentinel);
    await assert.rejects(f.api.closeOwnRolePage(), error => error === sentinel);
    await assert.rejects(f.api.dispose(), error => error === sentinel);
    assert.ok(f.events.indexOf("child-exact-unroute") < f.events.indexOf("child-close")); assert.equal(f.data(), 1); assert.equal(f.auth.length, 1);
  }
});
test("release requested before delayed registration rejection retains the original carrier", async () => {
  const registration = childReleaseDeferred(), sentinel = {}, f = childReleasePorts({ register: () => registration.promise });
  const opening = f.api.openOwnRolePage(); void opening.catch(() => {}); await f.registration.promise;
  const closing = f.api.closeOwnRolePage(); void closing.catch(() => {});
  registration.reject(sentinel); await assert.rejects(opening, error => error === sentinel); await assert.rejects(closing, error => error === sentinel);
  await assert.rejects(f.api.dispose(), error => error === sentinel); assert.equal(f.data(), 1);
});
test("pending exact unroute prevents early close but never starves original SQL and Auth cleanup", async () => {
  const removal = childReleaseDeferred(), f = childReleasePorts({ unroute: () => removal.promise }); await f.api.openOwnRolePage();
  const closing = f.api.closeOwnRolePage(); void closing.catch(() => {}); await childReleaseTurn();
  assert.equal(f.events.includes("child-close"), false); await assert.rejects(f.api.dispose(), /release unverified/);
  assert.equal(f.data(), 1); assert.equal(f.auth.length, 1); assert.equal(f.events.includes("child-close"), false);
  removal.resolve(); await assert.rejects(closing, /release unverified/);
  assert.equal(f.events.filter(e => e === "child-close").length, 1); await assert.rejects(f.api.dispose()); assert.equal(f.data(), 1);
});
test("rejected exact unroute still attempts close and retains earliest failure through data cleanup", async () => {
  const first = {}, later = {}, f = childReleasePorts({ unroute: () => Promise.reject(first), close: () => Promise.reject(later) }); await f.api.openOwnRolePage();
  await assert.rejects(f.api.closeOwnRolePage(), error => error === first); await assert.rejects(f.api.dispose(), error => error === first);
  assert.equal(f.events.filter(e => e === "child-close").length, 1); assert.equal(f.data(), 1); assert.equal(f.auth.length, 1);
});
test("externally closed unreleased child cannot turn a removal acknowledgement into success", async () => {
  const f = childReleasePorts(); await f.api.openOwnRolePage(); f.closeExternally();
  await assert.rejects(f.api.closeOwnRolePage(), /route release unverified/); await assert.rejects(f.api.dispose(), /route release unverified/);
  assert.equal(f.events.filter(e => e === "child-exact-unroute").length, 1); assert.equal(f.events.filter(e => e === "child-close").length, 1); assert.equal(f.data(), 1);
});
test("canceled late never-routed child closes without an invented removal obligation", async () => {
  let deliver!: (page: unknown) => void; const started = childReleaseDeferred();
  const f = ownedSchedulingPorts({ newPage: () => { started.resolve(); return new Promise(yes => { deliver = yes; }); } });
  const opening = f.api.openOwnRolePage(); void opening.catch(() => {}); await started.promise;
  await assert.rejects(f.api.dispose()); deliver(f.fresh); await assert.rejects(opening); await childReleaseTurn();
  assert.equal(f.events.includes("fresh-route"), false); assert.equal(f.events.includes("fresh-unroute"), false); assert.equal(f.events.filter(e => e === "fresh-close").length, 1);
  assert.equal(f.data(), 1); assert.equal(f.auth.length, 1);
});
test("unchanged default manager cleanup and failed child creation preserve their original owners", async () => {
  const plain = ownedSchedulingPorts(); await plain.api.dispose(); assert.equal(plain.events.includes("old-unroute"), true); assert.equal(plain.events.includes("fresh-unroute"), false); assert.equal(plain.data(), 1);
  const sentinel = {}, failed = ownedSchedulingPorts({ newPage: () => Promise.reject(sentinel) });
  await assert.rejects(failed.api.openOwnRolePage(), error => error === sentinel); await assert.rejects(failed.api.dispose(), error => error === sentinel);
  assert.equal(failed.creates(), 1); assert.equal(failed.events.includes("fresh-route"), false); assert.equal(failed.data(), 1); assert.equal(failed.auth.length, 1);
});
function roleInitialStepCall() {
  const file = parsed(spec); let text = "";
  const walk = (node: ts.Node) => { if (ts.isCallExpression(node) && node.expression.getText(file) === "test.step" && node.arguments[0]?.getText(file) === '"Role initial required flow"') { assert.equal(node.arguments.length, 2); text = node.getText(file); } ts.forEachChild(node, walk); };
  walk(file); assert.ok(text); return text;
}
function roleInitialStepPorts(fault?: { at: "navigate" | "settle" | "drain" | "qualify"; error: unknown; asynchronous?: boolean }) {
  const calls: string[] = [], errors: { title: string; error: unknown }[] = [], titles: string[] = []; let first: unknown, hasFirst = false;
  const req = {}, response = { ok: () => true, request: () => req }, original = Promise.resolve(response);
  const fail = (at: string) => { if (fault?.at === at) { if (fault.asynchronous) { hasFirst = true; first = fault.error; } else throw fault.error; } };
  const bindings = {
    test: { step: async (title: string, body: () => Promise<unknown>) => { titles.push(title); try { return await body(); } catch (error) { errors.push({ title, error }); throw error; } } },
    page: { goto: () => { calls.push("goto"); fail("navigate"); return original; } }, h: { extraProfiles: ["", "", "synthetic-peer"], scenario: { tenantIds: ["", "synthetic-tenant"] } },
    openCaptureWindow: () => { calls.push("open"); }, targetAssociation: { observe: (value: unknown) => { calls.push("observe"); assert.equal(value, original); } },
    navigateAfterBarrier: async (operation: () => Promise<unknown>) => { calls.push("barrier"); return await operation(); },
    guardProgress: () => { calls.push("guard"); if (hasFirst) throw first; }, guardedSettle: async () => { calls.push("settle"); fail("settle"); }, drain: async () => { calls.push("drain"); fail("drain"); },
    qualifyRolePhase: async () => { calls.push("qualify"); fail("qualify"); }, admitted: new Map([[req, { phase: "complete" }]]),
    expect: (value: unknown) => ({ not: { toBeNull: () => { calls.push("response-present"); assert.equal(value, response); } }, toBe: (expected: unknown) => { calls.push("response-check"); assert.equal(value, expected); } }),
  };
  const run = evaluate(`(async()=>{await ${roleInitialStepCall()};})`, bindings);
  return { run, calls, errors, titles, original };
}
test("actual initial role step wrappers retain fixed nesting navigation identity values and all guards", async () => {
  const f = roleInitialStepPorts(); await f.run();
  assert.deepEqual(f.titles, ["Role initial required flow", "Role initial controlled navigation", "Role initial native drain", "Role initial complete client and native qualification", "Role initial UI settlement"]);
  assert.deepEqual(f.calls, ["barrier", "open", "goto", "observe", "guard", "drain", "guard", "response-present", "response-check", "response-check", "qualify", "guard", "settle", "guard"]); assert.equal(f.errors.length, 0);
});
test("actual initial await wrappers preserve primitive object and earlier asynchronous firstFailure identities", async () => {
  for (const at of ["navigate", "settle", "drain", "qualify"] as const) for (const error of ["net::ERR_ABORTED", {}]) {
    const f = roleInitialStepPorts({ at, error }); await assert.rejects(f.run(), value => value === error); assert.equal(f.errors[0]!.error, error); assert.equal(f.errors.at(-1)!.title, "Role initial required flow");
  }
  const sentinel = {}, f = roleInitialStepPorts({ at: "settle", error: sentinel, asynchronous: true }); await assert.rejects(f.run(), value => value === sentinel); assert.equal(f.errors[0]!.title, "Role initial UI settlement"); assert.equal(f.errors[0]!.error, sentinel);
});
test("installed standard step and nested JSON serializer retain fixed context and exact rethrow", async () => {
  const version = (JSON.parse(source("node_modules/@playwright/test/package.json")) as { version: string }).version;
  const installed = `node_modules/.pnpm/playwright@${version}/node_modules/playwright/lib/`;
  const common = source(installed + "common/index.js"), runner = source(installed + "runner/index.js");
  const start = common.indexOf("  async _step(expectation, title, body, options = {}) {"); const end = common.indexOf("  _extend(", start); assert.ok(start >= 0 && end > start);
  const steps: { title: string; duration: number; error?: unknown; category: string; steps: unknown[] }[] = [];
  const info = { _addStep: (options: { title: string; category: string }) => { const row = { title: options.title, category: options.category, duration: 0, steps: [], error: undefined as unknown }; steps.push(row); return { info: { _runStepBody: async (_skip: boolean, body: () => Promise<unknown>) => await body() }, complete: (result: { error?: unknown }) => { row.error = result.error; } }; } };
  const method = evaluate(`({${common.slice(start, end)}})._step`, { import_globals2: { currentTestInfo: () => info }, currentZone: () => ({ with: () => ({ run: (body: () => Promise<unknown>) => body() }) }), raceAgainstDeadline: async (body: () => Promise<unknown>, deadline: number) => { assert.equal(deadline, 0); return { result: await body(), timedOut: false }; } });
  assert.equal(await method("pass", "Role initial required flow", async () => 7), 7);
  const sentinel = {}; await assert.rejects(method("pass", "Role initial native drain", async () => { throw sentinel; }), value => value === sentinel); assert.equal(steps[1]!.error, sentinel);
  const serializerStart = runner.indexOf("  _serializeTestStep(step) {"); const serializerEnd = runner.indexOf("\n  }", serializerStart) + 4; assert.ok(serializerStart >= 0 && serializerEnd > serializerStart);
  const serializer = evaluate(`({${runner.slice(serializerStart, serializerEnd)}})`, {});
  const nested = serializer._serializeTestStep({ ...steps[0], steps: [steps[1], { title: "not-a-user-step", category: "pw:api", steps: [] }] });
  assert.equal(nested.title, "Role initial required flow"); assert.equal(nested.steps.length, 1); assert.equal(nested.steps[0].title, "Role initial native drain"); assert.equal(nested.steps[0].error, sentinel); assert.deepEqual(Object.keys(nested).sort(), ["duration", "error", "steps", "title"]);
});


// Role response delivery regressions: original assertions above remain unchanged except the explicit INT test alias selector.
function roleDeliveryDefinitions() {
  const file = parsed(spec), names = ["roleDeliveryRequire", "roleDeliveryWithin", "roleDeliveryBytes", "roleDeliveryHeaders", "createRoleResponseDelivery"], parts: string[] = [];
  const walk = (node: ts.Node) => { if (ts.isFunctionDeclaration(node) && names.includes(node.name?.text ?? "")) parts.push(node.getText(file)); ts.forEachChild(node, walk); }; walk(file);
  assert.equal(parts.length, names.length); return parts.join("\n");
}
test("Role bounded response decoder checks encoded bytes before decoding and preserves exact chunk cap", () => {
  const api = evaluate('(()=>{' + roleDeliveryDefinitions() + ';return {roleDeliveryBytes,roleDeliveryHeaders};})()', {Buffer, URL, Promise, Map, Set, Error, Date, performance, setTimeout, clearTimeout});
  assert.throws(() => api.roleDeliveryBytes("A".repeat(21849), true, 16384));
  assert.equal(api.roleDeliveryBytes(Buffer.alloc(16384).toString("base64"), true, 16384).length, 16384);
  assert.throws(() => api.roleDeliveryBytes(Buffer.alloc(16385).toString("base64"), true, 16384));
  assert.throws(() => api.roleDeliveryHeaders([{name:"content-type",value:"text/x-component"},{name:"set-cookie",value:"no-export"}]));
});
test("actual Role delivery serializes bounded bodies and releases before client validation without replacing native observations", async () => {
  const api = evaluate('(()=>{' + roleDeliveryDefinitions() + ';return {createRoleResponseDelivery};})()', {Buffer, URL, Promise, Map, Set, Error, Date, performance, setTimeout, clearTimeout});
  const events: string[] = [], handlers = new Map<string, (value: unknown) => void>(); let stream = 0;
  const session = {
    on: (name: string, callback: (value: unknown) => void) => handlers.set(name, callback), off: (name: string) => handlers.delete(name),
    send: async (name: string, params: {size?:number}) => { events.push(name); if (name === "Fetch.takeResponseBodyAsStream") return {stream:"owned-" + (++stream)}; if (name === "IO.read") {assert.equal(params.size,16384);return {data:"genuine body",eof:true};} return {}; },
    detach: async () => { events.push("detach"); },
  };
  const errors: unknown[] = [], delivery = api.createRoleResponseDelivery(session,"http://localhost","owned-frame",(error:unknown)=>errors.push(error),async()=>{events.push("owned-close");});
  await delivery.enable();
  for (const date of ["2026-10-16", "2026-10-17"]) {
    delivery.arm(date);
    for (let n=0;n<2;n++) handlers.get("Fetch.requestPaused")!({requestId:date+"-"+n,frameId:"owned-frame",request:{url:"http://localhost/scheduling",method:"POST",headers:{"next-action":"not-exported"},postData:JSON.stringify([{view:"personal",mode:"week",date,filters:{personIds:[],workRoleIds:[],jobIds:[],customerIds:[],status:"planned"}}])},responseStatusCode:200,responseHeaders:[{name:"content-type",value:"text/x-component"}]});
    await delivery.complete(); events.push("original-client-native-validation-remains-required");
  }
  await delivery.dispose(true); assert.equal(errors.length,0); assert.equal(events.filter(event=>event==="Fetch.fulfillRequest").length,4);
  assert.ok(events.indexOf("Fetch.fulfillRequest")<events.indexOf("original-client-native-validation-remains-required")); assert.equal(events.includes("owned-close"),false); assert.equal(handlers.size,0);
});

test("actual Role acquisition registers cached close before broken or expired state rejection", async () => {
  for (const mode of ["broken", "expired"] as const) {
    const timers = new Map<number, () => void>(); let timerId = 0;
    const setTimer = (callback: () => void, ms: number) => { assert.equal(ms, 3000); const id = ++timerId; timers.set(id, callback); return id; };
    const api = evaluate('(()=>{' + roleDeliveryDefinitions() + ';return {createRoleResponseDelivery};})()', {Buffer, URL, Promise, Map, Set, Error, Date, performance, setTimeout:setTimer, clearTimeout:(id:number)=>timers.delete(id)});
    const first = evaluate('(()=>{let shutdownStarted=false,hasFailure=false,firstFailure;const notifyFailure=()=>{};const recordFailure=' + arrow(spec,"recordFailure") + ';return {recordFailure,first:()=>firstFailure};})()', {});
    let deliver!: (reply: {stream:string}) => void; const acquisition = new Promise<{stream:string}>(yes=>{deliver=yes;});
    const events: string[] = [], handlers = new Map<string,(value:unknown)=>void>();
    const session = { on:(name:string,callback:(value:unknown)=>void)=>handlers.set(name,callback), off:(name:string)=>handlers.delete(name),
      send:async(name:string)=>{events.push(name);if(name==="Fetch.takeResponseBodyAsStream")return acquisition;return {};}, detach:async()=>{events.push("detach");} };
    const delivery = api.createRoleResponseDelivery(session,"http://localhost","owned-frame",first.recordFailure,async()=>{events.push("owned-close");});
    const pause = (id:string,date:string) => handlers.get("Fetch.requestPaused")!({requestId:id,frameId:"owned-frame",request:{url:"http://localhost/scheduling",method:"POST",headers:{"next-action":"not-exported"},postData:JSON.stringify([{view:"personal",mode:"week",date,filters:{personIds:[],workRoleIds:[],jobIds:[],customerIds:[],status:"planned"}}])},responseStatusCode:200,responseHeaders:[{name:"content-type",value:"text/x-component"}]});
    await delivery.enable(); delivery.arm("2026-10-16"); pause("first","2026-10-16");
    for(let n=0;n<16;n++)await Promise.resolve(); assert.equal(events.filter(e=>e==="Fetch.takeResponseBodyAsStream").length,1);
    first.recordFailure(false);
    if(mode==="broken")pause("invalid","2026-10-17");else {assert.equal(timers.size,1);timers.values().next().value!();}
    for(let n=0;n<16;n++)await Promise.resolve(); assert.equal(events.includes("owned-close"),false);
    deliver({stream:"owned-"+mode});for(let n=0;n<24;n++)await Promise.resolve();
    assert.equal(events.filter(e=>e==="IO.close").length,1);assert.equal(events.includes("IO.read"),false);assert.equal(events.includes("Fetch.fulfillRequest"),false);assert.equal(events.includes("Fetch.disable"),false);assert.equal(events.includes("owned-close"),false);
    const cleanup=delivery.dispose(false);assert.equal(cleanup,delivery.dispose(false));await assert.rejects(cleanup);for(let n=0;n<8;n++)await Promise.resolve();
    assert.equal(events.filter(e=>e==="IO.close").length,1);assert.equal(events.filter(e=>e==="owned-close").length,1);assert.equal(first.first(),false);assert.equal(timers.size,0);
  }
});


// Pinned case-recorder/worker-pool compatibility and lifecycle caller regressions.
function roleCompatibilityVariable(text: string, name: string) {
  const file = ts.createSourceFile("compatibility.ts", text, ts.ScriptTarget.Latest, true), found: string[] = [];
  const walk = (node: ts.Node) => { if (ts.isVariableDeclaration(node) && node.name.getText(file) === name && node.initializer) found.push(node.initializer.getText(file)); ts.forEachChild(node, walk); }; walk(file);
  assert.equal(found.length, 1, name); return found[0]!;
}
function roleCompatibilityAlias(version = "1.61.1", env: Record<string, string> = {}) {
  const declaration = roleCompatibilityVariable(source(spec), "roleResponseTest"), file = ts.createSourceFile("alias.ts", "const alias=" + declaration, ts.ScriptTarget.Latest, true);
  const value = (file.statements[0] as ts.VariableStatement).declarationList.declarations[0]!.initializer as ts.CallExpression;
  return evaluate(value.arguments[0]!.getText(file), { playwrightPackage: { version }, process: { env } });
}
function roleCompatibilityWorkerClass(name: string) {
  return roleCompatibilityVariable(source("node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/lib/worker/workerProcessEntry.js"), name);
}
test("pinned worker pool and serial retry expansion keep base Role base compatible without worker recorder overrides", async () => {
  const { createRequire } = await import("node:module"), pinnedRequire = createRequire(process.cwd() + "/package.json");
  assert.equal((pinnedRequire("@playwright/test/package.json") as {version:string}).version,"1.61.1");
  const common = pinnedRequire(process.cwd() + "/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/lib/common/index.js");
  const installed = source("node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/lib/index.js");
  const utility = evaluate(roleCompatibilityVariable(installed,"utilityFixtures"),{}), browser = evaluate(roleCompatibilityVariable(installed,"playwrightFixtures"),{});
  const location={file:"inert-fixture.ts",line:1,column:1}, errors: unknown[]=[];
  const base = new common.fixtures.FixturePool([{fixtures:utility,location},{fixtures:browser,location}],(error:unknown)=>errors.push(error),undefined,false,{overrides:{trace:"on-first-retry"},location});
  const alias=roleCompatibilityAlias(); assert.deepEqual(Object.keys(alias),["_setupArtifacts"]);
  const role = new common.fixtures.FixturePool([{fixtures:alias,location}],(error:unknown)=>errors.push(error),base,false);
  const old = new common.fixtures.FixturePool([{fixtures:{...alias,trace:"off",screenshot:"off",video:"off"},location}],(error:unknown)=>errors.push(error),base,false);
  assert.deepEqual(errors,[]); assert.equal(base.resolve("_optionContextReuseMode").fn,"none"); assert.equal(base.resolve("video").fn,"off"); assert.equal(base.resolve("screenshot").fn,"off"); assert.equal(role.digest,base.digest); assert.notEqual(old.digest,base.digest);
  for(const key of ["trace","screenshot","video"]){assert.equal(role.resolve(key),base.resolve(key));assert.equal(base.resolve(key).scope,"worker");assert.notEqual(old.resolve(key),base.resolve(key));}
  const FixtureRunner = evaluate(roleCompatibilityWorkerClass("FixtureRunner"),{});
  const runnerSource=source("node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/lib/runner/index.js"), start=runnerSource.indexOf("    const retryCandidates ="), end=runnerSource.indexOf("    const newJob =",start); assert.ok(start>=0&&end>start);
  const expand=evaluate("function(){"+runnerSource.slice(start,end)+"return remaining;}",{});
  for(const attempt of [1,2]){
    const suite:{_parallelMode:string;parent:undefined;allTests:()=>unknown[]}={_parallelMode:"serial",parent:undefined,allTests:()=>tests};
    const tests=[{id:"before",parent:suite,results:Array(attempt),retries:2,pool:base},{id:"role",parent:suite,results:Array(attempt),retries:2,pool:role},{id:"after",parent:suite,results:Array(attempt),retries:2,pool:base}];
    const remaining=new Map(tests.map(test=>[test.id,test]));
    const expanded=expand.call({_failedTests:new Set([tests[2]]),_failedWithNonRetriableError:new Set(),_remainingByTestId:remaining,_massSkipTestsFromRemaining:(ids:Set<string>)=>{for(const id of ids)remaining.delete(id);}}) as typeof tests;
    assert.equal(expanded.length,3);assert.deepEqual(new Set(expanded.map(test=>test.id)),new Set(tests.map(test=>test.id)));
    const runner=new FixtureRunner();for(const test of expanded)runner.setPool(test.pool);
    const oldRunner=new FixtureRunner();oldRunner.setPool(base);assert.throws(()=>oldRunner.setPool(old),/inconsistent test.use/);
  }
});
test("pinned retry tracing is disabled before sensitive data while case recorder guards fail closed", async () => {
  let archiveCalls=0;
  const workerSource=source("node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/lib/worker/workerProcessEntry.js"), workerFile=ts.createSourceFile("worker.js",workerSource,ts.ScriptTarget.Latest,true);
  const preview=workerFile.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==="generatePreview")!;assert.ok(preview);
  const generatePreview=evaluate(preview.getText(workerFile),{});
  const TestTracing=evaluate(roleCompatibilityWorkerClass("TestTracing"),{generatePreview,import_path2:{default:{join:(...values:string[])=>values.join("/")}},import_coreBundle:{getPlaywrightVersion:()=>"1.61.1"},version:8,process:{platform:"synthetic"},monotonicTime2:()=>0,Date,yazl:{ZipFile:class{constructor(){archiveCalls++;throw new Error("unexpected archive");}}}});
  const fresh=async(retry:number,mode="on-first-retry")=>{const tracing=new TestTracing({retry,timeout:180000,status:"passed",expectedStatus:"passed"},"inert-artifacts");await tracing.startIfNeeded(mode);return tracing;};
  // Actual pinned default API-listener control demonstrates why inheriting trace without suppression is insufficient.
  const control=await fresh(1), baseListeners=new Set<{onApiCallBegin:(data:unknown,channel:unknown)=>void}>(), marker="INERT_PRIVATE_MARKER_NOT_ACTUAL_DATA";
  const info={project:{timeout:180000},setTimeout:()=>{},_addStep:(options:Record<string,unknown>)=>{control.appendBeforeActionForStep({...options,stepId:"fixed-control"});return {stepId:"fixed-control"};}};
  const library=source("node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/lib/index.js"), utility=evaluate(roleCompatibilityVariable(library,"utilityFixtures"),{ArtifactsRecorder:class{async willStartTest(){}async didFinishTest(){}},tracing:()=>control,globals:{currentTestInfo:()=>info},currentZone:()=>({data:()=>undefined}),renderTitle:()=>"fixed-control",getActionGroup:()=>undefined});
  await utility._setupArtifacts[0]({playwright:{_instrumentation:{addListener:(listener:typeof baseListeners extends Set<infer T>?T:never)=>baseListeners.add(listener),removeListener:(listener:typeof baseListeners extends Set<infer T>?T:never)=>baseListeners.delete(listener)}},screenshot:"off",_combinedContextOptions:{}},async()=>{assert.equal(baseListeners.size,1);for(const listener of baseListeners)listener.onApiCallBegin({apiName:"synthetic.command",frames:[]},{type:"Synthetic",method:"command",params:{body:marker}});},info);
  assert.equal(baseListeners.size,0);assert.equal(JSON.stringify(control._traceEvents).includes(marker),true);assert.equal(archiveCalls,0);
  for(const [retry,inherited] of [[1,"on-first-retry"],[2,"on-first-retry"],[2,"on-all-retries"]] as const){
    const tracing=await fresh(retry,inherited);if(retry===1||inherited==="on-all-retries")assert.equal(tracing.traceOptions().mode,inherited);
    const listeners=new Set<{runBeforeCreateBrowserContext:(options:Record<string,unknown>)=>Promise<void>;onApiCallBegin?:(data:unknown)=>void}>(), events:string[]=[], defaults={viewport:{width:360,height:640},serviceWorkers:"block"};
    const alias=roleCompatibilityAlias(), fn=alias._setupArtifacts;
    await fn({playwright:{_instrumentation:{addListener:(listener:typeof listeners extends Set<infer T>?T:never)=>listeners.add(listener),removeListener:(listener:typeof listeners extends Set<infer T>?T:never)=>listeners.delete(listener)}},_combinedContextOptions:defaults,_optionContextReuseMode:"none"},async()=>{
      assert.equal(tracing.traceOptions(),undefined);assert.equal(tracing._options,undefined);assert.equal(tracing._shouldCaptureTrace(),false);events.push("effective-off");
      const options:Record<string,unknown>={};for(const listener of listeners)await listener.runBeforeCreateBrowserContext(options);assert.equal(options.viewport,defaults.viewport);assert.equal(options.serviceWorkers,"block");assert.equal(options.recordHar,undefined);assert.equal(options.recordVideo,undefined);
      const marker="INERT_PRIVATE_MARKER_NOT_ACTUAL_DATA";for(const listener of listeners)listener.onApiCallBegin?.({params:{body:marker}});events.push("synthetic-command");assert.equal(JSON.stringify(tracing._traceEvents).includes(marker),false);
      tracing.appendBeforeActionForStep({stepId:"fixed",category:"test.step",title:"Role initial required flow",params:{}});
    },{_tracing:tracing});
    assert.deepEqual(events,["effective-off","synthetic-command"]);assert.equal(listeners.size,0);await tracing.stopIfNeeded();assert.equal(archiveCalls,0);assert.equal(tracing._liveTraceFile,undefined);assert.deepEqual(Array.from(tracing._temporaryTraceFiles),[]);
  }
  for(const mode of ["version","missing","method","events","effective","live","temporary","reuse","DEBUG","DEBUG_FILE","PWDEBUG","NODE_DEBUG","PW_TEST_REUSE_CONTEXT","instrumentation","defaults","recordHar","recordVideo","defaultsHar","defaultsVideo","start-throw","start-reject","options-throw"]){
    const fault={}, tracing=await fresh(1), env:Record<string,string>={}, alias=roleCompatibilityAlias(mode==="version"?"1.62.0":"1.61.1",env);
    if(["DEBUG","DEBUG_FILE","PWDEBUG","NODE_DEBUG","PW_TEST_REUSE_CONTEXT"].includes(mode))env[mode]="inert";
    if(mode==="start-throw")tracing.startIfNeeded=()=>{throw fault;};if(mode==="start-reject")tracing.startIfNeeded=async()=>{throw fault;};if(mode==="options-throw")tracing.traceOptions=()=>{throw fault;};if(mode==="method")tracing.startIfNeeded=undefined;if(mode==="events")tracing._traceEvents=undefined;if(mode==="effective")tracing.startIfNeeded=async()=>{};if(mode==="live")tracing._liveTraceFile={};if(mode==="temporary")tracing._temporaryTraceFiles.push("inert");
    const listeners=new Set<{runBeforeCreateBrowserContext:(options:Record<string,unknown>)=>Promise<void>}>();let sensitive=false;
    await assert.rejects(alias._setupArtifacts({playwright:mode==="instrumentation"?{}:{_instrumentation:{addListener:(listener:typeof listeners extends Set<infer T>?T:never)=>listeners.add(listener),removeListener:(listener:typeof listeners extends Set<infer T>?T:never)=>listeners.delete(listener)}},_combinedContextOptions:mode==="defaults"?undefined:mode==="defaultsHar"?{recordHar:{path:"inert"}}:mode==="defaultsVideo"?{recordVideo:{dir:"inert"}}:{},_optionContextReuseMode:mode==="reuse"?"when-possible":"none"},async()=>{const options=mode==="recordHar"?{recordHar:{path:"inert"}}:mode==="recordVideo"?{recordVideo:{dir:"inert"}}:{};for(const listener of listeners)await listener.runBeforeCreateBrowserContext(options);sensitive=true;},{_tracing:mode==="missing"?undefined:tracing}),error=>["start-throw","start-reject","options-throw"].includes(mode)?error===fault:true);
    assert.equal(sensitive,false);assert.equal(listeners.size,0);
  }
  const tracing=await fresh(1), sentinel={}, listeners=new Set<unknown>(), alias=roleCompatibilityAlias();
  await assert.rejects(alias._setupArtifacts({playwright:{_instrumentation:{addListener:(listener:unknown)=>listeners.add(listener),removeListener:(listener:unknown)=>listeners.delete(listener)}},_combinedContextOptions:{},_optionContextReuseMode:"none"},async()=>{throw sentinel;},{_tracing:tracing}),error=>error===sentinel);assert.equal(listeners.size,0);assert.equal(archiveCalls,0);
});
test("actual lifecycle caller reopens Resources after every unchanged tuple before strict eventual lane equality", async () => {
  const file=parsed(spec), loops:string[]=[];const walk=(node:ts.Node)=>{if(ts.isForOfStatement(node)&&node.getText(file).includes("await h.lifecycle(status, archived)"))loops.push(node.getText(file));ts.forEachChild(node,walk);};walk(file);assert.equal(loops.length,1);
  const expectedTuples=[["disabled",false,true],["ended",false,true],["active",false,false],["active",true,true],["active",false,false]];
  for(const mode of ["positive","pending","wrong-view","missing","extra","wrong-id","read-error","open-error","lifecycle-error","poll-error"]){
    const events:string[]=[],tuples:unknown[]=[],sentinel={};let view="Schema",expected=false,polls=0;
    const h={ids:{inactive:"owned-inactive"},lifecycle:async(status:string,archived:boolean)=>{events.push("lifecycle");tuples.push([status,archived]);view="Schema";expected=status!=="active"||archived;polls=0;if(mode==="lifecycle-error")throw sentinel;},open:async(name:string)=>{events.push("open:"+name);if(mode==="open-error")throw sentinel;view=mode==="wrong-view"?"Schema":name;},visibleIds:async()=>{events.push("ids");if(mode==="read-error")throw sentinel;if(mode==="extra")return ["owned-inactive","extra"];if(mode==="wrong-id")return ["wrong"];if(view!=="Resurser"||mode==="missing")return [];if(mode==="pending"&&polls++===0)return expected?[]:["owned-inactive"];return expected?["owned-inactive"]:[];}};
    const lane={}, expectPort=Object.assign((value:unknown)=>({toContainText:async(text:string)=>{assert.equal(value,lane);assert.equal(text,"Inga bokningar beh\u00f6ver omf\u00f6rdelas.");events.push("empty");}}),{poll:(read:()=>Promise<unknown>)=>({toEqual:async(value:unknown)=>{events.push("poll");if(mode==="poll-error")throw sentinel;let actual;for(let n=0;n<3;n++){actual=await read();try{assert.deepEqual(Array.from(actual as string[]),Array.from(value as string[]));return;}catch{}}assert.deepEqual(actual,value);}})});
    const run=evaluate("async function(){"+loops[0]+"}",{h,lane,expect:expectPort});
    if(mode==="positive"||mode==="pending"){await run();assert.deepEqual(tuples,expectedTuples.map(([status,archived])=>[status,archived]));assert.equal(events.filter(event=>event==="open:Resurser").length,5);assert.equal(events.filter(event=>event==="empty").length,2);const starts=events.flatMap((event,index)=>event==="lifecycle"?[index]:[]);for(let n=0;n<5;n++){const segment=events.slice(starts[n],starts[n+1]??events.length);assert.deepEqual(segment.slice(0,3),["lifecycle","open:Resurser","poll"]);assert.ok(segment.includes("ids"));assert.equal(segment.includes("empty"),!expectedTuples[n]![2]);}}
    else await assert.rejects(run(),error=>["read-error","open-error","lifecycle-error","poll-error"].includes(mode)?error===sentinel:true);
  }
});


// E2E008 owned empty-phone: actual proposed definitions, never browser/native credit.
function ownedPhoneDefinitions() {
  const result: string[] = [];
  for (const [fileName, name] of [[support + "booking-editor-atdd.ts", "createOwnedBookingSeedAdmission"], [support + "booking-editor-atdd.ts", "createOwnedBookingRetirement"], [support + "scheduling-views-atdd.ts", "createOwnedSchedulingSeedAdmission"], [support + "scheduling-views-atdd.ts", "createSchedulingEmptyPhoneRetirement"]]) {
    const file = parsed(fileName!), matches = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
    assert.equal(matches.length, 1, name); result.push(matches[0]!.getText(file));
  }
  return result.join("\n");
}
function ownedPhonePorts(faults: Record<string, () => Promise<unknown>> = {}, autoArm = true) {
  const api = evaluate("(()=>{" + ownedPhoneDefinitions() + ";return {createOwnedBookingSeedAdmission,createOwnedSchedulingSeedAdmission,createOwnedBookingRetirement,createSchedulingEmptyPhoneRetirement};})()", { Promise, Buffer, Set, Error });
  const events: string[] = [], retained: Buffer[] = [];
  const png = Buffer.alloc(32, 7); Buffer.from("89504e470d0a1a0a", "hex").copy(png); png.writeUInt32BE(360, 16); png.writeUInt32BE(640, 20);
  const invoke = (label: string): Promise<any> => { events.push(label); return faults[label]?.() ?? Promise.resolve(); }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const file = parsed(support + "booking-editor-atdd.ts"), factory = file.statements.find((node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node) && node.name?.text === "bindBookingEditorHarness"); assert.ok(factory?.body);
  const returned = factory.body.statements.find((node): node is ts.ReturnStatement => ts.isReturnStatement(node) && !!node.expression && ts.isObjectLiteralExpression(node.expression)); assert.ok(returned?.expression && ts.isObjectLiteralExpression(returned.expression));
  const methods = ["ownedRetirementCleanup", "dispose"].map(name => { const found = returned.expression!.getChildren(file).flatMap(node => node.getChildren(file)).filter(node => ts.isMethodDeclaration(node) && node.name.getText(file) === name); assert.equal(found.length, 1, name); return found[0]!.getText(file); }).join(",");
  let retirement: any, transport: Promise<void> | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
  const original = evaluate("(()=>{let ownedRetirementOnly,ownedRetirementSeed,finalData,hasOwnedFailure=false,ownedFailure;const transportOptIn=true,transportDone=true;const retainOwnedFailure=e=>{if(!hasOwnedFailure){hasOwnedFailure=true;ownedFailure=e;}};return {" + methods + "};})()", {
    createOwnedBookingSeedAdmission: (remove: (id: string) => Promise<void>) => { const ledger=api.createOwnedBookingSeedAdmission(remove); ledger.begin(); const ops=["inert-owned-a","inert-owned-b"].map((id,index)=>ledger.acquire(index,async()=>({data:{user:{id}}})).then(()=>ledger.link(index))); void Promise.allSettled(ops).then(()=>ledger.finish()); return ledger; }, createOwnedBookingRetirement: api.createOwnedBookingRetirement, cleanupScenario: () => invoke("booking-sql"), users: ["inert-owned-a", "inert-owned-b"], deleteAuthUser: (id: string, mode?: string) => { if (retirement) assert.equal(mode, "redacted"); return invoke(id.endsWith("a") ? "booking-auth-0" : "booking-auth-1"); },
    lifecycle: { mark() {} }, page: {}, retireTransport: () => transport ??= invoke("booking-transport"), Promise, Error,
  });
  const ports = {
    retireBookings: () => invoke("retire-bookings"), scene: async () => { await invoke("scene"); return png; },
    releaseTransport: () => invoke("release"), closeContext: () => invoke("close"), schedulingSql: () => invoke("scheduling-sql"),
    schedulingAuth: [0, 1, 2].map(index => () => invoke("scheduling-auth-" + index)),
    ordinaryBookingCleanup: () => original.dispose(), booking: (permitted: () => boolean) => { events.push("booking-handle"); retirement = original.ownedRetirementCleanup(permitted); return retirement; },
    attach: async (body: Buffer) => { events.push("attach"); if (faults["attach-before"]) await invoke("attach-before"); retained.push(body); await invoke("attach-result"); },
  };
  const controller = api.createSchedulingEmptyPhoneRetirement(ports); if (autoArm) controller.armExpiry(180000, () => 0, () => 1, () => {});
  return { controller, api, original, png, events, retained, retirement: () => retirement };
}
const ownedPhoneTurn = () => new Promise<void>(resolve => setImmediate(resolve));
function ownedPhoneDeferred() { let resolve!: () => void, reject!: (error: unknown) => void; const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
test("owned empty phone new Booking cleanup caches every private obligation and preserves default old modes", async () => {
  const f = ownedPhonePorts(), events: string[] = [], pending = ownedPhoneDeferred();
  const handle: any = f.api.createOwnedBookingRetirement(() => { events.push("sql"); return pending.promise; }, ["synthetic-a", "synthetic-b"], (id: string) => { events.push(id); handle.startRemaining(); return Promise.resolve(); }, () => true); // eslint-disable-line @typescript-eslint/no-explicit-any
  const sql = handle.startSql(); assert.equal(sql, handle.startSql()); handle.startRemaining(); handle.startRemaining();
  assert.deepEqual(events, ["sql", "synthetic-a", "synthetic-b"]); assert.throws(() => handle.requireComplete()); pending.resolve(); await handle.wait(); handle.requireComplete(); assert.equal(events.length, 3); assert.equal(JSON.stringify(handle).includes("synthetic-a"), false);
  for (const carrier of [0, false, {}]) {
    const later = ownedPhoneDeferred(), calls: string[] = [];
    const h = f.api.createOwnedBookingRetirement(() => { calls.push("sql"); return later.promise; }, ["a", "b"], (id: string) => { calls.push(id); return Promise.reject(id === "a" ? carrier : "secondary"); }, () => true);
    void h.startSql(); h.startRemaining(); await ownedPhoneTurn(); assert.deepEqual(calls, ["sql", "a", "b"]); later.reject(carrier); await assert.rejects(h.wait(), (error: unknown) => error === carrier);
  }
  for (const fault of ["sql", "a", "b"]) {
    const sentinel = {}, calls: string[] = [], h = f.api.createOwnedBookingRetirement(() => { calls.push("sql"); if (fault === "sql") throw sentinel; return Promise.resolve(); }, ["a", "b"], (id: string) => { calls.push(id); if (fault === id) throw sentinel; return Promise.resolve(); }, () => true);
    void h.startSql(); h.startRemaining(); await assert.rejects(h.wait(), (error: unknown) => error === sentinel); assert.deepEqual(calls, ["sql", "a", "b"]);
  }
  const fixed = ownedPhoneDeferred(), sqlCarrier = {}, authCarrier = false;
  const ordered = f.api.createOwnedBookingRetirement(() => fixed.promise, ["a", "b"], async () => { throw authCarrier; }, () => true);
  void ordered.startSql(); ordered.startRemaining(); await ownedPhoneTurn(); fixed.reject(sqlCarrier);
  await assert.rejects(ordered.wait(), (error: unknown) => error === sqlCarrier);
  let deletes = 0; const denied = f.api.createOwnedBookingRetirement(async () => {}, ["a", "b"], async () => { deletes++; }, () => false); void denied.startSql(); assert.throws(() => denied.startRemaining()); assert.equal(deletes, 0);
  const originalFile = source(support + "booking-editor-atdd.ts"); assert.ok(originalFile.includes('if (transportOptIn) {')); assert.ok(originalFile.includes('for (const id of users) { try { await deleteAuthUser(id); } catch (error) { retainOwnedFailure(error); } }'));
});
test("owned empty phone actual retirement positive path and phase failures keep publication truthful", async () => {
  const positive = ownedPhonePorts(); await positive.controller.complete({ present: false, passed: true }); positive.controller.parentDispose();
  assert.equal(positive.controller.status().done, true); assert.equal(positive.retained.length, 1); assert.equal(positive.retained[0], positive.png); assert.equal(positive.png[31], 7);
  const all = ["scheduling-auth-0", "scheduling-auth-1", "scheduling-auth-2", "booking-auth-0", "booking-auth-1"];
  for (const name of all) { assert.equal(positive.events.filter(event => event === name).length, 1); assert.ok(positive.events.indexOf(name) < positive.events.indexOf("attach")); }
  assert.ok(positive.events.indexOf("booking-handle") < positive.events.indexOf("booking-sql")); assert.ok(positive.events.indexOf("close") < positive.events.indexOf("booking-auth-0")); assert.ok(positive.events.indexOf("booking-sql") < positive.events.indexOf("booking-auth-0"));
  for (const fault of ["retire-bookings", "scene", "release", "close", "scheduling-sql", ...all, "booking-sql", "attach-before", "attach-result"]) {
    const f = ownedPhonePorts({ [fault]: async () => { throw false; } }); await assert.rejects(f.controller.complete({ present: false, passed: true }));
    await ownedPhoneTurn(); assert.throws(() => f.controller.parentDispose()); await ownedPhoneTurn();
    if (fault === "attach-result" || fault === "attach-before") { assert.equal(f.retained.length, fault === "attach-result" ? 1 : 0); assert.equal(f.controller.status().publishUnknown, true); }
    else assert.equal(f.retained.length, 0);
    if (!["retire-bookings", "scene"].includes(fault)) assert.equal(f.png.every(value => value === 0), true);
    for (const name of all) assert.equal(f.events.filter(event => event === name).length, fault === "close" && name.startsWith("booking-auth") ? 0 : 1, fault + ":" + name);
    assert.equal(f.events.filter(event => event === "close").length, 1);
  }
  for (const carrier of [0, false, {}]) {
    const f = ownedPhonePorts(); await assert.rejects(f.controller.complete({ present: true, error: carrier, passed: false }), (error: unknown) => error === carrier); await ownedPhoneTurn(); assert.throws(() => f.controller.parentDispose(), (error: unknown) => error === carrier); assert.equal(f.retained.length, 0);
  }
});
test("owned empty phone pending cancellation starts eligible independent cleanup and contains late publication", async () => {
  for (const held of ["retire-bookings", "scene", "release", "close", "scheduling-sql", "booking-sql", "scheduling-auth-0", "booking-auth-0", "booking-auth-1", "attach-result"]) {
    const gate = ownedPhoneDeferred(), f = ownedPhonePorts({ [held]: () => gate.promise });
    const work = f.controller.complete({ present: false, passed: true }); void work.catch(() => {}); await ownedPhoneTurn();
    assert.equal(f.retained.length, held === "attach-result" ? 1 : 0); assert.throws(() => f.controller.parentDispose());
    const status = f.controller.status(); assert.equal(status.cancelled, true); if (held !== "retire-bookings" && held !== "scene") assert.equal(f.png.every(value => value === 0), true);
    if (["scheduling-sql", "booking-sql", "booking-auth-0", "booking-auth-1"].includes(held)) for (const name of ["scheduling-auth-0", "scheduling-auth-1", "scheduling-auth-2", "booking-auth-0", "booking-auth-1"]) assert.equal(f.events.filter(event => event === name).length, 1, held + name);
    gate.resolve(); await assert.rejects(work); await ownedPhoneTurn();
    assert.equal(f.events.filter(event => event === "close").length, 1); assert.equal(f.retained.length, held === "attach-result" ? 1 : 0); if (held === "retire-bookings") { assert.equal(f.events.includes("scene"), false); assert.equal(f.png[31], 7); } else assert.equal(f.png.every(value => value === 0), true, held);
    assert.throws(() => f.controller.parentDispose()); assert.equal(f.events.filter(event => event === "attach").length, held === "attach-result" ? 1 : 0);
  }
});
test("owned empty phone exact alias and scene wiring retain Dense Role original case and no automatic recorder", async () => {
  const file = parsed(spec), aliases = file.statements.filter(node => ts.isVariableStatement(node) && node.declarationList.declarations.some(decl => decl.name.getText(file) === "ownedRetirementTest")); assert.equal(aliases.length, 1);
  const decl = (aliases[0] as ts.VariableStatement).declarationList.declarations[0]!, expression = decl.initializer as ts.CallExpression; assert.equal(expression.expression.getText(file), "roleResponseTest.extend");
  const fixture = expression.arguments[0] as ts.ObjectLiteralExpression; assert.equal(fixture.properties.length, 1); assert.equal(fixture.properties[0]!.name!.getText(file), "schedulingViews");
  let cases = 0; const walk = (node: ts.Node) => { if (ts.isCallExpression(node) && node.expression.getText(file) === "ownedRetirementTest") { cases++; assert.ok(node.arguments[0]!.getText(file).includes("15.1-E2E-008")); } ts.forEachChild(node, walk); }; walk(file); assert.equal(cases, 1);
  const events: string[] = [], sentinel = {}, controller = { complete: async (state: { present: boolean; error: unknown; passed: boolean }) => { events.push("complete"); assert.equal(state.present, true); assert.equal(state.error, sentinel); throw state.error; } };
  const run = evaluate((fixture.properties[0] as ts.PropertyAssignment).initializer.getText(file), {});
  await assert.rejects(run({ schedulingViews: { prepareOwnedEmptyPhone: () => { events.push("prepare"); return controller; } } }, async () => { events.push("body"); throw sentinel; }, { status: "failed", errors: [{}], attach: async () => { events.push("attach"); } }), (error: unknown) => error === sentinel); assert.deepEqual(events, ["prepare", "body", "complete"]);
  const supportSource = source(support + "scheduling-views-atdd.ts");
  assert.ok(supportSource.includes('select count(*)::text as count from public.bookings where tenant_id=$1')); assert.ok(supportSource.includes('await status.selectOption("all")')); assert.ok(supportSource.includes('bounds.x + bounds.width > 360')); assert.ok(supportSource.includes('id => deleteAuthUser(id, "redacted")')); assert.ok(supportSource.includes('await this.ownedEmptySeed!.auth(index)'));
});


function ownedExpiryFakeClock(start = 1_000) {
  let now = start, serial = 0;
  const active = new Map<object, { at: number; callback: () => void; kind: string }>(), records: { handle: object; kind: string; delay: number; clears: number }[] = [];
  const set = (kind: string, callback: () => void, delay: number) => { const handle = { id: ++serial }; active.set(handle, { at: now + delay, callback, kind }); records.push({ handle, kind, delay, clears: 0 }); return handle; };
  const clear = (handle: object) => { active.delete(handle); const record = records.find(row => row.handle === handle); if (record) record.clears++; };
  return { now: () => now, set, clear, records, active, advance: async (to: number) => {
    assert.ok(to >= now);
    for (;;) { const due = [...active].filter(([, value]) => value.at <= to).sort((a, b) => a[1].at - b[1].at)[0]; if (!due) break; now = due[1].at; active.delete(due[0]); due[1].callback(); await ownedPhoneTurn(); }
    now = to; await ownedPhoneTurn();
  } };
}
async function ownedExpiryPinnedPorts(clock: ReturnType<typeof ownedExpiryFakeClock>) {
  const { createRequire } = await import("node:module"), requireRoot = createRequire(process.cwd() + "/package.json"), requireTest = createRequire(requireRoot.resolve("@playwright/test/package.json")), requirePinned = createRequire(requireTest.resolve("playwright/package.json")), iso = requirePinned("playwright-core/lib/coreBundle").iso;
  const TimeoutManager = evaluate(roleCompatibilityWorkerClass("TimeoutManager"), { ManualPromise2: iso.ManualPromise, monotonicTime: clock.now, kMaxDeadline: 2147483647, setTimeout: (fn: () => void, delay: number) => clock.set("framework", fn, delay), clearTimeout: clock.clear, debugTest: { enabled: false }, colors: { red: (value: string) => value }, TimeoutManagerError: class extends Error {} });
  const Fixture = evaluate(roleCompatibilityWorkerClass("Fixture"), {});
  const file = parsed(spec), found = file.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === "ownedExpiryBody"); assert.equal(found.length, 1);
  const wrap = evaluate(found[0]!.getText(file), { playwrightPackage: { version: "1.61.1" }, createRequire: () => Object.assign(() => ({ iso: { monotonicTime: clock.now } }), { resolve: () => "inert-pinned-package" }), path: { join: (...parts: string[]) => parts.join("/") }, process: { cwd: () => "inert" }, setTimeout: (fn: () => void, delay: number) => clock.set("expiry", fn, delay), clearTimeout: clock.clear, Error, Number, Math });
  return { TimeoutManager, Fixture, wrap };
}
test("owned empty phone primary finite expiry survives pinned skipped teardown without manual parent fallback", async () => {
  const clock = ownedExpiryFakeClock(), pinned = await ownedExpiryPinnedPorts(clock), manager = new pinned.TimeoutManager(180_000);
  manager.defaultSlot().elapsed = 20_000;
  const gate = ownedPhoneDeferred(), f = ownedPhonePorts({ "booking-sql": () => gate.promise }, false);
  const h = { armOwnedEmptyPhoneExpiry: (...args: unknown[]) => f.controller.armExpiry(...args), failOwnedEmptyPhone: (error: unknown) => f.controller.failOriginal(error), finishOwnedEmptyPhoneFunctional: () => f.controller.markOriginalComplete() };
  const info = { _timeoutManager: manager }, events: string[] = [];
  const body = pinned.wrap(async () => { events.push("original-body"); });
  await manager.withRunnable({ type: "test" }, () => body({ schedulingViews: h }, info));
  assert.deepEqual(events, ["original-body"]);
  const timer = clock.records.filter(row => row.kind === "expiry"); assert.equal(timer.length, 1); assert.equal(timer[0]!.delay, 160_000);
  const work = f.controller.complete({ present: false, passed: true }); void work.catch(() => {}); await ownedPhoneTurn();
  await clock.advance(160_999); assert.equal(f.controller.status().cancelled, false); assert.equal(f.png[31], 7); assert.equal(f.events.includes("booking-auth-0"), false);
  await clock.advance(161_000); assert.equal(f.controller.status().cancelled, true); assert.equal(f.png.every(value => value === 0), true); assert.equal(f.retained.length, 0); assert.equal(timer[0]!.clears, 1);
  for (const name of ["scheduling-auth-0", "scheduling-auth-1", "scheduling-auth-2", "booking-auth-0", "booking-auth-1"]) assert.equal(f.events.filter(event => event === name).length, 1, name);
  let callbacks = 0;
  for (const name of ["schedulingViews-parent", "bookingEditor-parent"]) {
    const parent = Object.create(pinned.Fixture.prototype); parent._teardownDescription = { title: name }; parent._deps = new Set(); parent._usages = new Set(); parent.registration = { id: name, fn: async () => {} }; parent.runner = { instanceForId: new Map([[name, parent]]) }; parent._selfTeardownComplete = Promise.resolve(); parent._useFuncFinished = { resolve: () => { callbacks++; } };
    await parent.teardown({ _timeoutManager: manager, _runWithTimeout: async (_r: unknown, run: () => Promise<void>) => run() }, { type: "test", slot: { timeout: 180_000, elapsed: 180_000 } });
  }
  assert.equal(callbacks, 0); assert.equal(f.retained.length, 0); gate.resolve(); await assert.rejects(work); await ownedPhoneTurn(); assert.equal(timer[0]!.clears, 1); assert.equal(f.retained.length, 0);
});

test("owned empty phone expiry preserves exact functional window and records prebody limitations", async () => {
  const { createRequire } = await import("node:module");
  const common = createRequire(process.cwd() + "/package.json")(process.cwd() + "/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/lib/common/index.js");
  const loc = { file: "inert-expiry.ts", line: 1, column: 1 }, errors: unknown[] = [];
  const clock0 = ownedExpiryFakeClock(), pp = await ownedExpiryPinnedPorts(clock0);
  const pool = new common.fixtures.FixturePool([{ fixtures: { schedulingViews: async ({}, provide: (v: unknown) => Promise<void>) => provide({}) }, location: loc }], (e: unknown) => errors.push(e), undefined, false);
  const wrapped = pp.wrap(async () => {}); pool.validateFunction(wrapped, "Test", loc); assert.equal(errors.length, 0); assert.equal(JSON.stringify(common.fixtures.fixtureParameterNames(wrapped, loc, (e: unknown) => errors.push(e))), JSON.stringify(["schedulingViews"]));
  for (const carrier of [0, false, {}]) {
    const clock = ownedExpiryFakeClock(), pinned = await ownedExpiryPinnedPorts(clock), manager = new pinned.TimeoutManager(180_000), f = ownedPhonePorts({}, false);
    const h = { armOwnedEmptyPhoneExpiry: (...a: unknown[]) => f.controller.armExpiry(...a), failOwnedEmptyPhone: (e: unknown) => f.controller.failOriginal(e), finishOwnedEmptyPhoneFunctional: () => f.controller.markOriginalComplete() };
    await assert.rejects(manager.withRunnable({ type: "test" }, () => pinned.wrap(async () => { throw carrier; })({ schedulingViews: h }, { _timeoutManager: manager })), (e: unknown) => e === carrier);
    await assert.rejects(f.controller.complete({ present: false, passed: true }), (e: unknown) => e === carrier); await ownedPhoneTurn();
    assert.equal(f.events.includes("scene"), false); assert.equal(f.retained.length, 0); assert.equal(clock.records.filter(r => r.kind === "expiry")[0]!.clears, 1);
  }
  for (const carrier of [0, false, {}]) {
    const clock = ownedExpiryFakeClock(), pinned = await ownedExpiryPinnedPorts(clock), manager = new pinned.TimeoutManager(180_000), original = ownedPhoneDeferred(), f = ownedPhonePorts({}, false); manager.defaultSlot().elapsed = 20_000;
    const h = { armOwnedEmptyPhoneExpiry: (...a: unknown[]) => f.controller.armExpiry(...a), failOwnedEmptyPhone: (e: unknown) => f.controller.failOriginal(e), finishOwnedEmptyPhoneFunctional: () => f.controller.markOriginalComplete() };
    const running = manager.withRunnable({ type: "test" }, () => pinned.wrap(async () => original.promise)({ schedulingViews: h }, { _timeoutManager: manager })); void running.catch(() => {});
    await clock.advance(160_999); assert.equal(f.events.includes("close"), false);
    await clock.advance(161_000); assert.equal(f.controller.status().cancelled, true); original.reject(carrier);
    await assert.rejects(running, (e: unknown) => e === carrier); await assert.rejects(f.controller.complete({ present: true, error: carrier, passed: false }), (e: unknown) => e === carrier); assert.equal(f.retained.length, 0); assert.equal(clock.records.filter(r => r.kind === "expiry")[0]!.clears, 1);
  }
  // A real successful body result is returned unchanged; its expiry remains at the original D through afterEach.
  {
    const clock = ownedExpiryFakeClock(), pinned = await ownedExpiryPinnedPorts(clock), manager = new pinned.TimeoutManager(180_000); manager.defaultSlot().elapsed = 20_000;
    const sql = ownedPhoneDeferred(), after = ownedPhoneDeferred(), f = ownedPhonePorts({ "booking-sql": () => sql.promise }, false), value = {};
    const h = { armOwnedEmptyPhoneExpiry: (...a: unknown[]) => f.controller.armExpiry(...a), failOwnedEmptyPhone: (e: unknown) => f.controller.failOriginal(e), finishOwnedEmptyPhoneFunctional: () => f.controller.markOriginalComplete() };
    assert.equal(await manager.withRunnable({ type: "test" }, () => pinned.wrap(async () => { await clock.advance(11_000); return value; })({ schedulingViews: h }, { _timeoutManager: manager })), value);
    assert.equal(manager.defaultSlot().elapsed, 30_000);
    const work = f.controller.complete({ present: false, passed: true }); void work.catch(() => {}); await ownedPhoneTurn();
    const shared = { timeout: 180_000, elapsed: 0 }, afterWork = manager.withRunnable({ type: "afterEach", slot: shared }, () => after.promise); void afterWork.catch(() => {});
    await clock.advance(160_999); assert.equal(f.controller.status().cancelled, false);
    await clock.advance(161_000); assert.equal(f.controller.status().cancelled, true); assert.equal(f.png.every(v => v === 0), true);
    for (const n of ["scheduling-auth-0", "scheduling-auth-1", "scheduling-auth-2", "booking-auth-0", "booking-auth-1"]) assert.equal(f.events.filter(e => e === n).length, 1);
    // Advance the same clock through the pinned shared-slot timeout, rather than inventing an exhausted elapsed value at time zero.
    await clock.advance(191_001); await assert.rejects(afterWork); assert.ok(shared.elapsed >= 180_000);
    let teardownCallbacks = 0;
    for (const name of ["sched", "booking"]) { const fixture = Object.create(pinned.Fixture.prototype); Object.assign(fixture, { _teardownDescription: { title: name }, _deps: new Set(), _usages: new Set(), registration: { id: name, fn: async () => {} }, runner: { instanceForId: new Map() }, _selfTeardownComplete: Promise.resolve(), _useFuncFinished: { resolve: () => { teardownCallbacks++; } } }); await fixture.teardown({ _timeoutManager: manager, _runWithTimeout: async (_r: unknown, run: () => Promise<void>) => run() }, { type: "test", slot: shared }); }
    assert.equal(teardownCallbacks, 0); assert.equal(f.retained.length, 0); sql.resolve(); after.resolve(); await assert.rejects(work); assert.equal(clock.records.filter(r => r.kind === "expiry")[0]!.clears, 1);
  }
  // Setup can already own identities. No body entry means no new expiry/PNG/mode, NOT absence of existing obligations.
  {
    const clock = ownedExpiryFakeClock(), pinned = await ownedExpiryPinnedPorts(clock), manager = new pinned.TimeoutManager(180_000), knownExistingObligations = [0, 0, 0, 0, 0]; let callbacks = 0;
    const fixture = Object.create(pinned.Fixture.prototype); Object.assign(fixture, { _teardownDescription: { title: "owned-setup", slot: { timeout: 100, elapsed: 100 } }, _deps: new Set(), _usages: new Set(), registration: { id: "owned-setup", fn: async () => {} }, runner: { instanceForId: new Map() }, _selfTeardownComplete: Promise.resolve(), _useFuncFinished: { resolve: () => { callbacks++; knownExistingObligations.fill(1); } } });
    // The pinned guard chooses the fixture slot, so parent cleanup remains unverified here.
    await fixture.teardown({ _timeoutManager: manager, _runWithTimeout: async (_r: unknown, run: () => Promise<void>) => run() }, { type: "test", slot: { timeout: 180_000, elapsed: 0 } });
    assert.equal(callbacks, 0); assert.deepEqual(knownExistingObligations, [0, 0, 0, 0, 0]); assert.equal(clock.records.length, 0);
  }
  for (const held of ["retire-bookings", "scene", "release", "close", "scheduling-sql", "booking-sql", "scheduling-auth-0", "booking-auth-0", "attach-result"]) {
    const clock = ownedExpiryFakeClock(0), gate = ownedPhoneDeferred(), f = ownedPhonePorts({ [held]: () => gate.promise }, false);
    f.controller.armExpiry(100, clock.now, (fn: () => void, delay: number) => clock.set("expiry", fn, delay), clock.clear);
    const work = f.controller.complete({ present: false, passed: true }); void work.catch(() => {}); await ownedPhoneTurn();
    await clock.advance(99); assert.equal(f.controller.status().cancelled, false);
    await clock.advance(100); assert.equal(f.controller.status().cancelled, true); assert.equal(clock.records[0]!.clears, 1);
    for (const n of ["scheduling-auth-0", "scheduling-auth-1", "scheduling-auth-2"]) assert.equal(f.events.filter(e => e === n).length, 1);
    if (held === "close") assert.equal(f.events.includes("booking-auth-0"), false); // close remains unconfirmed, not eligible
    if (!["retire-bookings", "scene"].includes(held)) assert.equal(f.png.every(v => v === 0), true);
    const attached = held === "attach-result" ? 1 : 0; assert.equal(f.retained.length, attached); if (attached) assert.equal(f.controller.status().publishUnknown, true);
    gate.resolve(); await assert.rejects(work); await ownedPhoneTurn(); assert.equal(f.png.every(v => v === 0), held !== "retire-bookings"); assert.equal(f.retained.length, attached);
  }
  {
    const clock = ownedExpiryFakeClock(0), f = ownedPhonePorts({}, false); f.controller.armExpiry(100, clock.now, (fn: () => void, delay: number) => clock.set("expiry", fn, delay), clock.clear); await f.controller.complete({ present: false, passed: true });
    assert.equal(clock.records[0]!.clears, 1); await clock.advance(100); assert.equal(f.png[31], 7); assert.equal(f.retained[0], f.png); assert.equal(f.controller.status().done, true); assert.equal(clock.active.size, 0);
  }
  for (const kind of ["sync-fire", "undefined-handle", "schedule-throw", "early-fire", "clock-throw"]) {
    const f = ownedPhonePorts({}, false); let fire: (() => void) | undefined, clears = 0; const now = 0;
    const clock = () => { if (kind === "clock-throw" && fire) throw false; return now; };
    const schedule = (cb: () => void) => { fire = cb; if (kind === "sync-fire") cb(); if (kind === "schedule-throw") throw 0; return kind === "undefined-handle" ? undefined : 1; };
    if (["sync-fire", "undefined-handle", "schedule-throw"].includes(kind)) assert.throws(() => f.controller.armExpiry(100, clock, schedule, () => { clears++; }));
    else { f.controller.armExpiry(100, clock, schedule, () => { clears++; }); fire!(); assert.throws(() => f.controller.markOriginalComplete()); }
    assert.equal(f.events.includes("scene"), false); assert.equal(f.retained.length, 0); assert.equal(f.events.includes("close"), kind === "early-fire" || kind === "clock-throw"); assert.ok(clears <= 1);
  }
});


test("owned empty phone actual seed adopts late owned identities across expiry and parent teardown", async () => {
  function method(fileName: string, name: string) {
    const f=parsed(fileName); const found: ts.MethodDeclaration[]=[];
    const walk=(n: ts.Node) => { if(ts.isMethodDeclaration(n)&&n.name.getText(f)===name) found.push(n); ts.forEachChild(n,walk); }; walk(f); assert.equal(found.length,1,name); return found[0]!.getText(f);
  }
  function declaration(fileName: string, name: string) {
    const f=parsed(fileName);let found: string|undefined;const walk=(n: ts.Node)=>{if(ts.isVariableDeclaration(n)&&n.name.getText(f)===name) found=n.initializer!.getText(f);ts.forEachChild(n,walk);};walk(f);assert.ok(found,name);return found;
  }
  const defs=ownedPhoneDefinitions(), api=evaluate("(()=>{"+defs+";return {createOwnedBookingSeedAdmission,createOwnedSchedulingSeedAdmission,createOwnedBookingRetirement,createSchedulingEmptyPhoneRetirement};})()",{Promise,Buffer,Set,Map,Error});
  async function fixture(heldOwner: string, heldKind: string, newMode=true, carrier?: unknown) {
    const events: string[]=[], removals: string[]=[], gate=ownedPhoneDeferred();let sequence=0, held=false, closed=false;
    let capturedPorts: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const query=(owner: string) => async (sql: string) => { const label=sql.startsWith("insert into public.tenant_memberships")?"member":sql.startsWith("delete")?"delete":sql.startsWith("select")?"read":"other"; events.push(owner+":sql:"+label); if(!held&&owner===heldOwner&&heldKind==="sql"&&label==="member"){held=true;await gate.promise;events.push(owner+":sql-settled");} return sql.startsWith("select")?[{id:"owned-actor"}]:[]; };
    const remove=(owner: string) => async (id: string) => { events.push(owner+":auth-delete");removals.push(id); };
    const create=(owner: string) => async () => {events.push(owner+":create"); if(!held&&owner===heldOwner&&heldKind==="create"){held=true;await gate.promise;if(carrier!==undefined)throw carrier;} return {data:{user:{id:owner+"-owned-"+(++sequence),email:"inert@example.test"}},error:null};};
    const clock=ownedExpiryFakeClock(), pinned=await ownedExpiryPinnedPorts(clock), manager=new pinned.TimeoutManager(180_000);
    const bookingFile=support+"booking-editor-atdd.ts",schedulingFile=support+"scheduling-views-atdd.ts";
    const book=evaluate("(()=>{let ownedRetirementOnly,ownedRetirementSeed,finalData,scenario,hasOwnedFailure=false,ownedFailure;const retainOwnedFailure=e=>{if(!hasOwnedFailure){hasOwnedFailure=true;ownedFailure=e;}};const labels=[],users=[],memberships=[],profiles=[],owned={},tenantId='inert-tenant',token='inert-token',fixture={adminA:{id:'actor',email:'inert@example.test',password:'inert'},tenantB:{id:'other'}};const transportOptIn=true,transportDone=true,retireTransport=async()=>{};const cleanupScenario="+declaration(bookingFile,"cleanupScenario")+";return {"+["seed","ownedRetirementCleanup","dispose"].map(n=>method(bookingFile,n)).join(",")+"};})()",{...api,adminQuery:query("booking"),adminSession:async(run: (p: unknown)=>Promise<void>)=>run({query:query("booking-cleanup")}),admin:()=>({auth:{admin:{createUser:create("booking")}}}),deleteAuthUser:remove("booking"),randomUUID:()=>"owned-key-"+(++sequence),adminInsertCustomer:async()=>"customer",adminInsertFacility:async()=>"facility",adminInsertContact:async()=>"contact",formatBookingTime:()=>"inert",lifecycle:{mark(){}},page:{},Promise,Map,Set,Error});
    book.retireTransport=async()=>{events.push("transport-release");};
    const context={pages:()=>closed?[]:[page],close:async()=>{events.push("context-close");closed=true;}};
    const page={context:()=>context,isClosed:()=>closed,unroute:async()=>{events.push("unroute");},route:async()=>{events.push("page-route");}};
    const h=evaluate("({"+["seed","insert","cleanupRows","prepareOwnedEmptyPhone","armOwnedEmptyPhoneExpiry","failOwnedEmptyPhone","finishOwnedEmptyPhoneFunctional","dispose"].map(n=>method(schedulingFile,n)).join(",")+"})",{...api,createSchedulingEmptyPhoneRetirement:(ports:unknown)=>{capturedPorts=ports;return api.createSchedulingEmptyPhoneRetirement(ports);},adminQuery:query("scheduling"),adminSession:async(run:(p:unknown)=>Promise<void>)=>run({query:query("scheduling-cleanup")}),admin:()=>({auth:{admin:{createUser:create("scheduling")}}}),deleteAuthUser:remove("scheduling"),randomUUID:()=>"owned-key-"+(++sequence),lifecycle:{mark(){}},interval:()=>({startsAt:"inert-start",endsAt:"inert-end"}),DATE:"2026-10-12",Promise,Map,Set,Error});
    Object.assign(h,{page,bookingEditor:book,users:[],people:[],memberships:[],extraProfiles:[],ids:{role:"r",noRole:"n",inactive:"i",proposal:"p",collision:"c",zero:"z",hidden:"h"},requireEditorPage(){},signIn:async()=>{events.push("sign-in");}});
    let retirement: any, run: Promise<void>; // eslint-disable-line @typescript-eslint/no-explicit-any
    if(newMode){retirement=h.prepareOwnedEmptyPhone(async()=>{events.push("ATTACH");});run=manager.withRunnable({type:"test"},()=>pinned.wrap(async()=>h.seed())({schedulingViews:h},{_timeoutManager:manager}));}
    else run=h.seed();
    void run.catch(()=>{});await ownedPhoneTurn();return {h,book,retirement,clock,pinned,manager,events,removals,gate,run,held:()=>held,ports:()=>capturedPorts};
  }
  for(const owner of ["scheduling","booking"]) for(const afterParent of [false,true]) {
    const f=await fixture(owner,"create");assert.equal(f.held(),true);await f.clock.advance(181_000);assert.equal(f.retirement.status().cancelled,true);assert.equal(f.events.includes("ATTACH"),false);
    if(afterParent){let resolve!:()=>void,reject!:(e:unknown)=>void;const finish=new Promise<void>((y,n)=>{resolve=y;reject=n;});void finish.catch(()=>{});const parent=Object.create(f.pinned.Fixture.prototype);Object.assign(parent,{_teardownDescription:{title:"scheduling-parent"},_deps:new Set(),_usages:new Set(),registration:{id:"parent",fn:async()=>{}},runner:{instanceForId:new Map()},_selfTeardownComplete:finish,_useFuncFinished:{resolve:()=>{Promise.resolve().then(()=>f.h.dispose()).then(resolve,reject);}}});await assert.rejects(parent.teardown({_timeoutManager:f.manager,_runWithTimeout:async(_r:unknown,op:()=>Promise<void>)=>op()},{type:"test",slot:{timeout:180_000,elapsed:0}}));}
    const checkpoint=f.events.length;f.gate.resolve();await assert.rejects(f.run);await ownedPhoneTurn();
    const later=f.events.slice(checkpoint);assert.equal(later.some(e=>e.endsWith(":create")||e.endsWith(":sql:member")||e==="page-route"||e==="sign-in"),false);assert.equal(f.removals.filter(id=>id.startsWith(owner+"-owned-")).length,1);assert.equal(new Set(f.removals).size,f.removals.length);assert.equal(f.events.includes("ATTACH"),false);
    const count=f.removals.length;for(let i=0;i<2;i++){await assert.rejects(Promise.resolve().then(()=>f.h.dispose()));let rejected=false;try {await f.book.dispose();} catch {rejected=true;} assert.equal(rejected,f.book.ownedRetirementCleanup(()=>true).status().some((state:string)=>state!=="fulfilled"));}await ownedPhoneTurn();assert.equal(f.removals.length,count);
  }
  for(const owner of ["scheduling","booking"]) {
    const f=await fixture(owner,"sql");assert.equal(f.held(),true);await f.clock.advance(181_000);assert.equal(f.events.some(e=>e===owner+"-cleanup:sql:delete"),false);const at=f.events.length;f.gate.resolve();await assert.rejects(f.run);await ownedPhoneTurn();assert.equal(f.events.slice(at).some(e=>e.endsWith(":create")||e.endsWith(":sql:member")),false);assert.ok(f.events.indexOf(owner+":sql-settled")<f.events.findIndex(e=>e===owner+"-cleanup:sql:delete"));assert.equal(new Set(f.removals).size,f.removals.length);assert.equal(f.events.includes("ATTACH"),false);
  }
  // A rejection returns no confirmed new identity. Preserve the falsy functional carrier, never fabricate a delete.
  for(const carrier of [0,false]) {
    const f=await fixture("scheduling","create",true,carrier);await f.clock.advance(181_000);f.gate.resolve();await assert.rejects(f.run,(e:unknown)=>e===carrier);await assert.rejects(Promise.resolve().then(()=>f.h.dispose()),(e:unknown)=>e===carrier);assert.equal(f.removals.some(id=>id.startsWith("scheduling-owned-")),false);assert.equal(f.events.includes("ATTACH"),false);
  }
  const positive=await fixture("none","none",true);await positive.run;const image=Buffer.alloc(32,9);Buffer.from("89504e470d0a1a0a","hex").copy(image);image.writeUInt32BE(360,16);image.writeUInt32BE(640,20);positive.ports().scene=async()=>image;await positive.retirement.complete({present:false,passed:true});assert.equal(positive.removals.length,5);assert.equal(new Set(positive.removals).size,5);assert.equal(positive.events.filter(e=>e==="ATTACH").length,1);assert.ok(positive.events.indexOf("context-close")<positive.events.indexOf("ATTACH"));assert.equal(image[31],9);assert.equal(positive.clock.records.filter(r=>r.kind==="expiry")[0]!.clears,1);
  const normal=await fixture("none","none",false);await normal.run;assert.equal(normal.events.filter(e=>e==="booking:create").length,2);assert.equal(normal.events.filter(e=>e==="scheduling:create").length,3);assert.ok(normal.events.includes("page-route")&&normal.events.includes("sign-in"));assert.equal(normal.events.includes("context-close"),false);
});


test("owned empty phone seed ledger distinguishes pending unknown refused and actual once-only deletion", async()=>{
 const api=evaluate("(()=>{"+ownedPhoneDefinitions()+";return {createOwnedBookingSeedAdmission,createOwnedSchedulingSeedAdmission};})()",{Promise,Buffer,Set,Map,Error});
 for(const name of ["createOwnedBookingSeedAdmission","createOwnedSchedulingSeedAdmission"]) {
  const calls: string[]=[], late=ownedPhoneDeferred(), ledger=api[name](async(id:string)=>{calls.push(id);});ledger.begin();
  const acquisition=ledger.acquire(0,async()=>{await late.promise;return {data:{user:{id:"inert-confirmed-owned"}}};});void acquisition.catch(()=>{});const deletion=ledger.auth(0);assert.equal(deletion,ledger.auth(0));ledger.close();assert.equal(calls.length,0);assert.equal(ledger.status()[0],"creating");
  assert.throws(()=>ledger.guard());await assert.rejects(ledger.acquire(1,async()=>{throw Error("must not invoke another creation");}));late.resolve();await assert.rejects(acquisition);ledger.finish();await deletion;assert.deepEqual(calls,["inert-confirmed-owned"]);await ledger.auth(0);ledger.close();assert.equal(calls.length,1);assert.equal(ledger.status()[1],"not-created-refused");await assert.rejects(ledger.auth(1));
  const failed=api[name](async()=>{throw Error("no known identity should reach remove");});failed.begin();const sentinel={};await assert.rejects(failed.acquire(0,async()=>{throw sentinel;}),(e:unknown)=>e===sentinel);failed.finish();assert.equal(failed.status()[0],"unknown-rejected");await assert.rejects(failed.auth(0));
  const missing=api[name](async()=>{throw Error("no returned identity should reach remove");});missing.begin();await missing.acquire(0,async()=>({data:{user:null}}));missing.finish();assert.equal(missing.status()[0],"unavailable");await assert.rejects(missing.auth(0));
  let attempts=0;const authCarrier=false, strict=api[name](async()=>{attempts++;throw authCarrier;});strict.begin();await strict.acquire(0,async()=>({data:{user:{id:"inert-owned-rejected-delete"}}}));strict.finish();const work=strict.auth(0);await assert.rejects(work,(e:unknown)=>e===authCarrier);assert.equal(work,strict.auth(0));await assert.rejects(strict.auth(0),(e:unknown)=>e===authCarrier);assert.equal(attempts,1);
 }
});
