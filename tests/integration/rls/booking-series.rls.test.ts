import { describe, expect, test } from "vitest";
import { loadBookingSeriesBindings, reviewed, type Fixture, type Plan,
  type Role, type SeriesBindings } from "../../support/booking-series-atdd";

/* Future RED scope: real authenticated Supabase clients and actual current checked
 * command/SQL/RLS boundary. No policy fixture/inventory/manifest modification here.
 * Provider source: permission-matrix.ts Bookings.Manage; envelope.ts;
 * 20261006122441 tenant gate, 20261007120235 replay auth locks and E16 v3 facts.
 * New series SQL names/columns/grants are not pinned by this scaffold. Adapter
 * discovers signatures including old overloads and returns test-owned projections.
 * No installed playwright-utils/Pact package and no Pact boundary: Vitest only.
 * Every skipped case is unexecuted future coverage; adapter intentionally unbound.
 */
async function scenario(run: (b: SeriesBindings, fx: Fixture, plan: Plan) => Promise<void>, kind: "clear" | "existing" = "existing") {
  const b = await loadBookingSeriesBindings();
  await b.withFixture(async (fx) => run(b, fx, await b.seed(fx, kind)));
}
async function ready(b: SeriesBindings, fx: Fixture, plan: Plan) {
  return reviewed(plan.attempt, await b.preview(fx.clients.planner, plan.attempt), [plan.selected]);
}
const ids = (rows: { id: string }[]) => rows.map((row) => row.id).sort();
const deniedRoles: Role[] = ["anonymous", "foreign", "inactive", "revoked", "montor", "sales", "economy"];

describe("Story 15.2 series/occurrence authorization ATDD (unexecuted RED)", () => {
  test.skip("[P0] 15.2-RLS-001 FORCE RLS and explicit public column grants keep all outcome/proof fields private (AC7)", async () => {
    await scenario(async (b, fx) => {
      const security = await b.tableSecurity(fx);
      expect(security.rlsEnabled).toBe(true);
      expect(security.forceRls).toBe(true);
      expect(security.privateColumns.length).toBeGreaterThan(0);
      expect(security.managerPublicColumns.length).toBeGreaterThan(0);
      expect(security.publicGrantColumns.length).toBeGreaterThan(0);
      expect(security.privateColumns.filter((column) => security.managerPublicColumns.includes(column))).toEqual([]);
      expect(security.privateColumns.filter((column) => security.publicGrantColumns.includes(column))).toEqual([]);
      const managerRead = await b.read(fx.clients.admin, fx);
      for (const column of security.privateColumns) expect(JSON.stringify(managerRead.rawBrowserPayload)).not.toContain(`"${column}"`);
    });
  });

  test.skip("[P0] 15.2-RLS-002 active Admin and PL role sets including union can create/update through checked authority (AC7)", async () => {
    for (const role of ["admin", "planner", "multiRolePlanner"] as const) {
      for (const kind of ["clear", "existing"] as const) {
      await scenario(async (b, fx, plan) => {
        // Each role gets its OWN genuine receipt bound to its actor, never a PL receipt.
        const attempt = reviewed(plan.attempt, await b.preview(fx.clients[role], plan.attempt), plan.groups.length ? [plan.selected] : []);
        const before = await b.snapshot(fx);
        const result = await b.command(fx.clients[role], attempt, fx.correlationId);
        expect(result.ok).toBe(true);
        expect(await b.snapshot(fx)).not.toEqual(before);
        expect(await b.auditFor(fx, fx.correlationId)).toEqual([{ actorId: fx.actorIds[role], event: expect.any(String), at: expect.any(String) }]);
        const ownRead = await b.read(fx.clients[role], fx);
        expect(ownRead.templates.length).toBeGreaterThan(0);
        expect(ids(ownRead.occurrences)).not.toContain(fx.foreignOccurrenceId);
        expect(JSON.stringify(ownRead.rawBrowserPayload)).not.toContain(fx.foreignMarker);
      }, kind);
      }
    }
  });

  test.skip("[P0] 15.2-RLS-003 anonymous/foreign/inactive/revoked/Montor/Sales/Economy cannot mutate series (AC7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      const before = await b.snapshot(fx);
      for (const role of deniedRoles) {
        const result = await b.command(fx.clients[role], attempt, crypto.randomUUID());
        expect(result).toMatchObject({ ok: false, kind: "denied" });
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-004 current authorization precedes private durable replay for every denied caller (AC3/7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      expect((await b.command(fx.clients.planner, attempt, fx.correlationId)).ok).toBe(true);
      const before = await b.snapshot(fx);
      for (const role of deniedRoles) {
        const result = await b.command(fx.clients[role], attempt, crypto.randomUUID());
        expect(result).toMatchObject({ ok: false, kind: "denied" });
        expect(JSON.stringify(result)).not.toContain(attempt.proposedSeriesId);
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-005 Montor sees assigned real occurrences including safe exception/tombstone metadata only (AC4/7)", async () => {
    await scenario(async (b, fx) => {
      const read = await b.read(fx.clients.montor, fx);
      expect(ids(read.occurrences)).toEqual([...fx.ownOccurrenceIds].sort());
      expect(read.templates).toEqual([]);
      expect(read.occurrences.some((row) => row.isException)).toBe(true);
      expect(read.occurrences.some((row) => row.status === "cancelled" && row.isException)).toBe(true);
      expect(ids(read.occurrences)).not.toContain(fx.peerOccurrenceId);
      expect(ids(read.occurrences)).not.toContain(fx.foreignOccurrenceId);
      const raw = JSON.stringify(read.rawBrowserPayload);
      for (const marker of [fx.templateMarker, fx.peerMarker, fx.foreignMarker]) expect(raw).not.toContain(marker);
      const security = await b.tableSecurity(fx);
      for (const column of security.privateColumns) expect(raw).not.toContain(`"${column}"`);
    });
  });

  test.skip("[P0] 15.2-RLS-006 nonmanager callers have no template/private outcome projection or foreign occurrence disclosure (AC7)", async () => {
    await scenario(async (b, fx) => {
      for (const role of deniedRoles) {
        const read = await b.read(fx.clients[role], fx);
        expect(read.templates).toEqual([]);
        const raw = JSON.stringify(read.rawBrowserPayload);
        expect(raw).not.toContain(fx.templateMarker);
        expect(raw).not.toContain(fx.foreignMarker);
        const security = await b.tableSecurity(fx);
        for (const column of security.privateColumns) expect(raw).not.toContain(`"${column}"`);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-007 foreign series/pivot/assignee/job/customer/facility/contact references reject atomically (AC7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      for (const field of ["series", "pivot", "assignee", "job", "customer", "facility", "contact"] as const) {
        const malicious = await b.foreignReference(fx, attempt, field);
        const before = await b.snapshot(fx);
        expect(await b.command(fx.clients.planner, malicious, crypto.randomUUID())).toMatchObject({ ok: false });
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-008 manager and Montor direct DML cannot forge rule, outcome or recurrence linkage (AC4/5/7)", async () => {
    await scenario(async (b, fx) => {
      for (const role of ["admin", "planner", "montor", "foreign", "anonymous"] as const) {
        for (const target of ["series", "series-rule", "series-outcome", "booking-series-id", "nominal-slot",
          "occurrence-index", "exception", "tombstone", "lineage"] as const) {
          const before = await b.snapshot(fx);
          const reply = await b.dml(fx.clients[role], fx, target);
          expect(reply.affectedRows).toBe(0);
          expect(await b.snapshot(fx)).toEqual(before);
        }
      }
    });
  });

  test.skip("[P0] 15.2-RLS-009 checked RPC cannot accept absent/unsigned human review even with otherwise genuine detector proof (AC6/7)", async () => {
    await scenario(async (b, fx, plan) => {
      const reviewedAttempt = await ready(b, fx, plan);
      const { decision: _decision, ...withoutReview } = reviewedAttempt;
      void _decision;
      const before = await b.snapshot(fx);
      const reply = await b.direct(fx.clients.planner, withoutReview);
      expect(reply.error).not.toBeNull();
      expect(reply.data).toBeNull();
      expect(await b.snapshot(fx)).toEqual(before);
    });
  });

  test.skip("[P0] 15.2-RLS-010 every checked fresh SQL overload rejects missing review and no obsolete overload bypass exists (AC6/7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      const entries = await b.sqlInventory(fx, attempt);
      expect(entries.filter((entry) => entry.kind === "checked").length).toBeGreaterThan(0);
      for (const entry of entries.filter((candidate) => candidate.kind !== "private")) {
        const { decision: _decision, ...withoutReview } = attempt;
        void _decision;
        const before = await b.snapshot(fx);
        const reply = await b.direct(fx.clients.planner, withoutReview, entry);
        expect(reply.error).not.toBeNull();
        expect(reply.data).toBeNull();
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-011 private helpers have no PUBLIC/anon/authenticated/service-role EXECUTE grants (AC7)", async () => {
    await scenario(async (b, fx, plan) => {
      const entries = (await b.sqlInventory(fx, await ready(b, fx, plan))).filter((entry) => entry.kind === "private");
      expect(entries.length).toBeGreaterThan(0);
      const acls = await b.sqlAcls(entries);
      expect(acls).toHaveLength(entries.length);
      for (const acl of acls) expect(acl).toEqual({ signature: acl.signature, publicExecute: false,
        anonExecute: false, authenticatedExecute: false, serviceRoleExecute: false });
      for (const entry of entries) {
        const before = await b.snapshot(fx);
        expect((await b.direct(fx.clients.admin, plan.attempt, entry)).error).not.toBeNull();
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P0] 15.2-RLS-012 all checked RPC entrypoints enforce caller identity and current matrix (AC7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      const entries = (await b.sqlInventory(fx, attempt)).filter((entry) => entry.kind === "checked");
      expect(entries.length).toBeGreaterThan(0);
      const before = await b.snapshot(fx);
      for (const role of deniedRoles) {
        for (const entry of entries) {
          const reply = await b.direct(fx.clients[role], attempt, entry);
          expect(reply.error).not.toBeNull();
          expect(reply.data).toBeNull();
          expect(await b.snapshot(fx)).toEqual(before);
        }
      }
    });
  });

  test.skip("[P0] 15.2-RLS-013 same-tenant SQL lineage/slot/index integrity resists direct authenticated bypass (AC5/7)", async () => {
    await scenario(async (b, fx, plan) => {
      const attempt = await ready(b, fx, plan);
      for (const attack of ["successor", "nominal-pivot", "proposed-id", "source-revision"] as const) {
        const malicious = await b.attack(fx, attempt, attack);
        const before = await b.snapshot(fx);
        expect((await b.direct(fx.clients.planner, malicious)).error).not.toBeNull();
        expect(await b.snapshot(fx)).toEqual(before);
      }
    });
  });

  test.skip("[P1] 15.2-RLS-014 authorized standalone bookings preserve valid optional-null links (AC7)", async () => {
    for (const role of ["admin", "planner"] as const) {
      await scenario(async (b, fx) => {
        const created = await b.standaloneOptionalLinks(fx, role);
        expect(created.result.ok).toBe(true);
        expect(created.row).toMatchObject({ id: created.result.bookingId, tenant_id: fx.tenantIds[0],
          job_id: null, customer_id: null, facility_id: null, contact_id: null, series_id: null, is_exception: false });
        expect(typeof created.row.id).toBe("string");
      });
    }
  });
});
