import { describe, expect, test } from "vitest";
import { adminQuery, adminSession } from "../../factories/admin-sql";
import { makeAnonServerClient } from "../../factories/tenants";
import { withTimeReportFixture, seedReportBooking, reportInput, fileReport, reportId, produceNudges,
  jobsClient, reportState, observeRpcCodes, withReportAuditFault, withNudgeRecipients, whileTenantBlocked } from "../../support/time-reports-atdd";

const asOf = "2026-10-19T22:30:00.000Z"; // Stockholm Tue20: previous completed local dates13..19.
// PLANNED producer/RPC: emitTimeReportNudges(injectedJobsClient,tenantId,{asOf,cursor,correlationId}).
// SQL computes eligibility + preferences + absence under tenant serialization;
// adapter must not scan bookings/memberships a second time or return their facts.
describe("Story 15.4 existing E13 in-app nudge producer acceptance (RED)", () => {
  test.skip("[P0] 15.4-NUDGE-001 AC5 AC8 frozen seven completed Stockholm dates exclude weekend today future old and reported day", async () => {
    await withTimeReportFixture(async fx => {
      for (const day of [12, 13, 14, 15, 16, 17, 18, 19, 20, 21]) await seedReportBooking(fx, {
        startsAt: `2026-10-${day}T06:00:00Z`, endsAt: `2026-10-${day}T07:00:00Z` });
      reportId(await fileReport(fx.montorClient, reportInput({ date: "2026-10-15", minutes: 1 })));
      await seedReportBooking(fx, { tenantId: fx.base.tenantB.id, profileIds: [fx.foreignProfile.id], startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
      const before = await reportState(fx.tenantIds), service = await jobsClient();
      const result = await produceNudges(service, fx.base.tenantA.id, { asOf });
      expect(result.count).toBe(4); expect(result.cursor).toBeUndefined();
      const after = await reportState(fx.tenantIds), notes = after.notifications.filter(n => n.category === "time_report.nudge");
      expect(notes.map(n => n.logical_period).sort()).toEqual(["2026-10-13", "2026-10-14", "2026-10-16", "2026-10-19"]);
      expect(notes.every(n => n.tenant_id === fx.base.tenantA.id && n.recipient_user_id === fx.users.montor.id && n.logical_subject_id === fx.users.montor.id && n.route === "/time-reports")).toBe(true);
      expect(JSON.stringify(notes)).not.toContain("Installerade belysning i verkstaden");
      const audit = after.audit.filter(a => !before.audit.some(b => b.id === a.id));
      expect(audit).toHaveLength(4);
      for (const row of audit) {
        expect(row.actor_user_id).toBeNull(); expect(row.target_id).toBeOneOf(notes.map(n => n.id));
        expect(row.metadata).toEqual({ targetId: row.target_id });
      }
      expect(after.reports).toEqual(before.reports);
      expect(JSON.stringify(result)).not.toMatch(/userId|booking|report|note|email|title|body/i);
    });
  });

  test.skip("[P0] 15.4-NUDGE-002 AC5 AC8 adapter uses one scoped checked RPC injected client and leaves raw booking ACL revoked", async () => {
    await withTimeReportFixture(async fx => {
      await seedReportBooking(fx, { startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
      const service = await jobsClient(), calls: Array<{ name: string; args: Record<string, unknown> }> = [];
      const contained = new Proxy(service, { get(target, key) {
        if (key === "from") return () => { throw new Error("Nudge adapter attempted unrestricted second scan"); };
        if (key === "rpc") return async (name: string, args: Record<string, unknown>) => { calls.push({ name, args }); return target.rpc(name, args); };
        const value = Reflect.get(target, key, target); return typeof value === "function" ? value.bind(target) : value;
      } });
      const result = await produceNudges(contained, fx.base.tenantA.id, { asOf });
      expect(calls).toHaveLength(1); expect(calls[0]).toMatchObject({ name: "emit_time_report_nudges", args: { p_tenant_id: fx.base.tenantA.id, p_as_of: asOf } });
      expect(Object.keys(result).every(k => ["count", "cursor"].includes(k))).toBe(true);
      for (const table of ["bookings", "booking_assignees"]) expect((await service.from(table).select("id")).error?.code).toBe("42501");
      for (const client of [fx.adminClient, fx.plannerClient, fx.montorClient, await makeAnonServerClient()])
        expect((await client.rpc("emit_time_report_nudges", { p_tenant_id: fx.base.tenantA.id, p_as_of: asOf, p_cursor: null })).error?.code).toBe("42501");
      expect((await fx.montorClient.from("notification_preferences").insert({ tenant_id: fx.base.tenantA.id, user_id: fx.users.montor.id,
        category: "time_report.nudge", channel: "email", enabled: true })).error?.code).toBe("23514");
    });
  });

  test.skip("[P0] 15.4-NUDGE-003 AC5 AC8 current opt-out inactive role loss archived profile and cancelled booking suppress recipients", async () => {
    for (const reason of ["preference", "inactive", "role", "archived", "cancelled"] as const) await withTimeReportFixture(async fx => {
      const booking = await seedReportBooking(fx, { startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
      if (reason === "preference") await adminQuery("insert into public.notification_preferences(tenant_id,user_id,category,channel,enabled) values($1,$2,'time_report.nudge','in_app',false)", [fx.base.tenantA.id, fx.users.montor.id]);
      if (reason === "inactive") await adminQuery("update public.tenant_memberships set status='disabled' where id=$1", [fx.ownProfile.membershipId]);
      if (reason === "role") await adminQuery("update public.tenant_memberships set role='saljare' where id=$1", [fx.ownProfile.membershipId]);
      if (reason === "archived") await adminQuery("update public.person_profiles set archived_at=clock_timestamp() where id=$1", [fx.ownProfile.id]);
      if (reason === "cancelled") await adminQuery("update public.bookings set status='cancelled' where id=$1", [booking]);
      const before = await reportState(fx.tenantIds);
      expect(await produceNudges(await jobsClient(), fx.base.tenantA.id, { asOf })).toMatchObject({ count: 0 });
      expect(await reportState(fx.tenantIds)).toEqual(before);
    });
  });

  test.skip("[P0] 15.4-NUDGE-004 AC5 AC8 more than25 real recipients continue stable frozen scoped cursor without gaps duplicates or fact return", async () => {
    await withTimeReportFixture(async fx => { await withNudgeRecipients(fx, async recipients => {
      expect(recipients).toHaveLength(27);
      const service = await jobsClient(), first = await produceNudges(service, fx.base.tenantA.id, { asOf });
      expect(first.count).toBeLessThanOrEqual(25 * 7); expect(first.cursor).toEqual(expect.any(String));
      let cursor = first.cursor, count = first.count;
      const seen = new Set<string>();
      for (let page = 0; cursor && page < 10; page++) {
        expect(seen.has(cursor)).toBe(false); seen.add(cursor);
        const next = await produceNudges(service, fx.base.tenantA.id, { asOf, cursor });
        expect(next.count).toBeLessThanOrEqual(25 * 7); count += next.count; cursor = next.cursor;
      }
      expect(cursor).toBeUndefined(); expect(count).toBe(27);
      const notes = (await reportState(fx.tenantIds)).notifications.filter(n => n.category === "time_report.nudge");
      expect(notes.map(n => n.recipient_user_id).sort()).toEqual(recipients.map(r => r.userId).sort());
      expect(notes.every(n => n.logical_period === "2026-10-19")).toBe(true);
      const beforeBadCursor = await reportState(fx.tenantIds);
      await expect(produceNudges(service, fx.base.tenantB.id, { asOf, cursor: first.cursor })).rejects.toThrow();
      await expect(produceNudges(service, fx.base.tenantA.id, { asOf: "2026-10-20T22:30:00Z", cursor: first.cursor })).rejects.toThrow();
      await expect(produceNudges(service, fx.base.tenantA.id, { asOf, cursor: "malformed-cursor" })).rejects.toThrow();
      expect(await reportState(fx.tenantIds)).toEqual(beforeBadCursor);
    }); });
  });

  test.skip("[P0] 15.4-NUDGE-005 AC5 duplicate concurrent hourly retries emit zero new notification or audit effects", async () => {
    await withTimeReportFixture(async fx => {
      await seedReportBooking(fx, { startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
      const service = await jobsClient(), before = await reportState(fx.tenantIds);
      const results = await Promise.all([produceNudges(service, fx.base.tenantA.id, { asOf }), produceNudges(service, fx.base.tenantA.id, { asOf })]);
      expect(results.reduce((n, r) => n + r.count, 0)).toBe(1);
      const committed = await reportState(fx.tenantIds);
      expect(committed.notifications.length - before.notifications.length).toBe(1); expect(committed.audit.length - before.audit.length).toBe(1);
      expect(await produceNudges(service, fx.base.tenantA.id, { asOf: "2026-10-20T08:00:00Z" })).toMatchObject({ count: 0 });
      expect(await reportState(fx.tenantIds)).toEqual(committed);
    });
  });

  test.skip("[P0] 15.4-NUDGE-006 AC5 AC8 tenant lock checks current preferences and membership after actual blocked producer", async () => {
    for (const revoke of ["preference", "membership"] as const) await withTimeReportFixture(async fx => {
      await seedReportBooking(fx, { startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
      const service = await jobsClient(), before = await reportState(fx.tenantIds);
      const result = await whileTenantBlocked(fx.base.tenantA.id,
        () => produceNudges(service, fx.base.tenantA.id, { asOf }), async () => {
          if (revoke === "preference") await adminQuery("insert into public.notification_preferences(tenant_id,user_id,category,channel,enabled) values($1,$2,'time_report.nudge','in_app',false)", [fx.base.tenantA.id, fx.users.montor.id]);
          else await adminQuery("update public.tenant_memberships set status='disabled' where id=$1", [fx.ownProfile.membershipId]);
        });
      expect(result.count).toBe(0); expect(await reportState(fx.tenantIds)).toEqual(before);
    });
  });

  test.skip("[P0] 15.4-NUDGE-007 AC2 AC5 filing committed before serialized nudge predicate suppresses notification", async () => {
    await withTimeReportFixture(async fx => {
      await seedReportBooking(fx, { startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
      const service = await jobsClient(), input = reportInput({ date: "2026-10-19", minutes: 1 });
      let pending: ReturnType<typeof produceNudges> | undefined;
      await adminSession(async ({ query }) => {
        await query("begin");
        try {
          const [lock] = await query<{ pid: number }>("select pg_backend_pid() pid,pg_advisory_xact_lock(hashtextextended($1,0))", [fx.base.tenantA.id]);
          pending = produceNudges(service, fx.base.tenantA.id, { asOf });
          let blocked = false; const until = Date.now() + 10_000;
          while (!blocked && Date.now() < until) {
            const [row] = await adminQuery<{ blocked: boolean }>("select exists(select 1 from pg_stat_activity where $1=any(pg_blocking_pids(pid))) blocked", [lock.pid]); blocked = row.blocked;
          }
          expect(blocked).toBe(true);
          // Same connection re-enters its tenant lock but invokes the genuine RPC
          // with authenticated SQL role/JWT, never an elevated direct report INSERT.
          await query("select set_config('request.jwt.claim.sub',$1,true)", [fx.users.montor.id]);
          await query("set local role authenticated");
          await query("select public.file_time_report($1::uuid,$2::uuid,$3::uuid,$4::jsonb,$5::uuid)", [fx.base.tenantA.id, fx.users.montor.id, input.attemptId, JSON.stringify(input), crypto.randomUUID()]);
          await query("commit");
        } catch (error) { await query("rollback"); if (pending) await pending.catch(() => undefined); throw error; }
      });
      expect((await pending!).count).toBe(0);
      const state = await reportState(fx.tenantIds);
      expect(state.reports.filter(r => r.user_id === fx.users.montor.id && r.report_date === "2026-10-19")).toHaveLength(1);
      expect(state.notifications.filter(n => n.category === "time_report.nudge")).toEqual([]);
    });
  });

  test.skip("[P0] 15.4-NUDGE-008 AC5 atomic system audit failure verifies inserted recipient-date nudge then rolls it back", async () => {
    // SERIAL ONLY, Root-exclusive stack; all pending operations settle before fault teardown.
    await withTimeReportFixture(async fx => {
      await seedReportBooking(fx, { startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
      const correlationId = crypto.randomUUID(), observed = observeRpcCodes(await jobsClient()), before = await reportState(fx.tenantIds);
      const failure = await withReportAuditFault({ stage: "nudge", tenantId: fx.base.tenantA.id, correlationId, recipientId: fx.users.montor.id, date: "2026-10-19" }, async () => {
        await expect(produceNudges(observed.client, fx.base.tenantA.id, { asOf, correlationId })).rejects.toThrow();
      });
      expect(observed.codes).toContain(failure.sqlstate); expect(observed.codes).not.toContain("P5499");
      expect(await reportState(fx.tenantIds)).toEqual(before);
      expect(await produceNudges(await jobsClient(), fx.base.tenantA.id, { asOf, correlationId })).toMatchObject({ count: 1 });
      const after = await reportState(fx.tenantIds);
      expect(after.notifications.length - before.notifications.length).toBe(1); expect(after.audit.length - before.audit.length).toBe(1);
    });
  });

  test.skip("[P0] 15.4-NUDGE-009 AC5 AC8 existing authenticated jobs dispatch passes exact tenant and frozen run instant to real nudge adapter", async () => {
    await withTimeReportFixture(async fx => {
      await seedReportBooking(fx, { startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
      const { handleJobsRunRequest } = await import("@/app/api/jobs/run/route");
      const { ACTIVE_PRODUCERS } = await import("@/server/jobs/producers");
      const producer = ACTIVE_PRODUCERS.find(p => p.category === "time_report.nudge");
      expect(producer).toMatchObject({ module: "scheduling", category: "time_report.nudge", schedule: "0 * * * *", essential: false });
      const service = await jobsClient(), calls: Array<Record<string, unknown>> = [];
      const observed = new Proxy(service, { get(target, key) {
        if (key === "rpc") return async (name: string, args: Record<string, unknown>) => { if (name === "emit_time_report_nudges") calls.push(args); return target.rpc(name, args); };
        const value = Reflect.get(target, key, target); return typeof value === "function" ? value.bind(target) : value;
      } });
      const frozen = new Date("2026-10-20T00:00:00Z"); let afterDispatch = false;
      const response = await handleJobsRunRequest(new Request("http://localhost/api/jobs/run", { method: "POST" }), {
        authorize: () => true, createClient: () => observed, producers: [producer!], now: () => afterDispatch ? new Date("2026-10-21T00:00:00Z") : frozen,
        run: async (dependencies) => {
          afterDispatch = true;
          // Existing runner seam limits this test to its owned tenant; execute is
          // the real default route branch and real DB producer, not an injected emitter.
          await dependencies.execute(producer!, fx.base.tenantA.id, undefined);
          return { outcome: "completed" as const };
        },
      });
      expect(response.status).toBe(200); expect(calls).toHaveLength(1);
      expect(calls[0]).toMatchObject({ p_tenant_id: fx.base.tenantA.id, p_as_of: frozen.toISOString() });
      expect((await reportState(fx.tenantIds)).notifications.filter(n => n.category === "time_report.nudge")).toHaveLength(1);
    });
  });
});
