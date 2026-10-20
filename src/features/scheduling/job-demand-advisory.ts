import { activeExistingBookings, bookingRange, prepareDailyCapacity, validateSchedulingFacts } from "./capacity";
import { intersectRanges, localDayRange, nextLocalDate, validateLocalDate } from "./time-zone";
import type { SchedulingFacts } from "./types";

export type JobDemandInput = {
  readonly jobId: string;
  readonly durationMinutes: number | null;
  readonly crewSize: number | null;
  readonly travelMinutes: number | null;
  readonly plannedStartDate: string | null;
  readonly plannedEndDate: string | null;
};
export type JobDemandAdvisory = { readonly kind: "unknown" } | {
  readonly kind: "known";
  readonly totalDemandMinutes: number;
  readonly allocatedCurrentJobMinutes: number;
  readonly remainingDemandMinutes: number;
  readonly remainingCapacityMinutes: number;
  readonly shortfallMinutes: number;
};
const MINUTE = BigInt(60000000);
const HUNDRED = BigInt(100);
// Availability of an optional computation, never a restriction on valid card/booking dates.
// Complete results remain exact; work beyond this bounded daily/person budget stays unknown.
const MAX_CAPACITY_DAY_PEOPLE = 4096;
const maxZero = (value: bigint) => value > BigInt(0) ? value : BigInt(0);

/** Whole-job forecast versus actual post-edit occupancy. Both allocation and
 * capacity use the same explicit eligible people, active bookings, and inclusive
 * Stockholm planning days. This function never creates synthetic occupancy.
 */
export function evaluateJobDemandAdvisory(input: {
  readonly job: JobDemandInput;
  readonly eligiblePersonIds: readonly string[] | null;
  readonly facts: SchedulingFacts | null;
}): JobDemandAdvisory {
  const { job, facts } = input;
  if (job.durationMinutes == null || job.crewSize == null || job.travelMinutes == null
    || job.plannedStartDate == null || job.plannedEndDate == null
    || !input.eligiblePersonIds?.length || facts == null) return { kind: "unknown" };
  if (!job.jobId || !Number.isSafeInteger(job.durationMinutes) || job.durationMinutes < 1
    || !Number.isSafeInteger(job.crewSize) || job.crewSize < 1
    || !Number.isSafeInteger(job.travelMinutes) || job.travelMinutes < 0) throw new Error("Invalid job demand facts");
  validateLocalDate(job.plannedStartDate); validateLocalDate(job.plannedEndDate);
  if (job.plannedStartDate > job.plannedEndDate) throw new Error("Invalid job planning window");
  const peopleById = new Map(facts.people.map((person) => [person.id, person]));
  const personIds = [...new Set(input.eligiblePersonIds)];
  if (personIds.some((id) => !peopleById.has(id))) return { kind: "unknown" };
  validateSchedulingFacts(facts);
  const days=(Date.parse(`${job.plannedEndDate}T00:00:00Z`)-Date.parse(`${job.plannedStartDate}T00:00:00Z`))/86400000+1;
  if(days*personIds.length > MAX_CAPACITY_DAY_PEOPLE) return {kind:"unknown"};
  // Valid local dates can cross the instant parser's supported years at either
  // UTC boundary (0001 Stockholm midnight is in year 0000). This optional
  // calculation stays unavailable without changing public date/save validity.
  let window: {start:bigint;end:bigint};
  try {window={start:localDayRange(job.plannedStartDate).start,end:localDayRange(job.plannedEndDate).end};}
  catch {return {kind:"unknown"};}
  const bookings=[...activeExistingBookings(facts),...(facts.candidate.status === "cancelled" ? []:[facts.candidate])];
  const totalDemand=BigInt(job.crewSize)*(BigInt(job.durationMinutes)+BigInt(job.travelMinutes))*MINUTE;
  let allocated=BigInt(0),occupied=BigInt(0),capacityHundredths=BigInt(0);
  // A whole-window overlap equals the sum of contiguous Stockholm day overlaps.
  // Aggregate actual occupancy once; daily capacity is affine in that exact debit.
  for(const booking of bookings) {
    const overlap=intersectRanges(bookingRange(booking),window);if(!overlap)continue;
    const selected=new Set(booking.assigneeIds.filter(id=>personIds.includes(id)));
    const actual=(overlap.end-overlap.start)*BigInt(selected.size);
    occupied+=actual;if(booking.jobId === job.jobId)allocated+=actual;
  }
  for(let date=job.plannedStartDate;;date=nextLocalDate(date)) {
    for(const personId of personIds) capacityHundredths+=prepareDailyCapacity(facts,peopleById.get(personId)!,date)(BigInt(0)).availableHundredths;
    if(date === job.plannedEndDate)break;
  }
  capacityHundredths-=occupied*HUNDRED;
  const remainingDemand = maxZero(totalDemand - allocated);
  const shortfallHundredths = maxZero(remainingDemand * HUNDRED - capacityHundredths);
  return { kind: "known", totalDemandMinutes: Number(totalDemand) / Number(MINUTE),
    allocatedCurrentJobMinutes: Number(allocated) / Number(MINUTE),
    remainingDemandMinutes: Number(remainingDemand) / Number(MINUTE),
    remainingCapacityMinutes: Number(capacityHundredths) / Number(MINUTE * HUNDRED),
    shortfallMinutes: Number(shortfallHundredths) / Number(MINUTE * HUNDRED) };
}