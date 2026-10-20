"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/crm/Dialog";
import { fileTimeReportAction } from "@/features/time-reports/actions";
import { normalizeReportNote, parseReportHours, validateReportInput } from "@/features/time-reports/validation";
import { reportLocalInput, reportMinutesBetween, reportMinutesFromLocalInterval, reportToday } from "@/features/time-reports/domain";
import type { ReportInput, TimeReportBookingPrefill, TimeReportDraft } from "@/features/time-reports/types";
import { TimeReportForm, timeReportButtonClass } from "./TimeReportForm";

function initialDraft(prefill?:TimeReportBookingPrefill):TimeReportDraft{return {date:prefill?.date??reportToday(),hours:prefill?(prefill.minutes===null?"":String(prefill.minutes/60)):"1",note:"",bookingId:prefill?.bookingId??null,jobId:prefill?.jobId??null,mode:prefill&&prefill.minutes!==null?"interval":"hours",exactPrefillUnavailable:prefill?.minutes===null,startsAtLocal:prefill?reportLocalInput(prefill.startsAt):"",endsAtLocal:prefill?reportLocalInput(prefill.endsAt):""};}

/** Reusable own-report capture; the checked command remains the authorization boundary. */

export function TimeReportEntry({prefill,jobs=[],bookings=[],onSaved,label}:{readonly prefill?:TimeReportBookingPrefill;readonly jobs?:readonly {id:string;label:string}[];readonly bookings?:readonly TimeReportBookingPrefill[];readonly onSaved?:()=>void;readonly label?:string}) {

 const router=useRouter(),[open,setOpen]=useState(false),[draft,setDraft]=useState(()=>initialDraft(prefill)),[state,setState]=useState<{status:string;message?:string}>({status:"draft"}),[discard,setDiscard]=useState(false);

 const attempt=useRef<ReportInput|null>(null),inFlight=useRef(false),original=useRef(prefill),dirty=useRef(false);

 const unresolved=state.status==="unknown"||state.status==="pending";

 useEffect(()=>{if(!open)return;const guard=(event:BeforeUnloadEvent)=>{if(unresolved||dirty.current){event.preventDefault();}};window.addEventListener("beforeunload",guard);return()=>window.removeEventListener("beforeunload",guard);},[open,unresolved]);

 function close(){if(unresolved)return;if(dirty.current&&state.status!=="confirmed"){setDiscard(true);return;}setOpen(false);}

 function change(patch:Partial<TimeReportDraft>){if(inFlight.current||attempt.current)return;dirty.current=true;setDraft(row=>({...row,...patch}));setState({status:"draft"});}

 function chooseBooking(id:string){if(inFlight.current||attempt.current)return;const chosen=bookings.find(row=>row.bookingId===id);original.current=chosen;dirty.current=true;setDraft(row=>chosen?{...initialDraft(chosen),note:row.note}:{...row,bookingId:null,jobId:null,exactPrefillUnavailable:false});setState({status:"draft"});}

 async function submit(retry=false){

  if(inFlight.current)return;

  if(!retry){if(attempt.current)return;const source=original.current;const minutes=draft.mode==="interval"?(source&&draft.startsAtLocal===reportLocalInput(source.startsAt)&&draft.endsAtLocal===reportLocalInput(source.endsAt)?reportMinutesBetween(source.startsAt,source.endsAt):reportMinutesFromLocalInterval(draft.startsAtLocal??"",draft.endsAtLocal??"")):parseReportHours(draft.hours);const note=normalizeReportNote(draft.note);

   if(minutes===null||!note.ok){setState({status:"rejected",message:"Ange en positiv tid i hela minuter och högst 2 000 tecken i anteckningen."});return;}

   const validated=validateReportInput({attemptId:crypto.randomUUID(),date:draft.date,minutes,note:note.value,bookingId:draft.bookingId,jobId:draft.jobId});if(!validated.ok){setState({status:"rejected",message:"Kontrollera datum och tid."});return;}attempt.current=Object.freeze(validated.data);

  }

  if(!attempt.current)return;inFlight.current=true;setState({status:"pending"});

  try{const result=await fileTimeReportAction(attempt.current);if(result.status==="success"){dirty.current=false;setState({status:"confirmed"});try{onSaved?.();router.refresh();}catch{}}else if(result.uncertain){setState({status:"unknown",message:result.message});}else{attempt.current=null;setState({status:"rejected",message:result.message});}}

  catch{setState({status:"unknown",message:"Anslutning krävs. Försök igen med samma uppgifter."});}finally{inFlight.current=false;}

 }

 return <><button type="button" data-testid={prefill?`time-report-entry-${prefill.bookingId}`:"new-time-report"} className={timeReportButtonClass} onClick={()=>{original.current=prefill;setDraft(initialDraft(prefill));setState({status:"draft"});attempt.current=null;dirty.current=false;setDiscard(false);setOpen(true);}}>{label??(prefill?"Rapportera tid":"Ny tidrapport")}</button>

  <Dialog open={open} title="Ny tidrapport" variant="sheet" onClose={close} busy={unresolved}>

   {discard?<div className="space-y-4"><p>Du har osparade ändringar. Vill du lämna formuläret?</p><button type="button" className={timeReportButtonClass} onClick={()=>setDiscard(false)}>Fortsätt redigera</button><button type="button" className={timeReportButtonClass} onClick={()=>{dirty.current=false;setOpen(false);}}>Lämna utan att spara</button></div>:<TimeReportForm draft={draft} state={state} onChange={change} onSubmit={()=>void submit()} onRetry={()=>void submit(true)} jobs={jobs} bookings={bookings} onBookingChange={chooseBooking}/>}

  </Dialog>

 </>;

}

