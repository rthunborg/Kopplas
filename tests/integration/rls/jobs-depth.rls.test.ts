import { describe, expect, test } from "vitest";
import { registerJobsDepthPhaseDiagnostics } from "../../support/jobs-depth-phase-diagnostics";

/** Executable: AC02/03/11. Normal JWT/anon calls exercise actual RLS; no hooks contact DB.
 * Complete policy/H4 inventory remains owned by the implementation/gate suite.
 */
describe("16.1 job-depth direct boundaries", () => {
  test("[P0] 16.1-RLS-001 real roles, UNION rows, inactive actors and own-job child scope agree", async (context) => {
    const phase = registerJobsDepthPhaseDiagnostics(context);
    phase("import-helper", "started");
    const h = await import("../../support/jobs-depth-atdd");
    phase("import-helper", "returned");
    phase("import-tenants", "started");
    const t = await import("../../factories/tenants");
    phase("import-tenants", "returned");
    await h.withJobsDepthFixture(async (f) => {
      const expected = [f.jobs.memberOrder.id, f.jobs.assigneeProject.id, f.jobs.both.id, f.jobs.acceptedAssigned.id].sort();
      phase("assert-own-read", "started");
      const own = await f.fx.montorClient.from("jobs").select("id").order("id");
      expect(own.error).toBeNull();
      expect(own.data?.map((r) => r.id).sort()).toEqual(expected);
      phase("assert-own-read", "returned");
      for (const [role, user] of Object.entries(f.fx.users)) {
        phase("assert-role-signin", "started");
        const client = await t.makeAuthedServerClient(user);
        phase("assert-role-signin", "returned");
        phase("assert-role-read", "started");
        const rows = await client.from("jobs").select("id");
        expect(rows.error).toBeNull();
        const ids = rows.data?.map((r) => r.id).sort();
        if (["tenant_admin", "projektledare"].includes(role)) {
          expect(ids).toContain(f.jobs.unrelated.id);
          expect(ids).not.toContain(f.jobs.foreign.id);
        } else expect(ids).toEqual(role === "montor" ? expected : []);
        phase("assert-role-read", "returned");
      }
      for (const user of [f.fx.invitedUser, f.fx.disabledUser, f.fx.base.orphanUser]) {
        phase("assert-inactive-signin", "started");
        const client = await t.makeAuthedServerClient(user);
        phase("assert-inactive-signin", "returned");
        phase("assert-inactive-read", "started");
        const result = await client.from("jobs").select("id");
        expect(result.data ?? []).toEqual([]);
        phase("assert-inactive-read", "returned");
      }
      phase("assert-union-signin", "started");
      const union = await t.makeAuthedServerClient(f.fx.roleUnionUser);
      phase("assert-union-signin", "returned");
      phase("assert-union-read", "started");
      const all = await union.from("jobs").select("id");
      expect(all.data?.map((r) => r.id)).toContain(f.jobs.unrelated.id);
      phase("assert-union-read", "returned");
      // A child exists on an unrelated job, so empty result discriminates parent RLS.
      phase("assert-card-load", "started");
      const card = await h.loadCardInput(f, { id: f.jobs.unrelated.id });
      phase("assert-card-load", "returned");
      phase("assert-card-update", "started");
      const saved = await h.invokeJobCard(f.fx.adminClient, "update", card);
      expect(saved.ok).toBe(true);
      phase("assert-card-update", "returned");
      for (const table of h.jobDepthTables.slice(1)) {
        phase("assert-child-read", "started");
        const hidden = await f.fx.montorClient.from(table).select("*").eq("job_id", f.jobs.unrelated.id);
        expect(hidden.data ?? []).toEqual([]);
        phase("assert-child-read", "returned");
      }
      phase("assert-anon-client", "started");
      const anon = await t.makeAnonServerClient();
      phase("assert-anon-client", "returned");
      phase("assert-anon-read", "started");
      expect((await anon.from("jobs").select("id")).data ?? []).toEqual([]);
      phase("assert-anon-read", "returned");
    }, phase);
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
        p_job_id: f.jobs.memberOrder.id, p_candidate_id: f.jobs.memberOrder.id, p_key_id: "test_v1", p_payload: await h.loadCardInput(f) });
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


test("[P0] 16.2 lead read predicate preserves installer member/assignee union and scopes inherited child policies", async () => {
  const h = await import("../../support/jobs-depth-atdd");
  const m = await import("../../support/job-members-atdd");
  const t = await import("../../factories/tenants");
  await h.withJobsDepthFixture(async (f) => {
    const profile = await m.profileFor(f, f.fx.users.saljare);
    await m.seedMember(f, f.jobs.memberOrder.id, profile.id, true);
    const client = await t.makeAuthedServerClient(f.fx.users.saljare);
    const members = await client.from("job_members").select("job_id");
    expect(members.data?.every((r) => r.job_id === f.jobs.memberOrder.id)).toBe(true);
    expect(members.data?.length).toBeGreaterThan(0);
    for (const table of h.jobDepthTables.slice(1)) {
      const foreign = await client.from(table).select("id").eq("job_id", f.jobs.foreign.id);
      expect(foreign.data ?? []).toEqual([]);
    }
    expect((await h.readMyJobs(f.fx.montorClient)).rows.map((r) => r.id).sort()).toEqual([
      f.jobs.memberOrder.id, f.jobs.assigneeProject.id, f.jobs.both.id, f.jobs.acceptedAssigned.id,
    ].sort());
  });
});

test("[P0] checkpoint tenant-scoped options require current manager authority; noarg and private revision cannot bypass",async()=>{
  const h=await import("../../support/jobs-depth-atdd");
  const t=await import("../../factories/tenants");
  await h.withJobsDepthFixture(async f=>{
    const tenant=f.fx.base.tenantA.id;
    const entitled=await f.fx.plannerClient.rpc("read_job_card_options",{p_tenant_id:tenant});
    expect(entitled.error).toBeNull();expect(entitled.data?.customers.length).toBeGreaterThan(0);
    const union=await t.makeAuthedServerClient(f.fx.roleUnionUser);
    expect((await union.rpc("read_job_card_options",{p_tenant_id:tenant})).error).toBeNull();
    const anon=await t.makeAnonServerClient();
    for(const client of [f.fx.montorClient,f.fx.foreignClient,anon]) {
      expect((await client.rpc("read_job_card_options",{p_tenant_id:tenant})).error?.code).toBe("42501");
      expect((await client.rpc("read_job_card_options")).error?.code).toBe("42501");
    }
    expect((await f.fx.plannerClient.rpc("read_job_card_options",{p_tenant_id:f.fx.base.tenantB.id})).error?.code).toBe("42501");
    expect((await f.fx.adminClient.rpc("job_card_revision_internal",{p_tenant_id:tenant,p_job_id:f.jobs.editable.id})).error?.code).toBe("42501");
    const {adminQuery}=await import("../../factories/admin-sql");
    await adminQuery("update public.tenant_memberships set status='disabled' where tenant_id=$1 and user_id=$2",[tenant,f.fx.users.projektledare.id]);
    expect((await f.fx.plannerClient.rpc("read_job_card_options",{p_tenant_id:tenant})).error?.code).toBe("42501");
  });
});

test("[P0] checkpoint job reads deny legacy overload, null tenant, anonymous, foreign and inactive JWTs", async () => {
  const h = await import("../../support/jobs-depth-atdd");
  const t = await import("../../factories/tenants");
  await h.withJobsDepthFixture(async (f) => {
    const tenant = f.fx.base.tenantA.id;
    const anon = await t.makeAnonServerClient();
    const invited = await t.makeAuthedServerClient(f.fx.invitedUser);
    const disabled = await t.makeAuthedServerClient(f.fx.disabledUser);
    const orphan = await t.makeAuthedServerClient(f.fx.base.orphanUser);
    for (const client of [f.fx.foreignClient, anon, invited, disabled, orphan]) {
      const denied = await client.rpc("read_job_cards", {
        p_tenant_id: tenant, p_personal: false, p_job_id: f.jobs.acceptedAssigned.id,
      });
      expect(denied.error?.code).toBe("42501");
      expect(denied.data).toBeNull();
    }
    for (const client of [f.fx.adminClient, f.fx.montorClient, anon]) {
      // Omitting the explicit tenant must bind only to the revoked historical overload.
      const legacy = await client.rpc("read_job_cards", { p_personal: false, p_job_id: null });
      expect(legacy.error?.code).toBe("42501");
      expect(legacy.data).toBeNull();
    }
    const noTenant = await f.fx.adminClient.rpc("read_job_cards", {
      p_tenant_id: null, p_personal: false, p_job_id: f.jobs.acceptedAssigned.id,
    });
    expect(noTenant.error?.code).toBe("42501");
    expect(noTenant.data).toBeNull();
    const foreignTenant = await f.fx.montorClient.rpc("read_job_cards", {
      p_tenant_id: f.fx.base.tenantB.id, p_personal: false, p_job_id: f.jobs.foreign.id,
    });
    expect(foreignTenant.error?.code).toBe("42501");
    expect(foreignTenant.data).toBeNull();
    // Existing JWTs lose entry access immediately after membership revocation.
    await (await import("../../factories/admin-sql")).adminQuery(
      "update public.tenant_memberships set status='disabled' where tenant_id=$1 and user_id=$2",
      [tenant, f.fx.base.adminA.id]);
    const revoked = await f.fx.adminClient.rpc("read_job_cards", { p_tenant_id: tenant, p_personal: false });
    expect(revoked.error?.code).toBe("42501");
    expect(revoked.data).toBeNull();
  });
});

test("[P0] checkpoint explicit job-read RPC has sole authenticated grant and old overload has no client grant", async () => {
  const { adminQuery } = await import("../../factories/admin-sql");
  const rows = await adminQuery<{ signature: string; hardened: boolean; anon: boolean;
    authenticated: boolean; serviceRole: boolean; publicExecute: boolean }>(`select
    oidvectortypes(p.proargtypes) as signature,
    p.prosecdef and coalesce(p.proconfig @> array['search_path=""'],false) as hardened,
    has_function_privilege('anon',p.oid,'execute') as anon,
    has_function_privilege('authenticated',p.oid,'execute') as authenticated,
    has_function_privilege('service_role',p.oid,'execute') as "serviceRole",
    exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
      where a.grantee=0 and a.privilege_type='EXECUTE') as "publicExecute"
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='read_job_cards' order by p.pronargs`);
  expect(rows).toEqual([
    { signature: "boolean, uuid", hardened: true, anon: false, authenticated: false, serviceRole: false, publicExecute: false },
    { signature: "uuid, boolean, uuid", hardened: true, anon: false, authenticated: true, serviceRole: false, publicExecute: false },
  ]);
});

test("[P0] checkpoint assigned installer and finance-only job lead retain job access without gaining source quote identity", async () => {
  const h = await import("../../support/jobs-depth-atdd");
  const m = await import("../../support/job-members-atdd");
  const t = await import("../../factories/tenants");
  const { readMyJobs } = await import("@/server/read-models/my-jobs");
  const { readJobDetail, readJobList } = await import("@/features/jobs/read");
  await h.withJobsDepthFixture(async (f) => {
    const financeProfile = await m.profileFor(f, f.fx.users.ekonomi);
    await m.seedMember(f, f.jobs.acceptedAssigned.id, financeProfile.id, true);
    const finance = await t.makeAuthedServerClient(f.fx.users.ekonomi);
    for (const [client, protectedMoney] of [[f.fx.montorClient, false], [finance, true]] as const) {
      const raw = await client.rpc("read_job_cards", { p_tenant_id: f.fx.base.tenantA.id,
        p_personal: true, p_job_id: f.jobs.acceptedAssigned.id });
      expect(raw.error).toBeNull();
      expect(raw.data).toHaveLength(1);
      const card = raw.data[0];
      expect(card).toMatchObject({ id: f.jobs.acceptedAssigned.id, quoteId: null, quoteNumber: null,
        entitlement: { protectedMoney, canEdit: false } });
      expect(card.card.cardRevision).toBeNull();
      const detail = await readJobDetail(client as never, f.jobs.acceptedAssigned.id);
      expect(detail).toMatchObject({ id: f.jobs.acceptedAssigned.id, quoteId: null, quoteNumber: null });
      if (protectedMoney) {
        expect(card).toMatchObject({ acceptedPriceOre: 125000, sourceSentTotalOre: 125000 });
        expect(detail).toMatchObject({ acceptedPriceOre: 125000, sourceSentTotalOre: 125000 });
      } else {
        expect(h.protectedPaths(card)).toEqual([]);
        expect(h.protectedPaths(detail)).toEqual([]);
      }
      const mine = await readMyJobs(client);
      expect(mine.error).toBeNull();
      expect(mine.rows.find((r) => r.id === f.jobs.acceptedAssigned.id))
        .toMatchObject({ quoteId: null, quoteNumber: null });
      const all = await readJobList(undefined, client as never);
      expect(all.error).toBeNull();
      expect(all.rows.find((r) => r.id === f.jobs.acceptedAssigned.id))
        .toMatchObject({ quoteId: null, quoteNumber: null });
      // Narrow job projection adds no read policy or tenant-role grant to quote tables.
      const quotes = await client.from("quotes").select("id");
      const versions = await client.from("quote_versions").select("id");
      expect(quotes.error).toBeNull();
      expect(versions.error).toBeNull();
      expect(quotes.data).toEqual([]);
      expect(versions.data).toEqual([]);
    }
  });
});
