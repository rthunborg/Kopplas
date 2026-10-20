import { createHash } from "node:crypto";
import { deriveBookingConflicts, type FactBundle, type DetectionSnapshot, type DerivedConflict } from "@/server/bookings/conflict-facts";
import { BOOKING_CONFLICT_ENGINE_VERSION, CONFLICT_CLAIM_FIELDS, type ConflictClaims } from "@/server/bookings/conflict-attestation";
import type { JobCardData } from "@/features/jobs/job-card-domain";
import { SCHEDULING_RULES_VERSION } from "@/features/scheduling/types";
export type JobCardSnapshot = ConflictClaims & { readonly kind: "snapshot"; readonly candidate: JobCardData;
  readonly canonicalFacts: string; readonly facts: { readonly detection: FactBundle } };
export function parseJobCardSnapshot(data: unknown): JobCardSnapshot | {kind: "replay"; result: {jobId: string}} {
  if (!data || typeof data !== "object") throw new Error("job card snapshot invalid");
  const r = data as Record<string, unknown>;
  if (r.kind === "replay" && r.result && typeof (r.result as {jobId: unknown}).jobId === "string") return r as {kind: "replay"; result: {jobId: string}};
  if (r.kind !== "snapshot" || CONFLICT_CLAIM_FIELDS.some((field) => typeof r[field] !== "string")
    || r.engineVersion !== BOOKING_CONFLICT_ENGINE_VERSION || r.configVersion !== SCHEDULING_RULES_VERSION
    || typeof r.canonicalFacts !== "string" || createHash("sha256").update(r.canonicalFacts).digest("hex") !== r.factDigest
    || !r.candidate || typeof r.candidate !== "object") throw new Error("job card snapshot invalid");
  const facts = JSON.parse(r.canonicalFacts) as JobCardSnapshot["facts"];
  if (!facts.detection || !Array.isArray(facts.detection.bookings) || !Array.isArray(facts.detection.jobInputs)) throw new Error("job card facts invalid");
  return {...r, facts} as JobCardSnapshot;
}
/** Overlay only the exact SQL-canonical proposal and use the existing sole detector. */
export function deriveJobCardConflicts(snapshot: JobCardSnapshot): DerivedConflict[] {
  const facts = snapshot.facts.detection;
  const own = {jobId: snapshot.bookingId, requiredWorkRoleIds: snapshot.candidate.requiredWorkRoleIds,
    accessWindows: snapshot.candidate.accessWindows,
    estimatedDurationMinutes: snapshot.candidate.estimated_duration_minutes, crewSize: snapshot.candidate.crew_size,
    plannedTravelMinutes: snapshot.candidate.planned_travel_minutes, plannedStartDate: snapshot.candidate.planned_start_date,
    plannedEndDate: snapshot.candidate.planned_end_date, earliestDate: snapshot.candidate.earliest_date,
    desiredDate: snapshot.candidate.desired_date, latestDate: snapshot.candidate.latest_date,
    customerPresenceRequired: snapshot.candidate.customer_presence_required};
  const overlaid: FactBundle = {...facts, jobInputs: [...facts.jobInputs.filter((j) => j.jobId !== own.jobId), own]};
  const first = facts.bookings[0];
  if (!first) return [];
  return deriveBookingConflicts({...snapshot, facts: overlaid, bookingId: first.id,
    candidate: { ...first, jobId: first.jobId ?? null, workRoleId: null, customerId: null, facilityId: null,
      contactId: null, description: "", seriesId: null, occurrenceIndex: null, isException: false }} as DetectionSnapshot).output;
}
