import { describe, expect, test } from "vitest";

/** Executable: AC01/04/09/10. Full original acceptance concurrency/replay/source-lock
 * regressions stay in accept-quote-and-create-job, accepted-record-lock,
 * job-source-of-truth, create-job, update-job, bookings-replay-authority and
 * booking-editor suites. These cases add E16 discriminators only.
 */
describe("16.1 enriched card atomic command", () => {
  test("[P0] 16.1-INT-001 enriched create and response-loss replay retain one standalone identity/event/audit", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const {id: _id, ...card} = h.cardInput(f);
      void _id;
      const input = {...card, candidateId:crypto.randomUUID()};
      const created = await h.invokeJobCard(f.fx.plannerClient,"create",input);
      expect(created).toEqual({ok:true,data:{jobId:input.candidateId}});
      const committed = await f.snapshot();
      expect(committed.jobs.find((r) => r.id === input.candidateId)).toMatchObject({type:"order",status:"created",
        quote_acceptance_id:null,quote_version_id:null,customer_id:f.identity.customerId});
      expect(await h.invokeJobCard(f.fx.plannerClient,"create",input)).toEqual(created);
      expect(await f.snapshot()).toEqual(committed);
      expect((await h.invokeJobCard(f.fx.plannerClient,"create",{...input,title:"Changed same command"})).ok).toBe(false);
      expect(await f.snapshot()).toEqual(committed);
    });
  });
  test("[P1] 16.1-INT-001 enriched card persists closed scalars and exact child replacement without changing source or booking IDs", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const before = await f.snapshot();
      const input = h.cardInput(f);
      const correlation = crypto.randomUUID();
      const result = await h.invokeJobCard(f.fx.plannerClient, "update", input, correlation);
      expect(result).toEqual({ ok: true, data: { jobId: f.jobs.editable.id } });
      const after = await f.snapshot();
      expect(after.jobs.find((r) => r.id === input.id)).toMatchObject({ id: input.id, type: "order",
        title: input.title, priority: "high", estimated_duration_minutes: 120, crew_size: 2,
        planned_travel_minutes: 30, customer_presence_required: true,
        facility_id: f.identity.facilityId, contact_id: f.identity.contactId,
        quote_acceptance_id: null, quote_version_id: null });
      expect(after.roles.filter((r) => r.job_id === input.id).map((r) => r.work_role_id)).toEqual([f.roleId]);
      expect(after.windows.filter((r) => r.job_id === input.id)).toHaveLength(1);
      expect(after.dependencies.filter((r) => r.job_id === input.id)).toHaveLength(1);
      expect(after.audit.filter((r) => r.correlation_id === correlation)).toHaveLength(1);
      expect(after.bookings.map((r) => r.id)).toEqual(before.bookings.map((r) => r.id));
      expect(after.jobs.find((r) => r.id === f.jobs.acceptedAssigned.id)).toEqual(before.jobs.find((r) => r.id === f.jobs.acceptedAssigned.id));
      const replacement = h.cardInput(f, { requiredWorkRoleIds: [], accessWindows: [], dependencyJobIds: [] });
      expect((await h.invokeJobCard(f.fx.adminClient, "update", replacement)).ok).toBe(true);
      const reloaded = await f.snapshot();
      for (const rows of [reloaded.roles, reloaded.windows, reloaded.dependencies])
        expect(rows.filter((r) => r.job_id === input.id)).toEqual([]);
      // Empty must remain recorded on scalar marker fields, checked separately by SQL fact tests.
    });
  });

  test("[P0] 16.1-INT-002 SQL current-parent checks and malformed/smuggled children roll back all business, outcomes and audit", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    await h.withJobsDepthFixture(async (f) => {
      const invalid: Record<string, unknown>[] = [
        { facility_id: f.parents.wrongFacilityId }, { contact_id: f.parents.wrongContactId },
        { dependencyJobIds: [f.jobs.foreign.id] }, { requiredWorkRoleIds: [crypto.randomUUID()] },
        { accessWindows: [{ startsAt: "2026-10-12T14:00:00Z", endsAt: "2026-10-12T06:00:00Z" }] },
        { estimated_duration_minutes: 0 }, { earliest_date: "2026-10-15", latest_date: "2026-10-14" },
        { tenant_id: f.fx.base.tenantB.id }, { actor_id: f.fx.base.adminA.id },
        { quote_acceptance_id: crypto.randomUUID() }, { accepted_price_ore: 1 }, { unrecognized: true },
      ];
      for (const patch of invalid) {
        const before = await f.snapshot();
        const result = await h.invokeJobCard(f.fx.adminClient, "update", { ...h.cardInput(f), ...patch });
        expect(result.ok).toBe(false);
        if (!result.ok) expect(["VALIDATION_FAILED", "TENANT_ACCESS_DENIED"]).toContain(result.code);
        expect(await f.snapshot()).toEqual(before);
      }
    });
  });

  test("[P0] 16.1-INT-002 unchanged old minimum create and acceptance source tuples survive enriched evolution", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const { runCommand } = await import("@/server/commands/envelope");
    const { createJob, updateJob } = await import("@/server/commands/jobs");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async (f) => {
      const result = await runCommand(createJob, { client: f.fx.adminClient as never,
        correlationId: crypto.randomUUID(), input: { customer_id: f.identity.customerId } });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const before = await f.snapshot();
      const old = before.jobs.find((r) => r.id === result.data.targetId)!;
      expect(old).toMatchObject({ type: "order", status: "created", quote_acceptance_id: null, quote_version_id: null });
      expect((await runCommand(updateJob, { client: f.fx.adminClient as never, correlationId: crypto.randomUUID(),
        input: { id: old.id, title: "Original update signature" } })).ok).toBe(true);
      await expect(adminQuery("update public.jobs set type='unsupported-kind' where id=$1", [old.id])).rejects.toMatchObject({ code: "23514" });
      const accepted = before.jobs.find((r) => r.id === f.jobs.acceptedAssigned.id)!;
      expect(accepted.type).toBe("order");
      expect(accepted.quote_acceptance_id).toBeTruthy(); expect(accepted.quote_version_id).toBeTruthy();
      await expect(adminQuery("update public.jobs set quote_acceptance_id=null,quote_version_id=null where id=$1", [accepted.id])).rejects.toBeDefined();
      expect((await f.snapshot()).bookings.map((r) => [r.id, r.job_id])).toEqual(before.bookings.map((r) => [r.id, r.job_id]));
    });
  });
});
