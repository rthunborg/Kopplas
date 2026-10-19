import { describe, expect, test } from "vitest";

/** Executable: AC02/03. readMyJobs export/result names are proposed only in the helper.
 * Direct URLs/browser boundaries are in jobs-depth.e2e.spec.ts; this exercises
 * real JWT + live read-model/RLS paths, never canned read DTOs.
 */
describe("16.1 My Jobs actual membership UNION booking assignment", () => {
  test("[P0] 16.1-INT-006 personal list contains complete duplicate-free order/project union", async () => {
    const h = await import("../../../support/jobs-depth-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const result = await h.readMyJobs(f.fx.montorClient);
      expect(result.error).toBeNull();
      expect(result.rows.map((r) => r.id).sort()).toEqual([
        f.jobs.memberOrder.id, f.jobs.assigneeProject.id, f.jobs.both.id, f.jobs.acceptedAssigned.id,
      ].sort());
      expect(new Set(result.rows.map((r) => r.id)).size).toBe(result.rows.length);
      const manager = await h.readMyJobs(f.fx.plannerClient);
      expect(manager.error).toBeNull();
      expect(manager.rows).toEqual([]); // ViewAll is separate; tenant role alone is no personal relationship.
    });
  });

  test("[P0] 16.1-INT-006 assigned accepted-source detail exposes labels but no protected values anywhere", async () => {
    const h = await import("../../../support/jobs-depth-atdd");
    const { readJobDetail } = await import("@/features/jobs/read");
    await h.withJobsDepthFixture(async (f) => {
      const worker = await readJobDetail(f.fx.montorClient as never, f.jobs.acceptedAssigned.id);
      expect(worker).not.toBeNull();
      expect(h.protectedPaths(worker)).toEqual([]);
      // Proposed semantic descriptor name; implementation reconciliation must retain explicit entitlement information.
      expect(worker).toMatchObject({ id: f.jobs.acceptedAssigned.id, entitlement: { protectedMoney: false } });
      expect(JSON.stringify(worker)).toContain("Accepted source customer");
      const entitled = await readJobDetail(f.fx.adminClient as never, f.jobs.acceptedAssigned.id);
      expect(entitled).toMatchObject({ acceptedPriceOre: 125000, sourceSentTotalOre: 125000 });
      const unassigned = await readJobDetail(f.fx.montorClient as never, f.jobs.unrelated.id);
      const foreign = await readJobDetail(f.fx.montorClient as never, f.jobs.foreign.id);
      const missing = await readJobDetail(f.fx.montorClient as never, crypto.randomUUID());
      expect([unassigned, foreign, missing]).toEqual([null, null, null]);
    });
  });

  test("[P0] 16.1-INT-006 archive, unassignment and revoked tenant membership remove current read access", async () => {
    const h = await import("../../../support/jobs-depth-atdd");
    const { adminQuery } = await import("../../../factories/admin-sql");
    const { readJobDetail } = await import("@/features/jobs/read");
    await h.withJobsDepthFixture(async (f) => {
      await adminQuery("update public.job_members set archived_at=clock_timestamp() where job_id=$1 and person_profile_id=$2", [f.jobs.memberOrder.id, f.fx.ownProfile.id]);
      await adminQuery("delete from public.booking_assignees where person_profile_id=$1 and booking_id in(select id from public.bookings where job_id=$2)", [f.fx.ownProfile.id, f.jobs.assigneeProject.id]);
      expect((await h.readMyJobs(f.fx.montorClient)).rows.map((r) => r.id).sort()).toEqual([f.jobs.both.id, f.jobs.acceptedAssigned.id].sort());
      expect(await readJobDetail(f.fx.montorClient as never, f.jobs.memberOrder.id)).toBeNull();
      // Same already-issued JWT after revocation must not retain access.
      await adminQuery("update public.tenant_memberships set status='disabled' where id=$1", [f.fx.ownProfile.membershipId]);
      const disabled = await h.readMyJobs(f.fx.montorClient);
      expect(disabled.rows).toEqual([]);
      expect(await readJobDetail(f.fx.montorClient as never, f.jobs.both.id)).toBeNull();
    });
  });
});
