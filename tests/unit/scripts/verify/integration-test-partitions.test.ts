import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createVitest } from "vitest/node";
import integrationConfig, { supportedCalendarIntegrationProjects } from "../../../../vitest.config";
import ts from "typescript";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const ddlFile = "tests/integration/jobs/job-runs.int.test.ts";
const ddlFiles = ["tests/integration/calendar-feed/public-feed.int.test.ts", "tests/integration/commands/calendar-feed.int.test.ts", "tests/integration/commands/conflict-resolver.int.test.ts", "tests/integration/commands/time-reports.int.test.ts", ddlFile, "tests/integration/notifications/time-report-nudge-producer.int.test.ts"];
const configPath = join(root, "vitest.config.ts");
const slash = (value: string) => value.replaceAll("\\", "/");

function integrationFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? integrationFiles(path)
      : /\.(test|spec)\.ts$/.test(entry.name) ? [slash(relative(root, path))] : [];
  }).sort();
}

function assertExactPartition(files: string[], expected: string[]): void {
  assert.equal(new Set(files).size, files.length, "a test file must not execute in both projects");
  assert.deepEqual([...files].sort(), expected, "every integration file must execute exactly once");
}

function assertOrdered(parallel: number, ddl: number): void {
  assert.ok(ddl > parallel, "global audit DDL must follow completion of the parallel group");
}

test("installed Vitest collects every integration file once and preserves required execution settings", async () => {
  // Collection does not execute globalSetup or reach a database. Inspect the actual
  // resolved runner config rather than reimplementing Vitest's glob/inheritance rules.
  const runner = await createVitest("test", { root, config: configPath, watch: false });
  try {
    const specs = await runner.globTestSpecifications();
    const files = specs.map((spec) => slash(relative(root, spec.moduleId)));
    assertExactPartition(files, integrationFiles(join(root, "tests/integration")));
    assert.equal(runner.projects.length, 2);
    const parallel = runner.projects.find((project) => project.name === "integration-parallel");
    const ddl = runner.projects.find((project) => project.name === "integration-audit-ddl");
    assert.ok(parallel && ddl);
    assert.equal((parallel.config as typeof parallel.config & { fileParallelism: boolean }).fileParallelism, true);
    assert.equal((ddl.config as typeof ddl.config & { fileParallelism: boolean }).fileParallelism, false);
    assertOrdered(parallel.config.sequence.groupOrder, ddl.config.sequence.groupOrder);
    assert.equal(supportedCalendarIntegrationProjects(runner.projects),true);
    assert.equal(ddl.config.bail,1);assert.equal(ddl.config.isolate,true);assert.equal(ddl.config.maxWorkers,1);
    // Discovery order varies by platform; execution order is checked below.
    assertExactPartition(specs.filter((spec) => spec.project === ddl).map((spec) => slash(relative(root, spec.moduleId))), [...ddlFiles].sort());
    assert.ok(specs.filter((spec) => spec.project === parallel).every((spec) => !ddlFiles.includes(slash(relative(root, spec.moduleId)))));
    const setup = runner.config.globalSetup;
    assert.ok((Array.isArray(setup) ? setup : [setup]).some((path) => slash(path).endsWith("tests/support/global-setup.ts")));
    for (const project of runner.projects) {
      assert.equal(project.config.testTimeout, 30_000);
      assert.equal(project.config.hookTimeout, 30_000);
      assert.equal(project.config.retry ?? 0, 0);
      assert.equal(project.config.dangerouslyIgnoreUnhandledErrors, false);
      assert.equal(project.vite.config.resolve.tsconfigPaths, true);
    }
  } finally {
    await runner.close();
  }
});

test("coverage and ordering checks reject duplicate, missing, overlapping, or reversed batches", () => {
  const expected = ["tests/integration/example.int.test.ts", ddlFile].sort();
  assertExactPartition(expected, expected);
  // Exact serial membership tolerates discovery permutations, never lost/extra files.
  const serialExpected = [...ddlFiles].sort();
  assertExactPartition([...ddlFiles].reverse(), serialExpected);
  assertExactPartition([ddlFiles[0], ddlFiles[4], ...ddlFiles.slice(1, 4), ddlFiles[5]], serialExpected);
  assert.throws(() => assertExactPartition(ddlFiles.slice(1), serialExpected), /exactly once/);
  assert.throws(() => assertExactPartition([...ddlFiles, ddlFiles[0]], serialExpected), /both projects/);
  assertOrdered(0, 1);
  assert.throws(() => assertExactPartition([...expected, ddlFile], expected), /both projects/);
  assert.throws(() => assertExactPartition([ddlFile], expected), /exactly once/);
  assert.throws(() => assertOrdered(0, 0), /follow completion/);
  assert.throws(() => assertOrdered(1, 0), /follow completion/);
});

test("installed Vitest finishes parallel teardown first and exposes reversed-group interference", () => {
  const temporary = mkdtempSync(join(tmpdir(), "elpro-integration-order-"));
  try {
    const eventsPath = join(temporary, "events.log");
    const eventsLiteral = JSON.stringify(slash(eventsPath));
    const moduleName = JSON.stringify(slash(join(root, "node_modules/vitest/dist/index.js")));
    for (const [name, delay] of [["parallel-a", 80], ["parallel-b", 20], ["audit-ddl", 0]] as const) {
      writeFileSync(join(temporary, name + ".test.js"), `import { test, afterAll } from ${moduleName};
import { appendFileSync, readFileSync } from "node:fs";
test(${JSON.stringify(name)}, async () => {
  appendFileSync(${eventsLiteral}, ${JSON.stringify(name + ":start\n")});
  if (${JSON.stringify(name)} === "audit-ddl") {
    const events = readFileSync(${eventsLiteral}, "utf8");
    for (const peer of ["parallel-a", "parallel-b"]) {
      if (!events.includes(peer + ":teardown:end")) throw new Error("overlapping audit DDL: " + peer);
    }
  }
  await new Promise(resolve => setTimeout(resolve, ${delay}));
  appendFileSync(${eventsLiteral}, ${JSON.stringify(name + ":end\n")});
});
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 40));
  appendFileSync(${eventsLiteral}, ${JSON.stringify(name + ":teardown:end\n")});
});`);
    }
    // Use the production partition's scheduling settings; replace only discovery
    // with synthetic files and omit its database setup in this scheduler-only probe.
    const projects = integrationConfig.test!.projects!.map((project) => {
      assert.equal(typeof project, "object");
      const entry = project as { test: { name: string; fileParallelism?: boolean; sequence: { groupOrder: number } } };
      return { test: { ...entry.test, maxWorkers: entry.test.fileParallelism === false ? 1 : 2,
        include: [entry.test.name === "integration-audit-ddl" ? "audit-ddl.test.js" : "parallel-*.test.js"] } };
    });
    // The runner loader keeps an OS-temp config from creating a bundle cache
    // above that directory (for example C:/node_modules/.vite-temp on Windows).
    const smokeConfig = join(temporary, "vitest.config.mjs");
    writeFileSync(smokeConfig, `export default ${JSON.stringify({ root: slash(temporary), test: { projects } })};`);
    execFileSync(process.execPath, [join(root, "node_modules/vitest/vitest.mjs"), "run", "--config", smokeConfig, "--configLoader", "runner"],
      { cwd: root, timeout: 30_000, encoding: "utf8", windowsHide: true, stdio: "pipe" });
    const events = readFileSync(eventsPath, "utf8").trim().split("\n");
    const ddlStart = events.indexOf("audit-ddl:start");
    assert.ok(ddlStart >= 0);
    assert.ok(events.indexOf("parallel-a:teardown:end") < ddlStart);
    assert.ok(events.indexOf("parallel-b:teardown:end") < ddlStart);

    // A reversed nonzero order must expose the unavailable shared resource.
    // Nonzero groups avoid Vitest's fallback for a default single-worker group.
    writeFileSync(eventsPath, "");
    for (const project of projects) {
      project.test.sequence = { groupOrder: project.test.name === "integration-audit-ddl" ? 1 : 2 };
    }
    writeFileSync(smokeConfig, `export default ${JSON.stringify({ root: slash(temporary), test: { projects } })};`);
    assert.throws(() => execFileSync(process.execPath,
      [join(root, "node_modules/vitest/vitest.mjs"), "run", "--config", smokeConfig, "--configLoader", "runner"],
      { cwd: root, timeout: 30_000, encoding: "utf8", windowsHide: true, stdio: "pipe" }),
    (error: unknown) => {
      const result = error as { status?: number; stdout?: string; stderr?: string };
      assert.equal(result.status, 1);
      assert.match((result.stdout ?? "") + (result.stderr ?? ""), /overlapping audit DDL/);
      return true;
    });
  } finally {
    assert.equal(dirname(temporary), tmpdir(), "cleanup must stay inside the temporary directory");
    assert.ok(temporary.includes("elpro-integration-order-"));
    rmSync(temporary, { recursive: true, force: true });
  }
});


// Finite current callers, not a generic arbitrary-JavaScript suppression proof.
function calendarCallerContract(text:string,input:{path:string;module:string;prefix:string;count:number}) {
  const source=ts.createSourceFile(input.path,text,ts.ScriptTarget.Latest,true),errors:string[]=[],calls:{id:string|null;valid:boolean}[]=[];
  let fixtureImport:ts.Identifier|undefined,testImport:ts.Identifier|undefined;
  for(const node of source.statements){if(!ts.isImportDeclaration(node)||!ts.isStringLiteral(node.moduleSpecifier))continue;
    const names=node.importClause?.namedBindings;if(!names||!ts.isNamedImports(names))continue;
    for(const item of names.elements){const imported=item.propertyName?.text??item.name.text;
      if(imported==="withCalendarFeedFixture"&&node.moduleSpecifier.text===input.module&&item.name.text===imported&&!item.isTypeOnly&&!node.importClause!.isTypeOnly){if(fixtureImport)errors.push("duplicate-import");fixtureImport=item.name;}
      if(imported==="test"&&node.moduleSpecifier.text==="vitest"&&item.name.text==="test"&&!item.isTypeOnly&&!node.importClause!.isTypeOnly){if(testImport)errors.push("duplicate-import");testImport=item.name;}
    }
  }
  if(!fixtureImport||!testImport)errors.push("direct-import");
  function visit(node:ts.Node):void {
    if(ts.isIdentifier(node)&&["test","withCalendarFeedFixture"].includes(node.text)&&node!==fixtureImport&&node!==testImport){
      const parent=node.parent,property=ts.isPropertyAccessExpression(parent)&&parent.name===node;
      if(!property&&(!ts.isCallExpression(parent)||parent.expression!==node))errors.push("binding-or-use");
    }
    if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==="withCalendarFeedFixture"){
      const awaited=node.parent,statement=awaited?.parent,body=statement?.parent,callback=body?.parent,testCall=callback?.parent;
      let valid=ts.isAwaitExpression(awaited)&&ts.isExpressionStatement(statement)&&statement.expression===awaited&&ts.isBlock(body)&&body.statements.includes(statement)
        &&ts.isArrowFunction(callback)&&callback.body===body&&!!callback.modifiers?.some(modifier=>modifier.kind===ts.SyntaxKind.AsyncKeyword)
        &&ts.isCallExpression(testCall)&&ts.isIdentifier(testCall.expression)&&testCall.expression.text==="test"&&testCall.arguments[1]===callback;
      const literal=valid&&ts.isCallExpression(testCall)?testCall.arguments[0]:undefined,id=literal&&ts.isStringLiteral(literal)?literal.text.match(/15\.5-(INT|API)(\d{3})\b/):null;
      if(!id||id[1]!==input.prefix)valid=false;calls.push({id:id?`15.5-${id[1]}${id[2]}`:null,valid});if(!valid)errors.push("immediate-test-expression");
    }
    ts.forEachChild(node,visit);
  }
  visit(source);
  const expected=Array.from({length:input.count},(_,i)=>`15.5-${input.prefix}${String(i+1).padStart(3,"0")}`).sort();
  if(JSON.stringify(calls.map(call=>call.id).sort())!==JSON.stringify(expected))errors.push("exact-enrollment");
  return{accepted:errors.length===0,calls,errors};
}
const calendarCallerInputs=[{path:"tests/integration/commands/calendar-feed.int.test.ts",module:"../../support/calendar-feed-atdd",prefix:"INT",count:14},{path:"tests/integration/calendar-feed/public-feed.int.test.ts",module:"../../support/calendar-feed-atdd",prefix:"API",count:20}];

test("C4 current34 fixture calls are directly imported top-level awaited statements in their exact test callbacks",()=>{
  let total=0;
  for(const input of calendarCallerInputs){const result=calendarCallerContract(readFileSync(join(root,input.path),"utf8"),input);assert.deepEqual(result.errors,[]);assert.equal(result.accepted,true);total+=result.calls.length;}
  assert.equal(total,34);
});

test("C4 actual caller guard rejects catch finally-return void wrapper alias shadow and reassignment suppression",async()=>{
  for(const input of calendarCallerInputs){const text=readFileSync(join(root,input.path),"utf8"),source=ts.createSourceFile(input.path,text,ts.ScriptTarget.Latest,true);let statement:ts.ExpressionStatement|undefined;
    const find=(node:ts.Node)=>{if(!statement&&ts.isExpressionStatement(node)&&ts.isAwaitExpression(node.expression)&&ts.isCallExpression(node.expression.expression)&&node.expression.expression.expression.getText(source)==="withCalendarFeedFixture")statement=node;ts.forEachChild(node,find);};find(source);assert.ok(statement);
    const a=statement.getStart(source),b=statement.end,original=text.slice(a,b),awaited=original.slice(0,-1);
    const variants=[`try { ${original} } catch {}`,`try { ${original} } finally { return; }`,`void ${original.replace(/^await /,"")}`,original.replace(/^await /,""),`await (async()=>{${original}})();`,`return ${awaited};`,`if(true){${original}}`,`${awaited}.catch(()=>{});`];
    for(const replacement of variants)assert.equal(calendarCallerContract(text.slice(0,a)+replacement+text.slice(b),input).accepted,false);
    for(const changed of [text.replaceAll(input.module,input.module+"-other"),text.replace("import { withCalendarFeedFixture,","import { withCalendarFeedFixture as aliasFixture,"),text+"\nwithCalendarFeedFixture=other;",text+"\nfunction extra(test){test('shadow',()=>{});}"])assert.equal(calendarCallerContract(changed,input).accepted,false);
  }
  // Biting counterexample: finally return actually swallows the fixture rejection.
  let suppressed=false;await(async()=>{try{await Promise.reject(Error("C4_FIXED"));}finally{return;}})().then(()=>{suppressed=true;});assert.equal(suppressed,true);
});

test("C4 resolved supported-project predicate refuses exact unsafe fields and every missing or extra selection",()=>{
  const supported=()=>[{name:"integration-parallel",config:{isolate:true,fileParallelism:true,sequence:{groupOrder:0},maxWorkers:undefined as number|undefined}},{name:"integration-audit-ddl",config:{isolate:true,fileParallelism:false,sequence:{groupOrder:1},maxWorkers:1,bail:1}}];
  const current=supported();assert.equal(supportedCalendarIntegrationProjects(current),true);assert.equal(supportedCalendarIntegrationProjects(current.slice(1)),false);assert.equal(supportedCalendarIntegrationProjects(current.slice(0,1)),false);assert.equal(supportedCalendarIntegrationProjects([...current,{...current[0],name:"extra"}]),false);
  for(const [index,key,value]of [[0,"isolate",false],[0,"fileParallelism",false],[0,"maxWorkers",1],[1,"isolate",false],[1,"fileParallelism",true],[1,"maxWorkers",2],[1,"bail",0]] as const){const projects=supported();Object.assign(projects[index].config,{[key]:value});assert.equal(supportedCalendarIntegrationProjects(projects),false);}
  for(const index of [0,1]){const projects=supported();projects[index].config.sequence.groupOrder=9;assert.equal(supportedCalendarIntegrationProjects(projects),false);}
  const ordinary=supported();ordinary[0].config.maxWorkers=2;assert.equal(supportedCalendarIntegrationProjects(ordinary),true);
});


/** Installed runner, actual current hook, synthetic modules only. No app/config
 * setup/.env/DB is loaded: the child root/envDir/setup are this empty owned dir. */
function c4RunnerProbe(mode:string) {
  const scratch=join(root,".env.epic15.mail-runtime/story-15-5-preparation/job-wide-c4-source");mkdirSync(scratch,{recursive:true});const directory=mkdtempSync(join(scratch,"probe-"));
  try {
    const eventsPath=join(directory,"events.jsonl"),vitestModule=JSON.stringify(slash(join(root,"node_modules/vitest/dist/index.js"))),events=JSON.stringify(slash(eventsPath));
    const record=`import {appendFileSync} from 'node:fs';const record=value=>appendFileSync(${events},JSON.stringify(value)+'\\n');`;
    writeFileSync(join(directory,"parallel.test.mjs"),`import {test,afterAll} from ${vitestModule};${record} record('parallel:import');test('parallel',()=>record('parallel:body'));afterAll(()=>record('parallel:teardown'));`);
    const scenario=mode==="uncertain"?`held=true;throw Error('C4_FIXED');`:mode==="caught-inner"?`try{held=true;throw Error('C4_FIXED');}catch{record('inner:caught');}`:`const denied={denied:true,rows:[]};if(!denied.denied||denied.rows.length)throw Error('C4_FIXED');`;
    writeFileSync(join(directory,"a-first.test.mjs"),`import {test,beforeAll} from ${vitestModule};${record}record('serial:first:import');beforeAll(()=>record('serial:first:hook'));let held=false;async function fixture(run){let failed=false;try{await run();}catch{failed=true;}if(held||failed)throw Error('C4_CUSTODY_UNKNOWN');}test('ordinary expected denial or failed fixture',async()=>{await fixture(async()=>{${scenario}});});`);
    writeFileSync(join(directory,"z-next.test.mjs"),`import {test,beforeAll} from ${vitestModule};${record}record('serial:next:import');beforeAll(()=>record('serial:next:hook'));test('different target',()=>record('serial:next:body'));`);
    const parallel={extends:true,test:{name:"integration-parallel",include:["parallel.test.mjs"],fileParallelism:true,maxWorkers:mode==="unsafe-parallel"?1:mode==="cli-one"?undefined:2,sequence:{groupOrder:0}}};
    const serial={extends:true,test:{name:"integration-audit-ddl",include:["a-first.test.mjs","z-next.test.mjs"],fileParallelism:false,bail:mode==="disabled-bail"?0:1,sequence:{groupOrder:1}}};
    const projects=mode==="serial-only"?[serial]:mode==="parallel-only"?[parallel]:mode==="extra"?[parallel,serial,{...parallel,test:{...parallel.test,name:"extra",include:[]}}]:[parallel,serial];
    const config={root:slash(directory),envDir:slash(directory),cacheDir:slash(join(directory,"cache")),test:{watch:false,environment:"node",globals:false,setupFiles:[],globalSetup:[],retry:0,isolate:true,reporters:["json"],outputFile:slash(join(directory,"result.json")),projects}};
    const file=join(directory,"vitest.config.mjs");
    writeFileSync(file,`import current from ${JSON.stringify(slash(configPath))};import {BaseSequencer} from ${JSON.stringify(slash(join(root,"node_modules/vitest/dist/node.js")))};class Stable extends BaseSequencer{sort(files){return [...files].sort((a,b)=>a.moduleId.localeCompare(b.moduleId));}}const config=${JSON.stringify(config)};config.plugins=current.plugins;config.test.sequence={sequencer:Stable};export default config;`);
    let code=0,output="";
    try{output=execFileSync(process.execPath,[join(root,"node_modules/vitest/vitest.mjs"),"run","--config",file,"--configLoader","runner",...(mode==="cli-one"?["--maxWorkers=1"]:[])],{cwd:root,timeout:25_000,encoding:"utf8",windowsHide:true,stdio:"pipe"});}
    catch(error){const result=error as {status?:number;stdout?:string;stderr?:string};assert.equal(typeof result.status,"number","synthetic child must settle with native status, not timeout");code=result.status!;output=(result.stdout??"")+(result.stderr??"");}
    const files=readdirSync(directory),observed=files.includes("events.jsonl")?readFileSync(eventsPath,"utf8").trim().split("\n").map(line=>JSON.parse(line) as string):[];
    const report=files.includes("result.json")?JSON.parse(readFileSync(join(directory,"result.json"),"utf8")) as {numPassedTests:number;numFailedTests:number;numPendingTests:number}:null;
    return{code,unsupported:output.includes("C4_UNSUPPORTED_PROJECT_CONFIG"),events:observed,report};
  }finally{assert.equal(dirname(directory),scratch);assert.ok(slash(directory).startsWith(slash(scratch)+"/probe-"));rmSync(directory,{recursive:true,force:true});}
}

test("C4 installed hook preserves healthy expected-denial execution and bail prevents next isolated file import after uncaught or caught-inner custody",()=>{
  const healthy=c4RunnerProbe("healthy");assert.equal(healthy.code,0);assert.equal(healthy.report?.numPassedTests,3);assert.equal(healthy.report?.numFailedTests,0);assert.equal(healthy.report?.numPendingTests,0);
  assert.ok(healthy.events.indexOf("parallel:teardown")<healthy.events.indexOf("serial:first:import"));assert.ok(healthy.events.includes("serial:next:import"));assert.ok(healthy.events.includes("serial:next:body"));
  const cliOne=c4RunnerProbe("cli-one");assert.equal(cliOne.code,0);assert.equal(cliOne.report?.numPassedTests,3);assert.ok(cliOne.events.indexOf("parallel:teardown")<cliOne.events.indexOf("serial:first:import"));
  for(const mode of ["uncertain","caught-inner"]){const failed=c4RunnerProbe(mode);assert.equal(failed.code,1);assert.equal(failed.report?.numFailedTests,1);assert.equal(failed.report?.numPassedTests,1);assert.ok(failed.events.includes("serial:first:import"));assert.ok(!failed.events.some(event=>event.startsWith("serial:next:")));assert.ok(failed.events.indexOf("parallel:teardown")<failed.events.indexOf("serial:first:import"));}
});

test("C4 every selected project checks full resolved support before setup import or test admission",()=>{
  for(const mode of ["serial-only","parallel-only","extra","unsafe-parallel","disabled-bail"]){const stopped=c4RunnerProbe(mode);assert.equal(stopped.code,1);assert.equal(stopped.unsupported,true);assert.deepEqual(stopped.events,[]);assert.equal(stopped.report,null);}
});
