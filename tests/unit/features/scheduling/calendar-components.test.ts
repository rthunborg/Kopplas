import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import * as model from "@/features/scheduling/view-model";
import * as preferences from "@/features/scheduling/view-preferences";
import * as times from "@/features/scheduling/time-zone";
import * as capacity from "@/features/scheduling/capacity";
import * as types from "@/features/scheduling/view-types";
import * as focus from "@/components/scheduling/focus-restoration";
import type { SchedulingBookingSummary, SchedulingReadData, SchedulingReadInput } from "@/features/scheduling/view-types";

type ElementNode={type:unknown;props:Record<string,unknown>};
type Handler=(event:unknown)=>void;
function children(value:unknown):ElementNode[]{
  if(Array.isArray(value))return value.flatMap(children);
  if(!value || typeof value!=="object" || !("props" in value))return [];
  const node=value as ElementNode;return [node,...children(node.props.children)];
}
const input:SchedulingReadInput={view:"schema",mode:"day",date:"2026-10-12",filters:model.EMPTY_SCHEDULING_FILTERS};
const booking=(patch:Partial<SchedulingBookingSummary>={}):SchedulingBookingSummary=>({id:"booking",startsAt:"2026-10-12T06:00:00Z",endsAt:"2026-10-12T07:00:00Z",allDay:false,status:"planned",assigneeIds:["person"],workRoleId:null,jobId:null,customerId:null,facilityId:null,contactId:null,description:"Bokning",seriesId:null,occurrenceIndex:null,isException:false,openConflictCount:0,...patch});
const data=(bookings:SchedulingBookingSummary[],canManage=true):SchedulingReadData=>({bookings,canManage,canView:true,actorId:"actor",tenantId:"tenant",ownSelfPersonIds:["person"],error:null,roster:canManage?[{id:"person",label:"Person",workRoleIds:[]}]:undefined});

/** Execute actual TSX handlers with hook cells and event ports, not a browser/DOM substitute. */
function components(savedPreferences = new Map<string, string>(), summaryDraft:(booking:SchedulingBookingSummary)=>unknown=()=>{throw new Error("not used by these handler tests");}){
  const require=createRequire(import.meta.url),cells:unknown[]=[],effects:(()=>void|(()=>void))[]=[];
  const listeners=new Map<string,(event:unknown)=>void>();let cursor=0,writes=0;
  const hooks={useRef:(value:unknown)=>{const n=cursor++;return cells[n]??(cells[n]={current:value});},
    useState:(value:unknown)=>{const n=cursor++;if(!(n in cells))cells[n]=value;return[cells[n],(next:unknown)=>{cells[n]=typeof next==="function"?(next as (old:unknown)=>unknown)(cells[n]):next;}];},
    useCallback:(value:unknown)=>value,useMemo:(fn:()=>unknown)=>fn(),useEffect:(fn:()=>void|(()=>void))=>effects.push(fn)};
  const window={addEventListener:(name:string,fn:(event:unknown)=>void)=>listeners.set(name,fn),removeEventListener:(name:string)=>listeners.delete(name),localStorage:{getItem:(key:string)=>savedPreferences.get(key)??null,setItem:(key:string,value:string)=>{writes++;savedPreferences.set(key,value);}}};
  const modules:Record<string,unknown>={react:hooks,"@/features/scheduling/view-model":model,"@/features/scheduling/view-preferences":preferences,"@/features/scheduling/time-zone":times,"@/features/scheduling/capacity":capacity,"@/features/scheduling/view-types":types,"./focus-restoration":focus};
  const load=(file:string):Record<string,unknown>=>{
    const source=readFileSync(resolve("src/components",file),"utf8");
    const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    const compiledModule={exports:{}};
    runInNewContext(output,{module:compiledModule,exports:compiledModule.exports,require:(name:string)=>modules[name]??require(name),window,queueMicrotask,document:{activeElement:null}});
    return compiledModule.exports;
  };
  modules["../resources/BookingConflictPanel"]=load("resources/BookingConflictPanel.tsx");
  const block=load("scheduling/BookingBlock.tsx");modules["./BookingBlock"]=block;
  const schema=load("scheduling/SchemaView.tsx");modules["./SchemaView"]=schema;
  const personal=load("scheduling/PersonalCalendarView.tsx");
  const toolbar=load("scheduling/SchedulingToolbar.tsx");
  const marker=()=>null;
  modules["./SchedulingToolbar"]={SchedulingToolbar:marker};
  for(const name of ["ResourcesView","TeamView","CapacityView","PersonalCalendarView","IntervalSelectionDialog"])modules[`./${name}`]={[name]:marker};
  modules["../resources/BookingEditor"]={BookingEditor:marker};
  modules["../resources/BookingEntry"]={bookingSummaryDraft:summaryDraft};
  const workspace=load("scheduling/SchedulingWorkspace.tsx");
  type Component=(props:Record<string,unknown>)=>ElementNode;
  return {block:block.BookingBlock as Component,slots:schema.CalendarSlots as Component,personal:personal.PersonalCalendarView as Component,
    toolbar:toolbar.SchedulingToolbar as Component,workspace:workspace.SchedulingWorkspace as Component,marker,listeners,effects,
    render:(fn:()=>ElementNode)=>{cursor=0;return fn();},writes:()=>writes};
}
function slot(nodes:ElementNode[],start="2026-10-12T12:30:00.000000Z"){return nodes.find(node=>node.props["data-testid"]==="schema-slot"&&node.props["data-start"]===start)!;}
function invoke(node:ElementNode,name:string,event:unknown={}){(node.props[name] as Handler)(event);}

test("personal week preserves manager controls and own-only entitlement without granting gestures",()=>{
  for(const manager of [true,false]){
    const c=components(),b=booking(),tree=c.personal({input:{...input,view:"personal",mode:"week"},data:data([b],manager),bookings:[b],onSelect:()=>{},onEdit:()=>{}});
    const html=renderToStaticMarkup(tree as ReactNode);
    // One agenda and one grid instance each retain the same actual entitlement.
    assert.equal(html.includes("Redigera / flytta"),manager);assert.equal(html.includes('draggable="true"'),manager);
    if(!manager)assert.match(html,/disabled=""/);
  }
});
test("cancelled historical cards display status without blocking a free creation slot",()=>{
  const c=components(),cancelled=booking({status:"cancelled"}),proposals:unknown[]=[];
  const tree=c.slots({date:input.date,host:"schema",data:data([cancelled]),bookings:[cancelled],onSelect:(p:unknown)=>proposals.push(p),onEdit:()=>{}});
  const target=slot(children(tree),"2026-10-12T06:00:00.000000Z");
  assert.equal(target.props["aria-disabled"],false);invoke(target,"onClick",{detail:0});assert.equal(proposals.length,1);
  const html=renderToStaticMarkup(tree as ReactNode);assert.match(html,/Avbruten/);
  const active=components(),activeTree=active.slots({date:input.date,host:"schema",data:data([booking()]),bookings:[booking()],onSelect:()=>{},onEdit:()=>{}});
  assert.equal(slot(children(activeTree),"2026-10-12T06:00:00.000000Z").props["aria-disabled"],true);
  assert.match(renderToStaticMarkup(activeTree as ReactNode),/Planerad/);
});
test("day fragment displays clipped instants but edit proposal retains original booking facts",()=>{
  const c=components(),b=booking({startsAt:"2026-10-11T21:30:00Z",endsAt:"2026-10-12T00:30:00Z"});let edited:unknown;
  const tree=c.slots({date:input.date,host:"schema",data:data([b]),bookings:[b],onSelect:()=>{},onEdit:(p:unknown)=>{edited=p;}});
  const fragment=children(tree).find(node=>node.type===c.block)!;
  const article=c.block(fragment.props),html=renderToStaticMarkup(article as ReactNode);
  assert.match(html,/dateTime="2026-10-11T22:00:00.000000Z"/);assert.doesNotMatch(html,/dateTime="2026-10-11T21:30:00Z"/);
  const edit=children(article).find(node=>node.type==="button"&&node.props.children==="Redigera / flytta")!;
  invoke(edit,"onClick",{currentTarget:{}});assert.equal((edited as {booking:unknown}).booking,b);
});
test("Escape then pointerup and generated click cancel; keyboard and new pointer sequence remain usable",async()=>{
  const c=components(),selected:unknown[]=[];
  const tree=c.slots({date:input.date,host:"schema",data:data([]),bookings:[],onSelect:(p:unknown)=>selected.push(p),onEdit:()=>{}});
  c.effects[0]!();const target=slot(children(tree)),down={button:0,currentTarget:{focus:()=>{}}};
  invoke(target,"onPointerDown",down);c.listeners.get("keydown")!({key:"Escape"});invoke(target,"onPointerUp");c.listeners.get("pointerup")!({});await Promise.resolve();
  invoke(target,"onClick",{detail:1});assert.equal(selected.length,0);
  invoke(target,"onClick",{detail:0});assert.equal(selected.length,1);
  invoke(target,"onPointerDown",down);invoke(target,"onPointerUp");c.listeners.get("pointerup")!({});await Promise.resolve();
  invoke(target,"onClick",{detail:1});assert.equal(selected.length,2);
});
test("actual all-day drop handler preserves calendar boundary and other resource assignees",()=>{
  const c=components(),b=booking({allDay:true,startsAt:"2026-10-23T22:00:00Z",endsAt:"2026-10-24T22:00:00Z",assigneeIds:["person","peer"]});let proposal:Record<string,unknown>={};
  const tree=c.slots({date:"2026-10-25",host:"resources",personId:"destination",data:data([b]),bookings:[],onSelect:()=>{},onEdit:(p:Record<string,unknown>)=>{proposal=p;}});
  const target=children(tree).find(node=>node.props["data-start"]==="2026-10-25T13:30:00.000000Z")!;
  invoke(target,"onDrop",{preventDefault:()=>{},dataTransfer:{getData:(key:string)=>key==="application/kopplas-booking"?b.id:key==="application/kopplas-person"?"person":""}});
  assert.equal(proposal.booking,b);assert.equal(proposal.startsAt,"2026-10-24T22:00:00.000000Z");assert.equal(proposal.endsAt,"2026-10-25T23:00:00.000000Z");
  assert.deepEqual(proposal.assigneeIds,["destination","peer"]);
});
test("unsupported date event cannot publish input, preference or read; toolbar navigation reports boundary",()=>{
  const c=components();let reads=0;
  const props={initial:{data:data([]),entitlements:{withheld:[]}},initialInput:input,readAction:async()=>{reads++;return{data:data([]),entitlements:{withheld:[]}};}};
  const first=c.render(()=>c.workspace(props));
  const toolbar=children(first).find(node=>node.type===c.marker&&typeof node.props.onChange==="function")!;
  for(const date of ["10000-01-01","9999-12-30"])(toolbar.props.onChange as (value:SchedulingReadInput)=>void)({...input,date});
  const next=c.render(()=>c.workspace(props)),nextToolbar=children(next).find(node=>node.type===c.marker&&typeof node.props.onChange==="function")!;
  assert.equal((nextToolbar.props.input as SchedulingReadInput).date,input.date);assert.equal(reads,0);assert.equal(c.writes(),0);
  assert.match(renderToStaticMarkup(next as ReactNode),/Planeringens val är ogiltiga/);
  let invalid=0,changes=0;
  const edge=c.toolbar({input:{...input,date:"9999-12-31"},data:data([]),onChange:()=>{changes++;},onInvalid:()=>{invalid++;},onCreate:()=>{},onInterval:()=>{},onView:()=>{}});
  invoke(children(edge).find(node=>node.props["aria-label"]==="Nästa period")!,"onClick");assert.equal(invalid,1);assert.equal(changes,0);
});

test("actual workspace keeps latest loading, retains qualified retry toolbar only and clears thrown authority",async()=>{
  const c=components(),old=booking(),pending:{resolve:(value:unknown)=>void;reject:(value:unknown)=>void}[]=[];
  const props={initial:{data:{...data([old]),openConflictCount:7},entitlements:{withheld:[]}},initialInput:input,
    readAction:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))};
  const toolbar=()=>children(c.render(()=>c.workspace(props))).find(node=>node.type===c.marker&&typeof node.props.onChange==="function")!;
  const change=(date:string)=>(toolbar().props.onChange as (value:SchedulingReadInput)=>void)({...input,date});
  change("2026-10-13");change("2026-10-14");
  pending[0]!.resolve({data:data([booking({id:"stale"})]),entitlements:{withheld:[]}});await Promise.resolve();await Promise.resolve();
  assert.match(renderToStaticMarkup(c.render(()=>c.workspace(props)) as ReactNode),/Läser planering/);
  pending[1]!.resolve({data:{...model.schedulingReadException().data,actorId:"actor",tenantId:"tenant",confirmedAuthority:{canView:true,canManage:true}},entitlements:{withheld:[]}});
  await Promise.resolve();await Promise.resolve();
  const retry=toolbar().props.data as SchedulingReadData;
  assert.equal(retry.canManage,true);assert.equal(retry.roster?.[0]?.label,"Person");assert.deepEqual(retry.bookings,[]);assert.equal(retry.openConflictCount,undefined);assert.equal(retry.capacity,undefined);
  assert.match(renderToStaticMarkup(c.render(()=>c.workspace(props)) as ReactNode),/Planeringen kunde inte läsas/);
  change("2026-10-15");pending[2]!.reject(new Error("unqualified transport failure"));await Promise.resolve();await Promise.resolve();
  const failed=toolbar().props.data as SchedulingReadData;
  assert.equal(failed.canManage,false);assert.equal(failed.actorId,"");assert.equal(failed.tenantId,"");assert.equal(failed.roster,undefined);assert.deepEqual(failed.bookings,[]);
});


test("actual workspace preserves navigation and scoped preferences after unqualified transport recovery",async()=>{
  const saved=new Map<string,string>(),c=components(saved),pending:{resolve:(value:unknown)=>void;reject:(value:unknown)=>void}[]=[];
  const props={initial:{data:data([booking()]),entitlements:{withheld:[]}},initialInput:input,
    readAction:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))};
  const toolbar=()=>children(c.render(()=>c.workspace(props))).find(node=>node.type===c.marker&&typeof node.props.onChange==="function")!;
  const change=(date:string)=>(toolbar().props.onChange as (value:SchedulingReadInput)=>void)({...input,date});
  change("2026-10-13");pending[0]!.reject(new Error("transport"));await Promise.resolve();await Promise.resolve();
  const failed=toolbar().props.data as SchedulingReadData;
  assert.equal(failed.canManage,false);assert.equal(failed.actorId,"");assert.deepEqual(failed.bookings,[]);
  change("2026-10-14");
  const key=preferences.schedulingPreferenceKey({actorId:"actor",tenantId:"tenant",view:"schema"});
  assert.equal(JSON.parse(saved.get(key)!).input.date,"2026-10-14");assert.deepEqual([...saved.keys()],[key]);
  pending[1]!.resolve({data:data([booking({id:"recovered"})]),entitlements:{withheld:[]}});await Promise.resolve();await Promise.resolve();
  const recovered=toolbar();assert.equal((recovered.props.input as SchedulingReadInput).date,"2026-10-14");
  assert.equal((recovered.props.data as SchedulingReadData).canManage,true);assert.equal(pending.length,2);
});

for(const changed of ["actor","tenant"] as const)test(`transport recovery still restores separately scoped preferences when ${changed} changes`,async()=>{
  const saved=new Map<string,string>(),c=components(saved),pending:{resolve:(value:unknown)=>void;reject:(value:unknown)=>void}[]=[];
  const nextIdentity={actorId:changed==="actor"?"other":"actor",tenantId:changed==="tenant"?"other":"tenant"};
  const key=preferences.schedulingPreferenceKey({...nextIdentity,view:"schema"});
  saved.set(key,JSON.stringify({version:1,input:{...input,date:"2026-10-16"}}));
  const props={initial:{data:data([booking()]),entitlements:{withheld:[]}},initialInput:input,
    readAction:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))};
  const toolbar=()=>children(c.render(()=>c.workspace(props))).find(node=>node.type===c.marker&&typeof node.props.onChange==="function")!;
  const change=(date:string)=>(toolbar().props.onChange as (value:SchedulingReadInput)=>void)({...input,date});
  change("2026-10-13");pending[0]!.reject(new Error("transport"));await Promise.resolve();await Promise.resolve();
  change("2026-10-14");pending[1]!.resolve({data:{...data([]),...nextIdentity},entitlements:{withheld:[]}});await Promise.resolve();await Promise.resolve();
  assert.equal((toolbar().props.input as SchedulingReadInput).date,"2026-10-16");assert.equal(pending.length,3);
  pending[2]!.resolve({data:{...data([]),...nextIdentity},entitlements:{withheld:[]}});await Promise.resolve();await Promise.resolve();
  assert.equal((toolbar().props.data as SchedulingReadData).actorId,nextIdentity.actorId);
  assert.equal((toolbar().props.data as SchedulingReadData).tenantId,nextIdentity.tenantId);
  const oldKey=preferences.schedulingPreferenceKey({actorId:"actor",tenantId:"tenant",view:"schema"});
  assert.equal(JSON.parse(saved.get(oldKey)!).input.date,"2026-10-14");
});

test("Round1 actual Workspace carries only explicit gesture proposal separately into the editor",()=>{
  const b=booking({seriesId:"series",description:"Exception description"});
  const c=components(new Map(),value=>({...value,seriesId:null,occurrenceIndex:null,isException:false}));
  const props={initial:{data:{...data([b]),options:{canManage:true,people:[],workRoles:[],jobs:[],customers:[],facilities:[],contacts:[],error:null}},entitlements:{withheld:[]}},initialInput:input,readAction:async()=>{throw new Error("not used");}};
  const view=children(c.render(()=>c.workspace(props))).find(node=>typeof node.props.onEdit==="function")!;
  const proposal={booking:b,startsAt:"2026-10-13T09:00:00Z",endsAt:"2026-10-13T11:00:00Z",assigneeIds:["destination"]};
  invoke(view,"onEdit",proposal);
  const editor=children(c.render(()=>c.workspace(props))).find(node=>node.props.bookingId===b.id)!;
  assert.equal(editor.props.seriesId,b.seriesId);
  assert.deepEqual({...editor.props.proposal as Record<string,unknown>},{startsAt:proposal.startsAt,endsAt:proposal.endsAt,assigneeIds:proposal.assigneeIds});
  assert.equal((editor.props.draft as Record<string,unknown>).description,b.description);
});
