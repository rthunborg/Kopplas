// SERVER ONLY. One frozen baseline, complete overlay, resolver proof and atomic SQL call.
import { createHash } from "node:crypto";
import { buildScheduleReadShifts } from "@/features/resources/schedule-read";
import { EMPTY_BOOKING_DECISION } from "@/features/resources/booking-editor-input";
import { recurrenceRuleFromEditor } from "@/features/resources/booking-editor-input";
import type { ResolutionInput, ResolutionPreview, ResolutionRequest, ResolutionResult, ResolverBooking, ResolverGroup } from "@/features/scheduling/conflict-resolver-types";
import type { SchedulingFacts } from "@/features/scheduling/types";
import { CommandError } from "@/server/commands/command-errors";
import { resolutionRequest } from "@/server/commands/bookings/conflict-resolution-validation";
import { bookingConflictKeyFromEnv } from "./conflict-attestation";
import type { BookingRpcClient, DerivedConflict, LogicalConflictGroup } from "./conflict-facts";
import { deriveSeriesConflicts, planBookingSeries, type SeriesSnapshot, type SeriesRow } from "./series-conflicts";
import { openResolutionReceipt, RESOLUTION_FIELDS, sealResolutionReceipt, signResolution, type ResolutionClaims } from "./conflict-resolution-attestation";
export type ResolverFacts = SeriesSnapshot["facts"] & { bookings: ResolverBooking[]; workflow: {natural_key:string;status:string}[] };
export type ResolverSnapshot = {kind:"snapshot";claims:ResolutionClaims;facts:ResolverFacts;checkedAt:string};
export type ResolutionArgs = { p_tenant_id:string;p_actor_id:string;p_correlation_id:string;p_command_id:string };
const hash=(value:string)=>createHash("sha256").update(value).digest("hex");
export function resolutionError(error:unknown):never {
  if(error instanceof CommandError)throw error;const code=(error as {code?:string})?.code;
  throw new CommandError(code==="BK409"?"COMMAND_CONFLICT":code==="BR409"?"PREVIEW_STALE":code==="BR428"?"BOOKING_CONFLICT_UNACKNOWLEDGED":
    ["42501","23503"].includes(code??"")?"TENANT_ACCESS_DENIED":["23514","22P02","22007","22008"].includes(code??"")?"VALIDATION_FAILED":"SERVER_ERROR");
}
export async function snapshotConflictResolver(client:BookingRpcClient,args:ResolutionArgs,input:ResolutionRequest|null,decision:unknown=null) {
  const reply=await client.rpc("booking_conflict_resolver_snapshot",{...args,p_input:input,p_decision:decision,p_key_id:input?(process.env.BOOKING_CONFLICT_ATTESTATION_KEY_ID??"unconfigured"):null});
  if(reply.error)resolutionError(reply.error);const row=reply.data as Record<string,unknown>;
  if(row?.kind==="replay")return {kind:"replay" as const,result:row.result as ResolutionResult};
  if(row?.kind!=="snapshot"||typeof row.canonicalFacts!=="string"||typeof row.checkedAt!=="string")throw new CommandError("SERVER_ERROR");
  const claims=row.claims as ResolutionClaims;
  if(input&&(!claims||RESOLUTION_FIELDS.some(k=>typeof claims[k]!=="string")||claims.factDigest!==hash(row.canonicalFacts)||claims.engineVersion!=="booking-conflicts-v3"||claims.configVersion!=="stockholm-capacity-v1"))throw new CommandError("SERVER_ERROR");
  const facts=JSON.parse(row.canonicalFacts) as ResolverFacts;
  if(!Array.isArray(facts.bookings)||!Array.isArray(facts.workflow)||!Array.isArray(facts.detection?.jobInputs)||!Array.isArray(facts.series)||!Array.isArray(facts.occurrences))throw new CommandError("SERVER_ERROR");
  return {kind:"snapshot" as const,claims,facts,checkedAt:row.checkedAt};
}
export function resolverGroups(snapshot:ResolverSnapshot,groups:readonly LogicalConflictGroup[]):ResolverGroup[] {
  return groups.map(g=>({...g,status:g.keys.every(k=>snapshot.facts.workflow.some(w=>w.natural_key===k&&w.status==="accepted"))?"accepted":"open"}));
}
function local(value:string){const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Stockholm",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(new Date(value)).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;}
export function planConflictResolution(snapshot:ResolverSnapshot,input:ResolutionRequest) {
  const booking=snapshot.facts.bookings.find(b=>b.id===input.bookingId);if(!booking)throw new CommandError("TENANT_ACCESS_DENIED");
  const before=deriveSeriesConflicts(snapshot.facts.detection,[],true);
  const beforeGroups=before.groups.filter(g=>g.bookingIds.includes(input.bookingId));
  const targets=beforeGroups.filter(g=>input.targetLogicalIds.includes(g.logicalId));
  if(targets.length!==input.targetLogicalIds.length)throw new CommandError("PREVIEW_STALE");
  let rows:SeriesRow[]=[];let series:null|{id:string;rule:import("@/features/scheduling/recurrence-types").RecurrenceRule;template:NonNullable<ResolutionInput["payload"]>;version:number}=null;
  if(input.action!=="accept"){
    if(!input.payload)throw new CommandError("VALIDATION_FAILED");
    if(input.wholeSeries){
      const source=snapshot.facts.series.find(s=>s.id===booking.seriesId);if(!source)throw new CommandError("VALIDATION_FAILED");
      if(["description","workRoleId","jobId","customerId","facilityId","contactId","status"].some(k=>input.payload![k as keyof typeof input.payload]!==booking.payload[k as keyof typeof booking.payload])||
        local(input.payload.startsAt).slice(0,10)!==local(booking.payload.startsAt).slice(0,10)||local(input.payload.endsAt).slice(0,10)!==local(booking.payload.endsAt).slice(0,10))throw new CommandError("VALIDATION_FAILED");
      // Common changes keep original nominal anchor/end bounds and protected siblings.
      const start=local(input.payload.startsAt),end=local(input.payload.endsAt);
      const timeRule=recurrenceRuleFromEditor({preset:source.rule.preset,endMode:source.rule.count!==undefined?"count":"until",count:source.rule.count??1,untilDate:source.rule.untilDate,
        weekdays:source.rule.weekdays??[],start,end,allDay:input.payload.allDay});
      const rule={...source.rule,startTime:timeRule.startTime,endTime:timeRule.endTime,endDayOffset:timeRule.endDayOffset,allDay:timeRule.allDay};
      const template={...source.defaults,startsAt:input.payload.startsAt,endsAt:input.payload.endsAt,allDay:input.payload.allDay,assigneeIds:input.payload.assigneeIds};
      const plan=planBookingSeries(snapshot as unknown as SeriesSnapshot,{commandId:input.commandId,seriesId:source.id,sourceSeriesId:source.id,expectedVersion:source.version,pivotOccurrenceId:null,rule,template});
      rows=plan.rows;series={id:source.id,rule:plan.rule,template,version:source.version};
    }else rows=[{id:booking.id,payload:input.payload,seriesId:booking.seriesId??"",nominalDate:booking.nominalDate??"",index:0,isException:booking.isException}];
  }
  const after=input.action==="accept"?before:deriveSeriesConflicts(snapshot.facts.detection,rows,true);
  const affected=rows.length?rows.map(r=>r.id):[booking.id];
  const groups=after.groups.filter(g=>g.bookingIds.some(id=>affected.includes(id)));
  return {rows,series,beforeOutput:before.output,beforeGroups,targets,output:after.output,groups};
}
export function schedulingFactsForResolver(snapshot:ResolverSnapshot,bookingId:string):SchedulingFacts {
  const f=snapshot.facts.detection,candidate=f.bookings.find(b=>b.id===bookingId);if(!candidate)throw new CommandError("TENANT_ACCESS_DENIED");
  return {candidate,existingBookings:f.bookings.filter(b=>b.id!==bookingId),rules:f.rules,jobInputs:null,jobInputSets:f.jobInputs,
    calendarDays:f.calendarDays.map(c=>({date:c.date,variant:c.variant,...(c.reductionPercent!==null?{reductionPercent:c.reductionPercent}:{})})),
    people:f.profiles.map(p=>({id:p.id,employmentPercentage:p.employmentPercentage??100,
      shifts:buildScheduleReadShifts(f.hours.filter(h=>h.personProfileId===p.id).map(h=>({entry_kind:h.entryKind,weekday:h.weekday,starts_at:h.startsAt,ends_at:h.endsAt}))),
      exceptions:f.hours.filter(h=>h.personProfileId===p.id&&h.entryKind==="exception").map(h=>({date:h.localDate!,kind:h.exceptionKind!,...(h.startsAt&&h.endsAt?{start:h.startsAt,end:h.endsAt}:{})})),
      workRoleIds:p.defaultWorkRoleId&&f.workRoles.some(r=>r.id===p.defaultWorkRoleId&&r.isActive)?[p.defaultWorkRoleId]:[]}))};
}
export async function previewConflictResolution(client:BookingRpcClient,args:ResolutionArgs,input:ResolutionInput):Promise<ResolutionPreview> {
  try {const s=await snapshotConflictResolver(client,args,resolutionRequest(input));if(s.kind==="replay")throw new CommandError("COMMAND_CONFLICT");
    const plan=planConflictResolution(s,input),body=JSON.stringify(plan);if(Buffer.byteLength(body)>3145728)throw new CommandError("VALIDATION_FAILED");
    return {receipt:sealResolutionReceipt({claims:s.claims,planDigest:hash(body)},bookingConflictKeyFromEnv().secret),warnings:resolverGroups(s,plan.groups),targets:resolverGroups(s,plan.targets),
      affectedBookingIds:plan.rows.length?plan.rows.map(r=>r.id):[input.bookingId],untouchedBookingIds:plan.rows.filter(r=>r.isException||r.payload.status==="cancelled").map(r=>r.id)};
  }catch(e){resolutionError(e);}
}
export async function commitConflictResolution(client:BookingRpcClient,args:ResolutionArgs,input:ResolutionInput):Promise<ResolutionResult> {
  try {const decision=input.review?.decision??EMPTY_BOOKING_DECISION,s=await snapshotConflictResolver(client,args,resolutionRequest(input),decision);
    if(s.kind==="replay")return s.result;if(!input.review)throw new CommandError("BOOKING_CONFLICT_UNACKNOWLEDGED");
    const key=bookingConflictKeyFromEnv(),review=openResolutionReceipt(input.review.receipt,key.secret),plan=planConflictResolution(s,input),body=JSON.stringify(plan);
    for(const field of ["tenantId","actorId","operation","commandId","bookingId"] as const)if(review.claims[field]!==s.claims[field])throw new CommandError("TENANT_ACCESS_DENIED");
    if(review.claims.candidateDigest!==s.claims.candidateDigest||review.claims.factDigest!==s.claims.factDigest||Date.parse(review.claims.expiresAt)<=Date.now()||review.planDigest!==hash(body))throw new CommandError("PREVIEW_STALE");
    if(JSON.stringify(decision.reviewedLogicalIds)!==JSON.stringify(plan.groups.map(g=>g.logicalId)))throw new CommandError("PREVIEW_STALE");
    if(plan.groups.length&&(!decision.acknowledged||!decision.reason.trim()))throw new CommandError("BOOKING_CONFLICT_UNACKNOWLEDGED");
    if(input.action==="accept"&&JSON.stringify(decision.selectedLogicalIds)!==JSON.stringify(input.targetLogicalIds))throw new CommandError("VALIDATION_FAILED");
    const reply=await client.rpc("finalize_booking_conflict_resolution",{...args,p_input:resolutionRequest(input),p_decision:decision,p_claims:s.claims,p_plan:body,p_signature:signResolution(s.claims,body,key.secret)});
    if(reply.error)resolutionError(reply.error);const row=reply.data as {kind:string;result:ResolutionResult};if(row?.kind==="stale")throw new CommandError("PREVIEW_STALE");if(row?.kind!=="committed"||!row.result)throw new CommandError("SERVER_ERROR");return row.result;
  }catch(e){resolutionError(e);}
}
export type ResolutionPlan = ReturnType<typeof planConflictResolution>;
export type ResolutionOutput = DerivedConflict;
