/** Essential configured-production browser acceptance. All successful persistence
 * is verified by physical owned report/audit readbacks. Transport faults never
 * fabricate success. Native Playwright follows existing resourcePage conventions.
 * This source is runnable coverage; no browser/DB result is claimed by authoring it.
 */
import { test, expect } from "./support/resource-cdp-attachment";
import {
  REPORT_DATE, filingDialog, hydrated, isFilingRequest, openStandalone, openWeek,
  signIn, withTimeReportBrowserFixture, failThenLoseCommittedResponse, seedReviewReports,
} from "./support/time-reports-atdd";
import { fileReport, reportInput } from "../support/time-reports-atdd";
import { adminQuery } from "../factories/admin-sql";

test.describe("15.4 essential production-host time reporting", () => {
  test("[P0] 15.4-E2E-001 own booking editable prefill → filed report → persisted own week", async ({ resourcePage: page }) => {
    await withTimeReportBrowserFixture(async (f) => {
      // Concrete peer booking exists. A normal own-only JWT must fail filing it,
      // independently of the absence of its card/action from the personal UI.
      const beforeDenied = await f.snapshot();
      const denied = await fileReport(f.fx.montorClient, reportInput({ bookingId: f.peerBooking,
        jobId: f.job.id, note: `${f.marker} denied peer` }));
      expect(denied).toMatchObject({ ok: false, code: "TENANT_ACCESS_DENIED" });
      expect(await f.snapshot()).toEqual(beforeDenied);

      await signIn(page, f.fx.users.montor);
      await page.goto("/scheduling");
      const date = page.getByLabel("Datum", { exact: true });
      await hydrated(date);
      await date.fill(REPORT_DATE);
      await page.getByLabel("Period", { exact: true }).selectOption("week");
      const card = page.getByTestId(`scheduling-booking-${f.ownBooking}`);
      await expect(card).toBeVisible();
      await expect(page.getByTestId(`scheduling-booking-${f.peerBooking}`)).toHaveCount(0);
      const capture = card.getByRole("button", { name: "Rapportera tid", exact: true });
      await capture.click();
      const form = filingDialog(page);
      await expect(form.getByLabel("Datum", { exact: true })).toHaveValue(REPORT_DATE);
      await expect(form.getByLabel("Start", { exact: true })).toHaveValue("2026-10-12T08:00");
      await expect(form.getByLabel("Slut", { exact: true })).toHaveValue("2026-10-12T10:00");
      await expect(form.getByLabel("Jobb", { exact: true })).toHaveValue(f.job.id);
      await expect(form.getByText("Osänd", { exact: true })).toBeVisible();
      await form.getByLabel("Slut", { exact: true }).fill("2026-10-12T11:00");
      await form.getByLabel("Anteckning", { exact: true }).fill(f.marker);
      const before = await f.snapshot();
      // playwright-utils deviation: installed package gate is false. Observe the
      // actual proposed Next action before clicking; transport alone is not success.
      const saved = page.waitForResponse((reply) => isFilingRequest(reply.request(), f.marker));
      await form.getByRole("button", { name: "Rapportera tid", exact: true }).click();
      expect((await saved).ok()).toBe(true);
      await expect(page.getByTestId("time-report-submit-status")).toHaveText("Rapporterad");
      const durable = await f.snapshot();
      const rows = durable.reports.filter((row) => row.note === f.marker);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ tenant_id: f.fx.base.tenantA.id,
        user_id: f.fx.users.montor.id, report_date: REPORT_DATE, duration_minutes: 180,
        status: "submitted", booking_id: f.ownBooking, job_id: f.job.id,
        booked_minutes_at_filing: 120 });
      expect(durable.reports.length - before.reports.length).toBe(1);
      const audits = durable.audit.filter((row) => row.target_id === rows[0].id);
      expect(audits).toHaveLength(1);
      expect(audits[0]).toMatchObject({ tenant_id: f.fx.base.tenantA.id, actor_user_id: f.fx.users.montor.id });
      expect(durable.audit.length - before.audit.length).toBe(1);
      const week = await openWeek(page);
      await expect(week.getByTestId(`time-report-row-${rows[0].id}`)).toContainText("3 h");
      await expect(week.getByTestId(`time-report-row-${rows[0].id}`)).toContainText(f.job.title);
      await expect(week.getByTestId("time-report-week-total")).toHaveText("3 h");
      await expect(week.getByTestId("time-report-missing-2026-10-13")).toBeVisible();
      await expect(page.getByLabel("Person", { exact: true })).toHaveCount(0);
      await page.reload();
      const reloaded = await openWeek(page);
      await expect(reloaded.getByTestId(`time-report-row-${rows[0].id}`)).toContainText(f.marker);
      expect(await f.snapshot()).toEqual(durable);
    });
  });

  test("[P0] 15.4-E2E-002 no-profile standalone at 360×640 keeps unsent input through failure/lost commit and keyboard same-attempt retry", async ({ resourcePage: page }) => {
    await withTimeReportBrowserFixture(async (f) => {
      await page.setViewportSize({ width: 360, height: 640 });
      // Register real failure interception BEFORE navigation; never fabricate a 2xx.
      const fault = await failThenLoseCommittedResponse(page, f, f.marker);
      try {
        await signIn(page, f.noProfile);
        const form = await openStandalone(page);
        await form.getByLabel("Datum", { exact: true }).fill(REPORT_DATE);
        await form.getByLabel("Timmar", { exact: true }).fill("1,25");
        await form.getByLabel("Anteckning", { exact: true }).fill(f.marker);
        await expect(form.getByLabel("Jobb", { exact: true })).toHaveValue("");
        await expect(form.getByText("Osänd", { exact: true })).toBeVisible();
        const submit = form.getByRole("button", { name: "Rapportera tid", exact: true });
        const size = await submit.boundingBox();
        expect(size).not.toBeNull();
        expect(size!.height).toBeGreaterThanOrEqual(48);
        await submit.focus();
        await expect(submit).toBeFocused();
        await page.keyboard.press("Enter");
        await fault.failed;
        await expect(form.getByLabel("Timmar", { exact: true })).toHaveValue("1,25");
        await expect(form.getByLabel("Anteckning", { exact: true })).toHaveValue(f.marker);
        await expect(form.getByText("Osänd", { exact: true })).toBeVisible();
        await expect(page.getByTestId("time-report-submit-status")).toHaveCount(0);
        const retry = form.getByRole("button", { name: "Försök igen med samma försök", exact: true });
        await expect(retry).toBeVisible();
        await retry.focus();
        await expect(retry).toBeFocused();
        await page.keyboard.press("Enter");
        const committed = await fault.committed; // SQL proves commit before response was aborted.
        expect(fault.attempts).toHaveLength(2);
        expect(fault.attempts[1]).toEqual(fault.attempts[0]);
        await expect(form.getByText("Osänd", { exact: true })).toBeVisible();
        await expect(page.getByTestId("time-report-submit-status")).toHaveCount(0);
        await expect(form.getByLabel("Anteckning", { exact: true })).toHaveValue(f.marker);
        // An unknown committed outcome must reconcile the frozen attempt before
        // editing. This is in-memory connected retry, with no automatic resending.
        await expect(form.getByLabel("Timmar", { exact: true })).toBeDisabled();
        await expect(retry).toBeEnabled();
        const confirmed = page.waitForResponse((reply) => isFilingRequest(reply.request(), f.marker));
        await retry.focus();
        await page.keyboard.press("Enter");
        expect((await confirmed).ok()).toBe(true);
        await expect(page.getByTestId("time-report-submit-status")).toHaveText("Rapporterad");
        expect(fault.attempts).toHaveLength(3);
        expect(fault.attempts[2]).toEqual(fault.attempts[0]);
        expect(await f.snapshot()).toEqual(committed); // Exactly one row AND one audit.
        await page.reload();
        const week = await openWeek(page);
        const row = committed.reports.find((report) => report.note === f.marker)!;
        await expect(week.getByTestId(`time-report-row-${row.id}`)).toContainText(f.marker);
        await expect(week.getByTestId("time-report-week-total")).toHaveText("1 h 15 min");
        expect(await f.snapshot()).toEqual(committed);
        expect(await adminQuery(`select p.id from public.person_profiles p join public.tenant_memberships m
          on m.id=p.membership_id where m.user_id=$1 and m.tenant_id=$2`,
        [f.noProfile.id, f.fx.base.tenantA.id])).toEqual([]);
      } finally { await fault.dispose(); }
    });
  });

  test("[P1] 15.4-E2E-003 PL/Admin complete person/job/week review totals and attributed annotation survive reload", async ({ resourcePage: page }) => {
    await withTimeReportBrowserFixture(async (f) => {
      const ids = await seedReviewReports(f);
      const initial = await f.snapshot();
      expect(initial.reports).toHaveLength(7); // Five current tenant/week rows plus two excluded controls.
      await signIn(page, f.fx.users.projektledare);
      await page.goto("/time-reports");
      const reviewTab = page.getByRole("tab", { name: "Granska", exact: true });
      await hydrated(reviewTab);
      await reviewTab.click();
      await page.getByLabel("Vecka", { exact: true }).fill(REPORT_DATE);
      const review = page.getByRole("region", { name: "Granska tidrapporter", exact: true });
      await expect(review.getByTestId("time-report-review-total")).toHaveText("6 h 45 min");
      for (const id of [ids.own, ids.ownUnlinked, ids.ownOtherJob, ids.peer, ids.peerUnlinked]) {
        await expect(review.getByTestId(`time-report-row-${id}`)).toBeVisible();
      }
      for (const id of [ids.otherWeek, ids.foreign]) await expect(review.getByTestId(`time-report-row-${id}`)).toHaveCount(0);
      await expect(review.getByTestId(`time-report-person-total-${f.fx.users.montor.id}`)).toHaveText("4 h 45 min");
      await expect(review.getByTestId(`time-report-person-total-${f.fx.users.projektledare.id}`)).toHaveText("2 h");
      await expect(review.getByTestId(`time-report-job-total-${f.job.id}`)).toHaveText("4 h 30 min");
      await expect(review.getByTestId(`time-report-job-total-${f.otherJob.id}`)).toHaveText("1 h");
      await expect(review.getByTestId("time-report-unlinked-total")).toHaveText("1 h 15 min");
      await page.getByLabel("Person", { exact: true }).selectOption(f.fx.users.montor.id);
      await expect(review.getByTestId("time-report-review-total")).toHaveText("4 h 45 min");
      await expect(review.getByTestId(`time-report-row-${ids.peer}`)).toHaveCount(0);
      await page.getByLabel("Jobb", { exact: true }).selectOption(f.job.id);
      await expect(review.getByTestId("time-report-review-total")).toHaveText("3 h");
      await page.getByLabel("Person", { exact: true }).selectOption("");
      await expect(review.getByTestId("time-report-review-total")).toHaveText("4 h 30 min");
      await page.getByLabel("Jobb", { exact: true }).selectOption("");
      await expect(review.getByTestId("time-report-review-total")).toHaveText("6 h 45 min");
      await page.getByLabel("Vecka", { exact: true }).fill("2026-10-19");
      await expect(review.getByTestId("time-report-review-total")).toHaveText("11 h");
      await expect(review.getByTestId(`time-report-row-${ids.otherWeek}`)).toBeVisible();
      await page.getByLabel("Vecka", { exact: true }).fill(REPORT_DATE);
      await review.getByTestId(`time-report-row-${ids.own}`).getByRole("button", { name: "Granska", exact: true }).click();
      const sheet = page.getByRole("dialog", { name: "Granska tidrapport", exact: true });
      await expect(sheet.getByText("Bokad tid vid rapportering", { exact: true })).toBeVisible();
      await expect(sheet.getByTestId("time-report-booked-at-filing")).toHaveText("2 h");
      await expect(sheet.getByTestId("time-report-booked-delta")).toHaveText("+1 h");
      await sheet.getByLabel("Granskningsanteckning", { exact: true }).fill(`${f.marker} reviewed`);
      const annotationSaved = page.waitForResponse((reply) => isFilingRequest(reply.request(), `${f.marker} reviewed`));
      await sheet.getByRole("button", { name: "Spara anteckning", exact: true }).click();
      expect((await annotationSaved).ok()).toBe(true);
      await expect(page.getByTestId("time-report-review-status")).toHaveText("Anteckningen är sparad.");
      const annotated = await f.snapshot();
      const before = initial.reports.find((row) => row.id === ids.own)!;
      const after = annotated.reports.find((row) => row.id === ids.own)!;
      const core = (row: typeof before) => Object.fromEntries(Object.entries(row).filter(([field]) =>
        !["review_note","reviewed_by","reviewed_at","review_revision"].includes(field)));
      const coreBefore = core(before), coreAfter = core(after);
      expect(coreAfter).toEqual(coreBefore);
      expect(after).toMatchObject({ status: "submitted", review_note: `${f.marker} reviewed`,
        reviewed_by: f.fx.users.projektledare.id, review_revision: before.review_revision + 1 });
      expect(Number.isFinite(Date.parse(after.reviewed_at!))).toBe(true);
      expect(annotated.reports.filter((row) => row.id !== ids.own)).toEqual(initial.reports.filter((row) => row.id !== ids.own));
      const newAudit = annotated.audit.filter((row) => !initial.audit.some((prior) => prior.id === row.id));
      expect(newAudit).toHaveLength(1);
      expect(newAudit[0]).toMatchObject({ target_id: ids.own, actor_user_id: f.fx.users.projektledare.id });
      await page.reload();
      await page.getByRole("tab", { name: "Granska", exact: true }).click();
      await page.getByLabel("Vecka", { exact: true }).fill(REPORT_DATE);
      await review.getByTestId(`time-report-row-${ids.own}`).getByRole("button", { name: "Granska", exact: true }).click();
      await expect(sheet.getByLabel("Granskningsanteckning", { exact: true })).toHaveValue(`${f.marker} reviewed`);
      await expect(sheet.getByTestId("time-report-review-attribution")).toContainText(/granskad|antecknad/i);
      await sheet.getByRole("button", { name: "Stäng", exact: true }).click();
      await review.getByTestId(`time-report-row-${ids.ownUnlinked}`).getByRole("button", { name: "Granska", exact: true }).click();
      await expect(sheet.getByTestId("time-report-booked-at-filing")).toHaveCount(0);
      await expect(sheet.getByTestId("time-report-booked-delta")).toHaveCount(0);
      expect(await f.snapshot()).toEqual(annotated);
      // Admin also has review, while a reviewer's view of another person's booking
      // still cannot create an on-behalf report. Prove refusal with physical state.
      await signIn(page, f.fx.base.adminA);
      await page.goto("/time-reports");
      await page.getByRole("tab", { name: "Granska", exact: true }).click();
      await page.getByLabel("Vecka", { exact: true }).fill(REPORT_DATE);
      await expect(review.getByTestId("time-report-review-total")).toHaveText("6 h 45 min");
      const denied = await fileReport(f.fx.adminClient, reportInput({ bookingId: f.ownBooking,
        jobId: f.job.id, note: `${f.marker} denied manager on behalf` }));
      expect(denied).toMatchObject({ ok: false, code: "TENANT_ACCESS_DENIED" });
      expect(await f.snapshot()).toEqual(annotated);
      await signIn(page, f.fx.users.montor);
      const ownWeek = await openWeek(page);
      await expect(ownWeek.getByTestId("time-report-week-total")).toHaveText("4 h 45 min");
      for (const id of [ids.peer, ids.peerUnlinked, ids.foreign]) {
        await expect(page.getByTestId(`time-report-row-${id}`)).toHaveCount(0);
      }
      await expect(page.getByLabel("Person", { exact: true })).toHaveCount(0);
      expect(await f.snapshot()).toEqual(annotated);
    });
  });
});
