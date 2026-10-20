import type { CalendarFeedAction, CalendarFeedIntent, CalendarFeedResult } from "@/features/calendar-feed/types";
import { validateCalendarFeedIntent } from "@/features/calendar-feed/validation";
import { feedKeyFromEnv, FEED_SCHEMA, MANAGE_DOMAIN, issueCalendarFeedToken, signFeedProof } from "@/server/calendar-feed/attestation";
import { readCalendarFeedStatus } from "@/server/read-models/calendar-feed";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { defineCommand, runCommand, type CommandDbClient } from "../envelope";
import { executeCalendarFeed } from "./calendar-feed-db";

/** Plaintext exists only in this invocation and its confirmed fresh response. */
export function calendarFeedCommand(action: CalendarFeedAction) {
  return defineCommand<CalendarFeedIntent, CalendarFeedResult>({
    command: `calendar_feed.${action}`, auditable: false, eventType: `calendar_feed_${action}`, targetType: "calendar_feed",
    validateInput: raw => { const result = validateCalendarFeedIntent(raw); return result.ok && result.data.action !== action ? { ok: false, code: "VALIDATION_FAILED" } : result; },
    execute: async ctx => {
      const key = feedKeyFromEnv();
      const status = await readCalendarFeedStatus(ctx.db as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>, ctx.tenantContext.tenantId, ctx.input.attemptId);
      // Reconciliation is read-only. A retry never generates a replacement hash.
      if (status.attemptOutcome === "committed") return { outcome: status.attemptAction === action && status.attemptRevision === ctx.input.revision ? "replayed" : "conflict", revision: status.revision, issuedPath: null };
      const issued = action === "revoke" ? null : issueCalendarFeedToken(), now = new Date();
      const claims = { schema: FEED_SCHEMA, domain: MANAGE_DOMAIN, operation: action, tenantId: ctx.tenantContext.tenantId, actorId: ctx.tenantContext.userId,
        membershipId: status.membershipId, revision: String(ctx.input.revision), attemptId: ctx.input.attemptId, newHash: issued?.hash ?? "", correlationId: ctx.correlationId,
        keyId: key.keyId, issuedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 60000).toISOString() };
      const result = await executeCalendarFeed(ctx.db, { p_tenant_id: claims.tenantId, p_actor_id: claims.actorId, p_membership_id: claims.membershipId,
        p_action: action, p_expected_revision: ctx.input.revision, p_attempt_id: ctx.input.attemptId, p_new_hash: issued?.hash ?? null,
        p_correlation_id: ctx.correlationId, p_claims: claims, p_signature: signFeedProof(claims, key.secret) });
      return { ...result, issuedPath: result.outcome === "committed" && issued ? `/calendar/feed/${issued.raw}` : null };
    },
  });
}
export async function manageCalendarFeed(client: CommandDbClient, input: unknown, correlationId?: string): Promise<CalendarFeedResult> {
  const validated = validateCalendarFeedIntent(input);
  if (!validated.ok) return { outcome: "denied", revision: null, issuedPath: null };
  const result = await runCommand(calendarFeedCommand(validated.data.action), { client, input, correlationId });
  if (result.ok) return result.data;
  return { outcome: result.code === "COMMAND_CONFLICT" ? "conflict" : result.code === "SERVER_ERROR" ? "unavailable" : "denied", revision: null, issuedPath: null };
}
