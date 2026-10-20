import { detectAllBookingConflicts } from "./conflicts";
import { dailyCapacity } from "./capacity";
import { formatUtcInstant, localDateForInstant, nextLocalDate, parseUtcInstant, stockholmLocalToUtc } from "./time-zone";
import type { SchedulingBooking, SchedulingFacts } from "./types";
export const CONFLICT_SUGGESTION_LIMITS = Object.freeze({ days: 14, stepMinutes: 15, results: 10 });
export type Availability = { status: "available" | "busy" | "unknown"; loadMinutes: number | null; capacityMinutes: number | null; measurementDate:string|null };
export function evaluateConflictCandidate(facts: SchedulingFacts, candidate: SchedulingBooking): Availability {
  if (candidate.status === "cancelled") return {status:"unknown",loadMinutes:null,capacityMinutes:null,measurementDate:null};
  try {
    const input = {...facts,candidate,existingBookings:facts.existingBookings.filter(b=>b.id!==candidate.id)};
    const groups = detectAllBookingConflicts(input).filter(g=>g.bookingIds.includes(candidate.id));
    const date = localDateForInstant(parseUtcInstant(candidate.startsAt));
    const capacity = candidate.assigneeIds.map(id=>dailyCapacity(input,input.people.find(p=>p.id===id)!,date));
    return { status: groups.length ? "busy" : "available", measurementDate:date,loadMinutes: capacity.reduce((n,c)=>n+c.terms.existingBookingMinutes,0),
      capacityMinutes: capacity.reduce((n,c)=>n+c.terms.scheduledMinutes-c.terms.holidayClosedMinutes-c.terms.absenceMinutes-c.terms.blockedMinutes-c.terms.bufferMinutes,0) };
  } catch { return {status:"unknown",loadMinutes:null,capacityMinutes:null,measurementDate:null}; }
}
/** Finite convenience search. Final checked preview/commit always re-evaluates facts. */
export function suggestConflictSlots(facts: SchedulingFacts): { startsAt: string; endsAt: string; availability: Availability }[] {
  const original=facts.candidate; if(original.status==="cancelled") return [];
  const duration=parseUtcInstant(original.endsAt)-parseUtcInstant(original.startsAt); if(duration<=BigInt(0))return [];
  const originalDate=localDateForInstant(parseUtcInstant(original.startsAt));
  const allDaySpan=(Date.parse(`${localDateForInstant(parseUtcInstant(original.endsAt))}T00:00:00Z`)-Date.parse(`${originalDate}T00:00:00Z`))/86400000;
  const output=new Map<string,{startsAt:string;endsAt:string;availability:Availability}>();
  for(let date=originalDate,day=0;day<CONFLICT_SUGGESTION_LIMITS.days;date=nextLocalDate(date),day++) {
    const starts=new Set<string>();
    for(let minute=0;minute<1440;minute+=original.allDay?1440:CONFLICT_SUGGESTION_LIMITS.stepMinutes)
      starts.add(stockholmLocalToUtc(`${date}T${String(Math.floor(minute/60)).padStart(2,"0")}:${String(minute%60).padStart(2,"0")}:00`));
    if(!original.allDay) {
      const addBoundary=(value:string)=>{for(const instant of [parseUtcInstant(value),parseUtcInstant(value)-duration])if(localDateForInstant(instant)===date)starts.add(formatUtcInstant(instant));};
      for(const person of facts.people.filter(p=>original.assigneeIds.includes(p.id))) for(const shift of person.shifts) {
        addBoundary(stockholmLocalToUtc(`${date}T${shift.start.length===5?`${shift.start}:00`:shift.start}`));
        addBoundary(stockholmLocalToUtc(`${date}T${shift.end.length===5?`${shift.end}:00`:shift.end}`));
      }
      for(const b of facts.existingBookings) if(localDateForInstant(parseUtcInstant(b.endsAt))===date)starts.add(b.endsAt);
      for(const j of facts.jobInputSets??[])if(j.jobId===original.jobId)for(const w of j.accessWindows??[]){addBoundary(w.startsAt);addBoundary(w.endsAt);}
    }
    for(const start of [...starts].sort()) {
      let end:string;
      if(original.allDay){let endDate=date;for(let i=0;i<allDaySpan;i++)endDate=nextLocalDate(endDate);end=stockholmLocalToUtc(`${endDate}T00:00:00`);}
      else end=formatUtcInstant(parseUtcInstant(start)+duration);
      const availability=evaluateConflictCandidate(facts,{...original,startsAt:start,endsAt:end});
      if(availability.status==="available")output.set(`${start}/${end}`,{startsAt:start,endsAt:end,availability});
    }
    if(output.size>=CONFLICT_SUGGESTION_LIMITS.results)break;
  }
  return [...output.values()].sort((a,b)=>a.startsAt.localeCompare(b.startsAt)||a.endsAt.localeCompare(b.endsAt)).slice(0,CONFLICT_SUGGESTION_LIMITS.results);
}
