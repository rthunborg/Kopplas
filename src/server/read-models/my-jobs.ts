import {resolveTenantContext} from "@/server/auth/resolve-tenant-context";
import type { JobListReadResult, JobListRow } from "@/features/jobs/types";
export type JobCardOptions = {
  readonly customers: readonly { id: string; label: string }[];
  readonly facilities: readonly { id: string; label: string; customerId: string }[];
  readonly contacts: readonly { id: string; label: string; customerId: string; facilityId: string | null }[];
  readonly projectManagers: readonly { id: string; label: string }[];
  readonly workRoles: readonly { id: string; label: string }[];
  readonly jobs: readonly { id: string; label: string }[];
  readonly error: string | null;
};
export type JobCardRpcClient = { rpc(name: string, args?: Record<string, unknown>): PromiseLike<{data: unknown; error: unknown}> };
const failed = "Ett tillfälligt fel inträffade. Försök igen om en stund.";
async function clientOrDefault(client?: JobCardRpcClient): Promise<JobCardRpcClient> {
  return client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
}
export async function readMyJobs(client?: JobCardRpcClient): Promise<JobListReadResult> {
  try {
    const requestClient = await clientOrDefault(client);
    const context = await resolveTenantContext({client:requestClient as NonNullable<Parameters<typeof resolveTenantContext>[0]>["client"]});
    if (!context.ok) throw new Error("job read denied");
    const {data, error} = await requestClient.rpc("read_job_cards", {p_tenant_id:context.data.tenantId, p_personal: true, p_job_id: null});
    if (error || !Array.isArray(data)) throw new Error("job read failed");
    // Construct the public list contract explicitly; no raw persistence/outcome keys cross it.
    const rows = data.map((r: Record<string, unknown>) => ({ id: String(r.id), type: r.type, title: r.title,
      status: r.status, plannedStartDate: r.plannedStartDate, plannedEndDate: r.plannedEndDate,
      customerId: r.customerId, customerDisplayName: r.customerDisplayName,
      quoteId: r.quoteId, quoteVersionId: r.quoteVersionId, quoteNumber: r.quoteNumber, updatedAt: r.updatedAt })) as JobListRow[];
    return {rows, error: null};
  } catch { return {rows: [], error: failed}; }
}
export async function readJobCardOptions(client?: JobCardRpcClient): Promise<JobCardOptions> {
  try {
    const requestClient = await clientOrDefault(client);
    const context = await resolveTenantContext({client:requestClient as NonNullable<Parameters<typeof resolveTenantContext>[0]>["client"]});
    if (!context.ok) throw new Error("job options denied");
    const {data, error} = await requestClient.rpc("read_job_card_options", {p_tenant_id:context.data.tenantId});
    if (error || !data || typeof data !== "object") throw new Error("job options failed");
    return {...data as Omit<JobCardOptions, "error">, error: null};
  } catch { return {customers: [], facilities: [], contacts: [], projectManagers: [], workRoles: [], jobs: [], error: failed}; }
}
