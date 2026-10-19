// SERVER ONLY. One complete overlay, one detector call, one signed finalizer.
import { createHash } from "node:crypto";
import { buildScheduleReadShifts } from "@/features/resources/schedule-read";
import type { BookingFacts } from "@/features/resources/booking-types";
import { EMPTY_BOOKING_DECISION } from "@/features/resources/booking-editor-input";
import { bookingActionFitsTransport } from "@/features/resources/booking-transport";
import { expandRecurrence, recurrenceLimits } from "@/features/scheduling/recurrence";
import type { RecurrenceRule } from "@/features/scheduling/recurrence-types";
import { detectAllBookingConflicts } from "@/features/scheduling/conflicts";
import { SCHEDULING_RULES_VERSION, type SchedulingBooking, type SchedulingFacts } from "@/features/scheduling/types";
import type { BookingSeriesInput, BookingSeriesResult } from "@/server/commands/bookings/series-validation";
import { seriesCommandPayload } from "@/server/commands/bookings/series-validation";
import { CommandError } from "@/server/commands/command-errors";
import { BOOKING_CONFLICT_ENGINE_VERSION, bookingConflictKeyFromEnv } from "./conflict-attestation";
import type { BookingRpcClient, DerivedConflict, FactBundle, LogicalConflictGroup } from "./conflict-facts";
import { openSeriesReceipt, sealSeriesReceipt, SERIES_ATTESTATION_DOMAIN, SERIES_CLAIM_FIELDS, SERIES_REVIEW_DOMAIN,
  signSeries, type SeriesClaims } from "./series-attestation";

export type SeriesStoredOccurrence = { id: string; nominalDate: string; isException: boolean; payload: BookingFacts };
export type SeriesSnapshot = { kind: "snapshot"; claims: SeriesClaims; canonicalFacts: string;
  facts: { detection: FactBundle; series: { id: string; rule: RecurrenceRule; version: number; endsBefore: string | null; predecessorId: string | null; successorId: string | null }[];
    occurrences: (SeriesStoredOccurrence & { seriesId: string; index: number })[] } };
export type SeriesRow = { id: string; nominalDate: string; isException: boolean; payload: BookingFacts; seriesId: string; index: number };
export type SeriesPlan = { rows: SeriesRow[]; output: DerivedConflict[]; groups: LogicalConflictGroup[]; rule: RecurrenceRule; pivot: string | null };
export type SeriesRpcArgs = { p_tenant_id: string; p_actor_id: string; p_correlation_id: string; p_command_id: string; p_input: ReturnType<typeof seriesCommandPayload> };
const hash = (text: string) => createHash("sha256").update(text).digest("hex");
export function seriesOccurrenceId(seriesId: string, date: string): string {
  const hex = hash(`kopplas.booking-series.slot.v1\0${seriesId}\0${date}`);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
function failSql(error: unknown): never {
  if (error instanceof CommandError) throw error;
  const code = (error as { code?: string })?.code;
  if (code === "BK409") throw new CommandError("COMMAND_CONFLICT");
  if (code === "BR409") throw new CommandError("PREVIEW_STALE");
  if (code === "BR428") throw new CommandError("BOOKING_CONFLICT_UNACKNOWLEDGED");
  if (["42501", "23503"].includes(code ?? "")) throw new CommandError("TENANT_ACCESS_DENIED");
  if (["23514", "22P02", "22007", "22008"].includes(code ?? "")) throw new CommandError("VALIDATION_FAILED");
  throw new CommandError("SERVER_ERROR");
}
export async function snapshotBookingSeries(client: BookingRpcClient, args: SeriesRpcArgs, decision: unknown = null) {
  const result = await client.rpc("snapshot_booking_series", { ...args, p_key_id: process.env.BOOKING_CONFLICT_ATTESTATION_KEY_ID ?? "unconfigured", p_decision: decision });
  if (result.error) failSql(result.error);
  const row = result.data as Record<string, unknown>;
  if (row?.kind === "replay") return { kind: "replay" as const, result: row.result as BookingSeriesResult };
  const claims = row?.claims as SeriesClaims;
  if (row?.kind !== "snapshot" || typeof row.canonicalFacts !== "string" || !claims || SERIES_CLAIM_FIELDS.some(key => typeof claims[key] !== "string") ||
    claims.factDigest !== hash(row.canonicalFacts) || claims.engineVersion !== BOOKING_CONFLICT_ENGINE_VERSION || claims.configVersion !== SCHEDULING_RULES_VERSION)
    throw new CommandError("SERVER_ERROR");
  const facts = JSON.parse(row.canonicalFacts) as SeriesSnapshot["facts"];
  if (!Array.isArray(facts.detection?.bookings) || !Array.isArray(facts.detection.jobInputs) || !Array.isArray(facts.series) || !Array.isArray(facts.occurrences)) throw new CommandError("SERVER_ERROR");
  return { kind: "snapshot" as const, claims, canonicalFacts: row.canonicalFacts, facts };
}

export function planBookingSeries(snapshot: SeriesSnapshot, input: BookingSeriesInput): SeriesPlan {
  const source = input.sourceSeriesId ? snapshot.facts.series.find(s => s.id === input.sourceSeriesId) : null;
  const existing = snapshot.facts.occurrences.filter(row => row.seriesId === input.sourceSeriesId);
  if (input.sourceSeriesId && (!source || source.version !== input.expectedVersion)) throw new CommandError("PREVIEW_STALE");
  const pivotRow = input.pivotOccurrenceId ? existing.find(row => row.id === input.pivotOccurrenceId) : null;
  if (input.pivotOccurrenceId && !pivotRow) throw new CommandError("TENANT_ACCESS_DENIED");
  const pivot = pivotRow?.nominalDate ?? null;
  if (source && (pivot ? source.id === input.seriesId : source.id !== input.seriesId)) throw new CommandError("VALIDATION_FAILED");
  // Stored scheduling coordinates express an inherited anchor; only end-condition
  // changes still apply from the nominal pivot (approved Design Notes 127).
  const coordinates = ["preset","startDate","startTime","endTime","endDayOffset","allDay","timeZone"] as const;
  const weekdays = (rule: RecurrenceRule) => [...(rule.weekdays ?? [])].sort((a,b)=>a-b).join(",");
  const inheritedAnchor = source && coordinates.every(key=>input.rule[key] === source.rule[key]) && weekdays(input.rule) === weekdays(source.rule);
  let rule = pivot && inheritedAnchor ? {...input.rule,startDate:pivot} : input.rule;
  if (pivot && rule.startDate < pivot) throw new CommandError("VALIDATION_FAILED");
  const predecessor = source?.predecessorId ? snapshot.facts.series.find(s=>s.id===source.predecessorId) : null;
  if (source?.predecessorId && (!predecessor?.endsBefore || input.rule.startDate < predecessor.endsBefore)) throw new CommandError("VALIDATION_FAILED");
  if (pivot && source) {
    // An unchanged count means the remaining original slots, not a fresh count.
    if (rule.count !== undefined && rule.count === source.rule.count) {
      const original = expandRecurrence(source.rule);
      if (!original.ok) throw new CommandError("VALIDATION_FAILED");
      const last = original.occurrences.at(-1)!.nominalDate;
      const { count: _count, ...rest } = rule; void _count;
      rule = { ...rest, untilDate: last };
    }
  }
  const expanded = expandRecurrence(rule);
  if (!expanded.ok) throw new CommandError("VALIDATION_FAILED");
  const slots = expanded.occurrences.filter(slot => (!source?.endsBefore || slot.nominalDate < source.endsBefore) && (!pivot || slot.nominalDate >= pivot));
  if (predecessor?.endsBefore && slots.some(slot=>slot.nominalDate < predecessor.endsBefore!)) throw new CommandError("VALIDATION_FAILED");
  if (!slots.length) throw new CommandError("VALIDATION_FAILED");
  const rows: SeriesRow[] = [];
  const taken = new Set<string>();
  for (const old of existing.filter(row => !pivot || row.nominalDate >= pivot)) {
    const slot = slots.find(s => s.nominalDate === old.nominalDate);
    const protectedRow = old.isException || old.payload.status === "cancelled";
    const payload = protectedRow ? old.payload : slot ? { ...input.template, startsAt: slot.startsAt, endsAt: slot.endsAt } : { ...old.payload, status: "cancelled" as const };
    rows.push({ id: old.id, nominalDate: old.nominalDate, isException: protectedRow || !slot, payload, seriesId: input.seriesId, index: 0 });
    taken.add(old.nominalDate);
  }
  for (const slot of slots) if (!taken.has(slot.nominalDate)) rows.push({ id: seriesOccurrenceId(input.seriesId, slot.nominalDate), nominalDate: slot.nominalDate,
    seriesId: input.seriesId, index: 0, isException: false, payload: { ...input.template, startsAt: slot.startsAt, endsAt: slot.endsAt } });
  if (rows.length > recurrenceLimits.maxOccurrences) throw new CommandError("VALIDATION_FAILED");
  rows.sort((a, b) => a.nominalDate.localeCompare(b.nominalDate)).forEach((row, index) => { row.index = index; });
  for (const row of rows) for (const id of row.payload.assigneeIds) {
    const profile = snapshot.facts.detection.profiles.find(p => p.id === id);
    const member = profile && snapshot.facts.detection.memberships.find(m => m.id === profile.membershipId);
    if (!profile || !member || ((profile.archivedAt || member.status !== "active") && !snapshot.facts.detection.bookings.find(b => b.id === row.id)?.assigneeIds.includes(id))) throw new CommandError("TENANT_ACCESS_DENIED");
  }
  return { rows, ...deriveSeriesConflicts(snapshot.facts.detection, rows), rule, pivot };
}

/** Scheduling rules remain exclusively in detectAllBookingConflicts. This maps
 * its complete identities into the existing persistence association schema.
 */
export function deriveSeriesConflicts(facts: FactBundle, rows: readonly SeriesRow[]) {
  const affected = new Set(rows.map(row => row.id));
  const bookings: SchedulingBooking[] = [...facts.bookings.filter(row => !affected.has(row.id)), ...rows.map(row => ({ id: row.id,
    startsAt: row.payload.startsAt, endsAt: row.payload.endsAt, allDay: row.payload.allDay, status: row.payload.status,
    assigneeIds: row.payload.assigneeIds, jobId: row.payload.jobId }))];
  const people = facts.profiles.map(profile => {
    const hours = facts.hours.filter(row => row.personProfileId === profile.id);
    return { id: profile.id, employmentPercentage: profile.employmentPercentage ?? 100,
      shifts: buildScheduleReadShifts(hours.map(row => ({ entry_kind: row.entryKind, weekday: row.weekday, starts_at: row.startsAt, ends_at: row.endsAt }))),
      exceptions: hours.filter(row => row.entryKind === "exception").map(row => ({ kind: row.exceptionKind!, date: row.localDate!,
        ...(row.startsAt && row.endsAt ? { start: row.startsAt, end: row.endsAt } : {}) })),
      workRoleIds: profile.defaultWorkRoleId && facts.workRoles.some(r => r.id === profile.defaultWorkRoleId && r.isActive) ? [profile.defaultWorkRoleId] : [] };
  });
  const candidate = bookings[0];
  if (!candidate) throw new CommandError("VALIDATION_FAILED");
  const input: SchedulingFacts = { candidate, existingBookings: bookings.slice(1), people, rules: facts.rules, jobInputs: null, jobInputSets: facts.jobInputs,
    calendarDays: facts.calendarDays.map(row => ({ date: row.date, variant: row.variant, ...(row.reductionPercent !== null ? { reductionPercent: row.reductionPercent } : {}) })) };
  const output = new Map<string, DerivedConflict>(); const groups: LogicalConflictGroup[] = [];
  for (const conflict of detectAllBookingConflicts(input)) for (const personId of conflict.affectedPersonIds) {
    const logicalId = JSON.stringify([conflict.naturalKey, personId]);
    const naturalKey = `v1:${hash(logicalId)}`;
    const base: DerivedConflict = { booking_id: conflict.bookingIds[0]!, related_booking_id: conflict.bookingIds[1] ?? null,
      affected_person_profile_id: personId, conflict_type: conflict.conflictType, starts_at: conflict.startsAt, ends_at: conflict.endsAt, natural_key: naturalKey };
    output.set(naturalKey, base); const keys = [naturalKey];
    for (const id of conflict.bookingIds.slice(2)) {
      const key = `v2:${hash(JSON.stringify([conflict.naturalKey, personId, id]))}`;
      output.set(key, { ...base, booking_id: id, related_booking_id: conflict.bookingIds[0]!, natural_key: key }); keys.push(key);
    }
    if (conflict.bookingIds.some(id => affected.has(id))) groups.push({ logicalId, keys: keys.sort(), personId,
      bookingIds: conflict.bookingIds, rule: conflict.conflictType, startsAt: conflict.startsAt, endsAt: conflict.endsAt });
  }
  return { output: [...output.values()].sort((a, b) => a.natural_key.localeCompare(b.natural_key)), groups: groups.sort((a, b) => a.logicalId < b.logicalId ? -1 : a.logicalId > b.logicalId ? 1 : 0) };
}
/** Match the complete finalizer UTF-8 bound before exposing ready/save authority. */
export function serializeBookingSeriesPlan(plan: SeriesPlan): string {
  const body = JSON.stringify(plan);
  if (Buffer.byteLength(body, "utf8") > recurrenceLimits.maxCommandBytes) throw new CommandError("VALIDATION_FAILED",
    "Seriens konfliktunderlag är för stort. Kontrollera överlappande bokningar och minska seriens omfattning innan du försöker igen.");
  return body;
}
export async function previewBookingSeries(client: BookingRpcClient, args: SeriesRpcArgs, input: BookingSeriesInput) {
  const snapshot = await snapshotBookingSeries(client, args);
  if (snapshot.kind === "replay") throw new CommandError("COMMAND_CONFLICT");
  const plan = planBookingSeries(snapshot, input); serializeBookingSeriesPlan(plan);
  const key = bookingConflictKeyFromEnv();
  const receipt = sealSeriesReceipt({ claims: snapshot.claims, groups: plan.groups }, key.secret);
  // Reserve the full review/selection/reason payload before exposing save authority.
  const ids = plan.groups.map(g => g.logicalId);
  if (!bookingActionFitsTransport({ ...input, editorReview: { receipt, decision: { acknowledged: true, reviewedLogicalIds: ids, selectedLogicalIds: ids, reason: "\u0001".repeat(2000) } } })) throw new CommandError("VALIDATION_FAILED");
  return { receipt, total: plan.rows.length, occurrences: plan.rows.slice(0, 10).map(row => ({ id: row.id, nominalDate: row.nominalDate,
    startsAt: row.payload.startsAt, endsAt: row.payload.endsAt, isException: row.isException, status: row.payload.status,
    hasConflicts: plan.groups.some(g => g.bookingIds.includes(row.id)) })), warnings: plan.groups.map(({ logicalId, bookingIds, personId, rule, startsAt, endsAt }) => ({ logicalId, bookingIds, personId, rule, startsAt, endsAt })) };
}
export async function saveBookingSeries(client: BookingRpcClient, args: SeriesRpcArgs, input: BookingSeriesInput): Promise<BookingSeriesResult> {
  try {
    const decision = input.editorReview?.decision ?? EMPTY_BOOKING_DECISION;
    const snapshot = await snapshotBookingSeries(client, args, input.editorReview ? decision : null);
    if (snapshot.kind === "replay") return snapshot.result;
    if (!input.editorReview) throw new CommandError("BOOKING_CONFLICT_UNACKNOWLEDGED");
    const key = bookingConflictKeyFromEnv(); const plan = planBookingSeries(snapshot, input);
    const reviewed = openSeriesReceipt(input.editorReview.receipt, key.secret);
    for (const field of ["tenantId", "actorId", "operation", "commandId", "seriesId"] as const) if (reviewed.claims[field] !== snapshot.claims[field]) throw new CommandError("TENANT_ACCESS_DENIED");
    if (reviewed.claims.candidateDigest !== snapshot.claims.candidateDigest || reviewed.claims.factDigest !== snapshot.claims.factDigest ||
      Date.parse(reviewed.claims.expiresAt) <= Date.now() || JSON.stringify(reviewed.groups) !== JSON.stringify(plan.groups)) throw new CommandError("PREVIEW_STALE");
    if (JSON.stringify(decision.reviewedLogicalIds) !== JSON.stringify(plan.groups.map(g => g.logicalId))) throw new CommandError("PREVIEW_STALE");
    if (plan.groups.length && (!decision.acknowledged || !decision.reason.trim())) throw new CommandError("BOOKING_CONFLICT_UNACKNOWLEDGED");
    const body = serializeBookingSeriesPlan(plan); const groups = JSON.stringify(reviewed.groups);
    const result = await client.rpc("finalize_booking_series", { ...args, p_claims: snapshot.claims, p_plan: body,
      p_signature: signSeries(SERIES_ATTESTATION_DOMAIN, snapshot.claims, body, key.secret), p_review_claims: reviewed.claims,
      p_review_groups: groups, p_review_signature: signSeries(SERIES_REVIEW_DOMAIN, reviewed.claims, groups, key.secret), p_decision: decision });
    if (result.error) failSql(result.error);
    const row = result.data as { kind?: string; result?: BookingSeriesResult };
    if (row.kind === "stale") throw new CommandError("PREVIEW_STALE");
    if (row.kind !== "committed" || !row.result) throw new CommandError("SERVER_ERROR");
    return row.result;
  } catch (error) { failSql(error); }
}
