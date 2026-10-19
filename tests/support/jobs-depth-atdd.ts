/** Story 16.1 actual command/RLS fixture helpers. Static bindings are runner-transformed; database work starts only inside invoked helpers.
 * Existing contracts: tenants factories, envelope createJob/acceptQuoteAndCreateJob,
 * E14 bookingCommand, adminQuery and normal anon-key JWT clients.
 * E16 implemented bindings (execution evidence is recorded separately): jobs.type; job_members
 * (tenant_id,job_id,person_profile_id,archived_at); job_required_work_roles;
 * job_access_windows; job_dependencies. Card input/export/DTO names below must be
 * reconciled to the actual implementation before removing skips. No fake replies.
 */
import { runCommand } from "@/server/commands/envelope";
import { seedBookingParents, bookingInput, bookingCommand, type BookingFixture, type DurableRow } from "./bookings-atdd";
import * as t from "../factories/tenants";
import type { TestServerClient } from "../factories/tenants";
import { createJob } from "@/server/commands/jobs";
import { markQuoteVersionSent, acceptQuoteAndCreateJob } from "@/server/commands/quotes";
import { createJobCard, updateJobCard } from "@/server/commands/jobs/save-job-card";
import { readMyJobs as readMyJobsModel } from "@/server/read-models/my-jobs";
import { adminQuery } from "../factories/admin-sql";
import { assertLocalStack, LOCAL_TEST_QUOTE_PDF_KEY_ID, LOCAL_TEST_QUOTE_PDF_SECRET,
  LOCAL_TEST_BOOKING_CONFLICT_KEY_ID, LOCAL_TEST_BOOKING_CONFLICT_SECRET } from "./test-env";
import { establishCurrentQuotePdf } from "./quote-pdf";

export const jobDepthTables = ["jobs", "job_members", "job_required_work_roles", "job_access_windows", "job_dependencies"] as const;
export type JobCardInput = {
  commandId: string; id?: string; type: "order" | "projekt"; title: string;
  customer_id: string; facility_id: string; contact_id: string;
  priority: "low" | "normal" | "high" | "urgent";
  estimated_duration_minutes: number | null; planned_travel_minutes: number | null;
  crew_size: number | null; earliest_date: string | null; desired_date: string | null;
  latest_date: string | null; customer_presence_required: boolean;
  requiredWorkRoleIds: string[] | null;
  accessWindows: { startsAt: string; endsAt: string }[] | null;
  dependencyJobIds: string[];
};
export type CardResult = { ok: true; data: { jobId: string } } | { ok: false; code: string; message: string };
export type JobHandle = { id: string; title: string };
export type DepthSnapshot = Record<"jobs" | "members" | "roles" | "windows" | "dependencies" |
  "bookings" | "assignees" | "conflicts" | "audit", DurableRow[]>;

/** Read whole tenant state, including private command outcomes on jobs/bookings.
 * Deliberately includes foreign tenant state and all audit rows: rollback cannot
 * hide a stray child, outcome, refreshed conflict or unrelated-tenant write.
 */
export async function jobsDepthSnapshot(tenantIds: string[]): Promise<DepthSnapshot> {
  const entries = [
    ["jobs", "jobs"], ["members", "job_members"], ["roles", "job_required_work_roles"],
    ["windows", "job_access_windows"], ["dependencies", "job_dependencies"],
    ["bookings", "bookings"], ["assignees", "booking_assignees"],
    ["conflicts", "booking_conflicts"], ["audit", "audit_events"],
  ] as const;
  return Object.fromEntries(await Promise.all(entries.map(async ([key, table]) => [key,
    (await adminQuery<{ row: DurableRow }>(`select to_jsonb(t) as row from public.${table} t
      where tenant_id=any($1::uuid[]) order by to_jsonb(t)::text`, [tenantIds])).map((r) => r.row),
  ]))) as DepthSnapshot;
}

/** Lazy actual command seam. Proposed export names only; production must implement
 * the approved job.card.create/update commands. No assertion can pass via a stub.
 */
export async function invokeJobCard(client: TestServerClient, operation: "create" | "update",
  input: JobCardInput | Record<string, unknown>, correlationId = crypto.randomUUID()): Promise<CardResult> {
  const diagnosticClient = new Proxy(client, { get(target, key) {
    if (key === "rpc") return async (name: string, args: Record<string, unknown>) => {
      const reply = await target.rpc(name, args);
      const code = reply.error?.code;
      if ((name === "snapshot_job_card" || name === "finalize_job_card") && typeof code === "string"
        && /^[0-9A-Z]{5}$/.test(code)
        && !["42501", "23503", "23514", "22P02", "22007", "22008", "22003", "BK409"].includes(code)) {
        // Only the closed RPC name and validated SQLSTATE leave this test adapter.
        console.error(`E16 ${name} SQLSTATE ${code}`);
      }
      return reply;
    };
    const value = Reflect.get(target, key, target);
    return typeof value === "function" ? value.bind(target) : value;
  } });
  return runCommand(operation === "create" ? createJobCard : updateJobCard,
    { client: diagnosticClient as never, input, correlationId });
}

/** Invoked test-worker setup only: production commands still require configured proofs.
 * Validate both pairs before changing any variable; never adopt a half/foreign pair.
 */
export function configureJobsDepthFixtureProofs(): void {
  assertLocalStack();
  const pairs = [
    ["QUOTE_PDF_ATTESTATION_KEY_ID", "QUOTE_PDF_ATTESTATION_HMAC_SECRET", LOCAL_TEST_QUOTE_PDF_KEY_ID, LOCAL_TEST_QUOTE_PDF_SECRET],
    ["BOOKING_CONFLICT_ATTESTATION_KEY_ID", "BOOKING_CONFLICT_ATTESTATION_HMAC_SECRET", LOCAL_TEST_BOOKING_CONFLICT_KEY_ID, LOCAL_TEST_BOOKING_CONFLICT_SECRET],
  ] as const;
  for (const [idName, secretName, localId, localSecret] of pairs) {
    const id = process.env[idName], secret = process.env[secretName];
    if ((id !== undefined || secret !== undefined) && (id !== localId || secret !== localSecret)) {
      throw new Error("Jobs fixture requires matching complete local-test proof configuration");
    }
  }
  for (const [idName, secretName, localId, localSecret] of pairs) {
    process.env[idName] ??= localId;
    process.env[secretName] ??= localSecret;
  }
}
export async function createJobsDepthFixture() {
  configureJobsDepthFixtureProofs();
  const roleFixture = await t.createRoleAwarePhaseAFixture();
  try {
    const { base, users } = roleFixture;
    async function profile(tenantId: string, userId: string) {
      const [m] = await adminQuery<{ id: string }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [tenantId, userId]);
      const [p] = await adminQuery<{ id: string }>("insert into public.person_profiles(tenant_id,membership_id) values($1,$2) returning id", [tenantId, m.id]);
      return { id: p.id, membershipId: m.id };
    }
    const adminProfile = await profile(base.tenantA.id, base.adminA.id);
    const ownProfile = await profile(base.tenantA.id, users.montor.id);
    const coworkerProfile = await profile(base.tenantA.id, users.projektledare.id);
    const foreignProfile = await profile(base.tenantB.id, base.adminB.id);
    const adminClient = await t.makeAuthedServerClient(base.adminA);
    const plannerClient = await t.makeAuthedServerClient(users.projektledare);
    const montorClient = await t.makeAuthedServerClient(users.montor);
    const foreignClient = await t.makeAuthedServerClient(base.adminB);
    const fx: BookingFixture = { ...roleFixture, adminProfile, ownProfile, coworkerProfile,
      foreignProfile, adminClient, plannerClient, montorClient, foreignClient,
      tenantIds: [base.tenantA.id, base.tenantB.id] };
    const parents = await seedBookingParents(base.tenantA.id);
    async function basic(title: string, foreign = false): Promise<JobHandle> {
      const customer = foreign ? await t.adminInsertCustomer({ tenant_id: base.tenantB.id,
        customer_type: "company", display_name: "Foreign workshop" }) : parents.customerId;
      const result = await runCommand(createJob, { client: (foreign ? foreignClient : adminClient) as never,
        correlationId: crypto.randomUUID(), input: { customer_id: customer, title } });
      if (!result.ok) throw new Error(`Existing createJob fixture refused: ${result.code}`);
      return { id: result.data.targetId, title };
    }
    const jobs = { memberOrder: await basic("Member order"), assigneeProject: await basic("Assigned project"),
      both: await basic("Member and assigned"), unrelated: await basic("Unrelated order"),
      foreign: await basic("Foreign order", true), acceptedAssigned: await acceptedJob(),
      editable: await basic("Editable card"), prerequisite: await basic("Prerequisite") };
    await adminQuery("update public.jobs set type='projekt' where id=$1", [jobs.assigneeProject.id]);
    for (const job of [jobs.memberOrder, jobs.both, jobs.acceptedAssigned]) await adminQuery(
      "insert into public.job_members(tenant_id,job_id,person_profile_id) values($1,$2,$3)",
      [base.tenantA.id, job.id, ownProfile.id]);
    for (const [i, job] of [jobs.assigneeProject, jobs.both].entries()) {
      const input = bookingInput([ownProfile.id], { jobId: job.id,
        startsAt: `2026-10-${12 + i}T06:00:00.000Z`, endsAt: `2026-10-${12 + i}T07:00:00.000Z` });
      const saved = await bookingCommand("create", adminClient, input);
      if (!saved.ok) throw new Error(`Existing booking fixture refused: ${saved.code}`);
    }
    return { fx, jobs, identity: { customerId: parents.customerId, facilityId: parents.facilityId,
      contactId: parents.contactId }, roleId: parents.workRoleId, parents,
      credentials: { manager: users.projektledare, assignedWorker: users.montor },
      snapshot: () => jobsDepthSnapshot(fx.tenantIds),
      dispose: () => t.cleanupRoleAwarePhaseAFixture(roleFixture) };

    async function acceptedJob(): Promise<JobHandle> {
      // Preserve actual original send/accept signatures and IDs; E16 only adds type/safe read discrimination.
      const customerId = await t.adminInsertCustomer({ tenant_id: base.tenantA.id,
        customer_type: "company", display_name: "Accepted source customer" });
      await adminQuery("update public.customers set email=$2 where id=$1", [customerId, `e16-${crypto.randomUUID()}@example.test`]);
      const calculationId = await t.adminInsertCalculation({ tenant_id: base.tenantA.id, customer_id: customerId });
      const quoteId = await t.adminInsertQuote({ tenant_id: base.tenantA.id, customer_id: customerId });
      const versionId = await t.adminInsertQuoteVersion({ tenant_id: base.tenantA.id, quote_id: quoteId,
        calculation_id: calculationId, status: "draft", accepted_price_ore: 125000 });
      await establishCurrentQuotePdf({ client: adminClient, tenantId: base.tenantA.id,
        quoteVersionId: versionId, actorUserId: base.adminA.id, occurredAt: new Date().toISOString() });
      const sent = await runCommand(markQuoteVersionSent, { client: adminClient as never,
        correlationId: crypto.randomUUID(), input: { quote_version_id: versionId,
          recipient_source_type: "customer", recipient_source_id: customerId } });
      if (!sent.ok) throw new Error(`Existing send refused: ${sent.code}`);
      const accepted = await runCommand(acceptQuoteAndCreateJob, { client: adminClient as never,
        correlationId: crypto.randomUUID(), input: { quote_version_id: versionId,
          accepted_at: new Date().toISOString(), accepted_price_ore: 125000, channel: "verbal", title: "Accepted source customer" } });
      if (!accepted.ok) throw new Error(`Existing acceptance refused: ${accepted.code}`);
      const [job] = await adminQuery<{ id: string }>("select id from public.jobs where quote_acceptance_id=$1", [accepted.data.acceptanceId]);
      return { id: job.id, title: "Accepted source customer" };
    }
  } catch (error) { await t.cleanupRoleAwarePhaseAFixture(roleFixture); throw error; }
}
export type JobsDepthFixture = Awaited<ReturnType<typeof createJobsDepthFixture>>;
export async function withJobsDepthFixture(run: (f: JobsDepthFixture) => Promise<void>) {
  const fixture = await createJobsDepthFixture();
  try { await run(fixture); } finally { await fixture.dispose(); }
}
export function cardInput(f: JobsDepthFixture, patch: Partial<JobCardInput> = {}): JobCardInput {
  return { commandId: crypto.randomUUID(), id: f.jobs.editable.id, type: "order", title: "Workshop rewiring",
    customer_id: f.identity.customerId, facility_id: f.identity.facilityId, contact_id: f.identity.contactId,
    priority: "high", estimated_duration_minutes: 120, planned_travel_minutes: 30, crew_size: 2,
    earliest_date: "2026-10-12", desired_date: "2026-10-13", latest_date: "2026-10-14",
    customer_presence_required: true, requiredWorkRoleIds: [f.roleId],
    accessWindows: [{ startsAt: "2026-10-12T06:00:00Z", endsAt: "2026-10-12T14:00:00Z" }],
    dependencyJobIds: [f.jobs.prerequisite.id], ...patch };
}

/** Proposed readMyJobs signature is deliberately isolated here. Detail uses actual
 * readJobDetail(client,id); an activated test must reconcile DTO names, never fake it.
 */
export async function readMyJobs(client: TestServerClient): Promise<{ rows: readonly { id: string }[]; error: string | null }> {
  return readMyJobsModel(client);
}
export function protectedPaths(value: unknown, path = ""): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => {
    const next = `${path}.${key}`;
    return [/accepted_?price|source_?sent_?total|cost_?rate|sell_?rate|price_?ore|margin|profit|total_?ore/i.test(key) ? [next] : [],
      protectedPaths(child, next)].flat();
  });
}

/** Real H4 fixture rows: callers supply an existing same-tenant job/customer chain. */
export async function seedJobDepthChildren(tenantId: string, actorId: string, jobId: string, workRoleId: string) {
  const [{id:profileId}] = await adminQuery<{id:string}>(`insert into public.person_profiles(tenant_id,membership_id)
    select $1,id from public.tenant_memberships where tenant_id=$1 and user_id=$2
    on conflict(membership_id) do update set membership_id=excluded.membership_id returning id`, [tenantId,actorId]);
  const [{id:prerequisite}] = await adminQuery<{id:string}>(`insert into public.jobs(tenant_id,customer_id,title)
    select tenant_id,customer_id,'H4 prerequisite' from public.jobs where tenant_id=$1 and id=$2 returning id`,[tenantId,jobId]);
  await adminQuery("insert into public.job_members(tenant_id,job_id,person_profile_id) values($1,$2,$3)",[tenantId,jobId,profileId]);
  await adminQuery("insert into public.job_required_work_roles(tenant_id,job_id,work_role_id) values($1,$2,$3)",[tenantId,jobId,workRoleId]);
  await adminQuery("insert into public.job_access_windows(tenant_id,job_id,starts_at,ends_at) values($1,$2,'2026-10-12T06:00:00Z','2026-10-12T07:00:00Z')",[tenantId,jobId]);
  await adminQuery("insert into public.job_dependencies(tenant_id,job_id,prerequisite_job_id) values($1,$2,$3)",[tenantId,jobId,prerequisite]);
  for (const table of jobDepthTables.slice(1)) {
    const [{count}] = await adminQuery<{count:number}>(`select count(*)::int count from public.${table} where tenant_id=$1 and job_id=$2`,[tenantId,jobId]);
    if (count !== 1) throw new Error(`H4 ${table} fixture must contain one real child`);
  }
}
