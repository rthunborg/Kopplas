/** Rendered-state and actual TSX controller tests. The VM substitutes hook scheduling
 * and action transport; DOM focus, network, authorization and physical persistence
 * remain the separate essential browser/database lanes. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as attemptState from "@/features/time-reports/action-state";
import * as reportDomain from "@/features/time-reports/domain";
import * as reportValidation from "@/features/time-reports/validation";
import * as formModule from "@/components/time-reports/TimeReportForm";
import * as personalModule from "@/components/time-reports/PersonalTimesheet";
import { TimeReportEntry } from "@/components/time-reports/TimeReportEntry";
import type { ReportInput, TimeReportBookingPrefill, TimeReportMutationResult, TimeReportReadResult } from "@/features/time-reports/types";
import * as jsxRuntime from "react/jsx-runtime";
import { describe, expect, test, vi } from "vitest";
import { createElement, isValidElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TimeReportForm } from "@/components/time-reports/TimeReportForm";
import { PersonalTimesheet } from "@/components/time-reports/PersonalTimesheet";
import { TimeReportReview } from "@/components/time-reports/TimeReportReview";

describe("15.4-COMP-001 honest accessible report states (SSR only)", () => {
  test("confirmed filing exposes the exact persisted-success browser seam", () => {
    const html = renderToStaticMarkup(createElement(TimeReportForm, {
      draft: { date: "2026-10-20", hours: "1", note: "", bookingId: null, jobId: null },
      state: { status: "confirmed" }, onSubmit: () => {}, onRetry: () => {},
    }));
    expect(html).toContain('data-testid="time-report-submit-status">Rapporterad</span>');
    expect(html).toContain("sparad i systemet");
  });

  test("[P1] 15.4-COMP-001A AC1 AC2 unsent failure retains labelled values and explicit retry", async () => {
    const html = renderToStaticMarkup(createElement(TimeReportForm, {
      draft: { date: "2026-10-20", hours: "1,25", note: "Behåll anteckningen", bookingId: null, jobId: null },
      state: { status: "unknown", message: "Anslutning krävs" }, onSubmit: () => {}, onRetry: () => {},
    }));
    expect(html).toContain("Osänd");
    expect(html).toContain("1,25");
    expect(html).toContain("Behåll anteckningen");
    expect(html).toContain("Försök igen");
    expect(html).not.toContain("Rapporterad");
    expect(html).toMatch(/<label|aria-label=/);
  });

  test("[P1] 15.4-COMP-001B AC2 pending is announced without submitted success", async () => {
    const html = renderToStaticMarkup(createElement(TimeReportForm, {
      draft: { date: "2026-10-20", hours: "1", note: "", bookingId: null, jobId: null },
      state: { status: "pending" }, onSubmit: () => {}, onRetry: () => {},
    }));
    expect(html).toContain("Sparar");
    expect(html).toMatch(/role="status"|aria-live=/);
    expect(html).not.toContain("Rapporterad");
  });

  test("[P1] 15.4-COMP-001C AC3 failed week read is connection error with retry rather than zero total", async () => {
    const html = renderToStaticMarkup(createElement(PersonalTimesheet, {
      result: { ok: false, code: "READ_FAILED" }, weekStart: "2026-10-19", onRetry: () => {},
    }));
    expect(html).toContain("Anslutning krävs");
    expect(html).toContain("Försök igen");
    expect(html).not.toMatch(/0(?:[,.]0+)?\s*(?:h|timmar)/);
    expect(html).not.toContain("Inga tidrapporter");
  });

  test("[P1] 15.4-COMP-001D AC4 AC9 standalone comparison remains absent and review cannot approve", async () => {
    const html = renderToStaticMarkup(createElement(TimeReportReview, {
      report: { id: "standalone", date: "2026-10-20", minutes: 75, bookedMinutesAtFiling: null,
        bookingId: null, jobId: null, status: "submitted", note: "Fältarbete", reviewNote: null, reviewRevision: 0 },
      canReview: true, onAnnotate: () => {},
    }));
    expect(html).toContain("Fältarbete");
    expect(html).not.toMatch(/Bokat[^<]*0|Godkänn|Avvisa|Fakturera|kr\/h/);
    expect(html).toMatch(/Anteckning|Granskningsnotering|Granskningsanteckning/);
  });
});

describe("fractional booked-minute provenance", () => {
  test("unavailable exact prefill is honest and requires explicit reported hours", () => {
    const html=renderToStaticMarkup(createElement(TimeReportForm, {
      draft:{date:"2026-10-20",hours:"",note:"",bookingId:"booking",jobId:null,mode:"hours",exactPrefillUnavailable:true},
      state:{status:"draft"},onSubmit:()=>{},onRetry:()=>{},
    }));
    expect(html).toContain("Bokningens exakta intervall kan inte förifyllas som hela minuter. Ange rapporterad tid.");
    expect(html).toMatch(/aria-label="Timmar"[^>]*value=""/);
    expect(html).toContain("Osänd");
    expect(html).not.toContain("time-report-submit-status");
  });
  test("review preserves fractional booked provenance and comparison without rounding", () => {
    const html=renderToStaticMarkup(createElement(TimeReportReview, {
      report:{id:"fractional",date:"2026-10-20",minutes:75,bookedMinutesAtFiling:90.5,bookingId:"booking",jobId:null,status:"submitted",note:null,reviewNote:null,reviewRevision:0},
      canReview:true,onAnnotate:()=>{},
    }));
    expect(html).toContain('data-testid="time-report-booked-at-filing">1 h 30,5 min');
    expect(html).toContain('data-testid="time-report-booked-delta">−0 h 15,5 min');
  });
});

/** Execute the actual TSX controllers and their rendered event handlers. This bounded
 * VM substitutes hook scheduling, router effects and action transport only. It does
 * not claim DOM focus, network, authorization, database persistence or browser proof. */
type ControllerNode=ReactElement<Record<string,unknown>>;
function findControllerNode(tree:unknown,predicate:(node:ControllerNode)=>boolean):ControllerNode {
  if(Array.isArray(tree)){for(const child of tree){try{return findControllerNode(child,predicate);}catch{}}}
  else if(isValidElement(tree)){const node=tree as ControllerNode;if(predicate(node))return node;return findControllerNode(node.props.children,predicate);}
  throw new Error("Actual controller node not found");
}
function controllerText(tree:unknown):string {if(Array.isArray(tree))return tree.map(controllerText).join("");if(isValidElement(tree))return controllerText((tree.props as Record<string,unknown>).children);return typeof tree==="string"||typeof tree==="number"?String(tree):"";}
function fire(node:ControllerNode,event:string,value?:unknown):unknown {const handler=node.props[event];if(typeof handler!=="function")throw new Error(`Missing actual ${event} handler`);return handler(value);}
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(done=>{resolve=done;});return {promise,resolve};}
function actualController(name:"TimeReportEntry"|"TimeReportReview"|"TimeReportWorkspace",props:Record<string,unknown>,actions:Record<string,unknown>={}) {
  const slots:unknown[]=[];let cursor=0;
  const confirm=vi.fn(()=>false),refresh=vi.fn();
  const hooks={useState:(initial:unknown)=>{const i=cursor++;if(!(i in slots))slots[i]=typeof initial==="function"?initial():initial;return [slots[i],(value:unknown)=>{slots[i]=typeof value==="function"?value(slots[i]):value;}];},useRef:(initial:unknown)=>{const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},useEffect:()=>{},useId:()=>"controller-id"};
  const modules:Record<string,unknown>={react:hooks,"react/jsx-runtime":jsxRuntime,"next/navigation":{useRouter:()=>({refresh})},"@/components/crm/Dialog":{Dialog:"Dialog"},"@/features/time-reports/actions":actions,"@/features/time-reports/action-state":attemptState,"@/features/time-reports/domain":reportDomain,"@/features/time-reports/validation":reportValidation,"./TimeReportForm":formModule,"./PersonalTimesheet":personalModule,"./TimeReportEntry":{TimeReportEntry},"./TimeReportReview":{TimeReportReview}};
  const source=readFileSync(resolve(process.cwd(),`src/components/time-reports/${name}.tsx`),"utf8");
  const output=ts.transpileModule(source,{fileName:`${name}.tsx`,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const exported:Record<string,unknown>={};
  runInNewContext(output,{exports:exported,require:(key:string)=>{if(!(key in modules))throw new Error(`Unexpected controller dependency ${key}`);return modules[key];},crypto:globalThis.crypto,window:{confirm,addEventListener(){},removeEventListener(){}}});
  const component=exported[name] as (props:Record<string,unknown>)=>unknown;
  return {render:()=>{cursor=0;return component(props);},confirm,refresh};
}
function entryController(prefill?:TimeReportBookingPrefill,responses:TimeReportMutationResult[]=[{status:"success",reportId:"confirmed"}],bookings:readonly TimeReportBookingPrefill[]=[]) {
 const requests:ReportInput[]=[];const controller=actualController("TimeReportEntry",{prefill,bookings},{fileTimeReportAction:async(input:ReportInput)=>{requests.push(input);const result=responses.shift();if(!result)throw new Error("Missing owned action response");return result;}});
 fire(findControllerNode(controller.render(),node=>node.type==="button"),"onClick");
 const form=()=>findControllerNode(controller.render(),node=>node.type===TimeReportForm);
 return {...controller,form,requests};
}
const ownPrefill:TimeReportBookingPrefill={bookingId:"5cc959bf-c106-45c3-8241-44f1101c6860",date:"2026-10-25",startsAt:"2026-10-25T01:30:00Z",endsAt:"2026-10-25T02:30:00Z",minutes:60,jobId:null};
const reviewReport={id:"2b538f2c-37a5-45e6-baca-03db78dbb21b",date:"2026-10-20",minutes:75,bookedMinutesAtFiling:60.1,bookingId:ownPrefill.bookingId,jobId:"a0a2a2c6-6aad-4cc4-95a9-7a1c7419bd86",status:"submitted",note:null,reviewNote:null,reviewRevision:2};

describe("actual time report controller interaction regressions",()=>{
 test("R1-01 a lost response then authority denial retains the exact attempt and editing lock until confirmation",async()=>{
  const entry=entryController(undefined,[{status:"error",code:"SERVER_ERROR",message:"Lost response",uncertain:true},{status:"error",code:"PERMISSION_DENIED",message:"Access denied",uncertain:false},{status:"success",reportId:"same-report"}]);
  fire(entry.form(),"onChange",{hours:"1,25",note:"Retain this note"});await fire(entry.form(),"onSubmit");
  expect((entry.form().props.state as {status:string}).status).toBe("unknown");await fire(entry.form(),"onRetry");
  expect((entry.form().props.state as {status:string}).status).toBe("unknown");
  fire(entry.form(),"onChange",{note:"Must not replace the uncertain payload"});expect((entry.form().props.draft as {note:string}).note).toBe("Retain this note");
  expect(renderToStaticMarkup(createElement(TimeReportForm,entry.form().props as Parameters<typeof TimeReportForm>[0]))).toContain('fieldset disabled=""');
  await fire(entry.form(),"onRetry");expect((entry.form().props.state as {status:string}).status).toBe("confirmed");
  expect(entry.requests).toHaveLength(3);expect(entry.requests[1]).toBe(entry.requests[0]);expect(entry.requests[2]).toBe(entry.requests[0]);expect(Object.isFrozen(entry.requests[0])).toBe(true);
 });
 test("R1-02 actual filing preserves the late fold start when only the local end changes",async()=>{
  const entry=entryController(ownPrefill);fire(entry.form(),"onChange",{endsAtLocal:"2026-10-25T04:30"});await fire(entry.form(),"onSubmit");expect(entry.requests[0].minutes).toBe(120);
  const micros=entryController({...ownPrefill,startsAt:"2026-10-25T01:30:00.000001Z",endsAt:"2026-10-25T02:30:00.000001Z"});
  fire(micros.form(),"onChange",{endsAtLocal:"2026-10-25T04:30"});await fire(micros.form(),"onSubmit");expect(micros.requests).toHaveLength(0);expect((micros.form().props.state as {status:string}).status).toBe("rejected");
  const unchangedEnd=entryController({...ownPrefill,startsAt:"2026-10-25T00:30:00Z",endsAt:"2026-10-25T02:30:00.000001Z",minutes:null});
  fire(unchangedEnd.form(),"onChange",{mode:"interval",startsAtLocal:"2026-10-25T02:00"});await fire(unchangedEnd.form(),"onSubmit");expect(unchangedEnd.requests).toHaveLength(0);
 });
 test("R1-03 actual hours mode keeps canonical twenty minutes, but explicit rounded input cannot file",async()=>{
  const source={...ownPrefill,startsAt:"2026-10-20T06:00:00Z",endsAt:"2026-10-20T06:20:00Z",date:"2026-10-20",minutes:20};
  const entry=entryController(source);fire(entry.form(),"onChange",{mode:"hours"});await fire(entry.form(),"onSubmit");expect(entry.requests[0].minutes).toBe(20);
  const edited=entryController(source);fire(edited.form(),"onChange",{mode:"hours"});fire(edited.form(),"onChange",{hours:"0.3333333333333333"});await fire(edited.form(),"onSubmit");expect(edited.requests).toHaveLength(0);
 });
 test("R1-04 actual standalone first start defaults its day until date is explicitly chosen",()=>{
  const entry=entryController();fire(entry.form(),"onChange",{mode:"interval"});fire(entry.form(),"onChange",{startsAtLocal:"2026-10-12T23:30"});expect((entry.form().props.draft as {date:string}).date).toBe("2026-10-12");
  fire(entry.form(),"onChange",{date:"2026-10-14"});fire(entry.form(),"onChange",{startsAtLocal:"2026-10-13T00:30"});expect((entry.form().props.draft as {date:string}).date).toBe("2026-10-14");
 });
 test("R1-05 actual booking links confirm dirty discard and block pending/unknown navigation without losing the note",async()=>{
  const pending=deferred<TimeReportMutationResult>(),requests:unknown[]=[];
  const review=actualController("TimeReportReview",{report:reviewReport,canReview:true,onAnnotate:(input:unknown)=>{requests.push(input);return pending.promise;}});
  const note=()=>findControllerNode(review.render(),node=>node.type==="textarea");
  fire(note(),"onChange",{target:{value:"Unsaved review note"}});
  const clickLink=(href="/scheduling",event="onClick")=>{const links=findControllerNode(review.render(),node=>node.type===personalModule.TimeReportLinks);const rendered=personalModule.TimeReportLinks(links.props as Parameters<typeof personalModule.TimeReportLinks>[0]);const link=findControllerNode(rendered,node=>node.props.href===href);const preventDefault=vi.fn();fire(link,event,{preventDefault});return preventDefault;};
  expect(clickLink()).toHaveBeenCalledOnce();expect(review.confirm).toHaveBeenCalledOnce();expect(note().props.value).toBe("Unsaved review note");
  expect(clickLink(`/jobs/${reviewReport.jobId}`)).toHaveBeenCalledOnce();expect(review.confirm).toHaveBeenCalledTimes(2);
  review.confirm.mockReturnValueOnce(true);expect(clickLink()).not.toHaveBeenCalled();
  const saving=fire(findControllerNode(review.render(),node=>node.type==="form"),"onSubmit",{preventDefault(){}});
  expect(clickLink()).toHaveBeenCalledOnce();expect(review.confirm).toHaveBeenCalledTimes(3);
  expect(clickLink(`/jobs/${reviewReport.jobId}`,"onAuxClick")).toHaveBeenCalledOnce();
  pending.resolve({status:"error",code:"SERVER_ERROR",message:"Lost annotation response",uncertain:true});await saving;
  expect(clickLink()).toHaveBeenCalledOnce();expect(clickLink(`/jobs/${reviewReport.jobId}`)).toHaveBeenCalledOnce();expect(review.confirm).toHaveBeenCalledTimes(3);expect(note().props.value).toBe("Unsaved review note");expect(note().props.disabled).toBe(true);expect(requests).toHaveLength(1);
 });
 test("R1-08 actual stale annotation locks editing, requires refresh and never calls onSaved",async()=>{
  const onSaved=vi.fn(),review=actualController("TimeReportReview",{report:reviewReport,canReview:true,onSaved,onAnnotate:async()=>({status:"error",code:"COMMAND_CONFLICT",message:"stale",uncertain:false})});
  fire(findControllerNode(review.render(),node=>node.type==="textarea"),"onChange",{target:{value:"Stale annotation"}});
  await fire(findControllerNode(review.render(),node=>node.type==="form"),"onSubmit",{preventDefault(){}});
  expect(findControllerNode(review.render(),node=>node.type==="textarea").props.disabled).toBe(true);expect(controllerText(review.render())).toContain("Läs in tidrapporten igen.");expect(controllerText(review.render())).toContain("Läs in igen");expect(controllerText(review.render())).not.toContain("Anteckningen är sparad.");expect(onSaved).not.toHaveBeenCalled();
 });
 test("R1-09 actual workspace keeps the newest selection when an older read resolves later",async()=>{
  const result=(weekStart:string,totalMinutes:number):TimeReportReadResult=>({ok:true,status:"success",data:{userId:"own",canReportOwn:true,canReview:false,weekStart,reports:[],bookedDates:[],jobs:[],people:[],bookings:[],prefill:null,totalMinutes,missingDates:[],byPerson:[],byJob:[]}});
  const first=deferred<TimeReportReadResult>(),second=deferred<TimeReportReadResult>();let count=0;
  const workspace=actualController("TimeReportWorkspace",{initial:result("2026-10-05",1),initialQuery:{mode:"own",weekStart:"2026-10-05"},readAction:()=>++count===1?first.promise:second.promise});
  const date=()=>findControllerNode(workspace.render(),node=>node.type==="input"&&node.props.type==="date");
  const old=fire(date(),"onChange",{target:{value:"2026-10-12"}}),latest=fire(date(),"onChange",{target:{value:"2026-10-19"}});
  second.resolve(result("2026-10-19",19));await latest;first.resolve(result("2026-10-12",12));await old;
  expect(date().props.value).toBe("2026-10-19");const sheet=findControllerNode(workspace.render(),node=>node.type===PersonalTimesheet);expect((sheet.props.result as Extract<TimeReportReadResult,{ok:true}>).data.totalMinutes).toBe(19);expect(sheet.props.weekStart).toBe("2026-10-19");
 });
 test("R1-07 actual review markup preserves raw decimal booked provenance and exact decimal delta",()=>{
  const html=renderToStaticMarkup(createElement(TimeReportReview,{report:{...reviewReport,status:"submitted"},canReview:true}));
  expect(html).toContain('data-testid="time-report-booked-at-filing">1 h 0,1 min');expect(html).toContain('data-testid="time-report-booked-delta">+0 h 14,9 min');expect(html).not.toContain("14,899999999999999");
 });
 test("R2-01 actual booking detachment keeps twenty canonical minutes in hours mode and clears both relationships",async()=>{
  const source={...ownPrefill,startsAt:"2026-10-20T06:00:00Z",endsAt:"2026-10-20T06:20:00Z",date:"2026-10-20",minutes:20,jobId:reviewReport.jobId};
  const entry=entryController(undefined,undefined,[source]);
  fire(entry.form(),"onBookingChange",source.bookingId);fire(entry.form(),"onChange",{mode:"hours",note:"Keep declared time"});fire(entry.form(),"onBookingChange","");
  await fire(entry.form(),"onSubmit");expect(entry.requests).toHaveLength(1);
  expect(entry.requests[0]).toMatchObject({date:source.date,minutes:20,bookingId:null,jobId:null,note:"Keep declared time"});
  expect((entry.form().props.state as {status:string}).status).toBe("confirmed");
  const edited=entryController(undefined,undefined,[source]);fire(edited.form(),"onBookingChange",source.bookingId);fire(edited.form(),"onChange",{mode:"hours"});fire(edited.form(),"onBookingChange","");fire(edited.form(),"onChange",{hours:"0.3333333333333333"});
  await fire(edited.form(),"onSubmit");expect(edited.requests).toHaveLength(0);expect((edited.form().props.state as {status:string}).status).toBe("rejected");
 });
 test("R2-02 actual booking detachment preserves unchanged late-fold UTC endpoints through standalone submission",async()=>{
  const source={...ownPrefill,jobId:reviewReport.jobId},entry=entryController(undefined,undefined,[source]);
  fire(entry.form(),"onBookingChange",source.bookingId);fire(entry.form(),"onBookingChange","");await fire(entry.form(),"onSubmit");
  expect(entry.requests).toHaveLength(1);expect(entry.requests[0]).toMatchObject({date:source.date,minutes:60,bookingId:null,jobId:null});
  expect((entry.form().props.state as {status:string}).status).toBe("confirmed");
  const adjusted=entryController(undefined,undefined,[source]);fire(adjusted.form(),"onBookingChange",source.bookingId);fire(adjusted.form(),"onBookingChange","");fire(adjusted.form(),"onChange",{endsAtLocal:"2026-10-25T04:30"});
  await fire(adjusted.form(),"onSubmit");expect(adjusted.requests[0]).toMatchObject({minutes:120,bookingId:null,jobId:null});
 });
});
