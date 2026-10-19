import { describe, expect, test } from "vitest";

/** Executable: AC02/03/11. Normal JWT/anon calls exercise actual RLS; no hooks contact DB.
 * Complete policy/H4 inventory remains owned by the implementation/gate suite.
 */
describe("16.1 job-depth direct boundaries", () => {
  test("[P0] 16.1-RLS-001 real roles, UNION rows, inactive actors and own-job child scope agree", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const t = await import("../../factories/tenants");
    await h.withJobsDepthFixture(async (f) => {
      const expected = [f.jobs.memberOrder.id, f.jobs.assigneeProject.id, f.jobs.both.id, f.jobs.acceptedAssigned.id].sort();
      const own = await f.fx.montorClient.from("jobs").select("id").order("id");
      expect(own.error).toBeNull();
      expect(own.data?.map((r) => r.id).sort()).toEqual(expected);
      for (const [role, user] of Object.entries(f.fx.users)) {
        const client = await t.makeAuthedServerClient(user);
        const rows = await client.from("jobs").select("id");
        expect(rows.error).toBeNull();
        const ids = rows.data?.map((r) => r.id).sort();
        if (["tenant_admin", "projektledare"].includes(role)) {
          expect(ids).toContain(f.jobs.unrelated.id);
          expect(ids).not.toContain(f.jobs.foreign.id);
        } else expect(ids).toEqual(role === "montor" ? expected : []);
      }
      for (const user of [f.fx.invitedUser, f.fx.disabledUser, f.fx.base.orphanUser]) {
        const client = await t.makeAuthedServerClient(user);
        const result = await client.from("jobs").select("id");
        expect(result.data ?? []).toEqual([]);
      }
      const union = await t.makeAuthedServerClient(f.fx.roleUnionUser);
      const all = await union.from("jobs").select("id");
      expect(all.data?.map((r) => r.id)).toContain(f.jobs.unrelated.id);
      // A child exists on an unrelated job, so empty result discriminates parent RLS.
      const saved = await h.invokeJobCard(f.fx.adminClient, "update", h.cardInput(f, { id: f.jobs.unrelated.id }));
      expect(saved.ok).toBe(true);
      for (const table of h.jobDepthTables.slice(1)) {
        const hidden = await f.fx.montorClient.from(table).select("*").eq("job_id", f.jobs.unrelated.id);
        expect(hidden.data ?? []).toEqual([]);
      }
      const anon = await t.makeAnonServerClient();
      expect((await anon.from("jobs").select("id")).data ?? []).toEqual([]);
    });
  });

  test("[P0] 16.1-RLS-002 direct mutation/elevation, foreign child FKs and spoofed checked actor leave no state", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async (f) => {
      const before = await f.snapshot();
      const attempts = [
        () => f.fx.montorClient.from("jobs").update({ title: "Unauthorized edit" }).eq("id", f.jobs.memberOrder.id).select(),
        () => f.fx.montorClient.from("job_members").insert({ tenant_id: f.fx.base.tenantA.id,
          job_id: f.jobs.unrelated.id, person_profile_id: f.fx.ownProfile.id }).select(),
        () => f.fx.montorClient.from("job_members").update({ designation: "arbetsledare" }).eq("job_id", f.jobs.memberOrder.id).select(),
        () => f.fx.montorClient.from("job_members").delete().eq("job_id", f.jobs.memberOrder.id).select(),
      ];
      for (const attempt of attempts) {
        const result = await attempt();
        expect(result.error !== null || (result.data?.length ?? 0) === 0).toBe(true);
        expect(await f.snapshot()).toEqual(before);
      }
      // BYPASSRLS setup proves the composite FK itself, not only the row policy.
      await expect(adminQuery("insert into public.job_members(tenant_id,job_id,person_profile_id) values($1,$2,$3)",
        [f.fx.base.tenantA.id, f.jobs.memberOrder.id, f.fx.foreignProfile.id])).rejects.toMatchObject({ code: "23503" });
      // RPC ARG NAMES are proposed E16 bindings; bypasses envelope and TS validation.
      const denied = await f.fx.montorClient.rpc("snapshot_job_card", { p_tenant_id: f.fx.base.tenantA.id,
        p_actor_id: f.fx.base.adminA.id, p_command_id: crypto.randomUUID(), p_correlation_id: crypto.randomUUID(),
        p_job_id: f.jobs.memberOrder.id, p_candidate_id: f.jobs.memberOrder.id, p_key_id: "test_v1", p_payload: h.cardInput(f) });
      expect(denied.error?.code).toBe("42501");
      expect(await f.snapshot()).toEqual(before);
    });
  });

  test("[P0] 16.1-RLS-002 checked entrypoints are hardened and all private job-card primitives refuse authenticated execution", async () => {
    const { adminQuery, adminSession } = await import("../../factories/admin-sql");
    const checked = await adminQuery<{ name: string; hardened: boolean; anon: boolean; authenticated: boolean }>(`select p.proname as name,
      p.prosecdef and coalesce(p.proconfig @> array['search_path=""'],false) as hardened,
      has_function_privilege('anon',p.oid,'execute') as anon,
      has_function_privilege('authenticated',p.oid,'execute') as authenticated
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname in ('snapshot_job_card','finalize_job_card')`);
    expect(checked.map((p) => p.name).sort()).toEqual(["finalize_job_card", "snapshot_job_card"]);
    for (const p of checked) expect(p).toMatchObject({ hardened: true, anon: false, authenticated: true });
    const privateEntries = await adminQuery<{ invocation: string; allowed: boolean }>(`select
      format('%I.%I(%s)',n.nspname,p.proname,(select string_agg('null::'||format_type(t,null),',' order by ordinal)
        from unnest(p.proargtypes::oid[]) with ordinality a(t,ordinal))) as invocation,
      has_function_privilege('authenticated',p.oid,'execute') as allowed
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where (n.nspname='private' and p.proname like '%job_card%')
        or (n.nspname='public' and p.proname like '%job_card%internal')`);
    expect(privateEntries.length).toBeGreaterThan(0);
    for (const p of privateEntries) {
      expect(p.allowed).toBe(false);
      await adminSession(async ({ query }) => {
        await query("begin");
        try { await query("set local role authenticated");
          await expect(query(`select ${p.invocation}`)).rejects.toMatchObject({ code: "42501" });
        } finally { await query("rollback"); }
      });
    }
    const forced = await adminQuery<{ forced: boolean; enabled: boolean }>(`select relforcerowsecurity as forced,
      relrowsecurity as enabled from pg_class where oid=any($1::regclass[])`,
      [["job_members", "job_required_work_roles", "job_access_windows", "job_dependencies"].map((t) => `public.${t}`)]);
    expect(forced).toHaveLength(4);
    expect(forced.every((r) => r.enabled && r.forced)).toBe(true);
  });
});
