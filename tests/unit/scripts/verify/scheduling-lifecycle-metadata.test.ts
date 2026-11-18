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
    const context=vm.createContext({URL,Buffer:options.oversize?{byteLength:()=>1025}:Buffer,WeakMap:ObserverMap,performance:{now:()=>1},page:{url:()=>"http://localhost/scheduling",on:(n:string,f:unknown)=>handlers.set(n,f),off:(n:string)=>handlers.delete(n)},
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
