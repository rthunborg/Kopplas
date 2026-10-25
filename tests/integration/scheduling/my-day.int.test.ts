/** Story 15.6 RED — checked SQL projection under normal authenticated JWTs.
 * All cases intentionally skip until implementation activation. No passing RLS
 * coverage is claimed. read_my_day's FOUR arguments are approved by the spec;
 * JSON field spellings are proposed minimal bindings to reconcile before use.
 * Per-case existing factories allocate/dispose owned tenant rows. No global DDL,
 * grants, policy edits, settings, trigger faults or query-stat resets are added.
 * Empty jobs output is NOT proof that the false branch executes zero nested job
 * queries; that separate implementation/High-review evidence remains required.
 */
import { randomUUID } from "node:crypto";
import { describe, expect, test } from "vitest";
import { adminQuery, adminSession } from "../../factories/admin-sql";
import { makeAnonServerClient, makeAuthedServerClient, type TestServerClient } from "../../factories/tenants";
import { bookingSnapshot, seedBookingParents, seedReadFixtures, withBookingFixture, type BookingFixture } from "../../support/bookings-atdd";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";

type Card = { id: string; startsAt: string; endsAt: string; allDay: boolean; description: string;
  ownAssignment: string | null; customerLabel: string | null; address: string | null; jobId?: string | null; jobLabel?: string | null };
type Job = { id: string; title: string; customerLabel: string | null; status: string; myRole: string };
type Projection = { bookings: Card[]; activeJobs: Job[] };
const START = "2026-10-11T22:00:00.000Z", END = "2026-10-18T22:00:00.000Z";
function rpc(client: TestServerClient, tenantId: string | null, includeJobs = false, start: string | null = START, end: string | null = END) {
  return client.rpc("read_my_day", { p_tenant_id: tenantId, p_start: start, p_end: end, p_include_jobs: includeJobs });
}
async function read(client: TestServerClient, tenantId: string, includeJobs = false, start = START, end = END): Promise<Projection> {
  const reply = await rpc(client, tenantId, includeJobs, start, end);
  expect(reply.error).toBeNull(); expect(reply.data).not.toBeNull();
  return reply.data as unknown as Projection;
}
type Seed = { startsAt?: string; endsAt?: string; allDay?: boolean; status?: string; jobId?: string | null;
  customerId?: string | null; facilityId?: string | null; workRoleId?: string | null;
  seriesId?: string | null; occurrenceIndex?: number | null; nominalDate?: string | null };
async function seedBooking(fx: BookingFixture, people = [fx.ownProfile.id], patch: Seed = {}) {
  const id = randomUUID(), t = fx.base.tenantA.id;
  await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,all_day,status,description,
    job_id,customer_id,facility_id,work_role_id,series_id,occurrence_index,nominal_date,create_command_id,create_payload_digest,create_result)
    values($1,$2,$3,$4,$5,$6,'Min dag fixture',$7,$8,$9,$10,$11,$12,$13,$14,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))`,
  [id, t, patch.startsAt ?? "2026-10-12T06:00:00Z", patch.endsAt ?? "2026-10-12T07:00:00Z",
    patch.allDay ?? false, patch.status ?? "planned", patch.jobId ?? null, patch.customerId ?? null,
    patch.facilityId ?? null, patch.workRoleId ?? null, patch.seriesId ?? null, patch.occurrenceIndex ?? null, patch.nominalDate ?? null, randomUUID()]);
  for (const person of people) await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)", [t, id, person]);
  return id;
}
async function seedJobs(fx: BookingFixture) {
  const parents = await seedBookingParents(fx.base.tenantA.id);
  const ids: Record<string, string> = {};
  for (const [key, status] of [["member", "created"], ["assigned", "in_progress"], ["both", "created"],
    ["unrelated", "created"], ["done", "done"], ["cancelled", "cancelled"], ["archived", "created"]]) {
    const [job] = await adminQuery<{ id: string }>(`insert into public.jobs(tenant_id,customer_id,title,status,facility_id,archived_at)
      values($1,$2,$3,$4,$5,case when $6::boolean then statement_timestamp() else null end) returning id`,
    [fx.base.tenantA.id, parents.customerId, `My day ${key}`, status, parents.facilityId, key === "archived"]);
    ids[key] = job.id;
    if (!["assigned", "unrelated"].includes(key)) await adminQuery(`insert into public.job_members(tenant_id,job_id,person_profile_id,designation)
      values($1,$2,$3,$4)`, [fx.base.tenantA.id, job.id, fx.ownProfile.id, key === "member" ? "arbetsledare" : "member"]);
  }
  const assignedBooking = await seedBooking(fx, [fx.ownProfile.id], { jobId: ids.assigned });
  await seedBooking(fx, [fx.ownProfile.id], { jobId: ids.both });
  return { ids, parents, assignedBooking };
}

describe("15.6 Min dag minimal authenticated SQL projection (RED)", () => {
  test.skip("[P0] 15.6-INT-01 AC1 authenticated-only stable checked definer ACL and no-session denial", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    const [meta] = await adminQuery<{ provolatile: string; prosecdef: boolean; proconfig: string[]; authenticated: boolean; anon: boolean; service_role: boolean; public_execute: boolean }>(`select p.provolatile,p.prosecdef,p.proconfig,
      has_function_privilege('authenticated',p.oid,'execute') authenticated,
      has_function_privilege('anon',p.oid,'execute') anon,has_function_privilege('service_role',p.oid,'execute') service_role,
      exists(select 1 from aclexplode(p.proacl) where grantee=0 and privilege_type='EXECUTE') public_execute
      from pg_proc p where p.oid='public.read_my_day(uuid,timestamptz,timestamptz,boolean)'::regprocedure`);
    expect(meta).toEqual({ provolatile: "s", prosecdef: true, proconfig: ['search_path=""'], authenticated: true, anon: false, service_role: false, public_execute: false });
    const anon = await makeAnonServerClient(); expect((await rpc(anon, randomUUID())).error?.code).toBe("42501");
    await adminSession(async session => {
      await session.query("set role service_role");
      await expect(session.query("select public.read_my_day($1,$2,$3,false)", [randomUUID(), START, END])).rejects.toMatchObject({ code: "42501" });
    });
    await adminSession(async session => {
      await session.query("set role authenticated");
      await expect(session.query("select public.read_my_day($1,$2,$3,false)", [randomUUID(), START, END])).rejects.toMatchObject({ code: "42501" });
    });
  });

  test.skip("[P0] 15.6-INT-02 AC1/2 normal JWT cannot read foreign tenant or unentitled/invited/disabled/orphan authority", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      await seedReadFixtures(fx);
      const foreign = await rpc(fx.montorClient, fx.base.tenantB.id, true);
      expect(foreign.data).toBeNull(); expect(foreign.error?.code).toBe("42501");
      for (const user of [fx.users.saljare, fx.users.ekonomi, fx.invitedUser, fx.disabledUser, fx.base.orphanUser]) {
        const reply = await rpc(await makeAuthedServerClient(user), fx.base.tenantA.id, true);
        expect(reply.data).toBeNull(); expect(reply.error?.code).toBe("42501");
      }
    });
  });

  for (const state of ["archived", "missing"] as const) {
    test.skip(`[P0] 15.6-INT-03 AC1 own profile ${state} cannot be replaced by a peer profile`, async ctx => {
      if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
      await withBookingFixture(async fx => {
        if (state === "archived") {
          await seedReadFixtures(fx);
          await adminQuery("update public.person_profiles set archived_at=statement_timestamp() where tenant_id=$1 and id=$2", [fx.base.tenantA.id, fx.ownProfile.id]);
        } else {
          // No assignment/member rows exist yet, so no FK or historical row is bypassed.
          await adminQuery("delete from public.person_profiles where tenant_id=$1 and id=$2", [fx.base.tenantA.id, fx.ownProfile.id]);
        }
        const reply = await rpc(fx.montorClient, fx.base.tenantA.id, true);
        expect(reply.data).toBeNull(); expect(reply.error?.code).toBe("42501");
      });
    });
  }

  test.skip("[P0] 15.6-INT-04 AC2 every role including managers sees only own assignments, once and no peers", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const seed = await seedReadFixtures(fx), before = await bookingSnapshot(fx.tenantIds);
      const own = await read(fx.montorClient, fx.base.tenantA.id);
      expect(own.bookings.map(row => row.id).sort()).toEqual([seed.own, seed.shared].sort());
      const manager = await read(fx.plannerClient, fx.base.tenantA.id);
      expect(manager.bookings.map(row => row.id).sort()).toEqual([seed.coworker, seed.shared].sort());
      const admin = await read(fx.adminClient, fx.base.tenantA.id); expect(admin.bookings).toEqual([]);
      for (const result of [own, manager, admin]) {
        expect(JSON.stringify(result)).not.toContain(fx.foreignProfile.id);
        expect(JSON.stringify(result)).not.toMatch(/assigneeIds|membership_id|person_profile_id|roster|employment_percentage/);
      }
      expect(await bookingSnapshot(fx.tenantIds)).toEqual(before);
    });
  });

  test.skip("[P0] 15.6-INT-05 AC2/6 removed assignment and revoked current membership disappear on next read", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const seed = await seedReadFixtures(fx);
      expect((await read(fx.montorClient, fx.base.tenantA.id)).bookings.map(row => row.id)).toContain(seed.own);
      await adminQuery("delete from public.booking_assignees where tenant_id=$1 and booking_id=$2 and person_profile_id=$3", [fx.base.tenantA.id, seed.own, fx.ownProfile.id]);
      expect((await read(fx.montorClient, fx.base.tenantA.id)).bookings.map(row => row.id)).toEqual([seed.shared]);
      await adminQuery("update public.tenant_memberships set status='disabled' where tenant_id=$1 and id=$2", [fx.base.tenantA.id, fx.ownProfile.membershipId]);
      const reply = await rpc(fx.montorClient, fx.base.tenantA.id);
      expect(reply.data).toBeNull(); expect(reply.error?.code).toBe("42501");
    });
  });

  test.skip("[P0] 15.6-INT-06 AC2 shared/recurring/all-day/overnight DST overlap is complete and half-open", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const seriesId = randomUUID();
      await adminQuery(`insert into public.booking_series(id,tenant_id,rule,defaults) values($1,$2,$3,$4)`,
        [seriesId, fx.base.tenantA.id, { preset: "daily", startDate: "2026-10-25", startTime: "02:30:00", endTime: "03:30:00", endDayOffset: 0, allDay: false, timeZone: "Europe/Stockholm", count: 2 }, { description: "Materialized read fixture" }]);
      const overnight = await seedBooking(fx, [fx.ownProfile.id], { startsAt: "2026-10-24T21:30:00Z", endsAt: "2026-10-24T23:30:00Z" });
      const allDay = await seedBooking(fx, [fx.ownProfile.id], { startsAt: "2026-10-24T22:00:00Z", endsAt: "2026-10-25T23:00:00Z", allDay: true });
      const recurring = await seedBooking(fx, [fx.ownProfile.id, fx.coworkerProfile.id], { startsAt: "2026-10-25T00:30:00Z", endsAt: "2026-10-25T02:30:00Z", seriesId, occurrenceIndex: 0, nominalDate: "2026-10-25" });
      await seedBooking(fx, [fx.ownProfile.id], { startsAt: "2026-10-26T01:30:00Z", endsAt: "2026-10-26T02:30:00Z", seriesId, occurrenceIndex: 1, nominalDate: "2026-10-26" });
      await seedBooking(fx, [fx.ownProfile.id], { startsAt: "2026-10-24T21:00:00Z", endsAt: "2026-10-24T22:00:00Z" });
      await seedBooking(fx, [fx.ownProfile.id], { startsAt: "2026-10-25T23:00:00Z", endsAt: "2026-10-26T00:00:00Z" });
      await seedBooking(fx, [fx.ownProfile.id], { startsAt: "2026-10-25T06:00:00Z", endsAt: "2026-10-25T07:00:00Z", status: "cancelled" });
      const result = await read(fx.montorClient, fx.base.tenantA.id, false, "2026-10-24T22:00:00Z", "2026-10-25T23:00:00Z");
      expect(result.bookings.map(row => row.id)).toEqual([overnight, allDay, recurring]);
      expect(result.bookings.find(row => row.id === allDay)?.allDay).toBe(true);
      expect(new Set(result.bookings.map(row => row.id)).size).toBe(3);
    });
  });

  test.skip("[P0] 15.6-INT-07 AC2 own projection exceeds a transport page and deterministic equal-start order has no omissions", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const ids = Array.from({ length: 1001 }, () => randomUUID()).sort();
      await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,create_command_id,create_payload_digest,create_result)
        select id,$1,'2026-10-12T06:00:00Z','2026-10-12T07:00:00Z','Complete own page',id,repeat('a',64),jsonb_build_object('bookingId',id::text)
        from unnest($2::uuid[]) id`, [fx.base.tenantA.id, ids]);
      await adminQuery(`insert into public.booking_assignees(tenant_id,booking_id,person_profile_id)
        select $1,id,$3 from unnest($2::uuid[]) id`, [fx.base.tenantA.id, ids, fx.ownProfile.id]);
      const result = await read(fx.montorClient, fx.base.tenantA.id);
      expect(result.bookings.map(row => row.id)).toEqual(ids);
    });
  });

  test.skip("[P0] 15.6-INT-08 AC2 exact eight-day bound allows fall-DST week, rejects null/reverse/equal/infinite/oversized ranges", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      expect((await rpc(fx.montorClient, fx.base.tenantA.id, false, "2026-10-18T22:00:00Z", "2026-10-25T23:00:00Z")).error).toBeNull();
      expect((await rpc(fx.montorClient, fx.base.tenantA.id, false, "2026-10-18T22:00:00Z", "2026-10-26T22:00:00Z")).error).toBeNull();
      for (const [start, end] of [[null, END], [START, null], [START, START], [END, START], ["-infinity", END],
        [START, "infinity"], ["2026-10-18T22:00:00Z", "2026-10-26T22:00:00.000001Z"]]) {
        const reply = await rpc(fx.montorClient, fx.base.tenantA.id, false, start, end);
        expect(reply.data).toBeNull(); expect(reply.error?.code).toBe("23514");
      }
    });
  });

  test.skip("[P0] 15.6-INT-09 AC3/4/7 false branch has no job identity/role/label and only explicit booking context", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const { ids, parents, assignedBooking } = await seedJobs(fx);
      const explicit = await seedBooking(fx, [fx.ownProfile.id], { jobId: ids.member, customerId: parents.customerId, facilityId: parents.facilityId, workRoleId: parents.workRoleId });
      const result = await read(fx.montorClient, fx.base.tenantA.id, false);
      const omitted = await fx.montorClient.rpc("read_my_day", { p_tenant_id: fx.base.tenantA.id, p_start: START, p_end: END });
      expect(omitted.error).toBeNull(); expect(omitted.data).toEqual(result);
      expect(Object.keys(result).sort()).toEqual(["activeJobs", "bookings"]); expect(result.activeJobs).toEqual([]);
      expect(result.bookings.find(row => row.id === assignedBooking)?.customerLabel).toBeNull();
      expect(result.bookings.find(row => row.id === explicit)?.customerLabel).toBe("Workshop customer");
      for (const card of result.bookings) {
        expect(Object.keys(card).sort()).toEqual(["address", "allDay", "customerLabel", "description", "endsAt", "id", "ownAssignment", "startsAt"]);
        expect(card).not.toHaveProperty("jobId"); expect(card).not.toHaveProperty("jobLabel"); expect(card).not.toHaveProperty("myRole");
      }
      expect(JSON.stringify(result)).not.toMatch(/My day |quote|price|cost|margin|rate|source|jobId|jobLabel|myRole/);
      // This is output evidence only. Nested zero-query proof is still required.
    });
  });

  test.skip("[P0] 15.6-INT-10 AC4 true is composition control; actual personal relationship and readable active lifecycle still govern", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const { ids } = await seedJobs(fx);
      const own = await read(fx.montorClient, fx.base.tenantA.id, true);
      expect(own.activeJobs.map(row => row.id).sort()).toEqual([ids.member, ids.assigned, ids.both].sort());
      expect(own.activeJobs.find(row => row.id === ids.member)?.myRole).toBe("arbetsledare");
      expect(own.activeJobs.find(row => row.id === ids.both)?.myRole).toBe("member");
      for (const job of own.activeJobs) {
        expect(Object.keys(job).sort()).toEqual(["customerLabel", "id", "myRole", "status", "title"]);
        expect(["created", "in_progress"]).toContain(job.status);
        expect((await fx.montorClient.rpc("job_can_read", { p_tenant_id: fx.base.tenantA.id, p_job_id: job.id })).data).toBe(true);
        expect((await fx.montorClient.rpc("job_has_current_relationship", { p_tenant_id: fx.base.tenantA.id, p_job_id: job.id })).data).toBe(true);
      }
      // A manager can read the job workspace but cannot inherit another worker's personal list.
      expect((await fx.plannerClient.rpc("job_can_read", { p_tenant_id: fx.base.tenantA.id, p_job_id: ids.unrelated })).data).toBe(true);
      expect((await fx.plannerClient.rpc("job_has_current_relationship", { p_tenant_id: fx.base.tenantA.id, p_job_id: ids.unrelated })).data).toBe(false);
      expect((await read(fx.plannerClient, fx.base.tenantA.id, true)).activeJobs).toEqual([]);
      // Current relationship remains necessary even when direct callers request true.
      await adminQuery("update public.job_members set archived_at=statement_timestamp() where tenant_id=$1 and job_id=$2 and person_profile_id=$3", [fx.base.tenantA.id, ids.member, fx.ownProfile.id]);
      expect((await read(fx.montorClient, fx.base.tenantA.id, true)).activeJobs.map(row => row.id)).not.toContain(ids.member);
      expect(JSON.stringify(own)).not.toMatch(/quote|acceptedPrice|sourceSent|cost_rate|sell_rate|membership_id|person_profile_id/);
    });
  });

  test.skip("[P0] 15.6-INT-11 AC4 assignment-only job disappears immediately after its final own relationship is removed", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const { ids, assignedBooking } = await seedJobs(fx);
      expect((await read(fx.montorClient, fx.base.tenantA.id, true)).activeJobs.map(row => row.id)).toContain(ids.assigned);
      await adminQuery("delete from public.booking_assignees where tenant_id=$1 and booking_id=$2 and person_profile_id=$3", [fx.base.tenantA.id, assignedBooking, fx.ownProfile.id]);
      const reply = await read(fx.montorClient, fx.base.tenantA.id, true);
      expect(reply.activeJobs.map(row => row.id)).not.toContain(ids.assigned);
      expect(reply.bookings.map(row => row.id)).not.toContain(assignedBooking);
    });
  });

  test.skip("[P0] 15.6-INT-12 AC3 address uses explicit booking facility, then job override, then job facility; never billing", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const { ids, parents } = await seedJobs(fx);
      await adminQuery("update public.customers set address_line1='PRIVATE BILLING ADDRESS',city='Billing city' where tenant_id=$1 and id=$2", [fx.base.tenantA.id, parents.customerId]);
      await adminQuery("update public.facilities set address_line1='Facility street 1',postal_code='11122',city='Stockholm' where tenant_id=$1 and id=$2", [fx.base.tenantA.id, parents.facilityId]);
      const [bookingFacility] = await adminQuery<{ id: string }>(`insert into public.facilities(tenant_id,customer_id,name,address_line1,postal_code,city)
        values($1,$2,'Explicit booking facility','Explicit street 2','22233','Uppsala') returning id`, [fx.base.tenantA.id, parents.customerId]);
      await adminQuery("update public.jobs set location_street='Override street 3',location_postal_code='33344',location_city='Lund',location_country_code='SE' where tenant_id=$1 and id=$2", [fx.base.tenantA.id, ids.member]);
      const explicit = await seedBooking(fx, [fx.ownProfile.id], { jobId: ids.member, facilityId: bookingFacility.id, customerId: parents.customerId });
      const override = await seedBooking(fx, [fx.ownProfile.id], { jobId: ids.member });
      const facility = await seedBooking(fx, [fx.ownProfile.id], { jobId: ids.both });
      const absent = await seedBooking(fx, [fx.ownProfile.id], { customerId: parents.customerId });
      const result = await read(fx.montorClient, fx.base.tenantA.id, true);
      expect(result.bookings.find(row => row.id === explicit)?.address).toContain("Explicit street 2");
      expect(result.bookings.find(row => row.id === override)?.address).toContain("Override street 3");
      expect(result.bookings.find(row => row.id === facility)?.address).toContain("Facility street 1");
      expect(result.bookings.find(row => row.id === absent)?.address).toBeNull();
      expect(JSON.stringify(result)).not.toContain("PRIVATE BILLING ADDRESS");
    });
  });

  test.skip("[P0] 15.6-INT-13 AC3 booking assignment label is booking work role, never resource default or a peer list", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const parents = await seedBookingParents(fx.base.tenantA.id);
      const [other] = await adminQuery<{ id: string }>("insert into public.work_roles(tenant_id,display_name,cost_rate_ore,sell_rate_ore) values($1,'PRIVATE RESOURCE DEFAULT',10000,20000) returning id", [fx.base.tenantA.id]);
      await adminQuery("update public.person_profiles set default_work_role_id=$3 where tenant_id=$1 and id=$2", [fx.base.tenantA.id, fx.ownProfile.id, other.id]);
      const id = await seedBooking(fx, [fx.ownProfile.id, fx.coworkerProfile.id], { workRoleId: parents.workRoleId });
      const result = await read(fx.montorClient, fx.base.tenantA.id, true);
      expect(result.bookings.find(row => row.id === id)?.ownAssignment).toBe("Electrician");
      expect(JSON.stringify(result)).not.toMatch(/PRIVATE RESOURCE DEFAULT|cost_rate|sell_rate|assigneeIds|membership_id/);
    });
  });

  test.skip("[P0] 15.6-INT-14 AC4 true flag cannot grant job authority to an ordinary related sales member", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const { ids } = await seedJobs(fx);
      const [membership] = await adminQuery<{ id: string }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [fx.base.tenantA.id, fx.users.saljare.id]);
      const [profile] = await adminQuery<{ id: string }>("insert into public.person_profiles(tenant_id,membership_id) values($1,$2) returning id", [fx.base.tenantA.id, membership.id]);
      await adminQuery("insert into public.job_members(tenant_id,job_id,person_profile_id) values($1,$2,$3)", [fx.base.tenantA.id, ids.unrelated, profile.id]);
      const sales = await makeAuthedServerClient(fx.users.saljare);
      expect((await sales.rpc("job_has_current_relationship", { p_tenant_id: fx.base.tenantA.id, p_job_id: ids.unrelated })).data).toBe(true);
      expect((await sales.rpc("job_can_read", { p_tenant_id: fx.base.tenantA.id, p_job_id: ids.unrelated })).data).toBe(false);
      const reply = await rpc(sales, fx.base.tenantA.id, true);
      expect(reply.data).toBeNull(); expect(reply.error?.code).toBe("42501");
      // Sales also lacks Bookings.View: this proves combined denial, not isolated
      // evaluation of job_can_read inside an otherwise admitted caller's query.
    });
  });

  test.skip("[P0] 15.6-INT-15 AC4 active own member jobs exceed a transport page without dropping relationships", async ctx => {
    if (skipUnlessStack(ctx, await isLocalStackReachable())) return;
    await withBookingFixture(async fx => {
      const parents = await seedBookingParents(fx.base.tenantA.id);
      const ids = Array.from({ length: 1001 }, () => randomUUID()).sort();
      await adminQuery(`insert into public.jobs(id,tenant_id,customer_id,title,status)
        select id,$1,$3,'Complete own job page','created' from unnest($2::uuid[]) id`, [fx.base.tenantA.id, ids, parents.customerId]);
      await adminQuery(`insert into public.job_members(tenant_id,job_id,person_profile_id)
        select $1,id,$3 from unnest($2::uuid[]) id`, [fx.base.tenantA.id, ids, fx.ownProfile.id]);
      const result = await read(fx.montorClient, fx.base.tenantA.id, true);
      expect(result.activeJobs.map(row => row.id).sort()).toEqual(ids);
      expect(new Set(result.activeJobs.map(row => row.id)).size).toBe(1001);
    });
  });
});
