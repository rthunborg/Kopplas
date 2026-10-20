import { describe, expect, test } from "vitest";
import { readScheduling } from "@/server/read-models/scheduling";
import { defaultSchedulingInput } from "@/features/scheduling/view-preferences";
import { withBookingFixture } from "../../support/bookings-atdd";
import { loadBookingEditorBindings } from "../../support/booking-editor-atdd";

/* Provider endpoint: planned /api/scheduling/conflicts, backed by planned real
 * read-model booking-conflicts.ts; source fallback, no independent provider/CDC.
 * Response/status names are NOT implemented and are intentionally not asserted as
 * an HTTP contract. This TEST-OWNED normalized projection must bind actual exports.
 * Resume every skip only after real read model, checked scan and REQUIRED isolated DB.
 */
type Scope = { kind: "period"; start: string; end: string } | { kind: "booking"; bookingId: string };
type Read = { state: "ready" | "unknown" | "denied"; groups: {
  logicalId: string; bookingIds: string[]; keys: string[]; status: "open" | "accepted";
  startsAt: string; endsAt: string; ruleLabel: string; participants: { bookingId: string; startsAt: string; endsAt: string }[];
}[]; count: number | null; checkedAt: string | null; rawBrowserPayload: unknown };
async function reader() {
  const sourcePath = "@/server/read-models/booking-conflicts";
  const production = await import(sourcePath);
  expect(production.readBookingConflicts, "Missing real read model; reconcile candidate export/signature before activation").toBeTypeOf("function");
  return production.readBookingConflicts as (input: { scope: Scope; includeAccepted: boolean },
    options: { client: unknown }) => Promise<Read>;
}
const period: Scope = { kind: "period", start: "2026-10-11T22:00:00Z", end: "2026-10-18T22:00:00Z" };

describe("Story15.3 current complete manager conflict scan (unexecuted RED)", () => {
  test.skip("[P1] 15.3-READ-001 count/queue scope and complete aggregate detail use distinct logical groups (AC1/2/5)", async () => {
    await withBookingFixture(async fx => {
      const editor = await loadBookingEditorBindings(), plan = await editor.seedMixed(fx, "update");
      const p = await editor.preview(fx.plannerClient, "update", plan.input);
      if (!p.ok) throw new Error(p.code);
      expect(await editor.save(fx.plannerClient, "update", { ...plan.input, decision: {
        receipt: p.data.receipt, acknowledged: true, reviewedLogicalIds: p.data.warnings.map(w => w.naturalKey),
        selectedLogicalIds: [], reason: "Reviewed all literal fixture warnings" } }, crypto.randomUUID())).toMatchObject({ ok: true });
      const read = await reader();
      const queue = await read({ scope: period, includeAccepted: false }, { client: fx.plannerClient });
      const calendar = await readScheduling(defaultSchedulingInput("personal", "2026-10-12"), { client: fx.plannerClient as never });
      expect(queue.state).toBe("ready");
      expect(queue.count).toBe(new Set(queue.groups.map(g => g.logicalId)).size);
      expect(calendar.data.openConflictCount).toBe(queue.count);
      const scoped = await read({ scope: { kind: "booking", bookingId: plan.input.bookingId! }, includeAccepted: false }, { client: fx.plannerClient });
      expect(scoped.count).toBe(plan.expectedGroups.length);
      expect(scoped.groups.map(g => g.logicalId).sort()).toEqual(plan.expectedGroups.map(g => g.naturalKey).sort());
      const aggregate = scoped.groups.find(g => g.logicalId === plan.selected.naturalKey)!;
      expect(aggregate.bookingIds.sort()).toEqual(plan.selected.bookingIds.sort());
      expect(aggregate.bookingIds).toHaveLength(4);
      expect(aggregate.keys.sort()).toEqual(plan.selected.persistedKeys.sort());
      expect(aggregate.participants.map(p => p.bookingId).sort()).toEqual(plan.selected.bookingIds.sort());
      expect(aggregate.ruleLabel.trim().length).toBeGreaterThan(0);
      expect(aggregate.startsAt).toBe(plan.selected.startsAt); expect(aggregate.endsAt).toBe(plan.selected.endsAt);
      expect(JSON.stringify(queue.rawBrowserPayload)).not.toContain(plan.foreignBookingId);
      expect(JSON.stringify(queue.rawBrowserPayload)).not.toMatch(/canonicalFacts|signature|request_digest|proofTransport/);
      const own = await read({ scope: period, includeAccepted: true }, { client: fx.montorClient });
      expect(own.state).toBe("denied"); expect(own.groups).toEqual([]); expect(own.count).toBeNull();
      // Activation expansion required: persisted acceptance view and retained-resolved
      // associations must not duplicate/synthesize active aggregates; paginate >cap.
    });
  });

  test.skip("[P1] 15.3-READ-002 last checked is actual SQL fact scan time; failed scan stays unknown, never empty success (AC1/2/3/8)", async () => {
    await withBookingFixture(async fx => {
      const read = await reader();
      let actualSnapshotTime: string | undefined;
      const observed = new Proxy(fx.plannerClient, { get(target, key) {
        if (key === "rpc") return async (name: string, args: Record<string, unknown>) => {
          const reply = await target.rpc(name, args);
          if (name === "booking_conflict_resolver_snapshot" && !reply.error) actualSnapshotTime = reply.data.snapshotAt;
          return reply;
        };
        const value = Reflect.get(target, key, target); return typeof value === "function" ? value.bind(target) : value;
      } });
      const empty = await read({ scope: period, includeAccepted: false }, { client: observed });
      expect(actualSnapshotTime, "Bind actual SQL snapshot-time field; ordinary SELECT time is not detection recency").toEqual(expect.any(String));
      expect(empty).toMatchObject({ state: "ready", count: 0, groups: [], checkedAt: actualSnapshotTime });
      const broken = new Proxy(fx.plannerClient, { get(target, key) {
        if (key === "rpc") return async (name: string, args: Record<string, unknown>) => name === "booking_conflict_resolver_snapshot"
          ? { data: null, error: { code: "08006", message: "Owned test transport failure" } } : target.rpc(name, args);
        const value = Reflect.get(target, key, target); return typeof value === "function" ? value.bind(target) : value;
      } });
      const failed = await read({ scope: period, includeAccepted: false }, { client: broken });
      expect(failed).toMatchObject({ state: "unknown", count: null, groups: [], checkedAt: null });
      expect(failed.rawBrowserPayload).not.toEqual(expect.objectContaining({ signature: expect.anything() }));
      expect(await read({ scope: period, includeAccepted: false }, { client: fx.plannerClient })).toMatchObject({ state: "ready", count: 0 });
    });
  });
});
