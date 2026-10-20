/** Story 16.4 RED adapters. Every runtime import is lazy; no DB work at collection.
 * Only signature/DTO translation belongs here. Future names below are replaceable
 * binding assumptions, never permission/policy requirements or fake success paths.
 * Existing 16.1/2/3 fixtures, real normal-JWT commands, checked SQL and signer stay
 * authoritative. Reconcile bindings before activating any skipped acceptance test.
 */
import type { TestServerClient } from "../factories/tenants";
import type { JobsDepthFixture } from "./jobs-depth-atdd";
import type { BookingInput, DurableRow } from "./bookings-atdd";
import type { JobCardInput } from "@/features/jobs/job-card-domain";
export type UpgradeInput = { commandId: string; jobId: string; expectedState: unknown };
export type UpgradeResult = { ok: true; data: { jobId: string; type: "projekt" } } | { ok: false; code: string };
export type JobSemantics = { id: string; type: "order" | "projekt"; expectedState: unknown;
  card: Omit<JobCardInput, "commandId" | "id">; leadPersonProfileId: string | null;
  workOrders: { id: string; plannedStartDate: string | null; plannedEndDate: string | null }[];
  dependencies: { dependentJobId: string; dependentWorkOrderId: string | null; prerequisiteJobId: string; prerequisiteWorkOrderId: string | null }[];
  canUpgrade: boolean; canEditCard: boolean };
export type Advisory = { state: "known" | "unknown"; totalDemand: number | null;
  allocatedCurrentJob: number | null; remainingDemand: number | null;
  remainingCapacity: number | null; shortfall: number | null };
export type BookingSemantics = { jobId: string | null; input: BookingInput;
  intervalSource: "job-estimate" | "fallback" | "explicit" | "existing" | "edited";
  advisory: Advisory; earliestSuggestionDate: string | null; desiredMiss: boolean | null;
  latestBreach: boolean | null; presenceRequired: boolean | null; reviewReceipt: string;
  engineVersion: string; configVersion: string };
/** Proposed future server reader for the actual safe card DTO. No local read model. */
export async function readJobSemantics(client: TestServerClient, jobId: string): Promise<JobSemantics> {
  const path = "@/server/read-models/job-semantics";
  const actual = await import(path) as { readJobSemantics(c: TestServerClient, id: string): Promise<JobSemantics> };
  return actual.readJobSemantics(client, jobId);
}
export async function upgradeInput(client: TestServerClient, jobId: string, patch: Partial<UpgradeInput> = {}): Promise<UpgradeInput> {
  return { commandId: crypto.randomUUID(), jobId, expectedState: (await readJobSemantics(client, jobId)).expectedState, ...patch };
}
export async function upgradeJob(client: TestServerClient, input: UpgradeInput | Record<string, unknown>, correlationId = crypto.randomUUID()): Promise<UpgradeResult> {
  const { runCommand } = await import("@/server/commands/envelope");
  const path = "@/server/commands/jobs/upgrade-job-to-projekt";
  const actual = await import(path) as { upgradeJobToProjekt: Parameters<typeof runCommand>[0] };
  return runCommand(actual.upgradeJobToProjekt, { client: client as never, input, correlationId }) as Promise<UpgradeResult>;
}
/** Exact RPC spelling is prospective; normal JWT and SQL authority cannot be bypassed. */
export function checkedUpgrade(client: TestServerClient, tenantId: string, actorId: string, input: UpgradeInput, correlationId = crypto.randomUUID()) {
  return client.rpc("upgrade_job_to_projekt_with_audit", { p_tenant_id: tenantId, p_actor_user_id: actorId,
    p_command_id: input.commandId, p_correlation_id: correlationId, p_job_id: input.jobId, p_expected_state: input.expectedState });
}
/** Future actual editor entry/preview read. It must use production domain/default
 * composition + checked preview, never an independent test-only calculation. */
export async function readBookingSemantics(client: TestServerClient, input: Partial<BookingInput> & { jobId: string | null;
  startsAt: string; intervalSource?: BookingSemantics["intervalSource"] }): Promise<BookingSemantics> {
  const path = "@/server/bookings/job-semantics";
  const actual = await import(path) as { readBookingSemantics(c: TestServerClient, i: typeof input): Promise<BookingSemantics> };
  return actual.readBookingSemantics(client, input);
}
export async function jobSemanticsSnapshot(f: JobsDepthFixture) {
  const { workOrdersSnapshot } = await import("./work-orders-atdd");
  const { adminQuery } = await import("../factories/admin-sql");
  const read = async (table: "files" | "file_links" | "job_events") => (await adminQuery<{ row: DurableRow }>(
    `select to_jsonb(t) row from public.${table} t where tenant_id=any($1::uuid[]) order by to_jsonb(t)::text`, [f.fx.tenantIds])).map(r => r.row);
  return { ...(await workOrdersSnapshot(f)), files: await read("files"), fileLinks: await read("file_links"), events: await read("job_events") };
}
export async function saveCard(f: JobsDepthFixture, jobId: string, patch: Partial<JobCardInput> = {}) {
  const h = await import("./jobs-depth-atdd");
  const current = (await f.snapshot()).jobs.find(r => r.id === jobId);
  const input = { ...h.cardInput(f, { id: jobId, type: current?.type === "projekt" ? "projekt" : "order" }),
    planned_start_date: "2026-10-12", planned_end_date: "2026-10-12", responsible_project_manager_id: null,
    // Recorded [] means closed access, so ordinary no-hard-conflict scenarios
    // use a real broad synthetic window; explicit caller [] still stays restrictive.
    locationOverride: null, dependencyJobIds: [], requiredWorkRoleIds: [],
    accessWindows: [{ startsAt: "2026-10-01T00:00:00Z", endsAt: "2026-11-02T00:00:00Z" }], ...patch };
  const result = await h.invokeJobCard(f.fx.adminClient, "update", input);
  if (!result.ok) throw new Error(`Real card arrangement refused: ${result.code}`);
  return input;
}
/** Literal real schedules; gross minutes are split across two eligible selected
 * people. Existing fixture bookings are outside this isolated October 20 window. */
export async function demandScenario(f: JobsDepthFixture, grossMinutes: number, allocatedMinutes: number, allBookedMinutes: number) {
  const { adminQuery } = await import("../factories/admin-sql");
  const { bookingCommand, bookingInput } = await import("./bookings-atdd");
  const jobId = f.jobs.editable.id;
  await saveCard(f, jobId, { planned_start_date: "2026-10-20", planned_end_date: "2026-10-20",
    earliest_date: "2026-10-19", desired_date: "2026-10-20", latest_date: "2026-10-21" });
  const people = [f.fx.ownProfile.id, f.fx.coworkerProfile.id];
  const end = new Date(Date.parse("2026-10-20T06:00:00Z") + grossMinutes / 2 * 60000).toISOString().slice(11,16);
  for (const person of people) {
    await adminQuery("update public.person_profiles set default_work_role_id=null where id=$1", [person]);
    const r = await f.fx.adminClient.rpc("save_person_schedule_with_audit", { p_tenant_id: f.fx.base.tenantA.id,
      p_actor_user_id: f.fx.base.adminA.id, p_correlation_id: crypto.randomUUID(), p_person_profile_id: person,
      p_schedule: [{ weekday: 2, start: "08:00", end: `${String(Number(end.slice(0,2))+2).padStart(2,"0")}:${end.slice(3)}`, breaks: [] }] });
    if (r.error) throw r.error;
  }
  async function add(minutes: number, target: string, offset = 0) {
    if (minutes === 0) return null;
    const start = Date.parse("2026-10-20T06:00:00Z") + offset * 60000;
    const input = bookingInput(people, { jobId: target, startsAt: new Date(start).toISOString(), endsAt: new Date(start + minutes / 2 * 60000).toISOString() });
    const result = await bookingCommand("create", f.fx.adminClient, input);
    if (!result.ok) throw new Error(`Real allocation arrangement refused: ${result.code}`);
    return result.data.bookingId;
  }
  const currentBookingId = await add(allocatedMinutes, jobId);
  await add(allBookedMinutes-allocatedMinutes, f.jobs.unrelated.id, allocatedMinutes/2);
  return { jobId, people, currentBookingId, request: { jobId, startsAt: "2026-10-20T06:00:00Z", endsAt: "2026-10-20T07:00:00Z",
    assigneeIds: people, status: "cancelled" as const, intervalSource: "explicit" as const } };
}
/** Capture only real RPC arguments, forward every result. A modifier is an
 * adversarial signed transport mutation, never a substitute server reply. */
export function observeSemanticsClient(client: TestServerClient, mutate?: (name: string, args: Record<string, unknown>) => Promise<Record<string, unknown>>) {
  const calls: { name: string; args: Record<string, unknown>; data: unknown; error: unknown }[] = [];
  const proxy = new Proxy(client, { get(target,key) {
    if (key === "rpc") return async (name: string,args: Record<string,unknown>) => {
      const forwarded = mutate ? await mutate(name,args) : args;
      const result = await target.rpc(name,forwarded); calls.push({name,args:forwarded,data:result.data,error:result.error}); return result;
    };
    const value = Reflect.get(target,key,target); return typeof value === "function" ? value.bind(target) : value;
  } });
  return { client: proxy, calls };
}
/** Genuine otherwise-current local synthetic proof: change semantic version and
 * re-sign using the correct domain. All tenant/actor/candidate/time bindings stay. */
export async function obsoleteProof(name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!["finalize_booking_editor", "finalize_job_card"].includes(name)) return args;
  const { LOCAL_TEST_BOOKING_CONFLICT_SECRET: secret } = await import("./test-env");
  const { signConflictOutput } = await import("@/server/bookings/conflict-attestation");
  const claims = { ...(args.p_claims as import("@/server/bookings/conflict-attestation").ConflictClaims), engineVersion: "booking-conflicts-v3", configVersion: "stockholm-capacity-v1" };
  if (name === "finalize_job_card") {
    const { signJobCardOutput } = await import("@/server/commands/jobs/card-proof");
    return { ...args, p_claims: claims, p_signature: signJobCardOutput(claims, String(args.p_output), secret) };
  }
  const { signEditorClaims } = await import("@/server/bookings/editor-preview");
  const review = { ...(args.p_review_claims as import("@/server/bookings/conflict-attestation").ConflictClaims), engineVersion: "booking-conflicts-v3", configVersion: "stockholm-capacity-v1",
    groups: JSON.parse(String(args.p_review_groups)) as import("@/server/bookings/conflict-facts").LogicalConflictGroup[] };
  return { ...args, p_claims: claims, p_signature: signConflictOutput(claims,String(args.p_output),secret),
    p_review_claims: { ...review, groups: undefined }, p_review_signature: signEditorClaims(review,secret) };
}

/** Signed mixed-job facts capture: exposes no synthetic derived values. */
export async function bookingFacts(client: TestServerClient, input: BookingInput) {
  const { currentAttempt } = await import("./booking-editor-production");
  const attempt = await currentAttempt(client,input.bookingId ? "update" : "create",input);
  if (attempt.snapshot.kind !== "snapshot") throw new Error("Fresh checked snapshot required");
  return { ...attempt, snapshot: attempt.snapshot };
}


