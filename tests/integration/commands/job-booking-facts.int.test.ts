import { describe, expect, test } from "vitest";

describe("16.1 authoritative per-booking job facts and atomic card refresh", () => {
  test("[P0] 16.1-INT-005 card protocol rejects correctly signed cross-domain and mismatched actor/version claims atomically", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const j = await import("../../support/job-booking-facts-atdd");
    const {signJobCardOutput} = await import("@/server/commands/jobs/card-proof");
    const {signConflictOutput} = await import("@/server/bookings/conflict-attestation");
    const {LOCAL_TEST_BOOKING_CONFLICT_SECRET: secret} = await import("../../support/test-env");
    await h.withJobsDepthFixture(async (f) => {
      for (const attack of ["booking-domain", "actor", "old-engine", "signature"] as const) {
        const before = await f.snapshot();
        const attempt = await j.observeJobCard(f.fx.adminClient, h.cardInput(f), crypto.randomUUID(), async (args) => {
          const claims = {...args.p_claims as import("@/server/bookings/conflict-attestation").ConflictClaims};
          const changed = {...claims, ...(attack === "actor" ? {actorId:f.fx.base.adminB.id} : {}),
            ...(attack === "old-engine" ? {engineVersion:"booking-conflicts-v2"} : {})};
          const output = String(args.p_output);
          return {...args, p_claims:changed, p_signature: attack === "booking-domain" ? signConflictOutput(changed,output,secret)
            : attack === "signature" ? "0".repeat(64) : signJobCardOutput(changed,output,secret)};
        });
        expect(attempt.result.ok).toBe(false);
        expect(attempt.finalizations).toHaveLength(1);
        expect(attempt.finalizations[0].error).toMatchObject({code:"42501"});
        expect(await f.snapshot()).toEqual(before);
      }
    });
  });

  test("[P0] 16.1-INT-005 job-child change committed during the tenant-gate wait makes the prior real card proof stale", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const j = await import("../../support/job-booking-facts-atdd");
    await h.withJobsDepthFixture(async (f) => {
      expect((await h.invokeJobCard(f.fx.adminClient,"update",h.cardInput(f))).ok).toBe(true);
      let afterExternalChange: Awaited<ReturnType<typeof f.snapshot>> | undefined;
      const attempt = await j.observeJobCard(f.fx.plannerClient,h.cardInput(f),crypto.randomUUID(),async(args) => {
        const reply = await j.afterTenantGateWait(f.fx.base.tenantA.id,
          async () => await f.fx.plannerClient.rpc("finalize_job_card",args),async(query) => {
            await query("insert into public.job_access_windows(tenant_id,job_id,starts_at,ends_at) values($1,$2,'2026-10-13T06:00:00Z','2026-10-13T07:00:00Z')",
              [f.fx.base.tenantA.id,f.jobs.editable.id]);
          });
        expect(reply.data).toEqual({kind:"stale"}); expect(reply.error).toBeNull();
        afterExternalChange = await f.snapshot();
        return args;
      });
      expect(attempt.result).toMatchObject({ok:false,code:"PREVIEW_STALE"});
      expect(await f.snapshot()).toEqual(afterExternalChange);
    });
  });
  test("[P0] 16.1-INT-003 mixed jobs and unbound booking consume their own SQL roles/windows, unknown differs from recorded-empty", async () => {
    const h = await import("../../support/jobs-depth-atdd");
    const j = await import("../../support/job-booking-facts-atdd");
    const { currentAttempt } = await import("../../support/booking-editor-production");
    const { deriveBookingConflicts } = await import("@/server/bookings/conflict-facts");
    await h.withJobsDepthFixture(async (f) => {
      const s = await j.mixedJobScenario(f);
      const attempt = await currentAttempt(f.fx.adminClient,"create",s.candidate);
      expect(attempt.snapshot.kind).toBe("snapshot");
      if(attempt.snapshot.kind!=="snapshot") return;
      const facts = j.jobFacts(attempt.snapshot);
      expect(facts.find((x)=>x.jobId===f.jobs.editable.id)?.requiredWorkRoleIds).toEqual([f.roleId]);
      expect(facts.find((x)=>x.jobId===f.jobs.memberOrder.id)).toEqual({jobId:f.jobs.memberOrder.id,requiredWorkRoleIds:[],accessWindows:[]});
      expect(facts.find((x)=>x.jobId===f.jobs.unrelated.id)).toEqual({jobId:f.jobs.unrelated.id,requiredWorkRoleIds:null,accessWindows:null});
      const bindings = JSON.parse(attempt.snapshot.canonicalFacts).bookings as {id:string;jobId:string|null}[];
      expect(bindings.find((b)=>b.id===s.required)?.jobId).toBe(f.jobs.editable.id);
      const derived = deriveBookingConflicts(attempt.snapshot).output;
      const rules = (id:string)=>derived.filter((r)=>r.booking_id===id).map((r)=>r.conflict_type).sort();
      expect(rules(s.required)).toContain("competence_missing");
      expect(rules(s.required)).not.toContain("outside_access_window");
      expect(rules(s.closed)).toContain("outside_access_window");
      expect(rules(s.closed)).not.toContain("competence_missing");
      expect(rules(attempt.snapshot.bookingId)).not.toContain("competence_missing");
      expect(rules(attempt.snapshot.bookingId)).not.toContain("outside_access_window");
      const saved=await j.reviewedBookingSave(f,s.candidate);
      expect(saved.ok).toBe(true);
      const after=await f.snapshot();
      expect(after.conflicts.some((r)=>r.booking_id===s.required&&r.conflict_type==="competence_missing"&&r.status==="open")).toBe(true);
      expect(after.conflicts.some((r)=>r.booking_id===s.closed&&r.conflict_type==="outside_access_window"&&r.status==="open")).toBe(true);
    });
  });

  test("[P0] 16.1-INT-004 child insertion/deletion and job rebinding change canonical digest and reject genuine prior booking proof without writes", async () => {
    const h=await import("../../support/jobs-depth-atdd");
    const j=await import("../../support/job-booking-facts-atdd");
    const { loadConflictBindings }=await import("../../support/booking-conflicts-atdd");
    const { bookingInput }=await import("../../support/bookings-atdd");
    await h.withJobsDepthFixture(async(f)=>{
      await j.mixedJobScenario(f);
      const b=await loadConflictBindings();
      const candidate=bookingInput([f.fx.ownProfile.id],{jobId:f.jobs.editable.id,startsAt:"2026-10-16T06:00:00Z",endsAt:"2026-10-16T07:00:00Z"});
      const snapshot=await b.snapshot(f.fx.adminClient,"create",candidate,crypto.randomUUID());
      const proof=await b.attest(snapshot,await b.detect(snapshot));
      const digests=[snapshot.factDigest];
      for(const windows of [
        [{startsAt:"2026-10-12T06:00:00Z",endsAt:"2026-10-12T14:00:00Z"},{startsAt:"2026-10-16T06:00:00Z",endsAt:"2026-10-16T07:00:00Z"}],
        [],
      ]) {
        const saved=await h.invokeJobCard(f.fx.adminClient,"update",h.cardInput(f,{accessWindows:windows,dependencyJobIds:[]}));
        expect(saved.ok).toBe(true);
        const current=await b.snapshot(f.fx.adminClient,"create",candidate,crypto.randomUUID());
        expect(current.factDigest).not.toBe(digests.at(-1));digests.push(current.factDigest);
        const before=await f.snapshot();
        expect(await b.finalize(f.fx.adminClient,candidate,proof)).toEqual({kind:"stale"});
        expect(await f.snapshot()).toEqual(before);
      }
      const beforeBinding=await b.snapshot(f.fx.adminClient,"create",candidate,crypto.randomUUID());
      const {adminQuery}=await import("../../factories/admin-sql");
      // Fixture mutation of an existing row isolates binding sensitivity, not a new writer API.
      const [bound]=await adminQuery<{id:string}>("select id from public.bookings where tenant_id=$1 and job_id=$2 order by id limit 1",[f.fx.base.tenantA.id,f.jobs.editable.id]);
      await adminQuery("update public.bookings set job_id=$2 where id=$1",[bound.id,f.jobs.memberOrder.id]);
      const afterBinding=await b.snapshot(f.fx.adminClient,"create",candidate,crypto.randomUUID());
      expect(afterBinding.factDigest).not.toBe(beforeBinding.factDigest);
      const baseline=await f.snapshot();
      const old=await b.attest(beforeBinding,await b.detect(beforeBinding));
      expect(await b.finalize(f.fx.adminClient,candidate,old)).toEqual({kind:"stale"});
      expect(await f.snapshot()).toEqual(baseline);
      for(const attack of [{engineVersion:"booking-conflicts-v2"},{actorId:f.fx.base.adminB.id}]) {
        const valid=await b.attest(afterBinding,await b.detect(afterBinding));
        const signed=await b.signedVariant(valid,attack);
        expect((await b.finalize(f.fx.adminClient,candidate,signed)).kind).toBe("denied");
        expect(await f.snapshot()).toEqual(baseline);
      }
      const valid=await b.attest(afterBinding,await b.detect(afterBinding));
      const {signEditorClaims}=await import("@/server/bookings/editor-preview");
      const {LOCAL_TEST_BOOKING_CONFLICT_SECRET:secret}=await import("../../support/test-env");
      const wrongDomain=signEditorClaims({...valid.snapshot,groups:[]} as never,secret);
      expect((await b.finalize(f.fx.adminClient,candidate,{...valid,signature:wrongDomain})).kind).toBe("denied");
      expect(await f.snapshot()).toEqual(baseline);
      expect((await b.finalize(f.fx.adminClient,candidate,{...valid,signature:"0".repeat(64)})).kind).toBe("denied");
      expect(await f.snapshot()).toEqual(baseline);
    });
  });

  test("[P0] 16.1-INT-005 card snapshot/finalize uses real signed sole-engine refresh; audit failure rolls back children/conflicts/outcomes/audit exactly", async()=>{
    const h=await import("../../support/jobs-depth-atdd");
    const j=await import("../../support/job-booking-facts-atdd");
    const {deriveBookingConflicts}=await import("@/server/bookings/conflict-facts");
    const {currentAttempt}=await import("../../support/booking-editor-production");
    const {loadConflictBindings}=await import("../../support/booking-conflicts-atdd");
    await h.withJobsDepthFixture(async(f)=>{
      const s=await j.mixedJobScenario(f);
      const before=await f.snapshot();
      const input=h.cardInput(f,{requiredWorkRoleIds:[],accessWindows:[],dependencyJobIds:[]});
      const correlation=crypto.randomUUID();
      const fault=await j.withExistingAuditFault(correlation,()=>j.observeJobCard(f.fx.adminClient,input,correlation));
      expect(fault.snapshots.length).toBeGreaterThan(0);
      expect(fault.finalizations.length).toBeGreaterThan(0);
      expect(fault.finalizations.some((r)=>r.error!==null)).toBe(true);
      expect(fault.result.ok).toBe(false);
      expect(await f.snapshot()).toEqual(before);
      const success=await j.observeJobCard(f.fx.adminClient,{...input,commandId:crypto.randomUUID()},crypto.randomUUID());
      expect(success.result.ok).toBe(true);
      expect(success.finalizations).toHaveLength(1);
      expect(success.finalizations[0].args.p_signature).toEqual(expect.any(String));
      const attempt=await currentAttempt(f.fx.adminClient,"create",s.candidate);
      if(attempt.snapshot.kind!=="snapshot") throw new Error("Expected real current snapshot");
      const expected=deriveBookingConflicts(attempt.snapshot).output.filter((r)=>r.booking_id===s.required);
      const bindings=await loadConflictBindings();
      const after=await f.snapshot();
      expect(bindings.normalizedRows(after.conflicts.filter((r)=>r.booking_id===s.required&&r.status!=="resolved"))).toEqual(expected);
      expect(expected.some((r)=>r.conflict_type==="outside_access_window")).toBe(true);
      expect(expected.some((r)=>r.conflict_type==="competence_missing")).toBe(false);
      expect(after.jobs.find((r)=>r.id===f.jobs.foreign.id)).toEqual(before.jobs.find((r)=>r.id===f.jobs.foreign.id));
    });
  });

  test("[P0] 16.1-INT-005 finalization rechecks real current authority after explicit two-session tenant-gate wait",async()=>{
    const h=await import("../../support/jobs-depth-atdd");
    const j=await import("../../support/job-booking-facts-atdd");
    const {adminQuery}=await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async(f)=>{
      await j.mixedJobScenario(f);
      const baseline=await f.snapshot();
      const correlation=crypto.randomUUID();
      const result=await j.observeJobCard(f.fx.plannerClient,h.cardInput(f),correlation,async(args)=>{
        // This is the second session: normal JWT finalization with a genuinely
        // issued proof. Release only after pg_blocking_pids proves the wait.
        const reply=await j.afterTenantGateWait(f.fx.base.tenantA.id,
          async()=>await f.fx.plannerClient.rpc("finalize_job_card",args),async(query)=>{
            await query("update public.tenant_memberships set status='disabled' where id=$1",[f.fx.coworkerProfile.membershipId]);
          });
        expect(reply.error?.code).toBe("42501");
        return args; // Original caller also sees current revoked authority, never a fabricated response.
      });
      expect(result.result.ok).toBe(false);
      const after=await f.snapshot();
      expect(after).toEqual(baseline); // memberships intentionally excluded; all business+children+outcomes+audit exact.
      const [membership]=await adminQuery<{status:string}>("select status from public.tenant_memberships where id=$1",[f.fx.coworkerProfile.membershipId]);
      expect(membership.status).toBe("disabled");
    });
  });
});
