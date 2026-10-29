/** Story 15.6 essential connected journeys — active acceptance scenarios.
 * Source: spec-15-6-min-dag-the-field-landing.md AC1–7; inspected TimeReportEntry,
 * TimeReportForm, time-reports.e2e.spec.ts and resource-cdp-attachment patterns.
 * Runtime coverage requires the configured production server and real fixture stack.
 * Accessible composition bindings: Min dag/Agenda/Mina jobb/Ändringar i
 * planeringen regions; my-day-booking-{id}; my-day-job-{id}; Datum date control;
 * Föregående vecka/Nästa vecka. Bind these to implemented accessible composition
 * at the production composition seam. Uppdatera/Försök igen/actions/error copy come from the spec.
 * Existing filing dialog, labels, attempt serialization and success ID are real.
 * Read interception assumes the existing Next Server Action transport on /my-day;
 * reconcile its actual serialization, never add a test-only endpoint or grant.
 *
 * playwright-utils two gates: config=true, package.json dependency absent, so the
 * mandate is NOT bound. Reuse existing resourcePage/login/SQL factory functions;
 * native route/waitForResponse are documented below. Optional utility adoption
 * belongs to a separately authorized framework task; no install/shared fixture.
 * Imports perform no DB/browser setup. Full RLS/DST/DTO matrices belong to the
 * companion suites; exhaustive visual/manual matrices remain release work.
 */
import { randomUUID } from "node:crypto";
import type { CDPSession, Locator, Page, Request, Route } from "@playwright/test";
import { test, expect } from "./support/resource-cdp-attachment";
import {
  REPORT_DATE, filingAttempt, filingDialog, hydrated, signIn,
  withTimeReportBrowserFixture, type FilingAttempt, type ReportSnapshot,
  type TimeReportBrowserFixture,
} from "./support/time-reports-atdd";
import { adminQuery } from "../factories/admin-sql";
import { adminInsertFacility } from "../factories/tenants";
import { SCOPE_MANIFEST } from "@/scope/manifest";
import { TENANT_CONTEXT_MESSAGES } from "@/server/auth/tenant-context";

const jobsActive = SCOPE_MANIFEST.modules.some(module => module.id === "jobs" && module.status === "active");
const bookingCard = (page: Page, id: string) => page.getByTestId(`my-day-booking-${id}`);
const agenda = (page: Page) => page.getByRole("region", { name: "Agenda", exact: true });
const ownJobs = (page: Page) => page.getByRole("region", { name: "Mina jobb", exact: true });
const notices = (page: Page) => page.getByRole("region", { name: "Ändringar i planeringen", exact: true });

async function openDay(page: Page, date = REPORT_DATE): Promise<void> {
  await page.goto("/my-day");
  const selected = page.getByLabel("Datum", { exact: true });
  await hydrated(selected);
  await selected.fill(date);
  await expect(selected).toHaveValue(date);
}

async function assertPhoneFits(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

type MyDayFixture = TimeReportBrowserFixture & { jobless: string; shared: string; allDay: string; facilityId: string; address: string };
/** Only fresh factory-owned tenants/rows. Outer fixture owns report/audit/job
 * cleanup; this local extension owns its three bookings, facility and notifications.
 * Existing immutable booking metadata/SQL seed shape is reused, never report INSERT.
 */
async function withMyDayFixture(run: (f: MyDayFixture) => Promise<void>): Promise<void> {
  await withTimeReportBrowserFixture(async f => {
    const tenant = f.fx.base.tenantA.id;
    const ids = [randomUUID(), randomUUID(), randomUUID()];
    const [booking] = await adminQuery<{ customer_id: string }>(
      "select customer_id from public.bookings where tenant_id=$1 and id=$2", [tenant, f.ownBooking]);
    const facilityId = await adminInsertFacility({ tenant_id: tenant, customer_id: booking.customer_id, name: `${f.marker} site` });
    const address = "Ångvägen 12 & gården, 123 45 Stockholm";
    try {
      await adminQuery("update public.facilities set address_line1=$3,postal_code='123 45',city='Stockholm' where tenant_id=$1 and id=$2",
        [tenant, facilityId, "Ångvägen 12 & gården"]);
      await adminQuery("update public.bookings set facility_id=$3 where tenant_id=$1 and id=$2", [tenant, f.ownBooking, facilityId]);
      for (const [index, id] of ids.entries()) {
        await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,job_id,all_day,
          create_command_id,create_payload_digest,create_result)
          values($1,$2,$3,$4,$5,$6,$7,$8,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))`,
        [id, tenant, index === 2 ? "2026-10-14T22:00:00Z" : `${REPORT_DATE}T${index === 0 ? "10" : "04"}:00:00Z`,
          index === 2 ? "2026-10-15T22:00:00Z" : `${REPORT_DATE}T${index === 0 ? "11" : "05"}:00:00Z`,
          `${f.marker} ${index === 0 ? "jobless" : index === 1 ? "shared" : "all-day"}`, index === 1 ? f.job.id : null, index === 2, randomUUID()]);
        await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)",
          [tenant, id, f.fx.ownProfile.id]);
      }
      await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)",
        [tenant, ids[1], f.fx.coworkerProfile.id]);
      await run({ ...f, jobless: ids[0], shared: ids[1], allDay: ids[2], facilityId, address });
    } finally {
      await adminQuery("delete from public.notifications where tenant_id=$1", [tenant]);
      await adminQuery("delete from public.booking_assignees where tenant_id=$1 and booking_id=any($2::uuid[])", [tenant, ids]);
      await adminQuery("delete from public.bookings where tenant_id=$1 and id=any($2::uuid[])", [tenant, ids]);
      await adminQuery("update public.bookings set facility_id=null where tenant_id=$1 and id=$2", [tenant, f.ownBooking]);
      await adminQuery("delete from public.facilities where tenant_id=$1 and id=$2", [tenant, facilityId]);
    }
  });
}

/** Existing Next action identity + existing ReportInput, extended to its new host.
 * filingAttempt is inspected source, not a fabricated /api/... contract.
 */
function isFiling(request: Request, marker: string): boolean {
  return request.method() === "POST" && !!request.headers()["next-action"]
    && new URL(request.url()).pathname === "/my-day" && (request.postData() ?? "").includes(marker);
}
function isDayRead(request: Request): boolean {
  return request.method() === "POST" && !!request.headers()["next-action"]
    && new URL(request.url()).pathname === "/my-day"
    && !(request.postData() ?? "").includes('"attemptId"');
}

async function keyboardActivate(page: Page, control: Locator): Promise<void> {
  await control.focus();
  await expect(control).toBeFocused();
  await page.keyboard.press("Enter");
}

function barrier<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  void promise.catch(() => undefined);
  return { promise, resolve, reject };
}

async function nativeDrag(page: Page, touch: CDPSession, origin: Locator, dx: number, dy: number): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
  const bounds = await origin.boundingBox();
  expect(bounds).not.toBeNull();
  const x = bounds!.x + bounds!.width / 2, y = bounds!.y + bounds!.height / 2;
  expect(x + dx).toBeGreaterThan(0); expect(x + dx).toBeLessThan(360);
  expect(y + dy).toBeGreaterThan(0); expect(y + dy).toBeLessThan(640);
  await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
  for (const fraction of [0.15, 0.35, 0.6, 0.8, 1]) await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove", touchPoints: [{ x: x + dx * fraction, y: y + dy * fraction, id: 1 }],
  });
  await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

test.describe("15.6 Min dag essential production-server journeys", () => {
  test("[P0] 15.6-E01 pure Montör lands on today's phone agenda, ordered own cards, explicit map click and same-job workspace", async ({ resourcePage: page }) => {
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 360, height: 640 });
      const mapRequests: string[] = [];
      const mapTraffic = /(?:google\.[^/]+\/maps|maps\.google|maps\.apple|openstreetmap|geocod)/i;
      // External map requests must result from a deliberate link click only.
      page.context().on("request", request => { if (mapTraffic.test(request.url())) mapRequests.push(request.url()); });
      await signIn(page, f.fx.users.montor);
      await expect(page).toHaveURL(/\/my-day(?:\?|$)/);
      const selected = page.getByLabel("Datum", { exact: true });
      await hydrated(selected);
      await expect(selected).toHaveValue(new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(new Date()));
      await page.getByRole("button", { name: "Öppna meny", exact: true }).click();
      await expect(page.getByRole("link", { name: "Min dag", exact: true }).filter({ visible: true })).toBeVisible();
      await page.keyboard.press("Escape");
      await selected.fill(REPORT_DATE);
      for (const id of [f.shared, f.ownBooking, f.jobless]) await expect(bookingCard(page, id)).toHaveCount(1);
      await expect(bookingCard(page, f.peerBooking)).toHaveCount(0);
      await expect(agenda(page).getByRole("article")).toHaveCount(3);
      const order = await agenda(page).getByRole("article").evaluateAll(cards => cards.map(card => card.getAttribute("data-testid")));
      expect(order).toEqual([f.shared, f.ownBooking, f.jobless].map(id => `my-day-booking-${id}`));
      const own = bookingCard(page, f.ownBooking);
      await expect(own).toContainText("08:00");
      await expect(own).toContainText("10:00");
      if (jobsActive) await expect(own).toContainText(f.job.title);
      await expect(own).toContainText(f.marker); // Customer display_name from the existing fixture.
      const map = own.getByRole("link", { name: /Ångvägen/ });
      await expect(map).toBeVisible();
      const href = await map.getAttribute("href");
      expect(href).not.toBeNull();
      const destination = new URL(href!);
      expect(destination.protocol).toBe("https:");
      expect([...destination.searchParams.values()].join(" ")).toContain("Ångvägen 12 & gården");
      expect([...destination.searchParams.values()].join(" ")).toContain("Stockholm");
      expect(mapRequests).toEqual([]);
      // Block the outbound navigation; the gesture and encoded href are sufficient
      // essential smoke, with no provider call needed for this acceptance test.
      await expect(bookingCard(page, f.jobless).getByRole("link", { name: "Öppna jobbet", exact: true })).toHaveCount(0);
      await expect(bookingCard(page, f.jobless).getByRole("link", { name: /karta|adress/i })).toHaveCount(0);
      await assertPhoneFits(page);
      if (jobsActive) {
        const open = own.getByRole("link", { name: "Öppna jobbet", exact: true });
        await expect(open).toHaveAttribute("href", `/jobs/${f.job.id}`);
        await open.click();
        await expect(page).toHaveURL(new RegExp(`/jobs/${f.job.id}(?:\\?|$)`));
        await expect(page.getByTestId("job-workspace-header")).toContainText(f.job.title);
        await openDay(page);
      }
      await page.context().route(mapTraffic, route => route.abort("blockedbyclient"));
      const explicitMapRequest = page.context().waitForEvent("request", request => mapTraffic.test(request.url()));
      await bookingCard(page, f.ownBooking).getByRole("link", { name: /Ångvägen/ }).click({ noWaitAfter: true });
      expect((await explicitMapRequest).url()).toBe(href);
      expect(mapRequests).toHaveLength(1);
    });
  });

  test("[P0] 15.6-E02 exact inline prefill, unknown committed response, frozen same attempt and one durable own report", async ({ resourcePage: page }) => {
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 360, height: 640 });
      const reportBooking = jobsActive ? f.ownBooking : f.jobless;
      const reportJob = jobsActive ? f.job.id : null;
      const reportStart = jobsActive ? "08:00" : "12:00";
      const reportEnd = jobsActive ? "10:00" : "13:00";
      const reportMinutes = jobsActive ? 120 : 60;
      const before = await f.snapshot();
      const attempts: FilingAttempt[] = [];
      let committed!: (snapshot: ReportSnapshot) => void;
      let rejectCommit!: (error: unknown) => void;
      const commit = new Promise<ReportSnapshot>((resolve, reject) => { committed = resolve; rejectCommit = reject; });
      void commit.catch(() => undefined);
      // playwright-utils deviation: dependency absent; real action fetch commits,
      // SQL proves it, then abort loses only the response. No fulfilled fake success.
      const handler = async (route: Route) => {
        if (!isFiling(route.request(), f.marker)) { await route.fallback(); return; }
        try {
          attempts.push(filingAttempt(route.request()));
          if (attempts.length !== 1) { expect(attempts.at(-1)).toEqual(attempts[0]); await route.continue(); return; }
          const response = await route.fetch();
          expect(response.ok()).toBe(true);
          const state = await f.snapshot();
          const rows = state.reports.filter(row => row.note === f.marker);
          expect(rows).toHaveLength(1);
          expect(rows[0]).toMatchObject({ tenant_id: f.fx.base.tenantA.id, user_id: f.fx.users.montor.id,
            report_date: REPORT_DATE, duration_minutes: reportMinutes, booking_id: reportBooking, job_id: reportJob, status: "submitted" });
          expect(state.reports.length - before.reports.length).toBe(1);
          expect(state.audit.filter(row => row.target_id === rows[0].id)).toHaveLength(1);
          expect(state.audit.length - before.audit.length).toBe(1);
          await route.abort("failed");
          committed(state);
        } catch (error) { rejectCommit(error); throw error; }
      };
      await page.route("**/*", handler); // Installed before navigation/submit.
      try {
        await signIn(page, f.fx.users.montor);
        await openDay(page);
        await bookingCard(page, reportBooking).getByRole("button", { name: "Rapportera tid", exact: true }).click();
        const form = filingDialog(page);
        await expect(form.getByLabel("Datum", { exact: true })).toHaveValue(REPORT_DATE);
        await expect(form.getByLabel("Start", { exact: true })).toHaveValue(`${REPORT_DATE}T${reportStart}`);
        await expect(form.getByLabel("Slut", { exact: true })).toHaveValue(`${REPORT_DATE}T${reportEnd}`);
        await expect(form.getByLabel("Jobb", { exact: true })).toHaveValue(reportJob ?? "");
        await form.getByLabel("Anteckning", { exact: true }).fill(f.marker);
        await keyboardActivate(page, form.getByRole("button", { name: "Rapportera tid", exact: true }));
        const durable = await commit;
        await expect(form.getByText("Osänd", { exact: true })).toBeVisible();
        await expect(form.getByTestId("time-report-submit-status")).toHaveCount(0);
        await expect(form.getByLabel("Anteckning", { exact: true })).toHaveValue(f.marker);
        await expect(form.getByLabel("Start", { exact: true })).toBeDisabled();
        expect(attempts).toHaveLength(1);
        expect(attempts[0]).toMatchObject({ date: REPORT_DATE, minutes: reportMinutes, bookingId: reportBooking, jobId: reportJob, note: f.marker });
        const retry = form.getByRole("button", { name: "Försök igen med samma försök", exact: true });
        // playwright-utils deviation: observe the real existing filing action before retry.
        const confirmation = page.waitForResponse(reply => isFiling(reply.request(), f.marker));
        await keyboardActivate(page, retry);
        expect((await confirmation).ok()).toBe(true);
        await expect(form.getByTestId("time-report-submit-status")).toHaveText("Rapporterad");
        expect(attempts).toHaveLength(2);
        expect(attempts[1]).toEqual(attempts[0]);
        expect(await f.snapshot()).toEqual(durable);
        await assertPhoneFits(page);
        const refresh = page.getByRole("button", { name: "Uppdatera", exact: true });
        await expect(refresh).toBeEnabled();
        await page.keyboard.press("Escape");
        await expect(form).toHaveCount(0);
        await expect(page.getByRole("heading", { name: "Min dag", exact: true })).toBeFocused();
        expect(await f.snapshot()).toEqual(durable);
        await page.reload();
        expect(await f.snapshot()).toEqual(durable); // Reload must not refile.
      } finally { await page.unroute("**/*", handler); }
    });
  });

  test("[P0] 15.6-E03 keyboard refresh failure clears lists, retries current date and a real pull fetches changed server facts", async ({ resourcePage: page }) => {
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 360, height: 640 });
      // Configured runner is Chromium; this uses native browser touch input,
      // including feature detection before mount, rather than DOM dispatchEvent.
      const touch = await page.context().newCDPSession(page);
      await touch.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
      try {
      await signIn(page, f.fx.users.montor);
      await openDay(page);
      await expect(bookingCard(page, f.ownBooking)).toBeVisible();
      let fail = false, delayNext = false, readRequests = 0, queuedFailureHeld = false;
      let oldRequest: Request | undefined;
      const oldFetched = barrier<void>(), releaseOld = barrier<void>(), oldDelivered = barrier<void>();
      const releaseQueuedFailure = barrier<void>();
      // playwright-utils deviation: dependency absent; fault the actual read action,
      // not a guessed REST endpoint. Keep interception installed before refresh.
      const handler = async (route: Route) => {
        if (!isDayRead(route.request())) { await route.fallback(); return; }
        readRequests += 1;
        if (delayNext) {
          delayNext = false;
          oldRequest = route.request();
          try {
            const response = await route.fetch();
            expect(response.ok()).toBe(true);
            oldFetched.resolve(undefined);
            await releaseOld.promise;
            await route.fulfill({ response });
            oldDelivered.resolve(undefined);
          } catch (error) { oldFetched.reject(error); oldDelivered.reject(error); throw error; }
          return;
        }
        if (fail) {
          if (!queuedFailureHeld) { queuedFailureHeld = true; await releaseQueuedFailure.promise; }
          await route.abort("failed"); return;
        }
        await route.fallback();
      };
      await page.route("**/*", handler);
      try {
        // Next 16 serializes Server Actions, including REFRESH. Exercise its
        // actual queued order: selection changes while the older real response
        // is held, then the queued selection fails after that response arrives.
        // E09 independently covers true NAVIGATE preemption and a late response.
        delayNext = true;
        await keyboardActivate(page, page.getByRole("button", { name: "Uppdatera", exact: true }));
        await oldFetched.promise;
        fail = true;
        await page.getByLabel("Datum", { exact: true }).fill("2026-10-13");
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
        expect(readRequests).toBe(1);
        const queuedSelection = page.waitForRequest(request => isDayRead(request));
        const finishedOld = page.waitForEvent("requestfinished", request => request === oldRequest);
        releaseOld.resolve(undefined);
        await oldDelivered.promise;
        await queuedSelection;
        await finishedOld;
        // Keep the newer request pending while the older real Flight response
        // decodes and commits. A removed generation/selection guard must expose
        // its old cards here, rather than having the next failure hide the bug.
        await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        expect(queuedFailureHeld).toBe(true);
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
        await expect(agenda(page).getByRole("article")).toHaveCount(0);
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        await expect(page.getByText("Anslutning krävs", { exact: true })).toHaveCount(0);
        releaseQueuedFailure.resolve(undefined);
        await expect(page.getByText("Anslutning krävs", { exact: true })).toBeVisible();
        await expect(agenda(page).getByRole("article")).toHaveCount(0);
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
        fail = false;
        await page.getByLabel("Datum", { exact: true }).fill(REPORT_DATE);
        await expect(bookingCard(page, f.ownBooking)).toBeVisible();
        fail = true;
        await keyboardActivate(page, page.getByRole("button", { name: "Uppdatera", exact: true }));
        await expect(page.getByText("Anslutning krävs", { exact: true })).toBeVisible();
        await expect(agenda(page).getByRole("article")).toHaveCount(0);
        await expect(ownJobs(page).getByRole("link")).toHaveCount(0);
        await expect(page.getByRole("link", { name: "Öppna jobbet", exact: true })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Rapportera tid", exact: true })).toHaveCount(0);
        await expect(page.getByText("inga bokningar ännu", { exact: true })).toHaveCount(0);
        const failedSelectionRead = page.waitForRequest(request => isDayRead(request));
        await page.getByLabel("Datum", { exact: true }).fill("2026-10-13");
        await failedSelectionRead;
        await expect(page.getByText("Anslutning krävs", { exact: true })).toBeVisible();
        fail = false;
        await keyboardActivate(page, page.getByRole("button", { name: "Försök igen", exact: true }));
        await expect(bookingCard(page, f.missingBooking)).toBeVisible();
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
        await expect(page.getByText("Anslutning krävs", { exact: true })).toHaveCount(0);

        const changedDescription = `${f.marker} fresh after real pull`;
        await expect(bookingCard(page, f.missingBooking)).not.toContainText(changedDescription);
        await adminQuery("update public.bookings set description=$3 where tenant_id=$1 and id=$2",
          [f.fx.base.tenantA.id, f.missingBooking, changedDescription]);
        // MyDayWorkspace handles a downward pull over 80px from window top.
        // Its heading is a stable noninteractive start surface inside that owner;
        // the agenda can start below the phone fold after the week controls.
        // Native input, a real read and changed persisted content prove refresh.
        await page.evaluate(() => window.scrollTo(0, 0));
        const bounds = await page.getByRole("heading", { name: "Min dag", exact: true }).boundingBox();
        expect(bounds).not.toBeNull();
        const x = bounds!.x + bounds!.width / 2, y = bounds!.y + 12;
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y + 140).toBeLessThan(640);
        // playwright-utils deviation: absent package; observe the current real
        // read before the native touch gesture, with no fabricated response.
        const pulledRead = page.waitForResponse(reply => isDayRead(reply.request()));
        await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
        for (const distance of [20, 45, 80, 110, 140]) {
          await touch.send("Input.dispatchTouchEvent", {
            type: "touchMove", touchPoints: [{ x, y: y + distance, id: 1 }],
          });
        }
        await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        expect((await pulledRead).ok()).toBe(true);
        await expect(bookingCard(page, f.missingBooking)).toContainText(changedDescription);
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        const gestures: Request[] = [];
        const observeGestureRead = (request: Request) => { if (isDayRead(request)) gestures.push(request); };
        page.on("request", observeGestureRead);
        try {
          // Swiping an interactive control must neither navigate nor refresh.
          await nativeDrag(page, touch, page.getByRole("button", { name: "Uppdatera", exact: true }), -100, 0);
          await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
          expect(gestures).toHaveLength(0);
          const nextWeekRead = page.waitForResponse(reply => isDayRead(reply.request()));
          await nativeDrag(page, touch, page.getByRole("heading", { name: "Min dag", exact: true }), -100, 0);
          expect((await nextWeekRead).ok()).toBe(true);
          await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-20");
          await expect(page.getByText("inga bokningar ännu", { exact: true })).toBeVisible();
          expect(gestures).toHaveLength(1);
          const previousWeekRead = page.waitForResponse(reply => isDayRead(reply.request()));
          await nativeDrag(page, touch, page.getByRole("heading", { name: "Min dag", exact: true }), 100, 0);
          expect((await previousWeekRead).ok()).toBe(true);
          await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
          await expect(bookingCard(page, f.missingBooking)).toContainText(changedDescription);
          expect(gestures).toHaveLength(2);
        } finally { page.off("request", observeGestureRead); }
      } finally { releaseOld.resolve(undefined); releaseQueuedFailure.resolve(undefined); await page.unroute("**/*", handler); }
      } finally {
        try { await touch.send("Emulation.setTouchEmulationEnabled", { enabled: false }); }
        finally { await touch.detach(); }
      }
    });
  });

  test("[P1] 15.6-E04 successful empty agenda differs from own-jobs empty; jobless card has no invented destination", async ({ resourcePage: page }) => {
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 360, height: 640 });
      await signIn(page, f.fx.users.montor);
      await openDay(page);
      const jobless = bookingCard(page, f.jobless);
      await expect(jobless).toBeVisible();
      await expect(jobless.getByRole("link")).toHaveCount(0);
      const weekdayButtons = page.locator('[aria-label="Välj dag"]').getByRole("button");
      await expect(weekdayButtons).toHaveCount(7);
      for (const button of await weekdayButtons.all()) {
        const bounds = await button.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
      }
      expect(await page.getByRole("main").count()).toBe(1);
      await keyboardActivate(page, page.getByRole("button", { name: "Visa hela veckan", exact: true }));
      await expect(bookingCard(page, f.ownBooking)).toBeVisible();
      await expect(bookingCard(page, f.missingBooking)).toBeVisible();
      await expect(bookingCard(page, f.allDay)).toBeVisible();
      await expect(bookingCard(page, f.allDay)).toContainText("Heldag");
      await expect(bookingCard(page, f.allDay)).toContainText(/15.*okt/i);
      await keyboardActivate(page, page.getByRole("button", { name: "Visa vald dag", exact: true }));
      await expect(bookingCard(page, f.ownBooking)).toBeVisible();
      await expect(bookingCard(page, f.missingBooking)).toHaveCount(0);
      await expect(bookingCard(page, f.allDay)).toHaveCount(0);
      await assertPhoneFits(page);
      // Accessible arrow names provide the specified keyboard alternative
      // to a week swipe; the selected day must move with the displayed week.
      await keyboardActivate(page, page.getByRole("button", { name: "Nästa vecka", exact: true }));
      await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-19");
      await keyboardActivate(page, page.getByRole("button", { name: "Föregående vecka", exact: true }));
      await expect(page.getByLabel("Datum", { exact: true })).toHaveValue(REPORT_DATE);
      await expect(bookingCard(page, f.ownBooking)).toBeVisible();
      await page.getByLabel("Datum", { exact: true }).fill("2026-10-14");
      await expect(page.getByText("inga bokningar ännu", { exact: true })).toBeVisible();
      await expect(page.getByText("Anslutning krävs", { exact: true })).toHaveCount(0);
      if (jobsActive) {
        await expect(ownJobs(page)).toBeVisible();
        await expect(ownJobs(page).getByTestId(`my-day-job-${f.otherJob.id}`)).toBeVisible();
        await adminQuery("update public.job_members set archived_at=now() where tenant_id=$1 and job_id=$2 and person_profile_id=$3",
          [f.fx.base.tenantA.id, f.otherJob.id, f.fx.ownProfile.id]);
        // The first job is related by own booking assignment, so remove that
        // relationship as well before expecting a genuinely empty personal list.
        await adminQuery("delete from public.booking_assignees where tenant_id=$1 and person_profile_id=$2", [f.fx.base.tenantA.id, f.fx.ownProfile.id]);
        await keyboardActivate(page, page.getByRole("button", { name: "Uppdatera", exact: true }));
        await expect(ownJobs(page).getByRole("link")).toHaveCount(0);
        // The own-jobs empty state is distinct from the booking empty state.
        await expect(ownJobs(page).getByText("Inga tilldelade jobb", { exact: true })).toBeVisible();
        await expect(page.getByText("inga bokningar ännu", { exact: true })).toBeVisible();
      } else await expect(ownJobs(page)).toHaveCount(0);
      const selected = page.getByLabel("Datum", { exact: true });
      await expect(selected).toHaveAttribute("min", "0001-01-08");
      await expect(selected).toHaveAttribute("max", "9999-12-26");
      for (const [boundary, direction, invalid] of [
        ["0001-01-08", "Föregående vecka", "0001-01-01"],
        ["9999-12-26", "Nästa vecka", "9999-12-31"],
      ]) {
        await selected.fill(boundary);
        await expect(selected).toHaveValue(boundary);
        await expect(page.getByText("inga bokningar ännu", { exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: direction, exact: true })).toBeDisabled();
        await expect(selected).toHaveValue(boundary);
        await selected.fill(invalid);
        const dateError = page.locator("#my-day-date-error");
        await expect(dateError).toHaveAttribute("role", "alert");
        await expect(dateError).toBeVisible();
        await expect(dateError).toHaveText("Välj ett datum inom det tillgängliga intervallet.");
        await expect(selected).toHaveValue(boundary);
        await expect(page.getByRole("heading", { name: "Min dag", exact: true })).toBeVisible();
      }
      await assertPhoneFits(page);
    });
  });

  test("[P1] 15.6-E05 active jobs render own current designation and preserve identity; pending jobs contribute no UI", async ({ resourcePage: page }) => {
    await withMyDayFixture(async f => {
      await adminQuery("update public.job_members set designation='arbetsledare' where tenant_id=$1 and job_id=$2 and person_profile_id=$3",
        [f.fx.base.tenantA.id, f.otherJob.id, f.fx.ownProfile.id]);
      await adminQuery("update public.jobs set status='in_progress' where tenant_id=$1 and id=$2", [f.fx.base.tenantA.id, f.otherJob.id]);
      await signIn(page, f.fx.users.montor);
      await openDay(page);
      if (!jobsActive) {
        await expect(ownJobs(page)).toHaveCount(0);
        await expect(bookingCard(page, f.ownBooking).getByRole("link", { name: "Öppna jobbet", exact: true })).toHaveCount(0);
        // Zero jobs-query/payload proof is server/unit/integration-owned; E2E
        // must not mutate the manifest or manufacture a pending app response.
        return;
      }
      const row = ownJobs(page).getByTestId(`my-day-job-${f.otherJob.id}`);
      await expect(row).toContainText(f.otherJob.title);
      await expect(row).toContainText(f.marker);
      await expect(row).toContainText("Pågår");
      await expect(row).toContainText(/arbetsledare/i);
      await expect(ownJobs(page).getByTestId(`my-day-job-${f.job.id}`)).toContainText("Skapad");
      const link = row.getByRole("link");
      await expect(link).toHaveAttribute("href", `/jobs/${f.otherJob.id}`);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`/jobs/${f.otherJob.id}(?:\\?|$)`));
      await expect(page.getByTestId("job-workspace-header")).toContainText(f.otherJob.title);
      await adminQuery("update public.jobs set status='done' where tenant_id=$1 and id=$2", [f.fx.base.tenantA.id, f.otherJob.id]);
      await openDay(page);
      await expect(ownJobs(page).getByTestId(`my-day-job-${f.otherJob.id}`)).toHaveCount(0);
      await adminQuery("update public.jobs set status='created' where tenant_id=$1 and id=$2", [f.fx.base.tenantA.id, f.otherJob.id]);
      await adminQuery("update public.job_members set archived_at=now() where tenant_id=$1 and job_id=$2 and person_profile_id=$3",
        [f.fx.base.tenantA.id, f.otherJob.id, f.fx.ownProfile.id]);
      await openDay(page);
      await expect(ownJobs(page).getByTestId(`my-day-job-${f.otherJob.id}`)).toHaveCount(0);
    });
  });

  test("[P1] 15.6-E06 own unread booking.changed is a safe generic banner with its existing route", async ({ resourcePage: page }) => {
    await withMyDayFixture(async f => {
      // Existing recipient/category rows, with newer unrelated notices exceeding
      // a transport page: category filtering must precede the five-row page.
      await adminQuery(`insert into public.notifications(tenant_id,recipient_user_id,category,title,body,route,logical_subject_id,created_at)
        select $1,$2,'quote.follow_up_due','Unrelated notice',$3,'/quotes',gen_random_uuid(),
          '2026-10-13T09:00:00Z'::timestamptz + i * interval '1 second'
        from generate_series(1,101) i`, [f.fx.base.tenantA.id, f.fx.users.montor.id, `${f.marker} unrelated category`]);
      const bookingBodies = Array.from({ length: 6 }, (_, index) => index === 5
        ? "En bokning i din planering har ändrats." : `En bokning i din planering har ändrats. Meddelande ${index}.`);
      for (const [index, body] of bookingBodies.entries()) await adminQuery(`insert into public.notifications(tenant_id,recipient_user_id,category,title,body,route,logical_subject_id,created_at)
        values($1,$2,'booking.changed','Planeringen har ändrats',$3,'/scheduling',$4,$5)`,
        [f.fx.base.tenantA.id, f.fx.users.montor.id, body, randomUUID(), `2026-10-12T09:0${index}:00Z`]);
      // Peer/read notices cannot occupy or contribute to either visible page.
      for (const [recipient, readAt, body] of [
        [f.fx.users.projektledare.id, null, `${f.marker} peer private notice`],
        [f.fx.users.montor.id, "2026-10-12T09:00:00Z", `${f.marker} already read`],
      ] as const) await adminQuery(`insert into public.notifications(tenant_id,recipient_user_id,category,title,body,route,logical_subject_id,read_at)
        values($1,$2,'booking.changed','Planeringen har ändrats',$3,'/scheduling',$4,$5)`,
      [f.fx.base.tenantA.id, recipient, body, randomUUID(), readAt]);
      await signIn(page, f.fx.users.montor);
      await openDay(page);
      const banner = notices(page);
      await expect(banner).toBeVisible();
      await expect(banner).toContainText("Planeringen har ändrats");
      await expect(banner).toContainText("En bokning i din planering har ändrats.");
      await expect(banner).not.toContainText(`${f.marker} peer private notice`);
      await expect(banner).not.toContainText(`${f.marker} already read`);
      await expect(banner).not.toContainText(/flyttad.*(?:idag|imorgon)|bokning.*2026-10-12/i);
      await expect(banner.getByRole("link")).toHaveCount(5);
      expect(await banner.getByRole("link").evaluateAll(links => links.map(link => link.getAttribute("href")))).toEqual(Array(5).fill("/scheduling"));
      expect(await banner.getByRole("link").evaluateAll(links => links.map(link => link.getAttribute("href")))).not.toContain(`/scheduling/${f.ownBooking}`);
      await expect(banner).not.toContainText(`${f.marker} unrelated category`);
      await expect(banner.getByText(bookingBodies[0], { exact: true })).toHaveCount(0);
      const continuation = page.waitForResponse(reply => isDayRead(reply.request()) && (reply.request().postData() ?? "").includes('"noticePage":2'));
      await keyboardActivate(page, banner.getByRole("button", { name: "Visa fler ändringar", exact: true }));
      expect((await continuation).ok()).toBe(true);
      await expect(banner.getByText(bookingBodies[0], { exact: true })).toBeVisible();
      await expect(banner.getByRole("link")).toHaveCount(1);
      await expect(banner.getByRole("link")).toHaveAttribute("href", "/scheduling");
      await expect(banner.getByRole("link")).not.toHaveAttribute("href", new RegExp(f.ownBooking));
      await expect(banner.getByRole("button", { name: "Visa fler ändringar", exact: true })).toHaveCount(0);
      await expect(banner).not.toContainText(`${f.marker} peer private notice`);
      await expect(banner).not.toContainText(`${f.marker} already read`);
      await expect(banner).not.toContainText(`${f.marker} unrelated category`);
      await keyboardActivate(page, banner.getByRole("button", { name: "Föregående ändringar", exact: true }));
      await expect(banner.getByText(bookingBodies[5], { exact: true })).toBeVisible();
      await keyboardActivate(page, page.getByRole("button", { name: "Uppdatera", exact: true }));
      await expect(banner.getByText("En bokning i din planering har ändrats.", { exact: true })).toHaveCount(1);
    });
  });

  test("[P0] 15.6-E07 direct route requires login/current booking entitlement and office landing remains stable", async ({ resourcePage: page }) => {
    await withMyDayFixture(async f => {
      await page.context().clearCookies();
      await page.goto("/my-day");
      await expect(page).toHaveURL(/\/login(?:\?|$)/);
      await expect(agenda(page)).toHaveCount(0);
      await signIn(page, f.fx.users.saljare); // Existing role lacks Bookings.View.
      await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
      await page.goto("/my-day");
      await expect(page.getByText(TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED, { exact: true })).toBeVisible();
      await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Min dag", exact: true })).toHaveCount(0);
      await signIn(page, f.fx.roleUnionUser); // Current PL + salesperson office union.
      await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
      await signIn(page, f.fx.users.montor);
      await openDay(page);
      await expect(bookingCard(page, f.ownBooking)).toBeVisible();
      await adminQuery("update public.tenant_memberships set status='disabled' where tenant_id=$1 and id=$2",
        [f.fx.base.tenantA.id, f.fx.ownProfile.membershipId]);
      try {
        await page.reload();
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Rapportera tid", exact: true })).toHaveCount(0);
        await expect(page.getByText("inga bokningar ännu", { exact: true })).toHaveCount(0);
        await expect(page.getByText(TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED, { exact: true })).toBeVisible();
      } finally {
        await adminQuery("update public.tenant_memberships set status='active' where tenant_id=$1 and id=$2",
          [f.fx.base.tenantA.id, f.fx.ownProfile.membershipId]);
      }
    });
  });

  test("[P0] 15.6-E08 manager's Min dag is still own-person and excludes other assignees' cards/actions", async ({ resourcePage: page }) => {
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await signIn(page, f.fx.users.projektledare);
      await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
      await openDay(page);
      await expect(bookingCard(page, f.peerBooking)).toBeVisible();
      await expect(bookingCard(page, f.shared)).toHaveCount(1);
      await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
      await expect(bookingCard(page, f.jobless)).toHaveCount(0);
      await expect(bookingCard(page, f.missingBooking)).toHaveCount(0);
      await expect(agenda(page).getByRole("article")).toHaveCount(2);
      await expect(page.getByRole("combobox", { name: "Person", exact: true })).toHaveCount(0);
      await expect(agenda(page)).not.toContainText(/(?:pris|kostnad|marginal|timpris|offertnummer)/i);
      await assertPhoneFits(page);
    });
  });

  test("[P0] 15.6-E09 a real tenant-switch RSC navigation discards the prior report owner and ignores its late read", async ({ resourcePage: page }) => {
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 1280, height: 800 });
      const tenantB = f.fx.base.tenantB.id, membershipB = randomUUID(), profileB = randomUUID(), bookingB = randomUUID();
      const markerB = `my-day-current-context-${randomUUID()}`;
      const dateB = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(new Date());
      const oldFetched = barrier<void>(), releaseOld = barrier<void>(), oldDelivered = barrier<void>();
      let armed = false, held = false;
      let heldRequest: Request | undefined;
      type HeldTerminal = { event: "finished" | "failed"; phase: "before-release" | "after-release";
        category: "none" | "aborted" | "content-length" | "decoding" | "connection" | "other" };
      const oldTerminal = barrier<HeldTerminal>();
      let terminalEvent: HeldTerminal["event"] | "pending" = "pending";
      let oldReleased = false;
      const failureCategory = (request: Request): HeldTerminal["category"] => {
        switch (request.failure()?.errorText) {
          case "net::ERR_ABORTED": return "aborted";
          case "net::ERR_CONTENT_LENGTH_MISMATCH": return "content-length";
          case "net::ERR_CONTENT_DECODING_FAILED": return "decoding";
          case "net::ERR_CONNECTION_ABORTED":
          case "net::ERR_CONNECTION_CLOSED":
          case "net::ERR_CONNECTION_FAILED":
          case "net::ERR_CONNECTION_REFUSED":
          case "net::ERR_CONNECTION_RESET": return "connection";
          default: return "other";
        }
      };
      const observeTerminal = (request: Request, event: HeldTerminal["event"]) => {
        if (request !== heldRequest || terminalEvent !== "pending") return;
        terminalEvent = event;
        const record: HeldTerminal = { event, phase: oldReleased ? "after-release" : "before-release",
          category: event === "finished" ? "none" : failureCategory(request) };
        test.info().annotations.push({ type: "my-day-held-read-terminal", description: JSON.stringify(record) });
        oldTerminal.resolve(record);
      };
      const onFinished = (request: Request) => observeTerminal(request, "finished");
      const onFailed = (request: Request) => observeTerminal(request, "failed");
      const attempts: FilingAttempt[] = [];
      const before = await f.snapshot();
      const handler = async (route: Route) => {
        const request = route.request();
        if (isFiling(request, f.marker)) {
          attempts.push(filingAttempt(request));
          await route.fallback(); return;
        }
        if (!armed || held || !isDayRead(request)) { await route.fallback(); return; }
        held = true; heldRequest = request;
        // Observe this exact request before navigation can settle or cancel it.
        // Retain only lifecycle enums, never request data or raw failure text.
        page.on("requestfinished", onFinished);
        page.on("requestfailed", onFailed);
        try {
          // Only delay an actual completed A projection; do not fabricate the
          // response or keep a server transaction/command in flight.
          const response = await route.fetch();
          expect(response.ok()).toBe(true);
          expect(await response.text()).toContain(f.ownBooking);
          const responseHeaders = response.headers();
          const contentLength = responseHeaders["content-length"];
          const contentEncoding = responseHeaders["content-encoding"]?.trim().toLowerCase();
          const fulfillmentBody = await response.body();
          const lengthMatch = contentLength !== undefined && /^[0-9]{1,20}$/.test(contentLength)
            ? BigInt(contentLength) === BigInt(fulfillmentBody.length) ? "matches" : "differs" : "unknown";
          const encoding = contentEncoding === undefined || contentEncoding === "identity" ? "identity"
            : contentEncoding === "gzip" || contentEncoding === "br" || contentEncoding === "deflate" ? contentEncoding : "other";
          test.info().annotations.push({ type: "my-day-held-read-framing", description: JSON.stringify({
            hasContentLength: contentLength !== undefined, contentLengthMatchesBody: lengthMatch, retainedContentEncoding: encoding,
          }) });
          oldFetched.resolve(undefined);
          await releaseOld.promise;
          await route.fulfill({ response });
          oldDelivered.resolve(undefined);
        } catch (error) { oldFetched.reject(error); oldDelivered.reject(error); throw error; }
      };
      try {
        // Deterministic current authority: A is older until explicitly revoked.
        // Both tenants and every row here belong to this factory invocation.
        await adminQuery(`insert into public.tenant_memberships(id,tenant_id,user_id,role,status,created_at)
          select $1,$2,$3,'montor','active',created_at + interval '1 day'
          from public.tenant_memberships where tenant_id=$4 and id=$5`,
          [membershipB, tenantB, f.fx.users.montor.id, f.fx.base.tenantA.id, f.fx.ownProfile.membershipId]);
        await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id) values($1,$2,$3)", [profileB, tenantB, membershipB]);
        await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,create_command_id,create_payload_digest,create_result)
          values($1,$2,$3,$4,$5,$6,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))`,
          [bookingB, tenantB, `${dateB}T06:00:00Z`, `${dateB}T07:00:00Z`, markerB, randomUUID()]);
        await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)", [tenantB, bookingB, profileB]);
        await signIn(page, f.fx.users.montor);
        await openDay(page);
        await expect(bookingCard(page, f.ownBooking)).toBeVisible();
        await expect(bookingCard(page, bookingB)).toHaveCount(0);
        const reportBooking = jobsActive ? f.ownBooking : f.jobless;
        await bookingCard(page, reportBooking).getByRole("button", { name: "Rapportera tid", exact: true }).click();
        const form = filingDialog(page);
        await form.getByLabel("Anteckning", { exact: true }).fill(f.marker);
        await page.route("**/*", handler);
        armed = true;
        await keyboardActivate(page, form.getByRole("button", { name: "Rapportera tid", exact: true }));
        await oldFetched.promise; // onSaved's A read completed, its browser response is held.
        await expect(form.getByTestId("time-report-submit-status")).toHaveText("Rapporterad");
        const durable = await f.snapshot();
        const rows = durable.reports.filter(row => row.note === f.marker);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({ tenant_id: f.fx.base.tenantA.id, user_id: f.fx.users.montor.id,
          booking_id: reportBooking, job_id: jobsActive ? f.job.id : null, status: "submitted" });
        expect(durable.reports.length - before.reports.length).toBe(1);
        expect(durable.audit.filter(row => row.target_id === rows[0].id)).toHaveLength(1);
        await page.keyboard.press("Escape");
        await expect(form).toHaveCount(0);
        await adminQuery("update public.tenant_memberships set status='disabled' where tenant_id=$1 and id=$2",
          [f.fx.base.tenantA.id, f.fx.ownProfile.membershipId]);
        // Next 16 queues ACTION_REFRESH behind Server Actions. Its existing
        // ACTION_NAVIGATE path preempts them, so the actual Min dag link provides
        // a real overlapping B RSC update without a private router/test endpoint.
        // Installed Next app-router-state.js special-cases exact same-page links:
        // render-tree.js refetches their dynamic page leaf instead of retaining
        // its prior render tree. This route is force-dynamic; static prefetch reuse
        // cannot satisfy the required observed GET and current B booking below.
        const nextContext = page.waitForResponse(reply => reply.request().method() === "GET"
          && new URL(reply.url()).pathname === "/my-day" && reply.request().headers()["rsc"] === "1");
        await page.getByRole("link", { name: "Min dag", exact: true }).filter({ visible: true }).click();
        expect((await nextContext).ok()).toBe(true);
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue(dateB);
        await expect(bookingCard(page, bookingB)).toContainText(markerB);
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        await expect(form).toHaveCount(0);
        oldReleased = true;
        releaseOld.resolve(undefined);
        await oldDelivered.promise;
        await expect.poll(() => terminalEvent, { message: "Held A read must reach a terminal transport event" }).not.toBe("pending");
        const terminal = await oldTerminal.promise;
        // Allow the real Flight decode and React commit to settle after the
        // transport settles; retain isolation evidence even if transport failed.
        await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        await expect(bookingCard(page, bookingB)).toContainText(markerB);
        await expect(agenda(page).getByRole("article")).toHaveCount(1);
        for (const id of [f.ownBooking, f.shared, f.jobless, f.missingBooking, f.allDay]) await expect(bookingCard(page, id)).toHaveCount(0);
        await expect(ownJobs(page).getByRole("link")).toHaveCount(0);
        await expect(form).toHaveCount(0);
        await expect(page.getByTestId(`time-report-entry-${reportBooking}`)).toHaveCount(0);
        expect(attempts).toHaveLength(1);
        expect(await f.snapshot()).toEqual(durable);
        expect(terminal, "Only a completed transport after release proves a delivered late response").toEqual({ event: "finished", phase: "after-release", category: "none" });
      } finally {
        page.off("requestfinished", onFinished);
        page.off("requestfailed", onFailed);
        releaseOld.resolve(undefined);
        try { await page.unroute("**/*", handler); }
        finally {
          await adminQuery("update public.tenant_memberships set status='active' where tenant_id=$1 and id=$2", [f.fx.base.tenantA.id, f.fx.ownProfile.membershipId]);
          await adminQuery("delete from public.booking_assignees where tenant_id=$1 and booking_id=$2", [tenantB, bookingB]);
          await adminQuery("delete from public.bookings where tenant_id=$1 and id=$2", [tenantB, bookingB]);
          await adminQuery("delete from public.person_profiles where tenant_id=$1 and id=$2", [tenantB, profileB]);
          await adminQuery("delete from public.membership_roles where tenant_id=$1 and membership_id=$2", [tenantB, membershipB]);
          await adminQuery("delete from public.tenant_memberships where tenant_id=$1 and id=$2", [tenantB, membershipB]);
        }
      }
    });
  });
});
