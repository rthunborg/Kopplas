import { describe, expect, test } from "vitest";
import { runCommand, type Command } from "@/server/commands/envelope";
import { createBookingSeries } from "@/server/commands/bookings/create-booking-series";
import { createJobCard } from "@/server/commands/jobs/save-job-card";
import { adminQuery } from "../../factories/admin-sql";
import { bookingCommand, bookingSnapshot, seedBookingParents, withBookingFixture,
  type BookingFixture, type DurableRow } from "../../support/bookings-atdd";
import { loadBookingEditorBindings } from "../../support/booking-editor-atdd";
import { realSeriesInput, reviewRealSeries } from "../../support/booking-series-atdd";

/* Provider source: current envelope, editor production fixture, sole detector,
 * series-conflicts and save-job-card; frozen spec15.3 + current-contracts-and-design.
 * No independent provider boundary/Pact; utils package/runner gates are closed.
 * All cases remain RED/unexecuted. Resume ONLY after real resolver SQL/command,
 * allocated isolated REQUIRED DB lane and the normalization below are reconciled.
 * No response schema exists yet: assertions cover only the behavioral projection.
 */
type Group = { logicalId: string; keys: string[]; bookingIds: string[]; status: string };
type Attempt = { commandId: string; bookingId: string; action: "move" | "accept";
  targetLogicalIds: string[]; candidate?: Record<string, unknown>; review?: {
    receipt: string; reviewedLogicalIds: string[]; selectedLogicalIds: string[]; reason: string } };
type Preview = { receipt: string; groups: Group[]; factDigest: string; baselineDigest: string };
type Result = { ok: true; data: { actionId: string; resolvedLogicalIds: string[] } }
  | { ok: false; code: string; message: string };
/* TEST-OWNED normalization contract, NOT an approved production API. At activation
 * bind these candidate export/signature names to actual exports; keep real Results,
 * signed receipts and identifiers. Never implement them as fabricated responses. */
async function resolver() {
  const commandPath = "@/server/commands/bookings/resolve-booking-conflict";
  const previewPath = "@/server/bookings/conflict-resolution";
  const commandModule = await import(commandPath);
  const previewModule = await import(previewPath);
  expect(commandModule.resolveBookingConflict, "Missing real resolveBookingConflict command").toBeDefined();
  expect(previewModule.previewBookingConflictResolution, "Bind actual resolver preview export/signature").toBeTypeOf("function");
  return {
    preview: previewModule.previewBookingConflictResolution as (client: BookingFixture["plannerClient"], input: Attempt) => Promise<Preview>,
    save: (fx: BookingFixture, input: Attempt, correlationId = crypto.randomUUID()) =>
      runCommand(commandModule.resolveBookingConflict as Command<Attempt, { actionId: string; resolvedLogicalIds: string[] }>,
        { client: fx.plannerClient as never, input, correlationId }) as Promise<Result>,
  };
}
async function rows(table: string, fx: BookingFixture): Promise<DurableRow[]> {
  // Closed table names below only; full physical rows, private outcomes/timestamps retained.
  return (await adminQuery<{ row: DurableRow }>(`select to_jsonb(t) as row from public.${table} t
    where tenant_id=any($1::uuid[]) order by to_jsonb(t)::text`, [fx.tenantIds])).map(r => r.row);
}
async function snapshot(fx: BookingFixture) {
  return { ...await bookingSnapshot(fx.tenantIds), series: await rows("booking_series", fx),
    history: await rows("booking_conflict_resolutions", fx), notifications: await rows("notifications", fx),
    preferences: await rows("notification_preferences", fx) };
}
async function seeded(fx: BookingFixture) {
  const editor = await loadBookingEditorBindings();
  const plan = await editor.seedMixed(fx, "update");
  const preview = await editor.preview(fx.plannerClient, "update", plan.input);
  expect(preview.ok).toBe(true);
  if (!preview.ok) throw new Error(preview.code);
  expect(await editor.save(fx.plannerClient, "update", { ...plan.input, decision: {
    receipt: preview.data.receipt, acknowledged: true,
    reviewedLogicalIds: preview.data.warnings.map(w => w.naturalKey), selectedLogicalIds: [],
    reason: "Reviewed literal four-booking fixture" } }, crypto.randomUUID())).toMatchObject({ ok: true });
  return plan;
}
async function reviewed(fx: BookingFixture, draft: Attempt, selected: string[] = []) {
  const b = await resolver();
  const p = await b.preview(fx.plannerClient, draft);
  return { b, p, input: { ...draft, review: { receipt: p.receipt,
    reviewedLogicalIds: p.groups.map(g => g.logicalId), selectedLogicalIds: selected,
    reason: "Coordinated with affected electricians" } } };
}
function committed(result: Result) {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(`Real resolver rejected: ${result.code}`);
  return result.data;
}
const sorted = (values: string[]) => [...values].sort();
const targetRows = (rs: DurableRow[], keys: string[]) => rs.filter(r => keys.includes(String(r.natural_key)));

// Skip reason for every case: resolver production seam/normalization and isolated DB
// admission are absent. Unskip only after binding; these are obligations, not coverage.
describe("Story15.3 checked resolver ATDD (unexecuted RED)", () => {
  test.skip("[P0] 15.3-INT-001 move commits only reviewed overlay, resolved associations and immutable event (AC4/6/8)", async () => {
    await withBookingFixture(async fx => {
      const plan = await seeded(fx);
      const attempt = await reviewed(fx, { commandId: crypto.randomUUID(), bookingId: plan.input.bookingId!, action: "move",
        targetLogicalIds: plan.expectedGroups.map(g => g.naturalKey), candidate: { ...plan.canonicalCandidate,
          startsAt: "2026-10-14T06:00:00Z", endsAt: "2026-10-14T07:00:00Z" } });
      const before = await snapshot(fx);
      const result = committed(await attempt.b.save(fx, attempt.input));
      const after = await snapshot(fx);
      expect(sorted(result.resolvedLogicalIds)).toEqual(sorted(plan.expectedGroups.map(g => g.naturalKey)));
      const resolved = targetRows(after.conflicts, plan.expectedGroups.flatMap(g => g.persistedKeys));
      expect(resolved).toHaveLength(plan.expectedGroups.flatMap(g => g.persistedKeys).length);
      for (const row of resolved) expect(row).toMatchObject({ status: "resolved", resolved_by_membership_id: fx.coworkerProfile.membershipId,
        resolved_at: expect.any(String), resolution_outcome: expect.any(String) });
      expect(after.bookings.filter(r => r.id !== plan.input.bookingId)).toEqual(before.bookings.filter(r => r.id !== plan.input.bookingId));
      expect(after.assignees).toEqual(before.assignees);
      expect(after.history).toHaveLength(before.history.length + 1);
      expect(after.audit).toHaveLength(before.audit.length + 1);
      for (const [table, values] of Object.entries(after)) expect(values.filter(r => r.tenant_id === fx.base.tenantB.id))
        .toEqual(before[table as keyof typeof before].filter(r => r.tenant_id === fx.base.tenantB.id));
      const messages = after.notifications.filter(r => r.category === "booking.changed" && r.logical_subject_id === result.actionId);
      expect(messages.map(r => r.recipient_user_id)).toEqual([fx.users.montor.id]);
      expect(messages[0]?.route).toMatch(/^\/scheduling(?:[/?]|$)/);
      expect(messages[0]?.route).not.toContain("conflicts");
    });
  });

  test.skip("[P0] 15.3-INT-002 accepts complete selected group only, rejects partial/unrelated/blank, changes no occurrence (AC5/7/8)", async () => {
    await withBookingFixture(async fx => {
      const plan = await seeded(fx), selected = plan.selected;
      const draft: Attempt = { commandId: crypto.randomUUID(), bookingId: plan.input.bookingId!, action: "accept",
        targetLogicalIds: [selected.naturalKey] };
      const attempt = await reviewed(fx, draft, [selected.naturalKey]);
      expect(selected.persistedKeys.length).toBeGreaterThan(1);
      const before = await snapshot(fx);
      for (const invalid of [ { ...attempt.input, review: { ...attempt.input.review, reason: " \n\t " } },
        { ...attempt.input, targetLogicalIds: [selected.persistedKeys[0]!] },
        { ...attempt.input, targetLogicalIds: plan.unrelatedKeys } ]) {
        expect(await attempt.b.save(fx, invalid)).toMatchObject({ ok: false });
        expect(await snapshot(fx)).toEqual(before);
      }
      committed(await attempt.b.save(fx, attempt.input));
      const after = await snapshot(fx);
      expect(after.bookings).toEqual(before.bookings); // includes is_exception, nominal date, updated_at and outcomes
      expect(after.assignees).toEqual(before.assignees);
      expect(after.series).toEqual(before.series);
      expect(sorted(after.conflicts.filter(r => r.status === "accepted").map(r => String(r.natural_key))))
        .toEqual(sorted(selected.persistedKeys));
      expect(targetRows(after.conflicts, plan.otherReviewedKeys)).toEqual(targetRows(before.conflicts, plan.otherReviewedKeys));
    });
  });

  test.skip("[P0] 15.3-INT-003 genuine preview rejects workflow-only and editable-only stale baseline (AC3/4/5/8)", async () => {
    for (const change of ["workflow", "description", "customer"] as const) await withBookingFixture(async fx => {
      const plan = await seeded(fx);
      const attempt = await reviewed(fx, { commandId: crypto.randomUUID(), bookingId: plan.input.bookingId!, action: "accept",
        targetLogicalIds: [plan.selected.naturalKey] }, [plan.selected.naturalKey]);
      // Receipt is issued by the real preview; never alter unsigned claims or mock verifier.
      if (change === "workflow") await adminQuery("update public.booking_conflicts set status='accepted',acceptance_reason='Other current decision',accepted_by_membership_id=$2,accepted_at=clock_timestamp() where natural_key=$1 and tenant_id=$3",
        [plan.selected.persistedKeys[0], fx.coworkerProfile.membershipId, fx.base.tenantA.id]);
      else if (change === "description") await adminQuery("update public.bookings set description='Current edited description' where id=$1", [plan.input.bookingId]);
      else { const parents = await seedBookingParents(fx.base.tenantA.id);
        await adminQuery("update public.bookings set customer_id=$2 where id=$1", [plan.input.bookingId, parents.customerId]); }
      const current = await attempt.b.preview(fx.plannerClient, attempt.input);
      expect(current.factDigest).toBe(attempt.p.factDigest);
      expect(current.baselineDigest).not.toBe(attempt.p.baselineDigest);
      const before = await snapshot(fx);
      expect(await attempt.b.save(fx, attempt.input)).toMatchObject({ ok: false });
      expect(await snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.3-INT-004 identical concurrent replay writes once; changed key and revoked replay write nothing (AC6/8)", async () => {
    await withBookingFixture(async fx => {
      const plan = await seeded(fx);
      const a = await reviewed(fx, { commandId: crypto.randomUUID(), bookingId: plan.input.bookingId!, action: "accept",
        targetLogicalIds: [plan.selected.naturalKey] }, [plan.selected.naturalKey]);
      const before = await snapshot(fx);
      const results = await Promise.all([a.b.save(fx, a.input), a.b.save(fx, structuredClone(a.input))]);
      committed(results[0]!); expect(results[1]).toEqual(results[0]);
      const after = await snapshot(fx);
      expect(after.history.length - before.history.length).toBe(1);
      expect(after.audit.length - before.audit.length).toBe(1);
      expect(await a.b.save(fx, a.input)).toEqual(results[0]);
      expect(await snapshot(fx)).toEqual(after);
      expect(await a.b.save(fx, { ...a.input, review: { ...a.input.review, reason: "Changed same-key intent" } })).toMatchObject({ ok: false });
      expect(await snapshot(fx)).toEqual(after);
      await adminQuery("update public.tenant_memberships set status='inactive' where id=$1", [fx.coworkerProfile.membershipId]);
      const revoked = await snapshot(fx);
      expect(await a.b.save(fx, a.input)).toMatchObject({ ok: false });
      expect(await snapshot(fx)).toEqual(revoked);
      // Lock-observed revocation WHILE waiting and lost-response/expired-proof replay
      // need allocated observers. Promise.all alone is NOT evidence of actual lock wait.
    });
  });

  test.skip("[P0] 15.3-INT-005 all three actual effective writers retain resolved rows then reopen returning identities (AC5/6/8)", async () => {
    for (const writer of ["single", "series", "job-card"] as const) await withBookingFixture(async fx => {
      const plan = await seeded(fx);
      const a = await reviewed(fx, { commandId: crypto.randomUUID(), bookingId: plan.input.bookingId!, action: "move",
        targetLogicalIds: plan.expectedGroups.map(g => g.naturalKey), candidate: { ...plan.canonicalCandidate,
          startsAt: "2026-10-14T06:00:00Z", endsAt: "2026-10-14T07:00:00Z" } });
      committed(await a.b.save(fx, a.input));
      const terminal = await snapshot(fx), keys = plan.expectedGroups.flatMap(g => g.persistedKeys);
      expect(targetRows(terminal.conflicts, keys).every(r => r.status === "resolved")).toBe(true);
      const refresh = async () => {
        if (writer === "single") return bookingCommand("update", fx.plannerClient, { ...plan.input,
          bookingId: plan.peerIds[0], commandId: crypto.randomUUID(), description: "Actual single refresh" });
        if (writer === "series") { const base = realSeriesInput(fx); const input = realSeriesInput(fx, { commandId: crypto.randomUUID(), rule: { ...base.rule, startDate: "2026-11-02", count: 1 }, template: { ...base.template, startsAt: "2026-11-02T06:00:00Z", endsAt: "2026-11-02T07:00:00Z", assigneeIds: [fx.adminProfile.id] } });
          const review = await reviewRealSeries(fx, input, { client: fx.plannerClient, actorId: fx.users.projektledare.id });
          return runCommand(createBookingSeries, { client: fx.plannerClient as never, input: review.input }); }
        const p = await seedBookingParents(fx.base.tenantA.id);
        return runCommand(createJobCard, { client: fx.plannerClient as never, input: {
          commandId: crypto.randomUUID(), type: "order", title: "Actual job-card refresh",
          customer_id: p.customerId, facility_id: p.facilityId, contact_id: p.contactId,
          priority: "normal", estimated_duration_minutes: null, planned_travel_minutes: null, crew_size: null,
          earliest_date: null, desired_date: null, latest_date: null, customer_presence_required: false,
          requiredWorkRoleIds: null, accessWindows: null, dependencyJobIds: [] } });
      };
      expect(await refresh()).toMatchObject({ ok: true });
      expect(targetRows((await snapshot(fx)).conflicts, keys)).toEqual(targetRows(terminal.conflicts, keys));
      // Local fixture setup restores literal facts WITHOUT calling any refresh writer.
      await adminQuery("update public.bookings set starts_at=$2,ends_at=$3 where id=$1", [plan.input.bookingId, plan.input.startsAt, plan.input.endsAt]);
      expect(await refresh()).toMatchObject({ ok: true });
      const reopened = await snapshot(fx);
      const returning = targetRows(reopened.conflicts, keys);
      expect(returning).toHaveLength(keys.length);
      for (const row of returning) expect(row).toMatchObject({ status: "open", resolved_at: null, resolved_by_membership_id: null, resolution_outcome: null });
      expect(reopened.history).toEqual(terminal.history);
      expect(await a.b.save(fx, a.input)).toMatchObject({ ok: true });
      expect(await snapshot(fx)).toEqual(reopened);
    });
  });
  test.skip("[P0] 15.3-INT-006 failure after real acceptance before audit rolls back every physical row (AC4/5/6/8)", async () => {
    await withBookingFixture(async fx => {
      const plan = await seeded(fx), editor = await loadBookingEditorBindings();
      const a = await reviewed(fx, { commandId: crypto.randomUUID(), bookingId: plan.input.bookingId!, action: "accept",
        targetLogicalIds: [plan.selected.naturalKey] }, [plan.selected.naturalKey]);
      const before = await snapshot(fx), correlation = crypto.randomUUID();
      // Existing helper installs only owned correlation-scoped local fault machinery.
      // Activation requires isolated serial DDL allocation and resolver correlation binding.
      const fault = await editor.withFault(fx, correlation, "before_audit", () => a.b.save(fx, a.input, correlation));
      expect(fault.reached).toBe(true);
      expect(fault.acceptedKeysObserved.sort()).toEqual(plan.selected.persistedKeys.sort());
      expect(fault.value).toMatchObject({ ok: false });
      expect(await snapshot(fx)).toEqual(before);
      committed(await a.b.save(fx, a.input));
      expect((await snapshot(fx)).history).toHaveLength(before.history.length + 1);
    });
  });
});
