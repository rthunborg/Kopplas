import { describe, expect, test } from "vitest";

/** RED: every body stays skipped until the approved 16.3 commands, migration,
 * projections and normal-JWT required integration lane exist. Reconcile future
 * names in the one adapter; do not replace durable expectations with mocks.
 * Provider endpoint: TODO — dedicated checked work-order RPCs, not implemented.
 * SQLSTATE/error spellings are replaceable bindings; denial/atomicity are policy.
 */
describe("16.3 work-order checked commands and transaction integrity", () => {
  // Activation: create/update/assignees SQL, scoped read baseline and atomic audit.
  test.skip("[P0] 16.3-INT-001 both parent kinds preserve identity, own fields and plural eligible assignees for managers/current leads", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const w = await import("../../support/work-orders-atdd");
    const t = await import("../../factories/tenants");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async (f) => {
      for (const parent of [f.jobs.memberOrder, f.jobs.assigneeProject]) {
        await m.seedMember(f, parent.id, f.fx.ownProfile.id, true);
        await m.seedMember(f, parent.id, f.fx.coworkerProfile.id);
        const baseline = await w.workOrdersSnapshot(f);
        const correlation = crypto.randomUUID();
        const input = await w.workOrderInput(f.fx.montorClient, parent.id, { title: "  Install kitchen circuits  ",
          description: "Keep the existing circuit labels", planned_start_date: "2026-10-22", planned_end_date: "2026-10-23" });
        const created = await w.workOrderCommand("create", f.fx.montorClient, input, correlation);
        expect(created).toMatchObject({ ok: true, data: { jobId: parent.id, workOrderId: expect.any(String) } });
        if (!created.ok || !created.data.workOrderId) throw new Error("Expected real child ID");
        const id = created.data.workOrderId;
        expect((await w.workOrderRows(f, parent.id)).find((r) => r.id === id)).toMatchObject({
          tenant_id: f.fx.base.tenantA.id, job_id: parent.id, title: "Install kitchen circuits", status: "created",
          description: input.description, planned_start_date: "2026-10-22", planned_end_date: "2026-10-23" });
        expect(w.workOrderAudit(await w.workOrdersSnapshot(f), correlation)).toMatchObject([
          { tenant_id: f.fx.base.tenantA.id, actor_user_id: f.fx.users.montor.id }]);
        for (const client of [f.fx.adminClient, f.fx.plannerClient, f.fx.montorClient]) {
          expect((await w.workOrderCommand("update", client, await w.workOrderInput(client, parent.id, {
            workOrderId: id, title: "Verify kitchen circuits", description: null,
            planned_start_date: null, planned_end_date: null }))).ok).toBe(true);
          expect((await w.workOrderCommand("assignees", client, await w.workOrderInput(client, parent.id, {
            workOrderId: id, personProfileIds: [f.fx.ownProfile.id, f.fx.coworkerProfile.id] }))).ok).toBe(true);
        }
        const read = await w.readWorkOrders(f.fx.montorClient, parent.id);
        expect(read.rows.find((r) => r.id === id)).toMatchObject({ jobId: parent.id, title: "Verify kitchen circuits",
          description: null, plannedStartDate: null, plannedEndDate: null });
        expect(read.rows.find((r) => r.id === id)?.assignees.map((p) => p.id).sort()).toEqual([f.fx.ownProfile.id, f.fx.coworkerProfile.id].sort());
        // Removing an old assignment remains possible after that target loses eligibility.
        await adminQuery("update public.job_members set archived_at=statement_timestamp() where job_id=$1 and person_profile_id=$2", [parent.id, f.fx.coworkerProfile.id]);
        expect((await w.workOrderCommand("assignees", f.fx.montorClient, await w.workOrderInput(f.fx.montorClient, parent.id,
          { workOrderId: id, personProfileIds: [f.fx.ownProfile.id] }))).ok).toBe(true);
        const after = await w.workOrdersSnapshot(f);
        for (const key of ["jobs", "bookings", "assignees", "conflicts", "dependencies", "tenantMemberships", "tenantRoles"] as const) expect(after[key]).toEqual(baseline[key]);
      }
      // Optional resource profile is not a prerequisite for independent manager authority.
      const user = f.fx.base.orphanUser;
      await t.adminInsertMembership({ tenant_id: f.fx.base.tenantA.id, user_id: user.id, role: "tenant_admin", status: "active" });
      for (const role of ["tenant_admin", "projektledare"] as const) {
        await adminQuery("update public.tenant_memberships set role=$1 where tenant_id=$2 and user_id=$3", [role, f.fx.base.tenantA.id, user.id]);
        const client = await t.makeAuthedServerClient(user);
        expect(await adminQuery("select p.id from public.person_profiles p join public.tenant_memberships m on m.id=p.membership_id where m.user_id=$1", [user.id])).toEqual([]);
        const id = await w.createWorkOrder(client, f.jobs.unrelated.id);
        expect((await w.workOrderCommand("update", client, await w.workOrderInput(client, f.jobs.unrelated.id, { workOrderId: id, title: "Manager without profile" }))).ok).toBe(true);
        expect((await w.workOrderCommand("assignees", client, await w.workOrderInput(client, f.jobs.unrelated.id, { workOrderId: id, personProfileIds: [] }))).ok).toBe(true);
        for (const status of ["in_progress", "done", "in_progress"] as const) expect((await w.workOrderCommand("status", client,
          await w.workOrderInput(client, f.jobs.unrelated.id, { workOrderId: id, status }))).ok).toBe(true);
      }
    });
  });

  // Activation: separate status graph in SQL; create/update closed payloads, no parent lifecycle side effects.
  test.skip("[P0] 16.3-INT-002 exact lifecycle, manager-only reopen, terminal field edits and no status smuggling", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const w = await import("../../support/work-orders-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id;
      await m.seedMember(f, job, f.fx.ownProfile.id, true);
      const baseline = await w.workOrdersSnapshot(f);
      for (const path of [["in_progress", "done"], ["cancelled"], ["in_progress", "cancelled"]] as const) {
        const id = await w.createWorkOrder(f.fx.montorClient, job);
        for (const status of path) expect((await w.workOrderCommand("status", f.fx.montorClient,
          await w.workOrderInput(f.fx.montorClient, job, { workOrderId: id, status }))).ok).toBe(true);
        const terminal = path[path.length - 1];
        expect((await w.workOrderCommand("update", f.fx.montorClient, await w.workOrderInput(f.fx.montorClient, job,
          { workOrderId: id, title: "Terminal field edit is allowed" }))).ok).toBe(true);
        const reopen = terminal === "done" ? "in_progress" : "created";
        const input = await w.workOrderInput(f.fx.montorClient, job, { workOrderId: id, status: reopen });
        const beforeDenied = await w.workOrdersSnapshot(f);
        expect(await w.workOrderCommand("status", f.fx.montorClient, input)).toMatchObject({ ok: false });
        expect((await w.checkedWorkOrderCall("status", f.fx.montorClient, f.fx.base.tenantA.id, f.fx.users.montor.id, input)).error?.code).toBe("42501");
        expect(await w.workOrdersSnapshot(f)).toEqual(beforeDenied);
        expect((await w.workOrderCommand("status", f.fx.plannerClient, await w.workOrderInput(f.fx.plannerClient, job,
          { workOrderId: id, status: reopen }))).ok).toBe(true);
        const noOp = await w.workOrdersSnapshot(f);
        expect((await w.workOrderCommand("status", f.fx.adminClient, await w.workOrderInput(f.fx.adminClient, job,
          { workOrderId: id, status: reopen }))).ok).toBe(true);
        expect(await w.workOrdersSnapshot(f)).toEqual(noOp); // unchanged state retry has no new outcome/audit
      }
      const id = await w.createWorkOrder(f.fx.adminClient, job);
      const beforeInvalid = await w.workOrdersSnapshot(f);
      for (const status of ["done", "completed", "draft"] as const) {
        const input = { ...await w.workOrderInput(f.fx.adminClient, job, { workOrderId: id }), status };
        expect(await w.workOrderCommand("status", f.fx.adminClient, input)).toMatchObject({ ok: false });
        expect((await w.checkedWorkOrderCall("status", f.fx.adminClient, f.fx.base.tenantA.id, f.fx.base.adminA.id, input)).error).not.toBeNull();
      }
      for (const operation of ["create", "update"] as const) {
        const input = { ...await w.workOrderInput(f.fx.adminClient, job, { title: "Smuggled done", ...(operation === "update" ? { workOrderId: id } : {}) }), status: "done" };
        expect(await w.workOrderCommand(operation, f.fx.adminClient, input)).toMatchObject({ ok: false });
        expect((await w.checkedWorkOrderCall(operation, f.fx.adminClient, f.fx.base.tenantA.id, f.fx.base.adminA.id, input)).error).not.toBeNull();
      }
      expect(await w.workOrdersSnapshot(f)).toEqual(beforeInvalid);
      expect((await w.workOrdersSnapshot(f)).jobs).toEqual(baseline.jobs);
      expect((await w.workOrdersSnapshot(f)).bookings).toEqual(baseline.bookings);
    });
  });

  // Activation: real typed-edge storage/read projection and lossless old/new dependency writes.
  test.skip("[P0] 16.3-INT-003 all typed endpoint dates, same-parent sequencing and old/new edge retention", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const w = await import("../../support/work-orders-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.editable.id, other = f.jobs.prerequisite.id;
      expect((await h.invokeJobCard(f.fx.adminClient, "update", h.cardInput(f))).ok).toBe(true);
      for (const jobId of [job, other]) expect((await m.memberCommand("dates", f.fx.adminClient,
        await m.memberInput(f.fx.adminClient, jobId, { planned_start_date: "2026-10-20", planned_end_date: "2026-10-21" }))).ok).toBe(true);
      const dependent = await w.createWorkOrder(f.fx.adminClient, job, { planned_start_date: "2026-10-22" });
      const same = await w.createWorkOrder(f.fx.adminClient, job, { title: "Same-parent prerequisite", planned_end_date: "2026-10-23" });
      const cross = await w.createWorkOrder(f.fx.adminClient, other, { title: "Cross-parent prerequisite", planned_end_date: "2026-10-23" });
      const before = await w.workOrdersSnapshot(f);
      const forms = [
        { operation: "dependencies", workOrderId: dependent, prerequisites: [{ jobId: other, workOrderId: null }], expected: "clear" },
        { operation: "dependencies", workOrderId: dependent, prerequisites: [{ jobId: job, workOrderId: same }, { jobId: other, workOrderId: cross }], expected: "delay" },
        { operation: "jobDependencies", prerequisites: [{ jobId: other, workOrderId: cross }], expected: "delay" },
      ] as const;
      for (const form of forms) {
        expect((await w.workOrderCommand(form.operation, f.fx.adminClient, await w.workOrderInput(f.fx.adminClient, job, {
          ...( "workOrderId" in form ? { workOrderId: form.workOrderId } : {}), prerequisites: [...form.prerequisites] }))).ok).toBe(true);
        const read = await w.readWorkOrders(f.fx.adminClient, job);
        expect(read.dependencyWarnings.some((r) => r.state === form.expected)).toBe(true);
        expect((await w.workOrdersSnapshot(f)).dependencies).toEqual(before.dependencies);
      }
      const savedNew = (await w.workOrdersSnapshot(f)).workOrderDependencies;
      expect(savedNew).toHaveLength(3); // job→WO plus same-parent/cross-parent WO→WO
      expect((await h.invokeJobCard(f.fx.adminClient, "update", h.cardInput(f, { dependencyJobIds: [] }))).ok).toBe(true);
      expect((await w.workOrdersSnapshot(f)).workOrderDependencies).toEqual(savedNew);
      const afterOldCard = await w.workOrdersSnapshot(f);
      // Equal/earlier actual child end clears; null remains unknown despite known parent dates.
      for (const [end, state] of [["2026-10-22", "clear"], ["2026-10-21", "clear"], [null, "unknown"]] as const) {
        expect((await w.workOrderCommand("update", f.fx.adminClient, await w.workOrderInput(f.fx.adminClient, job,
          { workOrderId: same, planned_end_date: end }))).ok).toBe(true);
        const warning = (await w.readWorkOrders(f.fx.adminClient, job)).dependencyWarnings.find((r) => r.prerequisite?.workOrderId === same);
        expect(warning?.state).toBe(state);
      }
      const stable = await w.workOrdersSnapshot(f);
      // Exact self-cycle only is approved; no invented multi-node cycle restriction.
      for (const prerequisites of [
        [{ jobId: job, workOrderId: dependent }],
        [{ jobId: job, workOrderId: same }, { jobId: job, workOrderId: same }],
        [{ jobId: other, workOrderId: same }],
        [{ jobId: f.jobs.foreign.id, workOrderId: cross }],
      ]) {
        const input = await w.workOrderInput(f.fx.adminClient, job, { workOrderId: dependent, prerequisites });
        expect(await w.workOrderCommand("dependencies", f.fx.adminClient, input)).toMatchObject({ ok: false });
        expect((await w.checkedWorkOrderCall("dependencies", f.fx.adminClient, f.fx.base.tenantA.id, f.fx.base.adminA.id, input)).error).not.toBeNull();
        expect(await w.workOrdersSnapshot(f)).toEqual(stable);
      }
      const bothNull = await w.workOrderInput(f.fx.adminClient, job, { prerequisites: [{ jobId: other, workOrderId: null }] });
      expect((await w.checkedWorkOrderCall("jobDependencies", f.fx.adminClient, f.fx.base.tenantA.id, f.fx.base.adminA.id, bothNull)).error).not.toBeNull();
      expect(await w.workOrdersSnapshot(f)).toEqual(stable);
      const staleEdges = await w.workOrderInput(f.fx.adminClient, job, { workOrderId: dependent,
        prerequisites: [{ jobId: job, workOrderId: same }, { jobId: other, workOrderId: cross }] });
      expect((await w.workOrderCommand("dependencies", f.fx.adminClient, { ...staleEdges,
        commandId: crypto.randomUUID(), prerequisites: [{ jobId: job, workOrderId: same }] })).ok).toBe(true);
      const replaced = await w.workOrdersSnapshot(f);
      expect(await w.workOrderCommand("dependencies", f.fx.adminClient, staleEdges)).toMatchObject({ ok: false, code: "PREVIEW_STALE" });
      expect(await w.workOrdersSnapshot(f)).toEqual(replaced);
      expect(stable.jobs).toEqual(afterOldCard.jobs);
      expect(stable.bookings).toEqual(before.bookings);
      expect(stable.conflicts).toEqual(before.conflicts);
    });
  });

  // Activation: durable CAS/canonical request identity and SQL current-authority replay.
  test.skip("[P0] 16.3-INT-004 competing saves and lost replies cannot overwrite or replay changed identity/current authority", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const w = await import("../../support/work-orders-atdd");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id;
      await m.seedMember(f, job, f.fx.ownProfile.id, true);
      const id = await w.createWorkOrder(f.fx.montorClient, job);
      const input = await w.workOrderInput(f.fx.montorClient, job, { workOrderId: id, title: "First checked save" });
      const correlation = crypto.randomUUID();
      const first = await w.workOrderCommand("update", f.fx.montorClient, input, correlation);
      expect(first.ok).toBe(true); // Treat this real durable reply as transport-lost.
      const committed = await w.workOrdersSnapshot(f);
      expect(await w.workOrderCommand("update", f.fx.montorClient, input, correlation)).toEqual(first);
      expect(await w.workOrdersSnapshot(f)).toEqual(committed);
      expect(w.workOrderAudit(committed, correlation)).toHaveLength(1);
      for (const patch of [{ title: "Changed retry" }, { jobId: f.jobs.unrelated.id }, { workOrderId: crypto.randomUUID() }]) {
        expect(await w.workOrderCommand("update", f.fx.montorClient, { ...input, ...patch }, correlation)).toMatchObject({ ok: false });
        expect(await w.workOrdersSnapshot(f)).toEqual(committed);
      }
      // Revocation without an intervening child edit cannot be hidden by stale CAS.
      await adminQuery("update public.job_members set designation='member' where job_id=$1 and person_profile_id=$2", [job, f.fx.ownProfile.id]);
      const revoked = await w.workOrdersSnapshot(f);
      expect((await w.checkedWorkOrderCall("update", f.fx.montorClient, f.fx.base.tenantA.id, f.fx.users.montor.id, input, correlation)).error?.code).toBe("42501");
      expect(await w.workOrdersSnapshot(f)).toEqual(revoked);
      const stale = await w.workOrderInput(f.fx.adminClient, job, { workOrderId: id, title: "Concurrent A" });
      const competitor = { ...stale, commandId: crypto.randomUUID(), title: "Concurrent B" };
      const results = await Promise.all([w.workOrderCommand("update", f.fx.adminClient, stale), w.workOrderCommand("update", f.fx.plannerClient, competitor)]);
      expect(results.filter((r) => r.ok)).toHaveLength(1);
      expect(results.filter((r) => !r.ok)).toMatchObject([{ ok: false, code: "PREVIEW_STALE" }]);
      const after = await w.workOrdersSnapshot(f);
      expect(await w.workOrderCommand("update", f.fx.adminClient, { ...stale, commandId: crypto.randomUUID() })).toMatchObject({ ok: false, code: "PREVIEW_STALE" });
      expect((await w.checkedWorkOrderCall("update", f.fx.montorClient, f.fx.base.tenantA.id, f.fx.users.montor.id, input, correlation)).error).not.toBeNull();
      expect(await w.workOrdersSnapshot(f)).toEqual(after);
    });
  });

  // Activation: SQL canonical calendar bounds/order and current plural-assignee validation.
  test.skip("[P0] 16.3-INT-005 invalid dates/targets and identity substitution leave the entire write/audit unchanged", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const w = await import("../../support/work-orders-atdd");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id, id = await w.createWorkOrder(f.fx.adminClient, job);
      const inactive = await m.profileFor(f, f.fx.disabledUser);
      const invited = await m.profileFor(f, f.fx.invitedUser);
      const archived = await m.profileFor(f, f.fx.users.saljare);
      await m.seedMember(f, job, archived.id);
      await adminQuery("update public.person_profiles set archived_at=statement_timestamp() where id=$1", [archived.id]);
      const before = await w.workOrdersSnapshot(f);
      const patches = [
        ...["0000-01-01", "10000-01-01", "2026-02-29", "2026-1-02", "2026-10-20T00:00:00Z"].map((d) => ({ planned_start_date: d })),
        { planned_start_date: "2026-10-23", planned_end_date: "2026-10-22" },
        { title: "   " }, { title: "x".repeat(257) }, { description: "x".repeat(10001) },
        { tenant_id: f.fx.base.tenantB.id }, { parentJobId: f.jobs.unrelated.id },
      ];
      for (const patch of patches) {
        const input = { ...await w.workOrderInput(f.fx.adminClient, job, { workOrderId: id }), ...patch };
        expect(await w.workOrderCommand("update", f.fx.adminClient, input)).toMatchObject({ ok: false });
        expect((await w.checkedWorkOrderCall("update", f.fx.adminClient, f.fx.base.tenantA.id, f.fx.base.adminA.id, input)).error).not.toBeNull();
        expect(await w.workOrdersSnapshot(f)).toEqual(before);
      }
      for (const target of [f.fx.foreignProfile.id, inactive.id, invited.id, archived.id, f.fx.coworkerProfile.id]) {
        const input = await w.workOrderInput(f.fx.adminClient, job, { workOrderId: id, personProfileIds: [f.fx.ownProfile.id, target] });
        expect(await w.workOrderCommand("assignees", f.fx.adminClient, input)).toMatchObject({ ok: false });
        expect((await w.checkedWorkOrderCall("assignees", f.fx.adminClient, f.fx.base.tenantA.id, f.fx.base.adminA.id, input)).error).not.toBeNull();
        expect(await w.workOrdersSnapshot(f)).toEqual(before);
      }
      // Boundary Gregorian leap day and year range persist as dates, without timezone conversion.
      for (const [start, end] of [["0001-01-01", "9999-12-31"], ["2000-02-29", "2000-02-29"], [null, null]] as const) {
        expect((await w.workOrderCommand("update", f.fx.adminClient, await w.workOrderInput(f.fx.adminClient, job,
          { workOrderId: id, planned_start_date: start, planned_end_date: end }))).ok).toBe(true);
        expect((await w.workOrderRows(f, job)).find((r) => r.id === id)).toMatchObject({ planned_start_date: start, planned_end_date: end });
      }
    });
  });

  const changes = ["actor-lead-replaced", "actor-revoked", "actor-profile-archived", "manager-role-lost",
    "target-member-removed", "target-profile-archived", "parent-archived"] as const;
  // Activation: reuse the EXISTING observed tenant advisory barrier. Each case
  // owns one fixture/budget and snapshots the revoker's uncommitted intended state.
  test.skip.each(changes)("[P0] 16.3-INT-006 checked SQL rechecks locked current facts: %s", async (change) => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const j = await import("../../support/job-booking-facts-atdd");
    const w = await import("../../support/work-orders-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id;
      await m.seedMember(f, job, f.fx.ownProfile.id, true);
      await m.seedMember(f, job, f.fx.coworkerProfile.id);
      const id = await w.createWorkOrder(f.fx.adminClient, job);
      const target = change.startsWith("target-");
      const manager = change === "manager-role-lost";
      const client = target || change === "parent-archived" ? f.fx.adminClient : manager ? f.fx.plannerClient : f.fx.montorClient;
      const actor = target || change === "parent-archived" ? f.fx.base.adminA.id : manager ? f.fx.users.projektledare.id : f.fx.users.montor.id;
      const operation = target ? "assignees" : "update";
      const input = await w.workOrderInput(client, job, { workOrderId: id, ...(target
        ? { personProfileIds: [f.fx.ownProfile.id, f.fx.coworkerProfile.id] } : { title: "Must not commit stale authority" }) });
      const before = await w.workOrdersSnapshot(f);
      let external = before;
      const reply = await j.afterTenantGateWait(f.fx.base.tenantA.id,
        async () => await w.checkedWorkOrderCall(operation, client, f.fx.base.tenantA.id, actor, input), async (query) => {
          const statements: Record<typeof change, [string, unknown[]]> = {
            "actor-lead-replaced": ["update public.job_members set designation='member' where job_id=$1 and person_profile_id=$2", [job, f.fx.ownProfile.id]],
            "actor-revoked": ["update public.tenant_memberships set status='disabled' where id=$1", [f.fx.ownProfile.membershipId]],
            "actor-profile-archived": ["update public.person_profiles set archived_at=statement_timestamp() where id=$1", [f.fx.ownProfile.id]],
            "manager-role-lost": ["update public.tenant_memberships set role='saljare' where id=$1", [f.fx.coworkerProfile.membershipId]],
            "target-member-removed": ["update public.job_members set archived_at=statement_timestamp() where job_id=$1 and person_profile_id=$2", [job, f.fx.coworkerProfile.id]],
            "target-profile-archived": ["update public.person_profiles set archived_at=statement_timestamp() where id=$1", [f.fx.coworkerProfile.id]],
            "parent-archived": ["update public.jobs set archived_at=statement_timestamp() where id=$1", [job]],
          };
          await query(...statements[change]);
          if (change === "manager-role-lost") await query("delete from public.membership_roles where membership_id=$1 and role in ('tenant_admin','projektledare')", [f.fx.coworkerProfile.membershipId]);
          if (change === "actor-lead-replaced") await query("update public.job_members set designation='arbetsledare' where job_id=$1 and person_profile_id=$2", [job, f.fx.coworkerProfile.id]);
          const rows = async (table: string, order: string) => (await query<{ row: import("../../support/bookings-atdd").DurableRow }>(
            `select to_jsonb(t) as row from public.${table} t where tenant_id=any($1::uuid[]) order by ${order}`, [f.fx.tenantIds])).map((r) => r.row);
          external = { ...before, jobs: await rows("jobs", "to_jsonb(t)::text"), members: await rows("job_members", "to_jsonb(t)::text"),
            tenantMemberships: await rows("tenant_memberships", "id"), tenantRoles: await rows("membership_roles", "to_jsonb(t)::text"), profiles: await rows("person_profiles", "id") };
        });
      expect(reply.error).not.toBeNull();
      expect(await w.workOrdersSnapshot(f)).toEqual(external);
    });
  });

  // Activation: preinstalled correlation-scoped audit fault infrastructure and actual RPC observation.
  test.skip("[P0] 16.3-INT-007 audit failure rolls assignments/dependencies/child/outcome back before an exact retry", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const j = await import("../../support/job-booking-facts-atdd");
    const w = await import("../../support/work-orders-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id;
      await m.seedMember(f, job, f.fx.coworkerProfile.id);
      const id = await w.createWorkOrder(f.fx.adminClient, job);
      const prerequisite = await w.createWorkOrder(f.fx.adminClient, job);
      for (const [operation, patch] of [
        ["update", { workOrderId: id, title: "Audit-protected edit" }],
        ["assignees", { workOrderId: id, personProfileIds: [f.fx.ownProfile.id, f.fx.coworkerProfile.id] }],
        ["dependencies", { workOrderId: id, prerequisites: [{ jobId: job, workOrderId: prerequisite }] }],
      ] as const) {
        const correlation = crypto.randomUUID();
        const input = await w.workOrderInput(f.fx.adminClient, job, patch);
        const before = await w.workOrdersSnapshot(f);
        const observed = w.observeWorkOrderClient(f.fx.adminClient);
        const failed = await j.withExistingAuditFault(correlation, () => w.workOrderCommand(operation, observed.client, input, correlation));
        expect(failed.ok).toBe(false);
        expect(observed.calls.some((c) => c.name === w.workOrderBindings[operation].rpc && c.error !== null)).toBe(true);
        expect(await w.workOrdersSnapshot(f)).toEqual(before);
        expect((await w.workOrderCommand(operation, f.fx.adminClient, input, correlation)).ok).toBe(true);
        const committed = await w.workOrdersSnapshot(f);
        expect(w.workOrderAudit(committed, correlation)).toHaveLength(1);
        expect((await w.workOrderCommand(operation, f.fx.adminClient, input, correlation)).ok).toBe(true);
        expect(await w.workOrdersSnapshot(f)).toEqual(committed);
      }
    });
  });
});
