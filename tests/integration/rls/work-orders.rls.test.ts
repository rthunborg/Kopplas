import { describe, expect, test } from "vitest";

/** Activated: no runtime setup on import. Requires the 16.3 migration,
 * checked commands/read projections and isolated SUPABASE_TEST_REQUIRED=1 lane.
 * All tested actors use existing anon-key JWT clients; admin SQL only arranges
 * fixtures/introspects constraints. Future schema/DTO names live in the adapter.
 */
describe("16.3 work-order parent scope, privacy and checked SQL boundaries", () => {
  // Activation: parent-scoped relational reads, per-operation flags and current role union.
  test("[P0] 16.3-RLS-001 seeded roles/union/current lead follow parent reads and assignment alone adds no authority", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const w = await import("../../support/work-orders-atdd");
    const t = await import("../../factories/tenants");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.acceptedAssigned.id;
      const id = await w.createWorkOrder(f.fx.adminClient, job);
      const foreignId = await w.createWorkOrder(f.fx.foreignClient, f.jobs.foreign.id);
      for (const [role, user] of Object.entries(f.fx.users)) {
        const profile = await m.profileFor(f, user);
        await adminQuery("update public.job_members set designation='member' where tenant_id=$1 and job_id=$2", [f.fx.base.tenantA.id, job]);
        await m.seedMember(f, job, profile.id, true);
        const client = await t.makeAuthedServerClient(user);
        const read = await w.readWorkOrders(client, job);
        const manager = ["tenant_admin", "projektledare"].includes(role);
        expect(read.rows.map((r) => r.id)).toContain(id);
        expect(read).toMatchObject({ canEditWorkOrders: true, canReopenWorkOrders: manager });
        expect((await client.from("work_orders").select("id").eq("job_id", job)).data?.map((r) => r.id)).toEqual([id]);
        expect((await client.from("work_orders").select("id").eq("id", foreignId)).data ?? []).toEqual([]);
        expect(h.protectedPaths(read)).toEqual([]);
        expect(JSON.stringify(read)).not.toMatch(/"(?:email|user_metadata|app_metadata|password|personnummer)"/);
        for (const person of read.eligiblePeople) expect(Object.keys(person).sort()).toEqual(["id", "label"]);
        const unrelatedParent = await client.from("jobs").select("id").eq("id", f.jobs.unrelated.id);
        const unrelatedChildren = await client.from("work_orders").select("id").eq("job_id", f.jobs.unrelated.id);
        if ((unrelatedParent.data ?? []).length === 0) expect(unrelatedChildren.data ?? []).toEqual([]);
        // Designation-only authority cannot grant parent full-card writes.
        if (!manager) expect((await h.invokeJobCard(client, "update", h.cardInput(f, { id: job }))).ok).toBe(false);
      }
      await adminQuery("update public.job_members set designation='member' where tenant_id=$1 and job_id=$2", [f.fx.base.tenantA.id, job]);
      expect(await w.readWorkOrders(f.fx.montorClient, job)).toMatchObject({ canEditWorkOrders: false, canReopenWorkOrders: false });
      const memberBefore = await w.workOrdersSnapshot(f);
      for (const [operation, patch] of [
        ["create", { title: "Ordinary member cannot create" }], ["update", { workOrderId: id, title: "Ordinary member cannot edit" }],
        ["assignees", { workOrderId: id, personProfileIds: [] }], ["status", { workOrderId: id, status: "in_progress" }],
        ["dependencies", { workOrderId: id, prerequisites: [] }], ["jobDependencies", { prerequisites: [] }],
      ] as const) expect((await w.checkedWorkOrderCall(operation, f.fx.montorClient, f.fx.base.tenantA.id, f.fx.users.montor.id,
        await w.workOrderInput(f.fx.adminClient, job, patch))).error?.code).toBe("42501");
      expect(await w.workOrdersSnapshot(f)).toEqual(memberBefore);
      const unionProfile = await m.profileFor(f, f.fx.roleUnionUser);
      await m.seedMember(f, job, unionProfile.id, true);
      const union = await t.makeAuthedServerClient(f.fx.roleUnionUser);
      expect(await w.readWorkOrders(union, job)).toMatchObject({ canEditWorkOrders: true, canReopenWorkOrders: true });
      // Genuine assignment is retained when its parent membership is revoked;
      // it must confer neither a read grant nor any checked mutation authority.
      const isolated = f.jobs.unrelated.id;
      await m.seedMember(f, isolated, f.fx.ownProfile.id);
      const assigned = await w.createWorkOrder(f.fx.adminClient, isolated);
      expect((await w.workOrderCommand("assignees", f.fx.adminClient, await w.workOrderInput(f.fx.adminClient, isolated,
        { workOrderId: assigned, personProfileIds: [f.fx.ownProfile.id] }))).ok).toBe(true);
      await adminQuery("update public.job_members set archived_at=statement_timestamp() where job_id=$1 and person_profile_id=$2", [isolated, f.fx.ownProfile.id]);
      expect((await f.fx.montorClient.from("jobs").select("id").eq("id", isolated)).data ?? []).toEqual([]);
      expect((await f.fx.montorClient.from("work_orders").select("id").eq("id", assigned)).data ?? []).toEqual([]);
      const denied = await w.workOrderInput(f.fx.adminClient, isolated, { workOrderId: assigned, title: "Assignee cannot write" });
      const before = await w.workOrdersSnapshot(f);
      expect((await w.checkedWorkOrderCall("update", f.fx.montorClient, f.fx.base.tenantA.id, f.fx.users.montor.id, denied)).error?.code).toBe("42501");
      expect(await w.workOrdersSnapshot(f)).toEqual(before);
      for (const user of [f.fx.invitedUser, f.fx.disabledUser, f.fx.base.orphanUser]) {
        expect((await (await t.makeAuthedServerClient(user)).from("work_orders").select("id")).data ?? []).toEqual([]);
      }
    });
  });

  // Activation: checked anonymous unknown projection and both-endpoint raw SELECT boundary.
  test("[P0] 16.3-RLS-002 hidden prerequisite becomes anonymous unknown without leaking IDs/dates/labels or picker authority", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const w = await import("../../support/work-orders-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id, hiddenParent = f.jobs.unrelated.id;
      await m.seedMember(f, job, f.fx.ownProfile.id, true);
      const dependent = await w.createWorkOrder(f.fx.adminClient, job, { planned_start_date: "2026-10-22" });
      const hidden = await w.createWorkOrder(f.fx.adminClient, hiddenParent,
        { title: "Private prerequisite calibration", planned_end_date: "2026-11-19" });
      const hiddenNew = await w.createWorkOrder(f.fx.adminClient, hiddenParent, { title: "Another hidden prerequisite" });
      expect((await w.workOrderCommand("dependencies", f.fx.adminClient, await w.workOrderInput(f.fx.adminClient, job,
        { workOrderId: dependent, prerequisites: [{ jobId: hiddenParent, workOrderId: hidden }] }))).ok).toBe(true);
      const lead = await w.readWorkOrders(f.fx.montorClient, job);
      expect(lead.dependencyWarnings).toContainEqual({ state: "unknown", dependent: {jobId: job, workOrderId: dependent} });
      const serialized = JSON.stringify(lead);
      for (const secret of [hidden, hiddenNew, hiddenParent, "Private prerequisite calibration", "2026-11-19"]) expect(serialized).not.toContain(secret);
      const raw = await f.fx.montorClient.from("work_order_dependencies").select("*").eq("dependent_job_id", job);
      expect(raw.error === null || raw.error.code === "42501").toBe(true);
      expect(raw.data ?? []).toEqual([]);
      const stable = await w.workOrdersSnapshot(f);
      // Existing inaccessible edge is retained by default without exposing its target;
      // an explicit newly submitted hidden reference must never authorize addition.
      const addition = await w.workOrderInput(f.fx.montorClient, job, { workOrderId: dependent,
        prerequisites: [{ jobId: hiddenParent, workOrderId: hiddenNew }] });
      expect((await w.checkedWorkOrderCall("dependencies", f.fx.montorClient, f.fx.base.tenantA.id, f.fx.users.montor.id, addition)).error?.code).toBe("42501");
      expect(await w.workOrdersSnapshot(f)).toEqual(stable);
      expect((await w.workOrderCommand("update", f.fx.montorClient, await w.workOrderInput(f.fx.montorClient, job,
        { workOrderId: dependent, title: "Independent field save retains hidden edge" }))).ok).toBe(true);
      expect((await w.workOrdersSnapshot(f)).workOrderDependencies).toEqual(stable.workOrderDependencies);
      expect((await w.workOrderCommand("dependencies", f.fx.montorClient, await w.workOrderInput(f.fx.montorClient, job,
        { workOrderId: dependent, prerequisites: [] }))).ok).toBe(true);
      expect((await w.workOrdersSnapshot(f)).workOrderDependencies).toEqual(stable.workOrderDependencies);
      const visible = await w.createWorkOrder(f.fx.adminClient, job, {title: "Readable prerequisite"});
      expect((await w.workOrderCommand("dependencies", f.fx.montorClient, await w.workOrderInput(f.fx.montorClient, job,
        {workOrderId: dependent, prerequisites: [{jobId: job, workOrderId: visible}]}))).ok).toBe(true);
      const edited = await w.workOrdersSnapshot(f);
      expect(edited.workOrderDependencies).toEqual(expect.arrayContaining(stable.workOrderDependencies));
      expect(edited.workOrderDependencies).toHaveLength(2);
      expect((await w.readWorkOrders(f.fx.montorClient, job)).dependencyWarnings).toContainEqual({state: "unknown", dependent: {jobId: job, workOrderId: dependent}});
      // Becoming readable after the observed form must not turn its omission into deletion.
      const observed = await w.workOrderInput(f.fx.montorClient, job, {workOrderId: dependent, prerequisites: []});
      await m.seedMember(f, hiddenParent, f.fx.ownProfile.id);
      const newlyReadable = await w.workOrdersSnapshot(f);
      expect(await w.workOrderCommand("dependencies", f.fx.montorClient, observed)).toMatchObject({ok: false, code: "PREVIEW_STALE"});
      expect(await w.workOrdersSnapshot(f)).toEqual(newlyReadable);
    });
  });

  // Activation: composite FKs, forced RLS, SELECT-only grants and hardened checked/private RPC inventory.
  test("[P0] 16.3-RLS-003 direct DML, composite parent/tenant substitution, anonymous RPC and private helper bypass fail", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const w = await import("../../support/work-orders-atdd");
    const t = await import("../../factories/tenants");
    const { adminQuery, adminSession } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id, id = await w.createWorkOrder(f.fx.adminClient, job);
      const foreign = await w.createWorkOrder(f.fx.foreignClient, f.jobs.foreign.id);
      const input = await w.workOrderInput(f.fx.adminClient, job, { workOrderId: id, title: "Bound actor" });
      const before = await w.workOrdersSnapshot(f), anon = await t.makeAnonServerClient();
      for (const client of [f.fx.adminClient, f.fx.plannerClient, f.fx.montorClient, f.fx.foreignClient, anon]) {
        const rows = [
          ["work_orders", { tenant_id: f.fx.base.tenantA.id, job_id: job, title: "Direct bypass", status: "done" }],
          ["work_order_assignees", { tenant_id: f.fx.base.tenantA.id, job_id: job, work_order_id: id, person_profile_id: f.fx.ownProfile.id }],
          ["work_order_dependencies", { tenant_id: f.fx.base.tenantA.id, dependent_job_id: job, dependent_work_order_id: id,
            prerequisite_job_id: f.jobs.foreign.id, prerequisite_work_order_id: foreign }],
        ] as const;
        for (const [table, row] of rows) for (const mutate of [
          () => client.from(table).insert(row as Record<string, unknown>).select(),
          () => client.from(table).update({ tenant_id: f.fx.base.tenantB.id }).eq("tenant_id", f.fx.base.tenantA.id).select(),
          () => client.from(table).delete().eq("tenant_id", f.fx.base.tenantA.id).select(),
        ]) {
          const reply = await mutate();
          expect(reply.error !== null || (reply.data?.length ?? 0) === 0).toBe(true);
          expect(await w.workOrdersSnapshot(f)).toEqual(before);
        }
      }
      for (const [client, tenant, actor] of [
        [f.fx.montorClient, f.fx.base.tenantA.id, f.fx.base.adminA.id],
        [f.fx.adminClient, f.fx.base.tenantB.id, f.fx.base.adminA.id],
        [anon, f.fx.base.tenantA.id, f.fx.base.adminA.id],
      ] as const) expect((await w.checkedWorkOrderCall("update", client, tenant, actor, input)).error?.code).toBe("42501");
      // BYPASSRLS arrangement proves the relational constraints independently of policy.
      for (const [sql, params] of [
        ["insert into public.work_orders(tenant_id,job_id,title) values($1,$2,'Bad parent')", [f.fx.base.tenantA.id, f.jobs.foreign.id]],
        ["insert into public.work_order_assignees(tenant_id,job_id,work_order_id,person_profile_id) values($1,$2,$3,$4)", [f.fx.base.tenantA.id, f.jobs.unrelated.id, id, f.fx.ownProfile.id]],
        ["insert into public.work_order_assignees(tenant_id,job_id,work_order_id,person_profile_id) values($1,$2,$3,$4)", [f.fx.base.tenantA.id, job, id, f.fx.foreignProfile.id]],
        ["insert into public.work_order_dependencies(tenant_id,dependent_job_id,dependent_work_order_id,prerequisite_job_id,prerequisite_work_order_id) values($1,$2,$3,$4,$5)", [f.fx.base.tenantA.id, job, id, f.jobs.unrelated.id, foreign]],
      ] as const) await expect(adminQuery(sql, params)).rejects.toMatchObject({ code: "23503" });
      expect(await w.workOrdersSnapshot(f)).toEqual(before);
    });
    const tables = ["work_orders", "work_order_assignees", "work_order_dependencies"];
    const rls = await adminQuery<{ name: string; enabled: boolean; forced: boolean; mutation: boolean }>(`select relname as name,
      relrowsecurity as enabled, relforcerowsecurity as forced,
      has_table_privilege('authenticated',c.oid,'INSERT,UPDATE,DELETE') or has_table_privilege('anon',c.oid,'INSERT,UPDATE,DELETE') as mutation
      from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and relname=any($1::text[])`, [tables]);
    expect(rls.map((r) => r.name).sort()).toEqual(tables.sort());
    for (const row of rls) expect(row).toMatchObject({ enabled: true, forced: true, mutation: false });
    const names = [...Object.values(w.workOrderBindings).map((b) => b.rpc), "reconcile_work_order_create", "document_lifecycle_source_graph_eligible", "read_job_work_orders", "story_16_3_work_order_file_owner_readable", "story_16_3_file_work_order_sources_readable", "story_16_3_work_order_storage_readable"].sort();
    const checked = await adminQuery<{ name: string; hardened: boolean; anon: boolean; authenticated: boolean }>(`select p.proname as name,
      p.prosecdef and coalesce(p.proconfig @> array['search_path=""'],false) as hardened,
      has_function_privilege('anon',p.oid,'execute') as anon, has_function_privilege('authenticated',p.oid,'execute') as authenticated
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname=any($1::text[])`, [names]);
    expect(checked.map((r) => r.name).sort()).toEqual(names);
    for (const row of checked) expect(row).toMatchObject({ hardened: true, anon: false, authenticated: true });
    const internals = await adminQuery<{ invocation: string; allowed: boolean }>(`select format('%I.%I(%s)',n.nspname,p.proname,
      (select string_agg(case when p.proname='work_order_title_internal' then quote_literal('checked-title')||'::'||format_type(t,null) else 'null::'||format_type(t,null) end,',' order by ordinal) from unnest(p.proargtypes::oid[]) with ordinality a(t,ordinal))) as invocation,
      has_function_privilege('authenticated',p.oid,'execute') as allowed from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where ((n.nspname='private' or (n.nspname='public' and p.proname like '%internal')) and p.proname like '%work_order%')
       or (n.nspname='public' and p.proname in ('story_16_3_file_link_source_eligible','story_16_3_lock_file_actor','story_16_3_assert_work_order_file_owner','story_16_3_assert_file_work_order_sources'))`);
    expect(internals.length).toBeGreaterThan(0);
    for (const row of internals) {
      expect(row.allowed).toBe(false);
      await adminSession(async ({ query }) => {
        await query("begin");
        try { await query("set local role authenticated"); await expect(query(`select ${row.invocation}`)).rejects.toMatchObject({ code: "42501" }); }
        finally { await query("rollback"); }
      });
    }
  });
});




