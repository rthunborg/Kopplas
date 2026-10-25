"use client";
import { CONFLICT_RULE_LABELS,groupConflictQueue } from "@/features/scheduling/conflict-resolver";
import type { ResolverGroup } from "@/features/scheduling/conflict-resolver-types";
export function ConflictQueue({groups,selected,onSelect,people}:{groups:readonly ResolverGroup[];selected:string|null;onSelect:(id:string)=>void;people:readonly {id:string;label:string}[]}){
  return <nav aria-label="Konfliktkö" className="space-y-4">{groupConflictQueue(groups).map(row=><section key={`${row.personId}:${row.date}`}>
    <h2 className="font-semibold">{people.find(p=>p.id===row.personId)?.label??"Resursperson"} · {row.date}</h2>
    <ul className="space-y-2">{row.groups.map(g=><li key={g.logicalId}><button type="button" aria-pressed={selected===g.logicalId} className={`min-h-11 w-full rounded-md border p-3 text-left text-sm focus-visible:ring-2 focus-visible:ring-blue-600 ${selected===g.logicalId?"border-blue-600 bg-blue-50":"border-zinc-300 bg-white"}`} onClick={()=>onSelect(g.logicalId)}>{CONFLICT_RULE_LABELS[g.rule]} · {g.bookingIds.length} bokningar{g.status==="accepted"?" · Accepterad":""}</button></li>)}</ul>
  </section>)}</nav>;
}
