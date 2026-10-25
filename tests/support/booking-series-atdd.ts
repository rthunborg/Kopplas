/**
 * Story 15.2 TEST-OWNED future integration contract. No production adapter exists.
 * Every name/shape here is a normalized test projection, not a proposed RPC, SQL
 * signature, production DTO, command error vocabulary or recurrence wire format.
 * Reconcile it with the implementation before activation; preserve real Result
 * codes/messages and normal authenticated clients, never fabricate success.
 *
 * Bind command() through real createBookingSeries/updateBookingSeries + runCommand;
 * preview()/direct() through their real checked snapshot/finalizer; retain the sole
 * detectAllBookingConflicts engine. No HTTP routes, privileged application client,
 * copied detector, mocked proof verifier or per-occurrence committed save loop.
 *
 * withFixture allocates independent tenant A/B, actors, jobs, profiles, correlations
 * and rows for EACH case; finally removes only those allocated rows/actors. Never
 * touch shared .auth, E16 fixtures, keys, env, seeds, inventory or global config.
 * Seed expectations from literal dates/intervals/IDs, independently of expansion,
 * preview, SQL output and detector under test. Readback methods read REAL rows.
 * clear/mixed/aggregate seed create attempts; existing/jobs seed update attempts.
 * mixed/aggregate controls start OPEN, selected group has >=2 persistence keys;
 * aggregate includes >=11 occurrences and >=4 participant aggregate with a new
 * sibling sorting third. existing contains prefix/suffix exceptions/tombstones.
 * jobs uses persisted mixed bound/unbound rows; allocate jobIds in sorted order
 * and literal facts matching INT-010, not facts generated from its readback.
 * No runtime is allocated by this file. Future REQUIRED execution needs a guarded,
 * isolated schema chain and coordinator-owned serial DDL/fault lane first.
 *
 * snapshot reads every column (including timestamps and private command outcomes)
 * of ALL series/bookings/assignees/conflicts/audit and any outcome relation in BOTH
 * fixture tenants, sorted deterministically. Do not sanitize away a rollback delta.
 * All other normalized projection methods preserve UTC microseconds and real IDs.
 *
 * Fault hooks: future test-only, correlation-scoped, serial isolated lane, actual
 * acceptance/outcome/audit transaction stages observed before SQL raises; revoke
 * execution from PUBLIC/anon/authenticated/service_role, finally remove only owned
 * hooks. No global trigger creation is authorized by this scaffold.
 * Gate tests observe pg_blocking_pids/actual lock acquisition and release, with
 * bounded deadlines and finally restoration, never sleep-based race assumptions.
 * Genuine signed attacks re-sign intentionally invalid bindings using the existing
 * synthetic key. Genuine single/card receipts must first pass their own verifier.
 */
import type { TestServerClient } from "../factories/tenants";
import type { BookingFixture } from "./bookings-atdd";
import { bookingSnapshot } from "./bookings-atdd";
import { adminQuery } from "../factories/admin-sql";
import { previewBookingSeries } from "@/server/bookings/series-conflicts";
import { seriesCommandPayload, type BookingSeriesInput } from "@/server/commands/bookings/series-validation";
import type { BookingRpcClient } from "@/server/bookings/conflict-facts";

/** Executable fixtures use actual production commands and independent raw SQL. */
export function realSeriesInput(fx: BookingFixture, patch: Partial<BookingSeriesInput> = {}): BookingSeriesInput {
  return { commandId: crypto.randomUUID(), seriesId: crypto.randomUUID(), sourceSeriesId: null, expectedVersion: null, pivotOccurrenceId: null,
    rule: { preset: "daily", startDate: "2026-10-12", startTime: "07:00:00", endTime: "08:00:00", endDayOffset: 0, allDay: false, timeZone: "Europe/Stockholm", count: 3 },
    template: { startsAt: "2026-10-12T05:00:00.000000Z", endsAt: "2026-10-12T06:00:00.000000Z", allDay: false,
      workRoleId: null, jobId: null, customerId: null, facilityId: null, contactId: null, description: "Real recurring lighting",
      status: "planned", assigneeIds: [fx.ownProfile.id], seriesId: null, occurrenceIndex: null, isException: false }, ...patch };
}
export async function reviewRealSeries(fx: BookingFixture, input: BookingSeriesInput, options: {client?: TestServerClient; actorId?: string; selected?: readonly string[]} = {}) {
  const preview = await previewBookingSeries((options.client ?? fx.adminClient) as unknown as BookingRpcClient,
    {p_tenant_id:fx.base.tenantA.id,p_actor_id:options.actorId ?? fx.base.adminA.id,p_correlation_id:crypto.randomUUID(),p_command_id:input.commandId,p_input:seriesCommandPayload(input)},input);
  return { preview, input: { ...input, editorReview: {receipt:preview.receipt,decision:{acknowledged:preview.warnings.length>0,
    reviewedLogicalIds:preview.warnings.map(w=>w.logicalId),selectedLogicalIds:[...(options.selected??[])],reason:preview.warnings.length?"Reviewed every current warning":""}} } };
}
export async function realSeriesSnapshot(fx: BookingFixture) {
  return { ...await bookingSnapshot(fx.tenantIds), series: await adminQuery("select * from public.booking_series where tenant_id=any($1::uuid[]) order by tenant_id,id", [fx.tenantIds]) };
}

export type Row = Record<string, unknown>;
export type Role = "admin" | "planner" | "montor" | "sales" | "economy" |
  "inactive" | "revoked" | "foreign" | "anonymous" | "multiRolePlanner";
export type Rule = {
  preset: "daily" | "weekly" | "biweekly" | "monthly";
  weekdays?: number[]; end: { count: number } | { until: string };
};
export type Template = {
  startsAt: string; endsAt: string; allDay: boolean; description: string;
  status: "planned" | "cancelled"; assigneeIds: string[]; jobId: string | null;
  workRoleId: string | null; customerId: string | null; facilityId: string | null;
  contactId: string | null;
};
export type Group = {
  logicalId: string; keys: string[]; bookingIds: string[];
  type: string; startsAt: string; endsAt: string;
};
export type Decision = {
  receipt: string; acknowledged: boolean; reviewedIds: string[];
  selectedIds: string[]; reason: string;
};
export type Attempt = {
  operation: "create" | "update"; commandId: string; proposedSeriesId: string;
  sourceSeriesId: string | null; expectedRevision: number | null;
  pivotOccurrenceId: string | null; rule: Rule; template: Template;
  decision?: Decision;
};
export type Outcome = {
  addressedSeriesId: string; successorSeriesId: string | null; occurrenceIds: string[];
};
/** Failure kind is test-owned classification; code/message retain the REAL result. */
export type Result = { ok: true; data: Outcome } | {
  ok: false; kind: "denied" | "stale" | "key-conflict" | "review-required" |
    "validation" | "fault"; code: string; message: string;
};
export type Preview = {
  receipt: string; affectedIds: string[]; groups: Group[];
  displayedIds: string[]; total: number; rawBrowserPayload: unknown;
};
export type Occurrence = {
  id: string; tenantId: string; seriesId: string; nominalSlot: string;
  startsAt: string; endsAt: string; status: "planned" | "cancelled";
  isException: boolean; jobId: string | null; description: string;
  assigneeIds: string[]; index: number;
};
export type Series = {
  id: string; revision: number; lastNominalSlot: string | null;
  predecessorId: string | null; successorId: string | null;
};
export type DurableSnapshot = {
  series: Row[]; bookings: Row[]; assignees: Row[]; conflicts: Row[];
  outcomes: Row[]; audit: Row[];
};
export type Conflict = {
  id: string; key: string; bookingIds: string[]; status: string;
  reason: string | null; acceptedBy: string | null; acceptedAt: string | null;
};
export type Plan = {
  attempt: Attempt;
  /** Literal independently seeded expectations; never populated from actual preview. */
  planned: Occurrence[]; groups: Group[]; selected: Group; unrelatedKeys: string[];
  afterTenthId: string; retainedExceptionId: string; tombstoneId: string;
  pivotId: string; pivotNominalSlot: string; prefixIds: string[]; suffixIds: string[];
};
export type Fixture = {
  tenantIds: [string, string]; actorIds: Record<Role, string | null>;
  membershipIds: Record<Role, string | null>;
  clients: Record<Role, TestServerClient>; ownOccurrenceIds: string[];
  peerOccurrenceId: string; foreignOccurrenceId: string; foreignSeriesId: string;
  personIds: string[]; jobIds: [string, string, string];
  workRoleIds: [string, string]; correlationId: string;
  templateMarker: string; peerMarker: string; foreignMarker: string;
};
export type Facts = {
  engine: string; config: string; canonicalSqlText: string; digest: string;
  bookings: { id: string; jobId: string | null; status: string }[];
  jobInputs: { jobId: string; requiredWorkRoleIds: string[] | null;
    accessWindows: { startsAt: string; endsAt: string }[] | null }[];
  /** Exact SQL digest independently read; do not JS-reserialize JSON as evidence. */
  sqlDigest: string;
};
export type Proof = {
  attestationDomain: string; reviewDomain: string; orderedClaims: string[];
  canonicalBytes: Uint8Array; sqlCanonicalBytes: Uint8Array; metadataDigest: string;
  /** factDigest projects the raw detector digest; metadataDigest projects the
   * series-enriched baseline independently, even if production uses other names. */
  factDigest: string; outputDigest: string; commandId: string; tenantId: string;
  actorId: string; sourceSeriesId: string | null; successorSeriesId: string | null;
  sourceRevision: number | null; rule: Rule; pivot: string | null;
  proposedIds: string[]; groups: Group[];
};
export type Attack = "tenant" | "actor" | "operation" | "command" | "source-revision" |
  "successor" | "rule" | "nominal-pivot" | "proposed-id" | "payload" |
  "facts" | "output" | "partial-group" | "unrelated-group" | "unsigned-list";
export type Trace = {
  detectorCalls: number; batchFinalizers: number; singleBookingCommits: number;
  overlayIds: string[]; outputKeys: string[]; finalizedKeys: string[];
  events: string[];
};
export type SqlEntry = { signature: string; args: Row; kind: "checked" | "obsolete" | "private" };
export type RpcReply = { data: unknown; error: { code: string; message?: string } | null };
export interface SeriesBindings {
  sourceEvidence: string[];
  withFixture(run: (fixture: Fixture) => Promise<void>): Promise<void>;
  seed(fx: Fixture, scenario: "clear" | "mixed" | "existing" | "jobs" | "aggregate"): Promise<Plan>;
  preview(client: TestServerClient, input: Attempt): Promise<Preview>;
  command(client: TestServerClient, input: Attempt, correlationId: string): Promise<Result>;
  snapshot(fx: Fixture): Promise<DurableSnapshot>;
  occurrences(fx: Fixture): Promise<Occurrence[]>;
  series(fx: Fixture): Promise<Series[]>;
  conflicts(fx: Fixture): Promise<Conflict[]>;
  outcomeRows(fx: Fixture, addressedSeriesId: string, commandId: string): Promise<Row[]>;
  auditFor(fx: Fixture, correlationId: string): Promise<{ actorId: string; event: string; at: string }[]>;
  facts(fx: Fixture, input: Attempt): Promise<Facts>;
  proof(fx: Fixture, input: Attempt): Promise<Proof>;
  changed(fx: Fixture, input: Attempt, change: "rule" | "decision" | "time" |
    "description" | "omit-slot" | "introduced-slot" | "explicit-count"): Promise<Attempt>;
  /** Metadata variants preserve every detector input; tombstone variant changes
   * linkage of an ALREADY cancelled row, never status/time/assignees/job. */
  changeCurrent(fx: Fixture, change: "job-child" | "job-rebinding" | "schedule" |
    "series-revision" | "nominal-slot" | "exception" | "tombstone" | "lineage"): Promise<void>;
  attack(fx: Fixture, input: Attempt, attack: Attack): Promise<Attempt>;
  /** REAL valid single-editor/card receipt replaces series review, no fake HMAC. */
  crossProtocol(fx: Fixture, input: Attempt, protocol: "single" | "job-card"):
    Promise<{ input: Attempt; donorVerified: boolean; donorDomain: string }>;
  replayWithExpiredTransport(fx: Fixture, input: Attempt): Promise<Attempt>;
  race(fx: Fixture, inputs: [Attempt, Attempt]): Promise<{ results: [Result, Result];
    observedBlocked: boolean; events: string[] }>;
  loseResponseThenRetry(fx: Fixture, input: Attempt): Promise<{
    firstCommitted: boolean; deliveredResponse: false; retryInput: Attempt;
    retry: Result; afterFirst: DurableSnapshot; afterRetry: DurableSnapshot;
  }>;
  observeCommand(fx: Fixture, input: Attempt, beforeFinalize?: () => Promise<void>):
    Promise<{ result: Result; trace: Trace }>;
  withFault(fx: Fixture, stage: "after-acceptance" | "after-outcome" | "before-audit",
    run: () => Promise<Result>): Promise<{ result: Result; reached: boolean;
      acceptedKeysObserved: string[]; outcomeObserved: boolean }>;
  /** Revocation committed while command waits on the actual tenant gate. */
  revokedWhileWaiting(fx: Fixture, input: Attempt, replay: boolean): Promise<{
    result: Result; observedBlocked: boolean; events: string[];
    before: DurableSnapshot; after: DurableSnapshot;
  }>;
  assigneeRetention(fx: Fixture, plan: Plan): Promise<{
    retained: Result; newSibling: Result; beforeSibling: DurableSnapshot;
    afterSibling: DurableSnapshot; retainedId: string; inactivePersonId: string;
  }>;
  occurrenceEdit(fx: Fixture, id: string, change: "move" | "cancel"): Promise<Result>;
  updatePlan(fx: Fixture, plan: Plan): Promise<Attempt>;
  splitPlan(fx: Fixture, plan: Plan, explicitCount?: number): Promise<Attempt>;
  slotCollisionPlan(fx: Fixture, plan: Plan): Promise<{
    attempt: Attempt; exceptionId: string; newSlotId: string;
    exceptionNominalSlot: string; newNominalSlot: string;
  }>;
  /** Observes REAL production byte/occurrence admission. At-ceiling probe may
   * subsequently fail a stricter domain bound: admitted means observed admission
   * at this particular gate only, never command success. Over-ceiling must return
   * the real rejection before expansion/signing/SQL mutation and preserve rows. */
  admissionProbe(fx: Fixture, limit: "action-json" | "encrypted-receipt" | "occurrences",
    delta: 0 | 1): Promise<{ admitted: boolean; measured: number; ceiling: number;
      includesEncryptionOverhead: number; expansionCalls: number; mutationCalls: number;
      rejectedResult: Result | null; before: DurableSnapshot; after: DurableSnapshot;
      requestedCount: number; materializedCount: number }>;
  acceptedKeyChange(fx: Fixture, plan: Plan): Promise<{
    unchanged: Attempt; changed: Attempt; unchangedKeys: string[]; oldKeys: string[];
    newKeys: string[];
  }>;
  /** Bounded deterministic gate interleaving with REAL checked job-card command. */
  jobCardInterleave(fx: Fixture, input: Attempt): Promise<{
    seriesResult: Result; cardCommitted: boolean; observedBlocked: boolean;
    committedFactDigest: string; currentFactDigest: string; conflictsMatchSoleDetector: boolean;
  }>;
  /** Real authenticated direct table/column queries explicitly target tenant A;
   * a foreign actor's legitimate tenant-B read is outside this A-targeted probe.
   * Retain unsanitized actual JSON for disclosure assertions. No extra peer reader. */
  read(client: TestServerClient, fx: Fixture): Promise<{
    occurrences: Occurrence[]; templates: Series[]; rawBrowserPayload: unknown;
  }>;
  direct(client: TestServerClient, input: Attempt, entry?: SqlEntry): Promise<RpcReply>;
  dml(client: TestServerClient, fx: Fixture, target: "series" | "series-rule" |
    "series-outcome" | "booking-series-id" | "nominal-slot" | "occurrence-index" |
    "exception" | "tombstone" | "lineage"): Promise<RpcReply & { affectedRows: number }>;
  sqlInventory(fx: Fixture, input: Attempt): Promise<SqlEntry[]>;
  sqlAcls(entries: SqlEntry[]): Promise<{ signature: string; publicExecute: boolean;
    anonExecute: boolean; authenticatedExecute: boolean; serviceRoleExecute: boolean }[]>;
  tableSecurity(fx: Fixture): Promise<{ forceRls: boolean; rlsEnabled: boolean;
    managerPublicColumns: string[]; privateColumns: string[]; publicGrantColumns: string[] }>;
  foreignReference(fx: Fixture, input: Attempt, field: "series" | "pivot" | "assignee" |
    "job" | "customer" | "facility" | "contact"): Promise<Attempt>;
  standaloneOptionalLinks(fx: Fixture, role: "admin" | "planner"): Promise<{
    result: { ok: boolean; bookingId?: string }; row: Row;
  }>;
}

/** Unbound on purpose: activation must wire production, not skip silently or mock. */
export async function loadBookingSeriesBindings(): Promise<SeriesBindings> {
  throw new Error("Story 15.2 ATDD adapter unbound: allocate isolated DB/serial fault lane; bind real runCommand, checked batch SQL, sole detector and exact raw readback before unskipping");
}

/** Decision assembled from the actual visible reviewed warning set. Expected groups
 * remain independent literals on Plan; this does not generate expected output. */
export function reviewed(input: Attempt, preview: Preview, selected: Group[] = []): Attempt {
  return { ...input, decision: { receipt: preview.receipt,
    acknowledged: preview.groups.length > 0,
    reviewedIds: preview.groups.map((group) => group.logicalId).sort(),
    selectedIds: selected.map((group) => group.logicalId).sort(),
    reason: preview.groups.length ? "Coordinated with the site foreman" : "" } };
}
