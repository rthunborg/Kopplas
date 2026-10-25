/** Actual TSX hook/action-port tests, not browser, persistence or RLS evidence. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as inputs from "@/features/resources/booking-editor-input";
import * as transport from "@/features/resources/booking-transport";
import * as state from "@/features/resources/booking-series-state";
import * as jobScheduling from "@/features/jobs/job-scheduling-consumers";
import * as timeZone from "@/features/scheduling/time-zone";

type Node = {type:unknown;props:Record<string,unknown>};
function nodes(value:unknown):Node[]{if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=="object"||!("props" in value))return [];const n=value as Node;return[n,...nodes(n.props.children)];}
const base={startsAt:"2026-11-02T08:00:00.000000Z",endsAt:"2026-11-02T09:00:00.000000Z",allDay:false,workRoleId:null,jobId:null,customerId:null,facilityId:null,contactId:null,description:"Original",status:"planned",assigneeIds:["person"],seriesId:null,occurrenceIndex:null,isException:false};
function harness(patch:Record<string,unknown>={}){
  const require=createRequire(import.meta.url),cells:unknown[]=[],effectCells:{deps:unknown[];cleanup?:()=>void}[]=[];
  let cursor=0,effectCursor=0,tree:Node,changed=true;const effects:(()=>void)[]=[],timers=new Map<number,()=>Promise<void>>();let timerId=0;
  const rule={preset:"daily",startDate:"2026-11-02",startTime:"09:00:00",endTime:"10:00:00",endDayOffset:0,allDay:false,timeZone:"Europe/Stockholm",count:3};
  let current={id:"source",version:1,rule,template:{...base},nominalDate:"2026-11-02"},metadataFails=false,staleCode="PREVIEW_STALE";let reads=0;const previews:Record<string,unknown>[]=[],saves:Record<string,unknown>[]=[];
  const hooks={useRef:(v:unknown)=>{const n=cursor++;return cells[n]??(cells[n]={current:v});},useState:(v:unknown)=>{const n=cursor++;if(!(n in cells))cells[n]=typeof v==="function"?(v as ()=>unknown)():v;return[cells[n],(next:unknown)=>{const value=typeof next==="function"?(next as (old:unknown)=>unknown)(cells[n]):next;if(!Object.is(value,cells[n])){cells[n]=value;changed=true;}}];},useEffect:(fn:()=>void|(()=>void),deps:unknown[]=[])=>{const n=effectCursor++,old=effectCells[n];if(!old||deps.some((v,i)=>!Object.is(v,old.deps[i]))){effects.push(()=>{old?.cleanup?.();const cleanup=fn();effectCells[n]={deps,cleanup:typeof cleanup==="function"?cleanup:undefined};});}}};
  const series={readBookingSeriesAction:async()=>{reads++;return metadataFails?{status:"error",message:"Metadata unavailable"}:{status:"success",series:structuredClone(current)};},
    previewBookingSeriesAction:async(input:Record<string,unknown>)=>{previews.push(input);if(input.expectedVersion!==current.version||input.sourceSeriesId!==current.id)return{status:"error",code:staleCode,message:"stale"};return{status:"success",preview:{receipt:"unit-port-receipt",total:3,occurrences:[],warnings:[{logicalId:"warning",rule:"outside_work_hours",personId:"person",bookingIds:[],startsAt:base.startsAt,endsAt:base.endsAt}]}};},
    saveBookingSeriesAction:async(input:Record<string,unknown>)=>{saves.push(input);return{status:"error",code:"PREVIEW_STALE",message:"stale"};}};
  const modules:Record<string,unknown>={"@/features/jobs/job-scheduling-consumers":jobScheduling,"@/features/scheduling/time-zone":timeZone,react:hooks,"@/components/crm/Dialog":{Dialog:"Dialog"},"@/features/resources/booking-actions":{},"@/features/resources/booking-editor-input":inputs,"@/features/resources/booking-transport":transport,"@/features/resources/booking-series-actions":series,"@/features/resources/booking-series-state":state,"./BookingRecurrenceFields":{BookingRecurrenceFields:"Fields"},"./RecurrencePreview":{RecurrencePreview:"Preview"}};
  const window={setTimeout:(fn:()=>Promise<void>)=>{timers.set(++timerId,fn);return timerId;},clearTimeout:(id:number)=>timers.delete(id),addEventListener:()=>{},removeEventListener:()=>{}};
  function load(path:string){const m={exports:{}};const output=ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;runInNewContext(output,{module:m,exports:m.exports,require:(name:string)=>modules[name]??require(name),window,history:{state:{},pushState:()=>{},back:()=>{}},document:{activeElement:null},crypto,Intl,Buffer});return m.exports as Record<string,unknown>;}
  modules["./BookingConflictPanel"]={...load("src/components/resources/BookingConflictPanel.tsx"),BookingConflictPanel:"Panel"};
  const Editor=load("src/components/resources/BookingEditor.tsx").BookingEditor as (props:Record<string,unknown>)=>Node;
  const props={open:true,onClose:()=>{},draft:{...base},bookingId:"pivot",seriesId:"source",options:{canManage:true,error:null,people:[{id:"person",label:"Person",workRoleIds:[]}],workRoles:[],jobs:[],customers:[],facilities:[],contacts:[]},...patch};
  function render(){cursor=0;effectCursor=0;changed=false;tree=Editor(props);for(const fn of effects.splice(0))fn();return tree;}
  async function settle(){for(let i=0;i<12;i++){render();await Promise.resolve();await Promise.resolve();if(changed)continue;const next=[...timers.values()];timers.clear();for(const fn of next)await fn();await Promise.resolve();if(!changed&&!timers.size)break;}render();}
  function find(id:string){const n=nodes(tree).find(n=>n.props["data-testid"]===id);assert.ok(n,`Missing control ${id}`);return n;}
  const invoke=(n:Node,event:string,value:unknown={})=>(n.props[event] as (value:unknown)=>unknown)(value);
  async function following(){await settle();const radio=nodes(tree).filter(n=>n.type==="input"&&n.props.name==="booking-scope")[1]!;invoke(radio,"onChange");render();invoke(find("booking-series-scope-confirm"),"onClick");await settle();}
  return{settle,following,find,invoke,all:()=>nodes(tree),previews,saves,reads:()=>reads,latest:()=>previews.at(-1)!,current:(value:Partial<typeof current>)=>{current={...current,...value};},failMetadata:()=>{metadataFails=true;},denyMovedPivot:()=>{staleCode="TENANT_ACCESS_DENIED";}};
}
test("Round1 following preserves explicit gesture time and reassignment over stored defaults",async()=>{
  const h=harness({draft:{...base,description:"Occurrence exception",assigneeIds:["pivot-person"]},proposal:{startsAt:"2026-11-03T10:00:00.000000Z",endsAt:"2026-11-03T12:00:00.000000Z",assigneeIds:["destination"]}});
  await h.following();const input=h.latest(),rule=input.rule as Record<string,unknown>,template=input.template as Record<string,unknown>;
  assert.equal(rule.startDate,"2026-11-03");assert.equal(rule.startTime,"11:00:00");assert.equal(rule.endTime,"13:00:00");assert.deepEqual([...template.assigneeIds as string[]],["destination"]);assert.equal(template.description,"Original");
});
test("Round1 following renders a retained template assignee missing from the pivot and active roster",async()=>{
  const h=harness({draft:{...base,assigneeIds:["pivot-person"]},options:{canManage:true,error:null,people:[],workRoles:[],jobs:[],customers:[],facilities:[],contacts:[]}});await h.following();
  assert.equal(h.find("booking-assignee-option-person").props.checked,true);
});
for(const origin of ["preview","save"] as const)test(`Round1 stale ${origin} reloads current series ownership/version without erasing draft`,async()=>{
  const h=harness();await h.following();h.current({id:"new-owner",version:2});
  h.invoke(h.find("booking-description"),"onChange",{target:{value:"Retained user draft"}});await h.settle();
  if(origin==="save"){
    // Start with an admitted old version, then make the server stale at commit.
    h.current({id:"source",version:1});await h.settle();
    h.invoke(h.find("booking-description"),"onChange",{target:{value:"Retained user draft"}});await h.settle();
    h.invoke(h.find("booking-review-current-warnings"),"onChange",{target:{checked:true}});
    h.invoke(h.find("booking-override-reason"),"onChange",{target:{value:"Old review reason"}});await h.settle();
    h.current({id:"new-owner",version:2});await h.invoke(h.find("booking-editor"),"onSubmit",{preventDefault:()=>{}});await h.settle();
  }
  assert.ok(h.reads()>=2);assert.equal(h.latest().expectedVersion,2);assert.equal(h.latest().sourceSeriesId,"new-owner");
  assert.equal((h.latest().template as Record<string,unknown>).description,"Retained user draft");
  assert.equal(h.find("booking-review-current-warnings").props.checked,false);assert.equal(h.find("booking-override-reason").props.value,"");
});
test("Round1 failed metadata recovery retains draft and cannot fall through to create",async()=>{
  const h=harness();await h.following();const before=h.previews.length;
  h.current({version:2});h.failMetadata();h.invoke(h.find("booking-description"),"onChange",{target:{value:"Keep this draft"}});await h.settle();
  assert.equal(h.find("booking-description").props.value,"Keep this draft");
  assert.equal(h.find("booking-retry").props.disabled,true);assert.equal(h.saves.length,0);
  assert.equal(h.previews.length,before+1);assert.ok(h.previews.every(input=>typeof input.sourceSeriesId==="string"));
});


test("Round1 editor rejects an entered pre-nominal date even when equal to old stored anchor",async()=>{
  const h=harness();h.current({nominalDate:"2026-11-03"});await h.following();const before=h.previews.length;
  h.invoke(h.find("booking-start"),"onChange",{target:{value:"2026-11-02T09:00"}});await h.settle();
  assert.equal(h.find("booking-start").props.value,"2026-11-02T09:00");assert.equal(h.previews.length,before);
  const preview=h.all().find(n=>n.type==="Preview")!;assert.equal(preview.props.status,"failed");assert.match(String(preview.props.error),/Startdatum.*nominella/);
  assert.equal(h.find("booking-save").props.disabled,true);assert.equal(h.saves.length,0);
});
test("Round2 explicit following preview retry reloads ownership after a split denial and preserves draft",async()=>{
  const h=harness();await h.following();h.denyMovedPivot();h.current({id:"new-owner",version:2});
  h.invoke(h.find("booking-description"),"onChange",{target:{value:"Retained race draft"}});await h.settle();
  const failed=h.all().find(node=>node.type==="Preview")!;assert.equal(failed.props.status,"failed");assert.equal(h.reads(),1);
  h.invoke(failed,"onRetry");await h.settle();
  assert.equal(h.reads(),2);assert.equal(h.latest().sourceSeriesId,"new-owner");assert.equal(h.latest().expectedVersion,2);
  assert.equal((h.latest().template as Record<string,unknown>).description,"Retained race draft");
  assert.equal(h.all().find(node=>node.type==="Preview")!.props.status,"ready");assert.equal(h.saves.length,0);
});
