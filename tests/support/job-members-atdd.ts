/** Story 16.2 RED adapter over the existing 16.1 fixture; no module-level DB work.
 * Activate only after implementing the approved -2 spec and reconciling this seam.
 * The four command names are approved. Export/RPC/input/DTO spellings below are
 * PROPOSED replaceable bindings, not additional product requirements. The expected
 * state must be issued/validated by the real server; never replace it with a mock.
 * Playwright-utils flag is true but package absent; these are Vitest normal-JWT tests.
 */
import type { TestServerClient, FixtureUser } from "../factories/tenants";
import type { JobsDepthFixture } from "./jobs-depth-atdd";

export type Operation = "assign" | "remove" | "lead" | "dates";
export const memberBindings = {
  assign: { module: "@/server/commands/jobs/job-members", export: "assignJobMember", rpc: "assign_job_member_with_audit" },
  remove: { module: "@/server/commands/jobs/job-members", export: "removeJobMember", rpc: "remove_job_member_with_audit" },
  lead: { module: "@/server/commands/jobs/job-members", export: "setJobLead", rpc: "set_job_lead_with_audit" },
  dates: { module: "@/server/commands/jobs/job-plan-dates", export: "updateJobPlanDates", rpc: "update_job_plan_dates_with_audit" },
} as const;
export type MemberInput = { commandId: string; jobId: string; expectedState: unknown;
  personProfileId?: string | null; planned_start_date?: string | null; planned_end_date?: string | null };
export type MemberResult = { ok: true; data: { jobId: string } } | { ok: false; code: string; message?: string };
export type MemberRow = { id: string; tenant_id: string; job_id: string; person_profile_id: string;
  designation: "member" | "arbetsledare"; archived_at: string | null };
export type MemberProjection = { members: { id: string; personProfileId: string; label: string }[];
  leadPersonProfileId: string | null; expectedState: unknown;
  eligiblePeople: { id: string; label: string }[];
  canManageCrew: boolean; canSetLead: boolean; canUpdatePlannedDates: boolean };

export async function readMembers(client: TestServerClient, jobId: string): Promise<MemberProjection> {
  const path = "@/server/read-models/job-members";
  const bindingModule = await import(path) as { readJobMembers: (client: TestServerClient, id: string) => Promise<MemberProjection> };
  return bindingModule.readJobMembers(client, jobId);
}
export async function memberInput(client: TestServerClient, jobId: string,
  patch: Partial<MemberInput> = {}): Promise<MemberInput> {
  return { commandId: crypto.randomUUID(), jobId, expectedState: (await readMembers(client, jobId)).expectedState, ...patch };
}
export async function memberCommand(operation: Operation, client: TestServerClient, input: MemberInput | Record<string, unknown>,
  correlationId = crypto.randomUUID()): Promise<MemberResult> {
  const { runCommand } = await import("@/server/commands/envelope");
  const binding = memberBindings[operation];
  const bindingModule = await import(binding.module) as Record<string, Parameters<typeof runCommand>[0]>;
  return runCommand(bindingModule[binding.export], { client: client as never, input, correlationId }) as Promise<MemberResult>;
}
/** Direct real checked RPC bypasses the envelope/TS validator, retaining current JWT identity. */
export function checkedMemberCall(operation: Operation, client: TestServerClient, tenantId: string, actorId: string,
  input: MemberInput, correlationId = crypto.randomUUID()) {
  const { commandId, jobId, expectedState, ...payload } = input;
  return client.rpc(memberBindings[operation].rpc, { p_tenant_id: tenantId, p_actor_user_id: actorId,
    p_command_id: commandId, p_correlation_id: correlationId, p_job_id: jobId,
    p_expected_state: expectedState, p_payload: payload });
}
export async function memberRows(f: JobsDepthFixture, jobId: string): Promise<MemberRow[]> {
  const { adminQuery } = await import("../factories/admin-sql");
  return adminQuery<MemberRow>("select * from public.job_members where tenant_id=$1 and job_id=$2 order by id", [f.fx.base.tenantA.id, jobId]);
}
export async function profileFor(f: JobsDepthFixture, user: FixtureUser) {
  const { adminQuery } = await import("../factories/admin-sql");
  const [row] = await adminQuery<{ id: string; membershipId: string }>(`insert into public.person_profiles(tenant_id,membership_id)
    select tenant_id,id from public.tenant_memberships where tenant_id=$1 and user_id=$2
    on conflict(membership_id) do update set membership_id=excluded.membership_id
    returning id,membership_id as "membershipId"`, [f.fx.base.tenantA.id, user.id]);
  if (!row) throw new Error("Existing role fixture must provide a tenant membership");
  return row;
}
/** Test arrangement only: the tested writes always use checked commands or JWT RPCs. */
export async function seedMember(f: JobsDepthFixture, jobId: string, profileId: string, lead = false) {
  const { adminQuery } = await import("../factories/admin-sql");
  await adminQuery(`insert into public.job_members(tenant_id,job_id,person_profile_id,designation)
    values($1,$2,$3,$4) on conflict(tenant_id,job_id,person_profile_id)
    do update set archived_at=null,designation=excluded.designation`,
  [f.fx.base.tenantA.id, jobId, profileId, lead ? "arbetsledare" : "member"]);
}
export async function memberSnapshot(f: JobsDepthFixture) {
  const { adminQuery } = await import("../factories/admin-sql");
  const membership = await adminQuery<{ row: Record<string, unknown> }>(`select to_jsonb(m) as row from public.tenant_memberships m
    where tenant_id=any($1::uuid[]) order by id`, [f.fx.tenantIds]);
  const roles = await adminQuery<{ row: Record<string, unknown> }>(`select to_jsonb(r) as row from public.membership_roles r
    where tenant_id=any($1::uuid[]) order by to_jsonb(r)::text`, [f.fx.tenantIds]);
  const profiles = await adminQuery<{ row: Record<string, unknown> }>(`select to_jsonb(p) as row from public.person_profiles p
    where tenant_id=any($1::uuid[]) order by id`, [f.fx.tenantIds]);
  return { ...(await f.snapshot()), tenantMemberships: membership.map((r) => r.row), tenantRoles: roles.map((r) => r.row), profiles: profiles.map((r) => r.row) };
}
export function auditFor(snapshot: Awaited<ReturnType<typeof memberSnapshot>>, correlationId: string) {
  return snapshot.audit.filter((row) => row.correlation_id === correlationId);
}
/** Observe/forward the actual final RPC. A hook can hold the existing lock barrier;
 * it may not return synthetic successful data. Used to prove an operation reached SQL. */
export function observeMemberClient(client: TestServerClient,
  beforeCall?: (name: string, args: Record<string, unknown>) => Promise<void>) {
  const calls: { name: string; args: Record<string, unknown>; data: unknown; error: unknown }[] = [];
  const proxy = new Proxy(client, { get(target, key) {
    if (key === "rpc") return async (name: string, args: Record<string, unknown>) => {
      await beforeCall?.(name, args);
      const reply = await target.rpc(name, args);
      calls.push({ name, args, data: reply.data, error: reply.error });
      return reply;
    };
    const value = Reflect.get(target, key, target);
    return typeof value === "function" ? value.bind(target) : value;
  } });
  return { client: proxy, calls };
}
