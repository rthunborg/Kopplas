import { describe, expect, test } from "vitest";
import { adminQuery } from "../../factories/admin-sql";
import { withTimeReportFixture, reportInput, fileReport, annotateReport, checkedFileReport,
  checkedAnnotateReport, reportId, reportState, seedReportBooking, seedReportJob,
  whileTenantBlocked, observeRpcCodes, withReportAuditFault } from "../../support/time-reports-atdd";

/** RED: planned exports/RPC/column names are documented in the allocated helper.
 * Activate only with REQUIRED local DB evidence and the exact serial DDL lane.
 * Provider: real runCommand -> authenticated checked SQL, never a mock persistence API.
 */
describe("Story 15.4 real command and transaction acceptance", () => {
  test.skip("[P0] 15.4-INT-001 AC1 AC6 AC8 own planned booking files exact submitted minutes for Admin PL and Montor", async () => {
    await withTimeReportFixture(async fx => {
      const tenant = fx.base.tenantA.id;
      for (const [client, user, profile] of [[fx.adminClient, fx.base.adminA.id, fx.adminProfile.id],
        [fx.plannerClient, fx.users.projektledare.id, fx.coworkerProfile.id],
        [fx.montorClient, fx.users.montor.id, fx.ownProfile.id]] as const) {
        const bookingId = await seedReportBooking(fx, { profileIds: [profile] });
        const before = await reportState(fx.tenantIds), correlation = crypto.randomUUID();
        const id = reportId(await fileReport(client, reportInput({ bookingId, minutes: 455, note: "  Armaturer monterade  " }), correlation));
        const after = await reportState(fx.tenantIds), row = after.reports.find(r => r.id === id);
        expect(row).toMatchObject({ tenant_id: tenant, user_id: user, report_date: "2026-10-12", duration_minutes: 455,
          note: "Armaturer monterade", booking_id: bookingId, job_id: null, status: "submitted", booked_minutes_at_filing: 480 });
        expect(Number.isFinite(Date.parse(String(row!.created_at)))).toBe(true);
        expect(after.reports.length - before.reports.length).toBe(1);
        expect(after.audit.filter(r => r.correlation_id === correlation)).toMatchObject([{ actor_user_id: user, target_id: id }]);
        for (const key of ["bookings", "assignments", "conflicts", "resolutions", "jobs"] as const) expect(after[key]).toEqual(before[key]);
      }
    });
  });

  test.skip("[P0] 15.4-INT-002 AC1 AC6 standalone requires neither link nor profile and deliberate same-day rows stay distinct", async () => {
    await withTimeReportFixture(async fx => {
      expect(await adminQuery("select p.id from public.person_profiles p join public.tenant_memberships m on m.id=p.membership_id where m.user_id=$1", [fx.roleUnionUser.id])).toEqual([]);
      const first = reportId(await fileReport(fx.clients.mixed, reportInput({ minutes: 37 })));
      const second = reportId(await fileReport(fx.clients.mixed, reportInput({ minutes: 23 })));
      expect(second).not.toBe(first);
      const rows = (await reportState(fx.tenantIds)).reports.filter(r => [first, second].includes(String(r.id)));
      expect(rows.map(r => r.duration_minutes).sort()).toEqual([23, 37]);
      expect(rows.every(r => r.user_id === fx.roleUnionUser.id && r.booking_id === null && r.job_id === null && r.booked_minutes_at_filing === null && r.status === "submitted")).toBe(true);
    });
  });

  test.skip("[P0] 15.4-INT-003 AC2 AC8 concurrent exact retry converges; changed content and another actor never reuse the result", async () => {
    await withTimeReportFixture(async fx => {
      const input = reportInput(), before = await reportState(fx.tenantIds);
      const results = await Promise.all(Array.from({ length: 3 }, () => fileReport(fx.montorClient, input)));
      expect(results.every(r => r.ok)).toBe(true); expect(new Set(results.map(reportId)).size).toBe(1);
      const committed = await reportState(fx.tenantIds);
      expect(committed.reports.length - before.reports.length).toBe(1);
      expect(committed.audit.length - before.audit.length).toBe(1);
      expect(await fileReport(fx.montorClient, input)).toEqual(results[0]);
      expect(await fileReport(fx.montorClient, { ...input, minutes: 451 })).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
      expect(await reportState(fx.tenantIds)).toEqual(committed);
      const other = await fileReport(fx.plannerClient, input);
      expect(other.ok && reportId(other)).not.toBe(reportId(results[0]));
      const own = (await reportState(fx.tenantIds)).reports.find(r => r.id === reportId(results[0]));
      expect(own?.user_id).toBe(fx.users.montor.id);
    });
  });

  test.skip("[P0] 15.4-INT-004 AC6 AC8 SQL rejects bad references and exact-minute/date boundaries without partial writes", async () => {
    await withTimeReportFixture(async fx => {
      const own = await seedReportBooking(fx), peer = await seedReportBooking(fx, { profileIds: [fx.coworkerProfile.id] });
      const cancelled = await seedReportBooking(fx, { status: "cancelled" });
      const foreign = await seedReportBooking(fx, { tenantId: fx.base.tenantB.id, profileIds: [fx.foreignProfile.id] });
      const job = await seedReportJob(fx.base.tenantA.id), foreignJob = await seedReportJob(fx.base.tenantB.id);
      const linked = await seedReportBooking(fx, { jobId: job }), wrongJob = await seedReportJob(fx.base.tenantA.id);
      const cases = [reportInput({ minutes: 0 }), reportInput({ minutes: -1 }), reportInput({ minutes: 1.5 }), reportInput({ minutes: 2147483648 }),
        reportInput({ date: "2026-02-30" }), reportInput({ note: "x".repeat(2001) }), reportInput({ bookingId: peer }), reportInput({ bookingId: cancelled }),
        reportInput({ bookingId: foreign }), reportInput({ bookingId: crypto.randomUUID() }), reportInput({ jobId: foreignJob }),
        reportInput({ bookingId: linked, jobId: wrongJob }), reportInput({ bookingId: own, jobId: job })];
      for (const input of cases) {
        const before = await reportState(fx.tenantIds);
        expect(await fileReport(fx.montorClient, input)).toMatchObject({ ok: false });
        const direct = await checkedFileReport(fx.montorClient, fx.base.tenantA.id, fx.users.montor.id, input);
        expect(direct.error).not.toBeNull(); expect(await reportState(fx.tenantIds)).toEqual(before);
      }
      expect(await fileReport(fx.montorClient, reportInput({ bookingId: linked, minutes: 1 }))).toMatchObject({ ok: true });
      expect(await fileReport(fx.montorClient, reportInput({ minutes: 2147483647 }))).toMatchObject({ ok: true });
    });
  });

  test.skip("[P0] 15.4-INT-005 AC2 AC4 AC9 snapshot and exact replay survive live booking changes and removed assignment", async () => {
    await withTimeReportFixture(async fx => {
      const job = await seedReportJob(fx.base.tenantA.id), bookingId = await seedReportBooking(fx, { jobId: job });
      const input = reportInput({ bookingId, minutes: 420 }), result = await fileReport(fx.montorClient, input), id = reportId(result);
      await adminQuery("update public.bookings set ends_at=starts_at+interval '2 hours',job_id=null where id=$1", [bookingId]);
      await adminQuery("delete from public.booking_assignees where booking_id=$1 and person_profile_id=$2", [bookingId, fx.ownProfile.id]);
      const beforeReplay = await reportState(fx.tenantIds);
      expect(await fileReport(fx.montorClient, input)).toEqual(result);
      expect(await reportState(fx.tenantIds)).toEqual(beforeReplay);
      expect(beforeReplay.reports.find(r => r.id === id)).toMatchObject({ booked_minutes_at_filing: 480, duration_minutes: 420, job_id: job, booking_id: bookingId });
      expect(await fileReport(fx.montorClient, { ...input, attemptId: crypto.randomUUID() })).toMatchObject({ ok: false });
    });
  });

  test.skip("[P0] 15.4-INT-006 AC2 AC8 current SQL authority is rechecked after actual tenant-lock wait for fresh and replay", async () => {
    for (const replay of [false, true]) await withTimeReportFixture(async fx => {
      const input = reportInput(); if (replay) reportId(await fileReport(fx.montorClient, input));
      const before = await reportState(fx.tenantIds);
      const result = await whileTenantBlocked(fx.base.tenantA.id,
        () => checkedFileReport(fx.montorClient, fx.base.tenantA.id, fx.users.montor.id, input),
        () => adminQuery("update public.tenant_memberships set status='disabled' where id=$1", [fx.ownProfile.membershipId]).then(() => undefined));
      expect(result.error?.code).toBe("42501"); expect(await reportState(fx.tenantIds)).toEqual(before);
    });
  });

  test.skip("[P0] 15.4-INT-007 AC6 AC8 locked assignment booking status and job relation cannot change before fresh filing", async () => {
    for (const mutation of ["assignment", "cancelled", "job"] as const) await withTimeReportFixture(async fx => {
      const job = await seedReportJob(fx.base.tenantA.id), otherJob = await seedReportJob(fx.base.tenantA.id);
      const bookingId = await seedReportBooking(fx, { jobId: job });
      const before = await reportState(fx.tenantIds);
      const result = await whileTenantBlocked(fx.base.tenantA.id,
        () => checkedFileReport(fx.montorClient, fx.base.tenantA.id, fx.users.montor.id, reportInput({ bookingId, jobId: job })),
        async () => { if (mutation === "assignment") await adminQuery("delete from public.booking_assignees where booking_id=$1", [bookingId]);
          else if (mutation === "cancelled") await adminQuery("update public.bookings set status='cancelled' where id=$1", [bookingId]);
          else await adminQuery("update public.bookings set job_id=$2 where id=$1", [bookingId, otherJob]); });
      expect(result.error).not.toBeNull(); const after = await reportState(fx.tenantIds);
      expect(after.reports).toEqual(before.reports); expect(after.audit).toEqual(before.audit);
    });
  });

  test.skip("[P0] 15.4-INT-008 AC4 AC7 annotation CAS latest exact retry and blank clear preserve every filed core field", async () => {
    await withTimeReportFixture(async fx => {
      const id = reportId(await fileReport(fx.montorClient, reportInput()));
      const core = (await reportState(fx.tenantIds)).reports.find(r => r.id === id)!;
      const first = { attemptId: crypto.randomUUID(), reportId: id, expectedRevision: 0, note: "Kontrollerad mot arbetsordern" };
      const second = { ...first, attemptId: crypto.randomUUID(), note: "Andra granskaren" };
      const competitors = await Promise.all([annotateReport(fx.plannerClient, first), annotateReport(fx.adminClient, second)]);
      expect(competitors.filter(r => r.ok)).toHaveLength(1);
      expect(competitors.filter(r => !r.ok)).toMatchObject([{ ok: false, code: "COMMAND_CONFLICT" }]);
      const winning = competitors[0].ok ? first : second, winnerClient = competitors[0].ok ? fx.plannerClient : fx.adminClient;
      const winnerResult = competitors.find(r => r.ok)!;
      const saved = await reportState(fx.tenantIds);
      expect(await annotateReport(winnerClient, winning)).toEqual(winnerResult); expect(await reportState(fx.tenantIds)).toEqual(saved);
      expect(await annotateReport(winnerClient, { ...winning, note: "Ändrat under samma försök" })).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
      const clear = { attemptId: crypto.randomUUID(), reportId: id, expectedRevision: 1, note: "   " };
      expect(await annotateReport(fx.adminClient, clear)).toMatchObject({ ok: true });
      const current = (await reportState(fx.tenantIds)).reports.find(r => r.id === id)!;
      for (const field of ["id", "tenant_id", "user_id", "report_date", "duration_minutes", "note", "booking_id", "job_id", "booked_minutes_at_filing", "status", "created_at"]) expect(current[field]).toEqual(core[field]);
      expect(current).toMatchObject({ review_note: null, review_revision: 2, reviewed_by: fx.base.adminA.id, status: "submitted" });
      expect(Date.parse(String(current.reviewed_at))).not.toBeNaN();
      const beforeStale = await reportState(fx.tenantIds);
      expect(await annotateReport(winnerClient, winning)).toMatchObject({ ok: false, code: "COMMAND_CONFLICT" });
      expect(await reportState(fx.tenantIds)).toEqual(beforeStale);
    });
  });

  test.skip("[P0] 15.4-INT-009 AC2 AC7 audit fault proves filing or review stage then rolls all effects back", async () => {
    // SERIAL ONLY: Root-exclusive isolated stack, parallel group settled. No concurrent DDL.
    for (const stage of ["filing", "annotation"] as const) await withTimeReportFixture(async fx => {
      const id = stage === "annotation" ? reportId(await fileReport(fx.montorClient, reportInput())) : undefined;
      const input = reportInput(), correlationId = crypto.randomUUID(), observed = observeRpcCodes(stage === "filing" ? fx.montorClient : fx.plannerClient);
      const before = await reportState(fx.tenantIds);
      const failure = await withReportAuditFault({ stage, tenantId: fx.base.tenantA.id, correlationId, attemptId: input.attemptId, reportId: id },
        () => stage === "filing" ? fileReport(observed.client, input, correlationId) : annotateReport(observed.client, { attemptId: input.attemptId, reportId: id!, expectedRevision: 0, note: "Atomic review" }, correlationId));
      expect(failure.value).toMatchObject({ ok: false }); expect(observed.codes).toContain(failure.sqlstate);
      expect(observed.codes).not.toContain("P5499"); expect(await reportState(fx.tenantIds)).toEqual(before);
      const retry = stage === "filing" ? await fileReport(fx.montorClient, input, correlationId)
        : await annotateReport(fx.plannerClient, { attemptId: input.attemptId, reportId: id!, expectedRevision: 0, note: "Atomic review" }, correlationId);
      expect(retry).toMatchObject({ ok: true });
      expect((await reportState(fx.tenantIds)).audit.filter(r => r.correlation_id === correlationId)).toHaveLength(1);
    });
  });

  test.skip("[P0] 15.4-INT-010 AC7 AC8 revoked reviewer cannot replay latest annotation and superseded attempt cannot overwrite", async () => {
    await withTimeReportFixture(async fx => {
      const id = reportId(await fileReport(fx.montorClient, reportInput()));
      const input = { attemptId: crypto.randomUUID(), reportId: id, expectedRevision: 0, note: "Granskning" };
      expect(await annotateReport(fx.plannerClient, input)).toMatchObject({ ok: true });
      const before = await reportState(fx.tenantIds);
      const denied = await whileTenantBlocked(fx.base.tenantA.id,
        () => checkedAnnotateReport(fx.plannerClient, fx.base.tenantA.id, fx.users.projektledare.id, input),
        () => adminQuery("update public.tenant_memberships set status='disabled' where id=$1", [fx.coworkerProfile.membershipId]).then(() => undefined));
      expect(denied.error?.code).toBe("42501"); expect(await reportState(fx.tenantIds)).toEqual(before);
    });
  });
});
