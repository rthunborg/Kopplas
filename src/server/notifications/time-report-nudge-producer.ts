import type { SupabaseClient } from "@supabase/supabase-js";

/** A durable producer continuation retains its original seven-date window when
 * a later authenticated runner invocation resumes the same tenant page.
 */
export function timeReportNudgeAsOf(cursor: string | undefined, tenantId: string, initial: string): string {
  if (!cursor) return initial;
  try {
    const value = JSON.parse(cursor) as Record<string, unknown>;
    if (value.tenant !== tenantId || typeof value.asOf !== "string" || !Number.isFinite(Date.parse(value.asOf))) throw new Error();
    return value.asOf;
  } catch { throw new Error("Time report reminder cursor invalid"); }
}

/** The existing authenticated jobs runner injects its client and exact tenant scope.
 * SQL performs eligibility/preferences/report absence and emission in one transaction.
 */
export async function emitTimeReportNudges(client: Pick<SupabaseClient, "rpc">, tenantId: string,
  options: { readonly asOf: string; readonly cursor?: string; readonly correlationId?: string; readonly signal?: AbortSignal }): Promise<{ count: number; cursor?: string }> {
  const query = client.rpc("emit_time_report_nudges", { p_tenant_id: tenantId, p_as_of: options.asOf,
    p_cursor: options.cursor ?? null, ...(options.correlationId ? { p_correlation_id: options.correlationId } : {}) });
  options.signal?.throwIfAborted();
  const { data, error } = await (options.signal && typeof query.abortSignal === "function" ? query.abortSignal(options.signal) : query);
  if (error) throw new Error("Time report reminders failed");
  if (!data || typeof data !== "object" || Object.keys(data).sort().join(",") !== "count,cursor"
    || !Number.isInteger(data.count) || data.count < 0 || data.count > 175
    || (data.cursor !== null && typeof data.cursor !== "string")) throw new Error("Time report reminder response invalid");
  return { count: data.count, ...(data.cursor !== null ? { cursor: data.cursor } : {}) };
}
