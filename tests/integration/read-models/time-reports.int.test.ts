import { describe, expect, test } from "vitest";
import { adminQuery } from "../../factories/admin-sql";
import type { TimeReportReadResult } from "@/features/time-reports/types";
import { RLS_PAGE_SIZE } from "@/server/read-models/pagination";
import { withTimeReportFixture, reportInput, fileReport, reportId, readReports, seedReportBooking, seedReportJob, reportState } from "../../support/time-reports-atdd";

function assertReadSuccess(result: TimeReportReadResult): asserts result is Extract<TimeReportReadResult,{ok:true}> {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(`Expected complete report read; got ${result.code}`);
}

/** Real readTimeReports(query,{client}) against ordinary authenticated clients.
 * Read bodies use ordinary authenticated clients + physical DB setup/readbacks.
 * No read result, aggregate or persisted report is stubbed as successful.
 */
describe("Story 15.4 timesheet/review read-model acceptance", () => {
  test("[P1] 15.4-READ-001 AC3 AC8 own week totals chips and missing weekdays expose only caller rows", async () => {
    await withTimeReportFixture(async fx => {
      const booking = await seedReportBooking(fx), missingBooking = await seedReportBooking(fx, { startsAt: "2026-10-13T06:00:00Z", endsAt: "2026-10-13T14:00:00Z" });
      await seedReportBooking(fx, { startsAt: "2026-10-17T06:00:00Z", endsAt: "2026-10-17T14:00:00Z" });
      const own = reportId(await fileReport(fx.montorClient, reportInput({ bookingId: booking, minutes: 137 })));
      reportId(await fileReport(fx.montorClient, reportInput({ date: "2026-10-14", minutes: 23 })));
      const peer = reportId(await fileReport(fx.plannerClient, reportInput({ minutes: 999 })));
      const foreign = reportId(await fileReport(fx.foreignClient, reportInput({ minutes: 888 })));
      const result = await readReports(fx.montorClient, { mode: "own", week: "2026-10-12" });
      assertReadSuccess(result);
      expect(result).toMatchObject({ status: "success", data: { totalMinutes: 160, missingDates: ["2026-10-13"] } });
      expect(result.data.reports).toHaveLength(2); expect(result.data.reports.find((r: { id: string }) => r.id === own)).toMatchObject({ bookingId: booking, minutes: 137 });
      const serialized = JSON.stringify(result);
      for (const hidden of [peer, foreign, fx.users.projektledare.id, fx.base.adminB.id]) expect(serialized).not.toContain(hidden);
      expect(serialized).not.toMatch(/filing_digest|review_digest|filing_attempt|review_attempt|cost_rate|sell_rate|salary|valuation/i);
      expect(missingBooking).not.toBe(booking);
      expect(await readReports(fx.montorClient, { mode: "review", week: "2026-10-12" })).toMatchObject({ status: "error" });
    });
  });

  test("[P0] 15.4-READ-002 AC4 AC8 complete review pages honor person job week filters and standalone groups", async () => {
    await withTimeReportFixture(async fx => {
      const job = await seedReportJob(fx.base.tenantA.id);
      // Cross the actual existing DB page bound; do not assert a capped prefix.
      for (let i = 0; i < RLS_PAGE_SIZE + 7; i++) reportId(await fileReport(fx.adminClient, reportInput({ minutes: 1, jobId: job })));
      const standalone = reportId(await fileReport(fx.adminClient, reportInput({ minutes: 13 })));
      reportId(await fileReport(fx.plannerClient, reportInput({ minutes: 37, jobId: job })));
      reportId(await fileReport(fx.adminClient, reportInput({ minutes: 91, date: "2026-10-19", jobId: job })));
      reportId(await fileReport(fx.foreignClient, reportInput({ minutes: 777 })));
      const result = await readReports(fx.plannerClient, { mode: "review", week: "2026-10-12" });
      assertReadSuccess(result);
      expect(result).toMatchObject({ status: "success", data: { totalMinutes: RLS_PAGE_SIZE + 57 } });
      expect(result.data.reports).toHaveLength(RLS_PAGE_SIZE + 9);
      expect(result.data.byPerson).toEqual(expect.arrayContaining([{ userId: fx.base.adminA.id, minutes: RLS_PAGE_SIZE + 20 }, { userId: fx.users.projektledare.id, minutes: 37 }]));
      expect(result.data.byJob).toEqual(expect.arrayContaining([{ jobId: job, minutes: RLS_PAGE_SIZE + 44 }, { jobId: null, minutes: 13 }]));
      const selected = await readReports(fx.plannerClient, { mode: "review", week: "2026-10-12", personId: fx.base.adminA.id, jobId: job });
      assertReadSuccess(selected);
      expect(selected.data.totalMinutes).toBe(RLS_PAGE_SIZE + 7); expect(selected.data.reports).toHaveLength(RLS_PAGE_SIZE + 7);
      expect(selected.data.reports.some((r: { id: string }) => r.id === standalone)).toBe(false);
    });
  });

  test("[P1] 15.4-READ-003 AC4 AC9 booked-at-filing delta stays frozen and standalone has no fabricated booked comparison", async () => {
    await withTimeReportFixture(async fx => {
      const bookingId = await seedReportBooking(fx), linked = reportId(await fileReport(fx.montorClient, reportInput({ bookingId, minutes: 420 })));
      const standalone = reportId(await fileReport(fx.montorClient, reportInput({ minutes: 19 })));
      await adminQuery("update public.bookings set ends_at=starts_at+interval '1 hour' where id=$1", [bookingId]);
      const result = await readReports(fx.plannerClient, { mode: "review", week: "2026-10-12" });
      assertReadSuccess(result);
      expect(result.status).toBe("success");
      expect(result.data.reports.find((r: { id: string }) => r.id === linked)).toMatchObject({ bookedMinutesAtFiling: 480, deltaMinutes: -60 });
      expect(result.data.reports.find((r: { id: string }) => r.id === standalone)).toMatchObject({ bookedMinutesAtFiling: null, deltaMinutes: null });
      expect(JSON.stringify(result)).not.toMatch(/cost_rate|sell_rate|salary|valuation|approved|rejected|billable/i);
    });
  });

  test("[P0] 15.4-READ-004 AC3 AC4 AC8 failed first page cannot publish success or zero totals", async () => {
    await withTimeReportFixture(async fx => {
      reportId(await fileReport(fx.montorClient, reportInput({ minutes: 81 })));
      // Transport failure injection only; successful persistence still uses real SQL.
      const broken = new Proxy(fx.montorClient, { get(target, key) {
        if (key === "from") return (table: string) => { if (table === "time_reports") throw new Error("Owned read transport unavailable"); return target.from(table); };
        const value = Reflect.get(target, key, target); return typeof value === "function" ? value.bind(target) : value;
      } });
      const result = await readReports(broken, { mode: "own", week: "2026-10-12" });
      expect(result).toMatchObject({ status: "error" });
      expect(result).toMatchObject({ok:false,status:"error",code:"READ_FAILED"});
      expect(result).not.toHaveProperty("data");
      expect(await readReports(fx.montorClient, { mode: "own", week: "2026-10-12" })).toMatchObject({ status: "success", data: { totalMinutes: 81 } });
    });
  });

  test("[P0] 15.4-READ-006 AC3 AC4 AC8 later-page transport failure with real persisted prefix is an explicit read failure", async () => {
    await withTimeReportFixture(async fx => {
      for (let i = 0; i < RLS_PAGE_SIZE + 1; i++) reportId(await fileReport(fx.adminClient, reportInput({ minutes: 1 })));
      let failedPageReached = false;
      const broken = new Proxy(fx.adminClient, { get(target, key) {
        if (key === "from") return (table: string) => {
          const builder = target.from(table); if (table !== "time_reports") return builder;
          return new Proxy(builder, { get(from, method) {
            if (method !== "select") { const value = Reflect.get(from, method, from); return typeof value === "function" ? value.bind(from) : value; }
            return (...args: Parameters<typeof from.select>) => {
              const query = from.select(...args);
              const proxy: typeof query = new Proxy(query, { get(q, part) {
                if (part === "range") return (start: number, end: number) => {
                  if (start >= RLS_PAGE_SIZE) { failedPageReached = true; return Promise.resolve({ data: null, error: { code: "XX000", message: "Owned later-page outage" } }); }
                  return q.range(start, end);
                };
                const value = Reflect.get(q, part, q);
                if (typeof value !== "function") return value;
                return (...values: unknown[]) => { const result = value.apply(q, values); return result === q ? proxy : result; };
              } }); return proxy;
            };
          } });
        };
        const value = Reflect.get(target, key, target); return typeof value === "function" ? value.bind(target) : value;
      } });
      const result = await readReports(broken, { mode: "review", week: "2026-10-12" });
      expect(failedPageReached).toBe(true); expect(result.status).toBe("error");
      expect(result).toMatchObject({ok:false,status:"error",code:"READ_FAILED"});
      expect(result).not.toHaveProperty("data");
    });
  });

  test("[P0] 15.4-READ-005 AC1 AC6 AC8 current selectors prefill own real instants; manager visibility never implies assignment", async () => {
    await withTimeReportFixture(async fx => {
      const own = await seedReportBooking(fx), peer = await seedReportBooking(fx, { profileIds: [fx.coworkerProfile.id] });
      const result = await readReports(fx.adminClient, { mode: "own", week: "2026-10-12", prefillBookingId: own });
      assertReadSuccess(result);
      expect(result.data.prefill).toBeNull(); // visible to manager, not assigned to that manager
      const mine = await readReports(fx.montorClient, { mode: "own", week: "2026-10-12", prefillBookingId: own });
      assertReadSuccess(mine);
      expect(mine.data.prefill).toMatchObject({ bookingId: own, startsAt: "2026-10-12T06:00:00.000Z", endsAt: "2026-10-12T14:00:00.000Z", minutes: 480 });
      const denied = await readReports(fx.montorClient, { mode: "own", week: "2026-10-12", prefillBookingId: peer });
      assertReadSuccess(denied);
      expect(denied.data.prefill).toBeNull(); expect(JSON.stringify(denied)).not.toContain(peer);
      const before = await reportState(fx.tenantIds);
      await readReports(fx.plannerClient, { mode: "review", week: "2026-10-12" });
      expect(await reportState(fx.tenantIds)).toEqual(before); // read does not emit reminders or mutate workflows
    });
  });

  test("[P0] 15.4-READ-007 AC1 AC3 AC6 fractional own bookings retain context and a real persisted weekly prefix", async () => {
    await withTimeReportFixture(async fx => {
      const wholeBooking=await seedReportBooking(fx);
      const persisted=reportId(await fileReport(fx.montorClient,reportInput({bookingId:wholeBooking,minutes:37})));
      const fractional=[];
      for (const [date,endsAt] of [
        ["2026-10-13","2026-10-13T06:01:00.000060Z"],
        ["2026-10-14","2026-10-14T06:00:30Z"],
      ]) {
        fractional.push({date,bookingId:await seedReportBooking(fx,{startsAt:`${date}T06:00:00Z`,endsAt})});
      }
      const before=await reportState(fx.tenantIds);
      const result=await readReports(fx.montorClient,{mode:"own",week:"2026-10-12"});
      assertReadSuccess(result);
      expect(result.data.totalMinutes).toBe(37); expect(result.data.reports).toHaveLength(1);
      expect(result.data.reports[0]).toMatchObject({id:persisted,bookingId:wholeBooking,minutes:37,bookedMinutesAtFiling:480});
      expect(result.data.bookings).toHaveLength(3);
      expect(result.data.bookings.find(row => row.bookingId===wholeBooking)).toMatchObject({minutes:480});
      expect(result.data.missingDates).toEqual(["2026-10-13","2026-10-14"]);
      for (const booking of fractional) {
        // Null is an unavailable exact whole-minute prefill, not an invalid
        // booking, discarded own context, or false empty/error timesheet.
        expect(result.data.bookings.find(row => row.bookingId===booking.bookingId)).toMatchObject({...booking,minutes:null});
        const selected=await readReports(fx.montorClient,{mode:"own",week:"2026-10-12",prefillBookingId:booking.bookingId});
        assertReadSuccess(selected);
        expect(selected.data.prefill).toMatchObject({...booking,minutes:null});
        expect(selected.data.reports).toEqual(result.data.reports); expect(selected.data.totalMinutes).toBe(37);
      }
      expect(await reportState(fx.tenantIds)).toEqual(before);
    });
  });

});
