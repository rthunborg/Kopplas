import { describe, expect, test } from "vitest";
import { adminQuery } from "../../factories/admin-sql";
import { makeAnonServerClient } from "../../factories/tenants";
import { withTimeReportFixture, reportInput, fileReport, reportId, checkedFileReport, checkedAnnotateReport,
  reportPublicColumns, reportPrivateColumns, reportState, setRoles, seedReportBooking } from "../../support/time-reports-atdd";

describe("Story 15.4 independent SQL authority and column ACL acceptance", () => {
  test("[P0] 15.4-RLS-001 AC7 AC8 raw RPC union roles authorize ReportOwn separately from Review", async () => {
    await withTimeReportFixture(async fx => {
      const tenant = fx.base.tenantA.id, actor = fx.roleUnionUser.id, client = fx.clients.mixed;
      const id = reportId(await fileReport(fx.montorClient, reportInput()));
      // This matrix does not call resolveCapability or the command envelope.
      const cases = [
        { primary: "tenant_admin", extra: [], own: true, review: true },
        { primary: "projektledare", extra: [], own: true, review: true },
        { primary: "montor", extra: [], own: true, review: false },
        { primary: "saljare", extra: [], own: false, review: false },
        { primary: "ekonomi", extra: [], own: false, review: false },
        { primary: "saljare", extra: ["montor"], own: true, review: false },
        { primary: "ekonomi", extra: ["projektledare"], own: true, review: true },
      ];
      let revision = 0;
      for (const item of cases) {
        await setRoles(tenant, actor, item.primary, item.extra);
        const before = await reportState(fx.tenantIds);
        const filed = await checkedFileReport(client, tenant, actor, reportInput());
        expect(filed.error === null).toBe(item.own);
        if (!item.own) expect(filed.error?.code).toBe("42501");
        const peerRead = await client.from("time_reports").select(reportPublicColumns).eq("id",id);
        expect(peerRead.error).toBeNull(); expect(peerRead.data).toHaveLength(item.review ? 1 : 0);
        if (item.own) {
          const ownRead = await client.from("time_reports").select(reportPublicColumns).eq("id",filed.data.reportId);
          expect(ownRead.error).toBeNull(); expect(ownRead.data).toHaveLength(1);
        }
        const annotation = await checkedAnnotateReport(client, tenant, actor, { reportId: id, attemptId: crypto.randomUUID(), expectedRevision: revision, note: "SQL rollunion" });
        expect(annotation.error === null).toBe(item.review);
        if (item.review) revision++; else expect(annotation.error?.code).toBe("42501");
        const after = await reportState(fx.tenantIds);
        expect(after.reports.length - before.reports.length).toBe(item.own ? 1 : 0);
        expect(after.audit.length - before.audit.length).toBe(Number(item.own) + Number(item.review));
      }
    });
  });

  test("[P0] 15.4-RLS-002 AC3 AC4 AC8 own projection excludes peers; Review reads tenant standalone and linked rows only", async () => {
    await withTimeReportFixture(async fx => {
      const own = reportId(await fileReport(fx.montorClient, reportInput())), peer = reportId(await fileReport(fx.plannerClient, reportInput()));
      const foreign = reportId(await fileReport(fx.foreignClient, reportInput()));
      const mine = await fx.montorClient.from("time_reports").select(reportPublicColumns).order("id");
      expect(mine.error).toBeNull(); expect(mine.data?.map(r => r.id)).toEqual([own]);
      expect((await fx.montorClient.from("time_reports").select(reportPublicColumns).eq("user_id", fx.users.projektledare.id)).data).toEqual([]);
      for (const client of [fx.adminClient, fx.plannerClient]) {
        const read = await client.from("time_reports").select(reportPublicColumns).order("id");
        expect(read.error).toBeNull(); expect(read.data?.map(r => r.id).sort()).toEqual([own, peer].sort());
        expect(read.data?.some(r => r.id === foreign)).toBe(false);
        expect((await client.from("time_reports").select(reportPublicColumns).eq("tenant_id", fx.base.tenantB.id)).data).toEqual([]);
      }
    });
  });

  test("[P0] 15.4-RLS-003 AC7 AC8 direct DML and private replay columns denied for every ordinary role", async () => {
    await withTimeReportFixture(async fx => {
      const id = reportId(await fileReport(fx.montorClient, reportInput())), before = await reportState(fx.tenantIds);
      for (const client of [fx.adminClient, fx.plannerClient, fx.montorClient, fx.clients.seller, fx.clients.economy, fx.foreignClient]) {
        for (const column of reportPrivateColumns) expect((await client.from("time_reports").select(column)).error?.code).toBe("42501");
        expect((await client.from("time_reports").select("*")).error?.code).toBe("42501");
        expect((await client.from("time_reports").insert({ tenant_id: fx.base.tenantA.id, user_id: fx.users.montor.id, report_date: "2026-10-12", duration_minutes: 30, status: "submitted" })).error?.code).toBe("42501");
        expect((await client.from("time_reports").update({ review_note: "Raw bypass" }).eq("id", id)).error?.code).toBe("42501");
        expect((await client.from("time_reports").delete().eq("id", id)).error?.code).toBe("42501");
      }
      expect(await reportState(fx.tenantIds)).toEqual(before);
    });
  });

  test("[P0] 15.4-RLS-004 AC2 AC6 AC8 actor tenant and on-behalf spoofing fail SQL independently with no existence oracle", async () => {
    await withTimeReportFixture(async fx => {
      const ownBooking = await seedReportBooking(fx), input = reportInput({ bookingId: ownBooking });
      const id = reportId(await fileReport(fx.montorClient, input)), before = await reportState(fx.tenantIds);
      // Admin can see this booking but has no own assignment; Review never grants filing on behalf.
      expect((await checkedFileReport(fx.adminClient, fx.base.tenantA.id, fx.base.adminA.id, reportInput({ bookingId: ownBooking }))).error?.code).toBe("42501");
      expect((await checkedFileReport(fx.adminClient, fx.base.tenantA.id, fx.users.montor.id, input)).error?.code).toBe("42501");
      expect((await checkedFileReport(fx.montorClient, fx.base.tenantB.id, fx.users.montor.id, input)).error?.code).toBe("42501");
      const real = await checkedAnnotateReport(fx.foreignClient, fx.base.tenantA.id, fx.base.adminB.id, { attemptId: crypto.randomUUID(), reportId: id, expectedRevision: 0, note: "Foreign" });
      const missing = await checkedAnnotateReport(fx.foreignClient, fx.base.tenantA.id, fx.base.adminB.id, { attemptId: crypto.randomUUID(), reportId: crypto.randomUUID(), expectedRevision: 0, note: "Foreign" });
      expect(real.error?.code).toBe("42501"); expect(missing.error?.code).toBe(real.error?.code); expect(missing.error?.message).toBe(real.error?.message);
      expect(await reportState(fx.tenantIds)).toEqual(before);
    });
  });

  test("[P0] 15.4-RLS-005 AC8 anon inactive revoked seller economy and platform-only identities gain no report surface", async () => {
    await withTimeReportFixture(async fx => {
      const id = reportId(await fileReport(fx.montorClient, reportInput()));
      await adminQuery("insert into public.platform_operators(user_id,granted_by) values($1,$2)", [fx.base.orphanUser.id, fx.base.adminA.id]);
      try {
        const anon = await makeAnonServerClient();
        for (const [client, actor] of [[anon, fx.users.montor.id], [fx.clients.invited, fx.invitedUser.id], [fx.clients.disabled, fx.disabledUser.id],
          [fx.clients.seller, fx.users.saljare.id], [fx.clients.economy, fx.users.ekonomi.id], [fx.clients.orphan, fx.base.orphanUser.id]] as const) {
          const read = await client.from("time_reports").select(reportPublicColumns);
          if (read.error) expect(read.error.code).toBe("42501"); else expect(read.data).toEqual([]);
          expect((await checkedFileReport(client, fx.base.tenantA.id, actor, reportInput())).error?.code).toBe("42501");
          expect((await checkedAnnotateReport(client, fx.base.tenantA.id, actor, { attemptId: crypto.randomUUID(), reportId: id, expectedRevision: 0, note: null })).error?.code).toBe("42501");
        }
        await adminQuery("update public.tenant_memberships set status='disabled' where id=$1", [fx.ownProfile.membershipId]);
        expect((await fx.montorClient.from("time_reports").select(reportPublicColumns)).data).toEqual([]);
      } finally { await adminQuery("delete from public.platform_operators where user_id=$1", [fx.base.orphanUser.id]); }
    });
  });

  test("[P0] 15.4-RLS-006 AC7 AC9 database core-field guard protects rows even beyond direct-grant denial", async () => {
    await withTimeReportFixture(async fx => {
      const id = reportId(await fileReport(fx.montorClient, reportInput())), before = await reportState(fx.tenantIds);
      // Elevated local fixture SQL exercises the trigger itself, never production access.
      const mutations: Array<[string, unknown]> = [["id", crypto.randomUUID()], ["tenant_id", fx.base.tenantB.id], ["user_id", fx.users.projektledare.id],
        ["created_at", "2026-10-13T00:00:00Z"], ["report_date", "2026-10-13"], ["duration_minutes", 451], ["note", "Changed core"], ["booking_id", crypto.randomUUID()],
        ["job_id", crypto.randomUUID()], ["booked_minutes_at_filing", 0], ["status", "approved"], ["filing_attempt_id", crypto.randomUUID()], ["filing_digest", "b".repeat(64)]];
      for (const [field, value] of mutations) await expect(adminQuery(`update public.time_reports set ${field}=$2 where id=$1`, [id, value])).rejects.toMatchObject({ code: "42501" });
      await expect(adminQuery("delete from public.time_reports where id=$1", [id])).rejects.toMatchObject({ code: "42501" });
      expect(await reportState(fx.tenantIds)).toEqual(before);
    });
  });

  test("[P0] 15.4-RLS-007 AC7 AC8 forced RLS exact safe column ACL and checked RPC security survive direct catalog inspection", async () => {
    const [table] = await adminQuery<{ enabled: boolean; forced: boolean; mutation_grant: boolean; readable: string[] }>(`select c.relrowsecurity enabled,c.relforcerowsecurity forced,
      has_table_privilege('authenticated',c.oid,'INSERT,UPDATE,DELETE') mutation_grant,
      array(select a.attname::text from pg_attribute a where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
        and has_column_privilege('authenticated',c.oid,a.attname,'SELECT') order by a.attname) readable
      from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='time_reports'`);
    expect(table).toMatchObject({ enabled: true, forced: true, mutation_grant: false });
    expect(table.readable).toEqual(reportPublicColumns.split(",").sort());
    const functions = await adminQuery<{ proname: string; definer: boolean; config: string[]; anon: boolean; authenticated: boolean; service: boolean }>(`select p.proname,p.prosecdef definer,p.proconfig config,
      has_function_privilege('anon',p.oid,'EXECUTE') anon,has_function_privilege('authenticated',p.oid,'EXECUTE') authenticated,
      has_function_privilege('service_role',p.oid,'EXECUTE') service from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname=any($1::text[]) order by p.proname`, [["file_time_report", "annotate_time_report", "emit_time_report_nudges"]]);
    expect(functions).toHaveLength(3);
    for (const fn of functions) {
      expect(fn.definer).toBe(true); expect(fn.anon).toBe(false); expect(fn.config).toContain('search_path=""');
      expect(fn.authenticated).toBe(fn.proname !== "emit_time_report_nudges");
      if (fn.proname === "emit_time_report_nudges") expect(fn.service).toBe(true);
    }
  });
});
