import type { JobCardRpcClient } from "./my-jobs";
export type JobMembersProjection = {
  readonly members: readonly {readonly id: string; readonly personProfileId: string; readonly label: string; readonly designation: "member" | "arbetsledare"}[];
  readonly leadPersonProfileId: string | null;
  readonly eligiblePeople: readonly {readonly id: string; readonly label: string}[];
  readonly expectedState: string;
  readonly plannedStartDate: string | null; readonly plannedEndDate: string | null;
  readonly canManageCrew: boolean; readonly canSetLead: boolean; readonly canUpdatePlannedDates: boolean;
};
async function clientOrDefault(client?: JobCardRpcClient): Promise<JobCardRpcClient> {
  return client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
}
/** Explicit DTO construction: raw auth/profile/CRM records never cross the read boundary. */
export async function readJobMembers(client: JobCardRpcClient | undefined, jobId: string): Promise<JobMembersProjection> {
  const {data, error} = await (await clientOrDefault(client)).rpc("read_job_members", {p_job_id: jobId});
  if (error || !data || typeof data !== "object") throw new Error("job members read failed");
  const r = data as JobMembersProjection;
  if (!Array.isArray(r.members) || !Array.isArray(r.eligiblePeople) || typeof r.expectedState !== "string") throw new Error("invalid job member projection");
  return {members: r.members.map((m) => ({id: m.id, personProfileId: m.personProfileId, label: m.label, designation: m.designation})),
    leadPersonProfileId: r.leadPersonProfileId, eligiblePeople: r.eligiblePeople.map((p) => ({id: p.id, label: p.label})),
    expectedState: r.expectedState, plannedStartDate: r.plannedStartDate, plannedEndDate: r.plannedEndDate,
    canManageCrew: r.canManageCrew === true, canSetLead: r.canSetLead === true, canUpdatePlannedDates: r.canUpdatePlannedDates === true};
}
export const JOB_MEMBERS_READ_FAILED = "Uppgifterna kunde inte hämtas. Försök igen.";
export type JobMembersReadResult = {readonly ok: true; readonly projection: JobMembersProjection}
  | {readonly ok: false; readonly message: string};
/** Page-facing member failures retain the already authorized job and expose no raw error. */
export async function readJobMembersForPage(client: JobCardRpcClient | undefined, jobId: string): Promise<JobMembersReadResult> {
  try { return {ok: true, projection: await readJobMembers(client, jobId)}; }
  catch { return {ok: false, message: JOB_MEMBERS_READ_FAILED}; }
}
export type JobLeadAdmissionResult = {readonly ok: true; readonly admitted: boolean} | {readonly ok: false; readonly message: string};
/** False is an authorization fact; unavailable authority remains a retryable failure. */
export async function readJobLeadAdmission(tenantId: string, client?: JobCardRpcClient): Promise<JobLeadAdmissionResult> {
  try {
    const {data, error} = await (await clientOrDefault(client)).rpc("read_job_lead_admission", {p_tenant_id: tenantId});
    if (error || typeof data !== "boolean") throw new Error("job admission unavailable");
    return {ok: true, admitted: data};
  } catch { return {ok: false, message: JOB_MEMBERS_READ_FAILED}; }
}
