"use client";
import { useId } from "react";
import type { TimeReportBookingPrefill, TimeReportDraft } from "@/features/time-reports/types";

export const timeReportFieldClass="min-h-12 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

export const timeReportButtonClass="min-h-12 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60";

export function TimeReportForm({draft,state,onChange,onSubmit,onRetry,jobs=[],bookings=[],onBookingChange}:{readonly draft:TimeReportDraft;readonly state:{status:string;message?:string};readonly onChange?:(patch:Partial<TimeReportDraft>)=>void;readonly onSubmit:()=>void;readonly onRetry:()=>void;readonly jobs?:readonly {id:string;label:string}[];readonly bookings?:readonly TimeReportBookingPrefill[];readonly onBookingChange?:(id:string)=>void}) {

 const id=useId(),locked=["pending","unknown","confirmed"].includes(state.status),mode=draft.mode??"hours";

 return <form className="space-y-4" onSubmit={event=>{event.preventDefault();if(!locked)onSubmit();}}>

  <p role="status" aria-live="polite" className="text-sm font-medium">{state.status==="confirmed"?<><span data-testid="time-report-submit-status">Rapporterad</span> · sparad i systemet</>:state.status==="pending"?"Sparar…":"Osänd"}</p>

  {draft.exactPrefillUnavailable&&<p className="text-sm text-amber-900">Bokningens exakta intervall kan inte förifyllas som hela minuter. Ange rapporterad tid.</p>}

  {state.message&&<p id={`${id}-error`} role="alert" className="text-sm text-red-800">{state.message}</p>}

  <fieldset disabled={locked} aria-describedby={state.message?`${id}-error`:undefined} className="space-y-4 disabled:opacity-70">

   {bookings.length>0&&<label className="block space-y-1"><span>Bokning (valfri)</span><select className={timeReportFieldClass} value={draft.bookingId??""} onChange={event=>onBookingChange?.(event.target.value)}><option value="">Utan bokning</option>{bookings.map(booking=><option key={booking.bookingId} value={booking.bookingId}>{booking.date} · {booking.jobLabel??"Bokning"}</option>)}</select></label>}

   <label className="block space-y-1"><span>Datum</span><input required type="date" aria-label="Datum" className={timeReportFieldClass} value={draft.date} onChange={event=>onChange?.({date:event.target.value})}/></label>

   <label className="block space-y-1"><span>Ange tid som</span><select className={timeReportFieldClass} value={mode} onChange={event=>onChange?.({mode:event.target.value as "hours"|"interval"})}><option value="hours">Antal timmar</option><option value="interval">Start och slut</option></select></label>

   {mode==="hours"?<label className="block space-y-1"><span>Timmar</span><input required inputMode="decimal" type="text" aria-label="Timmar" className={timeReportFieldClass} value={draft.hours} onChange={event=>onChange?.({hours:event.target.value})}/><span className="text-sm text-zinc-600">Exempel: 1,25 = 1 timme 15 minuter. Hela minuter krävs.</span></label>:<div className="space-y-3"><p className="text-sm text-zinc-600">Start och slut i svensk tid (Europe/Stockholm).</p><label className="block space-y-1"><span>Start</span><input required type="datetime-local" className={timeReportFieldClass} value={draft.startsAtLocal??""} onChange={event=>onChange?.({startsAtLocal:event.target.value,...(draft.date===draft.startsAtLocal?.slice(0,10)?{date:event.target.value.slice(0,10)}:{})})}/></label><label className="block space-y-1"><span>Slut</span><input required type="datetime-local" className={timeReportFieldClass} value={draft.endsAtLocal??""} onChange={event=>onChange?.({endsAtLocal:event.target.value})}/></label></div>}

   {draft.bookingId?<div className="space-y-2"><p className="text-sm">Kopplad till bokning. Tiden kan justeras.</p><label className="block space-y-1"><span>Jobb</span><select aria-label="Jobb" disabled className={timeReportFieldClass} value={draft.jobId??""}><option value={draft.jobId??""}>{draft.jobId?jobs.find(job=>job.id===draft.jobId)?.label??"Kopplat jobb":"Utan jobb"}</option></select></label></div>:<label className="block space-y-1"><span>Jobb (valfritt)</span><select aria-label="Jobb" className={timeReportFieldClass} value={draft.jobId??""} onChange={event=>onChange?.({jobId:event.target.value||null})}><option value="">Utan jobb</option>{jobs.map(job=><option key={job.id} value={job.id}>{job.label}</option>)}</select></label>}

   <label className="block space-y-1"><span>Anteckning (valfri)</span><textarea aria-label="Anteckning" maxLength={2000} rows={3} className={timeReportFieldClass} value={draft.note} onChange={event=>onChange?.({note:event.target.value})}/></label>

  </fieldset>

  {state.status==="unknown"?<div className="space-y-2"><p className="text-sm">Svaret saknas. Uppgifterna är låsta tills samma försök har bekräftats.</p><button type="button" onClick={onRetry} className={timeReportButtonClass}>Försök igen med samma försök</button></div>:state.status!=="confirmed"&&<div className="sticky bottom-0 bg-white py-2"><button type="submit" disabled={locked} className={`${timeReportButtonClass} w-full bg-blue-700 text-white`}>{state.status==="pending"?"Sparar…":"Rapportera tid"}</button></div>}

 </form>;

}

