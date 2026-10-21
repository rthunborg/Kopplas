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
      expect(worker).toMatchObject({ quoteId: null, quoteNumber: null });
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

test("[P0] checkpoint dual-tenant JWT job readers retain oldest active tenant across Mine, all and crafted detail", async () => {
  const h = await import("../../../support/jobs-depth-atdd");
  const m = await import("../../../support/job-members-atdd");
  const t = await import("../../../factories/tenants");
  const { adminQuery } = await import("../../../factories/admin-sql");
  const { readJobList, readJobDetail } = await import("@/features/jobs/read");
  await h.withJobsDepthFixture(async (f) => {
    const baseline = await readJobList(undefined, f.fx.adminClient as never);
    expect(baseline.error).toBeNull();
    expect(baseline.rows.length).toBeGreaterThan(0);
    await m.seedMember(f, f.jobs.acceptedAssigned.id, f.fx.adminProfile.id);
    await t.adminInsertMembership({ tenant_id: f.fx.base.tenantB.id, user_id: f.fx.base.adminA.id,
      role: "tenant_admin", status: "active" });
    await adminQuery(`update public.tenant_memberships set created_at=case when tenant_id=$1
      then '2026-01-01'::timestamptz else '2026-02-01'::timestamptz end where user_id=$2`,
    [f.fx.base.tenantA.id, f.fx.base.adminA.id]);
    const [foreignProfile] = await adminQuery<{ id: string }>(`insert into public.person_profiles(tenant_id,membership_id)
      select tenant_id,id from public.tenant_memberships where tenant_id=$1 and user_id=$2 returning id`,
    [f.fx.base.tenantB.id, f.fx.base.adminA.id]);
    await adminQuery("insert into public.job_members(tenant_id,job_id,person_profile_id) values($1,$2,$3)",
      [f.fx.base.tenantB.id, f.jobs.foreign.id, foreignProfile.id]);
    // The same previously issued JWT now has real job relationships and manager access in A+B.
    const mine = await h.readMyJobs(f.fx.adminClient);
    expect(mine.error).toBeNull();
    expect(mine.rows.map((r) => r.id)).toEqual([f.jobs.acceptedAssigned.id]);
    const all = await readJobList(undefined, f.fx.adminClient as never);
    expect(all.error).toBeNull();
    expect(all.rows.map((r) => r.id).sort()).toEqual(baseline.rows.map((r) => r.id).sort());
    expect(await readJobDetail(f.fx.adminClient as never, f.jobs.acceptedAssigned.id))
      .toMatchObject({ id: f.jobs.acceptedAssigned.id, acceptedPriceOre: 125000 });
    expect(await readJobDetail(f.fx.adminClient as never, f.jobs.foreign.id)).toBeNull();
    // Explicit B is legitimate at the checked RPC; the application resolver chooses A.
    const explicitB = await f.fx.adminClient.rpc("read_job_cards", {
      p_tenant_id: f.fx.base.tenantB.id, p_personal: true, p_job_id: null,
    });
    expect(explicitB.error).toBeNull();
    expect(explicitB.data?.map((r: { id: string }) => r.id)).toEqual([f.jobs.foreign.id]);
    const crafted = await f.fx.adminClient.rpc("read_job_cards", {
      p_tenant_id: f.fx.base.tenantA.id, p_personal: false, p_job_id: f.jobs.foreign.id,
    });
    expect(crafted.error).toBeNull();
    expect(crafted.data).toEqual([]);
  });
});

test("[P0] checkpoint source quote identity and filters agree for independently entitled managers, sales lead and sales-role union", async () => {
  const h = await import("../../../support/jobs-depth-atdd");
  const m = await import("../../../support/job-members-atdd");
  const t = await import("../../../factories/tenants");
  const { adminQuery } = await import("../../../factories/admin-sql");
  const { readMyJobs } = await import("@/server/read-models/my-jobs");
  const { readJobList, readJobDetail } = await import("@/features/jobs/read");
  await h.withJobsDepthFixture(async (f) => {
    const [source] = await adminQuery<{ quoteId: string; versionId: string; quoteNumber: string }>(`select
      qv.quote_id as "quoteId",qv.id as "versionId",qv.quote_number as "quoteNumber"
      from public.jobs j join public.quote_versions qv on qv.tenant_id=j.tenant_id and qv.id=j.quote_version_id
      where j.tenant_id=$1 and j.id=$2`, [f.fx.base.tenantA.id, f.jobs.acceptedAssigned.id]);
    expect(source).toBeDefined();
    await m.seedMember(f, f.jobs.acceptedAssigned.id, f.fx.adminProfile.id);
    await m.seedMember(f, f.jobs.acceptedAssigned.id, f.fx.coworkerProfile.id);
    const salesProfile = await m.profileFor(f, f.fx.users.saljare);
    await m.seedMember(f, f.jobs.acceptedAssigned.id, salesProfile.id, true);
    // Keep only the sales child grant: this actor's primary installer role supplies job
    // membership admission while the child sales role independently supplies Quotes.View.
    const unionProfile = await m.profileFor(f, f.fx.roleUnionUser);
    await adminQuery("update public.tenant_memberships set role='montor' where id=$1", [unionProfile.membershipId]);
    await adminQuery("delete from public.membership_roles where membership_id=$1 and role<>'saljare'", [unionProfile.membershipId]);
    await m.seedMember(f, f.jobs.acceptedAssigned.id, unionProfile.id);
    const sales = await t.makeAuthedServerClient(f.fx.users.saljare);
    const union = await t.makeAuthedServerClient(f.fx.roleUnionUser);
    for (const [client, protectedMoney] of [
      [f.fx.adminClient, true], [f.fx.plannerClient, true], [sales, false], [union, false],
    ] as const) {
      const directQuote = await client.from("quote_versions").select("id,quote_id,quote_number").eq("id", source.versionId);
      expect(directQuote.error).toBeNull();
      expect(directQuote.data).toHaveLength(1);
      const expected = { id: f.jobs.acceptedAssigned.id, quoteId: source.quoteId,
        quoteVersionId: source.versionId, quoteNumber: Number(source.quoteNumber) };
      const mine = await readMyJobs(client);
      expect(mine.error).toBeNull();
      expect(mine.rows).toHaveLength(1);
      expect(mine.rows[0]).toMatchObject(expected);
      for (const filter of [{ quoteId: source.quoteId }, { quoteVersionId: source.versionId }]) {
        const all = await readJobList(filter, client as never);
        expect(all.error).toBeNull();
        expect(all.rows).toHaveLength(1);
        expect(all.rows[0]).toMatchObject(expected);
      }
      const detail = await readJobDetail(client as never, f.jobs.acceptedAssigned.id);
      expect(detail).toMatchObject({ ...expected, entitlement: { protectedMoney } });
      if (!protectedMoney) expect(h.protectedPaths(detail)).toEqual([]);
    }
    const installerMine = await readMyJobs(f.fx.montorClient);
    expect(installerMine.error).toBeNull();
    expect(installerMine.rows.find((r) => r.id === f.jobs.acceptedAssigned.id))
      .toMatchObject({ quoteId: null, quoteVersionId: source.versionId, quoteNumber: null });
    expect(h.protectedPaths(installerMine.rows)).toEqual([]);
    const standalone = await readJobList(undefined, f.fx.adminClient as never);
    expect(standalone.error).toBeNull();
    expect(standalone.rows.find((r) => r.id === f.jobs.memberOrder.id))
      .toMatchObject({ quoteId: null, quoteVersionId: null, quoteNumber: null });
  });
});
