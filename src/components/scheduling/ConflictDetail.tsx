"use client";
import { CONFLICT_RULE_LABELS } from "@/features/scheduling/conflict-resolver";
import type { ResolverBooking,ResolverGroup } from "@/features/scheduling/conflict-resolver-types";
import type { BookingEditorOptions } from "@/features/resources/booking-action-state";
import { formatBookingTime } from "../resources/BookingConflictPanel";
export function ConflictDetail({group,bookings,options,target,onTarget,onAction,busy=false}:{group:ResolverGroup;bookings:readonly ResolverBooking[];options:BookingEditorOptions;
 target:string;onTarget:(id:string)=>void;onAction:(action:"move"|"reassign"|"adjust"|"accept"|"series")=>void;busy?:boolean}){
  return <section aria-label="Konfliktdetalj" className="space-y-4 rounded-lg border border-zinc-300 p-4">
    <h2 tabIndex={-1} id="conflict-detail-heading" className="font-semibold">{CONFLICT_RULE_LABELS[group.rule]}</h2>
    <p>{group.rule==="double_booking"?"Samma person är bokad på flera arbeten samtidigt.":group.rule==="over_capacity"?"Bokningarnas samlade tid överskrider den faktiska schemakapaciteten.":group.rule==="outside_work_hours"?"Bokningen går utanför personens arbetstid.":group.rule==="competence_missing"?"Personens arbetsroll uppfyller inte jobbets registrerade krav.":"Bokningen går utanför jobbets registrerade tillträdestid."}</p>
    <p>Hela konfliktintervallet: {formatBookingTime(group.startsAt)} – {formatBookingTime(group.endsAt)}</p>
    <ol aria-label="Bokningarnas tidslinje" className="space-y-3 border-l-4 border-amber-600 pl-3">{group.bookingIds.map(id=>{const b=bookings.find(b=>b.id===id);return <li key={id} className="rounded-md border border-zinc-200 p-3 text-sm">
      <p className="break-words font-semibold">{b?.payload.description||"Bokning"}</p>{b&&<><p><time dateTime={b.payload.startsAt}>{formatBookingTime(b.payload.startsAt)}</time> – <time dateTime={b.payload.endsAt}>{formatBookingTime(b.payload.endsAt)}</time></p>
      <p>{options.jobs.find(j=>j.id===b.payload.jobId)?.label??(b.payload.jobId?"Kopplat jobb":"Utan jobb")} · {options.customers.find(c=>c.id===b.payload.customerId)?.label??(b.payload.customerId?"Kopplad kund":"Utan kund")}</p>{b.isException&&<p>Avvikelse från serien</p>}</>}</li>;})}</ol>
    <label className="block">Välj bokning att åtgärda<select disabled={busy} aria-label="Bokning att åtgärda" className="min-h-11 w-full rounded-md border border-zinc-300 bg-white p-2" value={target} onChange={e=>onTarget(e.target.value)}><option value="">Välj bokning</option>{group.bookingIds.map(id=><option key={id} value={id}>{bookings.find(b=>b.id===id)?.payload.description||`Bokning ${id.slice(0,8)}`}</option>)}</select></label>
    <div className="flex flex-wrap gap-2">{([['move','Flytta'],['reassign','Omfördela'],['adjust','Justera'],['accept','Acceptera konflikt']] as const).map(([action,label])=><button key={action} type="button" disabled={busy||!target||(action==='accept'&&group.status==='accepted')} className="min-h-11 rounded-md border border-zinc-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60" onClick={()=>onAction(action)}>{label}</button>)}
    {bookings.find(b=>b.id===target)?.seriesId&&<button type="button" disabled={busy} className="min-h-11 rounded-md border border-zinc-300 px-3 py-2" onClick={()=>onAction("series")}>Åtgärda hela serien</button>}</div>
  </section>;
}
