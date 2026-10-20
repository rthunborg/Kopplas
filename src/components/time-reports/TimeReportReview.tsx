"use client";
import { useEffect, useRef, useState } from "react";
import { annotateTimeReportAction } from "@/features/time-reports/actions";
import { formatReportMinutes, reportedBookedDelta } from "@/features/time-reports/domain";
import { annotationOutcomeAfter, timeReportNavigationAllowed } from "@/features/time-reports/action-state";
import { normalizeReportNote } from "@/features/time-reports/validation";
import type { AnnotationInput, TimeReport, TimeReportMutationResult } from "@/features/time-reports/types";
import { TimeReportLinks } from "./PersonalTimesheet";
import { timeReportButtonClass, timeReportFieldClass } from "./TimeReportForm";
type ReviewReport=Pick<TimeReport,"id"|"date"|"minutes"|"bookedMinutesAtFiling"|"bookingId"|"jobId"|"status"|"note"|"reviewNote"|"reviewRevision">&Partial<TimeReport>;
export function TimeReportReview({report,canReview,onAnnotate,onSaved,onRefresh,onBusyChange,onDirtyChange}:{readonly report:ReviewReport;readonly canReview:boolean;readonly onAnnotate?:(input:AnnotationInput)=>Promise<TimeReportMutationResult>|void;readonly onSaved?:()=>void;readonly onRefresh?:()=>void;readonly onBusyChange?:(busy:boolean)=>void;readonly onDirtyChange?:(dirty:boolean)=>void}) {
 const [note,setNote]=useState(report.reviewNote??""),[state,setState]=useState<{status:string;message?:string;hasUnknownOutcome?:boolean}>({status:"draft"}),outcome=useRef<{status:string;hasUnknownOutcome?:boolean}>({status:"draft"}),attempt=useRef<AnnotationInput|null>(null),busy=useRef(false);
 useEffect(()=>{const guard=(event:BeforeUnloadEvent)=>{if(state.status==="pending"||state.status==="unknown"||(state.status!=="confirmed"&&note!==(report.reviewNote??""))){event.preventDefault();}};window.addEventListener("beforeunload",guard);return()=>window.removeEventListener("beforeunload",guard);},[state.status,note,report.reviewNote]);
 const locked=["pending","unknown","confirmed","refresh-required"].includes(state.status),delta=reportedBookedDelta(report);
 async function save(retry=false){if(busy.current)return;if(!retry){if(attempt.current)return;const normalized=normalizeReportNote(note);if(!normalized.ok){setState({status:"error",message:"Anteckningen får ha högst 2 000 tecken."});return;}attempt.current=Object.freeze({attemptId:crypto.randomUUID(),reportId:report.id,expectedRevision:report.reviewRevision,note:normalized.value});}
  if(!attempt.current)return;busy.current=true;onBusyChange?.(true);outcome.current=annotationOutcomeAfter(outcome.current,"pending");setState(outcome.current);
  function settle(event:"success"|"unknown"|"stale"|"rejected",message?:string){outcome.current=annotationOutcomeAfter(outcome.current,event);setState({...outcome.current,message});if(outcome.current.status==="error"||outcome.current.status==="refresh-required")attempt.current=null;}
  try {const result=await(onAnnotate??annotateTimeReportAction)(attempt.current);
   if(!result){settle("rejected","Anteckningen kunde inte bekräftas.");return;}
   if(result.status==="success"){settle("success");onDirtyChange?.(false);try{onSaved?.();}catch{}}
   else if(result.uncertain)settle("unknown",result.message);
   else if(result.code==="COMMAND_CONFLICT")settle("stale","Noteringen har ändrats eller försöket är inaktuellt. Läs in tidrapporten igen.");
   else settle("rejected",result.message);
  }catch{settle("unknown","Anslutning krävs. Samma notering måste bekräftas innan den ändras.");}finally{busy.current=false;onBusyChange?.(outcome.current.status==="unknown");}
 }
 function guardNavigation(event:React.MouseEvent<HTMLAnchorElement>){if(!timeReportNavigationAllowed({status:outcome.current.status,dirty:state.status!=="confirmed"&&note!==(report.reviewNote??"")},()=>window.confirm("Du har osparade ändringar. Lämna utan att spara?")))event.preventDefault();}

 return <section className="space-y-4" aria-label="Tidrapport"><p>{report.personLabel??"Tidrapport"} · <time dateTime={report.date}>{report.date}</time></p><p className="font-medium">Rapporterad · {formatReportMinutes(report.minutes)}</p>{report.note&&<p className="break-words whitespace-pre-wrap">{report.note}</p>}<TimeReportLinks report={report} onNavigate={guardNavigation}/>
  {report.bookedMinutesAtFiling!==null&&<div className="rounded-md border border-zinc-200 p-3"><p><span>Bokad tid vid rapportering</span>: <span data-testid="time-report-booked-at-filing">{formatReportMinutes(report.bookedMinutesAtFiling)}</span></p><p className={delta===0?"text-sm":"text-sm font-medium text-amber-900"}>Skillnad för denna rapport mot bokat vid rapportering: <span data-testid="time-report-booked-delta">{delta!>0?"+":delta!<0?"−":""}{formatReportMinutes(Math.abs(delta!))}</span></p></div>}
  {report.reviewedAt&&state.status!=="confirmed"&&<p data-testid="time-report-review-attribution" className="text-sm text-zinc-600">Antecknad av {report.reviewedBy??"granskare"} · <time dateTime={report.reviewedAt}>{new Date(report.reviewedAt).toLocaleString("sv-SE",{timeZone:"Europe/Stockholm"})}</time> · version {report.reviewRevision}</p>}
  {canReview?<form className="space-y-3" onSubmit={event=>{event.preventDefault();if(!locked)return save();}}><label className="block space-y-1"><span>Granskningsanteckning</span><textarea aria-label="Granskningsanteckning" rows={4} maxLength={2000} disabled={locked} className={timeReportFieldClass} value={note} onChange={event=>{if(!attempt.current){setNote(event.target.value);onDirtyChange?.(event.target.value!==(report.reviewNote??""));}}}/></label><p className="text-sm text-zinc-600">En tom anteckning rensar noteringen. Rapporterad tid ändras inte.</p><p role="status" aria-live="polite">{state.status==="pending"?"Sparar…":state.status==="confirmed"?<span data-testid="time-report-review-status">Anteckningen är sparad.</span>:state.status==="unknown"?"Osänd notering":""}</p>{state.message&&<p role="alert" className="text-sm text-red-800">{state.message}</p>}{state.status==="unknown"?<button type="button" className={timeReportButtonClass} onClick={()=>save(true)}>Försök igen med samma försök</button>:state.status==="refresh-required"?<button type="button" className={timeReportButtonClass} onClick={onRefresh}>Läs in igen</button>:<button type="submit" disabled={locked} className={timeReportButtonClass}>Spara anteckning</button>}</form>:report.reviewNote&&<p className="whitespace-pre-wrap">Granskningsnotering: {report.reviewNote}</p>}
 </section>;
}
