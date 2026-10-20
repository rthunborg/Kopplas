import type { CalendarFeedAction, CalendarFeedIntent, CalendarFeedResult } from "@/features/calendar-feed/types";
import { validateCalendarFeedIntent } from "@/features/calendar-feed/validation";
import { feedKeyFromEnv, FEED_SCHEMA, MANAGE_DOMAIN, issueCalendarFeedToken, signFeedProof } from "@/server/calendar-feed/attestation";
import { readCalendarFeedStatus } from "@/server/read-models/calendar-feed";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { defineCommand, runCommand, type CommandDbClient, type CommandConfig } from "../envelope";
import { executeCalendarFeed, recordCalendarFeedTrace, recordCalendarFeedContext, recordCalendarFeedMembership } from "./calendar-feed-db";

/** Plaintext exists only in execute and its confirmed fresh response. */
function calendarFeedConfig(action: CalendarFeedAction): Omit<CommandConfig<CalendarFeedIntent, CalendarFeedResult>, "command"> {
  return {
    auditable: false, eventType: `calendar_feed_${action}`, targetType: "calendar_feed",
    validateInput: raw => { const result = validateCalendarFeedIntent(raw); return result.ok && result.data.action !== action ? { ok: false, code: "VALIDATION_FAILED" } : result; },
    execute: async ctx => {
      recordCalendarFeedTrace("execute-enter");
      recordCalendarFeedContext(ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.input);
      const key = feedKeyFromEnv();
      recordCalendarFeedTrace("key-ready"); recordCalendarFeedTrace("status-enter");
      const status = await readCalendarFeedStatus(ctx.db as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>, ctx.tenantContext.tenantId, ctx.input.attemptId);
      recordCalendarFeedMembership(status.membershipId);
      // Reconciliation is read-only. A retry never generates a replacement hash.
      if (status.attemptOutcome === "committed") return { outcome: status.attemptAction === action && status.attemptRevision === ctx.input.revision ? "replayed" : "conflict", revision: status.revision, issuedPath: null };
      recordCalendarFeedTrace("proof-enter");
      const issued = action === "revoke" ? null : issueCalendarFeedToken(), now = new Date();
      const claims = { schema: FEED_SCHEMA, domain: MANAGE_DOMAIN, operation: action, tenantId: ctx.tenantContext.tenantId, actorId: ctx.tenantContext.userId,
        membershipId: status.membershipId, revision: String(ctx.input.revision), attemptId: ctx.input.attemptId, newHash: issued?.hash ?? "", correlationId: ctx.correlationId,
        keyId: key.keyId, issuedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 60000).toISOString() };
      recordCalendarFeedTrace("manage-enter");
      const result = await executeCalendarFeed(ctx.db, { p_tenant_id: claims.tenantId, p_actor_id: claims.actorId, p_membership_id: claims.membershipId,
        p_action: action, p_expected_revision: ctx.input.revision, p_attempt_id: ctx.input.attemptId, p_new_hash: issued?.hash ?? null,
        p_correlation_id: ctx.correlationId, p_claims: claims, p_signature: signFeedProof(claims, key.secret) });
      return { ...result, issuedPath: result.outcome === "committed" && issued ? `/calendar/feed/${issued.raw}` : null };
    },
  };
}
// Each mutation has one literal declaration for independent enrollment discovery.
const commands = {
  create: defineCommand<CalendarFeedIntent, CalendarFeedResult>({ command: "calendar_feed.create", ...calendarFeedConfig("create") }),
  rotate: defineCommand<CalendarFeedIntent, CalendarFeedResult>({ command: "calendar_feed.rotate", ...calendarFeedConfig("rotate") }),
  revoke: defineCommand<CalendarFeedIntent, CalendarFeedResult>({ command: "calendar_feed.revoke", ...calendarFeedConfig("revoke") }),
};
export function calendarFeedCommand(action: CalendarFeedAction) { return commands[action]; }
export async function manageCalendarFeed(client: CommandDbClient, input: unknown, correlationId?: string): Promise<CalendarFeedResult> {
  const validated = validateCalendarFeedIntent(input);
  if (!validated.ok) { recordCalendarFeedTrace("input-invalid"); return { outcome: "denied", revision: null, issuedPath: null }; }
  const result = await runCommand(calendarFeedCommand(validated.data.action), { client, input, correlationId });
  if (result.ok) { recordCalendarFeedTrace("envelope-success"); return result.data; }
  const code = result.code;
  const known = ["UNAUTHENTICATED", "TENANT_MEMBERSHIP_REQUIRED", "PERMISSION_DENIED", "VALIDATION_FAILED", "TENANT_ACCESS_DENIED", "COMMAND_CONFLICT", "SERVER_ERROR"] as const;
  const entry = known.find(value => value === code);
  recordCalendarFeedTrace(entry ? `envelope-${entry}` : "envelope-other");
  return { outcome: result.code === "COMMAND_CONFLICT" ? "conflict" : result.code === "SERVER_ERROR" ? "unavailable" : "denied", revision: null, issuedPath: null };
}
