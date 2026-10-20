import { describe, expect, test } from "vitest";

/** 16.5 RED: each scenario gets an isolated existing fixture. Normal-client calls
 * prove direct workspace/event/child scope; no new policy/table/ACL inventory.
 */
describe("16.5 workspace current-authority and direct reader boundaries", () => {
  test("[P0] 16.5-RLS-01 direct foreign/unrelated/anonymous root and event reads reveal no job data", async () => {
    const h = await import("../../support/job-workspace-atdd");
    const t = await import("../../factories/tenants");
    await h.withWorkspaceFixture(async (f) => {
      const own = await h.readWorkspace(f.fx.montorClient, f.jobs.memberOrder.id);
      expect(own.error).toBeNull();
      expect(own.workspace?.jobId).toBe(f.jobs.memberOrder.id);
      const safeEvents = await h.readWorkspaceEvents(f.fx.montorClient, f.jobs.acceptedAssigned.id);
      expect(safeEvents.error).toBeNull();
      expect(safeEvents.rows.length).toBeGreaterThan(0);
      for (const event of safeEvents.rows) expect(Object.keys(event).sort()).toEqual(["eventType", "id", "occurredAt"]);
      const missing = await h.readWorkspace(f.fx.montorClient, crypto.randomUUID());
      for (const job of [f.jobs.foreign, f.jobs.unrelated]) {
        expect(await h.readWorkspace(f.fx.montorClient, job.id, { tab: "events" })).toEqual(missing);
        const events = await h.readWorkspaceEvents(f.fx.montorClient, job.id);
        expect(events.rows).toEqual([]);
        expect(JSON.stringify(events).includes(job.id)).toBe(false);
      }
      const anon = await t.makeAnonServerClient();
      const anonymous = await h.readWorkspace(anon, f.jobs.memberOrder.id);
      expect(anonymous.workspace).toBeNull();
      expect((await h.readWorkspaceEvents(anon, f.jobs.memberOrder.id)).rows).toEqual([]);
    });
  });

  test("[P0] 16.5-RLS-02 foreign or other-parent workOrder URL never crosses the admitted job", async () => {
    const h = await import("../../support/job-workspace-atdd");
    const wo = await import("../../support/work-orders-atdd");
    await h.withWorkspaceFixture(async (f) => {
      const own = await wo.createWorkOrder(f.fx.adminClient, f.jobs.memberOrder.id);
      const other = await wo.createWorkOrder(f.fx.adminClient, f.jobs.unrelated.id);
      const foreign = await wo.createWorkOrder(f.fx.foreignClient, f.jobs.foreign.id);
      const positive = await h.readWorkspace(f.fx.montorClient, f.jobs.memberOrder.id, { tab: "work-orders", workOrder: own });
      expect(positive.workspace?.workOrders?.rows.map((row) => row.id)).toContain(own);
      for (const childId of [other, foreign]) {
        const result = await h.readWorkspace(f.fx.montorClient, f.jobs.memberOrder.id, { tab: "work-orders", workOrder: childId });
        expect(result.workspace?.jobId).toBe(f.jobs.memberOrder.id);
        expect(result.workspace?.workOrders?.rows.every((row) => row.jobId === f.jobs.memberOrder.id)).toBe(true);
        expect(JSON.stringify(result).includes(childId)).toBe(false);
        const direct = await f.fx.montorClient.from("work_orders").select("id").eq("id", childId);
        expect(direct.error).toBeNull();
        expect(direct.data).toEqual([]);
      }
    });
  });

  test("[P0] 16.5-RLS-03 current relational lead gains only job scope and revoked membership cannot retain a workspace or stale write", async () => {
    const h = await import("../../support/job-workspace-atdd");
    const m = await import("../../support/job-members-atdd");
    const t = await import("../../factories/tenants");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withWorkspaceFixture(async (f) => {
      const profile = await m.profileFor(f, f.fx.users.saljare);
      await m.seedMember(f, f.jobs.memberOrder.id, profile.id, true);
      const lead = await t.makeAuthedServerClient(f.fx.users.saljare);
      const before = await h.readWorkspace(lead, f.jobs.memberOrder.id, { tab: "files" });
      expect(before.error).toBeNull();
      expect(before.workspace?.jobId).toBe(f.jobs.memberOrder.id);
      expect(before.workspace?.selectedTab).toBe("overview");
      expect(before.workspace?.tabs.map((tab) => tab.id)).not.toContain("files");
      expect(before.workspace?.tabs.map((tab) => tab.id)).not.toContain("schedule");
      expect(before.workspace?.detail.entitlement?.canEdit).toBe(false);
      expect(before.workspace).not.toHaveProperty("cardOptions");
      const staleInput = await m.memberInput(lead, f.jobs.memberOrder.id,
        { planned_start_date: "2026-10-25", planned_end_date: "2026-10-26" });
      await adminQuery("update public.job_members set archived_at=statement_timestamp() where tenant_id=$1 and job_id=$2 and person_profile_id=$3",
        [f.fx.base.tenantA.id, f.jobs.memberOrder.id, profile.id]);
      expect((await h.readWorkspace(lead, f.jobs.memberOrder.id)).workspace).toBeNull();
      expect((await h.readWorkspaceEvents(lead, f.jobs.memberOrder.id)).rows).toEqual([]);
      expect((await m.memberCommand("dates", lead, staleInput)).ok).toBe(false);
      const direct = await lead.from("jobs").select("id").eq("id", f.jobs.memberOrder.id);
      expect(direct.data).toEqual([]);
    });
  });
});
