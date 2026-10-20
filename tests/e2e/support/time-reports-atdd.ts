/** Isolated real time-report browser fixtures; no runtime launch or success stub.
 * Native Playwright follows the existing resourcePage/tenant factory conventions.
 */
import { randomUUID } from "node:crypto";
import type { Locator, Page, Request, Route } from "@playwright/test";
import { expect } from "./resource-cdp-attachment";
import { withBookingFixture, type BookingFixture } from "../../support/bookings-atdd";
import { fileReport, reportInput } from "../../support/time-reports-atdd";
import { adminInsertCustomer, makeAuthedServerClient, type FixtureUser } from "../../factories/tenants";
import { adminQuery, adminSession } from "../../factories/admin-sql";
import { createJob } from "@/server/commands/jobs";
import { runCommand } from "@/server/commands/envelope";

export const REPORT_DATE = "2026-10-12";
export type ReportRow = {
  id: string; tenant_id: string; user_id: string; report_date: string;
  duration_minutes: number; booking_id: string | null; job_id: string | null;
  note: string | null; status: string; booked_minutes_at_filing: string | null;
  created_at: string; review_note: string | null; reviewed_by: string | null;
  reviewed_at: string | null; review_revision: number;
};
export type AuditRow = {
  id: string; tenant_id: string; actor_user_id: string | null; target_id: string | null;
  command: string; event_type: string; created_at: string;
};
export type ReportSnapshot = { reports: ReportRow[]; audit: AuditRow[] };
export type TimeReportBrowserFixture = {
  fx: BookingFixture;
  ownBooking: string; peerBooking: string; missingBooking: string;
  job: { id: string; title: string }; otherJob: { id: string; title: string };
  marker: string; noProfile: FixtureUser;
  noProfileClient: Awaited<ReturnType<typeof makeAuthedServerClient>>;
  snapshot: () => Promise<ReportSnapshot>;
};

/** Full physical safe report fields and audit identity for BOTH owned tenants.
 * No rate/money data or private attempt/digest is read. UI success is insufficient.
 */
export async function reportSnapshot(tenantIds: readonly string[]): Promise<ReportSnapshot> {
  const reports = await adminQuery<ReportRow>(`select id,tenant_id,user_id,
    report_date::text,duration_minutes,booking_id,job_id,note,status,
    booked_minutes_at_filing,created_at::text,review_note,reviewed_by,
    reviewed_at::text,review_revision from public.time_reports
    where tenant_id=any($1::uuid[]) order by tenant_id,id`, [tenantIds]);
  const audit = await adminQuery<AuditRow>(`select id,tenant_id,actor_user_id,target_id,
    command,event_type,created_at::text from public.audit_events
    where tenant_id=any($1::uuid[]) order by tenant_id,id`, [tenantIds]);
  return { reports, audit };
}

/** Reuses fresh role-aware tenants; never changes a shared smoke identity.
 * All setup jobs use the real normal-JWT checked command. Booking rows are
 * dedicated input fixtures, using the existing seedReadFixtures SQL shape.
 */
export async function withTimeReportBrowserFixture(
  run: (fixture: TimeReportBrowserFixture) => Promise<void>,
): Promise<void> {
  await withBookingFixture(async (fx) => {
    const marker = `time-report-${randomUUID()}`;
    const bookingIds = [randomUUID(), randomUUID(), randomUUID()];
    const jobs: string[] = [], customers: string[] = [];
    try {
      const customerId = await adminInsertCustomer({ tenant_id: fx.base.tenantA.id,
        customer_type: "company", display_name: marker });
      customers.push(customerId);
      const makeJob = async (suffix: string) => {
        const title = `${marker} ${suffix}`;
        const result = await runCommand(createJob, { client: fx.adminClient as never,
          input: { customer_id: customerId, title }, correlationId: randomUUID() });
        if (!result.ok) throw new Error(`Time report job fixture refused: ${result.code}`);
        jobs.push(result.data.targetId);
        return { id: result.data.targetId, title };
      };
      const job = await makeJob("installation"), otherJob = await makeJob("service");
      // Current E16.1 job_can_read requires own membership or assignment for
      // Montör; this explicit owned relationship makes optional-job filing real.
      await adminQuery(`insert into public.job_members(tenant_id,job_id,person_profile_id)
        values($1,$2,$3)`, [fx.base.tenantA.id, otherJob.id, fx.ownProfile.id]);
      // Fixed independent October oracle: 08:00–10:00 Stockholm = 06:00–08:00Z,
      // exactly 120 elapsed minutes. The later day has a planned missing-time chip.
      for (const [index, profile] of [fx.ownProfile.id, fx.coworkerProfile.id, fx.ownProfile.id].entries()) {
        const date = index === 2 ? "2026-10-13" : REPORT_DATE;
        await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,
          description,job_id,customer_id,create_command_id,create_payload_digest,create_result)
          values($1,$2,$3,$4,$5,$6,$7,$8,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))`,
        [bookingIds[index], fx.base.tenantA.id, `${date}T06:00:00Z`, `${date}T08:00:00Z`,
          `${marker} booking ${index}`, job.id, customerId, randomUUID()]);
        await adminQuery(`insert into public.booking_assignees(tenant_id,booking_id,person_profile_id)
          values($1,$2,$3)`, [fx.base.tenantA.id, bookingIds[index], profile]);
      }
      const noProfile = fx.roleUnionUser;
      const noProfileClient = await makeAuthedServerClient(noProfile);
      expect(await adminQuery(`select p.id from public.person_profiles p join public.tenant_memberships m
        on m.id=p.membership_id and m.tenant_id=p.tenant_id where m.user_id=$1 and m.tenant_id=$2`,
      [noProfile.id, fx.base.tenantA.id])).toEqual([]);
      await run({ fx, marker, ownBooking: bookingIds[0], peerBooking: bookingIds[1],
        missingBooking: bookingIds[2], job, otherJob, noProfile, noProfileClient,
        snapshot: () => reportSnapshot(fx.tenantIds) });
    } finally {
      // Test-only immutable-row bypass, bounded to this factory's two tenants and
      // exact parent IDs. Restore connection enforcement before returning it.
      // Base factory then owns role/profile/user/tenant teardown. No lifecycle stop.
      await adminSession(async ({ query }) => {
        await query("begin");
        try {
          await query("set local session_replication_role=replica");
          await query("delete from public.time_reports where tenant_id=any($1::uuid[])", [fx.tenantIds]);
          await query("delete from public.audit_events where tenant_id=any($1::uuid[])", [fx.tenantIds]);
          await query("delete from public.booking_conflicts where tenant_id=$1 and (booking_id=any($2::uuid[]) or related_booking_id=any($2::uuid[]))", [fx.base.tenantA.id, bookingIds]);
          await query("delete from public.booking_assignees where tenant_id=$1 and booking_id=any($2::uuid[])", [fx.base.tenantA.id, bookingIds]);
          await query("delete from public.bookings where tenant_id=$1 and id=any($2::uuid[])", [fx.base.tenantA.id, bookingIds]);
          await query("delete from public.job_events where tenant_id=$1 and job_id=any($2::uuid[])", [fx.base.tenantA.id, jobs]);
          await query("delete from public.job_members where tenant_id=$1 and job_id=any($2::uuid[])", [fx.base.tenantA.id, jobs]);
          await query("delete from public.jobs where tenant_id=$1 and id=any($2::uuid[])", [fx.base.tenantA.id, jobs]);
          await query("delete from public.customers where tenant_id=$1 and id=any($2::uuid[])", [fx.base.tenantA.id, customers]);
          await query("set local session_replication_role=origin");
          await query("commit");
        } catch (error) { await query("rollback"); throw error; }
      });
    }
  });
}

export async function hydrated(locator: Locator): Promise<void> {
  await locator.waitFor({ state: "visible" });
  await locator.evaluate((element) => new Promise<void>((resolve) => {
    const tick = () => Object.keys(element).some((key) => key.startsWith("__react"))
      ? resolve() : requestAnimationFrame(tick);
    tick();
  }));
}

// playwright-utils deviation: package/auth provider absent; actual inspected login.
export async function signIn(page: Page, user: FixtureUser): Promise<void> {
  await page.context().clearCookies();
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await hydrated(submit);
  await page.getByLabel("E-post", { exact: true }).fill(user.email);
  await page.getByLabel("Lösenord", { exact: true }).fill(user.password);
  await submit.click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

/** Semantic selectors bound to the Story 15.4 UI. */
export function filingDialog(page: Page): Locator {
  return page.getByRole("dialog", { name: "Ny tidrapport", exact: true });
}
export async function openStandalone(page: Page): Promise<Locator> {
  await page.goto("/time-reports");
  const open = page.getByRole("button", { name: "Ny tidrapport", exact: true });
  await hydrated(open);
  await open.click();
  const form = filingDialog(page);
  await expect(form).toBeVisible();
  return form;
}
export async function openWeek(page: Page): Promise<Locator> {
  await page.goto("/time-reports");
  const week = page.getByLabel("Vecka", { exact: true });
  await hydrated(week);
  await week.fill(REPORT_DATE);
  const sheet = page.getByRole("region", { name: "Min vecka", exact: true });
  await expect(sheet).toBeVisible();
  return sheet;
}

/** Observe the production Next Server Action on the current host route. */
export function isFilingRequest(request: Request, marker: string): boolean {
  return request.method() === "POST" && !!request.headers()["next-action"]
    && ["/time-reports", "/scheduling"].includes(new URL(request.url()).pathname)
    && (request.postData() ?? "").includes(marker);
}
export type FilingAttempt = {
  attemptId: string; date: string; minutes: number; note: string | null;
  bookingId: string | null; jobId: string | null;
};
export function filingAttempt(request: Request): FilingAttempt {
  const args: unknown = JSON.parse(request.postData() ?? "null");
  const input = Array.isArray(args) ? args[0] as Record<string, unknown> | undefined : undefined;
  expect(input).toBeTruthy();
  expect(input?.attemptId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  expect(typeof input?.date).toBe("string");
  expect(Number.isInteger(input?.minutes)).toBe(true);
  // Pick the approved payload fields; unrelated transport correlation may change.
  return { attemptId: input!.attemptId as string, date: input!.date as string,
    minutes: input!.minutes as number, note: input!.note as string | null,
    bookingId: input!.bookingId as string | null, jobId: input!.jobId as string | null };
}

/** Real commit → physical row/audit readback → abort response. No fulfilled success.
 * Installed BEFORE navigation. Every explicit retry shares the exact attempt.
 * The first request fails before server work; the second commits but loses its
 * response. Later denied/authorized retries reach the real server unchanged.
 */
export async function failThenLoseCommittedResponse(
  page: Page, fixture: TimeReportBrowserFixture, marker: string,
) {
  const attempts: FilingAttempt[] = [];
  let failedResolve!: () => void, committedResolve!: (state: ReportSnapshot) => void;
  let failedReject!: (error: unknown) => void, committedReject!: (error: unknown) => void;
  const failed = new Promise<void>((resolve, reject) => { failedResolve = resolve; failedReject = reject; });
  const committed = new Promise<ReportSnapshot>((resolve, reject) => { committedResolve = resolve; committedReject = reject; });
  // Both barriers may reject on one route error before the journey reaches the
  // second await. Preserve their rejection while avoiding an unhandled sibling.
  void failed.catch(() => undefined);
  void committed.catch(() => undefined);
  const before = await fixture.snapshot();
  // playwright-utils deviation: real Next action fault interception; package absent.
  const handler = async (route: Route) => {
    if (!isFilingRequest(route.request(), marker)) { await route.fallback(); return; }
    try {
      attempts.push(filingAttempt(route.request()));
      if (attempts.length === 1) {
        await route.abort("failed");
        expect(await fixture.snapshot()).toEqual(before);
        failedResolve();
      } else if (attempts.length === 2) {
        expect(attempts[1]).toEqual(attempts[0]);
        const response = await route.fetch();
        expect(response.ok()).toBe(true); // Transport only; physical commit below.
        const state = await fixture.snapshot();
        const rows = state.reports.filter((row) => row.note === marker);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({ user_id: fixture.noProfile.id, status: "submitted",
          duration_minutes: 75, report_date: REPORT_DATE, booking_id: null, job_id: null });
        expect(state.audit.filter((row) => row.target_id === rows[0].id)).toHaveLength(1);
        expect(state.reports.length - before.reports.length).toBe(1);
        expect(state.audit.length - before.audit.length).toBe(1);
        await route.abort("failed");
        committedResolve(state);
      } else {
        expect(attempts[attempts.length - 1]).toEqual(attempts[0]);
        await route.continue();
      }
    } catch (error) {
      // Reject both barriers immediately; never let an interception error turn
      // into an unexplained locator timeout or an apparent successful test.
      failedReject(error); committedReject(error);
      throw error;
    }
  };
  await page.route("**/*", handler);
  return { attempts, failed, committed, dispose: () => page.unroute("**/*", handler) };
}

/** Real production filing for review setup and negatives; no direct report INSERT. */
export async function seedReviewReports(f: TimeReportBrowserFixture) {
  const seed = async (client: Parameters<typeof fileReport>[0], patch: Parameters<typeof reportInput>[0]) => {
    const result = await fileReport(client, reportInput(patch));
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(`Time report fixture filing refused: ${result.code}`);
    return result.data.reportId;
  };
  const own = await seed(f.fx.montorClient, { minutes: 180, bookingId: f.ownBooking,
    jobId: f.job.id, note: `${f.marker} own linked` });
  const ownUnlinked = await seed(f.fx.montorClient, { minutes: 45, note: `${f.marker} own standalone` });
  const ownOtherJob = await seed(f.fx.montorClient, { minutes: 60, jobId: f.otherJob.id,
    note: `${f.marker} other job` });
  const peer = await seed(f.fx.plannerClient, { minutes: 90, bookingId: f.peerBooking,
    jobId: f.job.id, note: `${f.marker} peer linked` });
  const peerUnlinked = await seed(f.fx.plannerClient, { minutes: 30, note: `${f.marker} peer standalone` });
  const otherWeek = await seed(f.fx.montorClient, { date: "2026-10-19", minutes: 660,
    note: `${f.marker} other week` });
  const foreign = await seed(f.fx.foreignClient, { minutes: 420, note: `${f.marker} foreign` });
  return { own, ownUnlinked, ownOtherJob, peer, peerUnlinked, otherWeek, foreign };
}
