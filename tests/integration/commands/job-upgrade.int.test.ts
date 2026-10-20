import { describe, expect, test } from "vitest";
/** 16.4 RED. All bodies skipped; activation requires real checked implementation,
 * reconciled adapter bindings and isolated SUPABASE_TEST_REQUIRED=1 evidence. */
describe("16.4 same-row one-way Projekt upgrade", () => {
  test("[P0] 16.4-INT-U01 manager upgrades accepted job with every child/file/provenance intact", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const s = await import("../../support/job-semantics-atdd");
    const w = await import("../../support/work-orders-atdd");
    const m = await import("../../support/job-members-atdd");
    const t = await import("../../factories/tenants");
    const { adminQuery } = await import("../../factories/admin-sql");
    const { bookingCommand, bookingInput } = await import("../../support/bookings-atdd");
    await h.withJobsDepthFixture(async f => {
      const job = f.jobs.acceptedAssigned.id;
      await m.seedMember(f, job, f.fx.ownProfile.id, true);
      const wo = await w.createWorkOrder(f.fx.adminClient, job, { planned_start_date: "2026-10-21", planned_end_date: "2026-10-22" });
      const prereq = await w.createWorkOrder(f.fx.adminClient, job);
      expect((await w.workOrderCommand("dependencies", f.fx.adminClient, await w.workOrderInput(f.fx.adminClient,job,
        { workOrderId: wo, prerequisites: [{ jobId: job, workOrderId: prereq }] }))).ok).toBe(true);
      const file = await t.adminInsertFile({ tenant_id:f.fx.base.tenantA.id,display_name:"Installation evidence.pdf" });
      await t.adminInsertFileLink({ tenant_id:f.fx.base.tenantA.id,file_id:file,owner_type:"job",owner_id:job,purpose:"job_evidence" });
      expect((await bookingCommand("create",f.fx.adminClient,bookingInput([f.fx.ownProfile.id],{ jobId:job }))).ok).toBe(true);
      await adminQuery("update public.jobs set status='in_progress' where id=$1",[job]);
      const before = await s.jobSemanticsSnapshot(f), correlation = crypto.randomUUID();
      const input = await s.upgradeInput(f.fx.plannerClient, job);
      expect(await s.upgradeJob(f.fx.plannerClient,input,correlation)).toMatchObject({ ok:true,data:{ jobId:job,type:"projekt" } });
      const after = await s.jobSemanticsSnapshot(f);
      const old = before.jobs.find(r => r.id === job)!, current = after.jobs.find(r => r.id === job)!;
      expect(old.quote_acceptance_id).not.toBeNull();
      expect(current).toMatchObject({ id:job,type:"projekt",status:"in_progress",tenant_id:old.tenant_id,customer_id:old.customer_id,quote_acceptance_id:old.quote_acceptance_id });
      const stable = (row: Record<string,unknown>) => Object.fromEntries(Object.entries(row).filter(([k]) => !["type","updated_at"].includes(k) && !k.includes("upgrade")));
      expect(stable(current)).toEqual(stable(old));
      for (const key of ["members","roles","windows","dependencies","bookings","assignees","conflicts","workOrders","workOrderAssignees","workOrderDependencies","files","fileLinks"] as const) expect(after[key]).toEqual(before[key]);
      expect(after.events.filter(r => !before.events.some(b => b.id === r.id))).toHaveLength(1);
      expect(after.audit.filter(r => r.correlation_id === correlation)).toHaveLength(1);
      expect((await s.readJobSemantics(f.fx.plannerClient,job)).type).toBe("projekt");
    });
  });

  test("[P0] 16.4-INT-U02 concurrent response-loss retries have one outcome and changed request identity is refused", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    await h.withJobsDepthFixture(async f => {
      const job = f.jobs.editable.id, correlation = crypto.randomUUID(), input = await s.upgradeInput(f.fx.adminClient,job);
      const before = await s.jobSemanticsSnapshot(f);
      const mismatchedState=input.expectedState === "0".repeat(64) ? "1".repeat(64):"0".repeat(64);
      const freshStale={...input,commandId:crypto.randomUUID(),expectedState:mismatchedState};
      expect(await s.upgradeJob(f.fx.adminClient,freshStale,correlation)).toMatchObject({ok:false,code:"PREVIEW_STALE"});
      expect((await s.checkedUpgrade(f.fx.adminClient,f.fx.base.tenantA.id,f.fx.base.adminA.id,freshStale,correlation)).error?.code).toBe("BK409");
      expect(await s.jobSemanticsSnapshot(f)).toEqual(before);
      const replies = await Promise.all([s.upgradeJob(f.fx.adminClient,input,correlation),s.upgradeJob(f.fx.adminClient,input,correlation)]);
      expect(replies[0]).toMatchObject({ok:true,data:{jobId:job,type:"projekt"}}); expect(replies[1]).toEqual(replies[0]);
      const committed = await s.jobSemanticsSnapshot(f);
      expect(committed.events.length-before.events.length).toBe(1);
      expect(committed.audit.filter(r => r.correlation_id === correlation)).toHaveLength(1);
      expect(await s.upgradeJob(f.fx.adminClient,input,correlation)).toEqual(replies[0]);
      expect(await s.jobSemanticsSnapshot(f)).toEqual(committed);
      for (const changed of [{ ...input,jobId:f.jobs.unrelated.id },{ ...input,expectedState:{changed:true} }]) {
        expect(await s.upgradeJob(f.fx.adminClient,changed,correlation)).toMatchObject({ok:false});
        expect(await s.jobSemanticsSnapshot(f)).toEqual(committed);
      }
      const changedReplay={...input,expectedState:mismatchedState};
      expect(await s.upgradeJob(f.fx.adminClient,changedReplay,correlation)).toMatchObject({ok:false,code:"PREVIEW_STALE"});
      expect((await s.checkedUpgrade(f.fx.adminClient,f.fx.base.tenantA.id,f.fx.base.adminA.id,changedReplay,correlation)).error?.code).toBe("BK409");
      expect(await s.jobSemanticsSnapshot(f)).toEqual(committed);
      // A fresh already-Projekt request is a truthful idempotent outcome, no second event/audit.
      expect(await s.upgradeJob(f.fx.adminClient,await s.upgradeInput(f.fx.adminClient,job))).toMatchObject({ok:true,data:{jobId:job,type:"projekt"}});
      expect(await s.jobSemanticsSnapshot(f)).toEqual(committed);
    });
  });

  test("[P0] 16.4-INT-U03 audit fault rolls type/event/outcome back; exact retry commits once", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const j = await import("../../support/job-booking-facts-atdd");
    await h.withJobsDepthFixture(async f => {
      const correlation = crypto.randomUUID(), input = await s.upgradeInput(f.fx.adminClient,f.jobs.editable.id);
      const before = await s.jobSemanticsSnapshot(f), observed = s.observeSemanticsClient(f.fx.adminClient);
      expect(await j.withExistingAuditFault(correlation,() => s.upgradeJob(observed.client,input,correlation))).toMatchObject({ok:false});
      expect(observed.calls.some(c => c.name === "upgrade_job_to_projekt_with_audit")).toBe(true);
      expect(await s.jobSemanticsSnapshot(f)).toEqual(before);
      expect(await s.upgradeJob(f.fx.adminClient,input,correlation)).toMatchObject({ok:true});
      const after = await s.jobSemanticsSnapshot(f);
      expect(after.events.length-before.events.length).toBe(1); expect(after.audit.filter(r => r.correlation_id === correlation)).toHaveLength(1);
    });
  });

  test("[P0] 16.4-INT-U04 manager role union works without profile; lead/ordinary/foreign/inactive JWTs cannot upgrade or replay", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const m = await import("../../support/job-members-atdd"); const t = await import("../../factories/tenants");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async f => {
      const job = f.jobs.editable.id;
      await m.seedMember(f,job,f.fx.ownProfile.id,true);
      const baseline = await s.upgradeInput(f.fx.adminClient,job);
      const before = await s.jobSemanticsSnapshot(f);
      for (const [client,actor] of [[f.fx.montorClient,f.fx.users.montor.id],[f.fx.foreignClient,f.fx.base.adminB.id]] as const) {
        expect(await s.upgradeJob(client,baseline)).toMatchObject({ok:false});
        expect((await s.checkedUpgrade(client,f.fx.base.tenantA.id,actor,baseline)).error?.code).toBe("42501");
        expect(await s.jobSemanticsSnapshot(f)).toEqual(before);
      }
      const sales = await t.makeAuthedServerClient(f.fx.users.saljare);
      expect(await s.upgradeJob(sales,baseline)).toMatchObject({ok:false});
      const [membership] = await adminQuery<{id:string}>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2",[f.fx.base.tenantA.id,f.fx.users.saljare.id]);
      // Independent secondary role, no person profile: current DB authority is decisive.
      await adminQuery("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,'projektledare')",[f.fx.base.tenantA.id,membership.id]);
      const profiles = await adminQuery("select id from public.person_profiles where membership_id=$1",[membership.id]); expect(profiles).toHaveLength(0);
      const input = await s.upgradeInput(sales,job), correlation = crypto.randomUUID();
      expect(await s.upgradeJob(sales,input,correlation)).toMatchObject({ok:true});
      await adminQuery("update public.tenant_memberships set status='disabled' where id=$1",[membership.id]);
      const revoked = await s.jobSemanticsSnapshot(f);
      expect((await s.checkedUpgrade(sales,f.fx.base.tenantA.id,f.fx.users.saljare.id,input,correlation)).error?.code).toBe("42501");
      expect(await s.upgradeJob(sales,input,correlation)).toMatchObject({ok:false});
      expect(await s.jobSemanticsSnapshot(f)).toEqual(revoked);
    });
  });

  for (const change of ["role-revoked","parent-archived"] as const) test(`[P0] 16.4-INT-U05 current authority and target after observed lock wait: ${change}`, async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const j = await import("../../support/job-booking-facts-atdd");
    await h.withJobsDepthFixture(async f => {
      const input = await s.upgradeInput(f.fx.plannerClient,f.jobs.editable.id), before = await s.jobSemanticsSnapshot(f);
      const reply = await j.afterTenantGateWait(f.fx.base.tenantA.id,async () => await s.checkedUpgrade(f.fx.plannerClient,f.fx.base.tenantA.id,f.fx.users.projektledare.id,input),async query => {
        if (change === "role-revoked") { await query("delete from public.membership_roles where membership_id=$1",[f.fx.coworkerProfile.membershipId]); await query("update public.tenant_memberships set role='saljare' where id=$1",[f.fx.coworkerProfile.membershipId]); }
        else await query("update public.jobs set archived_at=statement_timestamp() where id=$1",[input.jobId]);
      });
      expect(reply.error).not.toBeNull();
      const after = await s.jobSemanticsSnapshot(f);
      expect(after.events).toEqual(before.events); expect(after.audit).toEqual(before.audit);
      expect(after.jobs.find(r => r.id === input.jobId)?.type).toBe("order");
      expect(after.bookings).toEqual(before.bookings); expect(after.workOrders).toEqual(before.workOrders);
    });
  });

  test("[P0] 16.4-INT-U06 every reverse writer is rejected below wrappers with exact downgrade result; old creation stays order-only", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const { adminSession } = await import("../../factories/admin-sql");
    const { runCommand } = await import("@/server/commands/envelope"); const { createJob } = await import("@/server/commands/jobs");
    await h.withJobsDepthFixture(async f => {
      const job = f.jobs.assigneeProject.id, before = await s.jobSemanticsSnapshot(f);
      // Table invariant also covers privileged/alternative future writers; assert
      // actual driver exception message, never a TS validation short-circuit.
      await expect(adminSession(async ({query}) => { await query("begin"); try { await query("update public.jobs set type='order' where id=$1",[job]); } finally { await query("rollback"); } })).rejects.toMatchObject({message:expect.stringContaining("JOB_TYPE_DOWNGRADE_FORBIDDEN")});
      const raw = await f.fx.adminClient.from("jobs").update({type:"order"}).eq("id",job);
      expect(raw.error).not.toBeNull();
      expect(await h.invokeJobCard(f.fx.adminClient,"update",h.cardInput(f,{id:job,type:"order"}))).toMatchObject({ok:false,code:"JOB_TYPE_DOWNGRADE_FORBIDDEN"});
      const checked = await f.fx.adminClient.rpc("update_job_with_audit",{ p_tenant_id:f.fx.base.tenantA.id,p_actor_user_id:f.fx.base.adminA.id,p_correlation_id:crypto.randomUUID(),p_job_id:job,p_patch:{type:"order"},p_occurred_at:new Date().toISOString() });
      expect(checked.error).not.toBeNull();
      expect(await s.jobSemanticsSnapshot(f)).toEqual(before);
      expect(await h.invokeJobCard(f.fx.adminClient,"create",{...h.cardInput(f),id:undefined,type:"projekt"})).toMatchObject({ok:false});
      expect(await runCommand(createJob,{client:f.fx.adminClient as never,input:{customer_id:f.identity.customerId,title:"Legacy order"},correlationId:crypto.randomUUID()})).toMatchObject({ok:true});
      const after = await s.jobSemanticsSnapshot(f); const added = after.jobs.filter(r => !before.jobs.some(b => b.id === r.id));
      expect(added).toHaveLength(1); expect(added[0].type).toBe("order");
    });
  });
});
