"use client";
import { schedulingWorkRoleLabel } from "@/features/scheduling/view-types";
import { schedulingPeriod } from "@/features/scheduling/view-model";
import { BookingBlock } from "./BookingBlock";
import { CalendarSlots,type CalendarViewProps } from "./SchemaView";
export function ResourcesView(props:CalendarViewProps){const roster=(props.data.roster??[]).filter(p=>!props.input.filters.personIds.length||props.input.filters.personIds.includes(p.id));return <section aria-label="Resurser" className="space-y-4"><section aria-label="Behöver omfördelas" className="rounded-md border border-zinc-300 p-3"><h2 className="font-medium">Behöver omfördelas</h2>{props.bookings.filter(b=>b.status==="planned"&&b.needsReassignment===true).map(b=><BookingBlock key={b.id} booking={b} data={props.data} onEdit={props.onEdit}/>)}{!props.bookings.some(b=>b.status==="planned"&&b.needsReassignment===true)&&<p className="text-sm">Inga bokningar behöver omfördelas.</p>}</section>{roster.map(person=><section key={person.id} data-testid={`resource-row-${person.id}`} className="rounded-md border border-zinc-200 p-3"><h2 className="break-words font-medium">{person.label}</h2><p className="text-sm">{person.workRoleIds.map(id=>schedulingWorkRoleLabel(id,props.data.workRoles)).filter(Boolean).join(", ")||"Ingen arbetsroll"}</p><p className="text-sm">{props.data.capacity?.filter(c=>c.personId===person.id).map(c=>`${c.date}: ${c.budget===null?"Kapacitet ej tillgänglig":`${c.demand} / ${c.budget} min`}`).join(" · ")}</p><div className="overflow-x-auto"><div className="flex gap-3">{schedulingPeriod(props.input.date,props.input.mode).dates.map(date=><div key={date} className="min-w-40 flex-1"><h3>{date}</h3><CalendarSlots date={date} personId={person.id} host="resources" data={props.data} bookings={props.bookings.filter(b=>b.assigneeIds.includes(person.id))} onSelect={props.onSelect} onEdit={props.onEdit}/></div>)}</div></div></section>)}</section>;}




