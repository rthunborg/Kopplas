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

test("[P0] checkpoint dual-manager JWT options contain only the resolved tenant in every array and PL label",async()=>{
  const h=await import("../../../support/jobs-depth-atdd");
  const t=await import("../../../factories/tenants");
  const {seedBookingParents}=await import("../../../support/bookings-atdd");
  const {adminQuery}=await import("../../../factories/admin-sql");
  const {readJobCardOptions}=await import("@/server/read-models/my-jobs");
  await h.withJobsDepthFixture(async f=>{
    const foreign=await seedBookingParents(f.fx.base.tenantB.id);
    await adminQuery("update public.tenant_memberships set role='projektledare' where tenant_id=$1 and user_id=$2",[f.fx.base.tenantB.id,f.fx.base.adminB.id]);
    const baseline=await readJobCardOptions(f.fx.adminClient);
    expect(baseline.error).toBeNull();
    const arrays=["customers","facilities","contacts","projectManagers","workRoles","jobs"] as const;
    for(const key of arrays) expect(baseline[key].length).toBeGreaterThan(0);
    await t.adminInsertMembership({tenant_id:f.fx.base.tenantB.id,user_id:f.fx.base.adminA.id,role:"tenant_admin",status:"active"});
    await adminQuery("update public.tenant_memberships set created_at=case when tenant_id=$1 then '2026-01-01'::timestamptz else '2026-02-01'::timestamptz end where user_id=$2",[f.fx.base.tenantA.id,f.fx.base.adminA.id]);
    // Reuse the already-issued normal JWT, now independently authorized in A+B.
    const selected=await readJobCardOptions(f.fx.adminClient);
    expect(selected).toEqual(baseline);
    const foreignIds=[foreign.customerId,foreign.facilityId,foreign.contactId,f.fx.foreignProfile.id,foreign.workRoleId,f.jobs.foreign.id];
    for(const [index,key] of arrays.entries()) expect(selected[key].map(item=>item.id)).not.toContain(foreignIds[index]);
    expect(JSON.stringify(selected)).not.toContain(f.fx.base.adminB.email);
    expect((await f.fx.adminClient.rpc("read_job_card_options")).error?.code).toBe("42501");
  });
});
