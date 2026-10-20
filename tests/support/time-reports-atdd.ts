/** Story 15.4 real checked-command fixtures. No service/database work at import time. */
import { adminQuery, adminSession } from "../factories/admin-sql";
import { admin, makeAuthedServerClient, seedRoleAwarePhaseAUsers, deleteAuthUser, type TestServerClient } from "../factories/tenants";
import { withBookingFixture, type BookingFixture, seedBookingParents } from "./bookings-atdd";

import { fileTimeReport } from "@/server/commands/time-reports/file-time-report";
import { annotateTimeReport } from "@/server/commands/time-reports/annotate-time-report";
import { runCommand, type CommandDbClient } from "@/server/commands/envelope";
import { readTimeReports } from "@/server/read-models/time-reports";
import { emitTimeReportNudges } from "@/server/notifications/time-report-nudge-producer";
import type { ReportInput, AnnotationInput, TimeReportQuery, TimeReportReadResult } from "@/features/time-reports/types";
export type { ReportInput, AnnotationInput } from "@/features/time-reports/types";
export type ReportResult = Awaited<ReturnType<typeof fileReport>>;
export const reportPublicColumns = "id,tenant_id,user_id,report_date,duration_minutes,booking_id,job_id,note,status,booked_minutes_at_filing,created_at,review_note,reviewed_by,reviewed_at,review_revision";
export const reportPrivateColumns = ["filing_attempt_id", "filing_digest", "review_attempt_id", "review_digest"] as const;
export function reportInput(patch: Partial<ReportInput> = {}): ReportInput {
  return { attemptId: crypto.randomUUID(), date: "2026-10-12", minutes: 450,
    note: "Installerade belysning i verkstaden", bookingId: null, jobId: null, ...patch };
}

// Execute the actual request-bound adapters with this fixture's ordinary client.
export async function fileReport(client: TestServerClient, input: ReportInput, correlationId = crypto.randomUUID()) {
  return runCommand(fileTimeReport, { client: client as unknown as CommandDbClient, input, correlationId });
}
export async function annotateReport(client: TestServerClient, input: AnnotationInput, correlationId = crypto.randomUUID()) {
  return runCommand(annotateTimeReport, { client: client as unknown as CommandDbClient, input, correlationId });
}
// Direct checked authenticated RPCs bypass the TS envelope on purpose.
export async function checkedFileReport(client: TestServerClient, tenantId: string, actorId: string, input: ReportInput, correlationId = crypto.randomUUID()) {
  return client.rpc("file_time_report", { p_tenant_id: tenantId, p_actor_id: actorId,
    p_attempt_id: input.attemptId, p_payload: input, p_correlation_id: correlationId });
}
export async function checkedAnnotateReport(client: TestServerClient, tenantId: string, actorId: string, input: AnnotationInput, correlationId = crypto.randomUUID()) {
  return client.rpc("annotate_time_report", { p_tenant_id: tenantId, p_actor_id: actorId,
    p_attempt_id: input.attemptId, p_payload: input, p_correlation_id: correlationId });
}
export function reportId(result: ReportResult): string {
  if (!result.ok) throw new Error(`Expected persisted report; got ${result.code}`);
  return result.data.reportId;
}
export type TimeReportFixture = BookingFixture & { clients: Record<string, TestServerClient> };
function throwFixtureFailures(primary:{error:unknown}|undefined,cleanupErrors:unknown[],message:string):void {
  if(primary&&!cleanupErrors.length)throw primary.error;
  const errors=primary?[primary.error,...cleanupErrors]:cleanupErrors;
  if(errors.length)throw new AggregateError(errors,message,primary?{cause:primary.error}:undefined);
}
export async function withTimeReportFixture(run: (fx: TimeReportFixture) => Promise<void>) {
  await withBookingFixture(async fx => {
    const users = { admin: fx.base.adminA, planner: fx.users.projektledare, own: fx.users.montor,
      seller: fx.users.saljare, economy: fx.users.ekonomi, mixed: fx.roleUnionUser,
      invited: fx.invitedUser, disabled: fx.disabledUser, orphan: fx.base.orphanUser, foreign: fx.base.adminB };
    const reused: Record<string,TestServerClient> = {admin:fx.adminClient,planner:fx.plannerClient,own:fx.montorClient,foreign:fx.foreignClient};
    const clients = Object.fromEntries(await Promise.all(Object.entries(users).map(async ([key, user]) => [key, reused[key] ?? await makeAuthedServerClient(user)])));
    let primary:{error:unknown}|undefined;const cleanupErrors:unknown[]=[];
    try { await run({ ...fx, clients }); } catch(error) { primary={error}; }
    try { await cleanupOwnedTimeReports(fx.tenantIds); } catch(error) { cleanupErrors.push(error); }
    throwFixtureFailures(primary,cleanupErrors,"Time-report callback and/or owned report cleanup failed");
  });
}
export async function setRoles(tenantId: string, userId: string, primary: string, supplemental: string[] = [], status = "active") {
  await adminQuery("update public.tenant_memberships set role=$3,status=$4 where tenant_id=$1 and user_id=$2", [tenantId, userId, primary, status]);
  await adminQuery("delete from public.membership_roles where tenant_id=$1 and membership_id in(select id from public.tenant_memberships where tenant_id=$1 and user_id=$2)", [tenantId, userId]);
  for (const role of supplemental) await adminQuery("insert into public.membership_roles(tenant_id,membership_id,role) select tenant_id,id,$3 from public.tenant_memberships where tenant_id=$1 and user_id=$2", [tenantId, userId, role]);
}
export async function seedReportBooking(fx: BookingFixture, opts: { tenantId?: string; profileIds?: string[]; startsAt?: string; endsAt?: string; jobId?: string | null; status?: string } = {}) {
  const id = crypto.randomUUID(), tenantId = opts.tenantId ?? fx.base.tenantA.id;
  await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,status,job_id,create_command_id,create_payload_digest,create_result)
    values($1,$2,$3,$4,'Report fixture',$5,$6,$7,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))`,
  [id, tenantId, opts.startsAt ?? "2026-10-12T06:00:00Z", opts.endsAt ?? "2026-10-12T14:00:00Z", opts.status ?? "planned", opts.jobId ?? null, crypto.randomUUID()]);
  for (const profileId of opts.profileIds ?? [fx.ownProfile.id]) await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)", [tenantId, id, profileId]);
  return id;
}
export async function seedReportJob(tenantId: string) {
  const parents = await seedBookingParents(tenantId), id = crypto.randomUUID();
  await adminQuery("insert into public.jobs(id,tenant_id,customer_id,title) values($1,$2,$3,'Tidrapport verkstad')", [id, tenantId, parents.customerId]);
  return id;
}
/** Physical, tenant-scoped state, independent of read-model projections. */
export async function reportState(tenantIds: string[]) {
  const read = async (table: string) => (await adminQuery<{ row: Record<string, unknown> }>(
    `select to_jsonb(t) row from public.${table} t where tenant_id=any($1::uuid[]) order by id`, [tenantIds])).map(x => x.row);
  const [reports, audit, notifications, bookings, assignments, conflicts, resolutions, jobs] = await Promise.all(
    ["time_reports", "audit_events", "notifications", "bookings", "booking_assignees", "booking_conflicts", "booking_conflict_resolutions", "jobs"].map(read));
  return { reports, audit, notifications, bookings, assignments, conflicts, resolutions, jobs };
}
export function observeRpcCodes(client: TestServerClient) {
  const codes: string[] = [];
  const observed = new Proxy(client, { get(target, key) {
    if (key === "rpc") return async (name: string, args: Record<string, unknown>) => {
      const result = await target.rpc(name, args); if (result.error?.code) codes.push(result.error.code); return result;
    };
    const value = Reflect.get(target, key, target); return typeof value === "function" ? value.bind(target) : value;
  } });
  return { client: observed, codes };
}
/** SQL lock barrier: no sleeps, wait for the actual backend to block on this tenant. */
export async function whileTenantBlocked<T>(tenantId: string, start: () => Promise<T>, mutate: () => Promise<void>): Promise<T> {
  let pending: Promise<T> | undefined;
  await adminSession(async ({ query }) => {
    await query("begin");
    try {
      const [owner] = await query<{ pid: number }>("select pg_backend_pid() pid,pg_advisory_xact_lock(hashtextextended($1,0))", [tenantId]);
      pending = start();
      const deadline = Date.now() + 10_000;
      let blocked = false;
      while (!blocked && Date.now() < deadline) {
        const [row] = await adminQuery<{ blocked: boolean }>("select exists(select 1 from pg_stat_activity where $1=any(pg_blocking_pids(pid))) blocked", [owner.pid]);
        blocked = row.blocked;
      }
      if (!blocked) throw new Error("Tenant lock barrier not reached; no race evidence");
      await mutate(); await query("commit");
    } catch (error) {
      await query("rollback"); if (pending) await pending.catch(() => undefined); throw error;
    }
  });
  return pending!;
}
/** ONLY the two allocated serial files may call this. Root must provide an exclusive
 * isolated DB; parallel integration group must have settled. No seed/shared hook edits.
 * Trigger proves an in-transaction business stage, then raises a unique SQLSTATE.
 */
export async function withReportAuditFault<T>(scope: { tenantId: string; correlationId: string; attemptId?: string; reportId?: string;
  recipientId?: string; date?: string; stage: "filing" | "annotation" | "nudge" }, run: () => Promise<T>) {
  const name = `tr_atdd_${crypto.randomUUID().replaceAll("-", "")}`;
  for (const id of [scope.tenantId, scope.correlationId, scope.attemptId, scope.reportId, scope.recipientId].filter(Boolean))
    if (!/^[a-f0-9-]{36}$/i.test(id!)) throw new Error("Fault scope requires generated UUIDs");
  if (scope.date && !/^\d{4}-\d{2}-\d{2}$/.test(scope.date)) throw new Error("Invalid fault date");
  const code = scope.stage === "filing" ? "P5401" : scope.stage === "annotation" ? "P5402" : "P5403";
  const stage = scope.stage === "filing"
    ? `exists(select 1 from public.time_reports r where r.tenant_id=new.tenant_id and r.filing_attempt_id='${scope.attemptId}'::uuid and r.id=new.target_id)`
    : scope.stage === "annotation"
      ? `exists(select 1 from public.time_reports r where r.tenant_id=new.tenant_id and r.id='${scope.reportId}'::uuid and r.review_attempt_id='${scope.attemptId}'::uuid and r.id=new.target_id)`
      : `exists(select 1 from public.notifications n where n.tenant_id=new.tenant_id and n.recipient_user_id='${scope.recipientId}'::uuid and n.category='time_report.nudge' and n.logical_subject_id='${scope.recipientId}'::uuid and n.logical_period='${scope.date}'::date and n.id=new.target_id)`;
  await adminQuery(`create function test_support.${name}() returns trigger language plpgsql set search_path='' as $$ begin
    if new.tenant_id='${scope.tenantId}'::uuid and new.correlation_id='${scope.correlationId}'::uuid then
      if not (${stage}) then raise exception 'time report intended stage absent' using errcode='P5499'; end if;
      raise exception 'time report stage verified' using errcode='${code}'; end if; return new; end $$;
    revoke all on function test_support.${name}() from public,anon,authenticated,service_role;
    create trigger ${name} before insert on public.audit_events for each row execute function test_support.${name}()`);
  // Await the complete callback (including every Promise.all race) before teardown.
  try { return { value: await run(), sqlstate: code }; }
  finally {
    await adminQuery(`drop trigger ${name} on public.audit_events;drop function test_support.${name}()`);
    const [remaining] = await adminQuery<{ n: number }>(`select ((select count(*) from pg_trigger where tgname=$1)+
      (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='test_support' and p.proname=$1))::int n`, [name]);
    if (remaining.n !== 0) throw new Error(`Owned fault object cleanup failed: ${name}`);
  }
}

/** Inject the existing LOCAL-only test service-JWT client into the real producer.
 * Dedicated SUPABASE_TEST_* authority belongs to tenants::admin()/test-env;
 * application NEXT_PUBLIC_* config is neither required nor mutated by fixtures.
 */
export async function jobsClient() {
  const { assertLocalStack } = await import("./test-env");
  assertLocalStack();
  return admin();
}
export async function produceNudges(client: TestServerClient, tenantId: string, options: { asOf: string; cursor?: string; correlationId?: string }) {
  return emitTimeReportNudges(client, tenantId, options);
}
export async function readReports(client: TestServerClient, query: TimeReportQuery): Promise<TimeReportReadResult> {
  return readTimeReports(query, { client });
}

/** >25 genuine eligible recipients without changing shared seed users. */
/** Test-local removal of immutable children before the owning factory removes users.
 * Transaction-local bypass is confined to the explicit owned tenants and connection.
 * Never changes production functions, grants or a shared trigger.
 */
export async function cleanupOwnedTimeReports(tenantIds: readonly string[]) {
  if (!tenantIds.length || tenantIds.some(id => !/^[a-f0-9-]{36}$/i.test(id))) throw new Error("Owned tenant UUIDs required");
  await adminSession(async ({ query }) => {
    await query("begin");
    try {
      await query("set local session_replication_role=replica");
      await query("delete from public.time_reports where tenant_id=any($1::uuid[])", [tenantIds]);
      await query("commit");
    } catch (error) { await query("rollback"); throw error; }
  });
}

/** Seed a genuine submitted row under its actor JWT/SQL role, with real command audit. */
export async function seedCheckedReport(tenantId: string, actorId: string, input = reportInput()) {
  return adminSession(async ({ query }) => {
    await query("begin");
    try {
      await query("select set_config('request.jwt.claim.sub',$1,true)", [actorId]);
      await query("set local role authenticated");
      const [row] = await query<{ result: { reportId: string } }>(
        "select public.file_time_report($1::uuid,$2::uuid,$3::uuid,$4::jsonb,$5::uuid) result",
        [tenantId, actorId, input.attemptId, JSON.stringify(input), crypto.randomUUID()]);
      if (!row?.result.reportId) throw new Error("Checked report fixture did not persist");
      await query("commit");
      return row.result.reportId;
    } catch (error) { await query("rollback"); throw error; }
  });
}

export async function withNudgeRecipients(fx: TimeReportFixture, run: (recipients: Array<{ userId: string; profileId: string }>) => Promise<void>) {
  const tenantId=fx.base.tenantA.id,ownedUsers:string[]=[],ownedProfiles:string[]=[],ownedBookings:string[]=[];
  const recipients:Array<{userId:string;profileId:string}>=[];
  let primary:{error:unknown}|undefined;const cleanupErrors:unknown[]=[];
  try {
    for (let batch = 0; batch < 9; batch++) {
      const extra = await seedRoleAwarePhaseAUsers(fx.base);
      ownedUsers.push(...extra.extraUsers.map(u => u.id));
      for (const user of [extra.users.projektledare, extra.users.montor, extra.roleUnionUser]) {
        const profileId = crypto.randomUUID();
        ownedProfiles.push(profileId);
        await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id) select $1,$2,id from public.tenant_memberships where tenant_id=$2 and user_id=$3", [profileId, tenantId, user.id]);
        ownedBookings.push(await seedReportBooking(fx, { profileIds: [profileId], startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" }));
        recipients.push({ userId: user.id, profileId });
      }
    }
    await run(recipients);
  } catch(error) { primary={error}; }
  // The awaited callback must settle all producer/race promises before cleanup.
  // Restrictive assignment -> profile -> membership FKs require this order.
  // Every normal-enforcement delete is limited to this tenant + generated IDs;
  // unexpected foreign references fail loudly rather than being removed.
  const cleanup=[
    async()=>{await cleanupOwnedTimeReports([tenantId]);},
    async()=>{if(ownedBookings.length&&ownedProfiles.length)await adminQuery("delete from public.booking_assignees where tenant_id=$1 and booking_id=any($2::uuid[]) and person_profile_id=any($3::uuid[])",[tenantId,ownedBookings,ownedProfiles]);},
    async()=>{if(ownedBookings.length)await adminQuery("delete from public.bookings where tenant_id=$1 and id=any($2::uuid[])",[tenantId,ownedBookings]);},
    async()=>{if(ownedProfiles.length)await adminQuery(`delete from public.person_profiles p using public.tenant_memberships m
      where p.tenant_id=$1 and p.id=any($2::uuid[]) and m.tenant_id=p.tenant_id and m.id=p.membership_id and m.user_id=any($3::uuid[])`,[tenantId,ownedProfiles,ownedUsers]);},
  ];
  for(const remove of cleanup) {
    try { await remove(); } catch(error) { cleanupErrors.push(error); }
  }
  const removed=await Promise.allSettled(ownedUsers.map(userId=>deleteAuthUser(userId)));
  for(const result of removed)if(result.status==="rejected")cleanupErrors.push(result.reason);
  throwFixtureFailures(primary,cleanupErrors,"Nudge recipient callback and/or owned fixture cleanup failed");
}
