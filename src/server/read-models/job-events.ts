export type SafeJobEvent = {readonly id: string; readonly eventType: string; readonly occurredAt: string};
export type JobEventsReadResult = {readonly rows: readonly SafeJobEvent[]; readonly error: string | null};
type EventQuery = PromiseLike<{data: unknown; error: unknown}> & {
  eq(column: string, value: string): EventQuery;
  order(column: string, options: {ascending: boolean}): EventQuery;
  range(from: number, to: number): EventQuery;
};
export type JobEventsClient = {from(table: string): {select(columns: string): EventQuery}};
const FAILED = "Händelserna kunde inte hämtas. Försök igen.";
/** Normal cookie/JWT client and existing current-job RLS; no audit/directory expansion. */
export async function readJobEvents(injectedClient: JobEventsClient | undefined, jobId: string): Promise<JobEventsReadResult> {
  try {
    const client: JobEventsClient = injectedClient ?? (await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient() as unknown as JobEventsClient);
    const rows: SafeJobEvent[] = [];
    for (let offset = 0; ; offset += 500) {
      const {data, error} = await client.from("job_events").select("id,event_type,occurred_at")
        .eq("job_id", jobId).order("occurred_at", {ascending: true}).order("id", {ascending: true}).range(offset, offset + 499);
      if (error || !Array.isArray(data)) throw new Error("events unavailable");
      for (const value of data) {
        if (!value || typeof value !== "object") throw new Error("invalid event");
        const row = value as Record<string, unknown>;
        if (typeof row.id !== "string" || typeof row.event_type !== "string" || typeof row.occurred_at !== "string") throw new Error("invalid event");
        rows.push({id: row.id, eventType: row.event_type, occurredAt: row.occurred_at});
      }
      if (data.length < 500) break;
    }
    return {rows, error: null};
  } catch { return {rows: [], error: FAILED}; }
}
