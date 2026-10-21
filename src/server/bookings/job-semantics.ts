import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { previewBookingEditor } from "./editor-preview";
import { validateBookingCandidateReferences } from "./candidate-references";
// SERVER-ONLY. Advice derives from the exact checked snapshot sealed by the editor.
import { randomUUID } from "node:crypto";
import { evaluateJobDemandAdvisory } from "@/features/scheduling/job-demand-advisory";
import { deriveJobBookingInterval, jobSchedulingContext, type JobSchedulingHint } from "@/features/jobs/job-scheduling-consumers";
import { schedulingFactsForSnapshot, type DetectionSnapshot, type BookingRpcClient } from "./conflict-facts";
import type { JobSchedulingInputs } from "@/features/scheduling/types";
export function jobSchedulingHint(job: JobSchedulingInputs): JobSchedulingHint {
  return {jobId:job.jobId,durationMinutes:job.estimatedDurationMinutes ?? null,crewSize:job.crewSize ?? null,travelMinutes:job.plannedTravelMinutes ?? null,
    earliestDate:job.earliestDate ?? null,desiredDate:job.desiredDate ?? null,latestDate:job.latestDate ?? null,customerPresenceRequired:job.customerPresenceRequired ?? null};
}
export function bookingSemantics(snapshot: DetectionSnapshot) {
  const job=snapshot.facts.jobInputs.find(j=>j.jobId === snapshot.candidate.jobId);
  const eligible=snapshot.candidate.assigneeIds.filter(id=>{
    const p=snapshot.facts.profiles.find(p=>p.id===id),m=p && snapshot.facts.memberships.find(m=>m.id===p.membershipId);
    return p?.archivedAt === null && m?.status === "active";
  });
  const demand=job ? evaluateJobDemandAdvisory({job:{jobId:job.jobId,durationMinutes:job.estimatedDurationMinutes ?? null,crewSize:job.crewSize ?? null,travelMinutes:job.plannedTravelMinutes ?? null,plannedStartDate:job.plannedStartDate ?? null,plannedEndDate:job.plannedEndDate ?? null},eligiblePersonIds:eligible,facts:schedulingFactsForSnapshot(snapshot)}) : {kind:"unknown" as const};
  const hint=job ? jobSchedulingHint(job):null;
  const context=jobSchedulingContext({selectedJobId:snapshot.candidate.jobId ?? "",jobs:hint ? [hint]:[],startsAt:snapshot.candidate.startsAt,endsAt:snapshot.candidate.endsAt});
  return {jobId:snapshot.candidate.jobId,hint,
    advisory:demand.kind === "unknown" ? {state:"unknown" as const,totalDemand:null,allocatedCurrentJob:null,remainingDemand:null,remainingCapacity:null,shortfall:null}
      : {state:"known" as const,totalDemand:demand.totalDemandMinutes,allocatedCurrentJob:demand.allocatedCurrentJobMinutes,remainingDemand:demand.remainingDemandMinutes,remainingCapacity:demand.remainingCapacityMinutes,shortfall:demand.shortfallMinutes},
    earliestSuggestionDate:job?.earliestDate ?? null,desiredMiss:job?.desiredDate ? context.warnings.some(w=>w.code === "desired_date_missed"):null,
    latestBreach:job?.latestDate ? context.warnings.some(w=>w.code === "latest_date_breached"):null,presenceRequired:job?.customerPresenceRequired ?? null};
}
export type BookingSemanticsDisplay = ReturnType<typeof bookingSemantics>;
/** Production entry composition also usable by server callers without a browser. */
export async function readBookingSemantics(client: BookingRpcClient, input: Partial<import("@/features/resources/booking-types").CreateBookingInput> & {jobId:string|null;startsAt:string;bookingId?:string;intervalSource?:"job-estimate"|"fallback"|"explicit"|"existing"|"edited"}) {
  const context=await resolveTenantContext({client:client as never}); if(!context.ok) throw new Error("booking unavailable");
  if(!resolveCapability({roles:context.data.roles ?? [context.data.role],module:"resources",capability:"Bookings.Manage"}).granted) throw new Error("booking unavailable");
  const commandId=input.commandId ?? randomUUID();
  let hint:JobSchedulingHint|null=null;
  if(input.jobId) {
    const result=await client.rpc("read_job_cards",{p_personal:false,p_job_id:input.jobId});
    if(result.error || !Array.isArray(result.data) || !result.data[0]?.card) throw new Error("job unavailable");
    const c=result.data[0].card;
    hint={jobId:input.jobId,durationMinutes:c.estimated_duration_minutes,crewSize:c.crew_size,travelMinutes:c.planned_travel_minutes,earliestDate:c.earliest_date,desiredDate:c.desired_date,latestDate:c.latest_date,customerPresenceRequired:c.customer_presence_required};
  }
  const source=input.bookingId ? "existing" : input.intervalSource ?? (input.endsAt ? "explicit" : hint?.durationMinutes != null ? "job-estimate" : "fallback");
  const interval=deriveJobBookingInterval({mode:input.bookingId ? "edit":"create",interval:{startsAt:input.startsAt,endsAt:input.endsAt ?? null,provenance:["explicit","edited","existing"].includes(source) ? source === "edited" ? "user" : source === "existing" ? "existing":"explicit":"derived"},job:hint});
  const candidate={startsAt:new Date(interval.startsAt).toISOString(),endsAt:new Date(interval.endsAt!).toISOString(),allDay:input.allDay ?? false,workRoleId:input.workRoleId ?? null,jobId:input.jobId,customerId:input.customerId ?? null,facilityId:input.facilityId ?? null,contactId:input.contactId ?? null,description:input.description ?? "",status:input.status ?? "planned" as const,assigneeIds:input.assigneeIds ?? [],seriesId:null,occurrenceIndex:null,isException:false as const};
  await validateBookingCandidateReferences(client as never,context.data.tenantId,candidate);
  const preview=await previewBookingEditor(client,{p_tenant_id:context.data.tenantId,p_actor_id:context.data.userId,p_correlation_id:randomUUID(),p_command_id:commandId,p_payload:candidate,...(input.bookingId ? {p_booking_id:input.bookingId}:{p_proposed_id:input.proposedBookingId ?? randomUUID()})});
  return {...preview.semantics,input:{...candidate,commandId,...(input.bookingId ? {bookingId:input.bookingId}:{proposedBookingId:preview.bookingId})},intervalSource:source,reviewReceipt:preview.receipt,engineVersion:preview.engineVersion,configVersion:preview.configVersion};
}
