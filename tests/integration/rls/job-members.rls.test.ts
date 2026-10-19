import { describe, expect, test } from "vitest";

/** Active acceptance, no runtime activity on import. Normal anon-key authenticated
 * clients must hit actual PostgreSQL policies and checked RPCs. Never replace
 * these with service-role clients or mock replies to make the tests green.
 */
describe("16.2 relational job-lead RLS and checked boundaries", () => {
  // Activate after relational reads/admission and semantic member projections implement approved AC04.
  test("[P0] 16.2-RLS-001 every seeded lead role and independent role union receives own-job scope with structural money/privacy boundaries", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const t = await import("../../factories/tenants");
    const { adminQuery } = await import("../../factories/admin-sql");
    const { readJobDetail } = await import("@/features/jobs/read");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.acceptedAssigned.id; // Real accepted-price fixture makes money omission discriminating.
      for (const [role, user] of Object.entries(f.fx.users)) {
        const profile = await m.profileFor(f, user);
        await adminQuery("update public.job_members set designation='member' where tenant_id=$1 and job_id=$2", [f.fx.base.tenantA.id, job]);
        await m.seedMember(f, job, profile.id, true);
        const client = await t.makeAuthedServerClient(user);
        const detail = await readJobDetail(client as never, job);
        expect(detail).not.toBeNull();
        const projection = await m.readMembers(client, job);
        expect(projection).toMatchObject({ leadPersonProfileId: profile.id, canManageCrew: true, canUpdatePlannedDates: true,
          canSetLead: ["tenant_admin", "projektledare"].includes(role) });
        expect(projection.eligiblePeople.length).toBeGreaterThan(0);
        expect(projection.eligiblePeople.map((p) => Object.keys(p).sort())).toEqual(projection.eligiblePeople.map(() => ["id", "label"]));
        expect(JSON.stringify(projection)).not.toMatch(/"(?:email|user_metadata|app_metadata|password|personnummer)"/);
        expect((await h.readMyJobs(client)).rows.map((r) => r.id)).toContain(job);
        const isManager = ["tenant_admin", "projektledare"].includes(role);
        const unrelated = await client.from("jobs").select("id").eq("id", f.jobs.unrelated.id);
        expect(unrelated.data?.map((r) => r.id) ?? []).toEqual(isManager ? [f.jobs.unrelated.id] : []);
        expect(await readJobDetail(client as never, f.jobs.foreign.id)).toBeNull();
        expect(h.protectedPaths(detail).length > 0).toBe(["tenant_admin", "projektledare", "ekonomi"].includes(role));
        // A scoped picker must not depend on giving a lead the broad CRM/directory projection.
        if (["montor", "saljare"].includes(role)) {
          const general = await client.rpc("read_job_card_options");
          expect(general.error).toBeNull();
          expect(general.data).toMatchObject({ customers: [], facilities: [], contacts: [], projectManagers: [] });
        }
      }
      const unionProfile = await m.profileFor(f, f.fx.roleUnionUser);
      await adminQuery("update public.job_members set designation='member' where tenant_id=$1 and job_id=$2", [f.fx.base.tenantA.id, job]);
      await m.seedMember(f, job, unionProfile.id, true);
      const union = await t.makeAuthedServerClient(f.fx.roleUnionUser);
      expect(await m.readMembers(union, job)).toMatchObject({ canSetLead: true, canManageCrew: true });
      expect(h.protectedPaths(await readJobDetail(union as never, job)).length).toBeGreaterThan(0);
      expect((await m.memberCommand("remove", union, await m.memberInput(union, job, { personProfileId: unionProfile.id }))).ok).toBe(true);
      // Independently entitled manager can remove own designated membership and still read unrelated jobs.
      expect(await readJobDetail(union as never, f.jobs.unrelated.id)).not.toBeNull();
      const salesProfile = await m.profileFor(f, f.fx.users.saljare);
      await adminQuery("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,'ekonomi')", [f.fx.base.tenantA.id, salesProfile.membershipId]);
      await m.seedMember(f, job, salesProfile.id, true);
      const salesFinance = await t.makeAuthedServerClient(f.fx.users.saljare);
      expect(await m.readMembers(salesFinance, job)).toMatchObject({ canManageCrew: true, canSetLead: false });
      expect(h.protectedPaths(await readJobDetail(salesFinance as never, job)).length).toBeGreaterThan(0);
      // Original installer member OR booking-assignee union remains intact after another lead is selected.
      expect((await h.readMyJobs(f.fx.montorClient)).rows.map((r) => r.id).sort()).toEqual([
        f.jobs.memberOrder.id, f.jobs.assigneeProject.id, f.jobs.both.id, f.jobs.acceptedAssigned.id,
      ].sort());
      await adminQuery("update public.person_profiles set archived_at=statement_timestamp() where id=$1", [salesProfile.id]);
      expect((await m.readMembers(f.fx.adminClient, job)).leadPersonProfileId).toBeNull();
      expect(await readJobDetail(salesFinance as never, job)).toBeNull();
    });
  });

  // Activate after four checked mutations and eligibility checks exist; direct table grants stay SELECT-only.
  test("[P0] 16.2-RLS-002 foreign/inactive/archived/nonmember targets, spoofing and direct DML cannot bypass checked eligibility", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const t = await import("../../factories/tenants");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id;
      await m.seedMember(f, job, f.fx.ownProfile.id, true);
      const invited = await m.profileFor(f, f.fx.invitedUser);
      const disabled = await m.profileFor(f, f.fx.disabledUser);
      const archived = await m.profileFor(f, f.fx.users.saljare);
      const nonmember = await m.profileFor(f, f.fx.users.ekonomi);
      await adminQuery("update public.person_profiles set archived_at=statement_timestamp() where id=$1", [archived.id]);
      const baseline = await m.memberSnapshot(f);
      const invalid = [f.fx.foreignProfile.id, invited.id, disabled.id, archived.id];
      for (const operation of ["assign", "lead"] as const) {
        for (const personProfileId of [...invalid, ...(operation === "lead" ? [nonmember.id] : [])]) {
          const input = await m.memberInput(f.fx.adminClient, job, { personProfileId });
          expect((await m.memberCommand(operation, f.fx.adminClient, input)).ok).toBe(false);
          const direct = await m.checkedMemberCall(operation, f.fx.adminClient, f.fx.base.tenantA.id, f.fx.base.adminA.id, input);
          expect(direct.error?.code).toBe("42501");
          expect(await m.memberSnapshot(f)).toEqual(baseline);
        }
      }
      const valid = await m.memberInput(f.fx.adminClient, job, { personProfileId: nonmember.id });
      for (const [tenantId, actorId, jobId] of [
        [f.fx.base.tenantA.id, f.fx.base.adminA.id, job], // Worker JWT cannot spoof manager identity.
        [f.fx.base.tenantB.id, f.fx.users.montor.id, f.jobs.foreign.id],
        [f.fx.base.tenantA.id, f.fx.users.montor.id, f.jobs.unrelated.id],
      ]) {
        const direct = await m.checkedMemberCall("assign", f.fx.montorClient, tenantId, actorId, { ...valid, jobId });
        expect(direct.error?.code).toBe("42501");
        expect(await m.memberSnapshot(f)).toEqual(baseline);
      }
      const anon = await t.makeAnonServerClient();
      for (const client of [f.fx.adminClient, f.fx.plannerClient, f.fx.montorClient, f.fx.foreignClient, anon]) {
        const attempts = [
          () => client.from("job_members").insert({ tenant_id: f.fx.base.tenantA.id, job_id: job, person_profile_id: nonmember.id }).select(),
          () => client.from("job_members").update({ designation: "arbetsledare" }).eq("job_id", job).select(),
          () => client.from("job_members").update({ person_profile_id: f.fx.foreignProfile.id }).eq("job_id", job).select(),
          () => client.from("job_members").delete().eq("job_id", job).select(),
        ];
        for (const attempt of attempts) {
          const reply = await attempt();
          expect(reply.error !== null || (reply.data?.length ?? 0) === 0).toBe(true);
          expect(await m.memberSnapshot(f)).toEqual(baseline);
        }
      }
      // BYPASSRLS arrangement proves the composite FK itself protects this relation.
      await expect(adminQuery("insert into public.job_members(tenant_id,job_id,person_profile_id) values($1,$2,$3)",
        [f.fx.base.tenantA.id, job, f.fx.foreignProfile.id])).rejects.toMatchObject({ code: "23503" });
      expect(await m.memberSnapshot(f)).toEqual(baseline);
      for (const user of [f.fx.invitedUser, f.fx.disabledUser, f.fx.base.orphanUser]) {
        const client = await t.makeAuthedServerClient(user);
        expect((await client.from("job_members").select("id")).data ?? []).toEqual([]);
        expect((await client.from("jobs").select("id")).data ?? []).toEqual([]);
      }
    });
  });

  // Activate after migration enrolls checked entrypoints/private primitives; reconcile names in the adapter.
  test("[P0] 16.2-RLS-003 checked RPC grants and forced RLS exclude anonymous execution and private helper bypass", async () => {
    const m = await import("../../support/job-members-atdd");
    const { adminQuery, adminSession } = await import("../../factories/admin-sql");
    const names = Object.values(m.memberBindings).map((binding) => binding.rpc).sort();
    const checked = await adminQuery<{ name: string; hardened: boolean; anon: boolean; authenticated: boolean }>(`select p.proname as name,
      p.prosecdef and coalesce(p.proconfig @> array['search_path=""'],false) as hardened,
      has_function_privilege('anon',p.oid,'execute') as anon,
      has_function_privilege('authenticated',p.oid,'execute') as authenticated
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname=any($1::text[])`, [names]);
    expect(checked.map((p) => p.name).sort()).toEqual(names);
    for (const entry of checked) expect(entry).toMatchObject({ hardened: true, anon: false, authenticated: true });
    const privateEntries = await adminQuery<{ invocation: string; allowed: boolean }>(`select
      format('%I.%I(%s)',n.nspname,p.proname,(select string_agg('null::'||format_type(t,null),',' order by ordinal)
        from unnest(p.proargtypes::oid[]) with ordinality a(t,ordinal))) as invocation,
      has_function_privilege('authenticated',p.oid,'execute') as allowed
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where (n.nspname='private' or (n.nspname='public' and p.proname like '%internal'))
        and (p.proname like '%job_member%' or p.proname like '%job_lead%' or p.proname like '%job_plan_dates%')`);
    expect(privateEntries.length).toBeGreaterThan(0);
    for (const entry of privateEntries) {
      expect(entry.allowed).toBe(false);
      await adminSession(async ({ query }) => {
        await query("begin");
        try {
          await query("set local role authenticated");
          await expect(query(`select ${entry.invocation}`)).rejects.toMatchObject({ code: "42501" });
        } finally { await query("rollback"); }
      });
    }
    const [rls] = await adminQuery<{ forced: boolean; enabled: boolean }>(`select relforcerowsecurity as forced,
      relrowsecurity as enabled from pg_class where oid='public.job_members'::regclass`);
    expect(rls).toEqual({ forced: true, enabled: true });
    const grants = await adminQuery<{ role: string; mutation: boolean }>(`select r as role,
      has_table_privilege(r,'public.job_members','INSERT,UPDATE,DELETE') as mutation
      from unnest(array['anon','authenticated']) r`);
    expect(grants).toEqual([{ role: "anon", mutation: false }, { role: "authenticated", mutation: false }]);
  });
});
