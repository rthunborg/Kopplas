import { describe, expect, test } from "vitest";

/** ATDD RED, approved Story 16.2 -2 spec. No test body or DB work runs on import.
 * Reconcile proposed bindings in job-members-atdd.ts before activation; enable only
 * with the implemented commands/checked SQL and an isolated required DB lane.
 */
describe("16.2 job crew, responsible lead and dates command integrity", () => {
  // Activate after assign/remove checked SQL, real read baseline and atomic audit exist.
  test.skip("[P0] 16.2-INT-001 both job kinds archive/reactivate the same relationship without changing tenant roles", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    await h.withJobsDepthFixture(async (f) => {
      for (const job of [f.jobs.unrelated, f.jobs.assigneeProject]) {
        const baseline = await m.memberSnapshot(f);
        const ids: unknown[] = [];
        for (const operation of ["assign", "remove", "assign"] as const) {
          const correlation = crypto.randomUUID();
          const input = await m.memberInput(f.fx.adminClient, job.id, { personProfileId: f.fx.coworkerProfile.id });
          expect(await m.memberCommand(operation, f.fx.adminClient, input, correlation)).toMatchObject({ ok: true, data: { jobId: job.id } });
          const rows = (await m.memberRows(f, job.id)).filter((r) => r.person_profile_id === f.fx.coworkerProfile.id);
          expect(rows).toHaveLength(1);
          ids.push(rows[0].id);
          expect(rows[0].designation).toBe("member");
          expect(rows[0].archived_at === null).toBe(operation !== "remove");
          const after = await m.memberSnapshot(f);
          expect(m.auditFor(after, correlation)).toHaveLength(1);
          expect(m.auditFor(after, correlation)[0]).toMatchObject({ tenant_id: f.fx.base.tenantA.id, actor_user_id: f.fx.base.adminA.id });
          expect(after.tenantMemberships).toEqual(baseline.tenantMemberships);
          expect(after.tenantRoles).toEqual(baseline.tenantRoles);
          expect(after.bookings).toEqual(baseline.bookings);
          expect(after.assignees).toEqual(baseline.assignees);
        }
        expect(new Set(ids).size).toBe(1);
        expect((await m.readMembers(f.fx.adminClient, job.id)).members.map((r) => r.personProfileId)).toContain(f.fx.coworkerProfile.id);
      }
    });
  });

  // Activate after manager-only lead command + expected-current-state concurrency protection exist.
  test.skip("[P0] 16.2-INT-002 manager select/replace/clear has one lead and competing stale replacements cannot overwrite", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id;
      await m.seedMember(f, job, f.fx.coworkerProfile.id);
      await m.seedMember(f, job, f.fx.adminProfile.id);
      const first = await m.memberInput(f.fx.adminClient, job, { personProfileId: f.fx.ownProfile.id });
      expect((await m.memberCommand("lead", f.fx.adminClient, first)).ok).toBe(true);
      const stale = await m.memberInput(f.fx.adminClient, job, { personProfileId: f.fx.coworkerProfile.id });
      const competitor = { ...stale, commandId: crypto.randomUUID(), personProfileId: f.fx.adminProfile.id };
      const results = await Promise.all([
        m.memberCommand("lead", f.fx.adminClient, stale),
        m.memberCommand("lead", f.fx.plannerClient, competitor),
      ]);
      expect(results.filter((r) => r.ok)).toHaveLength(1);
      expect(results.filter((r) => !r.ok)).toMatchObject([{ ok: false, code: "PREVIEW_STALE" }]);
      const current = await m.memberRows(f, job);
      expect(current.filter((r) => r.archived_at === null && r.designation === "arbetsledare")).toHaveLength(1);
      const beforeStale = await m.memberSnapshot(f);
      expect(await m.memberCommand("lead", f.fx.adminClient, { ...first, commandId: crypto.randomUUID() })).toMatchObject({ ok: false, code: "PREVIEW_STALE" });
      expect(await m.memberSnapshot(f)).toEqual(beforeStale);
      const cleared = await m.memberInput(f.fx.plannerClient, job, { personProfileId: null });
      expect((await m.memberCommand("lead", f.fx.plannerClient, cleared)).ok).toBe(true);
      expect((await m.memberRows(f, job)).filter((r) => r.designation === "arbetsledare" && r.archived_at === null)).toEqual([]);
      expect((await m.memberRows(f, job)).filter((r) => r.archived_at === null)).toHaveLength(current.filter((r) => r.archived_at === null).length);
      expect((await m.readMembers(f.fx.adminClient, job)).leadPersonProfileId).toBeNull();
    });
  });

  // Activate after scoped envelope admission and independent checked-SQL authorization exist.
  test.skip("[P0] 16.2-INT-003 lead A can manage ordinary crew/dates only A; designation and existing mixed commands remain denied", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const { runCommand } = await import("@/server/commands/envelope");
    const { updateJob, createJob } = await import("@/server/commands/jobs");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id;
      await m.seedMember(f, job, f.fx.ownProfile.id, true);
      const ordinary = await m.memberInput(f.fx.montorClient, job, { personProfileId: f.fx.coworkerProfile.id });
      expect((await m.memberCommand("assign", f.fx.montorClient, ordinary)).ok).toBe(true);
      const dates = await m.memberInput(f.fx.montorClient, job, { planned_start_date: "2026-10-20", planned_end_date: "2026-10-21" });
      expect((await m.memberCommand("dates", f.fx.montorClient, dates)).ok).toBe(true);
      const before = await m.memberSnapshot(f);
      const attacks = [
        () => m.memberCommand("assign", f.fx.montorClient, { ...ordinary, commandId: crypto.randomUUID(), jobId: f.jobs.unrelated.id }),
        () => m.memberCommand("lead", f.fx.montorClient, { ...ordinary, commandId: crypto.randomUUID() }),
        () => m.memberCommand("lead", f.fx.montorClient, { ...ordinary, commandId: crypto.randomUUID(), personProfileId: null }),
        () => m.memberCommand("remove", f.fx.montorClient, { ...ordinary, commandId: crypto.randomUUID(), personProfileId: f.fx.ownProfile.id }),
        () => runCommand(updateJob, { client: f.fx.montorClient as never, correlationId: crypto.randomUUID(), input: { id: job, title: "Lead must not edit identity", status: "completed" } }),
        () => runCommand(createJob, { client: f.fx.montorClient as never, correlationId: crypto.randomUUID(), input: { customer_id: f.identity.customerId, title: "Unauthorized create" } }),
        () => h.invokeJobCard(f.fx.montorClient, "update", h.cardInput(f, { id: job })),
      ];
      for (const attack of attacks) {
        expect(await attack()).toMatchObject({ ok: false });
        expect(await m.memberSnapshot(f)).toEqual(before);
      }
      const direct = await m.checkedMemberCall("assign", f.fx.montorClient, f.fx.base.tenantA.id, f.fx.users.montor.id,
        { ...ordinary, commandId: crypto.randomUUID(), jobId: f.jobs.unrelated.id });
      expect(direct.error?.code).toBe("42501");
      const mixed = await f.fx.montorClient.rpc("update_job_with_audit", { p_tenant_id: f.fx.base.tenantA.id,
        p_actor_user_id: f.fx.users.montor.id, p_correlation_id: crypto.randomUUID(), p_job_id: job,
        p_patch: { planned_start_date: "2026-10-22", title: "Mixed RPC must remain manager-only" }, p_occurred_at: "2026-10-19T12:00:00Z" });
      expect(mixed.error?.code).toBe("42501");
      expect(await m.memberSnapshot(f)).toEqual(before);
    });
  });

  // Activate after dates-only checked command exists; retain the real 16.1 signed card protocol.
  test.skip("[P0] 16.2-INT-004 date save changes only planned fields and invalidates a genuine pre-edit card baseline", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const j = await import("../../support/job-booking-facts-atdd");
    const m = await import("../../support/job-members-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.editable.id;
      const before = await m.memberSnapshot(f);
      let afterDates: Awaited<ReturnType<typeof m.memberSnapshot>> | undefined;
      const oldCard = await j.observeJobCard(f.fx.adminClient, h.cardInput(f), crypto.randomUUID(), async (args) => {
        const dateInput = await m.memberInput(f.fx.adminClient, job, { planned_start_date: "2026-10-20", planned_end_date: "2026-10-22" });
        expect((await m.memberCommand("dates", f.fx.adminClient, dateInput)).ok).toBe(true);
        afterDates = await m.memberSnapshot(f);
        const oldRow = before.jobs.find((r) => r.id === job)!;
        const current = afterDates.jobs.find((r) => r.id === job)!;
        expect(current).toMatchObject({ planned_start_date: "2026-10-20", planned_end_date: "2026-10-22" });
        const withoutDates = (r: Record<string, unknown>) => Object.fromEntries(Object.entries(r).filter(([key]) => !["planned_start_date", "planned_end_date", "updated_at"].includes(key)));
        expect(withoutDates(current)).toEqual(withoutDates(oldRow));
        expect(afterDates.bookings).toEqual(before.bookings);
        expect(afterDates.conflicts).toEqual(before.conflicts);
        return args; // Actual finalize consumes the earlier genuine snapshot/proof.
      });
      expect(oldCard.snapshots).toHaveLength(1);
      expect(oldCard.result).toMatchObject({ ok: false, code: "PREVIEW_STALE" });
      expect(await m.memberSnapshot(f)).toEqual(afterDates);
      for (const patch of [
        { planned_start_date: "2026-10-23", planned_end_date: "2026-10-20" },
        ...["title", "customer_id", "responsible_project_manager_id", "priority", "crew_size", "planned_travel_minutes", "locationOverride", "requiredWorkRoleIds", "accessWindows", "dependencyJobIds", "status", "acceptedPriceOre"].map((key) => ({ [key]: "forbidden" })),
      ]) {
        const input = await m.memberInput(f.fx.adminClient, job, { planned_start_date: null, planned_end_date: null });
        const beforeInvalid = await m.memberSnapshot(f);
        expect(await m.memberCommand("dates", f.fx.adminClient, { ...input, ...patch })).toMatchObject({ ok: false, code: "VALIDATION_FAILED" });
        expect(await m.memberSnapshot(f)).toEqual(beforeInvalid);
      }
      expect((await m.memberCommand("dates", f.fx.adminClient, await m.memberInput(f.fx.adminClient, job,
        { planned_start_date: null, planned_end_date: null }))).ok).toBe(true);
      expect((await m.memberSnapshot(f)).jobs.find((r) => r.id === job)).toMatchObject({ planned_start_date: null, planned_end_date: null });
    });
  });

  // Activate after canonical identity/replay and current-authority validation exist in SQL.
  test.skip("[P0] 16.2-INT-005 response-loss retry returns one outcome, rejects changed input/intervening state and rechecks current authority", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const m = await import("../../support/job-members-atdd");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id;
      await m.seedMember(f, job, f.fx.ownProfile.id, true);
      const correlation = crypto.randomUUID();
      const input = await m.memberInput(f.fx.montorClient, job, { personProfileId: f.fx.coworkerProfile.id });
      const first = await m.memberCommand("assign", f.fx.montorClient, input, correlation);
      expect(first.ok).toBe(true); // The first durable reply is deliberately treated as lost by the caller.
      const committed = await m.memberSnapshot(f);
      expect(await m.memberCommand("assign", f.fx.montorClient, input, correlation)).toEqual(first);
      expect(await m.memberSnapshot(f)).toEqual(committed);
      expect(m.auditFor(committed, correlation)).toHaveLength(1);
      expect(await m.memberCommand("assign", f.fx.montorClient, { ...input, personProfileId: f.fx.adminProfile.id }, correlation)).toMatchObject({ ok: false });
      expect(await m.memberSnapshot(f)).toEqual(committed);
      expect((await m.memberCommand("remove", f.fx.adminClient, await m.memberInput(f.fx.adminClient, job,
        { personProfileId: f.fx.coworkerProfile.id }))).ok).toBe(true);
      const intervening = await m.memberSnapshot(f);
      expect(await m.memberCommand("assign", f.fx.montorClient, input, correlation)).toMatchObject({ ok: false });
      expect(await m.memberSnapshot(f)).toEqual(intervening);
    });
    // Independent clean replay: no intervening business update can mask revocation.
    // Bypass the envelope so SQL must recheck authority before returning cached success.
    await h.withJobsDepthFixture(async (f) => {
      const job = f.jobs.memberOrder.id;
      await m.seedMember(f, job, f.fx.ownProfile.id, true);
      const correlation = crypto.randomUUID();
      const input = await m.memberInput(f.fx.montorClient, job, { personProfileId: f.fx.coworkerProfile.id });
      const first = await m.memberCommand("assign", f.fx.montorClient, input, correlation);
      expect(first.ok).toBe(true);
      const committed = await m.memberSnapshot(f);
      expect(await m.memberCommand("assign", f.fx.montorClient, input, correlation)).toEqual(first);
      expect(await m.memberSnapshot(f)).toEqual(committed);
      await adminQuery("update public.tenant_memberships set status='disabled' where id=$1", [f.fx.ownProfile.membershipId]);
      const revoked = await m.memberSnapshot(f);
      const directReplay = await m.checkedMemberCall("assign", f.fx.montorClient,
        f.fx.base.tenantA.id, f.fx.users.montor.id, input, correlation);
      expect(directReplay.error?.code).toBe("42501");
      expect(await m.memberSnapshot(f)).toEqual(revoked);
      expect(revoked.jobs).toEqual(committed.jobs);
      expect(revoked.members).toEqual(committed.members);
      expect(revoked.audit).toEqual(committed.audit);
      expect(m.auditFor(revoked, correlation)).toHaveLength(1);
    });
  });

  // Activate after RPCs use the established tenant/membership lock boundary and audit-fault setup is installed.
  test.skip("[P0] 16.2-INT-006 checked mutations recheck locked actor/target facts and audit failure rolls the entire mutation back", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const j = await import("../../support/job-booking-facts-atdd");
    const m = await import("../../support/job-members-atdd");
    for (const change of ["actor-member-removed", "actor-lead-replaced", "actor-revoked", "actor-profile-archived", "manager-role-changed", "target-member-removed", "target-revoked", "target-profile-archived"] as const) {
      await h.withJobsDepthFixture(async (f) => {
        const job = f.jobs.memberOrder.id;
        await m.seedMember(f, job, f.fx.ownProfile.id, true);
        await m.seedMember(f, job, f.fx.coworkerProfile.id);
        const targetChange = change.startsWith("target-");
        const managerChange = change === "manager-role-changed";
        const client = targetChange ? f.fx.adminClient : managerChange ? f.fx.plannerClient : f.fx.montorClient;
        const actor = targetChange ? f.fx.base.adminA.id : managerChange ? f.fx.users.projektledare.id : f.fx.users.montor.id;
        const operation = targetChange ? "lead" : "dates";
        const input = await m.memberInput(client, job, targetChange ? { personProfileId: f.fx.coworkerProfile.id }
          : { planned_start_date: "2026-10-20", planned_end_date: "2026-10-21" });
        const before = await m.memberSnapshot(f);
        let externalState = before;
        const reply = await j.afterTenantGateWait(f.fx.base.tenantA.id,
          async () => await m.checkedMemberCall(operation, client, f.fx.base.tenantA.id, actor, input), async (query) => {
            const statements: Record<typeof change, [string, unknown[]]> = {
              "actor-member-removed": ["update public.job_members set archived_at=statement_timestamp() where job_id=$1 and person_profile_id=$2", [job, f.fx.ownProfile.id]],
              "actor-lead-replaced": ["update public.job_members set designation='member' where job_id=$1 and person_profile_id=$2", [job, f.fx.ownProfile.id]],
              "actor-revoked": ["update public.tenant_memberships set status='disabled' where id=$1", [f.fx.ownProfile.membershipId]],
              "actor-profile-archived": ["update public.person_profiles set archived_at=statement_timestamp() where id=$1", [f.fx.ownProfile.id]],
              "manager-role-changed": ["update public.tenant_memberships set role='saljare' where id=$1", [f.fx.coworkerProfile.membershipId]],
              "target-member-removed": ["update public.job_members set archived_at=statement_timestamp() where job_id=$1 and person_profile_id=$2", [job, f.fx.coworkerProfile.id]],
              "target-revoked": ["update public.tenant_memberships set status='disabled' where id=$1", [f.fx.coworkerProfile.membershipId]],
              "target-profile-archived": ["update public.person_profiles set archived_at=statement_timestamp() where id=$1", [f.fx.coworkerProfile.id]],
            };
            await query(...statements[change]);
            if (change === "actor-lead-replaced") await query("update public.job_members set designation='arbetsledare' where job_id=$1 and person_profile_id=$2", [job, f.fx.coworkerProfile.id]);
            // Read the intended external commit through its own session before release.
            // The final comparison then catches any extra member/role/profile/audit write.
            const rows = async (table: string, order: string) => (await query<{ row: import("../../support/bookings-atdd").DurableRow }>(
              `select to_jsonb(t) as row from public.${table} t where tenant_id=any($1::uuid[]) order by ${order}`, [f.fx.tenantIds])).map((r) => r.row);
            externalState = { ...before, members: await rows("job_members", "to_jsonb(t)::text"),
              tenantMemberships: await rows("tenant_memberships", "id"), profiles: await rows("person_profiles", "id") };
          });
        expect(reply.error?.code).toBe("42501");
        const after = await m.memberSnapshot(f);
        expect(after).toEqual(externalState);
      });
    }
    await h.withJobsDepthFixture(async (f) => {
      const correlation = crypto.randomUUID();
      const before = await m.memberSnapshot(f);
      const input = await m.memberInput(f.fx.adminClient, f.jobs.memberOrder.id, { personProfileId: f.fx.coworkerProfile.id });
      const observed = m.observeMemberClient(f.fx.adminClient);
      const failed = await j.withExistingAuditFault(correlation, () => m.memberCommand("assign", observed.client, input, correlation));
      expect(failed.ok).toBe(false);
      expect(observed.calls.some((c) => c.name === m.memberBindings.assign.rpc && c.error !== null)).toBe(true);
      expect(await m.memberSnapshot(f)).toEqual(before);
      expect((await m.memberCommand("assign", f.fx.adminClient, input, correlation)).ok).toBe(true);
      expect(m.auditFor(await m.memberSnapshot(f), correlation)).toHaveLength(1);
    });
  });
});
