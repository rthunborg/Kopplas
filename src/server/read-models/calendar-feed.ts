import type { CalendarFeedAbuse, CalendarFeedStatus } from "@/features/calendar-feed/types";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { CommandError } from "@/server/commands/command-errors";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
export async function readCalendarFeedStatus(client: Client, tenantId: string, attemptId?: string): Promise<CalendarFeedStatus> {
  const { data, error } = await client.rpc("read_calendar_feed_status", { p_tenant_id: tenantId, p_attempt_id: attemptId ?? null });
  if (error?.code === "42501") throw new CommandError("TENANT_ACCESS_DENIED");
  if (error || !data || typeof data.active !== "boolean" || !Number.isSafeInteger(data.revision) || data.revision < 0 || typeof data.membershipId !== "string" || !Number.isSafeInteger(data.usageCount) || data.usageCount < 0 || (data.lastUsedAt !== null && (typeof data.lastUsedAt !== "string" || !Number.isFinite(Date.parse(data.lastUsedAt)))) || ![null, "committed", "not-found"].includes(data.attemptOutcome)) throw new Error("Calendar status unavailable");
  if ((data.attemptAction !== null && !["create", "rotate", "revoke"].includes(data.attemptAction)) || (data.attemptRevision !== null && (!Number.isSafeInteger(data.attemptRevision) || data.attemptRevision < 0))) throw new Error("Calendar status unavailable");
  return { membershipId: data.membershipId, active: data.active, revision: data.revision, usageCount: data.usageCount, lastUsedAt: data.lastUsedAt, attemptOutcome: data.attemptOutcome, attemptAction: data.attemptAction, attemptRevision: data.attemptRevision };
}
export async function readCalendarFeedSettings(options: { client?: Client; attemptId?: string } = {}): Promise<{ ok: true; status: CalendarFeedStatus; abuse: CalendarFeedAbuse | null } | { ok: false }> {
  try {
    const client = options.client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
    const context = await resolveTenantContext({ client });
    if (!context.ok || !resolveCapability({ roles: context.data.roles ?? [context.data.role], module: "scheduling", capability: "Bookings.View" }).granted) return { ok: false };
    const status = await readCalendarFeedStatus(client, context.data.tenantId, options.attemptId);
    let abuse: CalendarFeedAbuse | null = null;
    if ((context.data.roles ?? [context.data.role]).includes("tenant_admin")) {
      const { data, error } = await client.rpc("read_calendar_feed_abuse", { p_tenant_id: context.data.tenantId });
      if (error || !data || !Number.isSafeInteger(data.requests) || !Number.isSafeInteger(data.limited) || (data.lastSpikeAt !== null && typeof data.lastSpikeAt !== "string")) throw new Error("Calendar status unavailable");
      abuse = { requests: data.requests, limited: data.limited, lastSpikeAt: data.lastSpikeAt };
    }
    return { ok: true, status, abuse };
  } catch { return { ok: false }; }
}
