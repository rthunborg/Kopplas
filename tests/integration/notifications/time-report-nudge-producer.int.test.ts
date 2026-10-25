import { describe, expect, test, type TestContext } from "vitest";
import { adminQuery, adminSession } from "../../factories/admin-sql";
import { adminInsertMembership, makeAnonServerClient } from "../../factories/tenants";
import { withTimeReportFixture, seedReportBooking, reportInput, fileReport, reportId, produceNudges,
  jobsClient, createNudgeFailureLabels, nudgeFailureSites, reportState, observeRpcCodes, withReportAuditFault, withNudgeRecipients, whileTenantBlocked } from "../../support/time-reports-atdd";

/** NUDGE004-only public Vitest metadata carrier. No error/task traversal.
 * This owns only its newly created slot; foreign metadata is never sanitized. */
export function createNudgeTaskMetaSink(meta:TestContext["task"]["meta"]):(line:string)=>void {
  const key="calendarSourceLabelsV1";
  let published:readonly string[]|undefined,refused=false;
  const valid=(line:unknown):line is string=>{
    if(typeof line!=="string"||line.length>512||!/^[\x20-\x7e]+$/.test(line))return false;
    const parts=/^calendar-source-label-v1 case=NUDGE004 site=([a-z-]+) boundary=([A-Z_]+) factory=UNKNOWN final_identity_relation=([A-Z_]+) booking_entered=(true|false) clients=(NOT_STARTED|PENDING|RETURNED|REJECTED) report=(NOT_STARTED|PENDING|RETURNED|REJECTED) cleanup=(NOT_STARTED|PENDING|RETURNED|REJECTED) composition=(NOT_STARTED|PENDING|RETURNED|REJECTED) outer=(NOT_STARTED|PENDING|RETURNED|REJECTED)$/.exec(line);
    if(!parts||!nudgeFailureSites.some(site=>site===parts[1]))return false;
    const [,site,boundary,relation,entered,clients,report,cleanup,composition,outer]=parts;
    if(!["LOCAL","OPAQUE_OUTER_BEFORE_CALLBACK_UNKNOWN","OPAQUE_OUTER_AFTER_CALLBACK_UNKNOWN","OUTER_REJECTION_UNKNOWN","OPAQUE_OUTER_REJECTION_WITH_INNER_FAILURE_UNKNOWN","TEST_FINAL","UNKNOWN"].includes(boundary)||!["SAME_AS_OBSERVED_INNER","DIFFERENT_FROM_OBSERVED_INNER","NO_INNER_OBSERVED","UNKNOWN"].includes(relation))return false;
    if((boundary==="LOCAL"||boundary==="OUTER_REJECTION_UNKNOWN")&&relation!=="UNKNOWN")return false;
    if(boundary==="UNKNOWN"&&(site!=="unknown"||relation!=="UNKNOWN"))return false;
    if(boundary==="OPAQUE_OUTER_REJECTION_WITH_INNER_FAILURE_UNKNOWN"&&!["SAME_AS_OBSERVED_INNER","DIFFERENT_FROM_OBSERVED_INNER"].includes(relation))return false;
    if(relation!=="UNKNOWN"&&outer!=="REJECTED")return false;
    if(relation==="NO_INNER_OBSERVED"&&!((entered==="false"&&[clients,report,cleanup,composition].every(state=>state==="NOT_STARTED"))||(entered==="true"&&[clients,report,cleanup,composition].every(state=>state==="RETURNED"))))return false;
    if(["SAME_AS_OBSERVED_INNER","DIFFERENT_FROM_OBSERVED_INNER"].includes(relation)&&entered!=="true")return false;
    if(boundary==="OPAQUE_OUTER_BEFORE_CALLBACK_UNKNOWN"&&(relation!=="NO_INNER_OBSERVED"||entered!=="false"||[clients,report,cleanup,composition].some(state=>state!=="NOT_STARTED")))return false;
    if(boundary==="OPAQUE_OUTER_AFTER_CALLBACK_UNKNOWN"&&(relation!=="NO_INNER_OBSERVED"||entered!=="true"||[clients,report,cleanup,composition].some(state=>state!=="RETURNED")))return false;
    return true;
  };
  return line=>{try{
    if(refused)return;
    if(!valid(line)||!meta||typeof meta!=="object"||Array.isArray(meta)){refused=true;return;}
    const prototype=Object.getPrototypeOf(meta);
    if(prototype!==null&&prototype!==Object.prototype){refused=true;return;}
    if(prototype&&Object.getOwnPropertyDescriptor(prototype,key)){refused=true;return;}
    const slot=Object.getOwnPropertyDescriptor(meta,key);
    if(published?(!slot||!("value" in slot)||slot.value!==published||slot.enumerable!==true||slot.writable!==false||slot.configurable!==true):!!slot){refused=true;return;}
    if((published?.length??0)>=16){refused=true;return;}
    const next=Object.freeze([...(published??[]),line.slice(0)]);
    Object.defineProperty(meta,key,{value:next,enumerable:true,writable:false,configurable:true});published=next;
  }catch{refused=true;}};
}

const asOf = "2026-10-19T22:30:00.000Z"; // Stockholm Tue20: previous completed local dates13..19.
/** Observe a real service RPC backend blocked on this test's exact owner PID.
 * Poll SQL lock state, never sleep or infer ordering from elapsed time. A bounded
 * deadline only diagnoses a missing barrier; it cannot count as race evidence.
 */
async function waitForBlockedNudge(blockerPid:number, isSettled:()=>boolean):Promise<number> {
  const until=Date.now()+10_000;
  do {
    const rows=await adminQuery<{pid:number}>(`select a.pid from pg_stat_activity a
      where $1=any(pg_blocking_pids(a.pid)) and a.query like '%emit_time_report_nudges%'
        and exists(select 1 from pg_locks l where l.pid=a.pid and l.locktype='advisory' and not l.granted)`,[blockerPid]);
    if (rows.length) { expect(rows).toHaveLength(1); return rows[0].pid; }
    if (isSettled()) throw new Error("Nudge settled before the owned advisory-lock barrier; no serialization evidence");
  } while (Date.now()<until);
  throw new Error("Nudge did not reach the exact owned advisory-lock barrier");
}

type PreferenceMutation="absent-upsert"|"existing-upsert"|"existing-update"|"key-change";
function preferenceStatement(mutation:PreferenceMutation):string {
  if (mutation==="key-change") return `update public.notification_preferences set category='time_report.nudge',enabled=false
    where tenant_id=$1 and user_id=$2 and category='booking.changed' and channel='in_app' returning id`;
  if (mutation==="existing-update") return `update public.notification_preferences set enabled=false
    where tenant_id=$1 and user_id=$2 and category='time_report.nudge' and channel='in_app' returning id`;
  return `insert into public.notification_preferences(tenant_id,user_id,category,channel,enabled)
    values($1,$2,'time_report.nudge','in_app',false)
    on conflict(tenant_id,user_id,category,channel) do update set enabled=excluded.enabled returning id`;
}

/** A real authenticated writer session. A watchdog is diagnostic only: 57014 is
 * never accepted as the production gate's exact retryable 55P03/message result.
 */
async function preferenceWriteAsActor(tenantId:string,userId:string,mutation:PreferenceMutation) {
  return adminSession(async ({query}) => {
    await query("begin"); let open=true;
    try {
      await query("select set_config('request.jwt.claim.sub',$1,true)",[userId]);
      await query("set local role authenticated");
      await query("set local statement_timeout='5s'");
      const [session]=await query<{pid:number; actor:string; role:string}>("select pg_backend_pid() pid,auth.uid() actor,current_user::text role");
      expect(session.actor).toBe(userId); expect(session.role).toBe("authenticated");
      try {
        const rows=await query<{id:string}>(preferenceStatement(mutation),[tenantId,userId]);
        await query("commit"); open=false;
        return {pid:session.pid,acknowledged:true,code:null,message:null,rows};
      } catch (error) {
        await query("rollback"); open=false;
        const failure=error as {code?:unknown;message?:unknown};
        const [locks]=await query<{held:boolean}>("select exists(select 1 from pg_locks where pid=pg_backend_pid() and locktype='advisory' and granted) held");
        expect(locks.held).toBe(false);
        return {pid:session.pid,acknowledged:false,code:failure.code,message:failure.message,rows:[]};
      }
    } finally { if (open) await query("rollback"); }
  });
}

// Checked producer/RPC: emitTimeReportNudges(injectedJobsClient,tenantId,{asOf,cursor,correlationId}).
// SQL computes eligibility + preferences + absence under tenant serialization;
// adapter must not scan bookings/memberships a second time or return their facts.
describe("Story 15.4 existing E13 in-app nudge producer acceptance", () => {
  test("[P0] 15.4-NUDGE-001 AC5 AC8 frozen seven completed Stockholm dates exclude weekend today future old and reported day", async () => {
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
    // Exercise the actual SQL producer with independently pinned Stockholm UTC
    // boundaries: transition Sundays are 23/25h; local days are half-open.
    const vectors = [
      { name: "spring", asOf: "2026-03-30T22:30:00Z", intervals: [
        ["2026-03-28T23:00:00Z", "2026-03-29T22:00:00Z", 1380],
        ["2026-03-29T22:00:00Z", "2026-03-29T22:01:00Z", 1]], dates: ["2026-03-30"] },
      { name: "fall", asOf: "2026-10-26T23:30:00Z", intervals: [
        ["2026-10-24T22:00:00Z", "2026-10-25T23:00:00Z", 1500],
        ["2026-10-26T22:30:00Z", "2026-10-26T23:00:00Z", 30]], dates: ["2026-10-26"] },
      { name: "cross-midnight", asOf, intervals: [
        ["2026-10-13T21:30:00Z", "2026-10-13T22:30:00Z", 60]], dates: ["2026-10-13", "2026-10-14"] },
      { name: "exclusive-end", asOf, intervals: [
        ["2026-10-12T22:00:00Z", "2026-10-13T22:00:00Z", 1440]], dates: ["2026-10-13"] },
    ] as const;
    for (const vector of vectors) await withTimeReportFixture(async fx => {
      for (const [startsAt, endsAt, minutes] of vector.intervals) {
        const booking = await seedReportBooking(fx, { startsAt, endsAt });
        const [physical] = await adminQuery<{ minutes: number }>(
          "select (extract(epoch from (ends_at-starts_at))/60)::int minutes from public.bookings where tenant_id=$1 and id=$2",
          [fx.base.tenantA.id, booking]);
        expect(physical.minutes, vector.name).toBe(minutes);
      }
      const before = await reportState(fx.tenantIds);
      const emitted = await produceNudges(await jobsClient(), fx.base.tenantA.id, { asOf: vector.asOf });
      expect(emitted, vector.name).toEqual({ count: vector.dates.length });
      const after = await reportState(fx.tenantIds);
      const reminders = after.notifications.filter(n => n.category === "time_report.nudge");
      expect(reminders.map(n => n.logical_period).sort(), vector.name).toEqual([...vector.dates]);
      expect(reminders.every(n => n.recipient_user_id === fx.users.montor.id && n.tenant_id === fx.base.tenantA.id)).toBe(true);
      expect(after.audit.length - before.audit.length).toBe(vector.dates.length);
      expect(after.reports).toEqual(before.reports);
    });
  });

  test("[P0] 15.4-NUDGE-002 AC5 AC8 adapter uses one scoped checked RPC injected client and leaves raw booking ACL revoked", async () => {
    await withTimeReportFixture(async fx => {
      await seedReportBooking(fx, { startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
      const service = await jobsClient(), calls: Array<{ name: string; args: Record<string, unknown> }> = [];
      const contained = new Proxy(service, { get(target, key) {
        if (key === "from") return () => { throw new Error("Nudge adapter attempted unrestricted second scan"); };
        if (key === "rpc") return (name: string, args: Record<string, unknown>) => { calls.push({ name, args }); return target.rpc(name, args); };
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

  test("[P0] 15.4-NUDGE-003 AC5 AC8 current opt-out inactive role loss archived profile and cancelled booking suppress recipients", async () => {
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

  test("[P0] 15.4-NUDGE-004 AC5 AC8 more than25 real recipients continue stable frozen scoped cursor without gaps duplicates or fact return", async ({task}) => {
    const labels=createNudgeFailureLabels(createNudgeTaskMetaSink(task.meta));
    try { await withTimeReportFixture(async fx => { await withNudgeRecipients(fx, async recipients => {
      labels.at("recipient-count"); expect(recipients).toHaveLength(27);
      labels.at("first-page"); const service = await jobsClient(), first = await produceNudges(service, fx.base.tenantA.id, { asOf });
      expect(first.count).toBeLessThanOrEqual(25 * 7); expect(first.cursor).toEqual(expect.any(String));
      let cursor = first.cursor, count = first.count;
      const seen = new Set<string>();
      for (let page = 0; cursor && page < 10; page++) {
        labels.at("cursor-repeat"); expect(seen.has(cursor)).toBe(false); seen.add(cursor);
        labels.at("next-page"); const next = await produceNudges(service, fx.base.tenantA.id, { asOf, cursor });
        expect(next.count).toBeLessThanOrEqual(25 * 7); count += next.count; cursor = next.cursor;
      }
      labels.at("total-count"); expect(cursor).toBeUndefined(); expect(count).toBe(27);
      labels.at("physical-recipients"); const notes = (await reportState(fx.tenantIds)).notifications.filter(n => n.category === "time_report.nudge");
      expect(notes.map(n => n.recipient_user_id).sort()).toEqual(recipients.map(r => r.userId).sort());
      labels.at("physical-day"); expect(notes.every(n => n.logical_period === "2026-10-19")).toBe(true);
      labels.at("resume-import"); const { handleJobsRunRequest } = await import("@/app/api/jobs/run/route");
      const { ACTIVE_PRODUCERS } = await import("@/server/jobs/producers");
      const producer = ACTIVE_PRODUCERS.find(p => p.id === "scheduling.time-report-nudges")!;
      const resumedCalls: Array<Record<string,unknown>> = [];
      const observed = new Proxy(service, { get(target,key) {
        if (key === "rpc") return (name:string,args:Record<string,unknown>) => {
          if (name === "emit_time_report_nudges") resumedCalls.push(args);
          return target.rpc(name,args); // Preserve the real query's abortSignal chain.
        };
        const value=Reflect.get(target,key,target); return typeof value === "function" ? value.bind(target) : value;
      } });
      labels.at("resume-state"); const beforeResume = await reportState(fx.tenantIds);
      labels.at("resume-route"); const response = await handleJobsRunRequest(new Request("http://localhost/api/jobs/run", {method:"POST"}), {
        authorize:()=>true, createClient:()=>observed, producers:[producer], now:()=>new Date("2026-10-22T00:00:00Z"),
        run:async dependencies => { await dependencies.execute(producer,fx.base.tenantA.id,first.cursor); return {outcome:"completed" as const}; },
      });
      labels.at("resume-status"); expect(response.status).toBe(200); expect(resumedCalls).toHaveLength(1);
      labels.at("resume-call"); expect(resumedCalls[0]).toMatchObject({p_tenant_id:fx.base.tenantA.id,p_cursor:first.cursor});
      labels.at("resume-asof"); expect(new Date(String(resumedCalls[0].p_as_of)).toISOString()).toBe(new Date(asOf).toISOString());
      labels.at("resume-effects"); expect(await reportState(fx.tenantIds)).toEqual(beforeResume); // Actual already-emitted page remains idempotent.
      labels.at("negative-state"); const beforeBadCursor = await reportState(fx.tenantIds);
      labels.at("foreign-cursor"); await expect(produceNudges(service, fx.base.tenantB.id, { asOf, cursor: first.cursor })).rejects.toThrow();
      labels.at("changed-asof"); await expect(produceNudges(service, fx.base.tenantA.id, { asOf: "2026-10-20T22:30:00Z", cursor: first.cursor })).rejects.toThrow();
      labels.at("malformed-cursor"); await expect(produceNudges(service, fx.base.tenantA.id, { asOf, cursor: "malformed-cursor" })).rejects.toThrow();
      labels.at("negative-effects"); expect(await reportState(fx.tenantIds)).toEqual(beforeBadCursor);
    },labels); },labels); }catch(error){labels.at("test-boundary");labels.failure("TEST_FINAL");throw error;}
  });

  test("[P0] 15.4-NUDGE-005 AC5 duplicate concurrent hourly retries emit zero new notification or audit effects", async () => {
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

  test("[P0] 15.4-NUDGE-006 AC5 AC8 tenant lock checks current membership after actual blocked producer", async () => {
    await withTimeReportFixture(async fx => {
      await seedReportBooking(fx,{startsAt:"2026-10-19T06:00:00Z",endsAt:"2026-10-19T07:00:00Z"});
      const service=await jobsClient(), before=await reportState(fx.tenantIds);
      const result=await whileTenantBlocked(fx.base.tenantA.id,
        ()=>produceNudges(service,fx.base.tenantA.id,{asOf}),
        ()=>adminQuery("update public.tenant_memberships set status='disabled' where id=$1",[fx.ownProfile.membershipId]).then(()=>undefined));
      expect(result.count).toBe(0); expect(await reportState(fx.tenantIds)).toEqual(before);
    });
  });

  test("[P0] 15.4-NUDGE-010 AC5 AC8 first authenticated opt-out UPSERT UPDATE or category change serializes before nudge", async () => {
    for (const mutation of ["absent-upsert","existing-upsert","existing-update","key-change"] as const) await withTimeReportFixture(async fx => {
      const tenantId=fx.base.tenantA.id, userId=fx.users.montor.id;
      await seedReportBooking(fx,{startsAt:"2026-10-19T06:00:00Z",endsAt:"2026-10-19T07:00:00Z"});
      expect(await adminQuery("select id from public.notification_preferences where tenant_id=$1 and user_id=$2 and category='time_report.nudge' and channel='in_app'",[tenantId,userId])).toEqual([]);
      if (mutation!=="absent-upsert") {
        const seeded=await fx.montorClient.from("notification_preferences").insert({tenant_id:tenantId,user_id:userId,
          category:mutation==="key-change"?"booking.changed":"time_report.nudge",channel:"in_app",enabled:true});
        expect(seeded.error).toBeNull();
      }
      const service=await jobsClient(), before=await reportState(fx.tenantIds);
      let pending:ReturnType<typeof produceNudges>|undefined, producerSettled=false, writerAcknowledged=false;
      try {
        await adminSession(async ({query}) => {
          await query("begin"); let open=true;
          try {
            const [writer]=await query<{pid:number}>("select pg_backend_pid() pid");
            await query("select set_config('request.jwt.claim.sub',$1,true)",[userId]);
            await query("set local role authenticated");
            // Genuine normal-JWT RLS writes. No manually acquired tenant lock:
            // the row gate must try without waiting, even if it already owns a
            // tuple lock. A successful write retains the gate until commit.
            const written=await query<{id:string}>(preferenceStatement(mutation),[tenantId,userId]);
            expect(written).toHaveLength(1);
            pending=produceNudges(service,tenantId,{asOf});
            void pending.then(()=>{producerSettled=true;},()=>{producerSettled=true;});
            const producerPid=await waitForBlockedNudge(writer.pid,()=>producerSettled);
            expect(producerPid).not.toBe(writer.pid); expect(producerSettled).toBe(false);
            await query("commit"); open=false; writerAcknowledged=true;
          } finally {
            // Release the writer's transaction before awaiting its blocked RPC.
            if (open) await query("rollback");
          }
        });
        expect(writerAcknowledged).toBe(true); expect(await pending!).toEqual({count:0});
        expect(await adminQuery("select enabled from public.notification_preferences where tenant_id=$1 and user_id=$2 and category='time_report.nudge' and channel='in_app'",[tenantId,userId])).toEqual([{enabled:false}]);
        expect(await reportState(fx.tenantIds)).toEqual(before); // No reminder or audit effect.
      } finally {
        // The session has committed/rolled back and released every owner lock.
        if (pending) await Promise.allSettled([pending]);
      }
    });
  });

  test("[P0] 15.4-NUDGE-011 AC5 AC8 emission-first preference races fail exactly 55P03 then succeed only on explicit retry", async () => {
    // Coordinator-approved additional barrier contract: one owned notification
    // BEFORE INSERT stage, exact tenant/recipient/subject/category/date only.
    // Unlike 008 this gate blocks; the original stage-SQLSTATE fault is unchanged.
    for (const mutation of ["absent-upsert","existing-upsert","existing-update","key-change"] as const) await withTimeReportFixture(async fx => {
      const tenantId=fx.base.tenantA.id, userId=fx.users.montor.id, correlationId=crypto.randomUUID();
      for (const id of [tenantId,userId]) if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error("Owned UUID scope required");
      await seedReportBooking(fx,{startsAt:"2026-10-19T06:00:00Z",endsAt:"2026-10-19T07:00:00Z"});
      if (mutation!=="absent-upsert") {
        const seeded=await fx.montorClient.from("notification_preferences").insert({tenant_id:tenantId,user_id:userId,
          category:mutation==="key-change"?"booking.changed":"time_report.nudge",channel:"in_app",enabled:true});
        expect(seeded.error).toBeNull();
      }
      const preferences=()=>adminQuery<{row:unknown}>("select to_jsonb(p) row from public.notification_preferences p where tenant_id=$1 and user_id=$2 order by id",[tenantId,userId]);
      const beforePreferences=await preferences(), before=await reportState(fx.tenantIds), service=await jobsClient();
      const gate=`tr_nudge_gate_${crypto.randomUUID().replaceAll("-","")}`;
      const barrierKey=BigInt(`0x${crypto.randomUUID().replaceAll("-","").slice(0,15)}`).toString();
      const [distinct]=await adminQuery<{different:boolean}>("select $1::bigint<>hashtextextended($2,0) different",[barrierKey,tenantId]);
      expect(distinct.different).toBe(true);
      let installed=false, producerSettled=false;
      let pendingProducer:ReturnType<typeof produceNudges>|undefined;
      let pendingWriter:ReturnType<typeof preferenceWriteAsActor>|undefined;
      try {
        await adminQuery(`create function test_support.${gate}() returns trigger language plpgsql set search_path='' as $$ begin
          if new.tenant_id='${tenantId}'::uuid and new.recipient_user_id='${userId}'::uuid
            and new.logical_subject_id='${userId}'::uuid and new.category='time_report.nudge' and new.logical_period=date '2026-10-19' then
            perform pg_advisory_xact_lock(${barrierKey}::bigint);
          end if; return new; end $$;
          revoke all on function test_support.${gate}() from public,anon,authenticated,service_role;
          create trigger ${gate} before insert on public.notifications for each row execute function test_support.${gate}()`);
        installed=true;
        await adminSession(async ({query}) => {
          await query("begin"); let open=true;
          try {
            const [control]=await query<{pid:number}>("select pg_backend_pid() pid,pg_advisory_xact_lock($1::bigint)",[barrierKey]);
            pendingProducer=produceNudges(service,tenantId,{asOf,correlationId});
            void pendingProducer.then(()=>{producerSettled=true;},()=>{producerSettled=true;});
            const producerPid=await waitForBlockedNudge(control.pid,()=>producerSettled);
            expect(producerPid).not.toBe(control.pid); expect(producerSettled).toBe(false);
            // Exact stage key plus real backend wait proves absence-check →
            // notification BEFORE INSERT was reached while the producer holds its tenant.
            pendingWriter=preferenceWriteAsActor(tenantId,userId,mutation);
            const writer=await pendingWriter;
            expect(writer.pid).not.toBe(control.pid); expect(writer.pid).not.toBe(producerPid);
            expect(writer).toMatchObject({acknowledged:false,code:"55P03",message:"notification preference busy; retry explicitly",rows:[]});
            // The genuine injected jobs service JWT has no special escape from
            // the same trigger. This is a preference write, never a booking scan.
            const serviceWrite=await service.from("notification_preferences").upsert({tenant_id:tenantId,user_id:userId,
              category:"time_report.nudge",channel:"in_app",enabled:false},{onConflict:"tenant_id,user_id,category,channel"}).select("id");
            expect(serviceWrite.error).toMatchObject({code:"55P03",message:"notification preference busy; retry explicitly"});
            expect(serviceWrite.data).toBeNull();
            expect(producerSettled).toBe(false); expect(await preferences()).toEqual(beforePreferences);
            expect(await reportState(fx.tenantIds)).toEqual(before);
            await query("commit"); open=false;
          } finally {
            // Release this stage gate before settling any still-pending work.
            if (open) await query("rollback");
          }
        });
        expect(await pendingProducer!).toEqual({count:1});
        const emitted=await reportState(fx.tenantIds);
        const notes=emitted.notifications.filter(row=>!before.notifications.some(prior=>prior.id===row.id));
        expect(notes).toHaveLength(1); expect(notes[0]).toMatchObject({tenant_id:tenantId,recipient_user_id:userId,
          logical_subject_id:userId,logical_period:"2026-10-19",category:"time_report.nudge"});
        expect(emitted.audit.filter(row=>row.correlation_id===correlationId)).toMatchObject([{target_id:notes[0].id,actor_user_id:null}]);
        expect(emitted.audit.length-before.audit.length).toBe(1); expect(emitted.reports).toEqual(before.reports);
        const retried=mutation==="key-change"
          ? await fx.montorClient.from("notification_preferences").update({category:"time_report.nudge",enabled:false}).eq("tenant_id",tenantId).eq("user_id",userId).eq("category","booking.changed").eq("channel","in_app").select("id")
          : mutation==="existing-update"
            ? await fx.montorClient.from("notification_preferences").update({enabled:false}).eq("tenant_id",tenantId).eq("user_id",userId).eq("category","time_report.nudge").eq("channel","in_app").select("id")
            : await fx.montorClient.from("notification_preferences").upsert({tenant_id:tenantId,user_id:userId,category:"time_report.nudge",channel:"in_app",enabled:false},{onConflict:"tenant_id,user_id,category,channel"}).select("id");
        expect(retried.error).toBeNull(); expect(retried.data).toHaveLength(1);
        expect(await adminQuery("select enabled from public.notification_preferences where tenant_id=$1 and user_id=$2 and category='time_report.nudge' and channel='in_app'",[tenantId,userId])).toEqual([{enabled:false}]);
        expect(await reportState(fx.tenantIds)).toEqual(emitted); // Historical first emission remains exactly once.
      } finally {
        // No object teardown until both real sessions have settled. Control
        // transaction cleanup above always releases the gate first.
        await Promise.allSettled([...(pendingProducer?[pendingProducer]:[]),...(pendingWriter?[pendingWriter]:[])]);
        if (installed) {
          await adminQuery(`drop trigger ${gate} on public.notifications;drop function test_support.${gate}()`);
          const [remaining]=await adminQuery<{n:number}>(`select ((select count(*) from pg_trigger where tgname=$1)
            +(select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='test_support' and p.proname=$1))::int n`,[gate]);
          expect(remaining.n).toBe(0);
        }
      }
    });
  });

  test("[P0] 15.4-NUDGE-012 AC5 AC8 preference gate scopes actual old/new tenants and rechecks membership without exemptions", async () => {
    await withTimeReportFixture(async fx => {
      const user=fx.base.adminA, client=fx.adminClient;
      const foreignBefore=await adminQuery("select id from public.notification_preferences where tenant_id=$1 and user_id=$2",[fx.base.tenantB.id,user.id]);
      expect((await client.from("notification_preferences").insert({tenant_id:fx.base.tenantB.id,user_id:user.id,category:"time_report.nudge",channel:"in_app",enabled:false})).error?.code).toBe("42501");
      expect(await adminQuery("select id from public.notification_preferences where tenant_id=$1 and user_id=$2",[fx.base.tenantB.id,user.id])).toEqual(foreignBefore);
      await adminInsertMembership({tenant_id:fx.base.tenantB.id,user_id:user.id,role:"montor",status:"active",invited_email:user.email});
      const [lower,higher]=[fx.base.tenantA.id,fx.base.tenantB.id].sort();
      const seeded=await client.from("notification_preferences").insert({tenant_id:lower,user_id:user.id,category:"time_report.nudge",channel:"in_app",enabled:true}).select("id").single();
      expect(seeded.error).toBeNull(); if (!seeded.data) throw new Error("Owned preference seed absent");
      const preferenceId=seeded.data.id;
      await adminSession(async ({query}) => {
        await query("begin");
        try {
          await query("select pg_advisory_xact_lock(hashtextextended($1,0))",[higher]);
          // Two active memberships must not expand a lower-row write to every
          // tenant that this identity belongs to; only OLD/NEW row tenant IDs count.
          const own=await client.from("notification_preferences").update({enabled:false}).eq("id",preferenceId).select("id");
          expect(own.error).toBeNull(); expect(own.data).toHaveLength(1);
          const moved=await client.from("notification_preferences").update({tenant_id:higher}).eq("id",preferenceId);
          expect(moved.error).toMatchObject({code:"55P03",message:"notification preference busy; retry explicitly"});
          expect(await adminQuery("select tenant_id,enabled from public.notification_preferences where id=$1",[preferenceId])).toEqual([{tenant_id:lower,enabled:false}]);
          // Failed sorted multi-tenant acquisition must release every earlier
          // transaction lock. A fresh lower-row writer can immediately succeed.
          const again=await client.from("notification_preferences").update({enabled:true}).eq("id",preferenceId).select("id");
          expect(again.error).toBeNull(); expect(again.data).toHaveLength(1);
          // Native fixture SQL has no auth/JWT exemption from the same busy gate.
          await expect(adminQuery("insert into public.notification_preferences(tenant_id,user_id,category,channel,enabled) values($1,$2,'time_report.nudge','in_app',false)",[higher,user.id])).rejects.toMatchObject({code:"55P03",message:"notification preference busy; retry explicitly"});
        } finally { await query("rollback"); }
      });
      await adminSession(async ({query}) => {
        await query("begin");
        try {
          await query("select pg_advisory_xact_lock(hashtextextended($1,0))",[lower]);
          const away=await client.from("notification_preferences").update({category:"booking.changed"}).eq("id",preferenceId);
          expect(away.error).toMatchObject({code:"55P03",message:"notification preference busy; retry explicitly"});
          await expect(adminQuery("delete from public.notification_preferences where id=$1",[preferenceId])).rejects.toMatchObject({code:"55P03",message:"notification preference busy; retry explicitly"});
          expect(await adminQuery("select tenant_id,category,enabled from public.notification_preferences where id=$1",[preferenceId])).toEqual([{tenant_id:lower,category:"time_report.nudge",enabled:true}]);
        } finally { await query("rollback"); }
      });
      const away=await client.from("notification_preferences").update({category:"booking.changed"}).eq("id",preferenceId).select("id");
      expect(away.error).toBeNull(); expect(away.data).toHaveLength(1);
      const restored=await client.from("notification_preferences").update({category:"time_report.nudge"}).eq("id",preferenceId).select("id");
      expect(restored.error).toBeNull(); expect(restored.data).toHaveLength(1);
      const moved=await client.from("notification_preferences").update({tenant_id:fx.base.tenantB.id}).eq("id",preferenceId).select("id");
      expect(moved.error).toBeNull(); expect(moved.data).toHaveLength(1);
      await adminQuery("update public.tenant_memberships set status='disabled' where tenant_id=$1 and user_id=$2",[fx.base.tenantB.id,user.id]);
      const denied=await client.from("notification_preferences").update({enabled:false}).eq("id",preferenceId).select("id");
      expect(denied.error).toBeNull(); expect(denied.data).toEqual([]);
      expect(await adminQuery("select tenant_id,enabled from public.notification_preferences where id=$1",[preferenceId])).toEqual([{tenant_id:fx.base.tenantB.id,enabled:true}]);
      expect((await client.from("notification_preferences").insert({tenant_id:fx.base.tenantB.id,user_id:user.id,category:"booking.changed",channel:"in_app",enabled:false})).error?.code).toBe("42501");
    });
  });

  test("[P0] 15.4-NUDGE-013 AC5 AC8 exact private preference gate and row trigger survive catalog inspection", async () => {
    const rows=await adminQuery<{name:string; relation:string; type:number; enabled:string; function_schema:string; function_name:string; definer:boolean; config:string[]; public_execute:boolean; anon:boolean; authenticated:boolean; service:boolean}>(`
      select t.tgname name,c.relname relation,t.tgtype::int type,t.tgenabled::text enabled,pn.nspname function_schema,p.proname function_name,p.prosecdef definer,p.proconfig config,
        exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE') public_execute,
        has_function_privilege('anon',p.oid,'EXECUTE') anon,has_function_privilege('authenticated',p.oid,'EXECUTE') authenticated,
        has_function_privilege('service_role',p.oid,'EXECUTE') service
      from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace join pg_proc p on p.oid=t.tgfoid join pg_namespace pn on pn.oid=p.pronamespace
      where n.nspname='public' and c.relname='notification_preferences' and t.tgname='notification_preferences_time_report_gate' and not t.tgisinternal`);
    expect(rows).toHaveLength(1); expect(rows[0]).toMatchObject({name:"notification_preferences_time_report_gate",relation:"notification_preferences",
      type:31,enabled:"O",function_schema:"public",function_name:"time_report_preference_gate",definer:false,public_execute:false,anon:false,authenticated:false,service:false});
    expect(rows[0].config).toEqual(['search_path=""']);
  });

  test("[P0] 15.4-NUDGE-007 AC2 AC5 filing committed before serialized nudge predicate suppresses notification", async () => {
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

  test("[P0] 15.4-NUDGE-008 AC5 atomic system audit failure verifies inserted recipient-date nudge then rolls it back", async () => {
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

  test("[P0] 15.4-NUDGE-009 AC5 AC8 existing authenticated jobs dispatch passes exact tenant and frozen run instant to real nudge adapter", async () => {
    await withTimeReportFixture(async fx => {
      await seedReportBooking(fx, { startsAt: "2026-10-19T06:00:00Z", endsAt: "2026-10-19T07:00:00Z" });
      const { handleJobsRunRequest } = await import("@/app/api/jobs/run/route");
      const { ACTIVE_PRODUCERS } = await import("@/server/jobs/producers");
      const producer = ACTIVE_PRODUCERS.find(p => p.category === "time_report.nudge");
      expect(producer).toMatchObject({ module: "scheduling", category: "time_report.nudge", schedule: "0 * * * *", essential: false });
      const service = await jobsClient(), calls: Array<Record<string, unknown>> = [];
      const observed = new Proxy(service, { get(target, key) {
        if (key === "rpc") return (name: string, args: Record<string, unknown>) => { if (name === "emit_time_report_nudges") calls.push(args); return target.rpc(name, args); };
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
