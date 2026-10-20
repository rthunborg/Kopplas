"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/crm/Dialog";
import { fileTimeReportAction } from "@/features/time-reports/actions";
import { normalizeReportNote, validateReportInput } from "@/features/time-reports/validation";
import { canEditTimeReportAttempt, timeReportAttemptAfter, timeReportDraftFromBooking, timeReportDraftMinutes, updateTimeReportDraft, type TimeReportAttempt } from "@/features/time-reports/action-state";
import type { ReportInput, TimeReportBookingPrefill, TimeReportDraft } from "@/features/time-reports/types";
import { TimeReportForm, timeReportButtonClass } from "./TimeReportForm";

/** Reusable own-report capture; the checked command remains the authorization boundary. */

export function TimeReportEntry({prefill,jobs=[],bookings=[],onSaved,label}:{readonly prefill?:TimeReportBookingPrefill;readonly jobs?:readonly {id:string;label:string}[];readonly bookings?:readonly TimeReportBookingPrefill[];readonly onSaved?:()=>void;readonly label?:string}) {

 const router=useRouter(),[open,setOpen]=useState(false),[draft,setDraft]=useState(()=>timeReportDraftFromBooking(prefill)),[state,setState]=useState<{status:string;message?:string}>({status:"draft"}),[discard,setDiscard]=useState(false);

 const attempt=useRef<TimeReportAttempt<ReportInput>|null>(null),inFlight=useRef(false),original=useRef(prefill),dirty=useRef(false);

 const unresolved=state.status==="unknown"||state.status==="pending";

 useEffect(()=>{if(!open)return;const guard=(event:BeforeUnloadEvent)=>{if(unresolved||dirty.current){event.preventDefault();}};window.addEventListener("beforeunload",guard);return()=>window.removeEventListener("beforeunload",guard);},[open,unresolved]);

 function close(){if(unresolved)return;if(dirty.current&&state.status!=="confirmed"){setDiscard(true);return;}setOpen(false);}

 function change(patch:Partial<TimeReportDraft>){if(inFlight.current||(attempt.current&&!canEditTimeReportAttempt(attempt.current)))return;dirty.current=true;setDraft(row=>updateTimeReportDraft(row,patch));setState({status:"draft"});}

 // Detachment changes relationships, not the existing duration or endpoint provenance.
 function chooseBooking(id:string){if(inFlight.current||attempt.current)return;const chosen=bookings.find(row=>row.bookingId===id);if(chosen)original.current=chosen;dirty.current=true;setDraft(row=>chosen?{...timeReportDraftFromBooking(chosen),note:row.note}:{...row,bookingId:null,jobId:null});setState({status:"draft"});}

 async function submit(retry=false){

  if(inFlight.current)return;

  if(!retry){if(attempt.current)return;const minutes=timeReportDraftMinutes(draft,original.current);const note=normalizeReportNote(draft.note);

   if(minutes===null||!note.ok){setState({status:"rejected",message:"Ange en positiv tid i hela minuter och högst 2 000 tecken i anteckningen."});return;}

   const validated=validateReportInput({attemptId:crypto.randomUUID(),date:draft.date,minutes,note:note.value,bookingId:draft.bookingId,jobId:draft.jobId});if(!validated.ok){setState({status:"rejected",message:"Kontrollera datum och tid."});return;}attempt.current={status:"pending",request:Object.freeze(validated.data)};

  }

  if(!attempt.current)return;if(retry)attempt.current=timeReportAttemptAfter(attempt.current,"retry");if(attempt.current.status!=="pending")return;inFlight.current=true;setState({status:"pending"});const sending=attempt.current;

  try{
   const result=await fileTimeReportAction(sending.request);
   attempt.current=timeReportAttemptAfter(sending,result.status==="success"?"success":result.uncertain?"unknown":"rejected");
   if(attempt.current.status==="confirmed"){dirty.current=false;setState({status:"confirmed"});try{onSaved?.();router.refresh();}catch{}}
   else {const status=attempt.current.status;setState({status,message:result.status==="error"?result.message:undefined});if(status==="rejected")attempt.current=null;}
  }catch{attempt.current=timeReportAttemptAfter(sending,"unknown");setState({status:"unknown",message:"Anslutning krävs. Försök igen med samma uppgifter."});}finally{inFlight.current=false;}

 }

 return <><button type="button" data-testid={prefill?`time-report-entry-${prefill.bookingId}`:"new-time-report"} className={timeReportButtonClass} onClick={()=>{original.current=prefill;setDraft(timeReportDraftFromBooking(prefill));setState({status:"draft"});attempt.current=null;dirty.current=false;setDiscard(false);setOpen(true);}}>{label??(prefill?"Rapportera tid":"Ny tidrapport")}</button>

  <Dialog open={open} title="Ny tidrapport" variant="sheet" onClose={close} busy={unresolved}>

   {discard?<div className="space-y-4"><p>Du har osparade ändringar. Vill du lämna formuläret?</p><button type="button" className={timeReportButtonClass} onClick={()=>setDiscard(false)}>Fortsätt redigera</button><button type="button" className={timeReportButtonClass} onClick={()=>{dirty.current=false;setOpen(false);}}>Lämna utan att spara</button></div>:<TimeReportForm draft={draft} state={state} onChange={change} onSubmit={()=>submit()} onRetry={()=>submit(true)} jobs={jobs} bookings={bookings} onBookingChange={chooseBooking}/>}

  </Dialog>

 </>;

}

