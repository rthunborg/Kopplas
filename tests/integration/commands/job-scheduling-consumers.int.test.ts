import { describe, expect, test } from "vitest";
import { parseUtcInstant } from "../../../src/features/scheduling/time-zone";
/** Story16.4 RED actual consumer/checked SQL contracts. No production code is
 * exercised on collection. Future DTO/export names live only in the thin adapter.
 * Existing independently checked booking permissions and E14 review remain. */
describe("16.4 card and actual booking semantics", () => {
  for (const type of ["order","projekt"] as const) test(`[P0] 16.4-INT-C01 complete ${type} card retains fields, responsible lead and actual WO edges`, async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const m = await import("../../support/job-members-atdd"); const w = await import("../../support/work-orders-atdd");
    await h.withJobsDepthFixture(async f => {
      const job = type === "order" ? f.jobs.editable.id : f.jobs.assigneeProject.id;
      await m.seedMember(f,job,f.fx.ownProfile.id,true);
      const wo = await w.createWorkOrder(f.fx.adminClient,job,{planned_start_date:"2026-10-21",planned_end_date:"2026-10-22"});
      const prerequisite = await w.createWorkOrder(f.fx.adminClient,f.jobs.prerequisite.id);
      expect((await w.workOrderCommand("dependencies",f.fx.adminClient,await w.workOrderInput(f.fx.adminClient,job,
        {workOrderId:wo,prerequisites:[{jobId:f.jobs.prerequisite.id,workOrderId:prerequisite}]}))).ok).toBe(true);
      const before = await w.workOrdersSnapshot(f);
      const input = await s.saveCard(f,job,{type,priority:"urgent",estimated_duration_minutes:120,crew_size:2,planned_travel_minutes:0,
        planned_start_date:"2026-10-20",planned_end_date:"2026-10-23",earliest_date:"2026-10-19",desired_date:"2026-10-21",latest_date:"2026-10-24",
        responsible_project_manager_id:f.fx.coworkerProfile.id,customer_presence_required:false,requiredWorkRoleIds:[f.roleId],
        accessWindows:[{startsAt:"2026-10-20T06:00:00Z",endsAt:"2026-10-20T14:00:00Z"}],dependencyJobIds:[f.jobs.prerequisite.id],
        locationOverride:{street:"Testgatan 12",postalCode:"11122",city:"Teststad",countryCode:"SE"}});
      const read = await s.readJobSemantics(f.fx.adminClient,job);
      const {commandId:_command,id:_id,expectedRevision,accessWindows,...fields} = input; void _command; void _id;
      expect(expectedRevision).toMatch(/^[0-9a-f]{64}$/);
      expect(read.card).toHaveProperty("cardRevision",expect.stringMatching(/^[0-9a-f]{64}$/));
      expect(read.card).toMatchObject(fields); expect(read.leadPersonProfileId).toBe(f.fx.ownProfile.id);
      expect(read.card.accessWindows).toHaveLength(accessWindows!.length);
      for (const [index, window] of accessWindows!.entries()) {
        expect(parseUtcInstant(read.card.accessWindows![index].startsAt)).toBe(parseUtcInstant(window.startsAt));
        expect(parseUtcInstant(read.card.accessWindows![index].endsAt)).toBe(parseUtcInstant(window.endsAt));
      }
      expect(read.workOrders).toContainEqual(expect.objectContaining({id:wo,plannedStartDate:"2026-10-21",plannedEndDate:"2026-10-22"}));
      expect(read.dependencies).toContainEqual({dependentJobId:job,dependentWorkOrderId:wo,prerequisiteJobId:f.jobs.prerequisite.id,prerequisiteWorkOrderId:prerequisite});
      const after = await w.workOrdersSnapshot(f); expect(after.workOrders).toEqual(before.workOrders); expect(after.workOrderDependencies).toEqual(before.workOrderDependencies);
      const worker = await s.readJobSemantics(f.fx.montorClient,job);
      expect(worker.canEditCard).toBe(false); expect(worker.canUpgrade).toBe(false);
      expect(h.protectedPaths(worker)).toEqual([]);
      expect(Object.keys(worker.card).filter(k => /payment|econom|bank|personal|password|token/i.test(k))).toEqual([]);
    });
  });

  test("[P0] 16.4-INT-C02 actual editor consumes D only for new untouched default; explicit/edit intervals survive preview/save/read", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const {bookingCommand} = await import("../../support/bookings-atdd");
    await h.withJobsDepthFixture(async f => {
      const job = f.jobs.editable.id;
      await s.saveCard(f,job,{estimated_duration_minutes:120,crew_size:2,planned_travel_minutes:30});
      const request = {jobId:job,startsAt:"2026-10-20T06:00:00Z",assigneeIds:[f.fx.ownProfile.id]};
      const derived = await s.readBookingSemantics(f.fx.adminClient,request);
      expect(derived.intervalSource).toBe("job-estimate"); expect(derived.input.endsAt).toBe("2026-10-20T08:00:00.000Z");
      const saved = await bookingCommand("create",f.fx.adminClient,derived.input); expect(saved.ok).toBe(true);
      if (!saved.ok) throw new Error(saved.code);
      const existing = await s.readBookingSemantics(f.fx.adminClient,{...request,bookingId:saved.data.bookingId,endsAt:"2026-10-20T08:00:00Z",intervalSource:"existing"});
      expect(existing.input.endsAt).toBe(derived.input.endsAt);
      for (const source of ["explicit","edited"] as const) {
        const explicit = await s.readBookingSemantics(f.fx.adminClient,{...request,endsAt:"2026-10-20T06:45:00Z",intervalSource:source});
        expect(explicit.input.endsAt).toBe("2026-10-20T06:45:00.000Z"); expect(explicit.intervalSource).toBe(source);
      }
      await s.saveCard(f,job,{estimated_duration_minutes:null});
      const unknown = await s.readBookingSemantics(f.fx.adminClient,request);
      expect(unknown.intervalSource).toBe("fallback"); expect(unknown.input.endsAt).toBe("2026-10-20T07:00:00.000Z");
      expect(unknown.advisory.state).toBe("unknown");
    });
  });

  const golden = [
    {allocated:0,gross:480,all:0,residual:300,capacity:480,shortfall:0},
    {allocated:120,gross:480,all:120,residual:180,capacity:360,shortfall:0},
    {allocated:120,gross:360,all:240,residual:180,capacity:120,shortfall:60},
    {allocated:360,gross:480,all:360,residual:0,capacity:120,shortfall:0},
  ];
  for (const g of golden) test(`[P0] 16.4-INT-C03 actual read/preview demand ${g.allocated}/${g.gross}/${g.all}`, async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    await h.withJobsDepthFixture(async f => {
      const arranged = await s.demandScenario(f,g.gross,g.allocated,g.all), before = await s.jobSemanticsSnapshot(f);
      const preview = await s.readBookingSemantics(f.fx.adminClient,arranged.request);
      expect(preview.advisory).toEqual({state:"known",totalDemand:300,allocatedCurrentJob:g.allocated,remainingDemand:g.residual,remainingCapacity:g.capacity,shortfall:g.shortfall});
      expect(preview.engineVersion).toBe("booking-conflicts-v4"); expect(preview.configVersion).toBe("stockholm-capacity-v2");
      expect(await s.jobSemanticsSnapshot(f)).toEqual(before); // Advice is never persisted occupancy/conflicts.
    });
  });

  test("[P0] 16.4-INT-C04 actual post-edit candidate credited once, same explicit pool/window and split actual occupancy only", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const { bookingCommand,bookingInput } = await import("../../support/bookings-atdd");
    await h.withJobsDepthFixture(async f => {
      const a = await s.demandScenario(f,480,120,120); expect(a.currentBookingId).not.toBeNull();
      const moved = await s.readBookingSemantics(f.fx.adminClient,{...a.request,status:"planned",bookingId:a.currentBookingId!,endsAt:"2026-10-20T07:30:00Z"});
      expect(moved.advisory).toMatchObject({totalDemand:300,allocatedCurrentJob:180,remainingDemand:120,remainingCapacity:300,shortfall:0});
      const onePerson = await s.readBookingSemantics(f.fx.adminClient,{...a.request,assigneeIds:[a.people[0]]});
      expect(onePerson.advisory).toMatchObject({totalDemand:300,allocatedCurrentJob:60,remainingCapacity:180});
      const saved = await bookingCommand("update",f.fx.adminClient,moved.input); expect(saved.ok).toBe(true);
      const cancelled = await s.readBookingSemantics(f.fx.adminClient,{...a.request,bookingId:a.currentBookingId!,status:"cancelled"});
      expect(cancelled.advisory).toMatchObject({allocatedCurrentJob:0,remainingDemand:300,remainingCapacity:480});
      // Cancel old identity through the real checked command; replace by two actual half-hours.
      expect((await bookingCommand("update",f.fx.adminClient,cancelled.input)).ok).toBe(true);
      for (const [start,end] of [["06:00","06:30"],["06:30","07:00"]]) expect((await bookingCommand("create",f.fx.adminClient,
        bookingInput(a.people,{jobId:a.jobId,startsAt:`2026-10-20T${start}:00Z`,endsAt:`2026-10-20T${end}:00Z`}))).ok).toBe(true);
      const split = await s.readBookingSemantics(f.fx.adminClient,a.request);
      expect(split.advisory).toMatchObject({totalDemand:300,allocatedCurrentJob:120,remainingDemand:180,remainingCapacity:360});
    });
  });

  test("[P0] 16.4-INT-C05 missing real input stays unknown, zero travel known; advisory shortfall adds no save/override/conflict rule", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const { bookingCommand } = await import("../../support/bookings-atdd");
    await h.withJobsDepthFixture(async f => {
      const a = await s.demandScenario(f,360,120,240);
      const before = await s.jobSemanticsSnapshot(f);
      // Planned local10:00–10:30 follows actual08–09/current and09–10/other
      // bookings, inside gross08–11 capacity: advisory shortfall without a hard conflict.
      const short = await s.readBookingSemantics(f.fx.adminClient,{...a.request,status:"planned",startsAt:"2026-10-20T08:00:00Z",endsAt:"2026-10-20T08:30:00Z"});
      expect(short.input.status).toBe("planned");
      expect(short.advisory).toMatchObject({totalDemand:300,allocatedCurrentJob:180,remainingDemand:120,remainingCapacity:60,shortfall:60});
      expect((await bookingCommand("create",f.fx.adminClient,short.input)).ok).toBe(true);
      const after = await s.jobSemanticsSnapshot(f); expect(after.conflicts).toEqual(before.conflicts);
      await s.saveCard(f,a.jobId,{planned_start_date:"2026-10-20",planned_end_date:"2026-10-20",planned_travel_minutes:0});
      expect((await s.readBookingSemantics(f.fx.adminClient,a.request)).advisory.totalDemand).toBe(240);
      await s.saveCard(f,a.jobId,{planned_travel_minutes:null});
      expect((await s.readBookingSemantics(f.fx.adminClient,a.request)).advisory).toMatchObject({state:"unknown",totalDemand:null,shortfall:null});
      // Empty eligible pools are an advisory-domain input, while an actual booking
      // still requires an assignee. Keep these distinct enforced contracts visible.
      await s.saveCard(f,a.jobId,{planned_start_date:"2026-10-20",planned_end_date:"2026-10-20",planned_travel_minutes:0});
      const complete = await s.readBookingSemantics(f.fx.adminClient,a.request);
      expect(complete.advisory.state).toBe("known");
      const {snapshot} = await s.bookingFacts(f.fx.adminClient,complete.input);
      const {schedulingFactsForSnapshot} = await import("../../../src/server/bookings/conflict-facts");
      const {evaluateJobDemandAdvisory} = await import("../../../src/features/scheduling/job-demand-advisory");
      const job = snapshot.facts.jobInputs.find(row => row.jobId === a.jobId)!;
      expect(evaluateJobDemandAdvisory({job:{jobId:job.jobId,durationMinutes:job.estimatedDurationMinutes!,
        crewSize:job.crewSize!,travelMinutes:job.plannedTravelMinutes!,plannedStartDate:job.plannedStartDate!,
        plannedEndDate:job.plannedEndDate!},eligiblePersonIds:[],facts:schedulingFactsForSnapshot(snapshot)})).toEqual({kind:"unknown"});
      const beforeInvalid = await s.jobSemanticsSnapshot(f);
      await expect(s.readBookingSemantics(f.fx.adminClient,{...a.request,assigneeIds:[]}))
        .rejects.toMatchObject({code:"23514",message:"booking input invalid"});
      expect(await s.jobSemanticsSnapshot(f)).toEqual(beforeInvalid);
    });
  });

  test("[P0] 16.4-INT-C06 checked selected-job dates and true/false/unknown presence never bleed across mixed jobs", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const {bookingCommand} = await import("../../support/bookings-atdd");
    await h.withJobsDepthFixture(async f => {
      await s.saveCard(f,f.jobs.editable.id,{earliest_date:"2026-10-20",desired_date:"2026-10-21",latest_date:"2026-10-22",customer_presence_required:true});
      await s.saveCard(f,f.jobs.memberOrder.id,{earliest_date:"2026-10-12",desired_date:null,latest_date:null,customer_presence_required:false});
      const request = {jobId:f.jobs.editable.id,startsAt:"2026-10-23T06:00:00Z",endsAt:"2026-10-23T07:00:00Z",assigneeIds:[f.fx.ownProfile.id],intervalSource:"explicit" as const};
      const a = await s.readBookingSemantics(f.fx.adminClient,request);
      expect(a).toMatchObject({earliestSuggestionDate:"2026-10-20",desiredMiss:true,latestBreach:true,presenceRequired:true});
      const b = await s.readBookingSemantics(f.fx.adminClient,{...request,jobId:f.jobs.memberOrder.id});
      expect(b).toMatchObject({earliestSuggestionDate:"2026-10-12",desiredMiss:null,latestBreach:null,presenceRequired:false});
      const none = await s.readBookingSemantics(f.fx.adminClient,{...request,jobId:null}); expect(none.presenceRequired).toBeNull();
      // Date hints are advice: no existing interval rewrite or new hard prohibition.
      expect(a.input.endsAt).toBe("2026-10-23T07:00:00.000Z"); expect((await bookingCommand("create",f.fx.adminClient,a.input)).ok).toBe(true);
      const beforeDesired = await s.readBookingSemantics(f.fx.adminClient,{...request,startsAt:"2026-10-22T06:00:00Z",endsAt:"2026-10-22T07:00:00Z"});
      expect(beforeDesired).toMatchObject({desiredMiss:true,latestBreach:false,presenceRequired:true});
    });
  });

  test("[P0] 16.4-INT-F03 actual checked preview uses occupied end day and preserves explicit boundaries", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    await h.withJobsDepthFixture(async f => {
      const job = f.jobs.editable.id;
      await s.saveCard(f,job,{earliest_date:"2026-10-20",desired_date:"2026-10-20",latest_date:"2026-10-21",
        requiredWorkRoleIds:[],accessWindows:null,customer_presence_required:true});
      const request = {jobId:job,startsAt:"2026-10-20T20:00:00Z",assigneeIds:[f.fx.ownProfile.id],intervalSource:"explicit" as const};
      for (const row of [
        {endsAt:"2026-10-21T00:15:00Z",desiredMiss:true,latestBreach:false}, // allowed start, overnight desired miss
        {endsAt:"2026-10-22T07:00:00Z",desiredMiss:true,latestBreach:true}, // same start, multi-day latest breach
        {endsAt:"2026-10-20T22:00:00Z",desiredMiss:false,latestBreach:false}, // Stockholm midnight is exclusive
      ]) {
        const result = await s.readBookingSemantics(f.fx.adminClient,{...request,endsAt:row.endsAt});
        expect(result).toMatchObject({earliestSuggestionDate:"2026-10-20",desiredMiss:row.desiredMiss,latestBreach:row.latestBreach,presenceRequired:true});
        expect(parseUtcInstant(result.input.startsAt)).toBe(parseUtcInstant(request.startsAt));
        expect(parseUtcInstant(result.input.endsAt)).toBe(parseUtcInstant(row.endsAt));
      }
      const allDay = await s.readBookingSemantics(f.fx.adminClient,{...request,allDay:true,
        startsAt:"2026-10-19T22:00:00Z",endsAt:"2026-10-20T22:00:00Z"});
      expect(allDay).toMatchObject({desiredMiss:false,latestBreach:false});
      expect(allDay.input.allDay).toBe(true);
      expect(parseUtcInstant(allDay.input.endsAt)).toBe(parseUtcInstant("2026-10-20T22:00:00Z"));
      for (const row of [
        {date:"2026-03-29",startsAt:"2026-03-28T23:00:00Z",endsAt:"2026-03-29T22:00:00Z"},
        {date:"2026-10-25",startsAt:"2026-10-24T22:00:00Z",endsAt:"2026-10-25T23:00:00Z"},
      ]) {
        await s.saveCard(f,job,{earliest_date:null,desired_date:row.date,latest_date:row.date,requiredWorkRoleIds:[],accessWindows:null});
        const result = await s.readBookingSemantics(f.fx.adminClient,{...request,allDay:true,startsAt:row.startsAt,endsAt:row.endsAt});
        expect(result).toMatchObject({desiredMiss:false,latestBreach:false});
        expect(parseUtcInstant(result.input.startsAt)).toBe(parseUtcInstant(row.startsAt));
        expect(parseUtcInstant(result.input.endsAt)).toBe(parseUtcInstant(row.endsAt));
      }
    });
  });

  for (const target of ["booking","card"] as const) test(`[P0] 16.4-INT-C07 correctly signed obsolete v3 ${target} proof/receipt rejected by real finalizer`, async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const { bookingCommand,bookingInput } = await import("../../support/bookings-atdd");
    await h.withJobsDepthFixture(async f => {
      await s.saveCard(f,f.jobs.editable.id); const before = await s.jobSemanticsSnapshot(f);
      const observed = s.observeSemanticsClient(f.fx.adminClient,s.obsoleteProof);
      const result = target === "card" ? await h.invokeJobCard(observed.client,"update",await h.loadCardInput(f)) :
        await bookingCommand("create",observed.client,bookingInput([f.fx.ownProfile.id],{jobId:f.jobs.editable.id}));
      expect(result).toMatchObject({ok:false});
      const finalizers = observed.calls.filter(c => c.name === (target === "card" ? "finalize_job_card" : "finalize_booking_editor"));
      expect(finalizers.length).toBeGreaterThan(0); expect(finalizers[0].error).not.toBeNull();
      expect(await s.jobSemanticsSnapshot(f)).toEqual(before);
    });
  });

  for (const field of ["estimated_duration_minutes","crew_size","planned_travel_minutes","planned_start_date","planned_end_date","earliest_date","desired_date","latest_date","customer_presence_required"] as const)
    test(`[P0] 16.4-INT-C08 reviewed preview refuses changed current fact while SQL waits: ${field}`, async () => {
      const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
      const j = await import("../../support/job-booking-facts-atdd");
      const {bookingInput,bookingCommand} = await import("../../support/bookings-atdd");
      const {reviewedFixtureInput} = await import("../../support/booking-editor-production");
      await h.withJobsDepthFixture(async f => {
        const a = await s.demandScenario(f,480,0,0);
        const input = await reviewedFixtureInput(f.fx.adminClient,"create",bookingInput(a.people,{jobId:a.jobId,startsAt:"2026-10-20T06:00:00Z",endsAt:"2026-10-20T07:00:00Z"}));
        const baseline = await s.jobSemanticsSnapshot(f);
        const changes = {estimated_duration_minutes:180,crew_size:3,planned_travel_minutes:0,planned_start_date:"2026-10-19",planned_end_date:"2026-10-21",earliest_date:"2026-10-18",desired_date:"2026-10-21",latest_date:"2026-10-22",customer_presence_required:false};
        const observed = s.observeSemanticsClient(f.fx.adminClient);
        const result = await j.afterTenantGateWait(f.fx.base.tenantA.id,() => bookingCommand("create",observed.client,input),async query => {
          await query(`update public.jobs set ${field}=$2 where id=$1`,[a.jobId,changes[field]]);
        });
        expect(result).toMatchObject({ok:false,code:"PREVIEW_STALE"});
        const after = await s.jobSemanticsSnapshot(f); expect(after.bookings).toEqual(baseline.bookings); expect(after.audit).toEqual(baseline.audit); expect(after.conflicts).toEqual(baseline.conflicts);
        const fresh = await reviewedFixtureInput(f.fx.adminClient,"create",input,true);
        expect(fresh.editorReview?.receipt).not.toBe(input.editorReview?.receipt);
        expect((await bookingCommand("create",f.fx.adminClient,fresh)).ok).toBe(true);
      });
    });

  test("[P0] 16.4-INT-C09 old replay-only finalizer cannot perform a fresh write", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const {actualEditorBindings} = await import("../../support/booking-editor-production");
    await h.withJobsDepthFixture(async f => {
      const editor = await actualEditorBindings(), scenario = await editor.seedMixed(f.fx), before = await s.jobSemanticsSnapshot(f);
      const inventory = await editor.sqlInventory(f.fx,scenario); expect(inventory.obsoleteFinalize.length).toBeGreaterThan(0);
      for (const entry of inventory.obsoleteFinalize) expect((await f.fx.adminClient.rpc(entry.name,entry.args)).error?.code).toBe("BR428");
      expect(await s.jobSemanticsSnapshot(f)).toEqual(before);
    });
  });
  test("[P0] 16.4-INT-C10 mixed booking facts bind each actual job and selected-pool canonical post-edit occupancy", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const { bookingInput,bookingCommand } = await import("../../support/bookings-atdd");
    await h.withJobsDepthFixture(async f => {
      const a = await s.demandScenario(f,480,120,120);
      await s.saveCard(f,f.jobs.memberOrder.id,{estimated_duration_minutes:45,crew_size:1,planned_travel_minutes:0,customer_presence_required:false,
        planned_start_date:"2026-10-20",planned_end_date:"2026-10-21",earliest_date:"2026-10-12",desired_date:null,latest_date:null});
      expect((await bookingCommand("create",f.fx.adminClient,bookingInput([a.people[0]],{jobId:f.jobs.memberOrder.id,startsAt:"2026-10-21T06:00:00Z",endsAt:"2026-10-21T06:30:00Z"}))).ok).toBe(true);
      const candidate = bookingInput(a.people,{jobId:a.jobId,startsAt:"2026-10-20T08:00:00Z",endsAt:"2026-10-20T09:00:00Z"});
      const first = await s.bookingFacts(f.fx.adminClient,candidate);
      const canonical = JSON.parse(first.snapshot.canonicalFacts) as {jobInputs:Record<string,unknown>[]};
      // Proposed canonical DTO spellings; reconcile, preserve the actual per-job assertions.
      expect(canonical.jobInputs.find(j => j.jobId === a.jobId)).toMatchObject({estimatedDurationMinutes:120,crewSize:2,plannedTravelMinutes:30,plannedStartDate:"2026-10-20",plannedEndDate:"2026-10-20",earliestDate:"2026-10-19",desiredDate:"2026-10-20",latestDate:"2026-10-21",customerPresenceRequired:true});
      expect(canonical.jobInputs.find(j => j.jobId === f.jobs.memberOrder.id)).toMatchObject({estimatedDurationMinutes:45,crewSize:1,plannedTravelMinutes:0,plannedStartDate:"2026-10-20",plannedEndDate:"2026-10-21",earliestDate:"2026-10-12",desiredDate:null,latestDate:null,customerPresenceRequired:false});
      const poolChanged = await s.bookingFacts(f.fx.adminClient,{...candidate,assigneeIds:[a.people[0]]});
      expect(poolChanged.snapshot.candidateDigest).not.toBe(first.snapshot.candidateDigest);
      await s.saveCard(f,f.jobs.memberOrder.id,{estimated_duration_minutes:90,customer_presence_required:true});
      const changed = await s.bookingFacts(f.fx.adminClient,candidate);
      expect(changed.snapshot.factDigest).not.toBe(first.snapshot.factDigest);
      const ownRead = await s.readBookingSemantics(f.fx.adminClient,a.request);
      expect(ownRead.advisory).toMatchObject({totalDemand:300,allocatedCurrentJob:120,remainingDemand:180,remainingCapacity:360});
      expect(ownRead.presenceRequired).toBe(true);
    });
  });

  test("[P0] 16.4-INT-C11 card finalizer refuses an evaluated other-job fact change with no derived writes", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const j = await import("../../support/job-booking-facts-atdd");
    const { adminQuery } = await import("../../factories/admin-sql");
    await h.withJobsDepthFixture(async f => {
      const a = await s.demandScenario(f,480,120,120); const input = await h.loadCardInput(f,{id:f.jobs.memberOrder.id});
      let external: Awaited<ReturnType<typeof s.jobSemanticsSnapshot>> | undefined;
      const observed = await j.observeJobCard(f.fx.adminClient,input,crypto.randomUUID(),async args => {
        await adminQuery("update public.jobs set planned_travel_minutes=0 where id=$1",[a.jobId]);
        external = await s.jobSemanticsSnapshot(f); return args;
      });
      expect(observed.finalizations.length).toBeGreaterThan(0);
      expect(observed.result).toMatchObject({ok:false,code:"PREVIEW_STALE"});
      expect(await s.jobSemanticsSnapshot(f)).toEqual(external);
    });
  });  test("[P0] 16.4-INT-C12 semantic entry/preview cannot grant foreign-parent or lead-only booking authority", async () => {
    const h = await import("../../support/jobs-depth-atdd"); const s = await import("../../support/job-semantics-atdd");
    const m = await import("../../support/job-members-atdd");
    const {bookingInput,bookingCommand} = await import("../../support/bookings-atdd");
    const {authoritativeBookingRpc} = await import("../../support/booking-conflict-attestation");
    await h.withJobsDepthFixture(async f => {
      await s.saveCard(f,f.jobs.editable.id);
      await m.seedMember(f,f.jobs.editable.id,f.fx.ownProfile.id,true);
      const before = await s.jobSemanticsSnapshot(f);
      const selected = bookingInput([f.fx.ownProfile.id],{jobId:f.jobs.editable.id,customerId:f.identity.customerId,
        facilityId:f.identity.facilityId,contactId:f.identity.contactId,startsAt:"2026-10-20T08:00:00Z",endsAt:"2026-10-20T09:00:00Z"});
      const denied = [
        {client:f.fx.adminClient,actor:f.fx.base.adminA.id,input:{...selected,jobId:f.jobs.foreign.id}},
        {client:f.fx.adminClient,actor:f.fx.base.adminA.id,input:{...selected,customerId:f.parents.otherCustomerId,facilityId:f.parents.wrongFacilityId,contactId:f.parents.wrongContactId}},
        {client:f.fx.montorClient,actor:f.fx.users.montor.id,input:selected},
      ];
      for (const attempt of denied) {
        // The proposed reader is a throwing server adapter: no successful hint DTO,
        // receipt, protected projection or semantic value may be returned on denial.
        let reply: Awaited<ReturnType<typeof s.readBookingSemantics>> | undefined, rejection: unknown;
        try { reply = await s.readBookingSemantics(attempt.client,{...attempt.input,intervalSource:"explicit"}); }
        catch (error) { rejection = error; }
        expect(rejection).toBeDefined(); expect(reply).toBeUndefined();
        expect(await bookingCommand("create",attempt.client,attempt.input)).toMatchObject({ok:false});
        const raw = await authoritativeBookingRpc("create",attempt.client,attempt.input,f.fx.base.tenantA.id,attempt.actor);
        expect(raw.error).not.toBeNull(); expect(raw.data).toBeNull();
        expect(await s.jobSemanticsSnapshot(f)).toEqual(before);
      }
    });
  });
  test("[P0] 16.4-INT-F01 valid terminal/centuries planning dates cannot block real booking preview or save",async()=>{
    const h=await import("../../support/jobs-depth-atdd"),s=await import("../../support/job-semantics-atdd");
    const {bookingCommand}=await import("../../support/bookings-atdd");
    await h.withJobsDepthFixture(async f=>{
      for(const window of [{planned_start_date:"9999-12-31",planned_end_date:"9999-12-31"},{planned_start_date:"0001-01-01",planned_end_date:"9998-12-31"}]) {
        await s.saveCard(f,f.jobs.editable.id,window);
        const preview=await s.readBookingSemantics(f.fx.adminClient,{jobId:f.jobs.editable.id,startsAt:"2026-10-20T06:00:00Z",endsAt:"2026-10-20T07:00:00Z",intervalSource:"explicit",assigneeIds:[f.fx.ownProfile.id]});
        expect(preview.advisory).toEqual({state:"unknown",totalDemand:null,allocatedCurrentJob:null,remainingDemand:null,remainingCapacity:null,shortfall:null});
        expect((await bookingCommand("create",f.fx.adminClient,{...preview.input,status:"cancelled"})).ok).toBe(true);
      }
    });
  });
  test("[P0] 16.4-INT-F02 authentic obsolete receipt refetches; tampered/foreign receipts stay denied without writes",async()=>{
    const h=await import("../../support/jobs-depth-atdd"),s=await import("../../support/job-semantics-atdd");
    const {bookingCommand,bookingInput}=await import("../../support/bookings-atdd");
    const {reviewedFixtureInput}=await import("../../support/booking-editor-production");
    const {openEditorReceipt,sealEditorReceipt}=await import("@/server/bookings/editor-preview");
    const {LOCAL_TEST_BOOKING_CONFLICT_SECRET:secret}=await import("../../support/test-env");
    await h.withJobsDepthFixture(async f=>{
      await s.saveCard(f,f.jobs.editable.id);
      const input=await reviewedFixtureInput(f.fx.adminClient,"create",bookingInput([f.fx.ownProfile.id],{jobId:f.jobs.editable.id,startsAt:"2026-10-20T06:00:00Z",endsAt:"2026-10-20T07:00:00Z"}));
      if(!input.editorReview)throw new Error("real review required");
      const current=openEditorReceipt(input.editorReview.receipt,secret),before=await s.jobSemanticsSnapshot(f);
      const obsolete={...current,engineVersion:"booking-conflicts-v3",configVersion:"stockholm-capacity-v1"};
      const old=sealEditorReceipt(obsolete,secret);
      expect(await bookingCommand("create",f.fx.adminClient,{...input,editorReview:{...input.editorReview,receipt:old}})).toMatchObject({ok:false,code:"PREVIEW_STALE"});
      const foreign=sealEditorReceipt({...obsolete,actorId:f.fx.base.adminB.id},secret);
      const bytes=Buffer.from(old,"base64url");bytes[bytes.length-1]!^=1;
      for(const receipt of [foreign,bytes.toString("base64url")]) expect(await bookingCommand("create",f.fx.adminClient,{...input,editorReview:{...input.editorReview,receipt}})).toMatchObject({ok:false,code:"TENANT_ACCESS_DENIED"});
      expect(await s.jobSemanticsSnapshot(f)).toEqual(before);
    });
  });
});





